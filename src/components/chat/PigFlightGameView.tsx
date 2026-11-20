import React, { useMemo, useRef, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, RefreshCw } from 'lucide-react-native';

const SafeWebView = WebView as unknown as React.ComponentType<any>;

interface PigFlightGameViewProps {
  onBack: () => void;
  onSwitchGame?: (game: 'fly' | 'shooter') => void;
  tickets?: number;
  food?: number;
  hunger?: number;
  onFeedPig?: () => void;
  onSaveStats?: (stats: { flyBestScore?: number; foodEarned?: number }) => void;
}

export const PigFlightGameView: React.FC<PigFlightGameViewProps> = ({
  onBack,
  onSwitchGame,
  tickets = 3,
  food = 10,
  hunger = 75,
  onFeedPig,
  onSaveStats,
}) => {
  const webViewRef = useRef<any>(null);
  const { width: winWidth, height: winHeight } = useWindowDimensions();
  const [contentHeight, setContentHeight] = useState<number>(winHeight - 65);

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
            flyBestScore: data.score,
            foodEarned: data.foodEarned,
          });
        }
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
  padding: 10px 14px 40px;
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
.flyhud {
  margin-top: 10px;
  padding: 8px 12px 10px;
}
.flyhud .hrow {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.flyhud .hrow b {
  font: 800 13px/1.2 var(--f-display);
}
.hbar {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 3px;
  margin-top: 6px;
  padding: 3px;
  border: 2.5px solid var(--ink);
  border-radius: 999px;
  background: var(--card);
}
.hbar i {
  height: 9px;
  border-radius: 999px;
  transition: background .2s;
}
.scene.flywrap {
  position: relative;
  margin-top: 10px;
  background: #BFE6F6;
  border: 3px solid var(--ink);
  border-radius: 22px;
  box-shadow: 0 4px 0 var(--ink);
  overflow: hidden;
  touch-action: manipulation;
  text-align: center;
}
.scene.flywrap canvas {
  display: block;
  width: 100%;
  max-width: 360px;
  height: auto;
  margin: 0 auto;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  cursor: pointer;
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
.flyhint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 76px;
  text-align: center;
  pointer-events: none;
  font: 800 11.5px/1.2 var(--f-body);
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--ink);
  z-index: 2;
}
.flyhint span {
  display: inline-block;
  padding: 5px 12px;
  background: var(--gold);
  border: 2.5px solid var(--ink);
  border-radius: 999px;
  box-shadow: 0 3px 0 var(--ink);
  animation: fbob 1s ease-in-out infinite alternate;
}
@keyframes fbob { to { transform: translateY(-4px); } }
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
</style>
</head>
<body>

  <!-- Top switcher -->
  <div class="gbar">
    <div class="gseg">
      <button type="button" id="tabFly" class="active">Heo bay</button>
      <button type="button" id="tabShoot">Heo bắn</button>
    </div>
    <div class="gtix"><i>🎫</i><b id="uiTix">${tickets}</b> vé</div>
  </div>

  <div class="flytop">
    <div class="who"><b>Heo Bay · Bão Gió</b><span id="flyZone">Vườn nhà</span></div>
    <div class="fscore"><span class="label">Điểm</span><b id="flyScore">0</b></div>
    <div class="fscore"><span class="label">Kỷ lục</span><b id="flyBest">0</b></div>
  </div>

  <div class="card flyhud">
    <div class="hrow"><span class="label">Độ no</span><b id="flyHungerT">Vừa bụng</b></div>
    <div class="hbar" id="flyBar" role="progressbar"></div>
  </div>

  <div class="scene flywrap" id="flyWrap">
    <canvas id="flyCv" width="176" height="224"></canvas>
    <div class="flytoast" id="flyToast"></div>
    <div class="flyhint" id="flyHint"><span>Chạm để vỗ cánh</span></div>
    <div class="flyover" id="flyOver" hidden></div>
  </div>

  <div class="flystats">
    <div><span class="label">Đã ăn</span><b id="flyEaten">0</b></div>
    <div><span class="label">Thức ăn</span><b id="flyCoin">0</b></div>
    <div><span class="label">Thời tiết</span><b id="flyWeather">Trời quang</b></div>
  </div>

  <div class="flyctl">
    <button class="btn big" type="button" id="flyBtn">Vỗ cánh</button>
    <button class="btn" type="button" id="flyPause">Tạm dừng</button>
    <button class="btn" type="button" id="flyWx">Đổi bão</button>
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

// Chuyển game
$('tabShoot').addEventListener('click', () => notify('SWITCH_GAME', { game: 'shooter' }));

function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const PAL={o:'#4B2B21',p:'#F9B8C4',s:'#EE90A6',n:'#F08DA4',k:'#2B2118',w:'#FFFFFF'};
const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};
const E=(c,cx,cy,rx,ry,col)=>{c.fillStyle=col;for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++)if(x*x/(rx*rx)+y*y/(ry*ry)<=1)c.fillRect(cx+x,cy+y,1,1)};
function shape(c,rows,fill,ox,oy){
  c.fillStyle=PAL.o;for(const [ax,ay] of [[-1,0],[1,0],[0,-1],[0,1]])for(const [y,x0,x1] of rows)c.fillRect(ox+x0+ax,oy+y+ay,x1-x0+1,1);
  c.fillStyle=fill;for(const [y,x0,x1] of rows)c.fillRect(ox+x0,oy+y,x1-x0+1,1);
}
function mk(w,h,fn){const cv=document.createElement('canvas');cv.width=w;cv.height=h;fn(cv.getContext('2d'));return cv}

/* Sprite heo 24x20 */
function drawPigSprite(c,o){
  const P=PAL;
  shape(c,[[0,6,17],[1,5,18],[2,4,19],[3,3,20],[4,3,20],[5,2,21],[6,2,21],[7,2,21],[8,2,21],[9,2,21],[10,2,21],[11,3,20],[12,3,20],[13,4,19],[14,5,18]],P.p,0,2);
  shape(c,[[0,4,7],[1,3,7],[2,3,6]],P.s,0,0);
  shape(c,[[0,13,16],[1,13,17],[2,14,17]],P.s,0,0);
  shape(c,[[0,9,14],[1,8,15],[2,8,15],[3,9,14]],P.n,0,10);
  R(c,10,11,1,2,P.k);R(c,13,11,1,2,P.k);
  if(o.blink){R(c,6,9,3,1,P.k);R(c,16,9,3,1,P.k)}
  else{R(c,6,8,2,2,P.k);R(c,16,8,2,2,P.k);R(c,6,8,1,1,P.w);R(c,16,8,1,1,P.w)}
  if(o.happy){R(c,11,14,2,1,P.k)}
  R(c,4,11,2,1,P.s);R(c,18,11,2,1,P.s);
  R(c,6,17,3,2,P.s);R(c,15,17,3,2,P.s);
}
const hp=mk(24,20,c=>drawPigSprite(c,{blink:false}));

/* Heo bay constants */
const FW=176,FH=224,GY=198,BLEN=900,OW=16;
const BIOMES=[
  {id:'vuon',n:'Vườn nhà',bg:'#BFE6F6'},
  {id:'ruong',n:'Đồng lúa',bg:'#D8EBD4'},
  {id:'pho',n:'Phố chợ',bg:'#E2EAF4'},
  {id:'ao',n:'Hồ sen',bg:'#F6DCE2'}
];

function pillar(c,x,y0,y1,top){
  const h=y1-y0;if(h<=0)return;
  R(c,x,y0,OW,h,'#2B2118');
  R(c,x+2,y0,OW-4,h,'#8A5A34');
  R(c,x+3,y0,3,h,'#B07A48');
  const ey=top?y1-5:y0;
  R(c,x-2,ey,OW+4,5,'#2B2118');
  R(c,x-1,ey+1,OW+2,3,'#F4B93B');
}

const FOODS=[{k:'carrot',v:14},{k:'corn',v:16},{k:'apple',v:20},{k:'melon',v:26}];
function drawFood(c,k,x,y){
  if(k==='apple'){E(c,x,y,5,5,'#2B2118');E(c,x,y,4,4,'#E0452B');R(c,x-2,y-2,2,2,'#FF8A6B');}
  else if(k==='corn'){E(c,x,y,4,6,'#2B2118');E(c,x,y,3,5,'#F4D03F');}
  else if(k==='melon'){shape(c,[[-2,-5,5],[-1,-5,5],[0,-4,4],[1,-3,3]],'#5EA04C',x,y);}
  else{E(c,x,y,5,5,'#2B2118');E(c,x,y,4,4,'#F4B93B');R(c,x-1,y-2,1,4,'#FFF08A');}
}

const GRAV=560,FLAP=-172,PX=44;
const fly={
  mode:'ready',y:96,vy:0,flapT:0,eatT:0,
  dist:0,speed:62,score:0,eaten:0,hunger:78,best:0,
  weather:'clear',rainDrops:[],
  whirlwinds:[],enemyBirds:[],
  pillars:[],items:[],floats:[],shake:0,msg:'',msgT:0,cause:'',paused:false
};

try{fly.best=+localStorage.getItem('vhc-fly-best')||0}catch(e){}
$('flyBest').textContent=String(fly.best);

let lastGy=100;
const rnd=(a,b)=>a+Math.random()*(b-a);

function flyMsg(t,s){fly.msg=t;fly.msgT=s||2;const e=$('flyToast');if(e){e.textContent=t;e.classList.add('on');clearTimeout(fly.toTimer);fly.toTimer=setTimeout(()=>e.classList.remove('on'),(s||2)*1000);}}

function flyReset(){
  Object.assign(fly,{
    mode:'ready',y:96,vy:0,flapT:0,eatT:0,dist:0,speed:62,score:0,eaten:0,hunger:78,
    pillars:[],items:[],floats:[],whirlwinds:[],enemyBirds:[],shake:0,cause:'',paused:false
  });
  lastGy=100;
  flyMsg('Chạm để vỗ cánh',99);
}

function spawnPillar(){
  const gap=Math.max(50, 64 - Math.floor(fly.score / 5));
  const lo=24+gap/2, hi=GY-24-gap/2;
  let gy=rnd(lo,hi);
  gy=Math.max(lo,Math.min(hi,lastGy+Math.max(-56,Math.min(56,gy-lastGy))));
  const x=FW+OW+4;lastGy=gy;
  fly.pillars.push({x,gy,gap,passed:false});

  // Đồ ăn hái tiếp sức
  if(Math.random()<.8){
    const f=FOODS[Math.floor(Math.random()*FOODS.length)];
    fly.items.push({k:f.k,v:f.v,x:x+OW/2,y:gy});
  }

  // Chướng ngại vật động: Chim đối thủ bay ngược chiều
  if(fly.score >= 3 && Math.random() < 0.45){
    fly.enemyBirds.push({
      x: FW + 40,
      y: rnd(30, GY - 30),
      vx: -(rnd(60, 95)),
      t: 0
    });
  }

  // Chướng ngại vật động: Gió lốc đẩy trôi
  if(fly.score >= 5 && Math.random() < 0.35){
    fly.whirlwinds.push({
      x: FW + 50,
      y: rnd(50, GY - 50),
      dir: Math.random() > 0.5 ? 1 : -1,
      t: 0
    });
  }
}

function flyFlap(){
  if(fly.mode==='dead'||fly.paused)return;
  if(fly.mode==='ready'){
    fly.mode='play';fly.msgT=0;fly.hunger=78;
    $('flyHint').style.display='none';
    flyMsg('Né chim đối thủ & hái thức ăn!',2);
  }
  fly.vy=FLAP;fly.flapT=.2;
  notify('HAPTIC_LIGHT');
}

function flyDie(cause){
  if(fly.mode==='dead')return;
  fly.mode='dead';fly.cause=cause;fly.vy=cause==='starve'?-40:-120;fly.shake=.3;
  if(fly.score>fly.best){
    fly.best=fly.score;
    $('flyBest').textContent=String(fly.best);
    try{localStorage.setItem('vhc-fly-best',String(fly.best))}catch(e){}
  }
  notify('HAPTIC_FAIL');
  notify('SAVE_STATS', { score: fly.score, foodEarned: fly.eaten });

  const msgs = {
    pillar:'Đụng phải cột chi tiêu rồi!',
    ground:'Chạm đất rồi!',
    starve:'Đói lả, hết sức bay!',
    bird:'Bị chim đối thủ húc trúng!'
  };
  flyMsg(msgs[cause] || 'Hết lượt bay!', 99);
  setTimeout(flyShowOver, 600);
}

function flyShowOver(){
  const o=$('flyOver');o.hidden=false;
  o.innerHTML='<div class="card fo"><b>HẾT LƯỢT BAY!</b>'+
  '<p>'+(fly.cause==='bird'?'Bị chim đối thủ tấn công!':'Kỷ luật thép để bay xa hơn nhé!')+'</p>'+
  '<div class="fgrid">'+
    '<div><span>Điểm</span><b>'+fly.score+'</b></div>'+
    '<div><span>Thức ăn</span><b>'+fly.eaten+'</b></div>'+
    '<div><span>Kỷ lục</span><b>'+fly.best+'</b></div>'+
  '</div>'+
  '<div style="margin-top:6px"><button class="btn gold" id="flyBtnRetry">Bay lại</button></div></div>';

  $('flyBtnRetry').onclick = () => {
    o.hidden=true;
    $('flyHint').style.display='block';
    flyReset();
  };
}

function flyEat(it){
  fly.hunger=Math.min(100,fly.hunger+it.v);
  fly.eaten++;fly.eatT=.4;
  notify('HAPTIC_SUCCESS');
  fly.floats.push({x:it.x,y:it.y-8,txt:'+'+it.v+'% no',col:'#3E7A3A'});
}

function flyUpdate(dt){
  if(fly.paused)return;
  if(fly.flapT>0)fly.flapT-=dt;
  if(fly.eatT>0)fly.eatT-=dt;
  if(fly.shake>0)fly.shake-=dt;

  const dx=fly.speed*dt;
  fly.dist+=dx;

  if(fly.mode==='play'){
    // Tiêu hao thanh đói
    fly.hunger-=dt*3.2;
    if(fly.hunger<=0){flyDie('starve');return;}

    // Tốc độ tăng dần
    fly.speed=Math.min(105, 62 + fly.score * 1.5);

    // Trọng lực
    fly.vy+=GRAV*dt;
    fly.y+=fly.vy*dt;

    if(fly.y>=GY-12){fly.y=GY-12;flyDie('ground');return;}
    if(fly.y<10){fly.y=10;fly.vy=0;}

    // Cập nhật chướng ngại vật cột
    if(fly.pillars.length===0 || fly.pillars[fly.pillars.length-1].x < FW - 75){
      spawnPillar();
    }

    fly.pillars.forEach(p=>{
      p.x-=dx;
      // Va chạm cột
      if(p.x<PX+10 && p.x+OW>PX-10){
        if(fly.y-8 < p.gy - p.gap/2 || fly.y+8 > p.gy + p.gap/2){
          flyDie('pillar');
        }
      }
      if(!p.passed && p.x+OW < PX){
        p.passed=true;
        fly.score++;
        $('flyScore').textContent=String(fly.score);
        notify('HAPTIC_LIGHT');
      }
    });
    fly.pillars=fly.pillars.filter(p=>p.x>-OW-10);

    // Cập nhật thức ăn
    fly.items.forEach(it=>{
      it.x-=dx;
      if(Math.hypot(it.x-PX, it.y-fly.y)<16){
        flyEat(it);
        it.eaten=true;
      }
    });
    fly.items=fly.items.filter(it=>!it.eaten && it.x>-20);

    // Cập nhật chim đối thủ bay ngược chiều
    fly.enemyBirds.forEach(b=>{
      b.x+=b.vx*dt;
      b.t+=dt;
      b.y+=Math.sin(b.t*6)*1.2;
      // Va chạm với chim
      if(Math.hypot(b.x-PX, b.y-fly.y)<14){
        flyDie('bird');
      }
    });
    fly.enemyBirds=fly.enemyBirds.filter(b=>b.x>-30);

    // Cập nhật gió lốc
    fly.whirlwinds.forEach(w=>{
      w.x-=dx*1.1;
      w.t+=dt;
      // Hút/đẩy heo khi chạm gió lốc
      if(Math.hypot(w.x-PX, w.y-fly.y)<22){
        fly.vy += w.dir * 180 * dt;
        fly.shake = 0.1;
        fly.floats.push({x:PX, y:fly.y-10, txt:'GIÓ LỐC!', col:'#E0452B'});
      }
    });
    fly.whirlwinds=fly.whirlwinds.filter(w=>w.x>-30);

    // Hạt mưa
    if(fly.weather==='storm'){
      if(fly.rainDrops.length<40){
        fly.rainDrops.push({x:rnd(0,FW), y:rnd(-10,FH), v:rnd(140,220)});
      }
      fly.rainDrops.forEach(r=>{
        r.y+=r.v*dt;
        r.x-=35*dt;
        if(r.y>FH){r.y=-5; r.x=rnd(0,FW+30);}
      });
    }
  }

  // Cập nhật thanh đói HUD
  $('flyHungerT').textContent=fly.hunger>75?'No bụng':fly.hunger>35?'Vừa bụng':'Đói lả (-15% lực)';
  const barEl=$('flyBar');
  if(barEl){
    const segs=Math.max(1, Math.min(10, Math.round(fly.hunger/10)));
    barEl.innerHTML=Array.from({length:10},(_,i)=>'<i style="background:'+(i<segs?(segs<4?'#E0452B':'#5E9A57'):'#D9C9A4')+'"></i>').join('');
  }
}

const cv=$('flyCv'), cx=cv.getContext('2d');

function flyDraw(){
  cx.imageSmoothingEnabled=false;

  // Nền trời
  const isStorm = fly.weather === 'storm';
  cx.fillStyle = isStorm ? '#7C93A4' : '#BFE6F6';
  cx.fillRect(0,0,FW,FH);

  // Mây hoặc mây đen
  cx.fillStyle = isStorm ? '#5A6E7D' : '#FFFFFF';
  cx.fillRect(15,20,32,10); cx.fillRect(100,16,40,12);

  // Vẽ các cột
  fly.pillars.forEach(p=>{
    pillar(cx, p.x, 0, p.gy - p.gap/2, true);
    pillar(cx, p.x, p.gy + p.gap/2, GY, false);
  });

  // Vẽ thức ăn
  fly.items.forEach(it=>{
    drawFood(cx, it.k, it.x, it.y);
  });

  // Vẽ chim đối thủ
  fly.enemyBirds.forEach(b=>{
    cx.fillStyle='#E0452B'; cx.beginPath(); cx.arc(b.x, b.y, 6, 0, 6.28); cx.fill();
    cx.strokeStyle='#2B2118'; cx.stroke();
    // Mắt dữ
    cx.fillStyle='#2B2118'; cx.fillRect(b.x-4, b.y-2, 2, 2);
    cx.fillStyle='#F4B93B'; cx.fillRect(b.x-7, b.y, 4, 2);
  });

  // Vẽ gió lốc
  fly.whirlwinds.forEach(w=>{
    cx.fillStyle='rgba(255,255,255,0.7)';
    for(let i=0; i<4; i++){
      const oy = Math.sin(w.t*8 + i) * 12;
      cx.fillRect(w.x + (i%2?3:-3), w.y + oy, 4, 3);
    }
  });

  // Mặt đất
  cx.fillStyle='#86B866'; cx.fillRect(0,GY,FW,FH-GY);
  cx.fillStyle='#2B2118'; cx.fillRect(0,GY,FW,2);

  // Vẽ heo bay
  cx.drawImage(hp, 0, 0, 24, 20, Math.round(PX-12), Math.round(fly.y-10), 24, 20);

  // Mưa rơi nếu bão
  if(isStorm){
    cx.fillStyle='#C9E4F5';
    fly.rainDrops.forEach(r=>{
      cx.fillRect(r.x, r.y, 1, 4);
    });
  }

  // Floating text
  fly.floats.forEach(f=>{
    f.y-=0.4;
    cx.font='bold 9px sans-serif'; cx.fillStyle=f.col;
    cx.fillText(f.txt, Math.round(f.x), Math.round(f.y));
  });
  fly.floats=fly.floats.filter(f=>f.y>10);
}

let lastT=performance.now();
function flyLoop(now){
  const dt=Math.min(0.04, (now-lastT)/1000);
  lastT=now;
  flyUpdate(dt);
  flyDraw();
  requestAnimationFrame(flyLoop);
}

// Bắt sự kiện chạm vỗ cánh
$('flyWrap').addEventListener('pointerdown', flyFlap);
$('flyBtn').addEventListener('click', flyFlap);

$('flyPause').addEventListener('click', () => {
  fly.paused = !fly.paused;
  $('flyPause').textContent = fly.paused ? 'Tiếp tục' : 'Tạm dừng';
});

$('flyWx').addEventListener('click', () => {
  fly.weather = fly.weather === 'clear' ? 'storm' : 'clear';
  $('flyWeather').textContent = fly.weather === 'storm' ? 'Mưa bão ⛈' : 'Trời quang ☀';
  flyMsg(fly.weather === 'storm' ? 'Bão gió đến rồi, cẩn thận!' : 'Trời quang mây tạnh', 2);
});

flyReset();
requestAnimationFrame(flyLoop);

})();
</script>
</body>
</html>
`;

  const memoizedSource = useMemo(() => ({ html: htmlContent, baseUrl: '' }), [htmlContent]);

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
      <View style={[styles.webViewWrapper, { height: contentHeight }]}>
        <SafeWebView
          ref={webViewRef}
          source={memoizedSource}
          containerStyle={{ width: winWidth, height: contentHeight, backgroundColor: '#F6EEDC', flex: 0 }}
          style={{ width: winWidth, height: contentHeight, backgroundColor: '#F6EEDC', flex: 0 }}
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
    backgroundColor: '#F6EEDC',
  },
  webView: {
    flex: 1,
    backgroundColor: '#F6EEDC',
  },
});
