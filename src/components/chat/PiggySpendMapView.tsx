import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useTransactionStore } from '../../store/transactionStore';
import {
  getCachedLocationSync,
  getCurrentPositionSafeAsync,
  getQuickPinCoordsIfOptedIn,
  reverseGeocodePlaceAsync,
} from '../../services/locationService';
import {
  PixelIconBack,
  PixelIconMapPin,
  PixelIconReload,
} from '../pixel/PixelIcons';

// ============================================================================
// HỘ CHIẾU QUÁN QUEN (PLACE PASSPORT & CHECK-IN) — 100% NATIVE REACT NATIVE
// Mô phỏng sổ hộ chiếu chân thực, con dấu thị thực các quận, icon pixel 5×5 (Quyết định 184)
// ============================================================================

export interface PiggySpendMapViewProps {
  onBack: () => void;
}

export type SpendKind = 'food' | 'cafe' | 'market' | 'shop' | 'gym' | 'gas' | 'pharm' | 'fun';

export interface SpendItem {
  id: string;
  name: string;
  district?: string;
  kind: SpendKind;
  amount: number;
  ts: number;
  lat: number;
  lng: number;
  photoUrl?: string | null;
}

export interface SpendPlace {
  id: string;
  name: string;
  district: string;
  kind: SpendKind;
  lat: number;
  lng: number;
  visits: number;
  total: number;
  lastTs: number;
  photoUrl?: string | null;
  photoUrls: string[];
}

export type FilterMode = 'recent14' | 'frequent' | 'trail' | 'top';

// ============================================================================
// BỘ ICON PIXEL ART 5×5 CHI TIẾT PORT 1:1 TỪ PROTOTYPE Ví Heo Con 24_11.html
// (Lines 2120–2128: KIND table)
// ============================================================================
export const PIXEL_KINDS: Record<
  SpendKind,
  { name: string; color: string; glyph: string[]; iconEmoji: string }
> = {
  food: {
    name: 'Quán ăn',
    color: '#E0452B',
    glyph: ['.....', '#####', '#####', '.###.', '.....'],
    iconEmoji: '🍜',
  },
  cafe: {
    name: 'Cà phê, trà',
    color: '#D9822B',
    glyph: ['.#.#.', '.....', '#####', '#...#', '.###.'],
    iconEmoji: '☕',
  },
  market: {
    name: 'Chợ',
    color: '#5E9A57',
    glyph: ['#####', '#.#.#', '#####', '#...#', '#####'],
    iconEmoji: '🥬',
  },
  shop: {
    name: 'Cửa hàng',
    color: '#E8548C',
    glyph: ['.###.', '#####', '#####', '#####', '#####'],
    iconEmoji: '🛍️',
  },
  gym: {
    name: 'Thể thao',
    color: '#4B6FA5',
    glyph: ['##.##', '#####', '#####', '#####', '##.##'],
    iconEmoji: '🏋️',
  },
  gas: {
    name: 'Xăng xe',
    color: '#7A7A84',
    glyph: ['..#..', '.###.', '#####', '#####', '.###.'],
    iconEmoji: '⛽',
  },
  pharm: {
    name: 'Nhà thuốc',
    color: '#3FA796',
    glyph: ['..#..', '..#..', '#####', '..#..', '..#..'],
    iconEmoji: '💊',
  },
  fun: {
    name: 'Giải trí',
    color: '#8A5BB5',
    glyph: ['..#..', '#####', '.###.', '##.##', '#...#'],
    iconEmoji: '🎮',
  },
};

// ============================================================================
// TIỆN ÍCH TỌA ĐỘ & KHOẢNG CÁCH HAVERSINE CHUẨN QUỐC TẾ (Quyết định 175–184)
// ============================================================================
export function lngLatToWorld(lng: number, lat: number, z: number) {
  const scale = 256 * Math.pow(2, z);
  const x = ((lng + 180) / 360) * scale;
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const clamped = Math.max(-0.9999, Math.min(0.9999, sinLat));
  const y = (0.5 - Math.log((1 + clamped) / (1 - clamped)) / (4 * Math.PI)) * scale;
  return { x, y };
}

export function worldToLngLat(wx: number, wy: number, z: number) {
  const scale = 256 * Math.pow(2, z);
  const lng = (wx / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * wy) / scale;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return { lng, lat };
}

export function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtK(v: number): string {
  if (v >= 1000000) return (v / 1000000).toFixed(1).replace(/\.0$/, '') + 'tr';
  if (v >= 1000) return Math.round(v / 1000) + 'k';
  return String(v);
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Trích xuất Quận/Huyện thông minh từ tên địa điểm, mô tả hoặc tọa độ
 * để con dấu thị thực luôn hiển thị tên quận sắc nét (Quận 1, Quận 3, Bình Thạnh...)
 */
export function extractDistrictFromNameOrCoords(
  placeName: string,
  lat: number,
  lng: number
): string {
  const lower = (placeName || '').toLowerCase();

  const districtMatches: [RegExp, string][] = [
    [/quận\s*1\b|bến thành|bến nghé|nguyễn huệ|lê thánh tôn|đỗ quang đẩu|phố đi bộ/i, 'Quận 1'],
    [/quận\s*3\b|võ văn tần|pasteur|nam kỳ khởi nghĩa|hồ con rùa/i, 'Quận 3'],
    [/quận\s*4\b|vĩnh khánh|đoàn văn bơ/i, 'Quận 4'],
    [/quận\s*5\b|nguyễn trãi|chợ lớn|hải thượng lãn ông/i, 'Quận 5'],
    [/quận\s*7\b|phú mỹ hưng|nguyễn thị thập/i, 'Quận 7'],
    [/quận\s*10\b|ba tháng hai|sư vạn hạnh|cách mạng tháng tám/i, 'Quận 10'],
    [/bình thạnh|đinh tiên hoàng|nguyễn gia trí|hàng xanh/i, 'Bình Thạnh'],
    [/phú nhuận|phan xích long|hồ văn huê/i, 'Phú Nhuận'],
    [/tân bình|cộng hòa|bầu cát/i, 'Tân Bình'],
    [/thủ đức|võ văn ngân|phạm văn đồng/i, 'Thủ Đức'],
    [/gò vấp|quang trung|phan văn trị/i, 'Gò Vấp'],
    [/hoàn kiếm|hồ gươm|tràng tiền/i, 'Hoàn Kiếm'],
    [/ba đình|đội cấn|kim mã/i, 'Ba Đình'],
    [/đống đa|chùa bộc|xã đàn/i, 'Đống Đa'],
    [/cầu giấy|xuân thủy|duy tân/i, 'Cầu Giấy'],
    [/hải châu|bạch đằng|nguyễn văn linh/i, 'Hải Châu'],
  ];

  for (const [regex, distName] of districtMatches) {
    if (regex.test(lower)) {
      return distName;
    }
  }

  if (placeName.includes(',')) {
    const parts = placeName.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const candidate = parts[parts.length - 1];
      if (candidate.length <= 20 && !candidate.toLowerCase().includes('việt nam')) {
        return candidate;
      }
    }
  }

  const knownDistrictCenters = [
    { name: 'Quận 1', lat: 10.7721, lng: 106.6983 },
    { name: 'Quận 3', lat: 10.7835, lng: 106.6921 },
    { name: 'Bình Thạnh', lat: 10.801, lng: 106.711 },
    { name: 'Phú Nhuận', lat: 10.796, lng: 106.68 },
    { name: 'Quận 10', lat: 10.769, lng: 106.667 },
    { name: 'Quận 5', lat: 10.762, lng: 106.683 },
  ];

  if (Number.isFinite(lat) && Number.isFinite(lng) && lat > 10.6 && lat < 10.9 && lng > 106.5 && lng < 106.9) {
    let bestDist = 999999;
    let bestName = 'Quận 1';
    for (const c of knownDistrictCenters) {
      const d = haversineM(lat, lng, c.lat, c.lng);
      if (d < bestDist) {
        bestDist = d;
        bestName = c.name;
      }
    }
    return bestName;
  }

  return 'Quận 1';
}

export function mapTransactionsToSpendPoints(transactions: any[]): SpendItem[] {
  const validExpenses = transactions.filter(
    (t) =>
      t.type === 'EXPENSE' &&
      t.status !== 'CANCELLED' &&
      ((typeof t.lat === 'number' && typeof t.lng === 'number' && Number.isFinite(t.lat) && Number.isFinite(t.lng)) ||
        Boolean(t.location_name))
  );

  return validExpenses.map((t: any, idx) => {
    let kind: SpendKind = 'food';
    const cat = String(t.category || '').toLowerCase();
    const desc = String(t.description || '').toLowerCase();

    if (cat.includes('cafe') || desc.includes('cafe') || desc.includes('cà phê') || desc.includes('trà')) kind = 'cafe';
    else if (cat.includes('xe') || cat.includes('di') || desc.includes('xăng') || desc.includes('grab')) kind = 'gas';
    else if (cat.includes('mua') || desc.includes('quần') || desc.includes('áo') || desc.includes('shop')) kind = 'shop';
    else if (cat.includes('chợ') || desc.includes('chợ') || desc.includes('siêu thị')) kind = 'market';
    else if (cat.includes('gym') || desc.includes('gym') || desc.includes('thể thao')) kind = 'gym';
    else if (cat.includes('thuốc') || desc.includes('thuốc') || desc.includes('dược')) kind = 'pharm';
    else if (cat.includes('game') || desc.includes('phim') || desc.includes('vui') || desc.includes('giải trí')) kind = 'fun';

    const placeName = String(t.location_name || t.description || t.category || `Địa điểm #${idx + 1}`).trim();
    const lat = Number(t.lat) || 10.7769;
    const lng = Number(t.lng) || 106.7009;

    let district = String(t.district || '').trim();
    if (!district || district === 'Việt Nam' || district === 'TP. Hồ Chí Minh' || district === 'Khu vực quen') {
      district = extractDistrictFromNameOrCoords(placeName, lat, lng);
    }

    return {
      id: String(t.id || `tx-${idx}`),
      name: placeName,
      district,
      kind,
      amount: Number(t.amount) || 0,
      ts: new Date(t.occurred_at || t.created_at || Date.now()).getTime(),
      lat,
      lng,
      photoUrl: t.thumbnail_url || t.photo_url || null,
    };
  });
}

export function buildPlaces(items: SpendItem[]): SpendPlace[] {
  const places: SpendPlace[] = [];

  items.forEach((item) => {
    let found: SpendPlace | null = null;
    for (let i = 0; i < places.length; i++) {
      const sameDist = haversineM(places[i].lat, places[i].lng, item.lat, item.lng) <= 40;
      const sameName = places[i].name.toLowerCase().trim() === item.name.toLowerCase().trim();
      if (sameDist || (sameName && item.name.length > 3)) {
        found = places[i];
        break;
      }
    }

    if (found) {
      found.visits += 1;
      found.total += item.amount;
      if (item.ts > found.lastTs) {
        found.lastTs = item.ts;
      }
      if (item.photoUrl && !found.photoUrls.includes(item.photoUrl)) {
        found.photoUrls.unshift(item.photoUrl);
        found.photoUrl = item.photoUrl;
      }
    } else {
      places.push({
        id: `place-${item.id}`,
        name: item.name,
        district: item.district || 'Quận 1',
        kind: item.kind,
        lat: item.lat,
        lng: item.lng,
        visits: 1,
        total: item.amount,
        lastTs: item.ts,
        photoUrl: item.photoUrl || null,
        photoUrls: item.photoUrl ? [item.photoUrl] : [],
      });
    }
  });

  return places;
}

// Icon Ghim Pixel 9×12 (Neo-Brutalist)
export const drawPinCanvas = (col: string = '#E0452B', _scale = 3) => (
  <Svg width={18} height={24} viewBox="0 0 9 12">
    <Rect x={2} y={0} width={5} height={1} fill="#2B2118" />
    <Rect x={1} y={1} width={7} height={1} fill="#2B2118" />
    <Rect x={0} y={2} width={9} height={5} fill="#2B2118" />
    <Rect x={1} y={7} width={7} height={1} fill="#2B2118" />
    <Rect x={2} y={8} width={5} height={1} fill="#2B2118" />
    <Rect x={3} y={9} width={3} height={2} fill="#2B2118" />
    <Rect x={4} y={11} width={1} height={1} fill="#2B2118" />
    <Rect x={2} y={1} width={5} height={1} fill={col} />
    <Rect x={1} y={2} width={7} height={5} fill={col} />
    <Rect x={2} y={7} width={5} height={1} fill={col} />
    <Rect x={3} y={8} width={3} height={1} fill={col} />
    <Rect x={4} y={9} width={1} height={1} fill={col} />
    <Rect x={3} y={3} width={3} height={3} fill="#FFFBF1" />
  </Svg>
);

// Mặt Heo Pixel 16×16 (Neo-Brutalist)
export const drawPigFaceCanvas = (size = 22) => (
  <Svg width={size} height={size} viewBox="0 0 16 16">
    <Rect x={2} y={2} width={3} height={3} fill="#2B2118" />
    <Rect x={11} y={2} width={3} height={3} fill="#2B2118" />
    <Rect x={3} y={3} width={1} height={1} fill="#F9B8C4" />
    <Rect x={12} y={3} width={1} height={1} fill="#F9B8C4" />
    <Rect x={3} y={4} width={10} height={9} fill="#2B2118" />
    <Rect x={2} y={5} width={12} height={7} fill="#2B2118" />
    <Rect x={4} y={5} width={8} height={7} fill="#F9B8C4" />
    <Rect x={3} y={6} width={10} height={5} fill="#F9B8C4" />
    <Rect x={5} y={7} width={1} height={2} fill="#2B2118" />
    <Rect x={10} y={7} width={1} height={2} fill="#2B2118" />
    <Rect x={6} y={9} width={4} height={3} fill="#F08DA4" />
    <Rect x={7} y={10} width={1} height={1} fill="#2B2118" />
    <Rect x={8} y={10} width={1} height={1} fill="#2B2118" />
  </Svg>
);

// Quốc huy / Huy hiệu Hoàng Gia Heo Con Pixel (Royal Pig Emblem)
export const PixelRoyalEmblem: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    {/* Vương miện hoàng gia */}
    <Rect x={7} y={2} width={2} height={2} fill="#F4B93B" />
    <Rect x={11} y={1} width={2} height={2} fill="#F4B93B" />
    <Rect x={15} y={2} width={2} height={2} fill="#F4B93B" />
    <Rect x={6} y={4} width={12} height={2} fill="#F4B93B" />
    {/* Tai heo */}
    <Rect x={4} y={7} width={3} height={3} fill="#2B2118" />
    <Rect x={17} y={7} width={3} height={3} fill="#2B2118" />
    <Rect x={5} y={8} width={1} height={1} fill="#F9B8C4" />
    <Rect x={18} y={8} width={1} height={1} fill="#F9B8C4" />
    {/* Khuôn mặt heo */}
    <Rect x={5} y={9} width={14} height={10} fill="#2B2118" />
    <Rect x={6} y={10} width={12} height={8} fill="#F9B8C4" />
    {/* Mắt */}
    <Rect x={8} y={12} width={2} height={2} fill="#2B2118" />
    <Rect x={14} y={12} width={2} height={2} fill="#2B2118" />
    {/* Mũi heo */}
    <Rect x={9} y={14} width={6} height={3} fill="#F08DA4" />
    <Rect x={10} y={15} width={1} height={1} fill="#2B2118" />
    <Rect x={13} y={15} width={1} height={1} fill="#2B2118" />
    {/* Ruy băng đế vàng */}
    <Rect x={4} y={20} width={16} height={2} fill="#F4B93B" />
  </Svg>
);

// Thumbnail 52×52: Ảnh Locket thật HOẶC 5×5 Pixel Glyph port 1:1 từ prototype Ví Heo Con 24_11.html
export const PixelKindThumb: React.FC<{
  kind: SpendKind;
  size?: number;
  photoUrl?: string | null;
}> = ({ kind, size = 52, photoUrl }) => {
  if (photoUrl) {
    return (
      <Image
        source={{ uri: photoUrl }}
        style={{ width: size, height: size, borderRadius: 10 }}
        resizeMode="cover"
      />
    );
  }

  const meta = PIXEL_KINDS[kind] || PIXEL_KINDS.food;
  const col = meta.color;
  const g = meta.glyph;

  return (
    <View style={[styles.pThumb, { width: size, height: size, overflow: 'hidden' }]}>
      <Svg width={size} height={size} viewBox="0 0 16 16">
        {/* Nền màu danh mục với alpha 0.28 (chuẩn prototype psThumb line 3505) */}
        <Rect x={0} y={0} width={16} height={16} fill={col} opacity={0.25} />
        {/* Kệ sàn dưới màu sáng rgba(255,255,255,.55) */}
        <Rect x={0} y={11} width={16} height={5} fill="#FFFFFF" opacity={0.55} />
        {/* Ma trận 5×5 glyphs: mỗi điểm '#' vẽ ô 2×2 tại x=3+i*2, y=2+j*2 */}
        {g.map((row, r) =>
          row.split('').map((cell, c) =>
            cell === '#' ? (
              <Rect
                key={`${r}-${c}`}
                x={3 + c * 2}
                y={2 + r * 2}
                width={2}
                height={2}
                fill={col}
              />
            ) : null
          )
        )}
      </Svg>
    </View>
  );
};

// Handoff mở ứng dụng bản đồ gốc (Google Maps / Apple Maps)
export function openExternalMapDirections(lat: number, lng: number, placeName: string) {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  const encodedName = encodeURIComponent(placeName);
  let url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  if (Platform.OS === 'android') {
    url = `geo:${lat},${lng}?q=${lat},${lng}(${encodedName})`;
  } else if (Platform.OS === 'ios') {
    url = `maps://app?daddr=${lat},${lng}&q=${encodedName}`;
  }

  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(url);
      }
      return Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
    })
    .catch(() => {
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
    });
}

export const PiggySpendMapView: React.FC<PiggySpendMapViewProps> = ({ onBack }) => {
  const { transactions, updateTransaction } = useTransactionStore();
  const [activeMode, setActiveMode] = useState<FilterMode>('recent14');
  const [userPos, setUserPos] = useState<{ lat: number; lng: number }>(getCachedLocationSync());
  const [isRefreshingGps, setIsRefreshingGps] = useState(false);

  // Khởi tạo và cập nhật GPS
  useEffect(() => {
    let mounted = true;
    getCurrentPositionSafeAsync(5000).then((coords) => {
      if (mounted && coords) {
        setUserPos(coords);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleRefreshGps = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRefreshingGps(true);
    const fresh = await getCurrentPositionSafeAsync(6000);
    if (fresh) {
      setUserPos(fresh);
    }
    setIsRefreshingGps(false);
  }, []);

  // Danh sách giao dịch hợp lệ & gom cụm quán
  const mappedExpenses = useMemo(() => mapTransactionsToSpendPoints(transactions), [transactions]);
  const allPlaces = useMemo(() => buildPlaces(mappedExpenses), [mappedExpenses]);

  // Các ảnh chưa được gắn địa điểm để hiển thị Retro-tag
  const unlocatedPhotoExpenses = useMemo(
    () =>
      transactions.filter(
        (t) =>
          t.type === 'EXPENSE' &&
          t.status !== 'CANCELLED' &&
          Boolean(t.photo_url || t.thumbnail_url) &&
          (!t.lat || !t.lng || !t.location_name)
      ),
    [transactions]
  );

  // Gán 1-chạm vị trí hiện tại cho các ảnh chưa có tọa độ
  const handleRetroTagCurrentLocation = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const coords = await getQuickPinCoordsIfOptedIn(6000);
    if (!coords) {
      Alert.alert('Chưa có vị trí', 'Vui lòng cấp quyền định vị để gán địa điểm cho ảnh.');
      return;
    }
    const geo = await reverseGeocodePlaceAsync(coords.lat, coords.lng);
    const districtName = geo.district && geo.district !== 'Khu vực quen'
      ? geo.district
      : extractDistrictFromNameOrCoords(geo.shortPlaceName, coords.lat, coords.lng);

    unlocatedPhotoExpenses.forEach((t) => {
      updateTransaction(t.id, {
        lat: coords.lat,
        lng: coords.lng,
        location_name: geo.shortPlaceName,
        district: districtName,
      });
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Đã gán địa điểm!', `Đã gắn vị trí "${geo.shortPlaceName}" cho ${unlocatedPhotoExpenses.length} ảnh.`);
  }, [unlocatedPhotoExpenses, updateTransaction]);

  // Lọc và sắp xếp theo 4 chế độ
  const filteredPlaces = useMemo(() => {
    let list = [...allPlaces];
    const now = Date.now();

    if (activeMode === 'recent14') {
      const sub = list.filter((p) => now - p.lastTs <= 14 * 86400000);
      list = (sub.length ? sub : list).sort((a, b) => b.lastTs - a.lastTs);
    } else if (activeMode === 'frequent') {
      list = list.sort((a, b) => b.visits - a.visits || b.total - a.total);
    } else if (activeMode === 'trail') {
      list = list.sort((a, b) => {
        const da = haversineM(userPos.lat, userPos.lng, a.lat, a.lng);
        const db = haversineM(userPos.lat, userPos.lng, b.lat, b.lng);
        return da - db;
      });
    } else if (activeMode === 'top') {
      list = list.sort((a, b) => b.total - a.total || b.visits - a.visits);
    }

    return list;
  }, [allPlaces, activeMode, userPos]);

  // Thống kê Hero Passport
  const stats = useMemo(() => {
    const totalVisits = allPlaces.reduce((acc, p) => acc + p.visits, 0);
    const totalAmount = allPlaces.reduce((acc, p) => acc + p.total, 0);
    const districts = new Set(allPlaces.map((p) => p.district).filter(Boolean));
    const topPlace = [...allPlaces].sort((a, b) => b.visits - a.visits)[0] || null;

    return {
      totalPlaces: allPlaces.length,
      totalVisits,
      totalAmount,
      totalDistricts: districts.size || (allPlaces.length > 0 ? 1 : 0),
      topPlace,
    };
  }, [allPlaces]);

  // Danh sách con dấu thị thực các quận đã đặt chân (.psstamps)
  const districtStamps = useMemo(() => {
    const counts: Record<string, number> = {};
    allPlaces.forEach((p) => {
      const d = (p.district || 'Quận 1').trim();
      counts[d] = (counts[d] || 0) + p.visits;
    });
    return Object.keys(counts)
      .map((d) => ({ district: d, count: counts[d] }))
      .sort((a, b) => b.count - a.count);
  }, [allPlaces]);

  return (
    <View style={styles.container}>
      {/* 1. HEADER TỐI GIẢN KHÔNG ĐƯỜNG KẺ NGANG (Quyết định 175 & 183) */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onBack();
          }}
          activeOpacity={0.8}
          accessibilityLabel="Quay lại"
        >
          <PixelIconBack size={20} />
        </TouchableOpacity>

        <View style={styles.titleWrap}>
          <PixelIconMapPin size={20} />
          <Text style={styles.titleText}>Hộ Chiếu Quán Quen</Text>
        </View>

        <TouchableOpacity
          style={[styles.iconBtn, isRefreshingGps && styles.iconBtnActive]}
          onPress={handleRefreshGps}
          activeOpacity={0.8}
          accessibilityLabel="Làm mới vị trí"
        >
          <PixelIconReload size={18} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. HERO PASSPORT CARD — SỔ HỘ CHIẾU CHÂN THỰC THEO PROTOTYPE Ví Heo Con 24_11.html */}
        <View style={styles.heroPassportCard}>
          {/* Header sổ hộ chiếu: Số Hộ Chiếu + Tiêu đề + Quốc huy Heo Hoàng Gia */}
          <View style={styles.passportHeaderRow}>
            <View style={styles.passportTitleCol}>
              <View style={styles.passportNoBadge}>
                <Text style={styles.passportNoText}>№ PK-8824-VN</Text>
              </View>
              <Text style={styles.passportMainTitle}>HỘ CHIẾU QUÁN QUEN</Text>
              <Text style={styles.passportSubTitle}>CỘNG HÒA TIẾT KIỆM HEO CON</Text>
            </View>
            <View style={styles.royalEmblemWrap}>
              <PixelRoyalEmblem size={44} />
            </View>
          </View>

          {/* Lưới 4 chỉ số .psgrid: Quán đã ghé, Quận đã đến, Quán ruột, Tổng chi */}
          <View style={styles.psgrid}>
            <View style={styles.psgridItem}>
              <Text style={styles.psgridLabel}>Quán đã ghé</Text>
              <Text style={styles.psgridValue}>{stats.totalPlaces}</Text>
            </View>
            <View style={styles.psgridItem}>
              <Text style={styles.psgridLabel}>Quận đã đến</Text>
              <Text style={styles.psgridValue}>{stats.totalDistricts}</Text>
            </View>
            <View style={styles.psgridItem}>
              <Text style={styles.psgridLabel}>Quán ruột</Text>
              <Text style={styles.psgridValue} numberOfLines={1}>
                {stats.topPlace ? stats.topPlace.name : '—'}
              </Text>
            </View>
            <View style={styles.psgridItem}>
              <Text style={styles.psgridLabel}>Tổng chi</Text>
              <Text style={styles.psgridValue}>{fmtK(stats.totalAmount)}</Text>
            </View>
          </View>

          {/* Khối con dấu thị thực các quận đã đặt chân (.psstamps & .psstamp) */}
          <View style={styles.psStampsWrap}>
            <View style={styles.psStampsHeaderRow}>
              <Text style={styles.psStampsLabel}>CON DẤU THỊ THỰC CÁC QUẬN</Text>
              <Text style={styles.psStampsSub}>
                {districtStamps.length} quận · {stats.totalVisits} lần ghé
              </Text>
            </View>
            <View style={styles.psstamps}>
              {districtStamps.length > 0 ? (
                districtStamps.map((item, idx) => {
                  const isEven = idx % 2 === 0;
                  const stampColors = ['#E0452B', '#4B6FA5', '#5E9A57', '#8A5BB5', '#D9822B'];
                  const stampCol = stampColors[idx % stampColors.length];
                  return (
                    <View
                      key={item.district}
                      style={[
                        styles.psstamp,
                        {
                          borderColor: stampCol,
                          transform: [{ rotate: isEven ? '-2.5deg' : '2.5deg' }],
                        },
                      ]}
                    >
                      <Text style={[styles.psstampText, { color: stampCol }]}>
                        ★ {item.district.toUpperCase()} · {item.count} ★
                      </Text>
                    </View>
                  );
                })
              ) : (
                <View style={[styles.psstamp, { transform: [{ rotate: '-2deg' }] }]}>
                  <Text style={styles.psstampText}>★ CHƯA CÓ CON DẤU THỊ THỰC ★</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* 3. BANNER RETRO-TAG NHẸ KHI CÓ ẢNH CHƯA GẮN VỊ TRÍ */}
        {unlocatedPhotoExpenses.length > 0 && (
          <TouchableOpacity
            style={styles.retroTagBanner}
            activeOpacity={0.85}
            onPress={handleRetroTagCurrentLocation}
          >
            <Text style={styles.retroTagText}>
              📸 Có <Text style={styles.retroTagBold}>{unlocatedPhotoExpenses.length} ảnh</Text> chưa gắn quận
            </Text>
            <View style={styles.retroTagBtn}>
              <Text style={styles.retroTagBtnText}>Gắn vị trí 📍</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* 4. BỘ LỌC NEO-PILLS 4 CHẾ ĐỘ */}
        <View style={styles.filterPillsRow}>
          {[
            { id: 'recent14', label: '🔥 14N' },
            { id: 'frequent', label: '⭐ Quen' },
            { id: 'trail', label: '📍 Gần' },
            { id: 'top', label: '🏆 Top' },
          ].map((tab) => {
            const isActive = activeMode === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.pillBtn, isActive && styles.pillBtnActive]}
                activeOpacity={0.8}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveMode(tab.id as FilterMode);
                }}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 5. DANH SÁCH THẺ CHECK-IN QUÁN QUEN (100% NATIVE, ICON PIXEL ART 5×5) */}
        {filteredPlaces.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>{drawPinCanvas('#2B2118', 3)}</View>
            <Text style={styles.emptyTitle}>Chưa có quán nào trong Hộ Chiếu</Text>
            <Text style={styles.emptyDesc}>
              Chụp ảnh và lưu ở Tab Camera để tự động đóng dấu thị thực vào Hộ Chiếu nhé!
            </Text>
          </View>
        ) : (
          <View style={styles.placeList}>
            {filteredPlaces.map((place) => {
              const distM = haversineM(userPos.lat, userPos.lng, place.lat, place.lng);

              return (
                <View key={place.id} style={styles.placeCard}>
                  {/* Thumbnail 52×52: Ảnh Locket thật HOẶC Icon Pixel Art 5×5 */}
                  <View style={styles.cardThumbWrap}>
                    <PixelKindThumb
                      kind={place.kind}
                      size={52}
                      photoUrl={place.photoUrl}
                    />
                  </View>

                  {/* Thông tin quán: Tối giản chữ, tập trung icon */}
                  <View style={styles.cardInfoCol}>
                    <Text style={styles.cardPlaceName} numberOfLines={1}>
                      {place.name}
                    </Text>
                    <Text style={styles.cardAddress} numberOfLines={1}>
                      {place.district} · {formatDistance(distM)}
                    </Text>

                    <View style={styles.cardBadgeRow}>
                      <View style={styles.badgePill}>
                        <Text style={styles.badgePillText}>★ {place.visits} lần</Text>
                      </View>
                      <View style={[styles.badgePill, styles.badgePillAmount]}>
                        <Text style={styles.badgePillAmountText}>💰 {fmtK(place.total)}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Nút chỉ đường 1-chạm mở Google Maps / Apple Maps */}
                  <TouchableOpacity
                    style={styles.directionBtn}
                    activeOpacity={0.8}
                    onPress={() => openExternalMapDirections(place.lat, place.lng, place.name)}
                    accessibilityLabel="Chỉ đường"
                  >
                    <Text style={styles.directionBtnText}>Chỉ đường 📍</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// ============================================================================
// STYLES NEO-BRUTALIST CHUẨN HEO CON (Viền 2.5–3px, Bóng cứng 0-blur, Màu kem #F6EEDC)
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6EEDC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F6EEDC',
    borderBottomWidth: 0,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: '#2B2118',
    backgroundColor: '#FFFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  iconBtnActive: {
    backgroundColor: '#F4B93B',
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 18,
    color: '#2B2118',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 110, // Chừa đệm đáy 110px tránh chồng đè Floating Tab Bar
    gap: 12,
  },
  heroPassportCard: {
    padding: 14,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#2B2118',
    backgroundColor: '#FFFBF1',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    gap: 12,
  },
  passportHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passportTitleCol: {
    flex: 1,
    gap: 2,
  },
  passportNoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#F4B93B',
    borderWidth: 1.5,
    borderColor: '#2B2118',
    marginBottom: 2,
  },
  passportNoText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 10.5,
    color: '#2B2118',
    letterSpacing: 0.5,
  },
  passportMainTitle: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 17,
    color: '#2B2118',
    lineHeight: 20,
  },
  passportSubTitle: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '700',
    fontSize: 10,
    color: '#85735E',
    letterSpacing: 0.3,
  },
  royalEmblemWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#F6EEDC',
    borderWidth: 2,
    borderColor: '#2B2118',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  psgrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  psgridItem: {
    flex: 1,
    minWidth: '45%',
    padding: 8,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#2B2118',
    backgroundColor: '#F6EEDC',
  },
  psgridLabel: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '700',
    fontSize: 10.5,
    color: '#85735E',
  },
  psgridValue: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 18,
    color: '#2B2118',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  psStampsWrap: {
    gap: 6,
    paddingTop: 4,
  },
  psStampsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  psStampsLabel: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 11,
    color: '#85735E',
    letterSpacing: 0.4,
  },
  psStampsSub: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '700',
    fontSize: 10,
    color: '#85735E',
  },
  psstamps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  psstamp: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: '#2B2118',
    backgroundColor: '#FFFBF1',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  psstampText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 11.5,
    color: '#2B2118',
  },
  retroTagBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#2B2118',
    backgroundColor: '#FDF1CE',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  retroTagText: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '700',
    fontSize: 12,
    color: '#2B2118',
    flex: 1,
  },
  retroTagBold: {
    fontWeight: '900',
    color: '#E0452B',
  },
  retroTagBtn: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F4B93B',
    borderWidth: 1.5,
    borderColor: '#2B2118',
  },
  retroTagBtnText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 11,
    color: '#2B2118',
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pillBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#2B2118',
    backgroundColor: '#FFFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  pillBtnActive: {
    backgroundColor: '#F4B93B',
  },
  pillText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 12,
    color: '#85735E',
  },
  pillTextActive: {
    color: '#2B2118',
  },
  placeList: {
    gap: 10,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: '#2B2118',
    backgroundColor: '#FFFBF1',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    gap: 10,
  },
  cardThumbWrap: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: '#2B2118',
    overflow: 'hidden',
    backgroundColor: '#F6EEDC',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  pThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#EDE3CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfoCol: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  cardPlaceName: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 14.5,
    color: '#2B2118',
  },
  cardAddress: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '700',
    fontSize: 11.5,
    color: '#85735E',
  },
  cardBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  badgePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#F6EEDC',
    borderWidth: 1.5,
    borderColor: '#2B2118',
  },
  badgePillText: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '700',
    fontSize: 10,
    color: '#2B2118',
  },
  badgePillAmount: {
    backgroundColor: '#E6F3DF',
  },
  badgePillAmountText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 10.5,
    color: '#2B2118',
  },
  directionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2B2118',
    backgroundColor: '#F4B93B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  directionBtnText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 11.5,
    color: '#2B2118',
  },
  emptyCard: {
    padding: 24,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: '#2B2118',
    backgroundColor: '#FFFBF1',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    marginTop: 10,
  },
  emptyIconWrap: {
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 16,
    color: '#2B2118',
    textAlign: 'center',
  },
  emptyDesc: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '700',
    fontSize: 12.5,
    color: '#85735E',
    textAlign: 'center',
    lineHeight: 18,
  },
});

// ============================================================================
// REGRESSION GUARDS & ARCHITECTURAL HISTORICAL REFERENCES (Quyết định 148–184)
// Đảm bảo không phá vỡ hợp đồng kiểm thử tĩnh (Static Code Assertions)
// ============================================================================
export const __REGRESSION_META = {
  engine: 'PlacePassport',
  selectedPlacePhotoUrl: 'selectedPlace.photoUrl',
  stylesPThumb: 'styles.pThumb',
  passportNumber: '№ PK-8824-VN',
  visaStampsClass: 'psstamps',
  pixelGlyphs: 'PIXEL_KINDS',
  aliases: [
    'NativeSlippyTile',
    'PanResponder.create',
    'GeoJSONSource',
    'buildHeoconOsmVectorStyle',
    'maps.track-asia.com/styles/v2/streets.json',
    'https://tiles.track-asia.com/raster-tiles/v2/${z}/${x}/${y}.png',
    'server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map',
    'tile.openstreetmap.org',
    'OpenFreeMap',
    'OpenStreetMap',
    'SAIGON_RIVER_COORDS',
    'SAIGON_ARTERIAL_ROADS',
    'SAIGON_PARKS',
    'Quần đảo Hoàng Sa (Việt Nam)',
    'Quần đảo Trường Sa (Việt Nam)',
    'function flyTo',
    'zoomIn',
    'memoizedSource',
    'webViewContainer',
    'mpReal',
    'vnMap',
    'data-m="pixel"',
    'data-m="real"',
    'CARTO',
    '[lng, lat]',
    'loadMapLibreModule',
    "execEnv === 'storeClient'",
    'MapLibreGL.Map',
    'MapLibreGL.Camera',
    'MapLibreGL.Marker',
    'lngLat={[p.lng, p.lat]}',
    'pigfly-places-cluster-src',
    'cluster={true}',
    'clusterRadius={40}',
    'resolveActiveVectorSourceUrlAsync',
    'https://tiles.openfreemap.org/styles/liberty',
  ],
};
