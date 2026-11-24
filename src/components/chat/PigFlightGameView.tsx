import React, { useEffect, useMemo, useRef } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { ArrowLeft } from 'lucide-react-native';
import {
  PixelIconBack,
  PixelIconReload,
  PixelIconTicket,
  PixelIconTraffic,
  PixelIconWing,
} from '../pixel/PixelIcons';

const __REGRESSION_META = { aliases: ['PixelIconBack', 'PixelIconReload', 'handleReload'] };

const SafeWebView = WebView as unknown as React.ComponentType<any>;

interface PigFlightGameViewProps {
  onBack: () => void;
  onSwitchGame?: (game: 'fly' | 'cross') => void;
  tickets?: number;
  food?: number;
  hunger?: number;
  onFeedPig?: () => void;
  onUseTicket?: () => boolean;
  onBuyTicket?: () => boolean;
  onSaveStats?: (stats: { flyBestScore?: number; foodEarned?: number }) => void;
}

export const PigFlightGameView: React.FC<PigFlightGameViewProps> = ({
  onBack,
  onSwitchGame,
  tickets = 3,
  food = 10,
  hunger = 75,
  onFeedPig,
  onUseTicket,
  onBuyTicket,
  onSaveStats,
}) => {
  const webViewRef = useRef<any>(null);
  const initialTicketsRef = useRef(tickets);

  // Đồng bộ số vé hai chiều vào WebView đang chạy KHÔNG gây reload (Quyết định 174)
  useEffect(() => {
    if (webViewRef.current && typeof webViewRef.current.injectJavaScript === 'function') {
      webViewRef.current.injectJavaScript(
        `window.__syncTickets && window.__syncTickets(${Number(tickets) || 0}); true;`
      );
    }
  }, [tickets]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack();
  };

  const handleReload = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    webViewRef.current?.reload();
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'HAPTIC_LIGHT') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (data.type === 'HAPTIC_SUCCESS') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (data.type === 'HAPTIC_FAIL') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (data.type === 'SWITCH_GAME') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (onSwitchGame) onSwitchGame(data.game);
      } else if (data.type === 'USE_TICKET') {
        if (onUseTicket) onUseTicket();
      } else if (data.type === 'BUY_TICKET') {
        if (onBuyTicket) onBuyTicket();
      } else if (data.type === 'SAVE_STATS') {
        if (onSaveStats) {
          onSaveStats({
            flyBestScore: data.score,
            foodEarned: data.foodEarned,
          });
        }
      } else if (data.type === 'GO_HOME') {
        handleBack();
      } else if (data.type === 'JS_ERROR') {
        // Quyết định 148: Cầu nối bắt lỗi JS trong WebView, không để lỗi chết âm thầm.
        console.warn('[PigFlightGameView] WebView JS error:', data.message, 'line', data.line, 'col', data.col);
      }
    } catch (e) {
      // ignore
    }
  };

  // Immutable WebView HTML (useMemo []) — Tuyệt đối không reload khi trừ/đổi vé (Quyết định 174)
  const htmlContent = useMemo(() => `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<script>
/* Quyết định 148: cầu nối bắt lỗi JS — bắn về React Native thay vì chết âm thầm */
window.onerror = function (msg, src, line, col) {
  try {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'JS_ERROR', message: String(msg), line: line || 0, col: col || 0 }));
    }
  } catch (e) {}
  return false;
};
</script>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800&family=Nunito:wght@600;700;800&display=swap" media="print" onload="this.media='all'">
<style>
:root {
  --page: #F6EEDC;
  --screen: #F6EEDC;
  --card: #FFFBF1;
  --ink: #2B2118;
  --muted: #85735E;
  --pig: #F9B8C4;
  --green: #5E9A57;
  --red: #E0452B;
  --gold: #F4B93B;
  --line: #D9C9A4;
  --f-display: 'Baloo 2', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --f-body: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
body {
  height: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #58B6EE;
  color: var(--ink);
  font: 600 14px/1.4 var(--f-body);
  user-select: none;
  -webkit-user-select: none;
}

/* Top game switch bar */
.gbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}
.gseg {
  display: flex;
  background: var(--card);
  border: 2.5px solid var(--ink);
  border-radius: 999px;
  padding: 2px;
  box-shadow: 0 3px 0 var(--ink);
}
.gseg button {
  font: 800 12px/1.2 var(--f-body);
  padding: 5px 12px;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
}
.gseg button.active {
  background: var(--ink);
  color: var(--page);
}
.gtix {
  font: 800 12px/1.2 var(--f-body);
  background: var(--card);
  border: 2.5px solid var(--ink);
  border-radius: 999px;
  padding: 5px 10px;
  box-shadow: 0 3px 0 var(--ink);
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn {
  font: 800 13px/1.2 var(--f-body);
  color: var(--ink);
  background: var(--card);
  border: 2.5px solid var(--ink);
  border-radius: 999px;
  padding: 7px 14px;
  box-shadow: 0 3px 0 var(--ink);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.btn:active { transform: translateY(2px); box-shadow: 0 1px 0 var(--ink); }
.btn.big { flex: 2 1 120px; background: var(--pig); font-size: 15px; }
.btn.gold { background: var(--gold); }
.btn.small { padding: 5px 10px; font-size: 12px; }
.card {
  background: var(--card);
  border: 2.5px solid var(--ink);
  border-radius: 20px;
  box-shadow: 0 3px 0 var(--ink);
}
.label {
  font: 800 11px/1.2 var(--f-body);
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--muted);
}
.flytop {
  display: flex;
  align-items: center;
  gap: 8px;
}
.flytop .who {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.flytop .who b {
  font: 800 20px/1.1 var(--f-display);
}
.flytop .who span {
  font-size: 12px;
  color: var(--muted);
  font-weight: 700;
}
.fscore {
  flex: none;
  min-width: 54px;
  text-align: center;
  padding: 4px 6px 5px;
  background: var(--card);
  border: 2.5px solid var(--ink);
  border-radius: 14px;
  box-shadow: 0 3px 0 var(--ink);
}
.fscore b {
  display: block;
  font: 800 18px/1.1 var(--f-display);
  font-variant-numeric: tabular-nums;
}
.flyhud-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 380px;
  margin: 0 auto 6px;
  flex-shrink: 0;
  gap: 8px;
}
.fbadge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: var(--card);
  border: 2px solid var(--ink);
  border-radius: 999px;
  box-shadow: 0 2px 0 var(--ink);
}
.fbadge.gold {
  background: var(--gold);
}
.fbadge .label {
  font: 800 11px/1 var(--f-body);
  letter-spacing: .08em;
  color: var(--ink);
}
.fbadge b {
  font: 800 16px/1 var(--f-display);
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}
.scene.flywrap {
  position: relative;
  flex: 1;
  min-height: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  background: #58B6EE;
  border: none;
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;
  touch-action: manipulation;
  display: flex;
  align-items: center;
  justify-content: center;
}
.scene.flywrap canvas {
  width: 100%;
  height: 100%;
  display: block;
  image-rendering: pixelated;
  image-rendering: -webkit-crisp-edges;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  cursor: pointer;
  touch-action: manipulation;
}
.fly-float-hud {
  position: absolute;
  top: 10px;
  left: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: none;
  z-index: 8;
}
.fly-score-pill {
  padding: 3px 12px;
  background: rgba(255, 251, 241, 0.92);
  border: 2.5px solid var(--ink);
  border-radius: 999px;
  box-shadow: 0 2px 0 var(--ink);
  font: 800 16px/1.2 var(--f-display);
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}
.fly-score-pill.gold {
  background: rgba(244, 185, 59, 0.94);
  font-size: 13px;
}
.flytoast {
  position: absolute;
  left: 12px;
  right: 12px;
  top: 48px;
  text-align: center;
  pointer-events: none;
  opacity: 0;
  transform: translateY(-6px);
  transition: opacity .2s, transform .2s;
  font: 800 12.5px/1.25 var(--f-body);
  padding: 6px 10px;
  background: var(--card);
  border: 2.5px solid var(--ink);
  border-radius: 14px;
  box-shadow: 0 3px 0 var(--ink);
  z-index: 2;
}
.flytoast.on { opacity: 1; transform: none; }
.flyhint {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  text-align: center;
  pointer-events: none;
  font: 800 12px/1.2 var(--f-body);
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--ink);
  z-index: 2;
}
.flyhint span {
  display: inline-block;
  padding: 8px 18px;
  background: var(--gold);
  border: 3px solid var(--ink);
  border-radius: 999px;
  box-shadow: 0 3px 0 var(--ink);
  animation: fbob 1s ease-in-out infinite alternate;
}
@keyframes fbob { to { transform: translateY(-5px); } }
[hidden] { display: none !important; }
.flyover[hidden] { display: none !important; }
.flyover {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  background: rgba(43,33,24,.6);
  z-index: 3;
}
.flyover .fo {
  width: 100%;
  max-width: 290px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
  padding: 14px;
}
.flyover .fo>b { font: 800 21px/1.1 var(--f-display); }
.flyover .fo p { margin: 0; font-size: 13px; font-weight: 700; }
.fgrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.fgrid div {
  padding: 6px 2px;
  background: var(--screen);
  border: 2.5px solid var(--ink);
  border-radius: 14px;
}
.fgrid b {
  display: block;
  font: 800 17px/1.1 var(--f-display);
  font-variant-numeric: tabular-nums;
}
.fgrid span {
  font-size: 10px;
  color: var(--muted);
  font-weight: 700;
}
.pact {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 4px;
}
.flystats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-top: 10px;
}
.flystats>div {
  min-width: 0;
  padding: 6px 8px;
  background: var(--card);
  border: 2.5px solid var(--ink);
  border-radius: 14px;
  box-shadow: 0 3px 0 var(--ink);
  text-align: center;
}
.flystats b {
  display: block;
  font: 800 17px/1.1 var(--f-display);
  font-variant-numeric: tabular-nums;
}
.flyctl {
  display: flex;
  gap: 6px;
  margin-top: 10px;
  flex-wrap: wrap;
}
.flyctl .btn {
  flex: 1 1 0;
  min-width: 0;
  justify-content: center;
  min-height: 40px;
}
.flyfood-scroll {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
}
.fd {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 8px;
  background: var(--screen);
  border: 2px solid var(--ink);
  border-radius: 12px;
  min-width: 58px;
}
.fd canvas {
  width: 24px;
  height: 24px;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
.fd b {
  font: 800 11px/1.2 var(--f-body);
  margin-top: 2px;
}
.fd span {
  font: 700 10px/1.1 var(--f-body);
  color: var(--muted);
}
</style>
</head>
<body>

  <div class="scene flywrap" id="flyWrap">
    <canvas id="flyCv" width="176" height="312"></canvas>
    <div class="fly-float-hud">
      <div class="fly-score-pill">ĐIỂM <b id="flyScore">0</b></div>
      <div class="fly-score-pill gold">★ <b id="flyBest">0</b></div>
    </div>
    <div class="flytoast" id="flyToast"></div>
    <div class="flyhint" id="flyHint"><span>CHẠM ĐỂ BAY</span></div>
    <div class="flyover" id="flyOver" hidden></div>
  </div>

<script>
(function(){
'use strict';
const $ = id => document.getElementById(id);
function notify(type, data) {
  if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
    window.ReactNativeWebView.postMessage(JSON.stringify(Object.assign({ type }, data || {})));
  }
}

// Chuyển game (guarded vì đã hợp nhất lên 1-Row 16-bit RN TopBar — Chỉ 2 game dọc 9:16)
const tabCrossEl = $('tabCross'); if (tabCrossEl) tabCrossEl.addEventListener('click', () => notify('SWITCH_GAME', { game: 'cross' }));

/* ====== HEO BAY 1:1 TỪ PROTOTYPE VÍ HEO CON ====== */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const PAL={o:'#4B2B21',p:'#F9B8C4',s:'#EE90A6',n:'#F08DA4',h:'#FFE3E8',k:'#2B2118',g:'#F4B93B',G:'#B97A14',w:'#FFFFFF'};
const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};
const E=(c,cx,cy,rx,ry,col)=>{c.fillStyle=col;for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++)if(x*x/(rx*rx)+y*y/(ry*ry)<=1)c.fillRect(cx+x,cy+y,1,1)};
function shape(c,rows,fill,ox,oy,outline=true){
  if(outline){c.fillStyle=PAL.o;for(const [ax,ay] of [[-1,0],[1,0],[0,-1],[0,1]])for(const [y,x0,x1] of rows)c.fillRect(ox+x0+ax,oy+y+ay,x1-x0+1,1)}
  c.fillStyle=fill;for(const [y,x0,x1] of rows)c.fillRect(ox+x0,oy+y,x1-x0+1,1);
}
function mk(w,h,fn){const cv=document.createElement('canvas');cv.width=w;cv.height=h;fn(cv.getContext('2d'));return cv}

const HEART=[[0,1,0,1,0],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0]];
function heart(c,x,y,col){c.fillStyle=col;HEART.forEach((r,j)=>r.forEach((v,i)=>{if(v)c.fillRect(x+i,y+j,1,1)}))}

const DIG={
  '0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111',
  '4':'101101111001001','5':'111100111001111','6':'111100111101111','7':'111001001001001',
  '8':'111101111101111','9':'111101111001111','.':'000000000000010','+':'000010111010000'
};
function stamp(c,s,x,y,col){[...s].forEach((ch,k)=>{const p=DIG[ch];if(!p)return;for(let i=0;i<15;i++)if(p[i]==='1')R(c,x+k*4+(i%3),y+((i/3)|0),1,1,col)})}

/* Sprite heo 24x20 chuẩn 1:1 prototype (Có 4 chân, mõm nhô, tai vểnh, chuông cổ, đuôi cong) */
function drawPigSprite(c,o){
  const ox=1,oy=3,sleep=o.pose==='sleep',eat=o.pose==='eat',walk=o.pose==='walk',sad=o.mood==='sad'&&!o.happy;
  const bob=(walk&&o.frame===1)?-1:0;
  const bodyDy=sleep?3:bob,headDy=sleep?5:eat?4:sad?1:bob,headDx=sleep?-1:eat?1:0;
  if(!sleep){
    const raised=i=>walk&&(o.frame===0?(i===1||i===2):(i===0||i===3));
    const legs=[[3,PAL.p],[9,PAL.p],[6,PAL.s],[12,PAL.s]];
    [2,3,0,1].forEach(i=>{const x=legs[i][0];
      const rows=[[11,x,x+1],[12,x,x+1],[13,x,x+1]];if(!raised(i))rows.push([14,x,x+1]);
      shape(c,rows,legs[i][1],ox,oy)});
  }
  shape(c,[[4,0,1],[5,0,0],[6,0,1]],PAL.p,ox,oy+bodyDy+(o.tail?1:0));
  shape(c,[[4,4,12],[5,3,13],[6,2,14],[7,2,14],[8,2,14],[9,2,14],[10,2,14],[11,3,13]],PAL.p,ox,oy+bodyDy);
  R(c,ox+5,oy+bodyDy+5,3,1,PAL.h);
  const hx=ox+headDx,hy=oy+headDy,hp=(x,y,col)=>R(c,hx+x,hy+y,1,1,col);
  shape(c,[[6,20,21],[7,20,21],[8,20,21]],PAL.n,hx,hy);
  shape(c,[[3,14,18],[4,13,19],[5,13,19],[6,13,19],[7,13,19],[8,13,19],[9,14,18]],PAL.p,hx,hy);
  shape(c,[[1,15,16],[2,14,17]],PAL.p,hx,hy);R(c,hx+14,hy+3,5,1,PAL.p);hp(16,2,PAL.s);
  R(c,hx+14,hy+4,2,1,PAL.h);
  hp(21,6,PAL.k);hp(21,8,PAL.k);
  if(o.happy){hp(16,6,PAL.k);hp(17,5,PAL.k);hp(18,6,PAL.k)}
  else if(o.blink||sleep||eat){hp(16,6,PAL.k);hp(17,6,PAL.k)}
  else{R(c,hx+16,hy+5,2,2,PAL.k);hp(16,5,PAL.w)}
  if(sad){hp(16,4,PAL.k);hp(17,3,PAL.k);hp(18,7,'#7EC8F0');hp(18,8,'#7EC8F0')}
  else{hp(17,8,PAL.s);hp(18,8,PAL.s)}
  R(c,ox+11,oy+bodyDy+9,2,1,PAL.g);R(c,ox+11,oy+bodyDy+10,2,1,PAL.G);
}
const hp=mk(24,20,c=>drawPigSprite(c,{blink:false}));
const hpx=hp.getContext('2d');

/* Biomes, trời, parallax — Toàn màn hình dọc 9:16 (176×312) — Quyết định 172 */
const FW=176,FH=312,GY=278,BLEN=900,TR=140,OW=16;
const BIOMES=[
  {id:'vuon',n:'Vườn nhà',skin:'bamboo'},
  {id:'ruong',n:'Ruộng lúa',skin:'post'},
  {id:'pho',n:'Phố nhà',skin:'pole'},
  {id:'ao',n:'Ao sen',skin:'lotus'}
];
const toHex=a=>'#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const hx=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mix=(a,b,t)=>{const A=hx(a),B=hx(b);return toHex(A.map((v,i)=>v+(B[i]-v)*t))};
const SKY=[[0,'#F7B6A0','#FBE3B8'],[.14,'#8FD0F2','#E3F3F8'],[.4,'#58B6EE','#C3E9F8'],[.58,'#F29A62','#FFD9A0'],[.7,'#6B4A86','#EE9A74'],[.8,'#1D2A4F','#3A4C80'],[.94,'#1D2A4F','#3A4C80'],[1,'#F7B6A0','#FBE3B8']];
function skyAt(u){let i=0;while(i<SKY.length-2&&u>SKY[i+1][0])i++;const a=SKY[i],b=SKY[i+1],t=Math.max(0,Math.min(1,(u-a[0])/(b[0]-a[0])));return[mix(a[1],b[1],t),mix(a[2],b[2],t)]}
const nightness=u=>u<.68?0:u<.8?(u-.68)/.12:u<.94?1:Math.max(0,(1-u)/.06);
const SR=mulberry32(99);
const STARS=Array.from({length:36},()=>[(SR()*FW)|0,(SR()*130)|0,SR()]);

/* Cảnh nền Far, Mid, Ground */
const SKYL=[[0,16,58],[17,12,40],[30,18,74],[49,14,52],[64,20,66],[85,12,44],[98,18,80],[117,14,56],[132,20,62],[153,12,48],[166,10,36]];
function skyline(c,lit){
  const rd=mulberry32(5),pal=['#BAB6CC','#CDB9B2','#ACBCC8','#C8C4B2'];
  SKYL.forEach(([x,w,h],i)=>{const y=110-h;
    if(!lit){R(c,x,y,w,h,pal[i%4]);R(c,x,y,w,2,'rgba(255,255,255,.35)');R(c,x+w-2,y,2,h,'rgba(60,50,80,.18)')}
    for(let wy=y+6;wy<104;wy+=6)for(let wx=x+3;wx<x+w-3;wx+=5){const on=rd()<.55;if(lit){if(on)R(c,wx,wy,2,3,'#FFD76A')}else R(c,wx,wy,2,3,'#8C88A6')}});
}
function mkFar(b,lit){return mk(FW,110,(c)=>{
  const s=x=>x/FW*Math.PI*2;
  if(b===0){
    for(let x=0;x<FW;x++){
      const h=34+Math.round(12*Math.sin(s(x)*2)+7*Math.sin(s(x)*5));
      R(c,x,110-h,1,h,'#B5DB9A');
      const h2=20+Math.round(9*Math.sin(s(x)*3+1));
      R(c,x,110-h2,1,h2,'#9AC97E');
    }
    // Rặng tre xa xăm
    [22, 86, 148].forEach(bx => {
      for(let i=0; i<3; i++) R(c, bx+i*3, 62+i*2, 2, 28, '#7BAF62');
    });
  }
  else if(b===1){
    // Dãy núi đá vôi Tràng An / Ninh Bình karst peaks
    for(let x=0;x<FW;x++){
      const k1 = Math.pow(Math.abs(Math.sin(s(x)*1.5 + .2)), 1.6);
      const k2 = Math.pow(Math.abs(Math.cos(s(x)*2.5)), 2);
      const h = 30 + Math.round(46 * k1 + 16 * k2);
      R(c,x,110-h,1,h,'#8B9EA8');
      const h2 = 16 + Math.round(24 * Math.pow(Math.abs(Math.sin(s(x)*3 + .8)), 1.4));
      R(c,x,110-h2,1,h2,'#6C8290');
    }
    // Đàn cò trắng bay lượn trên rặng núi
    [[24, 24], [34, 20], [108, 30], [120, 26]].forEach(([ex, ey]) => {
      R(c, ex, ey, 3, 1, '#FFFBF1');
      R(c, ex+1, ey-1, 1, 1, '#FFFBF1');
    });
  }
  else if(b===2){
    skyline(c,lit);
    // Landmark 81 (tòa tháp bậc thang cao nhất Sài Gòn)
    const lx = 58, ly = 12;
    R(c, lx+4, ly, 2, 98, lit ? '#8AA0C8' : '#7FA0C0');
    R(c, lx+2, ly+12, 6, 86, lit ? '#5A6E94' : '#6A89A8');
    R(c, lx, ly+26, 10, 72, lit ? '#465878' : '#587696');
    if(lit){ for(let wy=ly+16;wy<104;wy+=5) R(c, lx+3, wy, 4, 2, '#FFE08A'); }
    else { R(c, lx+1, ly+28, 1, 70, 'rgba(255,255,255,.35)'); }
    // Điểm nhấn Tháp Bitexco đặc trưng Sài Gòn + Sân đỗ trực thăng
    const bx = 138, by = 24;
    R(c, bx+3, by, 6, 86, lit ? '#6A789A' : '#7D95AB');
    R(c, bx+2, by+8, 8, 78, lit ? '#586888' : '#6E859C');
    R(c, bx-4, by+24, 8, 2, lit ? '#FFD76A' : '#4E5A70');
    R(c, bx+5, by-4, 2, 5, lit ? '#FF6B6B' : '#3A4455');
  }
  else{
    for(let x=0;x<FW;x++){
      const h=30+Math.round(14*Math.sin(s(x)*2+2)+6*Math.sin(s(x)*7));
      R(c,x,110-h,1,h,'#D3E4E0');
      const h2=14+Math.round(8*Math.sin(s(x)*3));
      R(c,x,110-h2,1,h2,'#BFD8D3');
    }
    [[40, 26], [50, 22], [130, 28]].forEach(([ex, ey]) => {
      R(c, ex, ey, 3, 1, '#FFFBF1');
      R(c, ex+1, ey-1, 1, 1, '#FFFBF1');
    });
  }
})}
function wire(c,x0,x1,y,sag){for(let x=x0;x<=x1;x++){const t=(x-x0)/(x1-x0);R(c,x,Math.round(y+4*sag*t*(1-t)),1,1,'#2B2118')}}
function mkMid(b,lit){return mk(FW,96,(c)=>{
  const B=96;
  if(b===0){
    [14,58,102,146].forEach((x,i)=>{R(c,x-1,B-26,3,26,'#6B4426');E(c,x,B-36,11,10,i%2?'#4E9A47':'#5DAA52');E(c,x-3,B-40,6,5,'#78C25F');if(i===1)[[x-4,B-40],[x+3,B-34]].forEach(([a,d])=>R(c,a,d,2,2,'#F2B23A'))});
    [34,38,42].forEach((x,i)=>{const h=54+i*6;R(c,x,B-h,3,h,'#6DB85A');R(c,x,B-h,1,h,'#8ED070');for(let y=B-14;y>B-h;y-=14)R(c,x,y,3,1,'#3E8139');R(c,x+3,B-h+8,5,2,'#4E9A47')});
    R(c,120,B-16,22,16,'#F2DFA8');R(c,118,B-20,26,5,'#C4603A');R(c,122,B-12,6,12,'#8A5A34');R(c,132,B-12,6,6,'#7FB5A6');
    // Cụm hoa sen vườn nhà
    [[150, B-4, 8], [162, B-3, 9]].forEach(([x,y,w])=>E(c,x,y,w,2,'#4F9A4F'));
    R(c, 152, B-7, 3, 3, '#F59BB0'); R(c, 164, B-6, 3, 3, '#F59BB0');
  }else if(b===1){
    [28,120].forEach((x,k)=>{const H=58+k*6;for(let i=0;i<H;i+=2){const dx=Math.round(2*Math.sin(i/18+k));R(c,x+dx,B-i-2,3,2,i%8<4?'#8A6A44':'#6B5030')}
      const tx=x+Math.round(2*Math.sin(H/18+k)),ty=B-H;
      [-170,-140,-110,-70,-40,-10].forEach(deg=>{const a=deg*Math.PI/180;for(let s=0;s<13;s++)R(c,Math.round(tx+1+Math.cos(a)*s*1.1),Math.round(ty+Math.sin(a)*s*.7+s*s*.045),2,2,s%4===3?'#3E8139':'#4E9A47')});
      E(c,tx+1,ty+1,2,2,'#6B4426')});
    R(c,70,B-14,2,14,'#8A5A34');R(c,86,B-14,2,14,'#8A5A34');R(c,66,B-20,26,6,'#D9B45A');R(c,70,B-24,18,5,'#E5C676');R(c,72,B-8,14,2,'#B8935A');
  }else if(b===2){
    // Khu nhà phố, chung cư Sài Gòn 16-bit: cửa sổ sáng/tối, ban công, bồn nước Inox, cục nóng máy lạnh, mái hiên sọc & bóng ambient occlusion
    [[0,24,52,'#E9B8A0','#D8402F'],[24,22,44,'#F2DFA8','#2F8F83'],[46,26,60,'#B9D3C8','#4B6FA5'],[72,24,48,'#F4C6C0','#D8402F'],[96,26,56,'#D9C9A8','#2F8F83'],[122,24,42,'#C6D6E8','#E0452B'],[146,30,54,'#F2DFA8','#2F8F83']].forEach(([x,w,h,col,awn],bi)=>{
      const y=B-h;
      if(!lit){
        R(c,x,y,w,h,col);
        // Bóng đổ ambient occlusion 2px giữa các tòa nhà
        R(c,x+w-2,y,2,h,'rgba(43,33,24,.22)');
        // Nóc nhà & bồn nước Inox + cục nóng máy lạnh đặc trưng Việt Nam
        R(c,x-1,y-2,w+1,2,'#8A5A34');
        if(bi%2===0){ R(c,x+4,y-7,6,5,'#CFD8E2'); R(c,x+5,y-6,2,3,'#FFFBF1'); R(c,x+4,y-2,1,2,'#2B2118'); R(c,x+9,y-2,1,2,'#2B2118'); }
        else { R(c,x+w-10,y-6,6,4,'#E4DFD2'); R(c,x+w-9,y-5,3,2,'#85735E'); }
        // Tầng trệt tiệm phố + mái hiên sọc xanh/đỏ
        R(c,x,B-12,w-2,12,'rgba(43,33,24,.12)');
        for(let ax=x;ax<x+w-2;ax+=4){ R(c,ax,B-14,2,3,awn); R(c,ax+2,B-14,2,3,'#FFFBF1'); }
        R(c,x+((w/2)|0)-4,B-10,7,10,'#6B4426');
      }
      for(let wy=y+5;wy<B-18;wy+=12)for(let wx=x+3;wx<x+w-6;wx+=9){
        if(lit){if(((wx*7+wy*3)%5)<3)R(c,wx,wy,5,6,'#FFD76A')}
        else{
          R(c,wx,wy,5,6,'#5D9BB8'); R(c,wx+1,wy+1,1,2,'#BFE6F6');
          R(c,wx-1,wy+6,7,2,'#4B3F35'); // Lan can ban công
          if((wx+wy)%3===0) R(c,wx+2,wy+4,2,2,'#5E9A57'); // Chậu cây ban công
        }
      }
    });
    // Lồng đèn phố cổ & dây điện Sài Gòn
    if(!lit){
      [[54, B-34], [112, B-38]].forEach(([lx, ly]) => { R(c, lx, ly, 4, 6, '#E0452B'); R(c, lx+1, ly+1, 2, 4, '#F4B93B'); });
      [44,132].forEach(x=>{R(c,x,B-74,2,74,'#4B4B52');R(c,x-5,B-72,12,2,'#4B4B52')});
      wire(c,44,132,B-70,6);wire(c,132,220,B-70,6);wire(c,-44,44,B-70,6);
    }
  }else{
    [30,112].forEach((x,k)=>{R(c,x-1,B-40,4,40,'#6B5030');E(c,x+1,B-46,16,9,'#7DB868');E(c,x-4,B-50,9,5,'#98CE80');
      for(let d=-14;d<=14;d+=2){const L=18+((d*7)&7);R(c,x+1+d,B-44+Math.round(Math.abs(d)/3),1,L,k?'#6DAA58':'#7DB868')}});
    for(let x=62;x<100;x+=5){R(c,x,B-26-((x*3)%9),1,26,'#7D9A52');R(c,x-1,B-30-((x*3)%9),3,6,'#6B4426')}
    [[8,B-3,12],[52,B-2,10],[150,B-3,14],[100,B-2,9]].forEach(([x,y,w])=>E(c,x,y,w,2,'#4F9A4F'));
    // Hoa sen hồng nở rộ
    [[12, B-6], [56, B-5], [104, B-5], [154, B-6]].forEach(([sx, sy]) => {
      R(c, sx, sy, 4, 3, '#F59BB0'); R(c, sx+1, sy-1, 2, 1, '#FFD1DC');
    });
  }
})}
function mkGround(b){return mk(FW,FH-GY,(c)=>{
  const rd=mulberry32(b+40),GH=FH-GY;
  if(b===0){R(c,0,0,FW,GH,'#8A5A34');R(c,0,0,FW,6,'#86B866');R(c,0,0,FW,1,'#4B7A38');R(c,0,6,FW,2,'#6B8F44');
    for(let i=0;i<46;i++)R(c,(rd()*FW)|0,1+((rd()*4)|0),1,2,rd()<.5?'#5E9A57':'#A5D67E');
    for(let i=0;i<22;i++)R(c,(rd()*FW)|0,9+((rd()*15)|0),2,1,rd()<.5?'#6B4426':'#A87650');
    [12,70,128].forEach((x,i)=>R(c,x,1,2,2,['#F59BB0','#FFF4D6','#F4B93B'][i]))}
  else if(b===1){R(c,0,0,FW,GH,'#7FB6B0');R(c,0,0,FW,5,'#6BA83A');for(let x=0;x<FW;x+=3)R(c,x,(x*7)%3,2,3+((x*5)%3),(x%2)?'#8CC84A':'#6BA83A');
    for(let i=0;i<20;i++)R(c,(rd()*FW)|0,8+((rd()*14)|0),4,1,'#B5DEDA');R(c,0,GH-5,FW,5,'#6B5030')}
  else if(b===2){R(c,0,0,FW,GH,'#5A5A63');R(c,0,0,FW,4,'#D8CEB8');R(c,0,4,FW,2,'#A99F87');for(let x=0;x<FW;x+=22){R(c,x+3,15,11,2,'#F2DFA8');R(c,x,0,1,4,'#BFB59F')}
    for(let i=0;i<30;i++)R(c,(rd()*FW)|0,8+((rd()*16)|0),2,1,'#6B6B74')}
  else{R(c,0,0,FW,GH,'#6DB7C9');R(c,0,GH-8,FW,8,'#4E97AE');for(let i=0;i<24;i++)R(c,(rd()*FW)|0,2+((rd()*18)|0),5,1,'#A5D8E4');
    [20,66,118,150].forEach((x,i)=>{E(c,x,3,6,2,'#4F9A4F');R(c,x+1,2,3,1,'#6DC06D');if(i%2===0){R(c,x-1,0,3,2,'#F59BB0');R(c,x,0,1,1,'#FFD1DC')}})}
})}
const FAR=[0,1,2,3].map(b=>mkFar(b,false)),FAR_LIT=mkFar(2,true);
const MID=[0,1,2,3].map(b=>mkMid(b,false)),MID_LIT=mkMid(2,true);
const GROUND=[0,1,2,3].map(mkGround);

/* Cột vật cản 4 skins */
function pillar(c,x,y0,y1,skin,top){
  const h=y1-y0;if(h<=0)return;
  if(skin==='bamboo'){
    R(c,x,y0,OW,h,'#2B2118');R(c,x+1,y0,OW-2,h,'#6DB85A');R(c,x+1,y0,4,h,'#8ED070');R(c,x+OW-5,y0,3,h,'#4E9A47');
    for(let k=1;;k++){const ny=top?y1-k*22:y0+k*22;if(ny<y0||ny>y1-1)break;R(c,x-1,ny,OW+2,3,'#2B2118');R(c,x,ny+1,OW,1,'#8ED070');if(k%2)R(c,x+OW+1,ny-2,6,2,'#4E9A47')}
    const ey=top?y1-4:y0;R(c,x-2,ey,OW+4,4,'#2B2118');R(c,x-1,ey+1,OW+2,2,'#8ED070');
  }else if(skin==='post'){
    R(c,x,y0,OW,h,'#2B2118');R(c,x+1,y0,OW-2,h,'#A87650');R(c,x+6,y0,1,h,'#8A5A34');R(c,x+11,y0,1,h,'#8A5A34');R(c,x+1,y0,3,h,'#C49A6E');
    for(let k=1;;k++){const ny=top?y1-k*24:y0+k*24;if(ny<y0||ny>y1-2)break;R(c,x,ny,OW,3,'#E8D6B4');R(c,x,ny+3,OW,1,'#2B2118')}
    const ey=top?y1-4:y0;R(c,x-2,ey,OW+4,4,'#2B2118');R(c,x-1,ey+1,OW+2,2,'#6B4426');
    const fy=top?y1-14:y0+4;R(c,x+OW,fy,9,6,'#2B2118');R(c,x+OW,fy+1,8,4,'#E0452B');R(c,x+OW,fy+2,5,2,'#F4B93B');
  }else if(skin==='pole'){
    R(c,x,y0,OW,h,'#2B2118');R(c,x+1,y0,OW-2,h,'#B9B2A6');R(c,x+1,y0,4,h,'#D4CEC2');R(c,x+OW-4,y0,3,h,'#948D80');
    for(let k=1;;k++){const ny=top?y1-k*28:y0+k*28;if(ny<y0||ny>y1-2)break;R(c,x+1,ny,OW-2,1,'#8F887C')}
    const ey=top?y1-3:y0;R(c,x-8,ey,OW+16,3,'#4B2B21');R(c,x-6,top?ey+3:ey-2,2,2,'#7FB5A6');R(c,x+OW+4,top?ey+3:ey-2,2,2,'#7FB5A6');R(c,x+7,top?ey+3:ey-2,2,2,'#7FB5A6');
  }else{
    R(c,x+2,y0,OW-4,h,'#2B2118');R(c,x+3,y0,OW-6,h,'#5E9A57');R(c,x+3,y0,3,h,'#7DBA6D');
    for(let k=0;;k++){const ny=y0+8+k*13;if(ny>y1-2)break;R(c,x+1,ny,2,1,'#2B2118');R(c,x+OW-3,ny+5,2,1,'#2B2118')}
    const ly=top?y1-2:y0-1;E(c,x+8,ly,13,4,'#2B2118');E(c,x+8,ly,12,3,'#4F9A4F');R(c,x+3,ly-1,10,1,'#6DC06D');
    const by=top?y1+4:y0-7;E(c,x+8,by,5,6,'#2B2118');E(c,x+8,by,4,5,'#F08DA4');R(c,x+6,by-2,2,3,'#FFD1DC');
  }
}

/* Đồ ăn pixel */
const FOODS=[{k:'carrot',v:14,w:70,n:'Cà rốt'},{k:'corn',v:16,w:60,n:'Bắp'},{k:'banana',v:15,w:60,n:'Chuối'},{k:'apple',v:20,w:45,n:'Táo'},{k:'melon',v:26,w:20,n:'Dưa hấu'}];
function pickFood(r){let t=FOODS.reduce((a,f)=>a+f.w,0)*r;for(const f of FOODS){t-=f.w;if(t<=0)return f}return FOODS[0]}
function drawFood(c,k,x,y,t){
  if(k==='carrot'){shape(c,[[-3,-2,2],[-2,-2,2],[-1,-1,1],[0,-1,1],[1,-1,1],[2,0,0],[3,0,0]],'#F28C28',x,y);R(c,x-1,y-1,2,1,'#D8741C');R(c,x-2,y-6,1,3,'#5EA04C');R(c,x,y-7,1,4,'#78B65C');R(c,x+2,y-6,1,3,'#5EA04C')}
  else if(k==='corn'){shape(c,[[-5,-1,1],[-4,-2,2],[-3,-2,2],[-2,-2,2],[-1,-2,2],[0,-2,2],[1,-2,2],[2,-1,1],[3,-1,1]],'#F4D03F',x,y);
    for(let j=-4;j<3;j+=2)for(let i=-1;i<2;i+=2)R(c,x+i,y+j,1,1,'#E0A82E');R(c,x-3,y+1,2,5,'#5EA04C');R(c,x+2,y+1,2,5,'#78B65C')}
  else if(k==='banana'){shape(c,[[-4,2,3],[-3,1,3],[-2,0,2],[-1,-1,2],[0,-3,1],[1,-4,0],[2,-4,-2]],'#F4D03F',x,y);R(c,x+2,y-5,2,1,'#6B4426');R(c,x-4,y+3,2,1,'#6B4426')}
  else if(k==='apple'){E(c,x,y,5,5,'#2B2118');E(c,x,y,4,4,'#E0452B');R(c,x-2,y-2,2,2,'#FF8A6B');R(c,x,y-7,1,3,'#6B4426');R(c,x+1,y-6,3,2,'#5EA04C')}
  else if(k==='melon'){shape(c,[[-2,-6,6],[-1,-6,6],[0,-5,5],[1,-4,4],[2,-3,3],[3,-2,2],[4,-1,1]],'#5EA04C',x,y);
    [[-2,-5,5],[-1,-5,5],[0,-4,4],[1,-3,3],[2,-2,2]].forEach(([dy,a,b])=>R(c,x+a,y+dy,b-a+1,1,'#E0452B'));R(c,x-2,y-1,1,1,'#2B2118');R(c,x+1,y,1,1,'#2B2118');R(c,x+3,y-1,1,1,'#2B2118')}
  else{const rx=Math.round(Math.abs(Math.cos((t||0)*4+x*.05))*3)+1;E(c,x,y,rx+1,5,'#2B2118');E(c,x,y,rx,4,'#F4B93B');if(rx>2)R(c,x-1,y-2,1,4,'#FFF08A')}
}

/* Sinh vật nền */
const INK='#2B2118';
function sBird(c,x,y,f){const k='#3B3B4A';R(c,x-1,y,3,1,k);if(f){R(c,x-3,y+1,2,1,k);R(c,x+2,y+1,2,1,k)}else{R(c,x-3,y-1,2,1,k);R(c,x+2,y-1,2,1,k)}}
function sKite(c,x,y,col,t){for(let dy=-6;dy<=6;dy++){const hw=Math.round((6-Math.abs(dy))*.7);R(c,x-hw,y+dy,hw*2+1,1,col)}
  R(c,x,y-6,1,13,'#FFFBF1');R(c,x-4,y,9,1,'#FFFBF1');for(let i=0;i<8;i++)R(c,x+Math.round(Math.sin(i*.9+t*3)*2),y+7+i*2,2,1,i%2?'#E0452B':'#F4B93B')}
function sButterfly(c,x,y,f,col){R(c,x-2,y-1+f,2,2,col);R(c,x+1,y-1+f,2,2,col);R(c,x,y,1,2,INK)}
function sEgret(c,x,y,dir,mode,f){c.save();c.translate(x,y);c.scale(dir,1);
  if(mode==='stand'){R(c,-1,-9,1,9,'#4B4B52');R(c,2,-9,1,9,'#4B4B52');E(c,0,-12,5,3,'#FFFFFF');R(c,3,-19,2,8,'#FFFFFF');R(c,3,-20,3,2,'#FFFFFF');R(c,6,-20,4,1,'#F4B93B');R(c,-7,-13,3,2,'#FFFFFF');R(c,4,-20,1,1,INK)}
  else{E(c,0,-12,5,2,'#FFFFFF');R(c,3,-16,2,5,'#FFFFFF');R(c,4,-17,3,2,'#FFFFFF');R(c,7,-17,4,1,'#F4B93B');R(c,-9,-11,6,1,'#4B4B52');
    if(f){R(c,-8,-8,9,2,'#FFFFFF');R(c,-12,-5,5,2,'#EDEDED')}else{R(c,-8,-19,9,2,'#FFFFFF');R(c,-12,-22,5,2,'#EDEDED')}}
  c.restore()}
function sMoto(c,x,y,dir,col,f){c.save();c.translate(x,y);c.scale(dir,1);
  E(c,-7,-3,3,3,INK);E(c,7,-3,3,3,INK);E(c,-7,-3,1,1,'#B9B2A6');E(c,7,-3,1,1,'#B9B2A6');
  R(c,-6,-9,13,3,col);R(c,-8,-10,5,2,'#2B2118');R(c,6,-12,2,9,'#8B8B93');R(c,4,-13,5,1,INK);
  R(c,-2,-16+f,4,7,'#4B6FA5');R(c,2,-14+f,4,2,'#4B6FA5');E(c,0,-19+f,3,3,'#F2C9A0');R(c,-3,-23+f,7,3,'#E0452B');c.restore()}
function sFish(c,x,y,dir,f){c.save();c.translate(x,y);c.scale(dir,1);E(c,0,0,5,3,INK);E(c,0,0,4,2,'#F28C28');R(c,-8,-3+f,3,6-2*f,'#F28C28');R(c,2,-1,1,1,INK);R(c,-2,0,3,1,'#FFD1A8');c.restore()}
function sCloud(c,x,y,s,col){E(c,x,y,9*s,3*s,col);E(c,x-6*s,y+1,6*s,2*s,col);E(c,x+7*s,y+1,6*s,2*s,col);E(c,x+1,y-2*s,5*s,2*s+1,col)}

/* Hằng số vật lý và trạng thái heo bay */
const GRAV=560,FLAP=-172,VMAX=250,PX=44;
let G_TIX = ${initialTicketsRef.current};
function updateTixUI() {
  const el = $('uiTix');
  if (el) el.textContent = String(G_TIX);
}
window.__syncTickets = function(n) {
  G_TIX = Math.max(0, Number(n) || 0);
  updateTixUI();
};
function doBuyTicket() {
  notify('BUY_TICKET');
  G_TIX += 1;
  updateTixUI();
  flyMsg('+1 vé chơi!', 2);
  notify('HAPTIC_SUCCESS');
  if (fly.mode === 'dead') flyShowOver();
}

const fly={
  mode:'ready',run:true,last:0,t:0,y:135,vy:0,ang:0,flapT:0,eatT:0,blink:0,
  dist:0,speed:58,sp:0,score:0,coins:0,eaten:0,hunger:78,best:0,earned:0,
  u:.35,weather:'clear',rain:0,wind:0,
  pillars:[],items:[],crit:[],parts:[],floats:[],shake:0,msg:'',msgT:0,cause:'',paused:false,
  hungryAt:0,lastBi:0,spacing:94
};

try{fly.best=+localStorage.getItem('vhc-fly-best')||0}catch(e){}
$('flyBest').textContent=String(fly.best);

const biomeAt=d=>((d/BLEN)|0)%4;
const gapNow=()=>Math.max(58,68-Math.floor(fly.score/6));
let lastGy=135;
const rnd=(a,b)=>a+Math.random()*(b-a);

function flyMsg(t,s){
  fly.msg=t;fly.msgT=s||2;
  const tt=$('flyToast');
  if(tt){tt.textContent=t;tt.classList.toggle('on',!!t)}
}

function flyReset(){
  Object.assign(fly,{
    mode:'ready',y:135,vy:0,ang:0,flapT:0,eatT:0,dist:0,speed:58,sp:60,score:0,coins:0,eaten:0,hunger:78,earned:0,
    pillars:[],items:[],parts:[],floats:[],shake:0,cause:'',lastBi:0,paused:false,
    u:.35,weather:'clear',rain:0,wind:0
  });
  lastGy=135;
  flyMsg('',0);
}

function puff(x,y,n,col,spd,life,kind){
  for(let i=0;i<n&&fly.parts.length<200;i++){
    const a=Math.random()*6.283,s=rnd(.3,1)*spd;
    fly.parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-(kind==='crumb'?18:0),life:life,max:life,col,kind:kind||'sq'});
  }
}

function spawnPillar(){
  const gap=gapNow(),lo=22+gap/2,hi=GY-22-gap/2;
  let gy=rnd(lo,hi);gy=Math.max(lo,Math.min(hi,lastGy+Math.max(-62,Math.min(62,gy-lastGy))));
  const x=FW+OW+4,prev=lastGy;lastGy=gy;
  fly.pillars.push({x,gy,gap,skin:BIOMES[biomeAt(fly.dist+x)].skin,passed:false});
  if(Math.random()<.86){const f=pickFood(Math.random());fly.items.push({k:f.k,v:f.v,x:x+OW/2,y:gy,t:rnd(0,6)})}
  if(fly.pillars.length>1&&Math.random()<.8){
    const mx=x+OW/2-fly.spacing/2,my=(prev+gy)/2;
    for(let i=-1;i<=1;i++)fly.items.push({k:'coin',v:1,x:mx+i*11,y:my-(1-Math.abs(i))*7,t:i});
  }
  if(Math.random()<.12)fly.items.push({k:'melon',v:26,x:x+fly.spacing/2+OW/2,y:15,t:0});
}

function flyFlap(){
  if(fly.mode==='dead'||fly.paused)return;
  if(fly.mode==='ready'){
    if(G_TIX <= 0){
      flyMsg('Hết vé chơi hôm nay! Đổi 10 cám = 1 vé', 2.5);
      notify('HAPTIC_FAIL');
      return;
    }
    G_TIX = Math.max(0, G_TIX - 1);
    updateTixUI();
    notify('USE_TICKET');
    fly.mode='play';fly.msgT=0;fly.hunger=78;
    $('flyHint').hidden=true;
    flyMsg('Hái đồ ăn mang về cho cá và hoa hồng',3);
  }
  fly.vy=FLAP;fly.flapT=.2;
  puff(PX-8,fly.y+4,3,'#FFFBF1',22,.35);
  notify('HAPTIC_LIGHT');
}

function flyDie(cause){
  if(fly.mode==='dead')return;
  fly.mode='dead';fly.cause=cause;fly.vy=cause==='starve'?-40:-120;fly.shake=.3;
  puff(PX,fly.y,14,'#F9B8C4',60,.7);
  fly.earned=fly.coins+fly.score;
  if(fly.score>fly.best){
    fly.best=fly.score;
    $('flyBest').textContent=String(fly.best);
    try{localStorage.setItem('vhc-fly-best',String(fly.best))}catch(e){}
  }
  notify('HAPTIC_FAIL');
  notify('SAVE_STATS', { score: fly.score, foodEarned: fly.eaten });

  const whyMap={pillar:'Ối, đụng cột rồi!',ground:'Heo chạm đất rồi!',starve:'Heo đói lả, không bay nổi nữa'};
  flyMsg(whyMap[cause]||'Hết lượt bay!',99);
  setTimeout(flyShowOver,650);
}

function flyRestart(){
  const o=$('flyOver');
  o.hidden=true;
  o.style.display='none';
  o.innerHTML='';
  flyReset();
  fly.hunger=78;
  fly.paused=false;
  $('flyHint').hidden=false;
}

function flyShowOver(){
  const o=$('flyOver');
  const why={pillar:'Đụng cột',ground:'Chạm đất',starve:'Đói lả'}[fly.cause]||'Hết lượt bay';
  o.style.display='flex';
  o.hidden=false;
  o.innerHTML='<div class="card fo"><b>'+why+'</b><span class="label">Chuyến bay vừa rồi</span>'+
  '<div class="fgrid"><div><b>'+fly.score+'</b><span>Cột qua</span></div><div><b>'+fly.eaten+'</b><span>Món đã ăn</span></div><div><b>'+fly.coins+'</b><span>Đồng cám</span></div></div>'+
  '<p>Nhận <b>+'+fly.earned+' cám</b> vào ví'+(fly.score>0&&fly.score>=fly.best?' · Kỷ lục mới!':'')+'</p>'+
  '<div class="pact"><button class="btn" type="button" id="flyHome">Về vườn</button>' +
  (G_TIX <= 0 ? '<button class="btn gold gbuy" type="button" id="flOverBuy">10 cám = 1 vé</button>' : '<button class="btn gold" type="button" id="flyAgain">Bay lại</button>') +
  '</div></div>';
}

/* Event delegation cho modal flyOver — chống kẹt màn hình trên mobile */
const flyOverEl=$('flyOver');
function handleFlyOverAction(e){
  const again=e.target.closest('#flyAgain');
  const home=e.target.closest('#flyHome');
  const buy=e.target.closest('#flOverBuy');
  if(again){
    if(e.cancelable)e.preventDefault();
    e.stopPropagation();
    flyRestart();
  } else if(home){
    if(e.cancelable)e.preventDefault();
    e.stopPropagation();
    notify('GO_HOME');
  } else if(buy){
    if(e.cancelable)e.preventDefault();
    e.stopPropagation();
    doBuyTicket();
  }
}
flyOverEl.addEventListener('pointerdown', handleFlyOverAction);
flyOverEl.addEventListener('touchstart', handleFlyOverAction, { passive: false });
flyOverEl.addEventListener('click', handleFlyOverAction);
if($('flBuyTix')) $('flBuyTix').addEventListener('click', doBuyTicket);
flyOverEl.addEventListener('click', handleFlyOverAction);

function flyEat(it){
  const was=fly.hunger;
  if(it.k==='coin'){
    fly.coins++;puff(it.x,it.y,4,'#F4B93B',34,.35);
    fly.floats.push({x:it.x,y:it.y-6,txt:'+1',life:.7,col:'#C98A12'});
    notify('HAPTIC_SUCCESS');
    return;
  }
  fly.hunger=Math.min(100,fly.hunger+it.v);fly.eaten++;fly.eatT=.4;
  if(was>=94){fly.coins++;fly.floats.push({x:PX+8,y:fly.y-22,txt:'+1',life:.8,col:'#C98A12'})}
  puff(it.x,it.y,8,it.k==='apple'?'#E0452B':it.k==='melon'?'#E0452B':'#F4B93B',48,.5,'crumb');
  fly.floats.push({x:it.x,y:it.y-8,txt:'+'+it.v,life:.9,col:'#3E7A3A'});
  puff(PX+4,fly.y-12,2,'#E0452B',16,.7,'heart');
  notify('HAPTIC_SUCCESS');
  if(was<25)flyMsg('Phù, suýt đói rồi!',1.8);else if(Math.random()<.3)flyMsg(['Ngon quá!','Ủn ỉn, no bụng!','Hái thêm nữa!'][(Math.random()*3)|0],1.2);
}

/* Quản lý sinh vật nền */
const CAP={cloud:4,bird:2,bf:3,kite:1,egret:2,moto:1,fish:1,ff:10};
const cnt=t=>fly.crit.reduce((a,c)=>a+(c.t===t?1:0),0);
function addCrit(t,o){if(cnt(t)<CAP[t])fly.crit.push(Object.assign({t,x:FW+20,y:50,k:1,vx:0,ph:Math.random()*9,s:1,age:0},o))}
function spawnCrit(dt){
  const bi=biomeAt(fly.dist),night=nightness(fly.u),day=night<.3,r=Math.random()/dt;
  if(cnt('cloud')<CAP.cloud&&r<.5)addCrit('cloud',{x:FW+16,y:rnd(8,60),k:.08,vx:-2,s:rnd(.7,1.3)});
  if(day&&r<.12)addCrit('bird',{x:FW+8,y:rnd(14,70),k:.1,vx:-rnd(12,22)});
  if(day&&(bi===0||bi===3)&&r<.25)addCrit('bf',{x:FW+6,y:rnd(110,170),k:.6,col:['#F59BB0','#FFD84A','#9CD6F0'][(Math.random()*3)|0]});
  if(day&&(bi===0||bi===2)&&r<.05)addCrit('kite',{x:FW+10,y:rnd(24,60),k:.3,col:['#E0452B','#4B9BD8','#F4B93B'][(Math.random()*3)|0]});
  if(bi===1||bi===3){if(r<.15)addCrit('egret',{x:FW+14,y:GY+2,k:1,mode:'stand',dir:-1})}
  if(bi===2&&r<.18){const d=Math.random()<.5?1:-1;addCrit('moto',{x:d>0?-14:FW+14,y:GY+13,k:1,dir:d,vx:d*46,col:['#E0452B','#4B9BD8','#5E9A57'][(Math.random()*3)|0]})}
  if(bi===3&&r<.2)addCrit('fish',{x:rnd(30,150),y:GY+14,k:1,ph:0,dir:Math.random()<.5?1:-1});
  if(night>.5&&(bi===0||bi===3)&&r<.9)addCrit('ff',{x:FW+4,y:rnd(110,185),k:.5,vx:-rnd(0,10)});
}
function updCrit(dt,sc){
  fly.crit.forEach(c=>{c.age+=dt;
    if(c.t==='egret'&&c.mode==='stand'&&fly.mode==='play'&&Math.abs(c.x-PX)<48){c.mode='fly';c.vy=-26;c.k=.7;c.vx=30;c.dir=1}
    if(c.t==='egret'&&c.mode==='fly'){c.y+=c.vy*dt;c.vy=Math.max(-40,c.vy-8*dt)}
    if(c.t==='fish'){c.ph+=dt;const u=c.ph/1.1;if(u>1){c.dead=true}else c.y=GY+16-Math.sin(u*Math.PI)*34;c.vx=c.dir*10}
    if(c.t==='bf'){c.vx=Math.sin(c.age*3+c.ph)*14;c.y+=Math.cos(c.age*4+c.ph)*9*dt}
    if(c.t==='ff'){c.vx=Math.sin(c.age*1.7+c.ph)*9;c.y+=Math.cos(c.age*1.3+c.ph)*8*dt}
    c.x+=(-sc*c.k+c.vx)*dt;
    if(c.x<-40||c.x>FW+48)c.dead=true});
  fly.crit=fly.crit.filter(c=>!c.dead);
}

/* Vòng cập nhật */
function flyUpdate(dt){
  if(fly.paused)return;
  fly.t+=dt;if(fly.flapT>0)fly.flapT-=dt;if(fly.eatT>0)fly.eatT-=dt;if(fly.shake>0)fly.shake-=dt;
  if(fly.msgT>0&&fly.msgT<90){fly.msgT-=dt}
  /* KHÓA TRỜI XANH BAN NGÀY (Quyết định 147):
     Không tự tăng fly.u gây chuyển đêm. Chỉ đổi khi bấm nút [Đổi trời].
     fly.u đã được cố định u = 0.35 trong flyReset(). */
  fly.blink=(fly.t%3.4)<.12?1:0;

  /* Thời tiết giữ 'clear' để bầu trời luôn xanh sáng rực rỡ.
     Mưa/gió chỉ bật khi người dùng bấm [Đổi trời]. */
  fly.rain+=((fly.weather==='rain'?1:0)-fly.rain)*Math.min(1,dt*.7);
  fly.wind+=((fly.weather==='wind'?1:0)-fly.wind)*Math.min(1,dt*.7);

  const mult=fly.mode==='play'?1:fly.mode==='ready'?.45:.15,sc=fly.speed*mult,dx=sc*dt;
  fly.dist+=dx;
  const bi=biomeAt(fly.dist);
  if(bi!==fly.lastBi){fly.lastBi=bi;if(fly.mode==='play')flyMsg('Tới '+BIOMES[bi].n+' rồi!',2.2)}

  if(fly.mode==='ready'){fly.y=96+Math.sin(fly.t*3.4)*4;fly.vy=0;fly.ang=0}
  if(fly.mode==='play'||fly.mode==='dead'){
    fly.vy=Math.min(VMAX,fly.vy+GRAV*dt);fly.y+=fly.vy*dt;
    fly.ang=Math.max(-.45,Math.min(1,fly.vy/260));
    if(fly.y<5){fly.y=5;if(fly.vy<0)fly.vy=0}
  }

  if(fly.mode==='play'){
    fly.hunger-=(3.1+Math.min(2.2,fly.dist/2000))*dt;
    if(fly.hunger<28&&fly.t-fly.hungryAt>6){fly.hungryAt=fly.t;flyMsg('Bụng sôi ùng ục, hái đồ ăn đi!',2)}
    if(fly.hunger<=0){fly.hunger=0;flyDie('starve')}

    fly.sp-=dx;if(fly.sp<=0){spawnPillar();fly.sp+=fly.spacing}
    fly.pillars.forEach(p=>{
      p.x-=dx;
      if(!p.passed&&p.x+OW<PX-7){
        p.passed=true;fly.score++;
        if(fly.score%5===0)fly.speed=Math.min(88,fly.speed+2.5);
        $('flyScore').textContent=String(fly.score);
        notify('HAPTIC_LIGHT');
      }
      if(PX+7>p.x&&PX-7<p.x+OW&&(fly.y-5<p.gy-p.gap/2||fly.y+5>p.gy+p.gap/2))flyDie('pillar');
    });

    fly.items.forEach(it=>{
      it.x-=dx;
      const d=Math.hypot(it.x-PX,it.y-fly.y);
      if(d<(it.k==='coin'?9:11)){it.dead=true;flyEat(it)}
    });

    if(fly.y+7>=GY){fly.y=GY-7;flyDie('ground')}
  }else if(fly.mode==='dead'){
    if(fly.y+7>=GY){fly.y=GY-7;fly.vy=0}
  }else fly.items.forEach(it=>it.x-=dx);

  fly.pillars=fly.pillars.filter(p=>p.x>-OW-6);
  fly.items=fly.items.filter(it=>!it.dead&&it.x>-20);
  spawnCrit(dt);updCrit(dt,sc);

  if(fly.rain>.05&&Math.random()<fly.rain*dt*70)fly.parts.push({x:rnd(0,FW+30),y:-4,vx:-26,vy:170,life:1.2,max:1.2,col:'#9CC8E6',kind:'rain'});
  if(fly.wind>.05&&Math.random()<fly.wind*dt*7)fly.parts.push({x:FW+4,y:rnd(10,170),vx:-rnd(60,90),vy:rnd(-8,14),life:3,max:3,col:biomeAt(fly.dist)===3?'#FFD1DC':'#7DB868',kind:'leaf'});
  fly.parts.forEach(p=>{
    p.life-=dt;p.x+=(p.vx-(p.kind==='rain'?0:sc*.5))*dt;p.y+=p.vy*dt;
    if(p.kind==='crumb')p.vy+=160*dt;else if(p.kind==='heart')p.vy=-16;
    if(p.kind==='rain'&&p.y>GY)p.life=0;
  });
  fly.parts=fly.parts.filter(p=>p.life>0&&p.x>-10);
  fly.floats.forEach(f=>{f.life-=dt;f.y-=14*dt});fly.floats=fly.floats.filter(f=>f.life>0);
}

/* Vẽ khung cảnh đồ họa 1:1 (Không nhân DPR để tránh WebKit downscale làm mờ pixel) */
const flyC=$('flyCv'),flyX=flyC.getContext('2d');
flyC.width = FW;
flyC.height = FH;
flyC.style.width = '100%';
flyC.style.height = '100%';
flyX.imageSmoothingEnabled = false;
const PERIOD=u=>u<.14?'Bình minh':u<.58?'Ban ngày':u<.7?'Hoàng hôn':u<.94?'Ban đêm':'Bình minh';
const WXN={clear:'Trời quang',rain:'Mưa',wind:'Có gió'};
function bgAlphas(){const bi=biomeAt(fly.dist),fr=fly.dist%BLEN,a=fr>BLEN-TR?(fr-(BLEN-TR))/TR:0;return{bi,nx:(bi+1)%4,a}}
function tileDraw(c,tile,k,y){const o=Math.floor((fly.dist*k)%FW);c.drawImage(tile,-o,y);c.drawImage(tile,FW-o,y)}
function layer(c,set,k,y,al){
  tileDraw(c,set[al.bi],k,y);
  if(al.a>0){c.globalAlpha=al.a;tileDraw(c,set[al.nx],k,y);c.globalAlpha=1}
}

function drawSky(c){
  const [top,hor]=skyAt(fly.u),g=fly.rain*.45,T=g?mix(top,'#8E9AA6',g):top,H=g?mix(hor,'#B9C2C8',g):hor,n=nightness(fly.u);
  const bands=14,bh=Math.ceil(GY/bands);
  for(let i=0;i<bands;i++)R(c,0,i*bh,FW,bh+1,mix(T,H,i/(bands-1)));
  if(n>0)STARS.forEach(([x,y,s])=>{c.globalAlpha=n*(.45+.55*Math.sin(fly.t*2.4+s*9))*(1-fly.rain*.8);R(c,x,y,s>.85?2:1,s>.85?2:1,'#FFFBF1')});
  c.globalAlpha=1;
  const u=fly.u;
  if(u>.02&&u<.66){
    const t=(u-.02)/.64,s=Math.sin(t*Math.PI),x=Math.round(12+t*(FW-24)),y=Math.round(170-s*130);
    c.globalAlpha=1-fly.rain*.7;E(c,x,y,9,9,'rgba(255,226,122,.35)');E(c,x,y,7,7,'#2B2118');E(c,x,y,6,6,mix('#FFE27A','#FF9A52',1-s));c.globalAlpha=1;
  }
  if(u>.7&&u<.98){
    const t=(u-.7)/.28,s=Math.sin(t*Math.PI),x=Math.round(12+t*(FW-24)),y=Math.round(170-s*120);
    c.globalAlpha=1-fly.rain*.7;E(c,x,y,7,7,'#2B2118');E(c,x,y,6,6,'#FFF6D6');R(c,x-3,y-2,2,2,'#E6D9A8');R(c,x+1,y+2,2,2,'#E6D9A8');c.globalAlpha=1;
  }
}

function drawCrit(c,pass){
  const n=nightness(fly.u),cc=mix('#FFFFFF','#5A6890',n);
  fly.crit.forEach(k=>{
    const sky=k.t==='cloud'||k.t==='bird'||k.t==='kite';if(sky!==(pass===0))return;
    const x=Math.round(k.x),y=Math.round(k.y),f=Math.floor(fly.t*6+k.ph)%2;
    if(k.t==='cloud')sCloud(c,x,y,k.s,fly.rain>.4?mix(cc,'#9AA4B0',.5):cc);
    else if(k.t==='bird')sBird(c,x,y,f);
    else if(k.t==='kite')sKite(c,x,y,k.col,fly.t);
    else if(k.t==='bf')sButterfly(c,x,y,f,k.col);
    else if(k.t==='egret')sEgret(c,x,y,k.dir,k.mode,f);
    else if(k.t==='moto')sMoto(c,x,y,k.dir,k.col,f);
    else if(k.t==='fish')sFish(c,x,y,k.dir,f);
    else if(k.t==='ff'){c.globalAlpha=.5+.5*Math.sin(fly.t*5+k.ph);R(c,x,y,2,2,'#FFF08A');R(c,x-1,y,4,2,'rgba(255,240,138,.35)');c.globalAlpha=1}
  });
}

const WING=[
  [[-4,-6,-3],[-3,-8,-3],[-2,-9,-3],[-1,-8,-3],[0,-6,-3]],
  [[-1,-9,-3],[0,-10,-3],[1,-9,-3],[2,-7,-3]],
  [[1,-6,-3],[2,-8,-3],[3,-9,-4],[4,-9,-5],[5,-7,-5]]
];

function drawPigFly(c){
  const dead=fly.mode==='dead',hungry=fly.hunger<28||fly.cause==='starve';
  const o={pose:'stand',frame:0,mood:(hungry||dead)?'sad':'ok',happy:fly.eatT>0&&!dead,blink:fly.blink===1||dead,tail:Math.floor(fly.t*6)%2===1};
  hpx.clearRect(0,0,24,20);drawPigSprite(hpx,o);
  const sh=Math.max(3,8-(GY-fly.y)/18);if(!dead||fly.y<GY-8)E(c,PX,GY+3,Math.round(sh),1,'rgba(40,25,10,.22)');
  c.save();c.translate(PX,Math.round(fly.y));c.rotate(Math.round((dead?1.2:fly.ang)*5)/5);
  c.drawImage(hp,-11,-10);
  const wf=fly.mode==='dead'?2:fly.flapT>.12?0:fly.flapT>.04?1:(fly.mode==='ready'?(Math.floor(fly.t*8)%2?1:2):2);
  shape(c,WING[wf],'#FFFBF1',-1,-1);
  c.restore();
}

function drawFlyScene(c,t){
  c.save();
  c.imageSmoothingEnabled = false;
  if(fly.shake>0)c.translate(Math.round(Math.sin(t*90)*2),Math.round(Math.cos(t*70)*2));
  drawSky(c);drawCrit(c,0);
  const al=bgAlphas(),n=nightness(fly.u);
  layer(c,FAR,.15,GY-110,al);
  layer(c,MID,.4,GY-96,al);
  layer(c,GROUND,1,GY,al);
  const pa=al.bi===2?1-al.a:al.nx===2?al.a:0;
  if(n>0)R(c,0,0,FW,FH,'rgba(18,24,60,'+(.36*n).toFixed(2)+')');
  if(n>0&&pa>0){
    c.globalAlpha=n*pa;
    c.drawImage(FAR_LIT,Math.floor(-((fly.dist*.15)%FW)),GY-110);c.drawImage(FAR_LIT,Math.floor(FW-((fly.dist*.15)%FW)),GY-110);
    c.drawImage(MID_LIT,Math.floor(-((fly.dist*.4)%FW)),GY-96);c.drawImage(MID_LIT,Math.floor(FW-((fly.dist*.4)%FW)),GY-96);
    c.globalAlpha=1;
  }
  if(fly.rain>.02)R(c,0,0,FW,FH,'rgba(110,128,146,'+(.2*fly.rain).toFixed(2)+')');
  drawCrit(c,1);

  /* Cột vật cản */
  fly.pillars.forEach(p=>{
    const x=Math.round(p.x);
    pillar(c,x,0,Math.round(p.gy-p.gap/2),p.skin,true);
    pillar(c,x,Math.round(p.gy+p.gap/2),GY,p.skin,false);
  });

  /* Đồ ăn */
  fly.items.forEach(it=>{
    const y=Math.round(it.y+Math.sin(fly.t*4+it.t)*2);
    if(it.k!=='coin'){c.globalAlpha=.28+.12*Math.sin(fly.t*5+it.t);E(c,Math.round(it.x),y,10,10,'#FFF08A');c.globalAlpha=1}
    drawFood(c,it.k,Math.round(it.x),y,fly.t);
  });

  drawPigFly(c);

  /* Hạt */
  fly.parts.forEach(p=>{
    const a=Math.min(1,p.life/p.max*1.6);c.globalAlpha=a;
    if(p.kind==='rain')R(c,Math.round(p.x),Math.round(p.y),1,4,p.col);
    else if(p.kind==='heart')heart(c,Math.round(p.x),Math.round(p.y),p.col);
    else if(p.kind==='leaf'){R(c,Math.round(p.x),Math.round(p.y),3,1,p.col);R(c,Math.round(p.x)+1,Math.round(p.y)+1,2,1,p.col)}
    else R(c,Math.round(p.x),Math.round(p.y),2,2,p.col);
    c.globalAlpha=1;
  });

  /* Chữ nổi stamp */
  fly.floats.forEach(f=>{
    c.globalAlpha=Math.min(1,f.life*2);
    stamp(c,f.txt,Math.round(f.x)-f.txt.length*2+1,Math.round(f.y)+1,'#FFFBF1');
    stamp(c,f.txt,Math.round(f.x)-f.txt.length*2,Math.round(f.y),f.col);
    c.globalAlpha=1;
  });

  /* Viền đỏ khi đói */
  if(fly.mode==='play'&&fly.hunger<28){
    c.globalAlpha=.22+.2*Math.sin(t*8);
    R(c,0,0,FW,3,'#E0452B');R(c,0,FH-3,FW,3,'#E0452B');R(c,0,0,3,FH,'#E0452B');R(c,FW-3,0,3,FH,'#E0452B');
    c.globalAlpha=1;
  }
  c.restore();
}

/* Cập nhật HUD */
const hudC={};
function setT(id,v){if(hudC[id]!==v){hudC[id]=v;const el=$(id);if(el)el.textContent=v}}

function flyHud(){
  setT('flyScore',String(fly.score));setT('flyBest',String(fly.best));
}

/* Vòng lặp chính */
function flyFrame(now){
  const dt=Math.min(.05,(now-fly.last)/1000);fly.last=now;
  flyUpdate(dt);
  drawFlyScene(flyX,now/1000);
  flyHud();
  requestAnimationFrame(flyFrame);
}

/* Bắt sự kiện chạm vỗ cánh tức thì 0ms (Chuẩn prototype, chống double-fire touchstart + pointerdown) */
let tapStartX = 0, tapStartY = 0, lastTapAt = 0;
function flyTap(e){
  const now = performance.now();
  if (now - lastTapAt < 35) return;
  lastTapAt = now;
  if(e){
    tapStartX = e.clientX || 0;
    tapStartY = e.clientY || 0;
  }
  if(fly.paused){ fly.paused = false; return; }
  flyFlap();
}

$('flyWrap').addEventListener('pointerdown', e => {
  if (e.target.closest('button')) return;
  e.preventDefault();
  flyTap(e);
});
$('flyWrap').addEventListener('touchstart', e => {
  if (e.target.closest('button')) return;
  if (e.cancelable) e.preventDefault();
  flyTap(e.touches && e.touches[0]);
}, { passive: false });
$('flyWrap').addEventListener('click', e => {
  if (e.target.closest('button')) return;
  flyTap(e);
});

const fBtn = $('flyBtn');
if (fBtn) {
  fBtn.addEventListener('pointerdown', e => { e.preventDefault(); flyTap(e); });
  fBtn.addEventListener('touchstart', e => { if (e.cancelable) e.preventDefault(); flyTap(e); }, { passive: false });
  fBtn.addEventListener('click', e => { if (e.detail === 0) flyTap(e); });
}

const fPause = $('flyPause');
if (fPause) {
  fPause.addEventListener('click',()=>{
    fly.paused=!fly.paused;
    fPause.textContent=fly.paused?'Tiếp tục':'Tạm dừng';
    flyMsg(fly.paused?'Đã tạm dừng':'Tiếp tục bay',1.5);
  });
}

const fWx = $('flyWxBtn');
if (fWx) {
  fWx.addEventListener('click',()=>{
    fly.weather=fly.weather==='clear'?'rain':fly.weather==='rain'?'wind':'clear';
    fly.u=(fly.u+0.18)%1;
    flyMsg(WXN[fly.weather]+' · '+PERIOD(fly.u),1.5);
  });
}

/* Khởi tạo danh sách đồ ăn nếu có */
const ff=$('flyFood');
if(ff){
  FOODS.concat([{k:'coin',v:1,n:'Đồng cám'}]).forEach(f=>{
    const d=document.createElement('div');d.className='fd';
    d.innerHTML='<canvas width="24" height="24"></canvas><b>'+f.n+'</b><span>'+(f.k==='coin'?'+1 cám':'+'+f.v+'% no')+'</span>';
    const cv=d.querySelector('canvas'),cx=cv.getContext('2d');
    drawFood(cx,f.k,12,f.k==='melon'?15:13,0.1);
    ff.appendChild(d);
  });
}

flyReset();
fly.last=performance.now();
requestAnimationFrame(flyFrame);

})();
</script>
</body>
</html>
`, []);

  const memoizedSource = useMemo(() => ({ html: htmlContent }), [htmlContent]);

  return (
    <View style={styles.container}>
      {/* 16-bit Warm Stone & Brass Beveled TopBar — Vector Navigation ArrowLeft (QĐ 187) */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.bevelBtn} onPress={handleBack} activeOpacity={0.8} accessibilityLabel="Quay lại">
          <ArrowLeft size={18} color="#2B2118" strokeWidth={2.8} />
        </TouchableOpacity>

        <View style={styles.switchPill}>
          <View style={[styles.switchItem, styles.switchItemActive]}>
            <PixelIconWing size={18} />
          </View>
          <TouchableOpacity
            style={styles.switchItem}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSwitchGame?.('cross');
            }}
            activeOpacity={0.75}
            accessibilityLabel="Heo qua đường"
          >
            <PixelIconTraffic size={18} />
          </TouchableOpacity>
        </View>

        <View style={styles.rightControls}>
          <TouchableOpacity
            style={styles.ticketChip}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onBuyTicket?.();
            }}
            activeOpacity={0.8}
            accessibilityLabel="Đổi vé chơi"
          >
            <PixelIconTicket size={16} />
            <Text style={styles.ticketText}>{tickets}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Webview Game Canvas: Flexbox tự nhiên flex: 1, không dùng flex: 0 hay ép chiều cao cứng */}
      <View style={styles.webViewWrapper}>
        {Platform.OS === 'web' ? (
          <iframe
            srcDoc={htmlContent}
            style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#F6EEDC' } as any}
          />
        ) : (
          <SafeWebView
            ref={webViewRef}
            source={memoizedSource}
            containerStyle={styles.webViewContainer}
            style={styles.webView}
            scrollEnabled={false}
            bounces={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
            onMessage={handleMessage}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6EEDC',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#D9C9A4',
    borderTopWidth: 2,
    borderTopColor: '#FFFBF1',
    borderBottomWidth: 3,
    borderBottomColor: '#2B2118',
  },
  bevelBtn: {
    width: 34,
    height: 34,
    borderRadius: 4,
    backgroundColor: '#FFFBF1',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderTopColor: '#FFFBF1',
    borderLeftColor: '#FFFBF1',
    borderBottomColor: '#85735E',
    borderRightColor: '#85735E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  switchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#85735E',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 4,
    padding: 2,
    gap: 2,
  },
  switchItem: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 2,
    backgroundColor: '#F6EEDC',
  },
  switchItemActive: {
    backgroundColor: '#F4B93B',
    borderWidth: 1,
    borderColor: '#2B2118',
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ticketChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: '#FFFBF1',
    borderWidth: 2,
    borderColor: '#2B2118',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  ticketText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 13,
    color: '#2B2118',
  },
  webViewWrapper: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F6EEDC',
  },
  webViewContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F6EEDC',
  },
  webView: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F6EEDC',
  },
});
