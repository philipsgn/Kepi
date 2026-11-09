/**
 * Voice-to-Expense NLP Parser for Vietnamese Natural Speech
 * Phân tích cú pháp giọng nói tiếng Việt tự nhiên thành bản ghi chi tiêu
 */

export interface ParsedVoiceExpense {
  amount: number;
  category: string;
  description: string;
  emoji: string;
  confidence: number;
  rawText: string;
}

interface CategoryRule {
  category: string;
  emoji: string;
  keywords: string[];
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: 'Ăn uống',
    emoji: '🍜',
    keywords: [
      'phở', 'bún', 'cơm', 'bánh mì', 'cà phê', 'cafe', 'trà sữa',
      'ăn', 'uống', 'highlands', 'starbucks', 'phúc long', 'lẩu',
      'nướng', 'hủ tiếu', 'nem', 'gà rán', 'pizza', 'sushi', 'chè'
    ],
  },
  {
    category: 'Đi lại',
    emoji: '⛽',
    keywords: [
      'xăng', 'đổ xăng', 'grab', 'be', 'gojek', 'xanh sm', 'xe ôm',
      'taxi', 'gửi xe', 'vé xe', 'bus', 'vé máy bay', 'cầu đường'
    ],
  },
  {
    category: 'Mua sắm',
    emoji: '🛍️',
    keywords: [
      'áo', 'quần', 'giày', 'dép', 'túi', 'shopee', 'lazada', 'tiki',
      'mua', 'mỹ phẩm', 'son', 'kem', 'quần áo', 'đồ'
    ],
  },
  {
    category: 'Học tập',
    emoji: '📚',
    keywords: [
      'sách', 'vở', 'bút', 'khóa học', 'học phí', 'tài liệu', 'học', 'thi'
    ],
  },
  {
    category: 'Nhà cửa',
    emoji: '🏠',
    keywords: [
      'tiền trọ', 'tiền nhà', 'điện nước', 'wifi', 'internet', 'chợ',
      'siêu thị', 'xà phòng', 'giấy vệ sinh', 'gas'
    ],
  },
  {
    category: 'Giải trí',
    emoji: '🎮',
    keywords: [
      'xem phim', 'cinema', 'cgv', 'game', 'nạp game', 'billiards',
      'karaoke', 'du lịch', 'vé'
    ],
  },
];

/**
 * Trích xuất số tiền từ chuỗi tiếng Việt tự nhiên
 * Ví dụ: "50k", "50 cành", "50 nghìn", "50 ngàn", "1 lít" (100k), "2 củ" (2tr), "1tr5" (1.5tr)
 */
export function extractAmountFromVoice(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  const lower = text.toLowerCase().replace(/,/g, '.').trim();

  // Pattern 1: XtrY (vd: 1tr5 -> 1.500.000, 2tr2 -> 2.200.000)
  const trSubPattern = /(\d+)\s*(?:tr|triệu)\s*(\d+)/i;
  const trSubMatch = lower.match(trSubPattern);
  if (trSubMatch) {
    const whole = parseInt(trSubMatch[1], 10);
    const fractionPart = trSubMatch[2];
    const fraction = parseInt(fractionPart, 10) / Math.pow(10, fractionPart.length);
    return Math.round((whole + fraction) * 1_000_000);
  }

  // Pattern 2: Dạng số kèm đơn vị cụ thể (vd: 50k, 50 cành, 50 nghìn, 2 triệu, 1.5 củ)
  const unitPatterns: Array<{ regex: RegExp; multiplier: number }> = [
    { regex: /(\d+(?:\.\d+)?)\s*(?:củ|cu|triệu|trieu|tr)(?!\p{L})/iu, multiplier: 1_000_000 },
    { regex: /(\d+(?:\.\d+)?)\s*(?:lít|lit)(?!\p{L})/iu, multiplier: 100_000 },
    { regex: /(\d+(?:\.\d+)?)\s*(?:k|nghìn|nghin|ngàn|ngan|cành|canh)(?!\p{L})/iu, multiplier: 1_000 },
    { regex: /(\d+(?:\.\d+)?)\s*(?:đ|dong|đồng|vnd)(?!\p{L})/iu, multiplier: 1 },
  ];

  for (const item of unitPatterns) {
    const match = lower.match(item.regex);
    if (match) {
      const val = parseFloat(match[1]);
      if (!isNaN(val) && val > 0) {
        return Math.round(val * item.multiplier);
      }
    }
  }

  // Pattern 3: Số tiền thuần viết liền (vd: 50000, 100000)
  const rawNumMatch = lower.match(/\b(\d{4,9})\b/);
  if (rawNumMatch) {
    const val = parseInt(rawNumMatch[1], 10);
    if (!isNaN(val) && val > 0) {
      return val;
    }
  }

  // Pattern 4: Số nhỏ hơn 1000 nhưng đứng sau từ "hết" hoặc "tiêu" (vd: "hết 45", "tiêu 50") -> ngầm định k
  const smallContextMatch = lower.match(/(?:hết|tốn|mất|tiêu|trả)\s+(\d{1,3})\b/i);
  if (smallContextMatch) {
    const val = parseInt(smallContextMatch[1], 10);
    if (!isNaN(val) && val > 0) {
      return val * 1_000;
    }
  }

  return 0;
}

/**
 * Trích xuất danh mục và emoji từ nội dung phát âm
 */
export function extractCategoryFromVoice(text: string): { category: string; emoji: string } {
  if (!text) return { category: 'Khác', emoji: '💸' };
  const lower = text.toLowerCase();

  for (const rule of CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      // Tìm từ khóa theo word boundary hoặc cụm từ
      if (lower.includes(kw)) {
        return { category: rule.category, emoji: rule.emoji };
      }
    }
  }

  return { category: 'Khác', emoji: '💸' };
}

/**
 * Hàm phân tích cú pháp toàn diện từ chuỗi giọng nói sang bản ghi giao dịch
 */
export function parseVoiceExpense(rawText: string): ParsedVoiceExpense {
  const cleanText = (rawText || '').trim();
  const amount = extractAmountFromVoice(cleanText);
  const { category, emoji } = extractCategoryFromVoice(cleanText);

  // Tạo description thanh lịch: bỏ các từ thừa
  let description = cleanText
    .replace(/(?:vừa|mới|hôm nay|chi|tiêu|hết|mất|tốn)\s+/gi, '')
    .trim();
  if (description.length > 50) {
    description = description.slice(0, 47) + '...';
  }
  if (!description) {
    description = category;
  }

  // Tính điểm tin cậy
  let confidence = 0.5;
  if (amount > 0) confidence += 0.3;
  if (category !== 'Khác') confidence += 0.2;

  return {
    amount,
    category,
    description,
    emoji,
    confidence: Math.min(1.0, confidence),
    rawText: cleanText,
  };
}
