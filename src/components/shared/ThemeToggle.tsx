'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const THEME_CHANGE_EVENT = 'wastecare_theme_change';
const STORAGE_KEY_USER = 'wastecare_theme';
const STORAGE_KEY_ADMIN = 'wastecare_admin_theme';

interface ThemeToggleProps {
  variant?: 'switch' | 'compact' | 'setting-row';
  className?: string;
}

export function ThemeToggle({ variant = 'switch', className = '' }: ThemeToggleProps) {
  // Default is LIGHTMODE for both user and admin
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Lightmode is DEFAULT: check DOM or localStorage
    const isDark = document.documentElement.classList.contains('dark');
    const savedTheme = (localStorage.getItem(STORAGE_KEY_USER) ||
      localStorage.getItem(STORAGE_KEY_ADMIN)) as 'light' | 'dark' | null;

    // If no saved theme, default to 'light'
    const initial: 'light' | 'dark' = savedTheme ? savedTheme : isDark ? 'dark' : 'light';
    setTheme(initial);

    // Ensure DOM is in sync with initial value
    if (initial === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<'light' | 'dark'>;
      if (customEvent.detail) {
        setTheme(customEvent.detail);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (
        (e.key === STORAGE_KEY_USER || e.key === STORAGE_KEY_ADMIN) &&
        (e.newValue === 'light' || e.newValue === 'dark')
      ) {
        setTheme(e.newValue);
        if (e.newValue === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    window.addEventListener('wastecare_admin_theme_change', handleThemeChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
      window.removeEventListener('wastecare_admin_theme_change', handleThemeChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme: 'light' | 'dark' = theme === 'dark' ? 'light' : 'dark';

    // Update localStorage for both user and admin compatibility
    localStorage.setItem(STORAGE_KEY_USER, nextTheme);
    localStorage.setItem(STORAGE_KEY_ADMIN, nextTheme);

    // Update DOM class
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setTheme(nextTheme);

    // Broadcast change event
    window.dispatchEvent(
      new CustomEvent<'light' | 'dark'>(THEME_CHANGE_EVENT, { detail: nextTheme })
    );
    window.dispatchEvent(
      new CustomEvent<'light' | 'dark'>('wastecare_admin_theme_change', { detail: nextTheme })
    );
  };

  if (!mounted) {
    if (variant === 'setting-row') {
      return (
        <div className="flex items-center justify-between p-4 animate-pulse">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="w-14 h-7 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
      );
    }
    if (variant === 'compact') {
      return <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />;
    }
    return <div className="w-16 h-8 rounded-full bg-[#E2E8F0] dark:bg-[#1E293B] animate-pulse" />;
  }

  // Compact icon button variant
  if (variant === 'compact') {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-xl border transition-colors flex items-center justify-center cursor-pointer ${
          theme === 'dark'
            ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
        } ${className}`}
        title={`Beralih ke mode ${theme === 'dark' ? 'Terang' : 'Gelap'}`}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-slate-600" />}
      </button>
    );
  }

  // Setting row with switch for /akun profile page
  if (variant === 'setting-row') {
    return (
      <div className={`flex items-center justify-between p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400">
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </div>
          <div>
            <span className="font-semibold text-sm text-slate-900 dark:text-white">
              Mode Gelap (Dark Mode)
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {theme === 'dark' ? 'Mode malam aktif' : 'Mode terang aktif (default)'}
            </p>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="relative inline-flex h-7 w-14 items-center rounded-full bg-[#E2E8F0] dark:bg-[#1E293B] p-1 border border-[#CBD5E1] dark:border-[#334155] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#059669] cursor-pointer shadow-inner shrink-0"
          title={`Beralih ke mode ${theme === 'dark' ? 'Terang' : 'Gelap'}`}
          aria-label="Toggle dark mode"
        >
          <span className="flex w-full justify-between px-1 text-[10px] select-none pointer-events-none">
            <Sun size={11} className="text-amber-500 opacity-90" />
            <Moon size={11} className="text-emerald-400 opacity-90" />
          </span>

          <span
            className={`
              absolute top-0.5 left-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-[#0B0F17] text-slate-700 dark:text-emerald-400 shadow-sm transition-transform duration-300 ease-in-out border border-[#CBD5E1]/60 dark:border-[#334155]
              ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}
            `}
          >
            {theme === 'dark' ? (
              <Moon size={11} className="text-emerald-400" />
            ) : (
              <Sun size={11} className="text-amber-500" />
            )}
          </span>
        </button>
      </div>
    );
  }

  // Default switch variant (same look as admin)
  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex h-8 w-16 items-center rounded-full bg-[#E2E8F0] dark:bg-[#1E293B] p-1 border border-[#CBD5E1] dark:border-[#334155] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#059669] cursor-pointer shadow-inner shrink-0 ${className}`}
      title={`Beralih ke mode ${theme === 'dark' ? 'Terang' : 'Gelap'}`}
      aria-label="Toggle dark mode"
    >
      <span className="sr-only">Toggle Theme</span>

      {/* Background Icons */}
      <span className="flex w-full justify-between px-1 text-[11px] select-none pointer-events-none">
        <Sun size={13} className="text-amber-500 opacity-90" />
        <Moon size={13} className="text-emerald-400 opacity-90" />
      </span>

      {/* Sliding knob */}
      <span
        className={`
          absolute top-1 left-1 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-[#0B0F17] text-slate-700 dark:text-emerald-400 shadow-sm transition-transform duration-300 ease-in-out border border-[#CBD5E1]/60 dark:border-[#334155]
          ${theme === 'dark' ? 'translate-x-8' : 'translate-x-0'}
        `}
      >
        {theme === 'dark' ? (
          <Moon size={12} className="text-emerald-400" />
        ) : (
          <Sun size={12} className="text-amber-500" />
        )}
      </span>
    </button>
  );
}

export default ThemeToggle;
