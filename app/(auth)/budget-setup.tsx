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
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import {
  Check,
  Coffee,
  Coins,
  Sparkles,
  Target,
  User,
  Utensils,
  Wallet,
} from 'lucide-react-native';
import { Colors } from '../../src/constants/colors';
import { FavoriteUnit } from '../../src/types/database';
import { useAuthStore } from '../../src/store/authStore';
import { useBudgetStore } from '../../src/store/budgetStore';
import { formatVND, calculateBaseDailyBudget } from '../../src/utils/currency';
import { useTheme } from '../../src/theme/ThemeContext';

/**
 * Biểu tượng Monogram Kepi Monogram
 */
function KepiMonogram({ size = 52 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56">
      <Circle cx="28" cy="28" r="26" fill="rgba(229, 152, 68, 0.15)" />
      <Rect x="15" y="12" width="6.5" height="32" rx="3.25" fill="#0F2F24" />
      <Line
        x1="22"
        y1="27"
        x2="39"
        y2="13"
        stroke="#E59844"
        strokeWidth="6.5"
        strokeLinecap="round"
      />
      <Line
        x1="23.5"
        y1="27"
        x2="39"
        y2="43"
        stroke="#1B4D3E"
        strokeWidth="6.5"
        strokeLinecap="round"
      />
      <Circle cx="40" cy="12" r="3.5" fill="#E59844" />
    </Svg>
  );
}

export default function BudgetSetupScreen() {
  const router = useRouter();
  const { tokens, isDark } = useTheme();
  const { user, profile, updateProfile, setHasCompletedBudgetSetup } = useAuthStore();
  const { setupBudget, isLoading } = useBudgetStore();

  // Tab phương thức thiết lập: 'DAILY' (Nhập hạn mức ngày nhanh) | 'MONTHLY' (Thu nhập & Cố định)
  const [budgetTab, setBudgetTab] = useState<'DAILY' | 'MONTHLY'>('DAILY');

  // Trường thông tin - 100% bắt đầu từ trống (0 HARDCODE)
  const [name, setName] = useState(profile?.full_name || user?.full_name || '');
  const [dailyBudgetStr, setDailyBudgetStr] = useState('');
  const [incomeStr, setIncomeStr] = useState('');
  const [fixedCostsStr, setFixedCostsStr] = useState('');
  const [goalName, setGoalName] = useState('');
  const [goalAmountStr, setGoalAmountStr] = useState('');
  const [favUnit, setFavUnit] = useState<FavoriteUnit>('tra_sua');

  // Tính toán hạn mức ngày dựa trên tab
  const parsedDaily = parseInt(dailyBudgetStr.replace(/\D/g, ''), 10) || 0;
  const parsedIncome = parseInt(incomeStr.replace(/\D/g, ''), 10) || 0;
  const parsedFixed = parseInt(fixedCostsStr.replace(/\D/g, ''), 10) || 0;
  const parsedGoal = parseInt(goalAmountStr.replace(/\D/g, ''), 10) || 0;

  const effectiveDailyBudget =
    budgetTab === 'DAILY'
      ? parsedDaily
      : calculateBaseDailyBudget(parsedIncome, parsedFixed, parsedGoal, 30);

  // Chọn nhanh chip hạn mức ngày
  const handleSelectQuickDailyChip = (amount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDailyBudgetStr(amount.toString());
  };

  const handleFinish = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Chào bạn!', 'Hãy cho Kepi biết tên gọi hoặc biệt danh của bạn nhé.');
      return;
    }

    if (effectiveDailyBudget <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        'Ngân sách chi tiêu',
        budgetTab === 'DAILY'
          ? 'Vui lòng nhập hoặc chọn hạn mức chi tiêu mỗi ngày của bạn.'
          : 'Vui lòng nhập thu nhập ước tính hàng tháng của bạn.'
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const targetUserId = user?.id || `guest-${Date.now()}`;
    const monthlyIncome = budgetTab === 'DAILY' ? effectiveDailyBudget * 30 : parsedIncome;
    const monthlyFixed = budgetTab === 'DAILY' ? 0 : parsedFixed;

    // 1. Lưu hồ sơ người dùng (Tên & Đơn vị yêu thích)
    await updateProfile({
      full_name: trimmedName,
      fav_unit: favUnit,
    });

    // 2. Thiết lập cấu hình ngân sách
    await setupBudget({
      userId: targetUserId,
      monthlyIncome,
      monthlyFixedCosts: monthlyFixed,
      goalName: goalName.trim() || 'Chuyến đi Hà Nội',
      goalTargetAmount: parsedGoal,
      favUnit,
    });

    // 3. Đánh dấu hoàn tất setup
    setHasCompletedBudgetSetup(true);

    // 4. Mở thẳng màn hình chính (Camera & Sổ)
    router.replace('/(main)');
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? '#0E1620' : '#FAF6EC' },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER CHÀO MỪNG */}
          <View style={styles.header}>
            <View style={styles.monogramBox}>
              <KepiMonogram size={56} />
            </View>
            <Text style={[styles.welcomeTitle, { color: isDark ? '#FAF6EC' : '#1B2733' }]}>
              Chào mừng bạn đến với Kepi
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: isDark ? 'rgba(250, 246, 236, 0.7)' : '#55606D' }]}>
              Thiết lập nhanh trong 10 giây để cùng giữ ví tỉnh táo
            </Text>
          </View>

          {/* SECTION 1: TÊN BẠN */}
          <View
            style={[
              styles.cardSection,
              {
                backgroundColor: isDark ? '#162231' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            <View style={styles.sectionLabelRow}>
              <User size={18} color="#E59844" strokeWidth={2.4} />
              <Text style={[styles.sectionTitle, { color: isDark ? '#FAF6EC' : '#1B2733' }]}>
                Tên hoặc Biệt danh của bạn <Text style={styles.requiredStar}>*</Text>
              </Text>
            </View>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FAF6EC',
                  color: isDark ? '#FFFFFF' : '#1B2733',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                },
              ]}
              placeholder="Ví dụ: Hà An, Minh Duy, Cún..."
              placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.35)' : '#99A1AF'}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* SECTION 2: CÁCH QUẢN LÝ NGÂN SÁCH (SEGMENTED TABS) */}
          <View
            style={[
              styles.cardSection,
              {
                backgroundColor: isDark ? '#162231' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            <View style={styles.sectionLabelRow}>
              <Wallet size={18} color="#E59844" strokeWidth={2.4} />
              <Text style={[styles.sectionTitle, { color: isDark ? '#FAF6EC' : '#1B2733' }]}>
                Hạn mức chi tiêu <Text style={styles.requiredStar}>*</Text>
              </Text>
            </View>

            {/* TAB GẠT CHUYỂN PHƯƠNG THỨC */}
            <View
              style={[
                styles.tabSegmentContainer,
                { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.05)' },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.tabSegmentButton,
                  budgetTab === 'DAILY' && {
                    backgroundColor: '#E59844',
                    shadowColor: '#E59844',
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 2,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setBudgetTab('DAILY');
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabSegmentText,
                    {
                      color: budgetTab === 'DAILY' ? '#0E1620' : isDark ? '#FAF6EC' : '#55606D',
                      fontWeight: budgetTab === 'DAILY' ? '700' : '500',
                    },
                  ]}
                >
                  ⚡ Hạn mức ngày (Nhanh)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabSegmentButton,
                  budgetTab === 'MONTHLY' && {
                    backgroundColor: '#E59844',
                    shadowColor: '#E59844',
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 2,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setBudgetTab('MONTHLY');
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabSegmentText,
                    {
                      color: budgetTab === 'MONTHLY' ? '#0E1620' : isDark ? '#FAF6EC' : '#55606D',
                      fontWeight: budgetTab === 'MONTHLY' ? '700' : '500',
                    },
                  ]}
                >
                  📊 Thu nhập & Cố định
                </Text>
              </TouchableOpacity>
            </View>

            {/* NỘI DUNG TAB 1: NHẬP TRỰC TIẾP HẠN MỨC NGÀY */}
            {budgetTab === 'DAILY' ? (
              <View style={styles.tabContentBox}>
                <Text style={[styles.fieldSubLabel, { color: isDark ? 'rgba(250, 246, 236, 0.7)' : '#667085' }]}>
                  Mỗi ngày bạn muốn cho phép mình tiêu tối đa bao nhiêu?
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    styles.amountInput,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FAF6EC',
                      color: isDark ? '#FFFFFF' : '#1B2733',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                    },
                  ]}
                  placeholder="0 đ (hoặc bấm chọn bên dưới)"
                  placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.35)' : '#99A1AF'}
                  keyboardType="numeric"
                  value={parsedDaily > 0 ? formatVND(parsedDaily) : dailyBudgetStr}
                  onChangeText={(val) => setDailyBudgetStr(val.replace(/\D/g, ''))}
                />

                {/* CHIPS CHỌN NHANH HẠN MỨC NGÀY */}
                <View style={styles.chipsRow}>
                  {[50000, 100000, 150000, 200000].map((amt) => {
                    const isSelected = parsedDaily === amt;
                    return (
                      <TouchableOpacity
                        key={amt}
                        style={[
                          styles.chipButton,
                          {
                            backgroundColor: isSelected
                              ? '#E59844'
                              : isDark
                              ? 'rgba(255, 255, 255, 0.08)'
                              : '#FAF6EC',
                            borderColor: isSelected ? '#E59844' : isDark ? 'transparent' : 'rgba(0, 0, 0, 0.06)',
                          },
                        ]}
                        onPress={() => handleSelectQuickDailyChip(amt)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            {
                              color: isSelected ? '#0E1620' : isDark ? '#FAF6EC' : '#1B2733',
                              fontWeight: isSelected ? '700' : '500',
                            },
                          ]}
                        >
                          {amt / 1000}k
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : (
              /* NỘI DUNG TAB 2: THU NHẬP & CHI PHÍ CỐ ĐỊNH */
              <View style={styles.tabContentBox}>
                <Text style={[styles.fieldSubLabel, { color: isDark ? 'rgba(250, 246, 236, 0.7)' : '#667085' }]}>
                  Thu nhập hàng tháng ước tính:
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FAF6EC',
                      color: isDark ? '#FFFFFF' : '#1B2733',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                    },
                  ]}
                  placeholder="Ví dụ: 8.000.000 đ"
                  placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.35)' : '#99A1AF'}
                  keyboardType="numeric"
                  value={parsedIncome > 0 ? formatVND(parsedIncome) : incomeStr}
                  onChangeText={(val) => setIncomeStr(val.replace(/\D/g, ''))}
                />

                <Text style={[styles.fieldSubLabel, { marginTop: 12, color: isDark ? 'rgba(250, 246, 236, 0.7)' : '#667085' }]}>
                  Chi tiêu cố định (tiền trọ, điện nước, học phí...):
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FAF6EC',
                      color: isDark ? '#FFFFFF' : '#1B2733',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                    },
                  ]}
                  placeholder="Ví dụ: 2.500.000 đ"
                  placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.35)' : '#99A1AF'}
                  keyboardType="numeric"
                  value={parsedFixed > 0 ? formatVND(parsedFixed) : fixedCostsStr}
                  onChangeText={(val) => setFixedCostsStr(val.replace(/\D/g, ''))}
                />

                {effectiveDailyBudget > 0 && (
                  <View style={styles.calculatedPreviewBox}>
                    <Text style={styles.calculatedPreviewLabel}>Ngân sách ngày ước tính:</Text>
                    <Text style={styles.calculatedPreviewValue}>{formatVND(effectiveDailyBudget)} / ngày</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* SECTION 3: MỤC TIÊU TIẾT KIỆM (TÙY CHỌN) */}
          <View
            style={[
              styles.cardSection,
              {
                backgroundColor: isDark ? '#162231' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            <View style={styles.sectionLabelRow}>
              <Target size={18} color="#7E9F80" strokeWidth={2.4} />
              <Text style={[styles.sectionTitle, { color: isDark ? '#FAF6EC' : '#1B2733' }]}>
                Mục tiêu tích lũy <Text style={styles.optionalTag}>(Tùy chọn)</Text>
              </Text>
            </View>

            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FAF6EC',
                  color: isDark ? '#FFFFFF' : '#1B2733',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                  marginBottom: 10,
                },
              ]}
              placeholder="Ví dụ: Chuyến đi Hà Nội, Laptop mới..."
              placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.35)' : '#99A1AF'}
              value={goalName}
              onChangeText={setGoalName}
            />

            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FAF6EC',
                  color: isDark ? '#FFFFFF' : '#1B2733',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                },
              ]}
              placeholder="Số tiền cần có (Ví dụ: 2.000.000 đ)"
              placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.35)' : '#99A1AF'}
              keyboardType="numeric"
              value={parsedGoal > 0 ? formatVND(parsedGoal) : goalAmountStr}
              onChangeText={(val) => setGoalAmountStr(val.replace(/\D/g, ''))}
            />
          </View>

          {/* SECTION 4: ĐƠN VỊ QUY ĐỔI YÊU THÍCH */}
          <View
            style={[
              styles.cardSection,
              {
                backgroundColor: isDark ? '#162231' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            <View style={styles.sectionLabelRow}>
              <Sparkles size={18} color="#E59844" strokeWidth={2.4} />
              <Text style={[styles.sectionTitle, { color: isDark ? '#FAF6EC' : '#1B2733' }]}>
                Đơn vị quy đổi vui vẻ
              </Text>
            </View>
            <Text style={[styles.fieldSubLabel, { color: isDark ? 'rgba(250, 246, 236, 0.7)' : '#667085', marginBottom: 10 }]}>
              Khi bạn phân vân mua sắm, Kepi sẽ quy đổi số tiền ra món này:
            </Text>

            <View style={styles.favUnitsRow}>
              {[
                { id: 'tra_sua' as FavoriteUnit, label: 'Trà sữa', price: '30k' },
                { id: 'ca_phe' as FavoriteUnit, label: 'Cà phê', price: '30k' },
                { id: 'bat_pho' as FavoriteUnit, label: 'Bát phở', price: '40k' },
              ].map((unit) => {
                const isSelected = favUnit === unit.id;
                return (
                  <TouchableOpacity
                    key={unit.id}
                    style={[
                      styles.favUnitChip,
                      {
                        backgroundColor: isSelected
                          ? '#E59844'
                          : isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : '#FAF6EC',
                        borderColor: isSelected ? '#E59844' : isDark ? 'transparent' : 'rgba(0, 0, 0, 0.06)',
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setFavUnit(unit.id);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.favUnitText,
                        {
                          color: isSelected ? '#0E1620' : isDark ? '#FAF6EC' : '#1B2733',
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {unit.label} ({unit.price})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* NÚT HOÀN TẤT BẮT ĐẦU NGAY */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleFinish}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>🍂 BẮT ĐẦU NGAY</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  monogramBox: {
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'System',
    textAlign: 'center',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 14,
    fontFamily: 'System',
    textAlign: 'center',
  },
  cardSection: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'System',
  },
  requiredStar: {
    color: '#C86D51',
  },
  optionalTag: {
    fontSize: 13,
    fontWeight: '400',
    color: '#7E9F80',
  },
  fieldSubLabel: {
    fontSize: 13,
    fontFamily: 'System',
    marginBottom: 8,
  },
  textInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: 'System',
  },
  amountInput: {
    fontSize: 17,
    fontWeight: '700',
  },
  tabSegmentContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  tabSegmentButton: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSegmentText: {
    fontSize: 13,
    fontFamily: 'System',
  },
  tabContentBox: {
    marginTop: 2,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  chipButton: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'System',
  },
  calculatedPreviewBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(126, 159, 128, 0.15)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calculatedPreviewLabel: {
    fontSize: 13,
    color: '#7E9F80',
    fontWeight: '600',
  },
  calculatedPreviewValue: {
    fontSize: 14,
    color: '#7E9F80',
    fontWeight: '700',
  },
  favUnitsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  favUnitChip: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favUnitText: {
    fontSize: 12,
    fontFamily: 'System',
  },
  actionSection: {
    marginTop: 12,
  },
  primaryButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#E59844',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E59844',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0E1620',
    letterSpacing: 0.5,
  },
});
