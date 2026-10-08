import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MicroLesson {
  id: string;
  title: string;
  tagline: string;
  category: 'fomo' | 'saving' | 'habit' | 'goal';
  readTime: string; // e.g. "60 giây"
  content: string[]; // Các ý chính dạng bullet card
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  expReward: number;
  isCompleted: boolean;
}

interface LessonState {
  lessons: MicroLesson[];
  totalExp: number;
  currentLessonId: string | null;

  // Actions
  completeLesson: (lessonId: string) => void;
  setCurrentLesson: (lessonId: string | null) => void;
  getFinancialTier: () => {
    tierName: string;
    tierLevel: number;
    badgeEmoji: string;
    nextTierExp: number;
  };
}

const DEFAULT_LESSONS: MicroLesson[] = [
  {
    id: 'lesson-1',
    title: 'Cai Nghiện Trà Sữa Không Quạu',
    tagline: 'Tiết kiệm 500k/tháng mà tâm trạng vẫn phơi phới',
    category: 'saving',
    readTime: '60 giây',
    content: [
      'Một ly trà sữa 55k nhìn nhỏ, nhưng 1 tháng 15 ly là bạn đã "uống trôi" 825.000đ.',
      'Chiến thuật giảm liều: Thay vì uống mỗi ngày, hãy tự quy định chỉ uống vào chiều thứ Sáu như một phần thưởng.',
      'Mỗi lần thèm đột xuất: Uống ngay 1 ly nước lọc mát lạnh và tự chuyển 50k vào mục tiêu tiết kiệm.',
    ],
    quiz: {
      question: 'Khi cơn thèm trà sữa bất chợt ập đến, cách xử lý thông minh nhất là gì?',
      options: [
        'Đặt ngay 1 ly full topping size L cho đỡ thèm',
        'Uống 1 ly nước lọc mát lạnh và tự chuyển 50k vào quỹ tiết kiệm',
        'Nhịn đói luôn cả bữa tối để bù lại',
      ],
      correctIndex: 1,
      explanation: 'Chính xác! Nước lọc giúp xoa dịu cảm giác khát giả tạo và việc tự chuyển tiền tạo cảm giác chiến thắng cám dỗ tức thì.',
    },
    expReward: 50,
    isCompleted: false,
  },
  {
    id: 'lesson-2',
    title: 'Quy Tắc 24 Giờ: Phá Đảo Cơn Nghiện Săn Sale',
    tagline: 'Bí kíp không bao giờ hối hận vì những đơn hàng nửa đêm',
    category: 'fomo',
    readTime: '60 giây',
    content: [
      'Các sàn thương mại điện tử dùng đồng hồ đếm ngược để tạo cảm giác khan hiếm giả tạo.',
      'Quy tắc 24h: Thêm món đồ vào Giỏ Chờ của Ví Locket và đi ngủ một giấc thật ngon.',
      '80% cơn sốt mua sắm sẽ hoàn toàn biến mất sau 24 giờ khi não bộ hạ nhiệt dopamine.',
    ],
    quiz: {
      question: 'Tại sao bạn nên đưa món đồ vào Giỏ Chờ thay vì bấm mua ngay trong đêm sale?',
      options: [
        'Để ngày mai món đồ tăng giá gấp đôi',
        'Để dopamine hạ nhiệt và kiểm tra xem mình có thực sự cần nó không',
        'Để shipper giao ban ngày cho đỡ sợ',
      ],
      correctIndex: 1,
      explanation: 'Xuất sắc! Sau 24 giờ, cảm xúc bốc đồng qua đi, bạn sẽ ngạc nhiên thấy mình thực ra chẳng cần món đồ đó đến thế.',
    },
    expReward: 50,
    isCompleted: false,
  },
  {
    id: 'lesson-3',
    title: 'Phân Biệt Cần vs Muốn: 3 Câu Hỏi Trước Khi Cà Thẻ',
    tagline: 'Thước đo của người tiêu dùng thông thái',
    category: 'habit',
    readTime: '60 giây',
    content: [
      'Câu 1: "Nếu không mua hôm nay, ngày mai cuộc sống mình có bị đình trệ không?"',
      'Câu 2: "Món này có dùng được ít nhất 30 lần trong năm tới không?" (Quy tắc 30 Wears).',
      'Câu 3: "Mình muốn món này vì tiện ích hay chỉ muốn chụp ảnh khoe lên Story?"',
    ],
    quiz: {
      question: 'Theo quy tắc 30 Wears, bạn chỉ nên chi tiền cho một món quần áo/phụ kiện khi nào?',
      options: [
        'Khi nó đang giảm giá 70%',
        'Khi bạn tin chắc mình sẽ mặc/sử dụng nó ít nhất 30 lần',
        'Khi thấy người nổi tiếng vừa mặc trên TikTok',
      ],
      correctIndex: 1,
      explanation: 'Tuyệt vời! Nếu chỉ mặc 1-2 lần rồi bỏ xó thì dù có sale 90% món đồ đó vẫn là một khoản lãng phí.',
    },
    expReward: 50,
    isCompleted: false,
  },
  {
    id: 'lesson-4',
    title: 'Chiến Thuật Tích Lũy Mua Laptop Không Vay Mượn',
    tagline: 'Biến ước mơ lớn thành các bước đi nhỏ mỗi ngày',
    category: 'goal',
    readTime: '60 giây',
    content: [
      'Chia nhỏ mục tiêu lớn: Một chiếc laptop 20 triệu = 110.000đ/ngày trong vòng 6 tháng.',
      'Mỗi lần bạn từ chối 1 bữa nhậu 300k hay 1 món đồ theo trend, bạn đã đẩy chiếc laptop về gần mình 3 ngày.',
      'Sử dụng tài khoản tiết kiệm tách biệt để không vô tình tiêu lẹm vào.',
    ],
    quiz: {
      question: 'Bí kíp giúp đạt được các mục tiêu tài chính lớn mà không cảm thấy kiệt sức là gì?',
      options: [
        'Nhịn ăn nhịn uống tuyệt đối trong 2 tháng',
        'Chia nhỏ mục tiêu thành số tiền tiết kiệm khả thi mỗi ngày và kiên trì',
        'Vay tín dụng mua luôn rồi cày trả nợ sau',
      ],
      correctIndex: 1,
      explanation: 'Chuẩn xác! Chia nhỏ con số lớn giúp não bộ cảm thấy dễ dàng và tạo thói quen kỷ luật tích lũy mỗi ngày.',
    },
    expReward: 50,
    isCompleted: false,
  },
];

export const useLessonStore = create<LessonState>()(
  persist(
    (set, get) => ({
      lessons: DEFAULT_LESSONS,
      totalExp: 0,
      currentLessonId: null,

      completeLesson: (lessonId) => {
        const { lessons, totalExp } = get();
        const lesson = lessons.find((l) => l.id === lessonId);
        if (lesson && !lesson.isCompleted) {
          const updated = lessons.map((l) =>
            l.id === lessonId ? { ...l, isCompleted: true } : l
          );
          set({
            lessons: updated,
            totalExp: totalExp + lesson.expReward,
          });
        }
      },

      setCurrentLesson: (lessonId) => set({ currentLessonId: lessonId }),

      getFinancialTier: () => {
        const { totalExp } = get();
        if (totalExp >= 150) {
          return {
            tierName: 'Bậc Thầy Ví Locket',
            tierLevel: 3,
            badgeEmoji: '👑',
            nextTierExp: 300,
          };
        }
        if (totalExp >= 50) {
          return {
            tierName: 'Chiến Thần Tỉnh Táo',
            tierLevel: 2,
            badgeEmoji: '🛡️',
            nextTierExp: 150,
          };
        }
        return {
          tierName: 'Tân Thủ Khám Phá',
          tierLevel: 1,
          badgeEmoji: '🌱',
          nextTierExp: 50,
        };
      },
    }),
    {
      name: 'vi_locket_lesson_store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
