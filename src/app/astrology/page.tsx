"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Clock, MapPin, Calendar, Activity, ChevronRight, Sparkles, Users, X, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AppShell from "@/components/layout/AppShell";

export default function AstrologyPage() {
  const [formData, setFormData] = useState({
    name: "",
    gender: "Male" as "Male" | "Female" | "Other",
    date: "",
    time: "",
    place: "",
    lat: "",
    lng: "",
  });

  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("panchang");

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [showRecords, setShowRecords] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [fetchingRecords, setFetchingRecords] = useState(false);

  // Debounced Place to Lat/Lng calculation
  useEffect(() => {
    if (!formData.place || formData.place.trim().length < 3) return;

    const timer = setTimeout(async () => {
      setIsGeocoding(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.place)}&limit=1`);
        const results = await res.json();
        if (results && results.length > 0) {
          const { lat, lon } = results[0];
          setFormData(prev => ({ ...prev, lat: parseFloat(lat).toFixed(4), lng: parseFloat(lon).toFixed(4) }));
        }
      } catch (err) {
        console.error("Geocoding failed:", err);
      } finally {
        setIsGeocoding(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData.place]);

  const fetchRecords = async () => {
    setFetchingRecords(true);
    try {
      const res = await fetch('/api/matches/profiles');
      const data = await res.json();
      if (data.success) {
        setRecords(data.profiles);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingRecords(false);
    }
  };

  useEffect(() => {
    if (showRecords) fetchRecords();
  }, [showRecords]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lat || !formData.lng) {
      alert("Please wait for location to be identified or enter coordinates manually.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/astrology/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        setChartData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="min-h-screen text-stone-900 p-4 md:pt-4 md:px-8 md:pb-8 font-sans">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="mb-8 relative">
            <div className="bg-white/80 backdrop-blur-md border border-amber-200 rounded-[2rem] px-8 py-6 shadow-xl w-full relative overflow-hidden group flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl -z-10 group-hover:bg-amber-500/10 transition-all"></div>
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="bg-amber-100 p-4 rounded-[2rem] border border-amber-200 shadow-inner group-hover:rotate-12 transition-transform duration-500">
                        <Sparkles className="text-amber-700 size-8 animate-pulse" />
                    </div>
                    <div className="text-center md:text-left leading-tight">
                        <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-orange-800 tracking-tighter italic">
                            UNIFIED ASTRO PLATFORM
                        </h1>
                        <p className="text-stone-500 font-black uppercase tracking-[0.3em] text-[9px] mt-1 flex items-center justify-center md:justify-start gap-4">
                            <span className="w-6 h-px bg-amber-200"></span>
                            Professional-Grade Tamil Vedic Calculations
                            <span className="w-6 h-px bg-amber-200"></span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setShowRecords(true)}
                        className="group bg-stone-100 hover:bg-amber-600 hover:text-white px-6 py-4 rounded-2xl border border-stone-200 transition-all flex items-center gap-3 font-black shadow-sm text-xs uppercase tracking-widest whitespace-nowrap"
                    >
                        <Users size={18} className="transition-transform group-hover:scale-110" />
                        Astrology Records
                    </button>
                </div>
            </div>
          </header>

        {/* Input Section */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-stone-500 font-bold">Name</label>
              <input type="text" name="name" value={formData.name} placeholder="Enter full name" onChange={handleChange} className="w-full bg-stone-50 border focus:border-amber-500 border-stone-200 rounded-lg px-4 py-2 text-stone-900 outline-none transition-colors font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-stone-500 font-bold">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-stone-50 border focus:border-amber-500 border-stone-200 rounded-lg px-4 py-2 text-stone-900 outline-none transition-colors font-bold">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-stone-500 font-bold">Date of Birth</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-stone-50 border focus:border-amber-500 border-stone-200 rounded-lg px-4 py-2 text-stone-900 outline-none transition-colors font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-stone-500 font-bold">Time of Birth</label>
              <input type="time" name="time" value={formData.time} onChange={handleChange} className="w-full bg-stone-50 border focus:border-amber-500 border-stone-200 rounded-lg px-4 py-2 text-stone-900 outline-none transition-colors font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-stone-500 font-bold">Place of Birth</label>
              <input type="text" name="place" value={formData.place} placeholder="City, State, Country" onChange={handleChange} className="w-full bg-stone-50 border focus:border-amber-500 border-stone-200 rounded-lg px-4 py-2 text-stone-900 outline-none transition-colors font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-stone-500 font-bold">Latitude {isGeocoding && <span className="text-xs text-amber-600 animate-pulse">(Wait...)</span>}</label>
              <input type="text" name="lat" value={formData.lat} placeholder="0.0000" onChange={handleChange} className="w-full bg-stone-50 border focus:border-amber-500 border-stone-200 rounded-lg px-4 py-2 text-stone-900 outline-none transition-colors font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-stone-500 font-bold">Longitude {isGeocoding && <span className="text-xs text-amber-600 animate-pulse">(Wait...)</span>}</label>
              <input type="text" name="lng" value={formData.lng} placeholder="0.0000" onChange={handleChange} className="w-full bg-stone-50 border focus:border-amber-500 border-stone-200 rounded-lg px-4 py-2 text-stone-900 outline-none transition-colors font-bold" />
            </div>
            <div className="space-y-1 flex items-end">
              <button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-900 font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2">
                {loading ? "Calculating..." : "Generate Chart"} <Activity size={18} />
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {chartData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            
            {/* Section 1: The Identity Card */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center justify-between shadow-xl">
              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-3xl font-black text-amber-700">{formData.name}</h2>
                <p className="text-stone-500 font-black flex items-center justify-center md:justify-start gap-2">
                  <MapPin size={16} className="text-amber-600" /> {formData.place}
                </p>
                <p className="text-stone-500 font-bold flex items-center justify-center md:justify-start gap-2">
                  <Calendar size={16} className="text-amber-600" /> {formData.date} <Clock size={16} className="ml-2 text-amber-600" /> {formData.time}
                </p>
              </div>
              <div className="flex gap-4 md:gap-8 text-center">
                <div className="bg-stone-50 px-6 py-4 rounded-xl border border-stone-200 border-t-amber-600/50 shadow-sm">
                  <Sun className="mx-auto text-amber-600 mb-2" size={24} />
                  <p className="text-xs text-stone-500 font-black uppercase tracking-wider">Ascendant</p>
                  <p className="text-xl font-black text-stone-800">{chartData.panchangam.lagnam}</p>
                </div>
                <div className="bg-stone-50 px-6 py-4 rounded-xl border border-stone-200 border-t-orange-600/50 shadow-sm">
                  <Moon className="mx-auto text-orange-600 mb-2" size={24} />
                  <p className="text-xs text-stone-500 font-black uppercase tracking-wider">Moon Sign</p>
                  <p className="text-xl font-black text-stone-800">{chartData.panchangam.rasi}</p>
                </div>
              </div>
            </div>

            {/* Layout For Charts and Tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Section 2: Main South Indian Style Grid */}
              <div className="lg:col-span-1 bg-white border border-stone-200 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-black text-stone-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                  Rasi Chart (South Indian)
                </h3>
                <div className="aspect-square grid grid-cols-4 grid-rows-4 border border-amber-200 bg-stone-50 overflow-hidden rounded-xl">
                  {/* Outer border boxes logic for South Indian Chart layout */}
                  {Array.from({ length: 16 }).map((_, i) => {
                    const row = Math.floor(i / 4);
                    const col = i % 4;
                    const isMiddle = (row === 1 || row === 2) && (col === 1 || col === 2);
                    
                    // Simple Rasi mapping for grid
                    let rasiName = "";
                    if (row === 0) rasiName = ["Meenam", "Mesham", "Rishabam", "Mithunam"][col];
                    if (row === 1 && col === 0) rasiName = "Kumbam";
                    if (row === 1 && col === 3) rasiName = "Katakam";
                    if (row === 2 && col === 0) rasiName = "Makaram";
                    if (row === 2 && col === 3) rasiName = "Simmam";
                    if (row === 3) rasiName = ["Dhanusu", "Viruchigam", "Thulam", "Kanni"][col];

                    // Find planets in this rasi
                    const planetsInRasi = chartData.planets.filter((p: any) => {
                      const rasiIndex = Math.floor(p.longitude / 30);
                      return ["Mesham", "Rishabam", "Mithunam", "Katakam", "Simmam", "Kanni", "Thulam", "Viruchigam", "Dhanusu", "Makaram", "Kumbam", "Meenam"][rasiIndex] === rasiName;
                    });
                    
                    const isLagnam = chartData.panchangam.lagnam === rasiName;

                    if (isMiddle) {
                      return <div key={i} className="border border-stone-100 bg-white/50 flex items-center justify-center p-2 opacity-10" />;
                    }
                    
                    return (
                      <div key={i} className="border border-stone-200 p-2 relative group hover:bg-white transition-colors">
                        <span className="text-[10px] text-stone-400 absolute bottom-1 right-1 uppercase tracking-tighter font-bold opacity-80">{rasiName.substring(0,3)}</span>
                        {isLagnam && <span className="absolute top-1 left-1 bg-amber-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm">Asc</span>}
                        <div className="flex flex-col gap-1 mt-4">
                          {planetsInRasi.map((p: any) => (
                            <span key={p.name} className={`text-xs font-black ${p.name === 'Sun' ? 'text-amber-700' : p.name === 'Moon' ? 'text-blue-700' : 'text-stone-700'}`}>
                              {p.name.substring(0,2)} {(p.longitude % 30).toFixed(0)}°
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Tabbed Technical Data */}
              <div className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-lg">
                <div className="flex border-b border-stone-100 bg-stone-50/50">
                  {["Panchang", "Ashtakavarga", "Dasha", "Shodashavarga"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab.toLowerCase())}
                      className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === tab.toLowerCase() ? "text-amber-700 bg-white border-b-2 border-amber-700" : "text-stone-500 hover:text-stone-900 hover:bg-white/50"}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {activeTab === "panchang" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(chartData.panchangam).map(([key, value]) => (
                        <div key={key} className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                          <p className="text-[10px] text-stone-500 font-black uppercase tracking-wider mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="text-lg font-black text-stone-800">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === "ashtakavarga" && (
                    <div className="text-center py-12 space-y-4">
                      <Activity className="mx-auto text-slate-600 size-12" />
                      <p className="text-slate-400">Ashtakavarga calculation module is locked for this tier.</p>
                    </div>
                  )}
                  {activeTab === "dasha" && (
                     <div className="text-center py-12 space-y-4">
                      <Clock className="mx-auto text-slate-600 size-12" />
                      <p className="text-slate-400">Vimshottari Dasha requires full detailed timing map.</p>
                     </div>
                  )}
                  {activeTab === "shodashavarga" && (
                     <div className="text-center py-12 space-y-4">
                      <Moon className="mx-auto text-slate-600 size-12" />
                      <p className="text-slate-400">16 Divisional charts rendering is locked for this tier.</p>
                     </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      </div>

      <AnimatePresence>
        {showRecords && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setShowRecords(false)}
                  className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
              />
              <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-white border border-stone-200 rounded-[2.5rem] w-full max-w-5xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[85vh]"
              >
                  <div className="p-8 border-b border-stone-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-amber-100 p-3 rounded-2xl border border-amber-200 shadow-inner">
                            <Users size={24} className="text-amber-700" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tight">Ancient Records Hub</h2>
                          <p className="text-xs text-stone-500 font-bold tracking-wide">Listing all seekers registered in the cosmic database.</p>
                        </div>
                      </div>
                      <button onClick={() => setShowRecords(false)} className="p-3 rounded-full hover:bg-stone-100 border border-stone-100 transition-colors">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                    {fetchingRecords ? (
                      <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <Activity className="animate-spin text-amber-500 size-10" />
                        <p className="text-stone-400 font-black uppercase tracking-widest text-xs">Synchronizing with Cosmos...</p>
                      </div>
                    ) : records.length === 0 ? (
                      <div className="py-20 text-center space-y-4">
                          <Info className="mx-auto text-stone-300 size-12" />
                          <p className="text-stone-500 font-bold italic">No seekers found in our scrolls yet.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-stone-100">
                              <th className="pb-4 px-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Seeker Name</th>
                              <th className="pb-4 px-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">GENDER</th>
                              <th className="pb-4 px-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">BIRTH STATS</th>
                              <th className="pb-4 px-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Rasi / Nakshatra</th>
                              <th className="pb-4 px-4 text-[10px] font-black text-stone-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {records.map((r) => (
                              <tr key={r.id} className="group hover:bg-amber-50/50 transition-colors border-b border-stone-50">
                                <td className="py-5 px-4">
                                  <p className="font-black text-stone-900 group-hover:text-amber-800 transition-colors">{r.full_name}</p>
                                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{r.id.substring(0,8)}</p>
                                </td>
                                <td className="py-5 px-4 font-bold text-xs text-stone-500">{r.gender}</td>
                                <td className="py-5 px-4">
                                  <p className="text-xs font-bold text-stone-700">{r.birth_date}</p>
                                  <p className="text-[10px] text-stone-400 font-bold italic">{r.birth_time} - {r.birth_place}</p>
                                </td>
                                <td className="py-5 px-4">
                                  <div className="flex gap-2">
                                     <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded text-[9px] font-black uppercase">{r.rasi}</span>
                                     <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[9px] font-black uppercase">{r.nakshatram}</span>
                                  </div>
                                </td>
                                <td className="py-5 px-4 text-right">
                                  <button 
                                    onClick={() => {
                                      setFormData({
                                        ...formData,
                                        name: r.full_name,
                                        gender: r.gender,
                                        date: r.birth_date,
                                        time: r.birth_time,
                                        place: r.birth_place,
                                        lat: r.latitude,
                                        lng: r.longitude
                                      });
                                      setShowRecords(false);
                                    }}
                                    className="bg-white hover:bg-amber-600 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-stone-200 transition-all shadow-sm"
                                  >
                                    Load
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
              </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
