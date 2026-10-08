# KẾ HOẠCH TRIỂN KHAI TỔNG THỂ (PROJECT MASTER PLAN) — VÍ LOCKET M0

---

## 1. MỤC TIÊU CHIẾN LƯỢC CỦA M0

Giai đoạn **M0 (Core Solo Experience)** có sứ mệnh duy nhất:
> **Kiểm chứng xem việc "Chụp món đồ + Nói giá trong 3 giây" và "Thẻ Phán Quyết + Giỏ chờ dồn dập" có thực sự khiến người dùng Gen Z thay đổi quyết định chi tiêu và tạo thói quen ghi sổ mỗi ngày hay không.**

Nếu người dùng không thấy vui và không cứu được tiền ở M0, việc phát triển tính năng Bạn bè (M2) hay Widget (M3) sẽ trở nên vô nghĩa.

---

## 2. LỘ TRÌNH THỜI GIAN & CÁC CỔNG KIỂM DUYỆT (GATES)

| Giai đoạn | Thời gian | Trọng tâm bàn giao | Cổng kiểm duyệt (Review Gate) |
|---|---|---|---|
| **Phase 0** | Ngày 1–3 | Khởi tạo Expo, Theme Hà Nội Thu Đông, Setup Supabase Schema & Auth | App chạy mượt, 0 lỗi TypeScript/Lint, Theme đúng mã màu. |
| **Phase 1** | Ngày 4–6 | Luồng Đăng nhập & Wizard thiết lập Thu nhập / Chi phí / Mục tiêu | Đăng nhập mượt mà, Ngân sách ngày tính chuẩn xác. |
| **Phase 2** | Ngày 7–11 | Camera máy film 4:5 + Nút Shutter 1 chạm + Chip giá siêu tốc | Ghi nhận chi tiêu $\le 3$s, 0 lỗi TypeScript, 0 quyền Mic. |
| **Phase 3** | Ngày 12–15| Thẻ Phán Quyết + Bộ quy đổi + AI Roast hóm hỉnh + Nút "Thôi cứu ví" | Thẻ hiển thị đẹp như bưu thiếp, bấm "Thôi" rung ăn mừng tức thì. |
| **Phase 4** | Ngày 16–19| Giỏ Chờ Cản Gắt + Lập lịch nhắc dồn dập 1–2h bằng Local Push | 4 mốc thông báo trigger chuẩn xác cả khi tắt app. |
| **Phase 5** | Ngày 20–24| Sổ chi tiêu Polaroid + Thuật toán Rollover 100% + Hero Tiền Đã Cứu | Dư/lố hôm nay chuyển đúng sang ngày mai; Sổ ảnh mượt mà. |
| **Phase P1 (Prod)** | Ngày 25–26| Minimalist Monochrome Line Icons, chuẩn hóa stroke 1.2-1.5px, khử emoji | 100% icon đơn sắc Lucide, giao diện sang trọng, 0 emoji nút bấm. |
| **Phase P2 (Prod)** | Ngày 27–28| Nén ảnh đa tầng WebP 1080px & Thumbnail 240px, Supabase Storage, LRU cache | Ảnh < 150KB, thumbnail ~15KB, mở lịch 30 ô tải ngay lập tức. |
| **Phase P3 (Prod)** | Ngày 29–30| Offline-First Sync Queue, tự động đồng bộ khi có mạng, giải quyết xung đột LWW | Mất mạng vẫn ghi sổ mượt mà, kết nối lại tự đồng bộ lên mây. |
| **Phase P4 (Prod)** | Ngày 31–32| Xử lý ngoại lệ phần cứng/mạng, bảo mật RLS & chốt phát hành Production | 0 warning/error, cold start < 1.2s, sẵn sàng đưa lên App Store/Play Store. |
| **Phase G1 (v3.1)** | Ngày 33–34| Cử chỉ Center Swipe-Up xem History, Backdrop Tap-Outside đóng Profile, Nút Chunky 3D | Vuốt lên mở ngay History, chạm ngoài đóng Hồ sơ, nút bấm nảy tactile. |
| **Phase G2 (v3.1)** | Ngày 35–36| AI Coach 3D Minh Locket (`rigged_t-pose_human_male_w_50_face_blendshapes.glb`) | 50 blendshapes sống động, phản biện Tiện ích thực tế vs Mua theo trend. |
| **Phase G3 (v3.1)** | Ngày 37–39| Bài Học Tài Chính Bỏ Túi 1 phút, Thống Kê Game Hóa (Thanh HP) & Quản lý Mục tiêu | Quy đổi tác động mục tiêu cá nhân, báo cáo thay đổi thói quen mua sắm. |


---

## 3. CHIẾN LƯỢC KIỂM THỬ & ĐO LƯỜNG CHẤT LƯỢNG

### 3.1. Bộ Kiểm Thử Trích Xuất Dữ Liệu Chi Tiêu (NLP Test Suite)
Hệ thống xử lý văn bản tiếng Việt phải vượt qua bộ kiểm thử với các định dạng ngôn ngữ thực tế:
* **Cách nhập số tắt:** *"Bốn lăm ngàn"*, *"Bốn nhăm"*, *"Bốn chục"*, *"Hai lăm cành"*, *"Ba lít rưỡi"*, *"Một củ hai"*.
* **Cách ghép món:** *"Bún chả bốn nhăm với trà đá năm ngàn"* $\rightarrow$ Nhận diện đúng danh mục và số tiền.
* **Cách nhập Thu nhập:** *"Lương về tám triệu"*, *"Mẹ chuyển hai củ"* $\rightarrow$ Nhận diện chính xác `type: INCOME`.

### 3.2. Kiểm thử Khả năng Hoạt động Ngoại tuyến (Offline Resilience)
* Khi không có mạng 4G/WiFi:
  - Vẫn mở được Camera chụp ảnh.
  - Cho phép gõ nhanh số tiền vào Thẻ Xác Nhận hoặc chọn chip giá.
  - Lưu vào hàng đợi SQLite/Zustand local và tự động đồng bộ lên Supabase khi có mạng trở lại.

### 3.3. Đo Lường Hiệu Năng (Performance Benchmarks)
* **Thời gian khởi động App (Cold Start):** $\le 1.2$ giây vào thẳng Camera.
* **Thời gian từ khi bấm Shutter đến khi hiện Thẻ Xác Nhận:** $\le 0.5$ giây.
* **Tốc độ khung hình Camera:** 60fps ổn định, không giật lag khi chuyển đổi giữa Sổ và Camera.

---

## 4. QUẢN TRỊ RỦI RO & PHƯƠNG ÁN DỰ PHÒNG (RISK & MITIGATION)

| Rủi ro kỹ thuật | Mức độ | Phương án phòng ngừa & Xử lý |
|---|---|---|
| **Nhập sai số tiền** | Thấp | Thẻ Xác Nhận luôn hiện số to và cho phép người dùng chạm 1 lần để sửa số tiền hoặc chọn chip giá nhanh trước khi lưu. |
| **Chi phí gọi Gemini Flash API** | Thấp | Loại bỏ Voice STT giúp tiết kiệm chi phí; ảnh thông thường chỉ nén WebP lưu Supabase Storage, không gửi lên Vision AI trừ khi là ảnh chụp màn hình ngân hàng. |
| **Hệ điều hành tắt ngắt Local Notification** | Trung bình | Đăng ký background task hợp lệ; hiển thị thời gian đếm ngược ngay trên UI Giỏ Chờ khi người dùng mở lại app. |
| **Quy tắc Rollover 100% làm ngân sách bị âm quá sâu** | Thấp | Thiết lập mức "sàn ngân sách tối thiểu" (ví dụ: dù hôm qua lố nặng, hôm nay vẫn giữ mức sàn 30.000đ để người dùng không nản lòng bỏ app). |
