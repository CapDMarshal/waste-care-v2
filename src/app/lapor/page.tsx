'use client';

import React, { useState } from 'react';
import { Button, BottomNavigation, Toast, PermissionGuard } from '@/components';
import { useReport } from '@/contexts/ReportContext';
import { useLocation } from './useLocation';
import { useGeolocationPermission } from '@/hooks/usePermission';
import LocationHeader from './LocationHeader';
import LocationInfo from './LocationInfo';

export default function LaporGPSPage() {
  const { setLocation, reportData } = useReport();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const { permissionState, recheckPermission } = useGeolocationPermission();

  const {
    loading,
    locationEnabled,
    locationError,
    handleGetLocation,
    handleConfirm,
    handleBack,
  } = useLocation({
    currentLocation: reportData.location,
    onSetLocation: setLocation,
  });

  const onConfirmClick = () => {
    try {
      handleConfirm();
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : 'Terjadi kesalahan',
        type: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <LocationHeader onBack={handleBack} />

      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <PermissionGuard 
          type="location" 
          permissionState={permissionState}
          onRetry={recheckPermission}
        >
          <LocationInfo
            locationEnabled={locationEnabled}
            locationError={locationError}
            latitude={reportData.location?.latitude}
            longitude={reportData.location?.longitude}
            onActionClick={handleGetLocation}
          />
        </PermissionGuard>
      </div>

      <div className="p-6">
        <Button
          onClick={onConfirmClick}
          loading={loading}
          fullWidth
          className="bg-[#16a34a] hover:bg-[#15803d]"
        >
          Konfirmasi
        </Button>
      </div>
      <BottomNavigation />
    </div>
  );
}