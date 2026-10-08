/**
 * Ví Locket - Privacy-Compliant Telemetry & Analytics Service
 * 
 * QUY TẮC BẢO MẬT:
 * - TUYỆT ĐỐI KHÔNG gửi: Số tài khoản ngân hàng, tên người nhận, số tiền giao dịch cụ thể, nội dung ảnh.
 * - CHỈ ghi nhận: Mã sự kiện, số lượng ảnh, danh mục phân loại, thời lượng thao tác (ms), cờ bật/tắt.
 * - Nơi chủ dự án xem: Console logs dev [ANALYTICS], Supabase telemetry table (nếu kết nối), hoặc getAnalyticsLog().
 */

export type AnalyticsEventType =
  | 'upload_tapped'
  | 'upload_images_selected'
  | 'receipt_saved'
  | 'receipt_dismissed'
  | 'amount_edited'
  | 'duplicate_warned'
  | 'time_to_save'
  | 'inbox_opened'
  | 'inbox_item_confirmed'
  | 'inbox_item_dismissed'
  | 'inbox_undo_tapped'
  | 'qr_bank_opened'
  | 'qr_prefill_reported_no'
  | 'wallet_opened';

export interface AnalyticsEvent {
  event: AnalyticsEventType;
  timestamp: string;
  properties?: Record<string, string | number | boolean>;
}

// In-memory telemetry queue
const eventQueue: AnalyticsEvent[] = [];
const MAX_QUEUE_SIZE = 100;

export function trackEvent(
  event: AnalyticsEventType,
  properties?: Record<string, string | number | boolean>
) {
  // Sanitize properties to ensure NO PII / Account numbers leak
  const sanitizedProps: Record<string, string | number | boolean> = {};
  if (properties) {
    for (const [key, value] of Object.entries(properties)) {
      // Blacklist sensitive keys
      if (
        key.toLowerCase().includes('account') ||
        key.toLowerCase().includes('stk') ||
        key.toLowerCase().includes('payee') ||
        key.toLowerCase().includes('name') ||
        key.toLowerCase().includes('amount') ||
        key.toLowerCase().includes('money')
      ) {
        continue;
      }
      sanitizedProps[key] = value;
    }
  }

  const payload: AnalyticsEvent = {
    event,
    timestamp: new Date().toISOString(),
    properties: Object.keys(sanitizedProps).length > 0 ? sanitizedProps : undefined,
  };

  eventQueue.push(payload);
  if (eventQueue.length > MAX_QUEUE_SIZE) {
    eventQueue.shift();
  }

  // Developer logging (for local monitoring & audit)
  if (__DEV__) {
    console.log(`[ANALYTICS] ${event}`, sanitizedProps);
  }
}

/**
 * Lấy lịch sử sự kiện phục vụ kiểm tra và báo cáo đo lường
 */
export function getAnalyticsLog(): AnalyticsEvent[] {
  return [...eventQueue];
}

/**
 * Tính tỉ lệ bỏ cuộc (Abandon Rate) giữa chừng khi tải ảnh
 */
export function calculateAbandonRate(): { totalOpened: number; totalSaved: number; totalDismissed: number; abandonRatePct: number } {
  let totalOpened = 0;
  let totalSaved = 0;
  let totalDismissed = 0;

  for (const e of eventQueue) {
    if (e.event === 'upload_tapped') totalOpened++;
    if (e.event === 'receipt_saved') totalSaved++;
    if (e.event === 'receipt_dismissed') totalDismissed++;
  }

  const abandonRatePct = totalOpened > 0 ? Math.round((totalDismissed / totalOpened) * 100) : 0;

  return {
    totalOpened,
    totalSaved,
    totalDismissed,
    abandonRatePct,
  };
}
