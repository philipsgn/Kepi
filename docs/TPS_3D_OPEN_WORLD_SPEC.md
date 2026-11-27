# 🎮 ĐẶC TẢ CHUẨN: GÓC NHÌN THỨ 3 NHẬP VAI 3D PIXEL-ART (TPS KIỂU PUBG — QUYẾT ĐỊNH 232)

> **Phạm vi áp dụng:** Tiêu chuẩn kiến trúc & trải nghiệm nhập vai **Góc Nhìn Thứ 3 (Third-Person Perspective — TPS)** cho **toàn bộ các không gian mở bên trong** của chú Heo Mascot trong PigFly / Ví Heo Con: Quán Phở Cổ Truyền (tiên phong), Cửa Hàng Adidas Hội An, Sân Vận Động Trống Đồng FIFA, Quán Cà Phê Sài Gòn, Chùa Việt Nam, Nhà Thờ Đức Bà, Lòng Chợ Bến Thành...
> **Engine dùng chung:** [`src/components/pixel/pixelTps3dEngine.ts`](../src/components/pixel/pixelTps3dEngine.ts) (100% Canvas2D thuần JS, 0 phụ thuộc mạng/WebGL, 60fps trên iOS Fabric WKWebView, Android & Web PWA).

---

## 1. TRIẾT LÝ GÓC NHÌN THỨ 3 CHÂN THỰC (PUBG OVER-THE-SHOULDER CAMERA)

Thay vì nhìn từ trên xuống phẳng (2D top-down) gây cảm giác tách biệt như xem bản đồ, mọi không gian nội thất khi chú Heo Mascot bước vào **phải chuyển sang góc nhìn thứ 3 ngang vai / sau lưng nhân vật**:
1. **Hệ tọa độ 3D chuẩn (`X, Y, Z` tính bằng mét ảo `m`):**
   - `X`: Trục ngang (Trái `−` → Phải `+`).
   - `Y`: Trục cao (Mặt sàn `Y = 0`, trần nhà `Y = 3.2m..4.5m`).
   - `Z`: Trục chiều sâu (Vỉa hè ngoài cửa `Z < 0`, ngưỡng cửa `Z = 0`, đi sâu vào trong quán/bếp `Z > 0`).
2. **Vị trí Camera sau lưng chú Heo (`Third-Person Follow & 360° Orbit`):**
   - Khoảng cách tiêu chuẩn sau lưng chú Heo: `camDist = 3.6m .. 4.4m` (tự động thu gần mượt khi lùi sát tường để không xuyên tường).
   - Chiều cao camera: `camHeight = 2.2m .. 2.7m`, góc nhìn nghiêng nhẹ hướng xuống tầm mắt chú Heo (`pitch ≈ -0.32 rad .. -0.45 rad`), tạo phối cảnh sâu 3D cực kỳ chân thực: thấy rõ lưng/tai/đuôi xoắn của chú Heo ở tiền cảnh, sàn gạch bông kéo sâu vào chân trời, bàn ghế nổi khối 3D và con người đi lại ngang tầm mắt.
   - **Xoay tự do 360°:** Người dùng vuốt ngang/dọc màn hình để xoay góc nhìn 360° xung quanh chú Heo — xoay ra phía trước sẽ thấy thẳng gương mặt đáng yêu của chú Heo!
3. **Sắp xếp chiều sâu chuẩn vật lý (Painter's Algorithm / Z-Sorting):**
   - Toàn bộ khối 3D (bàn, ghế, quầy bếp, nồi phở, cánh cửa xoay bản lề) và thực thể sống (Chú Heo, Đầu bếp, Nhân viên phục vụ, Khách hàng) đều được sắp xếp từ **xa nhất → gần camera nhất** theo tọa độ không gian camera (`cz`) trước khi vẽ, đảm bảo chú Heo đi sau bàn bị bàn che đúng thực tế và đi trước bàn nổi bật hoàn toàn.
4. **Quy chuẩn Interior-Only TPS 3D & Trần Nhà Kín 100% (Zero Exterior, Zero Exposed Sky — QĐ 236):**
   - **Loại bỏ hoàn toàn cảnh mặt tiền & bối cảnh ngoài trời** bên trong màn TPS 3D (vì mặt tiền, đại lộ xe cộ và sông Bạch Đằng đã có đầy đủ trên Hub Banner Tab Khám phá).
   - Khi chú Heo ở Tab Khám phá chạm vào cửa bất kỳ quán/cửa hàng nào → **xuất hiện ngay tại ngưỡng cửa 2 cánh đang mở hướng thẳng vào toàn bộ nội thất 3D bên trong** (giảm 50% đa giác, siêu mượt 60fps, **0% mảng trời xanh mất liên kết ở cả 360°**).
   - Toàn bộ 4 bức tường + trần nhà kín 100% (trần gỗ lim + xà gồ + quạt trần quay + đèn thả ánh vàng vintage 90s); khi xoay ra sau lưng là cửa gỗ kính mờ ấm áp với nút `[🚪 Ra lại Đại Lộ Sài Gòn]`.
5. **Quy chuẩn Giao Diện Tối Giản Không Thanh Tab Card Phía Trên (Clean Fullscreen Interior — QĐ 236):**
   - **Bỏ hẳn thanh Tab card phía trên** để khung hình 3D thoáng đãng 100%; người dùng tự do chạm sàn đi (Raycast Tap-to-Walk) + vuốt xoay 360° + dùng nút Context Action Pill gọn ở cạnh dưới.
6. **Quy chuẩn Hybrid 3D Room + Depth-Scaled Pixel Art Sprites (QĐ 234–236):**
   - **Cấm dùng hộp 3D thô cứng** cho xoong nồi, tô phở, nguyên liệu nấu ăn, ấm trà hay gia vị — bắt buộc vẽ bằng **Sprite Pixel Art tả thực tự co giãn theo chiều sâu `cz`** (`drawPhoPotSprite3D`, `drawPhoBowlSprite3D` đầy đủ đũa tre & muỗng sứ, `drawBatTrangTeapotSprite3D`, `drawKitchenIngredientsSprite3D` thịt bò tươi sống vân mỡ, `drawCeilingFan3D`, `drawVintageLamp3D`).
   - **Đệm va chạm an toàn (`>= 0.65m`):** Cách tường và quầy ít nhất `0.65m` để chú Heo không bao giờ bị kẹt hay lún thân vào góc tường.

---

## 2. CHUẨN ĐIỀU KHIỂN NHẬP VAI TỐI GIẢN (ZERO-JOYSTICK MOBILE-FIRST)

Để giữ màn hình điện thoại thoáng đãng 100%, tuyệt đối **không đặt Virtual Joystick che khuất khung hình**:
- **Chạm điểm để đi (`3D Floor Raycast Tap-to-Walk`):**
  - Khi người dùng chạm nhanh (`move < 8px`) vào bất kỳ vị trí nào trên sàn 3D, cánh cửa, ghế trống hoặc khu vực bếp → hàm `unprojectFloorTap(sx, sy)` bắn tia chiếu 3D tìm tọa độ `(wx, 0, wz)` chính xác trên mặt sàn.
  - Vẽ vòng sáng mục tiêu 3D (`target ring`) trên sàn → chú Heo quay mặt mượt mà về hướng đó và bước đi kèm nhịp chân & bóng tiếp xúc.
  - Hỗ trợ bổ sung phím `W / A / S / D` hoặc phím mũi tên cho người dùng trải nghiệm trên Web desktop.
- **Vuốt màn hình để xoay Camera 360° (`Drag-to-Orbit`):**
  - Khi kéo tay (`move >= 8px`), camera xoay mượt theo hướng vuốt (`camYaw` xoay 360°, `camPitch` giới hạn an toàn `[-0.68, -0.14]` rad).
- **Nút Tương Tác Ngữ Cảnh Thông Minh (`Context Action Pill`):**
  - Chỉ xuất hiện nổi gọn gàng ở cạnh dưới màn hình khi chú Heo đứng trong bán kính tương tác của vật thể (ví dụ: `[Mở cửa vào quán]`, `[Ngồi xuống ghế]`, `[Gọi Phở Tái Nạm]`, `[Ăn Phở]`, `[Đứng dậy]`, `[Xem đầu bếp nấu]`, `[Ra vỉa hè]`).

---

## 3. CHUẨN SPRITE CHÚ HEO ĐA GÓC NHÌN (MULTI-ANGLE PIG SPRITE)

Nhân vật chú Heo Mascot giữ nguyên bảng màu hồng phấn + viền nâu mực `#2B2118` + khe tiền vàng `#F4B93B` từ prototype, nhưng được dựng đủ **4 góc nhìn theo góc tương đối giữa `pigYaw` và `camYaw`**:
1. **Góc Sau Lưng (`back` — mặc định kiểu PUBG):** Thấy sống lưng hồng, khe nhét tiền xu vàng trên lưng, 2 tai vểnh, đuôi xoắn nhỏ lắc lư khi đi bộ và 4 chân bước so le.
2. **Góc Nghiêng Trái / Phải (`side-left` / `side-right`):** Dáng heo 24×20 chuẩn Tab Vườn nhìn ngang khi chú Heo đi cắt ngang màn hình.
3. **Góc Chính Diện (`front`):** Khi người dùng xoay camera ra phía trước mặt chú Heo — thấy rõ đôi mắt đen chớp chớp, chiếc mũi hồng 2 lỗ và nụ cười tươi.
4. **Tư Thế Ngồi (`seated`):** Khi chú Heo ngồi trên ghế nhựa/ghế gỗ — thân heo nâng cao ngang mặt bàn, 2 chân trước gác lên mép bàn sẵn sàng ăn uống!

---

## 4. CHUẨN VÒNG ĐỜI NHẬP VAI THỰC TẾ (REALISTIC ROLEPLAY LOOP)

Mọi không gian mở nâng cấp lên chuẩn TPS 3D đều bắt buộc hỗ trợ **4 trụ cột tương tác thực tế**:
1. **Mở cửa bước vào từ bên ngoài:** Bắt đầu ngay ngoài vỉa hè trước cửa quán/cửa hàng; cửa có bản lề xoay góc thật (`0° → 95°`) khi chú Heo hoặc khách NPC mở ra bước vào.
2. **Tương tác nội thất & dịch vụ thật:** Tìm ghế trống ngồi xuống, gọi món / thử đồ / xem trận đấu → kết nối trực tiếp vào **máy trạng thái FSM của nhân viên & đầu bếp** (nhân viên chạy ra nhận đơn, báo bếp, bưng món ra đặt ngay trước mặt chú Heo).
3. **Tự do khám phá hậu trường (Backstage Exploration):** Cho phép chú Heo đi vào khu vực bếp mở, phòng thay đồ, quầy pha chế... đứng sát quan sát đầu bếp nấu ăn, nhân viên làm việc ở góc nhìn ngang tầm mắt.
4. **Thế giới sống động tự vận hành (Living NPC FSM):** Khách hàng tự mở cửa đi vào, tìm bàn, chờ món, ăn uống, đứng dậy rời đi; nhân viên tự bưng món và dọn bàn 100% logic.

---

## 5. LỘ TRÌNH ÁP DỤNG CHUẨN TPS 3D TOÀN APP
| Thứ tự | Không gian | Trạng thái | Ghi chú |
| :---: | :--- | :---: | :--- |
| **1** | **Quán Phở Cổ Truyền** (`phoTps3dScene.ts`) | **Đã triển khai (QĐ 232)** | Tiên phong chuẩn TPS 3D PUBG: Mở cửa 2 cánh ➔ Ngồi bàn ➔ Gọi & Ăn Phở ➔ Vào bếp xem Đầu bếp nấu |
| 2 | **Cửa Hàng Adidas Hội An** | Kế hoạch tiếp theo | Mở cửa kính Hội An, dạo giữa kệ giày/áo 3D, thử áo trước gương |
| 3 | **Sân Vận Động Trống Đồng FIFA** | Kế hoạch tiếp theo | Đi xuyên đường hầm 3D ra đường pitch, đứng sát biên xem trận 11v11 |
| 4 | **Quán Cà Phê / Chùa / Nhà Thờ / Chợ Bến Thành** | Kế hoạch tiếp theo | Nâng cấp đồng bộ dùng chung `pixelTps3dEngine.ts` |
