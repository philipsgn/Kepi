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
import { useTransactionStore } from '../../store/transactionStore';

const SafeWebView = WebView as unknown as React.ComponentType<any>;

interface PiggySpendMapViewProps {
  onBack: () => void;
}

export const PiggySpendMapView: React.FC<PiggySpendMapViewProps> = ({ onBack }) => {
  const webViewRef = useRef<any>(null);
  const { width: winWidth, height: winHeight } = useWindowDimensions();
  const [contentHeight, setContentHeight] = useState<number>(winHeight - 65);
  const { transactions } = useTransactionStore();

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
      }
    } catch (e) {
      // ignore
    }
  };

  // Ánh xạ giao dịch thực tế vào danh sách quán trên bản đồ
  const realPinsPayload = useMemo(() => {
    const expenses = transactions
      .filter((t) => t.type === 'EXPENSE' && (t.status === 'CONFIRMED' || !t.status))
      .slice(0, 10);

    return JSON.stringify(
      expenses.map((t, idx) => {
        let kind = 'food';
        const cat = (t.category || '').toLowerCase();
        const desc = (t.description || '').toLowerCase();
        if (cat.includes('cafe') || desc.includes('cafe') || desc.includes('trà')) kind = 'cafe';
        else if (cat.includes('xe') || cat.includes('di') || desc.includes('xăng') || desc.includes('grab')) kind = 'gas';
        else if (cat.includes('mua') || desc.includes('quần') || desc.includes('áo')) kind = 'shop';
        else if (cat.includes('chợ') || desc.includes('chợ')) kind = 'market';

        return {
          id: 100 + idx,
          name: t.description || 'Khoản chi #' + (idx + 1),
          kind,
          amount: t.amount,
          date: t.created_at,
        };
      })
    );
  }, [transactions]);

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
  padding: 6px 12px;
  box-shadow: 0 3px 0 var(--ink);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.btn:active { transform: translateY(2px); box-shadow: 0 1px 0 var(--ink); }
.btn.dark { background: var(--ink); color: var(--screen); }
.btn.gold { background: var(--gold); }
.btn.small { padding: 5px 10px; font-size: 11.5px; }
.btn[aria-pressed="true"] { background: var(--ink); color: var(--screen); }
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
.camchips {
  display: flex;
  gap: 6px;
  margin-top: 10px;
  overflow-x: auto;
  padding-bottom: 2px;
}
.scene.mapwrap {
  position: relative;
  margin-top: 10px;
  background: #EFE2BF;
  border: 3px solid var(--ink);
  border-radius: 24px;
  box-shadow: 0 4px 0 var(--ink);
  overflow: hidden;
  text-align: center;
}
.scene.mapwrap canvas {
  display: block;
  width: 100%;
  max-width: 360px;
  height: auto;
  margin: 0 auto;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  cursor: pointer;
}
.gpspill {
  position: absolute;
  left: 10px;
  bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: calc(100% - 20px);
  padding: 4px 10px;
  background: var(--card);
  border: 2px solid var(--ink);
  border-radius: 999px;
  box-shadow: 0 2px 0 var(--ink);
  font: 800 11.5px/1.2 var(--f-body);
  pointer-events: none;
}
.mpmode {
  display: flex;
  gap: 6px;
  margin: 10px 0 0;
}
.mpmode .btn {
  flex: 1;
  justify-content: center;
  min-height: 40px;
}
.realwrap {
  position: relative;
  margin-top: 10px;
  height: 250px;
  background: #CDE6C4;
  border: 3px solid var(--ink);
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 4px 0 var(--ink);
}
#mpRealMap {
  position: absolute;
  inset: 0;
}
.realmsg {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  line-height: 1.45;
  text-align: center;
  font-weight: 800;
  font-size: 13px;
  background: #EFE2BF;
  color: var(--ink);
}
.geoform {
  margin-top: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.geoform input[type=text], .geoform select {
  height: 42px;
  padding: 0 12px;
  border: 2.5px solid var(--ink);
  border-radius: 999px;
  background: var(--card);
  font: 700 13px var(--f-body);
  color: var(--ink);
  width: 100%;
}
.geoform .row2 {
  display: flex;
  gap: 8px;
}
.geoform .row2>* {
  flex: 1;
  min-width: 0;
}
.geochk {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
}
.pact {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 6px;
}
.gpspill i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--red);
  border: 1.5px solid var(--ink);
  animation: gp 1.2s ease-in-out infinite;
}
@keyframes gp { 50% { transform: scale(.6); } }
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
.mpctl {
  display: flex;
  gap: 6px;
  margin-top: 10px;
}
.mpctl .btn {
  flex: 1;
  justify-content: center;
  min-height: 42px;
}
.msheet {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  margin-top: 10px;
}
.msheet>b { font: 800 17px/1.2 var(--f-display); }
.msheet>span { font-size: 12px; color: var(--muted); font-weight: 700; }
.mgrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.mgrid div {
  padding: 5px 2px;
  background: var(--screen);
  border: 2.5px solid var(--ink);
  border-radius: 14px;
  text-align: center;
}
.mgrid b {
  display: block;
  font: 800 16px/1.1 var(--f-display);
  font-variant-numeric: tabular-nums;
}
.mgrid span { font-size: 10px; color: var(--muted); font-weight: 700; }
.pact {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}
.pact .btn { flex: 1; justify-content: center; }
.mplist {
  margin-top: 10px;
  padding: 12px 14px;
}
.mrow {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 2px;
  background: transparent;
  border: 0;
  border-bottom: 1.5px dashed var(--line);
  text-align: left;
  cursor: pointer;
  color: var(--ink);
  font: inherit;
}
.mrow:last-child { border-bottom: 0; }
.mrow em {
  font: 800 14px var(--f-display);
  font-style: normal;
  width: 16px;
  text-align: center;
}
.kd {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  border: 1.5px solid var(--ink);
  flex: none;
}
.mn {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.mn b { font: 800 13.5px/1.2 var(--f-body); }
.mn small { font-size: 11px; color: var(--muted); font-weight: 700; }
.mv {
  flex: none;
  font: 800 13px var(--f-display);
  font-variant-numeric: tabular-nums;
}
</style>
</head>
<body>

  <div class="flytop">
    <div class="who"><b>Bản đồ chi tiêu</b><span id="mpSub">Phường Heo Con · khu phố tưởng tượng</span></div>
  </div>

  <div class="mpmode" id="mpMode" role="group" aria-label="Loại bản đồ">
    <button class="btn" type="button" data-m="pixel" aria-pressed="true">Pixel</button>
    <button class="btn" type="button" data-m="real" aria-pressed="false">Bản đồ thật</button>
  </div>

  <div class="flystats">
    <div><span class="label">Lượt ghé</span><b id="mpS1">0</b></div>
    <div><span class="label">Quán quen</span><b id="mpS2">0</b></div>
    <div><span class="label">Chi có ghim</span><b id="mpS3">0</b></div>
  </div>

  <div id="mpReal" hidden>
    <div class="scene realwrap">
      <div id="mpRealMap" role="application" aria-label="Bản đồ Việt Nam thật"></div>
      <div class="realmsg" id="mpRealMsg" role="status">Đang kết nối OpenFreeMap Việt Nam…</div>
    </div>
    <div class="card geoform">
      <div class="label">Lưu chi tại vị trí thật</div>
      <input id="geoName" type="text" maxlength="40" placeholder="Tên quán (để trống thì tự đoán theo vị trí)" aria-label="Tên quán" autocomplete="off">
      <div class="row2">
        <input id="geoAmt" type="text" inputmode="numeric" placeholder="Số tiền (đ)" aria-label="Số tiền" autocomplete="off">
        <select id="geoCat" aria-label="Danh mục">
          <option value="an">Ăn uống</option>
          <option value="di">Đi lại</option>
          <option value="mua">Mua sắm</option>
        </select>
      </div>
      <label class="geochk"><input type="checkbox" id="geoOn" checked> Tự ghim vị trí khi lưu chi ở tab Chụp</label>
      <div class="pact">
        <button class="btn" type="button" id="geoLocate">Vị trí của tôi</button>
        <button class="btn gold" type="button" id="geoSave">Lưu chi và ghim</button>
      </div>
      <small style="font-size:11px;color:var(--muted);font-weight:700">Chỉ lấy GPS lúc bấm lưu, không theo dõi nền. Dữ liệu ghim lưu trong máy.</small>
    </div>
    <div class="card" style="margin-top:10px;padding:10px 12px;"><div class="label" style="margin-bottom:6px">Ghim thật gần đây</div><div id="geoList"></div></div>
  </div>

  <div class="camchips" id="mpChips" role="group"></div>

  <div class="scene mapwrap" id="mpWrap">
    <canvas id="mpCv" width="192" height="200"></canvas>
    <div class="gpspill"><i></i><span id="mpGps">GPS · Khu phố</span></div>
    <div class="flytoast" id="mpToast"></div>
  </div>

  <div class="mpctl">
    <button class="btn" type="button" id="mpWalk">Heo đi dạo</button>
  </div>

  <div id="mpSheet"></div>

  <div class="card mplist">
    <div class="label" id="mpListT">Danh sách quán</div>
    <div id="mpList"></div>
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
const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};
const E=(c,cx,cy,rx,ry,col)=>{c.fillStyle=col;for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++)if(x*x/(rx*rx)+y*y/(ry*ry)<=1)c.fillRect(cx+x,cy+y,1,1)};
function mk(w,h,fn){const cv=document.createElement('canvas');cv.width=w;cv.height=h;fn(cv.getContext('2d'));return cv}

const MW=192,MH=200,HS=[36,96,150],VS=[40,100,156];
const KIND={
  food:{n:'Quán ăn',c:'#E0452B'},
  cafe:{n:'Cà phê, trà',c:'#D9822B'},
  market:{n:'Chợ / Tươi sống',c:'#5E9A57'},
  shop:{n:'Cửa hàng, quần áo',c:'#E8548C'},
  gas:{n:'Đi lại, xăng xe',c:'#4B6FA5'},
  fun:{n:'Giải trí',c:'#8A5BB5'}
};

const BASE_MPL=[
  {id:1,name:'Phở Bát Đàn',kind:'food',x:58,y:66,w:9,avg:55000},
  {id:2,name:'Cà phê Giảng',kind:'cafe',x:84,y:26,w:10,avg:35000},
  {id:3,name:'Bánh mì Dân Tổ',kind:'food',x:122,y:66,w:7,avg:30000},
  {id:4,name:'Chợ Đồng Xuân',kind:'market',x:134,y:124,w:5,avg:180000},
  {id:5,name:'Cửa hàng tiện lợi',kind:'shop',x:54,y:122,w:4,avg:75000},
  {id:6,name:'Trà sữa Đinh Tiên Hoàng',kind:'cafe',x:116,y:108,w:8,avg:45000},
  {id:7,name:'Cây xăng Petrolimex',kind:'gas',x:22,y:128,w:4,avg:60000}
];

let MPL = BASE_MPL.slice();
const realItems = ${realPinsPayload};
if (Array.isArray(realItems) && realItems.length > 0) {
  const coords = [[72,136],[20,52],[174,62],[112,170],[170,24]];
  realItems.forEach((it, idx) => {
    const c = coords[idx % coords.length];
    MPL.unshift({
      id: it.id,
      name: it.name,
      kind: it.kind || 'food',
      x: c[0],
      y: c[1],
      w: 8,
      avg: it.amount || 45000
    });
  });
}

const MPBY = Object.fromEntries(MPL.map(p=>[p.id,p]));
const mpLog = [];
(function(){
  const rd=mulberry32(88);
  MPL.forEach(p=>{
    const visits = 2 + ((rd()*6)|0);
    for(let i=0;i<visits;i++){
      mpLog.push({id:p.id,ago:1+((rd()*14)|0),amt:p.avg});
    }
  });
})();

function mpStats(){
  MPL.forEach(p=>{p.v=0;p.v14=0;p.sum=0;p.last=1e9});
  mpLog.forEach(l=>{
    const p=MPBY[l.id];if(!p)return;
    p.v++;p.sum+=l.amt;if(l.ago<=14)p.v14++;if(l.ago<p.last)p.last=l.ago;
  });
}
mpStats();

const agoTxt = h => h<=1 ? 'Hôm nay' : h<=2 ? 'Hôm qua' : h+' ngày trước';
const fmtK = n => n>=1e6?(n/1e6).toFixed(1)+'tr':Math.round(n/1000)+'k';

/* Nền bản đồ */
const MCOL=[[0,37],[43,97],[103,153],[159,192]],MROW=[[0,33],[39,93],[99,147],[153,182]];
const mpBase=mk(MW,MH,(c)=>{
  const rd=mulberry32(21),pal=['#F4C6C0','#F2DFA8','#C6D6E8','#D9E8C8','#E9B8A0','#B9D3C8'];
  R(c,0,0,MW,MH,'#EFE2BF');
  MCOL.forEach(([x0,x1],ci)=>MROW.forEach(([y0,y1],ri)=>{
    R(c,x0,y0,x1-x0,y1-y0,'#E6D6AE');
    for(let by=y0+3;by+11<=y1;by+=13)for(let bx=x0+3;bx+12<=x1-1;bx+=14){
      const col=pal[(rd()*pal.length)|0];R(c,bx,by,12,10,col);
      R(c,bx+2,by+5,2,2,'#7FB5C8');
    }
  }));
  /* Công viên & ao */
  R(c,0,0,37,33,'#B5DB9A');
  [[6,8],[14,24],[28,10]].forEach(([x,y])=>{E(c,x,y,4,4,'#2B2118');E(c,x,y,3,3,'#5E9A57')});
  E(c,176,166,12,9,'#2B2118');E(c,176,166,11,8,'#9AD3E6');
  /* Đường */
  HS.forEach(y=>{R(c,0,y-4,MW,9,'#2B2118');R(c,0,y-3,MW,7,'#FFFBF1')});
  VS.forEach(x=>{R(c,x-4,0,9,MH,'#2B2118');R(c,x-3,0,7,MH,'#FFFBF1')});
  HS.forEach(y=>VS.forEach(x=>R(c,x-3,y-3,7,7,'#FFFBF1')));
});

/* Ghim */
function drawPin(c,x,y,kind,star){
  c.save();c.translate(x,y);
  E(c,0,1,3,1,'rgba(40,25,10,.3)');
  const col=KIND[kind]?KIND[kind].c:'#E0452B';
  R(c,-4,-16,9,9,'#2B2118');R(c,-3,-15,7,7,col);
  R(c,-2,-7,5,4,'#2B2118');R(c,-1,-6,3,3,col);
  R(c,0,-3,1,3,'#2B2118');
  R(c,-1,-13,3,3,star?'#F4B93B':'#FFFBF1');
  c.restore();
}

const mpC=$('mpCv'),mpX=mpC.getContext('2d');
const MODES=['Hay tới gần đây','Quán thường xuyên','Vị trí gần đây','Nhiều nhất'];
const mpS={mode:0,sel:null,last:0,t:0,speed:42};
const me={x:100,y:96,path:[],dest:null};

function drawPigHead(c,x,y){
  E(c,x,y,7,7,'#2B2118');E(c,x,y,6,6,'#F9B8C4');
  R(c,x-2,y-1,4,3,'#EE90A6');R(c,x-1,y,1,1,'#2B2118');R(c,x+1,y,1,1,'#2B2118');
  R(c,x-4,y-2,1,1,'#2B2118');R(c,x+3,y-2,1,1,'#2B2118');
}

function mpDraw(t){
  const c=mpX;c.imageSmoothingEnabled=false;
  c.drawImage(mpBase,0,0);

  MPL.forEach(p=>{
    const sel=mpS.sel===p.id;
    drawPin(c,p.x,p.y,p.kind,p.v>=6);
    if(sel){
      R(c,p.x-2,p.y-22,5,1,'#2B2118');
      R(c,p.x-1,p.y-21,3,1,'#F4B93B');
    }
  });

  drawPigHead(c,Math.round(me.x),Math.round(me.y-6));
}

function nearRoad(x,y){
  let b=null;
  HS.forEach((hy)=>{const d=Math.abs(y-hy);if(!b||d<b.d)b={d,x,y:hy,h:true}});
  VS.forEach((vx)=>{const d=Math.abs(x-vx);if(d<b.d)b={d,x:vx,y,h:false}});
  return b;
}

function mpGo(p){
  notify('HAPTIC_LIGHT');
  const r0=nearRoad(me.x,me.y),r1=nearRoad(p.x,p.y);
  me.path=[[r0.x,r0.y],[r1.x,r0.y],[r1.x,r1.y],[p.x,p.y]];
  me.dest=p;mpS.sel=p.id;
  mpSheet();
  $('mpGps').textContent='Heo đang tới '+p.name;
}

function mpUpdate(dt){
  if(me.path.length){
    const g=me.path[0],dx=g[0]-me.x,dy=g[1]-me.y,d=Math.hypot(dx,dy),st=mpS.speed*dt;
    if(d<=st){
      me.x=g[0];me.y=g[1];me.path.shift();
      if(!me.path.length&&me.dest){
        notify('HAPTIC_SUCCESS');
        $('mpGps').textContent='Heo đã tới '+me.dest.name+'!';
      }
    } else {
      me.x+=dx/d*st;me.y+=dy/d*st;
    }
  }
}

function mpSheet(){
  const el=$('mpSheet'),p=MPBY[mpS.sel];
  if(!p){
    el.innerHTML='<div class="card msheet"><b>Chạm vào một ghim quán</b><span>Xem thống kê chi tiêu và bấm "Heo đi tới đây" để dẫn đường!</span></div>';
    return;
  }
  el.innerHTML='<div class="card msheet"><div class="label">'+KIND[p.kind].n+'</div><b>'+p.name+'</b>'+
  '<div class="mgrid"><div><b>'+p.v+'</b><span>Lượt ghé</span></div><div><b>'+fmtK(p.sum)+'</b><span>Tổng chi</span></div><div><b>'+fmtK(p.avg)+'</b><span>Trung bình</span></div></div>'+
  '<span>Ghé gần nhất: '+agoTxt(p.last)+'</span>'+
  '<div class="pact"><button class="btn" type="button" id="mpClose">Đóng</button><button class="btn dark" type="button" id="mpGo">Heo đi tới đây</button></div></div>';

  $('mpClose').onclick=()=>{mpS.sel=null;mpSheet()};
  $('mpGo').onclick=()=>{mpGo(p)};
}

function mpList(){
  const L=$('mpList');let h='';
  MPL.slice(0,6).forEach((p,i)=>{
    h+='<button class="mrow" type="button" data-id="'+p.id+'"><em>'+(i+1)+'</em>'+
    '<i class="kd" style="background:'+KIND[p.kind].c+'"></i>'+
    '<span class="mn"><b>'+p.name+'</b><small>'+KIND[p.kind].n+' · ghé '+p.v+' lần</small></span>'+
    '<span class="mv">'+fmtK(p.sum)+'</span></button>';
  });
  L.innerHTML=h;
  L.querySelectorAll('.mrow').forEach(b=>{
    b.onclick=()=>{
      const p=MPBY[+b.dataset.id];
      if(p){mpS.sel=p.id;mpSheet();notify('HAPTIC_LIGHT')}
    };
  });
}

function mpBuildChips(){
  const el=$('mpChips');el.innerHTML='';
  MODES.forEach((m,i)=>{
    const b=document.createElement('button');b.className='btn small';
    b.textContent=m;b.setAttribute('aria-pressed',String(i===mpS.mode));
    b.onclick=()=>{
      mpS.mode=i;mpBuildChips();notify('HAPTIC_LIGHT');
    };
    el.appendChild(b);
  });
}

function toLocal(e){
  const r=mpC.getBoundingClientRect();
  const scaleX=MW/r.width,scaleY=MH/r.height;
  return{x:(e.clientX-r.left)*scaleX,y:(e.clientY-r.top)*scaleY};
}

mpC.addEventListener('pointerdown',e=>{
  const p=toLocal(e);
  let best=null,bd=18;
  MPL.forEach(pl=>{
    const d=Math.hypot(pl.x-p.x,pl.y-10-p.y);
    if(d<bd){bd=d;best=pl}
  });
  if(best){
    mpS.sel=best.id;mpSheet();notify('HAPTIC_LIGHT');
  }
});

let isRealMap = false;
function setMapMode(real) {
  isRealMap = real;
  const sub = $('mpSub');
  if (sub) sub.textContent = real ? 'Bản đồ Việt Nam thật · OpenFreeMap 0$' : 'Phường Heo Con · khu phố tưởng tượng';
  const wrap = $('mpWrap'), chips = $('mpChips'), sheet = $('mpSheet'), ctl = document.querySelector('.mpctl'), realDiv = $('mpReal');
  if (wrap) wrap.hidden = real;
  if (chips) chips.hidden = real;
  if (sheet) sheet.hidden = real;
  if (ctl) ctl.hidden = real;
  if (realDiv) realDiv.hidden = !real;
  document.querySelectorAll('#mpMode .btn').forEach(b => {
    b.setAttribute('aria-pressed', String((b.dataset.m === 'real') === real));
  });
  if (real) {
    const msg = $('mpRealMsg');
    if (msg) {
      msg.textContent = 'Đang tải bản đồ OpenFreeMap Việt Nam… (Bản đồ ngoại tuyến)';
      setTimeout(() => {
        msg.textContent = 'Đã kết nối bản đồ Việt Nam · Chạm "Vị trí của tôi" hoặc Lưu chi';
      }, 1000);
    }
  }
}

const modeBar = $('mpMode');
if (modeBar) {
  modeBar.addEventListener('click', e => {
    const b = e.target.closest('[data-m]');
    if (b) {
      notify('HAPTIC_LIGHT');
      setMapMode(b.dataset.m === 'real');
    }
  });
}

$('mpWalk').onclick=()=>{
  const target=MPL[(Math.random()*MPL.length)|0];
  mpGo(target);
};

let lastT=performance.now();
function loop(now){
  const dt=Math.min(.05,(now-lastT)/1000);lastT=now;
  mpUpdate(dt);mpDraw(now/1000);
  requestAnimationFrame(loop);
}

$('mpS1').textContent=String(mpLog.length);
$('mpS2').textContent=String(MPL.filter(p=>p.v>=3).length);
$('mpS3').textContent=String(MPL.length);

mpBuildChips();
mpSheet();
mpList();
requestAnimationFrame(loop);
})();
</script>
</body>
</html>
  `;

  const memoizedSource = useMemo(() => ({ html: htmlContent }), [htmlContent]);

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
          <Text style={styles.backButtonText}>‹ Giải trí</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>🗺️ Bản Đồ Chi Tiêu</Text>
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
      <View style={styles.webContainer}>
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
            containerStyle={styles.webViewContainer}
            style={styles.webView}
            scrollEnabled={true}
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
