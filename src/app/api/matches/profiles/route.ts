import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        
        let pairedIds = new Set();
        try {
            const { data: paired, error: pairedError } = await supabase.from('paired_profiles').select('groom_id, bride_id');
            if (!pairedError && paired) {
                pairedIds = new Set(paired.flatMap((p: { groom_id: string, bride_id: string }) => [p.groom_id, p.bride_id]));
            }
        } catch (e) {
            // ignore if table doesn't exist yet
        }

        const { data, error } = await supabase.from('match_profiles').select('*').order('full_name');

        if (error) throw error;
        
        const filteredData = data.filter((p: any) => !pairedIds.has(p.id));

        return NextResponse.json({ success: true, profiles: filteredData });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
