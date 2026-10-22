export type TransactionType = 'EXPENSE' | 'INCOME' | 'ADJUST';
export type TransactionStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';
export type TransactionSource = 'PHOTO' | 'MANUAL' | 'SCREENSHOT' | 'QR';
export type PaymentMethod = 'CASH' | 'BANK' | 'E_WALLET';
export type WaitBasketStatus = 'WAITING' | 'BOUGHT' | 'SKIPPED';
export type FavoriteUnit = 'tra_sua' | 'ca_phe' | 'to_pho';
export type MediaType = 'PHOTO' | 'VIDEO_3S';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  birthdate: string | null;
  fav_unit: FavoriteUnit;
  hourly_rate: number;
  privacy_mode?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface FinancialSettings {
  id: string;
  user_id: string;
  monthly_income: number;
  monthly_fixed_costs: number;
  goal_name: string | null;
  goal_target_amount: number;
  goal_deadline: string | null;
  base_daily_budget: number;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string | null;
  photo_url: string | null;
  thumbnail_url?: string | null;
  payment_method?: PaymentMethod;
  media_type?: MediaType;
  is_squad_private?: boolean;
  source: TransactionSource;
  status?: TransactionStatus;
  payee_name?: string | null;
  bank_bin?: string | null;
  qr_kind?: 'STATIC' | 'DYNAMIC' | null;
  pending_expires_at?: string | null;
  occurred_at: string;
  created_at: string;
}

export interface WaitBasketItem {
  id: string;
  user_id: string;
  item_name: string;
  amount: number;
  category: string | null;
  photo_url: string | null;
  status: WaitBasketStatus;
  remind_interval_hours: number;
  next_remind_at: string | null;
  decided_at: string | null;
  created_at: string;
}

export interface DailyBudgetLog {
  id: string;
  user_id: string;
  log_date: string;
  allocated_budget: number;
  actual_spent: number;
  rollover_amount: number;
}

/**
 * Định dạng dữ liệu phục vụ hiển thị trên Bộ Lịch Ảnh Tháng (Calendar View)
 */
export interface CalendarDaySummary {
  date: string;              // 'YYYY-MM-DD'
  dayNumber: number;         // 1..31
  thumbnailUrl: string | null;
  totalSpent: number;
  totalIncome: number;
  itemCount: number;         // Số lượng giao dịch trong ngày (+1, +2...)
  isToday: boolean;
  hasSkippedItem: boolean;   // Đã cứu ví trong ngày này
}
