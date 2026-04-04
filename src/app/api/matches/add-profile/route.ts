import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAstrologyData } from '@/utils/astroMath';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { 
            full_name, 
            gender, 
            date_of_birth, 
            time_of_birth, 
            place_of_birth_city, 
            latitude, 
            longitude 
        } = body;

        if (!full_name || !gender || !date_of_birth || !time_of_birth || !latitude || !longitude) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        
        let timeStr = time_of_birth;
        if (timeStr && timeStr.split(':').length === 2) {
            timeStr = `${timeStr}:00`;
        }
        
        const isoString = `${date_of_birth}T${timeStr}+05:30`;
        const astroData = getAstrologyData(isoString, lat, lng);

        // Parse Nakshatram and Pada from result
        const nakshatraStr = astroData.panchangam.nakshatram;
        const pIndex = nakshatraStr.lastIndexOf('p');
        let nakshatraName = nakshatraStr;
        let pada = 1;
        if (pIndex > -1) {
            nakshatraName = nakshatraStr.substring(0, pIndex).trim();
            pada = parseInt(nakshatraStr.substring(pIndex + 1));
        }

        const birthDateObj = new Date(date_of_birth);
        const today = new Date();
        let age = today.getFullYear() - birthDateObj.getFullYear();
        const m = today.getMonth() - birthDateObj.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
            age--;
        }

        const supabase = await createClient();
        const { data, error } = await supabase.from('match_profiles').insert([{
            full_name,
            gender,
            birth_date: date_of_birth,
            birth_time: time_of_birth,
            birth_place: place_of_birth_city,
            latitude: lat,
            longitude: lng,
            rasi: astroData.panchangam.rasi,
            nakshatram: nakshatraName,
            nakshatra_pada: pada,
            lagnam: astroData.panchangam.lagnam,
            age: age,
            dosham_status: false
        }]).select();

        if (error) throw error;

        return NextResponse.json({ success: true, profile: data[0] });

    } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
