# 🌳 04 — HOME·GARDEN: KHUNG VƯỜN PIXEL & CHÚ HEO (screen-unit trung tâm)

> **Screen-unit:** khung cảnh 4:3 trên Home, dưới Header, trên Thẻ "Chi hôm nay" (thẻ đè mép đáy khung −22px).
> **Bám sát 100% code đồ họa:** toàn bộ hình ảnh/máy trạng thái port từ `01-PIXEL-GFX-PORT.md` và quy chuẩn không gian mở tại [`docs/PIXEL_OPEN_WORLD_SPEC.md`](../../PIXEL_OPEN_WORLD_SPEC.md) (§4.3: Khu vườn rộng `440×140` & Mặt tiền ngôi nhà) — file này chỉ đặc tả **vỏ khung + overlay + tương tác** trên màn Home.

## 1. Vỏ khung (CSS `.scene`)
```css
/* gốc */ .scene{position:relative;border:3px solid var(--ink);border-radius:28px;overflow:hidden;
         box-shadow:0 4px 0 var(--ink);background:#86B866;line-height:0}
.scene canvas{width:100%;height:auto;image-rendering:pixelated;cursor:pointer;touch-action:manipulation}
```
- RN: `NeoCard radius 28 + NeoShadow depth 4`; bên trong `Image garden-bg.png` (asset 4× = 704×528) `aspectRatio: 4/3`, `resizeMode:'stretch'` (asset đã phóng sẵn nên vẫn nét).

## 2. Overlay đè lên khung (CSS `.tr`/`.state`/`.bubble`/`.cam`)
| Vị trí | Phần tử | CSS gốc | Port RN |
|---|---|---|---|
| Trái-trên (`left:10;top:10`) | *(Đã gỡ bỏ cụm nút Vào nhà để khung hình thoáng đãng, tương tác trực tiếp qua cánh cửa)* | — | — |
| Phải-trên (`right:10;top:10`) | **Badge "Chuỗi N ngày / cám"** nền mực | `.cam{background:var(--ink);color:var(--screen);border:3px solid var(--ink);border-radius:999px;padding:6px 14px;font:800 13px}` | Badge display-only |
| Dưới-trái (`left:10;bottom:10`) | Nhãn trạng thái pill: `Nắng · sân · đi dạo` — **Tự động cập nhật theo đồng hồ thực tế** (không bấm đổi) | `.state{background:var(--card);border:3px solid var(--ink);border-radius:999px;padding:5px 12px;font:800 12px;cursor:default}` | Status pill display-only |
| Theo heo | `NeoBubble` thoại (đuôi kim cương, hiện 1.5–2s) | `.bubble` + `::after` | §2.9 NEO-KIT |

- Lưu ý: đồng xu vàng trong badge gốc (`.coin{14px;background:var(--gold);box-shadow:inset 0 0 0 2px #B97A14}`) chỉ giữ khi hiển thị phần thưởng — với badge Chuỗi thì thay icon `Flame`/`Calendar` vector kem.

## 3. Cảnh & heo (tham chiếu cứng vào 01-PIXEL-GFX-PORT.md)
- Lớp render: `bg` → Y-sort(`banana` 106, `stool` 86, `pig` theo pig.y) → `fg` → tint TOD → hiệu ứng đêm (đèn lồng, đom đóm) → cá bơi ao.
- Máy trạng thái: `pixelGarden.ts` port nguyên `update()` — 68% đi dạo / 14% ngủ / còn lại đứng; speed 24 (sad: 15) px/s; đổi khung 0.2s; dt ≤ 0.05.
- **Liên kết ngân sách:** `spent > budget` → sprite `sad` + slow 15 px/s + bubble "Ối, lố hạn mức rồi" 1 lần khi vừa vượt; về dưới hạn mức → trở lại `stand`.
- **Thưởng:** không có "cám"; cuối ngày dưới hạn mức tăng Streak + "Đã giữ lại X đ" (hiện trên Thẻ hạn mức & toast hiện có).
- **Mặt Tiền Nhà 2 Tầng Chuẩn Pixel (Khớp Cấu Trúc 6 Phòng & Template Noel):**
  - **Tầng 1 (`y: 26..50`):** Cửa chính gỗ đôi ở giữa (`x: 44..68, y: 26..50`) với đèn lồng đỏ phía trên; hai cánh cửa trượt mở khi kích hoạt vào nhà (`doorOpen > 0`). Cửa sổ phòng làm việc bên trái (`x: 8..38, y: 28..46`) viền gỗ, rèm xanh ngọc nhìn thấy bàn máy tính; cửa sổ phòng khách bên phải (`x: 74..104, y: 28..46`) nhìn thấy chiếc ghế sofa hồng đáng yêu.
  - **Dầm chia tầng & Ban công gỗ (`y: 24..28`):** Dầm gỗ ngang màu nâu phào chỉ, lan can con tiện.
  - **Tầng 2 (`y: 10..24`):** Tường gạch kem ngà (`#F2DFA8`, `#E2C984`), 2 cửa sổ lớn tầng 2 (`x: 12..40` và `x: 72..100`) chia 4-6 ô kính tỏa ánh sáng vàng ấm áp.
  - **Mái ngói trên đỉnh (`y: 0..10`):** Mái ngói đỏ gạch 2 tầng, ống khói nhỏ trên nóc (`x: 18..24, y: 0..3`).
  - **Cây Thông Noel & Dây Đèn Tròn Mái Hiên (Giáng Sinh & Đêm Lung Linh):**
    - Cây thông Noel 3 tầng tán lá xanh (`#2D5A27`, `#3E8139`), chậu gỗ mộc (`#B5603A`), đỉnh ngọn gắn ngôi sao vàng 5 cánh phát quang (`#F4B93B`, `#FFF08A`), thân đính hạt châu đỏ/vàng/trắng đặt trên hiên nhà (`x: 42..56, y: 34..56`).
    - Dây đèn tròn treo dọc viền mái hiên (`x: 8..106, y: 49..51`).
    - **Hiệu ứng ban đêm (`tod === 'night'`):** Toàn bộ 4 cửa sổ (2 cửa sổ tầng 1 + 2 cửa sổ tầng 2) bừng sáng ánh đèn vàng ấm áp (`rgba(255, 230, 100, 0.45)`), đèn lồng đỏ tỏa sáng rực rỡ, cùng ánh hào quang của ngôi sao Noel và dây đèn tròn.
    - **Tự động chuyển đổi cảnh trời theo thời gian thực:** Bắt theo đồng hồ điện thoại (`06h-16h: day`, `16h-18h: dusk`, `18h-06h: night`).

## 4. Tương tác (port `pointerdown` 1:1 & mở rộng đồ chơi tương tác)
1. Chạm heo (hit-box x±13, y−22→+3): `happy` 1.2s + thoại ngẫu nhiên ["Ủn ỉn!","Heo đây, heo đây!","Gãi bụng đi nè"] + `Haptics.Light`.
2. Chạm ao (blocked): "Ở đó có ao, heo không bơi đâu nha".
3. Chạm sân: heo chạy tới (clamp vùng đi được, né ao trượt mép).
4. **Chạm Cửa Chính Nhà:** Cửa chính mở trượt sang 2 bên (`doorOpen = 1`), chú heo chạy lại trước cửa, reo *"Vào nhà thôi! 🏠"* $\to$ Tự động kích hoạt chuyển hướng sang **Tab 1: Nhà Heo** (chạm trực tiếp vào cánh cửa nhà `x: 44..74, y: 34..64`).
5. **Cây táo & Chu trình ăn táo vô hạn:** Bấm vào vòm cây táo (`x: 108..176, y <= 66`) $\to$ 3 quả táo rụng xuống bãi cỏ $\to$ heo chạy lại ăn ngon miệng $\to$ táo biến mất tuần tự theo từng nhịp nhai (800ms: quả 1, 1600ms: quả 2, 2400ms: quả 3, 3200ms: dọn sạch và heo vui mừng bắn tim `happy`) $\to$ cho phép bấm lại cây táo để bắt đầu chu trình mới lặp lại vô hạn.
6. **Cây thông Noel trên hiên:** Bấm vào cây thông $\to$ bung sao lấp lánh $\to$ heo chạy lại reo: *"Giáng Sinh an lành nha! 🎄✨"*.
7. **Khắc phục lỗi biến dạng & lỗi cỏ đè heo (Quyết định 123):** Reset ma trận vẽ `ctx.setTransform(1, 0, 0, 1, 0, 0)` và `clearRect` trước mỗi frame; đưa layer cỏ foreground `fg` vào chu trình sắp xếp độ sâu `Y-sorting` theo `pig.y` để heo luôn nổi trên bề mặt cỏ khi ngủ.

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