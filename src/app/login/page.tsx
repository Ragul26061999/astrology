'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Eye, EyeOff, Star, Moon, Sparkles } from 'lucide-react'

// Social media icons as inline SVGs
const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
)

const TwitterIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

// 3D Astrology Icon component
const AstrologyIcon3D = ({ 
  children, 
  className = '', 
  delay = 0,
  duration = 6,
  style = {}
}: { 
  children: React.ReactNode; 
  className?: string; 
  delay?: number;
  duration?: number;
  style?: React.CSSProperties 
}) => (
  <motion.div
    className={`absolute pointer-events-none ${className}`}
    style={style}
    initial={{ opacity: 0 }}
    animate={{ 
      opacity: 1,
      rotateY: [0, 360],
      rotateX: [0, 15, 0, -15, 0],
      y: [0, -20, 0],
    }}
    transition={{ 
      opacity: { duration: 1, delay },
      rotateY: { duration: duration * 2, repeat: Infinity, ease: 'linear' },
      rotateX: { duration: duration, repeat: Infinity, ease: 'easeInOut' },
      y: { duration: duration * 1.5, repeat: Infinity, ease: 'easeInOut' }
    }}
  >
    <div style={{ 
      transformStyle: 'preserve-3d',
      textShadow: '0 0 15px rgba(180, 83, 9, 0.4), 0 0 30px rgba(180, 83, 9, 0.2)'
    }}>
      <div className="text-amber-700/80">
        {children}
      </div>
    </div>
  </motion.div>
)
const FloatingStar = ({ delay, size, top, left }: { delay: number; size: number; top: string; left: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
    transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay, ease: 'easeInOut' }}
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size,
      height: size,
      top,
      left,
      background: 'radial-gradient(circle, #fbbf24 0%, #d97706 50%, transparent 70%)',
      boxShadow: '0 0 8px rgba(217, 119, 6, 0.3)',
      opacity: 0.4
    }}
  />
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Generate stars only on client
  const stars = mounted ? Array.from({ length: 50 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 3,
  })) : []

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      // Use standard Supabase Auth to enable session management via cookies
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) {
        throw new Error(error.message)
      }

      setMessage({ type: 'success', text: 'Welcome back! Redirecting...' })
      setTimeout(() => router.push('/'), 1500)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Login failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden font-sans relative" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Astrology Theme Background - Warm ivory/sand with subtle stars */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(circle at top right, #FFF9F0 0%, #F5F1E9 100%)',
        }}
      >
        {/* Stars */}
        {mounted && stars.map((star) => (
          <FloatingStar
            key={star.id}
            size={star.size}
            top={star.top}
            left={star.left}
            delay={star.delay}
          />
        ))}

        {/* Constellation lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <line x1="10%" y1="15%" x2="15%" y2="25%" stroke="#d97706" strokeWidth="0.5" />
          <line x1="15%" y1="25%" x2="25%" y2="20%" stroke="#d97706" strokeWidth="0.5" />
          <line x1="25%" y1="20%" x2="30%" y2="35%" stroke="#d97706" strokeWidth="0.5" />
          <line x1="70%" y1="10%" x2="75%" y2="20%" stroke="#d97706" strokeWidth="0.5" />
          <line x1="75%" y1="20%" x2="85%" y2="15%" stroke="#d97706" strokeWidth="0.5" />
          <line x1="80%" y1="60%" x2="85%" y2="75%" stroke="#d97706" strokeWidth="0.5" />
          <line x1="85%" y1="75%" x2="90%" y2="70%" stroke="#d97706" strokeWidth="0.5" />
          <circle cx="10%" cy="15%" r="2" fill="#d97706" />
          <circle cx="15%" cy="25%" r="1.5" fill="#d97706" />
          <circle cx="25%" cy="20%" r="2.5" fill="#d97706" />
          <circle cx="30%" cy="35%" r="1.5" fill="#b45309" />
          <circle cx="70%" cy="10%" r="2" fill="#d97706" />
          <circle cx="75%" cy="20%" r="1.5" fill="#d97706" />
          <circle cx="85%" cy="15%" r="2" fill="#b45309" />
          <circle cx="80%" cy="60%" r="2.5" fill="#d97706" />
          <circle cx="85%" cy="75%" r="1.5" fill="#d97706" />
          <circle cx="90%" cy="70%" r="2" fill="#b45309" />
        </svg>

        {/* Zodiac Wheel - Bottom left decoration */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 opacity-5 pointer-events-none">
          <svg viewBox="0 0 200 200" className="w-full h-full animate-spin" style={{ animationDuration: '60s' }}>
            <circle cx="100" cy="100" r="95" fill="none" stroke="#d97706" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="75" fill="none" stroke="#d97706" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="55" fill="none" stroke="#d97706" strokeWidth="0.5" />
            {/* Star center */}
            <path d="M100 25 L103 85 L100 90 L97 85 Z" fill="#d97706" />
            <path d="M100 175 L103 115 L100 110 L97 115 Z" fill="#d97706" />
            <path d="M25 100 L85 97 L90 100 L85 103 Z" fill="#d97706" />
            <path d="M175 100 L115 97 L110 100 L115 103 Z" fill="#d97706" />
          </svg>
        </div>

        {/* Moon glow effect */}
        <div 
          className="absolute top-20 right-40 w-64 h-64 rounded-full pointer-events-none opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, rgba(245, 158, 11, 0.1) 50%, transparent 70%)',
          }}
        />
        
        {/* Purple glow */}
        <div 
          className="absolute bottom-40 left-1/3 w-96 h-96 rounded-full pointer-events-none opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Main content - Closer layout */}
      <div className="relative z-10 flex w-full min-h-screen max-w-7xl mx-auto">
        {/* Left Panel - Welcome section - Narrower and closer to center */}
        <div className="hidden lg:flex lg:w-5/12 flex-col justify-center pl-16 xl:pl-24 pr-8">
          {/* Logo with star */}
          <div className="mb-8 flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-8 h-8 text-amber-600" />
            </motion.div>
            <h1 className="text-4xl font-black text-amber-900 tracking-tight">
              Astro<span className="text-amber-600">Veda</span>
            </h1>
          </div>

          {/* Welcome heading */}
          <div className="mb-4">
            <h2 className="text-4xl xl:text-5xl font-black text-stone-900 mb-3">
              Discover Your<br />
              <span className="text-amber-700">Cosmic Path</span>
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-amber-600 to-orange-500 rounded-full"></div>
          </div>

          {/* Description text */}
          <p className="text-stone-600 text-sm font-bold leading-relaxed max-w-sm mb-6">
            Unlock the mysteries of your birth chart, daily horoscope, and planetary alignments. 
            Your celestial journey begins here.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 mb-8">
            <span className="px-4 py-2 rounded-full text-xs font-black text-amber-800 bg-amber-100 border border-amber-200 shadow-sm">
              ✦ Birth Charts
            </span>
            <span className="px-4 py-2 rounded-full text-xs font-black text-stone-700 bg-stone-100 border border-stone-200 shadow-sm">
              ☽ Daily Horoscope
            </span>
            <span className="px-4 py-2 rounded-full text-xs font-black text-orange-800 bg-orange-50 border border-orange-100 shadow-sm">
              ♥ Compatibility
            </span>
          </div>

          {/* Learn More button - Astrology gold theme */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-fit px-8 py-3 rounded-full font-black text-white text-sm flex items-center gap-2 uppercase tracking-widest shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
            }}
          >
            <Star className="w-4 h-4" />
            Explore the Stars
          </motion.button>

          {/* Astrology decoration */}
          <div className="mt-10 flex items-center gap-3 text-amber-800/40 text-xs font-black uppercase tracking-widest">
            <Moon className="w-4 h-4" />
            <span>As above, so below</span>
            <div className="w-12 h-px bg-gradient-to-r from-amber-800/40 to-transparent"></div>
          </div>
        </div>

        {/* Right Panel - Login form - Moved further right */}
        <div className="flex-1 flex items-center justify-start pl-12 lg:pl-20 xl:pl-32 pr-4 sm:pr-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-sm"
          >
            {/* Login Card - Astrology theme */}
            <div className="relative">
              {/* 3D Astrology Icons floating around the card */}
              <AstrologyIcon3D 
                className="text-4xl"
                delay={0}
                duration={5}
                style={{ top: '-40px', right: '-30px' }}
              >
                ♈
              </AstrologyIcon3D>
              
              <AstrologyIcon3D 
                className="text-3xl"
                delay={0.5}
                duration={6}
                style={{ top: '20%', left: '-50px' }}
              >
                ♉
              </AstrologyIcon3D>
              
              <AstrologyIcon3D 
                className="text-3xl"
                delay={1}
                duration={5.5}
                style={{ bottom: '30%', right: '-40px' }}
              >
                ♊
              </AstrologyIcon3D>
              
              <AstrologyIcon3D 
                className="text-4xl"
                delay={1.5}
                duration={7}
                style={{ bottom: '-30px', left: '20%' }}
              >
                ♋
              </AstrologyIcon3D>
              
              <AstrologyIcon3D 
                className="text-2xl"
                delay={2}
                duration={4.5}
                style={{ top: '10%', right: '-60px' }}
              >
                ☽
              </AstrologyIcon3D>
              
              <AstrologyIcon3D 
                className="text-3xl"
                delay={2.5}
                duration={6.5}
                style={{ bottom: '20%', left: '-45px' }}
              >
                ☉
              </AstrologyIcon3D>

              <div
                className="rounded-3xl p-8 sm:p-10 relative z-10"
                style={{
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(217, 119, 6, 0.2)',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.08), 0 0 40px rgba(217, 119, 6, 0.05)',
                }}
              >
               {/* Sign In heading with star */}
               <div className="flex items-center justify-center gap-2 mb-8">
                <Star className="w-5 h-5 text-amber-600" />
                <h3 className="text-2xl font-black text-stone-900 uppercase tracking-tight">
                  Sign In
                </h3>
                <Star className="w-5 h-5 text-amber-600" />
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                 {/* User Name field - Astrology theme */}
                 <div className="space-y-2">
                  <label className="block text-[10px] font-black text-amber-800 uppercase tracking-widest px-1">
                    User Name
                  </label>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter Username"
                    className="w-full h-12 rounded-2xl px-5 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-amber-500/30 font-bold"
                    style={{
                      background: 'rgba(245, 241, 233, 0.6)',
                      border: '1px solid rgba(217, 119, 6, 0.1)',
                    }}
                  />
                </div>

                {/* Password field - Astrology theme */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-amber-800 uppercase tracking-widest px-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••"
                      className="w-full h-12 rounded-2xl px-5 pr-12 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-amber-500/30 font-bold"
                      style={{
                        background: 'rgba(245, 241, 233, 0.6)',
                        border: '1px solid rgba(217, 119, 6, 0.1)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error/Success message */}
                {message && (
                  <div
                    className={`rounded-lg px-4 py-3 text-sm ${
                      message.type === 'error'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-green-500/20 text-green-300 border border-green-500/30'
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                {/* Submit button - Astrology gold theme */}
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(217, 119, 6, 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-2xl font-black text-white text-sm mt-6 uppercase tracking-widest shadow-xl"
                  style={{
                    background: loading
                      ? 'rgba(180, 83, 9, 0.5)'
                      : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    'Submit'
                  )}
                </motion.button>
              </form>
            </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

