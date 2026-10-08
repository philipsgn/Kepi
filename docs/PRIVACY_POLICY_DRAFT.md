# BẢN NHÁP CHÍNH SÁCH QUYỀN RIÊNG TƯ & VĂN BẢN XIN QUYỀN (PRIVACY_POLICY_DRAFT.MD)

> **Mã tài liệu:** `PRIVACY_POLICY_DRAFT`  
> **Phiên bản:** 1.0 (Bản nháp cho App Store Review & Người dùng cuối)  
> **Áp dụng cho:** Ứng dụng Ví Locket

---

## 1. Văn Bản Xin Quyền Thiết Bị (Device Permission Strings)

### 1.1. Quyền Máy Ảnh (Camera Usage Description - iOS & Android)
- **Chuỗi hiển thị trên iOS (`NSCameraUsageDescription` trong `app.json`):**
  > *"Ví Locket sử dụng Camera để bạn chụp lại ảnh món đồ chi tiêu làm kỷ niệm trong sổ ảnh và quét nhanh mã VietQR chuyển khoản mà không cần gõ lại."*
- **Nguyên tắc kỹ thuật:**
  - Chỉ kích hoạt camera khi người dùng đang ở tab Camera.
  - Tự động tạm dừng stream camera khi cuộn xuống xem Lịch sử hoặc chuyển sang tab khác để bảo vệ quyền riêng tư và tiết kiệm pin.

### 1.2. Quyền Micro (Microphone Usage Description)
- **Chuỗi hiển thị trên iOS (`NSMicrophoneUsageDescription`):**
  > *"Ví Locket cần quyền Micro để bạn có thể nhấn giữ và nói nhanh giá tiền món đồ vừa chi tiêu."*

### 1.3. Quyền Thư Viện Ảnh (Photo Library) & Bộ Nhớ Tạm (Clipboard)
- **Cam kết & Kiểm soát:**
  - Tính năng Quét VietQR của Ví Locket **hoàn toàn KHÔNG yêu cầu quyền đọc toàn bộ Thư viện ảnh** và **KHÔNG quét ngầm toàn bộ album ảnh** của bạn.
  - Khi người dùng tải ảnh biên lai chuyển tiền hoặc ảnh món đồ kỷ niệm, ứng dụng chỉ kích hoạt Bộ chọn ảnh tiêu chuẩn của hệ điều hành (`expo-image-picker`) cho duy nhất bức ảnh mà bạn chủ động chọn.
  - **Bộ nhớ tạm (Clipboard):** Ứng dụng **tuyệt đối KHÔNG tự ý sao chép số tài khoản** vào bộ nhớ tạm khi mở app ngân hàng. Thao tác sao chép chỉ diễn ra khi bạn chủ động chạm vào các nút sao chép riêng lẻ ("Sao chép STK", "Sao chép số tiền"...) hoặc khi bạn chủ động bật tính năng này trong phần Cài đặt.

---

## 2. Bản Nháp Chính Sách Quyền Riêng Tư (Privacy Policy Draft)

### 2.1. Tôn Chỉ Bảo Mật Dữ Liệu
Ví Locket được thiết kế theo triết lý **bảo vệ quyền riêng tư tối đa (Privacy by Design)**. Chúng tôi tôn trọng tuyệt đối dữ liệu tài chính cá nhân của bạn:

1. **Không xử lý thanh toán, không giữ tiền:**
   - Ứng dụng Ví Locket **không phải là trung gian thanh toán, không liên kết tài khoản ngân hàng, không giữ tiền của người dùng**. 
   - Ứng dụng chỉ hỗ trợ trích xuất thông tin chuyển khoản từ mã VietQR để **mở ứng dụng ngân hàng chính thức** mà bạn đã cài đặt trên điện thoại.
   - Mọi thao tác xác thực giao dịch (Face ID, mật khẩu, mã OTP) đều diễn ra hoàn toàn bên trong ứng dụng ngân hàng an toàn của bạn.
2. **Không đọc tin nhắn SMS và thông báo hệ thống:**
   - Ví Locket không yêu cầu, không đọc và không truy cập vào tin nhắn SMS hay thông báo biến động số dư từ ngân hàng.
3. **Tuyệt đối không lưu trữ số tài khoản thụ hưởng:**
   - Khi bạn quét mã VietQR, số tài khoản của người nhận tiền chỉ tồn tại tạm thời trong bộ nhớ ngắn hạn (RAM) của máy để chuyển giao thông tin sang ứng dụng ngân hàng, sau đó bị xóa ngay lập tức.
   - Số tài khoản thụ hưởng **hoàn toàn không được lưu trữ** vào cơ sở dữ liệu của chúng tôi, không được sao lưu, không xuất hiện trong nhật ký hệ thống (logs) hay báo cáo phân tích.
4. **Giải mã mã QR ngoại tuyến (100% On-device):**
   - Bộ giải mã mã QR hoạt động cục bộ trên thiết bị của bạn mà không gửi hình ảnh hoặc chuỗi mã lên bất kỳ máy chủ bên ngoài nào.
5. **Dữ liệu phân tích ẩn danh (Zero PII Analytics):**
   - Chúng tôi không thu thập số tiền giao dịch, tên người nhận hay bất kỳ thông tin định danh tài chính nào trong các sự kiện phân tích hành vi sử dụng.
6. **Quyền làm chủ dữ liệu của người dùng:**
   - Bạn có toàn quyền xóa bất kỳ giao dịch nào hoặc sử dụng tính năng **Xóa toàn bộ dữ liệu** bất kỳ lúc nào ngay trong phần Cài đặt của ứng dụng.

---

## 3. Nhãn Quyền Riêng Tư App Store (App Store Privacy Nutrition Labels)

- **Dữ liệu liên kết với bạn (Data Linked to You):**
  - Không có. (Ở bản đầu dùng ID thiết bị ẩn danh).
- **Dữ liệu được sử dụng để theo dõi bạn (Data Used to Track You):**
  - Không thu thập dữ liệu theo dõi qua các ứng dụng khác.
- **Dữ liệu được thu thập (Data Collected):**
  - *Hình ảnh/Video (Photos):* Chỉ thu thập ảnh do chính bạn chụp hoặc chọn để gắn vào khoản chi tiêu trong sổ cá nhân của bạn.
  - *Chẩn đoán & Hiệu năng (Diagnostics):* Dữ liệu lỗi crash ứng dụng ẩn danh để cải thiện độ ổn định.
