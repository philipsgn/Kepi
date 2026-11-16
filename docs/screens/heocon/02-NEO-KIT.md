# 🧱 02 — NEO-KIT: BỘ COMPONENT NỀN TẢNG (src/components/neo/)

> **Nguồn giá trị:** CSS gốc `prototype/Ví Heo Con.html` (mỗi component kèm selector gốc). Đặc tả tổng quát: `STYLE_HEOCON.md` §5. Screen nào cũng chỉ được dựng từ kit này.
> **Quy tắc:** component đọc `useTheme()` — khi theme pink/mint vẫn giữ HÌNH neo (viền 3px, bóng cứng) nhưng tô màu theo token theme đó.

## 2.1. `NeoShadow` — lớp bóng cứng (BẮT BUỘC, dùng chung toàn app)
- CSS gốc: `box-shadow:0 4px 0 var(--ink)` / `0 3px 0 var(--ink)`.
- iOS: `shadowColor ink, shadowOffset {0,3|4}, shadowRadius 0, shadowOpacity 1`.
- Android: **View giả** nền ink, cùng borderRadius, `position:absolute`, `top:+3|4`, render trước bề mặt chính trong container.
- Props: `depth: 3 | 4`, `radius`, `color = tokens.border`.
- ❌ Cấm tự viết box-shadow riêng ở bất kỳ screen nào.

## 2.2. `NeoCard` (CSS `.spend`, `.jar`, `.scene`)
```css
/* gốc */ border:3px solid var(--ink); border-radius:26~28px; background:var(--card); box-shadow:0 4px 0 var(--ink);
```
- Props: `radius: 26|28|20`, `overlap` (`marginTop:-22, marginHorizontal:8, zIndex:2` — đúng `.spend`), `isPressable` (nhấn: translateY 2 + bóng còn 1px + haptic Light).

## 2.3. `NeoButton` (CSS `.btn` + biến thể)
```css
/* gốc */ font:800 14px Nunito; border:3px solid var(--ink); border-radius:999px; padding:8px 14px;
         box-shadow:0 3px 0 var(--ink); active: translateY(2px) + box-shadow 0 1px 0;
/* .btn.dark{background:var(--ink);color:var(--screen)} .btn.gold{background:var(--gold)} .btn.round{width:44px;height:44px} */
```
- Variants: `cream` (surface/ink) · `dark` (ink/kem sàn) · `gold` (Vàng Cám/ink) · `round` (44×44, icon center).
- `disabled`: `opacity:.5` (`.btn[aria-disabled]`), không haptic. Icon vector `lucide` 14–22px stroke 2.2–2.8.

## 2.4. `NeoChip` — chip ghi nhanh 2 dòng (CSS `.chip`)
```css
/* gốc */ .chip{display:flex;flex-direction:column;padding:7px 14px;border-radius:18px}
         .chip small{font-weight:700;color:var(--muted);font-size:12px}
```
- Dòng 1 tên (14 Nunito 800 ink), dòng 2 giá (12 Nunito 700 muted). Viền 3px + bóng `0 3 0` (kế thừa `.btn`).

## 2.5. `SegmentBar10` — thanh 10 ô (CSS `.segs`/`.seg`)
```css
/* gốc */ .segs{display:grid;grid-template-columns:repeat(10,1fr);gap:5px}
         .seg{height:20px;border:2px solid var(--ink);border-radius:8px;background:var(--screen)}
         .seg.on{background:var(--green)} .seg.over{background:var(--red)}
```
- Logic: ô đầy = `floor(spent/limit*10)` clamp 0–10; **lố hạn mức → TOÀN BỘ 10 ô đỏ**; `role="progressbar"` + `accessibilityValue`.

## 2.6. `OverlineLabel` (CSS `.label`)
```css
/* gốc */ .label{font:800 12px Nunito;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
```

## 2.7. `DashedDivider` (CSS `.dash`)
```css
/* gốc */ .dash{border-top:2px dashed var(--line)}   /* --line:#D9C9A4 */
```
- RN: `react-native-svg` `<Line strokeDasharray>` hoặc dải View; màu `#D9C9A4` (token `line`).

## 2.8. `NeoAvatar` (CSS `.avatar` + `drawFace`)
```css
/* gốc */ .avatar{width:56px;height:56px;border:3px solid var(--ink);border-radius:50%;
         background:#FCE3E8;box-shadow:0 3px 0 var(--ink)} .avatar canvas{width:48px;height:48px;image-rendering:pixelated}
```
- Bên trong: mặt heo pixel 16×16 (khung `face_16` từ `01-PIXEL-GFX-PORT.md` §5).

## 2.9. `NeoBubble` — bong bóng thoại (CSS `.bubble`)
```css
/* gốc */ .bubble{background:var(--card);border:3px solid var(--ink);border-radius:14px;padding:4px 10px;
         font:800 13px Nunito; white-space:nowrap}
.bubble::after{ /* đuôi */ width:10px;height:10px;background:var(--card);
         border-right:3px solid var(--ink);border-bottom:3px solid var(--ink);transform:rotate(45deg)}
.bubble{opacity:0;transition:opacity .15s} .bubble.on{opacity:1}
```
- `role="status"`, `aria-live="polite"`; hiện 1.5–2s; vị trí clamp 22–78% bề ngang theo tọa độ heo.

## 2.10. `NeoJar` (CSS `.jar`) — thẻ Hũ
```css
/* gốc */ .jar{border:3px solid var(--ink);border-radius:20px;background:var(--card);padding:10px;
         box-shadow:0 3px 0 var(--ink);display:flex;flex-direction:column;gap:4px;font-size:13px}
.jar i{width:30px;height:30px;border-radius:9px;border:2px solid var(--ink);display:grid;place-items:center}
.jar b{font:800 16px Baloo;font-variant-numeric:tabular-nums}
```
- Icon khối 30×30 bo 9 nền pastel đặc + icon `lucide` 16px stroke 2.4 ink (Ngoại lệ Boxless chủ ý của style heocon).

## 2.11. `NeoInput` (Plan 1)
- `border:3px ink`, `radius:14`, nền surface, chữ 15 Nunito 600, focus nền `primarySoft`.

## 2.12. `DongMark` — ký hiệu "đ" (CSS `.amount .d`)
```css
/* gốc */ .amount .d{font-size:.6em;margin-left:.2em;text-decoration:underline;
         text-decoration-thickness:3px;text-underline-offset:3px}
```
- RN: chữ "đ" 60% cỡ số + `View` gạch chân `borderBottomWidth:3` cách đáy 3px.

## AC nghiệm thu kit
- [ ] Storybook/Component Gallery `__DEV__` render đủ 12 mục trên cả 3 theme.
- [ ] Mọi component chỉ nhận màu qua token; bóng cứng qua `NeoShadow`; không hairline 1px sót lại.
- [ ] Nhấn mọi nút/chip: dịch 2px + bóng 3→1px + haptic. Vùng chạm ≥ 44×44.