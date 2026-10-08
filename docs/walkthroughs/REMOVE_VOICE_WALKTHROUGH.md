# 🍂 WALKTHROUGH BÁO CÁO: LOẠI BỎ TÍNH NĂNG VOICE KHỎI DỰ ÁN KEPI

> **Dự án:** Kepi (Ví Locket) — Mobile App Chi Tiêu Bằng Ảnh & Quét Mã QR (Phong cách Hà Nội Thu Đông)  
> **Trạng thái:** ✅ Đã hoàn tất 100%  
> **Mục tiêu đạt được:** Loại bỏ vĩnh viễn tính năng ghi âm giọng nói (voice input/STT) và quyền Microphone (`RECORD_AUDIO` / `NSMicrophoneUsageDescription`), tối ưu tốc độ ghi nhận $\le 3$s, bảo vệ quyền riêng tư tuyệt đối cho người dùng và sẵn sàng phê duyệt ứng dụng trên Google Play Store.

---

## 1. TỔNG HỢP CÁC FILE ĐÃ CHỈNH SỬA & DỌN DẸP

### 1.1. Cấu Hình Quyền & Hệ Điều Hành (OS Permissions)
- [app.json](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/app.json):
  - Gỡ bỏ `NSMicrophoneUsageDescription` khỏi mục `ios.infoPlist`.
  - Gỡ bỏ quyền `android.permission.RECORD_AUDIO` khỏi mục `android.permissions`.
  - Gỡ bỏ plugin `expo-audio` khỏi mảng `plugins`.
- [src/hooks/useCameraPermissions.ts](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/src/hooks/useCameraPermissions.ts):
  - Xóa bỏ import `expo-audio` và `audioPermission`.
  - Giữ lại thuần túy `cameraPermission` cho khung ngắm Camera.

### 1.2. Cơ Sở Dữ Liệu & Types (Database & Schema)
- [src/types/database.ts](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/src/types/database.ts):
  - Cập nhật kiểu `TransactionSource = 'PHOTO' | 'MANUAL' | 'SCREENSHOT' | 'QR'` (loại bỏ `'VOICE'`).
- [supabase/migrations/004_schema_refinement_and_sources.sql](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/supabase/migrations/004_schema_refinement_and_sources.sql):
  - Ràng buộc check constraint trên `transactions.source` đã loại bỏ hoàn toàn `'VOICE'`, chỉ còn `('PHOTO', 'MANUAL', 'SCREENSHOT', 'QR')`.
- [src/store/transactionStore.ts](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/src/store/transactionStore.ts):
  - Thay đổi toàn bộ các bản ghi seed giao dịch có `source: 'VOICE'` thành `source: 'PHOTO'`.

### 1.3. Giao Diện & Logic Ứng Dụng (UI & Components)
- [src/components/camera/ShutterButton.tsx](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/src/components/camera/ShutterButton.tsx):
  - Viết lại thành nút bấm 1 chạm (Single-tap shutter) đàn hồi nhún xúc giác `0.94x`, rung `Heavy impact`.
  - Gỡ bỏ toàn bộ code `expo-audio`, trạng thái `isRecording`, logic đè giữ `onPressIn / onPressOut`, và xóa bỏ component sóng âm `VoiceWaveform`.
- [src/components/camera/VoiceWaveform.tsx](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/src/components/camera/VoiceWaveform.tsx):
  - **Đã xóa file vĩnh viễn** khỏi dự án.
- [src/components/chat/ChatInputBar.tsx](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/src/components/chat/ChatInputBar.tsx):
  - Viết lại thanh nhập liệu chat thuần text + gửi ảnh, nút Send rõ ràng, gỡ bỏ nút Mic và sóng âm.
- [src/services/gemini.ts](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/src/services/gemini.ts):
  - Gỡ bỏ logic xử lý audio/STT `processVoiceOrTextInput`, thay thế bằng hàm `parseExpenseTextInput` chuyên sâu xử lý ngôn ngữ tiếng Việt tự nhiên cho text và chip giá.
- [app/(main)/index.tsx](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/app/(main)/index.tsx):
  - Xóa handler `handleVoiceRecorded`, gỡ prop `onVoiceRecorded` khỏi `ShutterButton`, tối ưu luồng chụp ảnh trực tiếp mở chip giá.

### 1.4. Đồng Bộ Ngược Toàn Diện Tài Liệu Sống (/docs & AGENTS.md)
- [AGENTS.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/AGENTS.md): Cập nhật tiêu đề dự án, Ma trận Feature-to-Doc (Tab 2 Camera 1 chạm $\le 3$s), và Quy chuẩn Haptics (Bấm Shutter, Nhập chip giá).
- [docs/DECISIONS.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/DECISIONS.md): Cập nhật Quyết định 7, 12 và bổ sung **Quyết định 22: Loại bỏ Hoàn toàn Chức năng Voice (Tối ưu Tốc độ $\le 3$s & Quyền Riêng tư Tuyệt đối)**.
- [docs/PRD_M0_VI_LOCKET.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/PRD_M0_VI_LOCKET.md): Cập nhật PRD v4.1, chuyển trọng tâm sang Chụp ảnh 1 chạm kết hợp chip giá và quét VietQR.
- [docs/TECH_ARCHITECTURE.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/TECH_ARCHITECTURE.md): Cập nhật schema SQL cho `transactions.source` không còn `VOICE`.
- [docs/screens/CAMERA.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/screens/CAMERA.md): Cập nhật cây component và bảng cử chỉ: Nút Shutter 1 chạm, bỏ hoàn toàn cử chỉ đè giữ thu âm.
- [docs/screens/CHAT.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/screens/CHAT.md): Cập nhật cây component và thao tác gửi chat thuần text.
- [docs/PHASES.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/PHASES.md): Đổi tên Phase 2 thành *Camera Mùa Đông & Chụp Ảnh 1 Chạm Siêu Tốc*, cập nhật DoD không còn voice.
- [docs/PAGES_FEATURES.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/PAGES_FEATURES.md): Cập nhật bảng ma trận tính năng: Ghi chi/thu bằng ảnh + chip giá / text.
- [docs/features/QR_PAY.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/features/QR_PAY.md): Đồng bộ constraint `source IN ('PHOTO', 'MANUAL', 'SCREENSHOT', 'QR')`.
- [docs/PLAN.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/PLAN.md): Cập nhật kế hoạch kiểm thử NLP và quản trị rủi ro không phụ thuộc voice.
- [docs/ROADMAP.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/ROADMAP.md): Cập nhật định hướng sản phẩm Kepi.
- [docs/PRIVACY.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/PRIVACY.md): Bổ sung Mục 1.2 cam kết **Zero Microphone Usage** (0 quyền Mic).

---

## 2. KẾT QUẢ KIỂM THỬ XÁC THỰC TOÀN DIỆN

### 2.1. Kiểm Tra Biên Dịch TypeScript (`npx tsc --noEmit`)
```bash
$ npx tsc --noEmit
# Exit code: 0 (0 error, 0 warning)
```
- Toàn bộ codebase sạch bóng 100%, không còn bất kỳ import hay reference nào tới `expo-audio` hay `VoiceWaveform`.

### 2.2. Kiểm Tra Hồi Quy Logic Toàn Bộ Nghiệp Vụ (`node run-all-tests.js`)
```text
=== VÍ LOCKET LOGIC & REGRESSION TEST SUITE (BƯỚC E–F) ===
✅ Test 1 Passed: Pending transactions isolation verified (0 impact on total budget)
✅ Test 2 Passed: Retention policy (QR >24h in unconfirmed, Screenshot 7 days) verified
✅ Test 3 Passed: Duplicate transaction warning (±10 mins / same URI) verified
✅ Test 4 Passed: Old photo date verification prompt (> 7 days) verified
✅ Test 5 Passed: Telemetry zero-PII sanitization verified
✅ Test 6 Passed: VietQR Dual-Engine Routing verified
✅ Test 7 Passed: Guest Sync Guard verified (0 cloud writes for guests)
✅ Test 8 Passed: Seed cleanup and real transaction migration verified
✅ Test 9 Passed: 6-digit OTP formatting verified
✅ Test 10 Passed: Profile schema payload adheres strictly to Supabase schema
✅ Test 11 Passed: Hierarchical Cloud WebP path format verified
✅ Test 12 Passed: EXIF stripping contract verified (0 GPS / Device leakage)
✅ Test 13 Passed: Guest Storage & Realtime Sync Guard verified (0 cloud bytes)
✅ Test 14 Passed: Realtime Subscription Lifecycle verified (INSERT/UPDATE/DELETE + teardown)
✅ Test 15 Passed: Hourly Wage & Work Hours Conversion verified (125k/h, boba -> 17 mins, dinner -> 2h)
✅ Test 16 Passed: UTF-8 BOM CSV Export & Privacy Sanitization verified (Excel-ready, 0 STK leakage)
✅ Test 17 Passed: Monthly Report HTML Generation & Monogram K Branding verified
✅ Test 18 Passed: In-App Data Analytics KPI Engine verified (Savings Rate, Burn Rate, Runway Forecast)

🎉 ALL 18 VERIFICATION & REGRESSION TESTS PASSED CLEANLY (18/18)!
```

---

## 3. LỢI ÍCH SAU KHI LOẠI BỎ TÍNH NĂNG VOICE

1. **Tốc độ ghi nhận siêu tốc ($\le 3$s):** Người dùng chụp ảnh 1 chạm $\rightarrow$ hiện ngay các chip giá thường dùng (30k, 45k, 50k, 100k, 200k) hoặc gõ nhanh, lưu ngay mà không phải chờ xử lý Speech-to-Text qua mạng.
2. **Quyền riêng tư tối đa & Dễ duyệt Store:** Không còn quyền Microphone nhạy cảm (`RECORD_AUDIO`). Ứng dụng chỉ xin quyền Camera và Media Library, giúp quy trình kiểm duyệt trên Google Play Store và Apple App Store diễn ra thuận lợi, giảm thiểu rào cản tâm lý người dùng khi cài app.
3. **Bộ cài nhẹ và ổn định hơn:** Gỡ bỏ hoàn toàn module native audio cồng kềnh, giảm nguy cơ crash trên các dòng thiết bị Android cấp thấp.
