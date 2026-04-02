'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Search, Filter, ArrowRight, Sparkles, Calendar, MapPin, Star, MoreVertical, Trash2, ClipboardList, Plus, X, Loader2 } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { getSavedCharts, saveBirthChart } from '@/utils/astrology/actions'
import { calculateBirthChart } from '@/utils/astrology/calculations'

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // New Client Form State
  const [showForm, setShowForm] = useState(false)
  const [fullName, setFullName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [birthTime, setBirthTime] = useState('')
  const [birthLocation, setBirthLocation] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const loadClients = async () => {
    try {
      const data = await getSavedCharts()
      setClients(data)
    } catch (err) {
      console.error('Failed to load clients:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  const handleCreate = async () => {
    if (!fullName || !birthDate || !birthTime) return
    setIsCreating(true)
    try {
      const result = await calculateBirthChart({
        date: `${birthDate}T${birthTime}`,
        latitude: 28.6139, // Default/Placeholder as used in birth-chart page
        longitude: 77.2090
      })
      
      await saveBirthChart({
        fullName,
        birthDate,
        birthTime,
        location: birthLocation,
        latitude: 28.6139,
        longitude: 77.2090,
        resultData: result
      })

      // Reset & Refresh
      setFullName('')
      setBirthDate('')
      setBirthTime('')
      setBirthLocation('')
      setShowForm(false)
      await loadClients()
    } catch (error) {
      console.error("Creation failed:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const filteredClients = clients.filter(client => 
    client.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto py-8 px-4 space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-500 uppercase tracking-[0.3em] font-black"
            >
              <Sparkles className="w-3 h-3" />
              Client Management
            </motion.div>
            <h1 className="text-5xl font-black text-white uppercase tracking-tighter">
              Cosmic <span className="text-amber-400 text-6xl">Directory</span>
            </h1>
            <p className="text-slate-500 text-sm max-w-md font-medium">
              Oversee and manage your seekers' celestial profiles and birth alignments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group min-w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search seeker..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/40 focus:bg-white/[0.08] transition-all outline-none"
              />
            </div>
            <motion.button
              onClick={() => setShowForm(!showForm)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`h-12 px-6 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                showForm 
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                  : 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.2)]'
              }`}
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? 'Cancel' : 'New Seeker'}
            </motion.button>
          </div>
        </div>

        {/* Create Form Section */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-8 rounded-[2.5rem] bg-slate-900/40 backdrop-blur-3xl border border-amber-500/20 space-y-8 mb-10">
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <h2 className="text-xl font-bold text-white uppercase italic tracking-tight">Register New Alignment</h2>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Map the cosmic paths of a new seeker</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter name"
                      className="w-full h-12 px-4 rounded-xl bg-slate-950/40 border border-white/5 text-sm text-white focus:outline-none focus:border-amber-500/40 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest ml-1">Birth Date</label>
                    <input 
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-slate-950/40 border border-white/5 text-sm text-white focus:outline-none focus:border-amber-500/40 transition-all [color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest ml-1">Birth Time</label>
                    <input 
                      type="time"
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-slate-950/40 border border-white/5 text-sm text-white focus:outline-none focus:border-amber-500/40 transition-all [color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest ml-1">Location</label>
                    <input 
                      type="text"
                      value={birthLocation}
                      onChange={(e) => setBirthLocation(e.target.value)}
                      placeholder="City, Country"
                      className="w-full h-12 px-4 rounded-xl bg-slate-950/40 border border-white/5 text-sm text-white focus:outline-none focus:border-amber-500/40 transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <motion.button
                    onClick={handleCreate}
                    disabled={isCreating || !fullName || !birthDate || !birthTime}
                    whileHover={{ scale: 1.02 }}
                    className="h-12 px-10 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[11px] font-black uppercase tracking-[0.2em] shadow-lg disabled:opacity-30 disabled:grayscale transition-all flex items-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Synchronizing...
                      </>
                    ) : (
                      'Initialize Profile'
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clients Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-[2.5rem] bg-white/5 border border-white/10 animate-pulse" />
            ))}
          </div>
        ) : filteredClients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredClients.map((client, index) => (
                <motion.div
                  key={client.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ delay: index * 0.05 }}
                  className="group p-8 rounded-[2.5rem] border border-white/5 bg-slate-900/40 backdrop-blur-2xl hover:border-amber-400/30 transition-all relative overflow-hidden"
                  style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 0 20px rgba(255,255,255,0.02)' }}
                >
                  {/* Background flare */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all" />

                  <div className="space-y-6 relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                        <User className="w-6 h-6" />
                      </div>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-white transition-colors hover:bg-white/5">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tight truncate leading-none">
                        {client.full_name}
                      </h3>
                      <div className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em] mt-1 shrink-0">
                        Client #{index + 1}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-slate-400">
                        <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                          <Calendar className="w-3.5 h-3.5 text-amber-500/40" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-widest leading-none pt-0.5">{client.birth_date} • {client.birth_time}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400">
                        <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                          <MapPin className="w-3.5 h-3.5 text-amber-500/40" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-widest truncate pt-0.5">{client.location}</span>
                      </div>
                    </div>

                    {/* Result Summary - Nakshatra focus as requested */}
                    <div className="pt-4 border-t border-white/5 flex gap-3">
                      <div className="flex-1 p-3 rounded-2xl bg-slate-950/40 border border-white/5 text-center">
                        <div className="text-[9px] font-black text-amber-500/40 uppercase tracking-[0.3em] mb-1">Nakshatra</div>
                        <div className="text-sm font-black text-white uppercase italic truncate">
                          {client.result_data?.moonSign?.nakshatra || 'Unknown'}
                        </div>
                      </div>
                      <div className="flex-1 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-center">
                        <div className="text-[9px] font-black text-amber-500/40 uppercase tracking-[0.3em] mb-1">Path Star</div>
                        <div className="text-sm font-black text-amber-400 uppercase italic truncate">
                           {client.result_data?.moonSign?.nakshatra || 'Unknown'}
                        </div>
                      </div>
                    </div>

                    <motion.button
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/10 text-[10px] font-black uppercase tracking-widest text-amber-500 group-hover:from-amber-500/20 group-hover:to-amber-600/10 group-hover:border-amber-500/30 transition-all flex items-center justify-center gap-3"
                    >
                      Connect Profile
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="h-80 flex flex-col items-center justify-center text-center space-y-6 border border-dashed border-white/10 rounded-[3rem] bg-white/5">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
              <User className="w-10 h-10 text-slate-700" />
            </div>
            <div className="space-y-1">
              <h3 className="text-white font-black uppercase tracking-[0.2em]">Universal Void</h3>
              <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">Start by adding a profile in the cosmic directory.</p>
            </div>
            <motion.button
               onClick={() => setShowForm(true)}
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className="px-8 py-3 rounded-xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest font-black"
            >
              Add First Client
            </motion.button>
          </div>
        )}
      </div>
    </AppShell>
  )
}

