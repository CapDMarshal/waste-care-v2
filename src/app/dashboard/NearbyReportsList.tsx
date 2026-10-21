'use client';

import React, { useState } from 'react';
import { 
  Search, 
  X, 
  MapPin, 
  ArrowUpDown, 
  Filter, 
  Navigation, 
  Loader2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import type { WasteMarker } from '.';
import type { DashboardFilter, DashboardSort } from './useDashboard';
import type { GeocodingSuggestion } from '@/lib/maptilerGeocoding';
import NearbyReportCard from './NearbyReportCard';

interface NearbyReportsListProps {
  userName: string;
  markers: WasteMarker[];
  loading?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  geocodingSuggestions: GeocodingSuggestion[];
  isSearchingGeocode: boolean;
  activeRegionName: string | null;
  onSelectPlace: (suggestion: GeocodingSuggestion) => void;
  onResetToMyLocation: () => void;
  activeFilter: DashboardFilter;
  onFilterChange: (filter: DashboardFilter) => void;
  sortBy: DashboardSort;
  onSortChange: (sort: DashboardSort) => void;
  onSelectMarker: (markerId: string) => void;
  selectedMarkerId?: string | null;
}

const FILTER_ITEMS: { id: DashboardFilter; label: string; icon?: React.ReactNode }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'campaign', label: '⚡ Ada Aksi Bersih' },
  { id: 'campuran', label: 'Campuran' },
  { id: 'anorganik', label: 'Anorganik' },
  { id: 'organik', label: 'Organik' },
  { id: 'pinggir_jalan', label: 'Pinggir Jalan' },
  { id: 'sungai', label: 'Sungai' },
  { id: 'area_publik', label: 'Area Publik' },
  { id: 'tanah_kosong', label: 'Tanah Kosong' },
];

export function NearbyReportsList({
  userName,
  markers,
  loading = false,
  searchQuery,
  onSearchChange,
  geocodingSuggestions,
  isSearchingGeocode,
  activeRegionName,
  onSelectPlace,
  onResetToMyLocation,
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  onSelectMarker,
  selectedMarkerId,
}: NearbyReportsListProps) {
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  return (
    <div className="space-y-3.5 pb-6">
      {/* Sapaan & Status Wilayah */}
      <div className="flex items-start justify-between gap-3 px-1">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
            Halo, {userName}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
            <MapPin size={12} className="text-emerald-500 shrink-0" />
            {activeRegionName ? (
              <span>Menampilkan titik di <strong>{activeRegionName}</strong></span>
            ) : (
              <span>Jelajah tumpukan sampah tervalidasi di sekitar Anda</span>
            )}
          </p>
        </div>

        {activeRegionName && (
          <button
            onClick={onResetToMyLocation}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors"
          >
            <Navigation size={11} />
            <span>Lokasi Saya</span>
          </button>
        )}
      </div>

      {/* Live Search Input with Sleman Places Geocoding */}
      <div className="relative z-30">
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            {isSearchingGeocode ? (
              <Loader2 size={16} className="animate-spin text-emerald-500" />
            ) : (
              <Search size={16} />
            )}
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari wilayah di Sleman (cth: Depok, Mlati, Kaliurang)..."
            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-inner"
          />

          {searchQuery && (
            <button
              onClick={() => {
                onSearchChange('');
                if (activeRegionName) onResetToMyLocation();
              }}
              className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full"
              aria-label="Bersihkan pencarian"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Geocoding Places Dropdown Suggestions */}
        {geocodingSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden z-40 divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Pilih Wilayah di Sleman & Sekitarnya
            </div>
            {geocodingSuggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => onSelectPlace(suggestion)}
                className="w-full px-3.5 py-2.5 text-left flex items-start gap-2.5 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 transition-colors group cursor-pointer"
              >
                <MapPin size={14} className="text-emerald-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {suggestion.text}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {suggestion.placeName}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter Chips (Horizontal Scrollable) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
        {FILTER_ITEMS.map((item) => {
          const isActive = activeFilter === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onFilterChange(item.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 ring-1 ring-emerald-600'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Sort & Status Bar */}
      <div className="flex items-center justify-between text-xs px-1 pt-0.5">
        <span className="font-bold text-slate-700 dark:text-slate-300">
          {markers.length} Titik Sampah Terdeteksi
        </span>

        {/* Sort Dropdown Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold transition-colors"
          >
            <ArrowUpDown size={12} className="text-emerald-600 dark:text-emerald-400" />
            <span>
              {sortBy === 'distance' ? 'Terdekat' : sortBy === 'volume' ? 'Volume Terbesar' : 'Terbaru'}
            </span>
          </button>

          {showSortDropdown && (
            <div className="absolute right-0 top-full mt-1.5 w-40 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-1 z-30 space-y-0.5">
              {[
                { id: 'distance', label: 'Jarak Terdekat' },
                { id: 'volume', label: 'Volume Terbesar' },
                { id: 'newest', label: 'Waktu Terbaru' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onSortChange(opt.id as DashboardSort);
                    setShowSortDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    sortBy === opt.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Daftar Kartu Titik Sampah */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200/80 dark:border-slate-700/80"
              />
            ))}
          </div>
        ) : markers.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-850/60 rounded-2xl p-6 text-center border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
            <AlertCircle size={28} className="text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Tidak ada titik sampah ditemukan
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Coba ganti filter kategori, kosongkan kata kunci pencarian, atau jelajahi wilayah lain di Sleman.
            </p>
            {activeFilter !== 'all' && (
              <button
                onClick={() => onFilterChange('all')}
                className="mt-1 px-3 py-1 bg-emerald-600 text-white rounded-full text-[11px] font-bold hover:bg-emerald-700 transition"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          markers.map((marker) => (
            <NearbyReportCard
              key={marker.id}
              marker={marker}
              isSelected={selectedMarkerId === marker.id}
              onClick={() => onSelectMarker(marker.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default NearbyReportsList;
