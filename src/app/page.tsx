'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  UserCheck, 
  Activity, 
  MapPin, 
  Moon, 
  Sparkles, 
  ArrowUpRight, 
  Calendar,
  Clock,
  Heart,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'

export default function Home() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [pairs, setPairs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [profilesRes, pairsRes] = await Promise.all([
          fetch('/api/matches/profiles'),
          fetch('/api/matches/pairs')
        ])
        
        const profilesData = await profilesRes.json()
        const pairsData = await pairsRes.json()

        if (profilesData.success) {
          setProfiles(profilesData.profiles)
        }
        if (pairsData.success) {
          setPairs(pairsData.pairs || [])
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const stats = {
    total: profiles.length,
    grooms: profiles.filter(p => p.gender?.toLowerCase() === 'male').length,
    brides: profiles.filter(p => p.gender?.toLowerCase() === 'female').length,
    totalPairs: pairs.length,
    recentPairs: pairs.slice(0, 3),
    recent: profiles.slice(0, 4),
    locations: Array.from(new Set(profiles.map(p => p.birth_place || p.place_of_birth_city))).slice(0, 3)
  }

  const kpis = [
    { label: 'Total Seekers', value: stats.total, icon: Users, color: 'stone' },
    { label: 'Total Pairs', value: stats.totalPairs, icon: Sparkles, color: 'amber' },
    { label: 'Grooms Active', value: stats.grooms, icon: UserCheck, color: 'stone' },
    { label: 'Brides Active', value: stats.brides, icon: Heart, color: 'stone' },
  ]

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto py-8 space-y-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-amber-600 font-black uppercase tracking-[0.3em] text-[10px]"
            >
              <Sparkles size={12} />
              Operational Intelligence
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black text-stone-900 italic tracking-tighter"
            >
              GALAXY <span className="text-amber-600 font-serif">OVERVIEW</span>
            </motion.h1>
          </div>
          
          <div className="flex gap-4">
            <Link href="/astrology" className="px-5 py-2.5 rounded-xl border border-stone-200 bg-white text-[10px] font-black uppercase tracking-widest hover:bg-stone-50 transition-all shadow-sm flex items-center gap-2">
              Calculate <ArrowUpRight size={14} />
            </Link>
            <Link href="/matches" className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center gap-2">
              Match Engine <ArrowUpRight size={14} />
            </Link>
          </div>
        </header>

        {/* KPI Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, idx) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xl relative overflow-hidden group"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${kpi.color}-500/5 rounded-full blur-3xl group-hover:bg-${kpi.color}-500/10 transition-colors`} />
              <div className="relative z-10 space-y-4">
                <div className={`w-10 h-10 rounded-xl bg-${kpi.color}-100 flex items-center justify-center border border-${kpi.color}-200`}>
                  <kpi.icon className={`w-5 h-5 text-${kpi.color}-700`} />
                </div>
                <div>
                  <p className="text-[9px] text-stone-500 font-black uppercase tracking-widest">{kpi.label}</p>
                  <p className="text-2xl font-black text-stone-900">
                    {loading ? <span className="animate-pulse">...</span> : kpi.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Main Dashboard Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tracking Card: Recent Registrations & Paired Tracking */}
          <section className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-stone-200 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-stone-900 uppercase tracking-tight flex items-center gap-3">
                     <div className="w-1.5 h-6 bg-amber-600 rounded-full" />
                     Recent Seekers
                  </h3>
                  <Link href="/profiles" className="text-[10px] font-black text-amber-700 uppercase tracking-widest hover:underline flex items-center gap-1">
                     Full Registry <ChevronRight size={12} />
                  </Link>
               </div>

               <div className="relative">
                  {loading ? (
                    <div className="space-y-4">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-16 bg-stone-50 rounded-2xl animate-pulse" />
                      ))}
                    </div>
                  ) : stats.total === 0 ? (
                    <div className="py-20 text-center text-stone-400 font-bold italic">
                      No seekers registered in the current epoch.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {stats.recent.map((profile, i) => (
                        <div key={profile.id} className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-100 hover:border-amber-200 hover:bg-white transition-all group">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center font-black text-stone-400 text-xs">
                                 {profile.full_name?.[0]}
                              </div>
                              <div>
                                 <p className="text-sm font-black text-stone-900">{profile.full_name}</p>
                                 <p className="text-[9px] text-stone-500 font-bold uppercase tracking-widest">{profile.rasi} • {profile.nakshatram}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-[9px] text-stone-400 font-black uppercase tracking-widest italic">{profile.birth_place || profile.place_of_birth_city}</p>
                              <p className="text-[8px] text-amber-600 font-black uppercase tracking-[0.2em]">{profile.gender}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
               </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-stone-900 uppercase tracking-tight flex items-center gap-3">
                     <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
                     Recent Pairs
                  </h3>
                  <Link href="/paired-profiles" className="text-[10px] font-black text-rose-700 uppercase tracking-widest hover:underline flex items-center gap-1">
                     All Collections <ChevronRight size={12} />
                  </Link>
               </div>

               <div className="space-y-4">
                  {loading ? (
                    <div className="space-y-4">
                       {[1,2].map(i => <div key={i} className="h-20 bg-stone-50 rounded-2xl animate-pulse" />)}
                    </div>
                  ) : stats.totalPairs === 0 ? (
                    <div className="py-10 text-center text-stone-400 font-bold italic border border-dashed border-stone-200 rounded-2xl">
                       No cosmic unions established yet.
                    </div>
                  ) : (
                    stats.recentPairs.map((pair: any) => (
                      <div key={pair.id} className="flex items-center justify-between p-5 rounded-2xl bg-stone-50 border border-stone-100 relative group overflow-hidden">
                         <div className="absolute inset-y-0 left-0 w-1 bg-rose-500/30 group-hover:bg-rose-500 transition-all" />
                         <div className="flex items-center gap-8 flex-1">
                            <div className="flex flex-col items-center">
                               <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Groom</p>
                               <span className="text-xs font-black text-stone-900">{pair.groom?.full_name}</span>
                            </div>
                            <div className="size-8 rounded-full bg-rose-100 flex items-center justify-center border border-rose-200 text-rose-600">
                               <Heart size={14} className="animate-pulse" fill="currentColor" />
                            </div>
                            <div className="flex flex-col items-center">
                               <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Bride</p>
                               <span className="text-xs font-black text-stone-900">{pair.bride?.full_name}</span>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Paired On</p>
                            <p className="text-[10px] font-black text-stone-600">{new Date(pair.created_at).toLocaleDateString()}</p>
                         </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
          </section>

          {/* Tracking Card: Celestial Insights */}
          <section className="bg-stone-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] -z-0" />
             <div className="relative z-10 space-y-8">
                <div className="space-y-2">
                   <h3 className="text-xl font-black uppercase tracking-tight">Celestial Span</h3>
                   <p className="text-[10px] text-stone-500 font-black uppercase tracking-widest">Active nodes in the data graph</p>
                </div>

                <div className="space-y-6">
                   <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Node Connectivity</span>
                         <span className="text-xs font-black text-emerald-400">Stable</span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                         <div className="h-full bg-amber-500 w-[78%]" />
                      </div>
                   </div>

                   <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">Top Birth Realms</p>
                      <div className="flex flex-wrap gap-2">
                         {stats.locations.map(loc => (
                            <span key={loc} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-stone-300">
                               {loc}
                            </span>
                         ))}
                         {stats.locations.length === 0 && <span className="text-xs italic text-stone-600">Pending data...</span>}
                      </div>
                   </div>

                   <div className="pt-4 border-t border-white/5">
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                         <div className="p-2 rounded-xl bg-amber-500/20">
                            <Activity size={16} className="text-amber-500" />
                         </div>
                         <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-amber-500">Sync Frequency</p>
                            <p className="text-xs font-black">2.4ms Latency</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </section>
        </div>
      </div>
    </AppShell>
  )
}

