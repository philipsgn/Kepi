import {
  groupTransactionsByMonth,
  calculateCategoryBreakdown,
  calculateDailySpend,
} from '../statsUtils';
import { Transaction } from '../../types/database';

declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void) => void;
declare const expect: (actual: any) => any;

describe('Kiểm Chứng Cách Ly Phép Tính (Strict PENDING & CANCELLED Isolation)', () => {
  const baseTxs: Transaction[] = [
    // 1. Khoản CONFIRMED thông thường
    {
      id: 'tx-1',
      user_id: 'u1',
      type: 'EXPENSE',
      amount: 45000,
      category: 'Ăn uống',
      description: 'Cà phê trứng',
      photo_url: null,
      payment_method: 'CASH',
      source: 'MANUAL',
      status: 'CONFIRMED',
      occurred_at: '2026-10-02T10:00:00+07:00',
      created_at: '2026-10-02T10:00:00+07:00',
    },
    // 2. Khoản PENDING (Đang chờ chuyển khoản VietQR)
    {
      id: 'tx-pending-1',
      user_id: 'u1',
      type: 'EXPENSE',
      amount: 250000,
      category: 'Ăn uống',
      description: 'Lẩu nướng phố cổ (Quét VietQR chờ xác nhận)',
      photo_url: null,
      payment_method: 'BANK',
      source: 'QR',
      status: 'PENDING',
      payee_name: 'Nhà Hàng Phố Cổ',
      bank_bin: '970407',
      occurred_at: '2026-10-02T12:00:00+07:00',
      created_at: '2026-10-02T12:00:00+07:00',
    },
    // 3. Khoản CANCELLED (Người dùng hủy chuyển khoản)
    {
      id: 'tx-cancelled-1',
      user_id: 'u1',
      type: 'EXPENSE',
      amount: 500000,
      category: 'Mua sắm',
      description: 'Mua đồ online (Đã hủy)',
      photo_url: null,
      payment_method: 'BANK',
      source: 'QR',
      status: 'CANCELLED',
      occurred_at: '2026-10-02T14:00:00+07:00',
      created_at: '2026-10-02T14:00:00+07:00',
    },
    // 4. Khoản Thu nhập CONFIRMED
    {
      id: 'tx-income-1',
      user_id: 'u1',
      type: 'INCOME',
      amount: 2000000,
      category: 'Thu nhập',
      description: 'Lương thưởng',
      photo_url: null,
      payment_method: 'BANK',
      source: 'MANUAL',
      status: 'CONFIRMED',
      occurred_at: '2026-10-01T09:00:00+07:00',
      created_at: '2026-10-01T09:00:00+07:00',
    },
  ];

  it('Tổng chi tháng (totalSpent) tuyệt đối không cộng khoản PENDING (250.000) hay CANCELLED (500.000)', () => {
    const sections = groupTransactionsByMonth(baseTxs, '2026-10-02T12:00:00+07:00');
    const octSection = sections.find((s) => s.summary.monthKey === '2026-10');

    expect(octSection).toBeDefined();
    // Tổng chi chỉ được phép bằng 45.000 (khoản CONFIRMED), KHÔNG được bằng 45.000 + 250.000 + 500.000!
    expect(octSection?.summary.totalSpent).toBe(45000);
    expect(octSection?.summary.totalIncome).toBe(2000000);
  });

  it('Cơ cấu danh mục (calculateCategoryBreakdown) loại trừ toàn bộ khoản PENDING và CANCELLED', () => {
    const breakdown = calculateCategoryBreakdown(baseTxs);
    const foodCat = breakdown.find((b) => b.category === 'Ăn uống');
    const shoppingCat = breakdown.find((b) => b.category === 'Mua sắm');

    // 'Ăn uống' chỉ tính 45.000, không tính 250.000
    expect(foodCat?.total).toBe(45000);
    expect(foodCat?.count).toBe(1);

    // 'Mua sắm' chỉ có khoản CANCELLED nên hoàn toàn không xuất hiện
    expect(shoppingCat).toBeUndefined();
  });

  it('Biểu đồ chi tiêu theo ngày (calculateDailySpend) không cộng khoản PENDING vào ngày hôm đó', () => {
    const dailyBars = calculateDailySpend(baseTxs, 2026, 10);
    const day2 = dailyBars.find((d) => d.day === 2);

    expect(day2).toBeDefined();
    // Ngày 2 chỉ có 45.000
    expect(day2?.spent).toBe(45000);
  });
});
