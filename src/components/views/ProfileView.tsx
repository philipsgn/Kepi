import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Settings } from 'lucide-react-native';
import { Strings } from '../../constants/strings';
import { Spacing } from '../../constants/layout';
import { useAuthStore } from '../../store/authStore';
import { useBudgetStore } from '../../store/budgetStore';
import { useTransactionStore } from '../../store/transactionStore';
import { ProfileIdentityCard } from '../profile/ProfileIdentityCard';
import { StreakCheckinModal } from '../streak/StreakCheckinModal';
import { GoalSectionCard } from '../profile/GoalSectionCard';
import { GoalDetailModal } from '../profile/GoalDetailModal';
import { BudgetSettingsCard, STORAGE_KEY_SAVINGS_RATIO } from '../profile/BudgetSettingsCard';
import { CategorySettingsCard } from '../profile/CategorySettingsCard';
import { ThemeSettingsCard } from '../profile/ThemeSettingsCard';
import { FixedCostSettingsModal } from '../profile/FixedCostSettingsModal';
import { GoalEditModal } from '../profile/GoalEditModal';
import { NameEditModal } from '../profile/NameEditModal';
import { FavoriteUnit } from '../../types/database';
import {
  calculateStreakDays,
  calculateMonthlyLockedSavings,
  GoalItem,
  STORAGE_KEY_GOALS_LIST,
} from '../../utils/profileUtils';
import { useTheme } from '../../theme/ThemeContext';
import { useBottomInset } from '../../hooks/useBottomInset';

export interface ProfileViewProps {
  onSignOut?: () => void;
  onOpenLessons?: () => void;
}

const STORAGE_KEY_MASK_MONEY = 'vi_locket_mask_money';
const STORAGE_KEY_GOAL_DEADLINE = 'vi_locket_goal_deadline';
const STORAGE_KEY_GOAL_REASON = 'vi_locket_goal_reason';

/**
 * Trang 4: Hồ sơ Cá Nhân (ProfileView) — Phong cách Tối Giản, Độc Đáo
 * Tập trung thuần túy vào Danh tính cá nhân & Kế hoạch tài chính:
 * - Nút icon răng cưa (Settings) kính mờ 40px ở Header mở màn hình Cài Đặt riêng
 * - Thẻ Người đồng hành (Avatar, Tên, 3-Stat: Streak, Đã giữ lại, Đã ghi)
 * - Mục tiêu tích lũy tháng (GoalSectionCard)
 * - Định mức & Thu chi xúc giác (BudgetSettingsCard: Thu nhập, Cố định, Cân bằng số 0)
 * - Quản lý Danh mục Thu & Chi (CategorySettingsCard)
 */
export const ProfileView: React.FC<ProfileViewProps> = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tokens, isDark } = useTheme();
  const { contentBottomPadding } = useBottomInset();

  // Stores
  const { user, profile, isGuest, updateProfile } = useAuthStore();
  const {
    goalName,
    goalTargetAmount,
    savedMoney,
    monthlyIncome,
    monthlyFixedCosts,
    baseDailyBudget,
    todayBudget,
    todaySpent,
    favUnit,
    updateGoalSettings,
    setupBudget,
  } = useBudgetStore();
  const { transactions } = useTransactionStore();

  // Local Settings State
  const [isMasked, setIsMasked] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [goalDeadline, setGoalDeadline] = useState('');
  const [goalReason, setGoalReason] = useState('');
  const [savingsRatio, setSavingsRatio] = useState<number>(0.2);

  // Tính tổng chi tiêu thực tế trong tháng hiện tại
  const currentMonthKey = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const currentMonthSpent = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'EXPENSE' && t.occurred_at.startsWith(currentMonthKey))
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [transactions, currentMonthKey]);

  // Modals State
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showGoalDetailModal, setShowGoalDetailModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showFixedCostsModal, setShowFixedCostsModal] = useState(false);

  // Multi-Goals List State
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [selectedGoalToEdit, setSelectedGoalToEdit] = useState<GoalItem | null>(null);

  // Tính tổng số tiền cần tích lũy của các mục tiêu xếp trước mục tiêu đang chỉnh sửa
  const existingUnfinishedAmount = useMemo(() => {
    const goalIdToEdit = selectedGoalToEdit?.id;
    let sum = 0;
    for (const g of goals) {
      if (goalIdToEdit && g.id === goalIdToEdit) {
        break;
      }
      sum += g.targetAmount || 0;
    }
    return sum;
  }, [goals, selectedGoalToEdit]);

  // Load preferences from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const [savedMask, savedDeadline, savedReason, savedRatio] =
          await Promise.all([
            AsyncStorage.getItem(STORAGE_KEY_MASK_MONEY),
            AsyncStorage.getItem(STORAGE_KEY_GOAL_DEADLINE),
            AsyncStorage.getItem(STORAGE_KEY_GOAL_REASON),
            AsyncStorage.getItem(STORAGE_KEY_SAVINGS_RATIO),
          ]);

        if (savedMask !== null) setIsMasked(savedMask === 'true');

        // Dọn sạch mock/hardcode cũ để bảo đảm "trang giấy trắng tinh" theo yêu cầu
        if (savedDeadline === '31/12/2026') {
          await AsyncStorage.removeItem(STORAGE_KEY_GOAL_DEADLINE);
          setGoalDeadline('');
        } else if (savedDeadline) {
          setGoalDeadline(savedDeadline);
        }

        if (savedReason === 'Tự thưởng sau một năm nỗ lực cày cuốc') {
          await AsyncStorage.removeItem(STORAGE_KEY_GOAL_REASON);
          setGoalReason('');
        } else if (savedReason) {
          setGoalReason(savedReason);
        }

        if (goalName === 'Toyota') {
          updateGoalSettings('', 0);
        }

        // Tải danh sách đa mục tiêu (Multi-goals list)
        const savedGoalsStr = await AsyncStorage.getItem(STORAGE_KEY_GOALS_LIST);
        if (savedGoalsStr) {
          try {
            const parsed = JSON.parse(savedGoalsStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setGoals(parsed);
              if (parsed[0].name !== goalName || parsed[0].targetAmount !== goalTargetAmount) {
                updateGoalSettings(parsed[0].name, parsed[0].targetAmount);
              }
            } else {
              setGoals([]);
            }
          } catch {
            setGoals([]);
          }
        } else if (goalName && goalTargetAmount > 0) {
          const initialList: GoalItem[] = [
            {
              id: 'goal-1',
              name: goalName,
              targetAmount: goalTargetAmount,
              deadline: savedDeadline || '',
              reason: savedReason || '',
              createdAt: new Date().toISOString(),
            },
          ];
          setGoals(initialList);
          await AsyncStorage.setItem(STORAGE_KEY_GOALS_LIST, JSON.stringify(initialList));
        }

        if (savedRatio !== null) {
          const r = parseFloat(savedRatio);
          if (!isNaN(r) && r >= 0 && r <= 1) setSavingsRatio(r);
        }
      } catch (err) {
        console.warn('Failed to load profile preferences:', err);
      }
    })();
  }, [goalName]);

  // Tự động đồng bộ lại trạng thái Ẩn tiền khi quay lại từ màn Cài Đặt
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(STORAGE_KEY_MASK_MONEY).then((saved) => {
        if (saved !== null) setIsMasked(saved === 'true');
      });
    }, [])
  );

  // Handler: Save Goal (Tạo mới hoặc chỉnh sửa mục tiêu trong danh sách)
  const handleSaveGoal = async (goal: {
    id?: string;
    name: string;
    targetAmount: number;
    deadline?: string;
    reason?: string;
  }) => {
    let updatedGoals: GoalItem[];

    if (goal.id) {
      updatedGoals = goals.map((g) =>
        g.id === goal.id
          ? {
              ...g,
              name: goal.name,
              targetAmount: goal.targetAmount,
              deadline: goal.deadline || '',
              reason: goal.reason || '',
            }
          : g
      );
    } else {
      const newGoal: GoalItem = {
        id: `goal-${Date.now()}`,
        name: goal.name,
        targetAmount: goal.targetAmount,
        deadline: goal.deadline || '',
        reason: goal.reason || '',
        createdAt: new Date().toISOString(),
      };
      updatedGoals = [...goals, newGoal];
    }

    setGoals(updatedGoals);

    // Đồng bộ Mục tiêu số 1 với budgetStore
    if (updatedGoals.length > 0) {
      const g1 = updatedGoals[0];
      updateGoalSettings(g1.name, g1.targetAmount);
      setGoalDeadline(g1.deadline || '');
      setGoalReason(g1.reason || '');
      try {
        await AsyncStorage.setItem(STORAGE_KEY_GOAL_DEADLINE, g1.deadline || '');
        await AsyncStorage.setItem(STORAGE_KEY_GOAL_REASON, g1.reason || '');
      } catch {}
    } else {
      updateGoalSettings('', 0);
      setGoalDeadline('');
      setGoalReason('');
    }

    try {
      await AsyncStorage.setItem(STORAGE_KEY_GOALS_LIST, JSON.stringify(updatedGoals));
    } catch (err) {
      console.warn('Failed to save goals list:', err);
    }
  };

  // Handler: Delete Goal
  const handleDeleteGoal = async (goalId: string) => {
    const updatedGoals = goals.filter((g) => g.id !== goalId);
    setGoals(updatedGoals);

    if (updatedGoals.length > 0) {
      const g1 = updatedGoals[0];
      updateGoalSettings(g1.name, g1.targetAmount);
      setGoalDeadline(g1.deadline || '');
      setGoalReason(g1.reason || '');
    } else {
      updateGoalSettings('', 0);
      setGoalDeadline('');
      setGoalReason('');
    }

    try {
      await AsyncStorage.setItem(STORAGE_KEY_GOALS_LIST, JSON.stringify(updatedGoals));
    } catch (err) {
      console.warn('Failed to delete goal:', err);
    }
  };

  const handleOpenAddGoal = () => {
    setSelectedGoalToEdit(null);
    setShowGoalModal(true);
  };

  const handleOpenEditGoal = (goalToEdit?: GoalItem) => {
    setSelectedGoalToEdit(goalToEdit || (goals.length > 0 ? goals[0] : null));
    setShowGoalModal(true);
  };

  // Handler: Save Budget Settings
  const handleDirectLinkGoogle = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { signInWithGoogle } = useAuthStore.getState();
    const res = await signInWithGoogle();
    if (!res.success && res.error) {
      Alert.alert('Liên kết Google', res.error);
    }
  };

  const handleSaveBudgetSettings = async (params: {
    monthlyIncome: number;
    monthlyFixedCosts: number;
    favUnit: FavoriteUnit;
    savingsRatio?: number;
    savingsGoalAmount?: number;
  }) => {
    if (params.savingsRatio !== undefined) {
      setSavingsRatio(params.savingsRatio);
    }
    await setupBudget({
      userId: user?.id || 'guest-user',
      monthlyIncome: params.monthlyIncome,
      monthlyFixedCosts: params.monthlyFixedCosts,
      goalName,
      goalTargetAmount: params.savingsGoalAmount !== undefined ? params.savingsGoalAmount : goalTargetAmount,
      favUnit: params.favUnit,
    });
  };

  // Handler: Save Fixed Costs from Modal
  const handleSaveFixedCosts = async (newTotalFixedCosts: number) => {
    await setupBudget({
      userId: user?.id || 'guest-user',
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

  // Calculate Streak
  const occurredDates = transactions.map((t) => t.occurred_at.split('T')[0]);
  const streakDays = calculateStreakDays(occurredDates);
  const displayName = profile?.full_name || user?.full_name || 'Bạn';

  // Dòng tiền & Định mức tích lũy cam kết mỗi tháng
  const disposableIncome = Math.max(0, monthlyIncome - monthlyFixedCosts);
  const monthlySavingsGoal =
    disposableIncome > 0
      ? Math.round((disposableIncome * savingsRatio) / 100000) * 100000
      : 0;

  // Tiến độ tích lũy tháng theo hạn mức ngày (Daily Allowance Lock-in)
  const effectiveDaily =
    baseDailyBudget > 0
      ? baseDailyBudget
      : disposableIncome > 0
      ? Math.max(20000, Math.round((disposableIncome * (1 - savingsRatio)) / 30 / 1000) * 1000)
      : 0;

  const monthlyLocked = useMemo(() => {
    return calculateMonthlyLockedSavings({
      monthlySavingsGoal,
      dailyBudget: effectiveDaily,
      todayBudget: todayBudget > 0 ? todayBudget : effectiveDaily,
      todaySpent,
      transactions,
      currentMonthKey,
      additionalSavedMoney: 0,
    });
  }, [
    monthlySavingsGoal,
    effectiveDaily,
    todayBudget,
    todaySpent,
    transactions,
    currentMonthKey,
  ]);

  const actualSavedThisMonth = monthlyLocked.actualSavedThisMonth;

  // Số tháng còn lại (monthsRemaining)
  const remainingTotal = Math.max(0, goalTargetAmount - savedMoney);
  const monthsRemaining =
    monthlySavingsGoal > 0 ? Math.ceil(remainingTotal / monthlySavingsGoal) : null;

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg, paddingTop: insets.top + Spacing.sm }]}>
      {/* 1. TIÊU ĐỀ TRANG HỒ SƠ & NÚT RĂNG CƯA CÀI ĐẶT */}
      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: tokens.text }]}>{Strings.profile.title}</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(main)/settings' as any);
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Cài đặt hệ thống"
        >
          <Settings size={22} color={tokens.text} strokeWidth={2.2} />
        </TouchableOpacity>
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
          onPressLogin={handleDirectLinkGoogle}
          onPressStreak={() => setShowStreakModal(true)}
        />

        {/* ================= MỤC TIÊU & KẾ HOẠCH TÀI CHÍNH ================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeaderText, { color: tokens.textMuted }]}>
            Mục tiêu & Kế hoạch
          </Text>
        </View>

        {/* 1.1: ĐỊNH MỨC & THU CHI ĐỊNH KỲ (CÂN BẰNG NGÂN SÁCH - XÁC ĐỊNH THU NHẬP TRƯỚC) */}
        <BudgetSettingsCard
          monthlyIncome={monthlyIncome}
          monthlyFixedCosts={monthlyFixedCosts}
          baseDailyBudget={baseDailyBudget}
          favUnit={favUnit}
          isMasked={isMasked}
          onSaveBudgetSettings={handleSaveBudgetSettings}
        />

        {/* 1.2: MỤC TIÊU CỦA BẠN (MỤC TIÊU TÍCH LŨY THÁNG) */}
        <GoalSectionCard
          goalName={goalName}
          goalTargetAmount={goalTargetAmount}
          savedMoney={savedMoney}
          goals={goals}
          goalDeadline={goalDeadline}
          goalReason={goalReason}
          isMasked={isMasked}
          onPressCard={() => setShowGoalDetailModal(true)}
          onPressAddGoal={handleOpenAddGoal}
          onPressEdit={handleOpenAddGoal}
          monthlyIncome={monthlyIncome}
          monthlyFixedCosts={monthlyFixedCosts}
          savingsRatio={savingsRatio}
          currentMonthSpent={currentMonthSpent}
          favUnit={favUnit}
          baseDailyBudget={baseDailyBudget}
          todayBudget={todayBudget}
          todaySpent={todaySpent}
          transactions={transactions}
          currentMonthKey={currentMonthKey}
        />

        {/* 1.3: QUẢN LÝ DANH MỤC THU & CHI */}
        <CategorySettingsCard />

        {/* 1.4: CHẾ ĐỘ GIAO DIỆN (3 THEME: SÁNG, TỐI, MÁT) */}
        <ThemeSettingsCard />
      </ScrollView>

      {/* MODAL CẤU HÌNH CHI PHÍ CỐ ĐỊNH CHI TIẾT */}
      <FixedCostSettingsModal
        visible={showFixedCostsModal}
        currentMonthlyFixedCosts={monthlyFixedCosts}
        onClose={() => setShowFixedCostsModal(false)}
        onSaveTotal={handleSaveFixedCosts}
      />

      {/* MODAL THÊM / SỬA MỤC TIÊU */}
      <GoalEditModal
        visible={showGoalModal}
        goalId={selectedGoalToEdit?.id}
        initialGoalName={selectedGoalToEdit ? selectedGoalToEdit.name : ''}
        initialTargetAmount={selectedGoalToEdit ? selectedGoalToEdit.targetAmount : 0}
        initialDeadline={selectedGoalToEdit ? selectedGoalToEdit.deadline : ''}
        initialReason={selectedGoalToEdit ? selectedGoalToEdit.reason : ''}
        monthlySavingsGoal={monthlySavingsGoal}
        existingUnfinishedAmount={existingUnfinishedAmount}
        onClose={() => {
          setShowGoalModal(false);
          setSelectedGoalToEdit(null);
        }}
        onSave={handleSaveGoal}
      />

      {/* MODAL CHI TIẾT MỤC TIÊU (MỤC ĐÍCH, NGÀY ĐẠT ĐƯỢC DỰ KIẾN, TIẾN ĐỘ) */}
      <GoalDetailModal
        visible={showGoalDetailModal}
        onClose={() => setShowGoalDetailModal(false)}
        onOpenEdit={(goal) => handleOpenEditGoal(goal)}
        onAddNewGoal={handleOpenAddGoal}
        onDeleteGoal={handleDeleteGoal}
        goals={goals}
        goalName={goalName}
        goalTargetAmount={goalTargetAmount}
        savedMoney={savedMoney}
        monthlySavingsGoal={monthlySavingsGoal}
        monthsRemaining={monthsRemaining}
        actualSavedThisMonth={actualSavedThisMonth}
        goalDeadline={goalDeadline}
        goalReason={goalReason}
        isMasked={isMasked}
      />

      {/* MODAL ĐỔI BIỆT DANH */}
      <NameEditModal
        visible={showNameModal}
        currentName={displayName}
        onClose={() => setShowNameModal(false)}
        onSave={handleSaveName}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  settingsButton: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: 6,
  },
  sectionHeaderRow: {
    paddingHorizontal: 2,
    marginTop: 8,
    marginBottom: 12,
  },
  sectionHeaderText: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
