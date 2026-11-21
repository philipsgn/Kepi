# 🎯 MASTERPROMPT DÀNH CHO DEEPSEEK AGENT: KHẮC PHỤC TRIỆT ĐỂ LỖI "MÀN HÌNH VÀNG KHÈ" (BLANK WEBVIEW) TRÊN TAB GAME VÀ TAB BẢN ĐỒ

> **Gửi tới:** Deepseek Agent / OpenCode Engineer  
> **Dự án:** PigFly (Ví Locket) — Mobile App React Native Expo (Style Heo Con Neo-Brutalist)  
> **Mục tiêu:** Chẩn đoán chính xác 100% nguyên nhân gây ra màn hình vàng khè `#F6EEDC` khi vào Game và Map, cung cấp code sửa dứt điểm, bảo toàn toàn bộ đồ họa pixel 1:1 từ prototype.

---

## 🔍 I. CHẨN ĐOÁN NGUYÊN NHÂN GỐC RỄ (POST-MORTEM ROOT CAUSE)

Khi người dùng mở **Game Heo Con** (ảnh 1) hoặc **Bản Đồ Chi Tiêu** (ảnh 2) trên iPhone (iOS / Expo Go), toàn bộ khu vực dưới Header biến thành **một màu vàng kem trơn (`#F6EEDC`)**, không hiện bất kỳ một chữ, nút bấm hay đồ họa nào.

### ❌ 1. Sai lầm 1: Xung đột Layout Flexbox (`flex: 0` + `height: contentHeight` + `winHeight - 48`)
- **Đoạn code bị lỗi trước đó:**
  ```tsx
  <View style={[styles.webViewWrapper, { height: contentHeight }]}>
    <SafeWebView
      ref={webViewRef}
      source={memoizedSource}
      containerStyle={{ width: winWidth, height: contentHeight, backgroundColor: '#F6EEDC', flex: 0 }}
      style={{ width: winWidth, height: contentHeight, backgroundColor: '#F6EEDC', flex: 0 }}
      ...
    />
  </View>
  ```
- **Cơ chế gây lỗi:**
  - `SafeWebView` (từ thư viện `react-native-webview`) tạo ra 1 `View` bọc ngoài chứa native `WKWebView` bên trong.
  - Khi bạn truyền `containerStyle` có `flex: 0` và `style` có `flex: 0` vào một container cha đang sử dụng Flexbox (`flex: 1`), Yoga Layout Engine trên iOS tính toán flex basis = 0.
  - Hậu quả: Native `WKWebView` bị co lại thành frame `CGRectZero` $(0 \times 0)$ hoặc bị tách khỏi view hierarchy khi màn hình cha (hoặc thanh Tab bar) re-render. `WKWebView` **không vẽ bất kỳ pixel nào lên màn hình**, người dùng chỉ nhìn thấy màu nền `#F6EEDC` của thẻ `View` bọc ngoài!

### ❌ 2. Sai lầm 2: Lỗi WebKit iOS với `baseUrl: ''` (Empty String URL)
- **Đoạn code bị lỗi trước đó:**
  ```tsx
  const memoizedSource = useMemo(() => ({ html: htmlContent, baseUrl: '' }), [htmlContent]);
  ```
- **Cơ chế gây lỗi:**
  - Trên iOS, phương thức native của WebKit là `[WKWebView loadHTMLString:html baseURL:baseURL]`.
  - Khi truyền `baseUrl: ''`, Objective-C thực thi `[NSURL URLWithString:@""]`.
  - Trên các phiên bản iOS hiện đại (iOS 16, 17, 18), chuỗi rỗng `""` không phải là URL hợp lệ. WebKit coi đây là vi phạm Sandbox Security và âm thầm hủy bỏ lệnh tải (`NSURLErrorCancelled` / `NSURLErrorUnsupportedURL`).
  - Toàn bộ chuỗi HTML inline không bao giờ được parse vào DOM, khiến màn hình WebView hoàn toàn trống rỗng!

### ❌ 3. Sai lầm 3: Vòng lặp Re-render do `onLayout` trong `PiggySpendMapView.tsx`
- **Đoạn code bị lỗi trước đó:**
  ```tsx
  <View
    style={styles.webContainer}
    onLayout={(e) => {
      const h = e.nativeEvent.layout.height;
      if (h > 50) setContentHeight(h);
    }}
  >
  ```
- Khi `setContentHeight` được kích hoạt liên tục trong sự kiện layout, component re-render làm thay đổi props của `SafeWebView`, khiến `WKWebView` bị reload liên tục hoặc rơi vào trạng thái treo (freeze).

---

## 🛠️ II. GIẢI PHÁP KỸ THUẬT CHUẨN XÁC 100%

### Nguyên tắc vàng để WebView React Native không bao giờ bị trắng/vàng màn hình:
1. **Bỏ hoàn toàn `baseUrl: ''`:** Chỉ truyền `source={{ html: htmlContent }}`. WebKit iOS sẽ tự động dùng `baseURL: nil` theo đúng tài liệu chuẩn của Apple.
2. **Loại bỏ `flex: 0` và kích thước cứng:** Luôn dùng Flexbox tự nhiên `{ flex: 1, width: '100%', backgroundColor: '#F6EEDC' }` cho cả `webViewWrapper`, `containerStyle` và `style`.
3. **Thêm cầu nối bắt lỗi JavaScript (Console Bridge):** Nhúng `window.onerror` vào HTML để nếu script có lỗi thì bắn `postMessage` ngay về React Native, không để lỗi chết âm thầm.

---

## 💻 III. CODE SỬA HOÀN CHỈNH CHO CẢ 3 FILE (DROP-IN CODE)

### 1. `src/components/chat/PigFlightGameView.tsx`

Thay thế đoạn render cuối file (từ `const memoizedSource` tới hết file) bằng đoạn mã chuẩn xác sau:

```tsx
  // KHẮC PHỤC LỖI MÀN HÌNH VÀNG: Bỏ baseUrl: '', dùng flex: 1 chuẩn React Native
  const memoizedSource = useMemo(() => ({ html: htmlContent }), [htmlContent]);

  return (
    <View style={styles.container}>
      {/* Top Header bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.8}>
          <ArrowLeft size={16} color="#2B2118" strokeWidth={2.8} />
          <Text style={styles.backButtonText}>‹ Quay lại Hub</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reloadButton} onPress={handleReload} activeOpacity={0.8}>
          <RefreshCw size={15} color="#2B2118" strokeWidth={2.6} />
        </TouchableOpacity>
      </View>

      {/* Webview Game Canvas: Dùng flex: 1 để tự động chiếm trọn không gian, không bị collapse 0x0 */}
      <View style={styles.webViewWrapper}>
        <SafeWebView
          ref={webViewRef}
          source={memoizedSource}
          containerStyle={styles.webViewContainer}
          style={styles.webView}
          scrollEnabled={false}
          bounces={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['*']}
          onMessage={handleMessage}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6EEDC',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F6EEDC',
    borderBottomWidth: 2,
    borderBottomColor: '#2B2118',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBF1',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  backButtonText: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 12,
    color: '#2B2118',
  },
  reloadButton: {
    backgroundColor: '#FFFBF1',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 999,
    padding: 7,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  webViewWrapper: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F6EEDC',
  },
  webViewContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F6EEDC',
  },
  webView: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F6EEDC',
  },
});
```

---

### 2. `src/components/chat/PigShooterGameView.tsx`

Thay thế đoạn render cuối file bằng đoạn mã chuẩn xác sau:

```tsx
  // KHẮC PHỤC LỖI MÀN HÌNH VÀNG: Bỏ baseUrl: '', dùng flex: 1 chuẩn React Native
  const memoizedSource = useMemo(() => ({ html: htmlContent }), [htmlContent]);

  return (
    <View style={styles.container}>
      {/* Top Header bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.8}>
          <ArrowLeft size={16} color="#2B2118" strokeWidth={2.8} />
          <Text style={styles.backButtonText}>‹ Quay lại Hub</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reloadButton} onPress={handleReload} activeOpacity={0.8}>
          <RefreshCw size={15} color="#2B2118" strokeWidth={2.6} />
        </TouchableOpacity>
      </View>

      {/* Webview Game Canvas: Dùng flex: 1 để tự động chiếm trọn không gian, không bị collapse 0x0 */}
      <View style={styles.webViewWrapper}>
        <SafeWebView
          ref={webViewRef}
          source={memoizedSource}
          containerStyle={styles.webViewContainer}
          style={styles.webView}
          scrollEnabled={false}
          bounces={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['*']}
          onMessage={handleMessage}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6EEDC',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F6EEDC',
    borderBottomWidth: 2,
    borderBottomColor: '#2B2118',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBF1',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  backButtonText: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 12,
    color: '#2B2118',
  },
  reloadButton: {
    backgroundColor: '#FFFBF1',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 999,
    padding: 7,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  webViewWrapper: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F6EEDC',
  },
  webViewContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F6EEDC',
  },
  webView: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F6EEDC',
  },
});
```

---

### 3. `src/components/chat/PiggySpendMapView.tsx`

Thay thế đoạn render cuối file bằng đoạn mã chuẩn xác sau:

```tsx
  // KHẮC PHỤC LỖI MÀN HÌNH VÀNG: Bỏ baseUrl: '', dùng flex: 1 chuẩn React Native
  const memoizedSource = useMemo(() => ({ html: htmlContent }), [htmlContent]);

  return (
    <View style={styles.container}>
      {/* HEADER QUAY LẠI NEO-BRUTALIST */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <ArrowLeft size={18} color="#2B2118" strokeWidth={2.8} />
          <Text style={styles.backButtonText}>‹ Giải trí</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>🗺️ Bản Đồ Chi Tiêu</Text>
        </View>

        <TouchableOpacity
          style={styles.iconAction}
          onPress={handleReload}
          activeOpacity={0.8}
        >
          <RefreshCw size={18} color="#2B2118" strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      {/* WEBVIEW CANVAS SIÊU MƯỢT 60FPS: Loại bỏ onLayout re-render loop, dùng flex: 1 */}
      <View style={styles.webContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            srcDoc={htmlContent}
            style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#F6EEDC' } as any}
          />
        ) : (
          <SafeWebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={memoizedSource}
            containerStyle={styles.webViewContainer}
            style={styles.webView}
            scrollEnabled={true}
            scalesPageToFit={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            automaticallyAdjustContentInsets={false}
            contentInsetAdjustmentBehavior="never"
            onMessage={handleMessage}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6EEDC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F6EEDC',
    borderBottomWidth: 2.5,
    borderBottomColor: '#2B2118',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBF1',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  backButtonText: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 13,
    color: '#2B2118',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 18,
    color: '#2B2118',
  },
  iconAction: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFBF1',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  webContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F6EEDC',
    overflow: 'hidden',
  },
  webViewContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F6EEDC',
  },
  webView: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F6EEDC',
  },
});
```

---

## 🎨 IV. NHẮC LẠI BẢO TOÀN ĐỒ HỌA PROTOTYPE (CẤM LƯỢC BỎ)

Khi thực thi sửa lỗi layout WebView, Deepseek Agent **tuyệt đối không được làm mất các cải tiến đồ họa đã hoàn thành**:
1. **Sprite Heo 24×20 (Quyết định 146 & 147):** Giữ nguyên hàm `drawPigSprite(c, o)` có 4 chân trước/sau bước đi theo frame, mõm nhô `PAL.n`, tai vểnh, highlight lưng `PAL.h`, mắt có tròng trắng `PAL.w`, giọt nước mắt buồn `#7EC8F0`, chuông cổ vàng `PAL.g`/`PAL.G` và đuôi cong nhúc nhích.
2. **Khóa Trời Xanh Ban Ngày (Quyết định 147):** Cố định `flyReset()` ở `u = 0.35` (dải xanh sáng rực rỡ, mặt trời vàng). Không tự động đổi đêm làm tối màn hình; chỉ đổi qua nút bấm `[Đổi trời]`.
3. **Canvas Integer DPR 3×:** Backing store `FW*3` × `FH*3`, scale `ctx.scale(3, 3)`, `imageSmoothingEnabled = false`, CSS `image-rendering: pixelated; crisp-edges`.
4. **Touch Cảm Ứng 0ms:** `pointerdown` + `touchstart` với `{ passive: false }` cho vỗ cánh Flappy Pig; và ná bắn Angry Pig đọc `touches[0]` với bán kính mở rộng 40px.
5. **Tiêu chuẩn kiểm thử:** Sau khi áp dụng, bắt buộc chạy `npx tsc --noEmit` đạt 0 lỗi và `node run-all-tests.js` đạt 100% pass (86/86 test).
