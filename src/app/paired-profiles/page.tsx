"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { Heart, Activity, Search, AlertTriangle, CheckCircle, Calendar, MapPin, Clock, XCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function PairedProfilesPage() {
    const [pairs, setPairs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchPairs();
    }, []);

    const fetchPairs = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/matches/pairs");
            const data = await res.json();
            if (data.success) {
                setPairs(data.pairs);
            } else {
                setError(data.error || "Failed to load paired profiles.");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRevert = async (id: string) => {
        if (!confirm("Are you sure you want to revert this pair? Both seekers will be available for matching again.")) return;
        
        try {
            const res = await fetch(`/api/matches/pairs?id=${id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                fetchPairs();
            } else {
                alert(data.error || "Failed to revert pair.");
            }
        } catch (err: any) {
            alert(err.message);
        }
    };

    const calculateAge = (dob: string) => {
        if (!dob) return 0;
        const diff = Date.now() - new Date(dob).getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    };

    return (
        <AppShell>
            <div className="relative min-h-screen text-stone-900 p-4 md:pt-4 md:px-8 md:pb-8 font-sans overflow-x-hidden">
                <div className="max-w-6xl mx-auto space-y-6">
                    <header className="flex flex-col lg:flex-row justify-between items-center bg-white/90 backdrop-blur-md p-6 md:px-10 rounded-3xl border border-amber-200 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 blur-[120px] -z-10 group-hover:bg-amber-500/10 transition-all"></div>
                        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left mb-6 lg:mb-0">
                            <div className="bg-amber-100 p-3 rounded-2xl border border-amber-200 shadow-inner group-hover:rotate-12 transition-transform duration-500">
                                <Heart size={32} className="text-amber-700 animate-pulse fill-amber-700" />
                            </div>
                            <div className="space-y-1 leading-tight">
                                <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-800 to-orange-800 tracking-tighter italic">
                                    PAIRED PROFILES
                                </h1>
                                <p className="text-stone-500 font-black uppercase tracking-[0.2em] text-[8px] flex items-center justify-center md:justify-start gap-4">
                                    <span className="w-6 h-px bg-amber-200"></span>
                                    Confirmed Celestial Unions
                                    <span className="w-6 h-px bg-amber-200"></span>
                                </p>
                            </div>
                        </div>
                    </header>

                    {error && (
                        <div className="bg-red-50 border border-red-200 p-6 rounded-3xl text-center">
                            <AlertTriangle className="mx-auto text-red-500 mb-2 size-8" />
                            <p className="text-red-700 font-bold">{error}</p>
                            <p className="text-red-600 text-xs mt-1">Make sure you have run the schema migration (`supabase_paired_profiles_schema.sql`) in Supabase SQL editor.</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex flex-col justify-center items-center py-20 bg-slate-900/20 rounded-[3rem] border border-white/5">
                            <div className="relative">
                                <div className="size-20 rounded-full border-t-2 border-amber-500 animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Activity className="text-amber-500 size-8 animate-pulse" />
                                </div>
                            </div>
                            <p className="mt-6 text-slate-400 font-bold tracking-widest uppercase text-xs animate-pulse">Loading Unions...</p>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in duration-700">
                            {pairs.length === 0 && !error ? (
                                <div className="py-24 text-center bg-slate-950/30 rounded-[3rem] border border-white/5 border-dashed">
                                    <Search className="mx-auto size-16 text-slate-800 mb-4" />
                                    <h3 className="text-2xl font-black text-slate-400">No Paired Profiles yet</h3>
                                    <p className="text-slate-600 mt-2 font-medium">Head to Astrology Matches to match seekers.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {pairs.map((pair, idx) => (
                                        <motion.div 
                                          initial={{ opacity: 0, y: 20 }} 
                                          animate={{ opacity: 1, y: 0 }} 
                                          transition={{ delay: idx * 0.05 }}
                                          key={pair.id} 
                                          className="group bg-white border border-amber-200 rounded-[2.5rem] overflow-hidden shadow-lg transition-all hover:-translate-y-1 relative"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[40px] -z-10 group-hover:bg-amber-500/20 transition-all"></div>
                                            
                                            {/* Groom Info */}
                                            <div className="p-6 bg-amber-50/50 border-b border-amber-100 flex flex-col items-center text-center">
                                                <span className="text-[9px] text-amber-700 font-black uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-amber-200 shadow-sm mb-3">Groom</span>
                                                <h3 className="text-lg font-black text-stone-900 tracking-tight">{pair.groom.full_name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">{pair.groom.place_of_birth_city}</span>
                                                    <span className="w-1 h-1 rounded-full bg-amber-300"></span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Age: {pair.groom.age || calculateAge(pair.groom.date_of_birth || pair.groom.birth_date)}</span>
                                                </div>
                                                <p className="text-xs font-bold text-stone-500 mt-2">{pair.groom.nakshatram} - {pair.groom.rasi}</p>
                                            </div>
                                            
                                            {/* Connector Icon */}
                                            <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 border border-amber-200 shadow-sm z-10">
                                                <Heart className="size-5 fill-amber-500 text-amber-500" />
                                            </div>

                                            {/* Bride Info */}
                                            <div className="p-6 bg-orange-50/50 flex flex-col items-center text-center">
                                                <span className="text-[9px] text-orange-700 font-black uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-orange-200 shadow-sm mb-3">Bride</span>
                                                <h3 className="text-lg font-black text-stone-900 tracking-tight">{pair.bride.full_name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">{pair.bride.place_of_birth_city}</span>
                                                    <span className="w-1 h-1 rounded-full bg-orange-300"></span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-700">Age: {pair.bride.age || calculateAge(pair.bride.date_of_birth || pair.bride.birth_date)}</span>
                                                </div>
                                                <p className="text-xs font-bold text-stone-500 mt-2">{pair.bride.nakshatram} - {pair.bride.rasi}</p>
                                            </div>
                                            
                                            <div className="px-6 pb-6 bg-stone-50 border-t border-stone-100 flex flex-col items-center gap-4">
                                                <p className="text-[9px] text-stone-400 font-black uppercase tracking-widest mt-4">
                                                    Paired on {new Date(pair.created_at).toLocaleDateString()}
                                                </p>
                                                <button 
                                                    onClick={() => handleRevert(pair.id)}
                                                    className="w-full bg-white border border-stone-200 hover:border-red-300 hover:text-red-600 text-stone-500 font-black py-3 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest group/btn"
                                                >
                                                    <XCircle size={14} className="group-hover/btn:rotate-90 transition-transform"/> REVERT UNION
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppShell>
    );
}
