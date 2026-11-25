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

const SafeWebView = WebView as unknown as React.ComponentType<any>;

interface CafeChatBannerWebViewProps {
  latestUserText?: string | null;
  latestAiText?: string;
  isThinking?: boolean;
  active?: boolean;
}

/**
 * Banner Quán Cà Phê Sài Gòn 144×96 Pixelated + Hai Bong Bóng Thoại Thực (PLAN 17)
 * Port 1:1 từ prototype Ví Heo Con 24_11.html (cbStatic, cbWindow, cbPig, cbDraw)
 */
export const CafeChatBannerWebView: React.FC<CafeChatBannerWebViewProps> = ({
  latestUserText = null,
  latestAiText = 'Chào bạn! Hỏi heo về ngân sách hoặc khoản chi vừa ghi nhé.',
  isThinking = false,
  active = true,
}) => {
  const webViewRef = useRef<any>(null);
  const iframeRef = useRef<any>(null);

  const { todayBudget, todaySpent } = useBudgetStore();
  const { streakDays } = useGamificationStore();
  const [roomToast, setRoomToast] = useState<string | null>(null);
  const roomToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Hiệu ứng heo hồng nhảy khi người dùng gửi tin & heo xanh suy nghĩ
  useEffect(() => {
    if (latestUserText && latestUserText !== prevUserRef.current) {
      prevUserRef.current = latestUserText;
      setExpandMe(false);
      sendActionToCanvas('window.__cbSend && window.__cbSend()', { type: 'CB_SEND' });
    }
  }, [latestUserText]);

  useEffect(() => {
    if (isThinking) {
      sendActionToCanvas('window.__cbThink && window.__cbThink(true)', { type: 'CB_THINK', val: true });
    }
  }, [isThinking]);

  // Hiệu ứng gõ chữ (typewriter ~2 ký tự / 28ms) khi Heo AI trả lời mới
  useEffect(() => {
    if (!isThinking && latestAiText) {
      if (latestAiText !== prevAiRef.current) {
        prevAiRef.current = latestAiText;
        setExpandAi(false);
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

  const showRoomToast = (text: string) => {
    setRoomToast(text);
    if (roomToastTimerRef.current) clearTimeout(roomToastTimerRef.current);
    roomToastTimerRef.current = setTimeout(() => setRoomToast(null), 2800);
  };

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onWebMsg = (ev: MessageEvent) => {
      try {
        const d = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
        if (!d) return;
        if (d.type === 'HAPTIC_LIGHT') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        } else if (d.type === 'ROOM_ACTION' && d.text) {
          showRoomToast(String(d.text));
        }
      } catch (_e) {}
    };
    window.addEventListener('message', onWebMsg);
    return () => window.removeEventListener('message', onWebMsg);
  }, []);

  const handleMessage = (event: any) => {
    try {
      const d = JSON.parse(event.nativeEvent.data);
      if (d.type === 'HAPTIC_LIGHT') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } else if (d.type === 'ROOM_ACTION' && d.text) {
        showRoomToast(String(d.text));
      }
    } catch (_e) {}
  };

  const remainingToday = Math.max(0, (todayBudget || 0) - (todaySpent || 0));
  const openRoomScript = useMemo(
    () =>
      buildOpenRoomEngineScript({
        canvasId: 'chCv',
        worldWidth: 144,
        worldHeight: 96,
        viewWidth: 144,
        viewHeight: 96,
        walkBounds: { minX: 16, maxX: 86, minY: 66, maxY: 78 },
        initialX: 40,
        initialY: 68,
        speed: 28,
        hotspots: [
          {
            id: 'counter',
            x: 4,
            y: 36,
            w: 32,
            h: 40,
            standX: 28,
            standY: 70,
            standFace: -1,
            actionType: 'sip_coffee',
            bubbleText: `Hôm nay đã chi ${formatVND(todaySpent || 0)}`,
          },
          {
            id: 'window',
            x: 36,
            y: 12,
            w: 42,
            h: 34,
            standX: 54,
            standY: 68,
            standFace: 1,
            actionType: 'look_window',
            bubbleText: `Chuỗi ghi ${streakDays || 0} ngày liên tiếp!`,
          },
          {
            id: 'ai_table',
            x: 92,
            y: 44,
            w: 38,
            h: 36,
            standX: 84,
            standY: 68,
            standFace: 1,
            actionType: 'jump_joy',
            bubbleText: `Còn lại hôm nay: ${formatVND(remainingToday)}`,
          },
          {
            id: 'menu',
            x: 112,
            y: 12,
            w: 28,
            h: 30,
            standX: 86,
            standY: 66,
            standFace: 1,
            actionType: 'check_ledger',
            bubbleText: `Hạn mức ngày: ${formatVND(todayBudget || 0)}`,
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
<canvas id="chCv" width="144" height="96" role="img" aria-label="Quán cà phê Sài Gòn với hai chú heo nói chuyện"></canvas>
<script>
(function(){
'use strict';
var W = 144, H = 96, PBI = '#2B2118';
var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var isActive = true;

function notify(type) {
  var msg = JSON.stringify({ type: type });
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
function drawFace(c){
  R(c,3,3,10,10,PAL.p);R(c,2,5,12,6,PAL.p);R(c,3,2,3,2,PAL.p);R(c,10,2,3,2,PAL.p);
  R(c,4,3,1,1,PAL.s);R(c,11,3,1,1,PAL.s);
  R(c,5,6,2,2,PAL.k);R(c,9,6,2,2,PAL.k);R(c,5,6,1,1,PAL.w);R(c,9,6,1,1,PAL.w);
  R(c,6,9,4,2,PAL.n);R(c,7,9,1,1,PAL.o);R(c,9,9,1,1,PAL.o);
}

var hp=mk(24,20,function(){}), hpx=hp.getContext('2d');
var CB={w:144,h:96,run:false,last:0,t:0,dt:0.016,bg:null,fg:null,face:null,me:{hop:0,talk:0},ai:{hop:0,talk:0},think:false};
var CB_ME_X=28, CB_AI_X=92, CB_PY=68;

function pbSteam(x,sx,sy,t,n){
  for(var k=0;k<n;k++){
    var ph=(t*0.7+k/n)%1, yy=sy-ph*13, xx=sx+Math.round(Math.sin((t+k)*3)*1.6);
    R(x,xx,Math.round(yy),2,2,'rgba(255,251,241,'+(0.85*(1-ph)).toFixed(2)+')');
  }
}
function pbHeart(x,hx,hy,c){
  R(x,hx,hy,2,1,c);R(x,hx+3,hy,2,1,c);R(x,hx-1,hy+1,7,1,c);R(x,hx,hy+2,5,1,c);R(x,hx+1,hy+3,3,1,c);R(x,hx+2,hy+4,1,1,c);
}

function cbStatic(){
  CB.face=mk(16,16,function(c){R(c,0,0,16,16,'#FBD3DC');drawFace(c);});
  CB.bg=mk(CB.w,CB.h,function(x){
    R(x,0,0,144,96,'#F2D58A');
    R(x,0,0,144,5,'#6B4A2B');for(var i=0;i<144;i+=18)R(x,i,0,2,5,'#4B2B21');R(x,0,5,144,1,PBI);
    var rd=mulberry32(11);for(var i=0;i<16;i++)R(x,(rd()*140)|0,8+((rd()*40)|0),4+((rd()*8)|0),2+((rd()*4)|0),'#E8C26E');
    // chân tường xanh ngọc
    R(x,0,52,144,18,'#5FA89A');R(x,0,52,144,1,PBI);R(x,0,53,144,1,'#8CC9BC');for(var i=0;i<144;i+=12)R(x,i,54,1,16,'#4E9488');
    // gạch bông
    R(x,0,70,144,26,'#F4E7C8');R(x,0,70,144,1,PBI);
    for(var ty=0;ty<3;ty++)for(var tx=0;tx<12;tx++){
      var X0=tx*12,Y0=71+ty*8,col=(tx+ty)%2?'#C0562B':'#5FA89A';
      R(x,X0+5,Y0+1,2,6,col);R(x,X0+3,Y0+3,6,2,col);R(x,X0,Y0,1,8,'#E3D4B0');R(x,X0,Y0,12,1,'#E3D4B0');
    }
    // cửa sổ nhìn ra phố
    R(x,5,15,40,37,PBI);x.clearRect(7,17,36,32);R(x,24,17,2,32,'#8A5A34');R(x,7,33,36,2,'#8A5A34');
    R(x,0,15,5,37,'#3E9A57');R(x,45,15,5,37,'#3E9A57');
    for(var y=17;y<50;y+=3){R(x,0,y,5,1,'#2F7A42');R(x,45,y,5,1,'#2F7A42');}
    R(x,5,15,1,37,PBI);R(x,44,15,1,37,PBI);
    R(x,3,51,44,3,'#8A5A34');R(x,3,51,44,1,'#C49A6E');
    R(x,35,46,7,5,'#C0562B');R(x,35,46,7,1,PBI);
    E(x,38,43,5,4,'#3E7A3A');E(x,41,41,3,3,'#5E9A57');E(x,36,42,3,3,'#5E9A57');
    // biển neon cà phê
    R(x,50,15,16,16,PBI);R(x,51,16,14,14,'#2B1B2E');
    // khung ảnh heo
    R(x,74,13,20,20,PBI);R(x,75,14,18,18,'#E7C76A');x.drawImage(CB.face,76,15);R(x,74,13,20,1,'#FFE9A8');
    // bảng menu viết phấn
    R(x,99,9,40,26,'#8A5A34');R(x,101,11,36,22,'#2B3A2F');
    R(x,104,14,10,1,'#FFFBF1');R(x,104,18,20,1,'#E8E1D0');R(x,104,22,16,1,'#E8E1D0');R(x,104,26,22,1,'#E8E1D0');R(x,104,30,12,1,'#E8E1D0');
    for(var k=0;k<4;k++)R(x,128,18+k*4,6,1,'#F4B93B');
    R(x,126,13,6,4,'#FFFBF1');R(x,132,14,1,2,'#FFFBF1');
    // kệ phin, lọ
    R(x,99,46,40,2,'#8A5A34');
    [[101,'#E0452B'],[109,'#F4B93B'],[117,'#3E9A57']].forEach(function(j){
      R(x,j[0],38,6,8,PBI);R(x,j[0]+1,39,4,6,j[1]);R(x,j[0],37,6,1,PBI);
    });
    R(x,127,36,9,10,PBI);R(x,128,37,7,8,'#B9BDC8');R(x,129,39,5,1,'#8E92A0');R(x,129,42,5,1,'#8E92A0');
    // nón lá và mũ bảo hiểm treo tường
    R(x,128,53,1,2,PBI);for(var r=0;r<7;r++){R(x,129-r-1,54+r,2*r+3,1,r%2?'#E7D3A0':'#D9BE86');}R(x,121,60,17,1,PBI);
    R(x,8,58,1,3,PBI);E(x,9,62,6,4,PBI);E(x,9,62,5,3,'#E0452B');R(x,4,64,11,1,PBI);R(x,6,60,3,1,'#FFF6CF');
    // dây đèn thả
    [[46,9],[69,12],[96,8]].forEach(function(l){R(x,l[0],5,1,l[1],PBI);E(x,l[0],5+l[1]+2,3,3,PBI);E(x,l[0],5+l[1]+2,2,2,'#FFE08A');});
    // ghế nhựa phía sau
    [[8,'#E0452B'],[128,'#4B6FA5']].forEach(function(s){R(x,s[0],76,9,4,PBI);R(x,s[0]+1,76,7,3,s[1]);R(x,s[0]+1,80,1,6,PBI);R(x,s[0]+7,80,1,6,PBI);});
  });
  CB.fg=mk(CB.w,CB.h,function(x){
    x.globalAlpha=0.18;E(x,72,91,16,2,'#000000');x.globalAlpha=1;
    R(x,70,83,4,8,PBI);R(x,71,83,2,8,'#6B4A2B');R(x,62,90,20,2,PBI);R(x,63,90,18,1,'#8A5A34');
    R(x,54,79,36,5,PBI);R(x,55,79,34,3,'#C49A6E');R(x,55,79,34,1,'#E0BE90');
    [58,81].forEach(function(gx){
      R(x,gx,69,7,10,PBI);R(x,gx+1,70,5,8,'#CFEFF6');R(x,gx+1,73,5,5,'#6B4A2B');
      R(x,gx+1,72,5,1,'#F5E6C8');R(x,gx+2,71,1,1,'#FFFFFF');R(x,gx+4,75,1,1,'#8A5A34');R(x,gx+5,65,1,6,'#E0452B');
    });
    R(x,69,74,7,5,PBI);R(x,70,75,5,3,'#6B4A2B');R(x,68,71,9,3,'#B9BDC8');R(x,69,69,7,2,'#D6DAE2');R(x,71,67,3,2,'#B9BDC8');
  });
}

function cbWindow(x,t){
  var WX=7,WY=17,WW=36;
  R(x,WX,WY,WW,18,'#BFE6F6');R(x,WX,WY+18,WW,8,'#FFEBB8');
  var cx=((t*4)%(WW+20))-10;R(x,WX+cx,WY+4,10,3,'#FFFFFF');R(x,WX+cx+3,WY+2,5,3,'#FFFFFF');
  [[0,12,8],[8,18,6],[15,10,7],[22,16,8],[30,13,6]].forEach(function(b){
    R(x,WX+b[0],WY+26-b[1],b[2],b[1],'#9BB5D6');
    for(var yy=WY+26-b[1]+2;yy<WY+24;yy+=4)R(x,WX+b[0]+2,yy,2,2,'#FFFBF1');
  });
  R(x,WX,WY+26,WW,6,'#4A4658');R(x,WX,WY+26,WW,1,'#CFC6B6');
  for(var i=0;i<WW;i+=10)R(x,WX+i,WY+30,5,1,'#F4E7A8');
  [[0,'#E0452B','#4B6FA5'],[17,'#4B6FA5','#F4B93B']].forEach(function(b){
    var bx=WX+WW+8-(((t*20)+b[0]*2)%(WW+24)), by=WY+29;
    E(x,bx,by,2,2,PBI);E(x,bx+9,by,2,2,PBI);R(x,bx-1,by-4,11,3,b[1]);R(x,bx+3,by-9,4,5,b[2]);
    E(x,bx+5,by-11,2,2,'#F2C9A0');R(x,bx+3,by-13,5,2,b[1]);
  });
}

function cbPig(x,px,who,t){
  var st=who==='ai'?CB.ai:CB.me, sv={p:PAL.p,s:PAL.s,n:PAL.n,h:PAL.h};
  if(who==='ai'){PAL.p='#BFDDF2';PAL.s='#8FB9DB';PAL.n='#9CC4E2';PAL.h='#EAF6FF';}
  var rm=(who==='me'&&window.__openRoom)?window.__openRoom.state:null;
  var sip=rm ? (rm.action==='sip_coffee'||rm.action==='eat_snack') : (((t+(who==='ai'?3:0))%7)<1.1 && st.talk<=0 && !(who==='ai'&&CB.think));
  var isWalk=rm ? rm.walking : false;
  var faceDir=rm ? rm.facing : (who==='ai'?-1:1);
  var drawX=rm ? Math.round(rm.x-12) : px;
  var drawY=rm ? Math.round(rm.y-20) : CB_PY;
  hpx.clearRect(0,0,24,20);
  drawPigSprite(hpx,{pose:isWalk?'walk':(sip?'eat':'stand'),frame:isWalk?(((t*6)|0)%2):0,happy:(st.talk>0&&(((t*6)|0)%2===0))||st.hop>0||(rm&&rm.action==='jump_joy'),blink:((t+(who==='ai'?1.3:0))%4)<0.15,tail:Math.floor(t*3)%2===1});
  PAL.p=sv.p;PAL.s=sv.s;PAL.n=sv.n;PAL.h=sv.h;
  if(who==='ai'){
    var headDy=sip?4:0, hx=1, hy=3+headDy;
    R(hpx,hx+15,hy-1,1,2,PBI);
    var on=CB.think?((t*8)|0)%2===0:true;
    R(hpx,hx+14,hy-3,3,2,on?'#7EC8F0':'#3E7FA6');if(on)R(hpx,hx+15,hy-3,1,1,'#FFFFFF');
    R(hpx,hx+15,hy+4,4,1,PBI);R(hpx,hx+15,hy+7,4,1,PBI);R(hpx,hx+15,hy+4,1,4,PBI);R(hpx,hx+18,hy+4,1,4,PBI);R(hpx,hx+13,hy+5,2,1,PBI);
    R(hpx,12,12,2,1,'#4B6FA5');
  }
  var bob=st.talk>0?Math.round(Math.sin(t*12)*0.6):0, jy=(st.hop>0||(rm&&rm.action==='jump_joy'))?-Math.round(Math.abs(Math.sin((st.hop>0?st.hop:t)*9))*5):0, py=drawY+jy+bob;
  x.save();
  if(faceDir<0){x.translate(drawX+24,py);x.scale(-1,1);x.drawImage(hp,0,0,24,20,0,0,24,20);}
  else x.drawImage(hp,0,0,24,20,drawX,py,24,20);
  x.restore();
}

var cv=document.getElementById('chCv'), X=cv.getContext('2d');
X.imageSmoothingEnabled=false;

function cbDraw(t){
  cbWindow(X,t);X.drawImage(CB.bg,0,0);
  // quạt trần
  R(X,70,5,4,3,PBI);var a=t*7;
  for(var k=0;k<4;k++){var an=a+k*Math.PI/2;for(var s=4;s<=13;s++)R(X,72+Math.round(Math.cos(an)*s),9+Math.round(Math.sin(an)*s*0.22),1,1,'#8A5A34');}
  R(X,71,8,3,2,PBI);
  // ánh đèn
  X.globalAlpha=0.16;[[46,16],[69,19],[96,15]].forEach(function(l,i){E(X,l[0],l[1],8+Math.round(Math.sin(t*4+i)),6,'#FFE08A');});X.globalAlpha=1;
  // neon cốc cà phê
  if(((t*2)%9)<8){
    var N='#FF6FA5';R(X,54,21,8,7,N);R(X,55,22,6,5,'#2B1B2E');R(X,62,22,2,4,N);R(X,53,28,10,1,N);R(X,56,17,1,3,N);R(X,59,17,1,3,N);
    X.globalAlpha=0.25;E(X,58,23,9,8,N);X.globalAlpha=1;
  }
  cbPig(X,CB_ME_X,'me',t);cbPig(X,CB_AI_X,'ai',t);
  X.drawImage(CB.fg,0,0);
  if(window.__openRoom){window.__openRoom.step(CB.dt||0.016,performance.now());window.__openRoom.drawOverlays(X,performance.now());}
  pbSteam(X,72,64,t,2);
  var dr=((t*1.6)%1);R(X,72,73+Math.round(dr*2),1,1,'#6B4A2B');
  CB.me.hop=Math.max(0,CB.me.hop-CB.dt);CB.ai.hop=Math.max(0,CB.ai.hop-CB.dt);
  CB.me.talk=Math.max(0,CB.me.talk-CB.dt);CB.ai.talk=Math.max(0,CB.ai.talk-CB.dt);
  if(CB.ai.talk>0&&!CB.think)pbHeart(X,96,60-Math.round(((t*2)%1)*6),'#E0452B');
  R(X,0,0,CB.w,1,PBI);R(X,0,CB.h-1,CB.w,1,PBI);
}

function frame(now){
  if(!isActive){CB.run=false;return;}
  var dt=Math.min(0.05,(now-CB.last)/1000);CB.last=now;CB.dt=dt;CB.t+=dt;
  cbDraw(CB.t);requestAnimationFrame(frame);
}

window.__cbSend=function(){CB.me.hop=0.5;CB.me.talk=1.2;CB.think=true;if(reduced)cbDraw(3);};
window.__cbThink=function(v){CB.think=!!v;};
window.__cbReply=function(dur){CB.think=false;CB.ai.hop=0.5;CB.ai.talk=dur||2.5;if(reduced)cbDraw(3);};
window.__cbSetActive=function(v){isActive=!!v;if(isActive&&!CB.run&&!reduced){CB.run=true;CB.last=performance.now();requestAnimationFrame(frame);}};

cv.addEventListener('pointerdown',function(e){
  var r=cv.getBoundingClientRect(), lx=(e.clientX-r.left)/r.width*CB.w;
  notify('HAPTIC_LIGHT');
  if(lx<72){CB.me.hop=0.5;}else{CB.ai.hop=0.5;}
});

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

cbStatic();
if(reduced){cbDraw(3);}else{CB.run=true;CB.last=performance.now();requestAnimationFrame(frame);}
})();
</script>
</body>
</html>`,
    [openRoomScript]
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

      {/* BONG BÓNG THOẠI NGƯỜI DÙNG (.bnb.me) */}
      {Boolean(latestUserText) && (
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

      {/* BONG BÓNG THOẠI HEO AI (.bnb.ai) */}
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
