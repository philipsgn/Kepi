# 🎨 BỘ PROMPT CHUẨN STUDIO: MASCOT CHÚ HEO BAY PIGFLY (3D CLAY CHIBI)

> **Mục đích:** Bộ câu lệnh tạo ảnh tiêu chuẩn chuyên nghiệp cho Midjourney v6, ChatGPT Plus (GPT-4o DALL-E 3), hoặc Google Imagen 3 để tạo ra bộ hình ảnh Chú Heo Bay PigFly 3D chất lượng 4K chuẩn studio cho toàn bộ ứng dụng.

---

## 🌟 1. ĐẶC TẢ TẠO HÌNH CỐT LÕI (CORE MASCOT SPECIFICATION)
* **Nhân vật:** Chú heo đất Chibi béo tròn có đôi cánh thiên thần nhỏ xíu vỗ cánh bay bổng (Cute Chubby Porcelain Flying Piglet / Angelic Piggy Bank).
* **Chất liệu & Bề mặt:** 3D Clay Chibi đất nặn mịn màng phong cách hoạt hình Pixar/Popmart (Smooth porcelain ceramic with matte clay finish, soft ambient occlusion, subsurface scattering).
* **Màu sắc:** 
  - Thân: **Trắng Sứ ngọc trai** (`#FFFDF9`).
  - Tai trong, mũi & má: **Hồng phấn pastel** (`#FFB6C1`).
  - Đôi cánh: **Kem ngà bơ mềm mại** (`#FAF6EC`) viền ánh vàng thu nhẹ (`#E59844`).
* **Nền:** Trong suốt tuyệt đối hoặc nền trắng thuần (`isolated on solid transparent background, PNG`).

---

## 📸 2. CÂU LỆNH PROMPT CHO 4 DÁNG ĐIỆU CHÍNH (PROMPTS)

### Pose 1: Bay Chào Buổi Sáng (Dùng cho Trang Đăng Nhập & Tab Home Header)
```text
3D cute chubby white piglet with tiny cute angelic wings fluttering on its back, floating happily in the air, wearing a tiny friendly smile with soft pink blush cheeks, holding a small glowing golden coin in its right front paw, smooth porcelain matte clay texture, Pixar 3D animation style, warm soft cinematic studio lighting, isolated on transparent background, high resolution 8k, octane render, ultra detailed --ar 1:1 --v 6.0
```

### Pose 2: Phi Hành Gia Thống Kê (Dùng cho Tab Thống Kê Sentiment Card)
```text
3D adorable chubby white piglet flying upwards with tiny fluttering angel wings, holding a glowing pastel-green financial growth arrow with both paws, looking proud and joyful with sparkling happy eyes, smooth porcelain clay finish, Pixar 3D style, soft studio lighting, isolated on transparent background, clean edges --ar 1:1 --v 6.0
```

### Pose 3: Chú Heo Thợ Chụp Ảnh Locket (Dùng cho Tab Camera Celebration Stamp)
```text
3D cute chubby white piglet hovering mid-air with small cute wings, holding a tiny vintage pastel camera with miniature strap, wearing cute retro aviator goggles resting on its forehead, cheerful wink expression, smooth matte clay texture, clean minimalist soft shadows, isolated on transparent background --ar 1:1 --v 6.0
```

### Pose 4: Cố Vấn Thông Thái Bay Lượn (Dùng cho Tab Chat AI & Squad Room)
```text
3D wise cute white piglet floating gently with small angel wings, wearing delicate round golden retro eyeglasses, holding a tiny sage-green financial notebook with embossed golden coin symbol, friendly warm-hearted expression, smooth porcelain clay, soft cinematic studio light, isolated on transparent background --ar 1:1 --v 6.0
```

---

## 💡 3. QUY TRÌNH NÉN VÀ ĐƯA VÀO ỨNG DỤNG (ASSET PIPELINE)

1. **Sinh ảnh:** Dán câu lệnh prompt tương ứng vào **ChatGPT Plus (GPT-4o)** hoặc **Midjourney v6**.
2. **Tách nền:** Tải ảnh về, dùng công cụ tách nền tự động (`remove.bg`, Photoshop hoặc `sips`) để đảm bảo nền hoàn toàn trong suốt.
3. **Nén WebP chuẩn di động:**
   * Kích thước khuyến nghị: $512 \times 512$px (hoặc $256 \times 256$px cho icon).
   * Định dạng: WebP chất lượng 85% để dung lượng mỗi file $\le 45$KB.
4. **Lưu trữ:** Đặt các tệp tin vào thư mục `assets/pigfly/`:
   - `assets/pigfly/pigfly_welcome.webp` (Pose 1)
   - `assets/pigfly/pigfly_stats.webp` (Pose 2)
   - `assets/pigfly/pigfly_camera.webp` (Pose 3)
   - `assets/pigfly/pigfly_wise.webp` (Pose 4)
