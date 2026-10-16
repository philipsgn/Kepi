/**
 * Clipboard Bank Notification Watcher
 * Tự động kiểm tra nội dung Clipboard khi ứng dụng kích hoạt (resume).
 * Nhận diện biến động số dư từ 8+ ngân hàng lớn (100% offline, chặn OTP).
 */

import { AppState, AppStateStatus } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { parseBankNotification, ParsedBankNotification } from '../utils/bankNotificationParser';

export type ClipboardBankDetectedCallback = (detected: ParsedBankNotification, rawText: string) => void;

class ClipboardBankWatcher {
  private lastCheckedHash: string = '';
  private listeners: Set<ClipboardBankDetectedCallback> = new Set();
  private isListening: boolean = false;

  init() {
    if (this.isListening) return;
    this.isListening = true;

    // Lắng nghe sự kiện AppState khi mở app hoặc resume từ background
    AppState.addEventListener('change', this.handleAppStateChange);

    // Kiểm tra ngay khi khởi động
    this.checkClipboardAsync().catch(() => {});
  }

  subscribe(listener: ClipboardBankDetectedCallback): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      this.checkClipboardAsync().catch(() => {});
    }
  };

  /**
   * Đọc nội dung Clipboard và kiểm tra xem có phải thông báo ngân hàng không
   */
  async checkClipboardAsync(): Promise<ParsedBankNotification | null> {
    try {
      const hasString = await Clipboard.hasStringAsync();
      if (!hasString) return null;

      const text = await Clipboard.getStringAsync();
      if (!text || text.trim().length < 10) return null;

      const trimmed = text.trim();
      const currentHash = `${trimmed.length}_${trimmed.slice(0, 30)}`;

      // Tránh hỏi lại liên tục cho cùng 1 nội dung vừa sao chép
      if (currentHash === this.lastCheckedHash) {
        return null;
      }

      this.lastCheckedHash = currentHash;

      // Phân tích cú pháp với bộ nhận diện 8+ ngân hàng Việt Nam
      const parsed = parseBankNotification(trimmed);
      if (!parsed) return null;

      // Kích hoạt callbacks thông báo cho UI
      this.listeners.forEach((listener) => {
        try {
          listener(parsed, trimmed);
        } catch (err) {
          console.warn('[ClipboardBankWatcher] Listener error:', err);
        }
      });

      return parsed;
    } catch {
      return null;
    }
  }

  clearLastHash() {
    this.lastCheckedHash = '';
  }
}

export const clipboardBankWatcher = new ClipboardBankWatcher();
