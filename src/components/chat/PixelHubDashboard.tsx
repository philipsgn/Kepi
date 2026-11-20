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
  MessageCircle,
  Users,
  Feather,
  Target,
  MapPin,
  ChevronRight,
  Flame,
  Ticket,
  Wheat,
  Utensils,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useGamificationStore } from '../../store/gamificationStore';
import { useAuthStore } from '../../store/authStore';
import { PixelPigAvatar } from '../pixel/PixelPigAvatar';

export type SubViewType = 'hub' | 'chat' | 'squad' | 'fly' | 'shooter' | 'map';

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

  const CARDS: HubCardItem[] = [
    {
      id: 'chat',
      title: 'Trò Chuyện & Bạn Bè',
      badge: 'AI COACH & SQUAD',
      tagline: 'Anh Minh Giữ Ví & Squad Nuôi Heo',
      desc: 'Hỏi đáp ngân sách, xin phản biện chi tiêu và tâm sự tài chính cùng Heo-Coach.',
      accentBg: '#BFDDF2',
      icon: <MessageCircle size={24} color="#2B2118" strokeWidth={2.6} />,
      statusText: 'Heo-Coach đang online',
    },
    {
      id: 'squad',
      title: 'Squad Nuôi Heo 2.0',
      badge: 'BẠN THÂN · PHÒNG KÍN',
      tagline: 'Nuôi Heo Chung & Locket Feed',
      desc: 'Cùng hội bạn thân nuôi heo chung, chia sẻ khoảnh khắc chi tiêu ẩn danh và cứu ví.',
      accentBg: '#FCECEF',
      icon: <Users size={24} color="#2B2118" strokeWidth={2.6} />,
      statusText: 'Phòng riêng 2-4 bạn',
    },
    {
      id: 'fly',
      title: 'Game Heo Bay',
      badge: 'FLAPPY PIG · 60FPS',
      tagline: 'Vỗ cánh hái đồ ăn & Né chướng ngại vật',
      desc: 'Gió lốc, chim đối thủ, thời tiết mưa bão; hái quả tiếp sức và mang về cho heo nhà.',
      accentBg: '#FBD3DC',
      icon: <Feather size={24} color="#2B2118" strokeWidth={2.6} />,
      statusText: `Kỷ lục: ${flyBestScore || 0} điểm`,
    },
    {
      id: 'shooter',
      title: 'Game Heo Bắn',
      badge: 'ANGRY PIG · ENDLESS',
      tagline: 'Kéo ná phá tháp & Cứu heo con',
      desc: 'Tháp vô tận, gió thổi biến thiên, giải cứu đàn heo con trong lồng sắt để mở khóa Heo Cánh và Heo Bom.',
      accentBg: '#F8C9B8',
      icon: <Target size={24} color="#2B2118" strokeWidth={2.6} />,
      statusText: `Màn cao nhất: Màn ${shooterMaxWave || 1}`,
    },
    {
      id: 'map',
      title: 'Bản Đồ Chi Tiêu',
      badge: 'GPS PIXEL · QUÁN QUEN',
      tagline: 'Khu phố chi tiêu & Heo đi dạo',
      desc: 'Tự động ghim các nơi bạn đã tiêu tiền trong ngày, theo dõi quán quen và cho heo đi dạo.',
      accentBg: '#D4ECC6',
      icon: <MapPin size={24} color="#2B2118" strokeWidth={2.6} />,
      statusText: 'Khu phố tưởng tượng',
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
            <Flame size={16} color="#E0452B" strokeWidth={2.8} />
            <Text style={styles.streakText}>{streakDays || 1} ngày</Text>
          </View>
        </View>

        {/* Banner Mascot chào hỏi */}
        <View style={styles.bannerRow}>
          <PixelPigAvatar size={48} mood={pigHunger >= 60 ? 'happy' : 'idle'} />
          <View style={styles.bannerInfo}>
            <Text style={styles.mainHeading}>Trung Tâm Heo Con</Text>
            <Text style={styles.subHeading} numberOfLines={2}>
              Chào {profile?.full_name || 'bạn'}! Khám phá giải trí & bản đồ khu phố
            </Text>
          </View>
        </View>

        {/* Chips Vé & Thức ăn */}
        <View style={styles.chipsRow}>
          <View style={styles.metricChip}>
            <Ticket size={18} color="#E0452B" strokeWidth={2.6} />
            <View>
              <Text style={styles.chipLabel}>Vé Chơi</Text>
              <Text style={styles.chipValue}>{gameTickets} vé</Text>
            </View>
          </View>

          <View style={styles.metricChip}>
            <Wheat size={18} color="#F4B93B" strokeWidth={2.6} />
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
            <Utensils size={14} color="#2B2118" strokeWidth={2.6} />
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

      {/* 3. LƯỚI 4 THẺ NEO-BRUTALIST */}
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
              <Text style={styles.statusText}>{card.statusText}</Text>
              <View style={styles.actionBtn}>
                <Text style={styles.actionText}>Khám phá</Text>
                <ChevronRight size={14} color="#2B2118" strokeWidth={2.8} />
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
    marginBottom: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBF1',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
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
    fontSize: 12,
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
    paddingHorizontal: 12,
    paddingVertical: 5,
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
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
    marginBottom: 12,
  },
  bannerInfo: {
    flex: 1,
  },
  mainHeading: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 24,
    lineHeight: 28,
    color: '#2B2118',
  },
  subHeading: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 12.5,
    color: '#85735E',
    marginTop: 2,
    lineHeight: 16,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  metricChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBF1',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  chipLabel: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 10.5,
    color: '#85735E',
    textTransform: 'uppercase',
  },
  chipValue: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 15,
    color: '#2B2118',
    fontVariant: ['tabular-nums'],
  },
  careCard: {
    backgroundColor: '#FFFBF1',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    borderRadius: 18,
    padding: 12,
    marginBottom: 14,
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
    letterSpacing: 0.6,
    color: '#85735E',
  },
  careSub: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 12,
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
    fontSize: 11.5,
    color: '#2B2118',
  },
  progressBarTrack: {
    height: 10,
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
    fontSize: 11,
    color: '#E0452B',
    marginTop: 6,
    textAlign: 'center',
  },
  cardsGrid: {
    gap: 12,
  },
  card: {
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#2B2118',
    padding: 14,
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
    marginBottom: 8,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: '#2B2118',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePill: {
    backgroundColor: '#F6EEDC',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgePillText: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 10,
    color: '#2B2118',
    letterSpacing: 0.5,
  },
  cardBody: {
    marginBottom: 10,
  },
  cardTitle: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 18,
    color: '#2B2118',
    marginBottom: 2,
  },
  cardTagline: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 12,
    color: '#E0452B',
    marginBottom: 4,
  },
  cardDesc: {
    fontFamily: 'Nunito',
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
    color: '#85735E',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: '#F6EEDC',
    paddingTop: 8,
  },
  statusText: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 11.5,
    color: '#85735E',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F4B93B',
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
  actionText: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 11,
    color: '#2B2118',
  },
  bottomSpacer: {
    height: 20,
  },
});
