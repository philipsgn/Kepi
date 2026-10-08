# KẾ HOẠCH TRIỂN KHAI: BẢN VÁ CHIẾN LƯỢC CHUYỂN GIAO 3 TẦNG APP NGÂN HÀNG (VIETQR)

> **Mã kế hoạch:** `PLAN_VIETQR_TIER_STRATEGY_PATCH`  
> **Căn cứ:** Quyết định phê duyệt qua `/grill-me` và yêu cầu tại Bản vá chiến lược chuyển giao.

---

## 1. Mục Tiêu & Nguyên Tắc Cốt Lõi

1. **Minh bạch & Thực tế:** Không hứa hẹn tự điền trên các app chưa đo thực tế; Techcombank và các ngân hàng chưa có autofill xếp vào **Tầng 2**.
2. **Giải pháp Tầng 2 thông minh:** Dựng ảnh QR SẠCH từ chuỗi EMV → Lưu vào Thư viện Ảnh (Photos) → Mở app ngân hàng qua native scheme (`tcb://`) 100% offline → Người dùng chọn ảnh trong app ngân hàng để quét tự động.
3. **Quyền riêng tư & Bảo mật dữ liệu:**
   - Tuyệt đối **KHÔNG** tự động sao chép bất cứ thông tin nào vào Clipboard. Chỉ sao chép khi người dùng chủ động chạm nút.
   - Ảnh QR lưu vào Thư viện được tự động xóa sau khi bấm "Đã chuyển" (có công tắc bật/tắt trong Cài đặt, mặc định BẬT).
   - Tên file ảnh QR không chứa số tài khoản hay tên người nhận.
4. **Độc lập & Dự phòng (Tầng 3):** Luôn có nút "Tự mở app ngân hàng" để tạo giao dịch PENDING một chạm mà không ép buộc mở app.

---

## 2. Các Bước Thực Hiện Chi Tiết

### Bước 1: Cài đặt Thư viện Phụ trợ
- Cài đặt `expo-media-library` (quản trị quyền lưu ảnh `writeOnly` và xóa asset ảnh tạm).
- Cài đặt `react-native-qrcode-svg` (dựng ảnh QR vector sạch chuẩn độ phân giải cao từ chuỗi EMV raw).
- Khai báo quyền `NSPhotoLibraryAddUsageDescription` trong `app.json`.

### Bước 2: Xây dựng Module Xử lý QR Clean Image & Photo Library (`src/utils/qr/qrImageSaver.ts`)
- Tạo hàm sinh ảnh QR base64 sạch từ chuỗi EMVCo TLV.
- Tạo hàm lưu ảnh vào Thư viện Ảnh (yêu cầu quyền write-only đúng lúc).
- Tạo hàm dọn dẹp / xóa ảnh QR tạm (`deleteAssetsAsync`) sau khi người dùng xác nhận giao dịch.

### Bước 3: Cập nhật Bảng Năng Lực Ngân Hàng (`src/utils/qr/bankDeeplink.ts`)
- Phân loại rõ ràng 3 Tầng (`tier: 1 | 2 | 3`).
- Techcombank, Vietcombank, VPBank, TPBank... mặc định xếp vào Tầng 2 (`nativeScheme: 'tcb://'`, `tier: 2`).
- Chỉ kích hoạt Tầng 1 cho ngân hàng đã đo thật trên máy (hiện tại chưa ngân hàng nào đo thật nên mặc định an toàn là Tầng 2 hoặc 3).

### Bước 4: Nâng cấp Giao diện Thẻ Quét QR (`src/components/camera/VietQRDetectedCard.tsx`)
- Hiển thị theo Tầng:
  - Nếu là Tầng 2 (Techcombank):
    - Hộp hướng dẫn 3 bước ngắn: *"Mở app → Quét mã → Chọn ảnh vừa lưu"*.
    - Nút bấm chính 1 chạm: **"Lưu mã & Mở [Tên app]"**.
    - Các nút sao chép độc lập: `[Sao chép số tiền]`, `[Sao chép nội dung]`, `[Sao chép STK (Chỉ dùng khi cần)]`.
    - Nút chuyển Tầng 3: *"Tự mở app ngân hàng"* (chỉ ghi nhận PENDING, không mở app).
- Bỏ hoàn toàn logic tự động sao chép clipboard lúc mở app.

### Bước 5: Cập nhật Cài đặt & Quản lý Xóa Ảnh (`src/components/profile/QRPaySettingsCard.tsx`)
- Thêm tùy chọn: *"Tự động xóa ảnh mã QR sau khi chuyển"* (mặc định BẬT) lưu vào AsyncStorage / store.

### Bước 6: Cập nhật Tài liệu Dự án
- `docs/qr/BANK_DEEPLINK_MATRIX.md`: Cập nhật bảng sự thật đã kiểm chứng, đính kèm nguồn và ngày kiểm tra (04/10/2026), loại bỏ các nhận định chưa kiểm chứng về NHNN.
- `docs/features/QR_PAY.md`: Cập nhật luồng 3 Tầng chi tiết.

### Bước 7: Kiểm Thử & Nghiệm Thu
- Chạy unit tests cho các module QR.
- Kiểm tra TypeScript (`npm run lint`).
- Kiểm tra chạy thực tế trên máy iPhone với Techcombank Mobile.
