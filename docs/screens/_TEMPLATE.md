# 📋 KHUÔN ĐẶC TẢ MÀN HÌNH (SCREEN SPECIFICATION TEMPLATE)

> **Mã màn hình:** [SCREEN_CODE] (Ví dụ: `HOME`, `CAMERA`, `DETAIL`...)  
> **Tên màn hình:** [Tên tiếng Việt đời thường]  
> **Trạng thái:** [Draft | Approved | Implementing | Done]  
> **Phiên bản:** 1.0  
> **Lần cập nhật cuối:** [YYYY-MM-DD]  

---

## 1. Mục Tiêu & Người Dùng
- **User Story:** Là một [đối tượng người dùng: sinh viên / người đi làm], tôi muốn [hành động chính trên màn hình] để [lợi ích / kết quả đạt được].
- **Mục tiêu sản phẩm:** [Giải quyết bài toán gì, mang lại cảm xúc gì cho người dùng].
- **Tiêu chí thành công đo được (Success Metrics):**
  1. [Chỉ số 1: Tỷ lệ hoàn thành hành động chính ≥ X%]
  2. [Chỉ số 2: Thời gian thao tác trung bình ≤ Y giây]
  3. [Chỉ số 3: Tỷ lệ lỗi / drop-off ≤ Z%]

---

## 2. Wireframe Chữ (ASCII Wireframe)

### 2.1. Trạng Thái Chính (Default State)
```text
┌──────────────────────────────────────────────┐
│ [Thành phần 1]                [Thành phần 2] │
│                                              │
│ ┌ Khối chính ──────────────────────────────┐ │
│ │ Nội dung...                              │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ┌ Danh sách / Lưới ────────────────────────┐ │
│ │ [Mục 1]   [Mục 2]   [Mục 3]              │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

### 2.2. Trạng Thái Rỗng (Empty State)
```text
┌──────────────────────────────────────────────┐
│                                              │
│                 [Biểu tượng]                 │
│               [Dòng thông báo]               │
│              [Nút hành động CTA]             │
│                                              │
└──────────────────────────────────────────────┘
```

### 2.3. Trạng Thái Đang Tải / Lỗi (Loading / Error State)
```text
┌──────────────────────────────────────────────┐
│ [Khung xương Skeleton]                       │
│                                              │
│ [Thông báo lỗi + Nút Thử lại nếu có sự cố]   │
└──────────────────────────────────────────────┘
```

---

## 3. Cây Component & Props (Component Hierarchy)

```text
<ScreenContainer>
  ├── <ScreenHeader>
  │     ├── <TitleBlock>
  │     └── <HeaderActions>
  ├── <HeroCard>
  │     └── <InnerMetrics>
  └── <ContentSection>
        ├── <FilterChips>
        └── <DataViewGrid / DataList>
```

### Bảng Chi Tiết Props:
| Component | File Nguồn | Props Chính | Mô Tả |
| :--- | :--- | :--- | :--- |
| `ScreenContainer` | `src/components/common/Block.tsx` | `children, style` | Khung nền màn hình chuẩn dark mode |
| `[Component]` | `[Đường dẫn]` | `[Tên prop: kiểu]` | [Mục đích sử dụng] |

---

## 4. Hợp Đồng Dữ Liệu (Data Contract)
- **Nguồn dữ liệu:** [Zustand Store / Supabase Table / Local Cache]
- **Kiểu TypeScript:**
```typescript
export interface ScreenDataModel {
  id: string;
  // Các trường dữ liệu chính...
}
```
- **Chiến lược Cache & Offline:**
  - Đọc từ bộ nhớ đệm cục bộ (AsyncStorage/Memory) trước.
  - Tải ngầm và làm mới nền (stale-while-revalidate).
  - Ghi offline: Lưu cục bộ kèm cờ `PENDING_SYNC`.
  - Giải quyết xung đột: Ghi sau thắng (Last-Write-Wins - LWW) dựa trên `updated_at`.

---

## 5. Ma Trận Trạng Thái (State Matrix)

| Trạng Thái | Điều Kiện Kích Hoạt | Giao Diện Hiển Thị | Hành Vi Người Dùng |
| :--- | :--- | :--- | :--- |
| **Đang tải lần đầu** | Cache trống, đang fetch mạng | Khung xương (Skeleton) dạng khối | Khóa chạm các vùng chưa sẵn sàng |
| **Có cache** | Có dữ liệu cục bộ | Hiển thị ngay lập tức, fetch ngầm | Thao tác bình thường không nhấp nháy |
| **Rỗng (Empty)** | Số lượng phần tử = 0 | Biểu tượng lá/sổ + Dòng chữ bạn bè + Nút CTA | Bấm nút chuyển sang hành động tiếp |
| **Ít dữ liệu** | 1 - 3 phần tử | Hiển thị vừa vặn, không kéo dãn | Cuộn tự nhiên |
| **Nhiều dữ liệu** | > 100 phần tử | Danh sách/Lưới ảo hóa (FlatList/FlashList) | Cuộn mượt 60fps |
| **Lỗi (Error)** | Mất mạng hoặc API lỗi | Khối thông báo lỗi + Nút "Thử lại" | Giữ cache cũ nếu có |
| **Offline** | Mất kết nối Internet | Nhãn nhỏ "Chưa đồng bộ" | Ghi nhận tạm, đẩy vào hàng đợi |
| **Từ chối quyền** | Không cấp quyền cần thiết | Khối giải thích lý do + Nút mở Cài đặt | Điều hướng sang Cài đặt hệ thống |

---

## 6. Tương Tác & Cử Chỉ (Interactions & Gestures)
- **Chạm (Tap):** [Phản hồi rung Haptic, mở chi tiết / kích hoạt]
- **Giữ (Long Press):** [Xem trước nhanh (Peek) / menu ngữ cảnh]
- **Vuốt (Swipe):** [Chuyển trang ngang / chuyển tháng]
- **Cuộn (Scroll):** [Cuộn dọc, header sticky / ẩn mờ]
- **Xử lý xung đột cử chỉ (Gesture Conflict Resolution):**
  - [Ví dụ: Vuốt ngang trên lưới lịch không làm kích hoạt pager chuyển tab cha].

---

## 7. Chuyển Động & Hoạt Họa (Motion & Animation)
- **Số lăn (Counting Numbers):** 500ms, easing ease-out cubic.
- **Khối bật so le (Staggered Appearance):** 30ms giữa các khối, tối đa 400ms.
- **Nhấn khối (Press Sink):** 80ms dịch chuyển `{ translateX: 3, translateY: 3 }`, bóng giảm về 1px.
- **Chuyển cảnh (Slide/Transition):** 220ms spring easing.
- **Hỗ trợ Giảm chuyển động (Reduce Motion):** Tự động tắt trượt/nhảy, chuyển sang mờ dần (Fade) 150ms.

---

## 8. Bảng Từ Ngữ (String Dictionary)
*Mọi chuỗi hiển thị bắt buộc nằm trong `src/constants/strings.ts`. Tuyệt đối không hard-code.*

| Khóa Chuỗi | Giá Trị Tiếng Việt Hiển Thị | Ngữ Cảnh Sử Dụng |
| :--- | :--- | :--- |
| `screen.title` | `"..."` | Tiêu đề chính màn hình |
| `screen.empty` | `"..."` | Dòng mô tả khi chưa có dữ liệu |

---

## 9. Khả Năng Tiếp Cận (Accessibility — A11y)
- **VoiceOver / TalkBack:** Mọi phần tử tương tác đều có `accessibilityLabel` và `accessibilityRole`.
- **Hỗ trợ Cỡ Chữ Lớn (Dynamic Type):** Bố cục co giãn, không bị cắt chữ khi người dùng bật chữ to.
- **Độ Tương Phản Màu:** Đạt chuẩn WCAG AA (tối thiểu 4.5:1 cho văn bản thường, 3:1 cho đồ họa). Chữ trên nền vàng `#FFC800` luôn là đen tuyền `#000000` (đạt 13.5:1).
- **Quy Chuẩn Icon Toàn App:** 100% Vector Icons nổi trần không viền bo (`borderWidth: 0, backgroundColor: 'transparent'`), cấm dùng khung bo tròn/vuông bọc ngoài, in đậm nét `strokeWidth: 2.4 - 2.8` để nổi bật sắc nét.
- **Vùng Chạm (Touch Target):** Tối thiểu `44px x 44px` thông qua `hitSlop`.


---

## 10. Ngân Sách Hiệu Năng (Performance Budget)
- **Thời gian vẽ nội dung đầu (FCP/TTI):** ≤ 600ms từ cache.
- **Tốc độ khung hình (Frame Rate):** 60fps ổn định khi cuộn.
- **Mức tiêu thụ bộ nhớ (RAM):** Ổn định, không tăng lũy kế khi lật qua lại các tháng/trang.
- **Kích thước gói tài nguyên ảnh:** Thumbnail nén ≤ 30KB/ảnh.

---

## 11. Sự Kiện Phân Tích (Analytics Events)
*Không gửi thông tin nhạy cảm, số tiền thực hay mô tả cá nhân.*

| Tên Sự Kiện | Thuộc Tính Gửi Kèm | Mục Đích |
| :--- | :--- | :--- |
| `[screen]_viewed` | `view_mode, date` | Đo tần suất mở màn hình |
| `[action]_tapped` | `filter_category, status` | Đo mức độ tương tác tính năng |

---

## 12. Kế Hoạch Kiểm Thử (Test Plan)
- **Unit Tests:** Kiểm thử các hàm tính toán, định dạng tiền, xử lý múi giờ, phân loại ngân sách.
- **Component Tests:** Kiểm thử render các trạng thái (loading, empty, error, privacy hidden).
- **Manual Checklist (Thiết bị thật):** Màn nhỏ (SE), màn lớn (Pro Max), mạng yếu, offline, chế độ sáng/tối.

---

## 13. Tiêu Chí Nghiệm Thu (Acceptance Criteria — Đo Được)
1. [x] [Tiêu chí 1: Không còn lỗi giao diện X...]
2. [x] [Tiêu chí 2: Tính năng Y hoạt động đúng với dữ liệu Z...]
3. [x] [Tiêu chí 3: Chạy mượt trên máy thật đạt 60fps...]

---

## 14. Rủi Ro & Câu Hỏi Mở
- **Rủi ro kỹ thuật:** [Ví dụ: Xung đột vuốt ngang lịch và pager].
- **Giải pháp giảm thiểu:** [Khóa cuộn ngang của pager khi ngón tay đang chạm trong vùng lịch].
