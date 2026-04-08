import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getGeolocationErrorMessage } from '@/utils/errorMessages';

const LOCATION_DEBUG = true;

function locationLog(event: string, payload?: unknown) {
  if (!LOCATION_DEBUG) return;
  if (payload !== undefined) {
    console.log(`[location] ${event}`, payload);
    return;
  }
  console.log(`[location] ${event}`);
}

interface UseUserLocationOptions {
  onLocationChange?: (latitude: number, longitude: number) => void;
  onError?: (message: string) => void;
}

export function useUserLocation({ onLocationChange, onError }: UseUserLocationOptions = {}) {
  const pathname = usePathname();
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
    locationLog('request:start');
    setIsRequestingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          locationLog('request:success', { latitude, longitude });
          setUserLocation([longitude, latitude]);
          setIsRequestingLocation(false);
          
          // Call debounced callback
          debouncedLocationChange(latitude, longitude);
        },
        (error) => {
          const errorMessage = getGeolocationErrorMessage(error);
          locationLog('request:error', { code: error.code, message: errorMessage });
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
      locationLog('request:not-supported');
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
    locationLog('effect:init-request');
    requestLocation();
    
    // Cleanup debounce timer saat unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [requestLocation]);

  useEffect(() => {
    if (pathname === '/dashboard') {
      locationLog('effect:pathname-dashboard');
      requestLocation();
    }
  }, [pathname, requestLocation]);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      locationLog('pageshow', { persisted: event.persisted, pathname: window.location.pathname });
      if (window.location.pathname === '/dashboard') {
        requestLocation();
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && window.location.pathname === '/dashboard') {
        locationLog('visibility:visible-dashboard');
        requestLocation();
      }
    };

    window.addEventListener('pageshow', onPageShow);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('pageshow', onPageShow);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [requestLocation]);

  return { 
    userLocation, 
    isRequestingLocation,
    requestLocation 
  };
}
