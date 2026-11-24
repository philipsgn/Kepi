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
  ChevronRight,
  Flame,
  Ticket,
  Wheat,
  Utensils,
  Users,
} from 'lucide-react-native';
import { useGamificationStore } from '../../store/gamificationStore';
import { useAuthStore } from '../../store/authStore';
import { useTransactionStore } from '../../store/transactionStore';
import { useTheme } from '../../theme/ThemeContext';
import {
  PixelIconChat,
  PixelIconCrossRoad,
  PixelIconFlyWing,
  PixelIconGamepad,
  PixelIconMapPin,
  PixelIconTicket,
  PixelIconTraffic,
  PixelIconWing,
} from '../pixel/PixelIcons';
import { PixelPigAvatar } from '../pixel/PixelPigAvatar';
import { EntertainmentBannerWebView } from './EntertainmentBannerWebView';

export type SubViewType = 'hub' | 'chat' | 'squad' | 'fly' | 'cross' | 'map';

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
    flyBestScore,
    crossRoadStars,
    feedPig,
  } = useGamificationStore();
  const { profile } = useAuthStore();
  const { transactions } = useTransactionStore();
  const { tokens, mode } = useTheme();
  const isPink = mode === 'pink';
  const [feedToast, setFeedToast] = useState<string | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayPinsCount = transactions.filter(
    (t) => (t.occurred_at || t.created_at)?.startsWith(todayStr)
  ).length;

  const handlePressCard = (view: SubViewType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectSubView(view);
  };

  const handleFeed = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = feedPig();
    if (success) {
      setFeedToast('Heo đã được no bụng (+25% no)!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setFeedToast('Hết thức ăn! Hãy chơi game cùng heo để kiếm thêm thức ăn.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    setTimeout(() => setFeedToast(null), 2500);
  };

  const getHungerLabel = (hunger: number) => {
    if (hunger >= 80) return 'No căng · Sung sức (+15% lực)';
    if (hunger >= 40) return 'Vừa bụng · Sẵn sàng';
    return 'Heo đói · Cần ăn để chơi hăng hơn';
  };

  // Nhóm 1: Kết nối & Địa điểm (1 khung · 2 cột)
  const CONNECT_CARDS: HubCardItem[] = [
    {
      id: 'chat',
      title: 'Trò Chuyện & Bạn Bè',
      shortTitle: 'Trò chuyện',
      badge: 'KẾT NỐI',
      accentBg: '#BFDDF2',
      icon: <PixelIconChat size={26} />,
      desc: 'AI & Bạn bè',
      statusText: 'Online',
    },
    {
      id: 'map',
      title: 'Hộ Chiếu Quán Quen',
      shortTitle: 'Hộ chiếu',
      badge: 'CHECK-IN',
      accentBg: '#CDE6C4',
      icon: <PixelIconMapPin size={26} />,
      desc: 'Check-in quán xá, album ảnh & chỉ đường 1-chạm',
      statusText: `${todayPinsCount} địa điểm`,
    },
  ];

  // Nhóm 2: 2 Game Dọc 9:16 16-bit (Heo Bay & Heo Qua Đường — Quyết định 172)
  const GAME_CARDS: HubCardItem[] = [
    {
      id: 'fly',
      title: 'Heo Bay',
      shortTitle: 'Heo Bay',
      badge: 'VỖ CÁNH',
      accentBg: '#FBD3DC',
      icon: <PixelIconWing size={28} />,
      desc: 'Sài Gòn 9:16',
      statusText: `Kỷ lục ${flyBestScore || 0}`,
    },
    {
      id: 'cross',
      title: 'Heo Qua Đường',
      shortTitle: 'Qua Đường',
      badge: 'LÁCH ĐƯỜNG',
      accentBg: '#F2DFA8',
      icon: <PixelIconTraffic size={28} />,
      desc: 'Phố Sài Gòn',
      statusText: `Sao ${crossRoadStars || 0}/12`,
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: tokens.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. HEADER GIẢI TRÍ */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={[styles.brandBadge, { backgroundColor: tokens.surface, borderColor: tokens.border, shadowColor: tokens.shadowColor }]}>
            <View style={styles.brandDot} />
            <Text style={[styles.brandBadgeText, { color: tokens.text }]}>GIẢI TRÍ</Text>
          </View>

          {/* Huy hiệu chuỗi ngày */}
          <View style={[styles.streakBadge, { backgroundColor: tokens.surface, borderColor: tokens.border, shadowColor: tokens.shadowColor }]}>
            <Flame size={15} color="#E0452B" strokeWidth={2.8} />
            <Text style={[styles.streakText, { color: tokens.text }]}>{streakDays || 1} ngày</Text>
          </View>
        </View>

        {/* Banner Anime Pixel Động (192×88 - Quyết định 153) */}
        <EntertainmentBannerWebView />

        {/* Lời chào phong cách Heo Con kèm Avatar Mascot */}
        <View style={styles.bannerRow}>
          <PixelPigAvatar size={34} mood={pigHunger >= 60 ? 'happy' : 'idle'} />
          <Text style={[styles.greetText, { color: tokens.text }]} numberOfLines={1}>
            Chào {profile?.full_name || 'Trà Xanh'}! Khám phá giải trí & hộ chiếu quán quen
          </Text>
        </View>

        {/* Chips Vé & Cám (Thuần túy 2 ô như prototype) */}
        <View style={styles.chipsRow}>
          <View style={[styles.metricChip, { backgroundColor: tokens.surface, borderColor: tokens.border, shadowColor: tokens.shadowColor }]}>
            <PixelIconTicket size={18} />
            <View style={styles.chipTextCol}>
              <Text style={styles.chipLabel}>Vé</Text>
              <Text style={[styles.chipValue, { color: tokens.text }]}>{gameTickets} vé</Text>
            </View>
          </View>

          <View style={[styles.metricChip, { backgroundColor: tokens.surface, borderColor: tokens.border, shadowColor: tokens.shadowColor }]}>
            <Wheat size={16} color="#F4B93B" strokeWidth={2.6} />
            <View style={styles.chipTextCol}>
              <Text style={styles.chipLabel}>Cám</Text>
              <Text style={[styles.chipValue, { color: tokens.text }]}>{pigFood} cám</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 2. THẺ CHĂM SÓC HEO CƯNG (PET HOME CARD) */}
      <View style={[styles.careCard, { backgroundColor: tokens.surface, borderColor: tokens.border, shadowColor: tokens.shadowColor }]}>
        <View style={styles.careHeader}>
          <View>
            <Text style={[styles.careTitle, { color: tokens.text }]}>CHĂM SÓC HEO CƯNG</Text>
            <Text style={styles.careSub}>{getHungerLabel(pigHunger)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.feedButton, { backgroundColor: '#F4B93B', borderColor: tokens.border, shadowColor: tokens.shadowColor }]}
            onPress={handleFeed}
            activeOpacity={0.82}
          >
            <Utensils size={13} color="#2B2118" strokeWidth={2.6} />
            <Text style={[styles.feedButtonText, { color: '#2B2118' }]}>Cho ăn (-1)</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar độ no */}
        <View style={[styles.progressBarTrack, { backgroundColor: isPink ? '#FCE7F3' : '#E6D7B8', borderColor: tokens.border }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(100, Math.max(8, pigHunger))}%`,
                backgroundColor: pigHunger >= 40 ? '#5E9A57' : '#E0452B',
              },
            ]}
          />
        </View>

        {feedToast && (
          <Text style={styles.feedToastText}>{feedToast}</Text>
        )}
      </View>

      {/* 3. KHUNG 1: KẾT NỐI & ĐỊA ĐIỂM (1 SECTION BOX · 2 CỘT) */}
      <View style={[styles.sectionBox, { backgroundColor: tokens.surface, borderColor: tokens.border, shadowColor: tokens.shadowColor }]}>
        <Text style={[styles.sectionBoxLabel, { color: tokens.text }]}>KẾT NỐI & ĐỊA ĐIỂM</Text>
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
                <View style={styles.tileHeaderRow}>
                  {card.id === 'chat' && (
                    <Users size={11} color="#2B2118" strokeWidth={2.5} style={{ marginRight: 3 }} />
                  )}
                  <Text style={styles.tileTitle} numberOfLines={1}>{card.shortTitle}</Text>
                </View>
                <Text style={styles.tileSub} numberOfLines={1}>{card.statusText}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 4. KHUNG 2: TRÒ CHƠI HEO CON (1 SECTION BOX · 1 HÀNG 3 CỘT) */}
      <View style={[styles.sectionBox, { backgroundColor: tokens.surface, borderColor: tokens.border, shadowColor: tokens.shadowColor }]}>
        <Text style={[styles.sectionBoxLabel, { color: tokens.text }]}>TRÒ CHƠI HEO CON</Text>
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
    paddingTop: 6,
    paddingBottom: 110,
  },
  header: {
    marginBottom: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0452B',
  },
  brandBadgeText: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 11,
    color: '#2B2118',
    letterSpacing: 0.8,
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
    marginBottom: 8,
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
    padding: 10,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  sectionBoxLabel: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 12,
    letterSpacing: 0.6,
    marginBottom: 8,
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
