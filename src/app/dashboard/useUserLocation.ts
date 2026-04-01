import { useState, useEffect, useCallback, useRef } from 'react';
import { getGeolocationErrorMessage } from '@/utils/errorMessages';

interface UseUserLocationOptions {
  onLocationChange?: (latitude: number, longitude: number) => void;
  onError?: (message: string) => void;
}

export function useUserLocation({ onLocationChange, onError }: UseUserLocationOptions = {}) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  
  // Ref untuk debounce timer
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Wrapper callback dengan debounce
  const debouncedLocationChange = useCallback((latitude: number, longitude: number) => {
    if (!onLocationChange) return;

    // Clear timer sebelumnya
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set timer baru untuk debounce 300ms
    debounceTimerRef.current = setTimeout(() => {
      onLocationChange(latitude, longitude);
      debounceTimerRef.current = null;
    }, 300);
  }, [onLocationChange]);

  const requestLocation = useCallback(() => {
    setIsRequestingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([longitude, latitude]);
          setIsRequestingLocation(false);
          
          // Call debounced callback
          debouncedLocationChange(latitude, longitude);
        },
        (error) => {
          const errorMessage = getGeolocationErrorMessage(error);
          setIsRequestingLocation(false);
          
          if (onError) {
            onError(errorMessage);
          }
          
          // Use default location (Yogyakarta center)
          const defaultLat = -7.7956;
          const defaultLon = 110.3695;
          setUserLocation([defaultLon, defaultLat]);
          
          // Call debounced callback
          debouncedLocationChange(defaultLat, defaultLon);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      const errorMessage = 'Browser tidak mendukung geolocation';
      setIsRequestingLocation(false);
      
      if (onError) {
        onError(errorMessage);
      }
      
      // Use default location
      const defaultLat = -7.7956;
      const defaultLon = 110.3695;
      setUserLocation([defaultLon, defaultLat]);
      
      // Call debounced callback
      debouncedLocationChange(defaultLat, defaultLon);
    }
  }, [debouncedLocationChange, onError]);

  useEffect(() => {
    requestLocation();
    
    // Cleanup debounce timer saat unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [requestLocation]);

  return { 
    userLocation, 
    isRequestingLocation,
    requestLocation 
  };
}
