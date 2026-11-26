import React, { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { buildOpenRoomEngineScript } from '../pixel/pixelOpenRoomEngine';

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
 * Đại Thế Giới Lòng Chợ Bến Thành Toàn Màn Hình RPG (1024×360, Dynamic 1:1 Square Pixel — Quyết định 211)
 * - Tràn toàn màn hình 100% không khung viền, không card/chip bên dưới.
 * - 2 Cổng Ra Ngoài (fastDash <= 300ms): Cổng Trước (Cửa Số 1 bên trái) & Cổng Sau (Cửa Bắc bên phải).
 * - 6 Phân Khu Trên (Cửa Số 1 + Áo Dài -> Quần Áo Hương Trinh -> Đặc Sản Liên Sài Gòn & Ngọc Hoa -> Vòm Khu Ăn Uống Sạp 1044 -> Bánh Cuốn 50K & Bánh Bèo 20K -> Cửa Bắc).
 * - 5 Đảo Giữa Chợ Y-Sorted (Lưu Niệm Nón Lá, Trái Cây 1029 Ngọc Hảo, 2 Đảo Bàn Ăn, Đảo Hoa Tươi & Gốm Sơn Mài) + Dãy Bàn Ghế Vỉa Hè Dưới.
 * - Hơn 20 nhân vật tấp nập gồm cả Khách Du Lịch Nước Ngoài (tóc vàng, balo du lịch, kính râm, máy ảnh) & Người Việt.
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
        worldWidth: 1024,
        worldHeight: 360,
        viewWidth: 208,
        viewHeight: 280,
        walkBounds: { minX: 20, maxX: 1004, minY: 148, maxY: 344 },
        initialX: 94,
        initialY: 176,
        initialCamX: 0,
        initialCamY: 0,
        speed: 56,
        hotspots: [
          {
            id: 'exit_market',
            x: 24,
            y: 36,
            w: 124,
            h: 110,
            standX: 88,
            standY: 154,
            standFace: -1,
            actionType: 'jump_joy',
            fastDash: true,
            bubbleText: `Bước ra Cửa Số 1...`,
          },
          {
            id: 'stall_clothing',
            x: 170,
            y: 44,
            w: 160,
            h: 100,
            standX: 248,
            standY: 168,
            standFace: 1,
            actionType: 'check_ledger',
            bubbleText: `Sạp Quần Áo & Vải Hương Trinh · Mua sắm ${shoppingTotalText}`,
          },
          {
            id: 'stall_liensaigon',
            x: 340,
            y: 44,
            w: 168,
            h: 100,
            standX: 422,
            standY: 168,
            standFace: 1,
            actionType: 'check_ledger',
            bubbleText: `Sạp Liên Sài Gòn & Ngọc Hoa · Trà Cà Phê Đặc Sản`,
          },
          {
            id: 'arch_foodcourt',
            x: 516,
            y: 34,
            w: 172,
            h: 112,
            standX: 602,
            standY: 168,
            standFace: 1,
            actionType: 'look_window',
            bubbleText: `Khu Ăn Uống Sạp 1044 · ${visitsCount} quán quen`,
          },
          {
            id: 'stall_banhcuon_banhbeo',
            x: 694,
            y: 44,
            w: 166,
            h: 100,
            standX: 778,
            standY: 168,
            standFace: 1,
            actionType: 'eat_snack',
            bubbleText: `Bánh Cuốn 50k & Bánh Bèo 20k · Ăn uống ${foodTotalText}`,
          },
          {
            id: 'exit_back_gate',
            x: 874,
            y: 36,
            w: 130,
            h: 110,
            standX: 942,
            standY: 154,
            standFace: 1,
            actionType: 'jump_joy',
            fastDash: true,
            bubbleText: `Bước ra Cửa Bắc Lê Thánh Tôn...`,
          },
          {
            id: 'island_fruit',
            x: 204,
            y: 200,
            w: 160,
            h: 58,
            standX: 284,
            standY: 194,
            standFace: 1,
            actionType: 'eat_snack',
            bubbleText: `Sạp Trái Cây 1029 Ngọc Hảo · Xoài, Bưởi, Sầu Riêng!`,
          },
          {
            id: 'island_dining',
            x: 400,
            y: 200,
            w: 168,
            h: 58,
            standX: 484,
            standY: 194,
            standFace: 1,
            actionType: 'sip_coffee',
            bubbleText: `Bàn Ăn Khu Ẩm Thực · Bún bò, Bánh xèo & Chè ba màu!`,
          },
        ],
      }),
    [shoppingTotalText, foodTotalText, visitsCount]
  );

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
<canvas id="mkCv" width="208" height="280" role="img" aria-label="Đại thế giới Chợ Bến Thành toàn màn hình với 2 cổng Trước/Sau, 6 khu sạp, 5 đảo giữa chợ và hơn 20 khách du lịch"></canvas>
<script>
(function(){
'use strict';

var INK='#2B2118';
var WORLD_W=1024;
var WORLD_H=360;
var VW=208;
var VH=280;

function R(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function E(c,cx,cy,rx,ry,col){
  c.fillStyle=col;
  for(var dy=-ry;dy<=ry;dy++)for(var dx=-rx;dx<=rx;dx++)if((dx*dx)/(rx*rx)+(dy*dy)/(ry*ry)<=1)c.fillRect(Math.round(cx+dx),Math.round(cy+dy),1,1);
}

// Micro-font 3x5 sắc nét cho biển hiệu thật Chợ Bến Thành
var MF={
  'A':[2,5,7,5,5],'B':[6,5,6,5,6],'C':[3,4,4,4,3],'D':[6,5,5,5,6],'E':[7,4,6,4,7],'F':[7,4,6,4,4],
  'G':[3,4,5,5,3],'H':[5,5,7,5,5],'I':[7,2,2,2,7],'K':[5,5,6,5,5],'L':[4,4,4,4,7],'M':[5,7,7,5,5],
  'N':[5,7,7,7,5],'O':[2,5,5,5,2],'P':[6,5,6,4,4],'Q':[2,5,5,3,1],'R':[6,5,6,5,5],'S':[3,4,2,1,6],
  'T':[7,2,2,2,2],'U':[5,5,5,5,7],'V':[5,5,5,2,2],'W':[5,5,7,7,5],'X':[5,2,2,2,5],'Y':[5,5,2,2,2],
  '0':[2,5,5,5,2],'1':[2,6,2,2,7],'2':[6,1,2,4,7],'3':[6,1,2,1,6],'4':[5,5,7,1,1],'5':[7,4,6,1,6],
  '8':[2,5,2,5,2],'9':[3,5,3,1,6],' ':[0,0,0,0,0],'-':[0,0,7,0,0]
};
function pxText(c,str,x0,y0,col,sc){
  sc=sc||1;c.fillStyle=col;var cx=Math.round(x0);
  for(var i=0;i<str.length;i++){
    var g=MF[str.charAt(i).toUpperCase()]||MF[' '];
    for(var r=0;r<5;r++){var row=g[r];for(var b=0;b<3;b++){if((row>>(2-b))&1)c.fillRect(cx+b*sc,Math.round(y0)+r*sc,sc,sc);}}
    cx+=4*sc;
  }
}

// =========================================================================
// SPRITE HEO CON 24x20 CHUẨN TAB VƯỜN (1:1 SQUARE PIXEL)
// =========================================================================
var PAL={o:'#4B2B21',p:'#F9B8C4',s:'#EE90A6',n:'#F08DA4',h:'#FFE3E8',k:'#2B2118',g:'#F4B93B',G:'#B97A14',w:'#FFFFFF'};
function shape(c,rows,fill,ox,oy){
  c.fillStyle=PAL.o;
  for(var d=0;d<4;d++){var ax=[[-1,0],[1,0],[0,-1],[0,1]][d][0],ay=[[-1,0],[1,0],[0,-1],[0,1]][d][1];
    for(var i=0;i<rows.length;i++)c.fillRect(ox+rows[i][1]+ax,oy+rows[i][0]+ay,rows[i][2]-rows[i][1]+1,1);}
  c.fillStyle=fill;
  for(var i=0;i<rows.length;i++)c.fillRect(ox+rows[i][1],oy+rows[i][0],rows[i][2]-rows[i][1]+1,1);
}
function drawPigSprite(c,o){
  var ox=1,oy=3,sleep=o.pose==='sleep',eat=o.pose==='eat',walk=o.pose==='walk',sad=o.mood==='sad'&&!o.happy;
  var bob=(walk&&o.frame===1)?-1:0;
  var bodyDy=sleep?3:bob,headDy=sleep?5:eat?4:sad?1:bob,headDx=sleep?-1:eat?1:0;
  if(!sleep){
    var raised=function(i){return walk&&(o.frame===0?(i===1||i===2):(i===0||i===3));};
    var legs=[[3,PAL.p],[9,PAL.p],[6,PAL.s],[12,PAL.s]];
    [2,3,0,1].forEach(function(i){var x=legs[i][0];
      var rows=[[11,x,x+1],[12,x,x+1],[13,x,x+1]];if(!raised(i))rows.push([14,x,x+1]);
      shape(c,rows,legs[i][1],ox,oy);});
  }
  shape(c,[[4,0,1],[5,0,0],[6,0,1]],PAL.p,ox,oy+bodyDy+(o.tail?1:0));
  shape(c,[[4,4,12],[5,3,13],[6,2,14],[7,2,14],[8,2,14],[9,2,14],[10,2,14],[11,3,13]],PAL.p,ox,oy+bodyDy);
  R(c,ox+5,oy+bodyDy+5,3,1,PAL.h);
  var hx=ox+headDx,hy=oy+headDy,hp=function(x,y,col){R(c,hx+x,hy+y,1,1,col);};
  shape(c,[[2,10,12],[3,10,13],[4,10,13]],PAL.p,ox+headDx,oy+headDy);
  hp(11,3,PAL.s);hp(12,3,PAL.s);
  shape(c,[[3,16,18],[4,16,19],[5,16,19]],PAL.p,ox+headDx,oy+headDy);
  hp(17,4,PAL.s);hp(18,4,PAL.s);
  shape(c,[[4,10,17],[5,9,18],[6,9,19],[7,9,19],[8,9,19],[9,9,19],[10,10,18]],PAL.p,ox+headDx,oy+headDy);
  R(c,hx+11,hy+4,4,1,PAL.h);
  shape(c,[[7,18,20],[8,17,21],[9,18,20]],PAL.n,ox+headDx,oy+headDy);
  hp(19,8,PAL.k);hp(20,8,PAL.k);
  if(o.blink||sleep){hp(16,6,PAL.k);hp(17,6,PAL.k);}
  else if(o.happy){hp(16,5,PAL.k);hp(17,6,PAL.k);}
  else{hp(16,6,PAL.k);hp(17,6,PAL.k);hp(16,5,PAL.w);}
  hp(13,8,PAL.s);hp(14,8,PAL.s);
  if(o.happy){hp(16,9,PAL.k);hp(17,9,PAL.k);}
  R(c,ox+6,oy+bodyDy+4,4,1,PAL.g);R(c,ox+7,oy+bodyDy+3,2,1,PAL.G);
}
var hp=document.createElement('canvas');hp.width=24;hp.height=20;
var hpx=hp.getContext('2d');hpx.imageSmoothingEnabled=false;

// =========================================================================
// SPRITE NHÂN VẬT 16-BIT CHI TIẾT 14x22 (NGƯỜI VIỆT & DU KHÁCH NƯỚC NGOÀI)
// =========================================================================
function drawPerson16Bit(c,px,py,o){
  o=o||{};
  var sit=!!o.sit, shirt=o.shirt||'#FFFBF1', pants=o.pants||'#1E293B';
  var isForeign=!!o.tourist;
  var hair=o.hair||(isForeign?'#EAB308':'#2B2118');
  var skin=isForeign?'#FAD7B8':'#F5CCA0', skinSh=isForeign?'#E2B48E':'#DDA878';
  // Bóng tiếp xúc dưới chân
  R(c,px-2,py-1,12,2,'rgba(43,33,24,0.26)');
  var by=sit?py-13:py-14;
  // Balo du lịch to sau lưng cho khách nước ngoài
  if(o.backpack){
    R(c,px-4,by+1,4,7,INK);R(c,px-3,by+2,2,5,o.backpack);
  }
  // Chân & Giày
  if(sit){
    R(c,px,py-5,8,4,INK);R(c,px+1,py-4,6,3,pants);
    R(c,px,py-1,3,2,INK);R(c,px+5,py-1,3,2,INK);
  }else{
    var step=o.step||0;
    R(c,px+1,py-6-step,3,5,INK);R(c,px+2,py-5-step,1,4,pants);
    R(c,px+5,py-6+(step?0:1),3,5,INK);R(c,px+6,py-5+(step?0:1),1,4,pants);
    R(c,px,py-2-step,4,2,'#1F2937');R(c,px+5,py-2+(step?0:1),4,2,'#1F2937');
  }
  // Thân áo + viền + cánh tay
  R(c,px-1,by,10,8,INK);
  R(c,px,by+1,8,6,shirt);
  R(c,px+6,by+1,2,6,'rgba(0,0,0,0.12)');
  R(c,px-2,by+2,2,5,INK);R(c,px-1,by+2,1,4,skin);
  R(c,px+8,by+2,2,5,INK);R(c,px+8,by+2,1,4,skin);
  if(o.guard){
    R(c,px,by+1,2,1,'#1E3A8A');R(c,px+6,by+1,2,1,'#1E3A8A');
    R(c,px+1,by+3,2,1,'#F4B93B');R(c,px,by+6,8,1,'#111827');
  }else if(o.apron){
    R(c,px+1,by+3,6,4,o.apron);R(c,px+2,by+1,1,2,o.apron);R(c,px+5,by+1,1,2,o.apron);
  }else if(o.camera){
    // Máy ảnh đeo trước ngực du khách
    R(c,px+2,by+3,4,3,'#111827');R(c,px+3,by+4,2,1,'#94A3B8');
  }
  if(o.bag){
    R(c,px+9,by+5,4,5,INK);R(c,px+10,by+6,2,3,o.bag);
  }
  // Đầu & Khuôn mặt
  var hy=by-7;
  R(c,px,hy,8,7,INK);R(c,px+1,hy+1,6,5,skin);R(c,px+1,hy+5,6,1,skinSh);
  if(o.shades){
    // Kính râm du khách nước ngoài
    R(c,px+1,hy+3,6,2,'#111827');R(c,px+2,hy+3,1,1,'#60A5FA');R(c,px+5,hy+3,1,1,'#60A5FA');
  }else{
    R(c,px+2,hy+3,1,1,INK);R(c,px+5,hy+3,1,1,INK);
    R(c,px+1,hy+4,1,1,'#F29AB0');R(c,px+6,hy+4,1,1,'#F29AB0');
  }
  // Tóc & Mũ đặc trưng
  if(o.hat==='nonla'){
    R(c,px-3,hy+1,14,1,INK);R(c,px-2,hy,12,1,'#E8C56E');
    R(c,px-1,hy-1,10,1,'#F7DF94');R(c,px+1,hy-2,6,1,'#FFF1C2');R(c,px+3,hy-3,2,1,'#F7DF94');
  }else if(o.hat==='kepi'){
    R(c,px,hy-2,8,3,INK);R(c,px+1,hy-1,6,2,'#1E3A8A');R(c,px+3,hy-1,2,1,'#F4B93B');
    R(c,px-1,hy+1,10,1,'#111827');
  }else if(o.hat==='chef'){
    R(c,px,hy-3,8,4,INK);R(c,px+1,hy-2,6,3,'#FFFFFF');
  }else if(o.hat==='bun'){
    R(c,px+1,hy,6,2,hair);R(c,px+2,hy-2,4,2,hair);R(c,px+5,hy-2,2,1,'#E0452B');
  }else if(o.hat==='bucket'){
    R(c,px-1,hy,10,1,INK);R(c,px,hy-2,8,2,'#EAE4D7');R(c,px+1,hy-1,6,1,'#CBD5E1');
  }else if(o.hat==='cap'){
    R(c,px,hy-1,8,2,INK);R(c,px+1,hy,6,1,'#3B82F6');R(c,px+6,hy+1,3,1,INK);
  }else{
    R(c,px+1,hy,6,2,hair);R(c,px,hy+1,1,3,hair);R(c,px+7,hy+1,1,3,hair);
  }
}

function drawInoxStool(c,sx,sy){
  R(c,sx-1,sy+8,10,2,'rgba(43,33,24,0.24)');
  R(c,sx,sy,8,3,INK);R(c,sx+1,sy+1,6,1,'#E2E8F0');R(c,sx+2,sy+1,2,1,'#FFFFFF');
  R(c,sx+1,sy+3,1,6,'#64748B');R(c,sx+6,sy+3,1,6,'#64748B');R(c,sx+1,sy+6,6,1,'#94A3B8');
}

function drawAccordionGate(c,x0,y0,w,h){
  R(c,x0,y0,w,h,'#C8C2B4');
  for(var gx=x0;gx<x0+w;gx+=4){R(c,gx,y0,1,h,'#6B665C');R(c,gx+1,y0,1,h,'#EAE6DC');}
  for(var gy=y0+2;gy<y0+h-4;gy+=8){
    for(var gx2=x0+1;gx2<x0+w-2;gx2+=4){
      R(c,gx2,gy,2,1,'#7A746A');R(c,gx2+1,gy+2,2,1,'#7A746A');R(c,gx2,gy+4,2,1,'#7A746A');
    }
  }
}

function drawRattanLamp(c,cx,y0){
  R(c,cx,y0-14,1,14,INK);
  E(c,cx,y0+3,8,5,INK);E(c,cx,y0+3,7,4,'#C99A5B');
  R(c,cx-6,y0+2,13,1,'#8C5E1A');R(c,cx-4,y0+4,9,1,'#8C5E1A');
  R(c,cx-3,y0,1,6,'#E5BA7E');R(c,cx+3,y0,1,6,'#E5BA7E');
  R(c,cx-2,y0+5,5,2,'#FFF8D6');R(c,cx-1,y0+6,3,1,'#FFE08A');
}

// =========================================================================
// 6 PHÂN KHU TRÊN (x: 0..1024, y: 56..148)
// =========================================================================
function drawZone1FrontGate(x){
  R(x,4,56,28,88,INK);R(x,5,57,26,86,'#F8FAFC');
  R(x,6,59,24,10,'#DC2626');pxText(x,'WATCH',8,62,'#FFFFFF',1);
  R(x,7,72,22,44,INK);R(x,8,73,20,42,'#DCEEFA');
  for(var wy=78;wy<=102;wy+=12){for(var wx=11;wx<=20;wx+=9){R(x,wx+1,wy-3,2,10,'#4B3C32');E(x,wx+2,wy+2,3,3,INK);E(x,wx+2,wy+2,2,2,'#FFFBF1');}}
  drawAccordionGate(x,32,56,14,88);drawAccordionGate(x,150,56,14,88);
  R(x,46,56,104,12,'#5A534C');
  R(x,82,48,34,13,INK);R(x,83,49,32,11,'#1E3A8A');pxText(x,'CUA 1',89,52,'#FFFFFF',1);
  R(x,46,64,104,14,INK);R(x,47,65,102,12,'#EA580C');R(x,49,67,98,8,'#18181B');
  pxText(x,'WELCOME BEN THANH',64,69,'#FFF8D6',1);
  R(x,130,79,18,7,INK);R(x,131,80,16,5,'#16A34A');pxText(x,'EXIT',132,80,'#FFFFFF',1);
  // Hậu cảnh sâu Sạp Áo Dài
  R(x,46,80,104,64,'#43342A');R(x,48,82,100,48,'#5C4638');
  ['#DC2626','#2563EB','#F59E0B','#EC4899'].forEach(function(col,i){
    var ax=54+i*22;
    R(x,ax+3,90,4,4,'#E5C29F');R(x,ax+2,94,6,2,col);R(x,ax+1,96,8,10,col);R(x,ax+2,106,6,14,col);
    R(x,ax+3,120,2,8,'#FFFBF1');R(x,ax+6,120,2,8,'#FFFBF1');
  });
  drawPerson16Bit(x,120,146,{shirt:'#FFFBF1',pants:'#1E293B',hat:'kepi',guard:true});
  drawPerson16Bit(x,136,146,{shirt:'#FFFBF1',pants:'#1E293B',hat:'kepi',guard:true});
}

function drawZone2Clothing(x){
  // SẠP QUẦN ÁO, VẢI LỤA & TÚI XÁCH "HƯƠNG TRINH" (x: 170..332)
  R(x,172,54,158,15,INK);R(x,173,55,156,13,'#FFFFFF');R(x,174,56,154,11,'#1D4ED8');
  pxText(x,'HUONG TRINH FASHION',208,59,'#FFFFFF',1);
  R(x,172,72,158,72,INK);R(x,173,73,156,70,'#5C4638');
  // Dãy áo thun, váy hoa & balo đủ màu treo cao
  var clCols=['#EF4444','#3B82F6','#FACC15','#10B981','#EC4899','#A855F7','#F97316'];
  for(var cx=178;cx<272;cx+=14){
    var c1=clCols[((cx-178)/14)|0 % clCols.length];
    R(x,cx,77,10,14,INK);R(x,cx+1,78,8,12,c1);R(x,cx+3,75,4,2,'#CBD5E1'); // móc treo
  }
  // Quạt giấy lớn xòe rộng & nón lá treo bên phải sạp
  E(x,302,88,16,11,INK);E(x,302,88,15,10,'#38BDF8');E(x,302,90,11,7,'#FDE047');R(x,286,90,32,12,'#5C4638');
  // Quầy gỗ xếp chồng xấp vải lụa nhiều màu (y: 112..144)
  R(x,170,112,162,32,INK);R(x,171,113,160,30,'#8C5832');
  for(var fy=115;fy<140;fy+=6){for(var fx=175;fx<324;fx+=20){R(x,fx,fy,17,5,clCols[((fx+fy)/6)|0 % clCols.length]);}}
  drawPerson16Bit(x,210,148,{shirt:'#FEF08A',pants:'#1E293B',hat:'bun'});
  drawPerson16Bit(x,272,148,{shirt:'#38BDF8',pants:'#374151',tourist:true,hair:'#D97706',backpack:'#EF4444',shades:true});
}

function drawZone3Specialty(x){
  // SẠP ĐẶC SẢN "LIÊN SÀI GÒN" & "NGỌC HOA 823" (x: 338..510)
  R(x,340,54,88,15,INK);R(x,341,55,86,13,'#FFFFFF');R(x,342,56,84,11,'#15803D');
  pxText(x,'LIEN SAI GON',355,59,'#FFFFFF',1);
  for(var bx=344;bx<424;bx+=8){R(x,bx,70,2,2,'#FFF8D6');}
  R(x,340,74,88,70,INK);R(x,341,75,86,68,'#6A4A32');
  for(var jx=345;jx<422;jx+=10){
    var fill=['#F59E0B','#DC2626','#22C55E','#D97706'][(jx/10)|0 % 4];
    R(x,jx,81,7,11,INK);R(x,jx+1,82,5,9,'#E0F2FE');R(x,jx+1,85,5,6,fill);R(x,jx+1,79,5,2,'#DC2626');
  }
  for(var tx=345;tx<422;tx+=11){R(x,tx,98,8,12,INK);R(x,tx+1,99,6,10,'#15803D');R(x,tx+2,102,4,4,'#FDE047');}
  R(x,338,114,92,30,INK);R(x,339,115,90,6,'#D89C5C');R(x,339,121,90,22,'#8C5832');

  R(x,432,54,78,15,INK);R(x,433,55,76,13,'#F8FAFC');pxText(x,'NGOC HOA 823',441,59,'#DC2626',1);
  R(x,432,72,78,72,INK);R(x,433,73,76,70,'#5C4638');
  for(var ny=78;ny<=102;ny+=8){R(x,438,ny,18,3,INK);R(x,439,ny+1,16,2,'#F7DF94');}
  for(var bx2=462;bx2<=496;bx2+=12){R(x,bx2,78,9,13,INK);R(x,bx2+1,79,7,11,'#2563EB');R(x,bx2+2,82,5,3,'#F4B93B');}
  R(x,432,116,78,28,INK);R(x,433,117,76,6,'#E5C29F');R(x,433,123,76,20,'#7C5032');
  drawPerson16Bit(x,374,120,{shirt:'#F9B8C4',pants:'#1F2937',hat:'bun'});
  drawRattanLamp(x,372,46);drawRattanLamp(x,462,46);
}

function drawZone4FoodCourt(x){
  // CỔNG VÒM "KHU ĂN UỐNG" & QUẦY CHỮ L SẠP 1044 (x: 516..688)
  R(x,518,42,82,30,INK);R(x,519,43,80,28,'#EDE9E0');
  R(x,528,56,62,16,'#3A2D25');E(x,559,60,28,10,'#3A2D25');
  pxText(x,'KHU AN UONG',537,47,'#991B1B',1);
  R(x,604,48,84,16,INK);R(x,605,49,82,14,'#FACC15');pxText(x,'BUN BO 1044',619,53,'#991B1B',1);
  R(x,518,74,170,70,INK);R(x,519,75,168,28,'#47382E');
  drawPerson16Bit(x,546,108,{shirt:'#FFFBF1',pants:'#1F2937',hat:'chef',apron:'#15803D'});
  R(x,526,90,20,16,INK);R(x,527,91,18,14,'#CBD5E1');R(x,529,106,14,3,'#EF4444');R(x,532,106,8,2,'#FDE047');
  R(x,556,80,92,26,INK);R(x,557,81,90,24,'#DCEEFA');R(x,557,93,90,1,'#64748B');
  R(x,562,87,16,4,'#FFFBF1');R(x,584,87,16,4,'#FFFBF1');R(x,586,85,12,3,'#D97706');
  R(x,618,86,10,16,INK);R(x,619,87,8,9,'#FEF08A');R(x,619,96,8,5,'#EF4444');
  [[658,96],[666,96],[674,96],[662,90],[670,90]].forEach(function(cc){E(x,cc[0],cc[1],4,4,INK);E(x,cc[0],cc[1],3,3,'#65A30D');R(x,cc[0],cc[1]-6,1,5,'#EF4444');});
  R(x,518,106,170,38,INK);R(x,519,107,168,4,'#CBD5E1');R(x,519,111,168,32,'#F1F5F9');
  for(var mx=526;mx<672;mx+=24){R(x,mx,115,18,14,INK);R(x,mx+1,116,16,12,'#FFFFFF');E(x,mx+9,122,5,4,['#EA580C','#16A34A','#DC2626'][(mx/24)|0 % 3]);}
  [532,556,580,606,632,658].forEach(function(sx){drawInoxStool(x,sx,145);});
  drawPerson16Bit(x,554,150,{shirt:'#1E293B',pants:'#334155',tourist:true,hair:'#FDE047',sit:true});
  drawPerson16Bit(x,604,150,{shirt:'#FFFBF1',pants:'#4B6FA5',hat:'cap',sit:true});
  drawPerson16Bit(x,656,150,{shirt:'#EC4899',pants:'#1F2937',hat:'bun',sit:true});
}

function drawZone5HotFood(x){
  // BÁNH CUỐN 50K & BÁNH BÈO 20K (x: 694..864)
  R(x,696,48,78,16,INK);R(x,697,49,76,14,'#FEF08A');pxText(x,'BANH CUON 50',709,53,'#B91C1C',1);
  R(x,696,74,78,70,INK);R(x,697,75,76,30,'#4B3C32');
  drawPerson16Bit(x,742,110,{shirt:'#84CC16',pants:'#1F2937',hat:'bun'});
  R(x,706,90,22,16,INK);R(x,707,91,20,14,'#94A3B8');E(x,717,91,10,4,INK);E(x,717,91,9,3,'#FFFFFF');
  R(x,696,106,78,38,INK);
  for(var bx=697;bx<773;bx+=10){for(var by=107;by<143;by+=10){R(x,bx,by,10,10,((bx+by)/10)%2===0?'#F7EED8':'#E2E8F0');R(x,bx+4,by+4,2,2,'#4A8A80');}}

  R(x,778,46,84,16,INK);R(x,779,47,82,14,'#FFFFFF');pxText(x,'BANH BEO 20K',791,51,'#1D4ED8',1);
  R(x,778,74,84,70,INK);R(x,779,75,82,30,'#4B3C32');
  R(x,782,80,74,2,'#94A3B8');
  for(var nx=788;nx<848;nx+=12){R(x,nx,82,6,8,INK);R(x,nx+1,83,4,6,'#4ADE80');R(x,nx+1,85,4,2,'#F472B6');}
  R(x,784,94,70,14,INK);R(x,785,95,68,12,'#DCEEFA');
  for(var cx2=790;cx2<848;cx2+=10){R(x,cx2,102,7,3,'#FFFFFF');R(x,cx2+2,101,3,1,'#EA580C');}
  R(x,778,108,84,36,INK);R(x,779,109,82,34,'#DFC484');
  for(var tx2=783;tx2<858;tx2+=7){for(var ty2=113;ty2<140;ty2+=7){R(x,tx2,ty2,2,2,((tx2+ty2)%2===0)?'#B48B4E':'#FFFBF1');}}
  drawInoxStool(x,718,145);drawInoxStool(x,812,145);
  drawPerson16Bit(x,810,150,{shirt:'#2563EB',pants:'#1E293B',tourist:true,hair:'#92400E',sit:true});
}

function drawZone6BackGate(x){
  // CỔNG SAU "CỬA BẮC · LÊ THÁNH TÔN" (x: 870..1020) — Cổng ra thứ 2!
  drawAccordionGate(x,872,56,14,88);drawAccordionGate(x,998,56,14,88);
  R(x,886,56,112,12,'#5A534C');
  R(x,920,48,44,13,INK);R(x,921,49,42,11,'#15803D');pxText(x,'CUA BAC',928,52,'#FFFFFF',1);
  R(x,888,64,108,14,INK);R(x,889,65,106,12,'#16A34A');R(x,891,67,102,8,'#18181B');
  pxText(x,'EXIT LE THANH TON',908,69,'#86EFAC',1);
  // Cổng vòm mở ra bầu trời nắng phố Lê Thánh Tôn bên ngoài
  R(x,892,80,100,64,INK);R(x,893,81,98,42,'#7DD3FC');E(x,942,84,48,14,'#7DD3FC');
  R(x,893,123,98,20,'#E2D6C0'); // vỉa hè ngoài phố
  R(x,908,108,18,16,'#F5C96B');R(x,956,104,22,20,'#F7B267'); // nhà phố bên kia đường
  // Thảm chào đỏ & Chú bảo vệ gác Cửa Bắc
  R(x,914,146,56,8,INK);R(x,915,147,54,6,'#DC2626');R(x,922,149,40,2,'#FDE047');
  drawPerson16Bit(x,982,146,{shirt:'#FFFBF1',pants:'#1E293B',hat:'kepi',guard:true});
}

// =========================================================================
// 5 ĐẢO GIỮA CHỢ Y-SORTED (y: 204..258) + DÃY BÀN ĂN VỈA HÈ DƯỚI (y: 300..346)
// =========================================================================
function drawForegroundIslands(x){
  // Đảo 1 (x: 34..166): Lưu Niệm, Nón Lá Thêu, Quạt & Lồng Đèn
  R(x,34,244,132,4,'rgba(43,33,24,0.24)');
  R(x,34,212,132,34,INK);R(x,35,213,130,12,'#D89C5C');R(x,35,225,130,20,'#8C5832');
  [48,74,100].forEach(function(nx){E(x,nx,216,7,3,INK);E(x,nx,216,6,2,'#F7DF94');R(x,nx-1,215,2,1,'#EC4899');});
  E(x,128,214,5,5,INK);E(x,128,214,4,4,'#E0452B');E(x,146,214,5,5,INK);E(x,146,214,4,4,'#F4B93B');

  // Đảo 2 (x: 204..364): Trái Cây Nhiệt Đới "1029 NGỌC HẢO"
  R(x,204,246,160,4,'rgba(43,33,24,0.24)');
  R(x,204,210,160,38,INK);R(x,205,211,158,14,'#E5C29F');R(x,205,225,158,22,'#0F766E');
  pxText(x,'1029 NGOC HAO',252,232,'#FEF08A',1);
  for(var r=0;r<3;r++)for(var c=0;c<3-r;c++){E(x,216+c*7+r*3,216-r*5,3,3,INK);E(x,216+c*7+r*3,216-r*5,2,2,'#4ADE80');}
  for(var r2=0;r2<3;r2++)for(var c2=0;c2<3-r2;c2++){E(x,252+c2*7+r2*3,216-r2*5,3,3,INK);E(x,252+c2*7+r2*3,216-r2*5,2,2,'#FACC15');}
  for(var r3=0;r3<3;r3++)for(var c3=0;c3<3-r3;c3++){E(x,288+c3*7+r3*3,216-r3*5,3,3,INK);E(x,288+c3*7+r3*3,216-r3*5,2,2,'#EC4899');}
  [326,340,352].forEach(function(dx){E(x,dx,214,4,5,INK);E(x,dx,214,3,4,'#84CC16');});

  // Đảo 3 (x: 400..568): Bàn Ăn Khu Ẩm Thực 1 (Khách Tây & Khách Việt ăn Bún Bò, Bánh Xèo, Chè)
  R(x,404,244,158,4,'rgba(43,33,24,0.24)');
  drawPerson16Bit(x,420,224,{shirt:'#E0452B',pants:'#1E293B',tourist:true,hair:'#FACC15',sit:true});
  drawPerson16Bit(x,474,224,{shirt:'#38BDF8',pants:'#334155',hat:'nonla',sit:true});
  drawPerson16Bit(x,528,224,{shirt:'#F59E0B',pants:'#1F2937',tourist:true,shades:true,sit:true});
  R(x,404,216,158,18,INK);R(x,405,217,156,12,'#D89C5C');R(x,405,229,156,4,'#8C5832');
  R(x,414,234,6,10,INK);R(x,546,234,6,10,INK);
  [424,476].forEach(function(bx){E(x,bx,222,5,3,INK);E(x,bx,222,4,2,'#FFFBF1');R(x,bx-2,221,4,1,'#EA580C');});
  E(x,452,222,6,3,INK);E(x,452,222,5,2,'#FACC15');
  [504,514,524].forEach(function(cx3){R(x,cx3,218,4,6,INK);R(x,cx3+1,219,2,2,'#E0452B');R(x,cx3+1,221,2,2,'#4ADE80');});

  // Đảo 4 (x: 604..760): Bàn Ăn Khu Ẩm Thực 2 (Đá mài Bánh Bèo & Sinh Tố + Du khách nước ngoài)
  R(x,608,244,146,4,'rgba(43,33,24,0.24)');
  drawPerson16Bit(x,634,224,{shirt:'#10B981',pants:'#1E293B',tourist:true,hair:'#DC2626',sit:true});
  drawPerson16Bit(x,706,224,{shirt:'#EC4899',pants:'#374151',hat:'bucket',tourist:true,sit:true});
  R(x,608,216,146,18,INK);R(x,609,217,144,12,'#DFC484');R(x,609,229,144,4,'#9A7B4F');
  R(x,618,234,6,10,INK);R(x,738,234,6,10,INK);
  [626,636,646,656].forEach(function(px3){R(x,px3,221,6,3,'#FFFFFF');R(x,px3+2,221,2,1,'#EA580C');});
  [694,710].forEach(function(sx3){R(x,sx3,217,5,7,INK);R(x,sx3+1,218,3,5,'#F472B6');R(x,sx3+2,214,1,3,'#FFFBF1');});

  // Đảo 5 (x: 796..956): Đảo Hoa Tươi Chợ Bến Thành & Gốm Sơn Mài
  R(x,796,246,160,4,'rgba(43,33,24,0.24)');
  R(x,796,212,160,36,INK);R(x,797,213,158,12,'#E5C29F');R(x,797,225,158,22,'#7C2D12');
  pxText(x,'HOA TUOI GOM SU',836,232,'#FEF08A',1);
  // Chậu cúc vàng, bó sen hồng & bình gốm xanh coban
  [814,840,866].forEach(function(fx){E(x,fx,213,7,5,INK);E(x,fx,213,6,4,'#FACC15');E(x,fx+2,211,3,2,'#F97316');});
  [894,918,940].forEach(function(gx){R(x,gx,206,8,12,INK);R(x,gx+1,207,6,10,'#2563EB');R(x,gx+2,210,4,3,'#E0F2FE');});
}

var MK={bg:null,islands:null,t:0,last:0,dt:0,run:false,w:VW,h:VH};

function buildMarketInterior(){
  var bg=document.createElement('canvas');bg.width=WORLD_W;bg.height=WORLD_H;
  var x=bg.getContext('2d');x.imageSmoothingEnabled=false;

  // LỚP 1: MÁI VÒM BÊ TÔNG CONG PARABOL & Ô GIẾNG TRỜI ĐỎ NÂU SUỐT 1024px (y: 0..56)
  R(x,0,0,WORLD_W,56,'#3B2D24');
  for(var gx=0;gx<WORLD_W;gx+=8)R(x,gx,0,1,54,'rgba(0,0,0,0.22)');
  for(var gy=0;gy<54;gy+=6)R(x,0,gy,WORLD_W,1,'rgba(0,0,0,0.22)');
  for(var sk=24;sk<WORLD_W;sk+=96){
    R(x,sk,3,52,24,'#D97A54');R(x,sk+2,5,48,20,'#FBE6C4');
    for(var nx=sk+10;nx<sk+52;nx+=10)R(x,nx,3,1,24,'#9E4B32');
    R(x,sk,11,52,1,'#9E4B32');R(x,sk,19,52,1,'#9E4B32');
  }
  for(var tx=0;tx<WORLD_W;tx+=96){
    R(x,tx,0,8,56,'#D99B38');R(x,tx+1,0,2,56,'#F5CA72');R(x,tx+6,0,2,56,'#8C5C18');
    for(var k=0;k<20;k++){
      var archY=Math.round(30-(k*k)*0.07);
      R(x,tx+8+k*2,archY,3,4,'#D99B38');R(x,tx+88-k*2,archY,3,4,'#D99B38');
    }
  }
  R(x,0,54,WORLD_W,2,INK);
  R(x,0,56,WORLD_W,90,'#E6D6BE');

  // LỚP 3: SÀN GẠCH HÀNH LANG CHỢ 2 HÀNH LANG SONG SONG (y: 144..360)
  for(var fx=0;fx<WORLD_W;fx+=16){
    for(var fy=144;fy<WORLD_H;fy+=12){
      var alt=((fx/16)+(fy/12))%2===0;
      R(x,fx,fy,16,12,alt?'#CBB094':'#BC9C7E');
      R(x,fx,fy,16,1,'rgba(75,52,36,0.22)');
      R(x,fx,fy,1,12,'rgba(75,52,36,0.22)');
    }
  }
  R(x,0,158,WORLD_W,4,'#7E5640');R(x,0,188,WORLD_W,4,'#7E5640');
  R(x,0,276,WORLD_W,4,'#7E5640');R(x,0,318,WORLD_W,4,'#7E5640');
  R(x,0,144,WORLD_W,1,INK);

  // Dãy bàn ghế nhựa thấp phụ dọc mép dưới hành lang 2 (y: 326..352)
  [120, 310, 520, 740, 910].forEach(function(bx){
    R(x,bx,332,26,12,INK);R(x,bx+1,333,24,8,'#DCE4EE');
    R(x,bx-9,336,7,7,INK);R(x,bx-8,337,5,5,'#DC2626');
    R(x,bx+28,336,7,7,INK);R(x,bx+29,337,5,5,'#2563EB');
    drawPerson16Bit(x,bx-9,340,{shirt:'#F472B6',pants:'#1E293B',hat:'nonla',sit:true});
    drawPerson16Bit(x,bx+26,340,{shirt:'#38BDF8',pants:'#334155',tourist:true,hair:'#FDE047',sit:true});
  });

  // 6 PHÂN KHU TRÊN
  drawZone1FrontGate(x);
  drawZone2Clothing(x);
  drawZone3Specialty(x);
  drawZone4FoodCourt(x);
  drawZone5HotFood(x);
  drawZone6BackGate(x);
  MK.bg=bg;

  // 5 ĐẢO GIỮA CHỢ Y-SORTED
  var isl=document.createElement('canvas');isl.width=WORLD_W;isl.height=WORLD_H;
  var ix=isl.getContext('2d');ix.imageSmoothingEnabled=false;
  drawForegroundIslands(ix);
  MK.islands=isl;
}

function drawLiveMarketEffects(x,t){
  try{
    x.save();
    x.globalAlpha=0.10;
    for(var sk=30;sk<WORLD_W;sk+=96){
      for(var dy=0;dy<90;dy+=3){R(x,sk+Math.round(dy*0.25),26+dy,34,3,'#FFF6D6');}
    }
    x.globalAlpha=0.20+Math.sin(t*3)*0.04;
    [372,462].forEach(function(lx){E(x,lx,50,12,9,'#FFE08A');});
    R(x,48,65,100,12,'#FDBA74');
    x.restore();
    // Quạt lồng sắt công nghiệp quay mượt 60fps
    [568,732,816].forEach(function(fx){
      E(x,fx,68,6,6,INK);E(x,fx,68,5,5,'#334155');
      var sp=Math.max(1,Math.round(Math.abs(Math.sin(t*10+fx))*5));
      R(x,fx-sp,67,sp*2,2,'#CBD5E1');
    });
    // Khói bếp bay từ Nồi nước lèo, Bánh Cuốn & Tô Bún
    [[536,88],[717,88],[424,218],[476,218]].forEach(function(pt){
      for(var i=0;i<3;i++){
        var p=((t*0.95+i*0.33)%1);
        var sy=pt[1]-Math.round(p*14), stx=pt[0]+Math.round(Math.sin(t*4+i*2)*1.6);
        x.save();x.globalAlpha=0.72*(1-p);R(x,stx,sy,2,2,'#FFFBF1');x.restore();
      }
    });
  }catch(_e){}
}

// 10 DU KHÁCH ĐI BỘ 2 CHIỀU DỌC 2 HÀNH LANG (GỒM CẢ KHÁCH TÂY BALO/KÍNH RÂM/MÁY ẢNH & NGƯỜI VIỆT)
function getWalkingShoppers(t){
  return [
    {y:170,x:((t*16+40)%980),shirt:'#E0452B',pants:'#1E293B',hat:'nonla',bag:'#FFFBF1'},
    {y:180,x:980-((t*14+180)%980),shirt:'#38BDF8',pants:'#334155',tourist:true,hair:'#FDE047',backpack:'#EA580C',camera:true,shades:true},
    {y:188,x:((t*15+360)%980),shirt:'#F59E0B',pants:'#1F2937',tourist:true,hat:'bucket',backpack:'#2563EB',bag:'#FFFBF1'},
    {y:176,x:980-((t*13+560)%980),shirt:'#EC4899',pants:'#374151',hat:'bun',bag:'#F4B93B'},
    {y:192,x:((t*17+780)%980),shirt:'#10B981',pants:'#1E293B',tourist:true,hair:'#92400E',camera:true},
    {y:272,x:980-((t*15+90)%980),shirt:'#FFFBF1',pants:'#4B6FA5',tourist:true,hair:'#FACC15',backpack:'#16A34A',shades:true},
    {y:284,x:((t*13+290)%980),shirt:'#EF4444',pants:'#1F2937',hat:'nonla',bag:'#E5BA7E'},
    {y:294,x:980-((t*16+510)%980),shirt:'#6366F1',pants:'#1E293B',tourist:true,hat:'cap',backpack:'#EC4899',camera:true},
    {y:304,x:((t*14+720)%980),shirt:'#84CC16',pants:'#334155',hat:'bun',bag:'#38BDF8'},
    {y:312,x:980-((t*12+880)%980),shirt:'#F97316',pants:'#1F2937',tourist:true,hair:'#DC2626',shades:true,bag:'#FFFBF1'}
  ];
}

function drawWalkingShoppers(x,t,minY,maxY){
  getWalkingShoppers(t).forEach(function(w){
    if(w.y<minY||w.y>=maxY)return;
    drawPerson16Bit(x,Math.round(w.x),Math.round(w.y),{
      shirt:w.shirt,pants:w.pants,hat:w.hat,hair:w.hair,tourist:w.tourist,
      backpack:w.backpack,camera:w.camera,shades:w.shades,bag:w.bag,step:((t*6)|0)%2
    });
  });
}

function drawPigAt(x,rm,t){
  if(!rm)return;
  var px=Math.round(rm.x-12), jumpY=(rm.action==='jump_joy'?-Math.abs(Math.sin(t*10))*4:0), py=Math.round(rm.y-20+jumpY);
  R(x,px+4,Math.round(rm.y)-1,16,2,'rgba(43,33,24,0.28)');
  hpx.clearRect(0,0,24,20);
  drawPigSprite(hpx,{pose:rm.walking?'walk':(rm.action==='eat_snack'?'eat':'stand'),frame:rm.walking?(((t*6)|0)%2):0,happy:Boolean(rm.action),blink:(t%4)<0.15,tail:Math.floor(t*3)%2===1});
  x.save();
  if(rm.facing<0){x.translate(px+24,py);x.scale(-1,1);x.drawImage(hp,0,0,24,20,0,0,24,20);}
  else x.drawImage(hp,0,0,24,20,px,py,24,20);
  x.restore();
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

  // Y-Sorting 2.5D giữa Chú Heo, 10 Du khách đi bộ & 5 Đảo Giữa Chợ (ISLAND_Y = 236)
  var pigY=rm?rm.y:176;
  var ISLAND_Y=236;

  drawWalkingShoppers(x,t,0,Math.min(pigY,ISLAND_Y));
  if(pigY<ISLAND_Y){
    drawPigAt(x,rm,t);
    drawWalkingShoppers(x,t,pigY,ISLAND_Y);
    x.drawImage(MK.islands,0,0);
    drawWalkingShoppers(x,t,ISLAND_Y,999);
  }else{
    drawWalkingShoppers(x,t,0,ISLAND_Y);
    x.drawImage(MK.islands,0,0);
    drawWalkingShoppers(x,t,ISLAND_Y,pigY);
    drawPigAt(x,rm,t);
    drawWalkingShoppers(x,t,pigY,999);
  }
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
  var targets=[{x:94,y:176},{x:248,y:176},{x:422,y:176},{x:602,y:176},{x:778,y:176},{x:942,y:176}];
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
    [openRoomScript]
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
