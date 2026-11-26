# 📐 TÀI LIỆU THIẾT KẾ GỐC: KHÔNG GIAN MỞ PIXEL ART 10YOE (MASTER BLUEPRINT)

> **Phạm vi:** Nguồn sự thật duy nhất (Single Source of Truth) cho toàn bộ **6 Banner Không Gian Mở + Lòng Chợ Bến Thành** trong PigFly / Ví Heo Con (Quyết định 207).
> **Bắt buộc:** Trước khi vẽ hoặc chỉnh sửa bất kỳ Banner nào, Agent phải đọc tài liệu này kết hợp với [`docs/STYLE_HEOCON.md`](STYLE_HEOCON.md) và [`docs/screens/heocon/01-PIXEL-GFX-PORT.md`](screens/heocon/01-PIXEL-GFX-PORT.md).

---

## 1. CÔNG THỨC DIỆN TÍCH & PHÂN TẦNG KHÔNG GIAN MỞ

Mọi thế giới mở 2D được thiết kế khớp tỷ lệ **1:1** với Sprite Heo Con **`24 × 20` px** và Engine [`pixelOpenRoomEngine.ts`](../src/components/pixel/pixelOpenRoomEngine.ts):

### 1.1 Công Thức Diện Tích Chuẩn
$$W_{\text{world}} \ge 2.75 \times W_{\text{view}} \quad (\text{chuẩn hóa } 3\times), \qquad H_{\text{world}} \ge 1.25 \times H_{\text{view}}$$
* Diện tích thực tế phải đạt tối thiểu **$3.5\times \to 5\times$** diện tích khung nhìn Viewport để hỗ trợ kéo camera 4 hướng (Ngang + Dọc).

### 1.2 Phân Tầng Trục Cao (`Y-Axis`) 4 Lớp Cố Định
| Tầng | Tỷ lệ chiều cao | Nội dung bắt buộc |
| :--- | :---: | :--- |
| **Tầng 1: Bầu Trời / Trần Nhà & Mái Vòm** | `0% .. 28%` | Bầu trời 3 sắc giờ + Mây trôi + Dây đèn lồng lễ hội (ngoài trời); hoặc Trần gỗ / Giàn thép vàng + Quạt trần + Đèn thả (trong nhà). |
| **Tầng 2: Tường / Mặt Tiền / Quầy Kệ** | `28% .. 62%` | Kiến trúc Việt Nam (Cửa Nam, nhà ống, sạp hàng, quầy bar, kệ sách, bàn làm việc, cửa sổ nhìn ra phố). |
| **Tầng 3: Vỉa Hè / Len Chân Tường** | `62% .. 68%` | Len gỗ chân tường (`4–5px`) hoặc vỉa hè lát gạch chuyển tiếp, phân định ranh giới tường & sàn. |
| **Tầng 4: Lối Đi / Sàn Tương Tác (`walkBounds`)** | `68% .. 100%` | Mặt sàn gạch bông Indochine `16×16` / sàn gỗ / đại lộ & khu vực bàn ghế du khách ngồi ăn uống. |

---

## 2. CƠ CHẾ TRƯỢT CAMERA 2D & CỔNG PHÒNG (`pixelOpenRoomEngine.ts`)

1. **Khóa Thao Tác Cảm Ứng (`touch-action: none`):** Mọi `<canvas>` không gian mở **bắt buộc** khai báo CSS `touch-action: none; cursor: grab;` (chuyển thành `grabbing` khi kéo) và gọi `e.preventDefault()` trong `touchmove` / `pointermove` khi độ lệch `> 6px` để `ScrollView` cha không cướp thao tác kéo.
2. **Trượt Tự Do Giữ Góc Nhìn 3 Giây (`panHoldUntil = now + 3000`):**
   - Vuốt tay kéo tự do `camX ∈ [0, W_world - W_view]` và `camY ∈ [0, H_world - H_view]`.
   - Khi buông tay, camera **giữ nguyên vị trí `3.0s`** để người dùng ngắm toàn cảnh, sau đó mới nội suy mượt (`lerpK = min(1, dt * 5.5)`) đưa camera bám về chú heo.
3. **Deadzone Smooth Follow (`28%` biên khung):** Khi chạm sàn cho heo đi lại gần sát mép trái/phải/trên/dưới (`28%` vùng đệm), camera tự động trượt mượt sang phân khu tiếp theo.
4. **Cổng Liên Thông 2 Chiều Siêu Tốc (`fastDash: true`):** Khi chạm vào cửa phòng/cổng khu phố có gắn `fastDash: true`, tốc độ heo tự động tăng lên `Math.max(160, dist / 0.18)` px/s để lướt thẳng tới ngưỡng cửa trong `≤ 180ms` và chuyển cảnh hoàn tất trong `≤ 300ms`.
5. **Chỉ Thị Biên (`◄ ► ▲ ▼`):** Tự động vẽ mũi tên pixel nhấp nháy ở các cạnh còn phần bản đồ ẩn.

---

## 3. QUY CHUẨN VẼ PIXEL ART 10YOE (3 LỚP CHIỀU SÂU & 3 KHUNG GIỜ)

* **Nguyên Tắc 1 Offscreen Canvas Duy Nhất:** Toàn bộ nền tĩnh phải dựng trên **1 offscreen canvas duy nhất** kích thước `W_world × H_world` — **cấm tuyệt đối** ghép từng khung chữ nhật rời gây vết cắt dọc (seam lines) hoặc lệch nền trời/vỉa hè.
* **3 Lớp Chiều Sâu Bắt Buộc:**
  1. **Nền xa (Background):** Dải trời chuyển sắc, mây, skyline xa hoặc tường/trần.
  2. **Kiến trúc & Nội thất (Midground):** Viền nâu mực `#2B2118` (`1px`), cạnh đổ bóng tối hơn `15–20%`, **bóng tiếp xúc (`rgba(43,33,24,0.22)`)** `2px` dưới chân mọi đồ vật & nhân vật chạm sàn.
  3. **Tiền cảnh & Hoạt cảnh sống (Foreground):** Sprite Heo `24×20` chuẩn Tab Vườn, du khách đứng/ngồi ăn, xe cộ, khói bếp bốc lên, đèn lồng đung đưa, quạt trần quay.
* **Tự Động Đổi 3 Khung Giờ Thực Tế (`getTimePalette()`):**
  - **Sáng (`6h–16h`):** Trời xanh nắng ấm (`#78B9F7 → #CCE8FF`), ánh sáng tự nhiên trong trẻo.
  - **Chiều (`16h–19h`):** Hoàng hôn Sài Gòn cam hồng tím (`#6A55A3 → #FBE0A0`), đèn phố bắt đầu chớm sáng.
  - **Tối (`19h–6h`):** Trời đêm xanh sâu (`#161A36 → #4A5188`), bật quầng sáng đèn vàng ấm (`#FFE08A`, `globalAlpha: 0.22`) tại tất cả đèn lồng, sạp hàng và cửa sổ.

---

## 4. BẢN ĐỒ QUY HOẠCH CHI TIẾT 6 BANNER + LÒNG CHỢ BẾN THÀNH

| STT | Màn Hình | File Component | Khung Nhìn (`VW×VH`) | Thế Giới (`W×H`) | Tỷ lệ Diện Tích | Trạng Thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | **Quán quen (Phố Lễ Hội)** | `BenThanhStreetBannerWebView.tsx` | `192 × 100` | `584 × 160` | `4.87×` | **Chặng 1 (Đang thực thi)** |
| 1b | **Lòng Chợ Bến Thành** | `BenThanhMarketBannerWebView.tsx` + `market/*` | `Dynamic 1:1` | `1200 × 760` | `Fullscreen` | Hoàn thiện (QĐ 217 — Mê cung 6 hàng sạp chật chội, 180 người chen chúc 60fps, Heo ngộp thở đổ mồ hôi chạy ra sát cổng) |
| 1c | **Nhà Thờ Đức Bà (Nội Thất)** | `NotreDameCathedralBannerWebView.tsx` + `cathedral/*` | `Dynamic 1:1` | `640 × 520` | `Fullscreen` | Hoàn thiện (QĐ 219 — Kiến trúc Gothic-Romanesque cổ kính Châu Âu, 3 tầng vòm gân vàng đất, kính màu stained-glass, Cung Thánh & ~60 người dự lễ, đèn vàng lung linh 60fps) |
| 1d | **Chùa Việt Nam (Chánh Điện & Sân Chùa)** | `PagodaTempleBannerWebView.tsx` + `pagoda/*` | `Dynamic 1:1` | `640 × 560` | `Fullscreen` | Hoàn thiện (QĐ 220 — Thay Nhà sàn bến sông thành Chùa cổ kính 2 tầng: Chánh Điện Tượng Phật thếp vàng & Sân Chùa Bảo Tháp, Lư Hương khói trầm, Phật tử cúi lạy) |
| 2 | **Hồ sơ (Văn Phòng Heo)** | `ProfileDeskBanner.tsx` | `176 × 80` | `432 × 128` | `3.93×` | Chặng 2 |
| 3 | **Vườn (Sân Vườn & Mặt Tiền)** | `PixelGardenWebView.tsx` | `160 × 96` | `440 × 140` | `4.01×` | Chặng 3 |
| 4 | **Nhà của bạn (Các Phòng)** | `PixelHouseWebView.tsx` | `160 × 96` | `480 × 132` | `4.13×` | Chặng 3 |
| 5 | **Khám phá (Đại Lộ Sài Gòn & Bến Bạch Đằng)** | `EntertainmentBannerWebView.tsx` + `hub/saigonPanoramaArt.ts` | `224 × 108` | `1160 × 128` | `6.14×` | Hoàn thiện (QĐ 221 — Skyline xa Bitexco & Landmark 81, 7 công trình mặt tiền: Quán Phở, Tiệm Cà Phê, Adidas Store, Nhà Thờ Đức Bà, Chợ Bến Thành, SVĐ Thống Nhất, Chùa Việt Nam; đại lộ 2 làn 6 loại xe + CSGT áo vàng; khu Sông Bạch Đằng: Cầu đi bộ, Cầu Ba Son, tàu thuyền lớn) |
| 6 | **Trò chuyện (Quán Cà Phê)** | `CafeChatBannerWebView.tsx` + `cafe/*` | `180 × 120` | `720 × 176` | `5.87×` | Hoàn thiện (QĐ 218 — 6 khu ấm cúng: Barista phin, Thư viện 3 kệ sách + Sofa, Mini Coffee Workshop, Boutique quần áo, Cây thông & 3 quạt trần) |

---

### 4.1 Banner Quán Quen: Phố Lễ Hội Ẩm Thực Việt Nam (`584 × 160`)
* **Canvas ID:** `psCv` | **Camera khởi tạo:** `camX = 185, camY = 0` | **`walkBounds`:** `x ∈ [20..560], y ∈ [84..148]`.
* **Phân tầng Y (`160px`):**
  - `y: 0..32`: Bầu trời 3 sắc giờ + Mây trôi + **Dây đèn lồng Hội An** nối liền suốt `584px` (`#E0452B`, `#F4B93B`, `#38BDF8`, `#EC4899`) phát sáng ban đêm.
  - `y: 28..76`: **8 Sạp Ẩm Thực 2 Bên + Cổng Cửa Nam Chợ Bến Thành ở giữa:**
    1. `x: 10..62`: Sạp **Phở Bò** (nồi nước dùng inox bốc khói, giá đũa, thịt treo tủ kính).
    2. `x: 66..122`: Sạp **Bún Bò Huế & Bánh Mì Sài Gòn** (biển đỏ-vàng, xe bánh mì kính).
    3. `x: 126..180`: Sạp **Bánh Xèo & Nước Mía** (chảo vàng rụm bốc hơi, xe ép mía).
    4. `x: 184..234`: Quầy **Chè Ba Màu & Sinh Tố** (tủ ly sắc màu rực rỡ).
    5. `x: 238..328`: **Cổng Cửa Nam Chợ Bến Thành** (Tháp đồng hồ, chữ xanh `CHỢ BẾN THÀNH`, cổng vòm sâu, 4 chậu bonsai — hotspot `ben_thanh_gate` `fastDash: true` vào Lòng Chợ).
    6. `x: 332..388`: Sạp **Xiên Nướng & Hải Sản Đêm** (bếp than hồng rực + khói nướng).
    7. `x: 392..450`: Quầy **Nón Lá & Áo Dài** (dãy nón lá treo tầng & áo dài rực rỡ).
    8. `x: 454..514`: Quầy **Gốm Sơn Mài & Đặc Sản** (chum gốm, hộp quà đỏ-vàng).
    9. `x: 518..576`: Quầy **Lồng Đèn & Heo Đất** (lồng đèn tròn treo dày & kệ heo đất vàng/hồng).
  - `y: 76..92`: Vỉa hè trên — **Du khách đứng lựa món** trước các quầy hàng (`drawTouristStanding`).
  - `y: 92..114`: Lối đi dạo trung tâm & Vạch sang đường trước cổng Chợ Bến Thành.
  - `y: 114..160`: **Hàng Quán Vỉa Hè Phía Dưới (Tạo thành 2 bên đường lễ hội):** Bàn inox thấp + ghế nhựa xanh/đỏ (`#2563EB`, `#E0452B`), **du khách ngồi ăn uống trò chuyện** (`drawTouristEating`), Xích lô Sài Gòn, Xe Bánh tráng trộn và chậu cây cảnh.

### 4.2 Văn Phòng Làm Việc Của Chú Heo (`ProfileDeskBanner.tsx`, `432 × 128`) — Chặng 2
* `0..108`: Góc tiếp khách sofa kem, bàn trà, cây bàng Singapore, tranh mục tiêu.
* `108..236`: Bàn giám đốc gỗ sồi, laptop biểu đồ, đèn bàn cổ ngỗng, heo đất vàng, lịch nhảy ngày thực.
* `236..336`: Tủ hồ sơ nhiều màu + bảng trắng kế hoạch tiết kiệm.
* `336..432`: Quầy pantry cà phê văn phòng + Cửa kính lớn nhìn ra Bitexco (3 khung giờ).

### 4.3 Khu Vườn Rộng & Mặt Tiền Ngôi Nhà (`PixelGardenWebView.tsx`, `440 × 140`) — Chặng 3
* `0..112`: Vườn cây ăn trái (táo/cam), giàn hoa giấy, xích đu gỗ.
* `112..244`: Mặt tiền Ngôi Nhà Heo Con 2 tầng mái ngói đỏ, ban công đèn LED Noel, **Cửa Chính (`enter_house`, `fastDash`)** bấm vào đi thẳng sang Tab Nhà của bạn.
* `244..348`: Ao cá Koi bơi động, cầu gỗ nhỏ, luống hoa hồng nở rộ.
* `348..440`: Hòm thư đỏ & cổng hàng rào gỗ trắng.

### 4.4 Ngôi Nhà Đầy Đủ Tiện Nghi (`PixelHouseWebView.tsx`, `480 × 132`) — Chặng 3
* `0..124`: **Phòng Khách** (sofa hồng-kem, TV, lò sưởi/cây thông Noel, thảm, **Cửa Ra Vườn** `fastDash`).
* `124..244`: **Phòng Bếp & Bàn Ăn** (tủ bếp gỗ, nồi súp bốc khói, tủ lạnh, bàn ăn 2 ghế).
* `244..364`: **Phòng Ngủ Ấm Cúng** (giường nệm êm, đèn ngủ vàng, cửa sổ đêm tuyết rơi).
* `364..480`: **Phòng Ảnh / Buồng Photobooth** (buồng chụp ảnh mở Camera & khung ảnh album Locket).

### 4.5 Đường Phố Sài Gòn Sầm Uất (`EntertainmentBannerWebView.tsx`, `540 × 112`) & Quán Cà Phê (`CafeChatBannerWebView.tsx`, `432 × 128`)
* Đặc tả chi tiết xem thêm tại [`docs/screens/heocon/10-CHAT.md`](screens/heocon/10-CHAT.md) (Mục 22–27).
* Phố Sài Gòn (`funCv`): Phố Cổ Phở ➔ Tiệm CAFE 1:1 Reference (`fastDash` vào Cafe) ➔ Chợ Bến Thành (`fastDash` vào Lòng Chợ) & Nhà Thờ Đức Bà ➔ Bitexco & Landmark 81 ➔ Nhà Sàn & Bến Sông.
* Quán Cà Phê (`chCv`): Sàn gạch bông Indochine `16×16` chuẩn lưới từ `y=80..128`, Quầy bar phin, Bàn Heo AI, Góc đọc sách & Cây thông, Cửa `RA PHỐ` (`fastDash`).
