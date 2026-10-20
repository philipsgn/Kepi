# 🔬 ĐẶC TẢ KỸ THUẬT BỘ GIẢI MÃ EMVCO VIETQR (EMV_PARSER_SPEC.MD)

> **Mã tài liệu:** `EMV_PARSER_SPEC`  
> **Phiên bản:** 1.0  
> **Ngày xác minh & lập tài liệu:** 2026-10-03  
> **Nguồn tài liệu chính thức:**  
> 1. EMVCo QR Code Specification for Payment Systems (Merchant-Presented Mode - MPM) v1.0 / v1.1.  
> 2. NAPAS — Tiêu chuẩn kỹ thuật thanh toán qua mã QR (VietQR) phát hành bởi Công ty Cổ phần Thanh toán Quốc gia Việt Nam.  
> 3. VietQR.io Specification & Developer Documentation (NAPAS 247 Transfer via QR).

---

## 1. Cấu Trúc Dữ Liệu Mã EMVCo TLV (Tag - Length - Value)

Mã QR VietQR tuân thủ chuẩn EMVCo MPM, dữ liệu là chuỗi ký tự liền mạch bao gồm các khối TLV:
- **Tag (Thẻ):** 2 ký tự số (`00` - `99`).
- **Length (Độ dài):** 2 ký tự số (`01` - `99`), chỉ định số lượng byte (lưu ý: tính theo độ dài byte UTF-8 của `Value`).
- **Value (Giá trị):** Chuỗi ký tự có độ dài đúng bằng `Length`. Có thể chứa các trường TLV con (Sub-tags).

---

## 2. Danh Mục Các Trường VietQR / NAPAS Cần Kiểm Tra

| Tag | Tên trường | Bắt buộc | Định dạng | Diễn giải & Quy tắc kiểm chứng |
| :--- | :--- | :---: | :--- | :--- |
| **`00`** | Payload Format Indicator | Có | `01` | Luôn bắt đầu bằng `000201` (phiên bản `01`). Nếu khác `01` $\rightarrow$ Từ chối. |
| **`01`** | Point of Initiation Method | Có | `11` hoặc `12` | `11`: Mã tĩnh (Static - Chưa có số tiền).<br>`12`: Mã động (Dynamic - Đã gắn số tiền hoặc một lần quét). |
| **`38`** | Merchant Account Information (NAPAS/VietQR) | Có | TLV Con | Thông tin tài khoản thụ hưởng theo chuẩn NAPAS. Cần chứa:<br>• **Sub-tag `00` (GUID):** `A000000727` (Mã định danh VietQR / NAPAS). Bắt buộc phải khớp!<br>• **Sub-tag `01` (Beneficiary Info):** Gồm tổ hợp TLV nhỏ hơn:<br>&nbsp;&nbsp;&nbsp;&nbsp;◦ `00` (Bank BIN): Mã BIN 6 số của ngân hàng thụ hưởng (ví dụ `970407` - Techcombank, `970415` - VietinBank, `970436` - Vietcombank).<br>&nbsp;&nbsp;&nbsp;&nbsp;◦ `01` (Account / Card Number): Số tài khoản hoặc số thẻ nhận tiền (CHỈ lưu trong RAM tạm thời).<br>• **Sub-tag `02` (Service Code):** `QRIBFTTA` (Chuyển khoản đến tài khoản) hoặc `QRIBFTTC` (Chuyển khoản đến thẻ). |
| **`52`** | Merchant Category Code (MCC) | Không | 4 chữ số | Mã phân loại ngành nghề kinh doanh (theo chuẩn ISO 18245), dùng để gợi ý danh mục chi tiêu tự động. |
| **`53`** | Transaction Currency | Có | 3 chữ số | Mã tiền tệ ISO 4217. VietQR bắt buộc phải là `704` (Việt Nam Đồng). Nếu khác `704` $\rightarrow$ Từ chối giao dịch. |
| **`54`** | Transaction Amount | Tùy chọn (Bắt buộc với mã động `01`=`12`) | Số thực | Số tiền giao dịch (tối đa 13 ký tự). Không có phần thập phân bất thường hoặc số âm. Ví dụ: `50000` hoặc `50000.00`. Phải là số nguyên dương $> 0$ và $\le 500.000.000$ đ. |
| **`58`** | Country Code | Có | 2 ký tự | Mã quốc gia ISO 3166-1 alpha-2. Bắt buộc phải là `VN`. |
| **`59`** | Merchant Name (Payee Name) | Tùy chọn / Khuyến nghị | Chuỗi UTF-8 (tối đa 25 ký tự) | Tên người nhận tiền / Đơn vị thụ hưởng (Ví dụ: `NGUYEN VAN A`, `TIEM CA PHE`). Xử lý đúng UTF-8 khi tính độ dài byte. |
| **`60`** | Merchant City | Không | Chuỗi (tối đa 15 ký tự) | Thành phố / Tỉnh của đơn vị (Ví dụ: `HANOI`, `HO CHI MINH`). |
| **`62`** | Additional Data Field Template | Không | TLV Con | Chứa thông tin bổ sung:<br>• **Sub-tag `08` (Purpose of Transaction):** Nội dung chuyển khoản / Lời nhắn giao dịch. |
| **`63`** | CRC (Cyclic Redundancy Check) | Có | 4 ký tự Hex | Checksum CRC-16 CCITT (0xFFFF, Poly 0x1021). Bắt buộc ở cuối chuỗi dạng `6304XXXX`. |

---

## 3. Thuật Toán Kiểm Tra CRC-16 CCITT (Mục 63)

Mã QR kết thúc bằng `6304` theo sau là 4 ký tự Hex mã kiểm tra.
- **Dữ liệu đầu vào tính toán:** Toàn bộ chuỗi QR từ đầu ký tự `000201...` cho đến hết tiền tố `...6304`.
- **Thông số thuật toán:**
  - **Chuẩn:** CRC-16/CCITT-FALSE (hoặc CRC-16/IBM).
  - **Polynomial (Đa thức):** `0x1021` ($x^{16} + x^{12} + x^5 + 1$).
  - **Giá trị khởi tạo (Initial Value):** `0xFFFF`.
  - **Reflect Input / Output:** False.
  - **XOR Output:** `0x0000`.
- **Nguyên tắc từ chối:** Nếu 4 ký tự Hex ở cuối chuỗi tính toán không khớp chính xác $\rightarrow$ Từ chối với lý do `CRC_MISMATCH` ("Không đọc được mã hoặc mã bị rách/hỏng").

---

## 4. Xử Lý Chiều Dài Chuỗi Với Ký Tự Tiếng Việt (Unicode/UTF-8)

Trong chuẩn EMVCo, trường `Length` biểu diễn **số byte**, không phải số lượng ký tự JavaScript (`String.length`).
- Ví dụ: Chuỗi tiếng Việt có dấu `"CÀ PHÊ"` gồm 6 ký tự nhưng chiếm 8 bytes trong bảng mã UTF-8 (`C`, `\xC3\x80`, ` `, `P`, `H`, `\xC3\x8A`).
- **Quy tắc bộ đọc:** 
  1. Khi tách chuỗi, bộ đọc phải chuyển chuỗi sang mảng byte UTF-8 (`TextEncoder` hoặc hàm chuyển đổi UTF-8 thuần không phụ thuộc DOM) trước khi cắt theo `Length`.
  2. Tuyệt đối không cắt chuỗi bằng `substring(index, index + length)` vì sẽ làm lệch toàn bộ các trường phía sau nếu có ký tự có dấu!

---

## 5. Hợp Đồng Kiểu Dữ Liệu TypeScript (Đầu Vào & Đầu Ra)

Bộ đọc là hàm thuần (`pure function`), không phụ thuộc UI, không gọi mạng:

```typescript
export type QRKind = 'STATIC' | 'DYNAMIC';

export interface VietQRPayload {
  kind: QRKind;                     // Mã tĩnh hay mã động
  bankBin: string;                  // Mã BIN 6 số (ví dụ: '970407')
  payeeName?: string;               // Tên người nhận (ví dụ: 'NGUYEN VAN A')
  amount?: number;                  // Số tiền (VND, số nguyên dương)
  note?: string;                    // Nội dung chuyển khoản (nếu có)
  city?: string;                    // Thành phố (nếu có)
  mcc?: string;                     // Mã phân loại ngành nghề 4 số
  suggestedCategory?: string;       // Danh mục gợi ý (từ MCC hoặc lịch sử)
  
  // LƯU Ý BẢO MẬT TUYỆT ĐỐI:
  // accountRef CHỈ tồn tại trong bộ nhớ RAM của phiên xử lý hiện tại để dựng Deeplink.
  // Không bao giờ được lưu vào CSDL, AsyncStorage, State lưu bền, Log hay Analytics.
  accountRef: string;               // Số tài khoản hoặc thẻ thụ hưởng
}

export type QRParseResult = 
  | { success: true; data: VietQRPayload }
  | { success: false; reason: QRParseErrorReason; raw?: string };

export type QRParseErrorReason = 
  | 'NOT_EMV_FORMAT'        // Chuỗi văn bản / URL thông thường
  | 'CRC_MISMATCH'         // Sai mã kiểm tra CRC-16
  | 'NOT_VIETQR_NAPAS'     // Là mã EMV nhưng không phải của VietQR/NAPAS (Tag 38 thiếu GUID A000000727)
  | 'INVALID_CURRENCY'     // Tiền tệ khác VND (khác 704)
  | 'INVALID_AMOUNT'       // Số tiền âm, bằng 0 hoặc vượt trần hợp lý
  | 'MISSING_REQUIRED_TAGS';// Thiếu tag 00, 01, 38, 53, 58 hoặc 63
```

---

## 6. Bảng Ánh Xạ Mã Ngành Nghề (MCC) Sang Danh Mục Ví Locket

Khi quét được tag `52` (MCC), hệ thống tự động gợi ý danh mục chi tiêu chuẩn Hà Nội Thu Đông:

| Dải MCC | Ngành nghề kinh doanh thực tế | Danh mục chuẩn Ví Locket | Ghi chú & Icon |
| :--- | :--- | :--- | :--- |
| **`5811 - 5814`** | Quán ăn, nhà hàng, quán cà phê, tiệm bánh, thức ăn nhanh | **Ăn uống** (`an_uong`) | ☕ Phổ biến nhất tại phố phường HN |
| **`5411, 5422, 5499`** | Siêu thị mini, tạp hóa, chợ thực phẩm tươi sống | **Ăn uống** / **Mua sắm** | 🛒 Tạp hóa gia đình |
| **`5541 - 5542, 4121`** | Cây xăng, dịch vụ taxi, xe ôm công nghệ (Grab, Be, XanhSM) | **Di chuyển** (`di_chuyen`) | 🛵 Xăng xe, gọi xe di chuyển |
| **`5311, 5651, 5999`** | Cửa hàng thời trang, bách hóa, phụ kiện, sách báo | **Mua sắm** (`mua_sam`) | 🛍️ Mua đồ cá nhân |
| **`7832, 7999`** | Rạp chiếu phim, khu vui chơi giải trí, sân thể thao | **Giải trí** (`giai_tri`) | 🎟️ Vé xem phim, cafe boardgame |
| **`8011 - 8099, 5912`** | Nhà thuốc, phòng khám tư nhân, bệnh viện | **Sức khỏe** (`suc_khoe`) | 💊 Thuốc men y tế |
| **`4900`** | Hóa đơn điện, nước, internet | **Hóa đơn & Nhà cửa** (`hoa_don`) | 🏠 Tiền điện nước tháng |
| **Khác / Không có** | Không xác định được qua MCC | **Chi tiêu khác** (`khac`) | 🏷️ Ghi nhận mặc định |

*Cơ chế học thói quen (Memory):* Nếu người dùng từng sửa danh mục cho đơn vị thụ hưởng `payeeName` này trong quá khứ, danh mục trong lịch sử gần nhất sẽ được ưu tiên hơn gợi ý MCC mặc định.

---

## 7. Bộ Dữ Liệu Mẫu Thử Nghiệm (Test Suite Data)

### Mẫu 1: Mã động hợp lệ Techcombank (Có số tiền, có nội dung, tên không dấu)
```text
00020101021238570010A00000072701270006970407011319036789123450208QRIBFTTA5204581253037045405450005802VN5912CA PHE GIANG6005HANOI62150811CA PHE SANG6304...
```
- Phân tích: Động (`01`=`12`), Techcombank (`970407`), Số tiền: `45.000` đ, Nơi nhận: `CA PHE GIANG`, MCC: `5812` $\rightarrow$ Gợi ý `Ăn uống`.

### Mẫu 2: Mã tĩnh hợp lệ (Chưa có số tiền)
```text
00020101021138570010A00000072701270006970407011319036789123450208QRIBFTTA5204541153037045802VN5911TIEM CO MAI6005HANOI6304...
```
- Phân tích: Tĩnh (`01`=`11`), Techcombank (`970407`), Chưa có Tag `54` $\rightarrow$ Mở màn hình nhập số tiền.

### Mẫu 3: Mã sai CRC (Mã lỗi/Hỏng do quét nhòe)
```text
00020101021238570010A00000072701270006970407011319036789123450208QRIBFTTA53037045405500005802VN63040000
```
- Kết quả mong muốn: Báo lỗi `CRC_MISMATCH`, không hiện thẻ thanh toán.

### Mẫu 4: Mã của đơn vị khác (EMV nhưng không phải VietQR / Thiếu Tag 38 GUID NAPAS)
```text
00020101021126400010A000000678012212345678901234567890125204581253037045802VN6304E5F6
```
- Kết quả mong muốn: Trả về `NOT_VIETQR_NAPAS` $\rightarrow$ Hiện thông báo: *"Mã này chưa hỗ trợ. Ghi tay nhé?"*.

### Mẫu 5: Văn bản hoặc Đường link Web (URL chống lừa đảo)
```text
https://example.com/pay?amount=50000
```
- Kết quả mong muốn: Trả về `NOT_EMV_FORMAT` $\rightarrow$ Không mở bất kỳ trình duyệt nào, chỉ báo: *"Đây không phải mã chuyển khoản"*.
