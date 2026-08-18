'use client';

import dynamic from 'next/dynamic';
import { MapPin, Navigation } from 'lucide-react';
import { getGoogleMapsUrl } from '@/lib/locationParser';

const MapTilerMap = dynamic(
  () => import('@/components/shared/MapTilerMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl">
        <p className="text-slate-500 dark:text-slate-400 text-xs">Memuat peta lokasi...</p>
      </div>
    )
  }
);

interface AdminLocationSectionProps {
  latitude: number;
  longitude: number;
  reportId: number;
}

export default function AdminLocationSection({ 
  latitude, 
  longitude, 
  reportId 
}: AdminLocationSectionProps) {
  const mapsUrl = getGoogleMapsUrl(latitude, longitude);

  return (
    <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm dark:shadow-xl dark:shadow-black/10 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#059669]/10 border border-[#059669]/20 flex items-center justify-center text-[#059669] dark:text-emerald-400">
            <MapPin size={17} />
          </div>
          <h2 className="font-bold text-slate-900 dark:text-white text-base">
            Titik Koordinat Lokasi
          </h2>
        </div>

        <a 
          href={mapsUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] dark:bg-[#1E293B] dark:hover:bg-[#334155] text-[#059669] dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-semibold text-xs border border-[#CBD5E1] dark:border-[#334155] transition"
        >
          <Navigation size={13} />
          <span>Buka Google Maps</span>
        </a>
      </div>

      {/* Coordinates Display */}
      <div className="grid grid-cols-2 gap-3 bg-[#F8FAFC] dark:bg-[#0B0F17]/60 rounded-2xl p-3.5 border border-[#E2E8F0] dark:border-[#1E293B]">
        <div>
          <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-0.5">Latitude</p>
          <p className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">{latitude.toFixed(6)}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-0.5">Longitude</p>
          <p className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">{longitude.toFixed(6)}</p>
        </div>
      </div>

      {/* Map Display */}
      <div className="rounded-2xl overflow-hidden border border-[#E2E8F0] dark:border-[#1E293B] shadow-inner">
        <MapTilerMap
          key={`map-${reportId}`}
          className="w-full h-72 sm:h-80"
          center={[longitude, latitude]}
          zoom={15}
          markers={[
            {
              id: 'report-location',
              coordinates: [longitude, latitude] as [number, number],
              type: 'waste' as const,
              title: `Laporan #${reportId}`,
            }
          ]}
        />
      </div>
    </div>
  );
}



