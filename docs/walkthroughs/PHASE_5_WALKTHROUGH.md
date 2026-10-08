# 🍂 WALKTHROUGH BÁO CÁO: PHASE 5 — SỔ CHI TIÊU LOCKET, NGÂN SÁCH ROLLOVER & TIỀN ĐÃ CỨU

> **Dự án:** Ví Locket — Mobile App Chi Tiêu Bằng Ảnh & Giọng Nói  
> **Giai đoạn:** Phase 5 (Hoàn thiện vòng lặp M0 theo [docs/PHASES.md](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/docs/PHASES.md))  
> **Trạng thái:** ✅ ĐÃ HOÀN THÀNH TOÀN DIỆN (100%)  
> **Ngày hoàn thành:** 01/10/2026  

---

## 1. TỔNG QUAN CÁC TASK ĐÃ HOÀN THÀNH

| Task | Hạng mục thực hiện | Trạng thái | Minh chứng kỹ thuật |
| :--- | :--- | :---: | :--- |
| **Task 5.1** | Bộ Lịch Ảnh Tháng Locket (`LocketCalendarView`) | ✅ Đạt | [LocketCalendarView.tsx](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/src/components/journal/LocketCalendarView.tsx) |
| **Task 5.2** | Lưới Ảnh Chi Tiêu 3 Cột (`GalleryGridView`) | ✅ Đạt | [GalleryGridView.tsx](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/src/components/journal/GalleryGridView.tsx) |
| **Task 5.3** | Thẻ Ngân Sách Giấy Dó (`AutumnBudgetCard`) | ✅ Đạt | [AutumnBudgetCard.tsx](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/src/components/budget/AutumnBudgetCard.tsx) |
| **Task 5.4** | Quản lý Giao Dịch & Khởi tạo Seed Data Hà Nội | ✅ Đạt | [transactionStore.ts](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/src/store/transactionStore.ts) |
| **Task 5.5** | Màn hình Sổ Chi Tiêu Tổng Hợp & Điều Hướng | ✅ Đạt | [journal.tsx](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/app/(main)/journal.tsx) & [index.tsx](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/app/(main)/index.tsx) |
| **Task 5.6** | Kiểm thử Rollover 100% & TypeScript Compilation | ✅ Đạt | `scripts/test-phase5-rollover-journal.js` & `npx tsc --noEmit` (0 error) |

---

## 2. MINH CHỨNG HOẠT ĐỘNG & CHI TIẾT TRẢI NGHIỆM

### 2.1. Bộ Lịch Ảnh Tháng Locket (`LocketCalendarView.tsx`)
- **Khung lưới 7 cột (T2 $\rightarrow$ CN):** Hiển thị trực quan từng ngày trong tháng với định dạng lưới vuông chuẩn mực.
- **Visual Locket chân thực:** Mỗi ô ngày có giao dịch sẽ thu nhỏ ảnh chụp món đồ đầu tiên vào khung ảnh bo góc 10px.
- **Badge số lượng nổi (`+1`, `+2`...):** Khi một ngày có nhiều chi tiêu, badge vàng nắng xuất hiện ở góc dưới để báo hiệu cho người dùng.
- **Chấm chỉ báo "Hôm nay":** Dấu chấm xanh Cốm Làng Vòng nhẹ nhàng dưới con số ngày hiện tại.
- **Tương tác chọn ngày:** Chạm vào bất kỳ ngày nào để xem danh sách chi tiết các món đã chi/thu kèm ảnh, phân loại và hình thức thanh toán (Tiền mặt / Chuyển khoản).

### 2.2. Lưới Ảnh Chi Tiêu 3 Cột (`GalleryGridView.tsx`)
- **Tỷ lệ 1:1 chuẩn Locket:** Cuộn mượt mà các khoảnh khắc chi tiêu đời sống (ly cafe trứng, bát phở bò, áo len mùa đông...).
- **Tag giá nổi (Floating Price Tag):**
  - Giao dịch chi tiêu: Tag đen mờ 75% với giá tiền trắng tinh tế (VD: `45k`, `280k`).
  - Giao dịch thu nhập: Tag xanh cốm mint với dấu `+` tự hào (VD: `+2.5 củ`).
- **Xem chi tiết Polaroid:** Chạm vào bất kỳ ảnh nào để mở khung ảnh Polaroid phóng to với thông tin địa điểm, thời gian ghi nhận (VD: `15:30 • 01/10/2026`) và số tiền rõ ràng.

### 2.3. Thẻ Ngân Sách Giấy Dó (`AutumnBudgetCard.tsx`)
- **Phong cách mỹ thuật Hà Nội:** Thẻ mang chất liệu giấy dó cổ điển `#F7F3EB`, viền ấm áp và vệt trang trí Nắng Thu.
- **4 chỉ số cốt lõi định dạng `fontVariant: ['tabular-nums']`:**
  1. `[Hôm nay còn lại]`: Con số lớn nổi bật đổi màu linh hoạt theo mức độ an toàn.
  2. `[Số dư thực]`: Tổng tiền thực tế trong ví/tài khoản.
  3. `[Mỗi ngày chuẩn]`: Hạn mức gốc chia đều theo ngày.
  4. `[Tiền đã cứu ✨]`: Hero metric màu cốm mint tôn vinh mỗi lần kiềm chế thành công.
- **Thanh tiến độ mùa thu 3 màu:**
  - `< 70%`: Xanh Cốm Làng Vòng (*🌾 Thu Vàng Dịu Êm*).
  - `70% - 95%`: Nắng Thu Vàng (*🍁 Nắng Thu Nhẹ Bước*).
  - `> 95%`: Ngói Rêu Phố Cổ (*🍂 Khói Chiều Co Kéo*).
- **Ghi chú Rollover 100%:** Hiển thị rõ số tiền dư/lố được dồn sang ngày hôm nay.

### 2.4. Kết quả kiểm thử thực tế (Verification Evidence)
1. **Biên dịch TypeScript:**
   ```bash
   npx tsc --noEmit
   # Exit code: 0 (Hoàn toàn sạch lỗi)
   ```
2. **Kiểm thử hồi quy toàn bộ dự án:**
   ```bash
   node scripts/test-budget-logic.js
   node scripts/test-reality-calc.js
   node scripts/test-wait-basket-logic.js
   node scripts/test-phase5-rollover-journal.js
   
   # ✅ Rollover Case A (Surplus 100%): 100k + 60k = 160.000đ PASS
   # ✅ Rollover Case B (Deficit reduction): 100k - 50k = 50.000đ PASS
   # ✅ Rollover Case C (Floor safety 20k): Floor 20.000đ PASS
   # ✅ Calendar Day Aggregation: 2 items, 110.000đ total spent, thumbnail captured PASS
   # ✅ Calendar Day Income Aggregation: +2.000.000đ PASS
   # 🎉 ALL TESTS PASSED SUCCESSFULLY!
   ```

---

## 3. CÁC QUYẾT ĐỊNH KIẾN TRÚC & DỮ LIỆU ĐÃ ĐƯA RA

1. **Đồng bộ 2 chiều giữa Sổ Giao Dịch & Ngân Sách:** Khi một giao dịch được lưu qua `ConfirmationSheet` hoặc nút "Vẫn mua" trên Thẻ Phán Quyết/Giỏ Chờ, hàm `transactionStore.addTransaction()` lập tức cập nhật danh sách và tự động gọi `budgetStore.recordExpense()` / `budgetStore.recordIncome()`.
2. **Tự Động Khởi Tạo Dữ Liệu Trải Nghiệm Mẫu (Seed Data):** Đối với tài khoản mới hoặc chế độ Demo "Lâm Lơ", app tự động nạp sẵn 7 giao dịch mùa thu Hà Nội đẹp mắt với hình ảnh độ nét cao để người dùng trải nghiệm ngay visual Locket mà không phải đối mặt với màn hình trống rỗng.
3. **Rollover Giữ Sàn An Toàn 20.000đ:** Tránh tình trạng người dùng lỡ tiêu quá đà một hôm khiến ngân sách hôm sau về 0đ hoặc âm, dẫn đến từ bỏ ứng dụng.

---

## 4. TỔNG KẾT MILESTONE M0 (LÕI SẢN PHẨM VÍ LOCKET)

Với việc hoàn thành Phase 5, **toàn bộ 6 Phase của Milestone M0 (Phase 0 $\rightarrow$ Phase 5)** đã được xây dựng trọn vẹn:
- 🌸 **Phase 0:** Thiết lập dự án Expo SDK 52, Design System Hà Nội Thu Đông & Kiến trúc cơ sở dữ liệu Supabase.
- 🔑 **Phase 1:** Xác thực OTP & Wizard thiết lập ngân sách cơ sở, tính hạn mức ngày.
- 📷 **Phase 2:** Viewfinder Camera máy film 4:5, Shutter bấm chụp - giữ nói giá & Gemini Voice NLP Engine.
- ⚖️ **Phase 3:** Thẻ Phán Quyết Bưu Thiếp Hà Nội, Anti-FOMO Roast Engine, Reality Check & Pháo hoa Cúc họa mi cứu ví.
- ⏳ **Phase 4:** Giỏ Chờ Cản Gắt & Hệ thống thông báo dồn dập 4 mốc (1h, 3h, 6h, 24h).
- 📅 **Phase 5:** Sổ Chi Tiêu Locket Calendar, Lưới Ảnh 3 Cột, Thẻ Ngân Sách Giấy Dó & Thuật toán Rollover 100%.
