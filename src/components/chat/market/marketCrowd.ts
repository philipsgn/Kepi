/**
 * Bộ Sprite Nhân Vật Đa Dạng, Khách Du Lịch, Người Bán Hàng & Chú Heo 24x20 (Quyết định 212)
 */
export function buildMarketCrowdScript(): string {
  return `
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
  shape(c,[[2,10,12],[3,10,13],[4,10,13]],PAL.p,ox+headDx,oy+headDy);
  hp(11,3,PAL.s);hp(12,3,PAL.s);
  shape(c,[[3,16,18],[4,16,19],[5,16,19]],PAL.p,ox+headDx,oy+headDy);
  hp(17,4,PAL.s);hp(18,4,PAL.s);
  shape(c,[[4,10,17],[5,9,18],[6,9,19],[7,9,19],[8,9,19],[9,9,19],[10,10,18]],PAL.p,ox+headDx,oy+headDy);
  R(c,hx+11,hy+4,4,1,PAL.h);
  shape(c,[[7,18,20],[8,17,21],[9,18,20]],PAL.n,ox+headDx,oy+headDy);
  hp(19,8,PAL.k);hp(20,8,PAL.k);
  if(o.blink||sleep){hp(16,6,PAL.k);hp(17,6,PAL.k);}
  else if(o.happy){hp(16,5,PAL.k);hp(17,6,PAL.k);}
  else{hp(16,6,PAL.k);hp(17,6,PAL.k);hp(16,5,PAL.w);}
  hp(13,8,PAL.s);hp(14,8,PAL.s);
  if(o.happy){hp(16,9,PAL.k);hp(17,9,PAL.k);}
  R(c,ox+6,oy+bodyDy+4,4,1,PAL.g);R(c,ox+7,oy+bodyDy+3,2,1,PAL.G);
}
var hp=document.createElement('canvas');hp.width=24;hp.height=20;
var hpx=hp.getContext('2d');hpx.imageSmoothingEnabled=false;

function drawPerson16Bit(c,px,py,o){
  o=o||{};
  var sit=!!o.sit, shirt=o.shirt||'#FFFBF1', pants=o.pants||'#1E293B';
  var isForeign=!!o.tourist;
  var tall=o.tall?1:0;
  var hair=o.hair||(isForeign?'#EAB308':'#2B2118');
  var skin=isForeign?'#FAD7B8':'#F5CCA0', skinSh=isForeign?'#E2B48E':'#DDA878';
  // Bóng tiếp xúc elip mềm dưới chân
  E(c,px+4,py,6,2,'rgba(43,33,24,0.32)');
  var by=sit?(py-13-tall):(py-14-tall);
  if(o.backpack){
    R(c,px-4,by+1,5,7,INK);R(c,px-3,by+2,3,5,o.backpack);R(c,px-3,by+2,3,1,'rgba(255,255,255,0.3)');
    R(c,px-3,by+5,3,1,'rgba(0,0,0,0.22)');
  }
  if(sit){
    R(c,px,py-5,8,4,INK);R(c,px+1,py-4,6,3,pants);
    R(c,px,py-1,3,2,INK);R(c,px+5,py-1,3,2,INK);
  }else{
    var step=o.step||0;
    R(c,px+1,py-6-step-tall,3,5+tall,INK);R(c,px+2,py-5-step-tall,1,4+tall,pants);
    R(c,px+5,py-6+(step?0:1)-tall,3,5+tall,INK);R(c,px+6,py-5+(step?0:1)-tall,1,4+tall,pants);
    R(c,px,py-2-step,4,2,'#1F2937');R(c,px+5,py-2+(step?0:1),4,2,'#1F2937');
  }
  R(c,px-1,by,10,8+tall,INK);
  R(c,px,by+1,8,6+tall,shirt);
  // Highlight vai trái & bóng đổ cạnh phải + cổ áo
  R(c,px,by+1,2,5+tall,'rgba(255,255,255,0.22)');
  R(c,px+6,by+1,2,6+tall,'rgba(0,0,0,0.16)');
  R(c,px+2,by+1,4,1,'rgba(255,255,255,0.45)');
  R(c,px-2,by+2,2,5,INK);R(c,px-1,by+2,1,4,skin);
  R(c,px+8,by+2,2,5,INK);R(c,px+8,by+2,1,4,skin);
  if(o.guard){
    R(c,px,by+1,2,1,'#1E3A8A');R(c,px+6,by+1,2,1,'#1E3A8A');
    R(c,px+1,by+3,2,1,'#F4B93B');R(c,px,by+6,8,1,'#111827');
  }else if(o.apron){
    R(c,px+1,by+3,6,4+tall,o.apron);R(c,px+2,by+1,1,2,o.apron);R(c,px+5,by+1,1,2,o.apron);
  }else if(o.camera){
    R(c,px+2,by+3,4,3,'#111827');R(c,px+3,by+4,2,1,'#94A3B8');
  }
  if(o.bag){
    R(c,px+9,by+5,5,5,INK);R(c,px+10,by+6,3,3,o.bag);R(c,px+10,by+5,3,1,'#8C5832');
  }
  var hy=by-7;
  R(c,px,hy,8,7,INK);R(c,px+1,hy+1,6,5,skin);R(c,px+1,hy+5,6,1,skinSh);
  if(o.shades){
    R(c,px+1,hy+3,6,2,'#111827');R(c,px+2,hy+3,1,1,'#60A5FA');R(c,px+5,hy+3,1,1,'#60A5FA');
  }else{
    R(c,px+2,hy+3,1,1,INK);R(c,px+5,hy+3,1,1,INK);
    R(c,px+1,hy+4,1,1,'#F29AB0');R(c,px+6,hy+4,1,1,'#F29AB0');
  }
  if(o.hat==='nonla'){
    R(c,px-3,hy+1,14,1,INK);R(c,px-2,hy,12,1,'#E8C56E');
    R(c,px-1,hy-1,10,1,'#F7DF94');R(c,px+1,hy-2,6,1,'#FFF1C2');R(c,px+3,hy-3,2,1,'#F7DF94');
  }else if(o.hat==='kepi'){
    R(c,px,hy-2,8,3,INK);R(c,px+1,hy-1,6,2,'#1E3A8A');R(c,px+3,hy-1,2,1,'#F4B93B');
    R(c,px-1,hy+1,10,1,'#111827');
  }else if(o.hat==='chef'){
    R(c,px,hy-3,8,4,INK);R(c,px+1,hy-2,6,3,'#FFFFFF');
  }else if(o.hat==='bun'){
    R(c,px+1,hy,6,2,hair);R(c,px+2,hy-2,4,2,hair);R(c,px+5,hy-2,2,1,'#E0452B');
  }else if(o.hat==='bucket'){
    R(c,px-1,hy,10,1,INK);R(c,px,hy-2,8,2,'#EAE4D7');R(c,px+1,hy-1,6,1,'#CBD5E1');
  }else if(o.hat==='cap'){
    R(c,px,hy-1,8,2,INK);R(c,px+1,hy,6,1,'#3B82F6');R(c,px+6,hy+1,3,1,INK);
  }else{
    R(c,px+1,hy,6,2,hair);R(c,px+2,hy,3,1,'rgba(255,255,255,0.22)');R(c,px,hy+1,1,3,hair);R(c,px+7,hy+1,1,3,hair);
  }
}

function drawInoxStool(c,sx,sy){
  pxShadow(c,sx-1,sy+8,10,2);
  R(c,sx,sy,8,3,INK);R(c,sx+1,sy+1,6,1,'#E2E8F0');R(c,sx+2,sy+1,2,1,'#FFFFFF');
  R(c,sx+1,sy+3,1,6,'#64748B');R(c,sx+6,sy+3,1,6,'#64748B');R(c,sx+1,sy+6,6,1,'#94A3B8');
}

function drawPlasticStool(c,sx,sy,col){
  pxShadow(c,sx-1,sy+7,10,2);
  R(c,sx,sy,8,7,INK);R(c,sx+1,sy+1,6,2,col);R(c,sx+1,sy+3,2,3,col);R(c,sx+5,sy+3,2,3,col);
}

// =========================================================================
// BIỂN NGƯỜI 140+ NHÂN VẬT 60FPS: SPRITE CACHE mk(18,24) + mulberry32(21600) + FRUSTUM CULLING
// =========================================================================
var CROWD_SPRITES = null;
var CROWD_WALKERS = null;

function ensureCrowdBuilt(){
  if(CROWD_SPRITES && CROWD_WALKERS) return;
  var templates = [
    {shirt:'#E0452B',pants:'#1E293B',hat:'nonla',bag:'#FFFBF1'},
    {shirt:'#38BDF8',pants:'#334155',tourist:true,hair:'#FDE047',backpack:'#EA580C',camera:true,shades:true,tall:true},
    {shirt:'#F59E0B',pants:'#1F2937',tourist:true,hat:'bucket',backpack:'#2563EB',bag:'#FFFBF1'},
    {shirt:'#EC4899',pants:'#374151',hat:'bun',bag:'#F4B93B'},
    {shirt:'#10B981',pants:'#1E293B',tourist:true,hair:'#92400E',camera:true,tall:true},
    {shirt:'#FFFBF1',pants:'#4B6FA5',hat:'cap',bag:'#E0452B'},
    {shirt:'#A855F7',pants:'#1E293B',hat:'nonla',bag:'#FEF08A'},
    {shirt:'#F97316',pants:'#334155',tourist:true,hair:'#FACC15',backpack:'#16A34A',shades:true},
    {shirt:'#EF4444',pants:'#1F2937',hat:'nonla',bag:'#E5BA7E'},
    {shirt:'#6366F1',pants:'#1E293B',tourist:true,hat:'cap',backpack:'#EC4899',camera:true},
    {shirt:'#84CC16',pants:'#334155',hat:'bun',bag:'#38BDF8'},
    {shirt:'#14B8A6',pants:'#1E293B',hat:'nonla',bag:'#FEF08A'},
    {shirt:'#F43F5E',pants:'#334155',hat:'bun',bag:'#F4B93B'},
    {shirt:'#0EA5E9',pants:'#1F2937',tourist:true,hat:'bucket',camera:true},
    {shirt:'#EAB308',pants:'#1E293B',hat:'nonla',bag:'#FFFBF1'},
    {shirt:'#F472B6',pants:'#1E293B',hat:'bun',bag:'#FFFBF1'},
    {shirt:'#FACC15',pants:'#334155',tourist:true,hat:'bucket',backpack:'#DC2626',camera:true},
    {shirt:'#3B82F6',pants:'#1F2937',hat:'cap',bag:'#F4B93B'},
    {shirt:'#22C55E',pants:'#1E293B',hat:'nonla',bag:'#FEF08A'},
    {shirt:'#FB7185',pants:'#334155',tourist:true,hair:'#FDE047',shades:true,tall:true}
  ];
  CROWD_SPRITES = templates.map(function(tpl){
    return [
      mk(18, 24, function(ctx){ drawPerson16Bit(ctx, 5, 22, Object.assign({}, tpl, {step:0})); }),
      mk(18, 24, function(ctx){ drawPerson16Bit(ctx, 5, 22, Object.assign({}, tpl, {step:1})); })
    ];
  });

  var rng = mulberry32(21600);
  var lanes = [
    {minY:176, maxY:216, count:36},
    {minY:300, maxY:358, count:42},
    {minY:440, maxY:472, count:22}
  ];
  CROWD_WALKERS = [];
  lanes.forEach(function(ln){
    for(var i=0; i<ln.count; i++){
      CROWD_WALKERS.push({
        y: Math.round(ln.minY + rng() * (ln.maxY - ln.minY)),
        x0: Math.round(28 + rng() * 1140),
        speed: 9 + rng() * 11,
        dir: rng() > 0.5 ? 1 : -1,
        tpl: (rng() * templates.length) | 0,
        phase: rng() * 10
      });
    }
  });
  CROWD_WALKERS.sort(function(a,b){ return a.y - b.y; });
}

function getWalkingShoppers(t){
  ensureCrowdBuilt();
  return CROWD_WALKERS;
}

function drawWalkingShoppers(x,t,minY,maxY,camX,vw){
  ensureCrowdBuilt();
  var hasCull = (typeof camX === 'number' && typeof vw === 'number');
  var leftB = hasCull ? (camX - 24) : -999;
  var rightB = hasCull ? (camX + vw + 24) : 9999;
  for(var i=0; i<CROWD_WALKERS.length; i++){
    var w = CROWD_WALKERS[i];
    if(w.y < minY || w.y >= maxY) continue;
    var span = 1144;
    var raw = (w.x0 + w.dir * t * w.speed) % span;
    if(raw < 0) raw += span;
    var sx = Math.round(28 + raw);
    if(sx < leftB || sx > rightB) continue;
    var fr = (((t * 5.5 + w.phase) | 0) & 1);
    x.drawImage(CROWD_SPRITES[w.tpl][fr], sx - 5, w.y - 22);
  }
}

function drawPigAt(x,rm,t){
  if(!rm)return;
  var px=Math.round(rm.x-12), jumpY=(rm.action==='jump_joy'?-Math.abs(Math.sin(t*10))*4:0), py=Math.round(rm.y-20+jumpY);
  // Vầng sáng kem nhẹ dưới chân để Heo Con luôn nổi bật giữa 140+ người!
  E(x,Math.round(rm.x),Math.round(rm.y)-1,13,4,'rgba(255,248,214,0.58)');
  pxShadow(x,px+4,Math.round(rm.y)-1,16,2);
  hpx.clearRect(0,0,24,20);
  drawPigSprite(hpx,{pose:rm.walking?'walk':(rm.action==='eat_snack'?'eat':'stand'),frame:rm.walking?(((t*6)|0)%2):0,happy:Boolean(rm.action),blink:(t%4)<0.15,tail:Math.floor(t*3)%2===1});
  x.save();
  if(rm.facing<0){x.translate(px+24,py);x.scale(-1,1);x.drawImage(hp,0,0,24,20,0,0,24,20);}
  else x.drawImage(hp,0,0,24,20,px,py,24,20);
  x.restore();
}
`;
}
