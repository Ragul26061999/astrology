export interface BirthData {
  date: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  fullName?: string;
}

export interface PlanetData {
  id: string;
  name: string;
  longitude: number;
  rashi: number;
  degree: number;
  nakshatra: string;
  pada: number;
  isRetro: boolean;
}

export interface BirthChart {
  positions: Record<string, PlanetData>;
  panchang: {
    tithi: string;
    vara: string;
    yoga: string;
    karana: string;
    sunrise: string;
    sunset: string;
  };
  kundali: {
    houses: Record<number, { rashi: number; planets: string[] }>;
  };
  moonSign: {
    name: string;
    rashi: number;
    nakshatra: string;
    pada: number;
  };
  dashas: Array<{
    lord: string;
    start: string;
    end: string;
    duration: number;
  }>;
  metadata: {
    date: string;
    latitude: number;
    longitude: number;
  };
}

export interface KootaDetail {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  description: string;
  verdict: 'Good' | 'Average' | 'Poor';
}

export interface MatchResult {
  totalGuna: number;
  maxGunas: 36;
  breakdown: KootaDetail[];
  overallVerdict: string;
  summary: string;
  recommendation: string;
  manglikStatus?: {
    bride: boolean;
    groom: boolean;
    isCompatible: boolean;
  };
}
