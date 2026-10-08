# 🍂 WALKTHROUGH BÁO CÁO: PHASE 1 — AUTHENTICATION & WIZARD THIẾT LẬP NGÂN SÁCH

- **Dự án:** Ví Locket (Mobile App Chi Tiêu Ảnh & Giọng Nói — Vibe Hà Nội Thu Đông)
- **Giai đoạn:** Phase 1 (Authentication & Financial Onboarding)
- **Ngày hoàn thành:** 01/10/2026
- **Trạng thái:** ✅ Đã hoàn thành 100% mục tiêu, sẵn sàng chuyển sang Phase 2.

---

## 1. CÁC TASKS ĐÃ HOÀN THÀNH

- [x] **Task 1.1: Quản lý State Cốt Lõi với Zustand Stores**
  - [src/store/authStore.ts](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/src/store/authStore.ts): Quản lý người dùng, hồ sơ cá nhân, phiên đăng nhập, hỗ trợ cả đăng nhập Supabase OTP lẫn chế độ Demo ("Lâm Lơ") để thử nghiệm tức thì mà không cần mạng.
  - [src/store/budgetStore.ts](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/src/store/budgetStore.ts): Quản lý dòng tiền, thu nhập, chi phí cố định, mục tiêu lớn, đơn vị yêu thích, ngân sách ngày hôm nay và con số Hero Tiền Đã Cứu.

- [x] **Task 1.2: Giao diện Đăng Nhập Thơ Mộng Phố Cổ (`app/(auth)/login.tsx`)**
  - [app/(auth)/login.tsx](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/app/%28auth%29/login.tsx):
    - Tone màu Sữa Ngà (`#FAF6F0`) ấm áp kết hợp biểu tượng chiếc lá mùa thu và máy ảnh film.
    - Trích dẫn: *"Chụp trước khi mua. Ví ấm lòng, phố dịu dàng."*
    - Ô nhập email nhận Magic Link qua Supabase Auth.
    - Nút bấm nhanh **"Trải Nghiệm Nhanh (Demo Lâm Lơ)"** để vào app ngay chỉ trong 1 chạm.
    - Cam kết bảo mật: *Ví giả lập • Không liên kết ngân hàng • Bảo mật 100%*.

- [x] **Task 1.3: Wizard 3 Bước Thiết Lập Ngân Sách Ngày (`app/(auth)/budget-setup.tsx`)**
  - [app/(auth)/budget-setup.tsx](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/app/%28auth%29/budget-setup.tsx):
    - **Bước 1 — Thu nhập:** Nhập lương/trợ cấp hàng tháng kèm các pill gợi ý nhanh (4 củ, 7 củ, 12 củ).
    - **Bước 2 — Chi cố định:** Khai báo tiền trọ, điện nước, học phí với gợi ý nhanh (1.5 củ, 2.5 củ, 4 củ).
    - **Bước 3 — Mục tiêu & Đơn vị yêu thích:** Đặt tên món muốn mua (Laptop mới, Đà Lạt, Concert), số tiền muốn tích lũy, và chọn đơn vị AI quy đổi (🧋 Ly trà sữa 30k, ☕ Cà phê trứng 30k, 🍜 Bát phở bò 40k).
    - **Bước 4 — Màn hình Khởi tạo Ngân Sách:** Tính toán tự động hạn mức chi tiêu tự do mỗi ngày, hiển thị bảng breakdown minh bạch kèm câu dặn dò về quy tắc Rollover 100%.

- [x] **Task 1.4: Điều Hướng Thông Minh & Khung Ngắm Camera Sẵn Sàng (`app/(main)/index.tsx`)**
  - [app/_layout.tsx](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/app/_layout.tsx): Route protection tự động chuyển hướng: `Chưa đăng nhập` $\rightarrow$ `Login` $\rightarrow$ `Budget Setup` $\rightarrow$ `Main Camera`.
  - [app/(main)/index.tsx](file:///c:/Users/TanPhat/Documents/AI_E/V%C3%AD-Locket/app/%28main%29/index.tsx): Màn hình Camera Viewfinder 4:5 phong cách máy film cổ điển với 4 góc chữ L Nắng Thu Gold, Frosted Header Pill (`🟢 Hôm nay còn [xx]k`), Quick Drawer xem Số Dư Thực và Tiền Đã Cứu.

---

## 2. MINH CHỨNG HOẠT ĐỘNG & KẾT QUẢ KIỂM THỬ

* **TypeScript Compilation:**
  - Lệnh: `npx tsc --noEmit`
  - Kết quả: **0 errors, 0 warnings** (Exit Code 0).
* **Cấu hình Expo Router & Typed Routes:**
  - Lệnh: `npx expo config --type public`
  - Kết quả: **Valid 100%**.
* **Đồng bộ Dữ liệu Offline-First:**
  - Cấu hình lưu trữ kép (AsyncStorage + Supabase Upsert) giúp ứng dụng chạy ổn định kể cả khi thiết bị mất kết nối mạng.

---

## 3. CÁC QUYẾT ĐỊNH KIẾN TRÚC ĐÃ ĐƯA RA

1. **Khử Bỏ Rào Cản Đăng Nhập với Demo Mode:**
   - Để người dùng và ban giám khảo kiểm thử trải nghiệm ngay mà không phải chờ nhận email OTP, nút Demo kích hoạt tức thời tài khoản "Lâm Lơ" đưa người dùng vào thẳng Wizard ngân sách.
2. **Khởi Tạo Ngân Sách Ngày Tự Nhiên:**
   - Sử dụng công thức pure function: $\text{Ngân sách ngày} = \max(30.000đ, \lfloor(\text{Thu nhập} - \text{Cố định} - \text{Mục tiêu}) / 30\rfloor)$ để luôn giữ mức sàn sinh hoạt thực tế tối thiểu.
3. **Route Protection Dựa Trên usePathname:**
   - Sử dụng `usePathname()` thay vì truy cập chỉ mục mảng `segments[1]` để tương thích hoàn hảo với bộ kiểm tra kiểu TypeScript của Expo SDK 52.

---

## 4. KẾ HOẠCH CHO PHASE KẾ TIẾP (PHASE 2)

Sẵn sàng chuyển sang **Phase 2: Camera Mùa Đông & Thu Âm Giọng Nói AI (Gemini Flash)**:
- Tích hợp `expo-camera` trực tiếp vào khung ngắm 4:5 máy film.
- Nút Shutter giữ mic thu âm (`expo-audio`) với hiệu ứng sóng âm gợn sóng màu hoa cúc.
- Tích hợp Edge Function Gemini Flash trích xuất dữ liệu giọng nói tiếng Việt (*"bốn lăm ngàn"*, *"lương về 8 củ"*) trong $\le 1.8$ giây.
- Xây dựng Thẻ Xác Nhận Polaroid nâng cấp với pill gạt `↗ Chi / ↙ Thu` đè chân ảnh và 2 nút CTA `[ĐÃ MUA]` / `[HỎI TRƯỚC]`.
