# 🧾 ĐẶC TẢ TÍNH NĂNG: TẢI ẢNH BIÊN LAI & GHI CHI TIÊU NHANH (RECEIPT_UPLOAD.MD)

> **Mã tính năng:** `RECEIPT_UPLOAD`  
> **Phiên bản:** 3.0 (Bản Cuối — Luồng 2 cho ngân hàng không Autofill — Tối ưu Nhập tay siêu tốc)  
> **Ngày cập nhật:** 05/10/2026  
> **Trạng thái:** ĐÃ DUYỆT & ĐANG TRIỂN KHAI  
> **Áp dụng cho:** Cả iOS và Android

---

## 1. Quyết Định Kiến Trúc: KHÔNG OCR / KHÔNG AI ĐỌC ẢNH

Theo quyết định chốt từ Chủ dự án:
- **Loại bỏ hoàn toàn khỏi phạm vi:** Module nhận dạng chữ OCR trên thiết bị, gọi AI đám mây đọc biên lai, bộ mẫu ảnh biên lai và bài toán đo tỉ lệ đọc đúng.
- **Lý do quyết định:**
  1. **Tốc độ phản hồi cực nhanh:** Thẻ xem lại xuất hiện ngay lập tức trong vòng $\le 300$ ms sau khi chọn ảnh, không có độ trễ 2-4 giây chờ OCR/AI.
  2. **Tránh lỗi sai lệch số tiền:** Người dùng tự gõ chính xác số tiền họ vừa chuyển, loại bỏ 100% trường hợp OCR đọc nhầm số dư, mã giao dịch hoặc phí ngân hàng.
  3. **Bảo mật & Quyền riêng tư:** Ảnh biên lai được lưu trữ cục bộ/xóa EXIF, không bị gửi ảnh hay văn bản chứa STK lên bất kỳ máy chủ AI bên thứ 3 nào.
  4. **Tiết kiệm chi phí & Bộ nhớ:** Không cần cài thư viện MLKit native nặng nề, giữ app siêu nhẹ và chạy mượt trên cả iPhone/Android cấu hình thấp.

---

## 2. Trải Nghiệm Nhập Tay Siêu Tốc (Dưới 5 Giây)

Để người dùng nhập tay mà không cảm thấy phiền hà hay tốn thời gian:
1. **Bàn phím số tự bật (Auto-focus):** Ngay khi mở Thẻ xem lại, bàn phím số lập tức xuất hiện, con trỏ sẵn sàng trong ô số tiền.
2. **Hệ thống Chip giá thông minh (Hybrid Price Chips):**
   - **Chip cố định phổ biến:** `30k`, `50k`, `100k`, `200k`, `500k`.
   - **Chip cá nhân hóa theo lịch sử:** Tự động lấy top 3 mức chi tiêu người dùng hay dùng nhất trong 7 ngày gần đây (ví dụ: `45k`, `65k`, `120k`).
3. **Ghi nhớ ngữ cảnh gần nhất:**
   - Tự động gợi ý danh mục và nơi nhận/mô tả của giao dịch gần nhất.
4. **Trích xuất giờ giao dịch từ ảnh:**
   - Lấy `creationTime` / `modificationTime` của file ảnh chụp màn hình do hệ thống cung cấp (nếu có); nếu không lấy giờ hiện tại.
5. **Công tắc tiện ích & Bảo vệ người dùng:**
   - Công tắc **Chi / Thu** (mặc định Chi).
   - Công tắc **Lưu ảnh kèm khoản** (mặc định BẬT, tự động xóa EXIF, làm mờ khi bật "Ẩn tiền").
   - **Cảnh báo trùng khoản:** Nếu có khoản cùng số tiền trong vòng $\pm 10$ phút hoặc cùng ảnh, hiển thị cảnh báo nhẹ để người dùng không ghi đúp.
   - **Hỏi lại ngày khi ảnh cũ:** Nếu ảnh chụp $> 7$ ngày trước, hiển thị popup hỏi ghi theo ngày chụp hay ngày hôm nay.
   - **Lời nhắc quyền riêng tư 1 lần:** Lần đầu tiên người dùng vào sheet sẽ thấy lời nhắc về việc ảnh biên lai có thể chứa STK và cách tắt lưu ảnh nếu muốn.

---

## 3. Quy Trình 2 Nhánh Của Luồng 2

1. **Cách 1 (Đường chính — Tiện nhất):**
   - Người dùng quét trả xong tại app ngân hàng (Techcombank...) $\rightarrow$ màn hình hiện biên lai $\rightarrow$ chụp màn hình.
   - Mở Ví Locket $\rightarrow$ bấm nút **Upload** (cạnh nút Shutter trên Camera) hoặc **"Tải biên lai"** trong Hộp xác nhận.
   - Thẻ xem lại (Receipt Review Sheet) bung lên ngay lập tức $\rightarrow$ người dùng chạm chip giá/gõ tiền $\rightarrow$ chọn danh mục $\rightarrow$ bấm **[Ghi khoản đã chi]**.
   - Lưu giao dịch `CONFIRMED` (`source: 'SCREENSHOT'`), toast kèm nút Hoàn tác 5 giây.
   - **Tải nhiều ảnh (Batch 2–10 ảnh):** Ảnh 1 mở sheet, các ảnh 2–10 chuyển vào Hộp xác nhận và được lưu giữ trong **7 ngày**.
2. **Cách 2 (Quét mã trên Ví Locket trước):**
   - Người dùng quét mã VietQR trên Camera Ví Locket $\rightarrow$ thẻ hiện *"Mở Techcombank quét trả"*.
   - Bấm mở app $\rightarrow$ mở scheme `tcb://` để vào dashboard Techcombank quét lại lần nữa và chuyển khoản.
   - Khi quay lại Ví Locket, thẻ *"Đã chuyển xong chưa?"* xuất hiện để 1-chạm xác nhận.

---

## 4. Thiết Kế Dữ Liệu & Sự Kiện Đo Lường (Mở Rộng Tương Lai)

Cấu trúc dữ liệu được chuẩn bị đầy đủ để có thể cắm thêm module đọc ảnh tự động trong các phiên bản sau nếu cần:
- **Trường dữ liệu giao dịch:**
  - `source`: `'SCREENSHOT'` (Khoản từ ảnh chụp màn hình).
  - `photo_url`: Đường dẫn ảnh đã xóa EXIF.
  - `is_receipt`: `true` (để tự động làm mờ khi bật chế độ riêng tư).
- **Sự kiện phân tích (100% không chứa số tài khoản, số tiền hay tên nơi nhận):**
  - `upload_tapped`: Người dùng bấm nút Upload.
  - `upload_images_selected`: Số lượng ảnh chọn (1 hoặc nhiều).
  - `time_to_save`: Thời gian từ lúc chọn ảnh đến lúc bấm lưu (đo trung vị để tối ưu).
  - `duplicate_warned`: Cảnh báo trùng được kích hoạt.
  - `receipt_saved`: Lưu thành công.
  - `receipt_dismissed`: Bỏ qua không lưu.
  - `abandon_rate`: Tỉ lệ bỏ cuộc giữa chừng.
