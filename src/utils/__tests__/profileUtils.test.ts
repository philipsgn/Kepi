/**
 * UNIT TESTS CHO PROFILE UTILS
 */

// Declare Jest globals for TypeScript
declare const describe: (name: string, fn: () => void) => void;
declare const test: (name: string, fn: () => void) => void;
declare const expect: (actual: any) => any;

import {
  calculateBaseDailyBudgetFloor,
  calculateGoalProgress,
  formatMaskedCurrency,
  calculateStreakDays,
  calculateTotalFixedCosts,
  FixedCostItem,
} from '../profileUtils';

describe('ProfileUtils Test Suite', () => {
  describe('calculateBaseDailyBudgetFloor', () => {
    test('tính đúng định mức ngày từ thu nhập 15tr, chi cố định 6tr trong tháng 30 ngày', () => {
      // 15tr - 6tr = 9tr / 30 = 300.000 đ
      const result = calculateBaseDailyBudgetFloor(15000000, 6000000, 30);
      expect(result).toBe(300000);
    });

    test('áp dụng sàn an toàn 20.000 đ khi số dư khả dụng quá thấp', () => {
      // 6.1tr - 6tr = 100k / 30 = ~3.333 đ -> dưới 20k -> sàn 20.000 đ
      const result = calculateBaseDailyBudgetFloor(6100000, 6000000, 30);
      expect(result).toBe(20000);
    });

    test('trả về 0 khi thu nhập nhỏ hơn hoặc bằng chi phí cố định', () => {
      const result = calculateBaseDailyBudgetFloor(5000000, 6000000, 30);
      expect(result).toBe(0);
    });
  });

  describe('calculateGoalProgress', () => {
    test('tính chính xác phần trăm và số tiền còn thiếu', () => {
      // Mục tiêu 10tr, đã tích lũy 2.5tr -> 25%, còn thiếu 7.5tr
      const result = calculateGoalProgress(2500000, 10000000);
      expect(result.percentage).toBe(25);
      expect(result.remainingAmount).toBe(7500000);
      expect(result.isAchieved).toBe(false);
    });

    test('chạm mốc 100% khi số tiền tích lũy vượt mục tiêu', () => {
      const result = calculateGoalProgress(12000000, 10000000);
      expect(result.percentage).toBe(100);
      expect(result.remainingAmount).toBe(0);
      expect(result.isAchieved).toBe(true);
    });

    test('trả về 0% an toàn khi mục tiêu chưa đặt (bằng 0)', () => {
      const result = calculateGoalProgress(500000, 0);
      expect(result.percentage).toBe(0);
      expect(result.remainingAmount).toBe(0);
      expect(result.isAchieved).toBe(false);
    });
  });

  describe('formatMaskedCurrency', () => {
    test('trả về dấu chấm bảo mật khi isMasked = true', () => {
      expect(formatMaskedCurrency(150000, true)).toBe('•••• đ');
      expect(formatMaskedCurrency(150000, true, false)).toBe('••••');
    });

    test('trả về chuỗi tiền VND chuẩn khi isMasked = false', () => {
      expect(formatMaskedCurrency(150000, false)).toBe('150.000 đ');
    });
  });

  describe('calculateStreakDays', () => {
    test('trả về 0 khi mảng ngày rỗng', () => {
      expect(calculateStreakDays([])).toBe(0);
    });
  });

  describe('calculateTotalFixedCosts', () => {
    test('tính đúng tổng các khoản chi phí cố định', () => {
      const items: FixedCostItem[] = [
        { id: '1', name: 'Tiền thuê nhà', amount: 4500000, category: 'rent' },
        { id: '2', name: 'Điện nước sinh hoạt', amount: 800000, category: 'utilities' },
        { id: '3', name: 'Gói Internet FPT', amount: 250000, category: 'internet' },
      ];
      expect(calculateTotalFixedCosts(items)).toBe(5550000);
    });

    test('trả về 0 khi danh sách rỗng', () => {
      expect(calculateTotalFixedCosts([])).toBe(0);
    });
  });
});
