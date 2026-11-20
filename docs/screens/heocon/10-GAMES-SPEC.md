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

### 3.3. Chu Kỳ Bầu Trời Ngày/Đêm 8 Pha (`skyAt(u)`)
Biến số thời gian $u \in [0, 1]$ thay đổi chậm theo nhịp bay:
- $u = 0.00$: Bình minh ửng hồng (`#F7B6A0` $\to$ `#FBE3B8`).
- $u = 0.40$: Ban ngày nắng trong (`#58B6EE` $\to$ `#C3E9F8`).
- $u = 0.58$: Hoàng hôn rực rỡ (`#F29A62` $\to$ `#FFD9A0`).
- $u = 0.70$: Chập tối tím thẫm (`#6B4A86` $\to$ `#EE9A74`).
- $u = 0.80 \to 0.94$: Đêm đen sâu thẳm (`#1D2A4F` $\to$ `#3A4C80`) hiện **36 ngôi sao nhấp nháy `STARS`**.

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
