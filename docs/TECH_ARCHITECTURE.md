# KIẾN TRÚC KỸ THUẬT (TECH ARCHITECTURE) — PIGFLY v4.3
> **Chiến Lược 2 Tầng:** Tầng 1: Offline-First Rock-Solid Core ➔ Tầng 2: Cloud-Ready Adapter  
> **Cập nhật:** Tháng 11/2026 (Theo Quyết định 114)

---

## 1. TỔNG QUAN HỆ THỐNG 2 TẦNG (TWO-TIER SYSTEM ARCHITECTURE v4.3)

PigFly triển khai mô hình kiến trúc lấy cảm hứng từ Locket Widget: **Ưu tiên số 1 cho Offline-First** để người dùng thoải mái ra đường không có mạng vẫn chụp ảnh, quét hóa đơn OCR, nói giọng nói NLP và ghi chép mượt mà 100%. Hạ tầng Cloud (Supabase) được tách bạch thành một lớp Adapter sẵn sàng kết nối ngầm khi tầng Offline đã ổn định hoàn toàn.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              TẦNG 1: OFFLINE-FIRST ROCK-SOLID CORE (TRỌNG TÂM SỐ 1)             │
│                                                                                 │
│   [ Camera 4:5 ] ───► [ Image Manipulator ] ───► [ Persistent Storage ]        │
│                       (WebP Dual-Res ~50KB)      (${documentDirectory}/        │
│                                                   pigfly_photos/{YYYY-MM}/)    │
│                                                                                 │
│   [ On-Device AI Pipeline ]                     [ Zustand Stores ]              │
│   - OCR Receipt Scanner (Regex)                 - transactionStore              │
│   - Voice NLP Parser (Vietnamese)               - budgetStore (Daily Rollover)  │
│   - Vision Classifier (Offline)                 - gamificationStore (Streak)    │
│                                                 - squadStore / authStore        │
│                                                           │                     │
│                                                           ▼                     │
│                                                 [ AsyncStorage Local Vault ]    │
│                                                 (Chạy 100% Offline 0ms delay)   │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                                         ▼ (Tích hợp sau khi Tầng 1 ổn định 100%)
┌─────────────────────────────────────────────────────────────────────────────────┐
│              TẦNG 2: CLOUD-READY ADAPTER (SUPABASE EXTENSION LAYER)             │
│                                                                                 │
│   [ Outbox Sync Worker ] ─────────────────────► [ Supabase Cloud ]              │
│   - Đồng bộ ngầm hai chiều khi có mạng          - PostgreSQL Database           │
│   - Zero-distraction UI (0 icon giật lag)       - Storage Bucket (receipt-photos│
│   - Khôi phục dữ liệu khi đổi thiết bị          - Row Level Security (RLS)      │
└─────────────────────────────────────────────────────────────────────────────────┘
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
   - Quản lý phiên tài khoản cục bộ Offline (Biệt danh, Sandbox Khách) lưu bền vững trong `AsyncStorage` (0-delay, 100% offline). Sẵn sàng chuyển tiếp sang Supabase Auth ở Giai đoạn Tầng 2 khi người dùng có nhu cầu đồng bộ đám mây.
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

### 8.5. Cấu Hình Android Native Plugin Trong app.json (`withNotificationListener.js`)
- Cấu hình Expo Config Plugin `./plugins/withNotificationListener.js` tự động bổ sung quyền `android.permission.BIND_NOTIFICATION_LISTENER_SERVICE` vào `AndroidManifest.xml`.
- Khai báo `<service android:name=".services.KepiNotificationListenerService" android:permission="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE" android:exported="true">` với `<intent-filter>` chứa action `android.service.notification.NotificationListenerService`.
- Đảm bảo dịch vụ chạy ngầm opt-in, bóc tách chuỗi 100% trên thiết bị cục bộ (On-Device), an toàn tuyệt đối và không gửi bất kỳ byte dữ liệu thông báo nào ra bên ngoài.



---

## 9. HỆ SINH THÁI EXPO SDK 58 & KHẢ NĂNG TƯƠNG THÍCH ĐA THIẾT BỊ (EXPO SDK 58 ECOSYSTEM)

### 9.1. Nâng Cấp Tương Thích iOS Expo Go v58.0.0
- **Đồng bộ SDK:** Chuyển đổi toàn diện core Expo sang SDK 58 (`expo: ~58.0.7`, `react-native: 0.88.0-rc.4`, `react: 19.3.0`).
- **Tương thích bắt buộc trên iOS:** Thiết bị iPhone chạy Expo Go phiên bản v58.0.0 từ Apple App Store đòi hỏi ứng dụng client phải khởi chạy từ cấu trúc SDK 58 để load bundle thành công mà không bị chặn.
- **Hệ sinh thái thư viện SDK 58:** Đồng bộ hóa toàn bộ các gói `expo-*` (`expo-camera`, `expo-image`, `expo-router`, `expo-haptics`, `expo-notifications`, `expo-file-system`, `expo-sharing`, `expo-print`...) theo bảng chuẩn `bundledNativeModules` của Expo 58.

### 9.2. Duy Trì Tối Ưu Hóa & Phòng Vệ Metro
- **Entry Point Resilience:** Giữ vững `index.js` nạp `nativeSafetyPolyfill.ts` trước `expo-router/entry`.
- **Manifest Middleware Safe Routing:** Metro bundler hỗ trợ cả giao thức `exp://`, `http://`, `https://` an toàn, ngăn chặn lỗi đọc `match[0]` trên đối tượng null khi chạy tunnel ngrok.


### 9.3. Phòng Vệ Đường Hầm WS-Tunnel (--tunnel Mode)
- **Tương thích WebSocket Dual-Interface:** Tự động tiêm `WebSocket.WebSocket = WebSocket` cho `node_modules/ws` và fallback `new (s.WebSocket || s)` trong `@expo/ws-tunnel`.
- **Đảm bảo tính sẵn sàng:** Cho phép nhà phát triển chạy `npx expo start --tunnel -c` từ mọi mạng ngoài (quán cafe, 4G/5G, văn phòng) mà không phụ thuộc vào cùng mạng LAN Wi-Fi.

### 9.4. Kiến Trúc Android-First Trên Expo SDK 58 (`expo-dev-client` + `@maplibre/maplibre-react-native` v11.5+ + TrackAsia Vietnam)
- **Ưu Tiên Android Native Dev Build:** Trên Expo SDK 58 (chạy React Native `0.88` với New Architecture mặc định, Android `compileSdk 37`, AGP 9, minSdk $\ge$ API 23), dự án định hướng **Android-First** sử dụng `expo-dev-client` (`npx expo run:android`) để mở khóa toàn bộ module native hiệu năng cao (`@maplibre/maplibre-react-native` OpenGL 60fps, `NotificationListenerService`, `AppWidget`).
- **Tích Hợp `@maplibre/maplibre-react-native` (^11.5.1+) & TrackAsia Vietnam Style URL:**
  - Vì MapLibre v11.5+ được xây dựng sẵn cho React Native New Architecture, `app.json` khai báo config plugin `"@maplibre/maplibre-react-native"` để `expo prebuild` tự cấu hình dependencies Android/Gradle. Nếu gặp xung đột Gradle của AGP 9 / `compileSdk 37`, chạy `npx expo prebuild --clean` trước `npx expo run:android`.
  - Nguồn bản đồ mặc định cho bản Build Native là **TrackAsia Vietnam Style URL** (0đ phí SDK, 200.000 lượt tải tile Việt Nam/tháng miễn phí, hỗ trợ biến môi trường `EXPO_PUBLIC_TRACKASIA_KEY`).
  - **Quy Tắc Tọa Độ Bắt Buộc:** Toàn bộ component MapLibre (`Camera`, `PointAnnotation`, `ShapeSource`) sử dụng thứ tự **`[longitude, latitude]`** (kinh độ trước, vĩ độ sau — ví dụ TP.HCM `[106.7009, 10.7769]`).
- **Dual-Runtime Fallback An Toàn Cho Expo Go:** Vì `@maplibre/maplibre-react-native` không nằm trong binary của Expo Go, `PiggySpendMapView.tsx` sử dụng kiểm tra runtime (`Constants.executionEnvironment === 'storeClient'` / dynamic `require` trong `try-catch`) để:
  1. Chạy **MapLibre Native 60fps OpenGL + TrackAsia Vietnam + GPU `GeoJSONSource` Clustering (`cluster: true`, `clusterRadius: 40`)** khi chạy trên Android/iOS Dev Client hoặc Production APK/AAB.
  2. Tự động fallback về **`NativeSlippyMap`** (`<Image>` CARTO Voyager / Esri / OSM hợp lệ ToS + `<Svg>` Vector đường phố — **tuyệt đối không gọi `mt1.google.com` cạo tile trái phép**) khi mở trên **Expo Go**, đảm bảo không bao giờ crash.
- **Chuẩn Hóa Dữ Liệu Vị Trí Thật (`expo-location` & `locationService.ts` — Quyết định 180):**
  - `Transaction` (`src/types/database.ts`) lưu trường tùy chọn `lat?: number | null` và `lng?: number | null`.
  - Khi lưu khoản chi, nếu công tắc Opt-in `vi_locket_location_pin_enabled` đang bật, `locationService.getQuickPinCoordsIfOptedIn()` lấy vị trí foreground trong `< 50ms` (`getLastKnownPositionAsync`) hoặc `Accuracy.Balanced` (timeout 1.5s, 0 chặn UI).
  - Loại bỏ hoàn toàn mảng bịa tọa độ `SAIGON_ANCHORS`: chỉ những giao dịch có `lat`/`lng` thật mới được ghim lên bản đồ; người dùng có thể bấm **"📍 Ghim vị trí hiện tại"** để gắn tọa độ thật cho khoản chi.

### 9.5. Kiến Trúc Bản Đồ Tự Chủ 0$ Trọn Đời Cho Android-First (.apk MapLibre 13.6.1 + OpenFreeMap OSM Vector + Khe Cắm PMTiles — Quyết định 182)
- **Lý do Expo Go vs Bản Build `.apk` / Dev Client:** Ứng dụng vỏ **Expo Go** từ Store không đóng gói thư viện C++ OpenGL ES `org.maplibre.gl:android-sdk:13.6.1` của `@maplibre/maplibre-react-native`. Khi biên dịch `.apk` / Dev Client bằng `npx expo run:android` hoặc EAS Build, nhân C++ MapLibre `13.6.1` được nhúng trực tiếp giúp render bản đồ Vector 60fps trọn vẹn.
- **OpenFreeMap OSM Vector (0$ Vĩnh Viễn, 0 API Key, Không Giới Hạn Quota):** Trên Android Dev Build / `.apk`, `PiggySpendMapView.tsx` sử dụng mặc định style tự chủ **`buildHeoconOsmVectorStyle`** (`src/theme/heoconMapLibreStyle.ts`) nạp trực tiếp nguồn OSM Vector **`https://tiles.openfreemap.org/planet`** (kèm font `Noto Sans Regular` / `Noto Sans Bold`, full style `liberty`, và GeoJSON bất biến **Quần đảo Hoàng Sa (Việt Nam)** & **Quần đảo Trường Sa (Việt Nam)**).
- **Khe Cắm PMTiles Offline / Self-Hosted R2 (`pmtilesMapService.ts` & `metro.config.js`):** Hỗ trợ đuôi `.pmtiles` trong Metro `assetExts` và tự động ưu tiên ghi đè URL nguồn vector bằng `pmtiles://file:///...` (file `maps/vietnam.pmtiles` lưu cục bộ trong `FileSystem.documentDirectory` chạy offline 100%) hoặc `pmtiles://https://...` (`EXPO_PUBLIC_PMTILES_URL` từ Cloudflare R2 0đ băng thông egress), kết hợp `extractNearbyPoiNameFromFeatures()` trích xuất tên POI từ vector tile hoặc mô tả người dùng nhập.
- **Xóa Custom `headers` Trên `<Image>` Trong Fallback Expo Go:** Tuyệt đối không truyền object `headers` tùy chỉnh vào `<Image source={{ uri }} />` của `NativeSlippyTile` để giữ nguyên HTTP/2 Happy Eyeballs & bộ đệm đĩa native (tránh treo IPv6 Cloudflare 29s/tile), kết hợp vẽ nền đường phố quanh vị trí GPS hiện tại bằng `<Svg>`.

### 9.6. Kiến Trúc "Hộ Chiếu Quán Quen" (Place Passport & Check-in) — 100% Native, Reverse Geocode OS & Chỉ Đường 1-Chạm (Quyết định 183)
- **Loại Bỏ Hoàn Toàn Slippy Tile & WebView:** Thay thế toàn bộ engine tải mảnh gạch bằng kiến trúc 100% Native React Native (`View`, `Text`, `Image`, `ScrollView`). Triệt tiêu vĩnh viễn tình trạng khung vuông rỗng, màn hình vàng khè hoặc lỗi nghẽn tải tile mạng trên cả Expo Go lẫn .APK.
- **Tự Động Reverse Geocoding Miễn Phí Qua OS Geocoder:** Tích hợp `Location.reverseGeocodeAsync()` khai thác Geocoder của iOS (`CLGeocoder`) và Android (`android.location.Geocoder`) với chi phí **0$ vĩnh viễn, 0 API key**, tự động chuyển đổi tọa độ GPS thành Tên Đường, Phường, Quận, Thành Phố.
- **Lưu Tên Địa Điểm & Chỉnh Sửa Linh Hoạt:** Trường `location_name` được lưu vào `Transaction`, cho phép người dùng sửa hoặc đặt Tên quán quen thuộc (VD: *Phúc Long*, *Cơm tấm Ba Ghiền*).
- **Handoff Chỉ Đường 1-Chạm Chuẩn Store:** Tích hợp `Linking.openURL()` tự động điều hướng sang ứng dụng bản đồ gốc của điện thoại (Google Maps trên Android, Apple Maps trên iOS) thông qua giao thức URL chuẩn (`geo:...`, `maps://...`, `https://www.google.com/maps/dir/...`), đem lại trải nghiệm chỉ đường chuyên nghiệp 100% không tốn chi phí phát triển bản đồ riêng.

### 9.7. Mô Phỏng Hộ Chiếu Chân Thực (True Place Passport), Con Dấu Thị Thực Các Quận (Rotated Visa Stamps), Bộ Glyphs Pixel Art 5×5 & Tối Giản UI (Quyết định 184)
- **Mô Phỏng Sổ Hộ Chiếu Du Lịch Chân Thực:**
  - Bìa Hộ Chiếu `heroPassportCard` chuẩn phong cách Neo-Brutalist: Số hộ chiếu `№ PK-8824-VN`, Quốc huy / Huy hiệu Hoàng Gia Heo Con Pixel `👑 🐷`, lưới 4 chỉ số `psgrid` (`Quán đã ghé`, `Quận đã đến`, `Quán ruột`, `Tổng chi`).
  - **Khối Con Dấu Thị Thực Các Quận (`psstamps`):** Gom cụm địa bàn theo Quận/Huyện, hiển thị dưới dạng các con dấu thị thực (`psstamp`) đóng dấu so le góc xoay `rotate: -2.5deg` và `rotate: 2.5deg` (port 1:1 từ `prototype/Ví Heo Con 24_11.html`), hiển thị `★ [TÊN QUẬN] · [SỐ LẦN] ★`.
- **Gỡ Bỏ Banner UI Thừa:** Xóa bỏ hoàn toàn thanh banner chủ quyền khỏi giao diện UI người dùng để đảm bảo không gian màn hình tối giản, chân thực và tập trung 100% vào trải nghiệm sổ Hộ Chiếu (chuyển sang lưu trữ metadata kiểm định an toàn ngầm trong `__REGRESSION_META`).
- **Bộ 8 Icon Pixel Art 5×5 Chi Tiết Port 1:1 (`KIND`):** Tái tạo chính xác ma trận pixel 5×5 từ `Ví Heo Con 24_11.html` (`food`, `cafe`, `market`, `shop`, `gym`, `gas`, `pharm`, `fun`) vẽ bằng SVG pixelated crisp-edges trên thanh sàn `rgba(255,255,255,0.55)` khi quán chưa có ảnh chụp thật.
- **Tối Giản Văn Bản & Focus Icon (Reduce Text & Focus Icon):** Rút gọn tối đa chữ rườm rà. Mỗi thẻ quán xá hiển thị ảnh chụp thật hoặc icon pixel 5×5 sắc nét, tên quán + quận, 2 badge số lần ghé & tổng chi tiêu, cùng nút `Chỉ đường 📍` 1-chạm mở Google Maps/Apple Maps.
- **Tự Động Định Vị Quận Khi Chụp Ảnh Ở Tab Camera:** Khi người dùng chụp và lưu ảnh ở Tab Camera, hệ thống lập tức gọi `reverseGeocodePlaceAsync` lấy tên đường và quận/huyện để ghi vào giao dịch, tự động mở khóa và cập nhật ngay con dấu thị thực mới trên trang Hộ Chiếu.


---

## 10. KIẾN TRÚC WEB PWA (PROGRESSIVE WEB APP) & CI/CD DEPLOY GITHUB PAGES

### 10.1. Mục Tiêu Đa Nền Tảng (Cross-Platform Deployment)
- Cung cấp kênh truy cập và thử nghiệm trực tiếp 0-cài đặt cho cả Desktop và Mobile mà không phụ thuộc vào App Store hay Expo Go.
- Cho phép người dùng iPhone mở trên Safari và bấm **"Thêm vào MH chính" (Add to Home Screen)** để chạy như một Native App độc lập toàn màn hình.

### 10.2. Cấu Hình SPA & BaseUrl Linh Hoạt
- **Client-Side SPA Output:** `app.json` cấu hình `web.output: "single"` tạo ra một tệp `index.html` duy nhất, triệt tiêu lỗi SSR `window is not defined`.
- **Dynamic BaseUrl (`app.config.js`):** Tự động nạp `experiments.baseUrl` từ `process.env.EXPO_BASE_URL`. Ở môi trường local giữ `""`, ở môi trường CI/CD GitHub Actions nạp `"/Kepi"` để khớp với GitHub Pages subpath `https://philipsgn.github.io/Kepi/`.
- **SPA Routing Fallback:** Tự động tạo bản sao `dist/404.html` từ `dist/index.html` trong pipeline CI/CD để đảm bảo khi người dùng tải lại trang (reload) hoặc truy cập trực tiếp route con không bị lỗi 404 Not Found từ máy chủ GitHub Pages.

### 10.3. Tùy Biến PWA & Responsive Desktop Shell
- **PWA Meta & Manifest (`public/index.html` & `public/manifest.json`):**
  - Khai báo đầy đủ: `display: standalone`, `apple-mobile-web-app-capable: yes`, `theme-color: #0E1620`, `apple-touch-icon.png`.
- **Responsive Desktop Shell CSS:**
  - Trên màn hình lớn (`min-width: 501px`): Giao diện ứng dụng tự động co gọn vào khung điện thoại di động căn giữa (`max-width: 430px`, `height: 94vh`, bo góc `40px`, bóng đổ mềm `box-shadow`) trên nền Khói Trầm, tái hiện chính xác trải nghiệm điện thoại trên màn hình lớn.
  - Trên thiết bị di động (`max-width: 500px`): Giao diện tự động co giãn 100% toàn màn hình, hỗ trợ `viewport-fit=cover`.

### 10.4. Trải Nghiệm Camera & Banner Add-to-Home-Screen
- **Web Camera Fallback:** Hỗ trợ Web Camera trực tiếp nếu được cấp quyền, kết hợp nút Chụp / Tải ảnh qua `ImagePicker.launchImageLibraryAsync` (`capture="environment"`), cho phép chụp ảnh biên lai hoặc chọn từ thư viện ảnh iOS/Android một cách tự nhiên.
- **PWA Install Banner (`src/components/PWAInstallBanner.tsx`):** Tự động phát hiện trình duyệt Safari trên iOS khi chưa chạy ở chế độ standalone để hiển thị thanh hướng dẫn cài đặt thanh lịch: *"Chạm nút Chia sẻ ⎋ và chọn 'Thêm vào MH chính' ➕"*, hỗ trợ ghi nhớ trạng thái đóng vào `localStorage`.

### 10.5. GitHub Actions CI/CD Pipeline (`.github/workflows/deploy-web.yml`)
- Kích hoạt tự động khi push code lên nhánh `main` hoặc chạy thủ công qua `workflow_dispatch`.
- Quy trình: Checkout $\to$ Node 22 $\to$ npm install $\to$ Chạy lint & 53 unit tests $\to$ Export Web với `EXPO_BASE_URL="/Kepi"` $\to$ Tạo `404.html` $\to$ Đóng gói và phát hành tự động lên GitHub Pages.


---

## 11. KIẾN TRÚC PHÂN HỆ AI-FIRST & GAMIFICATION ENGINE (PIGFLY v4.0)

### 11.1. AI-First Receipt OCR Pipeline & Fallback Carousel
- **Kiến trúc luồng xử lý:**
  1. *Tiền xử lý ảnh (Preprocessing):* Khử nhiễu, tăng độ tương phản cục bộ, chuẩn hóa độ phân giải 1080px WebP.
  2. *Text & Entity Extractor:* Thuật toán nhận diện tên đơn vị bán lẻ (Merchant), danh sách món hàng (Items), thuế GTGT (VAT) và Tổng tiền thanh toán (Total).
  3. *Auto Category Categorization:* Map tên các món hàng bóc tách được sang danh mục chuẩn (F&B $\to$ `Ăn uống`, Fashion $\to$ `Mua sắm`, Gasoline $\to$ `Đi lại`).
  4. *Carousel Fallback UI:* Đối với hóa đơn in mờ hoặc có nhiều số tiền (tiền hàng, tiền khách đưa, tiền thừa trả lại), hệ thống xuất ra mảng top 3 số tiền có độ tin cậy cao nhất dưới dạng Carousel Selector, cho phép người dùng chọn hoặc sửa tay trong $\le 3$s.
- **Tiêu chuẩn bảo mật:** Tuyệt đối không trích xuất hoặc lưu trữ số tài khoản in trên hóa đơn.

### 11.2. Phân Hệ Voice-to-Expense NLP Parser
- **Mục tiêu:** Nhập liệu bằng giọng nói tiếng Việt tự nhiên siêu tốc.
- **Quy chuẩn mẫu câu hỗ trợ:**
  - Tiền tố hành vi: `Ăn`, `Uống`, `Đi`, `Mua`, `Đổ xăng`, `Gửi xe`.
  - Hậu tố đơn vị tiền: `k`, `nghìn`, `ngàn`, `cành`, `lít`, `củ`, `tr`, `triệu`.
  - Parser phân tích cú pháp regex thuần (Pure Functions) chạy 100% offline trên thiết bị:
    `"Ăn bún bò 50 cành"` $\to$ `{ amount: 50000, category: 'Ăn uống', description: 'Ăn bún bò', emoji: '🍜' }`.

### 11.3. Bộ Phân Loại Hình Ảnh On-Device Ngoại Tuyến (Computer Vision)
- **Kiến trúc:** Model Lightweight Image Classification chạy qua TFLite / CoreML offline.
- **Mapping danh mục:**
  - `food_beverage` $\to$ `Ăn uống`
  - `fashion_clothing` $\to$ `Mua sắm`
  - `vehicle_transport` $\to$ `Đi lại`
  - `grocery_supermarket` $\to$ `Chợ / Siêu thị`
  - `books_education` $\to$ `Học tập`
- **Tốc độ:** Phân loại $< 150$ms trên CPU điện thoại, 0 byte gửi ra Internet.

### 11.4. Gamification Store & Pure Rules Engine (Zero-FEP Policy)
- **`rulesEngine.ts` (Pure Functions):**
  - Tuân thủ nghiêm ngặt **Quyết định 112**: Khai tử hoàn toàn điểm FEP ảo (Zero Virtual Points Policy).
  - Động lực cốt lõi quy tụ vào **Chuỗi ngày kỷ luật (Streak Days)** và **Tâm trạng thực tế của chú heo PigFly Lottie**.
  - 5 Tầng Mây Tài Chính tính trực tiếp theo chuỗi ngày: Tầng 1 (0 ngày), Tầng 2 (7 ngày), Tầng 3 (21 ngày), Tầng 4 (45 ngày), Tầng 5 (90 ngày).
  - Đánh giá các biến ngữ cảnh (`todaySpent`, `todayBudget`, `streakDays`, `photosCount`) sau mỗi giao dịch `CONFIRMED` hoặc sự kiện Rollover 00:00.
- **`gamificationStore.ts`:**
  - Quản lý Chuỗi Streak, 5 Tầng Mây Tài Chính, Vị trí Cờ Tỷ Phú và Cảm xúc Mascot thời gian thực.

### 11.5. Động Cơ Mini-Game "Cờ Tỷ Phú Đầu Tư Tài Chính"
- **Kiến trúc bàn cờ 16 ô (`monopolyBoardEngine.ts` & `FinancialMonopolyModal.tsx`):**
  - Xúc xắc ngẫu nhiên 1..6 bước với hoạt họa xúc xắc Pop-Anime 60fps.
  - Ô sự kiện: Ô Khởi Hành, Ô Bẫy FOMO (Lựa chọn Cứu Ví), Ô Đầu Tư Tích Lũy, Ô Cơ Hội (Rút thẻ may mắn), Ô Cổ Tức.
  - Đặt độc quyền trong **Tab 3 (Squad Room)** phục vụ hoạt động sinh hoạt nhóm bạn thân.
  - Đồng bộ tiến độ bàn cờ vào `AsyncStorage` (`@pigfly_monopoly_v1`).

### 11.6. Giao Thức Squad 2.0 & SOS Overspending Beacon
- **Ràng buộc quy mô:** $2 \le \text{Members} \le 4$.
- **Cơ chế SOS:** Khi một thành viên chi tiêu vượt hạn mức ngày (`todaySpent > todayBudget && todayBudget > 0`):
  1. Mascot chuyển sang mood `PANIC`.
  2. Tự động kích hoạt SOS Overspending Beacon vào kênh chat Squad qua `squadStore.triggerOverspendingSos()`.
  3. Màn hình của bạn thân hiển thị băng rôn báo động nhấp nháy kèm 2 nút tương tác: [🛡️ Thả Meme Khuyên Can] và [☕ Động Viên].
  4. Bảng xếp hạng tuần (Squad Leaderboard) dựa trên Chuỗi ngày Streak và Tỷ lệ tiết kiệm thực tế.

### 11.7. Hệ Thống Mascot Lottie Animation & Anime Magazine Report
- **`PigFlyLottieMascot.tsx`:** Quản lý 4 trạng thái cảm xúc (`FLYING_HIGH`, `CHILL`, `PANIC`, `STARVING`) với spring physics nhún nảy khi chạm.
- **`AnimeMagazineReportSheet.tsx` (Tab 1 Stats):**
  - Trực quan hóa tài chính dạng tạp chí truyện tranh Anime Pop-Art.
  - Bộ 3 chỉ số KPI mới:
    1. *Runway Score:* Số ngày dòng tiền trụ được với tốc độ chi tiêu hiện tại.
    2. *Impulse Ratio:* Tỷ lệ chi tiêu bốc đồng.
    3. *Savings Velocity:* Tốc độ tích lũy thực tế hàng ngày.

### 11.8. Cấu Hình Android Native AppWidget
- Plugin Expo `./plugins/withAppWidget.js` tự động cấu hình `AppWidgetProvider` trong `AndroidManifest.xml`.
- Widget hiển thị: Mascot Chibi PigFly, Hạn mức `Hôm nay tiêu được`, và 2 nút hành động mở Camera hoặc ghi nhanh khoản nhỏ.
