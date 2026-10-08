import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import { FavoriteUnit, FinancialSettings } from '../types/database';
import {
  calculateBaseDailyBudget,
  calculateDynamicDailyBudget,
  calculateRolloverDailyBudget,
  calculateWeeklyBudgetStats,
  getDaysRemainingInMonth,
} from '../utils/currency';

export interface MonthRolloverBannerInfo {
  visible: boolean;
  month: string;
  carriedBalance: number;
}

interface BudgetState {
  settings: FinancialSettings | null;
  monthlyIncome: number;
  monthlyFixedCosts: number;
  goalName: string;
  goalTargetAmount: number;
  favUnit: FavoriteUnit;
  baseDailyBudget: number;
  todayBudget: number;
  todaySpent: number;
  todayIncome: number;
  realBalance: number;
  savedMoney: number;
  isLoading: boolean;

  // Milestone M2.2: Ngân sách đa chu kỳ & Rollover tháng tự động
  lastActiveMonth: string;
  monthRolloverBanner: MonthRolloverBannerInfo | null;
  weeklyBudget: number;
  weeklySpent: number;

  // Actions
  setupBudget: (params: {
    userId: string;
    monthlyIncome: number;
    monthlyFixedCosts: number;
    goalName: string;
    goalTargetAmount: number;
    favUnit: FavoriteUnit;
  }) => Promise<void>;
  loadBudget: (userId: string) => Promise<void>;
  recordExpense: (amount: number) => void;
  recordIncome: (amount: number) => void;
  recordSavedMoney: (amount: number) => void;
  applyRolloverForNewDay: (yesterdaySpent: number) => void;
  updateGoalSettings: (goalName: string, goalTargetAmount: number, dailyBudget?: number) => void;
  checkAndApplyMonthRollover: () => Promise<boolean>;
  dismissRolloverBanner: () => void;
  recalculateDynamicBudget: (totalSpentThisMonth?: number) => void;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  settings: null,
  monthlyIncome: 0,
  monthlyFixedCosts: 0,
  goalName: 'Chuyến đi Hà Nội',
  goalTargetAmount: 0,
  favUnit: 'tra_sua',
  baseDailyBudget: 100_000,
  todayBudget: 100_000,
  todaySpent: 0,
  todayIncome: 0,
  realBalance: 0,
  savedMoney: 0,
  isLoading: false,

  lastActiveMonth: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
  monthRolloverBanner: null,
  weeklyBudget: 700_000,
  weeklySpent: 0,

  setupBudget: async ({
    userId,
    monthlyIncome,
    monthlyFixedCosts,
    goalName,
    goalTargetAmount,
    favUnit,
  }) => {
    set({ isLoading: true });

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const daysRemaining = getDaysRemainingInMonth(now);

    // Tính khả dụng và ngân sách ngày động
    const initialBalance = monthlyIncome - monthlyFixedCosts;
    const discretionary = Math.max(0, initialBalance - goalTargetAmount);
    const baseDaily = calculateDynamicDailyBudget(discretionary, daysRemaining);
    const weeklyLimit = baseDaily * 7;

    const newSettings: FinancialSettings = {
      id: `settings-${userId}`,
      user_id: userId,
      monthly_income: monthlyIncome,
      monthly_fixed_costs: monthlyFixedCosts,
      goal_name: goalName,
      goal_target_amount: goalTargetAmount,
      goal_deadline: null,
      base_daily_budget: baseDaily,
      updated_at: new Date().toISOString(),
    };

    // Lưu vào AsyncStorage để dùng offline
    await AsyncStorage.setItem('vi_locket_budget_data', JSON.stringify({
      newSettings,
      todayBudget: baseDaily,
      realBalance: initialBalance,
      savedMoney: 0,
      lastActiveMonth: currentMonthKey,
      weeklyBudget: weeklyLimit,
      weeklySpent: 0,
    }));

    set({
      settings: newSettings,
      monthlyIncome,
      monthlyFixedCosts,
      goalName,
      goalTargetAmount,
      favUnit,
      baseDailyBudget: baseDaily,
      todayBudget: baseDaily,
      realBalance: initialBalance,
      savedMoney: 0,
      lastActiveMonth: currentMonthKey,
      weeklyBudget: weeklyLimit,
      weeklySpent: 0,
      isLoading: false,
    });

    // Đồng bộ lên Supabase nếu có mạng
    try {
      await supabase.from('financial_settings').upsert({
        user_id: userId,
        monthly_income: monthlyIncome,
        monthly_fixed_costs: monthlyFixedCosts,
        goal_name: goalName,
        goal_target_amount: goalTargetAmount,
        base_daily_budget: baseDaily,
        updated_at: new Date().toISOString(),
      });

      await supabase.from('profiles').update({ fav_unit: favUnit }).eq('id', userId);
    } catch {
      // Local first
    }
  },

  loadBudget: async (userId: string) => {
    try {
      set({ isLoading: true });
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const cached = await AsyncStorage.getItem('vi_locket_budget_data');
      if (cached) {
        const parsed = JSON.parse(cached);
        const savedMonth = parsed.lastActiveMonth || currentMonthKey;
        const initialDaily = parsed.todayBudget || 100_000;
        const initialWeekly = parsed.weeklyBudget || initialDaily * 7;

        set({
          settings: parsed.newSettings,
          monthlyIncome: parsed.newSettings.monthly_income,
          monthlyFixedCosts: parsed.newSettings.monthly_fixed_costs,
          goalName: parsed.newSettings.goal_name || '',
          goalTargetAmount: parsed.newSettings.goal_target_amount,
          baseDailyBudget: parsed.newSettings.base_daily_budget,
          todayBudget: initialDaily,
          realBalance: parsed.realBalance,
          savedMoney: parsed.savedMoney || 0,
          lastActiveMonth: savedMonth,
          weeklyBudget: initialWeekly,
          weeklySpent: parsed.weeklySpent || 0,
          isLoading: false,
        });

        // Tự động kiểm tra chuyển tháng khi load
        await get().checkAndApplyMonthRollover();
        return;
      }

      // Lấy từ Supabase nếu chưa có cache
      const { data } = await supabase
        .from('financial_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data) {
        const baseDaily = data.base_daily_budget || 100_000;
        set({
          settings: data,
          monthlyIncome: data.monthly_income,
          monthlyFixedCosts: data.monthly_fixed_costs,
          goalName: data.goal_name || '',
          goalTargetAmount: data.goal_target_amount,
          baseDailyBudget: baseDaily,
          todayBudget: baseDaily,
          realBalance: data.monthly_income - data.monthly_fixed_costs,
          lastActiveMonth: currentMonthKey,
          weeklyBudget: baseDaily * 7,
          weeklySpent: 0,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  recordExpense: (amount: number) => {
    const { todaySpent, realBalance, weeklySpent } = get();
    set({
      todaySpent: todaySpent + amount,
      weeklySpent: weeklySpent + amount,
      realBalance: realBalance - amount,
    });
  },

  recordIncome: (amount: number) => {
    const { todayIncome, realBalance } = get();
    set({
      todayIncome: todayIncome + amount,
      realBalance: realBalance + amount,
    });
  },

  recordSavedMoney: (amount: number) => {
    const { savedMoney } = get();
    set({
      savedMoney: savedMoney + amount,
    });
  },

  applyRolloverForNewDay: (yesterdaySpent: number) => {
    const { baseDailyBudget, todayBudget } = get();
    const newTodayBudget = calculateRolloverDailyBudget(
      baseDailyBudget,
      todayBudget,
      yesterdaySpent
    );
    set({
      todayBudget: newTodayBudget,
      todaySpent: 0,
      todayIncome: 0,
    });
  },

  updateGoalSettings: (goalName: string, goalTargetAmount: number, dailyBudget?: number) => {
    set((state) => ({
      goalName,
      goalTargetAmount,
      baseDailyBudget: dailyBudget !== undefined ? dailyBudget : state.baseDailyBudget,
      todayBudget: dailyBudget !== undefined ? dailyBudget : state.todayBudget,
    }));
  },

  checkAndApplyMonthRollover: async () => {
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const { lastActiveMonth, realBalance, monthlyFixedCosts, goalTargetAmount } = get();

    if (!lastActiveMonth) {
      set({ lastActiveMonth: currentMonthKey });
      return false;
    }

    if (lastActiveMonth !== currentMonthKey) {
      // Phát hiện sang tháng mới -> Tự động kết chuyển dòng tiền liên tục
      const carriedBalance = realBalance;
      const daysRemaining = getDaysRemainingInMonth(now);
      const discretionary = Math.max(0, carriedBalance - monthlyFixedCosts - goalTargetAmount);
      const newDailyBudget = calculateDynamicDailyBudget(discretionary, daysRemaining);
      const weeklyLimit = newDailyBudget * 7;

      set({
        lastActiveMonth: currentMonthKey,
        monthRolloverBanner: {
          visible: true,
          month: String(now.getMonth() + 1),
          carriedBalance,
        },
        todayBudget: newDailyBudget,
        baseDailyBudget: newDailyBudget,
        todaySpent: 0,
        todayIncome: 0,
        weeklyBudget: weeklyLimit,
        weeklySpent: 0,
      });

      try {
        const cached = await AsyncStorage.getItem('vi_locket_budget_data');
        if (cached) {
          const parsed = JSON.parse(cached);
          parsed.lastActiveMonth = currentMonthKey;
          parsed.todayBudget = newDailyBudget;
          parsed.realBalance = carriedBalance;
          parsed.weeklyBudget = weeklyLimit;
          parsed.weeklySpent = 0;
          await AsyncStorage.setItem('vi_locket_budget_data', JSON.stringify(parsed));
        }
      } catch (err) {
        console.warn('Failed to save rollover data:', err);
      }
      return true;
    }
    return false;
  },

  dismissRolloverBanner: () => {
    set({ monthRolloverBanner: null });
  },

  recalculateDynamicBudget: () => {
    const { realBalance, monthlyFixedCosts, goalTargetAmount } = get();
    const daysRemaining = getDaysRemainingInMonth();
    const discretionary = Math.max(0, realBalance - monthlyFixedCosts - goalTargetAmount);
    const newDaily = calculateDynamicDailyBudget(discretionary, daysRemaining);
    const weeklyLimit = newDaily * 7;
    set({
      todayBudget: newDaily,
      weeklyBudget: weeklyLimit,
    });
  },
}));

