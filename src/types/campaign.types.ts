export interface Campaign {
  id: string;
  title: string;
  description: string;
  location: {
    name: string;
    coordinates?: [number, number];
  };
  date: string;
  time: string;
  participants: number;
  maxParticipants: number;
  status: 'upcoming' | 'ongoing' | 'finished';
  imageUrl: string;
  organizer: string;
  wasteTypes: string[];
  estimatedVolume?: string;
  reportIds?: number[];
  isJoined?: boolean; // Apakah user sudah join campaign ini
}

export interface CampaignFilters {
  status?: 'upcoming' | 'ongoing' | 'finished';
  radius?: number;
  wasteType?: string;
}

// Database types
export interface CampaignRow {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  created_at: string;
  status: 'upcoming' | 'ongoing' | 'finished';
  report_id: number;
  organizer_name: string;
  organizer_type: 'personal' | 'organization';
}

export interface CampaignWithParticipants extends CampaignRow {
  participant_count: number;
  user_joined: boolean;
  report?: {
    id: number;
    image_urls: string[];
    waste_type: string;
    waste_volume: string;
    location_category: string;
    latitude: number;
    longitude: number;
  };
}
