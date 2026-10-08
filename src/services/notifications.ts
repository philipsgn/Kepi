import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Colors } from '../constants/colors';
import { formatVND } from '../utils/currency';

// Cấu hình Notification Handler để hiện banner thông báo ngay cả khi đang mở app
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Khởi tạo kênh thông báo và quyền hạn
 */
export async function setupNotificationChannels() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('wait-basket-reminders', {
      name: 'Nhắc Nhở Giỏ Chờ Cản Gắt',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: Colors.accentGold,
    });

    await Notifications.setNotificationChannelAsync('daily-expense-reminder', {
      name: 'Nhắc Ghi Sổ Cuối Ngày',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: Colors.primaryYellow,
    });

    await Notifications.setNotificationChannelAsync('qr-pending-reminder', {
      name: 'Nhắc Xác Nhận Quét QR',
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: Colors.primaryYellow,
    });
  }

  // Đăng ký Interactive Actions cho thông báo Luồng 1 (iOS & Android)
  try {
    await Notifications.setNotificationCategoryAsync('qr-pending-category', [
      {
        identifier: 'ACTION_CONFIRM',
        buttonTitle: 'Đã chuyển',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'ACTION_CANCEL',
        buttonTitle: 'Chưa chuyển',
        options: { isDestructive: true, opensAppToForeground: false },
      },
    ]);
  } catch (e) {
    console.log('Không thể đăng ký notification category:', e);
  }

  // Khởi tạo các Action Categories cho Thanh Ngân Sách Màn Hình Khóa
  try {
    const { setupLockScreenNotificationCategories } = require('./lockScreenService');
    await setupLockScreenNotificationCategories();
  } catch (err) {
    console.log('Không thể đăng ký lockscreen categories:', err);
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }
}

/**
 * Kiểm tra xem giờ hiện tại có rơi vào khung giờ yên lặng (Quiet Hours: 22:00 - 07:00) không
 */
export function isInQuietHours(hour?: number): boolean {
  const currentHour = hour !== undefined ? hour : new Date().getHours();
  return currentHour >= 22 || currentHour < 7;
}

/**
 * Lên lịch nhắc nhẹ cuối ngày (mặc định 21:00, tối đa 3 thông báo/ngày, tôn trọng giờ yên lặng)
 */
export async function scheduleDailyExpenseReminder(
  hour: number = 21,
  minute: number = 0,
  enabled: boolean = true
) {
  try {
    // Hủy nhắc cũ nếu có
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content.data?.type === 'DAILY_EXPENSE_REMINDER') {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }

    if (!enabled) return;

    // Nếu người dùng chọn giờ rơi vào giờ yên lặng (22:00 - 07:00), điều chỉnh về 21:00
    const targetHour = isInQuietHours(hour) ? 21 : hour;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Ghi sổ cuối ngày 🍂',
        body: 'Hôm nay bạn có khoản nào chưa ghi? Tải ảnh giao dịch hoặc chụp nhanh.',
        data: { type: 'DAILY_EXPENSE_REMINDER' },
        sound: true,
        color: Colors.primaryYellow,
      },
      trigger: {
        hour: targetHour,
        minute,
        repeats: true,
        channelId: 'daily-expense-reminder',
      } as any,
    });
  } catch (err) {
    console.log('Không thể lên lịch nhắc nhở hàng ngày:', err);
  }
}

/**
 * Lên lịch 4 mốc nhắc nhở dồn dập (1h, 3h, 6h, 24h)
 * Lưu trữ danh sách Notification ID vào bộ nhớ để có thể hủy khi người dùng đã quyết định
 */
const scheduledMap = new Map<string, string[]>();

export async function scheduleAggressiveReminders(params: {
  itemId: string;
  itemName: string;
  amount: number;
}): Promise<string[]> {
  const { itemId, itemName, amount } = params;
  const formatted = formatVND(amount);

  const triggers = [
    {
      seconds: 3600, // 1 giờ
      title: 'Uống ngụm nước đã 🍃',
      body: `Bạn còn thèm mua "${itemName}" (${formatted}) không? Hay thôi bấm Cứu Ví đi!`,
    },
    {
      seconds: 10800, // 3 giờ
      title: 'Cơn sốt hạ nhiệt chưa? ⏳',
      body: `Món "${itemName}" vẫn đang đợi. Bấm "Thôi" là ví bạn nhẹ nhõm ngay!`,
    },
    {
      seconds: 21600, // 6 giờ
      title: 'Tỉnh táo lên bạn ơi! 🌼',
      body: `Món "${itemName}" (${formatted}) bằng mấy bữa ăn trưa liền đấy. Nghĩ kỹ nhé!`,
    },
    {
      seconds: 86400, // 24 giờ
      title: 'Sau 1 giấc ngủ ngon 🌙',
      body: `Hôm qua bạn ngắm "${itemName}". Giờ bạn còn thực sự cần nó không?`,
    },
  ];

  const notificationIds: string[] = [];

  for (const t of triggers) {
    try {
      const notifId = await Notifications.scheduleNotificationAsync({
        content: {
          title: t.title,
          body: t.body,
          data: { itemId, itemName, amount },
          sound: true,
          color: Colors.accentGold,
        },
        trigger: {
          seconds: t.seconds,
          channelId: 'wait-basket-reminders',
        } as any,
      });
      notificationIds.push(notifId);
    } catch (err) {
      console.log('Không thể lên lịch notification:', err);
    }
  }

  scheduledMap.set(itemId, notificationIds);
  return notificationIds;
}

/**
 * Hủy toàn bộ thông báo của 1 món khi đã bấm "Thôi" hoặc "Mua"
 */
export async function cancelItemReminders(itemId: string) {
  const notifIds = scheduledMap.get(itemId);
  if (notifIds && notifIds.length > 0) {
    for (const id of notifIds) {
      try {
        await Notifications.cancelScheduledNotificationAsync(id);
      } catch {
        // Bỏ qua
      }
    }
    scheduledMap.delete(itemId);
  }
}
