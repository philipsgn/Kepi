# TÀI LIỆU ĐẶC TẢ SẢN PHẨM — VÍ LOCKET / KEPI (PRD v4.1)
## Mobile App Chi Tiêu Bằng Ảnh & Quét Mã QR — Phong Cách Hà Nội Thu Đông

> **Dự án:** Kepi (Ví Locket)  
> **Phiên bản tài liệu:** 4.1 (Loại bỏ tính năng Voice, tối ưu tốc độ $\le 3$s & bảo vệ quyền riêng tư 0 quyền Micro)  
> **Lần cập nhật cuối:** 2026-10-05  
> **Đối tượng người dùng:** Người trẻ, sinh viên và Gen Z tại các đô thị muốn kiểm soát tài chính cá nhân một cách nhẹ nhàng, bài trừ cám dỗ mua sắm bốc đồng theo trend mạng xã hội.

---

## 1. TỔNG QUAN & TẦM NHÌN SẢN PHẨM

Ví Locket v4.1 không phải là một cuốn sổ kế toán khô khan hay một bảng tính Excel phức tạp. Đây là một **cuốn album khoảnh khắc chi tiêu sống động**, được bao bọc trong chất thơ và phong cách **Hà Nội Thu Đông ("Ấm, Tĩnh, Sang")**, đồng hành cùng người bạn **AI Coach Minh ("Anh PT Tài Chính Giữ Ví")**.

Ứng dụng giúp người dùng trả lời câu hỏi cốt tử trong 3 giây trước khi rút ví:
> *"Món đồ này có tiện ích thực tế cho cuộc sống của mình hay chỉ là bốc đồng mua theo trend trên mạng xã hội? Khoản chi này đẩy lùi mục tiêu cá nhân của mình bao xa?"*

### Giá Trị Cốt Lõi:
1. **0-Friction Visual Input:** Mở app vào thẳng khung ngắm camera, chụp ảnh 1 chạm kết hợp chip giá nhanh trong 3 giây. Cho phép quét mã VietQR, upload ảnh chuyển khoản từ thư viện hoặc ghi chép nhanh bằng text (Hoàn toàn không yêu cầu quyền Microphone).
2. **Chi Tiêu Có Cảm Xúc (Locket Visual Standard):** Mỗi khoản tiền đều gắn với một hình ảnh thực tế hoặc icon đơn sắc sang trọng, biến lịch sử chi tiêu thành dòng thời gian album khoảnh khắc đáng nhớ.
3. **Phản Biện Trước Khi Chi:** Chế độ *Định Mua* quy đổi giá trị món đồ ra số giờ làm việc thực tế và ngày ngân sách, chặn đứng hội chứng sợ bỏ lỡ (FOMO).
4. **Đồng Hành Kỷ Luật Cùng Anh Minh:** Chat 2 chiều thông minh qua Gemini API, hỗ trợ tư vấn giáo án siết chi tiêu và bài học tài chính bỏ túi.

### 1.1. CHIẾN LƯỢC CẠNH TRANH ĐỘT PHÁ (UNFAIR ADVANTAGES VS COMPETITORS)
Xuất phát từ việc phân tích sâu các bức xúc và rào cản lớn nhất của người dùng trên các ứng dụng quản lý chi tiêu hiện có trên thị trường, Kepi định vị các lợi thế độc quyền:
- **Ghi chép & Lưu ảnh KHÔNG GIỚI HẠN:** Tuyệt đối 0 bóp nghẹt tính năng, 0 giới hạn 3 giao dịch/ngày hay 60 ảnh/tháng, 0 bắt người dùng xem video quảng cáo để được ghi sổ.
- **Dòng Tiền Liên Tục (`Running Balance`) & Tự Động Chốt Mốc Tháng:** Tiền thừa cuối tháng tự động là số dư đầu tháng sau (như tài khoản ngân hàng thực tế). Loại bỏ hoàn toàn điểm khó chịu "bắt reset chu kỳ thủ công mỗi tháng"; hệ thống tự động chốt mốc lưu trữ độc lập vào tab Thống Kê vào 00:00 ngày đầu tháng.
- **Bảo Vệ Bộ Nhớ Thiết Bị:** Tự động nén WebP siêu nhẹ ($\le 80$KB), lưu bền vững trên Supabase Cloud và tự động dọn dẹp cache cục bộ. Không lo ngập tràn bộ nhớ máy.
- **An Toàn Dữ Liệu Vĩnh Viễn:** Đồng bộ mây thời gian thực 2 chiều với Supabase RLS. Khi đổi điện thoại hoặc reset máy, toàn bộ lịch sử chi tiêu và ảnh được khôi phục 100%.
- **Hệ Thống Danh Mục Tùy Biến (Custom Categories Engine):** Phân tách rõ ràng THU & CHI, cho phép tự do Thêm/Sửa/Xóa/Chọn Icon/Chọn Màu sắc cá nhân hóa.
- **Chân Thực Tuyệt Đối:** Không tạo giao dịch ngầm tự động (0 recurring auto-transactions) để đảm bảo thời gian ghi chép và hình ảnh phản ánh chân thực 100% cuộc sống người dùng.

---

## 2. KIẾN TRÚC ĐIỀU HƯỚNG 5 TAB (THE 5 INTERCONNECTED PILLARS)

Ứng dụng được tổ chức thành 5 không gian chức năng đồng bộ, kết nối qua thanh điều hướng nổi dạng viên thuốc **Floating Pill Tab Bar**:

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                  VÍ LOCKET v4.1                                  │
├─────────────────┬─────────────────┬─────────────────┬──────────────┬─────────────┤
│ TAB 0: HOME     │ TAB 1: THỐNG KÊ │ TAB 2: CAMERA   │ TAB 3: CHAT  │ TAB 4: HỒ SƠ│
│ Cuốn Sổ Lịch Ảnh│ Album Tháng 3:4 │ Photobooth Tròn │ Anh Minh PT  │ Mục Tiêu &  │
│ Ngân Sách Ngày  │ Sinh Lực (HP)   │ & Locket Stream │ Tư Vấn 2 Chiều│ Bài Học Ví  │
└─────────────────┴─────────────────┴─────────────────┴──────────────┴─────────────┘
```

---

### TRỤ CỘT 1: CAMERA PHOTOBOOTH & DÒNG KHOẢNH KHẮC LOCKET (TAB 2 — TRUNG TÂM HÀNH ĐỘNG)
*Định vị: Trái tim hành động của Ví Locket — Mở app vào thẳng khung ngắm, ghi nhận khoản chi/thu tức thì.*

- **Nền Chuyển Sắc Gradient Điện Ảnh (Cinematic Gradient):**
  - Đỉnh máy ảnh giữ tone tối điện ảnh tập trung vào ống kính, sau đó chuyển sắc êm dịu và hòa tan 100% vào màu Kem Sữa Ngà (`#FAF6EC` ở Light Mode) hoặc màu Đêm Đông (`#0E1620` ở Dark Mode) của dòng khoảnh khắc bên dưới.
- **Khung Ngắm Photobooth (Tỷ lệ 4:5):**
  - Bo góc mềm mại 24px, đổ bóng sâu khuếch tán, 4 ngàm góc vàng thanh mảnh 1.5px.
  - Hỗ trợ chạm đúp để lật nhanh giữa Camera Trước $\leftrightarrow$ Sau.
- **Hệ Thống Các Nguồn Dữ Liệu Ghi Nhận Linh Hoạt (0 Voice / Tối Ưu Tốc Độ $\le 3$s):**
  1. *Chụp ảnh món đồ:* Bấm nút Shutter đĩa tròn vàng ấm 1 chạm (có hiệu ứng nhún xúc giác cơ học `0.94x`), hiển thị chip giá thông minh $\le 3$s.
  2. *Quét mã VietQR:* Tự động nhận diện mã VietQR offline, deeplink mở app ngân hàng và ghi nhận khoản chi.
  3. *Tải ảnh từ thư viện (`ImagePlus`):* Nút cạnh Shutter cho phép chọn ảnh chụp màn hình chuyển khoản ngân hàng hoặc hóa đơn.
  4. *Ghi nhanh bằng text (`[ ✍️ Ghi nhanh ]`):* Mở modal xác nhận 1 khung hình (Zero-scroll) để nhập số tiền và ghi chú text mà không cần chụp ảnh.
- **Capsule Chế Độ Nút Nhấn Cố Định (`ModeSwitchPill`):**
  - 3 nút bấm độc lập: `[ Chi | Thu | Định mua ]`.
  - Chạm vào nút nào, viên thuốc màu vàng ấm lướt mượt mà bằng hiệu ứng lò xo (`Animated.spring`) đến ngay nút đó kèm rung `Light` Haptic.
- **Dòng Khoảnh Khắc Locket Liên Tục (`LocketMomentCard`):**
  - Cuộn dọc duy nhất từ dưới camera xuống để lướt xem các ảnh cũ gần nhất.
  - Mỗi thẻ ảnh có tỷ lệ 4:5, tag giá dính chân ảnh, thời gian tương đối (*"2g trước"*, *"Hôm qua"*).
  - Với các khoản ghi bằng text (không có ảnh): Hiển thị **Icon Danh Mục Đơn Sắc (Monochrome Category Icon)** ở trung tâm trên nền gốm ngà / khói tối trầm tối giản, thanh lịch.
- **Thao Tác 1-Chạm Quay Về Camera:**
  - Khi đang xem ảnh cũ phía dưới, chạm vào icon Camera ở chính giữa thanh `FloatingPillTabBar` sẽ tự động cuộn mượt về đỉnh camera (`y: 0`).

---

### TRỤ CỘT 2: CUỐN SỔ LỊCH ẢNH HÀ NỘI THU ĐÔNG (TAB 0 — HOME / JOURNAL)
*Định vị: Hiện tại trong ngày — Nơi quản lý hạn mức chi tiêu hôm nay và chuỗi ngày kiên định.*

- **Bộ Lịch Ảnh Tháng (`DayPhotoCell`):**
  - Mỗi ô ngày hiển thị ảnh chụp món đồ với hiệu ứng xếp chồng (Photo stack) và badge `+1`, `+2` thanh thoát.
  - Ngày không có ảnh: Hiển thị icon danh mục đơn sắc ở trung tâm.
  - Chạm vào ô ngày để mở **Bảng Chi Tiết Ngày (`DayDetailBottomSheet`)** liệt kê toàn bộ giao dịch, tổng chi, tổng thu và ảnh phóng to.
- **Công Thức Ngân Sách Ngày (Rollover 100% Thuần Khiết):**
  $$\text{Ngân sách hôm nay} = \frac{\text{Số dư khả dụng còn lại của tháng}}{\text{Số ngày còn lại trong tháng}}$$
  - Tiêu ít hôm nay $\rightarrow$ Ngày mai ngân sách tự động tăng lên.
  - Tiêu lố hôm nay $\rightarrow$ Ngày mai ngân sách tự động siết lại để bảo toàn số dư cuối tháng.
- **Chuỗi Ngày Không Chi Tiêu (No-Spend Streak):**
  - Biểu tượng lá mùa thu / ngọn lửa vàng đánh dấu chuỗi ngày kỷ luật thành công.
  - Nút bấm nhanh *"Hôm nay không tiêu gì"* để giữ vững chuỗi streak.
- **Chế Độ Bảo Mật Số Dư (Privacy Eye Toggle):**
  - Chạm nút con mắt trên header để ẩn/hiện số tiền (`•••••• đ`) khi dùng app ở nơi công cộng.

---

### TRỤ CỘT 3: THỐNG KÊ & ALBUM ẢNH THEO THÁNG (TAB 1 — STATS)
*Định vị: Bức tranh toàn cảnh tài chính — Cuộn album ảnh theo tháng và đánh giá sức khỏe dòng tiền.*

- **Cuộn Album Ảnh Theo Tháng (`MonthStickyHeader` & `MonthQuickJumper`):**
  - Thanh tiêu đề dính đầu hiển thị tháng đang xem (ví dụ: *"Tháng 10/2026"*) kèm bộ nhảy nhanh qua các tháng.
  - Lưới ảnh 3:4 đồng nhất (`TransactionPhotoCell`) tái hiện cảm xúc qua từng khung hình món đồ.
- **Thanh Sinh Lực (HP Bar) Ngân Sách:**
  - Trực quan hóa số dư còn lại của tháng dưới dạng thanh sinh lực phong cách game hóa nhẹ nhàng.
  - Chuyển màu động: Cốm Non (`#7E9F80` an toàn) $\rightarrow$ Nắng Thu (`#E59844` cảnh báo) $\rightarrow$ Ngói Rêu (`#C86D51` nguy hiểm).
- **Phân Tích Cơ Cấu Chi Tiêu:**
  - Biểu đồ phân bổ chi tiêu theo các nhóm chính: Ăn uống, Mua sắm, Đi lại, Hóa đơn, Giải trí, Học tập, Sức khỏe.
  - Tự động lọc ra món đồ đắt đỏ nhất trong tháng để tự nhìn nhận và điều chỉnh.

---

### TRỤ CỘT 4: AI COACH MINH LOCKET (TAB 3 — CHAT ANH PT TÀI CHÍNH)
*Định vị: Người bạn đồng hành thông minh — Cố vấn tài chính cá nhân 2 chiều qua Gemini API.*

- **Hình Tượng Signature Chân Dung Ấm Áp (`MinhAvatar`):**
  - Người bạn đồng hành nam thanh niên 25-28 tuổi điển trai, phong thái vững chãi như một huấn luyện viên thể hình (PT), nụ cười ấm áp, tin cậy.
- **Phòng Trò Chuyện 2 Chiều (Interactive Chatroom):**
  - Tích hợp Gemini API trực tiếp phân tích dòng tiền thực tế của người dùng để trả lời câu hỏi cá nhân hóa.
  - Phím tắt câu hỏi 1-chạm (`Quick Prompt Pills`): *"Minh ơi, hôm nay tiêu lố rồi thì sao?", "Lên giáo án siết chi tiêu tuần này giúp tui", "Đánh giá giỏ đồ chờ mua"*.
- **Bộ Lọc Phản Biện 3 Câu Hỏi Thông Minh của Minh:**
  1. **Tiện ích thực tế (Practical Utility):** *Món này bạn sẽ dùng bao nhiêu lần mỗi tuần? Có thực sự giải quyết vấn đề cấp bách không?*
  2. **Cảnh báo "Theo Trend" (FOMO Alert):** *Món này có đang hot nhất thời trên mạng xã hội nhưng dễ bị bỏ xó sau 2 tuần không?*
  3. **Tác động Mục Tiêu Cá Nhân (Goal Impact):** *Khoản chi này đẩy lùi mục tiêu cá nhân của bạn bao nhiêu ngày lao động?*

---

### TRỤ CỘT 5: HỒ SƠ & MỤC TIÊU CÁ NHÂN HÓA (TAB 4 — PROFILE & BÀI HỌC)
*Định vị: Bệ phóng tài chính cá nhân — Nơi quy đổi mọi món đồ ra mồ hôi công sức lao động.*

- **Thiết Lập Mục Tiêu Cá Nhân Hóa:**
  - Đặt mục tiêu ý nghĩa: *"Đổi Macbook mới"*, *"Chuyến đi Sa Pa mùa đông"*, *"Quỹ độc lập tài chính"*.
  - Nhập số tiền mục tiêu và hạn hoàn thành.
- **Quy Đổi Mức Lương Giờ (Hourly Wage Calculator):**
  - Nhập thu nhập hàng tháng $\rightarrow$ Tự động tính ra giá trị 1 giờ làm việc (ví dụ: 35.000 đ/giờ).
  - Khi xem bất kỳ món đồ nào, hệ thống đều quy đổi: *"Món áo khoác này tương đương 36 giờ làm việc của bạn"*.
- **Thư Viện Bài Học Tài Chính Bỏ Túi (Micro-Lessons):**
  - Các bài đọc súc tích 1–2 phút kèm hình ảnh minh họa về quản lý chi tiêu (ví dụ: *Quy tắc 50/30/20 cải tiến*, *Nghệ thuật giải cứu ví cuối tháng*, *Cách kiềm chế trước đợt sale lớn*).
- **Cấp Bậc Sức Khỏe Tài Chính (Financial Health Tier):**
  - Cấp 1: *Tân Thủ Khám Phá*
  - Cấp 2: *Chiến Thần Tỉnh Táo* (Kiềm chế được 5 món bốc đồng)
  - Cấp 3: *Bậc Thầy Ví Locket* (Đạt 50% mục tiêu cá nhân)

---

## 3. LOGIC NGHIỆP VỤ & QUY TẮC DỮ LIỆU ĐẶC BIỆT

1. **Chế độ Định Mua & Giỏ Chờ 24 Giờ (`wait_items`):**
   - Khi chụp hoặc gõ một món đồ ở chế độ *Định mua*, màn hình **Giá Thật (`ActualPriceSheet`)** sẽ mở ra để phân tích.
   - Nếu bấm **"Để sau"** $\rightarrow$ Đưa món đồ vào Giỏ Chờ (`WaitBasket`) với đồng hồ đếm ngược 24h.
   - Sau 24h, hệ thống gửi thông báo nhắc nhở: *"Cơn sốt mua sắm đã hạ nhiệt, bạn còn muốn mua món này không?"*.
   - Nếu bấm **"Không mua"** $\rightarrow$ Lưu vào thành tích **"Cứu Ví"**, cộng dồn vào quỹ tiền tiết kiệm được và kích hoạt pháo hoa chúc mừng (`AutumnCelebration`).
2. **Quy Tắc Thu Nhập (Income Recording):**
   - Thu nhập có thể ghi bằng ảnh chụp màn hình ngân hàng hoặc chỉ gõ text/nói số tiền.
   - Khoản thu hiển thị màu xanh Cốm (`#7E9F80`), cộng dồn vào số dư thực tế và làm nở rộng ngân sách ngày.
4. **Hộp Xác Nhận (Confirmation Inbox) & Luồng Phân Tầng VietQR:**
   - **Luồng 1 (Autofill Deeplink - MB, ICB, BIDV, ACB, OCB):** Mở trực tiếp màn hình thanh toán đã điền sẵn số tiền/STK. Tạo giao dịch tạm thời `status: 'PENDING'`. Khi quay lại app, hiển thị modal hỏi *"Đã chuyển xong chưa?"*.
   - **Luồng 2 (Mở App An Toàn + Tải Ảnh Biên Lai - Techcombank, VCB, Momo, v.v.):** 
     - Quét QR mở app an toàn, không cố gắng điền tham số gây lỗi.
     - Người dùng chuyển khoản xong, chụp màn hình và bấm nút **Tải ảnh (`ImagePlus`)** trên thanh Camera.
     - **0 OCR / 0 AI đọc ảnh:** Bàn phím số tự bật, chip giá kết hợp thông minh (5 mốc cố định + Top 3 lịch sử), nhớ danh mục và nơi nhận gần nhất để nhập tay trong $\le 5$ giây.
     - Hỗ trợ chọn 1 ảnh (mở sheet xem lại) hoặc chọn hàng loạt lên đến 10 ảnh (ảnh 1 mở sheet, ảnh 2–10 vào hàng đợi Hộp xác nhận).
   - **Chính Sách Lưu Trữ Hộp Xác Nhận:**
     - Khoản PENDING (Luồng 1) **KHÔNG BAO GIỜ TỰ BIẾN MẤT** sau 24h: Quá 24h sẽ được gom vào mục *"Chưa xác nhận"* để người dùng duyệt khi có thời gian.
     - Khoản tải ảnh hàng loạt (SCREENSHOT) được lưu giữ trong **7 ngày**.
     - Giỏ chờ 24h (Wait Basket due) giữ nguyên cho đến khi người dùng quyết định Mua/Thôi.
   - **Bảo Mật Quyền Riêng Tư (Không lưu số tài khoản người nhận):**
     - Không lưu số tài khoản người nhận vào CSDL hay log.
     - Toàn bộ ảnh biên lai được làm sạch siêu dữ liệu EXIF trước khi lưu.
     - Tự động làm mờ ảnh khi bật chế độ "Ẩn tiền" (`privacy_mode`).
   - **Phân Lập Khoản Chờ (Pending Isolation):**
     - Các khoản `PENDING` tuyệt đối **KHÔNG** được tính vào tổng chi tiêu ngày (`todaySpent`), số dư khả dụng (`realBalance`), hay tổng thống kê tháng cho đến khi người dùng bấm Lưu.

---

## 4. TIÊU CHÍ NGHIỆM THU TỔNG THỂ (ACCEPTANCE CRITERIA)

| Phân Hệ | Tiêu Chí Kiểm Thử Kỹ Thuật | Tiêu Chuẩn Nghiệm Thu |
| :--- | :--- | :--- |
| **Tab Bar Điều Hướng** | Chạm qua lại giữa 5 tab [Home, Thống kê, Camera, Chat, Hồ sơ] | Chuyển trang mượt mà 60fps; chạm tab Camera khi đang ở camera thì cuộn mượt về đỉnh (y: 0). |
| **Camera Photobooth** | Mở app, bật/tắt flash, chụp ảnh hoặc giữ nói giá | Tác nghiệp trong $\le 3$ giây; nền gradient mượt mà không bị đen cô lập; nút chọn mode [Chi, Thu, Định mua] nhạy bén tức thì. |
| **Upload Thư Viện (Luồng 2)** | Bấm nút Upload ảnh cạnh Shutter | Mở thư viện chọn 1–10 ảnh; sheet ghi nhanh bật bàn phím số, gợi ý chip giá thông minh $\le 5$s; 0 OCR/AI; xóa sạch EXIF; cảnh báo trùng $\pm 10$ phút. |
| **Hộp Xác Nhận (Inbox)** | Mở banner nổi trên Camera hoặc nút Inbox | Phân tab [Tất cả, Mới, Chưa xác nhận]; khoản QR quá 24h không bị mất; thanh hoàn tác 5s; khoản chờ không vào tổng tiền. |
| **Bộ Lịch Ảnh Home** | Chạm xem từng ngày trong tháng | Hiển thị ảnh xếp chồng và icon danh mục; mở DayDetailBottomSheet mượt mà; khoản pending phân lập 100%. |
| **Cuộn Album Thống Kê** | Cuộn danh sách tháng và chạm xem ảnh 3:4 | Thanh HP Bar đổi màu theo tỷ lệ ngân sách; xem chi tiết giao dịch đầy đủ. |
| **Chat Anh Minh** | Gửi tin nhắn hỏi đáp chi tiêu | Phản hồi thông minh qua Gemini API trong $\le 3$ giây; phân tích sâu sắc thói quen tài chính. |
| **Mục Tiêu & Hồ Sơ** | Nhập mục tiêu cá nhân và lương giờ | Tự động quy đổi mọi giao dịch ra số giờ làm việc chuẩn xác. |
| **Độ Ổn Định Mã Nguồn** | Chạy `tsc --noEmit` và `node run-all-tests.js` | Đạt **0 error, 0 warning**; 100% test suites passed. |

