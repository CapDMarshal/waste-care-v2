'use client';

import React, { useState } from 'react';
import { Button } from '@/components';
import { useReport } from '@/contexts/ReportContext';
import { useConfirmation } from './useConfirmation';
import { getReportDisplayData } from './dataProcessor';
import ConfirmationHeader from './ConfirmationHeader';
import SuccessMessage from './SuccessMessage';
import PhotoPreview from './PhotoPreview';
import ReportDetails from './ReportDetails';
import { useRouter } from 'next/navigation';

export default function KonfirmasiDataPage() {
  const router = useRouter();
  const { reportData, resetReport, setNotes } = useReport();
  const { handleDone, handleBack } = useConfirmation({ onResetReport: resetReport });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Process report data for display
  const displayData = getReportDisplayData(reportData);

  const handleSaveAndDone = async () => {
    if (!reportData.reportId) {
      handleDone();
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const response = await fetch(`/api/reports/${reportData.reportId}/notes`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: reportData.notes || '' }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || 'Gagal menyimpan catatan laporan');
      }

      resetReport();
      router.push('/dashboard');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Gagal menyimpan catatan laporan');
    } finally {
      setSaving(false);
    }
  };

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
            hazardRisk={displayData.hazardRisk}
            notes={displayData.notes}
            onNotesChange={setNotes}
          />

          {saveError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {saveError}
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <Button
          onClick={handleSaveAndDone}
          fullWidth
          className="bg-[#16a34a] hover:bg-[#15803d]"
          disabled={saving}
        >
          {saving ? 'Menyimpan...' : 'Selesai'}
        </Button>
      </div>
    </div>
  );
}