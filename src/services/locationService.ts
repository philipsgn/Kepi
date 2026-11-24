import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const STORAGE_KEY_LOCATION_PIN = 'vi_locket_location_pin_enabled';
export const STORAGE_KEY_LAST_KNOWN_GPS = 'vi_locket_last_known_gps';

export interface GeoCoords {
  lat: number;
  lng: number;
}

const DEFAULT_VN_COORDS: GeoCoords = {
  lat: 10.7769,
  lng: 106.7009,
};

let cachedPinEnabled: boolean | null = null;
let lastKnownMemoryCoords: GeoCoords | null = null;

function loadExpoLocation(): any | null {
  try {
    if (Platform.OS === 'web') return null;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('expo-location');
  } catch (_e) {
    return null;
  }
}

function isValidVietnamOrWorldCoord(lat: unknown, lng: unknown): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

async function saveLastKnownCoordsToStorage(coords: GeoCoords): Promise<void> {
  lastKnownMemoryCoords = coords;
  try {
    await AsyncStorage.setItem(STORAGE_KEY_LAST_KNOWN_GPS, JSON.stringify(coords));
  } catch (_e) {
    // ignore storage write error
  }
}

async function loadLastKnownCoordsFromStorage(): Promise<GeoCoords | null> {
  if (lastKnownMemoryCoords) return lastKnownMemoryCoords;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_LAST_KNOWN_GPS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isValidVietnamOrWorldCoord(parsed?.lat, parsed?.lng)) {
        lastKnownMemoryCoords = {
          lat: Number(parsed.lat),
          lng: Number(parsed.lng),
        };
        return lastKnownMemoryCoords;
      }
    }
  } catch (_e) {
    // ignore storage read error
  }
  return null;
}

/**
 * Trả về tức thì (0ms) tọa độ GPS đã được pre-warm trong RAM (hoặc tâm mặc định nếu đang khóa vệ tinh)
 * để giao dịch Lưu ảnh ở Tab Camera có ngay ghim trên Bản đồ mà không chờ I/O.
 */
export function getCachedLocationSync(): GeoCoords {
  return lastKnownMemoryCoords || DEFAULT_VN_COORDS;
}

/**
 * Đọc trạng thái công tắc Opt-in "Ghim vị trí chi tiêu" (Mặc định: true, lưu trên máy).
 */
export async function getLocationPinEnabled(): Promise<boolean> {
  if (cachedPinEnabled !== null) return cachedPinEnabled;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_LOCATION_PIN);
    if (raw === null) {
      cachedPinEnabled = true;
      return true;
    }
    cachedPinEnabled = raw === 'true';
    return cachedPinEnabled;
  } catch (_e) {
    return true;
  }
}

/**
 * Cập nhật công tắc Opt-in "Ghim vị trí chi tiêu" trong Cài đặt hoặc Bản đồ.
 */
export async function setLocationPinEnabled(enabled: boolean): Promise<void> {
  cachedPinEnabled = enabled;
  try {
    await AsyncStorage.setItem(STORAGE_KEY_LOCATION_PIN, enabled ? 'true' : 'false');
  } catch (_e) {
    // ignore storage write failure
  }
}

/**
 * Lấy tọa độ GPS foreground 1 lần an toàn (dùng cho nút 🎯 trên Bản đồ hoặc gắn vị trí khi Lưu ảnh).
 * Tuyệt đối không theo dõi nền (Zero Background Tracking).
 */
export async function getCurrentPositionSafeAsync(timeoutMs = 6000): Promise<GeoCoords | null> {
  await loadLastKnownCoordsFromStorage();

  const ExpoLocation = loadExpoLocation();
  if (ExpoLocation) {
    try {
      const currentPerm = await ExpoLocation.getForegroundPermissionsAsync();
      let granted = currentPerm?.status === 'granted';
      if (!granted && currentPerm?.canAskAgain !== false) {
        const req = await ExpoLocation.requestForegroundPermissionsAsync();
        granted = req?.status === 'granted';
      }
      if (!granted) {
        return lastKnownMemoryCoords;
      }

      // 1. Thử lấy vị trí gần nhất đã cache trong OS (< 50ms)
      try {
        const last = await ExpoLocation.getLastKnownPositionAsync({
          maxAge: 600000,
          requiredAccuracy: 800,
        });
        if (last?.coords && isValidVietnamOrWorldCoord(last.coords.latitude, last.coords.longitude)) {
          const cached = {
            lat: Number(last.coords.latitude.toFixed(6)),
            lng: Number(last.coords.longitude.toFixed(6)),
          };
          await saveLastKnownCoordsToStorage(cached);
        }
      } catch (_e) {
        // continue to fresh fix
      }

      // 2. Lấy vị trí Balanced mới tại thời điểm nhấn với timeout chống treo UI
      const posPromise = ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy?.Balanced ?? 3,
      });
      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), timeoutMs)
      );
      const pos: any = await Promise.race([posPromise, timeoutPromise]);
      if (pos?.coords && isValidVietnamOrWorldCoord(pos.coords.latitude, pos.coords.longitude)) {
        const coords = {
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        };
        await saveLastKnownCoordsToStorage(coords);
        return coords;
      }
      return lastKnownMemoryCoords;
    } catch (_e) {
      return lastKnownMemoryCoords;
    }
  }

  // Fallback cho Web / môi trường không có native module
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    return new Promise<GeoCoords | null>((resolve) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          resolve(lastKnownMemoryCoords);
        }
      }, timeoutMs);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          if (isValidVietnamOrWorldCoord(pos.coords.latitude, pos.coords.longitude)) {
            const coords = {
              lat: Number(pos.coords.latitude.toFixed(6)),
              lng: Number(pos.coords.longitude.toFixed(6)),
            };
            saveLastKnownCoordsToStorage(coords).catch(() => {});
            resolve(coords);
          } else {
            resolve(lastKnownMemoryCoords);
          }
        },
        () => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve(lastKnownMemoryCoords);
        },
        { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 300000 }
      );
    });
  }

  return lastKnownMemoryCoords;
}

/**
 * Làm nóng GPS ngay khi người dùng mở Tab Camera để khi bấm [ ✓ Lưu ảnh ] luôn có sẵn tọa độ 0ms.
 */
export async function prewarmLocationAsync(): Promise<GeoCoords> {
  await loadLastKnownCoordsFromStorage();
  const enabled = await getLocationPinEnabled();
  if (!enabled) {
    return lastKnownMemoryCoords || DEFAULT_VN_COORDS;
  }
  const fresh = await getCurrentPositionSafeAsync(6000);
  return fresh || lastKnownMemoryCoords || DEFAULT_VN_COORDS;
}

/**
 * Lấy tọa độ GPS khi lưu khoản chi (nếu người dùng đã bật công tắc Opt-in).
 * Luôn trả về tọa độ hợp lệ (ưu tiên GPS trực tiếp tại điểm nhấn lưu -> LastKnown -> Default VN)
 * để đảm bảo 100% ảnh chụp ở Tab Camera đều xuất hiện ghim trên Bản đồ chi tiêu.
 */
export async function getQuickPinCoordsIfOptedIn(timeoutMs = 8000): Promise<GeoCoords | null> {
  const enabled = await getLocationPinEnabled();
  if (!enabled) return null;

  await loadLastKnownCoordsFromStorage();
  const fresh = await getCurrentPositionSafeAsync(timeoutMs);
  return fresh || lastKnownMemoryCoords || DEFAULT_VN_COORDS;
}

export interface PlaceAddressResult {
  fullAddress: string;
  shortPlaceName: string;
  district: string;
  city: string;
}

/**
 * Reverse Geocoding miễn phí từ Geocoder tích hợp sẵn của iOS và Android (0$ chi phí, 0 API key).
 * Tự động chuyển đổi tọa độ GPS thành Tên Đường, Phường, Quận, Thành phố cho Hộ Chiếu Quán Quen (Quyết định 184).
 */
export async function reverseGeocodePlaceAsync(lat: number, lng: number): Promise<PlaceAddressResult> {
  const ExpoLocation = loadExpoLocation();
  if (ExpoLocation && typeof ExpoLocation.reverseGeocodeAsync === 'function') {
    try {
      const results = await ExpoLocation.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (Array.isArray(results) && results.length > 0) {
        const item = results[0];
        const street = item.street || item.name || '';
        let district = item.district || item.subregion || '';
        const city = item.city || item.region || 'Việt Nam';

        // Tinh chỉnh tên quận nếu rỗng hoặc chung chung
        if (!district || district.toLowerCase().includes('việt nam')) {
          const combo = `${street} ${city}`.toLowerCase();
          const match = combo.match(
            /(quận\s*\d+|quận\s*[a-zđà-ỹ]+|bình thạnh|phú nhuận|gò vấp|tân bình|tân phú|thủ đức|bình tân|nhà bè|hóc môn|củ chi|cần giờ|hoàn kiếm|đống đa|ba đình|hai bà trưng|cầu giấy|tây hồ|thanh xuân|hải châu|sơn trà)/i
          );
          if (match) {
            district = match[0].charAt(0).toUpperCase() + match[0].slice(1);
          } else if (lat > 10.7 && lat < 10.9 && lng > 106.6 && lng < 106.8) {
            district = 'Quận 1';
          }
        }

        const shortParts = [street, district].filter(Boolean);
        const fullParts = [street, district, city].filter(Boolean);

        return {
          fullAddress: fullParts.join(', ') || 'Việt Nam',
          shortPlaceName: shortParts.join(', ') || district || city || 'Địa điểm check-in',
          district: district || 'Quận 1',
          city: city || 'Việt Nam',
        };
      }
    } catch (_e) {
      // ignore geocode error
    }
  }

  // Fallback thông minh dựa trên tọa độ trung tâm TP.HCM
  let fallbackDistrict = 'Quận 1';
  if (lat > 10.78 && lat < 10.82 && lng > 106.7) fallbackDistrict = 'Bình Thạnh';
  else if (lat > 10.77 && lat < 10.79 && lng < 106.69) fallbackDistrict = 'Quận 3';
  else if (lat > 10.79 && lng < 106.69) fallbackDistrict = 'Phú Nhuận';

  return {
    fullAddress: `${fallbackDistrict}, TP. Hồ Chí Minh`,
    shortPlaceName: `Địa điểm ${fallbackDistrict}`,
    district: fallbackDistrict,
    city: 'TP. Hồ Chí Minh',
  };
}
