import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
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
 * Không Gian Nội Thất Lòng Chợ Bến Thành 16-Bit Liền Mạch (576×144 trên khung nhìn 192×112 — Quyết định 205)
 * Tái hiện 3 phân khu từ 4 ảnh thực tế theo chuẩn Senior Pixel Artist 10YOE:
 * - Trần vòm giàn thép vàng ô lấy sáng trời (Ảnh 1) + đèn tuýp & quạt trần xanh (Ảnh 4).
 * - Khu 1 (0..176): Sạp Vải, Túi Xách, Nón Lá & Quạt Giấy "HƯƠNG TRINH" (Ảnh 1).
 * - Khu 2 (176..344): Sạp Thủ Công Mỹ Nghệ, Sơn Mài & Tượng Lưu Niệm đèn LED ấm (Ảnh 3).
 * - Khu 3 (344..500): Sạp Trái Cây Nhiệt Đới "1029 NGỌC HẢO" tháp bưởi/xoài/sầu riêng (Ảnh 4).
 * - Khu 4 (500..576): Cổng Vòm Ra Quán Quen (fastDash 300ms quay về Cửa Nam).
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
  const [toastText, setToastText] = useState<string>('Chợ Bến Thành · Kéo ngang hoặc chạm sạp để dạo chợ');

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
      if (d.text) setToastText(String(d.text));
      if (d.id === 'stall_fabric' && onSelectZoneFromCanvas) onSelectZoneFromCanvas(0);
      else if (d.id === 'stall_souvenir' && onSelectZoneFromCanvas) onSelectZoneFromCanvas(1);
      else if (d.id === 'stall_fruit' && onSelectZoneFromCanvas) onSelectZoneFromCanvas(2);
      else if (d.id === 'exit_market' && d.userTriggered && onExitToMap) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
        exitTimerRef.current = setTimeout(() => {
          onExitToMap();
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
        worldWidth: 576,
        worldHeight: 144,
        viewWidth: 192,
        viewHeight: 112,
        walkBounds: { minX: 20, maxX: 556, minY: 98, maxY: 136 },
        initialX: 96,
        initialY: 114,
        initialCamX: 0,
        initialCamY: 10,
        speed: 44,
        hotspots: [
          {
            id: 'stall_fabric',
            x: 12,
            y: 38,
            w: 152,
            h: 62,
            standX: 92,
            standY: 112,
            standFace: -1,
            actionType: 'check_ledger',
            bubbleText: `Sạp Vải & Nón Lá Hương Trinh · Mua sắm ${shoppingTotalText}`,
          },
          {
            id: 'stall_souvenir',
            x: 180,
            y: 38,
            w: 152,
            h: 62,
            standX: 256,
            standY: 112,
            standFace: 1,
            actionType: 'look_window',
            bubbleText: `Thủ Công Mỹ Nghệ & Sơn Mài · ${visitsCount} điểm quán quen`,
          },
          {
            id: 'stall_fruit',
            x: 348,
            y: 36,
            w: 144,
            h: 64,
            standX: 416,
            standY: 112,
            standFace: 1,
            actionType: 'eat_snack',
            bubbleText: `Trái Cây 1029 Ngọc Hảo · Ăn uống ${foodTotalText}`,
          },
          {
            id: 'exit_market',
            x: 504,
            y: 38,
            w: 64,
            h: 68,
            standX: 534,
            standY: 108,
            standFace: 1,
            actionType: 'jump_joy',
            fastDash: true,
            bubbleText: `Ra Cổng Cửa Nam...`,
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
html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#332C26;display:flex;align-items:center;justify-content:center}
#mkCv{
  width:100%;
  height:100%;
  display:block;
  image-rendering:pixelated;
  image-rendering:-webkit-crisp-edges;
  image-rendering:-moz-crisp-edges;
  image-rendering:crisp-edges;
  cursor:pointer;
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
<canvas id="mkCv" width="192" height="112" role="img" aria-label="Không gian lòng Chợ Bến Thành 3 phân khu: Sạp Vải Hương Trinh, Thủ Công Mỹ Nghệ và Sạp Trái Cây 1029 Ngọc Hảo"></canvas>
<script>
(function(){
'use strict';

var INK='#2B2118';
var WORLD_W=576;
var WORLD_H=144;
var VW=192;
var VH=112;

function R(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function E(c,cx,cy,rx,ry,col){
  c.fillStyle=col;
  for(var dy=-ry;dy<=ry;dy++)for(var dx=-rx;dx<=rx;dx++)if((dx*dx)/(rx*rx)+(dy*dy)/(ry*ry)<=1)c.fillRect(Math.round(cx+dx),Math.round(cy+dy),1,1);
}

// Sprite Heo 24×20 chuẩn Tab Vườn
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

function drawPersonMarket(c,px,py,shirt,pants,hatType){
  R(c,px,py-4,2,4,pants);R(c,px+3,py-4,2,4,pants);
  R(c,px,py-9,5,5,shirt);
  R(c,px+1,py-12,3,3,'#F4C9A0');
  if(hatType==='nonla'){
    R(c,px-1,py-13,7,1,'#E8C56E');R(c,px,py-14,5,1,'#F7DF94');R(c,px+1,py-15,3,1,'#FFF1C2');
  }else if(hatType==='bucket'){
    R(c,px-1,py-13,7,1,'#EAE4D7');R(c,px+1,py-15,3,2,'#D8CFC0');
  }else{
    R(c,px+1,py-13,3,1,INK);
  }
}

var MK={bg:null,t:0,last:0,dt:0,run:false};

function buildMarketInterior(){
  var bg=document.createElement('canvas');bg.width=WORLD_W;bg.height=WORLD_H;
  var x=bg.getContext('2d');x.imageSmoothingEnabled=false;

  // 1. MÁI VÒM CAO CHỢ BẾN THÀNH (y: 0..42) — Khung giàn thép vàng & Ô lấy sáng trời (Ảnh 1 & 4)
  R(x,0,0,WORLD_W,42,'#362D24');
  // Các ô cửa sổ lấy sáng trời màu vàng kem ấm
  for(var sx=16;sx<WORLD_W;sx+=72){
    R(x,sx,4,46,24,'#FBEAC2');
    R(x,sx+2,6,42,20,'#FFF6DC');
    // Nan thép vàng chia ô lấy sáng
    for(var nx=sx+11;nx<sx+46;nx+=11)R(x,nx,4,1,24,'#C98E2B');
    R(x,sx,12,46,1,'#C98E2B');R(x,sx,20,46,1,'#C98E2B');
  }
  // Dầm thép vàng cong nhịp điệu suốt 576px
  for(var tx=0;tx<WORLD_W;tx+=72){
    R(x,tx,0,6,42,'#D49B35');
    R(x,tx+1,0,2,42,'#F5C76B');
    R(x,tx+5,0,2,42,'#8C5E1A');
    // Thanh chéo giàn kèo
    for(var k=0;k<12;k++){
      R(x,tx+6+k*2,4+k*2,3,2,'#D49B35');
      R(x,tx+68-k*2,4+k*2,3,2,'#D49B35');
    }
  }
  R(x,0,40,WORLD_W,2,INK);
  // Tường hậu chợ ấm áp (y: 42..96)
  R(x,0,42,WORLD_W,54,'#EADAC0');

  // 2. SÀN GẠCH MEN HÀNH LANG CHỢ SÁNG BÓNG (y: 96..144 — 48px = 3 hàng gạch 24×16)
  for(var fx=0;fx<WORLD_W;fx+=24){
    for(var fy=96;fy<WORLD_H;fy+=16){
      var alt=((fx/24)+(fy/16))%2===0;
      R(x,fx,fy,24,16,alt?'#EBD8BA':'#DFC8A6');
      R(x,fx,fy,24,1,'rgba(105,78,50,0.22)');
      R(x,fx,fy,1,16,'rgba(105,78,50,0.22)');
      // Ánh sáng hắt nhẹ từ ô lấy sáng mái vòm
      if((fx%72)>=16&&(fx%72)<=56){R(x,fx+3,fy+3,18,10,'rgba(255,248,220,0.22)');}
    }
  }
  R(x,0,96,WORLD_W,1,INK);

  // =========================================================================
  // KHU 1 (x: 0..176): SẠP VẢI, TÚI XÁCH, NÓN LÁ & QUẠT GIẤY "HƯƠNG TRINH" (Ảnh 1)
  // =========================================================================
  // Biển hiệu sạp HƯƠNG TRINH xanh-trắng
  R(x,18,40,76,12,INK);R(x,19,41,74,10,'#FFFBF1');
  R(x,21,43,70,3,'#1D4ED8'); // dải chữ xanh
  R(x,28,47,56,2,'#E0452B');
  // Dãy túi xách & balo đủ màu treo vách trái
  var bagCols=['#E0452B','#2563EB','#F4B93B','#10B981','#EC4899','#6366F1'];
  for(var bx=10;bx<88;bx+=11){
    R(x,bx,54,8,10,INK);R(x,bx+1,55,6,8,bagCols[(bx/11)|0 % bagCols.length]);
    R(x,bx+3,52,2,2,INK); // quai túi
  }
  // Kệ sạp xếp chồng xấp vải lụa nhiều màu (x: 10..96, y: 72..96)
  R(x,10,72,88,24,INK);R(x,11,73,86,23,'#8C5832');
  var fabCols=['#E0452B','#F4B93B','#3B82F6','#EC4899','#2E8B57','#FFFBF1','#9333EA'];
  for(var fy=74;fy<94;fy+=5){
    for(var fx2=13;fx2<93;fx2+=16){
      R(x,fx2,fy,14,4,fabCols[((fx2+fy)/5)|0 % fabCols.length]);
      R(x,fx2,fy+3,14,1,'rgba(0,0,0,0.22)');
    }
  }
  // Nón lá xếp chồng & Quạt giấy màu sắc xòe rộng (x: 106..168)
  for(var ny=52;ny<70;ny+=4){
    R(x,110,ny,16,3,INK);R(x,111,ny+1,14,2,'#F7DF94');
  }
  // Quạt giấy xòe xanh-vàng rực rỡ
  E(x,146,66,15,10,INK);E(x,146,66,14,9,'#38BDF8');E(x,146,68,10,6,'#FDE047');
  R(x,132,68,28,10,'#EADAC0'); // cắt nửa dưới thành hình quạt xòe
  // Quầy hàng trước & 2 ghế nhựa đỏ-xanh + cô chủ sạp
  R(x,112,78,52,18,INK);R(x,113,79,50,17,'#C48B52');
  R(x,100,88,8,8,INK);R(x,101,89,6,6,'#2563EB'); // ghế nhựa xanh
  R(x,158,88,8,8,INK);R(x,159,89,6,6,'#E0452B'); // ghế nhựa đỏ
  drawPersonMarket(x,134,96,'#FFFBF1','#374151','none');

  // =========================================================================
  // KHU 2 (x: 176..344): SẠP THỦ CÔNG MỸ NGHỆ & ĐỒ LƯU NIỆM ĐÈN LED (Ảnh 3)
  // =========================================================================
  R(x,184,42,148,54,INK);R(x,185,43,146,53,'#4A3525'); // tủ gỗ sâu ấm
  // Tầng trên: Giỏ mây tre đan & bình gốm sơn mài
  for(var gx2=190;gx2<322;gx2+=22){
    R(x,gx2,46,16,10,INK);R(x,gx2+1,47,14,8,'#D89C5C'); // giỏ mây tre
    R(x,gx2+3,49,10,1,'#8C5832');R(x,gx2+3,52,10,1,'#8C5832');
  }
  // Tầng giữa: Bình sơn mài xanh-đỏ-vàng & Dải LED vàng ấm rực rỡ
  R(x,187,60,142,2,'#FFF8D6'); // thanh đèn LED trên
  [196,214,232,250,268,286,304].forEach(function(vx,vi){
    var vCol=['#DC2626','#2563EB','#F4B93B','#10B981','#EA580C','#FFFBF1','#7C3AED'][vi%7];
    R(x,vx,64,7,10,INK);R(x,vx+1,65,5,8,vCol);R(x,vx+2,63,3,2,vCol);
  });
  // Tầng dưới: Tủ kính trưng bày tượng Phật/ngọc/lưu niệm hắt sáng LED
  R(x,187,77,142,2,'#FFF8D6'); // thanh đèn LED dưới
  R(x,187,79,142,14,'#2D2520');
  for(var sx3=194;sx3<322;sx3+=14){
    var stCol=(sx3%28===0)?'#F4B93B':'#6EE7B7';
    R(x,sx3,83,6,8,stCol);R(x,sx3+1,81,4,2,stCol); // tượng vàng / ngọc bích
  }
  // 2 du khách (mũ tai bèo & balo) đang đứng xem đồ lưu niệm
  drawPersonMarket(x,224,98,'#F97316','#1F2937','bucket');
  drawPersonMarket(x,240,98,'#FFFBF1','#374151','none');

  // =========================================================================
  // KHU 3 (x: 344..500): SẠP TRÁI CÂY NHIỆT ĐỚI "1029 NGỌC HẢO" (Ảnh 4)
  // =========================================================================
  // Biển hiệu xanh ngọc - vàng "1029 NGỌC HẢO"
  R(x,362,38,118,14,INK);R(x,363,39,116,12,'#E0F2FE');
  R(x,365,41,42,8,'#0F766E'); // số 1029 nổi bật
  R(x,411,42,60,3,'#047857');R(x,411,47,48,2,'#F59E0B');
  // 2 đèn tuýp huỳnh quang treo ngang
  R(x,366,54,48,2,'#FFFFFF');R(x,426,54,48,2,'#FFFFFF');
  // Quầy kệ sạp trái cây & các kim tự tháp trái cây rực rỡ
  R(x,352,74,138,22,INK);R(x,353,75,136,21,'#D8CFC0');
  // Tháp Bưởi xanh (x: 358..392)
  for(var r=0;r<4;r++)for(var c=0;c<4-r;c++){
    E(x,362+c*7+r*3,73-r*5,3,3,INK);E(x,362+c*7+r*3,73-r*5,2,2,'#4ADE80');
  }
  // Tháp Xoài vàng chín (x: 396..428)
  for(var r2=0;r2<4;r2++)for(var c2=0;c2<4-r2;c2++){
    E(x,400+c2*6+r2*3,73-r2*5,3,3,INK);E(x,400+c2*6+r2*3,73-r2*5,2,2,'#FACC15');
  }
  // Thanh long đỏ & Chôm chôm đỏ rực (x: 432..460)
  for(var r3=0;r3<3;r3++)for(var c3=0;c3<3-r3;c3++){
    E(x,436+c3*6+r3*3,73-r3*5,3,3,INK);E(x,436+c3*6+r3*3,73-r3*5,2,2,'#EC4899');
  }
  // Sầu riêng gai xanh rêu (x: 464..486)
  for(var c4=0;c4<3;c4++){
    E(x,468+c4*7,72,3,4,INK);E(x,468+c4*7,72,2,3,'#84CC16');
  }
  drawPersonMarket(x,384,100,'#F43F5E','#1F2937','bucket');

  // =========================================================================
  // KHU 4 (x: 500..576): CỔNG VÒM RA QUÁN QUEN (EXIT PORTAL)
  // =========================================================================
  R(x,516,42,44,8,INK);R(x,517,43,42,6,'#2E6B47'); // biển xanh RA QUÁN QUEN
  R(x,522,45,32,2,'#FFFBF1');
  R(x,514,52,48,44,INK);R(x,515,53,46,43,'#F7E3B5');
  R(x,522,58,32,38,INK);R(x,523,59,30,37,'#8BC6FA'); // ánh sáng bầu trời ngoài cổng
  E(x,538,59,15,8,'#8BC6FA');
  R(x,523,82,30,14,'#D8CDB8'); // vỉa hè ngoài cổng
  // Thảm chào đỏ ngay chân cổng
  R(x,520,97,36,7,INK);R(x,521,98,34,5,'#C94B38');R(x,525,100,26,1,'#F4B93B');

  MK.bg=bg;
}

function drawCeilingFansLive(x,t){
  // Quạt trần xanh lá công nghiệp quay ở Khu 1 và Khu 3 (giống Ảnh 4)
  [120,418].forEach(function(fx){
    R(x,fx,36,2,8,INK);
    E(x,fx+1,44,4,2,'#3E8A58');
    var span=Math.max(2,Math.round(Math.abs(Math.sin(t*7))*12));
    R(x-span,43,span*2+2,2,'#2E6B47');
  });
}

function mkDraw(t){
  var x=MK.x;
  var dt=Math.min(0.05,MK.dt||0.016);
  var rm=window.__openRoom?window.__openRoom.state:null;
  if(window.__openRoom) window.__openRoom.step(dt,performance.now());
  var camX=rm?Math.round(rm.camX):0;
  var camY=rm?Math.round(rm.camY):10;

  x.save();
  x.translate(-camX,-camY);
  x.drawImage(MK.bg,0,0);
  drawCeilingFansLive(x,t);

  // Chú heo 24×20 dạo chợ
  if(rm){
    var px=Math.round(rm.x-12);
    var py=Math.round(rm.y-20+(rm.action==='jump_joy'?-Math.abs(Math.sin(t*10))*4:0));
    hpx.clearRect(0,0,24,20);
    drawPigSprite(hpx,{
      pose:rm.walking?'walk':(rm.action==='eat_snack'?'eat':'stand'),
      frame:rm.walking?(((t*6)|0)%2):0,
      happy:Boolean(rm.action),
      blink:(t%4)<0.15,
      tail:Math.floor(t*3)%2===1
    });
    x.save();
    if(rm.facing<0){x.translate(px+24,py);x.scale(-1,1);x.drawImage(hp,0,0,24,20,0,0,24,20);}
    else x.drawImage(hp,0,0,24,20,px,py,24,20);
    x.restore();
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
  var targets=[{x:92,y:112},{x:256,y:112},{x:416,y:112}];
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
      <View style={styles.toastRow}>
        <Text style={styles.toastText} numberOfLines={1}>
          {toastText}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    marginBottom: 12,
  },
  canvasFrame: {
    width: '100%',
    aspectRatio: 192 / 112,
    borderWidth: 3,
    borderColor: '#2B2118',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#332C26',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  webView: {
    flex: 1,
    width: '100%',
    backgroundColor: '#332C26',
  },
  toastRow: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2B2118',
    backgroundColor: '#FFFBF1',
    alignSelf: 'flex-start',
  },
  toastText: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 12,
    color: '#2B2118',
  },
});
