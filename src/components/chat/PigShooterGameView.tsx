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
import { ArrowLeft, RefreshCw, Feather, Target, Ticket } from 'lucide-react-native';

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
            shooterMaxWave: data.wave,
            savedBabies: data.savedBabies,
            pigFoodBonus: data.foodEarned,
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

.scene.apwrap {
  position: relative;
  margin-top: 10px;
  background: #BFE6F6;
  border: 3px solid var(--ink);
  border-radius: 22px;
  box-shadow: 0 4px 0 var(--ink);
  overflow: hidden;
  touch-action: none;
}
.scene.apwrap canvas {
  display: block;
  width: 100%;
  max-width: 380px;
  height: auto;
  margin: 0 auto;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  cursor: grab;
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
  margin-top: 10px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.apinfo b { font: 800 13.5px/1.3 var(--f-body); }
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
    <div class="who"><b id="waveHeading">Heo Bắn · Vô Tận</b><span id="apLvT">Màn 1: Ổ chim nhỏ</span></div>
    <div class="fscore"><span class="label">Màn</span><b id="apWave">1</b></div>
    <div class="fscore"><span class="label">Chim</span><b id="apBirds">0</b></div>
    <div class="fscore"><span class="label">Cứu</span><b id="apRescued">0</b></div>
  </div>

  <div class="scene apwrap" id="apWrap">
    <canvas id="apCv" width="224" height="140"></canvas>
    <div class="flytoast" id="apToast"></div>
    <div class="flyover" id="apOver" hidden></div>
  </div>

  <div class="card apinfo">
    <b id="apPigs">Đang chờ ngắm bắn</b>
    <span id="apBonus">Kéo heo trên ná về sau rồi thả để bắn phá khối! Chạm màn hình giữa không trung để kích hoạt kỹ năng.</span>
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
$('tabFly').addEventListener('click', () => notify('SWITCH_GAME', { game: 'fly' }));

const AW=224,AH=140,AG=118,SX=36,SY=92,MAXD=30,AGR=230;
const BLK={
  wood:{c:'#C49A6E',d:'#8A5A34',hp:45,dn:1},
  stone:{c:'#B9B2A6',d:'#7A7468',hp:110,dn:1.7},
  glass:{c:'#B8E4F0',d:'#5FA9C4',hp:16,dn:.6},
  cage:{c:'#CFCFD8',d:'#5A5A66',hp:42,dn:1.2}
};

const ap={
  wave:1,
  wind:0,
  last:0,
  t:0,
  acc:0,
  blocks:[],
  queue:[],
  pig:null,
  drag:null,
  st:'aim',
  parts:[],
  floats:[],
  kills:0,
  settle:0,
  over:null,
  cur:'pig',
  free:[],
  cages:0,
  rescued:0,
  totalRescued:0,
  winT:0,
  birds0:0
};

function apNote(t){
  const e=$('apToast');if(!e)return;
  e.textContent=t;e.classList.add('on');
  setTimeout(()=>e.classList.remove('on'),2200);
}

// Sinh màn chơi theo thuật toán Procedural Generation
function generateWave(wave) {
  const titles = [
    'Ổ chim nhỏ', 'Tháp gỗ đá', 'Cổng thành chim', 'Pháo đài kiên cố',
    'Tháp đôi hiểm hóc', 'Lồng sắt ngục tối', 'Vương quốc chim bão'
  ];
  const title = titles[(wave - 1) % titles.length] + ' (Màn ' + wave + ')';
  const it = [];
  
  // Tính toán gió biến thiên
  ap.wind = Math.round((Math.random() - 0.48) * Math.min(80, 20 + wave * 6));

  const stoneRatio = Math.min(0.65, 0.2 + wave * 0.08);
  const mainMaterial = () => (Math.random() < stoneRatio ? 'stone' : 'wood');

  // Tháp 1
  const t1x = 135;
  const h1 = 20 + Math.min(18, wave * 3);
  it.push([mainMaterial(), t1x, AG - h1, 7, h1]);
  it.push([mainMaterial(), t1x + 22, AG - h1, 7, h1]);
  it.push(['wood', t1x - 3, AG - h1 - 5, 34, 5]);
  it.push(['bird', t1x + 8, AG - h1 - 18, 14, 14]);

  // Lồng heo con
  it.push(['cage', t1x + 28, AG - 20, 20, 20]);

  // Tháp 2 (xuất hiện từ màn 2 trở lên)
  if (wave >= 2) {
    const t2x = 180;
    const h2 = 24 + Math.min(22, wave * 2);
    it.push([mainMaterial(), t2x, AG - h2, 7, h2]);
    it.push(['glass', t2x - 4, AG - h2 - 5, 26, 5]);
    it.push(['bird', t2x + 2, AG - h2 - 18, 14, 14]);
    if (wave >= 4) {
      it.push(['cage', t2x + 14, AG - 20, 20, 20]);
    }
  }

  // Chim lính canh gác mặt đất
  if (wave >= 3) {
    it.push(['bird', 115, AG - 14, 14, 14]);
  }

  return { n: title, it };
}

function apLoad(w){
  ap.wave = w;
  const L = generateWave(w);
  $('apLvT').textContent = L.n;
  $('apWave').textContent = String(w);

  ap.blocks = L.it.map(([k,x,y,w,h])=>{
    const o = {k,x,y,w,h,vx:0,vy:0,fl:0};
    if(k==='bird'){ o.hp=1; o.m=5; }
    else if(k==='cage'){ o.hp=BLK.cage.hp; o.m=Math.max(1,w*h*BLK.cage.dn/25); }
    else{ o.hp=BLK[k].hp; o.m=Math.max(1,w*h*BLK[k].dn/25); }
    return o;
  });

  // Hàng đợi đạn heo: 4-5 heo
  let shots = ['pig', 'pig', 'pig', 'pig'];
  if (ap.totalRescued >= 1) shots.push('wing'); // Mở khóa Heo Cánh
  if (ap.totalRescued >= 3) shots.push('coin'); // Mở khóa Heo Bom Cám
  ap.queue = shots;

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
  apNote('Màn ' + w + ': Gió ' + (ap.wind >= 0 ? '+' : '') + ap.wind + ' px/s');
}

function apNextPig(){
  ap.cur = ap.queue.shift() || null;
  ap.st = ap.cur ? 'aim' : 'end';
  ap.settle = 0;
}

function apKill(b){
  const idx = ap.blocks.indexOf(b); if(idx < 0) return;
  ap.blocks.splice(idx, 1);
  if(b.k==='bird'){
    ap.kills++;
    notify('HAPTIC_SUCCESS');
    ap.floats.push({x:b.x+7, y:b.y, txt:'+1 Chim', col:'#C98A12'});
  } else if(b.k==='cage'){
    ap.rescued++;
    ap.totalRescued++;
    $('apRescued').textContent = String(ap.totalRescued);
    notify('HAPTIC_SUCCESS');
    ap.free.push({x:b.x+10, y:b.y+10, vx:-30, vy:-35, t:0});
    ap.floats.push({x:b.x+8, y:b.y-4, txt:'+Cứu Heo!', col:'#3E7A3A'});
  }
}

function apImpact(b, spd){
  if(spd < 32) return;
  b.fl = .15;
  if(b.k==='bird'){ if(spd > 28) apKill(b); }
  else {
    b.hp -= (spd - 32) * 1.1;
    if(b.hp <= 0) apKill(b);
  }
}

// Kỹ năng đặc biệt khi chạm vào giữa trời
function apTriggerAbility() {
  const p = ap.pig;
  if (!p || p.used) return;
  p.used = true;
  if (p.type === 'wing') {
    p.vx = p.vx * 1.6;
    p.vy = p.vy * 0.4;
    notify('HAPTIC_LIGHT');
    ap.floats.push({x: p.x, y: p.y - 10, txt: 'TĂNG TỐC!', col: '#F4B93B'});
  } else if (p.type === 'coin') {
    notify('HAPTIC_SUCCESS');
    ap.floats.push({x: p.x, y: p.y - 10, txt: 'BÙM!', col: '#E0452B'});
    // Sóng nổ xung quanh
    ap.blocks.slice().forEach(b => {
      const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
      const d = Math.hypot(cx - p.x, cy - p.y);
      if (d < 36) {
        b.hp -= 65 * (1 - d / 36);
        b.vx += (cx - p.x) * 2;
        b.vy -= 40;
        if (b.hp <= 0) apKill(b);
      }
    });
    ap.pig = null;
    apNextPig();
  }
}

function apStep(dt){
  const bl = ap.blocks;
  bl.forEach(b=>{
    b.vy += AGR * dt;
    b.y += b.vy * dt;
    b.x += b.vx * dt;
    b.vx *= .985;
    if(b.fl > 0) b.fl -= dt;
    if(b.y + b.h > AG){
      const s = Math.abs(b.vy);
      b.y = AG - b.h;
      b.vy = 0;
      b.vx *= .9;
      apImpact(b, s);
    }
  });

  // Heo con được giải cứu chạy thoát
  ap.free.forEach(f => {
    f.t += dt;
    f.vy += AGR * dt;
    f.y += f.vy * dt;
    f.x += f.vx * dt;
    if (f.y > AG - 10) { f.y = AG - 10; f.vy = -30; }
  });

  const p = ap.pig;
  if(p){
    p.t += dt;
    // Tác động của gió
    p.vx += ap.wind * dt;
    p.vy += AGR * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    const R = 7;
    if(p.y + R > AG){
      p.y = AG - R;
      p.vy = -p.vy * .3;
      p.vx *= .82;
      if(Math.abs(p.vy) < 14) p.vy = 0;
    }
    for(const b of ap.blocks.slice()){
      const cx = Math.max(b.x, Math.min(p.x, b.x + b.w));
      const cy = Math.max(b.y, Math.min(p.y, b.y + b.h));
      const dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy);
      if(d >= R) continue;
      const nx = d > 0 ? dx / d : 0, ny = d > 0 ? dy / d : -1;
      const vn = -(p.vx * nx + p.vy * ny);
      p.x += nx * (R - d); p.y += ny * (R - d);
      if(vn <= 0) continue;
      if(b.k === 'bird'){
        if(vn > 18){ apKill(b); p.vx *= .8; continue; }
      }
      const j = 1.3 * vn * 8 * b.m / (8 + b.m);
      p.vx += nx * j / 8; p.vy += ny * j / 8;
      b.vx -= nx * j / b.m; b.vy -= ny * j / b.m * .4;
      apImpact(b, vn);
    }
    if(p.x > AW + 20 || p.x < -20 || (Math.hypot(p.vx, p.vy) < 8 && p.y >= AG - R - 1)){
      ap.settle += dt;
      if(ap.settle > .75){ ap.pig = null; apNextPig(); }
    }
  }

  const birdsLeft = ap.blocks.filter(b => b.k === 'bird').length;
  if(birdsLeft === 0 && !ap.over){
    ap.winT += dt;
    if(ap.winT > .8){
      const stars = ap.queue.length >= 2 ? 3 : ap.queue.length === 1 ? 2 : 1;
      apOverShow(true, stars);
    }
  } else if(!ap.pig && !ap.cur && birdsLeft > 0 && !ap.over){
    apOverShow(false, 0);
  }

  ap.floats.forEach(f => { f.y -= 14 * dt; });
}

const apC = $('apCv'), apX = apC.getContext('2d');

function apDraw(){
  const c = apX; c.imageSmoothingEnabled = false;
  c.fillStyle = '#BFE6F6'; c.fillRect(0, 0, AW, AH);

  // Mây trôi
  c.fillStyle = '#FFFFFF';
  c.fillRect(20, 16, 26, 8); c.fillRect(26, 12, 14, 6);
  c.fillRect(140, 22, 32, 9); c.fillRect(150, 18, 16, 6);

  // Đất & cỏ
  c.fillStyle = '#86B866'; c.fillRect(0, AG, AW, AH - AG);
  c.fillStyle = '#2B2118'; c.fillRect(0, AG, AW, 2);

  // Hiển thị gió
  c.font = 'bold 8.5px sans-serif';
  c.fillStyle = '#2B2118';
  const windDir = ap.wind > 0 ? '➡ Gió: +' + ap.wind : ap.wind < 0 ? '⬅ Gió: ' + ap.wind : 'Gió lặng';
  c.fillText(windDir + ' px/s', AW - 72, 14);

  /* Bệ ná bắn */
  c.fillStyle = '#6B4426'; c.fillRect(SX - 2, SY, 4, AG - SY);
  c.fillRect(SX - 6, SY - 10, 4, 12); c.fillRect(SX + 2, SY - 10, 4, 12);

  /* Khối & chim */
  ap.blocks.forEach(b => {
    if(b.k === 'bird'){
      c.fillStyle = '#E0452B'; c.beginPath(); c.arc(b.x + 7, b.y + 7, 6, 0, 6.28); c.fill();
      c.strokeStyle = '#2B2118'; c.stroke();
      c.fillStyle = '#F4B93B'; c.fillRect(b.x + 6, b.y + 6, 4, 2);
    } else if(b.k === 'cage'){
      c.fillStyle = '#CFCFD8'; c.fillRect(b.x, b.y, b.w, b.h);
      c.strokeStyle = '#2B2118'; c.strokeRect(b.x, b.y, b.w, b.h);
      for(let x = b.x + 4; x < b.x + b.w; x += 5){ c.strokeRect(x, b.y, 1, b.h); }
      // Heo con bên trong lồng
      c.fillStyle = '#F9B8C4'; c.fillRect(b.x + 5, b.y + b.h - 9, 8, 7);
    } else {
      c.fillStyle = BLK[b.k].c; c.fillRect(b.x, b.y, b.w, b.h);
      c.strokeStyle = '#2B2118'; c.strokeRect(b.x, b.y, b.w, b.h);
    }
  });

  // Heo con chạy thoát
  ap.free.forEach(f => {
    c.fillStyle = '#F9B8C4'; c.beginPath(); c.arc(f.x, f.y, 4.5, 0, 6.28); c.fill();
    c.strokeStyle = '#2B2118'; c.stroke();
  });

  /* Dây ná & heo kéo */
  const drag = ap.drag;
  const hx = drag ? drag.x : SX, hy = drag ? drag.y : SY - 4;
  c.strokeStyle = '#2B2118'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(SX - 4, SY - 6); c.lineTo(hx, hy); c.lineTo(SX + 4, SY - 6); c.stroke();
  c.lineWidth = 1;

  if(ap.st === 'aim' && ap.cur){
    const col = ap.cur === 'wing' ? '#F4B93B' : ap.cur === 'coin' ? '#E0452B' : '#F9B8C4';
    c.fillStyle = col; c.beginPath(); c.arc(hx, hy, 6, 0, 6.28); c.fill();
    c.strokeStyle = '#2B2118'; c.stroke();
  }

  const p = ap.pig;
  if(p){
    const col = p.type === 'wing' ? '#F4B93B' : p.type === 'coin' ? '#E0452B' : '#F9B8C4';
    c.fillStyle = col; c.beginPath(); c.arc(p.x, p.y, 6.5, 0, 6.28); c.fill();
    c.strokeStyle = '#2B2118'; c.stroke();
  }

  ap.floats.forEach(f => {
    c.font = 'bold 9px sans-serif'; c.fillStyle = f.col;
    c.fillText(f.txt, Math.round(f.x), Math.round(f.y));
  });
}

function apUI(){
  const birdsLeft = ap.blocks.filter(b => b.k === 'bird').length;
  $('apBirds').textContent = String(birdsLeft);
  $('apRescued').textContent = String(ap.totalRescued);
  $('apPigs').textContent = 'Đạn heo còn: ' + (ap.queue.length + (ap.cur ? 1 : 0)) + (ap.cur ? ' (Loại: ' + ap.cur + ')' : '');
}

function apOverShow(win, stars){
  ap.over = { win, stars };
  notify(win ? 'HAPTIC_SUCCESS' : 'HAPTIC_FAIL');
  if (win) {
    notify('SAVE_STATS', { wave: ap.wave + 1, savedBabies: ap.totalRescued, foodEarned: 3 });
  }
  const o = $('apOver'); o.hidden = false;
  o.innerHTML = '<div class="card fo"><b>' + (win ? 'VƯỢT MÀN ' + ap.wave + ' THÀNH CÔNG!' : 'HẾT ĐẠN RỒI!') + '</b>' +
    '<div class="stars">' + [1, 2, 3].map(i => '<i class="' + (i <= stars ? 'on' : '') + '"></i>').join('') + '</div>' +
    '<p>' + (win ? 'Giải cứu thêm đàn heo con (+3 thức ăn)!' : 'Gió đổi chiều hoặc căn góc chưa chuẩn. Thử lại nhé!') + '</p>' +
    '<div class="pact"><button class="btn gold" id="apBtnNext">' + (win ? 'Tiếp Màn ' + (ap.wave + 1) : 'Chơi Lại Màn Này') + '</button></div></div>';

  $('apBtnNext').onclick = () => {
    o.hidden = true;
    if (win) apLoad(ap.wave + 1);
    else apLoad(ap.wave);
  };
}

let lastT = performance.now();
function apLoop(now){
  const dt = Math.min(.04, (now - lastT) / 1000);
  lastT = now;
  apStep(dt);
  apDraw();
  apUI();
  requestAnimationFrame(apLoop);
}

// Bắt sự kiện kéo ná cảm ứng
function getPos(e){
  const r = apC.getBoundingClientRect();
  const t = (e.touches && e.touches[0]) || e;
  return {
    x: (t.clientX - r.left) * (AW / r.width),
    y: (t.clientY - r.top) * (AH / r.height)
  };
}

apC.addEventListener('pointerdown', e => {
  if(ap.over) return;
  // Nếu đang bay -> bấm để kích hoạt kỹ năng đặc biệt
  if(ap.pig){
    apTriggerAbility();
    return;
  }
  if(ap.st !== 'aim' || !ap.cur) return;
  const p = getPos(e);
  if(Math.hypot(p.x - SX, p.y - SY) < 26){
    ap.drag = { x: SX, y: SY };
    notify('HAPTIC_LIGHT');
  }
});

window.addEventListener('pointermove', e => {
  if(!ap.drag) return;
  const p = getPos(e);
  const dx = p.x - SX, dy = p.y - SY;
  const d = Math.hypot(dx, dy);
  if(d > MAXD){
    ap.drag.x = SX + (dx / d) * MAXD;
    ap.drag.y = SY + (dy / d) * MAXD;
  } else {
    ap.drag.x = p.x;
    ap.drag.y = p.y;
  }
});

window.addEventListener('pointerup', () => {
  if(!ap.drag) return;
  const dx = ap.drag.x - SX, dy = ap.drag.y - SY;
  ap.drag = null;
  if(Math.hypot(dx, dy) > 6){
    const f = 5.8;
    ap.pig = {
      x: SX, y: SY - 4,
      vx: -dx * f,
      vy: -dy * f,
      type: ap.cur,
      t: 0,
      used: false
    };
    notify('HAPTIC_LIGHT');
    ap.st = 'fly';
  }
});

// Khởi chạy
apLoad(1);
requestAnimationFrame(apLoop);

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
