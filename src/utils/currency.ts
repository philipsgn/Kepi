/**
 * HÀM ĐỊNH DẠNG TIỀN TỆ & TÍNH TOÁN NGÂN SÁCH (PURE FUNCTIONS)
 * Tuân thủ mục 3.8 của đặc tả:
 * - Đầy đủ: "45.000 đ" (dấu chấm ngăn cách, khoảng trắng trước "đ"); số 0 là "0 đ".
 * - Rút gọn: Dưới 1 triệu "850k", từ 1 triệu "1,2tr".
 * - Ẩn tiền: "••••" khi bật privacy mode.
 */

export const formatVND = (amount: number): string => {
  if (isNaN(amount) || amount === 0) return '0 đ';
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  const formatted = BigInt(absAmount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${isNegative ? '-' : ''}${formatted} đ`;
};

export const formatCompactVND = (amount: number): string => {
  if (isNaN(amount) || amount === 0) return '0 đ';
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));

  if (absAmount >= 1_000_000_000_000) {
    const trillions = absAmount / 1_000_000_000_000;
    const str = (trillions % 1 === 0 ? trillions.toFixed(0) : trillions.toFixed(1)).replace('.', ',');
    return `${isNegative ? '-' : ''}${str}T`;
  }
  if (absAmount >= 1_000_000_000) {
    const billions = absAmount / 1_000_000_000;
    const str = (billions % 1 === 0 ? billions.toFixed(0) : billions.toFixed(1)).replace('.', ',');
    return `${isNegative ? '-' : ''}${str}B`;
  }
  if (absAmount >= 1_000_000) {
    const millions = absAmount / 1_000_000;
    const str = (millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)).replace('.', ',');
    return `${isNegative ? '-' : ''}${str}tr`;
  }
  if (absAmount >= 1_000) {
    const thousands = Math.round(absAmount / 1_000);
    return `${isNegative ? '-' : ''}${thousands}k`;
  }
  return `${isNegative ? '-' : ''}${absAmount} đ`;
};

/**
 * Che giấu số tiền khi ở chế độ riêng tư (Privacy Mode)
 */
export const maskMoney = (amountStr: string, isHidden: boolean): string => {
  return isHidden ? '••••' : amountStr;
};

/**
 * Tính ngân sách ngày cơ sở từ Thu nhập, Chi cố định và Mục tiêu
 */
export const calculateBaseDailyBudget = (
  monthlyIncome: number,
  monthlyFixedCosts: number,
  goalAmount: number,
  daysInMonth: number = 30
): number => {
  const disposable = monthlyIncome - monthlyFixedCosts - goalAmount;
  if (disposable <= 0) return 30_000; // Mức sàn tối thiểu để không bị 0đ
  return Math.max(30_000, Math.floor(disposable / daysInMonth));
};

/**
 * Tính ngân sách hôm nay theo cơ chế Rollover 100%
 */
export const calculateRolloverDailyBudget = (
  baseDailyBudget: number,
  yesterdayAllocated: number,
  yesterdaySpent: number
): number => {
  const rollover = yesterdayAllocated - yesterdaySpent;
  const todayBudget = baseDailyBudget + rollover;
  return Math.max(20_000, todayBudget);
};

/**
 * Lấy tổng số ngày trong tháng hiện tại (hoặc ngày chỉ định)
 */
export const getDaysInCurrentMonth = (date: Date = new Date()): number => {
  const year = date.getFullYear();
  const month = date.getMonth();
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Lấy số ngày còn lại trong tháng (tính cả ngày hôm nay)
 */
export const getDaysRemainingInMonth = (date: Date = new Date()): number => {
  const totalDays = getDaysInCurrentMonth(date);
  const currentDay = date.getDate();
  return Math.max(1, totalDays - currentDay + 1);
};

/**
 * Thuật toán Dynamic Smoothing: Tự động phân bổ đều số tiền khả dụng còn lại
 * cho những ngày còn lại trong tháng.
 * Đảm bảo mức sàn an toàn (mặc định 20.000đ) trừ khi hết sạch tiền khả dụng.
 */
export const calculateDynamicDailyBudget = (
  discretionaryRemaining: number,
  daysRemaining: number,
  minFloor: number = 20_000
): number => {
  if (daysRemaining <= 0) return 0;
  if (discretionaryRemaining <= 0) return 0;
  const daily = Math.round(discretionaryRemaining / daysRemaining);
  return Math.max(minFloor, daily);
};

/**
 * Tính chỉ số ngân sách Tuần (Weekly Budget Stats)
 */
export const calculateWeeklyBudgetStats = (
  dailyBudget: number,
  daysInWeek: number = 7,
  spentThisWeek: number = 0
): { weeklyLimit: number; weeklyRemaining: number; weeklySpentPercent: number } => {
  const weeklyLimit = Math.max(0, dailyBudget * daysInWeek);
  const weeklyRemaining = weeklyLimit - spentThisWeek;
  const weeklySpentPercent = weeklyLimit > 0
    ? Math.min(100, Math.max(0, Math.round((spentThisWeek / weeklyLimit) * 100)))
    : 0;
  return { weeklyLimit, weeklyRemaining, weeklySpentPercent };
};

