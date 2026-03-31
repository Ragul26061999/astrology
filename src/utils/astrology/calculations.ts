import { 
  getPlanetaryPositions, 
  getPanchang, 
  getKundali, 
  getMoonSign,
  RASHIS,
  NAKSHATRAS 
} from 'vedic-astro';

export interface BirthData {
  date: string; // ISO format
  latitude: number;
  longitude: number;
  timezone?: string;
}

export const DASHA_LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
export const DASHA_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17];

export function calculateVimshottariDasha(moonLongitude: number, birthDate: Date) {
  // Nakshatra is exactly 13°20' (800 minutes)
  const nakshatraLength = 13.333333;
  const totalNakshatras = 27;
  
  // Find which Nakshatra the moon is in (0 to 26)
  const nakshatraIndex = Math.floor(moonLongitude / nakshatraLength) % totalNakshatras;
  
  // Proportional position within the nakshatra (0 to 1)
  const positionInNakshatra = (moonLongitude % nakshatraLength) / nakshatraLength;
  
  // Dasha lord index (Vimshottari order starts from Ashwini = Ketu)
  const firstLordIndex = nakshatraIndex % 9;
  
  const dashas = [];
  let currentDate = new Date(birthDate);
  
  // Calculate the remaining time in the FIRST dasha
  const firstDashaTotalYears = DASHA_YEARS[firstLordIndex];
  const remainingYears = firstDashaTotalYears * (1 - positionInNakshatra);
  
  // Add first dasha
  let endDate = new Date(currentDate);
  endDate.setFullYear(endDate.getFullYear() + Math.floor(remainingYears));
  endDate.setMonth(endDate.getMonth() + Math.floor((remainingYears % 1) * 12));
  
  dashas.push({
    lord: DASHA_LORDS[firstLordIndex],
    start: new Date(currentDate).toISOString(),
    end: endDate.toISOString(),
    duration: remainingYears
  });
  
  currentDate = new Date(endDate);
  
  // Calculate subsequent dashas (at least for a full lifetime of 120 years)
  for (let i = 1; i < 9; i++) {
    const lordIndex = (firstLordIndex + i) % 9;
    const years = DASHA_YEARS[lordIndex];
    
    let nextEndDate = new Date(currentDate);
    nextEndDate.setFullYear(nextEndDate.getFullYear() + years);
    
    dashas.push({
      lord: DASHA_LORDS[lordIndex],
      start: currentDate.toISOString(),
      end: nextEndDate.toISOString(),
      duration: years
    });
    
    currentDate = new Date(nextEndDate);
  }
  
  return dashas;
}

export async function calculateBirthChart(data: BirthData) {
  const { date, latitude, longitude } = data;
  const location = { latitude, longitude };
  const birthDate = new Date(date);
  const iso = birthDate.toISOString();

  // 1. Get exact planetary positions
  const positionsResult = await getPlanetaryPositions({ iso }, location);
  
  // 2. Get Panchang details
  const panchang = getPanchang(positionsResult, location);
  
  // 3. Get House placements
  const rawKundali = getKundali(positionsResult);
  
  // 4. Get Moon Sign specifically
  const moonSign = getMoonSign(positionsResult);

  // 5. Build mapped positions with all details
  const mappedPositions: Record<string, any> = {};
  positionsResult.positions.forEach(p => {
    // Calculate sign (1-12) and degree (0-30) from longitude
    const rashi = Math.floor(p.longitude / 30) + 1;
    const degree = p.longitude % 30;
    
    // Calculate Nakshatra (1-27)
    const nakLong = p.longitude;
    const nakStep = 360 / 27;
    const nakIdx = Math.floor(nakLong / nakStep);
    const nakName = NAKSHATRAS[nakIdx] || "Unknown";
    const pada = Math.floor((nakLong % nakStep) / (nakStep / 4)) + 1;

    mappedPositions[p.name.toLowerCase()] = {
      ...p,
      rashi,
      degree,
      nakshatra: nakName,
      pada,
      isRetro: p.isRetrograde
    };
  });

  // 6. Map Kundali houses to expected format
  const mappedHouses: Record<number, { rashi: number; planets: string[] }> = {};
  rawKundali.houses.forEach((h, idx) => {
    // Find the Rashi index (1-12)
    const rashiIdx = RASHIS.indexOf(h.sign) + 1;
    mappedHouses[idx + 1] = {
      rashi: rashiIdx,
      planets: h.planets
    };
  });

  // 7. Calculate Dasha based on Moon's longitude
  const moonPos = mappedPositions.moon.longitude;
  const dashas = calculateVimshottariDasha(moonPos, birthDate);

  return {
    positions: mappedPositions,
    panchang,
    kundali: {
      ...rawKundali,
      houses: mappedHouses
    },
    moonSign,
    dashas,
    metadata: {
      date: iso,
      latitude,
      longitude
    }
  };
}

export const RASHI_NAMES = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export const PLANET_NAMES: Record<string, string> = {
  sun: "Sun",
  moon: "Moon",
  mars: "Mars",
  mercury: "Mercury",
  jupiter: "Jupiter",
  venus: "Venus",
  saturn: "Saturn",
  rahu: "Rahu",
  ketu: "Ketu",
};
