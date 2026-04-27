import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAstrologyData } from '@/utils/astroMath';

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
        }

        const text = await file.text();
        const rows = text.split('\n').map(row => row.trim()).filter(row => row.length > 0);
        
        if (rows.length < 2) {
             return NextResponse.json({ success: false, error: "CSV must contain headers and at least one row" }, { status: 400 });
        }

        // Simplistic CSV parse (assuming no commas in fields for this basic version)
        // Strip BOM (\uFEFF) and any carriage returns or quotes
        const headers = rows[0].split(',').map(h => h.replace(/^\uFEFF/, '').replace(/["'\r]/g, '').trim().toLowerCase());
        
        const expectedHeadersConfig = [
            { key: 'full_name', aliases: ['full_name', 'name'] },
            { key: 'gender', aliases: ['gender'] },
            { key: 'date_of_birth', aliases: ['date_of_birth', 'dob'] },
            { key: 'time_of_birth', aliases: ['time_of_birth', 'tob'] },
            { key: 'place_of_birth_city', aliases: ['place_of_birth_city', 'city', 'place'] },
            { key: 'latitude', aliases: ['latitude', 'lat', 'place_of_birth_lat'] },
            { key: 'longitude', aliases: ['longitude', 'lng', 'place_of_birth_lng'] }
        ];

        const optionalHeadersConfig = [
            { key: 'work', aliases: ['work'] },
            { key: 'case', aliases: ['case'] },
            { key: 'region', aliases: ['region'] },
            { key: 'district', aliases: ['district'] },
            { key: 'salary', aliases: ['salary'] },
            { key: 'other_country', aliases: ['other_country'] },
            { key: 'dowry', aliases: ['dowry'] },
            { key: 'business', aliases: ['business'] },
            { key: 'photo', aliases: ['photo'] },
            { key: 'no_case', aliases: ['no_case', 'nocase'] },
            { key: 'is_widow', aliases: ['is_widow', 'widow', 'widower'] },
            { key: 'no_dob', aliases: ['no_dob', 'nodob', 'no_date_of_birth'] },
            { key: 'no_parent', aliases: ['no_parent', 'noparent'] },
            { key: 'siblings_count', aliases: ['siblings_count', 'siblings', 'brother_sister_count'] },
            { key: 'siblings_details', aliases: ['siblings_details', 'brother_sister_details'] }
        ];

        const missingKeys = [];
        const headerMap: Record<string, string> = {};

        for (const config of expectedHeadersConfig) {
            const foundHeader = headers.find(h => config.aliases.includes(h));
            if (foundHeader) {
                headerMap[config.key] = foundHeader;
            } else {
                missingKeys.push(config.key);
            }
        }

        // Map optional headers if present
        for (const config of optionalHeadersConfig) {
            const foundHeader = headers.find(h => config.aliases.includes(h));
            if (foundHeader) {
                headerMap[config.key] = foundHeader;
            }
        }
        
        if (missingKeys.length > 0) {
             return NextResponse.json({ 
                 success: false, 
                 error: `CSV missing required headers: ${missingKeys.join(', ')}. Found headers: ${headers.join(', ')}` 
             }, { status: 400 });
        }

        const parsedData = rows.slice(1).map(row => {
            const values = row.split(',').map(v => v.replace(/[\r\n]/g, '').trim());
            const obj: Record<string, string> = {};
            for (const config of expectedHeadersConfig) {
                const actualHeader = headerMap[config.key];
                const idx = headers.indexOf(actualHeader);
                if (idx !== -1) obj[config.key] = values[idx];
            }
            for (const config of optionalHeadersConfig) {
                const actualHeader = headerMap[config.key];
                if (actualHeader) {
                    const idx = headers.indexOf(actualHeader);
                    if (idx !== -1) obj[config.key] = values[idx];
                }
            }
            return obj;
        });

        const supabase = await createClient();
        const recordsToInsert = [];

        for (const record of parsedData) {
            try {
                const no_dob = record.no_dob === 'true' || record.no_dob === '1' || record.no_dob === 'Yes';
                
                let astroData: any = null;
                let nakshatraName = null;
                let pada = null;
                let age = null;
                let rasi = null;
                let lagnam = null;

                if (!no_dob && record.date_of_birth && record.time_of_birth && record.latitude && record.longitude) {
                    // Ensure date format is correct. Expected format from input: YYYY-MM-DD
                    let parsedDate = record.date_of_birth;
                    if (parsedDate && parsedDate.includes('/')) {
                        const [dd, mm, yyyy] = parsedDate.split('/');
                        parsedDate = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
                    }
                    
                    let timeStr = record.time_of_birth;
                    // If time is HH:MM, append :00. If already HH:MM:SS, leave it.
                    if (timeStr && timeStr.split(':').length === 2) {
                        timeStr = `${timeStr}:00`;
                    }
                    
                    const isoString = `${parsedDate}T${timeStr}+05:30`;
                    const lat = parseFloat(record.latitude);
                    const lng = parseFloat(record.longitude);

                    if (!isNaN(lat) && !isNaN(lng)) {
                        astroData = getAstrologyData(isoString, lat, lng);
                        
                        // Parse Nakshatram and Pada from result
                        const nakshatraStr = astroData.panchangam.nakshatram;
                        const pIndex = nakshatraStr.lastIndexOf('p');
                        nakshatraName = nakshatraStr;
                        pada = 1;
                        if (pIndex > -1) {
                            nakshatraName = nakshatraStr.substring(0, pIndex).trim();
                            pada = parseInt(nakshatraStr.substring(pIndex + 1));
                        }
                        rasi = astroData.panchangam.rasi;
                        lagnam = astroData.panchangam.lagnam;

                        const birthDateObj = new Date(parsedDate);
                        const today = new Date();
                        age = today.getFullYear() - birthDateObj.getFullYear();
                        const mMonth = today.getMonth() - birthDateObj.getMonth();
                        if (mMonth < 0 || (mMonth === 0 && today.getDate() < birthDateObj.getDate())) {
                            age--;
                        }
                    }
                }

                recordsToInsert.push({
                    full_name: record.full_name,
                    gender: record.gender,
                    birth_date: parsedDate,
                    birth_time: record.time_of_birth,
                    birth_place: record.place_of_birth_city,
                    latitude: lat,
                    longitude: lng,
                    rasi: astroData.panchangam.rasi,
                    nakshatram: nakshatraName,
                    nakshatra_pada: pada,
                    lagnam: astroData.panchangam.lagnam,
                    age: age,
                    dosham_status: false,
                    work: record.work || null,
                    case: record.case || null,
                    region: record.region || null,
                    district: record.district || null,
                    salary: record.salary || null,
                    other_country: record.other_country || null,
                    dowry: record.dowry || null,
                    business: record.business || null,
                    photo: record.photo || null,
                    no_case: record.no_case === 'true' || record.no_case === '1' || record.no_case === 'Yes',
                    is_widow: record.is_widow === 'true' || record.is_widow === '1' || record.is_widow === 'Yes',
                    no_dob: no_dob,
                    no_parent: record.no_parent === 'true' || record.no_parent === '1' || record.no_parent === 'Yes',
                    siblings_count: parseInt(record.siblings_count) || 0,
                    siblings_details: record.siblings_details || null
                });

            } catch (err) {
                console.error("Error processing record: ", record.full_name, err);
            }
        }

        if (recordsToInsert.length > 0) {
            const { error: dbError } = await supabase.from('match_profiles').insert(recordsToInsert);
            if (dbError) {
                console.error('Database save error (match_profiles):', dbError);
                return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
            }
        } else {
             return NextResponse.json({ 
                 success: false, 
                 error: "No valid records were found or processed. Please check your data format (Times should be HH:MM or HH:MM:SS, Dates should be DD/MM/YYYY or YYYY-MM-DD)." 
             }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: `Successfully inserted ${recordsToInsert.length} profiles` });

    } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
