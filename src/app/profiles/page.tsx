"use client";

import { useState, useEffect } from "react";
import { Users, Activity, Info, MapPin, Calendar, Clock, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
import AppShell from "@/components/layout/AppShell";

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/matches/profiles');
      const data = await res.json();
      if (data.success) {
        setProfiles(data.profiles);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const filteredProfiles = profiles.filter(p => 
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.rasi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nakshatram?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppShell>
      <div className="min-h-screen text-stone-900 p-4 md:pt-4 md:px-8 md:pb-8 font-sans">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header Section */}
          <header className="bg-white/80 backdrop-blur-md border border-amber-200 rounded-[2.5rem] px-8 py-8 shadow-xl relative overflow-hidden group flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-3xl -z-10 group-hover:bg-amber-500/10 transition-all"></div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-amber-100 p-4 rounded-3xl border border-amber-200 shadow-inner group-hover:rotate-6 transition-transform duration-500">
                <Users className="text-amber-700 size-10" />
              </div>
              <div className="text-center md:text-left space-y-1">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-orange-800 tracking-tighter italic uppercase">
                  Match Profiles Repository
                </h1>
                <p className="text-stone-500 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center md:justify-start gap-4">
                  <span className="w-6 h-px bg-amber-200"></span>
                  Central Seeker Intelligence Database
                  <span className="w-6 h-px bg-amber-200"></span>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 size-4 group-focus-within:text-amber-600 transition-colors" />
                    <input 
                        type="text"
                        placeholder="Search Seeker..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-stone-50 border border-stone-200 focus:border-amber-500/50 rounded-2xl pl-12 pr-6 py-4 outline-none transition-all font-bold text-sm w-full sm:w-64 shadow-inner"
                    />
                </div>
            </div>
          </header>

          {/* Main Content Area */}
          <div className="bg-white border border-stone-200 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col min-h-[60vh]">
            <div className="p-8 border-b border-stone-100 bg-stone-50/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Filter className="text-amber-600 size-5" />
                    <h2 className="text-lg font-black text-stone-800 tracking-tight">Veda Records</h2>
                </div>
                <div className="bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                    Total: {filteredProfiles.length} Seekers Found
                </div>
            </div>

            <div className="flex-1 p-4 sm:p-8 overflow-x-auto">
                {loading ? (
                    <div className="py-32 flex flex-col items-center justify-center gap-4">
                        <Activity className="animate-spin text-amber-500 size-12" />
                        <p className="text-stone-400 font-black uppercase tracking-widest text-xs">Accessing Cosmic Database...</p>
                    </div>
                ) : filteredProfiles.length === 0 ? (
                    <div className="py-32 text-center space-y-4">
                        <Info className="mx-auto text-stone-300 size-16" />
                        <p className="text-stone-500 font-bold italic text-lg text-stone-400">No seekers match your celestial filters.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-stone-100">
                                <th className="pb-6 px-6 text-[11px] font-black text-stone-400 uppercase tracking-[0.2em]">Seeker Name</th>
                                <th className="pb-6 px-6 text-[11px] font-black text-stone-400 uppercase tracking-[0.2em]">Gender</th>
                                <th className="pb-6 px-6 text-[11px] font-black text-stone-400 uppercase tracking-[0.2em]">Evolution Stats (Birth)</th>
                                <th className="pb-6 px-6 text-[11px] font-black text-stone-400 uppercase tracking-[0.2em]">Rasi / Nakshatra</th>
                                <th className="pb-6 px-6 text-[11px] font-black text-stone-400 uppercase tracking-[0.2em] text-right">Age</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProfiles.map((p, idx) => (
                                <motion.tr 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.02 }}
                                    key={p.id} 
                                    className="group hover:bg-amber-50/50 transition-colors border-b border-stone-50"
                                >
                                    <td className="py-7 px-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 font-black group-hover:bg-white group-hover:text-amber-600 transition-all">
                                                {p.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-stone-900 group-hover:text-amber-800 transition-colors text-base">{p.full_name}</p>
                                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{p.id.substring(0,8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-7 px-6">
                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${
                                            p.gender.toLowerCase() === 'male' 
                                            ? 'bg-blue-50 text-blue-700 border-blue-100 group-hover:bg-blue-100' 
                                            : 'bg-rose-50 text-rose-700 border-rose-100 group-hover:bg-rose-100'
                                        }`}>
                                            {p.gender}
                                        </span>
                                    </td>
                                    <td className="py-7 px-6">
                                        <div className="space-y-1.5">
                                            <p className="text-sm font-bold text-stone-700 flex items-center gap-2">
                                                <Calendar size={14} className="text-amber-600" /> {p.birth_date || p.date_of_birth}
                                            </p>
                                            <p className="text-[10px] text-stone-400 font-bold italic flex items-center gap-2">
                                                <Clock size={12} className="text-stone-300" /> {p.birth_time || p.time_of_birth} 
                                                <MapPin size={12} className="ml-1 text-stone-300" /> {p.birth_place || p.place_of_birth_city}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="py-7 px-6">
                                        <div className="flex gap-2">
                                            <span className="bg-white group-hover:bg-stone-100 text-stone-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase border border-stone-200 shadow-sm transition-colors">{p.rasi}</span>
                                            <span className="bg-amber-50 group-hover:bg-amber-100 text-amber-700 px-3 py-1 rounded-xl text-[10px] font-black uppercase border border-amber-200 shadow-sm transition-colors">{p.nakshatram}</span>
                                        </div>
                                    </td>
                                    <td className="py-7 px-6 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xl font-black text-stone-800">{calculateAge(p.birth_date || p.date_of_birth)}</span>
                                            <span className="text-[9px] text-stone-400 font-black uppercase tracking-widest">Earth Years</span>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
