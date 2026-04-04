import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { calculate10Porutham } from '@/utils/matchingLogic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sourceId, targetGender } = body;

        if (!sourceId || !targetGender) {
            return NextResponse.json({ success: false, error: 'sourceId and targetGender are required' }, { status: 400 });
        }

        const supabase = await createClient();

        // fetch source profile
        const { data: sourceProfile, error: sourceError } = await supabase
            .from('match_profiles')
            .select('*')
            .eq('id', sourceId)
            .single();

        if (sourceError || !sourceProfile) {
            throw new Error('Source profile not found');
        }

        // fetch target profiles
        const { data: targetProfiles, error: targetError } = await supabase
            .from('match_profiles')
            .select('*')
            .ilike('gender', targetGender);
            
        if (targetError) throw targetError;

        const matches = targetProfiles.map((targetProfile: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
            const boyNakshatra = sourceProfile.gender.toLowerCase() === 'male' ? sourceProfile.nakshatram : targetProfile.nakshatram;
            const boyRasi = sourceProfile.gender.toLowerCase() === 'male' ? sourceProfile.rasi : targetProfile.rasi;
            const girlNakshatra = sourceProfile.gender.toLowerCase() === 'female' ? sourceProfile.nakshatram : targetProfile.nakshatram;
            const girlRasi = sourceProfile.gender.toLowerCase() === 'female' ? sourceProfile.rasi : targetProfile.rasi;

            const matchData = calculate10Porutham(boyNakshatra, boyRasi, girlNakshatra, girlRasi);

            return {
                targetProfile,
                score: matchData.score,
                rajjuFailed: matchData.rajjuFailed,
                poruthams: matchData.poruthams
            };
        });

        // Sort by score descending, then by rajjuPassed
        matches.sort((a: any /* eslint-disable-line @typescript-eslint/no-explicit-any */, b: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
            if (a.rajjuFailed !== b.rajjuFailed) {
                return a.rajjuFailed ? 1 : -1; // passed first
            }
            return b.score - a.score;
        });

        return NextResponse.json({ success: true, matches });
    } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
