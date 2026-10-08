import { TransactionType } from '../types/database';

export interface ParsedExpenseData {
  amount: number;
  description: string;
  category: string;
  type: TransactionType;
  confidence: number;
}

/**
 * BỘ PHÂN TÍCH TIẾNG VIỆT THUẦN TÚY (OFFLINE NLP FALLBACK ENGINE)
 * Hiểu các phương ngữ tiếng Việt: "ngàn", "k", "củ", "lít", "chục", "nhăm", "rưỡi".
 */
export const parseVietnameseExpenseText = (text: string): ParsedExpenseData => {
  const normalized = text.toLowerCase().trim();

  // 1. Nhận diện loại giao dịch (Chi hay Thu)
  let type: TransactionType = 'EXPENSE';
  if (
    normalized.includes('lương') ||
    normalized.includes('mẹ gửi') ||
    normalized.includes('bố gửi') ||
    normalized.includes('nhận tiền') ||
    normalized.includes('thưởng') ||
    normalized.includes('pass đồ') ||
    normalized.includes('bán')
  ) {
    type = 'INCOME';
  }

  // 2. Nhận diện danh mục
  let category = 'chi_tieu_khac';
  if (
    normalized.includes('trà sữa') ||
    normalized.includes('cà phê') ||
    normalized.includes('phở') ||
    normalized.includes('bún') ||
    normalized.includes('cơm') ||
    normalized.includes('bánh') ||
    normalized.includes('nước') ||
    normalized.includes('ăn')
  ) {
    category = 'an_uong';
  } else if (
    normalized.includes('xăng') ||
    normalized.includes('grab') ||
    normalized.includes('be') ||
    normalized.includes('xe')
  ) {
    category = 'di_chuyen';
  } else if (
    normalized.includes('áo') ||
    normalized.includes('quần') ||
    normalized.includes('giày') ||
    normalized.includes('shopee') ||
    normalized.includes('tiktok')
  ) {
    category = 'mua_sam';
  }

  // 3. Trích xuất số tiền thông minh
  let amount = 0;

  // Regex phát hiện các mẫu: "x củ", "x triệu", "x củ y" (ví dụ: "1 củ rưỡi", "2 củ 3")
  const cuMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*(?:củ|triệu)/);
  if (cuMatch) {
    const baseMil = parseFloat(cuMatch[1].replace(',', '.'));
    amount = Math.round(baseMil * 1_000_000);
    if (normalized.includes('rưỡi')) {
      amount += 500_000;
    }
  } else if (normalized.includes('củ rưỡi') || normalized.includes('triệu rưỡi')) {
    amount = 1_500_000;
  }

  // Regex phát hiện: "x trăm", "x lít" (ví dụ: "3 trăm", "3 lít rưỡi")
  if (amount === 0) {
    const litMatch = normalized.match(/(\d+)\s*(?:lít|trăm)/);
    if (litMatch) {
      amount = parseInt(litMatch[1], 10) * 100_000;
      if (normalized.includes('rưỡi')) {
        amount += 50_000;
      }
    }
  }

  // Regex phát hiện: "x ngàn", "x nghìn", "xk", "x chục"
  if (amount === 0) {
    const nganMatch = normalized.match(/(\d+)\s*(?:k|ngàn|nghìn)/);
    if (nganMatch) {
      amount = parseInt(nganMatch[1], 10) * 1_000;
    } else {
      const chucMatch = normalized.match(/(\d+)\s*chục/);
      if (chucMatch) {
        amount = parseInt(chucMatch[1], 10) * 10_000;
      }
    }
  }

  // Xử lý bằng chữ số trực tiếp nếu có: "45000", "50000"
  if (amount === 0) {
    const numMatch = normalized.match(/\b\d{2,8}\b/);
    if (numMatch) {
      const parsedNum = parseInt(numMatch[0], 10);
      amount = parsedNum < 1_000 ? parsedNum * 1_000 : parsedNum;
    }
  }

  // Xử lý từ đếm thuần tiếng Việt: "bốn lăm" = 45k, "hai nhăm" = 25k, "ba lăm" = 35k
  if (amount === 0) {
    if (normalized.includes('bốn lăm') || normalized.includes('bốn nhăm') || normalized.includes('bốn mươi lăm')) amount = 45_000;
    else if (normalized.includes('hai lăm') || normalized.includes('hai nhăm') || normalized.includes('hai mươi lăm')) amount = 25_000;
    else if (normalized.includes('ba lăm') || normalized.includes('ba nhăm') || normalized.includes('ba mươi lăm')) amount = 35_000;
    else if (normalized.includes('năm lăm') || normalized.includes('năm nhăm')) amount = 55_000;
    else if (normalized.includes('năm chục')) amount = 50_000;
    else if (normalized.includes('ba chục')) amount = 30_000;
  }

  // Mô tả mặc định nếu không có
  let description = text.trim();
  if (description.length === 0) {
    description = type === 'INCOME' ? 'Khoản thu mới' : 'Món đồ vừa chụp';
  }

  return {
    amount: amount > 0 ? amount : 45_000,
    description: description.charAt(0).toUpperCase() + description.slice(1),
    category,
    type,
    confidence: amount > 0 ? 0.92 : 0.75,
  };
};

/**
 * Phân tích mô tả giao dịch văn bản tiếng Việt thuần túy
 */
export function parseExpenseTextInput(text: string): ParsedExpenseData {
  return parseVietnameseExpenseText(text);
}

export interface FinancialContext {
  todayBudget: number;
  todaySpent: number;
  remainingToday: number;
  goalName: string;
  goalTargetAmount: number;
  savedMoney: number;
}

/**
 * ĐỘNG CƠ TƯ VẤN 2 CHIỀU CỦA MINH LOCKET — "ANH PT GIỮ VÍ"
 * Trò chuyện, uốn nắn thói quen chi tiêu, phân tích bẫy trend và đưa bài tập siết ví.
 */
export async function chatWithMinhCoach(
  userMessage: string,
  context: FinancialContext
): Promise<string> {
  const norm = userMessage.toLowerCase().trim();

  // 1. Phân tích các chủ đề câu hỏi phổ biến
  const { todayBudget, todaySpent, remainingToday, goalName, goalTargetAmount, savedMoney } = context;

  // Lời khuyên khi người dùng hỏi "Có nên mua không?"
  if (norm.includes('có nên mua') || norm.includes('nên mua không') || norm.includes('mua được không')) {
    if (remainingToday <= 0) {
      return `🛑 Minh còi cọc cản liền bồ ơi! Hôm nay bồ đã xài hết sạch hạn mức ngày rồi. Mua món này là thâm hụt vào tiền sinh hoạt đó. Bỏ vào Giỏ Chờ 24h đi, mai tỉnh táo tính tiếp!`;
    }
    return `🤔 Minh hỏi thiệt bồ 2 câu: Món này bồ dùng được mấy lần 1 tuần? Và nó có đẩy lùi mục tiêu "${goalName}" không? Nếu chỉ thích vì lướt thấy hot, nhịn 24h đi bồ, tiền để tích lũy sướng hơn nhiều!`;
  }

  // Lời khuyên khi "Lỡ tiêu lố"
  if (norm.includes('lố') || norm.includes('lỡ tiêu') || norm.includes('tiêu quá') || norm.includes('hết tiền')) {
    return `💪 Đừng hoảng bồ ơi! PT tài chính Minh có bài tập siết cơ ví cho bồ: Hôm nay lỡ lố ${Math.abs(remainingToday).toLocaleString()}đ thì 2 ngày tới mỗi ngày tự giảm 50k tiền ăn vặt bù lại. Kỷ luật là cơ bắp, tập dần sẽ khỏe!`;
  }

  // Lời khuyên khi xin "Giáo án kỷ luật tuần này"
  if (norm.includes('giáo án') || norm.includes('kỷ luật') || norm.includes('bài tập') || norm.includes('kế hoạch')) {
    return `📋 Giáo án tuần này của Minh cho bồ: 1. Áp dụng quy tắc "3 giây thở sâu" trước khi quẹt thẻ. 2. Không mở app săn sale sau 11h đêm. 3. Mỗi ngày giữ lại ít nhất 30k vào mục tiêu "${goalName}". Bồ làm được không nào?`;
  }

  // Lời khuyên khi hỏi về "Mẹo săn sale"
  if (norm.includes('sale') || norm.includes('shopee') || norm.includes('tiktok') || norm.includes('giảm giá')) {
    return `🏷️ Bẫy giảm giá kinh điển đó bồ! Món 500k sale còn 350k: Không mua là bồ tiết kiệm được 350k chứ không phải hời được 150k đâu nhé! Luôn hỏi: "Mình có cần nó lúc nó nguyên giá không?"`;
  }

  // Lời khuyên khi hỏi về "Tiết kiệm mua Laptop / Du lịch / Mục tiêu"
  if (norm.includes('laptop') || norm.includes('mục tiêu') || norm.includes('tiết kiệm') || norm.includes('du lịch')) {
    const progress = goalTargetAmount > 0 ? Math.round((savedMoney / goalTargetAmount) * 100) : 0;
    return `🎯 Mục tiêu "${goalName}" của bồ đang đạt ${progress}% rồi đó (${savedMoney.toLocaleString()}đ / ${goalTargetAmount.toLocaleString()}đ). Giữ vững phong độ này, mỗi lần bồ từ chối 1 ly trà sữa hay áo quần đu trend là bồ rút ngắn 1 ngày về đích!`;
  }

  // Phản hồi tổng quát thân thiện, thẳng thắn
  return `👊 Minh nghe bồ nè! Quản lý chi tiêu cũng như tập gym vậy, những ngày đầu sẽ hơi ngứa ngáy tay chân khi thấy đồ đẹp, nhưng khi nhìn số dư "${goalName}" tăng lên từng ngày, bồ sẽ thấy cực kỳ tự hào về bản thân. Bồ đang phân vân món nào, kể Minh nghe!`;
}
