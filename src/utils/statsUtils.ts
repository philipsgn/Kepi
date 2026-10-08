/**
 * HÀM TÍNH TOÁN & GOM NHÓM DỮ LIỆU THỐNG KÊ (PURE FUNCTIONS)
 * Tuân thủ mục 4 của đặc tả docs/screens/STATS.md:
 * - Chuẩn múi giờ Việt Nam (Asia/Ho_Chi_Minh, UTC+7).
 * - Khoản chưa có giá (amount === 0 hoặc is_unpriced) không cộng dồn vào tổng chi.
 * - Khoản "Không mua" (is_skipped) cộng vào "Đã giữ lại", không cộng vào "Đã chi".
 * - Khoản "Chỉnh số dư" (type === 'ADJUST') không tính vào tổng chi.
 */

import { Transaction } from '../types/database';

export interface MonthSummary {
  monthKey: string;           // 'YYYY-MM'
  monthLabel: string;         // 'Tháng 10, 2026'
  isCurrentMonth: boolean;    // Đang diễn ra
  totalSpent: number;         // Tổng đã chi
  totalIncome: number;        // Tổng thu nhập
  totalSaved: number;         // Tổng đã giữ lại
  transactionCount: number;   // Tổng số món
  unpricedCount: number;      // Số khoản chưa có giá
  previousMonthDiffPercent?: number; // % so với tháng trước (dương: tăng, âm: giảm)
}

export interface MonthSectionData {
  summary: MonthSummary;
  items: Transaction[];
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  percentage: number;
  count: number;
}

export interface DailySpendBar {
  day: number;
  dateKey: string;
  spent: number;
  isOverTarget: boolean;
}

/**
 * Trích xuất Năm - Tháng theo múi giờ Việt Nam (UTC+7)
 */
export const getVNYearMonth = (dateString: string): { year: number; month: number; key: string } => {
  const d = new Date(dateString);
  const vnTime = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  const year = vnTime.getUTCFullYear();
  const month = vnTime.getUTCMonth() + 1;
  const key = `${year}-${month < 10 ? '0' : ''}${month}`;
  return { year, month, key };
};

/**
 * Trích xuất ngày trong tháng theo múi giờ Việt Nam
 */
export const getVNDayOfMonth = (dateString: string): number => {
  const d = new Date(dateString);
  const vnTime = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  return vnTime.getUTCDate();
};

/**
 * Tạo nhãn tháng tiếng Việt (ví dụ: 'Tháng 10, 2026')
 */
export const formatMonthLabel = (year: number, month: number): string => {
  return `Tháng ${month}, ${year}`;
};

/**
 * Lấy MonthKey hiện tại theo múi giờ Việt Nam
 */
export const getCurrentVNMonthKey = (): string => {
  const now = new Date();
  const { key } = getVNYearMonth(now.toISOString());
  return key;
};

/**
 * Gom nhóm danh sách giao dịch theo từng tháng
 */
export const groupTransactionsByMonth = (
  transactions: Transaction[],
  currentDateIso: string = new Date().toISOString()
): MonthSectionData[] => {
  const currentKey = getVNYearMonth(currentDateIso).key;
  const monthMap: Record<string, { year: number; month: number; items: Transaction[] }> = {};

  transactions.forEach((tx) => {
    const { year, month, key } = getVNYearMonth(tx.occurred_at || tx.created_at);
    if (!monthMap[key]) {
      monthMap[key] = { year, month, items: [] };
    }
    monthMap[key].items.push(tx);
  });

  // Đảm bảo tháng hiện tại luôn có mặt trong danh sách (kể cả khi chưa có dữ liệu)
  if (!monthMap[currentKey]) {
    const { year, month } = getVNYearMonth(currentDateIso);
    monthMap[currentKey] = { year, month, items: [] };
  }

  // Sắp xếp các tháng theo thứ tự mới nhất -> cũ nhất
  const sortedKeys = Object.keys(monthMap).sort((a, b) => b.localeCompare(a));

  const sections: MonthSectionData[] = sortedKeys.map((key) => {
    const { year, month, items } = monthMap[key];

    // Sắp xếp các khoản trong tháng: mới nhất lên trước
    const sortedItems = [...items].sort(
      (a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
    );

    let totalSpent = 0;
    let totalIncome = 0;
    let totalSaved = 0;
    let unpricedCount = 0;

    sortedItems.forEach((item) => {
      // 0. QUY TẮC CÁCH LY PHÉP TÍNH BẤT DI BẤT DỊCH:
      // Bỏ qua toàn bộ khoản Chờ xác nhận (PENDING) hoặc Đã hủy (CANCELLED)
      if (item.status === 'PENDING' || item.status === 'CANCELLED') {
        return;
      }

      // 1. Kiểm tra khoản chưa có giá
      const isUnpriced = (item as any).is_unpriced || (item.type === 'EXPENSE' && (item.amount === 0 || isNaN(item.amount)));
      if (isUnpriced) {
        unpricedCount += 1;
        return; // Không cộng vào tổng chi
      }

      // 2. Kiểm tra khoản "Không mua" (Đã cứu ví)
      const isSkipped = (item as any).is_skipped || item.category === 'Cứu ví';
      if (isSkipped) {
        totalSaved += Math.abs(item.amount);
        return; // Không cộng vào tổng chi
      }

      // 3. Phân loại Thu / Chi bình thường
      if (item.type === 'EXPENSE') {
        totalSpent += Math.abs(item.amount);
      } else if (item.type === 'INCOME') {
        totalIncome += Math.abs(item.amount);
      }
    });

    const isCurrentMonth = key === currentKey;
    const summary: MonthSummary = {
      monthKey: key,
      monthLabel: formatMonthLabel(year, month),
      isCurrentMonth,
      totalSpent,
      totalIncome,
      totalSaved,
      transactionCount: sortedItems.length,
      unpricedCount,
    };

    return {
      summary,
      items: sortedItems,
    };
  });

  // Tính tỷ lệ % so với tháng liền kề trước đó
  for (let i = 0; i < sections.length; i++) {
    const current = sections[i];
    const prev = sections[i + 1]; // Tháng cũ hơn liền kề
    if (prev && prev.summary.totalSpent > 0) {
      const diff = current.summary.totalSpent - prev.summary.totalSpent;
      const pct = Math.round((diff / prev.summary.totalSpent) * 100);
      current.summary.previousMonthDiffPercent = pct;
    }
  }

  return sections;
};

/**
 * Tính toán cơ cấu danh mục chi tiêu trong tháng
 */
export const calculateCategoryBreakdown = (transactions: Transaction[]): CategoryBreakdown[] => {
  const catMap: Record<string, { total: number; count: number }> = {};
  let totalExpense = 0;

  transactions.forEach((tx) => {
    // Bỏ qua PENDING hoặc CANCELLED
    if (tx.status === 'PENDING' || tx.status === 'CANCELLED') return;

    const isUnpriced = (tx as any).is_unpriced || (tx.type === 'EXPENSE' && (tx.amount === 0 || isNaN(tx.amount)));
    const isSkipped = (tx as any).is_skipped || tx.category === 'Cứu ví';
    if (tx.type === 'EXPENSE' && !isUnpriced && !isSkipped) {
      const cat = tx.category || 'Khác';
      const amt = Math.abs(tx.amount);
      if (!catMap[cat]) {
        catMap[cat] = { total: 0, count: 0 };
      }
      catMap[cat].total += amt;
      catMap[cat].count += 1;
      totalExpense += amt;
    }
  });

  if (totalExpense === 0) return [];

  return Object.keys(catMap)
    .map((cat) => ({
      category: cat,
      total: catMap[cat].total,
      percentage: Math.round((catMap[cat].total / totalExpense) * 100),
      count: catMap[cat].count,
    }))
    .sort((a, b) => b.total - a.total);
};

/**
 * Tính toán mức chi từng ngày trong tháng phục vụ biểu đồ cột
 */
export const calculateDailySpend = (
  transactions: Transaction[],
  year: number,
  month: number,
  dailyTarget: number = 100_000
): DailySpendBar[] => {
  // Số ngày trong tháng
  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyMap: Record<number, number> = {};

  for (let day = 1; day <= daysInMonth; day++) {
    dailyMap[day] = 0;
  }

  transactions.forEach((tx) => {
    // Bỏ qua PENDING hoặc CANCELLED
    if (tx.status === 'PENDING' || tx.status === 'CANCELLED') return;

    const isUnpriced = (tx as any).is_unpriced || (tx.type === 'EXPENSE' && (tx.amount === 0 || isNaN(tx.amount)));
    const isSkipped = (tx as any).is_skipped || tx.category === 'Cứu ví';
    if (tx.type === 'EXPENSE' && !isUnpriced && !isSkipped) {
      const day = getVNDayOfMonth(tx.occurred_at || tx.created_at);
      if (dailyMap[day] !== undefined) {
        dailyMap[day] += Math.abs(tx.amount);
      }
    }
  });

  return Object.keys(dailyMap).map((dStr) => {
    const day = parseInt(dStr, 10);
    const spent = dailyMap[day];
    return {
      day,
      dateKey: `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`,
      spent,
      isOverTarget: spent > dailyTarget,
    };
  });
};
