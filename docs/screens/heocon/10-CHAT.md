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
- **Dual-Runtime Android-First & Production 0$ Vĩnh Viễn Map Engine (Quyết định 178, 179, 180, 181 & 182):**
  - **Android `.apk` / Dev Client (`npx expo run:android`, MapLibre Native `13.6.1` OpenGL 60fps — Quyết định 182):** Kích hoạt nhân C++ MapLibre `13.6.1` trong bản build `.apk` với tổ hợp **$0 trọn đời, 0 API key**: sử dụng **`buildHeoconOsmVectorStyle()`** (`src/theme/heoconMapLibreStyle.ts`) phủ bảng màu Heo Con lên nguồn **OpenFreeMap OSM Vector** (`https://tiles.openfreemap.org/planet` / `styles/liberty`) + khe cắm tự động **`pmtiles://file:///...` / `pmtiles://https://...`** (`src/services/pmtilesMapService.ts`), tích hợp trích xuất tên POI từ vector tile (`extractNearbyPoiNameFromFeatures`), GPU `GeoJSONSource` Clustering (`clusterRadius: 40`), ghim pixel 9×12, mặt heo 16×16 và nhãn chủ quyền **Quần đảo Hoàng Sa (Việt Nam)** & **Quần đảo Trường Sa (Việt Nam)**.
  - **Expo Go Fallback (`NativeSlippyMap` Đã Sửa Nghẽn Header — Quyết định 182):** Xóa bỏ hoàn toàn custom `headers` trên `<Image source={{ uri }} />` để phục hồi Disk Cache native và HTTP/2 Happy Eyeballs (hết lỗi kẹt 29s/tile trên IPv6 Cloudflare); kết hợp vẽ nền đường phố khu vực quanh `userPos` + đường bờ biển chữ S Việt Nam trên `<Svg>` ở 0ms và TrackAsia Raster v2 / OSM / Esri.
  - **Lưu Ảnh Tab Camera $\to$ Bắt Buộc Nhập Tiền $\to$ Lưu $\to$ Ghim Điểm Chi Tiêu Kèm Thumbnail Ảnh (Quyết định 181 & 182):** Chỉ khi người dùng nhập số tiền `> 0` và lưu ở Tab Camera, `locationService.ts` mới gắn tọa độ GPS và ghim ngay điểm chi kèm **ảnh thumbnail món đồ vừa chụp** lên Mini Place Card và danh sách Bản đồ.
- **Loại Bỏ Form Ghi Chi:** Xóa bỏ hoàn toàn khung `LƯU CHI TẠI VỊ TRÍ THẬT` — màn Bản đồ chỉ dùng để xem điểm chi tiêu thật (gom cụm 40m Haversine), 4 bộ lọc gọn (`🔥 14N`, `⭐ Quen`, `📍 Gần`, `🏆 Top`), marker ghim pixel 9×12 + mặt heo 16×16 bằng `<Svg>` và Place Card mini có nút chỉ đường deep link.
- **Header Tối Giản Không Kẻ Ngang:** `borderBottomWidth: 0`, dùng `PixelIconBack`, `PixelIconMapPin`, `PixelIconReload`, tối giản chữ và chừa đệm đáy `110px` tránh chồng đè Floating Pill Tab Bar.

---

## 11. Hộ Chiếu Quán Quen (Place Passport & Check-in) — 100% Native React Native (Quyết định 183)

- **Chấm Dứt Cơ Chế Tải Mảnh Gạch (Slippy Tile):** Loại bỏ hoàn toàn nỗi sợ về khung vuông rỗng, màn hình vàng khè hoặc lỗi nghẽn mạng tile trên Expo Go và thiết bị thật. Màn hình được xây dựng 100% bằng Native React Native UI components (`View`, `Text`, `Image`, `ScrollView`).
- **Tự Động Nhận Diện Tên Địa Điểm & Phường/Quận (OS Geocoder 0$):** Tích hợp `reverseGeocodePlaceAsync` sử dụng native Geocoder của hệ điều hành iOS/Android để lấy thông tin Tên Đường, Phường, Quận, Thành phố tự động khi chụp ảnh ở Tab Camera; cho phép người dùng tùy chỉnh/gõ thêm Tên quán (VD: *Phúc Long*, *Cơm tấm Ba Ghiền*).
- **Giao Diện Hộ Chiếu Quán Quen (Place Passport Screen):**
  - **Header Tối Giản:** Nút Back `PixelIconBack`, tiêu đề **Hộ Chiếu Quán Quen** kèm `PixelIconMapPin`, nút làm mới vị trí GPS `PixelIconReload`.
  - **Hero Passport Card:** Thống kê tổng số quán đã ghé, số quận đã đặt chân, quán ruột ghé nhiều nhất và tổng chi tiêu tại các địa điểm.
  - **Bộ Lọc Neo-Pills:** `🔥 14N` (Gần đây), `⭐ Quen` (Tần suất cao nhất), `📍 Gần` (Sắp xếp theo khoảng cách GPS từ vị trí hiện tại), `🏆 Top` (Nơi tiêu tốn nhiều tiền nhất).
  - **Banner Retro-Tag:** Thông báo nhắc nhở nhẹ nếu có ảnh chưa được gắn vị trí để 1-chạm gắn nhanh GPS hiện tại.
  - **Danh Sách Thẻ Check-in Quán Quen (Place Passport Cards):** Hiển thị ảnh Locket thật chụp tại quán, tên quán, địa chỉ, badge số lần ghé (`🔥 Ghé X lần`), tổng tiền (`💰 ...k`).
  - **Nút "Chỉ Đường 📍" 1-Chạm:** Tích hợp `Linking.openURL()` mở thẳng ứng dụng bản đồ gốc của máy (Google Maps trên Android / Apple Maps trên iOS) với tọa độ chính xác.
- **Thẻ Sảnh Tab Giải Trí (Tab 3):** Đổi tên thẻ thành **Hộ Chiếu Quán Quen** với mô tả *"Check-in quán xá, album ảnh Locket & chỉ đường 1-chạm"*.

---

## 12. Trải Nghiệm Hộ Chiếu Quán Quen Chân Thực & Con Dấu Thị Thực Các Quận (Quyết định 184)

- **Mô Phỏng Sổ Hộ Chiếu Chân Thực (True Passport Simulation):**
  - Bìa Hộ Chiếu phong cách Neo-Brutalist: Số hộ chiếu du lịch `№ PK-8824-VN`, Quốc huy / Huy hiệu Heo Con Pixel `👑 🐷`, lưới 4 chỉ số `psgrid` (Quán đã ghé, Quận đã đến, Quán ruột, Tổng chi).
  - **Khối Con Dấu Thị Thực Các Quận (`psstamps`):** Mỗi quận/huyện người dùng đã check-in được đóng một con dấu thị thực (`psstamp`) với góc xoay so le `-2deg` / `2deg` (chuẩn CSS line 517–518 prototype `Ví Heo Con 24_11.html`) trên các tông màu mực thị thực (đỏ son, xanh dương, xanh lục, tím than), hiển thị `★ [Tên Quận] · [Số lần] ★`.
- **Gỡ Bỏ Hoàn Toàn Banner Phụ:** Loại bỏ thanh banner chủ quyền thừa trên giao diện UI để màn hình thanh thoát, tinh tế và tập trung 100% vào trải nghiệm trang Hộ Chiếu.
- **Bộ 8 Icon Pixel Art 5×5 Chi Tiết Port 1:1 (`KIND`):** Tái tạo chính xác ma trận 5×5 pixel từ prototype `Ví Heo Con 24_11.html` cho các danh mục:
  - `food`: Chén phở nóng nghi ngút (`#E0452B`, `['.....','#####','#####','.###.','.....']`)
  - `cafe`: Ly trà/cà phê bốc khói (`#D9822B`, `['.#.#.','.....','#####','#...#','.###.']`)
  - `market`: Giỏ chợ / sạp rau (`#5E9A57`, `['#####','#.#.#','#####','#...#','#####']`)
  - `shop`: Túi mua sắm / áo thời trang (`#E8548C`, `['.###.','#####','#####','#####','#####']`)
  - `gym`: Tạ tay thể thao (`#4B6FA5`, `['##.##','#####','#####','#####','##.##']`)
  - `gas`: Cây xăng di chuyển (`#7A7A84`, `['..#..','.###.','#####','#####','.###.']`)
  - `pharm`: Chữ thập nhà thuốc (`#3FA796`, `['..#..','..#..','#####','..#..','..#..']`)
  - `fun`: Rạp phim / máy chơi game (`#8A5BB5`, `['..#..','#####','.###.','##.##','#...#']`)
- **Tối Giản Văn Bản (Reduce Text & Focus Icon):** Rút gọn tối đa chữ rườm rà. Mỗi thẻ quán hiển thị ảnh chụp thật Locket hoặc Icon Pixel 5×5 sắc cạnh, tên quán + quận, 2 badge số lần ghé & tổng chi, và nút chỉ đường 1-chạm.

---

## 13. Chuẩn Hóa 1:1 Prototype 24/11 & MASTER-PROMPTS PLAN 13–19: Chat Heo AI, Quán Quen Chợ Bến Thành Mở Rộng & 100% Pixel Icons (Quyết định 185)

- **Gỡ Bỏ Chữ Hình Thức Tự Bịa (Thay Thế Quy Định Hiển Thị Của Mục 12):**
  - Loại bỏ hoàn toàn `"№ PK-8824-VN"`, `"CỘNG HÒA TIẾT KIỆM HEO CON"`, `"HỘ CHIẾU QUÁN QUEN"` trên thẻ Hero, `"CON DẤU THỊ THỰC CÁC QUẬN"` và tên `"Anh Minh"` khỏi giao diện.
  - Màn hình địa điểm dùng tiêu đề ngắn **`Quán Quen`** (sạch chữ backend: bỏ nút `"Định vị"`, bỏ dòng `"Gần bạn tính từ GPS thật"` và chuyển công tắc `"Tự gắn vị trí khi lưu chi ở tab Chụp"` về Cài đặt — QĐ 186); thẻ `.pshero` gộp thành **1 hàng 3 cột siêu gọn** (`Đã ghé: X quán · Y quận` | `Quán ruột` | `Tổng chi`) + dải con dấu quận thật xoay `-2.5deg`/`2.5deg` bên dưới; bộ lọc 4 chip gồm **`Gần đây`** (`PixelClockIcon`, 14 ngày gần nhất), **`Quen`**, **`Gần bạn`**, **`Chi nhiều`**; nút **`Chỉ đường`** chuẩn Production mở Google Maps/Apple Maps theo tọa độ GPS thật hoặc tên địa chỉ thật (0 hardcode tọa độ/quận `"Bình Thạnh"`, `"Quận 1"`).
- **Banner Chợ Bến Thành Cuộn Ngang Đa Quầy (`BenThanhStreetBannerWebView.tsx`):**
  - Viewport `192×100` (bo 24px, viền 3px mực), thế giới phố rộng `560×100` với camera `camX` trượt mượt theo chú heo qua 12 gian hàng Chợ Bến Thành (Phở bò, Bún bò, Trà đá vỉa hè, Cà phê bệt, Bánh mì, Cơm tấm, Bánh xèo, Chè Ba Màu, Nón lá & Áo dài, Gốm & Sơn mài, Quà đặc sản, Lồng đèn & Heo đất), kèm thanh chip cuộn ngang chọn quầy.
- **Trò Chuyện Heo AI (`ChatView.tsx` + `CafeChatBannerWebView.tsx`):**
  - Bỏ hoàn toàn `"Hội Bạn Thân (Squad)"` khỏi Chat và Hub (PLAN 17).
  - Banner Quán Cà Phê Sài Gòn `144×96` pixelated port 1:1 `cbStatic`/`cbDraw`, 2 bong bóng thoại `.bnb.me` & `.bnb.ai` nổi trên banner, giữ danh sách tin nhắn cuộn bình thường (`FlatList`) bên dưới, 5 chip gợi ý nhanh & giọng văn heo (`"heo"` / `"bạn"`).
- **100% Icon Pixel Art & Đồng Bộ Đa Tab (QĐ 185):**
  - Chuyển đổi toàn bộ icon trong Hub, Chat, Quán Quen sang SVG Pixel Art (`PixelIcons.tsx`).
  - Hub hiển thị 3 thanh Việc nhà (`Heo`, `Cá ao`, `Hoa hồng`) đồng bộ Backend `gamificationStore`, Game `Heo Bay` và câu trả lời của Heo AI; 4 Cổng Phòng từ Tab Nhà (`StatsView`) điều hướng thẳng tới Hồ sơ / Game / Quán Quen / Trò chuyện Heo AI.

---

## 14. Phân Tầng Icon Hợp Lý — Hybrid Icon Hierarchy (Quyết định 187)

- **Khung Điều Hướng Hệ Thống (Vector Icons):**
  - Thanh Tab Bar nổi (`FloatingPillTabBar`): 5 icon Vector Lucide `Trees` (Vườn), `Home` (Nhà), `Camera` (Chụp), `Gamepad2` (Giải trí), `User` (Hồ sơ).
  - Nút Back ở TopBar các màn hình (`ChatView`, `Quán Quen`, `Heo Bay`, `Heo Qua Đường`): Icon Vector `ArrowLeft` từ `lucide-react-native` (size 18, viền 2.8px mực `#2B2118`).
- **Body, Deepbody & Micro-items (Pixel Art Icons):**
  - Giữ nguyên 100% đồ họa Pixel Art SVG cho nội dung: Game Arcade HUD (vé `PixelIconTicket`, cám, cúp, cánh, xe), 3 Việc nhà (Lửa, Cá, Hoa), 8 Glyphs 5×5 ẩm thực, con dấu quận xoay góc, chip lọc vi mô (`PixelIconClock`, `PixelIconStar`, `PixelIconCoin`) và Banner WebViews.

---

## 15. Chuẩn Hóa Toàn Diện Icon Vector Mỏng Đơn Sắc (Slim Monochrome Vector Icons) — Quyết định 188

- **Loại Bỏ Pixel Art Icon Thô Ráp Ở Mọi Màn Hình ("No AI Slop"):**
  - Toàn bộ icon tính năng, chỉ số, danh mục ẩm thực và nút bấm chuyển sang **Vector Mỏng Đơn Sắc (`lucide-react-native`)** viền đều `strokeWidth = 2.0px`.
  - Không còn hiện tượng mờ nhòe hạt, biến dạng khi zoom hay vỡ nét trên màn hình Retina / OLED.
- **Màu Sắc Đơn Sắc Theo Theme (Subtle Theme Accents & Monochrome Ink):**
  - Ngọn lửa Streak: `Flame` (viền cam đỏ `#E0452B`, strokeWidth 2.2).
  - Cá ao việc nhà: `Fish` (viền xanh biển `#2563EB`, strokeWidth 2.0).
  - Hoa hồng việc nhà: `Flower2` (viền hồng đỏ `#E11D48`, strokeWidth 2.0).
  - Vé Arcade & Cám: `Ticket`, `Wheat` (viền vàng mật `#D97706`, strokeWidth 2.0).
  - Quán Quen 8 danh mục: `Utensils`, `Coffee`, `ShoppingBag`, `Store`, `Dumbbell`, `Fuel`, `Pill`, `Sparkles` trong khung bo mềm 12px pastel tint.
  - 4 Chip lọc & Ghim: `Clock`, `Star`, `Coins`, `LocateFixed`, `MapPin`.
  - Khung nhập Chat & Nút bấm: `Send`, `Camera`, `MessageSquare`, `Feather`, `Car`, `UtensilsCrossed`.
- **Bảo Tồn Linh Vật Heo Con:**
  - Giữ nguyên avatar linh vật Heo Con 24×20 (`PixelPigAvatar`) để bảo vệ linh hồn nhận diện thương hiệu của app.
- **Kiến Trúc Tương Thích Ngược:**
  - `src/components/pixel/PixelIcons.tsx` đóng vai trò Vector Wrappers mỏng chuẩn `lucide-react-native`, đảm bảo không làm gãy các module hiện có và duy trì 100% kiểm thử hồi quy.

---

## 16. Chuẩn Hóa Trang Main Tab Giải Trí (Quyết định 189)

- **Tiêu Đề Giải Trí Chuẩn Trang Hồ Sơ:**
  - Bỏ huy hiệu con nhộng `brandBadge` và dấu chấm `brandDot` trước chữ Giải trí.
  - Sử dụng tiêu đề `<Text style={styles.screenTitle}>Giải trí</Text>` kích thước 22px, `fontWeight: '800'`, `letterSpacing: 0.5` đồng bộ hoàn toàn với `ProfileView.tsx`.
  - Phía bên phải giữ nguyên huy hiệu Streak ngọn lửa cam đỏ `Flame` viền 2.2px cân đối.
- **Loại Bỏ Khung Việc Nhà Khỏi Hub:**
  - Gỡ bỏ hoàn toàn thẻ `careCard` ("Việc nhà hôm nay") khỏi Tab Giải trí.
  - Toàn bộ cơ chế chăm sóc heo, cá ao, hoa hồng được tập trung duy nhất ở Tab Vườn (Home), trả lại không gian thoáng đãng cho Tab Giải trí tập trung vào 4 dịch vụ cốt lõi: Trò Chuyện Heo AI, Quán Quen, Heo Bay, Heo Qua Đường.
- **Icon Heo Bay Lướt Gió (`Wind`):**
  - Chuyển icon game Heo bay từ lông vũ `Feather` sang `Wind` (Làn gió lượn) từ `lucide-react-native` (`strokeWidth = 2.0px`), mang lại cảm giác lượn gió bay bổng mượt mà trên nền trời Sài Gòn.

---

## 17. Icon Heo Qua Đường & TopBar Arcade Game Tinh Gọn (Quyết định 190)

- **Icon Game Heo Qua Đường (`Footprints`):**
  - Chuyển đổi biểu tượng trò chơi "Heo qua đường" từ icon ô tô (`Car`) sang icon **`Footprints`** (Cặp dấu chân bước đi bộ) từ `lucide-react-native` (`strokeWidth = 2.0px`).
  - Biểu thị rõ ràng, trực quan hành động cuốc bộ sang đường né xe, tạo sự cân xứng hoàn hảo với icon lướt gió `Wind` của game Heo bay.
  - Đồng bộ hiển thị tại thẻ game trên `PixelHubDashboard.tsx` và cụm chuyển đổi game (Pill Switcher) tại TopBar 2 game.
- **TopBar 2 Game Arcade Tinh Gọn (Gỡ Bỏ Nút Reset/Reload Thừa):**
  - Loại bỏ nút vuông `PixelIconReload` khỏi góc trên bên phải header của cả `PigFlightGameView.tsx` và `PigCrossRoadGameView.tsx`.
  - Cơ chế khởi động lại / chơi lại đã được xử lý mượt mà và tức thì 0ms qua modal kết thúc in-game (`.flyover` / `.gover`), không cần và không nên reload toàn bộ WebView thô gây chớp trắng và mất lượt chơi.
  - Cấu trúc thanh TopBar mới tinh giản thành 3 khối công thái học cân bằng:
    1. **Bên Trái:** Nút Quay lại `[←]` (`ArrowLeft` vector sắc nét).
    2. **Ở Giữa:** Pill chuyển đổi 2 game (Gió `Wind` ↔ Dấu chân `Footprints`).
    3. **Bên Phải:** Chip hiển thị số vé `PixelIconTicket` kèm số lượng vé hiện có.

---

## 18. Đồng Bộ Sprite Heo 24×20 Chuẩn Tab Vườn & Header Chat Tinh Giản (Quyết định 191)

- **Đồng Bộ Sprite Heo 24×20 (Chữa Dứt Điểm Heo Béo):**
  - Cả `CafeChatBannerWebView.tsx` (Quán Cà Phê Sài Gòn) và `BenThanhStreetBannerWebView.tsx` (Phố Ẩm Thực Chợ Bến Thành) chuyển sang sử dụng 100% hàm vẽ `drawPigSprite` chuẩn 1:1 từ `PixelGardenWebView.tsx` và `prototype/Ví Heo Con.html`.
  - Khôi phục tỷ lệ 24×20, 4 chân thon gọn nhấc bước so le (`raised`), thân cong 11-13px, đầu mõm tách biệt và khe tiền vàng trên lưng. Heo AI xanh pastel đội ăng-ten đỉnh đầu và Heo chủ hồng dạo phố/uống cà phê đồng nhất hình ảnh thương hiệu với Tab Vườn.
- **Header Trò Chuyện Tối Giản:**
  - Gỡ bỏ hoàn toàn icon ngôi sao tĩnh (`styles.coachBadge`) không có chức năng ở góc trên phải.
  - Xóa dòng subtitle phụ `"Heo AI ngồi quán cà phê, chạy ngay trong máy"`.
  - Tiêu đề chữ lớn `Trò chuyện` (22px `Baloo2_800ExtraBold`, màu mực `#2B2118`) đặt ngay cạnh nút Quay lại `[←]`, bên phải để trống thoáng đãng.
- **Gỡ Bỏ Text Riêng Tư Chân Trang:**
  - Xóa dòng `"Heo AI chạy ngay trong máy, đọc số liệu tổng hợp. Ảnh và vị trí không được gửi đi."` phía trên khung nhập liệu để tối ưu không gian hiển thị tin nhắn trên màn hình mobile.

---

## 19. Tab "Khám phá", Chuẩn Screen Title Toàn App & Chỉ Số "Đã kiếm: X cám" (Quyết định 192)

- **Tên Chính Thức Tab 3 (`Khám phá`):**
  - Tiêu đề màn hình chính đổi từ `Giải trí` sang **`Khám phá`** (Sentence case, `Baloo2_800ExtraBold`, `fontSize: 22`, `fontWeight: '800'`, `letterSpacing: 0.3`).
- **Đồng Bộ Screen Title Toàn App:**
  - Tất cả Screen Title (`Khám phá`, `Thống kê`, `Hồ sơ`, `Cài đặt`, `Trò chuyện`, `Quán quen`) đồng nhất font `Baloo2_800ExtraBold`, size `22px`, chỉ viết hoa chữ đầu, **không gắn icon ở đầu tiêu đề** (đã gỡ `<MapPin />` ở đầu `Quán quen`).
- **Khung `Heo AI` Sạch Gọn:**
  - Bỏ dòng mô tả bị cắt chữ bên dưới thẻ `Heo AI`; giữ thẻ `Quán quen` hiển thị `X lượt ghé`.
- **Chỉ Số Game Có Ý Nghĩa (`Đã kiếm: X cám`) & Lưu Tiến Trình:**
  - Thay thế `Kỷ lục` / `Sao` trên 2 thẻ game (`Heo bay`, `Qua đường`) bằng **`Đã kiếm: X cám`** (`flyFoodEarned`, `crossRoadFoodEarned` trong `gamificationStore.ts`) để người dùng thấy rõ thành quả cám kiếm được dùng để nuôi heo ở Tab Vườn hoặc đổi vé chơi.
  - Lưu bền vững `crossRoadLevelStars` và hydrate vào `PigCrossRoadGameView.tsx` để không mất tiến trình qua phố.

---

## 20. Ẩn Bottom Bar Ở Trò Chuyện & Quán Quen + Chat Liền Mạch IG/Messenger (Quyết định 199)

- **Ẩn Thanh Điều Hướng Đáy (`FloatingPillTabBar`):**
  - Tự động ẩn Bottom Tab Bar khi người dùng vào bất kỳ sub-view con nào (`activeSubView !== 'hub'`: Trò chuyện `'chat'`, Quán quen `'map'`, Heo bay `'fly'`, Qua đường `'cross'`) để không gian thoáng đãng, tối đa diện tích hiển thị.
- **Khung Tin Nhắn & Thanh Nhập Chat Liền Mạch:**
  - Xóa bỏ hoàn toàn đường kẻ ngang (`borderTopWidth: 0`) trên `ChatInputBar`.
  - Vùng tin nhắn mở rộng tràn lề liền mạch xuống thanh nhập liệu (không đóng hộp viền 3px tách rời), nền cố định `#F6EEDC` khớp 100% với `ChatView` ở mọi theme, sát đáy `Math.max(insets.bottom, 10)`.

---

## 21. Banner Không Gian Mở Tương Tác Toàn App (Quyết định 200)

- **Engine Dùng Chung (`src/components/pixel/pixelOpenRoomEngine.ts`):**
  - **Tap-to-Walk:** Chạm bất kỳ vị trí nào trên sàn đi lại (`walkBounds`) để chú heo 24×20 tự quay hướng và bước 4 chân so le tới điểm chạm.
  - **Hotspot Actions Kèm Dữ Liệu Thật:** Chạm vào đồ vật/điểm tương tác trong phòng, chú heo tự bước tới điểm đứng chuẩn (`standX, standY`), thực hiện hoạt ảnh hành động (`sip_coffee`, `type_laptop`, `look_window`, `play_arcade`, `jump_joy`, `eat_snack`, `check_ledger`), rung `HAPTIC_LIGHT` và hiện bong bóng thoại chứa số liệu thật từ Store (không tự chuyển trang).
  - **Autonomous Roaming:** Khi rảnh (~4–6s không chạm), chú heo tự dạo quanh phòng hoặc ghé thăm đồ vật.
- **4 Banner Áp Dụng:** `CafeChatBannerWebView` (Trò chuyện), `ProfileDeskBanner` (Hồ sơ), `EntertainmentBannerWebView` (Khám phá), `BenThanhStreetBannerWebView` (Quán quen).

---

## 22. Thế Giới Mở 2D Văn Hóa Việt Nam & Camera Lia 4 Hướng (Quyết định 201)

- **Camera 2D Deadzone Smooth Follow (`camX`, `camY`):**
  - Cả 4 banner mở rộng thành thế giới 2D lớn hơn khung nhìn cả chiều ngang lẫn chiều dọc (`CafeChat 360×184`, `ProfileDesk 420×160`, `Entertainment 460×168`, `BenThanh 584×172`).
  - Khi chú heo di chuyển tới vùng biên (~28% mép khung hình), camera tự động lia mượt sang khu vực kế tiếp; hỗ trợ vuốt kéo trực tiếp trên banner để lia xem trước bản đồ (`Drag-to-Pan`) và hiển thị mũi tên biên (`◄ ► ▲ ▼`) khi còn không gian mở rộng.
- **Bối Cảnh Văn Hóa Việt Nam:** Quầy cà phê phin, hiên cà phê bệt ghế nhựa, xe bánh mì, quạt trần, nhà sàn gỗ, chiếu cói, Chợ Bến Thành, Bitexco, Landmark 81, xe máy nón lá, xe buýt xanh, xích lô, đèn lồng Hội An, bờ sông Sài Gòn.

---

## 23. Panorama 16-Bit Việt Nam Liền Mạch 100% Cho Tab Khám Phá (Quyết định 202)

- **Single-Canvas `540×112` (Viewport `192×88`) — 0 Vết Cắt Ghép:**
  - Nâng cấp `EntertainmentBannerWebView.tsx` lên 1 bức Panorama 16-bit liền mạch 540px (`buildSeamlessPanorama` + `getTimePalette` tự đổi 3 sắc trời Sáng/Chiều/Tối), nối liền 5 phân khu Việt Nam trên cùng 1 dải trời, skyline, vỉa hè lát gạch và đại lộ 2 làn xuyên suốt 540px (xe buýt xanh, taxi, xe máy nón lá chạy liền mạch từ mép trái sang mép phải).
- **Chống Che Bottom Bar (`PixelHubDashboard.tsx`):** Tinh gọn khoảng cách dọc giữa header, metric chips và 2 section boxes để 2 thẻ `Heo bay` & `Qua đường` hiển thị trọn vẹn phía trên `FloatingPillTabBar`.

---

## 24. Công Thức Diện Tích Quán Cà Phê Liền Mạch `432×128` & Cổng Liên Thông Khám Phá (Quyết định 203)

### Công Thức Diện Tích & Tỷ Lệ Không Gian Phòng
- **Viewport:** `W_view = 144px`, `H_view = 96px` (tỷ lệ `3:2`, diện tích `13,824 px²`).
- **Thế giới nội thất (1 Offscreen Canvas duy nhất, 0 vết ghép):**
  - `W_world = 3 × W_view = 432px`
  - `H_world = (4/3) × H_view = 128px`
  - Tổng diện tích logic: `432 × 128 = 55,296 px²` (gấp `4×` khung nhìn).
- **Phân bổ trục cao (`128px`):**
  - `y: 0..16` (`12.5%`): Trần gỗ, quạt trần 4 cánh & dây đèn thả.
  - `y: 16..74` (`45.3%`): Tường kem gỗ, quầy bar pha phin, cửa sổ 3 sắc trời, kệ sách, cây thông trang trí, cửa kính ra phố.
  - `y: 74..78` (`3.1%`): Len chân tường gỗ.
  - `y: 78..128` (`39.1%`): Sàn gạch bông Sài Gòn liên tục (`walkBounds: x = 18..414, y = 82..120`).
- **Phân bổ 4 khu chức năng (`432px`):**
  1. **Quầy Bar & Cà Phê Phin (`x: 0..112`, `25.9%`):** Máy espresso, 2 phin nhôm bốc khói, tủ kính bánh mì/bánh ngọt, bảng menu, ghế bar.
  2. **Bàn Heo & Heo AI (`x: 112..240`, `29.6%`, `initialCamX: 104`):** Bàn gỗ tròn, Heo AI đeo kính, cửa sổ nhìn ra phố Sài Gòn 3 khung giờ (Sáng/Chiều/Tối), quạt trần 4 cánh.
  3. **Góc Đọc Sách & Cây Thông (`x: 240..344`, `24.1%`):** Kệ sách gỗ cao, ghế bành đọc sách, đèn cây vàng ấm, Cây thông trang trí ngôi sao & quả châu lấp lánh, tranh treo tường.
  4. **Cửa Ra Ngoài Trang Khám Phá (`x: 344..432`, `20.4%`):** Cửa kính vòm khung gỗ, biển `RA PHỐ`, thảm chùi chân & chậu cây.
- **Cổng Liên Thông 2 Chiều & Smart Bubbles:**
  - Chạm tiệm `CAFE` trên Banner Khám phá (`onEnterCafe`) hoặc thẻ `Heo AI` ➔ vào Quán Cà Phê.
  - Chạm `Cửa Ra Phố` (`exit_door` → `onExitToHub`) trong Quán Cà Phê ➔ quay về Tab Khám phá.
  - Bong bóng thoại Heo AI tự ẩn khi camera rời khỏi khu bàn trung tâm (`camX` ngoài `[68, 152]`) để ngắm trọn nội thất quán.

## 25. Nâng Cấp Tiệm CAFE Ngoại Thất 1:1, Sàn Gạch Bông Indochine 16×16 & Cổng Vào Siêu Tốc (Quyết định 204)
- **Cổng Vào Siêu Tốc (`fastDash: true`):** Khi chạm vào Tiệm CAFE trên Banner Khám phá (`saigon_cafe`) hoặc `Cửa Ra Phố` (`exit_door`), chú heo kích hoạt tốc độ lướt nhanh `160 px/s` thẳng tới ngưỡng cửa và chuyển cảnh trong `300ms` (không còn trễ 5–8s).
- **Ngoại Thất Tiệm CAFE 1:1 (`EntertainmentBannerWebView.tsx`):** Mặt tiền kem/cam ấm 2 tầng, bảng hiệu `CAFE` chữ pixel khối, mái hiên sọc xanh-trắng, cửa kính phản chiếu chéo, bàn tròn vỉa hè với 2 khách uống cà phê, cửa chính gỗ trắng 2 cánh, khối phụ cửa sổ vòm với 2 bạn trò chuyện, cây tùng xoắn ốc pastel trong bồn gạch, cột đèn chỉ hướng & bảng menu chữ A.
- **Sàn Gạch Bông Indochine 16×16 (`CafeChatBannerWebView.tsx`):** Căn chỉnh lưới `16×16` chuẩn xác từ len chân tường (`y = 78`) đến đáy (`y = 128`), hoa văn 8 cánh cổ điển màu xanh ngọc (`#4A8A80`) & đất nung (`#C4603A`) trên nền kem sứ (`#F7EED8`); kết hợp lambris gỗ (`y = 58..78`) đồng bộ tỷ lệ với chú heo `24×20`.

## 26. Không Gian Chợ Bến Thành (Ngoại Thất Cửa Nam + Nội Thất 3 Phân Khu Pixel Art 10YOE — Quyết định 205)
- **Cổng Liên Thông 2 Chiều (`Quán quen` ↔ `Chợ Bến Thành`):**
  - Chạm trực tiếp vào Cổng Cửa Nam Chợ Bến Thành (`ben_thanh_gate`, `fastDash: true`) trên Banner `BenThanhStreetBannerWebView` ➔ chú heo lướt nhanh vào cổng và mở màn hình `BenThanhMarketView` trong `≤ 300ms`.
  - Trong `BenThanhMarketView`, chạm `Cổng Ra Quán Quen` (`exit_market`, `fastDash: true`) hoặc nút `[←]` ➔ quay lại Tab `Quán quen`.
- **Thông Số Không Gian Lòng Chợ (`BenThanhMarketBannerWebView.tsx`):**
  - Khung nhìn `192 × 112` trên thế giới liền mạch **`576 × 144`** (gấp `3×` chiều rộng).
  - **Trần vòm thép vàng & Ô lấy sáng trời (`y: 0..42`):** Giàn kèo thép vàng `#D49B35` / `#8C5E1A` giao nhau, ô kính lấy sáng `#FBEAC2`, đèn tuýp huỳnh quang & quạt trần xanh lá `#3E8A58`.
  - **4 Phân Khu Lòng Chợ:**
    1. `x: 0..176`: **Sạp Vải, Túi Xách & Nón Lá (`HƯƠNG TRINH`)** — vải lụa xếp tầng, túi xách treo, nón lá, quạt giấy, người bán ngồi ghế nhựa.
    2. `x: 176..344`: **Sạp Thủ Công Mỹ Nghệ & Đồ Lưu Niệm** — giỏ tre đan, bình sơn mài, dải LED vàng ấm chiếu sáng tượng lưu niệm.
    3. `x: 344..500`: **Sạp Trái Cây Nhiệt Đới (`1029 NGỌC HẢO`)** — tháp bưởi xanh, xoài vàng, thanh long, sầu riêng, chôm chôm.
    4. `x: 500..576`: **Cổng Ra Quán Quen (`exit_market`)** — cổng vòm sáng hướng ra mặt tiền.

## 27. Sửa Lỗi Engine Canvas `psCv` & Cổng Chợ Bến Thành Từ Cả Khám Phá Lẫn Quán Quen (Quyết định 206)
- **`BenThanhStreetBannerWebView.tsx`:** Đồng bộ `canvasId: 'psCv'` khớp `<canvas id="psCv">`, bật `touch-action: none` và đặt `PB.camX = 185` khi khởi tạo để Cửa Nam Chợ Bến Thành hiện ngay chính giữa Tab Quán quen.
- **`EntertainmentBannerWebView.tsx` & `ChatView.tsx`:** Hotspot `ben_thanh_notre` trên Banner Tab Khám phá bật `fastDash: true` và kích hoạt `onEnterMarket` (`≤ 300ms`). `ChatView.tsx` lưu `marketReturnSubView` (`'hub'` hoặc `'map'`) để nút `[←]` / `Ra phố` trả về đúng Tab nguồn.

## 28. Master Blueprint & Phố Lễ Hội Ẩm Thực Quán Quen (`584×160` — Quyết định 207)
- **Tài liệu gốc:** Tuân thủ [`docs/PIXEL_OPEN_WORLD_SPEC.md`](../../PIXEL_OPEN_WORLD_SPEC.md) về công thức diện tích 4 tầng, chuẩn vẽ 3 lớp chiều sâu, 3 sắc trời theo giờ, và cơ chế trượt camera giữ góc nhìn `3000ms` (`panHoldUntil`).
- **Tab Quán Quen (`BenThanhStreetBannerWebView.tsx`, `584×160`):** Nâng cấp thành **Phố Lễ Hội Ẩm Thực 2 Bên Đường** gồm 8 sạp đặc sản Việt Nam (Phở bò bốc khói, Bún bò & Bánh mì, Bánh xèo & Nước mía, Chè Ba Màu, Xiên nướng, Nón lá & Áo dài, Gốm & Sơn mài, Lồng đèn & Heo đất), dây đèn lồng Hội An 3 khung giờ, du khách đứng lựa món trên vỉa hè trên và ngồi bàn ghế nhựa xanh/đỏ ăn uống ở hàng quán vỉa hè dưới, bao quanh Cổng Cửa Nam Chợ Bến Thành (`fastDash` vào Lòng Chợ).

## 29. Tái Thiết Kế Lòng Chợ Bến Thành (`680×152`) Bám Sát 1:1 7 Ảnh Thực Tế (Quyết định 208)
- **Hành trình 4 phân khu liên thông (`initialCamX = 0`, `initialX = 82`):**
  1. `x: 0..156`: **Cửa Số 1** — cửa sắt xếp kem xám, biển xanh `CUA SO 1`, bảng LED `WELCOME TO BEN THANH`, `WATCH`, 2 chú bảo vệ (`exit_market` với `fastDash: true` quay ra ngoài phố).
  2. `x: 156..336`: **Sạp Đặc Sản `LIEN SAI GON` & `NGOC HOA`** — kệ trà/cà phê/bánh kẹo, chao đèn mây tre đan, mái vòm bê tông vàng & ô giếng trời đỏ nâu.
  3. `x: 336..512`: **Cổng Vòm Cong `KHU AN UONG` & Quầy Chữ L `Sạp 1044`** — tủ kính đồ ăn, chùm dừa tươi góc quầy, hàng ghế đẩu inox sáng bóng.
  4. `x: 512..680`: **Hẻm Ẩm Thực Nóng** — biển vàng `BANH CUON 50K` (nồi hơi bốc khói, quầy gạch bông), `BUN BO HUE`, và `BANH BEO 20K` (mặt bàn đá mài vàng, dĩa bánh bèo, nem chua lá chuối).
- **Sàn hành lang chợ (`y: 102..152`):** Gạch chữ nhật nâu đất – kem xám kèm 2 dải gạch dẫn hướng nâu đỏ sẫm dọc hành lang.

## 30. Sửa Lỗi Đứng Hình Dòng 479 & Nâng Cấp Chợ Bến Thành Full-Focus 60fps (`680×176` — Quyết định 209)
- **Khắc phục triệt để bug runtime (`BenThanhMarketBannerWebView.tsx`):** Sửa `R(x-sp,...)` thành `R(x,fx-sp,...)` trong `drawLiveMarketEffects` + bọc `try/catch` để chú heo `24×20` và thao tác trượt camera hoạt động mượt 60fps.
- **Mở rộng không gian Full-Focus (`BenThanhMarketView.tsx`, `680×176` trên viewport `192×136`):** Xóa bỏ toàn bộ `zoneCard`, `statsCard` và thanh toast rời; mở rộng khung Chợ Bến Thành chiếm trọn trọng tâm màn hình kèm 1 hàng chip ngang 4 khu ở đáy. Bổ sung `drawWalkingShoppers` (du khách đi bộ dạo chợ 2 chiều Y-sorted với heo) và quầng sáng đèn ấm.

## 31. Đại Tu Lòng Chợ Bến Thành 16-Bit 2.5D Có Chiều Sâu 4 Lớp & Pixel Vuông 1:1 (`720×280` — Quyết định 210)
- **Khóa tỷ lệ Pixel vuông 1:1 (`BenThanhMarketBannerWebView.tsx`):** Đổi kích thước khung nhìn sang **`VW = 208, VH = 240`** với `aspectRatio: 208 / 240` trên thế giới **`720 × 280`** — triệt tiêu 100% lỗi kéo giãn dọc gây méo chú heo & nhân vật.
- **4 Lớp Chiều Sâu 2.5D & Sprite Người `14×22` (`drawPerson16Bit`):**
  1. `y: 0..56`: Mái vòm bê tông cong parabol, kèo thép chữ A, giếng trời chiếu tia nắng xiên (`sunbeams`) & chao đèn mây tre đan nan (`drawRattanLamp`).
  2. `y: 56..148`: 4 phân khu sạp hàng 3D chi tiết từng vật phẩm (cửa sắt xếp mắt cáo `drawAccordionGate` + hậu cảnh sạp Áo dài, hũ mứt nắp đỏ & hộp trà `LIÊN SÀI GÒN`, cổng vòm 3D `KHU ĂN UỐNG` + nồi nước lèo có bếp lửa + dừa tươi `Sạp 1044`, nồi hơi vải trắng `Bánh Cuốn 50K` & mặt bàn đá mài terrazzo + 12 chén `Bánh Bèo 20K` + chùm nem chua lá chuối).
  3. `y: 148..196`: Hành lang đi dạo chính, ghế đẩu inox có kiềng & thực khách `14×22`.
  4. `y: 196..280`: **4 Đảo Giữa Chợ Y-Sorted (`drawForegroundIslands`)** ở nửa dưới sàn (Đảo Lưu Niệm Nón Lá, Đảo Trái Cây `1029 Ngọc Hảo`, 2 Đảo Bàn Ăn Khu Ẩm Thực đầy món ăn & thực khách) để chú heo đi vòng quanh.

## 32. Chợ Bến Thành Toàn Màn Hình RPG (`1024×360`), 2 Cổng Trước/Sau & Tấp Nập Du Khách (Quyết định 211)
- **Fullscreen 100% không viền/không card (`BenThanhMarketView.tsx` & `ChatView.tsx`):** Bỏ hoàn toàn Header, nút `"Ra phố"` và thanh chip 4 khu ở đáy; canvas tràn 100% mép màn hình với duy nhất 1 nút tròn `[←]` bán trong suốt góc trên trái.
- **Dynamic 1:1 Square Pixel Engine (`pixelOpenRoomEngine.ts`):** Bổ sung `window.__openRoom.resize(vw, vh)` tự tính `VW, VH` theo kích thước màn hình thực tế để pixel luôn vuông 1:1 trên mọi điện thoại.
- **Đại Thế Giới `1024 × 360` & 2 Cổng Ra (`BenThanhMarketBannerWebView.tsx`):**
  - **Cổng Trước (`exit_market`, `Cửa Số 1` bên trái)** và **Cổng Sau (`exit_back_gate`, `Cửa Bắc` bên phải)** đều bật `fastDash: true` để bước ra ngoài phố.
  - **6 phân khu trên** (Cửa Số 1 ➔ Quần Áo `HƯƠNG TRINH` ➔ Đặc Sản `LIÊN SÀI GÒN & NGỌC HOA` ➔ Vòm `KHU ĂN UỐNG` Sạp 1044 ➔ `BÁNH CUỐN 50K & BÁNH BÈO 20K` ➔ `CỬA BẮC`) + **5 Đảo Giữa Chợ Y-Sorted** (Lưu Niệm, Trái Cây `1029`, 2 Đảo Bàn Ăn, Đảo Hoa Tươi & Gốm) + **20+ nhân vật** gồm cả **khách du lịch nước ngoài** (tóc vàng/balo du lịch/kính râm/máy ảnh) và người Việt tấp nập ở 2 hành lang song song.

## 33. Tái Thiết Kế Toàn Diện Chợ Bến Thành Chuẩn 32-Bit Indie Game (`1200×480` — Quyết định 212)
- **Kiến trúc Asset Mô-đun (`src/components/chat/market/`):** Tách thành 4 module độc lập: `marketPalette.ts` (bảng màu ấm & dithering), `marketArchitecture.ts` (2 cổng vòm thuộc địa Cửa Số 1 & Cửa Bắc nhìn ra phố xe máy, sàn gạch `16×16` có vết mòn & rãnh thoát nước, mái vòm kèo thép & tia nắng xiên), `marketStalls.ts` (3 dãy sạp dày đặc không trùng lặp), `marketCrowd.ts` (nhân vật đa dạng, nhóm nói chuyện, khách tây/Việt, người bán hàng).
- **3 Dãy Sạp Thương Mại (`1200 × 480`, 0 khoảng sàn trống):**
  1. **Dãy Bắc (`y: 58..166`):** Cửa Số 1 ➔ Vải & Áo Dài `HƯƠNG TRINH` ➔ Đặc Sản `LIÊN SÀI GÒN & NGỌC HOA` ➔ Vòm `KHU ĂN UỐNG` `SẠP 1044` ➔ `BÁNH CUỐN 50K & BÁNH BÈO 20K` ➔ Cửa Bắc.
  2. **Dãy Đảo Trung Tâm (`y: 224..292`, Y-Sorted):** Đảo Trái Cây `1029 NGỌC HẢO` (xoài, cam, chuối, thanh long, dừa, dưa hấu, cân đồng hồ) ➔ Đảo Rau Củ, Thịt & Hải Sản Đá Lạnh ➔ Đảo Bàn Ăn 1 ➔ Đảo Lưu Niệm, Gốm Sơn Mài & Nón Lá.
  3. **Dãy Nam (`y: 356..466`, Y-Sorted):** Quầy Nước Mía & Dừa Tươi ➔ Sạp Chè & Bánh Dân Gian ➔ Đảo Bàn Ăn 2 ➔ Sạp Hoa Tươi & Gia Dụng.
- **Va Chạm AABB (`pixelOpenRoomEngine.ts`):** Hỗ trợ `obstacles` giúp chú heo đi lại mượt theo 2 lối đi chính & trượt quanh các sạp hàng thay vì đi xuyên quầy kệ.

### 34. Bố Cục Cổng Vòm Dọc Hai Đầu, 7 Shop Bắc Kín Ngang & 12 Hàng Quán Trung Tâm Sát Kề (Quyết định 213)
- **2 Cổng Vòm Tròn Nằm Dọc Giấu Không Gian Ngoài (`marketArchitecture.ts`):** Đưa 2 cổng ra vào (`CUA NAM` bên trái `x: 0..72` và `CUA BAC` bên phải `x: 1128..1200`) về dạng cổng vòm tròn tường vàng kem Chợ Bến Thành nằm dọc cuối 2 đầu đường hành lang (`y: 156..468`), lòng cổng tối ấm giấu kín hoàn toàn không gian phố bên ngoài, kèm thảm đỏ & bảo vệ đứng gác.
- **7 Shop Dãy Bắc Kín Ngang (`marketStalls.ts`):** Chuyển Cửa 1 cũ thành `AO DAI SAI GON` (giữ 4 tà áo dài + tủ `WATCH`) và Cửa Bắc cũ thành `THOI TRANG SAI GON` (quần áo, váy, túi xách); nối liền 7 shop sát vách nhau (`x: 74..1126`, chỉ cách cột 4px): `AO DAI SAI GON`, `HUONG TRINH`, `LIEN SAI GON & NGOC HOA 823`, `KHU AN UONG 1044`, `BANH CUON 50K & BANH BEO`, `PHO BO - BUN BO`, `THOI TRANG SAI GON`.
- **12 Hàng Quán Trung Tâm & Tầng Nam Sát Kề (`6 + 6`):** Tăng mật độ lên 6 đảo trung tâm (`y: 230..290`) + 6 sạp tầng Nam (`y: 374..434`) đặt sát kề nhau (chỉ chừa khe hẻm đi bộ 20px), đồng bộ `obstacles` AABB & 14+ `hotspots` trong `BenThanhMarketBannerWebView.tsx`.

### 35. Nâng Cấp Đồ Họa 32-Bit Indie Game Quality (Quyết định 214)
- **Mái Hiên Vải Sọc 3D & Cụm Hàng Hóa Chi Tiết (`marketPalette.ts` + `marketStalls.ts`):** Bổ sung `drawStripedAwning` (mái vải sọc cam-vàng, xanh ngọc, đỏ đất, kem có viền lượn sóng và bóng đổ xuống quầy), `drawWoodenCrate` (thùng gỗ đựng xoài, cam, thanh long, rau xanh có highlight & AO), `drawBambooBasket`, `drawHangingLantern`, `drawCeramicVase`, `drawFabricStack`.
- **Sàn Chợ Có Chiều Sâu & Dụng Cụ Vỉa Hè (`marketArchitecture.ts`):** Lát gạch đa sắc độ ấm, vết nứt/mòn tự nhiên, rãnh thoát nước, sọt nhựa/gỗ, cân đồng hồ, thùng carton và cụm khách đứng trò chuyện giảm khoảng trống sàn.
- **Nhân Vật Indie Đổ Bóng 3/4 (`marketCrowd.ts`):** Nâng cấp `drawPerson16Bit` với tóc tạo khối, tạp dề, balo, túi xách, kính râm, nón lá đánh bóng và bóng tiếp xúc mềm dưới chân; giữ nguyên Sprite Heo `24×20` & 2 cổng vòm dọc `CUA NAM` / `CUA BAC`.

### 36. Xóa Mảng Nâu 2 Rìa, Bố Cục So Le Chen Lấn & Đủ Nhóm Hàng Văn Hóa Việt (Quyết định 215)
- **Xóa Sạch Mảng Nâu Đen 2 Rìa (`marketArchitecture.ts`):** Thu gọn 2 cổng vòm tròn (`CUA NAM` trái `x: 0..44`, `CUA BAC` phải `x: 1156..1200`) chỉ nằm gọn ở làn đi giữa (`y: 266..358`) với ánh sáng vàng ấm hắt nhẹ vào sàn; mở toàn bộ góc trên & góc dưới 2 mép cho sạp hàng.
- **9 Shop Bắc Kín `0..1200` & 15 Sạp Trung Tâm/Nam So Le (`marketStalls.ts`):** Bổ sung sạp **Báo Chí & Giấy Tờ / Vé Số**, **Đồ Cúng & Nhang Đèn / Vàng Mã**, **Hoa Cúc & Nhang**, **Tạp Hóa & Sổ Tay** cùng Quần áo, Nông sản, Hải sản, Lưu niệm, Hoa quả, Hoa tươi, Dụng cụ hằng ngày, Ẩm thực; phá bỏ đường thẳng ngăn nắp bằng độ nhô-thụt ±8..14px, thúng rổ & sạp cóc bày sát lối đi.
- **Đông Đúc Chen Lấn 34+ Nhân Vật (`marketCrowd.ts`):** Tăng lên 22 người đi bộ 2 chiều tốc độ khác nhau + 12+ người bán/khách mặc cả/ngồi ăn dọc chợ.

### 37. Chợ Bến Thành Siêu Đông 140+ Người (Sprite Cache 60fps), Cổng Siêu Gọn 22×58px & Món Ăn `shape()` Chuẩn `pixel-mascot-ui` (Quyết định 216)
- **Biển Người 140+ Nhân Vật Mượt 60fps (`marketCrowd.ts`):** Dựng trước `CROWD_SPRITES` (20 biến thể × 2 frame bằng `mk(18, 24, ...)`), dùng `mulberry32(21600)` sinh **100 khách đi bộ 2 chiều** + ~40 tiểu thương/khách ngồi ăn/mặc cả; áp dụng **Frustum Culling** theo `camX..camX+VW` và thêm **vầng sáng kem nhẹ dưới chân Heo Con** để Heo luôn nổi bật giữa đám đông.
- **2 Cổng Vòm Siêu Gọn `22 × 58px` (`marketArchitecture.ts`):** Thu hẹp tối đa 2 cổng ra vào xuống `22px` rộng × `58px` cao tại sát mép trái (`x: 0..22, y: 280..338`) và mép phải (`x: 1178..1200, y: 280..338`).
- **Siêu Chật Chội ~34 Sạp/Quầy Cóc & Món Ăn `shape()` (`marketPalette.ts` + `marketStalls.ts`):** Chèn thêm `drawExtraMicroStalls` (10 quầy cóc, xe bánh mì, gánh bún riêu, thúng trái cây, bàn nhựa thấp) vào các khoảng hở, vẽ chi tiết tô phở (`drawPhoBowl`), đĩa bánh cuốn (`drawBanhCuonPlate`), mẹt hải sản (`drawSeafoodTray`) và tháp trái cây (`drawFruitPyramid`) bằng công thức `shape4` viền nâu 4 hướng + `mulberry32`.

### 38. Mê Cung 6 Hàng Sạp (`1200×760`), 180 Người Chen Chúc & Chú Heo Ngộp Thở Chạy Ra Cổng (Quyết định 217)
- **Mê Cung 6 Hàng Sạp Chật Chội (`1200×760`):** Nâng chiều cao bản đồ từ `480px` lên `760px` để xếp đủ **6 hàng sạp san sát** (`drawNorthStalls` + `drawRow2Stalls`..`drawRow6Stalls` + `drawExtraMicroStalls`) với 6 hẻm đi bộ hẹp chỉ ~28px, 6 tầng Y-sorting độc lập và 2 cổng siêu gọn `22×58px` ở giữa chiều cao chợ (`y: 350..408`).
- **Biển Người ~180 Nhân Vật 60fps (`marketCrowd.ts`):** 140 khách đi bộ 2 chiều rải khắp 6 hẻm (`mulberry32(21700)`) + ~40 tiểu thương/khách ngồi ăn dùng Sprite Cache `mk(18, 24)` + Frustum Culling.
- **Hiệu Ứng Chú Heo Ngộp Thở (`stuffyState`):** Khi Heo chen giữa đám đông quá dày trong hẻm sâu ~8–10 giây (`countNearbyCrowd >= 3`), Heo đổ mồ hôi pixel xanh + rung nhẹ + hiện bong bóng `"Ngộp quá... đông nghẹt thở luôn!!"`, rồi tự chạy vọt ra sát cổng gần nhất (`CUA NAM` / `CUA BAC`) đứng thở phì phò (chỉ thoát hẳn ra phố khi người dùng chạm cổng).

### 39. Nâng Cấp Quán Cà Phê Mini Workshop, Thư Viện Sách & Góc Boutique Quần Áo (`720×176` — Quyết định 218)
- **Không Gian 6 Phân Khu Ấm Cúng (`CafeChatBannerWebView.tsx` + `src/components/chat/cafe/cafeInteriorArt.ts`):** Mở rộng lên `720 × 176` (viewport `180 × 120` pixel vuông 1:1) trên 1 sàn gạch bông Indochine 16×16 liền mạch: (1) Quầy Bar cà phê phin có **Barista mặc tạp dề đang pha chế** + ghế bar, (2) Bàn trung tâm Heo & Heo AI + bàn tròn có khách thưởng thức cà phê, (3) **Thư viện 3 kệ sách lớn kịch trần + Sofa & ghế bành** có khách đọc sách, (4) **Mini Coffee Workshop** (bàn gỗ dài, ấm cổ ngỗng, phin nhôm, hũ hạt rang + 3 người học pha), (5) **Góc Boutique bán quần áo & túi tote + gương đứng + Cây thông Noel + cây xanh**, (6) Cửa kính 3 khung giờ & Cửa chính ra phố Khám phá (`exit_door`, `fastDash: true`).
- **Hoạt Cảnh 60fps & Va Chạm AABB:** 3 quạt trần gỗ quay mượt 60fps, đèn cây thông nhấp nháy, Barista nhún tay pha phin, khói cà phê phin bốc lên, Y-sorting lớp bàn ghế tiền cảnh & `obstacles` AABB.

### 40. Không Gian Toàn Màn Hình Nội Thất Nhà Thờ Đức Bà Sài Gòn (`640×520` — Quyết định 219)
- **Mở Toàn Màn Hình Từ Banner Tab Khám Phá (`EntertainmentBannerWebView.tsx` $\leftrightarrow$ `NotreDameCathedralView.tsx`):** Tách hotspot `notre_dame_gate` (`x: 224..262`, `fastDash: true`) ngay trên Nhà Thờ Đức Bà tháp đôi gạch đỏ để bước vào nội thất `640 × 520` (Dynamic 1:1 Square Pixel, `NotreDameCathedralBannerWebView.tsx` + `cathedralInteriorArt.ts`).
- **Kiến Trúc Cổ Kính Hoài Niệm Châu Âu & Đèn Vàng Lung Linh:** 3 tầng vòm cong Gothic-Romanesque gân vàng đất, 3 ô cửa kính màu stained-glass tỏa tia sáng chéo, Cung Thánh với bàn thờ hoa nến lung linh, tượng Đức Mẹ & Thánh Giá gỗ nâu, 2 chùm đèn pha lê vàng rực, 2 hành lang phụ cột vòm Châu Âu + quạt đứng, 2 cánh 8 hàng ghế gỗ đánh bóng với ~60 người ngồi dự lễ, lối đi giữa lát gạch bóng phản chiếu ánh sáng vàng và 45 hạt bụi vàng bay lơ lửng 60fps; va chạm AABB quanh Cung Thánh & 2 khối ghế gỗ.

### 41. Thay Nhà Sàn Bến Sông Bằng Ngôi Chùa Cổ Kính & Không Gian 2 Tầng Chánh Điện + Sân Chùa (`640×560` — Quyết định 220)
- **Ngoại Thất Ngôi Chùa Trên Banner Tab Khám Phá (`EntertainmentBannerWebView.tsx`, Khu 5 `x: 440..540`):** Thay Nhà sàn bến sông bằng Bảo Tháp nhiều tầng mái đao cong đỏ rực, Cổng Tam Quan ngói đỏ, lư hương nhỏ & cây bonsai; gắn hotspot `pagoda_gate` (`fastDash: true`) mở Toàn Màn Hình Ngôi Chùa (`PagodaTempleView.tsx`).
- **Không Gian 2 Tầng `640×560` (`PagodaTempleBannerWebView.tsx` + `pagodaInteriorArt.ts`):**
  - *Chánh Điện (nửa trên `y: 0..310`):* Trần gỗ ô vuông chạm hoa sen mạ vàng, cột gỗ lim, Tượng Đức Phật Thích Ca Mâu Ni thếp vàng khổng lồ + hào quang vàng rực, bàn thờ hoa lan/sen & lư hương trầm khói bay, Trống Bát Nhã đỏ (trái), Đại Hồng Chung (phải), tủ La Hán, nền đá bóng phản chiếu ánh vàng và Phật tử quỳ lạy thành kính (hoạt ảnh cúi lạy 60fps).
  - *Sân Chùa (nửa dưới `y: 310..560`):* Bậc tam cấp dẫn lên Chánh Điện, Lư Hương Đồng Khổng Lồ nghi ngút khói trầm, Bảo Tháp mái cong đỏ rực (trái), Lầu Trống & chậu bonsai (phải), Phật tử vái hương & Cổng Tam Quan đáy sân (`exit_pagoda`, `fastDash: true`). Tương tác Heo Con lễ Phật, thắp hương & thỉnh chuông cầu bình an.

### 42. Nâng Cấp Banner Tab Khám Phá: Đại Lộ Sài Gòn & Bến Bạch Đằng Panorama (`1160×128`, Viewport `224×108` — Quyết định 221)
- **Kiến Trúc Tách Module (`src/components/chat/hub/saigonPanoramaArt.ts` + `EntertainmentBannerWebView.tsx`):** Mở rộng thế giới mở lên `1160 × 128` (khung nhìn `224 × 108`, diện tích `6.14×`, tự động đổi 3 sắc trời Sáng/Chiều/Tối), chia bố cục ngang rõ ràng gồm đoạn Phố Sài Gòn (`x: 0..860`) nối liền sang phân khu Bến Bạch Đằng & Sông Sài Gòn (`x: 860..1160`).
- **Skyline Nền Xa (`y: 4..46`):** Đẩy **Bitexco Financial Tower** (sân đáp trực thăng & đèn nháy đỉnh tháp) và **Landmark 81** (tháp bó tre vút cao) cùng cụm cao ốc Thủ Thiêm lùi ra đường chân trời phía sau các công trình mặt tiền.
- **7 Công Trình Mặt Tiền & 8 Hotspots:** (1) Quán Phở Cổ Truyền, (2) Tiệm Cà Phê (`saigon_cafe` → `onEnterCafe`), (3) Cửa Hàng Quần Áo Adidas (biển `ADIDAS` 3 sọc, cửa kính ma-nơ-canh & kệ sneaker), (4) Nhà Thờ Đức Bà (`notre_dame_gate` → `onEnterCathedral`), (5) Chợ Bến Thành (`ben_thanh_notre` → `onEnterMarket`), (6) Sân Vận Động Bóng Đá Thống Nhất (vòm khán đài A, 4 trụ đèn pha sáng rực, sân cỏ & cờ đỏ sao vàng), (7) Chùa Việt Nam (`pagoda_gate` → `onEnterPagoda`), cộng thêm điểm ngắm cảnh (8) Bến Bạch Đằng (`bach_dang_wharf`).
- **Đại Lộ 2 Làn Xe Tấp Nập & CSGT Áo Vàng:** 6 loại phương tiện chạy 2 chiều 60fps (xe máy, xe hơi, xe tải thùng, xe buýt Sài Gòn, xe container to, xe cảnh sát nháy đèn xanh-đỏ) cùng **CSGT mặc đồng phục áo vàng** đứng bục giao lộ vẫy gậy điều tiết.
- **Sông Bạch Đằng Sống Động:** Bờ kè đá lát gạch & lan can trắng, **Cầu Đi Bộ** uốn lượn sáng đèn, **Cầu Ba Son** dây văng trắng trụ nghiêng, và **tàu thuyền lớn** (tàu du lịch 2 tầng, Saigon Waterbus, tàu chở hàng/sà lan) rẽ sóng chạy 60fps trên mặt nước.

### 43. Khôi Phục Chú Heo Mascot & Camera Lia 4 Hướng + Phóng To Đội Xe Khổng Lồ (`1200×164`, Viewport `224×116` — Quyết định 222)
- **Sửa Dứt Điểm Lỗi Kết Nối Engine (`window.__openRoom`):** Kết nối chính xác tới `window.__openRoom` (`step(dt, now)`, `state`, `drawOverlays(ctx, now)`) trong `EntertainmentBannerWebView.tsx`, vẽ chú Heo Mascot `24×20` bằng offscreen sprite cache (3 tư thế bước chân, chớp mắt, lật hướng `st.facing`, bóng tiếp xúc, nhún nhảy tương tác), kích hoạt đầy đủ Tap-to-Walk, Drag-to-Pan 4 hướng, Deadzone Smooth Follow và 4 mũi tên chỉ thị biên `◄ ► ▲ ▼`.
- **Mở Rộng Đại Lộ `1200×164` & Phóng To Gấp ~1.8×–2× Đội Xe, CSGT & Tàu Thuyền (`saigonPanoramaArt.ts`):** Mở rộng vỉa hè (`y: 68..96`) và đại lộ 2 làn (`y: 96..164`, rộng `68px`); phóng to 6 loại xe đúng tỷ lệ ngoài đời (`moto 22×16`, `car 40×20`, `police 40×20`, `truck 52×24`, `bus 66×25`, `container 82×28`) có viền `#2B2118`, bánh xe vành bạc & kính phản sáng; CSGT áo vàng `12×22` đứng bục giữa 2 làn; và 3 tàu thuyền cỡ lớn (`54..78 × 20..24`) trên sông Bạch Đằng (`x: 874..1200, y: 60..164`).

### 44. Hai Bờ Sông Bạch Đằng ↔ Thủ Thiêm, Cầu Đi Bộ & Cầu Ba Son Tách Biệt + Heo 1:1 Tab Vườn Lái Xe Máy Tránh Va Chạm (`1360×164` — Quyết định 223)
- **Hai Bờ Sông Rõ Rệt (`x: 856..1360`):** Bờ Tây Bến Bạch Đằng (`x: 856..896`) nối sang Bờ Đông Công Viên Thủ Thiêm (`x: 1265..1360`) qua 2 cây cầu tách biệt 2 hướng:
  - **Cầu Đi Bộ (`x: 890..1268, y: 54..76`):** Bắc trọn qua sông ở tầng trên, chỉ cho phép người đi bộ (6 người tản bộ 2 chiều) & chú Heo đi bộ, có biển cấm xe.
  - **Cầu Ba Son dây văng (`x: 888..1268, y: 98..134`):** Nối trực tiếp từ trục đường dẫn đại lộ sang Thủ Thiêm ở tầng dưới, tháp trụ nghiêng trắng + 14 dây văng, cho phép xe máy, xe hơi, xe tải & chú Heo lái xe máy lưu thông 2 chiều; bên dưới gầm cầu (`y: 134..164`) là 3 tàu thuyền lớn rẽ sóng.
- **Đồng Bộ 1:1 Dáng Heo Mascot Tab Vườn & Heo Lái Xe Máy Đội Mũ Bảo Hiểm:** Port 1:1 hàm `drawPigSprite` chuẩn `PixelGardenWebView.tsx` (thân thon, đầu tròn tách biệt, 4 chân mảnh — hết múp). Chuyển đổi thông minh (`Smart Auto-Mode`): trên lòng đường/Cầu Ba Son chú Heo đội mũ bảo hiểm lái xe máy (`drawPigOnMoto`), lên vỉa hè/7 cửa hàng/Cầu Đi Bộ tự động xuống xe đi bộ.
- **Hệ Thống Tránh Va Chạm 2 Lớp (`stepTrafficSafe`):** Xe cộ tự giữ khoảng cách an toàn & giảm tốc nhường đường cho nhau và cho chú Heo; chú Heo chủ động lách khe thoáng khi có xe gần — đảm bảo 0% va chạm.

### 45. Không Gian Toàn Màn Hình Quán Phở Cổ Truyền Việt Nam (`640×440`, Chuẩn `VIETNAM_PIXEL_ART_BIBLE` — Quyết định 225)
- **Mở Toàn Màn Hình 2 Chiều (`EntertainmentBannerWebView.tsx` $\leftrightarrow$ `PhoRestaurantView.tsx`):** Gắn `fastDash: true` cho hotspot `pho_old_quarter` gọi `onEnterPho` mở toàn màn hình `640 × 440` (Dynamic 1:1 Square Pixel, `PhoRestaurantBannerWebView.tsx` + `pho/phoInteriorArt.ts`), tái sử dụng `vnPixelArtKit.ts` (`drawTileFloorIndochine`, `drawSteamPuff`, `drawPigSpriteCanonical`, `VN_OKLAB_MATERIALS`).
- **Đời Sống Quán Phở Việt Nam Chân Thực 60fps:** 1 đầu bếp nấu phở chan nước dùng & trụng bánh phở, 2 nồi nước dùng inox sôi bong bóng & khói bốc nghi ngút, tủ kính treo thịt bò tươi (tái/nạm/gầu/bò viên) & rổ bánh phở trắng dai giòn, 2 nhân viên phục vụ bưng tô phở chạy bàn, 8 bàn inox + ghế nhựa xanh/đỏ đầy đủ gia vị (tương ớt, tương đen, giấm tỏi, chanh ớt, rổ rau thơm, khăn giấy), ~14 khách ngồi ăn xì xụp + 4 khách đi ra vào cửa, 3 quạt trần quay 60fps, góc trà đá quẩy nóng, quầy thu ngân + bàn thờ Ông Địa đèn đỏ, AABB obstacles & 4 điểm tương tác cho Heo Mascot 1:1 (có hiệu ứng tô phở bốc khói + tim bay).

### 46. Mô Phỏng Quy Trình Quán Phở Thực Tế 100% (FSM), Khuôn Mặt Pixel Chi Tiết, 14 Bàn San Sát & Bỏ Quạt Trần (`640×460` — Quyết định 226)
- **Bỏ Hoàn Toàn Quạt Trần & Thay Bằng 3 Quạt Treo Tường (`drawWallFan`):** Xóa `drawCeilingFan` để phù hợp tuyệt đối với góc nhìn top-down 2.5D, gắn 3 quạt treo tường cổ điển trên tường bếp.
- **14 Bàn Inox San Sát (28 Ghế Ngồi) & Khuôn Mặt Người Chi Tiết (`drawDetailedHumanFace`):** Sắp xếp 3 dãy bàn san sát (Trái 5 bàn, Giữa 4 bàn, Phải 5 bàn) với 2 lối đi dọc thông suốt (`x = 208`, `x = 432`); nâng cấp khuôn mặt nhân vật sắc nét (mắt đen `2×2` + chấm sáng trắng, má hồng, miệng cười/há ăn, 4 kiểu tóc).
- **Quy Trình Phục Vụ Thực Tế 100% (`stepPhoSimulation` FSM):** Bàn tĩnh không vẽ sẵn tô phở giả; `drawDynamicPhoBowl` vẽ tô phở đầy bốc khói khi `EATING` và tô rỗng khi `NEEDS_CLEAR`. Khách vào cửa đi dọc lối đi tới ghế trống → ngồi `WAITING_FOOD` (chưa có tô) → 2 Nhân viên bưng tô phở từ bếp ra đặt đúng bàn → Khách `EATING` ăn xì xụp → Ăn xong để lại tô rỗng đứng dậy đi ra cửa → Nhân viên tới dọn tô rỗng mang về bồn rửa chén góc bếp → Ghế về `EMPTY`.

### 47. Không Gian Toàn Màn Hình Adidas Flagship Brand Center 2 Tầng (`640×560`, Minimalist Luxury — Quyết định 227)
- **Mở Toàn Màn Hình 2 Chiều (`EntertainmentBannerWebView.tsx` $\leftrightarrow$ `AdidasStoreView.tsx`):** Gắn `fastDash: true` cho hotspot `adidas_store` gọi `onEnterAdidas` mở toàn màn hình 2 tầng `640 × 560` (`AdidasStoreBannerWebView.tsx` + `adidas/adidasInteriorArt.ts`), tái sử dụng `vnPixelArtKit.ts`.
- **Kiến Trúc Architectural Minimalist Luxury 2 Tầng:**
  - *Tầng 2 (`y: 0..274`):* Sàn bê tông mài xám sáng, Hero Wall Logo 3 Sọc phát sáng, Tường giày Sneaker (Superstar, Samba, Gazelle, Ultraboost) & dép Adilette 3 sọc có đèn LED hắt từng ngăn, 4 giá treo quần áo 3 sọc, 4 Mannequin đứng bục đá Terrazzo rọi spotlight, Phòng thử đồ VIP + Gương LED.
  - *Cầu thang kính cường lực LED (`x: 266..374, y: 246..312`):* Nối liền Tầng 1 ↔ Tầng 2 (AABB lan can 2 bên ép chú Heo đi đúng qua cầu thang).
  - *Tầng 1 (`y: 280..560`):* 2 đảo trưng bày quần áo & dép 3 sọc + bục Limited Sneaker, 3 Mannequin mặt tiền, Quầy thu ngân đá đen-trắng logo 3 sọc + hộp giày & túi giấy 3 sọc, 2 Nhân viên đồng phục Polo đen 3 sọc (1 tại quầy, 1 đi tuần qua 2 tầng), 7 khách hàng mua sắm xách túi 3 sọc & 4 điểm tương tác cho chú Heo 1:1.

### 48. Đại Tu Adidas Hội An Heritage Design Art — Dày Đặc 80% & Sắc Nét Từng Món Đồ (`640×560` — Quyết định 228)
- **Thẩm Mỹ Adidas Hội An Heritage:** Thay sàn bê tông xám trống trải bằng **Sàn gỗ lim ván dài ấm áp + Lối đi trung tâm lát gạch bông Hội An `16×16`**, tường vàng kem phố cổ, khung gỗ lim nâu sẫm & **8 đèn lồng lụa Hội An** phát sáng ấm 60fps đan xen **Logo 3 Sọc Đen–Trắng**.
- **Hình Dáng Sắc Nét Từng Sản Phẩm (Mật Độ Dày Đặc 80% Không Gian):**
  - *Khu Bóng Đá (Thảm cỏ xanh nhân tạo):* `drawFootballBoot` (giày đá banh có đinh tán dưới đế), `drawSportsTee` (áo đấu có tay xòe + cổ V + số áo), `drawFootballRack` (6 quả bóng đá Adidas).
  - *Khu Chạy Bộ & Polo/Apparel:* `drawRunningShoe` (giày chạy bộ đế Boost dày cong mũi), `drawPoloShirt` (áo Polo cổ bẻ có trụ nút & 2 tay áo xòe), `drawTrackPants` (quần Jogger & Short 3 sọc tách rõ 2 ống quần).
  - *Khu Originals, Dép & Phụ Kiện:* `drawLifestyleSneaker`, `drawAdiletteSlideLarge`, `drawAccessoryShelf` (Balo 3 sọc, Mũ lưỡi trai 3 sọc, Chồng hộp giày), `drawDetailedMannequin` (7 Mannequin dáng cân đối mặc full outfit).

### 49. Đồng Bộ 1:1 4 Ảnh Thực Tế Adidas Originals Hội An Cho Mặt Tiền Banner & Bên Trong Store (Quyết định 229)
- **Mặt Tiền Nhà Cổ 2 Tầng Vàng Nghệ Hội An Trên Banner Tab Khám Phá (`saigonPanoramaArt.ts`, `x: 214..314`):** Thay khối nhà đen bằng nhà cổ 2 tầng vàng nghệ Hội An, 3 vòm cong viền trắng, ban công con tiện trắng, chùm đèn lồng nhiều màu, mái ngói âm dương, cửa lá sách gỗ nâu, bảng hiệu đen viền trắng Logo Cỏ Ba Lá (Trefoil), 2 bụi cây leo xanh & tượng Logo Cỏ Ba Lá viền LED trắng khổng lồ góc phải (1:1 Ảnh 1, 3, 4).
- **Điểm Nhấn Nghệ Thuật Bên Trong Store (`adidasInteriorArt.ts`):** Giữ nguyên 100% mật độ đồ 80% QĐ 228, thay Hero Wall Tầng 2 thành tường vàng rọi spotlight chữ cam `ADIDAS HOI AN` + **3 Đèn Lồng Cỏ Ba Lá gấm hoa Hội An** (`drawTrefoilLantern`, 1:1 Ảnh 2), nâng cấp ban công phân tầng sang **con tiện gỗ đen cổ điển**, đặt **Tượng Cỏ Ba Lá viền LED trắng** (`drawTrefoilLogo`) cạnh cửa Tầng 1 & nâng cấp chùm đèn lồng nhiều màu rực rỡ.

### 50. Nâng Cấp Nghệ Thuật Mặt Tiền Adidas Hội An, Cờ Đỏ Sao Vàng 5 Cánh SVĐ Thống Nhất & Khu Chùa Hùng Vĩ – Chùa Một Cột – Cây Đa (Quyết định 230)
- **Adidas Originals Hội An (`saigonPanoramaArt.ts`, `x: 214..314`):** Mở rộng bảng hiệu Logo 3 Sọc + chữ `ADIDAS` sắc nét, phóng to Tượng Cỏ Ba Lá Trefoil viền LED trắng góc phải, bổ sung tranh bích họa Hội An trên tường, bậc tam cấp đá hoa văn & 2 bồn hoa giấy tím-hồng rủ 2 bên sân.
- **SVĐ Thống Nhất (`drawWavingVietnamFlag`):** Nâng cấp lá cờ Việt Nam lên cỡ lớn **`26 × 17` px** có **ngôi sao vàng 5 cánh sắc nét** & hiệu ứng sóng vải uốn lượn bay phấp phới 60fps kèm 2 cờ phướn 2 bên khán đài.
- **Khu Chùa Cổ Kính Hùng Vĩ 3 Lớp Chiều Sâu (`x: 688..856`):** Lớp sau gồm rặng cây xanh xa rợp bóng, Bảo Tháp 7 tầng & **Chùa Một Cột (Diên Hựu Tự) trên hồ sen hồng** rõ nét; mặt tiền chính giữa là **Cổng Tam Quan 2 tầng mái đao cong đầu rồng** + lư hương đồng bốc khói trầm 60fps; tiền cảnh trước sân là **Cây Đa cổ thụ tán rộng có rễ buông** uy nghi.

---

## 51. Không Gian Toàn Màn Hình Sân Vận Động Trống Đồng Chuẩn Quốc Tế FIFA (`840 × 680` — Quyết định 231)
- **Kiến trúc Module:** [`stadiumInteriorArt.ts`](../../../src/components/chat/stadium/stadiumInteriorArt.ts) + [`StadiumBannerWebView.tsx`](../../../src/components/chat/StadiumBannerWebView.tsx) + [`StadiumView.tsx`](../../../src/components/chat/StadiumView.tsx), kết nối 2 chiều từ hotspot `thong_nhat_stadium` trên Hub Tab Khám phá (`onEnterStadium` + `fastDash: true`, đồng thời nâng cấp dải mái vòm Trống Đồng Đông Sơn trên mặt tiền SVĐ Hub).
- **Nửa trên (`y: 0..420`) — Chảo Lửa Sân Vận Động Trống Đồng:**
  - Mái vòm khán đài Bắc đúc hoa văn **Mặt Trời & Chim Lạc Trống Đồng Đông Sơn** ánh đồng–đỏ son + bảng tỷ số LED sống động (`VN - AWAY`) + 4 trụ đèn pha LED 4 góc.
  - Khán đài phủ ghế **Đỏ–Vàng ghép hình Cờ Đỏ Sao Vàng khổng lồ** + khán giả cổ vũ nhịp sóng 60fps.
  - Đường pitch chạy điền kinh **6 làn đỏ gạch** kẻ vạch trắng số làn `1..6` bao quanh sân cỏ FIFA `480×216` sọc xanh 2 màu mượt mà, khắc chìm Mặt Trời Trống Đồng giữa vòng tròn trung tâm, 2 khung thành lưới trắng 3D & 4 cờ góc bay phấp phới.
  - **Trận đấu 11v11 chuẩn FIFA (60fps AI):** 22 cầu thủ (Đội Tuyển Việt Nam Đỏ–Vàng sơ đồ 4-3-3 vs Đội Khách Xanh–Trắng sơ đồ 4-4-2) di chuyển chiến thuật, chuyền bóng, sút cầu môn, thủ môn bay người cản phá, hiệu ứng GOAL! + 3 trọng tài quốc tế FIFA (1 trọng tài chính + 2 trọng tài biên phất cờ).
  - **2 Khu kỹ thuật HLV & Dự bị:** Cabin mái vòm kính cong, ghế bọc da, 5 cầu thủ dự bị mặc áo bib, bình nước & HLV đứng chỉ đạo sát đường biên.
- **Nửa dưới (`y: 420..680`) — 7 Phòng Hậu Trường Chuẩn FIFA:**
  1. **Đường Hầm Cầu Thủ (Player Tunnel)** chính giữa kết nối hành lang hậu trường thẳng ra sân cỏ cho Heo Mascot đi bộ xuyên qua.
  2. **Phòng Thay Đồ Đội Tuyển Việt Nam** (11 tủ áo đỏ, ghế băng, sa bàn 4-3-3, khu tắm).
  3. **Phòng Thay Đồ Đội Khách** (tương xứng chuẩn FIFA, 11 tủ áo xanh, sa bàn 4-4-2, khu tắm).
  4. **Phòng Hồi Sức & Y Tế Thể Thao** (2 giường vật lý trị liệu, 2 bể ngâm nước đá Cryo, tủ thuốc chữ thập đỏ, AED, cáng cứu thương & bác sĩ).
  5. **Phòng Trọng Tài & Điều Hành VAR** (khu nghỉ trọng tài + trạm 4 màn hình VAR sáng đèn & kỹ thuật viên).
  6. **Phòng Họp Báo & Truyền Thống Trống Đồng** (bục họp báo FIFA + dãy ghế phóng viên + tủ kính trưng bày Trống Đồng Đông Sơn & Cúp Vàng).
  7. **Khu Nhà Vệ Sinh Hiện Đại Nam/Nữ** (phân khu Nam xanh & Nữ hồng, buồng vệ sinh, bồn rửa tay đá & gương soi).

---

## 52. Chuẩn Góc Nhìn Thứ 3 Nhập Vai (TPS 3D Kiểu PUBG) & Nâng Cấp Quán Phở Cổ Truyền (Quyết định 232)
- **Tài liệu chuẩn toàn app:** [`docs/TPS_3D_OPEN_WORLD_SPEC.md`](../../TPS_3D_OPEN_WORLD_SPEC.md) + Engine dùng chung [`pixelTps3dEngine.ts`](../../../src/components/pixel/pixelTps3dEngine.ts) (Canvas2D 3D Perspective Projection thuần JS, 0 phụ thuộc mạng/WebGL, 60fps).
- **Nâng cấp tiên phong tại Quán Phở Cổ Truyền ([`phoTps3dScene.ts`](../../../src/components/chat/pho/phoTps3dScene.ts) + [`PhoRestaurantBannerWebView.tsx`](../../../src/components/chat/PhoRestaurantBannerWebView.tsx)):**
  - **Camera TPS Sau Lưng 360°:** Đặt sau lưng & hơi cao trên vai chú Heo, vuốt màn hình xoay tự do 360° ngắm toàn quán 3D có chiều sâu xa-gần (sàn gạch bông phối cảnh, tường vàng cổ điển, 3 quạt treo tường quay, bàn inox & ghế nhựa 3D, quầy bếp mở).
  - **Điều khiển tối giản không Joystick ảo:** Chạm điểm trên sàn/vật thể (`3D Raycast Tap-to-Walk`) để chú Heo đi tới; nút Context Action Pill nổi gọn ở đáy màn hình chỉ hiện khi gần vật thể tương tác (`[Mở cửa vào quán]`, `[Ngồi xuống]`, `[Gọi Phở Tái Nạm]`, `[Ăn Phở]`, `[Đứng dậy]`, `[Xem đầu bếp nấu]`, `[Ra vỉa hè]`).
  - **Chu trình nhập vai thực tế 100%:** Xuất phát ngoài vỉa hè trước biển `PHỞ BÒ GIA TRUYỀN` ➔ mở cửa gỗ–kính 2 cánh xoay bản lề 90° bước vào quán ➔ tìm ghế trống ngồi xuống ➔ gọi Phở (phục vụ chạy tới nhận món, báo bếp, đầu bếp trụng bánh chan nước dùng bốc khói, phục vụ bưng ra đặt lên bàn cho Heo ăn xì xụp) ➔ đứng dậy tự do đi vào khu vực bếp đứng cạnh xem đầu bếp nấu ăn, nhân viên bưng bê & khách hàng đẩy cửa ra vào thực tế.

---

## 53. Đại Tu Quán Phở Cổ Truyền 5 Gian Phòng Phố Hội Ấm Áp & Thanh Tab Tham Quan Đồng Bộ (Quyết định 233)
- **Trần nhà kín ấm áp 100% (Chữa dứt điểm lỗi lộ bầu trời):** Khi chú Heo ở trong nhà (`z >= 0`), dựng trần kem ấm + hệ xà gồ gỗ lim nâu sẫm phối cảnh 3D + đèn lồng trụ vuông ánh vàng ấm trên cột vàng nghệ & đèn thả mây tre đan.
- **Không gian 5 gian phòng liên hoàn (`22m × 24m`):**
  1. **Sân Vườn & Mặt Tiền Phố Hội (`garden`):** Hàng rào gạch nung + gạch bông gió xanh ngọc, vòm dây leo & hoa giấy hồng, dây đèn lồng lụa nhiều màu, bàn gỗ ngoài trời, giá menu & cửa gỗ 2 cánh xoay bản lề 90°.
  2. **Sảnh Chính Phố Hội (`main_hall`):** Sàn gạch bông Indochine điểm hoa văn xanh ngọc, cột vàng nghệ đèn lồng, vòm gỗ lim con tiện, bình phong song gỗ chạm, tranh phố cổ đóng khung, 6 bàn gỗ lim & ghế đệm xanh rêu bày đầy đủ mâm Phở Việt Nam.
  3. **Gian Phòng VIP Cổ Kính (`vip_room`):** Thông qua cửa vòm gỗ bên trái, tường gạch nung trần, đèn mây tre, 2 bàn tiệc gỗ lim dài có bình hoa sen & bộ ấm chén Bát Tràng men xanh.
  4. **Bếp Lửa Ninh Xương & Quầy Nguyên Liệu (`kitchen`):** Lối mở vào bếp cho Heo đứng sát xem Đầu bếp nấu ăn; tủ kính trưng bày thịt bò tái/nạm/gầu, bánh phở, hành ngò, thớt gỗ, 2 nồi nước dùng sôi bốc khói 3D & bồn rửa inox.
  5. **Góc Trà Đạo & Phòng Vệ Sinh Cổ Truyền (`tea_wc`):** Thông qua cửa vòm gỗ bên phải; bàn trà Bát Tràng + quẩy nóng & khu WC sạch đẹp có bồn rửa gốm sứ, gương khung gỗ và 2 buồng gỗ lam.
- **Nguyên liệu Phở Việt Nam chi tiết trên từng bàn:** Tô Phở đầy thịt bò tái-hành ngò-tỏi phi + khói 3D, ấm trà Bát Tràng men xanh-trắng, rổ gia vị đỏ (tương ớt, nước tương, giấm tỏi ớt ngâm), dĩa giá đỗ-rau thơm-chanh, quẩy nóng & chén trứng chần.
- **Thanh Tab 5 Gian Phòng đồng bộ 2 chiều + Bo tròn chú Heo 1:1 Tab Vườn:** Bấm tab → chú Heo tự đi theo lộ trình waypoint xuyên cửa vòm tới gian phòng đó & xoay camera góc đẹp; khi tự đi bộ → tab tự sáng đúng gian phòng đang đứng.

---

## 54. Tối Ưu Quán Phở TPS 3D Gọn Mượt 3 Khu, Bối Cảnh Phố Cổ Đối Diện & Sprite Đồ Ăn/Xoong Nồi Tả Thực (Quyết định 234)
- **Gọn quán còn 3 Khu ấm cúng (`12m × 15.5m`, bỏ Phòng VIP & vách ngăn phụ):** `🏮 Sân Phố Cổ` ➔ `🏛️ Sảnh Phở Chính` ➔ `🔥 Bếp Lửa Phở`, vừa khít thanh Tab điện thoại không tràn chữ, giảm 60% đa giác giúp chạy mượt 60fps và triệt tiêu 100% lỗi Z-sorting xuyên tường + siết đệm va chạm tường `0.65m` chống chú Heo kẹt góc.
- **Bối cảnh Phố Cổ đối diện mặt tiền (`Z: -6..-12`):** Dựng mặt đường nhựa, vạch sang đường, dãy nhà cổ tường vàng mái ngói đỏ 2 tầng & hàng cây xanh đối diện che kín đường chân trời; nối dây treo cho mọi đèn lồng (không còn đèn lồng bay lơ lửng).
- **Hybrid Sprite Pixel Art Tả Thực (`pixelTps3dEngine.ts`):** Thay toàn bộ cục hộp 3D thành Sprite tả thực tự co giãn theo chiều sâu: Nồi nước dùng tròn inox có 2 quai & vá múc bốc khói (`drawPhoPotSprite3D`), tủ kính treo thịt bò vân mỡ + rổ bánh phở trắng + bó hành ngò + thớt gỗ dao phay (`drawKitchenIngredientsSprite3D`), Tô Phở tròn đầy thịt-hành-đũa (`drawPhoBowlSprite3D`), ấm trà Bát Tràng dáng tròn có vòi & quai (`drawBatTrangTeapotSprite3D`), rổ tương ớt/giấm tỏi & đĩa quẩy nóng (`drawCondimentCaddySprite3D`, `drawQuayAndHerbsSprite3D`).

---

## 55. Đồng Bộ 1:1 Mặt Tiền Quán Phở Tab Khám Phá, Đại Lộ Xe Cộ & Sông Bạch Đằng Có Tàu Bè — 0% Mảng Trời Xanh Mất Liên Kết (Quyết định 235)
- **Mặt tiền Quán Phở 1:1 Banner Tab Khám phá (`Z = 0`):** Tường kem vàng 2 tầng liền mạch, **mái ngói đỏ liền suốt `X = -6..+6`** (hết hoàn toàn khe hở trời xanh giữa mái), 2 cửa sổ lá sách xanh rêu tầng 2, biển đỏ-vàng `PHỞ` & cửa gỗ 2 cánh xoay bản lề.
- **Dãy công trình kế bên trải dài 2 phía (`X: -60..+60`):** Sát bên phải là **Tiệm `CAFE` mái hiên sọc đỏ-trắng & 3 cửa sổ xanh** giống hệt Tab Khám phá; sát bên trái là dãy nhà cổ Sài Gòn → xoay 360° không hở khoảng không xanh.
- **Vỉa hè thoáng mở ➔ Đại lộ xe cộ ➔ Sông Bạch Đằng có tàu bè ➔ Bờ Thủ Thiêm:** Vỉa hè lát gạch bó vỉa trắng-đen mở rộng suốt `X = -65..+65`, Đại lộ 2 làn có **5 xe máy/taxi/xe buýt Sài Gòn chạy 2 chiều 60fps** (`drawRoadVehicleSprite3D`), bờ kè Bến Bạch Đằng, **Sông Bạch Đằng sóng lấp lánh có 3 tàu Waterbus & thuyền chạy 60fps** (`drawRiverBoatSprite3D`), và bờ công viên Thủ Thiêm xanh mướt khép kín 100% đường chân trời!

---

## 56. Chuẩn Hóa TPS 3D Interior-Only & Nâng Cấp Quán Phở Vintage 90s Ấm Cúng (Quyết định 236)
- **Kiến trúc Interior-Only toàn hệ thống:** Khi chú Heo chạm vào cửa bất kỳ quán nào ở Tab Khám phá → mở ngay khung cảnh ngưỡng cửa 2 cánh đang mở hướng thẳng vào nội thất 3D bên trong; loại bỏ hoàn toàn cảnh mặt tiền & đường phố ngoài trời trong màn TPS 3D (giảm 50% đa giác, hết lag, 0% hở trời xanh) và **bỏ hẳn thanh Tab card phía trên** để khung hình 100% thoáng đãng.
- **Nội thất Quán Phở Vintage 90s ấm cúng ([phoTps3dScene.ts](../../../src/components/chat/pho/phoTps3dScene.ts) & [pixelTps3dEngine.ts](../../../src/components/pixel/pixelTps3dEngine.ts)):**
  - Bỏ bình phong chắn giữa lối đi để nhìn xuyên suốt từ cửa vào Sảnh & Bếp Lửa.
  - **2 Quạt trần Vintage 3 cánh (`drawCeilingFan3D`)** quay mượt 60fps + **6 đèn thả chụp men ánh vàng 90s (`drawVintageLamp3D`)** + lớp phủ ánh sáng vàng mật ong ấm cúng.
  - **3 Nhân viên Bếp sống động:** Bếp trưởng múc 2 nồi nước dùng inox tròn bốc khói, Phụ bếp thái lát thịt bò tươi sống trên thớt gỗ, Phụ bếp trụng bánh phở rắc hành ngò.
  - **2 Nhân viên Phục vụ mặc tạp dề cổ điển đẹp mắt** (dây đeo cổ, nơ eo & túi trước) chạy FSM bưng phở & dọn bàn.
  - **Món Phở chân thực & đũa muỗng đầy đủ:** Tô Phở sứ viền lam đầy lát thịt bò tươi sống, hành ngò, có cả **đũa tre + muỗng sứ trắng**, kèm **ống đũa muỗng đầy đủ** trên từng bàn ăn!
