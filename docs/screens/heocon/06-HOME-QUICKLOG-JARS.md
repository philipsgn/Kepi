# ⚡ 06 — HOME·QUICKLOG & JARS: GHI NHANH + CHO HEO ĂN + HŨ/NGUỒN TIỀN

> **Screen-unit:** 2 section dưới Thẻ "Chi hôm nay". Giọng copy đúng prototype (`.fine`).
> **Bám sát:** CSS `.quick`/`.chips`/`.chip`/`.actions`/`.link`/`.fine`/`.jar*` + logic `addExpense()`/`feed()` của prototype — port sang luồng ghi sổ thực của Kepi.

## 1. Section "GHI NHANH" (CSS `.quick`)
```css
/* gốc */ .quick{margin-top:22px} .chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.chip{flex-direction:column;padding:7px 14px;border-radius:18px} .chip small{font:700 12px var(--muted)}
.actions{display:flex;align-items:center;gap:12px;margin-top:16px}
.link{background:none;border:0;font:800 14px;color:var(--muted);text-decoration:underline offset 3px;padding:8px}
.fine{font-size:13px;color:var(--muted);margin:10px 0 0}
```
- **Hàng chip (NeoChip 2 dòng):** Thay chip demo (Phở bò 45k…) bằng **khoản gần nhất của người dùng** từ `transactionStore` (tối đa 4, không trùng) — không hardcode món/tiền (QĐ 48). Chạm chip = ghi nhanh khoản cùng danh mục & tên → mở `ConfirmationSheet`/luồng ghi hiện có với số tiền điền sẵn.
- **Hàng action:** `NeoButton gold` "Cho heo ăn" + `link` "Xem tất cả" (underline 3px offset, mở Journal chi tiết — thay nút "Làm lại" demo).
- **Dòng `.fine`** chuẩn hóa copy: "Cuối ngày chi dưới hạn mức, Chuỗi ngày +1." (thay "thưởng 3 cám" — không thêm economy, QĐ 112).

### Logic "Cho heo ăn" (port `feed()` — giữ nghề: heo ăn = ghi sổ)
```
feed():
  nếu chưa có khoản nào ghi hôm nay → bubble "Hôm nay chưa có gì ăn hết, ghi một khoản đi nha" → mở luồng ghi (Camera/ghi nhanh)
  ngược lại → heo chạy tới bát (66,116) → eat 3s → "Ngon quá, cảm ơn nha!" → happy 1.4s
  (nút hiển thị "Cho heo ăn · N khoản" — N = số khoản đã ghi hôm nay, thay "−1 cám")
```

## 2. Section "HŨ / NGUỒN TIỀN" (CSS `.jars`) — Phase sau, có data mới render
```css
/* gốc */ .jar-head{display:flex;justify-content:space-between;align-items:baseline}
.jar-head b{font:800 18px Baloo}
.jar-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(92px,1fr));gap:10px;margin-top:10px}
```
- Head: overline "HŨ" trái + **tổng số dư** (`realBalance`, 18 Baloo 800 tabular) phải — Ẩn tiền che.
- Lưới `NeoJar` (§2.10 NEO-KIT): mỗi nguồn tiền 1 thẻ (icon pastel + tên + số). Mapping nguồn theo `src/types/database.ts` hiện có (`BANK`/`E_WALLET`/`CASH` nếu tồn tại; thiếu data → **ẩn section, không render placeholder giả**).
- Chạm jar: lọc chi tiết nguồn (nếu tính năng tồn tại; không tạo tính năng mới ngoài spec).

## 3. Điều kiện render & trạng thái
| Trạng thái | Hiển thị |
|---|---|
| Mới cài, 0 khoản | Section QuickLog chỉ hiện dòng `.fine` mời ghi đầu tiên + nút gold mở Camera |
| Ẩn tiền | Chip giá, jar amounts, tổng hũ → `••••` |
| Vượt hạn mức | Nút gold giữ màu vàng; KHÔNG đổi sang đỏ (màu ngữ nghĩa không trang trí) |

## AC
- [ ] Không có chip/món/tiền hardcode; chip sinh từ lịch sử thật.
- [ ] "Cho heo ăn" đúng logic feed() port; chưa có khoản → mời ghi, không trừ gì cả.
- [ ] Hũ chỉ render khi có data nguồn; tổng khớp `realBalance` từng đồng (AC khớp số v1.0).
- [ ] Mọi nút haptic + nhấn lún 2px; Ẩn tiền phủ toàn bộ số ở section này.