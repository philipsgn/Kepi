/**
 * Pig Advice Engine (Động cơ Lời khuyên Ngộ nghĩnh & Cảm xúc Heo)
 * Pure function bám sát giọng văn Style Heo Con & tình hình tài chính thực tế.
 */

export interface PigAdviceContext {
  todayBudget: number;
  todaySpent: number;
  streakDays?: number;
  currentHour?: number;
  recentCategory?: string;
  isRecentExpense?: boolean;
}

export interface PigAdviceResult {
  text: string;
  mood: 'happy' | 'idle' | 'sad' | 'sleep' | 'blink';
}

export function getPigContextualAdvice(ctx: PigAdviceContext): PigAdviceResult {
  const {
    todayBudget,
    todaySpent,
    streakDays = 1,
    currentHour = new Date().getHours(),
  } = ctx;

  const effectiveLimit = todayBudget > 0 ? todayBudget : 300000;

  // 1. Khung giờ đêm muộn (23h - 05h): Heo ngái ngủ
  if (currentHour >= 23 || currentHour < 5) {
    return {
      text: 'Khuya rồi, đừng lướt sàn cam săn sale nha, heo đi ngủ đây khò khò... 🌙',
      mood: 'sleep',
    };
  }

  // 2. Chưa chi đồng nào hôm nay (0đ)
  if (todaySpent === 0) {
    if (currentHour < 11) {
      return {
        text: 'Ủn ỉn chào ngày mới! Sáng nay mình uống cà phê tự pha hay mua ngoài nè? ☕',
        mood: 'happy',
      };
    }
    if (currentHour < 15) {
      return {
        text: 'Trưa rồi mà chưa tốn hạt cám nào, bạn giữ ví siêu quá nha! 🌾',
        mood: 'happy',
      };
    }
    return {
      text: `Cả ngày 0đ luôn, bái phục! Chuỗi ${streakDays} ngày giữ ví đỉnh chóp ⭐`,
      mood: 'happy',
    };
  }

  // 3. Tỷ lệ chi tiêu trên hạn mức
  const ratio = todaySpent / effectiveLimit;

  // 3.1. Chi tiêu an toàn (< 40%)
  if (ratio < 0.4) {
    return {
      text: 'Chi nhẹ nhàng tình cảm ghê. Heo ủn ỉn khen một cái! 🐷',
      mood: 'happy',
    };
  }

  // 3.2. Chi tiêu vừa vặn (40% - 75%)
  if (ratio < 0.75) {
    if (currentHour >= 14 && currentHour <= 17) {
      return {
        text: 'Đang vừa vặn lắm nè. Tránh bẫy trà sữa xế chiều là cuối tháng no đủ nha! 🧋',
        mood: 'happy',
      };
    }
    return {
      text: 'Chi tiêu chuẩn chỉ ghê! Heo vẫn đang canh chừng giúp bạn, cứ yên tâm nha.',
      mood: 'idle',
    };
  }

  // 3.3. Cận hạn mức (75% - 100%)
  if (ratio <= 1.0) {
    if (currentHour >= 18) {
      return {
        text: 'Gần chạm nóc rồi đó! Tối nay ăn cơm nhà cho heo an lòng nha 🍚',
        mood: 'blink',
      };
    }
    return {
      text: 'Còn một tẹo nữa thôi là chạm hạn mức hôm nay, phanh gấp phanh gấp! ⚠️',
      mood: 'blink',
    };
  }

  // 3.4. Vượt hạn mức (> 100%)
  return {
    text: 'Étt o étt! Lố hạn mức rồi... Heo hơi xót ví, mai mình nhịn ăn vặt bù lại nha! 🥺',
    mood: 'sad',
  };
}
