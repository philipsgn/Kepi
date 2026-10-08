# KIẾN TRÚC KỸ THUẬT (TECH ARCHITECTURE) — VÍ LOCKET v3.1

---

## 1. TỔNG QUAN HỆ THỐNG (SYSTEM OVERVIEW v3.1)

Ví Locket v3.1 xây dựng kiến trúc Mobile tối ưu hóa với **AI Coach Minh Locket ("Anh PT Tài Chính")** sử dụng hình tượng Chân Dung Signature 3D Stylized Pixar và phân hệ Chat 2 chiều thời gian thực kết nối với Gemini AI.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT: EXPO REACT NATIVE                       │
│                                                                        │
│  [ Camera & Shutter ]   [ PanResponder Swipe-Up ]  [ Coach Signature ] │
│         │                          │               (3D Stylized Pixar) │
│         ▼                          ▼                       ▼           │
│  [ Image Processor ]    [ History Peek Sheet ]      [ AI Coach Chat UI]│
│  (WebP 1080px/240px)                                [ Minh Coach Store]│
│         │                                           [ Goal & Habit ]   │
│         ▼                                                  ▼           │
│  [ Offline Sync Queue ] ────────────► [ Zustand Persistence Cache ]    │
└─────────┬──────────────────────────────────────────────────┬───────────┘
          │                                                  │
          ▼ REST / Storage Upload                            ▼ Edge AI
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND: SUPABASE CLOUD                         │
│                                                                        │
│  [ Supabase Storage ]      [ PostgreSQL Database ]       [ Gemini AI ] │
│   - item-photos Bucket      - transactions, profiles      - Gemini Flash│
│   - LRU 30-day Cache        - personal_goals, habits      - Chat PT &   │
│                                                           Tiện ích/Trend│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. KIẾN TRÚC PHÂN HỆ AI COACH MINH ("ANH PT TÀI CHÍNH") & CHAT 2 CHIỀU

### 2.1. Quản lý Tài nguyên Hình Ảnh Signature
- Loại bỏ mô hình 3D WebView nặng nề để tiết kiệm pin và bộ nhớ RAM của thiết bị.
- Sử dụng ảnh chân dung **3D Stylized Pixar** cao cấp (`assets/coach_minh_signature.png`) làm visual brand nhận diện xuyên suốt ứng dụng.
- Tốc độ hiển thị tức thì 0-delay, sắc nét chuẩn Retina trên iPhone.

### 2.2. Động Cơ Trò Chuyện & Tư Vấn 2 Chiều (Gemini Financial PT Engine)
- API Service: `chatWithMinhCoach(userMessage: string, context: FinancialContext)` kết nối trực tiếp với Gemini 1.5 Flash.
- **Context Injection (Bối Cảnh Tài Chính Thời Gian Thực):**
  Mỗi câu hỏi của người dùng đều tự động được nạp kèm bức tranh tài chính hiện tại:
  ```typescript
  interface FinancialContext {
    todayBudget: number;       // Hạn mức ngày (VD: 150.000đ)
    todaySpent: number;        // Đã chi hôm nay (VD: 95.000đ)
    remainingToday: number;    // Còn lại (VD: 55.000đ)
    goalName: string;          // Tên mục tiêu (VD: Mua Laptop)
    goalTargetAmount: number;  // Số tiền mục tiêu (VD: 15.000.000đ)
    savedMoney: number;        // Tiền đã cứu thành công
  }
  ```
- **System Instruction "Anh PT Giữ Ví":**
  - Xưng hô: "Minh - Bồ", giọng văn thân thiện, thẳng thắn, kỷ luật như một huấn luyện viên gym thể hình.
  - Phân biệt rành mạch giữa "nhu cầu thiết thực" và "cảm xúc bốc đồng / đu trend nhất thời".
  - Đưa ra bài tập điều chỉnh chi tiêu cụ thể, không giáo điều lý thuyết suông.
  - Phản hồi ngắn gọn, súc tích (dưới 4 câu) để người dùng đọc nhanh trên điện thoại.

---

## 3. KIẾN TRÚC TƯƠNG TÁC CỬ CHỈ & GIAO DIỆN (UI/UX GESTURE ARCHITECTURE)

### 3.1. Cử Chỉ Vuốt Trượt Lên (Center Swipe-Up PanResponder)
- Vùng nhận diện: Toàn bộ vùng nửa dưới khung ngắm Camera.
- Thuật toán nhận diện:
  ```typescript
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy < -25 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -40) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowHistorySheet(true);
        }
      },
    })
  ).current;
  ```

### 3.2. Cơ Chế Chạm Ngoài Nền Tự Đóng (Backdrop Tap-Outside Dismiss)
- Áp dụng cho: `ProfileModal`, `MinhCoachModal`, `ConfirmationSheet`, `JudgmentCard`.
- Cấu trúc: Lớp phủ `TouchableWithoutFeedback` bao bọc bên ngoài khung thẻ, chạm vào nền là kích hoạt `onClose()`.

---

## 4. HỆ THỐNG STATE MANAGEMENT & STORE (ZUSTAND)

1. **`minhCoachStore.ts`**:
   - Quản lý trạng thái hiện tại của Minh 3D (Biểu cảm, Lời thoại động).
   - Động cơ phân tích 3 câu hỏi: Tiện ích thực tế, Cảnh báo trend, Tác động mục tiêu cá nhân.
   - Báo cáo thói quen hàng tuần.
2. **`authStore.ts` / `budgetStore.ts`**:
   - Lưu trữ `personalGoal`: Tên mục tiêu (Laptop, Du lịch...), Số tiền mục tiêu, Hạn mức ngày, Giờ công.
3. **`transactionStore.ts`**:
   - Giao dịch, ảnh WebP 1080px, thumbnail 240px, offline mutation queue.
4. **`lessonStore.ts`**:
   - Danh sách bài học tài chính bỏ túi, điểm kinh nghiệm hiểu biết tài chính.
5. **`statsStore.ts`**:
   - Thanh sinh lực HP, biểu đồ phân bổ chi tiêu.

---

## 5. PHÂN HỆ QUÉT MÃ CHUYỂN KHOẢN (VIETQR ENGINE & PAYMENT DEEPLINK)

### 5.1. Mô Hình Luồng Dữ Liệu & Vòng Đời Trạng Thái (Data Flow & State Lifecycle)

```
┌─────────────────┐      1. Quét mã QR        ┌────────────────────────┐
│  Expo Camera    │ ────────────────────────> │  EMVCo Parser (Thuần)  │
│  (Chi/Định mua) │                           │  (Chạy 100% Offline)   │
└─────────────────┘                           └───────────┬────────────┘
                                                          │ 2. Trả về payload hợp lệ
                                                          ▼ (accountRef chỉ ở RAM)
┌──────────────────────────────────────────────────────────────────────┐
│                    ZUSTAND / APP STATE TRANSIENT                     │
│  - Tạo bản ghi PENDING: amount, payee_name, bank_bin, category       │
│  - KHÔNG ghi accountRef vào Database hay State bền                   │
└─────────────────────────────────┬────────────────────────────────────┘
                                  │ 3. Dựng Deeplink & mở App
                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│                  EXTERNAL BANKING APP (TECHCOMBANK...)               │
│  - Người dùng xác thực vân tay/FaceID và chuyển khoản                │
└─────────────────────────────────┬────────────────────────────────────┘
                                  │ 4. Quay lại app (AppState: active)
                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│                  HỎI XÁC NHẬN "ĐÃ CHUYỂN XONG CHƯA?"                 │
│  [Đã chuyển] ────────────► status: CONFIRMED ──> Tính vào Sổ & Budget│
│  [Chưa chuyển] ──────────► status: CANCELLED ──> Hủy bỏ (Không tính) │
│  [Sửa số tiền] ──────────► Cập nhật amount   ──> status: CONFIRMED   │
└──────────────────────────────────────────────────────────────────────┘
```

### 5.2. Cập Nhật Mô Hình Dữ Liệu (Database Schema Migration)

Bảng `transactions` bổ sung các trường phục vụ theo dõi giao dịch chuyển khoản VietQR:

```sql
-- Migration: Add VietQR and Transaction Status fields
ALTER TABLE transactions 
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'CONFIRMED' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED')),
  ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'MANUAL' CHECK (source IN ('PHOTO', 'MANUAL', 'SCREENSHOT', 'QR')),
  ADD COLUMN IF NOT EXISTS payee_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_bin VARCHAR(10),
  ADD COLUMN IF NOT EXISTS qr_kind VARCHAR(10) CHECK (qr_kind IN ('STATIC', 'DYNAMIC')),
  ADD COLUMN IF NOT EXISTS pending_expires_at TIMESTAMPTZ;

-- Index tối ưu hóa truy vấn các khoản chờ
CREATE INDEX IF NOT EXISTS idx_transactions_status_user ON transactions(user_id, status);

-- Dữ liệu cũ mặc định status = 'CONFIRMED' để bảo toàn tính toàn vẹn
UPDATE transactions SET status = 'CONFIRMED' WHERE status IS NULL;
```

**Kịch bản hoàn tác (Rollback Migration Script):**
```sql
ALTER TABLE transactions 
  DROP COLUMN IF EXISTS pending_expires_at,
  DROP COLUMN IF EXISTS qr_kind,
  DROP COLUMN IF EXISTS bank_bin,
  DROP COLUMN IF EXISTS payee_name,
  DROP COLUMN IF EXISTS source,
  DROP COLUMN IF EXISTS status;
DROP INDEX IF EXISTS idx_transactions_status_user;
```

### 5.3. Nguyên Tắc Cách Ly Phép Tính (Calculation Pure Function Isolation)

- **Nguyên tắc vàng:** Mọi phép tính số dư, ngân sách ngày hôm nay (`remainingToday`), tổng chi tháng, chi theo danh mục, thanh sinh lực HP, lịch ảnh và báo cáo Anh Minh **CHỈ ĐƯỢC PHÉP TRUY VẤN CÁC GIAO DỊCH CÓ `status === 'CONFIRMED'`**.
- Các giao dịch `status === 'PENDING'` chỉ hiển thị trong danh sách Lịch sử / Thông báo chờ với nhãn riêng *"Chờ xác nhận"*, tuyệt đối không cộng vào bất kỳ con số tổng hợp nào.

### 5.4. Tiêu Chuẩn Bảo Mật Không Thỏa Hiệp (Zero-Knowledge Security)

1. **Tuyệt đối không lưu số tài khoản người nhận (`accountRef`):**
   - Chỉ được phép truyền qua đối số của hàm dựng Deeplink (`buildVietQRUrl`).
   - Tuyệt đối không lưu trữ vào Supabase, SQLite, AsyncStorage, Global Cache, Sentry hay Console log.
2. **Chặn hoàn toàn URL ngoài danh mục VietQR:**
   - Bộ quét kiểm tra chặt chẽ định dạng EMVCo (`000201...`). Mọi chuỗi ký tự dạng `http://`, `https://` không mở WebView hay trình duyệt Safari, trả về cảnh báo an toàn.
3. **Ẩn số liệu nhạy cảm trong Analytics:**
   - Các sự kiện `qr_detected`, `qr_confirmed`, `qr_cancelled` chỉ chứa mã định danh ngân hàng (`bank_bin`), không chứa số tiền hay danh tính người thụ hưởng.

### 5.5. Kiến Trúc Phân Tầng Dual-Engine & Hộp Xác Nhận (Confirmation Inbox Architecture)

1. **Phân Luồng Dựa Trên VietQR v2 API & Casso:**
   - **Luồng 1 (Autofill = 1):** 5 ngân hàng (`mb`, `icb`, `bidv`, `acb`, `ocb`). Universal Deeplink `dl.vietqr.io` tự động điền sẵn số tiền, người nhận, nội dung. Quay lại app qua `AppState` hoạt động để bung thẻ xác nhận.
   - **Luồng 2 (Autofill = 0):** 32 ngân hàng (`tcb`, `vcb`, `vpb`, `tpb`...). Khách hàng quét trả tại Bank $\rightarrow$ chụp màn hình biên lai $\rightarrow$ tải ảnh vào Ví Locket ghi nhanh; hoặc quét mã QR trước trên Ví Locket $\rightarrow$ mở app ngân hàng quét trả $\rightarrow$ quay lại xác nhận 1 chạm.
2. **Hộp Xác Nhận Trung Tâm (Confirmation Inbox):**
   - Gom các khoản PENDING và món Giỏ Chờ 24h đến hạn.
   - Thao tác 1-chạm [Lưu] / [Bỏ] trong vòng 5 giây, có snackbar hoàn tác 5 giây.
3. **An Toàn Clipboard & Quyền Riêng Tư:**
   - Không quét ngầm album ảnh. Chỉ mở bộ chọn ảnh khi người dùng chủ động bấm "Tải ảnh biên lai".
   - Không tự ý sao chép STK vào bộ nhớ tạm. Chỉ sao chép khi người dùng chủ động chạm vào nút "Sao chép". Tùy chọn tự sao chép trong Hồ sơ mặc định là TẮT.

---

## 6. KIẾN TRÚC XÁC THỰC PRODUCTION (AUTH V2) & GUEST SYNC GUARD

### 6.1. Phương Thức Đăng Nhập Đa Kênh
- **In-app 6-Digit Email OTP:** Người dùng nhận mã OTP 6 số qua email và nhập trực tiếp trong giao diện app (có auto-focus và đếm ngược 60 giây). Gọi trực tiếp `supabase.auth.verifyOtp` không phụ thuộc vào deep link trình duyệt ngoài.
- **Google Sign-In (OAuth Web Session):** Kết nối qua `supabase.auth.signInWithOAuth` mở trình duyệt hệ thống và chuyển tiếp về app qua URL scheme `vilocket://`.

### 6.2. Cơ Chế Bảo Vệ CSDL (Guest Sync Guard)
- **Nguyên tắc cốt lõi:** Khi người dùng ở chế độ Khách (`isGuest = true`), toàn bộ dữ liệu chi tiêu và hình ảnh chỉ được lưu trữ cục bộ tại thiết bị (`AsyncStorage` và `cacheDirectory`).
- **Chặn toàn bộ Mutation:** `enqueueMutation` và `uploadExpensePhotoAsync` tự động phát hiện `userId` có tiền tố `guest-` hoặc `demo-` để ngắt kết nối lên Supabase Database và Storage.
- **Làm sạch Seed Data:** Khi người dùng chuyển đổi sang tài khoản thật, toàn bộ 7 giao dịch mẫu seed demo (`tx-seed-*`) tự động được làm sạch khỏi bộ nhớ, chỉ đồng bộ các giao dịch thật do người dùng tạo.


