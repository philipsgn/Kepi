# 📋 ĐẶC TẢ MÀN HÌNH ĐĂNG NHẬP & KHẢO SÁT ĐỘ TUỔI (LOGIN & ONBOARDING SPEC)

> **Mã màn hình:** `LOGIN` (`app/(auth)/login.tsx`)  
> **Tên màn hình:** Màn hình Đăng Nhập 1-Chạm, Khảo Sát Năm Sinh & Định Danh Pigpo  
> **Trạng thái:** Approved & Implementing  
> **Phiên bản:** 2.0 (Khảo sát độ tuổi, Nickname debounce fail-open, Local-First 0$ Cloud)  
> **Lần cập nhật cuối:** 2026-10-22  

---

## 1. Mục Tiêu & Người Dùng
- **User Story:** Là một người dùng trẻ (Gen Z / Dân văn phòng) muốn bắt đầu quản lý tài chính ngay lập tức, tôi muốn chỉ cần nhập Biệt danh và chọn Năm sinh để vào ví ngay trong $\le 0.5$ giây, không bị ép đăng nhập OTP/Google rườm rà nhưng thông tin độ tuổi của tôi vẫn được ghi nhận cho hệ thống nghiên cứu nhân khẩu học.
- **Mục tiêu sản phẩm:** 
  1. Tối ưu tốc độ gia nhập ứng dụng: Vào thẳng không rào cản mật khẩu.
  2. Khảo sát độ tuổi người dùng phục vụ phân tích nhân khẩu học (Demographics Analytics) mà không vi phạm quyền riêng tư.
  3. Kiểm tra tính khả dụng của biệt danh trong thời gian thực (Realtime Debounce) với cơ chế phòng vệ fail-open an toàn, không bao giờ treo giao diện.
  4. Đảm bảo 100% người dùng đăng nhập bằng Nickname được duy trì phiên bền vững (Local-First Persistent Session) khi khởi động lại app.

---

## 2. Luồng Nghiệp Vụ & Kiến Trúc Dữ Liệu (Flow & Architecture)

```mermaid
flowchart TD
    A[Mở App Pigpo] --> B{Kiểm tra Session Supabase?}
    B -- Có Session Cloud --> C[Đăng nhập Cloud -> Vào Main]
    B -- Không có Session --> D{Có cachedUserStr cục bộ?}
    D -- Có User/Profile --> E[Phục hồi Session cục bộ -> Vào Main]
    D -- Không có User --> F[Màn hình Login]

    F --> G[Nhập Nickname]
    G --> H[Debounce 350ms: checkNicknameAvailable]
    H -- Tồn tại tên --> I[Báo đỏ + Gợi ý 3 tên thay thế]
    H -- Tên hợp lệ --> J[Tick Check xanh]

    F --> K[Chọn Năm Sinh: Modal Pop-up]
    K --> L[Tính tuổi tự động: Năm hiện tại - Năm sinh]

    F --> M[Bấm Nút Nguồn Power]
    M --> N{Hợp lệ Tên & Năm sinh?}
    N -- Chưa nhập Tên --> O[Cảnh báo rung Warning + Báo lỗi]
    N -- Chưa chọn Năm --> P[Tự động mở Modal Năm Sinh]
    N -- Đầy đủ & Hợp lệ --> Q[signInWithNickname]
    
    Q --> R[Lưu AsyncStorage: User, GuestProfile, DeviceId, BudgetSetup]
    Q --> S[cleanSeedDataAndMigrate: Dọn demo & Di chuyển tx khách]
    Q --> T[syncAgeSurveyToCloud trong nền: user_surveys / RPC]
    Q --> U[Vào app /(main) tức thì <= 150ms]
```

---

## 3. Cây Component & Bố Cục Giao Diện (Component Hierarchy)

```text
<LinearGradient> (Nền động: Cool Mint / Light Pink / Dark)
  <SafeAreaView>
    <KeyboardAvoidingView>
      <ScrollView>
        ├── <TopHeaderRow>: Nút Palette đổi Theme 1-chạm trơn nổi trần
        ├── <HeroSection>:
        │     ├── <Mascot3DImage>: App Icon Chú Heo Pigpo 3D Clay Chibi
        │     ├── <BrandTitle>: "Pigpo"
        │     └── <SubQuoteTag>: "Tiết kiệm • Duy trì • Sinh lời bền vững"
        ├── <FormCard>:
        │     ├── <NicknameFieldBlock>:
        │     │     ├── Label: "TÊN BIỆT DANH CỦA BẠN:"
        │     │     ├── InputBox: User icon + TextInput + Spinner/Check/Alert + Nút Dices trơn nổi trần
        │     │     └── SuggestionRow: 3 chip gợi ý khi bị trùng tên
        │     └── <BirthYearFieldBlock>:
        │           ├── Label: "NĂM SINH & TUỔI:"
        │           └── SelectorBox: Calendar icon + "Năm sinh: YYYY (X tuổi)" + ChevronDown
        ├── <PowerSection>: Nút Nguồn trơn nổi trần (Power icon lớn 44px, stroke 2.8)
        └── <FooterSection>:
              ├── Ca dao lục bát: "Heo kia chẳng vỗ thời to / Từng xu góp lại thành kho lúc nào"
              └── Copyright: "Pigpo © 2026 – Tiết kiệm, duy trì, sinh lời bền vững"
```

---

## 4. Hợp Đồng Dữ Liệu & Quy Chuẩn Backend (Data Contract)

### 4.1. Định dạng dữ liệu cục bộ (AsyncStorage Keys)
- `vi_locket_cached_user`: Lưu `{ id: 'user-dev_...', email: '', full_name: '...' }`.
- `@vi_locket_guest_profile`: Lưu `Profile` đầy đủ `{ id, full_name, birthdate: 'YYYY-01-01', fav_unit, hourly_rate, created_at, updated_at }`.
- `vi_locket_is_guest`: Ghi `'false'` khi đăng nhập bằng Nickname (hoặc `'true'` khi vào dạng Khách vô danh).
- `vi_locket_budget_setup`: Ghi `'true'`.
- `@vi_locket_device_id`: Khóa định danh thiết bị độc nhất dùng làm `device_id` cho khảo sát.

### 4.2. Đồng bộ đám mây Supabase (Zero-Friction Fallback)
1. **Bảng `public.user_surveys`**:
   - Lưu trữ `(device_id, nickname, birth_year, birthdate, created_at, updated_at)`.
   - RPC `submit_age_survey(p_device_id, p_nickname, p_birth_year)` chạy với `SECURITY DEFINER`.
   - Try/catch cách ly hoàn toàn: Nếu không có mạng hoặc Supabase offline, luồng cục bộ vẫn thành công 100%.
2. **Kế thừa khi nâng cấp lên Google/OTP (`ensureUserProfile`)**:
   - Tự động lấy `birthdate` từ `@vi_locket_guest_profile` đưa vào `public.profiles.birthdate` trên Supabase Cloud.

---

## 5. Xử Lý Các Trường Hợp Biên (Edge Cases & Resilience)

| Trường Hợp Biên (Edge Case) | Hành Vi Hệ Thống | Cơ Chế Bảo Vệ (Resilience) |
| :--- | :--- | :--- |
| **Biệt danh trống / Toàn khoảng trắng** | Chặn submit, rung `Warning Haptic`, hiển thị cảnh báo đỏ *"Vui lòng nhập biệt danh của bạn"*. | `cleanName = nickname.trim()`; nếu rỗng từ chối xử lý. |
| **Chưa chọn năm sinh** | Chặn submit, tự động bung Modal Pop-up danh sách năm sinh ở giữa màn hình. | `selectedBirthYear === null` kích hoạt `setShowYearPickerModal(true)`. |
| **Mất mạng / Mạng chập chờn khi gõ tên** | Kiểm tra realtime tự động ngắt sau 2000ms (`Promise.race`), fail-open trả về khả dụng. | Không treo spinner loading, không chặn thao tác người dùng. |
| **Người dùng Khách trước đó có giao dịch** | Di chuyển toàn bộ giao dịch từ `guest-*` sang `user-dev_*`. | Gọi `cleanSeedDataAndMigrate(newUserId, 'MERGE')`. |
| **Khởi động lại ứng dụng (Reload/Relaunch)** | Khôi phục ngay phiên đăng nhập có biệt danh, vào thẳng `/(main)`. | `initializeAuth` đọc `cachedUserStr` và khôi phục `user`, `profile`, `hasCompletedBudgetSetup`. |
