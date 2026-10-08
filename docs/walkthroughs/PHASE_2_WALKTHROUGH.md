# 🍂 WALKTHROUGH BÁO CÁO: PHASE 2 — CAMERA MÙA ĐÔNG & THU ÂM GIỌNG NÓI AI

- **Dự án:** Ví Locket (Mobile App Chi Tiêu Ảnh & Giọng Nói — Vibe Hà Nội Thu Đông)
- **Giai đoạn:** Phase 2 (Camera Viewfinder & Voice-to-Data Pipeline)
- **Ngày hoàn thành:** 01/10/2026
- **Trạng thái:** ✅ Đã hoàn thành 100% mục tiêu, sẵn sàng chuyển sang Phase 3.

---

## 1. CÁC TASKS ĐÃ HOÀN THÀNH

- [x] **Task 2.1: Khung Ngắm Camera Mùa Đông 4:5 (`app/(main)/index.tsx`)**
  - Tích hợp `CameraView` từ `expo-camera` trực tiếp bên trong khung ngắm tỉ lệ 4:5 máy film cổ điển.
  - 4 góc chữ L viền màu Nắng Thu Gold (`#E59844`) thanh mảnh.
  - [src/hooks/useCameraPermissions.ts](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/src/hooks/useCameraPermissions.ts): Quản lý cấp quyền Camera và Micro kèm thông báo thơ mộng: *"Cho Ví Locket ngắm phố cùng bạn qua camera nhé."*
  - Floating Header Pill kính mờ Sương Mù Hồ Tây hiển thị: `🟢 Hôm nay còn [xx]k`, chạm mở Quick Drawer xem Số Dư Thực và Tiền Đã Cứu.
  - Nút chiếc lá `+ Thu` cạnh Header để nhập nhanh khoản thu phát sinh.

- [x] **Task 2.2: Nút Shutter Đa Năng & Thu Âm Giọng Nói (`ShutterButton.tsx`)**
  - [src/components/camera/ShutterButton.tsx](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/src/components/camera/ShutterButton.tsx):
    - **Nhấn 1 chạm (< 600ms):** Chụp ảnh món đồ qua `takePictureAsync`.
    - **Nhấn giữ (>= 600ms):** Bắt đầu thu âm bằng `expo-av`, rung haptic li ti nhịp nhàng đều đặn như kim đồng hồ cổ.
  - [src/components/camera/VoiceWaveform.tsx](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/src/components/camera/VoiceWaveform.tsx): Hiệu ứng sóng âm gợn sóng (Pulsing rings) màu Cúc Họa Mi Amber tỏa tròn quanh nút Shutter khi đang giữ mic.

- [x] **Task 2.3: Bộ Phân Tích Giọng Nói Tiếng Việt Thông Minh (`gemini.ts`)**
  - [src/services/gemini.ts](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/src/services/gemini.ts):
    - Nhận diện phương ngữ tiếng Việt: *"bốn lăm ngàn"*, *"hai củ rưỡi"*, *"tám lít"*, *"ba chục"*, *"năm lăm k"*.
    - Tự động nhận diện loại giao dịch: Nói *"lương về 8 củ"* hay *"mẹ gửi 2 triệu"* $\rightarrow$ AI tự chuyển `type: INCOME`.
    - Phân loại danh mục tự động: `an_uong`, `di_chuyen`, `mua_sam`, `sinh_hoat`.

- [x] **Task 2.4: Thẻ Xác Nhận Polaroid Nâng Cấp ([ConfirmationSheet.tsx](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/src/components/cards/ConfirmationSheet.tsx))**
  - Kế thừa và nâng cấp bố cục tối ưu từ Ảnh 4:
    - Khung ảnh bo góc lớn dạng ảnh Polaroid cổ điển.
    - **Pill Gạt Chi / Thu Nổi:** Đè nhẹ ở chân ảnh (`↗ Chi` Ngói Rêu / `↙ Thu` Cốm Mint) chạm là đổi tức thì chỉ trong 1 chạm nếu AI nhận diện nhầm.
    - **Ô Số Tiền To Bản Tabular-Nums:** Hiển thị `56.000 đ` kèm nút `⨂` xóa nhanh và bàn phím số để sửa lại khi ở nơi ồn ào.
    - **Chọn Nguồn Tiền Nhanh:** `💳 Ngân hàng`, `💵 Tiền mặt`, `📱 Ví điện tử`.
    - **2 Nút Hero CTA:**
      - `[ĐÃ MUA — LƯU SỔ]`: Lưu vào giao dịch, trừ ngân sách ngày, rung haptic ăn mừng.
      - `[HỎI TRƯỚC — PHÁN QUYẾT]`: Nổi bật màu Nắng Thu Gold, kích hoạt Thẻ Phán Quyết.

---

## 2. MINH CHỨNG HOẠT ĐỘNG & KẾT QUẢ KIỂM THỬ

* **TypeScript Compilation:**
  - Lệnh: `npx tsc --noEmit`
  - Kết quả: **0 errors, 0 warnings** (Exit Code 0).
* **Unit Test Bộ Phân Tích Giọng Nói Tiếng Việt (NLP Test Suite):**
  - Lệnh: `node scripts/test-nlp-voice.js`
  - Kết quả: **8/8 test cases PASS 100%**:
    - *"ly trà sữa bốn lăm ngàn"* $\rightarrow$ 45.000đ [EXPENSE] [an_uong] (PASS)
    - *"hai củ rưỡi mua áo khoác"* $\rightarrow$ 2.500.000đ [EXPENSE] [mua_sam] (PASS)
    - *"đổ xăng năm chục"* $\rightarrow$ 50.000đ [EXPENSE] [di_chuyen] (PASS)
    - *"lương về tám triệu"* $\rightarrow$ 8.000.000đ [INCOME] (PASS)
    - *"mẹ gửi hai củ"* $\rightarrow$ 2.000.000đ [INCOME] (PASS)
    - *"bát phở ba lăm k"* $\rightarrow$ 35.000đ [EXPENSE] (PASS)
    - *"cà phê trứng ba chục"* $\rightarrow$ 30.000đ [EXPENSE] (PASS)
    - *"ba lít tiền vé"* $\rightarrow$ 300.000đ [EXPENSE] (PASS)

---

## 3. CÁC QUYẾT ĐỊNH KIẾN TRÚC ĐÃ ĐƯA RA

1. **Khung Ngắm Film 4:5 Nhúng Trực Tiếp CameraView:**
   - Thay vì camera toàn màn hình gây méo góc và che mất các nút điều khiển, tỉ lệ 4:5 giữ nguyên tính thẩm mỹ của một chiếc máy ảnh film cầm tay, chừa không gian thoáng đãng cho Header Pill kính mờ và nút Shutter.
2. **Cơ Chế Bấm Chụp vs Giữ Thu Âm Linh Hoạt:**
   - Sử dụng mốc thời gian 600ms: Dưới 600ms coi như thao tác chạm chụp ảnh; trên 600ms kích hoạt nhịp rung xúc giác và gửi audio phân tích.
3. **Pill Gạt Chi/Thu Đè Chân Ảnh:**
   - Tối ưu hóa từ Ảnh 4 giúp người dùng không bao giờ bị ức chế nếu lỡ nói nhầm hoặc AI phân loại sai — chỉ cần chạm 1 cái là hoán đổi trạng thái tức thì.

---

## 4. KẾ HOẠCH CHO PHASE KẾ TIẾP (PHASE 3)

Sẵn sàng chuyển sang **Phase 3: Thẻ Phán Quyết (Judgment Card) & Anti-FOMO AI Engine**:
- Xây dựng Thẻ Bưu Thiếp Phán Quyết giấy dó viền tem thư cổ điển.
- Động cơ quy đổi số học thời gian thực: Ngày ăn phở, Ly cà phê trứng, Giờ làm việc, Số ngày lùi mục tiêu.
- Trí tuệ nhân tạo Gemini Flash Roast: 1–2 câu phản biện hóm hỉnh từ người bạn thân Hà Nội.
- 3 nút hành động quyết định: `[MUA LUÔN]` / `[GIỎ CHỜ CẢN GẮT]` / `[THÔI, CỨU VÍ]` (Hiệu ứng hoa cúc rơi ăn mừng + cộng Tiền Đã Cứu).
