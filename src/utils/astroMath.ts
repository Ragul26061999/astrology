import { DateTime } from 'luxon';
// @ts-ignore
import data from 'astronomia/data';
// @ts-ignore
import { julian, moonposition, planetposition } from 'astronomia';
import SunCalc from 'suncalc';

export const TAMIL_YEARS = [
    "Prabhava (பிரபவ)", "Vibhava (விபவ)", "Shukla (சுக்ல)", "Pramodoota (பிரமோதூத)", "Prajothpatthi (பிரஜோத்பத்தி)", 
    "Aangirasa (ஆங்கீரச)", "Sreemukha (ஸ்ரீமுக)", "Bhaava (பாவ)", "Yuva (யுவ)", "Dhaathu (தாது)", 
    "Eesvara (ஈஸ்வர)", "Bahudhanya (பகுதானிய)", "Pramaathi (பிரமாதி)", "Vikrama (விக்கிரம)", "Vrisha (விஷ)", 
    "Chitrabhanu (சித்திரபானு)", "Subhanu (சுபானு)", "Tharana (தாரண)", "Parthiba (பார்த்திப)", "Vyaya (வியய)", 
    "Sarvajith (சர்வஜித்)", "Sarvadhari (சர்வதாரி)", "Virodhi (விரோதி)", "Vikruthi (விக்ருதி)", "Khara (கீலக)", 
    "Nandhana (நந்தன)", "Vijaya (விஜய)", "Jaya (ஜய)", "Manmatha (மன்மத)", "Dhunmuki (துன்முகி)", 
    "Hevilambi (ஹேவிளம்பி)", "Vilambi (விளம்பி)", "Vikari (விகாரி)", "Sarvari (சார்வரி)", "Plava (பிலவ)", 
    "Subakrithu (சுபகிருது)", "Sobakrithu (சோபகிருது)", "Krodhi (குரோதி)", "Visvavasu (விசுவாசு)", "Parabhava (பராபவ)", 
    "Plavanga (பிலவங்க)", "Keelaka (கீலக)", "Saumya (சௌமிய)", "Sadharana (சாதாரண)", "Virodhikrithu (விரோதகிருது)", 
    "Paridhavi (பரிதாபி)", "Pramadhisa (பிரமாதீச)", "Ananda (ஆனந்த)", "Rakshasa (ராட்சஸ)", "Nala (நள)", 
    "Pingala (பிங்கள)", "Kalayukthi (காளயுக்தி)", "Siddharthi (சித்தார்த்தி)", "Raudri (ரௌத்ரி)", "Dunmathi (துன்மதி)", 
    "Dundubhi (துந்துபி)", "Rudhirodgari (ருதிரோத்காரி)", "Raktakshi (ரக்தாட்சி)", "Krodhana (குரோதன)", "Akshaya (அட்சய)"
];

export const TAMIL_MONTHS = [
    "Chithirai (சித்திரை)", "Vaikasi (வைகாசி)", "Aani (ஆனி)", "Aadi (ஆடி)", 
    "Avani (ஆவணி)", "Purattasi (புரட்டாசி)", "Aippasi (ஐப்பசி)", "Karthigai (கார்த்திகை)", 
    "Margazhi (மார்கழி)", "Thai (தை)", "Maasi (மாசி)", "Panguni (பங்குனி)"
];

export const NAKSHATRAS = [
    "Ashwini (அசுவினி)", "Bharani (பரணி)", "Krittika / Karthigai (கார்த்திகை)", "Rohini (ரோகிணி)", 
    "Mrigashirsha / Mirugasiridam (மிருகசீரிடம்)", "Ardra / Thiruvathirai (திருவாதிரை)", "Punarvasu / Punarpusam (புனர்ப்பூசம்)", 
    "Pushya / Poosam (பூசம்)", "Ashlesha / Ayilyam (ஆயில்யம்)", "Magha / Magam (மகம்)", "Purva Phalguni / Pooram (பூரம்)", 
    "Uttara Phalguni / Uthiram (உத்திரம்)", "Hasta / Hastham (அஸ்தம்)", "Chitra / Chithirai (சித்திரை)", "Swati / Swathi (சுவாதி)", 
    "Vishakha / Visakam (விசாகம்)", "Anuradha / Anusham (அனுஷம்)", "Jyeshtha / Kettai (கேட்டை)", "Mula / Moolam (மூலம்)", 
    "Purva Ashadha / Pooradam (பூராடம்)", "Uttara Ashadha / Uthiradam (உத்திராடம்)", "Shravana / Thiruvonam (திருவோணம்)", 
    "Dhanishta / Avittam (அவிட்டம்)", "Shatabhisha / Sadayam (சதயம்)", "Purva Bhadrapada / Poorattathi (பூரட்டாதி)", 
    "Uttara Bhadrapada / Uthirattathi (உத்திரட்டாதி)", "Revati / Revathi (ரேவதி)"
];

export const RASIS = [
    "Mesham (மேஷம்)", "Rishabam (ரிஷபம்)", "Mithunam (மிதுனம்)", "Katakam (கடகம்)", 
    "Simmam (சிம்மம்)", "Kanni (கன்னி)", "Thulam (துலாம்)", "Viruchigam (விருச்சிகம்)", 
    "Dhanusu (தனுசு)", "Makaram (மகரம்)", "Kumbam (கும்பம்)", "Meenam (மீனம்)"
];

export const YOGAMS = [
    "Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
    "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata",
    "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva",
    "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
];

export const KARANAMS = [
    "Bav", "Balav", "Kaulav", "Taitil", "Gar", "Vanij", "Vishti",
    "Shakuni", "Chatushpad", "Nag", "Kintughna"
];

const DAYS = [
    "Gnayiru - ஞாயிறு (Sunday)", "Thingal - திங்கள் (Monday)", "Chevvai - செவ்வாய் (Tuesday)", 
    "Budhan - புதன் (Wednesday)", "Vyazhan - வியாழன் (Thursday)", "Velli - வெள்ளி (Friday)", 
    "Sani - சனி (Saturday)"
];

function normalizeAngle(deg: number) {
    return ((deg % 360) + 360) % 360;
}

function minimalAngleDiff(a: number, b: number) {
    let d = (b - a) % 360;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return d;
}

function getAyanamsha(jd: number) {
    const T = (jd - 2451545.0) / 36525; // Julian centuries from J2000.0
    const year = 2000 + T * 100;
    // Lahiri true ayanamsha approximation
    return 23.85 + (year - 2000) * (50.29 / 3600);
}

function sunTrueLongitude(jd: number) {
    const T = (jd - 2451545.0) / 36525;
    const L0 = normalizeAngle(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
    const M = normalizeAngle(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
    const Mrad = (Math.PI / 180) * M;
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
        (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
        0.000289 * Math.sin(3 * Mrad);
    return normalizeAngle(L0 + C);
}

function getGeocentricLongitude(jd: number, earth: any, planet: any) {
    const ePos = earth.position(jd);
    const R = ePos.range;
    const eFK5 = planetposition.toFK5(ePos.lon, ePos.lat, jd);
    const l0 = eFK5.lon;
    const b0 = eFK5.lat;
    const sl0 = Math.sin(l0), cl0 = Math.cos(l0);
    const sb0 = Math.sin(b0);
    let Δ = 0.5;
    let τ = (Δ / 173.1446327);
    let x = 0, y = 0, z = 0;

    const iterate = () => {
        const pPos = planet.position(jd - τ);
        const r = pPos.range;
        const pFK5 = planetposition.toFK5(pPos.lon, pPos.lat, jd);
        const l = pFK5.lon, b = pFK5.lat;
        const sb = Math.sin(b), cb = Math.cos(b);
        const sl = Math.sin(l), cl = Math.cos(l);
        x = r * cb * cl - R * cl0;
        y = r * cb * sl - R * sl0;
        z = r * sb - R * sb0;
        Δ = Math.sqrt(x * x + y * y + z * z);
        τ = Δ / 173.1446327;
    };
    iterate(); iterate();
    return normalizeAngle(Math.atan2(y, x) * 180 / Math.PI);
}

// Compute all astrological data based on exact Tamil Logic
export function getAstrologyData(dateString: string, lat: number, lng: number) {
    const dt = DateTime.fromISO(dateString);
    if (!dt.isValid) throw new Error('Invalid ISO datetime');

    let processingDt = dt;
    // Sunrise rule logic: Calculate sunrise for current calendar day
    const times = SunCalc.getTimes(processingDt.toJSDate(), lat, lng);
    const sunriseObj = DateTime.fromJSDate(times.sunrise);
    
    // If born before sunrise, Varam shifts to PREVIOUS day
    if (processingDt < sunriseObj) {
        processingDt = processingDt.minus({ days: 1 });
    }

    const jd = julian.DateToJD(dt.toJSDate());
    const ayanamsha = getAyanamsha(jd);

    // Planet Longitudes
    const sunEcl = sunTrueLongitude(jd);
    const siderealSun = normalizeAngle(sunEcl - ayanamsha);

    const moonPos = moonposition.position(jd);
    const moonEcl = moonPos.lon * 180 / Math.PI; // Fix radians to degrees!
    const siderealMoon = normalizeAngle(moonEcl - ayanamsha);

    const earth = new planetposition.Planet(data.vsop87Bearth);
    const makePlanet = (key: string, name: string) => {
        try {
            const planet = new planetposition.Planet(data[key]);
            const lon = getGeocentricLongitude(jd, earth, planet);
            return { name, longitude: normalizeAngle(lon - ayanamsha) };
        } catch { return { name, longitude: 0 }; }
    };

    const planets = [
        { name: 'Sun', longitude: siderealSun },
        { name: 'Moon', longitude: siderealMoon },
        makePlanet('vsop87Bmars', 'Mars'),
        makePlanet('vsop87Bmercury', 'Mercury'),
        makePlanet('vsop87Bjupiter', 'Jupiter'),
        makePlanet('vsop87Bvenus', 'Venus'),
        makePlanet('vsop87Bsaturn', 'Saturn')
    ];

    // Tithi
    let tithiVal = (siderealMoon - siderealSun) / 12;
    if (tithiVal < 0) tithiVal += 30;
    const tithiIndex = Math.floor(tithiVal) + 1;
    let tithiName;
    if (tithiIndex <= 15) {
        tithiName = `Shukla Paksha ${tithiIndex}`;
    } else {
        tithiName = `Krishna Paksha ${tithiIndex - 15}`;
    }

    // Nakshatram & Pada Calculation
    const degPerNak = 360 / 27; // 13.3333...
    const degPerPada = degPerNak / 4; // 3.3333...
    
    const nakshatraIndex = Math.floor(siderealMoon / degPerNak);
    const nakshatra = NAKSHATRAS[nakshatraIndex];
    
    // Precise Pada Calculation: (Degree into the current Nakshatra) / (Degree per Pada)
    const degIntoNak = siderealMoon % degPerNak;
    const pada = Math.ceil(degIntoNak / degPerPada) || 1; // Default to 1 if 0

    // Rasi (Moon Sign) - Each Rasi is exactly 30 degrees
    const rasiIndex = Math.floor(siderealMoon / 30);
    const rasi = RASIS[rasiIndex];

    // Tamil Year
    const baseYear = 1987; // Prabhava
    const currentYear = dt.year;
    // We adjust year change around mid-April (Chithirai 1st). Approximately April 14.
    let yearAdjustment = currentYear;
    if (dt.month < 4 || (dt.month === 4 && dt.day < 14)) {
        yearAdjustment -= 1;
    }
    const tamilYearIndex = ((yearAdjustment - baseYear) % 60 + 60) % 60;
    const tamilYear = TAMIL_YEARS[tamilYearIndex];

    // Tamil Month
    // Sun in Rasi -> Month.
    const monthIndex = Math.floor(siderealSun / 30);
    const tamilMonth = TAMIL_MONTHS[monthIndex];
    
    // Approximate date in month by seeing how many degrees Sun has passed in this Rasi
    const degreeInMonth = siderealSun % 30;
    const tamilDate = Math.floor(degreeInMonth) + 1;

    // Varam (Weekday) corresponding to `processingDt`
    const varamIndex = processingDt.weekday % 7; // luxon weekday 1-7 (1 is Monday, 7 is Sunday). Sun=0, Mon=1...
    // Adjust luxon weekday so Sun=0. luxon Sunday is 7.
    let jsWeekday = processingDt.weekday === 7 ? 0 : processingDt.weekday;
    const varam = DAYS[jsWeekday];

    // Yogam (Nitya Yoga)
    let yogamVal = (siderealSun + siderealMoon) / degPerNak;
    const yogamIndex = Math.floor(yogamVal % 27);
    const yogam = YOGAMS[yogamIndex];

    // Karanam (Half-Tithi)
    const totalHalfTithis = Math.floor(tithiVal * 2);
    let karanam;
    if (totalHalfTithis === 0) karanam = KARANAMS[10]; // Kintughna
    else if (totalHalfTithis >= 57) karanam = KARANAMS[totalHalfTithis - 50]; // 57=Shakuni, 58=Chatushpad, 59=Nag
    else {
        karanam = KARANAMS[(totalHalfTithis - 1) % 7];
    }

    // Ascendant (Lagnam)
    const calculateLagnamDet = () => {
        const T = (jd - 2451545.0) / 36525.0;
        const greenwichMeanSiderealTime = 280.46061837 + 360.98564736629 * (jd - 2451545.0);
        const localSiderealTime = normalizeAngle(greenwichMeanSiderealTime + lng);
        const epsilon = 23.439291 - 0.0130042 * T;
        const epsRad = epsilon * Math.PI / 180;
        const lstRad = localSiderealTime * Math.PI / 180;
        const latRad = lat * Math.PI / 180;
        let ascendantRad = Math.atan2(Math.cos(lstRad), -(Math.sin(lstRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad)));
        let tropicalAscendant = normalizeAngle(ascendantRad * 180 / Math.PI);
        return normalizeAngle(tropicalAscendant - ayanamsha);
    };
    const siderealAscendant = calculateLagnamDet();
    const lagnam = RASIS[Math.floor(siderealAscendant / 30)];

    return {
        panchangam: {
            tithi: tithiName,
            nakshatram: `${nakshatra} p${pada}`,
            rasi,
            lagnam,
            yogam,
            karanam,
            varam,
            tamilYear,
            tamilMonth: `${tamilMonth} ${tamilDate}`,
        },
        planets,
    };
}
