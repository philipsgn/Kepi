import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { chatWithMinhCoach, FinancialContext } from '../services/gemini';

export type MinhExpression = 'NEUTRAL' | 'SMILING' | 'SKEPTICAL_TREND' | 'SHOCKED';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: number;
}

export interface PurchaseEvaluation {
  utilityScore: number;       // 1 - 10 (Điểm tiện ích thực tế)
  trendScore: number;         // 1 - 10 (Điểm nguy cơ mua theo trend/hype)
  isTrendRisk: boolean;       // Có phải món đồ mua theo trend dễ bỏ xó?
  practicalNote: string;      // Nhận xét về độ thiết thực
  trendAlertNote: string;     // Lời cảnh báo về độ hot nhất thời
  goalImpactDays: number;     // Số ngày làm lùi bước mục tiêu cá nhân
  goalImpactPercent: number;  // % làm ảnh hưởng đến mục tiêu
  recommendedAction: 'SHOULD_BUY' | 'WAIT_BASKET_RECOMMENDED';
  expression: MinhExpression;
  coachQuote: string;         // Lời tâm sự của Minh ("tui - bồ")
}

interface MinhCoachState {
  expression: MinhExpression;
  currentAdvice: string;
  resistedImpulsesCount: number; // Số lần kiềm chế thành công cám dỗ
  totalSavedFromTrend: number;   // Tổng tiền đã cứu khỏi các món đồ theo trend
  messages: ChatMessage[];
  isThinking: boolean;

  // Actions
  setExpression: (expression: MinhExpression) => void;
  recordResistedImpulse: (savedAmount: number) => void;
  sendChatMessage: (userText: string, context: FinancialContext) => Promise<void>;
  clearChatHistory: () => void;
  evaluatePurchase: (params: {
    description: string;
    amount: number;
    category?: string;
    goalName: string;
    goalTargetAmount: number;
    dailyBudget: number;
  }) => PurchaseEvaluation;
  getDailyGreeting: (remainingToday: number, dailyBudget: number, goalName: string) => string;
}

// Từ khóa phát hiện các mặt hàng có xu hướng mua theo trend / FOMO mạng xã hội
const TREND_KEYWORDS = [
  'labubu', 'blind box', 'hộp mù', 'pop mart', 'son', 'áo khoác', 'shopee',
  'tiktok', 'trend', 'hot', 'cà phê muối', 'trà mãng cầu', 'bánh đồng xu',
  'trà chanh giã tay', 'váy', 'giày', 'mô hình', 'keychain', 'charm', 'order',
];

// Từ khóa phát hiện mặt hàng có tiện ích thực tế cao
const UTILITY_KEYWORDS = [
  'cơm', 'phở', 'bún', 'xăng', 'sách', 'thuốc', 'khám', 'học', 'siêu thị',
  'điện', 'nước', 'sạc', 'chuột', 'bàn phím', 'sữa', 'rau', 'thịt', 'gửi xe',
];

export const useMinhCoachStore = create<MinhCoachState>()(
  persist(
    (set, get) => ({
      expression: 'NEUTRAL',
      currentAdvice: 'Chào bồ! Tui là Minh Locket — người bạn đồng hành giữ ví tỉnh táo của bồ đây.',
      resistedImpulsesCount: 0,
      totalSavedFromTrend: 0,

      messages: [
        {
          id: 'welcome-msg',
          sender: 'coach',
          text: 'Chào bồ! Minh là PT tài chính cá nhân của bồ đây. Hôm nay bồ có phân vân muốn mua món gì, hay cần lên giáo án siết ví thì cứ nhắn Minh nhé!',
          timestamp: Date.now(),
        },
      ],
      isThinking: false,

      setExpression: (expression) => set({ expression }),

      recordResistedImpulse: (savedAmount) =>
        set((state) => ({
          resistedImpulsesCount: state.resistedImpulsesCount + 1,
          totalSavedFromTrend: state.totalSavedFromTrend + savedAmount,
          expression: 'SMILING',
        })),

      sendChatMessage: async (userText, context) => {
        const userMsg: ChatMessage = {
          id: 'user-' + Date.now(),
          sender: 'user',
          text: userText.trim(),
          timestamp: Date.now(),
        };

        set((state) => ({
          messages: [...state.messages, userMsg],
          isThinking: true,
        }));

        try {
          const reply = await chatWithMinhCoach(userText, context);
          const coachMsg: ChatMessage = {
            id: 'coach-' + Date.now(),
            sender: 'coach',
            text: reply,
            timestamp: Date.now(),
          };

          set((state) => ({
            messages: [...state.messages, coachMsg],
            currentAdvice: reply,
            isThinking: false,
          }));
        } catch {
          const fallbackMsg: ChatMessage = {
            id: 'coach-' + Date.now(),
            sender: 'coach',
            text: 'Minh nghe bồ nè! Kỷ luật tài chính giống như tập gym vậy, kiên nhẫn từng ngày thì mục tiêu mới sớm đạt được!',
            timestamp: Date.now(),
          };
          set((state) => ({
            messages: [...state.messages, fallbackMsg],
            isThinking: false,
          }));
        }
      },

      clearChatHistory: () => {
        set({
          messages: [
            {
              id: 'welcome-msg-' + Date.now(),
              sender: 'coach',
              text: 'Chào bồ! Minh là PT tài chính cá nhân của bồ đây. Hôm nay bồ có phân vân muốn mua món gì, hay cần lên giáo án siết ví thì cứ nhắn Minh nhé!',
              timestamp: Date.now(),
            },
          ],
        });
      },

      evaluatePurchase: ({ description, amount, goalName, goalTargetAmount, dailyBudget }) => {
        const text = description.toLowerCase().trim();

        // 1. Phân tích nguy cơ theo Trend
        let isTrendRisk = false;
        let trendScore = 3;
        for (const kw of TREND_KEYWORDS) {
          if (text.includes(kw)) {
            isTrendRisk = true;
            trendScore = 8;
            break;
          }
        }

        // 2. Phân tích Tiện ích thực tế
        let utilityScore = 6;
        for (const kw of UTILITY_KEYWORDS) {
          if (text.includes(kw)) {
            utilityScore = 9;
            trendScore = Math.max(1, trendScore - 4);
            isTrendRisk = false;
            break;
          }
        }

        // Nếu giá trị quá lớn so với ngân sách ngày
        if (amount > dailyBudget * 1.5) {
          trendScore = Math.min(10, trendScore + 2);
        }

        // 3. Tính toán tác động đến Mục tiêu cá nhân hóa
        const savingPerDay = Math.max(20000, dailyBudget * 0.3);
        const goalImpactDays = Math.ceil(amount / savingPerDay);
        const goalImpactPercent = goalTargetAmount > 0 ? (amount / goalTargetAmount) * 100 : 0;

        // 4. Quyết định hành động & Biểu cảm 3D của Minh
        let recommendedAction: 'SHOULD_BUY' | 'WAIT_BASKET_RECOMMENDED' = 'SHOULD_BUY';
        let expression: MinhExpression = 'SMILING';
        let practicalNote = '';
        let trendAlertNote = '';
        let coachQuote = '';

        if (isTrendRisk || amount > dailyBudget) {
          recommendedAction = 'WAIT_BASKET_RECOMMENDED';
          expression = amount > dailyBudget * 2 ? 'SHOCKED' : 'SKEPTICAL_TREND';

          practicalNote = 'Món này giá trị sử dụng lâu dài không cao, dễ bị lãng quên sau 1–2 tuần.';
          trendAlertNote = 'Đang có dấu hiệu mua theo trend mạng xã hội hoặc bốc đồng.';
          coachQuote = `Ê bồ! Khoản ${amount.toLocaleString('vi-VN')}đ này làm bồ lùi lại ${goalImpactDays} ngày so với mục tiêu "${goalName}" đó nha. Tui khuyên bồ bỏ vào Giỏ Chờ 24h đi, mai vẫn thèm thì hẵng mua!`;
        } else {
          recommendedAction = 'SHOULD_BUY';
          expression = 'SMILING';
          practicalNote = 'Món đồ có tiện ích thực tế, phục vụ nhu cầu thiết yếu hàng ngày.';
          trendAlertNote = 'Chi tiêu lành mạnh, nằm trong hạn mức cho phép.';
          coachQuote = `Món này thiết thực và nằm trong ngân sách hôm nay, bồ mua xong nhớ tận dụng thật tốt nha!`;
        }

        set({ expression, currentAdvice: coachQuote });

        return {
          utilityScore,
          trendScore,
          isTrendRisk,
          practicalNote,
          trendAlertNote,
          goalImpactDays,
          goalImpactPercent,
          recommendedAction,
          expression,
          coachQuote,
        };
      },

      getDailyGreeting: (remainingToday, dailyBudget, goalName) => {
        if (remainingToday <= 0) {
          return `Ví đang âm rồi bồ ơi! Hôm nay nhịn tiêu vặt để giữ sức cho mục tiêu "${goalName}" nhé.`;
        }
        if (remainingToday < dailyBudget * 0.3) {
          return `Sắp chạm đáy ngân sách hôm nay rồi nè. Đi nhẹ nói khẽ, đừng lướt sàn cam săn sale nha!`;
        }
        return `Hôm nay bồ còn ${remainingToday.toLocaleString('vi-VN')}đ xài thả ga. Tiết kiệm được thêm đồng nào là mục tiêu "${goalName}" về đích sớm đồng đó!`;
      },
    }),
    {
      name: 'vi_locket_minh_coach_store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        resistedImpulsesCount: state.resistedImpulsesCount,
        totalSavedFromTrend: state.totalSavedFromTrend,
        messages: state.messages.slice(-20),
      }),
    }
  )
);
