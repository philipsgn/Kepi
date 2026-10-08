import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Coffee,
  Coins,
  HeartHandshake,
  Sparkles,
  Target,
  Utensils,
} from 'lucide-react-native';
import { Colors } from '../../src/constants/colors';
import { BorderRadius, Shadows, Spacing } from '../../src/constants/layout';
import { Typography } from '../../src/constants/typography';
import { AutumnButton } from '../../src/components/common/AutumnButton';
import { HanoiCard } from '../../src/components/common/HanoiCard';
import { FavoriteUnit } from '../../src/types/database';
import { useAuthStore } from '../../src/store/authStore';
import { useBudgetStore } from '../../src/store/budgetStore';
import { formatVND, calculateBaseDailyBudget } from '../../src/utils/currency';

export default function BudgetSetupScreen() {
  const router = useRouter();
  const { user, setHasCompletedBudgetSetup } = useAuthStore();
  const { setupBudget, isLoading } = useBudgetStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Dữ liệu ngân sách
  const [incomeStr, setIncomeStr] = useState('7000000');
  const [fixedCostsStr, setFixedCostsStr] = useState('2500000');
  const [goalName, setGoalName] = useState('Laptop mới');
  const [goalAmountStr, setGoalAmountStr] = useState('1500000');
  const [favUnit, setFavUnit] = useState<FavoriteUnit>('tra_sua');

  const income = parseInt(incomeStr, 10) || 0;
  const fixedCosts = parseInt(fixedCostsStr, 10) || 0;
  const goalAmount = parseInt(goalAmountStr, 10) || 0;

  // Tính toán ngân sách ngày cơ sở
  const dailyBudget = calculateBaseDailyBudget(income, fixedCosts, goalAmount, 30);

  const handleNext = () => {
    if (step === 1 && income <= 0) {
      Alert.alert('Lời nhắn nhẹ', 'Bạn hãy nhập thu nhập ước tính hàng tháng nhé.');
      return;
    }
    if (step < 4) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleFinish = async () => {
    if (!user) return;

    await setupBudget({
      userId: user.id,
      monthlyIncome: income,
      monthlyFixedCosts: fixedCosts,
      goalName,
      goalTargetAmount: goalAmount,
      favUnit,
    });

    setHasCompletedBudgetSetup(true);
    router.replace('/(main)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header tiến trình */}
          <View style={styles.topNav}>
            {step > 1 && (
              <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                <ArrowLeft size={20} color={Colors.textCharcoal} />
              </TouchableOpacity>
            )}
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(step / 4) * 100}%` },
                ]}
              />
            </View>
            <Text style={[Typography.caption, styles.stepIndicator]}>
              Bước {step}/4
            </Text>
          </View>

          {/* BƯỚC 1: THU NHẬP HÀNG THÁNG */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={[Typography.heading1, styles.title]}>
                Thu Nhập Mỗi Tháng Của Bạn?
              </Text>
              <Text style={[Typography.bodyMedium, styles.subtitle]}>
                Tiền lương, làm thêm hoặc gia đình gửi. Chúng mình sẽ dùng số này để tính ngân sách ngày cho bạn.
              </Text>

              <HanoiCard style={styles.card}>
                <Text style={[Typography.caption, styles.inputLabel]}>
                  SỐ TIỀN THU NHẬP (VNĐ)
                </Text>
                <TextInput
                  style={[Typography.heroDisplay, styles.bigInput]}
                  keyboardType="numeric"
                  value={incomeStr}
                  onChangeText={(val) => setIncomeStr(val.replace(/\D/g, ''))}
                  placeholder="0"
                />
                <Text style={[Typography.bodyMedium, styles.formattedText]}>
                  Tương đương: {formatVND(income)}
                </Text>

                {/* Gợi ý nhanh */}
                <View style={styles.quickOptions}>
                  {[4_000_000, 7_000_000, 12_000_000].map((amt) => (
                    <TouchableOpacity
                      key={amt}
                      style={[
                        styles.quickPill,
                        income === amt && styles.quickPillActive,
                      ]}
                      onPress={() => setIncomeStr(amt.toString())}
                    >
                      <Text
                        style={[
                          Typography.caption,
                          income === amt ? styles.quickPillTextActive : styles.quickPillText,
                        ]}
                      >
                        {formatVND(amt)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </HanoiCard>
            </View>
          )}

          {/* BƯỚC 2: CHI PHÍ CỐ ĐỊNH */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={[Typography.heading1, styles.title]}>
                Chi Phí Cố Định Hàng Tháng?
              </Text>
              <Text style={[Typography.bodyMedium, styles.subtitle]}>
                Tiền thuê trọ, tiền mạng, học phí, hóa đơn không thể cắt giảm.
              </Text>

              <HanoiCard style={styles.card}>
                <Text style={[Typography.caption, styles.inputLabel]}>
                  TIỀN CỐ ĐỊNH PHẢI CHI (VNĐ)
                </Text>
                <TextInput
                  style={[Typography.heroDisplay, styles.bigInput]}
                  keyboardType="numeric"
                  value={fixedCostsStr}
                  onChangeText={(val) => setFixedCostsStr(val.replace(/\D/g, ''))}
                  placeholder="0"
                />
                <Text style={[Typography.bodyMedium, styles.formattedText]}>
                  Tương đương: {formatVND(fixedCosts)}
                </Text>

                {/* Gợi ý nhanh */}
                <View style={styles.quickOptions}>
                  {[1_500_000, 2_500_000, 4_000_000].map((amt) => (
                    <TouchableOpacity
                      key={amt}
                      style={[
                        styles.quickPill,
                        fixedCosts === amt && styles.quickPillActive,
                      ]}
                      onPress={() => setFixedCostsStr(amt.toString())}
                    >
                      <Text
                        style={[
                          Typography.caption,
                          fixedCosts === amt ? styles.quickPillTextActive : styles.quickPillText,
                        ]}
                      >
                        {formatVND(amt)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </HanoiCard>
            </View>
          )}

          {/* BƯỚC 3: MỤC TIÊU & ĐƠN VỊ QUY ĐỔI */}
          {step === 3 && (
            <View style={styles.stepContent}>
              <Text style={[Typography.heading1, styles.title]}>
                Mục Tiêu & Đơn Vị Yêu Thích
              </Text>
              <Text style={[Typography.bodyMedium, styles.subtitle]}>
                Khoản tiền bạn muốn tích lũy mỗi tháng và đơn vị quen thuộc để AI quy đổi trên Thẻ Phán Quyết.
              </Text>

              <HanoiCard style={styles.card}>
                <Text style={[Typography.caption, styles.inputLabel]}>
                  BẠN ĐANG DÀNH TIỀN CHO ĐIỀU GÌ?
                </Text>
                <TextInput
                  style={[Typography.bodyLarge, styles.textInput]}
                  value={goalName}
                  onChangeText={setGoalName}
                  placeholder="Ví dụ: Laptop mới, Chuyến đi Đà Lạt..."
                  placeholderTextColor={Colors.textMuted}
                />

                <Text style={[Typography.caption, styles.inputLabel, { marginTop: Spacing.md }]}>
                  TIỀN GIỮ LẠI MỖI THÁNG CHO MỤC TIÊU (VNĐ)
                </Text>
                <TextInput
                  style={[Typography.currencyLarge, styles.bigInput]}
                  keyboardType="numeric"
                  value={goalAmountStr}
                  onChangeText={(val) => setGoalAmountStr(val.replace(/\D/g, ''))}
                  placeholder="0"
                />
                <Text style={[Typography.bodyMedium, styles.formattedText]}>
                  Tương đương: {formatVND(goalAmount)}
                </Text>

                <Text style={[Typography.caption, styles.inputLabel, { marginTop: Spacing.lg }]}>
                  CHỌN ĐƠN VỊ AI QUY ĐỔI BẠN THÍCH NHẤT:
                </Text>
                <View style={styles.unitSelector}>
                  {[
                    { key: 'tra_sua', label: 'Ly Trà Sữa (30k)', icon: Coins },
                    { key: 'ca_phe', label: 'Cà Phê Trứng (30k)', icon: Coffee },
                    { key: 'to_pho', label: 'Bát Phở Bò (40k)', icon: Utensils },
                  ].map((unit) => {
                    const isSelected = favUnit === unit.key;
                    const IconComp = unit.icon;
                    return (
                      <TouchableOpacity
                        key={unit.key}
                        style={[
                          styles.unitPill,
                          isSelected && styles.unitPillActive,
                        ]}
                        onPress={() => setFavUnit(unit.key as FavoriteUnit)}
                      >
                        <IconComp size={16} color={isSelected ? '#FFFFFF' : Colors.textCharcoal} />
                        <Text
                          style={[
                            Typography.bodyMedium,
                            isSelected ? styles.unitTextActive : styles.unitText,
                          ]}
                        >
                          {unit.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </HanoiCard>
            </View>
          )}

          {/* BƯỚC 4: TỔNG KẾT & KHỞI TẠO NGÂN SÁCH NGÀY */}
          {step === 4 && (
            <View style={styles.stepContent}>
              <Text style={[Typography.heading1, styles.title]}>
                Ngân Sách Ngày Đầu Tiên Của Bạn!
              </Text>
              <Text style={[Typography.bodyMedium, styles.subtitle]}>
                Mọi thứ đã sẵn sàng. Dưới đây là hạn mức tiêu dùng mỗi ngày được tính toán công bằng cho bạn:
              </Text>

              <HanoiCard style={styles.summaryCard}>
                <View style={styles.summaryHero}>
                  <Text style={[Typography.caption, styles.summaryHeroLabel]}>
                    MỖI NGÀY BẠN ĐƯỢC TIÊU TỰ DO:
                  </Text>
                  <Text style={[Typography.heroDisplay, styles.summaryDailyNumber]}>
                    {formatVND(dailyBudget)}
                  </Text>
                  <Text style={[Typography.bodyPoetic, styles.summaryQuote]}>
                    "Ngày nào tiêu ít hơn số này, phần dư sẽ tự cộng dồn sang ngày mai tiêu tiếp nhé."
                  </Text>
                </View>

                <View style={styles.breakdownList}>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Thu nhập hàng tháng:</Text>
                    <Text style={styles.breakdownVal}>{formatVND(income)}</Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Chi phí cố định:</Text>
                    <Text style={styles.breakdownVal}>- {formatVND(fixedCosts)}</Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Giữ cho {goalName}:</Text>
                    <Text style={styles.breakdownVal}>- {formatVND(goalAmount)}</Text>
                  </View>
                  <View style={[styles.breakdownRow, styles.breakdownTotal]}>
                    <Text style={styles.breakdownTotalLabel}>Tiền chi tiêu tự do cả tháng:</Text>
                    <Text style={styles.breakdownTotalVal}>
                      {formatVND(Math.max(0, income - fixedCosts - goalAmount))}
                    </Text>
                  </View>
                </View>
              </HanoiCard>
            </View>
          )}

          {/* Nút Tiếp tục / Hoàn tất */}
          <View style={styles.bottomActions}>
            {step < 4 ? (
              <AutumnButton
                title="Tiếp Tục"
                variant="primary"
                size="lg"
                onPress={handleNext}
                icon={<ArrowRight size={18} color="#FFFFFF" />}
                style={styles.ctaBtn}
              />
            ) : (
              <AutumnButton
                title="Bắt Đầu Ghi Sổ & Cản Ví"
                variant="safe"
                size="lg"
                loading={isLoading}
                onPress={handleFinish}
                icon={<Sparkles size={18} color="#FFFFFF" />}
                style={styles.ctaBtn}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  backBtn: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.borderSoft,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accentGold,
    borderRadius: BorderRadius.full,
  },
  stepIndicator: {
    marginLeft: Spacing.md,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  stepContent: {
    marginBottom: Spacing.xl,
  },
  title: {
    color: Colors.textCharcoal,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  card: {
    padding: Spacing.xl,
  },
  inputLabel: {
    color: Colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  bigInput: {
    color: Colors.accentGold,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.borderGold,
    marginBottom: Spacing.xs,
  },
  textInput: {
    color: Colors.textCharcoal,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSoft,
    marginBottom: Spacing.xs,
  },
  formattedText: {
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  quickOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  quickPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.bgPrimary,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  quickPillActive: {
    backgroundColor: Colors.accentGoldLight,
    borderColor: Colors.accentGold,
  },
  quickPillText: {
    color: Colors.textCharcoal,
    fontWeight: '500',
  },
  quickPillTextActive: {
    color: Colors.accentGold,
    fontWeight: '700',
  },
  unitSelector: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  unitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.bgPrimary,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  unitPillActive: {
    backgroundColor: Colors.incomeMint,
    borderColor: Colors.incomeMint,
  },
  unitText: {
    color: Colors.textCharcoal,
    fontWeight: '500',
  },
  unitTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  summaryCard: {
    padding: Spacing.xl,
    backgroundColor: Colors.surfacePaper,
  },
  summaryHero: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSoft,
    marginBottom: Spacing.lg,
  },
  summaryHeroLabel: {
    color: Colors.textMuted,
    fontWeight: '700',
  },
  summaryDailyNumber: {
    color: Colors.incomeMint,
    marginVertical: Spacing.xs,
  },
  summaryQuote: {
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
  },
  breakdownList: {
    gap: Spacing.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  breakdownVal: {
    ...Typography.bodyMedium,
    color: Colors.textCharcoal,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  breakdownTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderSoft,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  breakdownTotalLabel: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textCharcoal,
  },
  breakdownTotalVal: {
    ...Typography.bodyLarge,
    fontWeight: '700',
    color: Colors.accentGold,
    fontVariant: ['tabular-nums'],
  },
  bottomActions: {
    marginTop: Spacing.md,
  },
  ctaBtn: {
    width: '100%',
  },
});
