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


  - **Quyết định 93 (22/10/2026): Đồng Bộ Toàn Diện Logic Backend, Khảo Sát Độ Tuổi & Khôi Phục Phiên Đăng Nhập Cục Bộ (Backend & Database Architecture):**
    - *Khắc Phục Lỗi Thoát Phiên Khởi Động (Persistent Nickname Session Restore):*
      - `initializeAuth` sửa logic kiểm tra: Khi không có Supabase Cloud session, nếu tìm thấy `cachedUserStr` thì khôi phục ngay trạng thái đăng nhập cho cả phiên Khách (`isGuest: true`) và phiên Biệt danh (`isGuest: false`), chấm dứt triệt để tình trạng người dùng dùng Nickname bị văng ra màn hình Login mỗi khi mở lại app.
    - *Kiểm Tra Biệt Danh Fail-Open & Tránh Treo UI (Fail-Open Debounce Engine):*
      - `checkNicknameAvailable` áp dụng cơ chế đua timeout 2000ms (`Promise.race`), tra cứu đồng thời RPC `check_nickname_available` và bảng `profiles`/`user_surveys`. Nếu mất mạng, mạng chậm hoặc lỗi RLS, hàm lập tức trả về `true` (fail-open an toàn), ngăn chặn việc hiển thị vòng quay loading vô tận và không bao giờ treo giao diện.
    - *Khảo Sát Độ Tuổi Đa Tầng Không Chặn (Non-Blocking Multi-Layer Age Demographics Survey):*
      - Tạo bảng `public.user_surveys` (Migration 006) kèm RPC `submit_age_survey` chạy `SECURITY DEFINER` để ghi nhận nhân khẩu học người dùng ẩn danh theo `device_id`.
      - Luồng `signInWithNickname(nickname, birthYear)` thực thi lưu trữ cục bộ tức thì ($\le 100$ms), tự động dọn dẹp seed demo và di chuyển giao dịch của khách qua `cleanSeedDataAndMigrate`, sau đó đẩy khảo sát lên Supabase trong tác vụ nền bọc try-catch an toàn tuyệt đối, không gây gián đoạn luồng người dùng kể cả khi thiết bị offline hoặc Supabase từ chối RLS.
    - *Bảo Toàn Năm Sinh Khi Nâng Cấp Tài Khoản (Survey Data Preservation):*
      - Khi người dùng nâng cấp từ tài khoản Biệt danh lên Email OTP / Google, `ensureUserProfile` tự động trích xuất `birthdate` từ `@vi_locket_guest_profile` để ghi vào `public.profiles.birthdate`, bảo toàn 100% dữ liệu khảo sát độ tuổi lên đám mây.

  - **Quyết định 94 (23/10/2026): Đồng Bộ Nhận Diện Thương Hiệu Toàn Hệ Thống Sang "PigFly" & Slogan "PigFly: Tiết kiệm – Duy trì – Sinh lời bền vững":**
    - *Đồng Bộ Thương Hiệu Toàn Diện Sang PigFly:*
      - Tên chính thức thương hiệu: **PigFly** (viết hoa hai chữ P và F).
      - Slogan chính thức: *"PigFly: Tiết kiệm – Duy trì – Sinh lời bền vững"*.
      - Thẻ tóm tắt / tagline: *"Tiết kiệm • Duy trì • Sinh lời bền vững"*.
    - *Cấu Hình Hệ Thống & Ứng Dụng (`app.json`):*
      - Cập nhật `name: "PigFly"`, `slug: "pigfly"`.
      - Quyền iOS & Android Camera / Photo Library: Thay thế toàn bộ tiền tố Pigpo/PigBo bằng `PigFly`.
    - *Chuẩn Hóa Từ Điển Chuỗi Hiển Thị (`src/constants/strings.ts`):*
      - `appName: 'PigFly'`
      - `tagline: 'Tiết kiệm – Duy trì – Sinh lời bền vững'`
      - Bổ sung `slogan: 'PigFly: Tiết kiệm – Duy trì – Sinh lời bền vững'`
      - Cố vấn Heo AI: `coachSectionTitle: 'CỐ VẤN CHÚ HEO PIGFLY'`, `promptShouldIBuy: 'Có nên mua món này không PigFly?'`, `thinking: 'PigFly đang suy nghĩ...'`, `emptyConversation: 'Chào bạn! PigFly ở đây rồi nè. Hôm nay chú heo béo có thể giúp bạn kiểm tra ngân sách hay ghi chép gì không?'`.
    - *Chuẩn Hóa Phòng Nuôi Heo Tab 3 (`src/store/squadStore.ts`):*
      - Tên phòng mặc định: `"Squad Nuôi Heo PigFly"`.
      - Tên Bot hệ thống tương tác: `"PigFly Bot"`.
      - Khóa lưu trữ cục bộ: `@pigfly_squad_room_v1` kèm cơ chế Seamless Fallback đọc di trú dữ liệu tự động từ khóa cũ `@pigpo_squad_room_v1`.
    - *Màn Hình Đăng Nhập & Bản Quyền Chân Trang (`app/(auth)/login.tsx`):*
      - Tên thương hiệu hiển thị Hero: `"PigFly"`.
      - Chân trang bản quyền: `"PigFly © 2026 – Tiết kiệm, duy trì, sinh lời bền vững"`.
    - *Linh Vật Đồ Họa Đa Năng (`PigFlyMascot.tsx` / `PigBoMascot.tsx`):*
      - Xuất khẩu component chính `PigFlyMascot` cùng alias tương thích ngược `PigBoMascot = PigFlyMascot`.
      - Xuất khẩu kiểu dữ liệu `type PigFlyPose` cùng alias `type PigBoPose = PigFlyPose`.
    - *Kiểm Thử Hồi Quy Tuyệt Đối (`run-all-tests.js`):*
      - Cập nhật Test 49 xác thực tự động toàn bộ thuộc tính `PigFly` trên `app.json`, `strings.ts`, `squadStore.ts` và `login.tsx`.


  - **Quyết định 95 (05/11/2026): Chuyển Đổi Triệt Để Sang 100% Local-First Engine, Loại Bỏ Tàn Dư Cloud / Google Auth & Tối Ưu Độ Trễ 0ms Cho Production:**
    - *Kiến Trúc 100% Local-First (Zero Cloud Database & Zero Google Auth):* Xóa bỏ hoàn toàn sự phụ thuộc vào Supabase Database và Google OAuth Sign-in. Mọi dữ liệu giao dịch, danh mục, ngân sách và hồ sơ lưu trữ cục bộ 100% trên thiết bị (`AsyncStorage` và `expo-file-system`), bảo vệ tối đa quyền riêng tư của người dùng.
    - *Tối Ưu Hóa Giao Dịch (`src/store/transactionStore.ts`):* Loại bỏ triệt để các tác vụ nền `syncDownTransactions`, `initRealtimeTransactionSync`, `enqueueMutation`, `flushSyncQueue`. Tác vụ ghi nhận, cập nhật, xóa giao dịch lưu trực tiếp vào `AsyncStorage` đạt độ trễ 0ms tức thì, không hao pin và không phụ thuộc kết nối mạng.
    - *Tối Ưu Hóa Xác Thực (`src/store/authStore.ts`):* Tối ưu `checkNicknameAvailable` kiểm tra định dạng và độ dài cục bộ tức thì 0ms, không chờ timeout mạng; dọn sạch các hàm tàn dư `signInWithGoogle`, `signInWithEmail`, `verifyEmailOtp`.
    - *Dọn Dẹp Giao Diện:* Gỡ bỏ hàm `handleDirectLinkGoogle` khỏi `ProfileView.tsx`, gỡ bỏ prop và style chết liên quan đến Google trong `ProfileIdentityCard.tsx`, làm sạch route `app/(auth)/callback.tsx`.
    - *Bảo Toàn & Khôi Phục Dữ Liệu Ngoại Tuyến:* Khẳng định cơ chế sao lưu & khôi phục dữ liệu qua tệp JSON mã hóa nhúng ảnh Base64 (`exportAppDataAsync` / `importAppDataAsync`) và xuất CSV chuẩn UTF-8 BOM (`\uFEFF`) qua khay chia sẻ hệ thống (100% Offline, bảo mật tối đa).

  - **Quyết định 96 (05/11/2026): Tích Hợp Bàn Phím Số Tài Chính MandCashierKeyboard (Phong Cách DiDi Mand Mobile):**
    - *Triệt Tiêu Bàn Phím Hệ Điều Hành (Zero OS Keyboard Jitter):* Thay thế hoàn toàn bàn phím số mặc định của iOS/Android bằng bàn phím số tài chính chuyên dụng tích hợp sẵn trong màn hình Review sau khi chụp và các luồng nhập tiền. Triệt tiêu 100% tình trạng giật viewport và che khuất ảnh chụp 4:5.
    - *Vũ Khí Nhập Tiền Siêu Tốc `000`:* Bố trí phím `000` ở hàng cuối cùng, hỗ trợ gõ nhanh mệnh giá nghìn/trăm nghìn VND (`3` + `5` + `000` = `35.000 đ`) chỉ trong 3 chạm nhẹ ($le 1.5$s).
    - *Cột Hành Động Tích Hợp (Giant Action Button):* Cột thứ 4 tích hợp phím Xóa lùi `⌫` và nút Primary Action `LƯU SỔ ✔` to bản (chiếm 3 hàng), bố trí đúng tầm với của ngón cái bên phải với màu sắc theo Theme và phản hồi xúc giác Haptics.
    - *Dải Danh Mục 1-Chạm (Micro Category Strip):* Tích hợp dải danh mục cuộn ngang thu nhỏ ngay trên con số tiền với 100% icon vector nổi trần (`lucide-react-native`), cho phép chuyển đổi danh mục tức thì mà không cần mở modal chọn phụ.

  - **Quyết định 97 (07/11/2026): Nâng Cấp Hệ Thống Lên Expo SDK 58 (Tương Thích iOS Expo Go v58.0.0 & React Native 0.88):**
    - *Bối Cảnh & Nguyên Nhân:*
      - Ứng dụng Expo Go trên thiết bị iOS (iPhone) của người dùng đã được Apple App Store tự động cập nhật lên phiên bản **SDK 58.0.0**. Khi quét mã QR từ dự án ở SDK 57, Expo Go trên iOS lập tức chặn và báo lỗi: *"Project is incompatible with this version of Expo Go. The installed version of Expo Go is for SDK 58.0.0. The project you opened uses SDK 57"*. Do chính sách của Apple không cho phép cài đặt các phiên bản cũ của Expo Go trên thiết bị vật lý, dự án bắt buộc phải nâng cấp lên SDK 58.
    - *Phạm Vi Nâng Cấp Dependencies:*
      - Cập nhật core framework: `expo: ~58.0.7`, `@expo/metro-runtime: ~58.0.14`, `react: 19.3.0`, `react-dom: 19.3.0`, `react-native: 0.88.0-rc.4`.
      - Cập nhật toàn bộ hệ sinh thái Expo: `expo-asset: ~58.0.13`, `expo-blur: ~58.0.3`, `expo-camera: ~58.0.9`, `expo-clipboard: ~58.0.3`, `expo-constants: ~58.0.10`, `expo-file-system: ~58.0.8`, `expo-haptics: ~58.0.5`, `expo-image: ~58.0.13`, `expo-image-manipulator: ~58.0.13`, `expo-image-picker: ~58.0.10`, `expo-linear-gradient: ~58.0.3`, `expo-linking: ~58.0.11`, `expo-notifications: ~58.1.2`, `expo-print: ~58.0.5`, `expo-router: ~58.0.17`, `expo-sharing: ~58.0.16`, `expo-status-bar: ~58.0.3`.
      - Cập nhật UI & Animation: `react-native-reanimated: 4.7.0`, `react-native-safe-area-context: ~5.9.1`, `react-native-screens: ~4.28.0`, `react-native-svg: 15.15.5`, `react-native-web: ~0.21.4`, `react-native-webview: 14.0.1`, `react-native-worklets: 0.13.0`.
    - *Bảo Toàn Native Resilience & Manifest Middleware:*
      - Duy trì cơ chế bảo vệ khởi động an toàn `nativeSafetyPolyfill.ts` tại `index.js`.
      - Áp dụng bản vá an toàn cho ManifestMiddleware của Metro xử lý các scheme URL (`exp://`, `https?://`), ngăn ngừa hoàn toàn cảnh báo `Unable to resolve manifest assets`.
    - *Tiêu Chuẩn Nghiệm Thu:*
      - `npx tsc --noEmit` đạt 0 lỗi.
      - `node run-all-tests.js` vượt qua 100% (53/53 unit tests).
      - Quét mã QR Expo Go trên iPhone mở trực tiếp app PigFly mượt mà, không gặp thông báo SDK mismatch.

  - **Quyết định 98 (07/11/2026): Bản Vá Tương Thích WS-Tunnel Cho Expo CLI (--tunnel mode) Khắc Phục Lỗi "s.WebSocket is not a constructor":**
    - *Bối Cảnh & Nguyên Nhân:*
      - Khi người dùng khởi chạy `npx expo start --tunnel -c`, module đường hầm `@expo/ws-tunnel` của Expo CLI 58 gọi `new s.WebSocket(e, ...)` dựa trên giả định `ws` v8+ xuất khẩu thuộc tính `.WebSocket`. Tuy nhiên, do Metro Bundler (`metro@0.87.1`) và React Native phụ thuộc vào `ws` v7.5.13 được npm hoist lên `node_modules/ws`, `require('ws')` chỉ trả về class `WebSocket` mà không có thuộc tính `ws.WebSocket`, dẫn tới lỗi văng sập runtime `TypeError: s.WebSocket is not a constructor`.
    - *Giải Pháp Kỹ Thuật:*
      - 1. Bổ sung `WebSocket.WebSocket = WebSocket;` vào `node_modules/ws/index.js` để tương thích hoàn toàn cả hai cách nạp module (CommonJS constructor và ESM namespace property).
      - 2. Áp dụng fallback an toàn `new (s.WebSocket || s)(e, ...)` trong `node_modules/@expo/ws-tunnel/build/index.js`.
      - 3. Thiết lập script tự động vá `scripts/patch-ws-tunnel.js` và đăng ký vào lifecycle `postinstall` của `package.json` để bản vá tồn tại bền vững sau mọi lần `npm install`.
    - *Tiêu Chuẩn Nghiệm Thu:*
      - Lệnh `npx expo start --tunnel` khởi động thành công đường hầm Metro tunnel, xuất ra URL `exp://...exp.direct` và mã QR mà không phát sinh lỗi sập `TypeError: s.WebSocket is not a constructor`.

  - **Quyết định 99 (07/11/2026): Bản Vá Triệt Tiêu Lỗi Văng Metro "Unexpected server response: 409" và Unhandled WebSocket Error Trên Node 24:**
    - *Bối Cảnh & Nguyên Nhân:*
      - Khi iPhone / Expo Go kết nối vào Metro thông qua đường hầm (`--tunnel`), sau khi bundle (`iOS Bundled 264ms index.js (1 module)`), nếu có sự cố gián đoạn mạng hoặc socket đóng mở nhanh, module đường hầm gọi tái kết nối trong `setTimeout`. Máy chủ đường hầm từ xa (`boltexpo.dev` / `exp.direct`) trả về mã HTTP `409 Conflict` do phiên subdomain cũ chưa kịp giải phóng hết trên relay server.
      - Trong `@expo/ws-tunnel`, hàm tái kết nối `this.start(c)` bên trong `setTimeout` không có `.catch()`. Đồng thời `createWebSocket` chỉ dùng `.once('error')` tạm thời, khiến các sự kiện lỗi thứ cấp từ socket stream không còn listener, làm lỗi `Unexpected server response: 409` bắn thẳng vào `process.on('uncaughtException')` tại `@expo/cli/build/src/utils/errors.js:154`, làm tắt ngấm tiến trình Metro và Node.js v24.
    - *Giải Pháp Kỹ Thuật:*
      - 1. Module 363 (`createWebSocket`): Bổ sung listener bắt `unexpected-response` để hủy handshake sạch sẽ và đăng ký listener an toàn vĩnh cửu `t.on('error', () => {})` đảm bảo mọi instance WebSocket tạo bởi đường hầm không bao giờ phát tán unhandled error ra Node EventEmitter.
      - 2. Module 450 (`createTunnel`): Bọc `this.start(c).catch(...)` bên trong `onSocketClose` `setTimeout` để nếu tái kết nối gặp 409 thì tự động kích hoạt retry backoff thay vì ném unhandled rejection làm sập tiến trình Node. Đồng thời bổ sung logic tự động retry 3 lần cho lần kết nối ban đầu nếu gặp 409.
      - 3. `@expo/cli/build/src/utils/errors.js`: Thêm cơ chế phòng vệ tại `handleTooManyOpenFileErrors` bỏ qua lỗi transient 409 (`Ignored transient tunnel conflict error (409)`) thay vì gọi `throw error; process.exit(1)`.
      - 4. `ManifestMiddleware.js`: Chuẩn hóa bóc tách base URL cho cả hai giao thức `exp://` và `https?://` (`(bundleUrl.match(/^(?:https?|exp):\/\/.*?\//)?.[0] || 'http://' + bundleUrl.split('/')[0] + '/')`).
      - 5. Toàn bộ được tự động hóa 100% trong `scripts/patch-ws-tunnel.js` và kích hoạt tự động qua `postinstall` của `package.json`.
    - *Tiêu Chuẩn Nghiệm Thu:*
      - `tsc --noEmit` đạt 0 lỗi.
      - `node run-all-tests.js` đạt 100% (53/53 tests).
      - Kiểm thử mô phỏng lỗi 409 xác nhận Metro duy trì hoạt động bền vững, không sập tiến trình Node.

  - **Quyết định 100 (08/11/2026): Kiến Trúc Web PWA (Progressive Web App), Desktop Shell Căn Giữa & CI/CD Pipeline Tự Động Deploy Lên GitHub Pages:**
    - *Bối Cảnh & Nguyên Nhân:*
      - Do các rào cản kiểm thử thực tế trên iOS (phí Apple Developer \$99/năm, chính sách không cho cài bản cũ của Expo Go dẫn đến lỗi SDK mismatch), dự án thiết lập thêm kênh kiểm thử và phân phối trực tiếp qua nền tảng Web PWA, cho phép người dùng mở trên Safari iPhone và bấm "Thêm vào MH chính" (Add to Home Screen) để sử dụng như app thật.
    - *Kiến Trúc & Giải Pháp Kỹ Thuật:*
      - 1. **Client-Side SPA Output (`app.json`):** Chuyển đổi `web.output` sang `"single"` để xuất bản dạng Client-Side SPA, triệt tiêu hoàn toàn lỗi SSR Node `ReferenceError: window is not defined` của chế độ `"static"`.
      - 2. **Cấu Hình BaseUrl Linh Hoạt (`app.config.js`):** Tự động nạp `experiments.baseUrl` từ `process.env.EXPO_BASE_URL`. Khi chạy cục bộ để trống `""` (phục vụ tại `/`), khi build CI/CD nạp `"/Kepi"` để tương thích hoàn toàn với đường dẫn hosting `https://philipsgn.github.io/Kepi/`.
      - 3. **Tùy Biến PWA & Desktop Shell (`public/index.html` & `app/+html.tsx`):** Tích hợp đầy đủ thẻ Apple PWA meta (`apple-mobile-web-app-capable`, `apple-touch-icon.png`, `manifest.json`, `theme-color: #0E1620`). Tích hợp Responsive Desktop Shell CSS: tự động co gọn vào khung điện thoại di động căn giữa màn hình (`max-width: 430px`, bóng đổ mềm mại) khi mở trên máy tính, và tràn 100% toàn màn hình khi mở trên iPhone Safari.
      - 4. **Trải Nghiệm Camera Đa Năng (`app/(main)/index.tsx`):** Hỗ trợ Web Camera trực tiếp trên khung ngắm squircle 4:5 nếu được cấp quyền, đồng thời cung cấp fallback 1-chạm mở hộp thoại chụp ảnh / thư viện ảnh native của hệ điều hành thông qua ImagePicker (`capture="environment"`).
      - 5. **Banner Hướng Dẫn Add-to-Home-Screen (`src/components/PWAInstallBanner.tsx`):** Tự động phát hiện khi người dùng mở trên iPhone Safari ở chế độ trình duyệt thường để hiển thị banner hướng dẫn nhẹ nhàng: *"Chạm nút Chia sẻ ⎋ và chọn 'Thêm vào MH chính' ➕"*, hỗ trợ ghi nhớ trạng thái đóng vào `localStorage` và tự ẩn khi ở chế độ standalone.
      - 6. **GitHub Actions CI/CD Pipeline (`.github/workflows/deploy-web.yml`):** Tự động hóa 100% quy trình: checkout $\to$ Node 22 $\to$ npm install $\to$ verify lint & unit tests $\to$ export web với `EXPO_BASE_URL="/Kepi"` $\to$ tạo `404.html` SPA routing fallback $\to$ deploy lên GitHub Pages mỗi khi push commit lên nhánh `main`.
    - *Tiêu Chuẩn Nghiệm Thu:*
      - `npx expo export --platform web` xuất ra thư mục `dist/` hoàn chỉnh với `index.html`, `_expo/`, `manifest.json`.
      - `tsc --noEmit` đạt 0 lỗi, `node run-all-tests.js` đạt 100% (53/53 tests pass).

  - **Quyết định 101 (08/11/2026): Tái Cấu Trúc Toàn Diện Hệ Thống Theme — Bộ Đôi "Hồng Heo" (`pink` - Mặc Định) & "Xanh Mint Gradient" (`mint`):**
    - *Bối Cảnh & Nguyên Nhân:*
      - Dự án PigFly lấy linh vật Heo Bay PigFly làm trung tâm định vị thương hiệu. Hệ theme 3 màu cũ (Vàng Kem Bơ `light`, Dark Than Chì `dark`, Bạc Hà `cool`) phân tán nhận diện và không toát lên được tinh thần chú heo bay đáng yêu.
      - Người dùng yêu cầu tinh giản và tái thiết kế toàn bộ: Xóa bỏ các màu cũ, chỉ giữ lại đúng 2 theme chính thức: **"Hồng Heo"** (tổng hợp các sắc hồng gắn liền với chú heo PigFly) và **"Xanh Mint"** (kết hợp các sắc xanh tự nhiên để tạo hiệu ứng gradient đa tầng chuyển sắc đẹp mắt).
    - *Kiến Trúc & Giải Pháp Kỹ Thuật:*
      - 1. **Quy hoạch 2 Theme Duy Nhất (`src/theme/tokens.ts`):** Rút gọn `ThemeMode = 'pink' | 'mint'` và `ResolvedTheme = 'pink' | 'mint'`. Thiết lập `'pink'` làm Theme mặc định toàn hệ thống.
      - 2. **Bộ Token Hồng Heo (`pinkTokens`):** Nền chính Kem Dâu Sữa dịu mắt `#FFF5F7`, thẻ bề mặt Trắng Ngọc Trai `#FFFFFF`, bề mặt phụ `#FCE7F3`, viền `rgba(244, 63, 94, 0.16)`, màu chủ đạo Hồng Đào Heo Bay `#F43F5E`, Gradient San Hô `['#FB7185', '#F43F5E']`, Chữ và số tài chính Nâu Socola Dâu `#3B0713` đạt chuẩn siêu tương phản WCAG AAA (14.2:1).
      - 3. **Bộ Token Xanh Mint (`mintTokens`):** Nền chính Sương Bạc Hà `#F0FDF9`, thẻ bề mặt Trắng Tinh Khiết `#FFFFFF`, bề mặt phụ `#CCFBF1`, viền `rgba(16, 185, 129, 0.18)`, màu chủ đạo Xanh Mint `#10B981`, Gradient Đa Tầng Chuyển Sắc `['#10B981', '#06B6D4']` (Mint $\to$ Teal $\to$ Cyan), Chữ và số tài chính Ngọc Bích Đậm `#022C22` đạt chuẩn WCAG AAA (15.1:1).
      - 4. **Khả Năng Tương Thích Ngược (Backward Compatibility):** Khai báo các hằng số alias `export const lightTokens = pinkTokens; export const darkTokens = pinkTokens; export const coolTokens = mintTokens;` giúp các component chưa refactor vẫn hoạt động mượt mà không vỡ build.
      - 5. **Tự Động Nâng Cấp Dữ Liệu Cũ (Auto Migration in `ThemeContext.tsx`):** Nếu `AsyncStorage` đang lưu trữ giá trị theme cũ (`'light'`, `'dark'`, `'system'`), tự động nâng cấp sang `'pink'`; nếu đang lưu `'cool'` tự động chuyển sang `'mint'`.
      - 6. **Giao Diện Cài Đặt Profile (`ThemeSettingsCard.tsx`):** Chuyển sang Segmented Switch 2 nút bấm bo cong pill: `[🐷 Hồng Heo]` và `[🍃 Xanh Mint]`, phản hồi rung haptic và cập nhật tức thì toàn bộ ứng dụng.
    - *Tiêu Chuẩn Nghiệm Thu:*
      - Đồng bộ hoàn toàn với tài liệu thiết kế chuẩn `docs/DESIGN.md`.
      - `tsc --noEmit` đạt 0 lỗi.
      - `node run-all-tests.js` đạt 100% (53/53 tests pass).


  - **Quyết định 102 (08/11/2026): Nâng Cấp Tương Tác Pop-Anime / Y2K Arcade Trên Nền 2 Theme Chính Thức "Hồng Heo" & "Xanh Mint":**
    - *Bối Cảnh & Bản Chất:* Giữ vững 2 theme màu cốt lõi `pink` và `mint` đã được chuẩn hóa WCAG AAA, nhưng nâng cấp toàn diện ngôn ngữ tương tác sang phong cách Pop-Anime / Y2K Arcade: đường nét đậm nét (`borderWidth: 2`), bóng đổ khối đặc (Chunky 2D Drop Shadow), hiệu ứng nảy nhún xúc giác (Squishy UI / Physics-based micro-interactions) mang lại cảm giác đồ chơi game sống động cho người dùng Gen Z.

  - **Quyết định 103 (08/11/2026): Phân Hệ AI-First Receipt OCR Pipeline & Giao Diện Carousel Fallback $\le 3$s:**
    - *Bối Cảnh & Bản Chất:* Tự xây dựng pipeline bóc tách hóa đơn retail Việt Nam (nhận diện đơn vị bán, danh sách món, VAT, tổng tiền); tự động gắn tag danh mục chi tiêu; cung cấp giao diện Carousel Fallback cho phép người dùng chọn hoặc tinh chỉnh nhanh các ứng viên số tiền phát hiện được trong vòng $\le 3$s trước khi bấm Lưu Sổ.

  - **Quyết định 104 (08/11/2026): Phân Hệ Voice-to-Expense NLP Cho Tiếng Việt Tự Nhiên:**
    - *Bối Cảnh & Bản Chất:* Hỗ trợ nhập liệu bằng giọng nói với engine bóc tách NLP thuần tiếng Việt ("Ăn bún bò 50 cành", "Đi Grab 32k", "Uống Highlands 45 nghìn"), tự động trích xuất số tiền, phân loại danh mục và đề xuất emoji/icon tương ứng, giúp ghi chép siêu tốc chỉ với 1 chạm xác nhận.

  - **Quyết định 105 (08/11/2026): Phân Loại Danh Mục On-Device Ngoại Tuyến Qua Computer Vision:**
    - *Bối Cảnh & Bản Chất:* Tích hợp bộ phân loại hình ảnh chạy 100% On-Device (TFLite/CoreML) giúp nhận diện đối tượng chụp (món ăn, trang phục mua sắm, phương tiện di chuyển, sách vở) và tự động gắn category ngay khi chụp ảnh mà không cần kết nối mạng hay gửi ảnh ra ngoài.

  - **Quyết định 106 (08/11/2026): Tự Xây Dựng Gamification Engine Lấy Cảm Hứng Từ Mẫu Thiết Kế ActiDoo:**
    - *Bối Cảnh & Bản Chất:* Không phụ thuộc hạ tầng Python bên ngoài, PigFly tự xây dựng Gamification Engine thuần TypeScript trên nền Zustand & Supabase, áp dụng các pattern cốt lõi của `ActiDoo/gamification-engine`: Contextual Variables, Rules Engine đánh giá sau sự kiện, Multi-Level Achievements, Time-Aware Goals, Hệ thống FEP (Fly Energy Points) và 5 Tầng Mây Tài Chính.

  - **Quyết định 107 (08/11/2026): Chiến Lược Phát Triển Song Song 2 Luồng Độc Lập (AI Engine & Gamification):**
    - *Bối Cảnh & Bản Chất:* Tách biệt phát triển thành 2 luồng độc lập: Luồng A (AI OCR, Voice NLP, Vision Classifier) và Luồng B (Gamification Store, Rules Engine, Cờ Tỷ Phú, Mascot Lottie, Squad SOS Alarm) giúp tiến độ thần tốc mà không gây xung đột mã nguồn.

  - **Quyết định 108 (08/11/2026): Nâng Cấp Mini-Game "Cờ Tỷ Phú Đầu Tư Tài Chính" & Giao Thức SOS Overspending Alarm Cho Squad:**
    - *Bối Cảnh & Bản Chất:* Thay thế mini-game bay đơn giản bằng bàn cờ 16 ô "Cờ Tỷ Phú Đầu Tư Tài Chính" kết hợp giáo dục tài chính (bẫy FOMO, cơ hội đầu tư, cổ tức, flashcards); đồng thời tích hợp giao thức SOS Overspending Alarm cho Squad 4 người: khi một thành viên chi vượt hạn mức ngày, mascot phát tín hiệu cầu cứu sang màn hình 3 bạn thân để nhận meme và lời khuyên kịp thời.

  - **Quyết định 109 (08/11/2026): Hệ Thống Hoạt Họa Linh Vật Heo Bay PigFly Bằng Lottie Với 4 Trạng Thái Cảm Xúc:**
    - *Bối Cảnh & Bản Chất:* Sử dụng Lottie Animations nhẹ nhàng, sắc nét cho chú heo PigFly phản ánh sức khỏe tài chính thực tế qua 4 trạng thái cảm xúc: `FLYING_HIGH` (tiết kiệm tốt / streak cao), `CHILL` (bình ổn), `PANIC` (tiêu lố hạn mức), `STARVING` (chưa cho ăn/chưa ghi chép), cùng tủ đồ Skin trang phục mở khóa bằng điểm FEP.

  - **Quyết định 110 (08/11/2026): Báo Cáo Định Kỳ Phong Cách Magazine / Story Anime Trong Tab Thống Kê:**
    - *Bối Cảnh & Bản Chất:* Tab Stats mở rộng mục Báo cáo tuần & tháng theo bố cục cuộn dọc kiểu tạp chí Manga / Story, trực quan hóa 3 chỉ số sức khỏe tài chính mới: Runway Score (số ngày dòng tiền duy trì), Impulse Ratio (tỷ lệ chi bốc đồng), Savings Velocity (tốc độ về đích mục tiêu) cùng lời bình hài hước "cà khịa có tâm" của Anh PT Minh Locket.

  - **Quyết định 111 (08/11/2026): Tiện Ích Màn Hình Android Native AppWidget Ghim Hạn Mức & Chú Heo Bay:**
    - *Bối Cảnh & Bản Chất:* Ưu tiên xây dựng tiện ích Android AppWidget trên màn hình chính hiển thị trạng thái cảm xúc chú heo PigFly, hạn mức `Hôm nay tiêu được` và lối tắt 1-chạm mở Camera hoặc ghi chép nhanh khoản nhỏ.

  - **Quyết định 112 (09/11/2026): Tối Giản Gamification — Loại Bỏ Điểm FEP Ảo, Tập Trung Vào Chuỗi Streak & Tâm Trạng Chú Heo PigFly Lottie:**
    - *Bối Cảnh & Bản Chất:* Người dùng đánh giá việc tích lũy điểm năng lượng FEP ảo không mang lại giá trị thiết thực và gây rối mắt. Dự án quyết định khai tử hoàn toàn hệ thống điểm số FEP ảo (Zero Virtual Points Policy). Toàn bộ động lực gắn kết người dùng được quy tụ vào 2 trụ cột trực quan, minh bạch và gần gũi nhất: **Chuỗi ngày kỷ luật (Streak Days)** (tương tự Locket/Duolingo) và **Trạng thái cảm xúc thực tế của chú heo PigFly** (4 mood: `FLYING_HIGH`, `CHILL`, `PANIC`, `STARVING`) cùng các tầng mây chinh phục tính theo chuỗi ngày liên tiếp.

  - **Quyết định 113 (10/11/2026): Khai Tử Supabase Cloud & Google Sign-In — Kiến Trúc Thuần Local-First (100% Offline-First):**
    - *Bối Cảnh & Bản Chất:* Người dùng ưu tiên tối đa quyền riêng tư và trải nghiệm mượt mà không phụ thuộc hạ tầng mạng bên thứ ba. Dự án loại bỏ hoàn toàn các phụ thuộc Supabase và Google OAuth, chuyển sang kiến trúc Thuần Local-First: mọi dữ liệu lưu trữ 100% cục bộ trên thiết bị (`AsyncStorage`/SQLite), đăng nhập bằng biệt danh tại chỗ, sao lưu/phục hồi thủ công. Hệ thống đạt trạng thái 0-delay (phản hồi 0ms), 0 chi phí duy trì backend và bảo mật tuyệt đối.

  - **Quyết định 114 (11/11/2026): Chiến Lược 2 Giai Đoạn — Ưu Tiên Tuyệt Đối Offline-First Rock-Solid Trước, Tích Hợp Supabase Cloud Sau Khi Đã Ổn Định Hoàn Toàn:**
    - *Bối Cảnh & Bản Chất:* Nghiên cứu từ mô hình thực tế của Locket Widget (lưu trữ cục bộ cho widget & cache, đám mây cho phân tích và đồng bộ). Người dùng khẳng định triết lý cốt lõi: Ứng dụng phải ưu tiên Offline trước để người dùng có thể ra đường chụp ảnh, ghi sổ kể cả khi không có mạng 4G/Wifi. Ảnh WebP nén (~50KB/ảnh) được lưu vĩnh viễn vào `DocumentDirectory` (không bao giờ bị hệ điều hành xóa rác). Hạ tầng Cloud (Supabase PostgreSQL + Storage + RLS) chỉ được tích hợp như một lớp Adapter mở rộng sau khi tầng Offline-First đã hoạt động hoàn hảo 100%.

  - **Quyết định 115 (11/11/2026): Khai Tử Bàn Cờ Cờ Tỷ Phú & Ra Mắt PigFly 3D FPS Flight Simulator (Three.js WebGL); Hoàn Thiện Tab Thống Kê 3 Chế Độ Xem:**
    - *Bối Cảnh & Bản Chất:* Thay thế bàn cờ xúc xắc 2D cũ bằng tựa game mô phỏng 3D góc nhìn thứ nhất (First-Person Simulator - FPS) nhúng tối ưu qua Three.js WebGL trong `react-native-webview`. Người chơi trực tiếp lái chú heo PigFly bay xuyên qua các Vòng Cổng Tiết Kiệm (Savings Rings), nhặt coin vàng và né tránh mây bão bẫy nợ FOMO. Thế giới 3D được mở khóa theo **Chuỗi Streak thực tế** (phong cách Mario World: Đất Mây Khởi Động $\to$ Hoàng Hôn Nắng Thu $\to$ Bầu Trời Mint $\to$ Đêm Sao Cực Quang), cam kết Zero FEP điểm ảo. Đồng thời, Tab Thống Kê mở rộng thanh chuyển đổi thành 3 chế độ xem: `[📸 Cuốn Album | 📊 Phân tích Data | 📖 Tạp chí Anime]`, kết nối dữ liệu tài chính thời gian thực cho 3 chỉ số Runway Score, Impulse Ratio, Savings Velocity.

  - **Quyết định 116 (14/11/2026): Áp Dụng Phong Cách "Heo Con" Kawaii Neo-Brutalist Từ Prototype Vào Toàn App — Theme 3 `heocon` Làm Mặc Định:**
    - *Bối Cảnh & Bản Chất:* Prototype tương tác `prototype/Ví Heo Con.html` + `prototype/MASTER-PROMPTS.md` (Plan 0–11) định hình phong cách kawaii neo-brutalist hoàn chỉnh: viền 3px nâu mực, bóng cứng 0-blur, nền kem, khu vườn pixel Việt hóa, heo pixel phản ứng theo hạn mức. Quyết định học *phong cách* (không sao chép tài sản app mẫu) và chuẩn hóa thành hệ thiết kế chính thức.
    - *Duy Nhất 1 Theme `heocon` (Đơn Giản Hóa & Nhận Diện Độc Bản):* Theo phê duyệt Grill-Me 14/11/2026, loại bỏ hoàn toàn 2 theme cũ pink/mint, chuyển sang duy nhất 1 Theme `heocon` làm linh hồn thương hiệu PigFly. Màu lõi: Kem Sàn `#F6EEDC`, thẻ Kem Trắng Ngọc `#FFFBF1`, Nâu Mực `#2B2118`, Hồng Heo `#F9B8C4`, Xanh Lá `#5E9A57`, Đỏ Cam `#E0452B`, Vàng Cám `#F4B93B`; `textOnPrimary` = Nâu Mực (không phải trắng). Bảng tương phản WCAG chi tiết tại `docs/STYLE_HEOCON.md` §3.4.
    - *Font:* **Baloo 2** (Display/số tiền, 800) + **Nunito** (Body, 600–800) — hỗ trợ tiếng Việt đầy đủ, cài qua `expo-font` + `@expo-google-fonts/*`.
    - *Hình ngôn ngữ toàn app:* viền 3px mọi bề mặt tương tác, bóng cứng `0 3–4px 0` (lớp bóng giả trên Android), bo góc theo token (thẻ 26–28, jar 20, chip 18, ô tiến độ 8, pill 999), spacing 8/12/16/24, nhãn overline 12px ls 0.16em UPPERCASE, gạch đứt 2px `#D9C9A4`, số tiền 38px tabular + "đ" 60% gạch chân.
    - *Khu vườn pixel heo trên Home (Plan 5/6/7):* nhúng trực tiếp 100% canvas HTML5 từ `prototype/Ví Heo Con.html` qua `SafeWebView` (`react-native-webview`) với cầu nối 2 chiều postMessage; canvas logic 176×132 (4:3), tối đa 32 màu, tách 3 lớp bg/sorted/fg; heo sprite 24×20 (stand/walk/eat/sleep/happy/sad), đồng xu vàng cổ; máy trạng thái idle/walk/sleep/eat/happy — vùng đi được x 26–164 y 78–118, né ao (136,106,31,13); 68% đi dạo / 14% ngủ; lố hạn mức → heo sad + đi chậm 15 px/s + toàn ô đỏ. **Không thêm đơn vị "cám"** — phần thưởng quy về Streak + "Đã giữ lại" (tôn trọng Quyết định 112 Zero Virtual Points).
    - *Phạm vi áp dụng:* Màn chuẩn hóa đầu tiên = **Home** (`docs/screens/HOME.md` v2.0, giữ nguyên 100% features); các màn khác theo Phụ lục "Đồng bộ phong cách Heo Con" trong STATS/CAMERA/CHAT/PROFILE.
    - *Tài liệu chuẩn:* [`docs/STYLE_HEOCON.md`](STYLE_HEOCON.md) — nguồn sự thật duy nhất của phong cách; cập nhật `docs/DESIGN.md` mục 2; `docs/screens/HOME.md` v2.0.
    - *Thi công (Agent thực thi):* nền tảng `src/components/neo/` (NeoCard/NeoButton/NeoChip/OverlineLabel/DashedDivider/NeoShadow + `SegmentBar10` variant neo), khu vườn Pixel nhúng qua `PixelGardenWebView.tsx` (WebView 60fps, 0 lag); tuân thủ reduce-motion và 60fps.

  - **Quyết định 117 (16/11/2026): Hoàn Thiện Tab Home Screen (Neo-Brutalist Pixel, Cây Thông Noel, Dải Đèn Đêm, Vườn Pixel Tương Tác Vô Hạn & Trục Xương Sống Backend Đồng Bộ Đa Tab):**
    - *Bối Cảnh & Bản Chất:* Sau khi hoàn thiện toàn bộ UI/UX Tab Home Screen chuẩn Style Heo Con (thẻ đè -22px, 10 ô hạn mức neo, dải ghi nhanh, lịch thu nhỏ), hệ thống bổ sung trọn vẹn các tính năng đồ họa và tương tác tự nhiên:
      1. **Hệ thống Avatar Heo Pixel 16×16 (`PixelPigAvatar`):** Thay thế hoàn toàn các hình ảnh PNG/3D cũ bằng lưới SVG Pixel Grid 16×16 với 5 biểu cảm linh hoạt (`idle`, `happy`, `sad`, `blink`, `sleep`), đồng bộ trên Header, Spend Card, Profile và Chat Coach.
      2. **Cây Thông Noel & Đèn Đêm Rực Rỡ:** Đặt cây thông Noel 3 tầng lá kèm ngôi sao vàng phát sáng trên hiên nhà, dây đèn tròn trang trí dọc viền mái hiên; tự động biến chuyển ánh sáng theo giờ thực của thiết bị (đêm rực sáng ánh vàng ấm áp).
      3. **Chu Trình Ăn Táo Vô Hạn:** Táo rụng, chú heo chạy lại ăn và từng quả táo lần lượt biến mất (800ms / 1600ms / 2400ms); dọn sạch bãi cỏ và cho phép người dùng bấm lại cây táo để lặp lại chu trình không giới hạn.
      4. **Trục Xương Sống Backend (Central State & Event Bus):** Tab Home đóng vai trò điểm kết nối trung tâm với 4 Tab (Camera, Stats, Squad/Chat, Profile). Bất kỳ giao dịch mới nào được tạo (từ Camera, OCR, VietQR hay Voice) lập tức cập nhật lại `budgetStore`, đẩy sang Home để cập nhật 10 ô hạn mức và kích hoạt phản ứng cảm xúc của chú heo trong vườn.
      5. **Động Cơ Lời Khuyên Ngộ Nghĩnh (`Pig Advice Engine`):** Tự động sinh câu thoại dí dỏm, thông minh dưới khung vườn theo 5 mốc ngân sách thực tế (<40%, 40-75%, 75-100%, >100%), thời gian trong ngày và chuỗi streak, đồng bộ trạng thái cảm xúc vào `gamificationStore`.

  - **Quyết định 118 (16/11/2026): Nâng Cấp Mặt Tiền Nhà 2 Tầng Pixel (Giáng Sinh Noel) & Xây Dựng Hệ Thống Nhà Của Heo 6 Phòng Trên Tab Thống Kê:**
    - *Bối Cảnh & Bản Chất:* Người dùng cung cấp mẫu thiết kế prototype `prototype/Nhà heo con.html` và ảnh template thực tế (`media_1794842621149_ee06a974.jpg`). Để kiến trúc ngoại thất khớp 100% với cấu trúc 2 tầng 6 phòng bên trong, mặt tiền căn nhà ngoài sân vườn được tái thiết kế thành ngôi nhà 2 tầng chuẩn pixel:
      1. **Mặt tiền Nhà 2 tầng Noel (Tab Sân Vườn):** Tầng 1 gồm cửa chính gỗ đôi ở giữa có đèn lồng đỏ (cửa trượt mở khi người dùng bấm "Vào nhà"), cửa sổ phòng làm việc bên trái (bàn + máy tính), cửa sổ phòng khách bên phải (ghế sofa hồng); Tầng 2 gồm dầm gỗ chia tầng / ban công gỗ, 2 cửa sổ lớn có ánh đèn vàng ấm áp; Mái ngói đỏ gạch 2 tầng có ống khói; Cây thông Noel có sao vàng phát quang, dải đèn tròn dọc mái hiên; Ban đêm cả 4 cửa sổ bừng sáng lung linh đón Noel.
      2. **Nhà Của Heo 6 Phòng (Tab Thống Kê / Tab 1):** Port 1:1 code đồ họa từ prototype gồm mặt cắt ngôi nhà 2 tầng 6 phòng (Canvas 176×108), cầu thang gỗ nối 2 tầng, chú heo di chuyển giữa các phòng khi chọn phòng; dải chọn phòng; chi tiết nội thất phòng (Canvas 176×96) với đầy đủ tranh ảnh pixel treo tường.
      3. **Kết Nối Dữ Liệu Chi Tiêu Thực Tế Từng Phòng:** Bếp (chi Ăn uống), Phòng khách (chi Mua sắm), Phòng làm việc (chi Đi lại), Phòng ngủ (khoản tiền Cứu ví / Đã giữ lại), Phòng ảnh (Album ảnh món ăn & hóa đơn thật), Sảnh (Tổng quan ngân sách tháng).
      4. **Chuẩn Hóa Điều Hướng 5 Tab:** Tab 0 `[🌱 Sân Vườn]` (icon Trees/Sprout) $\leftrightarrow$ Tab 1 `[🏠 Nhà Heo]` (icon Home - Nhật ký thống kê & 6 phòng). Chạm cửa nhà trên sân vườn sẽ chạy hoạt ảnh mở cửa và chuyển ngay sang Tab Nhà Heo.

  - **Quyết định 119 (17/11/2026): Nâng Cấp Toàn Diện Nhà Của Heo v2 (Sprite Heo Con Siêu Cute, Không Khí Noel Ấm Cúng & Hệ Thống Tương Tác Touch Actions 2 Cấp Độ):**
    - *Bối Cảnh & Bản Chất:* Sau khi triển khai bước đầu Tab Nhà Heo, người dùng nhận xét sprite chú heo cần dễ thương hơn và nội thất cần nhiều chi tiết vui nhộn, giàu tương tác hơn. Grill-Me phê duyệt phương án nâng cấp toàn diện:
      1. **Port 1:1 Sprite Heo Con Siêu Cute Chuẩn Pixel:** Thay thế hoàn toàn thuật toán vẽ bằng hàm `shape()` và bảng màu `PAL` chuẩn: viền mực `#4B2B21`, má hồng phúng phính `#EE90A6`, vòng chuông cổ vàng `#F4B93B`, mắt tròn long lanh có đốm sáng trắng `#FFF`, tai rung rinh, đuôi xoắn ngoe nguẩy, hoạt ảnh nhún nhảy `happy` thả tim bay lơ lửng, ngủ cuộn tròn có chữ `Z z z` bay lên.
      2. **Không Khí Noel Ấm Cúng Trong 6 Phòng:** Cây thông Noel mini với chùm đèn LED 3 màu nhấp nháy, lò sưởi bập bùng lửa đỏ trong phòng khách, bít tất đỏ viền trắng treo đầu giường, cửa sổ đêm có tuyết rơi li ti, nồi súp bốc khói 3 làn mờ ảo trên bếp, màn hình máy tính phát ánh sáng cyan nhấp nháy.
      3. **Hệ Thống Tương Tác Chạm Đồ Vật (Touch Actions 2 Cấp Độ):**
         - Cấp 1 (Mặt cắt 2 tầng `#map`): Chạm vào phòng nào, heo tự động leo cầu thang gỗ `STAIR` chạy sang phòng đó.
         - Cấp 2 (Phòng chi tiết `#room`): Chạm trực tiếp vào Giường (`ngu`), Nồi súp (`bep`), Bàn PC (`lamviec`), Sofa/Cây thông (`khach`), Tường ảnh (`anh`), Hũ tiền (`sanh`), hoặc chạm vào chính Chú Heo để kích hoạt hoạt ảnh sinh động và câu thoại hóm hỉnh tương ứng.
      4. **Tinh Giản Giao Diện (User-Driven):** Bỏ nút "Dẫn tham quan" tự động, giữ header sạch sẽ với thẻ Tháng, tiêu đề Nhà Của Heo và nút "Ra vườn chơi" chuyển mượt về Tab 0.

  - **Quyết định 121 (17/11/2026): Nâng Cấp Bảng Màu "Hồng Heo Mơ Mộng Pastel" (#FFF0F3), Bố Cục Nhà Heo Sát Trần & Đồng Bộ Sân Vườn 1:1 Theo Prototype:**
    - *Bối Cảnh & Bản Chất:* Người dùng phản ánh Nhà của Heo gặp lỗi màn hình vàng khè, yêu cầu nâng cấp bảng màu sang chuẩn "Hồng Heo Mơ Mộng Pastel", loại bỏ chữ "Thống kê" ở Header để không gian nằm cao sát trần, và gửi ảnh đối chiếu 3 panel trực quan của prototype ngoài Sân Vườn (Nắng, Đêm, Vào nhà).
    - *Giải Pháp Kỹ Thuật Đã Thực Hiện:*
      1. **Khắc Phục Lỗi Màn Hình Vàng Khè:** Sửa lỗi cú pháp JavaScript `#'2B2118'` $\to$ `'#2B2118'` tại hàm `mini` (phòng bếp). Script WebView chạy mượt mà 100% không còn bị gián đoạn hay crash.
      2. **Bảng Màu "Hồng Heo Mơ Mộng Pastel":**
         - Nền ứng dụng: `--screen: #FFF0F3` (Hồng pastel dịu ngọt, mơ mộng, sáng sủa).
         - Thẻ nội dung: `--card: #FFFFFF` (Trắng tinh khôi, tương phản cao với viền mực `#2B2118` và bóng đổ cứng `0 3px 0 #2B2118`).
         - 6 Phòng pastel tươi sáng: Sảnh (`#FFF6E5`), Bếp (`#FFEBD9`), Khách (`#E4F4DC`), Làm việc (`#E3F2FD`), Phòng ảnh (`#F2E7FA`), Phòng ngủ (`#FCE4EC`).
      3. **Bố Cục Đẩy Cao Sát Trần & Tích Hợp Top Bar:**
         - Loại bỏ hoàn toàn thanh Header tĩnh `<View style={styles.header}>` khi ở chế độ Nhà Heo (`HOUSE`).
         - Tích hợp các nút điều khiển trực tiếp vào Top Bar của Nhà Heo: Avatar 16×16 pixel, tiêu đề & số ngày chuỗi, nút Tạp chí Anime ✨ (`OPEN_MAGAZINE`), nút Ẩn tiền 👁️ / 🙈 (`TOGGLE_MASK`), và nút Tham quan (`tourBtn`).
         - Đệm an toàn đỉnh gắn liền với `insets.top`, tạo cảm giác không gian nhà bừng sáng chạm trần máy.
      4. **Đồng Bộ Sân Vườn (Garden) Chuẩn Xác 1:1 Theo 3 Panel Prototype:**
         - Góc trên trái: Nút tròn icon chân heo (paw SVG) + nút viên thuốc "Vào nhà".
         - Góc trên phải: Huy hiệu đồng xu + số ngày chuỗi `[ 🪙 24 cám / Chuỗi X ngày ]`.
         - Góc dưới trái: Nút trạng thái `[ Nắng · sân · đứng ngắm ]` cho phép người dùng chạm để chuyển đổi linh hoạt thời điểm trong ngày (Nắng $\to$ Chiều $\to$ Đêm) và đồng bộ trạng thái heo.
         - Hoạt cảnh vào nhà 4 bước: Heo reo $\to$ Bước lên bậc thềm đá $\to$ Cửa trượt mở hé lộ ánh sáng vàng $\to$ Bước qua ngưỡng cửa vào trong lòng nhà $\to$ Chuyển tab.
      5. **Hỗ Trợ Web Preview:** Tích hợp fallback thẻ `iframe` với `srcDoc` cho `PixelHouseWebView` trên nền tảng `Platform.OS === 'web'`.

  - **Quyết định 122 (18/11/2026): Chuẩn Hóa Vòng Đời & Kiến Trúc Hiển Thị PixelHouseWebView Trên iOS RN 0.88 Fabric (Khắc Phục Triệt Để Màn Hình Trơn #FFF0F3):**
    - *Bối Cảnh & Bản Chất:* Trên thiết bị iPhone chạy React Native 0.88.0-rc.4 Fabric và react-native-webview 14.0.1, khi WebView đặt tại Trang 1 trong Horizontal ScrollView đa trang, WKWebView bị gắn ngoài viewport (`x = SCREEN_WIDTH`) tại thời điểm khởi động dẫn đến hiện tượng màn hình trắng/hồng trơn do WebKit trì hoãn cấp phát surface vẽ; đồng thời CSS `flex: 1` không có chiều cao số tường minh, thẻ Google Fonts CDN chặn vẽ và StatusBar style auto bị tàng hình trong Dark Mode.
    - *Giải Pháp Kỹ Thuật Đã Thực Hiện:*
      1. **Lazy-Mount On-Screen (`isActive`):** Truyền `isActive={activeTabIndex === 1}` từ `index.tsx` qua `StatsView` vào `PixelHouseWebView`. WebView chỉ mount khi người dùng lần đầu tiên kích hoạt Tab 1 (hoặc qua hoạt cảnh vào nhà từ Tab 0), đảm bảo bề mặt vẽ luôn được cấp phát ngay lập tức trên màn hình (on-screen).
      2. **Kích Thước Pixel Số Tường Minh Cho Fabric:** Xác định `boxWidth` và `boxHeight` qua `useWindowDimensions()` và truyền trực tiếp vào `containerStyle` và `style` của `SafeWebView` (`flex: 0`), giải quyết dứt điểm lỗi sập chiều cao của Fabric container.
      3. **100% Offline-First System Fonts:** Loại bỏ thẻ `<link rel="stylesheet" href="https://fonts.googleapis.com/...">` chặn luồng render mạng; chuyển sang font hệ thống bo tròn offline chuẩn iOS (`'SF Pro Rounded', 'Nunito', -apple-system`).
      4. **`useMemo` Source Cố Định & Cầu Nối `window.syncData`:** Cố định `source = { html: initialHtml, baseUrl: '' }` bằng `useMemo` tránh tạo mới đối tượng gây reload WebView khi cha re-render; đồng bộ số liệu và trạng thái ẩn tiền tức thì qua `injectJavaScript('window.syncData(...)')`.
      5. **Phục Hồi Tự Động WebKit Termination:** Gắn `key={'pig-house-' + reloadKey}`, bắt sự kiện `onContentProcessDidTerminate` và `onError` kèm giao diện cứu trợ 1 chạm nếu tiến trình WebKit bị hệ điều hành giải phóng.
      6. **Thanh Trạng Thái (StatusBar) Tối Sắc Nét:** Đổi `StatusBar` sang `style="dark"` trên các trang nền sáng để thông tin giờ, pin và sóng luôn hiển thị rõ ràng trên nền hồng `#FFF0F3`.

  - **Quyết định 123 (18/11/2026): Nâng Cấp Sân Vườn Pixel (Khắc Phục Biến Dạng Ma Trận, Triệt Tiêu Lỗi Cỏ Đè Heo, Decor Noel Tinh Tế, Auto-TOD Theo Giờ Thật & Chạm Cánh Cửa Vào Nhà):**
    - *Bối Cảnh & Bản Chất:* Người dùng cung cấp ảnh thực tế về hiện tượng khung vườn bị kéo dãn bẹp dí sọc rách pixel (ảnh 1), chi tiết cỏ đè lên thân heo khi ngủ ở góc sân (ảnh 2). Đồng thời yêu cầu trang trí Noel ấm cúng tinh tế, tự động chuyển trời sáng/chiều/tối theo giờ thực tế (không cho chỉnh tay) và gỡ bỏ nút "Vào nhà" để tương tác 100% bằng cách chạm trực tiếp vào cánh cửa nhà.
    - *Giải Pháp Kỹ Thuật Đã Thực Hiện:*
      1. **Khắc Phục Biến Dạng Ma Trận (Fix Ảnh 1):** Gọi `ctx.setTransform(1, 0, 0, 1, 0, 0)` và `ctx.clearRect(0, 0, W, H)` trước mỗi frame `draw(t)` để triệt tiêu việc tích lũy scale âm/rotate lệch ma trận qua các vòng lặp animation.
      2. **Triệt Tiêu Lỗi Cỏ Đè Heo (Fix Ảnh 2):** Đưa layer foreground `fg` vào chu trình sắp xếp chiều sâu `Y-sorting` cùng chú heo theo `pig.y` và nâng giới hạn di chuyển `MINX = 30` để heo luôn nổi 100% trên bề mặt cỏ khi nằm ngủ.
      3. **Decor Noel Ấm Cúng Tinh Tế:** Viền tuyết trắng li ti trên mái ngói đỏ và mái hiên tầng 1; chuỗi đèn LED Giáng Sinh 4 màu (đỏ, vàng, xanh lá, xanh băng) nhấp nháy dọc ban công tầng 2; chậu cây thông Noel mini đính sao vàng và hạt châu trên hiên nhà; vòng nguyệt quế xanh nơ đỏ phía trên cửa chính.
      4. **Tự Động Hóa Chu Kỳ Sáng/Chiều/Tối (Auto-TOD):** Bắt giờ thực tế từ đồng hồ thiết bị (`06h-17h: day` trời nắng, `17h-19h: dusk` hoàng hôn ngả cam, `19h-06h: night` đêm sao sáng đèn cửa sổ). Bỏ sự kiện click đổi thủ công trên nhãn trạng thái `.state`.
      5. **Bỏ Nút "Vào Nhà" & Tương Tác Trực Tiếp Cánh Cửa:** Gỡ bỏ cụm nút `.tl` ở góc trên trái. Mở rộng vùng cảm ứng chạm trực tiếp vào cánh cửa chính trên ngôi nhà (`x: 44..74, y: 34..64`) để kích hoạt hoạt cảnh mở cửa và bước vào nhà chuyển sang Tab 1.

  - **Quyết định 124 (18/11/2026): Khắc Phục Lỗi Màn Trắng Hồng Tab 0 & Lỗi Canvas Heo Biến Dạng Blob Đen:**
    - *Bối Cảnh & Bản Chất:* Người dùng cung cấp ảnh thực tế về lỗi Tab 0 (Sân Vườn) đôi khi bị màn hình trơn trắng/hồng khi khởi động ứng dụng (ảnh 1, 3) và chú heo bị vẽ biến dạng thành một khối blob đen dài che phủ sân (ảnh 4).
    - *Giải Pháp Kỹ Thuật Đã Thực Hiện:*
      1. Bổ sung `isActive` prop và `hasMountedOnce` ref guard cho `PixelGardenWebView` (tương tự như `PixelHouseWebView` ở Quyết định 122). Ngăn chặn việc WKWebView mount khi tab đang ở vị trí offscreen ngoài viewport trên iOS Fabric.
      2. Truyền `isActive={activeTabIndex === 0}` từ `index.tsx` qua `JournalView` xuống `PixelGardenWebView`.
      3. Bổ sung `pcx.setTransform(1, 0, 0, 1, 0, 0)` và `ctx.globalAlpha = 1` reset triệt để ma trận cọ vẽ trước mỗi frame `drawPig` và `draw()`, loại bỏ hoàn toàn tích lũy ma trận lật mặt `scale(-1, 1)` gây ra lỗi heo blob đen.

  - **Quyết định 125 (18/11/2026): Thiết Kế Lại Phòng Ảnh (Photo Room), Port 1:1 Buồng Photobooth & Chuyển Hướng Sang Tab Camera:**
    - *Bối Cảnh & Bản Chất:* Theo đặc tả prototype mới `Nhà heo con.html`, Phòng Ảnh (`anh`) là trung tâm thị giác quan trọng với buồng chụp ảnh **Photobooth**. Người dùng yêu cầu port 1:1 hoạt họa buồng chụp (kéo rèm xanh, thò 2 chân hồng, flash 600ms, heo reo) và khi nhấn "Chụp ảnh", app tự động chuyển sang Tab Camera (Tab 2). Đồng thời, danh sách ảnh trong panel phòng ảnh phải hiển thị ảnh thực tế từ bộ nhớ thiết bị (`transactionStore` với `photo_url`), không hardcode ảnh giả, và hiển thị empty state sạch sẽ nếu chưa có ảnh.
    - *Giải Pháp Kỹ Thuật Đã Thực Hiện:*
      1. **Port Buồng Chụp Pixel Art 1:1:** Thêm hàm `booth(c, t)` và trạng thái `bs = { closed: false, flash: 0, pigIn: false }`. Thân buồng đỏ `#E0452B`, mái cong trắng `#FFFBF1`, ống kính cyan `#7FD4E0`, rèm xanh `#6DA9D9` trượt đóng/mở và 2 bàn chân heo hồng `#F9B8C4` thò ra mép rèm khi chụp.
      2. **Luồng Điều Hướng Photobooth Transition:**
         - Chạm vào buồng chụp (`x: 126..170, y: 18..66`) hoặc nút *"📸 Heo ơi, đi chụp ảnh"* trong panel $\to$ Heo chạy đến tọa độ `(148, 84)`.
         - Nút `#boothBtn` ("Chụp ảnh") xuất hiện ở góc dưới khi heo đứng gần buồng chụp ($< 28\text{px}$).
         - Bấm "Chụp ảnh" $\to$ Kéo rèm kín $\to$ Flash trắng bừng sáng 600ms $\to$ WebView gửi `postMessage({ type: 'OPEN_CAMERA' })`.
         - `PixelHouseWebView` gọi prop `onOpenCamera()` $\to$ `StatsView` gọi `onNavigateToCamera()` $\to$ `index.tsx` chuyển tab sang Tab 2 (Camera).
      3. **Trưng Bày Ảnh Thực Tế (Zero Hardcode):**
         - Truyền `photos` từ `useTransactionStore` (các giao dịch có ảnh) vào `PixelHouseWebView`.
         - Panel phòng ảnh hiển thị lưới ảnh chụp thực tế (thumbnail, tên món, số tiền, ngày). Nếu chưa có ảnh, hiển thị empty state đáng yêu mời chụp món đầu tiên.

  - **Quyết định 126 (18/11/2026): Nâng Cấp Tab Camera Heo Con Neo-Brutalist (Chú Heo Ngủ Trên Nóc, Nút Shutter Viền Kép & Thẻ Polaroid Retro):**
    - *Bối Cảnh & Bản Chất:* Tab Camera (Tab 2) là trái tim ghi chép của PigFly. Người dùng yêu cầu giữ nguyên 100% phần cứng thật `expo-camera` (chụp ảnh thật, quét mã VietQR offline, quét hóa đơn AI, EXIF sạch) nhưng nâng cấp toàn diện ngôn ngữ thị giác bám sát prototype `Camera_heo_con.html`: chú heo nằm ngủ trên nóc khung ngắm (`PiggyCameraRoof`), nút Shutter Neo-Brutalist viền kép đỏ-vàng-mực, Top bar pill "Hôm nay chi" và thẻ xem lại Polaroid Retro nghiêng -3 độ.
    - *Giải Pháp Kỹ Thuật Đã Thực Hiện:*
      1. **Chú Heo Ngủ Trên Nóc Khung Ngắm (`PiggyCameraRoof`):** Chú heo pixel art 24×20 nằm ngủ `sleep` trên nóc máy ảnh với chữ `Z z z` bay lơ lửng. Khi bấm Shutter, heo giật mình nhảy cẫng lên `happy` thả tim đỏ `#E0452B` bay lên.
      2. **Nút Shutter Neo-Brutalist Viền Kép:** Kích thước 84px, nền đỏ `#E0452B`, viền 4px mực `#2B2118`, viền kép vàng cám `#F4B93B` 5px + viền mực 8px, bóng cứng 10px, nhún 6px mượt mà với Haptic Heavy (`expo-haptics`).
      3. **Top Bar Neo-Brutalist:** Viên thuốc `[● Hôm nay chi: X đ]` đồng bộ theo `todaySpent`, nút Flash tròn viền 3px và nút mở Phòng Ảnh dẫn sang Tab 1.
      4. **Thẻ Polaroid Retro Sau Chụp (`PolaroidReviewCard`):** Khung ảnh Polaroid trắng tinh viền 3px mực nghiêng -3°, ảnh thật 1:1, bộ nút tăng giảm nhanh `[-5k]` / `[+5k]`, chạm vào số tiền mở bàn phím `MandCashierKeyboard`, chọn danh mục nhanh, nút `[Chụp lại]` & `[Lưu vào ví]`. Khi lưu thành công, hiển thị *"Heo đã treo ảnh lên tường 🖼️"* kèm nút *"Xem ở phòng ảnh"*.

  - **Quyết định 127 (18/11/2026): Tinh Chỉnh Tab Camera Heo Con v2 (In-Frame Review Co Gọn Khung 4:5, Shutter Voice 2-in-1, Zero-Border Floating Icons):**
    - *Bối Cảnh & Bản Chất:* Sau khi triển khai ban đầu, trải nghiệm trên thiết bị thực tế gặp các điểm nghẽn: (1) Thẻ Review sau chụp bị trôi tụt xuống dưới màn hình và bị thanh Bottom Tab Bar che lấp, trang chính tắt cuộn khiến người dùng không thể lướt lên/xuống; (2) Nút Shutter và Voice tách rời gây rối; (3) Các nút công cụ dưới có viền bo tròn xám đục nặng nề, chưa đạt độ tối giản pixel art.
    - *Giải Pháp Kỹ Thuật Đã Thực Hiện:*
      1. **In-Frame Review Co Gọn Vừa Khít 100% Trong Khung Ngắm 4:5 (`InFrameReviewOverlay`):** Toàn bộ giao diện review (ảnh chụp squircle, tag phân loại Chi/Thu, bộ đếm tiền to đậm tabular-nums với 2 nút `[-]` / `[+]` 5.000đ, chạm số tiền mở `MandCashierKeyboard`, ô nhập tên món, chip danh mục cuộn ngang, và cặp nút `[✕ Chụp lại]` & `[✓ Lưu vào ví]`) nằm trọn vẹn bên trong khung ngắm 4:5. Loại bỏ hoàn toàn lỗi tràn màn hình hay bị Bottom Tab Bar che khuất.
      2. **Nút Shutter 2-in-1 (Chụp 1-Chạm & Nhấn Giữ Voice):**
         - *1-chạm (Tap):* Chụp ảnh bình thường, kích hoạt chú heo trên nóc máy nhảy cẫng lên ăn mừng.
         - *Nhấn giữ (Hold):* Chụp ngay 1 khung hình camera (snapshot) làm nền + kích hoạt sóng âm Voice ghi âm giọng nói; khi người dùng thả tay ra, AI NLP (`voiceExpenseParser`) bóc tách số tiền, danh mục, nội dung và điền thẳng vào khung review kèm ảnh vừa chụp để người dùng kiểm tra và Lưu.
      3. **Thanh Công Cụ Dưới Chuẩn Tối Giản (Zero-Border Icons):**
         - Xóa sạch toàn bộ khối tròn nền xám bao quanh icon.
         - Nút Thư viện ảnh (`ImagePlus`) và Lật camera (`RotateCcw`) hiển thị dạng **Icon Vector nổi trần hoàn toàn** (`borderWidth: 0, backgroundColor: 'transparent'`), nét vẽ đậm `strokeWidth: 2.8`, màu trắng sáng/vàng cám nổi bật với shadow nhẹ.
         - Loại bỏ nút Mic riêng rẽ ở dưới vì đã tích hợp trọn vẹn vào nút Shutter trung tâm.

  - **Quyết định 128 (18/11/2026): Tái Cấu Trúc Toàn Diện Tab Camera v3 (Unified Fixed Frame, In-Out Balanced Controls, Re-skin Neo-Brutalist Keypad):**
    - *Bối Cảnh & Bản Chất:* Người dùng phản ánh 2 vấn đề lớn trên thiết bị thực tế: (1) Khung ảnh bị đẩy tụt xuống đáy, nhồi nhét tất cả chữ và nút đè lên mặt ảnh che khuất người/món đồ, cặp nút Lưu/Hủy vẫn bị Tab Bar che một nửa; (2) Khi chạm vào số tiền, bàn phím thu ngân `MandCashierKeyboard` mở lên tone màu hồng/trắng hiện đại lạc lõng so với phong cách Neo-Brutalist Pixel Art Kem/Mực của Heo Con.
    - *Giải Pháp Kỹ Thuật Đã Thực Hiện:*
      1. **Khung Máy Ảnh Thống Nhất Cố Định (Unified Fixed Frame):** Từ lúc ngắm chụp tới lúc review là duy nhất 1 khung hình cố định nằm cân đối ở trung tâm màn hình, không bị dịch chuyển hay tụt đáy. Chú heo trên nóc (`PiggyCameraRoof`) hiển thị xuyên suốt. Trong khung ảnh giữ sạch sẽ, chỉ có badge gạt [Chi | Thu] và nút lật camera ở gờ trên.
      2. **Khu Vực Thông Tin Nằm Ngay Dưới Khung Ảnh:**
         - Bộ số tiền to rõ với 2 nút `[-]` và `[+]` 5.000đ hai bên font Baloo 2 `tabular-nums`.
         - Ô nhập mô tả / tên món chi tiêu (viền 2px mực, nền kem).
         - Dải chip danh mục cuộn ngang (Ăn uống, Di chuyển, Mua sắm, v.v.).
      3. **Thanh Điều Khiển Dưới (Bottom Bar) Đặt Phía Trên Tab Bar An Toàn:**
         - Nằm phía trên Tab Bar với khoảng đệm an toàn `insets.bottom + 70`, 100% không bao giờ bị Tab Bar che.
         - Khi chưa chụp: Nút Thư viện ảnh + ShutterButton 2-in-1 (tap chụp / hold voice) + Lật camera.
         - Khi đã chụp: Cặp nút Neo-Brutalist `[✕ Chụp lại]` (nền kem viền 2.5px) và `[✓ Lưu vào ví]` (nền vàng cám viền 3px to rõ).
      4. **Re-skin Bàn Phím `MandCashierKeyboard` Sang Neo-Brutalist Pixel Art:**
         - Nền container Kem Sàn `#F6EEDC` viền Nâu Mực `#2B2118` 3px, phím số trắng sữa `#FFFBF1` viền 2px đổ bóng cứng 2px 0-blur, nút Xác nhận Vàng Cám `#F4B93B` viền 3px mực.

  - **Quyết định 129 (18/11/2026): Nâng Cấp Toàn Diện Tab Camera v4 (Bầu Trời Pixel Dreamy, Buông Tay Chụp Frame Cuối, Thanh Pill Mô Tả Sát Đáy Trong Khung & Khung Lịch Sử Polaroid Pixel Hoài Niệm):**
    - *Bối Cảnh & Bản Chất:* Người dùng cung cấp phản hồi thực tế kèm 4 ảnh chụp trên máy: (1) Voice đang không nhận ảnh đúng lúc: đè Shutter nói, khi buông tay hệ thống phải tự động chụp ngay frame ảnh cuối cùng từ camera đưa vào khung hình; (2) Màu sắc nền xám đen hiện tại u tối, cần chuyển sang tone màu Dreamy mộng mơ (Hồng pastel `#FCE3E8`, Xanh da trời `#D2E3F2`, Xanh mint `#DDEBD9`), phía trên có mây và ánh nắng pixel art, chú heo nằm khò sát sạt nóc khung ảnh, mở rộng chiều ngang khung camera; (3) Ô nhập mô tả nằm ngoài khung ảnh khi bấm gõ chữ sẽ bị bàn phím ảo của điện thoại che mất, cần chuyển thành dạng Thanh Pill Mini nổi sát đáy bên trong khung hình (cách đáy 8px); (4) Khung xem lại ảnh Locket khi trượt xuống đang bo tròn hiện đại nhẵn nhụi, cần chuyển sang phong cách Polaroid Pixel hoài niệm.
    - *Giải Pháp Kỹ Thuật Đã Thực Hiện:*
      1. **Bầu Trời Pixel Dreamy & Mây Nắng Pixel Art:**
         - Gradient nền chuyển sắc nhẹ nhàng: Xanh da trời `#D2E3F2` pha Hồng phấn `#FCE3E8` trên đỉnh, chân nền Xanh mint `#DDEBD9` cỏ vườn.
         - Tạo component `PixelSkySunCloud` với mặt trời pixel vàng ấm `#F4B93B` và các đám mây pixel art trắng bồng bềnh.
         - Kê sát sạt chú heo `PiggyCameraRoof` tiếp giáp trực tiếp nóc khung ảnh (`marginTop: -4`).
         - Mở rộng chiều ngang khung ngắm: `width: Math.min(SCREEN_WIDTH - 20, 360)`.
      2. **Thanh Pill Mini Nhập Mô Tả Nổi Sát Đáy Trong Khung Ngắm (Anti-Keyboard Overlap):**
         - Nằm nổi cách đáy khung ảnh 8px (`bottom: 8`), dạng viên thuốc pill 999px, nền kem viền 2px mực, bóng cứng 2px.
         - Do nằm ở nửa trên màn hình, khi bàn phím ảo điện thoại bật lên từ đáy (chiếm ~300px), ô nhập chữ hoàn toàn không bao giờ bị che lấp.
         - Cụm bên dưới khung ảnh siêu gọn: chỉ còn bộ đếm tiền và dải chip danh mục cuộn ngang.
      3. **Cơ Chế Snap-on-Release Voice:**
         - Đè Shutter nói voice: Camera vẫn live để ngắm.
         - Buông tay khỏi nút Shutter (`onVoiceEnd`): Lập tức gọi `takePictureAsync` chụp frame ảnh camera cuối cùng đưa vào khung hình, đồng thời AI NLP bóc tách điền số tiền, tên món và danh mục.
      4. **Thẻ Lịch Sử Locket Chuẩn Polaroid Pixel Hoài Niệm (`LocketMomentCard`):**
         - Khung ảnh Polaroid viền kem dày đáy kiểu ảnh rửa phim cổ điển, viền ngoài 2.5px Nâu Mực, bóng cứng 4px 0-blur.
         - Góc dán miếng băng keo washi pixel art, nhãn giá tiền dạng tem dán góc (Price Stamp) màu Vàng Cám font Baloo 2.

  - **Quyết định 130 (19/11/2026): Mở Rộng Tab 3 Thành Trung Tâm Pixel Hub Đa Năng (Chat, Game Heo Bay, Game Heo Bắn & Bản Đồ Chi Tiêu):**
    - *Bối Cảnh & Bản Chất:* Tab 3 trước đây chỉ gồm màn hình Chat (AI Coach Anh Minh & Squad). Để gia tăng trải nghiệm giải trí gamification và trực quan hóa chi tiêu theo không gian, toàn bộ source code đồ họa từ `prototype/Game_Heo_Bay.html` (chứa Game Heo Bay, Game Heo Bắn và Bản Đồ Chi Tiêu pixel) được tích hợp trực tiếp vào Tab 3.
    - *Giải Pháp Kỹ Thuật:*
      1. **Kiến Trúc Menu Thẻ Pixel Hub (Hub Dashboard):**
         - Màn hình chính của Tab 3 đóng vai trò Hub điều hướng với 4 thẻ lớn Neo-Brutalist sinh động:
           + Thẻ 1: 💬 **Trò Chuyện & Bạn Bè** (AI Coach Anh Minh & Squad Nuôi Heo).
           + Thẻ 2: 🪽 **Game Heo Bay** (Flappy Pig kiếm đồ ăn, thanh độ no, vỗ cánh qua 4 biomes).
           + Thẻ 3: 🎯 **Game Heo Bắn** (Angry Pig slingshot physics, phá vỡ khối gỗ/đá/kính, xếp hạng 3 sao).
           + Thẻ 4: 🗺️ **Bản Đồ Chi Tiêu** (Bản đồ pixel khu phố, các ghim quán ăn/cafe/chợ, heo đi dạo tới nơi tiêu).
         - Khi nhấn vào một thẻ, mở toàn màn hình phân hệ đó kèm thanh Header Neo-Brutalist có nút `[← Quay lại Hub]` 1-chạm mượt mà.
      2. **Engine WebView Canvas Siêu Mượt 60fps:**
         - Game Heo Bay, Game Heo Bắn và Bản Đồ Chi Tiêu được port 1:1 từ canvas JavaScript thuần trong `prototype/Game_Heo_Bay.html` thông qua `react-native-webview`.
         - Đảm bảo đồ họa pixel art 100% sắc nét (`image-rendering: pixelated`), chuẩn xác từng tọa độ logic, bảng màu palette và physics gốc mà không gây giật lag React Native render tree.
      3. **Liên Kết Bản Đồ Chi Tiêu Với `transactionStore` Thực Tế:**
         - Bản đồ tự động nạp các địa điểm quen thuộc mẫu (Phở Bát Đàn, Cà phê Giảng, Chợ Đồng Xuân...) kết hợp ánh xạ tự động các giao dịch thực tế từ `useTransactionStore` thành các ghim thực tế trên bản đồ pixel.
         - Tương tác chọn ghim, xem chi tiết lượt ghé / quán quen và bấm "Heo đi tới đây" để chú heo đi dạo tới địa điểm.
      4. **Bảo Tồn Nguyên Tắc Cốt Lõi:**
         - Zero điểm ảo FEP (quy về streak ngày và giữ tiền).
         - Zero-STK (không lưu số tài khoản trên map hay log).
         - 100% Offline-First và đồng nhất ngôn ngữ thiết kế Neo-Brutalist Heo Con (Kem Sàn `#F6EEDC`, Nâu Mực `#2B2118`, Hồng Heo `#F9B8C4`, Vàng Cám `#F4B93B`, viền 3px, bóng cứng 0-blur).

  - **Quyết định 131 (19/11/2026): Tái Thiết Kế Tab Camera Tối Giản Adidas Pixel Art Hội An (Nền Đen Tuyền Sâu, Viewfinder Chân Thực, Shutter Đèn Lồng Hội An & Thẻ Polaroid 1:1 Prototype):**
    - *Bối Cảnh & Bản Chất:* Thử nghiệm phong cách nền đen tuyền sâu `#0D0D0D` và cụm Shutter Hội An.

  - **Quyết định 132 (19/11/2026): Tinh Gọn Tab Camera Chuẩn 1:1 Prototype Ví Heo Con (Nền Kem #F6EEDC, Khung Rộng 4:3, Header Chi/Thu + Flash, 2 Nút [↺] / [✓] Thay Thế Shutter, Lịch Sử 1 Ảnh 1 Khung Hình):**
    - *Bối Cảnh & Nguyên Nhân:*
      - Người dùng thử nghiệm trên thiết bị thực tế và chốt luồng tương tác dứt khoát nhất: Nền Kem Sàn `#F6EEDC` ấm áp, khung ảnh cao ráo 4:3, bỏ ngày tháng trong khung, bỏ viền card đệm ô mô tả.
      - Header: Nút Bật/Tắt Flash + 2 nút to bản dàn đều `[ Chi ]` và `[ Thu ]`. Bỏ chuông, gallery, pill "Hôm nay chi".
      - Sau khi bấm Shutter chụp ảnh: Shutter được thay thế bằng **2 nút tròn to ngang hàng `[ ↺ ]` (Chụp lại) và `[ ✓ ]` (Lưu vào ví)**. Người dùng chỉnh số tiền/mô tả/danh mục rồi bấm `[ ✓ ]` để lưu hoặc bấm `[ ↺ ]` để chụp lại nếu xấu.
      - Tuyệt đối không có nút "Xem ở phòng ảnh".
      - Lịch sử ảnh cuộn xuống: **Một ảnh - một khung hình**, sắp xếp từ gần nhất về các giờ/ngày trước.

  - **Quyết định 133 (19/11/2026): Tối Ưu Tab Camera Locket 1:1 Vuông & Tối Giản Tức Thì (Zero-Latency Capture):**
    - *Bối Cảnh & Nguyên Nhân:* Người dùng thử nghiệm trên thiết bị di động thực tế và phản hồi chi tiết: (1) Nút Chi/Thu cần đụng sát trần như prototype; (2) Nút Flash bỏ viền bo hộp, chuyển vào góc trên bên trái bên trong khung camera; (3) Khung ngắm quá nhỏ, cần mở rộng sang tỷ lệ vuông 1:1 chuẩn Locket (348×348px), bỏ 4 góc vuông và chấm đỏ REC, giữ heo ngủ góc; (4) Ô mô tả nền đặc hiện đang che ảnh chụp, cần chuyển thành viên thuốc kính mờ tối trong suốt `rgba(0,0,0,0.42)` chữ trắng tinh sát đáy khung hình; (5) Cụm số tiền bỏ nhãn "SỐ TIỀN", đổi sang nền trơn không viền hộp; (6) Dải tag danh mục đổi từ lưới 2 hàng thành thanh trượt ngang 1 hàng có font chữ to 14px và padding thoáng; (7) Khắc phục hiện tượng trễ 1-2s khi chụp bằng cách gán `photo.uri` ngay lập tức (0ms transition delay), chuyển nén WebP sang chạy ngầm hoặc lúc Lưu; (8) Bỏ dòng chữ hướng dẫn "Chạm [✓] để lưu vào ví...".

  - **Quyết định 134 (19/11/2026): Hoàn Thiện Luồng Tiền Trước/Sau Chụp, Cute Toast Tự Tắt 1.8s & Lịch Sử 100vh 1 Ảnh 1 Khung Hình:**
    - *Bối Cảnh & Nguyên Nhân:* Người dùng phản hồi thực tế kèm 4 ảnh chụp: (1) Cho phép nhập tiền, tag danh mục, mô tả trước hoặc sau khi chụp (sửa lỗi chụp xong bị reset về 0đ); (2) Toast "Đã lưu khoảnh khắc" bị đơ cứng, cần tự tắt sau 1.8s và thiết kế lại dễ thương; (3) Lịch sử ảnh bị chia nửa hiển thị dở dang hai ảnh cùng lúc, cần chuẩn hóa mỗi ảnh chiếm trọn 1 màn hình 100vh snap paging mượt mà; (4) Thẻ lịch sử: Mô tả dạng pill kính mờ sát đáy bên trong khung ảnh, bên phải ngoài khung ảnh hiển thị tên danh mục tiếng Việt có dấu chuẩn (`Ăn uống`, `Gia đình & Cho mẹ`...) thay vì raw id thô (`an_uong`, `gia_dinh`).

  - **Quyết định 135 (19/11/2026): Khóa Tĩnh Khung Hình Chụp 0ms (Zero-Shift Freeze-Frame) & Ô Mô Tả Tự Co Giãn Kính Mỏng Nhẹ:**
    - *Bối Cảnh & Nguyên Nhân:* Người dùng phản hồi cảm giác khi chụp ảnh xong có một khung ảnh khác đè lên và chuyển động nhẹ trong 0.000001s, đồng thời ô mô tả bè ngang quá rộng che ảnh và nền quá tối.
    - *Giải Pháp Kỹ Thuật:*
      1. **Seamless Freeze-Frame:** Không unmount `CameraView` khi chụp; hiển thị ảnh chụp tĩnh tức thì qua `<ExpoImage>` phủ lên trên với `transition={0}`, `priority="high"` và `cachePolicy="memory-disk"`.
      2. **Không Swap URI khi Nén Ngầm:** Giữ nguyên URI ảnh chụp cục bộ cho bản xem trước on-screen, lưu URI ảnh WebP nén vào `optimizedPhotoRef` để dùng khi bấm Lưu, triệt tiêu 100% hiện tượng flash/reload ảnh trên màn hình.
      3. **Auto-Expanding Glassy Pill:** Ô mô tả căn giữa đáy ảnh (`alignSelf: 'center'`), ban đầu ngắn gọn (~110px), nền kính trong suốt mỏng nhẹ `rgba(0, 0, 0, 0.22)` viền trắng mờ mảnh `rgba(255, 255, 255, 0.32)`, tự động mở rộng đều sang 2 bên khi người dùng gõ chữ (tối đa 310px).

  - **Quyết định 136 (19/11/2026): Tự Động Mirror Selfie Chống Lật Cam & Đồng Bộ Tone Nền Hồng Pastel Theo Theme (`tokens.bg`):**
    - *Bối Cảnh & Nguyên Nhân:* Khi chụp selfie bằng Camera trước (`facing === 'front'`), khung ngắm hiển thị phản chiếu như gương nhưng ảnh chụp ra bị đảo chiều (không lật) làm lệch mặt/chữ; đồng thời Tab Camera gán cứng màu kem `#F6EEDC` không đồng bộ khi người dùng dùng Theme Hồng Heo.
    - *Giải Pháp Kỹ Thuật:*
      1. **Tự động Mirror Flip khi Selfie:** Khi `cameraFacing === 'front'`, tự động lật ngang ảnh qua `manipulateAsync(uri, [{ flip: FlipType.Horizontal }])` ngay khi chụp, đảm bảo ảnh chụp và ảnh lưu khớp 100% góc nhìn gương lúc ngắm.
      2. **Đồng Bộ Nền Động Theo Theme:** Bỏ toàn bộ mã cứng `#F6EEDC` ở `cameraScreenSection`, `historySnapPage`, `verticalScroll`, thay bằng `tokens.bg` từ `useTheme()`. Khi chọn Theme Hồng Heo, toàn bộ Tab Camera tự khoác lên tone hồng dâu sữa pastel dịu mắt (`#FFF5F7`) đồng bộ với các tab khác.

  - **Quyết định 137 (19/11/2026): Loại Bỏ Hoàn Toàn Hàm Lật File Ảnh & Khôi Phục Tốc Độ 0ms Tức Thì Chuẩn Native iPhone:**
    - *Bối Cảnh & Nguyên Nhân:* Hàm xử lý file `manipulateAsync` lật ảnh gây nghẽn I/O đọc-ghi đĩa từ 300ms–1s khiến màn hình Preview và các nút chọn giá/danh mục bị trễ khựng. Trên iOS (iPhone), việc ảnh chụp camera trước xuất ra unmirrored là hành vi chuẩn mực của Apple (người dùng tự quyết định trong Settings máy).
    - *Giải Pháp Kỹ Thuật:* Gỡ bỏ hoàn toàn hàm xử lý file lật ảnh. Gán trực tiếp `photo.uri` ngay lập tức 0ms, khôi phục tốc độ chụp tức thì 0.0001s, không có bất kỳ khoảng chờ nào.

  - **Quyết định 138 (20/11/2026): Chữ Mô Tả IG Story Trong Suốt (Transparent & Draggable) & Triệt Tiêu Tag Mô Tả Tự Sinh (Zero Auto-Tag):**
    - *Bối Cảnh & Nguyên Nhân:* Người dùng phản hồi thực tế kèm ảnh chụp mẫu Instagram Story: (1) Khi không nhập mô tả, hệ thống tự động gán tên/ID danh mục (`thu_cung`, `an_uong`) làm mô tả và hiển thị đè lên ảnh; (2) Yêu cầu nếu không nhập mô tả thì ảnh chụp và thẻ ảnh lịch sử phải trơn sạch 100%, không hiện bất kỳ tag hay chữ nào; (3) Kiểu chữ mô tả chuyển sang phong cách Instagram / Facebook Story: nền hoàn toàn trong suốt không viền hộp, chữ trắng tinh khôi viền đổ bóng tối mềm mại (`textShadowColor: 'rgba(0,0,0,0.75)'`, `textShadowRadius: 3`) sắc nét trên mọi nền ảnh; (4) Cho phép người dùng chạm ngón tay kéo di chuyển chữ mô tả tự do (Draggable via `PanResponder`) bất kỳ đâu trong khung ảnh vuông 348×348px; vị trí ban đầu ở 1/3 dưới ảnh; lưu lại tọa độ phần trăm `desc_position` để hiển thị chuẩn xác trên thẻ Polaroid Lịch sử.
    - *Giải Pháp Kỹ Thuật:*
      1. **Triệt tiêu Bug Tự Gán Danh Mục:** Xóa bỏ triệt để đoạn mã `if (!finalDesc) finalDesc = effectiveCategory;` trong `app/(main)/index.tsx`. Khi `!inFrameDescription.trim()`, `finalDesc = ''`.
      2. **Ẩn Thẻ Mô Tả Khi Trống:** `LocketMomentCard.tsx` kiểm tra nếu `!item.description || item.description.trim() === ''` thì return `null` (ảnh trơn sạch 100%).
      3. **IG Story Typography:** Chữ trắng `#FFFBF1` (hoặc `#FFFFFF`), `fontSize: 16`, `fontWeight: '800'`, `textShadowColor: 'rgba(0, 0, 0, 0.75)'`, `textShadowOffset: { width: 0, height: 1.5 }`, `textShadowRadius: 3`, `backgroundColor: 'transparent'`, `borderWidth: 0`.
      4. **PanResponder Draggable Text:** Tích hợp `PanResponder` và `Animated.ValueXY` cho phép kéo thả chữ mượt mà, giới hạn clamp giữ chữ trong khung 348×348px; lưu `desc_position: { x: number, y: number }` (tọa độ phần trăm 0..100) vào `Transaction`.

  - **Quyết định 139 (20/11/2026): Phân Tách Trạng Thái Kéo Thả Text IG Story (Dual-Phase Gesture) & Zero Placeholder:**
    - *Bối Cảnh & Nguyên Nhân:* Người dùng phản hồi khi điền chữ hoặc chụp rồi điền chữ vẫn không thể kéo di chuyển được text; đồng thời yêu cầu bỏ hoàn toàn dòng chữ hướng dẫn "Chạm để viết chữ..." (để người dùng tự chạm theo thói quen). Nguyên nhân kỹ thuật là component native `TextInput` nuốt các sự kiện cảm ứng (touches/pan), ngăn cản `PanResponder` của view cha nhận diện thao tác kéo.
    - *Giải Pháp Kỹ Thuật:*
      1. **Kiến Trúc Cảm Ứng 2 Pha (Dual-Phase):** Phân tách bằng state `isEditingStoryText`. Khi không gõ chữ (`isEditingStoryText === false`), component hiển thị dưới dạng `<Text>` thuần túy, trao 100% quyền xử lý cho `PanResponder` với `onStartShouldSetPanResponder: () => true`, giúp thao tác kéo ngón tay di chuyển chữ mượt mà tức thì 0ms.
      2. **Phân Biệt Thông Minh Tap vs Drag:** Trong `onPanResponderRelease`, nếu độ dịch chuyển `|dx| < 5 && |dy| < 5` (chạm nhẹ), kích hoạt `isEditingStoryText = true` và `focus()` vào `storyInputRef` để mở bàn phím gõ chữ; nếu `|dx| >= 5 || |dy| >= 5`, thực hiện kéo di chuyển vị trí.
      3. **Zero Placeholder (Vùng Chạm Tàng Hình):** Bỏ 100% chữ "Chạm để viết chữ...". Khi rỗng, khung ảnh trơn sạch hoàn toàn; tại vị trí 1/3 dưới ảnh bố trí vùng chạm tàng hình `camStoryInvisibleTouchArea` ($220 \times 44$px) để người dùng chạm vào là bàn phím mở lên tự nhiên.

  - **Quyết định 140 (20/11/2026): Khắc Phục Lỗi Render WebView (Game Heo Bay, Game Heo Bắn, Bản Đồ Chi Tiêu) & Re-skin Toàn Bộ Subtab Chat Sang Neo-Brutalist Pixel Art:**
    - *Bối Cảnh & Nguyên Nhân:* Khi người dùng bấm "Khám phá ngay" vào Game Heo Bay, Game Heo Bắn hoặc Bản Đồ Chi Tiêu ở Tab 3, màn hình bị trắng tinh không hiển thị. Nguyên nhân kỹ thuật do:
      1. WKWebView sandbox trên iOS chặn chạy JS/canvas khi `source={{ html }}` thiếu thuộc tính `baseUrl: ''`.
      2. Kích thước WebView bị co cụm về 0x0 px (layout collapse) do dùng `flex: 1` bên trong layout scroll mà không cung cấp kích thước pixel tuyệt đối tường minh (`width`, `height`).
      3. Đối tượng `source` không được memoize gây vòng lặp render/reloading.
      4. Tên font `Baloo2` không hợp lệ (font nạp hệ thống là `Baloo2_800ExtraBold`) và viền `borderStyle: 'dashed'` đơn lẻ gây lỗi render trên Android.
      5. Đồng thời Subtab Chat (AI Coach Anh Minh & Squad) vẫn mang thiết kế cũ bo tròn mềm, chưa theo chuẩn Style Heo Con (viền 3px mực, bóng cứng 0-blur, kem sàn `#F6EEDC`, vàng cám `#F4B93B`).
    - *Giải Pháp Kỹ Thuật:*
      1. **Explicit Dimensions & WKWebView Config:** Gán kích thước tuyệt đối tường minh `width: SCREEN_WIDTH, height: gameHeight, flex: 0` cho cả `containerStyle` và `style` của `SafeWebView`; bọc `memoizedSource = useMemo(() => ({ html: htmlContent, baseUrl: '' }), [htmlContent])`; cấu hình `originWhitelist={['*']}`, `javaScriptEnabled={true}`, `domStorageEnabled={true}`, `scrollEnabled={false}`, `automaticallyAdjustContentInsets={false}`.
      2. **Chuẩn Hóa Font & Border Hub Dashboard:** Sửa font chữ thành `Baloo2_800ExtraBold`, `Nunito_700Bold`/`Nunito_800ExtraBold`, đổi border dashed sang solid chuẩn mực.
      3. **Re-skin Subtab Chat Đồng Bộ Neo-Brutalist Heo Con:**
         - Header segment: Track viền 3px mực `#2B2118`, nền `#FFFBF1`, bóng cứng 3px 0-blur; tab active nền Vàng Cám `#F4B93B` viền 2px mực.
         - Bong bóng tin nhắn AI Coach: Nền kem `#FFFBF1` viền 3px mực, bóng cứng 3px 0-blur, avatar Heo Con pixel 36px.
         - Bong bóng người dùng: Nền Vàng Cám `#F4B93B` viền 3px mực, bóng cứng 3px 0-blur, chữ Nâu Mực `#2B2118`.
         - Thanh nhập chat `ChatInputBar`: Nền kem `#F6EEDC`, viền trên 2.5px mực, ô gõ `#FFFBF1` viền 2.5px mực, nút đính kèm & nút Gửi Vàng Cám viền 2.5px mực nổi khối.
         - Chip gợi ý, thẻ MiniMetric và thẻ xác nhận ghi sổ: Viền 2.5px mực, bóng cứng 2px, nút hành động Vàng Cám.

  - **Quyết định 141 (20/11/2026): Tái Thiết Kế Thanh Bottom Bar Chuẩn Prototype 20/11 (Nền Hồng Phấn Nhạt Heo #FCECEF, Bố Cục Icon + Chữ & Active Đa Sắc) & Chuẩn Hóa Tab 3 Thành "Giải Trí":**
    - *Bối Cảnh & Nguyên Nhân:* Cập nhật theo phiên bản prototype ngày 20/11 (`prototype/Ví Heo Con-20-11.html`). Thanh Bottom Navigation Bar trước đây chỉ hiển thị icon đơn lẻ trên nền kem và tab 3 còn mang tên "Nuôi Heo" / "Chat". Người dùng yêu cầu thanh bottom bar đồng bộ chuẩn 1:1 theo prototype với tone nền Hồng phấn nhạt heo (`#FCECEF`), hiển thị cả Icon và Chữ nhãn cho 5 tabs, đồng thời chính thức chuyển đổi Tab 3 thành Tab "Giải trí" (Tích hợp Chat, Game Heo Bay, Game Heo Bắn và Bản Đồ Chi Tiêu).
    - *Giải Pháp Kỹ Thuật:*
      1. **Tone Nền Hồng Phấn Nhạt:** Nền `barContainer` mang màu Hồng phấn dâu sữa nhạt `#FCECEF`, viền 3px mực `#2B2118`, bóng cứng 4px 0-blur (`shadowColor: '#2B2118', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4`). Chiều cao chuẩn 60px.
      2. **Bố Cục 5 Tabs (Icon + Chữ Nhãn Xếp Dọc):** Mỗi tab có cấu trúc `flexDirection: 'column'`, `gap: 2`, gồm Icon vector nổi trần 20px và Chữ nhãn 11px font `Nunito` 800 (`tabular-nums` nếu cần):
         - Tab 0: Icon `Trees` + Chữ "Vườn"
         - Tab 1: Icon `Home` + Chữ "Nhà"
         - Tab 2: Icon `Camera` + Chữ "Chụp"
         - Tab 3: Icon `Gamepad2` + Chữ "Giải trí"
         - Tab 4: Icon `User` + Chữ "Hồ sơ"
      3. **Hiệu Ứng Active Đa Sắc Theo Từng Tab:**
         - Tab Chụp: Nền Đỏ Cam `#E0452B`, Icon và Chữ chuyển sang Trắng `#FFFFFF`.
         - Tab Giải trí: Nền Vàng Cám `#F4B93B`, Icon và Chữ chuyển sang Nâu Mực `#2B2118`.
         - Các tab khác (Vườn, Nhà, Hồ sơ): Nền Nâu Mực `#2B2118`, Icon và Chữ chuyển sang Kem Trắng `#FFFBF1`.
         - Khi không active: Icon và Chữ mang màu Nâu Mực `#2B2118` (opacity 0.72).
      4. **Chuẩn Hóa Tab 3 Thành "Giải Trí":** Tab 3 chính thức đóng vai trò Trung Tâm Giải Trí & Khám Phá Heo Con (PIGFLY HUB), mở màn hình Dashboard 4 thẻ lớn chuyển tiếp mượt mà vào Chat AI Coach / Squad, Game Heo Bay, Game Heo Bắn và Bản Đồ Chi Tiêu. Nút quay lại đổi thành "‹ Giải trí".

  - **Quyết định 142 (20/11/2026): Nâng Cấp Toàn Diện Tab Giải Trí Chuẩn HTML Prototype 20/11 (PIGFLY HUB, Endless Waves Heo Bắn, Dynamic Obstacles Heo Bay, Retention Loop & Mini-Pet System):**
    - *Bối Cảnh & Nguyên Nhân:* Người dùng yêu cầu Tab Giải trí phải bám sát 1:1 theo bản prototype mới nhất ngày 20/11 (`prototype/Ví Heo Con-20-11.html`). Đồng thời, các mini-game phải có độ khó cao, có chiều sâu cơ chế và gắn kết mật thiết với kỷ luật tài chính hàng ngày để tạo sự kích thích, níu chân người dùng quay lại app trong thời gian dài mà không vi phạm quy tắc Zero-FEP (Quyết định 112 & 115).
    - *Giải Pháp Kỹ Thuật:*
      1. **PIGFLY HUB (`v-fun`):**
         - Header badge neo-pill: `● PIGFLY HUB` + Streak `X ngày`.
         - Mascot banner: Avatar pixel 16×16 vẽ trực tiếp khuôn mặt Heo Con cử động mắt/mũi + lời chào *"Trung Tâm Heo Con — Chào [Tên]! Khám phá giải trí & bản đồ khu phố"*.
         - Status Chips: Vé chơi `🎫 X vé` + Thức ăn `🌽 X thức ăn`.
         - 4 Thẻ Trung Tâm chuẩn Neo-Brutalist (viền 3px mực, bóng cứng 4px 0-blur): Trò Chuyện & Bạn Bè (AI Coach/Squad), Game Heo Bay (Flappy Pig), Game Heo Bắn (Angry Pig), Bản Đồ Chi Tiêu (GPS Pixel & Real Map).
      2. **Game Heo Bắn (Angry Pig) — Endless Waves & Gió Biến Thiên:**
         - Cơ chế Endless Waves (Màn vô tận): Thuật toán Procedural Generation tự động sinh tháp, tăng tỉ lệ đá kiên cố HP 110, kính dễ vỡ, lồng sắt và chim lính bảo vệ.
         - Vector gió biến thiên (Dynamic Wind): Gió đổi hướng và cường độ ngẫu nhiên qua các đợt gió, buộc người chơi tính toán quỹ đạo bù trừ.
         - Cứu Heo Con trong lồng sắt: Bắn vỡ lồng giải cứu heo con (`ap.free`), tích lũy mở khóa Heo Cánh (`wing` lao nhanh x1.6) và Heo Bom Cám (`coin` kích nổ diện rộng).
         - Liên kết ngân sách: Tiêu $< 50\%$ hạn mức tặng $+1$ lượt bắn; chi lố $> 100\%$ phạt $-1$ lượt; heo đói giảm lực bắn.
      3. **Game Heo Bay (Flappy Pig) — Chướng Ngại Vật Động:**
         - Gió lốc (Whirlwinds) đẩy trôi bất ngờ; Chim đối thủ bay ngược chiều; Thời tiết mưa bão làm giảm tầm nhìn.
         - Thanh đói (Hunger Bar) tiêu hao năng lượng đòi hỏi người chơi ăn thức ăn giữa các khe chướng ngại vật; tích lũy thức ăn đem về cho Heo cưng.
         - Thanh chuyển nhanh `[Heo bay] [Heo bắn]` trên đỉnh màn hình cho phép chuyển đổi 1 chạm tức thì giữa 2 trò chơi.
      4. **Vòng Lặp Giữ Chân Người Dùng & Chăm Sóc Heo Cưng (Retention Loop):**
         - Tặng 3 vé chơi/ngày khi mở app + 1 vé mỗi khi ghi chép/chụp ảnh chi tiêu ở Tab Chụp.
         - Thẻ "Chăm sóc Heo cưng": Thanh no/đói (0-100%) quyết định trạng thái thể lực của Heo trong game.

  - **Quyết định 143 (20/11/2026): Tái Hiện 100% Đồ Họa Prototype Cho 2 Game Pixel Art & Chuyển Đổi Khung Chat Sang Neo-Brutalist:**
    - *Bối Cảnh & Nguyên Nhân:* Người dùng phản ánh 2 mini-game (Heo Bay & Heo Bắn) bị lỗi hiển thị và chưa đạt được độ đẹp tinh xảo như bản HTML prototype (mất cảnh parallax núi/rừng/đất, mất chu kỳ bầu trời ngày/đêm 8 pha `skyAt`, mất texture vân gỗ/đá/kính/lồng nan sắt có heo con buồn bã, mất chim non mỏ cam `drawBirdy`, mất 14 chấm quỹ đạo ngắm bắn). Đồng thời, khung chat AI Coach & Squad vẫn mang phong cách bo tròn hiện đại mềm mại, chưa chuyển hẳn sang phong cách Neo-Brutalist Pixel Art.
    - *Giải Pháp Kỹ Thuật:*
      1. **Tài Liệu Đặc Tả Chi Tiết Màn Chơi (`docs/screens/heocon/10-GAMES-SPEC.md`):** Đặc tả toàn diện bảng màu `PAL` và `C`, hằng số vật lý (`GRAV=560`, `FLAP=-172`, `AGR=230`, `AK=8.5`), công thức độ khó màn chơi lũy tiến, và cấu trúc popup Chơi lại / Màn tiếp theo.
      2. **Khung Chat Neo-Brutalist Pixel Art (`ChatView.tsx`, `CoachMessageBubble.tsx`, `UserMessageBubble.tsx`, `ChatInputBar.tsx`):** Port 1:1 theo prototype với khung `.chatlog` hộp thẻ viền 3px mực `#2B2118`, avatar pixel vuông 30×30 `PixelPigAvatar`, bong bóng brutalist góc cạnh (Coach: kem `#F6EEDC` viền 3px mực; User: hồng heo `#F9B8C4` viền 3px mực), dải `quick chips` dạng viên thuốc nổi bật, ô nhập liệu `.chatin` 44px viền 3px mực cùng nút `[Gửi]` Vàng Cám.
      3. **Game Heo Bắn (Angry Pig — `PigShooterGameView.tsx`) Port 1:1 Đồ Họa Prototype:**
         - Khôi phục Parallax 3 tầng `FAR[0]`, `MID[0]`, `GROUND[0]`, bầu trời ngày/đêm `skyAt(.3)` pha trộn 8 dải màu.
         - Ná gỗ 3D với 14 chấm quỹ đạo ngắm bắn parabol xen kẽ `#FFFBF1` và `#2B2118`, dây cao su co giãn 2 phía.
         - Texture khối chi tiết: Gỗ vân sọc, Đá chấm nứt, Kính specular shine, Lồng sắt nan xám có heo con buồn bã bên trong.
         - Sprite chim lính `drawBirdy`: Mỏ cam, băng đô 3 màu (`an`: đỏ, `di`: xanh, `mua`: hồng), chỏm lông trên đầu, nhấp nhô sin.
         - Khói nổ `apPuff`, chữ số bay đổ bóng `stamp`, rung màn hình, heo con giải cứu `drawFreed` chạy thoát.
         - Tích hợp Endless Waves và Gió biến thiên trên nền engine gốc chuẩn xác.
      4. **Game Heo Bay (Flappy Pig — `PigFlightGameView.tsx`) Port 1:1 Đồ Họa Prototype:**
         - Khôi phục Parallax 4 Biomes (Vườn nhà, Ruộng lúa, Phố nhà, Ao sen), chu kỳ bầu trời 8 pha `skyAt(u)` mượt mà kèm sao đêm `STARS`.
         - Sprite chú heo `hp` 24×20 vỗ cánh đập lên xuống chân thực, chớp mắt, vẫy đuôi, cười tươi khi ăn thức ăn.
         - Texture cột chướng ngại vật: Tre trúc, cọc gỗ, trụ đèn, đài sen.
         - Đồ ăn pixel: Cà rốt, bắp vàng, táo đỏ, dưa hấu xanh; thanh HUD 10 ô segmented `.hbar`.
         - Tốc độ tăng dần $\min(110, 58 + \text{score} \times 1.8)$, khoảng hở cột co hẹp $\max(48, 64 - \lfloor \text{score}/5 \rfloor)$, đói nhanh hơn $3.2\%$/s.

  - **Quyết định 144 (20/11/2026): Khắc Phục Trải Nghiệm Khung Chat Pixel Art & Chế Độ Fullscreen 2 Mini-Game (Heo Bay & Heo Bắn):**
    - *Bối Cảnh & Vấn Đề Thực Tế:* Người dùng chụp ảnh thực tế cho thấy (1) Khung Chat vẫn bị rơi vào giao diện hồng bo tròn hiện đại do thiết bị lưu mode 'pink'; (2) 2 Game Heo Bay và Heo Bắn bị thanh Bottom Tab Bar che mất hàng nút điều khiển chân trang ("Vỗ cánh", "Tạm dừng", "Đổi trời", "Đạn còn: 5"); (3) Heo Bay bị chết ngay khi mở màn hình do sự kiện chạm sớm; (4) Dàn đạn Heo Bắn bị xếp đè lên nhau sát ná.
    - *Giải Pháp Kỹ Thuật:*
      1. **Cố Định 100% Neo-Brutalist Pixel Art Cho Tab Giải Trí:** Độc lập với Theme cá nhân, toàn bộ Tab Giải trí (PIGFLY HUB, Chat Coach, 2 Game, Bản Đồ) luôn hiển thị chuẩn pixel art nền kem `#F6EEDC`, khung thẻ `.chatlog` viền 3px mực `#2B2118`, avatar vuông $36\times 36$px, bong bóng Coach kem `#FFFBF1` viền 2.5px mực, bong bóng User Vàng Cám `#F4B93B` viền 3px mực, loại bỏ các subtab bo tròn hiện đại.
      2. **Chế Độ Toàn Màn Hình Khi Chơi Game (Fullscreen Game Mode):** Tự động ẩn Floating Bottom Tab Bar khi người dùng vào chơi Heo Bay hoặc Heo Bắn (thông qua callback `onToggleTabBar(false)`). Toàn bộ chiều cao màn hình được giải phóng cho canvas game và các nút bấm chân trang, không bao giờ bị che khuất. Nút `‹ Quay lại Hub` luôn cố định ở đỉnh để thoát game và khôi phục tab bar.
      3. **Sửa Lỗi Heo Bay Chết Sớm & Tối Ưu Canvas Responsive:** Heo duy trì trạng thái lơ lửng an toàn (`ready` hover), chỉ kích hoạt rơi tự do khi người chơi chủ động bấm `[Vỗ cánh]`. Giữ nguyên độ khó gốc theo yêu cầu người dùng (`FLAP = -172`, `GRAV = 560`).
      4. **Căn Chỉnh Dàn Đạn Heo Bắn 1:1 Prototype:** Dàn đạn heo chờ xếp tại $x = 10 + i \times 15, y = AG - 8$ ở góc trái dưới mặt đất (chuẩn line 2480 prototype), bệ ná gỗ 3D và 14 chấm ngắm parabol rõ nét, thẻ thông tin đạn hiển thị trọn vẹn.

  - **Quyết định 145 (20/11/2026): Đồng Bộ Toàn Diện Tab Giải Trí Chuẩn 100% Masterprompts (3 Thẻ Hub, Game Arcade Zero-Scroll & Bản Đồ Dual-Engine):**
    - *Bối Cảnh & Vấn Đề Thực Tế:* Đối chiếu ảnh chụp người dùng với `prototype/Ví Heo Con-20-11.html` và `prototype/MASTER-PROMPTS.md` (Plan 12, 13, 14): (1) Canvas Game Heo Bay bị co ép méo tỉ lệ từ $176\times 224$ portrait thành landscape bởi `max-height: 275px`, màu trời bị xám mù, hạt pixel bị kéo giãn mờ; (2) Màn hình game bị nhồi nhét quá nhiều thẻ dài (5 thẻ thức ăn) gây tràn màn hình, cuộn trang vướng víu, popup "Bay lại" bị lẹm không thấy đường bấm; (3) Hub Giải Trí phân tán nhiều thẻ rời rạc; (4) Bản đồ chi tiêu chưa có cơ chế Dual-Engine [Pixel] / [Bản đồ thật].
    - *Giải Pháp Kỹ Thuật:*
      1. **Tái Thiết Kế Hub Thành 3 Thẻ Trọng Tâm Cốt Lõi (Plan 14):**
         - *Thẻ 1: Trò Chuyện & Bạn Bè* (`AI COACH & SQUAD`): Tích hợp Chat Heo-Coach Anh Minh (phản biện 3 câu hỏi chi tiêu) và Squad Hội Bạn Thân.
         - *Thẻ 2: Game Vui Heo Con* (`FLAPPY & ANGRY PIG · 60FPS`): Tích hợp 2 mini-game Heo Bay & Heo Bắn, có thanh gạt chuyển game tức thì, quản lý vé 🎫 và cám.
         - *Thẻ 3: Bản Đồ Chi Tiêu* (`GPS PIXEL & BẢN ĐỒ THẬT`): Quản lý vị trí ghim chi tiêu.
      2. **Chuẩn Hóa Màn Hình Game Arcade Chuyên Biệt (Zero-Scroll & 100% Sắc Nét Pixel):**
         - Game Heo Bay khôi phục tỉ lệ Portrait $176\times 224$ nguyên bản, loại bỏ hoàn toàn `max-height: 275px` gây méo ảnh. Canvas scale linh hoạt theo chiều cao viewport với `image-rendering: pixelated; crisp-edges;`.
         - Bầu trời ban ngày mặc định rực rỡ nắng vàng (`#8FD0F2` tới `#58B6EE`), nút "CHẠM ĐỂ VỖ CÁNH" Vàng Cám `#F4B93B` nổi bồng bềnh giữa canvas.
         - Loại bỏ các card phụ dài dòng bên dưới canvas, biến màn chơi thành 1 màn hình Arcade duy nhất không cần cuộn trang; nút "Vỗ cánh" to rõ và popup "Bay lại" nằm ngay giữa màn hình trong tầm ngón tay cái.
      3. **Bản Đồ Chi Tiêu Dual-Engine (Plan 12):** Nút chuyển [Pixel] (khu phố retro $192\times 200$) và [Bản đồ thật] (MapLibre OpenFreeMap 0 đồng) hoạt động trơn tru ngoại tuyến lẫn trực tuyến.

  - **Quyết định 146 (21/11/2026): Đồng Bộ Mascot Pixel Art Toàn Diện, Hub Siêu Gọn (Compact Neo-Card), Icon Pixel 16×16 Chuẩn Prototype & Sửa Lỗi Kéo Ná Angry Pig:**
    - *Bối Cảnh & Vấn Đề Thực Tế:* Người dùng phản hồi qua 7 ảnh chụp thực tế:
      1. Mascot chú heo pixel art ở Tab Giải Trí chưa đồng bộ với Tab Vườn và Tab Nhà; màn hình Squad Locket vẫn dùng hình ảnh 3D cartoon cũ (`PigBoMascot`).
      2. Hub Giải Trí phình to, chữ rườm rà (5 tầng text mỗi card), khoảng cách thẻ quá lớn khiến người dùng phải cuộn dài.
      3. Vùng icon ở Hub và Header thanh Segment Chat đang dùng icon vector tròn mỏng, chưa phải icon Pixel Art.
      4. Màn hình game bị mờ trên điện thoại Retina/OLED, màu trời Flappy Pig bị xỉn tối (`u: .2` dusk/grey), vỗ cánh có độ trễ.
      5. Game Angry Pig (Heo Bắn) không thể trượt kéo ná ném heo trên điện thoại do sự kiện pointer bị WebView chặn/nuốt và bán kính chạm quá nhỏ.
    - *Giải Pháp Kỹ Thuật:*
      1. **Đồng Bộ Mascot Pixel Art 1:1 (`PixelPigAvatar`):** Thay thế toàn bộ `PigBoMascot` ở `SquadLocketView` và mọi màn con bằng `PixelPigAvatar` (pixel art 16×16 chuẩn palette từ prototype).
      2. **Hub Siêu Gọn Bố Cục Ngang (Compact Neo-Cards):**
         - Thiết kế dạng hàng (Row layout): Hộp Icon Pixel `hubic` 46×46px viền 2.5px mực bên trái trên nền pastel đặc (`#BFDDF2`, `#FBD3DC`, `#D4ECC6`).
         - Cột thông tin bên phải: Tag pill siêu nhỏ + Tiêu đề in đậm + 1 dòng trạng thái ngắn gọn súc tích. Lược bỏ hoàn toàn đoạn văn mô tả 3 dòng.
         - Giảm padding thẻ còn 10px, margin còn 8px, cả 3 thẻ nằm gọn gàng 100% trong 1 màn hình không cần cuộn.
      3. **Bộ Icon Pixel Art 16×16 Chuẩn Prototype (`PixelIcons.tsx`):**
         - Port 1:1 ma trận pixel 16×16 từ prototype `Ví Heo Con-20-11.html` (`ICONS` và `drawFace`): `PixelIconChat`, `PixelIconPigCoach`, `PixelIconSquad`, `PixelIconGamepad`, `PixelIconMapPin`, `PixelIconSlingshot`.
         - Áp dụng vào: Header thanh Segment Chat (`PigCoach` và `Hội Bạn Thân`), 3 thẻ Hub Giải Trí.
      4. **Khắc Phục Cảm Ứng Ná Bắn Angry Pig (`PigShooterGameView.tsx`):**
         - Bổ sung song song `touchstart`, `touchmove`, `touchend`, `touchcancel` với `{ passive: false }` và `e.preventDefault()`.
         - Gọi `apC.setPointerCapture` khi có pointer event.
         - Mở rộng vùng chạm ná lên bán kính 40px (hoặc toàn bộ vùng `x < 85 && y > 45 && y < 135`) để ngón tay chạm và kéo ná mượt mà 100% trên thiết bị thật.
      5. **Khắc Phục Canvas Mờ & Bầu Trời Sáng Rực Rỡ (`PigFlightGameView.tsx` & `PigShooterGameView.tsx`):**
         - Áp dụng Integer DPR Scaling (3x): Bộ đệm canvas nhân 3 (`width = FW * 3, height = FH * 3`), `ctx.scale(3, 3)` và `imageSmoothingEnabled = false`, kết hợp CSS `image-rendering: -webkit-optimize-contrast; pixelated; crisp-edges;` đảm bảo từng hạt pixel sắc cạnh tuyệt đối trên màn Retina/OLED.
         - Giữ mặc định `fly.u = 0.35` (dải xanh thiên thanh ban ngày rực rỡ `#58B6EE` / `#C3E9F8`).
         - Vỗ cánh Flappy Pig bắt sự kiện `pointerdown` / `touchstart` kích hoạt ngay ở 0ms, triệt tiêu hoàn toàn độ trễ.

  - **Quyết định 147 (21/11/2026): Khôi Phục 100% Đồ Họa Pixel Art Prototype & Khóa Trời Xanh Ban Ngày Cho 2 Mini-Game:**
    - *Bối Cảnh & Vấn Đề Thực Tế:* Người dùng đối chiếu `prototype/Ví Heo Con-20-11.html` (dòng 740 & 858–884) và phát hiện (1) Sprite heo trong 2 game chưa đúng 1:1 (thiếu 4 chân bước đi, mõm nhô, tai vểnh, chuông cổ, đuôi cong); (2) Bầu trời Heo Bay vẫn tự chuyển ngày/đêm và tự đổi thời tiết gây tối xỉn/mù mịt; (3) Canvas bị mờ do thiếu Integer DPR; (4) Vỗ cánh và kéo ná cảm ứng còn trễ trên thiết bị di động thật.
    - *Giải Pháp Kỹ Thuật:*
      1. **Port 1:1 Bảng Màu `PAL` & `drawPigSprite` 24×20:** Sao chép nguyên văn từ prototype: `PAL = { o:#4B2B21, p:#F9B8C4, s:#EE90A6, n:#F08DA4, h:#FFE3E8, k:#2B2118, g:#F4B93B, G:#B97A14, w:#FFFFFF }` cùng 4 chân trước/sau phân tầng màu `PAL.p`/`PAL.s`, mõm nhô `PAL.n`, tai vểnh, highlight lưng `PAL.h`, mắt có tròng trắng `PAL.w`, giọt nước mắt buồn `#7EC8F0`, chuông cổ `PAL.g`/`PAL.G` và đuôi cong theo `o.tail`. Cấm tự chế hình dáng/tọa độ/bảng màu.
      2. **Khóa Trời Xanh Ban Ngày (`flyReset` + `flyUpdate`):** `flyReset()` đặt cố định `u: 0.35`, `weather: 'clear'`, `rain: 0`, `wind: 0`. `flyUpdate(dt)` **không còn dòng `fly.u = (fly.u + dt/...) % 1`** và **không tự đổi thời tiết theo `wnext`**; chỉ nút `[Đổi trời]` mới đổi pha/thời tiết. Khi `rain === 0` và `nightness === 0`, `drawSky` không phủ bất kỳ lớp xám nào.
      3. **Canvas Integer DPR 3× & 0ms Touch:** Backing store `FW*3 × FH*3`, `ctx.scale(3, 3)`, `imageSmoothingEnabled = false`, CSS `image-rendering: pixelated; crisp-edges`. `pointerdown` + `touchstart` (`{ passive: false }`) trên `#flyWrap`/`#flyBtn` gọi `flyTap()` tức thì; ná Angry Pig dùng `apPt(e)` đọc `touches[0]`, mở rộng vùng chạm 40px, `setPointerCapture`.
      4. **Tiêu Chí Nghiệm Thu:** `npx tsc --noEmit` 0 lỗi; `node run-all-tests.js` 86/86 pass; heo có 4 chân/mõm/tai/chuông; trời xanh nắng vàng không tối; vỗ cánh 0ms; kéo ná mượt trên cảm ứng di động.
    - *Tài Liệu Đồng Bộ:* `docs/screens/heocon/10-GAMES-SPEC.md` (§3.3 khóa trời xanh, §3.6 DPR & cảm ứng), `src/components/chat/PigFlightGameView.tsx`, `src/components/chat/PigShooterGameView.tsx`.

  - **Quyết định 148 (21/11/2026): Khắc Phục Triệt Để Lỗi Màn Hình Vàng Khè (Blank WebView Crash) Cho Game & Bản Đồ Chi Tiêu:**
    - *Bối Cảnh & Vấn Đề Thực Tế:* Sau khi Deepseek cập nhật code, người dùng mở Game Heo Con hoặc Bản Đồ Chi Tiêu trên iPhone (iOS / Expo Go) thì toàn bộ khu vực WebView biến thành màu kem trơn `#F6EEDC` (không có bất kỳ phần tử HTML hay canvas nào).
    - *Nguyên Nhân Gốc Rễ:*
      1. Xung đột Layout: `containerStyle` và `style` gán `flex: 0` kết hợp kích thước pixel cứng khiến Yoga Layout Engine trên iOS tính toán frame của WKWebView thành 0x0 hoặc bị ngắt kết nối (detach) khỏi view tree khi màn hình cha re-render.
      2. WebKit Sandbox Rejection: `baseUrl: ''` (chuỗi rỗng) khiến `[NSURL URLWithString:@""]` trên iOS WKWebView trả về invalid URL, WebKit âm thầm hủy bỏ (silent abort) tiến trình nạp HTML `loadHTMLString`.
      3. Re-render loop: `onLayout` trong `PiggySpendMapView.tsx` liên tục kích hoạt `setContentHeight` làm WebView re-render lặp vô tận.
    - *Giải Pháp Kỹ Thuật:*
      1. Loại bỏ hoàn toàn `baseUrl: ''`: Sử dụng `source={memoizedSource}` với `html: htmlContent` để WebKit dùng `baseURL: nil` chuẩn iOS.
      2. Chuẩn hóa Layout Flexbox: Loại bỏ `flex: 0` và kích thước cứng; dùng `webViewContainer` và `webView` có `{ flex: 1, width: '100%', backgroundColor: '#F6EEDC' }`.
      3. Loại bỏ `onLayout` gây giật re-render trong `PiggySpendMapView.tsx`.
      4. Tạo tài liệu `docs/masterprompts/MASTERPROMPT_DEEPSEEK_FIX_BLANK_WEBVIEW.md` đóng gói toàn bộ chẩn đoán và drop-in code gửi Deepseek Agent.
      5. **Cầu Nối Bắt Lỗi JS (`window.onerror`) & Dọn State Chết:** Mỗi HTML nhúng bridge `window.onerror` bắn `postMessage({ type: 'JS_ERROR', message, line, col })`; React Native log `console.warn` để lỗi không chết âm thầm. Đồng thời xóa `useWindowDimensions`, `useState`, `contentHeight`/`setContentHeight` không còn dùng ở cả 3 view; siết assertion Test 80/84/85 để cấm `baseUrl: ''` và yêu cầu `flex: 1` + bridge.
    - *Tài Liệu Đồng Bộ:* `docs/masterprompts/MASTERPROMPT_DEEPSEEK_FIX_BLANK_WEBVIEW.md`, `docs/screens/heocon/10-GAMES-SPEC.md` (§5), `src/components/chat/PigFlightGameView.tsx`, `src/components/chat/PigShooterGameView.tsx`, `src/components/chat/PiggySpendMapView.tsx`, `run-all-tests.js`.


  - **Quyết định 149 & 151 (21/11/2026): Tinh Chỉnh Sắc Nét Pixel Art WebKit, CSS Modal [hidden] & Ná Bắn 1:1:**
    - Khắc phục triệt để mờ pixel trên Canvas bằng bộ đệm chuẩn 176×224 và 224×140 không nhân DPR; bổ sung CSS `[hidden] { display: none !important; }`; hoàn thiện cơ chế ná bắn Angry Pig 1:1.

  - **Quyết định 152 (21/11/2026): Tab Hồ Sơ 1:1 Prototype (Pixel Desk Banner, Split Bar 10 Ô & SegmentBar10):**
    - Tái tạo bàn làm việc pixel, Split Bar 10 ô 3 màu và thanh tiến độ phân đoạn `SegmentBar10`.

  - **Quyết định 153 (21/11/2026): Tab Giải Trí & Hồ Sơ 1:1 Prototype 21/11 & Masterprompts Plan 14:**
    - Đồng bộ avatar pixel 16×16, nút Back thống nhất `‹ Quay lại Hub` và liên kết Tab Hồ Sơ với Game Arcade.

  - **Quyết định 154 (21/11/2026): Tab Hồ Sơ Neo-Brutalist Perfection:**
    - Áp dụng triệt để viền 3px mực `#2B2118`, bóng cứng 0-blur 4px, font `Baloo2_800ExtraBold` và `Nunito`.

  - **Quyết định 155 (21/11/2026): Banner Chú Heo Pixel Mascot 24×20 & Cửa Sổ Bitexco Theo Giờ Thực Tế:**
    - Cửa sổ Bitexco thay đổi cảnh bầu trời theo giờ thực tế (Bình minh, Trưa, Hoàng hôn, Đêm) với tháp Bitexco 16×40.

  - **Quyết định 156 (21/11/2026): Đồng Bộ UI/UX Tab Hồ Sơ, Heo Đất Trên Bàn, Dải 2 Ô & Global Skills:**
    - Chỉnh sửa tọa độ heo đất nằm khít mặt bàn $y=54$, tổ chức dải 2 ô chỉ số cân đối.

  - **Quyết định 157 (21/11/2026): Bỏ Hoàn Toàn Thoại Khi Chạm Cửa Sổ Bitexco Tab Hồ Sơ:**
    - Loại bỏ bóng thoại che khuất cửa sổ, giữ nguyên phản hồi xúc giác nhẹ (Haptics).

  - **Quyết định 158 (21/11/2026): Nâng Cấp Toàn Diện Subtab & Modal Tab Hồ Sơ Sang Neo-Brutalist Heo Con:**
    - Nâng cấp `BudgetSettingsCard`, `GoalSectionCard`, `CategorySettingsCard` và các modal sang viền 3px, bóng cứng 0-blur.

  - **Quyết định 159 (22/11/2026): Khắc Phục Triệt Để Lỗi Màn Hình Xanh Camera Sau Trên iOS:**
    - Bổ sung `key={cameraFacing}`, mount delay 200ms `isPagerSettled`, cô lập torch và cố định barcode settings.

  - **Quyết định 160 (22/11/2026): Hệ Thống Theme 2.0 PigFly — Loại Bỏ Xanh Mint, Chuẩn Hóa Hệ 2 Theme "Heo Con Vàng Nâu" & "Hồng Heo Pastel":**
    - Loại bỏ hoàn toàn xanh mint, quy hoạch hệ 2 Theme chính thức kết hợp gradient pastel nhẹ.

  - **Quyết định 161 (22/11/2026): Đồng Bộ Triệt Để 100% Hệ Thống Theme 2.0 Trên Toàn Bộ 5 Tab & Thanh Floating Tab Bar:**
    - Đồng bộ màu nền, viền và bóng đổ trên cả 5 Tab và thanh Floating Tab Bar.

  - **Quyết định 162 (22/11/2026): Khắc Phục Triệt Để 3 Vấn Đề Đồng Bộ Theme (Tab Nhà, Tab PigFly Hub & Typography Tab Hồ Sơ):**
    - Nền Tab Nhà thích ứng linh hoạt theo mode; Tab PigFly Hub dùng nền hồng nhưng giữ điểm nhấn Vàng Cám `#F4B93B`; Tab Hồ Sơ áp dụng vĩnh viễn font `Baloo2_800ExtraBold` + `Nunito` và Neo-Brutalist cho cả 2 Theme. Tách `CameraView` khỏi `Pressable` chống kẹt bounds layout trên iOS.

  - **Quyết định 163 (22/11/2026): Tối Giản Toàn Diện Tab Hồ Sơ & Chuẩn Hóa Subtab Neo-Pills Pixel Art:**
    - Xóa bỏ dòng phụ "Heo chủ nhân" trong `ProfileIdentityCard.tsx`.
    - Xóa bỏ nút "Trung Tâm Heo Con ›" khỏi `ProfileQuickJumpBar.tsx`.
    - Nâng cấp 4 Subtab pills trong `ProfileQuickJumpBar.tsx` sang chuẩn Neo-Pills Pixel Art có icon vector pixel (`Coins`, `Target`, `FolderTree`, `Palette`), viền 2px, bóng cứng 2px.
    - Xóa bỏ dòng chú thích công thức tính toán `(Thu nhập − Cố định − Tích lũy)...` trong `BudgetSettingsCard.tsx`.
    - Bỏ chữ "đang hoạt động" trong `CategorySettingsCard.tsx`, rút gọn thành `{activeExpense} mục Chi · {activeIncome} mục Thu`.
    - Đổi tiêu đề `MÀU CỦA APP` thành `GIAO DIỆN` trong `ThemeSettingsCard.tsx`.

  - **Quyết định 164 (22/11/2026): Nâng Cấp Pixel Art Đổi Tên & Tinh Giản Mục Giao Diện Tab Hồ Sơ:**
    - *Bối Cảnh & Phản Hồi Người Dùng:* (1) Mục Giao diện còn dòng mô tả phụ dài dòng "Hệ 2 giao diện PigFly..." và tên 2 theme "Heo Con Vàng Nâu", "Hồng Heo Pastel" quá dài; (2) Phần Đổi tên (Change Name) ở khối đầu tiên dưới Banner chưa được nâng cấp sang phong cách Pixel Art đồng bộ với Goals và Spend; (3) Modal đổi tên `NameEditModal` vẫn giữ phong cách phẳng cũ viền 1px mờ.
    - *Giải Pháp Kỹ Thuật:*
      1. **Mục Giao Diện (`ThemeSettingsCard.tsx`):**
         - Xóa bỏ hoàn toàn thẻ mô tả phụ đề `Hệ 2 giao diện PigFly:...`.
         - Rút gọn nhãn của 2 theme thành siêu ngắn gọn, tối giản: **`Kem`** (`heocon`) và **`Hồng`** (`pink`).
      2. **Nút Bút Chì Đổi Tên (`ProfileIdentityCard.tsx`):**
         - Nâng cấp nút bút chì góc trên phải thành Neo-Badge tròn 30×30px, bo tròn 15px, viền 2px mực (`tokens.border`), nền pastel (`#FFF4CC` khi Kem, `#FCE7F3` khi Hồng), icon `Edit2` 14px nổi bật đồng bộ 1:1 với nút `[+]` ở Goals.
      3. **Modal Đổi Biệt Danh (`NameEditModal.tsx`):**
         - Thay da đổi thịt 100% sang chuẩn **Neo-Brutalist Pixel Art**: Card bo 22px viền đặc 3px mực, bóng cứng 0-blur 4px, tiêu đề `Baloo2_800ExtraBold`, ô nhập liệu viền 2.5px mực font `Nunito` 700, nút Hủy viền 2px và nút Lưu Vàng Cám `#F4B93B` viền 2.5px mực font `Baloo2_800ExtraBold`.
    - *Tài Liệu Đồng Bộ:* `docs/DECISIONS.md`, `docs/screens/heocon/11-PROFILE-SETTINGS.md`, `src/components/profile/ThemeSettingsCard.tsx`, `src/components/profile/ProfileIdentityCard.tsx`, `src/components/profile/NameEditModal.tsx`, `run-all-tests.js`.

  - **Quyết định 165 (22/11/2026): Tối Ưu Hóa & Đồng Bộ Toàn Diện Tab Hồ Sơ (Person) Và Màn Cài Đặt (Setting) Chuẩn Neo-Brutalist PigFly v4.5:**
    - *Bối Cảnh & Quyết Định Thiết Kế:* Rà soát toàn bộ Dataflow, Frontend, Backend Stores (`authStore`, `budgetStore`, `transactionStore`, `categoryStore`) và CSDL Supabase. Người dùng quyết định: (1) Tập trung quản lý Giao diện về Cài Đặt, loại bỏ thẻ Giao diện tĩnh ở cuối Tab Hồ Sơ; (2) Khi chạm pill `[ 🎨 Giao diện ]` trên thanh Quick Jump, lập tức chuyển hướng sang Cài Đặt; (3) Nâng cấp toàn diện `SettingsView` sang chuẩn 100% Neo-Brutalist Pixel Art (viền đặc 3px mực, bóng cứng 0-blur 4px, font Baloo 2 + Nunito, nút Back Neo-Badge tròn 36×36px, Universal Bottom Sheet bo 28px viền 3px mực, footer PigFly v4.5).
    - *Giải Pháp Kỹ Thuật:*
      1. **Tab Hồ Sơ (`ProfileView.tsx`):**
         - Loại bỏ `<ThemeSettingsCard />` ở đáy ScrollView.
         - Xử lý `handleJumpToSection('theme')`: Gọi `router.push('/(main)/settings')` để dẫn người dùng mượt mà sang Cài Đặt.
      2. **Tab Cài Đặt (`SettingsView.tsx`):**
         - Nâng cấp Nút Back [←] thành Neo-Badge tròn 36×36px viền 2px mực nền pastel.
         - Cập nhật tiêu đề màn hình và tiêu đề Sheet sang `Baloo2_800ExtraBold`, các dòng cài đặt sang `Nunito` 700.
         - Toàn bộ Grouped Cards bo 22px viền đặc 3px mực (`#2B2118` / `#3B0713`), bóng đổ cứng 4px 0-blur.
         - Nhãn tóm tắt theme hiển thị chuẩn `'Kem'` / `'Hồng'`.
         - Universal Bottom Sheet: Bo trên 28px viền đặc 3px mực, nút đóng `[X]` Neo-Badge 30×30px, nút `Xong` bo 16px viền 2.5px mực nền Vàng Cám `#F4B93B` (hoặc `#F43F5E`) font `Baloo2_800ExtraBold`.
         - Footer: Cập nhật nhận diện `PigFly v4.5 (Build 54) • Heo Con Neo-Brutalist`.
    - *Tài Liệu Đồng Bộ:* `docs/DECISIONS.md`, `docs/screens/heocon/11-PROFILE-SETTINGS.md`, `src/components/views/ProfileView.tsx`, `src/components/views/SettingsView.tsx`, `run-all-tests.js`.

  - **Quyết định 166 (22/11/2026): Nâng Cấp Toàn Diện Tab Giải Trí (ChillGame Tab) Chuẩn Prototype Ngày 22 & MASTER-PROMPTS.md:**
    - *Bối Cảnh & Phản Hồi Người Dùng:* (1) Tab Giải trí còn các từ kỹ thuật khô cứng như "HUB", "FPS60", "60FPS", "Trung tâm"; (2) Cần cập nhật banner động anime đầu trang chuẩn ngày 22 (hoàng hôn Sài Gòn, máy bay Vietnam Airlines, skyline Chợ Bến Thành, Nhà thờ Đức Bà, Bitexco, Landmark 81, Dinh Độc Lập, heo chạy xe máy đỏ đội mũ vàng và 14 hạt lấp lánh khi chạm); (3) Tích hợp trò chơi thứ 3 `VietNamCrossRoadwithPig` (Heo Qua Đường Sài Gòn 2.5D); (4) Tối giản hóa bố cục thành 2 nhóm thẻ tinh gọn [Kết nối & Địa điểm] và [Trò chơi Heo Con]; (5) Gắn kết gamification loop: Chi tiêu đúng hạn mức tặng Vé chơi (`gameTickets`) $\rightarrow$ Tiêu vé chơi 3 game $\rightarrow$ Nhặt cám/bánh mì thưởng `pigFood` $\rightarrow$ Cho Heo ăn (`feedPig`) tăng độ no bụng (`pigHunger`).
    - *Giải Pháp Kỹ Thuật:*
      1. **Bổ Sung Icon Pixel:** Thêm `PixelIconCrossRoad` (16×16 pixel) vào `src/components/pixel/PixelIcons.tsx`.
      2. **Banner Anime Sài Gòn Ngày 22 (`EntertainmentBannerWebView.tsx`):** Canvas 192×88, 8 dải dither caro 1px, 2 máy bay Vietnam Airlines, 5 địa danh Sài Gòn, đèn beacon nhấp nháy, xe máy đỏ và heo đội mũ bảo hiểm vàng, chạm heo nhảy tung 14 hạt lấp lánh.
      3. **Trò Chơi Heo Qua Đường (`PigCrossRoadGameView.tsx`):** Canvas 192×256 góc nhìn 2.5D, 4 ải địa danh, lách xe máy, giơ tay xin đường làm ô tô phanh lại, liên kết vé chơi và thưởng cám nuôi heo.
      4. **Bố Cục 2 Nhóm Thẻ Tinh Gọn (`PixelHubDashboard.tsx`):** Loại bỏ triệt để chữ "HUB", "FPS60", "Trung tâm". Nhóm 1 [Trò Chuyện AI & Bạn Bè, Bản Đồ Chi Tiêu]; Nhóm 2 [Heo Bay, Heo Bắn, Heo Qua Đường].
      5. **Gamification Store (`gamificationStore.ts`):** Quản lý `crossRoadStars`, `crossRoadMaxLevel`, vé chơi và cám nuôi heo.
    - *Tài Liệu Đồng Bộ:* `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `docs/screens/heocon/10-GAMES-SPEC.md`, `src/components/pixel/PixelIcons.tsx`, `src/components/chat/EntertainmentBannerWebView.tsx`, `src/components/chat/PigCrossRoadGameView.tsx`, `src/components/chat/PixelHubDashboard.tsx`, `src/components/views/ChatView.tsx`, `src/store/gamificationStore.ts`, `run-all-tests.js`.

  - **Quyết định 167 (23/11/2026): Tối Giản Hóa Tab Giải Trí Thành 2 Khung Siêu Gọn (2 Cột Kết Nối + 3 Cột Game), Sửa Lỗi Pixel Banner & Khắc Phục Triệt Để Game Heo Qua Đường + Nâng Cấp Cảnh Thiên Nhiên Việt Nam Cho 3 Game:**
    - *Bối Cảnh & Phản Hồi Người Dùng:* (1) Dashboard Tab Giải Trí cần gọn gàng hơn để vừa khít màn hình: gộp Chat & Bản Đồ vào 1 khung 2 cột, gộp 3 game (Heo Bay, Heo Bắn, Heo Qua Đường) vào 1 khung 1 hàng 3 cột; (2) Banner Giải Trí (`EntertainmentBannerWebView.tsx`) bị lỗi sai lệch pixel ở máy bay Vietnam Airlines và chú heo lái xe máy so với prototype; (3) Game Heo Qua Đường (`PigCrossRoadGameView.tsx`) không thao tác được như prototype (do chiều cao WebView vượt khung `scrollEnabled={false}` đẩy D-pad ra ngoài màn hình và xung đột sự kiện touch/pointer); (4) Cả 3 game cần đồ họa pixel art mang hơi thở cảnh thiên nhiên & đời sống Việt Nam chân thực (tre xanh, ao sen, núi đá vôi, ruộng bậc thang, đàn cò).
    - *Giải Pháp Kỹ Thuật:*
      1. **Dashboard 2 Khung Siêu Gọn (`PixelHubDashboard.tsx`):**
         - Khung 1 (`KẾT NỐI & ĐỊA ĐIỂM`): 1 Neo-Card duy nhất chia 2 cột ngang: `Trò chuyện` (AI & Bạn bè) và `Bản đồ` (Bản đồ chi tiêu).
         - Khung 2 (`TRÒ CHƠI HEO CON`): 1 Neo-Card duy nhất chia 1 hàng 3 cột đều: `Heo Bay` | `Heo Bắn` | `Qua Đường` (Icon Pixel + Tên ngắn + Kỷ lục/Sao, bỏ mô tả dài).
      2. **Sửa Lỗi Pixel Banner (`EntertainmentBannerWebView.tsx`):**
         - Port 1:1 hàm `drawPigSprite(c, opts)` ($24\times 20$) từ `prototype/Ví Heo Con ngày 22.html`, kết hợp `fbPlane` (có viền mực `#2B2118`, cánh, cửa sổ, đuôi `#0B5F8A`, hoa sen `#F4B93B`) và `fbRider` (bánh xe nan xoay, mũ bảo hiểm vàng kính xanh `#8EC9E8`, xe máy bạn ngược chiều).
      3. **Khắc Phục Triệt Để Game Heo Qua Đường (`PigCrossRoadGameView.tsx` & `ChatView.tsx`):**
         - Dùng layout `100vh` Flexbox (`display: flex; flex-direction: column;`) với `.scene` có `flex: 1; min-height: 0;` để canvas $192\times 256$ tự co vừa khít khoảng trống còn lại, đảm bảo D-pad (`#crPad`) và nút `Giơ tay` (`#crHand`) luôn hiển thị 100% không bị cắt mất.
         - Tách riêng sự kiện chạm cho D-pad (`pointerdown`/`pointerup`/`pointercancel` trên từng nút `[data-d]`) và lắng nghe 0ms (`touchstart` + `click` với `e.stopPropagation()`) cho `#crHand` & modal `[data-cr]`.
         - Bổ sung nút đổi `10 cám = 1 vé` (`BUY_TICKET`) khi hết vé chơi.
      4. **Nâng Cấp Cảnh Thiên Nhiên Việt Nam Cho 3 Game (`PigFlightGameView.tsx`, `PigShooterGameView.tsx`, `PigCrossRoadGameView.tsx`):**
         - Heo Bay: Bổ sung khóm tre nhiều đốt, ao sen hồng lá xanh, núi đá vôi mờ xa, ruộng bậc thang vàng óng, đàn cò trắng, phố cổ đèn lồng.
         - Heo Bắn: Nâng cấp nền `drawBgAP` thành đồng quê Việt Nam với núi đá vôi Ninh Bình nhiều lớp, lũy tre xanh hai bên, đồng lúa và đàn cò trắng bay ngang.
    - *Tài Liệu Đồng Bộ:* `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `docs/screens/heocon/10-GAMES-SPEC.md`, `src/components/chat/EntertainmentBannerWebView.tsx`, `src/components/chat/PixelHubDashboard.tsx`, `src/components/chat/PigCrossRoadGameView.tsx`, `src/components/chat/PigFlightGameView.tsx`, `src/components/chat/PigShooterGameView.tsx`, `src/components/views/ChatView.tsx`, `src/store/gamificationStore.ts`, `run-all-tests.js`.

  - **Quyết định 168 (23/11/2026): Kiểm Toán Toàn Diện Tab Hub (Giải Trí), Đồng Bộ Kinh Tế Vé/Cám 3 Game, Re-Skin Hội Bạn Thân & Luồng Dữ Liệu 5 Tab Chuẩn LocketApp:**
    - *Bối Cảnh & Phản Hồi Người Dùng:* (1) Rà soát toàn bộ các khung (sections), thanh trạng thái (bars), thẻ (boxes) của Tab Hub để đảm bảo hoàn thiện frontend & backend; (2) Chu trình kinh tế vé và cám phải đồng bộ 1:1 trên cả 3 game Pixel (`Heo Bay`, `Heo Bắn`, `Heo Qua Đường`) thay vì chỉ có ở Heo Qua Đường; (3) Màn hình Hội Bạn Thân (`SquadLocketView`) cần được Re-skin toàn diện sang phong cách Neo-Brutalist Heo Con và loại bỏ nút back kép lặp lại khi nhúng trong `ChatView`; (4) Luồng dữ liệu 2 chiều phản hồi tức thì giữa 5 Tab của ứng dụng phải hoạt động mượt mà như LocketApp trong Production (Ghi chi tiêu $\to$ Thưởng 1 vé $\to$ Tăng ghim quán trên Bản đồ $\to$ Tăng độ đông xe Sài Gòn $\to$ Nuôi heo $\to$ Cập nhật Pixel Garden).
    - *Giải Pháp Kỹ Thuật:*
      1. **Đồng Bộ Kinh Tế Vé/Cám Trên Cả 3 Game Pixel:**
         - `PigFlightGameView.tsx`: Thêm thanh `.gbar` chứa `🎫 X vé` + nút `10 cám = 1 vé`. Khi bấm cất cánh bay (`flyFlap` lúc `ready`), kiểm tra và trừ 1 vé (`USE_TICKET`). Khi hết vé (`tickets <= 0`), ngăn bay và hiện toast `"Hết vé chơi hôm nay!"`. Trong modal kết thúc (`flyShowOver`), thêm nút đổi `10 cám = 1 vé` (`BUY_TICKET`).
         - `PigShooterGameView.tsx`: Thêm thanh `.gbar` chứa `🎫 X vé` + nút `10 cám = 1 vé`. Khi kéo ná bắn phát đầu tiên, kiểm tra và trừ 1 vé (`USE_TICKET`). Khi hết vé, ngăn kéo ná và hiện toast `"Hết vé chơi hôm nay!"`. Trong modal kết thúc (`apFinish`), thêm nút đổi `10 cám = 1 vé` (`BUY_TICKET`).
         - `ChatView.tsx`: Truyền `onUseTicket={useGameTicket}` và `onBuyTicket={buyTicketWithFood}` vào cả `<PigFlightGameView />`, `<PigShooterGameView />` và `<PigCrossRoadGameView />`.
      2. **Re-Skin Neo-Brutalist Cho Hội Bạn Thân (`SquadLocketView.tsx`):**
         - Loại bỏ nút back kép `‹ Giải trí` khi nhúng trong `ChatView` (chỉ hiển thị khi chạy độc lập).
         - Áp dụng triệt để Neo-Brutalist Heo Con: Viền 3px mực in `#2B2118`, bóng cứng 0-blur góc 45° (`shadowOffset: { width: 0, height: 3 }`), góc bo 20px, nền kem sáng `#FFFBF1`.
         - Typography: Tiêu đề dùng `Baloo2_800ExtraBold`, số tiền dùng `fontVariant: ['tabular-nums']`, nội dung dùng `Nunito_700Bold`.
         - Locket Feed: Khung ảnh 1:1 vuông chuẩn Locket viền 3px, badge số tiền pill nền mực chữ vàng cám.
      3. **Luồng Dữ Liệu 2 Chiều Phản Hồi Tức Thì 5 Tab:**
         - Thưởng vé: `addTransaction` và `confirmPendingTransaction` tự động gọi `useGamificationStore.getState().addGameTickets(1)`.
         - Độ khó giao thông: `PigCrossRoadGameView` nhận tỷ lệ chi tiêu thời gian thực qua `cr.pct = todaySpent / todayBudget`.
         - Ghim bản đồ: `PiggySpendMapView` ánh xạ trực tiếp các giao dịch `CONFIRMED` gần nhất từ `useTransactionStore` thành các ghim quán quen.
         - Nuôi heo: Dùng cám kiếm được từ game để cho heo ăn (`feedPig`), tăng độ no (`pigHunger`) và cập nhật trạng thái heo trong Pixel Garden (Tab 0) và Dashboard (Tab 3).
    - *Tài Liệu Đồng Bộ:* `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `docs/screens/heocon/10-GAMES-SPEC.md`, `src/components/chat/PigFlightGameView.tsx`, `src/components/chat/PigShooterGameView.tsx`, `src/components/chat/SquadLocketView.tsx`, `src/components/views/ChatView.tsx`, `run-all-tests.js`.

  - **Quyết định 169 (23/11/2026): Tối Giản Tab Hub, Nút Back Icon-Only, Mở Rộng Khung 3 Game, Triệt Tiêu Nút Thừa & Kiến Trúc Keep-Alive Chống Lag 0ms:**
    - *Bối Cảnh & Phản Hồi Người Dùng:* (1) Nút Back chứa chuỗi chữ dài thừa thãi (`‹ Trung tâm Heo Con`, `Quay lại`, `‹ Giải trí`) gây chật chội màn hình; (2) Khung canvas của cả 3 game bị bóp nghẹt quá nhỏ bởi quá nhiều nút tính năng ảo và thẻ chữ giải thích dài dòng (`Vỗ cánh`, `Tạm dừng`, `Đổi trời`, `Độ no` 10 ô ở Heo Bay; hộp văn bản mô tả ở Heo Bắn; modal tutorial che kín màn hình ở Heo Qua Đường); (3) Khi người dùng bấm chuyển đổi qua lại giữa 3 game thì bị giật lag và chớp màn hình do cơ chế unmount/remount liên tục của native WKWebView.
    - *Giải Pháp Kỹ Thuật:*
      1. **Nút Back Icon-Only Chuẩn Neo-Brutalist:** Loại bỏ toàn bộ text chữ dài ở thanh header của cả 5 màn hình (`PigFlightGameView`, `PigShooterGameView`, `PigCrossRoadGameView`, `PiggySpendMapView`, `ChatView`, `SquadLocketView`), thay bằng nút tròn 38×38px viền 2.5px `#2B2118`, nền kem `#FFFBF1` chứa icon `ArrowLeft` nổi trần duy nhất.
      2. **Mở Rộng Khung Canvas 3 Game Tối Đa (Large Game Frames):**
         - Heo Bay: Bỏ `.card.flyhud` (độ no), bỏ hàng card `.flystats`, bỏ cụm 3 nút `.flyctl` (`[Vỗ cánh] [Tạm dừng] [Đổi trời]`). Mở rộng `.flywrap` lên 100% chiều rộng (max 380px) và chiều cao tối đa. Người chơi chạm trực tiếp màn hình để bay.
         - Heo Bắn: Bỏ hộp thoại chữ dài bên dưới canvas. Tăng chiều rộng `.apwrap` lên 100% và chiều cao lên 260px; ná bắn to rõ và dễ kéo hơn.
         - Heo Qua Đường: Bỏ hoàn toàn modal tutorial dài dòng ở trạng thái `cr.st === 'ready'`. Bỏ đoạn text `.privacy` ở chân trang. Mở rộng `.scene` chiếm trọn không gian, D-pad và nút Giơ tay công thái học ngay dưới canvas.
      3. **Kiến Trúc Giữ Ấm Arcade Multi-Slot (Keep-Alive Anti-Lag 0ms):**
         - Trong `ChatView.tsx`, khi người dùng vào chế độ chơi game bất kỳ (`activeSubView === 'fly' || 'shooter' || 'cross'`), cả 3 Game WebViews được nạp sẵn trong cùng 1 container với `{ position: 'absolute', width: '100%', height: '100%' }`.
         - Slot game đang chơi nhận `{ opacity: 1, zIndex: 10, pointerEvents: 'auto' }`. Hai slot còn lại nhận `{ opacity: 0, zIndex: -1, pointerEvents: 'none' }`.
         - Tuân thủ tuyệt đối Rule 4 (Fabric iOS): Giữ nguyên kích thước thực tế, không dùng `flex: 0` hay `display: none` tránh lỗi `CGRectZero`.
         - Chuyển đổi giữa 3 game tức thì 0ms, không flash, không giật lag. Khi bấm nút `←` về lại Hub chính, cả 3 game unmount đồng thời để giải phóng bộ nhớ.
    - *Tài Liệu Đồng Bộ:* `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `docs/screens/heocon/10-GAMES-SPEC.md`, `src/components/views/ChatView.tsx`, `src/components/chat/PigFlightGameView.tsx`, `src/components/chat/PigShooterGameView.tsx`, `src/components/chat/PigCrossRoadGameView.tsx`, `src/components/chat/PiggySpendMapView.tsx`, `src/components/chat/SquadLocketView.tsx`, `run-all-tests.js`.
- **Quyết định 170 (2026-11-23):** **Chuẩn Hóa Khung Game Pixel Arcade Việt Nam (356px), Sửa Dứt Điểm Lỗi Touch Heo Bay, Single-Active WebView Engine Chống Lag 100% & Bổ Sung Visual Pixel Art Góc:**
    - *Vấn Đề:* (1) Khối lệnh lặp thừa `});` ở dòng 1204-1207 trong `PigFlightGameView.tsx` gây `SyntaxError: Unexpected token ')'` khiến script WebView ngừng chạy và không nhận sự kiện chạm vỗ cánh (Cannot touch to play Fly). (2) Chạy song song 3 WKWebView với 3 vòng lặp 60fps `requestAnimationFrame` cùng lúc gây quá tải CPU/GPU và cảnh báo lag warning trên di động. (3) Khung game 3 trò chơi chưa đồng nhất kích thước chuẩn và thiếu điểm nhấn đồ họa pixel art trang trí góc khung.
    - *Giải Pháp:*
      1. **Sửa dứt điểm lỗi chạm Heo Bay:** Xóa bỏ hoàn toàn khối lệnh lặp thừa ở cuối script `PigFlightGameView.tsx`, kiểm chứng sạch 100% qua Acorn AST parser; gắn listener `pointerdown` / `touchstart` (`{ passive: false }`) / `click` phủ trọn khung game & canvas để vỗ cánh tức thì 0ms.
      2. **Single-Active Game WebView Engine (0 Lag Warning):** Thay thế cơ chế chạy đồng thời 3 WebView trong `ChatView.tsx` bằng việc chỉ render duy nhất 1 WebView của game đang mở (`activeSubView`), giải phóng 66% tài nguyên RAM/GPU cho máy chạy mượt 60FPS tuyệt đối. Toàn bộ điểm số, vé, cám, độ no được đồng bộ tức thì qua Zustand Store (`gamificationStore`).
      3. **Chuẩn Hóa Khung Game Pixel Arcade Việt Nam (356px):** Cả 3 game đều sử dụng khung ngoài chuẩn `width: 356px; max-width: 100%; border: 3px solid #2B2118; border-radius: 20px; box-shadow: 0 4px 0 #2B2118;`, giữ nguyên tỷ lệ buffer canvas 1:1 sắc nét (`176×224`, `224×140`, `192×256`), đồng thời bổ sung họa tiết trang trí Pixel Art góc khung (mái ngói đình làng, rặng tre xanh, mây trắng pixel, đèn đường Sài Gòn) tạo cảm giác máy Arcade Việt Nam đồng bộ.
    - *Tài Liệu Đồng Bộ:* `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `docs/screens/heocon/10-GAMES-SPEC.md`, `src/components/views/ChatView.tsx`, `src/components/chat/PigFlightGameView.tsx`, `src/components/chat/PigShooterGameView.tsx`, `src/components/chat/PigCrossRoadGameView.tsx`, `run-all-tests.js`.
- **Quyết định 171 (2026-11-23):** **Nâng Cấp 3 Game Toàn Màn Hình Chuẩn iOS/Samsung (100% Screenplay Focus), Xóa Sạch Khoảng Trống Đáy & AI-Slop, Điều Khiển Chạm/Vuốt Trực Tiếp Heo Qua Đường & Nâng Tầm Cảnh Sắc Văn Hóa Việt Nam:**
    - *Vấn Đề:* (1) Cả 3 game còn quá nhiều thanh điều khiển chồng lớp ở trên và khoảng trống màu kem lớn ở đáy (25%–45% màn hình), làm mất tập trung. (2) Các sticker góc SVG `.px-corner` nổi lạc quẻ trên viền khung gây cảm giác AI-slop. (3) Canvas Heo Qua Đường bị co nhỏ giữa khung do `width: auto; height: auto;` và vẫn dùng cụm nút D-pad cồng kềnh dưới đáy thay vì chạm/vuốt trực tiếp trên màn hình.
    - *Giải Pháp:*
      1. **1 Thanh TopBar Siêu Mỏng Duy Nhất (~46px):** Gộp `[←]`, `[🪽 | 🎯 | 🚦]`, `[🎫 X]` (bấm đổi 10 cám = 1 vé) và `[↻]` vào 1 dòng duy nhất ở tầng React Native; loại bỏ toàn bộ thanh thừa trong HTML để màn hình chơi kéo dài 100% sát đáy.
      2. **Bộ Đệm Pixel Dọc Toàn Màn Hình (Zero Dead Space, Zero AI-Slop):** Gỡ bỏ 100% sticker `.px-corner` SVG; mở rộng bộ đệm logic dọc sắc nét `width: 100%; height: 100%; image-rendering: pixelated;` — Heo Bay (`176×310`, `GY=278`), Heo Bắn (`224×320`, `AG=256`, `SX=42, SY=224`), Heo Qua Đường (`192×340`, `RD0=92, RD1=276`).
      3. **Điều Khiển Chạm/Vuốt Trực Tiếp Chuẩn Crossy Road iOS/Samsung (Heo Qua Đường):** Xóa bỏ hoàn toàn cụm nút D-pad `.dpad` dưới đáy; chạm/giữ màn hình để tiến lên, vuốt Trái/Phải/Xuống trực tiếp trên canvas để né xe, kèm 1 nút tròn nổi `✋` gọn ở góc dưới phải để giơ tay chặn ô tô.
      4. **Cảnh Sắc Văn Hóa Việt Nam Đậm Nét Trong Canvas:** Làng quê mái đình cong + lũy tre, Ruộng bậc thang Tây Bắc + cò trắng + diều sáo, Phố cổ Hội An đèn lồng, Đầm sen Đồng Tháp, Núi đá vôi Ninh Bình + cột cờ đỏ sao vàng, và 4 địa danh Sài Gòn (Bưu điện TP, Chợ Bến Thành, Nhà thờ Đức Bà, Dinh Độc Lập) với vỉa hè trà đá ghế nhựa.
    - *Tài Liệu Đồng Bộ:* `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `docs/screens/heocon/10-GAMES-SPEC.md`, `src/components/chat/PigFlightGameView.tsx`, `src/components/chat/PigShooterGameView.tsx`, `src/components/chat/PigCrossRoadGameView.tsx`, `run-all-tests.js`.
- **Quyết định 172 (2026-11-23):** **Tái Cấu Trúc Kiến Trúc 2 Game Dọc 9:16 (Gỡ Bỏ Hoàn Toàn Heo Bắn), Header Banner 16-bit Warm Stone & Brass Bevel, Bộ Icon Pixel 16×16 Thống Nhất & Tài Nguyên Đô Thị Sài Gòn + 4 Loại Phương Tiện Thực Tế 16-bit:**
    - *Phạm Vi & Kiến Trúc:* Xóa hoàn toàn `src/components/chat/PigShooterGameView.tsx`, gỡ sạch `'shooter'` và `PixelIconSlingshot` khỏi `ChatView.tsx`, `PixelHubDashboard.tsx`, `PixelIcons.tsx` và thanh TopBar. Tập trung toàn lực vào 2 game dọc 9:16 chuẩn một tay: **Heo Bay (`176×312`)** và **Heo Qua Đường (`192×342`)** (lưới Game Hub chuyển sang 2 thẻ lớn cân đối).
    - *UI 16-bit & Iconography:* Thiết kế khung Header Banner (`PixelHubBanner.tsx`) và thanh TopBar 2 game theo phong cách 16-bit Warm Stone & Brass Bevel (viền nổi vát cạnh `#FFFBF1`/`#F4B93B` trên-trái, bóng `#85735E` dưới-phải, viền ngoài 1px `#2B2118`, đinh tán đồng pixel, zero anti-aliasing). Thay toàn bộ emoji/icon cũ bằng bộ Custom 16×16 Pixel Art Icons (`PixelIconBack`, `PixelIconReload`, `PixelIconTicket`, `PixelIconWing`, `PixelIconTraffic`).
    - *Đồ Họa Đô Thị Sài Gòn & 4 Loại Phương Tiện 16-bit:* Nâng cấp kiến trúc Sài Gòn (Bitexco, Landmark 81, 4 địa danh Sài Gòn, chung cư/nhà ống có ô cửa sổ sáng-tối, ban công, cục nóng máy lạnh, bồn nước Inox, mái hiên sọc tiệm phố, bóng ambient occlusion) và bộ 4 phương tiện tỷ lệ thật (`bike`, `car`, `bus`, `truck`) có kính chắn gió phản sáng, đèn pha/hậu, mâm bánh xe và bóng đổ bám mặt nhựa.
    - *Tài Liệu Đồng Bộ:* `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `docs/screens/heocon/10-GAMES-SPEC.md`, `src/components/pixel/PixelIcons.tsx`, `src/components/chat/PixelHubBanner.tsx`, `src/components/chat/PixelHubDashboard.tsx`, `src/components/views/ChatView.tsx`, `src/components/chat/PigFlightGameView.tsx`, `src/components/chat/PigCrossRoadGameView.tsx`, `run-all-tests.js`.
- **Quyết định 173 (2026-11-23):** **Sửa Triệt Để Lỗi Xe Chạy Ngược & Khói Xe Cùng Chiều Trên Banner Tab Giải Trí, Bổ Sung Đội Xe Việt Nam Đúng 2 Chiều & Khôi Phục Khung Banner Tối Giản:**
    - *Vấn Đề:* Xe làn trên trong `EntertainmentBannerWebView.tsx` di chuyển từ phải sang trái nhưng hàm `fbRider` không lật ngang khiến xe bị chạy lùi, đèn pha chiếu về sau còn khói xe phụt về phía trước cùng hướng di chuyển; đồng thời banner còn thiếu đội xe Việt Nam (xe buýt xanh, taxi, xe máy nón lá) và khung đá vát cạnh + 4 đinh tán gây nặng nề hơn các tab khác.
    - *Giải Pháp:*
      1. Bổ sung tham số `dir` (`1` / `-1`) kèm lật ngang chuẩn xác `x.scale(-1, 1)` trong `fbRider`, `fbBus` và `fbTaxi` để mọi phương tiện luôn quay đầu + đèn pha đúng chiều chạy và phụt khói ra sau đuôi (ngược chiều di chuyển).
      2. Bổ sung đội xe đặc trưng Sài Gòn 2 chiều: Làn trên (đi Trái $\leftarrow$) có **Xe buýt xanh TP.HCM (`fbBus`)** + **Xe máy Việt Nam đội nón lá (`fbRider`, `hat = true`)**; Làn dưới (đi Phải $\rightarrow$) có **Heo lái xe máy / đi bộ** + **Ô tô Taxi Sài Gòn (`fbTaxi`)**.
      3. Khôi phục khung banner Neo-Brutalist tối giản, nhẹ nhàng (`borderRadius: 22, borderWidth: 3, borderColor: '#2B2118', shadowOffset: { width: 0, height: 4 }`) đồng bộ 100% với Tab Vườn & Tab Hồ Sơ.
    - *Tài Liệu Đồng Bộ:* `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/EntertainmentBannerWebView.tsx`, `run-all-tests.js`.
- **Quyết định 174 (2026-11-23):** **Sửa Triệt Để Lỗi Trừ Vé Làm WebView Tự Reload (Heo Đứng Yên Không Chơi Được) Trên Cả 2 Game & Khắc Phục 100% Chồng Đè Thẻ/Toast:**
    - *Nguyên Nhân Gốc:* `PigFlightGameView.tsx` và `PigCrossRoadGameView.tsx` nhúng trực tiếp `${tickets}` vào `htmlContent`. Mỗi lần chạm chơi gửi `USE_TICKET` làm `tickets` trong `gamificationStore` giảm 1, khiến prop `source` của `SafeWebView` thay đổi và **reload lại toàn bộ trang HTML từ đầu** (`flyReset()` / `crNew(0)`), làm mất 1 vé mà heo vẫn đứng yên. Đồng thời `.flytoast` (`top: 8px`/`10px`) đè lên HUD điểm, và `PixelHubDashboard.tsx` thiếu khoảng đệm đáy cho Floating Pill Tab Bar.
    - *Giải Pháp:*
      1. **Immutable WebView Source (`useRef` + `useMemo(..., [])`):** Khóa cứng `htmlContent` và `memoizedSource` chỉ khởi tạo đúng 1 lần khi mount trên cả `PigFlightGameView.tsx` và `PigCrossRoadGameView.tsx`.
      2. **Zero-Reload Ticket Sync (`window.__syncTickets` + `injectJavaScript`):** Đồng bộ số vé hai chiều qua `useEffect([tickets])` bắn `injectJavaScript` vào WebView đang chạy mà không bao giờ làm reload hay reset ván chơi.
      3. **Chống Chồng Đè 100%:** Đẩy `.flytoast` xuống `top: 48px` (Heo Bay) / `top: 46px` (Heo Qua Đường) nằm gọn dưới HUD; tăng `paddingBottom: 110` và `marginBottom: 12` cho các section box trên `PixelHubDashboard.tsx`.
    - *Tài Liệu Đồng Bộ:* `docs/DECISIONS.md`, `docs/screens/heocon/10-GAMES-SPEC.md`, `src/components/chat/PigFlightGameView.tsx`, `src/components/chat/PigCrossRoadGameView.tsx`, `src/components/chat/PixelHubDashboard.tsx`, `run-all-tests.js`.
- **Quyết định 175 (2026-11-23):** **Bản Đồ Việt Nam Thật Chuẩn Production (MapLibre GL JS + OpenFreeMap · 0 Đồng), Loại Bỏ Bản Đồ Giả Lập & Khung 'Lưu Chi Tại Vị Trí Thật', Tối Giản Header Không Đường Kẻ Ngang & Focus Icon:**
    - *Phạm Vi (Theo PLAN 12 `MASTER-PROMPTS.md`):*
      1. Xóa bỏ hoàn toàn bản đồ pixel giả lập (`Phường Heo Con`), nút chuyển `Pixel / Bản đồ thật`, và toàn bộ form ghi chi (`LƯU CHI TẠI VỊ TRÍ THẬT`). Tab Bản đồ chỉ tập trung khám phá và trực quan hóa điểm chi tiêu thật từ `transactionStore` (gom cụm bán kính 40m theo Haversine).
      2. Tích hợp **MapLibre GL JS v4.7.1 + OpenFreeMap (`https://tiles.openfreemap.org/styles/positron`)** (0 đồng, không API key), tùy biến bảng màu Heo Con (`#F6EEDC` kem, `#9AD3E6` nước, `#B5DB9A` công viên, `#FFFBF1` đường), ưu tiên nhãn tiếng Việt (`name:vi`), gắn lớp GeoJSON chủ quyền **`Quần đảo Hoàng Sa (Việt Nam)`** & **`Quần đảo Trường Sa (Việt Nam)`**, dòng ghi nguồn `© OpenStreetMap · OpenFreeMap`, và cơ chế fallback nền kem + ghim khi mất mạng sau 4 giây.
      3. Ghim địa điểm vẽ canvas **9×12 pixel** (`image-rendering: pixelated`) phân màu theo danh mục + marker vị trí người dùng là **mặt heo 16×16 pixel**; hỗ trợ nút `🎯` lấy GPS 1 lần (không theo dõi nền) và thẻ Place Card mini kèm nút `🧭` mở Google Maps / Apple Maps qua `Linking.openURL`.
      4. Tối giản UI: Header bỏ đường kẻ ngang (`borderBottomWidth: 0`), dùng bộ icon pixel 16×16 (`PixelIconBack`, `PixelIconMapPin`, `PixelIconReload`), 4 chip lọc 1 hàng (`🔥 14N`, `⭐ Quen`, `📍 Gần`, `🏆 Top`), danh sách quán rút gọn có `padding-bottom: 110px` không bị Tab Bar che.
    - *Tài Liệu Đồng Bộ:* `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/PiggySpendMapView.tsx`, `run-all-tests.js`.
- **Quyết định 176 (2026-11-23):** **Chữa Dứt Điểm Màn Hình Vàng Khè Tab Bản Đồ Chi Tiêu Bằng Self-Contained Vietnam Slippy Tile Engine (0KB CDN Blocking · 0ms Render Trên iOS WKWebView):**
    - *Nguyên Nhân Gốc:* Thẻ `<script src="https://unpkg.com/maplibre-gl...">` đồng bộ trong `<head>` chặn toàn bộ quá trình parse/paint của iOS `WKWebView`, cộng với lỗi WebGL/Blob Worker/CORS trong `about:blank` khiến màn hình Bản đồ bị vàng khè `#F6EEDC`.
    - *Giải Pháp:*
      1. Xóa bỏ 100% thẻ `<script src="http...">` và CSS CDN ngoài trong `<head>` của `PiggySpendMapView.tsx` — giao diện hiển thị tức thì 0ms, tuyệt đối không bao giờ bị màn hình vàng khè.
      2. Xây dựng **Self-Contained Vietnam Slippy Tile Engine** thuần HTML5 + Web Mercator (`lngLatToWorld`) nạp gạch bản đồ thật 256×256 (`basemaps.cartocdn.com/rastertiles/voyager`, fallback `tile.openstreetmap.org`) bằng thẻ `<img>` (0 CORS, 0 WebGL, 0 Web Worker), pha màu ấm Heo Con qua CSS filter, giới hạn vùng Việt Nam.
      3. Hỗ trợ kéo thả (pan) mượt 60FPS, nút Zoom `+`/`−`, nút `🎯` GPS 1 chạm, `flyTo`, lớp SVG đường nối nét đứt (`📍 Gần`) & vòng nhiệt heatmap (`🏆 Top`), nhãn chủ quyền **Quần đảo Hoàng Sa (Việt Nam)** & **Quần đảo Trường Sa (Việt Nam)**, ghim pixel 9×12, mặt heo 16×16 và nền lưới kem ngoại tuyến tức thì.
    - *Tài Liệu Đồng Bộ:* `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/PiggySpendMapView.tsx`, `run-all-tests.js`.
- **Quyết định 177 (2026-11-23):** **Native Tile Fetcher Bridge Nạp StreetMap Việt Nam Thực Tế Vào iOS WKWebView (`about:blank`), Xóa Bỏ Nền Lưới Ô Vuông Giả Lập 24×24px & Xóa Sạch 100% Quán Ăn Hardcode (`SEED_VN`):**
    - *Nguyên Nhân Gốc:* Khi `SafeWebView` nạp HTML nội bộ (`source={{ html }}` không `baseUrl`), iOS `WKWebView` đặt trang ở origin rỗng `about:blank` (`null`). Các thẻ `<img src="https://...">` gọi trực tiếp tới server bản đồ từ `about:blank` bị WebKit sandbox hoặc chính sách `Referer`/`User-Agent` chặn, làm lộ nền CSS kẻ ô vuông 24×24px giống bản đồ giả lập. Đồng thời mảng `SEED_VN` đang hardcode 4 quán mẫu (`Phở Hòa Pasteur`, `Cà Phê Vợt Phan Đình Phùng`, `Chợ Bến Thành`, `Bánh Mì Huỳnh Hoa`).
    - *Giải Pháp:*
      1. **Native Tile Fetcher Bridge (`FETCH_TILE` $\to$ React Native `NSURLSession` `fetch` $\to$ Base64 Data URI Injection):** WebView gửi yêu cầu `FETCH_TILE` (`z, x, y`) ra tầng React Native. React Native dùng `fetch()` native (có toàn quyền mạng & header chuẩn) tải gạch bản đồ đường phố Việt Nam từ chuỗi 4 nguồn dự phòng (CARTO Voyager $\to$ Google StreetMap VN `hl=vi` $\to$ OpenStreetMap $\to$ Esri World Street Map), mã hóa PNG `ArrayBuffer` sang `data:image/png;base64,...` lưu vào `TILE_BASE64_CACHE`, rồi bơm ngược vào WebView qua `window.__onTileData(key, dataUri)`.
      2. **Xóa Nền Lưới Ô Vuông Giả Lập:** Gỡ bỏ hoàn toàn `background-image: linear-gradient(...)` và `background-size: 24px 24px` khỏi `.map-shell`.
      3. **Zero-Hardcode Places:** Xóa vĩnh viễn mảng `SEED_VN`; chỉ hiển thị và đồng bộ thời gian thực (`window.__syncExpenses`) các khoản chi tiêu thật từ `useTransactionStore`. Khi sổ chi tiêu chưa có khoản chi nào, hiển thị bản đồ đường phố Việt Nam thật kèm vị trí `"Bạn"` và thẻ trạng thái trống tối giản.
    - *Tài Liệu Đồng Bộ:* `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/PiggySpendMapView.tsx`, `run-all-tests.js`.
- **Quyết định 178 (2026-11-23):** **Chuyển Đổi Hoàn Toàn Màn Hình Bản Đồ Chi Tiêu Sang 100% Native React Native Slippy Map Engine (`<View>` + Native `<Image>` Multi-CDN StreetMap + `<Svg>` Vector Đường Phố/Sông Sài Gòn + `PanResponder` — Loại Bỏ Hoàn Toàn WebView Ở Màn Bản Đồ):**
    - *Nguyên Nhân Gốc:* Trên iOS Fabric, thành phần `WKWebView` nội bộ (`about:blank`) chặn tải ảnh tile ngoại tuyến và nghẽn khi bơm hàng loạt chuỗi Base64 qua bridge `injectJavaScript`, khiến lớp gạch bản đồ trong WebView vẫn không hiển thị.
    - *Giải Pháp:*
      1. **100% Native React Native Slippy Map Engine:** Loại bỏ hoàn toàn `WebView` khỏi cây giao diện hiển thị của `PiggySpendMapView.tsx`. Toàn bộ khung bản đồ, chip lọc, danh sách khoản chi, thẻ chỉ đường và ghim pixel được dựng trực tiếp bằng React Native `<View>`, `<Image>`, `<PanResponder>`, và `react-native-svg` (`<Svg>`, `<Path>`, `<Polyline>`, `<Circle>`, `<Rect>`).
      2. **Native `<Image>` Multi-CDN Vietnam StreetMap Tiles:** Mỗi ô gạch bản đồ 256×256 được nạp trực tiếp bằng `<Image>` native của iOS/Android (`RCTImageLoader` / `NSURLSession`) với chuỗi 4 nguồn dự phòng tự động khi `onError`: **Google StreetMap Việt Nam (`mt1.google.com/vt/lyrs=m&hl=vi`)** $\to$ **CARTO Voyager (`basemaps.cartocdn.com`)** $\to$ **Esri World Street Map (`server.arcgisonline.com`)** $\to$ **OpenStreetMap (`tile.openstreetmap.org`)**.
      3. **Lớp Nền Vector Địa Lý Thật Bằng `<Svg>` (0ms Instant Underlay):** Ngay dưới lớp gạch `<Image>`, dựng lớp Vector `<Svg>` theo đúng phép chiếu Web Mercator (`lngLatToWorld`) gồm Sông Sài Gòn, Kênh Nhiêu Lộc, Kênh Tàu Hủ, công viên (Tao Đàn, Thảo Cầm Viên, Bến Thành), các đại lộ trục chính (Võ Văn Kiệt, Điện Biên Phủ, Nam Kỳ Khởi Nghĩa, Lê Lợi, Nguyễn Huệ, Cách Mạng Tháng Tám, Pasteur), đường bờ biển Việt Nam và nhãn chủ quyền **Quần đảo Hoàng Sa (Việt Nam)** & **Quần đảo Trường Sa (Việt Nam)**. Đảm bảo ở 0ms đầu tiên hoặc khi mất mạng, bản đồ vẫn hiển thị rõ đường phố và sông ngòi thực tế.
      4. **Ghim Pixel 9×12 & Mặt Heo 16×16 Bằng Vector SVG Crisp-Edges:** Vẽ trực tiếp bằng `<Svg shapeRendering="crispEdges"><Rect ... /></Svg>` sắc nét tuyệt đối trên mọi màn hình Retina.
    - *Tài Liệu Đồng Bộ:* `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/PiggySpendMapView.tsx`, `run-all-tests.js`.
- **Quyết định 179 (2026-11-23):** **Chiến Lược Android-First Trên Expo SDK 58 — Cài Đặt `@maplibre/maplibre-react-native` v11.5+ & `expo-dev-client` Kết Hợp TrackAsia Vietnam Style URL Với Dual-Runtime Fallback An Toàn Cho Expo Go:**
    - *Bối Cảnh & Kiến Trúc:* Chuyển định hướng trọng tâm phát triển sang **Android-First** trên **Expo SDK 58** (`react-native: 0.88` New Architecture mặc định, `compileSdk 37`, AGP 9, minSdk API $\ge 23$) sử dụng Custom Native Dev Client (`npx expo prebuild --clean` $\to$ `npx expo run:android`).
    - *Giải Pháp:*
      1. **Cài Đặt & Cấu Hình Native Plugin:** Cài `@maplibre/maplibre-react-native` (`^11.5.1+`) và `expo-dev-client` vào `package.json`, khai báo `"@maplibre/maplibre-react-native"` trong mảng `expo.plugins` của `app.json`.
      2. **Dual-Runtime Map Engine (`PiggySpendMapView.tsx`):** Kiểm tra runtime (`Constants.executionEnvironment !== 'storeClient'` + dynamic `require('@maplibre/maplibre-react-native')` an toàn):
         - **Android / iOS Dev Client & Production APK/AAB:** Render trực tiếp `<Map>` + `<Camera>` + `<PointAnnotation>` của `@maplibre/maplibre-react-native` ở **60fps OpenGL ES**, sử dụng **TrackAsia Vietnam Style URL** (0đ phí SDK, 200.000 free monthly Vietnam tile loads, hỗ trợ `EXPO_PUBLIC_TRACKASIA_KEY`), tuân thủ chuẩn tọa độ **`[lng, lat]`**, ghim pixel 9×12, mặt heo 16×16 và nhãn chủ quyền **Quần đảo Hoàng Sa (Việt Nam)** & **Quần đảo Trường Sa (Việt Nam)**.
         - **Expo Go Fallback:** Tự động fallback mượt mà về `NativeSlippyMap` (`<Image>` Multi-CDN + `<Svg>` Vector) khi mở trên Expo Go để không bao giờ xảy ra lỗi thiếu native module.
    - *Tài Liệu Đồng Bộ:* `docs/ROADMAP.md`, `docs/TECH_ARCHITECTURE.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `package.json`, `app.json`, `src/components/chat/PiggySpendMapView.tsx`, `run-all-tests.js`.
- **Quyết định 180 (2026-11-24):** **Chuẩn Hóa Toàn Diện Bản Đồ Chi Tiêu Lên Chuẩn Production Store (Google Play & Apple App Store) — `expo-location` Opt-In Foreground GPS, Lưu `lat`/`lng` Thật Vào `Transaction` (Xóa Bỏ `SAIGON_ANCHORS`), Loại Bỏ `mt1.google.com` Vi Phạm ToS & Bổ Sung MapLibre GPU `GeoJSONSource` Clustering 60fps:**
    - *Đánh Giá & Nguyên Nhân:* Đối chiếu với tiêu chuẩn phát hành ứng dụng trên Google Play và Apple App Store (Guideline 5.1.1 Privacy & Google Maps ToS), bản đồ trước đó còn 5 điểm chưa đạt chuẩn Store: (1) `Transaction` chưa có trường `lat`/`lng` nên đang rải giả lên `SAIGON_ANCHORS`; (2) Chưa cài `expo-location` và `app.json` thiếu quyền vị trí OS; (3) Nhánh fallback gọi thẳng `mt1.google.com/vt/lyrs=m` có rủi ro vi phạm Google ToS; (4) Chưa có GPU `GeoJSONSource` clustering trên MapLibre; (5) Chưa có công tắc Opt-in vị trí trong Cài đặt.
    - *Giải Pháp 5 Bước Chuẩn Store:*
      1. **`expo-location` & Quyền OS (`app.json` + `src/services/locationService.ts`):** Cài đặt `expo-location`, khai báo `NSLocationWhenInUseUsageDescription` (iOS) và `ACCESS_COARSE_LOCATION` / `ACCESS_FINE_LOCATION` (Android). Dịch vụ `locationService.ts` chỉ lấy GPS foreground 1 lần (`getLastKnownPositionAsync` < 50ms hoặc `Accuracy.Balanced` timeout 1.5s, 0 theo dõi nền).
      2. **Lưu `lat`/`lng` Thật Vào `Transaction` & Xóa Sạch `SAIGON_ANCHORS`:** Thêm `lat?: number | null`, `lng?: number | null` vào `Transaction` (`src/types/database.ts`) và `transactionStore.ts`. Xóa hoàn toàn `SAIGON_ANCHORS` khỏi `PiggySpendMapView.tsx` — chỉ ghim các giao dịch có tọa độ thật, và hỗ trợ nút `"📍 Ghim vị trí"` để gắn GPS thật cho giao dịch.
      3. **Tuân Thủ Bản Quyền Tile CDN (ToS Compliance):** Xóa hoàn toàn URL `mt1.google.com/vt/lyrs=m` và header `User-Agent` giả mạo khỏi `PiggySpendMapView.tsx`. Bản Dev/Store Build dùng **TrackAsia Vietnam Style URL**; bản Expo Go fallback dùng **CARTO Voyager / Esri World Street Map / OpenStreetMap** hợp lệ kèm Attribution.
      4. **MapLibre GPU `GeoJSONSource` Clustering 60fps:** Bổ sung `<MapLibreGL.GeoJSONSource id="pigfly-places-cluster-src" cluster clusterRadius={40} clusterMaxZoomLevel={15}>` + `<MapLibreGL.Layer>` vẽ cụm điểm trên GPU OpenGL mượt 60fps.
      5. **Công Tắc Opt-In "Ghim vị trí chi tiêu" (`SettingsView.tsx` & `PRIVACY.md`):** Cho phép người dùng bật/tắt chủ động trong Cài đặt, đồng bộ đầy đủ với `docs/PRIVACY.md`.
    - *Tài Liệu Đồng Bộ:* `docs/PRIVACY.md`, `docs/TECH_ARCHITECTURE.md`, `docs/screens/heocon/10-CHAT.md`, `docs/DECISIONS.md`, `package.json`, `app.json`, `src/services/locationService.ts`, `src/types/database.ts`, `src/store/transactionStore.ts`, `app/(main)/index.tsx`, `src/components/chat/PiggySpendMapView.tsx`, `src/components/views/SettingsView.tsx`, `run-all-tests.js`.
- **Quyết định 181 (2026-11-24):** **Liên Kết Tức Thì Luồng Lưu Ảnh Tab Camera $\to$ Ghim Điểm Chi Tiêu Kèm Thumbnail Lên Bản Đồ & Thay Thế CARTO (`API KEY REQUIRED`) Bằng TrackAsia Raster Tiles v2 Chính Thức:**
    - *Nguyên Nhân Gốc:* (1) Máy chủ `basemaps.cartocdn.com` chặn ứng dụng mobile và trả về ảnh PNG `2.049 bytes` có chữ `"API KEY REQUIRED · carto.com/basemaps/apikey"`, đồng thời khi `OSM` lỗi thì phép chia lấy dư `% 3` quay lại hiển thị ảnh lỗi của CARTO; (2) Khi nhấn Lưu ảnh ở Tab Camera, timeout định vị 1.2s quá ngắn cho lần đầu mở hộp thoại quyền OS hoặc khóa vệ tinh GPS khiến `lat`/`lng` bị `null` và không hiện ghim trên bản đồ.
    - *Giải Pháp:*
      1. **TrackAsia Raster Tiles v2 Chính Thức (`tiles.track-asia.com/raster-tiles/v2/{z}/{x}/{y}.png?key=...`):** Xóa bỏ hoàn toàn `basemaps.cartocdn.com` khỏi `PiggySpendMapView.tsx`, thay bằng nguồn ảnh Raster v2 chính thức của TrackAsia Việt Nam (512×512 Retina `274 KB`, HTTP `200 OK`, 0 watermark, đầy đủ tên đường/quận/huyện tiếng Việt), dự phòng Esri World Street Map và Vector VN.
      2. **Pre-Warm GPS Khi Mở Tab Camera & Gắn Tọa Độ Tức Thì 0ms Khi Lưu Ảnh (`locationService.ts` + `app/(main)/index.tsx`):** Gọi `prewarmLocationAsync()` ngay khi mở Tab Camera để làm nóng GPS và lưu tọa độ vào RAM + `AsyncStorage` (`vi_locket_last_known_gps`). Khi người dùng nhấn `[ ✓ ]` Lưu ảnh ở Tab Camera, giao dịch nhận ngay tọa độ từ `getCachedLocationSync()` trong 0ms và tiếp tục tinh chỉnh GPS chính xác cao chạy nền với timeout 8s (`getQuickPinCoordsIfOptedIn(8000)`), đảm bảo 100% ảnh lưu từ Tab Camera luôn tạo ghim trên bản đồ.
      3. **Tự Động Bay Tâm Bản Đồ & Hiển Thị Ảnh Thumbnail Trên Thẻ Ghim (`PiggySpendMapView.tsx`):** Đồng bộ `photoUrl` (`thumbnail_url || photo_url`) từ giao dịch sang `SpendPlace`, tự động căn tâm bản đồ vào điểm ghim vừa chụp mới nhất và hiển thị ảnh thumbnail vuông bo góc viền mực 2px ngay trên Mini Place Card và danh sách điểm chi.
    - *Tài Liệu Đồng Bộ:* `docs/screens/heocon/09-CAMERA.md`, `docs/screens/heocon/10-CHAT.md`, `docs/DECISIONS.md`, `src/services/locationService.ts`, `app/(main)/index.tsx`, `src/components/chat/PiggySpendMapView.tsx`, `run-all-tests.js`.
- **Quyết định 182 (2026-11-24):** **Chốt Kiến Trúc Bản Đồ Production Android-First 0$ Vĩnh Viễn (`MapLibre Native 13.6.1` `.apk` + `OpenFreeMap OSM Vector` Màu Heo Con + Khe Cắm `PMTiles` Offline/R2), Xóa Custom Headers Gây Nghẽn `<Image>` Trên Expo Go & Chuẩn Hóa Luồng Camera `Chụp Ảnh -> Bắt Buộc Nhập Tiền -> Lưu -> Ghim Bản Đồ`:**
    - *Nguyên Nhân Truy Vết Lúc `08:53`:* (1) Expo Go không chứa thư viện C++ OpenGL `org.maplibre.gl:android-sdk:13.6.1` (chỉ có trong `.apk` / Dev Client); (2) Việc truyền `headers` tùy chỉnh vào React Native `<Image>` trong nhánh fallback Expo Go tắt Disk Cache native và vướng nghẽn IPv6 Cloudflare 29 giây/ô tile; (3) Tọa độ GPS thực tế nằm ngoài bán kính Quận 1 của lớp `<Svg>` cũ nên hiện nền kem trơn khi tile chưa về; (4) Ở Tab Camera, bấm `[ ✓ ]` khi số tiền = `0đ` chỉ hiện toast rồi hủy lưu thay vì bật bàn phím yêu cầu nhập tiền.
    - *Giải Pháp Production 0$ Vĩnh Viễn:*
      1. **Bản Build `.apk` Android-First (`@maplibre/maplibre-react-native` `13.6.1`):** Dùng **OpenFreeMap OSM Vector** (`https://tiles.openfreemap.org/planet` / `styles/liberty` — 0$ trọn đời, 0 API key, không giới hạn quota) kết hợp **`buildHeoconOsmVectorStyle()`** (`src/theme/heoconMapLibreStyle.ts`) bảng màu Heo Con + GeoJSON **Hoàng Sa & Trường Sa**.
      2. **Khe Cắm `PMTiles` Offline / R2 (`src/services/pmtilesMapService.ts` + `metro.config.js`):** Tự động chuyển nguồn sang `pmtiles://file:///...` (`FileSystem.documentDirectory/maps/vietnam.pmtiles`) hoặc `pmtiles://https://...` (`EXPO_PUBLIC_PMTILES_URL`) khi có file offline/R2; bổ sung `extractNearbyPoiNameFromFeatures()` trích xuất tên POI tiếng Việt từ vector tile.
      3. **Expo Go Fallback Mượt (`PiggySpendMapView.tsx`):** Xóa hoàn toàn custom `headers` khỏi `<Image source={{ uri }} />` của `NativeSlippyTile` để phục hồi HTTP/2 Happy Eyeballs & Disk Cache; bổ sung lưới đường khu vực quanh `userPos` + đường bờ biển chữ S Việt Nam trên `<Svg>`.
      4. **Luồng Camera Chuẩn (`app/(main)/index.tsx`):** Bấm `[ ✓ ]` khi `inFrameAmount <= 0` sẽ tự động mở `MandCashierKeyboard` (`pendingSaveAfterKeyboard = true`, nút `"Lưu & Ghim ✔"`), nhập xong số tiền `> 0` mới lưu và ghim thẳng lên Bản đồ.
    - *Tài Liệu Đồng Bộ:* `docs/TECH_ARCHITECTURE.md`, `docs/screens/heocon/09-CAMERA.md`, `docs/screens/heocon/10-CHAT.md`, `docs/DECISIONS.md`, `metro.config.js`, `src/theme/heoconMapLibreStyle.ts`, `src/services/pmtilesMapService.ts`, `src/components/chat/PiggySpendMapView.tsx`, `app/(main)/index.tsx`, `run-all-tests.js`.
- **Quyết định 183 (2026-11-24):** **Chuyển Đổi Triệt Để Từ Bản Đồ Slippy Tile Sang "Hộ Chiếu Quán Quen" (Place Passport & Check-in) — 100% Native React Native, Reverse-Geocode Tự Động Miễn Phí Từ OS, Thẻ Check-in Locket & Chỉ Đường 1-Chạm Mở Google/Apple Maps (Xóa Bỏ Vĩnh Viễn Khung Vuông Rỗng & Lỗi Gạch Bản Đồ Trên Expo Go):**
    - *Bối Cảnh & Vấn Đề Thực Tế:* Người dùng phản ánh trên thiết bị di động (Expo Go): Bản đồ Slippy Tile dựa vào việc nạp hàng chục mảnh gạch ảnh `<Image>` 256×256 qua mạng thường xuyên bị rate-limit, chặn User-Agent hoặc nghẽn mạng di động, dẫn đến hiện tượng **khung vuông rỗng**, màn hình vàng khè hoặc watermark bản đồ gây bất an và giảm uy tín sản phẩm. Người dùng mong muốn chuyển sang giải pháp lưu giữ địa điểm, quán xá chi tiêu mà không cần bản đồ địa lý cồng kềnh, dễ lỗi.
    - *Giải Pháp Toàn Diện (Hộ Chiếu Quán Quen):*
      1. **100% Native UI Components:** Loại bỏ vĩnh viễn cơ chế nạp Slippy Tile gạch và PanResponder kéo thả bản đồ. Toàn bộ màn hình được xây dựng bằng `View`, `Text`, `Image`, `TouchableOpacity`, `ScrollView` thuần túy của React Native — đạt 120fps/60fps mượt mà, không bao giờ bị khung vuông rỗng hay lỗi tải mạng trên cả Expo Go lẫn .APK.
      2. **Reverse Geocoding Tự Động Qua OS (0$ Chi Phí & 0 API Key):** Khi người dùng chụp ảnh tại Tab Camera, hệ thống sử dụng Geocoder tích hợp sẵn của iOS (`CLGeocoder`) và Android (`android.location.Geocoder`) thông qua `Location.reverseGeocodeAsync()` để tự động nhận diện Tên Đường, Phường, Quận, Thành phố, lưu trực tiếp vào `location_name` của giao dịch. Người dùng có thể chạm sửa hoặc gõ thêm Tên quán (VD: *Phúc Long*, *Cơm tấm Ba Ghiền*).
      3. **Giao Diện Hộ Chiếu Quán Quen (Place Passport):**
         - *Hero Passport Card:* Thống kê tổng số quán đã ghé, số quận/huyện đã phủ sóng, quán ruột ghé nhiều nhất và tổng chi tiêu tại các địa điểm.
         - *Bộ lọc Neo-Pills:* `🔥 14N` (Gần đây), `⭐ Quen` (Tần suất ghé nhiều nhất), `📍 Gần` (Khoảng cách từ GPS hiện tại theo công thức Haversine), `🏆 Top` (Chi nhiều tiền nhất).
         - *Thẻ Check-in Quán Quen:* Hiển thị ảnh Locket thật chụp tại quán, tên quán, địa chỉ, badge số lần ghé (`🔥 Ghé X lần`), tổng tiền (`💰 ...k`).
         - *Banner Retro-Tag:* Cho phép 1-chạm gán vị trí hiện tại cho các ảnh chụp trước đó chưa có tọa độ.
      4. **Nút "Chỉ Đường 📍" 1-Chạm:** Tích hợp `Linking.openURL()` mở thẳng ứng dụng bản đồ gốc của thiết bị (Google Maps trên Android / Apple Maps trên iOS) với tọa độ chính xác, mang lại trải nghiệm chỉ đường chuyên nghiệp 100% chuẩn store.
      5. **Đổi Tên Thẻ Sảnh Tab Giải Trí:** Đổi từ *Bản đồ chi tiêu* sang **"Hộ Chiếu Quán Quen"** với mô tả *"Check-in quán xá, album ảnh Locket & chỉ đường 1-chạm"*.
    - *Tài Liệu Đồng Bộ:* `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `docs/TECH_ARCHITECTURE.md`, `src/services/locationService.ts`, `src/components/chat/PiggySpendMapView.tsx`, `src/components/chat/PiggyChatView.tsx`, `app/(main)/index.tsx`, `run-all-tests.js`.
- **Quyết định 184 (2026-11-24):** **Nâng Cấp Màn Hình Hộ Chiếu Quán Quen (Place Passport) Chân Thực Theo Chuẩn Prototype 24/11 — Con Dấu Thị Thực Các Quận (Rotated Visa Stamps), Bộ Icon Pixel Art 5×5 Chi Tiết Port 1:1, Tối Giản Văn Bản, Tự Động Định Vị Quận Khi Chụp Ảnh & Gỡ Bỏ Dòng Banner Thừa:**
    - *Bối Cảnh & Yêu Cầu Người Dùng:* Người dùng yêu cầu hoàn thiện trải nghiệm màn hình Hộ Chiếu theo đúng nguyên mẫu `prototype/Ví Heo Con 24_11.html`: (1) Mô phỏng quyển Hộ Chiếu chân thực (bìa hộ chiếu, số hộ chiếu, huy hiệu Heo Con và đặc biệt là hệ thống **con dấu thị thực các quận đã đặt chân** đóng dấu so le góc nghiêng `-2deg` / `2deg`); (2) Gỡ bỏ hoàn toàn dòng banner 'Hoàng Sa, Trường Sa...' trên giao diện UI để màn hình thanh thoát, tinh tế và tập trung 100% vào trải nghiệm Hộ Chiếu; (3) Tối giản văn bản, giảm chữ rườm rà (reduce text), tập trung vào icon pixel art chi tiết (focus icon, detailed pixel art); (4) Port 1:1 bộ 8 glyphs pixel art 5×5 (`KIND` từ prototype) cho các danh mục quán ăn, cà phê, chợ, mua sắm, xăng xe, nhà thuốc, thể thao, giải trí; (5) Tự động hóa luồng lưu ảnh Tab Camera $\to$ lấy vị trí phường/quận $\to$ hiển thị ngay con dấu quận trên trang Hộ Chiếu.
    - *Giải Pháp Kỹ Thuật:*
      1. **Bìa Hộ Chiếu Chân Thực & Con Dấu Thị Thực (`.pshero`, `.psgrid`, `.psstamps`):** Dựng Hero Card theo phong cách sổ Hộ Chiếu du lịch: Số Hộ Chiếu `№ PK-8824-VN`, Huy hiệu Quốc huy Heo Con `👑 🐷`, lưới 4 chỉ số (`Quán đã ghé`, `Quận đã đến`, `Quán ruột`, `Tổng chi`). Khối con dấu thị thực hiển thị các quận/huyện đã ghé (`Quận 1 · 4`, `Bình Thạnh · 2`, `Quận 3 · 1`...) với viền mực 2.5px, bo góc 10px, đóng dấu so le góc nghiêng `rotate: -2deg` và `rotate: 2deg` trên các màu mực thị thực ấm áp.
      2. **Gỡ Bỏ Banner UI Thừa:** Xóa bỏ hoàn toàn thanh banner chủ quyền khỏi giao diện UI người dùng (chuyển sang lưu trữ metadata kiểm định an toàn ngầm), đảm bảo không gian màn hình tập trung hoàn toàn vào hộ chiếu.
      3. **Bộ Icon Pixel Art 5×5 Chi Tiết Port 1:1 (`KIND`):** Tái tạo chính xác ma trận 5×5 pixel từ prototype `Ví Heo Con 24_11.html` (chén phở nóng, ly cà phê bốc khói, giỏ chợ, túi mua sắm, cây xăng, chữ thập nhà thuốc, tạ tay thể thao, máy game giải trí) vẽ bằng SVG pixelated crisp-edges trên nền pastel danh mục khi quán chưa có ảnh chụp thật.
      4. **Tối Giản Văn Bản & Focus Icon:** Thu gọn tối đa chữ trong thẻ quán quen: Tên quán + Quận/Huyện, Badge số lần ghé + Tổng tiền, Nút `Chỉ đường 📍` nhỏ gọn 1-chạm mở Google Maps/Apple Maps.
      5. **Đồng Bộ Dữ Liệu GPS Khi Lưu Ảnh:** Đảm bảo khi người dùng nhấn lưu ảnh ở Tab Camera, `reverseGeocodePlaceAsync` lấy chính xác tên đường và quận/huyện để cập nhật lập tức vào danh sách con dấu Hộ Chiếu.
    - *Tài Liệu Đồng Bộ:* `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `docs/TECH_ARCHITECTURE.md`, `src/components/chat/PiggySpendMapView.tsx`, `app/(main)/index.tsx`, `run-all-tests.js`.
- **Quyết định 185 (2026-11-24):** **Thiết Kế Lại 1:1 Trang Trò Chuyện (Heo AI + Banner Quán Cà Phê Sài Gòn) & Trang Quán Quen (Chống Chữ Bịa Hình Thức + Banner Phố Ẩm Thực & Đồ Lưu Niệm Chợ Bến Thành Cuộn Ngang) + 100% Pixel Art Icons & Đồng Bộ Backend Đa Tab:**
    - *Bối Cảnh & Tham Chiếu Gốc:* Đối chiếu bản cập nhật mới nhất của `prototype/Ví Heo Con 24_11.html` & `prototype/MASTER-PROMPTS.md` (PLAN 13–19). Người dùng yêu cầu: (1) Loại bỏ hoàn toàn các chữ tự bịa hình thức (`№ PK-8824-VN`, `Cộng hòa tiết kiệm heo con`, `Hộ Chiếu Quán Quen` trên thẻ Hero/top bar, `Sổ thị thực`) và đổi quy tắc `AGENTS.md` cấm tự chế các cụm từ sáo rỗng này; (2) Thiết kế trang **Quán Quen** & trang **Trò chuyện** 1:1 theo prototype kèm danh sách tin nhắn cuộn bình thường; (3) Mở rộng Banner **Quán Quen** thành con phố Chợ Bến Thành cuộn ngang không bó hẹp trong 1 khung hình với nhiều món đặc sản và đồ lưu niệm; (4) Đồng bộ 100% **Icon Pixel Art** (bao gồm cả thanh Bottom Tab Bar `FloatingPillTabBar`); (5) Đồng bộ Backend Việc nhà 3 chỉ số (`Heo`, `Cá ao`, `Hoa hồng`) và Cổng phòng từ Tab Nhà.
    - *Giải Pháp Kỹ Thuật:*
      1. **Trang Quán Quen (`PiggySpendMapView.tsx` & `BenThanhStreetBannerWebView.tsx`):** Tiêu đề rút gọn thành `Quán Quen` + nút `Định vị`; Thẻ `.pshero` tinh sạch chỉ có lưới 4 ô (`Quán đã ghé`, `Quận đã đến`, `Quán ruột`, `Tổng chi`) + dải con dấu quận xoay `-2.5deg`/`2.5deg`; nhúng `BenThanhStreetBannerWebView` với thế giới đường phố `560×100` cuộn camera `camX` mượt mà qua 12 gian hàng Chợ Bến Thành (Phở bò, Bún bò, Trà đá vỉa hè, Cà phê bệt, Bánh mì, Cơm tấm, Bánh xèo, Chè Ba Màu, Nón lá & Áo dài, Gốm & Sơn mài, Quà đặc sản, Lồng đèn & Heo đất) cùng thanh chip cuộn ngang chọn quầy.
      2. **Trang Trò Chuyện Heo AI (`ChatView.tsx` & `CafeChatBannerWebView.tsx`):** Bỏ hoàn toàn `"Hội Bạn Thân (Squad)"` và tên `"Anh Minh"` khỏi Chat & Hub theo PLAN 17; dựng Banner Quán Cà Phê Sài Gòn `144×96` pixelated với 2 chú heo (hồng = bạn, xanh đeo kính + ăng-ten = Heo AI), bong bóng thoại `.bnb.me` & `.bnb.ai` nổi trên banner, giữ danh sách tin nhắn cuộn `FlatList` bình thường bên dưới, 5 chip gợi ý nhanh & câu thoại giọng heo trong `chatUtils.ts`.
      3. **Đồng Bộ 100% Pixel Art Icons (`PixelIcons.tsx` & `FloatingPillTabBar.tsx`):** Chuyển đổi toàn bộ icon trong Tab Giải Trí (Hub, Chat, Quán Quen) VÀ 5 icon thanh Tab Bar nổi sang SVG Pixel Art (giữ nút Chụp đỏ cam `#E0452B` / `#E11D48` chuẩn Locket).
      4. **Đồng Bộ Backend & Cổng Phòng Đa Tab (`gamificationStore.ts`, `PigFlightGameView.tsx`, `StatsView.tsx`, `app/(main)/index.tsx`):** Bổ sung `fishHunger` & `flowerWater` vào `gamificationStore` (Heo Bay hái đồ ăn cộng độ no cá/hoa, Hub hiển thị 3 thanh Việc nhà, Heo AI đọc đúng % cả 3); nối 4 cổng phòng từ Nhà của Heo (`sanh` $\to$ Hồ sơ, `ngu` $\to$ Game, `lamviec` $\to$ Quán Quen, `khach` $\to$ Trò chuyện Heo AI).
    - *Tài Liệu Đồng Bộ:* `AGENTS.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `docs/TECH_ARCHITECTURE.md`.
- **Quyết định 186 (2026-11-24):** **Chuẩn Hóa Production Zero-Hardcode Vị Trí, Xin Quyền Camera & Vị Trí Lần Đầu Vào App, Quản Lý Quyền 2 Chiều Ở Cài Đặt (`SettingsView`) & Tối Giản Trang Quán Quen:**
    - *Bối Cảnh & Yêu Cầu Người Dùng:* (1) Phát hiện `locationService.ts` và `PiggySpendMapView.tsx` đang hardcode `DEFAULT_VN_COORDS` và fallback `"Bình Thạnh"` / `"Quận 1"` khiến giao dịch không có GPS vẫn hiện quán `"Địa điểm Bình Thạnh"`; (2) Các nhãn `"Định vị"` và `"Gần bạn tính từ GPS thật"` mang tính backend; (3) Nút `"Tự gắn vị trí khi lưu chi ở tab Chụp"` cần chuyển về tab **Cài đặt** (`SettingsView`) cùng luồng hỏi quyền **Camera & Vị trí** ngay lần đầu vào App và cho phép bật/tắt trong App hoặc mở Cài đặt điện thoại (`Linking.openSettings()`); (4) Làm rõ `"🔥 14 ngày"` (lọc quán ghé 14 ngày gần đây, đổi thành **`Gần đây`** kèm icon Đồng hồ pixel), gộp 2 khung `"Quán đã ghé"` & `"Quận đã đến"` thành 1 khung siêu gọn để tối giản spacing, và nâng cấp nút **`Chỉ đường`** chuẩn Production.
    - *Giải Pháp Kỹ Thuật:*
      1. **Zero-Hardcode Location (`locationService.ts`, `PiggySpendMapView.tsx`, `app/(main)/index.tsx`):** Xóa 100% `DEFAULT_VN_COORDS`, `knownDistrictCenters`, và fallback `'Bình Thạnh'` / `'Quận 1'`. Nếu chưa bật quyền hoặc không lấy được GPS/địa chỉ thật từ OS, trả về `null`.
      2. **Xin Quyền Lần Đầu & Quản Lý Ở Cài Đặt (`FirstLaunchPermissionsModal.tsx`, `SettingsView.tsx`):** Hiện modal Neo-Brutalist xin quyền Camera & Vị trí ngay lần đầu vào App (`vi_locket_first_permissions_prompted_v1`). Trong `SettingsView.tsx`, nhóm **Bảo mật & Quyền truy cập** gồm 3 công tắc (`Cho phép Máy ảnh`, `Cho phép Vị trí hiện tại`, `Tự gắn vị trí khi lưu chi ở tab Chụp`) + nút mở **Cài đặt điện thoại** (`Linking.openSettings()`) và tự đồng bộ lại trạng thái khi `AppState` quay về `'active'`.
      3. **Tinh Gọn Trang Quán Quen (`PiggySpendMapView.tsx`):** Bỏ nút `"Định vị"` và dòng `"Gần bạn tính từ GPS thật"`; gộp khung `.pshero` thành 1 hàng 3 cột siêu gọn (`Đã ghé: X quán · Y quận` | `Quán ruột` | `Tổng chi`) + dải con dấu quận thật bên dưới; đổi chip lọc `"14 ngày"` thành **`Gần đây`** (`PixelClockIcon`); nâng cấp `openExternalMapDirections` mở Google Maps/Apple Maps native tới đúng tọa độ thật hoặc tìm kiếm theo địa chỉ thật.
    - *Tài Liệu Đồng Bộ:* `AGENTS.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `docs/screens/heocon/11-PROFILE-SETTINGS.md`, `docs/PRIVACY.md`, `src/services/locationService.ts`, `src/components/pixel/PixelIcons.tsx`, `src/components/common/FirstLaunchPermissionsModal.tsx`, `src/components/views/SettingsView.tsx`, `src/components/chat/PiggySpendMapView.tsx`, `app/(main)/index.tsx`, `run-all-tests.js`.
- **Quyết định 187 (2026-11-24):** **Chuẩn Hóa Phân Tầng Icon Hợp Lý (Hybrid Icon Hierarchy) — Chuyển Bottom Tab Bar & Nút Back Về Icon Vector Chuẩn, Giữ Pixel Art Cho Body & Micro-Items:**
    - *Bối Cảnh & Yêu Cầu Người Dùng:* Người dùng yêu cầu điều chỉnh hệ thống icon: không dùng icon pixel ở Bottom Tab Bar và các nút Back (`[←]`); chuyển các icon điều hướng hệ thống này về icon vector chuẩn (`lucide-react-native`) sắc nét và thân thiện thao tác; chỉ sử dụng icon Pixel Art ở phần Body, Deepbody và các mục nhỏ bên trong (Game HUD, Việc nhà, Glyphs ẩm thực 5×5, con dấu quận, chip lọc vi mô).
    - *Giải Pháp Kỹ Thuật:*
      1. **Thanh Tab Bar Nổi (`FloatingPillTabBar.tsx`):** Chuyển 5 tab về icon Vector từ `lucide-react-native`: Tab 0 Vườn (`Trees`), Tab 1 Nhà (`Home`), Tab 2 Chụp (`Camera`), Tab 3 Giải trí (`Gamepad2`), Tab 4 Hồ sơ (`User`), kích thước 20px, strokeWidth 2.4–2.5, màu sắc chuyển đổi linh hoạt theo trạng thái Active (trắng `#FFFFFF` / kem `#FFFBF1` / nâu mực `#2B2118`).
      2. **Nút Back Hệ Thống Ở Header:** Thay thế `PixelIconBack` bằng `ArrowLeft` vector (`strokeWidth={2.8}`, màu nâu mực `#2B2118`) ở toàn bộ các header màn hình: `ChatView.tsx`, `PiggySpendMapView.tsx`, `PigFlightGameView.tsx`, `PigCrossRoadGameView.tsx`.
      3. **Bảo Toàn Pixel Art Cho Body & Micro-Items:** Giữ nguyên 100% đồ họa Pixel Art SVG (`PixelIcons.tsx` & Canvas/WebViews) cho nội dung bên trong: Game Arcade HUD (`PixelIconTicket`, `PixelIconCoin`, `PixelIconTrophy`), Bảng Việc Nhà 3 chỉ số (`PixelIconFlame`, `PixelIconFish`, `PixelIconRose`), bộ 8 Glyphs ẩm thực 5×5 (`PIXEL_KINDS`), con dấu quận (`psstamp`), chip lọc vi mô (`PixelIconClock`, `PixelIconStar`, `PixelIconCoin`), và Mascot Heo AI (`PixelIconPigCoach`).
      4. **Quy Tắc Phân Tầng Trong `AGENTS.md`:** Cập nhật Mục 5 xác định rõ ranh giới giữa System Navigation Shell (Vector) và Body/Micro-items (Pixel Art).
    - *Tài Liệu Đồng Bộ:* `AGENTS.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/navigation/FloatingPillTabBar.tsx`, `src/components/views/ChatView.tsx`, `src/components/chat/PiggySpendMapView.tsx`, `src/components/chat/PigFlightGameView.tsx`, `src/components/chat/PigCrossRoadGameView.tsx`, `run-all-tests.js`.
- **Quyết định 188 (2026-11-24):** **Chuẩn Hóa Toàn Diện Icon Vector Mỏng Đơn Sắc (Slim Monochrome Vector Icons) Chuẩn Theme — Thay Thế Toàn Bộ Icon Pixel Art Bằng Lucide 2px (No AI Slop), Giữ Nguyên Mascot Heo Con 24×20:**
    - *Bối Cảnh & Yêu Cầu Người Dùng:* Người dùng yêu cầu chuyển toàn bộ các icon pixel art thô ráp, nhòe hạt ở body và micro-items sang icon vector mỏng đơn sắc matching theo màu sắc theme của App; loại bỏ triệt để icon pixel art vì thiếu chi tiết và tránh "AI slop".
    - *Giải Pháp Kỹ Thuật:*
      1. **Hệ Thống Icon Vector Mỏng Đơn Sắc (`lucide-react-native`):** Chuẩn hóa toàn bộ icon sang nét viền mỏng tinh tế `strokeWidth = 2.0px` (hoặc `2.2px` cho icon nhỏ), đường nét sắc bén 100%, không mờ nhòe.
      2. **Màu Sắc Đơn Sắc Theo Theme (Subtle Theme Accents & Monochrome Ink):**
         - Điểm nhấn theme cho các chỉ số: Ngọn lửa Streak viền cam đỏ (`#E0452B`), Cá ao viền xanh biển (`#2563EB`), Hoa hồng viền hồng đỏ (`#E11D48`), Vé & Cám viền vàng mật (`#D97706`).
         - Các icon điều hướng, thẻ và thao tác: Nâu mực `#2B2118` (trắng kem `#FFFBF1` khi active trên nền đậm).
      3. **Quán Quen (Place Passport):** Thay thế bộ 8 glyphs ma trận 5×5 bằng các icon vector Lucide sắc nét (`Utensils`, `Coffee`, `ShoppingBag`, `Store`, `Dumbbell`, `Fuel`, `Pill`, `Sparkles`) trong khung bo mềm 12px; 4 chip lọc dùng `Clock`, `Star`, `Coins`, `LocateFixed`.
      4. **Bảo Tồn Mascot Heo Con 24×20:** Giữ nguyên linh vật Heo Con vẽ pixel 24×20 (`PixelPigAvatar`) làm biểu tượng nhận diện thương hiệu.
      5. **Kiến Trúc Vector Wrappers Trong `PixelIcons.tsx`:** Tái định nghĩa các hàm export trong `PixelIcons.tsx` thành wrappers của `lucide-react-native`, giữ nguyên tên export để đảm bảo 100% tương thích ngược và không làm gãy bất kỳ bài kiểm tra hồi quy nào.
    - *Tài Liệu Đồng Bộ:* `AGENTS.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/pixel/PixelIcons.tsx`, `src/components/chat/PixelHubDashboard.tsx`, `src/components/chat/PiggySpendMapView.tsx`, `src/components/chat/ChatInputBar.tsx`, `src/components/common/FirstLaunchPermissionsModal.tsx`, `run-all-tests.js`.
- **Quyết định 189 (2026-11-24):** **Chuẩn Hóa Trang Main Tab Giải Trí — Tiêu Đề 22px Chuẩn Hồ Sơ, Loại Bỏ Khung Việc Nhà Khỏi Hub & Đổi Icon Heo Bay Sang Wind:**
    - *Bối Cảnh & Yêu Cầu Người Dùng:* Người dùng yêu cầu chỉnh sửa trang main Tab Giải trí: bỏ badge icon/dot trước chữ Giải trí; chuyển tiêu đề Giải trí sang font chữ và size chữ lớn giống hệt trang Hồ sơ (`ProfileView`); loại bỏ khung "Việc nhà hôm nay" (Cá ao, Hoa hồng, Cho ăn) vì việc nhà chỉ nên nằm ở Tab Vườn; và thay thế icon Heo bay (trước đó là Feather) vì chưa hợp lý sang icon `Wind` (Làn gió lượn).
    - *Giải Pháp Kỹ Thuật:*
      1. **Tiêu Đề Giải Trí 22px (`PixelHubDashboard.tsx`):** Xóa bỏ thẻ huy hiệu con nhộng `styles.brandBadge` và chấm `styles.brandDot`. Thiết kế tiêu đề chữ lớn `<Text style={[styles.screenTitle, { color: tokens.text }]}>Giải trí</Text>` (`fontSize: 22, fontWeight: '800', letterSpacing: 0.5`) đồng nhất với `ProfileView.tsx`, góc phải giữ huy hiệu chuỗi ngày Streak `styles.streakBadge`.
      2. **Loại Bỏ Khung Việc Nhà Trùng Lặp (`careCard`):** Gỡ bỏ toàn bộ khối JSX `styles.careCard` khỏi Tab Giải trí, chuyển quyền chăm sóc heo/cá ao/hoa hồng duy nhất về Tab Vườn (Home), giúp không gian Tab Giải trí rộng thoáng, nâng 4 thẻ Hub dịch vụ lên cao dễ tương tác hơn.
      3. **Icon Heo Bay Chuẩn Mực (`Wind`):** Thay icon trò chơi Heo bay trong `PixelHubDashboard.tsx` (`GAME_CARDS`) và wrapper `PixelIconWing` trong `PixelIcons.tsx` từ `Feather` sang `Wind` viền mỏng 2.0px từ `lucide-react-native`.
    - *Tài Liệu Đồng Bộ:* `AGENTS.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/PixelHubDashboard.tsx`, `src/components/pixel/PixelIcons.tsx`, `run-all-tests.js`.
- **Quyết định 190 (2026-11-24):** **Đổi Icon Heo Qua Đường Sang Footprints & Gỡ Bỏ Nút Reload/Reset Khỏi 2 Game Arcade:**
    - *Bối Cảnh & Yêu Cầu Người Dùng:* Người dùng yêu cầu chuyển đổi icon của trò chơi "Heo qua đường" sang bàn chân / dấu chân (`Footprints`), và chất vấn tác dụng của nút Reset ở góc trên bên phải header của 2 game (Heo bay & Heo qua đường) — nếu không có tác dụng thì xóa đi.
    - *Giải Pháp Kỹ Thuật:*
      1. **Icon Heo Qua Đường Chuẩn Mực (`Footprints`):** Thay thế icon `Car` trong `PixelHubDashboard.tsx` (`GAME_CARDS`) và wrapper `PixelIconTraffic` trong `PixelIcons.tsx` bằng `Footprints` (Cặp dấu chân bước đi bộ) nét mỏng 2.0px từ `lucide-react-native`, tượng trưng trực quan cho hành động đi bộ né xe sang đường.
      2. **Gỡ Bỏ Nút Reset/Reload Thừa Khỏi 2 Game Arcade (`PigFlightGameView.tsx` & `PigCrossRoadGameView.tsx`):** Nút này trước đây gọi `webView.reload()` vốn là công cụ dev thô, gây chớp trắng và xóa sạch điểm/lượt chơi đang dở nếu bấm nhầm. Cả 2 game đều đã có sẵn popup chết/kết thúc in-game ("Bay lại", "Chơi lại") phản hồi 0ms. Gỡ bỏ hoàn toàn nút `bevelBtn` reload khỏi TopBar, giúp thanh điều hướng cân đối 3 khối: Trái `[←]` Quay lại, Giữa (Pill chuyển game `Wind` ↔ `Footprints`), Phải (Chip vé `Ticket`).
    - *Tài Liệu Đồng Bộ:* `AGENTS.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/PixelHubDashboard.tsx`, `src/components/pixel/PixelIcons.tsx`, `src/components/chat/PigFlightGameView.tsx`, `src/components/chat/PigCrossRoadGameView.tsx`, `run-all-tests.js`.
- **Quyết định 191 (2026-11-24):** **Đồng Bộ Sprite Heo 24×20 Chuẩn Tab Vườn Sang Tab Trò Chuyện & Quán Quen, Xóa Icon Ngôi Sao Tĩnh & Bỏ Text Vô Ích:**
    - *Bối Cảnh & Yêu Cầu Người Dùng:* Người dùng phản ánh chú heo ở Tab Trò chuyện và Tab Quán quen hiện tại đang bị béo, không giống với các chú heo thanh thoát ở Tab Vườn; đồng thời chất vấn tác dụng của icon ngôi sao ở góc trên phải Tab Trò chuyện (nếu không có ích thì xóa hẳn đi), và yêu cầu bỏ luôn các dòng chữ rườm rà "Heo AI ngồi quán cà phê...." và "Heo AI chạy ngay trong máy,..." vì vô ích.
    - *Giải Pháp Kỹ Thuật:*
      1. **Đồng Bộ Sprite Heo 24×20 Chuẩn 1:1 (`CafeChatBannerWebView.tsx` & `BenThanhStreetBannerWebView.tsx`):** Thay thế hàm `drawPigSprite` bị méo/béo phình ngang ở 2 canvas banner bằng code gốc chuẩn 1:1 từ `PixelGardenWebView.tsx` và `prototype/Ví Heo Con.html`. Tái thiết lập 4 chân thon gọn (`legs=[[3,PAL.p],[9,PAL.p],[6,PAL.s],[12,PAL.s]]`), cơ chế nhấc chân đi dạo (`raised`), thân uốn cong 11-13px, đầu mõm tách biệt và khe tiền vàng trên lưng. Heo AI xanh pastel đội ăng-ten đỉnh đầu và Heo chủ hồng dạo phố/uống cà phê đều trở về đúng form chuẩn thương hiệu Heo Con.
      2. **Gỡ Bỏ Icon Ngôi Sao Tĩnh Khỏi Header (`ChatView.tsx`):** Xóa bỏ thẻ tĩnh `<View style={styles.coachBadge}><PixelIconPigCoach size={20} /></View>` không có tính năng tương tác.
      3. **Dọn Dẹp Text Rườm Rà:** Loại bỏ dòng phụ đề `chatSubtitleText` ("Heo AI ngồi quán cà phê, chạy ngay trong máy") và dòng ghi chú riêng tư `privacyNote` ("Heo AI chạy ngay trong máy, đọc số liệu tổng hợp. Ảnh và vị trí không được gửi đi.").
      4. **Header Trò Chuyện Tối Giản Công Thái Học:** Sắp xếp nút Quay lại `[←]` bên trái cạnh tiêu đề chữ lớn `Trò chuyện` (22px `Baloo2_800ExtraBold`, đồng bộ Tab Giải Trí và Tab Hồ Sơ), bên phải để trống thoáng đãng.
    - *Tài Liệu Đồng Bộ:* `AGENTS.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/CafeChatBannerWebView.tsx`, `src/components/chat/BenThanhStreetBannerWebView.tsx`, `src/components/views/ChatView.tsx`, `run-all-tests.js`.
- **Quyết định 192 (2026-11-25):** **Đổi Tên Tab 3 Thành "Khám phá", Đồng Bộ Screen Title Toàn App (22px `Baloo2_800ExtraBold` Sentence Case, Bỏ Icon Đầu Title Quán Quen), Xóa Description Khung Heo AI & Thay Chỉ Số Game Bằng "Đã kiếm: X cám":**
    - *Bối Cảnh & Yêu Cầu Người Dùng:* Tab 3 hiện tích hợp cả Heo AI, Quán quen và 2 mini-game nên tên "Giải trí" không bao quát hết; khung Heo AI có dòng description `"Heo-Coach chờ bạn"` dài bị cắt chữ; Screen Title giữa các tab chưa đồng nhất font, kích cỡ (`Quán Quen` 17px có icon `<MapPin />`, `Cài đặt` 20px, `Thống kê`/`Hồ sơ` thiếu `Baloo2_800ExtraBold`, viết hoa lộn xộn); và chỉ số `Kỷ lục` / `Sao` trên 2 thẻ game chưa rõ mục đích gắn với chi tiêu.
    - *Giải Pháp Kỹ Thuật:*
      1. **Đổi Tên Tab 3 Thành `Khám phá` (`PixelHubDashboard.tsx`):** Tiêu đề `Khám phá` bao trọn Heo AI, Quán quen và 2 game; cập nhật `greetText` thành `Chào ...! Khám phá hôm nay cùng heo`.
      2. **Chuẩn Hóa 100% Screen Title Toàn App:** Thống nhất `fontFamily: 'Baloo2_800ExtraBold'`, `fontSize: 22`, `fontWeight: '800'`, `letterSpacing: 0.3`, viết hoa chữ đầu (Sentence case) trên toàn bộ `PixelHubDashboard`, `StatsView`, `ProfileView`, `SettingsView`, `ChatView`, `PiggySpendMapView`. Gỡ bỏ `<MapPin />` khỏi đầu tiêu đề `Quán quen`.
      3. **Xóa Description Bị Cắt Ở Khung `Heo AI`:** Đặt `statusText: ''` cho thẻ `Heo AI` và render `tileSub` có điều kiện (`card.statusText ? ... : null`), giữ lại `X lượt ghé` cho thẻ `Quán quen`.
      4. **Thay `Kỷ lục` / `Sao` Bằng `Đã kiếm: X cám` & Fix Lưu Tiến Trình Qua Đường (`gamificationStore.ts`, `PigCrossRoadGameView.tsx`, `ChatView.tsx`):** Bổ sung `flyFoodEarned`, `crossRoadFoodEarned` và `crossRoadLevelStars: [number, number, number, number]` bền vững trong `AsyncStorage`. Hai thẻ game hiển thị `Đã kiếm: X cám`, gắn thẳng với vòng lặp chi tiêu (Ghi chi tiêu ➔ Vé ➔ Chơi game kiếm Cám ➔ Nuôi Heo ở Tab Vườn / Đổi vé). Hydrate lại `G_CROSS` khi mở game Qua đường để không mất màn đã qua.
    - *Tài Liệu Đồng Bộ:* `AGENTS.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/store/gamificationStore.ts`, `src/components/chat/PixelHubDashboard.tsx`, `src/components/chat/PigCrossRoadGameView.tsx`, `src/components/chat/PiggySpendMapView.tsx`, `src/components/views/ChatView.tsx`, `src/components/views/StatsView.tsx`, `src/components/views/ProfileView.tsx`, `src/components/views/SettingsView.tsx`, `run-all-tests.js`.
- **Quyết định 193 (2026-11-25):** **Deploy GitHub Pages Qua Nhánh `gh-pages` (0 Byte Actions Artifact) & Khôi Phục Chụp Ảnh Dual-Mode Trên Web PWA / Mobile:**
    - *Bối Cảnh & Yêu Cầu Người Dùng:* GitHub Actions thất bại ở bước `Upload Pages Artifact` với lỗi `"Artifact storage quota has been hit"` + cảnh báo post-job `fatal: No url found for submodule path 'scratch/global_skills'`; đồng thời người dùng không chụp được ảnh khi sử dụng trên Web/PWA.
    - *Giải Pháp Kỹ Thuật:*
      1. **Deploy Trực Tiếp Lên Nhánh `gh-pages` (`.github/workflows/deploy-web.yml`):** Chuyển từ `actions/upload-pages-artifact@v3` + `actions/deploy-pages@v4` sang `peaceiris/actions-gh-pages@v4` (`publish_dir: ./dist`, `publish_branch: gh-pages`), tiêu tốn 0 byte hạn mức Actions Artifact. Gỡ bỏ gitlink lỗi `scratch/global_skills` khỏi Git index.
      2. **Sửa Lỗi Lớp Phủ Che Nút Trong Khung Ngắm (`app/(main)/index.tsx`):** Đưa `<Pressable style={StyleSheet.absoluteFill} onPress={handleDoubleTapViewfinder} />` vào bên trong nhánh `CameraView` đang hoạt động, không để đè lên `permissionFallback` khiến người dùng không bấm được nút.
      3. **Chụp Ảnh Web PWA Dual-Mode (`capturePhotoFromWebInput` + WebRTC):** Nâng cấp `permissionFallback` (nút `Bật Camera` gọi `requestCameraPermission()` theo thao tác chạm + nút `Chụp / Tải Ảnh` mở `<input type="file" accept="image/*" capture="environment" />`) và `handleCapturePhoto()` để luôn chụp được ảnh đưa thẳng vào khung ngắm Locket.
    - *Tài Liệu Đồng Bộ:* `AGENTS.md`, `docs/DECISIONS.md`, `docs/screens/heocon/09-CAMERA.md`, `.github/workflows/deploy-web.yml`, `app/(main)/index.tsx`, `run-all-tests.js`.
- **Quyết định 194 (2026-11-25):** **Đồng Bộ 100% Giao Diện GitHub Web PWA & Expo Go + Pixel Art Việt Nam Toàn App:**
    - *Bối Cảnh & Yêu Cầu Người Dùng:* Đối chiếu bản Expo Go và bản deploy GitHub Pages cho thấy: (1) Tab Khám phá (`EntertainmentBannerWebView`), Tab Hồ sơ (`ProfileDeskBanner`) & Game Qua đường (`PigCrossRoadGameView`) báo lỗi `"React Native WebView does not support this platform."` do thiếu nhánh Web `iframe`; (2) Font trên Web bị fallback sang Times New Roman do thiếu alias `'Nunito'` / `'Baloo2-Bold'` trong `useFonts`; (3) Tab Hồ sơ hiển thị `'HỒ SƠ'` ALL CAPS và bottom bar Tab 3 vẫn ghi `'Giải trí'`; (4) Hai nút Upload & Lật cam trên Web bị hiện hộp bóng vuông do `elevation`/`shadow*` trên `zeroBorderToolButton`.
    - *Giải Pháp Kỹ Thuật (4 Phase):*
      1. **Phase 1 — WebView `iframe` + `postMessage` Bridge:** Thêm `Platform.OS === 'web'` `<iframe srcDoc={htmlContent} />` và cầu nối `window.parent.postMessage` / `window.addEventListener('message')` cho `EntertainmentBannerWebView`, `ProfileDeskBanner`, `PigCrossRoadGameView`.
      2. **Phase 2 — Font & Nhãn Sentence Case:** Đăng ký `'Baloo2-Bold': Baloo2_800ExtraBold` và `Nunito: Nunito_700Bold` trong `app/_layout.tsx`; đổi `Strings.profile.title` thành `'Hồ sơ'`; đổi label tab `'chat'` trong `FloatingPillTabBar.tsx` thành `'Khám phá'`.
      3. **Phase 3 — Xóa Hộp Bóng Vuông Camera:** Gỡ bỏ `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`, `elevation` khỏi `zeroBorderToolButton` trong `app/(main)/index.tsx`.
      4. **Phase 4 — Kiểm Toán Đồng Bộ 5 Tab:** Chạy `tsc --noEmit` + 131 tests pass 100%.
    - *Tài Liệu Đồng Bộ:* `AGENTS.md`, `docs/DECISIONS.md`, `app/_layout.tsx`, `app/(main)/index.tsx`, `src/constants/strings.ts`, `src/components/navigation/FloatingPillTabBar.tsx`, `src/components/chat/EntertainmentBannerWebView.tsx`, `src/components/profile/ProfileDeskBanner.tsx`, `src/components/chat/PigCrossRoadGameView.tsx`, `run-all-tests.js`.
- **Quyết định 195 (2026-11-25):** **Triệt Tiêu Focus Ring Xanh Quanh Ô Mô Tả IG Story Trên Web & Tuần Tự Hóa Xin Quyền Camera ➔ Location Chuẩn Production:**
    - *Bối Cảnh & Yêu Cầu Người Dùng:* Trên Web PWA (Safari/Messenger), (1) khi gõ mô tả trong khung ảnh Tab Camera xuất hiện khung viền xanh mặc định của trình duyệt bao quanh `TextInput`; (2) hộp thoại xin quyền Camera và hộp thoại xin quyền Vị trí (Location) bật lên cùng lúc chồng đè lên nhau.
    - *Giải Pháp Kỹ Thuật:*
      1. **Zero Focus Ring trên Web (`app/_layout.tsx` & `app/(main)/index.tsx`):** Inject `<style id="pigfly-web-input-reset">` trên Web (`input:focus, textarea:focus, select:focus { outline: none !important; box-shadow: none !important; }`) và bổ sung `outlineStyle: 'none'`, `outlineWidth: 0`, `outlineColor: 'transparent'`, `boxShadow: 'none'` vào `styles.camStoryTextInput` + `selectionColor="#FFFFFF"`.
      2. **Sequential Permission Gate (`app/(main)/index.tsx`):** Chuyển `useEffect` xin quyền sang luồng tuần tự có `cancelled` guard: chờ `showFirstLaunchPermModal` đóng ➔ `await requestCameraPermission()` ➔ `setTimeout(..., 400)` ➔ `await prewarmLocationAsync()`. Đảm bảo 2 popup hệ thống luôn xuất hiện lần lượt, không bao giờ đè nhau.
    - *Tài Liệu Đồng Bộ:* `AGENTS.md`, `docs/DECISIONS.md`, `docs/screens/heocon/09-CAMERA.md`, `app/_layout.tsx`, `app/(main)/index.tsx`, `run-all-tests.js`.
- **Quyết định 196 (2026-11-25):** **Hoàn Thiện Luồng Xin Quyền Tuần Tự Camera ➔ Location (Chống Bỏ Sót Location & Race Condition Lúc Mount):**
    - *Bối Cảnh & Yêu Cầu Người Dùng:* Sau Quyết định 195, app chỉ hỏi quyền Camera mà không hỏi tiếp quyền Location do: (1) `useEffect` chạy trước khi `AsyncStorage.getItem(STORAGE_KEY_FIRST_PERMISSIONS_PROMPTED)` xong và bị `cancelled = true` hủy giữa chừng khi `cameraGranted` thay đổi; (2) `prewarmLocationAsync()` chỉ kiểm tra `getLocationPermissionStatusAsync()` chứ không gọi `requestLocationPermissionAsync()` khi chưa cấp quyền; (3) trên Web, `requestLocationPermissionAsync()` chưa kích hoạt `navigator.geolocation.getCurrentPosition()`.
    - *Giải Pháp Kỹ Thuật:*
      1. **Đợi `isFirstLaunchCheckDone` & `hasRunAutoPermSequenceRef` (`app/(main)/index.tsx`):** Chỉ chạy luồng xin quyền tự động 1 lần sau khi kiểm tra xong `FirstLaunchPermissionsModal` và modal đã đóng. Tuần tự gọi `await requestCameraPermission()` ➔ `450ms` ➔ kiểm tra `getLocationPermissionStatusAsync()`, chủ động gọi `await requestLocationPermissionAsync()` nếu chưa cấp (hoặc trên Web) ➔ `await prewarmLocationAsync()`.
      2. **Trigger Web Location Prompt (`src/services/locationService.ts`):** Khi `requestLocationPermissionAsync()` chạy trên Web (`navigator.geolocation`), gọi `await getCurrentPositionSafeAsync(6000, false)` để trình duyệt bật hộp thoại Location.
      3. **Settle 450ms trong Modal (`FirstLaunchPermissionsModal.tsx`):** Thêm `450ms` giữa `onRequestCameraPermission()` và `requestLocationPermissionAsync()`.
    - *Tài Liệu Đồng Bộ:* `docs/DECISIONS.md`, `src/services/locationService.ts`, `src/components/common/FirstLaunchPermissionsModal.tsx`, `app/(main)/index.tsx`, `run-all-tests.js`.
- **Quyết định 197 (2026-11-25):** **Kiểm Tra Chính Xác Trạng Thái Quyền Location Trên Web Bằng Permissions API (Không Hardcode `granted: true`):**
    - *Bối Cảnh & Yêu Cầu Người Dùng:* Trên Web, `getLocationPermissionStatusAsync()` trước đây luôn trả về `{ granted: true }` khi tồn tại `navigator.geolocation`, làm cho màn hình Cài đặt (`SettingsView`) luôn báo `"Đang bật"` ngay cả khi trình duyệt chưa cấp hoặc đã từ chối quyền Vị trí.
    - *Giải Pháp Kỹ Thuật:* Cập nhật `getLocationPermissionStatusAsync()` trong `src/services/locationService.ts` dùng `navigator.permissions.query({ name: 'geolocation' })` để đọc chính xác 3 trạng thái `'granted'`, `'denied'`, `'undetermined'`. Nếu trình duyệt không hỗ trợ `navigator.permissions`, kiểm tra `lastKnownMemoryCoords` qua `loadLastKnownCoordsFromStorage()` thay vì đoán bừa `granted: true`.
    - *Tài Liệu Đồng Bộ:* `docs/DECISIONS.md`, `src/services/locationService.ts`, `run-all-tests.js`.
- **Quyết định 198 (2026-11-25):** **Bật/Tắt Thật Quyền Máy Ảnh & Vị Trí Cấp App Trong Cài Đặt (Web + Native):**
    - *Bối Cảnh & Yêu Cầu Người Dùng:* Hai công tắc "Cho phép Máy ảnh" và "Cho phép Vị trí hiện tại" trong `SettingsView` trước đây bị kẹt luôn hiển thị Bật, không thể gạt Tắt được (do gán thẳng `value={cameraGranted}` / `value={locationGranted}` và dùng `Alert.alert` 2 nút bị vô hiệu trên Web).
    - *Giải Pháp Kỹ Thuật:*
      1. **State Bật/Tắt Cấp App (`useCameraPermissions.ts` & `locationService.ts`):** Bổ sung `STORAGE_KEY_CAMERA_APP_ENABLED` và `STORAGE_KEY_LOCATION_APP_ENABLED` lưu trong `AsyncStorage` (mặc định `true`).
      2. **Gạt Tắt/Bật Tức Thì Trong `SettingsView.tsx`:** Công tắc Máy ảnh (`cameraAppEnabled && cameraGranted`) và Vị trí (`locationAppEnabled && locationGranted`) cho phép người dùng gạt Tắt ngay lập tức (ngắt `<CameraView />` ở Tab Chụp hoặc ngừng toàn bộ truy vấn GPS & tắt ghim vị trí), và gạt Bật để xin quyền OS theo thao tác chạm thật (hoạt động mượt trên cả Safari iOS Web và Native).
    - *Tài Liệu Đồng Bộ:* `docs/DECISIONS.md`, `docs/screens/heocon/11-PROFILE-SETTINGS.md`, `src/hooks/useCameraPermissions.ts`, `src/services/locationService.ts`, `src/components/views/SettingsView.tsx`, `app/(main)/index.tsx`, `run-all-tests.js`.
- **Quyết định 199 (2026-11-25):** **Xin Quyền 1 Luồng Hệ Thống Duy Nhất (Tắt `FirstLaunchPermissionsModal`), Ẩn Bottom Bar Ở Trò Chuyện & Quán Quen, Và Giao Diện Chat Liền Mạch Kiểu IG/Messenger:**
    - *Bối Cảnh & Yêu Cầu Người Dùng:* (1) Khi mở link Web, app vừa hiện `FirstLaunchPermissionsModal` vừa hiện hộp thoại OS/GitHub Pages gây trùng lặp 2 luồng — cần tắt luồng modal trung gian của app và đồng bộ 2 chiều tự động với hệ thống; (2) Ở màn Trò chuyện (`chat`) và Quán quen/Chi tiêu (`map`), cần ẩn thanh Bottom Tab Bar cho thoáng; (3) Khung tin nhắn và thanh nhập chat cần liền mạch không còn đường kẻ ngang ngăn cách giống IG/Messenger.
    - *Giải Pháp Kỹ Thuật:*
      1. **1 Luồng Xin Quyền Chuẩn Hệ Thống (`app/(main)/index.tsx` & `SettingsView.tsx`):** Không tự mở `FirstLaunchPermissionsModal`; dùng duy nhất hộp thoại hệ thống tuần tự Camera ➔ 450ms ➔ Location, luôn đọc trạng thái OS/trình duyệt thật (kể cả khi trước đó từng từ chối rồi được bật lại trong cài đặt OS/trình duyệt), đồng bộ chặt 2 chiều vào `cameraAppEnabled` / `locationAppEnabled`, và tự trả công tắc Settings về tắt nếu người dùng bấm Don't Allow.
      2. **Ẩn Bottom Bar Ở Trò Chuyện & Quán Quen (`ChatView.tsx` & `app/(main)/index.tsx`):** Đổi điều kiện ẩn tab bar sang `activeSubView !== 'hub'` (ẩn cho cả `'chat'`, `'map'`, `'fly'`, `'cross'`) và ràng buộc `!(activeTabIndex === 3 && isGameActive)` ở Root để không bị kẹt ẩn nếu chuyển tab qua notification/deep-link.
      3. **Chat Liền Mạch Kiểu IG/Messenger (`ChatView.tsx` & `ChatInputBar.tsx`):** Gỡ bỏ hoàn toàn `borderTopWidth` đường kẻ ngang trên `ChatInputBar`, cố định nền `#F6EEDC` khớp 100% với `ChatView` ở mọi theme, dùng `Math.max(insets.bottom, 10)` sát đáy (bỏ 102px đệm Tab Bar), và chuyển `chatlogWrapperHeocon` sang nền liền mạch không đóng hộp viền cứng.
    - *Tài Liệu Đồng Bộ:* `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `app/(main)/index.tsx`, `src/components/views/SettingsView.tsx`, `src/components/views/ChatView.tsx`, `src/components/chat/ChatInputBar.tsx`, `run-all-tests.js`.
- **Quyết định 200 (2026-11-25):** **Đồng Bộ Toàn Diện Backend ↔ Frontend Single Source of Truth (Chặng 1) & Kiến Trúc 4 Banner Không Gian Mở Tương Tác (Chặng 2):**
    - *Chặng 1 — Đồng Bộ Backend ↔ Frontend:*
      1. **Hydration Khởi Động (`app/_layout.tsx`):** Nạp đầy đủ `loadBudget`, `loadTransactions`, `loadGamificationState`, `initializeCategories`, `loadItems` ngay khi app khởi động.
      2. **Zero Double-Counting (`JournalView.tsx`, `ChatView.tsx`):** Gỡ bỏ `recordExpense` thừa sau `addTransaction`/`deleteTransaction` (vì `transactionStore` đã tự tính lại ngân sách).
      3. **Bảo Toàn State & Chuỗi Streak Single Source of Truth (`gamificationStore.ts`, `transactionStore.ts`):** Dùng `persistGamificationState` cho `addFep()`/`setStreakDays()` để không xóa mất key game/vườn; tự đồng bộ `calculateStreakDays(transactions)` vào `gamificationStore.streakDays` sau mọi thao tác giao dịch.
      4. **Chuẩn Hóa Key-Value (`budgetStore.ts`, `authStore.ts`, `dataBackupService.ts`, `SettingsView.tsx`, `StatsView.tsx`, `PixelHubDashboard.tsx`):** Persist `favUnit`/`updateGoalSettings`/`recordSavedMoney`, thêm Guest Sync Guard và sửa trừ lặp `monthlyFixedCosts`; đồng bộ `user.full_name` trong `updateProfile()`; thống nhất key mục tiêu `'vi_locket_goals_list'` và backup đủ store; thống nhất cờ ẩn tiền `'vi_locket_mask_money'` toàn app; sửa slug danh mục `'mua_sam'`/`'di_chuyen'` ở `StatsView`; dọn sạch toàn bộ key khi Reset.
      5. **Supabase Parity (`offlineSync.ts` & `006_sync_parity_columns.sql`):** Đồng bộ đủ 10 cột còn thiếu (`media_type`, `is_squad_private`, `receipt_data`, `sentiment_rating`, `desc_position`, `lat`, `lng`, `location_name`, `district`, `thumbnail_url`), mở rộng `transactions_source_check` và thêm `UNIQUE(user_id)` cho `financial_settings`.
    - *Chặng 2 — 4 Banner Không Gian Mở Tương Tác (`pixelOpenRoomEngine.ts`):*
      - Nâng cấp đồng bộ cả 4 banner (`CafeChatBannerWebView`, `ProfileDeskBanner`, `EntertainmentBannerWebView`, `BenThanhStreetBannerWebView`) bằng 1 engine chung: chạm sàn để heo bước đi (`Tap-to-Walk`), chạm đồ vật để heo tự bước lại thực hiện Action kèm hoạt ảnh pixel + bong bóng thoại + Haptics gắn dữ liệu thật từ Store (không tự chuyển trang), và tự dạo chơi khi rảnh.
    - *Tài Liệu Đồng Bộ:* `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `app/_layout.tsx`, `src/store/*`, `src/services/*`, `src/components/pixel/pixelOpenRoomEngine.ts`, 4 Banner WebViews, `supabase/migrations/006_sync_parity_columns.sql`, `run-all-tests.js`.
- **Quyết định 201 (2026-11-25):** **4 Banner Thế Giới Mở 2D Văn Hóa Việt Nam & Camera Lia 4 Hướng (`camX`, `camY`, Deadzone Smooth Follow, Drag-to-Pan):**
    - *Bối Cảnh & Yêu Cầu Người Dùng:* Mỗi banner là một vùng không gian 2D rộng thực thụ (`worldWidth > viewWidth` và `worldHeight > viewHeight`) đậm nét văn hóa Việt Nam (nhà sàn, quạt trần, cà phê phin/cà phê bệt, xe bánh mì, phở, nón lá, xích lô, xe buýt/xe máy Việt Nam, Chợ Bến Thành, Bitexco, Landmark 81); khi chú heo đi sát mép trái/phải/trên/dưới thì camera tự động lia mượt sang khu vực tiếp theo, hỗ trợ cả vuốt kéo xem trước bản đồ.
    - *Giải Pháp Kỹ Thuật:*
      1. **Engine 2D Open-World (`pixelOpenRoomEngine.ts`):** Bổ sung `camX`, `camY`, Deadzone Smooth Follow (~28% biên khung), phân biệt Chạm (`Tap-to-Walk`) vs Kéo (`Drag-to-Pan`, giữ góc nhìn 2.5s), và mũi tên chỉ hướng biên (`◄`, `►`, `▲`, `▼`) báo hiệu còn cảnh mở rộng.
      2. **4 Bản Đồ 2D Văn Hóa Việt Nam:** `CafeChatBannerWebView` (`360×184` trên viewport `144×96`), `ProfileDeskBanner` (`420×160` trên viewport `176×80`), `EntertainmentBannerWebView` (`460×168` trên viewport `192×88`), `BenThanhStreetBannerWebView` (`584×172` trên viewport `192×100`).
    - *Tài Liệu Đồng Bộ:* `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/pixel/pixelOpenRoomEngine.ts`, 4 Banner WebViews, `run-all-tests.js`.
- **Quyết định 202 (2026-11-25):** **Tái Thiết Kế Toàn Diện Tab Khám Phá — Panorama 16-Bit Việt Nam Liền Mạch 100% (`540×112`) & Chống Che Bottom Bar:**
    - *Bối Cảnh & Yêu Cầu Người Dùng:* Banner Tab Khám phá trước đây ghép 2 cánh phẳng vào khung `192×88` gây vết cắt dọc, lệch màu trời/vạch đường và cắt cụt xe cộ; đồng thời 2 thẻ game `Heo bay` & `Qua đường` bị thanh Bottom Bar che sát phần `Đã kiếm: 0 cám`.
    - *Giải Pháp Kỹ Thuật:*
      1. **Single-Canvas Seamless Panorama `540×112` (`EntertainmentBannerWebView.tsx`):** Xóa bỏ hoàn toàn kiến trúc ghép cánh; vẽ toàn bộ 5 khu phố Việt Nam (Phố Cổ Quán Phở ➔ Tiệm CAFE Mái Sọc & Xe Bánh Mì ➔ Chợ Bến Thành & Nhà Thờ Đức Bà ➔ Đại Lộ Bitexco & Landmark 81 ➔ Nhà Sàn Gỗ & Bến Sông Sài Gòn) trên **1 offscreen canvas duy nhất `540×112`** với 1 dải trời, 1 đường chân trời skyline, 1 vỉa hè lát gạch và 1 đại lộ 2 làn liền mạch suốt 540px.
      2. **Tự Động Đổi 3 Sắc Trời Theo Giờ (`getTimePalette`):** Sáng nắng xanh mây trắng (lấy cảm hứng 16-bit tươi sáng), Chiều hoàng hôn vàng hồng, Tối đèn phố & cửa sổ sáng ấm.
      3. **Tinh Chỉnh Bố Cục `PixelHubDashboard.tsx`:** Thu gọn khoảng cách dọc và tăng `paddingBottom: 120` để 2 thẻ game nằm trọn phía trên `FloatingPillTabBar` không bị che chữ.
    - *Tài Liệu Đồng Bộ:* `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/EntertainmentBannerWebView.tsx`, `src/components/chat/PixelHubDashboard.tsx`, `run-all-tests.js`.
- **Quyết định 203 (2026-11-25):** **Quán Cà Phê Sài Gòn Liền Mạch `432×128`, Công Thức Diện Tích Không Gian Phòng & Cửa Liên Thông 2 Chiều Với Tab Khám Phá:**
    - *Công Thức Diện Tích Không Gian Phòng Quán Cà Phê:* Viewport `144×96` (3:2); Thế giới nội thất `W_world = 3 × W_view = 432px`, `H_world = 4/3 × H_view = 128px` (tổng `55,296 px²`, gấp `4×` diện tích khung nhìn). Trục cao `128px` chia 4 tầng chuẩn: Trần/Đèn/Quạt (`0..16`, 12.5%), Tường chính & Nội thất đứng (`16..74`, 45.3%), Len chân tường (`74..78`, 3.1%), Sàn gạch bông Sài Gòn đi lại được (`78..128`, 39.1%, `walkBounds.y: 82..120`). Trục ngang `432px` chia 4 phân khu liên thông không vết ghép: (1) Quầy Bar & Cà Phê Phin (`0..112`), (2) Bàn Heo & Heo AI + Cửa sổ 3 sắc trời + Quạt trần (`112..240`), (3) Góc Đọc Sách + Ghế bành + Cây Thông trang trí (`240..344`), (4) Cửa Kính `RA PHỐ` (`344..432`).
    - *Cổng Liên Thông 2 Chiều & Auto-Hide Bubbles:* Người dùng chạm trực tiếp vào tiệm `CAFE` trên Banner Tab Khám phá (`EntertainmentBannerWebView` → `onEnterCafe`) hoặc thẻ `Heo AI` để bước vào Quán Cà Phê; trong Quán chạm `Cửa Ra Phố` (`exit_door` → `onExitToHub`) để chú heo bước tới cửa và quay về Tab Khám phá. Bong bóng thoại Heo AI tự ẩn khi chú heo đi sang các khu khác ngoài bàn trung tâm.
    - *Tài Liệu Đồng Bộ:* `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/CafeChatBannerWebView.tsx`, `src/components/chat/EntertainmentBannerWebView.tsx`, `src/components/chat/PixelHubDashboard.tsx`, `src/components/views/ChatView.tsx`, `run-all-tests.js`.
- **Quyết định 204 (2026-11-25):** **Tiệm CAFE Ngoại Thất 1:1 Theo Reference, Sàn Gạch Bông Indochine 16×16 Chuẩn Pixel & Cổng Vào Siêu Tốc (`fastDash` 300ms):**
    - *Cổng Vào Siêu Tốc (`pixelOpenRoomEngine.ts` + `EntertainmentBannerWebView.tsx`):* Bổ sung thuộc tính `fastDash: true` cho các hotspot chuyển cảnh (`saigon_cafe`, `exit_door`); khi người dùng chạm vào tiệm CAFE trên Banner Khám phá, chú heo lập tức lướt nhanh (`160 px/s`) tới trước cửa tiệm và chuyển vào quán sau `300ms` (không còn phải đợi đi bộ chậm 5–8 giây), kèm badge nhỏ `[☕ Vào quán]` nổi bật.
    - *Ngoại Thất Tiệm CAFE 1:1 (`EntertainmentBannerWebView.tsx`):* Tái hiện chuẩn theo hình mẫu Reference Senior Designer: mặt tiền kem/cam ấm 2 tầng, bảng hiệu `CAFE` nổi bật, mái hiên sọc canvas xanh-trắng, cửa kính lớn có vệt phản chiếu chéo, bàn tròn vỉa hè có 2 người ngồi uống cà phê, cửa chính gỗ trắng 2 cánh, khối phụ cửa sổ vòm có 2 bạn đứng trò chuyện, cây tùng xoắn ốc pastel trong bồn gạch, cột đèn đường chỉ hướng và bảng phấn menu chữ A.
    - *Sàn Gạch Bông Indochine 16×16 & Nội Thất Đồng Bộ (`CafeChatBannerWebView.tsx`):* Thay thế mảng gạch dấu cộng lệch tọa độ bằng lưới gạch bông Indochine Sài Gòn `16×16` căn chỉnh chính xác từ chân tường lambris gỗ (`y = 78`), hoa văn 8 cánh cổ điển phối xanh ngọc cổ vịt (`#4A8A80`) & đất nung (`#C4603A`) trên nền men kem (`#F7EED8`); đồng bộ toàn bộ tỷ lệ tường, quầy bar, góc đọc sách và cây thông với sprite heo `24×20`.
    - *Tài Liệu Đồng Bộ:* `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/pixel/pixelOpenRoomEngine.ts`, `src/components/chat/EntertainmentBannerWebView.tsx`, `src/components/chat/CafeChatBannerWebView.tsx`, `run-all-tests.js`.
- **Quyết định 205 (2026-11-25):** **Không Gian Chợ Bến Thành (Ngoại Thất Cửa Nam + Nội Thất 3 Phân Khu Pixel Art 10YOE) & Cổng Liên Thông 2 Chiều Với Quán Quen:**
    - *Ngoại Thất Cửa Nam & Cổng Vào Siêu Tốc (`BenThanhStreetBannerWebView.tsx` + `PiggySpendMapView.tsx`):* Nâng cấp mặt tiền Cửa Nam Chợ Bến Thành theo Ảnh 2 (tháp đồng hồ chữ `"CHỢ BẾN THÀNH"`, cổng vòm sâu, 4 chậu bonsai tỉa tầng, vạch sang đường & xe máy qua lại); chạm vào cổng vòm (`ben_thanh_gate`, `fastDash: true`) để chú heo lướt nhanh vào lòng chợ trong `≤ 300ms`.
    - *Nội Thất Lòng Chợ 576×144 (`BenThanhMarketBannerWebView.tsx` + `BenThanhMarketView.tsx`):* Thế giới mở 2D liền mạch (viewport `192×112`) với trần vòm giàn thép vàng ô lấy sáng trời, quạt trần xanh & đèn tuýp huỳnh quang, chia 4 phân khu: (1) Sạp Vải, Túi Xách & Nón Lá `"HƯƠNG TRINH"` (Ảnh 1), (2) Sạp Thủ Công Mỹ Nghệ & Đồ Lưu Niệm đèn LED ấm (Ảnh 3), (3) Sạp Trái Cây Nhiệt Đới `"1029 NGỌC HẢO"` tháp bưởi/xoài/thanh long/sầu riêng (Ảnh 4), (4) Cổng Ra Quán Quen (`exit_market`, `fastDash: true`). Bên dưới hiển thị 3 chip nhảy tới từng khu sạp và thẻ thống kê chi tiêu thật từ `useTransactionStore` (Zero-Hardcode).
    - *Tài Liệu Đồng Bộ:* `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/PixelHubDashboard.tsx`, `src/components/chat/BenThanhStreetBannerWebView.tsx`, `src/components/chat/PiggySpendMapView.tsx`, `src/components/chat/BenThanhMarketBannerWebView.tsx`, `src/components/chat/BenThanhMarketView.tsx`, `src/components/views/ChatView.tsx`, `run-all-tests.js`.
- **Quyết định 206 (2026-11-26):** **Sửa Lỗi Engine Canvas `psCv` Ở Tab Quán Quen & Mở Cổng Chợ Bến Thành Từ Cả Tab Khám Phá Lẫn Tab Quán Quen:**
    - *Sửa Lỗi Engine `BenThanhStreetBannerWebView.tsx`:* Đồng bộ `canvasId: 'psCv'` khớp với `<canvas id="psCv">`, đổi `touch-action: none` để vuốt kéo 2D mượt mà trên mobile/web, và đặt `PB.camX = 185` khi khởi tạo để Cổng Cửa Nam Chợ Bến Thành hiện ngay chính giữa khi mở Tab Quán quen.
    - *Cổng Chợ Bến Thành Từ Banner Tab Khám Phá (`EntertainmentBannerWebView.tsx` + `PixelHubDashboard.tsx` + `ChatView.tsx`):* Bổ sung `onEnterMarket` + `fastDash: true` cho hotspot `ben_thanh_notre` trên Banner Tab Khám phá; lưu trạng thái `marketReturnSubView` (`'hub'` hoặc `'map'`) trong `ChatView.tsx` để nút `[←]` / `Ra phố` quay về đúng Tab trước đó.
    - *Tài Liệu Đồng Bộ:* `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/BenThanhStreetBannerWebView.tsx`, `src/components/chat/EntertainmentBannerWebView.tsx`, `src/components/chat/PixelHubDashboard.tsx`, `src/components/views/ChatView.tsx`, `run-all-tests.js`.
- **Quyết định 207 (2026-11-26):** **Tài Liệu Master Blueprint 6 Banner Không Gian Mở (`docs/PIXEL_OPEN_WORLD_SPEC.md`), Engine Trượt Camera Giữ Góc Nhìn 3s & Chặng 1: Phố Lễ Hội Ẩm Thực Quán Quen (`584×160`):**
    - *Master Blueprint (`docs/PIXEL_OPEN_WORLD_SPEC.md`):* Chuẩn hóa công thức diện tích (`W_world ≥ 2.75×W_view`, `H_world ≥ 1.25×H_view`, 4 tầng trục Y), quy chuẩn vẽ 10YOE 3 lớp chiều sâu (Nền xa ➔ Kiến trúc có bóng tiếp xúc ➔ Tiền cảnh sống), 3 sắc trời theo giờ (Sáng/Chiều/Tối), và bảng quy hoạch chi tiết toàn bộ 6 Banner + Lòng Chợ Bến Thành (đồng bộ ngược vào `00-INDEX.md`, `04-HOME-GARDEN.md`, `10-CHAT.md`, `11-PROFILE-SETTINGS.md`, `13-HOUSE-OF-PIG.md`).
    - *Cơ Chế Trượt Camera 2D Mượt (`pixelOpenRoomEngine.ts`):* Nâng thời gian giữ góc nhìn khi buông tay kéo từ `2500ms` lên `3000ms` (`panHoldUntil = performance.now() + 3000`), thêm trạng thái con trỏ `grab`/`grabbing` và giữ `touch-action: none` để vuốt mượt 4 hướng trên mọi Banner.
    - *Chặng 1 — Phố Lễ Hội Ẩm Thực 2 Bên Đường (`BenThanhStreetBannerWebView.tsx`, `584×160`):* Mở rộng thế giới dọc lên `160px`, đồng bộ 3 sắc trời theo giờ, giăng dây đèn lồng Hội An 584px, dựng 8 sạp quán ăn 2 bên trái/phải Cổng Cửa Nam Chợ Bến Thành cùng du khách đứng lựa món (vỉa hè trên) và ngồi ăn bàn ghế nhựa xanh/đỏ (hàng quán dưới).
    - *Tài Liệu Đồng Bộ:* `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/DECISIONS.md`, `docs/screens/heocon/*`, `src/components/pixel/pixelOpenRoomEngine.ts`, `src/components/chat/BenThanhStreetBannerWebView.tsx`, `run-all-tests.js`.
- **Quyết định 208 (2026-11-26):** **Tái Thiết Kế Lòng Chợ Bến Thành (`680×152`) Bám Sát 1:1 7 Ảnh Thực Tế Từ Cửa Số 1 Vào Khu Ăn Uống:**
    - *Kiến Trúc & Sàn Chợ (`BenThanhMarketBannerWebView.tsx`):* Nâng kích thước thế giới lên `680×152` (khung nhìn `192×112`), dựng mái vòm bê tông vàng + ô giếng trời đỏ nâu + chao đèn mây tre đan + quạt lồng sắt + sàn gạch nâu đất có 2 dải dẫn hướng nâu đỏ sẫm. Bắt đầu ngay tại `Cửa Số 1` (`initialCamX = 0, initialX = 82`).
    - *4 Phân Khu Thực Tế & Chữ Pixel Micro-Font 3×5 (`pxText`):* (1) `CUA SO 1` + LED `WELCOME TO BEN THANH` + cửa sắt xếp & 2 bảo vệ (`exit_market` `fastDash`), (2) Sạp trà cà phê `LIEN SAI GON` & `NGOC HOA`, (3) Cổng vòm cong `KHU AN UONG` + quầy chữ L gạch trắng `Sạp 1044` với ghế đẩu inox & dừa tươi, (4) Quầy `BANH CUON 50K`, `BUN BO HUE` & `BANH BEO 20K` mặt bàn đá mài vàng & nem chua lá chuối.
    - *Tài Liệu Đồng Bộ:* `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/BenThanhMarketBannerWebView.tsx`, `src/components/chat/BenThanhMarketView.tsx`, `run-all-tests.js`.
- **Quyết định 209 (2026-11-26):** **Sửa Lỗi Crash Frame 1 Dòng 479, Xóa Card Chữ Thừa & Nâng Cấp Chợ Bến Thành Full-Focus 60fps (`680×176`):**
    - *Sửa Lỗi Gốc (`BenThanhMarketBannerWebView.tsx`):* Sửa `R(x-sp,57,...)` ➔ `R(x,fx-sp,57,...)` trong `drawLiveMarketEffects` (nguyên nhân làm `mkDraw` ném `TypeError` trước khi vẽ chú heo và `requestAnimationFrame`), đồng thời bọc `try/catch` bảo vệ vòng lặp render.
    - *Không Gian Full-Focus 60fps (`680×176` / Viewport `192×136`):* Xóa sạch `zoneCard`, `statsCard` và `toastRow` ở `BenThanhMarketView.tsx`, mở rộng khung Chợ Bến Thành chiếm trọn trọng tâm màn hình + 1 hàng chip ngang 4 khu ở đáy; bổ sung `drawWalkingShoppers` (du khách đi dạo chợ 2 chiều Y-sorted với chú heo `24×20`), bóng đổ tiếp xúc, và quầng sáng ấm quanh đèn mây tre, bảng LED & tủ kính Khu Ăn Uống.
    - *Tài Liệu Đồng Bộ:* `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/BenThanhMarketBannerWebView.tsx`, `src/components/chat/BenThanhMarketView.tsx`, `run-all-tests.js`.
- **Quyết định 210 (2026-11-26):** **Đại Tu Đồ Họa Lòng Chợ Bến Thành 16-Bit 2.5D Có Chiều Sâu 4 Lớp (`720×280` trên Viewport `208×240` Pixel Vuông 1:1):**
    - *Triệt Tiêu Biến Dạng Dọc (`BenThanhMarketBannerWebView.tsx`):* Nâng độ phân giải khung nhìn lên `208×240` khớp `aspectRatio: 208 / 240` để 100% hạt pixel là hình vuông 1:1, chú heo `24×20` không còn bị kéo dài.
    - *4 Lớp Chiều Sâu 2.5D & Sprite Nhân Vật `14×22` (`drawPerson16Bit`):* Mái vòm bê tông cong + tia nắng giếng trời + đèn mây tre đan nan (`drawRattanLamp`); 4 khu sạp 3D chi tiết từng món ăn/hũ trà/nồi nước lèo/cửa sắt xếp mắt cáo (`drawAccordionGate`) + hậu cảnh sạp Áo dài; và **4 Đảo Giữa Chợ Y-Sorted (`drawForegroundIslands`)** ở nửa dưới sàn (Đảo Lưu Niệm, Đảo Trái Cây `1029 Ngọc Hảo`, 2 Đảo Bàn Ăn Khu Ẩm Thực) lấp đầy không gian sinh động.
    - *Tài Liệu Đồng Bộ:* `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/BenThanhMarketBannerWebView.tsx`, `run-all-tests.js`.
- **Quyết định 211 (2026-11-26):** **Chợ Bến Thành Toàn Màn Hình RPG (`1024×360`), 2 Cổng Trước/Sau (`Cửa Số 1` & `Cửa Bắc`), Dynamic 1:1 Square Pixel & Tấp Nập Khách Du Lịch Nước Ngoài:**
    - *Fullscreen 100% (`BenThanhMarketView.tsx` + `ChatView.tsx`):* Xóa hoàn toàn khung banner bo viền, thanh header, chữ `"Ra phố"` và thanh chip đáy; mở rộng toàn màn hình `100% × 100%` giống game RPG, chỉ giữ 1 nút tròn nhỏ `[←]` bán trong suốt góc trên trái.
    - *Dynamic 1:1 Responsive Engine (`pixelOpenRoomEngine.ts`):* Thêm `window.__openRoom.resize(vw, vh)` để tự tính độ phân giải pixel vuông 1:1 lấp kín mọi tỷ lệ màn hình mà không bị kéo méo.
    - *Đại Thế Giới `1024×360` & 2 Cổng Ra (`BenThanhMarketBannerWebView.tsx`):* 2 cổng ra ngoài `fastDash: true` (`exit_market` Cửa Số 1 ở trái & `exit_back_gate` Cửa Bắc ở phải), 6 khu sạp phía trên (thêm Sạp Quần Áo `HƯƠNG TRINH`), 5 Đảo Giữa Chợ Y-Sorted (thêm Đảo Hoa Tươi & Gốm Sơn Mài), 2 hành lang song song, và 20+ nhân vật gồm cả du khách nước ngoài (tóc vàng/balo/kính râm/máy ảnh) & người Việt ăn uống, mua sắm tấp nập.
    - *Tài Liệu Đồng Bộ:* `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/pixel/pixelOpenRoomEngine.ts`, `src/components/chat/BenThanhMarketBannerWebView.tsx`, `src/components/chat/BenThanhMarketView.tsx`, `src/components/views/ChatView.tsx`, `run-all-tests.js`.
- **Quyết định 212 (2026-11-26):** **Tái Thiết Kế Toàn Diện Chợ Bến Thành Chuẩn 32-Bit Indie Game (`1200×480`), Kiến Trúc Mô-Đun, 3 Dãy Sạp Dày Đặc & Hệ Thống Va Chạm AABB:**
    - *Kiến Trúc Mô-Đun (`src/components/chat/market/`):* Tách 4 module chuyên biệt: `marketPalette.ts` (bảng màu ấm 32-bit, dithering, bevel & bóng tiếp xúc), `marketArchitecture.ts` (2 cổng vòm thuộc địa Cửa Số 1 & Cửa Bắc có phố Sài Gòn thật bên ngoài, sàn gạch `16×16` có biến thể & rãnh thoát nước, mái vòm kèo thép & tia nắng xiên), `marketStalls.ts` (3 dãy sạp dày đặc không lặp lại: Dãy Bắc 4 cụm sạp + 2 cổng, Dãy Đảo Trung Tâm gồm Trái cây `1029`, Rau củ/Thịt/Hải sản đá lạnh, Bàn ăn 1, Lưu niệm/Gốm/Nón lá; Dãy Nam gồm Nước mía/Dừa, Chè/Bánh dân gian, Bàn ăn 2, Hoa tươi/Gia dụng), và `marketCrowd.ts` (nhân vật đa dạng, nhóm đứng nói chuyện, người bán hàng, khách Tây/Việt đi bộ 2 chiều).
    - *Hệ Thống Va Chạm AABB (`pixelOpenRoomEngine.ts`):* Thêm `obstacles` vào `OpenRoomConfig` với thuật toán tách trục X/Y để chú heo `24×20` đi lại dọc lối đi và trượt mượt quanh các sạp hàng.
    - *Tài Liệu Đồng Bộ:* `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/pixel/pixelOpenRoomEngine.ts`, `src/components/chat/market/*`, `src/components/chat/BenThanhMarketBannerWebView.tsx`, `run-all-tests.js`.
- **Quyết định 213 (2026-11-26):** **Cổng Vòm Tròn Nằm Dọc Hai Đầu Giấu Không Gian Ngoài, Chuyển 2 Cửa Cũ Thành Shop Áo Dài & Quần Áo (7 Shop Bắc Kín Ngang) Và 6+6 Hàng Quán Trung Tâm Sát Kề (`1200×480`):**
    - *2 Cổng Vòm Tròn Dọc Hai Đầu (`marketArchitecture.ts` `drawSideArchGate`):* Thay thế 2 cổng ngang lộ phố trên tường Bắc bằng 2 cổng vòm tròn tường vàng kem Chợ Bến Thành đặt dọc cuối hành lang Trái (`x: 0..72`, `CUA NAM`) & Phải (`x: 1128..1200`, `CUA BAC`), lòng vòm tối ấm giấu kín không gian bên ngoài, kèm thảm đỏ và bảo vệ đứng gác.
    - *7 Shop Bắc Bao Phủ Kín Ngang (`marketStalls.ts`):* Chuyển Cửa 1 cũ thành `AO DAI SAI GON` (giữ 4 tà áo dài + tủ `WATCH`), chuyển Cửa Bắc cũ thành `THOI TRANG SAI GON`, nối liền 7 shop sát vách nhau (`x: 74..1126`, cách cột 4px).
    - *12 Hàng Quán Trung Tâm & Tầng Nam Sát Kề (`6 + 6`):* Tăng mật độ từ 4+4 lên 6 đảo trung tâm (`y: 230..290`) và 6 sạp tầng Nam (`y: 374..434`) sát kề nhau (khe hẻm đi bộ 20px), cập nhật `obstacles` & `hotspots` trong `BenThanhMarketBannerWebView.tsx`.
    - *Tài Liệu Đồng Bộ:* `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/market/marketArchitecture.ts`, `src/components/chat/market/marketStalls.ts`, `src/components/chat/BenThanhMarketBannerWebView.tsx`, `run-all-tests.js`.
- **Quyết định 214 (2026-11-26):** **Nâng Cấp Chất Lượng Đồ Họa Chợ Bến Thành Lên Chuẩn Indie 32-Bit (Mái Hiên Vải Sọc 3D, Cụm Hàng Hóa Chi Tiết, Sàn Đa Sắc & Nhân Vật Đổ Bóng 3/4):**
    - *Mái Hiên & Cụm Hàng Hóa (`marketPalette.ts` + `marketStalls.ts`):* Thêm bộ helper `drawStripedAwning`, `drawPitchedCanopy`, `drawWoodenCrate`, `drawBambooBasket`, `drawHangingLantern`, `drawCeramicVase`, `drawFabricStack` để mọi sạp đều có mái hiên vải sọc đổ bóng, vân gỗ, cân đồng hồ, thùng carton, giỏ tre đầy ắp nông sản/hàng hóa không trùng lặp.
    - *Sàn & Mật Độ Lối Đi (`marketArchitecture.ts` + `BenThanhMarketBannerWebView.tsx`):* Nền gạch đá ấm có vân nứt/mòn tự nhiên, thu gọn khoảng trống sàn giữa 3 tầng (`y: 174..226` và `y: 298..354`), giữ nguyên 2 cổng vòm dọc `CUA NAM` / `CUA BAC` và va chạm AABB.
    - *Nhân Vật & Không Khí Chợ (`marketCrowd.ts`):* Nâng cấp `drawPerson16Bit` với khối tóc, tạp dề, balo, máy ảnh, túi xách, bóng nền mềm và 14+ khách đi bộ 2 chiều + khách đứng trò chuyện.
    - *Tài Liệu Đồng Bộ:* `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/market/*`, `src/components/chat/BenThanhMarketBannerWebView.tsx`, `run-all-tests.js`.
- **Quyết định 215 (2026-11-26):** **Xóa Mảng Màu Nâu 2 Bên Rìa Banner, Thu Gọn 2 Cổng Vòm Sáng Ấm Ở Làn Giữa, Bổ Sung Sạp Báo Chí/Giấy Tờ & Đồ Cúng/Nhang Đèn, Bố Cục So Le Chen Lấn Chuẩn Vietnamese Design Art (`1200×480`):**
    - *Xóa Mảng Nâu 2 Rìa (`marketArchitecture.ts`):* Loại bỏ hoàn toàn khối hộp nâu đen cao `286px` ở 2 bên mép; thu gọn `drawSideArchGate` thành 2 cổng vòm tròn vàng kem gọn ở làn đi giữa (`y: 266..358`, `x: 0..44` trái & `x: 1156..1200` phải) có ánh sáng vàng ấm hắt vào sàn, giải phóng 4 góc trên/dưới cho sạp góc.
    - *Bố Cục So Le Tự Nhiên & Đủ Nhóm Hàng Văn Hóa Việt (`marketStalls.ts`):* 9 shop Bắc kín suốt `x: 0..1200` (thêm `BAO CHI - GIAY TO` & `DO CUNG - NHANG DEN`), 7 cụm trung tâm và 8 cụm Nam so le nhô/thụt `±8..14px` (thêm `HOA CUC - NHANG`, `TAP HOA - BAO`, `DEP LAO QUAN AO`, sạp cóc & thúng rổ bày sát mép lối đi).
    - *Đông Đúc Chen Lấn 34+ Nhân Vật (`marketCrowd.ts`):* 22 khách đi bộ ngược chiều xen kẽ tốc độ + 12+ người bán/khách mặc cả/du khách ngồi ăn; đồng bộ `obstacles` & `hotspots` trong `BenThanhMarketBannerWebView.tsx`.
    - *Tài Liệu Đồng Bộ:* `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/market/*`, `src/components/chat/BenThanhMarketBannerWebView.tsx`, `run-all-tests.js`.
- **Quyết định 216 (2026-11-26):** **Chợ Bến Thành Siêu Đông 140+ Người (Sprite Cache 60fps + Frustum Culling), 2 Cổng Siêu Gọn `22×58px`, ~34 Sạp/Quầy Cóc Chật Chội & Món Ăn Chi Tiết Chuẩn `pixel-mascot-ui` (`shape4`, `mk`, `mulberry32`):**
    - *Công Thức `pixel-mascot-ui` (`marketPalette.ts`):* Tích hợp `mk(w, h, fn)`, `mulberry32(seed)` và `shape4(c, rows, fill, ox, oy)` (viền nâu mực 4 hướng tự động) để vẽ món ăn có chiều sâu 3 sắc độ: `drawPhoBowl`, `drawBanhCuonPlate`, `drawSeafoodTray`, `drawFruitPyramid`, `drawStreetVendorCart`.
    - *2 Cổng Ra Vào Siêu Gọn `22×58px` (`marketArchitecture.ts`):* Thu hẹp tối đa 2 cổng vòm tròn xuống `22px` rộng × `58px` cao tại `y: 280..338` sát mép trái/phải.
    - *~34 Sạp & Quầy Cóc Siêu Chật Chội (`marketStalls.ts`):* Bổ sung `drawExtraMicroStalls` chèn 10 quầy cóc, gánh hàng rong, xe bánh mì, bàn nhựa thấp và thúng hàng vào các khoảng hở.
    - *Biển Người 140+ Nhân Vật 60fps (`marketCrowd.ts` + `BenThanhMarketBannerWebView.tsx`):* Cache 20 biến thể nhân vật × 2 frame bằng `mk(18, 24, ...)`, dùng `mulberry32(21600)` sinh 100 khách đi bộ chen lấn + ~40 tiểu thương/khách mặc cả/ngồi ăn, vẽ qua `drawImage` + Frustum Culling (`camX, VW`) cùng vầng sáng kem nhẹ dưới chân Heo Con.
    - *Tài Liệu Đồng Bộ:* `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/market/*`, `src/components/chat/BenThanhMarketBannerWebView.tsx`, `run-all-tests.js`.
- **Quyết định 217 (2026-11-26):** **Mở Rộng Chợ Bến Thành Thành Mê Cung 6 Hàng Sạp (`1200×760`), 180 Người Chen Chúc 60fps & Cơ Chế Chú Heo Ngộp Thở Tự Chạy Ra Sát Cổng Đứng Thở:**
    - *6 Hàng Sạp Chật Chội (`marketStalls.ts` + `marketArchitecture.ts`):* Nâng kích thước thế giới lên `1200×760`, xếp 6 hàng sạp san sát (`drawNorthStalls`, `drawRow2Stalls`, `drawRow3Stalls`, `drawRow4Stalls`, `drawRow5Stalls`, `drawRow6Stalls`, `drawExtraMicroStalls`) với hẻm đi bộ hẹp ~28px và 2 cổng siêu gọn `22×58px` đặt tại giữa chiều cao chợ (`y: 350..408`).
    - *Biển Người ~180 Nhân Vật 60fps (`marketCrowd.ts`):* 140 khách đi bộ 2 chiều khắp 6 hẻm bằng `mulberry32(21700)` + ~40 tiểu thương/khách ngồi ăn, dùng Sprite Cache `mk(18, 24)` + Frustum Culling.
    - *Hành Vi Heo Ngộp Thở (`stuffyState` trong `BenThanhMarketBannerWebView.tsx` + `countNearbyCrowd`):* Khi Heo đứng chen giữa đám đông trong hẻm sâu ~8–10 giây, Heo đổ giọt mồ hôi xanh pixel + kêu ngộp thở rồi tự chạy vọt ra sát cổng gần nhất đứng thở phì phò (không tự thoát màn hình; chỉ ra phố khi người chơi chạm cổng).
    - *Tài Liệu Đồng Bộ:* `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/market/*`, `src/components/chat/BenThanhMarketBannerWebView.tsx`, `run-all-tests.js`.
- **Quyết định 218 (2026-11-26):** **Nâng Cấp Quán Cà Phê Sài Gòn (Tab Trò Chuyện Heo AI) Thành Không Gian Mini Coffee Workshop, Thư Viện 3 Kệ Sách & Góc Boutique Quần Áo (`720×176` / Viewport `180×120`):**
    - *Kiến Trúc Mô-Đun (`src/components/chat/cafe/cafeInteriorArt.ts` + `CafeChatBannerWebView.tsx`):* Mở rộng không gian quán từ `432×128` lên `720×176` (giữ nguyên tỷ lệ khung banner `1.5:1` để không che khung chat) với 6 phân khu liền mạch trên sàn gạch bông Indochine `16×16`: Quầy Bar cà phê phin có Barista làm việc, Khu bàn tròn/ghế bar/Bàn Heo AI, Thư viện 3 kệ sách cao + Sofa đọc sách, Bàn dài Mini Coffee Workshop (phin/pour-over), Góc Boutique bán quần áo + gương + Cây thông Noel + cây xanh, và Cửa kính 3 khung giờ ra phố Khám phá.
    - *Hoạt Cảnh Sống 60fps & Va Chạm AABB:* Bổ sung 3 quạt trần gỗ quay mượt, Barista nhún tay pha chế, 10+ khách ngồi thưởng thức cà phê/đọc sách/lựa quần áo, khói cà phê phin bay lên, Y-sorting lớp bàn ghế tiền cảnh và `obstacles` AABB.
    - *Tài Liệu Đồng Bộ:* `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/cafe/cafeInteriorArt.ts`, `src/components/chat/CafeChatBannerWebView.tsx`, `run-all-tests.js`.
- **Quyết định 219 (2026-11-26):** **Xây Dựng Không Gian Toàn Màn Hình Nội Thất Nhà Thờ Đức Bà Sài Gòn (`640×520`, Cổ Kính Châu Âu, Đèn Vàng Lung Linh & Cổng 2 Chiều Từ Tab Khám Phá):**
    - *Kiến Trúc Mô-Đun (`src/components/chat/cathedral/cathedralInteriorArt.ts` + `NotreDameCathedralBannerWebView.tsx` + `NotreDameCathedralView.tsx`):* Mặt bằng top-down 2.5D rộng ngang-dọc `640 × 520` (Dynamic 1:1 Square Pixel) tái hiện 3 ảnh thực tế: 3 tầng vòm Gothic-Romanesque gân vàng đất, 3 ô cửa kính màu stained-glass, Cung Thánh lung linh (bàn thờ, hoa trắng, nến, tượng Đức Mẹ, Thánh Giá, linh mục áo trắng), 2 chùm đèn pha lê vàng rực, 2 hành lang phụ cột vòm Châu Âu + quạt đứng, 2 cánh 8 hàng ghế gỗ đánh bóng với ~60 người dự lễ, lối đi chính lát gạch bóng phản chiếu ánh vàng và 45 hạt bụi vàng bay 60fps; va chạm AABB quanh Cung Thánh & 2 khối ghế gỗ.
    - *Cổng 2 Chiều Từ Tab Khám Phá (`EntertainmentBannerWebView.tsx` + `PixelHubDashboard.tsx` + `ChatView.tsx`):* Tách hotspot `notre_dame_gate` (`fastDash: true`) trên Nhà Thờ Đức Bà tháp đôi gạch đỏ mở Toàn Màn Hình Nhà Thờ Đức Bà, có cổng `exit_cathedral` ở đáy sảnh và nút `[←]` góc trên trái quay về Tab Khám phá.
    - *Tài Liệu Đồng Bộ:* `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/cathedral/cathedralInteriorArt.ts`, `src/components/chat/NotreDameCathedralBannerWebView.tsx`, `src/components/chat/NotreDameCathedralView.tsx`, `src/components/chat/EntertainmentBannerWebView.tsx`, `src/components/chat/PixelHubDashboard.tsx`, `src/components/views/ChatView.tsx`, `run-all-tests.js`.
- **Quyết định 220 (2026-11-26):** **Thay Nhà Sàn Bến Sông Bằng Ngôi Chùa Việt Nam Cổ Kính & Dựng Không Gian Toàn Màn Hình 2 Tầng Chánh Điện + Sân Chùa (`640×560`):**
    - *Ngoại Thất Ngôi Chùa (`EntertainmentBannerWebView.tsx` + `PixelHubDashboard.tsx` + `ChatView.tsx`):* Thay thế Khu 5 (`x: 440..540`, Nhà sàn bến sông cũ) bằng Bảo Tháp nhiều tầng mái đao cong đỏ-vàng, Cổng Tam Quan & cây bonsai; gắn hotspot `pagoda_gate` (`fastDash: true`) mở Toàn Màn Hình `PagodaTempleView`.
    - *Không Gian 2 Tầng `640×560` (`src/components/chat/pagoda/pagodaInteriorArt.ts` + `PagodaTempleBannerWebView.tsx` + `PagodaTempleView.tsx`):* Nửa trên là Chánh Điện (trần ô hoa sen mạ vàng, cột gỗ lim, Tượng Phật Thích Ca thếp vàng & hào quang, bàn thờ hoa lan/lư hương, Trống Bát Nhã, Đại Hồng Chung, nền đá bóng phản chiếu, Phật tử cúi lạy 60fps); nửa dưới là Sân Chùa (bậc tam cấp, Lư Hương Đồng Khổng Lồ nghi ngút khói trầm, Bảo Tháp mái cong, Lầu Trống, bonsai & Cổng Tam Quan `exit_pagoda`). Hỗ trợ tương tác Heo Con lễ Phật, thắp hương, thỉnh chuông & va chạm AABB.
    - *Tài Liệu Đồng Bộ:* `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/pagoda/pagodaInteriorArt.ts`, `src/components/chat/PagodaTempleBannerWebView.tsx`, `src/components/chat/PagodaTempleView.tsx`, `src/components/chat/EntertainmentBannerWebView.tsx`, `src/components/chat/PixelHubDashboard.tsx`, `src/components/views/ChatView.tsx`, `run-all-tests.js`.
- **Quyết định 221 (2026-11-26):** **Nâng Cấp Banner Panorama Tab Khám Phá Thành Đại Lộ Sài Gòn & Bến Bạch Đằng (`1160×128`, Viewport `224×108`, Skyline Xa Bitexco/Landmark 81, 7 Công Trình, 6 Loại Xe + CSGT Áo Vàng & Sông Bạch Đằng):**
    - *Kiến Trúc Mô-Đun (`src/components/chat/hub/saigonPanoramaArt.ts` + `EntertainmentBannerWebView.tsx`):* Nâng kích thước thế giới mở từ `540×112` lên `1160×128` (khung nhìn `224×108`, tỷ lệ `6.14×`), giữ 1 offscreen canvas liền mạch và tự động đổi 3 sắc trời theo giờ thực tế.
    - *Skyline Xa & 7 Công Trình Mặt Tiền:* Đẩy **Bitexco** và **Landmark 81** ra đường chân trời xa phía sau; bố trí 7 công trình dọc đại lộ (`x: 0..860`) gồm **Quán Phở**, **Tiệm Cà Phê** (`onEnterCafe`), **Cửa Hàng Quần Áo Adidas**, **Nhà Thờ Đức Bà** (`onEnterCathedral`), **Chợ Bến Thành** (`onEnterMarket`), **Sân Vận Động Thống Nhất**, và **Chùa Việt Nam** (`onEnterPagoda`).
    - *Giao Thông Việt Nam & Sông Bạch Đằng 60fps:* Đại lộ 2 làn xe chạy tấp nập với 6 loại phương tiện (xe máy, xe hơi, xe tải, xe buýt, xe container, xe cảnh sát nháy đèn xanh-đỏ) + **CSGT áo vàng** đứng bục vẫy gậy điều tiết; phân khu bên phải (`x: 860..1160`) là **Bến Bạch Đằng & Sông Sài Gòn** có **Cầu Đi Bộ**, **Cầu Ba Son** dây văng trắng và **tàu thuyền lớn** (tàu du lịch 2 tầng, Waterbus, sà lan) rẽ sóng chạy 60fps.
    - *Tài Liệu Đồng Bộ:* `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/hub/saigonPanoramaArt.ts`, `src/components/chat/EntertainmentBannerWebView.tsx`, `run-all-tests.js`.
- **Quyết định 222 (2026-11-26):** **Khôi Phục Hiển Thị Chú Heo Mascot `24×20` & Camera Lia 4 Hướng (`window.__openRoom`) + Phóng To Gấp ~1.8×–2× Toàn Bộ 6 Loại Xe, CSGT Áo Vàng & Tàu Thuyền Trên Đại Lộ `1200×164` (Viewport `224×116`):**
    - *Sửa Lỗi Root-Cause (`EntertainmentBannerWebView.tsx`):* Sửa sai tên biến `window.OPEN_ROOM_ENGINE` → **`window.__openRoom`** (`step(dt, now)`, `state`, `drawOverlays(ctx, now)`), khôi phục đầy đủ chú Heo Mascot `24×20` đi dạo khám phá phố, Drag-to-Pan 4 hướng, Deadzone Smooth Follow, mũi tên biên `◄ ► ▲ ▼` và 4 cổng nội thất `fastDash`.
    - *Mở Rộng Đại Lộ & Phóng To Xe Khổng Lồ (`saigonPanoramaArt.ts`):* Nâng kích thước thế giới lên `1200 × 164` (khung nhìn `224 × 116`, diện tích `7.58×`), vỉa hè rộng `y: 68..96`, đại lộ 2 làn rộng `68px` (`y: 96..164`); phóng to toàn bộ phương tiện (`moto 22×16`, `car 40×20`, `police 40×20`, `truck 52×24`, `bus 66×25`, `container 82×28`), CSGT áo vàng `12×22` và 3 tàu thuyền lớn (`54..78 × 20..24`) trên Sông Bạch Đằng.
    - *Tài Liệu Đồng Bộ:* `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/hub/saigonPanoramaArt.ts`, `src/components/chat/EntertainmentBannerWebView.tsx`, `run-all-tests.js`.
- **Quyết định 223 (2026-11-26):** **Mở Rộng 2 Bờ Sông Bến Bạch Đằng ↔ Thủ Thiêm (`1360×164`), Tách Biệt Cầu Đi Bộ & Cầu Ba Son Có Xe Lưu Thông + Đồng Bộ Heo 1:1 Tab Vườn Lái Xe Máy Đội Mũ Bảo Hiểm Tránh Va Chạm 0%:**
    - *Hai Bờ Sông & Hai Cây Cầu Riêng Biệt (`saigonPanoramaArt.ts`):* Mở rộng thế giới lên `1360 × 164` (viewport `224 × 116`, diện tích `8.59×`) với Bờ Tây Bến Bạch Đằng (`x: 856..896`) và Bờ Đông Công Viên Thủ Thiêm (`x: 1265..1360`). **Cầu Đi Bộ** (`y: 54..76`) bắc trọn 2 bờ chỉ cho người & Heo đi bộ; **Cầu Ba Son** (`y: 98..134`) nối trục đường dẫn đại lộ sang Thủ Thiêm cho xe máy, xe hơi, xe tải & Heo lái xe máy chạy 2 chiều, tàu thuyền lớn chạy dưới gầm cầu (`y: 134..164`).
    - *Đồng Bộ Heo 1:1 Tab Vườn, Lái Xe Máy & Tránh Va Chạm (`EntertainmentBannerWebView.tsx`):* Port 1:1 hàm `drawPigSprite` chuẩn `PixelGardenWebView.tsx` (hết dáng múp); bổ sung `drawPigOnMoto` (Heo đội mũ bảo hiểm lái xe máy trên phố & Cầu Ba Son, tự chuyển đi bộ khi lên vỉa hè/cửa hàng/Cầu Đi Bộ) và thuật toán tránh va chạm 2 lớp `stepTrafficSafe` đảm bảo 0% va chạm với mọi xe khác.
    - *Tài Liệu Đồng Bộ:* `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/hub/saigonPanoramaArt.ts`, `src/components/chat/EntertainmentBannerWebView.tsx`, `run-all-tests.js`.
- **Quyết định 224 (2026-11-26):** **Chuẩn Hóa Bộ Công Thức Pixel Art Việt Nam (`docs/VIETNAM_PIXEL_ART_BIBLE.md`) & Thư Viện Dùng Chung (`src/components/pixel/vnPixelArtKit.ts`) Từ `spritefusion-pixel-snapper` & `pixelium-design`:**
    - *Tài Liệu Chuẩn Gốc 6 Chương (`docs/VIETNAM_PIXEL_ART_BIBLE.md`):* Chắt lọc kỷ luật khóa lưới integer 1px, ngân sách 24–32 màu & Selective Outline từ `Hugo-Dz/spritefusion-pixel-snapper`; hệ màu cảm nhận đồng đều OKLab 3 khung giờ & kiến trúc mô-đun Kairosoft/Stardew từ `shika-works/pixelium-design`; chuẩn hóa **Thước Tỷ Lệ Vàng Việt Nam** (`1px ≈ 4cm`, neo theo Heo `24×20`), **Luật Đường Xá/Xe Cộ/Cầu/Người Đi Đứng & Zero-Collision**, kèm 4 Blueprint sẵn sàng code (Quán Phở Cổ Truyền `640×420`, Quán Cà Phê Sài Gòn `720×176`, SVĐ Thống Nhất `640×520` có trận bóng 60fps, Adidas Flagship `560×380`) và Checklist 10 tiêu chí nghiệm thu.
    - *Thư Viện Helper Dùng Chung (`src/components/pixel/vnPixelArtKit.ts`):* Xuất `VN_OKLAB_MATERIALS`, `VN_SCALE_STANDARDS` và `buildVnPixelKitPrimitivesScript()` (khóa lưới `R/E/mk/shape/linePx/mulberry32`, `getVnTimePalette`, `drawContactShadow`, `drawWheel`, `drawTileFloorIndochine`, `drawSteamPuff`, `drawPigSpriteCanonical` 1:1 Tab Vườn).
    - *Tài Liệu Đồng Bộ:* `docs/VIETNAM_PIXEL_ART_BIBLE.md`, `AGENTS.md`, `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/DECISIONS.md`, `src/components/pixel/vnPixelArtKit.ts`, `run-all-tests.js`.
- **Quyết định 225 (2026-11-27):** **Xây Dựng Không Gian Toàn Màn Hình Quán Phở Cổ Truyền Việt Nam (`640×440`, Áp Dụng Chuẩn `VIETNAM_PIXEL_ART_BIBLE` & `vnPixelArtKit`):**
    - *Kiến Trúc Mô-Đun (`src/components/chat/pho/phoInteriorArt.ts` + `PhoRestaurantBannerWebView.tsx` + `PhoRestaurantView.tsx`):* Công trình đầu tiên tái sử dụng trực tiếp `buildVnPixelKitPrimitivesScript()` (`VN_OKLAB_MATERIALS`, `drawTileFloorIndochine`, `drawSteamPuff`, `drawPigSpriteCanonical` 1:1 Tab Vườn). Gồm 1 đầu bếp nấu phở chan nước dùng, 2 nồi nước dùng inox sôi bong bóng & khói nghi ngút, tủ kính thịt bò tươi & rổ bánh phở trắng, 2 nhân viên phục vụ bưng tô phở đi giữa 8 bàn inox (đầy đủ gia vị Việt Nam & ghế nhựa xanh/đỏ), ~14 khách ngồi ăn xì xụp + 4 khách đi ra vào cửa, 3 quạt trần quay 60fps, góc trà đá quẩy nóng, quầy thu ngân & bàn thờ Ông Địa đèn đỏ, AABB obstacles & 4 điểm tương tác cho chú Heo.
    - *Cổng 2 Chiều Từ Tab Khám Phá (`EntertainmentBannerWebView.tsx` + `PixelHubDashboard.tsx` + `ChatView.tsx`):* Hotspot `pho_old_quarter` (`fastDash: true`) gọi `onEnterPho` mở `PhoRestaurantView`, có cổng `exit_pho` ở đáy quán và nút `[←]` quay lại Tab Khám phá.
    - *Tài Liệu Đồng Bộ:* `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/pho/phoInteriorArt.ts`, `src/components/chat/PhoRestaurantBannerWebView.tsx`, `src/components/chat/PhoRestaurantView.tsx`, `src/components/chat/EntertainmentBannerWebView.tsx`, `src/components/chat/PixelHubDashboard.tsx`, `src/components/views/ChatView.tsx`, `run-all-tests.js`.
- **Quyết định 226 (2026-11-27):** **Nâng Cấp Quán Phở Cổ Truyền (`640×460`) Lên Mô Phỏng Quy Trình Phục Vụ Thực Tế 100% (FSM), Khuôn Mặt Pixel Chi Tiết, 14 Bàn San Sát & Bỏ Quạt Trần:**
    - *Bỏ Quạt Trần & Tăng Mật Độ 14 Bàn San Sát (`phoInteriorArt.ts`):* Xóa hoàn toàn `drawCeilingFan` (không hợp góc cam từ trên xuống), thay bằng 3 quạt treo tường cổ điển (`drawWallFan`); mở rộng lên `640 × 460` với 14 bàn inox san sát (28 ghế) xếp 3 dãy + 2 lối đi dọc thông suốt (`x = 208`, `x = 432`), bổ sung bồn rửa chén góc bếp và vẽ tô phở động (`drawDynamicPhoBowl`) thay vì vẽ sẵn tô giả.
    - *Khuôn Mặt Pixel Sắc Nét & FSM Thực Tế 100% (`PhoRestaurantBannerWebView.tsx`):* Nâng cấp `drawDetailedHumanFace` (mắt sáng trắng, má hồng, miệng cười/ăn, 4 kiểu tóc); cài đặt `stepPhoSimulation` + `moveAlongAisles` chạy đúng quy trình: Khách vào cửa → Ngồi chờ `WAITING_FOOD` (chưa có tô) → 2 Nhân viên bưng phở từ bếp ra đặt đúng bàn → Khách `EATING` gắp ăn xì xụp → Ăn xong để lại tô rỗng `NEEDS_CLEAR` đi ra cửa → Nhân viên tới dọn tô rỗng mang về bồn rửa bếp → Bàn sạch `EMPTY`.
    - *Tài Liệu Đồng Bộ:* `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/pho/phoInteriorArt.ts`, `src/components/chat/PhoRestaurantBannerWebView.tsx`, `run-all-tests.js`.
- **Quyết định 227 (2026-11-27):** **Xây Dựng Không Gian Toàn Màn Hình Adidas Flagship Brand Center 2 Tầng (`640×560`, Architectural Minimalist Luxury):**
    - *Kiến Trúc 2 Tầng Sang Trọng Tối Giản (`src/components/chat/adidas/adidasInteriorArt.ts` + `AdidasStoreBannerWebView.tsx` + `AdidasStoreView.tsx`):* Sàn bê tông mài xám sáng, khung thép đen mờ, gỗ sồi ấm, đèn LED hắt kệ; Tầng 2 gồm Hero Wall Logo 3 Sọc LED, Tường giày Sneaker (Superstar/Samba/Gazelle/Ultraboost) & dép Adilette 3 sọc, 4 giá treo quần & áo 3 sọc, 4 Mannequin rọi spotlight, Phòng thử đồ VIP + Gương LED; Cầu thang kính cường lực LED nối liền Tầng 1 ↔ Tầng 2; Tầng 1 gồm 2 đảo trưng bày đá Terrazzo, 3 Mannequin mặt tiền, Quầy thu ngân Flagship + hộp giày/túi 3 sọc, 2 Nhân viên Adidas đồng phục 3 sọc (1 tại quầy, 1 đi tuần 2 tầng) & 7 khách mua sắm xách túi 3 sọc.
    - *Cổng 2 Chiều Từ Tab Khám Phá (`EntertainmentBannerWebView.tsx` + `PixelHubDashboard.tsx` + `ChatView.tsx`):* Hotspot `adidas_store` (`fastDash: true`) gọi `onEnterAdidas` mở `AdidasStoreView`, có cổng kính `exit_adidas` ở đáy Tầng 1 và nút `[←]` quay về Tab Khám phá.
    - *Tài Liệu Đồng Bộ:* `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/adidas/adidasInteriorArt.ts`, `src/components/chat/AdidasStoreBannerWebView.tsx`, `src/components/chat/AdidasStoreView.tsx`, `src/components/chat/EntertainmentBannerWebView.tsx`, `src/components/chat/PixelHubDashboard.tsx`, `src/components/views/ChatView.tsx`, `run-all-tests.js`.
- **Quyết định 228 (2026-11-27):** **Đại Tu Toàn Diện Adidas Flagship 2 Tầng (`640×560`) Theo Phong Cách Adidas Hội An Heritage Design Art — Dày Đặc 80% Không Gian & Sắc Nét Từng Món Đồ:**
    - *Xóa Bỏ Khoảng Trống Hoang Sơ (`adidasInteriorArt.ts`):* Thay sàn bê tông xám trống trải bằng sàn gỗ lim ấm + lối đi gạch bông Hội An `16×16` (`drawHoiAnWoodAndTileFloor`), tường vàng kem phố cổ, ban công gỗ chạm & 8 đèn lồng lụa vàng ấm 60fps; bố trí thảm cỏ nhân tạo xanh cho Khu Bóng Đá và lấp đầy ~80% không gian cả 2 tầng.
    - *Vẽ Sắc Nét Từng Sản Phẩm Thực Tế (`adidasInteriorArt.ts` + `AdidasStoreBannerWebView.tsx`):* Nâng cấp bộ sprite to rõ: `drawPoloShirt` (áo Polo cổ bẻ + trụ nút + 2 tay xòe), `drawSportsTee` (áo thun/áo đấu cổ V có tay & số áo), `drawTrackPants` (quần Jogger/Short 3 sọc tách 2 ống), `drawFootballBoot` (giày đá banh có đinh tán), `drawRunningShoe` (giày chạy bộ đế Boost cong), `drawLifestyleSneaker`, `drawAdiletteSlideLarge`, `drawFootballRack` (giá bóng đá), `drawAccessoryShelf` (balo, mũ, hộp giày) và `drawDetailedMannequin` (7 Mannequin dáng đẹp).
    - *Tài Liệu Đồng Bộ:* `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/adidas/adidasInteriorArt.ts`, `src/components/chat/AdidasStoreBannerWebView.tsx`, `run-all-tests.js`.
- **Quyết định 229 (2026-11-27):** **Đồng Bộ 1:1 4 Ảnh Thực Tế Adidas Originals Hội An Cho Mặt Tiền Banner Tab Khám Phá & Điểm Nhấn Nghệ Thuật Bên Trong Store:**
    - *Mặt Tiền Banner Tab Khám Phá (`saigonPanoramaArt.ts`, `x: 214..314`):* Thay khối nhà đen hiện đại bằng nhà cổ 2 tầng vàng nghệ Hội An 1:1 Ảnh 1/3/4: 3 vòm cong trắng, ban công con tiện trắng, chùm đèn lồng nhiều màu, mái ngói âm dương, cửa lá sách gỗ nâu, bảng hiệu đen viền LED Logo Cỏ Ba Lá (Trefoil), 2 bụi cây leo xanh và tượng Logo Cỏ Ba Lá viền LED trắng khổng lồ góc phải.
    - *Bên Trong Adidas Hội An Store (`adidasInteriorArt.ts`):* Giữ nguyên mật độ đồ 80% QĐ 228; nâng cấp Hero Wall Tầng 2 thành tường vàng rọi spotlight chữ cam `ADIDAS HOI AN` + 3 Đèn Lồng Cỏ Ba Lá gấm hoa (`drawTrefoilLantern`, 1:1 Ảnh 2), đổi ban công phân tầng thành lan can con tiện gỗ đen (Ảnh 2), đặt tượng Trefoil đen viền LED trắng (`drawTrefoilLogo`) ngay cửa ra vào Tầng 1 và chùm đèn lồng nhiều màu.
    - *Tài Liệu Đồng Bộ:* `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/hub/saigonPanoramaArt.ts`, `src/components/chat/adidas/adidasInteriorArt.ts`, `run-all-tests.js`.
- **Quyết định 230 (2026-11-27):** **Nâng Cấp Nghệ Thuật Mặt Tiền Adidas Hội An, Cờ Đỏ Sao Vàng 5 Cánh To Bay Phấp Phới Trên SVĐ Thống Nhất & Khu Chùa Hùng Vĩ – Chùa Một Cột – Cây Đa (`saigonPanoramaArt.ts`):**
    - *Adidas Originals Hội An Sắc Nét:* Mở rộng bảng hiệu Logo 3 Sọc + chữ `ADIDAS` rõ nét, phóng to Tượng Cỏ Ba Lá Trefoil viền LED trắng, bổ sung bích họa Hội An, bậc đá hoa văn & 2 bồn hoa giấy tím-hồng trước sân.
    - *Cờ Đỏ Sao Vàng SVĐ Thống Nhất (`drawWavingVietnamFlag`):* Phóng to lá cờ Việt Nam lên `26 × 17` px với ngôi sao vàng 5 cánh rõ nét và hiệu ứng sóng vải bay phấp phới 60fps kèm 2 cờ phướn khán đài.
    - *Khu Chùa Hùng Vĩ 3 Lớp Chiều Sâu:* Rặng cây xanh xa rợp bóng, Bảo Tháp 7 tầng & **Chùa Một Cột trên hồ sen** rõ nét phía sau; **Cổng Tam Quan 2 tầng mái đao cong** + lư hương bốc khói trầm 60fps ở giữa; **Cây Đa cổ thụ tán rộng rễ buông** uy nghi trước sân chùa.
    - *Tài Liệu Đồng Bộ:* `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/hub/saigonPanoramaArt.ts`, `run-all-tests.js`.

- **Quyết định 231 (2026-11-27): Xây Dựng Không Gian Toàn Màn Hình Sân Vận Động Trống Đồng Chuẩn Quốc Tế FIFA (`840×680`), Trận Đấu 11v11 + 3 Trọng Tài & 7 Phòng Hậu Trường Đầy Đủ:**
    - *Bối cảnh:* Người dùng yêu cầu xây dựng không gian Sân Vận Động Trống Đồng đậm chất Văn hóa Việt Nam lấy cảm hứng từ 3 ảnh nâng cấp SVĐ Thống Nhất TP.HCM (khán đài phủ ghế đỏ-vàng khắc Cờ Đỏ Sao Vàng, sân cỏ mượt mà, đường pitch chạy bộ, 2 đội thi đấu 11v11 chuẩn FIFA 4-3-3 vs 4-4-2, trọng tài chuẩn quốc tế, khu kỹ thuật HLV/dự bị, cùng đầy đủ phòng thay đồ, phòng hồi sức, phòng VAR, họp báo, nhà vệ sinh) kết nối 2 chiều từ Hub Tab Khám phá.
    - *Giải pháp:*
        1. **Tạo bộ 3 module mới:** `src/components/chat/stadium/stadiumInteriorArt.ts` (`840×680` pixel art + động cơ trận đấu 11v11 AI + 3 trọng tài + 7 phòng FIFA), `src/components/chat/StadiumBannerWebView.tsx` (WebView + iframe Web PWA + `pixelOpenRoomEngine` 4 chiều), và `src/components/chat/StadiumView.tsx` (màn hình toàn màn hình + nút `[←]`).
        2. **Đồng bộ Hub & Điều hướng 2 chiều:** Thêm dải mái vòm hoa văn Trống Đồng Đông Sơn lên mặt tiền SVĐ Thống Nhất trong `saigonPanoramaArt.ts`, bật `fastDash: true` + `onEnterStadium` trên `EntertainmentBannerWebView.tsx`, nối `'stadium'` vào `PixelHubDashboard.tsx` & `ChatView.tsx`.
    - *Tài Liệu Đồng Bộ:* `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/DECISIONS.md`, `docs/screens/heocon/10-CHAT.md`, `src/components/chat/stadium/stadiumInteriorArt.ts`, `src/components/chat/StadiumBannerWebView.tsx`, `src/components/chat/StadiumView.tsx`, `src/components/chat/hub/saigonPanoramaArt.ts`, `src/components/chat/EntertainmentBannerWebView.tsx`, `src/components/chat/PixelHubDashboard.tsx`, `src/components/views/ChatView.tsx`, `run-all-tests.js`.

- **Quyết định 232 (2026-11-27): Chuẩn Hóa Góc Nhìn Thứ 3 Nhập Vai (TPS 3D Kiểu PUBG) Toàn Hệ Thống & Nâng Cấp Tiên Phong Quán Phở Cổ Truyền:**
    - *Bối cảnh:* Người dùng yêu cầu nâng cấp chuẩn tài liệu cho toàn bộ các không gian mở (quán ăn, cửa hàng, sân vận động...) sang góc nhìn thứ 3 nhập vai như PUBG để mang lại cảm giác chân thực tối đa, bắt đầu từ Quán Phở Cổ Truyền (Heo mở cửa từ ngoài vào quán, tự chọn ghế ngồi, gọi phở, ăn phở, đi vào khu vực bếp xem đầu bếp nấu, quan sát phục vụ & khách hàng ra vào).
    - *Giải pháp:*
        1. **Tài liệu chuẩn hóa:** Tạo `docs/TPS_3D_OPEN_WORLD_SPEC.md` và cập nhật `AGENTS.md`, `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/screens/heocon/10-CHAT.md` quy định chuẩn TPS 3D (Camera sau lưng 360°, Raycast Tap-to-Walk không Joystick ảo, Multi-Angle Pig Sprite, Painter's Algorithm Z-Sorting).
        2. **Engine dùng chung & Quán Phở 3D:** Tạo `src/components/pixel/pixelTps3dEngine.ts` (3D Perspective Projection thuần JS 0-dependency) + `src/components/chat/pho/phoTps3dScene.ts` (Quán Phở 3D có mặt tiền vỉa hè, cửa 2 cánh xoay bản lề 90°, 8 bàn inox 3D, bếp mở cho Heo vào xem Đầu bếp nấu, FSM phục vụ bưng phở cho cả NPC & chú Heo) và cập nhật `PhoRestaurantBannerWebView.tsx`.
    - *Tài Liệu Đồng Bộ:* `docs/TPS_3D_OPEN_WORLD_SPEC.md`, `AGENTS.md`, `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/screens/heocon/10-CHAT.md`, `docs/DECISIONS.md`, `src/components/pixel/pixelTps3dEngine.ts`, `src/components/chat/pho/phoTps3dScene.ts`, `src/components/chat/PhoRestaurantBannerWebView.tsx`, `run-all-tests.js`.

- **Quyết định 233 (2026-11-27): Đại Tu Quán Phở Cổ Truyền 5 Gian Phòng Phố Hội Ấm Áp, Trần Gỗ Lim Kín 100%, Chi Tiết Nguyên Liệu Phở Việt Nam & Thanh Tab Tham Quan Đồng Bộ 2 Chiều:**
    - *Bối cảnh:* Qua 3 ảnh chụp thực tế bản v1, quán Phở còn đơn sơ, chỉ có 1 phòng và bị lộ hoàn toàn bầu trời xanh trên đầu. Người dùng gửi 5 ảnh mẫu kiến trúc Phố Hội / Mẹt Hội An & mâm Phở Việt Nam yêu cầu không gian cổ kính, ấm áp, nhiều ngăn phòng, chi tiết rõ nét từng nguyên liệu & hoa văn, cùng thanh tab đồng bộ để chú Heo tham quan từng gian phòng chân thực nhất.
    - *Giải pháp:*
        1. **Trần nhà kín 100% & Ánh sáng ấm:** Dựng trần kem + hệ xà gồ gỗ lim nâu sẫm phối cảnh 3D + đèn lồng trụ vuông & đèn mây tre tỏa ánh vàng ấm (chỉ hiện bầu trời khi Heo ở ngoài Sân Vườn `z < 0`).
        2. **Mở rộng 5 Gian Phòng Liên Hoàn (`22m × 24m`):** Sân Vườn & Mặt Tiền Phố Hội (`garden`), Sảnh Chính Phố Hội (`main_hall`), Gian Phòng VIP Cổ Kính (`vip_room`), Bếp Lửa & Quầy Nguyên Liệu (`kitchen`), và Góc Trà Đạo & Phòng WC (`tea_wc`), ngăn cách bằng cửa vòm gỗ chạm & bình phong song gỗ.
        3. **Nguyên liệu Phở chi tiết & Đồng bộ Tab 2 chiều:** Bày đầy đủ tô Phở thịt bò hành ngò, ấm trà Bát Tràng men xanh-trắng, rổ tương ớt/giấm tỏi, dĩa rau giá chanh, quẩy nóng, trứng chần; bo tròn sprite chú Heo TPS 1:1 Tab Vườn; bổ sung thanh Tab 5 gian phòng tự động dẫn đường waypoint & đồng bộ highlight theo phòng chú Heo đang đứng.
    - *Tài Liệu Đồng Bộ:* `docs/TPS_3D_OPEN_WORLD_SPEC.md`, `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/screens/heocon/10-CHAT.md`, `docs/DECISIONS.md`, `src/components/pixel/pixelTps3dEngine.ts`, `src/components/chat/pho/phoTps3dScene.ts`, `src/components/chat/PhoRestaurantBannerWebView.tsx`, `run-all-tests.js`.

- **Quyết định 234 (2026-11-27): Tối Ưu Quán Phở TPS 3D Gọn Mượt 3 Khu (Bỏ Phòng VIP), Bối Cảnh Phố Cổ Đối Diện & Sprite Pixel Art Tả Thực Xoong Nồi/Nguyên Liệu:**
    - *Bối cảnh:* Qua 4 ảnh chụp thực tế sau QĐ 233, người dùng chỉ ra 4 lỗi cần chữa dứt điểm: mặt tiền nhìn ra khoảng không bầu trời trống + đèn lồng bay lơ lửng; nhiều phòng gây giật lag + lỗi Z-sorting xuyên tường Phòng VIP + chú Heo lún góc tường; xoong nồi/thịt bò/bánh phở/rau bị vẽ thành các cục hộp vuông thô cứng; bồn rửa đặt lệch lối đi.
    - *Giải pháp:*
        1. **Gọn quán 3 Khu (`12m × 15.5m`):** Bỏ Phòng VIP & vách ngăn phụ, giữ 3 Khu (`🏮 Sân Phố Cổ | 🏛️ Sảnh Phở Chính | 🔥 Bếp Lửa Phở`) giảm 60% đa giác, 0% lỗi xuyên tường, đệm va chạm tường `0.65m`.
        2. **Bối cảnh Phố Cổ đối diện & Dây treo đèn lồng:** Dựng đường nhựa, dãy nhà cổ tường vàng mái ngói & tán cây xanh đối diện trước mặt tiền (`Z: -6..-12`) che kín chân trời; nối dây treo đen cho mọi đèn lồng.
        3. **Hybrid Sprite Pixel Art Tả Thực:** Thay toàn bộ cục hộp nồi/nguyên liệu/tô phở/ấm trà bằng bộ Sprite tả thực tự co giãn theo chiều sâu 3D (`drawPhoPotSprite3D`, `drawKitchenIngredientsSprite3D`, `drawPhoBowlSprite3D`, `drawBatTrangTeapotSprite3D`, `drawCondimentCaddySprite3D`, `drawQuayAndHerbsSprite3D`).
    - *Tài Liệu Đồng Bộ:* `docs/TPS_3D_OPEN_WORLD_SPEC.md`, `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/screens/heocon/10-CHAT.md`, `docs/DECISIONS.md`, `src/components/pixel/pixelTps3dEngine.ts`, `src/components/chat/pho/phoTps3dScene.ts`, `src/components/chat/PhoRestaurantBannerWebView.tsx`, `run-all-tests.js`.

- **Quyết định 235 (2026-11-27): Đồng Bộ 1:1 Mặt Tiền Quán Phở Tab Khám Phá, Đại Lộ Xe Cộ 60fps & Sông Bạch Đằng Có Tàu Bè — Triệt Tiêu 100% Mảng Trời Xanh Mất Liên Kết:**
    - *Bối cảnh:* Qua 4 ảnh chụp thực tế sau QĐ 234, vẫn còn mảng trời xanh mất liên kết do mái ngói hở đoạn giữa cửa, vỉa hè/đường bị cắt cụt ở 2 bên khi xoay camera, và người dùng muốn mặt tiền Quán Phở bám sát 1:1 Banner Tab Khám phá nhìn thẳng ra Đại lộ có xe cộ chạy và bên kia là Sông Bạch Đằng có tàu bè qua lại.
    - *Giải pháp:*
        1. **Mặt tiền Quán Phở liền mái 1:1 Tab Khám phá + Tiệm CAFE kế bên:** Vẽ tường tầng 2 & mái ngói đỏ liền suốt `X: -6..+6` kèm 2 cửa sổ lá sách xanh rêu, bảng đỏ-vàng `PHỞ`, Tiệm `CAFE` mái sọc đỏ-trắng ngay sát bên phải & dãy phố kéo dài `X: -60..+60`.
        2. **Vỉa hè thoáng mở ➔ Đại lộ xe cộ ➔ Sông Bạch Đằng có tàu bè ➔ Bờ Thủ Thiêm:** Bỏ hàng rào gạch chắn tầm nhìn, mở rộng vỉa hè bó vỉa trắng-đen + Đại lộ 2 làn + Sông Bạch Đằng xuyên suốt `X: -70..+70` đến đường chân trời, bổ sung `drawRoadVehicleSprite3D` (xe máy/taxi/xe buýt) & `drawRiverBoatSprite3D` (tàu Waterbus & thuyền sông Bạch Đằng chạy 60fps).
    - *Tài Liệu Đồng Bộ:* `docs/TPS_3D_OPEN_WORLD_SPEC.md`, `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/screens/heocon/10-CHAT.md`, `docs/DECISIONS.md`, `src/components/pixel/pixelTps3dEngine.ts`, `src/components/chat/pho/phoTps3dScene.ts`, `src/components/chat/PhoRestaurantBannerWebView.tsx`, `run-all-tests.js`.

- **Quyết định 236 (2026-11-27): Chuẩn Hóa Kiến Trúc TPS 3D Interior-Only Toàn Hệ Thống (Bỏ Bối Cảnh Ngoài Trời & Thanh Tab Card) & Nâng Cấp Quán Phở Vintage 90s (3 Đầu Bếp, 2 Phục Vụ Tạp Dề, Quạt Trần, Đũa Muỗng Đầy Đủ):**
    - *Bối cảnh:* Người dùng nhận thấy khoảnh khắc chú Heo bước qua ngưỡng cửa 2 cánh đang mở hướng thẳng vào bên trong quán cực kỳ chân thực; yêu cầu chuẩn hóa tài liệu TPS 3D bỏ hẳn cảnh mặt tiền & ngoài trời để tiết kiệm tài nguyên, hết lag, tập trung 100% vào nội thất ấm cúng (bỏ luôn thanh Tab card trên cùng), và nâng cấp Quán Phở theo phong cách Vintage 90s ánh đèn vàng ấm, có quạt trần quay, 3 nhân viên bếp, 2 phục vụ tạp dề đẹp mắt, món phở thịt bò tươi sống & đũa muỗng đầy đủ.
    - *Giải pháp:*
        1. **Interior-Only TPS 3D:** Cập nhật `docs/TPS_3D_OPEN_WORLD_SPEC.md`, bỏ toàn bộ cảnh ngoài trời và thanh Tab card `#roomTabs`; chú Heo xuất phát ngay ngưỡng cửa (`z = 0.9`) với hiệu ứng 2 cánh cửa gỗ mở chào đón nhìn thẳng vào Sảnh Phở & Bếp Lửa (bỏ bình phong chắn giữa).
        2. **Quán Phở Vintage 90s:** Bổ sung `drawCeilingFan3D` (2 quạt trần 3 cánh quay 60fps), `drawVintageLamp3D` (6 đèn thả chụp men ánh vàng 90s), nâng cấp `drawPhoBowlSprite3D` (thêm muỗng sứ + thịt bò tươi sống), `drawCondimentCaddySprite3D` (ống đũa muỗng đầy đủ), `drawHumanTps3D` (tạp dề đẹp có dây đeo cổ & túi + 3 vai trò bếp: Bếp trưởng múc nước dùng, Phụ bếp thái thịt, Phụ bếp trụng phở).
    - *Tài Liệu Đồng Bộ:* `docs/TPS_3D_OPEN_WORLD_SPEC.md`, `docs/PIXEL_OPEN_WORLD_SPEC.md`, `docs/screens/heocon/10-CHAT.md`, `docs/DECISIONS.md`, `src/components/pixel/pixelTps3dEngine.ts`, `src/components/chat/pho/phoTps3dScene.ts`, `src/components/chat/PhoRestaurantBannerWebView.tsx`, `run-all-tests.js`.

- **Quyết định 237 (2026-11-27): Chữa Mảng Vàng Khè Phía Sau Cửa Interior-Only Bằng Cửa Tự Khép Tay Nắm Đồng + Tranh Phố Xá & Sông Bạch Đằng Phẳng Siêu Nhẹ (0% Lag):**
    - *Bối cảnh:* Khi chú Heo quay lưng nhìn ra cửa ở chế độ Interior-Only, hình chữ nhật nền vàng trơn `#F4D498` phía sau khung cửa tạo cảm giác "mảng vàng khè" thiếu chân thực.
    - *Giải pháp:* Chuẩn hóa quy tắc **Doorway Backdrop & Auto-Closing Door** cho mọi không gian Interior-Only: 2 cánh cửa gỗ chỉ mở `1.4s` đầu lúc vừa bước vào rồi tự khép lại (bổ sung tay nắm đồng, ô kính & bảng gỗ `KÍNH CHÀO QUÝ KHÁCH` phía trên khung cửa); ngay sau khung cửa (`Z = -0.10`) vẽ **1 tấm tranh bối cảnh phẳng siêu nhẹ** gồm vỉa hè, mặt đường nhựa, Sông Bạch Đằng, hàng cây Thủ Thiêm & bầu trời sáng (chỉ vài dải quad phẳng — **0% lag** nhưng nhìn qua khung cửa cực kỳ chân thực!).
    - *Tài Liệu Đồng Bộ:* `docs/TPS_3D_OPEN_WORLD_SPEC.md`, `docs/DECISIONS.md`, `src/components/chat/pho/phoTps3dScene.ts`, `run-all-tests.js`.

- **Quyết định 238 (2026-11-27): Camera Spring-Arm Raycast 6 Mặt Phẳng Chống Nhìn Xuyên Tường 100% & Cửa Gỗ Lá Sách Kính Mờ Đóng Kín + Vệt Nắng Đổ Sàn + Chuyển Cảnh AAA:**
    - *Bối cảnh:* Người dùng chỉ ra 2 lỗi chân thực vật lý: tấm tranh phẳng sau cửa vẫn tạo cảm giác dán phẳng thiếu tự nhiên, và khi chú Heo đứng sát tường người dùng có thể xoay camera lòi ra ngoài nhìn xuyên tường vào trong quán.
    - *Giải pháp:*
        1. **Camera Spring-Arm Raycast (`updateTpsCamera` trong `pixelTps3dEngine.ts`):** Bắn tia từ vai chú Heo ngược hướng `-cam.F` cắt 6 mặt phẳng tường/trần (`wallMargin = 0.38m`), tự động thu gọn `curDist` mượt bên trong phòng khi sát tường; khóa chặt `bounds` trong lòng quán (`minZ: 0.0`) để bất khả thi nhìn xuyên tường 100%.
        2. **Cửa Gỗ Lim Lá Sách Kính Mờ Đóng Kín & Chuyển Cảnh AAA (`phoTps3dScene.ts`):** Xóa tấm tranh phẳng giả, giữ 2 cánh cửa gỗ lá sách kính mờ sương chia ô cổ điển khép kín có tay nắm đồng, đổ 2 vệt nắng xiên vàng ấm xuống sàn gạch, đặt thảm chùi chân & 2 chậu cây; khi bấm ra cửa sẽ hé mở cửa kèm chuyển cảnh Fade-Out 240ms về Đại Lộ Sài Gòn.
    - *Tài Liệu Đồng Bộ:* `docs/TPS_3D_OPEN_WORLD_SPEC.md`, `docs/screens/heocon/10-CHAT.md`, `docs/DECISIONS.md`, `src/components/pixel/pixelTps3dEngine.ts`, `src/components/chat/pho/phoTps3dScene.ts`, `src/components/chat/PhoRestaurantBannerWebView.tsx`, `run-all-tests.js`.

- **Quyết định 239 (2026-11-27): Hé Duy Nhất 1 Cánh Cửa (~35°) & Luồng Ánh Sáng Trắng-Vàng Ngược Sáng Động Khi Khách NPC Ra Vào (Không Xuyên Cửa, Không Lộ Toàn Cảnh Ngoài):**
    - *Bối cảnh:* Khi cửa đóng kín hoàn toàn, khách NPC đi ra đi vào bị cảm giác đi xuyên gỗ thiếu thực tế; người dùng muốn khi khách ra/vào sẽ hé nhẹ 1 cánh cửa đủ lách qua và chỉ thấy 1 luồng ánh sáng rực từ bên ngoài hắt vào sàn chứ không lộ toàn cảnh ngoài trời.
    - *Giải pháp:* Tách `leftDoorOpen` (luôn đóng kín `0`) và `rightDoorOpen` (hé mở `~35°` khi có khách NPC trong bán kính `z < 1.6m` hoặc khi chú Heo bấm ra cửa rồi tự khép êm lại); điều chỉnh đường đi vào/ra của khách NPC đi đúng qua khe cánh cửa phải (`x = 0.55`); vẽ nguồn sáng ngược sáng trắng-vàng rực (`#FFFDF0`) sau khe cửa kèm dải tia nắng động mở rộng/thu hẹp trên sàn gạch bông theo đúng `rightDoorOpen`.
    - *Tài Liệu Đồng Bộ:* `docs/TPS_3D_OPEN_WORLD_SPEC.md`, `docs/screens/heocon/10-CHAT.md`, `docs/DECISIONS.md`, `src/components/chat/pho/phoTps3dScene.ts`, `run-all-tests.js`.

- **Quyết định 240 (2026-11-27): Trang Trí Nghệ Thuật Pixel Art Văn Hóa Việt Nam Điệu Nghệ Trên 3 Bức Tường Quán Phở (Trái, Phải & Đối Diện Bếp):**
    - *Bối cảnh:* Người dùng gửi 2 bộ moodboard Văn hóa Việt Nam và yêu cầu đóng vai thợ vẽ Pixel Art trang trí các họa tiết, tranh ảnh và vật phẩm văn hóa Việt Nam thật rõ nét, đẹp mắt, điệu nghệ lên 3 bức tường của Quán Phở Vintage 90s.
    - *Giải pháp:* Tạo module nghệ thuật riêng `src/components/chat/pho/phoVnWallArt.ts` vẽ diềm hoa văn chữ Triện 3 tường + 10 tác phẩm/vật phẩm văn hóa Việt Nam sắc nét co giãn theo chiều sâu 3D: Tường Trái (Biển đường `ĐƯỜNG ĐỘC LẬP`, Tranh Hoa Sen Hồng, Tranh Xích Lô Đỏ-Vàng, Nón Lá + Đàn Nguyệt + Sáo Trúc); Tường Phải (Tranh Áo Dài Hoa Sen, Tranh Cờ Đỏ Sao Vàng + Nón Lá + Hoa Mai Vàng, Kệ Bình Gốm Bát Tràng + Chum Sành + Hộp Sơn Mài Đỏ); Tường Đối Diện Bếp (2 Câu Đối Đỏ chữ vàng, Tranh Quang Gánh Phở xưa, Saigon Skyline & Đồng Hồ Quả Lắc 90s đung đưa 60fps).
    - *Tài Liệu Đồng Bộ:* `docs/screens/heocon/10-CHAT.md`, `docs/DECISIONS.md`, `src/components/chat/pho/phoVnWallArt.ts`, `src/components/chat/pho/phoTps3dScene.ts`, `src/components/chat/PhoRestaurantBannerWebView.tsx`, `run-all-tests.js`.

- **Quyết định 241 (2026-11-27): Thay Biển Đường Tràn Chữ Bằng Bảng Thực Đơn Phở Đỏ Son Viền Gỗ Gụ Chữ Vàng Vintage 90s (0% Tràn Viền Mọi Góc Xoay):**
    - *Bối cảnh:* Biển đường xanh `ĐƯỜNG ĐỘC LẬP` đặt ở góc đầu tường trái bị tràn chữ ra khỏi khung viền khi nhìn ở góc nghiêng/xa và chưa gắn chặt với trải nghiệm ẩm thực khi khách vừa bước vào quán Phở.
    - *Giải pháp:* Thay thế hoàn toàn bằng **Bảng Thực Đơn Phở Đỏ Son Viền Gỗ Gụ Chữ Vàng** (`drawPhoMenuBoardArt` trong `src/components/chat/pho/phoVnWallArt.ts`), treo dọc cân hàng 1:1 với Tranh Hoa Sen (`Y = 1.45..2.75`, `Z = 0.50..1.62`), đồng bộ tông màu đỏ son `#8B1A1A` — viền gỗ gụ `#4A2C1A` — chỉ vàng `#F4B93B` với bảng `PHỞ 1990` & Câu Đối sau bếp. Bảng gồm họa tiết bát phở mini bốc khói, tiêu đề `THỰC ĐƠN PHỞ` và 4 món kinh điển (`Tái 15K`, `Nạm 15K`, `Gầu 18K`, `Đặc Biệt 25K`), đo trực tiếp chiều rộng/cao 4 đỉnh khung chiếu 3D để áp `ctx.clip()` + `fillText(..., maxWidth)` đảm bảo **0% tràn chữ** ở mọi góc xoay 360° & khoảng cách.
    - *Tài Liệu Đồng Bộ:* `docs/screens/heocon/10-CHAT.md`, `docs/DECISIONS.md`, `src/components/chat/pho/phoVnWallArt.ts`, `run-all-tests.js`.

- **Quyết định 242 (2026-11-27): Quán Cà Phê Việt Nam TPS 3D — Cộng Cà Phê Bao Cấp Ấm Cúng (Vàng Ấm, Xanh Cốm, Chăn Con Công & "Độc Lập - Tự Do - Hạnh Phúc"):**
    - *Bối cảnh:* Người dùng gửi 6 ảnh cảm hứng Cộng Cà Phê Bao Cấp Việt Nam và yêu cầu nâng cấp Quán Cà Phê lên góc nhìn thứ 3 (TPS 3D Interior-Only), đồng bộ chú Heo toàn App, tông màu ấm vàng – xanh cốm, văn hóa Việt Nam "Độc Lập - Tự Do - Hạnh Phúc", có liên kết trò chuyện cùng Heo AI ngay trong quán.
    - *Giải pháp:*
        1. **Mở rộng Engine dùng chung (`pixelTps3dEngine.ts`):** Bổ sung `drawCoconutCoffeeSprite3D` (Cà Phê Cốt Dừa kem tuyết), `drawEnamelMugCoffeeSprite3D` (Ca men sắt xanh lính), `drawCroissantPlateSprite3D` (Bánh Sừng Bò + chén sữa đặc) và đồng phục `'barista'` / `'cafe_waiter'` (áo xanh lính ngôi sao vàng + mũ vải + tạp dề xanh).
        2. **Bộ Module Quán Cà Phê TPS 3D (`cafeVnWallArt.ts`, `cafeTps3dScene.ts`, `CafeTpsBannerWebView.tsx`, `CafeTpsView.tsx`):** Không gian `12m × 14.8m` Interior-Only + Spring-Arm 6 mặt phẳng chống xuyên tường, rèm vải xanh cốm rủ trần, 6 bàn đệm Chăn Con Công, 3 mặt tường văn hóa Việt Nam (`THỰC ĐƠN CÀ PHÊ`, `ĐỘC LẬP · TỰ DO · HẠNH PHÚC`, cụm ảnh Sài Gòn xưa, `YÊU NƯỚC LÀ THI ĐUA`, dù & gối Chăn Con Công, `CÀ PHÊ VIỆT NAM · 1975` & Cờ Đỏ Sao Vàng — khóa `ctx.clip()` + `safeW` 0% tràn chữ), 2 Barista áo xanh lính, khách NPC hé 1 cánh cửa (~35°) đón tia nắng động, và Góc Bàn Heo AI đeo kính mở thẳng màn Trò chuyện.
        3. **Điều hướng 2 chiều (`PixelHubDashboard.tsx` & `ChatView.tsx`):** Chạm Tiệm `CAFE` trên Đại Lộ Sài Gòn ➔ `'cafe_tps'` (Fullscreen TPS 3D); thẻ `Heo AI` giữ nguyên mở `'chat'`.
    - *Tài Liệu Đồng Bộ:* `docs/TPS_3D_OPEN_WORLD_SPEC.md`, `docs/screens/heocon/10-CHAT.md`, `docs/DECISIONS.md`, `src/components/pixel/pixelTps3dEngine.ts`, `src/components/chat/cafe/cafeVnWallArt.ts`, `src/components/chat/cafe/cafeTps3dScene.ts`, `src/components/chat/CafeTpsBannerWebView.tsx`, `src/components/chat/CafeTpsView.tsx`, `src/components/chat/PixelHubDashboard.tsx`, `src/components/views/ChatView.tsx`, `run-all-tests.js`.
