# 🐷 STYLE GUIDE "HEO CON" — KAWAII NEO-BRUTALIST (STYLE_HEOCON.MD)

> **Nguồn sự thật duy nhất (Single Source of Truth)** cho phong cách neo-brutalist của toàn App Kepi/PigFly.
> **Bản gốc tham chiếu:** `prototype/Ví Heo Con.html` (bản dựng HTML tương tác hoàn chỉnh — mọi giá trị dưới đây được trích xuất 1:1 từ file này) và `prototype/MASTER-PROMPTS.md` (Plan 0–11: Style, Color, Font, UI, Pixel Garden, Mascot, Animation, Copy, QA).
> **Phạm vi áp dụng:** Toàn bộ 5 Tab (Home, Stats, Camera, Chat, Profile) + Auth + Onboarding + Modal/Sheet. Bắt buộc đọc trước khi chạm code UI.
> **Nguyên tắc số 1:** *Học phong cách (bố cục, độ dày viền, bảng màu, cách kể chuyện bằng mascot), KHÔNG sao chép tài sản app mẫu khác (nhân vật mèo, tên "Roll", câu thoại, đơn vị "pate").*

---

## 1. TRIẾT LÝ PHONG CÁCH (STYLE PHILOSOPHY)

Biến việc ghi chép chi tiêu thành thói quen nhẹ nhàng, không áp lực, nhờ một nhân vật bầu bạn — **chú heo pixel** sống trong "khu vườn Việt hóa" trên trang Home.

1. **Kawaii + Neo-Brutalist:** viền nâu mực DÀY, bo góc LỚN, bóng đổ CỨNG (không blur), nền kem ấm. Trẻ trung, dễ thương nhưng có "khung" rõ ràng như đồ chơi gỗ.
2. **Mascot & khu vườn là pixel art.** Phần còn lại của UI là vector sạch. **Tuyệt đối không trộn ảnh gradient bóng bẩy** vào hệ này.
3. **Tiếng Việt hiển thị đúng dấu ở mọi cỡ chữ.** Chuỗi kiểm tra bắt buộc: `ẫ ỗ ở ử ự ộ ặ ề`.
4. **Con số tiền là nhân vật chính của màn hình:** to, đậm, `tabular-nums` (số không giật khi đếm).
5. **Giọng văn:** ngắn, dễ thương, không phán xét. Lố ngân sách thì heo "buồn xíu", **không bao giờ mắng** (xưng "heo" — "bạn", câu ≤ 2 mệnh đề, < 70 ký tự).
6. **Không emoji làm icon.** Dùng vector `lucide-react-native` nét 2.2–2.8 đầu tròn (tương thích Quyết định 66).
7. **Không sao chép tài sản app khác.** Tạo mới hoàn toàn.
8. **Mọi quyết định thiết kế phải qua TOKEN** (màu, font, spacing, viền, bóng). Không hard-code giá trị lẻ.

---

## 2. HÌNH NGÔN NGỮ NEO-BRUTALIST (SHAPE LANGUAGE — TRÍCH XUẤT 1:1 TỪ PROTOTYPE)

| Thuộc tính | Giá trị chuẩn | Ghi chú từ prototype |
|---|---|---|
| **Viền (border)** | `3px`, màu **Nâu Mực `#2B2118`** | Áp cho THẺ, NÚT, Ô NHẬP, CHIP, THANH TIẾN ĐỘ, AVATAR, KHUNG VƯỜN — không ngoại lệ |
| **Viền thanh tiến độ / icon thẻ Hũ** | `2px` | `.seg` và `.jar i` dùng 2px |
| **Bo góc thẻ lớn** | `26–28px` | `.spend` = 26px, `.scene` = 28px |
| **Bo góc thẻ Hũ** | `20px` | `.jar` |
| **Bo góc chip 2 dòng** | `18px` | `.chip` |
| **Bo góc nút / pill** | `999px` (viên thuốc) | `.btn`, `.badge`, `.cam`, `.state` |
| **Bo góc ô tiến độ** | `8px` | `.seg` |
| **Bo góc bong bóng thoại** | `14px` + đuôi kim cương 10px xoay 45° | `.bubble::after` |
| **Bo góc khung icon Hũ** | `9px` | `.jar i` (30×30) |
| **Bóng đổ cứng** | `0 3–4px 0`, **blur 0**, cùng màu viền `#2B2118` | Thẻ to = 4px, nút/avatar/jar = 3px |
| **Trạng thái nhấn (press)** | Dịch xuống `2px`, bóng còn `0 1px 0` | `.btn:active` — tạo cảm giác lún cơ khí |
| **Nhịp khoảng cách** | `8 / 12 / 16 / 24` | Khoảng cách giữa các khối 16–24, lề ngang màn hình 16 |
| **Mật độ** | Thoáng, hình khối tròn mềm, không góc nhọn | — |
| **Dấu ấn "đường gạch đứt"** | Phân cách trong thẻ: `2px dashed #D9C9A4` | `.dash` — ngăn số tiền và khu thoại |
| **Dấu ấn "nhãn viết hoa"** | `12px / 800 / letter-spacing 0.16em / UPPERCASE / màu nâu nhạt` | `.label` — "CHI HÔM NAY", "GHI NHANH", "HŨ" |
| **Thanh 10 ô tiến độ** | 10 ô đều nhau, cao `20px`, gap `5px`, ô trống nền kem sàn | Số ô đầy = `floor(spent/limit×10)`, lố hạn mức → toàn bộ ô đỏ |
| **Hình khối heo & vườn** | Pixel art nearest-neighbor, **tối đa 32 màu**, phóng không làm mịn | Chi tiết §7 |

### 2.1. Quy tắc "Bóng cứng" trên React Native (BẮT BUỘC ĐỌC KHI THI CÔNG)
CSS `box-shadow: 0 4px 0 ink` KHÔNG map trực tiếp sang RN. Chuẩn thi công:
- **iOS:** `shadowColor: '#2B2118', shadowOffset: {width: 0, height: 4}, shadowRadius: 0, shadowOpacity: 1`.
- **Android:** `elevation` không tạo bóng offset cứng → dùng **lớp bóng giả (Fake Shadow Layer)**: một `View` nền `#2B2118`, cùng `borderRadius`, cùng kích thước, đặt `position: 'absolute'`, `top: +3~4px` so với bề mặt chính, render TRƯỚC bề mặt chính trong cùng container. Đây là cách duy nhất giữ bóng cứng 0-blur nhất quán 2 nền tảng.
- Đóng gói thành component duy nhất `src/components/neo/NeoShadow.tsx` (hoặc prop `hardShadow` trong `NeoCard`) — cấm mỗi nơi tự viết một kiểu.

---

## 3. BẢNG MÀU — THEME 3 "HEO CON" (`heocon`) — LÀM MẶC ĐỊNH HỆ THỐNG

Hệ chuyển từ 2 theme (pink/mint) sang **3 theme**: `pink`, `mint`, **`heocon` (mặc định khi người dùng chưa chọn)**. Pink/mint giữ nguyên trạng thái hiện có; `heocon` là bảng màu chủ đạo mới của thương hiệu.

### 3.1. Màu lõi trích xuất từ prototype (`:root` của `Ví Heo Con.html`)
| Vai trò | Tên màu | Hex | Nguồn trong prototype |
|---|---|---|---|
| Nền màn hình app | **Kem Sàn** | `#F6EEDC` | `--screen` |
| Nền thẻ nổi | **Kem Trắng Ngọc** | `#FFFBF1` | `--card` |
| Viền + chữ chính | **Nâu Mực** | `#2B2118` | `--ink` |
| Nhãn phụ | **Nâu Vôi** | `#85735E` | `--muted` |
| Hồng heo (mascot/hero) | **Hồng Heo Phấn** | `#F9B8C4` | `--pig` |
| Trạng thái đạt / dưới hạn mức | **Xanh Lá Vườn** | `#5E9A57` | `--green` |
| Trạng thái lố hạn mức | **Đỏ Cam Lửa** | `#E0452B` | `--red` |
| Thưởng / nút chính | **Vàng Cám** | `#F4B93B` | `--gold` |
| Đường gạch đứt | **Kem Cổ Điển** | `#D9C9A4` | `--line` |
| Nền pastel marketing (mỗi màn một màu) | Mint `#DDEFE3` · Hồng nhạt `#F6DEDA` · Tím nhạt `#EAE5F4` · Be `#F4E7D3` · Đào `#FBE5CC` | | Plan 2 |

### 3.2. Map vào interface `ColorTokens` (`src/theme/tokens.ts`)
```ts
export const heoconTokens: ColorTokens = {
  bg: '#F6EEDC',              // Kem Sàn
  background: '#F6EEDC',
  surface: '#FFFBF1',         // Kem Trắng Ngọc (thẻ Card)
  surfaceAlt: '#F6EEDC',      // Track thanh tiến độ / nền ô trống (đúng .seg background: var(--screen))
  border: '#2B2118',          // VIỀN ĐẶC 3px — khác ngữ nghĩa hairline rgba của pink/mint

  text: '#2B2118',            // Nâu Mực — chữ & số tài chính
  textSub: '#6E5C48',         // Nâu Vôi Đậm — chữ phụ ≥12px (tương phản 6.2:1 trên thẻ, PASS AA/AAA)
  textMuted: '#7A6852',       // Nâu Vôi Dịu — chú thích (5.2:1 trên thẻ, PASS AA). #85735E gốc chỉ dùng trang trí/gạch đứt

  primary: '#F4B93B',         // Vàng Cám — nút hành động chính
  textOnPrimary: '#2B2118',   // CHỮ NÂU MỰC trên nút vàng (không phải trắng!) — tương phản 7.8:1 PASS AAA
  primarySoft: 'rgba(244, 185, 59, 0.18)',

  accent: '#F9B8C4',          // Hồng Heo Phấn (mascot, điểm nhấn ấm)
  accentSoft: 'rgba(249, 184, 196, 0.30)',

  success: '#5E9A57',         // Xanh Lá Vườn — đạt / dưới hạn mức
  successSoft: 'rgba(94, 154, 87, 0.16)',
  danger: '#E0452B',          // Đỏ Cam Lửa — lố hạn mức
  dangerSoft: 'rgba(224, 69, 43, 0.14)',
  warning: '#F4B93B',         // Tiệm cận hạn mức dùng chính vàng cám (ngữ nghĩa: "gần chạm")

  gradient: ['#F6EEDC', '#FFFBF1'],
  primaryGradient: ['#F4B93B', '#E0A93B'], // Vàng Cám → Vàng Ngói (tileC của khu vườn)
  glowColor: 'rgba(43, 33, 24, 0.25)',

  shadowColor: '#2B2118',
  shadowOpacity: 1,           // bóng CỨNG 0-blur, opacity đầy (khác bóng mềm 0.06 của pink/mint)
};
```

### 3.3. Quy tắc ngữ nghĩa màu (Plan 2 — KHÔNG dùng màu ngữ nghĩa để trang trí)
- **Xanh lá = đạt/dưới hạn mức. Đỏ = lố. Vàng = phần thưởng/nút chính. Hồng = mascot. Nâu mực = viền & chữ.**
- Không dùng đỏ/xanh để tô trang trí vô nghĩa; mọi màu phải nói lên trạng thái tài chính.

### 3.4. Bảng tương phản WCAG 2.1 (Theme heocon — bắt buộc đạt trước khi merge)
| Cặp màu (chữ / nền) | Tỉ lệ | Chuẩn | Kết quả |
|---|---|---|---|
| Nâu Mực `#2B2118` trên Kem Sàn `#F6EEDC` | ~11.2 : 1 | ≥ 7:1 | ✅ AAA |
| Nâu Mực `#2B2118` trên thẻ Kem Trắng `#FFFBF1` | ~11.9 : 1 | ≥ 7:1 | ✅ AAA |
| Nâu Vôi Đậm `#6E5C48` trên thẻ `#FFFBF1` | ~6.2 : 1 | ≥ 4.5:1 | ✅ AA |
| Nâu Vôi Dịu `#7A6852` trên thẻ `#FFFBF1` | ~5.2 : 1 | ≥ 4.5:1 | ✅ AA |
| Nâu Mực trên Vàng Cám `#F4B93B` (nút chính) | ~7.8 : 1 | ≥ 4.5:1 | ✅ AAA |
| Kem Trắng trên Nâu Mực (nút dark / badge cám) | ~11.9 : 1 | ≥ 4.5:1 | ✅ AAA |
| Xanh Lá `#5E9A57` trên thẻ (ô "đạt" của thanh 10 ô) | ~3.4 : 1 | Nền khối màu (non-text) ≥ 3:1 | ✅ PASS (ô có viền 2px ink phân định) |
| Đỏ Cam `#E0452B` trên thẻ | ~4.0 : 1 | Nền khối màu ≥ 3:1 / chữ lớn ≥ 3:1 | ✅ PASS |

> ⚠️ `#85735E` (`--muted` gốc) đo được ~4.4:1 trên thẻ — DƯỚI 4.5:1. Theo Plan 2 & Plan 11: chữ thường <14px phải thay bằng `#7A6852`; `#85735E` chỉ được dùng cho đường gạch đứt `#D9C9A4`, nhãn in đậm 800 ≥14px, hoặc nền tối.

---

## 4. HỆ THỐNG CHỮ (TYPOGRAPHY — PLAN 3, TRÍCH TỪ PROTOTYPE `<link>` & CSS)

### 4.1. Cặp font (Google Fonts, miễn phí, hỗ trợ tiếng Việt đầy đủ)
| Vai trò | Font | Weight | Áp dụng |
|---|---|---|---|
| **Display** (tiêu đề, TÊN, CON SỐ TIỀN) | **Baloo 2** | 800 (phương án thay: Fredoka 700) | `.amount`, `.who b`, `.jar b`, `h1` |
| **Body** (chữ thường, nút, mô tả, thoại) | **Nunito** | 600–800 (phương án thay: Quicksand 700) | toàn bộ phần còn lại |

- Thi công Expo: `npm i expo-font @expo-google-fonts/baloo-2 @expo-google-fonts/nunito`, load trong `app/_layout.tsx` bằng `useFonts`, đặt tên font family `'Baloo2_800'`, `'Nunito_600'/'Nunito_700'/'Nunito_800'`. Fallback: `system-ui` — không để layout nhảy khi font tải xong (giữ chiều cao dòng cố định, `font-display: swap` tương đương = render sau khi loaded).
- CẤM font cỡ ≤ 11px cho nội dung đọc chính.

### 4.2. Thang chữ (px / line-height) — chuẩn hóa cho RN
| Vai trò | Size / LH | Font | Ghi chú |
|---|---|---|---|
| Hero marketing (màn giới thiệu/auth) | 44–56 / 1.12 | Baloo 2 · 800 | CHỈ dùng màn giới thiệu, không trong app |
| **Số tiền lớn** (thẻ "Chi hôm nay") | **38 / 1.0** | Baloo 2 · 800 | `fontVariant: ['tabular-nums']` |
| Tên người dùng / tiêu đề màn | 24 / 1.1 | Baloo 2 · 800 | `.who b` |
| Số phụ / tiêu đề thẻ nhỏ | 18 / 1.2 | Baloo 2 · 800 | `.jar b`, `.left b`, `.jar-head b` |
| Body / câu thoại heo | 15 / 1.45 | Nunito · 600–700 | `.talk p`, `.lede` |
| Nút, chip | 14 / 1.2 | Nunito · 800 | `.btn` |
| Nhãn viết hoa | 12 / 1.2 · ls 0.16em · UPPERCASE | Nunito · 800 | màu nâu vôi dịu |
| Số người dùng phụ (dòng "Chuỗi N ngày") | 13 / 1.2 | Nunito · 700 | `.who span` |

### 4.3. Quy tắc chữ
1. Số tiền LUÔN `tabular-nums`.
2. Ký hiệu đồng: chữ **"đ" cỡ 60% số**, gạch chân dày 3px, cách số 0.2em (`.amount .d` — CSS `text-decoration-thickness:3px; text-underline-offset:3px`). RN thi công: `View` gạch chân bằng `borderBottomWidth: 3` quanh chữ "đ", hoặc component `DongMark`.
3. Line-height tiêu đề tối thiểu **1.12** để dấu tiếng Việt không bị cắt.
4. Chuỗi test bắt buộc trên mọi cỡ chữ: `"Thói quen tiền, có heo bên cạnh."`, `"Ngân sách vừa với tháng của bạn."`, `"Sửa gì cũng chỉ một chạm."`.
5. Tiếp tục tuân thủ `fontVariant: ['tabular-nums']` và định dạng tiền `45.000 đ` hiện có (`docs/screens/HOME.md` §8 — không đổi string dictionary trừ khi ghi rõ).

---

## 5. ĐẶC TẢ COMPONENT NỀN TẢNG (8 COMPONENT — PLAN 1, TRÍCH TỪ CSS PROTOTYPE)

Thi công vào `src/components/neo/`. Mọi component đọc token từ `useTheme()` — khi theme là pink/mint vẫn dùng MẪU neo (viền 3px, bóng cứng) nhưng tô màu theo token theme đang chọn (shape language là của toàn app, màu theo theme).

### 5.1. `NeoCard` (thay `Card` ở các màn re-skin)
- `borderWidth: 3`, `borderColor: tokens.border`, `borderRadius: 28` (thẻ lớn) / 26 (thẻ đè mép) / 20 (thẻ nhỏ), nền `tokens.surface`.
- Bóng cứng `0 4px 0` (theo §2.1). Không padding ép: mặc định `padding 16`.
- Prop `overlap` cho thẻ đè lên khối trên: `marginTop: -22, marginHorizontal: 8, zIndex: 2` (giống `.spend` đè đáy khung vườn).

### 5.2. `NeoButton` (3 biến thể + tròn)
| Biến thể | Nền | Chữ/icon | Dùng cho |
|---|---|---|---|
| `cream` (mặc định) | `surface` `#FFFBF1` | ink | nút thường trên nền kem |
| `dark` | `#2B2118` | kem `#F6EEDC` | nút Pro, badge cám, CTA mạnh |
| `gold` | `#F4B93B` | ink | nút hành động chính (CTA) |
| `round` | kích thước cố định `44×44`, padding 0, icon center | | nút cài đặt, nút icon trong vườn |

- Chung: `font: 800 14px Nunito`, `border 3px ink`, `radius 999`, `padding 8×14`, bóng cứng `0 3px 0`.
- **Nhấn:** translateY 2px + bóng còn 1px + `Haptics.ImpactFeedbackStyle.Light`. Vùng chạm ≥ 44×44 (hitSlop).
- `aria-disabled`/`disabled`: `opacity 0.5`, không rung.

### 5.3. `NeoChip` (chip ghi nhanh 2 dòng)
- Cột dọc: dòng 1 tên món (14 Nunito 800 ink), dòng 2 giá rút gọn (12 Nunito 700 muted).
- `padding 7×14`, `radius 18`, `border 3px ink`, bóng cứng `0 3px 0`, nền `surface`. Nhấn = NeoButton press.

### 5.4. `SegmentBar10` (thanh 10 ô — nâng cấp `DiscreteAllowanceBar` variant `neo`)
- 10 ô `flex:1`, cao 20, gap 5, mỗi ô `border 2px ink`, `radius 8`.
- Ô trống: nền `tokens.surfaceAlt` (kem sàn). Ô đầy: nền `tokens.success` (xanh lá). **Lố hạn mức: TOÀN BỘ 10 ô đỏ** `tokens.danger`.
- `role="progressbar"` + `accessibilityValue` (min/max/now) — giữ a11y hiện có.

### 5.5. `OverlineLabel` (nhãn viết hoa)
- `fontSize 12 · fontWeight 800 · letterSpacing 0.16em · uppercase · color textMuted`. Dùng cho mọi tiêu đề section: "CHI HÔM NAY", "GHI NHANH", "HŨ".

### 5.6. `NeoBubble` (bong bóng thoại heo)
- Nền `surface`, `border 3px ink`, `radius 14`, chữ `13 Nunito 800 ink`, đuôi kim cương 10px (RN: 2 View xoay 45° hoặc SVG nhỏ) ép mép dưới.
- Vị trí: ép theo tọa độ heo (clamp 22%–78% bề ngang), hiện 1.5–2s rồi ẩn. `role="status"`, `aria-live="polite"`.

### 5.7. `NeoAvatar`
- Tròn 56, `border 3px ink`, nền `#FCE3E8`, bóng cứng `0 3px 0`, bên trong là mặt heo pixel 48×48 (§7.4).

### 5.8. `NeoJar` (thẻ Hũ / nguồn tiền)
- `border 3px ink`, `radius 20`, bóng cứng `0 3px 0`, padding 10, cột dọc gap 4.
- Icon: khối 30×30 `radius 9`, `border 2px ink`, nền pastel đặc (vd Ngân hàng `#BCD7F5`, Ví điện tử `#F9B8C4`, Tiền mặt `#CDE6BE`) + icon vector 16px stroke 2.4 ink — **lưu ý ngoại lệ**: đây là khối màu chủ ý của style Heo Con (khác quy tắc Boxless của theme pink/mint, áp dụng RIÊNG khi theme = heocon).
- Tên (13 Nunito 600) + số tiền (16 Baloo 800 tabular).

### 5.9. `NeoInput` (ô nhập)
- `border 3px ink`, `radius 14`, nền `surface`, chữ 15 Nunito 600 ink, `paddingVertical 10`. Focus: viền vẫn 3px, nền `primarySoft`.

### 5.10. Nên / Không nên (mỗi loại 8 ý — Plan 1)
**NÊN:** viền 3px mọi bề mặt tương tác · bóng cứng 0-blur cùng màu viền · bo góc lớn theo token · nhãn viết hoa giãn chữ mở section · đường gạch đứt phân cách · số tiền to đậm tabular · heo xuất hiện ở nhịp thư giãn (cuối thẻ, bubble) · nền pastel đơn sắc cho màn giới thiệu.
**KHÔNG NÊN:** bóng blur/mềm · gradient bóng bẩy · emoji làm icon · viền hairline mảnh 1px · góc nhọn/vuông cứng · chữ lỗi dấu tiếng Việt · màu ngữ nghĩa dùng trang trí · nhồi quá dày (mật độ phải thoáng).

---

## 6. GIỌNG VĂN & NỘI DUNG (PLAN 8 — BỘ CÂU THOẠI CHUẨN)

Heo con hiền, hơi lười, thương chủ. Xưng "heo", gọi người dùng là "bạn". **Không mắng, không dọa, cấm chữ "tiết kiệm đi!"**. Mỗi câu ≤ 2 mệnh đề, < 70 ký tự. Đồng cảm trước, gợi ý nhẹ sau khi lố.

### 6.1. Thoại theo mức chi (chính thức hóa hàm `message(r)` của prototype — dùng cho hàng "talk" dưới thanh 10 ô)
| Mức chi | Câu thoại chuẩn (6 biến thể/mức sẽ viết riêng khi thi công copy) |
|---|---|
| 0% | "Chưa chi đồng nào. Heo đang ngủ gật, đừng đánh thức nha." |
| < 40% | "Chi nhẹ nhàng ghê. Heo ủn ỉn khen một cái." |
| 40–75% | "Đang vừa vặn. Heo vẫn để mắt tới nha." |
| 75–100% | "Gần chạm hạn mức rồi. Heo bắt đầu lo lo." |
| > 100% | "Lố hạn mức rồi... Heo buồn xíu. Mai mình chi gọn lại nha." |

- Khi vừa vượt hạn mức: heo đứng buồn + bubble "Ối, lố hạn mức rồi" (2s).
- Khi ghi khoản chi dưới hạn mức: heo nhảy nhẹ 0.9s + bubble "「Tên món」 −45.000đ".
- Vùng chạm heo: "Ủn ỉn!", "Heo đây, heo đây!", "Gãi bụng đi nè". Chạm ao: "Ở đó có ao, heo không bơi đâu nha".

### 6.2. Trạng thái nhãn dưới khung vườn
`{Nắng|Chiều|Đêm} · sân · {đi dạo|ăn cám|ngủ|vui|buồn}` — cập nhật realtime theo máy trạng thái (§7.3).

---

## 7. KHU VƯỜN PIXEL & MASCOT HEO (PLAN 5/6/7 — THÔNG SỐ KỸ THUẬT ĐẦY ĐỦ)

### 7.1. Canvas & kỹ thuật
- Canvas logic **176×132 px (tỉ lệ 4:3)**, hiển thị phóng to bằng **nearest-neighbor, không làm mịn** (`image-rendering: pixelated`).
- Tối đa **32 màu**, bảng màu ấm, **không viền đen tuyền** (dùng nâu đậm `#4B2B21` cho outline heo).
- Không chữ, không nhân vật trong ảnh nền (heo là sprite riêng).
- **Thi công RN:** sinh PNG tĩnh bằng Node script (`scripts/generate-pixel-garden.js`, encode PNG bằng `zlib` built-in, phóng sẵn 4× = 704×528 để giữ nét khi scale) — không thêm native dependency. Bài đăng render chỉ gồm `<Image>` + sprite heo.

### 7.2. Bố cục cảnh (nhìn chéo nhẹ 3/4, "Việt hóa")
- **Trái-trên:** nhà cấp 4 mái ngói đỏ, cửa chớp gỗ, cửa sổ chớp xanh, đèn lồng đỏ, hiên lát gạch đỏ.
- **Phải-trên:** hàng rào tre, cây ăn quả có quả cam vàng.
- **Giữa:** sân gạch hoa (họa tiết hoa 6×6 px, xanh ngọc `#3F8F95` + vàng `#E0A93B` trên nền kem `#F7EFDA`).
- **Phải-dưới:** ao sen nhỏ (lá sen, một đóa hồng, cá cam bơi).
- **Trái-dưới:** cây chuối, ghế nhựa đỏ, bát cám xanh dương.
- **Lớp trước cùng:** bụi hoa giấy hồng trái-dưới, bụi cỏ phải-dưới.
- **Tách 3 lớp:** `bg` (nền, nhà, rào, sân, ao, bát cám) → `sorted` (cây chuối, ghế, HEO — sắp theo trục Y) → `fg` (bụi hoa, cỏ trước).

### 7.3. Máy trạng thái heo (State Machine — port nguyên `update()` của prototype)
- **Trạng thái:** `idle`, `walk`, `sleep`, `eat`, `happy`.
- **Vùng đi được:** x `26–164`, y `78–118` (tọa độ logic 176×132).
- **Ao bị chặn:** tâm `(136, 106)`, bán kính elip `(31, 13)` — heo trượt dọc mép ao nếu bước kế tiếp rơi vào; kẹt cả 2 trục thì dừng.
- **Luồng tự động:** `idle (1.5–4s)` → 68% đi dạo tới điểm ngẫu nhiên (tránh ao, cách vị trí cũ ≥ 18px), 14% ngủ (5–9s), còn lại đứng thêm.
- **Walk:** tốc độ `24 px/s` (lố hạn mức → `15 px/s`), đổi khung chân mỗi 0.2s, lật hướng theo chiều đi.
- **Tương tác chạm:** chạm heo (hit-box ±13px ngang, từ y−22 đến y+3) → nhảy vui 1.2s + thoại ngẫu nhiên; chạm sân → heo chạy tới; chạm ao → thoại từ chối.
- **Cho heo ăn:** trừ 1 đơn vị thưởng → heo chạy tới bát `(66, 116)`, ăn 3s, rồi vui 1.4s. Hết thưởng → "Hết cám rồi. Ghi chép thêm đi nha".
- **Vào chuồng:** heo ngủ 8s.
- **Hiệu năng:** 1 canvas/1 layer cập nhật, 60fps, dt clamp tối đa 0.05s. **Tôn trọng "giảm chuyển động":** `prefers-reduced-motion` / reduce-motion của HĐH → heo KHÔNG tự đi, chỉ phản hồi khi chạm.

### 7.4. Sprite heo (24×20 px, hướng phải, lật ngang khi đi trái)
- Heo hồng phấn `#F9B8C4`, tai nhọn nhỏ, mõm tròn đậm hơn `#EE90A6`, hai má hồng `#FFE3E8`, mắt 2×2 px đen `#2B2118` có điểm sáng trắng, đuôi xoắn, **đồng xu vàng `#F4B93B` (viền `#B97A14`) treo cổ** — nhận diện thương hiệu. Không dùng nơ đỏ, không ngậm tiền.
- **Khung sprite:** `stand` (2 khung đuôi vẫy + chớp mắt ~3s), `walk` (2 khung bước chéo, thân nhún 1px), `eat` (cúi đầu, mắt nhắm), `sleep` (nằm tròn, mắt nhắm, chữ "z" bay), `happy` (mắt cười ^ ^, nhảy 5px, trái tim đỏ nổi), `sad` (đầu hạ, lông mày xệ, giọt lệ xanh nhạt `#7EC8F0` — khi lố hạn mức).
- **Avatar tròn:** mặt heo nhìn thẳng 16×16 (vẽ trong `drawFace` của prototype).

### 7.5. Biến thể thời điểm trong ngày
| Thời điểm | Phủ màu | Chi tiết thêm |
|---|---|---|
| Ban ngày (06:00–15:59) | không phủ | — |
| Chiều (16:00–18:59) | `rgba(255,140,60,0.20)` | — |
| Đêm (19:00–05:59) | `rgba(20,30,90,0.44)` | cửa sổ sáng vàng `#FFE08A`, đèn lồng tỏa sáng, đom đóm vàng `#FFF08A` nhấp nháy |

- Nhãn trạng thái đổi theo thời điểm thực; **chạm nhãn để đổi thời điểm** (chế độ thử/demo).

### 7.6. Liên kết ngân sách (giữ tính năng Kepi, không thêm economy mới)
- Chi **< 100%** hạn mức ngày: heo vui, đi bình thường. Chi **> 100%**: heo **buồn, đi chậm** (15 px/s), toàn ô tiến độ đỏ.
- Cuối ngày dưới hạn mức: thay "thưởng 3 cám" của prototype bằng **hệ động lực hiện có của Kepi** — tăng chuỗi ngày (Streak) + hiển thị "Đã giữ lại X đ" (không tạo đơn vị "cám" mới; badge góc phải vườn hiển thị **"Chuỗi N ngày"** nền mực thay "24 cám").
- "Cho heo ăn" (nút gold): mở nhanh luồng ghi khoản chi mới (mở Camera/ghi nhanh) — heo ăn cám tương ứng = 1 khoản đã ghi hôm nay. *Nếu chưa ghi khoản nào hôm nay → heo nói "Hôm nay chưa có gì ăn hết, ghi một khoản đi nha".*

---

## 8. BỐ CỤC MÀN HOME CHUẨN STYLE (ĐỐI CHIẾU VỚI "MÀN 1: HOME" — PLAN 4)

```
┌ Màn hình (nền #F6EEDC, lề ngang 16, vùng tai thỏ an toàn) ──────────┐
│ Hàng đầu: [Avatar heo 56 viền 3] [Tên 24 Baloo + "Chuỗi N ngày" 13] │
│           [Nút Pro nền mực] [Nút cài đặt tròn 44]                   │
│ KHUNG VƯỜN PIXEL: bo 28, viền 3px, bóng 0 4 0, tỉ lệ 4:3            │
│  ├ góc trái: nút tròn (vào chuồng) + nút "Vào chuồng"               │
│  ├ góc phải: badge nền mực "Chuỗi N ngày"                           │
│  ├ dưới trái: nhãn trạng thái "Nắng · sân · đi dạo"                 │
│  └ bubble thoại theo tọa độ heo                                     │
│ THẺ "CHI HÔM NAY" (đè lên đáy khung vườn −22px):                    │
│  ├ Overline "CHI HÔM NAY"                                           │
│  ├ Số tiền lớn 38 Baloo trái ⇄ phải "còn lại trên hạn mức" + số 18  │
│  ├ Thanh 10 ô (SegmentBar10)                                        │
│  ├ Đường gạch đứt 2px #D9C9A4                                       │
│  └ Hàng heo mini + câu thoại theo mức chi                           │
│ GHI NHANH (nếu bật): hàng chip 2 dòng + nút gold "Cho heo ăn"       │
│ HŨ / NGUỒN TIỀN: tiêu đề + tổng, lưới thẻ NeoJar                    │
│ [PHẦN CÒN LẠI GIỮ NGUYÊN features hiện có của JournalView — re-skin]│
└─────────────────────────────────────────────────────────────────────┘
```

---

## 9. CHECKLIST QA PHONG CÁCH (PLAN 11 — BẮT BUỘC TRƯỚC KHI DUYỆT TỪNG MÀN)

**PHONG CÁCH**
- [ ] Viền 3px nâu mực ở mọi thẻ/nút/chip · bóng cứng blur 0 · bo góc nhất quán theo token
- [ ] Không gradient bóng, không emoji làm icon

**MÀU & CHỮ**
- [ ] Mọi màu lấy từ token · tương phản chữ/nền ≥ 4.5:1 (bảng §3.4) · số tiền tabular-nums
- [ ] Dấu tiếng Việt không bị cắt ở mọi cỡ chữ · "đ" gạch chân đúng quy cách (60% + gạch 3px)

**PIXEL ART**
- [ ] Không mờ khi phóng (nearest-neighbor / PNG 4×) · không quá 32 màu · heo vẽ đúng thứ tự trục Y (banana=106, stool=86, heo theo pig.y)
- [ ] Heo không đi vào ao, không ra ngoài vùng đi được (x 26–164, y 78–118)

**HÀNH VI**
- [ ] Chạm heo / chạm sân / chạm ao phản hồi đúng · vượt hạn mức: ô đỏ + heo buồn + thoại đổi
- [ ] Giảm chuyển động hoạt động đúng

**NỘI DUNG**
- [ ] Không có câu chữ/tên/nhân vật trùng app mẫu · giọng heo nhất quán, không mắng người dùng

---

## 10. ĐỒNG BỘ VỚI TÀI LIỆU KHÁC
- `docs/screens/heocon/` — **bộ 13 đặc tả screen-unit tách nhỏ theo style này** (`00-INDEX.md` → `12-LOGIN-ONBOARDING.md`); `01-PIXEL-GFX-PORT.md` là bản port code đồ họa 1:1 từ prototype — nguồn chân lý cho mọi Agent thi công.
- `docs/AGENTS.md` (v4.5) — Core Directive 3 + Ma Trận Tra Cứu bắt buộc đọc style guide + code đồ họa prototype trước khi code UI.
- `docs/DESIGN.md` — mục 2 bổ sung quy chiếu Theme 3 & style guide này.
- `docs/screens/HOME.md` — đặc tả đầy đủ màn Home theo style này (màn chuẩn hóa đầu tiên).
- `docs/screens/{STATS,CAMERA,CHAT,PROFILE}.md` — phụ lục "Đồng bộ phong cách Heo Con" ở cuối từng file.
- `docs/DECISIONS.md` — Quyết định 74–76 ghi nhận việc áp dụng.
- Giữ nguyên: quy chuẩn icon nổi trần `lucide-react-native` (Quyết định 66), Ẩn tiền (§4.2 PROFILE.md), offline-first (Quyết định 114 AGENTS.md), không lưu STK.
