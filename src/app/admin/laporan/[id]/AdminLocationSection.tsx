'use client';

import dynamic from 'next/dynamic';
import { MapPin, Navigation } from 'lucide-react';
import { getGoogleMapsUrl } from '@/lib/locationParser';

const MapTilerMap = dynamic(
  () => import('@/components/shared/MapTilerMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 flex items-center justify-center bg-gray-100 rounded-xl">
        <p className="text-gray-500">Memuat peta...</p>
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
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
          <MapPin size={20} className="text-green-600" />
          Lokasi Laporan
        </h2>
        <a 
          href={mapsUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          <Navigation size={16} />
          Buka di Maps
        </a>
      </div>

      {/* Coordinates Display */}
      <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Latitude</p>
          <p className="text-lg font-mono font-semibold text-gray-900">{latitude.toFixed(6)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Longitude</p>
          <p className="text-lg font-mono font-semibold text-gray-900">{longitude.toFixed(6)}</p>
        </div>
      </div>

      {/* Map Display */}
      <div className="rounded-xl overflow-hidden border border-gray-200">
        <MapTilerMap
          key={`map-${reportId}`}
          className="w-full h-80"
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
