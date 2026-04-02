'use client'

import { motion } from 'framer-motion'
import { Sparkles, Construction } from 'lucide-react'

export default function MatchesPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full" />
      
      <div className="relative z-10 text-center space-y-8">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.3em]"
        >
          <Sparkles className="w-3 h-3" />
          Celestial Affinity
        </motion.div>

        <div className="space-y-4">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white"
          >
            Refining the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">Cosmic Engine</span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed font-medium"
          >
            We are currently re-calibrating our matching algorithms to provide deeper insights into your spiritual and intellectual resonance.
          </motion.p>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-4 pt-4"
        >
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300">
            <Construction className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-bold uppercase tracking-widest">Under Development</span>
          </div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-amber-500/40 rounded-full animate-ping" />
        <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse" />
        <div className="absolute bottom-1/2 left-1/3 w-1 h-1 bg-orange-500/40 rounded-full animate-bounce" />
      </div>
    </div>
  )
}
