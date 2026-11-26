# 🐷 INDEX — ĐẶC TẢ SCREEN NHỎ STYLE "HEO CON" (docs/screens/heocon/)

> **Mục đích:** tách toàn bộ app thành các **screen-unit nhỏ** để Agent thi công từng miếng độc lập, mỗi miếng bám sát code đồ họa của `prototype/Ví Heo Con.html`.
> **Thứ tự đọc bắt buộc:** `docs/STYLE_HEOCON.md` (ngôn ngữ chung) → `docs/PIXEL_OPEN_WORLD_SPEC.md` (Master Blueprint 6 Banner Không Gian Mở) → file screen tương ứng → `01-PIXEL-GFX-PORT.md` nếu screen có pixel art.

## Danh mục screen-unit & thứ tự thi công

| # | File | Screen-unit | Có pixel art | Thứ tự thi công |
|---|---|---|---|---|
| 01 | [`01-PIXEL-GFX-PORT.md`](01-PIXEL-GFX-PORT.md) | **Bản port code đồ họa 1:1** (sprite, vườn, máy trạng thái) | ✔ (chính nó) | **Đọc đầu tiên** |
| 02 | [`02-NEO-KIT.md`](02-NEO-KIT.md) | Bộ component nền tảng (NeoCard/Button/Chip/Overline/Shadow/SegmentBar10/DashedDivider/Avatar/Bubble) | — | Phase A |
| 03 | [`03-HOME-HEADER.md`](03-HOME-HEADER.md) | Header Home: avatar + tên + Chuỗi + Pro + cài đặt | ✔ (mặt heo 16×16) | Phase C.1 |
| 04 | [`04-HOME-GARDEN.md`](04-HOME-GARDEN.md) | Khung vườn pixel: cảnh + heo + overlay + tương tác | ✔ | Phase B |
| 05 | [`05-HOME-SPEND-CARD.md`](05-HOME-SPEND-CARD.md) | Thẻ "Chi hôm nay" (đè −22px): số tiền + 10 ô + gạch đứt + thoại | ✔ (heo mini) | Phase C.2 |
| 06 | [`06-HOME-QUICKLOG-JARS.md`](06-HOME-QUICKLOG-JARS.md) | Ghi nhanh (chips 2 dòng + Cho heo ăn) + Hũ/nguồn tiền | — | Phase C.3 |
| 07 | [`07-HOME-CALENDAR.md`](07-HOME-CALENDAR.md) | Lịch tuần/tháng + Chi/Thu tháng + chips lọc (re-skin) | — | Phase C.4 |
| 08 | [`08-STATS.md`](08-STATS.md) | Tab Thống Kê: album / phân tích / tạp chí (re-skin) | — | Phase E.1 |
| 09 | [`09-CAMERA.md`](09-CAMERA.md) | Tab Camera: viewfinder + Shutter + review + keyboard (re-skin) | — | Phase E.2 |
| 10 | [`10-CHAT.md`](10-CHAT.md) | Tab Chat: bong bóng + input + thẻ Giá thật + Squad (re-skin) | — | Phase E.3 |
| 11 | [`11-PROFILE-SETTINGS.md`](11-PROFILE-SETTINGS.md) | Tab Hồ Sơ + Cài Đặt + Theme 3-way switch (re-skin) | — | Phase E.4 |
| 12 | [`12-LOGIN-ONBOARDING.md`](12-LOGIN-ONBOARDING.md) | Login + Onboarding (nền pastel đơn sắc theo Plan 2/9) | ✔ (badge + heo) | Phase E.5 |

## Quy tắc chung cho mọi screen-unit
1. **Bám sát 2 nguồn:** giá trị UI = `STYLE_HEOCON.md`; code đồ họa pixel = `01-PIXEL-GFX-PORT.md` (port 1:1 từ prototype). Cấm tự sáng tạo hình dáng heo/vườn.
2. **Giữ nguyên logic:** re-skin chỉ thay da; không đổi store/data contract/luồng nghiệp vụ (xác nhận trong từng file screen).
3. **Token-only:** không hard-code hex trong component — mọi màu qua `tokens.ts` (bảng heoconTokens §3.2 STYLE_HEOCON).
4. **AC riêng** ở cuối mỗi file — nghiệm thu từng screen-unit độc lập, chạy `tsc --noEmit` + `run-all-tests.js` sau mỗi unit.
5. **Giọng văn heo:** mọi câu thoại/lời nhắn theo §6 STYLE_HEOCON — không mắng, ≤ 70 ký tự.