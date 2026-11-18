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
     - **Phòng ảnh / Buồng Photobooth (`anh`):** 
       - Chạm vào buồng chụp (`x: 126..170, y: 18..66`): Heo chạy lon ton đến vị trí chụp `(148, 84)`, reo *"Heo ra máy chụp ảnh nè 📸"*.
       - Nút *"Chụp ảnh"* (`#boothBtn`) nổi lên ở góc dưới khi heo đứng gần buồng chụp ($< 28\text{px}$).
       - Bấm *"Chụp ảnh"*: Buồng kéo rèm xanh che kín (`bs.closed = true`), thò 2 bàn chân heo hồng phúng phính (`#F9B8C4`), chớp flash trắng rực rỡ 600ms rồi tự động chuyển sang **Tab Camera (Tab 2)** để chụp ảnh chi tiêu thực tế!
     - **Hũ tiền / Kệ tủ (`sanh`):** Đồng xu nảy lên: *"Tích tiểu thành đại! Ví Heo Con luôn đồng hành cùng bạn 🪙"*.
     - **Chạm vào Heo:** Heo nhảy tưng bừng: *"Ủn ỉn! Heo yêu bạn nhất trần đời! ❤️"*.

---

## 4. TƯƠNG TÁC ĐIỀU HƯỚNG LIÊN TAB & PHOTOBOOTH TRANSITION

- **Từ Sân Vườn (Tab 0) Vào Nhà Heo:**
  1. Người dùng bấm vào cửa chính hoặc nút "Vào nhà".
  2. Heo dừng việc đang làm, reo *"Vào nhà thôi! 🏠"* với bóng thoại đặt gọn gàng trên sân (không che cửa).
  3. Heo bước thẳng theo trục dọc lên bậc thềm đá trước hiên nhà (`y: 54`).
  4. Cánh cửa đôi trượt mở sang 2 bên (`doorOpen: 0 -> 1`), ánh vàng ấm áp rọi ra, heo bước tiếp qua ngưỡng cửa vào trong lòng nhà (`y: 44`) rồi mới kích hoạt chuyển Tab sang **Tab 1: Nhà Heo**.
- **Từ Buồng Photobooth Phòng Ảnh (Tab 1) Sang Tab Camera (Tab 2):**
  1. Trong phòng `anh`, bấm buồng chụp hoặc nút *"📸 Heo ơi, đi chụp ảnh"*.
  2. Heo chạy tới buồng chụp $\to$ hiện nút `#boothBtn` $\to$ bấm *"Chụp ảnh"*.
  3. Rèm kéo đóng $\to$ đèn flash bừng sáng 600ms $\to$ WebView gửi `postMessage({ type: 'OPEN_CAMERA' })`.
  4. `StatsView` gọi `onNavigateToCamera()` $\to$ `index.tsx` chuyển sang Tab 2 (Camera).
- **Từ Nhà Heo (Tab 1) Ra Vườn:**
  - Nút "Ra vườn chơi với heo" ở cuối bảng phân tích hoặc nút `[🌱 Ra vườn chơi]` trên header $\to$ Gửi postMessage chuyển mượt mà về Tab 0.
- **Trưng Bày Ảnh Thực Tế (Real Photos Only, Zero Hardcode):**
  - Panel phòng ảnh hiển thị danh sách ảnh thực tế từ `transactionStore` (`photo_url` / `thumbnail_url`).
  - Nếu chưa có ảnh trong tháng: Hiển thị Empty State mời chụp ảnh, tuyệt đối không bịa đặt hoặc hardcode danh sách món giả.
- **Lược bỏ 3 tab phụ cũ:** Tab 1 hoạt động 100% như Nhà Của Heo trong prototype; mỗi căn phòng đóng vai trò là một trung tâm phân tích tài chính chuyên sâu cho danh mục tương ứng.

---

## 5. BẢNG MÀU "HỒNG HEO MƠ MỘNG PASTEL" & BỐ CỤC SÁT TRẦN

1. **Bảng màu Hồng Heo Mơ Mộng Pastel:**
   - `--screen: #FFF0F3` (Hồng pastel dịu ngọt, mơ mộng, sạch sẽ và ấm cúng).
   - `--card: #FFFFFF` (Thẻ trắng tinh khôi tương phản sắc nét với viền mực `#2B2118` và bóng đổ cứng `0 3px 0 #2B2118`).
   - Tường 6 phòng pastel tươi sáng:
     - Sảnh (`sanh`): `#FFF6E5` (Kem sảnh ấm áp)
     - Bếp (`bep`): `#FFEBD9` (Cam sữa thơm ngon)
     - Khách (`khach`): `#E4F4DC` (Cốm mint tươi mới)
     - Làm việc (`lamviec`): `#E3F2FD` (Xanh băng sáng tạo)
     - Phòng ảnh (`anh`): `#F2E7FA` (Tím lavender kỷ niệm)
     - Phòng ngủ (`ngu`): `#FCE4EC` (Hồng phấn bình an)
2. **Bố cục sát trần & Tích hợp Top Bar:**
   - Loại bỏ thanh Header tĩnh "Thống kê", đẩy không gian Nhà của Heo lên sát trần an toàn (`insets.top`).
   - Tích hợp điều khiển trực tiếp vào Top Bar:
     - Avatar chú heo 16×16 pixel
     - Tiêu đề & Subtitle: "Nhà của Heo · Tháng X · Chuỗi Y ngày"
     - Nút Tạp chí Anime ✨ (`OPEN_MAGAZINE`)
     - Nút Ẩn tiền 👁️ / 🙈 (`TOGGLE_MASK`)
     - Nút Tham quan (`toggleTour`)
3. **Đồng bộ Sân Vườn chuẩn Prototype:**
   - Nút Top-Left: `[ 🐾 Vào nhà ]` (Nút tròn icon chân heo + nút viên thuốc Vào nhà).
   - Huy hiệu Top-Right: `[ 🪙 Chuỗi X ngày / cám ]`.
   - Nút Bottom-Left: `[ Nắng · sân · đứng ngắm ]` (Chạm để đổi thời gian: Nắng $\to$ Chiều $\to$ Đêm).
   - Hoạt cảnh vào nhà 4 bước: Heo reo $\to$ Bước lên thềm $\to$ Cửa mở $\to$ Bước vào lòng nhà $\to$ Chuyển Tab.

---

## 6. KIẾN TRÚC WKWEBVIEW iOS FABRIC-SAFE & 100% OFFLINE-FIRST (QUYẾT ĐỊNH 122)

Nhằm khắc phục triệt để lỗi màn hình trơn trắng/hồng trên iOS (React Native 0.88 Fabric + WKWebView 14.0.1) khi WebView được đặt trong ScrollView đa trang:
1. **Lazy-Mount On-Screen (`isActive`):** Chỉ mount và khởi tạo WebView khi Tab 1 thực sự hiển thị trên màn hình (`isActive === true` hoặc `hasMountedOnce === true`), tránh việc WKWebView bị treo khi mount offscreen ngoài viewport.
2. **Kích Thước Pixel Số Tường Minh:** Truyền trực tiếp `boxWidth` và `boxHeight` từ `useWindowDimensions()` vào `containerStyle` và `style` của `SafeWebView` (`flex: 0`), triệt tiêu hoàn toàn lỗi Fabric không tính toán được chiều cao linh hoạt `flex: 1` của WebView wrapper.
3. **100% Offline-First System Fonts:** Gỡ bỏ hoàn toàn thẻ `<link rel="stylesheet" href="https://fonts.googleapis.com/...">` gây nghẽn vẽ giao diện khi mạng yếu/ngoại tuyến; thay bằng font hệ thống bo tròn mượt mà (`'SF Pro Rounded', 'Nunito', -apple-system`).
4. **Cố Định Source HTML Bằng `useMemo` & Cầu Nối `window.syncData`:** Cố định `source = { html: initialHtml, baseUrl: '' }`, tránh việc WKWebView bị hủy và tải lại liên tục mỗi khi re-render. Mọi cập nhật dữ liệu tài chính/trạng thái ẩn tiền được truyền qua `injectJavaScript('window.syncData(...)')` siêu tốc không chớp giật.
5. **Cơ Chế Tự Phục Hồi WebKit Process Termination:** Bổ sung `key={'pig-house-' + reloadKey}`, xử lý sự kiện `onContentProcessDidTerminate` và `onError` để tự động làm mới hoặc hiển thị giao diện phục hồi 1 chạm thân thiện.
6. **Thanh Trạng Thái (Status Bar) Tương Phản Chuẩn:** Đặt `StatusBar style="dark"` trên các tab nền sáng (Tab 0, 1, 3, 4) và `style="light"` trên Camera (Tab 2) để giờ/wifi/pin luôn hiển thị sắc nét.
