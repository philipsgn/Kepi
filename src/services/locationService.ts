import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const STORAGE_KEY_LOCATION_PIN = 'vi_locket_location_pin_enabled';
export const STORAGE_KEY_LAST_KNOWN_GPS = 'vi_locket_last_known_gps';

export interface GeoCoords {
  lat: number;
  lng: number;
}

export interface LocationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}

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

export function isValidVietnamOrWorldCoord(lat: unknown, lng: unknown): boolean {
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
 * Kiểm tra trạng thái quyền Vị trí (Foreground Location) hiện tại từ OS (Production-grade).
 */
export async function getLocationPermissionStatusAsync(): Promise<LocationPermissionStatus> {
  const ExpoLocation = loadExpoLocation();
  if (ExpoLocation && typeof ExpoLocation.getForegroundPermissionsAsync === 'function') {
    try {
      const res = await ExpoLocation.getForegroundPermissionsAsync();
      return {
        granted: res?.status === 'granted',
        canAskAgain: res?.canAskAgain !== false,
        status: res?.status || 'undetermined',
      };
    } catch (_e) {
      return { granted: false, canAskAgain: true, status: 'undetermined' };
    }
  }
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    return { granted: true, canAskAgain: true, status: 'granted' };
  }
  return { granted: false, canAskAgain: true, status: 'undetermined' };
}

/**
 * Yêu cầu người dùng cấp quyền Vị trí (Foreground Location) từ OS dialog.
 */
export async function requestLocationPermissionAsync(): Promise<LocationPermissionStatus> {
  const ExpoLocation = loadExpoLocation();
  if (ExpoLocation && typeof ExpoLocation.requestForegroundPermissionsAsync === 'function') {
    try {
      const res = await ExpoLocation.requestForegroundPermissionsAsync();
      return {
        granted: res?.status === 'granted',
        canAskAgain: res?.canAskAgain !== false,
        status: res?.status || 'denied',
      };
    } catch (_e) {
      return { granted: false, canAskAgain: false, status: 'denied' };
    }
  }
  return getLocationPermissionStatusAsync();
}

/**
 * Trả về tức thì (0ms) tọa độ GPS thật đã cache trong RAM, hoặc null nếu chưa có vị trí thật.
 * Tuyệt đối không trả về tọa độ hardcode.
 */
export function getCachedLocationSync(): GeoCoords | null {
  return lastKnownMemoryCoords;
}

/**
 * Đọc trạng thái công tắc Opt-in "Tự gắn vị trí khi lưu chi ở tab Chụp" (Mặc định: true, lưu trên máy).
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
 * Cập nhật công tắc Opt-in "Tự gắn vị trí khi lưu chi ở tab Chụp" trong Cài đặt.
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
 * Lấy tọa độ GPS foreground 1 lần an toàn (dùng khi người dùng đã cấp quyền).
 * Tuyệt đối không theo dõi nền (Zero Background Tracking) và không bịa tọa độ hardcode.
 */
export async function getCurrentPositionSafeAsync(
  timeoutMs = 6000,
  promptIfUndetermined = false
): Promise<GeoCoords | null> {
  const ExpoLocation = loadExpoLocation();
  if (ExpoLocation) {
    try {
      const currentPerm = await ExpoLocation.getForegroundPermissionsAsync();
      let granted = currentPerm?.status === 'granted';
      if (!granted && promptIfUndetermined && currentPerm?.canAskAgain !== false) {
        const req = await ExpoLocation.requestForegroundPermissionsAsync();
        granted = req?.status === 'granted';
      }
      if (!granted) {
        return null;
      }

      await loadLastKnownCoordsFromStorage();

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
    await loadLastKnownCoordsFromStorage();
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

  return null;
}

/**
 * Làm nóng GPS khi mở Tab Camera (chỉ chạy nếu người dùng đã bật tính năng và đã cấp quyền).
 */
export async function prewarmLocationAsync(): Promise<GeoCoords | null> {
  const enabled = await getLocationPinEnabled();
  if (!enabled) return null;
  const perm = await getLocationPermissionStatusAsync();
  if (!perm.granted) return null;
  const fresh = await getCurrentPositionSafeAsync(6000, false);
  return fresh || lastKnownMemoryCoords || null;
}

/**
 * Lấy tọa độ GPS thật khi lưu khoản chi (chỉ trả về khi người dùng đã bật công tắc Opt-in và có GPS thật).
 * Tuyệt đối không trả về tọa độ hardcode.
 */
export async function getQuickPinCoordsIfOptedIn(timeoutMs = 8000): Promise<GeoCoords | null> {
  const enabled = await getLocationPinEnabled();
  if (!enabled) return null;
  const perm = await getLocationPermissionStatusAsync();
  if (!perm.granted) return null;

  await loadLastKnownCoordsFromStorage();
  const fresh = await getCurrentPositionSafeAsync(timeoutMs, false);
  return fresh || lastKnownMemoryCoords || null;
}

export interface PlaceAddressResult {
  fullAddress: string;
  shortPlaceName: string;
  district: string;
  city: string;
}

/**
 * Reverse Geocoding miễn phí từ Geocoder tích hợp sẵn của iOS và Android (0$ chi phí, 0 API key).
 * Chỉ trả về địa chỉ thật từ OS Geocoder; tuyệt đối không tự bịa tên quận hoặc địa điểm mẫu.
 */
export async function reverseGeocodePlaceAsync(
  lat: number,
  lng: number
): Promise<PlaceAddressResult | null> {
  if (!isValidVietnamOrWorldCoord(lat, lng)) return null;

  const ExpoLocation = loadExpoLocation();
  if (ExpoLocation && typeof ExpoLocation.reverseGeocodeAsync === 'function') {
    try {
      const results = await ExpoLocation.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (Array.isArray(results) && results.length > 0) {
        const item = results[0];
        const street = (item.street || item.name || '').trim();
        const district = (item.district || item.subregion || '').trim();
        const city = (item.city || item.region || '').trim();

        const shortParts = [street, district].filter(Boolean);
        const fullParts = [street, district, city].filter(Boolean);

        if (fullParts.length === 0) return null;

        return {
          fullAddress: fullParts.join(', '),
          shortPlaceName: shortParts.join(', ') || district || city,
          district,
          city,
        };
      }
    } catch (_e) {
      // ignore geocode error
    }
  }

  return null;
}
