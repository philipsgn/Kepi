# 🎮 ĐẶC TẢ TÍNH NĂNG: PIGFLY GAMIFICATION ENGINE v4.1
## Hệ Thống Chuỗi Kỷ Luật Streak, 5 Tầng Mây, Cờ Tỷ Phú & Linh Vật Heo Bay (Zero FEP Points)

> **Mô-đun:** Gamification & Financial Monopoly  
> **Phiên bản:** v4.1 (Tối giản 100%: Khai tử điểm FEP ảo, tôn vinh Chuỗi Streak & Tâm trạng Heo)  
> **Nguồn cảm hứng:** `ActiDoo/gamification-engine`, Pop-Anime Arcade UI, Board Game Cờ Tỷ Phú  
> **Áp dụng cho:** Toàn bộ hệ sinh thái PigFly (Home, Chat Squad, Tab Stats & Mini-Game độc lập)

---

## 🌟 1. KIẾN TRÚC GAMIFICATION LẤY CẢM HỨNG TỪ ACTIDOO

PigFly bản địa hóa các pattern thiết kế của `ActiDoo/gamification-engine` vào kiến trúc TypeScript + Zustand, triệt tiêu hoàn toàn các loại tiền ảo vô ích để tập trung vào giá trị thực tế:

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
│  [ Visual & Habit Rewards ] ◄─────────────────── [ Evaluation Result ] │
│  - Streak Days (+1 ngày)                         - Achievement Unlocked│
│  - 5 Cloud Tiers Transition                      - Mascot Mood Update  │
│  - Heo Vỗ Cánh Bay Cao (FLYING_HIGH)             - SOS Alert Trigger   │
└────────────────────────────────────────────────────────────────────────┘
```

### 1.1. Contextual Variables (Biến Trạng Thái Người Dùng)
- `todaySpent`: Tổng tiền đã chi hôm nay (chỉ tính `status === 'CONFIRMED'`).
- `todayBudget`: Hạn mức hôm nay tiêu được.
- `streakDays`: Số ngày liên tiếp giữ vững hạn mức (Động lực cốt lõi).
- `currentCloudTier`: Tầng mây tài chính hiện tại (1..5) tính theo chuỗi ngày Streak.
- `mascotMood`: Cảm xúc linh vật (`FLYING_HIGH` | `CHILL` | `PANIC` | `STARVING`).
- `monopolyPosition`: Vị trí hiện tại trên bàn cờ 16 ô (0..15).
- `diceRollsLeft`: Số lượt đổ xúc xắc còn lại trong ngày (tối đa 2 lượt + thưởng khi ghi sổ).

### 1.2. Multi-Level Achievements (Thành Tựu Đa Tầng)
Mỗi thành tựu có 3 cấp độ (Đồng 🥉 $\to$ Bạc 🥈 $\to$ Vàng 🥇):
- **"Thợ Săn Khoảnh Khắc" (Visual Logger):** Chụp ảnh món đồ khi ghi chép (10 ảnh $\to$ 50 ảnh $\to$ 200 ảnh).
- **"Chiến Binh Kỷ Luật" (Discipline Master):** Duy trì chuỗi Streak (3 ngày $\to$ 7 ngày $\to$ 30 ngày).
- **"Bậc Thầy Cứu Ví" (Impulse Destroyer):** Bỏ qua bẫy FOMO trong Cờ Tỷ Phú (3 lần $\to$ 10 lần $\to$ 30 lần).
- **"Nhà Đầu Tư Bản Lĩnh" (Savvy Investor):** Chọn ô Đầu tư tích lũy (5 lần $\to$ 20 lần $\to$ 50 lần).

---

## ⚡ 2. HỆ THỐNG KỶ LUẬT STREAK & BẢO VỆ TÂM LÝ (ZERO VIRTUAL POINTS)

### 2.1. Tôn Chỉ "Không Tiền Ảo, Không Rối Mắt"
- PigFly **KHÔNG SỬ DỤNG ĐIỂM FEP ẢO**. Người dùng quản lý tài chính để tích lũy tiền thật trong đời thực, không phải để cày điểm game vô bổ.
- Động lực mở app mỗi ngày được thúc đẩy bởi:
  1. **Chuỗi Streak Days (Locket & Duolingo style):** Giữ vững hạn mức ngày $\to$ Chuỗi ngày tăng lên $\to$ Chú heo PigFly bay vút lên các tầng mây cao hơn.
  2. **Tâm trạng Heo PigFly Lottie:** Heo vui vẻ, bay bổng khi bạn chi tiêu thông minh; Heo hoảng hốt, ôm mặt khi bạn bội chi.
  3. **Cờ Tỷ Phú & Lời Khuyên Minh PT:** Rèn luyện phản xạ né bẫy mua sắm bốc đồng.

---

## ☁️ 3. HỆ THỐNG 5 TẦNG MÂY TÀI CHÍNH (FINANCIAL CLOUD TIERS)

Độ cao bay của PigFly phản ánh trực tiếp chuỗi ngày kỷ luật (Streak Days) của người dùng:

```
▲ [TẦNG 5] Tự Do Tài Chính (Streak 90+ ngày) ─── Heo mang Vương miện & Cánh Thần Kim Cương
│
▲ [TẦNG 4] Mây Cầu Vồng Thịnh Vượng (Streak 45 ngày) ── Heo có Hào quang & Cánh Thiên thần
│
▲ [TẦNG 3] Mây Vàng Kỷ Luật (Streak 21 ngày) ──────── Heo đeo Balo phản lực Pastel
│
▲ [TẦNG 2] Mây Xanh Tích Lũy (Streak 7 ngày) ──────── Heo đeo Kính phi công Vintage
│
▲ [TẦNG 1] Mây Non Lơ Lửng (Streak 0-6 ngày) ──────── Heo đập đôi cánh thiên thần nhỏ xíu
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

### 4.2. Cơ Chế Thử Thách Cứu Ví (Resist FOMO Challenges)
- Người chơi đổ xúc xắc (1..6 nút), heo bay tới ô tương ứng.
- Khi rơi vào các ô **BẪY FOMO** (Sale Shopee, Trà sữa đêm, Đổi điện thoại trả góp):
  - Người dùng chọn `[Cứu Ví / Bỏ Qua]`: Ghi nhận 1 lần cứu ví thành công cho huy hiệu "Bậc Thầy Cứu Ví", chú heo nhảy múa vui mừng.
  - Người dùng chọn `[Mua Ngay]`: Chú heo toát mồ hôi lo lắng, nhắc nhở về mục tiêu tài chính bị chậm trễ.

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
     `"🚨 [Tên] vừa tiêu lố hạn mức hôm nay! Mau giải cứu heo của [Tên]!"`
3. **Hành vi phía bạn bè trong Squad:**
   - Nhận thông báo huy hiệu SOS nhấp nháy trên avatar thành viên đó.
   - Nút hành động nhanh: `[🛡️ Thả Meme Khuyên Can]` hoặc `[☕ Gửi Lời Động Viên]`.

---

## 🐷 6. HỆ THỐNG MASCOT LOTTIE

### 6.1. Bốn Trạng Thái Cảm Xúc Cốt Lõi (Lottie Mood States)
1. **`FLYING_HIGH`:** Đang có chuỗi Streak $\ge 3$ ngày. Heo đeo kính phi công, vỗ cánh mạnh mẽ, sao lấp lánh xung quanh.
2. **`CHILL`:** Đang chi tiêu an toàn trong hạn mức (`todaySpent <= todayBudget`). Heo mỉm cười nhẹ nhõm, nhắm mắt thư thái.
3. **`PANIC`:** Chi tiêu vượt hạn mức ngày. Heo toát mồ hôi hột, cánh đập bối rối, hai chân trước ôm má lo lắng.
4. **`STARVING`:** Chưa có giao dịch nào được ghi trong ngày. Heo nằm bụng xẹp, đòi ăn ảnh chi tiêu.
