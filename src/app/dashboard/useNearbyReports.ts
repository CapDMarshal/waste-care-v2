import { useState, useCallback, useRef, useEffect } from 'react';
import { getNearbyReports, type ReportLocation } from '@/lib/nearbyReportsService';

const DASHBOARD_DEBUG = true;

function dashboardLog(event: string, payload?: unknown) {
  if (!DASHBOARD_DEBUG) return;
  if (payload !== undefined) {
    console.log(`[dashboard] ${event}`, payload);
    return;
  }
  console.log(`[dashboard] ${event}`);
}

export function useNearbyReports(radiusKm: number = 10) {
  const [reports, setReports] = useState<ReportLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // AbortController untuk cancel request sebelumnya
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const fetchNearbyReports = useCallback(async (
    latitude: number, 
    longitude: number, 
    radius?: number
  ) => {
    const requestId = ++requestIdRef.current;
    dashboardLog('fetch:start', { requestId, latitude, longitude, radius: radius || radiusKm });

    // Cancel request sebelumnya jika ada
    if (abortControllerRef.current) {
      dashboardLog('fetch:abort-previous', { requestId });
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
        dashboardLog('fetch:aborted', { requestId });
        return;
      }

      if (result.success && result.data) {
        dashboardLog('fetch:success', { requestId, count: result.data.reports.length });
        setReports(result.data.reports);
      } else {
        const errorMsg = result.error || 'Gagal memuat data laporan';
        dashboardLog('fetch:failed', { requestId, errorMsg });
        setError(errorMsg);
        setReports([]);
      }
    } catch (err) {
      // Jangan set error jika request di-cancel
      if (controller.signal.aborted) {
        dashboardLog('fetch:catch-aborted', { requestId });
        return;
      }
      dashboardLog('fetch:catch-error', { requestId, error: err });
      setError('Terjadi kesalahan saat memuat data');
      setReports([]);
    } finally {
      // Hanya set loading false jika ini adalah request terakhir
      if (abortControllerRef.current === controller) {
        dashboardLog('fetch:loading:false', { requestId });
        setLoading(false);
        abortControllerRef.current = null;
      }
    }
  }, [radiusKm]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      setLoading(false);
    };
  }, []);

  return {
    reports,
    loading,
    error,
    setError,
    fetchNearbyReports,
  };
}
