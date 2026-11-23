import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, useCallback } from 'react';
import { Platform, StyleSheet, View, ViewStyle, StyleProp, useWindowDimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../../theme/ThemeContext';

const SafeWebView = WebView as unknown as React.ComponentType<any>;

export interface PixelGardenWebViewRef {
  feedPig: () => void;
  updateBudget: (spent: number, limit: number) => void;
  triggerReaction: (type: 'happy' | 'sad' | 'feed' | 'warn' | 'celebrate' | 'sleep') => void;
  putPigToSleep: () => void;
}

interface PixelGardenWebViewProps {
  spent: number;
  limit: number;
  streak?: number;
  isActive?: boolean;
  onPigTap?: (quote: string) => void;
  onEnterHouse?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const PixelGardenWebView = forwardRef<
  PixelGardenWebViewRef,
  PixelGardenWebViewProps
>(({ spent, limit, streak = 24, onPigTap, onEnterHouse, style, isActive }, ref) => {
  const { mode } = useTheme();
  const isPink = mode === 'pink';
  const webViewRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  // Guard iOS Fabric offscreen: chỉ mount WebView sau lần đầu tab được active
  // (giống pattern đã áp dụng thành công cho PixelHouseWebView)
  const hasMountedOnce = useRef(false);
  if (isActive) hasMountedOnce.current = true;
  // Lấy chiều rộng màn hình để tính explicit height (tránh canvas collapse trên iOS Fabric offscreen)
  const { width: winWidth } = useWindowDimensions();
  // Tỉ lệ vườn: 176×132 → height = width × (132/176)
  const gardenHeight = Math.round(winWidth * (132 / 176));

  useImperativeHandle(ref, () => ({
    feedPig: () => {
      const code = `if (window.pigFeed) { window.pigFeed(); }`;
      webViewRef.current?.injectJavaScript(code);
    },
    updateBudget: (newSpent: number, newLimit: number) => {
      const code = `if (window.setBudget) { window.setBudget(${newSpent}, ${newLimit}); }`;
      webViewRef.current?.injectJavaScript(code);
    },
    triggerReaction: (type: 'happy' | 'sad' | 'feed' | 'warn' | 'celebrate' | 'sleep') => {
      const code = `if (window.triggerReaction) { window.triggerReaction('${type}'); }`;
      webViewRef.current?.injectJavaScript(code);
    },
    putPigToSleep: () => {
      const code = `if (window.goSleep) { window.goSleep(); }`;
      webViewRef.current?.injectJavaScript(code);
    },
  }));

  // Sync budget/streak live qua injectJavaScript thay vì reload WebView
  useEffect(() => {
    if (!isLoaded) return;
    const code = `if (window.setBudget) { window.setBudget(${spent}, ${limit}); }`;
    webViewRef.current?.injectJavaScript(code);
  }, [spent, limit, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    const code = `if (window.updateStreak) { window.updateStreak(${streak}); }`;
    webViewRef.current?.injectJavaScript(code);
  }, [streak, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    const code = `if (window.setTheme) { window.setTheme('${mode}'); }`;
    webViewRef.current?.injectJavaScript(code);
  }, [mode, isLoaded]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handleWebMsg = (e: any) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if ((data?.type === 'PIG_TAP' || data?.type === 'PIG_TALK') && onPigTap) {
          onPigTap(data.text);
        } else if (data?.type === 'ENTER_HOUSE' && onEnterHouse) {
          onEnterHouse();
        }
      } catch (err) {}
    };
    window.addEventListener('message', handleWebMsg);
    return () => window.removeEventListener('message', handleWebMsg);
  }, [onPigTap, onEnterHouse]);

  // ⚡ useMemo: HTML được tạo 1 lần duy nhất với initial values.
  // Budget/streak updates sau đó được push qua injectJavaScript.
  // Điều này ngăn WebView reload khi parent re-render (fix màn trắng).
  const htmlSource = useMemo(() => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; }
    html, body {
      width: 100%;
      height: 100%;
      background: #86B866;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      touch-action: manipulation;
    }
    .scene {
      position: relative;
      width: 100%;
      height: 100%;
      background: #86B866;
      line-height: 0;
      overflow: hidden;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      image-rendering: pixelated;
      image-rendering: -moz-crisp-edges;
      image-rendering: crisp-edges;
    }
    .bubble {
      position: absolute;
      transform: translate(-50%, -100%);
      background: #FFFBF1;
      border: 3px solid #2B2118;
      border-radius: 14px;
      padding: 4px 10px;
      font: 800 13px/1.25 sans-serif;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity .15s;
      color: #2B2118;
      box-shadow: 0 3px 0 #2B2118;
      z-index: 10;
    }
    .bubble.on { opacity: 1; }
    .bubble::after {
      content: "";
      position: absolute;
      left: 50%;
      bottom: -8px;
      width: 10px;
      height: 10px;
      background: #FFFBF1;
      border-right: 3px solid #2B2118;
      border-bottom: 3px solid #2B2118;
      transform: translateX(-50%) rotate(45deg);
    }
    .scene .tr {
      position: absolute;
      right: 10px;
      top: 10px;
      line-height: 1.2;
      z-index: 5;
    }
    .cam {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #2B2118;
      color: #FFFBF1;
      border: 3px solid #2B2118;
      border-radius: 999px;
      padding: 6px 14px;
      font: 800 13px/1.2 sans-serif;
      box-shadow: 0 3px 0 #2B2118;
    }
    .coin {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #F4B93B;
      box-shadow: inset 0 0 0 2px #B97A14;
    }
    .state {
      position: absolute;
      left: 10px;
      bottom: 10px;
      line-height: 1.2;
      font: 800 12px sans-serif;
      color: #2B2118;
      background: #FFFBF1;
      border: 3px solid #2B2118;
      border-radius: 999px;
      padding: 5px 12px;
      box-shadow: 0 3px 0 #2B2118;
      cursor: default;
      pointer-events: none;
      z-index: 5;
    }
  </style>
</head>
<body>
  <div class="scene" id="scene">
    <canvas id="garden" width="176" height="132"></canvas>
    <div class="bubble" id="bubble"></div>
    <div class="tr">
      <span class="cam"><i class="coin"></i><b id="cam">${streak || 24}</b> cám</span>
    </div>
    <div class="state" id="state" role="status" aria-live="polite">Nắng · sân · đứng ngắm</div>
  </div>

<script>
(function(){
'use strict';
const W=176, H=132;
let LIMIT=${limit || 300000};
let SPENT=${spent || 0};

function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const C={grass1:'#86B866',grass2:'#74A659',grass3:'#9CCB78',wall:'#F2DFA8',wallShade:'#E2C984',roof:'#C4603A',roofDark:'#9E4528',roofLight:'#DC7A4E',
  wood:'#8A5A34',woodDark:'#5E3A20',woodLight:'#B07A48',tileA:'#3F8F95',tileB:'#F7EFDA',tileC:'#E0A93B',water:'#6DB7C9',waterDark:'#4E97AE',
  pad:'#4F9A4F',stone:'#CFC6B0',stoneDark:'#A99F87',trunk:'#6B4426',leaf1:'#4E9A47',leaf2:'#3E8139',leafLight:'#72B95B',
  bamboo:'#D6B66A',bambooDark:'#A98A45',red:'#E0452B',gold:'#F4B93B'};
const PAL={o:'#4B2B21',p:'#F9B8C4',s:'#EE90A6',n:'#F08DA4',h:'#FFE3E8',k:'#2B2118',g:'#F4B93B',G:'#B97A14',w:'#FFFFFF'};
const WINS=[[11,14,22,13],[47,14,22,13],[83,14,22,13],[11,41,22,13],[83,41,22,13]];
const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};
const E=(c,cx,cy,rx,ry,col)=>{c.fillStyle=col;for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++)if(x*x/(rx*rx)+y*y/(ry*ry)<=1)c.fillRect(cx+x,cy+y,1,1)};
function shape(c,rows,fill,ox,oy,outline=true){
  if(outline){c.fillStyle=PAL.o;for(const [ax,ay] of [[-1,0],[1,0],[0,-1],[0,1]])for(const [y,x0,x1] of rows)c.fillRect(ox+x0+ax,oy+y+ay,x1-x0+1,1)}
  c.fillStyle=fill;for(const [y,x0,x1] of rows)c.fillRect(ox+x0,oy+y,x1-x0+1,1);
}
function mk(w,h,fn){const cv=document.createElement('canvas');cv.width=w;cv.height=h;fn(cv.getContext('2d'));return cv}

/* ---------- nền tĩnh ---------- */
const bg=mk(W,H,(c)=>{
  const rand=mulberry32(7);
  R(c,0,0,W,H,C.grass1);
  for(let i=0;i<460;i++)R(c,(rand()*W)|0,(58+rand()*(H-58))|0,rand()<.3?2:1,1,rand()<.55?C.grass2:C.grass3);
  for(let i=0;i<34;i++)R(c,(rand()*W)|0,(64+rand()*(H-64))|0,1,1,rand()<.5?'#FFF4D6':'#F59BB0');
  // vườn xa
  R(c,112,0,64,46,'#8DBF74');
  for(let i=0;i<50;i++)R(c,112+((rand()*64)|0),(rand()*44)|0,3,1,rand()<.5?'#7DB066':'#9CCB82');
  R(c,150,26,6,26,C.trunk);R(c,154,26,2,26,'#4F3019');
  const can=[[140,14,13],[160,12,14],[150,5,11],[170,22,9],[132,24,9],[148,22,10]];
  can.forEach(([x,y,r])=>E(c,x,y,r,r,C.leaf2));
  can.forEach(([x,y,r])=>E(c,x-3,y-3,r-4,r-4,C.leaf1));
  for(let i=0;i<46;i++)R(c,124+((rand()*52)|0),(rand()*30)|0,2,1,C.leafLight);
  [[134,18],[146,12],[160,20],[168,26],[152,14],[142,26]].forEach(([x,y])=>R(c,x,y,2,2,'#F2B23A'));
  // hàng rào tre
  R(c,112,44,64,2,C.woodDark);R(c,112,53,64,2,C.woodDark);
  for(let x=112;x<176;x+=4){const t=40+((x/4)%3)*2;R(c,x,t,3,60-t,C.bamboo);R(c,x+2,t,1,60-t,C.bambooDark);R(c,x,t,3,1,'#EAD08A')}
  R(c,112,60,64,2,'rgba(40,60,20,.25)');
  // ====== NGÔI NHÀ 2 TẦNG CHUẨN PIXEL (THEO PROTOTYPE NHÀ HEO CON) ======
  // nhà phố 2 tầng, 3 gian: khớp 6 phòng bên trong (trên: làm việc | ảnh | ngủ, dưới: bếp | sảnh | khách)
  R(c,0,12,116,51,C.wall);R(c,0,50,116,8,C.wallShade);
  for(let i=0;i<46;i++)R(c,2+((rand()*110)|0),14+((rand()*42)|0),2,1,'#EAD392');
  // mái ngói
  R(c,0,0,116,11,C.roof);
  // Viền tuyết mỏng trên chóp mái ngói đỏ (Không khí Noel)
  R(c,0,0,116,2,'#FFFFFF');
  for(let x=0;x<116;x+=5)R(c,x,2,2,1,'#FFFFFF');
  for(let y=2;y<9;y+=3){R(c,0,y,116,1,C.roofDark);for(let x=(y%2?0:3);x<116;x+=6)R(c,x,y+1,1,2,C.roofDark)}
  for(let x=0;x<116;x+=6)R(c,x,0,3,1,C.roofLight);
  R(c,18,0,8,2,C.roofDark);R(c,0,11,116,2,'rgba(60,35,20,.30)');
  // Tuyết đọng mép mái
  for(let x=2;x<114;x+=7)R(c,x,11,3,1,'#FFFFFF');
  // cột hai bên
  R(c,0,11,3,52,C.wood);R(c,2,11,1,52,C.woodDark);R(c,112,11,4,52,C.wood);R(c,114,11,2,52,C.woodDark);
  // tầng 2: ba cửa sổ, màu kính = màu tường phòng bên trong
  [[11,'#D2E3F2',0],[47,'#E9DCF2',1],[83,'#F8D6DF',2]].forEach(([x,col,k])=>{
    R(c,x-5,13,4,15,'#4E9A6B');R(c,x+23,13,4,15,'#4E9A6B');
    for(let y=15;y<27;y+=3){R(c,x-4,y,2,1,'#3C7F55');R(c,x+24,y,2,1,'#3C7F55')}
    R(c,x-1,13,24,15,C.woodDark);R(c,x,14,22,13,col);
    if(k===0){R(c,x+1,24,20,2,'#B07A48');R(c,x+13,20,6,4,'#2B2118');R(c,x+14,21,4,2,'#7FD4E0')}
    else if(k===1){R(c,x+2,15,5,5,'#F4B93B');R(c,x+9,15,5,5,'#F08DA4');R(c,x+16,15,5,5,'#6DA9D9')}
    else{R(c,x+1,21,20,5,'#8FC1E3');R(c,x+1,19,6,4,'#F9B8C4')}
    R(c,x+10,14,1,13,C.woodDark);R(c,x,20,22,1,C.woodDark);R(c,x+1,14,4,2,'rgba(255,255,255,.55)');
  });
  // ban công
  R(c,3,29,110,2,'#8A5A34');for(let x=4;x<112;x+=3)R(c,x,31,1,3,'#4B2B21');
  R(c,0,33,116,3,'#8A5A34');R(c,0,33,116,1,C.woodLight);R(c,0,36,116,2,'rgba(40,25,10,.22)');
  // tầng 1: bếp và phòng khách ở hai bên cửa
  [[11,'#F6D9C0',0],[83,'#DCEBC9',1]].forEach(([x,col,k])=>{
    R(c,x-5,40,4,16,'#4E9A6B');R(c,x+23,40,4,16,'#4E9A6B');
    for(let y=42;y<54;y+=3){R(c,x-4,y,2,1,'#3C7F55');R(c,x+24,y,2,1,'#3C7F55')}
    R(c,x-1,40,24,16,C.woodDark);R(c,x,41,22,13,col);
    if(k===0){R(c,x+2,43,6,11,'#DDE6EE');R(c,x+10,48,11,6,'#A8754A');R(c,x+13,45,5,3,'#8B8B93')}
    else{R(c,x+3,48,16,6,'#F08DA4');R(c,x+4,45,14,4,'#E86F8B')}
    R(c,x+10,41,1,13,C.woodDark);R(c,x+1,41,4,2,'rgba(255,255,255,.5)');R(c,x-2,55,26,2,C.woodLight);
  });
  // cửa chính (sảnh), mái che nhỏ, đèn lồng
  R(c,45,35,27,3,C.roof);R(c,45,38,27,1,'rgba(60,35,20,.3)');
  // Tuyết mỏng mái hiên cửa chính
  R(c,45,35,27,1,'#FFFFFF');
  R(c,47,38,22,21,C.woodDark);R(c,49,40,9,18,C.wood);R(c,59,40,9,18,C.wood);R(c,58,40,1,18,C.woodDark);
  for(let y=45;y<57;y+=3){R(c,49,y,9,1,'#6B4426');R(c,59,y,9,1,'#6B4426')}
  R(c,51,42,5,6,'#BFE3E8');R(c,61,42,5,6,'#BFE3E8');R(c,56,50,1,2,C.gold);R(c,60,50,1,2,C.gold);
  R(c,74,37,1,2,C.woodDark);R(c,72,39,5,6,C.red);R(c,73,38,3,1,C.gold);R(c,73,45,3,1,C.gold);R(c,74,46,1,2,C.gold);
  // Vòng hoa nguyệt quế Noel treo trên cửa chính
  E(c,58,37,4,4,'#2D5A27');E(c,58,37,2,2,'#4E9A47');R(c,57,36,2,2,'#E0452B');R(c,58,35,1,1,'#F4B93B');
  // Chậu cây thông Noel mini bên hiên nhà (Góc trái x: 38..48, y: 44..58)
  R(c,38,52,8,6,'#8A5A34');R(c,37,51,10,1,'#B07A48'); // Chậu gỗ
  E(c,42,48,6,4,'#1E4D2B');E(c,42,47,5,3,'#2D5A27'); // Tầng tán 1
  E(c,42,43,4,3,'#2D5A27');E(c,42,42,3,2,'#3E8139'); // Tầng tán 2
  E(c,42,39,2,2,'#3E8139'); // Đỉnh thông
  R(c,41,37,3,2,'#F4B93B');R(c,42,36,1,3,'#FFE08A'); // Ngôi sao vàng
  R(c,40,46,2,2,'#E0452B');R(c,44,44,2,2,'#F4B93B');R(c,41,43,1,1,'#60A5FA'); // Hạt châu Noel
  // Chậu cây cam bên phải cửa
  R(c,70,51,7,7,'#C97248');E(c,73,48,4,4,C.leaf2);E(c,75,47,3,3,C.leafLight);
  // nền hiên gạch, bậc thềm, đá lót tới sân
  R(c,0,58,116,5,'#D9A878');for(let x=0;x<116;x+=9)R(c,x,58,1,5,'#C48F63');
  R(c,0,58,116,1,C.woodLight);R(c,0,63,116,2,'#A87650');R(c,0,65,116,2,'rgba(40,30,10,.18)');
  R(c,46,62,24,3,'#CFC6B0');E(c,56,67,4,2,C.stone);E(c,62,69,4,2,C.stone);
  // sân gạch hoa
  const px0=20,py0=72;
  R(c,px0-2,py0-2,76,34,'#B9AE92');
  for(let ty=0;ty<5;ty++)for(let tx=0;tx<12;tx++){
    const x=px0+tx*6,y=py0+ty*6;R(c,x,y,6,6,C.tileB);
    [[2,1],[3,1],[1,2],[4,2],[1,3],[4,3],[2,4],[3,4]].forEach(([a,b])=>R(c,x+a,y+b,1,1,C.tileA));
    [[2,2],[3,2],[2,3],[3,3]].forEach(([a,b])=>R(c,x+a,y+b,1,1,C.tileC));
  }
  R(c,px0-2,py0+32,76,2,'#8E846C');
  // đá lót lối đi
  [[98,94],[104,100]].forEach(([x,y])=>{E(c,x,y+1,4,2,C.stoneDark);E(c,x,y,4,2,C.stone)});
  // ao sen
  E(c,136,106,27,12,C.stoneDark);E(c,136,105,26,11,C.stone);E(c,136,106,23,9,C.waterDark);E(c,136,106,22,8,C.water);
  R(c,126,104,5,1,'#A5D8E4');R(c,142,108,6,1,'#A5D8E4');R(c,132,110,4,1,'#A5D8E4');
  [[128,104],[142,109],[138,101]].forEach(([x,y])=>{E(c,x,y,4,2,C.pad);R(c,x+1,y,3,1,C.water);R(c,x-3,y-1,2,1,'#6DB86D')});
  R(c,143,105,4,2,'#F59BB0');R(c,144,104,2,1,'#FFD1DC');R(c,144,106,2,1,'#E27C96');
  // bát cám
  E(c,78,113,7,3,'#1F4F7A');E(c,78,112,7,3,'#2F6FA8');E(c,78,112,5,2,'#F0C77A');R(c,75,111,3,1,'#FBE3A8');
});

const bananaSpr=mk(44,60,(c)=>{
  R(c,20,26,5,32,'#8FB85C');R(c,23,26,2,32,'#6E9A44');[32,40,48].forEach(y=>R(c,20,y,5,1,'#5F8A3C'));
  E(c,22,58,7,2,'#6B8F44');
  E(c,10,20,10,3,'#5DA64A');E(c,33,18,10,3,'#4E9A47');E(c,13,28,8,2,'#4E9A47');E(c,31,27,8,2,'#5DA64A');E(c,22,12,6,5,'#6DB85A');
  R(c,0,20,20,1,'#3C7F39');R(c,23,18,20,1,'#3C7F39');R(c,5,28,16,1,'#3C7F39');R(c,23,27,16,1,'#3C7F39');R(c,22,7,1,10,'#3C7F39');
});
const stoolSpr=mk(14,16,(c)=>{
  R(c,1,0,12,3,C.red);R(c,2,0,10,1,'#F27A63');R(c,0,3,14,1,'#B93220');
  R(c,2,4,2,12,'#C93A25');R(c,10,4,2,12,'#C93A25');R(c,3,10,8,1,'#B93220');
});
const fg=mk(W,H,(c)=>{
  const rand=mulberry32(21);
  const d=[[8,128,11],[22,130,10],[34,132,8]];
  d.forEach(([x,y,r])=>E(c,x,y,r,r,'#4E9A47'));
  [[5,123,7],[18,125,6],[30,127,5]].forEach(([x,y,r])=>E(c,x,y,r,r,'#6DB85A'));
  let n=0;while(n<18){const x=(rand()*40)|0,y=118+((rand()*14)|0);
    if(d.some(([cx,cy,r])=>(x-cx)**2+(y-cy)**2<r*r)){R(c,x,y,2,2,'#E8548C');n++}}
  for(let x=150;x<176;x+=2)R(c,x,124+((rand()*4)|0),1,8,rand()<.5?C.grass2:C.grass3);
  [[154,123],[163,121],[170,125]].forEach(([x,y])=>R(c,x,y,2,2,rand()<.5?'#FFF4D6':'#F4B93B'));
});

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

const HEART=[[0,1,0,1,0],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0]];
function heart(c,x,y,col){c.fillStyle=col;HEART.forEach((r,j)=>r.forEach((v,i)=>{if(v)c.fillRect(x+i,y+j,1,1)}))}
function zGlyph(c,x,y){[[0,0],[1,0],[2,0],[1,1],[0,2],[1,2],[2,2]].forEach(([a,b])=>{c.fillStyle='rgba(43,33,24,.5)';c.fillRect(x+a+1,y+b+1,1,1);c.fillStyle='#fff';c.fillRect(x+a,y+b,1,1)})}

const garden=document.getElementById('garden'),ctx=garden.getContext('2d');
const pc=document.createElement('canvas');pc.width=24;pc.height=20;const pcx=pc.getContext('2d');
// Nâng giới hạn MINX = 30 để heo không chạm vào mép tán chuối bên trái khi ngủ (Chống đè cỏ)
const MINX=30,MAXX=164,MINY=78,MAXY=118;
const pig={x:88,y:98,face:1,mode:'idle',t:0,dur:2,tx:0,ty:0,frame:0,ft:0,after:null,jump:0};
const blocked=(x,y)=>{const dx=(x-136)/31,dy=(y-106)/13;return dx*dx+dy*dy<1};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));

// Tự động thay đổi thời gian theo giờ thực tế (Không cho bấm đổi thủ công)
function getAutoTOD(){
  const h=new Date().getHours();
  return (h>=6 && h<17) ? 'day' : (h>=17 && h<19) ? 'dusk' : 'night';
}
let tod=getAutoTOD();
const TOD={day:{label:'Nắng',tint:null},dusk:{label:'Chiều',tint:'rgba(255,140,60,.20)'},night:{label:'Đêm',tint:'rgba(20,30,90,.44)'}};
const fish=[{a:0,s:.7,rx:14,ry:5},{a:3,s:-.5,rx:10,ry:3}];
const flies=Array.from({length:9},(_,i)=>({x:20+((i*37)%140),y:70+((i*23)%50),p:i*1.7}));

// Tự động kiểm tra cập nhật cảnh trời mỗi 30s
setInterval(()=>{
  const nextTod=getAutoTOD();
  if(nextTod!==tod){
    tod=nextTod;
    updateLabel();
  }
}, 30000);

const MODETXT={idle:'đứng ngắm',walk:'đi dạo',sleep:'ngủ',eat:'ăn cám',happy:'vui'};
function updateLabel(){
  const s=document.getElementById('state');if(!s)return;
  const tn={day:'Nắng',dusk:'Chiều',night:'Đêm'}[tod]||'Nắng';
  const mn=MODETXT[pig.mode]||'đứng ngắm';
  s.textContent=tn+' · sân · '+mn;
}

function setMode(m,dur,after){pig.mode=m;pig.t=0;pig.dur=dur||0;pig.after=after||null;updateLabel()}
function walkTo(x,y,after){pig.tx=x;pig.ty=y;pig.after=after||null;pig.mode='walk';pig.t=0}
function pickTarget(){for(let i=0;i<20;i++){const x=MINX+Math.random()*(MAXX-MINX),y=MINY+Math.random()*(MAXY-MINY);
  if(!blocked(x,y)&&Math.hypot(x-pig.x,y-pig.y)>18)return{x,y}}return null}

const bubble=document.getElementById('bubble');let bubbleUntil=0;
let apples = []; // Chùm 3 quả táo rơi [{ x, y, targetY }]
let treeShake = 0; // Thời gian rung lá cây
let pondSplash = 0; // Thời gian cá quẫy sóng nước
let lastPigTapTime = 0, pigTapCount = 0; // Đếm số lần gãi bụng
let watering = null; // { x, y, targetX, targetY, t, dur }
let fishFood = []; // [{ x, y, eaten: false }]
let sparkles = []; // [{ x, y, life, maxLife, col }]

function addSparkle(x, y, col) {
  sparkles.push({
    x: x + (Math.random()*10 - 5),
    y: y + (Math.random()*10 - 5),
    life: 0,
    maxLife: 0.8 + Math.random()*0.4,
    col: col || '#FFE08A'
  });
}

function drawWaterCan(c, x, y) {
  R(c, x, y, 6, 5, '#94A3B8');
  R(c, x+1, y+1, 4, 3, '#CBD5E1');
  R(c, x-2, y+1, 2, 4, '#64748B');
  R(c, x-1, y, 2, 1, '#64748B');
  R(c, x+6, y+3, 3, 2, '#64748B');
  R(c, x+9, y+4, 1, 3, '#94A3B8');
  for(let i=0; i<3; i++){
    const dropX = x + 10 + i * 2 + Math.random()*2;
    const dropY = y + 7 + i * 3 + Math.random()*3;
    R(c, Math.round(dropX), Math.round(dropY), 1, 2, '#93C5FD');
  }
}

function say(t,ms){
  bubble.textContent=t;
  bubble.classList.add('on');
  bubbleUntil=performance.now()+(ms||1800);
  try {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PIG_TALK', text: t }));
    }
  } catch(e){}
}
function placeBubble(){
  if(performance.now()>bubbleUntil){bubble.classList.remove('on');return}
  bubble.style.left=clamp(pig.x/W*100,22,78)+'%';
  bubble.style.top=Math.max(16,(pig.y-26-pig.jump)/H*100)+'%';
}

function update(dt){
  pig.t+=dt;pig.ft+=dt;
  if(treeShake > 0) treeShake = Math.max(0, treeShake - dt);
  if(apples.length > 0){
    apples.forEach(a => {
      if(a.y < a.targetY) a.y = Math.min(a.targetY, a.y + dt * 110);
    });
  }
  if(pondSplash > 0){
    pondSplash = Math.max(0, pondSplash - dt);
  }
  if(watering){
    watering.t += dt;
    if(Math.random() < 0.35){
      addSparkle(watering.targetX, watering.targetY, '#FFE08A');
    }
    if(watering.t >= watering.dur){
      watering = null;
    }
  }
  for(let i = sparkles.length - 1; i >= 0; i--){
    sparkles[i].life += dt;
    if(sparkles[i].life >= sparkles[i].maxLife){
      sparkles.splice(i, 1);
    }
  }
  const sad=SPENT>LIMIT;
  if(pig.mode==='idle'){
    if(pig.t>pig.dur){
      const r=Math.random();
      if(r<.68){const tg=pickTarget();if(tg){walkTo(tg.x,tg.y);return}}
      else if(r<.82){setMode('sleep',5+Math.random()*4);return}
      pig.t=0;pig.dur=1.5+Math.random()*2.5;
    }
  }else if(pig.mode==='walk'){
    const dx=pig.tx-pig.x,dy=pig.ty-pig.y,d=Math.hypot(dx,dy);
    if(d<1.2){const a=pig.after;pig.after=null;if(a)a();else setMode('idle',1.5+Math.random()*2.5);return}
    const step=Math.min(d,(sad?15:24)*dt);let nx=pig.x+dx/d*step,ny=pig.y+dy/d*step;
    if(blocked(nx,ny)){if(!blocked(nx,pig.y))ny=pig.y;else if(!blocked(pig.x,ny))nx=pig.x;else{setMode('idle',1);return}}
    if(Math.abs(dx)>.5)pig.face=dx>0?1:-1;
    pig.x=nx;pig.y=ny;if(pig.ft>.2){pig.ft=0;pig.frame^=1}
  }else if(pig.t>pig.dur){const a=pig.after;pig.after=null;if(a)a();else setMode('idle',1.5)}
}

function drawPig(t){
  const m=pig.mode,sad=SPENT>LIMIT,happy=m==='happy',tickle=m==='tickle';
  pig.jump=happy?Math.abs(Math.sin(pig.t*9))*5:0;
  // Reset HOÀN TOÀN canvas pig sprite buffer trước mỗi frame
  // Fix: pcx.setTransform reset triệt để tích lũy scale(-1,1) từ face flip
  pcx.setTransform(1,0,0,1,0,0);
  pcx.clearRect(0,0,24,20);
  drawPigSprite(pcx,{pose:m==='walk'?'walk':m==='sleep'?'sleep':m==='eat'?'eat':'stand',frame:pig.frame,
    mood:sad?'sad':'ok',happy:happy||tickle,blink:(t%3.2)<.12,tail:Math.floor(t*3)%2===1});
  const sw=Math.round(8-pig.jump*.6);
  ctx.fillStyle='rgba(30,50,20,.22)';
  ctx.fillRect(Math.round(pig.x)-sw,Math.round(pig.y)-1,sw*2,2);ctx.fillRect(Math.round(pig.x)-sw+2,Math.round(pig.y)+1,sw*2-4,1);
  const y=Math.round(pig.y-18-pig.jump);
  ctx.save();
  if(tickle){
    ctx.translate(Math.round(pig.x), y + 10);
    ctx.rotate(Math.sin(t * 14) * 0.35 + Math.PI); // Ngửa bụng cười ngoe nguẩy
    ctx.drawImage(pc, -12, -10);
  } else if(pig.face<0){
    ctx.translate(Math.round(pig.x+11),y);ctx.scale(-1,1);ctx.drawImage(pc,0,0);
  } else {
    ctx.drawImage(pc,Math.round(pig.x-11),y);
  }
  ctx.restore();
  if(tickle){
    R(ctx, Math.round(pig.x + Math.sin(t*10)*8), Math.round(pig.y - 24), 2, 2, '#60A5FA');
  }
  if(m==='sleep')for(let i=0;i<3;i++){const p=(t*.8+i/3)%1;ctx.globalAlpha=1-p;zGlyph(ctx,Math.round(pig.x+10+p*8),Math.round(pig.y-20-p*12));ctx.globalAlpha=1}
  if(happy){const p=Math.min(1,pig.t/pig.dur);ctx.globalAlpha=1-p*.6;heart(ctx,Math.round(pig.x+2),Math.round(pig.y-28-p*6),'#E0452B');ctx.globalAlpha=1}
}

function drawDoor(c){
  if(doorOpen<=0)return;
  R(c,49,40,18,18,'#2B1A10');R(c,51,43,14,15,'#F7D58A');R(c,51,43,14,4,'#FBE7B0');R(c,46,39,4,20,'#5E3A20');
}

function draw(t){
  // 1. Reset ma trận biến đổi cọ vẽ & xóa màn hình (Fix triệt để lỗi biến dạng vạch pixel kéo dài ở Ảnh 1)
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; // Đảm bảo alpha reset hoàn toàn mỗi frame (guard nếu frame trước bị crash giữa chừng)
  ctx.clearRect(0, 0, W, H);

  ctx.drawImage(bg,0,0);
  if(doorOpen > 0) drawDoor(ctx);

  // Chuỗi đèn LED Noel nhấp nháy 4 màu dọc dầm ban công tầng 2 (y: 35)
  const ledCols=['#E0452B','#F4B93B','#5E9A57','#60A5FA'];
  for(let i=0;i<18;i++){
    const col=ledCols[(i+Math.floor(t*3))%ledCols.length];
    R(ctx,6+i*6,34,2,2,col);
  }

  // Cá bơi và ăn mồi
  const hasFood = fishFood.some(f => !f.eaten);
  fish.forEach(f => {
    f.a += f.s * (hasFood ? 0.045 : 0.016);
    const fx = Math.round(136 + Math.cos(f.a) * f.rx), fy = Math.round(106 + Math.sin(f.a) * f.ry);
    const dir = Math.sign(-Math.sin(f.a) * f.s) || 1;
    R(ctx, fx, fy, 3, 2, '#F2872B');
    R(ctx, dir > 0 ? fx - 1 : fx + 3, fy, 1, 1, '#FFD1A8');

    if(hasFood){
      fishFood.forEach(food => {
        if(!food.eaten && Math.hypot(fx - food.x, fy - food.y) < 6){
          food.eaten = true;
          addSparkle(food.x, food.y, '#E0F2FE');
        }
      });
      if(fishFood.every(food => food.eaten)){
        fishFood = [];
        pondSplash = 1.8;
        say('Cá ăn no rồi, cảm ơn nha! 🐟✨', 1600);
      }
    }
  });

  // Vẽ các mẩu cám nổi trên mặt ao
  fishFood.forEach(food => {
    if(!food.eaten){
      const bob = Math.sin(t * 6 + food.x) * 0.8;
      R(ctx, Math.round(food.x), Math.round(food.y + bob), 2, 2, '#FFF4D6');
      R(ctx, Math.round(food.x) + 1, Math.round(food.y + bob), 1, 1, '#F4B93B');
    }
  });

  // Sắp xếp chiều sâu (Y-sorting): Đưa fg vào danh sách vẽ theo chiều sâu pig.y
  // Khi heo ngủ hoặc đi dạo (y < 124), thân heo luôn nổi hoàn toàn trên lớp cỏ fg
  [{b:86,f:()=>ctx.drawImage(stoolSpr,96,70)},
   {b:106,f:()=>ctx.drawImage(bananaSpr,-4,48)},
   {b:pig.y,f:()=>drawPig(t)},
   {b:126,f:()=>ctx.drawImage(fg,0,0)}]
    .sort((a,b)=>a.b-b.b).forEach(i=>i.f());

  if(apples.length > 0){
    apples.forEach(a => {
      if(!a.eaten){
        const ax=Math.round(a.x),ay=Math.round(a.y);
        ctx.fillStyle='rgba(30,50,20,.22)';
        ctx.fillRect(ax-1,Math.round(a.targetY)+3,6,2);
        R(ctx,ax,ay,4,4,'#E0452B');
        R(ctx,ax+1,ay+1,1,1,'#FFAAA5');
        R(ctx,ax+1,ay-1,1,1,'#6E9A44');
      }
    });
  }
  if(pondSplash > 0){
    const phase = (1.8 - pondSplash) * 8;
    ctx.strokeStyle = '#93C5FD';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(136, 106, Math.min(22, 10 + phase * 2), Math.min(12, 5 + phase), 0, 0, Math.PI * 2);
    ctx.stroke();
    const fishH = Math.sin(pondSplash * 3.5) * 12;
    if(fishH > 0){
      R(ctx, 136, Math.round(106 - fishH), 4, 3, '#F4B93B');
      R(ctx, 138, Math.round(105 - fishH), 2, 1, '#FFF');
      R(ctx, 134, Math.round(107 - fishH), 2, 2, '#E0452B');
    }
  }

  // Vẽ sparkles lấp lánh
  sparkles.forEach(s => {
    const alpha = 1 - (s.life / s.maxLife);
    if(alpha > 0){
      ctx.globalAlpha = alpha;
      R(ctx, Math.round(s.x), Math.round(s.y), 2, 2, s.col);
      R(ctx, Math.round(s.x)+1, Math.round(s.y)-1, 1, 1, '#FFF');
      R(ctx, Math.round(s.x)-1, Math.round(s.y)+1, 1, 1, '#FFF');
      ctx.globalAlpha = 1;
    }
  });

  // Vẽ bình tưới nước
  if(watering){
    drawWaterCan(ctx, watering.x, watering.y);
  }

  const T=TOD[tod];
  if(T.tint){R(ctx,0,0,W,H,T.tint)}
  if(tod==='night'){
    WINS.forEach(([x,y,w,h])=>{R(ctx,x,y,w,h,'#FFE08A');R(ctx,x+10,y,1,h,C.woodDark);R(ctx,x,y+((h/2)|0),w,1,C.woodDark)});
    R(ctx,51,42,5,6,'#FFE08A');R(ctx,61,42,5,6,'#FFE08A');
    E(ctx,74,42,7,7,'rgba(255,200,90,.28)');
    flies.forEach(f=>{if(Math.sin(f.p+t*2)>.2)R(ctx,Math.round(f.x+Math.sin(t+f.p)*4),Math.round(f.y+Math.cos(t*.8+f.p)*3),2,2,'#FFF08A')});
  } else if(tod==='dusk'){
    WINS.forEach(([x,y,w,h])=>E(ctx,x+11,y+6,7,4,'rgba(255,210,90,.25)'));
    E(ctx,74,42,4,4,'rgba(255,200,80,.20)');
  }
}

// Window Bridge API
window.pigFeed = function() {
  say('Có cám! Heo chạy liền', 1300);
  walkTo(66, 116, () => {
    pig.face = 1;
    setMode('eat', 3, () => {
      say('Ngon quá, cảm ơn nha!', 1800);
      setMode('happy', 1.4);
    });
  });
};

window.setBudget = function(s, l) {
  const wasOver = SPENT > LIMIT;
  SPENT = s;
  LIMIT = l;
  if (SPENT > LIMIT && !wasOver) {
    say('Ối, lố hạn mức rồi! 🥺', 2200);
    setMode('sad', 4);
  } else if (SPENT <= LIMIT && wasOver) {
    say('Hạn mức an toàn rồi! ✨', 1800);
    setMode('happy', 2);
  }
};

window.triggerReaction = function(type) {
  if (type === 'happy' || type === 'celebrate') {
    say('Ủn ỉn! Tuyệt vời quá nha! ✨', 1800);
    setMode('happy', 2.5);
  } else if (type === 'sad') {
    say('Hu hu, heo hơi buồn... 🥺', 2000);
    setMode('sad', 3);
  } else if (type === 'warn') {
    say('Ối, cẩn thận hạn mức nha! ⚠️', 2000);
    setMode('sad', 2.5);
  } else if (type === 'feed') {
    if (window.pigFeed) window.pigFeed();
  } else if (type === 'sleep') {
    if (window.goSleep) window.goSleep();
  }
};

window.goSleep = function() {
  say('Heo vào chuồng ngủ đây', 1500);
  setMode('sleep', 8);
};

let entering = false, doorOpen = 0;
function enterHouse() {
  if (entering) return;
  entering = true;

  // Bước 1: Heo reo "Vào nhà thôi! 🏠"
  say('Vào nhà thôi!', 1400);

  // Bước 2: Heo bước thẳng lên thềm đá trước hiên nhà
  walkTo(58, 54, () => {
    // Bước 3: Cửa trượt mở hé lộ ánh sáng ấm áp
    doorOpen = 1;
    pig.face = -1;

    // Bước 4: Heo bước qua ngưỡng cửa vào trong nhà
    setTimeout(() => {
      walkTo(58, 44, () => {
        setTimeout(() => {
          try {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ENTER_HOUSE' }));
            } else if (window.parent) {
              window.parent.postMessage(JSON.stringify({ type: 'ENTER_HOUSE' }), '*');
            }
          } catch(e) {}
          setTimeout(() => {
            doorOpen = 0;
            entering = false;
          }, 1200);
        }, 250);
      });
    }, 200);
  });
}
window.enterHouse = enterHouse;

// API cập nhật streak từ React Native mà không reload WebView
window.updateStreak = function(newStreak) {
  const camEl = document.getElementById('cam');
  if (camEl) camEl.textContent = newStreak;
};

updateLabel();

garden.addEventListener('pointerdown', e => {
  const r = garden.getBoundingClientRect(),
        x = (e.clientX - r.left) / r.width * W,
        y = (e.clientY - r.top) / r.height * H;

  // 0. Chạm trực tiếp vào Cánh cửa chính của ngôi nhà (x: 44..74, y: 34..64) -> Cửa mở ra và heo đi vào
  if(x >= 44 && x <= 74 && y >= 34 && y <= 64) {
    enterHouse();
    return;
  }

  // 1. Chạm vào Tán Cây Táo hoặc Thân Cây (Rung rụng táo)
  if(x >= 108 && x <= 176 && y <= 66) {
    if (apples.some(a => !a.eaten)) {
      say('Heo đang nhắm chùm táo kìa!', 1400);
      return;
    }
    say('Rung cây táo nè! 🍎', 1200);
    treeShake = 0.5;
    apples = [
      { x: 136, y: 22, targetY: 76, eaten: false },
      { x: 146, y: 16, targetY: 82, eaten: false },
      { x: 158, y: 24, targetY: 78, eaten: false }
    ];
    setTimeout(() => {
      say('A, có táo rơi kìa!', 1400);
      walkTo(140, 82, () => {
        pig.face = 1;
        setMode('eat', 3.2, () => {
          apples = [];
          say('Táo ngọt giòn rụm luôn 🍎!', 1800);
          setMode('happy', 1.6);
        });
        setTimeout(() => { if(apples[0]) apples[0].eaten = true; }, 800);
        setTimeout(() => { if(apples[1]) apples[1].eaten = true; }, 1600);
        setTimeout(() => { if(apples[2]) apples[2].eaten = true; }, 2400);
      });
    }, 400);
    return;
  }

  // 2. Chạm vào Cây Thông Noel trên hiên (Merry Christmas)
  if(x >= 38 && x <= 58 && y >= 32 && y <= 62) {
    say('Giáng Sinh an lành nha! 🎄✨', 1600);
    for(let i=0; i<8; i++){
      addSparkle(42 + Math.random()*12, 36 + Math.random()*16, '#FFE08A');
    }
    walkTo(62, 78, () => {
      pig.face = -1;
      setMode('happy', 1.5);
    });
    return;
  }

  // 3. Chạm vào Máng Cám (Đổ cám cho heo ăn trực tiếp)
  if(x >= 68 && x <= 92 && y >= 102 && y <= 124) {
    window.pigFeed();
    return;
  }

  // 4. Chạm vào Ao Sen (Thả cám cho cá ăn)
  if(x >= 118 && x <= 162 && y >= 94 && y <= 122) {
    if(fishFood.length > 0){
      say('Cá đang ăn ngon lành nè! 🐟', 1200);
      return;
    }
    say('Thả mẩu cám cho cá ăn! 🐟🥖', 1400);
    fishFood = [
      { x: 128 + Math.random()*6, y: 102 + Math.random()*4, eaten: false },
      { x: 136 + Math.random()*6, y: 104 + Math.random()*4, eaten: false },
      { x: 144 + Math.random()*6, y: 102 + Math.random()*4, eaten: false }
    ];
    walkTo(116, 108, () => {
      pig.face = 1;
      setMode('happy', 1.2);
    });
    return;
  }

  // 5. Chạm vào Chú Heo (Nựng Heo & Gãi Bụng)
  if(x > pig.x - 13 && x < pig.x + 13 && y > pig.y - 22 && y < pig.y + 3) {
    const nowTap = performance.now();
    if(nowTap - lastPigTapTime < 800) {
      pigTapCount++;
    } else {
      pigTapCount = 1;
    }
    lastPigTapTime = nowTap;

    if(pigTapCount >= 3){
      pigTapCount = 0;
      say('Hihi nhột quá, đừng gãi nữa mà! 😂', 2400);
      setMode('tickle', 3.0, () => setMode('happy', 1.4));
      try {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PIG_TAP', text: 'Hihi nhột quá!' }));
        } else if (window.parent) {
          window.parent.postMessage(JSON.stringify({ type: 'PIG_TAP', text: 'Hihi nhột quá!' }), '*');
        }
      } catch(e){}
      return;
    }

    const quotes = ['Ủn ỉn!', 'Heo đây, heo đây!', 'Gãi bụng đi nè', 'Tiết kiệm giỏi ghê!'];
    const q = quotes[(Math.random() * quotes.length) | 0];
    say(q, 1500);
    setMode('happy', 1.2, () => setMode('idle', 1.5));
    try {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PIG_TAP', text: q }));
      } else if (window.parent) {
        window.parent.postMessage(JSON.stringify({ type: 'PIG_TAP', text: q }), '*');
      }
    } catch(e){}
    return;
  }

  // 6. Chạm vào mặt đất để Heo đi dạo
  const tx = clamp(x, MINX, MAXX), ty = clamp(y, MINY, MAXY);
  if(blocked(tx, ty)){
    say('Ở đó có ao, heo không bơi đâu nha', 1800);
    return;
  }
  walkTo(tx, ty);
});

let last=performance.now();
function loop(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;
  update(dt);draw(now/1000);placeBubble();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
})();
</script>
</body>
</html>
  `, []); // ⚡ deps rỗng: HTML được tạo 1 lần, budget sync qua injectJavaScript

  // Memoize source object để WebView không reload khi parent re-render
  const memoizedSource = useMemo(() => ({ html: htmlSource, baseUrl: '' }), [htmlSource]);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { height: gardenHeight }, style]}>
        <iframe
          ref={(el: any) => {
            if (el) {
              webViewRef.current = {
                injectJavaScript: (code: string) => {
                  try {
                    el.contentWindow?.eval(code);
                  } catch (e) {}
                },
              };
            }
          }}
          srcDoc={htmlSource}
          style={{ width: '100%', height: '100%', border: 'none', background: '#86B866' } as any}
        />
      </View>
    );
  }

  // iOS Fabric offscreen guard: chỉ mount WebView sau khi tab Vườn được active lần đầu.
  // Điều này tránh WKWebView blank khi render khi tab ở offscreen position.
  if (!hasMountedOnce.current) {
    return (
      <View
        style={[
          styles.container,
          { width: winWidth, height: gardenHeight, backgroundColor: isPink ? '#FFF5F7' : '#86B866' },
          style,
        ]}
      />
    );
  }

  return (
    // Explicit width + height thay vì chỉ dùng aspectRatio
    // Fix canvas collapse trên iOS Fabric khi render offscreen
    <View
      style={[
        styles.container,
        {
          width: winWidth,
          height: gardenHeight,
          backgroundColor: isPink ? '#FFF5F7' : '#86B866',
        },
        style,
      ]}
    >
      <SafeWebView
        ref={webViewRef}
        source={memoizedSource}
        originWhitelist={['*']}
        style={styles.webView}
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
        onLoadEnd={() => setIsLoaded(true)}
        onMessage={(event: any) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if ((data.type === 'PIG_TAP' || data.type === 'PIG_TALK') && onPigTap) {
              onPigTap(data.text);
            } else if (data.type === 'ENTER_HOUSE' && onEnterHouse) {
              onEnterHouse();
            }
          } catch (e) {}
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    // width và height được set động qua props để tránh Fabric collapse
    overflow: 'hidden',
    backgroundColor: '#86B866',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
