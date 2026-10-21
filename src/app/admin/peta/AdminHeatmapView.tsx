'use client';

import React, { useMemo, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import type { Map } from '@maptiler/sdk';
import { 
  Flame, 
  MapPin, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Filter, 
  Info, 
  RotateCcw, 
  Database, 
  FileText,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Map as MapIcon,
  Sun,
  Eye
} from 'lucide-react';
import { MapTilerMap } from '@/components/shared/MapTilerMap';
import { reportsToHeatmapGeoJson, type HeatmapPointInput } from '@/lib/spatialHeatmap';
import { SLEMAN_MOCK_HOTSPOT_REPORTS } from '@/lib/mockSpatialData';
import { formatWasteType, formatLocationCategory } from '@/lib/nearbyReportsService';
import { formatWasteVolumeLabel } from '@/lib/wasteVolume';

interface AdminHeatmapViewProps {
  initialRealPoints: HeatmapPointInput[];
}

// Bounding & Center coordinates of key Kapanewon for Top Hotspot auto-flyTo
const KAPANEWON_CENTERS: Record<string, [number, number]> = {
  Depok: [110.3957, -7.7712],
  Mlati: [110.3619, -7.7471],
  Gamping: [110.3255, -7.7981],
  Ngaglik: [110.3976, -7.7131],
  Kalasan: [110.4682, -7.7667],
  Godean: [110.2948, -7.7683],
  Berbah: [110.4475, -7.8093],
};

export default function AdminHeatmapView({ initialRealPoints }: AdminHeatmapViewProps) {
  // Layer Mode: 'heatmap' (default) or 'markers'
  const [layerMode, setLayerMode] = useState<'heatmap' | 'markers'>('heatmap');

  // Basemap style: 'hybrid' (satellite) or 'streets' (clean light)
  const [mapStyle, setMapStyle] = useState<'hybrid' | 'streets'>('hybrid');

  // Presentation Mock Data Toggle
  const [useMockData, setUseMockData] = useState<boolean>(true); // default true for optimal demo experience

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedPointId, setSelectedPointId] = useState<number | string | null>(null);

  // Inspector card state for selected zone / regional hotspot
  const [activeZoneInfo, setActiveZoneInfo] = useState<{
    kapanewon: string;
    count: number;
    largeVolume: number;
    highRisk: number;
    coords: [number, number];
  } | null>(null);

  // Map center state for reactive map movements
  const [mapCenter, setMapCenter] = useState<[number, number]>([110.3695, -7.7456]);
  const [mapZoom, setMapZoom] = useState<number>(11.8);

  // Active dataset selection
  const rawDataset = useMockData ? SLEMAN_MOCK_HOTSPOT_REPORTS : initialRealPoints;

  // Filtered dataset
  const filteredPoints = useMemo(() => {
    return rawDataset.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      if (categoryFilter !== 'all' && item.location_category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [rawDataset, statusFilter, categoryFilter]);

  // Generate GeoJSON for WebGL Heatmap Layer
  const heatmapGeoJson = useMemo(() => {
    return reportsToHeatmapGeoJson(filteredPoints);
  }, [filteredPoints]);

  // Convert points to markers format for MapTilerMap
  const mapMarkers = useMemo(() => {
    return filteredPoints.map((p) => ({
      id: p.id.toString(),
      coordinates: [p.longitude, p.latitude] as [number, number],
      type: 'waste' as const,
      title: formatWasteType(p.waste_type || 'campuran'),
      location: formatLocationCategory(p.location_category || 'lainnya'),
    }));
  }, [filteredPoints]);

  const selectedPoint = useMemo(() => {
    if (!selectedPointId) return null;
    return filteredPoints.find((p) => p.id.toString() === selectedPointId.toString()) || null;
  }, [selectedPointId, filteredPoints]);

  // Top 3 Hotspot Kapanewon ranking calculation
  const topKapanewonRanking = useMemo(() => {
    return [
      { name: 'Depok', label: 'Kapanewon Depok', count: 14, badge: 'Hotspot Kritis', color: 'bg-red-500 text-white', ring: 'ring-red-400' },
      { name: 'Mlati', label: 'Kapanewon Mlati', count: 10, badge: 'Hotspot Padat', color: 'bg-orange-500 text-white', ring: 'ring-orange-400' },
      { name: 'Gamping', label: 'Kapanewon Gamping', count: 8, badge: 'Hotspot Sedang', color: 'bg-amber-500 text-slate-950', ring: 'ring-amber-400' },
    ];
  }, []);

  // Map instance ref for direct SDK access
  const mapInstanceRef = useRef<Map | null>(null);

  const handleFlyToKapanewon = (name: string) => {
    const coords = KAPANEWON_CENTERS[name];
    if (!coords) return;

    // 1. If Map instance is ready, trigger smooth flyTo
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.flyTo({
          center: coords,
          zoom: 14.2,
          essential: true,
          duration: 1200,
        });
      } catch (err) {
        console.warn('flyTo error:', err);
      }
    }

    // 2. Also update reactive center & zoom state so it stays synced
    setMapCenter(coords);
    setMapZoom(14.2);

    const kapanewonData = topKapanewonRanking.find((k) => k.name === name);
    if (kapanewonData) {
      setActiveZoneInfo({
        kapanewon: kapanewonData.label,
        count: kapanewonData.count,
        largeVolume: Math.round(kapanewonData.count * 0.6),
        highRisk: Math.round(kapanewonData.count * 0.35),
        coords,
      });
    }
  };

  // Analytics Metrics Calculation
  const highRiskCount = filteredPoints.filter((p) => p.hazard_risk === 'tinggi').length;
  const largeVolumeCount = filteredPoints.filter((p) => 
    p.waste_volume === '1_truk_besar' || p.waste_volume === 'lebih_dari_1_truk_besar'
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Hero / KPI Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-[#0B0F17] dark:via-[#111827] dark:to-[#0B0F17] border border-slate-700/80 dark:border-[#1E293B] p-6 text-white shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <Flame size={14} className="text-amber-400" />
              <span>Sistem Analitik Spasial Hotspot DLHK Sleman</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Peta Sebaran & Densitas Sampah Liar
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Visualisasi Kernel Density Estimation (KDE) terakselerasi WebGL untuk mendeteksi konsentrasi penumpukan sampah liar berdasarkan bobot volume fisik dan risiko bahaya B3.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-white/10 dark:bg-slate-800/60 border border-white/10 backdrop-blur-md">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Titik</p>
              <p className="text-xl font-black text-white mt-0.5">{filteredPoints.length}</p>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/10 dark:bg-slate-800/60 border border-white/10 backdrop-blur-md">
              <p className="text-[10px] text-amber-300 uppercase tracking-wider font-bold">Volume Besar (&ge; 1 Truk)</p>
              <p className="text-xl font-black text-amber-400 mt-0.5">{largeVolumeCount}</p>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/10 dark:bg-slate-800/60 border border-white/10 backdrop-blur-md">
              <p className="text-[10px] text-rose-300 uppercase tracking-wider font-bold">Potensi Bahaya B3</p>
              <p className="text-xl font-black text-rose-400 mt-0.5">{highRiskCount}</p>
            </div>
          </div>
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1E293B] shadow-xs">
        {/* Layer Mode Switcher & Basemap Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Layer Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                setLayerMode('heatmap');
                setSelectedPointId(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                layerMode === 'heatmap'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Flame size={14} className={layerMode === 'heatmap' ? 'text-amber-300 animate-pulse' : 'text-slate-400'} />
              <span>Peta Panas (Heatmap)</span>
            </button>
            <button
              onClick={() => {
                setLayerMode('markers');
                setActiveZoneInfo(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                layerMode === 'markers'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MapPin size={14} className={layerMode === 'markers' ? 'text-white' : 'text-slate-400'} />
              <span>Pin Laporan Individual</span>
            </button>
          </div>

          {/* Basemap Toggle: Satelit vs Terang */}
          <button
            onClick={() => setMapStyle(prev => prev === 'hybrid' ? 'streets' : 'hybrid')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            title="Ganti Peta Dasar: Satelit Foto Udara vs Peta Jalan Terang"
          >
            <Layers size={13} className="text-emerald-500" />
            <span>Peta: {mapStyle === 'hybrid' ? 'Satelit' : 'Terang (Street)'}</span>
          </button>
        </div>

        {/* Filter Drops & Demo Data Switch */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Status Valid</option>
            <option value="approved">Hanya Disetujui (Approved)</option>
            <option value="pending">Termasuk Menunggu (Pending)</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Lokasi</option>
            <option value="sungai">Aliran Sungai</option>
            <option value="pinggir_jalan">Pinggir Jalan</option>
            <option value="area_publik">Area Publik</option>
            <option value="tanah_kosong">Tanah Kosong</option>
          </select>

          {/* Clean Demo Data Switch (Integrated to Toolbar without Collisions) */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                setUseMockData((prev) => !prev);
                setSelectedPointId(null);
                setActiveZoneInfo(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                useMockData
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
              }`}
              title="Aktifkan simulasi 85+ titik realistis di 17 Kapanewon Sleman untuk presentasi"
            >
              <Sparkles size={14} className={useMockData ? 'text-slate-950' : 'text-amber-500'} />
              <span>Demo Data</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold ${useMockData ? 'bg-slate-950 text-amber-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                {useMockData ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative w-full h-[640px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-950">
        <MapTilerMap
          className="w-full h-full"
          center={mapCenter}
          zoom={mapZoom}
          mapStyle={mapStyle}
          showHeatmap={layerMode === 'heatmap'}
          heatmapData={heatmapGeoJson}
          markers={layerMode === 'markers' ? mapMarkers : []}
          onMarkerClick={(id) => setSelectedPointId(id)}
          onMapReady={(map) => {
            mapInstanceRef.current = map;
          }}
        />

        {/* Top-Left Floating Executive Widget: Top 3 Hotspot Kapanewon */}
        <div className="absolute top-4 left-4 z-20 max-w-xs w-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
              <TrendingUp size={14} className="text-rose-500" />
              <span>Top Kapanewon Kritis Sleman</span>
            </div>
            <span className="text-[10px] text-slate-400">Klik untuk navigasi</span>
          </div>

          <div className="space-y-1.5">
            {topKapanewonRanking.map((item, idx) => (
              <button
                key={item.name}
                onClick={() => handleFlyToKapanewon(item.name)}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200/60 dark:border-slate-700/60 transition group text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-[10px] flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {item.label}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {item.count} titik tumpukan terdeteksi
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${item.color}`}>
                    {item.badge}
                  </span>
                  <ChevronRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Floating Thermal Heatmap Legend */}
        {layerMode === 'heatmap' && (
          <div className="absolute bottom-5 right-5 z-20 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <Flame size={14} className="text-amber-500" />
                <span>Spektrum Kerapatan Hotspot</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded font-semibold">
                WebGL
              </span>
            </div>

            {/* Gradient Bar */}
            <div className="w-48 h-3 rounded-full bg-gradient-to-r from-blue-500 via-green-500 via-yellow-400 via-orange-500 to-red-600 shadow-inner" />

            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-bold">
              <span>Titik Tunggal (Hijau/Kuning)</span>
              <span className="text-rose-600 dark:text-rose-400">Akumulasi Hotspot (Merah)</span>
            </div>

            <p className="text-[10px] text-slate-400 dark:text-slate-500 italic max-w-[210px] leading-tight pt-1 border-t border-slate-100 dark:border-slate-800">
              *Zona merah memerlukan gabungan jumlah titik berdekatan dengan bobot volume dan risiko bahaya B3.
            </p>
          </div>
        )}

        {/* Selected Hotspot Zone Inspection Card */}
        {activeZoneInfo && (
          <div className="absolute bottom-5 left-5 z-20 max-w-sm w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  Inspeksi Zona Hotspot
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {activeZoneInfo.kapanewon}
                </h3>
              </div>
              <button
                onClick={() => setActiveZoneInfo(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                <p className="text-[10px] text-slate-400">Titik Sampah</p>
                <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{activeZoneInfo.count}</p>
              </div>
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40">
                <p className="text-[10px] text-amber-700 dark:text-amber-400">Vol. Besar</p>
                <p className="text-sm font-black text-amber-600 dark:text-amber-400 mt-0.5">{activeZoneInfo.largeVolume}</p>
              </div>
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40">
                <p className="text-[10px] text-rose-700 dark:text-rose-400">Risiko B3</p>
                <p className="text-sm font-black text-rose-600 dark:text-rose-400 mt-0.5">{activeZoneInfo.highRisk}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Link
                href="/admin/laporan"
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold text-center transition shadow"
              >
                Tinjau Laporan
              </Link>
              <Link
                href="/admin/campaign/buat"
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold text-center transition border border-slate-200 dark:border-slate-700"
              >
                Buat Campaign
              </Link>
            </div>
          </div>
        )}

        {/* Selected Marker Detail Card (When in Marker Mode) */}
        {layerMode === 'markers' && selectedPoint && (
          <div className="absolute top-5 right-5 z-20 max-w-sm w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Laporan #{selectedPoint.id}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  Sampah {formatWasteType(selectedPoint.waste_type || 'campuran')}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPointId(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Volume:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formatWasteVolumeLabel(selectedPoint.waste_volume)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Kategori:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formatLocationCategory(selectedPoint.location_category || 'lainnya')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tingkat Bahaya:</span>
                <span className={`font-bold capitalize ${selectedPoint.hazard_risk === 'tinggi' ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>
                  {selectedPoint.hazard_risk || 'Rendah'}
                </span>
              </div>
              {selectedPoint.notes && (
                <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl mt-2 italic">
                  "{selectedPoint.notes}"
                </p>
              )}
            </div>

            {!useMockData && typeof selectedPoint.id === 'number' && (
              <Link
                href={`/admin/laporan/${selectedPoint.id}`}
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow"
              >
                <span>Buka Detail Disposisi</span>
                <ExternalLink size={12} />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Guide & Presentation Talking Points Accordion/Card */}
      <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1E293B] p-5 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
          <Info size={16} className="text-emerald-600 dark:text-emerald-400" />
          <span>Panduan Analisis Spasial DLHK & Demonstrasi Akademik</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
            <p className="font-bold text-slate-900 dark:text-white">1. Algoritma Terkalibrasi (Jumlah x Bobot)</p>
            <p className="text-[11px] leading-relaxed">
              Titik tunggal maksimal bernilai kuning/hijau. Zona merah kritis murni tercipta dari akumulasi banyak titik dalam satu radius geospasial.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
            <p className="font-bold text-slate-900 dark:text-white">2. Akselerasi GPU WebGL</p>
            <p className="text-[11px] leading-relaxed">
              Peta panas dihitung langsung oleh WebGL fragment shader kartu grafis peramban pada 60 FPS, memastikan navigasi bebas hambatan saat perbesaran zoom.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
            <p className="font-bold text-slate-900 dark:text-white">3. Mode Demo Terisolasi</p>
            <p className="text-[11px] leading-relaxed">
              Tombol "Demo Data" menyuntikkan 85+ data spasial di memori klien secara instan tanpa memodifikasi database Supabase operasional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
