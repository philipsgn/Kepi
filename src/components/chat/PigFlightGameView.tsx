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
}

export const PigFlightGameView: React.FC<PigFlightGameViewProps> = ({ onBack }) => {
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
  padding: 12px 14px 40px;
  background: var(--page);
  color: var(--ink);
  font: 600 14px/1.4 var(--f-body);
  user-select: none;
  -webkit-user-select: none;
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
.btn[aria-pressed="true"] { background: var(--gold); }
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
  gap: 10px;
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
  min-width: 60px;
  text-align: center;
  padding: 4px 8px 6px;
  background: var(--card);
  border: 2.5px solid var(--ink);
  border-radius: 16px;
  box-shadow: 0 3px 0 var(--ink);
}
.fscore b {
  display: block;
  font: 800 20px/1.1 var(--f-display);
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
  font: 800 14px/1.2 var(--f-display);
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
  height: 10px;
  border-radius: 999px;
  transition: background .2s;
}
.scene.flywrap {
  position: relative;
  margin-top: 10px;
  background: #BFE6F6;
  border: 3px solid var(--ink);
  border-radius: 24px;
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
  top: 10px;
  text-align: center;
  pointer-events: none;
  opacity: 0;
  transform: translateY(-6px);
  transition: opacity .2s, transform .2s;
  font: 800 13px/1.25 var(--f-body);
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
  bottom: 80px;
  text-align: center;
  pointer-events: none;
  font: 800 12px/1.2 var(--f-body);
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--ink);
  z-index: 2;
}
.flyhint span {
  display: inline-block;
  padding: 6px 12px;
  background: var(--gold);
  border: 2.5px solid var(--ink);
  border-radius: 999px;
  box-shadow: 0 3px 0 var(--ink);
  animation: fbob 1s ease-in-out infinite alternate;
}
@keyframes fbob { to { transform: translateY(-5px); } }
.flyover {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  background: rgba(43,33,24,.55);
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
.flyover .fo>b { font: 800 22px/1.1 var(--f-display); }
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
  font: 800 18px/1.1 var(--f-display);
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
  border-radius: 16px;
  box-shadow: 0 3px 0 var(--ink);
  text-align: center;
}
.flystats b {
  display: block;
  font: 800 18px/1.1 var(--f-display);
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
  min-height: 42px;
}
</style>
</head>
<body>

  <div class="flytop">
    <div class="who"><b>Heo bay</b><span id="flyZone">Vườn nhà</span></div>
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
    <div><span class="label">Cám vàng</span><b id="flyCoin">0</b></div>
    <div><span class="label">Cột mốc</span><b id="flyScore2">0</b></div>
  </div>

  <div class="flyctl">
    <button class="btn big" type="button" id="flyBtn">Vỗ cánh</button>
    <button class="btn" type="button" id="flyPause">Tạm dừng</button>
    <button class="btn" type="button" id="flyTime">Ban ngày</button>
  </div>

<script>
(function(){
'use strict';
const $ = id => document.getElementById(id);
function notify(type) {
  if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type }));
  }
}

function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const C={grass1:'#86B866',grass2:'#74A659',grass3:'#9CCB78',wall:'#F2DFA8',wallShade:'#E2C984',roof:'#C4603A',roofDark:'#9E4528',roofLight:'#DC7A4E',
  wood:'#8A5A34',woodDark:'#5E3A20',woodLight:'#B07A48',water:'#6DB7C9',waterDark:'#4E97AE',
  bamboo:'#D6B66A',bambooDark:'#A98A45',red:'#E0452B',gold:'#F4B93B'};
const PAL={o:'#4B2B21',p:'#F9B8C4',s:'#EE90A6',n:'#F08DA4',h:'#FFE3E8',k:'#2B2118',g:'#F4B93B',G:'#B97A14',w:'#FFFFFF'};
const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};
const E=(c,cx,cy,rx,ry,col)=>{c.fillStyle=col;for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++)if(x*x/(rx*rx)+y*y/(ry*ry)<=1)c.fillRect(cx+x,cy+y,1,1)};
function shape(c,rows,fill,ox,oy,outline=true){
  if(outline){c.fillStyle=PAL.o;for(const [ax,ay] of [[-1,0],[1,0],[0,-1],[0,1]])for(const [y,x0,x1] of rows)c.fillRect(ox+x0+ax,oy+y+ay,x1-x0+1,1)}
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
  if(o.blink){R(c,6,9,3,1,P.k);R(c,15,9,3,1,P.k)}
  else{R(c,6,8,2,2,P.k);R(c,16,8,2,2,P.k);R(c,6,8,1,1,P.w);R(c,16,8,1,1,P.w)}
  if(o.happy){R(c,11,14,2,1,P.k)}
  R(c,4,11,2,1,P.s);R(c,18,11,2,1,P.s);
  R(c,6,17,3,2,P.s);R(c,15,17,3,2,P.s);
}
const hp=mk(24,20,c=>drawPigSprite(c,{blink:false}));
const hpx=hp.getContext('2d');

/* Heo bay constants */
const FW=176,FH=224,GY=198,BLEN=900,TR=140,OW=16;
const BIOMES=[{id:'vuon',n:'Vườn nhà',skin:'bamboo'},{id:'ruong',n:'Ruộng lúa',skin:'post'},{id:'pho',n:'Phố nhà',skin:'pole'},{id:'ao',n:'Ao sen',skin:'lotus'}];
const toHex=a=>'#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const hx=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mix=(a,b,t)=>{const A=hx(a),B=hx(b);return toHex(A.map((v,i)=>v+(B[i]-v)*t))};
const SKY=[[0,'#F7B6A0','#FBE3B8'],[.14,'#8FD0F2','#E3F3F8'],[.4,'#58B6EE','#C3E9F8'],[.58,'#F29A62','#FFD9A0'],[.7,'#6B4A86','#EE9A74'],[.8,'#1D2A4F','#3A4C80'],[.94,'#1D2A4F','#3A4C80'],[1,'#F7B6A0','#FBE3B8']];
function skyAt(u){let i=0;while(i<SKY.length-2&&u>SKY[i+1][0])i++;const a=SKY[i],b=SKY[i+1],t=Math.max(0,Math.min(1,(u-a[0])/(b[0]-a[0])));return[mix(a[1],b[1],t),mix(a[2],b[2],t)]}
const nightness=u=>u<.68?0:u<.8?(u-.68)/.12:u<.94?1:Math.max(0,(1-u)/.06);
const SR=mulberry32(99);
const STARS=Array.from({length:36},()=>[(SR()*FW)|0,(SR()*130)|0,SR()]);

function mkFar(b){return mk(FW,110,(c)=>{
  const s=x=>x/FW*Math.PI*2;
  for(let x=0;x<FW;x++){
    const h=28+Math.round(14*Math.sin(s(x)*2));
    R(c,x,110-h,1,h,b===1?'#B4C6D6':b===2?'#ACBCC8':'#B5DB9A');
  }
})}
function mkMid(b){return mk(FW,96,(c)=>{
  const B=96;
  [14,58,102,146].forEach((x,i)=>{R(c,x-1,B-26,3,26,'#6B4426');E(c,x,B-36,11,10,i%2?'#4E9A47':'#5DAA52')});
})}
function mkGround(b){return mk(FW,26,(c)=>{
  R(c,0,0,FW,26,b===1?'#D9B45A':b===2?'#7A7468':'#74A659');
  R(c,0,0,FW,2,'#2B2118');
})}
const FAR=[0,1,2,3].map(mkFar),MID=[0,1,2,3].map(mkMid),GROUND=[0,1,2,3].map(mkGround);

function pillar(c,x,y0,y1,skin,top){
  const h=y1-y0;if(h<=0)return;
  R(c,x,y0,OW,h,'#2B2118');
  R(c,x+2,y0,OW-4,h,'#8A5A34');
  R(c,x+3,y0,3,h,'#B07A48');
  const ey=top?y1-5:y0;
  R(c,x-2,ey,OW+4,5,'#2B2118');
  R(c,x-1,ey+1,OW+2,3,'#F4B93B');
}

const FOODS=[{k:'carrot',v:14,w:70},{k:'corn',v:16,w:60},{k:'apple',v:20,w:45},{k:'melon',v:26,w:20}];
function pickFood(r){return FOODS[(r*FOODS.length)|0]}
function drawFood(c,k,x,y){
  if(k==='apple'){E(c,x,y,5,5,'#2B2118');E(c,x,y,4,4,'#E0452B');R(c,x-2,y-2,2,2,'#FF8A6B');R(c,x,y-6,1,3,'#6B4426')}
  else if(k==='corn'){E(c,x,y,4,6,'#2B2118');E(c,x,y,3,5,'#F4D03F')}
  else if(k==='melon'){shape(c,[[-2,-5,5],[-1,-5,5],[0,-4,4],[1,-3,3]],'#5EA04C',x,y)}
  else{const rx=4;E(c,x,y,rx+1,5,'#2B2118');E(c,x,y,rx,4,'#F4B93B');R(c,x-1,y-2,1,4,'#FFF08A')}
}

const GRAV=560,FLAP=-172,VMAX=250,PX=44;
const fly={
  mode:'ready',last:0,t:0,y:96,vy:0,ang:0,flapT:0,eatT:0,blink:0,
  dist:0,speed:58,sp:0,score:0,coins:0,eaten:0,hunger:78,best:0,
  u:.2,weather:'clear',wnext:28,
  pillars:[],items:[],parts:[],floats:[],shake:0,msg:'',msgT:0,cause:'',lastBi:0,paused:false
};
try{fly.best=+localStorage.getItem('vhc-fly-best')||0}catch(e){}
const biomeAt=d=>((d/BLEN)|0)%4;
const gapNow=()=>Math.max(54,64-Math.floor(fly.score/6));
let lastGy=100;
const rnd=(a,b)=>a+Math.random()*(b-a);

function flyMsg(t,s){fly.msg=t;fly.msgT=s||2}
function flyReset(){
  Object.assign(fly,{
    mode:'ready',y:96,vy:0,ang:0,flapT:0,eatT:0,dist:0,speed:58,sp:60,score:0,coins:0,eaten:0,hunger:78,
    pillars:[],items:[],parts:[],floats:[],shake:0,cause:'',lastBi:0,paused:false
  });
  lastGy=100;flyMsg('Chạm để vỗ cánh',99);
}
function spawnPillar(){
  const gap=gapNow(),lo=24+gap/2,hi=GY-24-gap/2;
  let gy=rnd(lo,hi);gy=Math.max(lo,Math.min(hi,lastGy+Math.max(-58,Math.min(58,gy-lastGy))));
  const x=FW+OW+4;lastGy=gy;
  fly.pillars.push({x,gy,gap,skin:BIOMES[biomeAt(fly.dist+x)].skin,passed:false});
  if(Math.random()<.85){const f=pickFood(Math.random());fly.items.push({k:f.k,v:f.v,x:x+OW/2,y:gy,t:rnd(0,6)})}
  if(Math.random()<.75){fly.items.push({k:'coin',v:1,x:x+OW/2-40,y:gy-10,t:0})}
}
fly.spacing=96;

function flyFlap(){
  if(fly.mode==='dead'||fly.paused)return;
  if(fly.mode==='ready'){
    fly.mode='play';fly.msgT=0;fly.hunger=78;
    flyMsg('Hái đồ ăn để giữ độ no nhé!',2.5);
  }
  fly.vy=FLAP;fly.flapT=.2;
  notify('HAPTIC_LIGHT');
}
function flyDie(cause){
  if(fly.mode==='dead')return;
  fly.mode='dead';fly.cause=cause;fly.vy=cause==='starve'?-40:-120;fly.shake=.25;
  if(fly.score>fly.best){fly.best=fly.score;try{localStorage.setItem('vhc-fly-best',String(fly.best))}catch(e){}}
  notify('HAPTIC_FAIL');
  flyMsg({pillar:'Đụng cột rồi!',ground:'Chạm đất rồi!',starve:'Đói lả, hết sức bay!'}[cause],99);
  setTimeout(flyShowOver,600);
}
function flyEat(it){
  if(it.k==='coin'){
    fly.coins++;
    notify('HAPTIC_LIGHT');
    fly.floats.push({x:it.x,y:it.y-6,txt:'+1 cám',col:'#C98A12',life:.7});
    return;
  }
  fly.hunger=Math.min(100,fly.hunger+it.v);
  fly.eaten++;fly.eatT=.4;
  notify('HAPTIC_SUCCESS');
  fly.floats.push({x:it.x,y:it.y-8,txt:'+'+it.v+'%',col:'#3E7A3A',life:.9});
  if(Math.random()<.3)flyMsg('Ngon quá, no bụng!',1.2);
}

function flyUpdate(dt){
  if(fly.paused)return;
  fly.t+=dt;if(fly.flapT>0)fly.flapT-=dt;if(fly.eatT>0)fly.eatT-=dt;if(fly.shake>0)fly.shake-=dt;
  if(fly.msgT>0&&fly.msgT<90){fly.msgT-=dt}
  fly.u=(fly.u+dt/120)%1;
  fly.blink=(fly.t%3.4)<.12?1:0;

  const mult=fly.mode==='play'?1:fly.mode==='ready'?.45:.15,sc=fly.speed*mult,dx=sc*dt;
  fly.dist+=dx;
  const bi=biomeAt(fly.dist);
  if(bi!==fly.lastBi){fly.lastBi=bi;if(fly.mode==='play')flyMsg('Tới '+BIOMES[bi].n+' rồi!',2)}

  if(fly.mode==='ready'){fly.y=96+Math.sin(fly.t*3.4)*4;fly.vy=0;fly.ang=0}
  if(fly.mode==='play'||fly.mode==='dead'){
    fly.vy=Math.min(VMAX,fly.vy+GRAV*dt);fly.y+=fly.vy*dt;
    fly.ang=Math.max(-.45,Math.min(1,fly.vy/260));
    if(fly.y<5){fly.y=5;if(fly.vy<0)fly.vy=0}
  }
  if(fly.mode==='play'){
    fly.hunger-=(3.2+Math.min(2,fly.dist/2200))*dt;
    if(fly.hunger<=0){fly.hunger=0;flyDie('starve')}
    fly.sp-=dx;if(fly.sp<=0){spawnPillar();fly.sp+=fly.spacing}
    fly.pillars.forEach(p=>{
      p.x-=dx;
      if(!p.passed&&p.x+OW<PX-7){p.passed=true;fly.score++;if(fly.score%5===0)fly.speed=Math.min(88,fly.speed+2)}
      if(PX+7>p.x&&PX-7<p.x+OW&&(fly.y-5<p.gy-p.gap/2||fly.y+5>p.gy+p.gap/2))flyDie('pillar');
    });
    fly.items.forEach(it=>{
      it.x-=dx;const d=Math.hypot(it.x-PX,it.y-fly.y);
      if(d<(it.k==='coin'?9:11)){it.dead=true;flyEat(it)}
    });
    if(fly.y+7>=GY){fly.y=GY-7;flyDie('ground')}
  }else if(fly.mode==='dead'){
    if(fly.y+7>=GY){fly.y=GY-7;fly.vy=0}
  }
  fly.pillars=fly.pillars.filter(p=>p.x>-OW-6);
  fly.items=fly.items.filter(it=>!it.dead&&it.x>-20);
  fly.floats.forEach(f=>{f.life-=dt;f.y-=14*dt});fly.floats=fly.floats.filter(f=>f.life>0);
}

const flyC=$('flyCv'),flyX=flyC.getContext('2d');
const WING=[[[-4,-6,-3],[-3,-8,-3],[-2,-9,-3],[0,-6,-3]],[[-1,-9,-3],[0,-10,-3],[1,-9,-3]],[[1,-6,-3],[2,-8,-3],[3,-9,-4]]];

function drawPigFly(c){
  const dead=fly.mode==='dead',hungry=fly.hunger<28||fly.cause==='starve';
  const o={mood:(hungry||dead)?'sad':'ok',happy:fly.eatT>0&&!dead,blink:fly.blink===1||dead};
  hpx.clearRect(0,0,24,20);drawPigSprite(hpx,o);
  c.save();c.translate(PX,Math.round(fly.y));c.rotate(Math.round((dead?1.2:fly.ang)*5)/5);
  c.drawImage(hp,-11,-10);
  const wf=fly.mode==='dead'?2:fly.flapT>.1?0:1;
  shape(c,WING[wf],'#FFFBF1',-1,-1);
  c.restore();
}

function tileDraw(c,tile,k,y){const o=Math.floor((fly.dist*k)%FW);c.drawImage(tile,-o,y);c.drawImage(tile,FW-o,y)}
function drawSky(c){
  const [top,hor]=skyAt(fly.u);
  const bands=12,bh=Math.ceil(GY/bands);
  for(let i=0;i<bands;i++)R(c,0,i*bh,FW,bh+1,mix(top,hor,i/(bands-1)));
}

function drawFlyScene(c,t){
  c.imageSmoothingEnabled=false;
  c.save();
  if(fly.shake>0)c.translate(Math.round(Math.sin(t*90)*2),Math.round(Math.cos(t*70)*2));
  drawSky(c);
  const bi=biomeAt(fly.dist);
  tileDraw(c,FAR[bi],.15,GY-110);
  tileDraw(c,MID[bi],.4,GY-96);
  tileDraw(c,GROUND[bi],1,GY);

  fly.pillars.forEach(p=>{
    const x=Math.round(p.x);
    pillar(c,x,0,Math.round(p.gy-p.gap/2),p.skin,true);
    pillar(c,x,Math.round(p.gy+p.gap/2),GY,p.skin,false);
  });
  fly.items.forEach(it=>{
    const y=Math.round(it.y+Math.sin(fly.t*4+it.t)*2);
    drawFood(c,it.k,Math.round(it.x),y);
  });
  drawPigFly(c);

  fly.floats.forEach(f=>{
    c.font='bold 10px sans-serif';c.fillStyle=f.col;
    c.fillText(f.txt,Math.round(f.x),Math.round(f.y));
  });

  if(fly.mode==='play'&&fly.hunger<28){
    c.globalAlpha=.25+.2*Math.sin(t*8);
    R(c,0,0,FW,3,'#E0452B');R(c,0,FH-3,FW,3,'#E0452B');
    c.globalAlpha=1;
  }
  c.restore();
}

const flyBarEl=$('flyBar');for(let i=0;i<10;i++){const b=document.createElement('i');flyBarEl.appendChild(b)}
function flyHud(){
  const h=Math.max(0,Math.ceil(fly.hunger/10)),col=fly.hunger>50?'#5E9A57':fly.hunger>25?'#F4B93B':'#E0452B';
  [...flyBarEl.children].forEach((b,i)=>{b.style.background=i<h?col:'transparent'});
  $('flyHungerT').textContent=fly.hunger>66?'No căng':fly.hunger>40?'Vừa bụng':fly.hunger>25?'Hơi đói':'Đói lả, hái gấp!';
  $('flyScore').textContent=String(fly.score);
  $('flyScore2').textContent=String(fly.score);
  $('flyBest').textContent=String(fly.best);
  $('flyEaten').textContent=String(fly.eaten);
  $('flyCoin').textContent=String(fly.coins);
  $('flyZone').textContent=BIOMES[biomeAt(fly.dist)].n;
  const m=fly.paused?'Tạm dừng. Chạm để bay tiếp':fly.msgT>0?fly.msg:'';
  const tt=$('flyToast');tt.textContent=m;tt.classList.toggle('on',!!m);
  $('flyHint').hidden=!(fly.mode==='ready'&&!fly.paused);
}

function flyShowOver(){
  const o=$('flyOver'),why={pillar:'Đụng cột',ground:'Chạm đất',starve:'Đói lả'}[fly.cause];
  o.hidden=false;
  o.innerHTML='<div class="card fo"><b>'+why+'</b><span class="label">Chuyến bay vừa rồi</span>'+
  '<div class="fgrid"><div><b>'+fly.score+'</b><span>Cột qua</span></div><div><b>'+fly.eaten+'</b><span>Đã ăn</span></div><div><b>'+fly.coins+'</b><span>Cám vàng</span></div></div>'+
  '<p>Thu về <b>+'+(fly.score+fly.coins)+' cám</b> vào ví'+(fly.score>0&&fly.score>=fly.best?' · Kỷ lục mới!':'')+'</p>'+
  '<button class="btn big" type="button" id="flyRetry">Bay lại ngay</button></div>';
  $('flyRetry').addEventListener('click',()=>{o.hidden=true;flyReset();flyFlap()});
}

function flyTap(e){
  e.preventDefault();
  if(fly.mode==='dead')return;
  flyFlap();
}

flyC.addEventListener('pointerdown',flyTap);
$('flyBtn').addEventListener('click',flyFlap);
$('flyPause').addEventListener('click',()=>{
  fly.paused=!fly.paused;
  $('flyPause').setAttribute('aria-pressed',String(fly.paused));
  $('flyPause').textContent=fly.paused?'Tiếp tục':'Tạm dừng';
});
$('flyTime').addEventListener('click',()=>{
  fly.u=(fly.u+.25)%1;
  $('flyTime').textContent=fly.u<.4?'Ban ngày':fly.u<.7?'Hoàng hôn':'Ban đêm';
});

let lastT=performance.now();
function loop(now){
  const dt=Math.min(.05,(now-lastT)/1000);lastT=now;
  flyUpdate(dt);
  drawFlyScene(flyX,now/1000);
  flyHud();
  requestAnimationFrame(loop);
}
flyReset();
requestAnimationFrame(loop);
})();
</script>
</body>
</html>
  `;

  const memoizedSource = useMemo(() => ({ html: htmlContent, baseUrl: '' }), []);

  return (
    <View style={styles.container}>
      {/* HEADER QUAY LẠI NEO-BRUTALIST */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <ArrowLeft size={18} color="#2B2118" strokeWidth={2.8} />
          <Text style={styles.backButtonText}>Quay lại Hub</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>🪽 Heo Bay</Text>
        </View>

        <TouchableOpacity
          style={styles.iconAction}
          onPress={handleReload}
          activeOpacity={0.8}
        >
          <RefreshCw size={18} color="#2B2118" strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      {/* WEBVIEW CANVAS SIÊU MƯỢT 60FPS (EXPLICIT DIMENSIONS + BASEURL) */}
      <View
        style={styles.webContainer}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (h > 50) setContentHeight(h);
        }}
      >
        {Platform.OS === 'web' ? (
          <iframe
            srcDoc={htmlContent}
            style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#F6EEDC' } as any}
          />
        ) : (
          <SafeWebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={memoizedSource}
            containerStyle={{ width: winWidth, height: contentHeight, backgroundColor: '#F6EEDC', flex: 0 }}
            style={{ width: winWidth, height: contentHeight, backgroundColor: '#F6EEDC', flex: 0 }}
            scrollEnabled={false}
            scalesPageToFit={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            automaticallyAdjustContentInsets={false}
            contentInsetAdjustmentBehavior="never"
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F6EEDC',
    borderBottomWidth: 2.5,
    borderBottomColor: '#2B2118',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBF1',
    borderWidth: 2.5,
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
    fontSize: 13,
    color: '#2B2118',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 18,
    color: '#2B2118',
  },
  iconAction: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFBF1',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  webContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F6EEDC',
    overflow: 'hidden',
  },
  webView: {
    backgroundColor: '#F6EEDC',
  },
});
