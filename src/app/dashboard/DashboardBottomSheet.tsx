'use client';

import React from 'react';
import { BottomSheet } from '@/components';
import type { WasteMarker } from '.';
import type { DashboardFilter, DashboardSort } from './useDashboard';
import type { GeocodingSuggestion } from '@/lib/maptilerGeocoding';
import { useRouter } from 'next/navigation';
import NearbyReportsList from './NearbyReportsList';

interface DashboardBottomSheetProps {
  showDetails: boolean;
  userName: string;
  searchQuery: string;
  selectedMarker: WasteMarker | null | undefined;
  onSearchChange: (query: string) => void;
  onClose: () => void;
  showRoute?: boolean;
  onToggleRoute?: () => void;
  markers: WasteMarker[];
  loading?: boolean;
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
}

export default function DashboardBottomSheet({
  showDetails,
  userName,
  searchQuery,
  selectedMarker,
  onSearchChange,
  onClose,
  showRoute = false,
  onToggleRoute,
  markers,
  loading = false,
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
}: DashboardBottomSheetProps) {
  const router = useRouter();

  const handleOpenCampaign = () => {
    if (!selectedMarker?.campaignId) return;
    router.push(`/campaign?campaignId=${selectedMarker.campaignId}`);
  };

  const handleRevalidateClick = () => {
    if (!selectedMarker) return;
    
    const params = new URLSearchParams({
      reportId: selectedMarker.id.toString(),
      lat: selectedMarker.coordinates[1].toString(),
      lng: selectedMarker.coordinates[0].toString(),
    });
    
    router.push(`/revalidasi?${params.toString()}`);
  };

  const handleCreateCampaignClick = () => {
    if (!selectedMarker) return;
    
    const params = new URLSearchParams({
      reportId: selectedMarker.id.toString(),
      lat: selectedMarker.coordinates[1].toString(),
      lng: selectedMarker.coordinates[0].toString(),
    });
    
    router.push(`/buat-campaign?${params.toString()}`);
  };

  return (
    <BottomSheet
      isOpen={true}
      onClose={onClose}
      showWelcome={!showDetails}
      userName={userName}
      title={selectedMarker ? `${selectedMarker.title} • ${selectedMarker.distance}` : ''}
      description={selectedMarker?.notes || (selectedMarker ? `Lokasi: ${selectedMarker.location}` : 'Detail laporan sampah pada titik ini')}
      images={selectedMarker?.imageUrls && selectedMarker.imageUrls.length > 0 ? selectedMarker.imageUrls : ['/images/template-image.png']}
      wasteType={selectedMarker?.wasteType || ''}
      amount={selectedMarker?.amount || ''}
      category={selectedMarker?.category || ''}
      reportId={selectedMarker?.id}
      reportLocation={selectedMarker ? [
        selectedMarker.coordinates[0],
        selectedMarker.coordinates[1]
      ] : undefined}
      hasCampaign={selectedMarker?.hasCampaign || false}
      campaignId={selectedMarker?.campaignId}
      onRevalidateClick={handleRevalidateClick}
      onCreateCampaignClick={handleCreateCampaignClick}
      onOpenCampaignClick={handleOpenCampaign}
      showRouteButton={showDetails && !!selectedMarker}
      showRoute={showRoute}
      onToggleRoute={onToggleRoute}
    >
      <NearbyReportsList
        userName={userName}
        markers={markers}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        geocodingSuggestions={geocodingSuggestions}
        isSearchingGeocode={isSearchingGeocode}
        activeRegionName={activeRegionName}
        onSelectPlace={onSelectPlace}
        onResetToMyLocation={onResetToMyLocation}
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
        sortBy={sortBy}
        onSortChange={onSortChange}
        onSelectMarker={onSelectMarker}
        selectedMarkerId={selectedMarker?.id}
      />
    </BottomSheet>
  );
}
