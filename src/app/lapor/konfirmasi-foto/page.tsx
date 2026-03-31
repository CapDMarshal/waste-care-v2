'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Toast } from '@/components';
import { useReport } from '@/contexts/ReportContext';
import { usePhotoManagement } from './usePhotoManagement';
import PhotoHeader from './PhotoHeader';
import PhotoGrid from './PhotoGrid';

export default function KonfirmasiFotoPage() {
  const router = useRouter();
  const { reportData, addPhoto, removePhoto } = useReport();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const {
    loading,
    photos,
    fileInputRef,
    handleFileSelect,
    handleAddMorePhotos,
    handleRemovePhoto,
    handleUploadPhoto,
  } = usePhotoManagement({
    existingPhotos: reportData.photos,
    onAddPhoto: addPhoto,
    onRemovePhoto: removePhoto,
  });

  const onUploadClick = () => {
    try {
      handleUploadPhoto();
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : 'Terjadi kesalahan',
        type: 'error',
      });
    }
  };

  const onFileSelectWithError = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      await handleFileSelect(event);
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : 'Gagal memproses gambar. Silakan coba lagi.',
        type: 'error',
      });
    }
  };

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

      <PhotoHeader onBack={handleBack} />

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            Konfirmasi foto sampah
          </h1>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onFileSelectWithError}
            className="hidden"
          />

          <PhotoGrid
            photos={photos}
            onRemovePhoto={handleRemovePhoto}
            onAddMorePhotos={handleAddMorePhotos}
            loading={loading}
          />
        </div>
      </div>

      <div className="p-6">
        <Button
          onClick={onUploadClick}
          loading={loading}
          fullWidth
          className="bg-[#16a34a] hover:bg-[#15803d]"
        >
          Unggah foto
        </Button>
      </div>
    </div>
  );
}