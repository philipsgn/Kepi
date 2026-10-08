# 📋 ĐẶC TẢ MÀN HÌNH: HỒ SƠ (PROFILE.MD)

> **Mã màn hình:** `PROFILE` (Tab 5, Index 4 trong thanh điều hướng 5 trang)  
> **Tên màn hình:** Hồ Sơ (Cá Nhân Hóa, Mục Tiêu & Cài Đặt Dữ Liệu)  
> **Trạng thái:** Chờ Chủ Dự Án Duyệt (Giai đoạn A)  
> **Phiên bản:** 1.0  
> **Lần cập nhật cuối:** 2026-10-02  

---

## 1. Mục Tiêu & Người Dùng
- **User Story:** Là một người dùng quản lý tài chính cá nhân bằng Ví Locket, tôi muốn **có một nơi duy nhất để thiết lập mục tiêu tương lai, khai báo thu nhập - chi phí cố định, tùy biến tính cách của Anh Minh AI, và toàn quyền kiểm soát dữ liệu/quyền riêng tư**, để ứng dụng vận hành chuẩn xác theo hoàn cảnh thực tế của riêng tôi.
- **Mục tiêu sản phẩm:**
  - **Cá nhân hóa tài chính:** Biến các con số vô hồn thành câu chuyện cá nhân thông qua Mục tiêu 4 trường (Mục đích, Số tiền, Hạn chót, Lý do) và Đơn vị quy đổi yêu thích (ly cà phê, bát phở, cốc trà sữa).
  - **Thiết lập công thức chuẩn:** Cung cấp đầu vào (Thu nhập - Chi phí cố định) để các trang Home, Thống kê, Camera và Chat tự động tính toán đồng bộ hạn mức "Hôm nay tiêu được".
  - **Toàn quyền dữ liệu & Quyền riêng tư:** Cho phép ẩn tiền toàn app (`••••`), xóa toàn bộ dữ liệu một chạm và xóa tài khoản in-app theo quy chuẩn bắt buộc của Apple Store Review.
- **Tiêu chí thành công đo được (Success Metrics):**
  1. Người dùng cập nhật mục tiêu/chi cố định $\rightarrow$ Trang Home và Thống kê cập nhật tức thì trong < 100ms.
  2. Bật công tắc "Ẩn tiền" $\rightarrow$ 100% số tiền tại cả 5 trang chuyển thành `••••` không lộ bất kỳ con số nào.
  3. Đạt chuẩn Apple Store Review Guideline 5.1.1(v) về nút Xóa tài khoản in-app với luồng xác thực 2 bước an toàn.

---

## 2. Wireframe Chữ (ASCII Wireframe)

```text
┌────────────────────────────────────────────────────────┐
│ HỒ SƠ                                       [Phiên bản]│
├────────────────────────────────────────────────────────┤
│ ┌ THẺ ĐẦU TRANG: NGƯỜI ĐỒNG HÀNH ────────────────────┐ │
│ │  ┌────┐                                            │ │
│ │  │ 👤 │  Hoàng Long                                │ │
│ │  └────┘  ID: #dev-8821 · Tham gia 14 ngày          │ │
│ │  ┌──────────────┬──────────────┬────────────────┐  │ │
│ │  │ 12 ngày      │ 640.000 đ    │ 42 món         │  │ │
│ │  │ Chuỗi ghi    │ Đã giữ lại   │ Đã chụp        │  │ │
│ │  └──────────────┴──────────────┴────────────────┘  │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌ 1. MỤC TIÊU CỦA BẠN ────────────────────── [Sửa] ──┐ │
│ │ 🎯 Chuyến đi Sa Pa mùa đông                         │ │
│ │ Tiến độ: 4.200.000 đ / 15.000.000 đ (28%)          │ │
│ │ ▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░                 │ │
│ │ 📅 Hạn chót: 31/12/2026                            │ │
│ │ 💭 "Tự thưởng sau một năm nỗ lực cày cuốc"         │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌ 2. ĐỊNH MỨC & THU CHI ĐỊNH KỲ ─────────────────────┐ │
│ │ • Thu nhập tháng:              15.000.000 đ         │ │
│ │ • Chi phí cố định (nhà, xe...): 6.000.000 đ         │ │
│ │ • Hôm nay tiêu được cơ bản:       120.000 đ / ngày  │ │
│ │ • Quy đổi quen thuộc:           [☕ Ly cà phê (40k)]│ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌ 3. HUẤN LUYỆN VIÊN ANH MINH ───────────────────────┐ │
│ │ • Mức thẳng thắn:  [ Nhẹ nhàng ] [ Vừa ] [ Thẳng ] │ │
│ │ • Cách xưng hô:    [ Anh - Bạn ] [ Anh - Em ]      │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌ 4. QUYỀN RIÊNG TƯ & BẢO MẬT ───────────────────────┐ │
│ │ • Ẩn số tiền trên mọi màn hình:         [ BẬT / TẮT ]│ │
│ │ • Khóa Face ID / Mã PIN:              [ M1 Sắp có ]│ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌ 5. DỮ LIỆU & TÀI KHOẢN ────────────────────────────┐ │
│ │ [ 🗑️ Xóa toàn bộ dữ liệu một chạm ]                 │ │
│ │ [ ⚠️ Xóa tài khoản vĩnh viễn (Apple Review) ]      │ │
│ │ [ 🚪 Đăng xuất ]                                    │ │
│ └────────────────────────────────────────────────────┘ │
│                Ví Locket v1.0.0 (M0 Build 42)          │
└────────────────────────────────────────────────────────┘
```

---

## 3. Cấu Trúc Khối Giao Diện Chi Tiết (Component Hierarchy & Specs)

### 3.1. Thẻ Đầu Trang: Người Đồng Hành (`ProfileIdentityCard.tsx`)
- **Avatar khối vuông:** Khối vuông 56x56px viền đen 2px, nền vàng `#FFC800`, biểu tượng cá nhân hoặc chữ cái đầu.
- **Tên hiển thị & Chạm để sửa:** Chạm vào tên mở popup nhập nhanh biệt danh mới.
- **Dải 3 chỉ số tóm tắt (3-Stat Mini Strip):**
  1. *Chuỗi ghi (Streak):* Số ngày liên tiếp có phát sinh ghi chép chi tiêu.
  2. *Đã giữ lại (Total Saved):* Tổng số tiền đã bấm "Không mua" từ màn Giá thật hoặc chat.
  3. *Đã ghi (Total Entries):* Tổng số giao dịch đã lưu vào sổ.

### 3.2. Khối Mục Tiêu Tài Chính 4 Trường (`GoalSectionCard.tsx`)
- **Chế độ hiển thị (Display Mode):**
  - Tên mục tiêu + Icon đích ngắm (Target icon).
  - Thanh tiến trình tích lũy: Thước đo chia ô hoặc dải tỷ lệ phần trăm với viền đen sắc nét.
  - Hạn chót (Deadline) đếm ngược ngày.
  - Câu lý do truyền động lực (Motivation Quote).
- **Chế độ chỉnh sửa (Edit Modal/Sheet):**
  - Trường 1: **Mục đích** (Text input: "Chuyến đi Sa Pa mùa đông").
  - Trường 2: **Số tiền cần tích lũy** (Numeric input: "15.000.000 đ").
  - Trường 3: **Hạn chót** (Date picker / Chọn tháng năm kết thúc).
  - Trường 4: **Lý do / Ý nghĩa** (Text area: "Tự thưởng sau một năm nỗ lực").

### 3.3. Khối Định Mức & Thu Chi Cố Định (`BudgetSettingsCard.tsx`)
- **Thu nhập hàng tháng:** Mức lương hoặc thu nhập trung bình một tháng.
- **Chi phí cố định:** Tiền thuê nhà, trả góp, điện nước, internet đóng cố định mỗi tháng.
- **Tự động suy ra Định mức cơ bản ngày:**
  $$\text{Base Daily Budget} = \frac{\text{Thu Nhập} - \text{Chi Cố Định} - \text{Tích Lũy Mục Tiêu}}{\text{Số Ngày Trong Tháng}}$$
- **Bộ chọn Đơn vị quy đổi yêu thích (Favorite Unit Pill Selector):**
  - `☕ Ly cà phê (40.000 đ)`
  - `🧋 Ly trà sữa (35.000 đ)`
  - `🍜 Bát phở bò (50.000 đ)`
  *(Dùng để hiển thị câu nói của Anh Minh và màn Giá thật: "Khoản này bằng 3 ly cà phê").*

### 3.4. Khối Huấn Luyện Viên Anh Minh (`CoachSettingsCard.tsx`)
- **Bộ chuyển 3 mức thẳng thắn (Directness Switcher):**
  - `Nhẹ nhàng`: Động viên là chính, hạn chế dùng từ cảnh báo gắt gỏng.
  - `Vừa phải` (Mặc định): Điềm đạm, khen khi giữ ngân sách tốt, nhắc nhở chừng mực khi tiêu lố.
  - `Thẳng thắn`: Phản biện sắc bén, hỏi thẳng lý do cần mua, nhấn mạnh vào mục tiêu dài hạn.
- **Cách xưng hô:**
  - `anh - bạn` (Mặc định).
  - `anh - em`.
  - `Minh - tôi`.

### 3.5. Khối Quyền Riêng Tư & An Toàn (`PrivacySecurityCard.tsx`)
- **Công tắc "Ẩn tiền toàn ứng dụng" (Hide Balances Everywhere):**
  - Lưu vào `useBudgetStore` / AsyncStorage `vi_locket_hide_money`.
  - Khi bật: Tất cả các số tiền ở Home, Thống kê, Camera, Chat, Hồ sơ đều hiển thị `••••`.
- **Thẻ giới thiệu "Khóa Face ID / PIN" `[M1]`:**
  - Nhãn badge mờ `[Sắp ra mắt ở M1]`.

### 3.6. Khối Dữ Liệu & Quản Trị Tài Khoản (`DataManagementCard.tsx`)
- **Xóa toàn bộ dữ liệu một chạm (Reset All Data):**
  - Hộp thoại cảnh báo 2 bước:
    - Bước 1: "Toàn bộ ảnh, lịch sử và mục tiêu sẽ bị xóa vĩnh viễn trên thiết bị này. Bạn có chắc không?"
    - Bước 2: Nhập số "1234" hoặc gõ chữ "XÓA" để xác nhận chắc chắn.
  - Sau khi xóa: Đưa toàn bộ store về trạng thái khởi tạo trắng, xóa cache ảnh cục bộ.
- **Xóa tài khoản in-app (Apple Store Guideline 5.1.1(v)):**
  - Xóa phiên đăng nhập Supabase Auth + dữ liệu trên server Supabase.
### 3.7. Khối Quản Lý Danh Mục Tùy Biến (`CategorySettingsCard.tsx` / `CategoryManagementSheet.tsx` — M2)
- **Vị trí:** Nằm trong nhóm cài đặt tài chính cá nhân.
- **Phân tách 2 luồng:**
  - Tab 1: **Danh mục Chi Tiêu** (Ăn uống, Nhà cửa, Xe cộ, Thuốc men, Cho mẹ, Nuôi pet, Quần áo, Học tập...).
  - Tab 2: **Danh mục Thu Nhập** (Tiền lương, Tiền thưởng, Được cho/biếu, Đầu tư, Bán đồ cũ...).
- **Chức năng tương tác:**
  - *Thêm mới:* Nút `+ Thêm danh mục mới` mở Bottom Sheet cho phép nhập Tên danh mục, chọn Icon từ danh mục Vector Icons `lucide-react-native`, và chọn mã màu đại diện.
  - *Chỉnh sửa:* Bấm vào danh mục để đổi tên hoặc thay icon.
  - *Ẩn/Hiện / Xóa:* Cho phép ẩn danh mục không còn sử dụng hoặc xóa (nếu chưa có giao dịch ràng buộc).
- **Đồng bộ thời gian thực:** Cập nhật ngay lập tức vào bộ chọn danh mục trên Camera Viewfinder, Bottom Sheet ghi chép và bộ lọc Thống Kê.

---

## 4. Quy Chuẩn & Logic Nghiệp Vụ

### 4.1. Công thức Tự Động Đồng Bộ Định Mức Ngày
- Khi người dùng thay đổi bất kỳ trường nào trong nhóm: Thu nhập tháng, Chi cố định, Số tiền mục tiêu:
  $$\text{Số tiền khả dụng tháng} = \max(0, \text{Thu Nhập} - \text{Chi Cố Định})$$
  $$\text{Định mức ngày} = \text{round}\left(\frac{\text{Số tiền khả dụng}}{\text{Số ngày của tháng hiện tại}}, -3\right)$$
- Cập nhật trực tiếp vào `useBudgetStore.baseDailyBudget` và `todayBudget`.

### 4.2. Cơ chế "Ẩn Tiền Toàn Ứng Dụng"
- Được quản lý tập trung qua thuộc tính `isMasked` trong store hoặc hook `useDisplayCurrency(amount)`.
- Khi `isMasked === true`:
  - Trả về chuỗi `"••••"` hoặc `"•••• đ"`.
  - Các biểu đồ cột vẫn hiển thị độ cao tương đối nhưng nhãn số ở đỉnh chuyển thành `••••`.

### 4.3. Tuân Thủ Chuẩn Apple Store Review (Account & Data Deletion)
- Apple yêu cầu ứng dụng có tạo tài khoản thì bắt buộc phải có tính năng xóa tài khoản trực tiếp trong ứng dụng.
- Luồng xóa:
  1. Người dùng bấm "Xóa tài khoản".
  2. Xuất hiện Sheet xác nhận giải thích rõ: Tài khoản, ảnh chụp trên Cloud và lịch sử chi tiêu sẽ bị xóa vĩnh viễn không thể khôi phục.
  3. Bấm xác nhận $\rightarrow$ Gọi API `deleteUser()` / Edge Function xóa Supabase Auth $\rightarrow$ Xóa AsyncStorage $\rightarrow$ Đẩy người dùng về màn hình Chào mừng.

---

## 5. Ma Trận Trạng Thái (State Matrix)

| Trạng Thái | Điều Kiện | Giao Diện Hiển Thị | Hành Vi Người Dùng |
| :--- | :--- | :--- | :--- |
| **Bình thường** | Đã thiết lập mục tiêu & thu nhập | Hiển thị đầy đủ thông tin, tiến độ đạt % có màu sắc trực quan | Cuộn xem, chạm "Sửa" nếu muốn đổi mục tiêu |
| **Chưa đặt mục tiêu** | `goalTargetAmount === 0` | Thẻ Mục tiêu hiển thị banner khuyến khích: "Đặt mục tiêu đầu tiên để cùng Anh Minh tích lũy!" | Chạm "Tạo mục tiêu" |
| **Đang sửa mục tiêu** | Bấm nút "Sửa" | Mở Bottom Sheet 4 trường dữ liệu kèm nút Lưu và Hủy | Điền form và bấm "LƯU MỤC TIÊU" |
| **Bật Ẩn tiền** | Công tắc chuyển sang BẬT | Mọi con số số dư thực, tiền giữ lại chuyển thành `••••` | Tắt công tắc để xem lại số tiền |
| **Yêu cầu xóa dữ liệu**| Bấm "Xóa toàn bộ dữ liệu" | Popup cảnh báo nền đỏ gạch ngói, yêu cầu xác thực bước 2 | Hủy bỏ hoặc gõ mã xác nhận xóa |

---

## 6. Tương Tác & Cử Chỉ (Interactions & Gestures)
- **Chạm tên người dùng:** Mở ô gõ văn bản tại chỗ (Inline Edit) hoặc dialog đổi biệt danh.
- **Chạm nút "Sửa mục tiêu":** Mở Sheet chỉnh sửa với các ô nhập liệu số tự động thêm dấu chấm ngăn cách nghìn (`15.000.000`).
- **Gạt chọn mức thẳng thắn của Anh Minh:** Chuyển đổi tức thì dạng tab pill 3 nấc, có rung phản hồi xúc giác nhẹ (`selectionAsync`).
- **Bật/Tắt công tắc Ẩn tiền:** Phản hồi xúc giác `impactAsync(Light)`, toàn bộ số tiền trên màn hình đổi ngay lập tức.

---

## 7. Chuyển Động & Hoạt Họa (Motion & Animation)
- **Thanh tiến trình mục tiêu:** Nạp đầy dạng Spring easing (`stiffness: 120, damping: 15`) khi mở màn hình.
- **Chuyển nấc mức thẳng thắn:** Nền khối vàng trượt ngang 150ms sắc sảo phong cách tactile.
- **Sheet chỉnh sửa mục tiêu:** Trượt từ dưới đáy lên mượt mà theo chuẩn iOS Modal Sheet.

---

## 8. Bảng Từ Ngữ (String Dictionary)

*Bổ sung/cập nhật vào `src/constants/strings.ts`:*

| Khóa Chuỗi | Giá Trị Tiếng Việt Hiển Thị | Ngữ Cảnh Sử Dụng |
| :--- | :--- | :--- |
| `profile.title` | `"HỒ SƠ"` | Tiêu đề đầu trang |
| `profile.streakDays` | `(days: number) => "${days} ngày liên tiếp"` | Huy hiệu chuỗi ngày |
| `profile.savedTotal` | `"Tổng đã giữ lại"` | Nhãn tiền tiết kiệm |
| `profile.entriesCount` | `(count: number) => "${count} món đã ghi"` | Nhãn số giao dịch |
| `profile.goalSectionTitle` | `"MỤC TIÊU CỦA BẠN"` | Tiêu đề nhóm mục tiêu |
| `profile.goalNameLabel` | `"Mục đích"` | Tên mục tiêu |
| `profile.goalTargetLabel` | `"Số tiền cần tích lũy"` | Số tiền đích |
| `profile.goalDeadlineLabel` | `"Hạn chót hoàn thành"` | Hạn ngày |
| `profile.goalReasonLabel` | `"Lý do / Ý nghĩa"` | Động lực |
| `profile.budgetSectionTitle` | `"ĐỊNH MỨC & THU CHI"` | Tiêu đề nhóm định mức |
| `profile.monthlyIncome` | `"Thu nhập hàng tháng"` | Thu nhập |
| `profile.fixedCosts` | `"Chi phí cố định (nhà, điện...)"` | Chi cố định |
| `profile.favUnitLabel` | `"Đơn vị quy đổi yêu thích"` | Quy đổi |
| `profile.coachSectionTitle` | `"HUẤN LUYỆN VIÊN ANH MINH"` | Tiêu đề nhóm AI |
| `profile.coachTone` | `"Mức độ thẳng thắn"` | Tùy biến giọng điệu |
| `profile.toneGentle` | `"Nhẹ nhàng"` | Mức 1 |
| `profile.toneBalanced` | `"Vừa phải"` | Mức 2 |
| `profile.toneDirect` | `"Thẳng thắn"` | Mức 3 |
| `profile.privacySectionTitle`| `"QUYỀN RIÊNG TƯ & BẢO MẬT"` | Tiêu đề nhóm riêng tư |
| `profile.maskMoney` | `"Ẩn số tiền trên mọi màn hình"`| Công tắc ẩn tiền |
| `profile.dataSectionTitle` | `"DỮ LIỆU & TÀI KHOẢN"` | Tiêu đề nhóm dữ liệu |
| `profile.resetAllData` | `"Xóa toàn bộ dữ liệu trên máy"`| Nút xóa sạch dữ liệu |
| `profile.deleteAccount` | `"Xóa tài khoản vĩnh viễn"` | Nút xóa tài khoản Apple |
| `profile.signOut` | `"Đăng xuất"` | Nút đăng xuất |
| `profile.appVersion` | `(v: string) => "Ví Locket v${v}"` | Dòng phiên bản cuối trang |

---

## 9. Khả Năng Tiếp Cận (Accessibility — A11y)
- **VoiceOver / TalkBack:** Mọi thẻ nhóm đều có `accessibilityRole="header"`. Thanh tiến trình đọc rõ: *"Mục tiêu Chuyến đi Sa Pa, đã đạt 28 phần trăm, còn thiếu 10 triệu 800 nghìn đồng"*.
- **Vùng chạm tối thiểu:** Các nút Sửa, Chuyển nấc giọng điệu, Công tắc ẩn tiền đạt tối thiểu 44px x 44px.
- **Tương phản chuẩn WCAG AA:** Nhãn chữ xám ngà `#FAF6F0` trên nền thẻ tối `#1C1C22` đạt tỷ lệ tương phản 13:1.

---

## 10. Ngân Sách Hiệu Năng & Chi Phí (Performance & Storage)
- **Tốc độ lưu & phản hồi:** Lưu cài đặt mục tiêu và thu nhập vào AsyncStorage trong < 20ms.
- **Tiết kiệm pin:** Không chạy animation nền khi màn hình không active.
- **An toàn dữ liệu:** Thao tác "Xóa toàn bộ dữ liệu" bắt buộc dọn sạch cả AsyncStorage và thư mục ảnh tạm `expo-file-system`.

---

## 11. Kế Hoạch Kiểm Thử (Test Plan)
- **Unit Tests (`src/utils/__tests__/profileUtils.test.ts`):**
  - Test hàm tính toán định mức ngày dựa trên thu nhập, chi cố định và mục tiêu.
  - Test hàm tính tiến độ % mục tiêu (đảm bảo không bị chia cho 0, không vượt quá 100%).
  - Test hàm format tiền có ẩn số (`••••` khi `isMasked = true`).
- **Kiểm thử trên thiết bị thật:**
  - Đổi mục tiêu từ 10tr lên 20tr $\rightarrow$ Chuyển sang Home xem thanh tiến trình và hạn mức ngày có đổi tương ứng.
  - Bật công tắc Ẩn tiền $\rightarrow$ Lướt qua cả 4 tab còn lại (Home, Thống kê, Camera, Chat) xác nhận toàn bộ số tiền đều được che an toàn.
  - Thử nghiệm bấm nút Xóa toàn bộ dữ liệu để kiểm tra tính năng xác nhận 2 bước.

---

## 12. Tiêu Chí Nghiệm Thu (Acceptance Criteria — Đo Được)
1. [ ] Đầu trang hiển thị avatar khối vuông, tên người dùng, chuỗi ngày và tổng tiền đã giữ lại.
2. [ ] Thẻ mục tiêu có đủ 4 trường (Mục đích, Số tiền, Hạn chót, Lý do) và thanh tiến trình trực quan.
3. [ ] Có chức năng chỉnh sửa Thu nhập tháng & Chi phí cố định; công thức "Hôm nay tiêu được" cập nhật ngay.
4. [ ] Chọn được đơn vị quy đổi yêu thích (Cà phê / Trà sữa / Bát phở).
5. [ ] Bộ chuyển 3 mức thẳng thắn của Anh Minh AI hoạt động mượt mà.
6. [ ] Công tắc "Ẩn tiền toàn app" có tác dụng lên toàn bộ 5 màn hình.
7. [ ] Có 2 nút xử lý an toàn: "Xóa toàn bộ dữ liệu một chạm" (xác nhận 2 bước) và "Xóa tài khoản vĩnh viễn" chuẩn Apple Store.
8. [ ] Đạt chuẩn 0 error, 0 warning khi chạy `npm run lint` (`tsc --noEmit`).

---

## 13. Rủi Ro & Giải Pháp
- **Rủi ro:** Người dùng vô tình bấm nhầm "Xóa dữ liệu" hoặc "Xóa tài khoản" gây mất toàn bộ nhật ký chi tiêu.  
  - *Giải pháp:* Thiết kế hộp thoại xác nhận 2 tầng nghiêm ngặt (Double Confirmation Dialog); bắt buộc gõ mã hoặc chờ 3 giây trước khi nút Xác nhận sáng lên.
- **Rủi ro:** Khi người dùng nhập Thu nhập nhỏ hơn Chi phí cố định khiến Định mức ngày bị âm.  
  - *Giải pháp:* Khống chế sàn tối thiểu (Floor Guard) $\text{Base Daily Budget} \ge 20.000\text{ đ}$, hiển thị thông báo ân cần từ Anh Minh để hỗ trợ người dùng cân đối lại.
