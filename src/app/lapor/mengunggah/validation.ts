import { ReportData } from '@/contexts/ReportContext';

export interface ValidationError {
  type: 'location' | 'photos';
  message: string;
  redirectTo: string;
}

export function validateReportData(reportData: ReportData): ValidationError | null {
  // Validate location data
  if (!reportData.location) {
    return {
      type: 'location',
      message: 'Data lokasi tidak ditemukan. Mohon mulai dari awal.',
      redirectTo: '/lapor',
    };
  }

  // Validate photos
  if (reportData.photos.length === 0) {
    return {
      type: 'photos',
      message: 'Foto tidak ditemukan. Mohon tambahkan foto terlebih dahulu.',
      redirectTo: '/lapor/konfirmasi-foto',
    };
  }

  return null;
}
