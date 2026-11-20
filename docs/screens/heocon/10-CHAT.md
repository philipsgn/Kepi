# 🎮 10 — PIGFLY HUB & PIXEL HUB (TAB GIẢI TRÍ): CHAT, 2 GAME ĐỘ KHÓ CAO & BẢN ĐỒ CHI TIÊU

> **Screen-unit:** Tab 3. **PIGFLY HUB (Trung Tâm Giải Trí & Khám Phá Heo Con)** kết hợp Chat AI Coach / Squad, 2 Game Pixel Art Độ Khó Cao (Heo Bay & Heo Bắn) và Bản Đồ Chi Tiêu Pixel port 1:1 từ `prototype/Ví Heo Con-20-11.html` (Quyết định 130, Quyết định 140, Quyết định 141, Quyết định 142, Quyết định 143 & Quyết định 144).
> **Chế độ Toàn Màn Hình (Fullscreen Game Mode):** Tự động ẩn Floating Bottom Tab Bar khi vào chơi Heo Bay / Heo Bắn để mở rộng 100% không gian điều khiển chân trang (Quyết định 144).
> **Cố định Khung Chat Neo-Brutalist Pixel Art:** Luôn dùng nền kem `#F6EEDC`, khung thẻ `.chatlog` viền 3px mực, avatar vuông $36\times 36$px độc lập với Theme máy (Quyết định 144).
> **Tài liệu đặc tả chi tiết 2 mini-game:** Xem riêng tại [10-GAMES-SPEC.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/screens/heocon/10-GAMES-SPEC.md).

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
| **1. Trò Chuyện & Bạn Bè** | 💬 Hồng Heo `#F9B8C4` | Khung `.chatlog` Neo-Brutalist viền 3px mực: Chat với AI Coach Anh Minh & Squad Nuôi Heo 2.0. |
| **2. Game Heo Bay** | 🪽 Vàng Cám `#F4B93B` | Flappy Pig 60fps port 1:1 parallax 4 biomes, chu kỳ ngày/đêm 8 pha, chướng ngại vật động và độ hở co hẹp lũy tiến. |
| **3. Game Heo Bắn** | 🎯 Đỏ Cam `#E0452B` | Angry Pig port 1:1 ná gỗ 3D, 14 chấm quỹ đạo, texture khối nứt, chim lính drawBirdy, lồng cứu heo con, Endless Waves & gió biến thiên. |
| **4. Bản Đồ Chi Tiêu** | 🗺️ Xanh Lá `#5E9A57` | Bản đồ pixel khu phố & Bản đồ thật, thống kê Lượt ghé, Quán quen, Chi có ghim. |

---

## 2. Đặc Tả Chi Tiết Các Phân Hệ & Game Độ Khó Cao

### 2.1. Phân Hệ 1: Trò Chuyện & Squad Bạn Thân (`ChatView`)
- **Giao diện Chat Neo-Brutalist Pixel Art (Quyết định 143)**:
  - Header: Nút `‹ Quay lại Hub` và tiêu đề *"Trò chuyện · Heo-Coach và hội bạn thân"*.
  - Header segment: Track viền 3px mực `#2B2118`, nền `#FFFBF1`, bóng cứng 3px 0-blur; tab active Vàng Cám `#F4B93B` viền 2px mực, chữ font Baloo 2.
  - **Khung bao `.chatlog`:** Khối thẻ màu kem `#FFFBF1`, viền 3px mực `#2B2118`, bo góc 22px, bóng cứng 4px 0-blur.
  - **Bong bóng tin nhắn `.msg`:**
    - AI Coach: Avatar vuông pixel 30×30px `PixelPigAvatar` viền 3px mực, nền hồng `#F9B8C4`; bong bóng màu kem sàn `#F6EEDC` viền 3px mực, bo góc brutalist 16px.
    - Người dùng (`.msg.me`): Bong bóng nền hồng phấn heo `#F9B8C4` viền 3px mực, chữ Nâu Mực `#2B2118`, căn sát lề phải.
  - **Dải Quick Chips (`.quick`):** Hàng nút chip hình viên thuốc pill viền 2px mực, bóng 2px để chạm hỏi nhanh không cần gõ phím.
  - **Thanh nhập chat `.chatin`:** Nền kem `#F6EEDC`, ô gõ `#FFFBF1` cao 44px viền 3px mực, nút `[Gửi]` Vàng Cám viền 2.5px mực nổi khối.
  - **Dòng quyền riêng tư (`.privacy`):** "Heo-Coach đọc số liệu tổng hợp trong app. Ảnh và vị trí không được gửi đi."

### 2.2. Phân Hệ 2 & 3: Game Heo Bay & Game Heo Bắn
*(Xem đặc tả chi tiết toàn diện về đồ họa, công thức vật lý, độ khó và popup tại [10-GAMES-SPEC.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/screens/heocon/10-GAMES-SPEC.md))*.

### 2.4. Phân Hệ 4: Bản Đồ Chi Tiêu Pixel (`PiggySpendMapView`)
- Chế độ xem: `[Pixel] [Bản đồ thật]`.
- 3 Chỉ số tài chính định vị: `Lượt ghé`, `Quán quen`, `Chi có ghim`.
- Ghim vị trí thực tế khi chụp/lưu chi từ Tab Chụp; heo đi dạo tới các quán; lưu chi trực tiếp tại tọa độ hiện tại.

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
