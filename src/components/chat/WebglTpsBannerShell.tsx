import React, { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { buildTps3dEngineScript } from '../pixel/pixelTps3dEngine';
import { buildPixelWebgl3dEngineScript } from '../pixel/pixelWebgl3dEngine';
import { buildPixelTpsBillboardsScript } from '../pixel/pixelTpsBillboards';
import { buildPixelNavGraph3dScript } from '../pixel/pixelNavGraph3d';

const SafeWebView = WebView as unknown as React.ComponentType<any>;

export interface WebglTpsBannerShellProps {
  title: string;
  backgroundHex?: string;
  active?: boolean;
  wallArtScript: string;
  sceneScript: string;
  initScript: string;
  commandPayload?: Record<string, any> | null;
  onPayload?: (payload: any) => void;
}

/**
 * Khung WebGL 3D TPS Dùng Chung 0-CDN Cho Toàn Bộ 7 Địa Danh (Quyết định 248–250)
 * - Tuân thủ Luật 4 Fabric iOS: không truyền baseUrl: '', flex: 1 tự nhiên, cầu nối window.onerror.
 * - Hỗ trợ đồng thời SafeWebView (iOS/Android) và <iframe srcDoc> (Web PWA).
 * - Giao diện sạch chuẩn TPS 3D: 0% .room-switcher / 0% roomFade / tối đa 1 Context Action Pill.
 */
export const WebglTpsBannerShell: React.FC<WebglTpsBannerShellProps> = ({
  title,
  backgroundHex = '#2B2118',
  active = true,
  wallArtScript,
  sceneScript,
  initScript,
  commandPayload,
  onPayload,
}) => {
  const webViewRef = useRef<any>(null);
  const iframeRef = useRef<any>(null);
  const onPayloadRef = useRef(onPayload);
  onPayloadRef.current = onPayload;

  const dispatchCommand = (cmd: Record<string, any>) => {
    const serialized = JSON.stringify(cmd);
    if (Platform.OS === 'web') {
      try {
        iframeRef.current?.contentWindow?.postMessage(serialized, '*');
      } catch (_e) {}
      return;
    }
    try {
      webViewRef.current?.injectJavaScript(
        `window.__onHostCmd && window.__onHostCmd(${serialized}); true;`
      );
    } catch (_e) {}
  };

  useEffect(() => {
    dispatchCommand({ type: 'SET_ACTIVE', active });
  }, [active]);

  useEffect(() => {
    if (commandPayload) dispatchCommand(commandPayload);
  }, [commandPayload]);

  const handleRoomPayload = (d: any) => {
    if (!d) return;
    if (d.type === 'HAPTIC_LIGHT') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else if (d.type === 'HAPTIC_MEDIUM') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } else if (d.type === 'JS_ERROR') {
      console.warn('[WebglTpsBannerShell]', title, d.message, d.line);
    }
    onPayloadRef.current?.(d);
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
  }, []);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      handleRoomPayload(data);
    } catch (_e) {}
  };

  const tpsEngineScript = useMemo(() => buildTps3dEngineScript(), []);
  const webglEngineScript = useMemo(() => buildPixelWebgl3dEngineScript(), []);
  const billboardsScript = useMemo(() => buildPixelTpsBillboardsScript(), []);
  const navGraphScript = useMemo(() => buildPixelNavGraph3dScript(), []);

  const htmlContent = useMemo(
    () => `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: ${backgroundHex}; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  canvas {
    display: block; width: 100%; height: 100%;
    touch-action: none; cursor: grab;
  }
  canvas:active { cursor: grabbing; }
  .ctx-pill-bar {
    position: fixed; bottom: 26px; left: 16px; right: 16px;
    display: flex; justify-content: center; pointer-events: none; z-index: 15;
  }
  .ctx-pill-btn {
    pointer-events: auto;
    background: #F4B93B; color: #2B2118;
    border: 3px solid #2B2118; border-radius: 16px;
    padding: 10px 18px; font-size: 14px; font-weight: 900;
    box-shadow: 0 4px 0 #2B2118; cursor: pointer;
  }
  .ctx-pill-btn:active { transform: translateY(2px); box-shadow: 0 2px 0 #2B2118; }
  [hidden] { display: none !important; }
</style>
</head>
<body>
<canvas id="tpsCv"></canvas>
<div class="ctx-pill-bar"><button id="ctxPillBtn" class="ctx-pill-btn" hidden></button></div>
<script>
window.onerror = function(msg, src, line, col) {
  try {
    var payload = JSON.stringify({ type: 'JS_ERROR', message: String(msg), line: line, col: col });
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(payload);
    else if (window.parent && window.parent !== window) window.parent.postMessage(payload, '*');
  } catch(e) {}
};
function postRN(obj) {
  try {
    var s = JSON.stringify(obj);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else if (window.parent && window.parent !== window) window.parent.postMessage(s, '*');
  } catch(e) {}
}
window.__isActive = ${active ? 'true' : 'false'};
window.__onHostCmd = function(cmd) {
  if (!cmd) return;
  if (cmd.type === 'SET_ACTIVE') window.__isActive = !!cmd.active;
  if (typeof window.__handleVenueCmd === 'function') window.__handleVenueCmd(cmd);
};
if (typeof window !== 'undefined') {
  window.addEventListener('message', function(ev) {
    try {
      var d = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
      window.__onHostCmd(d);
    } catch(e) {}
  });
}
${tpsEngineScript}
${webglEngineScript}
${billboardsScript}
${navGraphScript}
${wallArtScript}
${sceneScript}
${initScript}
</script>
</body>
</html>`,
    [title, backgroundHex, active, tpsEngineScript, webglEngineScript, billboardsScript, navGraphScript, wallArtScript, sceneScript, initScript]
  );

  const memoizedSource = useMemo(() => ({ html: htmlContent }), [htmlContent]);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { backgroundColor: backgroundHex }]}>
        <iframe
          ref={iframeRef}
          title={title}
          srcDoc={htmlContent}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: backgroundHex }]}>
      <SafeWebView
        ref={webViewRef}
        source={memoizedSource}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        containerStyle={[styles.webView, { backgroundColor: backgroundHex }]}
        style={[styles.webView, { backgroundColor: backgroundHex }]}
        onMessage={handleMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  webView: {
    flex: 1,
    width: '100%',
  },
});
