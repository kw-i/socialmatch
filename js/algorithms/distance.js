// ALGORITHM: Haversine formula.
// Distance in kilometers between two latitude/longitude points on a sphere
// (the Earth). Used for "distance away", the "Nearest" sort, and directions.
function haversineKm(lat1, lng1, lat2, lng2) {
  const EARTH_RADIUS_KM = 6371;
  const toRadians = degrees => degrees * Math.PI / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}
