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
  todayBudget?: number;
  remainingToday: number;
  totalSpentThisMonth: number;
  coffeeSpentThisMonth: number;
  transactionsCount: number;
  topCategoryName?: string;
  topCategoryAmount?: number;
  savingsGoalText?: string;
  nickname?: string;
  // Prototype 24/11 & Masterprompts Plan 13, 14, 17
  recentExpenseName?: string;
  recentExpenseAmount?: number;
  pigHunger?: number;
  fishHunger?: number;
  flowerWater?: number;
  gameTickets?: number;
  pigFood?: number;
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
 * Sinh câu trả lời thông minh từ Heo-Coach (Heo AI) dựa trên số liệu thực tế trong máy
 * Giọng văn theo MASTER-PROMPTS.md (PLAN 8, 14.2 & 17): ngắn gọn tối đa 4 câu, xưng "heo"/"mình" và gọi "bạn".
 */
export const generateLocalCoachResponse = (
  userQuery: string,
  context: FinancialContext
): CoachReplyResult => {
  const query = userQuery.toLowerCase().trim();
  const userGreeting = context.nickname ? `${context.nickname}` : 'bạn';

  // 1. Kiểm tra lệnh ghi chép
  const parsed = parseQuickRecordCommand(userQuery);
  if (parsed.isRecordCommand && parsed.amount > 0) {
    return {
      text: `Heo đã chuẩn bị sẵn thẻ ghi ${formatVND(parsed.amount)} cho món "${parsed.description}". Bạn kiểm tra rồi bấm Lưu nhé!`,
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
    const spent = context.todaySpent ?? 0;
    const limit = context.todayBudget ?? (spent + Math.max(0, context.remainingToday));
    const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;

    if (context.remainingToday > 30000) {
      return {
        text: `Hôm nay ${userGreeting} đã chi ${formatVND(spent)} (${pct}% hạn mức). Còn ${formatVND(context.remainingToday)}. ${pct < 50 ? 'Đang rất ổn, đường trong Heo qua đường cũng thưa hơn đó.' : 'Vừa phải, giữ nhịp này nha.'}`,
        cardType: 'NONE',
      };
    } else if (context.remainingToday > 0) {
      return {
        text: `Hôm nay chỉ còn ${formatVND(context.remainingToday)} (${pct}% hạn mức) thôi nha ${userGreeting}. Sắp chạm hạn mức rồi, mình cân nhắc khoản tiếp theo xíu nhé.`,
        cardType: 'NONE',
      };
    } else {
      return {
        text: `Lố rồi... hôm nay ${userGreeting} chi vượt nhẹ hạn mức rồi. Heo buồn xíu, mai mình chi gọn lại để cân lại nhé.`,
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
      const pct = context.totalSpentThisMonth > 0
        ? Math.round((context.topCategoryAmount / context.totalSpentThisMonth) * 100)
        : 0;
      return {
        text: `Tháng này bạn chi tổng ${formatVND(context.totalSpentThisMonth)}. Nhiều nhất là ${context.topCategoryName}: ${formatVND(context.topCategoryAmount)} (${pct}%).`,
        cardType: 'METRIC',
        cardData: {
          title: context.topCategoryName,
          amount: context.topCategoryAmount,
          percentage: pct,
          category: context.topCategoryName,
        },
      };
    }
  }

  // 4. Hỏi về mục tiêu / tiết kiệm / tích lũy
  if (query.includes('mục tiêu') || query.includes('tiết kiệm') || query.includes('tích lũy') || query.includes('đạt được')) {
    if (context.savingsGoalText) {
      return {
        text: `Về mục tiêu của ${userGreeting}: ${context.savingsGoalText}. Heo luôn ở đây đồng hành từng bước nha!`,
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
      text: `Từ đầu tháng, ${userGreeting} đã chi ${formatVND(context.coffeeSpentThisMonth)} cho cà phê (${pct}% tổng chi). Heo tóm tắt ở thẻ dưới nè:`,
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
      text: `Heo hỏi ba câu nhỏ: (1) cần hay muốn? (2) có cách rẻ hơn không? (3) tuần sau còn thấy xứng đáng không? Nếu chưa gấp, thử chờ 24 giờ xem sao nha.`,
      cardType: 'NONE',
    };
  }

  // 7. Phản biện khoản vừa ghi (Prototype 24/11 & Masterprompts Plan 14.2 & 17)
  if (
    query.includes('phản biện') ||
    query.includes('vừa ghi') ||
    query.includes('gần nhất') ||
    query.includes('khoản vừa')
  ) {
    if (context.recentExpenseName && context.recentExpenseAmount) {
      return {
        text: `Khoản gần nhất: ${context.recentExpenseName}, ${formatVND(context.recentExpenseAmount)}. Heo hỏi ba câu: (1) cần hay muốn? (2) có cách rẻ hơn không? (3) tuần sau còn thấy xứng đáng không?`,
        cardType: 'NONE',
      };
    }
    return {
      text: 'Chưa có khoản nào để phản biện. Khi bạn ghi một khoản mới, heo sẽ giúp bạn cân nhắc ba câu hỏi nhỏ nhé.',
      cardType: 'NONE',
    };
  }

  // 8. Heo nhà đói chưa? (3 chỉ số Việc nhà: Heo, Cá ao, Hoa hồng — PLAN 13 & 17)
  if (
    query.includes('đói') ||
    query.includes('heo nhà') ||
    query.includes('cho ăn') ||
    query.includes('no chưa') ||
    query.includes('cá') ||
    query.includes('hoa')
  ) {
    const pig = context.pigHunger !== undefined ? Math.round(context.pigHunger) : 75;
    const fish = context.fishHunger !== undefined ? Math.round(context.fishHunger) : 72;
    const rose = context.flowerWater !== undefined ? Math.round(context.flowerWater) : 68;
    const hint = pig < 25
      ? 'Heo đói rồi, cho ăn cám đi!'
      : fish < 25
      ? 'Cá đang đói, chơi Heo bay hái bắp và cà rốt nha.'
      : rose < 25
      ? 'Hoa hồng khát, chơi Heo bay hái chuối và táo nhé.'
      : 'Cả nhà đều no, giữ đều vậy là ổn áp!';
    return {
      text: `Heo ${pig}%, cá ao ${fish}%, hoa hồng ${rose}%. ${hint}`,
      cardType: 'NONE',
    };
  }

  // 9. Mẹo kiếm vé chơi game & cám
  if (
    query.includes('vé') ||
    query.includes('cám') ||
    query.includes('mẹo') ||
    query.includes('kiếm vé')
  ) {
    const tix = context.gameTickets || 0;
    const food = context.pigFood || 0;
    return {
      text: `Bạn có ${tix} vé và ${food} cám. Ghi một khoản chi được tặng +1 vé, 10 cám đổi 1 vé. Chơi Heo bay nhớ mang đồ ăn về cho cá và hoa nhé.`,
      cardType: 'NONE',
    };
  }

  // 10. Hỏi về hội bạn thân / squad (PLAN 17 local-first)
  if (query.includes('bạn') || query.includes('hội') || query.includes('squad')) {
    return {
      text: 'Mình chạy ngay trong máy bạn nên không có hội bạn thân. Giờ chỉ có heo với bạn thôi, hỏi heo về hạn mức hay khoản chi nhé.',
      cardType: 'NONE',
    };
  }

  // 11. Câu trả lời mặc định từ Heo-Coach
  return {
    text: `Heo trả lời được về hạn mức hôm nay, danh mục chi nhiều nhất, phản biện khoản gần nhất, heo nhà và vé chơi. Chọn một gợi ý bên dưới nhé.`,
    cardType: 'NONE',
  };
};
