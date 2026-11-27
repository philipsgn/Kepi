import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { buildOpenRoomEngineScript } from '../pixel/pixelOpenRoomEngine';
import { buildVnPixelKitPrimitivesScript } from '../pixel/vnPixelArtKit';
import { buildStadiumInteriorArtScript } from './stadium/stadiumInteriorArt';

const SafeWebView = WebView as unknown as React.ComponentType<any>;

interface StadiumBannerWebViewProps {
  onExitStadium?: () => void;
}

/**
 * Sân Vận Động Trống Đồng Chuẩn Quốc Tế FIFA Toàn Màn Hình (840 × 680 — Quyết định 231)
 * - Nửa trên: Chảo lửa SVĐ (Khán đài Trống Đồng phủ ghế Đỏ-Vàng khắc Cờ Đỏ Sao Vàng, Đường pitch 6 làn đỏ,
 *   Sân cỏ FIFA sọc 2 tông mượt mà khắc Mặt Trời Trống Đồng, 2 khung thành, 2 khu kỹ thuật HLV/Dự bị,
 *   trận đấu 11v11 sống động 60fps + 3 trọng tài quốc tế FIFA).
 * - Nửa dưới: 7 Phòng Hậu Trường Chuẩn FIFA (Đường Hầm Cầu Thủ, 2 Phòng Thay Đồ, Phòng Hồi Sức Cryo,
 *   Phòng Trọng Tài & VAR, Phòng Họp Báo & Tủ Trống Đồng, Nhà Vệ Sinh Nam/Nữ).
 */
export const StadiumBannerWebView: React.FC<StadiumBannerWebViewProps> = ({
  onExitStadium,
}) => {
  const webViewRef = useRef<any>(null);
  const [roomToast, setRoomToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showRoomToast = (text: string) => {
    setRoomToast(text);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setRoomToast(null), 2800);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  const handleRoomPayload = (d: any) => {
    if (!d) return;
    if (d.type === 'HAPTIC_LIGHT') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else if (d.type === 'ROOM_ACTION') {
      if (d.text) showRoomToast(String(d.text));
      if (d.id === 'exit_stadium' && d.userTriggered && onExitStadium) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
        exitTimerRef.current = setTimeout(() => onExitStadium(), 140);
      }
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onWebMsg = (ev: MessageEvent) => {
      try {
        const d = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
        handleRoomPayload(d);
      } catch (_e) {}
    };
    window.addEventListener('message', onWebMsg);
    return () => window.removeEventListener('message', onWebMsg);
  }, [onExitStadium]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      handleRoomPayload(data);
    } catch (_e) {}
  };

  const openRoomScript = useMemo(
    () =>
      buildOpenRoomEngineScript({
        canvasId: 'stadiumCv',
        worldWidth: 840,
        worldHeight: 680,
        viewWidth: 280,
        viewHeight: 400,
        walkBounds: { minX: 28, maxX: 812, minY: 94, maxY: 662 },
        initialX: 420,
        initialY: 368,
        initialCamX: 280,
        initialCamY: 70,
        speed: 68,
        hotspots: [
          {
            id: 'stadium_north_stand',
            x: 68,
            y: 4,
            w: 704,
            h: 76,
            standX: 420,
            standY: 102,
            standFace: 1,
            actionType: 'jump_joy',
            bubbleText: 'Khán đài Trống Đồng phủ Cờ Đỏ Sao Vàng · Cổ động viên cực cháy!',
          },
          {
            id: 'stadium_fifa_pitch',
            x: 180,
            y: 120,
            w: 480,
            h: 216,
            standX: 420,
            standY: 346,
            standFace: 1,
            actionType: 'jump_joy',
            bubbleText: 'Trận đấu 11v11 FIFA: Đội Tuyển Việt Nam (4-3-3) vs Đội Khách (4-4-2)!',
          },
          {
            id: 'stadium_vn_bench',
            x: 202,
            y: 344,
            w: 156,
            h: 50,
            standX: 280,
            standY: 354,
            standFace: -1,
            actionType: 'look_window',
            bubbleText: 'Khu kỹ thuật ĐT Việt Nam · HLV đang chỉ đạo & dàn cầu thủ dự bị sẵn sàng!',
          },
          {
            id: 'stadium_vn_locker',
            x: 16,
            y: 422,
            w: 352,
            h: 118,
            standX: 224,
            standY: 518,
            standFace: -1,
            actionType: 'look_window',
            bubbleText: 'Phòng Thay Đồ Đội Tuyển Việt Nam · 11 tủ áo đỏ, sa bàn 4-3-3 & khu tắm riêng!',
          },
          {
            id: 'stadium_away_locker',
            x: 472,
            y: 422,
            w: 352,
            h: 118,
            standX: 614,
            standY: 518,
            standFace: 1,
            actionType: 'look_window',
            bubbleText: 'Phòng Thay Đồ Đội Khách · Tiện nghi chuẩn công bằng quốc tế FIFA!',
          },
          {
            id: 'stadium_medical_cryo',
            x: 16,
            y: 566,
            w: 208,
            h: 106,
            standX: 116,
            standY: 576,
            standFace: -1,
            actionType: 'look_window',
            bubbleText: 'Phòng Hồi Sức & Y Tế Cryo · 2 bể ngâm đá lạnh, giường trị liệu & bác sĩ túc trực!',
          },
          {
            id: 'stadium_var_referee',
            x: 232,
            y: 566,
            w: 200,
            h: 106,
            standX: 326,
            standY: 576,
            standFace: 1,
            actionType: 'look_window',
            bubbleText: 'Phòng Trọng Tài & Trạm VAR · 4 màn hình góc quay kiểm tra việt vị chuẩn FIFA!',
          },
          {
            id: 'stadium_press_heritage',
            x: 440,
            y: 566,
            w: 224,
            h: 106,
            standX: 552,
            standY: 576,
            standFace: 1,
            actionType: 'jump_joy',
            bubbleText: 'Phòng Họp Báo & Tủ Trưng Bày Trống Đồng Đông Sơn — Cúp Vàng Vô Địch!',
          },
          {
            id: 'stadium_restrooms',
            x: 672,
            y: 566,
            w: 152,
            h: 106,
            standX: 742,
            standY: 576,
            standFace: 1,
            actionType: 'look_window',
            bubbleText: 'Khu Nhà Vệ Sinh Hiện Đại Nam / Nữ · Sạch sẽ đầy đủ gương & bồn rửa tay!',
          },
        ],
      }),
    []
  );

  const vnKitScript = useMemo(() => buildVnPixelKitPrimitivesScript(), []);
  const stadiumArtScript = useMemo(() => buildStadiumInteriorArtScript(), []);

  const htmlContent = useMemo(
    () => `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: #1E293B; }
  canvas {
    display: block; width: 100%; height: 100%;
    image-rendering: pixelated;
    image-rendering: -webkit-crisp-edges;
    image-rendering: crisp-edges;
    touch-action: none;
    cursor: grab;
  }
  canvas:active { cursor: grabbing; }
</style>
</head>
<body>
<canvas id="stadiumCv" width="280" height="400"></canvas>
<script>
window.onerror = function(msg, src, line) {
  try {
    var payload = JSON.stringify({ type: 'WEBVIEW_ERROR', msg: String(msg), line: line });
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(payload);
    else if (window.parent && window.parent !== window) window.parent.postMessage(payload, '*');
  } catch(e) {}
};
(function(){
var W = 840, H = 680;
${vnKitScript}
${stadiumArtScript}

var STADIUM = {
  t: 0, last: 0, bg: null, pigSprites: null,
  match: createFootballMatchState()
};

function buildPigSet() {
  return {
    idle: mk(24, 20, function(g) { drawPigSpriteCanonical(g, { step: 0, blink: false }); }),
    step1: mk(24, 20, function(g) { drawPigSpriteCanonical(g, { step: 1, blink: false }); }),
    step2: mk(24, 20, function(g) { drawPigSpriteCanonical(g, { step: 2, blink: false }); }),
    blink: mk(24, 20, function(g) { drawPigSpriteCanonical(g, { step: 0, blink: true }); })
  };
}

function drawPigInStadium(ctx, st, t) {
  if (!STADIUM.pigSprites) return;
  var px = Math.round(st.x), py = Math.round(st.y);
  var bounce = st.walking
    ? Math.round(Math.abs(Math.sin(t * 11)) * 1.5)
    : (st.action ? Math.round(Math.abs(Math.sin(t * 7)) * 2.2) : 0);
  var sp = STADIUM.pigSprites.idle;
  if (st.walking) sp = (Math.floor(t * 10) % 2 === 0) ? STADIUM.pigSprites.step1 : STADIUM.pigSprites.step2;
  else if ((t % 3.6) < 0.14) sp = STADIUM.pigSprites.blink;
  drawContactShadow(ctx, px, py + 1, 7.5, 2.5);
  ctx.save();
  ctx.translate(px, py - 17 - bounce);
  if (st.facing < 0) ctx.scale(-1, 1);
  ctx.drawImage(sp, -12, 0);
  ctx.restore();
}

function syncViewport() {
  var cv = document.getElementById('stadiumCv');
  if (!cv) return;
  var rect = cv.getBoundingClientRect();
  if (!rect || !rect.width || !rect.height) return;
  var aspect = rect.width / rect.height;
  var baseW = 300;
  var vh = Math.max(200, Math.min(680, Math.round(baseW / Math.max(0.45, Math.min(2.2, aspect)))));
  var vw = Math.max(220, Math.min(840, Math.round(vh * aspect)));
  if (cv.width !== vw || cv.height !== vh) {
    cv.width = vw;
    cv.height = vh;
    if (window.__openRoom && window.__openRoom.resize) {
      window.__openRoom.resize(vw, vh);
    }
  }
}

function stadiumFrame(now) {
  var dt = Math.min(0.05, (now - STADIUM.last) / 1000);
  STADIUM.last = now;
  STADIUM.t += dt;

  stepFootballMatch(STADIUM.match, dt, STADIUM.t);

  syncViewport();
  var cv = document.getElementById('stadiumCv');
  if (!cv) { requestAnimationFrame(stadiumFrame); return; }
  var ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, cv.width, cv.height);

  var st = window.__openRoom ? window.__openRoom.step(dt, now) : { x: 420, y: 368, camX: 280, camY: 70, facing: 1, walking: false };
  ctx.save();
  ctx.translate(-Math.round(st.camX), -Math.round(st.camY));
  if (STADIUM.bg) ctx.drawImage(STADIUM.bg, 0, 0);
  drawFootballMatchLive(ctx, STADIUM.match, STADIUM.t);
  drawPigInStadium(ctx, st, STADIUM.t);
  ctx.restore();

  if (window.__openRoom && window.__openRoom.drawOverlays) {
    window.__openRoom.drawOverlays(ctx, now);
  }
  requestAnimationFrame(stadiumFrame);
}

function bootStadium() {
  STADIUM.bg = buildStadiumBackgroundCanvas();
  STADIUM.pigSprites = buildPigSet();
  STADIUM.last = performance.now();
  syncViewport();
  requestAnimationFrame(stadiumFrame);
}

window.addEventListener('resize', syncViewport);
${openRoomScript}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootStadium);
} else {
  bootStadium();
}
})();
</script>
</body>
</html>`,
    [vnKitScript, stadiumArtScript, openRoomScript]
  );

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <iframe
          srcDoc={htmlContent}
          title="Sân Vận Động Trống Đồng FIFA"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
            backgroundColor: '#1E293B',
          }}
        />
      ) : (
        <SafeWebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          onMessage={handleMessage}
          scrollEnabled={false}
          bounces={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          javaScriptEnabled
          domStorageEnabled
          containerStyle={styles.webview}
          style={styles.webview}
        />
      )}
      {roomToast ? (
        <View style={styles.toastWrap} pointerEvents="none">
          <View style={styles.toastBubble}>
            <Text style={styles.toastText}>{roomToast}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#1E293B',
  },
  webview: {
    flex: 1,
    width: '100%',
    backgroundColor: '#1E293B',
  },
  toastWrap: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  toastBubble: {
    backgroundColor: '#FFFBF1',
    borderWidth: 3,
    borderColor: '#2B2118',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  toastText: {
    fontFamily: 'Nunito',
    fontSize: 13,
    fontWeight: '700',
    color: '#2B2118',
    textAlign: 'center',
  },
});
