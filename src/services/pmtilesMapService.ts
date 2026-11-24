import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

export const LOCAL_PMTILES_REL_PATH = 'maps/vietnam.pmtiles';
export const OPENFREEMAP_VECTOR_SOURCE_URL = 'https://tiles.openfreemap.org/planet';

export interface ActiveVectorSourceResult {
  sourceUrl: string;
  isPmtiles: boolean;
  modeLabel: string;
}

/**
 * Chuẩn hóa URL PMTiles cho MapLibre Native Android SDK 13.6.1+ (`pmtiles://https://...` hoặc `pmtiles://file:///...`)
 */
export function normalizePmtilesUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('pmtiles://')) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return `pmtiles://${trimmed}`;
  }
  if (trimmed.startsWith('file://')) {
    return `pmtiles://${trimmed}`;
  }
  return `pmtiles://file://${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
}

/**
 * Giải quyết nguồn Vector Map 0$ theo thứ tự ưu tiên (Quyết định 182):
 * 1. File `.pmtiles` tự chủ lưu offline ngay trên thiết bị (`FileSystem.documentDirectory/maps/vietnam.pmtiles`)
 * 2. Remote PMTiles tự host qua `EXPO_PUBLIC_PMTILES_URL` (Cloudflare R2 0đ băng thông egress)
 * 3. OpenFreeMap OSM Vector (`https://tiles.openfreemap.org/planet` — 0$ trọn đời, 0 API key)
 */
export async function resolveActiveVectorSourceUrlAsync(): Promise<ActiveVectorSourceResult> {
  try {
    if (Platform.OS !== 'web' && FileSystem.documentDirectory) {
      const baseDir = FileSystem.documentDirectory.endsWith('/')
        ? FileSystem.documentDirectory
        : `${FileSystem.documentDirectory}/`;
      const localPath = `${baseDir}${LOCAL_PMTILES_REL_PATH}`;
      const info = await FileSystem.getInfoAsync(localPath);
      if (info?.exists) {
        return {
          sourceUrl: normalizePmtilesUrl(localPath),
          isPmtiles: true,
          modeLabel: 'PMTiles Offline',
        };
      }
    }
  } catch (_e) {
    // fallback to remote PMTiles or OpenFreeMap
  }

  const remotePmtiles = process.env.EXPO_PUBLIC_PMTILES_URL;
  if (typeof remotePmtiles === 'string' && remotePmtiles.trim().length > 0) {
    return {
      sourceUrl: normalizePmtilesUrl(remotePmtiles),
      isPmtiles: true,
      modeLabel: 'PMTiles R2 0$',
    };
  }

  return {
    sourceUrl: OPENFREEMAP_VECTOR_SOURCE_URL,
    isPmtiles: false,
    modeLabel: 'OSM Vector 0$',
  };
}

/**
 * Đọc tên POI (quán ăn, cửa hàng, địa danh) ưu tiên tiếng Việt trực tiếp từ các Vector Feature OSM của Tile.
 */
export function extractNearbyPoiNameFromFeatures(features: any[]): string | null {
  if (!Array.isArray(features) || features.length === 0) return null;
  for (const feature of features) {
    const props = feature?.properties;
    if (!props || typeof props !== 'object') continue;
    const candidate = props['name:vi'] || props.name || props.name_en || props['name:latin'];
    if (typeof candidate === 'string' && candidate.trim().length > 1) {
      return candidate.trim();
    }
  }
  return null;
}
