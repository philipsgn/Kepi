/**
 * HÀM TIỆN ÍCH CHO TRANG CAMERA & LỊCH SỬ (PURE FUNCTIONS)
 * Tuân thủ mục 4 của đặc tả docs/screens/CAMERA.md:
 * - Định dạng mốc thời gian ("5 giờ trước", "Hôm qua", "2 ngày trước").
 * - Gom nhóm giao dịch theo từng ngày kèm tính tổng ngày.
 */

import { Transaction } from '../types/database';
import { Strings } from '../constants/strings';

export interface DayGroup {
  dateKey: string;     // 'YYYY-MM-DD'
  dateLabel: string;   // 'Hôm nay', 'Hôm qua', '28/09/2026'
  totalSpent: number;  // Tổng chi trong ngày
  totalIncome: number; // Tổng thu trong ngày
  items: Transaction[];
}

/**
 * Định dạng mốc thời gian tương đối
 */
export const formatTimeAgo = (dateString: string, nowIso: string = new Date().toISOString()): string => {
  const d = new Date(dateString).getTime();
  const now = new Date(nowIso).getTime();
  const diffMs = Math.max(0, now - d);
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (3600 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 3600 * 1000));

  if (diffMinutes < 1) return Strings.camera.justNow;
  if (diffMinutes < 60) return Strings.camera.timeAgoMinutes(diffMinutes);
  if (diffHours < 24) return Strings.camera.timeAgoHours(diffHours);
  if (diffDays === 1) return Strings.history.yesterday;
  return Strings.camera.timeAgoDays(diffDays);
};

/**
 * Lấy nhãn ngày hiển thị ('Hôm nay', 'Hôm qua', 'DD/MM/YYYY')
 */
export const getDayLabel = (dateKey: string, todayKey: string): string => {
  if (dateKey === todayKey) return Strings.history.today;

  const [y, m, d] = dateKey.split('-').map((v) => parseInt(v, 10));
  const targetDate = new Date(y, m - 1, d);

  const [ty, tm, td] = todayKey.split('-').map((v) => parseInt(v, 10));
  const todayDate = new Date(ty, tm - 1, td);

  const diffDays = Math.round((todayDate.getTime() - targetDate.getTime()) / (24 * 3600 * 1000));
  if (diffDays === 1) return Strings.history.yesterday;

  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
};

/**
 * Gom nhóm danh sách giao dịch theo từng ngày (sắp xếp mới nhất lên trước)
 */
export const groupTransactionsByDay = (
  transactions: Transaction[],
  todayKey: string = new Date().toISOString().split('T')[0]
): DayGroup[] => {
  const map: Record<string, Transaction[]> = {};

  transactions.forEach((tx) => {
    const dateKey = (tx.occurred_at || tx.created_at).split('T')[0];
    if (!map[dateKey]) {
      map[dateKey] = [];
    }
    map[dateKey].push(tx);
  });

  const sortedDateKeys = Object.keys(map).sort((a, b) => b.localeCompare(a));

  return sortedDateKeys.map((dateKey) => {
    const rawItems = map[dateKey];
    // Sắp xếp các món trong ngày: mới nhất lên trước
    const items = [...rawItems].sort(
      (a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
    );

    let totalSpent = 0;
    let totalIncome = 0;

    items.forEach((it) => {
      const isSkipped = (it as any).is_skipped || it.category === 'Cứu ví';
      const isUnpriced = (it as any).is_unpriced || (it.type === 'EXPENSE' && (it.amount === 0 || isNaN(it.amount)));

      if (it.type === 'EXPENSE' && !isSkipped && !isUnpriced) {
        totalSpent += Math.abs(it.amount);
      } else if (it.type === 'INCOME') {
        totalIncome += Math.abs(it.amount);
      }
    });

    return {
      dateKey,
      dateLabel: getDayLabel(dateKey, todayKey),
      totalSpent,
      totalIncome,
      items,
    };
  });
};
