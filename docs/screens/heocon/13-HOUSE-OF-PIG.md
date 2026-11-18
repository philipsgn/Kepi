# 🏠 13 — STATS·HOUSE: NHÀ CỦA HEO (MẶT CẮT 2 TẦNG 6 PHÒNG & NỘI THẤT PIXEL)

> **Screen-unit:** Hero Section trên đầu Tab Thống Kê (Tab 1), biểu tượng icon `Home` trên thanh Tab Bar.
> **Nguồn gốc đồ họa:** Port 1:1 từ `prototype/Nhà heo con.html`. Khớp hoàn toàn với Mặt tiền 2 tầng ngoài Sân Vườn.

---

## 1. BỐ CỤC KHÔNG GIAN 2 TẦNG 6 PHÒNG

Mặt cắt ngôi nhà gồm 2 tầng và 6 phòng chức năng (Canvas 176×108):

| Tầng | Phòng | Tên & Icon | Danh mục Tài chính tương ứng | Mô tả nội thất & Tranh treo tường |
|---|---|---|---|---|
| **Tầng 2** | `lamviec` | Phòng làm việc 💻 | Chi **Đi lại** (Grab, xăng xe...) | Bàn máy tính, ghế đỏ, tranh xe Grab, kệ sách |
| **Tầng 2** | `anh` | Phòng ảnh 🖼️ | **Nhật ký ảnh** (Cuốn Album) | Khung tranh ảnh kỷ niệm các món ăn, hóa đơn |
| **Tầng 2** | `ngu` | Phòng ngủ 🛏️ | **Tiết kiệm & Cứu ví** | Giường êm gối hồng, đèn ngủ vàng, cửa sổ trăng sao |
| **Tầng 1** | `bep` | Bếp 🍳 | Chi **Ăn uống** (Cơm, phở, cafe) | Bếp nấu ăn, nồi niêu bốc khói, tranh bát phở/cafe |
| **Tầng 1** | `sanh` | Sảnh chính 🚪 | **Tổng quan ngân sách** | Thảm đỏ đón khách, tủ kệ giày, cửa chính ra sân |
| **Tầng 1** | `khach` | Phòng khách 🛋️ | Chi **Mua sắm** (Quần áo, quà tặng) | Ghế sofa hồng, bàn trà, chậu hoa cây cảnh |

---

## 2. KIẾN TRÚC & HOẠT HỌA PIXEL V2 (SPRITE CUTE & KHÔNG KHÍ NOEL)

1. **Sprite Chú Heo Siêu Dễ Thương (24×20 pixel):**
   - Sử dụng thuật toán vẽ `shape()` và bảng màu `PAL` chuẩn:
     - Viền mực nâu đậm `#4B2B21`, thân hồng `#F9B8C4`, mảng tối `#F08DA4` và bóng bụng `#D9758D`.
     - Má hồng phúng phính `#EE90A6`, vòng chuông cổ vàng `#F4B93B`.
     - Mắt to tròn long lanh có đốm sáng trắng `#FFF`, mắt híp cung tròn khi vui `happy`, chớp mắt tự nhiên `blink`.
     - Tai rung rinh nảy theo bước chân waddle 4 chân, đuôi xoắn ngoe nguẩy.
     - Khi vui: Nhảy cẫng `happy jump` thả tim đỏ `#E0452B` bay lơ lửng.
     - Khi ngủ: Cuộn tròn đầu gục mềm mại, bóng chữ `Z z z` bay dần lên cao.
2. **Không Khí Noel Ấm Cúng Trong 6 Phòng:**
   - **Phòng khách (`khach`):** Cây thông Noel mini với chùm đèn LED 3 màu nhấp nháy chuyển sắc đỏ/vàng/xanh, lò sưởi gạch có lửa đỏ cam bập bùng.
   - **Phòng ngủ (`ngu`):** Bít tất Noel đỏ viền trắng treo đầu giường, cửa sổ đêm có tuyết rơi li ti.
   - **Phòng bếp (`bep`):** Nồi súp nóng hổi bốc 3 làn khói mờ ảo, lò nướng bánh Giáng sinh.
   - **Phòng làm việc (`lamviec`):** Màn hình PC phát ánh sáng cyan nhấp nháy, cốc cà phê bốc khói, lịch Noel đỏ.
   - **Phòng ảnh (`anh`):** Giá vẽ gỗ có gắn nơ đỏ, 5 khung ảnh kỷ niệm rực rỡ.
   - **Sảnh (`sanh`):** Thảm đỏ hoa văn Giáng Sinh, vòng nguyệt quế treo cửa.
3. **Cầu thang gỗ nối tầng (`STAIR`):**
   - Vị trí từ `x: 76, y: 98` (Sảnh tầng 1) lên `x: 108, y: 54` (Phòng ảnh tầng 2).
   - Khi người dùng bấm chọn phòng ở tầng khác trên `#map`, chú heo chạy dọc theo cầu thang gỗ để di chuyển giữa 2 tầng (`stairsY(x)`).

---

## 3. HỆ THỐNG TƯƠNG TÁC TOUCH ACTIONS 2 CẤP ĐỘ

1. **Cấp độ 1 (Mặt cắt 2 tầng `#map`):**
   - Chạm vào bất kỳ phòng nào trên mặt cắt $\to$ Chú heo leo cầu thang chạy sang phòng đó và đồng bộ phòng chi tiết bên dưới.
2. **Cấp độ 2 (Phòng chi tiết `#room`):**
   - Chạm trực tiếp vào các đồ vật trong phòng để kích hoạt hành động đặc biệt:
     - **Giường ngủ (`ngu`):** Heo nhảy lên giường ngủ khò khò, chữ `Z z z` bay lên: *"Khò khò... Giường êm quá! Noel ngủ ngon lành 💤"*.
     - **Nồi súp (`bep`):** Heo chạy lại hít hà, pose ăn ngon miệng: *"Thơm nức mũi! Nấu ăn tại nhà tiết kiệm được bao nhiêu tiền 🍲"*.
     - **Bàn làm việc / PC (`lamviec`):** Màn hình chớp sáng, heo ngồi gõ phím: *"Cày deadline săn thưởng cuối năm sắm quà Noel nào! 💻"*.
     - **Sofa / Cây thông (`khach`):** Đèn Noel lấp lánh, heo nhảy vui vẻ thả tim: *"Phòng khách ấm áp ghê! Noel này ở nhà chill là nhất 🎄"*.
     - **Tường ảnh (`anh`):** Heo ngắm nghía tranh ảnh: *"Từng bức ảnh ghi dấu những bữa ăn ngon và kỷ niệm đẹp 📸"*.
     - **Hũ tiền / Kệ tủ (`sanh`):** Đồng xu nảy lên: *"Tích tiểu thành đại! Ví Heo Con luôn đồng hành cùng bạn 🪙"*.
     - **Chạm vào Heo:** Heo nhảy tưng bừng: *"Ủn ỉn! Heo yêu bạn nhất trần đời! ❤️"*.

---

## 4. TƯƠNG TÁC ĐIỀU HƯỚNG LIÊN TAB

- Từ **Sân Vườn (Tab 0)**: Bấm vào cửa chính nhà hoặc nút "Vào nhà" $\to$ Chú heo chạy tới trước cửa, cửa mở trượt sang 2 bên reo *"Vào nhà thôi! 🏠"* $\to$ Tự động chuyển sang **Tab 1: Nhà Heo**.
- Từ **Nhà Heo (Tab 1)**: Nút "Ra vườn chơi" trên header hoặc Tab `[🌱 Sân Vườn]` trên thanh điều hướng để quay lại sân vườn thảnh thơi.
