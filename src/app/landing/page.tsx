'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Navbar, HeroSection } from './index';

// Lazy load heavy sections that are below the fold
const MapsSection = dynamic(() => import('./MapsSection'), {
  ssr: false,
  loading: () => (
    <div className="py-20 bg-gray-50 flex items-center justify-center">
      <div className="animate-pulse text-gray-400">Memuat peta...</div>
    </div>
  ),
});

const StatisticsSection = dynamic(() => import('./StatisticsSection'), {
  ssr: true, // Can be SSR since it's just data
  loading: () => (
    <div className="py-20 bg-white flex items-center justify-center">
      <div className="animate-pulse text-gray-400">Memuat statistik...</div>
    </div>
  ),
});

const Footer = dynamic(() => import('./Footer'), {
  ssr: true,
});

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar isScrolled={isScrolled} />
      <HeroSection />
      <MapsSection />
      <StatisticsSection />
      <Footer />
    </div>
  );
}
