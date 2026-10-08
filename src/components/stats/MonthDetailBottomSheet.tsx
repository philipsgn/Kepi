import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { BarChart2, PieChart, Share2, X } from 'lucide-react-native';
import { Strings } from '../../constants/strings';
import { MonthSummary, calculateCategoryBreakdown, calculateDailySpend } from '../../utils/statsUtils';
import { formatVND, maskMoney } from '../../utils/currency';
import { Transaction } from '../../types/database';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';

interface MonthDetailBottomSheetProps {
  visible: boolean;
  summary: MonthSummary | null;
  transactions: Transaction[];
  isMasked: boolean;
  onClose: () => void;
  onShare?: () => void;
}

/**
 * Sheet phân tích chi tiết tháng — Phong cách "Ấm, tĩnh, sang"
 * Tuân thủ mục 2.3 & 2.6 của đặc tả docs/screens/STATS.md:
 * - Tổng quan: Đã chi, Thu, Còn lại, Đã giữ lại, Trung bình/ngày
 * - Chi tiêu theo danh mục: Thanh ngang kèm số tiền và %
 * - Cột chi tiêu từng ngày: Trực quan hóa cột chi + vạch định mức
 */
export const MonthDetailBottomSheet: React.FC<MonthDetailBottomSheetProps> = ({
  visible,
  summary,
  transactions,
  isMasked,
  onClose,
  onShare,
}) => {
  const { tokens, isDark } = useTheme();

  if (!visible || !summary) return null;

  const [yearStr, monthStr] = summary.monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  // Tính toán số liệu phân tích
  const categories = calculateCategoryBreakdown(transactions);
  const dailySpendBars = calculateDailySpend(transactions, year, month, 100_000);

  const daysInMonth = new Date(year, month, 0).getDate();
  const averagePerDay = Math.round(summary.totalSpent / daysInMonth);
  const netRemaining = summary.totalIncome - summary.totalSpent;

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onShare) onShare();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <BlurView
          intensity={25}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />

        <View style={[styles.sheetContainer, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
          {/* 1. THANH TIÊU ĐỀ SHEET */}
          <View style={[styles.headerRow, { borderBottomColor: tokens.border }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleClose}
              style={[styles.closeBtn, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}
            >
              <X size={16} color={tokens.text} strokeWidth={2.2} />
            </TouchableOpacity>

            <View style={styles.titleBox}>
              <Text style={[styles.sheetTitle, { color: tokens.text }]}>{summary.monthLabel}</Text>
              <Text style={[styles.sheetSubtitle, { color: tokens.textMuted }]}>{Strings.stats.monthDetailTitle}</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleShare}
              style={[styles.shareBtn, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}
            >
              <Share2 size={15} color={tokens.text} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* 2. KHỐI TỔNG QUAN THÁNG */}
            <View style={[styles.blockCard, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
              <Text style={[styles.cardSectionTitle, { color: tokens.text }]}>{Strings.stats.overview}</Text>

              <View style={styles.statsGrid}>
                {/* Đã chi */}
                <View style={styles.statBox}>
                  <Text style={[styles.statLabel, { color: tokens.textMuted }]}>{Strings.stats.spentPrefix}</Text>
                  <Text style={[styles.statValue, { color: tokens.text }]}>
                    {maskMoney(formatVND(summary.totalSpent), isMasked)}
                  </Text>
                </View>

                {/* Thu nhập */}
                <View style={styles.statBox}>
                  <Text style={[styles.statLabel, { color: tokens.textMuted }]}>{Strings.stats.incomePrefix}</Text>
                  <Text style={[styles.statValue, { color: tokens.success }]}>
                    {maskMoney(formatVND(summary.totalIncome), isMasked)}
                  </Text>
                </View>

                {/* Còn lại */}
                <View style={styles.statBox}>
                  <Text style={[styles.statLabel, { color: tokens.textMuted }]}>{Strings.stats.remaining}</Text>
                  <Text style={[styles.statValue, { color: netRemaining >= 0 ? tokens.success : tokens.danger }]}>
                    {maskMoney(formatVND(netRemaining), isMasked)}
                  </Text>
                </View>

                {/* Đã giữ lại */}
                <View style={styles.statBox}>
                  <Text style={[styles.statLabel, { color: tokens.textMuted }]}>{Strings.stats.savedPrefix}</Text>
                  <Text style={[styles.statValue, { color: tokens.primary }]}>
                    {maskMoney(formatVND(summary.totalSaved), isMasked)}
                  </Text>
                </View>
              </View>

              <View style={[styles.avgDivider, { borderTopColor: tokens.border }]}>
                <Text style={[styles.avgText, { color: tokens.textSub }]}>
                  {Strings.stats.itemsCount(summary.transactionCount)} ·{' '}
                  {Strings.stats.averagePerDay(maskMoney(formatVND(averagePerDay), isMasked))}
                </Text>
              </View>
            </View>

            {/* 3. CHI TIÊU THEO DANH MỤC */}
            <View style={[styles.blockCard, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
              <View style={styles.sectionHeaderIconRow}>
                <PieChart size={15} color={tokens.primary} strokeWidth={2.2} />
                <Text style={[styles.cardSectionTitle, { color: tokens.text, marginLeft: 6 }]}>
                  {Strings.stats.categoryBreakdown}
                </Text>
              </View>

              {categories.length === 0 ? (
                <Text style={[styles.emptyNotice, { color: tokens.textMuted }]}>Chưa có khoản chi nào trong tháng</Text>
              ) : (
                categories.map((cat) => (
                  <View key={cat.category} style={styles.categoryItem}>
                    <View style={styles.catTextRow}>
                      <Text style={[styles.catName, { color: tokens.text }]}>{cat.category}</Text>
                      <Text style={[styles.catAmount, { color: tokens.textSub }]}>
                        {maskMoney(formatVND(cat.total), isMasked)} ({cat.percentage}%)
                      </Text>
                    </View>
                    <View style={[styles.progressTrack, { backgroundColor: tokens.surface }]}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            backgroundColor: tokens.primary,
                            width: `${Math.min(100, Math.max(4, cat.percentage))}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* 4. CỘT CHI TIÊU TỪNG NGÀY */}
            <View style={[styles.blockCard, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
              <View style={styles.sectionHeaderIconRow}>
                <BarChart2 size={15} color={tokens.primary} strokeWidth={2.2} />
                <Text style={[styles.cardSectionTitle, { color: tokens.text, marginLeft: 6 }]}>
                  {Strings.stats.dailyTrend}
                </Text>
              </View>

              <Text style={[styles.benchmarkNote, { color: tokens.textMuted }]}>
                {Strings.stats.dailyTargetLine('100.000 đ')}
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chartWrapper}>
                  {dailySpendBars.map((bar) => {
                    const maxHeight = 90;
                    const heightPercent = bar.spent > 0 ? Math.min(maxHeight, Math.max(8, (bar.spent / 250_000) * maxHeight)) : 4;

                    return (
                      <View key={bar.day} style={styles.barCol}>
                        <View style={[styles.barTrack, { backgroundColor: tokens.surface }]}>
                          <View
                            style={[
                              styles.barFill,
                              {
                                height: heightPercent,
                                backgroundColor: bar.isOverTarget ? tokens.danger : tokens.primary,
                              },
                            ]}
                          />
                        </View>
                        <Text style={[styles.barDayText, { color: tokens.textMuted }]}>{bar.day}</Text>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    maxHeight: '88%',
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBox: {
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  sheetSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 1,
  },
  shareBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  blockCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 14,
  },
  cardSectionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 10,
  },
  sectionHeaderIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBox: {
    width: '48%',
    paddingVertical: 6,
  },
  statLabel: {
    fontSize: 11.5,
    fontWeight: '500',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  avgDivider: {
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 8,
  },
  avgText: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  emptyNotice: {
    fontSize: 12.5,
    paddingVertical: 8,
  },
  categoryItem: {
    marginBottom: 10,
  },
  catTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  catName: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  catAmount: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  benchmarkNote: {
    fontSize: 11.5,
    marginBottom: 8,
  },
  chartWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 110,
    paddingVertical: 6,
    gap: 6,
  },
  barCol: {
    alignItems: 'center',
    width: 14,
  },
  barTrack: {
    width: 6,
    height: 90,
    borderRadius: 3,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 3,
  },
  barDayText: {
    fontSize: 9.5,
    fontWeight: '600',
    marginTop: 4,
  },
});
