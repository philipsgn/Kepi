/**
 * HÀM TIỆN ÍCH LỊCH & THỜI GIAN THEO MÚI GIỜ VIỆT NAM (Asia/Ho_Chi_Minh)
 * Tuân thủ mục 3.3, 3.6 và 3.8 của đặc tả.
 */

import { Strings } from '../constants/strings';
import { Transaction } from '../types/database';

export interface DayCalendarCell {
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  totalExpense: number;
  totalIncome: number;
  itemCount: number;
  photoThumbnails: string[]; // Tối đa 2 ảnh
  hasSkippedOnly: boolean;
  categories: string[];
}

/**
 * Lấy lời chào theo giờ Việt Nam
 * 05:00 - 10:59: Chào buổi sáng
 * 11:00 - 13:59: Chào buổi trưa
 * 14:00 - 17:59: Chào buổi chiều
 * 18:00 - 22:59: Chào buổi tối
 * 23:00 - 04:59: Khuya rồi
 */
export const getGreetingByHour = (date: Date = new Date()): string => {
  // Lấy giờ theo múi giờ Việt Nam
  const vnHourStr = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(date);
  const hour = parseInt(vnHourStr, 10);

  if (hour >= 5 && hour < 11) return Strings.home.greetingMorning;
  if (hour >= 11 && hour < 14) return Strings.home.greetingNoon;
  if (hour >= 14 && hour < 18) return Strings.home.greetingAfternoon;
  if (hour >= 18 && hour < 23) return Strings.home.greetingEvening;
  return Strings.home.greetingLateNight;
};

/**
 * Chuyển đổi timestamp/ISO sang chuỗi YYYY-MM-DD theo múi giờ Việt Nam
 */
export const getVietnamDateString = (input: Date | string | number = new Date()): string => {
  const d = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input;
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(d); // Trả về dạng YYYY-MM-DD
};

/**
 * Tính số ngày còn lại trong tháng hiện tại
 */
export const getDaysRemainingInMonth = (date: Date = new Date()): number => {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed
  const totalDays = new Date(year, month + 1, 0).getDate();
  const currentDay = date.getDate();
  return Math.max(0, totalDays - currentDay);
};

/**
 * Sinh ma trận 7 cột (Thứ 2 -> Chủ Nhật) cho tháng chỉ định
 */
export const generateMonthGrid = (
  year: number,
  month: number, // 1-12
  transactions: Transaction[] = []
): DayCalendarCell[] => {
  const todayStr = getVietnamDateString(new Date());

  // Map transactions theo ngày YYYY-MM-DD
  const txByDay: Record<string, Transaction[]> = {};
  for (const tx of transactions) {
    const dayKey = getVietnamDateString(tx.created_at);
    if (!txByDay[dayKey]) {
      txByDay[dayKey] = [];
    }
    txByDay[dayKey].push(tx);
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  // Ngày 1 của tháng rơi vào thứ mấy (0 = CN, 1 = T2, ..., 6 = T7)
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  // Chuyển đổi sang tuần bắt đầu từ Thứ 2: T2 = 0, T3 = 1, ..., CN = 6
  const startOffset = (firstDayOfWeek + 6) % 7;

  const cells: DayCalendarCell[] = [];

  // 1. Các ô trống padding từ tháng trước (hoặc hiển thị mờ)
  const prevMonthTotalDays = new Date(year, month - 1, 0).getDate();
  for (let i = startOffset - 1; i >= 0; i--) {
    const prevDay = prevMonthTotalDays - i;
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(prevDay).padStart(2, '0')}`;

    cells.push({
      dateStr,
      dayNumber: prevDay,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr,
      totalExpense: 0,
      totalIncome: 0,
      itemCount: 0,
      photoThumbnails: [],
      hasSkippedOnly: false,
      categories: [],
    });
  }

  // 2. Các ô thuộc tháng hiện tại
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTxs = txByDay[dateStr] || [];

    let totalExpense = 0;
    let totalIncome = 0;
    const photos: string[] = [];
    const categories: string[] = [];

    for (const tx of dayTxs) {
      if (tx.type === 'EXPENSE') {
        totalExpense += tx.amount;
      } else if (tx.type === 'INCOME') {
        totalIncome += tx.amount;
      }
      const photo = tx.thumbnail_url || tx.photo_url;
      if (photo && photos.length < 4) {
        photos.push(photo);
      }
      if (tx.category && !categories.includes(tx.category)) {
        categories.push(tx.category);
      }
    }

    cells.push({
      dateStr,
      dayNumber: day,
      month,
      year,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr,
      totalExpense,
      totalIncome,
      itemCount: dayTxs.length,
      photoThumbnails: photos,
      hasSkippedOnly: false, // Được gộp từ giỏ chờ nếu có
      categories,
    });
  }

  // 3. Padding cuối bảng để tròn bội số của 7
  const remainder = cells.length % 7;
  if (remainder !== 0) {
    const extraNeeded = 7 - remainder;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;

    for (let day = 1; day <= extraNeeded; day++) {
      const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        dateStr,
        dayNumber: day,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isFuture: dateStr > todayStr,
        totalExpense: 0,
        totalIncome: 0,
        itemCount: 0,
        photoThumbnails: [],
        hasSkippedOnly: false,
        categories: [],
      });
    }
  }

  return cells;
};

/**
 * Sinh danh sách 7 ngày (Thứ 2 -> Chủ Nhật) cho tuần của ngày tham chiếu
 */
export const generateWeekDays = (
  referenceDate: Date = new Date(),
  transactions: Transaction[] = []
): DayCalendarCell[] => {
  const todayStr = getVietnamDateString(new Date());

  // Map transactions theo ngày YYYY-MM-DD (chỉ tính confirmed)
  const txByDay: Record<string, Transaction[]> = {};
  for (const tx of transactions) {
    const isConfirmed = tx.status === 'CONFIRMED' || (!tx.status as any);
    if (!isConfirmed) continue;
    const dayKey = getVietnamDateString(tx.created_at);
    if (!txByDay[dayKey]) {
      txByDay[dayKey] = [];
    }
    txByDay[dayKey].push(tx);
  }

  const ref = new Date(referenceDate);
  const dayOfWeek = ref.getDay() === 0 ? 6 : ref.getDay() - 1; // 0 = T2, 6 = CN
  const monday = new Date(ref);
  monday.setDate(ref.getDate() - dayOfWeek);
  monday.setHours(0, 0, 0, 0);

  const cells: DayCalendarCell[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);

    const dateStr = getVietnamDateString(d);
    const dayTxs = txByDay[dateStr] || [];

    let totalExpense = 0;
    let totalIncome = 0;
    const photos: string[] = [];
    const categories: string[] = [];

    for (const tx of dayTxs) {
      if (tx.type === 'EXPENSE') {
        totalExpense += tx.amount;
      } else if (tx.type === 'INCOME') {
        totalIncome += tx.amount;
      }
      const photo = tx.thumbnail_url || tx.photo_url;
      if (photo && photos.length < 4) {
        photos.push(photo);
      }
      if (tx.category && !categories.includes(tx.category)) {
        categories.push(tx.category);
      }
    }

    cells.push({
      dateStr,
      dayNumber: d.getDate(),
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr,
      totalExpense,
      totalIncome,
      itemCount: dayTxs.length,
      photoThumbnails: photos,
      hasSkippedOnly: false,
      categories,
    });
  }

  return cells;
};

export type DayPeriodType = 'MORNING' | 'NOON' | 'AFTERNOON' | 'EVENING' | 'NIGHT';

/**
 * Xác định buổi trong ngày theo giờ Việt Nam
 */
export const getDayPeriod = (date: Date = new Date()): DayPeriodType => {
  const vnHourStr = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(date);
  const hour = parseInt(vnHourStr, 10);
  if (hour >= 5 && hour < 11) return 'MORNING';
  if (hour >= 11 && hour < 14) return 'NOON';
  if (hour >= 14 && hour < 18) return 'AFTERNOON';
  if (hour >= 18 && hour < 22) return 'EVENING';
  return 'NIGHT';
};

/**
 * Lấy chuỗi mô tả dải ngày trong tuần (Ví dụ: "05/10 - 11/10, 2026")
 */
export const getWeekRangeText = (referenceDate: Date = new Date()): string => {
  const ref = new Date(referenceDate);
  const dayOfWeek = ref.getDay() === 0 ? 6 : ref.getDay() - 1;
  const monday = new Date(ref);
  monday.setDate(ref.getDate() - dayOfWeek);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const pad = (n: number) => String(n).padStart(2, '0');
  const monStr = `${pad(monday.getDate())}/${pad(monday.getMonth() + 1)}`;
  const sunStr = `${pad(sunday.getDate())}/${pad(sunday.getMonth() + 1)}`;
  return `${monStr} - ${sunStr}, ${sunday.getFullYear()}`;
};

