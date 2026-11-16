# 💬 10 — CHAT: ANH MINH AI + SQUAD (re-skin)

> **Screen-unit:** Tab 3. **Persona, RAG, timeout 8s, Squad 2-4 người GIỮ NGUYÊN** (`docs/screens/CHAT.md`). Chỉ thay da.

## 1. Ngăn Chat Anh Minh
| Phần tử | Re-skin |
|---|---|
| Header chat | Tên + avatar heo PigFly hiện có; hàng trạng thái = overline 12 ls .16em |
| Bong bóng **người dùng** | nền ink `#2B2118` chữ kem, viền 3px bo 14 + đuôi kim cương (thay gradient) |
| Bong bóng **Anh Minh** | `NeoBubble`: nền `#FFFBF1` viền 3px bo 14, chữ 15 Nunito 600 |
| Thẻ "Giá thật" trong chat | `NeoCard` bo 20 viền 3px; số tiền 24 Baloo 800 tabular; nhãn overline; nút hành động `NeoButton gold` |
| Khối "heo phán" | pill nền mực chữ kem, 1 câu ≤70 ký tự giọng §6.1 |
| Trạng thái "PigFly đang suy nghĩ..." | 3 chấm pill viền 3px nền surfaceAlt |

## 2. Ô nhập (`ChatInputBar`)
- `NeoInput` pill bo 999 viền 3px nền `#FFFBF1`; placeholder 15 Nunito 600 muted.
- Nút gửi: tròn 44 nền Vàng Cám chữ/icon ink viền 3px; nút gửi ảnh: tròn 44 cream viền 3px (giữ luồng ảnh → thẻ CONFIRMATION 1-chạm).

## 3. Ngăn Bạn Thân (Squad)
- Segment `[🐷 Heo Béo] [👥 Bạn thân]`: pill viền 3px ink, mục chọn nền ink.
- HP heo no bụng → `SegmentBar10` variant neo (xanh/đỏ) — đồng bộ với thanh 10 ô Home.
- Thẻ Locket Feed bạn: viền 3px ink bo 20 + bóng 0 3 0; nút `[👉 Nhắc Heo Đói]`/`[🎉 Vỗ Béo Heo Bạn]` = `NeoButton` cream/gold; mã phòng = `NeoInput` viền 3px + nút copy tròn 44.
- Còi SOS: banner `NeoCard` viền 3px Đỏ Cam `#E0452B` + haptic Heavy (ngữ nghĩa đỏ = cảnh báo).

## 4. Trạng thái
- Lỗi/timeout 8s: fallback offline giữ nguyên; banner lỗi = `NeoCard` viền 3px đỏ.
- Empty conversation: giữ text hiện có; nền section surfaceAlt.

## AC
- [ ] Timeout 8s + fallback hoạt động nguyên bản; persona/giọng không đổi.
- [ ] Bong bóng 2 phía đúng da neo (viền 3px, đuôi kim cương, bo 14).
- [ ] Thẻ Giá thật số tiền tabular + DongMark; nút ≥44×44, haptic.
- [ ] Squad không đổi logic phòng/feed; chỉ thay da.