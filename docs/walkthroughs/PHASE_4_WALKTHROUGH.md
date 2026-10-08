# 🍂 WALKTHROUGH BÁO CÁO: PHASE 4 — GIỎ CHỜ CẢN GẮT & CẢNH BÁO DỒN DẬP (1H-24H)

> **Dự án:** Ví Locket — Mobile App Chi Tiêu Bằng Ảnh & Giọng Nói  
> **Giai đoạn:** Phase 4 trong [docs/PHASES.md](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/docs/PHASES.md)  
> **Trạng thái:** ✅ ĐÃ HOÀN THÀNH TOÀN DIỆN (100%)  
> **Ngày hoàn thành:** 01/10/2026  

---

## 1. TỔNG QUAN CÁC TASK ĐÃ HOÀN THÀNH

| Task | Hạng mục thực hiện | Trạng thái | Minh chứng kỹ thuật |
| :--- | :--- | :---: | :--- |
| **Task 4.1** | Hệ thống thông báo dồn dập với Expo Notifications | ✅ Đạt | [notifications.ts](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/src/services/notifications.ts) |
| **Task 4.2** | Giao diện Giỏ Chờ Cản Gắt (Wait Basket Screen) | ✅ Đạt | [wait-basket.tsx](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/app/(main)/wait-basket.tsx) |
| **Task 4.3** | Nút lối tắt Giỏ Chờ trên Viewfinder Camera | ✅ Đạt | [index.tsx](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/app/(main)/index.tsx) |
| **Task 4.4** | Tích hợp xử lý Quyết định: Thôi Cứu Ví vs Vẫn Mua | ✅ Đạt | [waitBasketStore.ts](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/src/store/waitBasketStore.ts) & [budgetStore.ts](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/src/store/budgetStore.ts) |
| **Task 4.5** | Kiểm thử xác thực Logic và TypeScript Compile | ✅ Đạt | `scripts/test-wait-basket-logic.js` & `npx tsc --noEmit` (0 error) |

---

## 2. MINH CHỨNG HOẠT ĐỘNG & KẾT QUẢ KIỂM THỬ

### 2.1. Nhịp Điệu Cản Gắt (Aggressive Reminder Cadence)
Dựa trên quyết định thống nhất trong đợt phỏng vấn `/grill-me`, việc chờ 24h là quá lâu với cơn nghiện mua sắm tức thời. Do đó, hệ thống lên lịch 4 mốc thông báo dồn dập:
- **Mốc 1: Sau 1 giờ** — *"🍂 Cơn thèm mua đã nguội bớt chưa bạn?"* (Đánh thẳng vào lúc dopamine bắt đầu hạ nhiệt).
- **Mốc 2: Sau 3 giờ** — *"⏳ 3 tiếng trôi qua rồi..."* (Nhắc nhở nhẹ nhàng về mục tiêu lớn và số giờ làm việc).
- **Mốc 3: Sau 6 giờ** — *"✨ Đã nửa ngày trôi qua, vẫn ổn chứ?"* (Kiểm tra lại xem món đồ còn thực sự cấp thiết).
- **Mốc 4: Sau 24 giờ** — *"🏆 Chúc mừng 24 giờ kiên định!"* (Khoảnh khắc chiến thắng hoặc quyết định mua tỉnh táo).

Khi người dùng bấm **"Thôi cứu ví"** hoặc **"Vẫn mua"**, toàn bộ các thông báo chờ của món đồ đó được hủy ngay lập tức thông qua hàm `cancelItemReminders(notificationIds)`.

### 2.2. Giao diện Giỏ Chờ (`app/(main)/wait-basket.tsx`)
- **Header:** Nền Sữa Ngà `#FAF6F0`, tiêu đề thơ mộng phong cách Hà Nội Thu Đông.
- **Hero Card:** Thẻ Giấy Dó viền Nắng Thu `#E59844` nổi bật tổng số tiền đang được cản gắt: `[X] món đang cản - [Y] đ đang giữ lại`.
- **Card Món Đồ Đang Chờ:**
  - Ảnh Polaroid món đồ bo góc 14px.
  - Tag đếm ngược thời gian động: `⏳ Còn 2h 15p`.
  - Phân tích thực tế tóm tắt: Đổi ra số cốc cà phê hoặc ngày ngân sách.
  - 2 nút hành động trực tiếp:
    - 🍃 **Thôi, cứu ví!** (Màu Cốm Mint `#7E9F80`): Cộng ngay số tiền vào **"Tiền Đã Cứu"** (`totalSaved`), kích hoạt pháo hoa lá vàng rơi 🌼🍂.
    - 🛒 **Vẫn mua** (Nút phụ): Chuyển thành giao dịch chi tiêu thực tế, ghi vào sổ.
- **Lịch sử chiến thắng (Đã cứu ví):** Danh sách các món đồ người dùng đã cưỡng lại thành công kèm huy hiệu thời gian.

### 2.3. Lối tắt nhanh trên Viewfinder Camera (`app/(main)/index.tsx`)
- Nút bấm tròn với hiệu ứng kính mờ `FrostedPill` đặt tại góc trên bên phải màn hình Camera.
- Badge số lượng màu Nắng Thu Gold hiển thị số món đang trong giỏ chờ: `⏳ [count]`.
- Chạm vào mở tức thì Modal Giỏ Chờ.

### 2.4. Kết quả Kiểm thử (Verification Evidence)
1. **Biên dịch TypeScript:**
   ```bash
   npx tsc --noEmit
   # Exit code: 0 (Không phát hiện bất kỳ lỗi kiểu dữ liệu nào)
   ```
2. **Kiểm thử logic thời gian & giỏ chờ:**
   ```bash
   node scripts/test-wait-basket-logic.js
   # ✅ Aggressive reminder stages passed (4 stages: 1h, 3h, 6h, 24h)
   # ✅ Time left formatting passed
   # ✅ Pending items count and sum passed
   # 🎉 ALL PHASE 4 LOGIC TESTS PASSED SUCCESSFULLY!
   ```

---

## 3. CÁC QUYẾT ĐỊNH KIẾN TRÚC & UX

1. **Local-First Notifications:** Sử dụng `expo-notifications` với local scheduled trigger theo timestamp thay vì phụ thuộc hoàn toàn vào server push notification. Đảm bảo app hoạt động trơn tru ngay cả khi offline hoặc đi vào vùng sóng yếu (quán cafe hầm, thang máy).
2. **Auto Cleanup Notification IDs:** Khi một món đồ trong giỏ chờ được giải quyết (người dùng chọn Thôi hoặc Mua), ID của các thông báo đã lên lịch lập tức được giải phóng qua `Notifications.cancelScheduledNotificationAsync`.
3. **Hero Metric Loop:** Khi người dùng bấm "Thôi cứu ví", hành động này lập tức gọi `budgetStore.getState().recordSavedMoney(amount)`, làm tăng con số tự hào "Tiền Đã Cứu" trên Thẻ Ngân Sách Hà Nội.

---

## 4. KẾ HOẠCH BÀN GIAO CHO PHASE KẾ TIẾP (PHASE 5)

Phase 4 đã hoàn tất xuất sắc và toàn vẹn. Sẵn sàng tiến vào **Phase 5: Sổ Chi Tiêu Locket Calendar, Gallery Grid & Rollover 100%** (Milestone cuối cùng của M0).
- Lập Implementation Plan chi tiết cho Phase 5.
- Xây dựng màn hình [app/(main)/journal.tsx](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/app/(main)/journal.tsx) gồm:
  1. **Bộ Lịch Ảnh Tháng (Calendar View):** Lưới 7 cột (T2-CN) với ảnh chụp món đồ thu nhỏ và badge số lượng `+1, +2` (từ ảnh tham chiếu 1).
  2. **Lưới Ảnh 3 Cột (Gallery Grid View):** Cuộn album ảnh chi tiêu với tag giá mờ đè chân ảnh (từ ảnh tham chiếu 2).
  3. **Thẻ Ngân Sách Giấy Dó (Autumn Budget Card):** Thanh tiến độ và 4 chỉ số tài chính, hiển thị rõ quy tắc Rollover 100% (từ ảnh tham chiếu 3).
