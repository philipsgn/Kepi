# KẾT QUẢ TRIỂN KHAI: BẢN VÁ 2 — SỬA SAU ĐÁNH GIÁ BÁO CÁO TẦNG 2

## 1. Kết Quả Nghiệm Thu (8/8 Yêu Cầu Bản Vá 2 Hoàn Tất)
- [x] **Mục 1 (Scheme & Lỗi mở):** `tcb` và `techcombank` trong `LSApplicationQueriesSchemes`. Mở thất bại hiển thị thông báo rõ ràng *"Không mở được app ngân hàng. Mở thủ công nhé."* và vẫn duy trì giao dịch `PENDING` để xác nhận khi quay lại.
- [x] **Mục 2 (Album riêng & Dọn dẹp):** Lưu vào album riêng `"Ví Locket QR"`; sau khi bấm "Đã chuyển" hiện hộp thoại hỏi dọn dẹp ảnh có giải thích hộp thoại hệ thống của iOS và ảnh có thể nằm trong "Đã xóa gần đây".
- [x] **Mục 3 (Quyền riêng tư & Cảnh báo):** Dòng chú thích minh bạch trên thẻ Quét QR về STK; tùy chọn bật/tắt Tầng 2 trong Cài đặt (`enablePhotoSave`); cập nhật `docs/PRIVACY_POLICY_DRAFT.md`.
- [x] **Mục 4 (Mã dựng lại):** Dùng chuỗi EMV gốc nguyên văn (`payload.raw`), `quietZone={24}` (tối thiểu 4 modules theo ISO/IEC 18004), vector nét cao `size={512}`; test tính toàn vẹn chuỗi QR đạt PASS 100%.
- [x] **Mục 5 (Quyền chỉ-thêm):** Cấu hình `NSPhotoLibraryAddUsageDescription` chi tiết và plugin `expo-media-library`.
- [x] **Mục 6 (Bảng năng lực & Phân tích):** Module `src/services/bankCapabilityService.ts` hỗ trợ bảng ghi đè, công tắc tắt từ xa, làm mới theo ngày, và lưu sự kiện phân tích bảo vệ quyền riêng tư (zero PII, không lưu STK/số tiền).
- [x] **Mục 7 (Build riêng):** Cấu hình `app.json` sẵn sàng cho Development Build / TestFlight.
- [x] **Mục 8 (Báo cáo minh bạch):** Tài liệu `docs/qr/BANK_DEEPLINK_MATRIX.md` phân tách rõ ràng 2 bảng: "Đã kiểm chứng trên máy thật" (Techcombank) và "Chưa kiểm chứng trên máy thật" (các ngân hàng còn lại).

## 2. Kết Quả Kiểm Thử Kỹ Thuật
- **Kiểm thử tự động:** 9/9 test suites, 71/71 tests PASS 100%.
- **Kiểm tra cú pháp & kiểu dữ liệu:** `npm run lint` (`tsc --noEmit`) 0 error, 0 warning.
