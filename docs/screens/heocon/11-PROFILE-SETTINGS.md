# 👤 11 — PROFILE & SETTINGS: HỒ SƠ + CÀI ĐẶT + THEME 2-WAY LIGHT/DARK (re-skin)

> **Screen-unit:** Tab 4 + màn `/(main)/settings`. **Logic thẻ/khóa bảo mật/danh mục GIỮ NGUYÊN** (`docs/screens/PROFILE.md`, QĐ 54/65/66, QĐ 152, QĐ 154, QĐ 155, QĐ 156).

## 1. Tab Hồ Sơ (QĐ 152, QĐ 153, QĐ 154, QĐ 155 & QĐ 156)
| Phần tử | Re-skin |
|---|---|
| Banner Pixel "Góc làm việc của heo" | `ProfileDeskBanner.tsx` 176×80 bo 22 viền 3px ink bóng 0 4 0; bàn gỗ sồi, sàn gỗ, tường kem sọc; **Cửa sổ ngắm Tòa nhà Bitexco (Việt Nam)** thuần túy là khung cảnh nghệ thuật pixel trang trí theo giờ thực (bãi đáp trực thăng tầng 52 vươn ra, đèn beacon nhấp nháy, tự động đổi Ngày / Hoàng hôn / Đêm, **không hiện bong bóng chữ khi chạm** để tránh gây phân tâm - QĐ 157); **Heo đất hạ xuống cy=48 tiếp xúc vững chãi trên mặt bàn y=54** (hết lơ lửng); **Chú heo chuẩn Pixel-Art-Mascot 24×20** (`drawPigSprite`) đồng bộ với Vườn và Game (chớp mắt, vẫy đuôi, nhảy cẫng); tờ lịch nhảy ngày thực tế có lửa streak; các hotspots tương tác bong bóng thoại 3s (QĐ 152, 153, 155, 156, 157) |
| Thanh Quick Jump | `ProfileQuickJumpBar.tsx`: **Bộ 4 Neo-Pills Pixel Art** `[ 💰 Ngân sách ]`, `[ 🎯 Mục tiêu ]`, `[ 📁 Danh mục ]`, `[ 🎨 Giao diện ]` (icon vector pixel sinh động, viền 2px, bóng 2px 0-blur, không còn nút thừa `Trung Tâm Heo Con ›`) (QĐ 153, 163) |
| Thẻ Đầu Trang danh tính | `ProfileIdentityCard.tsx` bo 22 viền 3px mực `#2B2118` bóng cứng 0 4 0; avatar heo PigFly; tên hiển thị dùng `Baloo2_800ExtraBold` căn giữa (lược bỏ dòng chữ thừa `Heo chủ nhân`); **Nút bút chì đổi tên nâng cấp thành Neo-Badge tròn 30×30px viền 2px mực nền pastel (`#FFF4CC` / `#FCE7F3`) đồng bộ với nút [+] ở Goals** (QĐ 154, 163, 164) |
| Dải 2 chỉ số tóm tắt (QĐ 156) | **Chuỗi ghi (ngày) · Đã lưu (món)**; Lược bỏ hoàn toàn cột "Đã giữ lại" và logic backend `savedMoney`; dải 2 ô rộng rãi thoáng mắt; số Baloo2_800ExtraBold tabular; icon nổi trần (QĐ 64, 154, 156) |
| Thẻ Cân Bằng Ngân Sách Số 0 | `BudgetSettingsCard.tsx` bo 22 viền 3px mực bóng 4px; tiêu đề `CÂN BẰNG NGÂN SÁCH` dùng `Baloo2_800ExtraBold`; **Công thức 30 ngày cơ sở** kết hợp Rollover 100% hàng ngày (đã ẩn dòng công thức tính toán rườm rà dưới Split Bar - QĐ 163); **Ô nổi bật 'Hôm nay tiêu được'** (`Baloo2_800ExtraBold`, Xđ/ngày, cảnh báo âm `#E0452B`); **Thanh Split Bar 10 ô 3 màu** (Cố định `#F28C28`, Tích lũy `#5E9A57`, Được tiêu `#F9B8C4`) kết nối trực tiếp với 3 cột số liệu; **rail trượt PanResponder xúc giác**; số tabular (QĐ 152, 154, 156, 163) |
| Thẻ Mục Tiêu | `GoalSectionCard.tsx` bo 22 viền 3px mực bóng 4px; tiêu đề `MỤC TIÊU CỦA BẠN` dùng `Baloo2_800ExtraBold`; nút thêm mục tiêu tròn vàng viền mực; tên mục tiêu và số tiền dùng `Baloo2_800ExtraBold`; thanh tiến độ `SegmentBar10` (10 ô viền 2px, fill Xanh Lá `#5E9A57` hoặc Vàng Cám `#F4B93B`) (QĐ 152, 154) |
| Thẻ Danh Mục Thu & Chi | `CategorySettingsCard.tsx` bo 22 viền 3px mực, bóng 4px; hộp icon vuông cam pastel 48×48px viền mực 2.5px; tiêu đề `DANH MỤC THU & CHI` dùng `Baloo2_800ExtraBold`; phụ đề tối giản `{X} mục Chi · {Y} mục Thu` (lược bỏ chữ "đang hoạt động" - QĐ 163) (QĐ 154, 163) |
| Mục Giao Diện (Theme) | **Tập trung hoàn toàn về Cài Đặt (QĐ 165):** Bỏ thẻ Giao diện ở cuối Tab Hồ Sơ; chạm pill `[ 🎨 Giao diện ]` trên Quick Jump sẽ chuyển hướng mở ngay Cài Đặt; hiển thị chuẩn 2 tùy chọn `[ Kem ]` và `[ Hồng ]` (QĐ 154, 156, 160, 163, 164, 165) |
| Chip danh mục / preset % | `NeoChip` bo 18; chọn = Vàng Cám |

## 2. Màn Cài Đặt (`SettingsView`) — QĐ 165 & QĐ 186
- **Chuẩn Neo-Brutalist Pixel Art 100%:** Toàn bộ thẻ nhóm bo 22px, viền đặc 3px mực (`#2B2118` / `#3B0713`), bóng cứng 0-blur 4px, font `Baloo2_800ExtraBold` cho tiêu đề và `Nunito` 700 cho các dòng.
- **Nhóm Bảo Mật & Quyền Truy Cập (QĐ 186):**
  - **Ẩn số tiền:** Làm mờ số tiền nhạy cảm.
  - **Cho phép Máy ảnh (Camera):** Đồng bộ trạng thái quyền thật của OS, bấm bật xin quyền OS hoặc mở Cài đặt điện thoại (`Linking.openSettings()`).
  - **Cho phép Vị trí hiện tại (GPS):** Đồng bộ trạng thái quyền Location thật của OS, bấm bật/tắt linh hoạt hoặc mở Cài đặt điện thoại.
  - **Tự gắn vị trí khi lưu chi ở tab Chụp:** Chuyển từ màn Quán Quen về đây; cho phép tự động đính kèm vị trí GPS thật + tên đường/quận thật khi lưu khoản chi từ Tab Chụp (0 hardcode tọa độ).
  - Tự động cập nhật lại trạng thái quyền khi người dùng quay lại ứng dụng (`AppState` = `'active'`).
- Nút Back [←]: Neo-Badge tròn 36×36px, bo 18px viền 2px mực nền pastel.
- Dòng Giao diện: Hiển thị nhãn tóm tắt siêu ngắn gọn `Kem` / `Hồng`.
- Universal Modal Bottom Sheet: Bo trên 28px viền đặc 3px mực, nền `#F6EEDC` / `#FFF5F7`, nút đóng [X] Neo-Badge tròn 30px viền 2px, nút Xong Vàng Cám `#F4B93B` bo 16px viền 2.5px mực font `Baloo2_800ExtraBold`.
- Footer: Cập nhật nhận diện thương hiệu `PigFly v4.5 (Build 54) • Heo Con Neo-Brutalist`.

## 3. Hệ 2 Theme Chuẩn 2.0 (`ThemeSettingsCard.tsx`) — QĐ 160
- **Loại bỏ hoàn toàn Xanh Mint (`mint`)**: Không phù hợp nhận diện linh vật Heo Hồng của app.
- Segmented pill **2 lựa chọn hòa quyện**: `[🐷 Heo Con Vàng Nâu]` (`heocon`, MẶC ĐỊNH) · `[🌸 Hồng Heo Pastel]` (`pink`).
- Pill viền 2px ink; mục chọn nền ink chữ kem hoặc vàng cám; `Haptics.selectionAsync()`; lưu `vi_locket_theme_mode` (`heocon|pink`).
- `heocon`: Nền Kem Sàn `#F6EEDC`, Thẻ `#FFFBF1`, Viền Nâu Mực `#2B2118` 3px, Nút Vàng Cám `#F4B93B`, Gradient Nút `['#F7CA65', '#EEA828']`, Mascot Hồng Phấn `#F9B8C4`.
- `pink`: Nền Kem Dâu Sữa Heo `#FFF5F7`, Thẻ `#FFFFFF`, Viền Nâu Socola Dâu `#3B0713` 3px, Hồng Đào Heo Bay `#F43F5E`, Gradient Nút `['#FB7185', '#F43F5E']`.
- Gradient Pastel Nhẹ (~90% màu phẳng) tạo độ sâu xúc giác êm ái cho Nút bấm và Thẻ Hero mà vẫn giữ nguyên viền cứng 3px mực và bóng cứng 0-blur.
- Mô tả ngắn: "Nền kem sàn, viền nâu mực, vàng cám ấm" / "Kem dâu sữa, hồng heo prototype, socola thẫm".

## 4. Trạng thái & a11y
- Ẩn tiền: giữ nguyên CSDL logic; số trong thẻ → `••••`.
- Dòng disabled (chưa có data): opacity .5, không haptic.
- Tất cả row ≥ 44×44; nhãn 12px overline chỉ dùng khi 800 + ls .16em.

## 5. Quy Chuẩn Subtab & Modal Neo-Brutalist Heo Con (QĐ 158)
- **Modal Cân Bằng Ngân Sách (`BudgetSettingsCard.tsx`):** Container bo trên 28px viền 3px ink, nền `#F6EEDC` / `#121A16`, tiêu đề `Baloo2_800ExtraBold`, 3 Card viền 3px mực nền `#FFFBF1` bóng 4px 0-blur, thumb vàng cám `#F4B93B` viền mực 2.5px.
- **Chi Tiết & Thêm/Sửa Mục Tiêu (`GoalDetailModal.tsx` & `GoalEditModal.tsx`):** Container bo trên 28px viền 3px ink; thay thế toàn bộ `ProgressBar` trơn bằng `SegmentBar10` (10 ô pixel neo-brutalist); thẻ mục tiêu viền 3px mực bóng 4px; badge Runway ETA; ô nhập và slider viền 2.5px mực; nút Lưu vàng cám `#F4B93B` viền 3px ink.
- **Quản Lý & Tạo/Sửa Danh Mục (`CategoryManagementSheet.tsx` & `CategoryFormModal.tsx`):** Container bo trên 28px viền 3px ink; segmented switch `[Chi Tiêu]` vs `[Thu Nhập]` nền `#F6EEDC` tab active vàng cám viền 2px mực; thẻ danh mục viền 2.5px mực nền `#FFFBF1` bóng 3px; live preview badge viền 2.5px; grid icon vector và palette chọn màu viền mực 2px.

## AC
- [ ] Theme 3-way hoạt động; migration cũ không crash; mặc định heocon khi mới cài.
- [ ] Cân bằng ngân sách: drag 0–100% mượt 60fps (QĐ 47); thumb vàng cám viền 3px.
- [ ] Mục tiêu: SegmentBar10 khớp tiến độ thật; số tabular.
- [ ] Mọi modal bo 28 viền trên 3px; nút nguy hiểm double-confirm giữ nguyên.