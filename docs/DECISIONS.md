# NHẬT KÝ QUYẾT ĐỊNH THIẾT KẾ & KIẾN TRÚC (DECISIONS.MD)

> **Quy ước:** Mỗi quyết định MỘT dòng tóm tắt bản chất, lý do và phạm vi.

1. **Phạm vi tính năng:** App chỉ mở app ngân hàng để người dùng tự xác nhận, không xử lý thanh toán, không giữ tiền, không đọc biến động số dư SMS/Notification.
2. **Bảo mật số tài khoản:** Không lưu số tài khoản người nhận vào CSDL/AsyncStorage/log/analytics, chỉ giữ `accountRef` trong RAM phiên quét để dựng deeplink rồi giải phóng ngay.
3. **Chống mã QR giả mạo:** Tuyệt đối không mở trực tiếp URL có trong mã QR, chỉ tự dựng deeplink tới tên miền ngân hàng được phép (`dl.vietqr.io` hoặc native scheme).
4. **Cô lập phép tính tài chính:** Chỉ các khoản có `status: 'CONFIRMED'` mới được tính vào ngân sách ngày, tổng chi tháng, số dư và biểu đồ; khoản `PENDING` tuyệt đối không tính.
5. **Cơ chế đọc mã:** Bộ giải mã EMVCo TLV chạy 100% trên thiết bị ngoại tuyến (offline), xử lý đúng byte UTF-8 cho tiếng Việt có dấu và kiểm tra chuẩn CRC-16 CCITT.
6. **Ứng dụng ngân hàng mục tiêu:** Thiết bị thử nghiệm chính là iPhone (iOS), ngân hàng ưu tiên 1 là Techcombank Mobile (BIN 970407) với danh sách scheme hỗ trợ cấu hình trong `app.json`.
7. **Tự động mở app:** Mặc định BẬT tùy chọn "Tự mở app ngân hàng sau khi quét" đối với mã động có số tiền; mã tĩnh chưa có số tiền bắt buộc người dùng gõ số tiền trước khi mở.
8. **Chế độ Định mua:** Quét mã ở chế độ Định mua có số tiền từ 200.000 đ trở lên bắt buộc hiển thị màn "Giá thật trước khi trả" (quy đổi giờ làm/ngày ngân sách) trước khi mở ngân hàng.
9. **Kỷ niệm sau thanh toán:** Sau khi xác nhận "Đã chuyển", app gợi ý người dùng chụp nhanh ảnh món đồ để lưu giữ khoảnh khắc trong sổ ảnh Locket (cho phép bỏ qua).
10. **Phục hồi phiên giao dịch:** Bản ghi `PENDING` được lưu bền trước khi mở app ngân hàng để đảm bảo nếu hệ điều hành tắt app thì khi mở lại vẫn hiện thẻ xác nhận "Đã chuyển xong chưa?".
11. **Chống trùng lặp:** Nếu người dùng quét QR và sau đó chụp màn hình giao dịch cùng số tiền, cùng nơi nhận trong vòng 10 phút, app sẽ đề xuất gộp bản ghi thay vì tạo mới.
12. **Tính năng cờ (Feature Flag):** Toàn bộ phân hệ quét mã VietQR được đặt dưới cờ tính năng `qr_pay` (mặc định tắt), cho phép bật/tắt tức thì mà không ảnh hưởng tới luồng chụp ảnh hiện tại.
13. **Nền tảng phát hành ưu tiên M1:** Ưu tiên Google Play Store (CH Play) trước ($25 đóng 1 lần, thị phần ~70% Việt Nam, duyệt nhanh) để tối ưu kinh phí trước khi lên Apple App Store ($99/năm).
14. **Kiến trúc Xác thực Production Tối Giản (2 Cổng Duy Nhất):** Loại bỏ hoàn toàn luồng nhập Email OTP rườm rà. Chỉ cung cấp đúng 2 lối vào: **"Tiếp tục với Google"** (1-chạm OAuth, tự động đồng bộ đám mây Supabase vĩnh viễn) và **"Vào ngay"** (1-chạm vào thẳng Camera, 100% offline local sandbox).
15. **Bảo vệ CSDL & Bản chất HĐH (Guest Sandbox & Cloud Sync):** Người dùng "Vào ngay" chạy hoàn toàn trong Local Sandbox thiết bị (chặn ghi cloud 0 byte). Người dùng được hiểu rõ bản chất HĐH (iOS & Android xóa sạch sandbox khi gỡ app). Kepi chỉ đặt lời nhắc khéo tinh tế tại Tab Hồ Sơ để khuyến khích liên kết Google khi cần lưu trữ lâu dài.
16. **Nguyên Tắc Bắt Đầu Từ Số 0 (Zero Seed & Zero Hardcore Numbers):** Khi bấm "Vào ngay", ứng dụng xóa bỏ triệt để 7 giao dịch mẫu seed (`tx-seed-*`) và không áp đặt bất kỳ số tiền/ngân sách giả định nào; toàn bộ sổ chi tiêu và số dư bắt đầu từ con số 0đ trung thực.
17. **Cơ chế Khởi động & Bảo vệ Điều hướng (Startup Routing & Camera Auth Guard):** Khắc phục lỗi loop điều hướng bằng `useSegments()`, luôn duy trì cây Navigation `<Stack>`, và chặn hoàn toàn việc render giao diện/khởi tạo Camera ở màn hình chính khi chưa đăng nhập, đảm bảo app luôn mở đầu bằng màn hình Đăng Nhập / Đăng Ký.
18. **Nhận diện Thương hiệu Kepi & Giao diện Auth Tone Xanh Mint Ban Mai (Morning Sunlit Mint):** Định vị thương hiệu **Kepi — KEEP WHAT MATTERS**, thiết kế giao diện đăng nhập tươi sáng, tràn đầy hy vọng với nền gradient Xanh Mặt Trời nhạt (`#E0F2FE`) chuyển tiếp sang Xanh Mint thanh mát (`#D1F4E0`) và Kem Ngà (`#F4FBF7`), xóa tan hoàn toàn cảm giác u tối; Logo Monogram K phối màu Xanh Rừng Đậm Phố Cổ (`#0F2F24`) kết hợp Vàng Hổ Phách Nắng Thu (`#E59844`); Câu Quote truyền cảm hứng in nghiêng mềm mại đắt giá trong ngoặc kép: *“Góp chút nhỏ, dựng tương lai to”* (đã loại bỏ hoàn toàn các dòng phụ đề và văn bản thừa); bộ đôi nút tối giản: Nút Google nền Trắng Sứ (`#FFFFFF` đổ bóng mềm) và Nút Vào Ngay thuần chữ căn giữa trên nền Xanh Ngọc Đậm (`#0F2F24` chữ Trắng Kem Sữa, triệt tiêu icon tia sét để đạt độ tối giản tuyệt đối).
19. **Kiến trúc Lưu trữ Hình ảnh Cloud & Realtime Sync 2 Chiều (Phase M1.2):** Tự động nén WebP dual-resolution (Full 1080px / Thumb 240px) và triệt tiêu 100% EXIF metadata trước khi upload lên Supabase Storage bucket `receipt-photos`, phân cấp đường dẫn `{userId}/{YYYY-MM}/{transactionId}.webp`; kích hoạt kênh Supabase Realtime WebSocket lắng nghe cập nhật 2 chiều tức thì cho bảng `transactions` (bảo vệ Guest Sync Guard 0 cloud writes).
20. **Quy Đổi Giờ Công Lao Động & Xuất Báo Cáo Tài Chính (Phase M1.3):** Tự động quy đổi lương giờ (`hourly_rate = monthly_income / (work_days * hours_per_day)`) hoặc nhập thủ công để trực quan hóa giá trị món đồ sang phút/giờ làm việc; hỗ trợ xuất CSV chuẩn UTF-8 BOM (`\uFEFF`) tương thích 100% Microsoft Excel/Google Sheets tiếng Việt và xuất Báo cáo PDF A4 phong cách Kepi (Monogram K, chỉ số thu - chi - tích lũy, cơ cấu danh mục) qua Native Share Sheet (`expo-print` + `expo-sharing`), cam kết 0 rò rỉ số tài khoản ngân hàng.
21. **In-App Data Analytics Dashboard trong Tab Thống Kê & Tinh Gọn Profile:** Thay vì xuất file PDF đẩy người dùng ra ngoài ứng dụng, Kepi xây dựng Dashboard phân tích tổng kết tháng chuyên sâu như một Data Analyst ngay tại Tab Thống Kê với bộ 3 KPI Sức khỏe Tài chính (Savings Rate %, Daily Burn Rate, Runway Forecast) và Segmented Switch 2 chế độ (`[📊 Phân tích Data]` vs `[📸 Cuốn Album ảnh]`), đồng thời loại bỏ thẻ Xuất Báo Cáo ở Profile để đạt độ tối giản tuyệt đối.
22. **Loại bỏ Hoàn toàn Chức năng Voice (Tối ưu Tốc độ $\le 3$s & Quyền Riêng tư Tuyệt đối):** Quyết định khai tử toàn bộ chức năng ghi âm giọng nói (voice input/STT) và gỡ bỏ quyền Microphone (`RECORD_AUDIO` / `NSMicrophoneUsageDescription` / `expo-audio`). Thay thế bằng luồng Chụp ảnh 1 chạm (Single-tap Shutter) kết hợp chip giá số tiền thông minh hoặc nhập tay tức thì $\le 3$s. Giúp app phản hồi mượt mà không có độ trễ STT, bảo vệ quyền riêng tư người dùng tối đa (0 quyền mic), và đáp ứng tiêu chuẩn kiểm duyệt nhanh chóng của Google Play Store.
23. **Tiện Ích Số Dư & Trừ Tiền Ngầm Màn Hình Khóa (Lock Screen Zero-Friction Utility - Phase M1.4):** Để xóa bỏ hoàn toàn rào cản phải mở app mỗi lần mua đồ nhỏ, Kepi ghim thanh thông báo số dư ngày hôm nay trực tiếp trên Màn hình khóa với 2 nút hành động ngầm `[-30k]` và `[-50k]` (lưu giao dịch và cập nhật số dư in-place không cần mở app, kèm nút `[↩️ Hoàn tác]` khôi phục số dư ngay trên thông báo nếu bấm nhầm); nút `[📸 Chụp món]` và hệ thống deep link (`kepi://camera`, `kepi://scan-qr`) mở thẳng Camera Viewfinder dùng chung chỉ trong $< 0.5$s.
24. **Nhận Diện & Bàn Giao Ví Điện Tử ZaloPay/MoMo Qua Whitelist URL & Hàng Chờ PENDING (Phase M1.5):** Không tích hợp Merchant API (để dành M2/M3 khi có tư cách pháp nhân), Kepi mở rộng luồng quét QR trên Camera: tự động nhận diện mã ZaloPay (`qr.zalopay.vn`, `zalopay://`) và MoMo (`nhantien.momo.vn`, `momo://`) qua bộ lọc Whitelist Domain an toàn; hiển thị thẻ phát hiện ví điện tử cho phép nhập số tiền tức thì hoặc mở app thẳng qua Universal Link/Scheme, đồng thời tạo giao dịch `PENDING` (nguồn `E_WALLET`, Zero PII) đưa vào Hộp xác nhận để người dùng chốt số tiền và lưu sổ sau khi thanh toán xong.
25. **Chiến Lược Cạnh Tranh Vượt Trội (Unfair Advantage vs Competitors):** Giải quyết dứt điểm các bức xúc lớn nhất của người dùng từ các ứng dụng đối thủ: Cam kết **Ghi chép & Lưu ảnh KHÔNG GIỚI HẠN** (tuyệt đối 0 bắt xem video quảng cáo để record), **Tự động đồng bộ Supabase Cloud vĩnh viễn** (0 rủi ro mất dữ liệu khi đổi/reset máy), và **Thuật toán nén WebP $\le 80$KB** tự dọn cache (0 lo đầy bộ nhớ điện thoại).
26. **Dòng Tiền Liên Tục (Running Balance) & Tự Động Hóa Chuyển Kỳ Tháng:** Loại bỏ triệt để điểm khó chịu "bắt người dùng bấm reset thủ công mỗi tháng" của đối thủ. Kepi coi số dư là một dòng tiền liên tục (`Running Balance` giống tài khoản ngân hàng thực tế, tiền thừa tháng trước tự động tiếp nối sang tháng sau); vào 00:00 ngày đầu tháng, hệ thống tự động kết chuyển mốc tổng kết tháng cũ lưu vào tab Thống Kê và mở chu kỳ tháng mới hoàn toàn tự động (0 thao tác thủ công).
27. **Hệ Thống Danh Mục Tùy Biến Toàn Diện (Custom Categories Engine — Thu & Chi):** Phân tách rõ ràng hai luồng **CHI TIÊU** và **THU NHẬP**; cung cấp bộ danh mục chuẩn đời sống (Ăn uống, Đi lại, Nhà cửa, Thuốc men, Nuôi pet, Cho mẹ, Lương, Thưởng...) và cho phép người dùng tự do Thêm / Sửa / Xóa / Đổi Icon Vector (`lucide-react-native`) / Đổi Màu. Quản lý tập trung trong tab Hồ Sơ và hỗ trợ lối tắt bấm `+ Tạo nhanh danh mục` ngay tại Bottom Sheet ghi chép.
28. **Loại Bỏ Giao Dịch Định Kỳ Tự Động (Bảo Vệ Tính Chân Thực Của Khoảnh Khắc):** Quyết định không phát triển tính năng tự động ghi sổ định kỳ ngầm (recurring auto-transactions) để tránh phát sinh giao dịch ảo sai lệch ngày giờ thực tế; duy trì nguyên tắc cốt lõi của Ví Locket: khi nào người dùng thực tế phát sinh giao dịch thì lúc đó mới chụp ảnh/quét QR để ghi sổ chân thực 100%.
29. **Thuật Toán Tái Phân Bổ Ngân Sách Động (Dynamic Smoothing Algorithm):** Ngân sách mỗi ngày được tính toán tự động dựa trên $\frac{\text{Số tiền khả dụng còn lại}}{\text{Số ngày còn lại trong tháng}}$. Khi người dùng chi nhiều hơn trong một ngày, hệ thống không gây áp lực số âm mà tự động phân bổ đều số tiền còn lại cho các ngày kế tiếp trong tháng, giúp người dùng duy trì kỷ luật chi tiêu đến ngày cuối cùng của tháng.
30. **Kết Chuyển Tháng Tự Động Kèm Banner Chào Mừng (Automated Month Rollover with Greeting Banner):** Hệ thống tự động phát hiện chu kỳ tháng mới (`lastActiveMonth !== currentMonth`) để kết chuyển 100% số dư thực tế tháng cũ sang chu kỳ mới, tính lại ngân sách theo số ngày tháng mới, và hiển thị Banner/Toast trang nhã ở đầu Tab Sổ thông báo số tiền dôi dư được chuyển tiếp trọn vẹn.
32. **Kiến Trúc Ngân Sách Single Source of Truth:** `todaySpent`, `weeklySpent`, `todayIncome` và `realBalance` được tính toán trực tiếp từ mảng `transactions` đã `CONFIRMED`. Mọi thao tác Thêm, Sửa (`updateTransaction`), Xóa (`deleteTransaction`) hoặc Hoàn tác lập tức tự động đồng bộ lại các chỉ số ngân sách trong `budgetStore`, triệt tiêu hoàn toàn rủi ro lệch pha dữ liệu.
33. **Rollover 100% Lũy Kế Cứng Hàng Ngày (Hard Daily Rollover):** Khi bước sang ngày mới (qua 00:00), tiền thừa hôm trước được cộng dồn 100% vào hạn mức hôm nay; nếu hôm trước tiêu lố, phần âm bị trừ thẳng vào hạn mức hôm nay. Kích hoạt tự động khi mở app hoặc khi quay lại app từ nền (`AppState`).
34. **Bảo Tồn & Tự Động Hủy PENDING Sau 7 Ngày:** Khoản PENDING quá 24h được gắn nhãn cảnh báo "Đã quá 24h" và tiếp tục giữ trong Hộp xác nhận. Nếu để quá 7 ngày không thao tác, hệ thống tự động đổi sang `CANCELLED` để dọn rác mà không gây thất thoát dữ liệu ngầm.
35. **Tự Do Vuốt Ngang 100% & Tab Bar Tối Giản Không Viền (Borderless Glass):** Giữ cử chỉ vuốt ngang tự do ở tất cả 5 màn hình kể cả Camera; Tab Bar nổi (`FloatingPillTabBar`) loại bỏ triệt để viền bo ngoài quanh các nút icon và quanh viên thuốc trượt, mang lại diện mạo kính mờ thanh thoát, hiện đại.
36. **Hoàn Thiện Tuyến Đường Auth Callback:** Bổ sung `app/(auth)/callback.tsx` bắt URL token khi Google OAuth redirect về, đồng thời giữ nguyên luồng Khách (Guest) 1 chạm 100% offline.
37. **Thiết Lập Chào Mừng Vui Tươi & Tự Động Tính Hạn Mức Ngày (Fun Minimalist Onboarding):** Tinh gọn triệt để trang thiết lập chào mừng: Tiêu đề ngắn gọn, thân mật, thu hẹp khoảng cách spacing, loại bỏ hoàn toàn viền bo quanh icon (Borderless Icons phẳng, thoáng). Người dùng chỉ cần nhập Tên và Thu nhập; hệ thống hỗ trợ danh sách Chi phí cố định nhiều khoản với icon `+` và chip gợi ý nhanh (Tiền trọ, Điện nước, Internet, Trả góp...). Hạn mức tiêu mỗi ngày được tự động tính toán tức thì theo công thức $\frac{\text{Thu nhập} - \sum \text{Cố định}}{30}$ kèm Live Preview trực quan, sinh động. Đối với người dùng chưa có thu nhập ổn định (học sinh/freelancer), hỗ trợ nút "Đặt nhanh 100k/ngày & Vào luôn" để bắt đầu trải nghiệm ngay mà không bị chặn.
38. **Cơ Chế Phòng Vệ Runtime Native (Native Resilience & Safe Entry Point):** Giải quyết triệt để lỗi sập runtime `Cannot find native module 'ExpoAsset'`, cảnh báo `No native ExponentConstants module found` và lỗi gián đoạn đăng ký root component `Invariant Violation: "main" has not been registered`. Khởi tạo entry point trung tâm `index.js` nạp `src/utils/nativeSafetyPolyfill.ts` trước `expo-router/entry`. Cung cấp fallback qua `NativeModulesProxy` (`expo-modules-core`) và React Native `NativeModules` thay vì gán đè trực tiếp vào `expo.modules` (vốn là JSI HostObject sở hữu bởi native Swift sẽ ném `ReadOnlyExpoModulesPropertyException`); bọc try-catch tuyệt đối để đảm bảo tương thích 100% với Expo Go trên iOS/Android; dọn sạch schema `app.json` (bỏ cờ root `newArchEnabled` & `splash` không hợp lệ, loại bỏ các plugin không tồn tại) đạt 21/21 tiêu chí `npx expo-doctor`; gỡ bỏ hoàn toàn dependency rác `expo-audio` khỏi `package.json` và Android permissions.
39. **Động Cơ Tự Động Ghi Sổ Từ Thông Báo Ngân Hàng Trên Android (Offline Zero-Server Notification Listener):** Định hướng tập trung toàn lực vào trải nghiệm mượt mà nhất cho người dùng Android thông qua Native Notification Access. Loại bỏ nhu cầu phức tạp của iOS Shortcuts và máy chủ webhook trung gian. Xây dựng bộ Parser bóc tách đa ngân hàng (TPBank `TK: ... / PS: -48.000VND`, Vietcombank, MBBank, Techcombank, ACB, VPBank, OCB...) hoạt động **100% OFFLINE** trên thiết bị; tích hợp bộ lọc an toàn chặn 100% tin chứa OTP và tin khuyến mãi; tự động phân loại danh mục theo từ khóa; tự động ghi thẳng vào Sổ chi tiêu (`CONFIRMED`) với Card đồ họa ngân hàng; cung cấp giao diện quản lý ngân hàng và khu vực thử nghiệm trực quan trong Tab Hồ Sơ.
40. **Hợp Nhất 3 Cơ Chế Ghi Chép Vào Màn Hình Camera (3-in-1 Camera Quick Hub):** Biến màn hình Camera (Tab 2) thành trung tâm tiếp nhận đa năng tối thượng mà không làm rối mắt khung ngắm: (1) Chụp ảnh món đồ thực tế bằng nút Shutter hoặc bấm nút Thư viện ảnh để tải biên lai/hóa đơn; (2) Tự động nhận diện mã VietQR tức thì khi giơ camera qua; (3) Tự động bắt thông báo biến động số dư ngân hàng (TPBank, VCB, MB...) và lập tức hiển thị Smart Floating Pill trên khung ngắm máy ảnh (`⚡ TPBank: Đã tự động ghi -48.000đ (Highlands)`). Nếu người dùng bấm chụp ảnh lúc Pill đang hiển thị, ảnh món đồ vừa chụp sẽ được tự động gắn đè vào giao dịch ngân hàng đó, hoàn thiện chu trình chi tiêu bằng ảnh siêu tốc $\le 3$s.
41. **Quy Chuẩn UX Hậu Tố Tiền Tệ Cố Định (Fixed Currency Suffix) & Thanh Trượt Thu Nhập Phi Tuyến Tính (0 - 300tr+):** Loại bỏ hoàn toàn lỗi kẹt phím Backspace do nhúng chữ "đ" vào chuỗi giá trị của `TextInput`; tách "đ" thành nhãn hậu tố cố định đứng bên ngoài ô nhập liệu để phím Backspace trừ lùi các chữ số định dạng phân cách hàng nghìn mượt mà về 0 (áp dụng cho cả Thu nhập và Chi phí cố định). Thay thế các chip chọn nhanh cố định bằng Thanh trượt (Slider) phi tuyến tính `0 - 300tr+` xây dựng bằng `PanResponder` thuần React Native (0 dependency native ngoài): nửa đầu (0 - 30tr) bước 500k cực êm cho giới trẻ/người mới đi làm, nửa sau tăng dần đến 300tr+ cho người thu nhập cao; đồng bộ 2 chiều tức thì giữa thao tác kéo trượt và gõ phím; phản hồi rung xúc giác cơ khí nhẹ (`Haptics.selectionAsync()`) theo phong cách Vàng Thu Hà Nội (`#E59844`).
42. **Công Thức Hạn Mức Ngày 3 Trụ Cột (Pay Yourself First) & Mục Tiêu Tích Lũy Tháng:** Chuẩn hóa logic tính toán hạn mức chi tiêu mỗi ngày dựa trên 3 trụ cột tài chính vững chắc: $\text{Hôm nay tiêu được} = \frac{\text{Thu nhập} - \sum \text{Cố định} - \text{Tích lũy}}{30 \text{ ngày}}$. Bổ sung thẻ 'Mục tiêu tích lũy / tháng' (tùy chọn linh hoạt) vào màn hình Thiết lập ngân sách với ô nhập tiền có hậu tố 'đ' và các chip chọn nhanh tỷ lệ tiết kiệm thông minh (10%, 15%, 20% thu nhập hoặc 0đ), giúp người dùng chủ động trích tiền dành dụm cho tương lai trước khi chia tiền tiêu mỗi ngày mà không bị áp lực tài chính.
43. **Thanh Trượt Mục Tiêu Tích Lũy Kèm Cảnh Báo Đỏ & Phím Tắt Nhanh (0 - 120% Thu Nhập):** Nâng cấp thẻ Mục tiêu tích lũy tháng thành một hệ thống trực quan, đồng nhất với thanh trượt thu nhập: Thang đo chạy từ 0 đến $1.2 \times \text{Thu nhập}$, tự động khóa mờ khi chưa có thu nhập; khi số tiền tích lũy vượt quá 100% thu nhập tháng, toàn bộ số tiền, vạch trượt và nút thumb chuyển sang màu Đỏ (`#C86D51`) cảnh báo trực quan; các nút chọn nhanh 10%, 15%, 20% hiển thị rõ số tiền VND đã nhân để người dùng bấm 1 chạm là gán ngay số tiền và đưa thanh trượt tới vị trí chính xác.
44. **Kiến Trúc Ngân Sách Cân Bằng Số 0 (Zero-Based Budgeting Splitter):** Hợp nhất Tích lũy tháng và Hạn mức tiêu ngày vào một Trung tâm Phân bổ Cân Bằng duy nhất. Từ số tiền khả dụng còn lại sau hóa đơn bắt buộc ($\text{Khả dụng} = \text{Thu nhập} - \sum \text{Cố định}$), một thanh trượt phân bổ cân bằng 100% chia đôi dòng tiền: một bên là 'Tích lũy tương lai', một bên là 'Hôm nay tiêu được'. Kéo tăng tích lũy thì tiền tiêu ngày giảm tương ứng, đảm bảo công thức $\text{Thu nhập} = \text{Cố định} + \text{Tích lũy} + \text{Tiêu 30 ngày}$ luôn cân bằng tuyệt đối về con số 0 vào cuối tháng; tích hợp 3 phím tắt preset chiến lược tài chính: Tiết kiệm mạnh (30%), Cân đối vàng (20%), Tiêu thoải mái (10%) và 0đ.
45. **Kiến Trúc Giao Diện 3 Tầng Tối Giản & Chuẩn Xác Tài Chính Cho Thẻ Cân Bằng Ngân Sách:**
   - **Tiêu đề & Khả dụng:** Đặt icon vector `Scale` trước tiêu đề 'Cân bằng ngân sách'; đưa dòng 'Khả dụng: X đ' xuống thành dòng nhãn phụ ngay dưới tiêu đề, giải quyết triệt để vấn đề chật chội/sát rạt nhau trên màn hình hẹp.
   - **Tầng 1 (Dòng tiền tháng):** Hai cột đối xứng không viền: [Tích lũy X% $\to$ Số tiền sẽ tích lũy tháng đó] và [Chi tiêu Y% $\to$ Số tiền sẽ chi tiêu tháng đó]. Chuẩn hóa nhãn từ 'Hôm nay tiêu %' sang 'Chi tiêu %' đúng nghĩa tài chính (tỷ lệ trên tiền khả dụng tháng).
   - **Tầng 2 (Thanh phân bổ):** Thanh trượt Bi-Color mượt mà 60fps; lược bỏ hoàn toàn các chip chọn nhanh % rườm rà để người dùng tập trung điều chỉnh tự do trên thanh kéo.
   - **Tầng 3 (Hạn mức ngày):** Dòng hiển thị kết quả 'Hôm nay tiêu được: ... đ/ngày' được tính toán tự động từ số tiền chi tiêu tháng chia cho 30 ngày.
46. **Nút Thêm Chi Phí Cố Định Tối Giản (Icon-Only Add Button):** Lược bỏ chữ "Thêm" kế bên icon `+` ở phần tiêu đề Thẻ Chi Phí Cố Định, chuyển thành nút tròn tối giản $\varnothing 26$px mang màu cam nhấn `#E59844` với icon `+` sắc nét và `hitSlop` để đảm bảo thao tác chạm ngón tay chuẩn xác, gọn gàng, đồng bộ với phong cách giao diện tối giản của toàn bộ màn hình.
47. **Mở Rộng Toàn Dải 0% - 100% Cho Thanh Trượt Cân Bằng Ngân Sách (Full Range Splitter 0 - 100%):** Loại bỏ giới hạn cứng `MAX_SPLIT_RATIO = 0.6` (vốn chặn người dùng ở mức tích lũy 60%), nâng cấp lên toàn dải `MAX_SPLIT_RATIO = 1.0` (0% đến 100%). Người dùng có toàn quyền kéo trượt linh hoạt từ 0% tích lũy (tiêu 100% tiền khả dụng) tới 100% tích lũy (khi các nhu cầu sinh hoạt thiết yếu đã được khai báo trọn vẹn trong thẻ Chi phí cố định). Bảo đảm tính toán nhịp nhàng, 60fps và không bị khựng ở bất kỳ điểm nào trên toàn bộ chiều dài thanh kéo.
48. **Loại Bỏ Số Liệu Hardcode Chip Cố Định & Tinh Giản Placeholder Tên (Zero Hardcoded Amounts & Clean Name Input):**
   - Lược bỏ hoàn toàn các con số tiền mặc định hardcode (2.5tr, 500k, 220k, 3tr, 1tr...) khỏi các chip chọn nhanh cố định (`Tiền trọ`, `Điện nước`, `Internet`, `Ăn uống/Chợ`, `Trả góp`). Khi người dùng bấm chip, hệ thống chỉ gán tên khoản với số tiền bằng 0 (hiển thị placeholder "0"đ), để người dùng tự gõ số tiền thực tế của mình mà không bị áp đặt số tiền giả định làm sai lệch tổng chi phí cố định.
   - Xóa bỏ dòng placeholder dài dòng `"Ví dụ: Hà An, Minh Duy, Cún..."` ở ô nhập Tên hoặc Biệt danh, trả lại giao diện nhập liệu phẳng, thoáng đãng và tối giản.
49. **Đồng Bộ Hệ Thống Thanh Trượt Xúc Giác & Cân Bằng Ngân Sách Số 0 Vào Trang Hồ Sơ (Tactile Budget Synchronization in Profile):**
   - Thay thế toàn bộ khối hiển thị văn bản tĩnh và modal nhập tay cũ của `BudgetSettingsCard` trong Hồ Sơ bằng bộ thẻ tài chính xúc giác đồng bộ 100% với màn hình Thiết lập: Thanh trượt Thu nhập phi tuyến tính `0 - 300tr+`, danh sách Chi phí cố định với nút `+` tròn và chip gợi ý, Hero Card Cân bằng ngân sách Bi-Color toàn dải `0% - 100%`, và bộ chọn 3 đơn vị quy đổi yêu thích.
   - Cơ chế tự động lưu êm (Auto-save) khi buông tay hoặc debounce 400ms: Tự động đồng bộ vào `useBudgetStore`, AsyncStorage (`vi_locket_budget_setup`, `vi_locket_fixed_cost_items`), giúp trang Home và Camera cập nhật hạn mức ngày tức thì mà không cần bấm nút "Lưu" thủ công; hỗ trợ che giấu tiền `•••• đ` khi người dùng bật chế độ riêng tư (`isMasked`).
50. **Trình Nhập Chi Phí Cố Định Tập Trung Theo Chip & Tự Động Lưu Tạm (Active Chip Focus & Auto-Preserve):**
   - Thay vì hiển thị danh sách dòng dàn trải, thẻ Chi phí cố định áp dụng mô hình **Active Chip Focus**. Người dùng chạm vào bất kỳ chip nào (`Tiền trọ`, `Điện nước`, `Internet`...), chip đó được kích hoạt sáng màu cam Vàng Thu và mở ngay ô nhập số tiền trực tiếp cho khoản đó.
   - Khi người dùng đang nhập dở ở chip A và bấm sang chip B, số tiền đang gõ dở ở chip A được tự động bảo toàn nguyên vẹn trong state, đồng thời chip A hiển thị huy hiệu số tiền rút gọn (ví dụ: `Tiền trọ • 3tr`), con trỏ bàn phím chuyển ngay sang ô nhập tiền của chip B.
   - Khi bấm nút `+`, trình nhập chuyển sang chế độ tùy biến với hai ô nhập linh hoạt `[Tên khoản...]` và `[0 đ]`, tự động tạo chip mới trên thanh gợi ý. Phía dưới hiển thị dòng Tổng chi phí cố định tức thì.
51. **Tinh Giản Triệt Để Dòng Hướng Dẫn Chi Phí Cố Định (Zero Hint Clutter in Fixed Cost Card):** Loại bỏ hoàn toàn dòng mô tả/hướng dẫn rườm rà `'Chạm vào chip ở trên (Tiền trọ, Điện nước...) hoặc nút [+] để nhập số tiền'`. Khi chưa chọn thẻ chip nào, ẩn hoàn toàn ô nhập liệu và giữ cho thẻ Chi phí cố định phẳng, tinh giản, đạt độ thoáng đãng tối đa ở cả màn hình Thiết Lập Onboarding và thẻ Ngân sách trong Hồ Sơ.
52. **Thanh Trượt Xúc Giác Gọn Gàng Cho Từng Chi Phí Cố Định (Tactile Mini-Slider for Individual Fixed Costs):** Tích hợp thanh trượt phi tuyến tính `0 - 30tr+` (bước 100k ở dải $\le 4$tr, 500k ở dải $\le 15$tr, 1tr ở dải $\le 30$tr+) ngay trong hộp nhập tập trung (Active Editor Box). Người dùng có thể kéo trượt xúc giác siêu mượt với phản hồi rung cơ khí hoặc gõ phím trực tiếp; đồng bộ 2 chiều tức thì trên cả màn hình Thiết lập Onboarding và thẻ Ngân sách trong Hồ Sơ.
53. **Kích Hoạt Cân Bằng Ngân Sách Khi Không Có Chi Phí Cố Định (Zero Fixed Cost Flexibility):** Chi phí cố định hoàn toàn mang tính tùy chọn (dành cho người ở cùng gia đình, sinh viên, người không phát sinh hóa đơn định kỳ). Chỉ cần có `Thu nhập > 0` và $\text{Khả dụng} = \text{Thu nhập} - \sum \text{Cố định} > 0$ là Thẻ Cân Bằng Ngân Sách Số 0 lập tức được kích hoạt đầy đủ (dòng tiền khả dụng đạt 100% thu nhập khi cố định = 0đ); không còn yêu cầu gượng ép phải có chi phí cố định $> 0$. Gợi ý placeholder khi chưa có thu nhập chuyển thành hướng dẫn tự nhiên: *"Kéo thanh trượt hoặc nhập thu nhập để Kepi tính toán hạn mức ngày cho bạn"*.
54. **Phân Tách Kiến Trúc Thông Tin Hồ Sơ & Màn Hình Cài Đặt Riêng Biệt (Profile & Settings Information Architecture):** Bổ sung nút bánh răng cưa icon kính mờ $\varnothing 40$px (`Settings` từ `lucide-react-native`) ở góc trên bên phải tiêu đề Tab Hồ Sơ. Tách toàn bộ các thẻ cấu hình hệ thống, trợ lý AI, theme giao diện, bảo mật, tiện ích màn hình khóa, thông báo ngân hàng và quản lý tài khoản sang một màn hình Cài Đặt chuyên biệt (`/(main)/settings`, hiệu ứng trượt ngang `slide_from_right`). Giúp Tab Hồ Sơ trở nên cực kỳ tinh gọn, tối giản, chỉ tập trung thuần túy vào danh tính cá nhân và kế hoạch tài chính (Mục tiêu, Ngân sách Cân bằng số 0, Lương giờ, Danh mục).
55. **Hiển Thị Lũy Tiến, Thẻ Tóm Tắt & Giải Quyết Triệt Để Xung Đột Cử Chỉ Vuốt Tab (Progressive Disclosure & Gesture Conflict Resolution):**
    - *Bản chất kỹ thuật:* Do app dùng `ScrollView horizontal pagingEnabled` ở cấp root ([app/(main)/index.tsx](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/app/%28main%29/index.tsx)), khi đặt các thanh trượt PanResponder trực tiếp trên trang Hồ sơ, cử chỉ kéo ngang chỉnh tiền sẽ kích hoạt nhầm bộ cuộn Tab của cấp cha, khiến khung hình Tab bị trôi lắc sang Tab khác.
    - *Giải pháp Native Modal:* Chuyển trình chỉnh sửa trượt vào bên trong `Modal transparent animationType="slide"`. React Native Modal tách biệt hoàn toàn cây phân cấp view (independent window), chặn 100% sự kiện chạm lan tới `ScrollView` ngang bên dưới. Đảm bảo khi kéo trượt giá tiền, chỉ có con trượt thanh giá tiền di chuyển, khung hình Tab giữ cố định tuyệt đối.
    - *Tab Hồ Sơ:* Thẻ Cân Bằng Ngân Sách hiển thị mặc định ở chế độ Tóm Tắt (Read-only) với Spotlight hạn mức ngày và lưới 3 chỉ số then chốt (Thu nhập, Chi cố định, Tích lũy). Chạm vào mở Bottom Sheet (88% màn hình) chứa toàn bộ các thanh trượt mượt mà (Thu nhập, Chi phí cố định nhiều khoản, Hero Card Bi-Color 0-100%, Đơn vị yêu thích) kèm nút "Lưu thay đổi" & "Đóng" cố định ở đáy.
    - *Màn hình Cài Đặt:* Chuyển đổi các card cồng kềnh thành các hàng gạch bo góc phong cách iOS Settings (Grouped Inset Rows): hiển thị nhãn tóm tắt giá trị cấu hình hiện tại và icon Chevron `>`, chỉ mở Bottom Sheet chi tiết khi chạm vào (HLV Minh, Giao diện Theme, Tiện ích, Widget); các công tắc tức thời (Ẩn tiền) giữ Switch trực tiếp bên phải hàng.
56. **Kiến Trúc Mục Tiêu Dài Hạn, Runway Số Tháng, Tiến Độ Tháng & Cố Vấn Anh Minh (Long-term Goal Runway & Smart Accelerator):**
    - *Mục tiêu dài hạn:* Phục vụ các dự định tài chính lớn (ô tô 1 tỷ, laptop 30tr, du lịch, quỹ khẩn cấp...).
    - *Runway ETA:* Tự động tính số tháng về đích theo tốc độ tích lũy thực tế: $\text{Số tháng} = \lceil \frac{\max(0, G - S)}{M_{\text{save}}} \rceil$, hiển thị huy hiệu tinh gọn `"Còn N tháng nữa"`.
    - *Tiến độ tích lũy tháng hiện tại:* Đo lường theo dòng tiền thực tế ($\text{Khả dụng} - \text{Tổng chi tiêu thực tế trong tháng}$), hiển thị rõ số tiền đã đạt, % tháng và số tiền còn thiếu để hoàn thành chỉ tiêu tháng.
    - *Cố vấn rút ngắn từ Anh Minh:* Tự động mô phỏng kịch bản giả định nếu tăng thêm $10\%$ tích lũy (bớt chi tiêu ngày bao nhiêu $\sim$ tương đương số ly trà sữa/cà phê) thì người dùng sẽ rút ngắn được bao nhiêu tháng. Tôn trọng quyền tự chủ của người dùng: chỉ cung cấp thông tin tư vấn logic, người dùng tự chủ động điều chỉnh ở thẻ Cân Bằng Ngân Sách bên dưới.
57. **Tái Cấu Trúc Khối Mục Tiêu Tinh Gọn, Loại Bỏ 100% Dữ Liệu Hardcode & Cơ Chế Khóa Tích Lũy Ngày Theo Hạn Mức Tiêu (Streamlined Goal Card, Zero Hardcoded Data & Daily Budget Lock-in Savings):**
    - *Loại bỏ hoàn toàn hardcode:* Xóa bỏ các chuỗi ngày mặc định `'31/12/2026'` và câu quote mẫu `'Tự thưởng sau một năm nỗ lực cày cuốc'`. Khi người dùng chưa nhập, các trường này giữ rỗng `''` và modal sử dụng placeholder xám mờ.
    - *Trạng thái rỗng (Empty State):* Khi chưa có mục tiêu (`goalTargetAmount === 0`), hiển thị Thẻ viền nét đứt (Dashed Border) sang trọng với icon `Target` và dòng `+ Thiết lập mục tiêu tích lũy đầu tiên`, chạm vào mở ngay modal.
    - *Bố cục Dashboard 2 tầng tinh gọn (Zero Clutter):*
      - Tầng 1: Mục tiêu dài hạn (Tên mục tiêu + Runway tháng còn lại + Số tiền & % tiến độ + Thanh chính). Nếu người dùng có nhập lý do thì hiển thị 1 dòng caption mờ bên dưới tên mục tiêu (không tạo quote box to cồng kềnh). Hạn chót hiển thị dạng pill nhỏ gọn nếu có.
      - Tầng 2: Dải Mini-bar Tháng này (Tiến độ tích lũy thực tế chốt theo từng ngày không tiêu quá 'Hôm nay tiêu được' + cộng dồn tiền dôi dư nếu tiêu thấp hơn) kèm hiển thị trực quan `Tháng này: 1.4tr / 2.1tr (67%)`.
      - Mẹo Anh Minh: Thu gọn thành text 1 dòng thanh thoát với icon tia sáng `💡 +10% tích lũy ➔ Sớm N tháng (bớt ~X đ/ngày)`, không dùng khung nền to choán diện tích.
    - *Thuật toán tích lũy thực tế tháng (Daily Allowance Savings Lock-in):*
      $$S_{\text{month}} = \sum_{d \in \text{tháng}} \left( \mathbb{I}_{S_d \le D_d} \times Q_{\text{plan}} + \max(0, D_d - S_d) \right)$$
      (Trong đó $Q_{\text{plan}} = \frac{M_{\text{save}}}{N}$ là phần định mức ngày cam kết tích lũy; mỗi ngày chi tiêu $S_d \le D_d$ ("Hôm nay tiêu được"), phần định mức này được bảo toàn; nếu $S_d < D_d$, toàn bộ số tiền tiết kiệm thêm được cộng dồn tăng tốc mục tiêu).
58. **Thứ Tự Phân Bổ Tài Chính (Cân Bằng Ngân Sách Trước Mục Tiêu), Trang Giấy Trắng Tinh & Thẻ Mục Tiêu Tối Giản Tuyệt Đối (Income-First Hierarchy, Pure Blank Canvas & Ultra-Minimalist Dual-Progress Goal Card):**
    - *Ưu tiên dòng tiền (Income-First Hierarchy):* Đẩy thẻ `Cân Bằng Ngân Sách` (Thu nhập, Cố định, Phân bổ) lên TRÊN thẻ `Mục Tiêu Của Bạn` trong Tab Hồ Sơ. Người dùng cần khai báo nguồn thu nhập và chi phí sinh hoạt trước để xác định số tiền khả dụng, từ đó mới phân bổ cho mục tiêu dài hạn.
    - *Xóa bỏ triệt để dữ liệu mẫu (Pure Blank Canvas):* Xóa bỏ chuỗi mẫu seed `goalName: 'Chuyến đi Hà Nội'` trong `budgetStore.ts` về rỗng `''`. Người dùng mới mở app là một trang giấy trắng tinh khiết, 0 mục tiêu, 0 số tiền giả định.
    - *Thẻ Mục Tiêu Tối Giản Tuyệt Đối (Zero Fluff, 2 Sub-Headers):*
      - Triệt tiêu 100% chữ mô tả, câu "Còn thiếu...", câu quote truyền cảm hứng hay mẹo Anh Minh.
      - Khi chưa có mục tiêu: Hiển thị Thẻ trắng tinh giản `+ Đặt mục tiêu của bạn` (1-chạm mở sheet).
      - Khi có mục tiêu: Chỉ hiển thị đúng 2 Sub-tiêu đề:
        1. `Mục tiêu dài hạn • [Tên]` / Số tiền & `%` / Thanh ProgressBar chính.
        2. `Mục tiêu tích lũy tháng` / Số tiền tháng & `%` / Thanh ProgressBar mini.
59. **Chuẩn Hóa Spacing Nhịp Điệu 16px & Phân Lập Luồng Chi Tiết vs Chỉnh Sửa Mục Tiêu (Visual Rhythm 16px, Goal Detail Sheet & Tap-to-View Flow):**
    - *Chuẩn hóa nhịp điệu khoảng cách (16px Rhythm):* Thống nhất khoảng cách giữa các thẻ `marginBottom: 16`, padding bên trong thẻ `16px` trên toàn bộ Tab Hồ Sơ, khắc phục tình trạng thẻ dính sát nhau; khoảng cách tiêu đề nhóm `marginTop: 20`, `marginBottom: 10`.
    - *Phân lập 2 luồng tương tác của Thẻ Mục Tiêu:*
      - *Chạm thân thẻ:* Mở `GoalDetailModal` (Chi Tiết Mục Tiêu) hiển thị rõ Mục đích, Tiến độ dài hạn, **Ngày dự kiến đạt được (Estimated ETA Date)** tính từ Runway tháng và số tiền tích lũy thực tế, Tiến độ tích lũy tháng, Lý do và nút bấm chuyển sang sửa.
      - *Chạm icon cây bút [✏️]:* Mở trực tiếp `GoalEditModal` để chỉnh sửa 4 trường mục tiêu.
    - *Dọn dẹp Legacy Cache:* Tự động xóa sạch các giá trị mock cũ (`31/12/2026`, câu quote mẫu) khỏi AsyncStorage khi load Profile, đảm bảo người dùng có trang giấy trắng tinh khiết.
60. **Khối Mục Tiêu Luôn Hiện Diện, Tích Lũy Tháng Mặc Định & Danh Sách Đa Mục Tiêu Tuần Tự (Always-Active Goal Card, Monthly Foundation, Priority #1 Long-Term Goal & Waterfall Multi-Goals):**
    - *Khối Mục Tiêu Luôn Hiện Diện (Always-Active Card):* Không bao giờ ẩn cả khối thành thẻ nét đứt rỗng khi mới vào. Vì khi người dùng đã có Cân bằng ngân sách, định mức Tích lũy tháng ($M_{\text{save}}$) đã được tính toán tự động. Do đó, thẻ Mục tiêu luôn luôn hiển thị tổng quan đầy đủ trên Tab Hồ Sơ.
    - *Tích Lũy Tháng Là Nền Tảng Mặc Định (Section 1):* Luôn nằm ở vị trí số 1 trên thẻ, thể hiện tiến độ bảo toàn hạn mức ngày của tháng hiện tại với thanh ProgressBar 8px.
    - *Mục Tiêu Dài Hạn Ưu Tiên Số 1 (Section 2 - Priority #1):*
      - Khi chưa đặt: Hiển thị dòng `Mục tiêu dài hạn: Chưa đặt` kèm nút/thanh `+ Thêm mục tiêu (Xe, Máy tính...)` 0%. Chạm vào mở ngay form nhập.
      - Khi đã có mục tiêu: Hiển thị mục tiêu ưu tiên số 1 (Priority #1) kèm thanh % 8px.
      - Khi có nhiều mục tiêu (> 1): Hiển thị nhãn nhỏ `Xem thêm (+N mục tiêu khác)` mở rộng danh sách trong Sheet Chi Tiết.
    - *Cơ Chế Phân Bổ Tiền Tuần Tự (Waterfall Allocation):* Số tiền đã tích lũy (`savedMoney`) dồn 100% cho Mục tiêu 1 trước; khi đầy 100% tự động tràn sang Mục tiêu 2, 3...
    - *Điều Hướng Cử Chỉ Chạm (Touch Routing):*
      - Chạm thân thẻ / Tích lũy tháng: Mở `GoalDetailModal` (Xem chi tiết ETA, tiến độ tháng, danh sách đầy đủ tất cả các mục tiêu dài hạn, nút thêm mục tiêu mới).
      - Chạm `+ Thêm mục tiêu` hoặc icon cây bút `[✏️]`: Mở trực tiếp `GoalEditModal` để thêm/sửa mục tiêu.
61. **Tinh Giản Triệt Để Tab Hồ Sơ, Thẻ Mục Tiêu Tháng & Xóa Bỏ Tính Năng Lương Giờ (Ultra-Streamlined Profile Tab, Monthly-Only Goal Card, Auto-ETA & Deprecation of Hourly Wage):**
    - *Tinh Giản Thẻ Danh Tính (`ProfileIdentityCard.tsx`):* Bỏ 100% các từ ngữ gây bối rối như "Lưu trên máy này", "Sao lưu", loại bỏ hoàn toàn banner cảnh báo; bỏ nút "Liên kết Google" đứng bơ vơ ở góc thẻ để quy hoạch đồng bộ vào Nhóm 1 (Tài khoản & Đồng bộ) của Màn hình Cài Đặt.
    - *Khối Mục Tiêu Tối Giản Mặc Định (`GoalSectionCard.tsx`):* Bỏ hoàn toàn hiển thị "Mục tiêu dài hạn" trên bề mặt thẻ ở Tab Hồ Sơ; chỉ giữ duy nhất Mục tiêu tích lũy tháng (%) và nút icon `[+]` ở header. Chạm thân thẻ mở Sheet Chi Tiết xem toàn bộ các mục tiêu dài hạn; chạm `[+]` mở thẳng form thêm mục tiêu.
    - *Form Thêm Mục Tiêu Tối Ưu (`GoalEditModal.tsx`):* Chỉ gồm Tên mục tiêu + Số tiền (nhập số + thanh trượt, bỏ hoàn toàn quick chips); hệ thống TỰ ĐỘNG TÍNH TOÁN ngày hoàn thành (live ETA) dựa trên $M_{\text{save}}$ và thứ tự Waterfall; bỏ hoàn toàn trường nhập hạn chót và trường Lý do/Ý nghĩa.
    - *Xóa Bỏ Hoàn Toàn Lương Giờ & Giờ Lao Động:* Loại bỏ hoàn toàn khối Lương giờ khỏi Tab Hồ Sơ và các quy đổi giờ làm việc khỏi màn Chụp ảnh / Giá thật / Đánh giá để tập trung tối đa vào trải nghiệm tài chính thuần túy.
62. **Thiết Kế Nút Liên Kết Google Vừa Vặn & Chuẩn Hóa Icon Nổi Trần Thanh Mảnh (Minimalist Google Pill Button & Pure Floating Borderless Icons on Profile Tab):**
    - *Nút "Liên kết Google" Tinh Gọn, Vừa Vặn (`ProfileIdentityCard.tsx`):* Khi người dùng ở chế độ "Vào Ngay" (`isGuest === true`), hiển thị một nút pill nhỏ gọn (`height: 24px, paddingHorizontal: 8px`), trang nhã nằm ngay dưới tên người dùng `[ ☁️ Liên kết Google ]` với nền mờ nhạt ấm áp, tạo cảm giác hoàn thiện và sang trọng chứ không bơ vơ. Khi đã đăng nhập, tự động chuyển về hiển thị Email.
    - *Nút Bút Chì Đổi Tên [✏️] Đặt Sát Góc Trên Bên Phải:* Tách khỏi hàng tên người dùng, bố trí độc lập ở góc trên bên phải của Thẻ Người đồng hành (`position: 'absolute', top: 16, right: 16`), dạng vector icon nổi trần không viền hộp, hỗ trợ `hitSlop` $\ge 44 \times 44$px.
    - *Chuẩn Hóa Icon Nổi Trần Thanh Mảnh (Pure Borderless & Boxless Floating Icons):* Triệt tiêu 100% `borderWidth: 0` VÀ loại bỏ sạch khung nền hộp (`backgroundColor: 'transparent'`) tại tất cả các icon trên Tab Hồ Sơ:
      - Nút Setting Header: Icon `Settings` nổi trần, không viền, không nền hộp.
      - Khung Avatar: Avatar tròn phẳng, không viền thô cứng.
      - Nút bút chì đổi tên: Icon `Edit2` nổi trần sát góc trên phải.
      - Thẻ Cân bằng ngân sách: Icon `Scale` góc trái nổi trần; Nút góc phải giữ nguyên icon thanh gạt `SlidersHorizontal` nổi trần.
      - Thẻ Mục tiêu của bạn: Icon `Target` góc trái nổi trần; Nút `[+]` (`Plus`) góc phải nổi trần.
      - Thẻ Danh mục Thu & Chi: Icon `FolderTree` góc trái nổi trần.
    - *Bảo Đảm Công Thái Học (Touch Targets):* Tất cả các nút bấm icon nổi trần đều tích hợp `hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}` để duy trì diện tích chạm $\ge 44 \times 44$px theo chuẩn Apple HIG & Android Material.
    - *Lộ Trình Đồng Bộ:* Thực hiện và nghiệm thu trước trên Tab Hồ Sơ, sau đó tiếp tục đồng bộ ngôn ngữ thiết kế icon nổi trần thanh mảnh này sang Tab Cài Đặt.
63. **Chuẩn Hóa Icon Nổi Trần Vừa Vặn Với Cỡ Chữ & Xóa Dòng Phụ Thẻ Cân Bằng Ngân Sách (Pure Floating Icons Sized to Typography & Clean Subtitle Removal on Profile Tab):**
    - *Bỏ Hoàn Toàn Bo Tròn Nền Huy Hiệu Bên Ngoài:* Không sử dụng khung nền huy hiệu tròn, giữ icon hiển thị dạng vector nổi trần nguyên bản, thoáng đãng và thanh thoát tuyệt đối.
    - *Tăng Kích Thước Icon Tương Thích Hoàn Hảo Cỡ Chữ Chỉ Mục:*
      - *Cân Bằng Ngân Sách:* Icon `Scale` tăng lên **20px** (strokeWidth 2.4, màu `tokens.primary`), fit hài hòa với tiêu đề in hoa *"CÂN BẰNG NGÂN SÁCH"* (14.5px bold).
      - *Mục Tiêu Của Bạn:* Icon `Target` tăng lên **19px** (strokeWidth 2.4, màu `tokens.primary`), fit hài hòa với tiêu đề in hoa *"MỤC TIÊU CỦA BẠN"* (14.5px bold).
      - *Danh Mục Thu & Chi:* Icon `FolderTree` tăng lên **21px** (strokeWidth 2.4, màu `tokens.primary`), fit hài hòa với tiêu đề in hoa *"DANH MỤC THU & CHI"* (14.5px bold).
      - *Nút góc phải Cân bằng:* Icon `SlidersHorizontal` tăng lên **19px** (strokeWidth 2.4).
      - *Nút góc phải Mục tiêu:* Icon `Plus` tăng lên **20px** (strokeWidth 2.4).
    - *Xóa Dòng Phụ Gây Rối Mắt:* Xóa bỏ dòng chữ *"Chạm để điều chỉnh các thanh trượt"* (`summarySubtitle`) ở thẻ Cân Bằng Ngân Sách, giúp tiêu đề in hoa *"CÂN BẰNG NGÂN SÁCH"* đứng độc lập, thoáng đãng và căn giữa hoàn hảo theo chiều dọc với icon `Scale`.
64. **Đồng Bộ Dải 3 Chỉ Số Tóm Tắt Nền Trơn & Icon Nổi Trần (Borderless Stats Strip & Floating Mini Icons on Profile Tab):**
    - *Bỏ Viền Bo Ngoài Của Dải Chỉ Số:* Thiết lập `statsRow` `borderWidth: 0`, giữ nền trơn thanh nhã (`backgroundColor: tokens.surfaceAlt`), tạo cảm giác mềm mại và liền mạch với thẻ danh tính.
    - *Icon Nổi Trần Không Viền Bo:* Gỡ bỏ hoàn toàn khung bo tròn xung quanh các icon (`statIconBadge`: `backgroundColor: 'transparent'`), để các icon đại diện `Flame` (Chuỗi ghi), `ShieldCheck` (Đã giữ lại), `ShoppingBag` (Món đã lưu) hiển thị dạng vector nổi trần đồng bộ hoàn hảo với ngôn ngữ thiết kế chung.
    - *Tăng Kích Thước Icon:* Tăng kích thước từ 13px lên 16px để icon sắc nét, dễ nhìn và vừa vặn cân đối với các con số tài chính.
65. **Tối Giản Hóa Tab Cài Đặt: Icon Nổi Trần In Đậm, Rút Gọn Tên & Single-Line Minimalist Rows (Settings View Streamlining):**
    - *Nút Back [<] Nổi Trần:* Gỡ bỏ 100% viền bo và nền tròn mờ của nút Quay lại ở Header `SettingsView.tsx`, chuyển thành icon vector nổi trần (`size={22}, strokeWidth={2.6}`), `hitSlop` $\ge 44 \times 44$px đồng bộ hoàn hảo với nút Settings ở Tab Hồ Sơ.
    - *Icon Đặc Trưng Nổi Trần & In Đậm (Bold Floating Icons):* Bỏ toàn bộ hộp bo tròn `iconBadge` (`borderWidth: 0, backgroundColor: 'transparent'`), tăng kích thước icon lên **20px** và độ dày nét **`strokeWidth={2.6}`**, căn trục dọc `width: 26` thẳng hàng với màu sắc ngữ nghĩa đặc trưng (Cam Nắng Thu `#E59844`, Cốm Non `#7E9F80`, Đỏ Ngói `#C86D51`).
    - *Xóa Bỏ 100% Dòng Mô Tả Phụ (`rowSubtitle`):* Loại bỏ hoàn toàn các dòng chú thích rườm rà dưới mọi đặc trưng, đưa từng hàng về cấu trúc Single-Line thanh lịch phong cách Apple Settings.
    - *Thu Gọn Bộ Tên Đặc Trưng Chuẩn UX:*
      - "Đăng nhập & Sao lưu" / "Tài khoản Google" $\rightarrow$ "Đồng bộ Google" / "Tài khoản Google"
      - "Huấn luyện viên Anh Minh" $\rightarrow$ "HLV Anh Minh"
      - "Giao diện Theme" $\rightarrow$ "Giao diện"
      - "Ẩn số tiền toàn app" $\rightarrow$ "Ẩn số tiền"
      - "Khóa Face ID / PIN" $\rightarrow$ "Khóa Face ID"
      - "Màn hình khóa (Widget)" $\rightarrow$ "Widget màn hình khóa"
      - "Thông báo ngân hàng" $\rightarrow$ "Thông báo ngân hàng"
      - "Quét mã VietQR Pay" $\rightarrow$ "Quét mã VietQR"
      - "Dọn dẹp nhật ký chi tiêu" $\rightarrow$ "Đặt lại dữ liệu"
      - "Xóa tài khoản vĩnh viễn" $\rightarrow$ "Xóa tài khoản"
      - "Đăng xuất tài khoản" $\rightarrow$ "Đăng xuất"
    - *Căn Lề Dòng Phân Cách (`rowDivider`):* Điều chỉnh `marginLeft: 52` khớp chuẩn xác với mép lề chữ.
66. **Quy Chuẩn Icon Nổi Trần In Đậm Toàn Ứng Dụng, Nâng Cấp Tab Cài Đặt Nổi Bật & Bỏ Viền Icon Chi Tiết Đặc Trưng (App-Wide Floating Bold Icons Standard & Settings Rich Aesthetic Upgrade):**
    - *Quy chuẩn toàn ứng dụng (App-wide Core Directive):* Mọi icon xuất hiện trong toàn bộ ứng dụng (Tabs, Header, Cards, Modals, Detail Bottom Sheets) BẮT BUỘC bỏ 100% viền bo ngoài, không bọc trong các khối bo tròn/vuông màu (`borderWidth: 0, backgroundColor: 'transparent'`). Luôn in đậm nét với `strokeWidth: 2.4 - 2.8` và tăng kích thước (18-22px) để tạo độ tương phản thị giác cao cấp và sức sống sắc nét.
    - *Nâng cấp Tab Cài Đặt nổi bật thu hút thị giác (`SettingsView.tsx`):*
      - Icon đặc trưng tăng lên **22px**, in đậm nét **`strokeWidth={2.8}`**, áp dụng dải màu rực rỡ phong cách Hà Nội Thu Đông (Vàng Kim, Nắng Thu, Cốm Non, Xanh Ngọc Bích, Đỏ Ngói).
      - Thẻ `groupedCard` bổ sung viền ánh ấm nhẹ (`rgba(229, 152, 68, 0.16)`) kết hợp bóng đổ có chiều sâu (`shadowOpacity: 0.05, shadowRadius: 8`), tạo cảm giác nổi bồng bềnh sang trọng trên nền Kem Bơ / Than Chì.
      - Huy hiệu giá trị bên phải (`valueBadge`) tích hợp **chấm tròn trạng thái (Status Indicator Dot)** sinh động (Xanh Cốm cho "Đã liên kết", Cam Nắng Thu cho tone/mode).
      - Nút Đóng `[X]` ở đầu Sheet chuyển thành icon vector nổi trần 20px `strokeWidth={2.6}` kèm `hitSlop` 12px đồng bộ với nút Back.
    - *Loại bỏ viền bo của toàn bộ icon trong từng đặc trưng chi tiết (Bottom Sheets):*
      - `CoachSettingsCard.tsx`: Bỏ `iconBox` viền bo, icon `Sparkles` nổi trần 20px `strokeWidth: 2.6`.
      - `LockScreenSettingsCard.tsx`: Bỏ `iconBox` viền bo, icon `Smartphone`, `BellRing`, `Zap`, `RotateCcw`, `Camera` nổi trần in đậm; bỏ viền `featurePill`.
      - `BankNotificationSettingsCard.tsx`: Bỏ `iconBox` viền bo, icon `Bell`, `ShieldCheck`, `Sparkles` nổi trần in đậm.
      - `QRPaySettingsCard.tsx`: Bỏ `iconCircle` viền bo, icon `QrCode`, `Landmark`, `ShieldCheck`, `DollarSign`, `Bell` nổi trần in đậm.
      - `GroupedRow.tsx`: Bỏ `iconWrapper` background & border, đổi thành container căn trục nổi trần `width: 26`.
      - `PrivacySecurityCard.tsx`: Bỏ `iconBox` viền bo, icon `Shield`, `EyeOff`, `Lock` nổi trần in đậm.
67. **Chuẩn Hóa Production Sẵn Sàng Ra Thị Trường, Thanh Lọc Triệt Để Dữ Liệu Hardcode & Tối Ưu Tab Cài Đặt Minh Bạch (Production Readiness, Zero Hardcoded Data & Transparent Settings):**
    - *Bối cảnh:* Định hình sản phẩm đạt chuẩn thương mại (Production Grade), logic tài chính chính xác 100%, phân định rõ ràng giữa tính năng đã hoạt động thực tế vs tính năng trong lộ trình phát hành native/cloud.
    - *Gỡ bỏ HLV Anh Minh khỏi Tab Cài Đặt:* HLV Minh đã có một Tab chuyên biệt riêng (Tab 3: AI Coach Chat). Xóa bỏ hàng HLV Anh Minh và modal cấu hình khỏi Tab Cài Đặt để phân định ranh giới kiến trúc mạch lạc, tránh trùng lặp tính năng. Nhóm "Trợ lý & Cá nhân hóa" tinh gọn thành "Giao diện & Cá nhân hóa" chỉ chứa "Giao diện Theme".
    - *Minh bạch hóa 100% trạng thái tính năng trên Tab Cài Đặt:*
      - **Quét mã VietQR:** Badge `"Khả dụng"` (Status dot `#10B981` xanh ngọc). Tính năng quét camera barcode, EMV parser bóc tách STK/số tiền, deeplink mở 37 ngân hàng & ví điện tử, luồng PENDING xác nhận hoạt động thật 100%.
      - **Đồng bộ Google:** Badge `"Sắp ra mắt"` (Status dot `#8C827A` xám). Hệ thống hiện đang chạy local-first (chưa kết nối Supabase Cloud Production). Khi người dùng bấm vào sẽ hiển thị Alert thông báo minh bạch rằng dữ liệu đang được lưu trữ an toàn 100% trên thiết bị.
      - **Widget Màn hình khóa:** Badge `"Sắp ra mắt"` (Status dot `#8C827A` xám). Cơ chế thông báo ghim Android hiện là giải pháp tạm thời, WidgetKit iOS và AppWidget Android native sẽ phát hành trong bản đóng gói tiếp theo.
      - **Thông báo ngân hàng:** Badge `"Thử nghiệm"` (Status dot `#E59844` cam vàng). Bộ phân tích cú pháp 8+ ngân hàng và khu vực thử nghiệm là thật 100% offline, việc tự động đọc thông báo chạy ngầm ở cấp hệ điều hành (OS Native Service) cần bản build APK với quyền `BIND_NOTIFICATION_LISTENER_SERVICE`.
      - **Khóa Face ID:** Giữ badge `"Sắp ra mắt"`.
    - *Thanh lọc triệt để 100% dữ liệu Hardcode (Pure Blank Canvas):*
      - **Username:** Loại bỏ toàn bộ các chuỗi tên ngẫu hứng `'Người thương phố cổ'`, `'Người dùng Ví'`, `'seed-user'`. Tên hiển thị mặc định khi chưa đặt tên là `'Bạn'` hoặc rỗng `''`.
      - **Thu nhập & Hạn mức ngày:** Loại bỏ mọi fallback ngầm `100_000`, `15_000_000`, `3_000_000`. Khi chưa thiết lập, số liệu giữ nguyên `0đ`, hướng người dùng đến luồng thiết lập ngân sách thực tế.
      - **Mục tiêu:** Loại bỏ các mục tiêu ảo gán sẵn `'Chuyến đi Hà Nội'` hay `'Toyota'`. Người dùng chưa tạo mục tiêu sẽ thấy Empty State sạch sẽ để tự tạo.
      - **Giao dịch:** Xóa bỏ hoàn toàn mảng `SEED_TRANSACTIONS` (7 giao dịch demo). Tài khoản mới của người dùng luôn bắt đầu từ danh sách rỗng 0 giao dịch, 0đ đã chi.
68. **Hiện Thực Hóa Các Tính Năng Chuẩn Production (Bỏ Face ID, Nhận Diện Clipboard Ngân Hàng, Tiện Ích Khóa & Sao Lưu Dữ Liệu Tự Chủ):**
    - *Bỏ hoàn toàn Khóa Face ID:* Theo yêu cầu của người dùng để giảm thiểu dữ liệu và tối ưu hiệu năng ứng dụng. Khối Bảo mật trong Cài đặt và Hồ sơ chuyển sang tập trung duy nhất vào cơ chế "Ẩn số tiền toàn app" (`isMasked`).
    - *Kích hoạt Nhận diện Biến Động Số Dư qua Sao Chép (Clipboard Auto-Detection):* Sử dụng `expo-clipboard` để tự động kiểm tra nội dung Clipboard khi người dùng sao chép tin nhắn SMS hoặc thông báo biến động số dư ngân hàng (TPBank, Vietcombank, MB, Techcombank, ACB, VPBank, BIDV, OCB...). Nếu hợp lệ, hệ thống hiển thị `BankClipboardToast` ở đỉnh màn hình: *"Nhận diện biến động: -[Số tiền] từ [Tên ngân hàng]. Chạm để ghi sổ ngay!"*. Hoạt động mượt mà 100% trên cả iOS và Android mà không cần quyền hệ điều hành nhạy cảm. Badge chuyển thành `"Khả dụng"` (`#10B981`).
    - *Kích hoạt Thanh Tiện Ích Khóa (Sticky Lock Screen Banner):* Kích hoạt thông báo ghim số dư cố định trên Android (`lockScreenService.ts`) với 3 nút bấm tương tác `-30k Cafe`, `-50k Ăn trưa`, `📸 Chụp món` và `↩️ Hoàn tác`. Badge chuyển thành `"Khả dụng"` (`#10B981`).
    - *Hệ thống Sao Lưu & Khôi Phục Dữ Liệu Tự Chủ (Local Backup/Restore):* Cho phép người dùng xuất (Export) file sao lưu JSON an toàn chứa toàn bộ lịch sử chi tiêu, cấu hình ngân sách, mục tiêu và khôi phục (Import) dữ liệu bất kỳ lúc nào mà không phụ thuộc máy chủ. Badge chuyển thành `"Khả dụng"` (`#10B981`).
69. **Tối Ưu Hóa Vượt Bậc Trải Nghiệm Ghi Chép Biến Động Số Dư Ngân Hàng (Locket Bank Snapshot & Full-Category Fast Log):**
    - *Bối cảnh:* 80% người dùng khi chuyển khoản ngoài ngân hàng để nội dung mặc định (`"NGUYEN VAN A chuyen tien"`, `"CK"`, hoặc trống). Các app truyền thống gán vào "Chi tiêu khác" hoặc bắt mở form sửa rườm rà làm nản lòng người dùng.
    - *Đột phá 1 (Locket Bank Snapshot):* Thanh Toast nổi biến động số dư bổ sung nút chính **`[📸 Chụp Locket]`**. Chạm vào sẽ kích hoạt chuyển ngay sang Camera Tab (Page 2), ghim sẵn số tiền và tên ngân hàng (`-45.000đ từ Vietcombank`). Người dùng bấm Shutter chụp nhanh món đồ / ly nước vừa mua $\rightarrow$ hiển thị ảnh cùng dải chọn **ĐẦY ĐỦ danh mục** $\rightarrow$ Lưu thành giao dịch có ảnh Locket sống động.
    - *Đột phá 2 (Ghi Nhanh Đầy Đủ Danh Mục):* Nút **`[⚡ Ghi Nhanh]`** dành cho lúc bận/không tiện chụp. Chạm vào mở Mini Sheet hiển thị toàn bộ danh mục hệ thống và tùy chỉnh (Ăn uống, Mua sắm, Đi lại, Công việc, Nhà cửa, Sức khỏe, Giải trí, Quà tặng, Chi tiêu khác...). Chạm 1 icon vector nổi trần là ghi sổ tức thì $\le 1$s với avatar logo ngân hàng.
    - *Đột phá 3 (Chuẩn Hóa Mô Tả Giao Dịch Thông Minh):* Tự động lấy tên Danh mục được chọn làm tiêu đề chính (Ví dụ: "Công việc", "Ăn uống"), gắn tag ngân hàng tinh gọn; có ô nhập nhanh nếu muốn ghi chú chi tiết; triệt tiêu hoàn toàn rác chữ từ nội dung chuyển khoản thô.
70. **Chuẩn Hóa Luồng Hoạt Động Thông Báo Ngoài Màn Hình Khóa vs Trong Ứng Dụng (Lock Screen Notification Tray vs In-App Toast):**
    - *Bản chất hệ điều hành di động (Android vs iOS):*
      - Phần cứng máy ảnh (Camera) trên cả iOS và Android KHÔNG THỂ chụp ảnh ngầm từ màn hình khóa khi không có giao diện kính ngắm (Viewfinder). Do đó, hành động **`[📸 Chụp Locket]`** bắt buộc mở App nhảy thẳng vào khung ngắm 4:5 với số tiền đã ghim sẵn $\rightarrow$ người dùng ngắm món đồ và bấm Shutter.
      - Đối với **`[⚡ Ghi Nhanh]`**: Mở App thẳng vào bảng chọn danh mục `FastCategorySheet` ($\le 1$s) để chạm 1 danh mục (Ăn uống, Công việc, Mua sắm, v.v.), đảm bảo dữ liệu chuẩn 100% không bị sai lệch.
    - *Khi ở ngoài màn hình chính/khóa điện thoại:* Kepi gửi thông báo đẩy tương tác (`pushBankDetectedNotification`) qua category `LOCK_SCREEN_CATEGORY_BANK_ALERT` với 2 nút `[📸 Chụp Locket]` và `[⚡ Ghi Nhanh]`.
    - *Khi đang mở ứng dụng Kepi:* Hệ thống hiển thị thanh Toast nổi `BankClipboardToast` ở đỉnh màn hình với 2 nút tương ứng.
71. **Phân Định Rõ Ràng Danh Mục vs Hình Thức Thanh Toán (Zero-Clutter Camera & Background Smart Defaults):**
    - *Phân lập logic cốt lõi:*
      - **Danh mục (Category):** Trả lời câu hỏi *"Tiêu vào VIỆC GÌ?"* (Ăn uống, Cà phê, Mua sắm, Đi lại, Công việc...). "Ngân hàng" TUYỆT ĐỐI KHÔNG phải là một danh mục chi tiêu.
      - **Hình thức thanh toán (Payment Method):** Trả lời câu hỏi *"Tiêu BẰNG NGUỒN NÀO?"* (`CASH`: Tiền mặt, `BANK`: Chuyển khoản / Ngân hàng, `E_WALLET`: Ví điện tử).
    - *Cơ chế Smart Defaults (Tự động hóa ngầm 100%):*
      - Quét mã VietQR $\rightarrow$ Tự động ngầm gán `BANK`.
      - Nhận diện biến động số dư / Locket Bank Snapshot $\rightarrow$ Tự động ngầm gán `BANK`.
      - Upload ảnh biên lai chuyển khoản $\rightarrow$ Tự động ngầm gán `BANK`.
      - Quét mã Ví điện tử (ZaloPay, MoMo) $\rightarrow$ Tự động ngầm gán `E_WALLET`.
      - Chụp ảnh món đồ thông thường $\rightarrow$ Mặc định gán `CASH`.
    - *Khung ảnh Camera thuần khiết (Zero-Clutter):*
      - Ẩn hoàn toàn nút gạt Tiền mặt/Ngân hàng trên giao diện Camera. Người dùng không cần bận tâm tiền từ đâu ra mà chỉ tập trung vào: "Tiêu bao nhiêu tiền & vào việc gì".
      - Nút chọn Danh mục được đặt ở chính giữa thanh trên (`tagButtonCenter`), cân đối đối xứng với nút Hủy và khoảng đệm phải, đảm bảo thẩm mỹ tối giản chuẩn Locket.
72. **Bỏ Hoàn Toàn Hiển Thị Payment Method Khỏi Giao Diện & Tự Động Ghim Tag [Mã NH] Kèm Số Tiền Vào Mô Tả:**
    - *Bối cảnh & Quyết định:* Khái niệm `payment_method` ("Tiền mặt" vs "Chuyển khoản") là tàn dư từ các phần mềm kế toán kép phức tạp, làm rối mắt và dư thừa thông tin trên các màn hình Lịch, Chi tiết ảnh và Thống kê. Toàn bộ chuỗi hiển thị 'Tiền mặt' / 'Chuyển khoản' bị loại bỏ 100% khỏi giao diện người dùng.
    - *Quy chuẩn Tag Ngân hàng [Mã NH] trong mô tả:*
      - Khi quét VietQR: Tự động trích xuất mã ngân hàng (ví dụ: `VCB`, `TPB`, `MB`, `TCB`, `ACB`, `BIDV`) và ghim sẵn: `[Mã NH] ${payeeName}`.
      - Khi nhận Noti ngân hàng / Locket Bank Snapshot: Số tiền tự động điền sẵn 100%; ô mô tả tự động ghim sẵn `[${bankCode}]` (kèm nội dung nếu có), con trỏ sẵn sàng cho người dùng gõ thêm nếu thích.
      - Khi Ghi nhanh danh mục (`FastCategorySheet`): Giao dịch tự lưu thành `[${bankCode}] ${note || cat.name}` (Ví dụ: `[VCB] Ăn uống`, `[TPB] Công việc`).
    - *Đảm bảo an toàn CSDL:* Trường `payment_method` được chuyển thành tùy chọn (`payment_method?: PaymentMethod`) để giữ an toàn tuyệt đối cho schema Supabase/SQLite hiện tại mà không gây lỗi runtime.

73. **Nâng Cấp Toàn Diện UI/UX 5 Tab (Home, Thống Kê, Camera, Chat Anh Minh, Cài Đặt) Theo Chuẩn Hà Nội Thu Đông & Zero-Friction:**
    - *Tab Home (Journal):*
      - Lời chào: Thay thế text cứng "Chào buổi sáng / tối" bằng Icon buổi (Mặt trời mọc `Sunrise`, Buổi trưa `Sun`, Buổi chiều `Sunset`, Buổi tối `Moon`) kết hợp cùng dòng Ngày tháng năm & Đồng hồ chạy thời gian thực (Real-time Clock HH:mm:ss) sống động.
      - Nút chức năng góc trên phải: 3 nút Con mắt (Ẩn tiền), Cài đặt (`Settings`) và Avatar Hồ sơ (`User`) chuyển sang chuẩn 100% Vector nổi trần không viền bo (`borderWidth: 0, backgroundColor: 'transparent'`, strokeWidth 2.6).
      - Dải điều hướng Tuần / Tháng: Lịch hiển thị từ ngày thứ đến chủ nhật bỏ tiền tố "Tuần" ở đầu (Ví dụ: `12/10 - 18/10, 2026` thay vì `Tuần 12/10 - 18/10, 2026`). 2 nút mũi tên chuyển tuần `<` và `>` chuyển sang dạng icon nổi trần hoàn toàn.
    - *Tab Thống Kê (Analytics & Album):*
      - Nút Con mắt (Ẩn tiền): Bỏ viền bo hộp, nổi trần và làm nổi bật sắc nét.
      - Cuộn Album ảnh: Hiển thị rõ số tiền Chi (`-30k`, đỏ ngói) và Thu (`+30k`, cốm non).
      - Tổng quan tháng: Bổ sung icon trực quan trước từng chỉ số; bỏ hiển thị "trung bình chi tiêu 1 ngày" ở Tổng quan tháng để tránh nhiễu thông tin.
      - Chuẩn hóa Danh mục toàn diện: Triệt tiêu 100% các ID nội bộ (`suc_khoe`, `di_chuyen`, `an_uong`...) trên các biểu đồ Pareto, Cơ cấu danh mục, thay bằng tên tiếng Việt chuẩn mực có dấu đồng bộ với hệ thống `categoryStore`.
      - Chi tiêu từng ngày: Bỏ vạch "Định mức ngày" vì mỗi ngày có hạn mức linh hoạt khác nhau; các nút Đóng `[X]` và Chia sẻ bỏ viền bo hộp.
      - Phân tích Tuần này & Tháng này: Bỏ các tiêu đề rườm rà như "Nhận định tài chính", "Chú ý dòng tiền", bỏ mô tả thừa bên dưới dòng tiền.
      - Xu hướng chi tiêu tháng: Tính toán chính xác theo số ngày thực tế của tháng đang chọn (28, 29, 30 hoặc 31 ngày) real-time, không cố định 30 ngày.
      - Khoảng đệm đáy (Bottom Padding): Mở rộng khoảng đệm cuộn thêm một đoạn bằng chiều cao thanh Floating Tab Bar + SafeArea để không bị che khuất bất kỳ chỉ số nào ở cuối trang.
    - *Tab Camera (Photobooth & Khoảnh Khắc Locket):*
      - Làm sạch Viewfinder: Xóa bỏ viền bo tròn của nút Flash; bỏ icon Anh Minh khỏi Camera; xóa bỏ hoàn toàn tính năng "Để sau" (Wait Basket) để màn hình tối giản tuyệt đối.
      - Tính năng Zoom: Tích hợp cử chỉ chụm 2 ngón (Pinch-to-zoom) kết hợp bộ nút chuyển mức phóng to nhanh `[1x]` / `[2x]` nổi trần tinh tế.
      - Tương tác sau khi chụp (Post-Capture Flow):
        - Dải danh mục (Horizontal Category Chips) hiển thị sẵn ngay trên ảnh, không cần bấm "Chọn danh mục" để mở.
        - Tự động kích hoạt bàn phím (auto-focus) vào ô nhập tiền ngay khi chụp xong.
        - Khi người dùng chạm vào thân ảnh Camera $\rightarrow$ Tự động focus chuyển sang gõ ô Mô tả.
        - Phóng to khung Chi / Thu và đặt sát cạnh dưới khung Camera.
        - Bộ đôi nút hành động dưới đáy: `[ ✕ Chụp lại / Xóa ]` bên trái và `[ ✓ Lưu vào sổ ]` bên phải.
        - Nút Lưu mờ (`opacity: 0.45`, `disabled`) khi chưa chọn danh mục hoặc tiền bằng 0, không hiện pop-up cảnh báo khó chịu.
        - Lược bỏ hoàn toàn tính năng bấm xem ảnh chi tiết ở dòng lịch sử cũ bên dưới Camera.
        - Nền trang Camera sử dụng hiệu ứng Gradient matching liền mạch với tông màu giao diện đặc trưng (Hà Nội Thu Đông).
    - *Tab Chat (Anh Minh AI - Cố Vấn Tài Chính Bạn Thân):*
      - Tích hợp động cơ phân tích ngữ cảnh (Financial Context RAG): Anh Minh truy cập trực tiếp số liệu ngày, tuần, tháng (số dư, danh mục chi nhiều nhất, tỷ lệ hoàn thành mục tiêu) để trò chuyện gần gũi, xưng hô "anh Minh - bồ", tư vấn chân thực như một người bạn thân thiết.
      - Bổ sung nút gửi ảnh trên `ChatInputBar`: Cho phép chụp hoặc chọn ảnh biên lai/món đồ gửi vào chat $\rightarrow$ Anh Minh tự động trích xuất và hiển thị thẻ xác nhận ghi sổ `CONFIRMATION` 1-chạm ngay trong cuộc trò chuyện.
    - *Tab Cài Đặt (Settings):*
  - **Quyết định 74 (17/10/2026): Tinh Chỉnh Hoàn Thiện UI/UX: Lịch Tuần/Tháng, Thu Gọn 'Ăn Uống', Tiêu Đề Xu Hướng & Thanh Trượt Zoom Camera Khóa Chuyển Trang:**
    - *Camera Zoom Slider & Gesture Locking:* Bổ sung thanh trượt thu phóng (Zoom Slider) mượt mà đặt trên cụm Shutter. Khi chạm và kéo thanh trượt, hệ thống tự động khóa cuộn trang (`isZoomSliding = true`, `scrollEnabled = false` trên cả Horizontal Pager và Vertical History Scroll, kèm `onPanResponderTerminationRequest: () => false`) để màn hình đứng yên 100%, không rung giật hay trượt nhầm trang.
    - *Lịch Tab Home (Tháng):* Bỏ hoàn toàn hộp nền viền bo của 2 nút mũi tên `<` và `>` điều hướng tháng trong `PhotoCalendarGrid.tsx` (`backgroundColor: 'transparent', borderWidth: 0, strokeWidth: 2.6`). Thêm icon `Calendar` phía trước text tháng kèm viền hairline `borderColor: tokens.border`.
    - *Lịch Tab Home (Tuần):* Đồng bộ viên thuốc (pill badge) dải ngày trong `WeekCalendarCarousel.tsx` với viền hairline `borderColor: tokens.border`, nền mờ `tokens.surfaceAlt` và icon `Calendar` phía trước.
    - *Thu gọn danh mục "Ăn uống":* Đổi toàn bộ "Ăn uống & Cà phê" thành "Ăn uống" trên toàn bộ ứng dụng (vì Ăn uống đã bao hàm Cà phê), bao gồm danh mục gốc, format mapping, chip lọc, camera feed, gợi ý VietQR và biểu đồ thống kê.
    - *Tiêu đề Biểu đồ Chi Tiêu (Analytics):* Hiển thị chuẩn xác "Xu Hướng Chi Tiêu Tháng Này" (hoặc "Xu Hướng Chi Tiêu Tháng [X]" khi xem tháng khác), loại bỏ hoàn toàn số ngày trong ngoặc đơn như `(31 ngày)`.
  - **Quyết định 75 (17/10/2026): Tối Giản Trải Nghiệm Zoom Camera & Tinh Gọn Giao Diện Sau Khi Chụp (Iconic Minimalist Review):**
    - *Mở Rộng Góc Rộng Zoom Camera (0.5x Ultra-Wide & Pure Header Badge):* Cho phép zoom xa hết cỡ xuống mức góc rộng 0.5x (tương ứng zoom level 0 của phần cứng camera). Lược bỏ hoàn toàn 2 nút số `[1x]` và `[2x]` ở hai đầu thanh trượt; chỉ hiển thị duy nhất badge hệ số zoom (`0.5x` - `3.0x`) trôi phía trên thanh trượt, giữ thanh gạt mảnh mai, tối giản chuẩn Locket/iOS.
    - *Giao Diện Tinh Gọn Sau Khi Chụp (Zero-Clutter Post-Capture Action Bar):*
      - Lược bỏ hoàn toàn nút dấu `[✕]` ở góc trên bên trái khung ảnh (`OnCameraPhotoOverlay.tsx`), đưa nhãn danh mục về vị trí trung tâm thoáng đãng.
      - Ở thanh công cụ dưới đáy sau khi chụp: Lược bỏ toàn bộ text chữ dài dòng ("Chụp lại" và "Lưu vào sổ"). Thay thế bằng cặp nút tròn biểu tượng thuần túy (Pure Iconic Action Buttons): nút tròn `[✕]` bên trái để chụp lại và nút tròn `[✓]` màu Nắng Thu bên phải để lưu vào sổ.
  - **Quyết định 76 (17/10/2026): Tối Ưu Chi Phí Về 0$ & Bảo Vệ Riêng Tư Khách Hàng Tuyệt Đối (Zero Cloud Cost & Total Privacy):**
    - Hệ thống vận hành theo triết lý Local-First: Toàn bộ ảnh gốc và dữ liệu nhạy cảm lưu trữ an toàn trong sandbox của thiết bị người dùng.
    - Không lưu trữ số tài khoản nhận, số dư ngân hàng, hay thông tin định danh cá nhân (PII) ở bất kỳ đâu (CSDL, log, telemetry, analytics).
    - Tận dụng gói miễn phí (Free Tier) của Supabase cho xác thực và đồng bộ dữ liệu giao dịch số nhẹ, chi phí máy chủ hàng tháng là 0$.
  - **Quyết định 77 (17/10/2026): Duy Trì 5 Tab Điều Hướng (Giữ Tab Chat Anh Minh Trên Thanh Bar):**
    - Đính chính kiến trúc: Giữ nguyên cấu trúc thanh điều hướng 5 Tab (`Home`, `Stats`, `Camera`, `Chat`, `Profile`).
    - Tab Chat (Anh Minh) là tính năng cốt lõi tạo nên sự gần gũi và khác biệt cho Kepi, hỗ trợ tư vấn tài chính và thẻ xác nhận giao dịch 1-chạm.
  - **Quyết định 78 (17/10/2026): Loại Bỏ Hoàn Toàn Tính Năng "Hình Thức Thanh Toán" (Tiền mặt / Bank / Ví):**
    - Nhằm tối ưu hóa tốc độ ghi sổ $\le 3$ giây và giảm tải nhận thức cho người dùng, loại bỏ hoàn toàn việc phân loại hình thức thanh toán (Tiền mặt, Ngân hàng, Ví điện tử).
    - Gỡ bỏ bộ chọn hình thức thanh toán khỏi tất cả màn hình: `ConfirmationSheet`, `LocketReviewModal`, `OnPhotoNoteOverlay`, `FastCategorySheet`.
    - Dữ liệu giao dịch tập trung duy nhất vào 4 yếu tố cốt lõi: Số tiền, Danh mục, Ghi chú và Ảnh minh chứng.
  - **Quyết định 79 (17/10/2026): Tích Hợp Android Native NotificationListenerService (Opt-in & 100% On-Device):**
    - Tích hợp Android Native Plugin cho dịch vụ `NotificationListenerService`.
    - Tính năng hoàn toàn tùy chọn (Opt-in) với công tắc bật/tắt minh bạch trong Cài đặt; người dùng lo ngại bảo mật có thể chọn không bật.
    - Toàn bộ quá trình bóc tách thông báo thực thi 100% cục bộ trên thiết bị bằng `notificationBankParser.ts`, làm sạch STK và số dư ngay tại chỗ, không bao giờ gửi nội dung thông báo lên mạng.
  - **Quyết định 80 (17/10/2026): Sao Lưu & Khôi Phục Toàn Diện Bằng Tệp Nén ZIP Chứa Ảnh (Zero-Loss Offline Backup):**
    - Đóng gói dữ liệu JSON mã hóa cùng toàn bộ tệp ảnh thực tế thành một file `.zip` duy nhất khi người dùng xuất sao lưu.
    - Khi xóa app cài lại, người dùng nhập file `.zip` để khôi phục toàn bộ giao dịch và ảnh chụp, đảm bảo không mất mát dữ liệu và giữ chi phí đám mây ở mức 0$.
  - **Quyết định 81 (17/10/2026): Tích Hợp Android Native Plugin NotificationListenerService & Bộ Chuyển Đổi 3 Theme Kép (Profile & Settings):**
    - Cấu hình Expo Config Plugin `./plugins/withNotificationListener.js` và cấp quyền `BIND_NOTIFICATION_LISTENER_SERVICE` trong `app.json` để Android Native Manifest liên kết dịch vụ lắng nghe thông báo ngân hàng 100% on-device.
    - Tích hợp `ThemeSettingsCard` trực tiếp trên cả Tab Hồ Sơ (`ProfileView.tsx`) và Màn hình Cài Đặt (`SettingsView.tsx`), cho phép người dùng chuyển đổi tức thì giữa 3 Theme: Sáng (`light`), Tối (`dark`), và Mát (`cool`).







  - **Quyết định 82 (21/10/2026): Nâng Cấp Luồng Google OAuth Từ Số 0, UX Streak Điểm Danh Hằng Ngày & Tinh Chỉnh Tab Hồ Sơ / Cài Đặt:**
    - *Chuẩn Hóa Đăng Nhập Google OAuth (Web & Mobile):*
      - Hỗ trợ luồng xác thực Google OAuth qua Supabase (`supabase.auth.signInWithOAuth({ provider: 'google' })`).
      - Tự động nhận diện môi trường: Trên Web sử dụng chuyển hướng `window.location.origin` tránh chặn pop-up; trên Mobile sử dụng Deep Linking `/(auth)/callback`.
      - Người dùng đầu tiên đăng nhập bằng Google được ghi nhận là User #1 chính chủ, bắt đầu từ số 0 sạch sẽ (0 transactions, ngân sách thiết lập mới).
    - *Rút Gọn Cụm Từ Ghi Nhanh Tab Home & Hồ Sơ:*
      - Thay thế hoàn toàn cụm từ dài dòng `"Chưa có ghi chép hôm nay — Chụp hoặc ghi nhanh"` thành `"Chưa ghi hôm nay — Chạm để ghi"` ngắn gọn, xúc tích, khuyến khích thao tác 1-chạm mở camera.
    - *Nâng Cấp UX Điểm Danh & Chuỗi Streak:*
      - Biến huy hiệu Streak trên Home (`JournalView`) và Profile (`ProfileIdentityCard`) thành thành phần tương tác: Chạm vào sẽ mở `StreakCheckinModal` hiển thị chi tiết số ngày liên tiếp, trạng thái điểm danh hôm nay và lời động viên.
      - Tự động kích hoạt hiệu ứng pháo hoa / chúc mừng (`StreakCelebrationToast`) ngay khi người dùng hoàn thành giao dịch đầu tiên trong ngày.
    - *Đồng Bộ Hiển Thị Tài Khoản Gmail Đã Liên Kết:*
      - Đối với tài khoản đã liên kết Google: Hiển thị địa chỉ Gmail rõ ràng ngay dưới Tên người dùng trong Thẻ Hồ Sơ (`ProfileIdentityCard`) và bổ sung dòng thông tin tài khoản chuyên biệt trong Cài Đặt (`SettingsView`).
      - Đối với tài khoản Khách (Guest): Nút "Liên kết Google" kích hoạt trực tiếp luồng OAuth 1-chạm, tự động bảo toàn và sáp nhập các giao dịch đã ghi trên máy sang tài khoản Google mới.
    - *Làm Sạch Tab Cài Đặt (Dọn Dẹp Chỉ Báo Root/Debug):*
      - Loại bỏ 100% đèn tròn xanh (`statusDot`) và các nhãn "Khả dụng", "Tự động" khỏi các dòng cấu hình (Sao lưu, Widget, Thông báo ngân hàng, VietQR).
      - Thiết kế lại các dòng theo phong cách Apple / Android Settings tối giản: Chỉ hiển thị Tên tính năng và Mũi tên điều hướng `ChevronRight` (riêng dòng Giao diện hiển thị tên Theme hiện tại).

  - **Quyết định 83 (22/10/2026): Kiến Trúc Kepi v5.0 — Gỡ Bỏ 100% Google Auth Chuyển Sang 1-Chạm Local-First, Động Cơ Quay Clip 3 Giây Locket & Công Tắc Riêng Tư Hội Bạn:**
    - *Gỡ Bỏ Hoàn Toàn Google OAuth:*
      - Loại bỏ 100% phụ thuộc vào Google Cloud Console và các cổng xác thực đám mây trả phí/phức tạp.
      - Chuyển sang mô hình 1-chạm thuần túy (Clean 1-Tap Entry): Người dùng chỉ cần nhập Tên / Biệt danh là vào ngay app trong $< 300$ms.
      - Mỗi thiết bị được gán một `device_id` (UUID tạo ngẫu nhiên lưu trong `AsyncStorage`). Toàn bộ dữ liệu cá nhân lưu trữ 100% Local-First trên máy.
    - *Động Cơ Quay Clip 3 Giây (3s Looping Micro-Video):*
      - Nút Shutter đĩa tròn vàng hỗ trợ 2 thao tác:
        - `onPress`: Chụp 1 bức ảnh tĩnh chất lượng cao như hiện tại.
        - `onLongPress`: Kích hoạt quay video ngắn 3 giây không tiếng (`quality: '480p'`, mute âm thanh, dung lượng $\le 400$KB).
      - Quanh nút Shutter có vòng tròn tiến độ SVG lấp đầy 360 độ trong đúng 3.0 giây kèm nhịp rung haptic.
      - Tại màn hình xem lại (Review Overlay): Hiển thị ảnh bìa tĩnh kèm icon Play, chạm vào mới phát lặp lại nhằm tiết kiệm pin tối đa.
    - *Lược Bỏ Dải 5 Cảm Xúc (Zero Clutter):*
      - Chủ dự án quyết định loại bỏ hoàn toàn dải chọn cảm xúc (Mood tags) để giữ cho giao diện ghi chép luôn tối giản, bảo toàn tốc độ ghi sổ thần tốc $\le 3$s.
    - *Công Tắc Riêng Tư Hội Bạn (Squad Privacy Toggle):*
      - Bổ sung công tắc `[🔒 Riêng tư: Chỉ mình tôi]` trên màn hình xem lại sau khi chụp/quay. Khi bật công tắc này, khoản chi chỉ lưu trên máy cá nhân và không đồng bộ lên Locket Feed của Hội bạn 2-4 người.


  - **Quyết định 84 (22/10/2026): Tái Cấu Trúc Thương Hiệu PigBo (Nuôi Heo Lớn), Khóa Vuốt 0 Rung Lắc & Tinh Gọn Camera:**
    - *Đổi Tên Thương Hiệu Thành PigBo:*
      - Tên chính thức: **PigBo** (Slogan: *"Nuôi Heo Lớn Mỗi Ngày — Raise Pig to Big"*).
      - Tone màu chủ đạo chuyển sang **Hệ màu Xanh Mint từ nhạt tới đậm** (Sky Blue & Mint Cloud cho Light mode, Fresh Mint & Tropical Leaf cho Cool mode, Dark Mint & Cyber Emerald cho Dark mode).
      - Mascot: **Chú Heo Béo PigBo Trắng Sứ / Tai Mũi Má Hồng Phấn (3D Clay Chibi)**, ảnh tĩnh nét cao $\le 30$KB kèm hiệu ứng nhún xúc giác, gồm 4 dáng điệu (Vẫy chào, Nằm gác cằm trên Camera, Cuộn tròn góc Card, Đeo kính Chat AI).
    - *Khóa Cố Định Vuốt Body Giữa Màn Hình (Zero Shaking Navigation):*
      - Cố định ScrollView ngang `horizontalPagerRef` (`scrollEnabled={false}`), loại bỏ hoàn toàn hiện tượng rung lắc/lướt nhầm tab ở giữa màn hình. Chuyển tab 100% qua thanh điều hướng `FloatingPillTabBar` dưới đáy.
    - *Tinh Gọn Khung Ngắm Camera:*
      - Xóa bỏ nút pill "Lịch sử" sát dưới nút Shutter để khu vực camera hoàn toàn thoáng đạt.
      - Xóa thanh trượt zoom slider và số 0.5x hardcode, chuyển sang thao tác Pinch-to-zoom 2 ngón tay tự nhiên (1.0x – 3.0x thực tế).
      - Xóa bỏ text "Chọn 1 danh mục" trên Camera Overlay, chỉ để lại icon danh mục nổi trần thanh thoát.
    - *Ẩn Thuật Ngữ Kỹ Thuật (Zero Tech Clutter):*
      - Xóa bỏ toàn bộ các badge "0$ Cloud", "Cục bộ (0$ Cloud)" trên màn hình Hồ sơ và Cài đặt, bảo đảm giao diện sạch sẽ, cao cấp như sản phẩm thương mại quốc tế.
    - *Tab 3: Heo Béo & Bạn Thân:*
      - Bố trí 2 ngăn chuyển đổi mượt mà ở đỉnh: `[🐷 Heo Béo]` (Chat AI Thông Thái & Ấm Áp) và `[👥 Bạn thân]` (Locket Feed & Chatroom 2-4 bạn).


  - **Quyết định 85 (22/10/2026): Tinh Chỉnh Màn Hình Mở Đầu — Bottom Thành Ngữ In Nghiêng, Unique Nickname Realtime & Khảo Sát Năm Sinh:**
    - *Bố Cục Châm Ngôn & Slogan:*
      - Di chuyển câu thành ngữ dân gian Việt Nam: *"Tích tiểu thành đại"* xuống đáy màn hình (Bottom), hiển thị dạng **chữ in nghiêng (italic)** mộc mạc, trang trọng.
      - Nổi bật dòng thông điệp *"Quản lý chi tiêu ngay hôm nay"* ngay dưới tiêu đề PigBo với sắc xanh ngọc mint sắc nét.
    - *Khảo Sát Năm Sinh & Độ Tuổi Người Dùng:*
      - Bổ sung thanh chọn Năm Sinh nhẹ nhàng (Year Picker Modal/Sheet) tích hợp cạnh ô nhập Tên.
      - Hệ thống tự động tính ra độ tuổi tương ứng (ví dụ: `2004 — 22 tuổi`) và lưu trữ vào trường `birthdate` / `birth_year` trong CSDL `Profile` phục vụ nghiên cứu nhân khẩu học người dùng.
    - *Cơ Chế Kiểm Tra Tên Không Trùng Lặp (Unique Nickname Realtime):*
      - Hệ thống tra cứu realtime trong CSDL `profiles` (kèm debounce và offline fallback).
      - Nếu tên khả dụng: Hiển thị icon tích xanh `Check` an tâm.
      - Nếu tên đã có người khác đăng ký: Báo nhẹ *"Tên này đã có bạn dùng"* và hiển thị ngay 3 chip gợi ý 1-chạm (ví dụ: `Tên 02`, `Tên #99`, `Tên_pig`).
    - *Bảo Toàn Trải Nghiệm Nút Nguồn 1-Chạm:*
      - Tiếp tục duy trì Nút Nguồn cảm ứng tròn 80px (`Power Button`) kích hoạt hiệu ứng đèn LED Xanh Mint (Power ON) và đưa người dùng vào ứng dụng sau 1 nhịp rung xúc giác `Heavy Haptic`.

  - **Quyết định 86 (22/10/2026): Tái Thiết Kế Màn Hình Login Chuẩn Mockup PigBo — Đổi Theme Trực Tiếp, 1 Phương Thức Nhanh & Ca Dao Lục Bát:**
    - *Đổi Theme 1-Chạm Trực Tiếp (Icon Palette Top-Left):*
      - Đặt nút icon `Palette` ở góc trên bên trái màn hình mở đầu. Bấm 1-chạm xoay vòng trực tiếp giữa 3 Theme: Xanh Mint (`cool`) ⇄ Hồng Phấn / Kem Bơ (`light`) ⇄ Đêm Tối (`dark`) kèm rung nhẹ `Light Haptic`.
      - Ẩn nút Cài đặt (Bánh răng) ở màn hình Login để giao diện đạt độ tập trung tuyệt đối.
    - *Loại Bỏ Thanh Phân Luồng Đăng Nhập (Zero Segment Tabs):*
      - Loại bỏ 100% thanh tab segment *"⚡ Bắt đầu nhanh | 👤 Tài khoản"*, chuyển đổi hoàn toàn sang luồng 1 phương thức duy nhất: Nhập Biệt danh & Chọn Năm sinh $\to$ Vào ngay $\le 0.5$s.
    - *Tối Giản Hóa Form (Single Clean Card):*
      - Loại bỏ các card lồng nhau viền dày; loại bỏ tùy chọn checkbox *"Khóa PIN bảo mật"* và badge *"25 tuổi"* lặp lại.
      - Duy trì 1 khung thẻ nền trắng sứ đổ bóng siêu mềm chứa 2 trường: Biệt danh (có icon User, kiểm tra tên trùng Realtime với tick `Check` xanh, nút xúc xắc `Dices` cam đất) và Năm sinh/Tuổi (dropdown lịch `Calendar` chọn từ 1970–2016).
    - *Thiết Kế Nút Đăng Nhập 'BẮT ĐẦU NGAY →' Theo Mockup:*
      - Nút dài bo tròn mềm mại 56px với gradient/màu chủ đạo của theme, bên trong tích hợp icon Nút Nguồn `Power` trong vòng tròn trắng mờ + chữ in hoa đậm `BẮT ĐẦU NGAY` + mũi tên `ArrowRight` (`→`). Kích hoạt `Heavy Haptic` khi bấm.
    - *Cập Nhật Câu Ca Dao Đáy Màn Hình:*
      - Thay câu *"Tích tiểu thành đại"* bằng 2 câu ca dao lục bát nghệ thuật:
        *“ Heo kia chẳng vỗ thời to*
        *Từng xu góp lại thành kho lúc nào ”*
        (Định dạng chữ in nghiêng `italic`, màu chữ muted trang nhã, kèm chú thích bản quyền `PigBo © 2026 – Chi tiêu có kế hoạch`).

  - **Quyết định 87 (22/10/2026): Tối Giản Tuyệt Đối Màn Hình Login — Chuẩn Pure Floating Bold Icons (Zero Border & Boxless), Icon Nguồn Trơn & Dải Tuổi 10-60:**
    - *Triệt Tiêu Hoàn Toàn Khung Viền & Hộp Nền Màu Bọc Icon (Zero Border & Boxless):*
      - Nút đổi Theme (`Palette`): Hiển thị vector nổi trần góc trên bên trái (`borderWidth: 0, backgroundColor: 'transparent'`), không hộp nền, không viền, `hitSlop: 14`.
      - Nút Xúc xắc (`Dices`): Bỏ hộp nền màu vàng `#FEF3C7`, hiển thị vector nổi trần tự nhiên.
      - Dấu kiểm (`Check`): Bỏ vòng tròn nền xanh `#DCFCE7`, hiển thị vector tick xanh sắc nét.
      - Linh vật chú Heo PigBo: Bỏ khung tròn hộp viền đè nặng bên ngoài và bỏ huy hiệu vàng bọc coin rườm rà; chỉ để chú heo PigBo hiển thị tự nhiên, nổi trần, vui tươi.
    - *Nút Nguồn Trơn Nổi Trần (Zero Text & Zero Button Box):*
      - Bỏ chữ "BẮT ĐẦU NGAY", bỏ dải gradient dài bo viền bọc nút.
      - Nút đăng nhập chỉ còn đúng 1 Icon Nguồn `Power` trơn nổi trần (kích thước lớn 42px, `strokeWidth: 2.8`). Khi chạm vào bừng sáng màu Xanh Mint `#10B981` kèm rung `Heavy Haptic` đưa người dùng vào app.
    - *Tục Ngữ Lục Bát Không Dấu Ngoặc Kép:*
      - Bỏ cặp dấu ngoặc kép `“` và `”`, hiển thị 2 dòng thơ lục bát tự nhiên, mộc mạc:
        *Heo kia chẳng vỗ thời to*
        *Từng xu góp lại thành kho lúc nào*
    - *Khảo Sát Độ Tuổi Chuẩn 10 Đến 60 Tuổi:*
      - Mở rộng dải năm sinh từ năm 1966 đến năm 2016 (tương ứng độ tuổi chính xác từ 10 tuổi đến 60 tuổi).

  - **Quyết định 88 (22/10/2026): Màn Hình Mở Đầu Trống Hoàn Toàn (Zero Pre-Filled Data) & Placeholder Tối Giản:**
    - *Triệt Tiêu Hoàn Toàn Dữ Liệu Hardcode Ban Đầu (Zero Pre-filled):*
      - Biệt danh ban đầu để trống tuyệt đối `""` (không tự điền 'Cốm Non' hay 'Bé Bơ'), hiển thị dòng placeholder mờ: *"Nhập biệt danh của bạn"*. Nút Xúc xắc `Dices` vẫn sẵn sàng hỗ trợ nếu người dùng muốn tạo tên nhanh 1-chạm.
      - Năm sinh ban đầu để trống `null` (không tự điền '2001' hay '25 tuổi'), hiển thị dòng placeholder mờ: *"Chọn năm sinh của bạn"*. Khi người dùng chọn từ Modal thì mới hiển thị rõ năm và số tuổi tương ứng.
    - *Trải Nghiệm Khi Bấm Nút Nguồn:*
      - Nếu người dùng bấm nút Nguồn khi chưa điền tên: Rung nhẹ `Warning Haptic` và hiển thị cảnh báo đỏ ngắn gọn *"Vui lòng nhập biệt danh"*.
      - Nếu chưa chọn năm sinh: Tự động kích hoạt mở Modal chọn năm sinh mượt mà để người dùng chọn nhanh trước khi vào ví.

  - **Quyết định 89 (22/10/2026): Thiết Kế App Icon & Splash Icon Chính Thức Cho PigBo (3D Clay Chibi Trên Nền Xanh Mint):**
    - *Chuẩn Hóa Bộ Nhận Diện Launcher Icon (`assets/`):*
      - Thay thế toàn bộ icon Monogram K cũ của Kepi bằng bộ Icon chú Heo PigBo chính thức:
        - `assets/icon.png` (1024x1024): App Icon chính thức cho iOS và App Store.
        - `assets/adaptive-icon.png` (1024x1024): Foreground icon cho Android thích ứng.
        - `assets/splash-icon.png` & `assets/favicon.png`: Icon khởi động splash và web tab.
      - *Thiết Kế Đồ Họa:* Chú Heo Béo PigBo 3D Clay Chibi trắng sứ bóng mịn phong cách Pixar, tai và má hồng phấn pastel dễ thương, mắt cười long lanh, đỉnh đầu có khe nhét tiền heo đất kèm 1 đồng xu vàng may mắn. Nền icon là sắc Xanh Mint tươi mát sang trọng (`#10B981` đến `#059669`).

  - **Quyết định 90 (22/10/2026): Đồng Bộ Linh Vật Chú Heo PigBo Vào Thẻ Ngân Sách Tab 0 & Thẻ Danh Tính Tab 4:**
    - *Thẻ Ngân Sách Hôm Nay (Tab 0 — `JournalView.tsx`):*
      - Đặt linh vật chú Heo PigBo dáng ngủ say / cuộn tròn (`PigBoMascot pose="card"` hoặc `happy`, kích thước 46px) ngay trên Thẻ Hạn Mức Hôm Nay. Chú Heo nằm bên cạnh số tiền tiêu được để truyền tải thông điệp nuôi heo đất ấm áp, chạm vào có hiệu ứng nhún xúc giác đàn hồi.
    - *Thẻ Danh Tính Cá Nhân (Tab 4 — `ProfileIdentityCard.tsx`):*
      - Thay thế avatar chữ cái viết tắt đơn điệu bằng Avatar Chú Heo PigBo Chibi vẫy chào (`PigBoMascot pose="welcome"`, kích thước 48px), đồng bộ nhận diện thương hiệu vui nhộn và thân thiện cho toàn bộ ứng dụng.

  - **Quyết định 91 (22/10/2026): Tái Định Vị Thương Hiệu "Pigpo" (Slogan: "Fatten your savings - Keep it - Watch it grow") & Triển Khai Tab 3 Hội Bạn Thân 2-4 Người:**
    - *Đổi Tên Thương Hiệu Sang Pigpo:*
      - Tên chính thức: **Pigpo** (viết hoa chữ đầu: `Pigpo`).
      - Tagline / Slogan quốc tế: *"Fatten your savings - Keep it - Watch it grow"* (Nuôi lớn khoản tiết kiệm - Giữ chặt - Ngắm nhìn heo lớn dần).
      - Đồng bộ toàn diện trên `app.json`, `strings.ts`, màn hình Login, Persona AI và các tài liệu đặc tả.
    - *Kiến Trúc Hai Ngăn Tab 3 (Pigpo AI & Hội Bạn 2-4 Người):*
      - Đỉnh Tab 3 tích hợp thanh Segment chuyển đổi tức thì: `[🐷 Heo Béo]` | `[👥 Bạn thân]`.
      - **Ngăn 1 [🐷 Heo Béo]:** Chú heo Pigpo AI đồng hành thông thái, uốn nắn thói quen tiết kiệm, phân tích chi tiêu ngày hôm nay và trả lời 3 câu hỏi phản biện trước khi mua sắm.
      - **Ngăn 2 [👥 Bạn thân]:** Hội bạn Locket nhỏ 2–4 người kết nối bằng Mã phòng 6 ký tự (Anonymous Room Code) vận hành 0$ Cloud trên Supabase Realtime. Hiển thị Locket Feed ảnh/clip chi tiêu của bạn bè trong phòng (tự động lọc bỏ các giao dịch gắn cờ `[🔒 Riêng tư: Chỉ mình tôi]`), kèm các nút tương tác 1-chạm `[👉 Nhắc Heo Đói]` và `[🎉 Vỗ Béo Heo Bạn]`.

  - **Quyết định 92 (22/10/2026): Tinh Chỉnh Cuối Cùng Trang Login & Hoàn Tất Chính Thức Phase 2:**
    - *Việt Hóa Slogan Thương Hiệu:*
      - Chuyển đổi khẩu hiệu sang tiếng Việt: *"Tiết kiệm - Duy trì - Sinh lời bền vững"*.
    - *Chuẩn Hóa Ô Mô Tả Key-Value Chữ Mảnh, Mờ, Nhỏ:*
      - Tiêu đề nhãn: `TÊN BIỆT DANH CỦA BẠN:` và `NĂM SINH & TUỔI:` (font nhỏ 10.5px, chữ mảnh `fontWeight: '400'`, màu mờ `textMuted`).
      - Placeholder hướng dẫn: `Nhập biệt danh` và `Chọn năm sinh` (font mờ nhạt siêu mảnh `rgba(..., 0.22)`, không chiếm dụng sự chú ý).
    - *Modal Năm Sinh Pop-up Tối Giản Ở Giữa (Không Giới Hạn Năm):*
      - Loại bỏ dòng tiêu đề "Chọn Năm Sinh Của Bạn (10 - 60 tuổi)".
      - Dải năm sinh mở rộng không giới hạn (từ 1920 đến năm hiện tại 2026).
      - Thiết kế khung pop-up nhỏ gọn đặt ở giữa màn hình (`center dialog`), bo góc 24px thanh thoát.
    - *Đồng Bộ Icon Chú Heo 3D Cho Trang Login:*
      - Sử dụng trực tiếp hình ảnh App Icon chú Heo Pigpo 3D Clay Chibi chính thức (`assets/icon.png`) làm avatar đại diện trên trang Login, bo tròn 100px đổ bóng mềm, đồng bộ 100% với biểu tượng ứng dụng trên màn hình chính điện thoại.
    - *Chính Thức Kết Thúc Phase 2:*
      - Nghiệm thu trọn vẹn toàn bộ các mục tiêu nhận diện thương hiệu, bộ icon và màn hình đăng nhập của Phase 2.
