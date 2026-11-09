# 🤖 ĐẶC TẢ TÍNH NĂNG: AI DUAL-SCAN OCR, VOICE NLP & VISION TAGGING (AI_OCR_VOICE_SPEC.MD)

> **Mô-đun:** AI-First Dual-Scan Engine  
> **Áp dụng cho:** Tab Camera, Bottom Sheet Nhập Liệu, Ghi Sổ Siêu Tốc $\le 3$s  
> **Tôn chỉ:** AI-First, On-Device Processing, Zero-STK Shield

---

## 1. PHÂN HỆ AI RECEIPT OCR PARSER

### 1.1. Cấu Trúc Dữ Liệu Hóa Đơn (Receipt Data Model)
```typescript
export interface ReceiptItem {
  name: string;
  price: number;
  quantity?: number;
}

export interface ReceiptOcrResult {
  merchantName: string | null;
  items: ReceiptItem[];
  totalAmount: number;
  vatAmount?: number;
  suggestedCategory: string;
  detectedAmounts: number[]; // Top 3 ứng viên cho Carousel Fallback
  confidenceScore: number;   // 0.0 -> 1.0
  rawText?: string;
}
```

### 1.2. Thuật Toán Trích Xuất Hóa Đơn Bán Lẻ Việt Nam
1. **Tìm kiếm Merchant Name:** Tìm các dòng đầu tiên không chứa số điện thoại/ngày giờ, hoặc các dòng có tiền tố `Cửa hàng`, `Nhà hàng`, `Cafe`, `Chi nhánh`.
2. **Tìm kiếm Tổng Tiền (Total Amount):**
   - Regex tìm từ khóa: `Tổng cộng`, `Thanh toán`, `Tổng tiền`, `Total`, `Tiền mặt`, `Số tiền`.
   - Lọc bỏ các số tiền trùng với số tiền khách đưa hoặc tiền thừa thối lại (`Tiền khách đưa`, `Tiền thối`).
3. **Carousel Fallback:** Luôn trả về mảng `detectedAmounts` (được sắp xếp theo độ tin cậy) để hiển thị 3 chip giá gợi ý trên giao diện khi người dùng chụp biên lai.

---

## 2. PHÂN HỆ VOICE-TO-EXPENSE NLP PARSER

### 2.1. Cấu Trúc Dữ Liệu Voice Input
```typescript
export interface VoiceExpenseResult {
  amount: number;
  category: string;
  description: string;
  emoji: string;
  confidence: number;
}
```

### 2.2. Quy Tắc Phân Tích Cú Pháp Tiếng Việt (Vietnamese Grammar Rules)
- **Hệ số đơn vị tiền tệ:**
  - `k`, `nghìn`, `ngàn`, `cành` $\to \times 1,000$
  - `lít` $\to \times 100,000$
  - `củ`, `tr`, `triệu` $\to \times 1,000,000$
- **Bộ từ khóa danh mục:**
  - `Ăn uống` (`🍜`): `phở`, `bún`, `cơm`, `bánh mì`, `cà phê`, `cafe`, `trà sữa`, `highlands`, `ăn`, `uống`.
  - `Đi lại` (`⛽`): `xăng`, `grab`, `be`, `xe ôm`, `taxi`, `gửi xe`, `vé xe`.
  - `Mua sắm` (`🛍️`): `áo`, `quần`, `giày`, `shopee`, `lazada`, `tiki`, `mua`.
  - `Học tập` (`📚`): `sách`, `vở`, `khóa học`, `học phí`.

---

## 3. PHÂN HỆ COMPUTER VISION ON-DEVICE

### 3.1. Phân Loại Hình Ảnh Ngoại Tuyến (Offline Vision Tagging)
- Input: Image URI từ camera hoặc bộ nhớ máy.
- Output: Nhãn phân loại và danh mục chi tiêu tương ứng.
- Cam kết 100% Offline: Chạy trực tiếp trên thiết bị, không gửi ảnh lên đám mây nhằm bảo vệ quyền riêng tư người dùng và đạt độ trễ $< 150$ms.
