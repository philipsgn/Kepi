# 📷 09 — CAMERA: MÁY ẢNH HEO CON NEO-BRUTALIST V3 (UNIFIED FIXED FRAME + IN-OUT BALANCED CONTROLS + PIXEL KEYPAD)

> **Screen-unit:** Tab 2 (Camera trung tâm). **LUỒNG 3-in-1 (Shutter / VietQR Offline / Bank Notification Pill), quay clip 3s, MandCashierKeyboard GIỮ NGUYÊN 100% OFFLINE** (`docs/screens/CAMERA.md`).
> **Phiên bản:** v3.0 (Kế thừa từ `PolaroidReviewCard` và `InFrameReviewOverlay`: Khung máy ảnh cố định trung tâm từ đầu tới cuối, thông tin Giá tiền/Mô tả/Danh mục nằm dưới khung, nút Lưu ở Bottom Bar trên Tab Bar, bàn phím số Pixel Art).
> **Phong cách đồ họa:** Port từ `prototype/Camera_heo_con.html` (CSS + canvas pixel + logic hoạt họa heo ngủ trên nóc máy ảnh).

---

## 1. Khung Máy Ảnh Thống Nhất Cố Định (Unified Fixed Frame)
- **Vị trí & Kích thước cố định:**
  - Khung ngắm nằm ở trung tâm màn hình, tỷ lệ squircle thoáng đãng, viền 3px mực `#2B2118`, bóng cứng 4px.
  - Từ lúc ngắm chụp (live preview) cho tới lúc chụp xong (review): **LÀ CHUNG 1 KHUNG HÌNH DUY NHẤT**, không dịch chuyển, không co giật hay tụt đáy.
- **Chú Heo Ngủ Trên Nóc Khung Ngắm (`PiggyCameraRoof`):**
  - Chú heo pixel art 24×20 nằm ngủ ngoan khò khò (`pose: 'sleep'`), chữ `Z z z` bay lượn li ti.
  - Hiển thị **xuyên suốt từ đầu đến cuối**. Khi chụp ảnh: Chú heo giật mình nhảy cẫng lên vui mừng (`pose: 'stand', happy: true`), thả tim đỏ `#E0452B` bay lên.
- **Bên trong khung ngắm:**
  - Khi chưa chụp: CameraView quét thời gian thực.
  - Khi đã chụp: Ảnh chụp hiển thị sắc nét với bo góc squircle chuẩn.
  - Góc trên gờ khung: Badge phân loại `[Chi | Thu]` và nút `[Lật cam / Chụp lại]`.
  - **Mặt ảnh hoàn toàn sạch sẽ, không nhồi nhét chữ/nút đè che khuôn mặt hoặc món đồ!**

---

## 2. Khu Vực Thông Tin Khoản Chi (Nằm Ngay Dưới Khung Ảnh)
- **Hàng 1: Bộ đếm tiền to rõ Neo-Brutalist:**
  - Nút `[-] 5k` (nền kem viền 2px mực) + Khối hiển thị số tiền font Baloo 2 `tabular-nums` màu nâu mực `#2B2118` + Nút `[+] 5k` (nền kem viền 2px mực).
  - Chạm vào số tiền: Mở Modal bàn phím thu ngân `MandCashierKeyboard` được re-skin chuẩn Pixel Art để gõ tự do.
- **Hàng 2: Ô nhập tên món chi tiêu:**
  - Nền kem trắng sữa `#FFFBF1`, viền 2px mực `#2B2118`, bo góc 12px, placeholder: *"Nhập tên món chi tiêu..."*.
- **Hàng 3: Dải chip danh mục cuộn ngang:**
  - Các chip danh mục (Ăn uống, Di chuyển, Mua sắm,...) kèm icon đơn sắc, viền 1.5px mực; chip được chọn bừng sáng màu Vàng Cám `#F4B93B` viền 2px.

---

## 3. Thanh Điều Khiển Dưới (Bottom Bar) Không Bị Che Lấp
- Nằm phía trên Bottom Tab Bar với khoảng đệm an toàn (`insets.bottom + 70`), đảm bảo 100% không bao giờ bị Tab Bar che.
- **Trạng thái chưa chụp:**
  - Trái: Nút Thư viện ảnh (`ImagePlus`) nổi trần Zero-Border nét đậm 2.8px.
  - Giữa: Nút Shutter 2-in-1 Neo-Brutalist viền kép đỏ-vàng-mực (1 chạm chụp, nhấn giữ nói Voice).
  - Phải: Nút Lật camera (`RotateCcw`) nổi trần Zero-Border nét đậm 2.8px.
- **Trạng thái đã chụp xong:**
  - Trái: Nút `[✕ Chụp lại]` (nền Kem Sàn `#FFFBF1`, viền 2.5px mực, chữ nâu mực).
  - Phải/Giữa: Nút `[✓ Lưu vào ví]` to đẹp nổi bật (nền Vàng Cám `#F4B93B`, viền 3px mực, bóng cứng 3px, chữ Baloo 2 đậm nét).

---

## 4. Bàn Phím Thu Ngân Pixel Art (`MandCashierKeyboard`)
- Nền container: Kem Sàn `#F6EEDC`, viền Nâu Mực `#2B2118` 3px, bo góc trên 24px.
- Phím bấm số 0-9: Nền trắng sữa `#FFFBF1`, viền mực 2px, bóng cứng 2px 0-blur, font Baloo 2 `tabular-nums` màu nâu mực.
- Nút Xóa: Phím kem viền 2px.
- Nút Xác nhận: Nền Vàng Cám `#F4B93B`, viền 3px mực, bóng cứng 3px 0-blur.
- Xóa bỏ hoàn toàn tone màu hồng ngân hàng hiện đại lạc lõng.

---

## AC (Acceptance Criteria)
- [ ] Khung ngắm và preview thống nhất làm 1 khung hình cố định trung tâm từ đầu tới cuối.
- [ ] Chú heo trên nóc máy ảnh hiển thị xuyên suốt, nhảy cẫng thả tim khi chụp ảnh.
- [ ] Thông tin giá tiền, tên món, chip danh mục nằm ngay dưới khung ảnh, không đè che mặt ảnh.
- [ ] Nút Lưu và Chụp lại nằm ở thanh điều khiển dưới phía trên Tab Bar, 100% không bị che lấp.
- [ ] Bàn phím số MandCashierKeyboard được re-skin 100% chuẩn Neo-Brutalist Pixel Art kem/mực.
- [ ] Hoạt động 100% offline, không lưu STK, làm sạch EXIF ảnh trước khi lưu.