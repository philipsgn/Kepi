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
        }, 360);
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
  const openRoomScript = useMemo(
    () =>
      buildOpenRoomEngineScript({
        canvasId: 'chCv',
        worldWidth: 432,
        worldHeight: 128,
        viewWidth: 144,
        viewHeight: 96,
        walkBounds: { minX: 18, maxX: 414, minY: 82, maxY: 120 },
        initialX: 152,
        initialY: 90,
        initialCamX: 104,
        initialCamY: 10,
        speed: 38,
        hotspots: [
          {
            id: 'phin_bar',
            x: 8,
            y: 26,
            w: 96,
            h: 54,
            standX: 56,
            standY: 88,
            standFace: -1,
            actionType: 'sip_coffee',
            bubbleText: `Quầy bar cà phê phin · Đã chi ${formatVND(todaySpent || 0)}`,
          },
          {
            id: 'window',
            x: 138,
            y: 18,
            w: 58,
            h: 42,
            standX: 164,
            standY: 86,
            standFace: 1,
            actionType: 'look_window',
            bubbleText: `Chuỗi ghi ${streakDays || 0} ngày liên tiếp!`,
          },
          {
            id: 'ai_table',
            x: 196,
            y: 52,
            w: 38,
            h: 44,
            standX: 184,
            standY: 92,
            standFace: 1,
            actionType: 'jump_joy',
            bubbleText: `Còn lại hôm nay: ${formatVND(remainingToday)}`,
          },
          {
            id: 'reading_nook',
            x: 244,
            y: 18,
            w: 56,
            h: 62,
            standX: 272,
            standY: 90,
            standFace: 1,
            actionType: 'check_ledger',
            bubbleText: `Góc đọc sách · Hạn mức ${formatVND(todayBudget || 0)}`,
          },
          {
            id: 'pine_tree',
            x: 302,
            y: 20,
            w: 38,
            h: 60,
            standX: 318,
            standY: 92,
            standFace: 1,
            actionType: 'jump_joy',
            bubbleText: `Cây thông ấm áp · Chúc bạn giữ ví thật tốt!`,
          },
          {
            id: 'exit_door',
            x: 356,
            y: 18,
            w: 56,
            h: 66,
            standX: 384,
            standY: 88,
            standFace: 1,
            actionType: 'look_window',
            duration: 900,
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
<canvas id="chCv" width="144" height="96" role="img" aria-label="Quán cà phê Sài Gòn liền mạch 432x128 với quầy bar, bàn Heo AI, góc đọc sách, cây thông và cửa ra phố Khám phá"></canvas>
<script>
(function(){
'use strict';
var VW = 144, VH = 96, WORLD_W = 432, WORLD_H = 128, PBI = '#2B2118';
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

var CB={w:VW,h:VH,t:0,dt:0,last:0,run:false,think:false,me:{hop:0,talk:0},ai:{hop:0,talk:0},bg:null};

/* DỰNG 1 OFFSCREEN CANVAS DUY NHẤT 432×128 (0 VẾT GHÉP) */
function buildSeamlessCafeRoom(){
  var bg=document.createElement('canvas');bg.width=WORLD_W;bg.height=WORLD_H;
  var x=bg.getContext('2d');x.imageSmoothingEnabled=false;

  // 1. TRẦN GỖ & XÀ NGANG LIỀN MẠCH 432px (y: 0..16)
  R(x,0,0,WORLD_W,14,'#8C5832');
  R(x,0,14,WORLD_W,2,PBI);
  for(var bx=0;bx<WORLD_W;bx+=36){R(x,bx,0,4,14,'#6E4223');}

  // 2. TƯỜNG KEM GỖ ẤM LIỀN MẠCH 432px (y: 16..74)
  R(x,0,16,WORLD_W,58,'#F5DFB0');
  for(var wx=0;wx<WORLD_W;wx+=12){R(x,wx,16,1,58,'rgba(160,110,60,0.10)');}
  // Ốp gỗ chân tường (y: 58..78)
  R(x,0,58,WORLD_W,1,PBI);
  R(x,0,59,WORLD_W,15,'#C9965B');
  for(var px=0;px<WORLD_W;px+=10){R(x,px,59,1,15,'#B07D46');}
  R(x,0,74,WORLD_W,4,'#7A4B28');
  R(x,0,77,WORLD_W,1,PBI);

  // 3. SÀN GẠCH BÔNG SÀI GÒN LIỀN MẠCH 432px (y: 78..128)
  for(var gx=0;gx<WORLD_W;gx+=12){
    for(var gy=78;gy<WORLD_H;gy+=12){
      var alt=((gx/12)+(gy/12))%2===0;
      R(x,gx,gy,12,12,alt?'#FBF1DD':'#EFE0C2');
      R(x,gx,gy,12,1,'rgba(130,95,60,0.15)');
      R(x,gx,gy,1,12,'rgba(130,95,60,0.15)');
      // Hoa văn gạch bông Sài Gòn
      var motifCol=alt?'#5AA39B':'#D66B4F';
      R(x,gx+5,gy+4,2,4,motifCol);
      R(x,gx+4,gy+5,4,2,motifCol);
    }
  }

  // ==========================================================
  // KHU 1 (x: 0..112): QUẦY BAR CÀ PHÊ PHIN & TỦ BÁNH MÌ
  // ==========================================================
  // Bảng menu gỗ treo tường
  R(x,12,20,46,18,PBI);R(x,13,21,44,16,'#362820');
  R(x,17,24,26,2,'#F4B93B');R(x,17,28,34,1,'#FFFBF1');R(x,17,31,28,1,'#F9B8C4');R(x,17,34,32,1,'#FFFBF1');
  // Kệ ly & hũ cà phê treo tường
  R(x,64,28,38,3,PBI);R(x,65,29,36,1,'#8C5832');
  [68,78,88].forEach(function(kx,i){R(x,kx,21,6,7,PBI);R(x,kx+1,22,4,5,['#FFFBF1','#E0452B','#5E9A57'][i]);});
  // Quầy bar gỗ lớn
  R(x,6,54,98,28,PBI);R(x,7,55,96,26,'#8C5832');
  for(var qx=14;qx<98;qx+=12){R(x,qx,59,1,22,'#6E4223');}
  R(x,4,52,102,5,PBI);R(x,5,53,100,3,'#D89C5C'); // mặt quầy bar
  // Máy pha espresso & 2 ly cà phê phin nhôm
  R(x,12,40,18,12,PBI);R(x,13,41,16,10,'#CFCFD8');R(x,15,43,6,4,'#4B6FA5');R(x,23,44,4,4,'#E0452B');
  [38,52].forEach(function(fx){
    R(x,fx,46,7,6,PBI);R(x,fx+1,47,5,4,'#FFFBF1');R(x,fx+1,49,5,2,'#6F4E37');
    R(x,fx-1,43,9,3,'#D0D6DC'); // phin nhôm
  });
  // Tủ kính bánh mì & bánh ngọt
  R(x,68,38,32,14,PBI);R(x,69,39,30,12,'#DCEEFA');
  R(x,72,46,9,4,'#D88C4A');R(x,84,46,9,4,'#E59844'); // bánh mì giòn
  R(x,73,41,6,3,'#F9B8C4');R(x,85,41,6,3,'#F4B93B'); // bánh ngọt
  // 2 ghế bar tròn phía trước quầy
  [26,76].forEach(function(sx){
    R(x,sx,80,12,4,PBI);R(x,sx+1,81,10,2,'#D66B4F');
    R(x,sx+4,84,4,8,PBI);R(x,sx+2,90,8,2,PBI);
  });

  // ==========================================================
  // KHU 2 (x: 112..240): BÀN HEO & HEO AI + CỬA SỔ PHỐ SÀI GÒN
  // ==========================================================
  // Khung cửa sổ lớn nhìn ra phố (x: 140..200, y: 20..56)
  R(x,138,18,64,40,PBI);R(x,139,19,62,38,'#4E8C57'); // chớp gỗ xanh Sài Gòn
  R(x,143,22,54,32,PBI);
  // Biển neon cốc cà phê nhỏ bên trái cửa sổ
  R(x,118,24,14,12,PBI);R(x,119,25,12,10,'#2B1B2E');
  R(x,122,28,6,5,'#FF6FA5');R(x,123,29,4,3,'#2B1B2E');R(x,128,29,2,3,'#FF6FA5');
  // Bàn gỗ tròn giữa quán cho Heo & Heo AI
  R(x,162,74,30,6,PBI);R(x,163,75,28,4,'#D89C5C');
  R(x,174,80,6,14,PBI);R(x,169,92,16,3,PBI);
  // Ly cà phê phin & chậu sen đá trên bàn
  R(x,172,68,5,6,PBI);R(x,173,69,3,4,'#FFFBF1');R(x,173,71,3,2,'#6F4E37');
  R(x,182,70,5,4,PBI);R(x,183,71,3,2,'#C94B38');R(x,183,68,3,2,'#5E9A57');

  // ==========================================================
  // KHU 3 (x: 240..344): GÓC ĐỌC SÁCH & CÂY THÔNG TRANG TRÍ
  // ==========================================================
  // Kệ sách gỗ cao nhiều tầng
  R(x,244,20,44,54,PBI);R(x,245,21,42,52,'#8C5832');
  [30,42,54,66].forEach(function(sy){
    R(x,246,sy,40,2,PBI);
    R(x,248,sy-7,5,7,'#E0452B');R(x,254,sy-6,5,6,'#4B6FA5');
    R(x,260,sy-7,6,7,'#5E9A57');R(x,267,sy-6,5,6,'#F4B93B');
    R(x,273,sy-7,5,7,'#F9B8C4');R(x,279,sy-6,5,6,'#8EC9E8');
  });
  // Ghế bành đọc sách ấm cúng & đèn cây vàng
  R(x,250,82,22,14,PBI);R(x,251,83,20,12,'#D66B4F');R(x,253,85,16,6,'#F29A7E');
  R(x,278,44,2,36,PBI);R(x,274,78,10,2,PBI); // thân đèn cây
  R(x,273,36,12,8,PBI);R(x,274,37,10,6,'#FFE08A'); // chao đèn vàng
  // CÂY THÔNG TRANG TRÍ (x: 318, y: 24..76)
  R(x,312,68,12,10,PBI);R(x,313,69,10,8,'#C94B38'); // chậu đỏ
  R(x,316,62,4,6,'#6E4223'); // gốc cây thông
  // 3 tầng tán lá thông xanh đậm-sáng
  [[318,54,15,9],[318,44,12,8],[318,35,9,7],[318,28,5,5]].forEach(function(tr){
    for(var row=0;row<tr[3];row++){
      var hw=Math.round((row/tr[3])*tr[2]);
      R(x,tr[0]-hw-1,tr[1]+row,hw*2+2,1,PBI);
      R(x,tr[0]-hw,tr[1]+row,hw*2,1,row%2===0?'#2E6B3E':'#3F8A50');
    }
  });
  // Ngôi sao vàng đỉnh cây thông
  R(x,316,23,4,4,'#F4B93B');R(x,317,22,2,6,'#FFE08A');

  // ==========================================================
  // KHU 4 (x: 344..432): CỬA KÍNH RA PHỐ KHÁM PHÁ (EXIT DOOR)
  // ==========================================================
  // Biển hiệu RA PHỐ phát sáng phía trên cửa
  R(x,362,19,44,9,PBI);R(x,363,20,42,7,'#5E9A57');
  R(x,367,23,34,2,'#FFFBF1');
  // Cửa kính vòm khung gỗ sang trọng
  R(x,362,30,44,48,PBI);R(x,363,31,42,47,'#8C5832');
  R(x,367,35,16,38,PBI);R(x,368,36,14,36,SKY.bot); // cánh kính trái
  R(x,385,35,16,38,PBI);R(x,386,36,14,36,SKY.bot); // cánh kính phải
  R(x,381,54,2,5,'#F4B93B');R(x,385,54,2,5,'#F4B93B'); // tay nắm vàng
  // Thảm chùi chân & chậu cây cạnh cửa
  R(x,366,80,36,8,PBI);R(x,367,81,34,6,'#C94B38');R(x,371,83,26,2,'#F4B93B');
  R(x,412,64,12,14,PBI);R(x,413,65,10,12,'#C4603A');
  E(x,418,58,7,6,'#3F8A50');E(x,416,56,4,4,'#69AD5A');

  // Đèn thả vàng treo dọc trần quán (cả 4 khu)
  [54, 152, 206, 294, 384].forEach(function(lx){
    R(x,lx,14,1,7,PBI);
    R(x,lx-3,21,7,4,PBI);R(x,lx-2,22,5,2,'#FFE08A');
  });

  CB.bg=bg;
}

function drawWindowLive(x, t){
  // Cửa sổ sống động ở Khu 2 (x: 144..196, y: 23..53)
  var WX=144, WY=23, WW=52, WH=30;
  R(x,WX,WY,WW,16,SKY.top);
  R(x,WX,WY+16,WW,14,SKY.bot);
  // Skyline nhỏ qua cửa sổ
  R(x,WX+4,WY+10,10,14,SKY.city);
  R(x,WX+18,WY+6,12,18,SKY.city);
  R(x,WX+34,WY+12,12,12,SKY.city);
  // Mặt đường & 2 xe máy Sài Gòn chạy qua cửa sổ
  R(x,WX,WY+24,WW,6,'#5A504B');
  [[0,'#E0452B'],[26,'#4B6FA5']].forEach(function(m){
    var mx=WX+WW-((Math.floor(t*18)+m[0])%(WW+14));
    if(mx>=WX&&mx<=WX+WW-6){R(x,mx,WY+24,6,3,m[1]);R(x,mx+1,WY+27,2,2,PBI);R(x,mx+4,WY+27,2,2,PBI);}
  });
  // Thanh chia khung kính
  R(x,WX+26,WY,2,WH,PBI);
  R(x,WX,WY+18,WW,2,PBI);
}

function drawCafePigs(x, t){
  // 1. Heo AI (xanh) ngồi bên phải bàn tròn trung tâm (x = 194, y = 70)
  var sv={p:PAL.p,s:PAL.s,n:PAL.n,h:PAL.h};
  PAL.p='#BFDDF2';PAL.s='#8FB9DB';PAL.n='#9CC4E2';PAL.h='#EAF6FF';
  var aiSip=(t%7)<1.1 && CB.ai.talk<=0 && !CB.think;
  hpx.clearRect(0,0,24,20);
  drawPigSprite(hpx,{pose:aiSip?'eat':'stand',happy:(CB.ai.talk>0&&(((t*6)|0)%2===0))||CB.ai.hop>0,blink:((t+1.3)%4)<0.15,tail:Math.floor(t*3)%2===1});
  PAL.p=sv.p;PAL.s=sv.s;PAL.n=sv.n;PAL.h=sv.h;
  // Kính & ăng-ten Heo AI
  var hx=1, hy=3+(aiSip?4:0);
  R(hpx,hx+15,hy-1,1,2,PBI);
  var on=CB.think?((t*8)|0)%2===0:true;
  R(hpx,hx+14,hy-3,3,2,on?'#7EC8F0':'#3E7FA6');
  R(hpx,hx+15,hy+4,4,4,PBI);R(hpx,hx+16,hy+5,2,2,'#EAF6FF');
  var aiJy=CB.ai.hop>0?-Math.round(Math.abs(Math.sin(CB.ai.hop*9))*4):0;
  x.save();x.translate(194+24,72+aiJy);x.scale(-1,1);x.drawImage(hp,0,0,24,20,0,0,24,20);x.restore();

  // 2. Chú Heo người dùng (hồng) đi lại tự do trong toàn bộ quán 432×128
  var rm=window.__openRoom?window.__openRoom.state:null;
  var mx=rm?Math.round(rm.x-12):140;
  var my=rm?Math.round(rm.y-20):72;
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
    var atCenter=(rm.camX>=66&&rm.camX<=154);
    var nowMs=performance.now();
    if(atCenter!==lastAtCenter&&(nowMs-lastCamSent>150)){
      lastAtCenter=atCenter;lastCamSent=nowMs;
      notify('ROOM_CAM',{atCenter:atCenter});
    }
  }
  var camX=rm?Math.round(rm.camX):104;
  var camY=rm?Math.round(rm.camY):10;

  X.save();
  X.translate(-camX,-camY);

  // 1. Nền Quán Cà Phê Liền Mạch 432×128
  X.drawImage(CB.bg,0,0);

  // 2. Cửa sổ phố sống động (Khu 2)
  drawWindowLive(X,t);

  // 3. Quạt trần 4 cánh quay êm trên bàn trung tâm (x = 176, y = 12)
  R(X,174,8,4,3,PBI);
  var fa=t*6;
  for(var k=0;k<4;k++){
    var an=fa+k*Math.PI/2;
    for(var s=4;s<=14;s++)R(X,176+Math.round(Math.cos(an)*s),12+Math.round(Math.sin(an)*s*0.22),1,1,'#5C3A21');
  }
  R(X,175,11,3,2,PBI);

  // 4. Hơi cà phê phin bốc khói ở Quầy Bar & Bàn trung tâm
  pbSteam(X,41,42,t,2);
  pbSteam(X,55,42,t+0.4,2);
  pbSteam(X,174,66,t+0.8,2);

  // 5. Đèn nhấp nháy trên Cây Thông trang trí (Khu 3: x = 318)
  var blinkOn=((t*3)|0)%2===0;
  [[314,38,'#E0452B'],[322,42,'#F4B93B'],[312,50,'#FFE08A'],[323,53,'#E0452B'],[317,58,'#8EC9E8']].forEach(function(orb,idx){
    var lit=(idx%2===0)?blinkOn:!blinkOn;
    R(X,orb[0],orb[1],2,2,lit?orb[2]:'#2E6B3E');
  });

  // 6. Ánh sáng đèn thả vàng ấm
  X.save();X.globalAlpha=0.14;
  [54,152,206,294,384].forEach(function(lx,i){E(X,lx,26,8+Math.round(Math.sin(t*3+i)),6,'#FFE08A');});
  X.restore();

  // 7. Vẽ Heo AI & Chú Heo người dùng
  drawCafePigs(X,t);

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
  if(window.__openRoom)window.__openRoom.walkTo(152,90);
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
