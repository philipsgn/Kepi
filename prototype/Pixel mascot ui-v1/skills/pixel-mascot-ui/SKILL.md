---
name: "pixel-mascot-ui"
description: "Dựng UI app kawaii neo-brutalist có khu vườn pixel art vẽ bằng code (canvas) và mascot tự đi dạo bằng máy trạng thái; dùng khi cần cảnh pixel + nhân vật động trong app."
---

# Pixel mascot UI (kawaii neo-brutalist)

Dùng khi người dùng muốn một màn hình app có cảnh pixel art và nhân vật mascot di chuyển, kèm UI viền dày bo góc lớn. Mặc định làm bản HTML/CSS/JS thuần chạy được ngay; sau đó mới chuyển sang Flutter/React Native nếu được yêu cầu.

## Quy trình

1. **Token trước, code sau.** Khai báo `:root` gồm 5-6 màu (kem nền, kem thẻ, nâu mực cho viền và chữ, màu mascot, xanh = đạt, đỏ = lố, vàng = thưởng) và 2 font. Mọi màu trong CSS lấy từ token.
2. **Font:** Baloo 2 ExtraBold cho tiêu đề và số tiền, Nunito 600-800 cho chữ thường và nút. Cả hai hỗ trợ tiếng Việt. Tiêu đề line-height >= 1.12 để dấu không bị cắt. Số tiền dùng `font-variant-numeric: tabular-nums`.
3. **Phong cách UI:** viền 3px nâu mực, bo 26-28px (thẻ) hoặc 999px (nút), bóng cứng `0 3px 0 mực` (không blur), nhấn nút dịch xuống 2px. Nhãn viết hoa 12px, letter-spacing 0.16em. Thanh tiến độ 10 ô.
4. **Cảnh pixel vẽ bằng code**, không dùng ảnh:
   - Một canvas logic nhỏ (ví dụ 176x132), CSS `image-rendering: pixelated; width:100%; height:auto`.
   - Helper tối thiểu: `R(ctx,x,y,w,h,color)` (fillRect), `E(ctx,cx,cy,rx,ry,color)` (elip theo điểm), `shape(ctx,rows,fill,ox,oy)` (hình theo dòng `[y,x0,x1]` kèm viền nâu 4 hướng), `mk(w,h,fn)` (tạo canvas ngoài màn hình).
   - Rải chi tiết ngẫu nhiên bằng RNG có seed (mulberry32) để cảnh không đổi giữa các lần chạy.
   - Tách lớp: `bg` (nền tĩnh, vẽ một lần vào canvas phụ) → vật cần sắp theo trục Y (cây, ghế, mascot) → `fg` (bụi cỏ, hoa phía trước, luôn vẽ sau mascot).
   - Chọn chi tiết theo bối cảnh của người dùng (ví dụ Việt Nam: gạch bông, ghế nhựa đỏ, ao sen, cây chuối, hàng rào tre). Không sao chép nhân vật hay cảnh của app khác.
5. **Sprite mascot** khoảng 24x20 px vẽ hướng phải, lật ngang bằng `ctx.scale(-1,1)` khi đi trái. Các tư thế: stand (2 khung đuôi), walk (2 khung chân, thân nhún 1px), sleep (nằm thấp, mắt nhắm, chữ z bay), eat (cúi đầu), happy (mắt cười, nhảy theo `abs(sin)`, tim nổi), sad (đầu hạ, giọt lệ). Avatar tròn là mặt nhìn thẳng 16x16.
6. **Máy trạng thái hành vi:** idle (1.5-4s) → ~68% chọn điểm đến ngẫu nhiên và walk, ~14% sleep, còn lại đứng thêm. Walk ~24px/s (chậm hơn khi mascot buồn), đổi khung chân mỗi 0.2s. Vùng đi được là hình chữ nhật; vùng cấm (ao) kiểm tra bằng công thức elip, khi chạm thì trượt theo từng trục, kẹt cả hai thì dừng. Vòng lặp `requestAnimationFrame` giới hạn `dt <= 0.05`.
7. **Gắn dữ liệu với nhân vật:** số ô đầy = `floor(đã chi / hạn mức * 10)`; vượt hạn mức thì ô đỏ, mascot buồn và đi chậm; dưới hạn mức thì mascot nhảy nhẹ khi ghi khoản chi. Đơn vị thưởng đặt tên theo mascot (heo → "cám").
8. **Tương tác:** chạm mascot → vui + câu thoại; chạm sân → đi tới; chạm vùng cấm → mascot nói không đi được; nút "cho ăn" → chạy tới bát, ăn, rồi vui. Bong bóng thoại dùng `aria-live="polite"`.
9. **Thời điểm trong ngày:** lớp phủ màu trên cùng (chiều cam nhạt, đêm xanh đen kèm cửa sổ sáng và đom đóm). Một nhãn trạng thái bấm được để đổi khi thử.
10. **Truy cập:** tôn trọng `prefers-reduced-motion` (mascot không tự đi, chỉ phản hồi khi chạm), có `:focus-visible`, nút tối thiểu 44px.

## Quy tắc code

- Chỉ dùng `fillRect` và canvas 2D; không làm mịn ảnh pixel.
- Giữ mascot trong một sprite canvas 24x20 rồi `drawImage` lên cảnh, đừng vẽ thẳng lên canvas cảnh.
- Không dùng thư viện cho phần này; một file HTML là đủ.
- Thẻ chi tiêu đè lên đáy khung cảnh khoảng 20-25px, không hơn, kẻo che mất sân; chừa khoảng trống phía dưới cho nhãn trạng thái.

## Kiểm tra

- File dài (>300 dòng) thì viết thành nhiều phần nhỏ rồi ghép bằng `cat`, vì một lần ghi quá dài có thể bị cắt giữa chừng.
- Chạy `node --check` trên phần JS đã ghép để bắt lỗi cú pháp.
- Chụp ảnh bằng Playwright (viewport ~420px, deviceScaleFactor 2) và xem đúng một lần; sửa một lượt rồi dừng.
- Môi trường sandbox có thể chặn Google Fonts nên ảnh chụp hiện font dự phòng. Đó không phải lỗi của trang.
- Test logic: mascot không bao giờ vào vùng cấm hoặc ra ngoài vùng đi được; số ô và trạng thái buồn đổi đúng quanh ngưỡng 100%.

## Giới hạn cần nói rõ với người dùng

Pixel art vẽ bằng code đủ đẹp để làm prototype và thử hành vi. Bản chính thức nên được họa sĩ vẽ lại trong Aseprite/Piskel, xuất sprite sheet, rồi thay vào cùng máy trạng thái.