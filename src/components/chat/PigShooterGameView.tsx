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

interface PigShooterGameViewProps {
  onBack: () => void;
}

export const PigShooterGameView: React.FC<PigShooterGameViewProps> = ({ onBack }) => {
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
  padding: 6px 12px;
  box-shadow: 0 3px 0 var(--ink);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.btn:active { transform: translateY(2px); box-shadow: 0 1px 0 var(--ink); }
.btn.gold { background: var(--gold); }
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
.camchips {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  overflow-x: auto;
}
.scene.apwrap {
  position: relative;
  margin-top: 10px;
  background: #BFE6F6;
  border: 3px solid var(--ink);
  border-radius: 24px;
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
.flyover {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
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
.flyover .fo>b { font: 800 20px/1.1 var(--f-display); }
.stars { display: flex; justify-content: center; gap: 8px; margin: 4px 0; }
.stars i {
  width: 26px; height: 26px; background: var(--line); border: 2.5px solid var(--ink);
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
.apinfo b { font: 800 14px/1.3 var(--f-body); }
.apinfo span { font-size: 12px; color: var(--muted); font-weight: 700; }
.pact { display: flex; gap: 8px; justify-content: center; margin-top: 6px; }
</style>
</head>
<body>

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
    <span id="apBonus">Kéo heo trên ná về sau rồi thả để bắn phá khối!</span>
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

const AW=224,AH=140,AG=118,SX=36,SY=92,MAXD=28,AGR=230;
const BLK={
  wood:{c:'#C49A6E',d:'#8A5A34',hp:45,dn:1},
  stone:{c:'#B9B2A6',d:'#7A7468',hp:110,dn:1.7},
  glass:{c:'#B8E4F0',d:'#5FA9C4',hp:16,dn:.6},
  cage:{c:'#CFCFD8',d:'#5A5A66',hp:42,dn:1.2}
};

const APL=[
 {n:'Ổ chim nhỏ',it:[['wood',150,96,6,22],['wood',166,96,6,22],['wood',146,91,30,5],['bird',153,77,14,14],['bird',178,104,14,14],['cage',192,98,22,20]]},
 {n:'Tháp gỗ đá',it:[['stone',140,98,8,20],['stone',170,98,8,20],['wood',136,93,46,5],['cage',144,73,22,20],['bird',167,79,14,14],['bird',186,104,14,14],['cage',200,98,22,20]]},
 {n:'Cổng thành chim',it:[['wood',124,90,6,28],['wood',146,90,6,28],['wood',168,90,6,28],['wood',120,85,34,5],['wood',164,85,22,5],['cage',126,65,22,20],['bird',152,104,14,14],['bird',172,71,14,14],['cage',196,98,22,20]]}
];

const ap={
  lv:0,last:0,t:0,acc:0,blocks:[],queue:[],pig:null,drag:null,st:'aim',
  parts:[],floats:[],kills:0,settle:0,over:null,cur:'pig',free:[],cages:0,rescued:0,winT:0,birds0:0
};

function apNote(t){
  const e=$('apToast');if(!e)return;
  e.textContent=t;e.classList.add('on');
  setTimeout(()=>e.classList.remove('on'),2200);
}

function apLoad(i){
  ap.lv=i;const L=APL[i];
  ap.blocks=L.it.map(([k,x,y,w,h])=>{
    const o={k,x,y,w,h,vx:0,vy:0,fl:0};
    if(k==='bird'){o.hp=1;o.m=5}
    else if(k==='cage'){o.hp=BLK.cage.hp;o.m=Math.max(1,w*h*BLK.cage.dn/25)}
    else{o.hp=BLK[k].hp;o.m=Math.max(1,w*h*BLK[k].dn/25)}
    return o;
  });
  ap.queue=['pig','pig','pig','pig'];
  ap.free=[];ap.cages=L.it.filter(a=>a[0]==='cage').length;ap.rescued=0;ap.winT=0;
  ap.birds0=L.it.filter(a=>a[0]==='bird').length;
  ap.pig=null;ap.drag=null;ap.parts=[];ap.floats=[];ap.kills=0;ap.over=null;ap.settle=0;ap.acc=0;
  apNextPig();
}

function apNextPig(){
  ap.cur=ap.queue.shift()||null;
  ap.st=ap.cur?'aim':'end';
  ap.settle=0;
}

function apKill(b){
  const idx=ap.blocks.indexOf(b);if(idx<0)return;
  ap.blocks.splice(idx,1);
  if(b.k==='bird'){
    ap.kills++;notify('HAPTIC_SUCCESS');
    ap.floats.push({x:b.x+7,y:b.y,txt:'+1 chim',col:'#C98A12'});
  } else if(b.k==='cage'){
    ap.rescued++;notify('HAPTIC_SUCCESS');
    ap.floats.push({x:b.x+8,y:b.y-4,txt:'+Cứu Heo!',col:'#3E7A3A'});
  }
}

function apImpact(b,spd){
  if(spd<35)return;
  b.fl=.15;
  if(b.k==='bird'){if(spd>32)apKill(b)}
  else{b.hp-=(spd-35)*1.1;if(b.hp<=0)apKill(b)}
}

function apStep(dt){
  const bl=ap.blocks;
  bl.forEach(b=>{
    b.vy+=AGR*dt;b.y+=b.vy*dt;b.x+=b.vx*dt;b.vx*=.99;if(b.fl>0)b.fl-=dt;
    if(b.y+b.h>AG){const s=Math.abs(b.vy);b.y=AG-b.h;b.vy=0;b.vx*=.9;apImpact(b,s)}
  });

  const p=ap.pig;
  if(p){
    p.t+=dt;p.vy+=AGR*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
    const R=7;
    if(p.y+R>AG){p.y=AG-R;p.vy=-p.vy*.3;p.vx*=.82;if(Math.abs(p.vy)<14)p.vy=0}
    for(const b of ap.blocks.slice()){
      const cx=Math.max(b.x,Math.min(p.x,b.x+b.w)),cy=Math.max(b.y,Math.min(p.y,b.y+b.h)),dx=p.x-cx,dy=p.y-cy,d=Math.hypot(dx,dy);
      if(d>=R)continue;
      const nx=d>0?dx/d:0,ny=d>0?dy/d:-1,vn=-(p.vx*nx+p.vy*ny);
      p.x+=nx*(R-d);p.y+=ny*(R-d);
      if(vn<=0)continue;
      if(b.k==='bird'){if(vn>18){apKill(b);p.vx*=.8;continue}}
      const j=1.3*vn*8*b.m/(8+b.m);
      p.vx+=nx*j/8;p.vy+=ny*j/8;b.vx-=nx*j/b.m;b.vy-=ny*j/b.m*.4;
      apImpact(b,vn);
    }
    if(p.x>AW+20||p.x<-20||(Math.hypot(p.vx,p.vy)<8&&p.y>=AG-R-1)){
      ap.settle+=dt;if(ap.settle>.8){ap.pig=null;apNextPig()}
    }
  }

  const birdsLeft=ap.blocks.filter(b=>b.k==='bird').length;
  if(birdsLeft===0&&!ap.over){
    ap.winT+=dt;
    if(ap.winT>.8){
      const stars=ap.queue.length>=2?3:ap.queue.length===1?2:1;
      apOverShow(true,stars);
    }
  } else if(!ap.pig&&!ap.cur&&birdsLeft>0&&!ap.over){
    apOverShow(false,0);
  }

  ap.floats.forEach(f=>{f.y-=14*dt});
}

const apC=$('apCv'),apX=apC.getContext('2d');

function apDraw(){
  const c=apX;c.imageSmoothingEnabled=false;
  c.fillStyle='#BFE6F6';c.fillRect(0,0,AW,AH);
  c.fillStyle='#86B866';c.fillRect(0,AG,AW,AH-AG);
  c.fillStyle='#2B2118';c.fillRect(0,AG,AW,2);

  /* Nỏ bắn */
  c.fillStyle='#6B4426';c.fillRect(SX-2,SY,4,AG-SY);
  c.fillRect(SX-6,SY-10,4,12);c.fillRect(SX+2,SY-10,4,12);

  /* Khối & chim */
  ap.blocks.forEach(b=>{
    if(b.k==='bird'){
      c.fillStyle='#E0452B';c.beginPath();c.arc(b.x+7,b.y+7,6,0,6.28);c.fill();
      c.fillStyle='#2B2118';c.stroke();
      c.fillStyle='#F4B93B';c.fillRect(b.x+6,b.y+6,4,2);
    } else if(b.k==='cage'){
      c.fillStyle='#CFCFD8';c.fillRect(b.x,b.y,b.w,b.h);
      c.strokeStyle='#2B2118';c.strokeRect(b.x,b.y,b.w,b.h);
      for(let x=b.x+4;x<b.x+b.w;x+=5){c.strokeRect(x,b.y,1,b.h)}
    } else {
      c.fillStyle=BLK[b.k].c;c.fillRect(b.x,b.y,b.w,b.h);
      c.strokeStyle='#2B2118';c.strokeRect(b.x,b.y,b.w,b.h);
    }
  });

  /* Dây ná & heo kéo */
  const drag=ap.drag;
  const hx=drag?drag.x:SX,hy=drag?drag.y:SY-4;
  c.strokeStyle='#2B2118';c.lineWidth=2;
  c.beginPath();c.moveTo(SX-4,SY-6);c.lineTo(hx,hy);c.lineTo(SX+4,SY-6);c.stroke();
  c.lineWidth=1;

  if(ap.st==='aim'&&ap.cur){
    c.fillStyle='#F9B8C4';c.beginPath();c.arc(hx,hy,6,0,6.28);c.fill();
    c.fillStyle='#2B2118';c.stroke();
  }

  const p=ap.pig;
  if(p){
    c.fillStyle='#F9B8C4';c.beginPath();c.arc(p.x,p.y,6.5,0,6.28);c.fill();
    c.fillStyle='#2B2118';c.stroke();
  }

  ap.floats.forEach(f=>{
    c.font='bold 9px sans-serif';c.fillStyle=f.col;
    c.fillText(f.txt,Math.round(f.x),Math.round(f.y));
  });
}

function apUI(){
  const birdsLeft=ap.blocks.filter(b=>b.k==='bird').length;
  $('apBirds').textContent=String(birdsLeft);
  $('apStars').textContent=String(ap.kills);
  $('apPigs').textContent='Đạn heo còn: '+(ap.queue.length+(ap.cur?1:0));
}

function apOverShow(win,stars){
  ap.over={win,stars};
  notify(win?'HAPTIC_SUCCESS':'HAPTIC_FAIL');
  const o=$('apOver');o.hidden=false;
  o.innerHTML='<div class="card fo"><b>'+(win?'Thắng rồi!':'Hết đạn rồi!')+'</b>'+
  '<div class="stars">'+[1,2,3].map(i=>'<i class="'+(i<=stars?'on':'')+'"></i>').join('')+'</div>'+
  '<p>'+(win?'Giải cứu thành công đàn heo con!':'Thử lại để bắn chuẩn xác hơn nhé!')+'</p>'+
  '<div class="pact"><button class="btn" type="button" id="apRetry">Chơi lại</button>'+
  (win&&ap.lv<2?'<button class="btn gold" type="button" id="apNext">Màn kế</button>':'')+
  '</div></div>';
  $('apRetry').addEventListener('click',()=>{o.hidden=true;apLoad(ap.lv)});
  if($('apNext'))$('apNext').addEventListener('click',()=>{o.hidden=true;apLoad(ap.lv+1);apBuildChips()});
}

function apBuildChips(){
  const el=$('apLv');el.innerHTML='';
  APL.forEach((L,i)=>{
    const b=document.createElement('button');b.className='btn small';
    b.textContent='Màn '+(i+1);b.setAttribute('aria-pressed',String(i===ap.lv));
    b.onclick=()=>{apLoad(i);apBuildChips();$('apLvT').textContent='Màn '+(i+1)+': '+L.n};
    el.appendChild(b);
  });
}

function toLocal(e){
  const r=apC.getBoundingClientRect();
  const scaleX=AW/r.width,scaleY=AH/r.height;
  return{x:(e.clientX-r.left)*scaleX,y:(e.clientY-r.top)*scaleY};
}

apC.addEventListener('pointerdown',e=>{
  if(ap.st!=='aim'||!ap.cur)return;
  const p=toLocal(e);
  if(Math.hypot(p.x-SX,p.y-SY)<24){
    ap.drag={x:p.x,y:p.y};
    notify('HAPTIC_LIGHT');
  }
});

window.addEventListener('pointermove',e=>{
  if(!ap.drag)return;
  const p=toLocal(e);
  const dx=p.x-SX,dy=p.y-SY,d=Math.hypot(dx,dy);
  if(d>MAXD){ap.drag={x:SX+dx/d*MAXD,y:SY+dy/d*MAXD}}else{ap.drag={x:p.x,y:p.y}}
});

window.addEventListener('pointerup',()=>{
  if(!ap.drag)return;
  const d=ap.drag;ap.drag=null;
  const dx=SX-d.x,dy=SY-d.y,spd=Math.hypot(dx,dy)*8.5;
  if(spd>30){
    ap.pig={x:d.x,y:d.y,vx:dx/Math.hypot(dx,dy)*spd,vy:dy/Math.hypot(dx,dy)*spd,t:0};
    ap.st='flying';ap.cur=null;
    notify('HAPTIC_LIGHT');
  }
});

let lastT=performance.now();
function loop(now){
  const dt=Math.min(.05,(now-lastT)/1000);lastT=now;
  apStep(dt);apDraw();apUI();
  requestAnimationFrame(loop);
}

apBuildChips();
apLoad(0);
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
          <Text style={styles.headerTitle}>🎯 Heo Bắn</Text>
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
