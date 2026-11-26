import React, { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { buildOpenRoomEngineScript } from '../pixel/pixelOpenRoomEngine';
import { buildMarketPaletteScript } from './market/marketPalette';
import { buildMarketCrowdScript } from './market/marketCrowd';
import { buildMarketArchitectureScript } from './market/marketArchitecture';
import { buildMarketStallsScript } from './market/marketStalls';

interface BenThanhMarketBannerWebViewProps {
  active?: boolean;
  shoppingTotalText: string;
  foodTotalText: string;
  visitsCount: number;
  selectedZone?: number;
  onExitToMap?: () => void;
  onSelectZoneFromCanvas?: (zoneIdx: number) => void;
}

/**
 * Đại Thế Giới Lòng Chợ Bến Thành 32-Bit Indie Pixel Art (1200×480, Dynamic 1:1 Square Pixel — Quyết định 213)
 * - 2 Cổng Vòm Tròn Nằm Dọc 2 Đầu (Cửa Nam bên trái x: 0..72 & Cửa Bắc bên phải x: 1128..1200) giấu hoàn toàn không gian bên ngoài.
 * - Dãy Bắc kín ngang 7 shop sát vách nhau: Áo Dài Sài Gòn (từ Cửa 1 cũ) -> Hương Trinh -> Liên Sài Gòn -> Vòm Khu Ăn Uống -> Bánh Cuốn/Bèo -> Phở Bò -> Thời Trang Sài Gòn (từ Cửa Bắc cũ).
 * - Tầng Trung Tâm (6 đảo) & Tầng Nam (6 sạp) xếp sát sát kề kề nhau (khe hẻm 20px) + Va chạm AABB chuẩn xác.
 */
export const BenThanhMarketBannerWebView: React.FC<BenThanhMarketBannerWebViewProps> = ({
  active = true,
  shoppingTotalText,
  foodTotalText,
  visitsCount,
  selectedZone,
  onExitToMap,
  onSelectZoneFromCanvas,
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
    if (typeof selectedZone !== 'number') return;
    const js = `window.__mkGo && window.__mkGo(${selectedZone}); true;`;
    if (Platform.OS === 'web') {
      try {
        iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ type: 'GO_ZONE', zone: selectedZone }), '*');
      } catch (_e) {}
      return;
    }
    webViewRef.current?.injectJavaScript?.(js);
  }, [selectedZone]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    webViewRef.current?.injectJavaScript?.(
      `window.__mkSetActive && window.__mkSetActive(${active ? 'true' : 'false'}); true;`
    );
  }, [active]);

  const handleRoomPayload = (d: any) => {
    if (!d) return;
    if (d.type === 'HAPTIC_LIGHT') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else if (d.type === 'ROOM_ACTION') {
      if ((d.id === 'exit_market' || d.id === 'exit_back_gate') && d.userTriggered && onExitToMap) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
        exitTimerRef.current = setTimeout(() => {
          onExitToMap();
        }, 120);
      } else if (d.id === 'stall_liensaigon' && onSelectZoneFromCanvas) {
        onSelectZoneFromCanvas(1);
      } else if (d.id === 'arch_foodcourt' && onSelectZoneFromCanvas) {
        onSelectZoneFromCanvas(2);
      } else if (d.id === 'stall_banhcuon_banhbeo' && onSelectZoneFromCanvas) {
        onSelectZoneFromCanvas(3);
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
  }, [onExitToMap, onSelectZoneFromCanvas]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      handleRoomPayload(data);
    } catch (_e) {}
  };

  const openRoomScript = useMemo(
    () =>
      buildOpenRoomEngineScript({
        canvasId: 'mkCv',
        worldWidth: 1200,
        worldHeight: 480,
        viewWidth: 220,
        viewHeight: 320,
        walkBounds: { minX: 16, maxX: 1184, minY: 168, maxY: 468 },
        initialX: 112,
        initialY: 196,
        initialCamX: 0,
        initialCamY: 20,
        speed: 58,
        obstacles: [
          // 2 đầu cổng vòm dọc (phần khung tường đặc)
          { x: 0, y: 120, w: 62, h: 46 },
          { x: 1138, y: 120, w: 62, h: 46 },
          // Tầng Bắc (7 shop sát vách nhau từ x=76..1126)
          { x: 76, y: 120, w: 144, h: 46 },
          { x: 224, y: 120, w: 144, h: 46 },
          { x: 372, y: 120, w: 152, h: 46 },
          { x: 528, y: 120, w: 152, h: 46 },
          { x: 684, y: 120, w: 144, h: 46 },
          { x: 832, y: 120, w: 144, h: 46 },
          { x: 980, y: 120, w: 146, h: 46 },
          // Tầng Trung Tâm (6 đảo sát kề nhau, khe hẻm 20px)
          { x: 88, y: 234, w: 148, h: 56 },
          { x: 256, y: 234, w: 148, h: 56 },
          { x: 424, y: 234, w: 148, h: 56 },
          { x: 592, y: 238, w: 160, h: 52 },
          { x: 772, y: 234, w: 152, h: 56 },
          { x: 944, y: 234, w: 166, h: 56 },
          // Tầng Nam (6 sạp sát kề nhau, khe hẻm 20px)
          { x: 88, y: 378, w: 148, h: 56 },
          { x: 256, y: 378, w: 148, h: 56 },
          { x: 424, y: 386, w: 160, h: 48 },
          { x: 604, y: 378, w: 148, h: 56 },
          { x: 772, y: 378, w: 152, h: 56 },
          { x: 944, y: 382, w: 166, h: 52 },
        ],
        hotspots: [
          {
            id: 'exit_market',
            x: 0,
            y: 156,
            w: 72,
            h: 312,
            standX: 78,
            standY: 316,
            standFace: -1,
            actionType: 'jump_joy',
            fastDash: true,
            bubbleText: `Bước qua Cổng Vòm Nam ra phố...`,
          },
          {
            id: 'exit_back_gate',
            x: 1128,
            y: 156,
            w: 72,
            h: 312,
            standX: 1122,
            standY: 316,
            standFace: 1,
            actionType: 'jump_joy',
            fastDash: true,
            bubbleText: `Bước qua Cổng Vòm Bắc ra phố...`,
          },
          {
            id: 'stall_aodai',
            x: 76,
            y: 56,
            w: 144,
            h: 110,
            standX: 148,
            standY: 184,
            standFace: 1,
            actionType: 'look_window',
            bubbleText: `Áo Dài Sài Gòn & Đồng Hồ · Mua sắm ${shoppingTotalText}`,
          },
          {
            id: 'stall_clothing',
            x: 224,
            y: 56,
            w: 144,
            h: 110,
            standX: 296,
            standY: 184,
            standFace: 1,
            actionType: 'check_ledger',
            bubbleText: `Sạp Vải & Giày Dép Hương Trinh · Mua sắm ${shoppingTotalText}`,
          },
          {
            id: 'stall_liensaigon',
            x: 372,
            y: 56,
            w: 152,
            h: 110,
            standX: 448,
            standY: 184,
            standFace: 1,
            actionType: 'check_ledger',
            bubbleText: `Sạp Liên Sài Gòn & Ngọc Hoa 823 · Trà Cà Phê Đặc Sản`,
          },
          {
            id: 'arch_foodcourt',
            x: 528,
            y: 44,
            w: 152,
            h: 122,
            standX: 604,
            standY: 184,
            standFace: 1,
            actionType: 'look_window',
            bubbleText: `Khu Ăn Uống Sạp 1044 · ${visitsCount} quán quen`,
          },
          {
            id: 'stall_banhcuon_banhbeo',
            x: 684,
            y: 56,
            w: 144,
            h: 110,
            standX: 756,
            standY: 184,
            standFace: 1,
            actionType: 'eat_snack',
            bubbleText: `Bánh Cuốn 50K & Bánh Bèo 20K · Ăn uống ${foodTotalText}`,
          },
          {
            id: 'stall_pho',
            x: 832,
            y: 56,
            w: 144,
            h: 110,
            standX: 904,
            standY: 184,
            standFace: 1,
            actionType: 'eat_snack',
            bubbleText: `Phở Bò & Bún Bò Huế Nóng Hổi · Ăn uống ${foodTotalText}`,
          },
          {
            id: 'stall_thoitrang',
            x: 980,
            y: 56,
            w: 146,
            h: 110,
            standX: 1052,
            standY: 184,
            standFace: -1,
            actionType: 'check_ledger',
            bubbleText: `Shop Thời Trang Sài Gòn · Quần Áo & Túi Xách`,
          },
          {
            id: 'island_fruit',
            x: 88,
            y: 230,
            w: 148,
            h: 62,
            standX: 162,
            standY: 310,
            standFace: 1,
            actionType: 'eat_snack',
            bubbleText: `Trái Cây 1029 Ngọc Hảo · Xoài Cát, Thanh Long & Dừa Tươi!`,
          },
          {
            id: 'island_seafood',
            x: 256,
            y: 230,
            w: 148,
            h: 62,
            standX: 330,
            standY: 310,
            standFace: 1,
            actionType: 'look_window',
            bubbleText: `Hải Sản Tươi Đá Bào · Tôm Cua Mực Tươi Rói!`,
          },
          {
            id: 'island_veg',
            x: 424,
            y: 230,
            w: 148,
            h: 62,
            standX: 498,
            standY: 310,
            standFace: 1,
            actionType: 'look_window',
            bubbleText: `Rau Củ Tươi & Thịt Sạch Chợ Bến Thành!`,
          },
          {
            id: 'island_dining',
            x: 592,
            y: 234,
            w: 160,
            h: 58,
            standX: 672,
            standY: 310,
            standFace: 1,
            actionType: 'sip_coffee',
            bubbleText: `Bàn Ăn Khu Ẩm Thực 1 · Bún bò, Bánh xèo & Trà đá!`,
          },
          {
            id: 'island_houseware',
            x: 772,
            y: 230,
            w: 152,
            h: 62,
            standX: 848,
            standY: 310,
            standFace: 1,
            actionType: 'check_ledger',
            bubbleText: `Đồ Gia Dụng & Bếp Núc Inox!`,
          },
          {
            id: 'island_souvenir',
            x: 944,
            y: 230,
            w: 166,
            h: 62,
            standX: 1026,
            standY: 310,
            standFace: -1,
            actionType: 'check_ledger',
            bubbleText: `Lưu Niệm Sài Gòn · Nón Lá, Túi Cói & Gốm Bát Tràng!`,
          },
          {
            id: 'south_drinks',
            x: 88,
            y: 374,
            w: 148,
            h: 62,
            standX: 162,
            standY: 454,
            standFace: 1,
            actionType: 'sip_coffee',
            bubbleText: `Xe Nước Mía & Dừa Xiêm Ướp Lạnh!`,
          },
          {
            id: 'south_snacks',
            x: 256,
            y: 374,
            w: 148,
            h: 62,
            standX: 330,
            standY: 454,
            standFace: 1,
            actionType: 'eat_snack',
            bubbleText: `Chè Ba Màu & Bánh Dân Gian Ngon Hết Sẩy!`,
          },
          {
            id: 'south_dining',
            x: 424,
            y: 382,
            w: 160,
            h: 54,
            standX: 504,
            standY: 454,
            standFace: 1,
            actionType: 'sip_coffee',
            bubbleText: `Dãy Bàn Ghế Nhựa Vỉa Hè Đông Vui Du Khách!`,
          },
          {
            id: 'south_dried',
            x: 604,
            y: 374,
            w: 148,
            h: 62,
            standX: 678,
            standY: 454,
            standFace: 1,
            actionType: 'check_ledger',
            bubbleText: `Đồ Khô, Tôm Khô & Mắm Nêm Đặc Sản!`,
          },
          {
            id: 'south_coffee',
            x: 772,
            y: 374,
            w: 152,
            h: 62,
            standX: 848,
            standY: 454,
            standFace: 1,
            actionType: 'sip_coffee',
            bubbleText: `Cà Phê Sữa Đá & Sinh Tố Bơ Xoài!`,
          },
          {
            id: 'south_flowers',
            x: 944,
            y: 378,
            w: 166,
            h: 58,
            standX: 1026,
            standY: 454,
            standFace: -1,
            actionType: 'look_window',
            bubbleText: `Hoa Tươi & Gốm Sơn Mài Chợ Bến Thành!`,
          },
        ],
      }),
    [shoppingTotalText, foodTotalText, visitsCount]
  );

  const paletteScript = useMemo(() => buildMarketPaletteScript(), []);
  const crowdScript = useMemo(() => buildMarketCrowdScript(), []);
  const archScript = useMemo(() => buildMarketArchitectureScript(), []);
  const stallsScript = useMemo(() => buildMarketStallsScript(), []);

  const htmlContent = useMemo(
    () => `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;user-select:none}
html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#3A2D25;display:flex;align-items:center;justify-content:center}
#mkCv{
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
<canvas id="mkCv" width="220" height="320" role="img" aria-label="Đại thế giới Chợ Bến Thành 32-bit với 2 cổng Trước/Sau, 3 tầng sạp đặc quánh, hoa quả hải sản ẩm thực, đồ lưu niệm và dòng người du khách tấp nập"></canvas>
<script>
(function(){
'use strict';

var WORLD_W=1200;
var WORLD_H=480;
var VW=220;
var VH=320;

${paletteScript}
${crowdScript}
${archScript}
${stallsScript}

var MK={bg:null,central:null,south:null,t:0,last:0,dt:0,run:false,w:VW,h:VH};

function buildMarketInterior(){
  var bg=document.createElement('canvas');bg.width=WORLD_W;bg.height=WORLD_H;
  var x=bg.getContext('2d');x.imageSmoothingEnabled=false;

  drawFloorAndCeiling(x,WORLD_W,WORLD_H);
  drawSideArchGate(x,'left',WORLD_W,WORLD_H);
  drawSideArchGate(x,'right',WORLD_W,WORLD_H);
  drawNorthStalls(x);
  MK.bg=bg;

  var cen=document.createElement('canvas');cen.width=WORLD_W;cen.height=WORLD_H;
  var cx=cen.getContext('2d');cx.imageSmoothingEnabled=false;
  drawCentralIslands(cx);
  MK.central=cen;

  var sth=document.createElement('canvas');sth.width=WORLD_W;sth.height=WORLD_H;
  var sx=sth.getContext('2d');sx.imageSmoothingEnabled=false;
  drawSouthStalls(sx);
  MK.south=sth;
}

function drawLiveMarketEffects(x,t){
  try{
    x.save();
    // Nắng xiên từ ô giếng trời mái chợ
    x.globalAlpha=0.09;
    for(var sk=36;sk<WORLD_W;sk+=120){
      for(var dy=0;dy<110;dy+=3){R(x,sk+Math.round(dy*0.28),28+dy,42,3,'#FFF6D6');}
    }
    // Ánh sáng ấm đèn mây tre & 2 vòm cổng hai đầu
    x.globalAlpha=0.18+Math.sin(t*3)*0.04;
    [148,296,448,604,756,904,1052].forEach(function(lx){E(x,lx,54,14,10,'#FFE08A');});
    E(x,36,216,14,12,'#FFE08A');
    E(x,1164,216,14,12,'#FFE08A');
    x.restore();

    // Quạt lồng sắt công nghiệp quay mượt 60fps
    [354,604,798,966].forEach(function(fx){
      E(x,fx,72,6,6,INK);E(x,fx,72,5,5,'#334155');
      var sp=Math.max(1,Math.round(Math.abs(Math.sin(t*10+fx))*5));
      R(x,fx-sp,71,sp*2,2,'#CBD5E1');
    });

    // Khói bếp bay từ Nồi nước lèo Khu Ẩm Thực, Bánh Cuốn, Phở Bò & Bàn Ăn
    [[592,98],[706,92],[928,92],[955,94],[644,248],[696,248]].forEach(function(pt){
      for(var i=0;i<3;i++){
        var p=((t*0.95+i*0.33)%1);
        var sy=pt[1]-Math.round(p*15), stx=pt[0]+Math.round(Math.sin(t*4+i*2)*1.8);
        x.save();x.globalAlpha=0.72*(1-p);R(x,stx,sy,2,2,'#FFFBF1');x.restore();
      }
    });
  }catch(_e){}
}

function mkDraw(t){
  var x=MK.x;
  var dt=Math.min(0.05,MK.dt||0.016);
  var rm=window.__openRoom?window.__openRoom.state:null;
  if(window.__openRoom) window.__openRoom.step(dt,performance.now());
  var camX=rm?Math.round(rm.camX):0;
  var camY=rm?Math.round(rm.camY):0;

  x.save();
  x.translate(-camX,-camY);
  x.drawImage(MK.bg,0,0);
  drawLiveMarketEffects(x,t);

  // Y-Sorting 3 tầng: Khách & Heo Con <-> Tầng Trung Tâm (y=290) <-> Tầng Nam (y=434)
  var pigY=rm?rm.y:192;
  var CENTRAL_Y=290;
  var SOUTH_Y=434;

  var pigDrawn=false;
  var cenDrawn=false;
  var sthDrawn=false;

  var events=[
    {y:CENTRAL_Y,kind:'central'},
    {y:SOUTH_Y,kind:'south'},
    {y:pigY,kind:'pig'}
  ].sort(function(a,b){return a.y-b.y;});

  var prevY=0;
  events.forEach(function(ev){
    drawWalkingShoppers(x,t,prevY,ev.y);
    prevY=ev.y;
    if(ev.kind==='central'&&!cenDrawn){x.drawImage(MK.central,0,0);cenDrawn=true;}
    else if(ev.kind==='south'&&!sthDrawn){x.drawImage(MK.south,0,0);sthDrawn=true;}
    else if(ev.kind==='pig'&&!pigDrawn){drawPigAt(x,rm,t);pigDrawn=true;}
  });
  drawWalkingShoppers(x,t,prevY,999);
  x.restore();

  if(window.__openRoom) window.__openRoom.drawOverlays(x,performance.now());
}

function mkFrame(now){
  if(!MK.run)return;
  var dt=Math.min(0.05,(now-MK.last)/1000);MK.last=now;MK.dt=dt;MK.t+=dt;
  mkDraw(MK.t);requestAnimationFrame(mkFrame);
}

function applyResponsiveViewport(){
  var w=Math.max(240,window.innerWidth||360);
  var h=Math.max(320,window.innerHeight||640);
  var sc=Math.max(2,Math.round(w/192));
  VW=Math.min(260,Math.max(168,Math.ceil(w/sc)));
  VH=Math.min(356,Math.max(200,Math.ceil(h/sc)));
  var cv=document.getElementById('mkCv');
  if(cv){cv.width=VW;cv.height=VH;}
  MK.w=VW;MK.h=VH;
  if(MK.x) MK.x.imageSmoothingEnabled=false;
  if(window.__openRoom&&window.__openRoom.resize) window.__openRoom.resize(VW,VH);
}

window.__mkGo=function(zoneIdx){
  var targets=[{x:98,y:192},{x:266,y:192},{x:448,y:192},{x:654,y:192},{x:896,y:192},{x:1112,y:192}];
  var tg=targets[zoneIdx]||targets[0];
  if(window.__openRoom) window.__openRoom.walkTo(tg.x,tg.y,null);
};
window.__mkSetActive=function(v){
  if(v&&!MK.run){MK.run=true;MK.last=performance.now();requestAnimationFrame(mkFrame);}
  else if(!v){MK.run=false;}
};
window.addEventListener('message',function(ev){
  try{
    var d=typeof ev.data==='string'?JSON.parse(ev.data):ev.data;
    if(d&&d.type==='GO_ZONE'&&typeof d.zone==='number') window.__mkGo(d.zone);
  }catch(_e){}
});
window.addEventListener('resize',applyResponsiveViewport);

function mkStart(){
  var cv=document.getElementById('mkCv');
  MK.c=cv;MK.x=cv.getContext('2d');MK.x.imageSmoothingEnabled=false;
  applyResponsiveViewport();
  buildMarketInterior();
  MK.run=true;MK.last=performance.now();
  requestAnimationFrame(mkFrame);
}

${openRoomScript}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mkStart);
else mkStart();

})();
</script>
</body>
</html>`,
    [openRoomScript, paletteScript, crowdScript, archScript, stallsScript]
  );

  return (
    <View style={styles.wrap}>
      {Platform.OS === 'web' ? (
        <iframe
          ref={iframeRef}
          srcDoc={htmlContent}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' } as any}
          title="Chợ Bến Thành Toàn Màn Hình"
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
