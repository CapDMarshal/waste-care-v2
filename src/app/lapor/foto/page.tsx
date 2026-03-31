'use client';

import React from 'react';
import { Button } from '@/components';
import { usePhotoNavigation } from './usePhotoNavigation';
import PhotoStepHeader from './PhotoStepHeader';
import PhotoInstructions from './PhotoInstructions';

export default function LaporFotoPage() {
  const { loading, handleAddPhoto, handleBack } = usePhotoNavigation();

  return (
    <div className="min-h-screen bg-white">
      <PhotoStepHeader onBack={handleBack} />

      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <PhotoInstructions />
      </div>

      <div className="p-6">
        <Button
          onClick={handleAddPhoto}
          loading={loading}
          fullWidth
          className="bg-[#16a34a] hover:bg-[#15803d]"
        >
          Tambahkan
        </Button>
      </div>
    </div>
  );
}