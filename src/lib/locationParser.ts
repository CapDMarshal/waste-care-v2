import { Geometry, Point } from 'wkx';

/**
 * Parse WKT POINT geometry string or WKB binary to coordinates
 * Formats: 
 * - WKT: "POINT(longitude latitude)"
 * - WKB: hex string like "0101000020E6100000..."
 */
export function parseWKTPoint(locationData: string | null): { latitude: number; longitude: number } | null {
  if (!locationData) return null;

  // Try WKT format first (text with POINT)
  const wktMatch = locationData.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
  if (wktMatch) {
    const longitude = parseFloat(wktMatch[1]);
    const latitude = parseFloat(wktMatch[2]);

    if (!isNaN(latitude) && !isNaN(longitude)) {
      return { latitude, longitude };
    }
  }

  // Try WKB format (hex string)
  if (/^[0-9a-fA-F]+$/.test(locationData)) {
    try {
      const buffer = Buffer.from(locationData, 'hex');
      const geometry = Geometry.parse(buffer) as Point;
      
      if (geometry && 'x' in geometry && 'y' in geometry) {
        // WKB POINT format is (longitude, latitude)
        return {
          latitude: geometry.y as number,
          longitude: geometry.x as number
        };
      }
    } catch (error) {
      console.warn('[locationParser] Failed to parse WKB:', error instanceof Error ? error.message : String(error));
    }
  }

  console.warn('[locationParser] Failed to parse WKT/WKB:', locationData);
  return null;
}

/**
 * Generate Google Maps URL for a location
 */
export function getGoogleMapsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

/**
 * Generate OpenStreetMap URL for a location
 */
export function getOpenStreetMapUrl(latitude: number, longitude: number): string {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`;
}
