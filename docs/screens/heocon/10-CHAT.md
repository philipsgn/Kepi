# 💬 10 — PIXEL HUB ĐA NĂNG: CHAT, 2 GAME & BẢN ĐỒ CHI TIÊU

> **Screen-unit:** Tab 3. **Trung Tâm Đa Năng (Entertainment, Map & Social Hub)** kết hợp Chat AI, 2 Game Pixel Art (Heo Bay & Heo Bắn) và Bản Đồ Chi Tiêu Pixel port 1:1 từ `prototype/Game_Heo_Bay.html` (Quyết định 130 & 140).

---

## 1. Kiến Trúc Điều Hướng Hub 4 Thẻ Neo-Brutalist
Màn hình Tab 3 mặc định hiển thị **Hub Dashboard** gồm 4 thẻ lớn hình khối Neo-Brutalist sinh động (Kem Sàn `#F6EEDC`, Nâu Mực `#2B2118`, viền 3px, bóng cứng 4px 0-blur, font `Baloo2_800ExtraBold` & `Nunito_700Bold`):

| Thẻ Phân Hệ | Biểu Tượng & Tông Màu | Chức Năng Cốt Lõi |
|---|---|---|
| **1. Trò Chuyện & Bạn Bè** | 💬 Hồng Heo `#F9B8C4` | Chat với AI Coach Anh Minh (hỏi đáp tài chính, xin ý kiến phản biện) & Squad Locket Nuôi Heo 2–4 người. |
| **2. Game Heo Bay** | 🪽 Vàng Cám `#F4B93B` | Flappy Pig vượt chướng ngại vật tài chính kiếm ăn cho cả nhà, thanh độ no `flyHunger`, 4 biomes (Vườn nhà, Phố chợ, Hồ sen, Đồng lúa). |
| **3. Game Heo Bắn** | 🎯 Đỏ Cam `#E0452B` | Angry Pig slingshot physics, bắn phá các khối chướng ngại vật (Gỗ, Đá, Kính, Lồng), tính sao và giải đố. |
| **4. Bản Đồ Chi Tiêu** | 🗺️ Xanh Lá `#5E9A57` | Bản đồ pixel khu phố, tự động ghim các khoản chi từ `transactionStore`, heo đi dạo tới quán, thống kê Lượt ghé & Quán quen. |

Khi chạm vào bất kỳ thẻ nào, hệ thống mở toàn màn hình (Sub-view) tương ứng, phía trên có thanh Header Neo-Brutalist với nút `[← Quay lại Hub]` 1-chạm mượt mà kèm xúc giác haptic.

---

## 2. Đặc Tả Chi Tiết 4 Phân Hệ

### 2.1. Phân Hệ 1: Trò Chuyện & Squad Bạn Thân (`ChatView`)
- **Persona & RAG**: Giữ nguyên tính cách Anh Minh AI (phản hồi $\le 1.5$s, offline fallback).
- **Giao diện Chat Neo-Brutalist (Quyết định 140)**:
  - Header segment: Track viền 3px mực `#2B2118`, nền `#FFFBF1`, bóng cứng 3px 0-blur; tab active Vàng Cám `#F4B93B` viền 2px mực, chữ font Baloo 2.
  - Bong bóng tin nhắn AI Coach: Nền kem `#FFFBF1`, viền 3px mực, bóng cứng 3px 0-blur, bo góc 18px, avatar pixel pig 36px viền 2px mực.
  - Bong bóng tin nhắn người dùng: Nền Vàng Cám `#F4B93B`, viền 3px mực, bóng cứng 3px 0-blur, bo góc 18px, chữ Nâu Mực `#2B2118`.
  - Thanh nhập chat `ChatInputBar`: Nền kem `#F6EEDC`, viền trên 2.5px mực, ô gõ `#FFFBF1` viền 2.5px mực, nút đính kèm & nút Gửi Vàng Cám viền 2.5px mực nổi khối.
  - Thẻ xác nhận ghi sổ 1-chạm & MiniMetric: Viền 2.5px mực, bóng cứng 2px, giá tiền font Baloo 2 `tabular-nums`, nút [Lưu vào sổ] Vàng Cám.
- **Squad Locket Nuôi Heo**:
  - Segment gạt `[🐷 Heo Béo] [👥 Bạn thân]`.
  - Thanh độ no `SegmentBar10` neo xanh/đỏ, còi SOS Overspending Beacon.

### 2.2. Phân Hệ 2: Game Heo Bay (`PigFlightGameView`)
- **Engine & Fix WebView Canvas (Quyết định 140)**:
  - Kích thước tường minh: `width: SCREEN_WIDTH`, `height: gameHeight`, `flex: 0` trên cả `containerStyle` và `style`.
  - Bọc source bằng `memoizedSource = useMemo(() => ({ html: htmlContent, baseUrl: '' }), [htmlContent])` chống chặn sandbox iOS WKWebView.
  - Đồ họa pixel canvas siêu mượt 60fps port 1:1 từ `prototype/Game_Heo_Bay.html` (FW 176, FH 224, scale 4x nearest-neighbor).
- **Luật chơi**:
  - Chạm màn hình để vỗ cánh (Flap physics: trọng lực $GRAV=560$, lực nhảy $FLAP=-172$).
  - Thanh độ no `flyHunger` giảm dần theo thời gian; phải ăn các món đồ ăn trên đường (Cá ao, Hoa hồng, Bát cám, Táo đỏ) để duy trì sự sống.
  - Tránh các cột mốc chi tiêu & chướng ngại vật.
  - 4 Biomes phong phú: Vườn nhà, Phố chợ sầm uất, Hồ sen làng quê, Đồng lúa chín vàng.

### 2.3. Phân Hệ 3: Game Heo Bắn (`PigShooterGameView`)
- **Engine & Fix WebView Canvas (Quyết định 140)**:
  - Cấu hình kích thước tuyệt đối tường minh `width: SCREEN_WIDTH`, `height: gameHeight`, `flex: 0` và `baseUrl: ''`.
  - WebView Canvas port 1:1 từ `prototype/Game_Heo_Bay.html` (AW 224, AH 140).
- **Luật chơi**:
  - Slingshot kéo thả Heo Mẹ / Heo Con để bắn phá các khối chướng ngại vật tài chính.
  - Các loại khối: Gỗ (Wood hp 45), Đá (Stone hp 110), Kính (Glass hp 16), Lồng sắt (Cage hp 42).
  - Hệ thống tính điểm và đánh giá 1-3 sao theo mức độ tiết kiệm đạn heo.

### 2.4. Phân Hệ 4: Bản Đồ Chi Tiêu Pixel (`PiggySpendMapView`)
- **Engine & Fix WebView Canvas (Quyết định 140)**:
  - Cấu hình kích thước tuyệt đối tường minh `width: SCREEN_WIDTH`, `height: gameHeight`, `flex: 0` và `baseUrl: ''`.
  - WebView Canvas port 1:1 từ `prototype/Game_Heo_Bay.html` (MW 192, MH 200).
- **Dữ liệu & Tương tác**:
  - Tự động đồng bộ các giao dịch thực tế từ `useTransactionStore` thành các ghim vị trí theo danh mục (Ăn uống: đỏ cam, Cafe: nâu cam, Chợ/Siêu thị: xanh lá).
  - Kết hợp danh sách các quán quen giả lập từ prototype (Phở Bát Đàn, Cà phê Giảng, Bánh mì Dân Tổ...).
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
