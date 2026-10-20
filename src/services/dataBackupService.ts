/**
 * Data Backup & Restore Service
 * Hỗ trợ xuất và nhập dữ liệu sao lưu (JSON) 100% offline tự chủ và an toàn.
 * Tuân thủ tuyệt đối quy định không lưu STK ngân hàng hay dữ liệu nhạy cảm.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useTransactionStore } from '../store/transactionStore';
import { useBudgetStore } from '../store/budgetStore';
import { useAuthStore } from '../store/authStore';

export interface BackupPayload {
  version: number;
  appName: string;
  createdAt: string;
  user: {
    fullName: string;
    favUnit?: string;
  };
  budget: {
    monthlyIncome: number;
    monthlyFixedCosts: number;
    baseDailyBudget: number;
    goalName: string;
    goalTargetAmount: number;
  };
  fixedCostItems: unknown[];
  goals: unknown[];
  transactions: unknown[];
  embeddedPhotos?: Record<string, { fullBase64?: string; thumbBase64?: string }>;
}

/**
 * Xuất toàn bộ dữ liệu ứng dụng thành file JSON (kèm toàn bộ ảnh thực tế được nhúng)
 * Đảm bảo khi người dùng gỡ app cài lại vẫn phục hồi 100% ảnh mà không tốn chi phí đám mây.
 */
export async function exportAppDataAsync(): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    const authStore = useAuthStore.getState();
    const budgetStore = useBudgetStore.getState();
    const txStore = useTransactionStore.getState();

    const [cachedGoals, cachedFixedCosts] = await Promise.all([
      AsyncStorage.getItem('@vilocket_goals_list'),
      AsyncStorage.getItem('vi_locket_fixed_cost_items'),
    ]);

    // Nhúng toàn bộ file ảnh cục bộ vào bản sao lưu
    const embeddedPhotos: Record<string, { fullBase64?: string; thumbBase64?: string }> = {};

    for (const tx of txStore.transactions) {
      if (tx.photo_url && tx.photo_url.startsWith('file://')) {
        try {
          const info = await FileSystem.getInfoAsync(tx.photo_url);
          if (info.exists) {
            const b64 = await FileSystem.readAsStringAsync(tx.photo_url, {
              encoding: FileSystem.EncodingType.Base64,
            });
            embeddedPhotos[tx.id] = { fullBase64: b64 };
          }
        } catch (e) {
          console.warn(`[DataBackup] Skip reading photo for ${tx.id}:`, e);
        }
      }
      if (tx.thumbnail_url && tx.thumbnail_url.startsWith('file://')) {
        try {
          const info = await FileSystem.getInfoAsync(tx.thumbnail_url);
          if (info.exists) {
            const b64 = await FileSystem.readAsStringAsync(tx.thumbnail_url, {
              encoding: FileSystem.EncodingType.Base64,
            });
            embeddedPhotos[tx.id] = {
              ...(embeddedPhotos[tx.id] || {}),
              thumbBase64: b64,
            };
          }
        } catch (e) {
          console.warn(`[DataBackup] Skip reading thumb for ${tx.id}:`, e);
        }
      }
    }

    const backupData: BackupPayload = {
      version: 2,
      appName: 'Kepi (Ví Locket)',
      createdAt: new Date().toISOString(),
      user: {
        fullName: authStore.profile?.full_name || authStore.user?.full_name || 'Bạn',
        favUnit: budgetStore.favUnit,
      },
      budget: {
        monthlyIncome: budgetStore.monthlyIncome,
        monthlyFixedCosts: budgetStore.monthlyFixedCosts,
        baseDailyBudget: budgetStore.baseDailyBudget,
        goalName: budgetStore.goalName,
        goalTargetAmount: budgetStore.goalTargetAmount,
      },
      fixedCostItems: cachedFixedCosts ? JSON.parse(cachedFixedCosts) : [],
      goals: cachedGoals ? JSON.parse(cachedGoals) : [],
      transactions: txStore.transactions,
      embeddedPhotos,
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `Kepi_Full_Backup_${dateStr}.json`;
    const baseDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
    const fileUri = `${baseDir}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, jsonString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Sao lưu dữ liệu Kepi (Kèm toàn bộ ảnh)',
        UTI: 'public.json',
      });
    }

    return { success: true, filePath: fileUri };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi không xác định khi xuất dữ liệu';
    console.warn('[DataBackup] Export failed:', error);
    return { success: false, error: msg };
  }
}

/**
 * Khôi phục dữ liệu và phục hồi toàn bộ ảnh chụp từ file sao lưu
 */
export async function restoreAppDataAsync(jsonString: string): Promise<{ success: boolean; error?: string; count?: number }> {
  try {
    const parsed = JSON.parse(jsonString) as BackupPayload;

    if (!parsed || !parsed.appName || !parsed.budget) {
      return { success: false, error: 'File sao lưu không đúng định dạng của Kepi.' };
    }

    // Đảm bảo thư mục lưu ảnh phục hồi tồn tại
    const baseDocDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
    const photosDir = `${baseDocDir}kepi_restored_photos/`;
    try {
      const dirInfo = await FileSystem.getInfoAsync(photosDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(photosDir, { intermediates: true });
      }
    } catch {
      // Ignore directory check error
    }

    // 1. Phục hồi Transactions & ghi lại các file ảnh
    if (Array.isArray(parsed.transactions)) {
      const restoredTransactions: any[] = [];

      for (const rawTx of parsed.transactions as any[]) {
        const tx = { ...rawTx };
        const embedded = parsed.embeddedPhotos?.[tx.id];

        if (embedded?.fullBase64) {
          const targetUri = `${photosDir}${tx.id}.webp`;
          try {
            await FileSystem.writeAsStringAsync(targetUri, embedded.fullBase64, {
              encoding: FileSystem.EncodingType.Base64,
            });
            tx.photo_url = targetUri;
          } catch (e) {
            console.warn(`[DataBackup] Could not restore photo for tx ${tx.id}:`, e);
          }
        }

        if (embedded?.thumbBase64) {
          const targetThumbUri = `${photosDir}${tx.id}_thumb.webp`;
          try {
            await FileSystem.writeAsStringAsync(targetThumbUri, embedded.thumbBase64, {
              encoding: FileSystem.EncodingType.Base64,
            });
            tx.thumbnail_url = targetThumbUri;
          } catch (e) {
            console.warn(`[DataBackup] Could not restore thumb for tx ${tx.id}:`, e);
          }
        }

        restoredTransactions.push(tx);
      }

      await AsyncStorage.setItem('vi_locket_transactions_data', JSON.stringify(restoredTransactions));
      const authUser = useAuthStore.getState().user;
      if (authUser?.id) {
        await useTransactionStore.getState().loadTransactions(authUser.id);
      } else {
        useTransactionStore.setState({ transactions: restoredTransactions });
      }
      useBudgetStore.getState().recalculateFromTransactions(restoredTransactions);
    }

    // 2. Phục hồi Budget Settings
    const userId = useAuthStore.getState().user?.id || 'guest-user';
    await useBudgetStore.getState().setupBudget({
      userId,
      monthlyIncome: parsed.budget.monthlyIncome || 0,
      monthlyFixedCosts: parsed.budget.monthlyFixedCosts || 0,
      goalName: parsed.budget.goalName || '',
      goalTargetAmount: parsed.budget.goalTargetAmount || 0,
      favUnit: (parsed.user?.favUnit as any) || 'tra_sua',
    });

    // 3. Phục hồi Fixed Costs
    if (Array.isArray(parsed.fixedCostItems)) {
      await AsyncStorage.setItem('vi_locket_fixed_cost_items', JSON.stringify(parsed.fixedCostItems));
    }

    // 4. Phục hồi Multi-Goals
    if (Array.isArray(parsed.goals)) {
      await AsyncStorage.setItem('@vilocket_goals_list', JSON.stringify(parsed.goals));
    }

    // 5. Phục hồi Tên người dùng nếu có
    if (parsed.user?.fullName) {
      await useAuthStore.getState().updateProfile({ full_name: parsed.user.fullName });
    }

    const txCount = Array.isArray(parsed.transactions) ? parsed.transactions.length : 0;
    return { success: true, count: txCount };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Dữ liệu file sao lưu bị hỏng';
    console.warn('[DataBackup] Restore failed:', error);
    return { success: false, error: msg };
  }
}
