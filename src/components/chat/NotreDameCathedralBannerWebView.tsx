import React, { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { buildOpenRoomEngineScript } from '../pixel/pixelOpenRoomEngine';
import { buildCathedralInteriorArtScript } from './cathedral/cathedralInteriorArt';

interface NotreDameCathedralBannerWebViewProps {
  active?: boolean;
  onExitToHub?: () => void;
}

/**
 * Không Gian Toàn Màn Hình Nội Thất Nhà Thờ Đức Bà Sài Gòn (640×520, Dynamic 1:1 Square Pixel — Quyết định 219)
 * - Kiến trúc cổ kính hoài niệm Châu Âu (Gothic-Romanesque): 3 tầng vòm gân vàng đất, 3 cửa kính màu stained-glass,
 *   Cung Thánh lung linh, 2 chùm đèn pha lê vàng rực, 2 hành lang phụ cột vòm, 2 cánh 8 hàng ghế gỗ + ~60 người dự lễ.
 * - Va chạm AABB quanh Cung Thánh & 2 khối ghế gỗ để Heo Con (24×20) đi dọc lối đi giữa & 2 hành lang phụ.
 */
export const NotreDameCathedralBannerWebView: React.FC<NotreDameCathedralBannerWebViewProps> = ({
  active = true,
  onExitToHub,
}) => {
  const webViewRef = useRef<any>(null);
  const iframeRef = useRef<any>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    webViewRef.current?.injectJavaScript?.(
      `window.__ndSetActive && window.__ndSetActive(${active ? 'true' : 'false'}); true;`
    );
  }, [active]);

  const handleRoomPayload = (d: any) => {
    if (!d) return;
    if (d.type === 'HAPTIC_LIGHT') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else if (d.type === 'ROOM_ACTION') {
      if (d.id === 'exit_cathedral' && d.userTriggered && onExitToHub) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
        exitTimerRef.current = setTimeout(() => {
          onExitToHub();
        }, 120);
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
  }, [onExitToHub]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      handleRoomPayload(data);
    } catch (_e) {}
  };

  const openRoomScript = useMemo(
    () =>
      buildOpenRoomEngineScript({
        canvasId: 'ndCv',
        worldWidth: 640,
        worldHeight: 520,
        viewWidth: 220,
        viewHeight: 320,
        walkBounds: { minX: 28, maxX: 612, minY: 206, maxY: 496 },
        initialX: 320,
        initialY: 368,
        initialCamX: 210,
        initialCamY: 160,
        speed: 48,
        obstacles: [
          // 2 cánh 8 hàng ghế gỗ đánh bóng (chừa lối đi giữa x: 272..368 & 2 hành lang phụ x: 28..106, 534..612)
          { x: 112, y: 224, w: 156, h: 224 },
          { x: 372, y: 224, w: 156, h: 224 },
        ],
        hotspots: [
          {
            id: 'sanctuary_altar',
            x: 214,
            y: 132,
            w: 212,
            h: 74,
            standX: 320,
            standY: 214,
            standFace: 1,
            actionType: 'look_window',
            bubbleText: `Cung Thánh Nhà Thờ Đức Bà · Ánh đèn vàng ấm áp & trang nghiêm!`,
          },
          {
            id: 'stained_glass',
            x: 230,
            y: 20,
            w: 180,
            h: 64,
            standX: 320,
            standY: 224,
            standFace: 1,
            actionType: 'look_window',
            bubbleText: `Kính màu Stained-Glass Châu Âu cổ kính rực rỡ ánh nắng!`,
          },
          {
            id: 'left_pews',
            x: 112,
            y: 224,
            w: 156,
            h: 224,
            standX: 286,
            standY: 332,
            standFace: -1,
            actionType: 'check_ledger',
            bubbleText: `Hàng ghế gỗ đánh bóng cổ điển · Mọi người đang cầu nguyện bình yên`,
          },
          {
            id: 'right_pews',
            x: 372,
            y: 224,
            w: 156,
            h: 224,
            standX: 354,
            standY: 332,
            standFace: 1,
            actionType: 'check_ledger',
            bubbleText: `Góc ghế cánh phải dưới ánh đèn chùm vàng lung linh`,
          },
          {
            id: 'exit_cathedral',
            x: 274,
            y: 468,
            w: 92,
            h: 52,
            standX: 320,
            standY: 472,
            standFace: 1,
            actionType: 'jump_joy',
            fastDash: true,
            bubbleText: `Bước qua cổng vòm ra lại phố Sài Gòn...`,
          },
        ],
      }),
    []
  );

  const cathedralArtScript = useMemo(() => buildCathedralInteriorArtScript(), []);

  const htmlContent = useMemo(
    () => `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;user-select:none}
html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#3A2D25;display:flex;align-items:center;justify-content:center}
#ndCv{
  width:100%;
  height:100%;
  display:block;
  image-rendering:pixelated;
  image-rendering:-webkit-crisp-edges;
  image-rendering:-moz-crisp-edges;
  image-rendering:crisp-edges;
  cursor:grab;
  touch-action:none;
}
</style>
<script>
window.onerror=function(msg,src,line){
  if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(JSON.stringify({type:'CONSOLE_ERROR',error:String(msg),line:line}));}
  return false;
};
</script>
</head>
<body>
<canvas id="ndCv" width="220" height="320" role="img" aria-label="Nội thất Nhà Thờ Đức Bà Sài Gòn cổ kính Châu Âu với 3 tầng vòm gân vàng, kính màu, đèn chùm lung linh và ~60 người dự lễ"></canvas>
<script>
(function(){
'use strict';

var INK='#2B2118';
var WORLD_W=640;
var WORLD_H=520;
var VW=220;
var VH=320;

function R(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function E(c,cx,cy,rx,ry,col){
  c.fillStyle=col;
  for(var dy=-ry;dy<=ry;dy++)for(var dx=-rx;dx<=rx;dx++)
    if((dx*dx)/(rx*rx)+(dy*dy)/(ry*ry)<=1)c.fillRect(Math.round(cx+dx),Math.round(cy+dy),1,1);
}

// Sprite Heo Con 24×20 chuẩn Tab Vườn
var PAL={o:'#4B2B21',p:'#F9B8C4',s:'#EE90A6',n:'#F08DA4',h:'#FFE3E8',k:'#2B2118',g:'#F4B93B',G:'#B97A14',w:'#FFFFFF'};
var hp=document.createElement('canvas');hp.width=24;hp.height=20;
var hpx=hp.getContext('2d');hpx.imageSmoothingEnabled=false;
function drawPigSprite(c,o){
  o=o||{};
  var pose=o.pose||'stand', f=o.frame||0, by=pose==='walk'?(f%2?0:1):0;
  var hx=pose==='eat'?1:0, hy=pose==='eat'?3:by;
  var I=PAL.k,P=PAL.p,S=PAL.s,N=PAL.n,H=PAL.h,G=PAL.g;
  if(o.tail){R(c,2,10+by,2,1,I);R(c,1,9+by,1,2,I);R(c,2,8+by,1,1,I);}
  else{R(c,2,11+by,2,1,I);R(c,1,10+by,1,1,I);}
  R(c,4,7+by,14,9,I);R(c,3,8+by,16,7,I);
  R(c,5,8+by,12,7,P);R(c,4,9+by,14,5,P);
  R(c,6,8+by,10,2,H);R(c,5,13+by,12,2,S);
  R(c,9,8+by,4,1,I);R(c,9,9+by,4,1,G);
  R(c,14+hx,3+hy,3,3,I);R(c,15+hx,4+hy,1,1,N);
  R(c,12+hx,4+hy,9,9,I);R(c,11+hx,5+hy,11,7,I);
  R(c,13+hx,5+hy,7,7,P);R(c,12+hx,6+hy,9,5,P);
  R(c,13+hx,5+hy,5,2,H);R(c,13+hx,11+hy,6,1,S);
  R(c,19+hx,7+hy,4,4,I);R(c,20+hx,8+hy,2,2,N);
  R(c,20+hx,8+hy,1,1,I);R(c,21+hx,9+hy,1,1,I);
  if(o.blink){R(c,16+hx,8+hy,2,1,I);}
  else if(o.happy){R(c,16+hx,8+hy,1,1,I);R(c,17+hx,7+hy,1,1,I);R(c,18+hx,8+hy,1,1,I);}
  else{R(c,16+hx,7+hy,2,2,I);R(c,16+hx,7+hy,1,1,PAL.w);}
  R(c,14+hx,10+hy,2,1,'#F27D94');
  var L1=pose==='walk'?(f%2?0:-1):0, L2=pose==='walk'?(f%2?-1:0):0;
  [[6,L1,P],[9,L2,P],[13,L2,S],[16,L1,S]].forEach(function(lg){
    R(c,lg[0],15+by+lg[1],2,4,I);R(c,lg[0],15+by+lg[1],1,2,lg[2]);R(c,lg[0],18+by+lg[1],2,1,I);
  });
}

${cathedralArtScript}

var ND={bg:null,pews:null,t:0,last:0,dt:0,run:false,w:VW,h:VH};

function buildCathedral(){
  var bg=document.createElement('canvas');bg.width=WORLD_W;bg.height=WORLD_H;
  var x=bg.getContext('2d');x.imageSmoothingEnabled=false;
  drawCathedralBg(x,WORLD_W,WORLD_H);
  ND.bg=bg;

  var pw=document.createElement('canvas');pw.width=WORLD_W;pw.height=WORLD_H;
  var px=pw.getContext('2d');px.imageSmoothingEnabled=false;
  drawCathedralPewsLayer(px);
  ND.pews=pw;
}

function drawPigAt(x,rm,t){
  if(!rm)return;
  var px=Math.round(rm.x-12), jumpY=(rm.action==='jump_joy'?-Math.abs(Math.sin(t*10))*4:0), py=Math.round(rm.y-20+jumpY);
  E(x,Math.round(rm.x),Math.round(rm.y)-1,11,3,'rgba(43,33,24,0.24)');
  hpx.clearRect(0,0,24,20);
  drawPigSprite(hpx,{pose:rm.walking?'walk':'stand',frame:rm.walking?(((t*6)|0)%2):0,happy:Boolean(rm.action),blink:(t%4)<0.15,tail:Math.floor(t*3)%2===1});
  x.save();
  if(rm.facing<0){x.translate(px+24,py);x.scale(-1,1);x.drawImage(hp,0,0,24,20,0,0,24,20);}
  else x.drawImage(hp,0,0,24,20,px,py,24,20);
  x.restore();
}

function ndDraw(t){
  var x=ND.x;
  var dt=Math.min(0.05,ND.dt||0.016);
  var rm=window.__openRoom?window.__openRoom.state:null;
  if(window.__openRoom) window.__openRoom.step(dt,performance.now());
  var camX=rm?Math.round(rm.camX):210;
  var camY=rm?Math.round(rm.camY):160;

  x.save();
  x.translate(-camX,-camY);
  x.drawImage(ND.bg,0,0);
  x.drawImage(ND.pews,0,0);
  drawPigAt(x,rm,t);
  drawCathedralLiveEffects(x,t);
  x.restore();

  if(window.__openRoom) window.__openRoom.drawOverlays(x,performance.now());
}

function ndFrame(now){
  if(!ND.run)return;
  var dt=Math.min(0.05,(now-ND.last)/1000);ND.last=now;ND.dt=dt;ND.t+=dt;
  ndDraw(ND.t);requestAnimationFrame(ndFrame);
}

function applyResponsiveViewport(){
  var w=Math.max(240,window.innerWidth||360);
  var h=Math.max(320,window.innerHeight||640);
  var sc=Math.max(2,Math.round(w/192));
  VW=Math.min(260,Math.max(168,Math.ceil(w/sc)));
  VH=Math.min(356,Math.max(200,Math.ceil(h/sc)));
  var cv=document.getElementById('ndCv');
  if(cv){cv.width=VW;cv.height=VH;}
  ND.w=VW;ND.h=VH;
  if(ND.x) ND.x.imageSmoothingEnabled=false;
  if(window.__openRoom&&window.__openRoom.resize) window.__openRoom.resize(VW,VH);
}

window.__ndSetActive=function(v){
  if(v&&!ND.run){ND.run=true;ND.last=performance.now();requestAnimationFrame(ndFrame);}
  else if(!v){ND.run=false;}
};
window.addEventListener('resize',applyResponsiveViewport);

function ndStart(){
  var cv=document.getElementById('ndCv');
  ND.c=cv;ND.x=cv.getContext('2d');ND.x.imageSmoothingEnabled=false;
  applyResponsiveViewport();
  buildCathedral();
  ND.run=true;ND.last=performance.now();
  requestAnimationFrame(ndFrame);
}

${openRoomScript}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',ndStart);
else ndStart();

})();
</script>
</body>
</html>`,
    [openRoomScript, cathedralArtScript]
  );

  return (
    <View style={styles.wrap}>
      {Platform.OS === 'web' ? (
        <iframe
          ref={iframeRef}
          srcDoc={htmlContent}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' } as any}
          title="Nhà Thờ Đức Bà Sài Gòn Toàn Màn Hình"
        />
      ) : (
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          style={styles.webView}
          containerStyle={styles.webView}
          scrollEnabled={false}
          bounces={false}
          onMessage={handleMessage}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          onContentProcessDidTerminate={() => webViewRef.current?.reload?.()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#3A2D25',
  },
  webView: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#3A2D25',
  },
});
