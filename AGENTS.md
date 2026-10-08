# QUY TẮC & QUY TRÌNH DÀNH CHO AI AGENT (AGENTS.MD)

> **Dự án:** Kepi (Ví Locket) — Mobile App Chi Tiêu Bằng Ảnh & Quét Mã QR (Phong cách Hà Nội Thu Đông)  
> **Phiên bản tài liệu:** 2.1 (Loại bỏ tính năng Voice, tối ưu tốc độ ghi chép <= 3s & bảo vệ quyền riêng tư)  
> **Áp dụng cho:** Tất cả các AI Agent tham gia lập trình và phát triển dự án.

---

## 🚨 NGUYÊN TẮC BẤT DI BẤT DỊCH (CORE DIRECTIVES)

### 1. QUY TẮC "TÀI LIỆU SỐNG" (LIVING DOCUMENTATION DIRECTIVE)
* **Tài liệu tạo ra phải có lý do cụ thể và BẮT BUỘC ĐƯỢC ĐỌC TRONG SUỐT QUÁ TRÌNH THỰC THI** — Tuyệt đối cấm tạo tài liệu xong để đó!
* **Trước khi chạm vào bất kỳ dòng code nào**, Agent bắt buộc phải tra cứu và đọc kỹ tài liệu tương ứng với Module / Feature / Screen sắp thực hiện (xem *Ma Trận Tra Cứu Tài Liệu* ở Mục 2).
* **Quy tắc Đồng bộ Ngược (Reverse Sync):** Bất kỳ khi nào có sự thay đổi về quyết định kỹ thuật, cấu trúc dữ liệu, hoặc luồng người dùng (UX flow), Agent bắt buộc phải cập nhật ngược lại vào các tài liệu liên quan trong `/docs` để giữ cho tài liệu luôn là **Nguồn Sự Thật Duy Nhất (Single Source of Truth)**.

### 2. QUY TRÌNH 2 ĐẦU BẮT BUỘC TRƯỚC VÀ SAU MỖI PHASE / TASK
* **TRƯỚC MỖI PHASE / TASK (Pre-Phase Plan):**
  1. Đọc tất cả các tài liệu liên quan trong `/docs`.
  2. Trình bày **Implementation Plan** chi tiết: Liệt kê các tài liệu đã tham chiếu, các file sẽ tạo/chỉnh sửa, các component/state liên quan và tiêu chí nghiệm thu.
* **SAU MỖI PHASE / TASK (Post-Phase Walkthrough):**
  1. Chạy toàn bộ kiểm thử xác thực: `npx tsc --noEmit` (0 lỗi) và `node run-all-tests.js` (100% pass).
  2. Cung cấp **Walkthrough Report** minh bạch: Bằng chứng thực tế (ai kiểm, máy nào, kết quả), các số đo thời gian thực, các quyết định kiến trúc và cập nhật tài liệu tương ứng.

---

## 🗺️ MA TRẬN TRA CỨU TÀI LIỆU THEO TÍNH NĂNG (FEATURE-TO-DOC MATRIX)

Khi thực thi công việc ở bất kỳ danh mục hay tính năng nào, Agent **BẮT BUỘC** phải đọc các tài liệu tương ứng dưới đây trước khi lập kế hoạch và viết mã:

| Nhóm Tính Năng / Màn Hình | Tài Liệu Bắt Buộc Phải Đọc Trong `/docs` | Trọng Tâm Nghiệp Vụ Cần Nắm |
| :--- | :--- | :--- |
| **Toàn Bộ Dự Án (Core Vision)** | - [docs/PRD_M0_VI_LOCKET.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/PRD_M0_VI_LOCKET.md)<br>- [docs/ROADMAP.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/ROADMAP.md)<br>- [docs/PHASES.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/PHASES.md)<br>- [docs/PAGES_FEATURES.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/PAGES_FEATURES.md) | Mục tiêu sản phẩm, 5 trụ cột điều hướng, tiến độ các Milestone (M0, M1, M2). |
| **Giao Diện, Màu Sắc, Thẩm Mỹ** | - [docs/DESIGN.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/DESIGN.md)<br>- [docs/screens/_TEMPLATE.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/screens/_TEMPLATE.md) | Vibe Hà Nội Thu Đông, bảng màu WCAG 2.1 AA/AAA, nút 3D Chunky, font số `tabular-nums`, 100% Vector icons `lucide-react-native`. |
| **Kiến Trúc, CSDL & State Store** | - [docs/TECH_ARCHITECTURE.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/TECH_ARCHITECTURE.md)<br>- [docs/DECISIONS.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/DECISIONS.md)<br>- [docs/PLAN.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/PLAN.md) | Cấu trúc Expo + Supabase + Zustand, RLS policies, phân lập Pure Functions và Unit Tests. |
| **Quyền Riêng Tư & Bảo Mật** | - [docs/PRIVACY.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/PRIVACY.md)<br>- [docs/PRIVACY_POLICY_DRAFT.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/PRIVACY_POLICY_DRAFT.md) | **Không lưu số tài khoản người nhận**, làm sạch EXIF ảnh, chế độ làm mờ "Ẩn tiền", telemetry không chứa PII. |
| **Tab 0: Sổ Nhật Ký (Home)** | - [docs/screens/HOME.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/screens/HOME.md) | Lịch ảnh 7 cột, Rollover 100% ngân sách ngày, chuỗi Streak, phân lập khoản PENDING. |
| **Tab 1: Thống Kê (Stats)** | - [docs/screens/STATS.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/screens/STATS.md) | Cuộn Album ảnh tháng 3:4, thanh sinh lực HP Bar đổi màu, cơ cấu chi tiêu. |
| **Tab 2: Camera & Locket Feed** | - [docs/screens/CAMERA.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/screens/CAMERA.md) | Khung ngắm 4:5 bo góc 24px, 4 ngàm vàng, nút Shutter 1 chạm nhún xúc giác, chip giá nhanh $\le 3$s, cuộn Locket Stream. |
| **Tab 3: AI Coach Minh (Chat)** | - [docs/screens/CHAT.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/screens/CHAT.md) | Persona Anh PT Giữ Ví, Gemini API 2 chiều, bộ lọc 3 câu hỏi phản biện chống FOMO. |
| **Tab 4: Hồ Sơ & Bài Học (Profile)** | - [docs/screens/PROFILE.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/screens/PROFILE.md) | Quy đổi lương giờ, mục tiêu cá nhân, thư viện bài học micro-lessons, Cài đặt bảo mật. |
| **Quét Mã VietQR (Luồng 1)** | - [docs/features/QR_PAY.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/features/QR_PAY.md)<br>- [docs/qr/BANK_DEEPLINK_MATRIX.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/qr/BANK_DEEPLINK_MATRIX.md)<br>- [docs/qr/EMV_PARSER_SPEC.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/qr/EMV_PARSER_SPEC.md) | Nhận diện mã VietQR offline, phân luồng Autofill (MB, ICB, BIDV, ACB, OCB), deeplink v2, hỏi "Đã chuyển xong chưa?". |
| **Hộp Xác Nhận & Tải Ảnh (Luồng 2)** | - [docs/features/CONFIRMATION_INBOX_SPEC.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/features/CONFIRMATION_INBOX_SPEC.md)<br>- [docs/features/RECEIPT_UPLOAD.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/features/RECEIPT_UPLOAD.md) | **0 OCR / 0 AI đọc ảnh**, nhập tay $\le 5$s, chip giá kết hợp, lưu giữ QR $>24$h trong "Chưa xác nhận", Screenshot 7 ngày, hoàn tác 5s. |

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

1. **Bảng màu Hà Nội Thu Đông & Độ tương phản WCAG 2.1:**
   - CẤM dùng màu mặc định cẩu thả (`#FF0000`, `#00FF00`, `#0000FF`).
   - Mọi component bắt buộc dùng token màu từ `src/constants/colors.ts`:
     - Nền sáng: `#FAF6EC` / `#FAF6F0` (Sữa Ngà Bơ)
     - Nền tối / Camera: `#0E1620` / `#161816` (Khói Trầm Đêm Đông)
     - Nút hành động / Accent: `#E59844` (Nắng Thu Hà Nội — tương phản 8.2:1 trên nền tối)
     - Trạng thái An toàn / Thu nhập: `#7E9F80` (Cốm Non Làng Vòng)
     - Trạng thái Chi / Cảnh báo: `#C86D51` (Ngói Rêu Phố Cổ — tương phản 4.8:1 trên nền sáng)
2. **Kiểu chữ có hồn & Con số chuẩn xác (Typography):**
   - Tiêu đề & Cảm xúc: **Be Vietnam Pro** mang chất thơ Hà Nội.
   - Con số tài chính: Bắt buộc dùng `fontVariant: ['tabular-nums']` để số không bị giật khi đếm.
3. **Chuẩn Vector Icons & Kích thước chạm:**
   - **100% Vector Icons** từ thư viện `lucide-react-native`. Tuyệt đối không dùng emoji làm icon chính trên nút bấm điều hướng.
   - Kích thước vùng chạm (Touch area) tối thiểu $\ge 44 \times 44$px.
4. **Tương tác Xúc giác & Chuyển động (Haptics & Spring Animations):**
   - Mọi thao tác quan trọng (Bấm Shutter, Nhập chip giá, Chọn Cứu Ví, Lưu Sổ, Tải Ảnh) đều phải có Haptic Feedback tương ứng (`expo-haptics`).
   - Dùng `react-native-reanimated` với Spring easing tự nhiên cho Bottom Sheet và Card.

---

## 💻 QUY CHUẨN LẬP TRÌNH & BẢO MẬT (ENGINEERING STANDARDS)

1. **TypeScript Nghiêm Ngặt:**
   - Bật `strict: true`. Tuyệt đối không dùng `any` tùy tiện; luôn định nghĩa interface/type rõ ràng trong `src/types/`.
2. **Cấu trúc State (Zustand) & Phân Lập Khoản Chờ:**
   - Chia tách store mạch lạc: `authStore`, `budgetStore`, `transactionStore`, `waitBasketStore`.
   - Các khoản `PENDING` tuyệt đối không được tính vào tổng chi tiêu hay số dư cho đến khi người dùng xác nhận `CONFIRMED`.
3. **Bảo Mật Quyền Riêng Tư (Không lưu STK):**
   - **Tuyệt đối không lưu số tài khoản người nhận** vào CSDL, SQLite, AsyncStorage hay logs.
   - Luôn làm sạch siêu dữ liệu EXIF trước khi lưu ảnh vào bộ nhớ máy.
   - Dữ liệu sự kiện phân tích (Telemetry) phải được làm sạch qua hàm `sanitize` (không chứa PII, số tiền, tên nơi nhận).

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

#### 3. Minh Chứng Hoạt Động & Kết Quả Kiểm Thử Thực Tế
- **Môi trường & Thiết bị:** [Tên thiết bị, OS, người kiểm thử, thời gian]
- **Số đo thực tế:** [Tốc độ mở thẻ, thời gian lưu trung vị, độ tương phản]
- **Kiểm thử hồi quy:** [`tsc --noEmit` 0 lỗi, `node run-all-tests.js` 100% pass]
- **Kiểm tra bảo mật:** [Bằng chứng CSDL & Logs không lưu số tài khoản người nhận]

#### 4. Kế Hoạch Cho Phase Kế Tiếp
- Sẵn sàng chuyển sang Phase [X+1].
```
