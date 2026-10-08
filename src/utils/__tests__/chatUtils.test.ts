/**
 * BỘ KIỂM THỬ XÁC THỰC CÁC HÀM TIỆN ÍCH TRANG CHAT (GIAI ĐOẠN B & C)
 */

import { parseQuickRecordCommand, generateLocalCoachResponse } from '../chatUtils';

declare const describe: (name: string, fn: () => void) => void;
declare const test: (name: string, fn: () => void) => void;
declare const expect: (actual: any) => any;

describe('parseQuickRecordCommand (Bóc tách lệnh ghi sổ tự nhiên)', () => {
  test('Bóc tách đúng "Ghi 45k trà sữa"', () => {
    const result = parseQuickRecordCommand('Ghi 45k trà sữa');
    expect(result.isRecordCommand).toBe(true);
    expect(result.amount).toBe(45000);
    expect(result.description.toLowerCase()).toBe('trà sữa');
    expect(result.category).toBe('Ăn uống');
    expect(result.type).toBe('EXPENSE');
  });

  test('Bóc tách đúng "Đổ xăng 50k"', () => {
    const result = parseQuickRecordCommand('Đổ xăng 50k');
    expect(result.isRecordCommand).toBe(true);
    expect(result.amount).toBe(50000);
    expect(result.category).toBe('Di chuyển');
  });

  test('Bóc tách đúng số tiền triệu "Mua áo khoác 1.2tr"', () => {
    const result = parseQuickRecordCommand('Mua áo khoác 1.2tr');
    expect(result.isRecordCommand).toBe(true);
    expect(result.amount).toBe(1200000);
    expect(result.category).toBe('Mua sắm');
  });

  test('Câu hỏi thông thường không bị hiểu nhầm là lệnh ghi sổ', () => {
    const result = parseQuickRecordCommand('Hôm nay còn tiêu được bao nhiêu tiền?');
    expect(result.isRecordCommand).toBe(false);
  });
});

describe('generateLocalCoachResponse (Sinh câu trả lời số liệu từ Store)', () => {
  const mockContext = {
    remainingToday: 65000,
    totalSpentThisMonth: 2500000,
    coffeeSpentThisMonth: 280000,
    transactionsCount: 42,
    nickname: 'Lâm',
  };

  test('Trả lời đúng số tiền hôm nay còn lại', () => {
    const res = generateLocalCoachResponse('Hôm nay còn tiêu được bao nhiêu?', mockContext);
    expect(res.text.includes('65.000 đ')).toBe(true);
    expect(res.text.includes('Lâm')).toBe(true);
  });

  test('Trả lời đúng số tiền cà phê kèm thẻ số liệu', () => {
    const res = generateLocalCoachResponse('Tháng này uống hết bao nhiêu cà phê?', mockContext);
    expect(res.text.includes('280.000 đ')).toBe(true);
    expect(res.cardType).toBe('METRIC');
    expect(res.cardData.amount).toBe(280000);
  });

  test('Ghi chép tự động trả về thẻ CONFIRMATION', () => {
    const res = generateLocalCoachResponse('Ghi 35k xôi xéo Hàng Bài', mockContext);
    expect(res.cardType).toBe('CONFIRMATION');
    expect(res.cardData.amount).toBe(35000);
  });
});
