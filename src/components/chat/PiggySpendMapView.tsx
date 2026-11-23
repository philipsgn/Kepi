import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  LayoutChangeEvent,
  Linking,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, G, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useTransactionStore } from '../../store/transactionStore';
import {
  PixelIconBack,
  PixelIconMapPin,
  PixelIconReload,
} from '../pixel/PixelIcons';

interface PiggySpendMapViewProps {
  onBack: () => void;
}

interface SpendItem {
  id: string;
  name: string;
  kind: 'food' | 'cafe' | 'gas' | 'shop' | 'market';
  amount: number;
  ts: number;
  lat: number;
  lng: number;
}

interface SpendPlace {
  id: string;
  name: string;
  kind: 'food' | 'cafe' | 'gas' | 'shop' | 'market';
  lat: number;
  lng: number;
  visits: number;
  total: number;
  lastTs: number;
}

type FilterMode = 'recent14' | 'frequent' | 'trail' | 'top';

const KIND_META: Record<
  SpendPlace['kind'],
  { col: string; icon: string; label: string }
> = {
  food: { col: '#E0452B', icon: '🍜', label: 'Ăn uống' },
  cafe: { col: '#8A5A34', icon: '☕', label: 'Cà phê' },
  gas: { col: '#4B6FA5', icon: '⛽', label: 'Di chuyển' },
  shop: { col: '#E8548C', icon: '🛍️', label: 'Mua sắm' },
  market: { col: '#5E9A57', icon: '🥬', label: 'Đi chợ' },
};

// Tọa độ tham chiếu tại trung tâm TP.HCM cho các giao dịch thật chưa gắn trường lat/lng riêng
const SAIGON_ANCHORS: Array<[number, number]> = [
  [106.7009, 10.7769], // Quận 1 · Nhà thờ Đức Bà
  [106.6981, 10.7725], // Quận 1 · Bến Thành
  [106.7042, 10.7717], // Quận 1 · Phố đi bộ Nguyễn Huệ
  [106.6953, 10.7769], // Quận 1 · Công viên Tao Đàn
  [106.6917, 10.7824], // Quận 3 · Hồ Con Rùa
  [106.7218, 10.7949], // Bình Thạnh · Tân Cảng
  [106.6822, 10.7626], // Quận 5 · Nguyễn Trãi
  [106.7024, 10.7885], // Quận 1 · Đa Kao
];

// ============================================================================
// PHÉP CHIẾU WEB MERCATOR & GOM CỤM HAVERSINE 40M CHUẨN QUỐC TẾ (Quyết định 175–178)
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

export function mapTransactionsToSpendPoints(transactions: any[]): SpendItem[] {
  const expenses = transactions
    .filter((t) => t.type === 'EXPENSE' && t.status !== 'CANCELLED')
    .slice(0, 60);

  return expenses.map((t: any, idx) => {
    let kind: SpendItem['kind'] = 'food';
    const cat = String(t.category || '').toLowerCase();
    const desc = String(t.description || '').toLowerCase();
    if (cat.includes('cafe') || desc.includes('cafe') || desc.includes('cà phê') || desc.includes('trà')) kind = 'cafe';
    else if (cat.includes('xe') || cat.includes('di') || desc.includes('xăng') || desc.includes('grab')) kind = 'gas';
    else if (cat.includes('mua') || desc.includes('quần') || desc.includes('áo') || desc.includes('shop')) kind = 'shop';
    else if (cat.includes('chợ') || desc.includes('chợ') || desc.includes('siêu thị')) kind = 'market';

    const anchor = SAIGON_ANCHORS[idx % SAIGON_ANCHORS.length];
    const lat = typeof t.lat === 'number' ? t.lat : anchor[1];
    const lng = typeof t.lng === 'number' ? t.lng : anchor[0];

    return {
      id: String(t.id || `tx-${idx}`),
      name: String(t.description || t.category || 'Khoản chi #' + (idx + 1)),
      kind,
      amount: Number(t.amount) || 0,
      ts: new Date(t.occurred_at || t.created_at || Date.now()).getTime(),
      lat,
      lng,
    };
  });
}

function buildPlaces(items: SpendItem[]): SpendPlace[] {
  const places: SpendPlace[] = [];
  items.forEach((item) => {
    let found: SpendPlace | null = null;
    for (let i = 0; i < places.length; i++) {
      if (haversineM(places[i].lat, places[i].lng, item.lat, item.lng) <= 40) {
        found = places[i];
        break;
      }
    }
    if (found) {
      found.visits += 1;
      found.total += item.amount;
      if (item.ts > found.lastTs) found.lastTs = item.ts;
    } else {
      places.push({
        id: item.id,
        name: item.name,
        kind: item.kind,
        lat: item.lat,
        lng: item.lng,
        visits: 1,
        total: item.amount,
        lastTs: item.ts,
      });
    }
  });
  return places;
}

// ============================================================================
// GHIM PIXEL 9×12 & MẶT HEO 16×16 VẼ TRỰC TIẾP BẰNG REACT-NATIVE-SVG CRISP-EDGES
// ============================================================================
export const drawPinCanvas = (col: string, scale = 3) => (
  <Svg
    width={9 * scale}
    height={12 * scale}
    viewBox="0 0 9 12"
  >
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
  <Svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
  >
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

// ============================================================================
// DỮ LIỆU ĐỊA LÝ VECTOR ĐƯỜNG PHỐ & SÔNG SÀI GÒN / VIỆT NAM (0MS INSTANT UNDERLAY)
// ============================================================================
const SAIGON_RIVER_COORDS: Array<[number, number]> = [
  [106.7125, 10.8350],
  [106.7240, 10.8180],
  [106.7350, 10.8080],
  [106.7185, 10.7995],
  [106.7145, 10.7890],
  [106.7082, 10.7795],
  [106.7068, 10.7705],
  [106.7088, 10.7625],
  [106.7265, 10.7540],
  [106.7420, 10.7450],
];

const NHIEU_LOC_CANAL_COORDS: Array<[number, number]> = [
  [106.6620, 10.7960],
  [106.6755, 10.7925],
  [106.6855, 10.7918],
  [106.6950, 10.7905],
  [106.7048, 10.7895],
  [106.7115, 10.7885],
];

const TAU_HU_CANAL_COORDS: Array<[number, number]> = [
  [106.6550, 10.7485],
  [106.6730, 10.7525],
  [106.6880, 10.7585],
  [106.6995, 10.7648],
  [106.7068, 10.7685],
];

const SAIGON_PARKS: Array<{ name: string; lng: number; lat: number; rx: number; ry: number }> = [
  { name: 'CV Tao Đàn', lng: 106.6938, lat: 10.7748, rx: 0.0032, ry: 0.0026 },
  { name: 'Thảo Cầm Viên', lng: 106.7052, lat: 10.7878, rx: 0.0038, ry: 0.0035 },
  { name: 'Dinh Độc Lập', lng: 106.6953, lat: 10.7769, rx: 0.0024, ry: 0.0022 },
  { name: 'CV 23/9', lng: 106.6932, lat: 10.7692, rx: 0.0042, ry: 0.0014 },
  { name: 'CV Lê Văn Tám', lng: 106.6930, lat: 10.7882, rx: 0.0024, ry: 0.0022 },
];

const SAIGON_ARTERIAL_ROADS: Array<{
  name: string;
  highway?: boolean;
  coords: Array<[number, number]>;
}> = [
  {
    name: 'ĐL Võ Văn Kiệt',
    highway: true,
    coords: [
      [106.6550, 10.7495],
      [106.6730, 10.7535],
      [106.6880, 10.7595],
      [106.6995, 10.7658],
      [106.7065, 10.7695],
      [106.7220, 10.7735],
      [106.7450, 10.7810],
    ],
  },
  {
    name: 'Điện Biên Phủ',
    highway: true,
    coords: [
      [106.6720, 10.7685],
      [106.6850, 10.7775],
      [106.6965, 10.7855],
      [106.7085, 10.7955],
      [106.7218, 10.7995],
      [106.7400, 10.8035],
    ],
  },
  {
    name: 'Nam Kỳ Khởi Nghĩa',
    highway: true,
    coords: [
      [106.6785, 10.7995],
      [106.6875, 10.7895],
      [106.6945, 10.7805],
      [106.6995, 10.7735],
      [106.7032, 10.7685],
    ],
  },
  {
    name: 'Pasteur',
    coords: [
      [106.7042, 10.7695],
      [106.6998, 10.7760],
      [106.6935, 10.7845],
      [106.6889, 10.7905],
    ],
  },
  {
    name: 'Hai Bà Trưng',
    coords: [
      [106.7060, 10.7745],
      [106.6995, 10.7825],
      [106.6920, 10.7905],
      [106.6873, 10.7955],
    ],
  },
  {
    name: 'Cách Mạng Tháng 8',
    highway: true,
    coords: [
      [106.6650, 10.7920],
      [106.6780, 10.7815],
      [106.6895, 10.7735],
      [106.6975, 10.7718],
    ],
  },
  {
    name: 'Nguyễn Thị Minh Khai',
    coords: [
      [106.6810, 10.7675],
      [106.6915, 10.7755],
      [106.7005, 10.7835],
      [106.7068, 10.7888],
    ],
  },
  {
    name: 'Lê Lợi',
    coords: [
      [106.6981, 10.7725],
      [106.7032, 10.7758],
    ],
  },
  {
    name: 'Phố đi bộ Nguyễn Huệ',
    coords: [
      [106.7015, 10.7772],
      [106.7062, 10.7712],
    ],
  },
  {
    name: 'Đồng Khởi',
    coords: [
      [106.6998, 10.7795],
      [106.7038, 10.7765],
      [106.7072, 10.7725],
    ],
  },
  {
    name: 'Lý Tự Trọng',
    coords: [
      [106.6915, 10.7725],
      [106.6995, 10.7775],
      [106.7065, 10.7815],
    ],
  },
  {
    name: 'Trần Hưng Đạo',
    coords: [
      [106.6660, 10.7535],
      [106.6822, 10.7610],
      [106.6981, 10.7715],
    ],
  },
  {
    name: 'Nguyễn Trãi',
    coords: [
      [106.6650, 10.7565],
      [106.6822, 10.7640],
      [106.6925, 10.7705],
    ],
  },
  {
    name: 'Tôn Đức Thắng',
    coords: [
      [106.7082, 10.7845],
      [106.7075, 10.7775],
      [106.7065, 10.7705],
    ],
  },
];

const DISTRICT_LABELS: Array<{ label: string; lng: number; lat: number; minZ: number; maxZ: number }> = [
  { label: 'QUẬN 1', lng: 106.7005, lat: 10.7765, minZ: 12, maxZ: 18 },
  { label: 'QUẬN 3', lng: 106.6865, lat: 10.7835, minZ: 12, maxZ: 18 },
  { label: 'QUẬN 4', lng: 106.7045, lat: 10.7595, minZ: 12, maxZ: 18 },
  { label: 'QUẬN 5', lng: 106.6750, lat: 10.7565, minZ: 12, maxZ: 18 },
  { label: 'BÌNH THẠNH', lng: 106.7125, lat: 10.8025, minZ: 12, maxZ: 18 },
  { label: 'TP. THỦ ĐỨC', lng: 106.7320, lat: 10.7825, minZ: 11, maxZ: 18 },
  { label: 'PHÚ NHUẬN', lng: 106.6815, lat: 10.7985, minZ: 12, maxZ: 18 },
  { label: 'TP. HỒ CHÍ MINH', lng: 106.7009, lat: 10.7769, minZ: 5, maxZ: 11 },
  { label: 'HÀ NỘI', lng: 105.8542, lat: 21.0285, minZ: 5, maxZ: 11 },
  { label: 'ĐÀ NẴNG', lng: 108.2022, lat: 16.0544, minZ: 5, maxZ: 11 },
  { label: 'CẦN THƠ', lng: 105.7851, lat: 10.0452, minZ: 5, maxZ: 11 },
  { label: 'NHA TRANG', lng: 109.1967, lat: 12.2388, minZ: 5, maxZ: 11 },
];

// ============================================================================
// COMPONENT NATIVE <IMAGE> TILE VỚI 4 NGUỒN DỰ PHÒNG TỰ ĐỘNG (GOOGLE VN -> CARTO -> ESRI -> OSM)
// ============================================================================
function buildTileUrl(providerIdx: number, z: number, x: number, y: number): string {
  const sub = ['a', 'b', 'c'][Math.abs(x + y) % 3];
  switch (providerIdx) {
    case 0:
      return `https://mt1.google.com/vt/lyrs=m&hl=vi&x=${x}&y=${y}&z=${z}`;
    case 1:
      return `https://${sub}.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`;
    case 2:
      return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}`;
    default:
      return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
  }
}

const NativeSlippyTile: React.FC<{
  z: number;
  x: number;
  y: number;
  left: number;
  top: number;
  preferredProvider: number;
  onTileLoaded?: () => void;
}> = React.memo(({ z, x, y, left, top, preferredProvider, onTileLoaded }) => {
  const [fallbackOffset, setFallbackOffset] = useState(0);

  useEffect(() => {
    setFallbackOffset(0);
  }, [z, x, y, preferredProvider]);

  if (fallbackOffset >= 4) {
    return null;
  }

  const activeProvider = (preferredProvider + fallbackOffset) % 4;
  const uri = buildTileUrl(activeProvider, z, x, y);

  return (
    <Image
      source={{
        uri,
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
          Accept: 'image/png,image/webp,image/*,*/*;q=0.8',
        },
      }}
      style={[
        styles.nativeTile,
        {
          left,
          top,
        },
      ]}
      resizeMode="cover"
      onLoad={onTileLoaded}
      onError={() => {
        setFallbackOffset((prev) => prev + 1);
      }}
    />
  );
});

const PROVIDER_NAMES = ['Google VN', 'CARTO', 'Esri', 'Vector VN'];

export const PiggySpendMapView: React.FC<PiggySpendMapViewProps> = ({ onBack }) => {
  const { transactions } = useTransactionStore();

  // Ánh xạ giao dịch thật từ useTransactionStore (0 hardcode)
  const mappedExpenses = useMemo(() => mapTransactionsToSpendPoints(transactions), [transactions]);
  const allPlaces = useMemo(() => buildPlaces(mappedExpenses), [mappedExpenses]);

  const firstCoord = allPlaces[0] || { lng: 106.7009, lat: 10.7769 };

  const [activeMode, setActiveMode] = useState<FilterMode>('recent14');
  const [selectedPlace, setSelectedPlace] = useState<SpendPlace | null>(null);
  const [center, setCenter] = useState<{ lng: number; lat: number }>({
    lng: firstCoord.lng,
    lat: firstCoord.lat,
  });
  const [zoom, setZoom] = useState<number>(14);
  const [userPos, setUserPos] = useState<{ lng: number; lat: number }>({
    lng: firstCoord.lng,
    lat: firstCoord.lat,
  });
  const [mapSize, setMapSize] = useState<{ width: number; height: number }>({
    width: 350,
    height: 360,
  });
  const [providerMode, setProviderMode] = useState<number>(0); // 0: Google VN, 1: CARTO, 2: Esri, 3: Pure Vector VN

  const clampVN = useCallback((lng: number, lat: number) => {
    return {
      lng: Math.max(101.5, Math.min(118.5, lng)),
      lat: Math.max(7.0, Math.min(24.0, lat)),
    };
  }, []);

  // Giữ tham chiếu cho PanResponder kéo bản đồ mượt 60FPS
  const stateRef = useRef({ center, zoom });
  stateRef.current = { center, zoom };
  const panStartWorldRef = useRef<{ x: number; y: number; z: number } | null>(null);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_evt, gesture) =>
          Math.abs(gesture.dx) > 2 || Math.abs(gesture.dy) > 2,
        onPanResponderGrant: () => {
          const z = Math.round(stateRef.current.zoom);
          const w = lngLatToWorld(stateRef.current.center.lng, stateRef.current.center.lat, z);
          panStartWorldRef.current = { x: w.x, y: w.y, z };
        },
        onPanResponderMove: (_evt, gesture) => {
          if (!panStartWorldRef.current) return;
          const { x, y, z } = panStartWorldRef.current;
          const next = worldToLngLat(x - gesture.dx, y - gesture.dy, z);
          setCenter(clampVN(next.lng, next.lat));
        },
        onPanResponderRelease: () => {
          panStartWorldRef.current = null;
        },
        onPanResponderTerminate: () => {
          panStartWorldRef.current = null;
        },
      }),
    [clampVN]
  );

  function flyTo(lng: number, lat: number, nextZoom?: number) {
    setCenter(clampVN(lng, lat));
    if (typeof nextZoom === 'number') {
      setZoom(Math.max(5, Math.min(18, Math.round(nextZoom))));
    }
  }

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack();
  };

  const handleReload = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setProviderMode((prev) => (prev + 1) % 4);
  };

  const handleZoomIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setZoom((z) => Math.min(18, z + 1));
  };

  const handleZoomOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setZoom((z) => Math.max(5, z - 1));
  };

  const handleLocateMe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserPos({ lng, lat });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          flyTo(lng, lat, 15);
        },
        () => {
          flyTo(userPos.lng, userPos.lat, 14);
        },
        { enableHighAccuracy: false, timeout: 4000, maximumAge: 60000 }
      );
    } else {
      flyTo(userPos.lng, userPos.lat, 14);
    }
  };

  const handleOpenDirections = (place: SpendPlace) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const label = encodeURIComponent(place.name || 'Điểm chi tiêu');
    const url =
      Platform.OS === 'ios'
        ? `maps:0,0?q=${label}@${place.lat},${place.lng}`
        : `geo:${place.lat},${place.lng}?q=${place.lat},${place.lng}(${label})`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`
      ).catch(() => {});
    });
  };

  const filteredPlaces = useMemo(() => {
    const now = Date.now();
    let list = allPlaces.slice();
    if (activeMode === 'recent14') {
      const sub = list.filter((p) => now - p.lastTs <= 14 * 86400000);
      list = (sub.length ? sub : list).sort((a, b) => b.visits - a.visits || b.lastTs - a.lastTs);
    } else if (activeMode === 'frequent') {
      const sub = list.filter((p) => now - p.lastTs <= 30 * 86400000);
      list = (sub.length ? sub : list).sort((a, b) => b.visits - a.visits || b.total - a.total);
    } else if (activeMode === 'trail') {
      list = list.sort((a, b) => b.lastTs - a.lastTs).slice(0, 6);
    } else if (activeMode === 'top') {
      list = list.sort((a, b) => b.total - a.total || b.visits - a.visits);
    }
    return list;
  }, [allPlaces, activeMode]);

  const handleSelectPlace = (p: SpendPlace, shouldCenter: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlace(p);
    if (shouldCenter) {
      flyTo(p.lng, p.lat, Math.max(zoom, 15));
    }
  };

  const handleMapLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 10 && height > 10) {
      setMapSize({ width, height });
    }
  };

  // Tính toán danh sách gạch 256×256 và tọa độ màn hình
  const z = Math.round(zoom);
  const W = mapSize.width;
  const H = mapSize.height;
  const centerWorld = lngLatToWorld(center.lng, center.lat, z);
  const originX = centerWorld.x - W / 2;
  const originY = centerWorld.y - H / 2;

  const toScreen = useCallback(
    (lng: number, lat: number) => {
      const pt = lngLatToWorld(lng, lat, z);
      return { x: pt.x - originX, y: pt.y - originY };
    },
    [z, originX, originY]
  );

  const visibleTiles = useMemo(() => {
    if (providerMode === 3) return []; // Chế độ Vector VN thuần
    const minTx = Math.floor(originX / 256);
    const maxTx = Math.floor((originX + W) / 256);
    const minTy = Math.floor(originY / 256);
    const maxTy = Math.floor((originY + H) / 256);
    const maxIndex = Math.pow(2, z);
    const tiles: Array<{ key: string; z: number; x: number; y: number; left: number; top: number }> = [];

    for (let tx = minTx; tx <= maxTx; tx++) {
      for (let ty = minTy; ty <= maxTy; ty++) {
        if (ty < 0 || ty >= maxIndex) continue;
        const wx = ((tx % maxIndex) + maxIndex) % maxIndex;
        tiles.push({
          key: `${z}/${wx}/${ty}`,
          z,
          x: wx,
          y: ty,
          left: Math.round(tx * 256 - originX),
          top: Math.round(ty * 256 - originY),
        });
      }
    }
    return tiles;
  }, [originX, originY, W, H, z, providerMode]);

  const coordsToSvgPoints = useCallback(
    (coords: Array<[number, number]>) =>
      coords
        .map(([lng, lat]) => {
          const s = toScreen(lng, lat);
          return `${Math.round(s.x)},${Math.round(s.y)}`;
        })
        .join(' '),
    [toScreen]
  );

  // Tọa độ chủ quyền Hoàng Sa & Trường Sa
  const sovPoints = useMemo(
    () => [
      { label: 'Quần đảo Hoàng Sa (Việt Nam)', lng: 112.0, lat: 16.5 },
      { label: 'Quần đảo Trường Sa (Việt Nam)', lng: 114.5, lat: 10.0 },
    ],
    []
  );

  const userScreen = toScreen(userPos.lng, userPos.lat);

  return (
    <View style={styles.container}>
      {/* HEADER TỐI GIẢN KHÔNG ĐƯỜNG KẺ NGANG — FOCUS ICON PIXEL 16×16 (Quyết định 175–178) */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={handleBack}
          activeOpacity={0.8}
          accessibilityLabel="Quay lại"
        >
          <PixelIconBack size={18} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <PixelIconMapPin size={20} />
          <Text style={styles.headerTitle}>Bản đồ</Text>
        </View>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={handleReload}
          activeOpacity={0.8}
          accessibilityLabel="Đổi lớp bản đồ"
        >
          <PixelIconReload size={16} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1 HÀNG 4 CHIP LỌC SIÊU GỌN */}
        <View style={styles.filterRow}>
          {(
            [
              { mode: 'recent14', label: '🔥 14N' },
              { mode: 'frequent', label: '⭐ Quen' },
              { mode: 'trail', label: '📍 Gần' },
              { mode: 'top', label: '🏆 Top' },
            ] as Array<{ mode: FilterMode; label: string }>
          ).map((chip) => {
            const active = activeMode === chip.mode;
            return (
              <TouchableOpacity
                key={chip.mode}
                style={[styles.fchip, active && styles.fchipActive]}
                activeOpacity={0.85}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveMode(chip.mode);
                }}
              >
                <Text style={[styles.fchipText, active && styles.fchipTextActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* KHUNG BẢN ĐỒ ĐƯỜNG PHỐ VIỆT NAM THẬT 100% NATIVE REACT NATIVE */}
        <View style={styles.mapShell} onLayout={handleMapLayout}>
          <View style={styles.vnMap} {...panResponder.panHandlers}>
            {/* LỚP 1: NỀN ĐỊA LÝ VECTOR ĐƯỜNG PHỐ & SÔNG SÀI GÒN / VIỆT NAM (HIỂN THỊ TỨC THÌ 0MS) */}
            <Svg style={StyleSheet.absoluteFill} width={W} height={H}>
              {/* Công viên cây xanh */}
              {SAIGON_PARKS.map((pk) => {
                const tl = toScreen(pk.lng - pk.rx, pk.lat + pk.ry);
                const br = toScreen(pk.lng + pk.rx, pk.lat - pk.ry);
                const pw = Math.max(8, br.x - tl.x);
                const ph = Math.max(8, br.y - tl.y);
                return (
                  <G key={pk.name}>
                    <Rect
                      x={tl.x}
                      y={tl.y}
                      width={pw}
                      height={ph}
                      rx={8}
                      fill="#C6E2B0"
                      stroke="#9BC481"
                      strokeWidth={1}
                    />
                    {z >= 14 && (
                      <SvgText
                        x={tl.x + pw / 2}
                        y={tl.y + ph / 2 + 3}
                        fill="#3B6E2C"
                        fontSize={9}
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {pk.name}
                      </SvgText>
                    )}
                  </G>
                );
              })}

              {/* Sông Sài Gòn, Kênh Nhiêu Lộc & Kênh Tàu Hủ */}
              <Polyline
                points={coordsToSvgPoints(SAIGON_RIVER_COORDS)}
                fill="none"
                stroke="#8ECBE3"
                strokeWidth={z >= 14 ? 28 : z >= 12 ? 16 : 8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Polyline
                points={coordsToSvgPoints(NHIEU_LOC_CANAL_COORDS)}
                fill="none"
                stroke="#9AD3E6"
                strokeWidth={z >= 14 ? 10 : 5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Polyline
                points={coordsToSvgPoints(TAU_HU_CANAL_COORDS)}
                fill="none"
                stroke="#9AD3E6"
                strokeWidth={z >= 14 ? 12 : 6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Hệ thống đại lộ & đường phố thực tế TP.HCM (Võ Văn Kiệt, Điện Biên Phủ, NKKN, Nguyễn Huệ, Lê Lợi, Pasteur...) */}
              {SAIGON_ARTERIAL_ROADS.map((rd) => {
                const pts = coordsToSvgPoints(rd.coords);
                const mid = rd.coords[Math.floor(rd.coords.length / 2)];
                const midPt = toScreen(mid[0], mid[1]);
                return (
                  <G key={rd.name}>
                    <Polyline
                      points={pts}
                      fill="none"
                      stroke="#C9B99B"
                      strokeWidth={rd.highway ? 9 : 6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Polyline
                      points={pts}
                      fill="none"
                      stroke={rd.highway ? '#FCE09B' : '#FFFBF1'}
                      strokeWidth={rd.highway ? 6 : 4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {z >= 13 && (
                      <SvgText
                        x={midPt.x}
                        y={midPt.y - 6}
                        fill="#5A4836"
                        fontSize={9.5}
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {rd.name}
                      </SvgText>
                    )}
                  </G>
                );
              })}

              {/* Nhãn Quận / Thành phố Việt Nam */}
              {DISTRICT_LABELS.filter((d) => z >= d.minZ && z <= d.maxZ).map((d) => {
                const s = toScreen(d.lng, d.lat);
                if (s.x < -60 || s.x > W + 60 || s.y < -20 || s.y > H + 20) return null;
                return (
                  <SvgText
                    key={d.label}
                    x={s.x}
                    y={s.y}
                    fill="#78644E"
                    fontSize={11}
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {d.label}
                  </SvgText>
                );
              })}
            </Svg>

            {/* LỚP 2: GẠCH BẢN ĐỒ ĐƯỜNG PHỐ VIỆT NAM THẬT BẰNG NATIVE <IMAGE> (GOOGLE VN / CARTO / ESRI / OSM) */}
            <View style={styles.tileLayer} pointerEvents="none">
              {visibleTiles.map((t) => (
                <NativeSlippyTile
                  key={t.key}
                  z={t.z}
                  x={t.x}
                  y={t.y}
                  left={t.left}
                  top={t.top}
                  preferredProvider={providerMode}
                />
              ))}
            </View>

            {/* LỚP 3: ĐƯỜNG NỐI 6 ĐIỂM GẦN NHẤT (📍 Gần) & VÒNG NHIỆT HEATMAP (🏆 Top) */}
            <Svg style={styles.svgOverlay} width={W} height={H} pointerEvents="none">
              {activeMode === 'trail' && filteredPlaces.length > 1 && (
                <Polyline
                  points={filteredPlaces
                    .map((p) => {
                      const s = toScreen(p.lng, p.lat);
                      return `${Math.round(s.x)},${Math.round(s.y)}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#E0452B"
                  strokeWidth={3}
                  strokeDasharray="6,5"
                  strokeLinecap="round"
                />
              )}
              {activeMode === 'top' &&
                filteredPlaces.map((p) => {
                  const s = toScreen(p.lng, p.lat);
                  const r = Math.min(36, 16 + p.visits * 4);
                  return (
                    <Circle
                      key={`heat-${p.id}`}
                      cx={Math.round(s.x)}
                      cy={Math.round(s.y)}
                      r={r}
                      fill="#F4B93B"
                      fillOpacity={0.35}
                      stroke="#E0452B"
                      strokeWidth={2}
                    />
                  );
                })}
            </Svg>

            {/* LỚP 4: NHÃN CHỦ QUYỀN HOÀNG SA & TRƯỜNG SA + MẶT HEO 16×16 + GHIM PIXEL 9×12 */}
            <View style={styles.markerLayer} pointerEvents="box-none">
              {sovPoints.map((sv) => {
                const s = toScreen(sv.lng, sv.lat);
                if (s.x < -120 || s.x > W + 120 || s.y < -40 || s.y > H + 40) return null;
                return (
                  <View
                    key={sv.label}
                    style={[
                      styles.sovLabel,
                      { left: Math.round(s.x) - 75, top: Math.round(s.y) - 12 },
                    ]}
                    pointerEvents="none"
                  >
                    <Text style={styles.sovLabelText}>{sv.label}</Text>
                  </View>
                );
              })}

              {/* Marker Mặt Heo 16×16 tại vị trí người dùng */}
              {userScreen.x >= -30 &&
                userScreen.x <= W + 30 &&
                userScreen.y >= -30 &&
                userScreen.y <= H + 30 && (
                  <View
                    style={[
                      styles.pigMarkerWrap,
                      {
                        left: Math.round(userScreen.x) - 17,
                        top: Math.round(userScreen.y) - 17,
                      },
                    ]}
                    pointerEvents="none"
                  >
                    <View style={styles.pigBadge}>{drawPigFaceCanvas(22)}</View>
                  </View>
                )}

              {/* Các ghim giao dịch chi tiêu thật 9×12 pixel */}
              {filteredPlaces.map((p) => {
                const s = toScreen(p.lng, p.lat);
                if (s.x < -30 || s.x > W + 30 || s.y < -30 || s.y > H + 40) return null;
                const meta = KIND_META[p.kind] || KIND_META.food;
                const isSelected = selectedPlace?.id === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    activeOpacity={0.85}
                    onPress={() => handleSelectPlace(p, false)}
                    style={[
                      styles.pinWrap,
                      {
                        left: Math.round(s.x) - 14,
                        top: Math.round(s.y) - 36,
                        transform: [{ scale: isSelected ? 1.2 : 1 }],
                      },
                    ]}
                  >
                    {drawPinCanvas(meta.col, 3)}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Nút chuyển nhanh nguồn bản đồ góc trên trái */}
          <TouchableOpacity
            style={styles.providerBadge}
            activeOpacity={0.85}
            onPress={handleReload}
          >
            <Text style={styles.providerBadgeText}>
              🗺️ {PROVIDER_NAMES[providerMode]}
            </Text>
          </TouchableOpacity>

          {/* Nút bay nhanh ra Quần đảo Hoàng Sa & Trường Sa góc trên phải */}
          <TouchableOpacity
            style={styles.sovQuickBadge}
            activeOpacity={0.85}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (zoom > 8) {
                flyTo(111.5, 14.0, 6);
              } else {
                flyTo(firstCoord.lng, firstCoord.lat, 14);
              }
            }}
          >
            <Text style={styles.sovQuickText}>
              {zoom > 8 ? '🇻🇳 Hoàng Sa · Trường Sa' : '🏙️ Về Phố'}
            </Text>
          </TouchableOpacity>

          {/* Cụm nút Zoom +/- & GPS góc dưới phải */}
          <View style={styles.mapCtrls}>
            <TouchableOpacity
              style={styles.mfab}
              activeOpacity={0.8}
              onPress={handleZoomIn}
              accessibilityLabel="Phóng to"
            >
              <Text style={styles.mfabText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mfab}
              activeOpacity={0.8}
              onPress={handleZoomOut}
              accessibilityLabel="Thu nhỏ"
            >
              <Text style={styles.mfabText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mfab}
              activeOpacity={0.8}
              onPress={handleLocateMe}
              accessibilityLabel="Vị trí của tôi"
            >
              <Text style={styles.mfabEmoji}>🎯</Text>
            </TouchableOpacity>
          </View>

          {/* Ghi nguồn chuẩn ở góc dưới trái */}
          <View style={styles.attrBar} pointerEvents="none">
            <Text style={styles.attrText}>© OpenStreetMap · CARTO · OpenFreeMap</Text>
          </View>
        </View>

        {/* THẺ MINI KHI CHẠM GHIM (CÓ NÚT CHỈ ĐƯỜNG DEEP LINK) */}
        {selectedPlace && (
          <View style={styles.placeCard}>
            <View style={styles.pcInfo}>
              <Text style={styles.pcName} numberOfLines={1}>
                {selectedPlace.name}
              </Text>
              <Text style={styles.pcMeta}>
                {selectedPlace.visits > 1 ? `${selectedPlace.visits} lần · ` : ''}
                {fmtK(selectedPlace.total)}đ
              </Text>
            </View>
            <TouchableOpacity
              style={styles.pcDirBtn}
              activeOpacity={0.85}
              onPress={() => handleOpenDirections(selectedPlace)}
            >
              <Text style={styles.pcDirText}>🧭 Đi</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* DANH SÁCH KHOẢN CHI THẬT TỪ TRANSACTION STORE (0 HARDCODE) */}
        <View style={styles.placeList}>
          {filteredPlaces.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyCardText}>
                Chưa có khoản chi nào · Chụp hoặc ghi chi để hiện ghim trên bản đồ
              </Text>
            </View>
          ) : (
            filteredPlaces.slice(0, 8).map((p) => {
              const meta = KIND_META[p.kind] || KIND_META.food;
              const isSelected = selectedPlace?.id === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.prow, isSelected && styles.prowActive]}
                  activeOpacity={0.85}
                  onPress={() => handleSelectPlace(p, true)}
                >
                  <View style={styles.pico}>
                    <Text style={styles.picoText}>{meta.icon}</Text>
                  </View>
                  <View style={styles.pmain}>
                    <Text style={styles.pname} numberOfLines={1}>
                      {p.name}
                    </Text>
                  </View>
                  {p.visits > 1 && (
                    <View style={styles.pbadge}>
                      <Text style={styles.pbadgeText}>{p.visits}×</Text>
                    </View>
                  )}
                  <Text style={styles.pamt}>{fmtK(p.total)}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>
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
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: '#F6EEDC',
    borderBottomWidth: 0,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBF1',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 17,
    color: '#2B2118',
  },
  scrollBody: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingTop: 4,
    paddingHorizontal: 12,
    paddingBottom: 110, // padding: 4px 12px 110px — Chống chồng đè Floating Pill Tab Bar
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  fchip: {
    flex: 1,
    height: 34,
    borderRadius: 999,
    borderWidth: 2.5,
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
  fchipActive: {
    backgroundColor: '#2B2118',
  },
  fchipText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 12,
    color: '#2B2118',
  },
  fchipTextActive: {
    color: '#FFFBF1',
  },
  mapShell: {
    position: 'relative',
    width: '100%',
    height: 350,
    borderWidth: 3,
    borderColor: '#2B2118',
    borderRadius: 20,
    backgroundColor: '#EDE3CC',
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  vnMap: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  tileLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  nativeTile: {
    position: 'absolute',
    width: 256,
    height: 256,
  },
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 4,
  },
  markerLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 6,
  },
  sovLabel: {
    position: 'absolute',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(255,251,241,0.94)',
    borderWidth: 1.5,
    borderColor: '#2B2118',
  },
  sovLabelText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 9.5,
    color: '#2B2118',
  },
  pigMarkerWrap: {
    position: 'absolute',
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pigBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFBF1',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  pinWrap: {
    position: 'absolute',
    width: 28,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,251,241,0.94)',
    borderWidth: 2,
    borderColor: '#2B2118',
  },
  providerBadgeText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 10.5,
    color: '#2B2118',
  },
  sovQuickBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,251,241,0.94)',
    borderWidth: 2,
    borderColor: '#2B2118',
  },
  sovQuickText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 10.5,
    color: '#2B2118',
  },
  mapCtrls: {
    position: 'absolute',
    right: 10,
    bottom: 28,
    zIndex: 12,
    gap: 7,
  },
  mfab: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
  mfabText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 18,
    color: '#2B2118',
    lineHeight: 20,
  },
  mfabEmoji: {
    fontSize: 16,
  },
  attrBar: {
    position: 'absolute',
    left: 8,
    bottom: 6,
    zIndex: 11,
    backgroundColor: 'rgba(255,251,241,0.92)',
    borderWidth: 1.5,
    borderColor: '#2B2118',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  attrText: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '700',
    fontSize: 9.5,
    color: '#2B2118',
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: '#2B2118',
    backgroundColor: '#FFFBF1',
    marginBottom: 10,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  pcInfo: {
    flex: 1,
    minWidth: 0,
  },
  pcName: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 14,
    color: '#2B2118',
  },
  pcMeta: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '700',
    fontSize: 11.5,
    color: '#85735E',
    marginTop: 2,
  },
  pcDirBtn: {
    height: 34,
    paddingHorizontal: 11,
    borderRadius: 999,
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
  pcDirText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 12,
    color: '#2B2118',
  },
  placeList: {
    gap: 8,
  },
  prow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderRadius: 15,
    borderWidth: 2.5,
    borderColor: '#2B2118',
    backgroundColor: '#FFFBF1',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  prowActive: {
    backgroundColor: '#F4E4BE',
  },
  pico: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2B2118',
    backgroundColor: '#F6EEDC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  picoText: {
    fontSize: 16,
  },
  pmain: {
    flex: 1,
    minWidth: 0,
  },
  pname: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 13.5,
    color: '#2B2118',
  },
  pbadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#F6EEDC',
    borderWidth: 1.5,
    borderColor: '#2B2118',
  },
  pbadgeText: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '700',
    fontSize: 10.5,
    color: '#2B2118',
  },
  pamt: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 13.5,
    color: '#2B2118',
    fontVariant: ['tabular-nums'],
  },
  emptyCard: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 15,
    borderWidth: 2.5,
    borderColor: '#2B2118',
    backgroundColor: '#FFFBF1',
    alignItems: 'center',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  emptyCardText: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '700',
    fontSize: 12.5,
    color: '#85735E',
    textAlign: 'center',
  },
});
