# 🌳 04 — HOME·GARDEN: KHUNG VƯỜN PIXEL & CHÚ HEO (screen-unit trung tâm)

> **Screen-unit:** khung cảnh 4:3 trên Home, dưới Header, trên Thẻ "Chi hôm nay" (thẻ đè mép đáy khung −22px).
> **Bám sát 100% code đồ họa:** toàn bộ hình ảnh/máy trạng thái port từ `01-PIXEL-GFX-PORT.md` — file này chỉ đặc tả **vỏ khung + overlay + tương tác** trên màn Home.

## 1. Vỏ khung (CSS `.scene`)
```css
/* gốc */ .scene{position:relative;border:3px solid var(--ink);border-radius:28px;overflow:hidden;
         box-shadow:0 4px 0 var(--ink);background:#86B866;line-height:0}
.scene canvas{width:100%;height:auto;image-rendering:pixelated;cursor:pointer;touch-action:manipulation}
```
- RN: `NeoCard radius 28 + NeoShadow depth 4`; bên trong `Image garden-bg.png` (asset 4× = 704×528) `aspectRatio: 4/3`, `resizeMode:'stretch'` (asset đã phóng sẵn nên vẫn nét).

## 2. Overlay đè lên khung (CSS `.tl`/`.tr`/`.state`/`.bubble`/`.cam`)
| Vị trí | Phần tử | CSS gốc | Port RN |
|---|---|---|---|
| Trái-trên (`left:10;top:10`, gap 8) | Nút tròn "vào chuồng" (icon giấc ngủ `Moon`) + nút pill "Vào chuồng" | `.tl` + `.btn.round` + `.btn` | `NeoButton round` + `NeoButton` cream |
| Phải-trên (`right:10;top:10`) | **Badge "Chuỗi N ngày"** nền mực (thay "24 cám" — không thêm economy) | `.cam{background:var(--ink);color:var(--screen);border:3px solid var(--ink);border-radius:999px;padding:6px 14px;font:800 14px Nunito}` | `NeoButton dark` dạng display-only |
| Dưới-trái (`left:10;bottom:34`) | Nhãn trạng thái pill: `Nắng · sân · đi dạo` — **chạm để đổi thời điểm** (demo) | `.state{background:var(--card);border:3px solid var(--ink);border-radius:999px;padding:5px 12px;font:800 12px}` | `NeoButton` mini (height auto) |
| Theo heo | `NeoBubble` thoại (đuôi kim cương, hiện 1.5–2s) | `.bubble` + `::after` | §2.9 NEO-KIT |

- Lưu ý: đồng xu vàng trong badge gốc (`.coin{14px;background:var(--gold);box-shadow:inset 0 0 0 2px #B97A14}`) chỉ giữ khi hiển thị phần thưởng — với badge Chuỗi thì thay icon `Flame`/`Calendar` vector kem.

## 3. Cảnh & heo (tham chiếu cứng vào 01-PIXEL-GFX-PORT.md)
- Lớp render: `bg` → Y-sort(`banana` 106, `stool` 86, `pig` theo pig.y) → `fg` → tint TOD → hiệu ứng đêm (đèn lồng, đom đóm) → cá bơi ao.
- Máy trạng thái: `pixelGarden.ts` port nguyên `update()` — 68% đi dạo / 14% ngủ / còn lại đứng; speed 24 (sad: 15) px/s; đổi khung 0.2s; dt ≤ 0.05.
- **Liên kết ngân sách:** `spent > budget` → sprite `sad` + slow 15 px/s + bubble "Ối, lố hạn mức rồi" 1 lần khi vừa vượt; về dưới hạn mức → trở lại `stand`.
- **Thưởng:** không có "cám"; cuối ngày dưới hạn mức tăng Streak + "Đã giữ lại X đ" (hiện trên Thẻ hạn mức & toast hiện có).

## 4. Tương tác (port `pointerdown` 1:1)
1. Chạm heo (hit-box x±13, y−22→+3): `happy` 1.2s + thoại ngẫu nhiên ["Ủn ỉn!","Heo đây, heo đây!","Gãi bụng đi nè"] + `Haptics.Light`.
2. Chạm ao (blocked): "Ở đó có ao, heo không bơi đâu nha".
3. Chạm sân: heo chạy tới (clamp vùng đi được, né ao trượt mép).
4. "Vào chuồng": `sleep` 8s + "Heo vào chuồng ngủ đây".
5. **Khóa cuộn:** `onStartShouldSetPanResponder` trả true trong khung → ScrollView cha không cuộn (giống lịch tháng v1.0).

## 5. Props & hiệu năng
- Props: `spentToday`, `todayBudget`, `streakDays`, `onLogExpense()`, `reducedMotion` (từ `AccessibilityInfo.isReduceMotionEnabled`).
- Vị trí heo qua `useSharedValue` (UI thread); pose/frame state đổi mới re-render sprite `Image`.
- Vườn ngoài viewport (cuộn xa) → pause loop.
- Reduce motion: heo KHÔNG tự đi (nhánh `reduced`), vẫn phản hồi chạm; tint đêm không nhấp nháy đom đóm.

## AC
- [ ] Mở prototype HTML và app cạnh nhau: cảnh vườn, vị trí nhà/ao/chuối/ghế/bát cám, dáng heo GIỐNG HỆT (cùng seed mulberry32).
- [ ] Unit test: không vào ao / không ra ngoài vùng đi được / 10 ô đỏ khi lố / sad + slow khi lố.
- [ ] Tap target mọi nút overlay ≥ 44×44; nhãn trạng thái đổi khi chạm (demo TOD).
- [ ] 60fps cuộn Home trong khi vườn chạy; không nóng máy sau 5 phút.