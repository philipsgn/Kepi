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

## 4. HỆ THỐNG STATE MANAGEMENT & SINGLE SOURCE OF TRUTH (ZUSTAND)

1. **`budgetStore.ts` & Kiến Trúc Single Source of Truth:**
   - Các trường `todaySpent`, `todayIncome`, `weeklySpent`, `realBalance` được tính toán dẫn xuất trực tiếp từ mảng `transactions` (`status === 'CONFIRMED'`).
   - Hàm `recalculateBudgetFromTransactions(transactions)` đảm bảo khi người dùng Thêm, Sửa (update), Xóa (delete), hoặc Hoàn tác (undo), mọi chỉ số ngân sách ngày, tuần và số dư đều lập tức đồng bộ 100%.
   - **Hard Daily Rollover Engine:** Hàm `checkAndApplyDailyRollover()` tự động kiểm tra mốc `lastActiveDate`. Khi sang ngày mới (qua 00:00), `todayBudget = baseDailyBudget + (yesterdayBudget - yesterdaySpent)` (thừa cộng dồn, lố trừ thẳng).
2. **`transactionStore.ts`:**
   - Quản lý mảng `transactions`, ảnh WebP 1080px, thumbnail 240px, offline mutation queue.
   - Khi `addTransaction`, `updateTransaction`, `deleteTransaction`, hoặc `confirmPendingTransaction`, tự động kích hoạt cập nhật lại `budgetStore`.
   - **Xử lý PENDING:** Sau 24h gắn nhãn cảnh báo; sau 7 ngày tự động chuyển sang `CANCELLED`.
3. **`minhCoachStore.ts`**:
   - Quản lý trạng thái hiện tại của Minh 3D (Biểu cảm, Lời thoại động).
   - Động cơ phân tích 3 câu hỏi: Tiện ích thực tế, Cảnh báo trend, Tác động mục tiêu cá nhân.
4. **`authStore.ts`**:
   - Quản lý phiên đăng nhập Google OAuth (hỗ trợ `/(auth)/callback`) và chế độ Khách (Guest) 100% offline.
5. **`categoryStore.ts`**:
   - Danh mục tùy biến (Thu / Chi), icon vector, màu sắc, đồng bộ AsyncStorage.

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

## 6. KIẾN TRÚC XÁC THỰC PRODUCTION TỐI GIẢN & DI CHUYỂN DỮ LIỆU ĐÁM MÂY

### 6.1. Cổng Vào Kép Tối Giản Tuyệt Đối & Bảng Màu Xanh Mint Ban Mai
- **Tiêu chí:** Tối giản 100%, triệt tiêu ô nhập liệu Email và bước gửi nhận OTP rườm rà.
- **Thẩm mỹ:** Nền LinearGradient Xanh Mặt Trời nhạt (`#E0F2FE`) hòa quyện Xanh Mint thanh mát (`#D1F4E0`) và Kem Ngà (`#F4FBF7`), xóa tan cảm giác u tối. Monogram K kết hợp Xanh Rừng Đậm (`#0F2F24`) và Vàng Hổ Phách (`#E59844`).
- **Thông điệp:** Quote nghệ thuật in nghiêng nhẹ trong ngoặc kép: *“Góp chút nhỏ, dựng tương lai to”* (đã loại bỏ dòng phụ đề rườm rà).
- **2 Lối vào duy nhất:**
  1. **"Tiếp tục với Google" (OAuth Web Session):** Nền Trắng Sứ (`#FFFFFF` đổ bóng mềm). Dữ liệu giao dịch & ảnh WebP tự động đồng bộ lên Supabase Cloud Database & Storage, **bảo toàn vĩnh viễn 100% khi xóa app hoặc đổi điện thoại**.
  2. **"Vào ngay" (Instant Camera Entry):** Nền Xanh Ngọc Đậm (`#0F2F24` chữ Trắng Kem). Thuần chữ căn giữa, triệt tiêu icon tia sét để đạt độ tối giản tuyệt đối. 1-chạm mở thẳng Camera Viewfinder (Tab 2) trong $< 0.5$s, **toàn bộ dữ liệu bắt đầu từ con số 0đ trung thực**.

### 6.2. Cơ Chế Bảo Vệ Sandbox & Bản Chất Hệ Điều Hành
- **Bản chất HĐH:** Khi người dùng "Vào ngay", toàn bộ dữ liệu lưu trong App Sandbox (`AsyncStorage` và thư mục nội bộ máy). Cả **iOS và Android** đều xóa sạch 100% dữ liệu này khi gỡ cài đặt (Uninstall).
- **Guest Sync Guard:** Chặn toàn bộ mutation và upload ảnh của phiên "Vào ngay" lên Cloud (`0 byte cloud writes`) để bảo vệ server.
- **Điểm chạm nhắc khéo:** Để tránh người dùng mất dữ liệu oan khi xóa app, app chỉ đặt huy hiệu nhắc nhẹ tại **Tab Hồ Sơ** (`ProfileIdentityCard.tsx`), tuyệt đối không spam modal cảnh báo hay banner trên màn hình chính.

### 6.3. Động Cơ Di Chuyển Dữ Liệu Không Thất Thoát (Zero-Data-Loss Migration Engine)
- Khi người dùng "Vào ngay" quyết định bấm `[Liên kết Google]` tại Tab Hồ Sơ:
  1. **Tài khoản Google mới tinh:**
     - Tự động gán `user_id` mới cho các khoản chi đã ghi trên máy.
     - Tự động nén và upload toàn bộ ảnh local (`file:///...`) lên Supabase Storage bucket `receipt-photos`.
     - Đẩy các giao dịch lên Supabase Database qua `enqueueMutation` $\rightarrow$ Chuyển `isGuest = false` liền mạch (Zero data loss).
  2. **Tài khoản Google đã có dữ liệu cũ trên Cloud:**
     - Hiển thị hộp thoại xác nhận quyền quyết định cho người dùng:
       - **[Gộp dữ liệu]**: Giữ các khoản chi vừa ghi trên máy và thêm vào tài khoản Google.
       - **[Dùng dữ liệu đám mây]**: Tải toàn bộ dữ liệu lịch sử từ Google về máy, bỏ dữ liệu tạm thời.

---

## 7. KIẾN TRÚC ENTRY POINT & PHÒNG VỆ RUNTIME NATIVE (NATIVE RESILIENCE)

### 7.1. Cấu Trúc Entry Point Phân Tầng (`index.js`)
- Tránh import trực tiếp `expo-router/entry` làm main entry mà qua tầng bọc bảo vệ `index.js`.
- `index.js` nạp `src/utils/nativeSafetyPolyfill.ts` trước khi nạp bất kỳ module nào của Expo Router.

### 7.2. Native Safety Polyfill (`nativeSafetyPolyfill.ts`)
- Phát hiện môi trường thiếu native TurboModule (`ExpoAsset`, `ExponentConstants`) khi chạy trên Expo Go / device test chưa link Pods mới.
- Tự động thiết lập mock an toàn `globalThis.expo.modules.ExpoAsset.downloadAsync` để chặn đứng lỗi văng `Cannot find native module 'ExpoAsset'`.
- Đảm bảo `AppRegistry.registerComponent('main')` luôn được gọi trơn tru 100%, không bao giờ xuất hiện lỗi `Invariant Violation: "main" has not been registered`.

### 7.3. Tiêu Chuẩn Cấu Hình Production App (`app.json` & `package.json`)
- Loại bỏ toàn bộ cờ cũ không hợp lệ trong Expo SDK hiện đại (`newArchEnabled` ở root, `splash` ở root).
- Dọn dẹp mảng `plugins` chỉ giữ lại các plugin chính thức có native config hooks (`expo-router`, `expo-camera`, `expo-notifications`).
- Gỡ bỏ hoàn toàn dependency rác `expo-audio` và quyền `RECORD_AUDIO`.
- Đạt 21/21 tiêu chí kiểm định nghiêm ngặt từ `npx expo-doctor`.

---

## 8. ĐỘNG CƠ TỰ ĐỘNG GHI SỔ THÔNG BÁO NGÂN HÀNG TRÊN ANDROID (ANDROID NOTIFICATION ENGINE)

### 8.1. Triết Lý Xử Lý 100% Offline & Bảo Vệ Quyền Riêng Tư (Zero Server Leakage)
- Không yêu cầu cài phím tắt rườm rà, không cần webhook server Cloudflare Workers.
- Hệ thống lắng nghe thông báo trực tiếp trên Android qua quyền `Notification Access` (`android.permission.BIND_NOTIFICATION_LISTENER_SERVICE`).
- Toàn bộ quá trình phân tích chuỗi ký tự, nhận dạng ngân hàng, bóc tách số tiền và phân loại danh mục đều diễn ra **100% trong bộ nhớ cục bộ (In-Memory)** của điện thoại. Tuyệt đối không gửi 1 byte dữ liệu thông báo nào ra Internet.

### 8.2. Bộ Lọc An Toàn Đa Tầng (Multi-Tier Security & OTP Shield)
1. **Chặn 100% Tin Mã Xác Thực:** Nếu thông báo chứa bất kỳ từ khóa nào như `OTP`, `mã xác thực`, `verification code`, `mã kích hoạt`, bộ lọc ngay lập tức hủy bỏ và không lưu bất kỳ dấu vết nào.
2. **Chặn 100% Tin Tiếp Thị & Rác:** Loại trừ các thông báo chứa `khuyến mãi`, `hoàn tiền`, `ưu đãi`, `vay nhanh`, `mở thẻ`, `bảo hiểm`.
3. **Phân Định Chi Tiêu (EXPENSE) vs Thu Nhập (INCOME):** Dựa trên dấu âm/dương (`-48.000VND`, `+`, `nhan tien`, `thanh toan`, `chuyen tien`).

### 8.3. Bóc Tách Đa Ngân Hàng Hàng Đầu Việt Nam
- **TPBank:** Cú pháp `TK: xxxx / PS: -48.000VND / SD: ...` hoặc `GD: -48,000 VND`.
- **Vietcombank (VCB):** Cú pháp `SD TK ... -48,000 VND luc ...` hoặc `bien dong so du`.
- **MBBank (MB):** Cú pháp `TK ...|-48,000VND|...`.
- **Techcombank (TCB):** Cú pháp `Giao dich: -48,000 VND...`.
- **ACB, VPBank, OCB...:** Các mẫu biểu chuẩn của hệ thống Core Banking Việt Nam.

### 8.4. Tự Động Phân Loại Danh Mục & Sinh Card Đồ Họa Vector Ngân Hàng
- Bóc tách từ khóa nội dung: `Highlands / Phuc Long / Com / Bun` $\rightarrow$ `Ăn uống`; `Grab / Be / Xanh SM / Xang` $\rightarrow$ `Đi lại`; `Shopee / Lazada / WinMart` $\rightarrow$ `Mua sắm`.
- Khởi tạo Card đồ họa nhận diện ngân hàng đặc trưng (TPBank tím cam, VCB xanh ngọc, MB xanh dương đậm, TCB đỏ trắng).
- Ghi thẳng vào `transactionStore` với trạng thái `CONFIRMED`, tự động gọi `recalculateFromTransactions` để cập nhật hạn mức ngày và số dư khả dụng ngay lập tức (Single Source of Truth).
