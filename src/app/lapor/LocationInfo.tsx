import { DetailItem } from '@/components';

interface LocationInfoProps {
  locationEnabled: boolean;
  locationError: string | null;
  latitude?: number;
  longitude?: number;
  onActionClick: () => void;
}

export default function LocationInfo({ 
  locationEnabled, 
  locationError, 
  latitude, 
  longitude, 
  onActionClick 
}: LocationInfoProps) {
  const getDescription = () => {
    if (locationError) return locationError;
    if (locationEnabled && latitude && longitude) {
      return `Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`;
    }
    return "Izinkan untuk membagikan lokasi untuk melanjutkan";
  };

  return (
    <div className="text-center space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Konfirmasi titik lokasi
      </h1>

      {/* Location Image */}
      <div className="flex justify-center">
        <img 
          src="/images/lapor-location.png" 
          alt="Location confirmation" 
          className="w-48 h-48 object-contain"
        />
      </div>

      {/* Location Info */}
      <div className="space-y-3">
        <DetailItem
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          iconBgColor={locationEnabled ? "bg-green-100" : "bg-gray-100"}
          iconColor={locationEnabled ? "text-green-500" : "text-gray-500"}
          title={locationEnabled ? "Lokasi aktif" : "Lokasi mati"}
          description={getDescription()}
          actionText={locationEnabled ? "Perbarui" : "Izinkan"}
          onActionClick={onActionClick}
        />
      </div>
    </div>
  );
}
