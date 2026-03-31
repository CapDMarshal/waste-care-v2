'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Load external CSS asynchronously only when needed
 * Reduces unused CSS by loading MapTiler styles only on map pages
 */
export function AsyncStyleLoader() {
  const pathname = usePathname();
  
  useEffect(() => {
    // Only load MapTiler CSS on pages that actually use maps
    const needsMapStyles = pathname === '/dashboard' || 
                          pathname === '/landing' || 
                          pathname?.startsWith('/landing');
    
    if (!needsMapStyles) {
      return;
    }
    
    const loadStyle = (href: string, id: string) => {
      if (document.getElementById(id)) return;
      
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = href;
      link.media = 'print';
      link.onload = function() {
        // @ts-ignore
        this.media = 'all';
      };
      document.head.appendChild(link);
    };

    // Load MapTiler CSS only when on map pages
    loadStyle(
      'https://cdn.jsdelivr.net/npm/@maptiler/sdk@latest/dist/maptiler-sdk.css',
      'maptiler-css'
    );
  }, [pathname]);

  return null;
}
