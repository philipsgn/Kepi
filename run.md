# 🍂 HƯỚNG DẪN CHẠY TEST ỨNG DỤNG VÍ LOCKET

### 🚨 NGUYÊN NHÂN LỖI "THE REQUEST TIMED OUT" KHI QUÉT MÃ EXPO:
- Máy tính hiện đang kết nối mạng Wi-Fi **"Highlands Coffee 3"** (hoặc quán cafe / văn phòng / mạng công cộng).
- **AP Isolation (Client Isolation):** Router quán cafe chặn các thiết bị kết nối trực tiếp với nhau (iPhone không thể kết nối vào IP LAN `172.21.x.x` của laptop) $\rightarrow$ Gây ra lỗi **The request timed out**.

---

## ⚡ CÁCH 1: DÙNG CHẾ ĐỘ TUNNEL (KHUYÊN DÙNG NHẤT Ở QUÁN CAFE / NGOÀI TRỜI)
*(Đã cài đặt sẵn `@expo/ngrok`, vượt qua mọi tường lửa và AP Isolation, iPhone dùng 4G/5G hay Wi-Fi quán đều vào được 100%)*

Chạy lệnh sau trong Terminal:
```bash
npm run tunnel
```
*(Hoặc: `npx expo start --tunnel -c`)*

👉 Quét mã QR hiện ra trên Terminal bằng Camera iPhone $\rightarrow$ Mở bằng **Expo Go** $\rightarrow$ Thành công ngay!

---

## ⚡ CÁCH 2: PHÁT WI-FI TỪ IPHONE (PERSONAL HOTSPOT) - SIÊU NHANH
Nếu muốn tốc độ load bundle nhanh nhất:
1. Bật **Điểm phát sóng cá nhân (Personal Hotspot)** trên iPhone.
2. Cho Laptop kết nối vào Wi-Fi của iPhone phát ra.
3. Chạy lệnh:
```bash
npx expo start -c
```
4. Quét mã QR bằng Camera iPhone.

---

## ⚡ CÁCH 3: XEM TRỰC TIẾP TRÊN TRÌNH DUYỆT MÁY TÍNH (WEB PREVIEW)
1. Trong cửa sổ Terminal đang chạy Expo, nhấn phím **`w`** trên bàn phím.
2. Hoặc chạy lệnh riêng:
```bash
npm run web
```
3. Trình duyệt sẽ mở ngay tại `http://localhost:8081`.

---

### 📱 Trải Nghiệm Sau Khi Vào Ứng Dụng:
Tại màn hình chào mừng, chạm nút **`🍂 Trải nghiệm Demo ngay (Lâm Lơ)`** để vào thẳng giao diện hoàn chỉnh với đầy đủ dữ liệu mẫu.
