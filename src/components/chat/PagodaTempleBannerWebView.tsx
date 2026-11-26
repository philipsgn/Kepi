import React, { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { buildOpenRoomEngineScript } from '../pixel/pixelOpenRoomEngine';
import { buildPagodaInteriorArtScript } from './pagoda/pagodaInteriorArt';

interface PagodaTempleBannerWebViewProps {
  active?: boolean;
  onExitToHub?: () => void;
}

/**
 * Không Gian Toàn Màn Hình Ngôi Chùa Việt Nam Cổ Kính 2 Tầng (640×560, Dynamic 1:1 — Quyết định 220)
 * - Nửa trên: Chánh Điện Tượng Phật Thích Ca thếp vàng, hào quang, trần ô hoa sen mạ vàng, Trống Bát Nhã, Đại Hồng Chung & Phật tử cúi lạy.
 * - Nửa dưới: Sân Chùa cổ kính, bậc tam cấp, Lư Hương Đồng Khổng Lồ nghi ngút khói trầm, Bảo Tháp mái cong đỏ rực & Cổng Tam Quan ra phố.
 */
export const PagodaTempleBannerWebView: React.FC<PagodaTempleBannerWebViewProps> = ({
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
      `window.__pgSetActive && window.__pgSetActive(${active ? 'true' : 'false'}); true;`
    );
  }, [active]);

  const handleRoomPayload = (d: any) => {
    if (!d) return;
    if (d.type === 'HAPTIC_LIGHT') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else if (d.type === 'ROOM_ACTION') {
      if (d.id === 'exit_pagoda' && d.userTriggered && onExitToHub) {
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
        canvasId: 'pgCv',
        worldWidth: 640,
        worldHeight: 560,
        viewWidth: 220,
        viewHeight: 320,
        walkBounds: { minX: 24, maxX: 616, minY: 208, maxY: 536 },
        initialX: 320,
        initialY: 368,
        initialCamX: 210,
        initialCamY: 180,
        speed: 46,
        obstacles: [
          // Lan can ngăn Chánh Điện & Sân Chùa (chừa bậc thang giữa x: 264..376)
          { x: 0, y: 310, w: 262, h: 18 },
          { x: 378, y: 310, w: 262, h: 18 },
          // Lư Hương Khổng Lồ giữa sân
          { x: 296, y: 394, w: 48, h: 42 },
          // Bảo Tháp bên trái & Lầu Trống bên phải
          { x: 44, y: 452, w: 106, h: 40 },
          { x: 488, y: 444, w: 104, h: 44 },
        ],
        hotspots: [
          {
            id: 'buddha_altar',
            x: 204,
            y: 48,
            w: 232,
            h: 158,
            standX: 320,
            standY: 224,
            standFace: 1,
            actionType: 'eat_snack',
            bubbleText: `Nam Mô A Di Đà Phật · Chúc bạn tâm an, giữ ví vững vàng!`,
          },
          {
            id: 'prajna_drum',
            x: 28,
            y: 144,
            w: 56,
            h: 64,
            standX: 64,
            standY: 226,
            standFace: -1,
            actionType: 'look_window',
            bubbleText: `Trống Bát Nhã ngân vang thanh tịnh khắp chánh điện`,
          },
          {
            id: 'great_bell',
            x: 556,
            y: 138,
            w: 56,
            h: 68,
            standX: 578,
            standY: 226,
            standFace: 1,
            actionType: 'look_window',
            bubbleText: `Thỉnh Đại Hồng Chung vang vọng · Tâm hồn nhẹ nhõm an yên...`,
          },
          {
            id: 'courtyard_incense',
            x: 294,
            y: 386,
            w: 52,
            h: 50,
            standX: 320,
            standY: 448,
            standFace: 1,
            actionType: 'eat_snack',
            bubbleText: `Thắp nén hương trầm cầu bình an & sức khỏe cho gia đình!`,
          },
          {
            id: 'stupa_tower',
            x: 42,
            y: 332,
            w: 112,
            h: 158,
            standX: 168,
            standY: 456,
            standFace: -1,
            actionType: 'look_window',
            bubbleText: `Bảo Tháp cổ kính mái đao cong đỏ rực giữa sân chùa thanh tịnh`,
          },
          {
            id: 'exit_pagoda',
            x: 266,
            y: 504,
            w: 108,
            h: 56,
            standX: 320,
            standY: 514,
            standFace: 1,
            actionType: 'jump_joy',
            fastDash: true,
            bubbleText: `Bước qua Cổng Tam Quan ra lại phố Sài Gòn...`,
          },
        ],
      }),
    []
  );

  const pagodaArtScript = useMemo(() => buildPagodaInteriorArtScript(), []);

  const htmlContent = useMemo(
    () => `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;user-select:none}
html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#3A2D25;display:flex;align-items:center;justify-content:center}
#pgCv{
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
<canvas id="pgCv" width="220" height="320" role="img" aria-label="Ngôi chùa Việt Nam cổ kính 2 tầng gồm Chánh Điện tượng Phật thếp vàng, khói trầm hương, Phật tử cúi lạy và Sân Chùa Bảo Tháp"></canvas>
<script>
(function(){
'use strict';

var INK='#2B2118';
var WORLD_W=640;
var WORLD_H=560;
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

${pagodaArtScript}

var PG={bg:null,t:0,last:0,dt:0,run:false,w:VW,h:VH};

function buildPagoda(){
  var bg=document.createElement('canvas');bg.width=WORLD_W;bg.height=WORLD_H;
  var x=bg.getContext('2d');x.imageSmoothingEnabled=false;
  drawPagodaBg(x,WORLD_W,WORLD_H);
  PG.bg=bg;
}

function drawPigAt(x,rm,t){
  if(!rm)return;
  var bow=(rm.action==='eat_snack');
  var px=Math.round(rm.x-12), jumpY=(rm.action==='jump_joy'?-Math.abs(Math.sin(t*10))*4:0), py=Math.round(rm.y-20+jumpY);
  E(x,Math.round(rm.x),Math.round(rm.y)-1,11,3,'rgba(43,33,24,0.24)');
  hpx.clearRect(0,0,24,20);
  drawPigSprite(hpx,{pose:rm.walking?'walk':(bow?'eat':'stand'),frame:rm.walking?(((t*6)|0)%2):0,happy:Boolean(rm.action)&&!bow,blink:(t%4)<0.15,tail:Math.floor(t*3)%2===1});
  x.save();
  if(rm.facing<0){x.translate(px+24,py);x.scale(-1,1);x.drawImage(hp,0,0,24,20,0,0,24,20);}
  else x.drawImage(hp,0,0,24,20,px,py,24,20);
  x.restore();
}

function pgDraw(t){
  var x=PG.x;
  var dt=Math.min(0.05,PG.dt||0.016);
  var rm=window.__openRoom?window.__openRoom.state:null;
  if(window.__openRoom) window.__openRoom.step(dt,performance.now());
  var camX=rm?Math.round(rm.camX):210;
  var camY=rm?Math.round(rm.camY):180;

  x.save();
  x.translate(-camX,-camY);
  x.drawImage(PG.bg,0,0);
  drawPagodaLiveEffects(x,t);
  drawPigAt(x,rm,t);
  x.restore();

  if(window.__openRoom) window.__openRoom.drawOverlays(x,performance.now());
}

function pgFrame(now){
  if(!PG.run)return;
  var dt=Math.min(0.05,(now-PG.last)/1000);PG.last=now;PG.dt=dt;PG.t+=dt;
  pgDraw(PG.t);requestAnimationFrame(pgFrame);
}

function applyResponsiveViewport(){
  var w=Math.max(240,window.innerWidth||360);
  var h=Math.max(320,window.innerHeight||640);
  var sc=Math.max(2,Math.round(w/192));
  VW=Math.min(260,Math.max(168,Math.ceil(w/sc)));
  VH=Math.min(356,Math.max(200,Math.ceil(h/sc)));
  var cv=document.getElementById('pgCv');
  if(cv){cv.width=VW;cv.height=VH;}
  PG.w=VW;PG.h=VH;
  if(PG.x) PG.x.imageSmoothingEnabled=false;
  if(window.__openRoom&&window.__openRoom.resize) window.__openRoom.resize(VW,VH);
}

window.__pgSetActive=function(v){
  if(v&&!PG.run){PG.run=true;PG.last=performance.now();requestAnimationFrame(pgFrame);}
  else if(!v){PG.run=false;}
};
window.addEventListener('resize',applyResponsiveViewport);

function pgStart(){
  var cv=document.getElementById('pgCv');
  PG.c=cv;PG.x=cv.getContext('2d');PG.x.imageSmoothingEnabled=false;
  applyResponsiveViewport();
  buildPagoda();
  PG.run=true;PG.last=performance.now();
  requestAnimationFrame(pgFrame);
}

${openRoomScript}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',pgStart);
else pgStart();

})();
</script>
</body>
</html>`,
    [openRoomScript, pagodaArtScript]
  );

  return (
    <View style={styles.wrap}>
      {Platform.OS === 'web' ? (
        <iframe
          ref={iframeRef}
          srcDoc={htmlContent}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' } as any}
          title="Ngôi Chùa Việt Nam Cổ Kính Toàn Màn Hình"
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
