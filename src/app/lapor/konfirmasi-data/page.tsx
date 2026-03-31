'use client';

import React from 'react';
import { Button } from '@/components';
import { useReport } from '@/contexts/ReportContext';
import { useConfirmation } from './useConfirmation';
import { getReportDisplayData } from './dataProcessor';
import ConfirmationHeader from './ConfirmationHeader';
import SuccessMessage from './SuccessMessage';
import PhotoPreview from './PhotoPreview';
import ReportDetails from './ReportDetails';

export default function KonfirmasiDataPage() {
  const { reportData, resetReport } = useReport();
  const { handleDone, handleBack } = useConfirmation({ onResetReport: resetReport });
  
  // Process report data for display
  const displayData = getReportDisplayData(reportData);

  return (
    <div className="min-h-screen bg-white">
      <ConfirmationHeader onBack={handleBack} />

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        <div className="space-y-6">
          <SuccessMessage />

          <PhotoPreview photos={displayData.photos} />

          <ReportDetails
            wasteType={displayData.wasteType}
            wasteVolume={displayData.wasteVolume}
            locationCategory={displayData.locationCategory}
            notes={displayData.notes}
          />
        </div>
      </div>

      <div className="p-6">
        <Button
          onClick={handleDone}
          fullWidth
          className="bg-[#16a34a] hover:bg-[#15803d]"
        >
          Selesai
        </Button>
      </div>
    </div>
  );
}