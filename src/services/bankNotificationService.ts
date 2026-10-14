/**
 * Bank Notification Service
 * Điều phối lắng nghe, phân tích và tự động ghi sổ giao dịch từ thông báo ngân hàng.
 * Tích hợp Single Source of Truth tự động đồng bộ số dư và hạn mức chi tiêu.
 * Cung cấp Event Emitter cho Camera Floating Pill và cơ chế gán ảnh chụp tức thì.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseBankNotification, ParsedBankNotification, SupportedBankCode } from '../utils/bankNotificationParser';
import { useTransactionStore } from '../store/transactionStore';
import { useBudgetStore } from '../store/budgetStore';
import { useAuthStore } from '../store/authStore';
import { Transaction } from '../types/database';

const STORAGE_KEY_ENABLED = 'KEPI_BANK_SYNC_ENABLED';
const STORAGE_KEY_ALLOWED_BANKS = 'KEPI_BANK_SYNC_ALLOWED_BANKS';

const DEFAULT_ALLOWED_BANKS: SupportedBankCode[] = ['TPB', 'VCB', 'MB', 'TCB', 'ACB', 'VPB', 'BIDV', 'OCB', 'OTHER'];

export interface BankSyncSettings {
  isEnabled: boolean;
  allowedBanks: SupportedBankCode[];
}

export interface BankNotificationEvent {
  parsed: ParsedBankNotification;
  transaction: Transaction;
}

type BankNotificationListener = (event: BankNotificationEvent) => void;

class BankNotificationService {
  private isEnabled: boolean = true;
  private allowedBanks: Set<SupportedBankCode> = new Set(DEFAULT_ALLOWED_BANKS);
  private isInitialized: boolean = false;
  private listeners: Set<BankNotificationListener> = new Set();
  private latestEvent: BankNotificationEvent | null = null;

  async init(): Promise<void> {
    if (this.isInitialized) return;
    try {
      const storedEnabled = await AsyncStorage.getItem(STORAGE_KEY_ENABLED);
      if (storedEnabled !== null) {
        this.isEnabled = storedEnabled === 'true';
      }

      const storedBanks = await AsyncStorage.getItem(STORAGE_KEY_ALLOWED_BANKS);
      if (storedBanks) {
        const parsed = JSON.parse(storedBanks) as SupportedBankCode[];
        this.allowedBanks = new Set(parsed);
      }
      this.isInitialized = true;
    } catch (e) {
      console.warn('Lỗi khi nạp cài đặt BankNotificationService:', e);
    }
  }

  getSettings(): BankSyncSettings {
    return {
      isEnabled: this.isEnabled,
      allowedBanks: Array.from(this.allowedBanks),
    };
  }

  async setEnabled(enabled: boolean): Promise<void> {
    this.isEnabled = enabled;
    await AsyncStorage.setItem(STORAGE_KEY_ENABLED, String(enabled));
  }

  async toggleBank(bankCode: SupportedBankCode, allowed: boolean): Promise<void> {
    if (allowed) {
      this.allowedBanks.add(bankCode);
    } else {
      this.allowedBanks.delete(bankCode);
    }
    await AsyncStorage.setItem(
      STORAGE_KEY_ALLOWED_BANKS,
      JSON.stringify(Array.from(this.allowedBanks))
    );
  }

  /**
   * Đăng ký lắng nghe sự kiện khi có thông báo ngân hàng mới (dành cho Camera Floating Pill)
   */
  subscribe(listener: BankNotificationListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getLatestEvent(): BankNotificationEvent | null {
    return this.latestEvent;
  }

  clearLatestEvent(): void {
    this.latestEvent = null;
  }

  /**
   * Gắn ảnh thực tế vừa chụp vào giao dịch ngân hàng mới nhất
   */
  async attachPhotoToLatestTransaction(photoUrl: string): Promise<boolean> {
    if (!this.latestEvent) return false;

    const txId = this.latestEvent.transaction.id;
    try {
      await useTransactionStore.getState().updateTransaction(txId, {
        photo_url: photoUrl,
      });
      this.clearLatestEvent();
      return true;
    } catch (e) {
      console.warn('Lỗi khi gắn ảnh vào giao dịch ngân hàng:', e);
      return false;
    }
  }

  /**
   * Xử lý thông báo đến từ Android Notification Listener hoặc giả lập
   * @returns Giao dịch được tạo thành công hoặc null nếu bị bỏ qua / không hợp lệ
   */
  async processIncomingNotification(
    text: string,
    title: string = '',
    packageName: string = ''
  ): Promise<BankNotificationEvent | null> {
    await this.init();

    if (!this.isEnabled) {
      return null;
    }

    const parsed = parseBankNotification(text, title, packageName);
    if (!parsed) {
      return null;
    }

    // Kiểm tra xem ngân hàng này có được người dùng cho phép không
    if (!this.allowedBanks.has(parsed.bankCode)) {
      return null;
    }

    const userId = useAuthStore.getState().user?.id || 'local_user';

    // 1. Lưu giao dịch vào transactionStore
    const createdTx = await useTransactionStore.getState().addTransaction({
      userId,
      type: parsed.type,
      amount: parsed.amount,
      category: parsed.categoryId,
      description: `${parsed.bankName}: ${parsed.content}`,
      photo_url: `bank_brand://${parsed.bankCode}`, // Marker định danh Card đồ họa ngân hàng
      thumbnail_url: null,
      payment_method: 'BANK',
      source: 'MANUAL',
      status: 'CONFIRMED', // Ghi thẳng vào sổ chi tiêu
    });

    // 2. Đồng bộ tức thì hạn mức ngày và số dư (Single Source of Truth)
    const currentTxs = useTransactionStore.getState().transactions;
    useBudgetStore.getState().recalculateFromTransactions(currentTxs);

    const eventPayload: BankNotificationEvent = {
      parsed,
      transaction: createdTx,
    };

    this.latestEvent = eventPayload;

    // 3. Thông báo cho tất cả subscribers (Camera Floating Pill)
    this.listeners.forEach((listener) => {
      try {
        listener(eventPayload);
      } catch (err) {
        console.warn('Lỗi listener bank notification:', err);
      }
    });

    return eventPayload;
  }
}

export const bankNotificationService = new BankNotificationService();
