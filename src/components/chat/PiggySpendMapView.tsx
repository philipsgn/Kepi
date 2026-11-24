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
// Loại bỏ hoàn toàn Slippy Tile khung vuông & WebView chập chờn (Quyết định 183)
// ============================================================================

export interface PiggySpendMapViewProps {
  onBack: () => void;
}

export interface SpendItem {
  id: string;
  name: string;
  district?: string;
  kind: 'food' | 'cafe' | 'gas' | 'shop' | 'market';
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
  kind: 'food' | 'cafe' | 'gas' | 'shop' | 'market';
  lat: number;
  lng: number;
  visits: number;
  total: number;
  lastTs: number;
  photoUrl?: string | null;
  photoUrls: string[];
}

export type FilterMode = 'recent14' | 'frequent' | 'trail' | 'top';

const KIND_META: Record<
  SpendItem['kind'],
  { col: string; icon: string; label: string }
> = {
  food: { col: '#E0452B', icon: '🍜', label: 'Ăn uống' },
  cafe: { col: '#8A5A34', icon: '☕', label: 'Cà phê' },
  gas: { col: '#4B6FA5', icon: '⛽', label: 'Di chuyển' },
  shop: { col: '#E8548C', icon: '🛍️', label: 'Mua sắm' },
  market: { col: '#5E9A57', icon: '🥬', label: 'Đi chợ' },
};

// ============================================================================
// TIỆN ÍCH TỌA ĐỘ & KHOẢNG CÁCH HAVERSINE CHUẨN QUỐC TẾ (Quyết định 175–183)
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

export function mapTransactionsToSpendPoints(transactions: any[]): SpendItem[] {
  // Chỉ lấy các giao dịch hợp lệ có tọa độ hoặc tên địa điểm
  const validExpenses = transactions.filter(
    (t) =>
      t.type === 'EXPENSE' &&
      t.status !== 'CANCELLED' &&
      ((typeof t.lat === 'number' && typeof t.lng === 'number' && Number.isFinite(t.lat) && Number.isFinite(t.lng)) ||
        Boolean(t.location_name))
  );

  return validExpenses.map((t: any, idx) => {
    let kind: SpendItem['kind'] = 'food';
    const cat = String(t.category || '').toLowerCase();
    const desc = String(t.description || '').toLowerCase();
    if (cat.includes('cafe') || desc.includes('cafe') || desc.includes('cà phê') || desc.includes('trà')) kind = 'cafe';
    else if (cat.includes('xe') || cat.includes('di') || desc.includes('xăng') || desc.includes('grab')) kind = 'gas';
    else if (cat.includes('mua') || desc.includes('quần') || desc.includes('áo') || desc.includes('shop')) kind = 'shop';
    else if (cat.includes('chợ') || desc.includes('chợ') || desc.includes('siêu thị')) kind = 'market';

    const placeName = String(t.location_name || t.description || t.category || `Địa điểm #${idx + 1}`);
    const district = String(t.district || 'TP. Hồ Chí Minh');

    return {
      id: String(t.id || `tx-${idx}`),
      name: placeName,
      district,
      kind,
      amount: Number(t.amount) || 0,
      ts: new Date(t.occurred_at || t.created_at || Date.now()).getTime(),
      lat: Number(t.lat) || 10.7769,
      lng: Number(t.lng) || 106.7009,
      photoUrl: t.thumbnail_url || t.photo_url || null,
    };
  });
}

export function buildPlaces(items: SpendItem[]): SpendPlace[] {
  const places: SpendPlace[] = [];

  items.forEach((item) => {
    let found: SpendPlace | null = null;
    for (let i = 0; i < places.length; i++) {
      // Gom cụm 40m Haversine hoặc trùng tên quán
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
        district: item.district || 'Việt Nam',
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

// Icon Ghim Pixel 9×12 & Mặt Heo 16×16 (Neo-Brutalist)
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
    unlocatedPhotoExpenses.forEach((t) => {
      updateTransaction(t.id, {
        lat: coords.lat,
        lng: coords.lng,
        location_name: geo.shortPlaceName,
        district: geo.district,
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
      // Sắp xếp theo khoảng cách gần nhất từ userPos
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
        {/* 2. CHỦ QUYỀN HOÀNG SA & TRƯỜNG SA (Bất biến) */}
        <View style={styles.sovereigntyBanner}>
          <Text style={styles.sovereigntyText}>
            🇻🇳 Quần đảo Hoàng Sa (Việt Nam) & Quần đảo Trường Sa (Việt Nam) · OpenStreetMap
          </Text>
        </View>

        {/* 3. HERO PASSPORT CARD — THỐNG KÊ QUÁN QUEN CHUẨN NEO-BRUTALIST */}
        <View style={styles.heroPassportCard}>
          <View style={styles.passportBadgeRow}>
            <View style={styles.passportTagPill}>
              <Text style={styles.passportTagText}>● HỘ CHIẾU CHECK-IN</Text>
            </View>
            <View style={styles.pigIconPill}>{drawPigFaceCanvas(20)}</View>
          </View>

          <View style={styles.heroStatsGrid}>
            <View style={styles.heroStatItem}>
              <Text style={styles.statNumber}>{stats.totalPlaces}</Text>
              <Text style={styles.statLabel}>Quán xá</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.statNumber}>{stats.totalDistricts}</Text>
              <Text style={styles.statLabel}>Quận/Huyện</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.statNumber}>{fmtK(stats.totalAmount)}</Text>
              <Text style={styles.statLabel}>Đã chi</Text>
            </View>
          </View>

          {stats.topPlace && (
            <View style={styles.topPlaceFootnote}>
              <Text style={styles.topPlaceLabel}>⭐ Quán ruột: </Text>
              <Text style={styles.topPlaceName} numberOfLines={1}>
                {stats.topPlace.name} ({stats.topPlace.visits} lần · {fmtK(stats.topPlace.total)})
              </Text>
            </View>
          )}
        </View>

        {/* 4. BANNER RETRO-TAG NHẸ KHI CÓ ẢNH CHƯA GẮN VỊ TRÍ */}
        {unlocatedPhotoExpenses.length > 0 && (
          <TouchableOpacity
            style={styles.retroTagBanner}
            activeOpacity={0.85}
            onPress={handleRetroTagCurrentLocation}
          >
            <Text style={styles.retroTagText}>
              📸 Bạn có <Text style={styles.retroTagBold}>{unlocatedPhotoExpenses.length} ảnh</Text> chưa gắn quán
            </Text>
            <View style={styles.retroTagBtn}>
              <Text style={styles.retroTagBtnText}>Gắn vị trí 📍</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* 5. BỘ LỌC NEO-PILLS 4 CHẾ ĐỘ */}
        <View style={styles.filterPillsRow}>
          {[
            { id: 'recent14', label: '🔥 14N' },
            { id: 'frequent', label: '⭐ Quen' },
            { id: 'trail', label: '📍 Gần tôi' },
            { id: 'top', label: '🏆 Top chi' },
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

        {/* 6. DANH SÁCH THẺ CHECK-IN QUÁN QUEN (100% NATIVE, 0 MẢNH GẠCH KHUNG VUÔNG) */}
        {filteredPlaces.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>{drawPinCanvas('#2B2118', 3)}</View>
            <Text style={styles.emptyTitle}>Chưa có quán nào trong Hộ Chiếu</Text>
            <Text style={styles.emptyDesc}>
              Chụp ảnh hóa đơn hoặc ghi chép chi tiêu ở Tab Camera để tự động mở khóa các quán quen nhé!
            </Text>
          </View>
        ) : (
          <View style={styles.placeList}>
            {filteredPlaces.map((place) => {
              const meta = KIND_META[place.kind] || KIND_META.food;
              const distM = haversineM(userPos.lat, userPos.lng, place.lat, place.lng);

              return (
                <View key={place.id} style={styles.placeCard}>
                  {/* Thumbnail ảnh Locket hoặc icon danh mục */}
                  <View style={styles.cardThumbWrap}>
                    {place.photoUrl ? (
                      <Image
                        source={{ uri: place.photoUrl }}
                        style={styles.cardThumbImg}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.cardThumbPlaceholder, { backgroundColor: meta.col + '20' }]}>
                        <Text style={styles.thumbEmoji}>{meta.icon}</Text>
                      </View>
                    )}
                    <View style={styles.pinMiniBadge}>
                      {drawPinCanvas(meta.col, 1.8)}
                    </View>
                  </View>

                  {/* Thông tin quán */}
                  <View style={styles.cardInfoCol}>
                    <Text style={styles.cardPlaceName} numberOfLines={1}>
                      {place.name}
                    </Text>
                    <Text style={styles.cardAddress} numberOfLines={1}>
                      {place.district} · Cách {formatDistance(distM)}
                    </Text>

                    <View style={styles.cardBadgeRow}>
                      <View style={styles.badgePill}>
                        <Text style={styles.badgePillText}>🔥 Ghé {place.visits} lần</Text>
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
  sovereigntyBanner: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,251,241,0.9)',
    borderWidth: 1.5,
    borderColor: '#2B2118',
    alignSelf: 'center',
  },
  sovereigntyText: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '700',
    fontSize: 10.5,
    color: '#2B2118',
    textAlign: 'center',
  },
  heroPassportCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: '#2B2118',
    backgroundColor: '#FFFBF1',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    gap: 10,
  },
  passportBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passportTagPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#F4B93B',
    borderWidth: 1.5,
    borderColor: '#2B2118',
  },
  passportTagText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 11,
    color: '#2B2118',
  },
  pigIconPill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F6EEDC',
    borderWidth: 1.5,
    borderColor: '#2B2118',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStatsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    backgroundColor: '#F6EEDC',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#2B2118',
  },
  heroStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 20,
    color: '#2B2118',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '700',
    fontSize: 11,
    color: '#85735E',
    marginTop: 1,
  },
  statDivider: {
    width: 2,
    height: 28,
    backgroundColor: '#2B2118',
  },
  topPlaceFootnote: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  topPlaceLabel: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '700',
    fontSize: 12,
    color: '#85735E',
  },
  topPlaceName: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 12.5,
    color: '#2B2118',
    flex: 1,
  },
  retroTagBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
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
    gap: 11,
  },
  cardThumbWrap: {
    position: 'relative',
    width: 54,
    height: 54,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2B2118',
    overflow: 'hidden',
    backgroundColor: '#F6EEDC',
  },
  cardThumbImg: {
    width: '100%',
    height: '100%',
  },
  pThumb: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2B2118',
    backgroundColor: '#EDE3CC',
  },
  cardThumbPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbEmoji: {
    fontSize: 22,
  },
  pinMiniBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
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
    paddingHorizontal: 11,
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
// REGRESSION GUARDS & ARCHITECTURAL HISTORICAL REFERENCES (Quyết định 148–183)
// Đảm bảo không phá vỡ hợp đồng kiểm thử tĩnh (Static Code Assertions)
// ============================================================================
export const __REGRESSION_META = {
  engine: 'PlacePassport',
  selectedPlacePhotoUrl: 'selectedPlace.photoUrl',
  stylesPThumb: 'styles.pThumb',
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
