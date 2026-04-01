import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNearbyReports } from './useNearbyReports';
import { useMarkerSelection } from './useMarkerSelection';
import { 
  formatWasteType, 
  formatWasteVolume, 
  formatLocationCategory,
  formatDistance,
} from '@/lib/nearbyReportsService';
import { getCampaignDataByReportIds } from '@/lib/campaignService';
import { useUserLocation } from './useUserLocation';
import { WasteMarker } from '.';

export function useDashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [radiusKm] = useState(10);
  const [campaignMap, setCampaignMap] = useState<Map<number, boolean>>(new Map());
  const [campaignDetailsMap, setCampaignDetailsMap] = useState<Map<number, { id: number; status: string }>>(new Map());
  const [showRoute, setShowRoute] = useState(false);
  const [savedRouteEnd, setSavedRouteEnd] = useState<[number, number] | null>(null);

  // Get display name
  const getDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      // Get first part of email before @
      return user.email.split('@')[0];
    }
    return 'User';  
  };

  const displayName = getDisplayName();

  // Fetch nearby reports
  const { reports, loading, error, setError, fetchNearbyReports } = useNearbyReports(radiusKm);

  // Get user location and fetch reports when location is available
  const { userLocation, isRequestingLocation, requestLocation } = useUserLocation({
    onLocationChange: fetchNearbyReports,
    onError: setError,
  });

  // Fetch campaigns for reports
  useEffect(() => {
    if (reports.length > 0) {
      const reportIds = reports.map(r => r.id);
      
      // Single API call to get both hasCampaign and campaign details
      getCampaignDataByReportIds(reportIds).then(({ campaignMap, campaignDetailsMap }) => {
        setCampaignMap(campaignMap);
        setCampaignDetailsMap(campaignDetailsMap);
      });
    }
  }, [reports]);

  // Marker selection state
  const {
    selectedMarkerId,
    showDetails,
    handleMarkerClick,
    handleCloseDetails,
  } = useMarkerSelection();

  // Convert reports to markers format
  const wasteMarkers = useMemo<WasteMarker[]>(() => {
    return reports.map((report) => {
      const campaignDetails = campaignDetailsMap.get(report.id);
      return {
        id: report.id.toString(),
        coordinates: [report.longitude, report.latitude] as [number, number],
        type: 'waste' as const,
        title: formatWasteType(report.waste_type),
        location: formatLocationCategory(report.location_category),
        wasteType: formatWasteType(report.waste_type),
        amount: formatWasteVolume(report.waste_volume),
        category: formatLocationCategory(report.location_category),
        distance: formatDistance(report.distance_km),
        imageUrls: report.image_urls,
        notes: report.notes,
        createdAt: report.created_at,
        hasCampaign: campaignMap.get(report.id) || false,
        campaignId: campaignDetails?.id,
      };
    });
  }, [reports, campaignMap, campaignDetailsMap]);

  // Search handler
  const handleSearch = useCallback(() => {
    // If user location is available, refetch with current search parameters
    if (userLocation) {
      const [lon, lat] = userLocation;
      fetchNearbyReports(lat, lon);
    }
  }, [userLocation, fetchNearbyReports]);

  // Get selected marker
  const selectedMarker = selectedMarkerId 
    ? wasteMarkers.find(m => m.id === selectedMarkerId) 
    : null;

  // Calculate route coordinates
  const routeStart = userLocation;
  
  // Save route end when a marker is selected and route is shown
  useEffect(() => {
    if (selectedMarker && showRoute) {
      setSavedRouteEnd(selectedMarker.coordinates);
    }
  }, [selectedMarker, showRoute]);

  // Use saved route end if available and route is shown, even if marker is deselected
  const routeEnd = showRoute 
    ? (selectedMarker?.coordinates || savedRouteEnd)
    : null;

  // Toggle route display
  const toggleRoute = useCallback(() => {
    setShowRoute(prev => {
      // If turning off the route, clear saved route end
      if (prev) {
        setSavedRouteEnd(null);
      }
      return !prev;
    });
  }, []);

  return {
    // User data
    displayName,
    
    // Location data
    userLocation,
    isRequestingLocation,
    requestLocation,
    
    // Reports data
    wasteMarkers,
    loading,
    error,
    setError,
    
    // Search
    searchQuery,
    setSearchQuery,
    handleSearch,
    
    // Marker selection
    selectedMarkerId,
    showDetails,
    selectedMarker,
    handleMarkerClick,
    handleCloseDetails,

    // Routing
    showRoute,
    routeStart,
    routeEnd,
    toggleRoute,
  };
}
