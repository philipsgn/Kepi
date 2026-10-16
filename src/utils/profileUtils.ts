/**
 * PURE FUNCTIONS CHO TRANG HỒ SƠ (PROFILE UTILS)
 * Tuân thủ mục 4 của đặc tả docs/screens/PROFILE.md:
 * - Tính toán định mức ngày tự động có sàn an toàn (floor guard).
 * - Tính tiến độ tích lũy mục tiêu và số tiền còn thiếu.
 * - Format hiển thị số tiền có hỗ trợ chế độ che số ("Ẩn tiền toàn app").
 * - Tính chuỗi ngày liên tiếp (Streak).
 */

import { formatVND } from './currency';

/**
 * Tính định mức chi tiêu ngày cơ bản từ thu nhập và chi cố định
 * Có sàn an toàn tối thiểu 20.000 đ nếu còn tiền khả dụng
 */
export const calculateBaseDailyBudgetFloor = (
  monthlyIncome: number,
  monthlyFixedCosts: number,
  daysInMonth: number = 30
): number => {
  if (daysInMonth <= 0) daysInMonth = 30;
  const availableMonthly = Math.max(0, monthlyIncome - monthlyFixedCosts);

  if (availableMonthly <= 0) {
    return 0;
  }

  // Chia theo số ngày và làm tròn đến hàng nghìn
  const rawDaily = availableMonthly / daysInMonth;
  const roundedDaily = Math.round(rawDaily / 1000) * 1000;

  // Sàn an toàn tối thiểu 20.000 đ
  return Math.max(20000, roundedDaily);
};

/**
 * Tính phần trăm và số tiền còn thiếu của mục tiêu
 */
export const calculateGoalProgress = (
  savedMoney: number,
  goalTargetAmount: number
): {
  percentage: number;
  remainingAmount: number;
  isAchieved: boolean;
} => {
  if (goalTargetAmount <= 0) {
    return {
      percentage: 0,
      remainingAmount: 0,
      isAchieved: false,
    };
  }

  const rawPercent = (savedMoney / goalTargetAmount) * 100;
  const percentage = Math.min(100, Math.max(0, Math.round(rawPercent)));
  const remainingAmount = Math.max(0, goalTargetAmount - savedMoney);
  const isAchieved = savedMoney >= goalTargetAmount;

  return {
    percentage,
    remainingAmount,
    isAchieved,
  };
};

/**
 * Định dạng tiền tệ có che số nếu bật chế độ Ẩn tiền
 */
export const formatMaskedCurrency = (
  amount: number,
  isMasked: boolean,
  withUnit: boolean = true
): string => {
  if (isMasked) {
    return withUnit ? '•••• đ' : '••••';
  }
  return formatVND(amount);
};

/**
 * Tính số ngày liên tiếp ghi chép chi tiêu (Streak)
 * @param dateStrings Mảng chuỗi ngày YYYY-MM-DD
 */
export const calculateStreakDays = (dateStrings: string[]): number => {
  if (!dateStrings || dateStrings.length === 0) return 0;

  // Loại bỏ ngày trùng lặp và sắp xếp giảm dần (mới nhất trước)
  const uniqueDates = Array.from(new Set(dateStrings)).sort().reverse();

  const today = new Date();
  const formatYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayStr = formatYMD(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = formatYMD(yesterday);

  // Chuỗi phải bắt đầu từ hôm nay hoặc hôm qua
  let currentIndex = 0;
  if (uniqueDates[0] === todayStr) {
    currentIndex = 0;
  } else if (uniqueDates[0] === yesterdayStr) {
    currentIndex = 0;
  } else {
    // Không có ghi chép trong hôm nay lẫn hôm qua -> chuỗi bị đứt
    return 0;
  }

  let streak = 1;
  let currentDate = new Date(uniqueDates[0]);

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(currentDate);
    prevDate.setDate(currentDate.getDate() - 1);
    const expectedStr = formatYMD(prevDate);

    if (uniqueDates[i] === expectedStr) {
      streak += 1;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
};

export type FixedCostCategory =
  | 'rent'        // Tiền nhà / Thuê phòng
  | 'utilities'   // Điện nước, phí dịch vụ
  | 'internet'    // Internet & Điện thoại
  | 'debt'        // Trả góp, nợ, bảo hiểm
  | 'education'   // Học phí, khóa học
  | 'other';      // Chi phí định kỳ khác

export const STORAGE_KEY_FIXED_COST_ITEMS = 'vi_locket_fixed_cost_items';

export interface FixedCostItem {
  id: string;
  name: string;
  amount: number;
  category?: FixedCostCategory;
}

/**
 * Tính tổng các khoản chi phí cố định hàng tháng
 */
export const calculateTotalFixedCosts = (items: FixedCostItem[]): number => {
  if (!items || items.length === 0) return 0;
  return items.reduce((sum, item) => sum + Math.max(0, item.amount || 0), 0);
};

/**
 * Tính lương giờ từ thu nhập tháng và số ngày/giờ làm việc
 * Mặc định: 22 ngày làm việc/tháng, 8 giờ/ngày = 176 giờ/tháng
 */
export const calculateHourlyRate = (
  monthlyIncome: number,
  workDaysPerMonth: number = 22,
  hoursPerDay: number = 8
): number => {
  const totalHours = Math.max(1, workDaysPerMonth * hoursPerDay);
  return Math.round(Math.max(0, monthlyIncome) / totalHours);
};

/**
 * Quy đổi một khoản chi thành số giờ/phút lao động
 * Ví dụ: 250.000 đ với lương 85.000 đ/giờ -> { hours: 2, minutes: 56, formatted: '2h 56p' }
 */
export const convertAmountToWorkHours = (
  amount: number,
  hourlyRate: number
): { hours: number; minutes: number; formatted: string } => {
  if (hourlyRate <= 0 || amount <= 0) {
    return { hours: 0, minutes: 0, formatted: '0 giờ' };
  }
  const decimalHours = amount / hourlyRate;
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  const formatted =
    hours > 0
      ? `${hours}h${minutes > 0 ? ` ${minutes}p` : ''}`
      : `${minutes} phút`;

  return { hours, minutes, formatted };
};

export interface MonthlySavingsParams {
  monthlySavingsGoal: number;
  daysInMonth?: number;
  dailyBudget: number;
  todayBudget?: number;
  todaySpent?: number;
  transactions?: Array<{
    amount: number;
    type?: string;
    occurred_at?: string;
    created_at?: string;
    status?: string;
  }>;
  currentMonthKey?: string; // 'YYYY-MM'
  additionalSavedMoney?: number;
}

export interface MonthlySavingsResult {
  monthlySavingsGoal: number;
  actualSavedThisMonth: number;
  percentage: number;
  isAchieved: boolean;
  daysDisciplined: number;
  daysEvaluated: number;
}

/**
 * Tính tiến độ tích lũy tháng theo cơ chế bảo toàn hạn mức ngày (Daily Allowance Lock-in):
 * - Mỗi ngày trong tháng chi tiêu <= "Hôm nay tiêu được":
 *   + Bảo toàn phần định mức ngày cam kết (monthlySavingsGoal / daysInMonth).
 *   + Cộng dồn số tiền dôi dư nếu chi tiêu thấp hơn hạn mức ngày.
 * - Ngày nào chi tiêu vượt hạn mức: phần vượt trừ vào định mức ngày (không âm quá 0).
 */
export const calculateMonthlyLockedSavings = (
  params: MonthlySavingsParams
): MonthlySavingsResult => {
  const {
    monthlySavingsGoal,
    daysInMonth = 30,
    dailyBudget,
    todayBudget = dailyBudget,
    todaySpent = 0,
    transactions = [],
    currentMonthKey,
    additionalSavedMoney = 0,
  } = params;

  if (monthlySavingsGoal <= 0) {
    return {
      monthlySavingsGoal: 0,
      actualSavedThisMonth: 0,
      percentage: 100,
      isAchieved: true,
      daysDisciplined: 0,
      daysEvaluated: 0,
    };
  }

  const now = new Date();
  const monthKey =
    currentMonthKey ||
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const todayDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const dailyPlannedQuota = Math.round(monthlySavingsGoal / Math.max(1, daysInMonth));

  // Gom nhóm chi tiêu theo từng ngày trong tháng hiện tại
  const dailySpentMap: Record<string, number> = {};
  transactions.forEach((t) => {
    if (t.status === 'CANCELLED' || t.status === 'PENDING') return;
    if (t.type !== 'EXPENSE') return;
    const dateStr = (t.occurred_at || t.created_at || '').substring(0, 10);
    if (dateStr.startsWith(monthKey)) {
      dailySpentMap[dateStr] = (dailySpentMap[dateStr] || 0) + Math.abs(t.amount || 0);
    }
  });

  // Tìm ngày sớm nhất có phát sinh giao dịch trong tháng (hoặc ngày hôm nay)
  const recordedDates = Object.keys(dailySpentMap).sort();
  const earliestDateStr = recordedDates.length > 0 && recordedDates[0] < todayDateStr
    ? recordedDates[0]
    : todayDateStr;

  const currentDayNum = now.getDate();
  const startDayNum = Math.min(
    currentDayNum,
    parseInt(earliestDateStr.substring(8, 10), 10) || currentDayNum
  );

  let accumulatedSaved = Math.max(0, additionalSavedMoney);
  let daysDisciplined = 0;
  let daysEvaluated = 0;

  for (let d = startDayNum; d <= currentDayNum; d++) {
    daysEvaluated++;
    const dayStr = `${monthKey}-${String(d).padStart(2, '0')}`;
    const isToday = dayStr === todayDateStr;
    const effectiveDailyBudget = isToday ? todayBudget : dailyBudget;
    const daySpent = isToday ? todaySpent : (dailySpentMap[dayStr] || 0);

    if (effectiveDailyBudget > 0) {
      if (daySpent <= effectiveDailyBudget) {
        daysDisciplined++;
        // Khóa định mức ngày + cộng tiền dôi dư nếu tiêu thấp hơn
        const unspentLeftover = Math.max(0, effectiveDailyBudget - daySpent);
        accumulatedSaved += dailyPlannedQuota + unspentLeftover;
      } else {
        // Vượt hạn mức: bị trừ hao hụt
        const overspent = daySpent - effectiveDailyBudget;
        accumulatedSaved += Math.max(0, dailyPlannedQuota - overspent);
      }
    } else {
      // Trường hợp không có dailyBudget (chưa set)
      if (daySpent === 0) {
        accumulatedSaved += dailyPlannedQuota;
        daysDisciplined++;
      }
    }
  }

  const roundedActualSaved = Math.round(accumulatedSaved);
  const percentage = Math.min(
    100,
    Math.max(0, Math.round((roundedActualSaved / monthlySavingsGoal) * 100))
  );
  const isAchieved = roundedActualSaved >= monthlySavingsGoal;

  return {
    monthlySavingsGoal,
    actualSavedThisMonth: roundedActualSaved,
    percentage,
    isAchieved,
    daysDisciplined,
    daysEvaluated,
  };
};

export interface GoalItem {
  id: string;
  name: string;
  targetAmount: number;
  deadline?: string | null;
  reason?: string | null;
  createdAt?: string;
}

export const STORAGE_KEY_GOALS_LIST = 'vi_locket_goals_list';

export interface GoalWaterfallProgress {
  goal: GoalItem;
  allocatedSavedMoney: number;
  percentage: number;
  isAchieved: boolean;
  remainingAmount: number;
}

/**
 * Phân bổ số tiền tích lũy theo cơ chế tuần tự (Waterfall Allocation):
 * Tiền tích lũy (totalSavedMoney) dồn 100% cho mục tiêu 1 trước;
 * Khi mục tiêu 1 đạt 100%, số tiền dôi dư tự động tràn sang mục tiêu 2, 3...
 */
export const calculateWaterfallGoals = (
  goals: GoalItem[],
  totalSavedMoney: number
): GoalWaterfallProgress[] => {
  if (!goals || goals.length === 0) return [];

  let remainingSavings = Math.max(0, totalSavedMoney);

  return goals.map((goal) => {
    const target = Math.max(0, goal.targetAmount || 0);
    if (target === 0) {
      return {
        goal,
        allocatedSavedMoney: 0,
        percentage: 0,
        isAchieved: false,
        remainingAmount: 0,
      };
    }

    const allocated = Math.min(target, remainingSavings);
    remainingSavings = Math.max(0, remainingSavings - allocated);

    const percentage = Math.min(100, Math.round((allocated / target) * 100));
    const isAchieved = allocated >= target;
    const remainingAmount = Math.max(0, target - allocated);

    return {
      goal,
      allocatedSavedMoney: allocated,
      percentage,
      isAchieved,
      remainingAmount,
    };
  });
};

