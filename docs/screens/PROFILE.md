# 📋 ĐẶC TẢ MÀN HÌNH: HỒ SƠ (PROFILE.MD)

> **Mã màn hình:** `PROFILE` (Tab 5, Index 4 trong thanh điều hướng 5 trang)  
> **Tên màn hình:** Hồ Sơ (Cá Nhân Hóa, Mục Tiêu & Cài Đặt Dữ Liệu)  
> **Trạng thái:** Chờ Chủ Dự Án Duyệt (Giai đoạn A)  
> **Phiên bản:** 1.0  
> **Lần cập nhật cuối:** 2026-10-02  

---

## 1. Mục Tiêu & Người Dùng
- **User Story:** Là một người dùng quản lý tài chính cá nhân bằng Ví Locket, tôi muốn **có một nơi duy nhất để thiết lập mục tiêu tương lai, khai báo thu nhập - chi phí cố định, tùy biến tính cách của Anh Minh AI, và toàn quyền kiểm soát dữ liệu/quyền riêng tư**, để ứng dụng vận hành chuẩn xác theo hoàn cảnh thực tế của riêng tôi.
- **Mục tiêu sản phẩm:**
  - **Cá nhân hóa tài chính:** Biến các con số vô hồn thành câu chuyện cá nhân thông qua Mục tiêu 4 trường (Mục đích, Số tiền, Hạn chót, Lý do) và Đơn vị quy đổi yêu thích (ly cà phê, bát phở, cốc trà sữa).
  - **Thiết lập công thức chuẩn:** Cung cấp đầu vào (Thu nhập - Chi phí cố định) để các trang Home, Thống kê, Camera và Chat tự động tính toán đồng bộ hạn mức "Hôm nay tiêu được".
  - **Toàn quyền dữ liệu & Quyền riêng tư:** Cho phép ẩn tiền toàn app (`••••`), xóa toàn bộ dữ liệu một chạm và xóa tài khoản in-app theo quy chuẩn bắt buộc của Apple Store Review.
- **Tiêu chí thành công đo được (Success Metrics):**
  1. Người dùng cập nhật mục tiêu/chi cố định $\rightarrow$ Trang Home và Thống kê cập nhật tức thì trong < 100ms.
  2. Bật công tắc "Ẩn tiền" $\rightarrow$ 100% số tiền tại cả 5 trang chuyển thành `••••` không lộ bất kỳ con số nào.
  3. Đạt chuẩn Apple Store Review Guideline 5.1.1(v) về nút Xóa tài khoản in-app với luồng xác thực 2 bước an toàn.

---

## 2. Wireframe Chữ (ASCII Wireframe)

```text
┌────────────────────────────────────────────────────────┐
│ HỒ SƠ                                              [⚙️]│ (Icon Setting nổi trần)
├────────────────────────────────────────────────────────┤
│ ┌ THẺ ĐẦU TRANG: NGƯỜI ĐỒNG HÀNH ─────────────── [✏️] ─┐ │ (Icon đổi tên sát góc trên phải)
│ │  ┌────┐                                            │ │
│ │  │ 🐷 │  Hoàng Long (Avatar PigFly Chibi)                               │ │
│ │  └────┘  [ ☁️ Liên kết Google ] (khi ở Vào Ngay)   │ │
│ │          hoanglong@gmail.com   (khi đã đăng nhập)  │ │
│ │  ┌──────────────┬──────────────┬────────────────┐  │ │
│ │  │ 12 ngày      │ 640.000 đ    │ 42 món         │  │ │
│ │  │ Chuỗi ghi    │ Đã giữ lại   │ Đã chụp        │  │ │
│ │  └──────────────┴──────────────┴────────────────┘  │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌ 1. CÂN BẰNG NGÂN SÁCH (Tóm tắt) ──────────── [🎛️] ──┐ │ (Icon Scale 20px nổi trần, fit vừa vặn chữ 15.5px)
│ │ • Hạn mức: 280.000 đ / ngày (~ 8 🧋 Ly trà sữa)     │ │ (Đã xóa dòng 'Chạm để điều chỉnh...')
│ │ • Thu nhập: 15.000.000 đ • Cố định: 4.500.000 đ    │ │
│ │ • Tích lũy: 20% (2.100.000 đ) • Chi tiêu: 80%       │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌ 2. MỤC TIÊU CỦA BẠN ─────────────────────── [+] ───┐ │ (Icon Target 19px nổi trần, fit vừa vặn chữ 14px)
│ │ [Mục tiêu tích lũy tháng]         1.4tr/2.1tr (67%)│ │
│ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░                    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌ 3. QUẢN LÝ DANH MỤC THU & CHI ─────────────── [ > ] ──┐ │ (Icon FolderTree 21px nổi trần, fit vừa vặn chữ 15px)
│ │ 8 danh mục chi tiêu • 4 danh mục thu nhập          │ │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ [←] CÀI ĐẶT                                            │ (Màn hình slide_from_right)
├────────────────────────────────────────────────────────┤
│ ┌ 1. TÀI KHOẢN & ĐỒNG BỘ ─────────────────────────────┐ │
│ │ • Liên kết Google [hoanglong@gmail.com / Đăng nhập] │ │
│ └────────────────────────────────────────────────────┘ │
│ ┌ 2. TRỢ LÝ & CÁ NHÂN HÓA ───────────────────────────┐ │
│ │ • HLV Anh Minh [Cân bằng • Bạn bè]             [ > ] │
│ │ • Giao diện Theme [Tự động theo máy]           [ > ] │
│ └────────────────────────────────────────────────────┘ │
│ ┌ 3. QUYỀN RIÊNG TƯ & BẢO MẬT ───────────────────────┐ │
│ │ • Ẩn số tiền toàn app                  [ [O] Switch] │
│ │ • Khóa Face ID / PIN                       [Sắp có]  │
│ └────────────────────────────────────────────────────┘ │
│ ┌ 4. TIỆN ÍCH & TÍCH HỢP ────────────────────────────┐ │
│ │ • Màn hình khóa Widget                         [ > ] │
│ │ • Tự động ghi thông báo ngân hàng              [ > ] │
│ │ • Quét mã VietQR                               [ > ] │
│ └────────────────────────────────────────────────────┘ │
│ ┌ 5. DỮ LIỆU & QUẢN TRỊ ─────────────────────────────┐ │
│ │ [ 🗑️ Xóa toàn bộ dữ liệu nhật ký ]                   │
│ │ [ ⚠️ Xóa tài khoản vĩnh viễn (Apple Review) ]        │
│ │ [ 🚪 Đăng xuất ]                                      │
│ │                Ví Locket v1.0.0 (Build 54)           │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

---

## 3. Cấu Trúc Khối Giao Diện Chi Tiết (Component Hierarchy & Specs)

### 3.1. Thẻ Đầu Trang: Người Đồng Hành (`ProfileIdentityCard.tsx`)
- **Tối giản hóa tối đa theo chuẩn Senior UI/UX Designer:**
  - Bỏ 100% các từ ngữ rườm rà như *"Lưu trên máy này"*, *"Sao lưu"*, loại bỏ dải banner `nudgeBanner` choán diện tích.
  - **Nút pill "Liên kết Google" tinh gọn, vừa vặn (`googlePillBtn`):** Khi người dùng ở chế độ "Vào Ngay" (`isGuest === true`), hiển thị một nút pill nhỏ gọn bo tròn dưới tên `[ ☁️ Liên kết Google ]` với nền mờ nhạt ấm áp (`height: 24px, paddingHorizontal: 8px`), không chiếm nhiều diện tích, tạo cảm giác hoàn thiện, trang nhã. Khi đã đăng nhập, tự động chuyển về hiển thị Email.
  - **Nút bút chì đổi tên [✏️] đặt sát góc trên bên phải:** Không đặt chen chúc cạnh tên người dùng; thay vào đó bố trí độc lập ở góc trên bên phải của Thẻ Người đồng hành (`position: 'absolute', top: 16, right: 16`), dạng vector icon nổi trần không viền hộp, hỗ trợ `hitSlop` $\ge 44 \times 44$px.
  - Vẫn duy trì cổng Đăng nhập / Liên kết Google trong Nhóm 1 của Màn hình Cài Đặt ([SettingsView.tsx](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/src/components/views/SettingsView.tsx)).
- **Bố cục thẻ gọn gàng, thanh lịch:**
  - Avatar khối tròn mềm mại phẳng hoàn toàn không viền + Tên người dùng / Biệt danh (16px bold).
  - Dải 3 chỉ số tóm tắt (3-Stat Mini Strip): Nền trơn không viền bo ngoài (`borderWidth: 0`), các icon `Flame` (Chuỗi ghi), `ShieldCheck` (Đã giữ lại), `ShoppingBag` (Món đã lưu) hiển thị dạng vector nổi trần thanh mảnh (không viền bo hộp tròn, nền trong suốt), tăng kích thước vừa vặn 16px đồng bộ tuyệt đối với các icon khác trên tab.

### 3.2. Khối Cân Bằng Ngân Sách (Ưu Tiên Đặt Trên Mục Tiêu — `BudgetSettingsCard.tsx`)
- Đặt ngay trên khối Mục tiêu tài chính để người dùng xác định dòng tiền thu nhập tháng và chi phí sinh hoạt trước.

### 3.3. Khối Mục Tiêu Của Bạn — Chỉ Giữ Tích Lũy Tháng & Nút [+] Thêm Mục Tiêu (`GoalSectionCard.tsx`)
- **Thẻ chính trên Tab Hồ Sơ:**
  - Bỏ hoàn toàn hiển thị "Mục tiêu dài hạn" trên bề mặt thẻ để tối giản hóa thị giác.
  - Chỉ hiển thị duy nhất **Mục tiêu tích lũy tháng (%)** (số tiền thực tế chốt theo hạn mức ngày / định mức tháng và thanh ProgressBar 8px).
  - Header có icon `Target` + `Mục tiêu của bạn`, bên phải là **icon `[+]`** (`Plus` icon).
- **Phân lập luồng chạm:**
  - *Chạm thân thẻ:* Mở **Bottom Sheet Chi Tiết Mục Tiêu (`GoalDetailModal.tsx`)** để xem chi tiết tháng và toàn bộ danh sách các mục tiêu dài hạn đã tạo.
  - *Chạm icon `[+]`:* Mở thẳng **Bottom Sheet Thêm Mục Tiêu Mới (`GoalEditModal.tsx`)**.

### 3.4. Form Thêm / Sửa Mục Tiêu Mới — Tự Động Tính Hạn Hoàn Thành (`GoalEditModal.tsx`)
- **Thiết kế tối ưu công năng, triệt tiêu gánh nặng nhập liệu:**
  1. *Tên mục tiêu:* Ô nhập văn bản (VD: Mua MacBook Pro M4, Xe mới, Quỹ dự phòng...).
  2. *Số tiền cần tích lũy:* Ô nhập tiền trực tiếp (có suffix "đ") + Thanh trượt phi tuyến tính mượt mà (loại bỏ hoàn toàn chips chọn nhanh 5tr, 10tr, 20tr... để form tuyệt đối tinh gọn).
  3. *Hạn hoàn thành (Ngày có thể đạt):* **Hệ thống tự động tính toán live** dựa trên số tiền cam kết tích lũy hàng tháng $M_{\text{save}}$ và cơ chế tuần tự Waterfall (nếu có mục tiêu trước chưa hoàn thành thì tính nối tiếp).
  4. *Loại bỏ hoàn toàn:* Không bắt người dùng nhập ngày hạn chót thủ công, bỏ hẳn trường "Lý do / Ý nghĩa".

### 3.5. Xóa Bỏ Hoàn Toàn "Lương Giờ & Giờ Lao Động" Khỏi Toàn Bộ Hệ Thống
- Khối "Lương giờ & Giờ lao động" trên Tab Hồ Sơ và các quy đổi giờ lao động tại màn Chụp ảnh / Giá thật được loại bỏ triệt để nhằm giữ cho trải nghiệm tài chính thuần túy, tinh gọn, không gây rối mắt.

### 3.4. Khối Cân Bằng Ngân Sách: Thẻ Tóm Tắt & Bottom Sheet Chỉnh Sửa Chuyên Dụng (`BudgetSettingsCard.tsx`)
Áp dụng triệt để nguyên tắc **Tối Giản Hóa, Progressive Disclosure (Hiển thị lũy tiến) & Khắc Phục Xung Đột Cử Chỉ Vuốt Tab (Horizontal Tab Pager Gesture Conflict Resolution)**:
- **Nguyên nhân cốt lõi:** Ứng dụng Kepi sử dụng cấu trúc điều hướng 4 trang bằng `ScrollView horizontal pagingEnabled` ở cấp gốc ([app/(main)/index.tsx](file:///c:/Users/Asus/Documents/AI/KEPI/Kepi/app/%28main%29/index.tsx)). Khi đặt các thanh trượt PanResponder ngang (như thanh trượt Thu nhập, Chi phí cố định, Bộ chia tỷ lệ) trực tiếp trên trang Hồ sơ, cử chỉ kéo ngang của ngón tay lập tức bị `ScrollView` phân trang ngang cấp cha can thiệp/đánh cắp, làm khung hình toàn Tab bị trượt lắc qua lại giữa các Tab (chuyển sang Tab Chat).
- **Giải pháp triệt để bằng Native Modal / Bottom Sheet:**
  - Đưa toàn bộ trình chỉnh sửa trượt vào bên trong một `Modal transparent animationType="slide"` độc lập.
  - Về mặt kiến trúc native, React Native `Modal` tạo ra một cửa sổ (Window / Root View Controller) hoàn toàn tách biệt khỏi hệ thống cây phân cấp view của `ScrollView horizontal pagingEnabled`. Nhờ đó, thao tác kéo ngang trên slider bị cô lập 100%, bộ cuộn Tab bên dưới hoàn toàn không nhận được bất kỳ cử chỉ chạm nào.
  - Khi người dùng kéo trượt chỉnh sửa giá tiền, **chỉ có con trượt (thumb/bar) của thanh giá tiền di chuyển, khung hình Tab giữ cố định tuyệt đối**.
- **Chế độ Mặc định — Thẻ Tóm Tắt (Summary Card Mode trên Hồ Sơ):**
  - Hiển thị ở trạng thái tĩnh (Read-only), sang trọng với phong cách Hà Nội Thu Đông.
  - **Dòng Spotlight nổi bật:** Hạn mức chi tiêu mỗi ngày `... đ / ngày` kèm nhãn quy đổi đơn vị yêu thích (`~ 8 ly trà sữa`).
  - **Lưới 3 chỉ số then chốt (3-Column Metrics Grid):**
    - `Thu nhập tháng`: Hiển thị định dạng tiền tệ rút gọn / chuẩn VND (hỗ trợ `•••• đ` khi bật Ẩn tiền).
    - `Chi cố định`: Tổng tiền các khoản cố định kèm số lượng khoản `(N khoản)`.
    - `Tích lũy`: Tỷ lệ % và số tiền tích lũy mục tiêu.
  - **Nút hành động "Chỉnh sửa ngân sách" / Chạm vào thẻ:** Thiết kế nút kính mờ hoặc chạm trực tiếp toàn thẻ với xúc giác `Haptics.impactAsync(Light)` $\rightarrow$ Kích hoạt mở Bottom Sheet.
- **Chế độ Chỉnh sửa — Bottom Sheet Chuyên Dụng (Edit Bottom Sheet Mode):**
  - Mở dạng Bottom Sheet trượt từ đáy màn hình chiếm khoảng 88% chiều cao thiết bị, có thanh vuốt (drag handle) trang nhã.
  - Chứa toàn bộ bộ điều khiển trượt mượt mà (PanResponder 60fps với `onPanResponderTerminationRequest: () => false`):
    - *Thanh trượt Thu nhập hàng tháng (Income Slider):* Dải phi tuyến tính `0 - 300tr+`, hỗ trợ gõ trực tiếp và mốc chọn nhanh.
    - *Quản lý Chi phí cố định nhiều khoản (Multi-item Fixed Costs):* Chip gợi ý nhanh, ô nhập tiền tập trung và thanh trượt mini `0 - 30tr+`.
    - *Hero Card Cân Bằng Ngân Sách Số 0 (Zero-Based Splitter):* Thanh trượt Bi-Color `0% - 100%` điều chỉnh phân bổ Chi tiêu vs Tích lũy.
    - *Bộ chọn Đơn vị quy đổi yêu thích (Favorite Unit Pill Selector):* Trà sữa, Cà phê, Tô phở.
  - **Thanh ghim đáy (Sticky Bottom Actions):** Nút chính `[Lưu thay đổi]` (màu vàng nắng `#E59844`, haptic `Medium`) và nút phụ `[Hủy / Đóng]` giúp người dùng an tâm điều chỉnh mà không sợ bấm nhầm hoặc trượt tab ngoài ý muốn.

### 3.4. Kiến Trúc Màn Hình Cài Đặt Hệ Thống (`SettingsView.tsx` — Phong Cách iOS Grouped Cells)
Toàn bộ các thiết lập hệ thống được trình bày dưới dạng các hàng gạch bo góc (Inset Grouped Rows), hiển thị tóm tắt cấu hình hiện tại và chỉ mở Bottom Sheet chi tiết khi chạm vào:
- **Nhóm 1: Trợ Lý & Cá Nhân Hóa**
  - *Huấn luyện viên Anh Minh:* Hiển thị tóm tắt `[Cân bằng • Bạn bè]`, chạm vào mở Bottom Sheet chọn Tone thẳng thắn và Cách xưng hô (`CoachSettingsModal`).
  - *Giao diện Theme:* Hiển thị nhãn tóm tắt `[Tự động theo máy]` / `[Sáng]` / `[Tối]`, chạm vào mở Bottom Sheet đổi Theme (`ThemeSettingsModal`).
- **Nhóm 2: Quyền Riêng Tư & An Toàn**
  - *Ẩn số tiền toàn ứng dụng:* Công tắc Switch toggle trực tiếp ở bên phải hàng, phản hồi xúc giác `impactAsync(Light)`, đổi ngay lập tức toàn app.
  - *Khóa Face ID / PIN:* Hàng thông tin với huy hiệu `[Sắp ra mắt ở M1]`.
- **Nhóm 3: Tiện Ích & Tích Hợp**
  - *Màn hình khóa (Lock Screen Widget):* Hiển thị trạng thái, chạm vào mở Sheet hướng dẫn & kích hoạt.
  - *Tự động ghi thông báo ngân hàng (Android):* Hiển thị trạng thái lắng nghe offline, chạm vào mở Sheet thiết lập quyền & bảo mật (`BankNotificationSettingsSheet`).
  - *Quét mã VietQR:* Hiển thị trạng thái Autofill & séc, chạm vào mở Sheet chi tiết.
- **Nhóm 4: Dữ Liệu & Quản Trị Tài Khoản**
  - *Xóa toàn bộ dữ liệu nhật ký:* Hàng hành động cảnh báo màu vàng nâu, chạm vào mở Alert xác nhận 2 bước.
  - *Xóa tài khoản in-app (Apple Store Guideline 5.1.1(v)):* Hàng hành động màu đỏ cảnh báo, xóa Supabase Auth + dữ liệu đám mây.
  - *Đăng xuất:* Nút đăng xuất trang nhã.
  - *Footer:* Phiên bản app `Ví Locket v1.0.0 (Build 54)`.
### 3.6. Quy Chuẩn Icon Nổi Trần Vừa Vặn Với Cỡ Chữ & Xóa Dòng Phụ (Quyết Định 63)
- **Quy chuẩn icon nổi trần thanh mảnh (Pure Floating Icons):**
  - Quyết định loại bỏ hoàn toàn bo tròn nền huy hiệu bên ngoài (`backgroundColor: 'transparent'`, `borderWidth: 0`), giữ cho icon hiển thị nguyên bản, thoáng đãng trên nền thẻ.
  - **Tăng kích thước icon lên một tỉ lệ vừa vặn và tương thích hoàn hảo với cỡ chữ của từng chỉ mục:**
    - *Khối Cân bằng ngân sách:* Icon `Scale` tăng lên **20px** (strokeWidth 2.4, màu `tokens.primary`), fit hài hòa và cân đối với chữ in hoa *"CÂN BẰNG NGÂN SÁCH"* (fontSize 14.5px bold).
    - *Khối Mục tiêu của bạn:* Icon `Target` tăng lên **19px** (strokeWidth 2.4, màu `tokens.primary`), fit hài hòa với chữ in hoa *"MỤC TIÊU CỦA BẠN"* (fontSize 14.5px bold).
    - *Khối Danh mục Thu & Chi:* Icon `FolderTree` tăng lên **21px** (strokeWidth 2.4, màu `tokens.primary`), fit hài hòa với chữ in hoa *"DANH MỤC THU & CHI"* (fontSize 14.5px bold).
  - **Xóa bỏ hoàn toàn dòng phụ:** Xóa bỏ hoàn toàn dòng chữ *"Chạm để điều chỉnh các thanh trượt"* (`summarySubtitle`) ở thẻ Cân Bằng Ngân Sách, giúp tiêu đề in hoa *"CÂN BẰNG NGÂN SÁCH"* đứng độc lập, thanh thoát, căn giữa tuyệt đối theo chiều dọc với icon `Scale`.
- **Các nút tương tác góc phải:**
  - Nút góc phải thẻ Cân bằng: Icon `SlidersHorizontal` tăng lên **19px** (strokeWidth 2.4), nổi trần gọn gàng.
  - Nút thêm mục tiêu góc phải: Icon `Plus` tăng lên **20px** (strokeWidth 2.4), nổi trần gọn gàng kèm `hitSlop` $\ge 44 \times 44$px.
  - Nút Setting Header: Icon `Settings` tăng lên **22px** nổi trần kèm `hitSlop`.
  - Nút Bút Chì đổi tên ở góc trên bên phải Thẻ Người đồng hành: Icon `Edit2` size **15px** nổi trần thanh mảnh kèm `hitSlop`.

### 3.7. Khối Quản Lý Danh Mục Tùy Biến (`CategorySettingsCard.tsx` / `CategoryManagementSheet.tsx` — M2)
- **Vị trí:** Nằm trong nhóm cài đặt tài chính cá nhân.
- **Phân tách 2 luồng:**
  - Tab 1: **Danh mục Chi Tiêu** (Ăn uống, Nhà cửa, Xe cộ, Thuốc men, Cho mẹ, Nuôi pet, Quần áo, Học tập...).
  - Tab 2: **Danh mục Thu Nhập** (Tiền lương, Tiền thưởng, Được cho/biếu, Đầu tư, Bán đồ cũ...).

### 3.8. Khối Chuyển Đổi 3 Theme Giao Diện (`ThemeSettingsCard.tsx`)
- **Tích hợp kép:** Có mặt trực tiếp trên cả Tab Hồ Sơ (`ProfileView.tsx`) và Màn hình Cài Đặt (`SettingsView.tsx`).
- **3 Chế độ giao diện chuẩn Hà Nội:**
  1. **Sáng (`light`):** Nền kem ngà bơ Hà Nội Thu Đông (`#FAF6EC`).
  2. **Tối (`dark`):** Nền xám than khói trầm đêm đông (`#0E1620`).
  3. **Mát (`cool`):** Nền sương mai thanh mát Fresh Blue-Mint (`#F0F8FF` / `#0F2420`).
- **Tương tác chuyển đổi:** Nút segmented pill 3 lựa chọn với icon Vector nổi trần (`Sun`, `Moon`, `Wind`), phản hồi rung xúc giác `selectionAsync()`, lưu tự động vào `AsyncStorage` (`vi_locket_theme_mode`).

- **Chức năng tương tác:**
  - *Thêm mới:* Nút `+ Thêm danh mục mới` mở Bottom Sheet cho phép nhập Tên danh mục, chọn Icon từ danh mục Vector Icons `lucide-react-native`, và chọn mã màu đại diện.
  - *Chỉnh sửa:* Bấm vào danh mục để đổi tên hoặc thay icon.
  - *Ẩn/Hiện / Xóa:* Cho phép ẩn danh mục không còn sử dụng hoặc xóa (nếu chưa có giao dịch ràng buộc).
- **Đồng bộ thời gian thực:** Cập nhật ngay lập tức vào bộ chọn danh mục trên Camera Viewfinder, Bottom Sheet ghi chép và bộ lọc Thống Kê.

### 3.8. Chuẩn Hóa Màn Hình Cài Đặt Chuyên Biệt (`SettingsView.tsx` — Quyết định 65)
- **Đồng bộ triết lý tối giản với Tab Hồ Sơ:**
  - *Nút Back [<] Header:* Icon vector nổi trần 22px (`strokeWidth: 2.6`), bỏ 100% viền bo và nền tròn mờ, `hitSlop` $\ge 44 \times 44$px.
  - *Icon đặc trưng nổi trần & in đậm:* Bỏ hoàn toàn hộp nền tròn (`iconBadge`), icon hiển thị dạng vector nổi trần kích thước **20px**, nét đậm **`strokeWidth={2.6}`**, căn trục thẳng hàng `width: 26`.
  - *Single-line Minimalist Rows:* Xóa 100% các dòng mô tả phụ rườm rà (`rowSubtitle`), đưa từng hàng về cấu trúc gọn gàng, thanh thoát.
  - *Bộ tên đặc trưng tinh gọn:* Thu gọn tên ngắn gọn súc tích (`HLV Anh Minh`, `Giao diện`, `Ẩn số tiền`, `Khóa Face ID`, `Widget màn hình khóa`, `Thông báo ngân hàng`, `Quét mã VietQR`, `Đặt lại dữ liệu`, `Xóa tài khoản`, `Đăng xuất`).
  - *Căn lề dòng phân cách:* Điều chỉnh `marginLeft: 52` khớp chuẩn xác với mép lề chữ.

---


## 4. Quy Chuẩn & Logic Nghiệp Vụ

### 4.1. Công thức Tự Động Đồng Bộ Định Mức Ngày
- Khi người dùng thay đổi bất kỳ trường nào trong nhóm: Thu nhập tháng, Chi cố định, Số tiền mục tiêu:
  $$\text{Số tiền khả dụng tháng} = \max(0, \text{Thu Nhập} - \text{Chi Cố Định})$$
  $$\text{Định mức ngày} = \text{round}\left(\frac{\text{Số tiền khả dụng}}{\text{Số ngày của tháng hiện tại}}, -3\right)$$
- Cập nhật trực tiếp vào `useBudgetStore.baseDailyBudget` và `todayBudget`.

### 4.2. Cơ chế "Ẩn Tiền Toàn Ứng Dụng"
- Được quản lý tập trung qua thuộc tính `isMasked` trong store hoặc hook `useDisplayCurrency(amount)`.
- Khi `isMasked === true`:
  - Trả về chuỗi `"••••"` hoặc `"•••• đ"`.
  - Các biểu đồ cột vẫn hiển thị độ cao tương đối nhưng nhãn số ở đỉnh chuyển thành `••••`.

### 4.3. Tuân Thủ Chuẩn Apple Store Review (Account & Data Deletion)
- Apple yêu cầu ứng dụng có tạo tài khoản thì bắt buộc phải có tính năng xóa tài khoản trực tiếp trong ứng dụng.
- Luồng xóa:
  1. Người dùng bấm "Xóa tài khoản".
  2. Xuất hiện Sheet xác nhận giải thích rõ: Tài khoản, ảnh chụp trên Cloud và lịch sử chi tiêu sẽ bị xóa vĩnh viễn không thể khôi phục.
  3. Bấm xác nhận $\rightarrow$ Gọi API `deleteUser()` / Edge Function xóa Supabase Auth $\rightarrow$ Xóa AsyncStorage $\rightarrow$ Đẩy người dùng về màn hình Chào mừng.

---

## 5. Ma Trận Trạng Thái (State Matrix)

| Trạng Thái | Điều Kiện | Giao Diện Hiển Thị | Hành Vi Người Dùng |
| :--- | :--- | :--- | :--- |
| **Bình thường** | Đã thiết lập mục tiêu & thu nhập | Hiển thị đầy đủ thông tin, tiến độ đạt % có màu sắc trực quan | Cuộn xem, chạm "Sửa" nếu muốn đổi mục tiêu |
| **Tài khoản trên máy (Vào ngay)** | `isGuest === true` | Thẻ Profile hiển thị huy hiệu "Lưu trên máy này" & nút "Liên kết Google" | Chạm để liên kết tài khoản Google sao lưu vĩnh viễn |
| **Chưa đặt mục tiêu** | `goalTargetAmount === 0` | Thẻ Mục tiêu hiển thị banner khuyến khích: "Đặt mục tiêu đầu tiên để cùng Anh Minh tích lũy!" | Chạm "Tạo mục tiêu" |
| **Đang sửa mục tiêu** | Bấm nút "Sửa" | Mở Bottom Sheet 4 trường dữ liệu kèm nút Lưu và Hủy | Điền form và bấm "LƯU MỤC TIÊU" |
| **Bật Ẩn tiền** | Công tắc chuyển sang BẬT | Mọi con số số dư thực, tiền giữ lại chuyển thành `••••` | Tắt công tắc để xem lại số tiền |
| **Yêu cầu xóa dữ liệu**| Bấm "Xóa toàn bộ dữ liệu" | Popup cảnh báo nền đỏ gạch ngói, yêu cầu xác thực bước 2 | Hủy bỏ hoặc gõ mã xác nhận xóa |

---

## 6. Tương Tác & Cử Chỉ (Interactions & Gestures)
- **Chạm tên người dùng:** Mở ô gõ văn bản tại chỗ (Inline Edit) hoặc dialog đổi biệt danh.
- **Chạm nút "Sửa mục tiêu":** Mở Sheet chỉnh sửa với các ô nhập liệu số tự động thêm dấu chấm ngăn cách nghìn (`15.000.000`).
- **Tab Cài Đặt Minh Bạch Chuẩn Production (Quyết định 68):**
  - HLV Anh Minh được quản lý chuyên biệt tại Tab 3 (AI Coach Chat), không đưa vào Tab Cài Đặt.
  - Khóa Face ID: Đã loại bỏ hoàn toàn để tối ưu dung lượng và giảm tải dữ liệu.
  - Quét mã VietQR: Huy hiệu "Khả dụng" (Chấm xanh ngọc #10B981) — Hoạt động thật 100%.
  - Sao lưu & Khôi phục: Huy hiệu "Khả dụng" (Chấm xanh ngọc #10B981) — Xuất/Nhập file JSON an toàn.
  - Widget màn hình khóa: Huy hiệu "Khả dụng" (Chấm xanh ngọc #10B981) — Thanh sticky tương tác trên Android.
  - Thông báo ngân hàng: Huy hiệu "Khả dụng" (Chấm xanh ngọc #10B981) — Cơ chế nhận diện Clipboard thông minh.
- **Bật/Tắt công tắc Ẩn tiền:** Phản hồi xúc giác `impactAsync(Light)`, toàn bộ số tiền trên màn hình đổi ngay lập tức.

---

## 7. Chuyển Động & Hoạt Họa (Motion & Animation)
- **Thanh tiến trình mục tiêu:** Nạp đầy dạng Spring easing (`stiffness: 120, damping: 15`) khi mở màn hình.
- **Chuyển nấc mức thẳng thắn:** Nền khối vàng trượt ngang 150ms sắc sảo phong cách tactile.
- **Sheet chỉnh sửa mục tiêu:** Trượt từ dưới đáy lên mượt mà theo chuẩn iOS Modal Sheet.

---

## 8. Bảng Từ Ngữ (String Dictionary)

*Bổ sung/cập nhật vào `src/constants/strings.ts`:*

| Khóa Chuỗi | Giá Trị Tiếng Việt Hiển Thị | Ngữ Cảnh Sử Dụng |
| :--- | :--- | :--- |
| `profile.title` | `"HỒ SƠ"` | Tiêu đề đầu trang |
| `profile.streakDays` | `(days: number) => "${days} ngày liên tiếp"` | Huy hiệu chuỗi ngày |
| `profile.savedTotal` | `"Tổng đã giữ lại"` | Nhãn tiền tiết kiệm |
| `profile.entriesCount` | `(count: number) => "${count} món đã ghi"` | Nhãn số giao dịch |
| `profile.goalSectionTitle` | `"MỤC TIÊU CỦA BẠN"` | Tiêu đề nhóm mục tiêu |
| `profile.goalNameLabel` | `"Mục đích"` | Tên mục tiêu |
| `profile.goalTargetLabel` | `"Số tiền cần tích lũy"` | Số tiền đích |
| `profile.goalDeadlineLabel` | `"Hạn chót hoàn thành"` | Hạn ngày |
| `profile.goalReasonLabel` | `"Lý do / Ý nghĩa"` | Động lực |
| `profile.budgetSectionTitle` | `"ĐỊNH MỨC & THU CHI"` | Tiêu đề nhóm định mức |
| `profile.monthlyIncome` | `"Thu nhập hàng tháng"` | Thu nhập |
| `profile.fixedCosts` | `"Chi phí cố định (nhà, điện...)"` | Chi cố định |
| `profile.favUnitLabel` | `"Đơn vị quy đổi yêu thích"` | Quy đổi |
| `profile.coachSectionTitle` | `"HUẤN LUYỆN VIÊN ANH MINH"` | Tiêu đề nhóm AI |
| `profile.coachTone` | `"Mức độ thẳng thắn"` | Tùy biến giọng điệu |
| `profile.toneGentle` | `"Nhẹ nhàng"` | Mức 1 |
| `profile.toneBalanced` | `"Vừa phải"` | Mức 2 |
| `profile.toneDirect` | `"Thẳng thắn"` | Mức 3 |
| `profile.privacySectionTitle`| `"QUYỀN RIÊNG TƯ & BẢO MẬT"` | Tiêu đề nhóm riêng tư |
| `profile.maskMoney` | `"Ẩn số tiền trên mọi màn hình"`| Công tắc ẩn tiền |
| `profile.dataSectionTitle` | `"DỮ LIỆU & TÀI KHOẢN"` | Tiêu đề nhóm dữ liệu |
| `profile.resetAllData` | `"Xóa toàn bộ dữ liệu trên máy"`| Nút xóa sạch dữ liệu |
| `profile.deleteAccount` | `"Xóa tài khoản vĩnh viễn"` | Nút xóa tài khoản Apple |
| `profile.signOut` | `"Đăng xuất"` | Nút đăng xuất |
| `profile.appVersion` | `(v: string) => "Ví Locket v${v}"` | Dòng phiên bản cuối trang |

---

## 9. Khả Năng Tiếp Cận (Accessibility — A11y)
- **VoiceOver / TalkBack:** Mọi thẻ nhóm đều có `accessibilityRole="header"`. Thanh tiến trình đọc rõ: *"Mục tiêu Chuyến đi Sa Pa, đã đạt 28 phần trăm, còn thiếu 10 triệu 800 nghìn đồng"*.
- **Vùng chạm tối thiểu:** Các nút Sửa, Chuyển nấc giọng điệu, Công tắc ẩn tiền đạt tối thiểu 44px x 44px.
- **Tương phản chuẩn WCAG AA:** Nhãn chữ xám ngà `#FAF6F0` trên nền thẻ tối `#1C1C22` đạt tỷ lệ tương phản 13:1.

---

## 10. Ngân Sách Hiệu Năng & Chi Phí (Performance & Storage)
- **Tốc độ lưu & phản hồi:** Lưu cài đặt mục tiêu và thu nhập vào AsyncStorage trong < 20ms.
- **Tiết kiệm pin:** Không chạy animation nền khi màn hình không active.
- **An toàn dữ liệu:** Thao tác "Xóa toàn bộ dữ liệu" bắt buộc dọn sạch cả AsyncStorage và thư mục ảnh tạm `expo-file-system`.

---

## 11. Kế Hoạch Kiểm Thử (Test Plan)
- **Unit Tests (`src/utils/__tests__/profileUtils.test.ts`):**
  - Test hàm tính toán định mức ngày dựa trên thu nhập, chi cố định và mục tiêu.
  - Test hàm tính tiến độ % mục tiêu (đảm bảo không bị chia cho 0, không vượt quá 100%).
  - Test hàm format tiền có ẩn số (`••••` khi `isMasked = true`).
- **Kiểm thử trên thiết bị thật:**
  - Đổi mục tiêu từ 10tr lên 20tr $\rightarrow$ Chuyển sang Home xem thanh tiến trình và hạn mức ngày có đổi tương ứng.
  - Bật công tắc Ẩn tiền $\rightarrow$ Lướt qua cả 4 tab còn lại (Home, Thống kê, Camera, Chat) xác nhận toàn bộ số tiền đều được che an toàn.
  - Thử nghiệm bấm nút Xóa toàn bộ dữ liệu để kiểm tra tính năng xác nhận 2 bước.

---

## 12. Tiêu Chí Nghiệm Thu (Acceptance Criteria — Đo Được)
1. [ ] Đầu trang hiển thị avatar khối vuông, tên người dùng, chuỗi ngày và tổng tiền đã giữ lại.
2. [ ] Thẻ mục tiêu có đủ 4 trường (Mục đích, Số tiền, Hạn chót, Lý do) và thanh tiến trình trực quan.
3. [ ] Có chức năng chỉnh sửa Thu nhập tháng & Chi phí cố định; công thức "Hôm nay tiêu được" cập nhật ngay.
4. [ ] Chọn được đơn vị quy đổi yêu thích (Cà phê / Trà sữa / Bát phở).
5. [ ] Bộ chuyển 3 mức thẳng thắn của Anh Minh AI hoạt động mượt mà.
6. [ ] Công tắc "Ẩn tiền toàn app" có tác dụng lên toàn bộ 5 màn hình.
7. [ ] Có 2 nút xử lý an toàn: "Xóa toàn bộ dữ liệu một chạm" (xác nhận 2 bước) và "Xóa tài khoản vĩnh viễn" chuẩn Apple Store.
8. [ ] Đạt chuẩn 0 error, 0 warning khi chạy `npm run lint` (`tsc --noEmit`).

---

## 13. Rủi Ro & Giải Pháp
- **Rủi ro:** Người dùng vô tình bấm nhầm "Xóa dữ liệu" hoặc "Xóa tài khoản" gây mất toàn bộ nhật ký chi tiêu.  
  - *Giải pháp:* Thiết kế hộp thoại xác nhận 2 tầng nghiêm ngặt (Double Confirmation Dialog); bắt buộc gõ mã hoặc chờ 3 giây trước khi nút Xác nhận sáng lên.
- **Rủi ro:** Khi người dùng nhập Thu nhập nhỏ hơn Chi phí cố định khiến Định mức ngày bị âm.  
  - *Giải pháp:* Khống chế sàn tối thiểu (Floor Guard) $\text{Base Daily Budget} \ge 20.000\text{ đ}$, hiển thị thông báo ân cần từ Anh Minh để hỗ trợ người dùng cân đối lại.
