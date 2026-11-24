# MASTER PROMPTS: Ví chi tiêu mascot Heo (phong cách kawaii pixel + neo-brutalist)

Bộ prompt dùng để dựng app theo phong cách của 6 ảnh tham khảo: UI viền dày bo góc lớn, bóng đổ cứng, nền kem, khu vườn pixel art có nhân vật đi dạo. Mascot của bạn là **chú heo**.

> **Lưu ý bản quyền:** học *phong cách* (bố cục, độ dày viền, bảng màu, cách kể chuyện bằng mascot), không sao chép mèo, tên "Roll", câu thoại hay tên đơn vị "pate" của app mẫu. Mọi prompt dưới đây đã yêu cầu AI tạo nhân vật, cảnh và câu chữ **gốc**.

## Cách dùng

1. Điền **Biến dự án** ngay bên dưới (một lần).
2. Dán **PLAN 0 (System Prompt tổng)** làm system prompt cố định.
3. Với mỗi việc, dán thêm đúng Plan liên quan (UI, Font, Style...) vào tin nhắn.
4. Thứ tự đề xuất: 0 → Style → Màu → Font → UI → Pixel Art → Mascot → Animation → Copy → Dev → Marketing → QA.
5. Tab Giải trí và Hồ sơ: dán thêm PLAN 14 (hub), 15 (Heo qua đường), 16 (Hộ Chiếu), 17 (Trò chuyện Heo AI), 18 (banner phố ẩm thực) và 19 (công thức pixel art cảnh Việt Nam). Gửi kèm prototype `ve-heo-con.html`.
6. Ưu tiên khi mâu thuẫn: PLAN 15 đến 19 (mới nhất) trước PLAN 14 và PLAN 12.

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

> **ĐÃ THAY THẾ (24/11/2026) bởi PLAN 16 (Hộ Chiếu Quán Quen).** App không còn bản đồ nền. Giữ phần này làm tài liệu lưu trữ nếu sau này muốn bản đồ trở lại; xem thêm 16.2 (khảo sát nguồn, lưu ý OpenFreeMap và Nominatim không nên dùng cho bản sản xuất).

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

## PLAN 13: Heo bắn (AngryPig, cứu heo con) + việc nhà + kinh tế chung

````
Dựng game "Heo bắn" (ná cao su kiểu Angry Birds, đảo vai) trong tab Giải trí của {APP_NAME}. Dùng chung nhân vật, vé và cám với Heo bay.

LUẬT CHƠI
- Màn 1 chỉ có 1 heo mẹ trên ná. Bên phải là Ổ Chim: Chim Non canh giữ các lồng sắt nhốt heo con. Heo mẹ phải bay qua phá lồng để cứu heo con; hạ chim chỉ là phụ.
- Kéo heo về sau rồi thả. Đạn: heo thường; heo cánh (chạm khi bay để lao tới); heo cám (chạm để nổ).
- Ba màn: Ổ chim nhỏ, Tháp ổ chim, Cổng ổ chim. Khối gỗ, đá, kính, lồng có máu và khối lượng khác nhau; cột cao có thể đổ.
- Chim Non đội băng theo danh mục chi: ăn uống đỏ, đi lại xanh, mua sắm hồng.
- Thưởng: hạ 1 chim +2 cám, phá 1 lồng +5 cám, thắng màn +3 cám mỗi sao (tối đa 3 sao, 9 sao cho 3 màn).
- Heo con đã cứu vào đội: con thứ nhất mang cánh, con thứ hai mang cám nổ ở các ván sau, và heo nhà no thêm.

LIÊN KẾT BẮT BUỘC
- Ngân sách: đã chi dưới 50% hạn mức hôm nay thì +1 lượt bay; chi vượt hạn mức thì -1. Heo nhà đói (<25%) thì bắn yếu (x0.85).
- Vé dùng chung hai game: mỗi ván mất 1 vé; ghi một khoản chi (từ Chụp, Hộ Chiếu, Chat, Hồ sơ) +1 vé; 10 cám đổi 1 vé; tối đa 99.
- Việc nhà: ba chỉ số heo, cá ao, hoa hồng (0 đến 100%) giảm theo thời gian thật (heo 1.2, cá 0.8, hoa 0.6 điểm mỗi phút, tối đa 12 giờ bù). Đồ ăn hái ở Heo bay mang về: bắp +10 và cà rốt +8 cho cá; chuối +9, táo +10, dưa hấu +14 cho hoa hồng. Cho heo ăn cám +25 cho heo, mất 1 cám. Dưới 25% thì heo ngoài Vườn buồn và nói nhắc.
- Dùng chung sprite heo, cánh, đồ ăn, nền cảnh với Heo bay.

KỸ THUẬT: canvas 224x140, vật lý khối AABB (đạn là hình tròn), giảm chuyển động khi bật reduced-motion. Kiểm thử: màn không tự xê dịch khi chưa bắn; mỗi màn có ít nhất một cú bắn phá được lồng; hết vé thì báo cách có vé, không tự chạy.
````

---

## PLAN 14: Tab Giải trí (Trung Tâm Heo Con): hub, Chat, các game, Hộ Chiếu

> **Cập nhật 24/11/2026:** "Bản đồ" thành "Hộ Chiếu Quán Quen" (PLAN 16); Chat chỉ còn Heo-Coach local-first, bỏ "Hội bạn thân" (PLAN 17); thêm game Heo qua đường (PLAN 15). Khi 14.1 mâu thuẫn với PLAN 15 đến 19 thì theo PLAN 15 đến 19.

Tab Giải trí là tab thứ 4 trong thanh 5 tab: Vườn, Nhà, Chụp (giữa), Giải trí, Hồ sơ. Prototype đối chiếu: file `ve-heo-con.html`. Gửi kèm prototype và MASTER-PROMPTS.md cho agent.

### 14.1 Prompt chính cho agent thiết kế

````
Bạn là Art Director kiêm UI engineer. Thiết kế và dựng tab "Giải trí" (Trung Tâm Heo Con) của {APP_NAME}, giống prototype đính kèm `ve-heo-con.html` về cấu trúc, luồng và phong cách. Đồng bộ với MASTER-PROMPTS.md: Plan 1 đến 4 (style, màu, font, UI), 5 đến 7 (pixel, heo, hành vi), 8 (giọng văn), 12 (bản đồ thật), 13 (Heo bắn). Mọi giá trị khác với tài liệu thì ghi rõ chỗ lệch và lý do, không tự đổi.

1) CẤU TRÚC
- Tab Giải trí = hub. Chat, Heo bay, Heo bắn, Heo qua đường, Hộ Chiếu là năm màn con, mỗi màn có nút "‹ Trung tâm Heo Con" ở đầu. Khi ở màn con, tab Giải trí vẫn sáng.
- Hub gồm: pill "PIGFLY HUB" (chấm đỏ), chip chuỗi ngày (vàng), avatar mặt heo, tiêu đề "Trung Tâm Heo Con", lời chào "Chào {TÊN}! Khám phá giải trí & quán quen của bạn", hai chip Vé và Cám, rồi các thẻ xếp dọc (4 thẻ gốc, thêm thẻ thứ 5 "Game Heo Qua Đường · SÀI GÒN · LÁCH ĐƯỜNG" theo PLAN 15).
- Mỗi thẻ: ô icon pixel 64px nền màu (viền 3px mực, bo 18px, bóng cứng 3px), tag pill chữ hoa, tên (Baloo 2 ExtraBold), dòng số liệu thật màu xanh, mô tả 1 đến 2 dòng, "Khám phá ngay ›".
  - Trò Chuyện Cùng Heo AI · HEO AI · CHẠY TRONG MÁY · "Heo-Coach đang ngồi chờ".
  - Game Heo Bay · FLAPPY PIG · 60FPS · kỷ lục.
  - Game Heo Bắn · ANGRY PIG · 3 SAO · sao đã được trên 9.
  - Game Heo Qua Đường · SÀI GÒN · LÁCH ĐƯỜNG · sao đã được trên 12.
  - Hộ Chiếu Quán Quen · CHECK-IN · QUÁN QUEN · số quán đã ghé.
- Thanh tab: 5 nút, icon trên chữ dưới, nút Chụp ở giữa màu đỏ khi chọn, nút Giải trí màu vàng khi chọn, icon bong bóng chat.

2) CHAT: chỉ có Heo-Coach, local-first, banner quán cà phê hai chú heo nói chuyện. Chi tiết ở PLAN 17. (Không có "Hội bạn thân".)

3) LIÊN KẾT VỚI PHẦN CÒN LẠI CỦA APP
- Vé, cám, việc nhà, ngân sách: theo Plan 13. Ghi chi ở bất cứ đâu +1 vé.
- Hộ Chiếu Quán Quen: thay Bản đồ, xem PLAN 16 (lưu chi lấy GPS một lần, địa chỉ lấy từ bộ đổi tọa độ của hệ điều hành, chỉ đường mở Google Maps hoặc Apple Maps).
- Cổng phòng trong tab Nhà: Sảnh sang Hồ sơ; Phòng ngủ (tay cầm) sang game; Phòng làm việc sang Hộ Chiếu Quán Quen; Phòng khách sang Chat.
- Hồ sơ đặt hạn mức hôm nay, ảnh hưởng số lượt bay của Heo bắn và câu trả lời của Heo-Coach.

4) PHONG CÁCH
Token, font, bo góc, bóng cứng, nút 44px, nhãn chữ hoa theo Plan 1 đến 3. Icon pixel 16x16 vẽ bằng fillRect, không dùng ảnh. Không sao chép nhân vật hay cảnh của app khác. Hỗ trợ prefers-reduced-motion, :focus-visible, aria-live cho khung chat.

5) KẾT QUẢ CẦN GIAO
(a) Bản thiết kế hub, chat, các màn con ở khung 390x844; (b) bảng token và component mới; (c) luồng điều hướng; (d) danh sách lệch so với tài liệu hiện có; (e) checklist kiểm thử bên dưới.

6) KIỂM THỬ
Bấm đủ các thẻ và quay lại; tab Giải trí sáng ở mọi màn con; không cuộn ngang ở 360px; Coach trả lời đúng khi đổi hạn mức; Hộ Chiếu vẫn dùng được khi mất mạng hoặc từ chối quyền vị trí.
````

### 14.2 Prompt hệ thống cho Heo-Coach (LLM thật)

````
Bạn là Heo-Coach trong {APP_NAME}: một chú heo thân thiện, nói tiếng Việt ngắn gọn (tối đa 4 câu), không phán xét. Bạn chỉ nhận số liệu tổng hợp dạng JSON (hạn mức hôm nay, đã chi, tổng theo danh mục tháng này, khoản gần nhất gồm tên và số tiền, chuỗi ngày, vé, cám, độ no heo, cá, hoa). Không nhận ảnh, vị trí, tên người khác.
Việc của bạn: trả lời về ngân sách; khi người dùng xin phản biện, hỏi 3 câu "cần hay muốn, có cách rẻ hơn không, tuần sau còn xứng đáng không" rồi gợi ý một hành động nhỏ; nhắc chăm heo, cá, hoa hồng khi dưới 25%.
Không đưa lời khuyên đầu tư hay vay mượn, không hứa chắc kết quả tài chính; nếu hỏi ngoài phạm vi thì nói nhẹ nhàng là bạn chỉ giúp về chi tiêu và chăm heo. Không bịa số liệu: thiếu dữ liệu thì nói thiếu. Nếu người dùng có dấu hiệu khủng hoảng, ngừng chủ đề tiền và gợi ý họ liên hệ người thân hoặc đường dây hỗ trợ.
````

### 14.3 Prompt phụ: tab Hồ sơ (liên kết với Giải trí)

````
Giữ tab Hồ sơ là nơi đặt kế hoạch cá nhân: hạn mức mỗi ngày, mục tiêu, danh mục thu chi, giao diện. Thêm một thẻ lối tắt "Trung Tâm Heo Con" dẫn sang tab Giải trí, hiện vé, cám và chuỗi ngày. Khi người dùng đổi hạn mức, hub, Heo bắn (số lượt bay) và Heo-Coach cập nhật ngay. Giữ phong cách pixel như các tab khác.
````

---

### 14.4 Prompt: Banner pixel anime cho tab Giải trí

Prototype đối chiếu: `ve-heo-con.html` (hàm `fbStatic`, `fbDraw` trong phần banner). Gửi kèm file này.

````
Dựng banner đầu tab Giải trí của {APP_NAME} theo phong cách pixel art anime, giống banner trong prototype đính kèm. Banner không có chữ tiêu đề; tên màn nằm ở nhãn tiếp theo trong giao diện.

KHUNG: canvas logic 192x88, hiển thị full chiều rộng, bo 24px, viền 3px mực, image-rendering pixelated. Hai dải mực dày 2px ở trên và dưới như khung phim.

LỚP VẼ (từ sau ra trước), chỉ dùng fillRect, vẽ nền tĩnh một lần vào canvas phụ:
1) Trời hoàng hôn 8 dải: tím #6B5FC0, #8F76CC, #B685CB, hồng #E391BF, #F8A6B0, cam #FFC096, #FFDA9C, #FFEBB8. Chỗ giáp giữa hai dải trộn caro 1px (dither).
2) Mặt trời #FFF6CF, quầng #FFE9A8, cắt 5 vạch ngang dày dần ở nửa dưới (kiểu anime).
3) Núi xa #B58FC4, núi gần #9B78B8, thành phố nhà phố #6E5A9E với cửa sổ vàng #FFE08A rải ngẫu nhiên có seed.
3b) Địa danh TP.HCM vẽ bóng tối hơn lớp phố (#4B3F86), từ trái sang phải: Chợ Bến Thành (khối thấp, tháp đồng hồ có mái chóp), Nhà thờ Đức Bà (gạch đỏ #8A4560, hai tháp chuông nhọn có thánh giá, cửa sổ hoa hồng), Bitexco (tháp thon có sân đáp trực thăng nhô ra ở 2/3 chiều cao, vạch kính), Landmark 81 (tháp cao nhất, bậc thang, cột ăng-ten), Dinh Độc Lập (khối thấp ngang, hàng cột, cờ đỏ trên nóc). Đèn báo đỏ nhấp nháy trên Landmark 81 và Bitexco. Chỉ dùng hình khối nhận diện, không chép ảnh chụp hay logo.
4) Mặt đất cỏ #5E9A57, mép #8CC46F, chấm cỏ tối #3E7A3A, hoa vàng và hồng rải đều.
5) Tháp ổ chim bên phải (cột, sàn gỗ, lồng sắt) và hai Chim Non đội băng đỏ nhún nhẹ.
LỚP ĐỘNG (vòng lặp rAF, dt <= 0.05, dừng khi rời màn):
- Sao lấp lánh nhấp nháy, vài sao 4 cánh; mây trôi 3 lớp tốc độ khác nhau.
- Hai máy bay Vietnam Airlines bay ngang trời ở hai độ cao, tốc độ và chiều khác nhau, có vệt khói mờ phía sau. Thân trắng, đuôi xanh lam có chấm vàng (hoa sen cách điệu), hàng cửa sổ xanh. Không chép logo hay chữ hãng.
- Đường phố ở đáy banner (vỉa hè, mặt đường xám tím, vạch vàng đứt). Heo luân phiên mỗi ~13 giây: (a) chạy xe máy đỏ trên đường, đội mũ bảo hiểm vàng có kính, bánh xe quay, khói xả; (b) đi bộ trên bãi cỏ (sprite walk 2 khung). Có thêm một xe máy khác chạy ngược chiều ở làn trên.
TƯƠNG TÁC: chạm banner thì heo nhảy, bắn ra 14 hạt lấp lánh trắng, vàng, hồng; cứ 3 lần chạm đổi giữa xe máy và đi bộ. Nếu bật reduced-motion chỉ vẽ một khung tĩnh. Có aria-label mô tả cảnh.

KHÔNG: không dùng ảnh thật hay sprite của app khác, không đặt chữ lên banner. Bản chính thức nhờ họa sĩ vẽ lại trong Aseprite rồi thay vào cùng bố cục và máy trạng thái.
````

---

### 14.5 Prompt: Banner động tab Hồ sơ ("góc làm việc của heo")

Prototype đối chiếu: `ve-heo-con.html` (phần `mb*` trong tab Hồ sơ). Gửi kèm file này.

````
Dựng banner đầu tab Hồ sơ của {APP_NAME}: một góc làm việc pixel động, mỗi vật trong cảnh là một lối tắt tới một mục của trang. Phong cách pixel art vui nhộn, cùng token với các tab khác (Plan 1 đến 3).

KHUNG: canvas logic 176x80, full chiều rộng, bo 28px, viền 3px mực, pixelated. Nền tĩnh vẽ một lần vào canvas phụ, vẽ lại khi đổi màu app hoặc sang ngày mới. Vòng lặp rAF (dt <= 0.05) chạy khi tab Hồ sơ đang mở.

VẬT VÀ LIÊN KẾT DỮ LIỆU
- Tường: màu theo "Màu app" (Hồng Heo #F9E6C9, Xanh Mint #D7F0E4).
- Cửa sổ: trời đổi theo giờ thật (ngày xanh nhạt có mặt trời di chuyển; chiều hồng; đêm xanh đen có sao nhấp nháy và trăng); mây trôi. Chạm: xoay "theo giờ thật, đêm, ngày".
- Giấy dán 3 màu theo danh mục (ăn uống, đi lại, mua sắm), nhún nhẹ. Chạm: cuộn tới mục Danh mục.
- Lịch hiển thị ngày thật, kèm ngọn lửa nhấp nháy và số chuỗi ngày. Chạm: ngọn lửa bùng, hiện câu về chuỗi ngày.
- Heo đứng trên bàn (sprite 24x20 phóng 2x): chớp mắt, vẫy đuôi 2 khung. Chạm: nhảy, hiện "Hôm nay chi tối đa X, còn Y" (đổi sang lố khi vượt hạn mức).
- Heo đất: mức vàng bên trong = % tiến độ tổng các mục tiêu. Cứ ~3,6 giây có một xu rơi vào, heo đất nhún 1px và tóe tia sáng. Chạm: xu bắn tung tóe, hiện "Đã giữ A trên B (p%)".
- Chậu hoa hồng lớn dần theo số khoản đã lưu (mỗi 3 khoản thêm một bậc, bậc 3 nở bông đỏ). Chạm: hạt nước rơi, cây nhô lên.
- Ly nước có khói bay, các nút vô hình đặt trên từng vật, có aria-label tiếng Việt, tối thiểu 44px khi quy ra màn hình.
BÓNG THOẠI: một dòng cuối banner, aria-live polite, tự tắt sau 3 giây.
HÀNG LỐI TẮT dưới banner: Ngân sách, Mục tiêu, Danh mục, Màu app (cuộn tới mục tương ứng) và nút vàng "Trung Tâm Heo Con ›" sang tab Giải trí.
Reduced-motion: chỉ vẽ một khung tĩnh, các chạm vẫn hiện bóng thoại. Không dùng ảnh thật hay nhân vật của app khác.
````

---

## PLAN 15: Game Heo Qua Đường (văn hóa đi bộ Sài Gòn)

Prototype đối chiếu: `ve-heo-con.html`, màn "Heo qua đường" trong tab Giải trí. Gửi kèm file này.

````
Dựng mini game "Heo qua đường" cho {APP_NAME}, nói về văn hóa băng qua đường của người đi bộ Việt Nam: không có đèn dừng chờ, phải đi đều, lích nhích, để xe máy tự lách. Dùng chung vé, cám, heo và việc nhà với Heo bay và Heo bắn (Plan 13).

CẢNH (2.5D pixel, nhìn từ sau lưng heo xuống đường): canvas logic 192x256 dọc, hiển thị pixelated. Tham chiếu phong cách: ảnh chụp game 3D góc nhìn thực của người đi bộ Sài Gòn (người dùng gửi kèm); chỉ lấy bố cục và độ chân thực, không chép nhân vật, mô hình hay tài sản của game đó.
- Mặt tiền địa danh chiếm ~54px trên cùng, vẽ chi tiết nhìn thẳng: màn 1 Bưu điện Thành phố (tường vàng, trụ trắng, cửa vòm đỏ, đồng hồ, cửa chớp xanh), màn 2 Chợ Bến Thành (tháp đồng hồ giữa, cổng vòm, cửa sổ xanh), màn 3 Nhà thờ Đức Bà (gạch đỏ, hai tháp chuông, hoa hồng), màn 4 Dinh Độc Lập (khối trắng, lưới họa tiết xanh xám, cờ đỏ sao vàng). Cây ở hai góc.
- Vỉa hè xa lát gạch đỏ với dãy xe máy đỗ thu nhỏ; vỉa hè gần lát gạch đỏ lớn hơn (lớp gạch tăng kích thước theo chiều sâu), có lối xám dẫn tới vạch qua đường, biển báo xanh và hai ghế nhựa đỏ.
- Phối cảnh: 5 làn đường cao dần 20, 23, 26, 29, 32px với tỉ lệ xe 0,62, 0,72, 0,82, 0,92, 1,0 (làn xa nhỏ và chậm hơn). Vạch kẻ đường chuyển dần: vạch trắng đứt, vạch đôi vàng ở giữa, vạch qua đường hình thang (rộng 48px ở xa đến 92px ở gần), các sọc dày dần theo chiều sâu. Vết nứt, ổ gà, nắp cống vẽ rải ngẫu nhiên có seed.
- Sắp xếp vẽ theo y (xe xa vẽ trước, xe gần và heo vẽ sau).
- Heo nhìn chéo từ phía sau (góc 3/4 sau), để thấy nón lá và dáng đi tới địa danh: nón lá hình chóp 7 tầng có sọc vân và quai đỏ hai bên, áo đỏ che lưng, mông hồng có đuôi xoắn, bốn chân (hai chân sau lớn, hai chân trước nhỏ và tối hơn ở xa) bước xen kẽ theo đường chéo cùng thân nhún 1px, một bên tai và mũi heo thò ra cạnh nón. Quay trái hoặc phải theo hướng đi ngang gần nhất bằng cách lật gương. Khi "Giơ tay" thì chân trước xa giơ cao kèm tia sáng. Vòng trắng dưới chân thể hiện vùng va chạm, có đổ bóng. Heo cao ~34px ở làn gần, nhỏ dần ở làn xa (tỉ lệ 0,8 đến 1,1 theo làn). Hai tư thế đổi theo hướng đi: đi lên (hoặc đứng yên) thì nhìn chéo từ phía sau như trên; bấm ◀ hoặc ▶ để lách thì chuyển sang nhìn nghiêng, dùng lại sprite heo 24x20 của các màn khác (thấy rõ mắt, mũi, tai, bốn chân bước xen kẽ), vẫn đội nón lá, lật gương theo hướng đi. Giữ tư thế nghiêng 0,3 giây sau khi thả phím ngang để không nhấp nháy khi đi chéo.
PHƯƠNG TIỆN (vẽ bằng fillRect, kích thước theo tỉ lệ làn, làm tròn từng khối): xe ga có người lái (mũ bảo hiểm đủ màu, áo màu, một số bịt khẩu trang, một số đội nón lá, một số chở thêm người sau hoặc thùng hàng sau xe), bánh xe có nan quay, đèn pha, đèn hậu; xe hơi (trắng, đỏ, đen, xanh, taxi xanh lá và vàng có đèn mui, không dùng logo); xe buýt trắng sọc xanh lá có hàng cửa sổ. Làn xa nhiều xe hơi, xe buýt hơn; làn gần chủ yếu xe máy.
LUẬT (quan trọng, đây là cốt lõi văn hóa):
- Giữ nút ▲ (hoặc phím mũi tên, WASD) để heo đi chậm đều 20px/s; ◀ ▶ ▼ cũng giữ để di chuyển. Không có nút chạy.
- Xe máy lách: khi heo đang di chuyển và xe máy tới gần (cách ~46px, cùng làn), xe lệch ngang ~10px để tránh. Nếu heo đứng yên hơn 0,9 giây thì xe máy không tránh nữa và có thể tông; hiện dấu "!" đỏ trên xe và thông báo "Bíp bíp! Đừng đứng yên!".
- Xe hơi, xe buýt không nhường. Nút "Giơ tay" làm xe trước mặt phanh còn ~10% tốc độ trong 1,6 giây. Số lần giơ tay: 2, thêm 1 nếu hôm nay chi dưới 50% hạn mức.
- 3 mạng. Bị tông: mất 1 mạng, heo về vạch xuất phát, bất tử 1,5 giây (nhấp nháy). Hết mạng thua, mất 2 cám "tiền thuốc" (không âm).
- Chạm vỉa hè đối diện là thắng: +6 cám, +3 cám mỗi sao (sao = số mạng còn lại, tối đa 3 sao mỗi màn, 12 sao cho 4 màn), nhặt thêm cám trên đường (3 đồng xu mỗi màn), heo no thêm 10%.
LIÊN KẾT VỚI VÍ: mỗi ván mất 1 vé (vé chung; ghi chi +1 vé; 10 cám đổi 1 vé). Mật độ xe nhân với 0,85 nếu hôm nay chi dưới 50% hạn mức, 1,25 nếu chi vượt hạn mức; màn 1/2/3/4 nhân 0,75/0,95/1,15/1,35. Heo đói (<25%) đi chậm x0,85. Màn kết thúc có một câu bài học: "Đi đều thì xe tự lách, chi tiêu đều đặn cũng thắng hoảng loạn" và "Khoản bất ngờ hay đến lúc bạn đứng yên, nên có quỹ dự phòng".
GIAO DIỆN: nút ▲ nổi bật màu vàng, nút "Giơ tay" lớn màu hồng, tất cả >= 44px, giữ được bằng pointer events, không bị chọn chữ. Overlay bắt đầu/thắng/thua dùng thẻ kem viền 3px. Có aria-label cho canvas, thông báo trạng thái aria-live.
KHÔNG: không dùng logo hãng xe, biển hiệu thật, ảnh chụp địa danh; địa danh vẽ bằng khối hình nhận diện. Không khuyến khích băng đường ẩu ngoài đời: thêm dòng nhỏ "Trò chơi mô phỏng. Ngoài đời hãy quan sát kỹ và qua đường ở nơi an toàn."
KIỂM THỬ: giữ ▲ khoảng 10 giây ở màn 1 thì có thể qua; đứng yên giữa làn xe máy thì bị tông; không giơ tay thì xe hơi tông; hết vé thì không bắt đầu và gợi ý đổi cám; chi vượt hạn mức thì đường đông hơn; cả 4 màn đều có địa danh và mặt tiền khác nhau.
````

---

## PLAN 16: Hộ Chiếu Quán Quen (thay hoàn toàn Bản đồ chi tiêu, 0 đồng)

**Quyết định (24/11/2026):** bỏ bản đồ nền trong app. Tab Giải trí không còn thẻ "Bản đồ chi tiêu", thay bằng thẻ "Hộ Chiếu Quán Quen". PLAN 12 (Map) chuyển thành tài liệu lưu trữ, chỉ dùng nếu sau này cần bản đồ nền trở lại. Prototype đối chiếu: `ve-heo-con.html`, màn Hộ Chiếu trong tab Giải trí (file `pass.js`, `pass-b.js`).

**Lý do:** không tile, không máy chủ bản đồ, không lag, không khung vuông rỗng khi mạng yếu, không phụ thuộc nhà cung cấp, không phải gia hạn, không rủi ro vẽ sai Hoàng Sa, Trường Sa. Người dùng cần xem lại "mình đã ghé quán nào, tiêu bao nhiêu" hơn là xem bản đồ; khi cần đi thì mở Google Maps hoặc Apple Maps.

> **Lệch công nghệ cần chốt trước khi giao việc:** biến `PLATFORM` đầu file ghi Flutter, nhưng bản đặc tả Hộ Chiếu do chủ dự án soạn dùng React Native/Expo (`Location.reverseGeocodeAsync`, `PixelIconMapPin`, `PiggySpendMapView.tsx`) và nhắc `AGENTS.md`, `docs/DECISIONS.md` (Quyết định 183). Hãy xác nhận nền tảng thật rồi sửa biến `PLATFORM`; prompt bên dưới viết trung tính, chỗ nào có tên API thì ghi cả hai.

### 16.1 Prompt chính cho agent

````
Bạn là kỹ sư mobile kiêm UI engineer. Dựng màn "Hộ Chiếu Quán Quen" cho {APP_NAME}, thay thế màn Bản đồ chi tiêu, giống prototype đính kèm `ve-heo-con.html` về cấu trúc, luồng, chữ và phong cách. Đồng bộ với MASTER-PROMPTS.md (Plan 1 đến 3 cho style, Plan 13 cho vé và cám, Plan 17 và 18 cho banner). Trước khi viết mã: cập nhật tài liệu sống (docs/DECISIONS.md thêm quyết định mới, đặc tả màn Giải trí, TECH_ARCHITECTURE.md), rồi mới code.

1) NGUYÊN TẮC
- 100% thành phần native của nền tảng (View, Text, Image, ScrollView hoặc tương đương). Không WebView, không tile, không SDK bản đồ nền trong màn này.
- Local-first: mọi dữ liệu vị trí và chi tiêu lưu trong máy. Không gửi tọa độ lên máy chủ.
- Chỉ đọc GPS một lần lúc Lưu chi (độ chính xác cân bằng), không theo dõi nền. Hỏi quyền đúng lúc cần, giải thích lý do, từ chối vẫn dùng được app (khoản chi không có vị trí).

2) DỮ LIỆU
- Mỗi khoản chi có thể mang: lat, lng, accuracy (m), ts, location_name (người dùng gõ, có thể trống), address (địa chỉ tự tìm), district (quận/huyện/thành phố), amount, photo_id.
- Địa chỉ tự tìm bằng bộ đổi tọa độ thành địa chỉ của hệ điều hành (Expo: `Location.reverseGeocodeAsync`; Flutter: gói `geocoding`; Android gốc: `Geocoder`). Kết quả chỉ là ĐỊA CHỈ (đường, phường, quận), không đảm bảo có tên quán. Vì vậy: ô "Tên quán" tùy chọn, để trống thì hiện địa chỉ. Lỗi hoặc mất mạng thì lưu tọa độ, địa chỉ để trống, thử lại sau; không chặn việc lưu chi.
- "Quán" = các khoản chi cùng tên (hoặc cùng ô 50 m khi chưa có tên) gộp lại. Tính: số lần ghé, tổng tiền, lần gần nhất, số lần trong 14 ngày.
- Khoảng cách dùng công thức Haversine từ vị trí hiện tại (lấy một lần khi mở màn hoặc bấm "Định vị"; không có GPS thì dùng vị trí mẫu hoặc ẩn bộ lọc "Gần").

3) MÀN HÌNH (khung 390x844)
- Đầu màn: nút "‹ Trung tâm Heo Con", tiêu đề "Hộ Chiếu Quán Quen", dòng phụ ("Gần bạn tính từ GPS thật" hoặc "...từ vị trí mẫu"), nút "Định vị".
- Banner động "heo dạo phố ẩm thực" (Plan 18).
- Thẻ tổng quan: Quán đã ghé, Quận đã đặt chân, Quán ruột (ghé nhiều nhất), Tổng chi; dưới là các "con dấu" quận (chip "Quận 1 · 2").
- Thanh lọc 4 nút: 14 ngày (ghé trong 14 ngày gần nhất, mới nhất trước), Quen (số lần ghé giảm dần), Gần (khoảng cách tăng dần), Top chi (tổng tiền giảm dần).
- Thẻ nhắc màu vàng kem khi có ảnh chưa gắn vị trí: "Bạn có X ảnh chưa gắn vị trí" + nút "Gắn vị trí hiện tại" (một chạm gắn GPS hiện tại cho cả X ảnh).
- Danh sách thẻ quán: ảnh vuông 52x52 viền 2.5px bo 12px bóng cứng (chưa có ảnh thì icon pixel theo loại quán), tên quán (Baloo 2 ExtraBold), địa chỉ và quận (Nunito 700), huy hiệu "Ghé N lần", "tổng tiền", khoảng cách, dòng "Gần nhất ... · −số tiền", nút "Chỉ đường".
- Trạng thái trống: "Chưa có quán nào trong 14 ngày qua." Có công tắc "Tự gắn vị trí khi lưu chi ở tab Chụp".

4) CHỈ ĐƯỜNG MỘT CHẠM (mở app bản đồ có sẵn, app không vẽ bản đồ)
- Android: `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(name)})`
- iOS: `maps://app?daddr=${lat},${lng}&q=${encodeURIComponent(name)}`
- Dự phòng web: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
Nếu không mở được app thì hiện địa chỉ để người dùng sao chép.

5) LIÊN KẾT: thẻ ở sảnh Giải trí tên "Hộ Chiếu Quán Quen", tag "CHECK-IN · QUÁN QUEN", mô tả "Check-in quán xá, album ảnh và chỉ đường 1 chạm", dòng số liệu "N quán đã ghé". Cổng "Phòng làm việc" trong tab Nhà và hành động "Mở Hộ chiếu quán quen" ở banner Hồ sơ đều dẫn tới đây. Lưu chi ở tab Chụp tự gắn vị trí nếu công tắc bật. Ghi chi +1 vé (Plan 13).

6) QUYỀN RIÊNG TƯ VÀ PHÁP LÝ
- Vị trí gắn với chi tiêu là dữ liệu nhạy cảm về thói quen. Lưu trong máy, cho xóa từng quán hoặc toàn bộ lịch sử vị trí, có công tắc tắt tự gắn.
- Luật Bảo vệ dữ liệu cá nhân 2025 (Luật 91/2025/QH15, hiệu lực 01/01/2026) và Nghị định 356/2025/NĐ-CP áp dụng; đội ngũ cần nhờ luật sư xác nhận cách xử lý dữ liệu vị trí trước khi phát hành (chưa có điều khoản cụ thể nào được kiểm chứng trong tài liệu này).
- Không dùng logo, tên thương hiệu thật làm hình trong app.

7) KIỂM THỬ
Mở từ thẻ sảnh, từ cổng phòng và từ banner Hồ sơ; bốn bộ lọc đổi đúng thứ tự; "Gần" đúng khi đổi vị trí; gắn vị trí cho ảnh làm thẻ nhắc biến mất và danh sách cập nhật; từ chối quyền vị trí vẫn lưu được khoản chi; mất mạng không chặn lưu; nút Chỉ đường mở đúng tọa độ trên Android và iOS; không cuộn ngang ở 360px; 12 quán cuộn mượt 60fps; chạy với `prefers-reduced-motion`.
````

### 16.2 Nếu sau này cần bản đồ nền (lưu trữ, chưa làm)

Kết quả khảo sát 24/11/2026 để agent không phải tra lại. Phần có link là đã đọc nguồn; phần khác là khuyến nghị kỹ thuật chưa đo trên app.

- Hướng 0 đồng bền nhất: MapLibre Native + dữ liệu OpenStreetMap đóng gói PMTiles ngay trong app (`pmtiles://asset://`, MapLibre Android từ 11.7.0 hỗ trợ PMTiles, [ví dụ](https://maplibre.org/maplibre-native/android/examples/data/PMTiles/)). Dung lượng file cắt riêng Việt Nam chưa được đo. Dữ liệu OSM theo giấy phép ODbL share-alike, bắt buộc ghi nguồn.
- Không dùng làm nền sản xuất: [OpenFreeMap](https://openfreemap.org/tos/) (không SLA, có thể ngừng bất cứ lúc nào), Nominatim công cộng ([giới hạn 1 req/giây, cấm autocomplete](https://operations.osmfoundation.org/policies/nominatim/)). Goong, VietMap, Google Maps SDK đều có phí hoặc yêu cầu thanh toán/khóa API ([Goong](https://goong.io/pricing-plans/), [VietMap](https://maps.vietmap.vn/docs/map-api/tilemap), [Google](https://developers.google.com/maps/documentation/android-sdk/usage-and-billing)).
- Hiển thị điểm không lag (khuyến nghị): một nguồn GeoJSON, một lớp circle/symbol, bật clustering (`cluster`, `clusterRadius`, `clusterMaxZoom`, [hướng dẫn](https://docs.mapbox.com/android/legacy/maps/guides/clustering)); chỉ nạp điểm trong khung nhìn; zoom xa thì gom theo lưới H3/geohash hoặc heatmap.
- Bản đồ phải thể hiện đúng Hoàng Sa, Trường Sa. Tham khảo [Nghị định 18/2020/NĐ-CP](https://thuvienphapluat.vn/van-ban/Bat-dong-san/Nghi-dinh-18-2020-ND-CP-xu-phat-vi-pham-hanh-chinh-trong-linh-vuc-do-dac-va-ban-do-434367.aspx) (kết quả tìm kiếm cho thấy mức phạt tới 50 triệu đồng) và [Nghị định 228/2026/NĐ-CP](https://luatvietnam.vn/vi-pham-hanh-chinh/nghi-dinh-228-2026-nd-cp-sua-doi-xu-phat-vi-pham-do-dac-va-ban-do-hieu-luc-15-08-2026-438741-d1.html) sửa đổi, hiệu lực 15/08/2026; chưa xác nhận được điều khoản cụ thể cho ứng dụng di động, cần luật sư.

---

## PLAN 17: Trò chuyện với Heo AI (local-first) + banner quán cà phê Sài Gòn

**Quyết định (24/11/2026):** tab Trò chuyện chỉ còn Heo-Coach. Bỏ hoàn toàn "Hội bạn thân" (bảng xếp hạng, nhắn bạn, tặng cám, thách đấu, mã mời) vì app theo hướng local-first, không có máy chủ bạn bè. Những phần ở Plan 14.1 mục 2 về "Hội bạn thân" không còn hiệu lực. Heo-Coach chạy trong máy: bản prototype dùng luật trả lời theo số liệu app; bản thật có thể gắn mô hình ngôn ngữ chạy trên thiết bị (chưa kiểm chứng mô hình nào đủ nhẹ), prompt hệ thống ở 14.2 vẫn dùng, dữ liệu không rời máy. Prototype đối chiếu: `ve-heo-con.html`, màn Trò chuyện (file `chat-b.js`).

````
Dựng màn "Trò chuyện" của {APP_NAME} theo prototype đính kèm.

BỐ CỤC: đầu màn "‹ Trung tâm Heo Con", tiêu đề "Trò chuyện", dòng phụ "Heo AI ngồi quán cà phê, chạy ngay trong máy". Tiếp theo là BANNER, hàng gợi ý nhanh (Hôm nay còn chi được bao nhiêu? / Tháng này chi nhiều nhất gì? / Phản biện khoản vừa ghi / Heo nhà đói chưa? / Mẹo kiếm vé chơi), ô nhập + nút Gửi, dòng riêng tư ("Heo AI chạy ngay trong máy, đọc số liệu tổng hợp trong app. Ảnh và vị trí không được gửi đi."), rồi mục thu gọn "Lịch sử trò chuyện" chứa toàn bộ tin nhắn dạng danh sách (role log).

BANNER (canvas logic 144x96, hiển thị pixelated gấp 2,5 lần, bội số nguyên): quán cà phê Sài Gòn. Hai chú heo đứng đối diện nhau qua bàn cao nhỏ: heo hồng là người dùng, heo xanh nhạt đeo kính tròn có ăng-ten phát sáng là Heo AI (đổi bảng màu sprite heo hồng sang xanh nhạt, thêm kính và ăng-ten vẽ chồng lên sprite 24x20, lật ngang để nhìn về phía bạn). Trên bàn: phin cà phê đang nhỏ giọt và bốc hơi, hai ly cà phê sữa đá. Nền: cửa sổ chớp xanh nhìn ra phố với xe máy chạy qua, quạt trần quay, ba bóng đèn thả nhấp nháy, biển neon hình cốc cà phê chớp, khung ảnh mặt heo, bảng menu viết phấn, kệ lọ và phin, nón lá và mũ bảo hiểm treo tường, ghế nhựa, sàn gạch bông, tường vàng loang, chân tường xanh ngọc.

CHỮ HIỆN TRÊN BANNER: bong bóng thoại dựng bằng thành phần giao diện thật đặt chồng lên banner (không vẽ chữ vào canvas, để có tiếng Việt có dấu, nét chữ rõ và đọc được bằng trình đọc màn hình). Câu người dùng gửi hiện trong bong bóng hồng trên heo hồng. Heo AI "suy nghĩ" bằng dấu ··· nhấp nháy (ăng-ten nháy nhanh), rồi trả lời trong bong bóng xanh với chữ hiện dần (khoảng 2 ký tự mỗi 28 ms; giảm chuyển động thì hiện ngay). Bong bóng rộng 50% banner, tối đa 3 dòng, chạm vào để mở rộng (cuộn được). Có đuôi bong bóng chỉ về chú heo. Bong bóng AI có aria-live polite. Khi mở màn thì hiện câu cuối của mỗi bên.

HÀNH ĐỘNG: gửi tin thì heo hồng nhảy và "nói" (mắt cười nhấp nháy, nhún nhẹ); AI trả lời thì heo xanh nhảy, tim bay lên; lúc rảnh hai heo tự nhấp cà phê (tư thế cúi đầu) lệch nhau 3 giây; chạm vào heo bên nào thì heo đó nhảy. Không gửi được tin mới khi đang chờ trả lời.

KHÔNG: không logo thương hiệu thật, không chữ trên biển neon và menu (chỉ vạch, icon). Giảm chuyển động: vẽ một khung tĩnh, vẫn đổi bong bóng.
KIỂM THỬ: gửi 5 gợi ý nhanh và một câu tự gõ; câu dài mở rộng được; mất mạng vẫn trả lời; không có phần "Hội bạn thân" ở bất cứ đâu; không cuộn ngang ở 360px.
````

---

## PLAN 18: Banner động "Heo dạo phố ẩm thực Sài Gòn" (đầu màn Hộ Chiếu)

Prototype đối chiếu: `ve-heo-con.html`, màn Hộ Chiếu (hàm `pbStatic`, `pbDraw`, `pbStep` trong `pass-b.js`).

````
Dựng banner động cho đầu màn Hộ Chiếu Quán Quen, canvas logic 192x100 hiển thị pixelated, cùng phong cách với banner Giải trí và Hồ sơ.

CẢNH (hoàng hôn): trời tím cam dithering, vài tòa nhà xa mờ, mặt trời lớn, hàng nhà phố nhiều màu (kem, hồng, xanh lá, vàng, xanh dương, tím) có cửa sổ sáng đèn và cờ treo, dây đèn nhấp nháy ba màu, vỉa hè gạch xám, lòng đường nhựa có vạch đứt, xe máy chạy ngang.
NĂM QUÁN TRÊN VỈA HÈ (đúng thứ tự, mỗi quán nhận ra bằng hình khối và đồ dùng, KHÔNG dùng tên hoặc logo thương hiệu thật):
1. Phở bò: dù sọc đỏ trắng, nồi nước dùng lớn bốc hơi, chồng tô, biển đỏ có hình tô phở.
2. Bún bò: dù cam, nồi nước dùng đỏ nâu, chồng tô, biển vàng hình tô bún có chanh.
3. Trà đá vỉa hè: bàn thấp màu hồng, bình trà xanh lá, ly đá, ghế nhựa thấp đỏ, xanh, vàng, biển hình ly.
4. Cà phê bệt: chiếu cói dưới gốc cây, hai chú heo con ngồi bệt (một đội nón lá), phích và ly bốc hơi.
5. Bánh mì: xe kính có ổ bánh mì xếp bên trong, mái che sọc, biển vàng hình ổ bánh.
HÀNH ĐỘNG: chú heo tự đi dọc lòng đường tới từng quán theo thứ tự, mũi tên vàng nhấp nhô chỉ quán đang tới; tới nơi thì ngồi ăn 2,6 giây, hiện bong bóng icon món, tim bay lên, chữ nổi "Heo ghé {tên món} · {giá}" ở góc trên (aria-live). Hàng nút tên món dưới banner (Phở bò, Bún bò, Trà đá vỉa hè, Cà phê bệt, Bánh mì) và chạm trực tiếp lên quán đều gọi heo tới đó; chạm vào heo thì nhảy và tóe hạt. Hơi nóng bốc lên từ nồi, phin và ly. Chỉ chạy vòng lặp khi đang ở màn Hộ Chiếu. Giảm chuyển động: vẽ một khung tĩnh, bấm nút thì heo dịch ngay tới quán.
Giá và câu mô tả món là số tưởng tượng, bản thật có thể lấy từ quán người dùng đã ghé.
````

---

## PLAN 19: Công thức pixel art chân thực cảnh Việt Nam

Dùng cho mọi banner, cảnh game và minh họa có bối cảnh Việt Nam (quán, phố, nhà, địa danh). Dán đoạn "Prompt" ở cuối vào mọi phiên vẽ cảnh. Các banner, game trong prototype đã làm theo công thức này (xem `fun-c.js`, `cr.js`, `pass-b.js`, `chat-b.js`). Đây là cách vẽ bằng mã để làm prototype; bản chính thức nên được họa sĩ vẽ lại bằng Aseprite hoặc Piskel rồi xuất sprite sheet, giữ nguyên máy trạng thái.

### 19.1 Bảy bước

1. **Chọn khoảnh khắc và ánh sáng.** Một giờ trong ngày (nắng sớm, trưa gắt, hoàng hôn, đêm mưa), một màu chủ đạo ấm, một màu bù lạnh, một hướng sáng. Hoàng hôn Sài Gòn: trời tím rồi hồng rồi cam rồi vàng nhạt sát chân trời, mặt trời có vạch cắt ngang.
2. **Thước đo theo chú heo.** Sprite heo 24x20 là thước chung. Cửa chính cao khoảng 2,5 con heo, xe máy dài khoảng 1,5 con heo, bàn cao ngang lưng heo. Canvas logic nhỏ (144 đến 192 px rộng) và chỉ phóng bằng bội số nguyên (2, 2,5 chỉ khi bố cục chịu được; ưu tiên 2, 3). Không phóng riêng một sprite khác tỉ lệ với cảnh.
3. **Năm lớp độ sâu.** (1) trời; (2) xa: đường chân trời, tòa nhà mờ, màu pha 20 đến 35% màu trời, ít chi tiết; (3) trung: nhà phố, địa danh, nhìn rõ hình khối; (4) gần: vỉa hè, quán, xe đỗ, nhiều chi tiết, viền tối 1px; (5) tiền cảnh: nhân vật, bàn, dây điện. Vẽ theo trục y: xa trước, gần sau. Vẽ nền tĩnh một lần vào canvas phụ, chỉ vẽ lại phần chuyển động mỗi khung.
4. **Bảng màu có kỷ luật.** Tối đa khoảng 32 màu mỗi cảnh. Mỗi chất liệu có dải 3 đến 4 tông, bóng đổi hue sang tím hoặc xanh, vùng sáng đổi sang vàng (không chỉ đổi độ sáng). Viền thống nhất nâu mực `#2B2118`, không dùng đen thuần. Chuyển sắc trời bằng dithering ô 2x2 so le, không dùng gradient mịn.
5. **Chất liệu đặc trưng Việt Nam** (bảng dưới).
6. **Bộn bề có chủ đích.** Mỗi cảnh có 1 điểm nhấn, ít nhất 5 chi tiết nhỏ đặc trưng và ít nhất 3 chuyển động nền độc lập. Mật độ chi tiết cao ở trung cảnh, thưa ở vùng sẽ bị chữ hoặc bong bóng che. Sự bộn bề phải có trật tự (lưới, hàng, nhịp lặp bị phá nhẹ bằng ngẫu nhiên có seed).
7. **Chuyển động và hồi sinh.** Vòng lặp `requestAnimationFrame`, giới hạn `dt` 0,05 giây; mọi ngẫu nhiên dùng RNG có seed để cảnh không đổi giữa các lần chạy; chỉ chạy khi màn đang hiện; có phương án `prefers-reduced-motion` (một khung tĩnh).

### 19.2 Chất liệu và chi tiết Việt Nam

| Thứ cần vẽ | Cách vẽ bằng khối pixel |
|---|---|
| Tường nhà phố cũ | Nền vàng kem, loang ẩm và rêu bằng mảng 4 đến 12 px màu tối hơn một nấc, vài vệt bong tróc; viền cửa trắng ngà; mái hiên hoặc ban công sắt |
| Cửa chớp | Xanh lá, sọc ngang 3 px, một cánh mở hé |
| Gạch bông | Ô 12x8, hoa bốn cánh hai màu (đỏ gạch, xanh ngọc) trên nền kem, ron nhạt |
| Vỉa hè gạch đỏ hoặc xám | Chữ nhật xếp so le, ron tối; gạch to dần về phía gần |
| Mái tôn và ngói | Tôn: sọc dọc, vệt gỉ cam; ngói âm dương: hàng cong |
| Dây điện chằng chịt | Đường 1 px mực, võng theo hàm sin giữa hai cột, 3 đến 6 sợi mỗi cột, hộp biến áp |
| Biển hiệu | Nền đậm, hình món ăn hoặc đồ vật; không dùng chữ thương hiệu thật, chữ thật để ở giao diện bên trên |
| Xe máy | Bánh tròn bán kính 4, thân hai khối, người lái 3 khối (mũ bảo hiểm, áo, chân); đổi màu mũ, áo; một số bịt khẩu trang, đội nón lá, chở thêm người; chạy có khói và bánh quay |
| Quán vỉa hè | Ghế nhựa thấp (đỏ, xanh, vàng), bàn thấp, dù hoặc bạt sọc, thùng xốp, ly đá, nồi bốc hơi |
| Cà phê | Phin kim loại nhỏ giọt, ly cà phê sữa đá (lớp nâu, lớp sữa, đá, ống hút đỏ) |
| Cây đường phố | Me, phượng, bàng: tán 3 tầng sáng, thân nâu có vệt; lá rụng |
| Nón lá và mũ | Nón lá: chóp nhiều tầng, sọc vân, quai đỏ; mũ bảo hiểm tròn nhiều màu |
| Đèn | Bóng thả, dây đèn nhấp nháy ba màu, neon chớp; quầng sáng alpha thấp |
| Mưa và đêm | Hạt xiên 2 px, vũng nước phản chiếu đèn (lật dọc, alpha 50%) |
| Địa danh | Vẽ bằng khối nhận diện (Bưu điện, Chợ Bến Thành, Nhà thờ Đức Bà, Bitexco, Landmark 81, Dinh Độc Lập), không sao chép ảnh chụp |

### 19.3 Điều không làm

Gradient mịn hoặc làm mờ; phóng không nguyên; nhiều hướng sáng; đối xứng quá hoàn hảo; viền đen thuần; logo, biển hiệu, tên thương hiệu thật; mặt người thật, biển số xe thật; sao chép ảnh hay game của người khác (chỉ học nguyên tắc: góc nhìn, chiều sâu, mật độ chi tiết).

### 19.4 Kiểm tra chất lượng

- Chụp ở rộng 420 px, tỉ lệ 2x và nhìn một lần.
- Bài thử nheo mắt: làm mờ ảnh, vẫn nhận ra giờ trong ngày, địa điểm, nhân vật chính.
- Chữ, bong bóng, nút không che mất điểm nhấn; không cuộn ngang ở 360 px.
- Chỉ dùng `fillRect` và canvas 2D, không ảnh ngoài; chạy 60 khung hình trên máy tầm trung.
- Có `aria-label` mô tả cảnh bằng tiếng Việt.

### 19.5 Prompt (dán đầu mọi phiên vẽ cảnh Việt Nam)

````
Vẽ cảnh pixel art chân thực về Việt Nam cho {APP_NAME} bằng canvas 2D, chỉ dùng fillRect, theo PLAN 19 của MASTER-PROMPTS.md:
- Chọn một khoảnh khắc ánh sáng, một màu chủ đạo ấm và một màu bù lạnh, nêu rõ hai màu đó trước khi vẽ.
- Dùng sprite heo 24x20 làm thước đo; canvas logic nhỏ, chỉ phóng bằng bội số nguyên.
- Dựng 5 lớp độ sâu (trời, xa, trung, gần, tiền cảnh), xa pha màu trời, gần có viền mực 1 px.
- Mỗi chất liệu 3 đến 4 tông theo dải hue (bóng ngả tím hoặc xanh, sáng ngả vàng), tối đa khoảng 32 màu, viền nâu mực #2B2118, chuyển sắc trời bằng dithering 2x2.
- Có 1 điểm nhấn, ít nhất 5 chi tiết nhỏ đặc trưng (chọn trong bảng 19.2) và ít nhất 3 chuyển động nền; dây điện, ghế nhựa, xe máy, nón lá là chi tiết bắt buộc với cảnh phố.
- Dùng RNG có seed; vòng lặp giới hạn dt; chỉ chạy khi màn hiện; có phương án giảm chuyển động.
- Không logo, tên thương hiệu, mặt người thật, biển số thật; địa danh vẽ bằng khối nhận diện.
- Giao: mã, ảnh chụp 420 px (2x), danh sách chi tiết đã vẽ theo bảng 19.2, và các điểm chưa đạt độ chân thực mà họa sĩ cần vẽ lại.
````

## Gợi ý cuối

- Plan 14 (tab Giải trí) dùng cùng prototype `ve-heo-con.html`: gửi file đó kèm prompt 14.1.
- Plan 12 (Map) đã thay bằng Plan 16 (Hộ Chiếu Quán Quen); chỉ dùng Plan 12 nếu muốn bản đồ nền trở lại.
- Mọi cảnh có bối cảnh Việt Nam: dán Prompt ở 19.5 trước khi giao việc cho agent vẽ.
- Chạy Plan 5 và Plan 6 sớm, vì khu vườn và sprite heo quyết định bản sắc cả app.
- Prototype tương tác của mình có thể làm điểm đối chiếu cho Plan 5, 6, 7 (heo, ao, bát cám, thời điểm trong ngày đều khớp mô tả ở trên).
- Khi đã có tên app thật, thay biến ở đầu file rồi dán lại các Plan.
