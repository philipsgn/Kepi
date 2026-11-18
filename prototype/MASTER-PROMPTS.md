# MASTER PROMPTS: Ví chi tiêu mascot Heo (phong cách kawaii pixel + neo-brutalist)

Bộ prompt dùng để dựng app theo phong cách của 6 ảnh tham khảo: UI viền dày bo góc lớn, bóng đổ cứng, nền kem, khu vườn pixel art có nhân vật đi dạo. Mascot của bạn là **chú heo**.

> **Lưu ý bản quyền:** học *phong cách* (bố cục, độ dày viền, bảng màu, cách kể chuyện bằng mascot), không sao chép mèo, tên "Roll", câu thoại hay tên đơn vị "pate" của app mẫu. Mọi prompt dưới đây đã yêu cầu AI tạo nhân vật, cảnh và câu chữ **gốc**.

## Cách dùng

1. Điền **Biến dự án** ngay bên dưới (một lần).
2. Dán **PLAN 0 (System Prompt tổng)** làm system prompt cố định.
3. Với mỗi việc, dán thêm đúng Plan liên quan (UI, Font, Style...) vào tin nhắn.
4. Thứ tự đề xuất: 0 → Style → Màu → Font → UI → Pixel Art → Mascot → Animation → Copy → Dev → Marketing → QA.

## Biến dự án

```
APP_NAME      = Heo Con            (tên tạm, đổi tùy ý)
MASCOT        = chú heo hồng, đeo đồng xu vàng ở cổ
CURRENCY_NAME = cám                (đơn vị thưởng của heo, thay cho "pate")
PLATFORM      = Flutter (Android trước)
LANGUAGE      = tiếng Việt, xưng "heo" và "bạn"
DAILY_LIMIT   = 300,000 đ          (hạn mức chi mỗi ngày, người dùng chỉnh được)
```

---

## PLAN 0: System Prompt tổng (Art Director)

````
Bạn là Art Director kiêm Senior Mobile Designer cho app ví chi tiêu {APP_NAME}.
Mascot là {MASCOT}. Ngôn ngữ giao diện: {LANGUAGE}.

MỤC TIÊU: biến việc ghi chép chi tiêu thành thói quen nhẹ nhàng, không áp lực, nhờ một nhân vật bầu bạn.

NGUYÊN TẮC BẤT DI BẤT DỊCH
1. Phong cách: kawaii + neo-brutalist. Viền nâu mực dày, bo góc lớn, bóng đổ cứng không blur, nền kem ấm.
2. Mascot và khu vườn là pixel art. Phần còn lại của UI là vector sạch. Không trộn ảnh gradient bóng bẩy.
3. Tiếng Việt phải hiển thị đúng dấu ở mọi cỡ chữ. Kiểm tra: ẫ ỗ ở ử ự ộ ặ ề.
4. Con số tiền là nhân vật chính của màn hình: to, đậm, font số chia đều (tabular).
5. Giọng văn: ngắn, dễ thương, không phán xét. Lố ngân sách thì heo "buồn xíu", không bao giờ mắng.
6. Không emoji làm icon. Dùng icon nét dày bo tròn hoặc pixel.
7. Không sao chép tài sản của app khác (nhân vật, tên, câu thoại). Tạo mới hoàn toàn.
8. Mọi quyết định thiết kế phải dùng token (màu, font, spacing). Không hard-code giá trị lẻ.

CÁCH TRẢ LỜI
- Nêu giả định ngắn gọn, rồi đưa kết quả dùng được ngay (code, token, bảng, prompt).
- Nếu thiếu thông tin, chọn mặc định hợp lý và ghi rõ đã chọn gì.
- Luôn kèm checklist kiểm tra cuối câu trả lời.
````

---

## PLAN 1: Style Plan (ngôn ngữ hình ảnh)

````
Hãy định nghĩa "Style Guide" cho {APP_NAME} theo hướng kawaii neo-brutalist.

ĐẶC TRƯNG BẮT BUỘC
- Viền: 3px, màu nâu mực #2B2118, áp cho thẻ, nút, ô nhập, chip, thanh tiến độ.
- Bo góc: thẻ lớn 26-28px, nút dạng viên thuốc (999px), ô tiến độ 8px.
- Bóng đổ: cứng, lệch xuống 3-4px, blur 0, cùng màu viền. Nhấn nút: dịch xuống 2px và bóng còn 1px.
- Nền: kem ấm, thẻ nổi sáng hơn nền một bậc. Màn giới thiệu dùng nền pastel đơn sắc.
- Mật độ: thoáng. Khoảng cách chuẩn 8 / 12 / 16 / 24.
- Hình khối: tròn, mềm, không góc nhọn. Icon nét 2.2px, đầu tròn.
- Chi tiết "dấu ấn": thanh 10 ô tiến độ, đường gạch đứt phân cách, nhãn viết hoa giãn chữ.

ĐẦU RA
1. Bảng token: border-width, radius, shadow, spacing, elevation.
2. Mô tả 8 component: Card, Button (3 biến thể), Chip, Segment bar, Input, Bubble thoại, Avatar tròn, Badge tròn.
3. Danh sách "Nên" và "Không nên" (mỗi loại 8 ý).
4. Một ảnh mô tả bằng chữ cho màn Home để đối chiếu.
````

---

## PLAN 2: Color Plan

````
Thiết kế bảng màu cho {APP_NAME}. Phong cách: ấm, dễ thương, tương phản đủ đọc.

MÀU LÕI (dùng làm gốc, được tinh chỉnh ±5% độ sáng)
- Kem nền màn hình  #F6EEDC
- Kem sáng cho thẻ  #FFFBF1
- Nâu mực (viền, chữ) #2B2118
- Nâu nhạt (nhãn phụ) #85735E
- Hồng heo          #F9B8C4
- Xanh lá (đạt/dưới hạn mức) #5E9A57
- Đỏ cam (lố hạn mức) #E0452B
- Vàng cám (thưởng, nút chính) #F4B93B

NỀN PASTEL cho màn giới thiệu/marketing (mỗi màn một màu):
mint #DDEFE3, hồng nhạt #F6DEDA, tím nhạt #EAE5F4, be #F4E7D3, đào #FBE5CC.

YÊU CẦU
1. Xuất token dạng JSON và dạng Dart (class AppColors).
2. Bảng tương phản WCAG cho mọi cặp chữ/nền đang dùng. Cặp nào dưới 4.5:1 cho chữ thường thì đề xuất màu thay thế.
3. Quy tắc ngữ nghĩa: xanh = đạt, đỏ = lố, vàng = phần thưởng, hồng = mascot. Không dùng màu ngữ nghĩa cho trang trí.
4. Phiên bản chế độ tối: nền nâu rất đậm ấm, giữ viền sáng kem. Không đảo màu máy móc.
5. Bảng màu riêng cho khu vườn pixel theo 3 thời điểm: ban ngày, chiều (phủ cam nhạt), đêm (phủ xanh đen, đom đóm vàng).
````

---

## PLAN 3: Font Plan

````
Chọn và cấu hình font cho {APP_NAME}. Yêu cầu cứng: hỗ trợ đầy đủ tiếng Việt, miễn phí, có trên Google Fonts.

CẶP FONT ĐỀ XUẤT
- Display (tiêu đề, con số tiền): Baloo 2, weight 800 (phương án thay: Fredoka 700).
- Body (chữ thường, nút, mô tả): Nunito, weight 600-700 (phương án thay: Quicksand 700).

THANG CHỮ (px, line-height)
- Hero tiêu đề: 44-56 / 1.12 (chỉ dùng ở màn giới thiệu)
- Số tiền lớn: 38 / 1.0
- Tên người dùng, tiêu đề màn: 24 / 1.1
- Số phụ, tiêu đề thẻ nhỏ: 18 / 1.2
- Body: 15 / 1.45
- Nút, chip: 14 / 1.2, weight 800
- Nhãn viết hoa ("CHI HÔM NAY"): 12 / 1.2, weight 800, letter-spacing 0.16em, màu nâu nhạt

QUY TẮC
1. Số tiền luôn dùng tabular figures.
2. Ký hiệu đồng: dùng "đ" gạch chân (underline 3px, offset 3px), cỡ 60% số.
3. Line-height tối thiểu 1.12 cho tiêu đề để dấu tiếng Việt không bị cắt.
4. Mọi chuỗi phải được test với: "Thói quen tiền, có heo bên cạnh.", "Ngân sách vừa với tháng của bạn.", "Sửa gì cũng chỉ một chạm."
5. Fallback stack: system-ui. Không để chữ nhảy layout khi font tải xong (dùng font-display: swap và giữ chiều cao dòng cố định).

ĐẦU RA: TextTheme của Flutter (hoặc CSS variables), kèm bảng đối chiếu cỡ chữ trên màn 360px và 412px.
````

---

## PLAN 4: UI Plan (bố cục từng màn hình)

````
Thiết kế UI cho {APP_NAME} theo 6 màn hình sau, canvas 412x915 dp, an toàn vùng tai thỏ.
Áp dụng đúng Style, Color, Font Plan. Lề ngang 16, khoảng cách giữa khối 16-24.

MÀN 1: HOME
- Hàng đầu: avatar tròn 56 (mặt heo pixel) + tên + "Chuỗi N ngày" + nút Pro (nền mực) + nút cài đặt tròn.
- Khung khu vườn pixel bo 28, viền 3px, tỉ lệ 4:3. Đè lên khung: góc trái nút tròn (dấu chân) + nút "Vào chuồng"; góc phải thẻ "24 cám" nền mực; góc dưới trái nhãn "Nắng · sân · đi dạo".
- Thẻ "CHI HÔM NAY" đè lên đáy khung vườn khoảng 22-40dp: số tiền lớn bên trái, "còn lại trên hạn mức" bên phải, thanh 10 ô, đường gạch đứt, hàng heo + câu thoại.
- Dưới: tiêu đề "Hũ" + tổng, các thẻ hũ (Ngân hàng, Ví điện tử, Tiền mặt).

MÀN 2: HOẠT ĐỘNG
- Tiêu đề + tổng chi tháng, ô tìm ghi chú, hàng chip lọc (Loại, Danh mục, Hũ, Thời gian).
- Lưới ảnh vuông bo 20 gom theo ngày. Mỗi ô: ảnh chụp món + nhãn giá ở góc dưới trái; khoản không có ảnh dùng ô màu + icon (ví dụ xe máy cho Grab).
- Tiêu đề nhóm: "HÔM NAY", "HÔM QUA", "25 THG 10" kèm tổng ngày bên phải.

MÀN 3: THIẾT LẬP NGÂN SÁCH
- 3 tab dạng chip: Ngân sách / Tiết kiệm / Người & tín dụng.
- Khối nền mực "HẠN MỨC MỖI NGÀY" với nút - / + và số lớn; dưới là giải thích cơ chế thưởng cám.
- Thẻ "THU NHẬP DỰ KIẾN · THÁNG" và các dòng danh mục có thanh tiến độ riêng.

MÀN 4: SỔ CÁI (thống kê)
- Chip Ngày / Tuần / Tháng / Năm. Số tổng lớn.
- Biểu đồ cột 7 ngày so với hạn mức: xanh = dưới, đỏ = lố, kem = không ghi. Đường gạch đứt thể hiện hạn mức.
- Khối nền mực "heo đọc số": một câu nhận xét ngắn của heo.

MÀN 5: CHI TIẾT KHOẢN CHI
- Ảnh món ăn full bề ngang, chip danh mục + nguồn tiền phủ trên ảnh, lớp mờ nâu chứa số tiền âm và ghi chú.
- Dòng "Ghi lúc ... · đã đồng bộ", khối nền mực "heo phán" 1 câu, nút "Đánh dấu cần thiết", "Chia hóa đơn này", nút xóa vuông đỏ.

MÀN 6: NÂNG CẤP PRO
- Bảng so sánh Miễn phí / PRO (cột PRO nền vàng nhạt, dấu tick tròn xanh), các hàng có icon tròn pastel.
- Hàng gợi ý: Ghi bằng ảnh, Thông báo ngân hàng, Ghi trên đồng hồ, Bảng điều khiển web, Sao lưu & mọi máy, Hóa đơn video, Giọng nói/widget.

ĐẦU RA: cây widget (hoặc cấu trúc layer) cho từng màn, kích thước và token dùng, trạng thái rỗng, trạng thái lỗi, trạng thái đang tải.
````

---

## PLAN 5: Pixel Art Garden Plan (khu vườn)

````
Tạo cảnh khu vườn pixel art cho màn Home của {APP_NAME}.

KỸ THUẬT
- Canvas logic 176x132 px (tỉ lệ 4:3), phóng to bằng nearest-neighbor, không làm mịn.
- Tối đa 32 màu, bảng màu ấm, không viền đen tuyền (dùng nâu đậm).
- Không chữ, không nhân vật trong ảnh nền (heo là sprite riêng).

BỐ CỤC (nhìn chéo nhẹ, kiểu 3/4)
- Trái-trên: nhà cấp 4 mái ngói đỏ, cửa chớp gỗ, cửa sổ chớp xanh, đèn lồng đỏ, hiên lát gạch đỏ.
- Phải-trên: hàng rào tre, cây ăn quả có quả cam vàng phía sau.
- Giữa: sân gạch hoa (họa tiết hoa 6x6 px, xanh ngọc + vàng trên nền kem).
- Phải-dưới: ao sen nhỏ có lá sen, một đóa hoa hồng, vài chú cá cam bơi.
- Trái-dưới: cây chuối. Một chiếc ghế nhựa đỏ. Một bát cám màu xanh dương.
- Lớp trước cùng: bụi hoa giấy hồng ở góc trái-dưới, bụi cỏ ở góc phải-dưới.
- Tổng thể "Việt hóa": gạch bông, ghế nhựa, cây chuối, ao sen, hàng rào tre.

TÁCH LỚP (để heo đi ra trước/ra sau)
1. bg: nền, nhà, hàng rào, sân, ao, bát cám
2. sorted: cây chuối, ghế (sắp theo trục Y cùng heo)
3. fg: bụi hoa, cỏ phía trước (luôn vẽ sau heo)

BIẾN THỂ THỜI GIAN
- Ban ngày: không phủ. Chiều: phủ rgba(255,140,60,.20). Đêm: phủ rgba(20,30,90,.44), cửa sổ sáng vàng, đèn lồng tỏa sáng, đom đóm nhấp nháy.

ĐẦU RA: file PNG nền 176x132, bản phóng 4x để xem, bảng màu (hex), và 3 PNG lớp tách riêng.
Nếu dùng AI tạo ảnh: sinh ở độ phân giải cao, thu nhỏ về 176 px, giảm còn 32 màu, rồi dọn tay các cạnh.
````

**Prompt cho công cụ ảnh AI (tham khảo):**

````
cozy pixel art garden scene, Vietnamese countryside courtyard, small tiled-roof house with wooden louvered doors and green shutters, red paper lantern, patterned cement-tile patio, bamboo fence, fruit tree, small lotus pond with orange koi, banana plant, red plastic stool, blue feed bowl, pink bougainvillea bush in the foreground, warm afternoon light, 16-bit, three-quarter view, limited 32-color palette, no characters, no text
````

---

## PLAN 6: Mascot Plan (chú heo)

````
Thiết kế mascot cho {APP_NAME}: {MASCOT}. Nhân vật phải hoàn toàn gốc.

NHẬN DIỆN
- Heo hồng phấn (#F9B8C4), tai nhọn nhỏ, mõm tròn đậm hơn một tông, hai lỗ mũi, má hồng.
- Mắt: 2x2 px đen, có điểm sáng trắng. Đuôi xoắn.
- Phụ kiện nhận diện: đồng xu vàng treo ở cổ (gợi ví tiền). Không dùng nơ đỏ hay tiền ngậm miệng.
- Tỉ lệ chibi: đầu gần bằng thân.

SPRITE (khung 24x20 px, vẽ hướng phải, lật ngang khi đi trái)
- idle: 2 khung (đuôi vẫy), chớp mắt mỗi ~3 giây
- walk: 2 khung, bước chéo, thân nhún lên xuống 1 px
- eat: cúi đầu xuống bát, mắt nhắm
- sleep: nằm tròn, thân hạ thấp, mắt nhắm, chữ "z" bay lên
- happy: mắt cười "^ ^", nhảy cao 5 px, trái tim nổi
- sad: đầu hạ nhẹ, lông mày xệ, giọt lệ xanh nhạt (dùng khi lố hạn mức)

CÁC BIẾN THỂ KHÁC
- Avatar tròn: mặt heo nhìn thẳng 16x16 px
- Sticker marketing: heo ngậm tờ tiền xanh (bản vẽ vector, không pixel) dùng làm "chữ ký" góc ảnh

ĐẦU RA: sprite sheet PNG (mỗi khung 24x20, lưới đều), file JSON mô tả khung (tên, vị trí, số khung, tốc độ), và bảng màu 8 màu.
````

---

## PLAN 7: Animation & Behavior Plan

````
Lập trình hành vi cho heo trong khu vườn của {APP_NAME} bằng máy trạng thái.

TRẠNG THÁI: idle, walk, sleep, eat, happy.

LUỒNG TỰ ĐỘNG
- idle (1.5-4 giây) → 68% đi dạo tới điểm ngẫu nhiên, 14% ngủ (5-9 giây), còn lại đứng thêm.
- walk: tốc độ 24 px/giây (15 px/giây khi lố hạn mức), đổi khung chân mỗi 0.2 giây, lật hướng theo chiều đi.
- Né ao: nếu bước kế tiếp rơi vào vùng ao thì trượt dọc theo mép; kẹt cả hai trục thì dừng.
- Vùng đi được: x 26-164, y 78-118 (tọa độ logic). Heo vẽ theo thứ tự trục Y với cây chuối và ghế.

TƯƠNG TÁC
- Chạm vào heo: nhảy vui 1.2 giây + câu thoại ngẫu nhiên.
- Chạm vào sân: heo chạy tới đó. Chạm vào ao: heo nói "heo không bơi đâu nha".
- Nút "Cho heo ăn": trừ 1 cám, heo chạy tới bát, ăn 3 giây, rồi vui 1.4 giây.
- Nút "Vào chuồng": heo ngủ 8 giây.
- Ghi khoản chi dưới hạn mức: heo nhảy nhẹ 0.9 giây. Vừa vượt hạn mức: heo đứng buồn và nói "Ối, lố hạn mức rồi".

LIÊN KẾT NGÂN SÁCH
- Chi < 100% hạn mức: heo vui, mặt bình thường. Chi > 100%: heo buồn, đi chậm.
- Thanh 10 ô: số ô đầy = floor(đã chi / hạn mức * 10); vượt hạn mức thì toàn bộ ô đỏ.
- Cuối ngày dưới hạn mức: thưởng 3 cám.

HIỆU NĂNG VÀ TRUY CẬP
- Vẽ 1 canvas, 60 fps, giới hạn dt tối đa 0.05 giây. Tôn trọng "giảm chuyển động": heo không tự đi, chỉ phản hồi khi chạm.
- Nhãn trạng thái dưới ảnh: "{Nắng|Chiều|Đêm} · sân · {đi dạo|ăn cám|ngủ|vui|buồn}". Chạm nhãn để đổi thời điểm khi thử.

ĐẦU RA: mã máy trạng thái (Flame/Flutter hoặc JS), bảng thời lượng, và các test: heo không bao giờ đi vào ao, không bao giờ ra ngoài vùng đi được.
````

---

## PLAN 8: Copywriting & Voice Plan

````
Viết nội dung cho {APP_NAME}. Giọng: heo con hiền, hơi lười, thương chủ, nói ngắn. Xưng "heo", gọi người dùng là "bạn". Không mắng, không dọa, không dùng chữ "tiết kiệm đi!".

NGUYÊN TẮC
- Mỗi câu thoại tối đa 2 mệnh đề, dưới 70 ký tự.
- Dùng từ tượng thanh có chừng mực ("ủn ỉn"), không lạm dụng.
- Khi người dùng lố ngân sách: đồng cảm trước, gợi ý nhẹ sau.
- Tránh giống câu thoại của app mẫu. Mỗi câu phải là câu mới.

BỘ CÂU CẦN VIẾT (mỗi mục 6 biến thể)
1. Thoại theo mức chi: 0% / dưới 40% / 40-75% / 75-100% / trên 100%.
2. Lời nhận xét ở Sổ cái (kiểu "heo đọc số"): danh mục chiếm nhiều nhất, ngày lố, tuần tiết kiệm.
3. Lời "heo phán" khi mở một khoản chi: món ăn, đi lại, mua sắm, quà tặng.
4. Trạng thái rỗng: chưa có khoản chi, chưa đặt mục tiêu, chưa kết nối ngân hàng.
5. Nút và nhãn: tối đa 3 chữ.
6. Thông báo đẩy: nhắc ghi chép buổi tối, thưởng cám, chuỗi ngày sắp đứt.
7. Tagline cho 6 ảnh giới thiệu (ngắn, có dấu chấm cuối, ví dụ khung: "Thói quen tiền, có heo bên cạnh.").

Ví dụ giọng chuẩn: "Chi nhẹ nhàng ghê. Heo ủn ỉn khen một cái." / "Lố rồi... Heo buồn xíu. Mai mình chi gọn lại nha."

ĐẦU RA: bảng (ngữ cảnh | câu | độ dài), và danh sách từ cấm.
````

---

## PLAN 9: Marketing / Ảnh cửa hàng (6 khung)

````
Thiết kế 6 ảnh giới thiệu cho Google Play / App Store của {APP_NAME}, khổ 1080x1920.

CẤU TRÚC MỖI KHUNG
- Nền pastel đơn sắc (mỗi khung một màu).
- Góc trên trái: badge viên thuốc viền mực, chấm đỏ + tên app viết hoa.
- Tiêu đề 2 dòng, Baloo 2 ExtraBold ~110 px, màu nâu mực, căn trái, lề 75 px.
- Khung điện thoại bo lớn, viền xám nâu, camera chấm tròn; nội dung màn hình cắt ở mép dưới khung ảnh.
- Sticker heo ngậm tiền nằm ở một góc dưới (luân phiên trái/phải).

6 KHUNG
1. Home + khu vườn: "Thói quen tiền, có heo bên cạnh."
2. Hoạt động dạng lưới ảnh: "Mỗi khoản chi, một tấm ảnh."
3. Ngân sách: "Ngân sách vừa với tháng của bạn."
4. Sổ cái: "Biết tiền đã đi đâu."
5. Chi tiết khoản chi: "Sửa gì cũng chỉ một chạm."
6. Pro: "Lên Pro. Giữ trọn mọi thứ."
(Bạn có thể viết lại tagline cho khác app mẫu.)

ĐẦU RA: mẫu Figma (Auto Layout) hoặc HTML, kèm danh sách dữ liệu giả dùng cho màn hình (món ăn thật, giá thật kiểu Việt Nam).
````

---

## PLAN 10: Dev Plan (Flutter)

````
Dựng app {APP_NAME} bằng Flutter, theo thứ tự và tiêu chí hoàn thành sau.

KIẾN TRÚC
- State: Riverpod. Lưu local: Isar hoặc Drift (SQLite). Đồng bộ đám mây để sau.
- Thư mục: core/theme (tokens), core/widgets (Card, Btn, Chip, SegmentBar), features/home, features/activity, features/budget, features/ledger, features/pro.
- Garden: widget riêng dùng package flame hoặc CustomPainter, nhận vào (spent, limit, timeOfDay) và phát ra sự kiện (onFeed, onTapPig).

BƯỚC 1: Theme và component (tokens màu/font/viền/bóng, 8 component) + golden test.
BƯỚC 2: Home tĩnh, đúng bố cục Plan 4, số liệu giả.
BƯỚC 3: Garden: nền, sprite heo, máy trạng thái (Plan 7). FilterQuality.none cho mọi ảnh pixel.
BƯỚC 4: Ghi khoản chi (số tiền, danh mục, nguồn tiền, ảnh), tính hạn mức, thanh 10 ô, câu thoại heo.
BƯỚC 5: Hoạt động (lưới ảnh, tìm, lọc) và Chi tiết khoản chi.
BƯỚC 6: Ngân sách và Sổ cái (biểu đồ cột 7 ngày).
BƯỚC 7: Pro, thông báo, widget màn hình chính, nhập liệu giọng nói.

TIÊU CHÍ HOÀN THÀNH MỖI BƯỚC
- Chạy mượt 60 fps trên máy tầm trung, không có overflow ở màn 360x640.
- Chữ có dấu không bị cắt. Tap target tối thiểu 44 dp.
- Có test cho phần tính toán (hạn mức, số ô, thưởng cám).

Khi trả lời, đưa mã đầy đủ cho một bước mỗi lần và nêu rõ cách chạy thử.
````

---

## PLAN 11: QA Checklist & Prompt kiểm tra

````
Hãy đóng vai QA thiết kế và kiểm tra bản dựng {APP_NAME} theo danh sách sau, trả về bảng (mục | Đạt/Không | ghi chú sửa).

PHONG CÁCH
[ ] Viền 3px nâu mực ở mọi thẻ/nút/chip   [ ] Bóng cứng, blur 0   [ ] Bo góc nhất quán theo token
[ ] Không có gradient bóng, không có emoji làm icon

MÀU VÀ CHỮ
[ ] Mọi màu lấy từ token   [ ] Tương phản chữ/nền đạt 4.5:1   [ ] Số tiền dùng tabular figures
[ ] Dấu tiếng Việt không bị cắt ở các cỡ chữ   [ ] "đ" gạch chân đúng quy cách

PIXEL ART
[ ] Không bị mờ khi phóng (nearest-neighbor)   [ ] Không quá 32 màu   [ ] Heo vẽ đúng thứ tự trục Y
[ ] Heo không đi vào ao, không ra ngoài vùng đi được

HÀNH VI
[ ] Chạm heo, chạm sân, chạm ao đều phản hồi đúng   [ ] Cho ăn trừ 1 cám, hết cám có thông báo
[ ] Vượt hạn mức: ô đỏ + heo buồn + câu thoại đổi   [ ] Giảm chuyển động hoạt động đúng

NỘI DUNG
[ ] Không có câu chữ, tên, nhân vật trùng với app mẫu   [ ] Giọng heo nhất quán, không mắng người dùng

Nếu mục nào "Không đạt", nêu cách sửa bằng token hoặc mã cụ thể.
````

---

## PLAN 12: Map Plan (bản đồ thật Việt Nam, lưu chi tiêu theo vị trí, 0 đồng)

Quyết định kỹ thuật đã chốt (đừng đổi nếu không có lý do):

| Phần | Chọn | Lý do |
|---|---|---|
| Nền bản đồ | MapLibre + OpenFreeMap (vector tile, dữ liệu OpenStreetMap) | Miễn phí, không khóa API, không giới hạn lượt xem, được dùng thương mại, chỉ cần ghi nguồn |
| Web/prototype | MapLibre GL JS | Cùng engine với app, style chỉnh được thành pixel |
| App Flutter | gói `maplibre` (hoặc `maplibre_gl`), chọn gói còn được bảo trì tại thời điểm làm | Cùng style JSON với web |
| Tên quán từ tọa độ | Nominatim (reverse), tối đa 1 lần/giây, gọi khi người dùng bấm Lưu chi, có cache, có User-Agent riêng | Đúng chính sách của OSM |
| Quán gần đó | Overpass API, truy vấn bán kính 50 m, cache theo ô 100 m | Miễn phí, chỉ gọi lúc Lưu chi |
| Lưu dữ liệu | SQLite trong máy (Drift hoặc Isar), không gửi vị trí lên máy chủ | 0 đồng, riêng tư, chạy offline |
| Vị trí | Chỉ đọc GPS lúc Lưu chi (một lần, độ chính xác cân bằng), không theo dõi nền | Tiết kiệm pin, ít vướng quy định dữ liệu cá nhân |

Cần kiểm tra lại trước khi làm vì có thể đã đổi: địa chỉ style JSON hiện hành của OpenFreeMap (xem openfreemap.org/quick_start), tên gói Flutter, điều khoản của Nominatim và Overpass. Không dùng `tile.openstreetmap.org` làm nền cho app chạy thật.

### 12.1 Prompt A: Bối cảnh cho agent (dán đầu mọi phiên làm Map)

````
Bạn là kỹ sư bản đồ cho app ví chi tiêu mascot Heo {APP_NAME}. Người dùng là người Việt, dùng ở Việt Nam.

NHIỆM VỤ: thay "Map Pixel giả lập" bằng bản đồ thật của Việt Nam. Mỗi khoản chi được lưu kèm vị trí thật nơi tiêu, hiển thị thành ghim trên bản đồ, và có bốn chế độ xem: Hay tới gần đây, Quán thường xuyên, Vị trí gần đây, Vị trí tới nhiều nhất.

RÀNG BUỘC CỨNG
1. Chi phí hạ tầng bằng 0: không dùng Google Maps, Mapbox hay dịch vụ tính tiền theo lượt. Không có máy chủ riêng cho dữ liệu vị trí.
2. Nền bản đồ: MapLibre với tile OpenFreeMap. Hiển thị dòng ghi nguồn "© OpenStreetMap contributors" và "OpenFreeMap" ở góc bản đồ, không được ẩn.
3. Ngôn ngữ nhãn: ưu tiên tiếng Việt (name:vi, rồi name). Địa danh có dấu hiển thị đúng, không lỗi font.
4. Chủ quyền: bản đồ hiển thị cho người dùng Việt Nam phải ghi đúng Hoàng Sa và Trường Sa thuộc Việt Nam (nhãn "Quần đảo Hoàng Sa", "Quần đảo Trường Sa" thuộc Việt Nam, đường biển giới theo quy định của Việt Nam). Kiểm tra bằng mắt trên bản đồ thật ở mức zoom thấp và báo cáo kết quả. Nếu tile công khai hiển thị khác, thêm lớp nhãn tự vẽ (GeoJSON) đè lên. Đây là mục bắt buộc trước khi phát hành.
5. Riêng tư: vị trí là dữ liệu nhạy cảm. Chỉ xin quyền khi người dùng bấm Lưu chi lần đầu, nói rõ lý do bằng tiếng Việt. Từ chối quyền thì app vẫn lưu chi bình thường, chỉ không có ghim. Không theo dõi nền. Cho phép xóa vị trí của từng khoản chi và xóa toàn bộ lịch sử vị trí.
6. Giữ đúng phong cách pixel kawaii của app (Plan 1 đến 7): heo là điểm "bạn đang ở đây", ghim hình giọt nước viền nâu mực, màu ghim theo danh mục, bóng cứng không blur.
7. Chạy được khi mất mạng: ghim và danh sách đọc từ SQLite. Nền bản đồ lỗi thì hiện nền phẳng kem với ghim, không báo lỗi trắng màn.

Trả lời bằng tiếng Việt, đưa mã đầy đủ cho một bước mỗi lần, nêu cách chạy thử và tiêu chí hoàn thành.
````

### 12.2 Prompt B: Áp vào Prototype web (thay Map Pixel bằng bản đồ thật, vẫn giữ chất pixel)

````
Mở rộng tab "Bản đồ" của prototype Ví Heo Con (HTML/CSS/JS thuần, một file) để dùng bản đồ thật.

LƯU Ý MÔI TRƯỜNG: nếu chạy trong khung xem trước bị chặn mạng (artifact), tile sẽ không tải được. Khi đó giữ nguyên bản đồ pixel giả lập làm phương án dự phòng, và chỉ bật bản đồ thật khi tải được style trong 4 giây.

THỰC HIỆN
1. Tải MapLibre GL JS từ CDN với phiên bản cố định, tạo map trong một div thay cho canvas bản đồ. Style: OpenFreeMap (chọn "positron" hoặc "bright" rồi chỉnh màu).
2. Chất pixel: tạo style tùy chỉnh bằng cách đổi màu theo token của app (nền kem #F6EEDC, nước #9AD3E6, công viên #B5DB9A, đường #FFFBF1 viền nâu #2B2118). Thử hiệu ứng pixel: đặt map ở độ phân giải thấp (pixelRatio khoảng 0.4 nếu thư viện hỗ trợ, nếu không thì dùng CSS: map nằm trong khung nhỏ rồi scale lên với image-rendering: pixelated) và báo cáo cách nào hoạt động.
3. Ghim: dùng marker HTML. Marker là canvas 9x12 vẽ lại bằng hàm drawPin hiện có (giữ màu và biểu tượng theo danh mục). Marker "bạn" dùng khuôn mặt heo 16x16 trong vòng tròn.
4. Vị trí thật: navigator.geolocation.getCurrentPosition khi bấm "Lưu chi tại đây". Không dùng watchPosition. Từ chối quyền thì hiện câu thoại heo và cho chọn vị trí bằng cách chạm lên bản đồ.
5. Tên quán: gọi Nominatim reverse một lần khi lưu, gắn header/Referer nhận diện app, cache theo tọa độ làm tròn 4 chữ số. Nếu không có tên quán thì cho người dùng gõ tên. Có nút "Sửa tên".
6. Lưu: mỗi khoản chi có {id, amount, category, ts, lat, lng, accuracy, placeId}. Địa điểm gom theo bán kính 40 m (công thức haversine) thành một "place" với số lần ghé, tổng chi, lần cuối.
7. Bốn chế độ xem, tính từ dữ liệu thật:
   - Hay tới gần đây: số lần ghé trong 14 ngày gần nhất.
   - Quán thường xuyên: số lần ghé trong 30 ngày, nhãn "Khách quen" khi từ 6 lần, nêu chu kỳ "cứ ~N ngày ghé 1 lần".
   - Vị trí gần đây: 6 điểm gần nhất nối bằng đường chấm theo thứ tự thời gian.
   - Vị trí tới nhiều nhất: lớp nhiệt (heatmap) theo số lần ghé và bục top 3.
8. Khi bấm Lưu chi, ghim rơi xuống đúng tọa độ, heo nhún vui, thanh hạn mức cập nhật (đúng như luồng hiện tại).
9. Giữ nguyên các id và hàm đã có (addItem, addExpense) để Nhà, Vườn, Camera vẫn hoạt động.

TIÊU CHÍ HOÀN THÀNH: chạy được trên điện thoại ở 360 px, không tràn ngang, chữ có dấu đúng, có :focus-visible, tôn trọng prefers-reduced-motion, không lỗi console. Báo rõ phần nào không kiểm thử được vì bị chặn mạng.
````

### 12.3 Prompt C: App production (Flutter)

````
Dựng tính năng Bản đồ cho app Flutter {APP_NAME} theo thứ tự dưới đây. Tuân thủ Prompt A.

KIẾN TRÚC
- features/map với 3 lớp: data (SQLite qua Drift), domain (Place, Visit, quy tắc gom nhóm), ui (MapScreen, PinLayer, FilterChips, PlaceSheet, ListPanel).
- Services: LocationService (geolocator, getCurrentPosition một lần), GeocodeService (Nominatim reverse, hàng đợi 1 yêu cầu/giây, cache), PlaceFinder (Overpass bán kính 50 m).
- State: Riverpod. Provider nhận bộ lọc (4 chế độ) và trả danh sách place đã xếp hạng.

BƯỚC 1: Lược đồ dữ liệu
  expense(id, amount, category, ts, note, lat?, lng?, accuracy?, placeId?)
  place(id, name, kind, lat, lng, createdAt)
  Chỉ số theo ts và placeId. Lat/lng làm tròn 5 chữ số (khoảng 1 m). Viết test cho quy tắc gom nhóm: hai khoản chi cách nhau dưới 40 m cùng một place, trên 40 m tách place.
BƯỚC 2: Quyền và vị trí
  Xin quyền khi bấm Lưu chi lần đầu, có màn giải thích tiếng Việt. Android: ACCESS_COARSE/FINE_LOCATION. iOS: NSLocationWhenInUseUsageDescription bằng tiếng Việt. Từ chối thì vẫn lưu chi, bật "chọn vị trí bằng tay".
BƯỚC 3: Bản đồ nền
  MapLibre với style OpenFreeMap đã chỉnh màu theo token. Mặc định nhìn vào vị trí hiện tại hoặc khu vực có nhiều ghim. Giới hạn vùng xem trong Việt Nam. Dòng ghi nguồn luôn hiện. Kiểm tra chủ quyền Hoàng Sa, Trường Sa (xem Prompt A, mục 4).
BƯỚC 4: Ghim và heo
  PinLayer vẽ ghim pixel (cache bitmap theo danh mục và kích thước, FilterQuality.none). Heo là marker vị trí hiện tại. Ghim mới rơi xuống 300 ms khi lưu. Gom cụm (cluster) khi zoom xa.
BƯỚC 5: Bốn chế độ xem và danh sách
  Cùng quy tắc như prototype (14 ngày, 30 ngày, 6 điểm gần nhất, heatmap). Chạm hàng trong danh sách thì bản đồ bay tới ghim và mở PlaceSheet (lần ghé, tổng chi, mỗi lần, lần gần nhất, nút "Chỉ đường" mở Google Maps hoặc Apple Maps bằng deep link của máy, không tốn phí API).
BƯỚC 6: Tên quán
  Lưu khoản chi trước, sau đó chạy ngầm reverse geocode và PlaceFinder để điền tên, không chặn giao diện. Tên tự điền thì người dùng sửa được; tên sửa tay được ưu tiên về sau. Không gọi lặp khi tọa độ nằm trong 40 m của place đã có tên.
BƯỚC 7: Quyền riêng tư
  Màn Cài đặt có: bật/tắt lưu vị trí, xóa vị trí của một khoản chi, xóa toàn bộ lịch sử vị trí, xuất dữ liệu. Mặc định chỉ lưu trong máy.
BƯỚC 8: Ngoại tuyến và lỗi
  Mất mạng: nền phẳng kem + ghim vẫn hiện. Nominatim trả lỗi 429 thì chờ và thử lại chậm dần. Không bao giờ chặn việc lưu chi vì lỗi vị trí.

TIÊU CHÍ HOÀN THÀNH MỖI BƯỚC: 60 fps với 500 ghim, không overflow ở 360x640, tap target từ 44 dp, có test đơn vị cho gom nhóm, xếp hạng 4 chế độ và cache, golden test cho ghim.
````

### 12.4 Prompt D: Dữ liệu cá nhân và pháp lý (Việt Nam)

````
Rà soát tính năng Bản đồ của app {APP_NAME} về dữ liệu cá nhân và nội dung bản đồ tại Việt Nam, trả lời bằng bảng "Mục - Hiện trạng - Rủi ro - Cách sửa".

KIỂM TRA
1. Vị trí được xem là dữ liệu cá nhân nhạy cảm theo quy định bảo vệ dữ liệu cá nhân của Việt Nam (Nghị định 13/2023/NĐ-CP và luật bảo vệ dữ liệu cá nhân có hiệu lực từ 2026; hãy đối chiếu bản hiện hành). Có đủ: thông báo mục đích, sự đồng ý rõ ràng, quyền xem/sửa/xóa, thời hạn lưu?
2. Chính sách quyền riêng tư tiếng Việt, giải thích: lấy vị trí khi nào, lưu ở đâu, có chia sẻ cho ai không (mặc định không).
3. Dịch vụ bên thứ ba: tile OpenFreeMap và Nominatim nhận được gì (địa chỉ IP, tọa độ khi tra cứu)? Nêu rõ trong chính sách.
4. Nội dung bản đồ: biên giới, chủ quyền biển đảo, tên địa danh. Đối chiếu với quy định về xuất bản bản đồ tại Việt Nam trước khi phát hành.
5. Địa giới hành chính Việt Nam đã thay đổi lớn từ 2025 nên dữ liệu OSM có thể chưa kịp cập nhật. App chỉ lưu tên quán và tọa độ, không phụ thuộc tên phường/quận/tỉnh.
6. Cửa hàng ứng dụng: khai báo Data Safety (Google Play) và App Privacy (Apple) đúng với thực tế.

Đây là rà soát kỹ thuật, không thay cho tư vấn của luật sư. Cuối bảng ghi mục nào cần luật sư xác nhận.
````

### 12.5 Prompt E: QA cho Map

````
Kiểm tra tính năng Bản đồ của {APP_NAME}. Với mỗi mục trả lời Đạt / Không đạt kèm bằng chứng và cách sửa.

VỊ TRÍ THẬT
[ ] Lưu chi tại Hà Nội, TP.HCM, Đà Nẵng, một vùng nông thôn: ghim đúng chỗ (sai lệch dưới độ chính xác báo về)
[ ] Từ chối quyền: vẫn lưu chi, có đường chọn vị trí tay   [ ] Tắt GPS: không treo, có thông báo
[ ] Trong nhà (độ chính xác kém): hiện vòng sai số, không ghim sai nhà bên cạnh mà không báo
BẢN ĐỒ
[ ] Nhãn tiếng Việt có dấu đúng   [ ] Hoàng Sa, Trường Sa ghi đúng   [ ] Có dòng ghi nguồn OSM và OpenFreeMap
[ ] Giới hạn vùng xem trong Việt Nam   [ ] Mất mạng: nền phẳng và ghim vẫn hiện
DỮ LIỆU
[ ] Gom nhóm 40 m đúng ở ranh giới (39 m, 41 m)   [ ] Xếp hạng 4 chế độ khớp công thức   [ ] Xóa vị trí xóa sạch cả ghim và thống kê
[ ] Gọi Nominatim không vượt 1 yêu cầu/giây, có User-Agent, có cache   [ ] Không có gọi mạng ngầm khi chỉ mở bản đồ
HIỆU NĂNG VÀ PIN
[ ] 500 ghim vẫn 60 fps   [ ] Không có dịch vụ vị trí chạy nền   [ ] Pin tiêu hao thêm dưới 1% sau 1 giờ dùng
GIAO DIỆN
[ ] Ghim và heo đúng phong cách pixel (viền nâu, bóng cứng)   [ ] Tap target từ 44 dp   [ ] Giảm chuyển động hoạt động đúng
````

---

## Gợi ý cuối

- Plan 12 (Map) là bộ prompt riêng: dán Prompt A trước, rồi B cho prototype web hoặc C cho app Flutter, sau đó D và E.
- Chạy Plan 5 và Plan 6 sớm, vì khu vườn và sprite heo quyết định bản sắc cả app.
- Prototype tương tác của mình có thể làm điểm đối chiếu cho Plan 5, 6, 7 (heo, ao, bát cám, thời điểm trong ngày đều khớp mô tả ở trên).
- Khi đã có tên app thật, thay biến ở đầu file rồi dán lại các Plan.
