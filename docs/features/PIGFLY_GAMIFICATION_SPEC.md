# 🎮 ĐẶC TẢ TÍNH NĂNG: PIGFLY GAMIFICATION ENGINE v4.0
## Hệ Thống Quy Tắc Game Hóa ActiDoo, Cờ Tỷ Phú Tài Chính & SOS Squad Alarm

> **Mô-đun:** Gamification & Financial Monopoly  
> **Phiên bản:** v4.0 (Đồng bộ theo Kế hoạch Nâng Cấp Toàn Diện)  
> **Nguồn cảm hứng:** `ActiDoo/gamification-engine`, Pop-Anime Arcade UI, Board Game Cờ Tỷ Phú  
> **Áp dụng cho:** Toàn bộ hệ sinh thái PigFly (Home, Chat Squad, Tab Stats, Kho Skin & Mini-Game độc lập)

---

## 🌟 1. KIẾN TRÚC GAMIFICATION LẤY CẢM HỨNG TỪ ACTIDOO

PigFly bản địa hóa các pattern thiết kế của `ActiDoo/gamification-engine` vào kiến trúc TypeScript + Zustand + Supabase:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ACTIDOO-INSPIRED ENGINE                         │
│                                                                        │
│  [ Contextual Variables ] ──► [ Event Trigger ] ──► [ Rules Engine ]   │
│  - todaySpent                 - On Transaction       - Pure Functions  │
│  - streakDays                 - On Rollover 00:00    - Threshold Check │
│  - photosLogged               - On Game Move                           │
│  - monopolyTile                                                        │
│                                                            │           │
│                                                            ▼           │
│  [ Reward Payloads ] ◄───────────────────────── [ Evaluation Result ] │
│  - FEP Points (+30, +100)                        - Achievement Unlocked│
│  - Cloud Tier Transition                         - Mood State Update   │
│  - Skin Item Unlocked                            - Level / Streak Multi│
└────────────────────────────────────────────────────────────────────────┘
```

### 1.1. Contextual Variables (Biến Trạng Thái Người Dùng)
- `todaySpent`: Tổng tiền đã chi hôm nay (chỉ tính `status === 'CONFIRMED'`).
- `todayBudget`: Hạn mức hôm nay tiêu được.
- `streakDays`: Số ngày liên tiếp giữ vững hạn mức.
- `fepPoints`: Tổng điểm Năng lượng Bay tích lũy.
- `currentCloudTier`: Tầng mây tài chính hiện tại (1..5).
- `mascotMood`: Cảm xúc linh vật (`FLYING_HIGH` | `CHILL` | `PANIC` | `STARVING`).
- `monopolyPosition`: Vị trí hiện tại trên bàn cờ 16 ô (0..15).
- `diceRollsLeft`: Số lượt đổ xúc xắc còn lại trong ngày.

### 1.2. Multi-Level Achievements (Thành Tựu Đa Tầng)
Mỗi thành tựu có 3 cấp độ (Đồng 🥉 $\to$ Bạc 🥈 $\to$ Vàng 🥇):
- **"Thợ Săn Khoảnh Khắc" (Visual Logger):** Chụp ảnh món đồ khi ghi chép (10 ảnh $\to$ 50 ảnh $\to$ 200 ảnh).
- **"Chiến Binh Kỷ Luật" (Discipline Master):** Duy trì chuỗi Streak (3 ngày $\to$ 7 ngày $\to$ 30 ngày).
- **"Bậc Thầy Cứu Ví" (Impulse Destroyer):** Bỏ qua bẫy FOMO trong Cờ Tỷ Phú (3 lần $\to$ 10 lần $\to$ 30 lần).
- **"Nhà Đầu Tư Bản Lĩnh" (Savvy Investor):** Chọn ô Đầu tư tích lũy (5 lần $\to$ 20 lần $\to$ 50 lần).

---

## ⚡ 2. HỆ THỐNG NĂNG LƯỢNG BAY (FLY ENERGY POINTS - FEP)

### 2.1. Cách Thức Tích Lũy Điểm Năng Lượng
| Hành vi thực tế trong App | Điểm Năng Lượng (FEP) | Giới hạn |
|:---|:---:|:---|
| **Ghi chép có ảnh / OCR / Voice ($\le 3$s)** | `+30 FEP` / lần | Tối đa 3 lần / ngày (90 FEP) |
| **Giữ vững hạn mức ngày (`todaySpent <= todayBudget`)** | `+100 FEP` / ngày | Kết toán vào 00:00 mỗi đêm |
| **Duy trì chuỗi Streak liên tiếp** | Nhân hệ số thưởng | Ngày 3 ($\times 1.2$), Ngày 7 ($\times 1.5$), Ngày 30 ($\times 2.0$) |
| **Tương tác nhóm Squad Nuôi Heo** | `+15 FEP` / lần | Nhắc đói hoặc cổ vũ bạn bè |
| **Quyết định đúng đắn trong Cờ Tỷ Phú** | `+20` đến `+50 FEP` | Tùy theo thử thách ô đất |

### 2.2. Xử Lý Khi Bội Chi (Negative Balance Protection)
- **KHÔNG TRỪ FEP ĐÃ TÍCH LŨY** (tránh gây ức chế tâm lý).
- Tốc độ tích FEP ngày hôm sau giảm 20% cho đến khi người dùng cân bằng lại số dư qua thuật toán Rollover.

---

## ☁️ 3. HỆ THỐNG 5 TẦNG MÂY TÀI CHÍNH (FINANCIAL CLOUD TIERS)

Độ cao bay của PigFly phản ánh sức khỏe tài chính và độ kỷ luật của người dùng:

```
▲ [TẦNG 5] Tự Do Tài Chính (Streak 90+ ngày) ─── Heo mang Vương miện & Cánh Thần Kim Cương
│
▲ [TẦNG 4] Mây Cầu Vồng Thịnh Vượng (Streak 45 ngày) ── Heo có Hào quang & Cánh Thiên thần
│
▲ [TẦNG 3] Mây Vàng Kỷ Luật (Streak 21 ngày) ──────── Heo đeo Balo phản lực Pastel
│
▲ [TẦNG 2] Mây Xanh Tích Lũy (Streak 7 ngày) ──────── Heo đeo Kính phi công Vintage
│
▲ [TẦNG 1] Mây Non Lơ Lửng (Streak 3 ngày) ────────── Heo đập đôi cánh thiên thần nhỏ xíu
```

---

## 🎲 4. ĐẶC TẢ MINI-GAME "CỜ TỶ PHÚ ĐẦU TƯ TÀI CHÍNH"

### 4.1. Cấu Trúc Bàn Cờ 16 Ô (16-Tile Monopoly Board)
```
[Ô 0: KHỞI HÀNH] ➔ [Ô 1: Cà phê sáng] ➔ [Ô 2: CƠ HỘI]   ➔ [Ô 3: BẪY FOMO 1]
       ▲                                                           │
       │                                                           ▼
[Ô 15: CỔ TỨC]                                             [Ô 4: ĐẦU TƯ ETF]
       ▲                                                           │
       │                                                           ▼
[Ô 14: BẪY FOMO 3]                                        [Ô 5: KHẨN CẤP]
       ▲                                                           │
       │                                                           ▼
[Ô 13: ĐẦU TƯ VÀNG] ◄ [Ô 12: BẪY FOMO 2] ◄ [Ô 11: CƠ HỘI] ◄ [Ô 6: TRẢ TIỀN TRỌ]
```

### 4.2. Danh Sách Ô Đất & Thử Thách Chi Tiết
1. **Ô 0 - KHỞI HÀNH (GO):** Đi qua nhận ngay `+50 FEP`.
2. **Ô 1 - Bữa Sáng Sinh Viên:** Lựa chọn: "Ăn bún bò 45k" (-45k ngân sách ảo) hoặc "Tự nấu mì 15k" (+20 FEP).
3. **Ô 2 - THẺ CƠ HỘI (CHANCE):** Rút thẻ ngẫu nhiên: "Được bạn bao cà phê" (+30 FEP), "Nhặt được 20k bỏ ống heo".
4. **Ô 3 - BẪY FOMO 1 (Shopee 50%):** "Áo khoác trend TikTok 400k giảm còn 200k!" $\to$ [Bỏ qua - Cứu ví (+40 FEP)] hoặc [Mua ngay (-20 FEP)].
5. **Ô 4 - ĐẦU TƯ CHỨNG CHỈ QUỸ (ETF):** "Trích 50k mua quỹ chỉ số" $\to$ Nhận Flashcard Lãi Kép +35 FEP.
6. **Ô 5 - QUỸ KHẨN CẤP (EMERGENCY):** Xe thủng lốp! Chi 30k từ quỹ dự phòng. Nếu có quỹ dự phòng $\to$ không mất điểm.
7. **Ô 6 - TIỀN TRỌ ĐẾN HẠN:** Thực hành bài học phân bổ chi phí cố định.
8. **Ô 7 - THẺ KHÍ VẬN:** "Tìm thấy mã giảm giá 30k khi đi siêu thị" (+25 FEP).
9. **Ô 8 - NGHỈ CHÂN CÔNG VIÊN:** Heo thư giãn, nạp năng lượng bay.
10. **Ô 9 - BẪY FOMO 2 (Trà Sữa Topping Đầy Đủ):** "Ly trà sữa 65k sau giờ làm" $\to$ [Kiềm chế (+30 FEP)] hoặc [Uống ngay (-15 FEP)].
11. **Ô 10 - GÓP HŨ DU LỊCH CÙNG SQUAD:** Đóng góp 50k vào mục tiêu chung nhóm bạn thân (+40 FEP).
12. **Ô 11 - THẺ CƠ HỘI 2:** "Được hoàn tiền thẻ tín dụng 50k".
13. **Ô 12 - BẪY FOMO 3 (Đổi Điện Thoại Mới Trả Góp):** "Lên đời máy mới khi máy cũ vẫn tốt" $\to$ Minh PT xuất hiện tư vấn! [Từ chối (+50 FEP)].
14. **Ô 13 - ĐẦU TƯ BẢN THÂN:** "Mua sách / khóa học 100k" $\to$ Tặng Flashcard kỹ năng tài chính.
15. **Ô 14 - THUẾ & PHÍ SINH HOẠT:** Trừ nhẹ 10 FEP kiểm tra kỷ luật dòng tiền.
16. **Ô 15 - CHIA CỔ TỨC:** Khen thưởng kỷ luật chi tiêu tháng (+60 FEP).

---

## 🚨 5. GIAO THỨC SQUAD 2.0 & SOS OVERSPENDING ALARM

### 5.1. Giới Hạn & Quyền Riêng Tư
- Giới hạn cứng: $2 \le \text{Thành viên} \le 4$.
- Bảo vệ Zero-STK: Không hiển thị số tài khoản hay số dư thực tế, chỉ hiển thị ảnh món đồ, số tiền chi và biểu cảm chú heo.

### 5.2. Luồng Phát Tín Hiệu SOS (SOS Emergency Beacon)
1. **Điều kiện kích hoạt:** Khi thành viên có `todaySpent > todayBudget` trong ngày.
2. **Hành vi phía người chi tiêu:**
   - Chú heo PigFly chuyển sang trạng thái `PANIC` (hoạt ảnh Lottie toát mồ hôi, ôm mặt).
   - Tự động gửi một bản tin cảnh báo SOS vào khung chat Squad:
     `"🚨 [Tên] vừa tiêu lố hạn mức hôm nay (Đã chi: X đ / Hạn mức: Y đ)! Mau giải cứu heo của [Tên]!"`
3. **Hành vi phía bạn bè trong Squad:**
   - Nhận thông báo huy hiệu SOS nhấp nháy trên avatar thành viên đó.
   - Nút hành động nhanh: `[🛡️ Thả Meme Khuyên Can]` hoặc `[☕ Gửi Lời Động Viên]`.

---

## 🐷 6. HỆ THỐNG MASCOT LOTTIE & KHO SKIN TRANG PHỤC

### 6.1. Bốn Trạng Thái Cảm Xúc Cốt Lõi (Lottie Mood States)
1. **`FLYING_HIGH`:** Đang có chuỗi Streak $\ge 3$ ngày hoặc tỷ lệ tiết kiệm tháng $\ge 20\%$. Heo đeo kính phi công, vỗ cánh mạnh mẽ, sao lấp lánh xung quanh.
2. **`CHILL`:** Đang chi tiêu an toàn trong hạn mức (`todaySpent <= todayBudget`). Heo mỉm cười nhẹ nhõm, nhắm mắt thư thái.
3. **`PANIC`:** Chi tiêu vượt hạn mức ngày. Heo toát mồ hôi hột, cánh đập bối rối, hai chân trước ôm má lo lắng.
4. **`STARVING`:** Chưa có giao dịch nào được ghi trong ngày sau 18:00. Heo nằm bụng xẹp, đòi ăn ảnh chi tiêu.

### 6.2. Kho Trang Phục (Cosmetics Skin Store)
Mở khóa bằng FEP tích lũy (tuyệt đối không nạp tiền thật):
- *Mũ Beret Phố Cổ:* 300 FEP.
- *Kính Phi Công Vintage:* 600 FEP.
- *Balo Chong Chóng Tre:* 1,000 FEP.
- *Áo Choàng Pháp Sư Pop-Anime:* 2,500 FEP.
- *Cánh Thần Kim Cương Tự Do:* Đạt Tầng Mây 5.
