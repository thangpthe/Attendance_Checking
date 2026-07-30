export function calcDistance(
  lat1: number, lng1: number, lat2: number, lng2: number,
): number {
  const R = 6_371_000
  const toRad = (x: number) => (x * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function isWithinRadius(
  officeLat: number, officeLng: number, radius: number,
  userLat: number, userLng: number,
): boolean {
  return calcDistance(officeLat, officeLng, userLat, userLng) <= radius
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Trình duyệt không hỗ trợ GPS'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 10_000,
      enableHighAccuracy: true,
    })
  })
}
