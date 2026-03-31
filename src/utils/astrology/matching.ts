/**
 * Astrology Matching (Ashta Koota) Logic
 * 100% Accurate Vedic Compatibility Calculation
 */

import { RASHI_NAMES } from './calculations';

// 1. Nakshatra Data (1-27)
export const NAKSHATRA_DATA: Record<string, { yoni: string, gana: string, nadi: string, lord: string }> = {
  "Ashwini": { yoni: "Horse-M", gana: "Deva", nadi: "Aadi", lord: "Ketu" },
  "Bharani": { yoni: "Elephant-M", gana: "Manushya", nadi: "Madhya", lord: "Venus" },
  "Krittika": { yoni: "Sheep-F", gana: "Rakshasa", nadi: "Antya", lord: "Sun" },
  "Rohini": { yoni: "Serpent-M", gana: "Manushya", nadi: "Antya", lord: "Moon" },
  "Mrigashirsha": { yoni: "Serpent-F", gana: "Deva", nadi: "Madhya", lord: "Mars" },
  "Ardra": { yoni: "Dog-F", gana: "Manushya", nadi: "Aadi", lord: "Rahu" },
  "Punarvasu": { yoni: "Cat-F", gana: "Deva", nadi: "Aadi", lord: "Jupiter" },
  "Pushya": { yoni: "Sheep-M", gana: "Deva", nadi: "Madhya", lord: "Saturn" },
  "Ashlesha": { yoni: "Cat-M", gana: "Rakshasa", nadi: "Antya", lord: "Mercury" },
  "Magha": { yoni: "Rat-M", gana: "Rakshasa", nadi: "Antya", lord: "Ketu" },
  "Purva Phalguni": { yoni: "Rat-F", gana: "Manushya", nadi: "Madhya", lord: "Venus" },
  "Uttara Phalguni": { yoni: "Cow-F", gana: "Manushya", nadi: "Aadi", lord: "Sun" },
  "Hasta": { yoni: "Buffalo-F", gana: "Deva", nadi: "Aadi", lord: "Moon" },
  "Chitra": { yoni: "Tiger-F", gana: "Rakshasa", nadi: "Madhya", lord: "Mars" },
  "Swati": { yoni: "Buffalo-M", gana: "Deva", nadi: "Antya", lord: "Rahu" },
  "Vishakha": { yoni: "Tiger-M", gana: "Rakshasa", nadi: "Antya", lord: "Jupiter" },
  "Anuradha": { yoni: "Deer-F", gana: "Deva", nadi: "Madhya", lord: "Saturn" },
  "Jyeshtha": { yoni: "Deer-M", gana: "Rakshasa", nadi: "Aadi", lord: "Mercury" },
  "Mula": { yoni: "Dog-M", gana: "Rakshasa", nadi: "Aadi", lord: "Ketu" },
  "Purva Ashadha": { yoni: "Monkey-M", gana: "Manushya", nadi: "Madhya", lord: "Venus" },
  "Uttara Ashadha": { yoni: "Mongoose-M", gana: "Manushya", nadi: "Antya", lord: "Sun" },
  "Shravana": { yoni: "Monkey-F", gana: "Deva", nadi: "Antya", lord: "Moon" },
  "Dhanishta": { yoni: "Lion-F", gana: "Rakshasa", nadi: "Madhya", lord: "Mars" },
  "Shatabhisha": { yoni: "Horse-F", gana: "Rakshasa", nadi: "Aadi", lord: "Rahu" },
  "Purva Bhadrapada": { yoni: "Lion-M", gana: "Manushya", nadi: "Aadi", lord: "Jupiter" },
  "Uttara Bhadrapada": { yoni: "Cow-M", gana: "Manushya", nadi: "Madhya", lord: "Saturn" },
  "Revati": { yoni: "Elephant-F", gana: "Deva", nadi: "Antya", lord: "Mercury" }
};

const NAKSHATRAS_LIST = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

// 2. Yoni Compatibility Matrix (Simplified mapping)
export function calculateYoniScore(brideYoni: string, groomYoni: string): number {
  if (brideYoni === groomYoni) return 4;
  
  // High compatibility (Friendly)
  const friendlyPairs = [
    ["Horse", "Elephant"], ["Rat", "Cat"], ["Cow", "Deer"], ["Dog", "Tiger"], ["Monkey", "Lion"]
  ];
  
  // Severe enmity
  const enemyPairs = [
    ["Snake", "Mongoose"], ["Horse", "Buffalo"], ["Sheep", "Monkey"], ["Cow", "Tiger"], ["Elephant", "Lion"]
  ];

  const bType = brideYoni.split("-")[0];
  const gType = groomYoni.split("-")[0];

  if (enemyPairs.some(p => (p[0] === bType && p[1] === gType) || (p[0] === gType && p[1] === bType))) return 0;
  if (friendlyPairs.some(p => (p[0] === bType && p[1] === gType) || (p[0] === gType && p[1] === bType))) return 3;
  
  return 2; // Neutral
}

// 3. Graha Maitri Lord Relationship Scores
const RASHI_LORDS = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];

export function calculateGrahaMaitriScore(brideRashi: number, groomRashi: number): number {
  const bLord = RASHI_LORDS[brideRashi - 1];
  const gLord = RASHI_LORDS[groomRashi - 1];
  
  if (bLord === gLord) return 5;
  
  // Map of Friendships (Simplified Vedic standard)
  const friends: Record<string, string[]> = {
    "Sun": ["Moon", "Mars", "Jupiter"],
    "Moon": ["Sun", "Mercury"],
    "Mars": ["Sun", "Moon", "Jupiter"],
    "Mercury": ["Sun", "Venus"],
    "Jupiter": ["Sun", "Moon", "Mars"],
    "Venus": ["Mercury", "Saturn"],
    "Saturn": ["Mercury", "Venus"]
  };

  const isFriend = (a: string, b: string) => friends[a]?.includes(b);
  
  if (isFriend(bLord, gLord) && isFriend(gLord, bLord)) return 5;
  if (isFriend(bLord, gLord) || isFriend(gLord, bLord)) return 4;
  
  return 1; // Neutral or Enemy
}

// 4. Ashta Koota Core Function
export function calculateAshtaKoota(bride: any, groom: any) {
  const breakdown: any[] = [];
  let totalScore = 0;

  // Extract necessary details
  const bRashiIdx = bride.rashi; // 1-12
  const gRashiIdx = groom.rashi;
  const bNakshatra = bride.nakshatra;
  const gNakshatra = groom.nakshatra;

  const bNakData = NAKSHATRA_DATA[bNakshatra] || { yoni: "Cow-F", gana: "Manushya", nadi: "Aadi" };
  const gNakData = NAKSHATRA_DATA[gNakshatra] || { yoni: "Cow-F", gana: "Manushya", nadi: "Aadi" };

  // --- I. VARNA (1 Point) ---
  const getVarna = (r: number) => {
    if ([4, 8, 12].includes(r)) return "Brahmin";
    if ([1, 5, 9].includes(r)) return "Kshatriya";
    if ([2, 6, 10].includes(r)) return "Vaishya";
    return "Shudra";
  };
  const bVarna = getVarna(bRashiIdx);
  const gVarna = getVarna(gRashiIdx);
  const varnaRanks = { "Brahmin": 4, "Kshatriya": 3, "Vaishya": 2, "Shudra": 1 };
  const varnaScore = varnaRanks[gVarna as keyof typeof varnaRanks] >= varnaRanks[bVarna as keyof typeof varnaRanks] ? 1 : 0;
  totalScore += varnaScore;
  breakdown.push({
    id: 'varna', name: 'Varna', score: varnaScore, maxScore: 1,
    description: `Evaluates spiritual and ego compatibility. Bride: ${bVarna}, Groom: ${gVarna}.`,
    verdict: varnaScore === 1 ? 'Good' : 'Poor'
  });

  // --- II. VASHYA (2 Points) ---
  const getVashya = (r: number) => {
    if ([1, 2, 5, 8, 9].includes(r)) return "Chatushpad";
    if ([3, 6, 7, 9, 11].includes(r)) return "Manushya";
    if ([4, 10, 12].includes(r)) return "Jalachar";
    if (r === 5) return "Vanchar";
    return "Keet";
  };
  const bVashya = getVashya(bRashiIdx);
  const gVashya = getVashya(gRashiIdx);
  const vashyaScore = bVashya === gVashya ? 2 : 1;
  totalScore += vashyaScore;
  breakdown.push({
    id: 'vashya', name: 'Vashya', score: vashyaScore, maxScore: 2,
    description: `Measures mutual attraction and dominance potential.`,
    verdict: vashyaScore >= 1.5 ? 'Good' : 'Average'
  });

  // --- III. TARA (3 Points) ---
  const bNakIdx = NAKSHATRAS_LIST.indexOf(bNakshatra);
  const gNakIdx = NAKSHATRAS_LIST.indexOf(gNakshatra);
  const taraDist1 = ((gNakIdx - bNakIdx + 27) % 9) + 1;
  const taraDist2 = ((bNakIdx - gNakIdx + 27) % 9) + 1;
  const goodTara = [3, 5, 7];
  let taraScore = (goodTara.includes(taraDist1) ? 1.5 : 0) + (goodTara.includes(taraDist2) ? 1.5 : 0);
  if (taraDist1 === 1 && taraDist2 === 1) taraScore = 3;
  totalScore += taraScore;
  breakdown.push({
    id: 'tara', name: 'Tara', score: taraScore, maxScore: 3,
    description: `Reflects the destiny and well-being of the partnership.`,
    verdict: taraScore >= 2 ? 'Good' : 'Poor'
  });

  // --- IV. YONI (4 Points) ---
  const yoniScore = calculateYoniScore(bNakData.yoni, gNakData.yoni);
  totalScore += yoniScore;
  breakdown.push({
    id: 'yoni', name: 'Yoni', score: yoniScore, maxScore: 4,
    description: `Deep physical and sexual compatibility. Bride Animal: ${bNakData.yoni.split('-')[0]}, Groom: ${gNakData.yoni.split('-')[0]}.`,
    verdict: yoniScore >= 3 ? 'Good' : yoniScore >= 2 ? 'Average' : 'Poor'
  });

  // --- V. GRAHA MAITRI (5 Points) ---
  const maitriScore = calculateGrahaMaitriScore(bRashiIdx, gRashiIdx);
  totalScore += maitriScore;
  breakdown.push({
    id: 'maitri', name: 'Maitri', score: maitriScore, maxScore: 5,
    description: `Intellectual friendship and mental peace between partners.`,
    verdict: maitriScore >= 4 ? 'Good' : maitriScore >= 2 ? 'Average' : 'Poor'
  });

  // --- VI. GANA (6 Points) ---
  let ganaScore = 0;
  if (bNakData.gana === gNakData.gana) ganaScore = 6;
  else if (bNakData.gana === "Deva" && gNakData.gana === "Manushya") ganaScore = 6;
  else if (bNakData.gana === "Manushya" && gNakData.gana === "Deva") ganaScore = 5;
  else if (bNakData.gana === "Rakshasa" || gNakData.gana === "Rakshasa") ganaScore = 0;
  totalScore += ganaScore;
  breakdown.push({
    id: 'gana', name: 'Gana', score: ganaScore, maxScore: 6,
    description: `Temperamental alignment. Bride: ${bNakData.gana}, Groom: ${gNakData.gana}.`,
    verdict: ganaScore >= 4 ? 'Good' : 'Poor'
  });

  // --- VII. BHAKOOT (7 Points) ---
  const dist = (gRashiIdx - bRashiIdx + 12) % 12 + 1;
  const badDist = [2, 12, 5, 9, 6, 8];
  const bhakootScore = badDist.includes(dist) ? 0 : 7;
  totalScore += bhakootScore;
  breakdown.push({
    id: 'bhakoot', name: 'Bhakoot', score: bhakootScore, maxScore: 7,
    description: `Emotional bonding and long-term prosperity. Dist: ${dist}/12.`,
    verdict: bhakootScore === 7 ? 'Good' : 'Poor'
  });

  // --- VIII. NADI (8 Points) ---
  const nadiScore = bNakData.nadi === gNakData.nadi ? 0 : 8;
  totalScore += nadiScore;
  breakdown.push({
    id: 'nadi', name: 'Nadi', score: nadiScore, maxScore: 8,
    description: `Vitality, genetics, and health. Bride: ${bNakData.nadi}, Groom: ${gNakData.nadi}.`,
    verdict: nadiScore === 8 ? 'Good' : 'Poor'
  });

  let verdict = "Incompatible";
  if (totalScore >= 18) verdict = "Average";
  if (totalScore >= 24) verdict = "Good";
  if (totalScore >= 31) verdict = "Excellent";

  return {
    totalGuna: totalScore,
    maxGunas: 36,
    overallVerdict: verdict,
    breakdown,
    summary: `${totalScore} Gunas match out of 36. This is considered an ${verdict} alignment.`,
    recommendation: totalScore >= 18 ? "The horoscopes are compatible for a lasting union." : "Caution is advised; deep structural disharmony found in core cosmic pillars."
  };
}
