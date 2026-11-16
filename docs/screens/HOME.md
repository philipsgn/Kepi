# 📋 ĐẶC TẢ MÀN HÌNH: HOME (TAB SỔ CHI TIÊU)

> **Mã màn hình:** `HOME` (`JournalView`)  
> **Vị trí điều hướng:** Tab 0 trên thanh Floating Pill Tab Bar  
> **Trạng thái:** Chờ thi công (Stage A: Documentation — đã hoàn thành)  
> **Phiên bản:** 2.0 (Style Heo Con — Kawaii Neo-Brutalist, giữ nguyên 100% features v1.0)  
> **Lần cập nhật cuối:** 2026-11-14  
> **Style Guide bắt buộc đọc trước:** [`docs/STYLE_HEOCON.md`](../STYLE_HEOCON.md) — mọi giá trị viền/bóng/bo/màu/chữ đều lấy từ đó.

---

## 0. THAY ĐỔI V2.0 (TÓM TẮT)

- **Đổi "da", KHÔNG đổi logic:** toàn bộ features v1.0 (thẻ hạn mức, thanh 10 ô, lịch ảnh tuần/tháng, Ẩn tiền, Chi/Thu tháng, lọc danh mục, Day Detail Sheet, Streak, Rollover, Confirmation Inbox, Quick Settings) giữ nguyên hành vi nghiệp vụ, chỉ được trình bày lại bằng hệ component Neo (`NeoCard`, `NeoButton`, `SegmentBar10`, `OverlineLabel`…).
- **Bổ sung khu vườn pixel heo** (Plan 5/6/7) đặt phía trên thẻ "Chi hôm nay", heo phản ứng theo hạn mức ngày.
- Theme áp dụng: **`heocon` (mặc định)** — pink/mint vẫn chạy bình thường, các component Neo tự tô màu theo token theme đang chọn.

---

## 1. Mục Tiêu & Người Dùng

- **User Story:** Là một người trẻ (sinh viên hoặc người đi làm), tôi muốn mở trang Sổ để xem ngay mình còn bao nhiêu tiền tiêu cho ngày hôm nay, nhìn chú heo pixel phản ứng theo mức chi của tôi, và nhìn lại nhật ký ảnh các món đã ăn/mua trong tháng dưới dạng lịch ảnh trực quan — giúp tôi tự điều chỉnh hành vi chi tiêu mà không cảm thấy áp lực hay khô khan như các bảng tính kế toán.
- **Mục tiêu sản phẩm:** 
  1. Loại bỏ hoàn toàn cảm giác "kế toán khô khan", biến sổ chi tiêu thành album nhật ký cuộc sống thường nhật.
  2. Báo cáo ngân sách ngày minh bạch tức thì trong 1 giây qua thẻ kem viền nâu và thanh 10 ô trực quan.
  3. Tôn trọng tối đa quyền riêng tư người dùng nơi công cộng với tính năng "Ẩn tiền".
- **Tiêu chí thành công đo được (Success Metrics):**
  - Thời gian nhận biết ngân sách còn lại: < 1 giây kể từ khi mở trang.
  - Tỷ lệ người dùng tương tác với khu vườn/heo ≥ 30% phiên (chạm heo, chạm sân, cho ăn).
  - Tỷ lệ tương tác mở xem lại ảnh ngày trong lịch: ≥ 45% phiên hoạt động.
  - Tỷ lệ chuyển đổi trạng thái khi vượt ngân sách mà không bỏ app: ≥ 80%.

---

## 2. Wireframe Chữ (ASCII Wireframe — Bố Cục Chuẩn Style Heo Con)

### 2.1. Cấu Trúc Giao Diện Trực Quan (Neo-Brutalist Layout)
```text
┌────────────────────────────────────────────────────────────┐
│ [🐷 Avatar heo 56 viền 3px]  Tên bạn (24 Baloo 800)         │
│                              Chuỗi 3 ngày (13 Nunito muted) │
│                  [Nút Pro nền mực] [⚙ tròn 44 viền 3px]     │  (Header, lề 16)
├────────────────────────────────────────────────────────────┤
│ 1. KHUNG VƯỜN PIXEL (viền 3px ink, bo 28, bóng 0 4 0, 4:3) │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ [🔄 nút tròn] [Vào chuồng]        [● Chuỗi N ngày]      ││ (đè mép trên khung)
│ │            (cảnh vườn Việt hóa 176×132 pixel)            ││
│ │         (heo pixel đi lại · né ao · Y-sort)              ││
│ │ (Nắng · sân · đi dạo)   ← bubble thoại theo tọa độ heo   ││
│ └──────────────────────────────────────────────────────────┘│
│ 2. THẺ "CHI HÔM NAY" (đè đáy vườn −22px, bo 26, bóng 0 4 0) │
│ │ CHI HÔM NAY (overline 12 ls .16em)                       ││
│ │ 180.000đ (38 Baloo tabular)      còn lại trên hạn mức    ││
│ │                                  120.000 đ (18 Baloo)    ││
│ │ ▮▮▮▮▮▮▯▯▯▯ (SegmentBar10 — xanh, lố = đỏ toàn bộ)        ││
│ │ ─ ─ ─ ─ ─ ─ ─ (gạch đứt 2px #D9C9A4) ─ ─ ─ ─ ─ ─ ─ ─     ││
│ │ [🐷 mini] "Chi nhẹ nhàng ghê. Heo ủn ỉn khen một cái."   ││
│ └──────────────────────────────────────────────────────────┘│
│ 3. DẢI DÒNG TIỀN PHẲNG (Border-less Cashflow Bar — ~40px)   │
│   [ Tuần | Tháng ]           [ Chi: 0 đ]  [ Thu: 0 đ]       │ (trôi tự nhiên, re-skin pill neo)
│ 4. BỘ LỊCH THÍCH ỨNG (GIỮ NGUYÊN v1.0)                      │
│   Tuần: 7 ô Polaroid nổi · Tháng: lưới ảnh 7 cột T2→CN      │
│   [Tất cả] [Ăn uống] [Di chuyển] (chips neo viền 3px)       │
│ 5. HŨ / NGUỒN TIỀN (NeoJar lưới, Phase sau khi có data)     │
│   Ngân hàng 12.4M · Ví điện tử 3.2M · Tiền mặt 2.5M         │
└────────────────────────────────────────────────────────────┘
```

### 2.2. Sheet Đáy Chi Tiết Ngày (Day Detail Sheet — giữ nguyên v1.0, re-skin Neo)
- Sheet nền `#FFFBF1`, viền trên 3px ink, tiêu đề 18 Baloo 800, các thẻ khoản chi → `NeoCard` bo 20 viền 3px.
- Tổng chi: số 18 Baloo 800 tabular. Ảnh khoản: bo 14–20 viền 3px (nếu style heocon) / bo mềm hiện tại (pink/mint).
- Carousel Khoảnh Khắc, nút "Chụp thêm cho ngày này" → `NeoButton` variant `gold`.

---

## 3. Cây Component & Props (Component Hierarchy)

```text
<JournalView> (Màn hình chính — nền tokens.bg)
  ├── <SafeAreaView edges={['top']}>
  ├── <NeoHeaderRow> (lề ngang 16)
  │     ├── <NeoAvatar size={56} /> (mặt heo pixel 16×16, viền 3px, bóng 0 3 0)
  │     ├── <WhoBlock> Tên (24 Baloo 800) + "Chuỗi N ngày" (13 Nunito 700 muted)
  │     ├── <NeoButton variant="dark" label="Pro" icon={<Sparkles/>} /> (Pro → Premium sau)
  │     └── <NeoButton variant="round" icon={<Settings/>} onPress={openQuickSettings} />
  ├── <ScrollView showsVerticalScrollIndicator={false}>
  │     ├── <GardenScene> (KHU VƯỜN PIXEL — §4)
  │     │     props: spentToday, todayBudget, streakDays, onLogExpense()
  │     ├── <TodaySpendCard> (NeoCard overlap — đè đáy vườn −22px)
  │     │     ├── <OverlineLabel>"Chi hôm nay"</OverlineLabel>
  │     │     ├── <Amount 38 Baloo 800 tabular> + <DongMark/>
  │     │     ├── <RightColumn> "còn lại trên hạn mức" / "vượt hạn mức" + số 18 Baloo (đỏ khi lố)
  │     │     ├── <SegmentBar10 totalBlocks={10} spentPercent status='safe|warning|over' variant="neo" />
  │     │     ├── <DashedDivider color='#D9C9A4' />
  │     │     └── <TalkRow> heo mini 72×60 + <message(r)> theo mức chi
  │     ├── <MonthlySummaryRow> (2 khối Chi/Thu song song — giữ nguyên v1.0, re-skin NeoCard bo 20)
  │     ├── <ViewModeToggleRow> (Segmented Tuần/Tháng + Ẩn tiền — giữ nguyên logic, re-skin pill viền 3px)
  │     ├── <CategoryFilterScroll> (chips viền 3px — giữ nguyên data)
  │     └── <ViewContentArea>
  │           ├── {period==='week' && <WeekCalendarCarousel />} (GIỮ NGUYÊN v1.0)
  │           └── {period==='month' && <PhotoCalendarGrid />} (GIỮ NGUYÊN v1.0: 7 cột T2→CN, chồng ảnh, badge +N, hôm nay highlight)
  │     ├── <JarsSection> (Phase sau — NeoJar, data nguồn tiền)
  ├── <DayDetailBottomSheet visible onClose /> (giữ nguyên)
  ├── <QuickSettingsSheet visible onClose /> (giữ nguyên)
  ├── <StreakCheckinModal /> + <StreakCelebrationToast /> (giữ nguyên)
  ├── <MonthRolloverBanner /> (re-skin NeoCard variant dark)
  └── <ConfirmationPillBanner + ConfirmationInboxModal /> (giữ nguyên)
```

### Bảng Component Mới / Nâng Cấp:
| Component | File Nguồn (dự kiến) | Props Chính | Mô Tả |
| :--- | :--- | :--- | :--- |
| `NeoCard` / `NeoButton` / `NeoChip` / `OverlineLabel` | `src/components/neo/` | variant, onPress | Nền tảng style — đặc tả trong `STYLE_HEOCON.md` §5 |
| `SegmentBar10` | `src/components/budget/DiscreteAllowanceBar.tsx` (thêm `variant="neo"`) | `totalBlocks: 10`, `spentPercent`, `status` | 10 ô cao 20, viền 2px ink bo 8, gap 5; trống = kem sàn, đầy = xanh lá, lố = ĐỎ TOÀN BỘ |
| `GardenScene` | `src/components/pixel/GardenScene.tsx` | `spentToday`, `todayBudget`, `streakDays`, `onLogExpense` | Khu vườn pixel + heo — đặc tả §4 |
| `DashedDivider` | `src/components/neo/DashedDivider.tsx` | `color='#D9C9A4'` | Gạch đứt 2px (RN: dùng `react-native-svg` `Line` `strokeDasharray` hoặc dải View) |
| `NeoAvatar` | `src/components/neo/NeoAvatar.tsx` | `size=56` | Tròn 56 viền 3px nền `#FCE3E8`, mặt heo pixel bên trong |
| Các component giữ nguyên v1.0 | `src/components/journal/*`, `budget/*`, `streak/*`, `inbox/*` | — | KHÔNG đổi logic, chỉ truyền style qua theme/Neo wrapper |

---

## 4. KHU VƯỜN PIXEL HEO (GardenScene — MỚI V2.0)

> Thông số đầy đủ trong `STYLE_HEOCON.md` §7 (trích xuất 1:1 từ prototype). Dưới đây là hợp đồng thi công trên màn Home.

### 4.1. Cấu trúc & Asset
- Khung: `border 3px ink`, `borderRadius 28`, bóng cứng `0 4px 0`, tỉ lệ **4:3** (canvas logic 176×132, asset PNG phóng 4× nearest-neighbor).
- Lớp render: `garden-bg.png` (Image) → sprite `banana.png` + `stool.png` + **heo** sắp theo trục Y (banana baseline 106, stool 86, heo theo `pig.y`) → `garden-fg.png` (bụi hoa, cỏ).
- Overlay trong khung: nút tròn "Vào chuồng" (trái-trên), badge nền mực "Chuỗi N ngày" (phải-trên), nhãn trạng thái pill (dưới-trái), bubble thoại theo tọa độ heo.
- Asset sinh bằng `scripts/generate-pixel-garden.js` (Node, PNG encode `zlib`, không thêm native dep) → `assets/pixel/`.

### 4.2. Hợp đồng dữ liệu & liên kết ngân sách
| Input | Nguồn | Hiệu ứng trên vườn |
|---|---|---|
| `spentToday`, `todayBudget` | `useBudgetStore()` | `spent > budget` → heo **sad + đi chậm 15 px/s**; thanh 10 ô đỏ toàn bộ |
| `streakDays` | `calculateStreakDays(...)` (giữ nguyên) | Badge "Chuỗi N ngày" nền mực góc phải |
| Số khoản đã ghi hôm nay | `transactions` filter hôm nay | Nút "Cho heo ăn" → heo ăn khi đã có khoản ghi; chưa có → thoại mời ghi |
| Ghi khoản mới (CONFIRMED) | store | Heo nhảy vui 0.9s + bubble "「Tên món」 −45.000đ"; vừa vượt hạn mức → đứng buồn + "Ối, lố hạn mức rồi" (2s) |
| Giờ trong ngày | `new Date().getHours()` | Nắng (06–15) / Chiều (16–18, phủ cam 0.20) / Đêm (19–05, phủ xanh đen 0.44 + đèn lồng + đom đóm) |

- **KHÔNG thêm đơn vị "cám"** (khác prototype) — phần thưởng quy về chuỗi Streak + "Đã giữ lại X đ" hiện có.
- **Tận trọng reduce-motion:** HĐH bật giảm chuyển động → heo không tự đi, chỉ phản hồi khi chạm; toàn bộ transition đổi thành fade 150ms.

### 4.3. Cử chỉ trong vườn
1. **Chạm heo** (hit-box ±13 ngang, y−22 → y+3): nhảy vui 1.2s + thoại ngẫu nhiên + `Haptics.Light`.
2. **Chạm sân:** heo chạy tới điểm chạm (clamp vùng đi được x 26–164, y 78–118, né ao tâm (136,106) elip (31,13)).
3. **Chạm ao:** heo từ chối: "Ở đó có ao, heo không bơi đâu nha".
4. **Vào chuồng:** heo ngủ 8s (chữ z bay).
5. **Xung đột cuộn:** vùng vườn `onStartShouldSetPanResponder` khóa cuộn dọc ScrollView cha khi ngón tay trong khung (giống cơ chế lịch tháng v1.0).

---

## 5. Hợp Đồng Dữ Liệu (Data Contract — GIỮ NGUYÊN v1.0)

### 5.1. `DayCalendarSummary` / `MonthCalendarData`
*Không đổi so với v1.0 — tối ưu hiệu năng: KHÔNG tải toàn bộ transactions khi chỉ vẽ lịch.*
```typescript
export interface DayCalendarSummary {
  date: string;               // YYYY-MM-DD
  dayNumber: number;          // 1 - 31
  totalExpense: number;
  totalIncome: number;
  itemCount: number;
  photoThumbnails: string[];  // tối đa 2 URL thumbnail 160px
  hasSkippedOnly: boolean;    // ngày chỉ có "Không mua" (viền vàng)
  isFuture: boolean;
  isToday: boolean;
}
export interface MonthCalendarData {
  year: number; month: number;
  days: DayCalendarSummary[];
  totalMonthExpense: number; totalMonthIncome: number;
}
```

### 5.2. Trạng thái & Cache (Zustand + AsyncStorage)
- Store: `useBudgetStore`, `useTransactionStore`, `useAuthStore` — không đổi.
- Preferences `@vi_locket_home_preferences`: `{ preferredMode: 'week'|'month', isPrivacyHidden }` — không đổi.

---

## 6. Ma Trận Trạng Thái (State Matrix — GIỮ NGUYÊN + bổ sung vườn)

| Trạng Thái | Điều Kiện | Hiển Thị Giao Diện | Hành Vi & Phản Hồi |
| :--- | :--- | :--- | :--- |
| **Đang tải lần đầu** | Chưa có cache | Skeleton khối kem viền nâu cho Thẻ hạn mức, 2 ô Chi/Thu, khung vườn (nền tĩnh không heo) | Không nhấp nháy |
| **Có cache** | Có dữ liệu tháng | Render ngay từ bộ nhớ | Tải ngầm revalidate |
| **Tháng chưa có dữ liệu** | 0 giao dịch | Lưới ô kem mờ viền nâu + *"Chưa có gì tháng này. Chụp thử món gần nhất."* + `NeoButton gold "Mở camera"` | Bấm → Tab Camera |
| **Mới cài, chưa đặt mục tiêu** | Chưa nhập thu nhập | Thẻ hiện *"Chưa đặt mục tiêu"* + *"Đặt mục tiêu để tính chính xác hơn"* | Chạm thẻ → modal mục tiêu |
| **Lỗi tải** | API lỗi/timeout | Banner nhỏ *"Không tải được. Thử lại."* | Giữ dữ liệu cache cũ |
| **Offline** | Mất mạng | Nhãn *"Chưa đồng bộ"* viền 3px trên đầu | Khoản offline có icon chờ sync |
| **Vượt ngân sách ngày** | `todaySpent > todayBudget` | **10 ô ĐỎ TOÀN BỘ** `#E0452B`, nền thẻ kem giữ nguyên; dòng: *"Hôm nay vượt X đ. Mai dàn đều nhé."* | **Heo buồn + đi chậm trong vườn**; không popup chặn |
| **Chế độ Ẩn tiền** | `isPrivacyHidden` | Mọi số tiền (kể cả thẻ hạn mức, Chi/Thu, jar) → `••••` | Ảnh hưởng tức thì cả app switcher |
| **Heo buồn (mới)** | `spent > budget` | Sprite `sad`, tốc độ 15 px/s, bubble "Ối, lố hạn mức rồi" 1 lần khi vừa vượt | Thoát trạng thái khi xóa khoản/sang ngày mới |

---

## 7. Tương Tác & Cử Chỉ (Interactions — GIỮ NGUYÊN v1.0 + vườn)

1. **Chuyển chế độ [ Tuần | Tháng ]:** giữ nguyên logic v1.0 (mặc định Tháng nếu có ≥1 ảnh; lưu lựa chọn). Chuyển mượt 180ms + `Haptics.selectionAsync()`.
2. **Thanh 10 Ô:** chuẩn WCAG giữ nguyên; neo style: ô trống nền kem sàn viền 2px ink; lố hạn mức toàn bộ đỏ.
3. **Lưới Lịch Ảnh Tháng:** giữ nguyên v1.0 (chạm ô → Day Detail Sheet; long-press ≥350ms → Quick Peek; vuốt ngang đổi tháng; khóa Pager khi vuốt trong lịch).
4. **Nút Cài Đặt:** nút tròn 44 viền 3px icon `Settings` (không bánh răng nổi màu xanh dương — giữ nguyên AC-1 v1.0).
5. **Khu vườn:** xem §4.3.
6. **Mọi nút Neo:** nhấn = dịch 2px + bóng còn 1px + `Haptics.ImpactFeedbackStyle.Light`.

---

## 8. Chuyển Động & Hoạt Họa (Motion)

- **Số lăn (RollingNumber):** 500ms `easeOutCubic`, `tabular-nums` — giữ nguyên.
- **Khối bật so le (Staggered Entrance):** trượt lên 30ms/khối, tổng ≤ 300ms — giữ nguyên.
- **Nhấn khối xúc giác:** 80ms, translate 2px, bóng 4px→1px + haptic — chuẩn neo (thay spec translate 3px của v1.0).
- **Heo:** máy trạng thái 60fps, dt ≤ 0.05s, đổi khung chân 0.2s; **reduce-motion** → đứng yên, chỉ phản hồi chạm.
- **Bubble thoại:** fade 150ms, hiện 1.5–2s.

---

## 9. Bảng Từ Ngữ Chuẩn Hóa (String Dictionary — GIỮ NGUYÊN v1.0 + bổ sung)

*100% chuỗi trong `src/constants/strings.ts`. Không đổi các khóa v1.0. Bổ sung:*

| Khóa Chuỗi | Chuỗi Hiển Thị | Vị Trí |
| :--- | :--- | :--- |
| `home.penButton` | `"Vào chuồng"` | Nút trong vườn |
| `home.feedButton` | `"Cho heo ăn"` | Nút gold (ghi nhanh) |
| `home.feedEmpty` | `"Hôm nay chưa có gì ăn hết, ghi một khoản đi nha"` | Thoại khi chưa có khoản |
| `garden.stateWalk` | `"đi dạo"` / `"ngủ"` / `"ăn cám"` / `"vui"` / `"buồn"` | Nhãn trạng thái |
| `garden.todDay` / `todDusk` / `todNight` | `"Nắng"` / `"Chiều"` / `"Đêm"` | Nhãn thời điểm |
| `garden.tapPig` / `tapPond` | `["Ủn ỉn!","Heo đây, heo đây!","Gãi bụng đi nè"]` / `"Ở đó có ao, heo không bơi đâu nha"` | Thoại chạm |
| `budget.overMoment` | `"Ối, lố hạn mức rồi"` | Bubble khi vừa vượt |

- Bộ 5 câu thoại theo mức chi: xem `STYLE_HEOCON.md` §6.1 (chuẩn giọng "heo/bạn", ≤ 70 ký tự, không mắng).

---

## 10. Khả Năng Tiếp Cận (A11y)

1. **VoiceOver/TalkBack:** ô ngày giữ nhãn v1.0; vườn: `aria-label "Khu vườn pixel có chú heo đang đi dạo. Chạm vào sân để heo chạy tới."`; thanh 10 ô: `role progressbar` + `accessibilityValue`.
2. **Tương phản:** theo bảng WCAG `STYLE_HEOCON.md` §3.4 (nâu mực trên kem AAA; nâu vôi đậm/dịu ≥ 5:1; xanh lá/đỏ cam là khối màu có viền 2px ink phân định).
3. **Vùng chạm:** mọi nút ≥ 44×44 (hitSlop).
4. **Chữ:** tối thiểu 12px cho nhãn (in đậm 800 + ls 0.16em), 13px+ cho nội dung phụ, số tiền 15–38px tabular.

---

## 11. Ngân Sách Hiệu Năng (Performance Budget)

- **Render từ cache ≤ 500ms**; 60fps khi cuộn dọc và lật tháng — giữ nguyên v1.0.
- **Vườn:** cập nhật vị trí heo qua `react-native-reanimated` shared values (UI thread); chỉ re-render sprite khi đổi pose/frame; canvas logic 176×132 → asset PNG 4× (~nén ≤ 40KB/lớp).
- **Thumbnail lịch:** WebP 160px ≤ 18KB/ảnh, `expo-image` disk cache — giữ nguyên.
- Không rò rỉ bộ nhớ khi lật 12 tháng hoặc chạy vườn ≥ 5 phút.

---

## 12. Sự Kiện Phân Tích (Analytics — không PII, không số tiền)

| Sự kiện | Thuộc tính | Mục đích |
|---|---|---|
| `home_viewed` | `view_mode`, `is_privacy_hidden` | Giữ nguyên v1.0 |
| `view_mode_changed` / `month_changed` / `day_opened` / `privacy_toggled` / `empty_cta_tapped` | giữ nguyên v1.0 | — |
| `garden_interacted` (mới) | `action ('tap_pig'|'tap_ground'|'tap_pond'|'feed'|'pen')` | Thói quen chơi với heo |
| `budget_over_moment` (mới) | `is_over (boolean)` | Tần suất vượt hạn mức (không kèm số tiền) |

---

## 13. Kế Hoạch Kiểm Thử (Test Plan)

### 13.1. Unit Tests (giữ nguyên v1.0 + bổ sung)
1. `currency.ts`, `budgetCalculations`, `calendarUtils`, greeting theo giờ — **giữ nguyên v1.0**.
2. **Mới — `src/utils/pixelGarden.ts` (pure functions):**
   - Máy trạng thái: `nextState(state, dt)` — idle→walk (68%), idle→sleep (14%), walk→idle khi tới điểm; khung chân đổi mỗi 0.2s.
   - **Heo không bao giờ vào ao** (mọi điểm trong elip (136,106,31,13) bị chặn; trượt mép khi chặn).
   - **Heo không bao giờ ra ngoài vùng đi được** (clamp 26–164 / 78–118).
   - `segmentsFor(spent, limit)`: `floor(spent/limit×10)` clamp 0–10; spent>limit → 10 ô đỏ.
   - `gardenMood(spent, limit)`: `'ok' | 'sad'`.
   - `speechFor(ratio)`: đúng 5 bucket §6.1.
3. **Mới — `DongMark`/format:** "đ" cỡ 60% + gạch chân 3px (snapshot style).

### 13.2. Kiểm Thử Thiết Bị Thật
- [ ] iPhone màn nhỏ (SE/mini): không tràn hàng thanh 10 ô, vườn 4:3 không méo.
- [ ] iPhone Pro Max: bố cục cân đối, lưới lịch đều.
- [ ] Tháng 2 (28/29 ngày), tháng bắt đầu Chủ Nhật — giữ nguyên v1.0.
- [ ] "Ẩn tiền" lưu trạng thái sau tắt/mở app.
- [ ] Vườn chạy ≥ 5 phút không nóng máy/lag; reduce-motion tôn trọng đúng.

---

## 14. Tiêu Chí Nghiệm Thu (Acceptance Criteria — Đo Được)

**Giữ nguyên v1.0 (AC-1 → AC-10):** biến mất nút bánh răng nổi; định dạng `45.000 đ`; thanh 10 ô đều 100% bề ngang; lưới 7 cột T2→CN đúng chồng ảnh/badge/hôm nay; Day Sheet khớp dữ liệu; Ẩn tiền `••••` bền vững; 7 trạng thái ma trận; ≤ 600ms mở từ cache, 60fps; unit tests 100% + `tsc --noEmit` 0 lỗi; ảnh chụp iPhone thật.

**Bổ sung v2.0 (Style Heo Con):**
11. [ ] **AC-11:** Toàn bộ bề mặt Home (Header, Vườn, Thẻ hạn mức, Chi/Thu, chips, sheet) dùng viền 3px `#2B2118`, bóng cứng blur 0, bo góc theo token — đúng `STYLE_HEOCON.md` §2 (khi theme = heocon).
12. [ ] **AC-12:** Khu vườn pixel hiển thị nét (nearest-neighbor), heo đi lại đúng máy trạng thái, không bao giờ vào ao/ngoài vùng đi được (có unit test chứng minh).
13. [ ] **AC-13:** Heo phản ứng đúng ngân sách: dưới hạn mức vui/bình thường; vượt → sad + đi chậm + toàn ô đỏ + bubble "Ối, lố hạn mức rồi".
14. [ ] **AC-14:** Số tiền 38px Baloo 2 tabular + "đ" 60% gạch chân; nhãn section viết hoa ls 0.16em; dấu tiếng Việt không cắt ở mọi cỡ.
15. [ ] **AC-15:** Mọi features v1.0 hoạt động nguyên bản sau re-skin (chạy lại checklist v1.0 100% pass).

---

## 15. Rủi Ro Kỹ Thuật & Giải Pháp

| Rủi Ro | Tác Động | Giải Pháp |
| :--- | :--- | :--- |
| Xung đột vuốt ngang lịch tháng vs Pager | Văng tab | Giữ nguyên cơ chế khóa PanResponder v1.0 |
| Giật lag cuộn nhiều ảnh | Đơ khung hình | `expo-image` + disk cache, thumb 160px WebP — giữ nguyên |
| Lệch múi giờ UTC | Chi đêm nhảy ngày | Chuẩn hóa `YYYY-MM-DD` theo `Asia/Ho_Chi_Minh` — giữ nguyên |
| **Bóng cứng không map được trên Android** (mới) | Bóng mờ/mất kiểu | Lớp bóng giả `NeoShadow` (§2.1 STYLE_HEOCON) — cấm dùng elevation riêng lẻ |
| **Heo re-render 60fps làm JS thread nghẽn** (mới) | Cuộn giật khi vườn chạy | Vị trí heo qua reanimated shared value; sprite Image tái sử dụng; dừng loop khi vườn ngoài viewport |
| **PNG pixel phóng bị mờ** (mới) | Mất chất pixel art | Sinh asset 4× nearest-neighbor sẵn; không dùng `resizeMode` stretch |