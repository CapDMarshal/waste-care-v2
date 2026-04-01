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
    wasteMarkers,
    loading,
    error,
    setError,
    searchQuery,
    setSearchQuery,
    handleSearch,
    showDetails,
    selectedMarker,
    handleMarkerClick,
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
          markers={wasteMarkers}
          showDetails={showDetails}
          onMarkerClick={handleMarkerClick}
          onCloseDetails={handleCloseDetails}
          showRoute={showRoute}
          routeStart={routeStart}
          routeEnd={routeEnd}
          isRequestingLocation={isRequestingLocation}
          onRequestLocation={requestLocation}
        />
      </div>

      <DashboardBottomSheet
        showDetails={showDetails}
        userName={displayName}
        searchQuery={searchQuery}
        selectedMarker={selectedMarker}
        onSearchChange={setSearchQuery}
        onSearchClick={handleSearch}
        onClose={handleCloseDetails}
        showRoute={showRoute}
        onToggleRoute={toggleRoute}
      />

      <BottomNavigation />
    </div>
  );
}