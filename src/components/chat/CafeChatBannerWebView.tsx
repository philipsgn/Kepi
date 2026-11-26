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
import { useBudgetStore } from '../../store/budgetStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { formatVND } from '../../utils/currency';
import { buildOpenRoomEngineScript } from '../pixel/pixelOpenRoomEngine';
import { buildCafeInteriorArtScript } from './cafe/cafeInteriorArt';

const SafeWebView = WebView as unknown as React.ComponentType<any>;

interface CafeChatBannerWebViewProps {
  latestUserText?: string | null;
  latestAiText?: string;
  isThinking?: boolean;
  active?: boolean;
  onExitToHub?: () => void;
}

/**
 * Quán Cà Phê Sài Gòn Liền Mạch 16-Bit (432×128 trên Viewport 144×96 — Quyết định 203)
 * Công thức diện tích chuẩn:
 * - W_world = 3 × W_view (432px), H_world = 4/3 × H_view (128px) -> 55,296 px² (4× viewport).
 * - 1 Offscreen Canvas duy nhất (0 vết ghép): Trần gỗ/đèn thả (0..16), Tường kem gỗ (16..74),
 *   Len gỗ (74..78), Sàn gạch bông Sài Gòn liên tục (78..128).
 * - 4 khu liên thông: Quầy Bar Cà Phê Phin (0..112) -> Bàn Heo & Heo AI (112..240)
 *   -> Góc Đọc Sách & Cây Thông Trang Trí (240..344) -> Cửa Kính Ra Phố Khám Phá (344..432).
 */
export const CafeChatBannerWebView: React.FC<CafeChatBannerWebViewProps> = ({
  latestUserText = null,
  latestAiText = 'Chào bạn! Hỏi heo về ngân sách hoặc khoản chi vừa ghi nhé.',
  isThinking = false,
  active = true,
  onExitToHub,
}) => {
  const webViewRef = useRef<any>(null);
  const iframeRef = useRef<any>(null);

  const { todayBudget, todaySpent } = useBudgetStore();
  const { streakDays } = useGamificationStore();
  const [roomToast, setRoomToast] = useState<string | null>(null);
  const [isAtCenterTable, setIsAtCenterTable] = useState<boolean>(true);
  const roomToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [expandMe, setExpandMe] = useState(false);
  const [expandAi, setExpandAi] = useState(false);
  const [typedAiText, setTypedAiText] = useState(latestAiText);
  const prevAiRef = useRef<string>(latestAiText);
  const prevUserRef = useRef<string | null>(latestUserText);

  const sendActionToCanvas = (fnCall: string, payloadObj: Record<string, any>) => {
    if (Platform.OS === 'web') {
      try {
        iframeRef.current?.contentWindow?.postMessage(JSON.stringify(payloadObj), '*');
      } catch (_e) {}
      return;
    }
    webViewRef.current?.injectJavaScript?.(`${fnCall}; true;`);
  };

  useEffect(() => {
    if (latestUserText && latestUserText !== prevUserRef.current) {
      prevUserRef.current = latestUserText;
      setExpandMe(false);
      setIsAtCenterTable(true);
      sendActionToCanvas('window.__cbSend && window.__cbSend()', { type: 'CB_SEND' });
    }
  }, [latestUserText]);

  useEffect(() => {
    if (isThinking) {
      setIsAtCenterTable(true);
      sendActionToCanvas('window.__cbThink && window.__cbThink(true)', { type: 'CB_THINK', val: true });
    }
  }, [isThinking]);

  useEffect(() => {
    if (!isThinking && latestAiText) {
      if (latestAiText !== prevAiRef.current) {
        prevAiRef.current = latestAiText;
        setExpandAi(false);
        setIsAtCenterTable(true);
        sendActionToCanvas(
          `window.__cbReply && window.__cbReply(${Math.min(5, latestAiText.length / 30)})`,
          { type: 'CB_REPLY', dur: Math.min(5, latestAiText.length / 30) }
        );
        let i = 0;
        setTypedAiText('');
        const timer = setInterval(() => {
          i += 2;
          setTypedAiText(latestAiText.slice(0, i));
          if (i >= latestAiText.length) {
            clearInterval(timer);
          }
        }, 28);
        return () => clearInterval(timer);
      } else {
        setTypedAiText(latestAiText);
      }
    }
  }, [latestAiText, isThinking]);

  useEffect(() => {
    sendActionToCanvas(
      `window.__cbSetActive && window.__cbSetActive(${active ? 'true' : 'false'})`,
      { type: 'CB_ACTIVE', val: active }
    );
  }, [active]);

  useEffect(() => {
    return () => {
      if (roomToastTimerRef.current) clearTimeout(roomToastTimerRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  const showRoomToast = (text: string) => {
    setRoomToast(text);
    if (roomToastTimerRef.current) clearTimeout(roomToastTimerRef.current);
    roomToastTimerRef.current = setTimeout(() => setRoomToast(null), 2600);
  };

  const handleRoomPayload = (d: any) => {
    if (!d) return;
    if (d.type === 'HAPTIC_LIGHT') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else if (d.type === 'ROOM_CAM' && typeof d.atCenter === 'boolean') {
      setIsAtCenterTable(d.atCenter);
    } else if (d.type === 'ROOM_ACTION') {
      if (d.text) showRoomToast(String(d.text));
      if (d.id === 'exit_door' && d.userTriggered && onExitToHub) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
        exitTimerRef.current = setTimeout(() => {
          onExitToHub();
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
  }, [onExitToHub]);

  const handleMessage = (event: any) => {
    try {
      const d = JSON.parse(event.nativeEvent.data);
      handleRoomPayload(d);
    } catch (_e) {}
  };

  const remainingToday = Math.max(0, (todayBudget || 0) - (todaySpent || 0));
  const cafeInteriorScript = useMemo(() => buildCafeInteriorArtScript(), []);
  const openRoomScript = useMemo(
    () =>
      buildOpenRoomEngineScript({
        canvasId: 'chCv',
        worldWidth: 720,
        worldHeight: 176,
        viewWidth: 180,
        viewHeight: 120,
        walkBounds: { minX: 18, maxX: 700, minY: 102, maxY: 168 },
        initialX: 184,
        initialY: 124,
        initialCamX: 112,
        initialCamY: 24,
        speed: 42,
        obstacles: [
          { x: 6, y: 74, w: 120, h: 32 }, // Quầy Bar
          { x: 192, y: 108, w: 34, h: 18 }, // Bàn Heo AI
          { x: 286, y: 98, w: 64, h: 30 }, // Sofa + bàn trà
          { x: 428, y: 104, w: 96, h: 20 }, // Bàn dài Workshop
          { x: 136, y: 146, w: 28, h: 16 }, // Bàn tròn tiền cảnh trái
          { x: 338, y: 146, w: 36, h: 16 }, // Bàn laptop tiền cảnh giữa
          { x: 560, y: 146, w: 24, h: 16 }, // Bàn tròn tiền cảnh phải
        ],
        hotspots: [
          {
            id: 'phin_bar',
            x: 6,
            y: 52,
            w: 120,
            h: 56,
            standX: 64,
            standY: 120,
            standFace: -1,
            actionType: 'sip_coffee',
            bubbleText: `Quầy bar cà phê phin · Barista đang pha · Đã chi ${formatVND(todaySpent || 0)}`,
          },
          {
            id: 'ai_table',
            x: 188,
            y: 96,
            w: 44,
            h: 34,
            standX: 184,
            standY: 124,
            standFace: 1,
            actionType: 'jump_joy',
            bubbleText: `Còn lại hôm nay: ${formatVND(remainingToday)} · Chuỗi ${streakDays || 0} ngày!`,
          },
          {
            id: 'reading_nook',
            x: 278,
            y: 24,
            w: 128,
            h: 98,
            standX: 340,
            standY: 136,
            standFace: 1,
            actionType: 'check_ledger',
            bubbleText: `Thư viện 3 kệ sách & Sofa ấm cúng · Hạn mức ${formatVND(todayBudget || 0)}`,
          },
          {
            id: 'coffee_workshop',
            x: 424,
            y: 44,
            w: 104,
            h: 82,
            standX: 476,
            standY: 138,
            standFace: 1,
            actionType: 'sip_coffee',
            bubbleText: `Mini Coffee Workshop · Thử pha cà phê phin & pour-over!`,
          },
          {
            id: 'clothes_boutique',
            x: 538,
            y: 40,
            w: 74,
            h: 72,
            standX: 572,
            standY: 128,
            standFace: 1,
            actionType: 'look_window',
            bubbleText: `Góc Boutique Quần Áo & Túi Tote · Ấm cúng cực xinh!`,
          },
          {
            id: 'pine_tree',
            x: 612,
            y: 38,
            w: 32,
            h: 64,
            standX: 626,
            standY: 124,
            standFace: 1,
            actionType: 'jump_joy',
            bubbleText: `Cây thông đèn LED ấm áp · Chúc bạn giữ ví thật tốt!`,
          },
          {
            id: 'window',
            x: 646,
            y: 26,
            w: 36,
            h: 68,
            standX: 662,
            standY: 120,
            standFace: 1,
            actionType: 'look_window',
            bubbleText: `Góc cửa sổ ngắm phố Sài Gòn · Chuỗi ghi ${streakDays || 0} ngày!`,
          },
          {
            id: 'exit_door',
            x: 686,
            y: 28,
            w: 32,
            h: 74,
            standX: 696,
            standY: 112,
            standFace: 1,
            actionType: 'look_window',
            duration: 900,
            fastDash: true,
            bubbleText: `Ra phố Khám phá...`,
          },
        ],
      }),
    [todayBudget, todaySpent, remainingToday, streakDays]
  );

  const htmlContent = useMemo(
    () => `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;user-select:none}
html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#F2D58A;display:flex;align-items:center;justify-content:center}
#chCv{
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
window.onerror = function(msg, src, line) {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'JS_ERROR', msg: String(msg), line: line }));
  }
  return false;
};
</script>
</head>
<body>
<canvas id="chCv" width="180" height="120" role="img" aria-label="Quán cà phê Sài Gòn Mini Workshop 720x176 với Barista pha phin, 3 kệ sách lớn, sofa, góc bán quần áo, cây thông, 3 quạt trần và 10 khách thưởng thức cà phê"></canvas>
<script>
(function(){
'use strict';
var VW = 180, VH = 120, WORLD_W = 720, WORLD_H = 176, PBI = '#2B2118', INK = '#2B2118';
var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var isActive = true;

function notify(type, extra) {
  var msg = JSON.stringify(Object.assign({ type: type }, extra || {}));
  if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
    window.ReactNativeWebView.postMessage(msg);
  } else if (window.parent && window.parent !== window) {
    window.parent.postMessage(msg, '*');
  }
}

function R(x,a,b,w,h,col){x.fillStyle=col;x.fillRect(a|0,b|0,w|0,h|0);}
function E(x,cx,cy,rx,ry,col){
  x.fillStyle=col;
  for(var dy=-ry;dy<=ry;dy++)for(var dx=-rx;dx<=rx;dx++)
    if((dx*dx)/(rx*rx)+(dy*dy)/(ry*ry)<=1)x.fillRect((cx+dx)|0,(cy+dy)|0,1,1);
}

/* SPRITE HEO CON 24×20 CHUẨN 1:1 TAB VƯỜN */
var PAL={p:'#F9B8C4',s:'#EE90A6',n:'#E47494',h:'#FFDCE4',i:'#2B2118',g:'#F4B93B'};
var hp=document.createElement('canvas');hp.width=24;hp.height=20;
var hpx=hp.getContext('2d');hpx.imageSmoothingEnabled=false;
function drawPigSprite(c,o){
  o=o||{};
  var pose=o.pose||'stand', f=o.frame||0, by=pose==='walk'?(f%2?0:1):0;
  var hx=pose==='eat'?1:0, hy=pose==='eat'?3:by;
  var I=PAL.i,P=PAL.p,S=PAL.s,N=PAL.n,H=PAL.h,G=PAL.g;
  if(o.tail){R(c,2,10+by,2,1,I);R(c,1,9+by,1,2,I);R(c,2,8+by,1,1,I);}
  else{R(c,2,11+by,2,1,I);R(c,1,10+by,1,1,I);}
  R(c,4,7+by,14,9,I);R(c,3,8+by,16,7,I);
  R(c,5,8+by,12,7,P);R(c,4,9+by,14,5,P);
  R(c,6,8+by,10,2,H);R(c,5,13+by,12,2,S);
  R(c,9,8+by,4,1,I);R(c,9,9+by,4,1,G);
  R(c,14+hx,3+hy,3,3,I);R(c,15+hx,4+hy,1,1,N);
  R(c,12+hx,4+hy,9,9,I);R(c,11+hx,5+hy,11,7,I);
  R(c,13+hx,5+hy,7,7,P);R(c,12+hx,6+hy,9,5,P);
  R(c,13+hx,5+hy,5,2,H);R(c,13+hx,11+hy,6,1,S);
  R(c,19+hx,7+hy,4,4,I);R(c,20+hx,8+hy,2,2,N);
  R(c,20+hx,8+hy,1,1,I);R(c,21+hx,9+hy,1,1,I);
  if(o.blink){R(c,16+hx,8+hy,2,1,I);}
  else if(o.happy){R(c,16+hx,8+hy,1,1,I);R(c,17+hx,7+hy,1,1,I);R(c,18+hx,8+hy,1,1,I);}
  else{R(c,16+hx,7+hy,2,2,I);R(c,16+hx,7+hy,1,1,'#FFFFFF');}
  R(c,14+hx,10+hy,2,1,'#F27D94');
  var L1=pose==='walk'?(f%2?0:-1):0, L2=pose==='walk'?(f%2?-1:0):0;
  var legs=[[3,PAL.p],[9,PAL.p],[6,PAL.s],[12,PAL.s]];
  [[6,L1,legs[0][1]],[9,L2,legs[1][1]],[13,L2,legs[2][1]],[16,L1,legs[3][1]]].forEach(function(lg){
    R(c,lg[0],15+by+lg[1],2,4,I);R(c,lg[0],15+by+lg[1],1,2,lg[2]);R(c,lg[0],18+by+lg[1],2,1,I);
  });
}

function getSkyPalette(){
  var h=new Date().getHours();
  if(h>=6&&h<16) return {top:'#8BC6FA',bot:'#CCE8FF',city:'#7BA9DF',lamp:false};
  if(h>=16&&h<19) return {top:'#966FA8',bot:'#FBE0A0',city:'#6C548E',lamp:true};
  return {top:'#1F264D',bot:'#3A4278',city:'#232952',lamp:true};
}
var SKY=getSkyPalette();

function pbSteam(x,cx,cy,t,n){
  for(var i=0;i<(n||2);i++){
    var p=((t*1.2+i*0.5)%1), sy=cy-Math.round(p*8), sx=cx+Math.round(Math.sin(t*4+i*2));
    x.save();x.globalAlpha=0.65*(1-p);R(x,sx,sy,1,2,'#FFFBF1');x.restore();
  }
}

${cafeInteriorScript}

var CB={w:VW,h:VH,t:0,last:0,dt:0,run:false,think:false,bg:null,fg:null,me:{hop:0,talk:0},ai:{hop:0,talk:0}};
var hr=(new Date()).getHours();
var curTod=(hr>=19||hr<6)?'night':(hr>=16?'sunset':'day');

function buildSeamlessCafeRoom(){
  var bg=document.createElement('canvas');bg.width=WORLD_W;bg.height=WORLD_H;
  var x=bg.getContext('2d');x.imageSmoothingEnabled=false;
  drawCafeBg(x,WORLD_W,WORLD_H,curTod);
  CB.bg=bg;

  var fg=document.createElement('canvas');fg.width=WORLD_W;fg.height=WORLD_H;
  var fx=fg.getContext('2d');fx.imageSmoothingEnabled=false;
  drawCafeFgTables(fx);
  CB.fg=fg;
}

function drawCafePigs(x, t){
  // 1. Heo AI (xanh) ngồi bên phải bàn trung tâm (x = 224, y = 104)
  var sv={p:PAL.p,s:PAL.s,n:PAL.n,h:PAL.h};
  PAL.p='#BFDDF2';PAL.s='#8FB9DB';PAL.n='#9CC4E2';PAL.h='#EAF6FF';
  var aiSip=(t%7)<1.1 && CB.ai.talk<=0 && !CB.think;
  hpx.clearRect(0,0,24,20);
  drawPigSprite(hpx,{pose:aiSip?'eat':'stand',happy:(CB.ai.talk>0&&(((t*6)|0)%2===0))||CB.ai.hop>0,blink:((t+1.3)%4)<0.15,tail:Math.floor(t*3)%2===1});
  PAL.p=sv.p;PAL.s=sv.s;PAL.n=sv.n;PAL.h=sv.h;
  var hx=1, hy=3+(aiSip?4:0);
  R(hpx,hx+15,hy-1,1,2,PBI);
  var on=CB.think?((t*8)|0)%2===0:true;
  R(hpx,hx+14,hy-3,3,2,on?'#7EC8F0':'#3E7FA6');
  R(hpx,hx+15,hy+4,4,4,PBI);R(hpx,hx+16,hy+5,2,2,'#EAF6FF');
  var aiJy=CB.ai.hop>0?-Math.round(Math.abs(Math.sin(CB.ai.hop*9))*4):0;
  x.save();x.translate(224+24,104+aiJy);x.scale(-1,1);x.drawImage(hp,0,0,24,20,0,0,24,20);x.restore();

  // 2. Chú Heo người dùng (hồng) đi lại tự do trong toàn bộ quán 720×176
  var rm=window.__openRoom?window.__openRoom.state:null;
  var mx=rm?Math.round(rm.x-12):172;
  var my=rm?Math.round(rm.y-20):104;
  var isWalk=rm?rm.walking:false;
  var faceDir=rm?rm.facing:1;
  var sip=rm?(rm.action==='sip_coffee'||rm.action==='eat_snack'):false;
  var meJy=(CB.me.hop>0||(rm&&rm.action==='jump_joy'))?-Math.round(Math.abs(Math.sin((CB.me.hop>0?CB.me.hop:t)*9))*5):0;
  hpx.clearRect(0,0,24,20);
  drawPigSprite(hpx,{pose:isWalk?'walk':(sip?'eat':'stand'),frame:isWalk?(((t*6)|0)%2):0,happy:CB.me.talk>0||CB.me.hop>0||(rm&&rm.action==='jump_joy'),blink:(t%4)<0.15,tail:Math.floor(t*3)%2===1});
  x.save();
  if(faceDir<0){x.translate(mx+24,my+meJy);x.scale(-1,1);x.drawImage(hp,0,0,24,20,0,0,24,20);}
  else x.drawImage(hp,0,0,24,20,mx,my+meJy,24,20);
  x.restore();
}

var cv=document.getElementById('chCv'), X=cv.getContext('2d');
X.imageSmoothingEnabled=false;
var lastCamSent=0, lastAtCenter=true;

function cbDraw(t){
  var rm=window.__openRoom?window.__openRoom.state:null;
  if(window.__openRoom){
    window.__openRoom.step(CB.dt||0.016, performance.now());
    var atCenter=(rm.camX>=68&&rm.camX<=172);
    var nowMs=performance.now();
    if(atCenter!==lastAtCenter&&(nowMs-lastCamSent>150)){
      lastAtCenter=atCenter;lastCamSent=nowMs;
      notify('ROOM_CAM',{atCenter:atCenter});
    }
  }
  var camX=rm?Math.round(rm.camX):112;
  var camY=rm?Math.round(rm.camY):24;

  X.save();
  X.translate(-camX,-camY);
  X.drawImage(CB.bg,0,0);
  drawCafeLiveEffects(X,t,curTod);

  // Y-Sorting giữa Chú Heo & Lớp Bàn Ghế Tiền Cảnh (FG_Y = 148)
  var pigY=rm?rm.y:124;
  if(pigY<148){
    drawCafePigs(X,t);
    X.drawImage(CB.fg,0,0);
  }else{
    X.drawImage(CB.fg,0,0);
    drawCafePigs(X,t);
  }
  X.restore();

  if(window.__openRoom){
    window.__openRoom.drawOverlays(X, performance.now());
  }
  CB.me.hop=Math.max(0,CB.me.hop-CB.dt);CB.ai.hop=Math.max(0,CB.ai.hop-CB.dt);
  CB.me.talk=Math.max(0,CB.me.talk-CB.dt);CB.ai.talk=Math.max(0,CB.ai.talk-CB.dt);
  R(X,0,0,CB.w,1,PBI);R(X,0,CB.h-1,CB.w,1,PBI);
}

function frame(now){
  if(!isActive){CB.run=false;return;}
  var dt=Math.min(0.05,(now-CB.last)/1000);CB.last=now;CB.dt=dt;CB.t+=dt;
  cbDraw(CB.t);requestAnimationFrame(frame);
}

window.__cbSend=function(){
  CB.me.hop=0.5;CB.me.talk=1.2;CB.think=true;
  if(window.__openRoom)window.__openRoom.walkTo(184,124);
  if(reduced)cbDraw(3);
};
window.__cbThink=function(v){CB.think=!!v;};
window.__cbReply=function(dur){CB.think=false;CB.ai.hop=0.5;CB.ai.talk=dur||2.5;if(reduced)cbDraw(3);};
window.__cbSetActive=function(v){isActive=!!v;if(isActive&&!CB.run&&!reduced){CB.run=true;CB.last=performance.now();requestAnimationFrame(frame);}};

window.addEventListener('message',function(ev){
  try{
    var d=JSON.parse(ev.data);
    if(!d)return;
    if(d.type==='CB_SEND')window.__cbSend();
    else if(d.type==='CB_THINK')window.__cbThink(d.val);
    else if(d.type==='CB_REPLY')window.__cbReply(d.dur);
    else if(d.type==='CB_ACTIVE')window.__cbSetActive(d.val);
  }catch(e){}
});

${openRoomScript}

buildSeamlessCafeRoom();
if(reduced){cbDraw(3);}else{CB.run=true;CB.last=performance.now();requestAnimationFrame(frame);}
})();
</script>
</body>
</html>`,
    [openRoomScript, cafeInteriorScript]
  );

  const memoizedSource = useMemo(() => ({ html: htmlContent }), [htmlContent]);

  return (
    <View style={styles.sceneBox}>
      {Platform.OS === 'web' ? (
        <iframe
          ref={iframeRef}
          srcDoc={htmlContent}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Cafe Chat Banner"
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

      {/* BONG BÓNG THOẠI CHỈ HIỆN KHI CAMERA Ở KHU BÀN TRUNG TÂM CÙNG HEO AI (QĐ 203) */}
      {isAtCenterTable && Boolean(latestUserText) && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setExpandMe((v) => !v)}
          style={[styles.bubble, styles.bubbleMe]}
        >
          {expandMe ? (
            <ScrollView style={styles.bubbleScroll} nestedScrollEnabled>
              <Text style={styles.bubbleText}>{latestUserText}</Text>
            </ScrollView>
          ) : (
            <Text style={styles.bubbleText} numberOfLines={3}>
              {latestUserText}
            </Text>
          )}
          <View style={[styles.tail, styles.tailMe]} />
        </TouchableOpacity>
      )}

      {isAtCenterTable && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setExpandAi((v) => !v)}
          style={[styles.bubble, styles.bubbleAi]}
        >
          {isThinking ? (
            <Text style={[styles.bubbleText, styles.typingDots]}>· · ·</Text>
          ) : expandAi ? (
            <ScrollView style={styles.bubbleScroll} nestedScrollEnabled>
              <Text style={styles.bubbleText}>{typedAiText}</Text>
            </ScrollView>
          ) : (
            <Text style={styles.bubbleText} numberOfLines={3}>
              {typedAiText}
            </Text>
          )}
          <View style={[styles.tail, styles.tailAi]} />
        </TouchableOpacity>
      )}

      {Boolean(roomToast) && (
        <View style={styles.roomActionToast} pointerEvents="none">
          <Text style={styles.roomActionToastText} numberOfLines={1}>
            {roomToast}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sceneBox: {
    position: 'relative',
    width: '100%',
    aspectRatio: 144 / 96,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#2B2118',
    overflow: 'hidden',
    backgroundColor: '#F2D58A',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  webContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F2D58A',
  },
  webStyle: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F2D58A',
  },
  bubble: {
    position: 'absolute',
    width: '48%',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 15,
    borderWidth: 2.5,
    borderColor: '#2B2118',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  bubbleMe: {
    left: 8,
    top: 8,
    backgroundColor: '#F9B8C4',
  },
  bubbleAi: {
    right: 8,
    top: 40,
    backgroundColor: '#DCEEFA',
  },
  bubbleScroll: {
    maxHeight: 92,
  },
  bubbleText: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 16,
    color: '#2B2118',
  },
  typingDots: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 2,
  },
  tail: {
    position: 'absolute',
    bottom: -7,
    width: 10,
    height: 10,
    borderRightWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: '#2B2118',
    transform: [{ rotate: '45deg' }],
  },
  tailMe: {
    left: '58%',
    backgroundColor: '#F9B8C4',
  },
  tailAi: {
    right: '28%',
    backgroundColor: '#DCEEFA',
  },
  roomActionToast: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    backgroundColor: '#2B2118',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#F4B93B',
  },
  roomActionToastText: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '800',
    fontSize: 11,
    color: '#FFFBF1',
  },
});
