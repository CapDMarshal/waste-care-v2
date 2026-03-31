'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components';

interface PhotoCaptureProps {
  onPhotoCapture: (file: File) => void;
  onError?: (error: string) => void;
  maxSizeInMB?: number;
  acceptedFormats?: string[];
}

export function PhotoCapture({ 
  onPhotoCapture, 
  onError,
  maxSizeInMB = 10,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
}: PhotoCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      return `Format file tidak didukung. Gunakan format: ${acceptedFormats.map(f => f.split('/')[1]).join(', ')}`;
    }

    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return `Ukuran file terlalu besar. Maksimal ${maxSizeInMB}MB`;
    }

    return null;
  }, [acceptedFormats, maxSizeInMB]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      onError?.(validationError);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setFileName(file.name);
      onPhotoCapture(file);
    };
    reader.onerror = () => {
      onError?.('Gagal membaca file');
    };
    reader.readAsDataURL(file);
  }, [validateFile, onPhotoCapture, onError]);

  const handleCapture = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleRetake = useCallback(() => {
    setPreview(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {preview ? (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-auto max-h-[400px] object-contain bg-gray-100"
            />
          </div>

          {/* File info */}
          {fileName && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 truncate">
                <span className="font-semibold">File: </span>
                {fileName}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleRetake}
              className="flex-1 bg-gray-500 hover:bg-gray-600"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Ambil Ulang
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Placeholder */}
          <div className="relative rounded-lg overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 h-[300px] flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm text-gray-600 mb-1">Belum ada foto</p>
              <p className="text-xs text-gray-500">Ambil foto untuk melanjutkan</p>
            </div>
          </div>

          {/* Capture button */}
          <Button
            onClick={handleCapture}
            fullWidth
            className="bg-blue-600 hover:bg-blue-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Ambil Foto / Pilih dari Galeri
          </Button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              💡 <span className="font-semibold">Tips:</span> Anda bisa mengambil foto langsung menggunakan kamera 
              atau memilih foto dari galeri. Browser akan meminta izin kamera saat pertama kali digunakan.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
