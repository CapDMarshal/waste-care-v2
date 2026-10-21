export interface WasteMarker {
  id: string;
  coordinates: [number, number];
  type: 'waste';
  title: string;
  location: string;
  wasteType: string;
  amount: string;
  category: string;
  distance: string;
  distanceKm?: number;
  imageUrls: string[];
  notes: string | null;
  createdAt: string;
  hasCampaign: boolean;
  campaignId?: number;
  rawWasteType?: string;
  rawVolume?: string;
  rawCategory?: string;
}
