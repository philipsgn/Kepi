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

## 2. KIẾN TRÚC & HOẠT HỌA PIXEL

1. **Cầu thang gỗ nối tầng (`STAIR`):**
   - Vị trí từ `x: 76, y: 98` (Sảnh tầng 1) lên `x: 108, y: 54` (Phòng ảnh tầng 2).
   - Khi người dùng bấm chọn phòng ở tầng khác, chú heo chạy dọc theo cầu thang gỗ để di chuyển giữa 2 tầng (`stairsY(x)`).
2. **Chi tiết nội thất phòng (`room` Canvas 176×96):**
   - Nội thất đồ gỗ, thiết bị, đèn trần vẽ pixel tỉ mỉ 1:1.
   - Tranh ảnh pixel 24×24 mô phỏng các khoản chi: phở, cà phê, nồi lẩu, grab, rau củ, bánh mì, áo sơ mi, hộp quà, đồng xu vàng tiết kiệm.
   - Chú heo xuất hiện trong phòng đang chọn, tự do đi lại và biểu cảm vui vẻ.
3. **Thẻ Dữ Liệu Thực Tế Phía Dưới:**
   - Khi chọn phòng nào, thẻ chi tiết bên dưới tự động hiển thị số tiền đã chi, số món, % ngân sách của danh mục tương ứng trong tháng.
   - Người dùng có thể bấm chuyển nhanh sang các chế độ xem nâng cao: `[Cuốn Album | Phân Tích Data | Tạp Chí Anime]`.

---

## 3. TƯƠNG TÁC ĐIỀU HƯỚNG LIÊN TAB

- Từ **Sân Vườn (Tab 0)**: Bấm vào cửa chính nhà hoặc nút "Vào nhà" $\to$ Chú heo chạy tới trước cửa, cửa mở trượt sang 2 bên reo *"Vào nhà thôi! 🏠"* $\to$ Tự động chuyển sang **Tab 1: Nhà Heo**.
- Từ **Nhà Heo (Tab 1)**: Có thể bấm vào Tab `[🌱 Sân Vườn]` trên thanh điều hướng dưới cùng để quay lại sân vườn thảnh thơi.
