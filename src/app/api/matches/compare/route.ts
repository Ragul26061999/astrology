import { NextResponse } from 'next/server';
import { calculate10Porutham } from '@/utils/matchingLogic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { boyNakshatra, boyRasi, girlNakshatra, girlRasi } = body;

        const results = calculate10Porutham(boyNakshatra, boyRasi, girlNakshatra, girlRasi);
        
        return NextResponse.json({ success: true, matchData: results });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
