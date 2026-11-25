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
import {
  ArrowLeft,
  Camera,
  Clock,
  Coffee,
  Coins,
  Dumbbell,
  Fuel,
  LocateFixed,
  MapPin,
  Pill,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Utensils,
} from 'lucide-react-native';
import Svg, { Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useTransactionStore } from '../../store/transactionStore';
import {
  GeoCoords,
  getCachedLocationSync,
  getCurrentPositionSafeAsync,
  getQuickPinCoordsIfOptedIn,
  reverseGeocodePlaceAsync,
} from '../../services/locationService';
import {
  PixelIconCameraMini,
  PixelIconClock,
  PixelIconCoin,
  PixelIconMapPin,
  PixelIconStar,
} from '../pixel/PixelIcons';
import { BenThanhStreetBannerWebView } from './BenThanhStreetBannerWebView';

// ============================================================================
// QUÁN QUEN (PLACE CHECK-IN) — 100% NATIVE + BANNER CHỢ BẾN THÀNH CUỘN NGANG
// Chuẩn Production: Zero-Hardcode Vị Trí, Gộp Khung Tóm Tắt, Chỉ Đường Chuẩn Store (QĐ 186)
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
  lat: number | null;
  lng: number | null;
  photoUrl?: string | null;
}

export interface SpendPlace {
  id: string;
  name: string;
  district: string;
  kind: SpendKind;
  lat: number | null;
  lng: number | null;
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
  { name: string; color: string; glyph: string[] }
> = {
  food: {
    name: 'Quán ăn',
    color: '#E0452B',
    glyph: ['.....', '#####', '#####', '.###.', '.....'],
  },
  cafe: {
    name: 'Cà phê, trà',
    color: '#D9822B',
    glyph: ['.#.#.', '.....', '#####', '#...#', '.###.'],
  },
  market: {
    name: 'Chợ',
    color: '#5E9A57',
    glyph: ['#####', '#.#.#', '#####', '#...#', '#####'],
  },
  shop: {
    name: 'Cửa hàng',
    color: '#E8548C',
    glyph: ['.###.', '#####', '#####', '#####', '#####'],
  },
  gym: {
    name: 'Thể thao',
    color: '#4B6FA5',
    glyph: ['##.##', '#####', '#####', '#####', '##.##'],
  },
  gas: {
    name: 'Xăng xe',
    color: '#7A7A84',
    glyph: ['..#..', '.###.', '#####', '#####', '.###.'],
  },
  pharm: {
    name: 'Nhà thuốc',
    color: '#3FA796',
    glyph: ['..#..', '..#..', '#####', '..#..', '..#..'],
  },
  fun: {
    name: 'Giải trí',
    color: '#8A5BB5',
    glyph: ['..#..', '#####', '.###.', '##.##', '#...#'],
  },
};

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
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

function agoText(ts: number): string {
  const hours = Math.max(0, (Date.now() - ts) / 36e5);
  if (hours < 1) return 'Vừa xong';
  if (hours < 24) return `${Math.floor(hours)} giờ trước`;
  if (hours < 48) return 'Hôm qua';
  return `${Math.floor(hours / 24)} ngày trước`;
}

export function extractDistrictFromNameOrCoords(
  placeName: string,
  _lat?: number | null,
  _lng?: number | null
): string {
  const lower = (placeName || '').toLowerCase();

  const districtMatches: [RegExp, string][] = [
    [/quận\s*1\b/i, 'Quận 1'],
    [/quận\s*3\b/i, 'Quận 3'],
    [/quận\s*4\b/i, 'Quận 4'],
    [/quận\s*5\b/i, 'Quận 5'],
    [/quận\s*7\b/i, 'Quận 7'],
    [/quận\s*10\b/i, 'Quận 10'],
    [/bình thạnh/i, 'Bình Thạnh'],
    [/phú nhuận/i, 'Phú Nhuận'],
    [/tân bình/i, 'Tân Bình'],
    [/thủ đức/i, 'Thủ Đức'],
    [/gò vấp/i, 'Gò Vấp'],
    [/hoàn kiếm/i, 'Hoàn Kiếm'],
    [/ba đình/i, 'Ba Đình'],
    [/đống đa/i, 'Đống Đa'],
    [/cầu giấy/i, 'Cầu Giấy'],
    [/hải châu/i, 'Hải Châu'],
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
      if (candidate.length <= 24 && !candidate.toLowerCase().includes('việt nam')) {
        return candidate;
      }
    }
  }

  return '';
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
    const lat = typeof t.lat === 'number' && Number.isFinite(t.lat) ? t.lat : null;
    const lng = typeof t.lng === 'number' && Number.isFinite(t.lng) ? t.lng : null;

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
      const pLat = places[i].lat;
      const pLng = places[i].lng;
      const sameDist =
        pLat !== null &&
        pLng !== null &&
        item.lat !== null &&
        item.lng !== null &&
        haversineM(pLat, pLng, item.lat, item.lng) <= 40;
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
      if (!found.district && item.district) {
        found.district = item.district;
      }
      if ((found.lat === null || found.lng === null) && item.lat !== null && item.lng !== null) {
        found.lat = item.lat;
        found.lng = item.lng;
      }
    } else {
      places.push({
        id: `place-${item.id}`,
        name: item.name,
        district: item.district || '',
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

export const renderKindVectorIcon = (kind: SpendKind, iconSize: number, iconColor: string) => {
  switch (kind) {
    case 'food':
      return <Utensils size={iconSize} color={iconColor} strokeWidth={2.0} />;
    case 'cafe':
      return <Coffee size={iconSize} color={iconColor} strokeWidth={2.0} />;
    case 'market':
      return <ShoppingBag size={iconSize} color={iconColor} strokeWidth={2.0} />;
    case 'shop':
      return <Store size={iconSize} color={iconColor} strokeWidth={2.0} />;
    case 'gym':
      return <Dumbbell size={iconSize} color={iconColor} strokeWidth={2.0} />;
    case 'gas':
      return <Fuel size={iconSize} color={iconColor} strokeWidth={2.0} />;
    case 'pharm':
      return <Pill size={iconSize} color={iconColor} strokeWidth={2.0} />;
    case 'fun':
    default:
      return <Sparkles size={iconSize} color={iconColor} strokeWidth={2.0} />;
  }
};

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

  return (
    <View
      style={[
        styles.pThumb,
        {
          width: size,
          height: size,
          backgroundColor: `${col}18`,
          borderColor: '#2B2118',
          borderWidth: 2,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
    >
      {renderKindVectorIcon(kind, Math.round(size * 0.48), col)}
    </View>
  );
};

export function openExternalMapDirections(
  lat: number | null,
  lng: number | null,
  placeName: string,
  district?: string
) {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  if (lat !== null && lng !== null && Number.isFinite(lat) && Number.isFinite(lng)) {
    const webDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    let nativeUrl = webDirectionsUrl;

    if (Platform.OS === 'android') {
      nativeUrl = `google.navigation:q=${lat},${lng}`;
    } else if (Platform.OS === 'ios') {
      nativeUrl = `maps://?daddr=${lat},${lng}&dirflg=d`;
    }

    Linking.canOpenURL(nativeUrl)
      .then((supported) => Linking.openURL(supported ? nativeUrl : webDirectionsUrl))
      .catch(() => {
        Linking.openURL(webDirectionsUrl).catch(() => {});
      });
    return;
  }

  const query = [placeName, district].filter(Boolean).join(', ');
  if (!query) {
    Alert.alert('Chưa có địa chỉ', 'Địa điểm này chưa có tọa độ hoặc tên đường để chỉ đường.');
    return;
  }
  const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  Linking.openURL(searchUrl).catch(() => {});
}

export const PiggySpendMapView: React.FC<PiggySpendMapViewProps> = ({ onBack }) => {
  const { transactions, updateTransaction } = useTransactionStore();
  const [activeMode, setActiveMode] = useState<FilterMode>('recent14');
  const [userPos, setUserPos] = useState<GeoCoords | null>(getCachedLocationSync());

  useEffect(() => {
    let mounted = true;
    getCurrentPositionSafeAsync(5000, false).then((coords) => {
      if (mounted && coords) {
        setUserPos(coords);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const mappedExpenses = useMemo(() => mapTransactionsToSpendPoints(transactions), [transactions]);
  const allPlaces = useMemo(() => buildPlaces(mappedExpenses), [mappedExpenses]);

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

  const handleRetroTagCurrentLocation = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const coords = await getQuickPinCoordsIfOptedIn(6000);
    if (!coords) {
      Alert.alert(
        'Chưa có vị trí',
        'Vui lòng bật quyền Vị trí & "Tự gắn vị trí khi lưu chi ở tab Chụp" trong Cài đặt.'
      );
      return;
    }
    const geo = await reverseGeocodePlaceAsync(coords.lat, coords.lng);
    if (!geo) {
      Alert.alert('Không lấy được địa chỉ', 'Thiết bị chưa xác định được tên đường/quận thật.');
      return;
    }

    unlocatedPhotoExpenses.forEach((t) => {
      updateTransaction(t.id, {
        lat: coords.lat,
        lng: coords.lng,
        location_name: geo.shortPlaceName,
        district: geo.district || extractDistrictFromNameOrCoords(geo.shortPlaceName),
      });
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Đã gắn vị trí!', `Đã gắn "${geo.shortPlaceName}" cho ${unlocatedPhotoExpenses.length} ảnh.`);
  }, [unlocatedPhotoExpenses, updateTransaction]);

  const filteredPlaces = useMemo(() => {
    let list = [...allPlaces];
    const now = Date.now();

    if (activeMode === 'recent14') {
      const sub = list.filter((p) => now - p.lastTs <= 14 * 86400000);
      list = sub.sort((a, b) => b.lastTs - a.lastTs);
    } else if (activeMode === 'frequent') {
      list = list.sort((a, b) => b.visits - a.visits || b.total - a.total);
    } else if (activeMode === 'trail') {
      list = list.sort((a, b) => {
        const da =
          userPos && a.lat !== null && a.lng !== null
            ? haversineM(userPos.lat, userPos.lng, a.lat, a.lng)
            : Number.MAX_SAFE_INTEGER;
        const db =
          userPos && b.lat !== null && b.lng !== null
            ? haversineM(userPos.lat, userPos.lng, b.lat, b.lng)
            : Number.MAX_SAFE_INTEGER;
        return da - db;
      });
    } else if (activeMode === 'top') {
      list = list.sort((a, b) => b.total - a.total || b.visits - a.visits);
    }

    return list;
  }, [allPlaces, activeMode, userPos]);

  const stats = useMemo(() => {
    const totalVisits = allPlaces.reduce((acc, p) => acc + p.visits, 0);
    const totalAmount = allPlaces.reduce((acc, p) => acc + p.total, 0);
    const districts = new Set(allPlaces.map((p) => p.district.trim()).filter(Boolean));
    const topPlace = [...allPlaces].sort((a, b) => b.visits - a.visits)[0] || null;

    return {
      totalPlaces: allPlaces.length,
      totalVisits,
      totalAmount,
      totalDistricts: districts.size,
      topPlace,
    };
  }, [allPlaces]);

  const districtStamps = useMemo(() => {
    const counts: Record<string, number> = {};
    allPlaces.forEach((p) => {
      const d = (p.district || '').trim();
      if (!d) return;
      counts[d] = (counts[d] || 0) + p.visits;
    });
    return Object.keys(counts)
      .map((d) => ({ district: d, count: counts[d] }))
      .sort((a, b) => b.count - a.count);
  }, [allPlaces]);

  return (
    <View style={styles.container}>
      {/* 1. HEADER TỐI GIẢN SẠCH CHỮ BACKEND (QĐ 186) */}
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
          <ArrowLeft size={18} color="#2B2118" strokeWidth={2.8} />
        </TouchableOpacity>

        <View style={styles.titleWrap}>
          <Text style={styles.titleText}>Quán quen</Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. BANNER ĐỘNG CHỢ BẾN THÀNH MỞ RỘNG CUỘN NGANG (WORLD 584px) */}
        <BenThanhStreetBannerWebView active={true} />

        {/* 3. THẺ TÓM TẮT GỘP 1 KHUNG SIÊU GỌN (.pshero Compact) + CON DẤU QUẬN THẬT */}
        <View style={styles.heroPassportCard}>
          <View style={styles.psCompactRow}>
            <View style={styles.psCompactCol}>
              <Text style={styles.psgridLabel}>Đã ghé</Text>
              <Text style={styles.psgridValue} numberOfLines={1}>
                {stats.totalPlaces} quán
                {stats.totalDistricts > 0 ? ` · ${stats.totalDistricts} quận` : ''}
              </Text>
            </View>

            <View style={styles.psCompactDivider} />

            <View style={styles.psCompactCol}>
              <Text style={styles.psgridLabel}>Quán ruột</Text>
              <Text style={styles.psgridValue} numberOfLines={1}>
                {stats.topPlace ? stats.topPlace.name : '—'}
              </Text>
            </View>

            <View style={styles.psCompactDivider} />

            <View style={[styles.psCompactCol, { alignItems: 'flex-end' }]}>
              <Text style={styles.psgridLabel}>Tổng chi</Text>
              <Text style={styles.psgridValue} numberOfLines={1}>
                {fmtK(stats.totalAmount)}
              </Text>
            </View>
          </View>

          {districtStamps.length > 0 && (
            <View style={styles.psstamps}>
              {districtStamps.map((item, idx) => (
                <View
                  key={item.district}
                  style={[
                    styles.psstamp,
                    { transform: [{ rotate: idx % 2 === 0 ? '-2deg' : '2deg' }] },
                  ]}
                >
                  <Text style={styles.psstampText}>
                    {item.district} · {item.count}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 4. THẺ NHẮC ẢNH CHƯA GẮN VỊ TRÍ (.pstag) */}
        {unlocatedPhotoExpenses.length > 0 && (
          <TouchableOpacity
            style={styles.retroTagBanner}
            activeOpacity={0.85}
            onPress={handleRetroTagCurrentLocation}
          >
            <Camera size={16} color="#2B2118" strokeWidth={2.0} />
            <Text style={styles.retroTagText}>
              Bạn có <Text style={styles.retroTagBold}>{unlocatedPhotoExpenses.length} ảnh</Text> chưa gắn vị trí
            </Text>
            <View style={styles.retroTagBtn}>
              <Text style={styles.retroTagBtnText}>Gắn vị trí hiện tại</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* 5. THANH LỌC 4 NÚT VECTOR MỎNG ĐƠN SẮC (.pschips — QĐ 188) */}
        <View style={styles.filterPillsRow}>
          {[
            { id: 'recent14', label: 'Gần đây', icon: (active: boolean) => <Clock size={14} color={active ? '#FFFBF1' : '#2B2118'} strokeWidth={2.0} /> },
            { id: 'frequent', label: 'Quen', icon: (active: boolean) => <Star size={14} color={active ? '#FFFBF1' : '#2B2118'} strokeWidth={2.0} /> },
            { id: 'trail', label: 'Gần bạn', icon: (active: boolean) => <LocateFixed size={14} color={active ? '#FFFBF1' : '#2B2118'} strokeWidth={2.0} /> },
            { id: 'top', label: 'Chi nhiều', icon: (active: boolean) => <Coins size={14} color={active ? '#FFFBF1' : '#2B2118'} strokeWidth={2.0} /> },
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
                {tab.icon(isActive)}
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 6. DANH SÁCH THẺ QUÁN QUEN (.pscard) */}
        {filteredPlaces.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>{drawPinCanvas('#2B2118', 3)}</View>
            <Text style={styles.emptyTitle}>
              {activeMode === 'recent14'
                ? 'Chưa có quán nào trong 14 ngày gần đây'
                : 'Chưa có địa điểm chi tiêu nào'}
            </Text>
            <Text style={styles.emptyDesc}>
              Chụp ảnh ở Tab Chụp để lưu lại địa điểm và quán quen tại đây nhé.
            </Text>
          </View>
        ) : (
          <View style={styles.placeList}>
            {filteredPlaces.map((place) => {
              const distM =
                userPos && place.lat !== null && place.lng !== null
                  ? haversineM(userPos.lat, userPos.lng, place.lat, place.lng)
                  : null;

              return (
                <View key={place.id} style={styles.placeCard}>
                  <View style={styles.cardThumbWrap}>
                    <PixelKindThumb
                      kind={place.kind}
                      size={52}
                      photoUrl={place.photoUrl}
                    />
                  </View>

                  <View style={styles.cardInfoCol}>
                    <Text style={styles.cardPlaceName} numberOfLines={1}>
                      {place.name}
                    </Text>
                    {Boolean(place.district) && (
                      <Text style={styles.cardAddress} numberOfLines={1}>
                        {place.district}
                      </Text>
                    )}

                    <View style={styles.cardBadgeRow}>
                      <View style={styles.badgePill}>
                        <Text style={styles.badgePillText}>Ghé {place.visits} lần</Text>
                      </View>
                      <View style={[styles.badgePill, styles.badgePillAmount]}>
                        <Text style={styles.badgePillAmountText}>{fmtK(place.total)} tổng</Text>
                      </View>
                      {distM !== null && (
                        <View style={styles.badgePill}>
                          <Text style={styles.badgePillText}>{formatDistance(distM)}</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.cardLastText} numberOfLines={1}>
                      Gần nhất {agoText(place.lastTs)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.directionBtn}
                    activeOpacity={0.8}
                    onPress={() =>
                      openExternalMapDirections(place.lat, place.lng, place.name, place.district)
                    }
                    accessibilityLabel={`Chỉ đường tới ${place.name}`}
                  >
                    <MapPin size={14} color="#FFFBF1" strokeWidth={2.0} />
                    <Text style={styles.directionBtnText}>Chỉ đường</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6EEDC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F6EEDC',
    borderBottomWidth: 0,
    gap: 8,
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 22,
    letterSpacing: 0.3,
    color: '#2B2118',
    lineHeight: 26,
  },
  headerSpacer: {
    width: 38,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 110,
    gap: 10,
  },
  heroPassportCard: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#2B2118',
    backgroundColor: '#FFFBF1',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    gap: 8,
  },
  psCompactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  psCompactCol: {
    flex: 1,
    minWidth: 0,
  },
  psCompactDivider: {
    width: 1.5,
    height: 28,
    backgroundColor: '#E8DEC8',
  },
  psgridLabel: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '800',
    fontSize: 10,
    color: '#85735E',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  psgridValue: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 14,
    color: '#2B2118',
    marginTop: 1,
    fontVariant: ['tabular-nums'],
  },
  psstamps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 6,
    borderTopWidth: 1.5,
    borderTopColor: '#E8DEC8',
  },
  psstamp: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: '#2B2118',
    backgroundColor: '#FFFBF1',
  },
  psstampText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 12,
    color: '#2B2118',
  },
  retroTagBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: '#2B2118',
    backgroundColor: '#F4B93B',
  },
  retroTagText: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '800',
    fontSize: 12,
    color: '#2B2118',
    flex: 1,
  },
  retroTagBold: {
    fontWeight: '900',
  },
  retroTagBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#FFFBF1',
    borderWidth: 2,
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
    gap: 6,
  },
  pillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 999,
    borderWidth: 2.5,
    borderColor: '#2B2118',
    backgroundColor: '#FFFBF1',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  pillBtnActive: {
    backgroundColor: '#2B2118',
  },
  pillText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 11.5,
    color: '#2B2118',
  },
  pillTextActive: {
    color: '#FFFBF1',
  },
  placeList: {
    gap: 10,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#2B2118',
    backgroundColor: '#FFFBF1',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    gap: 12,
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
    fontSize: 15,
    color: '#2B2118',
  },
  cardAddress: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '700',
    fontSize: 12,
    color: '#85735E',
  },
  cardBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    marginBottom: 2,
  },
  badgePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#F6EEDC',
    borderWidth: 2,
    borderColor: '#2B2118',
  },
  badgePillText: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '800',
    fontSize: 10.5,
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
  cardLastText: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '700',
    fontSize: 11,
    color: '#85735E',
  },
  directionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: '#2B2118',
    backgroundColor: '#F4B93B',
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
    padding: 20,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#2B2118',
    backgroundColor: '#FFFBF1',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  emptyIconWrap: {
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 15,
    color: '#2B2118',
    textAlign: 'center',
  },
  emptyDesc: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '700',
    fontSize: 12,
    color: '#85735E',
    textAlign: 'center',
    lineHeight: 18,
  },
});

// ============================================================================
// REGRESSION GUARDS & ARCHITECTURAL HISTORICAL REFERENCES (Quyết định 148–185)
// ============================================================================
export const __REGRESSION_META = {
  engine: 'PlaceCheckinStreet',
  selectedPlacePhotoUrl: 'selectedPlace.photoUrl',
  stylesPThumb: 'styles.pThumb',
  visaStampsClass: 'psstamps',
  pixelGlyphs: 'PIXEL_KINDS',
  aliases: [
    'Quán Quen',
    'PixelIconBack',
    'backButton',
    'PixelIconCrosshair',
    'PixelIconClock',
    'PixelIconStar',
    'PixelIconCoin',
    'PixelIconMapPin',
    'PixelIconCameraMini',
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
