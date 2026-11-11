# QUY TẮC & QUY TRÌNH DÀNH CHO AI AGENT (AGENTS.MD)

> **Dự án:** PigFly (Ví Locket) — Mobile App Chi Tiêu Bằng Ảnh, Quét Mã QR & AI-First Gamification  
> **Phiên bản tài liệu:** NEW v4.4 (Anime Magazine 3-Segment Stats, PigFly 3D FPS Flight Simulator & Zero FEP Points)  
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

---

## 🗺️ MA TRẬN TRA CỨU TÀI LIỆU THEO TÍNH NĂNG (FEATURE-TO-DOC MATRIX)

Khi thực thi công việc ở bất kỳ danh mục hay tính năng nào, Agent **BẮT BUỘC** phải đọc các tài liệu tương ứng dưới đây trước khi lập kế hoạch và viết mã:

| Nhóm Tính Năng / Màn Hình | Tài Liệu Bắt Buộc Phải Đọc Trong `/docs` | Trọng Tâm Nghiệp Vụ Cần Nắm |
| :--- | :--- | :--- |
| **Toàn Bộ Dự Án (Core Vision)** | - [docs/PRD_PIGFLY_MASTER.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/PRD_PIGFLY_MASTER.md)<br>- [docs/ROADMAP.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/ROADMAP.md)<br>- [docs/PAGES_FEATURES.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/PAGES_FEATURES.md) | Mục tiêu sản phẩm PigFly, slogan "Tiết kiệm – Duy trì – Sinh lời bền vững", 5 trụ cột điều hướng, lộ trình chiến lược v4.1. |
| **Giao Diện, Màu Sắc, Linh Vật** | - [docs/DESIGN.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/DESIGN.md)<br>- [docs/PIGFLY_PROMPT_STUDIO.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/PIGFLY_PROMPT_STUDIO.md)<br>- [docs/screens/_TEMPLATE.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/screens/_TEMPLATE.md) | 2 Theme độc bản: "Hồng Heo" (`pink`) và "Xanh Mint" (`mint`) chuẩn WCAG 2.1 AAA/AA, linh vật PigFly Lottie 4 Moods, 100% Vector icons nổi trần `lucide-react-native`. |
| **Game Hóa PigFly & Squad** | - [docs/features/PIGFLY_GAMIFICATION_SPEC.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/features/PIGFLY_GAMIFICATION_SPEC.md) | **Zero FEP Virtual Points (Quyết định 112 & 115)**, Động lực Chuỗi Streak (ngày), 5 Tầng Mây Tài Chính, Game PigFly 3D FPS Flight Simulator, Squad Nuôi Heo 2.0 & SOS Overspending Alarm. |
| **Kiến Trúc, CSDL & State Store** | - [docs/TECH_ARCHITECTURE.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/TECH_ARCHITECTURE.md)<br>- [docs/DECISIONS.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/DECISIONS.md)<br>- [docs/DATABASE_API_CONTRACT.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/DATABASE_API_CONTRACT.md) | Cấu trúc Expo + Supabase + Zustand, RLS policies, phân lập Pure Functions, AI NLP/OCR Pipeline và Unit Tests. |
| **Quyền Riêng Tư & Bảo Mật** | - [docs/PRIVACY.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/PRIVACY.md)<br>- [docs/PRIVACY_POLICY_DRAFT.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/PRIVACY_POLICY_DRAFT.md) | **Không lưu số tài khoản người nhận**, làm sạch EXIF ảnh, chế độ làm mờ "Ẩn tiền", telemetry không chứa PII. |
| **Tab 0: Sổ Nhật Ký (Home)** | - [docs/screens/HOME.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/screens/HOME.md) | Lịch ảnh 7 cột, Rollover 100% ngân sách ngày, chuỗi Streak, PigFly Lottie bay lơ lửng trên Greeting Header với 4 trạng thái cảm xúc thời gian thực. |
| **Tab 1: Thống Kê (Stats)** | - [docs/screens/STATS.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/screens/STATS.md) | Cuộn Album ảnh tháng 3:4, Hộp Cảm Xúc PigFly, Báo cáo Tạp chí Anime Magazine 3 Chế Độ Xem (Album / Phân Tích / Tạp Chí) & 3 KPI Mới (Runway Score, Impulse Ratio, Savings Velocity). |
| **Tab 2: Camera Quick Hub** | - [docs/screens/CAMERA.md](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/docs/screens/CAMERA.md) | Khung ngắm 4:5 bo góc 24px thoáng đãng 100%, nút Shutter 1-chạm nhún xúc giác, **Nút Voice-to-Expense 🎤 $\le 2$s**, **AI Receipt OCR Scanner với Carousel Fallback $\le 3$s**, cuộn Locket Stream. |
| **Tab 3: AI Coach & Squad (Chat)** | - [docs/screens/CHAT.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/screens/CHAT.md) | Persona Anh PT Giữ Ví, Gemini API 2 chiều, Squad Nuôi Heo 2.0 (tối đa 4 bạn thân), Còi SOS Overspending Beacon và Game PigFly 3D FPS Flight Simulator. |
| **Tab 4: Hồ Sơ & Cài Đặt (Profile)** | - [docs/screens/PROFILE.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/screens/PROFILE.md) | Hạn mức ngày `Hôm nay tiêu được` (0 hardcode), Mục tiêu Thác nước, Cài đặt bảo mật Zero-STK minh bạch. |
| **Quét Mã VietQR (Luồng 1)** | - [docs/features/QR_PAY.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/features/QR_PAY.md)<br>- [docs/qr/BANK_DEEPLINK_MATRIX.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/qr/BANK_DEEPLINK_MATRIX.md)<br>- [docs/qr/EMV_PARSER_SPEC.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/qr/EMV_PARSER_SPEC.md) | Nhận diện mã VietQR offline, phân luồng Autofill (MB, ICB, BIDV, ACB, OCB), deeplink v2, hỏi "Đã chuyển xong chưa?". |
| **AI Receipt OCR & Voice (Luồng 2)** | - [docs/features/RECEIPT_UPLOAD.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/features/RECEIPT_UPLOAD.md)<br>- [docs/features/CONFIRMATION_INBOX_SPEC.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/features/CONFIRMATION_INBOX_SPEC.md) | AI OCR tự động trích xuất hóa đơn sau khi chụp $\le 1$s, xuất Top 3 Carousel Fallback Selector trên bàn phím `MandCashierKeyboard`, nhập giọng nói $\le 2$s qua `voiceExpenseParser`. |

---

## 🔄 WORKFLOW 5 BƯỚC CHUẨN CỦA AGENT

```
┌────────────────────────────────────────────────────────────────────────┐
│ BƯỚC 1: TRA CỨU VÀ ĐỌC TÀI LIỆU THEO TÍNH NĂNG (Context Loading)       │
│ Tra cứu Ma trận Feature-to-Doc và nạp đầy đủ tài liệu liên quan trong   │
│ thư mục /docs/ trước khi suy nghĩ giải pháp.                           │
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

1. **Hệ Thống 2 Theme Độc Bản (Hồng Heo & Xanh Mint) & WCAG 2.1:**
   - CẤM dùng màu mặc định cẩu thả (`#FF0000`, `#00FF00`, `#0000FF`).
   - Mọi component bắt buộc dùng token màu từ `src/theme/tokens.ts`:
     - **Theme Hồng Heo (`pink` - Mặc định):** Tông hồng pastel ngọt ngào ấm cúng, tương phản WCAG AAA/AA cao.
     - **Theme Xanh Mint (`mint`):** Tông xanh ngọc bạc hà tươi mát, gradient dịu nhẹ thư thái.
     - Nút hành động / Accent: Nắng Thu Hà Nội `#E59844` (tương phản 8.2:1 trên nền tối).
     - Trạng thái An toàn / Thu nhập: Cốm Non Làng Vòng `#7E9F80`.
     - Trạng thái Chi / Cảnh báo: Ngói Rêu Phố Cổ `#C86D51` (tương phản 4.8:1 trên nền sáng).
2. **Kiểu chữ có hồn & Con số chuẩn xác (Typography):**
   - Tiêu đề & Cảm xúc: **Be Vietnam Pro** mang chất thơ Hà Nội.
   - Con số tài chính: Bắt buộc dùng `fontVariant: ['tabular-nums']` để số không bị giật khi đếm.
3. **Chuẩn Vector Icons Nổi Trần & In Đậm (Pure Floating Bold Icons):**
   - **100% Vector Icons** từ thư viện `lucide-react-native`. Tuyệt đối không dùng emoji làm icon chính trên nút bấm điều hướng.
   - **Bỏ 100% viền bo & hộp nền màu (Zero Border & Boxless):** Mọi icon xuất hiện trong toàn App (Tabs, Header, Cards, Modals, Detail Sheets) bắt buộc hiển thị dạng vector nổi trần tự nhiên (`borderWidth: 0, backgroundColor: 'transparent'`), cấm dùng khối bo tròn/vuông màu bọc icon.
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
