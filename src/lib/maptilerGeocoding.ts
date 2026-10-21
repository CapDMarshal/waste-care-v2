import { config, geocoding } from '@maptiler/sdk';

export interface GeocodingSuggestion {
  id: string;
  placeName: string;
  text: string;
  center: [number, number]; // [longitude, latitude]
}

// Common Sleman & Yogyakarta regions for instant suggestion and offline fallback
const SLEMAN_DISTRICTS: GeocodingSuggestion[] = [
  { id: 'sleman-depok', placeName: 'Kapanewon Depok, Kabupaten Sleman', text: 'Depok', center: [110.3957, -7.7712] },
  { id: 'sleman-mlati', placeName: 'Kapanewon Mlati, Kabupaten Sleman', text: 'Mlati', center: [110.3619, -7.7471] },
  { id: 'sleman-ngaglik', placeName: 'Kapanewon Ngaglik, Kabupaten Sleman', text: 'Ngaglik', center: [110.3976, -7.7131] },
  { id: 'sleman-gamping', placeName: 'Kapanewon Gamping, Kabupaten Sleman', text: 'Gamping', center: [110.3255, -7.7981] },
  { id: 'sleman-kalasan', placeName: 'Kapanewon Kalasan, Kabupaten Sleman', text: 'Kalasan', center: [110.4682, -7.7667] },
  { id: 'sleman-godean', placeName: 'Kapanewon Godean, Kabupaten Sleman', text: 'Godean', center: [110.2948, -7.7683] },
  { id: 'sleman-berbah', placeName: 'Kapanewon Berbah, Kabupaten Sleman', text: 'Berbah', center: [110.4475, -7.8093] },
  { id: 'sleman-pakem', placeName: 'Kapanewon Pakem (Kaliurang), Kabupaten Sleman', text: 'Pakem', center: [110.4206, -7.6657] },
  { id: 'sleman-seyegan', placeName: 'Kapanewon Seyegan, Kabupaten Sleman', text: 'Seyegan', center: [110.3015, -7.7286] },
  { id: 'sleman-prambanan', placeName: 'Kapanewon Prambanan, Kabupaten Sleman', text: 'Prambanan', center: [110.4939, -7.7554] },
  { id: 'sleman-ngemplak', placeName: 'Kapanewon Ngemplak, Kabupaten Sleman', text: 'Ngemplak', center: [110.4418, -7.7126] },
  { id: 'sleman-tempel', placeName: 'Kapanewon Tempel, Kabupaten Sleman', text: 'Tempel', center: [110.3214, -7.6496] },
  { id: 'sleman-turi', placeName: 'Kapanewon Turi, Kabupaten Sleman', text: 'Turi', center: [110.3789, -7.6453] },
  { id: 'sleman-cangkringan', placeName: 'Kapanewon Cangkringan, Kabupaten Sleman', text: 'Cangkringan', center: [110.4578, -7.6433] },
  { id: 'sleman-kota', placeName: 'Kapanewon Sleman, Kabupaten Sleman', text: 'Sleman', center: [110.3541, -7.6908] },
  { id: 'sleman-moyudan', placeName: 'Kapanewon Moyudan, Kabupaten Sleman', text: 'Moyudan', center: [110.2452, -7.7884] },
  { id: 'sleman-minggir', placeName: 'Kapanewon Minggir, Kabupaten Sleman', text: 'Minggir', center: [110.2526, -7.7342] },
];

/**
 * Searches for places/regions in Sleman using MapTiler Geocoding API with local district fallback.
 */
export async function searchSlemanPlaces(query: string): Promise<GeocodingSuggestion[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  // 1. Fast match against known Sleman districts
  const localMatches = SLEMAN_DISTRICTS.filter(
    (d) =>
      d.text.toLowerCase().includes(cleanQuery) ||
      d.placeName.toLowerCase().includes(cleanQuery)
  );

  const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || '';
  if (!apiKey) {
    return localMatches;
  }

  config.apiKey = apiKey;

  try {
    const response = await geocoding.forward(cleanQuery, {
      bbox: [110.15, -7.95, 110.60, -7.50], // DI Yogyakarta / Sleman bounding box
      proximity: [110.3695, -7.7956],        // Sleman center
      country: ['ID'],
      language: ['id'],
      limit: 5,
    });

    const apiFeatures: GeocodingSuggestion[] = (response?.features || []).map((feat: any) => ({
      id: feat.id || feat.text,
      placeName: feat.place_name || feat.text,
      text: feat.text || feat.place_name,
      center: feat.center as [number, number],
    }));

    // Merge API results with local matches, avoiding duplicates by center distance
    const merged = [...localMatches];
    for (const feat of apiFeatures) {
      const exists = merged.some(
        (m) =>
          Math.abs(m.center[0] - feat.center[0]) < 0.005 &&
          Math.abs(m.center[1] - feat.center[1]) < 0.005
      );
      if (!exists) {
        merged.push(feat);
      }
    }

    return merged.slice(0, 6);
  } catch (error) {
    console.warn('[MapTiler Geocoding error, falling back to local list]:', error);
    return localMatches;
  }
}
