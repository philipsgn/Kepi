# KẾ HOẠCH TRIỂN KHAI: NÂNG CẤP PRODUCTION (ANDROID FIRST) — 0$ COST & BẢO MẬT TỐI ĐA

> **Trạng thái:** ĐANG THỰC HIỆN  
> **Thời gian bắt đầu:** 17/10/2026  
> **Các quyết định đã chốt với Chủ dự án:**
> 1. Giữ nguyên 5 Tab trên thanh điều hướng chính (`Home`, `Stats`, `Camera`, `Chat`, `Profile`). Tab Chat (Anh Minh AI) hiển thị trên thanh bar.
> 2. Loại bỏ hoàn toàn tính năng & giao diện "Hình thức thanh toán" (Tiền mặt / Bank / Ví) để tối giản thời gian ghi chép $\le 3$s.
> 3. Tối ưu chi phí về 0$: Vận hành Local-First, ảnh lưu cục bộ, gói Supabase Free Tier, sao lưu file ZIP kèm ảnh trực tiếp trên máy người dùng, không tốn chi phí máy chủ hàng tháng.
> 4. Bảo mật tuyệt đối: Không lưu STK, số dư, PII; bóc tách thông báo 100% trên thiết bị bằng NotificationListenerService (tùy chọn bật/tắt).
> 5. Cấu hình Supabase đã được thiết lập qua `eas.json` và đồng bộ vào `.env`.

---

## 1. PHÂN CÔNG 4 SUBAGENT & THỨ TỰ THỰC THI

### Phase 1: Dọn dẹp Giá Trị Cứng & Loại Bỏ "Hình Thức Thanh Toán" (Foundation Cleanup)
- [ ] Gỡ bỏ "Hình thức thanh toán" (Tiền mặt/Bank/Ví) khỏi `ConfirmationSheet.tsx`, `FastCategorySheet.tsx`, v.v.
- [ ] Gỡ bỏ các chuỗi cứng: "14 Ngày Liên Tiếp", "Người thương phố cổ", định mức "100.000đ/ngày", đơn vị "ly trà sữa 35k".
- [ ] Gỡ bỏ hoàn toàn logic lọc seed-user (`seed-user`, `tx-seed-`) trong production code.
- [ ] Tạo file `.env` từ thông số Supabase trong `eas.json`.

### Phase 2: SubAgent 1 (UI/UX) — Thiết Kế 3 Theme & Icon Vector Nổi Trần
- [ ] Xây dựng bộ token 3 Theme: (1) Vàng kem bơ (Cream), (2) Tối mint đậm (Dark Mint), (3) Mát mẻ xanh mint & pastel (Fresh Blue-Mint).
- [ ] Đảm bảo 100% icon vector nổi trần không viền bo (`lucide-react-native`, `strokeWidth: 2.4 - 2.8`).
- [ ] Báo cáo kiểm tra độ tương phản WCAG 2.1 AA cho cả 3 theme.
- [ ] Tạo màn hình Component Gallery (trong `__DEV__`) xem trước 3 theme.

### Phase 3: SubAgent 2 (Backend) — Migration Bảng Categories & RLS Đa Người Dùng
- [ ] Tạo file migration `005_categories_and_sync.sql` bổ sung bảng `categories`, kích hoạt Row Level Security (RLS).
- [ ] Viết RPC hoặc Postgres Function hỗ trợ tự động tính toán tổng hợp ngày/tháng tập trung theo múi giờ `Asia/Ho_Chi_Minh`.
- [ ] Đảm bảo chính sách bảo mật: Người dùng A tuyệt đối không truy cập được dữ liệu của Người dùng B.
- [ ] Tài liệu API Contract, Idempotency key chống trùng giao dịch.

### Phase 4: SubAgent 3 (Frontend & Android) — Android Service, Onboarding & Sao Lưu ZIP 0$
- [ ] Tích hợp Android Native Plugin cho `NotificationListenerService` (chạy nền, opt-in, 100% on-device).
- [ ] Xây dựng giải pháp sao lưu ZIP: Đóng gói JSON + toàn bộ ảnh thật vào 1 file `.zip` lưu trữ cục bộ, hỗ trợ giải nén khôi phục 100% ảnh khi xóa app.
- [ ] Tích hợp bộ chuyển đổi 3 Theme trong màn hình Cài đặt / Profile.
- [ ] Luồng Onboarding từ số 0 cho người dùng mới hoàn toàn sạch dữ liệu.

### Phase 5: SubAgent 4 (Tester) — Kiểm Thử E2E, Tải & Bảo Mật Khách Hàng
- [ ] Kiểm thử E2E: Quét QR VietQR (mã tĩnh, mã động, lỗi CRC), kiểm tra cảnh báo deeplink Techcombank, VCB...
- [ ] Kiểm thử Thông báo ngân hàng: Đẩy thông báo mẫu từ VCB, MB, TCB, ACB; kiểm tra tốc độ bóc tách và khớp giao dịch.
- [ ] Kiểm thử Sao lưu & Khôi phục: Xóa app, cài lại, nhập file ZIP và kiểm chứng 100% ảnh hiển thị đầy đủ.
- [ ] Kiểm thử cô lập dữ liệu: 2 tài khoản khác nhau không nhìn thấy dữ liệu của nhau.
- [ ] Kiểm tra bảo mật: Quét toàn bộ log và SQLite/AsyncStorage khẳng định KHÔNG lưu STK hay số dư.
