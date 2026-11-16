# 📊 08 — STATS: TAB THỐNG KÊ (Album / Phân Tích / Tạp Chí — re-skin)

> **Screen-unit:** Tab 1. **LOGIC & 3 KPI & 3 CHẾ ĐỘ XEM GIỮ NGUYÊN** (`docs/screens/STATS.md` §1–13). Chỉ thay da theo style Heo Con.

## 1. Thanh chuyển 3 chế độ
- `[📸 Cuốn Album] [📊 Phân Tích] [📖 Tạp Chí]` → pill viền 3px ink bo 999; mục chọn = nền ink chữ kem; haptic selection.

## 2. Album ảnh tháng
- Mỗi tháng 1 khối: tiêu đề tháng **18 Baloo 800** dính đầu khi cuộn + tổng chi 38 Baloo tabular.
- Ô ảnh 3:4: viền 3px ink bo 20 + bóng 0 3 0; nhãn giá góc dưới = pill nền mực chữ kem, `-30k` đỏ `#E0452B`, `+30k` xanh `#5E9A57` (QĐ 73).
- Ô "Chưa có giá": viền đứt 2px `#D9C9A4` + nhãn overline "CHƯA CÓ GIÁ" (không hiện "0 đ").
- Ô "Không mua": viền 3px Vàng Cám (ngữ nghĩa giữ lại tiền).
- Chip chọn tháng nhảy nhanh: `NeoChip` bo 18.

## 3. Phân Tích Data (3 KPI + biểu đồ)
- KPI card: `NeoCard` bo 20; nhãn overline 12; số 24 Baloo 800 tabular; màu ngữ nghĩa (xanh=đạt, đỏ=xtos).
- Biểu đồ cột 7/31 ngày so hạn mức: cột xanh lá `#5E9A57` (dưới), đỏ `#E0452B` (lố), kem `#D9C9A4` (không ghi); **đường gạch đứt hạn mức 2px `#D9C9A4`** (đúng Màn 4 Plan 4).
- Khối nhận xét "heo đọc số": pill nền mực chữ kem + giọng §6.1 STYLE_HEOCON, 1 câu/≤70 ký tự.
- Pareto/cơ cấu danh mục: tên tiếng Việt có dấu (QĐ 73); thanh = track kem sàn + fill theo danh mục (bảng màu pastel giới hạn, không neon).

## 4. Tạp Chí Anime
- Bìa/đoạn: nền `#FFFBF1` viền 3px ink bo 26; tiêu đề Baloo 2 800; quote "cà khịa có tâm" 15 Nunito italic muted; sticker heo (PNG từ sprite `stand` + tim) góc dưới luân phiên trái/phải (đúng cấu trúc khung marketing Plan 9).

## 5. Sheet Chi Tiết Tháng
- Sheet nền `#FFFBF1` viền trên 3px ink bo 28; các dòng phân tích = `NeoCard` bo 20; nút đóng tròn 44 viền 3px.

## AC
- [ ] "Đã chi" khớp từng đồng với Home; KPI không đổi công thức.
- [ ] Album: ô viền 3px/bóng cứng đúng token; nhãn giá pill nền mực; Ẩn tiền che mọi nhãn.
- [ ] Biểu đồ đúng 3 trạng thái màu + gạch đứt hạn mức; danh mục tên có dấu.
- [ ] 0 error/warning tsc; hiệu năng cuộn giữ spec v1.0 (SectionList, thumb 240px).