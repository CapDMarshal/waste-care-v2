'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  ArrowLeft, 
  Camera, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  RotateCcw, 
  ShieldCheck, 
  Zap, 
  Loader2,
  Navigation,
  Image as ImageIcon
} from 'lucide-react';
import { BottomNavigation } from '@/components';
import { submitAttendanceCheckIn, AttendanceCheckInResult } from './actions';

type GPSStatus = 'requesting' | 'ready' | 'denied' | 'error';

interface Coords {
  lat: number;
  lng: number;
  accuracy: number;
}

export default function ScanQrPage() {
  const router = useRouter();

  // GPS State
  const [gpsStatus, setGpsStatus] = useState<GPSStatus>('requesting');
  const [userCoords, setUserCoords] = useState<Coords | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Scanner State
  const [isScannerRunning, setIsScannerRunning] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Result Modal State
  const [checkInResult, setCheckInResult] = useState<AttendanceCheckInResult | null>(null);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);

  // Stable Refs to prevent camera restarts on state changes
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const userCoordsRef = useRef<Coords | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  // 1. Get GPS Location (Updates state for UI, and ref for stable scanner access)
  const requestLocation = useCallback(() => {
    setGpsStatus('requesting');
    setGpsError(null);

    if (!('geolocation' in navigator)) {
      setGpsStatus('error');
      setGpsError('Perangkat Anda tidak mendukung fitur Geolocation GPS.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: Coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
        };
        // Update both Ref and State
        userCoordsRef.current = coords;
        setUserCoords(coords);
        setGpsStatus('ready');
      },
      (err) => {
        console.warn('[ScanQR GPS Error]:', err);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsStatus('denied');
          setGpsError('Izin akses lokasi (GPS) ditolak. Silakan aktifkan izin lokasi di peramban Anda.');
        } else {
          setGpsStatus('error');
          setGpsError('Gagal memperoleh sinyal GPS: ' + err.message);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // 2. Submit Token with GPS coordinates
  const handleCheckInToken = useCallback(
    async (token: string) => {
      // Guard against double submission
      if (isProcessingRef.current) return;

      const currentCoords = userCoordsRef.current;
      if (!currentCoords) {
        alert('Menunggu koordinat GPS perangkat. Pastikan GPS aktif dengan akurasi tinggi.');
        return;
      }

      isProcessingRef.current = true;
      setIsProcessing(true);

      // Haptic feedback
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([100, 50, 100]);
        } catch {}
      }

      try {
        const result = await submitAttendanceCheckIn({
          token,
          userLat: currentCoords.lat,
          userLng: currentCoords.lng,
          gpsAccuracy: currentCoords.accuracy,
        });

        setCheckInResult(result);
        setShowResultModal(true);
      } catch (err) {
        setCheckInResult({
          success: false,
          code: 'UNEXPECTED_ERROR',
          message: 'Terjadi kendala saat memproses presensi: ' + (err instanceof Error ? err.message : String(err)),
        });
        setShowResultModal(true);
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  // Stable reference to handleCheckInToken for the scanner callback
  const handleCheckInTokenRef = useRef(handleCheckInToken);
  useEffect(() => {
    handleCheckInTokenRef.current = handleCheckInToken;
  }, [handleCheckInToken]);

  // 3. Initialize Camera Scanner (Completely decoupled from GPS state!)
  const startScanner = useCallback(async () => {
    setCameraError(null);

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader-viewport');
      }

      const qrInstance = scannerRef.current;
      if (qrInstance.isScanning) {
        return;
      }

      const config = {
        fps: 12,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await qrInstance.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          handleCheckInTokenRef.current(decodedText);
        },
        () => {
          // ignore scan frame misses
        }
      );

      setIsScannerRunning(true);

      // Check if torch/flashlight is supported
      try {
        const capabilities = qrInstance.getRunningTrackCapabilities();
        if (capabilities && 'torch' in capabilities) {
          setHasTorch(true);
        }
      } catch {}
    } catch (err) {
      console.error('[Scanner start error]:', err);
      setCameraError(
        'Gagal mengakses kamera perangkat. Pastikan izin kamera telah diberikan di peramban Anda.'
      );
      setIsScannerRunning(false);
    }
  }, []); // ZERO DEPENDENCIES! Scanner will never restart due to GPS or state updates.

  // Toggle Torch
  const toggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    try {
      const nextTorch = !isTorchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: nextTorch } as any],
      });
      setIsTorchOn(nextTorch);
    } catch (e) {
      console.warn('Torch toggle failed:', e);
    }
  };

  // Handle Image File Upload (Fallback)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode('qr-reader-viewport');
    }

    try {
      setIsProcessing(true);
      const decodedText = await scannerRef.current.scanFile(file, true);
      await handleCheckInTokenRef.current(decodedText);
    } catch (err) {
      alert('Tidak menemukan kode QR yang valid pada foto tersebut. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Start scanner once on component mount
  useEffect(() => {
    startScanner();

    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(() => {}).finally(() => {
            scannerRef.current?.clear();
            scannerRef.current = null;
          });
        } else {
          scannerRef.current.clear();
          scannerRef.current = null;
        }
      }
    };
  }, [startScanner]);

  // Reset and resume scanning
  const handleResetScan = () => {
    setShowResultModal(false);
    setCheckInResult(null);
    isProcessingRef.current = false;
    setIsProcessing(false);
    // If scanner was stopped for any reason, re-ensure it's running
    if (scannerRef.current && !scannerRef.current.isScanning) {
      startScanner();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 relative flex flex-col justify-between select-none">
      
      {/* Inline styles to ensure html5-qrcode video element fills viewport smoothly */}
      <style jsx global>{`
        #qr-reader-viewport {
          width: 100% !important;
          height: 100% !important;
          position: relative !important;
          background: #000 !important;
        }
        #qr-reader-viewport video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 1.5rem !important;
        }
        #qr-reader-viewport img {
          display: none !important;
        }
      `}</style>

      {/* Top Header */}
      <header className="px-4 pt-5 pb-3 flex items-center justify-between z-20">
        <button
          onClick={() => router.back()}
          className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
          aria-label="Kembali"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="text-center">
          <h1 className="text-base font-extrabold tracking-tight">Presensi Kampanye</h1>
          <p className="text-[11px] text-emerald-400 font-semibold flex items-center justify-center gap-1">
            <ShieldCheck size={12} /> QR Dinamis & Geofencing
          </p>
        </div>

        {hasTorch ? (
          <button
            onClick={toggleTorch}
            className={`p-2.5 rounded-2xl backdrop-blur-md transition-colors ${
              isTorchOn ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            aria-label="Flashlight"
          >
            <Zap size={18} />
          </button>
        ) : (
          <div className="w-10" />
        )}
      </header>

      {/* GPS Status Floating Indicator */}
      <div className="px-4 z-20">
        <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center justify-between text-xs shadow-lg">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                gpsStatus === 'ready'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : gpsStatus === 'requesting'
                  ? 'bg-blue-500/20 text-blue-400 animate-pulse'
                  : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              <Navigation size={15} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Status Geofencing GPS</p>
              {gpsStatus === 'ready' && userCoords ? (
                <p className="text-emerald-400 font-semibold text-xs flex items-center gap-1.5">
                  <span>GPS Terkoneksi</span>
                  <span className="text-[10px] text-slate-300 font-normal">(&plusmn;{userCoords.accuracy}m)</span>
                </p>
              ) : gpsStatus === 'requesting' ? (
                <p className="text-slate-300 text-xs flex items-center gap-1.5">
                  <Loader2 size={11} className="animate-spin text-blue-400" />
                  <span>Mendeteksi akurasi satelit...</span>
                </p>
              ) : (
                <p className="text-rose-400 font-semibold text-xs">GPS Tidak Tersedia</p>
              )}
            </div>
          </div>

          {gpsStatus !== 'ready' && (
            <button
              onClick={requestLocation}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white transition cursor-pointer"
            >
              Coba Lagi
            </button>
          )}
        </div>

        {gpsError && (
          <div className="mt-2 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertTriangle size={15} className="shrink-0 mt-0.5 text-rose-400" />
            <p className="text-[11px] leading-relaxed">{gpsError}</p>
          </div>
        )}

        {gpsStatus === 'ready' && userCoords && userCoords.accuracy > 40 && (
          <div className="mt-2 p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
            <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-400" />
            <p className="text-[11px] leading-relaxed">
              Akurasi GPS agak rendah (&plusmn;{userCoords.accuracy}m). Disarankan bergerak ke area terbuka untuk akurasi optimal.
            </p>
          </div>
        )}
      </div>

      {/* Viewport Scanner Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-4 relative z-10">
        <div className="w-full max-w-sm aspect-square relative rounded-3xl overflow-hidden bg-black border-2 border-white/20 shadow-2xl flex items-center justify-center">
          
          {/* HTML5 QR Code DOM Target */}
          <div id="qr-reader-viewport" className="w-full h-full object-cover" />

          {/* Viewfinder Overlay with Animated Laser */}
          {isScannerRunning && !isProcessing && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Outer border */}
              <div className="relative w-64 h-64 border-2 border-emerald-400/80 rounded-2xl">
                {/* 4 Corner brackets */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                {/* Animated scanning laser line */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-pulse absolute top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-3 z-30 animate-in fade-in">
              <Loader2 size={42} className="text-emerald-400 animate-spin" />
              <p className="text-sm font-bold text-white">Memverifikasi Kehadiran...</p>
              <p className="text-xs text-slate-300">
                Memeriksa tanda tangan HMAC dan validasi PostGIS Geofencing (&le; 50m)
              </p>
            </div>
          )}

          {/* Camera Error / Permission Fallback */}
          {cameraError && !isProcessing && (
            <div className="absolute inset-0 bg-slate-900 p-6 flex flex-col items-center justify-center text-center space-y-3 z-20">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Camera size={24} />
              </div>
              <p className="text-xs text-rose-300 leading-relaxed">{cameraError}</p>
              <button
                onClick={startScanner}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Coba Buka Kamera Lagi
              </button>
            </div>
          )}
        </div>

        {/* Scan instruction tooltip */}
        <p className="mt-4 text-xs text-slate-400 text-center max-w-xs leading-relaxed">
          Arahkan kamera ke layar QR Code dinamis koordinator di lokasi kampanye.
        </p>

        {/* Fallback image upload */}
        <div className="mt-3 flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-300 transition cursor-pointer"
          >
            <ImageIcon size={14} />
            <span>Pilih dari Galeri</span>
          </button>
        </div>
      </main>

      {/* Result Feedback Modal */}
      {showResultModal && checkInResult && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-white rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-2xl w-full max-w-md p-6 space-y-5 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300">
            
            {/* Header Icon */}
            <div className="flex flex-col items-center text-center space-y-2">
              {checkInResult.success ? (
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 text-[#059669] dark:text-emerald-400 flex items-center justify-center animate-bounce">
                  <CheckCircle2 size={36} />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-3xl bg-rose-500/15 text-rose-500 flex items-center justify-center">
                  <XCircle size={36} />
                </div>
              )}

              <h2 className="text-xl font-extrabold tracking-tight">
                {checkInResult.success ? 'Presensi Berhasil!' : 'Presensi Gagal'}
              </h2>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {checkInResult.message}
              </p>
            </div>

            {/* Success Details Card */}
            {checkInResult.success ? (
              <div className="bg-[#F8FAFC] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E293B] rounded-2xl p-4 space-y-3">
                {checkInResult.campaignTitle && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-[#94A3B8]">Kampanye</span>
                    <span className="font-bold text-slate-900 dark:text-white text-right max-w-[200px] truncate">
                      {checkInResult.campaignTitle}
                    </span>
                  </div>
                )}

                {checkInResult.distance != null && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-[#94A3B8]">Jarak dari Titik Aksi</span>
                    <span className="font-mono font-bold text-[#059669] dark:text-emerald-400">
                      {checkInResult.distance} meter (&le; 50m)
                    </span>
                  </div>
                )}

                {checkInResult.newExp != null && (
                  <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
                      <Sparkles size={15} />
                      <span>Reward Kehadiran</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 font-extrabold text-xs">
                      +100 EXP
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* Error Details Card */
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-500 dark:text-rose-400">
                  <AlertTriangle size={15} />
                  <span>Informasi Verifikasi:</span>
                </div>
                {checkInResult.distance != null && (
                  <p className="text-rose-700 dark:text-rose-300">
                    Jarak terdeteksi: <strong>{checkInResult.distance} meter</strong> (Maksimal diperbolehkan: {checkInResult.maxDistance || 50} meter).
                  </p>
                )}
                {checkInResult.code === 'TOKEN_EXPIRED' && (
                  <p className="text-rose-700 dark:text-rose-300">
                    Kode QR admin telah berganti secara dinamis. Silakan scan ulang kode terbaru di layar koordinator.
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              {checkInResult.success ? (
                <Link
                  href={checkInResult.campaignId ? `/campaign?campaignId=${checkInResult.campaignId}` : '/campaign'}
                  className="w-full py-3 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#059669]/20 transition cursor-pointer"
                >
                  <span>Lihat Detail Kampanye</span>
                </Link>
              ) : (
                <button
                  onClick={handleResetScan}
                  className="w-full py-3 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#059669]/20 transition cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Pindai Ulang Kode QR</span>
                </button>
              )}

              <Link
                href="/campaign"
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-[#334155] text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center transition"
              >
                Kembali ke Beranda Kampanye
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
