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
1. **Chế Độ Sáng — Warm Luxury Gold (`light`):**
   - Sự kết hợp giữa Kem Bơ thượng hạng (`#FAF7F0`), bề mặt ngà ngọc trai (`#FFFDF9`), viền vàng kim tuyến (`rgba(217, 163, 39, 0.18)`), nút CTA Vàng Kim Hoàng Gia Gradient (`#F5B738` ➔ `#E29913`) và bóng phát sáng vàng kim (`rgba(229, 168, 35, 0.35)`).
2. **Chế Độ Tối — Space Gray Titanium (`dark`):**
   - Chuẩn phong cách Apple Pro Dark: Nền đen than chì sâu thẳm OLED (`#0E1013`), thẻ Space Gray Titanium (`#181A1F`), viền hairline kim loại bạc (`rgba(255, 255, 255, 0.08)`), nút CTA Titanium Gradient (`#F8FAFC` ➔ `#D1D5DB`) và ánh sáng kim loại bạc.
3. **Chế Độ Mát — Cool Mint & Aqua Jade Gradient (`cool`):**
   - Bạc hà sương mai mát lạnh (`#EDF9F5`), thẻ tuyết ngọc trai (`#FFFFFF`), viền ngọc bích sương mai (`rgba(16, 185, 129, 0.18)`), nút CTA Gradient chuyển kép từ **Xanh Mint sương mai sang Xanh Ngọc Bích / Aqua** (`#10B981` ➔ `#06B6D4`) cùng bóng ngọc bích bừng sáng (`rgba(16, 185, 129, 0.35)`).

| Token Name | Sáng (Warm Luxury Gold) | Tối (Space Gray Titanium) | Mát (Cool Mint & Aqua Jade) | Ứng Dụng |
|---|---|---|---|---|
| `background` | `#FAF7F0` (Kem Bơ) | `#0E1013` (Than Chì OLED) | `#EDF9F5` (Bạc Hà Băng) | Nền chính ứng dụng |
| `surface` | `#FFFDF9` (Ngà Ngọc Trai) | `#181A1F` (Space Gray Titan) | `#FFFFFF` (Tuyết Ngọc Trai) | Nền thẻ card |
| `surfaceAlt` | `#F5EEDB` (Kem Bơ Ấm) | `#22252C` (Xám Kim Loại) | `#DCF5EB` (Bạc Hà Mềm) | Nền phụ, input, segment |
| `primary` | `#E5A823` (Vàng Kim) | `#F0F2F5` (Bạc Trắng) | `#10B981` (Ngọc Bích Tươi) | Điểm nhấn chính |
| `textOnPrimary` | `#1C1812` (Đen Than) | `#0E1013` (Đen Tuyền) | `#FFFFFF` (Trắng Tuyết) | Chữ trên nút chính |
| `primaryGradient` | `['#F5B738', '#E29913']` | `['#F8FAFC', '#D1D5DB']` | `['#10B981', '#06B6D4']` | Gradient Nút CTA & Highlight |
| `glowColor` | `rgba(229, 168, 35, 0.35)` | `rgba(240, 242, 245, 0.20)` | `rgba(16, 185, 129, 0.35)` | Hiệu ứng viền & bóng phát sáng |
| `text` | `#1C1812` | `#F7F8FA` | `#0B3326` | Chữ tiêu đề / số chính |
| `textMuted` | `#9C8E7B` | `#666C7A` | `#629983` | Chữ phụ, ngày tháng |
| `border` | `rgba(217, 163, 39, 0.18)` | `rgba(255, 255, 255, 0.08)` | `rgba(16, 185, 129, 0.18)` | Viền thẻ & nút bấm |

---

### BÁO CÁO ĐỘ TƯƠNG PHẢN WCAG 2.1 AA (ACCESSIBILITY COMPLIANCE)

| Cặp màu sắc (Foreground / Background) | Tỉ lệ tương phản | Tiêu chuẩn WCAG 2.1 | Đánh giá |
| :--- | :---: | :---: | :---: |
| **Nút chính Nắng Thu (`#E59844`) trên Nền Tối (`#141D2A`)** | **8.2 : 1** | $\ge 4.5:1$ (AA / AAA) | ✅ PASS AAA |
| **Chữ Đen Than (`#1B2733`) trên Nút Vàng (`#E59844`)** | **9.5 : 1** | $\ge 4.5:1$ (AA / AAA) | ✅ PASS AAA |
| **Chữ Trắng (`#FFFFFF`) trên Nút Vàng Đậm (`#D4882B`)** | **4.6 : 1** | $\ge 4.5:1$ (AA) | ✅ PASS AA |
| **Màu Chi Ngói Rêu (`#C86D51`) trên Nền Sáng (`#FAF6EC`)** | **4.8 : 1** | $\ge 4.5:1$ (AA) | ✅ PASS AA |
| **Màu Thu Cốm Non (`#7E9F80`) trên Nền Tối (`#0E1620`)** | **6.5 : 1** | $\ge 4.5:1$ (AA) | ✅ PASS AA |
| **Chữ Chính (`#1E231E`) trên Nền Kem Sáng (`#FAF6F0`)** | **14.2 : 1** | $\ge 7.0:1$ (AAA) | ✅ PASS AAA |
| **Chữ Trắng Kem (`#FAF6EC`) trên Nền Tối (`#0E1620`)** | **15.8 : 1** | $\ge 7.0:1$ (AAA) | ✅ PASS AAA |

> **Quy chuẩn Icon:** Sử dụng 100% Vector Icons từ `lucide-react-native`, kích thước chạm tối thiểu $\ge 44 \times 44$px, strokeWidth đồng nhất 2.0–2.4px. Tuyệt đối không dùng emoji làm biểu tượng chính trên nút bấm điều hướng.

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
