import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  MascotMood,
  GamificationContextVariables,
  evaluateGamificationRules,
  CLOUD_TIERS,
  AchievementTier,
} from '../utils/gamification/rulesEngine';

const STORAGE_KEY_GAMIFICATION = '@pigfly_gamification_v4';

export interface SkinItem {
  id: string;
  name: string;
  costFep: number;
  icon: string;
  description: string;
}

export const SKINS_CATALOG: SkinItem[] = [
  { id: 'skin_default', name: 'Heo Trắng Tinh Anh', costFep: 0, icon: '🐷', description: 'Trang phục nguyên bản đáng yêu' },
  { id: 'skin_beret', name: 'Mũ Beret Phố Cổ', costFep: 300, icon: '🎨', description: 'Nghệ sĩ Hà Nội Thu Đông' },
  { id: 'skin_aviator', name: 'Kính Phi Công Vintage', costFep: 600, icon: '✈️', description: 'Vỗ cánh xuyên qua các tầng mây' },
  { id: 'skin_jetpack', name: 'Balo Phản Lực', costFep: 1000, icon: '🚀', description: 'Bay bổng siêu tốc độ' },
  { id: 'skin_wizard', name: 'Áo Choàng Pháp Sư', costFep: 2500, icon: '🧙‍♂️', description: 'Biến hóa số dư bền vững' },
];

interface GamificationState {
  fepPoints: number;
  streakDays: number;
  cloudTier: number;
  tierName: string;
  mascotMood: MascotMood;
  equippedSkinId: string;
  unlockedSkinIds: string[];
  unlockedAchievements: string[];
  diceRollsLeft: number;
  monopolyPosition: number;
  gameTickets: number;
  pigFood: number;
  pigHunger: number;
  fishHunger: number;
  flowerWater: number;
  savedBabies: number;
  flyBestScore: number;
  shooterMaxWave: number;
  crossRoadStars: number;
  crossRoadMaxLevel: number;
  isLoading: boolean;

  // Actions
  loadGamificationState: () => Promise<void>;
  addFep: (amount: number) => Promise<void>;
  setStreakDays: (days: number) => void;
  addGameTickets: (count: number) => void;
  useGameTicket: () => boolean;
  buyTicketWithFood: () => boolean;
  addPigFood: (amount: number) => void;
  feedPig: () => boolean;
  addChoreProgress: (delta: { pig?: number; fish?: number; rose?: number }) => void;
  updateGameStats: (stats: {
    flyBestScore?: number;
    shooterMaxWave?: number;
    savedBabies?: number;
    crossRoadStars?: number;
    crossRoadMaxLevel?: number;
    pigHunger?: number;
    fishHunger?: number;
    flowerWater?: number;
  }) => void;
  evaluateRules: (
    ctx: Omit<GamificationContextVariables, 'currentFep' | 'unlockedAchievements'>,
    triggerEvent: 'LOG_TRANSACTION' | 'DAILY_ROLLOVER' | 'MONOPOLY_MOVE' | 'MANUAL_CHECK'
  ) => Promise<{ earnedFep: number; newAchievements: AchievementTier[] }>;
  equipSkin: (skinId: string) => Promise<boolean>;
  unlockSkin: (skinId: string) => Promise<boolean>;
  useDiceRoll: () => boolean;
  setMonopolyPosition: (pos: number) => Promise<void>;
  resetDailyDiceRolls: () => void;
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  fepPoints: 100, // Thưởng khởi đầu
  streakDays: 1,
  cloudTier: 1,
  tierName: 'Mây Non Lơ Lửng',
  mascotMood: 'CHILL',
  equippedSkinId: 'skin_default',
  unlockedSkinIds: ['skin_default'],
  unlockedAchievements: [],
  diceRollsLeft: 2, // 2 lượt miễn phí mỗi ngày
  monopolyPosition: 0,
  gameTickets: 3, // 3 vé chơi mỗi ngày
  pigFood: 10, // 10 đơn vị cám cho heo
  pigHunger: 75, // Độ no heo 75%
  fishHunger: 72, // Độ no cá ao 72%
  flowerWater: 68, // Độ tươi hoa hồng 68%
  savedBabies: 0,
  flyBestScore: 0,
  shooterMaxWave: 1,
  crossRoadStars: 0,
  crossRoadMaxLevel: 1,
  isLoading: false,

  loadGamificationState: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY_GAMIFICATION);
      if (raw) {
        const parsed = JSON.parse(raw);
        set({
          fepPoints: parsed.fepPoints ?? 100,
          streakDays: parsed.streakDays ?? 1,
          cloudTier: parsed.cloudTier ?? 1,
          tierName: parsed.tierName ?? 'Mây Non Lơ Lửng',
          mascotMood: parsed.mascotMood ?? 'CHILL',
          equippedSkinId: parsed.equippedSkinId ?? 'skin_default',
          unlockedSkinIds: parsed.unlockedSkinIds ?? ['skin_default'],
          unlockedAchievements: parsed.unlockedAchievements ?? [],
          diceRollsLeft: parsed.diceRollsLeft ?? 2,
          monopolyPosition: parsed.monopolyPosition ?? 0,
          gameTickets: parsed.gameTickets ?? 3,
          pigFood: parsed.pigFood ?? 10,
          pigHunger: parsed.pigHunger ?? 75,
          fishHunger: parsed.fishHunger ?? 72,
          flowerWater: parsed.flowerWater ?? 68,
          savedBabies: parsed.savedBabies ?? 0,
          flyBestScore: parsed.flyBestScore ?? 0,
          shooterMaxWave: parsed.shooterMaxWave ?? 1,
          crossRoadStars: parsed.crossRoadStars ?? 0,
          crossRoadMaxLevel: parsed.crossRoadMaxLevel ?? 1,
        });
      }
    } catch (e) {
      console.warn('[GamificationStore] Failed to load:', e);
    }
  },

  addGameTickets: (count: number) => {
    const next = Math.max(0, get().gameTickets + count);
    set({ gameTickets: next });
    AsyncStorage.setItem(
      STORAGE_KEY_GAMIFICATION,
      JSON.stringify({ ...get(), gameTickets: next })
    ).catch(() => {});
  },

  useGameTicket: () => {
    const current = get().gameTickets;
    if (current <= 0) return false;
    const next = current - 1;
    set({ gameTickets: next });
    AsyncStorage.setItem(
      STORAGE_KEY_GAMIFICATION,
      JSON.stringify({ ...get(), gameTickets: next })
    ).catch(() => {});
    return true;
  },

  buyTicketWithFood: () => {
    const { pigFood, gameTickets } = get();
    if (pigFood < 10) return false;
    const nextFood = pigFood - 10;
    const nextTix = gameTickets + 1;
    set({ pigFood: nextFood, gameTickets: nextTix });
    AsyncStorage.setItem(
      STORAGE_KEY_GAMIFICATION,
      JSON.stringify({ ...get(), pigFood: nextFood, gameTickets: nextTix })
    ).catch(() => {});
    return true;
  },

  addPigFood: (amount: number) => {
    const next = Math.max(0, get().pigFood + amount);
    set({ pigFood: next });
    AsyncStorage.setItem(
      STORAGE_KEY_GAMIFICATION,
      JSON.stringify({ ...get(), pigFood: next })
    ).catch(() => {});
  },

  feedPig: () => {
    const { pigFood, pigHunger } = get();
    if (pigFood <= 0) return false;
    const nextFood = pigFood - 1;
    const nextHunger = Math.min(100, pigHunger + 25);
    set({ pigFood: nextFood, pigHunger: nextHunger });
    AsyncStorage.setItem(
      STORAGE_KEY_GAMIFICATION,
      JSON.stringify({ ...get(), pigFood: nextFood, pigHunger: nextHunger })
    ).catch(() => {});
    return true;
  },

  addChoreProgress: (delta) => {
    const cur = get();
    const nextPig = Math.min(100, Math.max(0, cur.pigHunger + (delta.pig ?? 0)));
    const nextFish = Math.min(100, Math.max(0, cur.fishHunger + (delta.fish ?? 0)));
    const nextRose = Math.min(100, Math.max(0, cur.flowerWater + (delta.rose ?? 0)));
    set({ pigHunger: nextPig, fishHunger: nextFish, flowerWater: nextRose });
    AsyncStorage.setItem(
      STORAGE_KEY_GAMIFICATION,
      JSON.stringify({ ...get(), pigHunger: nextPig, fishHunger: nextFish, flowerWater: nextRose })
    ).catch(() => {});
  },

  updateGameStats: (stats) => {
    const current = get();
    const updated = {
      flyBestScore: Math.max(current.flyBestScore, stats.flyBestScore ?? 0),
      shooterMaxWave: Math.max(current.shooterMaxWave, stats.shooterMaxWave ?? 0),
      savedBabies: stats.savedBabies !== undefined ? stats.savedBabies : current.savedBabies,
      crossRoadStars: Math.max(current.crossRoadStars, stats.crossRoadStars ?? 0),
      crossRoadMaxLevel: Math.max(current.crossRoadMaxLevel, stats.crossRoadMaxLevel ?? 1),
      pigHunger: stats.pigHunger !== undefined ? Math.min(100, Math.max(0, stats.pigHunger)) : current.pigHunger,
      fishHunger: stats.fishHunger !== undefined ? Math.min(100, Math.max(0, stats.fishHunger)) : current.fishHunger,
      flowerWater: stats.flowerWater !== undefined ? Math.min(100, Math.max(0, stats.flowerWater)) : current.flowerWater,
    };
    set(updated);
    AsyncStorage.setItem(
      STORAGE_KEY_GAMIFICATION,
      JSON.stringify({ ...get(), ...updated })
    ).catch(() => {});
  },

  addFep: async (amount: number) => {
    if (amount <= 0) return;
    const newFep = get().fepPoints + amount;
    set({ fepPoints: newFep });
    try {
      const state = get();
      await AsyncStorage.setItem(
        STORAGE_KEY_GAMIFICATION,
        JSON.stringify({
          fepPoints: state.fepPoints,
          streakDays: state.streakDays,
          cloudTier: state.cloudTier,
          tierName: state.tierName,
          mascotMood: state.mascotMood,
          equippedSkinId: state.equippedSkinId,
          unlockedSkinIds: state.unlockedSkinIds,
          unlockedAchievements: state.unlockedAchievements,
          diceRollsLeft: state.diceRollsLeft,
          monopolyPosition: state.monopolyPosition,
        })
      );
    } catch (e) {
      console.warn('[GamificationStore] Failed to save FEP:', e);
    }
  },

  setStreakDays: (days: number) => {
    const safeDays = Math.max(0, days);
    set({ streakDays: safeDays });
  },

  evaluateRules: async (ctxParams, triggerEvent) => {
    const state = get();
    const fullCtx: GamificationContextVariables = {
      ...ctxParams,
      currentFep: state.fepPoints,
      unlockedAchievements: state.unlockedAchievements,
    };

    const result = evaluateGamificationRules(fullCtx, triggerEvent);

    const newAchievementsIds = result.newAchievements.map((a) => a.id);
    const updatedAchievements = [...state.unlockedAchievements, ...newAchievementsIds];
    const updatedFep = state.fepPoints + result.earnedFep;

    set({
      fepPoints: updatedFep,
      cloudTier: result.newTier,
      tierName: result.tierName,
      mascotMood: result.newMood,
      unlockedAchievements: updatedAchievements,
    });

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY_GAMIFICATION,
        JSON.stringify({
          ...get(),
        })
      );
    } catch (e) {
      console.warn('[GamificationStore] Failed to persist evaluation:', e);
    }

    return {
      earnedFep: result.earnedFep,
      newAchievements: result.newAchievements,
    };
  },

  equipSkin: async (skinId: string) => {
    const { unlockedSkinIds } = get();
    if (unlockedSkinIds.includes(skinId)) {
      set({ equippedSkinId: skinId });
      await AsyncStorage.setItem(STORAGE_KEY_GAMIFICATION, JSON.stringify(get())).catch(() => {});
      return true;
    }
    return false;
  },

  unlockSkin: async (skinId: string) => {
    const { fepPoints, unlockedSkinIds } = get();
    if (unlockedSkinIds.includes(skinId)) return true;

    const item = SKINS_CATALOG.find((s) => s.id === skinId);
    if (!item) return false;

    if (fepPoints >= item.costFep) {
      const newFep = fepPoints - item.costFep;
      const updatedSkins = [...unlockedSkinIds, skinId];
      set({
        fepPoints: newFep,
        unlockedSkinIds: updatedSkins,
        equippedSkinId: skinId,
      });
      await AsyncStorage.setItem(STORAGE_KEY_GAMIFICATION, JSON.stringify(get())).catch(() => {});
      return true;
    }
    return false;
  },

  useDiceRoll: () => {
    const { diceRollsLeft } = get();
    if (diceRollsLeft > 0) {
      set({ diceRollsLeft: diceRollsLeft - 1 });
      AsyncStorage.setItem(STORAGE_KEY_GAMIFICATION, JSON.stringify(get())).catch(() => {});
      return true;
    }
    return false;
  },

  setMonopolyPosition: async (pos: number) => {
    const safePos = ((pos % 16) + 16) % 16;
    set({ monopolyPosition: safePos });
    await AsyncStorage.setItem(STORAGE_KEY_GAMIFICATION, JSON.stringify(get())).catch(() => {});
  },

  resetDailyDiceRolls: () => {
    set({ diceRollsLeft: 2 });
    AsyncStorage.setItem(STORAGE_KEY_GAMIFICATION, JSON.stringify(get())).catch(() => {});
  },
}));
