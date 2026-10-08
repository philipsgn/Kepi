# ĐẶC TẢ KỸ THUẬT: HỆ THỐNG DANH MỤC TÙY BIẾN (CUSTOM CATEGORIES ENGINE — M2)

> **Tài liệu:** `docs/features/CUSTOM_CATEGORIES_SPEC.md`  
> **Phiên bản:** 1.0  
> **Trạng thái:** Sẵn sàng triển khai  
> **Thuộc Milestone:** M2.1  

---

## 1. BỐI CẢNH & MỤC TIÊU SẢN PHẨM

### 1.1. Nỗi Đau Người Dùng Từ Thị Trường
Người dùng trên các ứng dụng quản lý chi tiêu hiện tại phản hồi rất nhiều về việc:
> *"Có cách nào thay đổi mục chi tiền vs tiền vào hông, ví dụ tiền chi là cho mẹ hoặc tiền vào là đc cho này nọ... Bên trong nên chia theo tiền thu và tiền chi, có các đầu mục cụ thể như xe cộ, đồ ăn, thuốc, quần áo và cho thêm/bớt/sửa các đầu mục cùng nhiều icon tiện lợi."*

### 1.2. Mục Tiêu của Kepi
1. Phân tách rạch ròi 2 luồng: **Danh Mục Chi Tiêu (Expense Categories)** và **Danh Mục Thu Nhập (Income Categories)**.
2. Cung cấp sẵn bộ danh mục mặc định chuẩn đời sống người Việt trẻ (Ăn uống, Đi lại, Nhà cửa, Thuốc men, Cho mẹ, Nuôi pet, Quần áo, Lương, Thưởng...).
3. Trao quyền cho người dùng tự do **Thêm Mới / Chỉnh Sửa / Đổi Icon Vector / Đổi Màu Sắc / Ẩn Bớt** danh mục theo phong cách sống riêng.
4. Trải nghiệm tức thì: Cho phép tạo nhanh danh mục mới ngay tại Bottom Sheet ghi chép mà không cần rời khỏi màn hình Camera.

---

## 2. CẤU TRÚC DỮ LIỆU & KIẾN TRÚC STORE

### 2.1. TypeScript Interface (`src/types/category.ts`)
```typescript
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
```

### 2.2. Danh Mục Mặc Định Hệ Thống (System Defaults)

#### A. Nhóm Chi Tiêu (EXPENSE):
| ID | Tên Danh Mục | Icon Lucide | Màu Đại Diện |
| :--- | :--- | :--- | :--- |
| `an_uong` | Ăn uống & Cà phê | `Utensils` | `#E59844` (Vàng Thu) |
| `di_chuyen` | Di chuyển & Xăng xe | `Car` | `#7E9F80` (Cốm Non) |
| `nha_cua` | Nhà cửa & Điện nước | `Home` | `#9B59B6` (Tím Tây Hồ) |
| `mua_sam` | Mua sắm & Quần áo | `ShoppingBag` | `#C86D51` (Ngói Rêu) |
| `suc_khoe` | Thuốc men & Sức khỏe | `HeartPulse` | `#E74C3C` (Đỏ San Hô) |
| `gia_dinh` | Gia đình & Cho mẹ | `Heart` | `#F39C12` (Cam Ấm) |
| `thu_cung` | Nuôi thú cưng | `PawPrint` | `#16A085` (Ngọc Bích) |
| `hoc_tap` | Học tập & Tri thức | `GraduationCap` | `#2980B9` (Xanh Lam) |
| `khac` | Chi tiêu khác | `MoreHorizontal` | `#95A5A6` (Xám Khói) |

#### B. Nhóm Thu Nhập (INCOME):
| ID | Tên Danh Mục | Icon Lucide | Màu Đại Diện |
| :--- | :--- | :--- | :--- |
| `luong` | Tiền lương chính | `Wallet` | `#27AE60` (Xanh Lá) |
| `thuong` | Tiền thưởng & Tip | `Award` | `#F1C40F` (Vàng Kim) |
| `duoc_cho` | Được cho / Biếu tặng | `Gift` | `#E67E22` (Cam Rực) |
| `dau_tu` | Lợi nhuận đầu tư | `TrendingUp` | `#2ECC71` (Ngọc Sáng) |
| `ban_do` | Thanh lý / Bán đồ cũ | `Tag` | `#3498DB` (Xanh Biển) |
| `thu_khac` | Thu nhập khác | `Coins` | `#1ABC9C` (Bạc Hà) |

---

## 3. THƯ VIỆN ICON VECTOR CHUẨN (`lucide-react-native`)

Để đảm bảo thẩm mỹ sang trọng, 100% Vector không vỡ hạt và không dùng emoji lộn xộn, người dùng được chọn trong danh mục các icon tuyển chọn:

```typescript
export const AVAILABLE_CATEGORY_ICONS = [
  // Đời sống & Ăn uống
  'Utensils', 'Coffee', 'Pizza', 'Beer', 'ShoppingBag', 'ShoppingCart',
  // Nhà cửa & Tiện ích
  'Home', 'Zap', 'Droplets', 'Wifi', 'Phone',
  // Di chuyển
  'Car', 'Bike', 'Fuel', 'Plane', 'Train',
  // Gia đình & Tình cảm
  'Heart', 'Baby', 'Users', 'Gift',
  // Sức khỏe & Thể thao
  'HeartPulse', 'Dumbbell', 'Pill',
  // Học tập & Làm việc
  'GraduationCap', 'BookOpen', 'Briefcase', 'Laptop',
  // Thú cưng & Thiên nhiên
  'PawPrint', 'Trees', 'Flower2',
  // Tài chính & Đầu tư
  'Wallet', 'Coins', 'PiggyBank', 'TrendingUp', 'Award', 'Tag', 'Sparkles',
  // Chung
  'MoreHorizontal'
] as const;
```

---

## 4. LUỒNG TRẢI NGHIỆM NGƯỜI DÙNG (UX FLOWS)

### Flow 1: Quản Lý Tập Trung Trong Hồ Sơ (Profile)
1. Người dùng mở tab **Hồ Sơ (Profile)** ➔ Chọn thẻ **Quản Lý Danh Mục**.
2. Màn hình mở ra với 2 tab: `[ Chi Tiêu (9) ]` và `[ Thu Nhập (6) ]`.
3. Người dùng có thể:
   - Bấm vào một danh mục để **Đổi tên**, **Đổi Icon**, **Đổi Màu**.
   - Gạt công tắc để **Ẩn bớt** danh mục không dùng (danh mục ẩn sẽ không hiện khi chụp ảnh).
   - Bấm nút `[ + Thêm danh mục mới ]` ở đáy màn hình.

### Flow 2: Tạo Nhanh Danh Mục Ngay Khi Ghi Chép (Bottom Sheet Shortcut)
1. Người dùng chụp ảnh xong hoặc quét QR ➔ Thẻ xác nhận mở ra.
2. Tại hàng cuộn danh mục, ở cuối danh sách luôn có nút pill `[ + Mới ]`.
3. Bấm vào `[ + Mới ]` ➔ Mở modal mini nhập nhanh Tên + Chọn 1 Icon + Chọn 1 Màu trong 3 giây.
4. Bấm `Lưu` ➔ Danh mục mới tự động được chọn ngay cho giao dịch hiện tại và được lưu vĩnh viễn vào hệ thống.

---

## 5. RÀNG BUỘC TOÀN VẸN DỮ LIỆU & AN TOÀN

1. **Chống Xóa Oan Uổng (Soft Delete Guard):**
   - Không cho phép xóa cứng (Hard Delete) danh mục nếu đã có ít nhất 1 giao dịch trong lịch sử đang sử dụng danh mục đó.
   - Thay vào đó, app chuyển trạng thái thành `isActive = false` (Ẩn khỏi danh sách chọn mới, nhưng vẫn hiển thị đúng tên và icon trong các báo cáo lịch sử cũ).
2. **Hỗ Trợ Chế Độ Khách (Guest Mode) & Đám Mây (Supabase):**
   - Với người dùng chưa đăng nhập: Lưu trữ toàn bộ danh mục tùy biến trong `AsyncStorage` / `categoryStore`.
   - Với người dùng đã đăng nhập: Đồng bộ 2 chiều với bảng `categories` trên Supabase có RLS (`auth.uid() = user_id`).
3. **Hiệu Năng $\le 100$ms:**
   - Bộ danh mục được nạp sẵn vào RAM thông qua Zustand Store, đảm bảo mở khung ngắm Camera hay mở Bottom Sheet không có độ trễ.
