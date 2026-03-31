'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Activity, User, Shield, Zap, Info, ChevronRight, Check, X, Sparkles, AlertCircle } from 'lucide-react'
import { getSavedCharts } from '@/utils/astrology/actions'
import { calculateAshtaKoota } from '@/utils/astrology/matching'
import { MatchResult } from '@/types/astrology'

const KOOTA_DETAILS = {
  varna: { icon: Shield, color: 'text-amber-400' },
  vashya: { icon: Heart, color: 'text-pink-400' },
  tara: { icon: Zap, color: 'text-blue-400' },
  yoni: { icon: Activity, color: 'text-rose-400' },
  maitri: { icon: User, color: 'text-emerald-400' },
  gana: { icon: Sparkles, color: 'text-purple-400' },
  bhakoot: { icon: Info, color: 'text-cyan-400' },
  nadi: { icon: AlertCircle, color: 'text-rose-500' },
}

export default function MatchesPage() {
  const [charts, setCharts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [brideId, setBrideId] = useState<string | null>(null)
  const [groomId, setGroomId] = useState<string | null>(null)
  const [rankedPartners, setRankedPartners] = useState<any[]>([])
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)

  useEffect(() => {
    async function init() {
      try {
        const data = await getSavedCharts()
        setCharts(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Celestial Scan: Rank all potential partners when Partner 1 is selected
  useEffect(() => {
    if (brideId && charts.length > 0) {
      const bride = charts.find(c => c.id === brideId)
      if (!bride) return

      const potentials = charts
        .filter(c => c.id !== brideId)
        .map(partner => {
          const match = calculateAshtaKoota(bride.result_data.positions.moon, partner.result_data.positions.moon)
          return {
            ...partner,
            matchScore: match.totalGuna,
            verdict: match.overallVerdict
          }
        })
        .sort((a, b) => b.matchScore - a.matchScore)

      setRankedPartners(potentials)
      // Reset groom if not in current ranked list
      if (groomId === brideId) setGroomId(null)
    } else {
      setRankedPartners([])
    }
  }, [brideId, charts])

  const calculateMatch = () => {
    if (!brideId || !groomId) return
    const bride = charts.find(c => c.id === brideId)
    const groom = charts.find(c => c.id === groomId)
    
    if (bride && groom) {
      const res = calculateAshtaKoota(bride.result_data.positions.moon, groom.result_data.positions.moon)
      setMatchResult(res as any)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6"
        >
          <Sparkles className="w-3 h-3" />
          Celestial Affinity Engine
        </motion.div>
        <h1 className="text-5xl font-black uppercase tracking-tighter text-white">
          Astrology <span className="text-amber-500">Matches</span>
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto leading-relaxed">
          Unlock the cosmic blueprint of your relationship. Our engine calculates the sacred 36 Gunas to reveal your spiritual and intellectual resonance.
        </p>
      </div>

      {charts.length < 2 ? (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center space-y-6">
          <Activity className="w-16 h-16 text-slate-600 mx-auto animate-pulse" />
          <div className="space-y-2">
            <h3 className="text-xl font-bold uppercase tracking-widest text-white">Insufficient Profiles</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              You need at least two saved birth charts to calculate compatibility. Journey to the "Birth Chart" section to add more profiles.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2 block">
                Partner 1 (Select First)
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                {charts.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setBrideId(c.id)}
                    className={`text-left p-4 rounded-2xl border transition-all ${
                      brideId === c.id 
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-bold text-sm uppercase truncate">{c.full_name}</div>
                    <div className="text-[10px] opacity-70 mt-1">{c.result_data.positions.moon.nakshatra}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2 block">
                Partner 2 (Ranked By Score)
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                {!brideId ? (
                  <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center text-slate-600">
                    <Info className="w-6 h-6 mx-auto mb-2 opacity-20" />
                    <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">Select Partner 1 to scan for affinity</p>
                  </div>
                ) : (
                  rankedPartners.map(c => (
                    <motion.button
                      layout
                      key={c.id}
                      onClick={() => setGroomId(c.id)}
                      className={`text-left p-4 rounded-2xl border transition-all group relative overflow-hidden ${
                        groomId === c.id 
                          ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-bold text-sm uppercase truncate pr-8">{c.full_name}</div>
                        <div className={`text-[10px] font-black ${
                          c.matchScore >= 24 ? 'text-emerald-400' : 
                          c.matchScore >= 18 ? 'text-amber-400' : 'text-slate-500'
                        }`}>
                          {c.matchScore} Gunas
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-[10px] opacity-70">{c.result_data.positions.moon.nakshatra}</div>
                        <div className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          c.matchScore >= 24 ? 'bg-emerald-500/10 text-emerald-500/70 border border-emerald-500/20' : 
                          c.matchScore >= 18 ? 'bg-amber-500/10 text-amber-500/70 border border-amber-500/20' : 'bg-white/5 text-slate-600'
                        }`}>
                          {c.verdict}
                        </div>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </div>

            <button
              disabled={!brideId || !groomId}
              onClick={calculateMatch}
              className="col-span-2 mt-4 py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-400 text-black font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
            >
              Align Celestial Paths
            </button>
          </div>

          {/* Results Area */}
          <div className="min-h-[500px]">
            <AnimatePresence mode="wait">
              {matchResult ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#1a0b36]/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 space-y-8"
                >
                  <div className="text-center space-y-4 relative">
                    <div className="text-[13rem] font-black leading-none text-white/5 absolute -top-8 left-1/2 -translate-x-1/2 select-none">
                      {matchResult.totalGuna}
                    </div>
                    <div className="relative z-10">
                      <div className="text-xs font-black uppercase tracking-[0.5em] text-amber-500/60 mb-2">Guna Score</div>
                      <div className="text-7xl font-black text-white">{matchResult.totalGuna}<span className="text-2xl text-slate-600 ml-2">/ 36</span></div>
                      <div className={`mt-4 inline-block px-6 py-2 rounded-full font-black uppercase tracking-[0.2em] text-[10px] border ${
                        matchResult.totalGuna >= 24 ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 
                        matchResult.totalGuna >= 18 ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' :
                        'bg-rose-500/10 border-rose-500/50 text-rose-400'
                      }`}>
                        {matchResult.overallVerdict} Match
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Cosmic Summary</div>
                      <p className="text-sm text-slate-300 leading-relaxed font-medium">{matchResult.summary}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {matchResult.breakdown.map((item, idx) => {
                        const KIcon = (KOOTA_DETAILS as any)[item.id].icon;
                        const kColor = (KOOTA_DETAILS as any)[item.id].color;
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/[0.08] hover:border-white/10 transition-all cursor-default"
                          >
                            <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${kColor}`}>
                              <KIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="text-xs font-bold uppercase tracking-widest text-white">{item.name}</div>
                                <div className="text-[10px] font-black text-slate-500">{item.score} / {item.maxScore}</div>
                              </div>
                              <div className="text-[10px] text-slate-500 mt-1 line-clamp-1 group-hover:line-clamp-none transition-all">
                                {item.description}
                              </div>
                            </div>
                            {item.score > item.maxScore / 2 ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <X className="w-4 h-4 text-rose-500" />
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30 px-12">
                  <Activity className="w-20 h-20 text-slate-600" />
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-widest text-white">Waiting for Input</h3>
                    <p className="text-xs text-slate-500 mt-2 max-w-[200px] mx-auto">Select two celestial paths from your profiles to align them.</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}
