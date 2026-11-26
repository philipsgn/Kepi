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
 * Không Gian Lòng Chợ Bến Thành 16-Bit 2.5D Có Chiều Sâu 4 Lớp & Pixel Vuông 1:1 (Quyết định 210)
 * - Viewport 208×240 (khóa aspectRatio 208/240 -> 0 biến dạng dọc) trên Thế giới 720×280.
 * - Lớp 1 (y: 0..56): Mái vòm bê tông cong parabol, giếng trời chiếu tia nắng xiên, đèn mây tre đan nan & quạt quay.
 * - Lớp 2 (y: 56..148): 4 phân khu sạp 3D chi tiết từng vật phẩm (Cửa Số 1 mắt cáo + hậu cảnh Áo Dài, Liên Sài Gòn/Ngọc Hoa, Vòm Khu Ăn Uống + Sạp 1044 nồi nước lèo & dừa tươi, Bánh Cuốn 50k & Bánh Bèo 20k đá mài).
 * - Lớp 3 (y: 148..196): Hành lang lát gạch nâu đất, ghế đẩu inox, thực khách 14×22 & chú Heo 24×20.
 * - Lớp 4 (y: 196..280): 4 Đảo Giữa Chợ Y-Sorted (Đảo Lưu Niệm, Đảo Trái Cây 1029 Ngọc Hảo, 2 Đảo Bàn Ăn Khu Ẩm Thực).
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
      if (d.id === 'exit_market' && d.userTriggered && onExitToMap) {
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
        worldWidth: 720,
        worldHeight: 280,
        viewWidth: 208,
        viewHeight: 240,
        walkBounds: { minX: 20, maxX: 700, minY: 148, maxY: 268 },
        initialX: 92,
        initialY: 174,
        initialCamX: 0,
        initialCamY: 16,
        speed: 52,
        hotspots: [
          {
            id: 'exit_market',
            x: 24,
            y: 36,
            w: 124,
            h: 108,
            standX: 88,
            standY: 156,
            standFace: -1,
            actionType: 'jump_joy',
            fastDash: true,
            bubbleText: `Bước ra Cửa Số 1...`,
          },
          {
            id: 'stall_liensaigon',
            x: 180,
            y: 44,
            w: 176,
            h: 100,
            standX: 266,
            standY: 168,
            standFace: 1,
            actionType: 'check_ledger',
            bubbleText: `Sạp Liên Sài Gòn & Ngọc Hoa · Mua sắm ${shoppingTotalText}`,
          },
          {
            id: 'arch_foodcourt',
            x: 364,
            y: 34,
            w: 172,
            h: 112,
            standX: 446,
            standY: 168,
            standFace: 1,
            actionType: 'look_window',
            bubbleText: `Khu Ăn Uống Sạp 1044 · ${visitsCount} quán quen`,
          },
          {
            id: 'stall_banhcuon_banhbeo',
            x: 544,
            y: 44,
            w: 168,
            h: 100,
            standX: 626,
            standY: 168,
            standFace: 1,
            actionType: 'eat_snack',
            bubbleText: `Bánh Cuốn 50k & Bánh Bèo 20k · Ăn uống ${foodTotalText}`,
          },
          {
            id: 'island_fruit',
            x: 188,
            y: 200,
            w: 144,
            h: 58,
            standX: 260,
            standY: 194,
            standFace: 1,
            actionType: 'eat_snack',
            bubbleText: `Sạp Trái Cây 1029 Ngọc Hảo · Tươi ngon!`,
          },
          {
            id: 'island_dining',
            x: 368,
            y: 200,
            w: 148,
            h: 58,
            standX: 442,
            standY: 194,
            standFace: 1,
            actionType: 'sip_coffee',
            bubbleText: `Bàn Ăn Khu Ẩm Thực · Bún bò & Chè ba màu`,
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
<canvas id="mkCv" width="208" height="240" role="img" aria-label="Không gian bên trong Chợ Bến Thành 2.5D 4 lớp chiều sâu: Cửa Số 1, Liên Sài Gòn, Khu Ăn Uống, Bánh Cuốn Bánh Bèo và 4 đảo giữa chợ"></canvas>
<script>
(function(){
'use strict';

var INK='#2B2118';
var WORLD_W=720;
var WORLD_H=280;
var VW=208;
var VH=240;

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
// SPRITE NHÂN VẬT 16-BIT CHI TIẾT 14x22 (TÓC, MẮT, MŨ, TẠP DỀ, TAY, GIÀY)
// =========================================================================
function drawPerson16Bit(c,px,py,o){
  o=o||{};
  var sit=!!o.sit, shirt=o.shirt||'#FFFBF1', pants=o.pants||'#1E293B', hair=o.hair||'#2B2118';
  var skin='#F5CCA0', skinSh='#DDA878';
  // Bóng tiếp xúc dưới chân
  R(c,px-2,py-1,12,2,'rgba(43,33,24,0.26)');
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
  var by=sit?py-13:py-14;
  // Thân áo + viền + cánh tay
  R(c,px-1,by,10,8,INK);
  R(c,px,by+1,8,6,shirt);
  R(c,px+6,by+1,2,6,'rgba(0,0,0,0.12)'); // đổ bóng thân
  // Tay cầm đồ hoặc buông
  R(c,px-2,by+2,2,5,INK);R(c,px-1,by+2,1,4,skin);
  R(c,px+8,by+2,2,5,INK);R(c,px+8,by+2,1,4,skin);
  if(o.guard){
    // Cầu vai xanh đen, phù hiệu vàng & thắt lưng bảo vệ
    R(c,px,by+1,2,1,'#1E3A8A');R(c,px+6,by+1,2,1,'#1E3A8A');
    R(c,px+1,by+3,2,1,'#F4B93B');R(c,px,by+6,8,1,'#111827');
  }else if(o.apron){
    R(c,px+1,by+3,6,4,o.apron);R(c,px+2,by+1,1,2,o.apron);R(c,px+5,by+1,1,2,o.apron);
  }
  if(o.bag){
    R(c,px+9,by+5,4,5,INK);R(c,px+10,by+6,2,3,o.bag);
  }
  // Đầu & Khuôn mặt (mắt, má hồng)
  var hy=by-7;
  R(c,px,hy,8,7,INK);
  R(c,px+1,hy+1,6,5,skin);
  R(c,px+1,hy+5,6,1,skinSh);
  // Mắt & má hồng
  R(c,px+2,hy+3,1,1,INK);R(c,px+5,hy+3,1,1,INK);
  R(c,px+1,hy+4,1,1,'#F29AB0');R(c,px+6,hy+4,1,1,'#F29AB0');
  // Tóc & Mũ đặc trưng
  if(o.hat==='nonla'){
    R(c,px-3,hy+1,14,1,INK);R(c,px-2,hy,12,1,'#E8C56E');
    R(c,px-1,hy-1,10,1,'#F7DF94');R(c,px+1,hy-2,6,1,'#FFF1C2');R(c,px+3,hy-3,2,1,'#F7DF94');
  }else if(o.hat==='kepi'){
    R(c,px,hy-2,8,3,INK);R(c,px+1,hy-1,6,2,'#1E3A8A');R(c,px+3,hy-1,2,1,'#F4B93B'); // mũ kê-pi sao vàng
    R(c,px-1,hy+1,10,1,'#111827');
  }else if(o.hat==='chef'){
    R(c,px,hy-3,8,4,INK);R(c,px+1,hy-2,6,3,'#FFFFFF');
  }else if(o.hat==='bun'){
    R(c,px+1,hy,6,2,hair);R(c,px+2,hy-2,4,2,hair);R(c,px+5,hy-2,2,1,'#E0452B'); // tóc búi cài trâm
  }else if(o.hat==='cap'){
    R(c,px,hy-1,8,2,INK);R(c,px+1,hy,6,1,'#3B82F6');R(c,px+6,hy+1,3,1,INK);
  }else{
    R(c,px+1,hy,6,2,hair);R(c,px,hy+1,1,3,hair);R(c,px+7,hy+1,1,3,hair);
  }
}

function drawInoxStool(c,sx,sy){
  R(c,sx-1,sy+8,10,2,'rgba(43,33,24,0.24)');
  R(c,sx,sy,8,3,INK);R(c,sx+1,sy+1,6,1,'#E2E8F0');R(c,sx+2,sy+1,2,1,'#FFFFFF'); // mặt inox bóng
  R(c,sx+1,sy+3,1,6,'#64748B');R(c,sx+6,sy+3,1,6,'#64748B');
  R(c,sx+1,sy+6,6,1,'#94A3B8'); // kiềng ngang
}

function drawAccordionGate(c,x0,y0,w,h){
  R(c,x0,y0,w,h,'#C8C2B4');
  for(var gx=x0;gx<x0+w;gx+=4){
    R(c,gx,y0,1,h,'#6B665C');
    R(c,gx+1,y0,1,h,'#EAE6DC');
  }
  // Mắt cáo hình thoi đan chéo
  for(var gy=y0+2;gy<y0+h-4;gy+=8){
    for(var gx2=x0+1;gx2<x0+w-2;gx2+=4){
      R(c,gx2,gy,2,1,'#7A746A');R(c,gx2+1,gy+2,2,1,'#7A746A');
      R(c,gx2,gy+4,2,1,'#7A746A');
    }
  }
}

function drawRattanLamp(c,cx,y0){
  R(c,cx,y0-14,1,14,INK); // dây treo
  E(c,cx,y0+3,8,5,INK);E(c,cx,y0+3,7,4,'#C99A5B');
  // Nan mây tre đan
  R(c,cx-6,y0+2,13,1,'#8C5E1A');R(c,cx-4,y0+4,9,1,'#8C5E1A');
  R(c,cx-3,y0,1,6,'#E5BA7E');R(c,cx+3,y0,1,6,'#E5BA7E');
  // Bóng đèn sợi đốt vàng ấm ở tâm
  R(c,cx-2,y0+5,5,2,'#FFF8D6');R(c,cx-1,y0+6,3,1,'#FFE08A');
}

// =========================================================================
// DỰNG NỀN 2.5D LIỀN MẠCH 720x280 (LỚP 1: MÁI VÒM -> LỚP 2: 4 KHU SẠP 3D -> LỚP 3: HÀNH LANG)
// =========================================================================
function drawZone1Gate(x){
  // Tủ đồng hồ WATCH bên trái (x: 4..34, y: 56..144)
  R(x,4,56,30,88,INK);R(x,5,57,28,86,'#F8FAFC');
  R(x,6,59,26,10,'#DC2626');pxText(x,'WATCH',9,62,'#FFFFFF',1);
  // Tủ kính bày 6 đồng hồ tròn có dây đeo
  R(x,7,72,24,44,INK);R(x,8,73,22,42,'#DCEEFA');R(x,9,74,5,38,'#EFF6FF');
  for(var wy=78;wy<=102;wy+=12){
    for(var wx=12;wx<=22;wx+=10){
      R(x,wx+1,wy-3,2,10,'#4B3C32'); // dây da
      E(x,wx+2,wy+2,3,3,INK);E(x,wx+2,wy+2,2,2,'#FFFBF1');R(x,wx+2,wy+1,1,2,INK);
    }
  }
  // Cửa sắt xếp mắt cáo hai bên Cửa Số 1
  drawAccordionGate(x,34,56,16,88);
  drawAccordionGate(x,156,56,16,88);
  // Vòm hoa sắt trên & Biển xanh CỬA SỐ 1
  R(x,50,56,106,12,'#5A534C');
  for(var ox=54;ox<152;ox+=10){E(x,ox+3,62,3,3,'#9CA3AF');E(x,ox+3,62,1,1,'#5A534C');}
  R(x,86,48,34,13,INK);R(x,87,49,32,11,'#1E3A8A');R(x,88,50,30,9,'#1D4ED8');
  pxText(x,'CUA 1',93,52,'#FFFFFF',1);
  // Bảng LED ma trận viền cam: WELCOME BEN THANH
  R(x,50,64,106,14,INK);R(x,51,65,104,12,'#EA580C');R(x,53,67,100,8,'#18181B');
  pxText(x,'WELCOME BEN THANH',69,69,'#FFF8D6',1);
  // Hộp đèn EXIT xanh lá
  R(x,136,79,18,7,INK);R(x,137,80,16,5,'#16A34A');pxText(x,'EXIT',138,80,'#FFFFFF',1);

  // HẬU CẢNH CHIỀU SÂU NHÌN XUYÊN QUA CỔNG: Sạp Áo Dài & Lụa Sài Gòn (x: 52..154, y: 80..144)
  R(x,50,80,106,64,'#43342A');
  R(x,52,82,102,48,'#5C4638');
  // 4 Ma-nơ-canh mặc Áo Dài truyền thống (cổ cao, tà áo dài, quần lụa trắng)
  var adCols=['#DC2626','#2563EB','#F59E0B','#EC4899'];
  adCols.forEach(function(col,i){
    var ax=60+i*22;
    R(x,ax+3,90,4,4,'#E5C29F'); // đầu ma-nơ-canh
    R(x,ax+2,94,6,2,col); // cổ áo dài
    R(x,ax+1,96,8,10,col); // thân áo
    R(x,ax+2,106,6,14,col); // tà áo dài
    R(x,ax+3,120,2,8,'#FFFBF1');R(x,ax+6,120,2,8,'#FFFBF1'); // quần lụa trắng
  });
  // Đèn lồng nhỏ treo sâu bên trong hậu cảnh
  [68,102,134].forEach(function(lx){E(x,lx,86,3,3,'#E0452B');R(x,lx,85,1,2,'#FFE08A');});
  // 2 Chú bảo vệ 14x22 mặc sơ mi trắng, mũ kê-pi, cầu vai đứng gác bên phải cổng
  drawPerson16Bit(x,126,146,{shirt:'#FFFBF1',pants:'#1E293B',hat:'kepi',guard:true});
  drawPerson16Bit(x,142,146,{shirt:'#FFFBF1',pants:'#1E293B',hat:'kepi',guard:true});
  // Ghế nhựa đỏ bên trái
  R(x,54,136,8,8,INK);R(x,55,137,6,6,'#DC2626');
}

function drawZone2Specialty(x){
  // Biển xanh lá "LIEN SAI GON" (x: 180..270) + Dàn bóng đèn tròn
  R(x,180,54,90,15,INK);R(x,181,55,88,13,'#FFFFFF');R(x,182,56,86,11,'#15803D');
  pxText(x,'LIEN SAI GON',196,59,'#FFFFFF',1);
  for(var bx=184;bx<266;bx+=8){R(x,bx,70,2,2,'#FFF8D6');}
  // Kệ gỗ 3 tầng sâu bày Hũ Mứt nắp đỏ, Hộp Trà Sen xanh & Bịch Cà Phê
  R(x,180,74,90,70,INK);R(x,181,75,88,68,'#6A4A32');
  // Tầng 1 (y: 78..94): Hũ thủy tinh nắp đỏ đựng hạt điều/mứt
  R(x,182,92,86,2,'#4B3220');
  for(var jx=185;jx<264;jx+=10){
    var fill=['#F59E0B','#DC2626','#22C55E','#D97706'][(jx/10)|0 % 4];
    R(x,jx,81,7,11,INK);R(x,jx+1,82,5,9,'#E0F2FE');
    R(x,jx+1,85,5,6,fill);R(x,jx+2,83,1,4,'#FFFFFF'); // phản quang kính
    R(x,jx+1,79,5,2,'#DC2626'); // nắp đỏ
  }
  // Tầng 2 (y: 96..112): Hộp Trà Sen xanh có tem nhãn vàng + Phin cà phê
  R(x,182,110,86,2,'#4B3220');
  for(var tx=185;tx<264;tx+=11){
    R(x,tx,98,8,12,INK);R(x,tx+1,99,6,10,'#15803D');R(x,tx+2,102,4,4,'#FDE047'); // hộp trà nhãn vàng
  }
  // Quầy gỗ 3D phía trước (y: 114..144) có rổ mây tre đan vân chéo
  R(x,178,114,94,30,INK);R(x,179,115,92,6,'#D89C5C');R(x,179,121,92,22,'#8C5832');
  [184,212,240].forEach(function(rx){
    R(x,rx,110,20,9,INK);R(x,rx+1,111,18,7,'#E5BA7E');
    R(x,rx+3,113,14,1,'#A16207');R(x,rx+3,115,14,1,'#A16207');
  });

  // Sạp NGỌC HOA 823 (x: 274..356)
  R(x,274,54,82,15,INK);R(x,275,55,80,13,'#F8FAFC');
  pxText(x,'NGOC HOA 823',285,59,'#DC2626',1);
  R(x,274,72,82,72,INK);R(x,275,73,80,70,'#5C4638');
  // Chồng nón lá thêu hoa & túi thổ cẩm treo
  for(var ny=78;ny<=102;ny+=8){
    R(x,280,ny,18,3,INK);R(x,281,ny+1,16,2,'#F7DF94');R(x,287,ny+1,4,1,'#EC4899');
  }
  for(var bx2=306;bx2<=342;bx2+=12){
    R(x,bx2,78,9,13,INK);R(x,bx2+1,79,7,11,'#2563EB');R(x,bx2+2,82,5,3,'#F4B93B');R(x,bx2+2,86,5,2,'#E0452B');
  }
  R(x,274,116,82,28,INK);R(x,275,117,80,6,'#E5C29F');R(x,275,123,80,20,'#7C5032');
  // Cô chủ sạp 14x22 tóc búi cài trâm, áo bà ba hồng đứng sau quầy
  drawPerson16Bit(x,216,120,{shirt:'#F9B8C4',pants:'#1F2937',hat:'bun'});
  // Chao đèn mây tre đan nan chi tiết thả từ trần vòm
  drawRattanLamp(x,208,46);drawRattanLamp(x,298,46);
}

function drawZone3FoodCourt(x){
  // Cổng vòm 3D cong bán nguyệt "KHU ĂN UỐNG" (x: 364..446, y: 38..72)
  R(x,364,42,82,30,INK);R(x,365,43,80,28,'#EDE9E0');
  R(x,374,56,62,16,'#3A2D25');E(x,405,60,28,10,'#3A2D25');
  pxText(x,'KHU AN UONG',383,47,'#991B1B',1);
  // Biển vàng Sạp 1044 "BÚN BÒ - MÌ QUẢNG"
  R(x,450,48,84,16,INK);R(x,451,49,82,14,'#FACC15');
  pxText(x,'BUN BO 1044',465,53,'#991B1B',1);

  // Quầy Góc Chữ L Ốp Gạch Trắng Sạp 1044 (x: 366..534, y: 74..144)
  R(x,366,74,168,70,INK);
  R(x,367,75,166,28,'#47382E'); // không gian bếp phía sau tủ kính
  // Cô đầu bếp 14x22 đội mũ bếp đứng sau nồi nước lèo
  drawPerson16Bit(x,392,108,{shirt:'#FFFBF1',pants:'#1F2937',hat:'chef',apron:'#15803D'});
  // Nồi nước lèo inox khổng lồ + bếp lửa đỏ dưới đáy (x: 374..394)
  R(x,374,90,20,16,INK);R(x,375,91,18,14,'#CBD5E1');R(x,377,91,4,14,'#F8FAFC');
  R(x,377,106,14,3,'#EF4444');R(x,380,106,8,2,'#FDE047'); // lửa bếp
  // Tủ kính 2 tầng bày Gỏi Cuốn, Chả Giò, Tô Bún Bò & Máy Xay Sinh Tố (x: 404..496)
  R(x,404,80,92,26,INK);R(x,405,81,90,24,'#DCEEFA');
  R(x,405,93,90,1,'#64748B'); // kệ kính giữa
  // Đĩa Gỏi Cuốn trắng-đỏ & Chả Giò vàng tầng trên
  R(x,410,87,16,4,'#FFFBF1');R(x,412,85,4,3,'#F8FAFC');R(x,413,86,2,1,'#E0452B');R(x,418,85,4,3,'#F8FAFC');
  R(x,432,87,16,4,'#FFFBF1');R(x,434,85,12,3,'#D97706');
  // Tô Bún Bò & Máy Xay Sinh Tố tầng dưới
  R(x,412,99,14,5,'#FFFBF1');R(x,414,98,10,2,'#EA580C');R(x,416,97,4,1,'#22C55E');
  R(x,466,86,10,16,INK);R(x,467,87,8,9,'#FEF08A');R(x,467,96,8,5,'#EF4444'); // máy xay sinh tố
  // Chùm 5 trái dừa tươi xanh chặt miệng cắm ống hút ngay góc quầy (x: 500..530)
  [[506,96],[514,96],[522,96],[510,90],[518,90]].forEach(function(cc){
    E(x,cc[0],cc[1],4,4,INK);E(x,cc[0],cc[1],3,3,'#65A30D');
    R(x,cc[0],cc[1]-6,1,5,'#EF4444'); // ống hút đỏ
  });
  // Mặt trước quầy chữ L ốp gạch trắng + 6 tấm ảnh món ăn tròn
  R(x,366,106,168,38,INK);R(x,367,107,166,4,'#CBD5E1');R(x,367,111,166,32,'#F1F5F9');
  for(var gx3=375;gx3<530;gx3+=8)R(x,gx3,111,1,32,'#E2E8F0');
  for(var mx=374;mx<520;mx+=24){
    R(x,mx,115,18,14,INK);R(x,mx+1,116,16,12,'#FFFFFF');
    E(x,mx+9,122,5,4,['#EA580C','#16A34A','#DC2626'][(mx/24)|0 % 3]);
    E(x,mx+9,122,3,2,'#FEF08A');
  }
  // 6 Ghế đẩu inox bóng + 3 thực khách 14x22 ngồi ăn tại quầy
  [380,404,428,454,480,506].forEach(function(sx){drawInoxStool(x,sx,145);});
  drawPerson16Bit(x,402,150,{shirt:'#1E293B',pants:'#334155',hat:'none',sit:true});
  drawPerson16Bit(x,452,150,{shirt:'#FFFBF1',pants:'#4B6FA5',hat:'cap',sit:true});
  drawPerson16Bit(x,504,150,{shirt:'#EC4899',pants:'#1F2937',hat:'bun',sit:true});
}

function drawZone4HotFood(x){
  // Quầy BÁNH CUỐN NÓNG 50K (x: 544..626)
  R(x,544,48,80,16,INK);R(x,545,49,78,14,'#FEF08A');
  pxText(x,'BANH CUON 50',558,53,'#B91C1C',1);
  R(x,544,74,80,70,INK);R(x,545,75,78,30,'#4B3C32');
  // Cô bán hàng áo xanh cốm đứng tráng bánh
  drawPerson16Bit(x,592,110,{shirt:'#84CC16',pants:'#1F2937',hat:'bun'});
  // Nồi hơi tráng bánh cuốn căng vải trắng + nắp vung gỗ
  R(x,554,90,22,16,INK);R(x,555,91,20,14,'#94A3B8');
  E(x,565,91,10,4,INK);E(x,565,91,9,3,'#FFFFFF'); // mặt vải tráng bánh
  // Mặt trước quầy Bánh Cuốn ốp gạch bông hoa văn xanh-vàng
  R(x,544,106,80,38,INK);
  for(var bx=545;bx<623;bx+=10){
    for(var by=107;by<143;by+=10){
      R(x,bx,by,10,10,((bx+by)/10)%2===0?'#F7EED8':'#E2E8F0');
      R(x,bx+4,by+4,2,2,'#4A8A80');
    }
  }
  // Quầy BÁNH BÈO HUẾ 20K (x: 628..716)
  R(x,628,46,88,16,INK);R(x,629,47,86,14,'#FFFFFF');
  pxText(x,'BANH BEO 20K',642,51,'#1D4ED8',1);
  R(x,628,74,88,70,INK);R(x,629,75,86,30,'#4B3C32');
  // Thanh ngang treo chùm Nem Chua gói lá chuối buộc dây hồng
  R(x,632,80,78,2,'#94A3B8');
  for(var nx=638;nx<702;nx+=12){
    R(x,nx,82,6,8,INK);R(x,nx+1,83,4,6,'#4ADE80');R(x,nx+1,85,4,2,'#F472B6');
  }
  // Tủ kính bày 12 chén bánh bèo trắng chấm tôm chấy đỏ cam
  R(x,634,94,74,14,INK);R(x,635,95,72,12,'#DCEEFA');
  for(var cx2=640;cx2<702;cx2+=10){
    R(x,cx2,102,7,3,'#FFFFFF');R(x,cx2+2,101,3,1,'#EA580C');
  }
  // Mặt bàn Đá Mài Vàng (Terrazzo #DFC484 điểm hạt đá li ti)
  R(x,628,108,88,36,INK);R(x,629,109,86,34,'#DFC484');
  for(var tx2=633;tx2<712;tx2+=7){
    for(var ty2=113;ty2<140;ty2+=7){
      R(x,tx2,ty2,2,2,((tx2+ty2)%2===0)?'#B48B4E':'#FFFBF1');
    }
  }
  // Ghế đẩu & Thực khách
  drawInoxStool(x,566,145);drawInoxStool(x,660,145);
  drawPerson16Bit(x,658,150,{shirt:'#2563EB',pants:'#1E293B',hat:'none',sit:true});
}

// =========================================================================
// LỚP 4 (y: 204..258): 4 ĐẢO GIỮA CHỢ Y-SORTED VỚI HEO & DU KHÁCH
// =========================================================================
function drawForegroundIslands(x){
  // Đảo 1 (x: 34..148): Sạp Lưu Niệm Nón Lá, Lồng Đèn & Heo Đất
  R(x,34,244,114,4,'rgba(43,33,24,0.24)');
  R(x,34,212,114,34,INK);R(x,35,213,112,12,'#D89C5C');R(x,35,225,112,20,'#8C5832');
  // Nón lá thêu, lồng đèn lụa đỏ-vàng & heo đất trên mặt đảo
  [44,68,92].forEach(function(nx){E(x,nx,216,7,3,INK);E(x,nx,216,6,2,'#F7DF94');R(x,nx-1,215,2,1,'#EC4899');});
  E(x,116,214,5,5,INK);E(x,116,214,4,4,'#E0452B');E(x,132,214,5,5,INK);E(x,132,214,4,4,'#F4B93B');

  // Đảo 2 (x: 188..332): Sạp Trái Cây Nhiệt Đới "1029 NGỌC HẢO"
  R(x,188,246,144,4,'rgba(43,33,24,0.24)');
  R(x,188,210,144,38,INK);R(x,189,211,142,14,'#E5C29F');R(x,189,225,142,22,'#0F766E');
  pxText(x,'1029 NGOC HAO',226,232,'#FEF08A',1);
  // Tháp Bưởi xanh có lá, Xoài vàng, Thanh long đỏ, Sầu riêng gai
  for(var r=0;r<3;r++)for(var c=0;c<3-r;c++){E(x,198+c*7+r*3,216-r*5,3,3,INK);E(x,198+c*7+r*3,216-r*5,2,2,'#4ADE80');}
  for(var r2=0;r2<3;r2++)for(var c2=0;c2<3-r2;c2++){E(x,232+c2*7+r2*3,216-r2*5,3,3,INK);E(x,232+c2*7+r2*3,216-r2*5,2,2,'#FACC15');}
  for(var r3=0;r3<3;r3++)for(var c3=0;c3<3-r3;c3++){E(x,266+c3*7+r3*3,216-r3*5,3,3,INK);E(x,266+c3*7+r3*3,216-r3*5,2,2,'#EC4899');}
  [302,314].forEach(function(dx){E(x,dx,214,4,5,INK);E(x,dx,214,3,4,'#84CC16');});

  // Đảo 3 (x: 368..516): Bàn Ăn Khu Ẩm Thực 1 (Bún Bò, Bánh Xèo, Chè Ba Màu + 3 Thực khách 14x22)
  R(x,374,244,136,4,'rgba(43,33,24,0.24)');
  drawPerson16Bit(x,390,224,{shirt:'#E0452B',pants:'#1E293B',hat:'none',sit:true});
  drawPerson16Bit(x,442,224,{shirt:'#38BDF8',pants:'#334155',hat:'nonla',sit:true});
  drawPerson16Bit(x,486,224,{shirt:'#F59E0B',pants:'#1F2937',hat:'cap',sit:true});
  // Mặt bàn gỗ dài bày rõ tô bún, đĩa bánh xèo, 3 ly chè ba màu & bình trà đá
  R(x,374,216,136,18,INK);R(x,375,217,134,12,'#D89C5C');R(x,375,229,134,4,'#8C5832');
  R(x,382,234,6,10,INK);R(x,496,234,6,10,INK); // chân bàn
  // 2 Tô Bún Bò bốc khói, Đĩa Bánh Xèo vàng, 3 Ly Chè Ba Màu
  [390,442].forEach(function(bx){E(x,bx,222,5,3,INK);E(x,bx,222,4,2,'#FFFBF1');R(x,bx-2,221,4,1,'#EA580C');});
  E(x,418,222,6,3,INK);E(x,418,222,5,2,'#FACC15');
  [468,478,488].forEach(function(cx3){R(x,cx3,218,4,6,INK);R(x,cx3+1,219,2,2,'#E0452B');R(x,cx3+1,221,2,2,'#4ADE80');});

  // Đảo 4 (x: 548..688): Bàn Ăn Khu Ẩm Thực 2 (Đá mài Bánh Bèo, Nem Chả & Sinh Tố + 2 Thực khách)
  R(x,556,244,124,4,'rgba(43,33,24,0.24)');
  drawPerson16Bit(x,580,224,{shirt:'#10B981',pants:'#1E293B',hat:'bun',sit:true});
  drawPerson16Bit(x,644,224,{shirt:'#EC4899',pants:'#374151',hat:'none',sit:true});
  R(x,556,216,124,18,INK);R(x,557,217,122,12,'#DFC484');R(x,557,229,122,4,'#9A7B4F');
  R(x,564,234,6,10,INK);R(x,666,234,6,10,INK);
  // Khay 4 chén bánh bèo & 2 ly sinh tố cắm ống hút
  [574,584,594,604].forEach(function(px3){R(x,px3,221,6,3,'#FFFFFF');R(x,px3+2,221,2,1,'#EA580C');});
  [634,650].forEach(function(sx3){R(x,sx3,217,5,7,INK);R(x,sx3+1,218,3,5,'#F472B6');R(x,sx3+2,214,1,3,'#FFFBF1');});
}

var MK={bg:null,islands:null,t:0,last:0,dt:0,run:false};

function buildMarketInterior(){
  var bg=document.createElement('canvas');bg.width=WORLD_W;bg.height=WORLD_H;
  var x=bg.getContext('2d');x.imageSmoothingEnabled=false;

  // LỚP 1: MÁI VÒM BÊ TÔNG CONG PARABOL & Ô GIẾNG TRỜI ĐỎ NÂU (y: 0..56)
  R(x,0,0,WORLD_W,56,'#3B2D24');
  for(var gx=0;gx<WORLD_W;gx+=8)R(x,gx,0,1,54,'rgba(0,0,0,0.22)');
  for(var gy=0;gy<54;gy+=6)R(x,0,gy,WORLD_W,1,'rgba(0,0,0,0.22)');
  for(var sk=24;sk<WORLD_W;sk+=90){
    R(x,sk,3,50,24,'#D97A54');R(x,sk+2,5,46,20,'#FBE6C4');
    for(var nx=sk+10;nx<sk+50;nx+=10)R(x,nx,3,1,24,'#9E4B32');
    R(x,sk,11,50,1,'#9E4B32');R(x,sk,19,50,1,'#9E4B32');
  }
  // Dầm vòm bê tông cong parabol
  for(var tx=0;tx<WORLD_W;tx+=90){
    R(x,tx,0,8,56,'#D99B38');R(x,tx+1,0,2,56,'#F5CA72');R(x,tx+6,0,2,56,'#8C5C18');
    for(var k=0;k<18;k++){
      var archY=Math.round(30-(k*k)*0.08);
      R(x,tx+8+k*2,archY,3,4,'#D99B38');R(x,tx+82-k*2,archY,3,4,'#D99B38');
    }
  }
  R(x,0,54,WORLD_W,2,INK);
  R(x,0,56,WORLD_W,90,'#E6D6BE');

  // LỚP 3: SÀN GẠCH HÀNH LANG CHỢ (y: 144..280)
  for(var fx=0;fx<WORLD_W;fx+=16){
    for(var fy=144;fy<WORLD_H;fy+=12){
      var alt=((fx/16)+(fy/12))%2===0;
      R(x,fx,fy,16,12,alt?'#CBB094':'#BC9C7E');
      R(x,fx,fy,16,1,'rgba(75,52,36,0.22)');
      R(x,fx,fy,1,12,'rgba(75,52,36,0.22)');
    }
  }
  R(x,0,158,WORLD_W,4,'#7E5640');R(x,0,188,WORLD_W,4,'#7E5640');
  R(x,0,144,WORLD_W,1,INK);

  // LỚP 2: 4 PHÂN KHU SẠP HÀNG 3D CHI TIẾT
  drawZone1Gate(x);
  drawZone2Specialty(x);
  drawZone3FoodCourt(x);
  drawZone4HotFood(x);
  MK.bg=bg;

  // LỚP 4: TÁCH RIÊNG OFFSCREEN 4 ĐẢO GIỮA CHỢ ĐỂ Y-SORT VỚI HEO
  var isl=document.createElement('canvas');isl.width=WORLD_W;isl.height=WORLD_H;
  var ix=isl.getContext('2d');ix.imageSmoothingEnabled=false;
  drawForegroundIslands(ix);
  MK.islands=isl;
}

function drawLiveMarketEffects(x,t){
  try{
    // 1. Tia nắng xiên từ giếng trời & Quầng sáng đèn ấm
    x.save();
    x.globalAlpha=0.11;
    for(var sk=30;sk<WORLD_W;sk+=90){
      for(var dy=0;dy<90;dy+=3){R(x,sk+Math.round(dy*0.25),26+dy,32,3,'#FFF6D6');}
    }
    x.globalAlpha=0.20+Math.sin(t*3)*0.04;
    [208,298].forEach(function(lx){E(x,lx,50,12,9,'#FFE08A');});
    R(x,52,65,102,12,'#FDBA74');
    x.restore();
    // 2. Quạt lồng sắt quay mượt 60fps
    [416,580,664].forEach(function(fx){
      E(x,fx,68,6,6,INK);E(x,fx,68,5,5,'#334155');
      var sp=Math.max(1,Math.round(Math.abs(Math.sin(t*10+fx))*5));
      R(x,fx-sp,67,sp*2,2,'#CBD5E1');
    });
    // 3. Hơi nóng bốc lên từ Nồi nước lèo Sạp 1044, Nồi Bánh Cuốn & 2 Tô Bún Đảo Bàn Ăn
    [[384,88],[565,88],[390,218],[442,218]].forEach(function(pt){
      for(var i=0;i<3;i++){
        var p=((t*0.95+i*0.33)%1);
        var sy=pt[1]-Math.round(p*14), stx=pt[0]+Math.round(Math.sin(t*4+i*2)*1.6);
        x.save();x.globalAlpha=0.72*(1-p);R(x,stx,sy,2,2,'#FFFBF1');x.restore();
      }
    });
  }catch(_e){}
}

function getWalkingShoppers(t){
  return [
    {y:172,x:((t*15+40)%680),shirt:'#E0452B',pants:'#1E293B',hat:'nonla',bag:'#FFFBF1'},
    {y:186,x:680-((t*13+210)%680),shirt:'#38BDF8',pants:'#334155',hat:'cap',bag:'#F4B93B'},
    {y:262,x:((t*16+360)%680),shirt:'#10B981',pants:'#1F2937',hat:'bun',bag:'#EC4899'}
  ];
}

function drawWalkingShoppers(x,t,minY,maxY){
  getWalkingShoppers(t).forEach(function(w){
    if(w.y<minY||w.y>=maxY)return;
    drawPerson16Bit(x,Math.round(w.x),Math.round(w.y),{
      shirt:w.shirt,pants:w.pants,hat:w.hat,bag:w.bag,step:((t*6)|0)%2
    });
  });
}

function mkDraw(t){
  var x=MK.x;
  var dt=Math.min(0.05,MK.dt||0.016);
  var rm=window.__openRoom?window.__openRoom.state:null;
  if(window.__openRoom) window.__openRoom.step(dt,performance.now());
  var camX=rm?Math.round(rm.camX):0;
  var camY=rm?Math.round(rm.camY):16;

  x.save();
  x.translate(-camX,-camY);
  x.drawImage(MK.bg,0,0);
  drawLiveMarketEffects(x,t);

  // Y-Sorting 2.5D giữa Chú Heo, Du khách đi bộ & 4 Đảo Giữa Chợ (ngưỡng đảo y = 236)
  var pigY=rm?rm.y:174;
  var ISLAND_Y=236;

  drawWalkingShoppers(x,t,0,Math.min(pigY,ISLAND_Y));
  if(pigY<ISLAND_Y){
    if(rm){
      var px=Math.round(rm.x-12), jumpY=(rm.action==='jump_joy'?-Math.abs(Math.sin(t*10))*4:0), py=Math.round(rm.y-20+jumpY);
      R(x,px+4,Math.round(rm.y)-1,16,2,'rgba(43,33,24,0.28)');
      hpx.clearRect(0,0,24,20);
      drawPigSprite(hpx,{pose:rm.walking?'walk':(rm.action==='eat_snack'?'eat':'stand'),frame:rm.walking?(((t*6)|0)%2):0,happy:Boolean(rm.action),blink:(t%4)<0.15,tail:Math.floor(t*3)%2===1});
      x.save();
      if(rm.facing<0){x.translate(px+24,py);x.scale(-1,1);x.drawImage(hp,0,0,24,20,0,0,24,20);}
      else x.drawImage(hp,0,0,24,20,px,py,24,20);
      x.restore();
    }
    drawWalkingShoppers(x,t,pigY,ISLAND_Y);
    x.drawImage(MK.islands,0,0);
    drawWalkingShoppers(x,t,ISLAND_Y,999);
  }else{
    drawWalkingShoppers(x,t,0,ISLAND_Y);
    x.drawImage(MK.islands,0,0);
    drawWalkingShoppers(x,t,ISLAND_Y,pigY);
    if(rm){
      var px2=Math.round(rm.x-12), jumpY2=(rm.action==='jump_joy'?-Math.abs(Math.sin(t*10))*4:0), py2=Math.round(rm.y-20+jumpY2);
      R(x,px2+4,Math.round(rm.y)-1,16,2,'rgba(43,33,24,0.28)');
      hpx.clearRect(0,0,24,20);
      drawPigSprite(hpx,{pose:rm.walking?'walk':(rm.action==='eat_snack'?'eat':'stand'),frame:rm.walking?(((t*6)|0)%2):0,happy:Boolean(rm.action),blink:(t%4)<0.15,tail:Math.floor(t*3)%2===1});
      x.save();
      if(rm.facing<0){x.translate(px2+24,py2);x.scale(-1,1);x.drawImage(hp,0,0,24,20,0,0,24,20);}
      else x.drawImage(hp,0,0,24,20,px2,py2,24,20);
      x.restore();
    }
    drawWalkingShoppers(x,t,pigY,999);
  }
  x.restore();

  if(window.__openRoom) window.__openRoom.drawOverlays(x,performance.now());
  R(x,0,0,MK.w,1,INK);R(x,0,MK.h-1,MK.w,1,INK);
}

function mkFrame(now){
  if(!MK.run)return;
  var dt=Math.min(0.05,(now-MK.last)/1000);MK.last=now;MK.dt=dt;MK.t+=dt;
  mkDraw(MK.t);requestAnimationFrame(mkFrame);
}

window.__mkGo=function(zoneIdx){
  var targets=[{x:92,y:174},{x:266,y:174},{x:446,y:174},{x:626,y:174}];
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

function mkStart(){
  var cv=document.getElementById('mkCv');
  MK.c=cv;MK.x=cv.getContext('2d');MK.x.imageSmoothingEnabled=false;
  MK.w=VW;MK.h=VH;
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
      <View style={styles.canvasFrame}>
        {Platform.OS === 'web' ? (
          <iframe
            ref={iframeRef}
            srcDoc={htmlContent}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' } as any}
            title="Không gian Chợ Bến Thành"
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
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasFrame: {
    width: '100%',
    maxHeight: '100%',
    aspectRatio: 208 / 240,
    borderWidth: 3,
    borderColor: '#2B2118',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#3A2D25',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  webView: {
    flex: 1,
    width: '100%',
    backgroundColor: '#3A2D25',
  },
});
