# Project: Annam 2.0 - Astrological Matching Engine Architecture
**Document Type:** Core Logic & Workflow Specification
**Phase:** Initial Architecture & Data Modeling

---

## 1. User Data Collection Schema (The Input Phase)
To calculate a highly accurate Jathagam (horoscope) and perform matching, we need precise astronomical data. Do not rely on users knowing their Nakshatra or Rasi; calculate it from their birth details to ensure 100% accuracy.

### Core Required Fields (User Input):
* `full_name` (String): For UI display and reports.
* `gender` (Enum: MALE, FEMALE): Crucial because 10 Porutham logic strictly compares the Boy's star against the Girl's star (the math changes depending on the gender).
* `date_of_birth` (Date - DD/MM/YYYY): For planetary positions.
* `time_of_birth` (Time - HH:MM:SS): **Critical.** Even a 5-minute difference can change the Lagnam or Nakshatra Pada.
* `place_of_birth_city` (String): Used to fetch coordinates.
* `place_of_birth_lat` (Float): Latitude (Fetched via Geocoding API in the background).
* `place_of_birth_lng` (Float): Longitude (Fetched via Geocoding API).
* `timezone` (String): E.g., 'Asia/Kolkata'. Necessary for UTC conversion.

### System-Generated Fields (Calculated via Ephemeris/Astrology API):
* `rasi` (Moon Sign): The zodiac sign where the Moon was placed.
* `nakshatra` (Birth Star): One of the 27 stars.
* `nakshatra_pada` (Quarter): 1 to 4.
* `lagnam` (Ascendant): The rising sign at the exact time of birth.
* `dosham_status` (Boolean): Chevvai (Mars) or Rahu/Ketu dosham presence.

---

## 2. The "10 Porutham" Logic Engine (The Match Phase)
The 10 Porutham system (Dasakoota) is a mathematical lookup table. The fundamental rule: **Always count from the Girl's Nakshatra to the Boy's Nakshatra.**

### The 10 Matches & Their Logic:
1.  **Dina Porutham (Health & Longevity):**
    * *Logic:* Count the stars from the girl to the boy. Divide by 9.
    * *Match:* If the remainder is 2, 4, 6, 8, or 0, it is a match.
2.  **Gana Porutham (Temperament):**
    * *Logic:* Stars are categorized into Deva, Manushya, and Rakshasa Ganas.
    * *Match:* Deva + Deva = Match. Deva + Manushya = Average. Rakshasa + Rakshasa = Match. Rakshasa + Deva/Manushya = Mismatch.
3.  **Mahendra Porutham (Wealth & Progeny):**
    * *Logic:* Count from girl to boy.
    * *Match:* If the count is 4, 7, 10, 13, 16, 19, 22, 25, it is a match.
4.  **Sthree Dheerkam (Prosperity):**
    * *Logic:* Distance between the stars.
    * *Match:* If the boy's star is more than 13 stars away from the girl's, it's an excellent match. 7 to 13 is average.
5.  **Yoni Porutham (Physical Compatibility):**
    * *Logic:* Each star is assigned an animal.
    * *Match:* Animals must not be natural enemies (e.g., Cow & Tiger, Snake & Mongoose are mismatches).
6.  **Rasi Porutham (Lineage/Family Expansion):**
    * *Logic:* Based on the Moon sign.
    * *Match:* Boy's Rasi should ideally be more than 6 signs away from the Girl's.
7.  **Rasi Athipathi (Friendship between couple):**
    * *Logic:* The planetary lords of the two Rasis.
    * *Match:* If the lords are friends or the same planet, it's a match. If enemies (e.g., Sun and Saturn), it fails.
8.  **Vasya Porutham (Mutual Attraction):**
    * *Logic:* Specific Rasis have magnetic attraction to others.
    * *Match:* E.g., Leo is Vasya to Scorpio. (Strict lookup table required).
9.  **Rajju Porutham (Husband's Longevity - **CRITICAL**):**
    * *Logic:* Stars are grouped into 5 body parts (Head, Neck, Stomach, Thigh, Foot).
    * *Match:* The boy and girl **MUST NOT** belong to the same Rajju (body part). If they do, the match is universally rejected, even if the score is 9/10.
10. **Vedha Porutham (Absence of Afflictions):**
    * *Logic:* Certain stars naturally repel each other.
    * *Match:* E.g., Aswini and Jyeshta are Vedha. They cannot be paired.

### Implementation Strategy for Logic:
Do not write custom algorithms for planetary movements. 
1. Use the **Swiss Ephemeris library** (available in Node.js, Python, Java) OR an established API like **AstrologyAPI.com** to convert Date/Time/Location into the exact Nakshatra and Rasi.
2. Build a static JSON mapping file for the 10 Porutham rules. When User A (Girl) and User B (Boy) are selected, run a function that compares their generated JSON profiles against the 10 rules, returning a score out of 10.

---

## 3. The 100% Accurate Working Flow (Architecture Plan)

To ensure this application handles complex state and logic smoothly, a robust stack like Next.js/React for the frontend and a solid backend (Node.js/Java) is highly recommended.

### Phase 1: User Onboarding & Chart Generation
1. **Frontend:** User lands on the profile creation page. Enters DOB, TOB, and City.
2. **Backend:** Geocoding API converts City to Lat/Lng.
3. **Astrology Engine:** Lat/Lng, DOB, and TOB are passed to the Ephemeris tool.
4. **Database:** The calculated Nakshatra, Rasi, and Lagnam are saved to the user's profile in the database (PostgreSQL/MongoDB).

### Phase 2: The Matching Queue
1. **Frontend:** User initiates a "Find Matches" request.
2. **Backend Query:** The database filters potential partners based on basic preferences (Age, Religion, Caste, etc.).
3. **The Filter:** The server runs the `Rajju Porutham` check first. If Rajju fails, that profile is immediately dropped from the results (saving processing power).
4. **The Scoring:** For the remaining profiles, the server calculates the remaining 9 Poruthams.
5. **Output:** Profiles are sorted by Score (e.g., 8/10, 7/10) and sent back to the frontend.

### Phase 3: Detailed Report Generation
1. **Frontend:** User clicks on a matched profile to see *why* they matched.
2. **UI Component:** A clean dashboard displays a 10-row table showing exactly which Poruthams matched and which failed, along with a final compatibility percentage.
3. **Dosham Check:** A final warning flag is displayed if one person has Chevvai Dosham (Manglik) and the other does not.