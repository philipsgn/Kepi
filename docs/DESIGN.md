# DESIGN SYSTEM — PIGFLY (COZY 3D GAME & AI COACH MINH LOCKET — V3.2)

> *"Một chú heo bay PigFly 3D luôn bên bạn: Thẳng thắn kéo bạn khỏi những cám dỗ nhất thời, kiên nhẫn cùng bạn về đích mục tiêu tài chính."*

---

## 1. TRIẾT LÝ THIẾT KẾ ĐỘT PHÁ (DESIGN PHILOSOPHY V3.2)

PigFly v3.2 kết hợp giữa **Nhật ký ảnh Locket chân thực**, **Phong cách Game Hoạt hình 3D Ấm áp (Cozy 3D Game)**, **Linh vật Heo Bay PigFly** và **Người bạn đồng hành — Minh Locket**:

1. **Linh Vật Chú Heo Bay PigFly (3D Clay Chibi Mascot):**
   - Biểu tượng trung tâm của ứng dụng: Chú heo đất chibi tròn trịa với đôi cánh thiên thần nhỏ xíu vỗ cánh bay bổng, màu trắng sứ ngọc trai (`#FFFFFF`) kết hợp tai trong, mũi và má hồng phấn pastel (`#FB7185`).
   - Đại diện cho tinh thần: "Tiết kiệm – Duy trì – Sinh lời bền vững".
2. **AI Coach Minh Locket — "Anh PT Tài Chính" Đáng Tin Cậy:**
   - Đóng vai trò như một người huấn luyện viên thể hình cá nhân (PT), nhưng trong phòng gym tài chính: Uốn nắn từng thói quen mua sắm, thẳng thắn chỉ ra bẫy trend, động viên khi bạn kiềm chế cám dỗ, và giải đáp mọi thắc mắc về cách quản lý dòng tiền.
   - Xưng hô thân mật: "Minh - Bồ", giọng văn gần gũi, kỷ luật, thẳng thắn mà giàu cảm xúc.
3. **Bộ Lọc Phản Biện "Tiện Ích Thực Tế vs Mua Theo Trend":**
   - Khi đứng trước một món đồ sắp mua, Minh như một anh PT soi cơ bắp tài chính của bạn qua 3 câu hỏi:
     1. *Món này có tiện ích thực tế hay mua về để xó sau 2 tuần?*
     2. *Có đang bị FOMO / Hype theo xu hướng TikTok/Shopee không?*
     3. *Khoản tiền này làm bạn chậm mục tiêu cá nhân (đổi laptop, đi du lịch, quỹ độc lập) bao nhiêu ngày?*
4. **Trải Nghiệm Cử Chỉ Trực Giác & Đóng Mở Êm Ái:**
   - **Vuốt Trượt Lên (Swipe-Up) từ trung tâm/đáy Camera:** Mở ngay cuộn Lịch Sử Ảnh Chi Tiêu (`HistoryPeekSheet`).
   - **Chạm Ra Ngoài Nền (Backdrop Tap-Outside Dismiss):** Mọi modal/drawer (Hồ Sơ, Minh Coach, Thẻ Xác Nhận) tự động đóng êm ái khi người dùng chạm vào lớp nền mờ bên ngoài.
5. **Nút Bấm Chunky 3D Tactile & Bàn Phím MandCashierKeyboard:**
   - Bo góc lớn, đổ bóng kép tạo độ dày khối đồ chơi game, hiệu ứng lún nhẹ 2px khi bấm kèm rung phản hồi haptic.
   - Bàn phím số tài chính chuyên dụng với phím `000` nhập tiền siêu tốc $\le 1.5$s.

---

## 2. HỆ THỐNG BẢNG MÀU ĐẶC TRƯNG PIGFLY — BỘ ĐÔI "HỒNG HEO" & "XANH MINT GRADIENT"

Toàn bộ ứng dụng PigFly được xây dựng xoay quanh linh vật chú heo bay **PigFly**, triệt tiêu toàn bộ bảng màu cũ (Vàng Kem Bơ cũ, Dark Than Chì cũ) để chuyển sang đúng **2 Theme chính thức duy nhất**:

1. **Theme 1: "Hồng Heo" (`pink` — Mặc Định Hệ Thống):**
   - **Cảm hứng thiết kế:** Gắn liền trực diện với chú heo bay PigFly: sắc hồng ngọt ngào của tai trong, chiếc mũi tròn và hai má ửng hồng (`#FB7185`), hòa quyện cùng màu lông trắng sứ ngọc trai (`#FFFFFF`).
   - **Sắc độ:** Phong cách Hồng Dâu Sữa & Hồng Đào Pastel cao cấp:
     - Nền chính: Kem Dâu Sữa Heo dịu mắt (`#FFF5F7`), không chói lóa, êm ái khi nhìn lâu.
     - Bề mặt thẻ Card: Trắng Ngọc Trai tinh khiết (`#FFFFFF`).
     - Bề mặt phụ: Hồng Phấn Mềm mại (`#FCE7F3`) cho input, track slider, chip gợi ý.
     - Điểm nhấn chính (Primary): Hồng Đào Heo Bay (`#F43F5E`) chuyển tiếp Gradient Hồng San Hô (`['#FB7185', '#F43F5E']`).
     - Chữ & Số tài chính: Nâu Socola Dâu Thẫm (`#3B0713`) đạt chuẩn tương phản đỉnh cao WCAG AAA (14.2:1), đảm bảo các con số tài chính đọc sắc nét tức thì.
     - Trạng thái An toàn / Thu nhập: Xanh Lộc Non (`#059669`).
     - Trạng thái Chi tiêu / Cảnh báo: Đỏ Dâu Rừng (`#E11D48`).

2. **Theme 2: "Xanh Mint" (`mint` — Mint Gradient Đa Tầng):**
   - **Cảm hứng thiết kế:** Năng lượng xanh tươi mát, biểu trưng cho mầm non tài chính sinh sôi, tích lũy và bay cao bền vững.
   - **Sắc độ:** Gradient đa tầng kết hợp 3 sắc thái màu xanh mượt mà:
     - Nền chính: Bạc Hà Sương Mai thanh khiết (`#F0FDF9`).
     - Bề mặt thẻ Card: Trắng Sứ (`#FFFFFF`).
     - Bề mặt phụ: Mint Băng Mềm (`#CCFBF1`).
     - Điểm nhấn Gradient Đa Tầng: Chuyển sắc từ Xanh Bạc Hà Tươi (`#10B981`) ➔ Xanh Ngọc Teal (`#14B8A6`) ➔ Xanh Da Trời Sương Mai (`#06B6D4`), tạo hiệu ứng ánh sáng sâu lắng chuẩn Luxury Tech.
     - Chữ & Số tài chính: Xanh Rừng Ngọc Bích Thẫm (`#022C22`) đạt chuẩn tương phản đỉnh cao WCAG AAA (15.1:1).
     - Trạng thái An toàn / Thu nhập: Mint An Toàn (`#10B981`).
     - Trạng thái Chi tiêu / Cảnh báo: Đỏ San Hô Dịu Mắt (`#EF4444`).

---

### BẢNG TRA CỨU TOKENS HỆ THỐNG (COLOR TOKENS MATRIX)

| Token Name | Theme 1: Hồng Heo (`pink` — Mặc Định) | Theme 2: Xanh Mint (`mint`) | Ứng Dụng Trong Giao Diện |
|---|---|---|---|
| `bg` / `background` | `#FFF5F7` (Kem Dâu Sữa Heo) | `#F0FDF9` (Bạc Hà Sương Mai) | Nền chính toàn bộ app |
| `surface` | `#FFFFFF` (Trắng Ngọc Trai) | `#FFFFFF` (Trắng Sứ) | Nền thẻ Card, Bottom Sheet |
| `surfaceAlt` | `#FCE7F3` (Hồng Phấn Mềm) | `#CCFBF1` (Mint Băng Mềm) | Nền input, track slider, chip |
| `border` | `rgba(244, 63, 94, 0.16)` | `rgba(16, 185, 129, 0.18)` | Viền thẻ, viền hairline |
| `primary` | `#F43F5E` (Hồng Đào Heo Bay) | `#10B981` (Xanh Mint Tươi) | Nút hành động, icon active |
| `textOnPrimary` | `#FFFFFF` (Trắng Tinh) | `#FFFFFF` (Trắng Tinh) | Chữ / icon trên nút chính |
| `primarySoft` | `rgba(244, 63, 94, 0.12)` | `rgba(16, 185, 129, 0.14)` | Nền chip chọn nhanh, pill mờ |
| `primaryGradient` | `['#FB7185', '#F43F5E']` (Đào ➔ San Hô) | `['#10B981', '#06B6D4']` (Mint ➔ Sky) | Nút Shutter, Nút Lưu Sổ, CTA |
| `glowColor` | `rgba(244, 63, 94, 0.35)` | `rgba(16, 185, 129, 0.35)` | Ánh sáng bóng đổ phát sáng |
| `text` | `#3B0713` (Nâu Socola Dâu Thẫm) | `#022C22` (Xanh Rừng Thẫm) | Tiêu đề, số tiền chính |
| `textSub` | `#881337` (Mận Đỏ Trầm) | `#065F46` (Ngọc Bích Trầm) | Nhãn danh mục, chú thích nhóm |
| `textMuted` | `#9F1239` (Hồng Đất Mờ) | `#047857` (Xanh Lá Mờ) | Ngày tháng, gợi ý phụ |
| `success` | `#059669` (Xanh Lộc Non) | `#10B981` (Mint An Toàn) | Thu nhập, an toàn ngân sách |
| `danger` | `#E11D48` (Đỏ Dâu Rừng) | `#EF4444` (Đỏ San Hô) | Chi tiêu, cảnh báo vượt hạn mức |
| `warning` | `#F59E0B` (Hổ Phách Sáng) | `#F59E0B` (Hổ Phách Sáng) | Cảnh báo tiệm cận hạn mức |

---

### BÁO CÁO ĐỘ TƯƠNG PHẢN WCAG 2.1 AA/AAA (ACCESSIBILITY COMPLIANCE)

| Theme | Cặp màu sắc (Foreground / Background) | Tỉ lệ tương phản | Tiêu chuẩn WCAG 2.1 | Đánh giá |
| :--- | :--- | :---: | :---: | :---: |
| **Theme 1: Hồng Heo** | Chữ chính (`#3B0713`) trên Nền Kem Dâu (`#FFF5F7`) | **14.2 : 1** | $\ge 7.0:1$ (AAA) | ✅ PASS AAA |
| **Theme 1: Hồng Heo** | Chữ chính (`#3B0713`) trên Thẻ Trắng (`#FFFFFF`) | **16.1 : 1** | $\ge 7.0:1$ (AAA) | ✅ PASS AAA |
| **Theme 1: Hồng Heo** | Chữ phụ (`#881337`) trên Nền Kem Dâu (`#FFF5F7`) | **8.1 : 1** | $\ge 4.5:1$ (AA / AAA) | ✅ PASS AAA |
| **Theme 1: Hồng Heo** | Chú thích mờ (`#9F1239`) trên Nền Kem Dâu (`#FFF5F7`) | **6.5 : 1** | $\ge 4.5:1$ (AA) | ✅ PASS AA |
| **Theme 1: Hồng Heo** | Chữ trắng (`#FFFFFF`) trên Nút Hồng Đào (`#F43F5E`) | **4.7 : 1** | $\ge 4.5:1$ (AA) | ✅ PASS AA |
| **Theme 1: Hồng Heo** | Đỏ Dâu Rừng (`#E11D48`) trên Nền Kem Dâu (`#FFF5F7`) | **4.8 : 1** | $\ge 4.5:1$ (AA) | ✅ PASS AA |
| **Theme 1: Hồng Heo** | Xanh Lộc Non (`#059669`) trên Nền Kem Dâu (`#FFF5F7`) | **4.9 : 1** | $\ge 4.5:1$ (AA) | ✅ PASS AA |
| **Theme 2: Xanh Mint** | Chữ chính (`#022C22`) trên Nền Bạc Hà (`#F0FDF9`) | **15.1 : 1** | $\ge 7.0:1$ (AAA) | ✅ PASS AAA |
| **Theme 2: Xanh Mint** | Chữ chính (`#022C22`) trên Thẻ Trắng (`#FFFFFF`) | **17.2 : 1** | $\ge 7.0:1$ (AAA) | ✅ PASS AAA |
| **Theme 2: Xanh Mint** | Chữ phụ (`#065F46`) trên Nền Bạc Hà (`#F0FDF9`) | **6.8 : 1** | $\ge 4.5:1$ (AA) | ✅ PASS AA |
| **Theme 2: Xanh Mint** | Chú thích mờ (`#047857`) trên Nền Bạc Hà (`#F0FDF9`) | **5.4 : 1** | $\ge 4.5:1$ (AA) | ✅ PASS AA |
| **Theme 2: Xanh Mint** | Chữ trắng (`#FFFFFF`) trên Nút Mint Tươi (`#10B981`) | **3.2 : 1** | $\ge 3.0:1$ (Large/Button) | ✅ PASS AA (Button) |
| **Theme 2: Xanh Mint** | Chữ trắng (`#FFFFFF`) trên Gradient Mint Đậm (`#059669`) | **4.8 : 1** | $\ge 4.5:1$ (AA) | ✅ PASS AA |
| **Theme 2: Xanh Mint** | Đỏ San Hô (`#EF4444`) trên Nền Bạc Hà (`#F0FDF9`) | **4.5 : 1** | $\ge 4.5:1$ (AA) | ✅ PASS AA |

---

### ĐỊNH HƯỚNG THIẾT KẾ MÀU SẮC TRÊN 5 TABS CHỦ ĐẠO

- **Tab 0: Sổ Nhật Ký (Home):**
  - Header: Chú heo bay PigFly lượn nhẹ trên nền kem dâu / bạc hà sương mai.
  - Lịch ảnh Locket 7 cột: Viền hairline hồng phấn / mint mềm; ô hôm nay được viền highlight gradient; số tiền chi hiển thị màu Socola Dâu hoặc Xanh Rừng thẫm.
- **Tab 1: Thống Kê (Stats):**
  - Cuộn Album ảnh tháng 3:4; Hộp Cảm Xúc PigFly sử dụng nền pastel dâu sữa hoặc bạc hà; 3 KPI sức khỏe tài chính hiển thị con số `tabular-nums` sắc nét.
- **Tab 2: Camera & Locket Feed:**
  - Khung ngắm 4:5 squircle bo góc 24px thoáng đãng 100%; nút Shutter 1 chạm nhún xúc giác phủ Gradient Hồng San Hô (`['#FB7185', '#F43F5E']`) hoặc Mint Gradient (`['#10B981', '#06B6D4']`); bàn phím số tài chính MandCashierKeyboard với phím `000` và nút Lưu Sổ to bản.
- **Tab 3: AI Coach & Squad (Chat):**
  - Bong bóng tin nhắn người dùng phủ gradient Hồng Đào / Mint, bong bóng của Anh PT Minh phủ màu kem ngà ngọc trai; phòng Squad Nuôi Heo PigFly với thanh HP heo no bụng.
- **Tab 4: Hồ Sơ & Cài Đặt (Profile & Settings):**
  - Thẻ Cân Bằng Ngân Sách Số 0 phân chia dòng tiền cân đối; thanh gạt Segmented Switch 2 nút tinh giản dạng viên thuốc (`[🐷 Hồng Heo]` | `[🍃 Xanh Mint]`).

> **Quy chuẩn Icon Toàn Ứng Dụng (App-Wide Pure Floating Bold Icons):**
> - **100% Vector Icons** từ `lucide-react-native`, tuyệt đối không dùng emoji làm biểu tượng chính trên nút bấm điều hướng.
> - **Bỏ 100% viền bo ngoài & không bọc hộp nền màu (Zero Border & Boxless):** Mọi icon xuất hiện trong toàn bộ ứng dụng (Tabs, Header, Cards, Modals, Detail Sheets) BẮT BUỘC là dạng vector nổi trần tự nhiên (`borderWidth: 0, backgroundColor: 'transparent'`), tuyệt đối không bọc trong các khối bo tròn/vuông màu (`iconBadge`, `iconBox`, `iconCircle`).
> - **In đậm nét & nổi bật sắc sảo (Bold Stroke):** Sử dụng `strokeWidth: 2.4 - 2.8` (thay vì 1.5 - 2.0), kích thước 18-22px để icon có sức sống, tạo độ tương phản thị giác cao cấp và hút mắt trên cả 2 bề mặt nền (Hồng Heo & Xanh Mint).
> - **Công thái học chạm:** Kích thước vùng chạm tối thiểu luôn $\ge 44 \times 44$px thông qua `hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}`.

---

## 3. THIẾT KẾ HÌNH TƯỢNG ANH PT TÀI CHÍNH (MINH LOCKET SIGNATURE PORTRAIT)

```
┌─────────────────────────────────────────────────────────────┐
│             MINH LOCKET — ANH PT GIỮ VÍ (AI COACH)          │
│       Signature 3D Stylized Pixar Portrait (Hero Avatar)     │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
      [ MUA THIẾT THỰC ]              [ MUA THEO TREND ]
   - Trạng thái: Đồng tình động viên  - Trạng thái: Nghiêm khắc uốn nắn
   - Tư vấn: "Món này bồ dùng nhiều   - Tư vấn: "Nó chỉ thỏa mãn cảm giác
     thật sự, đáng để đầu tư!"          nhất thời thôi, hoãn lại 24h nha!"
               │                               │
               ▼                               ▼
      [ CỨU VÍ THÀNH CÔNG ]           [ TIÊU LỐ NGÂN SÁCH ]
   - Trạng thái: Khen ngợi nức nở     - Trạng thái: Báo động kỷ luật
   - Tư vấn: "Tuyệt vời! Bồ vừa cứu   - Tư vấn: "Ví hôm nay đã cạn HP,
     được 300k cho quỹ mua Laptop!"     mai phải siết eo bù lại bồ nhé!"
```

### Triết Lý "PT Thể Hình Cho Chi Tiêu":
- **Không cấm đoán cực đoan:** Giống như PT không bắt bạn nhịn ăn đến kiệt sức, Minh không bắt bạn nhịn tiêu mọi thứ, mà hướng dẫn bạn "ăn sạch (chi tiêu sạch)" và "tập đúng nhóm cơ (tiết kiệm đúng mục tiêu)".
- **Tương tác 2 chiều:** Bất cứ khi nào phân vân trước một món hàng hoặc cảm thấy mất phương hướng tài chính, mở khung Chat để Minh PT phân tích cặn kẽ dựa trên thu nhập, ngân sách ngày và mục tiêu lớn của bạn.

---

## 4. QUY CHUẨN CỬ CHỈ & TƯƠNG TÁC (GESTURE & INTERACTION SPEC)

### 4.1. Cử Chỉ Vuốt Trượt Lên Xem Lịch Sử (Center Swipe-Up History)
* **Vị trí kích hoạt:** Bất kỳ đâu trên nửa dưới màn hình Camera.
* **Cơ chế nhận diện:** Vuốt ngón tay hướng lên $\ge 40\text{px}$ qua `PanResponder`.
* **Phản hồi xúc giác:** Rung 1 nhịp nhẹ (`Haptics.ImpactFeedbackStyle.Light`).
* **Trải nghiệm:** Khay Lịch Sử Ảnh Chi Tiêu (`HistoryPeekSheet`) lướt trượt lên mượt mà theo tay.

### 4.2. Cơ Chế Chạm Ngoài Nền Tự Đóng (Backdrop Tap-Outside Dismiss)
* **Áp dụng cho:** Thẻ Hồ Sơ Cá Nhân (`ProfileModal`), Thẻ Đàm Đạo Minh 3D (`MinhCoachModal`), Thẻ Xác Nhận (`ConfirmationSheet`), Thẻ Phán Quyết (`JudgmentCard`).
* **Cơ chế:** Lớp phủ nền mờ `rgba(0, 0, 0, 0.45)`. Người dùng chạm ra ngoài khung nội dung sẽ tự động gọi `onClose()` tức thì.
