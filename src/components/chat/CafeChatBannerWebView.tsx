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

  const handleMessage = (event: any) => {
    try {
      const d = JSON.parse(event.nativeEvent.data);
      if (d.type === 'HAPTIC_LIGHT') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
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
  var ox=0,oy=0,pose=o.pose||'stand',eat=pose==='eat';
  var body=eat?[[6,4,15],[7,3,16],[8,3,17],[9,3,17],[10,3,16],[11,4,16],[12,5,15],[13,6,14]]
    :[[4,5,13],[5,4,15],[6,3,16],[7,3,17],[8,3,17],[9,3,17],[10,3,16],[11,4,15],[12,5,14]];
  var earB=eat?[[5,12,13],[6,11,13]]:[[2,11,12],[3,10,13],[4,10,13]];
  var earF=eat?[[5,9,10],[6,8,10]]:[[2,7,9],[3,7,9],[4,7,9]];
  shape(c,earB,PAL.s,ox,oy);
  var legB=[[12,6,7],[13,6,7],[14,6,7]], legF=[[12,12,13],[13,12,13],[14,12,13]];
  shape(c,legB,PAL.s,ox,oy);shape(c,legF,PAL.p,ox,oy);
  shape(c,body,PAL.p,ox,oy);
  R(c,ox+7,oy+6,6,1,PAL.h);R(c,ox+8,oy+5,4,1,PAL.h);
  shape(c,earF,PAL.p,ox,oy);
  R(c,ox+(eat?9:8),oy+3,1,1,PAL.s);
  var hy=oy+(eat?2:0);
  R(c,ox+16,hy+7,2,3,PAL.n);R(c,ox+18,hy+8,1,2,PAL.o);
  if(eat){R(c,ox+14,hy+8,2,1,PAL.k);}
  else if(o.happy){R(c,ox+13,hy+6,2,1,PAL.k);R(c,ox+13,hy+7,1,1,PAL.k);R(c,ox+14,hy+7,1,1,PAL.k);}
  else if(o.blink){R(c,ox+13,hy+7,2,1,PAL.k);}
  else{R(c,ox+13,hy+6,2,2,PAL.k);R(c,ox+13,hy+6,1,1,PAL.w);}
  R(c,ox+12,hy+9,2,1,PAL.s);
  R(c,ox+13,hy+10,2,2,PAL.g);R(c,ox+13,hy+11,1,1,PAL.G);
  R(c,ox+2,oy+7,2,1,PAL.o);R(c,ox+1,oy+8,2,1,PAL.p);
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
  var sip=((t+(who==='ai'?3:0))%7)<1.1 && st.talk<=0 && !(who==='ai'&&CB.think);
  hpx.clearRect(0,0,24,20);
  drawPigSprite(hpx,{pose:sip?'eat':'stand',happy:(st.talk>0&&(((t*6)|0)%2===0))||st.hop>0,blink:((t+(who==='ai'?1.3:0))%4)<0.15});
  PAL.p=sv.p;PAL.s=sv.s;PAL.n=sv.n;PAL.h=sv.h;
  if(who==='ai'){
    R(hpx,16,2,1,2,PBI);
    var on=CB.think?((t*8)|0)%2===0:true;
    R(hpx,15,0,3,2,on?'#7EC8F0':'#3E7FA6');if(on)R(hpx,16,0,1,1,'#FFFFFF');
    R(hpx,16,7,4,1,PBI);R(hpx,16,10,4,1,PBI);R(hpx,16,7,1,4,PBI);R(hpx,19,7,1,4,PBI);R(hpx,14,8,2,1,PBI);
    R(hpx,6,14,2,1,'#4B6FA5');
  }
  var bob=st.talk>0?Math.round(Math.sin(t*12)*0.6):0, jy=st.hop>0?-Math.round(Math.abs(Math.sin(st.hop*9))*5):0, py=CB_PY+jy+bob;
  x.save();
  if(who==='ai'){x.translate(px+24,py);x.scale(-1,1);x.drawImage(hp,0,0,24,20,0,0,24,20);}
  else x.drawImage(hp,0,0,24,20,px,py,24,20);
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

cbStatic();
if(reduced){cbDraw(3);}else{CB.run=true;CB.last=performance.now();requestAnimationFrame(frame);}
})();
</script>
</body>
</html>`,
    []
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
});
