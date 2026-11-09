/**
 * Gamification Rules Engine (Inspired by ActiDoo/gengine patterns)
 * Động cơ quy tắc game hóa thuần túy (Pure Functions) cho PigFly
 */

export type MascotMood = 'FLYING_HIGH' | 'CHILL' | 'PANIC' | 'STARVING';

export interface GamificationContextVariables {
  todaySpent: number;
  todayBudget: number;
  streakDays: number;
  photosCount: number;
  monthlySavedRatio: number; // 0.0 -> 1.0 (ví dụ 0.25 là 25%)
  hasLoggedToday: boolean;
  currentFep: number;
  unlockedAchievements: string[];
}

export interface AchievementTier {
  id: string;
  name: string;
  level: 'BRONZE' | 'SILVER' | 'GOLD';
  description: string;
  rewardFep: number;
  requiredValue: number;
}

export interface GamificationEvaluationResult {
  earnedFep: number;
  newTier: number; // 1..5
  tierName: string;
  newMood: MascotMood;
  newAchievements: AchievementTier[];
  streakMultiplier: number;
}

// 5 Tầng Mây Tài Chính
export const CLOUD_TIERS = [
  { level: 1, name: 'Mây Non Lơ Lửng', minStreak: 0, description: 'Đập đôi cánh thiên thần nhỏ' },
  { level: 2, name: 'Mây Xanh Tích Lũy', minStreak: 7, description: 'Đeo kính phi công vintage' },
  { level: 3, name: 'Mây Vàng Kỷ Luật', minStreak: 21, description: 'Đeo balo phản lực pastel' },
  { level: 4, name: 'Mây Cầu Vồng Thịnh Vượng', minStreak: 45, description: 'Có hào quang & cánh thiên thần' },
  { level: 5, name: 'Tự Do Tài Chính', minStreak: 90, description: 'Vương miện & cánh thần kim cương' },
];

// Danh mục thành tựu đa cấp độ (Multi-Level Achievements)
export const ACHIEVEMENTS_CATALOG: AchievementTier[] = [
  // Nhóm Visual Logger (Chụp ảnh ghi sổ)
  { id: 'logger_bronze', name: 'Thợ Săn Khoảnh Khắc I', level: 'BRONZE', description: 'Chụp 5 ảnh chi tiêu', rewardFep: 50, requiredValue: 5 },
  { id: 'logger_silver', name: 'Thợ Săn Khoảnh Khắc II', level: 'SILVER', description: 'Chụp 25 ảnh chi tiêu', rewardFep: 150, requiredValue: 25 },
  { id: 'logger_gold', name: 'Thợ Săn Khoảnh Khắc III', level: 'GOLD', description: 'Chụp 100 ảnh chi tiêu', rewardFep: 500, requiredValue: 100 },

  // Nhóm Kỷ Luật Chi Tiêu (Streak)
  { id: 'discipline_bronze', name: 'Chiến Binh Kỷ Luật I', level: 'BRONZE', description: 'Đạt chuỗi 3 ngày trong hạn mức', rewardFep: 100, requiredValue: 3 },
  { id: 'discipline_silver', name: 'Chiến Binh Kỷ Luật II', level: 'SILVER', description: 'Đạt chuỗi 7 ngày trong hạn mức', rewardFep: 250, requiredValue: 7 },
  { id: 'discipline_gold', name: 'Chiến Binh Kỷ Luật III', level: 'GOLD', description: 'Đạt chuỗi 30 ngày trong hạn mức', rewardFep: 1000, requiredValue: 30 },
];

/**
 * Tính toán hệ số nhân chuỗi Streak
 */
export function calculateStreakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return 2.0;
  if (streakDays >= 7) return 1.5;
  if (streakDays >= 3) return 1.2;
  return 1.0;
}

/**
 * Xác định tầng mây dựa trên chuỗi Streak và độ kỷ luật
 */
export function determineCloudTier(streakDays: number): { level: number; name: string } {
  for (let i = CLOUD_TIERS.length - 1; i >= 0; i--) {
    if (streakDays >= CLOUD_TIERS[i].minStreak) {
      return { level: CLOUD_TIERS[i].level, name: CLOUD_TIERS[i].name };
    }
  }
  return { level: 1, name: 'Mây Non Lơ Lửng' };
}

/**
 * Xác định trạng thái cảm xúc của chú heo PigFly (Mascot Mood State Machine)
 */
export function determineMascotMood(ctx: GamificationContextVariables): MascotMood {
  // Ưu tiên 1: Tiêu lố hạn mức ngày -> PANIC
  if (ctx.todayBudget > 0 && ctx.todaySpent > ctx.todayBudget) {
    return 'PANIC';
  }

  // Ưu tiên 2: Chưa ghi chép gì hôm nay -> STARVING
  if (!ctx.hasLoggedToday) {
    return 'STARVING';
  }

  // Ưu tiên 3: Chuỗi streak cao hoặc tỷ lệ tiết kiệm tốt -> FLYING_HIGH
  if (ctx.streakDays >= 3 || ctx.monthlySavedRatio >= 0.2) {
    return 'FLYING_HIGH';
  }

  // Mặc định: Bình ổn thư thái -> CHILL
  return 'CHILL';
}

/**
 * Động cơ đánh giá toàn diện Rules Engine (Evaluate Gamification Rules)
 */
export function evaluateGamificationRules(
  ctx: GamificationContextVariables,
  triggerEvent: 'LOG_TRANSACTION' | 'DAILY_ROLLOVER' | 'MONOPOLY_MOVE' | 'MANUAL_CHECK'
): GamificationEvaluationResult {
  let earnedFep = 0;
  const streakMultiplier = calculateStreakMultiplier(ctx.streakDays);

  if (triggerEvent === 'LOG_TRANSACTION') {
    // +30 FEP cho ghi chép có ảnh, nhân hệ số streak
    earnedFep += Math.round(30 * streakMultiplier);
  } else if (triggerEvent === 'DAILY_ROLLOVER') {
    // Nếu trong ngày không tiêu lố hạn mức: thưởng lớn +100 FEP * multiplier
    if (ctx.todayBudget > 0 && ctx.todaySpent <= ctx.todayBudget) {
      earnedFep += Math.round(100 * streakMultiplier);
    }
  }

  const { level: newTier, name: tierName } = determineCloudTier(ctx.streakDays);
  const newMood = determineMascotMood(ctx);

  // Đánh giá mở khóa thành tựu mới (Multi-Level Achievements)
  const newlyUnlocked: AchievementTier[] = [];
  const currentUnlockedSet = new Set(ctx.unlockedAchievements);

  for (const ach of ACHIEVEMENTS_CATALOG) {
    if (!currentUnlockedSet.has(ach.id)) {
      let isEligible = false;
      if (ach.id.startsWith('logger_')) {
        isEligible = ctx.photosCount >= ach.requiredValue;
      } else if (ach.id.startsWith('discipline_')) {
        isEligible = ctx.streakDays >= ach.requiredValue;
      }

      if (isEligible) {
        newlyUnlocked.push(ach);
        earnedFep += ach.rewardFep;
      }
    }
  }

  return {
    earnedFep,
    newTier,
    tierName,
    newMood,
    newAchievements: newlyUnlocked,
    streakMultiplier,
  };
}
