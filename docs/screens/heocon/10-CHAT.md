# 🎮 10 — PIGFLY HUB & PIXEL HUB (TAB GIẢI TRÍ): CHAT, 2 GAME ĐỘ KHÓ CAO & BẢN ĐỒ CHI TIÊU

> **Screen-unit:** Tab 3. **PIGFLY HUB (Trung Tâm Giải Trí & Khám Phá Heo Con)** kết hợp Chat AI Coach / Squad, 2 Game Pixel Art Độ Khó Cao (Heo Bay & Heo Bắn) và Bản Đồ Chi Tiêu Pixel port 1:1 từ `prototype/Ví Heo Con-20-11.html` (Quyết định 130, 140, 141 & 142).

---

## 1. Kiến Trúc Điều Hướng Hub Chuẩn `v-fun` Prototype 20/11
Màn hình Tab 3 mặc định hiển thị **PIGFLY HUB (`v-fun`)** gồm:
1. **Header:** Badge Neo-pill `● PIGFLY HUB` viền 3px mực + Badge Chuỗi Streak `🔥 X ngày`.
2. **Banner Mascot Chào Hỏi:** Avatar pixel 16×16 vẽ động khuôn mặt Heo Con cử động mắt/mũi + lời chào cá nhân hóa *"Trung Tâm Heo Con — Chào [Tên]! Khám phá giải trí & bản đồ khu phố"*.
3. **Status Chips:**
   - Vé chơi: `🎫 X vé` (Đăng nhập mỗi ngày tặng 3 vé + mỗi lần ghi chi tiêu/chụp ảnh ở Tab Chụp tặng +1 vé).
   - Thức ăn dự trữ: `🌽 X thức ăn` (Thu hoạch từ Heo Bay & giải cứu heo con từ Heo Bắn, dùng cho Heo ăn).
4. **4 Thẻ Khám Phá Neo-Brutalist (Viền 3px mực, bóng cứng 4px 0-blur):**

| Thẻ Phân Hệ | Biểu Tượng & Tông Màu | Chức Năng Cốt Lõi |
|---|---|---|
| **1. Trò Chuyện & Bạn Bè** | 💬 Hồng Heo `#F9B8C4` | Chat với AI Coach Anh Minh & Squad Locket Nuôi Heo 2–4 người. |
| **2. Game Heo Bay** | 🪽 Vàng Cám `#F4B93B` | Flappy Pig 60fps chướng ngại vật động (Gió lốc, chim ngược chiều, bão mưa), hái đồ ăn tiếp sức cho vườn nhà. |
| **3. Game Heo Bắn** | 🎯 Đỏ Cam `#E0452B` | Angry Pig Endless Waves (Màn vô tận, gió biến thiên, cứu heo con lồng sắt, heo cánh, heo bom). |
| **4. Bản Đồ Chi Tiêu** | 🗺️ Xanh Lá `#5E9A57` | Bản đồ pixel khu phố & Bản đồ thật, thống kê Lượt ghé, Quán quen, Chi có ghim. |

---

## 2. Đặc Tả Chi Tiết Các Phân Hệ & Game Độ Khó Cao

### 2.1. Phân Hệ 1: Trò Chuyện & Squad Bạn Thân (`ChatView`)
- **Giao diện Chat Neo-Brutalist (Quyết định 140)**:
  - Header segment: Track viền 3px mực `#2B2118`, nền `#FFFBF1`, bóng cứng 3px 0-blur; tab active Vàng Cám `#F4B93B` viền 2px mực.
  - Bong bóng tin nhắn AI Coach: Nền kem `#FFFBF1`, viền 3px mực, bóng cứng 3px 0-blur, avatar Heo Con pixel 36px.
  - Bong bóng tin nhắn người dùng: Nền Vàng Cám `#F4B93B`, viền 3px mực, bóng cứng 3px 0-blur.
  - Thanh nhập chat `ChatInputBar`: Nền kem `#F6EEDC`, viền trên 2.5px mực, ô gõ `#FFFBF1`, nút gửi Vàng Cám.
  - Thẻ xác nhận ghi sổ 1-chạm & MiniMetric: Viền 2.5px mực, bóng cứng 2px.

### 2.2. Phân Hệ 2: Game Heo Bay (`PigFlightGameView`) — Chướng Ngại Vật Động & Khắc Nghiệt
- **Thanh Chuyển Nhanh Top Segment:** `[Heo bay] [Heo bắn]` chuyển đổi 1 chạm trực tiếp giữa 2 game, kèm chip Vé và nút `‹ Quay lại Hub`.
- **Thẻ Chăm Sóc Heo Cưng:** Thanh no/đói 0-100% của Heo, nút `[Cho heo ăn (-1 thức ăn)]`. Heo đói ($<25\%$) bị suy nhược lực bay và lực bắn; Heo no ($>75\%$) được buff lực.
- **Chướng Ngại Vật Động Đột Biến:**
  - *Gió Lốc (Whirlwinds):* Luồng gió xoáy di chuyển ngẫu nhiên hất văng hoặc hút heo lên/xuống.
  - *Chim Ngược Chiều (Incoming Birds):* Chim đối thủ bay ngược chiều từ phải sang trái đòi hỏi phản xạ né tránh.
  - *Thời Tiết Mưa Bão & Sấm Chớp:* Mưa rào làm tối khung cảnh, giảm tầm nhìn, hạt mưa rơi dồn dập.
  - *Thanh No Đói (Hunger Bar):* Tụt dần khi bay, phải ăn thức ăn (bắp, táo, cà rốt, dưa hấu) để duy trì.

### 2.3. Phân Hệ 3: Game Heo Bắn (`PigShooterGameView`) — Endless Waves Tháp Vô Tận
- **Thanh Chuyển Nhanh Top Segment:** `[Heo bay] [Heo bắn]`, chip Vé, nút `‹ Quay lại Hub`.
- **Chế Độ Endless Waves (Tháp Vô Tận):**
  - Vượt màn tự động sinh màn mới với cấu trúc tháp ngẫu nhiên (Procedural Generation).
  - Tỉ lệ khối đá kiên cố (`stone` HP 110) tăng dần, khối kính (`glass`), khối gỗ (`wood`), và lồng sắt (`cage` HP 42).
- **Gió Thổi Biến Thiên (Dynamic Wind Vector):**
  - Mũi tên chỉ hướng gió và tốc độ gió ($\pm 50$ px/s) đổi chiều theo từng đợt gió, buộc người chơi căn góc bù gió.
- **Cứu Heo Con & Kỹ Năng Đặc Biệt:**
  - Bắn vỡ lồng sắt giải cứu heo con (`ap.free`), tích lũy số lượng heo con giải cứu vĩnh viễn.
  - Mở khóa *Heo Cánh (`wing`)* chạm giữa trời để phóng nhanh x1.6 và *Heo Bom Cám (`coin`)* chạm giữa trời để kích nổ xung lực.
- **Ràng Buộc Kỷ Luật Ngân Sách Ngày:**
  - Chi tiêu $< 50\%$ hạn mức: `+1 lượt bay vì tiêu ít`.
  - Chi tiêu lố $> 100\%$ hạn mức: `-1 lượt bay vì chi lố`.

### 2.4. Phân Hệ 4: Bản Đồ Chi Tiêu Pixel (`PiggySpendMapView`)
- Chế độ xem: `[Pixel] [Bản đồ thật]`.
- 3 Chỉ số tài chính định vị: `Lượt ghé`, `Quán quen`, `Chi có ghim`.
- Ghim vị trí thực tế khi chụp/lưu chi từ Tab Chụp; heo đi dạo tới các quán; lưu chi trực tiếp tại tọa độ hiện tại.
  - Thống kê 3 chỉ số đầu trang: `Lượt ghé`, `Quán quen`, `Chi có ghim`.
  - Bấm vào một ghim: Mở Place Sheet chi tiết.
  - Nút `[Heo đi tới đây]`: Chú heo pixel trên bản đồ tự động đi bộ theo mạng lưới đường phố tới địa điểm quán vừa chọn.

---

## 3. Quy Chuẩn Kỹ Thuật & Thẩm Mỹ
- **Palette màu Neo-Brutalist**:
  - Kem Sàn: `#F6EEDC`
  - Nâu Mực: `#2B2118`
  - Hồng Heo: `#F9B8C4`
  - Vàng Cám: `#F4B93B`
  - Xanh Lá: `#5E9A57`
  - Đỏ Cam: `#E0452B`
- **Typography**: Tiêu đề Baloo 2 (800), Thân bài Nunito (600-800), Số liệu `fontVariant: ['tabular-nums']`.
- **Hiệu năng & Bảo mật**:
  - 100% Offline-First (toàn bộ game và map chạy trơn tru không cần internet).
  - Zero-STK (tuyệt đối không lưu STK trong ghim bản đồ hay nhật ký).
  - Zero điểm ảo FEP (quy chuẩn về chuỗi Streak ngày và số tiền tiết kiệm giữ lại).
