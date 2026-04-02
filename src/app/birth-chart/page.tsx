'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, Calendar, Clock, MapPin, User, Sparkles as SparklesIcon, ClipboardList, ArrowLeft, Download, Share2 } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { calculateBirthChart, RASHI_NAMES } from '@/utils/astrology/calculations'
import { saveBirthChart, getSavedCharts } from '@/utils/astrology/actions'
import { BirthChart } from '@/types/astrology'
import KundaliChart from '@/components/astrology/KundaliChart'
import PlanetaryTable from '@/components/astrology/PlanetaryTable'
import DashaTimeline from '@/components/astrology/DashaTimeline'

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira",
  "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha",
  "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra",
  "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula",
  "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta",
  "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

function getNakshatra(moonLongitude: number): string {
  const nakshatraSize = 360 / 27; // Exactly 13.3333333... degrees
  const index = Math.floor(moonLongitude / nakshatraSize) % 27;
  return NAKSHATRAS[index] || "Unknown";
}

export default function BirthChartPage() {
  const [birthDate, setBirthDate] = useState('')
  const [birthTime, setBirthTime] = useState('')
  const [birthLocation, setBirthLocation] = useState('')
  const [fullName, setFullName] = useState('')
  const [chart, setChart] = useState<BirthChart | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [savedCharts, setSavedCharts] = useState<any[]>([])

  useEffect(() => {
    async function loadHistory() {
      try {
        const history = await getSavedCharts()
        setSavedCharts(history)
      } catch (err) {
        console.error('History load failed:', err)
      }
    }
    loadHistory()
  }, [])

  const handleCalculate = async () => {
    setIsCalculating(true)
    try {
      const result = await calculateBirthChart({
        date: `${birthDate}T${birthTime}`,
        latitude: 28.6139,
        longitude: 77.2090
      })
      
      setChart(result as any)

      if (fullName) {
        await saveBirthChart({
          fullName,
          birthDate,
          birthTime,
          location: birthLocation,
          latitude: 28.6139,
          longitude: 77.2090,
          resultData: result
        })
        const updated = await getSavedCharts()
        setSavedCharts(updated)
      }
    } catch (error) {
      console.error("Calculation failed:", error)
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-8">
        {!chart ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-12"
          >
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 uppercase tracking-widest font-black">
                <SparklesIcon className="w-3 h-3" />
                Birth Chart Calculator
              </div>
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
                Enter your <span className="text-amber-400">Cosmic Coordinates</span>
              </h2>
            </div>

            <div 
              className="p-8 rounded-3xl space-y-8 max-w-md mx-auto border border-amber-500/20 bg-slate-900/40 backdrop-blur-2xl"
              style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 40px rgba(251, 191, 36, 0.1)' }}
            >
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-amber-400 uppercase tracking-widest">
                    <User className="w-3 h-3" />
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full h-14 rounded-2xl px-5 text-sm bg-slate-950/40 border border-white/5 text-white placeholder-slate-600 focus:border-amber-500/40 transition-all outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-amber-400 uppercase tracking-widest">
                      <Calendar className="w-3 h-3" />
                      Date
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full h-14 rounded-2xl px-5 text-sm bg-slate-950/40 border border-white/5 text-white focus:border-amber-500/40 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-amber-400 uppercase tracking-widest">
                      <Clock className="w-3 h-3" />
                      Time
                    </label>
                    <input
                      type="time"
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      className="w-full h-14 rounded-2xl px-5 text-sm bg-slate-950/40 border border-white/5 text-white focus:border-amber-500/40 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-amber-400 uppercase tracking-widest">
                    <MapPin className="w-3 h-3" />
                    Place (Optional)
                  </label>
                  <input
                    type="text"
                    value={birthLocation}
                    onChange={(e) => setBirthLocation(e.target.value)}
                    placeholder="City, Country"
                    className="w-full h-14 rounded-2xl px-5 text-sm bg-slate-950/40 border border-white/5 text-white focus:border-amber-500/40 transition-all"
                  />
                </div>
              </div>

              <motion.button
                onClick={handleCalculate}
                disabled={!birthDate || !birthTime || isCalculating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-14 rounded-2xl font-black text-white text-xs uppercase tracking-widest transition-all bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_4px_20px_rgba(251,191,36,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCalculating ? 'Processing...' : 'Calculate Cosmic Chart'}
              </motion.button>
            </div>

            {/* History Integration */}
            {savedCharts.length > 0 && (
              <div className="max-w-md mx-auto space-y-5 pt-8">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-2 border-l-2 border-amber-500/40 ml-2">
                  <ClipboardList className="w-3 h-3" />
                  Recent Profiles
                </div>
                <div className="grid gap-3">
                  {savedCharts.slice(0, 3).map((save) => (
                    <button
                      key={save.id}
                      onClick={() => {
                        setFullName(save.full_name)
                        setBirthDate(save.birth_date)
                        setBirthTime(save.birth_time)
                        setBirthLocation(save.location)
                        setChart(save.result_data)
                      }}
                      className="p-5 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-amber-500/40 transition-all text-left group flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-black text-white uppercase tracking-wider group-hover:text-amber-400 transition-colors uppercase italic">{save.full_name}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{new Date(save.created_at).toLocaleDateString()}</div>
                      </div>
                      <ArrowLeft className="w-4 h-4 text-amber-500/40 rotate-180" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10"
          >
            {/* Results Nav */}
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
              <div className="flex items-center gap-5">
                <button
                  onClick={() => setChart(null)}
                  className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
                    Cosmic <span className="text-amber-400 text-6xl">Portrait</span>
                  </h2>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">
                    Analysis for {fullName || 'Seeker'}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="px-5 py-3 rounded-2xl bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all border border-white/5">
                  <Download className="w-4 h-4" />
                </button>
                <button className="px-5 py-3 rounded-2xl bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-500/20 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                  Share Path
                </button>
              </div>
            </div>

            {/* Analysis Grid */}
            <div className="grid lg:grid-cols-12 gap-10">
              <div className="lg:col-span-5 space-y-10">
                <div className="p-10 rounded-[3rem] border border-amber-400/20 bg-slate-900/60 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
                  <KundaliChart houses={chart.kundali.houses} />
                  
                  <div className="grid grid-cols-2 gap-4 mt-8">
                     <div className="p-5 rounded-3xl bg-slate-950/60 border border-white/5 text-center space-y-1">
                        <div className="text-[10px] font-black text-amber-500/40 uppercase tracking-[0.2em]">Sign</div>
                        <div className="text-xl font-black text-white uppercase italic">{RASHI_NAMES[chart.positions.moon.rashi - 1]}</div>
                     </div>
                     <div className="p-5 rounded-3xl bg-slate-950/60 border border-white/5 text-center space-y-1">
                        <div className="text-[10px] font-black text-amber-500/40 uppercase tracking-[0.2em]">Star</div>
                        <div className="text-xl font-black text-white uppercase italic leading-none">{getNakshatra(chart.positions.moon.longitude)}</div>
                     </div>
                  </div>
                </div>

                <div className="p-8 rounded-[2.5rem] border border-white/5 bg-slate-900/20">
                    <div className="text-[10px] font-black text-amber-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24]" />
                       Panchang at Birth
                    </div>
                    <div className="grid grid-cols-2 gap-x-10 gap-y-4">
                       {[
                         { label: 'Tithi', value: chart.panchang.tithi },
                         { label: 'Vara', value: chart.panchang.vara },
                         { label: 'Yoga', value: chart.panchang.yoga },
                         { label: 'Karana', value: chart.panchang.karana }
                       ].map(item => (
                         <div key={item.label} className="flex justify-between items-end border-b border-white/5 pb-2">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                           <span className="text-sm font-bold text-slate-100">{item.value}</span>
                         </div>
                       ))}
                    </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-10">
                <PlanetaryTable 
                  planets={Object.entries(chart.positions).map(([id, p]: any) => ({
                    id,
                    name: id.toUpperCase(),
                    rashi: RASHI_NAMES[p.rashi - 1],
                    degree: `${p.degree.toFixed(2)}°`,
                    nakshatra: p.nakshatra,
                    pada: p.pada,
                    status: p.isRetro ? 'Retrograde' : 'Direct'
                  }))} 
                />
                
                <DashaTimeline dashas={chart.dashas} />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AppShell>
  )
}
