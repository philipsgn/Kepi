# 👤 11 — PROFILE & SETTINGS: HỒ SƠ + CÀI ĐẶT + THEME 3-WAY (re-skin)

> **Screen-unit:** Tab 4 + màn `/(main)/settings`. **Logic thẻ/khóa bảo mật/danh mục GIỮ NGUYÊN** (`docs/screens/PROFILE.md`, QĐ 54/65/66). Chỉ thay da + mở theme thứ 3.

## 1. Tab Hồ Sơ
| Phần tử | Re-skin |
|---|---|
| Thẻ Đầu Trang danh tính | `NeoCard` bo 28 viền 3px bóng 0 4 0; avatar heo PigFly hiện có; Gmail dưới tên (QĐ 82) 13 Nunito muted |
| Dải 3 chỉ số tóm tắt | overline + số 18 Baloo 800 tabular; icon nổi trần (QĐ 64) |
| Thẻ Cân Bằng Ngân Sách Số 0 | `NeoCard` bo 26; **rail trượt: track viền 2px ink bo 8, thumb tròn viền 3px nền Vàng Cám**; số 24–38 tabular; cảnh đỏ = `#E0452B` (QĐ 43) |
| Thẻ Mục Tiêu | thanh tiến độ → `SegmentBar10` variant neo (10 ô viền 2px, fill Xanh Lá); đồng bộ ngôn ngữ Home |
| Chip danh mục / preset % | `NeoChip` bo 18; chọn = Vàng Cám |

## 2. Màn Cài Đặt (`SettingsView`)
- Giữ cấu trúc dòng tối giản QĐ 65/66 (icon nổi trần 20px stroke 2.6, single-line, divider `marginLeft 52`).
- Khi theme heocon: **mỗi nhóm dòng bọc `NeoCard` bo 20 viền 3px** thay hairline; dòng = row 52px, chevron `ChevronRight` nổi trần.
- Màn con (modal/sheet): nền `#FFFBF1`, viền trên 3px ink bo 28; nút Lưu = gold, Hủy = cream, Nguy hiểm = nền `#E0452B` chữ kem (double confirmation giữ nguyên).

## 3. Theme 3-Way (`ThemeSettingsCard.tsx`) — chuẩn mới
- Segmented pill **3 lựa chọn**: `[🐷 Heo Con]` (`heocon`, MẶC ĐỊNH) · `[🌸 Hồng Heo]` (`pink`) · `[🍃 Xanh Mint]` (`mint`).
- Pill viền 3px ink; mục chọn nền ink chữ kem; `Haptics.selectionAsync()`; lưu `vi_locket_theme_mode` (`heocon|pink|mint`).
- Migration: `light/dark/system → heocon`; `cool → mint`; không có key → `heocon`.
- Mô tả ngắn từng theme (1 dòng, ≤ 70 ký tự): "Viền nâu, nền kem, heo pixel" / "Hồng dâu sữa pastel" / "Xanh bạc hà mát mẻ".

## 4. Trạng thái & a11y
- Ẩn tiền: giữ nguyên CSDL logic; số trong thẻ → `••••`.
- Dòng disabled (chưa có data): opacity .5, không haptic.
- Tất cả row ≥ 44×44; nhãn 12px overline chỉ dùng khi 800 + ls .16em.

## AC
- [ ] Theme 3-way hoạt động; migration cũ không crash; mặc định heocon khi mới cài.
- [ ] Cân bằng ngân sách: drag 0–100% mượt 60fps (QĐ 47); thumb vàng cám viền 3px.
- [ ] Mục tiêu: SegmentBar10 khớp tiến độ thật; số tabular.
- [ ] Mọi modal bo 28 viền trên 3px; nút nguy hiểm double-confirm giữ nguyên.