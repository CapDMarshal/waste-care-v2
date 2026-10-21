'use client';

import React from 'react';
import { BottomNavigation } from '@/components';
import { useDashboard } from './useDashboard';
import LoadingOverlay from './LoadingOverlay';
import ErrorNotification from './ErrorNotification';
import MapView from './MapView';
import DashboardBottomSheet from './DashboardBottomSheet';

export default function DashboardPage() {
  const {
    displayName,
    userLocation,
    isRequestingLocation,
    requestLocation,
    flyToCoords,
    filteredMarkers,
    loading,
    error,
    setError,
    searchQuery,
    setSearchQuery,
    geocodingSuggestions,
    isSearchingGeocode,
    activeRegionName,
    handleSelectPlace,
    handleResetToMyLocation,
    activeFilter,
    setActiveFilter,
    sortBy,
    setSortBy,
    showDetails,
    selectedMarker,
    handleSelectReport,
    handleCloseDetails,
    showRoute,
    routeStart,
    routeEnd,
    toggleRoute,
  } = useDashboard();

  return (
    <div className="min-h-screen bg-transparent pb-20">
      {loading && <LoadingOverlay />}

      {error && !loading && (
        <ErrorNotification
          message={error} 
          onClose={() => setError(null)} 
        />
      )}

      {/* Map Section */}
      <div className="relative">
        <MapView
          userLocation={userLocation}
          markers={filteredMarkers}
          showDetails={showDetails}
          onMarkerClick={handleSelectReport}
          onCloseDetails={handleCloseDetails}
          showRoute={showRoute}
          routeStart={routeStart}
          routeEnd={routeEnd}
          isRequestingLocation={isRequestingLocation}
          onRequestLocation={requestLocation}
          flyToCoords={flyToCoords}
        />
      </div>

      {/* Interactive Bottom Sheet (Explore List or Report Detail) */}
      <DashboardBottomSheet
        showDetails={showDetails}
        userName={displayName}
        searchQuery={searchQuery}
        selectedMarker={selectedMarker}
        onSearchChange={setSearchQuery}
        onClose={handleCloseDetails}
        showRoute={showRoute}
        onToggleRoute={toggleRoute}
        markers={filteredMarkers}
        loading={loading}
        geocodingSuggestions={geocodingSuggestions}
        isSearchingGeocode={isSearchingGeocode}
        activeRegionName={activeRegionName}
        onSelectPlace={handleSelectPlace}
        onResetToMyLocation={handleResetToMyLocation}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onSelectMarker={handleSelectReport}
      />

      <BottomNavigation />
    </div>
  );
}
