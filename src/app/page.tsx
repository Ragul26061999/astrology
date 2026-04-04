'use client'

import { motion } from 'framer-motion'
import { Calculator, Heart, Sparkles as SparklesIcon, StickyNote, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'

export default function Home() {
  const cards = [
    {
      title: 'Match Making',
      desc: 'Analyze cosmic compatibility between two souls.',
      icon: Heart,
      href: '/matches',
      color: 'rose'
    },
    {
      title: 'Atonement',
      desc: 'Discover spiritual remedies and planetary rituals.',
      icon: SparklesIcon,
      href: '#',
      color: 'purple'
    },
    {
      title: 'Spiritual Notes',
      desc: 'Keep a private journal of your spiritual progress.',
      icon: StickyNote,
      href: '#',
      color: 'emerald'
    }
  ]

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-12 space-y-16">
        <header className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-black uppercase tracking-[0.4em] text-amber-500"
          >
            <SparklesIcon className="w-3 h-3" />
            Vedic Intelligence Platform
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white italic tracking-tighter leading-none"
          >
            ASCEND YOUR <br />
            <span className="text-amber-400 font-serif">COSMIC DESTINY</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-slate-400 text-xs font-bold uppercase tracking-widest max-w-sm mx-auto leading-relaxed opacity-70"
          >
            High-precision astronomical engines powered by ancient Vedic wisdom.
          </motion.p>
        </header>

        <section className="grid md:grid-cols-2 gap-6">
          {cards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link
                href={card.href}
                className="group block p-8 rounded-[2.5rem] border border-white/5 bg-slate-900/40 backdrop-blur-2xl hover:border-amber-400/40 transition-all relative overflow-hidden h-full"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors" />
                <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                    <card.icon className="w-7 h-7 text-amber-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-wider">{card.title}</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-loose">{card.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 text-amber-400 text-[10px] font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                    Explore Path <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </section>
      </div>
    </AppShell>
  )
}
