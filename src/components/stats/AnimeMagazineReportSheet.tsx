import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { X, Sparkles, TrendingUp, Zap, HeartHandshake, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { PigFlyLottieMascot } from '../mascot/PigFlyLottieMascot';

interface AnimeMagazineReportSheetProps {
  visible: boolean;
  onClose: () => void;
  monthlyIncome?: number;
  monthlySpent?: number;
  remainingDays?: number;
  savingsRate?: number;
}

const { width } = Dimensions.get('window');

export const AnimeMagazineReportSheet: React.FC<AnimeMagazineReportSheetProps> = ({
  visible,
  onClose,
  monthlyIncome = 15000000,
  monthlySpent = 6500000,
  remainingDays = 14,
  savingsRate = 28,
}) => {
  const { tokens } = useTheme();

  // 1. Runway Score: Số ngày dòng tiền trụ được nếu chi tiêu theo tốc độ hiện tại
  const dailyBurn = monthlySpent / Math.max(1, 30 - remainingDays);
  const remainingCash = Math.max(0, monthlyIncome - monthlySpent);
  const runwayDays = dailyBurn > 0 ? Math.round(remainingCash / dailyBurn) : remainingDays;

  // 2. Impulse Ratio: Tỷ lệ chi tiêu bốc đồng (ước tính ~20% nếu kiểm soát tốt, ~45% nếu tiêu lố)
  const impulseRatio = savingsRate >= 20 ? 18 : 38;

  // 3. Savings Velocity: Tốc độ tích lũy hàng ngày
  const savingsVelocity = Math.round(remainingCash / Math.max(1, remainingDays));

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheetContainer, { backgroundColor: tokens.surface }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.magazineIssue, { color: tokens.primary }]}>
                PIGFLY WEEKLY DIGEST #08
              </Text>
              <Text style={[styles.magazineTitle, { color: tokens.text }]}>
                TẠP CHÍ TÀI CHÍNH ANIME
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={24} color={tokens.textMuted} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Panel 1: Hero Comic Banner */}
            <View style={[styles.comicPanel, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
              <View style={styles.panelHeader}>
                <Text style={[styles.panelBadge, { backgroundColor: tokens.primary }]}>CHƯƠNG 1</Text>
                <Text style={[styles.panelTitle, { color: tokens.text }]}>CHIẾN DỊCH GIỮ VÍ TUẦN QUA</Text>
              </View>
              <View style={styles.heroRow}>
                <PigFlyLottieMascot size={74} showBadge />
                <View style={styles.heroTextGroup}>
                  <Text style={[styles.heroQuote, { color: tokens.text }]}>
                    {savingsRate >= 20
                      ? '“Cơ bắp tài chính nở nang thấy rõ! Giữ phong độ này cuối tháng bao trọn chuyến đi chơi bồ nhé!”'
                      : '“Hôm nay ví hơi thở dốc rồi bồ ơi! Bớt trà sữa topping lại để heo lấy sức bay tiếp nào!”'}
                  </Text>
                  <Text style={[styles.coachSign, { color: tokens.primary }]}>
                    — Minh Locket (Anh PT Giữ Ví)
                  </Text>
                </View>
              </View>
            </View>

            {/* Panel 2: Bộ 3 Chỉ Số Sức Khỏe Mới */}
            <View style={[styles.comicPanel, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
              <View style={styles.panelHeader}>
                <Text style={[styles.panelBadge, { backgroundColor: tokens.primary }]}>CHƯƠNG 2</Text>
                <Text style={[styles.panelTitle, { color: tokens.text }]}>3 CHỈ SỐ RUNWAY & TỐC ĐỘ</Text>
              </View>

              <View style={styles.kpiGrid}>
                {/* KPI 1 */}
                <View style={[styles.kpiCard, { backgroundColor: tokens.surface }]}>
                  <View style={styles.kpiIconRow}>
                    <ShieldCheck size={18} color={tokens.primary} strokeWidth={2.4} />
                    <Text style={[styles.kpiLabel, { color: tokens.textMuted }]}>RUNWAY SCORE</Text>
                  </View>
                  <Text style={[styles.kpiValue, { color: tokens.text }]}>
                    {runwayDays} <Text style={styles.kpiUnit}>ngày</Text>
                  </Text>
                  <Text style={[styles.kpiSub, { color: tokens.textMuted }]}>
                    Dòng tiền đủ vững tới hết tháng
                  </Text>
                </View>

                {/* KPI 2 */}
                <View style={[styles.kpiCard, { backgroundColor: tokens.surface }]}>
                  <View style={styles.kpiIconRow}>
                    <Zap size={18} color={tokens.danger} strokeWidth={2.4} />
                    <Text style={[styles.kpiLabel, { color: tokens.textMuted }]}>IMPULSE RATIO</Text>
                  </View>
                  <Text style={[styles.kpiValue, { color: tokens.text }]}>
                    {impulseRatio}%
                  </Text>
                  <Text style={[styles.kpiSub, { color: tokens.textMuted }]}>
                    {impulseRatio < 25 ? 'Kiềm chế FOMO cực tốt' : 'Cần siết bớt mua sắm cảm xúc'}
                  </Text>
                </View>
              </View>

              {/* KPI 3: Savings Velocity */}
              <View style={[styles.velocityBanner, { backgroundColor: tokens.surface }]}>
                <View style={styles.kpiIconRow}>
                  <TrendingUp size={18} color={tokens.success} strokeWidth={2.4} />
                  <Text style={[styles.kpiLabel, { color: tokens.textMuted }]}>SAVINGS VELOCITY</Text>
                </View>
                <Text style={[styles.velocityValue, { color: tokens.success }]}>
                  +{savingsVelocity.toLocaleString('vi-VN')} đ / ngày
                </Text>
                <Text style={[styles.kpiSub, { color: tokens.textMuted }]}>
                  Tốc độ tiến tới mục tiêu tài chính Thác Nước
                </Text>
              </View>
            </View>

            {/* Panel 3: Lời Khuyên Tuần Tới */}
            <View style={[styles.comicPanel, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
              <View style={styles.panelHeader}>
                <Text style={[styles.panelBadge, { backgroundColor: tokens.primary }]}>CHƯƠNG 3</Text>
                <Text style={[styles.panelTitle, { color: tokens.text }]}>BÀI TẬP TUẦN MỚI CỦA MINH PT</Text>
              </View>
              <View style={styles.adviceItem}>
                <Text style={styles.adviceNum}>1.</Text>
                <Text style={[styles.adviceText, { color: tokens.text }]}>
                  Thử thách 48h nói KHÔNG với các thông báo flash sale mua sắm.
                </Text>
              </View>
              <View style={styles.adviceItem}>
                <Text style={styles.adviceNum}>2.</Text>
                <Text style={[styles.adviceText, { color: tokens.text }]}>
                  Chụp ảnh ít nhất 2 bữa ăn chính mỗi ngày để heo có năng lượng vỗ cánh.
                </Text>
              </View>
              <View style={styles.adviceItem}>
                <Text style={styles.adviceNum}>3.</Text>
                <Text style={[styles.adviceText, { color: tokens.text }]}>
                  Vào Cờ Tỷ Phú hoàn thành 2 lượt đổ xúc xắc nhận Flashcard Lãi Kép.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: '88%',
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  magazineIssue: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  magazineTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingBottom: 24,
    gap: 16,
  },
  comicPanel: {
    borderWidth: 2,
    borderRadius: 20,
    padding: 16,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  panelBadge: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  panelTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroTextGroup: {
    flex: 1,
  },
  heroQuote: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 19,
    marginBottom: 6,
  },
  coachSign: {
    fontSize: 11,
    fontWeight: '700',
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  kpiCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
  },
  kpiIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '800',
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  kpiUnit: {
    fontSize: 12,
    fontWeight: '600',
  },
  kpiSub: {
    fontSize: 10,
    marginTop: 4,
    lineHeight: 14,
  },
  velocityBanner: {
    padding: 12,
    borderRadius: 14,
  },
  velocityValue: {
    fontSize: 20,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    marginVertical: 4,
  },
  adviceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  adviceNum: {
    fontSize: 13,
    fontWeight: '900',
    color: '#E11D48',
  },
  adviceText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
});
