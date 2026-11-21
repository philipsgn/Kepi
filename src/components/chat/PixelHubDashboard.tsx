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
import { useTheme } from '../../theme/ThemeContext';
import { useGamificationStore } from '../../store/gamificationStore';
import { useAuthStore } from '../../store/authStore';
import { PixelPigAvatar } from '../pixel/PixelPigAvatar';
import {
  PixelIconChat,
  PixelIconGamepad,
  PixelIconMapPin,
} from '../pixel/PixelIcons';

export type SubViewType = 'hub' | 'chat' | 'squad' | 'fly' | 'shooter' | 'map';

interface PixelHubDashboardProps {
  onSelectSubView: (view: SubViewType) => void;
}

interface HubCardItem {
  id: SubViewType;
  title: string;
  badge: string;
  accentBg: string;
  icon: React.ReactNode;
  statusText: string;
}

export const PixelHubDashboard: React.FC<PixelHubDashboardProps> = ({
  onSelectSubView,
}) => {
  const { tokens } = useTheme();
  const {
    streakDays,
    gameTickets,
    pigFood,
    pigHunger,
    flyBestScore,
    shooterMaxWave,
    feedPig,
  } = useGamificationStore();
  const { profile } = useAuthStore();
  const [feedToast, setFeedToast] = useState<string | null>(null);

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
      setFeedToast('Hết thức ăn! Hãy bay hoặc bắn heo để kiếm thức ăn.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    setTimeout(() => setFeedToast(null), 2500);
  };

  const getHungerLabel = (hunger: number) => {
    if (hunger >= 80) return 'No căng · Sung sức (+15% lực)';
    if (hunger >= 40) return 'Vừa bụng · Sẵn sàng';
    return 'Heo đói · Bay và bắn yếu (-15%)';
  };

  // 3 Thẻ Hub cốt lõi - Tối giản súc tích (Quyết định 145 & 146)
  const CARDS: HubCardItem[] = [
    {
      id: 'chat',
      title: 'Trò Chuyện & Bạn Bè',
      badge: 'AI COACH & SQUAD',
      accentBg: '#BFDDF2',
      icon: <PixelIconChat size={28} />,
      statusText: 'Heo-Coach & Squad đang online',
    },
    {
      id: 'fly',
      title: 'Game Vui Heo Con',
      badge: 'FLAPPY & ANGRY PIG · 60FPS',
      accentBg: '#FBD3DC',
      icon: <PixelIconGamepad size={28} />,
      statusText: `Heo Bay: ${flyBestScore || 0}đ · Heo Bắn: Màn ${shooterMaxWave || 1}`,
    },
    {
      id: 'map',
      title: 'Bản Đồ Chi Tiêu',
      badge: 'GPS PIXEL & BẢN ĐỒ THẬT',
      accentBg: '#D4ECC6',
      icon: <PixelIconMapPin size={28} />,
      statusText: 'Dual-Engine Pixel & Bản đồ thật',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. HEADER PIGFLY HUB (v-fun) */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.brandBadge}>
            <View style={styles.brandDot} />
            <Text style={styles.brandBadgeText}>PIGFLY HUB</Text>
          </View>

          {/* Huy hiệu chuỗi ngày */}
          <View style={styles.streakBadge}>
            <Flame size={15} color="#E0452B" strokeWidth={2.8} />
            <Text style={styles.streakText}>{streakDays || 1} ngày</Text>
          </View>
        </View>

        {/* Banner Mascot chào hỏi đồng bộ 100% */}
        <View style={styles.bannerRow}>
          <PixelPigAvatar size={42} mood={pigHunger >= 60 ? 'happy' : 'idle'} />
          <View style={styles.bannerInfo}>
            <Text style={styles.mainHeading}>Trung Tâm Heo Con</Text>
            <Text style={styles.subHeading} numberOfLines={1}>
              Chào {profile?.full_name || 'bạn'}! Khám phá giải trí & khu phố
            </Text>
          </View>
        </View>

        {/* Chips Vé & Thức ăn */}
        <View style={styles.chipsRow}>
          <View style={styles.metricChip}>
            <Ticket size={16} color="#E0452B" strokeWidth={2.6} />
            <View>
              <Text style={styles.chipLabel}>Vé Chơi</Text>
              <Text style={styles.chipValue}>{gameTickets} vé</Text>
            </View>
          </View>

          <View style={styles.metricChip}>
            <Wheat size={16} color="#F4B93B" strokeWidth={2.6} />
            <View>
              <Text style={styles.chipLabel}>Thức Ăn</Text>
              <Text style={styles.chipValue}>{pigFood} phần</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 2. THẺ CHĂM SÓC HEO CƯNG (PET HOME CARD) */}
      <View style={styles.careCard}>
        <View style={styles.careHeader}>
          <View>
            <Text style={styles.careTitle}>CHĂM SÓC HEO CƯNG</Text>
            <Text style={styles.careSub}>{getHungerLabel(pigHunger)}</Text>
          </View>
          <TouchableOpacity
            style={styles.feedButton}
            onPress={handleFeed}
            activeOpacity={0.82}
          >
            <Utensils size={13} color="#2B2118" strokeWidth={2.6} />
            <Text style={styles.feedButtonText}>Cho ăn (-1)</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar độ no */}
        <View style={styles.progressBarTrack}>
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

      {/* 3. LƯỚI 3 THẺ COMPACT NEO-CARDS (Quyết định 146: Bố cục ngang, gọn gàng, 0 cuộn) */}
      <View style={styles.cardsGrid}>
        {CARDS.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={styles.compactCard}
            activeOpacity={0.85}
            onPress={() => handlePressCard(card.id)}
          >
            {/* Khối vuông Icon Pixel 16×16 bên trái */}
            <View style={[styles.compactIconBox, { backgroundColor: card.accentBg }]}>
              {card.icon}
            </View>

            {/* Cột thông tin súc tích bên phải */}
            <View style={styles.compactInfoCol}>
              <View style={styles.compactTopRow}>
                <Text style={styles.compactTitle} numberOfLines={1}>{card.title}</Text>
                <View style={styles.compactBadgePill}>
                  <Text style={styles.compactBadgeText}>{card.badge}</Text>
                </View>
              </View>

              <View style={styles.compactBottomRow}>
                <Text style={styles.compactStatusText} numberOfLines={1}>
                  {card.statusText}
                </Text>
                <View style={styles.compactActionBtn}>
                  <Text style={styles.compactActionText}>Khám phá</Text>
                  <ChevronRight size={13} color="#2B2118" strokeWidth={2.8} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    paddingBottom: 24,
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
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBF1',
    borderWidth: 2.5,
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
    width: 7,
    height: 7,
    borderRadius: 3.5,
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
    gap: 4,
    backgroundColor: '#FFFBF1',
    borderWidth: 2.5,
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
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 12.5,
    color: '#2B2118',
    fontVariant: ['tabular-nums'],
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
    marginBottom: 8,
  },
  bannerInfo: {
    flex: 1,
  },
  mainHeading: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 21,
    lineHeight: 25,
    color: '#2B2118',
  },
  subHeading: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 11.5,
    color: '#85735E',
    marginTop: 1,
    lineHeight: 15,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  metricChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBF1',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  chipLabel: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 10,
    color: '#85735E',
    lineHeight: 12,
  },
  chipValue: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 13,
    color: '#2B2118',
    lineHeight: 16,
    fontVariant: ['tabular-nums'],
  },
  careCard: {
    backgroundColor: '#FFFBF1',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    borderRadius: 18,
    padding: 10,
    marginBottom: 10,
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
    marginBottom: 6,
  },
  careTitle: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 10.5,
    letterSpacing: 0.6,
    color: '#85735E',
  },
  careSub: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 11.5,
    color: '#2B2118',
    marginTop: 1,
  },
  feedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F4B93B',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
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
    height: 9,
    backgroundColor: '#F6EEDC',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#2B2118',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
  },
  feedToastText: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 10.5,
    color: '#E0452B',
    marginTop: 4,
    textAlign: 'center',
  },
  cardsGrid: {
    gap: 8,
  },
  // Compact Neo-Card Styles
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFBF1',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    borderRadius: 18,
    padding: 9,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  compactIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: '#2B2118',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  compactInfoCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  compactTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  compactTitle: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 15,
    color: '#2B2118',
    flex: 1,
  },
  compactBadgePill: {
    backgroundColor: '#F6EEDC',
    borderWidth: 1.5,
    borderColor: '#2B2118',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
    flexShrink: 0,
  },
  compactBadgeText: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 9.5,
    color: '#85735E',
    letterSpacing: 0.4,
  },
  compactBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  compactStatusText: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 11.5,
    color: '#5E9A57',
    flex: 1,
  },
  compactActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#F4B93B',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
    flexShrink: 0,
  },
  compactActionText: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 10.5,
    color: '#2B2118',
  },
  bottomSpacer: {
    height: 16,
  },
});
