# 📥 ĐẶC TẢ TÍNH NĂNG: HỘP XÁC NHẬN & GHI CHI TIÊU ÍT THAO TÁC (CONFIRMATION_INBOX_SPEC.MD)

> **Mã tính năng:** `CONFIRMATION_INBOX`  
> **Phiên bản:** 5.0 (Bản Cuối — Thay thế toàn bộ Bản vá 4, 5 và các prompt QR trước)  
> **Ngày lập:** 04/10/2026  
> **Trạng thái:** BƯỚC A — ĐẶC TẢ TÀI LIỆU KIẾN TRÚC (CHỜ DUYỆT)  
> **Áp dụng cho:** Cả iOS và Android

---

## 1. Mục Tiêu & Nguyên Lý Người Dùng Lười

Người dùng thường ngại ghi sổ vì quá nhiều bước, hoặc trả tiền xong là quên bẵng.  
**Mục tiêu cốt lõi:** Người dùng chỉ mất **dưới 5 giây** để ghi nhận một khoản chi tiêu bằng cách bấm đúng 1 nút: **[Lưu]** hoặc **[Bỏ]**.

Hệ thống hoạt động xoay quanh một trung tâm duy nhất: **"HỘP XÁC NHẬN"**. Mọi khoản chi tiêu chưa hoàn tất (từ QR Luồng 1, QR Luồng 2, hoặc món trong Giỏ chờ 24h đến hạn) đều tự động chảy về đây.

---

## 2. Phân Luồng Ngân Hàng (Dựa Trên API VietQR & Casso Hiện Hành)

Cờ `autofill` phản ánh năng lực của **ỨNG DỤNG NGÂN HÀNG DÙNG ĐỂ TRẢ** của người dùng (không phải ngân hàng người nhận).

### 2.1. LUỒNG 1: Ngân hàng hỗ trợ Autofill (`autofill = 1`)
- **Danh sách app hỗ trợ (theo API v2 VietQR):** **MB Bank** (`mb`), **BIDV SmartBanking** (`bidv`), **VietinBank iPay** (`icb`), **ACB ONE** (`acb`), **OCB OMNI** (`ocb`).
- **Trải nghiệm thực tế:**
  1. Người dùng quét mã VietQR trên Camera Ví Locket (chế độ Chi hoặc Định mua).
  2. Thẻ hiển thị huy hiệu xanh Cốm Làng Vòng: *"Tự điền 1 chạm"*, nút bấm: *"Trả bằng [Tên Bank]"*.
  3. Bấm nút: App tạo bản ghi `PENDING` bền vững (không lưu STK), bắn 1 thông báo nhắc cục bộ *"Đang trả [Tên nơi nhận] [Số tiền]"* (không chứa STK), rồi mở Universal Deeplink chuẩn:
     `https://dl.vietqr.io/pay?app={appId}&ba={tài khoản}@{mã ngân hàng}&am={số tiền}&tn={nội dung}&bn={tên nơi nhận}&url=vilocket://qr-callback?pid={id}`
  4. App ngân hàng tự điền 100% số tiền, người nhận, nội dung $\rightarrow$ Người dùng xác thực FaceID/OTP chuyển tiền.
  5. Khi quay lại Ví Locket (qua `AppState` hoạt động hoặc đường dẫn quay về): Bung thẻ *"Đã chuyển xong chưa?"* với 2 lựa chọn: **[Đã chuyển]** / **[Chưa chuyển]** (hoặc sửa số tiền).
  6. Bấm "Đã chuyển" $\rightarrow$ Ghi sổ thành công, cập nhật ngân sách trong 1 giây!

### 2.2. LUỒNG 2: Ngân hàng không Autofill (`autofill = 0`, bao gồm Techcombank, Vietcombank...)
- **Danh sách app:** **Techcombank Mobile** (`tcb`), **VCB Digibank** (`vcb`), **VPBank NEO** (`vpb`), **TPBank** (`tpb`),...
- **Thực tế tâm lý khách hàng:** Đứng trước mã QR ở quầy, người dùng thường vào thẳng app ngân hàng (như Techcombank) quét mã thanh toán cho nhanh.
- **Trải nghiệm tối ưu của Ví Locket cho Luồng 2 (3 cách linh hoạt):**
  - **Cách A (Quét QR trước trên Ví Locket):**
    1. Quét mã VietQR trên Ví Locket $\rightarrow$ App bóc tách số tiền và tên quán.
    2. Thẻ hiển thị: *"Mở [Techcombank] để quét trả"*.
    3. Bấm mở app $\rightarrow$ App ghi nhận khoản `PENDING` và mở Techcombank để người dùng quét trả.
    4. Trả xong quay lại Ví Locket $\rightarrow$ Thẻ *"Bạn vừa chuyển [Số tiền] cho [Tên quán]? [Đã chuyển] / [Chưa chuyển]"* sẵn sàng cho 1 chạm lưu sổ.
  - **Cách B (Trả trực tiếp tại Bank $\rightarrow$ Chụp màn hình 'Thanh toán thành công' $\rightarrow$ Tải ảnh vào Ví Locket):**
    1. Người dùng quét trả xong trong Techcombank $\rightarrow$ Màn hình hiện biên lai *"Chuyển tiền thành công"*.
    2. Người dùng chụp ảnh màn hình biên lai.
    3. Mở Ví Locket $\rightarrow$ Chạm nút Tải ảnh (icon thư viện ở Camera hoặc trong Hộp xác nhận) $\rightarrow$ Chọn ảnh biên lai vừa chụp.
    4. App hiển thị ảnh biên lai trực quan theo khung Polaroid kèm giao diện ghi chi tiêu tối giản:
       - Tự ghi/nhập nhanh số tiền (bàn phím số + chip giá nhanh 30k, 45k, 60k...).
       - Chọn nhanh danh mục (Ăn uống, Mua sắm, Di chuyển...).
       - Nút 1-chạm **[Lưu vào sổ]** $\rightarrow$ Tạo giao dịch `CONFIRMED` (nguồn `SCREENSHOT`), lưu trữ ảnh biên lai an toàn.
  - **Cách C (Trả trực tiếp tại Bank $\rightarrow$ Chụp ảnh món đồ vào Locket):**
    1. Trả tiền xong bằng app ngân hàng.
    2. Nhận đồ ăn/thức uống $\rightarrow$ Mở Ví Locket chụp 1 kiểu ảnh (hoặc giữ mic nói "45k cà phê") $\rightarrow$ Lưu ngay sổ chi tiêu dưới 3 giây.
  - **Nguyên tắc quyền riêng tư tuyệt đối:** Chỉ mở bộ chọn ảnh hệ thống (`expo-image-picker`) khi người dùng chủ động bấm "Tải ảnh biên lai". Tuyệt đối **không chạy ngầm quét toàn bộ thư viện ảnh** của người dùng.

---

## 3. Kiến Trúc Hộp Xác Nhận (The Confirmation Inbox)

### 3.1. Nguồn Dữ Liệu Nạp Vào Hộp
1. **Khoản PENDING từ VietQR:** Khi người dùng bấm mở app ngân hàng nhưng chưa bấm "Đã chuyển" (sau 15 phút không xác nhận tức thì, khoản tự động nằm trong Hộp xác nhận).
2. **Khoản PENDING từ Ví Điện Tử (ZaloPay & MoMo):** Khi người dùng bấm mở ZaloPay hoặc MoMo từ camera, bản ghi `PENDING` (nguồn `QR` / phương thức `E_WALLET`) được tự động tạo. Nếu lúc mở chưa nhập số tiền (0đ), thẻ trong Hộp xác nhận sẽ gắn nhãn *"Cần nhập số tiền"* và cho phép chạm vào để nhập nhanh số tiền $\le 3$s rồi lưu sổ `CONFIRMED`.
3. **Món "Để sau" từ Giỏ chờ 24h:** Các món người dùng phân vân hôm qua, sau 24 giờ đến hạn quyết định: Mua hay Bỏ qua.

### 3.2. Vị Trí & Giao Diện
- **Dải thông báo nhỏ gọn (Pill Banner):** Xuất hiện thanh thoát ở đầu trang Camera (Tab 2) và trang Chủ (Tab 1):
  > 📥 **2 khoản cần xác nhận** `>`
- **Màn hình Hộp Xác Nhận Đầy Đủ:**
  - Danh sách thẻ vuốt mượt mà.
  - Mỗi thẻ hiển thị:
    - Biểu tượng nguồn (QR / Giỏ chờ).
    - Số tiền (chữ số Tabular Nums rõ nét, nổi bật).
    - Tên nơi nhận / Mô tả.
    - Thời gian giao dịch.
    - Danh mục gợi ý (có thể chạm đổi nhanh).
    - **Không hiển thị Nguồn tiền / Hình thức thanh toán (Tiền mặt/Bank):** Đã loại bỏ hoàn toàn để tinh gọn thao tác $\le 3$s theo Quyết định 78.
    - 2 nút hành động lớn: **[Lưu]** (màu nhấn) và **[Bỏ]** (màu mờ).
  - **Chạm vào thẻ:** Mở bảng sửa nhanh số tiền, danh mục, ghi chú (không cần chọn hình thức thanh toán).
  - **Cơ chế Hoàn tác (Undo):** Sau khi bấm Lưu hoặc Bỏ, hiển thị thanh Snackbar hoàn tác trong vòng 5 giây phòng trường hợp bấm nhầm.

### 3.3. Thời Gian Sống & Chống Trùng
- **Khoản PENDING từ QR (Luồng 1):** Quá 24 giờ sẽ được chuyển vào mục lưu trữ **"Chưa xác nhận"**, tuyệt đối **KHÔNG BAO GIỜ TỰ BIẾN MẤT** để người dùng có thể đối soát sau.
- **Thẻ tải ảnh biên lai hàng loạt (SCREENSHOT):** Được lưu giữ trong **7 ngày**.
- **Tự động gộp thẻ trùng:** Nếu có 2 khoản cùng số tiền và cùng nơi nhận phát sinh trong vòng 5 phút, hệ thống tự động gộp thành 1 thẻ duy nhất.

---

## 4. Hỗ Trợ Sao Chép Thủ Công & Bảo Mật Clipboard

1. **Tuyệt đối không tự động sao chép vào Clipboard:**
   - Đã loại bỏ hoàn toàn tính năng tự động ghi STK/số tiền vào Clipboard khi bấm mở App Ngân Hàng.
   - Đã gỡ bỏ công tắc auto-copy trong màn hình Cài đặt để bảo đảm an toàn dữ liệu cá nhân.
2. **2 Nút sao chép chủ động trên thẻ quét QR (Chỉ chép khi bấm):**
   - Nút `[ Sao chép STK ]`.
   - Nút `[ Sao chép số tiền ]`.
3. **Bảo mật tuyệt đối:**
   - Không lưu số tài khoản người nhận vào CSDL.
   - Xóa bỏ thông báo cục bộ chứa thông tin cá nhân.

---

## 5. Quy Chuẩn Dữ Liệu & Bảo Mật Tuyệt Đối

1. **Cách ly số liệu tuyệt đối (Zero-Impact on Numbers):**
   - Khoản `PENDING` và `CANCELLED` **100% KHÔNG ĐƯỢC PHÉP** tính vào: Tổng chi, Ngân sách ngày/tháng, Số dư ví, Lịch sử, Biểu đồ thống kê, Chat tư vấn.
   - Chỉ khi chuyển sang `CONFIRMED` thì tiền mới bắt đầu được ghi nhận vào hệ thống tài chính.
2. **Không lưu số tài khoản người nhận:**
   - STK chỉ tồn tại trong bộ nhớ RAM trong vài mili-giây để dựng URL deeplink rồi giải phóng ngay.
   - Bảng cơ sở dữ liệu `transactions` và storage cục bộ **tuyệt đối không có cột STK**.
3. **Bảo mật phiên bàn giao nền (Persistent Handoff Session):**
   - Dữ liệu lưu trong `AsyncStorage` chỉ gồm: `pendingId`, `payeeName`, `amount`, `bankAppId`, `startedAt`.
   - Tự động hủy sau 15 phút.
4. **Không đưa PII vào phân tích:**
   - Các sự kiện đo lường không chứa số tiền, tên nơi nhận, số tài khoản hay nội dung chuyển khoản.

---

## 6. Ma Trận Kiểm Chứng Thực Tế (Phân Định Minh Bạch)

| Hạng mục kiểm thử | Trạng thái kiểm chứng | Chi tiết bằng chứng |
| :--- | :---: | :--- |
| **iPhone (iOS) + Techcombank Mobile** | **ĐÃ CÓ THIẾT BỊ ĐỐI SOÁT** | Sẽ kiểm chứng trực tiếp trên máy thật của chủ dự án (chụp ảnh/video thực tế). |
| **Android (13/14) + Các app ngân hàng khác** | **CHƯA KIỂM CHỨNG TRÊN MÁY** | Triển khai theo đặc tả chuẩn VietQR/Casso, khóa an toàn bằng cờ tính năng (Feature Flags). |
| **Ngân hàng Luồng 1 (MB, BIDV, ICB, ACB, OCB)** | **CHƯA KIỂM CHỨNG TRÊN MÁY** | Chạy theo Universal Link VietQR chính thức; ghi chú rõ trạng thái cho tới khi có video kiểm chứng. |

---

## 7. Kế Hoạch Triển Khai Chi Tiết Các Bước Kế Tiếp

- **Bước B (Dọn dẹp):** Gỡ bỏ cơ chế tự động copy clipboard; tinh chỉnh banner Vượt ngân sách sang giọng nhẹ nhàng, dùng icon vector.
- **Bước C (Hộp xác nhận trung tâm):** Xây dựng component `ConfirmationInboxCard` và modal `ConfirmationInboxModal`, tích hợp dải thông báo ở Camera & Home.
- **Bước D (Hoàn thiện Luồng 1 & Luồng 2):** Đồng bộ deeplink VietQR chuẩn, kiểm soát trạng thái quay lại và mở app lỗi an toàn.
- **Bước E (Hỗ trợ dán, thông báo & đo lường):** Tích hợp các nút sao chép thủ công, thông báo nhắc cục bộ và hệ thống đo lường không PII.
- **Bước F (Kiểm thử & Bàn giao):** Chạy kiểm thử toàn bộ pure function, kiểm tra lint, và lập báo cáo bàn giao.
