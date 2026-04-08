import { useCallback, useEffect, useState } from 'react';
import CloseButton from './CloseButton';
import LocationPermissionButton from './LocationPermissionButton';
import type { WasteMarker } from '.';
import MapTilerMap from '@/components/shared/MapTilerMap';

interface MapViewProps {
  userLocation: [number, number] | null;
  markers: WasteMarker[];
  showDetails: boolean;
  onMarkerClick: (markerId: string) => void;
  onCloseDetails: () => void;
  showRoute?: boolean;
  routeStart?: [number, number] | null;
  routeEnd?: [number, number] | null;
  isRequestingLocation?: boolean;
  onRequestLocation?: () => void;
}

export default function MapView({
  userLocation,
  markers,
  showDetails,
  onMarkerClick,
  onCloseDetails,
  showRoute = false,
  routeStart = null,
  routeEnd = null,
  isRequestingLocation = false,
  onRequestLocation,
}: MapViewProps) {
  const [mapRenderKey, setMapRenderKey] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setMapRenderKey(prev => prev + 1);
      }
    };

    const onPopState = () => {
      setMapRenderKey(prev => prev + 1);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setMapRenderKey(prev => prev + 1);
      }
    };

    window.addEventListener('pageshow', onPageShow);
    window.addEventListener('popstate', onPopState);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('popstate', onPopState);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    setMapReady(false);
  }, [mapRenderKey]);

  useEffect(() => {
    if (mapReady) return;
    if (retryCount >= 3) return;

    const timer = window.setTimeout(() => {
      if (!mapReady) {
        console.warn('[map-view] map not ready, remounting', { retryCount: retryCount + 1 });
        setRetryCount(prev => prev + 1);
        setMapRenderKey(prev => prev + 1);
      }
    }, 5000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [mapReady, retryCount]);

  const handleMapReady = useCallback(() => {
    setMapReady(true);
    setRetryCount(0);
  }, []);

  const handleMapError = useCallback((error: Error) => {
    console.error('[map-view] map error', error);
    setMapReady(false);
  }, []);

  return (
    <div className="relative h-screen">
      <MapTilerMap
        key={mapRenderKey}
        className="w-full h-full"
        center={userLocation || [110.3695, -7.7956]}
        zoom={13}
        markers={markers}
        onMarkerClick={onMarkerClick}
        showRoute={showRoute}
        routeStart={routeStart}
        routeEnd={routeEnd}
        userLocation={userLocation}
        onMapReady={handleMapReady}
        onMapError={handleMapError}
      />

      {/* Location Permission Button */}
      {onRequestLocation && (
        <LocationPermissionButton 
          onClick={onRequestLocation}
          isRequesting={isRequestingLocation}
          hasLocation={userLocation !== null}
        />
      )}

      {/* Close button for selected marker */}
      {showDetails && <CloseButton onClick={onCloseDetails} />}
    </div>
  );
}
