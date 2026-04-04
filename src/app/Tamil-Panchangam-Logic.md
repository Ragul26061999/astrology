Astrology Platform: Tamil Panchangam Logic Specification
🛠️ 1. Core Metadata
🏗️ 2. The 5 Attributes (Panchangam) Logic
A. Tithi (Lunar Day)
Definition: The angular distance between the Sun and the Moon.

Formula: (Moon_Longitude - Sun_Longitude) / 12

Logic: If the result is negative, add 360.

1–15: Shukla Paksha (Waxing)

16–30: Krishna Paksha (Waning)

B. Nakshatram (Birth Star)
Definition: The position of the Moon in the 27 divisions of the zodiac.

Formula: Moon_Longitude / 13°20'

Tamil Logic: Ensure the output uses Tamil nomenclature (e.g., Purva Phalguni → Pooram).

C. Yogam (Nitya Yoga)
Formula: (Sun_Longitude + Moon_Longitude) / 13°20'

Logic: There are 27 yogas (e.g., Vishkumbha to Vaidhriti).

D. Karanam (Half-Tithi)
Definition: One half of a Tithi (6 degrees).

Logic: There are 11 Karanas (4 fixed, 7 repeating).

E. Varam (Weekday)
Logic: Standard 24-hour day starting from Sunrise (not midnight).

Critical Edge Case: If birth is 04:45 AM and Sunrise is 05:45 AM, the Tamil Varam is still the previous day.

📅 3. Tamil Yearly Logic
🧮 4. Ascendant & Moon Sign (Lagna & Rasi)
Janma Rasi (Moon Sign)
The zodiac sign where the Moon is positioned at the time of birth.

30° per Sign: 0–30° Mesham, 30–60° Rishabam, etc.

Janma Lagnam (Ascendant)
The zodiac sign rising on the Eastern horizon at the birth moment.

Requirement: Requires high-precision Latitude, Longitude, and Local Mean Time (LMT).

🚀 5. Implementation Roadmap for Developers
Step 1: Input Validation
Step 2: API Call (Pseudo-code)
Step 3: UI Rendering
Use SVG to draw the square charts.

Apply Tailwind CSS for the grid layout of the Identity Card.

💡 6. Pro-Level Calculation Checklist
[ ] Sunrise Correction: Does the Varam change at Sunrise? (Essential for Tamil Astrology).

[ ] DST Check: Are you adjusting for Daylight Savings in international locations?

[ ] Ayanamsa Toggle: Can the user switch between Lahiri and KP?

[ ] Language Localization: Are all technical terms mapped to Tamil (e.g., Mesham instead of Aries)?



============================================================================


1. The 60 Tamil Year Cycle (Samvatsaras)Vedic astrology uses a 60-year repeating cycle. You will need this to map the birth year correctly (e.g., 1999 = Pramaathi).JSON{
  "tamil_years": [
    {"id": 1, "tamil": "பிரபவ", "transliteration": "Prabhava"},
    {"id": 2, "tamil": "விபவ", "transliteration": "Vibhava"},
    {"id": 13, "tamil": "பிரமாதி", "transliteration": "Pramaathi"}, 
    {"id": 10, "tamil": "தாது", "transliteration": "Dhaathu"},
    {"id": 60, "tamil": "அட்சய", "transliteration": "Akshaya"}
  ]
}
(Note: I've highlighted IDs 13 and 10, which represent the years for Ragul and Reshma respectively.)2. The 27 Nakshatrams (Stars)Each Nakshatra is divided into 4 Padas (Quarters). Your app logic must calculate the degree to determine the Tamil name.JSON{
  "nakshatrams": [
    {"id": 1, "tamil": "அஸ்வினி", "english": "Ashwini", "ruler": "Ketu"},
    {"id": 11, "tamil": "பூரம்", "english": "Purva Phalguni", "ruler": "Venus"},
    {"id": 17, "tamil": "அனுஷம்", "english": "Anuradha", "ruler": "Saturn"},
    {"id": 27, "tamil": "ரேவதி", "english": "Revati", "ruler": "Mercury"}
  ]
}

3. The 12 Tamil Months (Solar Months)The month is determined by which Rasi the Sun is currently transiting.Sun in RasiTamil MonthTransliterationMeshamசித்திரைChithiraiRishabamவைகாசிVaikasiMithunamஆனிAaniKatakamஆடிAadiSimmamஆவணிAvaniKanniபுரட்டாசிPurattasiThulamஐப்பசிAippasiViruchigamகார்த்திகைKarthigaiDhanusuமார்கழிMargazhiMakaramதைThaiKumbamமாசிMaasiMeenamபங்குனிPanguni🛠️ Developer Implementation TipWhen you receive the planetary positions from an API (like AstroSage or Swiss Ephemeris), the Sun's Longitude tells you the Month, and the Moon's Longitude tells you the Nakshatram and Rasi.Example Logic for Ragul:Input: June 26.API Result: Sun is at ~70° (Mithuna Rasi).Logic: if (Sun_Long > 60 && Sun_Long < 90) return months[2]; // Returns Aani