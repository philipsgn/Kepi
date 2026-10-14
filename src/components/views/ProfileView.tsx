import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Strings } from '../../constants/strings';
import { Spacing } from '../../constants/layout';
import { useAuthStore } from '../../store/authStore';
import { useBudgetStore } from '../../store/budgetStore';
import { useTransactionStore } from '../../store/transactionStore';
import { ProfileIdentityCard } from '../profile/ProfileIdentityCard';
import { GoalSectionCard } from '../profile/GoalSectionCard';
import { BudgetSettingsCard } from '../profile/BudgetSettingsCard';
import { HourlyWageSettingsCard } from '../profile/HourlyWageSettingsCard';
import { HourlyWageModal } from '../profile/HourlyWageModal';
import { CoachAddress, CoachSettingsCard, CoachTone } from '../profile/CoachSettingsCard';
import { QRPaySettingsCard } from '../profile/QRPaySettingsCard';
import { LockScreenSettingsCard } from '../profile/LockScreenSettingsCard';
import { BankNotificationSettingsCard } from '../profile/BankNotificationSettingsCard';
import { PrivacySecurityCard } from '../profile/PrivacySecurityCard';
import { DataManagementCard } from '../profile/DataManagementCard';
import { ThemeSettingsCard } from '../profile/ThemeSettingsCard';
import { CategorySettingsCard } from '../profile/CategorySettingsCard';
import { FixedCostSettingsModal } from '../profile/FixedCostSettingsModal';
import { GoalEditModal } from '../profile/GoalEditModal';
import { NameEditModal } from '../profile/NameEditModal';
import { FavoriteUnit } from '../../types/database';
import { calculateBaseDailyBudgetFloor, calculateStreakDays } from '../../utils/profileUtils';
import { useTheme } from '../../theme/ThemeContext';
import { useBottomInset } from '../../hooks/useBottomInset';

export interface ProfileViewProps {
  onSignOut?: () => void;
  onOpenLessons?: () => void;
}

const STORAGE_KEY_MASK_MONEY = 'vi_locket_mask_money';
const STORAGE_KEY_COACH_TONE = 'vi_locket_coach_tone';
const STORAGE_KEY_COACH_ADDRESS = 'vi_locket_coach_address';
const STORAGE_KEY_GOAL_DEADLINE = 'vi_locket_goal_deadline';
const STORAGE_KEY_GOAL_REASON = 'vi_locket_goal_reason';
const STORAGE_KEY_HOURLY_RATE = 'vi_locket_hourly_rate';

/**
 * Trang 4: Hồ sơ & Cài đặt (ProfileView) — Phong cách "Ấm, tĩnh, sang"
 * Tuân thủ mục 7 của PROMPT và docs/screens/PROFILE.md:
 * - Hỗ trợ Sáng / Tối toàn diện qua useTheme().
 * - Bộ chọn theme Sáng / Tối / Hệ thống tích hợp trực tiếp.
 * - Modal cấu hình chi phí cố định (FixedCostSettingsModal) chi tiết theo hạng mục.
 * - Đệm đáy chuẩn xác với useBottomInset() tránh bị tab bar nổi che khuất.
 */
export const ProfileView: React.FC<ProfileViewProps> = ({ onSignOut, onOpenLessons }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tokens } = useTheme();
  const { contentBottomPadding } = useBottomInset();

  // Stores
  const { user, profile, isGuest, updateProfile, signOut } = useAuthStore();
  const {
    goalName,
    goalTargetAmount,
    savedMoney,
    monthlyIncome,
    monthlyFixedCosts,
    baseDailyBudget,
    favUnit,
    updateGoalSettings,
    setupBudget,
  } = useBudgetStore();
  const { transactions, loadTransactions } = useTransactionStore();

  // Local Settings State
  const [isMasked, setIsMasked] = useState(false);
  const [coachTone, setCoachTone] = useState<CoachTone>('BALANCED');
  const [coachAddress, setCoachAddress] = useState<CoachAddress>('BRO_FRIEND');
  const [goalDeadline, setGoalDeadline] = useState('31/12/2026');
  const [goalReason, setGoalReason] = useState('Tự thưởng sau một năm nỗ lực cày cuốc');
  const [hourlyRate, setHourlyRate] = useState<number>(profile?.hourly_rate || 0);

  // Modals State
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showFixedCostsModal, setShowFixedCostsModal] = useState(false);
  const [showHourlyWageModal, setShowHourlyWageModal] = useState(false);

  // Load preferences from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const [savedMask, savedTone, savedAddress, savedDeadline, savedReason, savedHourlyRate] =
          await Promise.all([
            AsyncStorage.getItem(STORAGE_KEY_MASK_MONEY),
            AsyncStorage.getItem(STORAGE_KEY_COACH_TONE),
            AsyncStorage.getItem(STORAGE_KEY_COACH_ADDRESS),
            AsyncStorage.getItem(STORAGE_KEY_GOAL_DEADLINE),
            AsyncStorage.getItem(STORAGE_KEY_GOAL_REASON),
            AsyncStorage.getItem(STORAGE_KEY_HOURLY_RATE),
          ]);

        if (savedMask !== null) setIsMasked(savedMask === 'true');
        if (savedTone) setCoachTone(savedTone as CoachTone);
        if (savedAddress) setCoachAddress(savedAddress as CoachAddress);
        if (savedDeadline) setGoalDeadline(savedDeadline);
        if (savedReason) setGoalReason(savedReason);
        if (savedHourlyRate !== null) {
          setHourlyRate(Number(savedHourlyRate));
        } else if (profile?.hourly_rate) {
          setHourlyRate(profile.hourly_rate);
        }
      } catch (err) {
        console.warn('Failed to load profile preferences:', err);
      }
    })();
  }, [profile?.hourly_rate]);

  // Handler: Save Hourly Rate
  const handleSaveHourlyRate = async (newRate: number) => {
    setHourlyRate(newRate);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_HOURLY_RATE, String(newRate));
      await updateProfile({ hourly_rate: newRate });
    } catch (err) {
      console.warn('Failed to save hourly rate:', err);
    }
  };

  // Handler: Toggle Mask Money
  const handleToggleMask = async (val: boolean) => {
    setIsMasked(val);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_MASK_MONEY, String(val));
      await updateProfile({ privacy_mode: val });
    } catch {}
  };

  // Handler: Change Coach Tone
  const handleChangeTone = async (tone: CoachTone) => {
    setCoachTone(tone);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_COACH_TONE, tone);
    } catch {}
  };

  // Handler: Change Coach Address
  const handleChangeAddress = async (address: CoachAddress) => {
    setCoachAddress(address);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_COACH_ADDRESS, address);
    } catch {}
  };

  // Handler: Save Goal
  const handleSaveGoal = async (goal: {
    name: string;
    targetAmount: number;
    deadline: string;
    reason: string;
  }) => {
    updateGoalSettings(goal.name, goal.targetAmount);
    setGoalDeadline(goal.deadline);
    setGoalReason(goal.reason);

    try {
      await AsyncStorage.setItem(STORAGE_KEY_GOAL_DEADLINE, goal.deadline);
      await AsyncStorage.setItem(STORAGE_KEY_GOAL_REASON, goal.reason);
    } catch {}
  };

  // Handler: Save Budget Settings (Income, Fav Unit)
  const handleSaveBudgetSettings = async (params: {
    monthlyIncome: number;
    monthlyFixedCosts: number;
    favUnit: FavoriteUnit;
  }) => {
    await setupBudget({
      userId: user?.id || 'demo-user',
      monthlyIncome: params.monthlyIncome,
      monthlyFixedCosts: params.monthlyFixedCosts,
      goalName,
      goalTargetAmount,
      favUnit: params.favUnit,
    });
  };

  // Handler: Save Fixed Costs from Modal
  const handleSaveFixedCosts = async (newTotalFixedCosts: number) => {
    await setupBudget({
      userId: user?.id || 'demo-user',
      monthlyIncome,
      monthlyFixedCosts: newTotalFixedCosts,
      goalName,
      goalTargetAmount,
      favUnit,
    });
  };

  // Handler: Update Display Name
  const handleSaveName = async (newName: string) => {
    try {
      await updateProfile({ full_name: newName });
    } catch (err) {
      console.warn('Failed to update name:', err);
    }
  };

  // Handler: Reset All Data
  const handleResetAllData = async () => {
    try {
      await AsyncStorage.multiRemove([
        'vi_locket_transactions_data',
        'vi_locket_budget_setup',
        'vi_locket_cached_user',
        STORAGE_KEY_MASK_MONEY,
        STORAGE_KEY_GOAL_DEADLINE,
        STORAGE_KEY_GOAL_REASON,
      ]);

      if (user?.id) {
        await loadTransactions(user.id);
      }

      Alert.alert(
        'Đã dọn sạch dữ liệu',
        'Toàn bộ nhật ký chi tiêu và dữ liệu trên máy đã được đặt lại thành công.'
      );
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể xóa dữ liệu cục bộ lúc này.');
    }
  };

  // Handler: Delete Account
  const handleDeleteAccount = async () => {
    try {
      await AsyncStorage.clear();
      if (onSignOut) {
        onSignOut();
      } else {
        await signOut();
      }
    } catch (err) {
      console.warn('Failed to delete account:', err);
    }
  };

  // Calculate Streak
  const occurredDates = transactions.map((t) => t.occurred_at.split('T')[0]);
  const streakDays = calculateStreakDays(occurredDates);
  const displayName = profile?.full_name || user?.full_name || 'Người dùng Ví';

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg, paddingTop: insets.top + Spacing.sm }]}>
      {/* 1. TIÊU ĐỀ TRANG HỒ SƠ */}
      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: tokens.text }]}>{Strings.profile.title}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: contentBottomPadding + 20 },
        ]}
      >
        {/* KHỐI 1: THẺ NGƯỜI ĐỒNG HÀNH */}
        <ProfileIdentityCard
          name={displayName}
          email={user?.email}
          streakDays={streakDays}
          savedMoney={savedMoney}
          entriesCount={transactions.length}
          isMasked={isMasked}
          isGuest={isGuest}
          onEditName={() => setShowNameModal(true)}
          onPressLogin={() => router.push('/(auth)/login')}
        />

        {/* ================= NHÓM 1: MỤC TIÊU & KẾ HOẠCH TÀI CHÍNH ================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeaderText, { color: tokens.textMuted }]}>
            Mục tiêu & Kế hoạch
          </Text>
        </View>

        {/* 1.1: MỤC TIÊU 4 TRƯỜNG */}
        <GoalSectionCard
          goalName={goalName}
          goalTargetAmount={goalTargetAmount}
          savedMoney={savedMoney}
          goalDeadline={goalDeadline}
          goalReason={goalReason}
          isMasked={isMasked}
          onPressEdit={() => setShowGoalModal(true)}
        />

        {/* 1.2: ĐỊNH MỨC & THU CHI ĐỊNH KỲ */}
        <BudgetSettingsCard
          monthlyIncome={monthlyIncome}
          monthlyFixedCosts={monthlyFixedCosts}
          baseDailyBudget={baseDailyBudget}
          favUnit={favUnit}
          isMasked={isMasked}
          onSaveBudgetSettings={handleSaveBudgetSettings}
          onOpenFixedCostsModal={() => setShowFixedCostsModal(true)}
        />

        {/* 1.3: QUY ĐỔI GIỜ CÔNG LAO ĐỘNG */}
        <HourlyWageSettingsCard
          hourlyRate={hourlyRate}
          isMasked={isMasked}
          onOpenEditModal={() => setShowHourlyWageModal(true)}
        />

        {/* 1.4: QUẢN LÝ DANH MỤC THU & CHI */}
        <CategorySettingsCard />

        {/* ================= NHÓM 2: TRỢ LÝ & CÁ NHÂN HÓA ================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeaderText, { color: tokens.textMuted }]}>
            Trợ lý & Cá nhân hóa
          </Text>
        </View>

        {/* 2.1: HUẤN LUYỆN VIÊN ANH MINH */}
        <CoachSettingsCard
          currentTone={coachTone}
          currentAddress={coachAddress}
          onChangeTone={handleChangeTone}
          onChangeAddress={handleChangeAddress}
        />

        {/* 2.2: CHỌN GIAO DIỆN SÁNG / TỐI / MÁT */}
        <ThemeSettingsCard />

        {/* ================= NHÓM 3: BẢO MẬT & HỆ THỐNG ================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeaderText, { color: tokens.textMuted }]}>
            Bảo mật & Dữ liệu
          </Text>
        </View>

        {/* 3.1: QUYỀN RIÊNG TƯ & BẢO MẬT */}
        <PrivacySecurityCard
          isMasked={isMasked}
          onToggleMask={handleToggleMask}
        />

        {/* 3.2: TIỆN ÍCH MÀN HÌNH KHÓA */}
        <LockScreenSettingsCard />

        {/* 3.3: TỰ ĐỘNG GHI SỔ THÔNG BÁO NGÂN HÀNG (ANDORID) */}
        <BankNotificationSettingsCard />

        {/* 3.4: THANH TOÁN VIETQR */}
        <QRPaySettingsCard />

        {/* 3.4: DỮ LIỆU & QUẢN TRỊ TÀI KHOẢN */}
        <DataManagementCard
          onResetAllData={handleResetAllData}
          onDeleteAccount={handleDeleteAccount}
          onSignOut={onSignOut || signOut}
          appVersion="1.0.0 (M0)"
        />
      </ScrollView>

      {/* MODAL CẤU HÌNH CHI PHÍ CỐ ĐỊNH CHI TIẾT */}
      <FixedCostSettingsModal
        visible={showFixedCostsModal}
        currentMonthlyFixedCosts={monthlyFixedCosts}
        onClose={() => setShowFixedCostsModal(false)}
        onSaveTotal={handleSaveFixedCosts}
      />

      {/* MODAL SỬA MỤC TIÊU 4 TRƯỜNG */}
      <GoalEditModal
        visible={showGoalModal}
        initialGoalName={goalName}
        initialTargetAmount={goalTargetAmount}
        initialDeadline={goalDeadline}
        initialReason={goalReason}
        onClose={() => setShowGoalModal(false)}
        onSave={handleSaveGoal}
      />

      {/* MODAL ĐỔI BIỆT DANH */}
      <NameEditModal
        visible={showNameModal}
        currentName={displayName}
        onClose={() => setShowNameModal(false)}
        onSave={handleSaveName}
      />

      {/* MODAL CẤU HÌNH LƯƠNG GIỜ */}
      <HourlyWageModal
        visible={showHourlyWageModal}
        currentHourlyRate={hourlyRate}
        monthlyIncome={monthlyIncome}
        onClose={() => setShowHourlyWageModal(false)}
        onSave={handleSaveHourlyRate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingTop: 6,
  },
  sectionHeaderRow: {
    paddingHorizontal: 2,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
