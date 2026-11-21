import React, { useMemo, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, RefreshCw } from 'lucide-react-native';

const SafeWebView = WebView as unknown as React.ComponentType<any>;

interface PigShooterGameViewProps {
  onBack: () => void;
  onSwitchGame?: (game: 'fly' | 'shooter') => void;
  tickets?: number;
  food?: number;
  hunger?: number;
  onFeedPig?: () => void;
  onSaveStats?: (stats: { shooterMaxWave?: number; savedBabies?: number; pigFoodBonus?: number }) => void;
}

export const PigShooterGameView: React.FC<PigShooterGameViewProps> = ({
  onBack,
  onSwitchGame,
  tickets = 3,
  food = 10,
  hunger = 75,
  onFeedPig,
  onSaveStats,
}) => {
  const webViewRef = useRef<any>(null);
  // Quyết định 148: Toàn màn hình bằng Flexbox tự nhiên (flex: 1),
  // không dùng kích thước cứng/onLayout để WebView không bị collapse 0×0.

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
      } else if (data.type === 'SAVE_STATS') {
        if (onSaveStats) {
          onSaveStats({
            shooterMaxWave: data.wave,
            savedBabies: data.savedBabies,
            pigFoodBonus: data.foodEarned,
          });
        }
      } else if (data.type === 'JS_ERROR') {
        // Quyết định 148: Cầu nối bắt lỗi JS trong WebView, không để lỗi chết âm thầm.
        console.warn('[PigShooterGameView] WebView JS error:', data.message, 'line', data.line, 'col', data.col);
      }
    } catch (e) {
      // ignore
    }
  };

  const htmlContent = `
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
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800&family=Nunito:wght@600;700;800&display=swap">
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
  --f-display: 'Baloo 2', system-ui, sans-serif;
  --f-body: 'Nunito', system-ui, sans-serif;
}
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
body {
  margin: 0;
  padding: 8px 12px 40px;
  background: var(--page);
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
  margin-bottom: 8px;
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
  padding: 6px 12px;
  box-shadow: 0 3px 0 var(--ink);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.btn:active { transform: translateY(2px); box-shadow: 0 1px 0 var(--ink); }
.btn.gold { background: var(--gold); }
.btn.small { padding: 4px 10px; font-size: 11px; }

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
  min-width: 52px;
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
.camchips {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  overflow-x: auto;
}
.camchips .btn {
  padding: 4px 10px;
  font-size: 11px;
}
.camchips .btn[aria-pressed="true"] {
  background: var(--ink);
  color: #FFFBF1;
}

.scene.apwrap {
  position: relative;
  margin-top: 8px;
  background: #BFE6F6;
  border: 3px solid var(--ink);
  border-radius: 22px;
  box-shadow: 0 4px 0 var(--ink);
  overflow: hidden;
  touch-action: none;
  width: 100%;
  max-width: 360px;
  aspect-ratio: 224 / 140;
  margin-left: auto;
  margin-right: auto;
}
.scene.apwrap canvas {
  display: block;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: -moz-crisp-edges;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  cursor: grab;
  touch-action: none;
}
.flytoast {
  position: absolute;
  left: 12px;
  right: 12px;
  top: 8px;
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
.flyover {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
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
.flyover .fo>b { font: 800 20px/1.1 var(--f-display); }
.stars { display: flex; justify-content: center; gap: 8px; margin: 4px 0; }
.stars i {
  width: 24px; height: 24px; background: var(--line); border: 2px solid var(--ink);
  clip-path: polygon(50% 0, 62% 36%, 100% 38%, 70% 60%, 80% 100%, 50% 76%, 20% 100%, 30% 60%, 0 38%, 38% 36%);
}
.stars i.on { background: var(--gold); }
.apinfo {
  margin-top: 8px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.apinfo b { font: 800 13px/1.3 var(--f-body); }
.apinfo span { font-size: 11.5px; color: var(--muted); font-weight: 700; }
.pact { display: flex; gap: 8px; justify-content: center; margin-top: 6px; }
</style>
</head>
<body>

  <!-- Top switcher -->
  <div class="gbar">
    <div class="gseg">
      <button type="button" id="tabFly">Heo bay</button>
      <button type="button" id="tabShoot" class="active">Heo bắn</button>
    </div>
    <div class="gtix"><i>🎫</i><b id="uiTix">${tickets}</b> vé</div>
  </div>

  <div class="flytop">
    <div class="who"><b>Heo bắn</b><span id="apLvT">Màn 1: Ổ chim nhỏ</span></div>
    <div class="fscore"><span class="label">Chim</span><b id="apBirds">0</b></div>
    <div class="fscore"><span class="label">Sao</span><b id="apStars">0</b></div>
  </div>

  <div class="camchips" id="apLv" role="group"></div>

  <div class="scene apwrap" id="apWrap">
    <canvas id="apCv" width="224" height="140"></canvas>
    <div class="flytoast" id="apToast"></div>
    <div class="flyover" id="apOver" hidden></div>
  </div>

  <div class="card apinfo">
    <b id="apPigs">Đang chờ ngắm bắn</b>
    <span id="apBonus">Kéo heo trên ná về sau rồi thả để bắn. Chạm màn hình giữa trời để kích hoạt Heo Cánh / Heo Bom!</span>
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

$('tabFly').addEventListener('click', () => notify('SWITCH_GAME', { game: 'fly' }));

function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const INK='#2B2118';
const PAL={o:'#4B2B21',p:'#F9B8C4',s:'#EE90A6',n:'#F08DA4',h:'#FFE3E8',k:'#2B2118',g:'#F4B93B',G:'#B97A14',w:'#FFFFFF'};
const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};
const E=(c,cx,cy,rx,ry,col)=>{c.fillStyle=col;for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++)if(x*x/(rx*rx)+y*y/(ry*ry)<=1)c.fillRect(cx+x,cy+y,1,1)};
function shape(c,rows,fill,ox,oy,outline=true){
  if(outline){c.fillStyle=PAL.o;for(const [ax,ay] of [[-1,0],[1,0],[0,-1],[0,1]])for(const [y,x0,x1] of rows)c.fillRect(ox+x0+ax,oy+y+ay,x1-x0+1,1)}
  c.fillStyle=fill;for(const [y,x0,x1] of rows)c.fillRect(ox+x0,oy+y,x1-x0+1,1);
}
function mk(w,h,fn){const cv=document.createElement('canvas');cv.width=w;cv.height=h;fn(cv.getContext('2d'));return cv}

const DIG={'0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001','5':'111100111001111','6':'111100111101111','7':'111001001001001','8':'111101111101111','9':'111101111001111','.':'000000000000010','+':'000010111010000','-':'000000111000000'};
function stamp(c,s,x,y,col){[...s].forEach((ch,k)=>{const p=DIG[ch];if(!p)return;for(let i=0;i<15;i++)if(p[i]==='1')R(c,x+k*4+(i%3),y+((i/3)|0),1,1,col)})}
const HEART=[[0,1,0,1,0],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0]];
function heart(c,x,y,col){c.fillStyle=col;HEART.forEach((r,j)=>r.forEach((v,i)=>{if(v)c.fillRect(x+i,y+j,1,1)}))}

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

const WING=[[[-4,-6,-3],[-3,-8,-3],[-2,-9,-3],[-1,-8,-3],[0,-6,-3]],[[-1,-9,-3],[0,-10,-3],[1,-9,-3],[2,-7,-3]],[[1,-6,-3],[2,-8,-3],[3,-9,-4],[4,-9,-5],[5,-7,-5]]];
function sCloud(c,x,y,s,col){E(c,x,y,9*s,3*s,col);E(c,x-6*s,y+1,6*s,2*s,col);E(c,x+7*s,y+1,6*s,2*s,col);E(c,x+1,y-2*s,5*s,2*s+1,col)}

/* Parallax Scenery */
function mkFar(){return mk(224,110,(c)=>{
  for(let x=0;x<224;x++){
    const h=28+Math.round(14*Math.sin(x/224*Math.PI*4));
    R(c,x,110-h,1,h,'#B5DB9A');
  }
})}
function mkMid(){return mk(224,96,(c)=>{
  const B=96;
  [14,58,102,146,190].forEach((x,i)=>{R(c,x-1,B-26,3,26,'#6B4426');E(c,x,B-36,11,10,i%2?'#4E9A47':'#5DAA52')});
})}
function mkGround(){return mk(224,26,(c)=>{
  R(c,0,0,224,26,'#74A659');
  R(c,0,0,224,2,INK);
})}
const FAR=[mkFar()],MID=[mkMid()],GROUND=[mkGround()];

/* Bầu trời pha màu */
const toHex=a=>'#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const hx=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mix=(a,b,t)=>{const A=hx(a),B=hx(b);return toHex(A.map((v,i)=>v+(B[i]-v)*t))};
const SKY=[[0,'#F7B6A0','#FBE3B8'],[.14,'#8FD0F2','#E3F3F8'],[.4,'#58B6EE','#C3E9F8'],[.58,'#F29A62','#FFD9A0'],[.7,'#6B4A86','#EE9A74'],[.8,'#1D2A4F','#3A4C80'],[1,'#F7B6A0','#FBE3B8']];
function skyAt(u){let i=0;while(i<SKY.length-2&&u>SKY[i+1][0])i++;const a=SKY[i],b=SKY[i+1],t=Math.max(0,Math.min(1,(u-a[0])/(b[0]-a[0])));return[mix(a[1],b[1],t),mix(a[2],b[2],t)]}

/* Hằng số vật lý & Khối Angry Pig */
const AW=224,AH=140,AG=118,SX=36,SY=92,MAXD=28,AGR=230,AK=8.5;
const BLK={
  wood:{c:'#C49A6E',d:'#8A5A34',hp:45,dn:1},
  stone:{c:'#B9B2A6',d:'#7A7468',hp:110,dn:1.7},
  glass:{c:'#B8E4F0',d:'#5FA9C4',hp:16,dn:.6},
  cage:{c:'#CFCFD8',d:'#5A5A66',hp:42,dn:1.2}
};
const CATC={an:'#E0452B',di:'#4B6FA5',mua:'#E8548C'};

const APL=[
 {n:'Ổ chim nhỏ',it:[['wood',150,96,5,22],['wood',164,96,5,22],['wood',146,91,28,5],['bird',153,77,14,14],['bird',176,104,14,14],['cage',190,98,22,20]]},
 {n:'Tháp ổ chim',it:[['stone',140,98,8,20],['stone',170,98,8,20],['wood',136,93,46,5],['cage',144,73,22,20],['bird',167,79,14,14],['bird',186,104,14,14],['cage',200,98,22,20]]},
 {n:'Cổng ổ chim',it:[['wood',124,90,5,28],['wood',146,90,5,28],['wood',168,90,5,28],['wood',120,85,32,5],['wood',164,85,20,5],['cage',126,65,22,20],['bird',152,104,14,14],['bird',172,71,14,14],['bird',182,104,14,14],['cage',196,98,22,20]]}
];

const ap={
  lv:0,last:0,t:0,acc:0,blocks:[],queue:[],pig:null,drag:null,st:'aim',
  parts:[],floats:[],kills:0,settle:0,bonus:'',over:null,cur:'pig',
  clouds:[[30,18,1],[110,30,1.2],[180,14,.9]],free:[],cages:0,rescued:0,winT:0,birds0:0,
  shake:0,wind:0,stars:[0,0,0,0,0,0,0]
};

function apNote(t){
  const e=$('apToast');if(!e)return;
  e.textContent=t;e.classList.add('on');
  setTimeout(()=>e.classList.remove('on'),2400);
}

// Sinh màn chơi vô tận Endless Waves
function generateWave(idx){
  return getLevel(idx);
}
const totalRescued = () => ap.rescued;
function getLevel(idx){
  if(idx < APL.length) return APL[idx];
  const wave = idx + 1;
  const titles = ['Pháo đài kiên cố', 'Tháp đôi hiểm hóc', 'Lồng sắt ngục tối', 'Vương quốc chim bão'];
  const title = titles[(wave-4)%titles.length] + ' (Màn ' + wave + ')';
  const it = [];
  const stoneRatio = Math.min(0.65, 0.25 + wave * 0.08);
  const mat = () => Math.random() < stoneRatio ? 'stone' : 'wood';
  const t1x = 135, h1 = 20 + Math.min(18, wave * 3);
  it.push([mat(), t1x, AG - h1, 7, h1]);
  it.push([mat(), t1x + 22, AG - h1, 7, h1]);
  it.push(['wood', t1x - 3, AG - h1 - 5, 34, 5]);
  it.push(['bird', t1x + 8, AG - h1 - 18, 14, 14]);
  it.push(['cage', t1x + 28, AG - 20, 22, 20]);
  if(wave >= 5){
    const t2x = 180, h2 = 24 + Math.min(20, wave * 2);
    it.push([mat(), t2x, AG - h2, 7, h2]);
    it.push(['glass', t2x - 4, AG - h2 - 5, 26, 5]);
    it.push(['bird', t2x + 4, AG - h2 - 18, 14, 14]);
    it.push(['cage', t2x + 14, AG - 20, 22, 20]);
  }
  return { n: title, it };
}

function apLoad(i){
  ap.lv = i;
  const L = getLevel(i), cats=['an','mua','di']; let n=0;
  // Gió biến thiên
  ap.wind = i >= 1 ? Math.round((Math.random() - 0.48) * Math.min(70, 20 + i * 8)) : 0;

  ap.blocks = L.it.map(([k,x,y,w,h])=>{
    const o = {k,x,y,w,h,vx:0,vy:0,fl:0};
    if(k==='bird'){o.hp=1;o.m=5;o.cat=cats[n++%3];o.ph=n}
    else if(k==='cage'){const B=BLK.cage;o.hp=o.mhp=B.hp;o.m=Math.max(1,w*h*B.dn/25)}
    else{const B=BLK[k];o.hp=o.mhp=B.hp;o.m=Math.max(1,w*h*B.dn/25)}
    return o;
  });

  let shots = 3;
  ap.queue = Array(shots).fill('pig');
  ap.queue.push('wing'); // Heo Cánh
  if(i >= 2) ap.queue.push('coin'); // Heo Bom Cám

  ap.free = [];
  ap.cages = L.it.filter(a=>a[0]==='cage').length;
  ap.rescued = 0;
  ap.winT = 0;
  ap.birds0 = L.it.filter(a=>a[0]==='bird').length;
  ap.pig = null;
  ap.drag = null;
  ap.parts = [];
  ap.floats = [];
  ap.kills = 0;
  ap.over = null;
  ap.settle = 0;
  ap.acc = 0;

  apNextPig();
  apNote('Màn ' + (i+1) + ': ' + L.n + (ap.wind !== 0 ? ' · Gió ' + (ap.wind>0?'+':'') + ap.wind + ' px/s' : ''));
}

function apNextPig(){
  ap.cur = ap.queue.shift() || null;
  ap.st = ap.cur ? 'aim' : 'end';
  ap.settle = 0;
}

function apPuff(x,y,n,col,spd,life,kind){
  for(let i=0; i<n && ap.parts.length<160; i++){
    const a = Math.random()*6.283, s = (.3 + Math.random()*.7)*spd;
    ap.parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-20,life,max:life,col,kind:kind||'sq'});
  }
}

function apKill(b){
  const idx = ap.blocks.indexOf(b); if(idx < 0) return;
  ap.blocks.splice(idx, 1);
  if(b.k==='bird'){
    ap.kills++; notify('HAPTIC_SUCCESS');
    apPuff(b.x+7,b.y+7,12,'#FFE58A',70,.8);
    apPuff(b.x+7,b.y+7,4,'#FFFBF1',50,.8);
    ap.floats.push({x:b.x+7,y:b.y,txt:'+1',life:.9,col:'#C98A12'});
    ap.shake=.15;
  } else {
    apPuff(b.x+b.w/2,b.y+b.h/2,8,BLK[b.k].c,60,.6);
    apPuff(b.x+b.w/2,b.y+b.h/2,3,BLK[b.k].d,50,.6);
    if(b.k==='cage'){
      ap.rescued++; notify('HAPTIC_SUCCESS');
      ap.free.push({x:b.x+b.w/2,y:b.y+b.h-6,vy:-90,t:0,gone:false});
      ap.floats.push({x:b.x+8,y:b.y-4,txt:'+Cứu Heo!',life:1.1,col:'#3E7A3A'});
      apPuff(b.x+11,b.y+8,10,'#F4B93B',70,.7);
    }
  }
}

function apImpact(b,spd){
  if(spd < 36) return;
  b.fl = .15;
  if(b.k==='bird'){ if(spd > 32) apKill(b); }
  else {
    b.hp -= (spd - 36) * .9;
    if(b.hp <= 0) apKill(b);
  }
}

function apTopple(b,dir){
  if(b.k==='bird' || b.h < b.w*2) return;
  const w=b.w, h=b.h; b.w=h; b.h=w; b.y+=h-w; if(dir<0) b.x-=h-w; b.vx=dir*30;
}

function apSep(a,b){
  const ox = Math.min(a.x+a.w, b.x+b.w) - Math.max(a.x, b.x);
  const oy = Math.min(a.y+a.h, b.y+b.h) - Math.max(a.y, b.y);
  if(ox <= .01 || oy <= .01) return;
  if(oy <= ox){
    const up = a.y<b.y?a:b, lo = up===a?b:a, rel = Math.abs(up.vy-lo.vy);
    up.y = lo.y-up.h; apImpact(up, rel); apImpact(lo, rel*.5);
    up.vy = 0; lo.vy = 0; up.vx = lo.vx+(up.vx-lo.vx)*.8;
  } else {
    const l = a.x<b.x?a:b, r = l===a?b:a, rel = Math.abs(l.vx-r.vx), push=ox/2;
    l.x -= push; r.x += push; const v = (l.vx*l.m + r.vx*r.m)/(l.m+r.m);
    apImpact(l, rel*.8); apImpact(r, rel*.8); l.vx=r.vx=v;
  }
}

function apStep(dt){
  const bl = ap.blocks;
  bl.forEach(b=>{
    b.vy += AGR * dt; b.y += b.vy * dt; b.x += b.vx * dt; b.vx *= .996;
    if(b.fl > 0) b.fl -= dt;
    if(b.y + b.h > AG){
      const s = Math.abs(b.vy); b.y = AG - b.h; b.vy = 0; b.vx *= .9; apImpact(b,s);
    }
    if(Math.abs(b.vx) < 1.2) b.vx = 0;
  });
  for(let i=0; i<bl.length; i++) for(let j=i+1; j<bl.length; j++){
    if(bl[i] && bl[j]) apSep(bl[i], bl[j]);
  }
  apFreeStep(dt);

  const p = ap.pig;
  if(p){
    p.t += dt;
    p.vx += ap.wind * dt; // Tác động gió
    p.vy += AGR * dt;
    p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vx * dt * .05;
    const R = 6.5;
    if(p.y + R > AG){
      p.y = AG - R; p.vy = -p.vy * .3; p.vx *= .82; if(Math.abs(p.vy) < 14) p.vy = 0;
    }
    for(const b of ap.blocks.slice()){
      const cx = Math.max(b.x, Math.min(p.x, b.x + b.w));
      const cy = Math.max(b.y, Math.min(p.y, b.y + b.h));
      const dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy);
      if(d >= R) continue;
      const nx = d > 0 ? dx / d : 0, ny = d > 0 ? dy / d : -1, vn = -(p.vx*nx + p.vy*ny);
      p.x += nx * (R - d); p.y += ny * (R - d);
      if(vn <= 0) continue;
      if(b.k==='bird'){ if(vn > 18){ apKill(b); p.vx *= .8; continue; } }
      const j = 1.3 * vn * 8 * b.m / (8 + b.m);
      p.vx += nx * j / 8; p.vy += ny * j / 8;
      b.vx -= nx * j / b.m; b.vy -= ny * j / b.m * .4;
      if(Math.abs(nx) > .5 && Math.abs(j / b.m) > 35) apTopple(b, -Math.sign(nx));
      const dmg = vn * (p.type==='wing'?1.25:1) * .9;
      apPuff(p.x, p.y, 3, '#FFFBF1', 40, .3);
      b.fl = .15;
      if(b.k!=='bird'){ b.hp -= dmg; if(b.hp <= 0){ apKill(b); p.vx *= .85; p.vy *= .85; } }
    }
    if(p.x > AW + 30 || p.x < -30 || p.t > 6 || (p.y + R >= AG - .5 && Math.abs(p.vx) < 9 && Math.abs(p.vy) < 9 && (p.rest = (p.rest||0) + dt) > .8)){
      apPuff(p.x, p.y, 6, '#F9B8C4', 40, .4);
      ap.pig = null;
    }
  }
}

function apFreeStep(dt){
  ap.free.forEach(f=>{
    f.t += dt;
    if(f.t < 1){
      f.vy += AGR * dt; f.y += f.vy * dt;
      if(f.y > AG - 5){ f.y = AG - 5; f.vy = -35; }
    } else {
      f.y = AG - 5; f.x -= 44 * dt;
      if(f.x < -14) f.gone = true;
    }
  });
}

function apAbility(){
  const p = ap.pig; if(!p || p.used) return;
  p.used = true;
  if(p.type==='wing'){
    const s = Math.hypot(p.vx, p.vy) * 1.6;
    p.vx = p.vx / Math.max(1, Math.hypot(p.vx, p.vy)) * s;
    p.vy = p.vy * .3; p.boost = .5;
    notify('HAPTIC_LIGHT');
    apPuff(p.x, p.y, 8, '#FFFBF1', 50, .4);
  } else if(p.type==='coin'){
    notify('HAPTIC_SUCCESS');
    apPuff(p.x, p.y, 16, '#F4B93B', 90, .6);
    apPuff(p.x, p.y, 8, '#FFF08A', 70, .5);
    ap.shake = .2;
    ap.blocks.slice().forEach(b=>{
      const cx = b.x + b.w/2, cy = b.y + b.h/2, d = Math.hypot(cx - p.x, cy - p.y);
      if(d < 34){
        const k = 1 - d/34;
        b.vx += (cx - p.x) / Math.max(6, d) * 140 * k / Math.sqrt(b.m);
        b.vy -= 60 * k;
        if(b.k==='bird') apKill(b);
        else { b.hp -= 70 * k; b.fl = .2; if(b.hp <= 0) apKill(b); }
      }
    });
    ap.pig = null;
  }
}

/* Vẽ chi tiết canvas */
const apC = $('apCv'), apX = apC.getContext('2d');
const DPR = 3;
apC.width = AW * DPR;
apC.height = AH * DPR;
apC.style.width = '100%';
apC.style.height = '100%';
apX.imageSmoothingEnabled = false;

function drawBirdy(c,b,t){
  const x = Math.round(b.x+7), y = Math.round(b.y+7+(b.fl>0?0:Math.sin(t*3+b.ph)*.6)), fl = b.fl>0;
  E(c,x,y,7,7,INK); E(c,x,y,6,6,fl?'#FFFFFF':'#FFE58A'); R(c,x-3,y+2,7,3,fl?'#FFFFFF':'#FFF6C8');
  R(c,x-1,y-9,1,3,INK); R(c,x+1,y-8,1,2,INK); R(c,x-6,y-4,12,1,CATC[b.cat]);
  R(c,x-4,y-3,3,1,INK); R(c,x+2,y-3,3,1,INK); R(c,x-3,y-1,2,2,INK); R(c,x+2,y-1,2,2,INK); R(c,x-1,y+1,3,2,'#F28C28');
}

function drawCage(c,b){
  const x = Math.round(b.x), y = Math.round(b.y), w = Math.round(b.w), h = Math.round(b.h), fl = b.fl>0;
  hpx.clearRect(0,0,24,20);
  drawPigSprite(hpx,{pose:'stand',frame:0,mood:'sad',happy:false,blink:false,tail:false});
  c.drawImage(hp,0,0,24,20,x+5,y+7,13,11);
  R(c,x,y,w,2,INK); R(c,x,y+h-2,w,2,INK); R(c,x,y,2,h,INK); R(c,x+w-2,y,2,h,INK);
  for(let i=x+5; i<x+w-3; i+=4) R(c,i,y+2,2,h-4,fl?'#FFFFFF':'#B9B2A6');
  R(c,x+2,y+2,w-4,1,'#F2F2F8');
  R(c,x+(w>>1)-2,y+h-6,5,4,'#F4B93B'); R(c,x+(w>>1)-2,y+h-6,5,1,INK);
}

function drawNest(c,t){
  const x=204; E(c,x+10,AG-1,22,6,INK); E(c,x+10,AG-1,21,5,'#8A5A34');
  for(let i=0; i<16; i++) R(c,x-8+i*3+(i%2),AG-5+(i*5%4),4,1,i%3?'#C49A6E':'#6B4426');
  R(c,AW-12,AG-34,2,34,INK); R(c,AW-11,AG-34,1,34,'#8A5A34');
  R(c,AW-10,AG-34,9,6,INK); R(c,AW-9,AG-33,7,4,'#E0452B');
}

function drawFreed(c,f,t){
  hpx.clearRect(0,0,24,20); const up = f.t < 1;
  drawPigSprite(hpx,{pose:up?'stand':'walk',frame:Math.floor(t*8)%2,mood:'ok',happy:true,blink:false,tail:false});
  c.save(); c.translate(Math.round(f.x),Math.round(f.y)); c.scale(up?1:-1,1);
  c.drawImage(hp,0,0,24,20,-7,-6,14,12); c.restore();
  if(up) heart(c,Math.round(f.x)-2,Math.round(f.y)-14,'#E0452B');
}

function drawBlk(c,b){
  if(b.k==='cage'){ drawCage(c,b); return; }
  const B = BLK[b.k], x = Math.round(b.x), y = Math.round(b.y), w = Math.round(b.w), h = Math.round(b.h);
  R(c,x,y,w,h,INK); R(c,x+1,y+1,w-2,h-2,b.fl>0?'#FFFFFF':B.c); R(c,x+1,y+1,w-2,1,'rgba(255,255,255,.45)');
  if(b.k==='wood'){
    if(w>h) for(let i=x+4; i<x+w-3; i+=7) R(c,i,y+2,1,h-3,B.d);
    else for(let j=y+4; j<y+h-3; j+=7) R(c,x+2,j,w-3,1,B.d);
  }
  if(b.k==='stone'){ R(c,x+2,y+3,2,2,B.d); R(c,x+w-4,y+h-5,2,2,B.d); }
  if(b.k==='glass'){ R(c,x+2,y+1,Math.max(2,w/3|0),1,'#FFFFFF'); }
  if(b.hp < b.mhp * .55){ R(c,x+(w>>1),y+1,1,h-2,INK); R(c,x+(w>>1)+1,y+(h>>1),2,1,INK); }
}

function drawPigAP(c,x,y,type,rot,t,pose){
  hpx.clearRect(0,0,24,20);
  drawPigSprite(hpx,{pose:'stand',frame:0,mood:'ok',happy:pose==='fly',blink:false,tail:Math.floor(t*6)%2===1});
  c.save(); c.translate(Math.round(x),Math.round(y)); c.rotate(Math.round(rot*4)/4);
  c.drawImage(hp,0,0,24,20,-9,-8,18,15);
  if(type==='wing') shape(c,WING[pose==='fly'?(Math.floor(t*10)%2?0:2):2],'#FFFBF1',-2,-3);
  if(type==='coin'){ E(c,0,-11,5,5,INK); E(c,0,-11,4,4,'#F4B93B'); R(c,-1,-12,2,2,'#FFF08A'); }
  c.restore();
}

function drawAP(c,t){
  c.imageSmoothingEnabled = false; c.save();
  c.scale(DPR, DPR);
  if(ap.shake > 0) c.translate(Math.round(Math.sin(t*90)*1.5), Math.round(Math.cos(t*70)*1.5));

  // Bầu trời pha màu 8 dải
  const [top, hor] = skyAt(.3);
  for(let i=0; i<8; i++) R(c, 0, i*16, AW, 17, mix(top, hor, i/7));
  E(c, 200, 22, 8, 8, INK); E(c, 200, 22, 7, 7, '#FFE27A');

  // Mây trôi
  ap.clouds.forEach(k=>{
    k[0] -= .05; if(k[0] < -20) k[0] = AW + 20;
    sCloud(c, Math.round(k[0]), k[1], k[2], '#FFFFFF');
  });

  // Parallax scenery
  c.drawImage(FAR[0], 0, AG-110);
  c.drawImage(MID[0], 0, AG-96);
  c.drawImage(GROUND[0], 0, AG);

  // Hiển thị gió
  if(ap.wind !== 0){
    c.font = 'bold 8.5px sans-serif'; c.fillStyle = INK;
    c.fillText((ap.wind > 0 ? '➡ +' : '⬅ ') + ap.wind + ' px/s', AW - 65, 14);
  }

  // Ná gỗ 3D
  R(c, SX-2, AG-30, 5, 30, INK); R(c, SX-1, AG-30, 3, 30, '#8A5A34');
  R(c, SX-8, AG-38, 4, 10, INK); R(c, SX-7, AG-38, 2, 10, '#8A5A34');
  R(c, SX+4, AG-38, 4, 10, INK); R(c, SX+5, AG-38, 2, 10, '#A87650');

  // Đàn heo chờ (xếp tầng sau bệ ná, không đè lên bệ ná SX)
  const qLen = ap.queue.length;
  const qStep = qLen > 1 ? Math.min(6, 18 / (qLen - 1)) : 0;
  ap.queue.forEach((q, i) => drawPigAP(c, 8 + i * qStep, AG - 8, q, 0, t, 'wait'));

  // Khối + Chim + Tổ
  drawNest(c, t);
  ap.blocks.filter(b=>b.k!=='bird').forEach(b=>drawBlk(c,b));
  ap.free.forEach(f=>{ if(!f.gone) drawFreed(c,f,t); });
  ap.blocks.filter(b=>b.k==='bird').forEach(b=>drawBirdy(c,b,t));

  // Dây ná & Heo trên ná
  const d = ap.drag, px = SX + (d ? d.dx : 0), py = SY + (d ? d.dy : 0);
  if(ap.st==='aim' && ap.cur){
    if(d){
      // 14 chấm quỹ đạo xen kẽ
      for(let i=1; i<=14; i++){
        const tt = i * .07, vx = -d.dx * AK, vy = -d.dy * AK;
        const x = px + vx * tt, y = py + vy * tt + .5 * AGR * tt * tt;
        if(y < AG) R(c, Math.round(x), Math.round(y), 2, 2, i%2 ? '#FFFBF1' : INK);
      }
      // Dây cao su 2 bên chạc
      [[SX-6, SY-6], [SX+6, SY-6]].forEach(([ax, ay])=>{
        const n = 14;
        for(let i=0; i<=n; i++){
          const u = i / n;
          R(c, Math.round(ax + (px - ax)*u), Math.round(ay + (py - ay)*u), 1, 2, '#5A2B1A');
        }
      });
    }
    drawPigAP(c, px, py, ap.cur, 0, t, 'aim');
  }

  // Heo đang bay
  if(ap.pig){
    const p = ap.pig;
    if(p.boost > 0){
      p.boost -= 1/60;
      for(let i=1; i<4; i++) R(c, Math.round(p.x - p.vx*.012*i), Math.round(p.y), 3, 1, 'rgba(255,251,241,.8)');
    }
    drawPigAP(c, p.x, p.y, p.type, Math.atan2(p.vy, p.vx)*.5, t, 'fly');
  }

  [[SX-6, SY-6], [SX+6, SY-6]].forEach(([ax, ay]) => R(c, ax-1, ay, 3, 3, INK));

  // Khói vỡ
  ap.parts.forEach(p=>{
    p.life -= 1/60; p.x += p.vx/60; p.y += p.vy/60; p.vy += 160/60;
    c.globalAlpha = Math.max(0, p.life/p.max);
    R(c, Math.round(p.x), Math.round(p.y), 2, 2, p.col);
    c.globalAlpha = 1;
  });
  ap.parts = ap.parts.filter(p=>p.life > 0);

  // Số nhảy nổi
  ap.floats.forEach(f=>{
    f.life -= 1/60; f.y -= .4;
    c.globalAlpha = Math.min(1, f.life * 2);
    stamp(c, f.txt, Math.round(f.x)-3, Math.round(f.y)+1, '#FFFBF1');
    stamp(c, f.txt, Math.round(f.x)-4, Math.round(f.y), f.col);
    c.globalAlpha = 1;
  });
  ap.floats = ap.floats.filter(f=>f.life > 0);

  c.restore();
}

function apFinish(win){
  const left = ap.queue.length + (ap.cur ? 1 : 0);
  const stars = win ? 1 + (ap.kills * 2 >= ap.birds0 ? 1 : 0) + (left >= 1 ? 1 : 0) : 0;
  const food = ap.kills * 2 + ap.rescued * 3 + (win ? stars * 2 : 0);
  ap.stars[ap.lv] = Math.max(ap.stars[ap.lv] || 0, stars);

  ap.st = 'over';
  ap.over = { win, stars, food };
  notify(win ? 'HAPTIC_SUCCESS' : 'HAPTIC_FAIL');
  if(win) notify('SAVE_STATS', { wave: ap.lv + 1, savedBabies: ap.rescued, foodEarned: food });

  const el = $('apOver'); el.hidden = false;
  el.innerHTML = '<div class="card fo"><b>' + (win ? 'CỨU ĐƯỢC HEO CON!' : 'HEO CON VẪN BỊ NHỐT') + '</b>' +
    '<span class="label">' + getLevel(ap.lv).n + '</span>' +
    '<div class="stars">' + [1, 2, 3].map(i => '<i class="' + (i <= stars ? 'on' : '') + '"></i>').join('') + '</div>' +
    '<p>+' + food + ' thức ăn · ' + (win ? 'giải cứu thêm heo con vào đội!' : 'cố gắng ngắm chuẩn hơn nhé!') + '</p>' +
    '<div class="pact"><button class="btn" type="button" id="apRetry">Chơi lại</button>' +
    (win ? '<button class="btn gold" type="button" id="apNext">Màn kế</button>' : '<button class="btn gold" type="button" id="apRetry2">Thử lại</button>') + '</div></div>';

  $('apRetry').onclick = () => apStart(ap.lv);
  const nextBtn = $('apNext') || $('apRetry2');
  if(nextBtn) nextBtn.onclick = () => apStart(win ? ap.lv + 1 : ap.lv);
}

function apStart(i){
  $('apOver').hidden = true; $('apOver').innerHTML = '';
  apLoad(i); apUI();
}

function apUpdate(dt){
  ap.t += dt; if(ap.shake > 0) ap.shake -= dt;
  ap.acc += dt; let n = 0;
  if(ap.st !== 'over'){
    while(ap.acc >= 1/120 && n < 4){ apStep(1/120); ap.acc -= 1/120; n++; }
  } else ap.acc = 0;

  if(ap.st==='fly' && !ap.pig){ ap.st = 'settle'; ap.settle = 0; }
  if(ap.st==='settle'){
    const mv = ap.blocks.reduce((m, b) => Math.max(m, Math.abs(b.vx), Math.abs(b.vy)), 0);
    ap.settle = mv < 8 ? ap.settle + dt : 0;
    if(ap.settle > .9 && ap.rescued < ap.cages){
      if(!ap.queue.length) apFinish(false);
      else { apNextPig(); apUI(); }
    }
  }
  if(ap.cages && ap.rescued >= ap.cages && ap.st !== 'over'){
    ap.winT += dt;
    if(ap.winT > 1.8) apFinish(true);
  }
}

function apUI(){
  const L = getLevel(ap.lv);
  $('apLvT').textContent = 'Màn ' + (ap.lv + 1) + ' · ' + L.n;
  $('apStars').textContent = String(ap.stars.reduce((a,b)=>a+(b||0),0));
  $('apBirds').textContent = ap.rescued + '/' + ap.cages;
  const left = ap.queue.length + (ap.cur ? 1 : 0);
  $('apPigs').textContent = 'Đạn còn: ' + left + (ap.cur ? ' · Đang ngắm: ' + (ap.cur==='wing'?'Heo Cánh':ap.cur==='coin'?'Heo Bom':'Heo Mẹ') : '');
  document.querySelectorAll('#apLv .btn').forEach((b, i) => b.setAttribute('aria-pressed', String(i === ap.lv)));
}

let lastT = performance.now();
function apFrame(now){
  const dt = Math.min(.05, (now - lastT) / 1000);
  lastT = now;
  apUpdate(dt);
  drawAP(apX, now / 1000);
  apUI();
  requestAnimationFrame(apFrame);
}

// Level chips
for(let i=0; i<6; i++){
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'btn'; b.textContent = 'Màn ' + (i+1);
  b.addEventListener('click', () => apStart(i));
  $('apLv').appendChild(b);
}

// Bắt cảm ứng kéo ná (Hỗ trợ Touch di động + Pointer Capture + Mở rộng vùng chạm)
function apPt(e){
  const r = apC.getBoundingClientRect();
  const touch = (e.touches && e.touches.length > 0) ? e.touches[0]
              : (e.changedTouches && e.changedTouches.length > 0) ? e.changedTouches[0]
              : e;
  const clientX = touch.clientX !== undefined ? touch.clientX : (touch.pageX || 0);
  const clientY = touch.clientY !== undefined ? touch.clientY : (touch.pageY || 0);
  return [(clientX - r.left) / r.width * AW, (clientY - r.top) / r.height * AH];
}

function handleStart(e){
  if(ap.over) return;
  if(ap.pig){ apAbility(); return; }
  if(ap.st !== 'aim' || !ap.cur) return;
  const [x, y] = apPt(e);
  // Mở rộng vùng chạm ná (bán kính 40px hoặc toàn bộ khu vực ná bên trái)
  if(Math.hypot(x - SX, y - SY) < 40 || (x < 85 && y > 45 && y < 135)){
    if(e && e.cancelable) e.preventDefault();
    if(e.pointerId && apC.setPointerCapture){
      try { apC.setPointerCapture(e.pointerId); } catch(err){}
    }
    let dx = x - SX, dy = y - SY;
    const d = Math.hypot(dx, dy);
    if(d > MAXD){ dx = dx / d * MAXD; dy = dy / d * MAXD; }
    ap.drag = { dx, dy };
    notify('HAPTIC_LIGHT');
  }
}

function handleMove(e){
  if(!ap.drag) return;
  if(e && e.cancelable) e.preventDefault();
  const [x, y] = apPt(e);
  let dx = x - SX, dy = y - SY;
  const d = Math.hypot(dx, dy);
  if(d > MAXD){ dx = dx / d * MAXD; dy = dy / d * MAXD; }
  ap.drag = { dx, dy };
}

function handleEnd(e){
  if(!ap.drag) return;
  if(e && e.cancelable) e.preventDefault();
  const { dx, dy } = ap.drag;
  ap.drag = null;
  if(Math.hypot(dx, dy) > 5){
    ap.pig = {
      x: SX + dx, y: SY + dy,
      vx: -dx * AK, vy: -dy * AK,
      type: ap.cur, t: 0, used: false, rot: 0
    };
    ap.cur = null;
    ap.st = 'fly';
    notify('HAPTIC_LIGHT');
  }
}

apC.addEventListener('pointerdown', handleStart);
window.addEventListener('pointermove', handleMove);
window.addEventListener('pointerup', handleEnd);
window.addEventListener('pointercancel', handleEnd);

apC.addEventListener('touchstart', handleStart, { passive: false });
window.addEventListener('touchmove', handleMove, { passive: false });
window.addEventListener('touchend', handleEnd, { passive: false });
window.addEventListener('touchcancel', handleEnd, { passive: false });

apLoad(0);
requestAnimationFrame(apFrame);

})();
</script>
</body>
</html>
`;

  const memoizedSource = useMemo(() => ({ html: htmlContent }), [htmlContent]);

  return (
    <View style={styles.container}>
      {/* Top Header bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.8}>
          <ArrowLeft size={16} color="#2B2118" strokeWidth={2.8} />
          <Text style={styles.backButtonText}>‹ Quay lại Hub</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reloadButton} onPress={handleReload} activeOpacity={0.8}>
          <RefreshCw size={15} color="#2B2118" strokeWidth={2.6} />
        </TouchableOpacity>
      </View>

      {/* Webview Game Canvas */}
      <View style={styles.webViewWrapper}>
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F6EEDC',
    borderBottomWidth: 2,
    borderBottomColor: '#2B2118',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBF1',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  backButtonText: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 12,
    color: '#2B2118',
  },
  reloadButton: {
    backgroundColor: '#FFFBF1',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 999,
    padding: 7,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
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
