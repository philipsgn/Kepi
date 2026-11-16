# 🐷 03 — HOME·HEADER: AVATAR + TÊN + CHUỖI + PRO + CÀI ĐẶT

> **Screen-unit:** hàng đầu Tab Home (`JournalView`), lề ngang 16, dưới SafeArea.
> **Bám sát:** CSS `.top`/`.avatar`/`.who`/`.btn.dark`/`.btn.round` của prototype. Thay phần tử: avatar mèo → **mặt heo pixel 16×16** (`drawFace`, `01-PIXEL-GFX-PORT.md` §5); "24 cám" không xuất hiện ở đây (Chuỗi Streak thay thế — QĐ 112/116).

## 1. Bố cục 1:1
```
[NeoAvatar 56 viền 3px bóng 0 3 0]  [Tên 24 Baloo 800 / "Chuỗi N ngày" 13 Nunito 700 muted]
                     [NeoButton dark "Pro" icon Sparkles 14] [NeoButton round icon Settings 22]
```
- CSS gốc: `.top{display:flex;align-items:center;gap:10px}` · `.who b{font:800 24px/1.1 Baloo}` · `.who span{color:var(--muted);font-weight:700;font-size:13px}`.
- Khoảng cách phần tử: `gap 10`; avatar flex:none; `.who{flex:1;min-width:0}`.
- Nút Pro: variant `dark` (nền ink `#2B2118`, chữ kem `#F6EEDC`) — giữ nguyên chức năng hiện có (Premium placeholder).
- Nút cài đặt: `round` 44×44, icon `Settings` 22px stroke 2.2, mở `QuickSettingsSheet` (giữ nguyên hành vi v1.0 — AC-1 cũ: không bánh răng nổi).

## 2. Dữ liệu (không đổi)
- Tên/biệt danh: `useAuthStore().profile` (0 hardcode — QĐ 48/58).
- "Chuỗi N ngày": `calculateStreakDays(...)` hiện có; chạm dòng Chuỗi → mở `StreakCheckinModal` (QĐ 82).

## 3. Tương tác
- Chạm avatar: nhún spring + haptic Medium (giữ nguyên hành vi avatar Hồ sơ v1.0: mở ProfileModal/tab Hồ sơ).
- Chạm Pro: giữ nguyên luồng hiện tại. Chạm Settings: mở Quick Settings.

## AC
- [ ] Viền avatar 3px, bóng cứng 0 3 0, nền `#FCE3E8`, mặt heo pixel nét (PNG 4×).
- [ ] Tên không hardcode; dòng Chuỗi live theo streakStore; chạm mở StreakCheckinModal.
- [ ] 2 nút phải: dark pill "Pro" + tròn 44; đều ≥44×44, haptic khi nhấn.
- [ ] Giữ nguyên mọi handler v1.0 (chỉ thay da).