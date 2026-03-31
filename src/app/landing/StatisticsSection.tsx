'use client';

import React, { useEffect, useState, memo } from 'react';
import {
  fetchTopCities,
  fetchOverallStatistics,
  fetchWasteTypeStatistics,
  type CityStatistic,
  type OverallStatistics,
  type WasteTypeStatistics
} from '@/lib/statisticsService';

// Cache for statistics to avoid repeated API calls
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const statisticsCache: {
  cities?: { data: CityStatistic[], timestamp: number },
  overall?: { data: OverallStatistics, timestamp: number },
  waste?: { data: WasteTypeStatistics, timestamp: number }
} = {};

function StatisticsSection() {
  const [topCities, setTopCities] = useState<CityStatistic[]>([]);
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
    riskNone: 0,
    riskLow: 0,
    riskMedium: 0,
    riskHigh: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isCacheValid = (timestamp: number) => {
    return Date.now() - timestamp < CACHE_DURATION;
  };

  const loadStatistics = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const now = Date.now();
      const citiesFromCache = statisticsCache.cities && isCacheValid(statisticsCache.cities.timestamp);
      const overallFromCache = statisticsCache.overall && isCacheValid(statisticsCache.overall.timestamp);
      const wasteFromCache = statisticsCache.waste && isCacheValid(statisticsCache.waste.timestamp);

      // Use cache if available, otherwise fetch
      const [cities, stats, waste] = await Promise.all([
        citiesFromCache ? Promise.resolve(statisticsCache.cities!.data) : fetchTopCities(),
        overallFromCache ? Promise.resolve(statisticsCache.overall!.data) : fetchOverallStatistics(),
        wasteFromCache ? Promise.resolve(statisticsCache.waste!.data) : fetchWasteTypeStatistics(),
      ]);

      // Update cache
      if (!citiesFromCache) {
        statisticsCache.cities = { data: cities, timestamp: now };
      }
      if (!overallFromCache) {
        statisticsCache.overall = { data: stats, timestamp: now };
      }
      if (!wasteFromCache) {
        statisticsCache.waste = { data: waste, timestamp: now };
      }

      setTopCities(cities);
      setOverallStats(stats);
      setWasteStats(waste);
    } catch (err) {
      setError('Gagal memuat statistik. Silakan refresh halaman.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
      case 2:
        return 'bg-gradient-to-br from-gray-300 to-gray-500';
      case 3:
        return 'bg-gradient-to-br from-orange-400 to-orange-600';
      default:
        return 'bg-gradient-to-br from-emerald-400 to-emerald-600';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return null;
  };

  return (
    <section id="statistics" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Statistik & Pencapaian
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Kota dengan pengelolaan sampah terbaik berdasarkan skor penyelesaian campaign dan kontribusi masyarakat
          </p>
        </div>

        {/* Top Cities Leaderboard */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 mb-8 border border-emerald-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Top 5 Kota Terbaik</h3>
                <p className="text-gray-600">Berdasarkan penyelesaian campaign dan pengelolaan sampah</p>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 shadow-sm animate-pulse"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gray-200 rounded-xl flex-shrink-0"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="h-8 bg-gray-200 rounded"></div>
                          <div className="h-8 bg-gray-200 rounded"></div>
                          <div className="h-8 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : error ? (
                // Error state
                <div className="bg-red-50 rounded-xl p-12 shadow-sm text-center border border-red-200">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-red-900 mb-2">
                    Gagal Memuat Data
                  </h4>
                  <p className="text-red-700 max-w-md mx-auto mb-4">
                    {error}
                  </p>
                  <button
                    onClick={loadStatistics}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : topCities.length === 0 ? (
                // Empty state
                <div className="bg-white rounded-xl p-12 shadow-sm text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Belum Ada Data Kota
                  </h4>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Data statistik kota akan muncul setelah ada laporan sampah dan campaign yang diselesaikan di berbagai kota.
                  </p>
                </div>
              ) : (
                topCities.map((city) => (
                  <div
                    key={city.rank}
                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank Badge */}
                      <div
                        className={`w-14 h-14 ${getRankBadgeColor(city.rank)} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}
                      >
                        {getRankIcon(city.rank)}
                        <span className="text-2xl font-bold text-white">{city.rank}</span>
                      </div>

                      {/* City Info */}
                      <div className="flex-1 min-w-0">
                        <div className="mb-2">
                          <h4 className="text-xl font-bold text-gray-900 truncate" title={city.city}>{city.city}</h4>
                          <span className="text-sm text-gray-500 truncate block" title={city.province}>{city.province}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600 truncate">Skor Kebersihan</span>
                            <span className="text-sm font-semibold text-emerald-600 ml-2 flex-shrink-0">{city.score.toFixed(2)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(city.score, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Statistics */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-600">Jumlah Campaign</div>
                            <div className="text-lg font-bold text-emerald-600">{city.completedCampaigns}</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-600">Laporan Aktif</div>
                            <div className="text-lg font-bold text-blue-600">{city.activeReports}</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-600">Area Dibersihkan</div>
                            <div className="text-lg font-bold text-orange-600">{city.cleanedAreas}</div>
                          </div>
                        </div>
                      </div>

                      {/* Trophy for top 3 */}
                      {city.rank <= 3 && (
                        <div className="hidden md:block">
                          <div className="text-6xl opacity-20">
                            {city.rank === 1 && '🏆'}
                            {city.rank === 2 && '🥈'}
                            {city.rank === 3 && '🥉'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Achievement Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-3xl font-bold text-gray-900 mb-2">
                  {loading ? (
                    <div className="animate-pulse h-9 w-24 bg-gray-200 rounded mx-auto"></div>
                  ) : (
                    overallStats.totalCampaignsCompleted.toLocaleString('id-ID')
                  )}
                </h4>
                <p className="text-gray-600">Jumlah Campaign</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="text-3xl font-bold text-gray-900 mb-2">
                  {loading ? (
                    <div className="animate-pulse h-9 w-24 bg-gray-200 rounded mx-auto"></div>
                  ) : (
                    overallStats.totalParticipants.toLocaleString('id-ID')
                  )}
                </h4>
                <p className="text-gray-600">Partisipan Aktif</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h4 className="text-3xl font-bold text-gray-900 mb-2">
                  {loading ? (
                    <div className="animate-pulse h-9 w-24 bg-gray-200 rounded mx-auto"></div>
                  ) : (
                    overallStats.totalCleanedAreas.toLocaleString('id-ID')
                  )}
                </h4>
                <p className="text-gray-600">Area Dibersihkan</p>
              </div>
            </div>
          </div>

          {/* Waste Type Statistics */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                  <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                  <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Statistik Jenis Sampah</h3>
                <p className="text-gray-600">Total laporan berdasarkan kategori sampah</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {loading ? (
                      <div className="animate-pulse h-9 w-16 bg-gray-200 rounded mx-auto"></div>
                    ) : (
                      wasteStats.total.toLocaleString('id-ID')
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Total Laporan</div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-1">
                    {loading ? (
                      <div className="animate-pulse h-9 w-16 bg-gray-200 rounded mx-auto"></div>
                    ) : (
                      wasteStats.organic.toLocaleString('id-ID')
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Organik</div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {loading ? (
                      <div className="animate-pulse h-9 w-16 bg-gray-200 rounded mx-auto"></div>
                    ) : (
                      wasteStats.inorganic.toLocaleString('id-ID')
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Anorganik</div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-1">
                    {loading ? (
                      <div className="animate-pulse h-9 w-16 bg-gray-200 rounded mx-auto"></div>
                    ) : (
                      wasteStats.hazardous.toLocaleString('id-ID')
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Berbahaya</div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-1">
                    {loading ? (
                      <div className="animate-pulse h-9 w-16 bg-gray-200 rounded mx-auto"></div>
                    ) : (
                      wasteStats.mixed.toLocaleString('id-ID')
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Campuran</div>
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-semibold text-yellow-900 mb-1">Cara Perhitungan Skor</h4>
                <p className="text-sm text-yellow-800">
                  Skor dihitung berdasarkan jumlah campaign yang diselesaikan (60%), jumlah laporan yang ditangani (30%),
                  dan campaign aktif (10%). Kota ditentukan berdasarkan koordinat geografis laporan.
                  Data diperbarui secara real-time berdasarkan aktivitas di database.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(StatisticsSection);
