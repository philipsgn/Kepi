# 🚪 12 — LOGIN & ONBOARDING: NỀN PASTEL ĐƠN SẮC + BADGE PILL (Plan 2/9)

> **Screen-unit:** màn mở đầu + thiết lập. Giữ nguyên luồng 1-chạm Local-First (QĐ 83/85/87/88: nhập biệt danh + năm sinh → Nút Nguồn vào app ≤ 0.5s; 0 pre-filled).
> **Bám sát:** Plan 2 (nền pastel đơn sắc mỗi màn một màu) + Plan 9 (badge viên thuốc) + CSS `.badge`/`.btn`/`.lede`/`h1` của prototype.

## 1. Login
| Phần tử | Spec Heo Con |
|---|---|
| Nền | **pastel đơn sắc** — mint `#DDEFE3` (kế thừa `--page` của prototype); KHÔNG gradient bóng bẩy |
| Badge trên cùng | `.badge{border:3px solid var(--ink);border-radius:999px;background:var(--card);font:800 16px;letter-spacing:.06em}` + chấm đỏ 11px viền 2px: `● PIGFLY` |
| Tiêu đề Hero (màn giới thiệu) | `h1{font:800 clamp(34→28px)/1.12 Baloo}` — "Thói quen tiền, có heo bên cạnh." (tagline gốc prototype, ≤ 2 dòng) |
| Avatar heo | PNG `assets/icon.png` (heo 3D chính thức QĐ 89/92) hoặc mặt heo pixel `face_16` trong `NeoAvatar` 80–100px viền 3px bóng `0 3 0` |
| Ô Biệt danh | `NeoInput` viền 3px bo 999; placeholder "Nhập biệt danh của bạn" mờ; icon `User` nổi trần; tick `Check` xanh; xúc xắc `Dices` nổi trần (QĐ 87) |
| Chọn Năm sinh | `NeoButton` cream viền 3px + icon `Calendar`; modal giữa bo 24 viền 3px (QĐ 92) |
| **Nút Nguồn vào app** | giữ QĐ 87: icon `Power` trơn 42px stroke 2.8 nổi trần; chạm → bừng Vàng Cám `#F4B93B` + haptic Heavy. KHÔNG bọc viền (ngoại lệ chủ ý giữ nguyên quyết định cũ) |
| Cảnh báo trống | giữ QĐ 88: "Vui lòng nhập biệt danh" — pill viền 3px Đỏ Cam chữ kem |
| Ca dao đáy | 2 câu lục bát in nghiêng 15 Nunito muted, không ngoặc kép (QĐ 87) |
| Đổi theme 1-chạm `Palette` | giữ nguyên; vòng qua 3 theme heocon/pink/mint |

## 2. Onboarding (thiết lập thu nhập & chi phí cố định)
- Giữ nguyên logic QĐ 37/41–53 (thanh trượt phi tuyến, chip cố định, tính hạn mức tự động, không chặn người không thu nhập).
- Re-skin: card nền `#FFFBF1` viền 3px bo 26 bóng `0 4 0`; slider = track viền 2px ink bo 8 + thumb tròn Vàng Cám viền 3px; chip gợi ý = `NeoChip`.
- Live preview hạn mức: số 24 Baloo 800 tabular + DongMark; không hardcode (QĐ 48).
- Nút hoàn tất: `NeoButton dark` (nền mực) "Vào ví" — hành vi giữ nguyên.

## 3. Trạng thái
| Trạng thái | Hiển thị |
|---|---|
| Đang kiểm tra tên | spinner pill viền 3px; fail-open giữ nguyên (QĐ 93) |
| Tên trùng | "Tên này đã có bạn dùng" + 3 chip gợi ý `NeoChip` |
| Offline | vẫn vào được (Local-First); không banner lỗi chặn |

## AC
- [ ] Luồng vào app ≤ 0.5s không đổi; 0 pre-filled (biệt danh rỗng, năm sinh rỗng).
- [ ] Badge pill + chấm đỏ đúng CSS gốc; nền pastel đơn sắc (mỗi màn 1 màu theo Plan 2).
- [ ] Nút Nguồn bừng vàng cám + haptic Heavy; mọi input viền 3px.
- [ ] Dấu tiếng Việt ở cỡ 34–56 không bị cắt (line-height 1.12).