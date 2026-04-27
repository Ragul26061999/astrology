import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAstrologyData } from '@/utils/astroMath';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        
        const full_name = formData.get('full_name') as string;
        const gender = formData.get('gender') as string;
        const date_of_birth = formData.get('date_of_birth') as string;
        const time_of_birth = formData.get('time_of_birth') as string;
        const place_of_birth_city = formData.get('place_of_birth_city') as string;
        const latitude = formData.get('latitude') as string;
        const longitude = formData.get('longitude') as string;
        const work = formData.get('work') as string;
        const caseField = formData.get('case') as string;
        const region = formData.get('region') as string;
        const district = formData.get('district') as string;
        const salary = formData.get('salary') as string;
        const other_country = formData.get('other_country') as string;
        const dowry = formData.get('dowry') as string;
        const business = formData.get('business') as string;
        const photoFile = formData.get('photo') as File | null;
        
        // New V2 fields
        const no_case = formData.get('no_case') === 'true';
        const is_widow = formData.get('is_widow') === 'true';
        const no_dob = formData.get('no_dob') === 'true';
        const no_parent = formData.get('no_parent') === 'true';
        const siblings_count = parseInt(formData.get('siblings_count') as string) || 0;
        const siblings_details = formData.get('siblings_details') as string;

        if (!full_name || !gender || (!no_dob && (!date_of_birth || !time_of_birth || !latitude || !longitude))) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        let astroData: any = null;
        let nakshatraName = null;
        let pada = null;
        let rasi = null;
        let lagnam = null;
        let age = null;

        if (!no_dob && date_of_birth && time_of_birth && latitude && longitude) {
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            
            let timeStr = time_of_birth;
            if (timeStr && timeStr.split(':').length === 2) {
                timeStr = `${timeStr}:00`;
            }
            
            const isoString = `${date_of_birth}T${timeStr}+05:30`;
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

            const birthDateObj = new Date(date_of_birth);
            const today = new Date();
            age = today.getFullYear() - birthDateObj.getFullYear();
            const m = today.getMonth() - birthDateObj.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
                age--;
            }
        }

        const supabase = await createClient();
        
        // Upload photo to Supabase storage if provided
        let photoUrl: string | null = null;
        if (photoFile) {
            const fileExt = photoFile.name.split('.').pop();
            const fileName = `${full_name.replace(/\s+/g, '_')}_${Date.now()}.${fileExt}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('profile-photos')
                .upload(fileName, photoFile);
            
            if (uploadError) {
                console.error('Photo upload error:', uploadError);
                // Continue without photo if upload fails
            } else {
                const { data: { publicUrl } } = supabase.storage
                    .from('profile-photos')
                    .getPublicUrl(fileName);
                photoUrl = publicUrl;
            }
        }

        const { data, error } = await supabase.from('match_profiles').insert([{
            full_name,
            gender,
            birth_date: no_dob ? null : date_of_birth,
            birth_time: no_dob ? null : time_of_birth,
            birth_place: no_dob ? null : place_of_birth_city,
            latitude: no_dob ? null : parseFloat(latitude),
            longitude: no_dob ? null : parseFloat(longitude),
            rasi: rasi,
            nakshatram: nakshatraName,
            nakshatra_pada: pada,
            lagnam: lagnam,
            age: age,
            dosham_status: false,
            work: work || null,
            case: caseField || null,
            region: region || null,
            district: district || null,
            salary: salary || null,
            other_country: other_country || null,
            dowry: dowry || null,
            business: business || null,
            photo: photoUrl,
            no_case,
            is_widow,
            no_dob,
            no_parent,
            siblings_count,
            siblings_details
        }]).select();

        if (error) throw error;

        return NextResponse.json({ success: true, profile: data[0] });

    } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
