// POST to create a pair, GET to list pairs
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { groom_id, bride_id } = body;

        if (!groom_id || !bride_id) {
            return NextResponse.json({ success: false, error: 'groom_id and bride_id are required' }, { status: 400 });
        }

        const supabase = await createClient();

        // Check if either is already paired
        const { data: existingPairs, error: queryError } = await supabase
            .from('paired_profiles')
            .select('*')
            .or(`groom_id.eq.${groom_id},groom_id.eq.${bride_id},bride_id.eq.${groom_id},bride_id.eq.${bride_id}`);

        if (queryError) {
             // Handle if table doesn't exist
             if (queryError.code === '42P01') {
                 return NextResponse.json({ success: false, error: 'Table paired_profiles does not exist. Please run the SQL schema.' }, { status: 500 });
             }
             throw queryError;
        }

        if (existingPairs && existingPairs.length > 0) {
            return NextResponse.json({ success: false, error: 'One or both seekers are already paired' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('paired_profiles')
            .insert([{ groom_id, bride_id }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, pair: data });
    } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        const supabase = await createClient();
        
        const { data: pairs, error } = await supabase
            .from('paired_profiles')
            .select(`
                id,
                created_at,
                groom:match_profiles!groom_id(*),
                bride:match_profiles!bride_id(*)
            `)
            .order('created_at', { ascending: false });

        if (error) {
             if (error.code === '42P01') {
                 return NextResponse.json({ success: true, pairs: [] });
             }
             throw error;
        }

        return NextResponse.json({ success: true, pairs });
    } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'Pair ID is required' }, { status: 400 });
        }

        const supabase = await createClient();
        const { error } = await supabase
            .from('paired_profiles')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Pair reverted successfully' });
    } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
