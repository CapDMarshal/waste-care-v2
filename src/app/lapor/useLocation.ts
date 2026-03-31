import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Location } from '@/contexts/ReportContext';
import { getGeolocationErrorMessage } from '@/utils/errorMessages';

interface UseLocationProps {
  currentLocation: Location | null;
  onSetLocation: (location: Location) => void;
}

export function useLocation({ currentLocation, onSetLocation }: UseLocationProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    // Check if location is already captured
    if (currentLocation) {
      setLocationEnabled(true);
    }
  }, [currentLocation]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Browser Anda tidak mendukung geolocation');
      return;
    }

    setLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onSetLocation({ latitude, longitude });
        setLocationEnabled(true);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        const errorMessage = getGeolocationErrorMessage(error);
        setLocationError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleConfirm = () => {
    if (!locationEnabled) {
      throw new Error('Mohon izinkan akses lokasi terlebih dahulu');
    }

    setLoading(true);
    // Navigate to foto page using Next.js router (skip detail page)
    setTimeout(() => {
      router.push('/lapor/foto');
    }, 500);
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  return {
    loading,
    locationEnabled,
    locationError,
    handleGetLocation,
    handleConfirm,
    handleBack,
  };
}
