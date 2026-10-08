import React from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
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
  Award,
  Calendar,
  Layers,
  Zap,
} from 'lucide-react-native';
import { MonthSummary, calculateCategoryBreakdown, calculateDailySpend } from '../../utils/statsUtils';
import { computeFinancialAnalyticsKPI } from '../../utils/analyticsUtils';
import { formatVND, maskMoney } from '../../utils/currency';
import { Transaction } from '../../types/database';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { Strings } from '../../constants/strings';
import { getCategoryConfig } from '../../constants/categories';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AnalyticsDashboardViewProps {
  summary: MonthSummary;
  transactions: Transaction[];
  isMasked: boolean;
  baseDailyBudget?: number;
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
 * Thiết kế tối ưu cho người dùng lười, ít hiểu biết tài chính nhưng muốn nhìn 1 giây là hiểu ngay:
 * 1. Điểm Sức Khỏe Ví (Wallet Health Score 0-100) & Lời chuẩn đoán đắt giá của Senior Data Analyst.
 * 2. Flow Chart Dòng Tiền (Sankey Flow Chart: Thu Nhập -> Đã Chi (Nhánh) & Giữ Lại).
 * 3. Donut Chart Cơ Cấu Danh Mục (SVG Segmented Ring) chuẩn Vibe Hà Nội Thu Đông.
 * 4. Bảng Vàng "Top 3 Món Ngốn Tiền Nhất Tháng" giúp nhận diện ngay thủ phạm hao ví.
 * 5. Thước Đo Sức Bền Runway & Biểu Đồ Cột Nhịp Độ Hàng Ngày.
 */
export const AnalyticsDashboardView: React.FC<AnalyticsDashboardViewProps> = ({
  summary,
  transactions,
  isMasked,
  baseDailyBudget = 150000,
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

  // 1. TÍNH TOÁN ĐIỂM SỨC KHỎE VÍ (HEALTH SCORE 0 - 100 ĐIỂM)
  const healthScore = React.useMemo(() => {
    let score = 50; // Điểm cơ sở

    // Điểm từ tỷ lệ tiết kiệm (tối đa 40đ)
    if (savingsRate.rate >= 40) score += 40;
    else if (savingsRate.rate >= 25) score += 30;
    else if (savingsRate.rate >= 10) score += 20;
    else if (savingsRate.rate >= 0) score += 10;
    else score -= 20; // Thâm hụt

    // Điểm từ tốc độ đốt tiền (tối đa 30đ)
    if (!burnRate.isOverburning) score += 20;
    else score -= 15;

    // Điểm từ Runway an toàn (tối đa 20đ)
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

  // 2. TÍNH TOÁN CƠ CẤU DANH MỤC
  const categories = calculateCategoryBreakdown(transactions);
  const totalCategorySpent = categories.reduce((sum, c) => sum + c.total, 0) || 1;

  // 3. TOP 3 MÓN NGỐN TIỀN NHẤT THÁNG
  const topSpenders = React.useMemo(() => {
    const expenseList = transactions.filter(
      (tx) => tx.type === 'EXPENSE' && !(tx as any).is_skipped && tx.amount > 0
    );
    return expenseList.sort((a, b) => b.amount - a.amount).slice(0, 3);
  }, [transactions]);

  // 4. DỮ LIỆU NHỊP ĐỘ HÀNG NGÀY
  const dailySpendBars = calculateDailySpend(transactions, year, month, baseDailyBudget);

  // 5. TÍNH TOÁN THÔNG SỐ DONUT CHART (SVG)
  const donutSize = 160;
  const strokeWidth = 22;
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

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* ================= 1. HERO CARD: ĐIỂM SỨC KHỎE VÍ & LỜI CHUẨN ĐOÁN ================= */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: tokens.surface,
            borderColor: tokens.border,
          },
        ]}
      >
        <View style={styles.heroTopRow}>
          {/* CỘT ĐIỂM SỐ CHUNKY */}
          <View style={styles.scoreCol}>
            <View style={[styles.scoreBadgeBox, { backgroundColor: healthTier.bg, borderColor: healthTier.color }]}>
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

          {/* ICON SPARKLES */}
          <View style={[styles.sparkleIconBox, { backgroundColor: tokens.surfaceAlt }]}>
            <Sparkles size={18} color={tokens.primary} strokeWidth={2.2} />
          </View>
        </View>

        {/* THANH SINH LỰC HP BAR */}
        <View style={[styles.hpBarTrack, { backgroundColor: tokens.surfaceAlt }]}>
          <View
            style={[
              styles.hpBarFill,
              {
                width: `${healthScore}%`,
                backgroundColor: healthTier.color,
              },
            ]}
          />
        </View>

        {/* LỜI NHẬN ĐỊNH CỦA SENIOR ANALYST */}
        <View style={[styles.analystQuoteBox, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
          <Text style={[styles.analystQuoteHeader, { color: tokens.primary }]}>
            💡 CHUẨN ĐOÁN TỪ DATA ANALYST:
          </Text>
          <Text style={[styles.analystQuoteText, { color: tokens.text }]}>
            {analystInsight}
          </Text>
        </View>
      </View>

      {/* ================= 2. FLOW CHART DÒNG TIỀN (SANKEY WATERFALL) ================= */}
      <View
        style={[
          styles.sectionCard,
          { backgroundColor: tokens.surface, borderColor: tokens.border },
        ]}
      >
        <View style={styles.sectionHeaderRow}>
          <Layers size={16} color={tokens.primary} strokeWidth={2.4} />
          <Text style={[styles.sectionTitle, { color: tokens.text }]}>
            Dòng Tiền Ra - Vào (Cashflow Flow)
          </Text>
        </View>
        <Text style={[styles.sectionSubtitle, { color: tokens.textMuted }]}>
          Tiền của bạn trong tháng này đã chảy đi đâu và giữ lại được bao nhiêu:
        </Text>

        {/* SƠ ĐỒ DÒNG CHẢY FLOW CHART */}
        <View style={styles.flowContainer}>
          {/* KHỐI NGUỒN (THU NHẬP) */}
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

          {/* ĐƯỜNG KẾT NỐI PHÂN NHÁNH */}
          <View style={styles.flowBranchConnectorRow}>
            <View style={[styles.flowLineVertical, { backgroundColor: tokens.border }]} />
            <View style={styles.flowLineFork}>
              <View style={[styles.forkBranchLeft, { borderColor: tokens.border }]} />
              <View style={[styles.forkBranchRight, { borderColor: tokens.border }]} />
            </View>
          </View>

          {/* 2 NHÁNH RẼ: ĐÃ CHI (TRÁI) VS GIỮ LẠI (PHẢI) */}
          <View style={styles.flowDestinationsRow}>
            {/* NHÁNH 1: ĐÃ CHI TIÊU */}
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

            {/* NHÁNH 2: CÒN GIỮ LẠI */}
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
                      remainingBudget >= 0 ? 'rgba(126, 159, 128, 0.2)' : 'rgba(200, 109, 81, 0.2)',
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

      {/* ================= 3. BẢNG VÀNG: TOP 3 MÓN NGỐN TIỀN NHẤT THÁNG ================= */}
      <View
        style={[
          styles.sectionCard,
          { backgroundColor: tokens.surface, borderColor: tokens.border },
        ]}
      >
        <View style={styles.sectionHeaderRow}>
          <Award size={16} color={tokens.primary} strokeWidth={2.4} />
          <Text style={[styles.sectionTitle, { color: tokens.text }]}>
            Top 3 Món Ngốn Tiền Nhất Tháng
          </Text>
        </View>
        <Text style={[styles.sectionSubtitle, { color: tokens.textMuted }]}>
          Những khoản chi "đậm" nhất bạn cần chú ý cân nhắc:
        </Text>

        {topSpenders.length === 0 ? (
          <Text style={[styles.emptyNotice, { color: tokens.textMuted }]}>
            Chưa có giao dịch chi tiêu nào trong tháng.
          </Text>
        ) : (
          <View style={styles.topSpendersList}>
            {topSpenders.map((tx, idx) => {
              const catCfg = getCategoryConfig(tx.category);
              const CatIcon = catCfg.Icon;
              const photo = tx.thumbnail_url || tx.photo_url;
              const percentOfTotal =
                summary.totalSpent > 0 ? Math.round((tx.amount / summary.totalSpent) * 100) : 0;

              const medalColors = ['#E59844', '#9E9E9E', '#CD7F32'];
              const medalLabels = ['#1', '#2', '#3'];

              return (
                <View
                  key={tx.id}
                  style={[
                    styles.topSpenderItem,
                    {
                      backgroundColor: tokens.surfaceAlt,
                      borderColor: tokens.border,
                    },
                  ]}
                >
                  {/* HUY CHƯƠNG THỨ HẠNG */}
                  <View style={[styles.medalBadge, { backgroundColor: medalColors[idx] }]}>
                    <Text style={styles.medalText}>{medalLabels[idx]}</Text>
                  </View>

                  {/* THUMBNAIL ẢNH HOẶC ICON */}
                  {photo ? (
                    <Image
                      source={{ uri: photo }}
                      style={[styles.topSpenderThumb, { borderColor: tokens.border }]}
                      contentFit="cover"
                      cachePolicy="disk"
                    />
                  ) : (
                    <View style={[styles.topSpenderIconBox, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
                      <CatIcon size={18} color={tokens.primary} strokeWidth={2.2} />
                    </View>
                  )}

                  {/* THÔNG TIN CHI TIẾT */}
                  <View style={styles.topSpenderInfo}>
                    <Text style={[styles.topSpenderDesc, { color: tokens.text }]} numberOfLines={1}>
                      {tx.description || catCfg.shortLabel}
                    </Text>
                    <Text style={[styles.topSpenderCategory, { color: tokens.textMuted }]}>
                      {catCfg.shortLabel} • {tx.occurred_at ? tx.occurred_at.split('T')[0].split('-').reverse().slice(0, 2).join('/') : ''}
                    </Text>
                  </View>

                  {/* SỐ TIỀN & PHẦN TRĂM */}
                  <View style={styles.topSpenderAmountCol}>
                    <Text style={[styles.topSpenderAmountText, { color: tokens.text }]}>
                      -{maskMoney(formatVND(tx.amount), isMasked)}
                    </Text>
                    <View style={[styles.percentPill, { backgroundColor: tokens.surface }]}>
                      <Text style={[styles.percentPillText, { color: tokens.primary }]}>
                        {percentOfTotal}% tổng chi
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* ================= 4. DONUT CHART CƠ CẤU DANH MỤC (SVG SEGMENTED RING) ================= */}
      <View
        style={[
          styles.sectionCard,
          { backgroundColor: tokens.surface, borderColor: tokens.border },
        ]}
      >
        <View style={styles.sectionHeaderRow}>
          <PieChart size={16} color={tokens.primary} strokeWidth={2.4} />
          <Text style={[styles.sectionTitle, { color: tokens.text }]}>
            {Strings.stats.categoryBreakdown} (Donut Chart)
          </Text>
        </View>

        {categories.length === 0 ? (
          <Text style={[styles.emptyNotice, { color: tokens.textMuted }]}>
            Chưa có giao dịch chi tiêu trong tháng này
          </Text>
        ) : (
          <View style={styles.donutSectionContent}>
            {/* VÒNG TRÒN DONUT SVG */}
            <View style={styles.donutSvgWrapper}>
              <Svg width={donutSize} height={donutSize}>
                <G rotation="-90" origin={`${donutSize / 2}, ${donutSize / 2}`}>
                  {/* Vòng nền mờ xám */}
                  <Circle
                    cx={donutSize / 2}
                    cy={donutSize / 2}
                    r={radius}
                    stroke={tokens.surfaceAlt}
                    strokeWidth={strokeWidth}
                    fill="none"
                  />
                  {/* Các phân đoạn danh mục */}
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

              {/* TÂM VÒNG TRÒN DONUT */}
              <View style={styles.donutCenterLabel}>
                <Text style={[styles.donutCenterAmount, { color: tokens.text }]}>
                  {maskMoney(formatVND(summary.totalSpent), isMasked)}
                </Text>
                <Text style={[styles.donutCenterSub, { color: tokens.textMuted }]}>
                  {summary.transactionCount} khoản chi
                </Text>
              </View>
            </View>

            {/* BẢNG CHÚ GIẢI (LEGEND) BÊN CẠNH */}
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

      {/* ================= 5. NHỊP ĐỘ CHI TIÊU HÀNG NGÀY & RUNWAY ================= */}
      <View
        style={[
          styles.sectionCard,
          { backgroundColor: tokens.surface, borderColor: tokens.border },
        ]}
      >
        <View style={styles.sectionHeaderRow}>
          <BarChart2 size={16} color={tokens.primary} strokeWidth={2.4} />
          <Text style={[styles.sectionTitle, { color: tokens.text }]}>
            {Strings.stats.dailyTrend}
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
  topSpendersList: {
    gap: 8,
    paddingTop: 4,
  },
  topSpenderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.md,
    padding: 10,
    borderWidth: 1,
    gap: 10,
  },
  medalBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  topSpenderThumb: {
    width: 42,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
  },
  topSpenderIconBox: {
    width: 42,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topSpenderInfo: {
    flex: 1,
    gap: 2,
  },
  topSpenderDesc: {
    fontSize: 13,
    fontWeight: '700',
  },
  topSpenderCategory: {
    fontSize: 11,
    fontWeight: '500',
  },
  topSpenderAmountCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  topSpenderAmountText: {
    fontSize: 13.5,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  percentPill: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  percentPillText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  donutSectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    gap: 14,
  },
  donutSvgWrapper: {
    width: 160,
    height: 160,
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
    fontSize: 12.5,
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
  emptyNotice: {
    fontSize: 12.5,
    paddingVertical: 12,
    textAlign: 'center',
  },
});
