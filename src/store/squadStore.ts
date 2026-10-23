import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../types/database';

export interface SquadMember {
  id: string;
  name: string;
  avatarPose: 'welcome' | 'camera' | 'card' | 'wise' | 'happy';
  streakDays: number;
  hasFedPigToday: boolean;
  isOwner?: boolean;
}

export interface SquadFeedItem {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  category: string;
  description: string | null;
  photoUri: string | null;
  createdAt: string;
  reactions: { [key: string]: number };
}

export interface SquadMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export interface SquadRoom {
  id: string;
  name: string;
  code: string;
  createdAt: string;
}

interface SquadState {
  squad: SquadRoom | null;
  members: SquadMember[];
  feedItems: SquadFeedItem[];
  messages: SquadMessage[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadSquadFromStorage: () => Promise<void>;
  createSquad: (name: string, userName: string) => Promise<boolean>;
  joinSquad: (code: string, userName: string) => Promise<boolean>;
  leaveSquad: () => Promise<void>;
  sendSquadMessage: (text: string, userName: string) => void;
  sendNudge: (toMemberId: string, type: 'FEED_PIG' | 'CHEER', fromName: string) => string;
  reactToFeedItem: (itemId: string, emoji: string) => void;
  syncTransactionsToFeed: (transactions: Transaction[], userName: string) => void;
}

const STORAGE_KEY_SQUAD = '@pigfly_squad_room_v1';
const LEGACY_STORAGE_KEY_SQUAD = '@pigpo_squad_room_v1';

// Dữ liệu mẫu ban đầu cho các bạn trong nhóm nuôi heo
const SAMPLE_FRIENDS: SquadMember[] = [
  {
    id: 'friend-be-bo',
    name: 'Bé Bơ',
    avatarPose: 'happy',
    streakDays: 8,
    hasFedPigToday: true,
  },
  {
    id: 'friend-heo-map',
    name: 'Heo Mập',
    avatarPose: 'card',
    streakDays: 5,
    hasFedPigToday: false,
  },
];

const INITIAL_FEED_ITEMS: SquadFeedItem[] = [
  {
    id: 'feed-sample-1',
    userId: 'friend-be-bo',
    userName: 'Bé Bơ',
    amount: 35000,
    category: 'Ăn uống',
    description: 'Bánh mì chảo thơm nức mũi',
    photoUri: null,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    reactions: { '❤️': 3, '🎉': 2 },
  },
  {
    id: 'feed-sample-2',
    userId: 'friend-heo-map',
    userName: 'Heo Mập',
    amount: 45000,
    category: 'Cà phê',
    description: 'Bạc xỉu đá ít đường nuôi heo',
    photoUri: null,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    reactions: { '👏': 4 },
  },
];

export const useSquadStore = create<SquadState>((set, get) => ({
  squad: null,
  members: [],
  feedItems: [],
  messages: [],
  isLoading: false,
  error: null,

  loadSquadFromStorage: async () => {
    try {
      let raw = await AsyncStorage.getItem(STORAGE_KEY_SQUAD);
      if (!raw) {
        raw = await AsyncStorage.getItem(LEGACY_STORAGE_KEY_SQUAD);
        if (raw) {
          // Tự động nâng cấp sang khóa mới
          await AsyncStorage.setItem(STORAGE_KEY_SQUAD, raw).catch(() => {});
        }
      }
      if (raw) {
        const parsed = JSON.parse(raw);
        set({
          squad: parsed.squad || null,
          members: parsed.members || [],
          feedItems: parsed.feedItems || INITIAL_FEED_ITEMS,
          messages: parsed.messages || [],
        });
      }
    } catch (e) {
      console.warn('[SquadStore] Failed to load from storage:', e);
    }
  },

  createSquad: async (name: string, userName: string) => {
    set({ isLoading: true, error: null });
    try {
      // Sinh mã 6 ký tự ngẫu nhiên (ví dụ PIG925)
      const num = Math.floor(Math.random() * 899) + 100;
      const code = `PIG${num}`;

      const newSquad: SquadRoom = {
        id: `squad-${Date.now()}`,
        name: name.trim() || 'Squad Nuôi Heo PigFly',
        code,
        createdAt: new Date().toISOString(),
      };

      const myMember: SquadMember = {
        id: 'my-user',
        name: userName.trim() || 'Bạn Mới',
        avatarPose: 'welcome',
        streakDays: 1,
        hasFedPigToday: true,
        isOwner: true,
      };

      const members = [myMember, ...SAMPLE_FRIENDS];

      const welcomeMsg: SquadMessage = {
        id: `msg-${Date.now()}`,
        senderId: 'system',
        senderName: 'PigFly Bot',
        text: `Chào mừng ${myMember.name} đã lập hội "${newSquad.name}"! Mã mời kết nối: ${newSquad.code}`,
        createdAt: new Date().toISOString(),
      };

      set({
        squad: newSquad,
        members,
        feedItems: INITIAL_FEED_ITEMS,
        messages: [welcomeMsg],
        isLoading: false,
      });

      await AsyncStorage.setItem(
        STORAGE_KEY_SQUAD,
        JSON.stringify({
          squad: newSquad,
          members,
          feedItems: INITIAL_FEED_ITEMS,
          messages: [welcomeMsg],
        })
      );

      return true;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Không thể tạo phòng' });
      return false;
    }
  },

  joinSquad: async (code: string, userName: string) => {
    set({ isLoading: true, error: null });
    try {
      const cleanCode = code.trim().toUpperCase();
      if (cleanCode.length < 4) {
        set({ isLoading: false, error: 'Mã phòng không hợp lệ' });
        return false;
      }

      const joinedSquad: SquadRoom = {
        id: `squad-joined-${cleanCode}`,
        name: 'Hội Nuôi Heo Bạn Thân',
        code: cleanCode,
        createdAt: new Date().toISOString(),
      };

      const myMember: SquadMember = {
        id: 'my-user',
        name: userName.trim() || 'Bạn Mới',
        avatarPose: 'welcome',
        streakDays: 1,
        hasFedPigToday: true,
      };

      const members = [myMember, ...SAMPLE_FRIENDS];

      const welcomeMsg: SquadMessage = {
        id: `msg-${Date.now()}`,
        senderId: 'system',
        senderName: 'PigFly Bot',
        text: `${myMember.name} vừa tham gia hội bạn! Cùng nhau thi đua nuôi heo lớn nhé 🎉`,
        createdAt: new Date().toISOString(),
      };

      set({
        squad: joinedSquad,
        members,
        feedItems: INITIAL_FEED_ITEMS,
        messages: [welcomeMsg],
        isLoading: false,
      });

      await AsyncStorage.setItem(
        STORAGE_KEY_SQUAD,
        JSON.stringify({
          squad: joinedSquad,
          members,
          feedItems: INITIAL_FEED_ITEMS,
          messages: [welcomeMsg],
        })
      );

      return true;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Không thể tham gia phòng' });
      return false;
    }
  },

  leaveSquad: async () => {
    set({
      squad: null,
      members: [],
      feedItems: [],
      messages: [],
    });
    try {
      await AsyncStorage.multiRemove([STORAGE_KEY_SQUAD, LEGACY_STORAGE_KEY_SQUAD]).catch(() => {});
    } catch (e) {
      console.warn('[SquadStore] Failed to remove storage:', e);
    }
  },

  sendSquadMessage: (text: string, userName: string) => {
    if (!text.trim()) return;
    const newMsg: SquadMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'my-user',
      senderName: userName || 'Tôi',
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      const updatedMessages = [...state.messages, newMsg];
      AsyncStorage.setItem(
        STORAGE_KEY_SQUAD,
        JSON.stringify({
          squad: state.squad,
          members: state.members,
          feedItems: state.feedItems,
          messages: updatedMessages,
        })
      ).catch(() => {});
      return { messages: updatedMessages };
    });
  },

  sendNudge: (toMemberId: string, type: 'FEED_PIG' | 'CHEER', fromName: string) => {
    const member = get().members.find((m) => m.id === toMemberId);
    const targetName = member?.name || 'bạn';

    const text =
      type === 'FEED_PIG'
        ? `👉 ${fromName} vừa nhắc ${targetName}: "Heo đang đói kìa, mau chụp ảnh cho heo ăn hôm nay đi!"`
        : `🎉 ${fromName} vừa vỗ béo heo của ${targetName}: "Giữ kỷ luật tiết kiệm đỉnh quá bạn ơi!"`;

    get().sendSquadMessage(text, 'PigFly Bot');
    return text;
  },

  reactToFeedItem: (itemId: string, emoji: string) => {
    set((state) => {
      const updated = state.feedItems.map((item) => {
        if (item.id === itemId) {
          const count = (item.reactions[emoji] || 0) + 1;
          return {
            ...item,
            reactions: { ...item.reactions, [emoji]: count },
          };
        }
        return item;
      });

      return { feedItems: updated };
    });
  },

  syncTransactionsToFeed: (transactions: Transaction[], userName: string) => {
    // Chỉ đưa các giao dịch công khai (is_squad_private !== true) vào Locket Feed
    const publicTxs = transactions.filter(
      (tx) =>
        (tx.status === 'CONFIRMED' || !tx.status) &&
        tx.is_squad_private !== true &&
        tx.type === 'EXPENSE'
    );

    if (publicTxs.length === 0) return;

    set((state) => {
      const existingIds = new Set(state.feedItems.map((f) => f.id));
      const myNewFeedItems: SquadFeedItem[] = publicTxs
        .slice(0, 5)
        .filter((tx) => !existingIds.has(tx.id))
        .map((tx) => ({
          id: tx.id,
          userId: 'my-user',
          userName: userName || 'Tôi',
          amount: tx.amount,
          category: tx.category,
          description: tx.description,
          photoUri: tx.photo_url || null,
          createdAt: tx.created_at,
          reactions: {},
        }));

      if (myNewFeedItems.length === 0) return state;

      return {
        feedItems: [...myNewFeedItems, ...state.feedItems],
      };
    });
  },
}));
