import { useState, useCallback, useMemo, useEffect } from 'react';
import { usePathname } from 'next/navigation';
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
import { searchSlemanPlaces, GeocodingSuggestion } from '@/lib/maptilerGeocoding';
import { WasteMarker } from '.';

export type DashboardFilter = 
  | 'all'
  | 'campaign'
  | 'organik'
  | 'anorganik'
  | 'campuran'
  | 'pinggir_jalan'
  | 'sungai'
  | 'area_publik'
  | 'tanah_kosong';

export type DashboardSort = 'distance' | 'volume' | 'newest';

const VOLUME_RANK: Record<string, number> = {
  lebih_dari_1_truk_besar: 4,
  '1_truk_besar': 3,
  '1_truk_kecil': 2,
  '1_pickup': 1,
};

export function useDashboard() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [radiusKm] = useState(10);
  const [campaignMap, setCampaignMap] = useState<Map<number, boolean>>(new Map());
  const [campaignDetailsMap, setCampaignDetailsMap] = useState<Map<number, { id: number; status: string }>>(new Map());
  const [showRoute, setShowRoute] = useState(false);
  const [savedRouteEnd, setSavedRouteEnd] = useState<[number, number] | null>(null);

  // Filter & Sorting state
  const [activeFilter, setActiveFilter] = useState<DashboardFilter>('all');
  const [sortBy, setSortBy] = useState<DashboardSort>('distance');

  // Geocoding & Map pan state
  const [flyToCoords, setFlyToCoords] = useState<[number, number] | null>(null);
  const [geocodingSuggestions, setGeocodingSuggestions] = useState<GeocodingSuggestion[]>([]);
  const [isSearchingGeocode, setIsSearchingGeocode] = useState(false);
  const [activeRegionName, setActiveRegionName] = useState<string | null>(null);

  // Get display name
  const getDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Warga Sleman';  
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

  // Convert raw reports to markers format
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
        distanceKm: report.distance_km,
        imageUrls: report.image_urls,
        notes: report.notes,
        createdAt: report.created_at,
        hasCampaign: campaignMap.get(report.id) || false,
        campaignId: campaignDetails?.id,
        rawWasteType: report.waste_type,
        rawVolume: report.waste_volume,
        rawCategory: report.location_category,
      };
    });
  }, [reports, campaignMap, campaignDetailsMap]);

  // Debounced geocoding search for regions/places in Sleman
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setGeocodingSuggestions([]);
      setIsSearchingGeocode(false);
      return;
    }

    setIsSearchingGeocode(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchSlemanPlaces(query);
        setGeocodingSuggestions(results);
      } catch (err) {
        console.warn('Geocoding search failed:', err);
      } finally {
        setIsSearchingGeocode(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handler for selecting a geocoded Sleman region / place
  const handleSelectPlace = useCallback((suggestion: GeocodingSuggestion) => {
    setGeocodingSuggestions([]);
    setActiveRegionName(suggestion.text);
    setSearchQuery(suggestion.text);
    setFlyToCoords(suggestion.center);

    // Fetch reports around newly chosen center (lat, lng)
    fetchNearbyReports(suggestion.center[1], suggestion.center[0]);
  }, [fetchNearbyReports]);

  // Reset region filter to current GPS
  const handleResetToMyLocation = useCallback(() => {
    setActiveRegionName(null);
    setSearchQuery('');
    setGeocodingSuggestions([]);
    if (userLocation) {
      setFlyToCoords(userLocation);
      fetchNearbyReports(userLocation[1], userLocation[0]);
    } else {
      requestLocation();
    }
  }, [userLocation, fetchNearbyReports, requestLocation]);

  // Filtered and sorted markers
  const filteredMarkers = useMemo<WasteMarker[]>(() => {
    let result = [...wasteMarkers];

    // 1. Text filter (if user typed keywords matching notes or categories)
    if (searchQuery.trim().length > 0 && !activeRegionName) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((m) =>
        (m.notes && m.notes.toLowerCase().includes(q)) ||
        m.wasteType.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q) ||
        m.amount.toLowerCase().includes(q)
      );
    }

    // 2. Chip filters
    if (activeFilter === 'campaign') {
      result = result.filter((m) => m.hasCampaign);
    } else if (['organik', 'anorganik', 'campuran'].includes(activeFilter)) {
      result = result.filter((m) => m.rawWasteType === activeFilter);
    } else if (['pinggir_jalan', 'sungai', 'area_publik', 'tanah_kosong'].includes(activeFilter)) {
      result = result.filter((m) => m.rawCategory === activeFilter);
    }

    // 3. Sorting
    if (sortBy === 'distance') {
      result.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    } else if (sortBy === 'volume') {
      result.sort((a, b) => {
        const rankA = VOLUME_RANK[a.rawVolume ?? ''] ?? 0;
        const rankB = VOLUME_RANK[b.rawVolume ?? ''] ?? 0;
        return rankB - rankA;
      });
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [wasteMarkers, searchQuery, activeRegionName, activeFilter, sortBy]);

  // Selection handler that also triggers smooth pan / flyTo
  const handleSelectReport = useCallback((markerId: string) => {
    const marker = wasteMarkers.find((m) => m.id === markerId);
    if (marker) {
      setFlyToCoords(marker.coordinates);
    }
    handleMarkerClick(markerId);
  }, [wasteMarkers, handleMarkerClick]);

  useEffect(() => {
    if (pathname === '/dashboard' && userLocation && !activeRegionName) {
      const [lon, lat] = userLocation;
      fetchNearbyReports(lat, lon);
    }
  }, [pathname, userLocation, activeRegionName, fetchNearbyReports]);

  // Get selected marker
  const selectedMarker = selectedMarkerId 
    ? wasteMarkers.find(m => m.id === selectedMarkerId) 
    : null;

  // Calculate route coordinates
  const routeStart = userLocation;
  
  useEffect(() => {
    if (selectedMarker && showRoute) {
      setSavedRouteEnd(selectedMarker.coordinates);
    }
  }, [selectedMarker, showRoute]);

  const routeEnd = showRoute 
    ? (selectedMarker?.coordinates || savedRouteEnd)
    : null;

  const toggleRoute = useCallback(() => {
    setShowRoute(prev => {
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
    flyToCoords,
    setFlyToCoords,
    
    // Reports data
    wasteMarkers,
    filteredMarkers,
    loading,
    error,
    setError,
    
    // Search & Geocoding
    searchQuery,
    setSearchQuery,
    geocodingSuggestions,
    isSearchingGeocode,
    activeRegionName,
    handleSelectPlace,
    handleResetToMyLocation,
    
    // Filters & Sorting
    activeFilter,
    setActiveFilter,
    sortBy,
    setSortBy,

    // Marker selection
    selectedMarkerId,
    showDetails,
    selectedMarker,
    handleSelectReport,
    handleCloseDetails,

    // Routing
    showRoute,
    routeStart,
    routeEnd,
    toggleRoute,
  };
}
