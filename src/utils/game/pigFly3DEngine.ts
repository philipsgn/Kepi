/**
 * PigFly 3D FPS Flight Simulation Engine
 * Động cơ mô phỏng bay góc nhìn thứ nhất, quy tắc mở khóa thế giới Mario-Style theo Streak
 * và cơ chế tính điểm Zero-Virtual-Points (Quyết định 112 & Quyết định 115)
 */

export interface FlightWorld {
  id: string;
  name: string;
  minStreak: number;
  skyTopColor: string;
  skyBottomColor: string;
  cloudColor: string;
  fogColor: string;
  fogDensity: number;
  description: string;
  badgeLabel: string;
  obstacleDifficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  ringColor: string;
}

/**
 * Danh sách 4 Thế giới bay 3D mở khóa theo Chuỗi Streak Kỷ Luật (Mario-Style World Progression)
 */
export const FLIGHT_WORLDS: FlightWorld[] = [
  {
    id: 'world-1',
    name: 'Đất Mây Khởi Động',
    minStreak: 1,
    skyTopColor: '#E0F2FE',
    skyBottomColor: '#D1F4E0',
    cloudColor: '#FFFFFF',
    fogColor: '#E0F2FE',
    fogDensity: 0.002,
    description: 'Bầu trời ban mai trong lành, gió xuôi nhẹ nhàng giúp chú heo làm quen buồng lái.',
    badgeLabel: 'Mây Bông Bình Yên',
    obstacleDifficulty: 'EASY',
    ringColor: '#F59E0B',
  },
  {
    id: 'world-2',
    name: 'Hoàng Hôn Nắng Thu',
    minStreak: 3,
    skyTopColor: '#FDE68A',
    skyBottomColor: '#E59844',
    cloudColor: '#FEF3C7',
    fogColor: '#FDE68A',
    fogDensity: 0.0025,
    description: 'Ánh chiều tà vàng hổ phách rực rỡ, gió giật nhẹ qua những tầng mây ấm áp.',
    badgeLabel: 'Nắng Thu Hà Nội',
    obstacleDifficulty: 'MEDIUM',
    ringColor: '#F43F5E',
  },
  {
    id: 'world-3',
    name: 'Bầu Trời Mint Ban Mai',
    minStreak: 7,
    skyTopColor: '#A7F3D0',
    skyBottomColor: '#059669',
    cloudColor: '#CCFBF1',
    fogColor: '#A7F3D0',
    fogDensity: 0.003,
    description: 'Thung lũng mây ngọc bích tươi mát, vệt cánh hoa đào bay lượn cùng chú heo.',
    badgeLabel: 'Cốm Non Tinh Khôi',
    obstacleDifficulty: 'HARD',
    ringColor: '#10B981',
  },
  {
    id: 'world-4',
    name: 'Đêm Sao Cực Quang',
    minStreak: 14,
    skyTopColor: '#0F172A',
    skyBottomColor: '#312E81',
    cloudColor: '#C084FC',
    fogColor: '#1E1B4B',
    fogDensity: 0.0035,
    description: 'Dải cực quang huyền ảo giữa bầu trời đêm sâu thẳm, thử thách phi công giữ ví thượng thừa.',
    badgeLabel: 'Vũ Trụ Tự Do',
    obstacleDifficulty: 'EXPERT',
    ringColor: '#EC4899',
  },
];

/**
 * Lọc danh sách thế giới đã mở khóa và còn khóa theo chuỗi ngày Streak thực tế
 */
export function getAvailableWorlds(streakDays: number) {
  const safeStreak = Math.max(0, streakDays);
  const available = FLIGHT_WORLDS.filter((w) => safeStreak >= w.minStreak);
  const locked = FLIGHT_WORLDS.filter((w) => safeStreak < w.minStreak);
  const currentBest = available.length > 0 ? available[available.length - 1] : FLIGHT_WORLDS[0];

  return {
    available,
    locked,
    currentBest,
  };
}

/**
 * Tính toán kết quả chuyến bay 3D
 */
export interface FlightSummary {
  ringsPassed: number;
  stormHits: number;
  flightDurationSec: number;
  score: number;
  rankTitle: string;
  isPerfectRun: boolean;
}

export function calculateFlightScore(
  ringsPassed: number,
  stormHits: number,
  flightDurationSec: number,
  worldId: string
): FlightSummary {
  const world = FLIGHT_WORLDS.find((w) => w.id === worldId) || FLIGHT_WORLDS[0];

  // Hệ số độ khó
  const difficultyMultiplier =
    world.obstacleDifficulty === 'EXPERT'
      ? 2.0
      : world.obstacleDifficulty === 'HARD'
      ? 1.5
      : world.obstacleDifficulty === 'MEDIUM'
      ? 1.2
      : 1.0;

  const baseRingPoints = ringsPassed * 100;
  const timeBonus = Math.floor(flightDurationSec * 5);
  const penalty = stormHits * 40;

  const rawScore = Math.max(0, Math.round((baseRingPoints + timeBonus - penalty) * difficultyMultiplier));
  const isPerfectRun = ringsPassed >= 10 && stormHits === 0;

  let rankTitle = 'Tập Sự Bay';
  if (ringsPassed >= 20 && stormHits <= 1) {
    rankTitle = 'Phi Công Giữ Ví Thượng Thừa 🌟';
  } else if (ringsPassed >= 10) {
    rankTitle = 'Heo Bay Cừ Khôi 🚀';
  } else if (ringsPassed >= 5) {
    rankTitle = 'Phi Công Triển Vọng ✈️';
  }

  return {
    ringsPassed,
    stormHits,
    flightDurationSec,
    score: rawScore,
    rankTitle,
    isPerfectRun,
  };
}

/**
 * Tạo nội dung tin nhắn chia sẻ thành tích bay vào cuộc trò chuyện Squad Room
 */
export function formatFlightShareMessage(
  userName: string,
  worldName: string,
  rings: number,
  score: number
): string {
  return `🚀 [PigFly 3D FPS] ${userName} vừa hoàn thành chuyến bay tại "${worldName}": Xuyên qua ${rings} Vòng Tiết Kiệm, đạt ${score.toLocaleString('vi-VN')} điểm! Bồ nào vào đọ cánh không? 🐷✨`;
}
