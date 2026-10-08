# CHÍNH SÁCH QUYỀN RIÊNG TƯ & BẢO MẬT DỮ LIỆU (PRIVACY.MD)

> **Dự án:** Kepi (Ví Locket) — Mobile App Chi Tiêu Bằng Ảnh & Quét Mã QR  
> **Phiên bản:** 1.3 (Cam kết Minimal Handoff & Zero PII Telemetry cho QR Pay)  
> **Cam kết cốt lõi:** Không lưu trữ số tài khoản ngân hàng người nhận; không yêu cầu quyền Microphone; bảo vệ Zero PII trên Universal Link cho ngân hàng không hỗ trợ tự điền; toàn bộ dữ liệu phân tích không chứa thông tin định danh hay số tiền giao dịch cụ thể.

---

## 1. NGUYÊN TẮC THU THẬP DỮ LIỆU & BẢO MẬT

### 1.1. Không Lưu Số Tài Khoản Ngân Hàng (Account Numbers)
- Khi người dùng quét mã VietQR hoặc tải ảnh biên lai:
  - **Mã VietQR:** Chỉ dùng số tài khoản/BIN ngân hàng để tạo deeplink mở app ngân hàng hoặc hiển thị trên thẻ xác nhận tạm thời trong RAM. **Không bao giờ lưu STK vào CSDL Supabase, SQLite, AsyncStorage hay file log.**
  - **Ảnh biên lai (Receipt Screenshots):** Ứng dụng **hoàn toàn không OCR hay dùng AI để trích xuất STK**. Người dùng tự nhập số tiền và danh mục.

### 1.2. Không Thu Thập Giọng Nói & Không Yêu Cầu Quyền Microphone (Zero Microphone Usage)
- Ứng dụng Kepi **hoàn toàn không yêu cầu quyền Microphone** (`RECORD_AUDIO` trên Android / `NSMicrophoneUsageDescription` trên iOS).
- Không thực hiện bất kỳ thao tác thu âm giọng nói hay truyền âm thanh qua mạng, đảm bảo không có rủi ro nghe lén hay vi phạm quyền riêng tư âm thanh người dùng.

### 1.3. Nơi Lưu Trữ Ảnh Giao Dịch & Mã Hóa
1. **Lưu trữ trên thiết bị (Local Device):**
   - Ảnh chụp món đồ hoặc ảnh biên lai được lưu tại thư mục Document Directory của ứng dụng (`expo-file-system`).
   - Trước khi lưu, ứng dụng tự động **xóa sạch toàn bộ siêu dữ liệu EXIF** (tọa độ GPS, loại thiết bị, thông số máy ảnh) thông qua `expo-image-manipulator`.
2. **Lưu trữ đám mây (Cloud Storage - Private Bucket):**
   - Nếu người dùng đăng nhập tài khoản Supabase: Ảnh được đồng bộ lên Supabase Storage trong Bucket riêng tư (`expense_photos`).
   - Bucket được phân quyền Row Level Security (RLS), chỉ duy nhất chủ tài khoản (`auth.uid() = user_id`) mới có quyền đọc/ghi.
   - Dữ liệu trên cloud được mã hóa ở trạng thái nghỉ (Encryption at Rest - AES-256).
3. **Quyền riêng tư hiển thị (Privacy Mode - "Ẩn tiền"):**
   - Khi bật chế độ Ẩn tiền trong Cài đặt, toàn bộ ảnh biên lai và thumbnail trong Hộp xác nhận và Sổ chi tiêu sẽ được **tự động làm mờ (`blurRadius={16}`)** để tránh bị nhìn trộm nơi công cộng.
4. **Công tắc "Lưu ảnh kèm khoản":**
   - Người dùng có toàn quyền tắt công tắc này trong sheet ghi nhanh nếu không muốn lưu ảnh biên lai vào bộ nhớ máy.

### 1.4. Cam Kết Minimal Handoff Cho Ngân Hàng Không Tự Điền (Minimal Handoff Zero-PII)
- Đối với các ngân hàng thuộc danh sách `noAutofillBanks` (mặc định gồm Techcombank Mobile, Vietcombank Digibank hoặc ngân hàng do người dùng đánh dấu không tự điền) hoặc khi người dùng tắt tùy chọn "Điền sẵn khi trả" trong Hồ Sơ:
  - Đường link gọi mở app ngân hàng chỉ truyền **duy nhất mã định danh ứng dụng** (`https://dl.vietqr.io/pay?app={appId}`).
  - **Hoàn toàn KHÔNG truyền:** Số tài khoản người nhận (`ba`), số tiền giao dịch (`am`), tên người nhận (`bn`), nội dung chuyển tiền (`tn`).
  - Đảm bảo 100% không rò rỉ dữ liệu tài chính của người dùng qua đường dẫn mạng hay bên trung gian khi mở app ngân hàng.

---

## 2. QUY CHUẨN ĐO LƯỜNG & SỰ KIỆN PHÂN TÍCH (TELEMETRY)

Toàn bộ sự kiện phân tích được quản lý tại [src/services/analytics.ts](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/src/services/analytics.ts):

| Tên sự kiện | Ý nghĩa đo lường | Dữ liệu thuộc tính đi kèm (Đã làm sạch — Zero PII) |
| :--- | :--- | :--- |
| `upload_tapped` | Người dùng bấm nút Tải ảnh | Không có |
| `upload_images_selected` | Số lượng ảnh người dùng đã chọn từ thư viện | `count: number` |
| `receipt_saved` | Lưu thành công giao dịch từ biên lai | `has_photo: boolean, type: string, category: string, duration_ms: number` |
| `receipt_dismissed` | Người dùng đóng sheet mà không lưu | `duration_ms: number` |
| `duplicate_warned` | Cảnh báo trùng khoản chi được kích hoạt | `triggered: boolean` |
| `time_to_save` | Thời gian từ lúc mở sheet đến khi bấm lưu | `duration_ms: number` |
| `inbox_opened` | Mở màn hình Hộp xác nhận | `total_items: number` |
| `inbox_item_confirmed` | Xác nhận khoản chờ trong hộp | `item_type: string, source: string, category: string` |
| `inbox_item_dismissed` | Bỏ qua khoản chờ trong hộp | `item_type: string, source: string` |
| `inbox_undo_tapped` | Bấm hoàn tác 5 giây | `action_type: string, source: string` |
| `qr_bank_opened` | Người dùng bấm mở app ngân hàng từ thẻ VietQR | `bank_id: string, platform: string, is_no_autofill: boolean, was_prefill_attempted: boolean, has_amount: boolean` |
| `qr_prefill_reported_no` | Người dùng bấm báo cáo app không tự điền sẵn | `bank_id: string, platform: string` |

> ⚠️ **Quy tắc bất di bất dịch:** Toàn bộ thuộc tính chứa `account`, `stk`, `payee`, `name`, `amount`, `money` đều bị hàm `sanitize` loại bỏ tự động trước khi ghi nhận.

---

## 3. NƠI CHỦ DỰ ÁN XEM ĐƯỢC SỰ KIỆN ĐO LƯỜNG

1. **Trong môi trường phát triển (Development):** Console terminal hiển thị tiền tố `[ANALYTICS] <event_name> { ...props }`.
2. **Trong mã nguồn ứng dụng:** Gọi hàm `getAnalyticsLog()` hoặc `calculateAbandonRate()` từ [src/services/analytics.ts](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/src/services/analytics.ts) để xuất danh sách sự kiện và tính tỉ lệ bỏ cuộc.
3. **Trên Supabase Backend (Production):** Các sự kiện được đẩy vào bảng `analytics_events` (không chứa PII) để theo dõi qua Supabase Dashboard.
