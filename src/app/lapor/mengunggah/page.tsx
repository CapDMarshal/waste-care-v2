'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useReport } from '@/contexts/ReportContext';
import { Toast } from '@/components';
import { validateReportData } from './validation';
import { useUpload } from './useUpload';
import UploadHeader from './UploadHeader';
import ErrorState from './ErrorState';
import UploadingState from './UploadingState';

export default function MengunggahPage() {
  const router = useRouter();
  const { reportData, setAiValidation } = useReport();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const { progress, uploading, error, handleUpload, handleRetry } = useUpload({
    reportData,
    setAiValidation,
  });

  useEffect(() => {
    // Validate required data before starting upload
    const validationError = validateReportData(reportData);
    if (validationError) {
      setToast({
        message: validationError.message,
        type: 'error'
      });
      setTimeout(() => {
        router.push(validationError.redirectTo);
      }, 2000);
      return;
    }

    // If all data is available, start upload
    handleUpload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBack = () => {
    router.back();
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
      
      <UploadHeader onBack={handleBack} />

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        {error ? (
          <ErrorState
            error={error}
            onRetry={handleRetry}
            onBack={handleBack}
          />
        ) : (
          <UploadingState 
            uploading={uploading}
            progress={progress}
          />
        )}
      </div>
    </div>
  );
}