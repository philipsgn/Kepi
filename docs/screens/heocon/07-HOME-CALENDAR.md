# 📅 07 — HOME·CALENDAR: LỊCH TUẦN/THÁNG + CHI/THU THÁNG + LỌC (re-skin)

> **Screen-unit:** phần album ảnh của Home. **LOGIC v1.0 GIỮ NGUYÊN 100%** (data contract, cử chỉ, hiệu năng — `docs/screens/HOME.md` §5–7). File này chỉ đặc tả "da" theo style Heo Con.

## 1. Dải Điều Hướng & Toggle
| Phần tử | Re-skin |
|---|---|
| Tiêu đề khoảng (`12/10 - 18/10, 2026`) | chữ 14 Nunito 700 ink + icon `Calendar` nổi trần (QĐ 74) |
| Nút `<` `>` đổi tuần/tháng | icon nổi trần 22px stroke 2.6, hitSlop 44 (QĐ 74/81) — KHÔNG viền, KHÔNG hộp nền |
| Segment `Tuần | Tháng` | pill viền 3px ink bo 999; mục chọn nền ink chữ kem; mục rảnh nền surface chữ ink |
| Nút Ẩn tiền | giữ icon Eye/EyeOff nổi trần; nhãn `Ẩn tiền/Hiện tiền` 12 overline |
| Chips lọc danh mục | `NeoChip` bo 18 viền 3px; chip chọn = nền Vàng Cám chữ ink |

## 2. Lịch Tuần — 7 ô Polaroid (CSS `.jar`-style viền)
- Ô ngày: nền `#FFFBF1`, **viền 3px ink bo 20, bóng cứng 0 3 0** (thay viền hairline mềm v1.0 khi theme heocon).
- Hôm nay: nền Vàng Cám `#F4B93B` + chữ ink (tương phản 7.8:1); ngày tương lai mờ 40%; ngày "Không mua": viền Vàng Cám.
- Badge `+N`: pill nền mực chữ kem (8 Nunito 800).
- Chồng ảnh đa lớp Locket giữ nguyên (xoay −3/+3°, hairline giữa ảnh).

## 3. Lịch Tháng — Lưới 7 cột T2→CN
- Header thứ: 12 Nunito 800 overline muted.
- Ô ngày: giữ bo 14; khi theme heocon → viền 2px ink cho ô có ảnh (ô trống không viền, nền surfaceAlt).
- MonthNavigator: giữ hành vi vuốt ngang + khóa Pager (v1.0 §6.3).

## 4. Khối Chi/Thu tháng (`.jar-head` style)
- 2 khối song song: overline "CHI THÁNG NÀY"/"THU THÁNG NÀY" + số 24 Baloo 800 tabular.
- Chi → ink; Thu → Xanh Lá `#5E9A57`; lố ngân sách tháng → Đỏ Cam. Ẩn tiền che.

## 5. Trạng thái rỗng (giữ text v1.0)
- "Chưa có gì tháng này. Chụp thử món gần nhất." — chữ 15 Nunito 600 giữa; nút "Mở camera" → `NeoButton gold`.
- Offline: nhãn "Chưa đồng bộ" pill viền 3px ink; Lỗi: banner + `NeoButton` "Thử lại".

## AC
- [ ] Không đổi bất kỳ handler/du liệu của PhotoCalendarGrid/WeekCalendarCarousel v1.0.
- [ ] Ô có ảnh viền 3px ink bo 20 + bóng 0 3 0 (theme heocon); Hôm nay nền Vàng Cám.
- [ ] Vuốt ngang đổi tháng không văng tab (khóa Pager giữ nguyên).
- [ ] Ẩn tiền che số tiền ở mọi khối section này; AC-3/AC-4/AC-6 v1.0 vẫn pass.