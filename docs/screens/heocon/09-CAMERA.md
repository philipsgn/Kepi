# 📷 09 — CAMERA: KHUNG NGẮM + SHUTTER + REVIEW + KEYBOARD (re-skin)

> **Screen-unit:** Tab 2. **LUỒNG 3-in-1 (Shutter/VietQR/Notification Pill), quay clip 3s, MandCashierKeyboard GIỮ NGUYÊN** (`docs/screens/CAMERA.md`). Chỉ thay da.

## 1. Khung ngắm (Viewfinder)
- Nền trang: khi theme heocon → **Kem Sàn `#F6EEDC`** (thay gradient điện ảnh; pink/mint giữ gradient).
- Khung ngắm 4:5: **viền 3px ink bo 28 + bóng cứng 0 4 0** (thay squircle hairline).
- Icon Flash/chuyển camera: nổi trần 22px stroke 2.6, hitSlop 44 (QĐ 66/84 — giữ nguyên).

## 2. Cụm Shutter
- Đĩa Shutter: **nền Vàng Cám `#F4B93B`, viền 3px ink, bóng cứng 0 4 0**; onPress chụp (haptic Heavy — giữ nguyên), onLongPress quay 3s + vòng tiến độ.
- Vòng tiến độ quay clip: stroke ink 3px trên track kem `#D9C9A4`.
- Nút Thư viện / Lật: `NeoButton round` 44 nền `#FFFBF1` viền 3px.
- ModeSwitchPill: pill viền 3px ink; mục chọn nền ink chữ kem.
- Pinch-to-zoom + badge `0.5x–3.0x`: badge nền mực chữ kem pill (QĐ 75).

## 3. Smart Pill (tự ghi NH) + Fast Category
- Pill thông báo NH: nền mực `#2B2118` chữ kem viền 3px bóng `0 3 0` — text giữ nguyên `⚡ TPBank: Đã tự động ghi -48.000đ (Highlands)`.
- Dải danh mục: `NeoChip` bo 18; chip chọn = Vàng Cám/ink.

## 4. Màn Review sau chụp (`LocketReviewModal`)
- Sheet nền `#FFFBF1`, viền trên 3px ink bo 28 (grabber ink 2px).
- Ảnh 4:5: viền 3px ink bo 20; tag danh mục = pill nền mực; công tắc riêng tư hội bạn = pill viền 3px (giữ QĐ 83).
- Con số tiền: **38 Baloo 800 tabular + "đ" 60% gạch chân** (thay 36px mảnh — chuẩn số tiền Heo Con).
- `MandCashierKeyboard`: phím nền `#FFFBF1` viền 2px ink bo 8 (giống `.seg`); phím `000` & cột `⌫` nền surfaceAlt; **nút LƯU = Vàng Cám chữ ink viền 3px, chiếm 3 hàng**.
- Cặp nút đáy `[✕ chụp lại]` / `[✓ lưu]`: tròn 44 viền 3px — ✕ nền surface, ✓ nền Vàng Cám (QĐ 75).

## 5. Heo phản ứng sau lưu (tùy chọn Phase sau, tái dùng engine vườn)
- Lưu khoản < hạn mức → heo mini `happy` 0.9s + bubble "「Món」 −45.000đ"; vừa vượt → heo `sad` + "Ối, lố hạn mức rồi".

## AC
- [ ] Luồng 3-in-1 & tốc độ ghi ≤ 2–3s không đổi; chỉ thay da.
- [ ] Shutter vàng cám viền 3px; keyboard phím viền 2px ink bo 8; LƯU vàng cám 3 hàng.
- [ ] Số tiền 38 tabular + DongMark; review sheet viền trên 3px ink bo 28.
- [ ] Camera vẫn hoạt động 100% offline; không lưu STK; EXIF sạch (giữ nguyên).