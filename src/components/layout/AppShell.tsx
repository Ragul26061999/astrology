'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Star, Sun, LogOut, User, Calculator, Calendar, Clock, MapPin, Home, Heart, Sparkles as SparklesIcon, StickyNote, Menu, X, ClipboardList } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home, href: '/' },
  { id: 'birth-chart', label: 'Birth Chart Calculator', icon: Calculator, href: '/birth-chart' },
  { id: 'matches', label: 'Astrology Matches', icon: Heart, href: '/matches' },
  { id: 'atonement', label: 'Atonement', icon: SparklesIcon, href: '#' },
  { id: 'clients', label: 'Clients', icon: User, href: '/clients' },
]

const FloatingStar = ({ size, top, left, delay }: { size: number, top: string, left: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.2, 1] }}
    transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay }}
    className="absolute rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
    style={{ width: size, height: size, top, left }}
  />
)

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [stars, setStars] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [status, setStatus] = useState<'idle' | 'connected' | 'error'>('idle')
  
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    const newStars = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 5
    }))
    setStars(newStars)

    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
        setStatus('connected')
      } else {
        setStatus('idle')
      }
    }
    init()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen flex relative overflow-hidden text-slate-100" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 bg-[#0f0524]" style={{
        background: 'linear-gradient(135deg, #0f0524 0%, #1a0b2e 30%, #162044 60%, #0d1a33 100%)',
      }}>
        {stars.map((star) => (
          <FloatingStar key={star.id} {...star} />
        ))}
        
        {/* Constellation lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <line x1="10%" y1="15%" x2="15%" y2="25%" stroke="#fbbf24" strokeWidth="0.5" />
          <line x1="15%" y1="25%" x2="25%" y2="20%" stroke="#fbbf24" strokeWidth="0.5" />
          <line x1="80%" y1="60%" x2="85%" y2="75%" stroke="#fbbf24" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="fixed left-0 top-0 h-full w-[280px] z-40 flex flex-col border-r border-amber-500/20 bg-slate-900/80 backdrop-blur-3xl"
          >
            <div className="p-6 border-b border-amber-400/20">
              <div className="flex items-center gap-3 text-white">
                <SparklesIcon className="w-8 h-8 text-amber-400" />
                <div>
                  <div className="font-black uppercase tracking-tighter">AstroVeda</div>
                  <div className="text-[9px] text-amber-500 uppercase tracking-[0.3em]">Cosmic Portal</div>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    pathname === item.href
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-amber-400/20">
              {user && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 text-[10px] text-slate-400 uppercase tracking-widest leading-none">
                    <User className="w-3 h-3 text-amber-400" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-bold transition-all border border-rose-500/20 uppercase tracking-widest"
                  >
                    <LogOut className="w-3 h-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col transition-all duration-300 relative z-10 ${sidebarOpen ? 'ml-[280px]' : 'ml-0'}`}>
        <header className="p-6 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors text-white border border-white/10 bg-white/5 backdrop-blur-xl"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${status === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">{status}</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 pb-12">
          {children}
        </div>
        
        <footer className="p-6 text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] opacity-50">
          AstroVeda Propulsion • Advanced Astrology Intelligence
        </footer>
      </main>
    </div>
  )
}
