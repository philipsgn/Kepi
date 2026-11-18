# 📷 09 — CAMERA: MÁY ẢNH HEO CON NEO-BRUTALIST V4 (DREAMY PIXEL SKY + SNAP-ON-RELEASE VOICE + IN-FRAME BOTTOM PILL + POLAROID PIXEL MOMENTS)

> **Screen-unit:** Tab 2 (Camera trung tâm). **LUỒNG 3-in-1 (Shutter / VietQR Offline / Bank Notification Pill), quay clip 3s, MandCashierKeyboard GIỮ NGUYÊN 100% OFFLINE** (`docs/screens/CAMERA.md`).
> **Phiên bản:** v4.0 (Kế thừa từ `PolaroidReviewCard` và `InFrameReviewOverlay`: Bầu trời Pixel Dreamy mây nắng, buông tay Shutter voice tự động chụp frame ảnh cuối cùng, ô mô tả dạng Pill Mini sát đáy trong khung hình không bị keyboard che lấp, mở rộng chiều ngang khung camera, và Khung lịch sử ảnh Locket Polaroid Pixel hoài niệm).
> **Phong cách đồ họa:** Port từ `prototype/Camera_heo_con.html` (CSS + canvas pixel + logic hoạt họa heo ngủ trên nóc máy ảnh).

---

## 1. Bầu Trời Pixel Dreamy & Khung Ngắm Thống Nhất Cố Định Mở Rộng (Unified Fixed Frame)
- **Nền Gradient Pixel Dreamy:**
  - Chuyển từ tông đen tối sang dải chuyển sắc mộng mơ: Xanh da trời pastel `#D2E3F2` pha Hồng phấn `#FCE3E8` ở trên đỉnh, chuyển mượt mà xuống Xanh mint cỏ vườn `#DDEBD9` và Kem Sàn `#F6EEDC`.
  - Bầu trời điểm xuyết vệt nắng vàng ấm `#F4B93B` và các đám mây pixel art trắng bồng bềnh (`PixelSkySunCloud`).
- **Chú Heo Ngủ Khò Sát Nóc Khung Ngắm (`PiggyCameraRoof`):**
  - Chú heo pixel art 24×20 nằm ngủ ngoan khò khò (`pose: 'sleep'`), chữ `Z z z` bay lượn li ti.
  - Kê khít sát sạt gờ trên (Header) của Khung ảnh (`marginTop: -4`), tạo cảm giác chú heo đang ngủ tựa cằm ngay trên nóc chiếc máy ảnh. Khi chụp ảnh: Chú heo giật mình nhảy cẫng lên vui mừng, thả tim đỏ bay lên.
- **Khung Ngắm Rộng Thoáng Đãng:**
  - Mở rộng chiều ngang: `width: Math.min(SCREEN_WIDTH - 20, 360)`, `height: Math.min((SCREEN_WIDTH - 20) * 0.88, 320)`.
  - Viền 3px Nâu Mực `#2B2118`, bóng cứng 4px.
  - Gờ trên trong khung: Badge gạt `[Chi | Thu]` và nút `[Chụp lại / Lật cam]`.

---

## 2. Thanh Pill Mini Ghi Mô Tả Nổi Sát Đáy Trong Khung (Anti-Keyboard Overlap)
- **Vị trí:** Đặt nổi cách đáy khung ngắm 8px (`bottom: 8`), bo tròn dạng viên thuốc 999px.
- **Phong cách:** Nền kem trắng sữa `#FFFBF1` (hoặc bán trong suốt `rgba(255, 251, 241, 0.95)`), viền 2px Nâu Mực `#2B2118`, bóng cứng 2px.
- **Ưu điểm vượt trội:** Nằm ở nửa trên màn hình, khi người dùng chạm vào gõ chữ, bàn phím ảo của điện thoại (chiếm đáy ~300px) **hoàn toàn KHÔNG BAO GIỜ CHE MẤT chữ đang gõ!**

---

## 3. Cơ Chế Shutter 2-in-1: Buông Tay Chụp Frame Ảnh Cuối Cùng (Snap-on-Release Voice)
- **1 chạm (Tap):** Chụp ảnh live camera lập tức.
- **Đè nút (Hold):** Kích hoạt Voice ghi âm chi tiêu. Camera vẫn live để người dùng căn chỉnh góc nhìn.
- **Buông tay (Release):**
  - Hệ thống tự động bắt ngay frame ảnh camera cuối cùng (`takePictureAsync`), đưa vào khung hình hiển thị.
  - Đồng thời AI bóc tách giọng nói: điền tự động số tiền vào bộ đếm, tên món vào thanh Pill mô tả, chọn chip danh mục tương ứng.
  - Chuyển nút điều khiển đáy sang `[✕ Chụp lại]` và `[✓ Lưu vào ví]`.

---

## 4. Khu Vực Thông Tin Chi Tiêu Dưới Khung Ảnh (Siêu Gọn & Thoáng Đãng)
- **Hàng 1: Bộ đếm số tiền [-] [SỐ TIỀN đ] [+]** (Baloo 2 to rõ, chạm mở bàn phím số thu ngân).
- **Hàng 2: Dải chip danh mục cuộn ngang** (Ăn uống, Đi lại, Cafe, Mua sắm...).
- **Thanh Bottom Bar an toàn:** Cách sàn màn hình `insets.bottom + 85px`, 100% không bao giờ bị Bottom Tab Bar che lấp.

---

## 5. Dòng Khoảnh Khắc Locket: Khung Ảnh Polaroid Pixel Hoài Niệm
- **Tạo hình Khung Polaroid Cổ Điển:**
  - Nền khung: Trắng ngà / Kem sữa `#FFFBF1`.
  - Viền ngoài: 2.5px Nâu Mực `#2B2118`, bo góc 12px.
  - Bóng cứng: `shadowColor: '#2B2118'`, `shadowOffset: { width: 0, height: 4 }`, `shadowOpacity: 1`.
  - Lề đáy Polaroid rộng dày 44px kiểu ảnh Polaroid rửa phim.
- **Chi Tiết Hoài Niệm Pixel Art:**
  - Miếng dán băng keo washi pixel art dán lệch ở góc trên khung ảnh.
  - Nhãn giá tiền dạng tem dán góc (Price Stamp) màu Vàng Cám `#F4B93B` viền 2px mực, font Baloo 2 to rõ.
  - Tên món + Dấu mộc thời gian dạng con dấu bưu điện hoài niệm.

---

## AC (Acceptance Criteria)
- [ ] Bầu trời Dreamy Xanh da trời + Hồng pastel + Xanh mint + Mây nắng pixel art bồng bềnh.
- [ ] Chú heo ngủ khít sát nóc khung ảnh, khung mở rộng chiều ngang `SCREEN_WIDTH - 20`.
- [ ] Thanh Pill Mini nhập mô tả nổi sát đáy trong khung hình, gõ chữ không bị keyboard che lấp.
- [ ] Đè Shutter nói voice, buông tay tự động chụp frame ảnh cuối cùng gán vào khung hình và điền dữ liệu.
- [ ] Thẻ lịch sử ảnh Locket Moment chuyển sang phong cách Polaroid Pixel hoài niệm (băng keo washi, tem giá).
- [ ] Hoạt động 100% offline, không lưu STK, làm sạch EXIF ảnh trước khi lưu.