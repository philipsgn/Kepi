/**
 * HÀM TIỆN ÍCH CHO TRANG CHAT & ANH MINH AI (PURE FUNCTIONS)
 * Tuân thủ mục 4 của đặc tả docs/screens/CHAT.md:
 * - Bóc tách lệnh ghi sổ ("Ghi 45k trà sữa", "Đổ xăng 50k").
 * - Sinh câu trả lời số liệu tài chính chuẩn xác từ dữ liệu thực tế (code tính, AI không tự tính toán).
 */

import { TransactionType } from '../types/database';
import { formatVND } from './currency';

export interface ParsedChatExpense {
  isRecordCommand: boolean;
  amount: number;
  description: string;
  category: string;
  type: TransactionType;
}

export interface CoachReplyResult {
  text: string;
  cardType: 'NONE' | 'METRIC' | 'CONFIRMATION' | 'ACTUAL_PRICE';
  cardData?: any;
}

export interface FinancialContext {
  todaySpent?: number;
  remainingToday: number;
  totalSpentThisMonth: number;
  coffeeSpentThisMonth: number;
  transactionsCount: number;
  topCategoryName?: string;
  topCategoryAmount?: number;
  savingsGoalText?: string;
  nickname?: string;
}

/**
 * Đoán danh mục từ mô tả món đồ
 */
export const guessCategoryFromText = (desc: string): string => {
  const lower = desc.toLowerCase();

  // 1. Di chuyển (kiểm tra trước để tránh từ "xăng" dính "ăn")
  if (
    lower.includes('xăng') ||
    lower.includes('grab') ||
    lower.includes('be') ||
    lower.includes('xe') ||
    lower.includes('gửi xe') ||
    lower.includes('vé xe')
  ) {
    return 'Di chuyển';
  }

  // 2. Mua sắm
  if (
    lower.includes('áo') ||
    lower.includes('quần') ||
    lower.includes('giày') ||
    lower.includes('dép') ||
    lower.includes('mũ') ||
    lower.includes('sách') ||
    lower.includes('mua sắm')
  ) {
    return 'Mua sắm';
  }

  // 3. Thu nhập
  if (lower.includes('lương') || lower.includes('thưởng') || lower.includes('tiền về')) {
    return 'Thu nhập';
  }

  // 4. Ăn uống
  if (
    lower.includes('cà phê') ||
    lower.includes('coffee') ||
    lower.includes('trà') ||
    lower.includes('bún') ||
    lower.includes('phở') ||
    lower.includes('cơm') ||
    lower.includes('xôi') ||
    lower.includes('bánh') ||
    lower.includes('ăn uống') ||
    lower.startsWith('ăn')
  ) {
    return 'Ăn uống';
  }

  return 'Ăn uống';
};

/**
 * Bóc tách lệnh ghi chép chi tiêu từ câu chat tự nhiên
 * Ví dụ: "Ghi 45k trà sữa", "Đổ xăng 50k", "Chi 120k sách"
 */
export const parseQuickRecordCommand = (input: string): ParsedChatExpense => {
  const text = input.trim();
  const lower = text.toLowerCase();

  // Kiểm tra từ khóa ghi chép
  const recordKeywords = ['ghi', 'chi', 'mua', 'ăn', 'uống', 'tiêu', 'đổ xăng', 'hết'];
  const hasKeyword = recordKeywords.some((kw) => lower.startsWith(kw) || lower.includes(` ${kw} `));

  // Regex nhận diện số tiền: 45k, 45.000, 45000, 1.2tr, 1,2tr, 2 triệu
  const amountRegex = /(\d+(?:[.,]\d+)?)\s*(k|ngàn|nghìn|tr|triệu|đ|vnd)?/i;
  const match = text.match(amountRegex);

  if (!match || (!hasKeyword && !text.match(/^\d+\s*(k|tr)/i))) {
    return {
      isRecordCommand: false,
      amount: 0,
      description: '',
      category: 'Ăn uống',
      type: 'EXPENSE',
    };
  }

  const numPart = parseFloat(match[1].replace(',', '.'));
  const unit = (match[2] || '').toLowerCase();
  let amount = numPart;

  if (unit === 'k' || unit === 'ngàn' || unit === 'nghìn') {
    amount = numPart * 1000;
  } else if (unit === 'tr' || unit === 'triệu') {
    amount = numPart * 1000000;
  } else if (amount < 1000 && !unit) {
    // Mặc định gõ 45 hiểu là 45k
    amount = numPart * 1000;
  }

  // Tách mô tả món đồ bằng cách loại bỏ số tiền và các từ khóa phụ
  let description = text
    .replace(match[0], '')
    .replace(/^(ghi|chi|hết|mua|ăn|uống)\s+/i, '')
    .trim();

  if (!description) {
    description = 'Khoản chi ghi nhanh';
  }

  const isIncome = lower.includes('thu') || lower.includes('lương') || lower.includes('thưởng');
  const category = isIncome ? 'Thu nhập' : guessCategoryFromText(description);

  return {
    isRecordCommand: true,
    amount: Math.round(amount),
    description,
    category,
    type: isIncome ? 'INCOME' : 'EXPENSE',
  };
};

/**
 * Sinh câu trả lời thông minh từ Anh Minh AI dựa trên số liệu thực tế
 */
export const generateLocalCoachResponse = (
  userQuery: string,
  context: FinancialContext
): CoachReplyResult => {
  const query = userQuery.toLowerCase().trim();
  const userGreeting = context.nickname ? `${context.nickname}` : 'bồ';

  // 1. Kiểm tra lệnh ghi chép
  const parsed = parseQuickRecordCommand(userQuery);
  if (parsed.isRecordCommand && parsed.amount > 0) {
    return {
      text: `Anh Minh đã chuẩn bị thẻ ghi ${formatVND(parsed.amount)} cho món "${parsed.description}". Bồ kiểm tra rồi bấm Lưu vào sổ nhé!`,
      cardType: 'CONFIRMATION',
      cardData: parsed,
    };
  }

  // 2. Hỏi về ngân sách hôm nay
  if (
    query.includes('hôm nay') ||
    query.includes('tiêu được') ||
    query.includes('còn bao nhiêu') ||
    query.includes('ngân sách')
  ) {
    if (context.remainingToday > 30000) {
      return {
        text: `Hôm nay ${userGreeting} còn ${formatVND(context.remainingToday)} để tiêu thoải mái nhé. Cứ thong dong giữ nhịp độ này là bồ đỉnh chóp!`,
        cardType: 'NONE',
      };
    } else if (context.remainingToday > 0) {
      return {
        text: `Hôm nay ví chỉ còn ${formatVND(context.remainingToday)} thôi nhé bồ. Nếu thèm cà phê hay trà sữa thì để mai dàn đều ngân sách rồi tự thưởng nhé!`,
        cardType: 'NONE',
      };
    } else {
      return {
        text: `Hôm nay ${userGreeting} đã vượt nhẹ định mức ngày rồi đó. Nhưng không sao cả bồ ơi, ngày mai mình cân đối lại một chút là về vùng an toàn ngay!`,
        cardType: 'NONE',
      };
    }
  }

  // 3. Hỏi về danh mục tốn nhất / nhiều nhất
  if (
    query.includes('nhiều nhất') ||
    query.includes('tốn nhất') ||
    query.includes('danh mục') ||
    query.includes('chi vào đâu')
  ) {
    if (context.topCategoryName && context.topCategoryAmount) {
      return {
        text: `Tháng này bồ chi nhiều nhất vào mục "${context.topCategoryName}" với tổng ${formatVND(context.topCategoryAmount)}. Bồ muốn anh Minh phân tích kỹ thêm khoản nào không?`,
        cardType: 'METRIC',
        cardData: {
          title: context.topCategoryName,
          amount: context.topCategoryAmount,
          percentage: context.totalSpentThisMonth > 0 ? Math.round((context.topCategoryAmount / context.totalSpentThisMonth) * 100) : 0,
          category: context.topCategoryName,
        },
      };
    }
  }

  // 4. Hỏi về mục tiêu / tiết kiệm / tích lũy
  if (query.includes('mục tiêu') || query.includes('tiết kiệm') || query.includes('tích lũy') || query.includes('đạt được')) {
    if (context.savingsGoalText) {
      return {
        text: `Về mục tiêu tài chính của bồ: ${context.savingsGoalText}. Anh Minh luôn ở đây đồng hành cùng bồ từng bước nhé!`,
        cardType: 'NONE',
      };
    }
  }

  // 5. Hỏi về cà phê / ăn uống trong tháng
  if (query.includes('cà phê') || query.includes('coffee') || query.includes('trà sữa')) {
    const pct =
      context.totalSpentThisMonth > 0
        ? Math.round((context.coffeeSpentThisMonth / context.totalSpentThisMonth) * 100)
        : 0;

    return {
      text: `Từ đầu tháng đến giờ, ${userGreeting} đã chi ${formatVND(context.coffeeSpentThisMonth)} cho cà phê (khoảng ${pct}% tổng chi tiêu). Anh chuẩn bị thẻ tóm tắt cho bồ xem đây:`,
      cardType: 'METRIC',
      cardData: {
        title: 'Cà phê & Đồ uống',
        amount: context.coffeeSpentThisMonth,
        percentage: pct,
        category: 'Ăn uống',
      },
    };
  }

  // 6. Hỏi xem có nên mua hay không
  if (query.includes('có nên mua') || query.includes('nên mua') || query.includes('định mua')) {
    return {
      text: `Món đó có thực sự cần thiết trong 24 giờ tới không ${userGreeting}? Nếu thích quá mà chưa gấp, bồ gửi ảnh vào đây hoặc chọn "Để sau" vào giỏ 24h để nghĩ thêm một đêm nhé!`,
      cardType: 'NONE',
    };
  }

  // 7. Câu trả lời mặc định ấm áp từ anh Minh - bồ
  return {
    text: `Anh Minh nghe đây bồ ơi! Bồ cần kiểm tra ngân sách hôm nay, hay muốn gửi ảnh biên lai/món đồ nhờ anh ghi nhanh vào sổ?`,
    cardType: 'NONE',
  };
};
