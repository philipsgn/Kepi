import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  MessageCircle,
  Feather,
  Target,
  MapPin,
  ChevronRight,
  Flame,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useGamificationStore } from '../../store/gamificationStore';
import { useAuthStore } from '../../store/authStore';

export type SubViewType = 'hub' | 'chat' | 'fly' | 'shooter' | 'map';

interface PixelHubDashboardProps {
  onSelectSubView: (view: SubViewType) => void;
}

interface HubCardItem {
  id: SubViewType;
  title: string;
  badge: string;
  tagline: string;
  desc: string;
  accentBg: string;
  icon: React.ReactNode;
}

export const PixelHubDashboard: React.FC<PixelHubDashboardProps> = ({
  onSelectSubView,
}) => {
  const { tokens } = useTheme();
  const { streakDays } = useGamificationStore();
  const { profile } = useAuthStore();

  const handlePressCard = (view: SubViewType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectSubView(view);
  };

  const CARDS: HubCardItem[] = [
    {
      id: 'chat',
      title: 'Trò Chuyện & Bạn Bè',
      badge: 'AI COACH & SQUAD',
      tagline: 'Anh Minh Giữ Ví & Squad Nuôi Heo',
      desc: 'Hỏi đáp ngân sách, xin phản biện chi tiêu và chăm sóc heo cùng bạn thân.',
      accentBg: '#F9B8C4',
      icon: <MessageCircle size={24} color="#2B2118" strokeWidth={2.6} />,
    },
    {
      id: 'fly',
      title: 'Game Heo Bay',
      badge: 'FLAPPY PIG · 60FPS',
      tagline: 'Vỗ cánh vượt ải & Hái đồ ăn',
      desc: 'Bay kiếm thức ăn qua 4 biomes (Vườn, Phố, Ao sen, Đồng lúa), giữ độ no cả nhà.',
      accentBg: '#F4B93B',
      icon: <Feather size={24} color="#2B2118" strokeWidth={2.6} />,
    },
    {
      id: 'shooter',
      title: 'Game Heo Bắn',
      badge: 'ANGRY PIG · 3 SAO',
      tagline: 'Kéo nạ cứu heo & Phá khối',
      desc: 'Bắn phá khối gỗ, đá, kính để giải cứu đàn heo con và tích lũy điểm sao.',
      accentBg: '#F4C6C0',
      icon: <Target size={24} color="#2B2118" strokeWidth={2.6} />,
    },
    {
      id: 'map',
      title: 'Bản Đồ Chi Tiêu',
      badge: 'GPS PIXEL · QUÁN QUEN',
      tagline: 'Khu phố chi tiêu & Heo đi dạo',
      desc: 'Tự động ghim các nơi bạn đã tiêu tiền trong ngày, theo dõi quán quen và cho heo đi dạo.',
      accentBg: '#D9E8C8',
      icon: <MapPin size={24} color="#2B2118" strokeWidth={2.6} />,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. HEADER KHU PHỐ NEO-BRUTALIST */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.titleColumn}>
            <View style={styles.brandBadge}>
              <View style={styles.brandDot} />
              <Text style={styles.brandBadgeText}>PIGFLY HUB</Text>
            </View>
            <Text style={styles.mainHeading}>Trung Tâm Heo Con</Text>
            <Text style={styles.subHeading}>
              Chào {profile?.full_name || 'bạn'}! Khám phá giải trí & bản đồ khu phố
            </Text>
          </View>

          {/* Huy hiệu chuỗi ngày */}
          <View style={styles.streakBadge}>
            <Flame size={16} color="#E0452B" strokeWidth={2.8} />
            <Text style={styles.streakText}>{streakDays || 1} ngày</Text>
          </View>
        </View>
      </View>

      {/* 2. LƯỚI 4 THẺ NEO-BRUTALIST */}
      <View style={styles.cardsGrid}>
        {CARDS.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[styles.card, { backgroundColor: '#FFFBF1' }]}
            activeOpacity={0.88}
            onPress={() => handlePressCard(card.id)}
          >
            {/* Top row of card */}
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: card.accentBg }]}>
                {card.icon}
              </View>
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>{card.badge}</Text>
              </View>
            </View>

            {/* Content */}
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardTagline}>{card.tagline}</Text>
              <Text style={styles.cardDesc}>{card.desc}</Text>
            </View>

            {/* Footer action bar */}
            <View style={styles.cardFooter}>
              <Text style={styles.actionText}>Khám phá ngay</Text>
              <View style={styles.arrowCircle}>
                <ChevronRight size={16} color="#2B2118" strokeWidth={2.8} />
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleColumn: {
    flex: 1,
    marginRight: 10,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFBF1',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 6,
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
  mainHeading: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 26,
    lineHeight: 32,
    color: '#2B2118',
  },
  subHeading: {
    fontFamily: 'Nunito',
    fontWeight: '600',
    fontSize: 13,
    color: '#85735E',
    marginTop: 2,
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
    paddingVertical: 6,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  streakText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 13,
    color: '#2B2118',
    fontVariant: ['tabular-nums'],
  },
  cardsGrid: {
    gap: 14,
  },
  card: {
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#2B2118',
    padding: 16,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: '#2B2118',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  badgePill: {
    backgroundColor: '#F6EEDC',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  badgePillText: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 10.5,
    color: '#85735E',
    letterSpacing: 0.6,
  },
  cardBody: {
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 20,
    lineHeight: 24,
    color: '#2B2118',
  },
  cardTagline: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 13,
    color: '#85735E',
    marginTop: 2,
    marginBottom: 4,
  },
  cardDesc: {
    fontFamily: 'Nunito',
    fontWeight: '600',
    fontSize: 12.5,
    lineHeight: 18,
    color: '#4A3D30',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#EADFC7',
  },
  actionText: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 13,
    color: '#2B2118',
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F4B93B',
    borderWidth: 2,
    borderColor: '#2B2118',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpacer: {
    height: 50,
  },
});
