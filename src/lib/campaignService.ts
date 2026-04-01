import { supabase } from './supabase';

function determineCampaignStatus(startTime: string, endTime: string, dbStatus: string): 'upcoming' | 'ongoing' | 'finished' {
  if (dbStatus === 'finished') return 'finished';
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'ongoing';
  return 'finished';
}

/**
 * Get campaign data (hasCampaign + details) by report IDs in a single query.
 * Used by the Dashboard to show campaign badges on map markers.
 */
export async function getCampaignDataByReportIds(reportIds: number[]): Promise<{
  campaignMap: Map<number, boolean>;
  campaignDetailsMap: Map<number, { id: number; status: string }>;
}> {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('id, report_id, status, start_time, end_time')
      .in('report_id', reportIds);

    if (error) throw error;

    const campaignMap = new Map<number, boolean>();
    const campaignDetailsMap = new Map<number, { id: number; status: string }>();

    // Initialize all to false
    reportIds.forEach(id => campaignMap.set(id, false));

    if (data) {
      data.forEach((campaign: { id: number; report_id: number; status: string; start_time: string; end_time: string }) => {
        campaignMap.set(campaign.report_id, true);
        const actualStatus = determineCampaignStatus(campaign.start_time, campaign.end_time, campaign.status);
        campaignDetailsMap.set(campaign.report_id, { id: campaign.id, status: actualStatus });
      });
    }

    return { campaignMap, campaignDetailsMap };
  } catch {
    return { campaignMap: new Map(), campaignDetailsMap: new Map() };
  }
}

/**
 * Check if a report has an associated campaign
 */
export async function checkReportHasCampaign(reportId: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('id')
      .eq('report_id', reportId)
      .limit(1);
    if (error) throw error;
    return data != null && data.length > 0;
  } catch {
    return false;
  }
}

export function clearCampaignsCache() {
  // Stub for compatibility with old imports
}
