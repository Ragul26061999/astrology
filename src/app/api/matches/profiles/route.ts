import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.from('match_profiles').select('*').order('full_name');

        if (error) throw error;
        
        return NextResponse.json({ success: true, profiles: data });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
