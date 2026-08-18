'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const THEME_CHANGE_EVENT = 'wastecare_admin_theme_change';

export function AdminThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check initial state from DOM class or localStorage
    const isDark = document.documentElement.classList.contains('dark');
    const savedTheme = localStorage.getItem('wastecare_admin_theme') as 'light' | 'dark' | null;
    const initial = savedTheme || (isDark ? 'dark' : 'light');
    setTheme(initial);

    // Handler for cross-component sync on the same page
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<'light' | 'dark'>;
      if (customEvent.detail) {
        setTheme(customEvent.detail);
      }
    };

    // Handler for multi-tab sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'wastecare_admin_theme' && (e.newValue === 'light' || e.newValue === 'dark')) {
        setTheme(e.newValue);
        if (e.newValue === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    
    // Update local storage
    localStorage.setItem('wastecare_admin_theme', nextTheme);

    // Update DOM class
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Update current toggle state
    setTheme(nextTheme);

    // Broadcast to ALL other toggle instances across the app
    window.dispatchEvent(
      new CustomEvent<'light' | 'dark'>(THEME_CHANGE_EVENT, { detail: nextTheme })
    );
  };

  if (!mounted) {
    return (
      <div className="w-16 h-8 rounded-full bg-[#E2E8F0] dark:bg-[#1E293B] animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-8 w-16 items-center rounded-full bg-[#E2E8F0] dark:bg-[#1E293B] p-1 border border-[#CBD5E1] dark:border-[#334155] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#059669] cursor-pointer shadow-inner shrink-0"
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


