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
 * Không Gian Lòng Chợ Bến Thành 16-Bit 1:1 Theo 7 Ảnh Thực Tế (680×152 trên viewport 192×112 — Quyết định 208)
 * - Khu 1 (0..156): Cửa Số 1 "WELCOME TO BEN THANH", cửa sắt xếp kem xám, WATCH, 2 chú bảo vệ (exit_market fastDash).
 * - Khu 2 (156..336): Sạp "LIÊN SÀI GÒN" & "NGỌC HOA" dưới mái vòm bê tông vàng, giếng trời đỏ nâu & chao đèn mây tre.
 * - Khu 3 (336..512): Cổng vòm cong chữ đỏ "KHU ĂN UỐNG" & Quầy góc chữ L ốp gạch trắng Sạp 1044 với ghế đẩu inox.
 * - Khu 4 (512..680): Quầy "BÁNH CUỐN 50K" nồi hơi bốc khói, "BÚN BÒ HUẾ" & "BÁNH BÈO 20K" bàn đá mài vàng.
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
  const [toastText, setToastText] = useState<string>('Cửa Số 1 · Chào mừng vào Chợ Bến Thành!');

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
        worldWidth: 680,
        worldHeight: 152,
        viewWidth: 192,
        viewHeight: 112,
        walkBounds: { minX: 20, maxX: 660, minY: 104, maxY: 144 },
        initialX: 82,
        initialY: 120,
        initialCamX: 0,
        initialCamY: 18,
        speed: 44,
        hotspots: [
          {
            id: 'exit_market',
            x: 24,
            y: 12,
            w: 112,
            h: 88,
            standX: 82,
            standY: 112,
            standFace: -1,
            actionType: 'jump_joy',
            fastDash: true,
            bubbleText: `Bước ra Cửa Số 1...`,
          },
          {
            id: 'stall_liensaigon',
            x: 162,
            y: 34,
            w: 166,
            h: 68,
            standX: 246,
            standY: 118,
            standFace: 1,
            actionType: 'check_ledger',
            bubbleText: `Sạp Liên Sài Gòn & Ngọc Hoa · Mua sắm ${shoppingTotalText}`,
          },
          {
            id: 'arch_foodcourt',
            x: 344,
            y: 26,
            w: 160,
            h: 76,
            standX: 422,
            standY: 118,
            standFace: 1,
            actionType: 'look_window',
            bubbleText: `Khu Ăn Uống Sạp 1044 · ${visitsCount} lượt quán quen`,
          },
          {
            id: 'stall_banhcuon_banhbeo',
            x: 520,
            y: 34,
            w: 148,
            h: 68,
            standX: 594,
            standY: 118,
            standFace: 1,
            actionType: 'eat_snack',
            bubbleText: `Bánh Cuốn 50k & Bánh Bèo 20k · Ăn uống ${foodTotalText}`,
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
<canvas id="mkCv" width="192" height="112" role="img" aria-label="Không gian bên trong Chợ Bến Thành 4 khu: Cửa Số 1, Liên Sài Gòn, Khu Ăn Uống và Sạp Bánh Cuốn Bánh Bèo"></canvas>
<script>
(function(){
'use strict';

var INK='#2B2118';
var WORLD_W=680;
var WORLD_H=152;
var VW=192;
var VH=112;

function R(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function E(c,cx,cy,rx,ry,col){
  c.fillStyle=col;
  for(var dy=-ry;dy<=ry;dy++)for(var dx=-rx;dx<=rx;dx++)if((dx*dx)/(rx*rx)+(dy*dy)/(ry*ry)<=1)c.fillRect(Math.round(cx+dx),Math.round(cy+dy),1,1);
}

// Micro-font 3x5 sắc nét cho bảng hiệu Chợ Bến Thành
var MF={
  'A':[2,5,7,5,5],'B':[6,5,6,5,6],'C':[3,4,4,4,3],'D':[6,5,5,5,6],'E':[7,4,6,4,7],'F':[7,4,6,4,4],
  'G':[3,4,5,5,3],'H':[5,5,7,5,5],'I':[7,2,2,2,7],'K':[5,5,6,5,5],'L':[4,4,4,4,7],'M':[5,7,7,5,5],
  'N':[5,7,7,7,5],'O':[2,5,5,5,2],'P':[6,5,6,4,4],'Q':[2,5,5,3,1],'R':[6,5,6,5,5],'S':[3,4,2,1,6],
  'T':[7,2,2,2,2],'U':[5,5,5,5,7],'V':[5,5,5,2,2],'W':[5,5,7,7,5],'X':[5,2,2,2,5],'Y':[5,5,2,2,2],
  '0':[2,5,5,5,2],'1':[2,6,2,2,7],'2':[6,1,2,4,7],'4':[5,5,7,1,1],'5':[7,4,6,1,6],'8':[2,5,2,5,2],'9':[3,5,3,1,6],
  ' ':[0,0,0,0,0],'-':[0,0,7,0,0]
};
function pxText(c,str,x0,y0,col,sc){
  sc=sc||1;
  c.fillStyle=col;
  var cx=Math.round(x0);
  for(var i=0;i<str.length;i++){
    var ch=str.charAt(i).toUpperCase();
    var g=MF[ch]||MF[' '];
    for(var r=0;r<5;r++){
      var row=g[r];
      for(var b=0;b<3;b++){
        if((row>>(2-b))&1) c.fillRect(cx+b*sc,Math.round(y0)+r*sc,sc,sc);
      }
    }
    cx+=4*sc;
  }
}

// Sprite Heo 24x20 chuẩn Tab Vườn
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

function drawPerson(c,px,py,shirt,pants,hat,sit){
  R(c,px-1,py-1,7,2,'rgba(43,33,24,0.24)');
  if(sit){
    R(c,px,py-3,5,3,pants);R(c,px,py-8,5,5,shirt);R(c,px+1,py-11,3,3,'#F4C9A0');
  }else{
    R(c,px,py-4,2,4,pants);R(c,px+3,py-4,2,4,pants);
    R(c,px,py-9,5,5,shirt);R(c,px+1,py-12,3,3,'#F4C9A0');
  }
  var hy=sit?py-12:py-13;
  if(hat==='nonla'){R(c,px-1,hy,7,1,'#E8C56E');R(c,px,hy-1,5,1,'#F7DF94');R(c,px+1,hy-2,3,1,'#FFF1C2');}
  else if(hat==='cap'){R(c,px,hy,5,1,'#1F2937');R(c,px+1,hy-1,3,1,'#374151');}
  else{R(c,px+1,hy,3,1,INK);}
}

function drawInoxStool(c,sx,sy){
  R(c,sx-1,sy+5,8,2,'rgba(43,33,24,0.22)');
  R(c,sx,sy,6,2,INK);R(c,sx+1,sy,4,1,'#E2E8F0'); // mặt inox bóng
  R(c,sx+1,sy+2,1,4,'#64748B');R(c,sx+4,sy+2,1,4,'#64748B');
}

var MK={bg:null,t:0,last:0,dt:0,run:false};

function buildMarketInterior(){
  var bg=document.createElement('canvas');bg.width=WORLD_W;bg.height=WORLD_H;
  var x=bg.getContext('2d');x.imageSmoothingEnabled=false;

  // =========================================================================
  // 1. TRẦN VÒM BÊ TÔNG VÀNG & Ô GIẾNG TRỜI ĐỎ NÂU SUỐT 680px (Ảnh 1, 2, 3)
  // =========================================================================
  R(x,0,0,WORLD_W,44,'#3B2D24');
  // Lưới ngói trần sẫm
  for(var gx=0;gx<WORLD_W;gx+=8)R(x,gx,0,1,42,'rgba(0,0,0,0.22)');
  for(var gy=0;gy<42;gy+=6)R(x,0,gy,WORLD_W,1,'rgba(0,0,0,0.22)');
  // Các ô giếng trời lấy sáng đỏ nâu ấm giữa mái vòm (y: 2..24)
  for(var sk=24;sk<WORLD_W;sk+=84){
    R(x,sk,2,46,20,'#E08A68');
    R(x,sk+2,4,42,16,'#FBE3C0');
    for(var nx=sk+10;nx<sk+46;nx+=9)R(x,nx,2,1,20,'#9E4B32');
    R(x,sk,9,46,1,'#9E4B32');R(x,sk,16,46,1,'#9E4B32');
  }
  // Hệ dầm vòm bê tông vàng đất đặc trưng (#D99B38)
  for(var tx=0;tx<WORLD_W;tx+=84){
    R(x,tx,0,7,44,'#D99B38');R(x,tx+1,0,2,44,'#F3C46B');R(x,tx+5,0,2,44,'#8C5C18');
    for(var k=0;k<14;k++){
      R(x,tx+7+k*2,4+k*2,3,2,'#D99B38');
      R(x,tx+77-k*2,4+k*2,3,2,'#D99B38');
    }
  }
  R(x,0,42,WORLD_W,2,INK);
  // Tường nền chợ (y: 44..102)
  R(x,0,44,WORLD_W,58,'#E6D6BE');

  // =========================================================================
  // 2. SÀN GẠCH HÀNH LANG CHỢ BẾN THÀNH (y: 102..152 — Ảnh 2, 4, 5, 7)
  // =========================================================================
  for(var fx=0;fx<WORLD_W;fx+=16){
    for(var fy=102;fy<WORLD_H;fy+=10){
      var alt=((fx/16)+(fy/10))%2===0;
      R(x,fx,fy,16,10,alt?'#C9AC90':'#B9987B');
      R(x,fx,fy,16,1,'rgba(75,52,36,0.22)');
      R(x,fx,fy,1,10,'rgba(75,52,36,0.22)');
    }
  }
  // Hai dải gạch dẫn hướng màu nâu đỏ sẫm dọc hành lang (y: 112..116 & 134..138)
  R(x,0,112,WORLD_W,4,'#7E5640');R(x,0,134,WORLD_W,4,'#7E5640');
  R(x,0,102,WORLD_W,1,INK);

  // =========================================================================
  // KHU 1 (x: 0..156): CỬA SỐ 1 · WELCOME TO BEN THANH MARKET (Ảnh 7)
  // =========================================================================
  // Tủ kính WATCH bên trái
  R(x,2,44,24,58,INK);R(x,3,45,22,57,'#F8FAFC');
  R(x,4,47,20,8,'#DC2626');pxText(x,'WATCH',4,49,'#FFFFFF',1);
  R(x,5,60,18,22,'#DCEEFA'); // mặt kính
  // Hai cánh cửa sắt xếp kem xám thu gọn 2 bên
  for(var gx7=26;gx7<38;gx7+=3){R(x,gx7,44,2,58,'#D8D4C8');R(x,gx7+2,44,1,58,'#6B665C');}
  for(var gx8=130;gx8<142;gx8+=3){R(x,gx8,44,2,58,'#D8D4C8');R(x,gx8+2,44,1,58,'#6B665C');}
  // Hoa sắt vòm trên & Biển xanh dương CỬA SỐ 1
  R(x,38,44,92,8,'#9CA3AF');
  R(x,70,40,28,12,INK);R(x,71,41,26,10,'#1E3A8A');
  pxText(x,'CUA 1',74,44,'#FFFFFF',1);
  // Bảng LED đen viền cam: WELCOME TO BEN THANH
  R(x,38,53,92,13,INK);R(x,39,54,90,11,'#EA580C');R(x,40,55,88,9,'#18181B');
  pxText(x,'WELCOME BEN THANH',48,57,'#FFF8D6',1);
  // Hộp đèn EXIT xanh lá nhỏ
  R(x,110,67,16,6,INK);R(x,111,68,14,4,'#16A34A');
  // Sạp quần áo nhỏ phía sau cổng & 2 chú bảo vệ áo sơ mi trắng bên phải
  R(x,44,72,64,30,'#4B3C32');
  ['#E0452B','#2563EB','#F4B93B','#10B981','#FFFBF1'].forEach(function(sc,si){
    R(x,48+si*11,76,8,14,sc);
  });
  drawPerson(x,118,104,'#FFFBF1','#1E293B','none',false); // Chú bảo vệ 1
  drawPerson(x,129,104,'#FFFBF1','#1E293B','none',false); // Chú bảo vệ 2
  // Ghế nhựa đỏ bên trái cổng
  R(x,32,96,7,6,INK);R(x,33,97,5,4,'#DC2626');

  // =========================================================================
  // KHU 2 (x: 156..336): SẠP ĐẶC SẢN LIÊN SÀI GÒN & NGỌC HOA (Ảnh 1 & 3)
  // =========================================================================
  // Biển xanh lá - trắng "LIÊN SÀI GÒN" (Sạp 1189)
  R(x,162,46,84,15,INK);R(x,163,47,82,13,'#FFFFFF');
  R(x,164,48,80,11,'#15803D');
  pxText(x,'LIEN SAI GON',170,51,'#FFFFFF',1);
  // Dãy bóng đèn tròn trắng thả dọc mép biển
  for(var bx=166;bx<242;bx+=9){R(x,bx,62,2,2,'#FFF8D6');}
  // Kệ trà, cà phê, bánh kẹo xếp tầng cao
  R(x,162,65,84,37,INK);R(x,163,66,82,36,'#5C4332');
  for(var row=0;row<3;row++){
    for(var jx=166;jx<240;jx+=7){
      var jCol=['#DC2626','#F4B93B','#16A34A','#2563EB','#FFFBF1','#EA580C'][((jx+row)%6)];
      R(x,jx,68+row*10,5,7,jCol);
    }
  }
  // Biển trắng chữ đỏ/xanh "NGỌC HOA 823" bên cạnh
  R(x,252,46,76,15,INK);R(x,253,47,74,13,'#F8FAFC');
  pxText(x,'NGOC HOA 823',258,51,'#DC2626',1);
  R(x,252,63,76,39,INK);R(x,253,64,74,38,'#47382E');
  // Tủ kính & nón lá, giỏ mây tre đan
  for(var kx=257;kx<320;kx+=12){
    R(x,kx,68,9,9,'#E5BA7E');R(x,kx,82,8,12,'#DCEEFA');
  }
  // Chao đèn mây tre đan thả từ trần vòm ở Khu 2 (Ảnh 3)
  [196, 268, 316].forEach(function(lx){
    R(x,lx,28,1,12,INK);
    R(x,lx-6,40,13,5,INK);R(x,lx-5,41,11,3,'#C99A5B');R(x,lx-2,42,5,2,'#FFF8D6');
  });
  drawPerson(x,182,106,'#92400E','#1F2937','none',true); // Cô chủ sạp ngồi ghế nhựa xanh
  drawPerson(x,288,108,'#FFFBF1','#4B6FA5','nonla',false); // Du khách xem hàng

  // =========================================================================
  // KHU 3 (x: 336..512): CỔNG VÒM "KHU ĂN UỐNG" & QUẦY CHỮ L SẠP 1044 (Ảnh 2 & 5)
  // =========================================================================
  // Cổng vòm cong chữ đỏ "KHU ĂN UỐNG" bắc ngang (x: 350..428, y: 26..54)
  R(x,350,30,78,24,INK);R(x,351,31,76,22,'#EDE9E0');
  R(x,362,42,54,12,'#3A2D25');E(x,389,44,24,8,'#3A2D25');
  pxText(x,'KHU AN UONG',366,34,'#991B1B',1);
  // Biển vàng "BÚN BÒ - MÌ QUẢNG" Sạp 1044 (x: 434..504)
  R(x,434,42,68,14,INK);R(x,435,43,66,12,'#FACC15');
  pxText(x,'BUN BO 1044',441,47,'#991B1B',1);
  // Quầy góc chữ L ốp gạch trắng & tủ kính sáng đèn LED (Ảnh 5)
  R(x,352,62,148,40,INK);R(x,353,63,146,16,'#E0F2FE'); // tủ kính đồ ăn sáng trưng
  R(x,353,79,146,23,'#F1F5F9'); // ốp gạch men trắng
  // Hình ảnh món ăn dán dọc mặt trước tủ kính
  for(var mx=358;mx<490;mx+=16){
    R(x,mx,82,12,8,'#FFFBF1');R(x,mx+2,83,8,6,['#E0452B','#F59E0B','#10B981'][((mx/16)|0)%3]);
  }
  // Chùm 3 trái dừa tươi xanh ngay góc quầy (Ảnh 5)
  E(x,448,74,4,4,INK);E(x,448,74,3,3,'#4D7C0F');
  E(x,455,74,4,4,INK);E(x,455,74,3,3,'#65A30D');
  // Hàng ghế đẩu inox sáng bóng trước quầy chữ L (y: 103)
  [364, 382, 400, 418, 438, 466, 484].forEach(function(sx){
    drawInoxStool(x,sx,103);
  });
  drawPerson(x,382,102,'#18181B','#1E293B','none',true); // Khách ngồi ăn 1
  drawPerson(x,466,102,'#FFFBF1','#374151','cap',true);  // Khách ngồi ăn 2

  // =========================================================================
  // KHU 4 (x: 512..680): BÁNH CUỐN NÓNG 50K, BÚN BÒ HUẾ & BÁNH BÈO 20K (Ảnh 4 & 6)
  // =========================================================================
  // Biển vàng "BÁNH CUỐN 50K"
  R(x,516,42,58,15,INK);R(x,517,43,56,13,'#FEF08A');
  pxText(x,'BANH CUON 50',520,47,'#B91C1C',1);
  // Quầy gạch bông & nồi hơi tráng bánh cuốn (x: 516..574)
  R(x,516,64,58,38,INK);R(x,517,65,56,14,'#DCEEFA');R(x,517,79,56,23,'#E2E8F0');
  R(x,524,69,14,9,INK);R(x,525,70,12,7,'#CBD5E1'); // nồi hơi inox
  drawPerson(x,548,80,'#84CC16','#1F2937','none',false); // Cô bán bánh cuốn áo xanh chuối
  // Biển vàng chữ đỏ "BÚN BÒ HUẾ" nhỏ ở giữa
  R(x,578,42,34,13,INK);R(x,579,43,32,11,'#FDE047');
  pxText(x,'BUN BO',582,46,'#DC2626',1);

  // Quầy "BÁNH BÈO HUẾ 20.000đ/Dĩa" (x: 614..676 — Ảnh 6)
  R(x,614,40,62,16,INK);R(x,615,41,60,14,'#FFFFFF');
  pxText(x,'BANH BEO 20K',619,45,'#1D4ED8',1);
  // Mặt bàn đá mài vàng (Terrazzo #DFC484) & Tủ kính xếp dĩa bánh bèo + Nem chua lá chuối
  R(x,612,66,64,36,INK);R(x,613,67,62,12,'#DCEEFA');
  R(x,612,79,64,23,'#DFC484'); // đá mài vàng
  // Dĩa bánh bèo trắng & Chồng nem chua hồng-xanh
  [618,628,638].forEach(function(px2){R(x,px2,73,8,3,'#FFFFFF');R(x,px2+2,72,4,1,'#22C55E');});
  R(x,650,70,18,8,'#F472B6');R(x,652,71,14,2,'#22C55E'); // nem chua lá chuối
  // Nón lá treo vách sau & Thực khách ngồi ghế inox
  E(x,660,59,4,2,'#F7DF94');
  drawInoxStool(x,536,103);drawInoxStool(x,634,103);
  drawPerson(x,634,102,'#2563EB','#1E293B','none',true);

  MK.bg=bg;
}

function drawLiveMarketEffects(x,t){
  // 1. Quạt lồng sắt công nghiệp quay (Ảnh 4 & 5)
  [390,545,620].forEach(function(fx){
    E(x,fx,58,5,5,INK);E(x,fx,58,4,4,'#334155');
    var sp=Math.max(1,Math.round(Math.abs(Math.sin(t*9+fx))*4));
    R(x-sp,57,sp*2,2,'#94A3B8');
  });
  // 2. Hơi nóng bốc lên từ nồi Bánh Cuốn (x=531) & Bún Bò (x=462)
  [462,531].forEach(function(sx){
    for(var i=0;i<3;i++){
      var p=((t*0.9+i*0.33)%1);
      var sy=68-Math.round(p*12), stx=sx+Math.round(Math.sin(t*4+i*2)*1.5);
      x.save();x.globalAlpha=0.7*(1-p);R(x,stx,sy,2,2,'#FFFBF1');x.restore();
    }
  });
}

function mkDraw(t){
  var x=MK.x;
  var dt=Math.min(0.05,MK.dt||0.016);
  var rm=window.__openRoom?window.__openRoom.state:null;
  if(window.__openRoom) window.__openRoom.step(dt,performance.now());
  var camX=rm?Math.round(rm.camX):0;
  var camY=rm?Math.round(rm.camY):18;

  x.save();
  x.translate(-camX,-camY);
  x.drawImage(MK.bg,0,0);
  drawLiveMarketEffects(x,t);

  // Chú heo 24x20 dạo chợ
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
  var targets=[{x:82,y:118},{x:246,y:118},{x:422,y:118},{x:594,y:118}];
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
    backgroundColor: '#3A2D25',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  webView: {
    flex: 1,
    width: '100%',
    backgroundColor: '#3A2D25',
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
