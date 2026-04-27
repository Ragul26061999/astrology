"use client";

import { useState, useEffect } from "react";
import { Download, Upload, Users, Activity, CheckCircle, XCircle, AlertTriangle, Filter, Search, UserPlus, MapPin, Clock, Calendar, X, Eye, Info, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getAstrologyData } from "@/utils/astroMath";

export default function MatchesPage() {
  const router = useRouter();

  // Navigation State
  const [activeModal, setActiveModal] = useState<"register" | "upload" | null>(null);
  
  // View State
  const [selectedMatchForDetails, setSelectedMatchForDetails] = useState<any | null>(null);

  // Upload State
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Registration Form State
  const [regForm, setRegForm] = useState({
    full_name: "",
    gender: "Male",
    date_of_birth: "",
    time_of_birth: "",
    place_of_birth_city: "",
    latitude: "",
    longitude: "",
    work: "",
    case: "",
    region: "",
    district: "",
    salary: "",
    other_country: "",
    dowry: "",
    business: "",
    photo: "",
    no_case: false,
    is_widow: false,
    no_dob: false,
    no_parent: false,
    siblings_count: 0,
    siblings_details: ""
  });
  const [registering, setRegistering] = useState(false);
  const [regMessage, setRegMessage] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Profiles State
  const [profiles, setProfiles] = useState<any[] /* eslint-disable-line @typescript-eslint/no-explicit-any */>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  
  // Selection State
  const [selectedGender, setSelectedGender] = useState<"male" | "female" | "">("");
  const [selectedProfileId, setSelectedProfileId] = useState("");
  
  const [matchLoading, setMatchLoading] = useState(false);
  const [matches, setMatches] = useState<any[] /* eslint-disable-line @typescript-eslint/no-explicit-any */>([]);
  const [pairingProfileId, setPairingProfileId] = useState<string | null>(null);

  // Filter State
  const [minScore, setMinScore] = useState<number>(0);
  const [minAge, setMinAge] = useState<number | "">("");
  const [maxAge, setMaxAge] = useState<number | "">("");
  const [filterRajju, setFilterRajju] = useState<boolean>(false);
  const [filterWork, setFilterWork] = useState<string>("");
  const [filterCase, setFilterCase] = useState<string>("");
  const [filterRegion, setFilterRegion] = useState<string>("");
  const [filterDistrict, setFilterDistrict] = useState<string>("");
  const [filterSalary, setFilterSalary] = useState<string>("");
  const [filterOtherCountry, setFilterOtherCountry] = useState<string>("");
  const [filterDowry, setFilterDowry] = useState<string>("");
  const [filterBusiness, setFilterBusiness] = useState<string>("");
  const [filterRasi, setFilterRasi] = useState<string>("");
  const [filterNakshatra, setFilterNakshatra] = useState<string>("");

  // Debounced Place to Lat/Lng calculation for Manual Registration
  useEffect(() => {
    if (!regForm.place_of_birth_city || regForm.place_of_birth_city.trim().length < 3) return;

    const timer = setTimeout(async () => {
      setIsGeocoding(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(regForm.place_of_birth_city)}&limit=1`);
        const results = await res.json();
        if (results && results.length > 0) {
          const { lat, lon } = results[0];
          setRegForm(prev => ({ 
            ...prev, 
            latitude: parseFloat(lat).toFixed(4), 
            longitude: parseFloat(lon).toFixed(4) 
          }));
        }
      } catch (err) {
        console.error("Geocoding failed:", err);
      } finally {
        setIsGeocoding(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [regForm.place_of_birth_city]);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoadingProfiles(true);
    try {
      const res = await fetch('/api/matches/profiles');
      const data = await res.json();
      if (data.success) {
        setProfiles(data.profiles);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProfiles(false);
    }
  };

  const boys = profiles.filter(p => p.gender.toLowerCase() === 'male');
  const girls = profiles.filter(p => p.gender.toLowerCase() === 'female');

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/matches/bulk-upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setUploadMessage("✅ " + data.message);
        setFile(null);
        fetchProfiles(); // refresh the list
        setTimeout(() => setActiveModal(null), 2000);
      } else {
        setUploadMessage("❌ Error: " + data.error);
      }
    } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      setUploadMessage("❌ Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleManualRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    setRegMessage("");

    try {
      const formData = new FormData();
      formData.append("full_name", regForm.full_name);
      formData.append("gender", regForm.gender);
      formData.append("date_of_birth", regForm.date_of_birth);
      formData.append("time_of_birth", regForm.time_of_birth);
      formData.append("place_of_birth_city", regForm.place_of_birth_city);
      formData.append("latitude", regForm.latitude);
      formData.append("longitude", regForm.longitude);
      formData.append("work", regForm.work);
      formData.append("case", regForm.case);
      formData.append("region", regForm.region);
      formData.append("district", regForm.district);
      formData.append("salary", regForm.salary);
      formData.append("other_country", regForm.other_country);
      formData.append("dowry", regForm.dowry);
      formData.append("business", regForm.business);
      if (photoFile) {
        formData.append("photo", photoFile);
      }
      formData.append("no_case", regForm.no_case.toString());
      formData.append("is_widow", regForm.is_widow.toString());
      formData.append("no_dob", regForm.no_dob.toString());
      formData.append("no_parent", regForm.no_parent.toString());
      formData.append("siblings_count", regForm.siblings_count.toString());
      formData.append("siblings_details", regForm.siblings_details);

      const res = await fetch("/api/matches/add-profile", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setRegMessage("✅ Profile registered successfully!");
        setRegForm({
          full_name: "",
          gender: "Male",
          date_of_birth: "",
          time_of_birth: "",
          place_of_birth_city: "",
          latitude: "",
          longitude: "",
          work: "",
          case: "",
          region: "",
          district: "",
          salary: "",
          other_country: "",
          dowry: "",
          business: "",
          photo: "",
          no_case: false,
          is_widow: false,
          no_dob: false,
          no_parent: false,
          siblings_count: 0,
          siblings_details: ""
        });
        setPhotoFile(null);
        fetchProfiles();
        setTimeout(() => setActiveModal(null), 2000);
      } else {
        setRegMessage("❌ Error: " + data.error);
      }
    } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      setRegMessage("❌ Registration failed: " + err.message);
    } finally {
      setRegistering(false);
    }
  };

  const fetchMatches = async (sourceId: string, gender: "male" | "female") => {
    if (!sourceId) return;
    setMatchLoading(true);
    setMatches([]);
    
    try {
      const res = await fetch("/api/matches/bulk-compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId,
          targetGender: gender === "male" ? "female" : "male"
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMatches(data.matches);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMatchLoading(false);
    }
  };

  const handleProfileSelect = (id: string, gender: "male" | "female") => {
    setSelectedGender(gender);
    setSelectedProfileId(id);
    if (id) {
        fetchMatches(id, gender);
    } else {
        setMatches([]);
    }
  };

  const pairCouple = async (targetId: string) => {
      if (!selectedProfileId || !targetId) return;
      
      const groomId = selectedGender === "male" ? selectedProfileId : targetId;
      const brideId = selectedGender === "female" ? selectedProfileId : targetId;
      
      setPairingProfileId(targetId);
      try {
          const res = await fetch("/api/matches/pairs", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ groom_id: groomId, bride_id: brideId })
          });
          const data = await res.json();
          if (data.success) {
              setMatches(matches.filter(m => m.targetProfile.id !== targetId));
              alert("Successfully paired! These profiles will no longer appear in future searches.");
              fetchProfiles(); // Refresh to remove the currently selected profile if it was closed
              router.push("/paired-profiles");
          } else {
              alert("Failed to pair: " + data.error);
          }
      } catch (err: any) {
          alert("Error: " + err.message);
      } finally {
          setPairingProfileId(null);
      }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const downloadSampleCsv = () => {
    const csvContent = "full_name,gender,date_of_birth,time_of_birth,place_of_birth_city,latitude,longitude,work,case,region,district,salary,other_country,dowry,business,photo\nJohn Doe,Male,1990-05-15,14:30,Chennai,13.0827,80.2707,Engineer,,,Chennai District,Chennai,100000,,,Business Owner,https://example.com/photo.jpg\nJane Smith,Female,1992-08-20,09:15,Madurai,9.9252,78.1198,Doctor,,,Madurai District,Madurai,150000,,,Hospital Owner,https://example.com/photo.jpg";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sample_users.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const exportMatchesData = () => {
    if (filteredMatches.length === 0) {
      alert("No matches to export!");
      return;
    }

    const selectedProfile = profiles.find(p => p.id === selectedProfileId);
    const sourceName = selectedProfile?.full_name || "Unknown";
    const timestamp = new Date().toISOString().split('T')[0];

    // CSV Header
    const headers = [
      "Match Number",
      "Source Profile",
      "Target Name",
      "Target Gender",
      "Target Age",
      "Target Birth Date",
      "Target Birth Time",
      "Target Birth Place",
      "Target Rasi",
      "Target Nakshatra",
      "Target Nakshatra Pada",
      "Target Lagnam",
      "Target Work",
      "Target Case",
      "Target Region",
      "Target District",
      "Target Salary",
      "Target Other Country",
      "Target Dowry",
      "Target Business",
      "Compatibility Score",
      "Rajju Status",
      "Dina Porutham",
      "Gana Porutham",
      "Mahendra Porutham",
      "Stree Deergha Porutham",
      "Yoni Porutham",
      "Rasi Porutham",
      "Rasi Athipathi Porutham",
      "Vasiya Porutham",
      "Rajju Porutham",
      "Vedha Porutham",
      "Nadi Porutham"
    ].join(",");

    // CSV Rows
    const rows = filteredMatches.map((m, index) => {
      const target = m.targetProfile;
      const age = target.age || calculateAge(target.date_of_birth || target.birth_date);
      
      // Get porutham details - show Passed/Failed like in the image
      const getPoruthamStatus = (name: string) => {
        const p = m.poruthams.find((p: any) => p.name === name);
        if (!p) return "N/A";
        return p.matched ? "Passed" : "Failed";
      };

      return [
        index + 1,
        sourceName,
        target.full_name || "",
        target.gender || "",
        age || "",
        target.date_of_birth || target.birth_date || "",
        target.time_of_birth || target.birth_time || "",
        target.place_of_birth_city || target.birth_place || "",
        target.rasi || "",
        target.nakshatram || "",
        target.nakshatra_pada || "",
        target.lagnam || "",
        target.work || "",
        target.case || "",
        target.region || "",
        target.district || "",
        target.salary || "",
        target.other_country || "",
        target.dowry || "",
        target.business || "",
        m.score || "0",
        m.rajjuFailed ? "Failed" : "Passed",
        getPoruthamStatus("Dina"),
        getPoruthamStatus("Gana"),
        getPoruthamStatus("Mahendra"),
        getPoruthamStatus("Stree Deergha"),
        getPoruthamStatus("Yoni"),
        getPoruthamStatus("Rasi"),
        getPoruthamStatus("Rasi Athipathi"),
        getPoruthamStatus("Vasiya"),
        getPoruthamStatus("Rajju"),
        getPoruthamStatus("Vedha"),
        getPoruthamStatus("Nadi")
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(",");
    });

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `matches_export_${sourceName}_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const exportMatchesPDF = async () => {
    if (filteredMatches.length === 0) {
      alert("No matches to export!");
      return;
    }

    const selectedProfile = profiles.find(p => p.id === selectedProfileId);
    const sourceName = selectedProfile?.full_name || "Unknown";
    const timestamp = new Date().toISOString().split('T')[0];

    // Create PDF instance
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Add each match as a separate page
    for (let i = 0; i < filteredMatches.length; i++) {
      const m = filteredMatches[i];
      const target = m.targetProfile;
      const age = target.age || calculateAge(target.date_of_birth || target.birth_date);

      // Add new page (except for first match)
      if (i > 0) {
        pdf.addPage();
      }

      // Match Number
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Match #${i + 1} of ${filteredMatches.length}`, pageWidth / 2, 20, { align: 'center' });

      // Photos Section
      let currentY = 30;
      const imgWidth = 40;
      const imgHeight = 50;

      // Helper for adding images to PDF
      const addProfileImage = (url: string | null, x: number, y: number, w: number, h: number) => {
          if (url) {
              try {
                  pdf.addImage(url, 'JPEG', x, y, w, h);
              } catch (e) {
                  pdf.setFillColor(240, 240, 240);
                  pdf.rect(x, y, w, h, 'F');
              }
              pdf.setDrawColor(200, 200, 200);
              pdf.rect(x, y, w, h, 'S');
          } else {
              pdf.setFillColor(240, 240, 240);
              pdf.rect(x, y, w, h, 'F');
              pdf.setDrawColor(200, 200, 200);
              pdf.rect(x, y, w, h, 'S');
          }
      };

      // Source Profile Photo
      addProfileImage(selectedProfile?.photo || null, 25, currentY, imgWidth, imgHeight);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text(sourceName, 45, currentY + imgHeight + 8, { align: 'center' });
      const seekerLabel = selectedGender === 'male' ? '(Groom)' : '(Bride)';
      pdf.text(seekerLabel, 45, currentY + imgHeight + 12, { align: 'center' });

      // Target Profile Photo
      addProfileImage(target.photo || null, pageWidth - 25 - imgWidth, currentY, imgWidth, imgHeight);
      pdf.text(target.full_name || 'Unknown', pageWidth - 45, currentY + imgHeight + 8, { align: 'center' });
      const matchLabel = selectedGender === 'male' ? '(Bride)' : '(Groom)';
      pdf.text(matchLabel, pageWidth - 45, currentY + imgHeight + 12, { align: 'center' });

      // Compatibility Score Section
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Compatibility Score', pageWidth / 2, currentY + 18, { align: 'center' });
 
      const scoreColor = m.score >= 5 && !m.rajjuFailed ? [34, 197, 94] : [245, 158, 11]; // Green or Amber
      pdf.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      pdf.rect(pageWidth / 2 - 20, currentY + 22, 40, 15, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${m.score}/10`, pageWidth / 2, currentY + 32, { align: 'center' });
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      currentY += imgHeight + 25;

      // Unified Intelligence Box (Demographics + Astrology)
      pdf.setFillColor(245, 245, 245);
      pdf.rect(20, currentY, pageWidth - 40, 175, 'F');
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(20, currentY, pageWidth - 40, 175, 'S');

      // 1. Demographics Header
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Comprehensive Seeker Intelligence', 30, currentY + 12);

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      
      const details = [
        `Name: ${target.full_name || 'N/A'}`,
        `Age: ${age || 'N/A'}`,
        `Gender: ${target.gender || 'N/A'}`,
        `Status: ${target.is_widow ? 'Widow' : 'Never Married'}`,
        `Birth Date: ${target.date_of_birth || target.birth_date || 'N/A'}`,
        `Birth Place: ${target.place_of_birth_city || target.birth_place || 'N/A'}`,
        `Work: ${target.work || 'N/A'}`,
        `Salary: ${target.salary || 'N/A'}`,
        `Business: ${target.business || 'N/A'}`,
        `Region: ${target.region || 'N/A'}`,
        `District: ${target.district || 'N/A'}`,
        `Country: ${target.other_country || 'N/A'}`,
        `Parent: ${target.no_parent ? 'No Parent' : 'Available'}`,
        `Case: ${target.no_case ? 'No Case' : (target.case || 'Reported')}`,
        `Siblings: ${target.siblings_count || 0}`,
        `Dowry: ${target.dowry || 'N/A'}`
      ];

      details.forEach((detail, index) => {
        const x = (index % 2 === 0) ? 30 : pageWidth / 2 + 5;
        const row = Math.floor(index / 2);
        const y = currentY + 22 + (row * 8);
        pdf.text(detail, x, y);
      });

      if (target.siblings_details) {
          pdf.setFontSize(7);
          pdf.text(`Siblings Details: ${target.siblings_details}`, 30, currentY + 92, { maxWidth: pageWidth - 60 });
      }

      // 2. Astrology Sub-Header
      const astroY = currentY + 105;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Sacred Astrological Alignment (Panchangam)', 30, astroY);

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      
      let fullAstro: any = null;
      if (target.birth_date && target.birth_time && target.latitude && target.longitude) {
          try {
              const timeStr = target.birth_time.split(':').length === 2 ? `${target.birth_time}:00` : target.birth_time;
              fullAstro = getAstrologyData(`${target.birth_date}T${timeStr}+05:30`, target.latitude, target.longitude);
          } catch (e) { console.error("Astro calc failed", e); }
      }

      const p = fullAstro?.panchangam;
      const astroDetails = [
        `Rasi: ${target.rasi || 'N/A'}`,
        `Nakshatram: ${target.nakshatram || 'N/A'}`,
        `Nakshatra Pada: ${target.nakshatra_pada || 'N/A'}`,
        `Lagnam: ${target.lagnam || 'N/A'}`,
        `Tithi: ${p?.tithi || 'N/A'}`,
        `Yogam: ${p?.yogam || 'N/A'}`,
        `Karanam: ${p?.karanam || 'N/A'}`,
        `Varam: ${p?.varam || 'N/A'}`,
        `Tamil Year: ${p?.tamilYear || 'N/A'}`,
        `Tamil Month: ${p?.tamilMonth || 'N/A'}`
      ];

      astroDetails.forEach((detail, index) => {
        // Remove text in brackets () or after dashes - (Tamil scripts/symbols) for cleaner PDF
        const cleanDetail = detail.replace(/\s*\(.*?\)\s*/g, ' ').split(' - ')[0].trim();
        const x = 30;
        const y = astroY + 10 + (index * 6);
        pdf.text(cleanDetail, x, y);
      });

      currentY += 185;

      // Porutham Results
      pdf.setFillColor(245, 245, 245);
      pdf.rect(20, currentY, pageWidth - 40, 80, 'F');
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(20, currentY, pageWidth - 40, 80, 'S');

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Porutham Results', 30, currentY + 15);

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');

      const getPoruthamStatus = (name: string) => {
        const p = m.poruthams.find((p: any) => p.name === name);
        if (!p) return "N/A";
        return p.matched ? "Passed" : "Failed";
      };

      const poruthams = [
        { name: 'Dina', status: getPoruthamStatus('Dina') },
        { name: 'Gana', status: getPoruthamStatus('Gana') },
        { name: 'Mahendra', status: getPoruthamStatus('Mahendra') },
        { name: 'Stree Deergha', status: getPoruthamStatus('Stree Deergha') },
        { name: 'Yoni', status: getPoruthamStatus('Yoni') },
        { name: 'Rasi', status: getPoruthamStatus('Rasi') },
        { name: 'Rasi Athipathi', status: getPoruthamStatus('Rasi Athipathi') },
        { name: 'Vasiya', status: getPoruthamStatus('Vasiya') },
        { name: 'Rajju', status: m.rajjuFailed ? 'Failed' : 'Passed' },
        { name: 'Vedha', status: getPoruthamStatus('Vedha') },
        { name: 'Nadi', status: getPoruthamStatus('Nadi') }
      ];

      poruthams.forEach((porutham, index) => {
        const x = index < 6 ? 30 : pageWidth / 2 + 10;
        const y = currentY + 25 + ((index % 6) * 8);
        
        // Color code the status
        if (porutham.status === 'Passed') {
          pdf.setTextColor(34, 197, 94); // Green
        } else if (porutham.status === 'Failed') {
          pdf.setTextColor(239, 68, 68); // Red
        } else {
          pdf.setTextColor(107, 114, 128); // Gray
        }
        
        pdf.text(`${porutham.name}: ${porutham.status}`, x, y);
      });

      // Reset text color
      pdf.setTextColor(0, 0, 0);

      // Footer removed as requested
    }

    // Save the PDF
    pdf.save(`matches_report_${sourceName}_${timestamp}.pdf`);
  };

  const filteredMatches = matches.filter(m => {
      let pass = true;
      if (minScore > 0 && m.score < minScore) pass = false;
      const age = m.targetProfile.age || calculateAge(m.targetProfile.date_of_birth || m.targetProfile.birth_date);
      if (minAge !== "" && age < minAge) pass = false;
      if (maxAge !== "" && age > maxAge) pass = false;
      if (filterRajju && m.rajjuFailed) pass = false;
      if (filterWork && m.targetProfile.work && !m.targetProfile.work.toLowerCase().includes(filterWork.toLowerCase())) pass = false;
      if (filterCase && m.targetProfile.case && !m.targetProfile.case.toLowerCase().includes(filterCase.toLowerCase())) pass = false;
      if (filterRegion && m.targetProfile.region && !m.targetProfile.region.toLowerCase().includes(filterRegion.toLowerCase())) pass = false;
      if (filterDistrict && m.targetProfile.district && !m.targetProfile.district.toLowerCase().includes(filterDistrict.toLowerCase())) pass = false;
      if (filterSalary && m.targetProfile.salary && !m.targetProfile.salary.toLowerCase().includes(filterSalary.toLowerCase())) pass = false;
      if (filterOtherCountry && m.targetProfile.other_country && !m.targetProfile.other_country.toLowerCase().includes(filterOtherCountry.toLowerCase())) pass = false;
      if (filterDowry && m.targetProfile.dowry && !m.targetProfile.dowry.toLowerCase().includes(filterDowry.toLowerCase())) pass = false;
      if (filterBusiness && m.targetProfile.business && !m.targetProfile.business.toLowerCase().includes(filterBusiness.toLowerCase())) pass = false;
      if (filterRasi && m.targetProfile.rasi && !m.targetProfile.rasi.toLowerCase().includes(filterRasi.toLowerCase())) pass = false;
      if (filterNakshatra && m.targetProfile.nakshatram && !m.targetProfile.nakshatram.toLowerCase().includes(filterNakshatra.toLowerCase())) pass = false;
      return pass;
  });

  return (
    <AppShell>
      <div className="relative min-h-screen text-stone-900 p-4 md:pt-4 md:px-8 md:pb-8 font-sans overflow-x-hidden">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="flex flex-col lg:flex-row justify-between items-center bg-white/90 backdrop-blur-md p-6 md:px-10 rounded-3xl border border-amber-200 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 blur-[120px] -z-10 group-hover:bg-amber-500/10 transition-all"></div>
              <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left mb-6 lg:mb-0">
                  <div className="bg-amber-100 p-3 rounded-2xl border border-amber-200 shadow-inner group-hover:rotate-12 transition-transform duration-500">
                      <Star size={32} className="text-amber-700 animate-pulse" />
                  </div>
                  <div className="space-y-1 leading-tight">
                    <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-800 to-orange-800 tracking-tighter italic">
                      COSMIC MATCH ENGINE
                    </h1>
                    <p className="text-stone-500 font-black uppercase tracking-[0.2em] text-[8px] flex items-center justify-center md:justify-start gap-4">
                        <span className="w-6 h-px bg-amber-200"></span>
                        10 Porutham Analysis & Demographic Intelligence
                        <span className="w-6 h-px bg-amber-200"></span>
                    </p>
                  </div>
              </div>

              <div className="flex gap-3">
                   <button 
                    onClick={() => router.push("profiles")}
                    className="group bg-stone-100 hover:bg-amber-600 hover:text-white px-5 py-3 rounded-2xl border border-stone-200 transition-all flex items-center gap-2 font-black shadow-sm"
                  >
                        <Users size={18} className="transition-transform group-hover:scale-110" />
                        Profile
                  </button>
                  <button 
                    onClick={() => setActiveModal("register")}
                    className="group bg-stone-100 hover:bg-amber-600 hover:text-white px-5 py-3 rounded-2xl border border-stone-200 transition-all flex items-center gap-2 font-black shadow-sm"
                  >
                        <UserPlus size={18} className="transition-transform group-hover:scale-110" />
                        Add Profile
                  </button>
                  <button 
                    onClick={() => setActiveModal("upload")}
                    className="group bg-stone-100 hover:bg-amber-600 hover:text-white px-5 py-3 rounded-2xl border border-stone-200 transition-all flex items-center gap-2 font-black shadow-sm"
                  >
                        <Upload size={18} className="transition-transform group-hover:scale-110" />
                        Bulk Import
                  </button>
              </div>
          </header>

          <section className="space-y-8 animate-in fade-in duration-700">
                <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-10 shadow-xl max-w-4xl mx-auto relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="text-center mb-8 relative">
                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block border border-amber-200">Check Compatibility</span>
                        <h2 className="text-xl font-black text-stone-800">Select Seekers</h2>
                        <p className="text-sm text-stone-500 mt-2 font-medium">Discover celestial alignment across our database of registered seekers.</p>
                    </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative">
                    {/* Boy Selection */}
                    <div className="space-y-4 relative">
                      <label className="text-[10px] uppercase tracking-widest font-black text-amber-500 flex items-center gap-2 px-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span> Groom Selection
                      </label>
                      <select 
                        value={selectedGender === "male" ? selectedProfileId : ""} 
                        onChange={(e) => handleProfileSelect(e.target.value, "male")}
                        className="w-full bg-stone-50 border border-stone-200 focus:border-amber-500/50 rounded-2xl px-5 py-4 text-stone-900 outline-none transition-all shadow-inner focus:shadow-[0_0_20px_-10px_rgba(245,158,11,0.2)] font-bold"
                      >
                        <option value="">Choose Groom Profile</option>
                        {boys.map(b => <option key={b.id} value={b.id}>{b.full_name} ({b.nakshatram} - {b.rasi})</option>)}
                      </select>
                      {selectedGender === "female" && selectedProfileId && (
                           <div className="absolute inset-0 bg-white/90 backdrop-blur-[4px] rounded-2xl flex flex-col items-center justify-center z-10 border border-stone-200">
                               <p className="text-amber-700 text-[10px] font-black tracking-widest uppercase mb-1">Searching Mode</p>
                               <p className="text-stone-500 text-xs font-black">Finding Brides Match</p>
                           </div>
                      )}
                    </div>

                    {/* Girl Selection */}
                    <div className="space-y-4 relative">
                      <label className="text-[10px] uppercase tracking-widest font-black text-orange-500 flex items-center gap-2 px-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"></span> Bride Selection
                      </label>
                      <select 
                        value={selectedGender === "female" ? selectedProfileId : ""} 
                        onChange={(e) => handleProfileSelect(e.target.value, "female")}
                        className="w-full bg-stone-50 border border-stone-200 focus:border-orange-500/50 rounded-2xl px-5 py-4 text-stone-900 outline-none transition-all shadow-inner focus:shadow-[0_0_20px_-10px_rgba(249,115,22,0.2)] font-bold"
                      >
                        <option value="">Choose Bride Profile</option>
                        {girls.map(g => <option key={g.id} value={g.id}>{g.full_name} ({g.nakshatram} - {g.rasi})</option>)}
                      </select>
                      {selectedGender === "male" && selectedProfileId && matchLoading && (
                           <div className="absolute inset-0 bg-white/90 backdrop-blur-[4px] rounded-2xl flex flex-col items-center justify-center z-10 border border-stone-200">
                               <p className="text-orange-700 text-[10px] font-black tracking-widest uppercase mb-1">Searching Mode</p>
                               <p className="text-stone-500 text-xs font-black">Finding Grooms Match</p>
                           </div>
                      )}
                    </div>
                  </div>
                </div>

                {matchLoading && (
                    <div className="flex flex-col justify-center items-center py-20 bg-slate-900/20 rounded-[3rem] border border-white/5">
                        <div className="relative">
                            <div className="size-20 rounded-full border-t-2 border-amber-500 animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Activity className="text-amber-500 size-8 animate-pulse" />
                            </div>
                        </div>
                        <p className="mt-6 text-slate-400 font-bold tracking-widest uppercase text-xs animate-pulse">Scanning Galaxy for Matches...</p>
                    </div>
                )}

                {/* Filters & Results View */}
                {!matchLoading && selectedProfileId && (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 max-w-6xl mx-auto pb-20">
                    
                    {/* Filters */}
                    <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 blur-[50px] -z-10"></div>
                        <div className="flex items-center gap-3 text-stone-700 mb-6">
                            <div className="bg-stone-100 p-2 rounded-xl border border-stone-200">
                                <Filter size={18} className="text-amber-600" />
                            </div>
                            <span className="font-black uppercase tracking-widest text-xs">Advanced Search Intelligence</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 mb-8">
                            {/* Basic Filters */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black uppercase tracking-widest text-stone-400 px-1">Min Score</label>
                                <input 
                                   type="number" 
                                   min="0" max="10" 
                                   value={minScore} 
                                   onChange={e => setMinScore(Number(e.target.value))}
                                   className="w-full bg-stone-100/50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 outline-none font-bold text-sm focus:border-amber-500/30 transition-all"
                                   placeholder="0"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black uppercase tracking-widest text-stone-400 px-1">Age Range</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                       type="number" 
                                       placeholder="Min"
                                       value={minAge} 
                                       onChange={e => setMinAge(e.target.value === "" ? "" : Number(e.target.value))}
                                       className="w-1/2 bg-stone-100/50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 outline-none font-bold text-sm focus:border-amber-500/30 transition-all"
                                    />
                                    <span className="text-stone-300 font-bold">-</span>
                                    <input 
                                       type="number" 
                                       placeholder="Max"
                                       value={maxAge} 
                                       onChange={e => setMaxAge(e.target.value === "" ? "" : Number(e.target.value))}
                                       className="w-1/2 bg-stone-100/50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 outline-none font-bold text-sm focus:border-amber-500/30 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black uppercase tracking-widest text-stone-400 px-1">Work</label>
                                <input 
                                   type="text" 
                                   placeholder="Filter work"
                                   value={filterWork} 
                                   onChange={e => setFilterWork(e.target.value)}
                                   className="w-full bg-stone-100/50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 outline-none font-bold text-sm focus:border-amber-500/30 transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black uppercase tracking-widest text-stone-400 px-1">Case</label>
                                <input 
                                   type="text" 
                                   placeholder="Filter case"
                                   value={filterCase} 
                                   onChange={e => setFilterCase(e.target.value)}
                                   className="w-full bg-stone-100/50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 outline-none font-bold text-sm focus:border-amber-500/30 transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black uppercase tracking-widest text-stone-400 px-1">Region</label>
                                <input 
                                   type="text" 
                                   placeholder="Filter region"
                                   value={filterRegion} 
                                   onChange={e => setFilterRegion(e.target.value)}
                                   className="w-full bg-stone-100/50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 outline-none font-bold text-sm focus:border-amber-500/30 transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black uppercase tracking-widest text-stone-400 px-1">District</label>
                                <input 
                                   type="text" 
                                   placeholder="Filter district"
                                   value={filterDistrict} 
                                   onChange={e => setFilterDistrict(e.target.value)}
                                   className="w-full bg-stone-100/50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 outline-none font-bold text-sm focus:border-amber-500/30 transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black uppercase tracking-widest text-stone-400 px-1">Salary</label>
                                <input 
                                   type="text" 
                                   placeholder="Filter salary"
                                   value={filterSalary} 
                                   onChange={e => setFilterSalary(e.target.value)}
                                   className="w-full bg-stone-100/50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 outline-none font-bold text-sm focus:border-amber-500/30 transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black uppercase tracking-widest text-stone-400 px-1">Other Country</label>
                                <input 
                                   type="text" 
                                   placeholder="Filter count"
                                   value={filterOtherCountry} 
                                   onChange={e => setFilterOtherCountry(e.target.value)}
                                   className="w-full bg-stone-100/50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 outline-none font-bold text-sm focus:border-amber-500/30 transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black uppercase tracking-widest text-stone-400 px-1">Dowry</label>
                                <input 
                                   type="text" 
                                   placeholder="Filter dowry"
                                   value={filterDowry} 
                                   onChange={e => setFilterDowry(e.target.value)}
                                   className="w-full bg-stone-100/50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 outline-none font-bold text-sm focus:border-amber-500/30 transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black uppercase tracking-widest text-stone-400 px-1">Business</label>
                                <input 
                                   type="text" 
                                   placeholder="Filter business"
                                   value={filterBusiness} 
                                   onChange={e => setFilterBusiness(e.target.value)}
                                   className="w-full bg-stone-100/50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 outline-none font-bold text-sm focus:border-amber-500/30 transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black uppercase tracking-widest text-stone-400 px-1">Rasi</label>
                                <input 
                                   type="text" 
                                   placeholder="Filter rasi"
                                   value={filterRasi} 
                                   onChange={e => setFilterRasi(e.target.value)}
                                   className="w-full bg-stone-100/50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 outline-none font-bold text-sm focus:border-amber-500/30 transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black uppercase tracking-widest text-stone-400 px-1">Nakshatra</label>
                                <input 
                                   type="text" 
                                   placeholder="Filter star"
                                   value={filterNakshatra} 
                                   onChange={e => setFilterNakshatra(e.target.value)}
                                   className="w-full bg-stone-100/50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 outline-none font-bold text-sm focus:border-amber-500/30 transition-all"
                                />
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 justify-between">
                            <div className="flex flex-wrap gap-3">
                                <label className="group flex items-center gap-3 cursor-pointer text-[10px] font-black uppercase tracking-widest text-stone-700 bg-stone-50 px-4 py-2 border border-stone-200 rounded-2xl hover:bg-stone-100 transition-all shadow-inner">
                                    <input 
                                       type="checkbox" 
                                       checked={filterRajju} 
                                       onChange={e => setFilterRajju(e.target.checked)}
                                       className="accent-amber-600 w-4 h-4 rounded"
                                    />
                                    Hide Rajju Failed
                                </label>
                                

                                
                                <button
                                    onClick={exportMatchesPDF}
                                    disabled={filteredMatches.length === 0}
                                    className="group flex items-center gap-2 bg-purple-50 hover:bg-purple-100 disabled:bg-stone-100 disabled:text-stone-400 text-purple-700 px-4 py-2 border border-purple-200 disabled:border-stone-200 rounded-2xl transition-all shadow-inner text-[10px] font-black uppercase tracking-widest"
                                >
                                    <Download size={14} className="group-hover:scale-110 transition-transform" />
                                    Export PDF
                                </button>
                            </div>
                            
                            <div className="bg-amber-100 px-6 py-3 rounded-2xl border border-amber-200 flex flex-col items-center min-w-[100px]">
                                <span className="text-[9px] text-amber-700 font-black uppercase tracking-widest leading-none">Potential</span>
                                <span className="text-xl font-black text-amber-600 leading-tight">{filteredMatches.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Results List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {filteredMatches.length === 0 ? (
                            <div className="col-span-full py-24 text-center bg-slate-950/30 rounded-[3rem] border border-white/5 border-dashed">
                                <Search className="mx-auto size-16 text-slate-800 mb-4" />
                                <h3 className="text-2xl font-black text-slate-400">Zero Alignment Found</h3>
                                <p className="text-slate-600 mt-2 font-medium">Try recalibrating your cosmic filters.</p>
                            </div>
                        ) : (
                            filteredMatches.map((m, idx) => {
                                const target = m.targetProfile;
                                return (
                                <motion.div 
                                  initial={{ opacity: 0, y: 20 }} 
                                  animate={{ opacity: 1, y: 0 }} 
                                  transition={{ delay: idx * 0.05 }}
                                  key={target.id} 
                                  className={`group bg-white border ${m.rajjuFailed ? 'border-red-200' : 'border-stone-200 hover:border-amber-400'} rounded-[2.5rem] overflow-hidden shadow-lg transition-all hover:-translate-y-1`}
                                >
                                    <div className={`p-6 flex justify-between items-start ${m.rajjuFailed ? 'bg-red-50' : 'bg-stone-50'} border-b border-stone-100`}>
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-black text-stone-900 tracking-tight">{target.full_name}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">{target.place_of_birth_city}</span>
                                                <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Age: {target.age || calculateAge(target.date_of_birth || target.birth_date)}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="bg-white px-4 py-2 rounded-2xl border border-stone-200 flex flex-col items-center shadow-sm">
                                                <span className="text-[8px] text-stone-500 font-black uppercase tracking-widest mb-1">Compatibility</span>
                                                <span className={`text-2xl font-black leading-none ${m.score >= 5 && !m.rajjuFailed ? 'text-emerald-600' : 'text-amber-600'}`}>{m.score}/10</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 grid grid-cols-2 gap-6 relative">
                                        <div className="absolute inset-0 bg-stone-50/10 -z-10"></div>
                                        <div>
                                            <p className="text-[8px] text-stone-500 font-black uppercase tracking-[0.2em] mb-2">Constellation (Star)</p>
                                            <p className="text-sm font-bold text-stone-800 line-clamp-1">{target.nakshatram}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] text-stone-500 font-black uppercase tracking-[0.2em] mb-2">Lunar Realm (Rasi)</p>
                                            <p className="text-sm font-bold text-stone-800 line-clamp-1">{target.rasi}</p>
                                        </div>
                                    </div>
                                    <div className="px-6 pb-6 space-y-4">
                                         <div className="flex flex-wrap gap-1.5 p-3 bg-stone-50 rounded-2xl border border-stone-100 shadow-inner">
                                             {m.poruthams.map((p: any /* eslint-disable-line @typescript-eslint/no-explicit-any */, i: number) => (
                                                 <div key={i} title={p.description} className={`flex-1 h-6 rounded-md transition-all ${p.matched ? 'bg-emerald-500 shadow-sm' : p.isCritical && p.criticalFailed ? 'bg-red-500 shadow-sm' : 'bg-stone-200'}`}></div>
                                             ))}
                                         </div>
                                         <div className="flex justify-between items-center px-1">
                                            {m.rajjuFailed ? (
                                                <span className="text-[9px] text-red-500 uppercase tracking-widest font-black flex items-center gap-1.5 border border-red-500/20 px-3 py-1 rounded-full"><AlertTriangle size={12} /> Rajju Critical Fail</span>
                                            ) : (
                                                <span className="text-[9px] text-emerald-500 uppercase tracking-widest font-black flex items-center gap-1.5 opacity-60"><CheckCircle size={10} /> Cosmic Path Clear</span>
                                            )}
                                            
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => pairCouple(target.id)}
                                                    disabled={pairingProfileId === target.id}
                                                    className="bg-amber-100 hover:bg-amber-600 text-amber-700 hover:text-white px-4 py-2 rounded-xl border border-amber-200 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm disabled:opacity-50"
                                                >
                                                    {pairingProfileId === target.id ? "Pairing..." : "Pair Couple"}
                                                </button>
                                                <button 
                                                    onClick={() => setSelectedMatchForDetails(m)}
                                                    className="bg-stone-100 hover:bg-amber-600 hover:text-white px-4 py-2 rounded-xl border border-stone-200 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group shadow-sm"
                                                >
                                                    <Eye size={12} className="group-hover:scale-125 transition-transform" /> Full Data
                                                </button>
                                            </div>
                                         </div>
                                    </div>
                                </motion.div>
                            )})
                        )}
                    </div>
                  </motion.div>
                )}
          </section>
        </div>

        {/* --- MODALS --- */}
        <AnimatePresence>
            {/* 1. Register Profile Modal */}
            {activeModal === "register" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setActiveModal(null)}
                        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white border border-stone-200 rounded-[2.5rem] w-full max-w-5xl shadow-2xl overflow-hidden relative z-10"
                    >
                        <div className="p-8 md:p-10 max-h-[90vh] overflow-y-auto">
                            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 border border-stone-200 transition-colors">
                                <X size={20} />
                            </button>
                            
                            <div className="flex items-center gap-4 mb-8">
                                <div className="bg-amber-100 p-3 rounded-2xl border border-amber-200">
                                    <UserPlus className="text-amber-600 size-6" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-stone-900 tracking-tight leading-none">SOLO REGISTER</h2>
                                    <p className="text-stone-500 text-xs font-bold leading-tight">Add a new seeker to the cosmic database manually.</p>
                                </div>
                            </div>

                            <form onSubmit={handleManualRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                                <div className="space-y-2">
                                     <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">Full Name</label>
                                     <input 
                                        required value={regForm.full_name}
                                        onChange={e => setRegForm({...regForm, full_name: e.target.value})}
                                        placeholder="Identification Name"
                                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 focus:border-amber-500/50 outline-none transition-all shadow-inner font-bold text-stone-900"
                                     />
                                </div>

                                <div className="space-y-2">
                                     <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">Gender</label>
                                     <select 
                                        value={regForm.gender}
                                        onChange={e => setRegForm({...regForm, gender: e.target.value})}
                                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 focus:border-amber-500/50 outline-none transition-all shadow-inner font-bold text-stone-900"
                                     >
                                         <option value="Male">Male (Groom)</option>
                                         <option value="Female">Female (Bride)</option>
                                     </select>
                                </div>

                                <div className="space-y-2 relative">
                                     <label className="text-[10px] uppercase font-black text-stone-500 tracking-widest px-1 flex justify-between">
                                         <span>Birth Evolution Date</span>
                                         {regForm.date_of_birth && <span className="text-amber-600">CALCULATED AGE: {calculateAge(regForm.date_of_birth)}</span>}
                                     </label>
                                     <div className="relative">
                                        <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 size-4 pointer-events-none" />
                                        <input 
                                            required={!regForm.no_dob} type="date" value={regForm.date_of_birth}
                                            onChange={e => setRegForm({...regForm, date_of_birth: e.target.value})}
                                            className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-12 pr-5 py-4 focus:border-amber-500/50 outline-none transition-all shadow-inner font-bold text-stone-900"
                                        />
                                     </div>
                                </div>

                                <div className="space-y-2">
                                     <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">Exact Time</label>
                                     <div className="relative">
                                        <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 size-4 pointer-events-none" />
                                        <input 
                                            required={!regForm.no_dob} type="time" value={regForm.time_of_birth}
                                            onChange={e => setRegForm({...regForm, time_of_birth: e.target.value})}
                                            className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-12 pr-5 py-4 focus:border-amber-500/50 outline-none transition-all shadow-inner font-bold text-stone-900"
                                        />
                                     </div>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                     <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">Birth Location</label>
                                     <div className="relative">
                                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 size-4 pointer-events-none" />
                                        <input 
                                            required={!regForm.no_dob}
                                            value={regForm.place_of_birth_city}
                                            onChange={e => setRegForm({...regForm, place_of_birth_city: e.target.value})}
                                            placeholder="City of Birth"
                                            className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-12 pr-5 py-4 focus:border-amber-500/50 outline-none transition-all shadow-inner font-bold text-stone-900"
                                        />
                                     </div>
                                </div>

                                <div className="space-y-2">
                                     <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">
                                         Latitude {isGeocoding && <span className="text-amber-600 animate-pulse text-[8px] ml-2 font-normal">(Auto-calculating...)</span>}
                                     </label>
                                     <input 
                                        required={!regForm.no_dob} value={regForm.latitude}
                                        onChange={e => setRegForm({...regForm, latitude: e.target.value})}
                                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 focus:border-amber-500/50 outline-none transition-all shadow-inner font-bold text-stone-900 placeholder:opacity-30"
                                        placeholder="0.0000"
                                     />
                                </div>

                                <div className="space-y-2">
                                     <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">
                                         Longitude {isGeocoding && <span className="text-amber-600 animate-pulse text-[8px] ml-2 font-normal">(Auto-calculating...)</span>}
                                     </label>
                                     <input 
                                        required={!regForm.no_dob} value={regForm.longitude}
                                        onChange={e => setRegForm({...regForm, longitude: e.target.value})}
                                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 focus:border-amber-500/50 outline-none transition-all shadow-inner font-bold text-stone-900 placeholder:opacity-30"
                                        placeholder="0.0000"
                                     />
                                </div>

                                <div className="space-y-2">
                                     <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">Work</label>
                                     <input 
                                        value={regForm.work}
                                        onChange={e => setRegForm({...regForm, work: e.target.value})}
                                        placeholder="Occupation/Work"
                                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 focus:border-amber-500/50 outline-none transition-all shadow-inner font-bold text-stone-900"
                                     />
                                </div>

                                <div className="space-y-2">
                                     <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">Case</label>
                                     <input 
                                        value={regForm.case}
                                        onChange={e => setRegForm({...regForm, case: e.target.value})}
                                        placeholder="Case Details"
                                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 focus:border-amber-500/50 outline-none transition-all shadow-inner font-bold text-stone-900"
                                     />
                                </div>

                                <div className="space-y-2">
                                     <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">Region</label>
                                     <input 
                                        value={regForm.region}
                                        onChange={e => setRegForm({...regForm, region: e.target.value})}
                                        placeholder="Region"
                                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 focus:border-amber-500/50 outline-none transition-all shadow-inner font-bold text-stone-900"
                                     />
                                </div>

                                <div className="space-y-2">
                                     <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">District</label>
                                     <input 
                                        value={regForm.district}
                                        onChange={e => setRegForm({...regForm, district: e.target.value})}
                                        placeholder="District"
                                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 focus:border-amber-500/50 outline-none transition-all shadow-inner font-bold text-stone-900"
                                     />
                                </div>

                                <div className="space-y-2">
                                     <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">Salary</label>
                                     <input 
                                        value={regForm.salary}
                                        onChange={e => setRegForm({...regForm, salary: e.target.value})}
                                        placeholder="Salary"
                                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 focus:border-amber-500/50 outline-none transition-all shadow-inner font-bold text-stone-900"
                                     />
                                </div>

                                <div className="space-y-2">
                                     <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">Other Country</label>
                                     <input 
                                        value={regForm.other_country}
                                        onChange={e => setRegForm({...regForm, other_country: e.target.value})}
                                        placeholder="Other Country"
                                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 focus:border-amber-500/50 outline-none transition-all shadow-inner font-bold text-stone-900"
                                     />
                                </div>

                                <div className="space-y-2">
                                     <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">Dowry</label>
                                     <input 
                                        value={regForm.dowry}
                                        onChange={e => setRegForm({...regForm, dowry: e.target.value})}
                                        placeholder="Dowry Details"
                                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 focus:border-amber-500/50 outline-none transition-all shadow-inner font-bold text-stone-900"
                                     />
                                </div>

                                <div className="space-y-2">
                                     <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">Business</label>
                                     <input 
                                        value={regForm.business}
                                        onChange={e => setRegForm({...regForm, business: e.target.value})}
                                        placeholder="Business Details"
                                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 focus:border-amber-500/50 outline-none transition-all shadow-inner font-bold text-stone-900"
                                     />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:col-span-2 bg-stone-50 p-6 rounded-3xl border border-stone-200">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            checked={regForm.no_case}
                                            onChange={e => setRegForm({...regForm, no_case: e.target.checked})}
                                            className="w-5 h-5 rounded-lg accent-amber-600 transition-all"
                                        />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-stone-600 group-hover:text-amber-700 transition-colors">No Case</span>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            checked={regForm.is_widow}
                                            onChange={e => setRegForm({...regForm, is_widow: e.target.checked})}
                                            className="w-5 h-5 rounded-lg accent-amber-600 transition-all"
                                        />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-stone-600 group-hover:text-amber-700 transition-colors">Widow/Widower</span>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            checked={regForm.no_dob}
                                            onChange={e => setRegForm({...regForm, no_dob: e.target.checked})}
                                            className="w-5 h-5 rounded-lg accent-amber-600 transition-all"
                                        />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-stone-600 group-hover:text-amber-700 transition-colors">No DOB</span>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            checked={regForm.no_parent}
                                            onChange={e => setRegForm({...regForm, no_parent: e.target.checked})}
                                            className="w-5 h-5 rounded-lg accent-amber-600 transition-all"
                                        />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-stone-600 group-hover:text-amber-700 transition-colors">No Parent</span>
                                    </label>
                                </div>

                                <div className="space-y-2">
                                     <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">Siblings Count</label>
                                     <input 
                                        type="number"
                                        min="0"
                                        value={regForm.siblings_count}
                                        onChange={e => setRegForm({...regForm, siblings_count: parseInt(e.target.value) || 0})}
                                        placeholder="0"
                                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 focus:border-amber-500/50 outline-none transition-all shadow-inner font-bold text-stone-900"
                                     />
                                </div>

                                <div className="space-y-2">
                                     <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">Siblings Details</label>
                                     <input 
                                        value={regForm.siblings_details}
                                        onChange={e => setRegForm({...regForm, siblings_details: e.target.value})}
                                        placeholder="Brothers & Sisters details"
                                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 focus:border-amber-500/50 outline-none transition-all shadow-inner font-bold text-stone-900"
                                     />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                     <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">Photo</label>
                                     <div className="relative">
                                        <input 
                                            type="file"
                                            accept="image/*"
                                            onChange={e => {
                                                const file = e.target.files?.[0] || null;
                                                setPhotoFile(file);
                                                setRegForm({...regForm, photo: file ? file.name : ''});
                                            }}
                                            className="hidden"
                                            id="photo-upload"
                                        />
                                        <label 
                                            htmlFor="photo-upload"
                                            className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 focus:border-amber-500/50 outline-none transition-all shadow-inner font-bold text-stone-900 cursor-pointer flex items-center justify-center gap-3 hover:bg-stone-100"
                                        >
                                            <Upload size={20} className="text-amber-600" />
                                            <span>{regForm.photo ? regForm.photo : "Upload Photo"}</span>
                                        </label>
                                     </div>
                                </div>

                                <button 
                                    disabled={registering}
                                    className="md:col-span-2 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 mt-4 h-16 uppercase tracking-widest"
                                >
                                    {registering ? "Synchronizing Stars..." : "Authorize Entry"} <CheckCircle size={20}/>
                                </button>

                                {regMessage && (
                                    <div className="md:col-span-2 p-4 rounded-2xl text-center font-bold text-xs bg-stone-50 border border-stone-200 text-amber-800">
                                        {regMessage}
                                    </div>
                                )}
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* 2. Bulk Upload Modal */}
            {activeModal === "upload" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setActiveModal(null)}
                        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white border border-stone-200 rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden relative z-10"
                    >
                        <div className="p-8 md:p-10 text-center">
                            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 border border-stone-200 transition-colors">
                                <X size={20} />
                            </button>

                            <div className="space-y-3 mb-10">
                                <div className="bg-amber-100 p-4 rounded-3xl border border-amber-200 inline-block mb-3">
                                    <Users className="text-amber-600 size-8" />
                                </div>
                                <h2 className="text-3xl font-black text-stone-900 tracking-tight">GALAXY DATA IMPORT</h2>
                                <p className="text-stone-500 text-sm font-bold">Inject multiple seeker profiles via standardized CSV protocol.</p>
                            </div>

                            <div className="border-2 border-dashed border-stone-200 hover:border-amber-400 transition-all p-12 rounded-[2rem] bg-stone-50 mb-8 relative group">
                                <input 
                                  type="file" accept=".csv" id="modal-file-upload" className="hidden" 
                                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                                <label htmlFor="modal-file-upload" className="cursor-pointer flex flex-col items-center gap-5">
                                  <Upload className={`size-14 ${file ? 'text-amber-600 drop-shadow-[0_0_15px_rgba(251,191,36,0.2)]' : 'text-stone-300'}`} />
                                  <span className="text-stone-700 font-black uppercase tracking-widest text-[10px] bg-white px-6 py-3 rounded-full border border-stone-200 shadow-sm">
                                    {file ? file.name : "Establish CSV Connection"}
                                  </span>
                                </label>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button 
                                  onClick={handleUpload}
                                  disabled={!file || uploading}
                                  className="group bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 h-16 uppercase tracking-widest"
                                >
                                  {uploading ? "Parsing Data Packets..." : "Initiate Injection"} <Activity size={20} className="animate-pulse" />
                                </button>
                                
                                <button 
                                  onClick={downloadSampleCsv}
                                  className="text-stone-500 hover:text-amber-700 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors py-2"
                                >
                                  <Download size={14}/> Download Standardized Schema (Template)
                                </button>
                            </div>

                            {uploadMessage && (
                                <div className="mt-6 p-4 rounded-2xl text-xs font-black bg-stone-50 border border-stone-200 text-amber-800">
                                  {uploadMessage}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* 3. Full Data Profile Modal */}
            {selectedMatchForDetails && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setSelectedMatchForDetails(null)}
                        className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, rotateX: 10 }} animate={{ scale: 1, opacity: 1, rotateX: 0 }} exit={{ scale: 0.9, opacity: 0, rotateX: 10 }}
                        className="bg-white border border-stone-200 rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden relative z-10"
                    >
                        <div className="max-h-[90vh] overflow-y-auto">
                            {/* Profile Header */}
                            <div className="bg-stone-100 p-10 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 border-b border-stone-200">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 blur-[120px] -z-10"></div>
                                <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/5 blur-[120px] -z-10"></div>
                                
                                <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left flex-1">
                                    {/* Photo Display */}
                                    <div className="relative group">
                                        <div className="size-32 rounded-[2.5rem] bg-white border-2 border-amber-200 overflow-hidden shadow-2xl transition-transform group-hover:rotate-3">
                                            {selectedMatchForDetails.targetProfile.photo ? (
                                                <img 
                                                    src={selectedMatchForDetails.targetProfile.photo} 
                                                    alt={selectedMatchForDetails.targetProfile.full_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-stone-50 text-stone-300 font-black text-5xl">
                                                    {selectedMatchForDetails.targetProfile.full_name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-2 rounded-2xl shadow-xl">
                                            <Activity size={16} className="animate-pulse" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 justify-center md:justify-start">
                                            <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-200">
                                                {selectedMatchForDetails.targetProfile.gender}
                                            </div>
                                            <div className="bg-white text-stone-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-stone-200">
                                                Age: {selectedMatchForDetails.targetProfile.age || calculateAge(selectedMatchForDetails.targetProfile.date_of_birth || selectedMatchForDetails.targetProfile.birth_date)}
                                            </div>
                                        </div>
                                        <h2 className="text-5xl font-black text-stone-900 italic tracking-tighter">{selectedMatchForDetails.targetProfile.full_name}</h2>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-stone-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                                            <span className="flex items-center gap-2"><MapPin size={12} className="text-amber-600" /> {selectedMatchForDetails.targetProfile.birth_place}</span>
                                            <span className="flex items-center gap-2"><Calendar size={12} className="text-amber-600" /> {selectedMatchForDetails.targetProfile.birth_date}</span>
                                            <span className="flex items-center gap-2"><Clock size={12} className="text-amber-600" /> {selectedMatchForDetails.targetProfile.birth_time}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-[2.5rem] border border-amber-200 shadow-xl flex flex-col items-center justify-center min-w-[200px]">
                                    <span className="text-[10px] text-stone-500 font-black uppercase tracking-[0.3em] mb-3">Alignment Score</span>
                                    <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-500 to-amber-700">{selectedMatchForDetails.score}/10</span>
                                    <div className="mt-4 flex items-center gap-2">
                                        {selectedMatchForDetails.rajjuFailed ? (
                                            <span className="text-[9px] text-red-500 font-black bg-red-500/10 px-3 py-1 rounded-full uppercase">Rajju Mismatch</span>
                                        ) : (
                                            <span className="text-[9px] text-emerald-500 font-black bg-emerald-500/10 px-3 py-1 rounded-full uppercase">High Affinity</span>
                                        )}
                                    </div>
                                </div>

                                <button onClick={() => setSelectedMatchForDetails(null)} className="absolute top-8 right-8 p-3 rounded-full hover:bg-stone-200 transition-all border border-stone-200 shadow-sm">
                                    <X size={24} className="text-stone-900" />
                                </button>
                            </div>

                            {/* Technical Grid */}
                            <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8 bg-white">
                                <div className="bg-stone-50 rounded-[2rem] border border-stone-200 p-8 relative overflow-hidden">
                                     <div className="absolute top-0 right-0 p-4 opacity-10"><Info size={40} className="text-stone-300" /></div>
                                     <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest mb-4 block">Cosmic Coordinates</span>
                                     <div className="space-y-6">
                                         <div>
                                             <p className="text-[8px] text-stone-500 font-black uppercase mb-1">Birth Star (Nakshatra)</p>
                                             <p className="text-lg font-bold text-stone-900">{selectedMatchForDetails.targetProfile.nakshatram}</p>
                                         </div>
                                         <div>
                                             <p className="text-[8px] text-stone-500 font-black uppercase mb-1">Moon Sign (Rasi)</p>
                                             <p className="text-lg font-bold text-stone-900">{selectedMatchForDetails.targetProfile.rasi}</p>
                                         </div>
                                         <div>
                                             <p className="text-[8px] text-stone-500 font-black uppercase mb-1">Pada (Division)</p>
                                             <p className="text-lg font-bold text-stone-900">{selectedMatchForDetails.targetProfile.nakshatra_pada}</p>
                                         </div>
                                         <div>
                                             <p className="text-[8px] text-stone-500 font-black uppercase mb-1">Ascendant (Lagnam)</p>
                                             <p className="text-lg font-bold text-stone-900">{selectedMatchForDetails.targetProfile.lagnam}</p>
                                         </div>
                                     </div>
                                </div>

                                <div className="md:col-span-2 space-y-8">
                                      <div className="bg-stone-50 rounded-[2rem] border border-stone-200 p-8">
                                          <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest mb-6 block">Koota Agreement Breakdown</span>
                                          <div className="grid grid-cols-2 gap-4">
                                               {selectedMatchForDetails.poruthams.map((p: any, i: number) => (
                                                   <div key={i} className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${p.matched ? 'bg-emerald-50 border-emerald-200' : p.isCritical && p.criticalFailed ? 'bg-red-50 border-red-200' : 'bg-white border-stone-200'}`}>
                                                       <div className="space-y-1">
                                                            <p className="text-xs font-black text-stone-800 uppercase tracking-tight">{p.name}</p>
                                                            <p className="text-[10px] text-stone-500 font-bold italic">{p.description}</p>
                                                       </div>
                                                       <div>
                                                            {p.matched ? <CheckCircle className="text-emerald-600 size-5" /> : <XCircle className="text-stone-300 size-5" />}
                                                       </div>
                                                   </div>
                                               ))}
                                          </div>
                                      </div>

                                      <div className="bg-stone-50 rounded-[2rem] border border-stone-200 p-8">
                                          <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest mb-6 block">Demographic & Professional Details</span>
                                          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                              <div>
                                                  <p className="text-[8px] text-stone-500 font-black uppercase mb-1">Occupation</p>
                                                  <p className="text-sm font-bold text-stone-900">{selectedMatchForDetails.targetProfile.work || "N/A"}</p>
                                              </div>
                                              <div>
                                                  <p className="text-[8px] text-stone-500 font-black uppercase mb-1">Salary</p>
                                                  <p className="text-sm font-bold text-stone-900">{selectedMatchForDetails.targetProfile.salary || "N/A"}</p>
                                              </div>
                                              <div>
                                                  <p className="text-[8px] text-stone-500 font-black uppercase mb-1">Business</p>
                                                  <p className="text-sm font-bold text-stone-900">{selectedMatchForDetails.targetProfile.business || "N/A"}</p>
                                              </div>
                                              <div>
                                                  <p className="text-[8px] text-stone-500 font-black uppercase mb-1">Region</p>
                                                  <p className="text-sm font-bold text-stone-900">{selectedMatchForDetails.targetProfile.region || "N/A"}</p>
                                              </div>
                                              <div>
                                                  <p className="text-[8px] text-stone-500 font-black uppercase mb-1">District</p>
                                                  <p className="text-sm font-bold text-stone-900">{selectedMatchForDetails.targetProfile.district || "N/A"}</p>
                                              </div>
                                              <div>
                                                  <p className="text-[8px] text-stone-500 font-black uppercase mb-1">Other Country</p>
                                                  <p className="text-sm font-bold text-stone-900">{selectedMatchForDetails.targetProfile.other_country || "N/A"}</p>
                                              </div>
                                              <div className="col-span-full">
                                                  <p className="text-[8px] text-stone-500 font-black uppercase mb-1">Dowry Details</p>
                                                  <p className="text-sm font-bold text-stone-900">{selectedMatchForDetails.targetProfile.dowry || "No details provided"}</p>
                                              </div>
                                          </div>
                                      </div>

                                      <div className="bg-stone-50 rounded-[2rem] border border-stone-200 p-8">
                                          <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest mb-6 block">Family & Status Details</span>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                              <div className="space-y-4">
                                                  <div>
                                                      <p className="text-[8px] text-stone-500 font-black uppercase mb-1">Marital Status</p>
                                                      <p className="text-sm font-bold text-stone-900">{selectedMatchForDetails.targetProfile.is_widow ? "Widow / Widower" : "Never Married"}</p>
                                                  </div>
                                                  <div>
                                                      <p className="text-[8px] text-stone-500 font-black uppercase mb-1">Parent Status</p>
                                                      <p className="text-sm font-bold text-stone-900">{selectedMatchForDetails.targetProfile.no_parent ? "No Parent" : "Parents Available"}</p>
                                                  </div>
                                                  <div>
                                                      <p className="text-[8px] text-stone-500 font-black uppercase mb-1">Legal Case Status</p>
                                                      <p className="text-sm font-bold text-stone-900">{selectedMatchForDetails.targetProfile.no_case ? "No Case" : (selectedMatchForDetails.targetProfile.case || "Case Reported")}</p>
                                                  </div>
                                              </div>
                                              <div className="space-y-4">
                                                  <div>
                                                      <p className="text-[8px] text-stone-500 font-black uppercase mb-1">Siblings Count</p>
                                                      <p className="text-sm font-bold text-stone-900">{selectedMatchForDetails.targetProfile.siblings_count || 0}</p>
                                                  </div>
                                                  <div>
                                                      <p className="text-[8px] text-stone-500 font-black uppercase mb-1">Siblings Details</p>
                                                      <p className="text-sm font-bold text-stone-900">{selectedMatchForDetails.targetProfile.siblings_details || "No details provided"}</p>
                                                  </div>
                                                  <div>
                                                      <p className="text-[8px] text-stone-500 font-black uppercase mb-1">DOB Status</p>
                                                      <p className="text-sm font-bold text-stone-900">{selectedMatchForDetails.targetProfile.no_dob ? "DOB Not Available" : "DOB Provided"}</p>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>

                                     <div className="bg-stone-50 rounded-[2rem] border border-stone-200 p-8 text-center shadow-inner">
                                          <p className="text-xs text-stone-600 font-bold leading-relaxed italic">
                                              &quot;The celestial alignment for this union shows {selectedMatchForDetails.score} out of 10 agreements. 
                                              {selectedMatchForDetails.rajjuFailed ? ' Despite other matches, the absence of Rajju porutham suggests a major misalignment in vital growth areas according to tradition.' : ' The strong correlation between primary kootas indicates a promising path of mutual evolution and harmony.'}&quot;
                                          </p>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
