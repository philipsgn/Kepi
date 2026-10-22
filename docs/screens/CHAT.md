# 📋 ĐẶC TẢ MÀN HÌNH: CHAT (CHAT.MD)

> **Mã màn hình:** `CHAT` (Tab 4, Index 3 trong thanh điều hướng 5 trang)  
> **Tên màn hình:** Chat (Trò Chuyện Cùng Heo Béo Pigpo AI & Hội Bạn Thân 2-4 Người)  
> **Trạng thái:** Chờ Chủ Dự Án Duyệt (Stage A)  
> **Phiên bản:** 1.0  
> **Lần cập nhật cuối:** 2026-10-02  

---

## 1. Mục Tiêu & Người Dùng
- **User Story:** Là một người dùng trẻ tuổi, tôi muốn **có một nơi để hỏi về số liệu tài chính của bản thân, xin lời khuyên thẳng thắn trước khi mua một món đồ đắt đỏ, hoặc nhờ ghi sổ bằng một câu nói tự nhiên**, để quản lý tiền bạc không còn là việc độc hành cô đơn và khô khan.
- **Mục tiêu sản phẩm:**
  - Xây dựng hình tượng **"Anh Minh AI"**: Người anh lớn thẳng tính, vui vẻ, tôn trọng, am hiểu tâm lý tiêu dùng, đóng vai trò như một huấn luyện viên (PT) tài chính cá nhân.
  - Phân vai rạch ròi: Home = hiện tại trong ngày; Thống kê = album cuộn theo tháng; Camera = hành động & lịch sử ngày; **Chat = hỏi đáp số liệu, xin ý kiến phản biện & trò chuyện bạn bè**; Hồ sơ = thiết lập cá nhân.
- **Tiêu chí thành công đo được (Success Metrics):**
  1. Thời gian phản hồi câu hỏi tài chính từ Anh Minh ≤ 1.5 giây (dữ liệu do code tính sẵn, AI chỉ diễn đạt).
  2. Tỷ lệ câu trả lời hữu ích (người dùng bấm "Mua", "Để sau", "Không mua" hoặc bấm "Lưu vào sổ" từ chat) ≥ 70%.
  3. 0 trường hợp AI tự tính sai số tiền hoặc đưa ra lời khuyên đầu tư tài chính trái thẩm quyền.

---

## 2. Wireframe Chữ (ASCII Wireframe)

### 2.1. Ngăn Chính: Trò Chuyện Cùng Anh Minh AI (Default Tab)
```text
┌────────────────────────────────────────────────────────┐
│        [  🐷 Heo Béo  ]      ·      [  👥 Bạn thân  ]      │ (Hai ngăn đầu trang)
├────────────────────────────────────────────────────────┤
│ ┌ Lời Chào & Thẻ Trạng Thái ─────────────────────────┐ │
│ │ [ M ]  Anh Minh: "Hôm nay em còn 65.000 đ.         │ │
│ │        Có món nào đang ngắm mà phân vân không?"    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ [ Người dùng ]: "Tháng này mình uống hết bao nhiêu cà phê?"
│                                                        │
│ [ M ] Anh Minh:                                        │
│ "Từ đầu tháng đến giờ chú uống hết 8 ly cà phê,        │
│  tổng cộng 280.000 đ rồi nhé."                         │
│ ┌ Thẻ Số Liệu Mini (Chạm để nhảy sang Thống kê) ─────┐ │
│ │ ☕ Cà phê chill · 280.000 đ (chiếm 11% chi tháng)   │ │
│ │ [ Xem chi tiết trong Thống kê ➔ ]                  │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ [ Người dùng ]: "Ghi 35k xôi xéo Hàng Bài"            │
│                                                        │
│ [ M ] Anh Minh:                                        │
│ "Đã chuẩn bị thẻ ghi, kiểm tra rồi bấm Lưu nhé:"       │
│ ┌ Thẻ Xác Nhận Ghi Sổ ───────────────────────────────┐ │
│ │ 35.000 đ · Ăn uống · Xôi xéo Hàng Bài              │ │
│ │ [ Hủy ]                         [ LƯU VÀO SỔ ➔ ]   │ │
│ └────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────┤
│ Gợi ý: [ Hôm nay còn bao nhiêu? ] [ Có nên mua? ] ...  │ (Chip gợi ý nhanh)
├────────────────────────────────────────────────────────┤
│ [📷] [ 💬 Nhập tin nhắn...                ] [🎙️ Giữ nói]│
└────────────────────────────────────────────────────────┘
```

### 2.2. Ngăn "Bạn Bè" (Màn Hình Sắp Ra Mắt — Đón Đầu Giai Đoạn M2)
```text
┌────────────────────────────────────────────────────────┐
│        [  Anh Minh  ]      ·      [  Bạn bè  ]         │
├────────────────────────────────────────────────────────┤
│                                                        │
│                    ┌───────────┐                       │
│                    │   [👥]    │ (Khối vàng 3px viền)  │
│                    └───────────┘                       │
│                   VÒNG BẠN BÈ                          │
│                   SẮP RA MẮT                           │
│                                                        │
│   • Hỏi bạn thân: Gửi món phân vân để bạn vote Nên/Đừng│
│   • Cùng giữ ngân sách: Thử thách no-buy 7 ngày        │
│   • Mặc định ẩn số tiền, bảo mật tuyệt đối             │
│                                                        │
│              [ 🔔 BÁO KHI CÓ TÍNH NĂNG ]                │ (Nút Chunky 3D)
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 2.3. Thẻ "Giá Thật" Thu Gọn Xuất Hiện Trong Khung Chat
```text
┌────────────────────────────────────────────────────────┐
│ ┌ Thẻ Giá Thật (Khi bấm "Hỏi Anh Minh" từ Camera) ───┐ │
│ │ [Ảnh] Áo khoác dạ dáng dài · 1.250.000 đ            │ │
│ │ • Bằng 36 giờ làm việc · Bằng 19 ngày ngân sách      │ │
│ │                                                      │ │
│ │ Lời khuyên Anh Minh:                                 │ │
│ │ "Khoản này hơi nặng ví, nên để sau 24h nghĩ lại."   │ │
│ ├──────────────────────────────────────────────────────┤ │
│ │ [ Mua ]       [ Để sau (24h) ]       [ Không mua ]   │ │
│ └──────────────────────────────────────────────────────┘ │
│ ⚠️ Dựa trên số liệu bạn cung cấp, không phải lời khuyên│
│    đầu tư tài chính chuyên nghiệp.                     │
└────────────────────────────────────────────────────────┘
```

---

## 3. Cây Component & Props (Component Hierarchy)

```text
<ChatView> (src/components/views/ChatView.tsx)
  ├── <ChatTopSegmentHeader> (Công tắc 2 ngăn: [Anh Minh] | [Bạn bè])
  │
  ├── [Ngăn 1: Anh Minh]
  │     ├── <MessageList> (Danh sách tin nhắn cuộn mượt mà)
  │     │     ├── <CoachMessageBubble> (Bong bóng Anh Minh, avatar khối vuông chữ "M")
  │     │     │     ├── <MiniMetricCard> (Thẻ số liệu mini chạm nhảy trang)
  │     │     │     ├── <InlineConfirmationCard> (Thẻ xác nhận ghi sổ)
  │     │     │     └── <InlineActualPriceCard> (Thẻ Giá thật thu gọn với 3 nút)
  │     │     └── <UserMessageBubble> (Bong bóng người dùng gửi chữ/ảnh)
  │     ├── <ContextPromptChips> (Hàng chip câu hỏi gợi ý nhanh)
  │     └── <ChatInputBar> (Thanh nhập liệu: Nút chụp ảnh/thư viện, Input chữ, Nút gửi)
  │
  └── [Ngăn 2: Bạn bè]
        └── <FriendsComingSoonView> (Màn hình giới thiệu tính năng M2 + Nút "Báo khi có")
```

### Bảng Chi Tiết Props:
| Component | File Nguồn | Props Chính | Mô Tả |
| :--- | :--- | :--- | :--- |
| `ChatView` | `src/components/views/ChatView.tsx` | `onNavigateToStats, onNavigateToCamera` | Màn hình chính Tab 4 quản lý hội thoại |
| `ChatTopSegmentHeader` | `src/components/chat/ChatTopSegmentHeader.tsx` | `activeTab: 'COACH' \| 'FRIENDS', onSelectTab: (tab) => void` | Thanh công tắc chuyển 2 ngăn đầu trang |
| `CoachMessageBubble` | `src/components/chat/CoachMessageBubble.tsx` | `message: ChatMessage, onActionPress?: (action) => void` | Bong bóng tin nhắn của Anh Minh kèm avatar chữ M |
| `MiniMetricCard` | `src/components/chat/MiniMetricCard.tsx` | `title, amount, category, percent, onPress` | Thẻ số liệu mini chạm nhảy sang Thống kê |
| `ChatInputBar` | `src/components/chat/ChatInputBar.tsx` | `onSendMessage: (text) => void, onSendPhoto: (uri) => void` | Thanh nhập liệu text và đính kèm ảnh |
| `FriendsComingSoonView` | `src/components/chat/FriendsComingSoonView.tsx` | `onNotifyMe: () => void` | Màn giới thiệu tính năng Bạn bè M2 |

---

## 4. Hợp Đồng Dữ Liệu & Quy Chuẩn Phát Ngôn (Data Contract)

### 4.1. Kiểu Dữ Liệu TypeScript
```typescript
export type ChatSender = 'USER' | 'COACH';

export type ChatCardType = 'NONE' | 'METRIC' | 'CONFIRMATION' | 'ACTUAL_PRICE';

export interface ChatMessage {
  id: string;
  sender: ChatSender;
  text: string;
  photoUrl?: string | null;
  cardType?: ChatCardType;
  cardData?: any;
  createdAt: string;
}
```

### 4.2. Quy Chuẩn Nhân Vật & Giọng Điệu Anh Minh AI
1. **Xưng hô mặc định:** Xưng *"anh"*, gọi người dùng bằng *"bạn"* (hoặc gọi bằng tên/biệt danh). Thay đổi được trong Hồ sơ.
2. **Nguyên tắc phát ngôn:**
   - **Tối đa 3 câu mỗi lượt trả lời** (ngắn gọn, xúc tích, không dài dòng triết lý).
   - **Con số do code tính, AI chỉ diễn đạt:** Mọi con số (số dư, số tiền đã chi cho cà phê, tỷ lệ % ngân sách) bắt buộc được trích xuất từ `useBudgetStore` và `useTransactionStore`, AI không được tự ý bịa số hay tự làm phép tính nhẩm.
   - Luôn đưa ra **1 câu hỏi phản biện** hoặc **1 gợi ý hành động cụ thể** (ví dụ: *"Có nên để vào giỏ 24h không em?"*).
   - **Cấm tuyệt đối:** Phán xét miệt thị thu nhập, gợi ý mua cổ phiếu, tiền số, bảo hiểm, hay kêu gọi bỏ vốn.
   - **Khi người dùng căng thẳng tài chính:** Đổi sang giọng điệu ân cần, chia nhỏ các bước giải quyết, tuyệt đối không đùa cợt.
3. **Hạn mức AI trong bản M0:** **Không giới hạn số lượt** để tối đa hóa trải nghiệm của người dùng giai đoạn kiểm thử.

---

## 5. Ma Trận Trạng Thái (State Matrix)

| Trạng Thái | Điều Kiện | Giao Diện Hiển Thị | Hành Vi Người Dùng |
| :--- | :--- | :--- | :--- |
| **Lần đầu mở Chat** | Chưa có tin nhắn cũ | Anh Minh gửi lời chào ngắn kèm 3 chip gợi ý câu hỏi | Bấm chip gợi ý hoặc gõ câu hỏi đầu tiên |
| **Đang chờ AI trả lời** | Đang gọi Gemini API | Dấu ba chấm động `•••` khối vàng nhấp nháy | Khóa nút gửi tạm thời |
| **Ghi nhận khoản chi** | Người dùng nhắn: "Ghi 45k cà phê" | Trả về thẻ xác nhận có ảnh minh họa & 2 nút Hủy / Lưu | Người dùng bấm "LƯU VÀO SỔ" mới ghi vào DB |
| **Hỏi ý kiến trước mua** | Người dùng gửi ảnh hoặc từ màn Giá thật | Trả về thẻ Giá thật thu gọn + 3 nút Mua / Để sau / Không mua | Chọn 1 trong 3 hành động trực tiếp trong chat |
| **Ngoại tuyến / Mất mạng** | Không có kết nối Internet | Câu trả lời mẫu hợp ngữ cảnh + hiển thị thẻ số liệu cục bộ | Vẫn xem được số liệu do code tính |
| **Ngăn Bạn bè** | Người dùng bấm tab [Bạn bè] | Màn hình "Vòng Bạn Bè - Sắp ra mắt" + Nút "Báo khi có" | Bấm nút nhận thông báo khi M2 ra mắt |

---

## 6. Tương Tác & Cử Chỉ (Interactions & Gestures)
- **Chạm chip gợi ý (Tap Prompt Chip):** Tự động gửi câu hỏi vào ô chat và gọi Anh Minh phản hồi.
- **Nhập câu hỏi và gửi (Send message):** Gõ câu hỏi tài chính và chạm nút gửi (mũi tên hoặc phím Enter trên bàn phím).
- **Chạm Thẻ Số Liệu Mini:** Tự động chuyển trang sang **Thống kê** hoặc **Lịch sử** và áp dụng bộ lọc tương ứng với câu hỏi.
- **Chạm nút trên Thẻ Xác Nhận:** Bấm *"Lưu vào sổ"* sẽ lưu giao dịch vào DB và hiển thị thanh hoàn tác 5 giây.

---

## 7. Chuyển Động & Hoạt Họa (Motion & Animation)
- **Bong bóng xuất hiện:** Nảy nhẹ từ dưới lên dạng spring (`stiffness: 140, damping: 14`).
- **Dấu ba chấm đang soạn:** Nhấp nháy so le 300ms dạng khối vàng.
- **Chuyển ngăn [Anh Minh] $\leftrightarrow$ [Bạn bè]:** Trượt nền chọn vàng 150ms sắc nét.

---

## 8. Bảng Từ Ngữ (String Dictionary)

*Bổ sung/cập nhật vào `src/constants/strings.ts`:*

| Khóa Chuỗi | Giá Trị Tiếng Việt Hiển Thị | Ngữ Cảnh Sử Dụng |
| :--- | :--- | :--- |
| `chat.coachTab` | `"Anh Minh"` | Tên ngăn huấn luyện viên |
| `chat.friendsTab` | `"Bạn bè"` | Tên ngăn bạn bè |
| `chat.coachRole` | `"PT Tài Chính Của Bạn"` | Phụ đề dưới tên Anh Minh |
| `chat.inputPlaceholder` | `"Hỏi Anh Minh hoặc nhờ ghi sổ..."` | Placeholder ô nhập tin nhắn |
| `chat.promptTodayRemaining` | `"Hôm nay còn tiêu được bao nhiêu?"` | Chip gợi ý |
| `chat.promptCoffeeTotal` | `"Tháng này tiêu bao nhiêu tiền cà phê?"` | Chip gợi ý |
| `chat.promptShouldIBuy` | `"Có nên mua món này không anh?"` | Chip gợi ý |
| `chat.promptSetGoal` | `"Giúp mình đặt mục tiêu tháng này"` | Chip gợi ý |
| `chat.saveConfirmPrompt` | `"Đã chuẩn bị thẻ ghi, kiểm tra rồi bấm Lưu nhé:"` | Phản hồi khi nhờ ghi |
| `chat.disclaimer` | `"Dựa trên số liệu bạn cung cấp, không phải lời khuyên đầu tư tài chính chuyên nghiệp."` | Dòng miễn trừ trách nhiệm |
| `chat.friendsComingSoonTitle` | `"VÒNG BẠN BÈ SẮP RA MẮT"` | Tiêu đề ngăn Bạn bè |
| `chat.friendsComingSoonDesc` | `"Hỏi bạn trước khi mua, thử thách giữ ngân sách tuần và cùng nhau tiến bộ."` | Mô tả ngăn Bạn bè |
| `chat.friendsNotifyBtn` | `"Báo khi có tính năng"` | Nút hành động ngăn Bạn bè |

---

## 9. Khả Năng Tiếp Cận (Accessibility — A11y)
- **VoiceOver:** Nhãn bong bóng đọc: *"Tin nhắn từ Anh Minh: {nội dung tin nhắn}, lúc {giờ}"*. Thẻ số liệu đọc rõ số tiền và phần trăm.
- **Vùng chạm:** Các chip gợi ý và nút gửi tin nhắn/nút mic tối thiểu 44px x 44px.
- **Độ tương phản:** Bong bóng của Anh Minh là nền tối `#1A1A20` viền đen 2px, chữ xám ngà `#FAF6F0` (đạt tỷ lệ 12.8:1).

---

## 10. Ngân Sách Hiệu Năng & Chi Phí AI (Performance & AI Budget)
- **Thời gian phản hồi:** ≤ 1.5 giây.
- **Tiết kiệm Token & Bảo mật:** Không gửi ảnh lên AI nếu câu hỏi thuần text; không gửi thông tin định danh nhạy cảm (số tài khoản, mật khẩu).
- **Offline First:** Lưu toàn bộ lịch sử trò chuyện vào AsyncStorage cục bộ để người dùng có thể xem lại ngay lập tức khi mở app kể cả khi mất mạng.

---

## 11. Kế Hoạch Kiểm Thử (Test Plan)
- **Unit Tests (`src/utils/__tests__/chatUtils.test.ts`):**
  - Test hàm bóc tách lệnh ghi sổ ("Ghi 45k trà sữa" $\rightarrow$ parse đúng số tiền 45.000 và danh mục Ăn uống).
  - Test hàm định dạng câu trả lời số liệu tài chính từ store.
  - Test logic chuyển đổi tab [Anh Minh] $\leftrightarrow$ [Bạn bè].
- **Kiểm thử trên thiết bị thật:**
  - Kiểm tra nhắn tin liên tục 10 lượt xem tốc độ phản hồi và độ mượt cuộn.
  - Kiểm tra bấm nút "Lưu vào sổ" từ tin nhắn chat và kiểm chứng số tiền được cập nhật vào Home và Thống kê ngay tức thì.

---

## 12. Tiêu Chí Nghiệm Thu (Acceptance Criteria — Đo Được)
1. [ ] Đầu trang có 2 ngăn [Anh Minh] và [Bạn bè]; chuyển đổi mượt mà.
2. [ ] Ngăn Anh Minh hiển thị avatar khối vuông chữ "M", xưng "anh", trả lời ngắn gọn ≤ 3 câu.
3. [ ] Nhờ ghi sổ ("Ghi 45k trà sữa") hiện thẻ xác nhận Polaroid; bấm Lưu sẽ lưu vào DB và cập nhật ngân sách.
4. [ ] Hỏi số liệu ("Tháng này tiêu bao nhiêu cà phê?") trả về thẻ số liệu mini có thể chạm nhảy sang Thống kê.
5. [ ] Ngăn Bạn bè hiển thị màn "Sắp ra mắt" kèm nút "Báo khi có tính năng".
6. [ ] Hạn mức AI không giới hạn ở M0.
7. [ ] Đạt chuẩn 0 error, 0 warning khi chạy `npx tsc --noEmit`.

---

## 13. Rủi Ro & Giải Pháp
- **Rủi ro:** Khi mất mạng hoặc API Gemini bị timeout, người dùng gửi tin nhắn bị treo hoặc hiện lỗi thô kỹ thuật.
- **Giải pháp:** Bắt timeout 8 giây; khi lỗi mạng tự động kích hoạt câu trả lời mẫu thông minh kèm thẻ số liệu từ bộ nhớ cục bộ mà không báo lỗi thô.
