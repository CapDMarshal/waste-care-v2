import { useState, useCallback, useRef } from 'react';
import { getNearbyReports, type ReportLocation } from '@/lib/nearbyReportsService';

export function useNearbyReports(radiusKm: number = 10) {
  const [reports, setReports] = useState<ReportLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // AbortController untuk cancel request sebelumnya
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchNearbyReports = useCallback(async (
    latitude: number, 
    longitude: number, 
    radius?: number
  ) => {
    // Cancel request sebelumnya jika ada
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Buat AbortController baru
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    
    try {
      const result = await getNearbyReports({
        latitude,
        longitude,
        radiusKm: radius || radiusKm,
        limit: 50,
      });

      // Cek apakah request sudah di-cancel
      if (controller.signal.aborted) {
        return;
      }

      if (result.success && result.data) {
        setReports(result.data.reports);
      } else {
        const errorMsg = result.error || 'Gagal memuat data laporan';
        setError(errorMsg);
        setReports([]);
      }
    } catch (err) {
      // Jangan set error jika request di-cancel
      if (controller.signal.aborted) {
        return;
      }
      setError('Terjadi kesalahan saat memuat data');
      setReports([]);
    } finally {
      // Hanya set loading false jika ini adalah request terakhir
      if (abortControllerRef.current === controller) {
        setLoading(false);
        abortControllerRef.current = null;
      }
    }
  }, [radiusKm]);

  return {
    reports,
    loading,
    error,
    setError,
    fetchNearbyReports,
  };
}
