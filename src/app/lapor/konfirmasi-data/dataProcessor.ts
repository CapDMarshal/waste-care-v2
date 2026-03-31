import { ReportData } from '@/contexts/ReportContext';

export interface ProcessedReportData {
  wasteType: string | null;
  wasteVolume: string | null;
  locationCategory: string | null;
  photos: string[];
  notes?: string;
}

export function getReportDisplayData(reportData: ReportData): ProcessedReportData {
  // Get data from AI validation result with fallback to manual input
  const wasteType = reportData.aiValidation?.waste_type || reportData.wasteType;
  const wasteVolume = reportData.aiValidation?.waste_volume || reportData.wasteVolume;
  const locationCategory = reportData.aiValidation?.location_category || reportData.locationCategory;

  return {
    wasteType,
    wasteVolume,
    locationCategory,
    photos: reportData.photos,
    notes: reportData.notes,
  };
}
