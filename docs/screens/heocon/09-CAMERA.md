# 📷 09 — CAMERA: MÁY ẢNH HEO CON NEO-BRUTALIST V2 (IN-FRAME REVIEW + SHUTTER VOICE 2-IN-1 + ZERO-BORDER ICONS)

> **Screen-unit:** Tab 2 (Camera trung tâm). **LUỒNG 3-in-1 (Shutter / VietQR Offline / Bank Notification Pill), quay clip 3s, MandCashierKeyboard GIỮ NGUYÊN 100% OFFLINE** (`docs/screens/CAMERA.md`).
> **Phiên bản:** v2.0 (In-Frame Review chống tràn màn hình, Shutter 2-in-1 Chụp/Voice, Zero-Border Floating Icons).
> **Phong cách đồ họa:** Port từ `prototype/Camera_heo_con.html` (CSS + canvas pixel + logic hoạt họa heo ngủ trên nóc máy ảnh).

---

## 1. Top Bar & Khung ngắm (Viewfinder với Piggy Roof)
- **Top Bar Neo-Brutalist:**
  - Nút Flash: Nút tròn nổi trần hoặc nền `#FFFBF1`, viền mực `#2B2118`.
  - Viên thuốc trung tâm: `[● Hôm nay chi: X đ]` (nền `#FFFBF1`, viền 3px mực, chấm đỏ `#E0452B`, text cập nhật động theo `todaySpent`).
  - Nút Phòng Ảnh: Dẫn thẳng sang Tab 1 Nhà Heo (`onNavigateToHouse`).
- **Khung ngắm phần cứng thật (`expo-camera`):**
  - Tỉ lệ 4:5 thoáng đãng, bo góc 28px, viền 3px mực `#2B2118`, bóng cứng `0 4px 0 #2B2118`.
  - Giữ nguyên quét mã VietQR offline và nhận diện hóa đơn.
- **Chú Heo Ngủ Trên Nóc Khung Ngắm (`PiggyCameraRoof`):**
  - Sprite chú heo pixel art 24×20 nằm ngủ ngoan khò khò (`pose: 'sleep'`), chữ `Z z z` bay lượn li ti.
  - Khi bấm Shutter chụp ảnh: Chớp flash màn hình $\to$ chú heo giật mình nhảy cẫng lên vui mừng (`pose: 'stand', happy: true`), thả tim đỏ `#E0452B` bay lên.

---

## 2. Nút Shutter 2-in-1 (Chụp 1-chạm & Nhấn giữ Voice)
- **Thiết kế Neo-Brutalist:**
  - Vành ngoài: Vàng Cám `#F4B93B` dày 4px viền mực `#2B2118`.
  - Lõi trong: Đỏ Cam `#E0452B` dày 3.5px viền mực `#2B2118`.
  - Bóng cứng 8px: `0 8px 0 #2B2118`.
- **Cơ chế 2-in-1 thông minh:**
  - **1 chạm (Tap):** Chụp ảnh món đồ bình thường.
  - **Nhấn giữ (Hold):** Chụp ngay khung hình camera tại thời điểm bắt đầu + kích hoạt sóng âm Voice ghi âm giọng nói. Khi thả tay ra, AI NLP (`voiceExpenseParser`) tự động bóc tách số tiền, danh mục, nội dung và điền thẳng vào giao diện review kèm ảnh vừa chụp.

---

## 3. Giao Diện In-Frame Review Co Gọn Trong Khung Ngắm 4:5 (`InFrameReviewOverlay` / `PolaroidReviewCard`)
- **Khắc phục lỗi tràn màn hình & đơ:** Nâng cấp từ thẻ Polaroid (`PolaroidReviewCard`) thành giao diện In-Frame Review nằm trọn vẹn 100% bên trong khung ngắm 4:5, không bị tràn xuống dưới và không bị Bottom Tab Bar che lấp.
- **Bố cục bên trong khung 4:5:**
  - **Lớp nền:** Ảnh vừa chụp bo góc squircle chuẩn khung ngắm.
  - **Đỉnh:** Tag phân loại [Chi | Thu] tối giản.
  - **Giữa:** Số tiền to rõ ràng font Baloo 2 (`tabular-nums`), hai nút `[-]` và `[+]` 5.000đ hai bên; chạm vào số tiền mở modal bàn phím thu ngân `MandCashierKeyboard`.
  - **Dưới:** Ô nhập tên món (viền 2px mực) + Dải chip danh mục cuộn ngang.
  - **Đáy khung ngắm:** Cặp nút hành động:
    - `[✕ Chụp lại]`: Nền kem sàn viền 2.5px mực.
    - `[✓ Lưu vào ví]`: Nền vàng cám viền 2.5px mực.
  - **Sau khi lưu:** Hiển thị thông báo *"Heo đã treo ảnh lên tường"* kèm nút *"Xem ở phòng ảnh"* chuyển sang Tab 1.

---

## 4. Thanh Công Cụ Dưới Chuẩn Tối Giản (Zero-Border Icons)
- Xóa bỏ hoàn toàn khối tròn viền xám đục bao quanh icon.
- Nút Thư viện ảnh (`ImagePlus`) và Lật camera (`RotateCcw`) hiển thị dạng **Icon Vector nổi trần hoàn toàn** (`borderWidth: 0, backgroundColor: 'transparent'`), nét vẽ đậm `strokeWidth: 2.8`, kích thước 24px, màu trắng sáng/vàng cám nổi bật với shadow nhẹ.
- Nút Mic riêng rẽ được loại bỏ hoàn toàn do đã tích hợp vào nút Shutter trung tâm.

---

## AC (Acceptance Criteria)
- [ ] Khung Review sau chụp co gọn vừa khít 100% trong khung 4:5, không bị tràn ra ngoài màn hình và không bị Bottom Tab Bar che lấp.
- [ ] Nút Shutter hỗ trợ 2-in-1: 1 chạm chụp ảnh, nhấn giữ chụp snapshot + ghi âm voice bóc tách AI.
- [ ] Thanh công cụ dưới 100% icon nổi trần (Zero-Border & Boxless), xóa bỏ các viền tròn bao quanh icon.
- [ ] Chú heo pixel ngủ trên nóc khung ngắm với chữ Zzz bay; nhảy cẫng thả tim khi bấm chụp.
- [ ] Hoạt động 100% offline, không lưu STK, làm sạch EXIF ảnh trước khi lưu.