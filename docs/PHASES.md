# KẾ HOẠCH PHÂN KỲ CHI TIẾT (PHASES & TASKS BREAKDOWN) — VÍ LOCKET M0

> **QUY TẮC BẮT BUỘC DÀNH CHO AI AGENT:**
> 1. **Trước khi bắt đầu bất kỳ Phase nào:** Phải đọc kỹ tài liệu [PRD_M0_VI_LOCKET.md](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/docs/PRD_M0_VI_LOCKET.md), [DESIGN.md](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/docs/DESIGN.md), [TECH_ARCHITECTURE.md](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/docs/TECH_ARCHITECTURE.md) và lập **Kế hoạch hành động (Implementation Plan)** chi tiết.
> 2. **Sau khi kết thúc mỗi Phase:** Phải thực hiện kiểm thử xác thực và viết **Tài liệu Walkthrough (Báo cáo kết quả & demo bằng chứng)** trước khi chuyển sang Phase tiếp theo.

---

## 📌 BẢN ĐỒ TỔNG THỂ CÁC PHASE (M0 ROADMAP)

```
[ Phase 0: Nền tảng, Design System & Supabase ]
                      │
                      ▼
[ Phase 1: Đăng nhập & Wizard Thiết lập Ngân sách ]
                      │
                      ▼
[ Phase 2: Camera Mùa Đông & Chụp Ảnh 1 Chạm Siêu Tốc ]
                      │
                      ▼
[ Phase 3: Thẻ Phán Quyết & Anti-FOMO Engine ]
                      │
                      ▼
[ Phase 4: Giỏ Chờ Cản Gắt (Nhắc dồn dập 1-2h) ]
                      │
                      ▼
[ Phase 5: Sổ Chi Tiêu, Rollover 100% & Tiền Đã Cứu ]
```

---

## 🍂 PHASE 0: NỀN TẢNG, DESIGN SYSTEM & SUPABASE SETUP

* **Mục tiêu:** Dựng khung ứng dụng Expo chuẩn, tích hợp trọn vẹn bộ Theme Hà Nội Thu Đông, cài đặt các thư viện Native (Camera, Audio, Haptics, Notifications) và cấu hình Supabase Backend.

### Danh sách Tasks chi tiết
- [ ] **Task 0.1 — Khởi tạo dự án Expo:**
  - Setup Expo SDK 52+ với TypeScript.
  - Cài đặt các package cốt lõi: `expo-camera`, `expo-audio`, `expo-haptics`, `expo-notifications`, `expo-router`, `lucide-react-native`, `react-native-reanimated`, `zustand`, `@supabase/supabase-js`.
- [ ] **Task 0.2 — Xây dựng Design System (Theme Tokens):**
  - Khởi tạo `src/constants/colors.ts` với đầy đủ mã màu: Nắng Thu Gold (`#E59844`), Cốm Mint (`#7E9F80`), Sữa Ngà (`#FAF6F0`), Khói Trầm (`#1A1D1A`), Ngói Phố Cổ (`#C86D51`).
  - Nhúng font chữ **Be Vietnam Pro** (Regular, Medium, SemiBold, Bold).
  - Tạo các thành phần dùng chung: `FrostedPill.tsx`, `AutumnButton.tsx`, `HanoiCard.tsx`.
- [ ] **Task 0.3 — Cấu hình Supabase & Database Migrations:**
  - Khởi tạo `supabase/migrations/001_initial_schema.sql` gồm 5 bảng: `profiles`, `financial_settings`, `transactions`, `wait_basket`, `daily_budget_logs`.
  - Cấu hình Row-Level Security (RLS) cho từng bảng.
  - Tạo Storage Bucket `item-photos` với quyền truy cập bảo mật.
  - Thiết lập client singleton `src/services/supabase.ts`.

### Tiêu chí nghiệm thu (DoD Phase 0)
* Dự án chạy mượt mà trên Expo Go / Simulator mà không có cảnh báo đỏ (0 lint errors).
* Supabase kết nối thành công, các bảng đã được migrate.
* Màn hình Demo Theme hiển thị đúng bảng màu và font chữ Hà Nội Thu Đông.

---

## 🍂 PHASE 1: AUTHENTICATION & WIZARD THIẾT LẬP NGÂN SÁCH

* **Mục tiêu:** Tạo trải nghiệm mở đầu ấm áp, cho phép người dùng đăng nhập tài khoản và cấu hình toàn bộ dòng tiền ban đầu (Thu nhập, Chi cố định, Mục tiêu) để sinh ra Ngân sách ngày đầu tiên.

### Danh sách Tasks chi tiết
- [ ] **Task 1.1 — Giao diện Đăng nhập Tối Giản 2 Lối Vào (`app/(auth)/login.tsx`):**
  - Biểu tượng Monogram K Thụy Điển phát sáng nhẹ, nhận diện Kepi — KEEP WHAT MATTERS.
  - Loại bỏ hoàn toàn ô nhập Email OTP; đúng 2 nút bấm duy nhất: `[G] Tiếp tục với Google` (Cloud sync) và `[⚡] Vào ngay` (mở thẳng Camera, bắt đầu từ số 0đ).
- [ ] **Task 1.2 — Wizard Thiết lập Ngân sách 3 bước (`app/(auth)/budget-setup.tsx`):**
  - *Bước 1:* Khai báo Thu nhập hàng tháng (Lương hoặc tiền trợ cấp gia đình).
  - *Bước 2:* Khai báo Chi tiêu cố định (Tiền trọ, điện nước, internet, học phí).
  - *Bước 3:* Đặt Mục tiêu tiết kiệm (Tên món muốn mua, số tiền cần có, hạn chót ngày).
  - *Chọn Đơn vị Yêu thích:* Trà sữa (30k), Cà phê (30k), hay Bát phở (40k).
- [ ] **Task 1.3 — Thuật toán khởi tạo Ngân Sách Ngày Đầu Tiên:**
  - Tính toán công thức:
    $$\text{Ngân sách ngày} = \frac{\text{Thu nhập} - \text{Chi cố định} - \text{Mục tiêu}}{\text{Số ngày còn lại trong tháng}}$$
  - Lưu cấu hình vào Supabase và đồng bộ vào `budgetStore.ts` (Zustand).

### Tiêu chí nghiệm thu (DoD Phase 1)
* Luồng đăng nhập hoạt động trơn tru, lưu session vào Keychain/AsyncStorage.
* Sau khi hoàn tất 3 bước, người dùng nhìn thấy con số Ngân sách ngày đầu tiên được tính chính xác trước khi bước vào Camera.

---

## 🍂 PHASE 2: CAMERA VIEW FINDER & CHỤP ẢNH 1 CHẠM SIÊU TỐC

* **Mục tiêu:** Xây dựng màn hình cốt lõi Camera máy film, nút Shutter 1 chạm đàn hồi (nhún xúc giác tactile) và tích hợp luồng nhập chip giá thông minh siêu tốc $\le 3$s (hoàn toàn không dùng voice, bảo vệ quyền riêng tư 0 quyền mic).

### Danh sách Tasks chi tiết
- [x] **Task 2.1 — Màn hình Camera Mùa Đông (`app/(main)/index.tsx`):**
  - Khung ngắm tỉ lệ 4:5 bo tròn góc `rounded-3xl` với 4 góc chữ L màu Nắng Thu Gold.
  - Floating Header Pill bằng kính mờ (Frosted Glass): Hiển thị `🟢 Hôm nay còn [xx]k`.
  - Icon nhỏ chiếc lá `+ Thu` cạnh Header để nhập nhanh tiền vào.
- [x] **Task 2.2 — Nút Shutter Đàn Hồi 1 Chạm (`src/components/camera/ShutterButton.tsx`):**
  - Nhấn 1 chạm: Chụp ảnh món đồ, nhún lò xo 0.94x kèm rung Heavy Haptics.
  - Tối ưu phản hồi xúc giác tức thì, mở nhanh hộp nhập giá / chip giá $\le 3$s.
- [x] **Task 2.3 — Trích Xuất Dữ Liệu Chi Tiêu Text & Chip Giá (`src/services/gemini.ts`):**
  - Trích xuất structured JSON tiếng Việt: `amount`, `category`, `description`, `type` (`EXPENSE` hoặc `INCOME`).
  - Hỗ trợ ghi nhanh qua text hoặc chọn chip giá mẫu (30k, 50k, 100k,...) siêu tốc $\le 1$s.
- [x] **Task 2.4 — Thẻ Xác Nhận Mượt Mà (Confirmation Sheet Nâng Cấp):**
  - Khung ảnh Polaroid bo góc lớn `rounded-3xl` hiển thị ảnh vừa chụp.
  - Pill gạt `↗ Chi / ↙ Thu` đè nhẹ chân ảnh giúp đổi nhanh phân loại chỉ với 1 chạm.
  - Ô số tiền to bản `28px` dạng tabular-nums kèm nút `⨂` xóa nhanh và bàn phím số tiện lợi.
  - Chọn nhanh nguồn tiền: `💳 Ngân hàng`, `💵 Tiền mặt`, `📱 Ví điện tử`.
  - Hai nút bấm lớn:
    - `[ĐÃ MUA — LƯU SỔ]` (Lưu ngay vào giao dịch, trừ ngân sách ngày).
    - `[HỎI TRƯỚC — PHÁN QUYẾT]` (Màu Nắng Thu Gold, mở Thẻ Phán Quyết).

### Tiêu chí nghiệm thu (DoD Phase 2)
* Người dùng giơ máy chụp cốc trà sữa, chọn chip giá 45k $\rightarrow$ Thẻ lưu sổ trong $\le 2.5$ giây với đúng số tiền 45.000đ và danh mục `an_uong`.
* Người dùng nhập ghi nhanh "Mẹ gửi hai triệu" $\rightarrow$ AI tự động nhận diện `type: INCOME`, `amount: 2000000`.

---

## 🍂 PHASE 3: THẺ PHÁN QUYẾT (JUDGMENT CARD) & ANTI-FOMO AI

* **Mục tiêu:** Trái tim của ứng dụng — Hiện tấm bưu thiếp phán quyết cho thấy cái giá thật của món đồ và câu roast hóm hỉnh từ bạn thân Hà Nội để cản người dùng mua bốc đồng.

### Danh sách Tasks chi tiết
- [ ] **Task 3.1 — Giao diện Thẻ Bưu Thiếp Phán Quyết (`JudgmentCard.tsx`):**
  - Phong cách giấy dó viền tem thư cổ điển, màu sắc trang nhã.
  - Hiển thị ảnh chụp món đồ và giá tiền.
- [ ] **Task 3.2 — Động cơ Quy đổi Thực tế (Reality Calculator):**
  - Quy đổi tự động ra:
    - Số ngày ngân sách (ví dụ: `= 3.2 ngày ngân sách`).
    - Số ly trà sữa / bát phở theo đơn vị yêu thích.
    - Số giờ làm thêm phải cày cuốc.
    - Số ngày mục tiêu bị chậm lại.
- [ ] **Task 3.3 — Edge Function `/ai-judgment` (Gemini Roast):**
  - Sinh 1–2 câu phản biện thông minh, hài hước, mang giọng điệu người bạn chân thành (không giáo điều, không sỉ nhục).
- [ ] **Task 3.4 — 3 Nút Hành Động Quyết Định:**
  - `[MUA LUÔN]`: Ghi sổ, đánh dấu mua có chủ đích.
  - `[GIỎ CHỜ CẢN GẮT]`: Chuyển sang Giỏ chờ đếm ngược.
  - `[THÔI, CỨU VÍ]`: Cộng tiền vào **"Tiền Đã Cứu"** + Rung Haptic chiến thắng + Hiệu ứng hoa cúc rơi.

### Tiêu chí nghiệm thu (DoD Phase 3)
* Thẻ hiện lên với hiệu ứng đếm số tăng dần (count-up) cho các chỉ số quy đổi.
* Bấm "Thôi, Cứu ví" làm tăng con số Hero ngay lập tức với cảm giác sung sướng, tích cực.

---

## 🍂 PHASE 4: GIỎ CHỜ CẢN GẮT & CẢNH BÁO DỒN DẬP (1–2H)

* **Mục tiêu:** Xây dựng hệ thống nhắc nhở dồn dập mỗi 1–2 tiếng bằng Local Push Notifications để dập tắt cơn thèm mua sắm trong ngày.

### Danh sách Tasks chi tiết
- [ ] **Task 4.1 — Màn hình Quản lý Giỏ Chờ (`app/(main)/wait-basket.tsx`):**
  - Danh sách các món đang đếm ngược với ảnh chụp, giá tiền và thanh thời gian trôi.
  - Hiển thị tổng số tiền đang trong vòng phân vân ("Bạn đang cân nhắc 850.000đ").
- [ ] **Task 4.2 — Lập lịch Thông Báo Cục Bộ (`src/services/notifications.ts`):**
  - Cấu hình 4 mốc trigger (1h, 3h, 6h, 24h) với nội dung dí dỏm, nhắc người dùng uống nước, ngắm phố và tỉnh táo.
  - Tương thích cả iOS và Android khi tắt ứng dụng hoặc mất mạng.
- [ ] **Task 4.3 — Xử lý Hành Động Trực Tiếp từ Notification:**
  - Cho phép người dùng bấm nút `[Thôi, cứu ví]` ngay trên Push Notification để giải cứu ví tiền mà không cần mở app.

### Tiêu chí nghiệm thu (DoD Phase 4)
* Khi đưa 1 món vào Giỏ chờ, hệ thống tạo lịch 4 thông báo chuẩn xác.
* Test thử nghiệm trigger 5 giây hoạt động hoàn hảo trên thiết bị thật.

---

## 🍂 PHASE 5: SỔ CHI TIÊU LOCKET, NGÂN SÁCH ROLLOVER & TIỀN ĐÃ CỨU

* **Mục tiêu:** Hoàn thiện vòng tuần hoàn tài chính: Bộ Lịch Ảnh Tháng (Calendar View) có badge `+X`, Lưới Ảnh 3 Cột (Gallery Grid) có tag giá nổi, Thẻ Ngân Sách Giấy Dó 4 chỉ số và Hero Tiền Đã Cứu.

### Danh sách Tasks chi tiết
- [x] **Task 5.1 — Bộ Lịch Ảnh Tháng Locket (`CalendarView` trong `journal.tsx`):**
  - Lưới 7 cột (T2 $\rightarrow$ CN) hiển thị từng ngày trong tháng.
  - Ô vuông bo cong chứa ảnh món đồ chụp đầu tiên trong ngày.
  - Badge đếm số lượng `+1`, `+2`, `+3` ở góc ảnh khi ngày đó có nhiều giao dịch.
  - Dấu chấm màu cốm mint dưới ngày hiện tại.
  - Chạm vào ngày để mở danh sách chi tiết các khoản đã tiêu/đã cứu trong ngày.
- [x] **Task 5.2 — Lưới Ảnh Chi Tiêu 3 Cột (`GalleryGridView`):**
  - Hiển thị toàn bộ ảnh món ăn, cốc nước, bill và screenshot ngân hàng dạng 3 cột đều đặn.
  - Tag giá nổi ở góc dưới bức ảnh: `56.000đ` hoặc `+2.000.000đ` (xanh cốm).
- [x] **Task 5.3 — Thẻ Ngân Sách Giấy Dó (Autumn Budget Card):**
  - Thanh tiến độ mùa thu 3 màu (Cốm Làng Vòng $\rightarrow$ Cúc Họa Mi $\rightarrow$ Ngói Rêu).
  - 4 chỉ số: [Hôm nay còn], [Số dư thực], [Mỗi ngày chuẩn], [Tiền đã cứu].
  - Dòng thông tin Rollover: *"Hôm nay được cộng dồn +60.000đ từ hôm qua 🍃"*.
- [x] **Task 5.4 — Thuật toán Rollover 100% & Hero Metric "Tiền Đã Cứu":**
  - Dư hôm nay dồn sang hôm sau tiêu xả láng; lố hôm nay trừ bù nhưng giữ sàn an toàn 20k/ngày.
  - Drawer trên Camera vuốt xuống xem nhanh Số dư & Tiền đã cứu.

### Tiêu chí nghiệm thu (DoD Phase 5)
* Chi tiêu hôm nay thay đổi $\rightarrow$ Ngân sách ngày mai tính lại chính xác theo đúng quy tắc Rollover 100%.
* Lịch ảnh tháng và Lưới ảnh render mượt mà, đầy đủ tag giá và badge số lượng.

---

# 🚀 KẾ HOẠCH NÂNG CẤP CHUẨN PRODUCTION (PHASES P1 — P4)

> Toàn bộ các Phase dưới đây tuân thủ nghiêm ngặt quy trình 2 đầu của `AGENTS.md`:
> 1. Lập **Implementation Plan** chi tiết trước khi code.
> 2. Lập **Walkthrough Report** kèm minh chứng kiểm thử sau khi hoàn tất.

```
[ Phase P1: UI & Minimalist Monochrome Line Iconography ]
                            │
                            ▼
[ Phase P2: Scalable Storage Pipeline & Image Optimization ]
                            │
                            ▼
[ Phase P3: Production Data Sync & Offline-First Queue ]
                            │
                            ▼
[ Phase P4: Security, Error Hardening & Final Polish ]
```

---

## 🎨 PHASE P1: TỐI GIẢN HÓA UI & HỆ THỐNG ICON ĐƠN SẮC (MONOCHROME LINE ICONS)

* **Mục tiêu:** Loại bỏ hoàn toàn các emoji màu sắc sặc sỡ, thay thế bằng bộ Icon nét mảnh (stroke 1.2px - 1.5px) đơn sắc tối giản của Lucide, tạo nên phong cách thiết kế sang trọng, tinh tế như tạp chí nghệ thuật Hà Nội.

### Danh sách Tasks chi tiết
- [x] **Task P1.1 — Thay thế Icon trong Thẻ Xác Nhận (`ConfirmationSheet.tsx`):**
  - Chuyển pill Chi / Thu sang icon `ArrowUpRight` (Chi) và `ArrowDownLeft` (Thu).
  - Thay thế icon Nguồn Tiền: `CreditCard` (Ngân hàng), `Banknote` (Tiền mặt), `Smartphone` (Ví điện tử). Nền xám trong mờ, viền mảnh.
  - Thay icon nút Lưu sổ: `Check` và icon Phán Quyết: `Sparkles` / `Flame`.
- [x] **Task P1.2 — Thay thế Icon trong Thẻ Phán Quyết (`JudgmentCard.tsx`):**
  - Thay thế các biểu tượng cảm xúc rườm rà bằng line icons: `Scale` (Đo lường), `Clock` (Giờ làm thêm), `Coffee` / `UtensilsCrossed` (Quy đổi), `ShieldAlert` (Cảnh báo).
  - Tối ưu nét stroke 1.2px - 1.4px màu vàng Nắng Thu hoặc khói than.
- [x] **Task P1.3 — Tối Giản Hóa Thẻ Ngân Sách (`AutumnBudgetCard.tsx`):**
  - Thay emoji lá `🍃`/`🍂` bằng line icon `Leaf` thanh mảnh kèm màu sắc ngữ cảnh.
  - Thay thế icon "Tiền Đã Cứu" bằng `ShieldCheck` đơn sắc sắc nét.
- [x] **Task P1.4 — Chuẩn Hóa Toàn Diện Màn Hình Chính & Header (`index.tsx`, `journal.tsx`, `wait-basket.tsx`):**
  - Chuẩn hóa icon xoay Camera `RotateCcw`, Flash `Zap` / `ZapOff`.
  - Khay Lịch sử "History ⌵": `ChevronDown`, `Clock`, `Sparkles`.
  - Giỏ chờ: `Hourglass`, `Trash2`, `PiggyBank`.
- [x] **Task P1.5 — Kiểm thử Hiển thị & TypeScript:**
  - Chạy `npx tsc --noEmit` đảm bảo 100% 0 error, không lỗi type SVG hay icon.

### Tiêu chí nghiệm thu (DoD Phase P1)
* Không còn bất kỳ emoji màu sắc nào trong các nút bấm, thanh điều hướng, thẻ xác nhận và danh mục.
* 100% icon sử dụng Lucide nét mảnh 1.2px - 1.5px, màu sắc tuân thủ palette `#1A1D1A`, `#FAF6F0`, `#E59844`, `#7E9F80`, `#C86D51`.
* Giao diện toát lên vẻ đẹp tối giản, thơ mộng và tĩnh tại.

---

## 📦 PHASE P2: HẠ TẦNG NÉN ẢNH ĐA TẦNG & SCALE HỆ THỐNG LƯU TRỮ

* **Mục tiêu:** Xây dựng quy trình xử lý ảnh phía Client bằng `expo-image-manipulator` để tạo ảnh WebP 1080px (~120KB) và thumbnail 240px (~15KB), lưu trữ đám mây vĩnh viễn trên Supabase Storage và dọn dẹp cache cục bộ sau 30 ngày.

### Danh sách Tasks chi tiết
- [x] **Task P2.1 — Service Tối Ưu Hóa Ảnh (`src/services/imageOptimizer.ts`):**
  - Viết hàm `optimizeExpensePhoto(uri)`: Nén ảnh gốc về kích thước 1080px (WebP, quality 0.82, dung lượng ~120KB).
  - Viết hàm `generateThumbnail(uri)`: Tạo micro-thumbnail 240px (WebP, quality 0.70, dung lượng ~15KB).
- [x] **Task P2.2 — Module Quản Lý Bộ Nhớ Đệm & Storage (`src/services/storage.ts`):**
  - Tích hợp upload ngầm lên Supabase Storage Bucket `item-photos` theo cấu trúc path `{user_id}/{YYYY-MM}/{uuid}.webp`.
  - Quản lý cache cục bộ với thuật toán LRU: dọn dẹp các ảnh local cũ hơn 30 ngày để tiết kiệm bộ nhớ điện thoại.
- [x] **Task P2.3 — Tích Hợp Luồng Chụp & Lưu Trữ:**
  - Khi bấm Shutter, ảnh được nén ngay lập tức trong background thread và trả về thumbnail tức thì cho UI.
  - Lưu cả `photo_url` và `thumbnail_url` vào `transactionStore.ts`.
- [x] **Task P2.4 — Tăng Tốc Lịch Ảnh Tháng Locket & Thư Viện Lưới:**
  - `LocketCalendarView.tsx` và `GalleryGridView.tsx` ưu tiên nạp `thumbnail_url`, giúp cuộn 60fps mượt mà không tốn băng thông.

### Tiêu chí nghiệm thu (DoD Phase P2)
* Ảnh chụp từ Camera được nén về dưới 150KB trước khi lưu.
* Thumbnail chỉ nặng ~15KB, mở Lịch Tháng 30 ô tải ngay lập tức không giật lag.
* Dữ liệu ảnh được sao lưu an toàn trên Supabase Storage.

---

## 🔄 PHASE P3: ĐỒNG BỘ DỮ LIỆU NGOẠI TUYẾN (OFFLINE-FIRST SYNC) & AUTH

* **Mục tiêu:** Đảm bảo người dùng ghi chép chi tiêu mọi lúc mọi nơi ngay cả khi mất sóng điện thoại trong hầm giữ xe hay quán cà phê, tự động đẩy dữ liệu lên mây khi có kết nối trở lại.

### Danh sách Tasks chi tiết
- [x] **Task P3.1 — Hàng Đợi Mutation Ngoại Tuyến (`src/services/offlineSync.ts`):**
  - Lưu trữ danh sách các hành động tạo/sửa/xóa chưa đồng bộ vào `AsyncStorage`.
  - Gắn UUID và timestamp UTC cho mỗi giao dịch.
- [x] **Task P3.2 — Trình Quản Lý Kết Nối & Tự Động Đồng Bộ:**
  - Lắng nghe trạng thái mạng; khi mạng online trở lại, tự động đẩy các bản ghi trong queue lên Supabase Database.
  - Xử lý xung đột theo cơ chế Last-Write-Wins.
- [x] **Task P3.3 — Đồng Bộ Hai Chiều (Bidirectional Sync):**
  - Đồng bộ danh sách Giao dịch, Giỏ Chờ và Cấu hình Ngân sách từ Supabase về Client khi mở app.
- [x] **Task P3.4 — Hoàn Thiện Luồng Đăng Nhập & Khách (Guest / Real Auth):**
  - Cho phép người dùng dùng thử ngay chế độ Local (Guest Mode), sau đó liên kết tài khoản Apple / Google / OTP mà không mất dữ liệu đã ghi chép.

### Tiêu chí nghiệm thu (DoD Phase P3)
* Ngắt mạng hoàn toàn, chụp ảnh và lưu chi tiêu $\rightarrow$ Mở lại mạng, dữ liệu tự động đồng bộ lên Supabase Database mà không gây crash hay trùng lặp.

---

## 🛡️ PHASE P4: BẢO MẬT, XỬ LÝ NGOẠI LỆ & TINH CHỈNH CUỐI CÙNG

* **Mục tiêu:** Hoàn thiện toàn diện sản phẩm cho môi trường Production: kiểm soát lỗi quyền Camera/Microphone, xử lý timeout API, kiểm thử rò rỉ bộ nhớ và bảo mật token.

### Danh sách Tasks chi tiết
- [x] **Task P4.1 — Xử lý Ngoại lệ Phần Cứng & Quyền Truy Cập:**
  - Xử lý trường hợp người dùng từ chối cấp quyền Camera hoặc Mic với thông báo ấm áp, có nút mở nhanh Settings hệ thống.
  - Xử lý câu nói quá ngắn ($< 0.8s$) hoặc môi trường ồn ào không nghe rõ.
- [x] **Task P4.2 — Cơ Chế Dự Phòng (Fallback Safeguards):**
  - Fallback offline cho Gemini AI: nếu Edge Function timeout hoặc mất mạng, Thẻ Xác Nhận vẫn mở lên bình thường để người dùng tự nhập số tiền.
- [x] **Task P4.3 — Kiểm Toán Bộ Nhớ & Tối Ưu Hiệu Năng:**
  - Kiểm tra và hủy các subscription (Audio recording, Reanimated listeners) khi unmount.
  - Tối ưu hóa kích thước bundle và thời gian cold start dưới 1.2 giây.

### Tiêu chí nghiệm thu (DoD Phase P4)
* 0 runtime errors, 0 memory leaks.
* Trải nghiệm sử dụng mượt mà, phản hồi ngay lập tức, đem lại cảm giác bình yên và tin cậy cho người dùng.

---

# 🎮 CHIẾN DỊCH NÂNG CẤP VÍ LOCKET v3.0: COZY 3D GAME & HỆ SINH THÁI TÀI CHÍNH LIÊN KẾT

```
[ Phase G1: Tối Ưu Cử Chỉ Swipe-Up, Tap-Outside & Nút Bấm Chunky 3D ]
                                │
                                ▼
[ Phase G2: Linh Vật Bé Miu 3D & AI Coach Phán Quyết Thông Thái ]
                                │
                                ▼
[ Phase G3: Bài Học Tài Chính Bỏ Túi, Thống Kê Game Hóa & Hồ Sơ ]
```

---

## 🕹️ PHASE G1: TỐI ƯU CỬ CHỈ SWIPE-UP, TAP-OUTSIDE & NÚT BẤM CHUNKY 3D

* **Mục tiêu:** Khắc phục triệt để các vấn đề UX khi test thực tế trên iPhone (vuốt trượt lên để xem History thay vì chỉ bấm nút nhỏ; chạm ra ngoài nền tự đóng thẻ Hồ Sơ) và nâng cấp bộ màu sắc, nút bấm nổi 3D Cozy Game.

### Danh sách Tasks chi tiết
- [x] **Task G1.1 — Nhận Diện Cử Chỉ Vuốt Trượt Lên (`app/(main)/index.tsx`):**
  - Tích hợp `PanResponder` vào vùng khung ngắm Camera để bắt cử chỉ lướt ngón tay lên ($\Delta y < -40\text{px}$).
  - Kích hoạt mở ngay `HistoryPeekSheet` kèm rung haptic nhẹ (`ImpactFeedbackStyle.Light`) mượt mà từ bất kỳ đâu.
- [x] **Task G1.2 — Cơ Chế Chạm Ngoài Nền Tự Đóng (Backdrop Tap-Outside Dismiss):**
  - Nâng cấp Drawer/Modal Hồ Sơ (`ProfileDrawer` / `ProfileModal`): Bọc `TouchableWithoutFeedback` hoặc fullscreen `Pressable` bao quanh khung nội dung để người dùng chạm ra ngoài nền là tự đóng êm ái.
- [x] **Task G1.3 — Bảng Màu Cozy Game & Nút Bấm Chunky 3D (`src/constants/colors.ts`, `layout.ts`):**
  - Bổ sung các token màu game hoạt hình ấm áp: `game-yellow` (`#F5B041`), `cozy-purple` (`#9B59B6`), `border-tactile`.
  - Bổ sung cấu hình shadow và nút bấm 3D nổi tactile cho cảm giác bấm nảy đầm tay.

### Tiêu chí nghiệm thu (DoD Phase G1)
* Vuốt lên từ bất kỳ đâu ở nửa dưới camera mở ngay cuộn History mượt mà.
* Bấm vào Hồ sơ rồi chạm ra ngoài nền mờ $\rightarrow$ khung đóng ngay lập tức.
* Các nút bấm có độ nổi 3D hoạt hình sinh động, hút mắt.

---

## 🧑‍💼 PHASE G2: AI COACH MINH LOCKET ("ANH PT TÀI CHÍNH") & CHAT 2 CHIỀU THỜI GIAN THỰC

* **Mục tiêu:** Xây dựng hình tượng AI Coach Minh Locket ("Anh PT Giữ Ví") với ảnh chân dung Signature 3D Stylized Pixar tuyệt đẹp, tích hợp phòng Chat tương tác 2 chiều thông minh qua Gemini API, giúp người dùng tâm sự, phân biệt tiện ích thực tế vs mua theo trend và nhận giáo án điều chỉnh chi tiêu cụ thể.

### Danh sách Tasks chi tiết
- [x] **Task G2.1 — Bộ Nhận Diện Chân Dung Signature 3D Stylized Pixar (`MinhAvatar.tsx`):**
  - Tạo ảnh chân dung Signature chất lượng cao 3D Stylized Pixar (`assets/coach_minh_signature.png`) sắc nét, ấm áp.
  - Component hiển thị avatar với viền sáng theo trạng thái kỷ luật tài chính (An toàn / Cảnh báo / Vượt ngưỡng).
- [x] **Task G2.2 — Động Cơ Phản Biện & Store `minhCoachStore.ts`:**
  - Xây dựng Bộ Lọc 3 Câu Hỏi Thông Minh của Minh (Tiện ích thực tế, Độ FOMO/Trend, Tác động mục tiêu cá nhân).
  - Tự động tạo lời thoại cá nhân hóa theo mục tiêu đã cài đặt (Laptop, Du lịch, Quỹ khẩn cấp).
  - Quản lý lịch sử chat và thói quen kiềm chế cám dỗ.
- [x] **Task G2.3 — Phòng Đàm Đạo & Chat 2 Chiều Cùng Minh PT (`MinhCoachModal.tsx`):**
  - Thẻ phân tích kỷ luật chi tiêu hôm nay (Tiền đã tiêu, Hạn mức còn lại, Tiền đã cứu, Tiến độ mục tiêu).
  - Khung Chat trực tiếp kết nối với Gemini AI kèm các nút câu hỏi 1-chạm (Quick Prompt Pills).
  - Cơ chế chạm ngoài nền tự đóng (Tap-Outside Dismiss) 100%.

### Tiêu chí nghiệm thu (DoD Phase G2)
* Hình ảnh chân dung Minh Locket 3D Stylized Pixar hiển thị sắc nét, ấm cúng và truyền cảm hứng.
* Người dùng có thể chat và nhận phản hồi chân thành, thẳng thắn như một huấn luyện viên PT thể hình đích thực.
* Minh phân tích rành mạch giữa tiện ích thực tế và mua theo trend, quy đổi chính xác tác động đến mục tiêu cá nhân.

---

## 📚 PHASE G3: BÀI HỌC TÀI CHÍNH BỎ TÚI, THỐNG KÊ GAME HÓA & MỤC TIÊU CÁ NHÂN HÓA

* **Mục tiêu:** Hoàn thiện vòng tuần hoàn tài chính thông minh: AI Coach Minh tự động đề xuất Bài Học Micro dựa theo thói quen chi tiêu; màn hình Thống Kê dạng game trực quan; Hồ Sơ cài đặt mục tiêu cá nhân hóa.

### Danh sách Tasks chi tiết
- [x] **Task G3.1 — Store Bài Học `lessonStore.ts` & `LessonViewerModal`:**
  - Xây dựng danh mục các bài học micro 1 phút dành cho Gen Z (Cắt giảm trà sữa, Quy tắc 24h hoãn mua đồ theo trend, Mẹo săn sale không lố ngân sách).
  - Tích hợp câu hỏi mini vui nhộn củng cố kiến thức và cộng điểm hiểu biết tài chính.
- [x] **Task G3.2 — Màn Hình Thống Kê Game Hóa (`GamifiedStatsModal.tsx`):**
  - Trực quan hóa số tiền còn lại thành Thanh Sinh Lực (HP) ví tiền đổi màu linh hoạt.
  - Biểu đồ phân bổ 5 nhóm chi tiêu và danh sách các khoản chi khủng nhất tháng.
- [x] **Task G3.3 — Nâng Cấp Hồ Sơ & Quản Lý Mục Tiêu Cá Nhân (`ProfileModal.tsx`):**
  - Cho phép người dùng nhập Mục Tiêu Cá Nhân (Tên mục tiêu, Số tiền cần đạt, Hạn mức ngày, Giờ công).
  - Hiển thị Cấp Bậc Tài Chính (Financial Health Tier) và Báo cáo thói quen hàng tuần do Minh đánh giá.
  - Hỗ trợ tap-outside dismiss 100%.

### Tiêu chí nghiệm thu (DoD Phase G3)
* 5 trụ cột liên kết chặt chẽ thành một hệ sinh thái thống nhất: Dữ liệu chi tiêu $\rightarrow$ Thống kê $\rightarrow$ AI Coach Minh 3D $\rightarrow$ Bài học gợi ý $\rightarrow$ Hồ sơ mục tiêu cá nhân.
* Trải nghiệm ứng dụng sống động, đem lại giá trị thực tế giúp người dùng chấm dứt thói quen mua hàng lãng phí.

---

## 🚀 MILESTONE 1: PRODUCTION READY & GOOGLE PLAY STORE (CH PLAY)

### 📌 PHASE M1.1: PRODUCTION DATABASE & XÁC THỰC AUTH HOÀN CHỈNH
* **Mục tiêu:** Thay thế hoàn toàn dữ liệu demo/hardcode bằng CSDL Supabase PostgreSQL Cloud thật, tích hợp Google Sign-In 1-chạm & In-app Email OTP 6-chữ số, hỗ trợ Chế độ Khách (Guest Mode) 100% offline-local tiết kiệm sức chứa cloud.
* **Thời gian hoàn thành:** 2026-10-05

#### Danh sách Tasks hoàn thành:
- [x] **Task M1.1.1 — Khởi tạo & Kết nối Supabase Cloud Production:**
  - Kết nối Supabase Project `yohzbxywumczegtifvfl.supabase.co` (Region Singapore `ap-southeast-1`).
  - Chạy toàn diện 2 Migration: `001_initial_schema.sql` (bảng `profiles`, `financial_settings`, `transactions`, `wait_basket`) và `002_vietqr_status_and_metadata.sql` (bảo mật không lưu STK).
  - Cấu hình file `.env` bảo mật, cập nhật `.gitignore`.
- [x] **Task M1.1.2 — Luồng Xác thực In-app 6-digit Email OTP & Google Sign-In:**
  - Nâng cấp `src/store/authStore.ts` với `verifyEmailOtp`, `signInWithGoogle` (OAuth Web Auth Session), `continueAsGuest`.
  - Thiết kế màn hình `app/(auth)/login.tsx` chuẩn Hà Nội Thu Đông: Nút Google Sign-In, 6 ô số OTP trực quan, đồng hồ đếm ngược gửi lại mã 60s, nút đổi email.
- [x] **Task M1.1.3 — Cơ chế "Guest Sync Guard" (Bảo vệ CSDL):**
  - Chặn 100% network mutation và storage upload khi người dùng ở chế độ Khách (`isGuest = true`). Toàn bộ hoạt động của Guest chạy trên bộ nhớ máy cục bộ, bảo vệ 500MB DB & 1GB Storage khỏi rác vãng lai.
- [x] **Task M1.1.4 — Dọn dẹp Seed Data khi Đăng Nhập Thật:**
  - Tự động xóa sạch 7 khoản seed demo (`tx-seed-*`) khi user đăng ký thật; chuyển quyền sở hữu các khoản chi do khách tự nhập sang `user_id` mới.
  - Tích hợp 10/10 automated tests (`run-all-tests.js`).

---

### 📌 PHASE M1.2: LƯU TRỮ HÌNH ẢNH CLOUD & ĐỒNG BỘ 2 CHIỀU THỜI GIAN THỰC (REALTIME SYNC)
* **Mục tiêu:** Lưu trữ hình ảnh chi tiêu an toàn lên Supabase Storage bucket `receipt-photos`, nén WebP dual-res (Full 1080px / Thumb 240px), xóa 100% EXIF metadata, và đồng bộ dữ liệu giao dịch 2 chiều qua kênh Supabase Realtime WebSocket.
* **Thời gian hoàn thành:** 2026-10-05

#### Danh sách Tasks hoàn thành:
- [x] **Task M1.2.1 — Migration 003 Storage Bucket & Realtime Configuration:**
  - Tạo `supabase/migrations/003_storage_bucket_and_realtime.sql`: Tạo bucket `receipt-photos` (10MB limit, WebP/JPEG/PNG) kèm Storage RLS policies theo `auth.uid()`.
  - Kích hoạt publication `supabase_realtime` cho bảng `public.transactions`.
- [x] **Task M1.2.2 — Nén WebP Chuẩn Locket & Xóa Sạch EXIF Metadata:**
  - Tối ưu `src/services/storage.ts` & `src/services/imageOptimizer.ts`: Nén Full-res (1080px, quality 0.82) và Micro-Thumbnail (240px, quality 0.70).
  - Tái tạo pixel qua `manipulateAsync`, triệt tiêu hoàn toàn GPS tọa độ, thiết bị chụp và phần mềm trong ảnh.
  - Cấu trúc đường dẫn phân cấp: `receipt-photos/{userId}/{YYYY-MM}/{transactionId}.webp` và `..._thumb.webp`.
- [x] **Task M1.2.3 — Kênh Supabase Realtime WebSocket 2 Chiều (`src/services/realtimeSync.ts`):**
  - Xây dựng service `initRealtimeTransactionSync` lắng nghe `INSERT`, `UPDATE`, `DELETE` thời gian thực cho `user_id` đăng nhập thật.
  - Tích hợp vào `transactionStore.ts`, tự động cập nhật state và `AsyncStorage` ngay khi có thay đổi từ thiết bị khác.
  - Hủy đăng ký an toàn (`teardownRealtimeTransactionSync`) khi đăng xuất.
- [x] **Task M1.2.4 — Bảo vệ Quyền Riêng Tư & Kiểm Thử Hồi Quy:**
  - Áp dụng nghiêm ngặt **Guest Sync Guard**: Tài khoản Khách (`guest-*`) và Demo tuyệt đối 0 byte upload Storage và 0 byte Realtime WebSocket.
  - Bổ sung 4 bài test chuyên sâu trong `scripts/test-storage-realtime.js`.
  - Toàn bộ 14/14 tests pass 100% trên `run-all-tests.js` và `tsc --noEmit` đạt 0 lỗi.

---

### 📌 PHASE M1.3: QUẢN LÝ HỒ SƠ, QUY ĐỔI GIỜ LÀM & XUẤT BÁO CÁO CSV/PDF
* **Mục tiêu:** Cung cấp tính năng quy đổi lương giờ công lao động (`hourly_rate`) tự động hoặc thủ công để soi chiếu mọi khoản chi; tích hợp xuất tệp dữ liệu CSV chuẩn UTF-8 BOM và xuất Báo cáo PDF A4 phong cách Kepi mở trực tiếp qua Native Share Sheet.
* **Thời gian hoàn thành:** 2026-10-05

#### Danh sách Tasks hoàn thành:
- [x] **Task M1.3.1 — Quy Đổi Lương Giờ Lao Động (`hourly_rate`):**
  - Công thức tính toán thông minh: $\text{Lương giờ} = \text{Lương tháng} \div (\text{Số ngày làm/tháng} \times \text{Số giờ làm/ngày})$.
  - Hỗ trợ nhập thủ công cho Freelancers / Part-time.
  - Hiển thị trực quan trong thẻ `HourlyWageSettingsCard.tsx` và modal `HourlyWageModal.tsx`.
  - Trực quan hóa giá trị món đồ chi tiêu (ví dụ: Trà sữa 35k = 17 phút làm việc, Bữa tối 150k = 1.2 giờ làm việc).
  - Lưu bền vững trên `AsyncStorage` (`vi_locket_hourly_rate`) và Supabase Profile `hourly_rate`.
- [x] **Task M1.3.2 — Xuất Dữ Liệu Giao Dịch CSV Chuẩn Quốc Tế (`src/services/exportService.ts`):**
  - Mã hóa UTF-8 với ký tự BOM (`\uFEFF`) để mở trực tiếp trên Microsoft Excel và Google Sheets không bị lỗi font tiếng Việt.
  - Các cột dữ liệu chuẩn mực: Mã giao dịch, Thời gian, Loại (Thu/Chi), Hạng mục, Số tiền (VND), Ghi chú, Trạng thái.
  - Xử lý escape dấu phẩy, dấu ngoặc kép, và dòng xuống.
  - **Bảo mật tối đa:** Tuyệt đối không chứa số tài khoản ngân hàng, thông tin thẻ hay người nhận.
- [x] **Task M1.3.3 — Xuất Báo Cáo Tài Chính PDF A4 Đậm Chất Kepi:**
  - Tích hợp `expo-print` & `expo-sharing` tạo tệp PDF A4 sắc nét.
  - Giao diện HTML Template tối giản với Monogram K, bảng chỉ số vàng (Tổng chi tiêu, Thu nhập, Tích lũy), bảng cơ cấu danh mục, và bảng kê giao dịch chi tiết.
  - Mở trực tiếp hệ thống Native Share Sheet (AirDrop, Google Drive, Zalo, In ấn).
- [x] **Task M1.3.4 — Tích Hợp Toàn Diện Vào `ProfileView.tsx` & Kiểm Thử Hồi Quy:**
  - Tích hợp thẻ `HourlyWageSettingsCard`, modal `HourlyWageModal`, và thẻ `ExportReportCard` vào giao diện ProfileView chuẩn Theme "Ấm, tĩnh, sang".
  - Bổ sung 3 bài test xác thực (Tests 15, 16, 17) trong `run-all-tests.js`.
  - Toàn bộ 17/17 tests pass 100% và `npx tsc --noEmit` đạt 0 lỗi sạch sẽ.

---

### 📌 PHASE M1.4: TIỆN ÍCH SỐ DƯ & GHI TIÊU SIÊU TỐC TỪ MÀN HÌNH KHÓA (LOCK SCREEN ZERO-FRICTION UTILITY)
* **Mục tiêu:** Xóa bỏ hoàn toàn rào cản mở app mỗi lần mua đồ nhỏ; ghim thanh thông báo số dư ngày hôm nay trực tiếp ở Màn hình khóa với 2 nút hành động ngầm `[-30k]` và `[-50k]` (lưu giao dịch và cập nhật in-place không cần mở app, kèm nút `[↩️ Hoàn tác]` nếu bấm nhầm); nút `[📸 Chụp món]` và hệ thống deep link (`kepi://camera`, `kepi://scan-qr`) mở thẳng Camera Viewfinder dùng chung trong $< 0.5$s.
* **Thời gian hoàn thành:** 2026-10-05

#### Danh sách Tasks hoàn thành:
- [x] **Task M1.4.1 — Dịch Vụ Màn Hình Khóa `src/services/lockScreenService.ts`:**
  - Khởi tạo Notification Category: `kepi-lockscreen-standard` (nút `[-30k Cafe]`, `[-50k Ăn trưa]`, `[📸 Chụp món]`) và `kepi-lockscreen-undo` (nút `[↩️ Hoàn tác]`, `[-50k Ăn trưa]`, `[📸 Chụp món]`).
  - Xử lý background actions `recordLockScreenQuickSpend`: lưu giao dịch `amount: 30000/50000`, `category: 'Ăn uống'`, `source: 'MANUAL'`, `status: 'CONFIRMED'`.
  - Cập nhật in-place thanh thông báo ngay lập tức hiển thị số dư mới kèm thời gian và nút Hoàn tác.
  - Xử lý `undoLockScreenQuickSpend`: xóa giao dịch nhầm và khôi phục số dư.
- [x] **Task M1.4.2 — Thẻ Cài Đặt Hồ Sơ `LockScreenSettingsCard.tsx`:**
  - Giao diện chuẩn Hà Nội Thu Đông với icon `Smartphone`, badge trạng thái `Đang ghim` / `Đang tắt`.
  - Công tắc Switch Bật/Tắt ghim số dư, lưu trạng thái bền vững vào `AsyncStorage` (`kepi_lockscreen_budget_enabled`).
  - 3 chip tính năng nổi bật: Trừ ngầm -30k/-50k, Hoàn tác 1 chạm, Mở camera < 0.5s.
- [x] **Task M1.4.3 — Tích Hợp Vào `ProfileView.tsx` & Đồng Bộ Thời Gian Thực:**
  - Nhúng `LockScreenSettingsCard` vào ProfileView.
  - Tự động gọi `syncBudgetToLockScreen()` trong `transactionStore.ts` khi có giao dịch mới (thêm, sửa, xóa, xác nhận).
- [x] **Task M1.4.4 — Đăng Ký Interactive Listener & Deep Link Kép (`app/(main)/index.tsx`):**
  - Bắt các action từ thông báo khóa máy qua `addNotificationResponseReceivedListener`.
  - Hỗ trợ deep link kép: `kepi://camera`, `kepi://scan-qr`, `kepi://today-budget` và `vilocket://` trong `app.json`.
- [x] **Task M1.4.5 — Kiểm Thử Tự Động Toàn Diện:**
  - Bổ sung Test Suite 19 trong `run-all-tests.js`.
  - Toàn bộ 19/19 tests PASS 100% và `npx tsc --noEmit` đạt 0 lỗi sạch sẽ.






