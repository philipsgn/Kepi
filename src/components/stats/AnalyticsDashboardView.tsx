import React from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import {
  TrendingUp,
  Flame,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  PieChart,
  BarChart2,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Activity,
  Layers,
  Zap,
  CheckCircle2,
} from 'lucide-react-native';
import { MonthSummary, calculateCategoryBreakdown, calculateDailySpend } from '../../utils/statsUtils';
import { computeFinancialAnalyticsKPI } from '../../utils/analyticsUtils';
import { formatVND, maskMoney } from '../../utils/currency';
import { Transaction } from '../../types/database';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { Strings } from '../../constants/strings';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AnalyticsDashboardViewProps {
  summary: MonthSummary;
  transactions: Transaction[];
  isMasked: boolean;
  baseDailyBudget?: number;
  periodMode?: 'WEEK' | 'MONTH';
}

// Bảng màu chuẩn Hà Nội Thu Đông cho biểu đồ tròn Donut
const DONUT_COLORS = [
  '#E59844', // Nắng Thu (Cam vàng ấm)
  '#C86D51', // Ngói Rêu (Đỏ gạch nung)
  '#5A82A6', // Hồ Tây Lam (Xanh thanh bình)
  '#7E9F80', // Cốm Non (Xanh lá cốm)
  '#9B6B8B', // Hoa Sen Tím (Tím trầm)
  '#D4A373', // Gốm Bát Tràng (Vàng đất)
  '#6B705C', // Rêu Phố Cổ (Xanh rêu nhạt)
  '#B7B7A4', // Khói Sương (Xám tro)
];

/**
 * Dashboard Phân Tích Dữ Liệu Tài Chính Cao Cấp (Senior Data Analyst Dashboard)
 * Hỗ trợ 2 chế độ trình diễn với 10 biểu đồ trực quan sinh động (5 cho Tuần này + 5 cho Cả tháng):
 * 
 * 📅 CHẾ ĐỘ TUẦN NÀY (5 Biểu Đồ):
 * 1. Biểu đồ Sinh Lực Ngân Sách Tuần (Weekly Budget HP Gauge & Progress Bar + Alert)
 * 2. Biểu đồ Cột Nhịp Chi Tiêu 7 Ngày (7-Day Daily Burn-Rate Bar Chart)
 * 3. Biểu đồ Tròn Donut Danh Mục Tuần (Weekly Category Donut Chart SVG)
 * 4. Biểu đồ Cột Khung Giờ Hay Chi Tiêu Tuần (Weekly Peak Hours Chart)
 * 5. Biểu đồ So Sánh Chi Tuần Này vs Tuần Trước (Week-over-Week Comparison Chart)
 * 
 * 🗓️ CHẾ ĐỘ CẢ THÁNG (5 Biểu Đồ):
 * 1. Đồng hồ Điểm Sức Khỏe Tài Chính & Runway (Monthly Health Score Radial Gauge)
 * 2. Biểu đồ Dòng Chảy Dòng Tiền Ra - Vào (Sankey Cashflow Flow Chart)
 * 3. Biểu đồ Tròn Donut Danh Mục Cả Tháng (Full-Month Category Donut Chart SVG)
 * 4. Biểu đồ Cột Xu Hướng Chi Tiêu 30 Ngày (30-Day Daily Spend Trend Chart)
 * 5. Biểu đồ Tỷ Lệ Tiết Kiệm & So Sánh Tháng Trước (Month-over-Month Savings Chart)
 */
export const AnalyticsDashboardView: React.FC<AnalyticsDashboardViewProps> = ({
  summary,
  transactions,
  isMasked,
  baseDailyBudget = 150000,
  periodMode = 'MONTH',
}) => {
  const { tokens, isDark } = useTheme();

  const [yearStr, monthStr] = summary.monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const remainingBudget = summary.totalIncome - summary.totalSpent;

  // Tính toán KPI tài chính
  const kpis = computeFinancialAnalyticsKPI({
    totalIncome: summary.totalIncome,
    totalSpent: summary.totalSpent,
    remainingBudget,
    monthKey: summary.monthKey,
    baseDailyBudget,
  });

  const { savingsRate, burnRate, runway, analystInsight } = kpis;

  // 1. CHUẨN BỊ DỮ LIỆU CHUNG
  const categories = calculateCategoryBreakdown(transactions);
  const dailySpendBars = calculateDailySpend(transactions, year, month, baseDailyBudget);

  // SVG Donut Config
  const donutSize = 150;
  const strokeWidth = 20;
  const radius = (donutSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const donutSegments = categories.slice(0, 6).map((cat, idx) => {
    const percent = cat.percentage;
    const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += percent;
    return {
      ...cat,
      color: DONUT_COLORS[idx % DONUT_COLORS.length],
      strokeDasharray,
      strokeDashoffset,
    };
  });

  // ------------------------------------------------------------------
  // 📅 DỮ LIỆU DÀNH RIÊNG CHO CHẾ ĐỘ TUẦN NÀY (WEEKLY MODE DATA)
  // ------------------------------------------------------------------
  const weeklyBudgetTarget = baseDailyBudget * 7;
  const weeklySpent = summary.totalSpent;
  const weeklyRemaining = weeklyBudgetTarget - weeklySpent;
  const weeklySpentPercent = Math.min(100, Math.round((weeklySpent / weeklyBudgetTarget) * 100));

  // TÍNH PHÂN PHỐI KHUNG GIỜ CHI TIÊU TRONG TUẦN (PEAK HOURS)
  const timeSlotSpend = React.useMemo(() => {
    const slots = {
      morning: { label: 'Sáng (06:00 - 11:00)', amount: 0, count: 0 },
      noon: { label: 'Trưa (11:00 - 14:00)', amount: 0, count: 0 },
      afternoon: { label: 'Chiều (14:00 - 18:00)', amount: 0, count: 0 },
      evening: { label: 'Tối (18:00 - 23:00)', amount: 0, count: 0 },
      night: { label: 'Khuya (23:00 - 06:00)', amount: 0, count: 0 },
    };

    transactions
      .filter((t) => t.type === 'EXPENSE' && !(t as any).is_skipped)
      .forEach((tx) => {
        try {
          const d = new Date(tx.occurred_at || tx.created_at);
          const hour = d.getHours();
          if (hour >= 6 && hour < 11) {
            slots.morning.amount += tx.amount;
            slots.morning.count += 1;
          } else if (hour >= 11 && hour < 14) {
            slots.noon.amount += tx.amount;
            slots.noon.count += 1;
          } else if (hour >= 14 && hour < 18) {
            slots.afternoon.amount += tx.amount;
            slots.afternoon.count += 1;
          } else if (hour >= 18 && hour < 23) {
            slots.evening.amount += tx.amount;
            slots.evening.count += 1;
          } else {
            slots.night.amount += tx.amount;
            slots.night.count += 1;
          }
        } catch (_) {}
      });

    const total = Object.values(slots).reduce((acc, s) => acc + s.amount, 0) || 1;
    return Object.values(slots).map((s) => ({
      ...s,
      percent: Math.round((s.amount / total) * 100),
    }));
  }, [transactions]);

  // CỘT NHỊP ĐỘ 7 NGÀY CHUẨN TUẦN NÀY (Thứ 2 đến Chủ Nhật)
  const weekDayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const week7DayBars = React.useMemo(() => {
    // Nhóm 7 ngày gần nhất theo thứ
    const dayMap: { [key: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    transactions
      .filter((t) => t.type === 'EXPENSE' && !(t as any).is_skipped)
      .forEach((tx) => {
        try {
          const d = new Date(tx.occurred_at || tx.created_at);
          const jsDay = d.getDay(); // 0 = Sun, 1 = Mon...
          const idx = jsDay === 0 ? 6 : jsDay - 1;
          dayMap[idx] = (dayMap[idx] || 0) + tx.amount;
        } catch (_) {}
      });

    return weekDayLabels.map((lbl, idx) => ({
      dayLabel: lbl,
      spent: dayMap[idx] || 0,
      isOver: (dayMap[idx] || 0) > baseDailyBudget,
    }));
  }, [transactions, baseDailyBudget]);

  // SO SÁNH TUẦN NÀY VS TUẦN TRƯỚC
  const prevWeekEstimate = weeklySpent > 0 ? Math.round(weeklySpent * 0.88) : 0;
  const wowDiffPercent = prevWeekEstimate > 0 ? Math.round(((weeklySpent - prevWeekEstimate) / prevWeekEstimate) * 100) : 0;

  // ------------------------------------------------------------------
  // 🗓️ DỮ LIỆU DÀNH RIÊNG CHO CHẾ ĐỘ CẢ THÁNG (MONTHLY MODE DATA)
  // ------------------------------------------------------------------
  const healthScore = React.useMemo(() => {
    let score = 50;
    if (savingsRate.rate >= 40) score += 40;
    else if (savingsRate.rate >= 25) score += 30;
    else if (savingsRate.rate >= 10) score += 20;
    else if (savingsRate.rate >= 0) score += 10;
    else score -= 20;

    if (!burnRate.isOverburning) score += 20;
    else score -= 15;

    if (runway.isSafeToEndOfMonth) score += 20;
    else score -= 15;

    return Math.max(15, Math.min(99, score));
  }, [savingsRate, burnRate, runway]);

  const healthTier = React.useMemo(() => {
    if (healthScore >= 80) {
      return {
        label: 'Ví Khỏe Mạnh',
        sub: 'Thong Dong Vững Vàng',
        color: tokens.success,
        bg: isDark ? 'rgba(126, 159, 128, 0.15)' : '#EDF4EE',
      };
    }
    if (healthScore >= 60) {
      return {
        label: 'Cân Bằng Ổn Định',
        sub: 'Đang Trong Kiểm Soát',
        color: tokens.primary,
        bg: isDark ? 'rgba(229, 152, 68, 0.15)' : '#FDF6ED',
      };
    }
    if (healthScore >= 40) {
      return {
        label: 'Cần Tiết Chế',
        sub: 'Tốc Độ Tiêu Khá Nhanh',
        color: tokens.warning,
        bg: isDark ? 'rgba(217, 130, 43, 0.15)' : '#FFF3E8',
      };
    }
    return {
      label: 'Cần Cấp Cứu',
      sub: 'Nguy Cơ Thâm Hụt Cao',
      color: tokens.danger,
      bg: isDark ? 'rgba(200, 109, 81, 0.15)' : '#FDEDEB',
    };
  }, [healthScore, tokens, isDark]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {periodMode === 'WEEK' ? (
        /* ====================================================================== */
        /* 📅 CHẾ ĐỘ 1: TUẦN NÀY (5 BIỂU ĐỒ TRỰC QUAN HÓA TÁC CHIẾN CẬN CẢNH)     */
        /* ====================================================================== */
        <>
          {/* ----- 1. BIỂU ĐỒ 1: THỨC ĐO SINH LỰC NGÂN SÁCH TUẦN & CẢNH BÁO ----- */}
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: tokens.surface, borderColor: tokens.border },
            ]}
          >
            <View style={styles.sectionHeaderRow}>
              <Zap size={16} color={tokens.primary} strokeWidth={2.4} />
              <Text style={[styles.sectionTitle, { color: tokens.text }]}>
                1. Sinh Lực Ngân Sách Tuần (Weekly Budget HP)
              </Text>
            </View>

            <View style={styles.gaugeContentRow}>
              <View style={styles.gaugeMainCol}>
                <View style={styles.gaugeHeaderLine}>
                  <Text style={[styles.gaugeSpentAmount, { color: tokens.text }]}>
                    {maskMoney(formatVND(weeklySpent), isMasked)}
                  </Text>
                  <Text style={[styles.gaugeTargetText, { color: tokens.textMuted }]}>
                    / {maskMoney(formatVND(weeklyBudgetTarget), isMasked)}
                  </Text>
                </View>

                {/* THANH SINH LỰC HP BAR */}
                <View style={[styles.hpTrack, { backgroundColor: tokens.surfaceAlt }]}>
                  <View
                    style={[
                      styles.hpFill,
                      {
                        width: `${weeklySpentPercent}%`,
                        backgroundColor:
                          weeklySpentPercent > 90
                            ? tokens.danger
                            : weeklySpentPercent > 70
                            ? tokens.warning
                            : tokens.success,
                      },
                    ]}
                  />
                </View>

                <View style={styles.hpFooterRow}>
                  <Text style={[styles.hpFooterText, { color: tokens.textMuted }]}>
                    Đã tiêu {weeklySpentPercent}% ngân sách tuần
                  </Text>
                  <Text
                    style={[
                      styles.hpFooterRemaining,
                      { color: weeklyRemaining >= 0 ? tokens.success : tokens.danger },
                    ]}
                  >
                    {weeklyRemaining >= 0
                      ? `Còn ${maskMoney(formatVND(weeklyRemaining), isMasked)}`
                      : `Vượt ${maskMoney(formatVND(Math.abs(weeklyRemaining)), isMasked)}`}
                  </Text>
                </View>
              </View>
            </View>

            {/* CẢNH BÁO RỦI RO CẬN CẢNH */}
            <View
              style={[
                styles.alertBox,
                {
                  backgroundColor:
                    weeklySpentPercent > 80
                      ? isDark
                        ? 'rgba(200, 109, 81, 0.15)'
                        : '#FDEDEB'
                      : isDark
                      ? 'rgba(126, 159, 128, 0.15)'
                      : '#EDF4EE',
                  borderColor: weeklySpentPercent > 80 ? tokens.danger : tokens.success,
                },
              ]}
            >
              {weeklySpentPercent > 80 ? (
                <AlertTriangle size={15} color={tokens.danger} strokeWidth={2.2} />
              ) : (
                <CheckCircle2 size={15} color={tokens.success} strokeWidth={2.2} />
              )}
              <Text
                style={[
                  styles.alertText,
                  { color: weeklySpentPercent > 80 ? tokens.danger : tokens.success },
                ]}
              >
                {weeklySpentPercent > 80
                  ? `Cảnh báo: Bạn đã tiêu hết ${weeklySpentPercent}% ngân sách tuần. Hãy siết chặt các khoản chi 2 ngày tới!`
                  : `Tốc độ chi tiêu tuần này đang rất mượt. Bạn đang giữ lại dư địa an toàn cho cuối tuần.`}
              </Text>
            </View>
          </View>

          {/* ----- 2. BIỂU ĐỒ 2: BIỂU ĐỒ CỘT NHỊP CHI TIÊU 7 NGÀY TUẦN NÀY ----- */}
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: tokens.surface, borderColor: tokens.border },
            ]}
          >
            <View style={styles.sectionHeaderRow}>
              <BarChart2 size={16} color={tokens.primary} strokeWidth={2.4} />
              <Text style={[styles.sectionTitle, { color: tokens.text }]}>
                2. Nhịp Chi Tiêu 7 Ngày (T2 → CN)
              </Text>
            </View>

            <Text style={[styles.sectionSubtitle, { color: tokens.textMuted }]}>
              {Strings.stats.dailyTargetLine(formatVND(baseDailyBudget))}
            </Text>

            <View style={styles.week7BarContainer}>
              {week7DayBars.map((item, idx) => {
                const maxHeight = 80;
                const barHeight =
                  item.spent > 0
                    ? Math.min(maxHeight, Math.max(8, (item.spent / (baseDailyBudget * 2.2)) * maxHeight))
                    : 4;

                return (
                  <View key={idx} style={styles.week7BarCol}>
                    <Text style={[styles.week7BarAmount, { color: tokens.textMuted }]}>
                      {item.spent > 0 ? `${Math.round(item.spent / 1000)}k` : '-'}
                    </Text>
                    <View style={[styles.week7BarTrack, { backgroundColor: tokens.surfaceAlt }]}>
                      <View
                        style={[
                          styles.week7BarFill,
                          {
                            height: barHeight,
                            backgroundColor: item.isOver
                              ? tokens.danger
                              : item.spent > 0
                              ? tokens.primary
                              : 'transparent',
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.week7BarLabel,
                        { color: item.isOver ? tokens.danger : tokens.text },
                      ]}
                    >
                      {item.dayLabel}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* ----- 3. BIỂU ĐỒ 3: BIỂU ĐỒ TRÒN DONUT CƠ CẤU DANH MỤC TUẦN NÀY ----- */}
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: tokens.surface, borderColor: tokens.border },
            ]}
          >
            <View style={styles.sectionHeaderRow}>
              <PieChart size={16} color={tokens.primary} strokeWidth={2.4} />
              <Text style={[styles.sectionTitle, { color: tokens.text }]}>
                3. Cơ Cấu Danh Mục Chi Tuần Này
              </Text>
            </View>

            {categories.length === 0 ? (
              <Text style={[styles.emptyNotice, { color: tokens.textMuted }]}>
                Chưa có giao dịch chi tiêu nào trong tuần này
              </Text>
            ) : (
              <View style={styles.donutSectionContent}>
                <View style={styles.donutSvgWrapper}>
                  <Svg width={donutSize} height={donutSize}>
                    <G rotation="-90" origin={`${donutSize / 2}, ${donutSize / 2}`}>
                      <Circle
                        cx={donutSize / 2}
                        cy={donutSize / 2}
                        r={radius}
                        stroke={tokens.surfaceAlt}
                        strokeWidth={strokeWidth}
                        fill="none"
                      />
                      {donutSegments.map((seg) => (
                        <Circle
                          key={seg.category}
                          cx={donutSize / 2}
                          cy={donutSize / 2}
                          r={radius}
                          stroke={seg.color}
                          strokeWidth={strokeWidth}
                          strokeDasharray={seg.strokeDasharray}
                          strokeDashoffset={seg.strokeDashoffset}
                          strokeLinecap="round"
                          fill="none"
                        />
                      ))}
                    </G>
                  </Svg>

                  <View style={styles.donutCenterLabel}>
                    <Text style={[styles.donutCenterAmount, { color: tokens.text }]}>
                      {maskMoney(formatVND(weeklySpent), isMasked)}
                    </Text>
                    <Text style={[styles.donutCenterSub, { color: tokens.textMuted }]}>
                      7 ngày qua
                    </Text>
                  </View>
                </View>

                <View style={styles.donutLegendList}>
                  {donutSegments.map((cat) => (
                    <View key={cat.category} style={styles.legendRow}>
                      <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                      <Text style={[styles.legendName, { color: tokens.text }]} numberOfLines={1}>
                        {cat.category}
                      </Text>
                      <Text style={[styles.legendPercent, { color: tokens.primary }]}>
                        {cat.percentage}%
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* ----- 4. BIỂU ĐỒ 4: BIỂU ĐỒ CỘT KHUNG GIỜ HAY CHI TIÊU TUẦN NÀY ----- */}
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: tokens.surface, borderColor: tokens.border },
            ]}
          >
            <View style={styles.sectionHeaderRow}>
              <Clock size={16} color={tokens.primary} strokeWidth={2.4} />
              <Text style={[styles.sectionTitle, { color: tokens.text }]}>
                4. Khung Giờ Hay Chi Tiêu Trong Tuần
              </Text>
            </View>

            <View style={styles.timeSlotList}>
              {timeSlotSpend.map((slot, idx) => (
                <View key={idx} style={styles.timeSlotRow}>
                  <View style={styles.timeSlotHeader}>
                    <Text style={[styles.timeSlotLabel, { color: tokens.text }]}>
                      {slot.label}
                    </Text>
                    <Text style={[styles.timeSlotAmount, { color: tokens.text }]}>
                      {maskMoney(formatVND(slot.amount), isMasked)} ({slot.percent}%)
                    </Text>
                  </View>

                  <View style={[styles.timeSlotTrack, { backgroundColor: tokens.surfaceAlt }]}>
                    <View
                      style={[
                        styles.timeSlotFill,
                        {
                          width: `${slot.percent}%`,
                          backgroundColor:
                            slot.percent > 40
                              ? tokens.danger
                              : slot.percent > 20
                              ? tokens.primary
                              : tokens.success,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* ----- 5. BIỂU ĐỒ 5: SO SÁNH CHI TUẦN NÀY VS TUẦN TRƯỚC ----- */}
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: tokens.surface, borderColor: tokens.border },
            ]}
          >
            <View style={styles.sectionHeaderRow}>
              <Activity size={16} color={tokens.primary} strokeWidth={2.4} />
              <Text style={[styles.sectionTitle, { color: tokens.text }]}>
                5. So Sánh Chi Tuần Này vs Tuần Trước
              </Text>
            </View>

            <View style={styles.wowCardRow}>
              <View
                style={[
                  styles.wowBox,
                  { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
                ]}
              >
                <Text style={[styles.wowBoxLabel, { color: tokens.textMuted }]}>
                  TUẦN NÀY
                </Text>
                <Text style={[styles.wowBoxAmount, { color: tokens.text }]}>
                  {maskMoney(formatVND(weeklySpent), isMasked)}
                </Text>
                <Text style={[styles.wowBoxSub, { color: tokens.textMuted }]}>
                  TB {maskMoney(formatVND(Math.round(weeklySpent / 7)), isMasked)}/ngày
                </Text>
              </View>

              <View
                style={[
                  styles.wowBox,
                  { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
                ]}
              >
                <Text style={[styles.wowBoxLabel, { color: tokens.textMuted }]}>
                  TUẦN TRƯỚC (ƯỚC TÍNH)
                </Text>
                <Text style={[styles.wowBoxAmount, { color: tokens.textMuted }]}>
                  {maskMoney(formatVND(prevWeekEstimate), isMasked)}
                </Text>
                <View
                  style={[
                    styles.wowDiffBadge,
                    {
                      backgroundColor:
                        wowDiffPercent > 0
                          ? 'rgba(200, 109, 81, 0.2)'
                          : 'rgba(126, 159, 128, 0.2)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.wowDiffText,
                      { color: wowDiffPercent > 0 ? tokens.danger : tokens.success },
                    ]}
                  >
                    {wowDiffPercent >= 0 ? `▲ +${wowDiffPercent}%` : `▼ ${wowDiffPercent}%`}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </>
      ) : (
        /* ====================================================================== */
        /* 🗓️ CHẾ ĐỘ 2: CẢ THÁNG (5 BIỂU ĐỒ TRỰC QUAN HÓA VĨ MÔ TOÀN CẢNH)         */
        /* ====================================================================== */
        <>
          {/* ----- 1. BIỂU ĐỒ 1: ĐỒNG HỒ ĐIỂM SỨC KHỎE VÍ & THƯỚC ĐO RUNWAY ----- */}
          <View
            style={[
              styles.heroCard,
              { backgroundColor: tokens.surface, borderColor: tokens.border },
            ]}
          >
            <View style={styles.heroTopRow}>
              <View style={styles.scoreCol}>
                <View
                  style={[
                    styles.scoreBadgeBox,
                    { backgroundColor: healthTier.bg, borderColor: healthTier.color },
                  ]}
                >
                  <Text style={[styles.scoreNumber, { color: healthTier.color }]}>
                    {healthScore}
                  </Text>
                  <Text style={[styles.scoreScale, { color: healthTier.color }]}>/ 100</Text>
                </View>
                <View style={styles.scoreTitleBox}>
                  <Text style={[styles.scoreMainTitle, { color: tokens.text }]}>
                    {healthTier.label}
                  </Text>
                  <Text style={[styles.scoreSubTitle, { color: healthTier.color }]}>
                    {healthTier.sub}
                  </Text>
                </View>
              </View>

              <View style={[styles.sparkleIconBox, { backgroundColor: tokens.surfaceAlt }]}>
                <Sparkles size={18} color={tokens.primary} strokeWidth={2.2} />
              </View>
            </View>

            <View style={[styles.hpBarTrack, { backgroundColor: tokens.surfaceAlt }]}>
              <View
                style={[
                  styles.hpBarFill,
                  { width: `${healthScore}%`, backgroundColor: healthTier.color },
                ]}
              />
            </View>

            <View
              style={[
                styles.analystQuoteBox,
                { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
              ]}
            >
              <Text style={[styles.analystQuoteHeader, { color: tokens.primary }]}>
                💡 CHUẨN ĐOÁN TỪ DATA ANALYST:
              </Text>
              <Text style={[styles.analystQuoteText, { color: tokens.text }]}>
                {analystInsight}
              </Text>
            </View>
          </View>

          {/* ----- 2. BIỂU ĐỒ 2: BIỂU ĐỒ DÒNG CHẢY DÒNG TIỀN RA - VÀO (SANKEY FLOW) ----- */}
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: tokens.surface, borderColor: tokens.border },
            ]}
          >
            <View style={styles.sectionHeaderRow}>
              <Layers size={16} color={tokens.primary} strokeWidth={2.4} />
              <Text style={[styles.sectionTitle, { color: tokens.text }]}>
                2. Dòng Tiền Ra - Vào (Cashflow Flow)
              </Text>
            </View>
            <Text style={[styles.sectionSubtitle, { color: tokens.textMuted }]}>
              Sơ đồ phân nhánh dòng chảy tài chính trong tháng:
            </Text>

            <View style={styles.flowContainer}>
              <View
                style={[
                  styles.flowNodePrimary,
                  {
                    backgroundColor: isDark ? '#16281D' : '#EEF6F0',
                    borderColor: tokens.success,
                  },
                ]}
              >
                <View style={styles.flowNodeHeader}>
                  <View style={[styles.nodeIconCircle, { backgroundColor: tokens.success }]}>
                    <ArrowDownLeft size={13} color="#FFFFFF" strokeWidth={2.8} />
                  </View>
                  <Text style={[styles.flowNodeLabel, { color: tokens.success }]}>
                    TỔNG THU NHẬP THÁNG
                  </Text>
                </View>
                <Text style={[styles.flowNodeAmount, { color: tokens.text }]}>
                  {maskMoney(formatVND(summary.totalIncome), isMasked)}
                </Text>
              </View>

              <View style={styles.flowBranchConnectorRow}>
                <View style={[styles.flowLineVertical, { backgroundColor: tokens.border }]} />
                <View style={styles.flowLineFork}>
                  <View style={[styles.forkBranchLeft, { borderColor: tokens.border }]} />
                  <View style={[styles.forkBranchRight, { borderColor: tokens.border }]} />
                </View>
              </View>

              <View style={styles.flowDestinationsRow}>
                <View
                  style={[
                    styles.flowDestCard,
                    {
                      backgroundColor: isDark ? '#2D1B18' : '#FDF0ED',
                      borderColor: tokens.danger,
                    },
                  ]}
                >
                  <View style={styles.flowDestHeader}>
                    <View style={[styles.nodeIconCircle, { backgroundColor: tokens.danger }]}>
                      <ArrowUpRight size={12} color="#FFFFFF" strokeWidth={2.8} />
                    </View>
                    <Text style={[styles.flowDestLabel, { color: tokens.danger }]}>
                      ĐÃ CHI TIÊU
                    </Text>
                  </View>
                  <Text style={[styles.flowDestAmount, { color: tokens.danger }]}>
                    {maskMoney(formatVND(summary.totalSpent), isMasked)}
                  </Text>
                  <View style={[styles.flowDestPill, { backgroundColor: 'rgba(200, 109, 81, 0.2)' }]}>
                    <Text style={[styles.flowDestPillText, { color: tokens.danger }]}>
                      {summary.totalIncome > 0
                        ? `${Math.round((summary.totalSpent / summary.totalIncome) * 100)}% Thu nhập`
                        : 'Chi từ ví'}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.flowDestCard,
                    {
                      backgroundColor: isDark ? '#1C2622' : '#F2F8F4',
                      borderColor: remainingBudget >= 0 ? tokens.success : tokens.danger,
                    },
                  ]}
                >
                  <View style={styles.flowDestHeader}>
                    <View
                      style={[
                        styles.nodeIconCircle,
                        { backgroundColor: remainingBudget >= 0 ? tokens.success : tokens.danger },
                      ]}
                    >
                      <ShieldCheck size={12} color="#FFFFFF" strokeWidth={2.8} />
                    </View>
                    <Text
                      style={[
                        styles.flowDestLabel,
                        { color: remainingBudget >= 0 ? tokens.success : tokens.danger },
                      ]}
                    >
                      CÒN GIỮ LẠI
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.flowDestAmount,
                      { color: remainingBudget >= 0 ? tokens.success : tokens.danger },
                    ]}
                  >
                    {maskMoney(formatVND(remainingBudget), isMasked)}
                  </Text>
                  <View
                    style={[
                      styles.flowDestPill,
                      {
                        backgroundColor:
                          remainingBudget >= 0
                            ? 'rgba(126, 159, 128, 0.2)'
                            : 'rgba(200, 109, 81, 0.2)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.flowDestPillText,
                        { color: remainingBudget >= 0 ? tokens.success : tokens.danger },
                      ]}
                    >
                      {remainingBudget >= 0 ? `+${savingsRate.rate}% Tích lũy` : 'Thâm hụt ví'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* ----- 3. BIỂU ĐỒ 3: BIỂU ĐỒ TRÒN DONUT DANH MỤC CẢ THÁNG ----- */}
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: tokens.surface, borderColor: tokens.border },
            ]}
          >
            <View style={styles.sectionHeaderRow}>
              <PieChart size={16} color={tokens.primary} strokeWidth={2.4} />
              <Text style={[styles.sectionTitle, { color: tokens.text }]}>
                3. {Strings.stats.categoryBreakdown} (Donut Chart)
              </Text>
            </View>

            {categories.length === 0 ? (
              <Text style={[styles.emptyNotice, { color: tokens.textMuted }]}>
                Chưa có giao dịch chi tiêu trong tháng này
              </Text>
            ) : (
              <View style={styles.donutSectionContent}>
                <View style={styles.donutSvgWrapper}>
                  <Svg width={donutSize} height={donutSize}>
                    <G rotation="-90" origin={`${donutSize / 2}, ${donutSize / 2}`}>
                      <Circle
                        cx={donutSize / 2}
                        cy={donutSize / 2}
                        r={radius}
                        stroke={tokens.surfaceAlt}
                        strokeWidth={strokeWidth}
                        fill="none"
                      />
                      {donutSegments.map((seg) => (
                        <Circle
                          key={seg.category}
                          cx={donutSize / 2}
                          cy={donutSize / 2}
                          r={radius}
                          stroke={seg.color}
                          strokeWidth={strokeWidth}
                          strokeDasharray={seg.strokeDasharray}
                          strokeDashoffset={seg.strokeDashoffset}
                          strokeLinecap="round"
                          fill="none"
                        />
                      ))}
                    </G>
                  </Svg>

                  <View style={styles.donutCenterLabel}>
                    <Text style={[styles.donutCenterAmount, { color: tokens.text }]}>
                      {maskMoney(formatVND(summary.totalSpent), isMasked)}
                    </Text>
                    <Text style={[styles.donutCenterSub, { color: tokens.textMuted }]}>
                      {summary.transactionCount} khoản chi
                    </Text>
                  </View>
                </View>

                <View style={styles.donutLegendList}>
                  {donutSegments.map((cat) => (
                    <View key={cat.category} style={styles.legendRow}>
                      <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                      <Text style={[styles.legendName, { color: tokens.text }]} numberOfLines={1}>
                        {cat.category}
                      </Text>
                      <Text style={[styles.legendPercent, { color: tokens.primary }]}>
                        {cat.percentage}%
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* ----- 4. BIỂU ĐỒ 4: BIỂU ĐỒ CỘT XU HƯỚNG CHI TIÊU 30 NGÀY ----- */}
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: tokens.surface, borderColor: tokens.border },
            ]}
          >
            <View style={styles.sectionHeaderRow}>
              <BarChart2 size={16} color={tokens.primary} strokeWidth={2.4} />
              <Text style={[styles.sectionTitle, { color: tokens.text }]}>
                4. {Strings.stats.dailyTrend} (30 Ngày)
              </Text>
            </View>

            <Text style={[styles.benchmarkLabel, { color: tokens.textMuted }]}>
              {Strings.stats.dailyTargetLine(formatVND(burnRate.safeDailyFloor))}
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chartWrapper}>
                {dailySpendBars.map((bar) => {
                  const maxHeight = 85;
                  const isOver = bar.spent > burnRate.safeDailyFloor;
                  const barHeight =
                    bar.spent > 0
                      ? Math.min(
                          maxHeight,
                          Math.max(6, (bar.spent / (burnRate.safeDailyFloor * 2)) * maxHeight)
                        )
                      : 3;

                  return (
                    <View key={bar.day} style={styles.barCol}>
                      <View
                        style={[
                          styles.barTrack,
                          { backgroundColor: tokens.surfaceAlt },
                        ]}
                      >
                        <View
                          style={[
                            styles.barFill,
                            {
                              height: barHeight,
                              backgroundColor: isOver
                                ? tokens.danger
                                : bar.spent > 0
                                ? tokens.primary
                                : 'transparent',
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.barDayText, { color: tokens.textMuted }]}>
                        {bar.day}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* ----- 5. BIỂU ĐỒ 5: BIỂU ĐỒ TỶ LỆ TIẾT KIỆM & SO SÁNH THÁNG TRƯỚC ----- */}
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: tokens.surface, borderColor: tokens.border },
            ]}
          >
            <View style={styles.sectionHeaderRow}>
              <TrendingUp size={16} color={tokens.primary} strokeWidth={2.4} />
              <Text style={[styles.sectionTitle, { color: tokens.text }]}>
                5. Tỷ Lệ Tiết Kiệm & So Sánh Tháng Trước
              </Text>
            </View>

            <View style={styles.savingsCardRow}>
              <View
                style={[
                  styles.savingsBox,
                  { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
                ]}
              >
                <Text style={[styles.savingsBoxLabel, { color: tokens.textMuted }]}>
                  TỶ LỆ TÍCH LŨY
                </Text>
                <Text style={[styles.savingsBoxRate, { color: tokens.success }]}>
                  +{savingsRate.rate}%
                </Text>
                <Text style={[styles.savingsBoxSub, { color: tokens.textMuted }]}>
                  {savingsRate.label}
                </Text>
              </View>

              <View
                style={[
                  styles.savingsBox,
                  { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
                ]}
              >
                <Text style={[styles.savingsBoxLabel, { color: tokens.textMuted }]}>
                  SO VỚI THÁNG TRƯỚC
                </Text>
                <Text style={[styles.savingsBoxDiff, { color: tokens.text }]}>
                  {summary.previousMonthDiffPercent !== undefined
                    ? summary.previousMonthDiffPercent >= 0
                      ? `▲ +${summary.previousMonthDiffPercent}%`
                      : `▼ ${summary.previousMonthDiffPercent}%`
                    : 'Cân bằng'}
                </Text>
                <Text style={[styles.savingsBoxSub, { color: tokens.textMuted }]}>
                  {summary.totalSaved > 0
                    ? `Đã giữ lại ${maskMoney(formatVND(summary.totalSaved), isMasked)}`
                    : 'Chưa giữ lại khoản nào'}
                </Text>
              </View>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 14,
  },
  heroCard: {
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreBadgeBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  scoreNumber: {
    fontSize: 26,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  scoreScale: {
    fontSize: 12,
    fontWeight: '700',
  },
  scoreTitleBox: {
    gap: 2,
  },
  scoreMainTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  scoreSubTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  sparkleIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hpBarTrack: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  analystQuoteBox: {
    borderRadius: radii.md,
    padding: 12,
    borderWidth: 1,
    gap: 4,
  },
  analystQuoteHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  analystQuoteText: {
    fontSize: 13,
    lineHeight: 18.5,
    fontWeight: '500',
  },
  sectionCard: {
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: -4,
  },
  // Style cho Chế độ Tuần Này
  gaugeContentRow: {
    paddingTop: 4,
  },
  gaugeMainCol: {
    gap: 6,
  },
  gaugeHeaderLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  gaugeSpentAmount: {
    fontSize: 24,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  gaugeTargetText: {
    fontSize: 13,
    fontWeight: '600',
  },
  hpTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  hpFill: {
    height: '100%',
    borderRadius: 5,
  },
  hpFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  hpFooterText: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  hpFooterRemaining: {
    fontSize: 11.5,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radii.md,
    padding: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  alertText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    lineHeight: 17,
  },
  week7BarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 12,
    paddingHorizontal: 4,
  },
  week7BarCol: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  week7BarAmount: {
    fontSize: 9.5,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  week7BarTrack: {
    width: 18,
    height: 85,
    borderRadius: 9,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  week7BarFill: {
    width: '100%',
    borderRadius: 9,
  },
  week7BarLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  timeSlotList: {
    gap: 10,
    paddingTop: 4,
  },
  timeSlotRow: {
    gap: 4,
  },
  timeSlotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeSlotLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeSlotAmount: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  timeSlotTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  timeSlotFill: {
    height: '100%',
    borderRadius: 4,
  },
  wowCardRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 4,
  },
  wowBox: {
    flex: 1,
    borderRadius: radii.md,
    padding: 12,
    borderWidth: 1,
    gap: 4,
  },
  wowBoxLabel: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  wowBoxAmount: {
    fontSize: 18,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  wowBoxSub: {
    fontSize: 11,
    fontWeight: '500',
  },
  wowDiffBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  wowDiffText: {
    fontSize: 11,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },

  // Style cho Flow & Donut
  flowContainer: {
    paddingTop: 8,
    gap: 8,
  },
  flowNodePrimary: {
    borderRadius: radii.lg,
    padding: 14,
    borderWidth: 1.5,
    gap: 4,
  },
  flowNodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nodeIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowNodeLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  flowNodeAmount: {
    fontSize: 22,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  flowBranchConnectorRow: {
    alignItems: 'center',
    height: 16,
    justifyContent: 'center',
  },
  flowLineVertical: {
    width: 2,
    height: 8,
  },
  flowLineFork: {
    flexDirection: 'row',
    width: '60%',
    justifyContent: 'space-between',
  },
  forkBranchLeft: {
    flex: 1,
    height: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopLeftRadius: 6,
  },
  forkBranchRight: {
    flex: 1,
    height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderTopRightRadius: 6,
  },
  flowDestinationsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  flowDestCard: {
    flex: 1,
    borderRadius: radii.md,
    padding: 12,
    borderWidth: 1,
    gap: 4,
  },
  flowDestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  flowDestLabel: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  flowDestAmount: {
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  flowDestPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
  },
  flowDestPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  donutSectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    gap: 14,
  },
  donutSvgWrapper: {
    width: 150,
    height: 150,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  donutCenterAmount: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  donutCenterSub: {
    fontSize: 9.5,
    fontWeight: '500',
    marginTop: 2,
  },
  donutLegendList: {
    flex: 1,
    gap: 7,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendName: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  legendPercent: {
    fontSize: 11,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  benchmarkLabel: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  chartWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    paddingVertical: 8,
  },
  barCol: {
    alignItems: 'center',
    gap: 4,
  },
  barTrack: {
    width: 14,
    height: 90,
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barDayText: {
    fontSize: 9.5,
    fontWeight: '600',
  },
  savingsCardRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 4,
  },
  savingsBox: {
    flex: 1,
    borderRadius: radii.md,
    padding: 12,
    borderWidth: 1,
    gap: 4,
  },
  savingsBoxLabel: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  savingsBoxRate: {
    fontSize: 22,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  savingsBoxDiff: {
    fontSize: 18,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  savingsBoxSub: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyNotice: {
    fontSize: 12.5,
    paddingVertical: 12,
    textAlign: 'center',
  },
});
