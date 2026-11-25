import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { PixelIconStar } from '../pixel/PixelIcons';
import { useTransactionStore } from '../../store/transactionStore';
import { buildOpenRoomEngineScript } from '../pixel/pixelOpenRoomEngine';

const SafeWebView = WebView as unknown as React.ComponentType<any>;

export interface StreetStall {
  name: string;
  price: string;
  kind: 'food' | 'souvenir';
}

export const BEN_THANH_STALLS: StreetStall[] = [
  { name: 'Phở bò', price: '55k', kind: 'food' },
  { name: 'Bún bò', price: '50k', kind: 'food' },
  { name: 'Trà đá vỉa hè', price: '5k', kind: 'food' },
  { name: 'Cà phê bệt', price: '25k', kind: 'food' },
  { name: 'Bánh mì', price: '25k', kind: 'food' },
  { name: 'Cơm tấm', price: '45k', kind: 'food' },
  { name: 'Bánh xèo', price: '40k', kind: 'food' },
  { name: 'Chè Ba Màu', price: '20k', kind: 'food' },
  { name: 'Nón lá & Áo dài', price: '120k', kind: 'souvenir' },
  { name: 'Gốm & Sơn mài', price: '150k', kind: 'souvenir' },
  { name: 'Bánh pía & Cà phê', price: '95k', kind: 'souvenir' },
  { name: 'Lồng đèn & Heo đất', price: '80k', kind: 'souvenir' },
];

interface BenThanhStreetBannerWebViewProps {
  active?: boolean;
  onEnterMarket?: () => void;
}

/**
 * Banner Phố Ẩm Thực & Đồ Lưu Niệm Chợ Bến Thành Cuộn Ngang (WORLD_W = 584px, Viewport = 192×100)
 * Port 1:1 tinh thần pbStatic/pbDraw từ prototype Ví Heo Con 24_11.html + MASTER-PROMPTS PLAN 18/19,
 * mở rộng toàn con phố Chợ Bến Thành: khi heo đi tới mép trái/phải, camera trượt mượt sang các dãy quán khác!
 */
export const BenThanhStreetBannerWebView: React.FC<BenThanhStreetBannerWebViewProps> = ({
  active = true,
  onEnterMarket,
}) => {
  const webViewRef = useRef<any>(null);
  const iframeRef = useRef<any>(null);
  const enterMarketTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { transactions } = useTransactionStore();
  const realPlacesCount = useMemo(
    () =>
      transactions.filter(
        (t) => (t.status === 'CONFIRMED' || !t.status) && ((t.lat != null && t.lng != null) || Boolean(t.location_name))
      ).length,
    [transactions]
  );
  const [selectedStallIdx, setSelectedStallIdx] = useState(0);
  const [toastText, setToastText] = useState<string>('Heo ghé Phở bò · 55k');

  const openRoomScript = useMemo(
    () =>
      buildOpenRoomEngineScript({
        canvasId: 'pbCv',
        worldWidth: 584,
        worldHeight: 172,
        viewWidth: 192,
        viewHeight: 100,
        walkBounds: { minX: 20, maxX: 560, minY: 82, maxY: 162 },
        initialX: 256,
        initialY: 86,
        initialCamX: 185,
        initialCamY: 0,
        speed: 44,
        hotspots: [
          {
            id: 'ben_thanh_gate',
            x: 238,
            y: 4,
            w: 92,
            h: 66,
            standX: 283,
            standY: 84,
            standFace: 1,
            actionType: 'look_window',
            fastDash: true,
            bubbleText: `Đang bước vào Chợ Bến Thành...`,
          },
          {
            id: 'real_places',
            x: 16,
            y: 10,
            w: 72,
            h: 48,
            standX: 52,
            standY: 86,
            standFace: 1,
            actionType: 'check_ledger',
            bubbleText: `Bạn đã lưu ${realPlacesCount} quán quen thật!`,
          },
          {
            id: 'xich_lo',
            x: 108,
            y: 112,
            w: 64,
            h: 44,
            standX: 140,
            standY: 146,
            standFace: 1,
            actionType: 'jump_joy',
            bubbleText: `Xích lô Sài Gòn · ${realPlacesCount} điểm check-in`,
          },
          {
            id: 'cafe_bet_square',
            x: 268,
            y: 110,
            w: 92,
            h: 46,
            standX: 314,
            standY: 146,
            standFace: -1,
            actionType: 'sip_coffee',
            bubbleText: `Quảng trường cà phê bệt & Đèn lồng Hội An`,
          },
          {
            id: 'banh_trang_cart',
            x: 420,
            y: 110,
            w: 76,
            h: 46,
            standX: 458,
            standY: 146,
            standFace: 1,
            actionType: 'eat_snack',
            bubbleText: `Xe bánh tráng trộn phố đi bộ đêm!`,
          },
        ],
      }),
    [realPlacesCount]
  );

  const sendCommand = (payload: Record<string, any>) => {
    const js = `window.__pbGo && window.__pbGo(${Number(payload.index) || 0}); true;`;
    if (Platform.OS === 'web') {
      try {
        iframeRef.current?.contentWindow?.postMessage(JSON.stringify(payload), '*');
      } catch (_e) {}
      return;
    }
    webViewRef.current?.injectJavaScript?.(js);
  };

  useEffect(() => {
    if (Platform.OS === 'web') return;
    webViewRef.current?.injectJavaScript?.(
      `window.__pbSetActive && window.__pbSetActive(${active ? 'true' : 'false'}); true;`
    );
  }, [active]);

  const handleSelectChip = (idx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedStallIdx(idx);
    const s = BEN_THANH_STALLS[idx];
    if (s) setToastText(`Heo ghé ${s.name} · ${s.price}`);
    sendCommand({ type: 'GO_TO', index: idx });
  };

  useEffect(() => {
    return () => {
      if (enterMarketTimerRef.current) clearTimeout(enterMarketTimerRef.current);
    };
  }, []);

  const handleRoomPayload = (data: any) => {
    if (!data) return;
    if (data.type === 'STALL_VISIT') {
      if (typeof data.index === 'number') setSelectedStallIdx(data.index);
      if (data.label) setToastText(data.label);
    } else if (data.type === 'HAPTIC_LIGHT') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else if (data.type === 'ROOM_ACTION') {
      if (data.text) setToastText(String(data.text));
      if (data.id === 'ben_thanh_gate' && data.userTriggered && onEnterMarket) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        if (enterMarketTimerRef.current) clearTimeout(enterMarketTimerRef.current);
        enterMarketTimerRef.current = setTimeout(() => {
          onEnterMarket();
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
  }, [onEnterMarket]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      handleRoomPayload(data);
    } catch (_e) {}
  };

  const htmlContent = useMemo(
    () => `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;user-select:none}
html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#8F76CC;display:flex;align-items:center;justify-content:center}
#psCv{
  width:100%;
  height:100%;
  display:block;
  image-rendering:pixelated;
  image-rendering:-webkit-crisp-edges;
  image-rendering:-moz-crisp-edges;
  image-rendering:crisp-edges;
  touch-action:pan-y;
  cursor:pointer;
}
</style>
<script>
window.onerror = function(msg, src, line) {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'JS_ERROR', msg: String(msg), line: line }));
  }
  return false;
};
</script>
</head>
<body>
<canvas id="psCv" width="192" height="100" role="img" aria-label="Phố ẩm thực và đồ lưu niệm Chợ Bến Thành"></canvas>
<script>
(function(){
'use strict';
var VW = 192, VH = 100, WORLD_W = 584;
var PBI = '#2B2118';
var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var isActive = true;

function notify(type, data) {
  var msg = JSON.stringify(Object.assign({ type: type }, data || {}));
  if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
    window.ReactNativeWebView.postMessage(msg);
  } else if (window.parent && window.parent !== window) {
    window.parent.postMessage(msg, '*');
  }
}

function mulberry32(a){
  return function(){
    a|=0; a=a+0x6D2B79F5|0;
    var t=Math.imul(a^a>>>15,1|a);
    t=t+Math.imul(t^t>>>7,61|t)^t;
    return((t^t>>>14)>>>0)/4294967296;
  };
}
function R(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h);}
function E(c,cx,cy,rx,ry,col){
  c.fillStyle=col;
  for(var y=-ry;y<=ry;y++)for(var x=-rx;x<=rx;x++)if((x*x)/(rx*rx)+(y*y)/(ry*ry)<=1)c.fillRect(cx+x,cy+y,1,1);
}
function mk(w,h,fn){
  var cv=document.createElement('canvas');cv.width=w;cv.height=h;
  var ctx=cv.getContext('2d');ctx.imageSmoothingEnabled=false;fn(ctx);return cv;
}

// Sprite Heo 24x20 chuẩn prototype
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
  shape(c,[[6,20,21],[7,20,21],[8,20,21]],PAL.n,hx,hy);
  shape(c,[[3,14,18],[4,13,19],[5,13,19],[6,13,19],[7,13,19],[8,13,19],[9,14,18]],PAL.p,hx,hy);
  shape(c,[[1,15,16],[2,14,17]],PAL.p,hx,hy);R(c,hx+14,hy+3,5,1,PAL.p);hp(16,2,PAL.s);
  R(c,hx+14,hy+4,2,1,PAL.h);
  hp(21,6,PAL.k);hp(21,8,PAL.k);
  if(o.happy){hp(16,6,PAL.k);hp(17,5,PAL.k);hp(18,6,PAL.k);}
  else if(o.blink||sleep||eat){hp(16,6,PAL.k);hp(17,6,PAL.k);}
  else{R(c,hx+16,hy+5,2,2,PAL.k);hp(16,5,PAL.w);}
  if(sad){hp(16,4,PAL.k);hp(17,3,PAL.k);hp(18,7,'#7EC8F0');hp(18,8,'#7EC8F0');}
  else{hp(17,8,PAL.s);hp(18,8,PAL.s);}
  R(c,ox+11,oy+bodyDy+9,2,1,PAL.g);R(c,ox+11,oy+bodyDy+10,2,1,PAL.G);
}

var hp=mk(24,20,function(){}), hpx=hp.getContext('2d');

var PB_CX=[24,70,116,162,208,256,304,352,400,448,496,544];
var PB_DISH=[
  {n:'Phở bò',p:'55k'},
  {n:'Bún bò',p:'50k'},
  {n:'Trà đá vỉa hè',p:'5k'},
  {n:'Cà phê bệt',p:'25k'},
  {n:'Bánh mì',p:'25k'},
  {n:'Cơm tấm',p:'45k'},
  {n:'Bánh xèo',p:'40k'},
  {n:'Chè Ba Màu',p:'20k'},
  {n:'Nón lá & Áo dài',p:'120k'},
  {n:'Gốm & Sơn mài',p:'150k'},
  {n:'Bánh pía & Cà phê',p:'95k'},
  {n:'Lồng đèn & Heo đất',p:'80k'}
];

function pbUmb(x,cx,y,w,c1,c2){
  var l=cx-(w>>1);
  R(x,l+2,y-2,w-4,2,c1);R(x,l,y,w,3,c1);
  for(var k=0;k<w;k+=6)R(x,l+k+2,y-2,3,5,c2);
  R(x,l,y+3,w,1,PBI);R(x,cx,y+4,1,14,PBI);
}
function pbCounter(x,cx,col){
  R(x,cx-12,63,24,12,PBI);R(x,cx-11,64,22,10,col);R(x,cx-12,62,24,2,'#C49A6E');
}
function pbBowl(x,ox,oy,broth,top){
  R(x,ox+1,oy+4,9,3,'#FFFBF1');R(x,ox+2,oy+7,7,1,'#FFFBF1');
  R(x,ox+1,oy+3,9,1,broth);R(x,ox+3,oy+2,2,1,top);R(x,ox+6,oy+2,2,1,'#6BBF59');
  R(x,ox+8,oy,1,4,'#8A5A34');
}
function pbIcon(x,i,ox,oy){
  if(i===0)pbBowl(x,ox,oy,'#E8C77A','#B5473A');
  else if(i===1)pbBowl(x,ox,oy,'#E0452B','#F9B8C4');
  else if(i===2){R(x,ox+3,oy+1,5,7,'#CFEFF6');R(x,ox+4,oy+2,2,2,'#FFFFFF');R(x,ox+3,oy+5,5,3,'#E8B96B');R(x,ox+7,oy,1,4,'#E0452B');}
  else if(i===3){R(x,ox+2,oy+3,6,5,'#FFFBF1');R(x,ox+3,oy+4,4,1,'#6B4A2B');R(x,ox+8,oy+4,2,2,'#FFFBF1');R(x,ox+4,oy,1,2,'#B9B3C4');}
  else if(i===4){R(x,ox+1,oy+3,9,4,'#D9A55B');R(x,ox+2,oy+2,7,1,'#E8B96B');R(x,ox+2,oy+4,7,1,'#6BBF59');R(x,ox+3,oy+5,5,1,'#F9B8C4');}
  else if(i===5){R(x,ox+1,oy+2,9,5,'#FFFBF1');R(x,ox+2,oy+3,4,3,'#9E4528');R(x,ox+7,oy+3,2,2,'#F4B93B');R(x,ox+6,oy+5,2,1,'#6BBF59');}
  else if(i===6){R(x,ox+1,oy+3,9,4,'#F4B93B');R(x,ox+2,oy+2,7,2,'#FFE08A');R(x,ox+4,oy+4,3,1,'#5E9A57');}
  else if(i===7){R(x,ox+3,oy+1,5,7,'#CFEFF6');R(x,ox+3,oy+3,5,2,'#E0452B');R(x,ox+3,oy+5,5,2,'#F4B93B');R(x,ox+3,oy+6,5,2,'#5E9A57');}
  else if(i===8){R(x,ox+2,oy+3,7,2,'#E7D3A0');R(x,ox+4,oy+1,3,2,'#E7D3A0');R(x,ox+5,oy+5,1,2,'#E0452B');}
  else if(i===9){R(x,ox+4,oy+1,3,1,'#3F8F95');R(x,ox+3,oy+2,5,5,'#6DB7C9');R(x,ox+4,oy+7,3,1,'#3F8F95');}
  else if(i===10){R(x,ox+2,oy+2,7,5,'#E0452B');R(x,ox+3,oy+3,5,3,'#F4B93B');}
  else{R(x,ox+3,oy+1,5,6,'#F9B8C4');R(x,ox+4,oy+2,3,3,'#F4B93B');R(x,ox+5,oy,1,2,'#E0452B');}
}

var skyTile=mk(VW,66,function(x){
  var bands=['#6B5FC0','#8F76CC','#B685CB','#E391BF','#F8A6B0','#FFC096','#FFDA9C','#FFEBB8'];
  for(var i=0;i<bands.length;i++){
    R(x,0,i*8,VW,8,bands[i]);
    if(i<bands.length-1){for(var px=0;px<VW;px+=2)R(x,px,i*8+7,1,1,bands[i+1]);}
  }
  R(x,0,60,VW,6,'#FFEBB8');
  E(x,150,34,17,17,'#FFE9A8');E(x,150,34,13,13,'#FFF6CF');
  R(x,136,36,28,1,'#FFC096');R(x,138,40,24,1,'#FFDA9C');R(x,141,44,18,2,'#FFEBB8');
});

var worldBg=mk(WORLD_W,VH,function(x){
  var rd=mulberry32(19);
  // Tòa nhà xa chân trời
  for(var tx=8;tx<WORLD_W;tx+=28){
    var h=18+((rd()*22)|0), w=10+((rd()*12)|0);
    R(x,tx,64-h,w,h,'#7B66AE');R(x,tx+2,64-h-3,2,3,'#7B66AE');
  }
  // NHÀ PHỐ DỌC CON PHỐ + CHỢ BẾN THÀNH Ở TRUNG TÂM (x=242..330)
  var HC=['#F2C9A0','#E8A0A8','#A8CBA0','#F5E0A0','#9FC4DC','#D9A8D0'];
  var hx=0, idx=0;
  while(hx<WORLD_W){
    if(hx>=238 && hx<328){
      // KHU VỰC CỬA NAM CHỢ BẾN THÀNH 1:1 THEO ẢNH 2 (Mặt tiền kem vàng, tháp đồng hồ, chữ xanh CHỢ BẾN THÀNH, 4 cây bonsai & vạch sang đường)
      var bx=238, bw=90;
      R(x,bx,32,bw,32,PBI);R(x,bx+2,34,bw-4,30,'#F7E3B5'); // hai cánh cửa vòm kem vàng
      R(x,bx,29,bw,4,'#C4603A');R(x,bx+2,28,bw-4,2,'#9E4528'); // mái ngói đỏ hai cánh
      // Khối cổng chính giữa + Tháp đồng hồ biểu tượng
      R(x,bx+28,24,34,40,PBI);R(x,bx+29,25,32,39,'#F9E9C2');
      R(x,bx+34,8,22,20,PBI);R(x,bx+35,9,20,19,'#FAF0D4');
      R(x,bx+32,6,26,3,'#9E4528');R(x,bx+44,2,2,4,'#6B7280'); // mái tháp & cột thu lôi
      // Mặt đồng hồ xanh ngọc + kim
      E(x,bx+45,16,5,5,PBI);E(x,bx+45,16,4,4,'#DCEEFA');
      R(x,bx+45,13,1,3,'#2E6B47');R(x,bx+45,16,3,1,'#2E6B47');
      // Dòng chữ xanh "CHỢ BẾN THÀNH" & Phù điêu nhỏ bên dưới
      R(x,bx+32,23,26,2,'#2E6B47');
      R(x,bx+42,27,6,5,PBI);R(x,bx+43,28,4,3,'#D49B35');
      // Cổng vòm chính tối sâu (mời vào lòng chợ)
      R(x,bx+37,38,16,26,PBI);R(x,bx+38,39,14,25,'#23202E');E(x,bx+45,39,7,6,'#23202E');
      R(x,bx+40,42,10,4,'rgba(255,224,138,0.28)'); // ánh sáng hắt từ bên trong chợ
      // 2 dãy cửa cuốn xám hai bên cổng
      R(x,bx+16,42,10,22,PBI);R(x,bx+17,43,8,21,'#9CA3AF');
      R(x,bx+64,42,10,22,PBI);R(x,bx+65,43,8,21,'#9CA3AF');
      // 4 cây bonsai tỉa tầng xanh mướt trong chậu đỏ
      [bx+6,bx+28,bx+61,bx+83].forEach(function(tx){
        R(x,tx-3,60,6,4,'#A65434');R(x,tx-1,54,2,6,'#6E4223');
        R(x,tx-4,51,8,3,'#3E8A47');R(x,tx-3,47,6,3,'#52A85C');R(x,tx-2,44,4,3,'#6BC473');
      });
      // Vạch kẻ đường trắng cho người đi bộ ngay trước cổng (y=80..98)
      for(var zy=81;zy<97;zy+=4){R(x,bx+33,zy,24,2,'#EAE4D7');}
      hx=328; continue;
    }
    var w=28+((rd()*10)|0), h=26+((rd()*14)|0), top=64-h;
    R(x,hx,top,w,h,PBI);R(x,hx+1,top+1,w-2,h-1,HC[idx%HC.length]);
    R(x,hx,top,w,2,'#4B3F86');R(x,hx+2,top+2,w-4,1,'rgba(255,255,255,.35)');
    var rows=((h-12)/9)|0;
    for(var r=0;r<rows;r++)for(var k=0;k<2;k++){
      var wx=hx+5+k*((w-14)>>1)+k*2, wy=top+6+r*9;
      R(x,wx,wy,7,6,PBI);R(x,wx+1,wy+1,5,4,rd()<.55?'#FFE08A':'#2B2A5E');R(x,wx-1,wy+6,9,1,'#8A5A34');
    }
    R(x,hx+w-1,top,1,h,'rgba(0,0,0,.18)');
    if(idx%2===0){R(x,hx+w-6,35,5,13,'#E0452B');R(x,hx+w-5,37,3,1,'#F4B93B');}
    hx+=w; idx++;
  }
  // Vỉa hè, lề đường, lòng đường suốt 584px
  R(x,0,64,WORLD_W,12,'#D8CDB8');for(var xx=0;xx<WORLD_W;xx+=12)R(x,xx,64,1,12,'#C4B8A0');R(x,0,64,WORLD_W,1,PBI);
  R(x,0,76,WORLD_W,2,'#F4E7A8');R(x,0,78,WORLD_W,1,PBI);R(x,0,79,WORLD_W,21,'#4A4658');
  for(var xx=4;xx<WORLD_W;xx+=20)R(x,xx,92,9,1,'#F4E7A8');

  // 0 PHỞ BÒ
  var cx=PB_CX[0];pbUmb(x,cx,48,28,'#E0452B','#FFFBF1');pbCounter(x,cx,'#8A5A34');E(x,cx-3,61,6,4,'#9AA0AE');R(x,cx-9,59,12,2,'#CFD3DC');R(x,cx+5,58,6,2,'#FFFBF1');R(x,cx+5,60,6,2,'#FFFBF1');R(x,cx-8,66,16,7,'#E0452B');pbIcon(x,0,cx-5,66);
  // 1 BÚN BÒ
  cx=PB_CX[1];pbUmb(x,cx,48,28,'#F08A2B','#FFF1D0');pbCounter(x,cx,'#6B4A2B');R(x,cx-9,58,6,2,'#FFFBF1');R(x,cx-9,60,6,2,'#FFFBF1');E(x,cx+3,61,6,4,'#C0562B');R(x,cx-2,59,10,2,'#E8A07A');R(x,cx-8,66,16,7,'#F4B93B');pbIcon(x,1,cx-5,66);
  // 2 TRÀ ĐÁ VỈA HÈ
  cx=PB_CX[2];R(x,cx-8,46,16,9,PBI);R(x,cx-7,47,14,7,'#8EC9E8');pbIcon(x,2,cx-5,46);R(x,cx,55,1,6,PBI);R(x,cx-12,63,24,4,PBI);R(x,cx-11,64,22,2,'#F9B8C4');R(x,cx-11,67,2,8,PBI);R(x,cx+9,67,2,8,PBI);R(x,cx-10,56,7,8,PBI);R(x,cx-9,57,5,6,'#3E9A57');
  [[-16,'#E0452B'],[11,'#4B6FA5'],[-5,'#F4B93B']].forEach(function(s){var sx=cx+s[0],sy=s[0]===-5?73:70;R(x,sx,sy,7,3,PBI);R(x,sx+1,sy,5,2,s[1]);R(x,sx+1,sy+3,1,3,PBI);R(x,sx+5,sy+3,1,3,PBI);});
  // 3 CÀ PHÊ BỆT
  cx=PB_CX[3];R(x,cx+7,50,4,26,'#6B4A2B');E(x,cx+9,47,14,9,'#3E7A3A');E(x,cx+9,45,10,6,'#5E9A57');R(x,cx-15,73,26,3,PBI);R(x,cx-14,74,24,1,'#E7C76A');
  [[-9,'#4B6FA5',false],[1,'#F9B8C4',true]].forEach(function(p){var bx=cx+p[0];R(x,bx-1,63,7,8,PBI);R(x,bx,64,5,6,p[1]);E(x,bx+2,60,3,3,PBI);E(x,bx+2,60,2,2,'#F2C9A0');if(p[2]){R(x,bx-3,57,11,1,PBI);R(x,bx-2,56,9,1,'#E7D3A0');R(x,bx,55,5,1,'#E7D3A0');}});
  // 4 BÁNH MÌ
  cx=PB_CX[4];R(x,cx-15,49,30,3,PBI);for(var k=0;k<30;k+=6)R(x,cx-14+k,50,3,2,k%12?'#FFFBF1':'#E0452B');R(x,cx-13,55,26,13,PBI);R(x,cx-12,56,24,11,'#CFEFF6');R(x,cx-10,59,11,2,'#D9A55B');R(x,cx-8,62,13,2,'#E8B96B');R(x,cx-13,67,26,7,'#4B6FA5');R(x,cx-8,69,16,4,'#F4B93B');pbIcon(x,4,cx-5,66);
  // 5 CƠM TẤM
  cx=PB_CX[5];pbUmb(x,cx,48,28,'#3E9A57','#FFFBF1');pbCounter(x,cx,'#A65E38');R(x,cx-9,59,18,3,'#4A4658');R(x,cx-6,57,5,2,'#9E4528');R(x,cx+1,57,5,2,'#B5473A');R(x,cx-8,66,16,7,'#F08A2B');pbIcon(x,5,cx-5,66);
  // 6 BÁNH XÈO
  cx=PB_CX[6];pbUmb(x,cx,48,28,'#F4B93B','#FFFBF1');pbCounter(x,cx,'#6B4A2B');E(x,cx-4,60,6,3,'#3A3A44');E(x,cx-4,60,4,2,'#F4B93B');R(x,cx+4,58,6,4,'#5E9A57');R(x,cx-8,66,16,7,'#5E9A57');pbIcon(x,6,cx-5,66);
  // 7 CHÈ BA MÀU
  cx=PB_CX[7];R(x,cx-13,52,26,15,PBI);R(x,cx-12,53,24,13,'#FFFBF1');R(x,cx-10,56,5,5,'#E0452B');R(x,cx-3,56,5,5,'#F4B93B');R(x,cx+4,56,5,5,'#5E9A57');R(x,cx-13,67,26,7,'#E8548C');pbIcon(x,7,cx-5,66);
  // 8 LƯU NIỆM: NÓN LÁ & ÁO DÀI
  cx=PB_CX[8];R(x,cx-15,47,30,3,PBI);for(var k=0;k<30;k+=6)R(x,cx-14+k,48,3,2,k%12?'#FFFBF1':'#4B6FA5');R(x,cx-14,50,28,24,PBI);R(x,cx-13,51,26,22,'#FFF6E5');
  // Treo áo dài hồng & đỏ + nón lá
  R(x,cx-10,54,5,11,'#F9B8C4');R(x,cx-3,54,5,11,'#E0452B');R(x,cx+5,55,7,2,'#E7D3A0');R(x,cx+7,53,3,2,'#E7D3A0');pbIcon(x,8,cx-5,66);
  // 9 LƯU NIỆM: GỐM & SƠN MÀI
  cx=PB_CX[9];pbUmb(x,cx,48,28,'#4B6FA5','#FFFBF1');pbCounter(x,cx,'#8A5A34');R(x,cx-9,56,4,6,'#6DB7C9');R(x,cx-2,55,5,7,'#3F8F95');R(x,cx+5,57,5,5,'#E0452B');R(x,cx-8,66,16,7,'#3F8F95');pbIcon(x,9,cx-5,66);
  // 10 ĐẶC SẢN: BÁNH PÍA & CÀ PHÊ QUÀ
  cx=PB_CX[10];pbUmb(x,cx,48,28,'#E0452B','#F4B93B');pbCounter(x,cx,'#6B4A2B');R(x,cx-9,56,6,6,'#F4B93B');R(x,cx-1,56,6,6,'#E0452B');R(x,cx+7,57,4,5,'#6B4A2B');R(x,cx-8,66,16,7,'#E0452B');pbIcon(x,10,cx-5,66);
  // 11 LỒNG ĐÈN & HEO ĐẤT LƯU NIỆM
  cx=PB_CX[11];R(x,cx-15,47,30,3,PBI);R(x,cx-14,50,28,24,PBI);R(x,cx-13,51,26,22,'#2B1B2E');
  E(x,cx-7,56,3,4,'#E0452B');E(x,cx,55,3,4,'#F4B93B');E(x,cx+7,56,3,4,'#F9B8C4');
  R(x,cx-9,65,5,4,'#F9B8C4');R(x,cx-1,65,5,4,'#F4B93B');R(x,cx+6,65,5,4,'#F9B8C4');pbIcon(x,11,cx-5,66);
});

var cv=document.getElementById('psCv'), X=cv.getContext('2d');
X.imageSmoothingEnabled=false;

var PB={i:0,px:PB_CX[0]-12,tx:PB_CX[0]-12,camX:0,dir:1,mode:'eat',tm:2.6,hop:0,t:0,last:0,spk:[],run:false};
function pbGo(i){
  i=((i%PB_DISH.length)+PB_DISH.length)%PB_DISH.length;
  PB.i=i;PB.tx=PB_CX[i]-12;PB.hop=0.5;
  if(reduced){PB.px=PB.tx;PB.mode='eat';PB.dir=1;PB.camX=Math.max(0,Math.min(WORLD_W-VW,PB.px+12-96));notify('STALL_VISIT',{index:i,label:'Heo ghé '+PB_DISH[i].n+' · '+PB_DISH[i].p});draw(3);}
  else{PB.mode='walk';PB.dir=PB.tx<PB.px?-1:1;}
}
window.__pbGo=pbGo;
window.__pbSetActive=function(v){isActive=!!v;if(isActive&&!PB.run&&!reduced){PB.run=true;PB.last=performance.now();requestAnimationFrame(frame);}};

function pbSteam(x,sx,sy,t,n){
  for(var k=0;k<n;k++){
    var ph=(t*0.7+k/n)%1, yy=sy-ph*13, xx=sx+Math.round(Math.sin((t+k)*3)*1.6);
    R(x,xx,Math.round(yy),2,2,'rgba(255,251,241,'+(0.85*(1-ph)).toFixed(2)+')');
  }
}
function pbHeart(x,hx,hy,c){
  R(x,hx,hy,2,1,c);R(x,hx+3,hy,2,1,c);R(x,hx-1,hy+1,7,1,c);R(x,hx,hy+2,5,1,c);R(x,hx+1,hy+3,3,1,c);R(x,hx+2,hy+4,1,1,c);
}
function fbRider(x,rx,ry,t,rev){
  var bob=(t*12|0)%2;
  R(x,rx,ry+bob,10,4,'#E0452B');R(x,rx+1,ry+4,2,2,PBI);R(x,rx+7,ry+4,2,2,PBI);
  R(x,rx+(rev?2:4),ry-5+bob,4,5,'#4B6FA5');E(x,rx+(rev?4:6),ry-7+bob,2,2,'#F9B8C4');R(x,rx+(rev?3:5),ry-9+bob,4,2,'#F4B93B');
}

function draw(t){
  var cx=Math.round(PB.camX);
  X.drawImage(skyTile,0,0);
  // Mây trôi chậm
  [[0,8,9],[1,20,13]].forEach(function(c){
    var mox=((t*c[2]+c[0]*90)%(VW+50))-25;
    R(X,Math.round(mox),c[1],20,4,'#FFE6EE');R(X,Math.round(mox+4),c[1]-3,11,4,'#FFE6EE');
  });
  // Thế giới phố Chợ Bến Thành cắt theo camX!
  X.drawImage(worldBg,cx,0,VW,VH,0,0,VW,VH);

  // Dây đèn nhấp nháy dọc thế giới
  var cols=['#FF8A6B','#FFE08A','#8EE0B0'];
  for(var xx=0;xx<VW;xx++){
    var wx=xx+cx;
    R(X,xx,36+Math.round(4*Math.sin((wx%48)/48*Math.PI)),1,1,PBI);
    if(wx%6===3){var dy=Math.round(4*Math.sin((wx%48)/48*Math.PI));R(X,xx,37+dy,2,2,cols[(((wx/6)|0)+Math.floor(t*2))%3]);}
  }
  // Hơi nóng bốc lên từ các quầy phở, bún, cà phê, cơm tấm, bánh xèo
  [PB_CX[0]-3,PB_CX[1]+3,PB_CX[3]-6,PB_CX[5]-4,PB_CX[6]-4].forEach(function(sx){
    var screenX=sx-cx;
    if(screenX>-10 && screenX<VW+10) pbSteam(X,screenX,57,t,2);
  });
  // Xe máy chạy ngang lòng đường trên thế giới
  var moto1=(WORLD_W+40-((t*32)%(WORLD_W+90)))-cx;
  if(moto1>-20&&moto1<VW+20) fbRider(X,Math.round(moto1),85,t,false);
  var moto2=(((t*24+220)%(WORLD_W+90))-30)-cx;
  if(moto2>-20&&moto2<VW+20) fbRider(X,Math.round(moto2),81,t,true);

  // Mũi tên vàng nhấp nhô chỉ quán đích
  if(PB.mode==='walk'){
    var ax=PB_CX[PB.i]-cx, b=Math.round(Math.sin(t*6)*2), ay=42+b;
    if(ax>-10 && ax<VW+10){
      R(X,ax-3,ay+1,7,1,PBI);R(X,ax-2,ay+2,5,1,PBI);R(X,ax-1,ay+3,3,1,PBI);
      R(X,ax-3,ay,7,1,'#F4B93B');R(X,ax-2,ay+1,5,1,'#F4B93B');R(X,ax-1,ay+2,3,1,'#F4B93B');R(X,ax,ay+3,1,1,'#F4B93B');
    }
  }

  // Vẽ chú heo theo tọa độ màn hình (px - camX)
  var jy=PB.hop>0?-Math.round(Math.abs(Math.sin(PB.hop*10))*6):0, py=79+jy, eat=PB.mode==='eat';
  hpx.clearRect(0,0,24,20);
  drawPigSprite(hpx,{pose:eat?'eat':'walk',frame:eat?0:(t*5|0)%2,happy:PB.hop>0||eat,blink:(t%4)<0.15,tail:Math.floor(t*3)%2===1});
  var px=Math.round(PB.px)-cx;
  X.save();
  if(PB.dir<0){X.translate(px+24,py);X.scale(-1,1);X.drawImage(hp,0,0,24,20,0,0,24,20);}
  else X.drawImage(hp,0,0,24,20,px,py,24,20);
  X.restore();

  // Bong bóng món ăn / đồ lưu niệm trên đầu heo
  if(eat||PB.hop>0){
    var bx=Math.max(2,Math.min(VW-22,px+12-10)), by=py-17;
    R(X,bx,by,20,15,PBI);R(X,bx+1,by+1,18,13,'#FFFBF1');
    R(X,bx+8,by+15,4,2,PBI);R(X,bx+9,by+15,2,1,'#FFFBF1');
    pbIcon(X,PB.i,bx+4,by+3);
  }
  if(eat){var h=(t*2)%1;pbHeart(X,px+14,Math.round(py-26-h*8),'#E0452B');}

  PB.spk=PB.spk.filter(function(s){s.l-=0.03;return s.l>0;});
  PB.spk.forEach(function(s){s.x+=s.vx;s.y+=s.vy;R(X,Math.round(s.x)-cx,Math.round(s.y),2,2,s.c);});

  R(X,0,0,VW,2,PBI);R(X,0,VH-2,VW,2,PBI);
}

function drawLowerVietnamSquare(X, camX, camY, t) {
  // Tầng dưới mở rộng (y: 100..172): Quảng trường phố đêm Việt Nam, xích lô, cà phê bệt & đèn lồng Hội An
  X.save();
  X.translate(-Math.round(camX), -Math.round(camY));
  for (var sx = 0; sx < WORLD_W; sx += 16) {
    for (var sy = 100; sy < 172; sy += 16) {
      R(X, sx, sy, 16, 16, ((sx / 16 + sy / 16) % 2 === 0) ? '#D8C3A5' : '#CBB292');
    }
  }
  R(X, 0, 100, WORLD_W, 2, PBI);
  // Dây đèn lồng Hội An dọc quảng trường
  R(X, 0, 106, WORLD_W, 1, PBI);
  for (var lx = 24; lx < WORLD_W - 10; lx += 40) {
    var col = (lx % 80 === 24) ? '#E0452B' : '#F4B93B';
    E(X, lx, 111 + Math.round(Math.sin(t * 2 + lx) * 0.8), 4, 4, PBI);
    E(X, lx, 111 + Math.round(Math.sin(t * 2 + lx) * 0.8), 3, 3, col);
  }
  // Xích lô Việt Nam (x: 118, y: 122)
  R(X, 118, 122, 24, 16, PBI); R(X, 119, 123, 22, 14, '#4B6FA5');
  R(X, 116, 116, 28, 6, '#F4B93B'); // mui xích lô
  E(X, 122, 140, 4, 4, PBI); E(X, 138, 140, 4, 4, PBI); E(X, 152, 140, 4, 4, PBI);
  R(X, 142, 128, 12, 3, PBI); // ghi-đông đạp sau
  // Khu ghế nhựa cà phê bệt giữa quảng trường (x: 276..350)
  [[276, 128, '#E0452B'], [296, 126, '#4B6FA5'], [320, 130, '#E0452B'], [340, 126, '#4B6FA5']].forEach(function(st) {
    R(X, st[0], st[1], 10, 8, PBI); R(X, st[0] + 1, st[1] + 1, 8, 5, st[2]);
  });
  // Xe bánh tráng trộn (x: 428, y: 118)
  R(X, 428, 118, 44, 24, PBI); R(X, 429, 119, 42, 10, '#DCEEFA'); R(X, 429, 129, 42, 12, '#5E9A57');
  R(X, 426, 114, 48, 4, '#E0452B');
  E(X, 436, 144, 4, 4, PBI); E(X, 464, 144, 4, 4, PBI);
  X.restore();
}

function step(dt, now){
  PB.t+=dt;
  if(PB.hop>0) PB.hop=Math.max(0,PB.hop-dt);
  if (window.__openRoom) {
    var rm = window.__openRoom.state;
    window.__openRoom.step(dt, now);
    PB.px = rm.x - 12;
    PB.py = rm.y;
    PB.dir = rm.facing;
    PB.mode = rm.walking ? 'walk' : 'eat';
    PB.camX = rm.camX;
    PB.camY = rm.camY;
  }
}

function frame(now){
  if(!isActive){PB.run=false;return;}
  var dt=Math.min(0.05,(now-PB.last)/1000);PB.last=now;
  step(dt, now);
  var camY = PB.camY || 0;
  X.save();
  X.translate(0, -Math.round(camY));
  draw(PB.t);
  X.restore();
  drawLowerVietnamSquare(X, PB.camX, camY, PB.t);
  // Nếu heo đang ở tầng dưới (y > 96), vẽ heo nổi trên quảng trường đêm
  if (PB.py && PB.py > 96) {
    var pxScreen = Math.round(PB.px - PB.camX);
    var pyScreen = Math.round(PB.py - 20 - camY);
    hpx.clearRect(0, 0, 24, 20);
    drawPigSprite(hpx, { pose: PB.mode === 'walk' ? 'walk' : 'stand', frame: ((PB.t * 6) | 0) % 2, happy: PB.hop > 0, blink: (PB.t % 4) < 0.15, tail: true });
    X.save();
    if (PB.dir < 0) { X.translate(pxScreen + 24, pyScreen); X.scale(-1, 1); X.drawImage(hp, 0, 0, 24, 20, 0, 0, 24, 20); }
    else X.drawImage(hp, 0, 0, 24, 20, pxScreen, pyScreen, 24, 20);
    X.restore();
  }
  if(window.__openRoom)window.__openRoom.drawOverlays(X, now);
  requestAnimationFrame(frame);
}

window.addEventListener('message',function(ev){
  try{
    var d=JSON.parse(ev.data);
    if(d&&d.type==='GO_TO') {
      var idx = Number(d.index) || 0;
      pbGo(idx);
      if (window.__openRoom && PB_CX[idx] !== undefined) {
        window.__openRoom.walkTo(PB_CX[idx], 86);
      }
    }
  }catch(e){}
});

${openRoomScript}

PB.px=PB_CX[0]-12; PB.tx=PB.px; PB.camX=0;
if(reduced){draw(3);}else{PB.run=true;PB.last=performance.now();requestAnimationFrame(frame);}
})();
</script>
</body>
</html>`,
    [openRoomScript]
  );

  const memoizedSource = useMemo(() => ({ html: htmlContent }), [htmlContent]);

  return (
    <View style={styles.wrapper}>
      {/* Banner World Cuộn Ngang Chợ Bến Thành 192×100 (WORLD_W = 584) */}
      <View style={styles.bannerFrame}>
        {Platform.OS === 'web' ? (
          <iframe
            ref={iframeRef}
            srcDoc={htmlContent}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Ben Thanh Street Banner"
          />
        ) : (
          <SafeWebView
            ref={webViewRef}
            source={memoizedSource}
            originWhitelist={['*']}
            containerStyle={styles.webContainer}
            style={styles.webStyle}
            scrollEnabled={false}
            bounces={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onMessage={handleMessage}
          />
        )}

        {/* Nhãn nổi gọn (Toast món ăn / lưu niệm đang ghé) */}
        <View style={styles.floatingToast} pointerEvents="none">
          <PixelIconStar size={12} />
          <Text style={styles.floatingToastText} numberOfLines={1}>
            {toastText}
          </Text>
        </View>
      </View>

      {/* Hàng Chip Cuộn Ngang 12 Quầy Đặc Sản & Lưu Niệm Chợ Bến Thành */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stallChipsRow}
      >
        {BEN_THANH_STALLS.map((stall, idx) => {
          const isSelected = selectedStallIdx === idx;
          return (
            <TouchableOpacity
              key={stall.name}
              style={[
                styles.stallChip,
                isSelected && styles.stallChipActive,
              ]}
              onPress={() => handleSelectChip(idx)}
              activeOpacity={0.8}
            >
              <Text style={[styles.stallChipText, isSelected && styles.stallChipTextActive]}>
                {stall.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  bannerFrame: {
    position: 'relative',
    width: '100%',
    aspectRatio: 192 / 100,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#2B2118',
    overflow: 'hidden',
    backgroundColor: '#8F76CC',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  webContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#8F76CC',
  },
  webStyle: {
    flex: 1,
    width: '100%',
    backgroundColor: '#8F76CC',
  },
  floatingToast: {
    position: 'absolute',
    top: 7,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#FFFBF1',
    borderWidth: 2,
    borderColor: '#2B2118',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  floatingToastText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 11.5,
    color: '#2B2118',
  },
  stallChipsRow: {
    gap: 6,
    paddingVertical: 2,
  },
  stallChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#2B2118',
    backgroundColor: '#FFFBF1',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  stallChipActive: {
    backgroundColor: '#F4B93B',
  },
  stallChipText: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '800',
    fontSize: 11.5,
    color: '#2B2118',
  },
  stallChipTextActive: {
    fontFamily: 'Baloo2_800ExtraBold',
  },
});
