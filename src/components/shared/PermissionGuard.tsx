'use client';

import React from 'react';
import { Button } from '@/components';

interface PermissionGuardProps {
  type: 'location' | 'camera';
  permissionState: 'granted' | 'denied' | 'prompt' | 'unsupported';
  onRetry?: () => void;
  children?: React.ReactNode;
}

export function PermissionGuard({ type, permissionState, onRetry, children }: PermissionGuardProps) {
  const getBrowserInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return {
        browser: 'Chrome',
        steps: [
          'Klik ikon gembok/info di sebelah kiri URL',
          `Cari pengaturan "${type === 'location' ? 'Lokasi' : 'Kamera'}"`,
          'Ubah dari "Blokir" menjadi "Izinkan"',
          'Muat ulang halaman',
        ],
      };
    } else if (userAgent.includes('firefox')) {
      return {
        browser: 'Firefox',
        steps: [
          'Klik ikon gembok di sebelah kiri URL',
          `Klik panah di samping "${type === 'location' ? 'Lokasi' : 'Kamera'}"`,
          'Pilih "Izinkan"',
          'Muat ulang halaman',
        ],
      };
    } else if (userAgent.includes('safari')) {
      return {
        browser: 'Safari',
        steps: [
          'Buka Safari > Preferences > Websites',
          `Klik "${type === 'location' ? 'Location' : 'Camera'}" di sidebar`,
          'Pilih "Allow" untuk website ini',
          'Muat ulang halaman',
        ],
      };
    } else if (userAgent.includes('edg')) {
      return {
        browser: 'Edge',
        steps: [
          'Klik ikon gembok di sebelah kiri URL',
          `Cari pengaturan "${type === 'location' ? 'Lokasi' : 'Kamera'}"`,
          'Ubah menjadi "Izinkan"',
          'Muat ulang halaman',
        ],
      };
    }
    
    return {
      browser: 'Browser Anda',
      steps: [
        'Cari ikon pengaturan atau gembok di address bar',
        `Cari izin untuk "${type === 'location' ? 'Lokasi' : 'Kamera'}"`,
        'Ubah status menjadi "Izinkan"',
        'Muat ulang halaman',
      ],
    };
  };

  const instructions = getBrowserInstructions();

  if (permissionState === 'granted') {
    return <>{children}</>;
  }

  if (permissionState === 'unsupported') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-yellow-800 mb-1">
              Browser Tidak Mendukung
            </h3>
            <p className="text-xs text-yellow-700">
              Browser Anda tidak mendukung fitur {type === 'location' ? 'lokasi' : 'kamera'}. 
              Silakan gunakan browser modern seperti Chrome, Firefox, atau Safari.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (permissionState === 'denied') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start mb-4">
          <svg className="w-6 h-6 text-red-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h3 className="text-base font-bold text-red-800 mb-2">
              Izin {type === 'location' ? 'Lokasi' : 'Kamera'} Diblokir
            </h3>
            <p className="text-sm text-red-700 mb-3">
              Anda telah memblokir akses {type === 'location' ? 'lokasi' : 'kamera'}. 
              Untuk menggunakan fitur ini, ikuti langkah berikut:
            </p>
            
            <div className="bg-white rounded-md p-3 mb-3">
              <p className="text-xs font-semibold text-gray-700 mb-2">
                Cara Mengaktifkan di {instructions.browser}:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-xs text-gray-600">
                {instructions.steps.map((step, index) => (
                  <li key={index} className="ml-1">{step}</li>
                ))}
              </ol>
            </div>

            {onRetry && (
              <Button
                onClick={onRetry}
                className="w-full bg-red-600 hover:bg-red-700"
                size="sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Coba Lagi Setelah Mengaktifkan
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
