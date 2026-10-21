/**
 * Utility functions and WebGL shader parameters for Spatial Density Heatmap (Fitur 3).
 * Transforms waste reports into weighted GeoJSON FeatureCollections.
 *
 * Algoritma Kerapatan Spasial Terkalibrasi (Jumlah x Bobot Poin):
 * - Titik tunggal (walaupun >1 truk) dibatasi normalisasi [0.25 - 0.55] -> Berwarna Hijau / Kuning.
 * - Zona MERAH (Kritis) tercipta saat ada MULTIPLE TITIK (akumulasi jumlah) yang berdekatan.
 * - Radius diperlebar secara adaptif (35px - 95px) agar sebaran pulau panas menyatu harmonis di seluruh Sleman.
 */

export interface HeatmapPointInput {
  id: number | string;
  latitude: number;
  longitude: number;
  waste_volume?: string | null;
  hazard_risk?: string | null;
  waste_type?: string | null;
  location_category?: string | null;
  status?: string | null;
  notes?: string | null;
}

// Base Volume Points (Skala dasar terkalibrasi)
const BASE_VOLUME_POINTS: Record<string, number> = {
  lebih_dari_1_truk_besar: 0.45,
  '1_truk_besar': 0.35,
  '1_truk_kecil': 0.25,
  '1_pickup': 0.15,
};

// Pengali Bahaya B3 (Pengaruh tambahan proporsional)
const HAZARD_MULTIPLIER: Record<string, number> = {
  tinggi: 1.35,
  menengah: 1.18,
  rendah: 1.0,
  tidak_ada: 1.0,
};

/**
 * Menghitung bobot titik ternormalisasi:
 * Titik tunggal mandiri dibatasi maksimum ~0.55 (tidak bisa merah sendirian).
 * Warna merah hanya muncul saat akumulasi kerapatan kernel (density >= 0.85).
 */
export function calculateReportWeight(
  wasteVolume?: string | null,
  hazardRisk?: string | null
): number {
  const basePoint = BASE_VOLUME_POINTS[wasteVolume ?? ''] ?? 0.15;
  const multiplier = HAZARD_MULTIPLIER[hazardRisk ?? ''] ?? 1.0;
  const calculatedWeight = Math.min(0.58, Math.max(0.15, basePoint * multiplier));
  return Number(calculatedWeight.toFixed(3));
}

/**
 * Mengonversi kumpulan laporan sampah menjadi GeoJSON FeatureCollection
 */
export function reportsToHeatmapGeoJson(
  reports: HeatmapPointInput[]
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  const features: GeoJSON.Feature<GeoJSON.Point>[] = reports.map((r) => {
    const weight = calculateReportWeight(r.waste_volume, r.hazard_risk);

    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [r.longitude, r.latitude],
      },
      properties: {
        id: r.id,
        weight: weight,
        waste_volume: r.waste_volume || '1_pickup',
        hazard_risk: r.hazard_risk || 'tidak_ada',
        waste_type: r.waste_type || 'campuran',
        location_category: r.location_category || 'lainnya',
        notes: r.notes || '',
      },
    };
  });

  return {
    type: 'FeatureCollection',
    features,
  };
}

/**
 * Konfigurasi WebGL Paint Shader MapTiler / MapLibre:
 * - Radius diperlebar adaptif (35px - 95px) agar sebaran titik menyatu halus & seimbang di seluruh 17 Kapanewon.
 * - Spektrum warna dikalibrasi agar transisi Hijau -> Kuning -> Oranye -> Merah tampak luas dan seimbang.
 */
export const HEATMAP_LAYER_PAINT: Record<string, any> = {
  // Bobot dinamis terkalibrasi per titik
  'heatmap-weight': ['get', 'weight'],

  // Intensitas akumulasi densitas terhadap tingkat perbesaran peta (Zoom)
  'heatmap-intensity': [
    'interpolate',
    ['linear'],
    ['zoom'],
    9, 1.2,
    11, 1.8,
    13, 2.6,
    15, 3.5,
  ],

  // Spektrum Gradasi Panas Berkelanjutan:
  // Titik tunggal (0.1 - 0.45) = Biru/Hijau
  // 2-3 titik berdekatan (0.5 - 0.75) = Kuning/Oranye
  // Kluster padat multi-titik (>= 0.85) = Merah Tua (Hotspot Kritis)
  'heatmap-color': [
    'interpolate',
    ['linear'],
    ['heatmap-density'],
    0.0, 'rgba(0, 0, 0, 0)',
    0.15, 'rgba(59, 130, 246, 0.65)', // Biru muda transparan
    0.35, 'rgb(34, 197, 94)',          // Hijau segar (titik tunggal sedang)
    0.55, 'rgb(234, 179, 8)',          // Kuning cerah (titik besar terisolasi / 2 titik)
    0.75, 'rgb(249, 115, 22)',         // Oranye hangat (kepadatan tinggi)
    0.88, 'rgb(239, 68, 68)',          // Merah kuat (kluster banyak titik)
    1.0, 'rgb(185, 28, 28)',           // Merah pekat tua (hotspot darurat)
  ],

  // Radius diperlebar secara signifikan agar spektrum panas menyebar luas dan bersambung
  'heatmap-radius': [
    'interpolate',
    ['linear'],
    ['zoom'],
    9, 35,
    11, 55,
    13, 75,
    15, 95,
  ],

  // Opacity dioptimalkan agar warna cerah sekaligus kontur peta satelit tetap terlihat
  'heatmap-opacity': 0.88,
};
