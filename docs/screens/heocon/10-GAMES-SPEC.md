# 🎮 10-GAMES-SPEC — ĐẶC TẢ CHI TIẾT 2 MINI-GAME PIXEL ART: HEO BẮN & HEO BAY

> **Mục tiêu tài liệu:** Bản thiết kế chi tiết (Blueprint) chuẩn 1:1 port đồ họa canvas pixel từ `prototype/Ví Heo Con-20-11.html` sang ứng dụng React Native. Quy định bảng màu, công thức vật lý, độ khó từng màn chơi và giao diện popup Chơi lại / Màn kế tiếp (Quyết định 143).

---

## 🎨 1. BẢNG MÀU ĐỒ HỌA PIXEL & DESIGN TOKENS

Toàn bộ đồ họa canvas của 2 game sử dụng bảng màu pixel cố định $\le 32$ màu chuẩn prototype (cấm anti-alias, scale 4× nearest-neighbor):

```javascript
// Bảng màu chung (Prototype C & PAL)
const C = {
  grass1: '#86B866', grass2: '#74A659', grass3: '#9CCB78',
  wall: '#F2DFA8', wallShade: '#E2C984',
  roof: '#C4603A', roofDark: '#9E4528', roofLight: '#DC7A4E',
  wood: '#8A5A34', woodDark: '#5E3A20', woodLight: '#B07A48',
  water: '#6DB7C9', waterDark: '#4E97AE',
  bamboo: '#D6B66A', bambooDark: '#A98A45',
  red: '#E0452B', gold: '#F4B93B'
};

const PAL = {
  o: '#4B2B21', // Viền nâu mực ngoài
  p: '#F9B8C4', // Thịt heo hồng phấn
  s: '#EE90A6', // Má hồng ửng / Bóng
  n: '#F08DA4', // Mõm heo
  h: '#FFE3E8', // Highlight
  k: '#2B2118', // Mực đen đậm
  g: '#F4B93B', // Vàng cám
  G: '#B97A14', // Vàng cám đậm
  w: '#FFFFFF'  // Trắng tinh
};

const INK = '#2B2118';
```

---

## 🎯 2. ĐẶC TẢ GAME HEO BẮN (ANGRY PIG — `v-ap`)

### 2.1. Thông Số Vật Lý & Kích Thước Màn Hình
- **Kích thước logic:** $AW = 224$px, $AH = 140$px, Đường chân trời mặt đất $AG = 118$px.
- **Tọa độ bệ ná:** $SX = 36$px, $SY = 92$px.
- **Giới hạn kéo ná tối đa:** $MAXD = 28$px.
- **Gia tốc trọng trường:** $AGR = 230$ px/s$^2$.
- **Hệ số lực bắn ná:** $AK = 8.5$.
- **Hao tổn thể lực khi đói:** Nếu Heo đói ($< 25\%$), lực bắn giảm $15\%$ ($AK = 8.5 \times 0.85 = 7.225$).

### 2.2. Chi Tiết Đồ Họa Cảnh & Ná Bắn
1. **Bầu trời 8 dải pha trộn:** Sử dụng hàm `skyAt(0.3)` pha màu `mix(top, hor, i/7)` chia làm 8 dải nằm ngang $16$px.
2. **Mặt trời & Mây:**
   - Mặt trời hình tròn pixel tại $(200, 22)$ bán kính 8px viền mực, tâm vàng `#FFE27A`.
   - Mây trôi `sCloud` vẽ bằng các khối chữ nhật màu trắng bo góc pixel.
3. **Parallax 3 Tầng Scenery:**
   - Tầng xa `FAR[0]`: Rặng núi xanh mờ tại $y = AG - 110$.
   - Tầng trung `MID[0]`: Hàng cây xanh rậm rạp tại $y = AG - 96$.
   - Tầng mặt đất `GROUND[0]`: Thảm cỏ xanh mát kèm viền 2px mực tại $y = AG$.
4. **Ná Bắn 3D & Dây Đàn Hồi:**
   - Thân gỗ ná viền mực, lõi gỗ nâu `#8A5A34`, 2 chạc ná viền mực vươn lên.
   - Khi người chơi kéo ná: Vẽ 2 sợi dây cao su màu nâu đậm `#5A2B1A` nối từ đỉnh 2 chạc $(SX-6, SY-6)$ và $(SX+6, SY-6)$ tới tâm điểm kéo $(px, py)$.
   - **Đường quỹ đạo ngắm bắn:** Vẽ đúng **14 chấm pixel $2\times 2$** theo công thức quỹ đạo parabol:
     $$x(t) = px + v_x \cdot t, \quad y(t) = py + v_y \cdot t + \frac{1}{2} AGR \cdot t^2$$
     với $t = i \times 0.07$s ($i = 1 \dots 14$). Màu sắc chấm xen kẽ trắng kem `#FFFBF1` và nâu mực `#2B2118`.

### 2.3. Bảng Máu & Khối Lượng Khối Chướng Ngại Vật & Mục Tiêu Chim
| Loại Khối | Ký Hiệu | Màu Nền / Viền | Máu (HP) | Khối Lượng (m) | Đặc Trưng Đồ Họa |
|---|---|---|---|---|---|
| **Khối Gỗ** | `wood` | `#C49A6E` / `#8A5A34` | $45$ | $w \times h \times 1.0 / 25$ | Có đường vân gỗ sọc dọc/ngang ngẫu nhiên |
| **Khối Đá** | `stone` | `#B9B2A6` / `#7A7468` | $110$ | $w \times h \times 1.7 / 25$ | Có các chấm vân nứt $2\times 2$ màu xám đậm |
| **Khối Kính** | `glass` | `#B8E4F0` / `#5FA9C4` | $16$ | $w \times h \times 0.6 / 25$ | Có vệt sáng trắng specular highlight ở cạnh trên |
| **Lồng Sắt** | `cage` | `#CFCFD8` / `#5A5A66` | $42$ | $w \times h \times 1.2 / 25$ | Nan sắt 3D cách nhau 4px, ổ khóa vàng `#F4B93B`, **chú heo con buồn bã bên trong** |
| **Chim Lính** | `bird` | `#FFE58A` (vàng chanh) | $1$ | $5.0$ | Mỏ cam `#F28C28`, chỏm lông trên đầu, **băng đô 3 màu theo danh mục** (Ăn uống: đỏ `#E0452B`, Đi lại: xanh `#4B6FA5`, Mua sắm: hồng `#E8548C`), nhấp nhô theo sóng $\sin(3t)$ |

### 2.4. Các Loại Đạn Heo & Kỹ Năng Kích Hoạt
1. **Heo Mẹ (`pig`):** Đạn cơ bản, thân tròn hồng phấn 18×15px, mắt đen chớp sáng.
2. **Heo Cánh (`wing`):** Có thêm đôi cánh trắng `#FFFBF1`. Khi đang bay giữa trời, người chơi **chạm màn hình** $\to$ kích tốc phóng tới trước x1.6 ($v_x \times 1.6, v_y \times 0.3$), phụt 8 hạt khói trắng!
3. **Heo Bom Cám (`coin`):** Trên đầu đội đồng xu cám vàng. Khi đang bay, người chơi **chạm màn hình** $\to$ kích nổ tức thì, tạo xung lực đẩy và gây $70$ sát thương trong bán kính $34$px, phụt 24 hạt khói vàng và rung màn hình!

### 2.5. Hệ Thống Màn Chơi & Sinh Màn Ngẫu Nhiên Vô Tận (Endless Waves)
- **Màn 1: Ổ chim nhỏ:** Cấu trúc 2 cột gỗ, dầm ngang, 2 chim non, 1 lồng sắt. Gió nhẹ ($\pm 10$ px/s).
- **Màn 2: Tháp ổ chim:** 2 cột đá kiên cố HP 110, tấm đỡ gỗ, 1 lồng sắt ở tầng trên, 1 lồng ở mặt đất, 2 chim. Gió $\pm 25$ px/s.
- **Màn 3: Cổng thành chim:** 3 cột gỗ cao 28px, dầm kép, 3 chim non nhiều cao độ, 2 lồng sắt. Gió $\pm 35$ px/s.
- **Màn Vô Tận ($W \ge 4$):** Thuật toán sinh tháp ngẫu nhiên:
  - Tỉ lệ khối đá tăng dần: $\text{ratio}_{stone} = \min(0.65, 0.20 + W \times 0.08)$.
  - Vector gió biến thiên: $v_{wind} \in [-50, +50]$ px/s.
  - Số lượng chim canh gác: $2 + \lfloor W/2 \rfloor$.
  - Số lượng lồng giải cứu heo con: $1 + \lfloor W/3 \rfloor$.

### 2.6. Quy Chuẩn Đánh Giá Sao & Giao Diện Popup
- **Tiêu chuẩn sao:**
  - ⭐️⭐️⭐️ (3 Sao): Tiêu diệt hết chim & giải cứu hết lồng mà còn dư $\ge 2$ đạn heo.
  - ⭐️⭐️ (2 Sao): Còn dư 1 đạn heo.
  - ⭐️ (1 Sao): Dùng hết đạn heo vừa vặn qua màn.
  - Thua (0 Sao): Hết đạn mà chim vẫn còn sống hoặc lồng chưa vỡ.
- **Popup Kết Thúc (`.flyover .fo`):**
  - Khung thẻ `#FFFBF1` viền 3px mực `#2B2118`, bóng 4px 0-blur.
  - Tiêu đề Baloo 2: `Cứu được heo con!` hoặc `Heo con vẫn bị nhốt`.
  - Hàng 3 sao vàng `#F4B93B`.
  - Thông báo quà: `+X thức ăn · thêm 1 heo con vào đội · heo nhà no thêm`.
  - Nút bấm neo-brutalist: `[Chơi lại]` (nền kem) và `[Màn kế]` (nền Vàng Cám).

---

## 🪽 3. ĐẶC TẢ GAME HEO BAY (FLAPPY PIG — `v-fly`)

### 3.1. Thông Số Vật Lý & Kích Thước
- **Kích thước logic:** $FW = 176$px, $FH = 224$px, Mặt đất $GY = 198$px.
- **Vị trí heo ngang:** $PX = 44$px cố định.
- **Trọng lực:** $GRAV = 560$ px/s$^2$.
- **Lực vỗ cánh:** $FLAP = -172$ px/s.
- **Vận tốc rơi tối đa:** $VMAX = 250$ px/s.
- **Chiều rộng cột:** $OW = 16$px.

### 3.2. 4 Biomes Luân Phiên & Parallax Đồ Họa Gốc
Mỗi chu kỳ $BLEN = 900$px đường bay sẽ chuyển đổi sang Biome tiếp theo:
1. **Biome 0 — Vườn Nhà (`vuon`):** Cột tre trúc xanh vàng (`bamboo`), núi xa xanh cỏ `#B5DB9A`.
2. **Biome 1 — Ruộng Lúa (`ruong`):** Cọc gỗ rơm vàng (`post`), núi xa xám sáng `#B4C6D6`.
3. **Biome 2 — Phố Nhà (`pho`):** Trụ đèn phố gạch xám (`pole`), núi xa xanh lam `#ACBCC8`.
4. **Biome 3 — Ao Sen (`ao`):** Đài sen và cuống sen ngọc (`lotus`), mặt nước ao `#6DB7C9`.

### 3.3. Khóa Bầu Trời Xanh Ban Ngày (`skyAt(u)` — Quyết định 147)
Biến số thời gian $u$ **được khóa cố định $u = 0.35$** ngay trong `flyReset()` và **không tự tăng trong `flyUpdate(dt)`** (chỉ đổi khi người dùng bấm nút `[Đổi trời]`). Tại $u = 0.35$, `skyAt(u)` trả về dải xanh thiên thanh ban ngày rực rỡ (`#8FD0F2` $\to$ `#58B6EE` ở đỉnh trời, `#E3F3F8` $\to$ `#C3E9F8` ở chân trời) và mặt trời vàng hiện giữa khung hình.

- Bảng màu `SKY` 8 pha vẫn giữ nguyên 1:1 từ prototype để nút `[Đổi trời]` có thể chuyển pha khi người dùng chủ động yêu cầu:
  - $u = 0.00$: Bình minh ửng hồng (`#F7B6A0` $\to$ `#FBE3B8`).
  - $u = 0.40$: Ban ngày nắng trong (`#58B6EE` $\to$ `#C3E9F8`).
  - $u = 0.58$: Hoàng hôn rực rỡ (`#F29A62` $\to$ `#FFD9A0`).
  - $u = 0.70$: Chập tối tím thẫm (`#6B4A86` $\to$ `#EE9A74`).
  - $u = 0.80 \to 0.94$: Đêm đen sâu thẳm (`#1D2A4F` $\to$ `#3A4C80`) hiện **36 ngôi sao nhấp nháy `STARS`**.
- Tại $u = 0.35$: `nightness(u) = 0`, toàn bộ lớp sao, lớp phủ đêm xanh thẫm và hiệu ứng chuyển biome ban đêm đều bằng 0.
- **Cấm phủ lớp xám đục:** Khi `fly.rain === 0` và `nightness === 0`, `drawSky(c)` tuyệt đối không được phủ bất kỳ lớp xám/mờ nào lên canvas. Chỉ khi `rain > 0` mới pha xám `#8E9AA6`/`#B9C2C8` với hệ số `rain * 0.45`.
- Thời tiết mặc định `weather: 'clear'`, `rain: 0`, `wind: 0`; **không tự đổi thời tiết theo thời gian** — chỉ đổi qua nút `[Đổi trời]` để bầu trời luôn xanh sáng rực rỡ.

### 3.4. Thức Ăn & Thanh Độ No (`flyHunger`)
- **Tốc độ tiêu hao năng lượng:** Giảm $3.2\%$/s khi đang bay.
- **Các món thức ăn xuất hiện giữa khe hẹp:**
  - *Cà rốt (`carrot`):* $+14\%$ độ no.
  - *Bắp ngô (`corn`):* $+16\%$ độ no.
  - *Táo đỏ (`apple`):* $+20\%$ độ no.
  - *Dưa hấu (`melon`):* $+26\%$ độ no.
  - *Đồng cám vàng (`coin`):* $+1$ cám dự trữ.
- **Thanh HUD 10 ô Segmented:**
  - $\ge 8$ ô: Xanh lá `#5E9A57` (No căng).
  - $4 \dots 7$ ô: Vàng cám `#F4B93B` (Vừa bụng).
  - $< 4$ ô: Đỏ cam `#E0452B` (Đói lả).
  - Khi về 0%: Heo đói lả rơi tự do `flyDie('starve')`.

### 3.5. Công Thức Tăng Độ Khó Lũy Tiến
1. **Vận tốc bay tăng dần:**
   $$v_{fly} = \min(110, 58 + \text{score} \times 1.8) \text{ px/s}$$
2. **Khoảng hẹp khe cột co dần:**
   $$\text{gap} = \max(48, 64 - \lfloor \text{score} / 5 \rfloor) \text{ px}$$
   (Từ 64px ở điểm đầu xuống tối thiểu 48px ở điểm cao).
3. **Chướng ngại vật động:**
   - Khi điểm $\ge 3$: Chim đối thủ bay ngược chiều với tốc độ $60 \dots 95$ px/s.
   - Khi điểm $\ge 5$: Gió lốc xoáy xuất hiện đẩy trôi độ cao heo.

### 3.6. Chuẩn Canvas Integer DPR 3× & Cảm Ứng Vỗ Cánh 0ms (Quyết định 147)
- **Bộ đệm canvas logic:** $FW = 176$, $FH = 224$; backing store $176 \times 3 = 528$ × $224 \times 3 = 672$ (`DPR = 3`), `flyX.imageSmoothingEnabled = false`.
- **Vẽ:** `drawFlyScene(c, t)` bọc `c.save(); c.scale(DPR, DPR); ... c.restore();` để mọi tọa độ logic vẫn là pixel gốc prototype.
- **CSS:** `width: 100%; height: 100%; image-rendering: -webkit-optimize-contrast; -moz-crisp-edges; pixelated; crisp-edges; touch-action: manipulation;`.
- **Chạm 0ms:** `pointerdown` + `touchstart` (`{ passive: false }`) trên `#flyWrap` và `#flyBtn` gọi `flyTap()` ngay lập tức; nếu game đang `paused` thì chạm chỉ để tiếp tục, ngược lại gọi `flyFlap()`.
- **Ná bắn Angry Pig:** `apPt(e)` đọc `e.touches[0]` / `e.changedTouches[0]` / `e.clientX|pageX`; vùng chạm ná mở rộng bán kính 40px hoặc `x < 85 && y > 45 && y < 135`; `setPointerCapture` + `preventDefault()` với `{ passive: false }`.

---

## 💬 4. ĐẶC TẢ KHUNG TRÒ CHUYỆN PIXEL ART (CHAT VIEW — `v-chat`)

- **Khung bao `.chatlog`:**
  - Card `#FFFBF1`, viền 3px mực `#2B2118`, bo góc 22px, bóng cứng 4px 0-blur.
- **Bong bóng tin nhắn `.msg`:**
  - AI Coach: Avatar vuông 30×30px `PixelPigAvatar` viền 3px mực; bong bóng kem nền `#F6EEDC` viền 3px mực, bo góc 16px.
  - Người dùng (`.msg.me`): Bong bóng nền hồng heo `#F9B8C4` viền 3px mực, căn phải.
- **Thanh nhập `.chatin`:**
  - Ô gõ cao 44px, viền 3px mực `#2B2118`, nút `[Gửi]` Vàng Cám `#F4B93B` viền 2.5px mực.
- **Cam kết riêng tư `.privacy`:**
  - "Heo-Coach đọc số liệu tổng hợp trong app. Ảnh và vị trí không được gửi đi."

---

## 📱 5. CHUẨN TÍCH HỢP WEBVIEW CHO GAME & BẢN ĐỒ (QUYẾT ĐỊNH 148)

Áp dụng bắt buộc cho `PigFlightGameView.tsx`, `PigShooterGameView.tsx` và `PiggySpendMapView.tsx` để chống lỗi **màn hình vàng kem `#F6EEDC`** trên iOS / Expo Go:

1. **Không bao giờ truyền `baseUrl: ''`:** `const memoizedSource = useMemo(() => ({ html: htmlContent }), [htmlContent]);` — để WebKit dùng `baseURL: nil` theo chuẩn Apple. `baseUrl` rỗng bị iOS coi là URL không hợp lệ và hủy tải HTML trong im lặng.
2. **Layout Flexbox tự nhiên:** `container` / `webViewWrapper` (hoặc `webContainer`) / `webViewContainer` / `webView` đều dùng `{ flex: 1, width: '100%', backgroundColor: '#F6EEDC' }`. Cấm `flex: 0`, cấm truyền `height` pixel cứng từ `useWindowDimensions`.
3. **Cấm `onLayout` + `setContentHeight`:** Không đo lại chiều cao bằng `onLayout` (gây re-render loop làm WKWebView treo). Toàn màn hình do `flex: 1` của cây View đảm nhiệm (Tab Bar đã được ẩn qua `onToggleTabBar`).
4. **Cầu nối bắt lỗi JS (`window.onerror`):** Mỗi HTML nhúng script:
   ```js
   window.onerror = function (msg, src, line, col) {
     try {
       window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'JS_ERROR', message: String(msg), line: line || 0, col: col || 0 }));
     } catch (e) {}
     return false;
   };
   ```
   Phía React Native bắt nhánh `data.type === 'JS_ERROR'` và `console.warn('[TênView] WebView JS error:', ...)` để lỗi runtime không chết âm thầm.
5. **Tiêu chí nghiệm thu:** `npx tsc --noEmit` 0 lỗi; `node run-all-tests.js` 100% pass với assertion cấm `baseUrl: ''`, yêu cầu `webViewContainer` flex và `window.onerror` + `type: 'JS_ERROR'` ở cả 3 view.

---

## 6. Khắc Phục Triệt Để Màn Hình Vàng Khè Bằng Kích Thước Tường Minh Chuẩn Fabric (Quyết định 149)

1. **Vấn đề thực tế:** Khi dùng thuần `flex: 1` bên trong `ScrollView` phân trang ngang ở iOS Fabric, Yoga Engine không tính toán được chiều cao nội tại của native `WKWebView`, dẫn đến sập frame `0x0` khiến người dùng chỉ nhìn thấy nền vàng kem `#F6EEDC` của container cha.
2. **Kích thước pixel số tường minh (Proven Pattern):**
   - Lấy `winWidth`, `winHeight` từ `useWindowDimensions()` và `insets` từ `useSafeAreaInsets()`.
   - Tính toán `gameHeight = winHeight - (insets.top || 0) - 54` cho Game (khi tab bar ẩn).
   - Tính toán `mapHeight = winHeight - (insets.top || 0) - 54 - 60 - (insets.bottom || 0)` cho Bản Đồ (khi tab bar hiện).
   - Truyền kích thước số vào `containerStyle={{ width: winWidth, height: gameHeight, flex: 0, backgroundColor: '#F6EEDC' }}` và `style={{ width: winWidth, height: gameHeight, flex: 0, backgroundColor: '#F6EEDC' }}`.
3. **Non-blocking Google Fonts:** Thêm thuộc tính `media="print" onload="this.media='all'"` cho link stylesheet Google Fonts và khai báo font fallback hệ thống để tránh tình trạng WebKit treo màn hình chờ mạng.
4. **Cảm ứng kéo ná Heo Bắn linh hoạt:** Bắt trọn tọa độ kéo ná qua `getBoundingClientRect()`, mở rộng vùng kích hoạt ná bán kính 50px hoặc toàn bộ $1/3$ bên trái canvas, `touch-action: none` và `e.preventDefault()` triệt tiêu xung đột cử chỉ iOS.

---

## 7. Khắc Phục Canvas Mờ, Nút Bay Lại Bị Kẹt & Kéo Ná Angry Pig Chuẩn Prototype (Quyết định 150)

1. **Khắc Phục Canvas Mờ:**
   - Cấm `-webkit-optimize-contrast` vì gây bilinear smoothing nhòe hạt pixel art trên iOS Safari.
   - Bắt buộc CSS: `image-rendering: pixelated; image-rendering: -webkit-crisp-edges; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges;`.
   - Bổ sung `c.imageSmoothingEnabled = false;` ngay sau `c.scale(DPR, DPR)` trong mọi hàm render loop.
2. **Sửa Nút "Bay Lại" Kẹt Bằng Event Delegation:**
   - Dùng event delegation gắn `pointerdown` và `click` trực tiếp vào `#flyOver` (và `#apOver`), lập tức gọi `flyRestart()` dọn sạch `innerHTML = ''` và gán `hidden = true` ngay khi vừa chạm ngón tay.
3. **Cơ Chế Kéo Ná Angry Pig Chuẩn Prototype 1:1:**
   - Gắn sự kiện `pointer` và `touch` (`{ passive: false }`) trực tiếp vào `apC` (canvas).
   - Khởi tạo `ap.drag = { dx: 0, dy: 0 }`. Di chuyển ngón tay lùi về sau tính `dx = x - SX, dy = y - SY`, giới hạn $MAXD = 28$.
   - Buông tay phóng heo `apLaunch(dx, dy)` theo vector vận tốc $vx = -dx \times AK, vy = -dy \times AK$, kích hoạt vật lý bay parabol 1:1.

---

## 8. Khắc Phục Triệt Để Mờ Do DPR Downscale, Sửa Lỗi CSS [hidden] Popup & Tái Hiện Ná Bắn 1:1 Prototype (Quyết định 151)

1. **Khôi phục Flexbox Chuẩn Cho SafeWebView (Chống Màn Hình Vàng):**
   - Loại bỏ hoàn toàn `flex: 0` và kích thước ép cứng.
   - Luôn dùng `{ flex: 1, width: '100%', backgroundColor: '#F6EEDC' }` trên cả `webViewWrapper`, `containerStyle` và `style` của `SafeWebView`.
   - Bỏ hoàn toàn `baseUrl: ''`.
2. **Loại Bỏ Hoàn Toàn DPR Downscaling Làm Mờ Canvas:**
   - Giữ nguyên kích thước buffer logic 1:1 từ prototype: `flyC.width = 176; flyC.height = 224;` và `apC.width = 224; apC.height = 140;` (không nhân DPR).
   - Trên màn hình điện thoại 348px, WebKit upscale 2× bằng thuật toán Nearest-Neighbor thuần túy (`image-rendering: pixelated; image-rendering: -webkit-crisp-edges; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges;`), tạo hạt pixel vuông vức sắc bén 100%.
   - Không gọi `scale(DPR, DPR)` trong 2D canvas, gọi `c.imageSmoothingEnabled = false;`.
3. **Sửa Lỗi CSS [hidden] Triệt Tiêu Kẹt Popup "Bay Lại":**
   - Bổ sung CSS `[hidden] { display: none !important; }` và `.flyover[hidden] { display: none !important; }` để `display: flex` không ghi đè `hidden`.
   - Trong `flyRestart()` và `apStart()`, gán tường minh `o.style.display = 'none'; o.hidden = true; o.innerHTML = '';`.
   - Lắng nghe đa kênh: `pointerdown`, `touchstart` (`e.stopPropagation()`) và `click` trên modal để phản hồi tức thì 0ms.
4. **Tái Hiện 1:1 Cơ Chế Kéo Ná Angry Pig Từ Prototype:**
   - Lắng nghe cử chỉ kéo (`touchmove`/`pointermove`) và thả tay (`touchend`/`pointerup`) trên cả canvas `apC` và `window` với `{ passive: false }` và `e.preventDefault()`, không để `pointercancel` hủy thao tác kéo lùi về phía sau.
   - Khi kéo: $dx = x - SX, dy = y - SY$, giới hạn $MAXD = 28$, vẽ dây ná và 14 chấm quỹ đạo đứt nét.
   - Khi thả tay: nếu $d \ge 7$px, gọi `apLaunch(dx, dy)` gán $vx = -dx \times AK, vy = -dy \times AK$ với $AK = 8.5$, heo phóng vụt bay vút lên bầu trời và đâm sập tháp chim chuẩn prototype!

---

## 9. ĐẶC TẢ GAME HEO QUA ĐƯỜNG VIỆT NAM (VIETNAM CROSS ROAD WITH PIG — `v-cross`) — Quyết định 166

1. **Khung Buffer & Góc Nhìn 2.5D:**
   - Kích thước canvas: $192 \times 256$, pixelated, scale nearest-neighbor.
   - Vùng đường: $RD0 = 66, RD1 = 196$. 5 Làn đường xe máy, ô tô, xe buýt chạy ngược xuôi với tốc độ và mật độ khác nhau.
2. **4 Ải Địa Danh Sài Gòn:**
   - Ải 0: Bưu điện Thành phố (Công xã Paris, nắng gắt).
   - Ải 1: Chợ Bến Thành (Lê Lợi, giờ tan tầm).
   - Ải 2: Nhà thờ Đức Bà (Xe đông như nêm).
   - Ải 3: Dinh Độc Lập (Giờ cao điểm).
3. **Cơ Chế Điều Khiển Cảm Ứng & Lách Xe:**
   - D-Pad cảm ứng: Lên (`u`), Xuống (`d`), Trái (`l`), Phải (`r`).
   - Nút **Giơ Tay** (`crHand`): 2 lượt mỗi ván (chi tiêu tiết kiệm được 3 lượt). Khi giơ tay, xe hơi và xe buýt lập tức phanh lại nhường đường, xe máy lách nhẹ.
4. **Liên Kết Kinh Tế Ngân Sách & Nuôi Heo:**
   - Chi tiêu gần hạn mức $\rightarrow$ Mật độ xe cộ tăng cao (`cr.mul` tăng theo tỷ lệ chi tiêu).
   - Nhặt bánh mì / hạt cám trên đường $\rightarrow$ Thưởng trực tiếp vào `pigFood` trong `gamificationStore`.
   - Vượt ải an toàn $\rightarrow$ Thưởng sao (tối đa 12 sao) và cám nuôi heo (`feedPig`).

---

## 10. NÂNG CẤP CẢNH THIÊN NHIÊN VIỆT NAM & KHẮC PHỤC HEO QUA ĐƯỜNG 100VH FLEXBOX (Quyết định 167)

1. **Cảnh Thiên Nhiên & Đời Sống Việt Nam Cho Cả 3 Game:**
   - **Heo Bay (`PigFlightGameView.tsx`):** Bổ sung chi tiết thiên nhiên Việt Nam theo từng vùng:
     - *Vườn nhà:* Khóm tre xanh có đốt, ao sen hồng lá tròn, hàng rào tre, mái ngói đỏ.
     - *Ruộng lúa:* Dãy núi đá vôi mờ xa, ruộng bậc thang vàng óng, đàn cò trắng bay.
     - *Phố nhà:* Dãy nhà phố cổ mái ngói rêu, dây đèn lồng vàng đỏ, cây xanh vỉa hè.
   - **Heo Bắn (`PigShooterGameView.tsx`):** Nâng cấp nền `drawBgAP` ($224 \times 140$) thành đồng quê Việt Nam:
     - Dãy núi đá vôi Ninh Bình nhiều lớp xanh lam nhạt phía chân trời.
     - Lũy tre làng cong vút hai bên, cánh đồng lúa xanh/vàng xen kẽ ao làng và đàn cò trắng.
   - **Heo Qua Đường (`PigCrossRoadGameView.tsx`):** 4 địa danh Sài Gòn kết hợp cây xanh me/dầu vỉa hè, vạch kẻ đường sắc nét.
2. **Sửa Triệt Để Viewport & Điều Khiển Heo Qua Đường (`PigCrossRoadGameView.tsx`):**
   - **Layout `100vh` Flexbox:** `html, body { height: 100%; display: flex; flex-direction: column; overflow: hidden; }` kết hợp `.scene.crscene { flex: 1; min-height: 0; }` giúp canvas $192 \times 256$ tự co vừa khít khoảng trống mà không đẩy D-pad (`#crPad`) và nút `Giơ tay` (`#crHand`) ra khỏi màn hình.
   - **Điều khiển 0ms chuẩn prototype:** Tách riêng `pointerdown`/`pointerup`/`pointercancel` cho từng nút `[data-d]` trên D-pad, và gắn `touchstart` + `click` (`e.stopPropagation()`) cho `#crHand` và modal `[data-cr]`.
   - **Đổi cám lấy vé (`BUY_TICKET`):** Bổ sung nút `10 cám = 1 vé` (`data-cr="buy"`) khi `G_TIX <= 0` đồng bộ hai chiều với `gamificationStore`.

---

## 11. ĐỒNG BỘ CHU TRÌNH KINH TẾ VÉ & CÁM HỢP NHẤT TRÊN CẢ 3 GAME (Quyết định 168)

1. **Chu Trình Tiêu & Đổi Vé Hợp Nhất (1:1 Prototype):**
   - **Thanh trạng thái `.gbar`:** Cả 3 game (`PigFlightGameView`, `PigShooterGameView`, `PigCrossRoadGameView`) đều có thanh `.gbar` trên đầu chứa thông tin số vé `🎫 X vé` và nút `10 cám = 1 vé`.
   - **Trừ vé khi bắt đầu ván (`USE_TICKET`):**
     - *Heo Bay:* Khi bấm cất cánh (`flyFlap` lúc `ready`), kiểm tra và trừ 1 vé.
     - *Heo Bắn:* Khi kéo ná phát đạn đầu tiên của ván, kiểm tra và trừ 1 vé.
     - *Heo Qua Đường:* Khi bấm "Bắt đầu qua đường" hoặc nhấn phím điều hướng đầu tiên, trừ 1 vé.
   - **Chặn khi hết vé (`tickets <= 0`):**
     - Rung phản hồi lỗi `HAPTIC_FAIL`, hiển thị toast `"Hết vé chơi hôm nay! Đổi 10 cám = 1 vé"`.
     - Ngăn bắt đầu chơi cho đến khi người dùng đổi vé hoặc ghi chi tiêu để nhận thêm vé.
   - **Nút đổi vé tức thì (`BUY_TICKET`):**
     - Luôn có sẵn ở thanh `.gbar` và trong popup kết thúc khi hết vé (`tickets <= 0`).
     - Bấm nút $\rightarrow$ Gọi hàm `buyTicketWithFood()` trong `gamificationStore.ts` (trừ 10 cám `pigFood`, cộng 1 vé `gameTickets`, lưu vào `AsyncStorage`).
2. **Thưởng Vé Khi Ghi Chép Chi Tiêu:**
   - Mỗi lần người dùng ghi một khoản chi tiêu mới (chụp ảnh, quét QR hoặc ghi tay), hệ thống tự động thưởng thêm 1 vé chơi (`addGameTickets(1)` trong `transactionStore.ts`), khích lệ thói quen ghi sổ đều đặn.

---

## 12. MỞ RỘNG KHUNG GAME TỐI ĐA, BỎ NÚT ẢO & KIẾN TRÚC KEEP-ALIVE 0MS (Quyết định 169)

1. **Nút Back Icon-Only Tuyệt Đối:**
   - Bỏ toàn bộ chuỗi chữ `‹ Trung tâm Heo Con`, `Quay lại`, `‹ Giải trí`.
   - Nút tròn Neo-Brutalist 38×38px viền 2.5px `#2B2118` nền kem `#FFFBF1` chứa icon `ArrowLeft` nổi trần.
2. **Khung Game Mở Rộng Cực Đại (Large Game Frames):**
   - Khung canvas rộng chiếm ~92–95% màn hình, không bị bóp nghẹt.
   - Heo Bay: Xóa bỏ hàng `[ĐÃ ĂN] [ĐỐNG CÁM] [THỜI TIẾT]`, thanh độ no 10 ô, và cụm 3 nút đáy `[Vỗ cánh] [Tạm dừng] [Đổi trời]` $\to$ Chạm thẳng màn hình để bay.
   - Heo Bắn: Xóa bỏ thẻ chữ mô tả dài ngoằng dưới canvas $\to$ Khung ngắm ná bắn to cao 260px, kéo ná phóng heo rõ ràng.
   - Heo Qua Đường: Xóa bỏ modal hướng dẫn dài dòng lúc vào game $\to$ Người chơi vào thẳng đường phố Sài Gòn, D-pad và nút Giơ tay công thái học ngay dưới canvas.
3. **Kiến Trúc Giữ Ấm Arcade Multi-Slot (Keep-Alive 0ms):**
   - Cả 3 Game WebView được nạp sẵn khi vào chế độ chơi game.
   - Ẩn/hiện bằng `{ opacity: 1/0, zIndex: 10/-1, pointerEvents: 'auto'/'none' }`, giữ nguyên kích thước `{ width: '100%', height: '100%' }` tuân thủ tuyệt đối Rule 4 Fabric iOS.
   - Chuyển đổi giữa 3 game diễn ra tức thì 0ms, không lag, không flash màn hình.

---

## 13. CHUẨN HÓA KHUNG GAME 356PX PIXEL ARCADE VIỆT NAM, SỬA LỖI TOUCH & SINGLE-ACTIVE 60FPS (Quyết định 170)

1. **Sửa Triệt Để Lỗi Chạm Heo Bay (Zero Syntax Error):**
   - Loại bỏ khối lệnh lặp thừa `});` ở dòng 1204-1207 trong `PigFlightGameView.tsx` gây `SyntaxError` làm tê liệt sự kiện chạm.
   - Đảm bảo 100% `<script>` của cả 3 game vượt qua kiểm định Acorn AST parser không một lỗi nhỏ.
   - Chạm bất kỳ đâu trên khung `.scene.flywrap` hoặc canvas đều gọi `flyTap()` phản hồi tức thì 0ms.
2. **Single-Active WebView Engine (0 Lag Warning, 60FPS Mượt Mà):**
   - Chuyển `ChatView.tsx` về chế độ chỉ mount duy nhất 1 WebView của game đang mở (`fly`, `shooter`, hoặc `cross`), cắt giảm 66% CPU/GPU tải nền trên iOS/Android.
   - Toàn bộ điểm số, kỷ lục, vé (`gameTickets`), cám (`pigFood`) và độ no (`pigHunger`) được quản lý tập trung qua `gamificationStore`, đảm bảo chuyển game mượt và bảo toàn 100% dữ liệu.
3. **Khung Game Chuẩn 356px & Họa Tiết Góc Pixel Art Việt Nam:**
   - Chuẩn hóa kích thước khung ngoài cho cả 3 game: `width: 356px; max-width: 100%; border: 3px solid #2B2118; border-radius: 20px; box-shadow: 0 4px 0 #2B2118;`.
   - Giữ nguyên bộ đệm pixel art 1:1 sắc nét bên trong: Heo Bay (`176×224`), Heo Bắn (`224×140`), Heo Qua Đường (`192×256`).
   - Trang trí thêm các góc khung Pixel Art đặc trưng Việt Nam (`.px-corner` SVG/Canvas pixel sắc nét: mái ngói đình làng đỏ, rặng tre xanh, mây trắng bồng bềnh, đèn đường phố cổ) tạo nhận diện máy game thùng Arcade Việt Nam đồng nhất.

---

## 14. TOÀN MÀN HÌNH DỌC CHUẨN iOS/SAMSUNG, CHẠM/VUỐT TRỰC TIẾP & VĂN HÓA VIỆT NAM (Quyết định 171)

1. **Bộ Đệm Dọc Toàn Màn Hình (Full-Bleed Tall Portrait Pixel Art — Zero Dead Space, Zero AI-Slop):**
   - Gỡ bỏ hoàn toàn các sticker góc SVG `.px-corner`.
   - Cả 3 canvas dùng `width: 100%; height: 100%; display: block; image-rendering: pixelated;` kéo dài 100% sát mép đáy màn hình:
     - **Heo Bay:** `FW = 176, FH = 310, GY = 278` (4 vùng văn hóa Việt Nam: Làng quê mái đình cong, Ruộng bậc thang Tây Bắc, Phố cổ Hội An đèn lồng, Đầm sen Đồng Tháp).
     - **Heo Bắn:** `AW = 224, AH = 320, AG = 256, SX = 42, SY = 224` (Núi đá vôi Ninh Bình, cột cờ đỏ sao vàng, lũy tre, đống rơm, nhà ngói ba gian, cánh đồng lúa xanh + ao sen dưới chân đồi).
     - **Heo Qua Đường:** `XW = 192, XH = 340, RD0 = 92, RD1 = 276` (4 địa danh Sài Gòn mở rộng + vỉa hè gạch đỏ trà đá ghế nhựa).
2. **Điều Khiển Chạm/Vuốt Trực Tiếp Heo Qua Đường (Chuẩn Crossy Road iOS/Samsung):**
   - Xóa bỏ hoàn toàn cụm nút D-pad `.dpad` dưới đáy.
   - Chạm/giữ màn hình $\to$ tiến thẳng (`u`); vuốt Trái/Phải/Xuống (`> 18px`) $\to$ né ngang/lùi (`l`/`r`/`d`).
   - 1 nút tròn nổi `✋` gọn ở góc dưới phải màn hình để giơ tay chặn ô tô/xe buýt.

---

## 15. HỆ THỐNG ĐỒ HỌA 16-BIT SNES (2 GAME DỌC 9:16), ĐÔ THỊ SÀI GÒN & 4 LOẠI PHƯƠNG TIỆN THỰC TẾ (Quyết định 172)

1. **Gỡ Bỏ Hoàn Toàn Heo Bắn (Scope Reduction):**
   - Chỉ duy trì 2 mini-game dọc 9:16 tinh gọn: **Heo Bay (`176×312`)** và **Heo Qua Đường (`192×342`)**.
   - Thanh TopBar 16-bit vát cạnh đá/đồng chỉ chứa 2 nút chuyển game (`PixelIconWing` | `PixelIconTraffic`) cùng `PixelIconBack`, `PixelIconTicket`, `PixelIconReload`.
2. **Tài Nguyên Kiến Trúc Đô Thị Sài Gòn 16-bit:**
   - Skyline & Tòa nhà chi tiết: Tháp Bitexco (sân đỗ trực thăng), Landmark 81, 4 địa danh Sài Gòn (Bưu điện TP, Chợ Bến Thành, Nhà thờ Đức Bà, Dinh Độc Lập), chung cư cũ & nhà ống với ô cửa sổ sáng/tối, ban công, cục nóng điều hòa, **bồn nước Inox** trên sân thượng, **mái hiên sọc xanh/đỏ** của tiệm phố, kết cấu gạch/bê tông và bóng đổ **ambient occlusion** giữa các công trình.
3. **4 Loại Phương Tiện Thực Tế 16-bit (`bike`, `car`, `bus`, `truck`):**
   - Tỷ lệ thật, kính chắn gió phản sáng chéo 1px, đèn pha vàng sáng, đèn hậu đỏ, bánh xe có mâm/la-zăng (hubcap) và bóng đổ tiếp đất trên mặt nhựa:
     - `bike`: Xe máy Việt Nam (Wave/Dream, chở hàng, nón bảo hiểm/nón lá).
     - `car`: Ô tô sedan & Taxi Sài Gòn.
     - `bus`: Xe buýt xanh TP.HCM nhiều cửa sổ phản sáng.
     - `truck`: Xe tải thùng sọc tôn nổi (mới bổ sung).

---

## 16. QUY CHUẨN IMMUTABLE WEBVIEW SOURCE & ZERO-RELOAD TICKET SYNC (Quyết định 174)

1. **Cấm tuyệt đối nội suy state thay đổi (`tickets`, `food`, `hunger`) trực tiếp vào `source.html` của `SafeWebView`:**
   - Mọi WebView game (`PigFlightGameView.tsx`, `PigCrossRoadGameView.tsx`) bắt buộc lưu giá trị khởi tạo bằng `useRef` và đóng băng `htmlContent` + `memoizedSource` trong `useMemo(..., [])`.
   - Khi người chơi chạm bắt đầu ván (`USE_TICKET`) hoặc đổi vé (`BUY_TICKET`), WebView **không bao giờ reload** — chú heo lập tức cất cánh / băng qua đường mượt mà 60FPS.
2. **Đồng bộ vé thời gian thực qua `injectJavaScript`:**
   - Mỗi game khai báo `window.__syncTickets = function(n) { G_TIX = Number(n) || 0; ... }` trong JS nội bộ.
   - Tầng React Native lắng nghe `useEffect([tickets])` và gọi `webViewRef.current?.injectJavaScript(...)` để cập nhật số vé tức thì.
3. **Chống chồng đè HUD & Card:**
   - `.flytoast` đặt tại `top: 48px` (Heo Bay) / `top: 46px` (Heo Qua Đường), tách biệt hoàn toàn khỏi thanh điểm HUD phía trên.
   - `PixelHubDashboard.tsx` dùng `paddingBottom: 110` để thẻ cuối không bao giờ bị Floating Pill Tab Bar che.


