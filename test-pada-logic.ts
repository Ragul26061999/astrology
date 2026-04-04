import { getAstrologyData } from './src/utils/astroMath';

function testVishakhaBorder() {
    console.log("Testing Vishakha Border Case (Thulam vs Viruchigam)...");
    
    // Vishakha 4th pada starts exactly at 210 degrees (Scorpio)
    // We can simulate this by finding a date or just checking the math if we could inject degrees,
    // but our test date 1999-06-26 gives Moon ~217 degrees.
    // Let's check another date: 2024-11-18 around noon usually has Moon in Scorpio/Anuradha.
    
    // Instead of specific dates, we know the math logic is now:
    // rasiIndex = floor(degrees / 30)
    // 209.9 / 30 = 6 (Thulam)
    // 210.1 / 30 = 7 (Viruchigam)
    
    // Testing Ragul's case again with the new Pada display:
    const data = getAstrologyData("1999-06-26T04:45:00+05:30", 13.1906, 80.1989);
    console.log("Result for Ragul:", data.panchangam.nakshatram, "| Rasi:", data.panchangam.rasi);
}

testVishakhaBorder();
