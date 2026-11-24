# QUY TẮC & QUY TRÌNH DÀNH CHO AI AGENT (AGENTS.MD)

> **Dự án:** PigFly (Ví Locket) — Mobile App Chi Tiêu Bằng Ảnh, Quét Mã QR & AI-First Gamification  
> **Phiên bản tài liệu:** NEW v4.5 (Style "Heo Con" Neo-Brutalist Pixel + Bắt Buộc Bám Sát Code Đồ Họa Prototype)  
> **Áp dụng cho:** Tất cả các AI Agent tham gia lập trình và phát triển dự án.

---

## 🚨 NGUYÊN TẮC BẤT DI BẤT DỊCH (CORE DIRECTIVES)

### 1. QUY TẮC "TÀI LIỆU SỐNG" (LIVING DOCUMENTATION DIRECTIVE)
* **Tài liệu tạo ra phải có lý do cụ thể và BẮT BUỘC ĐƯỢC ĐỌC TRONG SUỐT QUÁ TRÌNH THỰC THI** — Tuyệt đối cấm tạo tài liệu xong để đó!
* **Trước khi chạm vào bất kỳ dòng code nào**, Agent bắt buộc phải tra cứu và đọc kỹ tài liệu tương ứng với Module / Feature / Screen sắp thực hiện (xem *Ma Trận Tra Cứu Tài Liệu* ở Mục 2).
* **Quy tắc Đồng bộ Ngược (Reverse Sync):** Bất kỳ khi nào có sự thay đổi về quyết định kỹ thuật, cấu trúc dữ liệu, hoặc luồng người dùng (UX flow), Agent bắt buộc phải cập nhật ngược lại vào các tài liệu liên quan trong `/docs` để giữ cho tài liệu luôn là **Nguồn Sự Thật Duy Nhất (Single Source of Truth)**.

### 2. QUY TRÌNH 2 ĐẦU BẮT BUỘC: CẬP NHẬT TÀI LIỆU TRƯỚC KHI PROCEED / VIẾT CODE
* **TRƯỚC KHI PROCEED / VIẾT CODE (Pre-Execution Spec Sync — Chuẩn Logic Nhất):**
  1. Đọc tất cả tài liệu liên quan trong `/docs`.
  2. **Bắt buộc cập nhật tài liệu `/docs` trước khi chạm vào code:** Cập nhật ngay các quyết định thiết kế, kiến trúc mới vào tài liệu để tài liệu luôn là Bản Thiết Kế (Blueprint) định hình code. Tuyệt đối không để xảy ra tình trạng "viết code xong mới đối phó cập nhật tài liệu".
  3. Trình bày **Implementation Plan** chi tiết: Liệt kê các tài liệu đã cập nhật, các file sẽ thay đổi và tiêu chí nghiệm thu.
* **SAU KHI THỰC THI & KIỂM THỬ (Post-Execution Walkthrough):**
  1. Chạy toàn bộ kiểm thử xác thực: `npx tsc --noEmit` (0 lỗi) và `node run-all-tests.js` (100% pass).
  2. Xuất **Walkthrough Report** minh bạch: Ghi nhận bằng chứng kiểm thử thực tế và kế hoạch tiếp theo.

### 3. QUY TẮC "BÁM SÁT CODE ĐỒ HỌA PROTOTYPE" (STYLE "HEO CON" — PIXEL NEO-BRUTALIST)
* **Nguồn chân lý đồ họa:** `prototype/Ví Heo Con.html` (CSS + code vẽ canvas JS). Toàn bộ hình ảnh pixel (sprite heo 24×20, mặt heo 16×16, cảnh vườn Việt hóa 176×132, máy trạng thái heo) **PHẢI PORT 1:1** từ code gốc — **CẤM TỰ CHẾ** hình dáng, tọa độ, bảng màu, seed.
* **Trước khi code BẤT KỲ màn hình/UI nào**, Agent bắt buộc đọc theo thứ tự:
  1. `docs/STYLE_HEOCON.md` — ngôn ngữ thiết kế chung (token, viền 3px, bóng cứng 0-blur, thang chữ, giọng văn heo).
  2. `docs/screens/heocon/` — đặc tả screen-unit nhỏ tương ứng (xem `00-INDEX.md` để chọn đúng file).
  3. `prototype/Ví Heo Con.html` — code đồ họa gốc, đặc biệt với mọi màn có pixel art (port theo `docs/screens/heocon/01-PIXEL-GFX-PORT.md`).
* **Quy tắc port pixel art:** giữ nguyên hex/bảng màu (`C`, `PAL`), tọa độ logic, seed `mulberry32`; chỉ được đổi API vẽ (canvas → PNG generator / RN View) và scale 4× nearest-neighbor; ≤ 32 màu; cấm làm mờ/anti-alias. Mọi lệch so với prototype phải ghi vào `docs/DECISIONS.md` kèm lý do.
* **Token-only:** cấm hard-code hex trong component — mọi màu qua `src/theme/tokens.ts` (bảng `heoconTokens`).
* **Giữ nguyên 100% tính năng & logic:** re-skin chỉ thay da; không đổi store/data contract/luồng nghiệp vụ.
* **Không thêm đơn vị điểm ảo ("cám"/FEP)** — phần thưởng quy về Chuỗi Streak + "Đã giữ lại" (Quyết định 112/116).

### 4. QUY TẮC SỐNG CÒN CHO SAFEWEBVIEW TRÊN FABRIC IOS (CHỐNG MÀN HÌNH VÀNG KHÈ, MỜ CANVAS & KẸT POPUP)
* **CHỮA DỨT ĐIỂM MÀN HÌNH VÀNG KHÈ `#F6EEDC` (CGRectZero & Cancelled Load):**
  - **1. BỎ HOÀN TOÀN `baseUrl: ''` (Chuỗi Rỗng):** WebKit trên iOS 16/17/18 coi chuỗi rỗng `""` là URL không hợp lệ và hủy tải (`NSURLErrorCancelled`). Luôn chỉ truyền `source={{ html: htmlContent }}`.
  - **2. TUYỆT ĐỐI CẤM `flex: 0` VÀ KÍCH THƯỚC ÉP CỨNG:** Không truyền `flex: 0` hay tính toán chiều cao số cứng vào `SafeWebView` vì Yoga Layout sẽ co native WKWebView thành `CGRectZero (0×0)`. Luôn dùng Flexbox tự nhiên `{ flex: 1, width: '100%', backgroundColor: '#F6EEDC' }` cho cả container cha, `containerStyle` và `style` của `SafeWebView`.
  - **3. TUYỆT ĐỐI CẤM `onLayout` setContentHeight re-render loop:** Không được lấy chiều cao từ `onLayout` để `setState` liên tục làm WebView bị unmount/freeze.
  - **4. Console Error Bridge:** Luôn nhúng `window.onerror` bắn `postMessage` về React Native để bắt mọi cú pháp lỗi JavaScript trong HTML.

* **QUY TẮC PIXEL ART CANVAS SẮC NÉT 100% (CHỐNG MỜ DO GPU DOWNSCALING):**
  - **Bộ đệm Canvas (Buffer Resolution):** Giữ nguyên tỷ lệ pixel logic 1:1 từ prototype gốc (`176 × 224` cho Heo Bay, `224 × 140` cho Heo Bắn). **TUYỆT ĐỐI KHÔNG NHÂN DPR** vào kích thước bộ đệm canvas (`flyC.width = 176; apC.width = 224;`). Vì vùng hiển thị thực tế trên điện thoại chỉ ~348px, nếu nhân DPR=3 thành 528px/672px rồi bị CSS ép thu nhỏ lại, GPU WebKit sẽ bắt buộc áp bộ lọc bilinear làm nhòe mờ hạt pixel. Giữ nguyên kích thước gốc để WebKit phóng to (upscale 2×) kích hoạt thuật toán Nearest-Neighbor sắc bén từng pixel!
  - **CSS Image Rendering:** Luôn dùng `image-rendering: pixelated; image-rendering: -webkit-crisp-edges; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges;` (CẤM dùng `-webkit-optimize-contrast` vì nó kích hoạt bộ lọc làm mờ bicubic).
  - **Tắt làm mờ 2D:** Luôn đặt `ctx.imageSmoothingEnabled = false;` trong vòng lặp vẽ.

* **QUY TẮC CSS MODAL POPUP [hidden] & ĐÓNG 0MS (CHỐNG KẸT MÀN HÌNH CHƠI):**
  - Mọi file HTML có thẻ modal popup (`.flyover`) BẮT BUỘC phải có rule CSS:
    `[hidden] { display: none !important; }`
    `.flyover[hidden] { display: none !important; }`
    (Vì thuộc tính tác giả `.flyover { display: flex; }` có độ ưu tiên cao hơn thuộc tính `[hidden]` của trình duyệt, nếu không có `!important`, modal sau khi gán `hidden = true` vẫn giữ `display: flex` che kín toàn bộ màn hình!).
  - Trong hàm đóng modal (`flyRestart`, `apStart`): Bắt buộc gán cả `o.style.display = 'none'; o.hidden = true; o.innerHTML = '';`.
  - Lắng nghe sự kiện đa kênh: Dùng Event Delegation gắn vào modal container với cả `pointerdown`, `touchstart` (`e.stopPropagation()`) lẫn `click` để nút "Bay lại", "Chơi lại", "Về vườn" phản hồi tức thì 0ms.

* **CƠ CHẾ NÁ BẮN ANGRY PIG 1:1 PROTOTYPE:**
  - Bắt cử chỉ vuốt chạm ná bằng `touchstart`/`pointerdown` trên canvas.
  - Sự kiện kéo lùi (`touchmove`/`pointermove`) và thả tay (`touchend`/`pointerup`) BẮT BUỘC lắng nghe trên cả `apC` và `window` với `{ passive: false }` và `e.preventDefault()`, để khi người dùng kéo lùi ngón tay sát mép trái màn hình ($x < 36 \to x \approx 8$) cử chỉ không bị `pointercancel` hủy ngang.
  - Vận tốc phóng đạn theo đúng prototype: $vx = -dx \times AK$ và $vy = -dy \times AK$ (với $AK = 8.5$), vẽ đường đạn 14 chấm quỹ đạo và 2 dây cao su ná co giãn theo ngón tay.

---

## 🧠 NGUYÊN TẮC HỌC TẬP TỪ GLOBAL SKILLS (UI/UX PRO MAX, FRONTEND DESIGN & CODE REVIEW STANDARDS)

Được kế thừa và đúc kết từ bộ kỹ năng đại lý toàn cầu `krishnakanthb13/antigravity_global_skills`:

### 1. QUY CHUẨN NEUBRUTALISM UI/UX PRO MAX (CATEGORY 38 & FRONTEND DESIGN)
* **Quy tắc Viền & Bóng Đổ 0-Blur:** Mọi Card, Container và Badge theo phong cách Heo Con bắt buộc dùng viền đặc 3px (`#2B2118`), bóng cứng góc 45° độ mờ bằng 0 (`shadowOffset: { width: 0, height: 4 }`, `shadowOpacity: 1, shadowRadius: 0, elevation: 4`).
* **Thesis Hero & Tránh "Generic AI Aesthetic":** Tuyệt đối không thiết kế các giao diện mặc định nhàm chán kiểu AI (nền trắng nhạt + gradient nhòe). Điểm nhấn độc bản (Signature Element) của mỗi màn hình phải mang linh hồn riêng: Mascot Heo 24×20 sống động và các địa danh biểu tượng của Việt Nam (Tháp Bitexco, Vườn nhà Việt).
* **Cặp Typography Có Hồn:**
  - Tiêu đề, số tiền và chỉ số tài chính: Bắt buộc dùng **`Baloo2_800ExtraBold`** kèm `fontVariant: ['tabular-nums']` để số tiền không giật khi đếm.
  - Nhãn, mô tả và nội dung: Dùng **`Nunito`** (600–700 bold).
* **Ngôn Ngữ Thiết Kế Từ Góc Nhìn Người Dùng:** Đặt tên phần tử theo những gì người dùng kiểm soát và nhận biết, không dùng thuật ngữ kỹ thuật (Ví dụ: `Heo chủ nhân`, `Hôm nay tiêu được`, `Chuỗi ghi`, `Đã lưu`).

### 2. HIỆU NĂNG REACT NATIVE & TRẢI NGHIỆM CHẠM XÚC GIÁC (REACT NATIVE PRO SPEC)
* **Vùng Chạm Chuẩn Công Thái Học ($\ge 44 \times 44$px):** Mọi nút bấm, icon và ô tương tác phải có vùng chạm tối thiểu $\ge 44 \times 44$px thông qua `hitSlop`.
* **Chống Layout Shift Tuyệt Đối:** Mọi hình ảnh, avatar pixel, và WebView Canvas phải khai báo kích thước hoặc tỷ lệ tường minh (`aspectRatio: 176 / 80`).
* **Tối Ưu Re-render & Bộ Nhớ:** Sử dụng `useMemo` cho các phép tính toán ngân sách phức tạp, `useCallback` cho các sự kiện bấm, và luôn `clearTimeout`/`removeEventListener` khi unmount.
* **Bắt Đa Sự Kiện Cảm Ứng Mobile:** Đối với các phần tử Canvas tương tác (như Banner bàn làm việc), bắt buộc lắng nghe cả `touchstart` (`{ passive: false }`), `pointerdown` lẫn `click` để phản hồi 0ms trên WebKit iOS/Android.

### 3. QUY TRÌNH REVIEW MÃ NGUỒN & BẢO MẬT (CODE REVIEW & SECURITY AUDIT)
* **Hệ Thống Phân Cấp Mức Độ (Severity Labels):**
  - 🔴 `[blocking]`: Lỗi sập app, màn hình vàng/trắng WebView, sai lệch công thức tài chính hoặc rò rỉ STK/PII. Bắt buộc sửa ngay lập tức trước khi merge/proceed.
  - 🟡 `[important]`: Lệch thiết kế so với prototype, heo lơ lửng, thiếu haptic feedback, hoặc thiếu xử lý edge cases.
  - 🟢 `[nit]`: Tinh chỉnh khoảng cách, căn chỉnh lề nhẹ.
* **Zero-PII & Zero-STK Shield (OWASP #1):** Tuyệt đối không lưu số tài khoản người nhận, số dư thực tế thô, hay API keys vào client storage/logs. Mọi dữ liệu telemetry đều phải đi qua `sanitize()`.
* **Root-Cause Debugging:** Khi gặp lỗi giao diện hay logic, luôn phân tích tận gốc tọa độ và cơ chế render (như kiểm tra mặt bàn $y=54$ so với tâm heo đất $cy=48$), không vá ngọn tạm bợ.

---

## 🗺️ MA TRẬN TRA CỨU TÀI LIỆU THEO TÍNH NĂNG (FEATURE-TO-DOC MATRIX)

Khi thực thi công việc ở bất kỳ danh mục hay tính năng nào, Agent **BẮT BUỘC** phải đọc các tài liệu tương ứng dưới đây trước khi lập kế hoạch và viết mã:

| Nhóm Tính Năng / Màn Hình | Tài Liệu Bắt Buộc Phải Đọc Trong `/docs` | Trọng Tâm Nghiệp Vụ Cần Nắm |
| :--- | :--- | :--- |
| **Toàn Bộ Dự Án (Core Vision)** | - [docs/PRD_PIGFLY_MASTER.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/PRD_PIGFLY_MASTER.md)<br>- [docs/ROADMAP.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/ROADMAP.md)<br>- [docs/PAGES_FEATURES.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/PAGES_FEATURES.md) | Mục tiêu sản phẩm PigFly, slogan "Tiết kiệm – Duy trì – Sinh lời bền vững", 5 trụ cột điều hướng, lộ trình chiến lược v4.1. |
| **Giao Diện, Màu Sắc, Linh Vật & Style "Heo Con"** | - [docs/DESIGN.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/DESIGN.md)<br>- [docs/STYLE_HEOCON.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/STYLE_HEOCON.md)<br>- [docs/screens/heocon/00-INDEX.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/screens/heocon/00-INDEX.md)<br>- [prototype/Ví Heo Con.html](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/prototype/Ví%20Heo%20Con.html)<br>- [docs/PIGFLY_PROMPT_STUDIO.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/PIGFLY_PROMPT_STUDIO.md)<br>- [docs/screens/_TEMPLATE.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/screens/_TEMPLATE.md) | **Hệ 3 Theme: "Heo Con" (`heocon` — MẶC ĐỊNH, neo-brutalist pixel: kem `#F6EEDC` + nâu mực + hồng heo + vàng cám)**, "Hồng Heo" (`pink`) và "Xanh Mint" (`mint`) chuẩn WCAG 2.1 AAA/AA. Style Heo Con: viền 3px, bóng cứng 0-blur, font Baloo 2 + Nunito, pixel garden port 1:1 từ prototype, 100% Vector icons nổi trần `lucide-react-native`. |
| **Game Hóa PigFly & Squad** | - [docs/features/PIGFLY_GAMIFICATION_SPEC.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/features/PIGFLY_GAMIFICATION_SPEC.md) | **Zero FEP Virtual Points (Quyết định 112 & 115)**, Động lực Chuỗi Streak (ngày), 5 Tầng Mây Tài Chính, Game PigFly 3D FPS Flight Simulator, Squad Nuôi Heo 2.0 & SOS Overspending Alarm. |
| **Kiến Trúc, CSDL & State Store** | - [docs/TECH_ARCHITECTURE.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/TECH_ARCHITECTURE.md)<br>- [docs/DECISIONS.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/DECISIONS.md)<br>- [docs/DATABASE_API_CONTRACT.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/DATABASE_API_CONTRACT.md) | Cấu trúc Expo + Supabase + Zustand, RLS policies, phân lập Pure Functions, AI NLP/OCR Pipeline và Unit Tests. |
| **Quyền Riêng Tư & Bảo Mật** | - [docs/PRIVACY.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/PRIVACY.md)<br>- [docs/PRIVACY_POLICY_DRAFT.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/PRIVACY_POLICY_DRAFT.md) | **Không lưu số tài khoản người nhận**, làm sạch EXIF ảnh, chế độ làm mờ "Ẩn tiền", telemetry không chứa PII. |
| **Tab 0: Sổ Nhật Ký (Home)** | - [docs/screens/HOME.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/screens/HOME.md)<br>- [docs/screens/heocon/03-HOME-HEADER.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/screens/heocon/03-HOME-HEADER.md)<br>- [docs/screens/heocon/04-HOME-GARDEN.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/screens/heocon/04-HOME-GARDEN.md)<br>- [docs/screens/heocon/05-HOME-SPEND-CARD.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/screens/heocon/05-HOME-SPEND-CARD.md)<br>- [docs/screens/heocon/06-HOME-QUICKLOG-JARS.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/screens/heocon/06-HOME-QUICKLOG-JARS.md)<br>- [docs/screens/heocon/07-HOME-CALENDAR.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/screens/heocon/07-HOME-CALENDAR.md) | Lịch ảnh 7 cột, Rollover 100% ngân sách ngày, chuỗi Streak, **Pixel Garden port 1:1 từ prototype** (heo 24×20, vườn 176×132, máy trạng thái), thẻ "Chi hôm nay" đè −22px với 10 ô hạn mức. |
| **Tab 1: Thống Kê (Stats)** | - [docs/screens/STATS.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/screens/STATS.md)<br>- [docs/screens/heocon/08-STATS.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/screens/heocon/08-STATS.md) | Cuộn Album ảnh tháng 3:4, Hộp Cảm Xúc PigFly, Báo cáo Tạp chí Anime Magazine 3 Chế Độ Xem (Album / Phân Tích / Tạp Chí) & 3 KPI Mới (Runway Score, Impulse Ratio, Savings Velocity). Re-skin Heo Con: viền 3px ink, nhãn giá pill nền mực. |
| **Tab 2: Camera Quick Hub** | - [docs/screens/CAMERA.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/screens/CAMERA.md)<br>- [docs/screens/heocon/09-CAMERA.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/screens/heocon/09-CAMERA.md) | **Khung ngắm vuông 1:1 chuẩn Locket (348×348px)**, nút Chi/Thu áp sát trần, Flash nổi trần trong khung, **Seamless Freeze-Frame 0ms tức thì** (0 xử lý lật file, chuẩn camera native), **Đồng bộ nền theo `tokens.bg`** (hồng pastel `#FFF5F7` trong Theme Hồng Heo), **Chữ mô tả IG Story trong suốt kéo thả tự do (`PanResponder` 2 pha, Zero Placeholder)** (chữ trắng bóng đổ, không hộp viền, không placeholder, chạm nhẹ gõ/kéo di chuyển, không ghi mô tả = ảnh trơn sạch 100%), số tiền nền trơn, tag 1 hàng trượt ngang chữ to, nhập tiền/tag trước hoặc sau khi chụp, Cute Toast tự tắt 1.8s, **Lịch sử 100vh 1 ảnh 1 khung hình** (mô tả sát vị trí đã kéo hoặc ẩn khi rỗng, tên danh mục tiếng Việt có dấu chuẩn bên ngoài). |
| **Tab 3: Giải Trí (Chat, Game & Hộ Chiếu Quán Quen)** | - [docs/screens/CHAT.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/screens/CHAT.md)<br>- [docs/screens/heocon/10-CHAT.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/screens/heocon/10-CHAT.md)<br>- [docs/screens/heocon/10-GAMES-SPEC.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/screens/heocon/10-GAMES-SPEC.md) | **Tab Giải trí & Hộ Chiếu Quán Quen (Quyết định 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 183 & 184)**: Icon Gamepad2, trung tâm PIGFLY HUB 3 thẻ Compact Neo-Card siêu gọn không cuộn trang (Trò chuyện AI & Squad, Game Vui Heo Con Arcade, **Hộ Chiếu Quán Quen Place Passport 100% Native** mô phỏng chân thực: số hộ chiếu `№ PK-8824-VN`, quốc huy Heo Hoàng Gia `👑 🐷`, con dấu thị thực các quận đã đặt chân rotated `-2deg`/`2deg`, bộ 8 icon pixel art 5×5 chi tiết port 1:1, tự động định vị địa chỉ - quận khi chụp ảnh, tối giản chữ, focus icon và chỉ đường 1-chạm). |
| **Tab 4: Hồ Sơ & Cài Đặt (Profile)** | - [docs/screens/PROFILE.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/screens/PROFILE.md)<br>- [docs/screens/heocon/11-PROFILE-SETTINGS.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/screens/heocon/11-PROFILE-SETTINGS.md) | Hạn mức ngày `Hôm nay tiêu được` (0 hardcode), Mục tiêu Thác nước, Cài đặt bảo mật Zero-STK minh bạch. Re-skin Heo Con + **Theme 3-way switch (`heocon`/`pink`/`mint`)**. |
| **Quét Mã VietQR (Luồng 1)** | - [docs/features/QR_PAY.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/features/QR_PAY.md)<br>- [docs/qr/BANK_DEEPLINK_MATRIX.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/qr/BANK_DEEPLINK_MATRIX.md)<br>- [docs/qr/EMV_PARSER_SPEC.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/qr/EMV_PARSER_SPEC.md) | Nhận diện mã VietQR offline, phân luồng Autofill (MB, ICB, BIDV, ACB, OCB), deeplink v2, hỏi "Đã chuyển xong chưa?". |
| **Login & Onboarding** | - [docs/screens/heocon/12-LOGIN-ONBOARDING.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/screens/heocon/12-LOGIN-ONBOARDING.md) | Luồng 1-chạm Local-First ≤ 0.5s (biệt danh + năm sinh, 0 pre-filled), badge pill "● PIGFLY", nền pastel đơn sắc, Nút Nguồn bừng Vàng Cám. |
| **AI Receipt OCR & Voice (Luồng 2)** | - [docs/features/RECEIPT_UPLOAD.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/features/RECEIPT_UPLOAD.md)<br>- [docs/features/CONFIRMATION_INBOX_SPEC.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/features/CONFIRMATION_INBOX_SPEC.md) | AI OCR tự động trích xuất hóa đơn sau khi chụp $\le 1$s, xuất Top 3 Carousel Fallback Selector trên bàn phím `MandCashierKeyboard`, nhập giọng nói $\le 2$s qua `voiceExpenseParser`. |

---

## 🔄 WORKFLOW 5 BƯỚC CHUẨN CỦA AGENT

```
┌────────────────────────────────────────────────────────────────────────┐
│ BƯỚC 1: TRA CỨU VÀ ĐỌC TÀI LIỆU THEO TÍNH NĂNG (Context Loading)       │
│ Tra cứu Ma trận Feature-to-Doc và nạp đầy đủ tài liệu liên quan trong   │
│ thư mục /docs/ trước khi suy nghĩ giải pháp.                            │
│ ► Có pixel art? BẮT BUỘC đọc thêm code đồ họa gốc trong                 │
│   prototype/Ví Heo Con.html + docs/screens/heocon/01-PIXEL-GFX-PORT.md  │
│   (port 1:1 — cấm tự chế hình dáng/tọa độ/bảng màu).                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ BƯỚC 2: LẬP KẾ HOẠCH THỰC THI (Pre-Phase Implementation Plan)          │
│ Trình bày kế hoạch rõ ràng: Danh sách tài liệu đã đọc, các file sẽ    │
│ chỉnh sửa, tiêu chí nghiệm thu và xin duyệt từ người dùng.             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ BƯỚC 3: THỰC THI & VIBECODING (Execution & Reverse Sync)               │
│ Viết mã tuân thủ nghiêm ngặt Design System & Tech Architecture.        │
│ Cập nhật ngược lại tài liệu trong /docs nếu có thay đổi kỹ thuật.      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ BƯỚC 4: KIỂM THỬ XÁC THỰC TOÀN DIỆN (Verification & Regression)        │
│ Chạy `npx tsc --noEmit` (0 lỗi) và `node run-all-tests.js` (100% pass). │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ BƯỚC 5: TỔNG KẾT & WALKTHROUGH (Post-Phase Walkthrough Report)         │
│ Báo cáo minh bạch: Thiết bị kiểm thử, số đo thực tế, kiểm tra CSDL     │
│ và kế hoạch cho Phase tiếp theo.                                       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 QUY CHUẨN THIẾT KẾ & THẨM MỸ (AESTHETIC RULES)

1. **Hệ Thống 3 Theme (Heo Con — Mặc Định, Hồng Heo, Xanh Mint) & WCAG 2.1:**
   - CẤM dùng màu mặc định cẩu thả (`#FF0000`, `#00FF00`, `#0000FF`).
   - Mọi component bắt buộc dùng token màu từ `src/theme/tokens.ts`:
     - **Theme Heo Con (`heocon` - MẶC ĐỊNH, neo-brutalist pixel):** Kem Sàn `#F6EEDC` + Nâu Mực `#2B2118` + Hồng Heo `#F9B8C4` + Vàng Cám `#F4B93B`. Viền 3px ink, bóng cứng 0-blur, hình ngôn ngữ neo-brutalist — chi tiết đầy đủ trong `docs/STYLE_HEOCON.md`. `textOnPrimary` = Nâu Mực (KHÔNG phải trắng).
     - **Theme Hồng Heo (`pink`):** Tông hồng pastel ngọt ngào ấm cúng, tương phản WCAG AAA/AA cao.
     - **Theme Xanh Mint (`mint`):** Tông xanh ngọc bạc hà tươi mát, gradient dịu nhẹ thư thái.
     - Trạng thái An toàn / Thu nhập: Xanh Lá `#5E9A57` (heocon) / Cốm Non Làng Vòng `#7E9F80` (pink/mint).
     - Trạng thái Chi / Cảnh báo: Đỏ Cam `#E0452B` (heocon) / Ngói Rêu Phố Cổ `#C86D51` (pink/mint).
2. **Kiểu chữ có hồn & Con số chuẩn xác (Typography):**
   - Theme Heo Con: tiêu đề & số tiền = **Baloo 2 (800)** tròn trịa playful; body = **Nunito (600–800)** — qua `expo-font` + `@expo-google-fonts/*` (cần `npm i expo-font @expo-google-fonts/baloo-2 @expo-google-fonts/nunito`).
   - Theme Pink/Mint: giữ **Be Vietnam Pro** mang chất thơ Hà Nội.
   - Con số tài chính: Bắt buộc dùng `fontVariant: ['tabular-nums']` để số không bị giật khi đếm.
3. **Quy tắc Pixel Art (Style Heo Con) & Chuẩn Vector Icons Nổi Trần:**
   - **Pixel art (vườn, sprite heo):** PORT 1:1 từ `prototype/Ví Heo Con.html` theo `docs/screens/heocon/01-PIXEL-GFX-PORT.md` — giữ nguyên hex, tọa độ logic, seed `mulberry32`; scale 4× nearest-neighbor (cấm làm mờ); ≤ 32 màu; sinh PNG bằng Node (`zlib`, 0 native dep mới).
   - **100% Vector Icons** từ thư viện `lucide-react-native`. Tuyệt đối không dùng emoji làm icon chính trên nút bấm điều hướng.
   - **Icon nổi trần (Zero Border & Boxless):** Mọi icon trong Tabs, Header, Cards, Modals, Detail Sheets hiển thị vector nổi trần (`borderWidth: 0, backgroundColor: 'transparent'`). **Ngoại lệ chủ ý Style Heo Con:** icon trong `NeoJar`/badge đặt trên khối pastel đặc có viền — quy định tại đặc tả từng component (`docs/screens/heocon/02-NEO-KIT.md`).
   - **Tô đậm nét (Bold Stroke):** Luôn dùng `strokeWidth: 2.4 - 2.8` với kích thước 18-22px để icon nổi bật, sắc nét và có độ tương phản cao.
   - Kích thước vùng chạm (Touch area) tối thiểu $\ge 44 \times 44$px thông qua `hitSlop`.
4. **Tương tác Xúc giác & Chuyển động (Haptics & Spring Animations):**
   - Mọi thao tác quan trọng (Bấm Shutter, Nhập chip giá, Chọn Cứu Ví, Lưu Sổ, Nói Voice) đều phải có Haptic Feedback tương ứng (`expo-haptics`).
   - Dùng `react-native-reanimated` hoặc React Native Spring physics cho Bottom Sheet, Card và Chú Heo PigFly Lottie.

---

## 💻 QUY CHUẨN LẬP TRÌNH & BẢO MẬT (ENGINEERING STANDARDS)

1. **TypeScript Nghiêm Ngặt:**
   - Bật `strict: true`. Tuyệt đối không dùng `any` tùy tiện; luôn định nghĩa interface/type rõ ràng trong `src/types/`.
2. **Cấu trúc State (Zustand) & Phân Lập Khoản Chờ:**
   - Chia tách store mạch lạc: `authStore`, `budgetStore`, `transactionStore`, `waitBasketStore`, `gamificationStore`, `squadStore`.
   - Các khoản `PENDING` tuyệt đối không được tính vào tổng chi tiêu hay số dư cho đến khi người dùng xác nhận `CONFIRMED`.
3. **Bảo Mật Quyền Riêng Tư (Không lưu STK):**
   - **Tuyệt đối không lưu số tài khoản người nhận** vào CSDL, SQLite, AsyncStorage hay logs.
   - Luôn làm sạch siêu dữ liệu EXIF trước khi lưu ảnh vào bộ nhớ máy.
   - Dữ liệu sự kiện phân tích (Telemetry) phải được làm sạch qua hàm `sanitize` (không chứa PII, số tiền, tên nơi nhận).
4. **Ưu Tiên Tuyệt Đối Offline-First & Bảo Toàn Ảnh Bền Vững (Quyết định 114):**
   - **Triết lý ngoại tuyến:** Mọi tính năng cốt lõi (Chụp ảnh, Ghi sổ, Quét hóa đơn OCR, Voice NLP, Cờ Tỷ Phú, Stats Báo cáo) BẮT BUỘC hoạt động trơn tru 100% ngoại tuyến khi ra đường không có mạng 4G/Wifi.
   - **Lưu trữ ảnh vĩnh viễn:** Toàn bộ ảnh chụp và biên lai bắt buộc nén WebP dual-res (~50KB) và lưu vào `FileSystem.documentDirectory + 'pigfly_photos/'`, tuyệt đối không để ở `cacheDirectory` để tránh bị hệ điều hành xóa khi đầy bộ nhớ.
   - **Tầng Cloud sẵn sàng (Cloud-Ready):** Tầng Cloud (Supabase PostgreSQL + Storage + RLS) chỉ được tích hợp như một lớp Adapter mở rộng sau khi tầng Offline-First đã chạy ổn định 100%.

---

## 📝 MẪU BÁO CÁO WALKTHROUGH (TEMPLATE)

Mỗi khi hoàn thành một Phase/Task, Agent bắt buộc xuất báo cáo theo định dạng sau:

```markdown
### 🍂 WALKTHROUGH BÁO CÁO: PHASE [X] — [TÊN PHASE]

#### 1. Tài Liệu Đã Tham Chiếu & Cập Nhật
- [x] Đã đọc: `docs/...`
- [x] Đã cập nhật đồng bộ: `docs/...`

#### 2. Các Tasks Đã Hoàn Thành
- [x] Task X.1: ...
- [x] Task X.2: ...

#### 3. Minh Chứng Hoạt Động & Kết QuẢ Kiểm Thử Thực Tế
- **Môi trường & Thiết bị:** [Tên thiết bị, OS, người kiểm thử, thời gian]
- **Số đo thực tế:** [Tốc độ mở thẻ, thời gian lưu trung vị, độ tương phản]
- **Kiểm thử hồi quy:** [`tsc --noEmit` 0 lỗi, `node run-all-tests.js` 100% pass]
- **Kiểm tra bảo mật:** [Bằng chứng CSDL & Logs không lưu số tài khoản người nhận]

#### 4. Kế Hoạch Cho Phase Kế Tiếp
- Sẵn sàng chuyển sang Phase [X+1].
```
