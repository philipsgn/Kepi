import React, { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { buildOpenRoomEngineScript } from '../pixel/pixelOpenRoomEngine';
import { buildMarketPaletteScript } from './market/marketPalette';
import { buildMarketCrowdScript } from './market/marketCrowd';
import { buildMarketArchitectureScript } from './market/marketArchitecture';
import { buildMarketStallsScript } from './market/marketStalls';

interface BenThanhMarketBannerWebViewProps {
  active?: boolean;
  shoppingTotalText: string;
  foodTotalText: string;
  visitsCount: number;
  selectedZone?: number;
  onExitToMap?: () => void;
  onSelectZoneFromCanvas?: (zoneIdx: number) => void;
}

/**
 * Đại Thế Giới Lòng Chợ Bến Thành 32-Bit Indie Pixel Art (1200×480, Dynamic 1:1 Square Pixel — Quyết định 213)
 * - 2 Cổng Vòm Tròn Nằm Dọc 2 Đầu (Cửa Nam bên trái x: 0..72 & Cửa Bắc bên phải x: 1128..1200) giấu hoàn toàn không gian bên ngoài.
 * - Dãy Bắc kín ngang 7 shop sát vách nhau: Áo Dài Sài Gòn (từ Cửa 1 cũ) -> Hương Trinh -> Liên Sài Gòn -> Vòm Khu Ăn Uống -> Bánh Cuốn/Bèo -> Phở Bò -> Thời Trang Sài Gòn (từ Cửa Bắc cũ).
 * - Tầng Trung Tâm (6 đảo) & Tầng Nam (6 sạp) xếp sát sát kề kề nhau (khe hẻm 20px) + Va chạm AABB chuẩn xác.
 */
export const BenThanhMarketBannerWebView: React.FC<BenThanhMarketBannerWebViewProps> = ({
  active = true,
  shoppingTotalText,
  foodTotalText,
  visitsCount,
  selectedZone,
  onExitToMap,
  onSelectZoneFromCanvas,
}) => {
  const webViewRef = useRef<any>(null);
  const iframeRef = useRef<any>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (typeof selectedZone !== 'number') return;
    const js = `window.__mkGo && window.__mkGo(${selectedZone}); true;`;
    if (Platform.OS === 'web') {
      try {
        iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ type: 'GO_ZONE', zone: selectedZone }), '*');
      } catch (_e) {}
      return;
    }
    webViewRef.current?.injectJavaScript?.(js);
  }, [selectedZone]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    webViewRef.current?.injectJavaScript?.(
      `window.__mkSetActive && window.__mkSetActive(${active ? 'true' : 'false'}); true;`
    );
  }, [active]);

  const handleRoomPayload = (d: any) => {
    if (!d) return;
    if (d.type === 'HAPTIC_LIGHT') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else if (d.type === 'ROOM_ACTION') {
      if ((d.id === 'exit_market' || d.id === 'exit_back_gate') && d.userTriggered && onExitToMap) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
        exitTimerRef.current = setTimeout(() => {
          onExitToMap();
        }, 120);
      } else if (d.id === 'stall_liensaigon' && onSelectZoneFromCanvas) {
        onSelectZoneFromCanvas(1);
      } else if (d.id === 'arch_foodcourt' && onSelectZoneFromCanvas) {
        onSelectZoneFromCanvas(2);
      } else if (d.id === 'stall_banhcuon_banhbeo' && onSelectZoneFromCanvas) {
        onSelectZoneFromCanvas(3);
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
  }, [onExitToMap, onSelectZoneFromCanvas]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      handleRoomPayload(data);
    } catch (_e) {}
  };

  const openRoomScript = useMemo(
    () =>
      buildOpenRoomEngineScript({
        canvasId: 'mkCv',
        worldWidth: 1200,
        worldHeight: 760,
        viewWidth: 220,
        viewHeight: 320,
        walkBounds: { minX: 16, maxX: 1184, minY: 168, maxY: 742 },
        initialX: 180,
        initialY: 186,
        initialCamX: 40,
        initialCamY: 40,
        speed: 58,
        obstacles: [
          // Hàng 1: 9 shop Bắc (y: 120..166)
          { x: 0, y: 120, w: 112, h: 46 },
          { x: 116, y: 120, w: 128, h: 46 },
          { x: 248, y: 120, w: 136, h: 46 },
          { x: 388, y: 120, w: 144, h: 46 },
          { x: 536, y: 120, w: 148, h: 46 },
          { x: 688, y: 120, w: 132, h: 46 },
          { x: 824, y: 120, w: 132, h: 46 },
          { x: 960, y: 120, w: 124, h: 46 },
          { x: 1088, y: 120, w: 112, h: 46 },
          // Hàng 2 (y: 206..266)
          { x: 54, y: 208, w: 140, h: 52 },
          { x: 212, y: 218, w: 128, h: 50 },
          { x: 358, y: 208, w: 126, h: 50 },
          { x: 502, y: 220, w: 146, h: 48 },
          { x: 666, y: 208, w: 120, h: 50 },
          { x: 804, y: 218, w: 124, h: 50 },
          { x: 946, y: 208, w: 190, h: 52 },
          // Hàng 3 (y: 308..364)
          { x: 42, y: 310, w: 146, h: 46 },
          { x: 204, y: 318, w: 136, h: 46 },
          { x: 356, y: 308, w: 142, h: 46 },
          { x: 514, y: 316, w: 158, h: 46 },
          { x: 688, y: 308, w: 144, h: 46 },
          { x: 848, y: 318, w: 144, h: 46 },
          { x: 1008, y: 310, w: 154, h: 46 },
          // Hàng 4 (y: 406..464)
          { x: 36, y: 414, w: 152, h: 46 },
          { x: 204, y: 406, w: 146, h: 46 },
          { x: 366, y: 416, w: 142, h: 46 },
          { x: 524, y: 412, w: 160, h: 46 },
          { x: 700, y: 406, w: 144, h: 46 },
          { x: 860, y: 416, w: 144, h: 46 },
          { x: 1020, y: 408, w: 156, h: 46 },
          // Hàng 5 (y: 508..564)
          { x: 44, y: 510, w: 148, h: 46 },
          { x: 208, y: 518, w: 142, h: 46 },
          { x: 366, y: 508, w: 146, h: 46 },
          { x: 528, y: 516, w: 152, h: 46 },
          { x: 696, y: 508, w: 146, h: 46 },
          { x: 858, y: 518, w: 142, h: 46 },
          { x: 1016, y: 510, w: 160, h: 46 },
          // Hàng 6 (y: 608..668)
          { x: 4, y: 608, w: 124, h: 52 },
          { x: 144, y: 620, w: 132, h: 50 },
          { x: 292, y: 610, w: 132, h: 52 },
          { x: 440, y: 626, w: 154, h: 44 },
          { x: 610, y: 610, w: 132, h: 52 },
          { x: 758, y: 620, w: 134, h: 50 },
          { x: 908, y: 610, w: 138, h: 52 },
          { x: 1062, y: 618, w: 134, h: 52 },
        ],
        hotspots: [
          {
            id: 'exit_market',
            x: 0,
            y: 350,
            w: 28,
            h: 58,
            standX: 34,
            standY: 382,
            standFace: -1,
            actionType: 'jump_joy',
            fastDash: true,
            bubbleText: `Bước qua Cổng Vòm Nam ra phố...`,
          },
          {
            id: 'exit_back_gate',
            x: 1172,
            y: 350,
            w: 28,
            h: 58,
            standX: 1166,
            standY: 382,
            standFace: 1,
            actionType: 'jump_joy',
            fastDash: true,
            bubbleText: `Bước qua Cổng Vòm Bắc ra phố...`,
          },
          {
            id: 'stall_newspaper',
            x: 0,
            y: 56,
            w: 112,
            h: 110,
            standX: 56,
            standY: 184,
            standFace: 1,
            actionType: 'check_ledger',
            bubbleText: `Sạp Báo Chí, Giấy Tờ & Vé Số Sài Gòn!`,
          },
          {
            id: 'stall_aodai',
            x: 116,
            y: 56,
            w: 128,
            h: 110,
            standX: 180,
            standY: 184,
            standFace: 1,
            actionType: 'look_window',
            bubbleText: `Áo Dài Sài Gòn & Đồng Hồ · Mua sắm ${shoppingTotalText}`,
          },
          {
            id: 'stall_clothing',
            x: 248,
            y: 56,
            w: 136,
            h: 110,
            standX: 316,
            standY: 184,
            standFace: 1,
            actionType: 'check_ledger',
            bubbleText: `Sạp Vải & Giày Dép Hương Trinh · Mua sắm ${shoppingTotalText}`,
          },
          {
            id: 'stall_liensaigon',
            x: 388,
            y: 56,
            w: 144,
            h: 110,
            standX: 460,
            standY: 184,
            standFace: 1,
            actionType: 'check_ledger',
            bubbleText: `Sạp Liên Sài Gòn & Ngọc Hoa 823 · Trà Cà Phê Đặc Sản`,
          },
          {
            id: 'arch_foodcourt',
            x: 536,
            y: 44,
            w: 148,
            h: 122,
            standX: 610,
            standY: 184,
            standFace: 1,
            actionType: 'look_window',
            bubbleText: `Khu Ăn Uống Sạp 1044 · ${visitsCount} quán quen`,
          },
          {
            id: 'stall_banhcuon_banhbeo',
            x: 688,
            y: 56,
            w: 132,
            h: 110,
            standX: 754,
            standY: 184,
            standFace: 1,
            actionType: 'eat_snack',
            bubbleText: `Bánh Cuốn 50K & Bánh Bèo 20K · Ăn uống ${foodTotalText}`,
          },
          {
            id: 'stall_pho',
            x: 824,
            y: 56,
            w: 132,
            h: 110,
            standX: 890,
            standY: 184,
            standFace: 1,
            actionType: 'eat_snack',
            bubbleText: `Phở Bò & Bún Bò Huế Nóng Hổi · Ăn uống ${foodTotalText}`,
          },
          {
            id: 'stall_thoitrang',
            x: 960,
            y: 56,
            w: 124,
            h: 110,
            standX: 1022,
            standY: 184,
            standFace: -1,
            actionType: 'check_ledger',
            bubbleText: `Shop Thời Trang Sài Gòn · Quần Áo & Túi Xách`,
          },
          {
            id: 'stall_offering',
            x: 1088,
            y: 56,
            w: 112,
            h: 110,
            standX: 1144,
            standY: 184,
            standFace: -1,
            actionType: 'look_window',
            bubbleText: `Sạp Đồ Cúng, Nhang Đèn & Vàng Mã Chợ Bến Thành!`,
          },
          {
            id: 'island_fruit',
            x: 54,
            y: 224,
            w: 140,
            h: 60,
            standX: 124,
            standY: 306,
            standFace: 1,
            actionType: 'eat_snack',
            bubbleText: `Trái Cây 1029 Ngọc Hảo · Xoài Cát, Thanh Long & Dừa Tươi!`,
          },
          {
            id: 'island_seafood',
            x: 212,
            y: 238,
            w: 128,
            h: 56,
            standX: 276,
            standY: 312,
            standFace: 1,
            actionType: 'look_window',
            bubbleText: `Hải Sản Tươi Đá Bào · Tôm Cua Mực Tươi Rói!`,
          },
          {
            id: 'island_veg',
            x: 358,
            y: 226,
            w: 126,
            h: 58,
            standX: 420,
            standY: 306,
            standFace: 1,
            actionType: 'look_window',
            bubbleText: `Nông Sản & Rau Củ Tươi Sạch Chợ Bến Thành!`,
          },
          {
            id: 'island_dining',
            x: 502,
            y: 240,
            w: 146,
            h: 54,
            standX: 575,
            standY: 312,
            standFace: 1,
            actionType: 'sip_coffee',
            bubbleText: `Bàn Ăn Khu Ẩm Thực 1 · Bún bò, Bánh xèo & Trà đá!`,
          },
          {
            id: 'island_houseware',
            x: 666,
            y: 226,
            w: 120,
            h: 58,
            standX: 726,
            standY: 306,
            standFace: 1,
            actionType: 'check_ledger',
            bubbleText: `Dụng Cụ Hằng Ngày & Đồ Gia Dụng Bếp Núc!`,
          },
          {
            id: 'island_sandals',
            x: 804,
            y: 240,
            w: 124,
            h: 54,
            standX: 866,
            standY: 312,
            standFace: 1,
            actionType: 'check_ledger',
            bubbleText: `Sạp Quần Áo & Dép Lào Giá Rẻ Đủ Màu Sắc!`,
          },
          {
            id: 'island_souvenir',
            x: 946,
            y: 224,
            w: 190,
            h: 60,
            standX: 1040,
            standY: 306,
            standFace: -1,
            actionType: 'check_ledger',
            bubbleText: `Lưu Niệm Sài Gòn · Nón Lá, Túi Cói & Gốm Bát Tràng!`,
          },
          {
            id: 'south_offering',
            x: 4,
            y: 370,
            w: 124,
            h: 58,
            standX: 66,
            standY: 452,
            standFace: 1,
            actionType: 'look_window',
            bubbleText: `Sạp Hoa Cúc Vàng & Đồ Cúng Nhang Đèn!`,
          },
          {
            id: 'south_drinks',
            x: 144,
            y: 382,
            w: 132,
            h: 56,
            standX: 210,
            standY: 456,
            standFace: 1,
            actionType: 'sip_coffee',
            bubbleText: `Xe Nước Mía & Dừa Xiêm Ướp Lạnh!`,
          },
          {
            id: 'south_snacks',
            x: 292,
            y: 372,
            w: 132,
            h: 58,
            standX: 358,
            standY: 452,
            standFace: 1,
            actionType: 'eat_snack',
            bubbleText: `Chè Ba Màu & Bánh Dân Gian Ngon Hết Sẩy!`,
          },
          {
            id: 'south_dining',
            x: 440,
            y: 388,
            w: 154,
            h: 50,
            standX: 517,
            standY: 456,
            standFace: 1,
            actionType: 'sip_coffee',
            bubbleText: `Dãy Bàn Ghế Nhựa Vỉa Hè Đông Nghẹt Du Khách!`,
          },
          {
            id: 'south_dried',
            x: 610,
            y: 374,
            w: 132,
            h: 56,
            standX: 676,
            standY: 452,
            standFace: 1,
            actionType: 'check_ledger',
            bubbleText: `Đồ Khô, Tôm Khô & Mắm Nêm Đặc Sản!`,
          },
          {
            id: 'south_coffee',
            x: 758,
            y: 382,
            w: 134,
            h: 56,
            standX: 825,
            standY: 456,
            standFace: 1,
            actionType: 'sip_coffee',
            bubbleText: `Cà Phê Sữa Đá & Sinh Tố Bơ Xoài!`,
          },
          {
            id: 'south_flowers',
            x: 908,
            y: 372,
            w: 138,
            h: 58,
            standX: 977,
            standY: 452,
            standFace: -1,
            actionType: 'look_window',
            bubbleText: `Hoa Tươi & Gốm Sơn Mài Chợ Bến Thành!`,
          },
          {
            id: 'south_stationery',
            x: 1062,
            y: 382,
            w: 134,
            h: 56,
            standX: 1129,
            standY: 456,
            standFace: -1,
            actionType: 'check_ledger',
            bubbleText: `Sạp Giấy Tờ, Sổ Tay, Báo Chí & Tạp Hóa!`,
          },
        ],
      }),
    [shoppingTotalText, foodTotalText, visitsCount]
  );

  const paletteScript = useMemo(() => buildMarketPaletteScript(), []);
  const crowdScript = useMemo(() => buildMarketCrowdScript(), []);
  const archScript = useMemo(() => buildMarketArchitectureScript(), []);
  const stallsScript = useMemo(() => buildMarketStallsScript(), []);

  const htmlContent = useMemo(
    () => `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;user-select:none}
html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#3A2D25;display:flex;align-items:center;justify-content:center}
#mkCv{
  width:100%;
  height:100%;
  display:block;
  image-rendering:pixelated;
  image-rendering:-webkit-crisp-edges;
  image-rendering:-moz-crisp-edges;
  image-rendering:crisp-edges;
  cursor:grab;
  touch-action:none;
}
</style>
<script>
window.onerror=function(msg,src,line){
  if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(JSON.stringify({type:'CONSOLE_ERROR',error:String(msg),line:line}));}
  return false;
};
</script>
</head>
<body>
<canvas id="mkCv" width="220" height="320" role="img" aria-label="Đại thế giới Chợ Bến Thành 32-bit với 2 cổng Trước/Sau, 3 tầng sạp đặc quánh, hoa quả hải sản ẩm thực, đồ lưu niệm và dòng người du khách tấp nập"></canvas>
<script>
(function(){
'use strict';

var WORLD_W=1200;
var WORLD_H=760;
var VW=220;
var VH=320;

${paletteScript}
${crowdScript}
${archScript}
${stallsScript}

var MK={bg:null,r2:null,r3:null,r4:null,r5:null,r6:null,t:0,last:0,dt:0,run:false,w:VW,h:VH};
var stuffyState={meter:0,level:0,warned:false,fleeing:false,panting:false,pantUntil:0};

function buildMarketInterior(){
  var bg=document.createElement('canvas');bg.width=WORLD_W;bg.height=WORLD_H;
  var x=bg.getContext('2d');x.imageSmoothingEnabled=false;

  drawFloorAndCeiling(x,WORLD_W,WORLD_H);
  drawSideArchGate(x,'left',WORLD_W,WORLD_H);
  drawSideArchGate(x,'right',WORLD_W,WORLD_H);
  drawNorthStalls(x);
  MK.bg=bg;

  MK.r2=mk(WORLD_W,WORLD_H,function(c){drawRow2Stalls(c);drawExtraMicroStalls(c);});
  MK.r3=mk(WORLD_W,WORLD_H,function(c){drawRow3Stalls(c);});
  MK.r4=mk(WORLD_W,WORLD_H,function(c){drawRow4Stalls(c);});
  MK.r5=mk(WORLD_W,WORLD_H,function(c){drawRow5Stalls(c);});
  MK.r6=mk(WORLD_W,WORLD_H,function(c){drawRow6Stalls(c);});
}

function drawLiveMarketEffects(x,t){
  try{
    x.save();
    // Nắng xiên từ ô giếng trời mái chợ
    x.globalAlpha=0.09;
    for(var sk=36;sk<WORLD_W;sk+=120){
      for(var dy=0;dy<110;dy+=3){R(x,sk+Math.round(dy*0.28),28+dy,42,3,'#FFF6D6');}
    }
    // Ánh sáng ấm đèn mây tre & 2 vòm cổng hai đầu
    x.globalAlpha=0.18+Math.sin(t*3)*0.04;
    [148,296,448,604,756,904,1052].forEach(function(lx){E(x,lx,54,14,10,'#FFE08A');});
    E(x,36,216,14,12,'#FFE08A');
    E(x,1164,216,14,12,'#FFE08A');
    x.restore();

    // Quạt lồng sắt công nghiệp quay mượt 60fps
    [354,604,798,966].forEach(function(fx){
      E(x,fx,72,6,6,INK);E(x,fx,72,5,5,'#334155');
      var sp=Math.max(1,Math.round(Math.abs(Math.sin(t*10+fx))*5));
      R(x,fx-sp,71,sp*2,2,'#CBD5E1');
    });

    // Khói bếp bay từ Nồi nước lèo Khu Ẩm Thực, Bánh Cuốn, Phở Bò & Bàn Ăn
    [[592,98],[706,92],[928,92],[955,94],[644,248],[696,248]].forEach(function(pt){
      for(var i=0;i<3;i++){
        var p=((t*0.95+i*0.33)%1);
        var sy=pt[1]-Math.round(p*15), stx=pt[0]+Math.round(Math.sin(t*4+i*2)*1.8);
        x.save();x.globalAlpha=0.72*(1-p);R(x,stx,sy,2,2,'#FFFBF1');x.restore();
      }
    });
  }catch(_e){}
}

function mkDraw(t){
  var x=MK.x;
  var dt=Math.min(0.05,MK.dt||0.016);
  var now=performance.now();
  var rm=window.__openRoom?window.__openRoom.state:null;
  if(window.__openRoom) window.__openRoom.step(dt,now);

  // Cơ chế Chú Heo Ngộp Thở (chỉ tự chạy vọt ra sát cổng đứng thở phì phò, không tự thoát màn hình!)
  if(rm){
    var nearGate=(rm.x<=78||rm.x>=1122);
    if(stuffyState.panting&&now>stuffyState.pantUntil){
      stuffyState.panting=false;stuffyState.meter=0;stuffyState.level=0;stuffyState.warned=false;
    }
    if(stuffyState.fleeing){
      if(nearGate||!rm.walking){
        stuffyState.fleeing=false;stuffyState.panting=true;stuffyState.pantUntil=now+4500;
        stuffyState.meter=0;stuffyState.level=0;stuffyState.warned=false;
        rm.bubbleText='Phù... ra tới cổng mới thở nổi! Chạm cổng ra phố nha!';
        rm.bubbleUntil=now+4200;
      }
    }else if(!nearGate&&!stuffyState.panting){
      var nearCnt=countNearbyCrowd(rm.x,rm.y,t);
      if(nearCnt>=2){stuffyState.meter=Math.min(1,stuffyState.meter+dt*(0.08+nearCnt*0.025));}
      else{stuffyState.meter=Math.max(0,stuffyState.meter-dt*0.18);}
      stuffyState.level=stuffyState.meter;
      if(stuffyState.meter>=0.52&&!stuffyState.warned){
        stuffyState.warned=true;
        rm.bubbleText='Ngộp quá... đông nghẹt thở luôn!!';
        rm.bubbleUntil=now+2600;
      }
      if(stuffyState.meter>=1){
        stuffyState.fleeing=true;
        var goLeft=(rm.x<WORLD_W/2);
        var gateX=goLeft?42:1158;
        rm.bubbleText='Chịu hết nổi rồi! Chạy ra cổng thở thôi!!';
        rm.bubbleUntil=now+2600;
        if(window.__openRoom&&window.__openRoom.walkTo){
          window.__openRoom.walkTo(gateX,384,{id:'breathe_gate',standFace:goLeft?-1:1,fastDash:true,bubbleText:'Phù... ra tới cổng mới thở nổi! Chạm cổng ra phố nha!'});
        }
      }
    }else{
      stuffyState.meter=Math.max(0,stuffyState.meter-dt*0.35);
      stuffyState.level=stuffyState.meter;
    }
  }

  var camX=rm?Math.round(rm.camX):0;
  var camY=rm?Math.round(rm.camY):0;

  x.save();
  x.translate(-camX,-camY);
  x.drawImage(MK.bg,0,0);
  drawLiveMarketEffects(x,t);

  // Y-Sorting 6 tầng mê cung chợ (Hàng 2..Hàng 6 + 180 người + Chú Heo)
  var pigY=rm?rm.y:186;
  var events=[
    {y:266,kind:'r2'},
    {y:362,kind:'r3'},
    {y:462,kind:'r4'},
    {y:562,kind:'r5'},
    {y:668,kind:'r6'},
    {y:pigY,kind:'pig'}
  ].sort(function(a,b){return a.y-b.y;});

  var prevY=0;
  events.forEach(function(ev){
    drawWalkingShoppers(x,t,prevY,ev.y,camX,VW);
    prevY=ev.y;
    if(ev.kind==='pig') drawPigAt(x,rm,t,stuffyState);
    else if(MK[ev.kind]) x.drawImage(MK[ev.kind],0,0);
  });
  drawWalkingShoppers(x,t,prevY,999,camX,VW);
  x.restore();

  if(window.__openRoom) window.__openRoom.drawOverlays(x,now);
}

function mkFrame(now){
  if(!MK.run)return;
  var dt=Math.min(0.05,(now-MK.last)/1000);MK.last=now;MK.dt=dt;MK.t+=dt;
  mkDraw(MK.t);requestAnimationFrame(mkFrame);
}

function applyResponsiveViewport(){
  var w=Math.max(240,window.innerWidth||360);
  var h=Math.max(320,window.innerHeight||640);
  var sc=Math.max(2,Math.round(w/192));
  VW=Math.min(260,Math.max(168,Math.ceil(w/sc)));
  VH=Math.min(356,Math.max(200,Math.ceil(h/sc)));
  var cv=document.getElementById('mkCv');
  if(cv){cv.width=VW;cv.height=VH;}
  MK.w=VW;MK.h=VH;
  if(MK.x) MK.x.imageSmoothingEnabled=false;
  if(window.__openRoom&&window.__openRoom.resize) window.__openRoom.resize(VW,VH);
}

window.__mkGo=function(zoneIdx){
  var targets=[{x:98,y:192},{x:266,y:192},{x:448,y:192},{x:654,y:192},{x:896,y:192},{x:1112,y:192}];
  var tg=targets[zoneIdx]||targets[0];
  if(window.__openRoom) window.__openRoom.walkTo(tg.x,tg.y,null);
};
window.__mkSetActive=function(v){
  if(v&&!MK.run){MK.run=true;MK.last=performance.now();requestAnimationFrame(mkFrame);}
  else if(!v){MK.run=false;}
};
window.addEventListener('message',function(ev){
  try{
    var d=typeof ev.data==='string'?JSON.parse(ev.data):ev.data;
    if(d&&d.type==='GO_ZONE'&&typeof d.zone==='number') window.__mkGo(d.zone);
  }catch(_e){}
});
window.addEventListener('resize',applyResponsiveViewport);

function mkStart(){
  var cv=document.getElementById('mkCv');
  MK.c=cv;MK.x=cv.getContext('2d');MK.x.imageSmoothingEnabled=false;
  applyResponsiveViewport();
  buildMarketInterior();
  MK.run=true;MK.last=performance.now();
  requestAnimationFrame(mkFrame);
}

${openRoomScript}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mkStart);
else mkStart();

})();
</script>
</body>
</html>`,
    [openRoomScript, paletteScript, crowdScript, archScript, stallsScript]
  );

  return (
    <View style={styles.wrap}>
      {Platform.OS === 'web' ? (
        <iframe
          ref={iframeRef}
          srcDoc={htmlContent}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' } as any}
          title="Chợ Bến Thành Toàn Màn Hình"
        />
      ) : (
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          style={styles.webView}
          containerStyle={styles.webView}
          scrollEnabled={false}
          bounces={false}
          onMessage={handleMessage}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          onContentProcessDidTerminate={() => webViewRef.current?.reload?.()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#3A2D25',
  },
  webView: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#3A2D25',
  },
});
