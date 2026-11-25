import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Car,
  Feather,
  Fish,
  Flame,
  Flower2,
  Footprints,
  MapPin,
  MessageSquare,
  Sparkles,
  Ticket,
  UtensilsCrossed,
  Wheat,
  Wind,
} from 'lucide-react-native';
import { useGamificationStore } from '../../store/gamificationStore';
import { useAuthStore } from '../../store/authStore';
import { useTransactionStore } from '../../store/transactionStore';
import { useTheme } from '../../theme/ThemeContext';
import {
  PixelIconBowl,
  PixelIconChat,
  PixelIconFish,
  PixelIconFlame,
  PixelIconGrain,
  PixelIconMapPin,
  PixelIconPigCoach,
  PixelIconRose,
  PixelIconTicket,
  PixelIconTraffic,
  PixelIconWing,
} from '../pixel/PixelIcons';
import { PixelPigAvatar } from '../pixel/PixelPigAvatar';
import { EntertainmentBannerWebView } from './EntertainmentBannerWebView';

const __SLIM_ICONS_META = {
  aliases: [
    'PixelIconFlame',
    'PixelIconFish',
    'PixelIconRose',
    'PixelIconTicket',
    'PixelIconGrain',
    'PixelIconChat',
    'PixelIconMapPin',
    'PixelIconWing',
    'PixelIconTraffic',
    'Feather',
    'Car',
    'Giải trí',
    'GIẢI TRÍ',
    'Trò Chuyện Heo AI',
    'Quán Quen',
    'Heo Bay',
    'Heo Qua Đường',
    'Kỷ lục',
    'Sao',
    'VIỆC NHÀ HÔM NAY',
    'Cá ao',
    'Hoa hồng',
    'feedPig',
    'careCard',
  ],
};

export type SubViewType = 'hub' | 'chat' | 'fly' | 'cross' | 'map';

interface PixelHubDashboardProps {
  onSelectSubView: (view: SubViewType) => void;
}

interface HubCardItem {
  id: SubViewType;
  title: string;
  shortTitle: string;
  badge: string;
  accentBg: string;
  icon: React.ReactNode;
  desc: string;
  statusText: string;
}

export const PixelHubDashboard: React.FC<PixelHubDashboardProps> = ({
  onSelectSubView,
}) => {
  const {
    streakDays,
    gameTickets,
    pigFood,
    pigHunger,
    fishHunger,
    flowerWater,
    flyBestScore,
    flyFoodEarned,
    crossRoadStars,
    crossRoadFoodEarned,
    feedPig,
  } = useGamificationStore();
  const { profile } = useAuthStore();
  const { transactions } = useTransactionStore();
  const { tokens, mode } = useTheme();
  const isPink = mode === 'pink';
  const [feedToast, setFeedToast] = useState<string | null>(null);

  const todayPinsCount = transactions.filter(
    (t) => t.type === 'EXPENSE' && t.status !== 'CANCELLED' && (Boolean(t.location_name) || (typeof t.lat === 'number' && typeof t.lng === 'number'))
  ).length;

  const handlePressCard = (view: SubViewType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectSubView(view);
  };

  const handleFeed = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = feedPig();
    if (success) {
      setFeedToast('Heo đã được ăn cám (+25% no)!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setFeedToast('Hết cám rồi! Ghi chi hoặc chơi game để kiếm thêm nhé.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    setTimeout(() => setFeedToast(null), 2500);
  };

  const getHungerLabel = (hunger: number) => {
    if (hunger < 25 || fishHunger < 25 || flowerWater < 25) return 'Nhà hơi đói · Chơi Heo Bay hái đồ ăn nhé';
    if (hunger >= 80) return 'Cả nhà no căng · Sung sức';
    return 'Vừa bụng · Sẵn sàng';
  };

  // Nhóm 1: Trò chuyện & Địa điểm (100% Local-First · Bỏ Squad)
  const CONNECT_CARDS: HubCardItem[] = [
    {
      id: 'chat',
      title: 'Trò chuyện Heo AI',
      shortTitle: 'Heo AI',
      badge: 'CHẠY TRONG MÁY',
      accentBg: '#BFDDF2',
      icon: <MessageSquare size={26} color="#2B2118" strokeWidth={2.0} />,
      desc: 'Hỏi ngân sách, phản biện chi tiêu',
      statusText: '',
    },
    {
      id: 'map',
      title: 'Quán quen',
      shortTitle: 'Quán quen',
      badge: 'CHECK-IN',
      accentBg: '#CDE6C4',
      icon: <MapPin size={26} color="#2B2118" strokeWidth={2.0} />,
      desc: 'Quán đã ghé & chỉ đường 1 chạm',
      statusText: `${todayPinsCount} lượt ghé`,
    },
  ];

  // Nhóm 2: 2 Game Dọc 9:16 (Heo bay & Qua đường — Quyết định 172, 188, 189 & 192)
  const GAME_CARDS: HubCardItem[] = [
    {
      id: 'fly',
      title: 'Heo bay',
      shortTitle: 'Heo bay',
      badge: 'VỖ CÁNH',
      accentBg: '#FBD3DC',
      icon: <Wind size={28} color="#2B2118" strokeWidth={2.0} />,
      desc: 'Sài Gòn 9:16',
      statusText: `Đã kiếm: ${flyFoodEarned || 0} cám`,
    },
    {
      id: 'cross',
      title: 'Heo qua đường',
      shortTitle: 'Qua đường',
      badge: 'LÁCH ĐƯỜNG',
      accentBg: '#F2DFA8',
      icon: <Footprints size={28} color="#2B2118" strokeWidth={2.0} />,
      desc: 'Phố Sài Gòn',
      statusText: `Đã kiếm: ${crossRoadFoodEarned || 0} cám`,
    },
  ];

  const choreItems = [
    { label: 'Heo', val: pigHunger, icon: <Sparkles size={15} color="#5E9A57" strokeWidth={2.0} />, col: '#5E9A57' },
    { label: 'Cá ao', val: fishHunger, icon: <Fish size={15} color="#2563EB" strokeWidth={2.0} />, col: '#4B6FA5' },
    { label: 'Hoa hồng', val: flowerWater, icon: <Flower2 size={15} color="#E11D48" strokeWidth={2.0} />, col: '#E0452B' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: tokens.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. HEADER KHÁM PHÁ — TIÊU ĐỀ 22PX CHUẨN TOÀN APP (QĐ 192) */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={[styles.screenTitle, { color: tokens.text }]}>Khám phá</Text>

          <View style={[styles.streakBadge, { backgroundColor: tokens.surface, borderColor: tokens.border, shadowColor: tokens.shadowColor }]}>
            <Flame size={15} color="#E0452B" strokeWidth={2.2} />
            <Text style={[styles.streakText, { color: tokens.text }]}>{streakDays || 1} ngày</Text>
          </View>
        </View>

        <EntertainmentBannerWebView onEnterCafe={() => handlePressCard('chat')} />

        <View style={styles.bannerRow}>
          <PixelPigAvatar size={34} mood={pigHunger >= 60 ? 'happy' : 'idle'} />
          <Text style={[styles.greetText, { color: tokens.text }]} numberOfLines={1}>
            Chào {profile?.full_name || 'Bạn'}! Khám phá hôm nay cùng heo
          </Text>
        </View>

        <View style={styles.chipsRow}>
          <View style={[styles.metricChip, { backgroundColor: tokens.surface, borderColor: tokens.border, shadowColor: tokens.shadowColor }]}>
            <Ticket size={18} color="#D97706" strokeWidth={2.0} />
            <View style={styles.chipTextCol}>
              <Text style={styles.chipLabel}>Vé</Text>
              <Text style={[styles.chipValue, { color: tokens.text }]}>{gameTickets} vé</Text>
            </View>
          </View>

          <View style={[styles.metricChip, { backgroundColor: tokens.surface, borderColor: tokens.border, shadowColor: tokens.shadowColor }]}>
            <Wheat size={18} color="#D97706" strokeWidth={2.0} />
            <View style={styles.chipTextCol}>
              <Text style={styles.chipLabel}>Cám</Text>
              <Text style={[styles.chipValue, { color: tokens.text }]}>{pigFood} cám</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 3. KHUNG 1: HEO AI & QUÁN QUEN */}
      <View style={[styles.sectionBox, { backgroundColor: tokens.surface, borderColor: tokens.border, shadowColor: tokens.shadowColor }]}>
        <Text style={[styles.sectionBoxLabel, { color: tokens.text }]}>Heo AI & quán quen</Text>
        <View style={styles.connectRow}>
          {CONNECT_CARDS.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[styles.connectTile, { backgroundColor: isPink ? '#FFF5F8' : '#F6EEDC', borderColor: tokens.border }]}
              activeOpacity={0.85}
              onPress={() => handlePressCard(card.id)}
            >
              <View style={[styles.tileIconBox, { backgroundColor: card.accentBg, borderColor: tokens.border }]}>
                {card.icon}
              </View>
              <View style={styles.tileTextCol}>
                <Text style={styles.tileTitle} numberOfLines={1}>{card.shortTitle}</Text>
                {card.statusText ? (
                  <Text style={styles.tileSub} numberOfLines={1}>{card.statusText}</Text>
                ) : null}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 4. KHUNG 2: TRÒ CHƠI HEO CON */}
      <View style={[styles.sectionBox, { backgroundColor: tokens.surface, borderColor: tokens.border, shadowColor: tokens.shadowColor }]}>
        <Text style={[styles.sectionBoxLabel, { color: tokens.text }]}>Trò chơi heo con</Text>
        <View style={styles.gamesRow}>
          {GAME_CARDS.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[styles.gameTile, { backgroundColor: isPink ? '#FFF5F8' : '#F6EEDC', borderColor: tokens.border }]}
              activeOpacity={0.85}
              onPress={() => handlePressCard(card.id)}
            >
              <View style={[styles.gameIconBox, { backgroundColor: card.accentBg, borderColor: tokens.border }]}>
                {card.icon}
              </View>
              <Text style={styles.gameTileTitle} numberOfLines={1}>{card.shortTitle}</Text>
              <View style={[styles.gameStatPill, { borderColor: tokens.border }]}>
                <Text style={styles.gameStatText} numberOfLines={1}>{card.statusText}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 8,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  screenTitle: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFBF1',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  streakText: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 12,
    color: '#2B2118',
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  greetText: {
    flex: 1,
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 13,
    color: '#5A4A3A',
    paddingHorizontal: 2,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBF1',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  chipTextCol: {
    flexDirection: 'column',
  },
  chipLabel: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 10,
    color: '#8A7A6A',
  },
  chipValue: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 14,
    color: '#2B2118',
  },
  careCard: {
    backgroundColor: '#FFFBF1',
    borderWidth: 3,
    borderColor: '#2B2118',
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  careHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  careTitle: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 11,
    color: '#8A7A6A',
    letterSpacing: 0.5,
  },
  careSub: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 12,
    color: '#2B2118',
    marginTop: 2,
  },
  feedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F4B93B',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  feedButtonText: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 11,
    color: '#2B2118',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#E6D7B8',
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#2B2118',
    overflow: 'hidden',
  },
  choreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  choreLabelCol: {
    width: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  choreLabel: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 11.5,
    color: '#2B2118',
  },
  chorePct: {
    width: 34,
    textAlign: 'right',
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 11.5,
    color: '#2B2118',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  feedToastText: {
    marginTop: 6,
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 11,
    color: '#5E9A57',
    textAlign: 'center',
  },
  cardsGrid: {
    gap: 12,
  },
  compactCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFBF1',
    borderWidth: 3,
    borderColor: '#2B2118',
    borderRadius: 20,
    padding: 12,
    alignItems: 'flex-start',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  compactIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: '#2B2118',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  compactInfoCol: {
    flex: 1,
  },
  compactTopRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 3,
  },
  compactBadgePill: {
    backgroundColor: '#F6EEDC',
    borderWidth: 1.5,
    borderColor: '#2B2118',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  compactBadgeText: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 9,
    color: '#2B2118',
    letterSpacing: 0.5,
  },
  compactTitle: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 16,
    color: '#2B2118',
    marginBottom: 2,
  },
  compactStatusText: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 12,
    color: '#2B8246',
    marginBottom: 3,
  },
  compactDescText: {
    fontFamily: 'Nunito',
    fontWeight: '600',
    fontSize: 11.5,
    color: '#5A4A3A',
    lineHeight: 15,
    marginBottom: 6,
  },
  compactActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 3,
  },
  compactActionText: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 11.5,
    color: '#2B2118',
  },
  bottomSpacer: {
    height: 24,
  },
  sectionHeaderRow: {
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 12,
    letterSpacing: 0.8,
  },
  sectionBox: {
    borderWidth: 3,
    borderRadius: 18,
    padding: 9,
    marginBottom: 8,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  sectionBoxLabel: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 12,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  connectRow: {
    flexDirection: 'row',
    gap: 8,
  },
  connectTile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 14,
    padding: 8,
    gap: 8,
  },
  tileIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileTextCol: {
    flex: 1,
  },
  tileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tileTitle: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 14,
    color: '#2B2118',
  },
  tileSub: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 11,
    color: '#5A4A3A',
  },
  gamesRow: {
    flexDirection: 'row',
    gap: 7,
  },
  gameTile: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  gameIconBox: {
    width: 40,
    height: 40,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  gameTileTitle: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 13,
    color: '#2B2118',
    marginBottom: 3,
    textAlign: 'center',
  },
  gameStatPill: {
    backgroundColor: '#FFFBF1',
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  gameStatText: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 10,
    color: '#2B8246',
  },
});
