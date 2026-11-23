# 🎮 10 — CHILLGAME TAB (TAB GIẢI TRÍ): CHAT, 3 CHILL GAMES & BẢN ĐỒ CHI TIÊU (PROTOTYPE NGÀY 22)

> **Screen-unit:** Tab 3. **TAB GIẢI TRÍ (ChillGame Tab / Pixel Hub)** kết hợp Chat AI Coach / Squad, 3 Game Pixel Art Thư Giãn (Heo Bay, Heo Bắn, Heo Qua Đường) và Bản Đồ Chi Tiêu Pixel port 1:1 từ `prototype/Ví Heo Con ngày 22.html` và `prototype/MASTER-PROMPTS.md` (Quyết định 130, Quyết định 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 151, 153, 166 & Quyết định 167).
> **Bố Cục 2 Khung Siêu Gọn (Quyết định 167):**
> 1. *Khung 1 — Kết Nối & Địa Điểm (1 Box · 2 Cột):* Cột trái `Trò chuyện` (AI & Bạn bè), cột phải `Bản đồ` (Bản Đồ Chi Tiêu GPS Pixel).
> 2. *Khung 2 — Trò Chơi Heo Con (1 Box · 1 Hàng 3 Cột):* `Heo Bay` | `Heo Bắn` | `Qua Đường` (chỉ Icon Pixel + Tên ngắn + Kỷ lục/Sao, vừa khít 1 màn hình không cuộn).
> **Tối Giản Hóa Ngôn Ngữ (Quyết định 166):** Loại bỏ hoàn toàn các từ kỹ thuật khô cứng như `HUB`, `FPS60`, `60FPS`, `Trung tâm`. Chỉ dùng icon Pixel Art và rút gọn badge: `'KẾT NỐI'`, `'QUÁN QUEN'`, `'VỖ CÁNH'`, `'BẮN NÁ'`, `'LÁCH ĐƯỜNG'`.
> **Banner Anime Sài Gòn Hoàng Hôn Ngày 22 ($192 \times 88$ - Quyết định 166 & 167):** Canvas 60fps hoàng hôn 8 dải dither caro 1px, 2 máy bay Vietnam Airlines (port 1:1 viền mực + hoa sen vàng), Skyline 5 địa danh Sài Gòn, đèn beacon nhấp nháy, xe máy đỏ và chú heo `drawPigSprite` ($24\times 20$) đội mũ bảo hiểm vàng kính xanh chạy trên phố, chạm nhảy tung 14 hạt lấp lánh.
> **Chế độ Arcade Game Zero-Scroll & Fullscreen:** Canvas Portrait $176\times 224$ (Heo Bay), $224\times 140$ (Heo Bắn) và $192\times 256$ (Heo Qua Đường), tự động ẩn Tab Bar khi chơi để tối ưu hóa không gian.
> **Kinh Tế Gamification Khép Kín:** Chi tiêu đúng hạn mức $\rightarrow$ Tặng Vé chơi (`gameTickets`) $\rightarrow$ Tiêu vé chơi 3 game $\rightarrow$ Nhặt cám/bánh mì thưởng `pigFood` $\rightarrow$ Cho Heo ăn (`feedPig`) tăng độ no bụng (`pigHunger`) trong Nhà Heo và Vườn Heo.

---

## 1. Kiến Trúc Điều Hướng Chuẩn Prototype Ngày 22
Màn hình Tab 3 hiển thị:
1. **Header:** Tiêu đề tối giản chuẩn mực `GIẢI TRÍ` (Baloo 2 ExtraBold) + Badge Chuỗi Streak `🔥 X ngày`.
2. **Banner Anime Sài Gòn Hoàng Hôn (`EntertainmentBannerWebView.tsx` - $192 \times 88$):** Hoạt họa xe máy, máy bay, skyline địa danh Sài Gòn và tương tác chạm.
3. **Thanh Trạng Thái Gamification:** Chuỗi ngày (Flame), Vé chơi (Ticket), Cám heo (Wheat), Độ no bụng (Utensils) và Nút Cho Ăn nổi bật.
4. **2 Nhóm Thẻ Neo-Brutalist (Viền 3px mực, bóng cứng 3px 0-blur):**

| Nhóm | Thẻ Phân Hệ | Badge Pill | Icon & Màu Nền | Trạng Thái Động Thực Tế | Chức Năng Cốt Lõi |
|---|---|---|---|---|---|
| **I. Kết Nối & Địa Điểm** | **1. Trò Chuyện & Bạn Bè** | `KẾT NỐI` | 💬 `#BFDDF2` | "Heo-Coach đang online" | Chat với Heo-Coach offline 0ms & Squad bạn thân 2.0 |
| | **2. Bản Đồ Chi Tiêu** | `QUÁN QUEN` | 🗺️ `#CDE6C4` | "X ghim hôm nay" | Bản đồ chi tiêu GPS Pixel & quán quen ghé nhiều nhất |
| **II. Trò Chơi Heo Con** | **3. Heo Bay (FlappyPig)** | `VỖ CÁNH` | 🪽 `#FBD3DC` | "Kỷ lục X" | Flappy Pig bay hái đồ ăn, tránh cột |
| | **4. Heo Bắn (AngryPig)** | `BẮN NÁ` | 🎯 `#F8C9B8` | "Sao X/9" | Kéo ná bắn heo phá ổ chim, giải cứu heo con |
| | **5. Heo Qua Đường (VietNamCrossRoadwithPig)** | `LÁCH ĐƯỜNG` | 🚸 `#FFE3A3` | "Sao X/12" | 2.5D lách xe máy, giơ tay xin đường qua 4 địa danh Sài Gòn |

---

## 2. Đặc Tả Chi Tiết Các Phân Hệ & Game Độ Khó Cao

### 2.1. Phân Hệ 1: Trò Chuyện & Squad Bạn Thân (`ChatView`)
- **Giao diện Chat Neo-Brutalist Pixel Art (Quyết định 143, 145 & 146)**:
  - Header: Nút `‹ Quay lại Hub` và tiêu đề *"Trò chuyện · Heo-Coach và hội bạn thân"*.
  - Header segment: Track viền 3px mực `#2B2118`, nền `#FFFBF1`, bóng cứng 3px 0-blur; tab active Vàng Cám `#F4B93B` viền 2px mực, chữ font Baloo 2; **Icon Pixel Art 16×16**: `PixelIconPigCoach` (Heo-Coach) và `PixelIconSquad` (Hội Bạn Thân), tuyệt đối không dùng icon vector mỏng.
  - **Mascot Pixel Art đồng bộ 100%:** Trong `SquadLocketView`, thay thế hoàn toàn `PigBoMascot` bằng `PixelPigAvatar` 16×16 chuẩn palette prototype.
  - **Khung bao `.chatlog`:** Khối thẻ màu kem `#FFFBF1`, viền 3px mực `#2B2118`, bo góc 22px, bóng cứng 4px 0-blur.
  - **Bong bóng tin nhắn `.msg`:**
    - AI Coach: Avatar vuông pixel 30×30px `PixelPigAvatar` viền 3px mực, nền hồng `#F9B8C4`; bong bóng màu kem sàn `#F6EEDC` viền 3px mực, bo góc brutalist 16px.
    - Người dùng (`.msg.me`): Bong bóng nền hồng phấn heo `#F9B8C4` viền 3px mực, chữ Nâu Mực `#2B2118`, căn sát lề phải.
  - **Dải Quick Chips (`.quick`):** Hàng nút chip hình viên thuốc pill viền 2px mực, bóng 2px để chạm hỏi nhanh không cần gõ phím.
  - **Thanh nhập chat `.chatin`:** Nền kem `#F6EEDC`, ô gõ `#FFFBF1` cao 44px viền 3px mực, nút `[Gửi]` Vàng Cám viền 2.5px mực nổi khối.
  - **Dòng quyền riêng tư (`.privacy`):** "Heo-Coach đọc số liệu tổng hợp trong app. Ảnh và vị trí không được gửi đi."

### 2.2. Phân Hệ 2 & 3: Game Heo Bay & Game Heo Bắn
*(Xem đặc tả chi tiết toàn diện về đồ họa, công thức vật lý, độ khó và popup tại [10-GAMES-SPEC.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/screens/heocon/10-GAMES-SPEC.md))*.
- **Chuẩn hiển thị Canvas siêu nét Integer DPR Scaling (3x) (Quyết định 146):**
  - Kích thước buffer nhân 3 (`FW*3`, `FH*3` hoặc `AW*3`, `AH*3`), `ctx.scale(3, 3)` và `imageSmoothingEnabled = false`, kết hợp CSS `image-rendering: -webkit-optimize-contrast; pixelated; crisp-edges;` triệt tiêu 100% hiện tượng mờ trên màn hình Retina/OLED.
  - Bầu trời ban ngày mặc định rực rỡ nắng vàng `#58B6EE` / `#C3E9F8`.
  - Vỗ cánh Flappy Pig bắt sự kiện tức thì 0ms ở `touchstart` / `pointerdown`.
- **Cảm ứng kéo ná Angry Pig di động:** Bắt đồng thời TouchEvent (`touchstart`, `touchmove`, `touchend`, `touchcancel`) với `e.preventDefault()` và `setPointerCapture`, mở rộng vùng chạm ná bán kính 40px để trượt kéo thả mượt mà trên thiết bị thật.

### 2.3. Hub Giải Trí Siêu Gọn (Compact Neo-Cards - Quyết định 146)
- **Bố cục ngang tối giản:**
  - Hộp Icon Pixel `hubic` 46×46px bên trái trên nền pastel đặc (`#BFDDF2`, `#FBD3DC`, `#D4ECC6`) viền 2.5px mực, chứa icon pixel 16×16 tương ứng (`PixelIconChat`, `PixelIconGamepad`, `PixelIconMapPin`).
  - Cột thông tin bên phải: Tag pill viền mực + Tiêu đề in đậm Baloo 2 + 1 dòng trạng thái súc tích. Lược bỏ hoàn toàn đoạn văn mô tả 3 dòng.
  - Thu gọn padding còn 10px, margin còn 8px để cả 3 thẻ nằm gọn gàng trên 1 màn hình không cần cuộn.

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

---

## 4. Đồng Bộ Kinh Tế Vé/Cám 3 Game, Re-Skin Hội Bạn Thân Neo-Brutalist & Luồng Dữ Liệu 5 Tab (Quyết định 168)
- **Chu trình Vé & Cám hợp nhất:**
  - Cả 3 Game (`Heo Bay`, `Heo Bắn`, `Heo Qua Đường`) đều hiển thị thanh `.gbar` trên cùng với số vé `🎫 X vé` và nút `[10 cám = 1 vé]`.
  - Bắt đầu ván chơi trừ 1 vé (`USE_TICKET`).
  - Hết vé chơi: Không cho phép chơi tiếp, rung cảnh báo và hiển thị nút `[10 cám = 1 vé]` (`BUY_TICKET`) ngay trên giao diện để người dùng đổi vé tức thì từ kho cám `pigFood`.
- **Re-skin Hội Bạn Thân (`SquadLocketView`):**
  - Viền đặc 3px `#2B2118`, bóng cứng 0-blur góc 45° (`shadowOffset: { width: 0, height: 3 }`), góc bo 20px, nền kem sáng `#FFFBF1`.
  - Typography: `Baloo2_800ExtraBold` cho tiêu đề và mã phòng, `Nunito_700Bold` cho mô tả và tin nhắn.
  - Locket Feed: Ảnh vuông 1:1 chuẩn Locket viền 3px, badge số tiền pill nền mực chữ vàng cám.
  - Loại bỏ nút back kép `‹ Giải trí` thừa khi nhúng trong `ChatView`.
- **Luồng dữ liệu 5 Tab phản hồi thời gian thực:**
  - Ghi chi tiêu từ Camera (Tab 2), Quick Log (Tab 0) hoặc Chat (Tab 3) $\to$ Thưởng 1 vé chơi (`gameTickets + 1`).
  - Tự động tính toán lại ngân sách ngày, ghim quán hôm nay trên Bản đồ (`todayPinsCount`), và độ đông đúc xe cộ trong Heo Qua Đường.
  - Dùng cám kiếm được từ game để cho Heo ăn (`feedPig`) $\to$ Cập nhật tức thì linh vật Heo tươi cười trong Pixel Garden (Tab 0).
  - Xanh Lá: `#5E9A57`
  - Đỏ Cam: `#E0452B`
- **Typography**: Tiêu đề Baloo 2 (800), Thân bài Nunito (600-800), Số liệu `fontVariant: ['tabular-nums']`.
- **Hiệu năng & Bảo mật**:
  - 100% Offline-First (toàn bộ game và map chạy trơn tru không cần internet).
  - Zero-STK (tuyệt đối không lưu STK trong ghim bản đồ hay nhật ký).
  - Zero điểm ảo FEP (quy chuẩn về chuỗi Streak ngày và số tiền tiết kiệm giữ lại).

---

## 5. Tối Giản Tab Hub, Nút Back Icon-Only & Kiến Trúc Keep-Alive Chống Lag 0ms (Quyết định 169)
- **Nút Back Tối Giản Tuyệt Đối (Icon-Only):**
  - Mọi header của Game, Bản Đồ, Chat và Hội Bạn Thân loại bỏ hoàn toàn các chuỗi text dài (`‹ Trung tâm Heo Con`, `Quay lại`, `‹ Giải trí`).
  - Sử dụng nút tròn Neo-Brutalist 38×38px viền 2.5px `#2B2118`, nền `#FFFBF1`, bóng cứng 0-blur `0 2px 0 #2B2118` chứa icon `ArrowLeft` nổi trần duy nhất.
- **Mở Rộng Khung Chơi Game (Large Game Frames):**
  - Canvas chiếm tối đa ~92–95% chiều rộng và lấp đầy không gian chính của màn hình.
  - Loại bỏ hoàn toàn các nút ảo thừa bên dưới (`Vỗ cánh`, `Tạm dừng`, `Đổi trời` ở Heo Bay) và các thẻ chữ dài lê thê để chạm trực tiếp vào màn hình chơi.
- **Kiến Trúc Giữ Ấm Arcade Multi-Slot (Keep-Alive Anti-Lag):**
  - Giữ ấm 3 Game WebViews đồng thời trong cùng container khi vào Arcade (`opacity: 1/0`, `zIndex: 10/-1`).
  - Chuyển đổi giữa Heo Bay, Heo Bắn và Qua Đường tức thì 0ms, không tốn thời gian khởi tạo lại WebKit.
  - Tuân thủ Rule 4 Fabric iOS: Luôn giữ kích thước thực tế, không dùng `flex: 0` hay `display: none` tránh `CGRectZero`.

---

## 6. Chuẩn Hóa Khung Game 356px & Single-Active WebView Chống Lag (Quyết định 170)

- **Single-Active Game WebView Engine:** Trong `ChatView.tsx`, tại mỗi thời điểm chỉ mount duy nhất 1 WebView của game đang chọn (`activeSubView === 'fly' | 'shooter' | 'cross'`), giải phóng 2 process WebKit còn lại nhằm loại bỏ hoàn toàn cảnh báo lag (Lag Warning) do chạy song song 3 vòng lặp 60fps.
- **Khung Game Chuẩn 356px Pixel Arcade Việt Nam:** Toàn bộ 3 game dùng chung quy cách khung ngoài `width: 356px; max-width: 100%; border: 3px solid #2B2118; border-radius: 20px; box-shadow: 0 4px 0 #2B2118;`, điểm xuyết họa tiết góc Pixel Art (mái đình, rặng tre, mây trắng).
- **Khắc phục lỗi Touch Heo Bay:** Sửa triệt để lỗi cú pháp JS thừa `});` trong `PigFlightGameView.tsx`, đảm bảo chạm bất kỳ điểm nào trong khung game đều vỗ cánh tức thì 0ms.

---

## 7. Trải Nghiệm Game Toàn Màn Hình Chuẩn iOS/Samsung & Thanh TopBar 1 Dòng (Quyết định 171)

- **1-Row Immersive TopBar (~46px):** Cả 3 game gộp nút Back `[←]`, 3 nút đổi game `[🪽 | 🎯 | 🚦]`, vé `[🎫 X]` (chạm để đổi 10 cám = 1 vé) và Reload `[↻]` vào 1 hàng duy nhất ở React Native.
- **100% Screenplay Kéo Sát Đáy:** Không còn thanh thừa trong WebView, không còn khoảng trống đáy, không còn sticker góc SVG (Zero AI-slop). Toàn bộ diện tích phía dưới TopBar là màn hình game tràn viền sắc nét.

---

## 8. Kiến Trúc 2 Game Dọc 9:16 & Header Banner 16-bit Bevel (Quyết định 172)

- **Gỡ Bỏ Hoàn Toàn Heo Bắn:** `PigShooterGameView.tsx` và nhánh `'shooter'` bị xóa bỏ hoàn toàn khỏi ứng dụng. Lưới Game trong `PixelHubDashboard.tsx` hiển thị **2 thẻ lớn cân đối**: **Heo Bay** (`PixelIconWing`) và **Heo Qua Đường** (`PixelIconTraffic`).
- **Header Banner 16-bit Warm Stone & Brass Bevel:** Khung bọc `PixelHubBanner.tsx` và TopBar của 2 game sử dụng viền vát cạnh 16-bit sắc nét (sáng trên-trái `#FFFBF1`/`#F4B93B`, bóng dưới-phải `#85735E`, viền mực `#2B2118`, đinh tán đồng pixel), thay toàn bộ icon bằng bộ 16×16 Pixel Icons thống nhất.

---

## 9. Banner Tab Giải Trí Tối Giản & Đội Xe Sài Gòn 2 Chiều Đúng Vật Lý (Quyết định 173)

- **Khung Banner Tối Giản:** `EntertainmentBannerWebView.tsx` sử dụng khung Neo-Brutalist nhẹ nhàng chuẩn các tab khác (`borderRadius: 22`, `borderWidth: 3`, `borderColor: '#2B2118'`, bóng cứng `4px`), bỏ khung đá vát cạnh & đinh tán dày.
- **Đội Xe Sài Gòn 2 Chiều Đúng Hướng & Đúng Khói:**
  - Làn trên (đi sang Trái $\leftarrow$, `dir = -1`, lật ngang `x.scale(-1, 1)`): **Xe buýt xanh TP.HCM (`fbBus`)** và **Xe máy Việt Nam đội nón lá (`fbRider`, `hat = true`)** — đèn pha chiếu về trái, khói phụt về phải sau đuôi xe.
  - Làn dưới (đi sang Phải $\rightarrow$, `dir = 1`): **Heo lái xe máy / đi bộ** và **Ô tô Taxi Sài Gòn (`fbTaxi`)** — đèn pha chiếu về phải, khói phụt về trái sau đuôi xe.

---

## 10. Bản Đồ Chi Tiêu Việt Nam Thật Chuẩn Production & Giao Diện Tối Giản (Quyết định 175)

- **Bản Đồ Việt Nam Thật (MapLibre GL JS + OpenFreeMap · 0 Đồng):** Thay thế hoàn toàn bản đồ pixel giả lập bằng vector tile OpenFreeMap tùy biến bảng màu Heo Con (`#F6EEDC`, `#9AD3E6`, `#B5DB9A`, `#FFFBF1`), tích hợp lớp GeoJSON nhãn chủ quyền **Quần đảo Hoàng Sa (Việt Nam)** & **Quần đảo Trường Sa (Việt Nam)**, dòng ghi nguồn `© OpenStreetMap · OpenFreeMap`, và chế độ Offline Fallback nền kem sau 4 giây.
- **100% Native React Native Vietnam Slippy Map Engine (Quyết định 178):** Loại bỏ `WebView` khỏi giao diện hiển thị của `PiggySpendMapView.tsx`, dựng trực tiếp bằng React Native `<View>` + `PanResponder` + Native `<Image>` nạp gạch bản đồ đường phố Việt Nam thực tế từ 4 nguồn tự động chuyển đổi (**Google StreetMap VN `hl=vi`** $\to$ **CARTO Voyager** $\to$ **Esri StreetMap** $\to$ **OpenStreetMap**), kết hợp lớp nền Vector địa lý `<Svg>` (Sông Sài Gòn, công viên, các đại lộ chính, đường bờ biển Việt Nam, **Quần đảo Hoàng Sa (Việt Nam)** & **Quần đảo Trường Sa (Việt Nam)**). Xóa bỏ hoàn toàn nền lưới ô vuông 24×24px giả lập và xóa sạch 100% mảng quán mẫu hardcode (`SEED_VN`), chỉ hiển thị giao dịch thật từ `useTransactionStore`.
- **Loại Bỏ Form Ghi Chi:** Xóa bỏ hoàn toàn khung `LƯU CHI TẠI VỊ TRÍ THẬT` — màn Bản đồ chỉ dùng để xem điểm chi tiêu thật (gom cụm 40m Haversine), 4 bộ lọc gọn (`🔥 14N`, `⭐ Quen`, `📍 Gần`, `🏆 Top`), marker ghim pixel 9×12 + mặt heo 16×16 bằng `<Svg>` và Place Card mini có nút chỉ đường deep link.
- **Header Tối Giản Không Kẻ Ngang:** `borderBottomWidth: 0`, dùng `PixelIconBack`, `PixelIconMapPin`, `PixelIconReload`, tối giản chữ và chừa đệm đáy `110px` tránh chồng đè Floating Pill Tab Bar.
