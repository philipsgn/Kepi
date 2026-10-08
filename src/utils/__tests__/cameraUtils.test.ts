/**
 * BỘ KIỂM THỬ XÁC THỰC CÁC HÀM TIỆN ÍCH TRANG CAMERA & LỊCH SỬ (GIAI ĐOẠN B & C)
 */

import { formatTimeAgo, getDayLabel, groupTransactionsByDay } from '../cameraUtils';
import { Transaction } from '../../types/database';

declare const describe: (name: string, fn: () => void) => void;
declare const test: (name: string, fn: () => void) => void;
declare const expect: (actual: any) => any;

describe('formatTimeAgo (Mốc thời gian tương đối)', () => {
  const now = '2026-10-02T12:00:00Z';

  test('Dưới 1 phút hiển thị "Vừa xong"', () => {
    const past = '2026-10-02T11:59:45Z';
    expect(formatTimeAgo(past, now)).toBe('Vừa xong');
  });

  test('30 phút trước hiển thị "30 phút trước"', () => {
    const past = '2026-10-02T11:30:00Z';
    expect(formatTimeAgo(past, now)).toBe('30 phút trước');
  });

  test('5 giờ trước hiển thị "5 giờ trước"', () => {
    const past = '2026-10-02T07:00:00Z';
    expect(formatTimeAgo(past, now)).toBe('5 giờ trước');
  });

  test('1 ngày trước hiển thị "Hôm qua"', () => {
    const past = '2026-10-01T12:00:00Z';
    expect(formatTimeAgo(past, now)).toBe('Hôm qua');
  });

  test('3 ngày trước hiển thị "3 ngày trước"', () => {
    const past = '2026-09-29T12:00:00Z';
    expect(formatTimeAgo(past, now)).toBe('3 ngày trước');
  });
});

describe('groupTransactionsByDay', () => {
  const mockTxs: Transaction[] = [
    {
      id: 'tx1',
      user_id: 'u1',
      type: 'EXPENSE',
      amount: 45_000,
      category: 'Ăn uống',
      description: 'Trà sữa',
      photo_url: null,
      payment_method: 'CASH',
      source: 'MANUAL',
      occurred_at: '2026-10-02T10:00:00Z',
      created_at: '2026-10-02T10:00:00Z',
    },
    {
      id: 'tx2',
      user_id: 'u1',
      type: 'EXPENSE',
      amount: 35_000,
      category: 'Ăn uống',
      description: 'Bánh mì',
      photo_url: null,
      payment_method: 'CASH',
      source: 'MANUAL',
      occurred_at: '2026-10-02T08:00:00Z',
      created_at: '2026-10-02T08:00:00Z',
    },
    {
      id: 'tx3',
      user_id: 'u1',
      type: 'EXPENSE',
      amount: 200_000,
      category: 'Cứu ví', // Không mua
      description: 'Ví da',
      photo_url: null,
      payment_method: 'CASH',
      source: 'MANUAL',
      occurred_at: '2026-10-01T15:00:00Z',
      created_at: '2026-10-01T15:00:00Z',
    },
    {
      id: 'tx4',
      user_id: 'u1',
      type: 'EXPENSE',
      amount: 50_000,
      category: 'Di chuyển',
      description: 'Xăng xe',
      photo_url: null,
      payment_method: 'CASH',
      source: 'MANUAL',
      occurred_at: '2026-10-01T10:00:00Z',
      created_at: '2026-10-01T10:00:00Z',
    },
  ];

  test('Gom nhóm chính xác theo ngày và tính tổng chi (loại trừ Cứu ví)', () => {
    const groups = groupTransactionsByDay(mockTxs, '2026-10-02');
    expect(groups.length).toBe(2);

    // Ngày 2026-10-02 (Hôm nay)
    expect(groups[0].dateKey).toBe('2026-10-02');
    expect(groups[0].dateLabel).toBe('Hôm nay');
    expect(groups[0].totalSpent).toBe(80_000); // 45k + 35k
    expect(groups[0].items.length).toBe(2);

    // Ngày 2026-10-01 (Hôm qua)
    expect(groups[1].dateKey).toBe('2026-10-01');
    expect(groups[1].dateLabel).toBe('Hôm qua');
    expect(groups[1].totalSpent).toBe(50_000); // Chỉ tính 50k xăng xe, loại trừ 200k Cứu ví
    expect(groups[1].items.length).toBe(2);
  });
});
