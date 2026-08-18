'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Flag, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { logout } from '@/lib/auth';
import { AdminThemeToggle } from './AdminThemeToggle';

interface AdminSidebarProps {
  pendingCount?: number;
}

export default function AdminSidebar({ pendingCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: '/admin/laporan',
      label: 'Daftar Laporan',
      icon: FileText,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      href: '/admin/campaign',
      label: 'Kelola Campaign',
      icon: Flag,
    },
  ];

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
    } catch {
      alert('Gagal logout. Silakan coba lagi.');
      setLoggingOut(false);
    }
  };

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white px-4 py-3 flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#059669]/15 border border-[#059669]/30 flex items-center justify-center text-[#059669] dark:text-emerald-400 shadow-sm">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              WasteCare Admin
            </div>
            <p className="text-[11px] text-[#059669] dark:text-emerald-400 font-medium">DLHK Sleman</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AdminThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-[#E2E8F0]/60 dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-[#CBD5E1] dark:border-[#334155] transition"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Backdrop on mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-[#0B0F17] text-slate-700 dark:text-slate-300 flex flex-col border-r border-[#E2E8F0] dark:border-[#1E293B]
          transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:h-screen md:sticky md:top-0 shadow-xs dark:shadow-none
          ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-[#E2E8F0] dark:border-[#1E293B]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#059669] to-emerald-700 flex items-center justify-center text-white shadow-lg shadow-[#059669]/25">
                <ShieldCheck size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <h1 className="font-bold text-base text-slate-900 dark:text-white tracking-tight leading-tight flex items-center gap-1.5">
                  WasteCare <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-[#059669]/15 text-[#059669] dark:text-emerald-300 border border-[#059669]/30">PRO</span>
                </h1>
                <p className="text-xs text-[#94A3B8] font-medium mt-0.5">DLHK Kab. Sleman</p>
              </div>
            </div>
            {/* Close button on mobile */}
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 text-[#94A3B8] hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick status pill + Theme Switch */}
          <div className="mt-4 flex items-center justify-between gap-2">
            <div className="flex-1 px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#059669] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#059669]"></span>
                </span>
                <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">Monitoring</span>
              </div>
              <span className="text-[#059669] dark:text-emerald-400 font-bold text-[11px]">Live</span>
            </div>

            <div className="shrink-0">
              <AdminThemeToggle />
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
              Menu Utama
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const active = isActive(item);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      relative group flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                      ${active
                        ? 'bg-[#059669]/10 dark:bg-[#059669]/20 text-[#059669] dark:text-emerald-300 font-bold border border-[#059669]/30 shadow-xs'
                        : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-slate-100 hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]/70 border border-transparent'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={19}
                        className={`transition-colors ${active ? 'text-[#059669] dark:text-emerald-400' : 'text-[#94A3B8] group-hover:text-slate-900 dark:group-hover:text-slate-100'}`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full transition-all ${
                        active
                          ? 'bg-[#059669] text-white'
                          : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}

                    {active && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#059669] rounded-r-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User App Shortcut */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
              Tautan Cepat
            </div>
            <Link
              href="/dashboard"
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-slate-100 hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]/70 transition-colors border border-transparent"
            >
              <div className="flex items-center gap-3">
                <Sparkles size={18} className="text-[#059669] dark:text-emerald-400" />
                <span>Portal Warga</span>
              </div>
              <ExternalLink size={15} className="text-[#94A3B8]" />
            </Link>
          </div>
        </div>

        {/* User / Logout Footer */}
        <div className="p-3 border-t border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0B0F17]">
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between gap-3 mb-2 shadow-xs dark:shadow-none">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#059669]/15 border border-[#059669]/30 flex items-center justify-center text-[#059669] dark:text-emerald-400 font-bold text-xs shrink-0">
                AD
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">Petugas DLHK</p>
                <p className="text-[11px] text-[#94A3B8] truncate">admin@dlhk.sleman.go.id</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-300 hover:text-white bg-rose-50 hover:bg-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-600/20 border border-rose-200 dark:border-rose-500/20 transition-all duration-200 disabled:opacity-60 cursor-pointer"
          >
            <LogOut size={15} />
            <span>{loggingOut ? 'Memproses Keluar...' : 'Keluar dari Panel'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

