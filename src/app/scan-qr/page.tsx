'use client';

import { BottomNavigation } from '@/components';

export default function ScanQrPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="mx-auto w-full max-w-md px-4 pt-6">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <h1 className="text-lg font-semibold text-gray-900">Scan QR Presensi Campaign</h1>
          <p className="mt-2 text-sm text-gray-600">
            Fitur scan QR untuk presensi di lokasi campaign sedang disiapkan.
          </p>
          <div className="mt-5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-700">
            Rencana implementasi: akses kamera, scan kode QR campaign, lalu validasi kehadiran berdasarkan lokasi.
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
