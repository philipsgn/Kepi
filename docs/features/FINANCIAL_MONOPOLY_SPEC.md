# 🎲 ĐẶC TẢ TÍNH NĂNG: CỜ TỶ PHÚ ĐẦU TƯ TÀI CHÍNH (FINANCIAL_MONOPOLY_SPEC.MD)

> **Mô-đun:** Mini-Game Cờ Tỷ Phú (Financial Monopoly)  
> **Áp dụng cho:** Tab Chat (Cố Vấn & Squad), Mini-game Popup  
> **Phong cách thẩm mỹ:** Pop-Anime Arcade / Chibi Illustration

---

## 1. THIẾT KẾ BÀN CỜ 16 Ô (16-TILE BOARD LAYOUT)

Bàn cờ hình chữ nhật khép kín 16 ô với linh vật chú heo PigFly vỗ cánh bay theo từng bước nhảy xúc xắc:

| Ô # | Tên Ô | Loại Ô | Hành Động & Tác Động Tài Chính |
|:---:|:---|:---:|:---|
| **0** | **BẮT ĐẦU (GO)** | `START` | Đi qua nhận ngay `+50 FEP` năng lượng bay. |
| **1** | **Bữa Sáng Sinh Viên** | `DECISION` | [Ăn ngoài 45k] (-45k tiền ảo) hoặc [Tự nấu 15k] (+20 FEP). |
| **2** | **THẺ CƠ HỘI 1** | `CHANCE` | Rút thẻ may mắn ngẫu nhiên (hoàn tiền, được bao ăn). |
| **3** | **BẪY FOMO 1** | `FOMO_TRAP` | Áo khoác sale 50%: [Cứu ví (+40 FEP)] hoặc [Mua ngay (-20 FEP)]. |
| **4** | **ĐẦU TƯ CHỨNG CHỈ QUỸ** | `INVESTMENT` | Trích 50k vào ETF $\to$ Tặng Flashcard Lãi Kép +35 FEP. |
| **5** | **QUỸ KHẨN CẤP** | `EMERGENCY` | Thủng lốp xe máy: Chi 30k từ quỹ dự phòng an toàn. |
| **6** | **TIỀN TRỌ ĐẾN HẠN** | `BILL` | Thực hành bài học chi phí cố định. |
| **7** | **THẺ KHÍ VẬN** | `LUCK` | Tìm thấy mã giảm giá 30k (+25 FEP). |
| **8** | **NGHỈ CHÂN CÔNG VIÊN** | `REST` | Heo dừng chân thư giãn, hồi phục năng lượng. |
| **9** | **BẪY FOMO 2** | `FOMO_TRAP` | Ly trà sữa sau giờ làm: [Kiềm chế (+30 FEP)] hoặc [Uống ngay (-15 FEP)]. |
| **10** | **GÓP HŨ SQUAD** | `SHARED_GOAL`| Đóng góp 50k vào mục tiêu du lịch cùng 3 bạn thân (+40 FEP). |
| **11** | **THẺ CƠ HỘI 2** | `CHANCE` | Rút thẻ: Thưởng hoàn tiền thẻ thanh toán 50k. |
| **12** | **BẪY FOMO 3** | `FOMO_TRAP` | Đổi iPhone mới trả góp: [Từ chối theo lời Minh PT (+50 FEP)]. |
| **13** | **ĐẦU TƯ BẢN THÂN** | `INVESTMENT` | Mua sách kỹ năng tài chính (+30 FEP). |
| **14** | **THUẾ & PHÍ DỊCH VỤ** | `TAX` | Trừ nhẹ 10 FEP kiểm tra sức khỏe dòng tiền. |
| **15** | **CHIA CỔ TỨC** | `DIVIDEND` | Nhận cổ tức định kỳ (+60 FEP). |

---

## 2. CƠ CHẾ CHƠI & LƯỢT ĐỔ XÚC XẮC (GAMEPLAY)

1. **Lượt đổ xúc xắc (Dice Rolls):**
   - Mặc định mỗi ngày được cấp **2 lượt đổ miễn phí**.
   - Thưởng thêm **+1 lượt** mỗi khi người dùng ghi chép chi tiêu có ảnh trong ngày.
2. **Quy tắc di chuyển:**
   - Số bước = giá trị xúc xắc ngẫu nhiên ($1 \le \text{roll} \le 6$).
   - $\text{Vị trí mới} = (\text{Vị trí cũ} + \text{roll}) \pmod{16}$.
   - Nếu đi qua ô 0 (vòng lặp mới): Tự động cộng `+50 FEP`.
3. **Phần thưởng Flashcard:**
   - Mở khóa các bài học tư duy quản lý tài chính ngắn gọn 1 phút dễ nhớ dành cho Gen Z.
