# 🏦 MA TRẬN DEEPLINK NGÂN HÀNG THỰC TẾ & KIẾN TRÚC DUAL-ENGINE (BANK_DEEPLINK_MATRIX.MD)

> **Mã tài liệu:** `BANK_DEEPLINK_MATRIX`  
> **Phiên bản:** 5.0 (Kiến trúc 37 Ngân Hàng Toàn Diện, Minimal Handoff Zero-PII & Lưới An Toàn Học Thực Địa — Ngày: 06/10/2026)  
> **Nguồn nghiên cứu chuẩn:** CASSO SDK ([https://cas.so/product/deeplink/](https://cas.so/product/deeplink/)) & Dữ liệu VietQR (`ios-app-deeplinks.json`, `android-app-deeplinks.json`)  
> **Thiết bị:** iOS & Android  

---

## 1. Báo Cáo Nghiên Cứu Chuyên Sâu & Định Hướng Mở Rộng 37 Ngân Hàng

### 1.1. Hiện trạng dữ liệu hệ sinh thái Ngân hàng Việt Nam (VietQR & Casso)
Dựa trên phân tích 37 ngân hàng trong `ios-app-deeplinks.json` và `android-app-deeplinks.json`, toàn bộ hệ sinh thái thanh toán qua QR tại Việt Nam có những đặc thù cốt lõi:

1. **Khả năng giải mã Offline (100% Ngân Hàng):**  
   Mọi mã QR chuẩn NAPAS / VietQR (cả mã tĩnh và mã động) đều tuân theo chuẩn EMVCo và được giải mã hoàn toàn ngoại tuyến tại thiết bị qua [src/utils/qr/emvParser.ts](file:///c:/Users/TanPhat/Documents/AI_E/Ví-Locket/src/utils/qr/emvParser.ts). Bất kể chuyển tiền cho ngân hàng nào, Kepi đều trích xuất tức thì: STK, BIN ngân hàng, số tiền, tên người nhận, nội dung và danh mục.

2. **Cơ chế Phân Luồng Autofill Động (Dynamic Capability Engine):**  
   Thay vì hardcode cứng nhắc, Kepi áp dụng kiến trúc **37 Ngân Hàng Toàn Diện** đi kèm cơ chế **Danh Sách Động `noAutofillBanks`**:
   - **Mặc định ban đầu:** `DEFAULT_NO_AUTOFILL_BANKS = ['tcb', 'vcb']` (Techcombank Mobile và Vietcombank Digibank đã kiểm chứng chưa hỗ trợ tự điền qua Universal Link).
   - **Chế độ Minimal Handoff (Zero PII):** Với các ngân hàng thuộc `noAutofillBanks` (hoặc khi người dùng tắt tùy chọn "Điền sẵn khi trả"), Kepi chỉ mở app ở mức tối thiểu (`https://dl.vietqr.io/pay?app={appId}`), **tuyệt đối không gửi STK, số tiền, tên người nhận** qua đường dẫn mở app. Trên giao diện, hiển thị cảnh báo trung thực: *"{Ngân hàng} chưa hỗ trợ điền sẵn. Quét lại mã trong app ngân hàng hoặc chụp màn hình rồi tải lên."* kèm lối tắt *"Tải ảnh biên lai lên Kepi"*.
   - **Chế độ Thử Điền Sẵn (Try Autofill):** Với 35 ngân hàng còn lại trong danh sách 37 ngân hàng (gồm MB, ICB, BIDV, ACB, OCB và các ngân hàng khác), Kepi dựng Universal Link đầy đủ tham số để **thử điền sẵn**. Nút hành động mang nhãn trung thực `"Mở {Tên ngân hàng}"` (**tuyệt đối không cam kết chắc chắn "điền sẵn 100%"**).
   - **Ngân hàng ngoài danh sách 37 ngân hàng:** Kepi hỗ trợ "Ghi trước" và người dùng tự mở app ngân hàng chuyển khoản, sau đó quay lại xác nhận 1 chạm.

3. **Lưới An Toàn Học Thực Địa (Field-Learning Safety Net):**  
   Khi người dùng thực hiện chuyển tiền và quay lại Kepi tại modal *"Đã chuyển xong chưa?"*, nếu ngân hàng đó không tự điền, người dùng bấm nút:  
   `[App không điền sẵn?]`  
   - Kepi sẽ ngay lập tức ghi nhớ ngân hàng đó vào `noAutofillBanks` trên máy (`AsyncStorage`).  
   - Lần quét tiếp theo, ngân hàng đó sẽ tự động chuyển sang chế độ Minimal Handoff, hiện cảnh báo và ưu tiên lối tắt Tải ảnh biên lai.  
   - Gửi sự kiện telemetry ẩn danh `qr_prefill_reported_no` (Zero PII) để cập nhật danh sách cấu hình từ xa cho toàn bộ cộng đồng.

---

## 2. Sơ Đồ Kiến Trúc Động 37 Ngân Hàng (Capability Flow)

```
                      ┌────────────────────────────────┐
                      │   Người dùng quét mã VietQR    │
                      │    (Trích xuất Offline EMV)    │
                      └───────────────┬────────────────┘
                                      │
                                      ▼
                      ┌────────────────────────────────┐
                      │  Soi Ví Tức Thì (Budget Check) │
                      │  Cảnh báo đỏ nếu vượt ngân sách│
                      └───────────────┬────────────────┘
                                      │
                                      ▼
                      ┌────────────────────────────────┐
                      │  Nhận diện Ngân hàng ưu tiên   │
                      │  (Duyệt từ 37 ngân hàng chuẩn) │
                      └───────┬────────────────┬───────┘
                              │                │
            [Thuộc noAutofillBanks:            │  [35 Ngân hàng còn lại:
               TCB, VCB, hoặc                  │   MB, BIDV, ICB, ACB, OCB,
            người dùng đã báo cáo]             │   VPB, TPB, SHB, HDB...]
                              ▼                ▼
            ┌─────────────────────┐  ┌─────────────────────────────┐
            │   MINIMAL HANDOFF   │  │       TRY AUTOFILL          │
            ├─────────────────────┤  ├─────────────────────────────┤
            │ • Cảnh báo: Chưa hỗ │  │ • Huy hiệu: Thử điền sẵn    │
            │   trợ điền sẵn      │  │ • Dựng dl.vietqr.io đầy đủ  │
            │ • Nút: "Mở {Bank}"  │  │ • Nhãn: "Mở {Tên Bank}"     │
            │   (Chỉ app={appId}) │  │   (Không hứa điền 100%)     │
            │ • Zero PII lên link │  │ • Chuyển sang app ngân hàng │
            │ • Lối tắt: Tải ảnh  │  │ • AppState / Link quay lại  │
            │   biên lai lên Kepi │  │   Ví Locket                 │
            └──────────┬──────────┘  └──────────────┬──────────────┘
                       │                            │
                       └──────────────┬─────────────┘
                                      │
                                      ▼
                      ┌────────────────────────────────┐
                      │ Phiên Bền Vững (Storage 15p)   │
                      │ Chống OS Kill RAM nền triệt để │
                      └───────────────┬────────────────┘
                                      │
                                      ▼
                      ┌────────────────────────────────┐
                      │ Thẻ "Đã chuyển xong chưa?"     │
                      │ • Bấm "Đã chuyển" -> Ghi sổ    │
                      │ • Bấm "[App không điền sẵn?]"  │
                      │   -> Tự động lưu noAutofill    │
                      └────────────────────────────────┘
```

---

## 3. Ma Trận Hỗ Trợ 37 Ứng Dụng Ngân Hàng (App Capability Matrix)

*Dữ liệu đối soát và cập nhật ngày 06/10/2026 từ `ios-app-deeplinks.json` & `android-app-deeplinks.json`.*

| STT | Ứng Dụng | Mã App | Ngân Hàng | Trạng Thái Ban Đầu | Hành Vi Khởi Tạo | Quyền Riêng Tư (PII) |
| :---: | :--- | :---: | :--- | :---: | :--- | :---: |
| 1 | **Techcombank Mobile** | `tcb` | Ngân hàng TMCP Kỹ thương Việt Nam | `noAutofill` | Minimal Deeplink (`app=tcb`) + Cảnh báo | **Zero PII** |
| 2 | **Vietcombank** | `vcb` | Ngân hàng TMCP Ngoại Thương Việt Nam | `noAutofill` | Minimal Deeplink (`app=vcb`) + Cảnh báo | **Zero PII** |
| 3 | **MB Bank** | `mb` | Ngân hàng TMCP Quân đội | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 4 | **VietinBank iPay** | `icb` | Ngân hàng TMCP Công thương Việt Nam | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 5 | **SmartBanking** | `bidv` | Ngân hàng TMCP Đầu tư và Phát triển Việt Nam | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 6 | **ACB One** | `acb` | Ngân hàng TMCP Á Châu | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 7 | **OCB OMNI** | `ocb` | Ngân hàng TMCP Phương Đông | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 8 | **VPBank NEO** | `vpb` | Ngân hàng TMCP Việt Nam Thịnh Vượng | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 9 | **TPBank Mobile** | `tpb` | Ngân hàng TMCP Tiên Phong | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 10 | **Agribank E-Mobile Banking** | `vba` | Ngân hàng Nông nghiệp & PT Nông thôn VN | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 11 | **HDBank** | `hdb` | Ngân hàng TMCP Phát triển TP.HCM | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 12 | **SHB SAHA** | `shb` | Ngân hàng TMCP Sài Gòn - Hà Nội | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 13 | **MyVIB 2.0** | `vib-2` | Ngân hàng TMCP Quốc tế Việt Nam | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 14 | **MyVIB** | `vib` | Ngân hàng TMCP Quốc tế Việt Nam | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 15 | **CAKE - Digital Bankin‪g** | `cake` | TMCP VN Thịnh Vượng - Số CAKE | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 16 | **Timo Digital Bank** | `timo` | Ngân hàng TMCP Bản Việt (Timo) | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 17 | **Liên Việt 24h** | `lpb` | Ngân hàng TMCP Bưu Điện Liên Việt | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 18 | **SeAMobile** | `seab` | Ngân hàng TMCP Đông Nam Á | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 19 | **Shinhan Bank Vietnam SOL** | `shbvn` | Ngân hàng TNHH MTV Shinhan Việt Nam | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 20 | **SCB Mobile Banking** | `scb` | Ngân hàng TMCP Sài Gòn | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 21 | **ABBank** | `abb` | Ngân hàng TMCP An Bình | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 22 | **Eximbank EDigi** | `eib` | Ngân hàng TMCP Xuất Nhập khẩu Việt Nam | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 23 | **PVConnect** | `pvcb` | Ngân hàng TMCP Đại Chúng Việt Nam | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 24 | **Vietbank Digital** | `vietbank` | Ngân hàng TMCP Việt Nam Thương Tín | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 25 | **Vietbank Digital Plus** | `vab` | Ngân hàng TMCP Việt Á | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 26 | **Co-opBank Mobile Banking** | `coopbank` | Ngân hàng Hợp tác xã Việt Nam | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 27 | **PB engage VN** | `pbvn` | Ngân hàng TNHH MTV Public Việt Nam | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 28 | **KienlongBank Plus** | `klb` | Ngân hàng TMCP Kiên Long | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 29 | **ACB One Biz** | `acb-biz` | Ngân hàng TMCP Á Châu | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 30 | **BAOVIET Smart** | `bvb` | Ngân hàng TMCP Bảo Việt | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 31 | **SAIGONBANK Smart Banking** | `sgicb` | Ngân hàng TMCP Sài Gòn Công Thương | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 32 | **OceanBank** | `oceanbank` | Ngân hàng TM TNHH MTV Đại Dương | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 33 | **NCB iziMobile** | `ncb` | Ngân hàng TMCP Quốc Dân | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 34 | **OCTO by CIMB Vietnam** | `cimb` | Ngân hàng TNHH MTV CIMB Việt Nam | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 35 | **TPBank QuickPay** | `tpb-pay` | Ngân hàng TMCP Tiên Phong | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 36 | **NAM A MOBILE BANKING** | `nab` | Ngân hàng TMCP Nam Á | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |
| 37 | **Woori WON Vietnam** | `wvn` | Ngân hàng TNHH MTV Woori Việt Nam | `tryAutofill` | Full Deeplink (Thử điền sẵn) | Chỉ điền chuyển khoản |

---

## 4. Mở Rộng Hệ Sinh Thái Ví Điện Tử: ZaloPay & MoMo Handoff

Bên cạnh 37 ngân hàng VietQR NAPAS, tại các hàng quán, quầy thu ngân và dịch vụ Việt Nam, mã QR của 2 ví điện tử **ZaloPay** và **MoMo** chiếm thị phần rất lớn. Kepi mở rộng cơ chế nhận diện và bàn giao cho hai ví này theo nguyên tắc **Minimal E-Wallet Handoff & Zero PII**.

### 4.1. Cơ Chế Nhận Diện (Detection Engine)
Khi camera quét được một chuỗi mã không phải hoặc không tuân theo chuẩn EMVCo của VietQR, Kepi phân tích URL/Scheme đối chiếu với Danh sách Trắng (Whitelist):

| Ví Điện Tử | Dấu Hiệu Nhận Diện (URL / Scheme Pattern) | Phân Loại Xử Lý |
| :--- | :--- | :--- |
| **ZaloPay** | • Domain: `qr.zalopay.vn`, `social.zalopay.vn`, `gateway.zalopay.vn`<br>• Scheme: `zalopay://` | `EWALLET_ZALOPAY` |
| **MoMo** | • Domain: `nhantien.momo.vn`, `momo.vn`, `app.momo.vn`<br>• Scheme: `momo://` | `EWALLET_MOMO` |

*Lưu ý bảo mật:* Nếu URL không thuộc Whitelist các tên miền chính thức của ZaloPay hoặc MoMo $\rightarrow$ Kepi chặn hoàn toàn việc mở link lạ, chỉ hiển thị thông báo nhẹ: *"Đây không phải mã chuyển khoản hay ví điện tử hợp lệ"*.

### 4.2. Luồng Bàn Giao Tối Giản & Bảo Mật (Minimal E-Wallet Flow)
1. **Phát hiện mã ví:** Camera nhận diện tức thì trong $\le 0.5$s, rung xúc giác thành công.
2. **Hiển thị thẻ:** Thẻ `PaymentQRDetectedCard` trượt lên với tiêu đề trực quan:
   - *"Mã thanh toán ZaloPay"* hoặc *"Mã thanh toán MoMo"*
   - Cho phép nhập nhanh số tiền (hoặc chọn chip giá 30k, 45k, 60k...) nếu người dùng muốn ghi nhớ trước số tiền.
   - Nút hành động chính: `[ Mở ZaloPay ]` hoặc `[ Mở MoMo ]`.
3. **Mở app ví:**
   - Ưu tiên mở thẳng qua Universal Link gốc của mã quét (hệ điều hành iOS/Android tự động điều hướng vào app ví chính thức).
   - Fallback: Mở qua Native Scheme (`zalopay://` hoặc `momo://`) nếu link web không điều hướng.
4. **Tạo bản ghi PENDING & Đưa vào Hộp Xác Nhận:**
   - Ngay khi bấm mở ví, Kepi tạo bản ghi `PENDING` (loại `EXPENSE`, nguồn `QR` / phương thức `E_WALLET`, trạng thái `PENDING`).
   - Nếu người dùng chưa nhập số tiền trước khi mở, khoản ghi tạm với `amount: 0` (hoặc số tiền trích xuất được) kèm ghi chú `"ZaloPay"` / `"MoMo"`.
   - Lưu `STORAGE_KEY_ACTIVE_HANDOFF_SESSION` bền vững (15 phút chống kill RAM).
5. **Quay lại Kepi:**
   - Khi người dùng thanh toán xong và mở lại Kepi: Thẻ hỏi *"Đã thanh toán ZaloPay/MoMo xong chưa?"* xuất hiện.
   - Người dùng bấm `"Đã thanh toán"` $\rightarrow$ Nếu chưa có số tiền, mở nhanh ô nhập số tiền $\le 3$s $\rightarrow$ Lưu vào sổ `CONFIRMED`.
   - Nếu bận chưa xác nhận ngay $\rightarrow$ Khoản tự động nằm trong **Hộp Xác Nhận (Confirmation Inbox)** chờ chốt bất cứ lúc nào.

---

## 5. Cam Kết Quyền Riêng Tư & An Toàn Tuyệt Đối

1. **Tuyệt đối không lưu số tài khoản người nhận:** Số tài khoản nhận chỉ nằm trong RAM khi quét để tạo deeplink, giải phóng ngay lập tức sau đó. Không bao giờ lưu vào CSDL, SQLite, AsyncStorage hay telemetry.
2. **Cam kết Minimal Handoff:** Ngân hàng thuộc `noAutofillBanks` hoàn toàn không nhận được tham số STK, số tiền, tên người nhận từ link mở app của Kepi.
3. **Whitelist Tên Miền Ví Điện Tử:** Tuyệt đối không mở các đường dẫn URL lạ, chỉ cho phép mở các domain thanh toán chính thức đã kiểm duyệt của ZaloPay và MoMo.
4. **Từ ngữ an toàn & trung thực:** CẤM dùng từ "thanh toán tự động". Nút bấm luôn dùng `"Mở {Tên ngân hàng/Ví}"` để người dùng chủ động kiểm tra và xác nhận trong ứng dụng thanh toán chính thức.
5. **Cách ly số liệu PENDING:** Khoản chờ chuyển khoản bị cô lập 100% khỏi số dư, thanh HP và ngân sách cho đến khi người dùng bấm "Đã chuyển / Đã thanh toán".
6. **Phiên phục hồi 15 phút:** Bảo toàn phiên giao dịch qua `AsyncStorage` chống bị kill RAM khi sang app ngân hàng nặng, tự hủy sạch sẽ sau 15 phút.
