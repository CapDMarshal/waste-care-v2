'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  Crown,
  Medal,
  Sparkles,
  ChevronLeft,
  Info,
  Sprout,
  ShieldCheck,
  CheckCircle,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { BottomNavigation } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import {
  getLeaderboardData,
  getCurrentUserRank,
  CitizenLeaderboardItem,
  UserRankResult
} from './actions';
import { calculateLevelProgress, getRankBadgeMeta } from '@/lib/gamification';

export default function LeaderboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();

  const [leaderboard, setLeaderboard] = useState<CitizenLeaderboardItem[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<UserRankResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRulesModal, setShowRulesModal] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const [leaderboardRes, userRankRes] = await Promise.all([
          getLeaderboardData(50),
          getCurrentUserRank()
        ]);

        if (isMounted) {
          if (leaderboardRes.success) {
            setLeaderboard(leaderboardRes.data);
          }
          setCurrentUserRank(userRankRes);
        }
      } catch (err) {
        console.error('Error loading leaderboard page data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    startTransition(() => {
      loadData();
    });

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const top1 = leaderboard[0] || null;
  const top2 = leaderboard[1] || null;
  const top3 = leaderboard[2] || null;
  const restContributors = leaderboard.slice(3);

  const getInitials = (name?: string, email?: string) => {
    if (name && name !== 'Warga Sleman') {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'WS';
  };

  const renderBadgeIcon = (icon: 'sprout' | 'shield' | 'crown', size = 'w-3.5 h-3.5') => {
    switch (icon) {
      case 'sprout':
        return <Sprout className={size} />;
      case 'shield':
        return <ShieldCheck className={size} />;
      case 'crown':
        return <Crown className={size} />;
      default:
        return <Sparkles className={size} />;
    }
  };

  const userProgress = calculateLevelProgress(currentUserRank?.exp || 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-36 text-slate-800">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              aria-label="Kembali"
              className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h1 className="text-lg font-bold text-slate-900 leading-tight">Papan Peringkat Sleman</h1>
              </div>
              <p className="text-xs text-slate-500">Peringkat kontribusi warga & aksi lingkungan</p>
            </div>
          </div>

          <button
            onClick={() => setShowRulesModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Aturan XP</span>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-6">
        {/* Banner Motivasi Sleman */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-4 text-white shadow-md">
          <div className="relative z-10 flex items-start justify-between">
            <div className="space-y-1">
              <span className="inline-flex items-center space-x-1 text-[11px] font-semibold bg-emerald-500/40 px-2 py-0.5 rounded-full border border-emerald-300/30">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Sleman Sembada Bersih</span>
              </span>
              <h2 className="text-base font-bold">Kumpulkan XP, Raih Adipura Sleman!</h2>
              <p className="text-xs text-emerald-100 max-w-xs">
                Dapatkan apresiasi nyata dengan melaporkan tumpukan sampah liar dan bergabung dalam kampanye aksi bersih.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0">
              <Crown className="w-7 h-7 text-amber-300" />
            </div>
          </div>
          {/* Subtle background circle decoration */}
          <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
        </div>

        {/* Podium Top 3 */}
        <section className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="text-center mb-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">Top Kontributor Sleman</h3>
            <p className="text-xs text-slate-500">Pahlawan lingkungan teraktif bulan ini</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-end h-56 space-x-3 pt-6 animate-pulse">
              <div className="w-24 h-36 bg-slate-200 rounded-t-2xl" />
              <div className="w-28 h-48 bg-slate-300 rounded-t-2xl" />
              <div className="w-24 h-28 bg-slate-200 rounded-t-2xl" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 items-end pt-4 pb-1">
              {/* Rank 2 (Perak - Kiri) */}
              <div className="flex flex-col items-center">
                {top2 ? (
                  <>
                    <div className="relative mb-2 flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-slate-300 to-slate-100 border-2 border-slate-300 shadow flex items-center justify-center text-slate-700 font-bold text-sm">
                        {getInitials(top2.full_name, top2.email)}
                      </div>
                      <span className="absolute -bottom-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 text-slate-700 border border-slate-300 shadow-sm">
                        #2
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-800 text-center truncate max-w-full px-1">
                      {top2.full_name}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 mt-0.5">
                      {top2.exp.toLocaleString()} XP
                    </span>
                    <div className="w-full h-24 mt-3 rounded-t-xl bg-gradient-to-t from-slate-200 via-slate-100 to-white border-t-2 border-slate-300 flex flex-col items-center justify-center shadow-inner">
                      <span className="text-xl">🥈</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">Perak</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-24 rounded-t-xl bg-slate-100 border-t border-slate-200 flex flex-col items-center justify-center text-slate-400">
                    <span className="text-xs font-medium">Kosong</span>
                  </div>
                )}
              </div>

              {/* Rank 1 (Emas - Tengah) */}
              <div className="flex flex-col items-center z-10">
                {top1 ? (
                  <>
                    <div className="relative mb-2 flex flex-col items-center">
                      <Crown className="w-6 h-6 text-amber-500 animate-bounce -mb-1" />
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 border-2 border-amber-400 shadow-md flex items-center justify-center text-amber-950 font-extrabold text-base ring-4 ring-amber-100">
                        {getInitials(top1.full_name, top1.email)}
                      </div>
                      <span className="absolute -bottom-2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-amber-950 border border-amber-300 shadow">
                        #1
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 text-center truncate max-w-full px-1">
                      {top1.full_name}
                    </span>
                    <span className="text-xs font-extrabold text-amber-600 mt-0.5">
                      {top1.exp.toLocaleString()} XP
                    </span>
                    <div className="w-full h-32 mt-3 rounded-t-xl bg-gradient-to-t from-amber-200 via-yellow-100 to-amber-50 border-t-2 border-amber-400 flex flex-col items-center justify-center shadow-inner">
                      <span className="text-2xl">🥇</span>
                      <span className="text-[10px] font-extrabold text-amber-800 uppercase mt-1">Emas</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-32 rounded-t-xl bg-slate-100 border-t border-slate-200 flex flex-col items-center justify-center text-slate-400">
                    <span className="text-xs font-medium">Kosong</span>
                  </div>
                )}
              </div>

              {/* Rank 3 (Perunggu - Kanan) */}
              <div className="flex flex-col items-center">
                {top3 ? (
                  <>
                    <div className="relative mb-2 flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-500 border-2 border-amber-600 shadow flex items-center justify-center text-white font-bold text-sm">
                        {getInitials(top3.full_name, top3.email)}
                      </div>
                      <span className="absolute -bottom-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-700 text-white border border-amber-600 shadow-sm">
                        #3
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-800 text-center truncate max-w-full px-1">
                      {top3.full_name}
                    </span>
                    <span className="text-[11px] font-bold text-amber-800 mt-0.5">
                      {top3.exp.toLocaleString()} XP
                    </span>
                    <div className="w-full h-20 mt-3 rounded-t-xl bg-gradient-to-t from-amber-100 via-amber-50 to-white border-t-2 border-amber-600 flex flex-col items-center justify-center shadow-inner">
                      <span className="text-xl">🥉</span>
                      <span className="text-[10px] font-bold text-amber-800 uppercase mt-1">Perunggu</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-20 rounded-t-xl bg-slate-100 border-t border-slate-200 flex flex-col items-center justify-center text-slate-400">
                    <span className="text-xs font-medium">Kosong</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Daftar Kontributor Peringkat 4 - 50 */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-900">Peringkat Kontributor Warga</h3>
            <span className="text-xs text-slate-500 font-medium">{leaderboard.length} Relawan Terdaftar</span>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-white rounded-xl border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
              <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Belum ada data kontributor</p>
              <p className="text-xs text-slate-500 mt-1">
                Jadilah warga pertama yang melaporkan sampah liar untuk menempati podium Juara 1!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((item) => {
                const isCurrentUser = currentUserRank?.userId === item.user_id;
                const progress = calculateLevelProgress(item.exp);
                const rankBadge = getRankBadgeMeta(item.rank);

                return (
                  <div
                    key={item.user_id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl transition-all ${
                      isCurrentUser
                        ? 'bg-emerald-50/90 border-2 border-emerald-500 shadow-sm'
                        : 'bg-white border border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {/* Nomor Peringkat */}
                      <div className="w-8 flex-shrink-0 text-center">
                        {item.rank <= 3 ? (
                          <span className="text-lg">{item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : '🥉'}</span>
                        ) : (
                          <span className="text-sm font-extrabold text-slate-600">#{item.rank}</span>
                        )}
                      </div>

                      {/* Avatar Inisial */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isCurrentUser
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {getInitials(item.full_name, item.email)}
                      </div>

                      {/* Info Kontributor */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {item.full_name}
                          </h4>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.2 bg-emerald-600 text-white text-[9px] font-bold rounded">
                              Anda
                            </span>
                          )}
                        </div>

                        {/* Badge Level & Statistik */}
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span
                            className={`inline-flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${progress.activeBadge.bgLight} ${progress.activeBadge.text} ${progress.activeBadge.border}`}
                          >
                            {renderBadgeIcon(progress.activeBadge.icon)}
                            <span>{progress.activeBadge.name}</span>
                          </span>

                          <span className="text-[11px] text-slate-400">•</span>
                          <span className="text-[11px] text-slate-500">
                            {item.reports_count} lap. • {item.campaigns_attended_count} aksi
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Total EXP */}
                    <div className="text-right flex-shrink-0 pl-2">
                      <div className="flex items-center space-x-1 justify-end">
                        <span className="text-sm font-extrabold text-slate-900">
                          {item.exp.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-amber-500">XP</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Level {progress.currentLevel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Sticky Floating Banner: Peringkat Saya */}
      <div className="fixed bottom-16 left-0 right-0 z-30 px-4 py-2 pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          {currentUserRank?.isAuthenticated ? (
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-3.5 shadow-xl border border-slate-700 flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 font-bold text-xs flex-shrink-0">
                  {getInitials(currentUserRank.fullName, currentUserRank.email)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-emerald-400">
                      {currentUserRank.rank ? `Peringkat #${currentUserRank.rank}` : 'Belum Berperingkat'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      dari {currentUserRank.totalUsers} warga
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 truncate font-medium">
                    {userProgress.levelTitle} ({userProgress.currentExp} XP)
                  </p>
                </div>
              </div>

              <button
                onClick={() => router.push('/akun')}
                className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors flex-shrink-0 shadow"
              >
                <span>Profil</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3 shadow-xl border border-slate-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span className="text-xs text-slate-200">
                  Masuk untuk melihat peringkat & kumpulkan XP Sleman
                </span>
              </div>
              <button
                onClick={() => router.push('/login')}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors flex-shrink-0"
              >
                Masuk
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Penjelasan Aturan Gamifikasi Sleman */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">Aturan Gamifikasi & XP</h3>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Sumber Perolehan XP */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Cara Memperoleh XP
              </h4>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-emerald-600 text-white mt-0.5">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">Laporan Sampah Disetujui</span>
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      +50 XP
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Laporan harus diverifikasi valid oleh AI Vertex Gemini dan disahkan oleh petugas DLHK Sleman.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-blue-600 text-white mt-0.5">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">Hadir Aksi Bersih Lingkungan</span>
                    <span className="text-xs font-extrabold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                      +100 XP
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Presensi mandiri via pemindaian Dynamic QR & validasi GPS radius ≤ 50 meter dari titik lokasi aksi.
                  </p>
                </div>
              </div>
            </div>

            {/* Tingkatan Level & Lencana Kultural */}
            <div className="space-y-2.5 pt-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Tingkatan Level & Lencana Kultural Sleman
              </h4>

              <div className="space-y-2">
                <div className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-emerald-600 text-white">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900">Level 1: Tunas Hijau</span>
                      <span className="text-[10px] font-semibold text-slate-500">0 - 199 XP</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Relawan Pemula. Langkah awal kepedulian warga Sleman.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl border border-blue-200 bg-blue-50/50 flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-blue-600 text-white">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900">Level 2: Cakra Lestari</span>
                      <span className="text-[10px] font-semibold text-slate-500">200 - 499 XP</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Penjaga Lingkungan Sleman. Konsistensi aksi nyata lingkungan.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl border border-amber-300 bg-amber-50/70 flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-amber-500 text-white">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900">Level 3: Adipura Sleman</span>
                      <span className="text-[10px] font-semibold text-amber-700">≥ 500 XP</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Pahlawan Kebersihan Sleman. Puncak kehormatan sipil warga.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={() => setShowRulesModal(false)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
