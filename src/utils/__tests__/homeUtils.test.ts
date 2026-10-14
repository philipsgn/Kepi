/**
 * BỘ KIỂM THỬ XÁC THỰC CÁC HÀM TIỆN ÍCH TRANG HOME (GIAI ĐOẠN B & C)
 * Tự cung cấp assertion helpers chuẩn TypeScript, không phụ thuộc framework ngoài.
 */

import { formatCompactVND, formatVND, maskMoney } from '../currency';
import {
  generateMonthGrid,
  getDaysRemainingInMonth,
  getGreetingByHour,
} from '../calendarUtils';
import { Strings } from '../../constants/strings';

declare const describe: (name: string, fn: () => void) => void;
declare const test: (name: string, fn: () => void) => void;
declare const expect: (actual: any) => any;

describe('Định dạng tiền tệ chuẩn (formatVND)', () => {
    test('Số 0 định dạng chính xác "0 đ"', () => {
      expect(formatVND(0)).toBe('0 đ');
      expect(formatVND(NaN)).toBe('0 đ');
    });

    test('Số dương có dấu chấm ngăn cách hàng nghìn và khoảng trắng trước "đ"', () => {
      expect(formatVND(45000)).toBe('45.000 đ');
      expect(formatVND(100000)).toBe('100.000 đ');
      expect(formatVND(1250000)).toBe('1.250.000 đ');
      expect(formatVND(50000000)).toBe('50.000.000 đ');
    });

    test('Số âm giữ nguyên dấu trừ', () => {
      expect(formatVND(-50000)).toBe('-50.000 đ');
    });
  });

  describe('Định dạng tiền rút gọn (formatCompactVND)', () => {
    test('Dưới 1 triệu rút gọn theo "k"', () => {
      expect(formatCompactVND(45000)).toBe('45k');
      expect(formatCompactVND(850000)).toBe('850k');
      expect(formatCompactVND(999000)).toBe('999k');
    });

    test('Từ 1 triệu trở lên rút gọn theo "tr"', () => {
      expect(formatCompactVND(1000000)).toBe('1tr');
      expect(formatCompactVND(1200000)).toBe('1,2tr');
      expect(formatCompactVND(5500000)).toBe('5,5tr');
    });

    test('Từ 1 tỷ trở lên rút gọn theo "B" và 1 nghìn tỷ trở lên rút gọn theo "T"', () => {
      expect(formatCompactVND(1000000000)).toBe('1B');
      expect(formatCompactVND(1200000000)).toBe('1,2B');
      expect(formatCompactVND(1000000000000)).toBe('1T');
      expect(formatCompactVND(2500000000000)).toBe('2,5T');
    });
  });

  describe('Che giấu số tiền riêng tư (maskMoney)', () => {
    test('Trả về "••••" khi bật privacy mode', () => {
      expect(maskMoney('45.000 đ', true)).toBe('••••');
      expect(maskMoney('850k', true)).toBe('••••');
    });

    test('Giữ nguyên giá trị khi tắt privacy mode', () => {
      expect(maskMoney('45.000 đ', false)).toBe('45.000 đ');
      expect(maskMoney('850k', false)).toBe('850k');
    });
  });

  describe('Lời chào theo múi giờ Việt Nam (getGreetingByHour)', () => {
    test('Đúng 5 khung giờ chuẩn đời thường', () => {
      // 08:00 UTC+7 -> Sáng
      const morningDate = new Date('2026-10-02T01:00:00Z');
      expect(getGreetingByHour(morningDate)).toBe(Strings.home.greetingMorning);

      // 12:00 UTC+7 -> Trưa
      const noonDate = new Date('2026-10-02T05:00:00Z');
      expect(getGreetingByHour(noonDate)).toBe(Strings.home.greetingNoon);

      // 15:00 UTC+7 -> Chiều
      const afternoonDate = new Date('2026-10-02T08:00:00Z');
      expect(getGreetingByHour(afternoonDate)).toBe(Strings.home.greetingAfternoon);

      // 20:00 UTC+7 -> Tối
      const eveningDate = new Date('2026-10-02T13:00:00Z');
      expect(getGreetingByHour(eveningDate)).toBe(Strings.home.greetingEvening);

      // 02:00 UTC+7 -> Khuya
      const lateNightDate = new Date('2026-10-01T19:00:00Z');
      expect(getGreetingByHour(lateNightDate)).toBe(Strings.home.greetingLateNight);
    });
  });

  describe('Sinh ma trận lịch 7 cột (generateMonthGrid)', () => {
    test('Số lượng ô luôn là bội số của 7', () => {
      const gridOct2026 = generateMonthGrid(2026, 10, []);
      expect(gridOct2026.length % 7).toBe(0);

      const gridFeb2026 = generateMonthGrid(2026, 2, []);
      expect(gridFeb2026.length % 7).toBe(0);
    });

    test('Chứa đủ 31 ngày cho tháng 10', () => {
      const grid = generateMonthGrid(2026, 10, []);
      const currentMonthDays = grid.filter((c) => c.isCurrentMonth);
      expect(currentMonthDays.length).toBe(31);
    });
  });

  describe('Số ngày còn lại trong tháng (getDaysRemainingInMonth)', () => {
    test('Tính chính xác không âm', () => {
      const days = getDaysRemainingInMonth(new Date());
      expect(days).toBeGreaterThanOrEqual(0);
    });
  });
