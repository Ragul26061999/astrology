"use client";

import { useState, useEffect } from "react";
import { Download, Upload, Users, Activity, CheckCircle, XCircle, AlertTriangle, Filter, Search, UserPlus, MapPin, Clock, Calendar, X, Eye, Info, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AppShell from "@/components/layout/AppShell";

export default function MatchesPage() {
  // Navigation State
  const [activeModal, setActiveModal] = useState<"register" | "upload" | null>(null);
  
  // View State
  const [selectedMatchForDetails, setSelectedMatchForDetails] = useState<any | null>(null);

  // Upload State
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  // Registration Form State
  const [regForm, setRegForm] = useState({
    full_name: "",
    gender: "Male",
    date_of_birth: "",
    time_of_birth: "",
    place_of_birth_city: "",
    latitude: "",
    longitude: ""
  });
  const [registering, setRegistering] = useState(false);
  const [regMessage, setRegMessage] = useState("");

  // Profiles State
  const [profiles, setProfiles] = useState<any[] /* eslint-disable-line @typescript-eslint/no-explicit-any */>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  
  // Selection State
  const [selectedGender, setSelectedGender] = useState<"male" | "female" | "">("");
  const [selectedProfileId, setSelectedProfileId] = useState("");
  
  // Match Result
  const [matchLoading, setMatchLoading] = useState(false);
  const [matches, setMatches] = useState<any[] /* eslint-disable-line @typescript-eslint/no-explicit-any */>([]);

  // Filter State
  const [minScore, setMinScore] = useState<number>(0);
  const [maxAge, setMaxAge] = useState<number | "">("");
  const [filterRajju, setFilterRajju] = useState<boolean>(false);

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
      const res = await fetch("/api/matches/add-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regForm),
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
          longitude: ""
        });
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

  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const downloadSampleCsv = () => {
    const csvContent = "full_name,gender,date_of_birth,time_of_birth,place_of_birth_city,latitude,longitude\nJohn Doe,Male,1990-05-15,14:30,Chennai,13.0827,80.2707\nJane Smith,Female,1992-08-20,09:15,Madurai,9.9252,78.1198";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sample_users.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredMatches = matches.filter(m => {
      let pass = true;
      if (minScore > 0 && m.score < minScore) pass = false;
      const age = m.targetProfile.age || calculateAge(m.targetProfile.date_of_birth || m.targetProfile.birth_date);
      if (maxAge !== "" && age > maxAge) pass = false;
      if (filterRajju && m.rajjuFailed) pass = false;
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
                      {selectedGender === "male" && selectedProfileId && (
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
                    <div className="bg-white border border-stone-200 rounded-3xl p-5 md:p-7 flex flex-col md:flex-row items-center gap-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 blur-[50px] -z-10"></div>
                        <div className="flex items-center gap-3 text-stone-700">
                            <div className="bg-stone-100 p-2 rounded-xl border border-stone-200">
                                <Filter size={18} className="text-amber-600" />
                            </div>
                            <span className="font-black uppercase tracking-widest text-xs">Search Intelligence</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 flex-1">
                            <div className="flex bg-stone-50 rounded-2xl overflow-hidden border border-stone-200 focus-within:border-amber-500/30 transition-colors shadow-inner">
                                <span className="px-4 py-3 bg-stone-100 text-stone-500 text-[10px] font-black uppercase tracking-widest border-r border-stone-200 flex items-center">Min Score</span>
                                <input 
                                   type="number" 
                                   min="0" max="10" 
                                   value={minScore} 
                                   onChange={e => setMinScore(Number(e.target.value))}
                                   className="w-16 bg-transparent px-3 py-3 text-stone-900 outline-none text-center font-black"
                                />
                            </div>

                            <div className="flex bg-stone-50 rounded-2xl overflow-hidden border border-stone-200 focus-within:border-amber-500/30 transition-colors shadow-inner">
                                <span className="px-4 py-3 bg-stone-100 text-stone-500 text-[10px] font-black uppercase tracking-widest border-r border-stone-200 flex items-center">Max Age</span>
                                <input 
                                   type="number" 
                                   placeholder="∞"
                                   value={maxAge} 
                                   onChange={e => setMaxAge(e.target.value === "" ? "" : Number(e.target.value))}
                                   className="w-16 bg-transparent px-3 py-3 text-stone-900 outline-none text-center font-black"
                                />
                            </div>

                            <label className="group flex items-center gap-3 cursor-pointer text-[10px] font-black uppercase tracking-widest text-stone-700 bg-stone-50 px-6 py-3 border border-stone-200 rounded-2xl hover:bg-stone-100 transition-all shadow-inner">
                                <input 
                                   type="checkbox" 
                                   checked={filterRajju} 
                                   onChange={e => setFilterRajju(e.target.checked)}
                                   className="accent-amber-600 w-4 h-4 rounded"
                                />
                                Hide Rajju Failed
                            </label>
                        </div>
                        
                        <div className="bg-amber-100 px-6 py-3 rounded-2xl border border-amber-200 flex flex-col items-center min-w-[100px]">
                            <span className="text-[9px] text-amber-700 font-black uppercase tracking-widest leading-none">Potential</span>
                            <span className="text-xl font-black text-amber-600 leading-tight">{filteredMatches.length}</span>
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
                                            
                                            <button 
                                                onClick={() => setSelectedMatchForDetails(m)}
                                                className="bg-stone-100 hover:bg-amber-600 hover:text-white px-4 py-2 rounded-xl border border-stone-200 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group shadow-sm"
                                            >
                                                <Eye size={12} className="group-hover:scale-125 transition-transform" /> Full Data
                                            </button>
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
                        className="bg-white border border-stone-200 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden relative z-10"
                    >
                        <div className="p-8 md:p-10 max-h-[90vh] overflow-y-auto">
                            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 border border-stone-200 transition-colors">
                                <X size={20} />
                            </button>
                            
                            <div className="flex items-center gap-4 mb-8">
                                <div className="bg-amber-100 p-3 rounded-2xl border border-amber-200">
                                    <UserPlus className="text-amber-600 size-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-stone-900 tracking-tight">SOLO REGISTER</h2>
                                    <p className="text-stone-500 text-sm font-bold">Add a new seeker to the cosmic database manually.</p>
                                </div>
                            </div>

                            <form onSubmit={handleManualRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                         {regForm.date_of_birth && <span className="text-amber-600">Calculated Age: {calculateAge(regForm.date_of_birth)}</span>}
                                     </label>
                                     <div className="relative">
                                        <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 size-4 pointer-events-none" />
                                        <input 
                                            required type="date" value={regForm.date_of_birth}
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
                                            required type="time" value={regForm.time_of_birth}
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
                                            required value={regForm.place_of_birth_city}
                                            onBlur={() => {
                                                if (regForm.place_of_birth_city.toLowerCase() === 'chennai') {
                                                    setRegForm(prev => ({...prev, latitude: '13.0827', longitude: '80.2707'}));
                                                }
                                            }}
                                            onChange={e => setRegForm({...regForm, place_of_birth_city: e.target.value})}
                                            placeholder="City of Birth"
                                            className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-12 pr-5 py-4 focus:border-amber-500/50 outline-none transition-all shadow-inner font-bold text-stone-900"
                                        />
                                     </div>
                                </div>

                                <div className="space-y-2">
                                     <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">Latitude</label>
                                     <input 
                                        required type="number" step="any" value={regForm.latitude}
                                        onChange={e => setRegForm({...regForm, latitude: e.target.value})}
                                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 focus:border-amber-500/50 outline-none transition-all shadow-inner font-bold text-stone-900"
                                     />
                                </div>

                                <div className="space-y-2">
                                     <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-1">Longitude</label>
                                     <input 
                                        required type="number" step="any" value={regForm.longitude}
                                        onChange={e => setRegForm({...regForm, longitude: e.target.value})}
                                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 focus:border-amber-500/50 outline-none transition-all shadow-inner font-bold text-stone-900"
                                     />
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
                                
                                <div className="space-y-4 text-center md:text-left">
                                    <div className="flex items-center gap-3 justify-center md:justify-start">
                                        <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-200">
                                            {selectedMatchForDetails.targetProfile.gender}
                                        </div>
                                        <div className="bg-white text-stone-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-stone-200">
                                            Age: {selectedMatchForDetails.targetProfile.age || calculateAge(selectedMatchForDetails.targetProfile.date_of_birth || selectedMatchForDetails.targetProfile.birth_date)}
                                        </div>
                                    </div>
                                    <h2 className="text-5xl font-black text-stone-900 italic tracking-tighter">{selectedMatchForDetails.targetProfile.full_name}</h2>
                                    <div className="flex items-center gap-6 text-stone-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                                        <span className="flex items-center gap-2"><MapPin size={12} className="text-amber-600" /> {selectedMatchForDetails.targetProfile.birth_place}</span>
                                        <span className="flex items-center gap-2"><Calendar size={12} className="text-amber-600" /> {selectedMatchForDetails.targetProfile.birth_date}</span>
                                        <span className="flex items-center gap-2"><Clock size={12} className="text-amber-600" /> {selectedMatchForDetails.targetProfile.birth_time}</span>
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
