'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  Crown,
  ShieldCheck,
  Sprout,
  Sparkles,
  Lock,
  ChevronRight,
  User,
  FileText,
  HelpCircle,
  LogOut,
  Info
} from 'lucide-react';
import { BottomNavigation, Button, ThemeToggle } from '@/components';
import { logout } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { calculateLevelProgress, BadgeTier } from '@/lib/gamification';

export default function AkunPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [userExp, setUserExp] = useState(0);
  const [loadingExp, setLoadingExp] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<BadgeTier | null>(null);

  useEffect(() => {
    const fetchUserExp = async () => {
      if (!user?.id) {
        setLoadingExp(false);
        return;
      }

      setLoadingExp(true);
      try {
        const { data } = await supabase
          .from('profiles')
          .select('exp')
          .eq('id', user.id)
          .maybeSingle();

        setUserExp(data?.exp ?? 0);
      } catch (error) {
        console.warn('Error fetching user exp:', error);
        setUserExp(0);
      } finally {
        setLoadingExp(false);
      }
    };

    fetchUserExp();
  }, [user?.id]);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    try {
      const { error } = await logout();
      if (error) {
        alert('Gagal logout. Silakan coba lagi.');
        setLoggingOut(false);
        return;
      }

      window.location.href = '/';
    } catch (error) {
      alert('Gagal logout. Silakan coba lagi.');
      setLoggingOut(false);
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
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

  const getDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Warga Sleman';
  };

  if (loading || !user) {
    return null;
  }

  const displayName = getDisplayName();
  const initials = getInitials(user.user_metadata?.full_name, user.email || '');
  const progress = calculateLevelProgress(userExp);

  const renderBadgeIcon = (icon: 'sprout' | 'shield' | 'crown', size = 'w-5 h-5') => {
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] pb-28 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Profil Saya</h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 rounded-full">
              Warga Sleman Sembada
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* User Card */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-emerald-100 dark:ring-emerald-900/40">
              <span className="text-2xl text-white font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">{displayName}</h2>
              <p className="text-slate-500 dark:text-slate-400 truncate text-xs">{user.email || 'Tidak ada email'}</p>

              <div className="flex items-center space-x-2 mt-2">
                <span
                  className={`inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${progress.activeBadge.bgLight} ${progress.activeBadge.text} ${progress.activeBadge.border} dark:bg-slate-800/80`}
                >
                  {renderBadgeIcon(progress.activeBadge.icon, 'w-3.5 h-3.5')}
                  <span>Level {progress.currentLevel} • {progress.activeBadge.name}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Gamification Level & Progress Card */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-xl bg-gradient-to-tr ${progress.activeBadge.gradient} text-white shadow-sm`}>
                {renderBadgeIcon(progress.activeBadge.icon, 'w-4 h-4')}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{progress.levelTitle}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{progress.activeBadge.description}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center space-x-1 justify-end">
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {loadingExp ? '...' : userExp.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-amber-500">XP</span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Total Akumulasi</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {progress.isMaxLevel ? 'Tingkat Maksimal' : `Progres Menuju Level ${progress.currentLevel + 1}`}
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{progress.progressPercent}%</span>
            </div>

            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${progress.activeBadge.gradient} transition-all duration-500`}
                style={{ width: `${progress.progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
              <span>{userExp} XP</span>
              {!progress.isMaxLevel ? (
                <span>
                  Kurang <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{progress.expNeeded} XP</strong> lagi ke Level {progress.currentLevel + 1}
                </span>
              ) : (
                <span className="text-amber-500 dark:text-amber-400 font-semibold">Tingkat Tertinggi Dicapai!</span>
              )}
            </div>
          </div>

          {/* Leaderboard CTA Button */}
          <button
            onClick={() => router.push('/leaderboard')}
            className="w-full mt-2 flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm transition-all group"
          >
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-white/20">
                <Trophy className="w-4 h-4 text-amber-300" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold">Papan Peringkat Sleman</div>
                <div className="text-[10px] text-emerald-100">Cek peringkat & bandingkan XP dengan warga lain</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Section Galeri Lencana Kultural Sleman */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-3 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Koleksi Lencana Lingkungan</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Apresiasi bertingkat kepedulian warga Sleman</p>
            </div>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {progress.allBadges.map((badge) => {
              const isUnlocked = badge.isUnlocked;

              return (
                <button
                  key={badge.id}
                  onClick={() => setSelectedBadge(badge)}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between relative ${
                    isUnlocked
                      ? `${badge.bgLight} dark:bg-slate-800/70 ${badge.border} dark:border-slate-700 shadow-xs hover:shadow`
                      : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200/70 dark:border-slate-800 opacity-60 hover:opacity-80'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 shadow-xs ${
                      isUnlocked
                        ? `bg-gradient-to-tr ${badge.gradient} text-white ring-2 ring-white dark:ring-slate-700`
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {isUnlocked ? (
                      renderBadgeIcon(badge.icon, 'w-6 h-6')
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>

                  <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{badge.name}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {badge.minExp === 0 ? 'Mulai' : `≥ ${badge.minExp} XP`}
                  </span>

                  <span
                    className={`mt-2 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      isUnlocked
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {isUnlocked ? 'Terbuka' : `${badge.progressToUnlock}%`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Navigasi Akun & Pengaturan Tema */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 transition-colors duration-200">
          {/* Dedicated Theme Toggle Setting Row */}
          <ThemeToggle variant="setting-row" />

          <button
            onClick={() => router.push('/akun/edit-profile')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <User className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm text-slate-900 dark:text-white">Edit Profil</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => router.push('/akun/riwayat-laporan')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <FileText className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm text-slate-900 dark:text-white">Riwayat Laporan Sampah</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => router.push('/akun/bantuan')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm text-slate-900 dark:text-white">Pusat Bantuan & Edukasi</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Tombol Logout */}
        <div className="pt-2">
          <Button
            onClick={handleLogout}
            loading={loggingOut}
            disabled={loggingOut}
            fullWidth
            variant="outline"
            className="border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center space-x-2 py-3 rounded-xl font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span>{loggingOut ? 'Keluar...' : 'Keluar dari Akun'}</span>
          </Button>
        </div>
      </div>

      {/* Modal Detail Lencana Kultural */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div
              className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-lg bg-gradient-to-tr ${selectedBadge.gradient} text-white ring-4 ring-slate-100 dark:ring-slate-800`}
            >
              {renderBadgeIcon(selectedBadge.icon, 'w-10 h-10')}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Level {selectedBadge.level} • {selectedBadge.title}
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{selectedBadge.name}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 pt-1 leading-relaxed">
                {selectedBadge.description}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-left space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Makna & Filosofi Kultural:</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                "{selectedBadge.philosophy}"
              </p>
            </div>

            <div className="pt-1">
              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}
