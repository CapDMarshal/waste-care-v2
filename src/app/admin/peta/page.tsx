import { requireAdmin } from '@/lib/adminGuard';
import { getAllReportsAdmin } from '@/lib/adminService';
import { parseWKTPoint } from '@/lib/locationParser';
import AdminHeatmapView from './AdminHeatmapView';
import type { HeatmapPointInput } from '@/lib/spatialHeatmap';

export const revalidate = 0;

export default async function AdminPetaPage() {
  await requireAdmin();

  // Fetch all reports from database (excluding rejected)
  const rawReports = await getAllReportsAdmin();

  const realPoints: HeatmapPointInput[] = [];

  for (const r of rawReports) {
    if (r.status === 'rejected') continue;

    const coords = parseWKTPoint(r.location as string);
    if (!coords) continue;

    realPoints.push({
      id: r.id,
      latitude: coords.latitude,
      longitude: coords.longitude,
      waste_volume: r.waste_volume,
      hazard_risk: r.hazard_risk,
      waste_type: r.waste_type,
      location_category: r.location_category,
      status: r.status,
      notes: r.notes,
    });
  }

  return <AdminHeatmapView initialRealPoints={realPoints} />;
}
