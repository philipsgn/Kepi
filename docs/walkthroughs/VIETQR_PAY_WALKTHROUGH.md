# 🍂 WALKTHROUGH BÁO CÁO: HOÀN THÀNH TÍNH NĂNG "QUÉT MÃ CHUYỂN KHOẢN (VIETQR)" VÀO CAMERA

> **Dự án:** Ví Locket — Mobile App Chi Tiêu Bằng Ảnh & Giọng Nói  
> **Trạng thái:** HOÀN THÀNH 100% (Giai đoạn A $\rightarrow$ S $\rightarrow$ B $\rightarrow$ C $\rightarrow$ D)  
> **Kiểm thử tự động:** **9/9 test suites (69/69 unit tests PASS 100%)**  
> **Chất lượng mã nguồn:** `npm run lint` đạt **0 lỗi, 0 cảnh báo**

---

### 1. Tóm Tắt Các Hạng Mục Đã Hoàn Thành

#### Giai đoạn A: Tài Liệu & Đặc Tả (Đã Được Duyệt)
- [x] Lập đặc tả tính năng chuẩn: [docs/features/QR_PAY.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/features/QR_PAY.md).
- [x] Lập đặc tả bộ giải mã EMVCo VietQR/NAPAS: [docs/qr/EMV_PARSER_SPEC.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/qr/EMV_PARSER_SPEC.md).
- [x] Khởi tạo ma trận ngân hàng: [docs/qr/BANK_DEEPLINK_MATRIX.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/qr/BANK_DEEPLINK_MATRIX.md).
- [x] Cập nhật toàn diện: [docs/PAGES_FEATURES.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/PAGES_FEATURES.md), [docs/TECH_ARCHITECTURE.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/TECH_ARCHITECTURE.md), [docs/DECISIONS.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/DECISIONS.md), [docs/ROADMAP.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/ROADMAP.md), [docs/PRIVACY_POLICY_DRAFT.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/PRIVACY_POLICY_DRAFT.md).

#### Giai đoạn S: Thử Nghiệm Trên Máy Thật (iPhone)
- [x] Dựng màn hình thử nghiệm `QRDeeplinkTestModal` trong Cài đặt nhanh.
- [x] Xác nhận thực tế trên iPhone với **Techcombank Mobile**: App mở trực tiếp thành công, app mở ra Trang chủ (khớp chuẩn `autofill: 0` của VietQR).
- [x] Kích hoạt **Phương án dự phòng 7.5**: Tự động sao chép số tiền & nội dung vào bộ nhớ tạm (clipboard) để người dùng dán nhanh, đồng thời tạo bản ghi `PENDING` phục vụ hỏi xác nhận khi quay lại.

#### Giai đoạn B: Cài Đặt Hoàn Thiện
- [x] **Nhận diện Barcode trong Camera:** Bật tự động ở chế độ `Chi` và `Định mua`, chống quét trùng lặp trong 3 giây.
- [x] **Thẻ VietQR nổi trên nút chụp:** [VietQRDetectedCard.tsx](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/src/components/camera/VietQRDetectedCard.tsx) với giao diện ấm ngà / xám xanh, hiển thị nơi nhận, số tiền, gợi ý danh mục từ mã ngành MCC.
- [x] **Mã tĩnh:** Tích hợp ô nhập số tiền trực tiếp trước khi mở app ngân hàng.
- [x] **Chế độ Định mua:** Khoản chi $\ge 200.000$ đ tự động kích hoạt màn "Giá thật trước khi trả".
- [x] **Thẻ hỏi khi quay lại:** [PendingReturnPromptModal.tsx](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/src/components/camera/PendingReturnPromptModal.tsx) bắt sự kiện `AppState` quay lại từ app ngân hàng $\rightarrow$ Hỏi *"Đã chuyển xong chưa?"* $\rightarrow$ Xác nhận hoặc cho phép sửa số tiền $\rightarrow$ Gợi ý chụp thêm ảnh món đồ làm kỷ niệm trong sổ ảnh Locket.
- [x] **Cài đặt Hồ sơ:** [QRPaySettingsCard.tsx](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/src/components/profile/QRPaySettingsCard.tsx) cho phép tùy chỉnh ngân hàng mặc định, ngưỡng Giá thật, tự mở app và nhắc nhở.
- [x] **Migration CSDL an toàn:** [002_vietqr_status_and_metadata.sql](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/supabase/migrations/002_vietqr_status_and_metadata.sql) với transaction, ràng buộc Check Constraint và script hoàn tác sẵn sàng.

#### Giai đoạn C: Kiểm Chứng & Bảo Mật
- [x] **9/9 test suites (69/69 tests PASS 100%):**
  1. `qrUtils.test.ts`: Bộ giải mã EMVCo, kiểm tra CRC-16 CCITT, xử lý ký tự tiếng Việt có dấu UTF-8, ánh xạ MCC và dựng link Deeplink.
  2. `pendingIsolation.test.ts`: Đảm bảo 100% khoản PENDING và CANCELLED không lọt vào số dư, ngân sách ngày hôm nay hay lịch thống kê.
- [x] **Bảo mật tuyệt đối (Zero-Knowledge):** Không bao giờ lưu số tài khoản người nhận vào CSDL, logs, state lưu bền hay analytics.

---

### 2. Danh Sách Các File Đã Thay Đổi & Tạo Mới

| Phân loại | Tên File | Mô tả vai trò |
| :--- | :--- | :--- |
| **Đặc tả & Ma trận** | `docs/features/QR_PAY.md`<br>`docs/qr/EMV_PARSER_SPEC.md`<br>`docs/qr/BANK_DEEPLINK_MATRIX.md` | Tài liệu đặc tả chức năng, giải mã EMVCo và ma trận thử nghiệm ngân hàng. |
| **Quy định & Lộ trình** | `docs/PAGES_FEATURES.md`<br>`docs/TECH_ARCHITECTURE.md`<br>`docs/DECISIONS.md`<br>`docs/ROADMAP.md`<br>`docs/PRIVACY_POLICY_DRAFT.md` | Cập nhật luồng xuyên trang, kiến trúc phân hệ, 12 quyết định và văn bản chính sách bảo mật. |
| **Bộ giải mã & Deeplink** | `src/utils/qr/crc16.ts`<br>`src/utils/qr/emvParser.ts`<br>`src/utils/qr/bankDeeplink.ts` | Giải mã TLV offline, kiểm tra CRC-16, phân loại ngành MCC, dựng link VietQR và native scheme. |
| **CSDL & Đồng bộ** | `supabase/migrations/002_vietqr_status_and_metadata.sql`<br>`src/types/database.ts`<br>`src/store/transactionStore.ts`<br>`src/services/offlineSync.ts`<br>`src/utils/statsUtils.ts` | Bổ sung `status`, `payee_name`, `bank_bin`, `qr_kind` và cách ly hoàn toàn phép tính ngân sách. |
| **Giao diện & Cử chỉ** | `src/hooks/useVietQRScanner.ts`<br>`src/components/camera/VietQRDetectedCard.tsx`<br>`src/components/camera/PendingReturnPromptModal.tsx`<br>`src/components/profile/QRPaySettingsCard.tsx`<br>`src/components/dev/QRDeeplinkTestModal.tsx`<br>`app/(main)/index.tsx`<br>`app.json` | Tích hợp quét barcode vào CameraView, thẻ trượt Polaroid, modal hỏi xác nhận khi quay lại và cài đặt Hồ sơ. |
| **Kiểm thử tự động** | `src/utils/__tests__/qrUtils.test.ts`<br>`src/utils/__tests__/pendingIsolation.test.ts` | Test suite kiểm chứng toàn diện bộ giải mã và cách ly dữ liệu. |
| **Tiến độ** | `work/CURRENT_TASK.md` | Bảng tổng kết kết quả nghiệm thu (21 dòng $\le 30$ dòng). |
