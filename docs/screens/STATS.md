# 📋 ĐẶC TẢ MÀN HÌNH: THỐNG KÊ (STATS.MD)

> **Mã màn hình:** `STATS` (Tab 2, Index 1 trong thanh điều hướng 5 trang)  
> **Tên màn hình:** Thống kê (Cuốn Album Tiền Tách Theo Tháng)  
> **Trạng thái:** Chờ Chủ Dự Án Duyệt (Stage A)  
> **Phiên bản:** 1.0  
> **Lần cập nhật cuối:** 2026-10-02  

---

## 1. Mục Tiêu & Người Dùng
- **User Story:** Là một người trẻ ghi chép chi tiêu bằng hình ảnh, tôi muốn **lướt xem lại toàn bộ ảnh đồ vật/món ăn đã mua được gom nhóm theo từng tháng** kèm **tổng số tiền đã chi nổi bật ngay trên đầu mỗi tháng**, để trả lời ngay câu hỏi: *"Tháng này và các tháng trước tiền của mình đã đi đâu, mua những gì?"*.
- **Mục tiêu sản phẩm:** 
  - Biến số liệu tài chính khô khan thành một "cuốn album kỷ niệm tiêu dùng" trực quan, chân thực và sinh động.
  - Phân vai rạch ròi: Home = hiện tại trong ngày; **Thống kê = cuốn album cuộn theo tháng kèm tổng kết**; Camera (Lịch sử) = dòng thời gian chi tiết theo ngày để sửa/xóa; Chat = trò chuyện & tư vấn; Hồ sơ = thiết lập cá nhân.
- **Tiêu chí thành công đo được (Success Metrics):**
  1. Người dùng nắm được tổng chi và các món tiêu biểu của một tháng trong ≤ 2 giây lướt mắt.
  2. Thời gian tải và hiển thị từ cache ≤ 600ms, cuộn 60fps mượt mà với 1.000+ ô ảnh.
  3. Tỷ lệ khớp số liệu 100%: Số tiền "Đã chi tháng này" ở Thống kê bắt buộc bằng đúng "Chi tháng này" ở Home và bằng tổng nhãn giá các ô chi trong tháng.

---

## 2. Wireframe Chữ (ASCII Wireframe)

### 2.1. Trạng Thái Chính (Dual-Mode: Album Ảnh vs Phân Tích Data)
```text
┌────────────────────────────────────────────────────────┐
│ Thống kê                                    [Ẩn tiền]  │
│ [📸 Album] (Mặc định)                 [📊 Phân tích]   │ (Segmented Switch)
├────────────────────────────────────────────────────────┤
│ CHẾ ĐỘ 1: PHÂN TÍCH DATA (10 Biểu Đồ Trực Quan Hóa)     │
│ Tháng: [10] [9] [8] [7] ... (thanh chọn tháng)         │
│ Chu kỳ: [Tuần Này]          [Cả Tháng]                 │ (Period Switcher)
│ ┌ Lời Nhận Định Data Analyst ────────────────────────┐ │
│ │ ✨ "Phong độ tài chính tuyệt vời! Bạn đang giữ lại  │ │
│ │     được 40% thu nhập và nhịp độ cực kỳ an toàn."   │ │
│ └────────────────────────────────────────────────────┘ │
│ ┌ Tỷ Lệ Tiết Kiệm ───┐ ┌ Tốc Độ Đốt / Ngày ────────┐ │
│ │ +40% (Xuất sắc)    │ │ 120.000 đ/ngày (Chậm 18%) │ │
│ └────────────────────┘ └───────────────────────────┘ │
│ ┌ Dự Báo Khả Năng Trụ Của Ví (Runway) ───────────────┐ │
│ │ 🛡️ Về đích an toàn (Dự phòng thêm 8 ngày)          │ │
│ │ Số dư: 4.500.000 đ · Định mức ngày: 150.000 đ      │ │
│ └────────────────────────────────────────────────────┘ │
│ ┌ Cơ Cấu Danh Mục (Pareto Breakdown %) ──────────────┐ │
│ │ 1. Ăn uống (45%)          ════════════════         │ │
│ │ 2. Mua sắm (25%)          ═════════                │ │
│ └────────────────────────────────────────────────────┘ │
│ ┌ Nhịp Độ Chi Tiêu Từng Ngày (Daily Trend Bars) ─────┐ │
│ │ [Bar 1] [Bar 2] ... vs Vạch định mức ngày an toàn  │ │
│ └────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────┤
│ CHẾ ĐỘ 2: CUỐN ALBUM ẢNH (Lưới 3 Cột Polaroid Locket)   │
│ [Tất cả] [Chi] [Thu] [Không mua] [Chưa có giá] [Ăn uống]│ (chip cuộn ngang)
│ Tháng: [10] [9] [8] [7] ...                            │
│ ┌ Tiêu Đề Tháng Dính Tinh Gọn (Sticky Month Header) ──┐ │
│ │ Tháng 10, 2026                 Đã chi 2,55tr ›     │ │ (Thu gọn chiều dọc 50%)
│ │ 42 khoản · Thu 5tr · Đã giữ lại 640k   ▲ 12%       │ │
│ └────────────────────────────────────────────────────┘ │
```
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│ │   [Ảnh 1]    │ │   [Ảnh 2]    │ │   [Ảnh 3]    │    │
│ │              │ │   (+2 ảnh)   │ │  (Không mua) │    │
│ │ [80.000 đ]   │ │ [Chưa có giá]│ │ [450.000 đ]  │    │ (viền vàng)
│ └──────────────┘ └──────────────┘ └──────────────┘    │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│ │   [Ảnh 4]    │ │  [Khối màu   │ │   [Ảnh 6]    │    │
│ │  (Thu nhập)  │ │   Danh mục]  │ │              │    │
│ │ [+5.000.000đ]│ │ [35.000 đ]   │ │ [120.000 đ]  │    │
│ └──────────────┘ └──────────────┘ └──────────────┘    │
│ ... (Lưới 3 cột, ô tỉ lệ 3:4, tải thêm khi cuộn)      │
├────────────────────────────────────────────────────────┤
│ ┌ Tiêu Đề Tháng 9 (Dính khi cuộn tới) ───────────────┐ │
│ │ Tháng 9, 2026                           Chi tiết › │ │
│ │ Đã chi 2.280.000 đ                  ▼ 5% so tháng 8│ │
│ └────────────────────────────────────────────────────┘ │
│ ...                                                    │
└────────────────────────────────────────────────────────┘
```

### 2.2. Trạng Thái Rỗng (Empty State)
```text
┌────────────────────────────────────────────────────────┐
│ Thống kê                                    [Ẩn tiền]  │
│                                                        │
│                    ┌───────────┐                       │
│                    │   [📷]    │ (Khối vàng 3px viền)  │
│                    └───────────┘                       │
│             Chưa có tấm ảnh chi tiêu nào               │
│         Chụp thử món gần nhất để mở cuốn album         │
│                                                        │
│               [  MỞ MÁY ẢNH NGAY  ]                    │ (Nút Chunky 3D)
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 2.3. Màn "Chi Tiết Tháng" (Mở Khi Chạm Tiêu Đề Tháng / "Chi tiết ›")
```text
┌────────────────────────────────────────────────────────┐
│ [✕ Đóng]        Tháng 10, 2026             [Chia sẻ]   │
├────────────────────────────────────────────────────────┤
│ ┌ Tổng Quan Tháng ───────────────────────────────────┐ │
│ │ ĐÃ CHI: 2.550.000 đ          THU: 5.000.000 đ      │ │
│ │ CÒN LẠI: 2.450.000 đ         ĐÃ GIỮ LẠI: 640.000 đ │ │
│ │ 42 khoản · Trung bình 82.250 đ/ngày                │ │
│ └────────────────────────────────────────────────────┘ │
│ ┌ Chi Tiêu Theo Danh Mục ────────────────────────────┐ │
│ │ Ăn uống        1.200.000 đ (47%)  ████████░░░░░░░░ │ │
│ │ Di chuyển        450.000 đ (18%)  ███░░░░░░░░░░░░░ │ │
│ │ Mua sắm          500.000 đ (20%)  ████░░░░░░░░░░░░ │ │
│ └────────────────────────────────────────────────────┘ │
│ ┌ Cột Chi Tiêu Từng Ngày ────────────────────────────┐ │
│ │ [Vạch định mức ngày: 100k] - - - - - - - - - - - - │ │
│ │   █       █   █           █   █       █            │ │
│ │ 01 02 03 04 05 06 ...                            │ │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

---

## 3. Cây Component & Props (Component Hierarchy)

```text
<StatsView> (src/components/views/StatsView.tsx)
  ├── <ScreenHeader> (Tiêu đề "Thống kê", nút Ẩn tiền, nút Lọc)
  ├── <MonthQuickJumper> (Thanh chọn tháng dạng chip cuộn ngang)
  ├── <FilterChipBar> (Bộ lọc: Tất cả, Chi, Thu, Không mua, Chưa có giá, Danh mục)
  ├── <MonthSectionList> (Danh sách ảo hóa cuộn dọc theo từng khối tháng)
  │     ├── <MonthStickyHeader> (Tiêu đề dính: Tên tháng, Đã chi, Thu, Đã giữ lại, So sánh %, nút Chi tiết ›)
  │     └── <MonthPhotoGrid> (Lưới ảnh 3 cột)
  │           └── <TransactionPhotoCell> (Ô ảnh 3:4, nhãn giá, tag trạng thái, viền vàng không mua)
  ├── <MonthDetailBottomSheet> (Sheet xem phân tích chi tiết tháng: danh mục, biểu đồ cột ngày)
  └── <DayDetailBottomSheet> (Tái sử dụng sheet chi tiết giao dịch khi chạm vào từng ô ảnh)
```

### Bảng Chi Tiết Props:
| Component | File Nguồn | Props Chính | Mô Tả |
| :--- | :--- | :--- | :--- |
| `StatsView` | `src/components/views/StatsView.tsx` | Không có (Màn hình chính) | Quản lý state bộ lọc, tháng đang focus, sheet chi tiết |
| `MonthQuickJumper` | `src/components/stats/MonthQuickJumper.tsx` | `months: string[], activeMonth: string, onSelectMonth: (m: string) => void` | Thanh chip cuộn ngang nhảy nhanh đến tháng |
| `MonthStickyHeader` | `src/components/stats/MonthStickyHeader.tsx` | `summary: MonthSummary, isCurrentMonth: boolean, isMasked: boolean, onOpenDetail: () => void` | Tiêu đề tháng dính đầu cuộn, nút mở Chi tiết tháng |
| `TransactionPhotoCell` | `src/components/stats/TransactionPhotoCell.tsx` | `item: Transaction, isMasked: boolean, onPress: () => void, onLongPress?: () => void` | Ô 3:4 hiển thị ảnh bìa, nhãn giá góc trái, tag +N, viền vàng |
| `MonthDetailBottomSheet` | `src/components/stats/MonthDetailBottomSheet.tsx` | `visible: boolean, summary: MonthSummary, transactions: Transaction[], onClose: () => void` | Sheet phân tích chuyên sâu biểu đồ ngày & danh mục |

---

## 4. Hợp Đồng Dữ Liệu (Data Contract)

### 4.1. Kiểu Dữ Liệu TypeScript
```typescript
export interface MonthSummary {
  monthKey: string;           // 'YYYY-MM' (ví dụ: '2026-10')
  monthLabel: string;         // 'Tháng 10, 2026'
  isCurrentMonth: boolean;    // Đang diễn ra
  totalSpent: number;         // Tổng đã chi (loại EXPENSE có giá, không tính SKIPPED/ADJUST)
  totalIncome: number;        // Tổng thu nhập (loại INCOME)
  totalSaved: number;         // Tổng đã giữ lại (các món SKIPPED / Không mua)
  transactionCount: number;   // Tổng số khoản
  unpricedCount: number;      // Số khoản chưa có giá
  previousMonthDiffPercent?: number; // % tăng/giảm so với tháng trước
}

export interface MonthSectionData {
  summary: MonthSummary;
  items: Transaction[];
}
```

### 4.2. Định Nghĩa "Đã Chi" & Quy Tắc Tính Toán (Pure Functions)
- **Công thức:** `totalSpent = sum(amount)` của các giao dịch thỏa mãn:
  1. `type === 'EXPENSE'`
  2. `occurred_at` thuộc tháng theo múi giờ `Asia/Ho_Chi_Minh`.
  3. **Loại trừ:** Khoản "Không mua" (WaitBasket SKIPPED), khoản "Chỉnh số dư" (ADJUST), khoản chưa có giá (`amount === 0` hoặc unpriced).
- **Ràng buộc đối chiếu:** `totalSpent` của tháng hiện tại **bắt buộc bằng đúng** `monthlySpent` hiển thị ở màn Home.

### 4.3. Cơ Chế Lưu Trữ Mốc Tháng Tự Động (Auto Monthly Archive & Running Balance — M2)
- **Tự động chốt mốc lúc 00:00 ngày 1 hàng tháng:** Hệ thống tự động snapshot số liệu tháng vừa kết thúc (`MonthSummary`), lưu vào danh sách báo cáo lưu trữ mà **tuyệt đối không bắt người dùng bấm reset chu kỳ hay đóng sổ thủ công**.
- **Dòng tiền liên tục (`Running Balance`):** Số tiền còn lại của tháng cũ tự động kết chuyển tiếp nối sang số dư khả dụng đầu kỳ của tháng mới (tương tự tài khoản ngân hàng thực tế).
- **Xem lại mốc tháng bất kỳ lúc nào:** Người dùng chỉ cần lướt thanh `MonthQuickJumper` hoặc cuộn dòng thời gian để xem lại báo cáo tài chính của bất kỳ tháng nào trong quá khứ một cách minh bạch.

---

## 5. Ma Trận Trạng Thái (State Matrix)

| Trạng Thái | Điều Kiện | Giao Diện Hiển Thị | Hành Vi Người Dùng |
| :--- | :--- | :--- | :--- |
| **Đang tải lần đầu** | Đang đọc dữ liệu từ storage | Khung xương Skeleton: Tiêu đề tháng + 9 ô xám 3:4 | Khóa tương tác tạm thời |
| **Có cache** | Có dữ liệu đã lưu | Hiển thị ngay tức thì từ cache, revalidate ngầm | Cuộn xem mượt mà, không nhấp nháy |
| **Trống toàn bộ** | Chưa từng ghi khoản nào | Biểu tượng máy ảnh khối vàng + "Chưa có tấm ảnh nào" | Nút bấm "Mở máy ảnh ngay" chuyển sang Camera |
| **Tháng này chưa chi** | Tháng cũ có dữ liệu, tháng này rỗng | Khối tháng này hiện dòng "Chưa có gì tháng này" rồi đến các tháng cũ | Người dùng thấy được quá khứ |
| **Lọc không ra kết quả** | Bộ lọc không khớp ô nào | Dòng chữ "Không có khoản nào khớp bộ lọc" + nút "Xóa lọc" | Bấm nút hoàn nguyên về bộ lọc "Tất cả" |
| **Khoản chưa có giá** | Khoản chưa nhập giá tiền | Ô ảnh có nhãn viền nét đứt "Chưa có giá" (không hiện 0 đ) | Chạm trực tiếp vào nhãn mở popup nhập giá nhanh |
| **Khoản Không mua** | Món đã cứu ví thành công | Ô có **viền vàng nổi bật** + icon bàn tay giữ lại góc phải | Cộng vào "Đã giữ lại", không cộng vào "Đã chi" |
| **Bật Ẩn tiền** | Người dùng bật chế độ riêng tư | Mọi số tiền trên tiêu đề tháng và nhãn ô biến thành `••••` | Chạm biểu tượng mắt để bật lại |

---

## 6. Tương Tác & Cử Chỉ (Interactions & Gestures)
- **Cuộn dọc (Vertical Scroll):** Cuộn mượt danh sách qua các tháng; tiêu đề tháng (`MonthStickyHeader`) dính vào mép trên màn hình khi người dùng đang xem ảnh của tháng đó.
- **Chạm ô ảnh (Tap Cell):** Rung haptic nhẹ (`selectionAsync`), mở `DayDetailBottomSheet` hiển thị ảnh kích thước lớn, chi tiết mô tả, danh mục, nút sửa/xóa hoàn tác.
- **Chạm tiêu đề tháng (Tap Header / Chi tiết ›):** Mở `MonthDetailBottomSheet` xem biểu đồ và phân tích tháng.
- **Chạm nhãn "Chưa có giá":** Mở bàn phím số khối vuông để bổ sung giá tiền ngay tại chỗ.
- **Chạm chip tháng (Quick Jumper):** Danh sách tự động cuộn nhanh (scroll to index) đến đúng tháng được chọn.

---

## 7. Chuyển Động & Hoạt Họa (Motion & Animation)
- **Số lăn (RollingNumber):** Khi cuộn đến tháng mới hoặc mở màn hình, số tiền "Đã chi" lăn số mượt trong 500ms dạng `tabular-nums`.
- **Nhấn khối (Block Press):** Nhấn ô ảnh thụt nhẹ 2px `{ transform: [{ scale: 0.98 }] }`.
- **Trượt tiêu đề dính:** Mượt mà theo quán tính cuộn của hệ thống, không giật lag layout.
- **Giảm chuyển động:** Tôn trọng cài đặt hệ thống (Reduce Motion) bằng cách tắt hiệu ứng số lăn.

---

## 8. Bảng Từ Ngữ (String Dictionary)

*Bổ sung vào `src/constants/strings.ts`:*

| Khóa Chuỗi | Giá Trị Tiếng Việt Hiển Thị | Ngữ Cảnh Sử Dụng |
| :--- | :--- | :--- |
| `stats.title` | `"Thống kê"` | Tiêu đề chính trang |
| `stats.ongoing` | `"Đang diễn ra"` | Nhãn gắn trên tháng hiện tại |
| `stats.spent_prefix` | `"Đã chi "` | Tiêu đề tổng tiền chi tháng |
| `stats.saved_prefix` | `"Đã giữ lại "` | Số tiền cứu ví trong tháng |
| `stats.income_prefix` | `"Thu "` | Tổng thu nhập tháng |
| `stats.items_count` | `"{count} khoản"` | Số lượng món trong tháng |
| `stats.unpriced_chip` | `"{count} chưa có giá"` | Chip nhắc nhở bổ sung giá |
| `stats.unpriced_label` | `"Chưa có giá"` | Nhãn dán trên ô ảnh chưa có giá |
| `stats.detail_btn` | `"Chi tiết ›"` | Nút mở phân tích tháng |
| `stats.empty_title` | `"Chưa có tấm ảnh chi tiêu nào"` | Màn hình rỗng |
| `stats.empty_desc` | `"Chụp thử món gần nhất để mở cuốn album tiền của bạn"` | Mô tả màn hình rỗng |
| `stats.empty_cta` | `"Mở máy ảnh ngay"` | Nút hành động chính |
| `stats.month_detail_title` | `"Chi tiết tháng"` | Tiêu đề sheet phân tích |

---

## 9. Khả Năng Tiếp Cận (Accessibility — A11y)
- **VoiceOver:** Nhãn đọc chi tiết cho ô ảnh: *"Ảnh {mô tả}, {số tiền}, ngày {ngày tháng}"*. Tiêu đề tháng đọc: *"Tháng {tháng}, đã chi {số tiền}, {số lượng} khoản"*.
- **Vùng chạm (Touch Target):** Các chip lọc và nút bấm tối thiểu 44px x 44px.
- **Độ tương phản:** Đạt chuẩn WCAG AA: Nhãn giá chữ trắng trên nền đen mờ mờ (`rgba(0,0,0,0.75)`), viền vàng `#FFC800` sắc nét.

---

## 10. Ngân Sách Hiệu Năng (Performance Budget)
- **Thời gian vẽ (TTI):** ≤ 600ms từ cache đĩa.
- **Tốc độ cuộn:** Đảm bảo 60fps khi cuộn liên tục qua 12 - 24 tháng.
- **Ảnh thu nhỏ (Thumbnails):** Kích thước tối ưu ~240px WebP, giải phóng bộ nhớ khi ô trượt ra khỏi vùng nhìn.

---

## 11. Kế Hoạch Kiểm Thử (Test Plan)
- **Unit Tests (`src/utils/__tests__/statsUtils.test.ts`):**
  - Test gom nhóm giao dịch theo tháng chuẩn múi giờ Việt Nam (Asia/Ho_Chi_Minh).
  - Test tính tổng `totalSpent`, `totalIncome`, `totalSaved` chính xác 100%.
  - Test kiểm tra khoản lúc 23:30 ngày 31 thuộc đúng tháng hiện tại.
  - Test khoản chưa có giá không được cộng dồn vào `totalSpent`.
- **Kiểm thử trên thiết bị thật:** Kiểm tra độ mượt cuộn danh sách ảnh, hiển thị viền vàng cho món không mua, ẩn tiền đồng bộ toàn app.

---

## 12. Tiêu Chí Nghiệm Thu (Acceptance Criteria — Đo Được)
1. [ ] Mỗi tháng có dữ liệu hiển thị đúng 1 khối danh sách, tháng mới nhất ở trên cùng.
2. [ ] Tiêu đề tháng dính đầu khi cuộn qua tháng đó; nút "Chi tiết ›" mở sheet phân tích tháng.
3. [ ] "Đã chi" của tháng hiện tại khớp từng đồng với số liệu ở Home.
4. [ ] Ô chưa có giá hiển thị nhãn nét đứt "Chưa có giá" (không hiện "0 đ"), không bị cộng vào tổng chi.
5. [ ] Ô "Không mua" có viền vàng bao quanh, cộng vào "Đã giữ lại", không cộng vào "Đã chi".
6. [ ] Nút "Ẩn tiền" che toàn bộ số tiền trên tiêu đề tháng và nhãn các ô ảnh.
7. [ ] Thanh chọn tháng nhảy nhanh cuộn đến đúng vị trí tháng tương ứng.
8. [ ] Đạt chuẩn 0 error, 0 warning khi chạy `npx tsc --noEmit`.

---

## 13. Rủi Ro & Giải Pháp
- **Rủi ro:** Khi người dùng có hàng nghìn ảnh chi tiêu qua nhiều năm, việc render tất cả sẽ gây tràn bộ nhớ hoặc giật lag.
- **Giải pháp:** Sử dụng danh sách ảo hóa chia theo Section (SectionList hoặc FlatList theo từng tháng). Chỉ tải thumbnail 240px với `expo-image` cache đĩa.
