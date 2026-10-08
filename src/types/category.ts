export type CategoryType = 'EXPENSE' | 'INCOME';

export interface CategoryItem {
  id: string;               // uuid cho danh mục tự tạo, hoặc slug cố định (an_uong, luong...)
  userId?: string | null;   // null nếu là danh mục mặc định hệ thống; có userId nếu user tự tạo
  type: CategoryType;       // 'EXPENSE' | 'INCOME'
  name: string;             // Tên hiển thị: 'Cho mẹ', 'Nuôi mèo', 'Tiền thưởng'...
  icon: string;             // Tên icon từ lucide-react-native: 'Heart', 'Utensils', 'Car'...
  color: string;            // Hex code màu đại diện
  isDefault?: boolean;      // true nếu là danh mục hệ thống tạo sẵn
  isActive?: boolean;       // true: hiển thị; false: người dùng đã ẩn đi
  orderIndex: number;       // Thứ tự hiển thị
  createdAt?: string;       // ISO Timestamp
}
