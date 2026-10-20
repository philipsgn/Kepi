# DESIGN SYSTEM — VÍ LOCKET (COZY 3D GAME & AI COACH MINH LOCKET — V3.1)

> *"Một người bạn chí cốt 3D luôn bên bạn: Thẳng thắn kéo bạn khỏi những cám dỗ nhất thời, kiên nhẫn cùng bạn về đích mục tiêu tài chính."*

---

## 1. TRIẾT LÝ THIẾT KẾ ĐỘT PHÁ (DESIGN PHILOSOPHY V3.1)

Ví Locket v3.1 kết hợp giữa **Nhật ký ảnh Locket chân thực**, **Phong cách Game Hoạt hình 3D Ấm áp (Cozy 3D Game)** và **Người bạn đồng hành 3D chân thực — Minh Locket**:

1. **AI Coach Minh Locket — "Anh PT Tài Chính" Đáng Tin Cậy:**
   - **Hình tượng Chân Dung Signature 3D Stylized:** Thiết kế ảnh chân dung 3D Stylized cao cấp (phong cách hoạt hình Pixar/Disney ấm áp), khắc họa một nam thanh niên 25-28 tuổi điển trai, ánh mắt chân thành, nụ cười đồng hành đáng tin cậy trong trang phục thu đông ấm áp.
   - **Persona "Anh PT Giữ Ví" (Personal Trainer Tài Chính):**
     - Đóng vai trò như một người huấn luyện viên thể hình cá nhân (PT), nhưng trong phòng gym tài chính: Uốn nắn từng thói quen mua sắm, thẳng thắn chỉ ra bẫy trend, động viên khi bạn kiềm chế cám dỗ, và giải đáp mọi thắc mắc về cách quản lý dòng tiền.
     - Xưng hô thân mật: "Minh - Bồ", giọng văn gần gũi, kỷ luật, thẳng thắn mà giàu cảm xúc.
2. **Bộ Lọc Phản Biện "Tiện Ích Thực Tế vs Mua Theo Trend":**
   - Khi đứng trước một món đồ sắp mua, Minh như một anh PT soi cơ bắp tài chính của bạn qua 3 câu hỏi:
     1. *Món này có tiện ích thực tế hay mua về để xó sau 2 tuần?*
     2. *Có đang bị FOMO / Hype theo xu hướng TikTok/Shopee không?*
     3. *Khoản tiền này làm bạn chậm mục tiêu cá nhân (đổi laptop, đi du lịch, quỹ độc lập) bao nhiêu ngày?*
3. **Phòng Đàm Đạo & Chat Trực Tiếp 2 Chiều Cùng Minh PT:**
   - **Thẻ Kỷ Luật Hôm Nay:** Đánh giá nhanh số tiền đã chi, số tiền đã cứu và tiến độ mục tiêu cá nhân.
   - **Khung Chat 2 Chiều Thông Minh (Gemini Engine):** Người dùng có thể nhắn tin hỏi han, tâm sự về chi tiêu bất cứ lúc nào, hoặc bấm các nút câu hỏi 1-chạm:
     - *"Minh ơi, có nên mua món này không?"*
     - *"Lỡ tiêu lố ngân sách hôm nay rồi thì khắc phục sao?"*
     - *"Lên giáo án kỷ luật tài chính tuần này cho tui đi!"*
     - *"Mẹo săn sale không viêm màng túi."*
4. **Trải Nghiệm Cử Chỉ Trực Giác & Đóng Mở Êm Ái:**
   - **Vuốt Trượt Lên (Swipe-Up) từ trung tâm/đáy Camera:** Mở ngay cuộn Lịch Sử Ảnh Chi Tiêu (`HistoryPeekSheet`).
   - **Chạm Ra Ngoài Nền (Backdrop Tap-Outside Dismiss):** Mọi modal/drawer (Hồ Sơ, Minh Coach, Thẻ Xác Nhận) tự động đóng êm ái khi người dùng chạm vào lớp nền mờ bên ngoài.
5. **Nút Bấm Chunky 3D Tactile:**
   - Bo góc lớn, đổ bóng kép tạo độ dày khối đồ chơi game, hiệu ứng lún nhẹ 2px khi bấm kèm rung phản hồi haptic.

---

## 2. BẢNG MÀU COZY GAME & 3 CHẾ ĐỘ CHỦ ĐẠO (SÁNG / TỐI / MÁT — "LUXURY TECH WOW")

Ứng dụng hỗ trợ 3 tùy chọn phong cách màu sắc độc lập đạt hiệu ứng "WOW" cao cấp:
1. **Chế Độ Sáng — Vàng Kem Bơ Hà Nội Thu Đông (`light`):**
   - Nền kem bơ ấm áp (`#FAF6EC`), bề mặt ngà ngọc trai (`#FFFDF9`), điểm nhấn Nắng Thu Hà Nội (`#E59844`), màu an toàn Cốm Non Làng Vòng (`#7E9F80`), màu chi Ngói Rêu Phố Cổ (`#C86D51`).
2. **Chế Độ Tối — Xám Than Phối Xanh Mint Đậm (`dark`):**
   - Nền xám than đêm đông OLED (`#0E1620`), thẻ than chì đậm (`#16202C`), điểm nhấn Xanh Mint sáng rực rỡ (`#2DD4BF`), chữ phụ Slate 400 (`#94A3B8`), nút CTA Mint Gradient (`#2DD4BF` ➔ `#0D9488`).
3. **Chế Độ Mát — Fresh Blue-Mint Bạc Hà Sương Mai (`cool`):**
   - Nền bạc hà ngọc mai tươi mát (`#F0FDF4`), thẻ tuyết ngọc trai (`#FFFFFF`), bề mặt mềm (`#DCFCE7`), điểm nhấn Xanh Mint tươi ngọt (`#059669`), phối cùng Xanh Da Trời (`#38BDF8`).

| Token Name | Sáng (Vàng Kem Bơ Thu Đông) | Tối (Dark Mint Xám Than) | Mát (Fresh Blue-Mint) | Ứng Dụng |
|---|---|---|---|---|
| `background` / `bg` | `#FAF6EC` (Kem Bơ) | `#0E1620` (Xám Than Đêm Đông) | `#F0FDF4` (Bạc Hà Sương Mai) | Nền chính ứng dụng |
| `surface` | `#FFFDF9` (Ngà Ngọc Trai) | `#16202C` (Than Chì Bề Mặt) | `#FFFFFF` (Tuyết Ngọc Trai) | Nền thẻ card |
| `surfaceAlt` | `#F5EEDB` (Kem Bơ Ấm) | `#1E2C3D` (Xám Than Phụ) | `#DCFCE7` (Bạc Hà Mềm) | Nền phụ, input, segment |
| `primary` | `#E59844` (Nắng Thu Hà Nội) | `#2DD4BF` (Mint Sáng Đậm) | `#059669` (Mint Tươi Ngọt) | Điểm nhấn chính |
| `textOnPrimary` | `#1C1812` (Đen Than Ấm) | `#0E1620` (Xám Than Đậm) | `#FFFFFF` (Trắng Tuyết) | Chữ trên nút chính |
| `primaryGradient` | `['#E59844', '#D4882B']` | `['#2DD4BF', '#0D9488']` | `['#059669', '#38BDF8']` | Gradient Nút CTA & Highlight |
| `glowColor` | `rgba(229, 152, 68, 0.35)` | `rgba(45, 212, 191, 0.35)` | `rgba(5, 150, 105, 0.35)` | Hiệu ứng viền & bóng phát sáng |
| `text` | `#1C1812` (Đen Than) | `#F8FAFC` (Trắng Sáng) | `#064E3B` (Ngọc Rừng Thẫm) | Chữ tiêu đề / số chính |
| `textSub` | `#5A4E3D` (Nâu Trầm) | `#94A3B8` (Slate 400) | `#047857` (Xanh Ngọc) | Chữ phụ, mục nhóm |
| `textMuted` | `#665C4E` (Nâu Xám Dịu) | `#7E8E9F` (Slate 350) | `#334155` (Slate Thẫm) | Chú thích mờ, ngày tháng |
| `border` | `rgba(229, 152, 68, 0.20)` | `rgba(45, 212, 191, 0.16)` | `rgba(5, 150, 105, 0.18)` | Viền thẻ & nút bấm |
| `success` | `#7E9F80` (Cốm Non) | `#2DD4BF` (Mint Tươi) | `#059669` (Mint An Toàn) | Trạng thái thu nhập, an toàn |
| `danger` | `#C86D51` (Ngói Rêu) | `#F87171` (San Hô Neon) | `#DC2626` (Đỏ Tươi Rõ) | Cảnh báo, vượt ngân sách |

---

### BÁO CÁO ĐỘ TƯƠNG PHẢN WCAG 2.1 AA (ACCESSIBILITY COMPLIANCE)

| Theme | Cặp màu sắc (Foreground / Background) | Tỉ lệ tương phản | Tiêu chuẩn WCAG 2.1 | Đánh giá |
| :--- | :--- | :---: | :---: | :---: |
| **Theme 1 (Sáng)** | Chữ chính (`#1C1812`) trên Nền Kem (`#FAF6EC`) | **16.4 : 1** | $\ge 4.5:1$ (AA / AAA) | ✅ PASS AAA |
| **Theme 1 (Sáng)** | Chữ chính (`#1C1812`) trên Thẻ (`#FFFDF9`) | **17.4 : 1** | $\ge 4.5:1$ (AA / AAA) | ✅ PASS AAA |
| **Theme 1 (Sáng)** | Chữ phụ (`#5A4E3D`) trên Nền Kem (`#FAF6EC`) | **7.5 : 1** | $\ge 4.5:1$ (AA / AAA) | ✅ PASS AAA |
| **Theme 1 (Sáng)** | Chú thích mờ (`#665C4E`) trên Nền Kem (`#FAF6EC`) | **6.1 : 1** | $\ge 4.5:1$ (AA / AAA) | ✅ PASS AAA |
| **Theme 1 (Sáng)** | Chữ trên nút (`#1C1812`) trên Nút Vàng (`#E59844`) | **7.5 : 1** | $\ge 4.5:1$ (AA / AAA) | ✅ PASS AAA |
| **Theme 1 (Sáng)** | Cốm Non (`#7E9F80`) trên Nền Camera Đêm (`#0E1620`) | **6.2 : 1** | $\ge 4.5:1$ (AA) | ✅ PASS AA |
| **Theme 1 (Sáng)** | Ngói Rêu (`#C86D51`) trên Nền Kem (`#FAF6EC`) | **3.4 : 1** | $\ge 3.0:1$ (Large/UI) | ✅ PASS AA (UI) |
| **Theme 2 (Tối)** | Chữ chính (`#F8FAFC`) trên Nền Xám Than (`#0E1620`) | **17.4 : 1** | $\ge 4.5:1$ (AA / AAA) | ✅ PASS AAA |
| **Theme 2 (Tối)** | Chữ chính (`#F8FAFC`) trên Thẻ Than Chì (`#16202C`) | **15.3 : 1** | $\ge 4.5:1$ (AA / AAA) | ✅ PASS AAA |
| **Theme 2 (Tối)** | Chữ phụ Slate (`#94A3B8`) trên Nền Xám Than (`#0E1620`) | **7.1 : 1** | $\ge 4.5:1$ (AA / AAA) | ✅ PASS AAA |
| **Theme 2 (Tối)** | Chú thích Slate (`#7E8E9F`) trên Nền Xám Than (`#0E1620`) | **5.4 : 1** | $\ge 4.5:1$ (AA) | ✅ PASS AA |
| **Theme 2 (Tối)** | Chữ xám than (`#0E1620`) trên Nút Mint (`#2DD4BF`) | **9.8 : 1** | $\ge 4.5:1$ (AA / AAA) | ✅ PASS AAA |
| **Theme 2 (Tối)** | Báo động đỏ (`#F87171`) trên Nền Xám Than (`#0E1620`) | **6.6 : 1** | $\ge 4.5:1$ (AA / AAA) | ✅ PASS AAA |
| **Theme 2 (Tối)** | Mint an toàn (`#2DD4BF`) trên Nền Xám Than (`#0E1620`) | **9.8 : 1** | $\ge 4.5:1$ (AA / AAA) | ✅ PASS AAA |
| **Theme 3 (Mát)** | Chữ chính (`#064E3B`) trên Nền Bạc Hà (`#F0FDF4`) | **9.3 : 1** | $\ge 4.5:1$ (AA / AAA) | ✅ PASS AAA |
| **Theme 3 (Mát)** | Chữ phụ (`#047857`) trên Nền Bạc Hà (`#F0FDF4`) | **5.2 : 1** | $\ge 4.5:1$ (AA) | ✅ PASS AA |
| **Theme 3 (Mát)** | Chú thích mờ (`#334155`) trên Nền Bạc Hà (`#F0FDF4`) | **8.6 : 1** | $\ge 4.5:1$ (AA / AAA) | ✅ PASS AAA |
| **Theme 3 (Mát)** | Chữ trắng (`#FFFFFF`) trên Nút Mint Đậm (`#047857`) | **5.5 : 1** | $\ge 4.5:1$ (AA) | ✅ PASS AA |
| **Theme 3 (Mát)** | Chữ trắng (`#FFFFFF`) trên Nút Mint Tươi (`#059669`) | **3.8 : 1** | $\ge 3.0:1$ (Large text) | ✅ PASS AA (Button) |
| **Theme 3 (Mát)** | Báo động đỏ (`#DC2626`) trên Nền Bạc Hà (`#F0FDF4`) | **4.6 : 1** | $\ge 4.5:1$ (AA) | ✅ PASS AA |

> **Quy chuẩn Icon Toàn Ứng Dụng (App-Wide Pure Floating Bold Icons):**
> - **100% Vector Icons** từ `lucide-react-native`, tuyệt đối không dùng emoji làm biểu tượng chính.
> - **Bỏ 100% viền bo ngoài & không bọc hộp nền màu (Zero Border & Boxless):** Mọi icon xuất hiện trong toàn bộ ứng dụng (Tabs, Header, Cards, Modals, Detail Sheets) BẮT BUỘC là dạng vector nổi trần tự nhiên (`borderWidth: 0, backgroundColor: 'transparent'`), tuyệt đối không bọc trong các khối bo tròn/vuông màu (`iconBadge`, `iconBox`, `iconCircle`).
> - **In đậm nét & nổi bật sắc sảo (Bold Stroke):** Sử dụng `strokeWidth: 2.4 - 2.8` (thay vì 1.5 - 2.0), kích thước 18-22px để icon có sức sống, tạo độ tương phản thị giác cao cấp và hút mắt trên mọi bề mặt nền (Sáng / Tối / Mát).
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
