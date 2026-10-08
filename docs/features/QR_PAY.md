# 📋 ĐẶC TẢ TÍNH NĂNG: QUÉT MÃ CHUYỂN KHOẢN VIETQR (QR_PAY.MD)

> **Mã tính năng:** `QR_PAY` (Tích hợp trong Camera Tab 2 và Quản lý tại Hồ Sơ Tab 4)  
> **Tên tính năng:** Quét Mã Chuyển Khoản VietQR — Hệ Thống 37 Ngân Hàng, Minimal Handoff Zero-PII & Lưới An Toàn Học Thực Địa  
> **Trạng thái:** Đã triển khai hoàn tất (Hỗ trợ Casso/VietQR v2)  
> **Phiên bản:** 5.0 (Coverage 37 Ngân Hàng & Lưới An Toàn Thông Minh)  
> **Lần cập nhật cuối:** 2026-10-06  

---

## 1. Mục Tiêu & Người Dùng (Goals & User Stories)

- **User Story:**
  - Là người tiêu dùng thường xuyên chuyển khoản tại hàng quán, tôi muốn **mở camera quét bất kỳ mã VietQR nào (của bất kỳ ngân hàng nào)** để Kepi nhận diện số tiền, tên nơi nhận và danh mục chi tiêu hoàn toàn offline.
  - **Với ngân hàng chưa hỗ trợ tự điền (`noAutofillBanks`, mặc định Techcombank, Vietcombank):**
    - Kepi thông báo trung thực ngay trên thẻ: *"{Ngân hàng} chưa hỗ trợ điền sẵn. Quét lại mã trong app ngân hàng hoặc chụp màn hình rồi tải lên."*
    - Nút bấm mang nhãn `"Mở {Tên ngân hàng}"` mở app ngân hàng ở chế độ **Minimal Handoff** (chỉ mở app, **ZERO PII** — không gửi STK, số tiền, tên người nhận qua link).
    - Có lối tắt tiện ích `[Tải ảnh biên lai lên Kepi]` để người dùng dễ dàng chụp màn hình chuyển khoản thành công và tải lên ghi sổ trong $\le 5$s.
  - **Với 35 ngân hàng còn lại trong danh sách 37 ngân hàng (MB, ICB, BIDV, ACB, OCB, VPB, TPB...):**
    - Kepi dựng deeplink đầy đủ qua `dl.vietqr.io` để **thử điền sẵn**.
    - Nhãn nút bấm trung thực: `"Mở {Tên ngân hàng}"` (**tuyệt đối không hứa hẹn chắc chắn 100%**).
    - Người dùng chỉ việc kiểm tra số tiền và xác nhận OTP/FaceID trong app ngân hàng.
  - **Lưới an toàn phản hồi học thực địa (Field Learning):**
    - Khi quay lại Kepi ở màn hình *"Đã chuyển xong chưa?"*, nếu app ngân hàng không tự điền, người dùng bấm `[App không điền sẵn?]`.
    - Kepi tự động lưu ngân hàng này vào danh sách `noAutofillBanks` cục bộ trên máy, lần sau quét sẽ tự động cảnh báo và gợi ý tải ảnh biên lai.
    - Gửi sự kiện telemetry ẩn danh `qr_prefill_reported_no` (Zero PII) để ban phát triển cập nhật danh sách cấu hình từ xa.
  - **Soi ví tức thì (Instant Budget Check):** Cảnh báo đỏ ngay lập tức nếu số tiền quét vượt quá ngân sách chi tiêu còn lại trong ngày.
  - **Chống văng nền (15-min Persistent Session):** Lưu tạm phiên bàn giao dở dang vào storage, bảo toàn modal xác nhận ngay cả khi điện thoại bị hết RAM do app ngân hàng.

- **Tiêu chí thành công đo được (Success Metrics):**
  1. Thời gian quét nhận diện VietQR $\le 1.0$ giây (offline 100%).
  2. Thời gian chuyển giao mở app ngân hàng $\le 1.0$ giây.
  3. 100% ngân hàng trong `noAutofillBanks` được bảo vệ Zero PII (không gửi STK/số tiền qua URL).
  4. 100% phản hồi `[App không điền sẵn?]` được ghi nhận lập tức vào storage cục bộ mà không gây gián đoạn luồng người dùng.

---

## 2. Quy Tắc Nền Tảng Bất Di Bất Dịch (Core Directives)

1. **Tuyệt đối cấm từ ngữ "thanh toán tự động":**
   - Kepi không bao giờ tự ý chuyển tiền hay can thiệp vào tài khoản ngân hàng. Người dùng luôn là người xác nhận và nhập OTP/FaceID cuối cùng trong app ngân hàng chính thức.
2. **Không bao giờ tự mở URL lạ có trong mã QR:**
   - App chỉ tự dựng deeplink tới danh sách scheme/Universal Link ngân hàng hợp lệ đã kiểm duyệt.
   - Nếu mã là đường link web lạ hoặc văn bản thường $\rightarrow$ Không mở bất kỳ trình duyệt nào, chỉ thông báo nhẹ: *"Đây không phải mã chuyển khoản"*.
3. **Không lưu số tài khoản người nhận:**
   - Số tài khoản chỉ nằm trong bộ nhớ RAM tạm thời để hiển thị hoặc tạo deeplink rồi lập tức giải phóng.
   - Không lưu vào Supabase, SQLite, AsyncStorage, log hay analytics.
4. **Khoản chưa xác nhận (PENDING) KHÔNG tính vào số liệu:**
   - Khi vừa quét và chuyển sang app ngân hàng, giao dịch ở trạng thái `status: 'PENDING'`.
   - Khoản PENDING **tuyệt đối không được cộng vào tổng chi, không trừ ngân sách ngày, không tính vào thanh sinh lực HP hay thống kê** cho tới khi người dùng bấm *"Đã chuyển"*.
5. **Đọc mã hoàn toàn Offline:**
   - Bộ giải mã EMVCo QR chạy 100% trên thiết bị, không gửi dữ liệu chuỗi QR lên server hay bên thứ ba.
6. **Bảo mật sự kiện phân tích (Telemetry Zero PII):**
   - Sự kiện `qr_bank_opened` và `qr_prefill_reported_no` chỉ chứa `bank_id`, `platform`, `is_no_autofill`, `was_prefill_attempted`, `has_amount`. Hoàn toàn không chứa số tiền, STK hay tên người nhận.

---

## 3. Wireframe Chữ (ASCII Wireframe)

### 3.1. Thẻ Phát Hiện Ngân Hàng Không Autofill (Techcombank / Vietcombank)
```text
┌────────────────────────────────────────────────────────┐
│ ┌── THẺ THÔNG TIN VIETQR (Trượt lên trên nút chụp) ──┐ │
│ │ 🏦 Techcombank · Cà Phê Trứng Giảng phố Yên Phụ     │ │
│ │ 🏷️ 45.000 đ                     [☕ Ăn uống & Cà phê]│ │
│ ├────────────────────────────────────────────────────┤ │
│ │ ⚠️ Techcombank chưa hỗ trợ điền sẵn. Quét lại mã  │ │
│ │    trong app hoặc chụp màn hình rồi tải lên.        │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ [          Mở Techcombank (Mở app)         ]       │ │ (Nút chính vàng ấm)
│ │ [ 📄 Tải ảnh biên lai lên Kepi ]                   │ │ (Lối tắt Upload)
│ │ [ Chọn ngân hàng khác ]            [ Ghi tay ]     │ │ (Liên kết phụ)
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### 3.2. Thẻ Phát Hiện Ngân Hàng Hỗ Trợ Thử Điền Sẵn (MB, BIDV, ACB, VPB...)
```text
┌────────────────────────────────────────────────────────┐
│ ┌── THẺ THÔNG TIN VIETQR (Trượt lên trên nút chụp) ──┐ │
│ │ 🏦 MB Bank · Bún Chả Hương Liên                    │ │
│ │ 🏷️ 65.000 đ                     [🍜 Ăn uống]       │ │
│ │ 🌿 [Thử điền sẵn] (Cần xác nhận trong MB Bank)     │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ [            Mở MB Bank (Thử điền sẵn)      ]       │ │ (Nút chính)
│ │ [ Chọn ngân hàng khác ]            [ Ghi tay ]     │ │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### 3.3. Thẻ Quay Lại App: "Đã Chuyển Xong Chưa?" Với Lưới An Toàn
```text
┌────────────────────────────────────────────────────────┐
│ ┌── XÁC NHẬN KHOẢN CHUYỂN KHOẢN ─────────────────────┐ │
│ │ Đã chuyển xong chưa?                                │ │
│ │ 🏦 VPBank · 50.000 đ · Trà Đá Bờ Hồ                │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ [   ĐÃ CHUYỂN (Lưu vào sổ ngay)   ]                │ │ (Nút chính)
│ │ [ ❓ App không điền sẵn? ]                         │ │ (Lưới an toàn phản hồi)
### 3.4. Thẻ Phát Hiện Ví Điện Tử (ZaloPay / MoMo)
```text
┌────────────────────────────────────────────────────────┐
│ ┌── THẺ THANH TOÁN VÍ ĐIỆN TỬ ───────────────────────┐ │
│ │ 📱 ZaloPay / MoMo · Thanh toán dịch vụ             │ │
│ │ 🏷️ [ Nhập số tiền hoặc chọn chip 30k, 45k, 60k ]   │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ 💡 Mã QR Ví Điện Tử hợp lệ (Đã kiểm duyệt Whitelist)│ │
│ │    Sẽ mở app ví để bạn thanh toán và lưu PENDING.   │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ [       Mở ZaloPay / Mở MoMo       ]                │ │ (Nút chính xanh/hồng)
│ │ [ Ghi tay vào Kepi ]                [ Bỏ qua ]      │ │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

---

## 4. Cây Component & Props (Component Hierarchy)

```text
<CameraScreen>
  ├── <CameraViewfinder> (Bật barcodeScannerSettings: ['qr'])
  │
  ├── <VietQRDetectedCard> / <PaymentQRDetectedCard> (Thẻ trượt phát hiện mã VietQR hoặc Ví điện tử)
  │     ├── <QrMerchantInfo> (Tên nơi nhận, logo/tên ngân hàng hoặc ví ZaloPay/MoMo)
  │     ├── <QrNoAutofillNotice> (Cảnh báo ngân hàng noAutofill + nút Tải biên lai)
  │     ├── <QrAmountInput> (Hiển thị số tiền hoặc ô nhập nếu mã tĩnh / ví điện tử)
  │     └── <QrActionButtons> (Nút "Mở {Bank/Ví}", chọn ngân hàng khác, ghi tay)
  │
  ├── <PendingReturnPromptModal> (Thẻ "Đã chuyển xong chưa?" khi quay lại app)
  │     ├── <ConfirmPaidButton> (Chuyển PENDING -> CONFIRMED)
  │     ├── <ReportNoAutofillButton> (Nút "[App không điền sẵn?]" -> ghi nhận và học máy)
  │     ├── <CancelPaidButton> (Chuyển PENDING -> CANCELLED)
  │     └── <EditPaidInfoButton> (Chỉnh sửa số tiền/danh mục nếu chưa có)
  │
  └── <PendingBadgeIndicator> (Dải nhỏ "1 khoản chờ xác nhận" ở góc Camera/Home)
```

---

## 5. Ma Trận Trạng Thái (State Matrix)

| Trạng Thái | Điều Kiện Kích Hoạt | Giao Diện Hiển Thị | Hành Vi Hệ Thống |
| :--- | :--- | :--- | :--- |
| **Quét thấy mã Động (noAutofill)** | Ngân hàng thuộc `noAutofillBanks` (TCB, VCB) | Cảnh báo chưa hỗ trợ điền sẵn + Nút "Tải ảnh biên lai" + "Mở {Bank}" | Gọi Minimal Deeplink (`app={appId}`), Zero PII |
| **Quét thấy mã Động (tryAutofill)** | Ngân hàng không thuộc `noAutofillBanks` | Huy hiệu "Thử điền sẵn" + Nút "Mở {Bank}" | Dựng full Universal Link `dl.vietqr.io` |
| **Quét thấy mã Ví ZaloPay/MoMo** | Mã chứa link Whitelist ZaloPay/MoMo | Thẻ Ví Điện Tử + Ô nhập tiền/chip giá + Nút "Mở ZaloPay/MoMo" | Mở URL Whitelist/Scheme, tạo PENDING `E_WALLET`, Zero PII |
| **Bấm "[App không điền sẵn?]"** | Người dùng bấm trên modal xác nhận | Màn hình cảm ơn: Đã ghi nhận và tối ưu lần sau | Lưu ngân hàng vào `noAutofillBanks` trên máy + Gửi telemetry Zero PII |
| **Mở app ngân hàng / ví** | Bấm nút chuyển / mở ví | Tạo bản ghi PENDING, kích hoạt deeplink | Chuyển sang app thanh toán xác nhận |
| **Quay lại app Locket** | App chuyển về trạng thái `active` và có PENDING | Thẻ *"Đã chuyển/thanh toán xong chưa?"* | Bấm "Đã chuyển" $\rightarrow$ Lưu vào sổ |

---

## 6. Tiêu Chí Nghiệm Thu (Acceptance Criteria — Đo Được)

1. [x] Đọc mã VietQR chuẩn trong $\le 1.0$ giây, rung haptic nhẹ, hiện thẻ thông tin không che nút chụp.
2. [x] Hỗ trợ mở rộng 37 ngân hàng theo chuẩn `ios-app-deeplinks.json` / `android-app-deeplinks.json`.
3. [x] Minimal Handoff cho TCB và VCB (hoặc khi tắt prefill) đảm bảo ZERO PII trên deeplink URL.
4. [x] Nhận diện mã Ví Điện Tử ZaloPay và MoMo qua bộ lọc Whitelist Domain an toàn, chặn hoàn toàn domain lạ ngoài danh sách.
5. [x] Mở app ZaloPay / MoMo qua Universal Link/Scheme mượt mà, tự động tạo bản ghi `PENDING` (nguồn `E_WALLET`) vào Hộp xác nhận.
6. [x] Nhãn nút hành động là `"Mở {Tên ngân hàng/Ví}"`, không cam kết điền sẵn 100%.
7. [x] Nút `[App không điền sẵn?]` hoạt động mượt mà, lưu vào bộ nhớ máy và gửi telemetry ẩn danh.
8. [x] Giao dịch chỉ được lưu thành `CONFIRMED` khi người dùng bấm "Đã chuyển/thanh toán". Khoản `PENDING` tuyệt đối không lọt vào số dư hay thống kê.
9. [x] Không lưu số tài khoản nhận vào CSDL, AsyncStorage, log hay analytics.
10. [x] Đạt chuẩn 0 error, 0 warning khi chạy `npx tsc --noEmit` và 100% pass trên `node run-all-tests.js`.
