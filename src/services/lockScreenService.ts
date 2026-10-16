import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';
import { formatCompactVND, formatVND } from '../utils/currency';
import { useBudgetStore } from '../store/budgetStore';
import { useTransactionStore } from '../store/transactionStore';

import { ParsedBankNotification } from '../utils/bankNotificationParser';

export const LOCK_SCREEN_STORAGE_KEY = 'kepi_lockscreen_budget_enabled';
export const LOCK_SCREEN_NOTIF_ID = 'kepi-lockscreen-budget';
export const LOCK_SCREEN_CHANNEL_ID = 'lock-screen-budget-channel';

export const LOCK_SCREEN_CATEGORY_STANDARD = 'kepi-lockscreen-standard';
export const LOCK_SCREEN_CATEGORY_UNDO = 'kepi-lockscreen-undo';
export const LOCK_SCREEN_CATEGORY_BANK_ALERT = 'kepi-lockscreen-bank-alert';

export const LOCK_SCREEN_ACTIONS = {
  SPEND_30K: 'ACTION_QUICK_SPEND_30K',
  SPEND_50K: 'ACTION_QUICK_SPEND_50K',
  OPEN_CAMERA: 'ACTION_OPEN_CAMERA',
  UNDO: 'ACTION_UNDO',
  BANK_SNAPSHOT: 'ACTION_BANK_SNAPSHOT',
  BANK_FAST_LOG: 'ACTION_BANK_FAST_LOG',
} as const;

interface LastQuickSpendState {
  txId: string;
  amount: number;
  timeString: string;
}

let lastQuickSpend: LastQuickSpendState | null = null;

/**
 * Đăng ký Action Categories cho Interactive Notifications
 */
export async function setupLockScreenNotificationCategories(): Promise<void> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(LOCK_SCREEN_CHANNEL_ID, {
        name: 'Thanh Ngân Sách Màn Hình Khóa',
        importance: Notifications.AndroidImportance.HIGH,
        showBadge: false,
        enableVibrate: false,
        sound: undefined,
        lightColor: Colors.accentGold,
      });
    }

    // 1. Category chuẩn: [-30k], [-50k], [📸 Chụp món]
    await Notifications.setNotificationCategoryAsync(LOCK_SCREEN_CATEGORY_STANDARD, [
      {
        identifier: LOCK_SCREEN_ACTIONS.SPEND_30K,
        buttonTitle: '-30k Cafe',
        options: { opensAppToForeground: false },
      },
      {
        identifier: LOCK_SCREEN_ACTIONS.SPEND_50K,
        buttonTitle: '-50k Ăn trưa',
        options: { opensAppToForeground: false },
      },
      {
        identifier: LOCK_SCREEN_ACTIONS.OPEN_CAMERA,
        buttonTitle: '📸 Chụp món',
        options: { opensAppToForeground: true },
      },
    ]);

    // 2. Category khi vừa trừ tiền: [↩️ Hoàn tác], [-50k], [📸 Chụp món]
    await Notifications.setNotificationCategoryAsync(LOCK_SCREEN_CATEGORY_UNDO, [
      {
        identifier: LOCK_SCREEN_ACTIONS.UNDO,
        buttonTitle: '↩️ Hoàn tác',
        options: { opensAppToForeground: false, isDestructive: true },
      },
      {
        identifier: LOCK_SCREEN_ACTIONS.SPEND_50K,
        buttonTitle: '-50k Ăn trưa',
        options: { opensAppToForeground: false },
      },
      {
        identifier: LOCK_SCREEN_ACTIONS.OPEN_CAMERA,
        buttonTitle: '📸 Chụp món',
        options: { opensAppToForeground: true },
      },
    ]);

    // 3. Category khi nhận diện biến động số dư ngân hàng: [📸 Chụp Locket], [⚡ Ghi Nhanh]
    await Notifications.setNotificationCategoryAsync(LOCK_SCREEN_CATEGORY_BANK_ALERT, [
      {
        identifier: LOCK_SCREEN_ACTIONS.BANK_SNAPSHOT,
        buttonTitle: '📸 Chụp Locket',
        options: { opensAppToForeground: true },
      },
      {
        identifier: LOCK_SCREEN_ACTIONS.BANK_FAST_LOG,
        buttonTitle: '⚡ Ghi Nhanh',
        options: { opensAppToForeground: true },
      },
    ]);
  } catch (error) {
    console.warn('[LockScreen] Không thể đăng ký notification category:', error);
  }
}

/**
 * Kiểm tra xem tính năng Ghim màn hình khóa có đang bật không
 */
export async function isLockScreenBudgetEnabled(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(LOCK_SCREEN_STORAGE_KEY);
    if (val === null) {
      // Mặc định BẬT để mang lại tiện ích 0-friction ngay từ đầu
      return true;
    }
    return val === 'true';
  } catch {
    return true;
  }
}

/**
 * Bật/tắt tính năng Ghim màn hình khóa
 */
export async function setLockScreenBudgetEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCK_SCREEN_STORAGE_KEY, enabled ? 'true' : 'false');
    if (enabled) {
      await syncBudgetToLockScreen();
    } else {
      await dismissLockScreenBudgetNotification();
    }
  } catch (error) {
    console.warn('[LockScreen] Lỗi khi lưu cài đặt lockscreen:', error);
  }
}

/**
 * Ẩn thông báo ghim màn hình khóa
 */
export async function dismissLockScreenBudgetNotification(): Promise<void> {
  try {
    await Notifications.dismissNotificationAsync(LOCK_SCREEN_NOTIF_ID);
  } catch {
    // Bỏ qua lỗi nếu không có thông báo
  }
}

/**
 * Đồng bộ số dư hôm nay lên Thanh thông báo ghim màn hình khóa
 */
export async function syncBudgetToLockScreen(options?: {
  customText?: string;
  withUndo?: boolean;
}): Promise<void> {
  try {
    const enabled = await isLockScreenBudgetEnabled();
    if (!enabled) return;

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    const budgetStore = useBudgetStore.getState();
    const todayBudget = budgetStore.todayBudget || 100000;
    const todaySpent = budgetStore.todaySpent || 0;
    const remainingToday = todayBudget - todaySpent;

    const hasUndo = !!options?.withUndo && !!lastQuickSpend;

    let title = '';
    if (remainingToday > 0) {
      title = `🟢 Kepi: Hôm nay còn ${formatCompactVND(remainingToday)}`;
    } else if (remainingToday === 0) {
      title = `🟡 Kepi: Vừa khít ngân sách hôm nay (0đ)`;
    } else {
      title = `🔴 Kepi: Đã lố ngân sách ${formatCompactVND(Math.abs(remainingToday))}`;
    }

    let body = options?.customText;
    if (!body) {
      body = `Đã tiêu ${formatCompactVND(todaySpent)} / Ngân sách ${formatCompactVND(todayBudget)}`;
    }

    await Notifications.scheduleNotificationAsync({
      identifier: LOCK_SCREEN_NOTIF_ID,
      content: {
        title,
        body,
        data: {
          type: 'LOCK_SCREEN_BUDGET',
          remainingToday,
          todayBudget,
          todaySpent,
          lastQuickSpend,
        },
        categoryIdentifier: hasUndo ? LOCK_SCREEN_CATEGORY_UNDO : LOCK_SCREEN_CATEGORY_STANDARD,
        sticky: true,
        autoDismiss: false,
        color: Colors.accentGold,
      },
      trigger: null, // Hiển thị tức thì
    });
  } catch (error) {
    console.warn('[LockScreen] Lỗi khi đồng bộ notification:', error);
  }
}

/**
 * Xử lý Action từ thông báo màn hình khóa (Chạy ngầm hoặc foreground)
 */
export async function handleLockScreenAction(
  actionIdentifier: string
): Promise<{ handled: boolean; navigateTo?: 'CAMERA' }> {
  try {
    if (actionIdentifier === LOCK_SCREEN_ACTIONS.SPEND_30K) {
      await recordLockScreenQuickSpend(30000, 'Cà phê / Ăn sáng');
      return { handled: true };
    }

    if (actionIdentifier === LOCK_SCREEN_ACTIONS.SPEND_50K) {
      await recordLockScreenQuickSpend(50000, 'Bữa ăn / Tiêu vặt');
      return { handled: true };
    }

    if (actionIdentifier === LOCK_SCREEN_ACTIONS.UNDO) {
      await undoLockScreenQuickSpend();
      return { handled: true };
    }

    if (actionIdentifier === LOCK_SCREEN_ACTIONS.OPEN_CAMERA) {
      return { handled: true, navigateTo: 'CAMERA' };
    }

    return { handled: false };
  } catch (error) {
    console.warn('[LockScreen] Lỗi khi xử lý action:', error);
    return { handled: false };
  }
}

/**
 * Ghi nhận khoản chi nhanh từ màn hình khóa (không mở app)
 */
async function recordLockScreenQuickSpend(amount: number, description: string): Promise<void> {
  const txStore = useTransactionStore.getState();
  const tx = await txStore.addTransaction({
    userId: 'current-user',
    type: 'EXPENSE',
    amount,
    category: 'Ăn uống',
    description: `Ghi nhanh: ${description}`,
    photo_url: null,
    thumbnail_url: null,
    payment_method: 'CASH',
    source: 'MANUAL',
    status: 'CONFIRMED',
  });

  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;

  lastQuickSpend = {
    txId: tx.id,
    amount,
    timeString: timeStr,
  };

  // Cập nhật lại chính thông báo đó ngay lập tức với nút Hoàn Tác
  await syncBudgetToLockScreen({
    customText: `Vừa trừ ${formatVND(amount)} lúc ${timeStr}. Chạm [Hoàn tác] nếu nhầm.`,
    withUndo: true,
  });
}

/**
 * Hoàn tác khoản chi nhanh vừa bấm nhầm
 */
async function undoLockScreenQuickSpend(): Promise<void> {
  if (!lastQuickSpend) return;

  const txStore = useTransactionStore.getState();
  await txStore.deleteTransaction(lastQuickSpend.txId);

  const revertedAmount = lastQuickSpend.amount;
  lastQuickSpend = null;

  // Cập nhật lại thông báo về trạng thái bình thường
  await syncBudgetToLockScreen({
    customText: `Đã hoàn tác ${formatVND(revertedAmount)}. Số dư đã được khôi phục.`,
    withUndo: false,
  });
}

/**
 * Đẩy thông báo biến động số dư ngân hàng tương tác ra màn hình khóa / khay thông báo
 */
export async function pushBankDetectedNotification(detected: ParsedBankNotification): Promise<string | null> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return null;

    const notifId = `kepi-bank-${Date.now()}`;
    const sign = detected.type === 'EXPENSE' ? '-' : '+';
    const amountStr = `${sign}${formatVND(detected.amount)}`;
    const title = `🔔 ${detected.bankName}: ${amountStr}`;
    const body = detected.isGenericContent
      ? `Biến động số dư: Chạm [📸 Chụp] để lưu ảnh hoặc [⚡ Nhanh] để chọn danh mục.`
      : `ND: ${detected.content}. Chạm [📸 Chụp] hoặc [⚡ Nhanh].`;

    await Notifications.scheduleNotificationAsync({
      identifier: notifId,
      content: {
        title,
        body,
        data: {
          type: 'BANK_DETECTED',
          bankEvent: detected,
        },
        categoryIdentifier: LOCK_SCREEN_CATEGORY_BANK_ALERT,
        color: Colors.accentGold,
        sound: true,
      },
      trigger: null,
    });
    return notifId;
  } catch (err) {
    console.warn('[LockScreen] Lỗi khi push bank notification:', err);
    return null;
  }
}

