'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { 
  X, 
  QrCode, 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  AlertCircle 
} from 'lucide-react'
import { generateCampaignPresenceToken, fetchCampaignAttendance } from './actions'

interface PresenceQRModalProps {
  campaignId: number
  campaignTitle: string
  isOpen: boolean
  onClose: () => void
}

export function PresenceQRModal({
  campaignId,
  campaignTitle,
  isOpen,
  onClose,
}: PresenceQRModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<number>(0)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{ total: number; attended: number }>({ total: 0, attended: 0 })
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)

  const modalRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const statsTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch new token
  const loadNewToken = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await generateCampaignPresenceToken(campaignId)
      if (res.success && res.qrDataUrl && res.expiresAt) {
        setQrDataUrl(res.qrDataUrl)
        setExpiresAt(res.expiresAt)
        const rem = Math.max(0, Math.floor((res.expiresAt - Date.now()) / 1000))
        setSecondsRemaining(rem)
      } else {
        setError(res.error || 'Gagal menghasilkan token QR')
      }
    } catch (err) {
      setError('Kesalahan koneksi saat meminta kode QR')
    } finally {
      setIsLoading(false)
    }
  }, [campaignId])

  // Fetch attendance stats
  const refreshStats = useCallback(async () => {
    try {
      const res = await fetchCampaignAttendance(campaignId)
      if (res.success) {
        setStats({ total: res.total ?? 0, attended: res.attended ?? 0 })
      }
    } catch {
      // ignore background poll errors
    }
  }, [campaignId])

  // Lifecycle when modal opens
  useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) clearInterval(timerRef.current)
      if (statsTimerRef.current) clearInterval(statsTimerRef.current)
      setQrDataUrl(null)
      return
    }

    loadNewToken()
    refreshStats()

    // Attendance stats polling every 6 seconds
    statsTimerRef.current = setInterval(() => {
      refreshStats()
    }, 6000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (statsTimerRef.current) clearInterval(statsTimerRef.current)
    }
  }, [isOpen, loadNewToken, refreshStats])

  // Countdown timer effect
  useEffect(() => {
    if (!isOpen || !expiresAt) return

    if (timerRef.current) clearInterval(timerRef.current)

    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
      setSecondsRemaining(remaining)

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current)
        loadNewToken()
      }
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isOpen, expiresAt, loadNewToken])

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!modalRef.current) return

    if (!document.fullscreenElement) {
      modalRef.current.requestFullscreen?.().catch(() => {
        setIsFullscreen(!isFullscreen)
      })
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.().catch(() => {
        setIsFullscreen(false)
      })
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  if (!isOpen) return null

  const progressPercentage = Math.min(100, Math.max(0, (secondsRemaining / 60) * 100))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className={`bg-white dark:bg-[#0B0F17] border border-[#E2E8F0] dark:border-[#1E293B] rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'w-screen h-screen rounded-none p-6 sm:p-12 justify-center items-center'
            : 'w-full max-w-xl max-h-[92vh]'
        }`}
      >
        {/* Modal Header */}
        <div className={`p-5 sm:p-6 border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between bg-[#F8FAFC] dark:bg-[#111827]/60 ${isFullscreen ? 'w-full max-w-2xl rounded-2xl mb-4' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#059669]/10 text-[#059669] dark:text-emerald-400 flex items-center justify-center font-bold">
              <QrCode size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#059669] dark:text-emerald-400">
                  Presensi Relawan Lapangan
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#059669] dark:text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck size={11} /> Anti-Spoofing
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white line-clamp-1">
                {campaignTitle}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh'}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button
              onClick={onClose}
              title="Tutup"
              className="p-2 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className={`p-6 flex flex-col items-center justify-center space-y-6 overflow-y-auto ${isFullscreen ? 'w-full max-w-2xl' : ''}`}>
          
          {/* Real-time stats bar */}
          <div className="w-full grid grid-cols-2 gap-3">
            <div className="bg-[#F8FAFC] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E293B] rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Users size={18} />
              </div>
              <div>
                <p className="text-[11px] text-[#94A3B8] font-medium">Total Terdaftar</p>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white">{stats.total} Relawan</p>
              </div>
            </div>

            <div className="bg-[#F8FAFC] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E293B] rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-[#059669] dark:text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <p className="text-[11px] text-[#94A3B8] font-medium">Hadir di Lokasi</p>
                <p className="text-lg font-extrabold text-[#059669] dark:text-emerald-400">
                  {stats.attended} <span className="text-xs font-medium text-[#94A3B8]">({stats.total > 0 ? Math.round((stats.attended / stats.total) * 100) : 0}%)</span>
                </p>
              </div>
            </div>
          </div>

          {/* QR Code Canvas / Container */}
          <div className="relative flex flex-col items-center justify-center p-6 bg-white dark:bg-white rounded-3xl shadow-xl border-4 border-emerald-500/30">
            {isLoading && !qrDataUrl ? (
              <div className="w-64 h-64 sm:w-80 sm:h-80 flex flex-col items-center justify-center space-y-3">
                <RotateCw size={36} className="text-[#059669] animate-spin" />
                <p className="text-xs text-slate-500 font-semibold">Menghasilkan kode QR baru...</p>
              </div>
            ) : error ? (
              <div className="w-64 h-64 sm:w-80 sm:h-80 flex flex-col items-center justify-center p-6 text-center space-y-3 text-rose-500">
                <AlertCircle size={36} />
                <p className="text-xs font-semibold">{error}</p>
                <button
                  onClick={loadNewToken}
                  className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold shadow hover:bg-rose-600 transition"
                >
                  Coba Lagi
                </button>
              </div>
            ) : qrDataUrl ? (
              <div className="relative group">
                <Image
                  src={qrDataUrl}
                  alt="Dynamic Presence QR Code"
                  width={320}
                  height={320}
                  unoptimized
                  className="w-60 h-60 sm:w-72 sm:h-72 object-contain"
                />
                {isLoading && (
                  <div className="absolute inset-0 bg-white/60 dark:bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                    <RotateCw size={32} className="text-[#059669] animate-spin" />
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Dynamic Rotation Countdown Bar */}
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1.5">
                <RotateCw size={13} className={isLoading ? 'animate-spin text-[#059669]' : 'text-[#94A3B8]'} />
                <span>Otomatis berganti dalam:</span>
              </span>
              <span className={`font-mono font-bold text-sm ${secondsRemaining <= 10 ? 'text-rose-500 animate-pulse' : 'text-[#059669] dark:text-emerald-400'}`}>
                {secondsRemaining} detik
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                  secondsRemaining <= 10
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                    : 'bg-gradient-to-r from-teal-500 to-[#059669]'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Security Notice */}
          <div className="w-full p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs space-y-1.5 text-emerald-900 dark:text-emerald-200">
            <div className="font-bold flex items-center gap-1.5">
              <MapPin size={14} className="text-[#059669] dark:text-emerald-400" />
              <span>Proteksi Geofencing PostGIS Aktif (&le; 50 Meter)</span>
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
              Token QR terenkripsi HMAC dan hanya dapat dipindai oleh relawan terdaftar yang berada langsung di radius lokasi aksi. Screenshot atau foto yang dibagikan akan hangus otomatis setelah 60 detik.
            </p>
          </div>

          {/* Manual Refresh CTA */}
          <div className="w-full flex justify-between items-center pt-1">
            <button
              onClick={loadNewToken}
              disabled={isLoading}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#059669] dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCw size={13} className={isLoading ? 'animate-spin' : ''} />
              <span>Paksa Perbarui QR Sekarang</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-[#334155] text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
            >
              Tutup Layar
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
