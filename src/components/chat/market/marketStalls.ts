/**
 * 3 Dãy Sạp Thương Mại Dày Đặc Không Trùng Lặp (Dãy Bắc, Dãy Đảo Trung Tâm & Dãy Nam — Quyết định 212)
 */
export function buildMarketStallsScript(): string {
  return `
function drawNorthStalls(x){
  // 1. SẠP VẢI, QUẦN ÁO, TÚI XÁCH & GIÀY DÉP "HƯƠNG TRINH" (x: 180..352)
  pxBevelBox(x,180,64,172,15,'#1D4ED8','#3B82F6','#1E3A8A');pxText(x,'HUONG TRINH',226,69,'#FFFFFF',1);
  R(x,180,80,172,84,INK);R(x,181,81,170,82,'#5C4638');
  var clCols=['#DC2626','#2563EB','#D99B38','#245940','#EC4899','#7C3AED','#EA580C'];
  // Giá treo túi xách & áo thun trên cao
  for(var cx=186;cx<286;cx+=14){
    var c1=clCols[((cx-186)/14)|0 % clCols.length];
    R(x,cx,86,10,16,INK);R(x,cx+1,87,8,14,c1);R(x,cx+3,84,4,2,'#CBD5E1');
    R(x,cx+2,91,6,2,'rgba(255,255,255,0.28)'); // họa tiết áo/túi
  }
  // Quạt giấy lớn & Nón lá bên phải
  E(x,318,96,18,12,INK);E(x,318,96,17,11,'#38BDF8');E(x,318,98,12,7,'#FDE047');R(x,300,98,36,12,'#5C4638');
  // Kệ gỗ 3 tầng xếp cuộn vải lụa chéo & kệ giày dép + thùng carton
  pxBevelBox(x,178,122,174,42,MK_PAL.wood,MK_PAL.woodLt,MK_PAL.woodDk);
  for(var fy=125;fy<148;fy+=7){
    for(var fx=183;fx<306;fx+=20){
      var fCol=clCols[((fx+fy)/7)|0 % clCols.length];
      pxBevelBox(x,fx,fy,17,6,fCol,'rgba(255,255,255,0.3)','rgba(0,0,0,0.25)');
    }
  }
  // Thùng carton xếp chồng & thẻ giá treo
  pxBevelBox(x,314,128,28,16,'#D4A373','#E9C496','#9C6644');R(x,324,129,8,4,'#FFF8E7');
  pxTag(x,196,118,14,'#FEF08A');pxTag(x,246,118,14,'#FEF08A');
  drawPerson16Bit(x,214,166,{shirt:'#FEF08A',pants:'#1E293B',hat:'bun'});
  drawPerson16Bit(x,274,166,{shirt:'#38BDF8',pants:'#374151',tourist:true,hair:'#D97706',backpack:'#EF4444',shades:true});

  // 2. SẠP ĐẶC SẢN TRÀ, CÀ PHÊ & MỨT "LIÊN SÀI GÒN" + "NGỌC HOA 823" (x: 360..536)
  pxBevelBox(x,360,64,92,15,'#15803D','#22C55E','#14532D');pxText(x,'LIEN SAI GON',377,69,'#FFFFFF',1);
  for(var bx=364;bx<448;bx+=8)R(x,bx,80,2,2,'#FFF8D6');
  R(x,360,84,92,80,INK);R(x,361,85,90,78,'#6A4A32');
  for(var jx=365;jx<446;jx+=10){
    var fill=['#F59E0B','#DC2626','#22C55E','#D97706'][(jx/10)|0 % 4];
    R(x,jx,90,7,12,INK);R(x,jx+1,91,5,10,'#E0F2FE');R(x,jx+1,95,5,6,fill);R(x,jx+1,88,5,2,'#DC2626');
  }
  for(var tx=365;tx<446;tx+=11){R(x,tx,108,8,12,INK);R(x,tx+1,109,6,10,'#15803D');R(x,tx+2,112,4,4,'#FDE047');}
  pxBevelBox(x,358,126,96,38,MK_PAL.wood,MK_PAL.woodLt,MK_PAL.woodDk);
  [364,394,424].forEach(function(rx){
    pxBevelBox(x,rx,122,22,10,'#E5BA7E','#FFF8E7','#A16207');
    R(x,rx+3,125,16,1,'#A16207');R(x,rx+3,128,16,1,'#A16207');
  });

  pxBevelBox(x,456,64,80,15,'#F8FAFC','#FFFFFF','#CBD5E1');pxText(x,'NGOC HOA 823',466,69,'#DC2626',1);
  R(x,456,82,80,82,INK);R(x,457,83,78,80,'#5C4638');
  for(var ny=88;ny<=112;ny+=8){R(x,462,ny,18,3,INK);R(x,463,ny+1,16,2,'#F7DF94');R(x,469,ny+1,4,1,'#EC4899');}
  for(var bx2=488;bx2<=520;bx2+=12){R(x,bx2,88,9,13,INK);R(x,bx2+1,89,7,11,'#2563EB');R(x,bx2+2,92,5,3,'#F4B93B');}
  pxBevelBox(x,456,126,80,38,MK_PAL.wood,MK_PAL.woodLt,MK_PAL.woodDk);
  drawPerson16Bit(x,396,132,{shirt:'#F9B8C4',pants:'#1F2937',hat:'bun'});
  drawRattanLamp(x,394,54);drawRattanLamp(x,494,54);

  // 3. CỔNG VÒM "KHU ĂN UỐNG" & QUẦY CHỮ L SẠP 1044 (x: 544..768)
  pxBevelBox(x,546,48,94,34,'#EDE9E0','#FFFFFF','#C7B291');
  R(x,558,64,70,18,'#3A2D25');E(x,593,68,32,11,'#3A2D25');
  pxText(x,'KHU AN UONG',571,54,'#991B1B',1);
  pxBevelBox(x,646,56,118,16,'#FACC15','#FEF08A','#CA8A04');pxText(x,'BUN BO 1044',678,61,'#991B1B',1);
  R(x,546,84,218,80,INK);R(x,547,85,216,32,'#47382E');
  drawPerson16Bit(x,580,120,{shirt:'#FFFBF1',pants:'#1F2937',hat:'chef',apron:'#15803D'});
  // Nồi nước lèo inox + bếp lửa đỏ hồng + vá múc
  R(x,554,100,22,18,INK);R(x,555,101,20,16,'#CBD5E1');R(x,557,101,5,16,'#F8FAFC');
  R(x,557,118,16,3,'#EF4444');R(x,560,118,10,2,'#FDE047');
  // Tủ kính 2 tầng bày Gỏi cuốn, Chả giò, Bún bò, Gia vị & Máy xay
  R(x,592,88,120,30,INK);R(x,593,89,118,28,'#DCEEFA');R(x,593,103,118,1,'#64748B');
  R(x,598,95,18,5,'#FFFBF1');R(x,600,93,5,3,'#F8FAFC');R(x,608,93,5,3,'#F8FAFC');
  R(x,624,95,18,5,'#FFFBF1');R(x,626,93,14,3,'#D97706');
  R(x,602,109,16,6,'#FFFBF1');R(x,604,108,12,2,'#EA580C');
  R(x,676,94,12,18,INK);R(x,677,95,10,10,'#FEF08A');R(x,677,105,10,6,'#EF4444');
  // Chùm dừa tươi xanh cắm ống hút góc quầy
  [[726,106],[736,106],[746,106],[731,99],[741,99]].forEach(function(cc){
    E(x,cc[0],cc[1],4,4,INK);E(x,cc[0],cc[1],3,3,'#65A30D');R(x,cc[0],cc[1]-6,1,5,'#EF4444');
  });
  // Mặt trước quầy ốp gạch trắng + 8 ảnh món ăn
  R(x,546,118,218,46,INK);R(x,547,119,216,5,'#CBD5E1');R(x,547,124,216,39,'#F1F5F9');
  for(var gx3=555;gx3<760;gx3+=8)R(x,gx3,124,1,39,'#E2E8F0');
  for(var mx=554;mx<748;mx+=24){
    R(x,mx,130,18,14,INK);R(x,mx+1,131,16,12,'#FFFFFF');
    E(x,mx+9,137,5,4,['#EA580C','#16A34A','#DC2626'][(mx/24)|0 % 3]);
  }
  [560,588,616,644,672,700,728].forEach(function(sx){drawInoxStool(x,sx,164);});
  drawPerson16Bit(x,586,169,{shirt:'#1E293B',pants:'#334155',tourist:true,hair:'#FDE047',sit:true});
  drawPerson16Bit(x,642,169,{shirt:'#FFFBF1',pants:'#4B6FA5',hat:'cap',sit:true});
  drawPerson16Bit(x,698,169,{shirt:'#EC4899',pants:'#1F2937',hat:'bun',sit:true});

  // 4. BÁNH CUỐN NÓNG 50K, BÚN BÒ HUẾ & BÁNH BÈO 20K (x: 776..1016)
  pxBevelBox(x,776,56,110,16,'#FEF08A','#FFFBEB','#EAB308');pxText(x,'BANH CUON 50K',798,61,'#B91C1C',1);
  R(x,776,84,110,80,INK);R(x,777,85,108,34,'#4B3C32');
  drawPerson16Bit(x,834,122,{shirt:'#84CC16',pants:'#1F2937',hat:'bun'});
  R(x,786,100,24,18,INK);R(x,787,101,22,16,'#94A3B8');E(x,798,101,11,4,INK);E(x,798,101,10,3,'#FFFFFF');
  R(x,776,118,110,46,INK);
  for(var bx3=777;bx3<884;bx3+=10){
    for(var by3=119;by3<163;by3+=10){
      R(x,bx3,by3,10,10,((bx3+by3)/10)%2===0?'#F7EED8':'#E2E8F0');R(x,bx3+4,by3+4,2,2,'#4A8A80');
    }
  }
  pxBevelBox(x,892,54,122,16,'#FFFFFF','#FFFFFF','#CBD5E1');pxText(x,'BANH BEO 20K',924,59,'#1D4ED8',1);
  R(x,892,84,122,80,INK);R(x,893,85,120,34,'#4B3C32');
  R(x,898,90,108,2,'#94A3B8');
  for(var nx=904;nx<1000;nx+=14){R(x,nx,92,6,9,INK);R(x,nx+1,93,4,7,'#4ADE80');R(x,nx+1,95,4,2,'#F472B6');}
  R(x,898,104,108,16,INK);R(x,899,105,106,14,'#DCEEFA');
  for(var cx2=904;cx2<998;cx2+=10){R(x,cx2,113,7,3,'#FFFFFF');R(x,cx2+2,112,3,1,'#EA580C');}
  R(x,892,120,122,44,INK);R(x,893,121,120,42,'#DFC484');
  for(var tx2=898;tx2<1008;tx2+=7){for(var ty2=126;ty2<160;ty2+=7){R(x,tx2,ty2,2,2,((tx2+ty2)%2===0)?'#B48B4E':'#FFFBF1');}}
  drawInoxStool(x,802,164);drawInoxStool(x,938,164);
  drawPerson16Bit(x,936,169,{shirt:'#2563EB',pants:'#1E293B',tourist:true,hair:'#92400E',sit:true});
}

function drawCentralIslands(x){
  // ĐẢO A (x: 184..356, y: 226..292): SẠP TRÁI CÂY NHIỆT ĐỚI "1029 NGỌC HẢO" + CÂN ĐỒNG HỒ
  pxShadow(x,184,288,172,5);
  pxBevelBox(x,184,234,172,56,'#0F766E','#14B8A6','#115E59');
  R(x,185,235,170,20,'#E5C29F');pxText(x,'1029 NGOC HAO',238,266,'#FEF08A',1);
  pxTag(x,190,256,16,'#FEF08A');pxTag(x,244,256,16,'#FEF08A');
  // Xoài vàng, Cam, Chuối nải, Thanh long đỏ, Dừa xanh & Dưa hấu sọc
  for(var r=0;r<3;r++)for(var c=0;c<3-r;c++){E(x,196+c*7+r*3,240-r*5,3,3,INK);E(x,196+c*7+r*3,240-r*5,2,2,'#4ADE80');}
  for(var r2=0;r2<3;r2++)for(var c2=0;c2<3-r2;c2++){E(x,230+c2*7+r2*3,240-r2*5,3,3,INK);E(x,230+c2*7+r2*3,240-r2*5,2,2,'#FACC15');}
  for(var r3=0;r3<3;r3++)for(var c3=0;c3<3-r3;c3++){E(x,264+c3*7+r3*3,240-r3*5,3,3,INK);E(x,264+c3*7+r3*3,240-r3*5,2,2,'#EC4899');}
  // Dưa hấu sọc xanh đậm + Cân đồng hồ Nhơn Hòa xanh lá
  E(x,302,240,5,4,INK);E(x,302,240,4,3,'#15803D');R(x,300,238,1,4,'#86EFAC');R(x,304,238,1,4,'#86EFAC');
  R(x,326,232,12,14,INK);R(x,327,233,10,12,'#16A34A');E(x,332,239,3,3,'#FFFFFF');R(x,332,237,1,2,INK);

  // ĐẢO B (x: 384..544, y: 226..292): SẠP RAU CỦ, THỊT & HẢI SẢN ĐÁ LẠNH
  pxShadow(x,384,288,160,5);
  pxBevelBox(x,384,234,160,56,'#334155','#64748B','#1E293B');
  R(x,385,235,158,20,'#E0F2FE'); // Khay đá lạnh bày hải sản
  // Rổ rau xanh & ớt đỏ (trái) + Cá bạc, Tôm & Cua đỏ (phải)
  pxBevelBox(x,390,236,24,14,'#D97706','#F59E0B','#92400E');E(x,402,242,8,4,'#16A34A');E(x,396,243,2,2,'#DC2626');
  [428,444,460].forEach(function(fx){R(x,fx,240,10,4,'#94A3B8');R(x,fx+1,241,6,2,'#F8FAFC');});
  [482,498].forEach(function(cx){E(x,cx,242,4,3,'#DC2626');R(x,cx-5,240,2,2,'#EF4444');R(x,cx+4,240,2,2,'#EF4444');});
  pxText(x,'HAI SAN RAU CU',420,266,'#BAE6FD',1);

  // ĐẢO C (x: 572..768, y: 224..292): CỤM BÀN ĂN KHU ẨM THỰC 1
  pxShadow(x,576,288,188,5);
  drawPerson16Bit(x,596,256,{shirt:'#E0452B',pants:'#1E293B',tourist:true,hair:'#FACC15',sit:true});
  drawPerson16Bit(x,652,256,{shirt:'#38BDF8',pants:'#334155',hat:'nonla',sit:true});
  drawPerson16Bit(x,716,256,{shirt:'#F59E0B',pants:'#1F2937',tourist:true,shades:true,sit:true});
  pxBevelBox(x,576,246,188,24,MK_PAL.woodLt,MK_PAL.creamHi,MK_PAL.wood);
  R(x,586,270,8,18,INK);R(x,746,270,8,18,INK);
  [596,652].forEach(function(bx){E(x,bx,254,6,3,INK);E(x,bx,254,5,2,'#FFFBF1');R(x,bx-2,253,4,1,'#EA580C');});
  E(x,624,254,6,3,INK);E(x,624,254,5,2,'#FACC15');
  [682,692,702].forEach(function(cx3){R(x,cx3,250,4,6,INK);R(x,cx3+1,251,2,2,'#E0452B');R(x,cx3+1,253,2,2,'#4ADE80');});

  // ĐẢO D (x: 796..996, y: 224..292): ĐẢO LƯU NIỆM, GỐM SƠN MÀI & CHỒNG NÓN LÁ
  pxShadow(x,796,288,200,5);
  pxBevelBox(x,796,236,200,54,'#7C2D12','#B45309','#451A03');
  R(x,797,237,198,16,'#E5C29F');pxText(x,'GOM SU MY NGHE',852,266,'#FEF08A',1);
  // Bình gốm hoa lam, Bát sơn mài đỏ-vàng, Tượng ngọc & Chồng nón lá
  [810,830,850].forEach(function(gx){R(x,gx,228,9,13,INK);R(x,gx+1,229,7,11,'#2563EB');R(x,gx+2,232,5,3,'#E0F2FE');});
  [878,896,914].forEach(function(lx){E(x,lx,238,5,4,INK);E(x,lx,238,4,3,'#DC2626');R(x,lx-2,236,4,1,'#FACC15');});
  for(var nh=0;nh<3;nh++){E(x,962,240-nh*4,10,3,INK);E(x,962,240-nh*4,9,2,'#F7DF94');}
}

function drawSouthStalls(x){
  // DÃY NAM (y: 356..466) — TRIỆT TIÊU KHOẢNG SÀN TRỐNG DƯỚI
  // 1. QUẦY NƯỚC MÍA, DỪA TƯƠI & NƯỚC ÉP (x: 48..244)
  pxShadow(x,48,432,196,5);
  pxBevelBox(x,48,378,196,56,'#15803D','#22C55E','#14532D');
  R(x,49,379,194,16,'#E0F2FE');pxText(x,'NUOC MIA DUA TUOI',88,408,'#FEF08A',1);
  // Thùng đá đỏ, Xe ép mía inox & Chồng dừa tươi
  pxBevelBox(x,56,374,24,14,'#DC2626','#EF4444','#991B1B');
  pxBevelBox(x,94,370,22,18,'#CBD5E1','#F8FAFC','#64748B');
  [136,148,160,172].forEach(function(dx){E(x,dx,382,5,4,INK);E(x,dx,382,4,3,'#65A30D');});
  drawPerson16Bit(x,204,404,{shirt:'#FEF08A',pants:'#1E293B',hat:'nonla',sit:true});

  // 2. SẠP CHÈ BA MÀU & BÁNH DÂN GIAN (x: 280..480)
  pxShadow(x,280,432,200,5);
  pxBevelBox(x,280,378,200,56,'#9D174D','#EC4899','#831843');
  R(x,281,379,198,16,'#FFFBF1');pxText(x,'CHE BA MAU BANH',324,408,'#FEF08A',1);
  for(var kx=292;kx<456;kx+=26){
    pxBevelBox(x,kx,376,20,12,'#DCEEFA','#FFFFFF','#94A3B8');
    R(x,kx+3,380,6,5,'#FACC15');R(x,kx+11,380,6,5,'#22C55E');
  }

  // 3. CỤM BÀN ĂN KHU ẨM THỰC 2 (x: 516..736)
  pxShadow(x,516,432,220,5);
  drawPerson16Bit(x,544,398,{shirt:'#38BDF8',pants:'#1E293B',tourist:true,hair:'#FDE047',sit:true});
  drawPerson16Bit(x,616,398,{shirt:'#F472B6',pants:'#334155',hat:'nonla',sit:true});
  drawPerson16Bit(x,688,398,{shirt:'#F59E0B',pants:'#1F2937',tourist:true,shades:true,sit:true});
  pxBevelBox(x,516,390,220,24,MK_PAL.woodLt,MK_PAL.creamHi,MK_PAL.wood);
  R(x,528,414,8,18,INK);R(x,716,414,8,18,INK);
  [544,616,688].forEach(function(cx){R(x,cx,392,5,7,INK);R(x,cx+1,393,3,5,'#8B5A2B');R(x,cx+2,389,1,3,'#FFFBF1');});
  drawPlasticStool(x,542,424,'#DC2626');drawPlasticStool(x,614,424,'#2563EB');drawPlasticStool(x,686,424,'#DC2626');

  // 4. SẠP HOA TƯƠI & GIA DỤNG (x: 772..980)
  pxShadow(x,772,432,208,5);
  pxBevelBox(x,772,382,208,52,'#7C2D12','#B45309','#451A03');
  R(x,773,383,206,14,'#E5C29F');pxText(x,'HOA TUOI GIA DUNG',826,410,'#FEF08A',1);
  [792,824,856].forEach(function(fx){E(x,fx,380,8,6,INK);E(x,fx,380,7,5,'#FACC15');E(x,fx+2,378,3,3,'#F97316');});
  [892,922,952].forEach(function(lx){E(x,lx,380,8,6,INK);E(x,lx,380,7,5,'#F472B6');E(x,lx+1,378,3,3,'#FFFBF1');});
}
`;
}
