# 📱 TÍNH NĂNG TỪNG TRANG: PIGFLY (PAGES_FEATURES.MD)

> **Dự án:** PigFly (Ví Locket) — Mobile App Chi Tiêu Bằng Ảnh & Quét Mã QR  
> **Phiên bản:** NEW v3.0 (Đã loại bỏ hoàn toàn tính năng Voice, tối ưu tốc độ ghi chép $\le 3$s, linh vật PigFly và bảo mật Zero-STK)  
> **Phong cách thiết kế:** Hà Nội Thu Đông, 100% Vector Icons nổi trần `lucide-react-native` (`strokeWidth: 2.6`, không viền bo hộp), font số `tabular-nums`.

---

## 🧭 0. CẤU TRÚC ĐIỀU HƯỚNG 5 TRANG

Thứ tự từ trái sang phải trên thanh điều hướng mờ kính (Floating Borderless Tab Bar). **Camera ở vị trí trung tâm (Tab index = 2) và là trang mở đầu mặc định của ứng dụng.**

| # | Trang (Tab) | Icon Vector | Định Vị Cốt Lõi |
|:---:|:---|:---:|:---|
| **0** | **Home (Sổ Nhật Ký)** | `BookOpen` | "Hôm nay mình ổn không?" Nhìn nhanh số dư ngày, chuỗi Streak, lịch ảnh 7 cột và PigFly bay chào tại Greeting Header. |
| **1** | **Thống Kê (Stats)** | `PieChart` | "Tháng này tiền đi đâu?" Album ảnh tháng 3:4, Hộp Cảm Xúc PigFly và 3 chỉ số sức khỏe tài chính KPI. |
| **2** | **Camera (Trung tâm)** | `Camera` | **Trang mở đầu mặc định.** Ghi 1 khoản trong $\le 3$ giây, quét mã VietQR và xem Lịch sử chi tiêu ngày. |
| **3** | **Cố Vấn & Squad (Chat)** | `MessageSquare` | Hỏi đáp tài chính với Anh Minh AI Coach + Phòng Squad Nuôi Heo PigFly cùng nhóm 2–4 bạn thân. |
| **4** | **Hồ Sơ & Cài Đặt (Profile)** | `User` | Hạn mức ngày chuẩn xác `Hôm nay tiêu được` (0 hardcode), Mục tiêu Thác nước, và Trung tâm bảo mật Zero-STK. |

---

## 📖 1. TAB 0: SỔ NHẬT KÝ (HOME)

*Chi tiết quy chuẩn giao diện xem tại [docs/screens/HOME.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/screens/HOME.md).*

### 1.1. Mục Tiêu Trải Nghiệm
Trả lời tức thì trong 3 giây: *"Hôm nay còn tiêu được bao nhiêu? Mình đang ổn hay đang lố ngân sách?"*

### 1.2. Các Khối Chức Năng Chính
1. **Greeting Header & PigFly Floating Mascot:**
   - Lời chào theo giờ sáng/trưa/tối + Biệt danh người dùng.
   - Huy hiệu Chuỗi Ngày Liên Tiếp (Streak Badge) rực rỡ.
   - **Chú Heo Bay PigFly:** Bay lơ lửng nhẹ nhàng cạnh chuỗi Streak (được định vị an toàn trong Greeting Header, 0% che khuất số liệu).
2. **Thẻ Hạn Mức Ngày (Today Allowance Card):**
   - Hai thông số chủ đạo: `HÔM NAY TIÊU ĐƯỢC` và `ĐÃ CHI HÔM NAY`.
   - Font số `tabular-nums` chống giật khi số đếm nhảy (RollingNumber animation).
   - Nút con mắt bật/tắt chế độ **Ẩn tiền** (`•••• đ`).
3. **Thuật Toán Rollover 100%:**
   - Toàn bộ số tiền thừa hoặc thâm hụt của ngày hôm qua được tự động kết chuyển tiếp nối 100% sang ngày hôm nay.
4. **Bộ Lịch Thích Ứng (Adaptive Photo Calendar):**
   - Chế độ Tuần: Dải tuần Carousel cuộn ngang nhanh chóng.
   - Chế độ Tháng: Lưới 7 cột (T2..CN), mỗi ô hiển thị ảnh bìa món đồ đã mua kèm badge `+N` số lượng ảnh. Chạm vào ô mở Bottom Sheet chi tiết ngày.
5. **Dải Hộp Xác Nhận (Confirmation Pill Banner):**
   - Tự động xuất hiện khi có khoản PENDING (từ quét VietQR, ZaloPay, MoMo) hoặc Giỏ chờ định mua đến hạn.

---

## 📊 2. TAB 1: THỐNG KÊ (STATS)

*Chi tiết quy chuẩn giao diện xem tại [docs/screens/STATS.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/screens/STATS.md).*

### 2.1. Mục Tiêu Trải Nghiệm
Một "cuốn album ảnh tài chính" cuộn dọc: lướt từ tháng mới nhất xuống các tháng cũ, thấy ngay từng món đồ thực tế mình đã bỏ tiền mua.

### 2.2. Các Khối Chức Năng Chính
1. **Hộp Cảm Xúc Tài Chính PigFly (Sentiment Card):**
   - Tỷ lệ tiết kiệm $\ge 20\%$: PigFly vỗ cánh bay vút lên kèm hiệu ứng sao lấp lánh (Vui mừng).
   - Chi tiêu chạm ngưỡng báo động: PigFly xòe cánh ôm đầu lo lắng nhẹ nhàng, không gây ức chế tâm lý.
2. **Album Ảnh Tháng Tỉ Lệ 3:4:**
   - Lưới 3 cột ảnh cuộn mượt mà; góc dưới mỗi ô gắn nhãn giá tiền (hoặc `+` tiền thu).
   - Chạm vào từng ảnh để mở Sheet xem chi tiết, sửa hoặc xóa (có hoàn tác 5 giây).
3. **Bộ 3 Chỉ Số Sức Khỏe Tài Chính KPI (In-App Analytics):**
   - *Tỷ lệ Tiết kiệm (Savings Rate):* Đo lường khả năng tích lũy.
   - *Tốc độ Đốt tiền (Burn Rate):* Mức tiêu hao trung bình mỗi ngày.
   - *Đường băng Dự phòng (Runway Forecast):* Dự báo số ngày sống sót với số dư hiện có.
4. **Tự Động Lưu Trữ Mốc Tháng (Auto Monthly Archive):**
   - 00:00 ngày đầu tháng tự động đóng gói mốc báo cáo tháng cũ và mở chu kỳ tháng mới, dòng tiền liên tục `Running Balance` không bắt người dùng reset thủ công.

---

## 📸 3. TAB 2: CAMERA & LOCKET FEED (TRUNG TÂM)

*Chi tiết quy chuẩn giao diện xem tại [docs/screens/CAMERA.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/screens/CAMERA.md).*

### 3.1. Mục Tiêu Trải Nghiệm
Ghi một khoản chi tiêu bằng ảnh **trong $\le 3$ giây**, hoặc quét mã thanh toán VietQR ngoại tuyến tức thì.

### 3.2. Mặt Cuộn Liên Tục (Tactile Continuous Surface)
* Khung ngắm Camera chiếm nửa trên màn hình; khi người dùng vuốt trượt lên, ảnh chi tiêu gần nhất trong ngày lộ dần ra bên dưới.
* **Khung ngắm 4:5 Squircle Bo Góc 24px:** 4 ngàm vàng tinh tế, không gian thoáng đãng 100%, không bị linh vật che khuất.

### 3.3. Các Phương Thức Nhập Liệu Cực Tốc (0 Voice)
1. **Chụp ảnh 1-chạm:** Bấm Shutter nhún xúc giác $\rightarrow$ Hiển thị dải chip giá nhanh (20k, 30k, 50k, 100k, 200k, 500k) hoặc gõ số tiền $\le 3$s $\rightarrow$ Bấm Lưu.
2. **Quét Mã Chuyển Khoản VietQR:**
   - Tự động nhận diện mã VietQR trong khung ngắm ($\le 1.0$s) bằng thuật toán Regex Offline chuẩn EMVCo/NAPAS.
   - Tự động mở App ngân hàng tương ứng qua Deeplink chính thức.
   - Sau khi thanh toán, hiển thị thẻ hỏi *"Đã chuyển xong chưa?"* để ghi sổ khoản PENDING thành CONFIRMED.
3. **Locket Bank Snapshot:**
   - Nhận thông báo trừ tiền ngân hàng $\rightarrow$ Mở Camera ghim sẵn số tiền $\rightarrow$ Bấm Shutter chụp món đồ $\rightarrow$ Lưu thành giao dịch có ảnh Locket sống động.
4. **Chế Độ Định Mua (Thẻ Giá Thật):**
   - Khoản tiền $\ge 200.000$ đ tự động quy đổi ra số ngày "Hôm nay tiêu được" hoặc số giờ làm việc, kèm 3 lựa chọn: Mua ngay / Để sau (24h/72h) / Không mua.

---

## 💬 4. TAB 3: CỐ VẤN & SQUAD ROOM (CHAT)

*Chi tiết quy chuẩn giao diện xem tại [docs/screens/CHAT.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/screens/CHAT.md).*

### 4.1. Ngăn Cố Vấn Anh Minh AI (AI Coach)
* **Persona:** Người anh PT tài chính thẳng tính, ấm áp, am hiểu tâm lý Gen Z.
* **Bộ lọc 3 câu hỏi phản biện:**
  1. Món này có giá trị sử dụng thật không hay chỉ mua theo trend?
  2. Bồ có chấp nhận giảm ngân sách các ngày tới để mua món này không?
  3. Sau 30 ngày nữa, món đồ này còn làm bồ vui không?
* **Tích hợp:** Trả về thẻ số liệu trực quan, cho phép chạm để mở thẳng Thống kê hoặc Sổ nhật ký.

### 4.2. Ngăn Squad Nuôi Heo PigFly (Nhóm 2–4 Bạn Bè)
* **Cơ chế phòng:** Tạo phòng hoặc tham gia bằng mã code 6 ký tự (ví dụ: `PIG925`).
* **Trạng thái nuôi heo:**
  - Thành viên ghi ít nhất 1 khoản trong ngày $\rightarrow$ Heo hiển thị trạng thái "Đã cho ăn".
  - Thành viên quên ghi chép $\rightarrow$ Trạng thái "Heo đang đói" kèm nút `👉 Nhắc đói`.
  - Giữ vững ngân sách cả tuần $\rightarrow$ Nút `🎉 Vỗ béo` gửi hiệu ứng pháo hoa và năng lượng bay FEP.

---

## 👤 5. TAB 4: HỒ SƠ & CÀI ĐẶT (PROFILE)

*Chi tiết quy chuẩn giao diện xem tại [docs/screens/PROFILE.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/screens/PROFILE.md).*

### 5.1. Thẻ Cân Bằng Ngân Sách (Budget Settings)
* **Hạn mức tiêu ngày:**
  - Tiêu đề: `Hôm nay tiêu được`.
  - Hiển thị số tiền thực tế: `[Số tiền] đ / ngày` (Định dạng `tabular-nums`, màu cam Nắng Thu `#E59844`).
  - **Tuyệt đối KHÔNG có text hay pill hardcode 'khoảng 1 ly trà sữa'.**
* **Thanh trượt Thu Nhập / Tiết Kiệm:** Điều chỉnh linh hoạt tỷ lệ tích lũy từ $10\%$ đến $50\%$.

### 5.2. Mục Tiêu Tích Lũy Thác Nước (Waterfall Allocation)
* Tiền tiết kiệm tự động dồn 100% vào mục tiêu ưu tiên số 1 (ví dụ: Mua Laptop, Quỹ khẩn cấp).
* Tự động tính toán ngày về đích ETA dự kiến dựa trên tốc độ tích lũy thực tế hàng tháng.

### 5.3. Trung Tâm Bảo Mật & Tiện Ích Tích Hợp (Zero-STK Shield)
* **Tiện ích Màn hình khóa:** Bật/tắt thanh theo dõi số dư cục bộ (100% Local Processing).
* **Tự động nhận diện biến động số dư:** Tuyên ngôn Zero-STK không bao giờ lưu số tài khoản, lọc sạch 100% tin nhắn chứa OTP trên RAM.
* **Thanh toán VietQR:** Bóc tách ngoại tuyến chuẩn NAPAS/EMVCo, cam kết ứng dụng không phải cổng thanh toán và không giữ tiền.
* **Quyền riêng tư dữ liệu:** Nút `Đặt lại dữ liệu` và `Xóa tài khoản in-app` (đáp ứng bắt buộc theo Apple Store Review).
