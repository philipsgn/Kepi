# 🐷 MASTER PRD: PIGFLY (VÍ LOCKET v4.1)

> **Dự án:** PigFly (Ví Locket) — Mobile App Chi Tiêu Bằng Ảnh, Quét Mã QR & AI-First Gamification  
> **Phiên bản:** NEW v4.1 (AI-First Dual-Scan, Voice NLP, Cờ Tỷ Phú & Chuỗi Streak Kỷ Luật — Zero Virtual Points)  
> **Slogan thương hiệu:** *"PigFly: Tiết kiệm – Duy trì – Sinh lời bền vững"*  
> **Nguồn Sự Thật Duy Nhất (Single Source of Truth):** Tài liệu này định hình toàn bộ kiến trúc, giao diện và luồng trải nghiệm người dùng của PigFly.

---

## 🌟 1. TẦM NHÌN SẢN PHẨM & TRIẾT LÝ AI-FIRST GAMIFICATION

### 1.1. Bối cảnh & Vấn đề Cần Giải Quyết
Các ứng dụng ghi chép tài chính truyền thống thường thất bại với Gen Z vì:
1. **Quá khô khan và phức tạp:** Bắt người dùng nhập liệu bằng bàn phím với hàng chục trường số liệu tẻ nhạt.
2. **Thiếu cảm xúc & Động lực duy trì:** Người dùng thường từ bỏ sau 3–5 ngày vì cảm giác "tự trừng phạt" mỗi khi mở app xem số tiền đã mất.
3. **Mối lo về an toàn dữ liệu ngân hàng:** Người dùng e ngại khi các app yêu cầu liên kết tài khoản ngân hàng hoặc đọc tin nhắn nhạy cảm.

### 1.2. Giải Pháp Đột Phá Từ PigFly v4.1
PigFly kết hợp **Trực quan hóa chi tiêu bằng ảnh (Locket style)**, **Công nghệ AI-First (OCR Hóa Đơn, Voice-to-Expense, Vision Tagging)** cùng **Game hóa Thực Tế (Không Tiền Ảo — Zero FEP)**:
* **Ghi sổ tức thì $\le 3$ giây:** Chụp ảnh món đồ thực tế, quét hóa đơn bằng AI OCR, nói tự nhiên qua Voice NLP, hoặc quét VietQR tự động.
* **Biểu tượng chú heo biết bay (When pigs fly):** Biến việc tích lũy tài chính thành hành trình nhẹ nhàng, vui vẻ. Khi người dùng chi tiêu trong hạn mức, chú heo PigFly nhẹ nhõm vỗ cánh bay cao qua 5 tầng mây tài chính với 4 trạng thái cảm xúc sống động (`FLYING_HIGH`, `CHILL`, `PANIC`, `STARVING`).
* **Động lực Chuỗi Ngày Kỷ Luật (Streak Days):** Đơn giản, trực quan và dễ hiểu như Locket & Duolingo, không dùng điểm ảo gây rối mắt.
* **Mini-Game Cờ Tỷ Phú Đầu Tư Tài Chính:** Bàn cờ 16 ô thử thách tài chính (Né bẫy FOMO, Đầu tư tích lũy, Rút thẻ cơ hội, Học flashcards).
* **Squad Nuôi Heo 2.0 (Tối đa 4 bạn thân):** Feed ảnh chi tiêu real-time, Leaderboard thi đua và **SOS Overspending Alarm** (cầu cứu bạn bè khi bội chi).
* **Báo Cáo Magazine Anime Trong Tab Stats:** Báo cáo định kỳ tuần/tháng dạng tạp chí Manga cuộn dọc với bộ 3 chỉ số mới (*Runway Score*, *Impulse Ratio*, *Savings Velocity*).
* **Tôn chỉ Bảo mật Độc lập (Zero-STK Shield):** Tuyệt đối KHÔNG lưu trữ số tài khoản, số thẻ; xử lý bóc tách 100% Offline trên RAM điện thoại.

---

## 🧭 2. CẤU TRÚC ĐIỀU HƯỚNG 5 TAB (NAVIGATION MATRIX)

Hệ thống điều hướng sử dụng **Floating Borderless Tab Bar** chuẩn phong cách Pop-Anime / Y2K với 100% Vector Icons (`lucide-react-native`, `strokeWidth: 2.6`, không hộp viền).

| Tab # | Tên Tab | Icon Vector | Trọng Tâm Trải Nghiệm & Vai Trò |
|:---:|:---|:---:|:---|
| **Tab 0** | **Sổ Nhật Ký (Home)** | `BookOpen` | "Hôm nay mình tiêu thế nào?" Xem nhanh hạn mức ngày, chuỗi Streak rực rỡ, lịch ảnh 7 cột, và chú heo PigFly Lottie bay chào lơ lửng tại Greeting Header. |
| **Tab 1** | **Thống Kê (Stats)** | `PieChart` | "Tháng này tiền đi đâu?" Cuộn Album ảnh tháng 3:4, Hộp Cảm Xúc Tài Chính PigFly, **Báo Cáo Tạp Chí Anime (Weekly/Monthly Magazine Digest)** và 3 chỉ số sức khỏe KPI. |
| **Tab 2** | **Camera (Trung tâm)** | `Camera` | **Trang mở đầu mặc định.** Khung ngắm 4:5 sạch 100%, nút Shutter xúc giác 1-chạm, **Nút Voice-to-Expense 🎤**, **AI Receipt OCR Scanner Carousel $\le 3$s**, Quét mã VietQR và Locket Bank Snapshot. |
| **Tab 3** | **Cố Vấn & Squad (Chat)** | `MessageSquare` | Trò chuyện phản biện chống FOMO cùng Anh Minh AI Coach, **Mini-Game Cờ Tỷ Phú Tài Chính**, song hành cùng **Squad Nuôi Heo PigFly 2.0 (Feed RT, SOS Alarm, Leaderboard)**. |
| **Tab 4** | **Cá Nhân & Cài Đặt (Profile)** | `User` | Thiết lập ngân sách ngày `Hôm nay tiêu được` (0 hardcode), Mục tiêu Thác nước Waterfall, và Trung tâm bảo mật minh bạch Zero-STK. |

---

## 📱 3. CHI TIẾT TÍNH NĂNG v4.1 CHUẨN MỚI

### 3.1. Tab 0: Sổ Nhật Ký (Home / JournalView)
* **Greeting Header:** Lời chào ngày mới theo ngữ cảnh thời gian + Biệt danh người dùng + Huy hiệu chuỗi Streak rực rỡ.
* **Vị trí PigFly Lottie (Anti-Overlap Layout):** Chú heo PigFly hiển thị dạng Lottie hoạt họa mượt mà, bay lơ lửng nhẹ nhàng ngay cạnh Chuỗi Streak ở Greeting Header, tự động đổi biểu cảm theo mood.
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
* **Báo Cáo Tạp Chí Anime (Weekly/Monthly Magazine Digest):**
  - Trải nghiệm cuộn dọc phong cách truyện tranh / tạp chí với lời bình dí dỏm "cà khịa có tâm" từ Anh PT Minh Locket.
  - Bộ 3 Chỉ Số Sức Khỏe Mới:
    1. *Runway Score*: Thời gian dòng tiền duy trì được đến cuối tháng (ngày).
    2. *Impulse Ratio*: Tỷ lệ chi tiêu cho những mục không thiết yếu (%).
    3. *Savings Velocity*: Tốc độ tiến tới mục tiêu tài chính tương lai (đ/ngày).

### 3.3. Tab 2: Camera & Dual-Scan AI Hub (Trung Tâm Mở Đầu)
* **Khung Ngắm Kính Locket 4:5:** Bo góc Squircle 24px thoáng đãng 100%, 4 ngàm vàng tinh tế, không có linh vật che khuất.
* **Nút Shutter 1-Chạm & Voice Button 🎤:**
  - Nhún xúc giác Haptics (`impactAsync`), mở ngay khay chọn danh mục và chip giá nhanh $\le 3$ giây.
  - Nút Voice 🎤: Bấm mở `CompactVoiceWaveSheet` nói câu tự nhiên ("Ăn bún bò 50 cành") $\to$ tự động điền tiền, danh mục, icon $\to$ 1-chạm [Lưu Sổ] trong $\le 2$s.
* **AI Receipt OCR Scanner (After Take Photo):**
  - Chụp hoặc tải ảnh hóa đơn $\to$ OCR chạy ngầm ngay sau khi chụp $\to$ Tự động bóc tách tên đơn vị, danh sách món, VAT, tổng tiền $\to$ Dải Carousel Fallback chọn nhanh số tiền chuẩn xác $\le 3$s trên `LocketReviewModal`.
* **On-Device Vision Tagging:**
  - Nhận diện ảnh chụp ngoại tuyến 100% (món ăn, đồ dùng, xe cộ) $\to$ Tự động đề xuất category chuẩn xác.
* **Thanh Toán VietQR Offline & Locket Bank Snapshot:** Nhận diện mã QR theo chuẩn EMVCo và NAPAS; tự động mở app ngân hàng; ghim số tiền thông báo ngân hàng lên ảnh chụp.

### 3.4. Tab 3: Cố Vấn, Cờ Tỷ Phú & Squad Room 2.0 (ChatView)
* **Anh Minh AI Coach (Gemini API 2 chiều):** Cố vấn tài chính thông thái với bộ lọc 3 câu hỏi phản biện chống chi tiêu cảm tính (FOMO).
* **Mini-Game Cờ Tỷ Phú Đầu Tư Tài Chính:**
  - Bàn cờ 16 ô thử thách: Ô Khởi hành, Ô Cơ hội, Ô Bẫy FOMO (Bỏ qua/Cứu ví), Ô Đầu tư tích lũy, Ô Quỹ khẩn cấp, Ô Cổ tức.
  - Lượt đổ xúc xắc hàng ngày + thưởng thêm lượt khi ghi chép có ảnh.
* **Squad Nuôi Heo 2.0 (Tối đa 4 bạn thân):**
  - Feed nội bộ thời gian thực hiển thị ảnh chi tiêu của bạn bè trong squad.
  - **SOS Overspending Alarm Protocol:** Khi một thành viên tiêu vượt hạn mức ngày, chú heo của người đó phát tín hiệu cầu cứu sang màn hình 3 bạn thân để thả meme và hỗ trợ tinh thần.
  - Leaderboard Squad: Bảng xếp hạng thi đua chuỗi Streak nhóm hàng tuần.

### 3.5. Tab 4: Hồ Sơ Cá Nhân & Cài Đặt (Profile & Settings)
* **Thẻ Cân Bằng Ngân Sách (Budget Settings):**
  - Tiêu đề: `Hôm nay tiêu được`.
  - Con số tiền thực tế: `[Số tiền] đ / ngày` (Định dạng font số `tabular-nums`, không hardcode).
* **Mục Tiêu Tích Lũy Thác Nước (Waterfall Allocation):** Tiền tiết kiệm tự động dồn lần lượt vào mục tiêu ưu tiên số 1 cho đến khi hoàn thành mới chuyển sang mục tiêu số 2.
* **Trung Tâm Bảo Mật Minh Bạch (Settings & Security):**
  - Cam kết 100% Local Processing & Không can thiệp tiền thật.
  - Tuyên ngôn Zero-STK & Zero-Account Shield (chặn 100% tin nhắn chứa OTP, mật khẩu).
  - Tùy chọn tiện ích Android AppWidget ghim số dư ra màn hình chính.

---

## 🔒 4. QUY CHUẨN BẢO MẬT & QUYỀN RIÊNG TƯ (ZERO-STK SHIELD)

1. **Tuyệt đối KHÔNG lưu số tài khoản (STK):** CSDL, SQLite, AsyncStorage và Logs không bao giờ lưu trữ số tài khoản người nhận hay số tài khoản người chuyển (kể cả từ kết quả OCR hóa đơn).
2. **Làm sạch EXIF ảnh tự động:** Mọi bức ảnh chụp hoặc tải lên đều được lọc sạch tọa độ GPS và thông tin phần cứng thiết bị trước khi lưu.
3. **Chế độ Ẩn Tiền Toàn Ứng Dụng:** Khi kích hoạt, toàn bộ số tiền trên cả 5 Tab và thông báo đẩy đều được mã hóa thành `•••• đ`.
4. **Bóc tách thông báo 100% Ngoại tuyến:** Sử dụng thuật toán Regex Offline chạy trực tiếp trên RAM thiết bị Android, không gửi nội dung thông báo lên máy chủ.
