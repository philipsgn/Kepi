# 🐷 MASTER PRD: PIGFLY (VÍ LOCKET)

> **Dự án:** PigFly (Ví Locket) — Mobile App Chi Tiêu Bằng Ảnh & Quét Mã QR (Phong cách Hà Nội Thu Đông)  
> **Phiên bản:** NEW v3.0 (Chính thức chuyển đổi nhận diện thương hiệu sang PigFly & Tích hợp Gamification)  
> **Slogan thương hiệu:** *"PigFly: Tiết kiệm – Duy trì – Sinh lời bền vững"*  
> **Nguồn Sự Thật Duy Nhất (Single Source of Truth):** Tài liệu này định hình toàn bộ kiến trúc, giao diện và luồng trải nghiệm người dùng của PigFly.

---

## 🌟 1. TẦM NHÌN SẢN PHẨM & TRIẾT LÝ GAMIFICATION

### 1.1. Bối cảnh & Vấn đề Cần Giải Quyết
Các ứng dụng ghi chép tài chính truyền thống thường thất bại với Gen Z vì 3 lý do:
1. **Quá khô khan và phức tạp:** Bắt người dùng nhập liệu bằng bàn phím với hàng chục trường số liệu tẻ nhạt.
2. **Thiếu cảm xúc & Động lực duy trì:** Người dùng thường từ bỏ sau 3–5 ngày vì cảm giác "tự trừng phạt" mỗi khi mở app xem số tiền đã mất.
3. **Mối lo về an toàn dữ liệu ngân hàng:** Người dùng e ngại khi các app yêu cầu liên kết tài khoản ngân hàng hoặc đọc tin nhắn nhạy cảm.

### 1.2. Giải Pháp Đột Phá Từ PigFly
PigFly kết hợp **Trực quan hóa chi tiêu bằng ảnh (Locket style)** cùng **Cơ chế Game hóa Heo Bay (PigFly Gamification)**:
* **Ghi sổ tức thì $\le 3$ giây:** Chụp ảnh món đồ vừa mua (ly cà phê, bữa trưa, đôi giày) + chọn chip giá nhanh 1-chạm hoặc quét VietQR tự động.
* **Biểu tượng chú heo biết bay ("When pigs fly"):** Biến việc tích lũy tài chính tưởng chừng bất khả thi thành hành trình nhẹ nhàng, vui vẻ. Khi người dùng chi tiêu trong hạn mức, chú heo PigFly trở nên nhẹ nhõm và vỗ đôi cánh thiên thần bay cao qua các tầng mây tài chính.
* **Squad Nuôi Heo PigFly (2–4 bạn bè):** Cùng bạn thân thi đua giữ hạn mức chi tiêu, nhắc nhau "cho heo ăn" bằng cách ghi chép mỗi ngày.
* **Tôn chỉ Bảo mật Độc lập (Zero-STK Shield):** Tuyệt đối KHÔNG lưu trữ số tài khoản, số thẻ hay số dư ngân hàng; xử lý bóc tách thông báo 100% Offline trên RAM điện thoại.

---

## 🧭 2. CẤU TRÚC ĐIỀU HƯỚNG 5 TAB (NAVIGATION MATRIX)

Hệ thống điều hướng sử dụng **Floating Borderless Tab Bar** chuẩn phong cách Hà Nội Thu Đông với 100% Vector Icons (`lucide-react-native`, `strokeWidth: 2.6`, không hộp viền).

| Tab # | Tên Tab | Icon Vector | Trọng Tâm Trải Nghiệm & Vai Trò |
|:---:|:---|:---:|:---|
| **Tab 0** | **Sổ Nhật Ký (Home)** | `BookOpen` | "Hôm nay mình tiêu thế nào?" Xem nhanh hạn mức ngày, chuỗi Streak, lịch ảnh 7 cột và chú heo PigFly bay chào lơ lửng tại Greeting Header. |
| **Tab 1** | **Thống Kê (Stats)** | `PieChart` | "Tháng này tiền đi đâu?" Cuộn Album ảnh tháng 3:4, Hộp Cảm Xúc Tài Chính PigFly và 3 chỉ số sức khỏe tài chính KPI. |
| **Tab 2** | **Camera (Trung tâm)** | `Camera` | **Trang mở đầu mặc định.** Khung ngắm 4:5 sạch 100%, nút Shutter xúc giác 1-chạm, chip giá nhanh $\le 3$s, Quét mã VietQR và Locket Bank Snapshot. |
| **Tab 3** | **Cố Vấn & Squad (Chat)** | `MessageSquare` | Trò chuyện phản biện chống FOMO cùng Anh Minh AI Coach song hành cùng **Squad Nuôi Heo PigFly** kết nối bạn bè thân thiết. |
| **Tab 4** | **Cá Nhân & Cài Đặt (Profile)** | `User` | Thiết lập ngân sách ngày `Hôm nay tiêu được` (0 hardcode), Mục tiêu Thác nước Waterfall, và Trung tâm bảo mật minh bạch Zero-STK. |

---

## 📱 3. CHI TIẾT TÍNH NĂNG 5 TAB CHUẨN MỚI

### 3.1. Tab 0: Sổ Nhật Ký (Home / JournalView)
* **Greeting Header:** Lời chào ngày mới theo ngữ cảnh thời gian + Biệt danh người dùng + Huy hiệu chuỗi Streak rực rỡ.
* **Vị trí PigFly (Anti-Overlap Layout):** Chú heo PigFly bay lơ lửng nhẹ nhàng ngay cạnh Chuỗi Streak ở Greeting Header, tuyệt đối không đặt đè lên các thẻ số liệu tài chính.
* **Thẻ Hạn Mức Ngày (Daily Allowance Card):** 
  - Hiển thị rõ ràng: `HÔM NAY TIÊU ĐƯỢC` và `ĐÃ CHI HÔM NAY` với font số `tabular-nums` chống giật.
  - Hỗ trợ chế độ làm mờ riêng tư: Chuyển thành `•••• đ` khi bật "Ẩn tiền".
* **Thuật toán Rollover 100%:** Toàn bộ số tiền dư (hoặc thâm hụt) của ngày hôm trước được tự động kết chuyển 100% sang ngày tiếp theo.
* **Lịch Ảnh 7 Cột (Photo Calendar Carousel / Grid):** Xem lại toàn bộ ảnh chi tiêu theo dạng dòng thời gian tuần hoặc lưới tháng trực quan.

### 3.2. Tab 1: Thống Kê (StatsView)
* **Album Ảnh Cuộn Dọc 3:4:** Lướt xem lại từng khoảnh khắc chi tiêu thực tế trong tháng.
* **Hộp Cảm Xúc Tài Chính PigFly (Sentiment Card):**
  - Tỷ lệ tiết kiệm $\ge 20\%$: PigFly vỗ cánh bay vút lên kèm hiệu ứng sao lấp lánh (Vui mừng).
  - Chi tiêu chạm ngưỡng cảnh báo: PigFly xòe cánh ôm đầu lo lắng nhẹ nhàng, nhắc nhở tích cực.
* **Bộ 3 Chỉ Số Sức Khỏe Tài Chính (Financial KPIs):**
  1. *Tỷ lệ Tiết kiệm (Savings Rate)*: Tỷ lệ % tích lũy trên tổng thu nhập.
  2. *Tốc độ Đốt tiền (Burn Rate)*: Chi tiêu trung bình thực tế mỗi ngày.
  3. *Đường băng Dự phòng (Runway Forecast)*: Dự báo số ngày sống sót với số dư hiện tại.

### 3.3. Tab 2: Camera & Locket Feed (Trung Tâm Mở Đầu)
* **Khung Ngắm Kính Locket 4:5:** Bo góc Squircle 24px thoáng đãng 100%, 4 ngàm vàng tinh tế, không có bất kỳ linh vật nào treo trên viền cản trở tầm nhìn.
* **Nút Shutter 1-Chạm:** Nhún xúc giác Haptics (`impactAsync`), mở ngay khay chọn danh mục và chip giá nhanh $\le 3$ giây.
* **Thanh Toán VietQR Offline:** Nhận diện mã QR theo chuẩn quốc tế EMVCo và NAPAS; tự động bóc tách số tiền và mở ứng dụng ngân hàng tương ứng chỉ với 1 chạm.
* **Locket Bank Snapshot:** Nhận thông báo biến động số dư $\rightarrow$ Mở Camera ghim sẵn số tiền $\rightarrow$ Chụp ảnh món đồ lưu làm kỷ niệm chi tiêu.

### 3.4. Tab 3: Cố Vấn & Squad Room (ChatView)
* **Anh Minh AI Coach (Gemini API 2 chiều):** Cố vấn tài chính thông thái với bộ lọc 3 câu hỏi phản biện chống chi tiêu cảm tính (FOMO).
* **Squad Nuôi Heo PigFly (2–4 bạn bè):**
  - Tạo hoặc gia nhập phòng bằng mã code 6 ký tự (ví dụ: `PIG925`).
  - Trạng thái ăn của heo: Tự động chuyển thành "Đã cho ăn" khi thành viên ghi ít nhất 1 khoản chi tiêu trong ngày.
  - Tương tác nhóm: Nút `👉 Nhắc đói` (khi bạn chưa ghi chép) và nút `🎉 Vỗ béo` (kỷ niệm giữ hạn mức).

### 3.5. Tab 4: Hồ Sơ Cá Nhân & Cài Đặt (Profile & Settings)
* **Thẻ Cân Bằng Ngân Sách (Budget Settings):**
  - Tiêu đề: `Hôm nay tiêu được`.
  - Con số tiền thực tế: `[Số tiền] đ / ngày` (Định dạng font số `tabular-nums`, màu Nắng Thu `#E59844`, tuyệt đối không có hardcode "ly trà sữa").
* **Mục Tiêu Tích Lũy Thác Nước (Waterfall Allocation):** Tiền tiết kiệm tự động dồn lần lượt vào mục tiêu ưu tiên số 1 cho đến khi hoàn thành mới chuyển sang mục tiêu số 2.
* **Trung Tâm Bảo Mật Minh Bạch (Settings & Security):**
  - Không còn bất kỳ pill rác nào (`Đang ghim`, `Trừ ngầm`).
  - Cam kết 100% Local Processing & Không can thiệp tiền thật.
  - Tuyên ngôn Zero-STK & Zero-Account Shield (chặn 100% tin nhắn chứa OTP, mật khẩu).
  - VietQR chuẩn NAPAS/EMVCo: Kepi/PigFly không phải trung gian thanh toán và không giữ tiền.

---

## 🔒 4. QUY CHUẨN BẢO MẬT & QUYỀN RIÊNG TƯ (ZERO-STK SHIELD)

1. **Tuyệt đối KHÔNG lưu số tài khoản (STK):** CSDL, SQLite, AsyncStorage và Logs không bao giờ lưu trữ số tài khoản người nhận hay số tài khoản người chuyển.
2. **Làm sạch EXIF ảnh tự động:** Mọi bức ảnh chụp hoặc tải lên đều được lọc sạch tọa độ GPS và thông tin phần cứng thiết bị trước khi lưu.
3. **Chế độ Ẩn Tiền Toàn Ứng Dụng:** Khi kích hoạt, toàn bộ số tiền trên cả 5 Tab và thông báo đẩy đều được mã hóa thành `•••• đ`.
4. **Bóc tách thông báo 100% Ngoại tuyến:** Sử dụng thuật toán Regex Offline chạy trực tiếp trên RAM thiết bị Android, không gửi nội dung thông báo lên máy chủ.

---

## 🎨 5. HỆ THỐNG THẨM MỸ HÀ NỘI THU ĐÔNG (DESIGN SYSTEM)

* **Nền sáng (Sữa Ngà Bơ):** `#FAF6EC` / `#FAF6F0`
* **Nền tối & Camera (Khói Trầm Đêm Đông):** `#0E1620` / `#161816`
* **Accent chính (Nắng Thu Hà Nội):** `#E59844` (Tương phản WCAG 8.2:1)
* **Trạng thái Tiết kiệm / An toàn:** `#7E9F80` (Cốm Non Làng Vòng)
* **Trạng thái Chi / Cảnh báo:** `#C86D51` (Ngói Rêu Phố Cổ)
* **Kiểu chữ:** Tiêu đề thơ mộng **Be Vietnam Pro**; số tài chính dùng `tabular-nums`.
* **Icons:** 100% Vector `lucide-react-native`, `strokeWidth: 2.6`, không viền hộp (`borderWidth: 0, backgroundColor: 'transparent'`).
