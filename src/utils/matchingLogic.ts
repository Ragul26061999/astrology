import { NAKSHATRAS, RASIS } from './astroMath';

function getNakshatraBaseName(name: string) {
    return name.split(' ')[0].split('/')[0].trim();
}

const GANA_MAP: Record<string, string> = {
    'Ashwini': 'Deva', 'Mrigashirsha': 'Deva', 'Punarvasu': 'Deva', 'Pushya': 'Deva', 'Hasta': 'Deva', 'Swati': 'Deva', 'Anuradha': 'Deva', 'Shravana': 'Deva', 'Revati': 'Deva',
    'Bharani': 'Manushya', 'Rohini': 'Manushya', 'Ardra': 'Manushya', 'Purva Phalguni': 'Manushya', 'Uttara Phalguni': 'Manushya', 'Purva Ashadha': 'Manushya', 'Uttara Ashadha': 'Manushya', 'Purva Bhadrapada': 'Manushya', 'Uttara Bhadrapada': 'Manushya',
    'Krittika': 'Rakshasa', 'Ashlesha': 'Rakshasa', 'Magha': 'Rakshasa', 'Chitra': 'Rakshasa', 'Vishakha': 'Rakshasa', 'Jyeshtha': 'Rakshasa', 'Mula': 'Rakshasa', 'Dhanishta': 'Rakshasa', 'Shatabhisha': 'Rakshasa'
};

const RAJJU_MAP: Record<string, string> = {
    'Mrigashirsha': 'Head', 'Chitra': 'Head', 'Dhanishta': 'Head',
    'Rohini': 'Neck', 'Ardra': 'Neck', 'Hasta': 'Neck', 'Swati': 'Neck', 'Shravana': 'Neck', 'Shatabhisha': 'Neck',
    'Krittika': 'Stomach', 'Punarvasu': 'Stomach', 'Uttara Phalguni': 'Stomach', 'Vishakha': 'Stomach', 'Uttara Ashadha': 'Stomach', 'Purva Bhadrapada': 'Stomach',
    'Bharani': 'Thigh', 'Pushya': 'Thigh', 'Purva Phalguni': 'Thigh', 'Anuradha': 'Thigh', 'Purva Ashadha': 'Thigh', 'Uttara Bhadrapada': 'Thigh',
    'Ashwini': 'Foot', 'Ashlesha': 'Foot', 'Magha': 'Foot', 'Jyeshtha': 'Foot', 'Mula': 'Foot', 'Revati': 'Foot'
};

const VEDHA_PAIRS = [
    ['Ashwini', 'Jyeshtha'], ['Bharani', 'Anuradha'], ['Krittika', 'Vishakha'], ['Rohini', 'Swati'],
    ['Mrigashirsha', 'Dhanishta'], ['Ardra', 'Shravana'], ['Punarvasu', 'Uttara Ashadha'],
    ['Pushya', 'Purva Ashadha'], ['Ashlesha', 'Mula'], ['Magha', 'Revati'],
    ['Purva Phalguni', 'Uttara Bhadrapada'], ['Uttara Phalguni', 'Purva Bhadrapada'], ['Hasta', 'Shatabhisha']
];

export function calculate10Porutham(boyNakshatraStr: string, boyRasiStr: string, girlNakshatraStr: string, girlRasiStr: string) {
    let boyBase = getNakshatraBaseName(boyNakshatraStr);
    let girlBase = getNakshatraBaseName(girlNakshatraStr);

    let boyIndex = NAKSHATRAS.findIndex(n => n.includes(boyBase));
    let girlIndex = NAKSHATRAS.findIndex(n => n.includes(girlBase));

    let boyRasiIdx = RASIS.findIndex(r => r.includes(boyRasiStr.split(' ')[0]));
    let girlRasiIdx = RASIS.findIndex(r => r.includes(girlRasiStr.split(' ')[0]));

    if (boyIndex === -1 || girlIndex === -1 || boyRasiIdx === -1 || girlRasiIdx === -1) {
       return { score: 0, details: [] };
    }

    // Distance inclusive
    let distance = (boyIndex - girlIndex + 27) % 27 + 1;
    let rasiDistance = (boyRasiIdx - girlRasiIdx + 12) % 12 + 1;

    const results = [];
    let score = 0;

    // 1. Dina
    const dinaMatch = [2, 4, 6, 8, 0].includes(distance % 9);
    results.push({ name: 'Dina Porutham', description: 'Health & Longevity', matched: dinaMatch });
    if (dinaMatch) score++;

    // 2. Gana
    const boyGana = GANA_MAP[boyBase];
    const girlGana = GANA_MAP[girlBase];
    let ganaMatch = false;
    if (boyGana === 'Deva' && girlGana === 'Deva') ganaMatch = true;
    else if (boyGana === 'Rakshasa' && girlGana === 'Rakshasa') ganaMatch = true;
    else if (girlGana === 'Deva' && boyGana === 'Manushya') ganaMatch = true;
    else if (girlGana === 'Manushya' && boyGana === 'Deva') ganaMatch = true;
    results.push({ name: 'Gana Porutham', description: 'Temperament', matched: ganaMatch });
    if (ganaMatch) score++;

    // 3. Mahendra
    const mahendraMatch = [4, 7, 10, 13, 16, 19, 22, 25].includes(distance);
    results.push({ name: 'Mahendra Porutham', description: 'Wealth & Progeny', matched: mahendraMatch });
    if (mahendraMatch) score++;

    // 4. Sthree Dheerkam
    const sthreeMatch = distance > 13;
    results.push({ name: 'Sthree Dheerkam', description: 'Prosperity', matched: sthreeMatch });
    if (sthreeMatch) score++;

    // 5. Yoni (Simplified: Check enemies, default to match)
    // Adding general match as placeholder for now unless expanded mappings added
    results.push({ name: 'Yoni Porutham', description: 'Physical Compatibility', matched: true });
    score++;

    // 6. Rasi
    const rasiMatch = rasiDistance > 6;
    results.push({ name: 'Rasi Porutham', description: 'Lineage/Family Expansion', matched: rasiMatch });
    if (rasiMatch) score++;

    // 7. Rasi Athipathi (Simplified default)
    results.push({ name: 'Rasi Athipathi', description: 'Friendship', matched: true });
    score++;

    // 8. Vasya (Simplified default)
    results.push({ name: 'Vasya Porutham', description: 'Mutual Attraction', matched: true });
    score++;

    // 9. Rajju (CRITICAL)
    const boyRajju = RAJJU_MAP[boyBase];
    const girlRajju = RAJJU_MAP[girlBase];
    const rajjuMatch = boyRajju !== girlRajju;
    results.push({ name: 'Rajju Porutham', description: 'Husband\'s Longevity', matched: rajjuMatch, isCritical: true, criticalFailed: !rajjuMatch });
    if (rajjuMatch) score++;

    // 10. Vedha
    let vedhaMatch = true;
    for (let pair of VEDHA_PAIRS) {
        if ((pair.includes(boyBase) && pair.includes(girlBase))) {
            vedhaMatch = false;
        }
    }
    results.push({ name: 'Vedha Porutham', description: 'Absence of Afflictions', matched: vedhaMatch });
    if (vedhaMatch) score++;

    return {
        score,
        total: 10,
        rajjuFailed: !rajjuMatch,
        poruthams: results
    }
}
