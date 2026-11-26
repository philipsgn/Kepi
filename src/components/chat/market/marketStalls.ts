/**
 * 7 Shop Bắc Kín Ngang + 6 Đảo Trung Tâm & 6 Sạp Nam Sát Kề Chuẩn 32-Bit Indie Pixel Art (Quyết định 214)
 */
export function buildMarketStallsScript(): string {
  return `
function drawNorthStalls(x){
  // Cột bê tông vàng kem phân cách 7 sạp sát vách nhau
  [72,220,368,524,680,828,976,1126].forEach(function(cx){
    pxBevelBox(x,cx,64,4,102,'#E6D39F','#FFF6DA','#B89B58');
  });

  // 1. SHOP ÁO DÀI SÀI GÒN & ĐỒNG HỒ (x: 76..220)
  pxBevelBox(x,76,64,144,14,'#9E2A2B','#DC2626','#6B1819');pxText(x,'AO DAI SAI GON',102,69,'#FFF8D6',1);
  // Tủ kính WATCH bên trái
  pxBevelBox(x,76,79,28,87,'#F3E7CE','#FFFFFF','#C7B291');
  R(x,78,81,24,9,'#9E2A2B');pxText(x,'WATCH',80,83,'#FFFFFF',1);
  R(x,78,92,24,48,INK);R(x,79,93,22,46,'#DCEEFA');
  for(var wy=98;wy<=126;wy+=14){
    for(var wx=83;wx<=93;wx+=10){
      R(x,wx+1,wy-3,2,10,'#4B3C32');E(x,wx+2,wy+1,3,3,INK);E(x,wx+2,wy+1,2,2,'#FFFBF1');
    }
  }
  // Nội thất tiệm áo dài + mái hiên vải sọc đỏ-kem
  R(x,106,79,114,87,INK);R(x,107,80,112,62,'#5C4638');
  drawStripedAwning(x,106,78,114,11,'#9E2A2B','#F5E9CE',8);
  ['#DC2626','#2563EB','#D99B38','#EC4899'].forEach(function(col,i){
    var ax=114+i*24;
    R(x,ax+4,92,4,4,'#E5C29F');R(x,ax+3,96,6,2,col);R(x,ax+2,98,8,12,col);
    R(x,ax+3,110,6,13,col);R(x,ax+4,123,2,7,'#FFFBF1');R(x,ax+7,123,2,7,'#FFFBF1');
  });
  drawWoodCounter(x,106,134,114,32,'#FFF8E7',MK_PAL.wood);
  drawBambooBasket(x,90,164,'#EC4899');
  pxTag(x,122,130,14,'#FEF08A');pxTag(x,178,130,14,'#FEF08A');
  drawPerson16Bit(x,156,169,{shirt:'#EC4899',pants:'#1E293B',hat:'bun',bag:'#FFFBF1'});

  // 2. SẠP VẢI, TÚI XÁCH & GIÀY DÉP "HƯƠNG TRINH" (x: 224..368)
  pxBevelBox(x,224,64,144,14,'#1D4ED8','#3B82F6','#1E3A8A');pxText(x,'HUONG TRINH',254,69,'#FFFFFF',1);
  R(x,224,79,144,87,INK);R(x,225,80,142,84,'#5C4638');
  drawStripedAwning(x,224,78,144,11,'#2D6A5B','#F5E9CE',8);
  var clCols=['#DC2626','#2563EB','#D99B38','#245940','#EC4899','#7C3AED','#EA580C'];
  for(var cx2=230;cx2<322;cx2+=14){
    var c1=clCols[((cx2-230)/14)|0 % clCols.length];
    R(x,cx2,92,10,16,INK);R(x,cx2+1,93,8,14,c1);R(x,cx2+3,90,4,2,'#CBD5E1');
    R(x,cx2+2,97,6,2,'rgba(255,255,255,0.28)');
  }
  E(x,344,102,15,10,INK);E(x,344,102,14,9,'#38BDF8');E(x,344,104,9,5,'#FDE047');R(x,328,104,32,12,'#5C4638');
  drawWoodCounter(x,224,124,144,42,'#F3E7CE',MK_PAL.wood);
  for(var fy=126;fy<148;fy+=7){
    for(var fx=228;fx<324;fx+=20){
      var fCol=clCols[((fx+fy)/7)|0 % clCols.length];
      pxBevelBox(x,fx,fy,17,6,fCol,'rgba(255,255,255,0.3)','rgba(0,0,0,0.25)');
    }
  }
  pxBevelBox(x,332,130,28,16,'#D4A373','#E9C496','#9C6644');R(x,342,131,8,4,'#FFF8E7');
  drawScale(x,230,118);
  drawPerson16Bit(x,284,169,{shirt:'#38BDF8',pants:'#374151',tourist:true,hair:'#D97706',backpack:'#EF4444',shades:true});

  // 3. SẠP ĐẶC SẢN TRÀ, CÀ PHÊ & MỨT "LIÊN SÀI GÒN" + "NGỌC HOA 823" (x: 372..524)
  pxBevelBox(x,372,64,78,14,'#15803D','#22C55E','#14532D');pxText(x,'LIEN SAI GON',382,69,'#FFFFFF',1);
  pxBevelBox(x,452,64,72,14,'#FFFBF1','#FFFFFF','#CBD5E1');pxText(x,'NGOC HOA 823',460,69,'#DC2626',1);
  R(x,372,79,152,87,INK);R(x,373,80,150,84,'#6A4A32');
  drawStripedAwning(x,372,78,152,11,'#C85A38','#FEF08A',8);
  for(var jx=377;jx<446;jx+=10){
    var fill=['#F59E0B','#DC2626','#22C55E','#D97706'][(jx/10)|0 % 4];
    R(x,jx,93,7,12,INK);R(x,jx+1,94,5,10,'#E0F2FE');R(x,jx+1,98,5,6,fill);R(x,jx+1,91,5,2,'#DC2626');
  }
  for(var sy=93;sy<118;sy+=12){
    R(x,455,sy,66,3,'#8C5E1A');
    for(var sx=458;sx<516;sx+=10)R(x,sx,sy-7,7,7,['#DC2626','#F4B93B','#22C55E','#EC4899'][((sx+sy)/10)|0 % 4]);
  }
  drawWoodCounter(x,372,124,152,42,'#FFF8E7',MK_PAL.wood);
  drawWoodenCrate(x,376,126,34,18,'mango');
  drawWoodenCrate(x,414,126,34,18,'orange');
  for(var rx=456;rx<518;rx+=12)R(x,rx,128,9,10,'#FFF8E7');
  drawBambooBasket(x,386,166,'#F59E0B');
  drawPerson16Bit(x,438,169,{shirt:'#F97316',pants:'#1E293B',hat:'nonla',apron:'#FFFBF1'});

  // 4. VÒM KHU ĂN UỐNG & SẠP 1044 (x: 528..680)
  R(x,548,44,112,26,INK);R(x,549,45,110,24,'#EFE8D8');
  E(x,604,70,38,14,'#E6D6BE');E(x,604,70,36,12,'#E6D6BE');
  pxText(x,'KHU AN UONG',582,53,'#9E2A2B',1);
  drawHangingLantern(x,552,66,'#EF4444');drawHangingLantern(x,656,66,'#F59E0B');
  pxBevelBox(x,530,72,72,13,'#F4B93B','#FEF08A','#B97A14');pxText(x,'SAP 1044',546,76,INK,1);
  pxBevelBox(x,606,72,72,13,'#EA580C','#FDBA74','#9A3412');pxText(x,'BUN MAM',620,76,'#FFFFFF',1);
  R(x,530,86,148,80,INK);R(x,531,87,146,34,'#DCEEFA');
  for(var fx2=536;fx2<670;fx2+=16){
    R(x,fx2,96,12,18,INK);R(x,fx2+1,97,10,16,['#FB923C','#F472B6','#4ADE80','#FACC15'][(fx2/16)|0 % 4]);
  }
  pxBevelBox(x,528,120,152,46,'#EFE9DD','#FFFFFF','#D1C7B7');
  for(var tx2=532;tx2<676;tx2+=16)R(x,tx2,122,1,42,'#CBD5E1');
  pxBevelBox(x,580,104,24,18,'#CBD5E1','#F8FAFC','#64748B');
  R(x,584,104,16,3,'#EA580C');
  drawPerson16Bit(x,636,119,{shirt:'#FFFBF1',pants:'#1E293B',hat:'chef',apron:'#15803D'});
  drawInoxStool(x,548,168);drawInoxStool(x,588,168);drawInoxStool(x,628,168);drawInoxStool(x,664,168);
  drawPerson16Bit(x,586,166,{shirt:'#1E293B',pants:'#334155',tourist:true,hair:'#9CA3AF',sit:true});

  // 5. SẠP BÁNH CUỐN 50K & BÁNH BÈO 20K (x: 684..828)
  pxBevelBox(x,684,64,72,14,'#FEF08A','#FFFBEB','#D97706');pxText(x,'BANH CUON 50',692,69,'#9E2A2B',1);
  pxBevelBox(x,758,64,70,14,'#FFFBF1','#FFFFFF','#CBD5E1');pxText(x,'BANH BEO 20K',766,69,'#1D4ED8',1);
  R(x,684,79,144,87,INK);R(x,685,80,142,84,'#5C4638');
  drawStripedAwning(x,684,78,144,11,'#E0A33A','#FFFBF1',8);
  R(x,688,92,64,30,INK);R(x,689,93,62,28,'#FFF8E7');
  R(x,696,96,20,16,'#CBD5E1');R(x,698,98,16,12,'#FFFBF1');
  R(x,762,92,62,30,INK);R(x,763,93,60,28,'#DCEEFA');
  for(var dx=768;dx<818;dx+=14){R(x,dx,104,10,4,'#FFFBF1');R(x,dx+2,102,6,2,'#EA580C');}
  drawWoodCounter(x,684,124,144,42,'#DFC484',MK_PAL.wood);
  for(var nx=692;nx<816;nx+=18){R(x,nx,128,12,7,'#4ADE80');R(x,nx+3,129,6,5,'#EC4899');}
  drawPerson16Bit(x,728,169,{shirt:'#F472B6',pants:'#1E293B',hat:'nonla',apron:'#FFFBF1'});

  // 6. SẠP PHỞ BÒ & BÚN BÒ HUẾ (x: 832..976)
  pxBevelBox(x,832,64,144,14,'#DC2626','#EF4444','#991B1B');pxText(x,'PHO BO - BUN BO',868,69,'#FEF08A',1);
  R(x,832,79,144,87,INK);R(x,833,80,142,84,'#6A4A32');
  drawStripedAwning(x,832,78,144,11,'#B83232','#F5E9CE',8);
  R(x,838,92,68,30,INK);R(x,839,93,66,28,'#E0F2FE');
  [846,858,870].forEach(function(mx){R(x,mx,96,8,15,'#B91C1C');R(x,mx+2,98,4,9,'#FCA5A5');});
  [884,894].forEach(function(gx){E(x,gx,108,5,5,INK);E(x,gx,108,4,4,'#22C55E');});
  pxBevelBox(x,916,96,24,24,'#CBD5E1','#F8FAFC','#64748B');
  pxBevelBox(x,944,98,22,22,'#CBD5E1','#F8FAFC','#64748B');
  drawWoodCounter(x,832,124,144,42,'#EFE9DD','#B45309');
  drawInoxStool(x,854,168);drawInoxStool(x,904,168);drawInoxStool(x,952,168);
  drawPerson16Bit(x,902,166,{shirt:'#38BDF8',pants:'#1E293B',tourist:true,hair:'#FDE047',sit:true});

  // 7. SHOP QUẦN ÁO THỜI TRANG SÀI GÒN (x: 980..1126)
  pxBevelBox(x,980,64,146,14,'#7C3AED','#A855F7','#581C87');pxText(x,'THOI TRANG SAI GON',1010,69,'#FFFFFF',1);
  R(x,980,79,146,87,INK);R(x,981,80,144,84,'#4B3C32');
  drawStripedAwning(x,980,78,146,11,'#3D5A80','#F5E9CE',8);
  var faCols=['#EC4899','#38BDF8','#FACC15','#22C55E','#EF4444','#F97316','#FFFBF1'];
  for(var fx3=986;fx3<1086;fx3+=14){
    var col2=faCols[((fx3-986)/14)|0 % faCols.length];
    R(x,fx3,91,11,22,INK);R(x,fx3+1,92,9,20,col2);R(x,fx3+4,88,3,3,'#E2E8F0');
    R(x,fx3+2,98,7,2,'rgba(255,255,255,0.3)');
  }
  pxBevelBox(x,1090,90,32,36,'#D4A373','#E9C496','#9C6644');
  [1094,1108].forEach(function(bx3){
    R(x,bx3,95,10,10,INK);R(x,bx3+1,96,8,8,'#DC2626');
    R(x,bx3,110,10,10,INK);R(x,bx3+1,111,8,8,'#2563EB');
  });
  drawWoodCounter(x,980,128,146,38,'#F3E7CE',MK_PAL.wood);
  for(var sx2=988;sx2<1112;sx2+=20){
    pxBevelBox(x,sx2,130,16,8,faCols[((sx2-988)/20)|0 % faCols.length],'rgba(255,255,255,0.3)','rgba(0,0,0,0.25)');
  }
  pxTag(x,1010,124,14,'#FEF08A');pxTag(x,1070,124,14,'#FEF08A');
  drawPerson16Bit(x,1044,169,{shirt:'#FEF08A',pants:'#1F2937',tourist:true,hat:'bucket',backpack:'#2563EB'});
}

// 6 ĐẢO TRUNG TÂM Y-SORTED SÁT KỀ NHAU (y: 226..294, khe hẻm 20px, có mái chóp sọc 3D!)
function drawCentralIslands(x){
  // Đảo 1 (x: 88..236): TRÁI CÂY "1029 NGỌC HẢO" (Mái chóp vải sọc vàng cam!)
  drawWoodCounter(x,88,242,148,50,'#F3E7CE',MK_PAL.wood);
  drawWoodenCrate(x,94,240,42,16,'mango');
  drawWoodenCrate(x,140,240,42,16,'dragon');
  drawWoodenCrate(x,186,240,44,16,'melon');
  drawPitchedCanopy(x,88,214,148,26,'#E0A33A','#FFF8E7');
  pxText(x,'1029 NGOC HAO',124,274,'#FEF08A',1);
  drawBambooBasket(x,96,292,'#FACC15');drawScale(x,218,242);
  drawPerson16Bit(x,148,296,{shirt:'#FFFBF1',pants:'#1E293B',hat:'nonla',apron:'#15803D'});

  // Đảo 2 (x: 256..404): HẢI SẢN TƯƠI ĐÁ BÀO
  drawWoodCounter(x,256,238,148,54,'#BAE6FD','#1E3A8A');
  drawStripedAwning(x,256,226,148,14,'#1D4ED8','#E0F2FE',8);
  [270,296,322,348].forEach(function(hx){R(x,hx,240,20,10,INK);R(x,hx+1,241,18,8,'#E0F2FE');R(x,hx+4,243,12,4,'#FB923C');});
  drawScale(x,382,240);
  pxText(x,'HAI SAN TUOI',296,274,'#FFFFFF',1);
  drawPerson16Bit(x,320,296,{shirt:'#38BDF8',pants:'#334155',hat:'nonla',apron:'#FFFBF1'});

  // Đảo 3 (x: 424..572): RAU CỦ & THỊT TƯƠI
  drawWoodCounter(x,424,238,148,54,'#DCFCE7','#166534');
  drawStripedAwning(x,424,226,148,14,'#2D6A5B','#DCFCE7',8);
  drawWoodenCrate(x,430,240,42,16,'veg');
  drawWoodenCrate(x,476,240,42,16,'orange');
  [524,544].forEach(function(mx){R(x,mx,240,16,12,INK);R(x,mx+1,241,14,10,'#FCA5A5');R(x,mx+3,243,10,4,'#B91C1C');});
  pxText(x,'RAU CU THIT',466,274,'#FEF08A',1);
  drawBambooBasket(x,436,292,'#22C55E');
  drawPerson16Bit(x,486,296,{shirt:'#FEF08A',pants:'#1E293B',hat:'bun',apron:'#FFFBF1'});

  // Đảo 4 (x: 592..752): CỤM BÀN ĂN KHU ẨM THỰC 1 (Mái sọc đỏ kem)
  pxShadow(x,592,288,160,5);
  drawPerson16Bit(x,618,250,{shirt:'#38BDF8',pants:'#334155',hat:'cap',tourist:true,sit:true});
  drawPerson16Bit(x,676,250,{shirt:'#10B981',pants:'#1E293B',tourist:true,hair:'#DC2626',sit:true});
  drawPerson16Bit(x,728,250,{shirt:'#EC4899',pants:'#374151',hat:'bucket',tourist:true,sit:true});
  pxBevelBox(x,592,242,160,22,MK_PAL.woodLt,MK_PAL.creamHi,MK_PAL.wood);
  R(x,604,264,8,24,INK);R(x,732,264,8,24,INK);
  [616,674,724].forEach(function(bx){E(x,bx,248,6,3,INK);E(x,bx,248,5,2,'#FFFBF1');R(x,bx-2,247,4,1,'#EA580C');});
  drawInoxStool(x,616,274);drawInoxStool(x,674,274);drawInoxStool(x,726,274);

  // Đảo 5 (x: 772..924): ĐỒ GIA DỤNG & BẾP NÚC
  drawWoodCounter(x,772,238,152,54,'#F3E7CE','#9A3412');
  drawStripedAwning(x,772,226,152,14,'#C85A38','#FFF8E7',8);
  [788,814,840].forEach(function(px4){pxBevelBox(x,px4,238,16,12,'#CBD5E1','#F8FAFC','#64748B');});
  [872,896].forEach(function(bx2){E(x,bx2,242,8,5,INK);E(x,bx2,242,7,4,'#D99B38');});
  pxText(x,'DO GIA DUNG',814,274,'#FFF8D6',1);
  drawPerson16Bit(x,834,296,{shirt:'#E0452B',pants:'#1E293B',hat:'nonla'});

  // Đảo 6 (x: 944..1110): LƯU NIỆM SÀI GÒN (Mái chóp vải sọc đỏ đất-vàng!)
  drawWoodCounter(x,944,242,166,50,'#E5BA7E',MK_PAL.wood);
  [966,994,1022].forEach(function(nx){
    E(x,nx,244,8,3,INK);E(x,nx,244,7,2,'#FDE68A');R(x,nx-3,240,6,2,'#F59E0B');R(x,nx-1,238,2,2,'#FDE68A');
  });
  [1054,1076,1096].forEach(function(gx){drawCeramicVase(x,gx,236,'#2563EB');});
  drawPitchedCanopy(x,944,214,166,26,'#C85A38','#FEF08A');
  pxText(x,'LUU NIEM SAI GON',978,274,'#FFF8D6',1);
  drawBambooBasket(x,1094,292,'#EC4899');
  drawPerson16Bit(x,1020,296,{shirt:'#FFFBF1',pants:'#1E293B',hat:'bun',bag:'#F4B93B'});
}

// 6 HÀNG QUÁN TẦNG NAM Y-SORTED SÁT KỀ NHAU (y: 368..434, khe hẻm 20px)
function drawSouthStalls(x){
  // Sạp 1 (x: 88..236): XE NƯỚC MÍA & DỪA XIÊM
  drawWoodCounter(x,88,378,148,56,'#E0F2FE','#15803D');
  drawStripedAwning(x,88,366,148,14,'#22C55E','#FFFBF1',8);
  pxBevelBox(x,96,374,22,14,'#DC2626','#EF4444','#991B1B');
  pxBevelBox(x,130,370,22,18,'#CBD5E1','#F8FAFC','#64748B');
  [164,176,188].forEach(function(dx){E(x,dx,382,5,4,INK);E(x,dx,382,4,3,'#65A30D');});
  pxText(x,'NUOC MIA DUA',122,412,'#FEF08A',1);
  drawPerson16Bit(x,208,404,{shirt:'#FEF08A',pants:'#1E293B',hat:'nonla',sit:true});

  // Sạp 2 (x: 256..404): CHÈ BA MÀU & BÁNH DÂN GIAN
  drawWoodCounter(x,256,378,148,56,'#FFFBF1','#9D174D');
  drawStripedAwning(x,256,366,148,14,'#EC4899','#FFF8E7',8);
  for(var kx=268;kx<386;kx+=26){
    pxBevelBox(x,kx,376,20,12,'#DCEEFA','#FFFFFF','#94A3B8');
    R(x,kx+3,380,6,5,'#FACC15');R(x,kx+11,380,6,5,'#22C55E');
  }
  pxText(x,'CHE BA MAU',296,412,'#FEF08A',1);
  drawBambooBasket(x,268,436,'#22C55E');

  // Sạp 3 (x: 424..584): DÃY BÀN GHẾ NHỰA VỈA HÈ 2
  pxShadow(x,424,432,160,5);
  drawPerson16Bit(x,452,398,{shirt:'#38BDF8',pants:'#1E293B',tourist:true,hair:'#FDE047',sit:true});
  drawPerson16Bit(x,504,398,{shirt:'#F472B6',pants:'#334155',hat:'nonla',sit:true});
  drawPerson16Bit(x,556,398,{shirt:'#F59E0B',pants:'#1F2937',tourist:true,shades:true,sit:true});
  pxBevelBox(x,424,390,160,24,MK_PAL.woodLt,MK_PAL.creamHi,MK_PAL.wood);
  R(x,436,414,8,18,INK);R(x,564,414,8,18,INK);
  [452,504,556].forEach(function(cx){R(x,cx,392,5,7,INK);R(x,cx+1,393,3,5,'#8B5A2B');R(x,cx+2,389,1,3,'#FFFBF1');});
  drawPlasticStool(x,450,424,'#DC2626');drawPlasticStool(x,502,424,'#2563EB');drawPlasticStool(x,554,424,'#DC2626');

  // Sạp 4 (x: 604..752): ĐỒ KHÔ, TÔM KHÔ & MẮM NÊM
  drawWoodCounter(x,604,378,148,56,'#FEF3C7','#B45309');
  drawStripedAwning(x,604,366,148,14,'#D97706','#FFF8E7',8);
  [620,646,672,698,724].forEach(function(bx){
    E(x,bx,382,9,6,INK);E(x,bx,382,8,5,'#F59E0B');R(x,bx-4,380,8,2,'#EA580C');
  });
  drawScale(x,732,380);
  pxText(x,'DO KHO TOM KHO',640,412,'#FEF08A',1);

  // Sạp 5 (x: 772..924): CÀ PHÊ SỮA ĐÁ & SINH TỐ BƠ XOÀI
  drawWoodCounter(x,772,378,152,56,'#F3E7CE','#4B3C32');
  drawStripedAwning(x,772,366,152,14,'#2D6A5B','#F5E9CE',8);
  [788,808,828,850,872,894].forEach(function(sx,i){
    R(x,sx,374,7,10,INK);R(x,sx+1,375,5,8,['#8B5A2B','#22C55E','#FACC15','#F472B6','#8B5A2B','#FB923C'][i]);
  });
  pxText(x,'CA PHE SINH TO',808,412,'#FEF08A',1);

  // Sạp 6 (x: 944..1110): HOA TƯƠI & GỐM SƠN MÀI
  drawWoodCounter(x,944,382,166,52,'#E5C29F','#7C2D12');
  drawStripedAwning(x,944,370,166,14,'#B83232','#FEF08A',8);
  [964,992,1020].forEach(function(fx){E(x,fx,380,8,6,INK);E(x,fx,380,7,5,'#FACC15');E(x,fx+2,378,3,3,'#F97316');});
  [1050,1074,1096].forEach(function(lx){E(x,lx,380,8,6,INK);E(x,lx,380,7,5,'#F472B6');E(x,lx+1,378,3,3,'#FFFBF1');});
  pxText(x,'HOA TUOI GOM SU',984,414,'#FEF08A',1);
  drawBambooBasket(x,1096,436,'#FACC15');
}
`;
}
