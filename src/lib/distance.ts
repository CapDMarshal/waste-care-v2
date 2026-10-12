/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula (WGS-84 sphere approximation).
 * @returns Distance in meters
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Checks if a point is within a specified radius (in meters) from a target point.
 */
export function isWithinRadius(
  userLat: number,
  userLng: number,
  targetLat: number,
  targetLng: number,
  maxMeters = 50
): boolean {
  const distance = calculateHaversineDistance(userLat, userLng, targetLat, targetLng);
  return distance <= maxMeters;
}

/**
 * Formats distance in meters into human-readable text.
 * Example: 24.5 m or 1.2 km
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters * 10) / 10} meter`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}
