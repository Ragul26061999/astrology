import { NextResponse } from 'next/server';
import { getAstrologyData } from '@/utils/astroMath';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, gender, date, time, place, lat, lng } = body;

        // Calculate astrology data first so we can save it!
        const isoString = `${date}T${time}:00+05:30`;
        const astroData = getAstrologyData(isoString, parseFloat(lat), parseFloat(lng));

        // Save to the NEW comprehensive table: astrology_records
        const supabase = await createClient();
        const { error: dbError } = await supabase.from('astrology_records').insert({
            name,
            gender,
            birth_date: date,
            birth_time: time,
            birth_place: place,
            latitude: parseFloat(lat),
            longitude: parseFloat(lng),
            tithi: astroData.panchangam.tithi,
            nakshatram: astroData.panchangam.nakshatram,
            rasi: astroData.panchangam.rasi,
            lagnam: astroData.panchangam.lagnam,
            yogam: astroData.panchangam.yogam,
            karanam: astroData.panchangam.karanam,
            varam: astroData.panchangam.varam,
            tamil_year: astroData.panchangam.tamilYear,
            tamil_month: astroData.panchangam.tamilMonth,
            planets_data: astroData.planets,
            created_at: new Date().toISOString()
        });

        if (dbError) {
            console.error('Database save error (astrology_records):', dbError);
        }

        return NextResponse.json({ success: true, data: astroData });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
