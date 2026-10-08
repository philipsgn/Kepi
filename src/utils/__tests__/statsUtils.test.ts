/**
 * BỘ KIỂM THỬ XÁC THỰC CÁC HÀM TIỆN ÍCH TRANG THỐNG KÊ (GIAI ĐOẠN B & C)
 */

import {
  getVNYearMonth,
  getVNDayOfMonth,
  groupTransactionsByMonth,
  calculateCategoryBreakdown,
  calculateDailySpend,
} from '../statsUtils';
import { Transaction } from '../../types/database';

declare const describe: (name: string, fn: () => void) => void;
declare const test: (name: string, fn: () => void) => void;
declare const expect: (actual: any) => any;

describe('Múi giờ Việt Nam (UTC+7)', () => {
  test('Khoản lúc 23:30 ngày cuối tháng 10 (giờ VN) phải thuộc đúng tháng 10 (dù UTC là 16:30)', () => {
    // 2026-10-31T16:30:00Z tương đương 2026-10-31T23:30:00+07:00
    const dateIso = '2026-10-31T16:30:00Z';
    const { year, month, key } = getVNYearMonth(dateIso);
    expect(year).toBe(2026);
    expect(month).toBe(10);
    expect(key).toBe('2026-10');
    expect(getVNDayOfMonth(dateIso)).toBe(31);
  });

  test('Khoản lúc 00:15 ngày đầu tháng 11 (giờ VN) phải thuộc tháng 11 (khi UTC là 17:15 ngày 31/10)', () => {
    // 2026-10-31T17:15:00Z tương đương 2026-11-01T00:15:00+07:00
    const dateIso = '2026-10-31T17:15:00Z';
    const { year, month, key } = getVNYearMonth(dateIso);
    expect(year).toBe(2026);
    expect(month).toBe(11);
    expect(key).toBe('2026-11');
    expect(getVNDayOfMonth(dateIso)).toBe(1);
  });
});

describe('groupTransactionsByMonth', () => {
  const mockTxs: Transaction[] = [
    // Tháng 10
    {
      id: 'tx-1',
      user_id: 'u1',
      type: 'EXPENSE',
      amount: 50_000,
      category: 'Ăn uống',
      description: 'Bún chả',
      photo_url: 'https://example.com/p1.jpg',
      payment_method: 'CASH',
      source: 'MANUAL',
      occurred_at: '2026-10-15T12:00:00Z',
      created_at: '2026-10-15T12:00:00Z',
    },
    {
      id: 'tx-2',
      user_id: 'u1',
      type: 'EXPENSE',
      amount: 0, // Chưa có giá
      category: 'Mua sắm',
      description: 'Áo len',
      photo_url: 'https://example.com/p2.jpg',
      payment_method: 'CASH',
      source: 'MANUAL',
      occurred_at: '2026-10-16T12:00:00Z',
      created_at: '2026-10-16T12:00:00Z',
    },
    {
      id: 'tx-3',
      user_id: 'u1',
      type: 'EXPENSE',
      amount: 200_000,
      category: 'Cứu ví', // Không mua
      description: 'Tai nghe Bluetooth',
      photo_url: null,
      payment_method: 'CASH',
      source: 'MANUAL',
      occurred_at: '2026-10-17T12:00:00Z',
      created_at: '2026-10-17T12:00:00Z',
    },
    {
      id: 'tx-4',
      user_id: 'u1',
      type: 'INCOME',
      amount: 3_000_000,
      category: 'Thu nhập',
      description: 'Lương part-time',
      photo_url: null,
      payment_method: 'BANK',
      source: 'MANUAL',
      occurred_at: '2026-10-05T12:00:00Z',
      created_at: '2026-10-05T12:00:00Z',
    },
    // Tháng 9
    {
      id: 'tx-5',
      user_id: 'u1',
      type: 'EXPENSE',
      amount: 100_000,
      category: 'Ăn uống',
      description: 'Lẩu mini',
      photo_url: null,
      payment_method: 'CASH',
      source: 'MANUAL',
      occurred_at: '2026-09-20T12:00:00Z',
      created_at: '2026-09-20T12:00:00Z',
    },
  ];

  test('Tính đúng tổng chi, thu, đã giữ lại và khoản chưa có giá', () => {
    const sections = groupTransactionsByMonth(mockTxs, '2026-10-20T00:00:00Z');
    expect(sections.length).toBe(2);

    // Tháng 10
    const oct = sections[0];
    expect(oct.summary.monthKey).toBe('2026-10');
    expect(oct.summary.isCurrentMonth).toBe(true);
    expect(oct.summary.totalSpent).toBe(50_000);
    expect(oct.summary.totalIncome).toBe(3_000_000);
    expect(oct.summary.totalSaved).toBe(200_000);
    expect(oct.summary.unpricedCount).toBe(1);
    expect(oct.summary.transactionCount).toBe(4);

    // Tháng 9
    const sep = sections[1];
    expect(sep.summary.monthKey).toBe('2026-09');
    expect(sep.summary.isCurrentMonth).toBe(false);
    expect(sep.summary.totalSpent).toBe(100_000);

    // % so với tháng trước: Tháng 10 chi 50k, tháng 9 chi 100k -> giảm 50%
    expect(oct.summary.previousMonthDiffPercent).toBe(-50);
  });

  test('Tháng hiện tại luôn xuất hiện kể cả khi không có giao dịch nào', () => {
    const emptyTxs: Transaction[] = [];
    const sections = groupTransactionsByMonth(emptyTxs, '2026-10-02T10:00:00Z');
    expect(sections.length).toBe(1);
    expect(sections[0].summary.monthKey).toBe('2026-10');
    expect(sections[0].summary.totalSpent).toBe(0);
    expect(sections[0].items.length).toBe(0);
  });
});

describe('calculateCategoryBreakdown & calculateDailySpend', () => {
  const octTxs: Transaction[] = [
    {
      id: 't1',
      user_id: 'u',
      type: 'EXPENSE',
      amount: 300_000,
      category: 'Ăn uống',
      description: null,
      photo_url: null,
      payment_method: 'CASH',
      source: 'MANUAL',
      occurred_at: '2026-10-02T10:00:00Z',
      created_at: '2026-10-02T10:00:00Z',
    },
    {
      id: 't2',
      user_id: 'u',
      type: 'EXPENSE',
      amount: 100_000,
      category: 'Di chuyển',
      description: null,
      photo_url: null,
      payment_method: 'CASH',
      source: 'MANUAL',
      occurred_at: '2026-10-02T12:00:00Z',
      created_at: '2026-10-02T12:00:00Z',
    },
  ];

  test('Tính đúng tỉ lệ % cơ cấu danh mục', () => {
    const breakdown = calculateCategoryBreakdown(octTxs);
    expect(breakdown.length).toBe(2);
    expect(breakdown[0].category).toBe('Ăn uống');
    expect(breakdown[0].percentage).toBe(75);
    expect(breakdown[1].category).toBe('Di chuyển');
    expect(breakdown[1].percentage).toBe(25);
  });

  test('Tính đúng chi tiêu theo từng ngày và phát hiện vượt định mức', () => {
    const dailyBars = calculateDailySpend(octTxs, 2026, 10, 200_000);
    expect(dailyBars.length).toBe(31);
    const day2 = dailyBars.find((d) => d.day === 2);
    expect(day2).toBeDefined();
    expect(day2?.spent).toBe(400_000);
    expect(day2?.isOverTarget).toBe(true);

    const day3 = dailyBars.find((d) => d.day === 3);
    expect(day3?.spent).toBe(0);
    expect(day3?.isOverTarget).toBe(false);
  });
});
