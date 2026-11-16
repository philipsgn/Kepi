# 🎨 01 — PIXEL GRAPHIC PORT: CODE ĐỒ HỌA GỐC TỪ PROTOTYPE (BẮT BUỘC BÁM SÁT 1:1)

> **Nguồn chân lý duy nhất của code đồ họa:** `prototype/Ví Heo Con.html` (khối `<script>`, hàm vẽ canvas + máy trạng thái).
> **Quy tắc vàng:** Code đồ họa pixel (sprite heo, mặt heo, cảnh vườn, lớp phân cách, hiệu ứng đêm) **PHẢI PORT 1:1** từ code gốc dưới đây — cấm tự chế lại hình dáng, tọa độ, bảng màu. Chỉ được điều chỉnh: (a) đổi API vẽ (canvas → PNG generator / RN View), (b) scale 4× nearest-neighbor. Mọi lệch phải ghi vào `docs/DECISIONS.md`.
> **Đích port:** `scripts/generate-pixel-garden.js` (Node → PNG asset, encode `zlib`, không native dep) + `src/utils/pixelGarden.ts` (máy trạng thái pure) + `src/components/pixel/GardenScene.tsx` (render).

---

## 1. HẰNG SỐ & TIỆN ÍCH VẼ (PORT NGUYÊN VĂN)

```js
const W=176,H=132,LIMIT=300000;             // canvas logic 176×132 (4:3)
const reduced=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}  // PRNG deterministic — GIỮ NGUYÊN để cảnh tái tạo giống hệt

// Bảng màu cảnh vườn (C) & bảng màu heo (PAL) — CẤM đổi hex
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
// Port RN: `mk` → hàm `renderLayer(w,h,drawFn)` ghi từng fillRect vào buffer RGBA rồi encode PNG (zlib) ở scale 4×.
```

**Port PNG generator:** thay mỗi `R(c,...)`/`E(c,...)` bằng setPixel vào mảng RGBA `176×132`, sau đó **phóng 4× nearest-neighbor** (mỗi pixel logic → khối 4×4) rồi encode PNG. Bảng màu giới hạn ≤ 32 màu (đếm unique hex khi generate và assert).

---

## 2. LỚP NỀN TĨNH `bg` (PORT NGUYÊN VĂN — nhà cấp 4, hiên, sân gạch hoa, ao sen, hàng rào tre, bát cám)

```js
const bg=mk(W,H,(c)=>{
  const rand=mulberry32(7);
  R(c,0,0,W,H,C.grass1);
  for(let i=0;i<460;i++)R(c,(rand()*W)|0,(58+rand()*(H-58))|0,rand()<.3?2:1,1,rand()<.55?C.grass2:C.grass3);
  for(let i=0;i<34;i++)R(c,(rand()*W)|0,(64+rand()*(H-64))|0,1,1,rand()<.5?'#FFF4D6':'#F59BB0');
  // vườn xa + cây ăn quả
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
  // nhà: tường, mái ngói, cửa chớp, cửa sổ, đèn lồng
  R(c,0,10,112,40,C.wall);R(c,0,40,112,10,C.wallShade);
  for(let i=0;i<40;i++)R(c,(rand()*110)|0,12+((rand()*30)|0),2,1,'#EAD392');
  R(c,0,0,116,11,C.roof);
  for(let y=2;y<9;y+=3){R(c,0,y,116,1,C.roofDark);for(let x=(y%2?0:3);x<116;x+=6)R(c,x,y+1,1,2,C.roofDark)}
  for(let x=0;x<116;x+=6)R(c,x,0,3,1,C.roofLight);
  R(c,0,11,112,2,'rgba(60,35,20,.22)');
  R(c,10,16,30,34,C.woodDark);R(c,12,18,12,30,C.wood);R(c,26,18,12,30,C.wood);R(c,24,18,2,30,C.woodDark);
  for(let y=20;y<48;y+=3){R(c,12,y,12,1,C.woodLight);R(c,26,y,12,1,C.woodLight)}
  R(c,22,33,1,3,C.gold);R(c,27,33,1,3,C.gold);
  R(c,50,18,6,22,'#4E9A6B');R(c,86,18,6,22,'#4E9A6B');
  for(let y=20;y<40;y+=3){R(c,51,y,4,1,'#3C7F55');R(c,87,y,4,1,'#3C7F55')}
  R(c,56,18,30,22,C.woodDark);R(c,58,20,26,18,'#BFE3E8');R(c,70,20,2,18,C.woodDark);R(c,58,28,26,2,C.woodDark);R(c,59,21,5,3,'#E8F6F7');
  R(c,54,40,34,2,C.woodLight);
  R(c,96,13,1,3,C.woodDark);R(c,94,16,5,6,C.red);R(c,95,15,3,1,C.gold);R(c,95,22,3,1,C.gold);R(c,96,23,1,2,C.gold);
  R(c,108,11,5,42,C.wood);R(c,111,11,2,42,C.woodDark);
  // hiên
  R(c,0,50,112,9,'#D9A878');for(let x=0;x<112;x+=9)R(c,x,50,1,9,'#C48F63');
  R(c,0,50,112,1,C.woodLight);R(c,0,59,112,2,'#A87650');R(c,0,61,112,2,'rgba(40,30,10,.18)');
  // chậu cây trên hiên
  R(c,43,50,8,8,'#B5603A');R(c,42,50,10,2,'#C97248');
  E(c,47,44,6,6,C.leaf1);E(c,45,42,3,3,'#6DB85A');E(c,50,45,3,3,C.leaf2);R(c,48,40,2,2,'#F59BB0');
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
```

---

## 3. LỚP `sorted` — CÂY CHUỐI & GHẾ NHỰA ĐỎ (sắp theo trục Y cùng heo)

```js
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
// Thứ tự Y-sort khi render (bắt buộc):
[{b:106,f:drawBanana},{b:86,f:drawStool},{b:pig.y,f:drawPig}].sort((a,b)=>a.b-b.b).forEach(i=>i.f());
```

---

## 4. LỚP TRƯỚC `fg` — GIÀN HOA GIẤY & CỎ (luôn vẽ SAU heo)

```js
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
```

---

## 5. SPRITE HEO 24×20 & MẶT HEO 16×16 (PORT NGUYÊN VĂN — nhận diện thương hiệu)

```js
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
  R(c,ox+11,oy+bodyDy+9,2,1,PAL.g);R(c,ox+11,oy+bodyDy+10,2,1,PAL.G);   // đồng xu vàng cổ
}
function drawFace(c){   // avatar 16×16 — dùng cho NeoAvatar trên Header
  const o=0;
  shape(c,[[1,2,4],[2,2,5]],PAL.p,o,o);shape(c,[[1,11,13],[2,10,13]],PAL.p,o,o);
  shape(c,[[3,3,12],[4,2,13],[5,2,13],[6,2,13],[7,2,13],[8,2,13],[9,2,13],[10,3,12],[11,4,11],[12,5,10]],PAL.p,o,o);
  R(c,3,2,3,1,PAL.p);R(c,10,2,3,1,PAL.p);
  shape(c,[[8,5,10],[9,5,10],[10,5,10],[11,6,9]],PAL.n,o,o);
  R(c,6,9,1,1,PAL.k);R(c,9,9,1,1,PAL.k);
  R(c,4,5,2,2,PAL.k);R(c,10,5,2,2,PAL.k);R(c,4,5,1,1,PAL.w);R(c,10,5,1,1,PAL.w);
  R(c,3,8,1,1,PAL.s);R(c,12,8,1,1,PAL.s);
}
const HEART=[[0,1,0,1,0],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0]];   // trái tim happy 5×4
function heart(c,x,y,col){c.fillStyle=col;HEART.forEach((r,j)=>r.forEach((v,i)=>{if(v)c.fillRect(x+i,y+j,1,1)}))}
function zGlyph(c,x,y){[[0,0],[1,0],[2,0],[1,1],[0,2],[1,2],[2,2]].forEach(([a,b])=>{c.fillStyle='rgba(43,33,24,.5)';c.fillRect(x+a+1,y+b+1,1,1);c.fillStyle='#fff';c.fillRect(x+a,y+b,1,1)})}  // chữ z khi ngủ
```

**Sprite sheet bắt buộc sinh ra** (`pig-sheet.png`, mỗi khung 24×20, lưới đều):
| Khung | Tham số `o` |
|---|---|
| `stand_f0` / `stand_f1` | `{pose:'stand',frame:0|1,tail:false|true}` (đuôi vẫy) |
| `walk_f0` / `walk_f1` | `{pose:'walk',frame:0|1}` |
| `sleep` | `{pose:'sleep',frame:0}` |
| `eat` | `{pose:'eat',frame:0}` |
| `sad` | `{pose:'stand',frame:0,mood:'sad'}` |
| `face_16` | `drawFace` (avatar) |

Chớp mắt (`blink`) & nhảy (`happy`) là runtime transform — KHÔNG sinh khung riêng: chớp mắt dùng khung `stand` đè 2px đen mắt (tái lập `blink` bằng overlay), `happy` = khung `stand` + dịch chuyển ±5px + sprite `heart`.

---

## 6. MÁY TRẠNG THÁI & VÒNG RENDER (PORT NGUYÊN VĂN sang `pixelGarden.ts` pure)

```js
const pig={x:88,y:98,face:1,mode:'idle',t:0,dur:2,tx:0,ty:0,frame:0,ft:0,after:null,jump:0};
const MINX=26,MAXX=164,MINY=78,MAXY=118;                       // vùng đi được
const blocked=(x,y)=>{const dx=(x-136)/31,dy=(y-106)/13;return dx*dx+dy*dy<1};   // ao sen
function setMode(m,dur,after){pig.mode=m;pig.t=0;pig.dur=dur||0;pig.after=after||null}
function walkTo(x,y,after){pig.tx=x;pig.ty=y;pig.after=after||null;pig.mode='walk';pig.t=0}
function pickTarget(){for(let i=0;i<20;i++){const x=MINX+Math.random()*(MAXX-MINX),y=MINY+Math.random()*(MAXY-MINY);
  if(!blocked(x,y)&&Math.hypot(x-pig.x,y-pig.y)>18)return{x,y}}return null}
function update(dt){                                    // dt clamp ≤ 0.05
  pig.t+=dt;pig.ft+=dt;
  const sad=state.spent>LIMIT;
  if(pig.mode==='idle'){
    if(pig.t>pig.dur){
      if(reduced){pig.t=0;pig.dur=3;return}
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
```

**Vẽ heo mỗi khung** (bóng đổ elip 2 dải + vị trí y −18 − jump + lật ngang khi face<0 + chữ z khi ngủ + trái tim khi happy):
```js
function drawPig(t){
  const m=pig.mode,sad=state.spent>LIMIT,happy=m==='happy';
  pig.jump=happy&&!reduced?Math.abs(Math.sin(pig.t*9))*5:0;
  const sw=Math.round(8-pig.jump*.6);
  ctx.fillStyle='rgba(30,50,20,.22)';
  ctx.fillRect(Math.round(pig.x)-sw,Math.round(pig.y)-1,sw*2,2);ctx.fillRect(Math.round(pig.x)-sw+2,Math.round(pig.y)+1,sw*2-4,1);
  const y=Math.round(pig.y-18-pig.jump);
  if(pig.face<0){/* vẽ lật ngang */} else {/* vẽ thường */}
  if(m==='sleep')for(let i=0;i<3;i++){const p=(t*.8+i/3)%1;/* zGlyph alpha 1-p, đi lên phải */ }
  if(happy){const p=Math.min(1,pig.t/pig.dur);/* heart '#E0452B' alpha 1-p*.6, đi lên */}
}
```

**Cá bơi trong ao & đom đóm đêm** (runtime, không vào PNG tĩnh):
```js
const fish=[{a:0,s:.7,rx:14,ry:5},{a:3,s:-.5,rx:10,ry:3}];       // quanh tâm (136,106)
const flies=Array.from({length:9},(_,i)=>({x:20+((i*37)%140),y:70+((i*23)%50),p:i*1.7}));
// cá: thân 3×2 '#F2872B' + đầu 1px '#FFD1A8'; đom đóm: 2×2 '#FFF08A' hiển thị khi sin>.2, đêm only
```

**Thời điểm trong ngày:**
```js
let tod=(()=>{const h=new Date().getHours();return h>=6&&h<16?'day':h>=16&&h<19?'dusk':'night'})();
const TOD={day:{label:'Nắng',tint:null},dusk:{label:'Chiều',tint:'rgba(255,140,60,.20)'},night:{label:'Đêm',tint:'rgba(20,30,90,.44)'}};
// Đêm thêm: cửa sổ sáng #FFE08A (24×16 tại 59,21), glow đèn lồng E(96,19,7,7,'rgba(255,200,90,.28)'), đom đóm
```

**Nhiếp ảnh tương tác `pointerdown` (port sang `PanResponder`/`Pressable` tọa độ logic):**
```js
// 1) chạm heo (hit-box): x∈pig.x±13 && y∈[pig.y−22, pig.y+3] → happy 1.2s + thoại ngẫu nhiên
// 2) chạm ao (blocked): "Ở đó có ao, heo không bơi đâu nha"
// 3) còn lại: walkTo(clamp(x,MINX,MAXX), clamp(y,MINY,MAXY))
```

---

## 7. CHECKLIST PORT (KIỂM TRA TRƯỚC KHI MERGE)
- [ ] Mọi hex trong code port trùng 100% bảng `C`/`PAL` gốc (diff tự động khi generate: số màu unique ≤ 32).
- [ ] PNG output scale 4× nearest-neighbor — không có pixel mờ/bán dẫn.
- [ ] `mulberry32(7)` cho bg, `mulberry32(21)` cho fg — cùng seed → cảnh tái tạo giống hệt prototype (đối chiếu mở file HTML).
- [ ] Máy trạng thái: unit test chứng minh heo KHÔNG vào ao, KHÔNG ra ngoài vùng đi được, đổi khung mỗi 0.2s, tốc độ 24/15 px/s.
- [ ] Y-sort đúng: banana(106) / stool(86) / pig(pig.y) — heo đi ra sau chuối khi pig.y > 106.
- [ ] Reduce-motion: heo đứng (`update` chỉ nhánh `reduced`), vẫn phản hồi chạm.
- [ ] dt clamp ≤ 0.05s; 60fps; không re-render React khi chỉ đổi vị trí (reanimated shared values).