import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  AlertTriangle,
  Check,
  Clock,
  Coffee,
  Flame,
  Hourglass,
  ShieldCheck,
  Sparkles,
  Target,
  UtensilsCrossed,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadows, Spacing } from '../../constants/layout';
import { Typography } from '../../constants/typography';
import { AutumnButton } from '../common/AutumnButton';
import { calculateRealityMetrics, RealityMetrics } from '../../utils/realityCalc';
import { generateJudgmentRoast } from '../../services/roastEngine';
import { FavoriteUnit } from '../../types/database';
import { formatVND } from '../../utils/currency';
import { MinhAvatar3D } from '../coach/MinhAvatar3D';
import { PurchaseEvaluation, useMinhCoachStore } from '../../store/minhCoachStore';

interface JudgmentCardProps {
  visible: boolean;
  itemName: string;
  amount: number;
  category: string;
  photoUri: string | null;
  dailyBudget: number;
  realBalance: number;
  hourlyRate: number;
  favUnit: FavoriteUnit;
  goalName: string;
  onClose: () => void;
  onBuyAnyway: () => void;
  onAddToWaitBasket: () => void;
  onSkipAndSaveMoney: () => void;
}

export const JudgmentCard: React.FC<JudgmentCardProps> = ({
  visible,
  itemName,
  amount,
  category,
  photoUri,
  dailyBudget,
  realBalance,
  hourlyRate,
  favUnit,
  goalName,
  onClose,
  onBuyAnyway,
  onAddToWaitBasket,
  onSkipAndSaveMoney,
}) => {
  const [metrics, setMetrics] = useState<RealityMetrics | null>(null);
  const [evaluation, setEvaluation] = useState<PurchaseEvaluation | null>(null);
  const [aiRoast, setAiRoast] = useState<string>('');
  const [loadingRoast, setLoadingRoast] = useState<boolean>(true);

  useEffect(() => {
    if (visible && amount > 0) {
      const calculated = calculateRealityMetrics({
        amount,
        dailyBudget,
        hourlyRate,
        favUnit,
        realBalance,
      });
      setMetrics(calculated);

      // Đánh giá phản biện từ AI Coach Minh Locket (Tiện ích vs Trend)
      const evalResult = useMinhCoachStore.getState().evaluatePurchase({
        description: itemName,
        amount,
        category,
        goalName: goalName || 'Mục tiêu cá nhân',
        goalTargetAmount: dailyBudget * 60,
        dailyBudget,
      });
      setEvaluation(evalResult);

      setLoadingRoast(true);
      generateJudgmentRoast({
        itemName,
        amount,
        category,
        metrics: calculated,
      }).then((roast) => {
        setAiRoast(roast);
        setLoadingRoast(false);
      });
    }
  }, [visible, amount, itemName, category, dailyBudget, hourlyRate, favUnit, realBalance, goalName]);

  const handleSkip = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    useMinhCoachStore.getState().recordResistedImpulse(amount);
    onSkipAndSaveMoney();
  };

  const handleWait = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAddToWaitBasket();
  };

  const handleBuy = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBuyAnyway();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalCard}>
              {/* Nút đóng */}
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <X size={18} strokeWidth={1.4} color={Colors.textCharcoal} />
              </TouchableOpacity>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* 1. HEADER MINH LOCKET 3D & BƯU THIẾP TỈNH TÁO */}
                <View style={styles.postcardHeader}>
                  <MinhAvatar3D
                    expression={evaluation?.expression || 'NEUTRAL'}
                    size="md"
                    style={{ marginRight: 12 }}
                  />
                  <View style={styles.headerTitleBox}>
                    <Text style={[Typography.caption, styles.postmarkText]}>
                      MINH LOCKET • PHẢN BIỆN TỈNH TÁO
                    </Text>
                    <Text style={[Typography.heading2, styles.itemNameText]} numberOfLines={1}>
                      {itemName}
                    </Text>
                  </View>
                </View>

                {/* 2. ẢNH MÓN ĐỒ & GIÁ TIỀN */}
                <View style={styles.previewContainer}>
                  {photoUri ? (
                    <Image source={{ uri: photoUri }} style={styles.itemPhoto} resizeMode="cover" />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Sparkles size={36} strokeWidth={1.3} color={Colors.accentGold} />
                    </View>
                  )}
                  <View style={styles.priceBadge}>
                    <Text style={[Typography.currencyLarge, styles.priceText]}>
                      {formatVND(amount)}
                    </Text>
                  </View>
                </View>

                {/* 3. BỘ LỌC 3 CÂU HỎI: TIỆN ÍCH THỰC TẾ VS MUA THEO TREND */}
                {evaluation && (
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>GÓC NHÌN CỦA MINH (TIỆN ÍCH VS TREND):</Text>
                    
                    {/* Tiêu chí 1: Tiện ích thực tế */}
                    <View style={styles.filterRow}>
                      <View style={[styles.filterDot, { backgroundColor: Colors.incomeMint }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.filterLabel}>1. Tiện ích thực tế ({evaluation.utilityScore}/10):</Text>
                        <Text style={styles.filterDesc}>{evaluation.practicalNote}</Text>
                      </View>
                    </View>

                    {/* Tiêu chí 2: Cảnh báo mua theo trend */}
                    <View style={styles.filterRow}>
                      <View style={[styles.filterDot, { backgroundColor: evaluation.isTrendRisk ? Colors.expenseCoral : Colors.incomeMint }]} />
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Text style={styles.filterLabel}>2. Nguy cơ theo trend ({evaluation.trendScore}/10):</Text>
                          {evaluation.isTrendRisk && (
                            <AlertTriangle size={12} color={Colors.expenseCoral} />
                          )}
                        </View>
                        <Text style={[styles.filterDesc, evaluation.isTrendRisk && { color: Colors.expenseCoral }]}>
                          {evaluation.trendAlertNote}
                        </Text>
                      </View>
                    </View>

                    {/* Tiêu chí 3: Tác động mục tiêu cá nhân */}
                    <View style={styles.filterRow}>
                      <View style={[styles.filterDot, { backgroundColor: Colors.accentGold }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.filterLabel}>3. Tác động mục tiêu "{goalName}":</Text>
                        <Text style={styles.filterDesc}>
                          Khoản này làm bồ lùi lại khoảng +{evaluation.goalImpactDays} ngày tiết kiệm.
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* 4. BẢNG QUY ĐỔI THỰC TẾ (REALITY CHECK GRID) */}
                {metrics && (
                  <View style={styles.realitySection}>
                    <Text style={[Typography.caption, styles.realityTitle]}>
                      QUY ĐỔI SANG MỒ HÔI & CÔNG SỨC:
                    </Text>
                    <View style={styles.metricsGrid}>
                      <View style={styles.metricCard}>
                        <View style={styles.iconCircle}>
                          <UtensilsCrossed size={20} strokeWidth={2.6} color={Colors.expenseCoral} />
                        </View>
                        <Text style={[Typography.heading3, styles.metricVal]}>
                          {metrics.budgetDays} ngày
                        </Text>
                        <Text style={[Typography.caption, styles.metricDesc]}>
                          Ngân sách ăn uống
                        </Text>
                      </View>

                      <View style={styles.metricCard}>
                        <View style={styles.iconCircle}>
                          <Coffee size={20} strokeWidth={2.6} color={Colors.accentGold} />
                        </View>
                        <Text style={[Typography.heading3, styles.metricVal]}>
                          {metrics.favUnitCount} ly
                        </Text>
                        <Text style={[Typography.caption, styles.metricDesc]}>
                          {metrics.favUnitName}
                        </Text>
                      </View>

                      {metrics.workHours !== null && (
                        <View style={styles.metricCard}>
                          <View style={styles.iconCircle}>
                            <Clock size={20} strokeWidth={2.6} color={Colors.textCharcoal} />
                          </View>
                          <Text style={[Typography.heading3, styles.metricVal]}>
                            {metrics.workHours} giờ
                          </Text>
                          <Text style={[Typography.caption, styles.metricDesc]}>
                            Làm việc cày cuốc
                          </Text>
                        </View>
                      )}

                      <View style={styles.metricCard}>
                        <View style={styles.iconCircle}>
                          <Target size={20} strokeWidth={2.6} color={Colors.incomeMint} />
                        </View>
                        <Text style={[Typography.heading3, styles.metricVal]}>
                          +{metrics.delayedDays} ngày
                        </Text>
                        <Text style={[Typography.caption, styles.metricDesc]}>
                          Lùi mục tiêu {goalName}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* 5. LỜI MINH THỦ THỈ */}
                <View style={styles.roastBox}>
                  <View style={styles.roastHeader}>
                    <Sparkles size={15} strokeWidth={1.3} color={Colors.accentGold} />
                    <Text style={[Typography.caption, styles.roastAuthor]}>
                      MINH THỦ THỈ TÂM TÌNH
                    </Text>
                  </View>
                  <Text style={[Typography.bodyPoetic, styles.roastText]}>
                    "{evaluation?.coachQuote || aiRoast || 'Đang nhìn vào ví bồ suy ngẫm...'}"
                  </Text>
                </View>

                {/* 6. 3 NÚT HÀNH ĐỘNG HERO CTA */}
                <View style={styles.actionStack}>
                  {/* NÚT THÔI - CỨU VÍ (NỔI BẬT NHẤT) */}
                  <AutumnButton
                    title="Thôi, Cứu Ví (+Tiền Đã Cứu)"
                    variant="safe"
                    size="lg"
                    onPress={handleSkip}
                    icon={<ShieldCheck size={18} strokeWidth={1.5} color="#FFFFFF" />}
                    style={styles.skipBtn}
                  />

                  {/* NÚT GIỎ CHỜ 1-2H */}
                  <AutumnButton
                    title="Đưa Vào Giỏ Chờ (Cản Gắt)"
                    variant="danger"
                    size="md"
                    onPress={handleWait}
                    icon={<Hourglass size={16} strokeWidth={1.4} color="#FFFFFF" />}
                    style={styles.waitBtn}
                  />

                  {/* NÚT VẪN MUA */}
                  <AutumnButton
                    title="Vẫn Muốn Mua (Mua Có Chủ Đích)"
                    variant="ghost"
                    size="sm"
                    onPress={handleBuy}
                    icon={<Check size={14} strokeWidth={1.3} color={Colors.textMuted} />}
                    textStyle={{ color: Colors.textMuted }}
                  />
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: Colors.bgPrimary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1.5,
    borderColor: Colors.borderGold,
    ...Shadows.floating,
  },
  closeBtn: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfacePaper,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  postcardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingRight: 40,
  },
  stampBox: {
    width: 48,
    height: 54,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfacePaper,
    borderWidth: 1.5,
    borderColor: Colors.accentGold,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  stampEmoji: {
    fontSize: 20,
  },
  stampText: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.accentGold,
  },
  headerTitleBox: {
    flex: 1,
  },
  postmarkText: {
    color: Colors.textMuted,
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  itemNameText: {
    color: Colors.textCharcoal,
    marginTop: 2,
  },
  previewContainer: {
    width: '100%',
    height: 180,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surfacePaper,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  itemPhoto: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.accentGoldLight,
  },
  priceBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(26, 29, 26, 0.85)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    ...Shadows.soft,
  },
  filterSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textCharcoal,
  },
  filterDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  realitySection: {
    marginBottom: Spacing.lg,
  },
  realityTitle: {
    color: Colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surfacePaper,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  iconCircle: {
    width: 28,
    height: 28,
    backgroundColor: 'transparent',
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricVal: {
    color: Colors.textCharcoal,
  },
  metricDesc: {
    color: Colors.textMuted,
    marginTop: 2,
  },
  roastBox: {
    backgroundColor: Colors.surfacePaper,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accentGold,
    marginBottom: Spacing.xl,
    ...Shadows.soft,
  },
  roastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  roastAuthor: {
    color: Colors.accentGold,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  roastText: {
    color: Colors.textCharcoal,
    lineHeight: 22,
  },
  actionStack: {
    gap: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  skipBtn: {
    width: '100%',
  },
  waitBtn: {
    width: '100%',
  },
});
