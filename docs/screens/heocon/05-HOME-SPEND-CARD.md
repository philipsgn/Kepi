# 💰 05 — HOME·SPEND-CARD: THẺ "CHI HÔM NAY" (đè mép vườn −22px)

> **Screen-unit:** thẻ hero của Home, đè lên đáy khung vườn. **Toàn bộ số liệu lấy từ `budgetStore` hiện có — 0 hardcode (QĐ 48).**
> **Bám sát:** CSS `.spend`/`.label`/`.row`/`.amount`/`.left`/`.segs`/`.dash`/`.talk` + logic `render()`/`message()` của prototype.

## 1. Bố cục 1:1 (CSS gốc kèm chú thích)
```css
.spend{margin:-22px 8px 0;border:3px solid var(--ink);border-radius:26px;padding:16px 18px 14px;
       background:var(--card);box-shadow:0 4px 0 var(--ink);z-index:2}     /* → NeoCard overlap */
.label{font:800 12px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
.row{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;margin-top:6px}
.amount{font:800 38px/1 Baloo;font-variant-numeric:tabular-nums}
.amount .d{font-size:.6em;margin-left:.2em;text-decoration:underline 3px offset 3px}   /* → DongMark */
.left{text-align:right;font:700 12px/1.3 Nunito;color:var(--muted)}
.left b{display:block;font:800 18px/1.2 Baloo;color:var(--ink);font-variant-numeric:tabular-nums}
.left b.over{color:var(--red)}                                          /* lố → Đỏ Cam #E0452B */
```

## 2. Nội dung & logic (port hàm `render()` 1:1, thay LIMIT = `todayBudget`)
| Vị trí | Nội dung | Logic gốc |
|---|---|---|
| Overline | `CHI HÔM NAY` | `.label` |
| Trái | **Số tiền đã chi hôm nay** 38 Baloo 800 tabular + "đ" gạch chân | `$('amount')=fmt(spent)+'đ'` |
| Phải dòng 1 | `còn lại trên hạn mức` (12 muted) / `vượt hạn mức` khi lố | `over?'vượt hạn mức':'còn lại trên 300k đ'` |
| Phải dòng 2 | Số còn lại 18 Baloo (đỏ khi lố, có dấu `+` khi âm) | `(over?'+'+fmt(spent−limit):fmt(limit−spent))+' đ'` |
| Giữa | `SegmentBar10` variant neo | `on=min(10,floor(spent/limit*10)); lố → toàn ô đỏ` |
| Ngăn | `DashedDivider` 2px `#D9C9A4` | `.dash` |
| Đáy | **Hàng heo mini (`PixelPigAvatar` 24px) + Động cơ Lời khuyên Ngộ nghĩnh (`pigAdviceEngine`)** | `.talk` + `getPigContextualAdvice()` |

- **Động cơ Lời khuyên Ngộ nghĩnh (`getPigContextualAdvice`):**
  - Đầy đủ 5 bucket hạn mức kết hợp yếu tố thời gian trong ngày (sáng, trưa, xế chiều, đêm muộn) và chuỗi streak:
  - `0` → "Chưa chi đồng nào. Heo đang ngủ gật, đừng đánh thức nha." (hoặc chào buổi sáng pha cà phê, hoặc khen giữ ví 0đ).
  - `<.4` → "Chi nhẹ nhàng ghê. Heo ủn ỉn khen một cái."
  - `<.75` → "Đang vừa vặn lắm. Tránh bẫy trà sữa xế chiều là cuối tháng no đủ nha!"
  - `≤1` → "Gần chạm nóc rồi đó! Tối nay ăn cơm nhà cho heo an lòng nha."
  - `>1` → "Étt o étt! Lố hạn mức rồi... Heo hơi xót ví, mai mình nhịn ăn vặt bù lại nha!"
  - `Đêm muộn (23h-05h)` → "Khuya rồi, đừng lướt săn sale nha, heo đi ngủ đây khò khò..." (`mood: sleep`).
- `PixelPigAvatar 24px`: Tự động thay đổi biểu cảm (`happy` khi < 75%, `idle`/`blink` khi 75-100%, `sad` khi > 100%, `sleep` khi đêm muộn).
- **Dữ liệu nguồn (giữ nguyên v1.0):** `todaySpent`, `todayBudget`, `savedMoney`, số ngày còn lại (`getDaysRemainingInMonth`), trạng thái "Chưa đặt mục tiêu" + hint khi thiếu thu nhập. Chế độ Ẩn tiền → mọi số thành `••••` (giữ `maskMoney`).
- Số lăn `RollingNumber` 500ms giữ nguyên; font đổi sang Baloo 2 + `tabular-nums`.

## 3. Tương tác
- Chạm thẻ (trừ vùng thoại): mở sheet chỉnh ngân sách/mục tiêu hiện có.
- Khi vừa vượt hạn mức (boundary-cross theo `budgetStore`): bubble trên vườn "Ối, lố hạn mức rồi" 2s + heo sad — một nguồn sự thật duy nhất từ `gardenMood()`.

## AC
- [ ] Thẻ đè mép vườn đúng −22px, `marginHorizontal 8`, bóng 0 4 0.
- [ ] Số tiền 38px tabular; "đ" 60% + gạch 3px; lố → số phải đỏ + dấu +.
- [ ] 10 ô: trống = kem sàn viền 2px; đầy = xanh `#5E9A57`; lố = TOÀN BỘ đỏ `#E0452B`.
- [ ] Thoại đổi theo 5 bucket; heo mini sad đúng lúc lố.
- [ ] Ẩn tiền che toàn bộ; không hardcode bất kỳ con số nào trong file.