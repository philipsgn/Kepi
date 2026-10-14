# TÍNH NĂNG TỪNG TRANG (PAGES_FEATURES.md)

- **Trạng thái:** ĐÃ ĐƯỢC CHỦ DỰ ÁN DUYỆT (Chốt 10/10 quyết định thiết kế)
- **Ngày cập nhật:** 02/10/2026
- **Quy ước nhãn giai đoạn:** `[M0]` bản đầu phải có, `[M1]` giữ chân, `[M2]` bạn bè, `[Sau]` làm khi có dữ liệu
- **Quy ước chung:** từ ngữ đời thường, ngắn, không dùng từ game; phong cách khối vuông vàng-đen; tiền định dạng `45.000 đ`; giờ Việt Nam, lưu UTC.

---

## 0. KHUNG TỔNG THỂ

### 0.1. Năm trang, một thanh điều hướng
Thứ tự từ trái sang phải. **Camera ở giữa và là trang mở đầu.**

| # | Trang | Icon | Một câu mô tả |
|---|---|---|---|
| 1 | **Home** | nhà | "Hôm nay mình ổn không?" Nhìn nhanh, quyết định nhanh |
| 2 | **Thống kê** | biểu đồ | "Tháng này tiền đi đâu?" Album ảnh + tổng kết |
| 3 | **Camera** (trung tâm) | máy ảnh | Ghi một khoản trong 3 giây, cuộn xuống xem lịch sử |
| 4 | **Chat** | bong bóng | Hỏi Anh Minh AI, sau này chat với bạn bè |
| 5 | **Hồ sơ** | người | Mọi thứ thuộc về cá nhân |

- Thanh icon nổi, mờ kính, bo góc khối vuông. Icon Camera lớn hơn (khối vàng đậm nét) vì là trang trung tâm.
- Chạm icon hoặc vuốt trái/phải để đổi trang. Vuốt dọc dùng để cuộn trong trang.
- Chỉ số mặc định khi mở app: Index = 2 (Camera).

### 0.2. Phân vai để các trang không trùng nhau
Đã được chốt rõ, phân biệt minh bạch giữa Thống kê và Lịch sử của Camera:

| Việc | Ở trang nào | Không làm ở |
|---|---|---|
| Xem tình hình **hôm nay**, còn tiêu được bao nhiêu | Home | Thống kê |
| Lịch tháng (mỗi ngày chồng ảnh), **xem nhanh** | Home | |
| **Toàn bộ ảnh tách theo tháng** kèm tổng đã chi từng tháng; Chi tiết tháng (biểu đồ, so sánh, tổng kết) | Thống kê | Home |
| Ghi mới; lịch sử **theo ngày**, tìm kiếm, sửa/xóa hàng loạt | Camera (cuộn xuống mục "Lịch sử") | Home, Thống kê |
| Hỏi đáp, nhờ ghi sổ bằng lời, xin ý kiến mua | Chat | |
| Cài đặt, mục tiêu, dữ liệu, tài khoản | Hồ sơ | |

Nguyên tắc: **Home = hiện tại, Thống kê = nhìn lại theo tháng, Camera = hành động & lịch sử ngày, Chat = trò chuyện với Anh Minh, Hồ sơ = thiết lập cá nhân.**

### 0.3. Quy tắc dùng chung cho cả 5 trang
1. **Một nguồn dữ liệu duy nhất.** Số trên Home, Thống kê, Camera, Chat phải khớp nhau (cùng một hàm tính pure function). Có test đối chiếu.
2. **"Ẩn tiền" là cài đặt toàn app:** bật ở đâu cũng che mọi số tiền ở mọi trang (`••••`), kể cả trong câu trả lời của Anh Minh. Lưu vào Local Storage / AsyncStorage.
3. **Liên kết giữa các trang:** chạm một số liệu thì nhảy tới nơi có chi tiết (ví dụ chạm "Đã giữ lại" ở Home mở danh sách "Không mua" trong Lịch sử của Camera).
4. **Trạng thái rỗng, đang tải, lỗi, offline** có đủ ở mọi trang, giọng văn thống nhất.
5. **Ghi khi mất mạng** vẫn được (hàng đợi cục bộ), tự đồng bộ lại; hiện nhãn "Chưa đồng bộ" cho khoản chờ.
6. **Hoàn tác** 5 giây sau khi lưu hoặc xóa một khoản, ở mọi trang.
7. **Toàn bộ nhãn văn bản** tập trung tại `src/constants/strings.ts` để sẵn sàng mở rộng đa ngôn ngữ.

---

## 1. TRANG HOME (ĐÃ HOÀN THÀNH GIAI ĐOẠN A $\rightarrow$ D)

Chi tiết nằm trong [docs/screens/HOME.md](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/docs/screens/HOME.md).
- **Mục tiêu:** trả lời trong 3 giây: "Hôm nay còn tiêu được bao nhiêu? Mình đang ổn hay đang lố?"
- **Khối chính:**
  - Lời chào theo giờ + biệt danh người dùng.
  - Chip "Đã chi hôm nay" và "Ngày liên tiếp".
  - Bộ chuyển **Ngày | Tháng**; nút **Ẩn tiền** (mắt).
  - Thẻ **Hôm nay tiêu được** với thanh đo rời rạc 10 ô (đạt chuẩn tương phản WCAG AA 13.5:1, chuyển đỏ khi lố).
  - Khối **Chi / Thu** của tháng.
  - **Lịch ảnh tháng (PhotoCalendarGrid):** 7 cột (T2..CN), mỗi ngày chồng ảnh món đồ với badge `+N`, vuốt ngang chuyển tháng.
  - Sheet chi tiết ngày khi chạm vào từng ngày trong lịch.
  - Nút bánh răng cài đặt nhanh mở QuickSettingsSheet.

---

## 2. TRANG THỐNG KÊ

Trang Thống kê lấy **toàn bộ ảnh đã chụp tách theo từng tháng** làm nội dung chính (lưới 3 cột, nhãn giá ở góc dưới trái). Mỗi tháng có **tổng đã chi của tháng đó** ngay ở tiêu đề. Biểu đồ và phân tích chuyển vào màn **Chi tiết tháng** (chạm tiêu đề tháng để mở).

### 2.1. Mục tiêu
Một "cuốn album tiền" cuộn dọc: kéo từ tháng mới nhất xuống tháng cũ nhất, mỗi tháng là một khối gồm **tổng đã chi + toàn bộ ảnh của tháng**. Người dùng nhìn lại và thấy ngay "tháng đó mình đã tiêu bao nhiêu, tiêu vào những gì".

### 2.2. Câu hỏi người dùng muốn được trả lời
1. Tháng này (và các tháng trước) mình đã chi bao nhiêu?
2. Tháng đó mình đã mua những gì? (xem ảnh)
3. Tháng nào chi nhiều nhất, ít nhất?
4. Còn bao nhiêu khoản chưa ghi giá?

### 2.3. Bố cục (cuộn dọc, mỗi tháng một khối)
```
 Thống kê                              [Ẩn tiền]  [Lọc]
 [Tất cả] [Chi] [Thu] [Không mua] [Chưa có giá] [Ăn uống] ...  (chip cuộn ngang)
 Tháng: [10] [9] [8] [7] ...  (thanh nhảy nhanh, năm hiện khi đổi năm)
 ┌──────────────────────────────────────────────────────┐
 │ Tháng 10, 2026  · Đang diễn ra            Chi tiết ›  │  ← tiêu đề DÍNH khi cuộn
 │ Đã chi 2.550.000 đ                      ▲ 12% so tháng 9 │
 │ 42 khoản · Thu 5.000.000 đ · Đã giữ lại 640.000 đ     │
 └──────────────────────────────────────────────────────┘
 ┌────────┐ ┌────────┐ ┌────────┐
 │  ảnh   │ │  ảnh   │ │  ảnh   │
 │[80.000 đ]│[Chưa có giá]│[39.000 đ]│   nhãn ở góc dưới trái
 └────────┘ └────────┘ └────────┘
 ...  (lưới 3 cột, khe nhỏ, tỉ lệ 3:4, tải thêm khi cuộn)
 ┌──────────────────────────────────────────────────────┐
 │ Tháng 9, 2026                              Chi tiết ›  │
 │ Đã chi 2.280.000 đ                      ▼ 5% so tháng 8 │
 └──────────────────────────────────────────────────────┘
 ...
```

### 2.4. Khối tháng & Lưới ảnh
- **Tiêu đề tháng** (dính đầu màn hình khi cuộn qua tháng đó):
  - `[M0]` Tên tháng + năm; tháng hiện tại có nhãn "Đang diễn ra".
  - `[M0]` **Đã chi** của tháng: số lớn, định dạng đầy đủ `2.550.000 đ`, hiệu ứng RollingNumber khi vào màn.
  - `[M0]` Dòng phụ: số khoản, tổng Thu, **Đã giữ lại** (tổng các món "Không mua").
  - `[M1]` So với tháng trước: mũi tên + %, màu trung tính.
  - `[M0]` Chạm tiêu đề mở màn **Chi tiết tháng** (mục 2.6).
- **Lưới ảnh của tháng:**
  - `[M0]` 3 cột, ô tỉ lệ 3:4, sắp mới nhất lên trước trong tháng.
  - `[M0]` Mỗi ô là một khoản (ảnh bìa). Khoản có nhiều ảnh: nhãn "+N" ở góc trên phải.
  - `[M0]` Khoản không có ảnh: ô khối màu theo danh mục + icon danh mục, nhãn giá rõ ràng.
  - `[M0]` Chạm ô: mở sheet chi tiết dùng chung với Camera/Lịch sử (ảnh lớn, số tiền, mô tả, danh mục, sửa, xóa có hoàn tác).
- **Nhãn giá trên ô:**
  - Chi có giá: `80.000 đ` (rút gọn `1,2tr` khi từ 1 triệu).
  - Thu: `+5.000.000 đ` → `+5tr` (nhãn màu xanh Cốm Làng Vòng).
  - Không mua: `450.000 đ` + **viền vàng** quanh ô, icon "Không mua" góc trên phải.
  - **Chưa có giá:** nhãn viền nét đứt "Chưa có giá" (không hiện "0 đ"). Chạm để nhập giá nhanh.
  - Khi bật "Ẩn tiền": biến thành `••••`.

### 2.5. Điều hướng và lọc trong trang
- `[M0]` Thanh chọn tháng nhảy nhanh: chip cuộn ngang, sáng theo vị trí cuộn.
- `[M0]` Chip lọc: Tất cả, Chi, Thu, Không mua, Để sau, Chưa có giá, và theo Danh mục. Lọc áp dụng cho toàn bộ các tháng.
- `[M0]` Giữ vị trí cuộn khi chuyển trang.

### 2.6. Màn "Chi tiết tháng" (mở từ tiêu đề tháng)
- `[M0]` Tổng kết: Đã chi, Thu, Còn lại cuối tháng, số khoản, trung bình mỗi ngày, Đã giữ lại.
- `[M0]` Theo danh mục: thanh ngang số tiền và %, chạm để lọc.
- `[M0]` Theo ngày: cột chi từng ngày, vạch định mức ngày.
- `[M1]` Ngày chi nhiều nhất, giờ hay chi, thẻ chia sẻ 9:16, xuất PDF báo cáo.

### 2.7. Báo Cáo Mốc Tháng Tự Động Lưu Trữ (Auto Monthly Archive — M2)
- **Tự động chốt mốc lúc 00:00 ngày 1 hàng tháng:** Hệ thống tự động đóng gói số liệu tháng cũ (Tổng chi, Tổng thu, Tiền đã cứu, Tỉ lệ tiết kiệm %) thành một thẻ lưu trữ độc lập trong Thống Kê.
- **Tuyệt đối 0 bắt reset thủ công:** Khác với đối thủ bắt người dùng bấm reset chu kỳ, Kepi tự động mở chu kỳ mới và lưu trữ mốc cũ mà không cần bất kỳ thao tác thủ công nào.
- **Chuyển giao dòng tiền liên tục (`Running Balance`):** Số tiền còn lại của tháng cũ tự động là số dư đầu kỳ của tháng mới, bảo đảm dòng tiền trôi liên tục như tài khoản ngân hàng thực tế.

---

## 3. TRANG CAMERA (TRUNG TÂM)

### 3.1. Mục tiêu
Ghi một khoản thu/chi **trong 3 giây**, và khi cuộn lên xem lại toàn bộ **Lịch sử** như một thư viện ảnh. Là trang mở đầu mặc định của app.

### 3.2. Một mặt cuộn liên tục (Tactile Continuous Surface)
- Camera và Lịch sử là **một danh sách cuộn dọc duy nhất**.
- Khối camera cao đúng một màn hình. Khi người dùng vuốt trượt lên:
  - Ảnh cũ gần đây nhất sẽ từ từ lộ ra từ bên dưới và khung ngắm camera thu nhỏ/dần mất đi.
  - **Trạng thái trượt giữ 50%:** UI hiển thị một nửa là camera đang hoạt động (viewfinder), nửa dưới là ảnh cũ gần nhất kèm mốc thời gian ("5 giờ trước", "1 ngày trước"...).
  - Tiêu đề phần cuộn xuống: **"Lịch sử"**.

### 3.3. Phần Camera (Ghi nhanh)
- **3 Chế độ ghi:**
  - **Chi:** Vừa mua hoặc đang trả tiền $\rightarrow$ Ghi khoản chi.
  - **Thu:** Nhận lương, làm thêm $\rightarrow$ Ghi khoản thu (ảnh tùy chọn, có thể chỉ nói/gõ, không bắt buộc chụp).
  - **Định mua:** Đang phân vân $\rightarrow$ Màn **Giá thật** $\rightarrow$ Chọn Mua / Để sau / Không mua.
- **Phương thức nhập liệu:**
  - `[M0]` Chụp + giữ nút mic nói giá ("ly trà sữa bốn lăm ngàn"). Có sóng âm hiển thị khi nói.
  - `[M0]` Chụp + gõ nhanh (bàn phím số khối vuông lớn, gợi ý 20k/30k/50k/100k).
  - `[M0]` Chỉ nói không cần ảnh (đổ xăng, chuyển khoản).
  - `[M0]` Chọn ảnh từ thư viện thiết bị.
  - `[M0]` **Quét mã chuyển khoản (VietQR & Hộp Xác Nhận):**
    - Nhận diện tức thì mã VietQR trong khung ngắm ở chế độ **Chi** hoặc **Định mua** ($\le 1.0$s).
    - **Luồng 1 (Autofill 1 chạm - MB, BIDV, ICB, ACB, OCB):** Deeplink Universal điền sẵn 100% số tiền, người nhận, nội dung $\rightarrow$ quay lại app bấm xác nhận 1 chạm.
    - **Luồng 2 (Ngân hàng không autofill - Techcombank, VCB...):** 
      - *Tải ảnh biên lai (Đường chính tiện lợi):* Quét trả tại Bank $\rightarrow$ chụp màn hình biên lai thành công $\rightarrow$ mở Ví Locket tải ảnh lên và ghi nhanh số tiền, danh mục dưới 5 giây.
      - *Quét QR trước:* Thẻ hiện nút "Mở [Techcombank] quét trả" $\rightarrow$ quay lại app bấm 1 chạm xác nhận.
    - Chế độ Định mua: Khoản $\ge 200.000$ đ hiện màn **Giá thật** trước khi chuyển sang app ngân hàng.
    - **Dải Hộp xác nhận (Confirmation Pill Banner):** Hiển thị ở đầu Camera và Home khi có khoản PENDING hoặc Giỏ chờ đến hạn, bấm vào mở Hộp duyệt thẻ nhanh dưới 5 giây.
    - Bảo mật tuyệt đối: Không quét ngầm thư viện ảnh, không tự sao chép STK (chỉ sao chép khi người dùng bấm nút), không lưu số tài khoản, giải mã 100% offline.
  - `[M0]` Nút "Hôm nay không chi gì" (một chạm duy trì chuỗi).
- **Thẻ xác nhận (Confirmation Card):** Bố cục khối vuông Polaroid, hiển thị ảnh, số tiền, mô tả, danh mục, thời gian. Sửa 1 chạm, hoàn tác 5 giây sau lưu.
- **Màn Giá thật (Chế độ Định mua):**
  - Quy đổi bằng số ngày "Hôm nay tiêu được", số đơn vị yêu thích (ly cà phê, tô phở...).
  - Nhận xét từ Anh Minh AI.
  - 3 nút: Mua / Để sau (24h/72h) / Không mua. Nút "Hỏi Anh Minh" chuyển sang Chat kèm ảnh & giá.

### 3.4. Phần Lịch sử (Cuộn xuống)
- `[M0]` Lưới ảnh 3 cột, sắp xếp theo Ngày (Hôm nay, Hôm qua, 28/09/2026...) có tổng tiền theo từng ngày.
- `[M0]` Ô tìm kiếm (theo mô tả, số tiền) + chip lọc dính đầu khi cuộn.
- `[M0]` Chạm ô mở sheet chi tiết: sửa, xóa có hoàn tác, đổi danh mục.
- Tự động tạm dừng Camera stream khi cuộn xuống quá 85% để tiết kiệm pin.

---

## 4. TRANG CHAT

### 4.1. Mục tiêu
Một nơi để **hỏi và nhờ**: hỏi số liệu tài chính của mình, xin ý kiến trước khi mua, nhờ ghi sổ bằng lời nói/chữ. Giai đoạn đầu tương tác với **Anh Minh AI**.

### 4.2. Cấu trúc
Đầu trang có hai ngăn: **Anh Minh** | **Bạn bè**.
- `[M0]` Ngăn Anh Minh hoạt động đầy đủ.
- `[M0]` Ngăn Bạn bè hiển thị màn hình **"Sắp ra mắt"** (giới thiệu tính năng: hỏi bạn trước khi mua, cùng giữ ngân sách tuần) kèm nút "Báo khi có" để đón đầu giai đoạn `[M2]`.

### 4.3. Nhân vật Anh Minh AI
- **Cố định:** Tên "Anh Minh", avatar khối vuông vàng chữ "M", phong cách người anh thẳng tính, vui, am hiểu tài chính, tôn trọng người đối diện.
- **Xưng hô mặc định:** "anh - bạn" (hoặc xưng "anh", gọi theo biệt danh của người dùng). Đổi được trong Hồ sơ.
- **Quy tắc phát ngôn:** Ngắn gọn (tối đa 3 câu), nói dựa trên số liệu thật do code tính toán sẵn (AI chỉ diễn đạt, không tự làm toán), không rao giảng, không làm người dùng cảm thấy tội lỗi. Khi người dùng căng thẳng đổi giọng ân cần.
- **Hạn mức AI:** Trong bản `[M0]`, **không giới hạn lượt AI** để người dùng trải nghiệm và kiểm thử tối đa. Sẽ áp hạn mức khi thương mại hóa gói Premium.

### 4.4. Tính năng chính trong Chat
- `[M0]` **Hỏi đáp số liệu bản thân:** Trả về thẻ số liệu mini có thể chạm để nhảy sang Thống kê hoặc Lịch sử.
- `[M0]` **Nhờ ghi sổ bằng chat:** "Ghi 45k trà sữa" $\rightarrow$ trả về thẻ xác nhận, người dùng bấm Lưu mới ghi.
- `[M0]` **Xin ý kiến trước khi mua:** Gửi ảnh + giá $\rightarrow$ trả thẻ Giá thật và 3 nút Mua / Để sau / Không mua.
- `[M0]` **Chip gợi ý nhanh** phía trên ô nhập liệu: "Hôm nay tiêu được bao nhiêu?", "Có nên mua cái này?"...

---

## 5. TRANG HỒ SƠ

### 5.1. Mục tiêu
Gom mọi thứ thuộc về cá nhân: mục tiêu, số liệu tài chính, thiết lập Anh Minh, quyền riêng tư và dữ liệu.

### 5.2. Tính năng chính
- **Đầu trang `[M0]`:** Ảnh đại diện, biệt danh, Ngày liên tiếp, Tổng tiền Đã giữ lại, Thời gian sử dụng.
- **Tài chính của tôi `[M0]`:**
  - Mục tiêu 4 trường: Mục đích, Số tiền, Hạn chót, Lý do.
  - Thu nhập định kỳ & Chi cố định.
  - Cài đặt công thức "Hôm nay tiêu được" & Đơn vị yêu thích (ly cà phê, tô phở...).
- **Thanh toán QR `[M0]`:**
  - Ngân hàng mặc định khi quét mã (Techcombank Mobile / MB / VCB... hoặc "Hỏi mỗi lần").
  - Tự mở app ngân hàng sau khi quét (Bật/Tắt - Mặc định BẬT cho mã động có số tiền).
  - Hiện Giá thật trước khi trả từ [200.000 đ] (đổi ngưỡng hoặc tắt được).
  - Nhắc nhở xác nhận giao dịch chuyển khoản khi quên (Bật/Tắt thông báo cục bộ).
  - Tự sao chép STK khi mở app ngân hàng (Bật/Tắt - Mặc định TẮT, chỉ bật nếu app ngân hàng nhận diện STK).
- **Quản lý Danh mục Tùy biến (Custom Categories Engine) `[M2]`:**
  - Quản lý danh sách danh mục phân tách 2 tab: **Chi Tiêu** và **Thu Nhập**.
  - Cho phép người dùng tự do **Thêm mới**, **Chỉnh sửa tên**, **Chọn Icon Vector** (từ bộ Vector `lucide-react-native`), **Đổi màu sắc** và **Ẩn/Hiện** danh mục.
  - Đồng bộ tức thì với bộ chọn danh mục trên Camera Viewfinder và Bottom Sheet ghi chép.
- **Anh Minh `[M1]`:** Chỉnh mức thẳng thắn (Nhẹ nhàng / Vừa / Thẳng), xưng hô, bật/tắt tin nhắn chủ động.
- **Riêng tư & Bảo mật:**
  - `[M0]` Ẩn tiền toàn app.
  - `[M1]` Khóa app bằng Face ID / mã PIN.
- **Dữ liệu của tôi `[M0]`:**
  - Xóa từng ảnh/khoản, nút **Xóa toàn bộ dữ liệu một chạm** (có hộp thoại cảnh báo).
  - Nút **Xóa tài khoản in-app** (đáp ứng bắt buộc của Apple Store Review).
  - Xuất dữ liệu CSV chuẩn UTF-8 BOM `[M1]`.
- **Tài khoản `[M0/M1]`:** Cổng vào kép tối giản: **"Tiếp tục với Google"** (sao lưu đám mây Supabase vĩnh viễn) và **"Vào ngay"** (1-chạm mở thẳng Camera, bắt đầu từ số 0, sandbox trên máy); hỗ trợ liên kết Google tại Hồ Sơ với cơ chế chống thất thoát dữ liệu.

---

## 6. BẢNG TỔNG HỢP: TÍNH NĂNG x TRANG

| Tính năng | Home | Thống kê | Camera | Chat | Hồ sơ |
|---|:-:|:-:|:-:|:-:|:-:|
| Ghi chi/thu (ảnh + chip giá / text) | | | **Chính** | Phụ (qua chat) | |
| Giá thật / Định mua | | | **Chính** | Phụ | |
| Để sau (đếm ngược) | Dải nhắc | Số liệu | Lọc Lịch sử | Nhắc | Cài đặt |
| Đã giữ lại | Số nhỏ | **Kỳ này** | Lọc | Trả lời | Tổng |
| Hôm nay tiêu được | **Chính** | Vạch trên biểu đồ | Dải nhỏ | Trả lời | Cài đặt công thức |
| Lịch ảnh theo tháng | **Xem nhanh** | | | | |
| Ảnh tách theo tháng + tổng chi từng tháng | | **Chính** | | | |
| Lịch sử theo ngày + tìm kiếm + sửa/xóa hàng loạt | | | **Chính** | | |
| Biểu đồ và so sánh (màn Chi tiết tháng) | | **Chính** | | Thẻ mini | |
| Tổng kết tuần/tháng | Lối vào | **Chính** | | | Cài nhắc |
| Hỏi đáp về số liệu | | | | **Chính** | |
| Anh Minh chủ động | | | | **Chính** | Cài đặt |
| Bạn bè, Hỏi bạn | | | | **[M0] Sắp có / [M2]** | **[M2]** |
| Mục tiêu và ngân sách | Tiến độ | Tiến độ | | Trả lời | **Chính** |
| Quyền riêng tư, xóa dữ liệu | Ẩn tiền | Ẩn tiền | | | **Chính** |

---

## 7. LUỒNG XUYÊN TRANG

1. **Ghi nhanh:** Mở app (Camera) $\rightarrow$ Chụp $\rightarrow$ Giữ mic nói giá $\rightarrow$ Thẻ xác nhận $\rightarrow$ Lưu $\rightarrow$ Home cập nhật "Hôm nay tiêu được", Thống kê và Lịch sử có khoản mới.
2. **Phân vân khi mua:** Camera (Định mua) $\rightarrow$ Màn Giá thật $\rightarrow$ Bấm "Hỏi Anh Minh" $\rightarrow$ Nhảy sang Chat $\rightarrow$ Bấm "Để sau" $\rightarrow$ Home hiển thị dải Để sau.
3. **Xem lại lịch sử:** Camera $\rightarrow$ Vuốt lên $\rightarrow$ Khung ngắm thu nhỏ, ảnh gần nhất lộ ra $\rightarrow$ Lướt Lịch sử theo ngày hoặc sang Thống kê xem album theo tháng.
4. **Hỏi số liệu:** Chat ("Tháng này tiêu bao nhiêu trà sữa?") $\rightarrow$ Anh Minh trả về thẻ số liệu $\rightarrow$ Chạm thẻ mở Thống kê đúng danh mục.
5. **Thiết lập:** Hồ sơ (đổi mục tiêu / chi cố định) $\rightarrow$ Home tự động tính lại "Hôm nay tiêu được" tức thì.

---

## 8. KẾT QUẢ CHỐT 10 CÂU HỎI THIẾT KẾ CỦA CHỦ DỰ ÁN

| # | Câu hỏi | Quyết định đã chốt | Ghi chú kiến trúc |
|---|---|---|---|
| **1** | Thống kê vs Lịch sử | **Giữ cả hai, phân vai rõ rệt**: Thống kê theo Tháng (album + tổng chi); Lịch sử theo Ngày (chi tiết, tìm kiếm, sửa/xóa). | Dùng chung component PhotoCell và Detail Sheet. |
| **2** | Tên & Persona AI | **Cố định tên "Anh Minh"**, vai trò PT tài chính thẳng thắn, vui, chân thành. | Tùy chỉnh mức thẳng thắn trong Hồ sơ. |
| **3** | Xưng hô mặc định | **"anh - bạn"** (hoặc gọi bằng tên/biệt danh). | Tôn trọng, đời thường, đổi được trong Hồ sơ. |
| **4** | Ngăn Bạn bè (Chat) | **Hiện màn "Sắp ra mắt"** + nút "Báo khi có" ở M0. | Kích thích tò mò và đón đầu giai đoạn M2. |
| **5** | Hạn mức AI Free | **Không giới hạn ở M0** để tối đa hóa trải nghiệm & kiểm thử sớm. | Áp dụng hạn mức khi ra mắt gói Premium. |
| **6** | Tiêu đề & Cử chỉ Camera/Lịch sử | **Tiêu đề "Lịch sử"**. Vuốt lên ảnh gần nhất lộ dần, camera mờ dần; trượt giữ 50% hiện nửa camera nửa ảnh cũ kèm mốc giờ. | Trải nghiệm tactile vật lý độc bản. |
| **7** | Cơ chế Đăng nhập | **Cổng vào kép tối giản: Tiếp tục với Google & Vào ngay (Mở thẳng Camera từ số 0)**. | Bỏ Email OTP rườm rà; liên kết Google tại Hồ Sơ gộp dữ liệu hoặc phục hồi mây an toàn. |
| **8** | Xuất dữ liệu | **Đưa sang M1**. M0 tập trung Xóa 1 chạm & Xóa tài khoản in-app. | Đáp ứng chuẩn Apple Store Review. |
| **9** | Thu nhập ở Camera | **Ảnh là tùy chọn (optional)**. Cho phép chỉ nói hoặc gõ số tiền. | Không ảnh thì dùng khối màu theo danh mục. |
| **10**| Ngôn ngữ & Strings | **100% Tiếng Việt đời thường ở M0, gom toàn bộ vào `src/constants/strings.ts`**. | Sẵn sàng mở rộng i18n không cần refactor code. |
