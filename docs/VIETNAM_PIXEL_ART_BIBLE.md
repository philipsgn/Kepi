# 🎨 BỘ CÔNG THỨC CHUẨN PIXEL ART VIỆT NAM (VIETNAM PIXEL ART BIBLE)

> **Phiên bản:** v1.0 (Quyết định 224 — 2026-11-26)  
> **Nguồn tinh hoa:** Chắt lọc từ [`Hugo-Dz/spritefusion-pixel-snapper`](https://github.com/Hugo-Dz/spritefusion-pixel-snapper), [`shika-works/pixelium-design`](https://github.com/shika-works/pixelium-design) (hệ màu OKLab + kiến trúc mô-đun *Stardew Valley / Kairosoft*), kết hợp chuẩn Neo-Brutalist Heo Con (`prototype/Ví Heo Con.html`) và thực tế đô thị Việt Nam.  
> **Module code dùng chung:** [`src/components/pixel/vnPixelArtKit.ts`](../src/components/pixel/vnPixelArtKit.ts)  
> **Bắt buộc:** Mọi AI Agent **PHẢI** đọc tài liệu này trước khi vẽ hoặc chỉnh sửa bất kỳ không gian pixel art nào (Banner, Chợ Bến Thành, Quán Phở, Quán Cà Phê, SVĐ Thống Nhất, Adidas Store, Nhà Thờ, Chùa).

---

## CHƯƠNG 1: KỶ LUẬT LƯỚI PIXEL & ĐỘ SẮC NÉT (TỪ `spritefusion-pixel-snapper`)

Để triệt tiêu hoàn toàn hiện tượng "AI pixel slop" (nhòe mờ, lệch hạt, thừa màu, viền răng cưa bẩn), mọi canvas pixel art bắt buộc tuân thủ 4 định luật:

1. **Khóa Lưới Integer 1px (Zero Sub-Pixel Drift):**
   - Mọi tọa độ vẽ hình (`x, y, w, h`), tọa độ sprite và tọa độ camera (`camX`, `camY`) bắt buộc làm tròn bằng `Math.round()` hoặc `| 0`.
   - **Cấm tuyệt đối** vẽ tọa độ lẻ `.5`, cấm nhân `devicePixelRatio` vào buffer canvas trên WebView nhỏ, và luôn đặt `ctx.imageSmoothingEnabled = false` + CSS `image-rendering: pixelated; image-rendering: crisp-edges;`.
2. **Ngân Sách Màu Có Kiểm Soát (24–32 Màu / Cảnh):**
   - Mỗi cảnh chỉ dùng **24–32 màu chủ đạo** chia thành từng dải vật liệu 3–4 bậc (`Highlight → Mid → Shadow → Ink`), cấm tự pha màu ngẫu nhiên ngoài bảng.
3. **Dịch Chuyển Sắc Độ Tự Nhiên (Hue-Shifting):**
   - Khi làm sáng (`Highlight`), dịch sắc độ nhẹ về phía **vàng ấm**; khi làm tối (`Shadow`), dịch sắc độ nhẹ về phía **tím/xanh đậm** thay vì chỉ kéo độ sáng đen-trắng (giúp ảnh có chiều sâu sống động như game indie 32-bit).
4. **Đường Viền Bảo Toàn Cấu Trúc (Selective Outline / Sel-Out):**
   - **Đối tượng tương tác / Chuyển động** (Heo Mascot `24×20`, Người, Xe cộ, Tàu thuyền, Nội thất chính): dùng viền ngoài đậm nâu mực **`#2B2118` (`1px`)** để bật nổi 100% khỏi nền.
   - **Kiến trúc nền xa & Vật tĩnh phụ** (Skyline Bitexco/Landmark 81, gạch lát nền, vạch kẻ đường): dùng viền mềm tối hơn `15–20%` màu nền (`sel-out`), cấm viền đen đặc gây rối mắt.

---

## CHƯƠNG 2: HỆ MÀU VẬT LIỆU VIỆT NAM CHUẨN OKLAB (TỪ `pixelium-design`)

Dựa trên nguyên lý cảm nhận độ sáng đồng đều **OKLab** của `pixelium-design`, toàn bộ bảng màu vật liệu Việt Nam được chuẩn hóa thành 4 bậc sáng rõ ràng và tự thích ứng **3 khung giờ thực tế** (`Sáng 6h–16h` / `Hoàng hôn 16h–19h` / `Đêm 19h–6h`):

| Chất Liệu Việt Nam | Highlight (`hi`) | Midtone (`mid`) | Shadow (`sh`) | Outline / Deep (`dk`) | Ứng Dụng Thực Tế |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Tường Vàng Vôi Phố Cổ** | `#FFF1CC` | `#F2DBAE` | `#D9B982` | `#8F6E42` | Quán Phở, Chợ Bến Thành, Nhà phố Sài Gòn |
| **Ngói Đỏ Âm Dương** | `#DE5D40` | `#C4452C` | `#942B1A` | `#5C190E` | Mái Chợ, Quán Phở, Chùa Việt Nam |
| **Gạch Đỏ Marseille** | `#CE6046` | `#B54B34` | `#873321` | `#4E1E14` | Nhà Thờ Đức Bà, tường gạch cổ |
| **Gạch Bông Indochine** | `#FFF8E6` | `#E8DCC0` | `#4A8A80` | `#C4603A` | Sàn Quán Cà Phê, Sàn Quán Phở cổ (`16×16` tile) |
| **Gỗ Gụ / Gỗ Lim** | `#8A5634` | `#6B4226` | `#4A2C1A` | `#2B180E` | Cột Chùa, Bàn ghế gỗ, Quầy Bar Cafe |
| **Inox Nồi Phở / Bàn Quán** | `#F8FAFC` | `#CBD5E1` | `#94A3B8` | `#475569` | Nồi nước dùng Phở, bàn inox, tủ kính thịt |
| **Nhựa Đường Đại Lộ** | `#52545E` | `#3B3C42` | `#2B2C32` | `#1C1D22` | Đại lộ Sài Gòn, mặt Cầu Ba Son |
| **Cỏ Sân Vận Động** | `#4CAF50` | `#388E3C` | `#2E7D32` | `#1B5E20` | Sân cỏ kẻ sọc SVĐ Thống Nhất, Công viên Thủ Thiêm |
| **Kính Hiện Đại / Flagship** | `#E0F2FE` | `#93C5FD` | `#3B82F6` | `#1E293B` | Cửa hàng Adidas, kính chắn gió xe hơi |
| **Đồng Phục CSGT Áo Vàng** | `#FFE484` | `#F4D059` | `#C7A23A` | `#7A4B2A` | Công an giao thông đứng bục điều tiết |

---

## CHƯƠNG 3: THƯỚC TỶ LỆ VÀNG VIỆT NAM (`1px ≈ 4cm`, NEO THEO HEO `24×20`)

Mọi không gian phải tuân thủ chặt chẽ cùng 1 thước tỷ lệ để **không bao giờ xuất hiện xe nhỏ như đồ chơi, người lùn hơn ghế, hay chú Heo bị múp lệch chuẩn**:

| Đối Tượng | Kích Thước Chuẩn (`W × H` px) | Quy Tắc Bắt Buộc |
| :--- | :---: | :--- |
| **Chú Heo Mascot (Đi bộ)** | **`24 × 20`** | Bắt buộc port **1:1** hàm `drawPigSpriteCanonical` từ `PixelGardenWebView.tsx` (thân thon, đầu tách biệt, 4 chân mảnh — cấm vẽ 1 khối elip bầu dục). |
| **Chú Heo Lái Xe Máy** | **`26 × 24`** | Heo `1:1` ngồi yên xe máy đỏ-kem, đội mũ bảo hiểm vàng-trắng có kính chắn gió. |
| **Người lớn Việt Nam** | **`12 × 22`** (đứng) / **`14 × 18`** (ngồi) | Đầu `5–6px`, thân áo `7–8px`, chân `6–8px`, luôn có bóng tiếp xúc `rgba(43,33,24,0.32)`. |
| **Xe máy Việt Nam** | **`22 × 16`** | 2 bánh có vành bạc (`r=3.2`), người lái đội mũ bảo hiểm, đèn pha/hậu. |
| **Xe hơi Sedan / Xe Cảnh Sát** | **`40 × 20`** | Thân 3 tông màu, kính phản sáng, 2 bánh lớn (`r=4`); Xe CSGT nháy đèn Xanh `#38BDF8` – Đỏ `#EF4444`. |
| **Xe tải thùng** | **`52 × 24`** | Thùng hàng bạc có gân sọc + cabin đầu xe + 2 bánh lớn (`r=4.5`). |
| **Xe buýt Sài Gòn** | **`66 × 25`** | Thân xanh dương sọc trắng, 7 cửa sổ sáng đèn, bảng số tuyến. |
| **Xe Container đầu kéo** | **`82 × 28`** | Thùng container dài + khung rơ-moóc + đầu kéo + 3 trục bánh (`r=4.8`). |
| **Tàu thuyền Sông Sài Gòn** | **`54..78 × 20..24`** | Tàu du lịch 2 tầng, Saigon Waterbus, sà lan container rẽ vệt sóng trắng. |
| **Làn đường cơ giới** | **Cao `≥ 32px / làn`** | Đại lộ 2 làn tối thiểu `64–68px` để chứa xe container/bus không bị cắt nóc. |
| **Cửa ra vào / Hẻm đi bộ** | **Rộng `≥ 28px`, Cao `≥ 26px`** | Lối đi giữa 2 dãy bàn/sạp nội thất tối thiểu `28px` để Heo `24×20` đi mượt không kẹt AABB. |

---

## CHƯƠNG 4: LUẬT LOGIC ĐƯỜNG XÁ, XE CỘ, CẦU & NGƯỜI ĐI ĐỨNG VIỆT NAM

1. **Luật Giao Thông Bên Phải (Right-Hand Traffic):**
   - Trong góc nhìn ngang 2D: **Làn trên** xe đi từ phải sang trái (`dir = -1`); **Làn dưới** xe đi từ trái sang phải (`dir = 1`).
   - Mọi xe khi lật hướng (`dir < 0`) bắt buộc lật gương (`scale(-1, 1)`) để đèn pha luôn hướng về phía trước và khói pô/đèn hậu ở phía sau.
2. **Phân Quyền Không Gian Tuyệt Đối:**
   - **Vỉa hè (`y: 68..96`), Vạch ngựa vằn, Cầu Đi Bộ & Công viên:** Chỉ dành cho người đi bộ & chú Heo đi bộ. **Cấm tuyệt đối xe cơ giới đi lên.**
   - **Lòng đường đại lộ (`y: 96..164`) & Cầu Ba Son:** Dành cho xe cơ giới & chú Heo đội mũ bảo hiểm lái xe máy.
   - **Hai đầu cầu phải nối đất thật:** Cả **Cầu Đi Bộ** lẫn **Cầu Ba Son** phải có bờ Tây (Bến Bạch Đằng) và bờ Đông (Thủ Thiêm) rõ rệt, có trụ cầu cắm xuống nước và gầm cầu đủ thoáng cho tàu thuyền đi qua.
3. **Thuật Toán Tránh Va Chạm 2 Lớp (`stepTrafficSafe` — Zero Collision):**
   - **Lớp 1:** Mọi xe cùng làn quét khoảng cách phía trước (`safeGap ≥ 24px`) với xe trước và với chú Heo đang lái xe máy (`gapToPig < 34px` → phanh giảm tốc mượt về `0`).
   - **Lớp 2:** Khi chú Heo lái xe máy tiến sát xe cùng làn, tự động nép nhẹ `y` sang khe thoáng → **0% va chạm / 0% chồng hình**.
4. **Logic Nội Thất (AABB + Y-Sorting):**
   - Mọi quầy bar, bàn ăn, kệ hàng, tủ kính, cột nhà, bàn thờ bắt buộc khai báo hộp va chạm `obstacles[]` (AABB) để Heo không đi xuyên tường/bàn.
   - Bắt buộc vẽ theo thứ tự chiều sâu **Y-Sorting** (vật có chân `y` nhỏ hơn vẽ trước, vật có chân `y` lớn hơn vẽ sau) và luôn có **bóng tiếp xúc** `rgba(43,33,24,0.28)` dưới chân mọi đối tượng chạm sàn.

---

## CHƯƠNG 5: BLUEPRINT SẴN SÀNG CODE CHO 4 KHÔNG GIAN TRỌNG ĐIỂM

### 5.1 Blueprint 1: Quán Phở Cổ Truyền Việt Nam (`640 × 420`, Fullscreen)
- **Tỷ lệ & Cổng:** Fullscreen Dynamic `1:1` Square Pixel, kết nối 2 chiều với hotspot `pho_old_quarter` trên Tab Khám phá (`onEnterPho` ↔ `exit_pho`).
- **Sàn & Tường:** Sàn gạch bông Indochine `16×16` cổ điển + tường vàng vôi phố cổ ốp gạch men trắng cao `1.2m`, quạt tường xanh quay 60fps, bảng giá đỏ-vàng `PHỞ TÁI · NẠM · GẦU · ĐẶC BIỆT` & lịch bloc đỏ treo tường.
- **4 Phân Khu Chính (có AABB Obstacles):**
  1. **Khu Bếp Phở Mặt Tiền (`y: 44..140`):** Quầy inox dài, 2 nồi nước dùng inox khổng lồ nghi ngút khói động 60fps (`drawSteamPuff`), tủ kính treo thịt bò/gân/bánh phở/hành lá, thớt gỗ tròn & **đầu bếp mặc tạp dề chan nước phở** động tác nhún tay.
  2. **Khu Bàn Ăn Inox Trong Nhà (`y: 155..310`):** 2 dãy bàn inox tròn/chữ nhật + ghế nhựa xanh/đỏ (`#2563EB`, `#E0452B`), trên mặt bàn có **tô phở bốc khói, giỏ đũa muỗng, hũ tương ớt đỏ, hũ giấm tỏi trắng, đĩa chanh ớt & rổ rau thơm**, cùng 10–12 thực khách ngồi xì xụp ăn phở.
  3. **Góc Trà Đá & Quẩy Nóng (`x: 500..610`):** Bình trà đá inox, ly thủy tinh khía, rổ quẩy giòn & tủ nước ngọt.
  4. **Cửa Ra Đại Lộ (`y: 376..418`):** Bậc tam cấp + biển `PHỞ BÒ GIA TRUYỀN` + hotspot `exit_pho` (`fastDash: true`).

### 5.2 Blueprint 2: Quán Cà Phê Sài Gòn (`720 × 176`, Chuẩn Hóa Theo Bible)
- Giữ nguyên 6 phân khu ấm cúng đã dựng (QĐ 218): Quầy Bar cà phê phin có Barista, Khu bàn Heo AI, Thư viện 3 kệ sách kịch trần + Sofa, Mini Coffee Workshop, Góc Boutique quần áo + Cây thông + Cây xanh, Cửa kính 3 khung giờ.
- Khi nâng cấp tiếp theo: áp dụng bảng màu OKLab `VN_OKLAB_MATERIALS` từ `vnPixelArtKit.ts`, chuẩn hóa dáng Heo `1:1` Tab Vườn và tinh chỉnh Y-sorting bàn ghế tiền cảnh.

### 5.3 Blueprint 3: Sân Vận Động Bóng Đá Thống Nhất (`640 × 520`, Fullscreen)
- **Tỷ lệ & Cổng:** Fullscreen Dynamic `1:1` Square Pixel, kết nối 2 chiều với hotspot `thong_nhat_stadium` trên Tab Khám phá (`onEnterStadium` ↔ `exit_stadium`).
- **Cấu Trúc 3 Lớp Sống Động 60fps:**
  1. **Khán Đài 4 Phía A–B–C–D (`y: 0..120`, `y: 410..480`, 2 bên cánh):** Hàng ghế xanh-trắng-đỏ chật kín **80+ cổ động viên** (dùng sprite cache `mk()` 60fps) nhấp nhô reo hò, vẫy **cờ đỏ sao vàng**, cùng **bảng tỷ số điện tử LED `VIETNAM 2 - 0`** ở khán đài B và **4 trụ đèn pha 4 góc** tỏa quầng sáng vàng ấm.
  2. **Mặt Sân Cỏ Kẻ Sọc (`x: 84..556, y: 128..396`):** Cỏ sọc 2 tông xanh OKLab (`#388E3C` / `#2E7D32`), vạch vôi trắng sắc nét (đường biên, vòng tròn giữa sân, 2 vòng cấm địa 16m50, chấm phạt đền), 2 khung thành có lưới trắng.
  3. **Trận Đấu Bóng Đá Mini 60fps:** **10 cầu thủ** (5 áo Đỏ sao vàng vs 5 áo Xanh) chạy chiến thuật, chuyền bóng & sút bóng pixel thật trên sân cỏ; khi bóng lăn vào lưới thì bảng tỷ số nháy đèn + khán đài tung hô!
  4. **Đường Piste Điền Kinh Đỏ Gạch (`walkBounds` cho Chú Heo):** Chú Heo Mascot `24×20` đi dạo xung quanh đường chạy điền kinh cổ vũ cầu thủ (có AABB chặn không chạy cắt ngang sân đang thi đấu!), có cổng `exit_stadium` (`fastDash: true`) ở đáy khán đài A.

### 5.4 Blueprint 4: Cửa Hàng Quần Áo Adidas Flagship (`560 × 380`, Fullscreen)
- **Tỷ lệ & Cổng:** Fullscreen Dynamic `1:1` Square Pixel, kết nối 2 chiều với hotspot `adidas_store` trên Tab Khám phá (`onEnterAdidas` ↔ `exit_adidas`).
- **4 Phân Khu Flagship Hiện Đại:**
  1. **Bức Tường Sneaker LED (`y: 26..108`):** Nền bê tông tối có logo **3 sọc chéo trắng phát sáng**, 3 tầng kệ trưng bày 12 đôi giày sneaker đủ phối màu.
  2. **Khu Giá Treo Quần Áo & Áo Đấu Thể Thao (`y: 126..268`):** Giá treo kim loại đen trưng bày áo khoác 3 sọc, hoodie, áo đấu bóng đá, cùng **3 ma-nơ-canh** đứng bục có đèn spotlight rọi từ trần.
  3. **Phòng Thử Đồ & Gương Lớn (`x: 24..116`):** Rèm xám kéo gọn, gương toàn thân phản chiếu, ghế thử giày.
  4. **Quầy Thu Ngân & Cửa Kính Tự Động (`x: 420..536` & `y: 338..378`):** Nhân viên mặc áo đen 3 sọc đứng quầy POS, hộp giày xếp chồng & cửa kính `exit_adidas` (`fastDash: true`).

---

## CHƯƠNG 6: CHECKLIST NGHIỆM THU BẮT BUỘC TRƯỚC KHI COMMIT (10 TIÊU CHÍ)

- [ ] **1. Khóa lưới 1px:** Toàn bộ `R()`, `E()`, `camX`, `camY` đã làm tròn integer, `imageSmoothingEnabled = false`.
- [ ] **2. Ngân sách màu OKLab:** Dùng đúng bảng màu vật liệu Việt Nam (24–32 màu/cảnh), tự thích ứng 3 khung giờ (nếu ngoài trời).
- [ ] **3. Dáng Heo Mascot 1:1:** Dùng đúng `drawPigSpriteCanonical` chuẩn Tab Vườn (`24×20`, thân thon, đầu tách biệt, 4 chân mảnh).
- [ ] **4. Đúng Thước Tỷ Lệ Vàng:** Không có xe nhỏ như đồ chơi, không có cửa thấp hơn người, lối đi `≥ 28px`.
- [ ] **5. Bóng Tiếp Xúc & Sel-Out:** Mọi nhân vật, xe cộ, bàn ghế đều có bóng tiếp xúc dưới chân và viền `#2B2118` rõ nét.
- [ ] **6. Logic Đường Xá & Phân Quyền:** Xe đi bên phải, không leo vỉa hè/cầu đi bộ; cầu nối 2 bờ rõ rệt.
- [ ] **7. Zero Collision & AABB:** Xe cộ tránh va chạm 2 lớp (`stepTrafficSafe`), nội thất có đủ `obstacles[]` và `Y-Sorting`.
- [ ] **8. Kết Nối Engine Chuẩn:** Dùng đúng `window.__openRoom` (`step(dt, now)`, `state`, `drawOverlays(ctx, now)`), hỗ trợ Web `<iframe srcDoc>` + Native `SafeWebView` (không `baseUrl: ''`).
- [ ] **9. Cú Pháp JS Sạch:** Đã kiểm chứng script lắp ráp bằng `new Function(...)` trong `run-all-tests.js` đạt 0 lỗi.
- [ ] **10. Đồng Bộ Tài Liệu & Test:** Đã cập nhật `docs/`, `npx tsc --noEmit` (0 lỗi) và `node run-all-tests.js` (100% pass).
