'use client';

import React, { useEffect, useState } from 'react';
import { 
  fetchOverallStatistics, 
  fetchWasteTypeStatistics,
  type OverallStatistics,
  type WasteTypeStatistics
} from '@/lib/statisticsService';

export default function HeroSection() {
  const [overallStats, setOverallStats] = useState<OverallStatistics>({
    totalCampaignsCompleted: 0,
    totalParticipants: 0,
    totalCleanedAreas: 0,
  });
  const [wasteStats, setWasteStats] = useState<WasteTypeStatistics>({
    total: 0,
    organic: 0,
    inorganic: 0,
    hazardous: 0,
    mixed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const [stats, waste] = await Promise.all([
        fetchOverallStatistics(),
        fetchWasteTypeStatistics(),
      ]);
      setOverallStats(stats);
      setWasteStats(waste);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white opacity-20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
            {/* <div className="inline-block px-4 py-2 bg-white bg-opacity-30 rounded-full mb-6 backdrop-blur-md border border-white border-opacity-40">
              <span className="text-sm font-semibold text-white">🌍 Peduli Lingkungan, Peduli Masa Depan</span>
            </div> */}

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Bersama Wujudkan
              <span className="block text-emerald-200">Lingkungan Bersih</span>
            </h1>

            <p className="text-xl text-emerald-50 mb-8 leading-relaxed">
              WasteCare adalah platform digital yang memudahkan Anda melaporkan masalah sampah,
              bergabung dalam kampanye pembersihan, dan berkontribusi untuk lingkungan yang lebih baik.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => scrollToSection('maps')}
                className="px-8 py-4 bg-white text-emerald-700 rounded-xl font-semibold hover:bg-emerald-50 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Lihat Peta Sampah
              </button>

              <button
                onClick={() => scrollToSection('statistics')}
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Lihat Statistik
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-white border-opacity-20">
              <div>
                {loading ? (
                  <div className="text-3xl font-bold mb-1">
                    <div className="animate-pulse h-9 w-20 bg-white bg-opacity-20 rounded"></div>
                  </div>
                ) : (
                  <div className="text-3xl font-bold mb-1">
                    {wasteStats.total.toLocaleString('id-ID')}
                  </div>
                )}
                <div className="text-emerald-200 text-sm font-medium">Laporan Aktif</div>
              </div>
              <div>
                {loading ? (
                  <div className="text-3xl font-bold mb-1">
                    <div className="animate-pulse h-9 w-20 bg-white bg-opacity-20 rounded"></div>
                  </div>
                ) : (
                  <div className="text-3xl font-bold mb-1">
                    {overallStats.totalCampaignsCompleted.toLocaleString('id-ID')}
                  </div>
                )}
                <div className="text-emerald-200 text-sm font-medium">Jumlah Campaign</div>
              </div>
              <div>
                {loading ? (
                  <div className="text-3xl font-bold mb-1">
                    <div className="animate-pulse h-9 w-20 bg-white bg-opacity-20 rounded"></div>
                  </div>
                ) : (
                  <div className="text-3xl font-bold mb-1">
                    {overallStats.totalParticipants > 1000 
                      ? `${(overallStats.totalParticipants / 1000).toFixed(1)}K+`
                      : overallStats.totalParticipants.toLocaleString('id-ID')
                    }
                  </div>
                )}
                <div className="text-emerald-200 text-sm font-medium">Pengguna Aktif</div>
              </div>
            </div>
          </div>

          {/* Right Content - Illustration */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-0 bg-white bg-opacity-10 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 border border-white border-opacity-20">
                <div className="space-y-4">
                  {/* Feature Cards */}
                  <div className="bg-white rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-transform">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Lapor Sampah</div>
                        <div className="text-sm text-gray-600">Mudah & Cepat</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-transform">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Join Campaign</div>
                        <div className="text-sm text-gray-600">Bergotong Royong</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-transform">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Pantau Progress</div>
                        <div className="text-sm text-gray-600">Real-time Update</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
