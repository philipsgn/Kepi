# 📋 ĐẶC TẢ MÀN HÌNH: CAMERA PHOTOBOOTH & KHOẢNH KHẮC LOCKET (CAMERA.MD)

> **Mã màn hình:** `CAMERA` (Tab 3, Index 2 — Trang trung tâm và mở đầu mặc định của app)  
> **Tên màn hình:** Camera Photobooth & Dòng Khoảnh Khắc Locket (Ghi Chi Tiêu Nhanh & Thư Viện Khoảnh Khắc)  
> **Trạng thái:** Đã Phê Duyệt & Nâng Cấp Gradient Hài Hòa & Kính Mờ Thích Ứng (Stage B2)  
> **Phiên bản:** 2.1  
> **Lần cập nhật cuối:** 2026-10-03  

---

## 1. Mục Tiêu & Trải Nghiệm Người Dùng (User Experience & UX Goals)

- **User Story:**
  - Mở app là thấy ngay **buồng chụp Photobooth phong cách Hà Nội Thu Đông** với không gian màu sắc hài hòa: đỉnh màn hình mang tông khói trầm điện ảnh nhẹ rồi chuyển sắc (gradient) êm dịu hòa vào màu Kem Sữa Ngà (`#FAF6EC`) ấm áp của dòng khoảnh khắc bên dưới và toàn bộ ứng dụng (ở Light Mode) hoặc màu Đêm Đông (`#0E1620` ở Dark Mode).
  - Khắc phục hoàn toàn cảm giác "bị một màu đen bao trùm cô lập, nhìn rất tối" trước đó; tạo nên một thể thống nhất liền mạch giữa phần chụp ảnh và phần xem lại dòng lịch sử.
  - Người dùng có thể **chụp ảnh món đồ, tải ảnh chuyển khoản từ thư viện, hoặc chỉ cần bấm "Ghi nhanh" nhập text + số tiền trong 3 giây**.
  - Các chế độ `[ Chi | Thu | Định mua ]` được bố trí dạng **Nút Nhấn Cố Định (Fixed Tap Selector)** với độ nhạy tức thì: chạm vào nút nào, viên thuốc vàng ấm lướt spring mượt mà đến nút đó kèm rung xúc giác nhẹ, không bị giật lag hay xung đột cử chỉ cuộn trang.
  - Khi vuốt ngón tay xuống để xem các ảnh khoảnh khắc cũ (`LocketMomentCard`), người dùng có thể **ấn vào biểu tượng Camera tròn vàng ở chính giữa thanh điều hướng nổi (Floating Tab Bar)** hoặc vuốt trượt lên để tức thì quay lại khung ngắm Camera.
  - Đối với các khoản ghi chép chỉ bằng text (không chụp ảnh), dòng khoảnh khắc Locket hiển thị **icon phân loại đơn sắc (Monochrome Category Icon)** tối giản, thanh lịch, chuẩn mực thẩm mỹ "Ấm, Tĩnh, Sang".

- **Mục tiêu sản phẩm:**
  1. **Đồng bộ màu sắc & Nền chuyển sắc Gradient điện ảnh:** Sử dụng `LinearGradient` chuyển tiếp mềm mại từ đỉnh quanh khung ngắm xuống dòng lịch sử, tạo chiều sâu thị giác tự nhiên mà vẫn giữ vẹn nguyên tính ấm áp của bảng màu Hà Nội Thu Đông.
  2. **Kính Mờ Thích Ứng (Adaptive Frosted Glass):** Toàn bộ nút bấm (Upload, Flip, Ghi nhanh, Flash, Coach Minh, Giỏ chờ) sử dụng chất liệu kính mờ bán trong suốt với viền phản chiếu ánh sáng siêu mảnh (`rgba(255, 255, 255, 0.22)`), màu icon tự động tương phản rõ nét trên nền gradient.
  3. **Tương tác trực giác một chạm (1-Tap Recovery):** Chạm nút Camera ở giữa Floating Tab Bar khi đang lướt ảnh cũ sẽ cuộn mượt về đỉnh camera (y: 0).
  4. **Khung nhập ghi nhanh vừa vặn (Zero-Scroll Confirmation):** Giao diện xác nhận / ghi nhanh vừa khít 1 khung hình điện thoại, chữ và input thanh mảnh, không cuộn màn hình.
  5. **Cổng tiếp nhận trực tiếp từ 'Vào ngay' (Zero-Friction Instant Entry):** Người dùng bấm "Vào ngay" từ màn hình đăng nhập được đưa thẳng tới Khung ngắm Camera (Tab 2) trong $< 0.5$s, bắt đầu từ con số 0đ trung thực (0 giao dịch demo, 0 ép ngân sách), sẵn sàng bấm Shutter ghi nhận khoảnh khắc đầu tiên.

---

## 2. Wireframe Chữ (ASCII Wireframe)

### 2.1. Trạng Thái Mở Đầu: Khung Ngắm Locket Squircle 38px Tối Giản (Live Camera Viewfinder)
*Đã bỏ hoàn toàn khung Chi/Thu/Định mua phía trên, khung ngắm thoáng đãng tinh tế:*
```text
┌────────────────────────────────────────────────────────┐
│  ⚡ Flash     [• Hôm nay tiêu: 45.000 đ]     Avatar   ⌛2│ (Top Bar kính mờ không viền box)
├────────────────────────────────────────────────────────┤
│                                                        │
│ ┌ Khung Ngắm Locket Squircle Siêu Bo Góc 38px (4:5) ──┐│ (Không viền film rườm rà)
│ │                                                    ││
│ │              [ Live Camera Feed ]                  ││
│ │              (Bo góc lớn chuẩn Locket)             ││
│ │                                                    ││
│ └─────────────────────────────────────────────────────┘│
│                                                        │
│                    [ ✍️ Ghi nhanh ]                     │ (Kính mờ không viền)
│                                                        │
│     ( 🖼️ )                 (( 🟡 ))             ( 🔄 ) │ (Hàng điều khiển không viền box)
│   Upload Thư Viện       Shutter Cơ Gold        Lật Camera
│ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~  │ (Gradient chuyển êm về Kem Ngà)
└────────────────────────────────────────────────────────┘
```

### 2.1b. Trạng Thái Sau Khi Chụp: Ghi Chép Trực Tiếp Tinh Tế (Unobtrusive In-Frame Direct Editing)
*Không che ảnh, 0 chip giá che khuất, số tiền đuôi .000 đ cố định và mô tả sát đáy trong khung, Chi/Thu ngoài khung:*
```text
┌────────────────────────────────────────────────────────┐
│  ⚡ Flash     [• Hôm nay tiêu: 45.000 đ]     Avatar   ⌛2│
├────────────────────────────────────────────────────────┤
│                                                        │
│ ┌ Khung Ngắm Squircle (Ảnh Vừa Chụp 4:5 - Thoáng 90%) ┐│
│ │                 [ Danh mục ▾ ]                     ││ (Nút danh mục đặt chính giữa đỉnh ảnh)
│ │                                                    ││
│ │                                                    ││
│ │                 [ Ảnh Món Đồ ]                     ││ (Ảnh rõ nét, hoàn toàn không bị che)
│ │                                                    ││
│ │                                                    ││
│ │ ┌ Dải Nhập Liệu Sát Đáy Trong Khung ─────────────┐ ││
│ │ │              [ 50 ] .000 đ  (x)                │ ││ (Gõ nhanh phần nghìn, đuôi .000 đ)
│ │ │         Thêm mô tả (gà rán, cà phê...)         │ ││ (Mô tả kính mờ mỏng nhẹ sát đáy)
│ │ └────────────────────────────────────────────────┘ ││
│ └─────────────────────────────────────────────────────┘│
│                                                        │
│             [ ↗ Chi  |  ↘ Thu ]                        │ (Gạt Chi/Thu sát mép DƯỚI NGOÀI khung)
│                                                        │
│          ( ✕ )                     (( ✔ ))             │ (Cặp nút tròn thuần biểu tượng [✕] & [✔], bỏ chữ)
│        Chụp lại                  Lưu vào sổ            │
│ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~  │
└────────────────────────────────────────────────────────┘
```

### 2.2. Trạng Thái Vuốt Xuống: Dòng Khoảnh Khắc Locket (Vertical Paging Snap — Khóa Trang 100vh)
*Camera và Lịch sử được tách biệt hoàn toàn qua cơ chế Vertical Paging Snap (`pagingEnabled`, `snapToInterval={SCREEN_HEIGHT}`). Khi ở Camera, vuốt lên dứt khoát để lật sang trang Lịch sử; khi chạm vào tab Camera ở thanh điều hướng, màn hình luôn luôn reset mượt về trang đầu (y = 0):*
```text
┌────────────────────────────────────────────────────────┐
│ ┌ Thẻ Khoảnh Khắc Locket #1 (Ảnh Mới Nhất) ───────────┐│ (Nền Kem Ngà #FAF6EC liền mạch)
│ │ ┌─────────────────────────────────────────────────┐ ││
│ │ │                                                 │ ││
│ │ │             Ảnh chụp món đồ (4:5)               │ ││
│ │ │                                                 │ ││
│ │ └─────────────────────────────────────────────────┘ ││
│ │ [ 45.000 đ ]                ☕ Cà phê trứng · 2g trước││ (Tag giá đè nhẹ chân ảnh)
│ └─────────────────────────────────────────────────────┘│
│                                                        │
│ ┌ Thẻ Khoảnh Khắc Locket #2 (Khoản Ghi Bằng Text) ────┐│
│ │ ┌─────────────────────────────────────────────────┐ ││
│ │ │                                                 │ ││
│ │ │            ( 🛒 Icon Đơn Sắc Danh Mục )         │ ││ (Nền gốm ngà / khói trầm)
│ │ │               [Tối Giản, Đơn Sắc]               │ ││
│ │ └─────────────────────────────────────────────────┘ ││
│ │ [ 120.000 đ ]            🛒 Mua đồ siêu thị · Hôm qua││
│ └─────────────────────────────────────────────────────┘│
│                                                        │
│          [ ... cuộn xem tiếp các ngày trước ... ]       │
├────────────────────────────────────────────────────────┤
│   [ Sổ ]     [ Lịch ]     [ 📷 CAM ]     [ Thống kê ]  │ (Floating Tab Bar)
│                             ▲ Chạm để về đỉnh camera!   │
└────────────────────────────────────────────────────────┘
```

---

## 3. Cây Component & Props (Component Hierarchy)

```text
<MainAppScreen> (app/(main)/index.tsx - Trang 3 trong Pager)
  ├── <ScrollView ref={verticalHistoryScrollRef}>
  │     │
  │     ├── <LinearGradient> (Nền chuyển sắc điện ảnh quanh khung ngắm)
  │     │     │
  │     │     ├── <CameraTopBar>
  │     │     │     ├── <FlashToggle> (Flash on/off/auto kính mờ thích ứng)
  │     │     │     ├── <DailyBudgetChip> ("Hôm nay tiêu: X đ")
  │     │     │     ├── <MinhAvatarBadge> (Chạm mở Coach Minh)
  │     │     │     └── <WaitBasketShortcut> (Icon đồng hồ cát kèm badge)
  │     │     │
  │     │     ├── <ViewfinderContainer> (Squircle bo cong 38px, tỷ lệ 4:5, viền tối giản)
  │     │     │     ├── <CameraView> (Expo Camera live stream toàn vẹn khi chưa chụp)
  │     │     │     └── <OnCameraPhotoOverlay> (Ghi chép trực tiếp trên khung ảnh: Tag danh mục bắt buộc, nút gạt nhanh Hình thức thanh toán [💵 Tiền mặt | 💳 Ngân hàng], nhập tiền tự tách chấm 000.000 không giới hạn, kích thước số đồng nhất, Note, Chi/Thu)
  │     │     │
  │     │     └── <CameraBottomBar> (Thanh công cụ thích ứng)
  │     │           ├── [Khi đã chụp]: <InFrameSaveButton> (Nút "Lưu vào sổ ✔" to bản 52px bo tròn, mờ khi chưa chọn mục/tiền, cảnh báo rung & mở dải chọn nếu chưa hợp lệ)
  │     │           └── [Khi chưa chụp]:
  │     │                 ├── <QuickRecordFloatingPill> (Nút mini "✍️ Ghi nhanh" kính mờ)
  │     │                 ├── <UploadPhotoButton> (Chọn ảnh từ thư viện ImagePlus)
  │     │                 ├── <ShutterButton> (Đĩa vàng tactile glow, đàn hồi 1 chạm)
  │     │                 └── <FlipCameraButton> (Lật camera trước/sau RotateCcw)
  │     │
  │     └── <LocketMomentsStream> (Dòng ảnh khoảnh khắc liên tục)
  │           └── <LocketMomentCard> (Thẻ ảnh Squircle bo góc 38px, từng khung hình riêng biệt)
  │
  ├── <FloatingPillTabBar> (Thanh điều hướng đáy)
  │     └── Chạm vào Tab 2 (Camera) -> verticalHistoryScrollRef.scrollTo({ y: 0 })
  │
  ├── <ConfirmationSheet> (Sheet xác nhận / ghi nhanh 1 khung hình)
  ├── <ActualPriceSheet> (Màn Giá thật cân nhắc chi tiêu)
  ├── <MinhCoachModal> (Gợi ý và nhắc nhở từ Coach Minh)
  └── <UndoToastBar> (Thanh hoàn tác 5 giây)
```

---

## 4. Hợp Đồng Dữ Liệu & Logic Nghiệp Vụ (Data Contract & Business Rules)

### 4.1. Hỗ Trợ 4 Nguồn Dữ Liệu Đầu Vào
1. **Chụp ảnh trực tiếp từ Camera:** Bấm chụp 1 chạm nhanh $\le 3$s với chip giá thông minh.
2. **Quét Mã Chuyển Khoản & Ví Điện Tử (QR Pay & E-Wallet Handoff):** Khung ngắm tự động nhận diện mã VietQR 37 ngân hàng và mã QR Ví điện tử ZaloPay / MoMo qua Whitelist an toàn; trượt thẻ thông tin lên và mở app thanh toán, tự tạo PENDING vào Hộp xác nhận.
3. **Tải ảnh từ Thư viện (Library Upload):** Nút `ImagePlus` cạnh Shutter mở thư viện ảnh biên lai chuyển khoản hoặc ảnh món đồ.
4. **Ghi chép nhanh bằng Text (Quick Text Record):** Nút `[ ✍️ Ghi nhanh ]` mở modal 1 khung hình không cần ảnh, hiển thị icon danh mục đơn sắc trên dòng khoảnh khắc.

### 4.2. Quy Tắc Điều Hướng 1 Chạm (1-Tap Return To Camera)
- Khi người dùng đang ở tab Camera (`activeTabIndex === 2`) và cuộn xuống xem các ảnh cũ trong danh sách:
  - Nếu chạm vào nút Camera tròn vàng ở chính giữa thanh `FloatingPillTabBar`, màn hình tự động cuộn mượt về đỉnh (`y: 0`).

---

## 5. Quy Chuẩn Thẩm Mỹ Photobooth & Phối Màu Gradient (Aesthetic Specifications)

### 5.0. Nền Chuyển Sắc Gradient Điện Ảnh (Cinematic Gradient Background)
- **Công nghệ:** Sử dụng `expo-linear-gradient` bao bọc vùng máy ảnh phía trên.
- **Light Mode Palette:**
  - `colors: ['#1F2630', '#353D47', '#7D7972', '#FAF6EC']`
  - `locations: [0, 0.45, 0.82, 1.0]`
  - *Ý đồ nghệ thuật:* Đỉnh máy ảnh giữ tone tối điện ảnh tập trung vào ống kính, sau đó chuyển sắc êm dịu và hòa tan 100% vào màu Kem Sữa Ngà (`#FAF6EC`) của dòng lịch sử và toàn bộ app.
- **Dark Mode Palette:**
  - `colors: ['#1A2433', '#161F2C', '#101722', '#0E1620']`
  - `locations: [0, 0.45, 0.82, 1.0]`
  - *Ý đồ nghệ thuật:* Chuyển từ xanh khói trầm sang xanh đêm sâu thẳm `#0E1620`, liền mạch tuyệt đối với dòng lịch sử.
- **Root & Scrollview Background:** Đồng bộ sử dụng `tokens.background`, loại bỏ hoàn toàn các màu tối đen hardcoded `Colors.bgDark`.

### 5.1. Nút Shutter Photobooth Cơ Học
- **Vòng ngoài (Outer Ring):** 80px x 80px, bo tròn `radii.full`, viền ánh sáng `rgba(246, 184, 0, 0.45)` dày 2.5px.
- **Đĩa nút trong (Inner Button):** 64px x 64px, màu vàng ấm `tokens.primary`, đổ bóng khuếch tán tỏa sáng (Diffused Glow):
  ```typescript
  shadowColor: tokens.primary,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.38,
  shadowRadius: 12,
  elevation: 6,
  ```
- **Phản hồi xúc giác:** Chạm nhẹ rung `Heavy impact`, nhún scale `0.94` mô phỏng nút chụp cơ buồng Photobooth.

### 5.2. Nút Upload Thư Viện & Lật Camera Kính Mờ Thích Ứng
- **Kích thước:** 48px x 48px, bo tròn hoàn toàn (`radii.full`).
- **Chất liệu Kính Mờ (Adaptive Frosted Glass):**
  - Dark mode: `backgroundColor: 'rgba(255, 255, 255, 0.12)'`, viền `rgba(255, 255, 255, 0.22)` 1px.
  - Light mode: `backgroundColor: 'rgba(255, 255, 255, 0.25)'`, viền `rgba(255, 255, 255, 0.40)` 1px.
- **Đổ bóng mờ tự nhiên:** `shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 8`.
- **Icon:** Stroke mảnh 1.8px, màu sáng rõ nét trên nền gradient.

### 5.3. Capsule Chế Độ Nút Nhấn Cố Định (Fixed Tap Selector — ModeSwitchPill)
- **Nền:** Kính mờ khói tối trầm `rgba(20, 26, 36, 0.72)`, viền hairline 1px `rgba(255, 255, 255, 0.18)`.
- **Cơ chế Nút Nhấn Cố Định (Fixed Tap Selector):**
  - 3 nút bấm độc lập cố định trên thanh capsule: `Chi`, `Thu`, `Định mua`.
  - Chạm vào nút nào, viên thuốc màu vàng ấm lướt mượt mà bằng hiệu ứng lò xo (`Animated.spring`, `bounciness: 4`, `speed: 18`) đến ngay nút đó.
  - Phản hồi xúc giác tức thì (`Light impact`), không có độ trễ, không xung đột cử chỉ với thao tác cuộn màn hình.

---

## 6. Ma Trận Trạng Thái & Tương Tác Cử Chỉ (State & Interaction Matrix)

| Thao Tác Cử Chỉ | Vị Trí / Component | Kết Quả Phản Hồi | Haptic Feedback |
| :--- | :--- | :--- | :--- |
| **Chạm nút chế độ (Tap)** | Nút `Chi` / `Thu` / `Định mua` | Viên thuốc vàng ấm lướt mượt mà tới mục được chọn | `Light impact` |
| **Chạm nút Upload** | Icon `ImagePlus` cạnh Shutter | Mở thư viện chọn ảnh hóa đơn/chuyển khoản | `Selection` |
| **Chạm nút Shutter (1 chạm)** | Đĩa tròn vàng Photobooth | Chụp ảnh tức thì, nhún scale 0.94, mở nhập chip giá | `Heavy impact` |
| **Chạm "✍️ Ghi nhanh"** | Pill kính mờ trên nút chụp | Mở modal ghi chép text 1 khung hình | `Selection` |
| **Cuộn dọc xuống** | Khu vực dưới camera | Lướt xem dòng khoảnh khắc ảnh Locket | Mượt 60fps |
| **Chạm icon Cam ở Tab Bar** | Nút trung tâm Floating Tab Bar | Cuộn mượt về đỉnh camera (y: 0) | `Light impact` |
| **Chạm đúp khung ngắm** | Bề mặt Live Camera | Đổi nhanh camera trước $\leftrightarrow$ sau | `Medium impact` |

---

## 7. Tiêu Chí Nghiệm Thu (Acceptance Criteria — Đo Được)

1. [x] **Đồng bộ màu sắc & Gradient mượt mà:** Nền trang Camera không còn màu đen bao trùm; chuyển sắc êm dịu từ đỉnh máy ảnh hòa vào màu Kem Sữa Ngà (`#FAF6EC` ở Light Mode) hoặc màu Đêm Đông (`#0E1620` ở Dark Mode) của dòng lịch sử.
2. [x] **Nút nhấn cố định nhạy bén:** Cụm `[ Chi | Thu | Định mua ]` phản hồi tức thì khi bấm, viên thuốc lướt spring mượt mà.
3. [x] **Quay về Camera 1 chạm:** Chạm vào nút Camera ở thanh điều hướng đáy khi đang xem ảnh cũ sẽ cuộn mượt về đỉnh camera.
4. [x] **Phong cách Kính Mờ Thích Ứng:** Nút Upload, Flip, Ghi nhanh có nền kính mờ phản chiếu ánh sáng và icon sắc nét trên nền gradient.
5. [x] **Không lỗi TypeScript:** Chạy `npx tsc --noEmit` đạt 0 error, 0 warning.

---

## 8. TAM GIÁC 3 CƠ CHẾ GHI CHÉP TỐI THƯỢNG (3-IN-1 UNIFIED QUICK HUB)

Nhằm tối ưu hóa trải nghiệm trên Android và mở rộng trong tương lai, Màn hình Camera là điểm chạm hợp nhất cả 3 phương thức chi tiêu linh hoạt:

1. **Cơ Chế 1 (Chụp Món Đồ Thực Tế / Upload Thư Viện):**
   - Bấm nút Shutter cơ vàng để chụp ảnh món đồ trực tiếp.
   - Bấm nút `ImagePlus` bên trái để tải ảnh hóa đơn / biên lai từ thư viện máy.
2. **Cơ Chế 2 (Quét Mã VietQR / Ví Điện Tử Tự Động):**
   - Khung ngắm máy ảnh tích hợp Barcode Scanner nền tảng offline.
   - Khi lướt qua mã VietQR, app tự động bung `VietQRDetectedCard` hỗ trợ mở app ngân hàng chuyển khoản hoặc ghi nhanh.
3. **Cơ Chế 3 (Bắt Biến Động Số Dư & Tự Động Gắn Ảnh):**
   - Khi nhận thông báo biến động từ app ngân hàng (TPBank, VCB, MB...), app hiển thị **Smart Floating Bank Pill** trên khung ngắm (`⚡ TPBank: Đã tự động ghi -48.000đ (Highlands)`).
   - Nếu người dùng bấm chụp ảnh món đồ lúc Pill đang hiển thị, ảnh chụp thực tế lập tức gắn đè vào giao dịch ngân hàng đó, hoàn tất bức tranh chi tiêu bằng ảnh chân thực $\le 3$s.
