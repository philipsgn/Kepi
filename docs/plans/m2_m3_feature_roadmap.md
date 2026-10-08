# 🗺️ TẦM NHÌN M2 + M3 — VÍ LOCKET SAU KHI LÊN APP STORE

> **Bối cảnh:** M0 = xây vỏ app đẹp. M1 = thay ruột thật (DB, Auth, Store, Build → App Store). **M2 = giữ chân & kéo bạn bè. M3 = kiếm tiền & mở rộng.**  
> **Đối tượng:** Người trẻ Gen Z lười quản lý chi tiêu, dễ mua bốc đồng.

---

## 🔑 TRIẾT LÝ XUYÊN SUỐT

> *"Người lười không cần thêm tính năng — họ cần lý do để mở app mỗi ngày."*

| Milestone | Một câu mô tả | Mục tiêu đo lường |
|---|---|---|
| **M0** ✅ | Vỏ app đẹp, ghi chi tiêu bằng ảnh + giọng nói | Prototype hoạt động |
| **M1** 🔧 | Thay ruột thật → App Store | Production-ready, 0 crash |
| **M2** 🎯 | Giữ chân 30 ngày + Kéo bạn bè vào | **D30 Retention ≥ 25%**, MAU tăng 3x |
| **M3** 💰 | Kiếm tiền + Mở rộng thị trường | **MRR > 0**, có người trả tiền |

---

## 📌 M2: BẠN BÈ & GIỮ CHÂN (Social Retention Engine)

### Tổng quan: 9 tính năng

```
┌─────────────────────────────────────────────────────────────┐
│                    M2: BẠN BÈ & GIỮ CHÂN                    │
│                                                              │
│   🫂 Nhóm Bạn Thân      📢 Hỏi Bạn Trước Khi Mua           │
│   📸 Locket Feed         🔔 Push Notifications Thông Minh    │
│   🔥 Streak Challenges   📱 Widget iOS/Android               │
│   🏆 Kỷ Lục Mới          ⚡ Quick Entry Shortcuts             │
│   📊 Xuất Dữ Liệu        (đã chuyển từ M1 sang đây)         │
└─────────────────────────────────────────────────────────────┘
```

---

### M2.1. 🫂 Nhóm Bạn Thân (Friend Groups)

**Vì sao cần:** Người lười chỉ tiết kiệm khi có "áp lực tích cực" từ bạn bè. Một mình dễ bỏ cuộc.

| Chi tiết | Mô tả |
|---|---|
| **Cách hoạt động** | Tạo nhóm 2-6 người (VD: "Hội tiết kiệm mua Macbook"). Mỗi người đặt mục tiêu tuần (VD: "Tiêu ≤ 800k tuần này"). Cuối tuần app tổng kết ai đạt, ai lố. |
| **UI** | Tab Chat → Ngăn "Bạn bè" (hiện đang là "Sắp ra mắt") → Danh sách nhóm → Phòng chat nhóm |
| **DB mới** | Bảng `friend_groups`, `group_members`, `weekly_challenges` |
| **Quyền riêng tư** | Bạn bè KHÔNG thấy chi tiết mua gì — chỉ thấy tổng đã chi tuần và % mục tiêu |
| **Ước tính** | 5-7 ngày |

---

### M2.2. 📢 Hỏi Bạn Bè Trước Khi Mua ("Nên Mua Không?")

**Vì sao cần:** Gen Z hay hỏi ý kiến nhóm trước khi mua. Chuyển hành vi từ "hỏi trên story Instagram" sang Ví Locket.

| Chi tiết | Mô tả |
|---|---|
| **Cách hoạt động** | Ở chế độ "Định mua", sau khi xem Giá Thật → Nút **"Hỏi hội"** → Gửi ảnh + giá vào nhóm bạn thân → Bạn bè vote: 👍 Nên mua / 👎 Thôi đi / 🤔 Để sau |
| **Hiệu ứng tâm lý** | Khi 3/4 bạn bè bấm "Thôi đi" → Áp lực xã hội mạnh hơn lời khuyên AI → Tỷ lệ "Cứu Ví" tăng |
| **Notification** | Push cho cả nhóm: *"Lan đang phân vân mua áo khoác 1.2 triệu — cho ý kiến đi!"* |
| **Ước tính** | 3-4 ngày (dùng chung infrastructure M2.1) |

---

### M2.3. 📸 Locket Feed (Album Chi Tiêu Của Nhóm)

**Vì sao cần:** Biến chi tiêu thành nội dung xã hội. Thay vì chỉ xem album của mình, xem cả nhóm đã mua gì — tạo đề tài nói chuyện.

| Chi tiết | Mô tả |
|---|---|
| **Cách hoạt động** | Cuộn dọc kiểu Instagram Stories nhưng chỉ trong nhóm bạn thân. Mỗi ảnh có tag giá ở góc dưới, thời gian tương đối. |
| **Chế độ "Khoe"** | Người dùng chọn ảnh nào muốn chia sẻ vào Feed (không tự động — tôn trọng quyền riêng tư) |
| **Reaction** | Tim ❤️, Mắt lé 🫣 (đắt quá!), Lửa 🔥 (deal đẹp!) |
| **Ước tính** | 4-5 ngày |

---

### M2.4. 🔔 Push Notifications Thông Minh

**Vì sao cần:** Người lười quên mở app. Notifications là cách DUY NHẤT kéo họ quay lại.

| Loại thông báo | Thời điểm | Nội dung |
|---|---|---|
| **Nhắc ghi sổ buổi tối** | 21:00 nếu chưa ghi khoản nào hôm nay | *"Hôm nay tiêu gì chưa ghi nè?"* |
| **Giỏ Chờ đến hạn** | Sau 24h / 72h | *"Cơn sốt hạ nhiệt chưa? Còn muốn mua [tên món] không?"* |
| **Streak sắp mất** | 20:00 nếu chưa mở app 2 ngày | *"Chuỗi 12 ngày sắp đứt — mở app giữ vững nào!"* |
| **Bạn bè hỏi ý kiến** | Ngay lập tức | *"Hùng đang phân vân mua giày 2 triệu — cho ý kiến!"* |
| **Báo cáo tuần** | Chủ nhật 10:00 | *"Tuần này tiêu 850k — giỏi hơn tuần trước 15%! 🎉"* |
| **Kỷ lục mới** | Khi đạt | *"Bạn vừa cứu ví 500k trong 1 tuần — kỷ lục mới!"* |

**Ước tính:** 3-4 ngày (expo-notifications đã cài, cần backend schedule)

---

### M2.5. 🔥 Streak Challenges (Thử Thách Chuỗi Ngày)

**Vì sao cần:** Game hóa nhẹ nhàng. Người lười cần "trò chơi nhỏ" để duy trì thói quen.

| Thử thách | Điều kiện | Phần thưởng |
|---|---|---|
| **Chuỗi Ghi Sổ** | Ghi ≥1 khoản mỗi ngày | 🍂 Lá thu bay animation + badge |
| **Chuỗi Không Lố** | Tiêu ≤ ngân sách ngày | 🛡️ Tấm khiên bảo vệ ví |
| **Chuỗi Cứu Ví** | Bấm "Không mua" 3 lần liên tiếp | 🎆 Pháo hoa + thêm vào "Tiền đã cứu" |
| **Thử Thách Tuần** | Với nhóm bạn: ai tiết kiệm nhất tuần | 👑 Vương miện tuần trong nhóm |

**Ước tính:** 3 ngày

---

### M2.6. 📱 Widget iOS / Android

**Vì sao cần:** Không cần mở app để biết "hôm nay còn tiêu được bao nhiêu". Nhìn màn hình chính là thấy.

| Widget | Kích thước | Nội dung |
|---|---|---|
| **Mini** | 2×2 | Số "Hôm nay tiêu được" + thanh HP nhỏ |
| **Medium** | 4×2 | Số tiền + 3 ảnh gần nhất + Streak |
| **Large** | 4×4 | Lịch ảnh mini tuần + tổng chi/thu |

**Ước tính:** 5-7 ngày (cần `expo-widget` hoặc native module)

---

### M2.7. 🏆 Kỷ Lục & Thành Tựu Cá Nhân

**Vì sao cần:** Dopamine từ "đạt được gì đó" giữ người dùng quay lại.

| Thành tựu | Điều kiện |
|---|---|
| *Tân Thủ Khám Phá* | Ghi 10 khoản đầu tiên |
| *Bàn Tay Sắt* | Chuỗi 7 ngày không lố ngân sách |
| *Chiến Thần Tỉnh Táo* | Cứu ví 5 món bốc đồng |
| *Bậc Thầy Ví Locket* | Đạt 50% mục tiêu cá nhân |
| *Người Hùng Tháng X* | Tiêu ít hơn tháng trước 20% |
| *Huyền Thoại 30 Ngày* | Chuỗi ghi sổ 30 ngày liên tiếp |

**Ước tính:** 2-3 ngày (logic + UI badges trong Profile)

---

### M2.8. ⚡ Quick Entry Shortcuts

**Vì sao cần:** Người lười cần ghi trong ≤ 2 giây, không cần mở camera.

| Shortcut | Mô tả |
|---|---|
| **3D Touch / Long Press** trên icon app | Menu nhanh: "Ghi chi 🎤", "Ghi thu 💰", "Chụp nhanh 📸" |
| **Siri Shortcuts (iOS)** | "Hey Siri, ghi 45k trà sữa vào Ví Locket" |
| **Quick Action từ Notification** | Bấm reply trên notification → Ghi trực tiếp |

**Ước tính:** 3-4 ngày

---

### M2.9. 📊 Xuất Dữ Liệu Chi Tiêu

**Vì sao cần:** Người dùng muốn sở hữu dữ liệu của mình. Apple cũng yêu cầu.

| Định dạng | Nội dung |
|---|---|
| **CSV** | Tất cả giao dịch: ngày, loại, số tiền, danh mục, mô tả |
| **PDF Báo Cáo Tháng** | Thiết kế đẹp kiểu "Báo cáo Hà Nội Thu Đông" — tổng chi/thu, top danh mục, streak, ảnh highlight |

**Ước tính:** 3-4 ngày

---

## 🔮 M3: KIẾM TIỀN & MỞ RỘNG (Monetization & Scale)

> [!NOTE]
> M3 chỉ bắt đầu khi M2 đạt ≥ 1,000 MAU và có dữ liệu Retention thật.

### M3 sơ lược (6 tính năng)

| # | Tính năng | Mô tả | Mô hình kinh doanh |
|---|---|---|---|
| 1 | **Premium Subscription** | Gỡ giới hạn AI chat, xuất PDF không giới hạn, widget premium, themes đặc biệt | **49k-99k/tháng** |
| 2 | **Chia Sẻ Link Mời** | Mời bạn qua link → cả hai nhận 7 ngày Premium | Viral growth |
| 3 | **Multi-Currency** | Hỗ trợ USD, JPY cho du học sinh / du lịch | Mở rộng thị trường |
| 4 | **Liên Kết Ngân Hàng (Read-only)** | Đọc biến động số dư tự động (Casso API / Open Banking) | Premium feature |
| 5 | **AI Spending Trends** | Gemini phân tích 3 tháng dữ liệu → dự đoán chi tiêu tháng sau | Premium feature |
| 6 | **Dark Social Feed** | Feed ẩn danh: "Ai đó ở Hà Nội vừa cứu ví 1.5 triệu" — cảm hứng tiết kiệm | Engagement + Ads |

---

## 📅 TIMELINE ƯỚC TÍNH TỔNG

```
Tháng 10/2026:  M1 Production → App Store (14-18 ngày)
                                                          ↓
Tháng 11/2026:  M2 Social (25-35 ngày)                  Thu thập
                - Friend Groups + Hỏi Bạn                feedback
                - Push Notifications                      từ user
                - Streak Challenges                       thật
                - Widget                                   ↓
                                                          ↓
Tháng 12/2026:  M2 Polish + M3 Planning                 Đạt 1000+
                - Export PDF đẹp                          MAU?
                - Quick Entry                              ↓
                                                          ↓
Q1 2027:        M3 Monetization                          Ra mắt
                - Premium Subscription                    Premium
                - AI Trends
```

---

## ⚖️ SO SÁNH: VÍ LOCKET vs. ĐỐI THỦ

| Tính năng | Ví Locket | Money Lover | Misa | Toshl |
|---|:---:|:---:|:---:|:---:|
| Ghi bằng ảnh + giọng nói | ✅ **Cốt lõi** | ❌ | ❌ | ❌ |
| AI Coach cá nhân hóa | ✅ Anh Minh | ❌ | ❌ | ❌ |
| Nhóm bạn thân giữ ví | ✅ M2 | ❌ | ❌ | ❌ |
| Quét VietQR → ghi sổ | ✅ | ❌ | ❌ | ❌ |
| Phong cách thẩm mỹ độc đáo | ✅ Hà Nội Thu Đông | Bình thường | Doanh nghiệp | Phẳng |
| Hỏi bạn trước khi mua | ✅ M2 | ❌ | ❌ | ❌ |
| Widget | ✅ M2 | ✅ | ❌ | ✅ |
| Liên kết ngân hàng tự động | M3 | ❌ | ❌ | ❌ |

### Lợi thế cạnh tranh độc nhất:
> **Ví Locket = App tài chính duy nhất tại Việt Nam kết hợp: Ảnh + Giọng nói + AI Coach + Áp lực bạn bè tích cực + VietQR.**

---

> [!TIP]
> Anh muốn ưu tiên tính năng nào trong M2? Tôi khuyến nghị bắt đầu bằng **Push Notifications (M2.4)** + **Streak Challenges (M2.5)** trước vì chúng giữ chân user NGAY mà không cần chờ user mời bạn bè. Sau đó mới làm Friend Groups.
