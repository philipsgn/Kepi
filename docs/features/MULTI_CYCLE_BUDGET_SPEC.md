# ĐẶC TẢ KỸ THUẬT: NGÂN SÁCH ĐA CHU KỲ & ROLLOVER SỐ DƯ TỰ ĐỘNG (MULTI_CYCLE_BUDGET_SPEC.MD)

> **Dự án:** Kepi (Ví Locket)  
> **Phiên bản:** 1.0 (Milestone M2.2)  
> **Trạng thái:** Triển khai chính thức

---

## 1. Triết Lý Nghiệp Vụ (Core Philosophy)
1. **Khoa học & Không áp lực:** Ngân sách ngày là con số lõi được tính toán khoa học từ:
   $$\text{Khả dụng còn lại} = \text{Số dư khả dụng tháng} - \text{Chi phí cố định} - \text{Mục tiêu tiết kiệm}$$
   $$\text{Ngân sách hôm nay} = \frac{\text{Khả dụng còn lại}}{\text{Số ngày còn lại trong tháng}}$$
2. **Dynamic Smoothing (Tái phân bổ mềm):** Nếu người dùng chi tiêu nhiều hơn hôm nay, số tiền của những ngày còn lại sẽ tự động thắt lại vừa phải mà không tạo áp lực số âm hay phạt tâm lý.
3. **Running Balance Rollover (Dòng tiền liên tục):** Số tiền còn lại sau Thu/Chi tháng trước tự động trở thành số tiền của tháng sau. Khi sang chu kỳ tháng mới, hệ thống tự động lưu snapshot tháng cũ, chuyển giao 100% số dư thực tế, và thông báo nhẹ nhàng qua Banner chào tháng mới.
4. **Tối giản Tab Sổ (Home):** Toàn bộ cấu hình thu nhập, chi phí cố định và mục tiêu dài hạn nằm trong Tab Hồ Sơ (Profile). Tab Sổ chỉ hiển thị kết quả và chỉ số tuần.

---

## 2. Công Thức & Thuật Toán (Mathematical Specification)

### A. Tính toán số ngày còn lại trong tháng
```typescript
function getDaysRemainingInMonth(date: Date = new Date()): number {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed
  const totalDays = new Date(year, month + 1, 0).getDate();
  const currentDay = date.getDate();
  // Bao gồm cả ngày hôm nay
  return Math.max(1, totalDays - currentDay + 1);
}
```

### B. Dynamic Daily Budget
```typescript
function calculateDynamicDailyBudget(
  discretionaryRemaining: number,
  daysRemaining: number
): number {
  if (daysRemaining <= 0) return 0;
  if (discretionaryRemaining <= 0) return 0;
  return Math.round(discretionaryRemaining / daysRemaining);
}
```

### C. Ngân Sách Tuần (Weekly Budget Stats)
Tuần được tính từ Thứ Hai đến Chủ Nhật.
```typescript
function calculateWeeklyBudgetStats(
  dailyBudget: number,
  daysInWeek: number = 7,
  spentThisWeek: number = 0
): { weeklyLimit: number; weeklyRemaining: number; weeklySpentPercent: number } {
  const weeklyLimit = dailyBudget * daysInWeek;
  const weeklyRemaining = weeklyLimit - spentThisWeek;
  const weeklySpentPercent = weeklyLimit > 0 
    ? Math.min(100, Math.max(0, Math.round((spentThisWeek / weeklyLimit) * 100))) 
    : 0;
  return { weeklyLimit, weeklyRemaining, weeklySpentPercent };
}
```

---

## 3. Quy Trình Chuyển Kỳ Tháng (Month-End Transition Lifecycle)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Khởi động app / Quay lại từ Background                   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Kiểm tra chu kỳ tháng: currentMonth !== lastActiveMonth?  │
└──────────────┬────────────────────────────────┬─────────────┘
               │                                │
          ĐÚNG │                                │ SAI
               ▼                                ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│ 3. Chuyển kỳ tự động:        │ │ Duy trì chu kỳ hiện tại:   │
│ - Lưu snapshot tháng cũ      │ │ - Tính lại Dynamic Daily   │
│ - Chuyển 100% số dư thực tế  │ │ - Cập nhật số ngày còn lại │
│ - Đặt lastActiveMonth mới    │ └────────────────────────────┘
│ - Hiển thị Banner Chào Tháng │
└──────────────────────────────┘
```

---

## 4. Giao Diện & Trải Nghiệm Người Dùng (UI/UX)
1. **Banner Chào Tháng Mới (`MonthRolloverBanner.tsx`):**
   - Vị trí: Đỉnh danh sách Tab Sổ (Home).
   - Nội dung: "Chào tháng [MM]! Số dư [XXX.XXX đ] từ tháng trước đã được chuyển tiếp trọn vẹn".
   - Nút tắt: `X` với Haptic feedback nhẹ nhàng.
2. **Thẻ Ngân Sách Mùa Thu (`AutumnBudgetCard.tsx`):**
   - Chỉ số chính: Hạn mức khuyên dùng hôm nay (`calculateDynamicDailyBudget`).
   - Chỉ số phụ: "Tuần này còn [XXX.XXX đ]" kèm thanh tiến độ tuần.
3. **Tab Thống Kê (`StatsView.tsx`):**
   - Phân đoạn xem báo cáo: `[Tuần này]` vs `[Tháng này]`.
