import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageSquare, ShieldCheck, Target, Users } from 'lucide-react-native';
import { Spacing } from '../../constants/layout';
import { Strings } from '../../constants/strings';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { useBottomInset } from '../../hooks/useBottomInset';

export const FriendsView: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { tokens } = useTheme();
  const { contentBottomPadding } = useBottomInset();

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg, paddingTop: insets.top + Spacing.sm }]}>
      {/* 1. TIÊU ĐỀ TRANG BẠN BÈ */}
      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: tokens.text }]}>{Strings.nav.friends}</Text>
        <View style={[styles.badge, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
          <Users size={14} color={tokens.primary} />
          <Text style={[styles.badgeText, { color: tokens.text }]}>Cùng nhau</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: contentBottomPadding + 20 },
        ]}
      >
        {/* KHỐI 1: HỎI BẠN TRƯỚC KHI MUA */}
        <Card variant="surface" style={styles.blockItem}>
          <View style={[styles.iconCircle, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
            <MessageSquare size={18} color={tokens.primary} />
          </View>
          <Text style={[styles.cardTitle, { color: tokens.text }]}>{Strings.budget.askFriend}</Text>
          <Text style={[styles.cardDesc, { color: tokens.textMuted }]}>
            Phân vân món đồ nào? Gửi ảnh nhờ bạn thân bấm "Nên mua" hoặc "Bỏ đi" giúp một tay.
          </Text>
          <Button
            title="Gửi câu hỏi cho bạn"
            variant="primary"
            size="md"
            onPress={() => {}}
            style={{ marginTop: 8 }}
          />
        </Card>

        {/* KHỐI 2: MỤC TIÊU TUẦN CÙNG NHAU */}
        <Card variant="surface" style={styles.blockItem}>
          <View style={[styles.iconCircle, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
            <Target size={18} color={tokens.primary} />
          </View>
          <Text style={[styles.cardTitle, { color: tokens.text }]}>
            {Strings.budget.weeklyGoal}
          </Text>
          <Text style={[styles.cardDesc, { color: tokens.textMuted }]}>
            Giữ 5 ngày liên tiếp trong hạn mức "Hôm nay tiêu được". Cùng bạn bè thi đua xem ai kỷ luật hơn.
          </Text>
          <View style={styles.friendStreakRow}>
            <View style={[styles.streakBadge, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
              <ShieldCheck size={14} color={tokens.success} />
              <Text style={[styles.streakText, { color: tokens.text }]}>Bồ: 3 ngày liên tiếp</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    gap: 12,
  },
  blockItem: {
    width: '100%',
    padding: 16,
    gap: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  friendStreakRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
