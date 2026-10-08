import { FavoriteUnit } from '../types/database';

export interface RealityMetrics {
  budgetDays: number;         // Số ngày ngân sách
  favUnitCount: number;       // Số ly trà sữa / cốc cà phê / bát phở
  favUnitName: string;        // Tên đơn vị hiển thị
  favUnitIcon: string;        // Emoji
  workHours: number | null;   // Giờ làm việc cần để mua
  delayedDays: number;        // Số ngày bị lùi mục tiêu
  percentOfBalance: number;   // % trên số dư hiện tại
}

export function calculateRealityMetrics(params: {
  amount: number;
  dailyBudget: number;
  hourlyRate: number;
  favUnit: FavoriteUnit;
  goalTargetAmount?: number;
  realBalance: number;
}): RealityMetrics {
  const { amount, dailyBudget, hourlyRate, favUnit, realBalance } = params;

  // 1. Số ngày ngân sách
  const safeDailyBudget = dailyBudget > 0 ? dailyBudget : 50_000;
  const rawBudgetDays = amount / safeDailyBudget;
  const budgetDays = parseFloat(rawBudgetDays.toFixed(1));

  // 2. Quy đổi đơn vị yêu thích
  let unitPrice = 30_000;
  let favUnitName = 'ly trà sữa';
  let favUnitIcon = '🧋';

  if (favUnit === 'ca_phe') {
    unitPrice = 30_000;
    favUnitName = 'ly cà phê trứng';
    favUnitIcon = '☕';
  } else if (favUnit === 'to_pho') {
    unitPrice = 40_000;
    favUnitName = 'bát phở Bát Đàn';
    favUnitIcon = '🍜';
  }

  const rawUnitCount = amount / unitPrice;
  const favUnitCount = parseFloat(rawUnitCount.toFixed(1));

  // 3. Giờ làm thêm cày cuốc
  let workHours: number | null = null;
  if (hourlyRate > 0) {
    workHours = parseFloat((amount / hourlyRate).toFixed(1));
  }

  // 4. Số ngày lùi mục tiêu
  // Giả định mức tiết kiệm ngày trung bình là 30% ngân sách ngày
  const dailySavings = Math.max(20_000, safeDailyBudget * 0.35);
  const delayedDays = Math.max(1, Math.round(amount / dailySavings));

  // 5. % Trên số dư thực tế
  const safeBalance = realBalance > 0 ? realBalance : amount;
  const percentOfBalance = Math.min(100, Math.round((amount / safeBalance) * 100));

  return {
    budgetDays,
    favUnitCount,
    favUnitName,
    favUnitIcon,
    workHours,
    delayedDays,
    percentOfBalance,
  };
}
