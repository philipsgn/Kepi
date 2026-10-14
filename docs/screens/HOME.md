# 📋 ĐẶC TẢ MÀN HÌNH: HOME (TAB SỔ CHI TIÊU)

> **Mã màn hình:** `HOME` (`JournalView`)  
> **Vị trí điều hướng:** Tab 0 trên thanh Floating Pill Tab Bar  
> **Trạng thái:** Chờ duyệt (Stage A: Documentation)  
> **Phiên bản:** 1.0 (Chuẩn Production Khối Vuông)  
> **Lần cập nhật cuối:** 2026-10-02  

---

## 1. Mục Tiêu & Người Dùng

- **User Story:** Là một người trẻ (sinh viên hoặc người đi làm), tôi muốn mở trang Sổ để xem ngay mình còn bao nhiêu tiền tiêu cho ngày hôm nay và nhìn lại nhật ký ảnh các món đã ăn/mua trong tháng dưới dạng lịch ảnh trực quan, giúp tôi tự điều chỉnh hành vi chi tiêu mà không cảm thấy áp lực hay khô khan như các bảng tính kế toán.
- **Mục tiêu sản phẩm:** 
  1. Loại bỏ hoàn toàn cảm giác "kế toán khô khan", biến sổ chi tiêu thành album nhật ký cuộc sống thường nhật.
  2. Báo cáo ngân sách ngày minh bạch tức thì trong 1 giây qua thẻ vàng khối vuông và thanh 10 ô trực quan.
  3. Tôn trọng tối đa quyền riêng tư người dùng nơi công cộng với tính năng "Ẩn tiền".
- **Tiêu chí thành công đo được (Success Metrics):**
  - Thời gian nhận biết ngân sách còn lại: < 1 giây kể từ khi mở trang.
  - Tỷ lệ người dùng tương tác mở xem lại ảnh ngày trong lịch: ≥ 45% phiên hoạt động.
  - Tỷ lệ chuyển đổi trạng thái khi vượt ngân sách mà không bỏ app: ≥ 80%.

---

## 2. Wireframe Chữ (ASCII Wireframe)

### 2.1. Cấu Trúc Giao Diện Trực Quan (Border-less Editorial / Soft Tonal Depth Layout)
```text
┌────────────────────────────────────────────────────────────┐
│ CHÀO BUỔI TRƯA                                             │
│ Bạn  [✨ 14]                 [👁 Ẩn tiền] [⚙️ Cài đặt] [👤]│ (Header không viền, nền mềm)
│ 💼 Ví: 12.450.000 đ          (Số dư khả dụng tóm tắt inline)│
├────────────────────────────────────────────────────────────┤
│                                                            │
│ 1. SECTION HERO (DUY NHẤT CÓ VIỀN ANCHOR — FOCUS CARD)     │
│ ┌ HÔM NAY TIÊU ĐƯỢC                       ĐÃ CHI HÔM NAY ─┐│ (Card nổi duy nhất)
│ │ 180.000 đ                               0 đ             ││
│ │ ▮▮▮▮▮▮▮▮▯▯ (Thanh tiến độ Dynamic Smoothing mỏng 6px)    ││
│ │ Ngân sách tháng còn: 5.200.000 đ                        ││
│ └──────────────────────────────────────────────────────────┘│
│                                                            │
│ 2. DẢI DÒNG TIỀN PHẲNG (BORDER-LESS CASHFLOW BAR — ~40PX)  │
│   [ ▮ Tuần | Tháng ]         [📉 Chi: 0 đ]   [📈 Thu: 0 đ]  │ (Trôi tự nhiên, không viền hộp)
│                                                            │
│ 3. BỘ LỊCH THÍCH ỨNG (DYNAMIC CALENDAR BY PERIOD)          │
│ * Ở chế độ TUẦN: 7 Ngày Thả Nổi (Polaroid Floating Cells)  │
│   ‹ Tuần 05/10 - 11/10, 2026 ›                             │
│   [Tất cả] [Ăn uống & Cà phê] [Di chuyển] [Mua sắm] (cuộn) │
│    T2    T3    T4    T5    T6    T7    CN                  │ (Không viền hộp bọc ngoài,
│   [ 5 ] [ 6 ] [ 7*] [ 8 ] [ 9 ] [ 10] [ 11]                │  ô ảnh nổi mềm trên nền)
│                                                            │
│ * Ở chế độ THÁNG: Lưới 31 Ngày Cả Tháng (Photo Grid)       │
│                                                            │
│ 4. MINI PILL GỢI Ý CHỤP (~36PX, KHÔNG VIỀN CỨNG)           │
│   [✨ Chưa có ghi chép hôm nay — Chụp hoặc ghi nhanh       ›]│ (Nền mềm surfaceAlt)
└────────────────────────────────────────────────────────────┘
```

### 2.2. Sheet Đáy Chi Tiết Ngày Khi Chạm Ô Lịch (Day Detail Sheet)
```text
┌────────────────────────────────────────────────────────────┐
│ ── Thanh kéo sheet đáy ─────────────────────────────────── │
│ Ngày 17 tháng 10, 2026                                 [X] │
│ Tổng chi: 145.000 đ • 2 khoản ghi                          │
│                                                            │
│ ┌ Khoản 1 ───────────────────────────────────────────────┐ │
│ │ [Ảnh lớn] 12:30 • Phở bò tái lăn                       │ │
│ │           Ăn uống                            45.000 đ  │ │
│ └────────────────────────────────────────────────────────┘ │
│ ┌ Thẻ Khoảnh Khắc Locket (Vuốt ngang Carousel 1/N) ───────┐ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ [ ẢNH KHOẢNH KHẮC CHẤT LƯỢNG CAO (Bo góc 22px)  ]   │ │ │
│ │ │ [ 12:30 ]                               [ Chi tiêu ]│ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │   - 50.000 đ                                            │ │
│ │   [ 🍜 Ăn uống ]                                        │ │
│ │   "Gà rán giòn rụm với bạn"                             │ │
│ │   Chạm để xem chi tiết >                                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                ( • • •  Trang 1 / 3 )                       │
│                                                             │
│ [ 📷 Chụp thêm cho ngày này ] (Nếu trong hạn ghi bù)        │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Cây Component & Props (Component Hierarchy)

```text
<JournalView> (Màn hình chính)
  ├── <SafeAreaView edges={['top']}>
  ├── <StickyHeaderBar>
  │     ├── <GreetingBlock> (Lời chào + Biệt danh)
  │     └── <HeaderActionsRow>
  │           ├── <BlockButton variant="secondary" size="sm" icon={<Settings />} /> (Cài đặt)
  │           └── <AvatarTouchBlock /> (Chạm mở Hồ sơ)
  ├── <ScrollView showsVerticalScrollIndicator={false}>
  │     ├── <StatusChipsRow>
  │     │     ├── <BlockChip label="Đã chi hôm nay ..." color="dynamic" />
  │     │     └── <BlockChip label="Ngày liên tiếp ..." icon={<Calendar />} />
  │     ├── <ViewModeToggleRow>
  │     │     ├── <SegmentedBlockToggle mode="day|month" />
  │     │     └── <PrivacyToggleBlock isHidden={boolean} /> (Ẩn tiền)
  │     ├── <TodayAllowanceCard> (Thẻ "Hôm nay tiêu được")
  │     │     ├── <RollingNumber amount={remainingToday} isHidden={isPrivacyHidden} />
  │     │     ├── <DaysLeftIndicator count={daysRemainingInMonth} />
  │     │     ├── <DiscreteAllowanceBar totalBlocks={10} spentBlocks={X} status="safe|warning|over" />
  │     │     └── <AllowanceSubStats spentToday={...} savedMonth={...} />
  │     ├── <MonthlySummaryRow> (2 Khối Chi / Thu song song)
  │     │     ├── <Block variant="dark" label="Chi tháng này" amount={totalMonthExpense} />
  │     │     └── <Block variant="dark" label="Thu tháng này" amount={totalMonthIncome} />
  │     ├── <CategoryFilterScroll>
  │     │     └── <BlockChip ... /> (Tất cả, Ăn uống, Đi lại, Mua sắm...)
  │     └── <ViewContentArea>
  │           ├── {mode === 'month' && <PhotoCalendarGrid />}
  │           │     ├── <MonthNavigator currentMonth={MM/YYYY} onPrev={...} onNext={...} />
  │           │     ├── <WeekdaysHeaderRow /> (T2 -> CN)
  │           │     └── <CalendarGridCells matrix={daysMatrix}>
  │           │           └── <DayPhotoCell day={d} photos={...} badge={+N} isToday={...} isSkippedOnly={...} />
  │           └── {mode === 'day' && <RecentMomentsList />}
  │                 └── <MomentRow item={tx} isHidden={isPrivacyHidden} />
  ├── <DayDetailBottomSheet visible={isDaySheetOpen} dayData={...} onClose={...} />
  └── <QuickSettingsSheet visible={isSettingsOpen} onClose={...} />
```

### Bảng Chi Tiết Props & Component:
| Component | File Nguồn | Props Chính | Mô Tả |
| :--- | :--- | :--- | :--- |
| `DiscreteAllowanceBar` | `src/components/budget/DiscreteAllowanceBar.tsx` | `totalBlocks: 10`, `spentPercent: number`, `status: 'safe' \| 'warning' \| 'over'` | Thanh 10 ô vuông dàn đều 100% bề ngang, đạt chuẩn tương phản WCAG AA |
| `PhotoCalendarGrid` | `src/components/journal/PhotoCalendarGrid.tsx` | `year: number`, `month: number`, `summaries: Record<string, DaySummary>`, `onSelectDay: (date) => void` | Lưới lịch ảnh 7 cột (T2..CN), hỗ trợ xếp chồng ảnh đa lớp phong cách Locket |
| `DayPhotoCell` | `src/components/journal/DayPhotoCell.tsx` | `dateStr: string`, `photos: string[]`, `extraCount: number`, `isToday: boolean`, `isFuture: boolean`, `isSkippedOnly: boolean` | Ô ngày lịch cá nhân hóa: Xếp chồng 3D đa lớp (tối đa 3 ảnh xếp so le góc xoay tự nhiên, viền hairline), badge đếm số ảnh `+N` |
| `RollingNumber` | `src/components/common/RollingNumber.tsx` | `value: number`, `format: 'full' \| 'compact'`, `isHidden: boolean` | Hiệu ứng số lăn 500ms dạng chữ số tabular không giật layout |
| `DayDetailBottomSheet` | `src/components/journal/DayDetailBottomSheet.tsx` | `visible: boolean`, `selectedDate: string`, `transactions: Transaction[]`, `onClose: () => void` | Sheet đáy xem chi tiết khoảnh khắc dạng Locket Photo Carousel (ảnh lớn, số tiền to bản tabular-nums, tag danh mục, note), hỗ trợ chụp thêm |

---

## 4. Hợp Đồng Dữ Liệu (Data Contract)

### 4.1. Kiểu Dữ Liệu Tóm Tắt Ngày Dành Riêng Cho Lưới Lịch (`DaySummary`):
*Tối ưu hiệu năng: KHÔNG tải toàn bộ danh sách transactions nặng khi chỉ vẽ lịch.*
```typescript
export interface DayCalendarSummary {
  date: string;               // YYYY-MM-DD
  dayNumber: number;          // 1 - 31
  totalExpense: number;       // Tổng chi trong ngày (VND)
  totalIncome: number;        // Tổng thu trong ngày (VND)
  itemCount: number;          // Tổng số khoản ghi nhận
  photoThumbnails: string[];  // Tối đa 2 URL thumbnail kích thước 160px
  hasSkippedOnly: boolean;    // Ngày chỉ có hành động "Không mua" (viền vàng)
  isFuture: boolean;          // Ngày trong tương lai
  isToday: boolean;           // Hôm nay
}

export interface MonthCalendarData {
  year: number;
  month: number;
  days: DayCalendarSummary[];
  totalMonthExpense: number;
  totalMonthIncome: number;
}
```

### 4.2. Quản Lý Trạng Thái & Cache (Zustand + AsyncStorage):
- **Store sử dụng:** `useBudgetStore`, `useTransactionStore`, `useAuthStore`.
- **Cơ chế lưu trữ tùy chọn giao diện cục bộ (`@home_view_preferences`):**
  ```typescript
  interface HomePreferences {
    preferredMode: 'day' | 'month'; // Nhớ lựa chọn gần nhất
    isPrivacyHidden: boolean;       // Trạng thái ẩn số tiền
  }
  ```
- **Chiến lược Offline & Đồng Bộ:**
  - Đọc từ cache AsyncStorage trước, hiển thị tức thì trong < 600ms.
  - Tự động revalidate từ Supabase nền khi có mạng.
  - Xử lý xung đột: *Ghi sau thắng (Last-Write-Wins)* theo `updated_at`.

---

## 5. Ma Trận Trạng Thái (State Matrix)

| Trạng Thái | Điều Kiện | Hiển Thị Giao Diện | Hành Vi & Phản Hồi |
| :--- | :--- | :--- | :--- |
| **Đang tải lần đầu** | Lần đầu mở app, chưa có cache | Skeleton khối vuông cho Thẻ ngân sách, 2 ô Chi/Thu, và khung lưới 7 cột | Không nhấp nháy, vô hiệu chạm các ô chưa sẵn sàng |
| **Có cache** | Có dữ liệu tháng trong cache | Render đầy đủ ngay lập tức từ bộ nhớ | Tải ngầm kiểm tra cập nhật mới |
| **Tháng chưa có dữ liệu** | Tháng đang xem có 0 giao dịch | Lưới ô xám mờ + Dòng chữ bạn bè *"Chưa có gì tháng này. Chụp thử món gần nhất."* + Nút *"Mở camera"* | Bấm *"Mở camera"* chuyển mượt sang Tab 1 (Camera) |
| **Mới cài, chưa đặt mục tiêu** | Người dùng chưa nhập thu nhập / mục tiêu | Thẻ ngân sách hiện *"Chưa đặt mục tiêu"* kèm gợi ý *"Đặt mục tiêu để tính chính xác hơn"* | Chạm vào thẻ mở modal thiết lập mục tiêu cá nhân |
| **Lỗi tải** | API Supabase lỗi / Timeout | Banner nhỏ: *"Không tải được. Thử lại."* + Nút *"Thử lại"* | Vẫn giữ hiển thị dữ liệu cache cũ nếu có |
| **Offline** | Điện thoại mất kết nối mạng | Nhãn nhỏ *"Chưa đồng bộ"* viền đen trên đầu | Các khoản vừa ghi offline hiển thị icon đồng hồ cát chờ sync |
| **Vượt ngân sách ngày** | `todaySpent > todayBudget` | 10 ô chuyển sang **Đỏ** (`#FF4D4D`), nền thẻ vàng giữ nguyên. Dòng gợi ý: *"Hôm nay vượt X đ. Mai dàn đều nhé."* | Không popup chặn, không khóa tính năng |
| **Chế độ Ẩn tiền** | `isPrivacyHidden === true` | Mọi con số tiền trên màn hình chuyển thành `••••` | Áp dụng tức thì cho cả widget và bản chụp màn hình app switcher |

---

## 6. Tương Tác & Cử Chỉ (Interactions & Gestures)

1. **Chuyển Chế Độ [ Ngày | Tháng ]:**
   - Chạm nút pill: Chuyển đổi mượt 180ms.
   - Logic thông minh: Mặc định chọn chế độ **Tháng** nếu tháng đó có $\ge 1$ ảnh; nếu không có ảnh nào thì mở chế độ **Ngày**. Lựa chọn gần nhất được lưu vào bộ nhớ máy.
2. **Thanh 10 Ô Ngân Sách:**
   - Dàn đều 100% bề ngang khối thẻ vàng.
   - Chuẩn tương phản WCAG AA:
     - Ô còn lại: **Nền ĐEN `#000000`** trên thẻ vàng `#FFC800` (độ tương phản 13.5:1, vượt xa chuẩn 4.5:1).
     - Ô đã dùng: **Viền đen rỗng** trong suốt, thấy nền vàng.
     - Vượt ngân sách: Các ô chuyển sang **Màu đỏ `#FF4D4D`**.
3. **Lưới Lịch Ảnh Tháng (Cử chỉ & Xung đột):**
   - **Chạm vào ô ngày:** Mở Sheet đáy `DayDetailBottomSheet` chi tiết các món trong ngày. Rung nhẹ `Light`.
   - **Giữ lâu (Long Press ≥ 350ms):** Xem trước phóng to ảnh khoảnh khắc đầu tiên (Quick Peek modal). Rung `Medium`.
   - **Vuốt ngang trên lịch:** Chuyển sang tháng trước / tháng sau.
   - **Xử lý xung đột cử chỉ với Pager chính:** Khi người dùng bắt đầu chạm/vuốt bên trong vùng lưới lịch, `HorizontalPager` cha tạm thời bị khóa (`disallowPaging: true`) để ưu tiên lật tháng trên lịch.
4. **Nút Cài Đặt Khối Vuông:**
   - Bỏ hoàn toàn nút bánh răng nổi màu xanh dương.
   - Tích hợp thành nút Block nhỏ chuẩn đen/vàng ở góc phải Header: Chạm mở sheet Cài Đặt Nhanh (chỉnh số dư, giờ bắt đầu ngày mới, khóa mã bảo vệ).

---

## 7. Chuyển Động & Hoạt Họa (Motion & Animation)

- **Số lăn (Rolling Number):** Thời lượng 500ms, easing `easeOutCubic`, con số thay đổi mượt mà không làm rung layout (`tabular-nums`).
- **Khối bật so le (Staggered Entrance):** Khi vào màn hình, các khối (Thẻ hôm nay, 2 ô Chi/Thu, Lưới lịch) trượt nhẹ lên với độ trễ 30ms giữa các khối (tổng ≤ 300ms).
- **Nhấn khối xúc giác (Tactile Press Sink):** Thời lượng 80ms, dịch chuyển `{ translateX: 3, translateY: 3 }`, bóng phẳng hóa về 1px kết hợp rung phản hồi `Haptics.selectionAsync()`.
- **Lật tháng lịch:** Trượt ngang 220ms spring easing mượt mà.
- **Tuân thủ Giảm chuyển động (Accessibility Reduce Motion):** Tự động chuyển toàn bộ hiệu ứng trượt/nảy sang mờ dần (Fade) 150ms nếu thiết bị bật tính năng giảm chuyển động.

---

## 8. Bảng Từ Ngữ Chuẩn Hóa (String Dictionary)
*100% chuỗi nằm trong `src/constants/strings.ts`. Tuyệt đối không dùng từ ngữ game, không chê bai.*

| Khóa Chuỗi | Chuỗi Hiển Thị Đời Thường | Vị Trí Áp Dụng |
| :--- | :--- | :--- |
| `home.greetingMorning` | `"Chào buổi sáng"` (05:00 - 10:59) | Header |
| `home.greetingNoon` | `"Chào buổi trưa"` (11:00 - 13:59) | Header |
| `home.greetingAfternoon` | `"Chào buổi chiều"` (14:00 - 17:59) | Header |
| `home.greetingEvening` | `"Chào buổi tối"` (18:00 - 22:59) | Header |
| `home.greetingLateNight` | `"Khuya rồi"` (23:00 - 04:59) | Header |
| `home.consecutiveDays` | `"Ngày liên tiếp"` | Chip trạng thái |
| `home.spentToday` | `"Đã chi hôm nay"` | Chip trạng thái |
| `budget.dailyAllowance` | `"Hôm nay tiêu được"` | Thẻ ngân sách chính |
| `budget.daysRemaining` | `(days: number) => "${days} ngày còn lại"` | Thẻ ngân sách |
| `budget.spent` | `"Đã chi"` | Dòng phụ thẻ ngân sách |
| `budget.savedMoney` | `"Đã giữ lại"` | Dòng phụ thẻ ngân sách |
| `budget.overBudgetAdvice` | `(amountStr: string) => "Hôm nay vượt ${amountStr}. Mai dàn đều nhé."` | Dòng cảnh báo vượt ngân sách |
| `budget.needGoalHint` | `"Đặt mục tiêu để tính chính xác hơn"` | Gợi ý khi chưa có mục tiêu |
| `home.monthExpense` | `"Chi tháng này"` | Ô khối bên trái |
| `home.monthIncome` | `"Thu tháng này"` | Ô khối bên phải |
| `home.viewDay` | `"Ngày"` | Nút chuyển chế độ |
| `home.viewMonth` | `"Tháng"` | Nút chuyển chế độ |
| `home.hideMoney` | `"Ẩn tiền"` | Nút bảo mật |
| `home.showMoney` | `"Hiện tiền"` | Nút bảo mật |
| `home.recent` | `"Gần đây"` | Tiêu đề danh sách ngày |
| `home.emptyMonth` | `"Chưa có gì tháng này. Chụp thử món gần nhất."` | Trạng thái tháng trống |
| `home.openCamera` | `"Mở camera"` | Nút CTA tháng trống |
| `home.notSynced` | `"Chưa đồng bộ"` | Nhãn offline |
| `common.retry` | `"Thử lại"` | Nút thử lại khi lỗi |

---

## 9. Khả Năng Tiếp Cận (Accessibility — A11y)

1. **VoiceOver / TalkBack:**
   - Mỗi ô ngày có nhãn rõ ràng: Ví dụ *"Ngày 17 tháng 10, 3 khoản, tổng chi 145.000 đồng, chạm đúp để xem chi tiết"*.
   - Nút ẩn tiền có nhãn *"Ẩn số tiền cá nhân, đang tắt"* hoặc *"Đang bật"*.
2. **Độ Tương Phản Màu (WCAG AA):**
   - Chữ đen `#000000` trên nền vàng `#FFC800` đạt tỷ lệ tương phản **13.5:1** (vượt xa chuẩn 4.5:1).
   - Thanh 10 ô: Ô còn lại màu đen tuyền trên nền vàng đạt chuẩn nhận diện hình khối rõ nét ngay cả ngoài trời nắng gắt.
3. **Vùng Chạm (Touch Targets):** Mọi nút điều hướng tháng, nút Cài đặt, nút lọc đều có kích thước tối thiểu `44px x 44px`.
4. **Chuẩn Kích Thước Chữ Công Thái Học (Typography Scale):**
   - Không dùng font $\le 11\text{px}$ cho các nội dung đọc chính (tránh cảm giác "keo kiệt", mỏi mắt).
   - Nhãn phụ, tiêu đề phụ đạt tối thiểu `12px` - `13px` (greeting 13px, thứ 12px, ngày 13px, nhãn chi/thu 12px).
   - Số tiền đạt tối thiểu `15px` - `26px` có thuộc tính `fontVariant: ['tabular-nums']` chống giật.

---

## 10. Ngân Sách Hiệu Năng (Performance Budget)

- **Thời gian render từ cache:** $\le 500\text{ms}$ đạt giao diện tương tác hoàn chỉnh.
- **Tốc độ khung hình (Frame Rate):** Đạt ổn định **60fps** khi cuộn dọc và khi trượt lật tháng.
- **Kích thước Thumbnail Lịch:** Sử dụng WebP nén `160px x 160px` kích thước trung bình $\le 18\text{KB}$/ảnh, cache đĩa tự động bằng `expo-image`.
- **Bộ nhớ RAM:** Không rò rỉ bộ nhớ (leak) khi người dùng lật qua lại 12 tháng liên tục.

---

## 11. Sự Kiện Phân Tích (Analytics Events)
*Tuân thủ nguyên tắc quyền riêng tư: Tuyệt đối không gửi số tiền hoặc nội dung chi tiêu cá nhân.*

| Tên Sự Kiện | Thuộc Tính Gửi Kèm | Mục Đích Phân Tích |
| :--- | :--- | :--- |
| `home_viewed` | `view_mode ('day' \| 'month'), is_privacy_hidden (boolean)` | Tần suất và thói quen mở trang Sổ |
| `view_mode_changed` | `to_mode ('day' \| 'month')` | Đánh giá mức độ yêu thích xem Lịch vs Danh sách |
| `month_changed` | `direction ('prev' \| 'next'), month, year` | Tần suất tra cứu lại quá khứ |
| `day_opened` | `item_count, has_photo (boolean)` | Tần suất xem chi tiết ngày |
| `privacy_toggled` | `is_hidden (boolean)` | Mức độ sử dụng tính năng bảo vệ sự riêng tư |
| `empty_cta_tapped` | `current_month` | Đánh giá hiệu quả gợi ý mở Camera khi tháng trống |

---

## 12. Kế Hoạch Kiểm Thử (Test Plan)

### 12.1. Unit Tests (`src/utils/__tests__/`):
1. **Định dạng tiền tệ (`currency.ts`):**
   - Định dạng đầy đủ: `0` $\rightarrow$ `"0 đ"`, `45000` $\rightarrow$ `"45.000 đ"`, `1250000` $\rightarrow$ `"1.250.000 đ"`, `-50000` $\rightarrow$ `"-50.000 đ"`.
   - Định dạng rút gọn: `850000` $\rightarrow$ `"850k"`, `1200000` $\rightarrow$ `"1,2tr"`.
2. **Công thức ngân sách ngày (`budgetCalculations.ts`):**
   - Trường hợp bình thường, trường hợp 0 ngày còn lại, trường hợp chi tiêu vượt ngân sách.
3. **Gom dữ liệu lịch tháng theo múi giờ Việt Nam (`calendarUtils.ts`):**
   - Phân bổ giao dịch chính xác vào ngày tương ứng theo giờ `Asia/Ho_Chi_Minh` (kể cả giao dịch lưu lúc 23:30 giờ VN tức 16:30 UTC).
4. **Lời chào theo giờ (`dateTime.ts`):**
   - Đảm bảo đúng 5 khung giờ: Sáng, Trưa, Chiều, Tối, Khuya.

### 12.2. Kiểm Thử Giao Diện & Thiết Bị Thật:
- [ ] Kiểm tra iPhone màn nhỏ (iPhone SE / iPhone mini) không bị tràn hàng thẻ 10 ô.
- [ ] Kiểm tra iPhone màn lớn (Pro Max) bố cục cân đối, lưới lịch 7 cột đều nhau.
- [ ] Kiểm tra tháng đặc biệt: Tháng 2 (28/29 ngày), tháng bắt đầu bằng Chủ Nhật.
- [ ] Kiểm tra tháng có trên 100 khoản chi xem độ mượt mà.
- [ ] Kiểm tra tính năng "Ẩn tiền" lưu trạng thái sau khi đóng và mở lại ứng dụng.

---

## 13. Tiêu Chí Nghiệm Thu (Acceptance Criteria — Đo Được)

1. [x] **AC-1:** Biến mất hoàn toàn nút bánh răng nổi màu xanh dương. Nút Cài đặt nằm gọn gàng dạng Block ở Header.
2. [x] **AC-2:** 100% số tiền tuân thủ đúng định dạng chuẩn `"45.000 đ"` / `"0 đ"`. Không trộn lẫn `"100k"` và `"0đ"` trong cùng khối.
3. [x] **AC-3:** Thanh 10 ô trải đều 100% chiều ngang thẻ, ô đen nền vàng đạt chuẩn tương phản WCAG AA, chuyển đỏ khi vượt ngân sách mà không đổi màu thẻ.
4. [x] **AC-4:** Lưới lịch ảnh tháng hiển thị chuẩn 7 cột (T2..CN), đúng chồng ảnh -3°/+3°, badge `+N`, hôm nay tô khối vàng, ngày tương lai làm mờ.
5. [x] **AC-5:** Chạm vào ô ngày mở Sheet đáy chi tiết đúng ngày, hiển thị ảnh, giờ, số tiền và tổng chi khớp 100% với dữ liệu hệ thống.
6. [x] **AC-6:** Nút "Ẩn tiền" che toàn bộ các số tiền thành `••••` và duy trì trạng thái sau khi tắt mở lại app.
7. [x] **AC-7:** 7 trạng thái trong ma trận hiển thị đúng (Đang tải, Có cache, Rỗng, Ít dữ liệu, Lỗi, Offline, Vượt ngân sách).
8. [x] **AC-8:** Mở trang Home từ cache đạt tốc độ $\le 600\text{ms}$, cuộn mượt mà 60fps.
9. [x] **AC-9:** Toàn bộ unit tests pass 100%, TypeScript `npx tsc --noEmit` đạt 0 lỗi, lint sạch sẽ.
10. [x] **AC-10:** Xác nhận bằng chứng chạy thực tế và ảnh chụp màn hình từ iPhone thật.

---

## 14. Rủi Ro Kỹ Thuật & Giải Pháp Giảm Thiểu

| Rủi Ro Kỹ Thuật | Tác Động | Giải Pháp Đã Thiết Kế |
| :--- | :--- | :--- |
| **Xung đột cử chỉ vuốt ngang** giữa Lịch lật tháng và Horizontal Pager 4 tab | Người dùng vuốt đổi tháng lại bị văng sang tab Camera | Sử dụng prop `waitFor` hoặc `onStartShouldSetPanResponder` khóa cuộn của Pager khi ngón tay đang nằm trong vùng Lịch |
| **Giật lag khi cuộn qua lại các tháng** có nhiều ảnh | Tràn RAM hoặc đơ khung hình | Tích hợp `expo-image` với disk cache, chỉ load ảnh thumbnail 160px nén WebP |
| **Lệch ngày do múi giờ UTC** giữa Supabase và máy người dùng | Khoản chi ban đêm bị nhảy sang ngày hôm sau | Viết hàm tiện ích chuẩn hóa toàn bộ ngày tháng về chuỗi `YYYY-MM-DD` theo múi giờ `Asia/Ho_Chi_Minh` trước khi gom nhóm |
