# 📷 09 — CAMERA: MÁY ẢNH HEO CON NEO-BRUTALIST (VIEWFINDER + PIGGY ROOF + SHUTTER + POLAROID)

> **Screen-unit:** Tab 2 (Camera trung tâm). **LUỒNG 3-in-1 (Shutter / VietQR Offline / Bank Notification Pill), quay clip 3s, MandCashierKeyboard GIỮ NGUYÊN 100% OFFLINE** (`docs/screens/CAMERA.md`).
> **Phong cách đồ họa:** Port từ `prototype/Camera_heo_con.html` (CSS + canvas pixel + logic hoạt họa heo ngủ trên nóc máy ảnh).

---

## 1. Top Bar & Khung ngắm (Viewfinder với Piggy Roof)
- **Top Bar Neo-Brutalist:**
  - Nút Flash: Nút tròn nền `#FFFBF1`, viền 3px mực `#2B2118`, bóng `0 3px 0 #2B2118`.
  - Viên thuốc trung tâm: `[● Hôm nay chi: X đ]` (nền `#FFFBF1`, viền 3px mực, chấm đỏ `#E0452B`, text cập nhật động theo `todaySpent`).
  - Nút Phòng Ảnh: Dẫn thẳng sang Tab 1 Nhà Heo (`onNavigateToHouse`).
- **Khung ngắm phần cứng thật (`expo-camera`):**
  - Tỉ lệ 4:5 thoáng đãng, bo góc 28px, viền 3px mực `#2B2118`, bóng cứng `0 4px 0 #2B2118`.
  - Giữ nguyên quét mã VietQR offline và nhận diện hóa đơn.
- **Chú Heo Ngủ Trên Nóc Khung Ngắm (`PiggyCameraRoof`):**
  - Sprite chú heo pixel art 24×20 nằm ngủ ngoan khò khò (`pose: 'sleep'`), chữ `Z z z` bay lượn li ti.
  - Khi bấm Shutter chụp ảnh: Chớp flash màn hình $\to$ chú heo giật mình nhảy cẫng lên vui mừng (`pose: 'stand', happy: true`), thả tim đỏ `#E0452B` bay lên.

---

## 2. Nút Shutter Neo-Brutalist Viền Kép
- **Kích thước & Bảng màu:**
  - Đường kính 84px, nền đỏ cam `#E0452B`, viền 4px mực `#2B2118`.
  - Vành tròn kép: Vàng Cám `#F4B93B` 5px + viền mực 8px.
  - Bóng đổ cứng 10px: `box-shadow: 0 0 0 5px var(--gold), 0 0 0 8px var(--ink), 0 10px 0 8px var(--ink)`.
- **Hiệu ứng chạm nhún (Tactile Spring):**
  - Khi bấm xuống (`active`): Nút lún 6px, bóng đổ giảm xuống 4px, phát rung xúc giác Haptic Heavy (`expo-haptics`).

---

## 3. Thẻ Polaroid Retro Sau Chụp (`PolaroidReviewCard`)
- **Khung ảnh Polaroid nghiêng -3 độ:**
  - Khung ảnh trắng tinh `#FFFFFF`, viền 3px mực `#2B2118`, bo góc 12px, bóng đổ cứng 4px.
  - Hiển thị ảnh chụp thực tế trong khung vuông 1:1.
- **Bộ điều khiển tiền & Danh mục:**
  - Bộ nút tăng giảm nhanh: `[-]` giảm 5.000đ, `[+]` tăng 5.000đ.
  - Con số tiền: Font Baloo 800 tabular-nums + ký hiệu `đ`. Chạm vào con số tiền để mở ngay bàn phím `MandCashierKeyboard` nhập tự do.
  - Dải chọn danh mục chi tiêu nhanh (Ăn uống 🍜, Di chuyển 🛵, Mua sắm 🛍️, v.v.).
- **Nút hành động & Trạng thái lưu:**
  - `[Chụp lại]`: Hủy ảnh vừa chụp và quay lại khung ngắm.
  - `[Lưu vào ví]`: Ghi sổ chi tiêu với hiệu ứng heo ăn mừng.
  - Khi lưu xong: Thông báo *"Heo đã treo ảnh lên tường 🖼️"* kèm nút *"Xem ở phòng ảnh"* (dẫn sang Tab 1).

---

## AC (Acceptance Criteria)
- [ ] Luồng 3-in-1, VietQR offline & tốc độ ghi ≤ 2–3s không đổi; chỉ nâng cấp giao diện.
- [ ] Chú heo pixel ngủ trên nóc khung ngắm với chữ Zzz bay; nhảy cẫng thả tim khi bấm chụp.
- [ ] Nút Shutter Neo-Brutalist viền kép đỏ-vàng-mực đường kính 84px, lún 6px khi bấm.
- [ ] Thẻ Polaroid nghiêng -3° với bộ tăng giảm +/- 5k và tích hợp MandCashierKeyboard.
- [ ] Camera hoạt động 100% offline, không lưu STK, làm sạch EXIF ảnh trước khi lưu.