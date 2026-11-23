import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp, Platform, Pressable, Text, useWindowDimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../../theme/ThemeContext';

const SafeWebView = WebView as unknown as React.ComponentType<any>;

export interface PixelHouseWebViewRef {
  selectRoom: (roomId: string) => void;
  toggleTour: () => void;
}

export interface RoomInfo {
  id: string;
  name: string;
  category: string;
  subtitle: string;
}

export interface RealPhotoItem {
  id: string;
  url: string;
  name: string;
  amount: number;
  date: string;
}

interface PixelHouseWebViewProps {
  currentMonth?: number;
  totalSpent?: number;
  monthlyIncome?: number;
  dailyLimit?: number;
  categorySpent?: { an: number; di: number; mua: number };
  savedAmount?: number;
  streak?: number;
  photos?: RealPhotoItem[];
  isMasked?: boolean;
  isActive?: boolean;
  viewportWidth?: number;
  viewportHeight?: number;
  onSelectRoom?: (room: RoomInfo) => void;
  onExitToGarden?: () => void;
  onOpenMagazine?: () => void;
  onToggleMask?: () => void;
  onOpenCamera?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const PixelHouseWebView = forwardRef<
  PixelHouseWebViewRef,
  PixelHouseWebViewProps
>(({
  currentMonth = new Date().getMonth() + 1,
  totalSpent = 74000,
  monthlyIncome = 20000000,
  dailyLimit = 300000,
  categorySpent = { an: 45000, di: 38000, mua: 0 },
  savedAmount = 18100000,
  streak = 24,
  photos = [],
  isMasked = false,
  isActive = true,
  viewportWidth,
  viewportHeight,
  onSelectRoom,
  onExitToGarden,
  onOpenMagazine,
  onToggleMask,
  onOpenCamera,
  style
}, ref) => {
  const { tokens, mode } = useTheme();
  const isPink = mode === 'pink';
  const webViewRef = useRef<any>(null);
  const [hasMountedOnce, setHasMountedOnce] = useState(Boolean(isActive));
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const { width: winW, height: winH } = useWindowDimensions();
  const boxWidth = viewportWidth ?? winW;
  const boxHeight = viewportHeight ?? Math.max(420, winH);

  // Lazy-mount: chỉ khởi tạo WebKit khi Tab 1 đã từng active
  useEffect(() => {
    if (isActive && !hasMountedOnce) {
      setHasMountedOnce(true);
    }
  }, [isActive, hasMountedOnce]);

  // Đồng bộ số liệu và trạng thái ẩn tiền mượt mà không reload WebView
  const syncDataToWebView = () => {
    if (!webViewRef.current) return;
    const payload = JSON.stringify({
      currentMonth,
      totalSpent,
      monthlyIncome,
      dailyLimit,
      categorySpent,
      savedAmount,
      streak,
      photos,
      isMasked,
    });
    const code = `if (window.syncData) { window.syncData(${payload}); }`;
    webViewRef.current.injectJavaScript(code);
  };

  useEffect(() => {
    if (isLoaded) {
      syncDataToWebView();
    }
  }, [currentMonth, totalSpent, monthlyIncome, dailyLimit, categorySpent, savedAmount, streak, photos, isMasked, isLoaded]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handleWebMsg = (e: any) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data?.type === 'OPEN_CAMERA' && onOpenCamera) {
          onOpenCamera();
        } else if (data?.type === 'EXIT_TO_GARDEN' && onExitToGarden) {
          onExitToGarden();
        } else if (data?.type === 'OPEN_MAGAZINE' && onOpenMagazine) {
          onOpenMagazine();
        } else if (data?.type === 'TOGGLE_MASK' && onToggleMask) {
          onToggleMask();
        }
      } catch (err) {}
    };
    window.addEventListener('message', handleWebMsg);
    return () => window.removeEventListener('message', handleWebMsg);
  }, [onOpenCamera, onExitToGarden, onOpenMagazine, onToggleMask]);

  useImperativeHandle(ref, () => ({
    selectRoom: (roomId: string) => {
      const code = `if (window.selectRoom) { window.selectRoom('${roomId}'); }`;
      webViewRef.current?.injectJavaScript(code);
    },
    toggleTour: () => {
      const code = `if (window.toggleTour) { window.toggleTour(); }`;
      webViewRef.current?.injectJavaScript(code);
    },
  }));

  const initialHtml = useMemo(() => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <!-- System fonts: SF Pro Rounded (iOS) / Nunito / System — 100% Offline-First -->
  <style>
    :root {
      --page:${isPink ? '#FFF5F7' : '#F6EEDC'}; --screen:${isPink ? '#FFF0F3' : '#F6EEDC'}; --card:${isPink ? '#FFFFFF' : '#FFFBF1'}; --ink:${isPink ? '#3B0713' : '#2B2118'}; --muted:${isPink ? '#881337' : '#85735E'};
      --pig:#F9B8C4; --green:#5E9A57; --red:#E0452B; --gold:#F4B93B; --line:${isPink ? '#F4D3DA' : '#D9C9A4'};
      --f-display:'SF Pro Rounded','Nunito','Avenir Next',-apple-system,BlinkMacSystemFont,sans-serif;
      --f-body:'SF Pro Rounded',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
      color-scheme:light;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; }
    html, body {
      width: 100%;
      min-height: 100%;
      background: var(--screen);
      color: var(--ink);
      font: 600 15px/1.5 var(--f-body);
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      touch-action: manipulation;
    }
    .house-app {
      width: 100%;
      max-width: 420px;
      margin: 0 auto;
      padding: 4px 12px 48px;
    }
    .top {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .avatar {
      width: 44px;
      height: 44px;
      flex: none;
      border: 3px solid var(--ink);
      border-radius: 50%;
      background: ${isPink ? '#FCE3E8' : '#F9B8C4'};
      display: grid;
      place-items: center;
      box-shadow: 0 3px 0 var(--ink);
    }
    .avatar canvas {
      width: 36px;
      height: 36px;
      image-rendering: pixelated;
    }
    .who {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }
    .who b {
      font: 800 18px/1.1 var(--f-display);
    }
    .who span {
      color: var(--muted);
      font-weight: 700;
      font-size: 12px;
    }
    .btn {
      font: 800 13px/1.2 var(--f-body);
      color: var(--ink);
      background: var(--card);
      border: 3px solid var(--ink);
      border-radius: 999px;
      padding: 6px 12px;
      box-shadow: 0 3px 0 var(--ink);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: transform .08s, box-shadow .08s;
    }
    .btn.icon {
      padding: 6px 9px;
      font-size: 14px;
    }
    .btn:active {
      transform: translateY(2px);
      box-shadow: 0 1px 0 var(--ink);
    }
    .btn.small {
      padding: 6px 12px;
      font-size: 13px;
    }
    .btn.dark {
      background: var(--ink);
      color: var(--screen);
    }
    .btn.wide {
      width: 100%;
      justify-content: center;
      margin-top: 16px;
    }
    .btn.round {
      width: 32px;
      height: 32px;
      padding: 0;
      justify-content: center;
      border-radius: 50%;
    }
    .btn.shoot {
      position: absolute;
      right: 10px;
      bottom: 10px;
      line-height: 1.2;
      z-index: 6;
      background: var(--ink);
      color: var(--screen);
      box-shadow: 0 3px 0 #1A130E;
    }
    .btn[aria-pressed="true"] {
      background: var(--ink);
      color: var(--screen);
    }

    .months {
      display: flex;
      gap: 8px;
      margin-top: 10px;
      flex-wrap: wrap;
    }
    .scene {
      position: relative;
      border: 3px solid var(--ink);
      border-radius: 26px;
      overflow: hidden;
      box-shadow: 0 4px 0 var(--ink);
      background: #86B866;
      line-height: 0;
    }
    .scene canvas {
      display: block;
      width: 100%;
      height: auto;
      image-rendering: pixelated;
      cursor: pointer;
    }
    .scene.house {
      margin-top: 12px;
      background: #CFE8D8;
    }
    .mapbtns {
      position: absolute;
      inset: 0;
    }
    .mapbtns button {
      position: absolute;
      background: transparent;
      border: 0;
      border-radius: 6px;
      cursor: pointer;
      padding: 0;
    }
    .rooms {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 12px 2px 6px;
      scrollbar-width: none;
    }
    .rooms::-webkit-scrollbar { display: none; }
    .rooms .btn {
      flex: none;
    }
    .scene.room {
      margin-top: 4px;
      background: #F2DFA8;
    }
    .roomtag {
      position: absolute;
      left: 10px;
      top: 10px;
      line-height: 1.2;
      background: var(--card);
      border: 3px solid var(--ink);
      border-radius: 999px;
      padding: 4px 12px;
      font: 800 13px var(--f-body);
      pointer-events: none;
      box-shadow: 0 2px 0 var(--ink);
      z-index: 5;
    }
    .bubble {
      position: absolute;
      transform: translate(-50%, -100%);
      background: var(--card);
      border: 3px solid var(--ink);
      border-radius: 14px;
      padding: 6px 12px;
      font: 800 13px/1.25 var(--f-body);
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity .15s;
      color: var(--ink);
      box-shadow: 0 3px 0 var(--ink);
      z-index: 10;
    }
    .bubble.wrap {
      white-space: normal;
      width: max-content;
      max-width: 220px;
      text-align: center;
    }
    .bubble.on { opacity: 1; }
    .bubble::after {
      content: "";
      position: absolute;
      left: 50%;
      bottom: -8px;
      width: 10px;
      height: 10px;
      background: var(--card);
      border-right: 3px solid var(--ink);
      border-bottom: 3px solid var(--ink);
      transform: translateX(-50%) rotate(45deg);
    }
    .label {
      font: 800 12px/1.2 var(--f-body);
      letter-spacing: .16em;
      text-transform: uppercase;
      color: var(--muted);
    }

    /* ---- BẢNG PHÂN TÍCH PANEL (MỖI PHÒNG 1 TRUNG TÂM PHÂN TÍCH) ---- */
    .panel {
      margin-top: 6px;
    }
    .rhead {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin: 16px 2px 10px;
    }
    .rhead h2 {
      font: 800 26px/1.1 var(--f-display);
      margin: 0;
    }
    .kpis {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }
    .kpis.two {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .kpi {
      background: var(--card);
      border: 3px solid var(--ink);
      border-radius: 20px;
      padding: 8px 12px 10px;
      box-shadow: 0 3px 0 var(--ink);
      min-width: 0;
    }
    .kpi b {
      display: block;
      font: 800 21px/1.2 var(--f-display);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .kpi.ok b { color: var(--green); }
    .card {
      background: var(--card);
      border: 3px solid var(--ink);
      border-radius: 26px;
      padding: 16px;
      box-shadow: 0 4px 0 var(--ink);
      margin-top: 16px;
      min-width: 0;
    }
    .card .sub {
      margin: 4px 0 8px;
      color: var(--muted);
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .toggle {
      display: inline-flex;
      gap: 6px;
    }
    .toggle .btn {
      padding: 4px 12px;
      font-size: 13px;
      box-shadow: 0 2px 0 var(--ink);
    }
    .chart svg {
      width: 100%;
      height: auto;
      display: block;
      margin-top: 6px;
    }
    .chart .b {
      stroke: var(--ink);
      stroke-width: 2;
    }
    .chart .b.ok { fill: var(--green); }
    .chart .b.bad { fill: var(--red); }
    .chart .lim {
      stroke: var(--muted);
      stroke-width: 1.6;
      stroke-dasharray: 5 4;
    }
    .chart .ax {
      fill: var(--muted);
      font: 700 10px var(--f-body);
    }
    .chart .halo {
      paint-order: stroke;
      stroke: var(--card);
      stroke-width: 3px;
    }
    .chart .area {
      fill: #F9B8C4;
      opacity: .4;
    }
    .chart .ln {
      fill: none;
      stroke: var(--ink);
      stroke-width: 3;
      stroke-linejoin: round;
      stroke-linecap: round;
    }
    .chart .dot {
      fill: var(--card);
      stroke: var(--ink);
      stroke-width: 2.5;
    }
    .chart .dot.end { fill: var(--red); }
    .stack {
      display: flex;
      height: 24px;
      border: 3px solid var(--ink);
      border-radius: 14px;
      overflow: hidden;
      margin-top: 10px;
    }
    .stack i {
      display: block;
      min-width: 2px;
      border-right: 2px solid var(--ink);
    }
    .stack i:last-child { border-right: 0; }
    .leg {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 14px;
      margin-top: 10px;
      font-size: 13px;
    }
    .leg i {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 4px;
      border: 2px solid var(--ink);
      margin-right: 6px;
      vertical-align: -1px;
    }
    .read {
      display: flex;
      gap: 12px;
      align-items: center;
      background: var(--ink);
      color: var(--screen);
      border-radius: 24px;
      padding: 12px 16px;
      margin-top: 16px;
      box-shadow: 0 4px 0 #6B5A47;
    }
    .read canvas {
      width: 60px;
      height: 50px;
      flex: none;
      image-rendering: pixelated;
    }
    .read .label { color: #CDBBA0; }
    .read p {
      margin: 2px 0 0;
      font: 700 15px/1.35 var(--f-body);
    }
    .pgrid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      margin-top: 10px;
    }
    .ph {
      position: relative;
      aspect-ratio: 1;
      border: 3px solid var(--ink);
      border-radius: 18px;
      overflow: hidden;
      padding: 0;
      background: var(--card);
      cursor: pointer;
    }
    .ph canvas {
      width: 100%;
      height: 100%;
      display: block;
      image-rendering: pixelated;
    }
    .ph .tag {
      position: absolute;
      left: 6px;
      bottom: 6px;
      background: rgba(43,33,24,.85);
      color: var(--screen);
      font: 800 11px/1.2 var(--f-body);
      border-radius: 999px;
      padding: 2px 8px;
    }
    .wk { margin-top: 16px; }
    .dcard {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-top: 10px;
      padding: 10px;
      border: 3px solid var(--ink);
      border-radius: 20px;
      background: var(--screen);
    }
    .dcard canvas {
      width: 72px;
      height: 72px;
      flex: none;
      border: 3px solid var(--ink);
      border-radius: 14px;
      image-rendering: pixelated;
    }
    .dcard div {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .dcard span { font-size: 13px; color: var(--muted); }
    .dcard p { margin: 2px 0 0; font-size: 14px; }
    .list {
      list-style: none;
      margin: 8px 0 0;
      padding: 0;
    }
    .list li {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      padding: 9px 0;
      border-top: 2px dashed var(--line);
    }
    .list li:first-child { border-top: 0; }
    .list b { font-variant-numeric: tabular-nums; white-space: nowrap; }
    .list small { color: var(--muted); font-weight: 700; }
    .goal + .goal { margin-top: 14px; }
    .grow {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 6px;
      font-size: 14px;
    }
    .grow span { color: var(--muted); font-variant-numeric: tabular-nums; }
    .bar {
      height: 18px;
      border: 3px solid var(--ink);
      border-radius: 10px;
      background: var(--screen);
      overflow: hidden;
    }
    .bar i {
      display: block;
      height: 100%;
      background: var(--green);
      border-right: 3px solid var(--ink);
    }
  </style>
</head>
<body>
  <div class="house-app">
    <!-- 1. HEADER NHÀ CỦA HEO -->
    <div class="top">
      <div class="avatar"><canvas id="hface" width="16" height="16"></canvas></div>
      <div class="who"><b>Nhà của Heo</b><span id="hsub">Tháng ${currentMonth} · Chuỗi ${streak || 24} ngày</span></div>
      <button class="btn icon" type="button" id="magBtn" aria-label="Tạp chí Anime" title="Tạp chí Anime">✨</button>
      <button class="btn icon" type="button" id="maskBtn" aria-label="Ẩn hiện số tiền" title="Ẩn số tiền">${isMasked ? '🙈' : '👁️'}</button>
      <button class="btn small" type="button" id="tourBtn" aria-pressed="false">Tham quan</button>
    </div>

    <!-- 2. DẢI CHỌN THÁNG -->
    <div class="months" id="months" role="group" aria-label="Chọn tháng"></div>

    <!-- 3. MẶT CẮT NGÔI NHÀ 2 TẦNG 6 PHÒNG -->
    <div class="scene house">
      <canvas id="map" width="176" height="108" role="img" aria-label="Mặt cắt ngôi nhà hai tầng sáu phòng"></canvas>
      <div class="mapbtns" id="mapbtns"></div>
    </div>

    <!-- 4. DẢI CHỌN PHÒNG CHIPS -->
    <div class="rooms" id="roomChips" role="group" aria-label="Chọn phòng"></div>

    <!-- 5. PHÒNG CHI TIẾT ĐANG CHỌN -->
    <div class="scene room">
      <canvas id="room" width="176" height="96" role="img" aria-label="Bên trong phòng đang chọn"></canvas>
      <div class="roomtag" id="roomTag">Sảnh · Tổng quan</div>
      <button class="btn dark shoot" type="button" id="boothBtn" hidden>Chụp ảnh</button>
      <div class="bubble wrap" id="bubble2" role="status" aria-live="polite"></div>
    </div>

    <!-- 6. BẢNG PHÂN TÍCH PANEL (MỖI PHÒNG LÀ 1 TRUNG TÂM PHÂN TÍCH TÀI CHÍNH) -->
    <div class="panel" id="panel" aria-live="polite"></div>
  </div>

<script>
(function(){
'use strict';
const W_MAP = 176, H_MAP = 108;
const W_ROOM = 176, H_ROOM = 96;
const W=176, H=108;
let LIMIT = ${dailyLimit || 300000};
let REAL_TOTAL = ${totalSpent || 74000};
let REAL_INCOME = ${monthlyIncome || 20000000};
let REAL_SAVED = ${savedAmount || 18100000};
let REAL_CATS = ${JSON.stringify(categorySpent)};
let STREAK = ${streak || 24};
let IS_MASKED = ${isMasked ? 'true' : 'false'};
let REAL_PHOTOS = ${JSON.stringify(photos || [])};
let pendingBooth = false;
const bs = { closed: false, flash: 0, pigIn: false };

function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const C={grass1:'#86B866',grass2:'#74A659',grass3:'#9CCB78',wall:'#F2DFA8',wallShade:'#E2C984',roof:'#C4603A',roofDark:'#9E4528',roofLight:'#DC7A4E',
  wood:'#8A5A34',woodDark:'#5E3A20',woodLight:'#B07A48',tileA:'#3F8F95',tileB:'#F7EFDA',tileC:'#E0A93B',water:'#6DB7C9',waterDark:'#4E97AE',
  pad:'#4F9A4F',stone:'#CFC6B0',stoneDark:'#A99F87',trunk:'#6B4426',leaf1:'#4E9A47',leaf2:'#3E8139',leafLight:'#72B95B',
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
function drawFace(c){
  const o=0;
  shape(c,[[1,2,4],[2,2,5]],PAL.p,o,o);shape(c,[[1,11,13],[2,10,13]],PAL.p,o,o);
  shape(c,[[3,3,12],[4,2,13],[5,2,13],[6,2,13],[7,2,13],[8,2,13],[9,2,13],[10,3,12],[11,4,11],[12,5,10]],PAL.p,o,o);
  R(c,3,2,3,1,PAL.p);R(c,10,2,3,1,PAL.p);
  shape(c,[[8,5,10],[9,5,10],[10,5,10],[11,6,9]],PAL.n,o,o);
  R(c,6,9,1,1,PAL.k);R(c,9,9,1,1,PAL.k);
  R(c,4,5,2,2,PAL.k);R(c,10,5,2,2,PAL.k);R(c,4,5,1,1,PAL.w);R(c,10,5,1,1,PAL.w);
  R(c,3,8,1,1,PAL.s);R(c,12,8,1,1,PAL.s);
}
const HEART=[[0,1,0,1,0],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0]];
function heart(c,x,y,col){c.fillStyle=col;HEART.forEach((r,j)=>r.forEach((v,i)=>{if(v)c.fillRect(x+i,y+j,1,1)}))}

/* ====== 6 PHÒNG & MẶT CẮT NGÔI NHÀ ====== */
const HR={
  sanh:{n:'Sảnh',sub:'Tổng quan',col:1,row:1,wall:'#FFF6E5'},
  bep:{n:'Bếp',sub:'Ăn uống',col:0,row:1,wall:'#FFEBD9'},
  khach:{n:'Phòng khách',sub:'Mua sắm',col:2,row:1,wall:'#E4F4DC'},
  lamviec:{n:'Phòng làm việc',sub:'Đi lại',col:0,row:0,wall:'#E3F2FD'},
  anh:{n:'Phòng ảnh',sub:'Nhật ký ảnh',col:1,row:0,wall:'#F2E7FA'},
  ngu:{n:'Phòng ngủ',sub:'Tiết kiệm',col:2,row:0,wall:'#FCE4EC'}
};
const ROOM_ORDER=['sanh','bep','khach','ngu','anh','lamviec'];
Object.values(HR).forEach(r=>{r.x=8+r.col*54;r.y=r.row?60:16;r.w=52;r.h=40;r.cx=r.x+26});
const FLOOR_Y=[54,98];
const STAIR={x0:76,y0:98,x1:108,y1:54};
const ob=(c,x,y,w,h,col)=>{R(c,x,y,w,h,'#2B2118');R(c,x+1,y+1,w-2,h-2,col)};

/* Vẽ ảnh pixel 24x24 */
const K={
  pho:(c,x,y)=>{R(c,x,y,24,24,'#D8CFBE');R(c,x,y,24,7,'#EADFC6');E(c,x+12,y+14,10,8,'#FFFFFF');E(c,x+12,y+14,8,6,'#D9A45B');
    [[7,12],[10,15],[14,12],[16,16],[9,17]].forEach(([a,b])=>R(c,x+a,y+b,3,1,'#F3E3B0'));
    [[8,13],[13,16],[15,13]].forEach(([a,b])=>R(c,x+a,y+b,3,2,'#8A4B2D'));R(c,x+11,y+11,3,1,'#5EA04C');R(c,x+17,y+9,6,1,'#E0452B')},
  coffee:(c,x,y)=>{R(c,x,y,24,24,'#A9B5A2');R(c,x,y+16,24,8,'#7C7F78');R(c,x+8,y+5,9,17,'#F4EBDD');R(c,x+9,y+10,7,11,'#6B3F26');
    R(c,x+9,y+10,7,3,'#E7C9A0');R(c,x+10,y+7,2,2,'#fff');R(c,x+13,y+8,2,2,'#fff');R(c,x+14,y+2,1,9,'#E0452B');R(c,x+7,y+4,11,1,'#CFC6B6')},
  lau:(c,x,y)=>{R(c,x,y,24,24,'#7A5238');R(c,x,y,24,4,'#9B6B47');E(c,x+12,y+14,11,7,'#B8B2A5');E(c,x+12,y+13,9,5,'#C0502B');
    E(c,x+8,y+13,2,2,'#5EA04C');E(c,x+14,y+12,2,2,'#78B65C');R(c,x+11,y+15,3,1,'#F3E3B0');R(c,x+3,y+4,14,1,'#E8D6A8');R(c,x+5,y+6,14,1,'#E8D6A8')},
  grab:(c,x,y)=>{R(c,x,y,24,24,'#8B5BB0');E(c,x+7,y+16,4,4,'#fff');E(c,x+7,y+16,2,2,'#8B5BB0');E(c,x+17,y+16,4,4,'#fff');
    E(c,x+17,y+16,2,2,'#8B5BB0');R(c,x+7,y+11,11,3,'#fff');R(c,x+14,y+7,2,5,'#fff');R(c,x+14,y+6,5,1,'#fff')},
  veg:(c,x,y)=>{R(c,x,y,24,24,'#D8C9A3');R(c,x+3,y+9,18,13,'#B8935A');R(c,x+3,y+9,18,2,'#D0AA6E');E(c,x+8,y+8,5,4,'#5EA04C');
    E(c,x+15,y+7,4,4,'#78B65C');R(c,x+5,y+11,2,5,'#E8782B');E(c,x+8,y+18,2,3,'#F4E8D0');E(c,x+12,y+19,2,3,'#F4E8D0');R(c,x+15,y+16,5,2,'#F4C93B')},
  banhmi:(c,x,y)=>{R(c,x,y,24,24,'#BFC9A8');R(c,x,y+17,24,7,'#9AA582');E(c,x+12,y+13,10,5,'#D9A55B');E(c,x+12,y+12,9,3,'#E8B96E');
    R(c,x+5,y+12,14,2,'#6DB85A');R(c,x+6,y+14,12,1,'#B05A3A');R(c,x+8,y+11,2,1,'#F28C28');R(c,x+14,y+11,2,1,'#F28C28')},
  shirt:(c,x,y)=>{R(c,x,y,24,24,'#9EC8E8');R(c,x+7,y+7,10,14,'#FFFFFF');R(c,x+3,y+7,4,5,'#FFFFFF');R(c,x+17,y+7,4,5,'#FFFFFF');
    R(c,x+10,y+5,4,2,'#9EC8E8');R(c,x+7,y+13,10,2,'#E0452B')},
  gift:(c,x,y)=>{R(c,x,y,24,24,'#F9C9D4');R(c,x+5,y+11,14,11,'#E0452B');R(c,x+4,y+9,16,3,'#F27A63');R(c,x+11,y+9,2,13,'#F4B93B');
    E(c,x+9,y+7,3,2,'#F4B93B');E(c,x+15,y+7,3,2,'#F4B93B')},
  head:(c,x,y)=>{R(c,x,y,24,24,'#7FB5A6');E(c,x+12,y+13,8,8,'#2B2118');E(c,x+12,y+13,6,6,'#7FB5A6');R(c,x+3,y+15,18,9,'#7FB5A6');
    R(c,x+3,y+12,4,8,'#F9B8C4');R(c,x+17,y+12,4,8,'#F9B8C4');R(c,x+3,y+12,4,1,'#2B2118');R(c,x+17,y+12,4,1,'#2B2118')},
  fuel:(c,x,y)=>{R(c,x,y,24,24,'#F6C27A');R(c,x+6,y+4,10,17,'#E0452B');R(c,x+8,y+6,6,5,'#BFE3E8');R(c,x+16,y+8,3,1,'#2B2118');
    R(c,x+18,y+8,1,9,'#2B2118');R(c,x+4,y+21,14,2,'#4B2B21')},
  coin:(c,x,y)=>{R(c,x,y,24,24,'#F9C9D4');E(c,x+12,y+12,8,8,'#B97A14');E(c,x+12,y+12,7,7,'#F4B93B');R(c,x+11,y+8,2,8,'#B97A14');
    R(c,x+9,y+8,6,1,'#B97A14');R(c,x+9,y+15,6,1,'#B97A14')}
};
function photo(c,k,x,y){(K[k]||K.pho)(c,x||0,y||0)}

function mini(c,id,r){
  const x=r.x,y=r.y;
  if(id==='sanh'){R(c,x+2,y+10,10,26,'#5E3A20');R(c,x+3,y+11,8,25,'#8A5A34');R(c,x+9,y+24,2,2,'#F4B93B')}
  else if(id==='bep'){R(c,x+4,y+8,11,28,'#DDE6EE');R(c,x+4,y+20,11,1,'#2B2118');R(c,x+26,y+26,24,10,'#A8754A');R(c,x+32,y+20,10,6,'#8B8B93')}
  else if(id==='khach'){R(c,x+22,y+16,26,8,'#E86F8B');R(c,x+18,y+22,34,14,'#F08DA4');R(c,x+4,y+28,7,8,'#B5603A');E(c,x+7,y+24,5,5,C.leaf1)}
  else if(id==='lamviec'){R(c,x+18,y+26,30,3,'#B07A48');R(c,x+20,y+29,3,7,'#8A5A34');R(c,x+44,y+29,3,7,'#8A5A34');R(c,x+27,y+18,12,8,'#2B2118');R(c,x+28,y+19,10,6,'#7FD4E0')}
  else if(id==='anh'){[['#F4B93B'],['#F08DA4'],['#6DA9D9']].forEach((a,i)=>{R(c,x+3+i*16,y+5,12,12,'#4B2B21');R(c,x+4+i*16,y+6,10,10,a[0])})}
  else if(id==='ngu'){R(c,x+3,y+28,30,8,'#8FC1E3');R(c,x+3,y+22,9,7,'#F9B8C4');R(c,x+38,y+22,9,11,'#FFFFFF');R(c,x+40,y+27,3,2,'#F4B93B')}
}

function drawMap(c,t,sel){
  const rd=mulberry32(5);
  R(c,0,0,176,108,'#CFE8D8');for(let i=0;i<14;i++)R(c,(rd()*176)|0,(rd()*10)|0,7,1,'#E6F5EC');
  R(c,0,102,176,6,'#86B866');for(let i=0;i<30;i++)R(c,(rd()*176)|0,103+((rd()*4)|0),2,1,'#74A659');
  R(c,76,102,16,6,'#E4D6B0');
  R(c,2,2,172,13,C.roof);
  for(let y=4;y<13;y+=3){R(c,2,y,172,1,C.roofDark);for(let x=(y%2?2:5);x<174;x+=6)R(c,x,y+1,1,2,C.roofDark)}
  for(let x=2;x<174;x+=6)R(c,x,2,3,1,C.roofLight);
  R(c,2,14,172,2,'#4B2B21');R(c,18,0,8,3,C.roofDark);
  R(c,6,16,164,87,'#4B2B21');
  Object.entries(HR).forEach(([id,r])=>{
    R(c,r.x,r.y,r.w,r.h,r.wall);R(c,r.x,r.y+r.h-4,r.w,4,'#C99A6B');R(c,r.x,r.y+r.h-4,r.w,1,'#A87650');mini(c,id,r);
  });
  R(c,6,56,164,4,'#8A5A34');R(c,8,56,160,1,'#B07A48');
  for(let i=0;i<11;i++){const x=76+i*3,h=4*(i+1);R(c,x,98-h,3,h,'#A87650');R(c,x,98-h,3,1,'#D9A878')}
  const s=HR[sel],g=(Math.floor(t*2)%2)?'#F4B93B':'#FFFBF1';
  R(c,s.x-2,s.y-2,s.w+4,2,g);R(c,s.x-2,s.y+s.h,s.w+4,2,g);R(c,s.x-2,s.y-2,2,s.h+4,g);R(c,s.x+s.w,s.y-2,2,s.h+4,g);
}

const FURN={
  sanh:(c,t)=>{R(c,6,20,28,46,'#5E3A20');R(c,8,22,24,44,'#8A5A34');for(let y=26;y<64;y+=6)R(c,8,y,24,1,'#6B4426');
    R(c,12,26,16,10,'#BFE3E8');R(c,25,46,3,3,'#F4B93B');R(c,52,76,72,14,'#C93A25');R(c,55,79,66,8,'#F4D58A');R(c,58,82,60,2,'#E0452B');
    ob(c,132,46,36,20,'#8A5A34');R(c,134,49,32,6,'#C99A6B');R(c,134,57,32,6,'#C99A6B');R(c,138,51,8,4,'#F9B8C4');R(c,152,51,8,4,'#6DA9D9');R(c,142,59,8,4,'#F4B93B')},
  bep:(c,t)=>{ob(c,6,14,24,52,'#DDE6EE');R(c,8,38,20,1,'#2B2118');R(c,24,22,2,10,'#8B8B93');R(c,24,42,2,10,'#8B8B93');R(c,12,20,4,4,'#E0452B');R(c,17,26,4,4,'#F4B93B');
    ob(c,118,44,58,22,'#A8754A');R(c,118,41,58,4,'#E8D6B4');R(c,146,46,1,20,'#8A5A34');
    ob(c,132,30,16,11,'#8B8B93');R(c,150,33,5,2,'#6B6B73');
    for(let i=0;i<3;i++){const yy=26-((t*6+i*4)%12);R(c,136+i*5,Math.round(yy),1,3,'rgba(255,255,255,.75)')}
    R(c,158,12,1,6,'#4B2B21');ob(c,155,18,8,8,'#4B4B52');R(c,163,21,6,2,'#2B2118')},
  lamviec:(c,t)=>{ob(c,6,12,24,30,'#F7EFDA');R(c,10,34,6,1,'#E0452B');R(c,15,28,1,7,'#E0452B');R(c,15,28,8,1,'#E0452B');R(c,22,22,1,7,'#E0452B');R(c,21,19,3,3,'#E0452B');
    R(c,17,44,2,3,'#4B2B21');E(c,18,53,7,6,'#E0452B');R(c,12,53,13,2,'#BFE3E8');
    R(c,98,48,72,4,'#B07A48');R(c,100,52,4,14,'#8A5A34');R(c,164,52,4,14,'#8A5A34');
    ob(c,122,36,24,12,'#2B2118');R(c,124,38,20,8,'#7FD4E0');R(c,118,48,32,2,'#CFC6B6');ob(c,156,42,6,6,'#FFFFFF')},
  khach:(c,t)=>{ob(c,92,40,76,16,'#E86F8B');ob(c,88,50,84,16,'#F08DA4');R(c,96,44,12,8,'#F4B93B');R(c,150,44,12,8,'#8FC1E3');
    ob(c,10,50,14,14,'#B5603A');E(c,17,42,9,8,C.leaf1);E(c,14,40,4,4,C.leafLight);R(c,18,38,2,2,'#F59BB0');
    ob(c,64,52,14,14,'#F4B93B');R(c,68,48,6,4,'#B97A14')},
  ngu:(c,t)=>{ob(c,4,52,64,16,'#8A5A34');R(c,6,44,60,10,'#FFFBF1');R(c,8,40,16,10,'#F9B8C4');R(c,26,44,38,10,'#8FC1E3');R(c,26,48,38,2,'#6DA9D9');
    ob(c,128,10,34,30,'#CFE8F2');R(c,144,10,2,30,'#2B2118');R(c,128,24,34,2,'#2B2118');E(c,136,18,4,4,'#FFF4B0');
    R(c,132,52,34,3,'#8A5A34');ob(c,140,40,16,12,'#E9F4F6');R(c,143,44,4,2,'#F4B93B');R(c,149,46,4,2,'#F4B93B');R(c,142,38,12,2,'#F9B8C4')},
  anh:(c,t,v)=>{
    ob(c,10,48,60,18,'#8A5A34');
    ['#E0452B','#F4B93B','#6DA9D9','#5E9A57'].forEach((col,i)=>{
      R(c,13+i*7,50,5,14,col);
      R(c,41+i*7,50,5,14,col);
    });
    booth(c,t);
    R(c,84,78,40,10,'#E9B8C4');
  }
};

/* ---------- photobooth trong phòng ảnh (port 1:1 từ prototype) ---------- */
function booth(c,t){
  ob(c,130,18,40,48,'#E0452B');
  R(c,132,20,36,2,'#F27A63');
  ob(c,134,8,32,11,'#FFFBF1');
  E(c,146,14,3,3,'#2B2118');
  E(c,146,14,1,1,'#7FD4E0');
  R(c,141,10,4,2,'#2B2118');
  R(c,157,11,6,4,(Math.floor(t*2)%2)?'#F4B93B':'#B97A14');
  R(c,136,26,28,36,'#2B1A10');
  if(bs.closed){
    for(let x=136;x<164;x+=5){
      R(c,x,26,5,30,'#6DA9D9');
      R(c,x,26,1,30,'#4F8FC0');
    }
    if(bs.pigIn){
      R(c,144,56,4,5,'#F9B8C4');
      R(c,152,56,4,5,'#F9B8C4');
      R(c,144,60,4,1,'#EE90A6');
      R(c,152,60,4,1,'#EE90A6');
    }
  }else{
    R(c,137,27,26,34,'#FFF4DC');
    R(c,146,48,8,3,'#8A5A34');
    R(c,147,51,2,10,'#6B4426');
    R(c,151,51,2,10,'#6B4426');
    R(c,136,26,6,36,'#6DA9D9');
    R(c,158,26,6,36,'#6DA9D9');
    R(c,140,26,1,36,'#4F8FC0');
    R(c,160,26,1,36,'#4F8FC0');
  }
  if(bs.flash>0){
    R(c,136,26,28,36,'rgba(255,255,255,'+Math.min(1,bs.flash).toFixed(2)+')');
  }
  R(c,166,40,3,6,'#F4B93B');
  R(c,128,66,44,2,'#8A5A34');
}
function frame(c,x,y,k){R(c,x,y,28,28,'#4B2B21');R(c,x+1,y+1,26,26,'#F2DFA8');photo(c,k,x+2,y+2)}
function board(c,x,y,w,h,mn){
  ob(c,x,y,w,h,'#8A5A34');R(c,x+2,y+2,w-4,h-4,'#2F4A3A');
  const n=Math.max(1,mn.length),bw=Math.floor((w-8)/n);
  mn.forEach((m,i)=>{const bh=Math.max(1,Math.round(m.v*(h-10)));R(c,x+4+i*bw,y+h-4-bh,Math.max(1,bw-1),bh,m.over?'#FF8A6B':'#FFFBF1')});
  R(c,x+3,y+h-4,w-6,1,'#9DB8A5');
}
function drawRoom(c,id,t,v){
  const r=HR[id];
  R(c,0,0,176,96,r.wall);R(c,0,56,176,8,'rgba(0,0,0,.07)');
  R(c,0,64,176,32,'#C99A6B');for(let x=0;x<176;x+=22)R(c,x,64,1,32,'#B8865A');for(let y=74;y<96;y+=11)R(c,0,y,176,1,'#B8865A');
  R(c,0,62,176,3,'#8A5A34');
  FURN[id](c,t,v);
  if(id==='anh'){for(let i=0;i<4;i++)frame(c,6+i*30,6,v.frames[i%v.frames.length])}
  else{board(c,66,8,52,32,v.mini);frame(c,36,8,v.frames[0]);frame(c,126,8,v.frames[1%v.frames.length])}
}

/* DỮ LIỆU TÀI CHÍNH & MẪU */
const CATS={an:{n:'Ăn uống',c:'#F4B93B'},di:{n:'Đi lại',c:'#6DA9D9'},mua:{n:'Mua sắm',c:'#F08DA4'}};
const TPL={
  an:[['Phở bò',45000,'pho'],['Cà phê sữa',29000,'coffee'],['Bánh mì',25000,'banhmi'],['Lẩu cuối tuần',260000,'lau'],['Đi chợ',230000,'veg'],['Cơm trưa',40000,'pho']],
  di:[['Grab đi làm',38000,'grab'],['Đổ xăng',70000,'fuel'],['Grab về nhà',42000,'grab']],
  mua:[['Áo thun',199000,'shirt'],['Quà sinh nhật',350000,'gift'],['Tai nghe',450000,'head']]
};
const BUDGET={an:1200000,di:500000,mua:600000};
const fmt=n=>IS_MASKED ? '••••••' : String(n).replace(/\\B(?=(\\d{3})+(?!\\d))/g,',');
const fmtK=n=>IS_MASKED ? '••••••' : (n>=1e6?(n/1e6).toFixed(1).replace('.0','')+'M':Math.round(n/1000)+'k');
const money=n=>IS_MASKED ? '••••••' : (fmt(n)+' đ');
const MC={};
function month(m){
  if(MC[m])return MC[m];
  const rd=mulberry32(m*977+13),days=m===11?16:m===9?30:31,items=[];
  for(let d=1;d<=days;d++){const n=1+((rd()*3)|0);
    for(let i=0;i<n;i++){const r=rd(),cat=r<.6?'an':r<.86?'di':'mua';
      if(cat==='mua'&&rd()<.45)continue;
      const t=TPL[cat][(rd()*TPL[cat].length)|0];
      items.push({id:items.length,d,cat,name:t[0],kind:t[2],amt:Math.round(t[1]*(.9+rd()*.2)/1000)*1000});}}
  const dayTot=Array(days).fill(0),cat={an:0,di:0,mua:0},wk=[0,0,0,0,0];
  items.forEach(it=>{dayTot[it.d-1]+=it.amt;cat[it.cat]+=it.amt;wk[Math.min(4,((it.d-1)/7)|0)]+=it.amt});
  const total = m === ${currentMonth} ? Math.max(REAL_TOTAL, dayTot.reduce((a,b)=>a+b,0)) : dayTot.reduce((a,b)=>a+b,0);
  if(m === ${currentMonth} && REAL_CATS) {
    if(REAL_CATS.an) cat.an = Math.max(cat.an, REAL_CATS.an);
    if(REAL_CATS.di) cat.di = Math.max(cat.di, REAL_CATS.di);
    if(REAL_CATS.mua) cat.mua = Math.max(cat.mua, REAL_CATS.mua);
  }
  return MC[m]={m,days,items,dayTot,cat,weeks:wk.slice(0,Math.ceil(days/7)),total,income:REAL_INCOME,over:dayTot.filter(v=>v>LIMIT).length};
}
const catWeeks=(M,k)=>{const w=Array(M.weeks.length).fill(0);M.items.forEach(it=>{if(it.cat===k)w[Math.min(w.length-1,((it.d-1)/7)|0)]+=it.amt});return w};
const biggest=(M,k)=>M.items.filter(i=>!k||i.cat===k).sort((a,b)=>b.amt-a.amt)[0]||{name:'chưa có',amt:0};
const dayLabels=n=>Array.from({length:n},(_,i)=>String(i+1));
const weekLabels=n=>Array.from({length:n},(_,i)=>'T'+(i+1));

/* Biểu đồ SVG */
function barsSVG(vals,limit,labels,every,aria,limLabel){
  const VW=320,VH=132,pt=16,pb=20,pl=6,pr=6,n=vals.length;
  const max=Math.max(limit*1.1,...vals)*1.04,bh=VH-pt-pb,bw=(VW-pl-pr)/n,gap=n>12?2:12;
  let s=\`<svg viewBox="0 0 \${VW} \${VH}" role="img" aria-label="\${aria}">\`;
  vals.forEach((v,i)=>{const x=pl+i*bw+gap/2,w=Math.max(2,bw-gap),h=v>0?Math.max(3,v/max*bh):0;
    s+=\`<rect class="b \${v>limit?'bad':'ok'}" x="\${x.toFixed(1)}" y="\${(pt+bh-h).toFixed(1)}" width="\${w.toFixed(1)}" height="\${h.toFixed(1)}" rx="\${Math.min(4,w/2).toFixed(1)}"/>\`;
    if(i%every===0)s+=\`<text class="ax" x="\${(x+w/2).toFixed(1)}" y="\${VH-5}" text-anchor="middle">\${labels[i]}</text>\`});
  const ly=(pt+bh*(1-limit/max)).toFixed(1);
  return s+\`<line class="lim" x1="\${pl}" x2="\${VW-pr}" y1="\${ly}" y2="\${ly}"/><text class="ax halo" x="\${VW-pr}" y="\${(ly-4)}" text-anchor="end">\${limLabel||'hạn mức '+fmtK(limit)}</text></svg>\`;
}
function lineSVG(vals,labels,aria,fmtv){
  const VW=320,VH=132,pt=22,pb=20,pl=14,pr=18,n=vals.length;
  const mn=Math.min(...vals)*.8,mx=Math.max(...vals)*1.02;
  const X=i=>pl+i*(VW-pl-pr)/(n-1),Y=v=>pt+(VH-pt-pb)*(1-(v-mn)/(mx-mn||1));
  const pts=vals.map((v,i)=>X(i).toFixed(1)+','+Y(v).toFixed(1)).join(' ');
  let s=\`<svg viewBox="0 0 \${VW} \${VH}" role="img" aria-label="\${aria}"><polygon class="area" points="\${pl},\${VH-pb} \${pts} \${X(n-1).toFixed(1)},\${VH-pb}"/><polyline class="ln" points="\${pts}"/>\`;
  vals.forEach((v,i)=>{const last=i===n-1;
    if(n<=8||last)s+=\`<circle class="dot\${last?' end':''}" cx="\${X(i).toFixed(1)}" cy="\${Y(v).toFixed(1)}" r="\${last?5:3.5}"/>\`;
    if(labels[i])s+=\`<text class="ax" x="\${X(i).toFixed(1)}" y="\${VH-5}" text-anchor="middle">\${labels[i]}</text>\`});
  return s+\`<text class="ax halo" x="\${X(n-1).toFixed(1)}" y="\${(Y(vals[n-1])-10).toFixed(1)}" text-anchor="end">\${fmtv(vals[n-1])}</text></svg>\`;
}
function stackHTML(M){
  const segs=Object.keys(CATS).map(k=>\`<i style="flex:\${Math.max(M.cat[k],1)};background:\${CATS[k].c}"></i>\`).join('');
  const leg=Object.keys(CATS).map(k=>\`<span><i style="background:\${CATS[k].c}"></i>\${CATS[k].n} \${Math.round(M.cat[k]/M.total*100)}%</span>\`).join('');
  return \`<div class="stack" role="img" aria-label="Tỉ lệ chi theo danh mục">\${segs}</div><div class="leg">\${leg}</div>\`;
}

const kpi=(l,v,cls='')=>\`<div class="kpi \${cls}"><span class="label">\${l}</span><b>\${v}</b></div>\`;
const read=t=>\`<section class="read"><canvas data-pig width="24" height="20" aria-hidden="true"></canvas><div><span class="label">Heo đọc số</span><p>\${t}</p></div></section>\`;
const card=(title,sub,inner)=>\`<section class="card chart"><div class="label">\${title}</div>\${sub?\`<p class="sub">\${sub}</p>\`:''}\${inner}</section>\`;
function grid(items){
  if(!items.length)return \`<p class="sub">Chưa có ảnh nào trong tháng này. Chụp một khoản chi để heo treo lên tường.</p>\`;
  return \`<div class="pgrid">\`+items.map(it=>\`<button class="ph" type="button" data-i="\${it.id}" aria-label="\${it.name} \${fmtK(it.amt)} đ, ngày \${it.d}"><canvas width="24" height="24" data-k="\${it.kind}"></canvas><span class="tag">\${fmtK(it.amt)} đ</span></button>\`).join('')+\`</div>\`;
}
const photosCard=(title,items)=>\`<section class="card"><div class="label">\${title}</div><div id="detail" hidden></div>\${grid(items)}</section>\`;
const topList=(items)=>\`<ul class="list">\`+items.map(it=>\`<li><span>\${it.name}<small> · ngày \${it.d}</small></span><b>\${money(it.amt)}</b></li>\`).join('')+\`</ul>\`;

function insight(id,M){
  const pct=k=>Math.round(M.cat[k]/M.total*100);
  if(id==='sanh')return M.over?\`Tháng này lố hạn mức \${M.over} ngày. Heo hơi lo, nhưng còn gỡ được.\`:'Chưa ngày nào lố hạn mức. Heo muốn ăn mừng một chút.';
  if(id==='bep')return \`Ăn uống chiếm \${pct('an')}% tháng này. Món đắt nhất là \${biggest(M,'an').name}.\`;
  if(id==='khach')return M.cat.mua?\`Mua sắm \${fmtK(M.cat.mua)} đ. Khoản to nhất là \${biggest(M,'mua').name}.\`:'Tháng này chưa mua sắm gì. Heo thấy ví nhẹ nhõm.';
  if(id==='lamviec')return \`Đi lại hết \${fmtK(M.cat.di)} đ, khoảng \${M.items.filter(i=>i.cat==='di').length} chuyến.\`;
  if(id==='ngu')return 'Hũ đã có ' + fmtK(REAL_SAVED) + ' đ. Heo ngủ ngon hơn mỗi tháng.';
  return \`Heo treo \${M.items.length} tấm ảnh lên tường. Tấm đắt nhất là \${biggest(M).name}.\`;
}

const S={month:${currentMonth || 11},grain:'thang',sel:'sanh',v:null};
const SAV={goals:[['Quỹ khẩn cấp',12400000,30000000],['Du lịch Đà Lạt',3200000,10000000],['Mua laptop',2500000,20000000]],trend:[6.2,8.1,9.4,11.9,15.6,18.1],tl:['T6','T7','T8','T9','T10','T11']};
function viewFor(id){
  const M=month(S.month),norm=(a,l)=>a.map(v=>({v:Math.min(1,v/(l*1.15)),over:v>l}));
  const kinds=(cat,n)=>{const pool=M.items.filter(i=>!cat||i.cat===cat).sort((a,b)=>b.amt-a.amt),out=[];
    pool.forEach(i=>{if(!out.includes(i.kind))out.push(i.kind)});M.items.forEach(i=>{if(!out.includes(i.kind))out.push(i.kind)});
    while(out.length<n)out.push('coin');return out.slice(0,n)};
  switch(id){
    case 'sanh':return{mini:norm(M.dayTot.slice(-12),LIMIT),frames:kinds(null,2)};
    case 'bep':return{mini:norm(catWeeks(M,'an'),BUDGET.an),frames:kinds('an',2)};
    case 'khach':return{mini:norm(catWeeks(M,'mua'),BUDGET.mua),frames:kinds('mua',2)};
    case 'lamviec':return{mini:norm(catWeeks(M,'di'),BUDGET.di),frames:kinds('di',2)};
    case 'ngu':return{mini:SAV.trend.map(v=>({v:v/20,over:false})),frames:['coin','coin']};
    default:return{mini:[],frames:kinds(null,5)};
  }
}

function panelHTML(id){
  const M=month(S.month),r=HR[id],head=\`<div class="rhead"><h2>\${r.n}</h2><span class="label">\${r.sub} · Tháng \${M.m}</span></div>\`;
  const recent=k=>M.items.filter(i=>!k||i.cat===k).slice().reverse();
  if(id==='sanh'){
    const g=S.grain,chart=g==='thang'?barsSVG(M.dayTot,LIMIT,dayLabels(M.days),5,'Chi mỗi ngày so với hạn mức'):barsSVG(M.weeks,LIMIT*7,weekLabels(M.weeks.length),1,'Chi mỗi tuần so với hạn mức','hạn mức tuần '+fmtK(LIMIT*7));
    return head+\`<div class="kpis">\${kpi('Thu',fmtK(M.income)+' đ','in')}\${kpi('Chi',fmtK(M.total)+' đ')}\${kpi('Còn lại',fmtK(M.income-M.total)+' đ','ok')}</div>\`+
      read(insight(id,M))+
      card('Chi tiêu','<span class="toggle" role="group" aria-label="Xem theo"><button class="btn" type="button" data-grain="tuan" aria-pressed="'+(g==='tuan')+'">Tuần</button><button class="btn" type="button" data-grain="thang" aria-pressed="'+(g==='thang')+'">Tháng</button></span>',chart)+
      card('Chi theo danh mục','',stackHTML(M))+
      \`<button class="btn dark wide" type="button" id="toGarden">🌱 Ra vườn chơi với heo</button>\`;
  }
  if(id==='bep'||id==='khach'){
    const k=id==='bep'?'an':'mua',w=catWeeks(M,k);
    return head+\`<div class="kpis two">\${kpi('Đã chi',fmtK(M.cat[k])+' đ')}\${kpi('Chiếm',Math.round(M.cat[k]/M.total*100)+'%')}</div>\`+read(insight(id,M))+
      card('Theo tuần','ngưỡng tuần '+fmtK(BUDGET[k])+' đ',barsSVG(w,BUDGET[k],weekLabels(w.length),1,CATS[k].n+' mỗi tuần','ngưỡng '+fmtK(BUDGET[k])))+
      card('Đắt nhất tháng','',topList(M.items.filter(i=>i.cat===k).sort((a,b)=>b.amt-a.amt).slice(0,3)))+
      photosCard('Ảnh đã chụp',recent(k).slice(0,12));
  }
  if(id==='lamviec'){
    let acc=0;const cum=Array(M.days).fill(0);M.items.forEach(i=>{if(i.cat==='di')cum[i.d-1]+=i.amt});
    const cu=cum.map(v=>(acc+=v));const lb=cu.map((_,i)=>(i===0||(i+1)%5===0)?String(i+1):'');
    return head+\`<div class="kpis two">\${kpi('Đã chi',fmtK(M.cat.di)+' đ')}\${kpi('Số chuyến',M.items.filter(i=>i.cat==='di').length)}</div>\`+read(insight(id,M))+
      card('Tích lũy tiền đi lại','cộng dồn theo ngày',lineSVG(cu,lb,'Tiền đi lại cộng dồn',v=>fmtK(v)+' đ'))+
      photosCard('Ảnh đã chụp',recent('di').slice(0,12));
  }
  if(id==='ngu'){
    const goals=SAV.goals.map(([n,a,b])=>\`<div class="goal"><div class="grow"><b>\${n}</b><span>\${fmtK(a)} / \${fmtK(b)} đ</span></div><div class="bar"><i style="width:\${Math.round(a/b*100)}%"></i></div></div>\`).join('');
    return head+\`<div class="kpis two">\${kpi('Tổng hũ',fmtK(REAL_SAVED)+' đ','ok')}\${kpi('Chuỗi Streak','3 ngày')}</div>\`+read(insight(id,M))+
      card('Mục tiêu tiết kiệm','',goals)+card('Số dư 6 tháng','đơn vị triệu đồng',lineSVG(SAV.trend,SAV.tl,'Số dư hũ 6 tháng gần nhất',v=>v+'M'));
  }

  // PHÒNG ẢNH: Hiển thị ảnh chụp thực tế từ app hoặc Empty State không hardcore
  let photoContentHtml = '';
  const hasRealPhotos = Array.isArray(REAL_PHOTOS) && REAL_PHOTOS.length > 0;
  if(hasRealPhotos){
    const photoItems = REAL_PHOTOS.map(p => \`
      <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--card);border:2px solid var(--ink);border-radius:14px;margin-bottom:8px;box-shadow:0 2px 0 var(--ink);">
        \${p.url ? \`<img src="\${p.url}" style="width:48px;height:48px;border-radius:10px;object-fit:cover;border:2px solid var(--ink);flex:none;" />\` : \`<div style="width:48px;height:48px;border-radius:10px;background:#F2E7FA;border:2px solid var(--ink);display:grid;place-items:center;font-size:20px;flex:none;">📸</div>\`}
        <div style="flex:1;min-width:0;">
          <b style="font-size:14px;color:var(--ink);display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">\${p.name || 'Khoản chi'}</b>
          <span style="font-size:12px;color:var(--muted);font-weight:700;">\${p.date ? new Date(p.date).toLocaleDateString('vi-VN') : ''}</span>
        </div>
        <b style="font-size:14px;color:var(--ink);font-weight:800;flex:none;">\${fmtK(p.amount || 0)} đ</b>
      </div>
    \`).join('');
    photoContentHtml = \`<section class="card"><div class="label">Ảnh đã chụp (\${REAL_PHOTOS.length})</div><div style="margin-top:10px;">\${photoItems}</div></section>\`;
  } else {
    photoContentHtml = \`
      <section class="card">
        <div class="label">Bức tường ảnh</div>
        <div style="text-align:center;padding:24px 12px;color:var(--muted);">
          <div style="font-size:36px;margin-bottom:8px;">🖼️</div>
          <b style="font-size:14px;color:var(--ink);display:block;">Chưa có bức ảnh nào trong tháng này</b>
          <p style="font-size:12px;margin-top:4px;font-weight:600;color:var(--muted);">Nhấn nút trên để cùng chú heo chụp lại bữa ăn hay món đồ yêu thích nhé!</p>
        </div>
      </section>
    \`;
  }

  return head+
    \`<button class="btn dark wide" type="button" id="goBooth" style="margin-bottom:12px;">📸 Heo ơi, đi chụp ảnh</button>\`+
    \`<div class="kpis two">\${kpi('Ảnh trong tháng', hasRealPhotos ? REAL_PHOTOS.length : 0)}\${kpi('Tổng chi',fmtK(M.total)+' đ')}</div>\`+
    read(hasRealPhotos ? \`Heo đã treo \${REAL_PHOTOS.length} tấm ảnh chụp thực tế lên tường!\` : 'Tường ảnh đang trống. Hãy chụp tấm ảnh đầu tiên cùng heo nhé!')+
    photoContentHtml;
}

/* LOGIC CANVAS & HOẠT HỌA */
const mapC=document.getElementById('map'),mapX=mapC.getContext('2d'),roomC=document.getElementById('room'),roomX=roomC.getContext('2d');
const hp=mk(24,20,()=>{}),hpx=hp.getContext('2d');
let hRun=false,hLast=0,tourOn=false,tourWait=0,b2Until=0;
const mp={x:88,y:98,face:1,frame:0,ft:0,wp:[],room:'sanh',target:null,moving:false};
const rp={x:90,y:82,face:1,mode:'idle',t:0,dur:2,tx:0,ty:0,frame:0,ft:0,present:true,after:null,jump:0};

function pigBlit(c,x,y,face,o,jump){
  hpx.clearRect(0,0,24,20);drawPigSprite(hpx,o);
  const sw=Math.round(7-jump*.5);R(c,Math.round(x)-sw,Math.round(y)-1,sw*2,2,'rgba(40,25,10,.22)');
  c.save();
  if(face<0){c.translate(Math.round(x+11),Math.round(y-18-jump));c.scale(-1,1);c.drawImage(hp,0,0)}
  else c.drawImage(hp,Math.round(x-11),Math.round(y-18-jump));
  c.restore();
}

function routeTo(id){
  const r=HR[id],tx=r.cx+((Math.random()*14-7)|0),ty=FLOOR_Y[r.row],lvl=mp.y>=96?1:mp.y<=56?0:-1;
  const A=[STAIR.x0,STAIR.y0],B=[STAIR.x1,STAIR.y1];let wp;
  if(r.row===1)wp=lvl===1?[[tx,ty]]:lvl===0?[B,A,[tx,ty]]:[A,[tx,ty]];
  else wp=lvl===0?[[tx,ty]]:lvl===1?[A,B,[tx,ty]]:[B,[tx,ty]];
  mp.target=id;mp.wp=wp;mp.moving=true;
}
function arrive(){
  mp.room=mp.target;mp.moving=false;
  if(S.sel===mp.room)enterRoomView();
  if(tourOn)tourWait=5.5;
}
function updMap(dt){
  if(!mp.wp.length){mp.moving=false;return}
  mp.moving=true;const tx=mp.wp[0][0],ty=mp.wp[0][1],dx=tx-mp.x,dy=ty-mp.y,d=Math.hypot(dx,dy);
  if(d<1){mp.wp.shift();if(!mp.wp.length)arrive();return}
  const st=Math.min(d,36*dt);mp.x+=dx/d*st;mp.y+=dy/d*st;
  if(Math.abs(dx)>.3)mp.face=dx>0?1:-1;
  mp.ft+=dt;if(mp.ft>.18){mp.ft=0;mp.frame^=1}
}

const b2=document.getElementById('bubble2');
function say2(t,ms){b2.textContent=t;b2.classList.add('on');b2Until=performance.now()+(ms||3200)}
function placeB2(){
  if(performance.now()>b2Until||!rp.present){b2.classList.remove('on');return}
  b2.style.left=Math.max(26,Math.min(74,rp.x/176*100))+'%';
  b2.style.top=Math.max(22,(rp.y-24-rp.jump)/96*100)+'%';
}
function enterRoomView(){
  rp.present=true;rp.x=S.sel==='sanh'?22:-8;rp.y=80+((Math.random()*8)|0);rp.face=1;
  if(pendingBooth && S.sel==='anh'){
    pendingBooth=false;
    rp.x=148;rp.y=84;
    rp.mode='idle';rp.t=0;rp.dur=12;
  }else{
    rp.mode='walk';rp.tx=50+Math.random()*90;rp.ty=rp.y;rp.after=()=>{rp.mode='idle';rp.t=0;rp.dur=1.5};
  }
  say2(insight(S.sel,month(S.month)),4200);
}
function updRoom(dt){
  if(!rp.present)return;rp.t+=dt;rp.ft+=dt;
  if(rp.mode==='happy'){rp.jump=Math.abs(Math.sin(rp.t*9))*5;if(rp.t>rp.dur){rp.jump=0;rp.mode='idle';rp.t=0;rp.dur=1.5}return}
  if(rp.mode==='idle'){
    if(rp.t>rp.dur){rp.mode='walk';rp.tx=16+Math.random()*140;rp.ty=72+Math.random()*20;rp.after=()=>{rp.mode='idle';rp.t=0;rp.dur=1.5+Math.random()*2.5}}
    return;
  }
  const dx=rp.tx-rp.x,dy=rp.ty-rp.y,d=Math.hypot(dx,dy);
  if(d<1.2){const a=rp.after;rp.after=null;if(a)a();else{rp.mode='idle';rp.t=0;rp.dur=2}return}
  const st=Math.min(d,24*dt);rp.x+=dx/d*st;rp.y+=dy/d*st;if(Math.abs(dx)>.5)rp.face=dx>0?1:-1;
  if(rp.ft>.2){rp.ft=0;rp.frame^=1}
}
function tourTick(dt){
  if(!tourOn||mp.moving||!rp.present)return;
  if(tourWait>0){tourWait-=dt;if(tourWait<=0)selectRoom(ROOM_ORDER[(ROOM_ORDER.indexOf(S.sel)+1)%ROOM_ORDER.length])}
}

function hFrame(now){
  const dt=Math.min(.05,(now-hLast)/1000),t=now/1000;hLast=now;
  updMap(dt);updRoom(dt);tourTick(dt);
  if(bs.flash>0)bs.flash=Math.max(0,bs.flash-dt*3);
  const boothBtn=document.getElementById('boothBtn');
  if(boothBtn){
    boothBtn.hidden=!(S.sel==='anh'&&rp.present&&!bs.closed&&Math.hypot(rp.x-148,rp.y-84)<28);
  }
  drawMap(mapX,t,S.sel);
  pigBlit(mapX,mp.x,mp.y,mp.face,{pose:mp.moving?'walk':'stand',frame:mp.frame,mood:'ok',blink:(t%3.2)<.12,tail:Math.floor(t*3)%2===1},0);
  drawRoom(roomX,S.sel,t,S.v);
  if(rp.present)pigBlit(roomX,rp.x,rp.y,rp.face,{pose:rp.mode==='walk'?'walk':'stand',frame:rp.frame,mood:'ok',happy:rp.mode==='happy',blink:(t%3.2)<.12,tail:Math.floor(t*3)%2===1},rp.jump);
  placeB2();
  requestAnimationFrame(hFrame);
}

function paintPanel(){
  const p=document.getElementById('panel');p.innerHTML=panelHTML(S.sel);
  p.querySelectorAll('canvas[data-k]').forEach(cv=>photo(cv.getContext('2d'),cv.dataset.k,0,0));
  p.querySelectorAll('canvas[data-pig]').forEach(cv=>{const x=cv.getContext('2d');drawPigSprite(x,{pose:'stand',frame:0,mood:'ok'})});
}
function refresh(){
  const M=month(S.month);S.v=viewFor(S.sel);paintPanel();
  document.querySelectorAll('#roomChips .btn').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.room===S.sel)));
  document.querySelectorAll('#months .btn').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.m===S.month)));
  document.getElementById('roomTag').textContent=HR[S.sel].n+' · '+HR[S.sel].sub;
  document.getElementById('hsub').textContent=\`Tháng \${M.m} 2026 · chi \${fmtK(M.total)} đ · \${M.items.length} biên lai\`;
}
function selectRoom(id){
  if(!HR[id]||(id===S.sel&&(rp.present||mp.target===id)))return;
  S.sel=id;refresh();
  if(mp.moving&&mp.target===id){rp.present=false;return}
  if(!mp.moving&&mp.room===id){enterRoomView();return}
  rp.present=false;routeTo(id);

  try {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'ROOM_SELECTED',
        room: { id, name: HR[id].n, subtitle: HR[id].sub }
      }));
    }
  } catch(e) {}
}
window.selectRoom = selectRoom;

ROOM_ORDER.forEach(id=>{
  const b=document.createElement('button');b.type='button';b.className='btn';b.dataset.room=id;b.textContent=HR[id].n;
  b.addEventListener('click',()=>selectRoom(id));document.getElementById('roomChips').appendChild(b);
  const r=HR[id],o=document.createElement('button');o.type='button';o.setAttribute('aria-label',\`\${r.n}, \${r.sub}\`);
  o.style.cssText=\`left:\${r.x/176*100}%;top:\${r.y/108*100}%;width:\${r.w/176*100}%;height:\${r.h/108*100}%\`;
  o.addEventListener('click',()=>selectRoom(id));document.getElementById('mapbtns').appendChild(o);
});

function walkRoomTo(x,y,dur){
  rp.mode='walk';rp.t=0;rp.tx=x;rp.ty=y;
  rp.after=()=>{rp.mode='idle';rp.t=0;rp.dur=dur||1.5};
}
function goBooth(){
  if(S.sel!=='anh'){
    pendingBooth=true;
    selectRoom('anh');
    return;
  }
  if(!rp.present||bs.closed)return;
  walkRoomTo(148,84,12);
  say2('Heo ra máy chụp ảnh nè 📸',2000);
}
function useBooth(){
  if(bs.closed)return;
  bs.closed=true;bs.pigIn=true;rp.present=false;
  const bBtn=document.getElementById('boothBtn');if(bBtn)bBtn.hidden=true;
  say2('1... 2... 3... Cười lên nào! ✨',1200);
  setTimeout(()=>{
    bs.flash=1;
  },600);
  setTimeout(()=>{
    try{
      if(window.ReactNativeWebView){
        window.ReactNativeWebView.postMessage(JSON.stringify({type:'OPEN_CAMERA'}));
      }else if(window.parent){
        window.parent.postMessage(JSON.stringify({type:'OPEN_CAMERA'}),'*');
      }
    }catch(e){}
    setTimeout(()=>{
      bs.closed=false;bs.pigIn=false;bs.flash=0;
      rp.present=true;rp.x=148;rp.y=84;
    },800);
  },1250);
}

const bBtn=document.getElementById('boothBtn');
if(bBtn)bBtn.addEventListener('click',useBooth);

roomC.addEventListener('pointerdown',e=>{
  if(!rp.present||bs.closed)return;
  const r=roomC.getBoundingClientRect(),
        x=(e.clientX-r.left)/r.width*176,
        y=(e.clientY-r.top)/r.height*96;
  if(S.sel==='anh'&&x>=126&&y<72){
    goBooth();
    return;
  }
  walkRoomTo(Math.min(156,Math.max(16,x)),Math.min(92,Math.max(72,y)),2);
});

[9,10,11].forEach(m=>{const b=document.createElement('button');b.type='button';b.className='btn';b.dataset.m=m;b.textContent='Tháng '+m;
  b.addEventListener('click',()=>{S.month=m;refresh();if(rp.present)say2(insight(S.sel,month(m)),3200)});document.getElementById('months').appendChild(b)});

document.getElementById('panel').addEventListener('click',e=>{
  const g=e.target.closest('[data-grain]');
  if(g){S.grain=g.dataset.grain;paintPanel();return}
  if(e.target.closest('#toGarden')){
    try {
      if(window.ReactNativeWebView){
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'EXIT_TO_GARDEN' }));
      }
    } catch(err){}
    return;
  }
  if(e.target.closest('#goBooth')){
    goBooth();
    return;
  }
  if(e.target.closest('[data-close]')){document.getElementById('detail').hidden=true;return}
  const ph=e.target.closest('.ph');
  if(ph){
    const it=month(S.month).items[+ph.dataset.i],d=document.getElementById('detail');
    const line=it.amt<60000?'Nhẹ nhàng. Heo gật đầu một cái.':it.amt<150000?'Cũng vừa phải. Heo ghi vào sổ rồi.':'Khoản này hơi to. Heo liếc hạn mức một chút.';
    d.innerHTML=\`<div class="dcard"><canvas width="24" height="24" data-k="\${it.kind}" aria-hidden="true"></canvas><div><b>\${it.name}</b><span>−\${money(it.amt)} · ngày \${it.d} tháng \${S.month}</span><p>\${line}</p></div><button class="btn round" type="button" data-close aria-label="Đóng chi tiết">×</button></div>\`;
    d.hidden=false;photo(d.querySelector('canvas').getContext('2d'),it.kind,0,0);
    d.scrollIntoView({block:'nearest',behavior:'smooth'});
    if(rp.present){rp.mode='happy';rp.t=0;rp.dur=1}
  }
});

const tourBtn = document.getElementById('tourBtn');
tourBtn.addEventListener('click',()=>{
  tourOn=!tourOn;tourBtn.setAttribute('aria-pressed',String(tourOn));tourBtn.textContent=tourOn?'Dừng tham quan':'Tham quan';
  if(tourOn)tourWait=rp.present?1:0;
});
window.toggleTour = () => tourBtn.click();

const magBtn = document.getElementById('magBtn');
if (magBtn) {
  magBtn.addEventListener('click', () => {
    try {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'OPEN_MAGAZINE' }));
      } else if (window.parent) {
        window.parent.postMessage(JSON.stringify({ type: 'OPEN_MAGAZINE' }), '*');
      }
    } catch(e) {}
  });
}

const maskBtn = document.getElementById('maskBtn');
if (maskBtn) {
  maskBtn.addEventListener('click', () => {
    try {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'TOGGLE_MASK' }));
      } else if (window.parent) {
        window.parent.postMessage(JSON.stringify({ type: 'TOGGLE_MASK' }), '*');
      }
    } catch(e) {}
  });
}

window.syncData = function(data) {
  if (!data) return;
  if (typeof data.dailyLimit === 'number') LIMIT = data.dailyLimit;
  if (typeof data.totalSpent === 'number') REAL_TOTAL = data.totalSpent;
  if (typeof data.monthlyIncome === 'number') REAL_INCOME = data.monthlyIncome;
  if (typeof data.savedAmount === 'number') REAL_SAVED = data.savedAmount;
  if (data.categorySpent) REAL_CATS = data.categorySpent;
  if (typeof data.streak === 'number') {
    STREAK = data.streak;
    const subEl = document.getElementById('topSub');
    if (subEl) subEl.textContent = 'Tháng ' + S.month + ' · Chuỗi ' + STREAK + ' ngày';
  }
  if (typeof data.isMasked === 'boolean') {
    IS_MASKED = data.isMasked;
    if (maskBtn) {
      maskBtn.textContent = IS_MASKED ? '🙈' : '👁️';
      maskBtn.setAttribute('aria-label', IS_MASKED ? 'Hiện số tiền' : 'Ẩn số tiền');
    }
  }
  if (typeof data.currentMonth === 'number') {
    delete MC[data.currentMonth];
  }
  if (Array.isArray(data.photos)) {
    REAL_PHOTOS = data.photos;
  }
  refresh();
};

drawFace(document.getElementById('hface').getContext('2d'));
refresh();
hLast=performance.now();
requestAnimationFrame(hFrame);

})();
</script>
</body>
</html>
  `, [isPink]);

  const memoizedSource = useMemo(() => ({ html: initialHtml }), [initialHtml]);

  // Chưa từng mở Tab 1: render hộp nền nhẹ (0 tốn tài nguyên WebKit)
  if (!hasMountedOnce) {
    return (
      <View
        style={[
          styles.container,
          { width: boxWidth, height: boxHeight, alignItems: 'center', justifyContent: 'center', backgroundColor: isPink ? '#FFF0F3' : '#F6EEDC' },
          style,
        ]}
      >
        <Text style={{ fontSize: 24 }}>🐷</Text>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { backgroundColor: isPink ? '#FFF0F3' : '#F6EEDC' }, style]}>
        <iframe
          srcDoc={initialHtml}
          style={{ width: '100%', height: '100%', border: 'none', backgroundColor: isPink ? '#FFF0F3' : '#F6EEDC' }}
          title="Pixel House"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: boxWidth, height: boxHeight, backgroundColor: isPink ? '#FFF0F3' : '#F6EEDC' }, style]}>
      {hasError ? (
        <View style={[styles.errorContainer, { backgroundColor: isPink ? '#FFF0F3' : '#F6EEDC' }]}>
          <Text style={{ fontSize: 36, marginBottom: 12 }}>🏠</Text>
          <Text style={styles.errorTitle}>Nhà của Heo cần mở lại</Text>
          <Text style={styles.errorSub}>Chạm vào nút bên dưới để tải lại</Text>
          <Pressable
            onPress={() => {
              setHasError(false);
              setReloadKey((k) => k + 1);
            }}
            style={styles.retryBtn}
          >
            <Text style={styles.retryText}>🐷 Mở lại Nhà của Heo</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {!isLoaded && (
            <View style={styles.loadingOverlay}>
              <Text style={{ fontSize: 28, marginBottom: 8 }}>🐷</Text>
              <Text style={styles.loadingText}>Đang mở cửa Nhà của Heo...</Text>
            </View>
          )}
          <SafeWebView
            key={`pig-house-${reloadKey}`}
            ref={webViewRef}
            source={memoizedSource}
            originWhitelist={['*']}
            containerStyle={{ width: boxWidth, height: boxHeight, flex: 0, backgroundColor: '#FFF0F3' }}
            style={{ width: boxWidth, height: boxHeight, flex: 0, backgroundColor: '#FFF0F3' }}
            scrollEnabled={true}
            bounces={true}
            showsVerticalScrollIndicator={false}
            automaticallyAdjustContentInsets={false}
            contentInsetAdjustmentBehavior="never"
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            onLoadEnd={() => {
              setIsLoaded(true);
              setHasError(false);
              syncDataToWebView();
            }}
            onError={() => setHasError(true)}
            onHttpError={() => setHasError(true)}
            onContentProcessDidTerminate={() => setReloadKey((k) => k + 1)}
            onMessage={(event: any) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.type === 'ROOM_SELECTED' && onSelectRoom) {
                  onSelectRoom({
                    id: data.room.id,
                    name: data.room.name,
                    category: data.room.id === 'bep' ? 'an_uong' : data.room.id === 'khach' ? 'mua_sam' : data.room.id === 'lamviec' ? 'di_chuyen' : 'all',
                    subtitle: data.room.subtitle,
                  });
                } else if (data.type === 'EXIT_TO_GARDEN' && onExitToGarden) {
                  onExitToGarden();
                } else if (data.type === 'OPEN_MAGAZINE' && onOpenMagazine) {
                  onOpenMagazine();
                } else if (data.type === 'TOGGLE_MASK' && onToggleMask) {
                  onToggleMask();
                } else if (data.type === 'OPEN_CAMERA' && onOpenCamera) {
                  onOpenCamera();
                }
              } catch (e) {}
            }}
          />
        </>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F6EEDC',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6EEDC',
    zIndex: 2,
  },
  loadingText: {
    fontSize: 14,
    color: '#85735E',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6EEDC',
    padding: 24,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2B2118',
    marginBottom: 6,
  },
  errorSub: {
    fontSize: 13,
    color: '#85735E',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: '#F4B93B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#2B2118',
  },
  retryText: {
    color: '#2B2118',
    fontWeight: '800',
    fontSize: 15,
  },
});
