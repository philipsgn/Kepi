/**
 * 9 Shop Bắc Kín Suốt 0..1200 + 7 Cụm Trung Tâm & 8 Cụm Nam So Le Chen Lấn Chuẩn Vietnamese Design Art (Quyết định 215)
 */
export function buildMarketStallsScript(): string {
  return `
function drawNorthStalls(x){
  // Cột bê tông vàng kem mảnh phân cách 9 shop sát vách từ x=0..1200 (không còn mảng nâu rìa!)
  [112,244,384,532,684,820,956,1084].forEach(function(cx){
    pxBevelBox(x,cx,64,4,102,'#E6D39F','#FFF6DA','#B89B58');
  });

  // 1. SẠP BÁO CHÍ, GIẤY TỜ & VÉ SỐ (Góc trái x: 0..112)
  pxBevelBox(x,0,64,112,14,'#0369A1','#38BDF8','#0C4A6E');pxText(x,'BAO CHI - GIAY TO',16,69,'#FFFFFF',1);
  R(x,0,79,112,87,INK);R(x,1,80,110,84,'#5C4638');
  drawStripedAwning(x,0,78,112,10,'#0284C7','#FEF9C3',7);
  // Kệ treo báo giấy, tạp chí, sổ tay & bảng vé số kiến thiết
  for(var bx=6;bx<100;bx+=15){
    var bCol=['#FFFBF1','#FEF08A','#DBEAFE','#FCE7F3','#DCFCE7','#FFEDD5'][((bx-6)/15)|0 % 6];
    R(x,bx,91,12,16,INK);R(x,bx+1,92,10,14,bCol);
    R(x,bx+2,94,8,2,'#DC2626');R(x,bx+2,98,8,1,'#475569');R(x,bx+2,101,6,1,'#475569');
  }
  drawWoodCounter(x,0,124,112,42,'#FFF8E7',MK_PAL.wood);
  // Xấp báo giấy, phong bì, sổ tay & vé số trên quầy
  for(var px1=6;px1<96;px1+=18){
    pxBevelBox(x,px1,126,14,9,'#FFFBF1','#FFFFFF','#CBD5E1');R(x,px1+2,128,10,2,'#1D4ED8');
  }
  drawBambooBasket(x,16,166,'#FEF08A');
  drawPerson16Bit(x,54,169,{shirt:'#38BDF8',pants:'#1E293B',hat:'cap',bag:'#FFFBF1'});

  // 2. SHOP ÁO DÀI SÀI GÒN & ĐỒNG HỒ (x: 116..244)
  pxBevelBox(x,116,64,128,14,'#9E2A2B','#DC2626','#6B1819');pxText(x,'AO DAI SAI GON',142,69,'#FFF8D6',1);
  pxBevelBox(x,116,79,26,87,'#F3E7CE','#FFFFFF','#C7B291');
  R(x,118,81,22,9,'#9E2A2B');pxText(x,'WATCH',119,83,'#FFFFFF',1);
  R(x,118,92,22,48,INK);R(x,119,93,20,46,'#DCEEFA');
  for(var wy=98;wy<=126;wy+=14){
    for(var wx=122;wx<=131;wx+=9){
      R(x,wx+1,wy-3,2,10,'#4B3C32');E(x,wx+2,wy+1,3,3,INK);E(x,wx+2,wy+1,2,2,'#FFFBF1');
    }
  }
  R(x,144,79,100,87,INK);R(x,145,80,98,62,'#5C4638');
  drawStripedAwning(x,144,78,100,10,'#9E2A2B','#F5E9CE',7);
  ['#DC2626','#2563EB','#D99B38','#EC4899'].forEach(function(col,i){
    var ax=150+i*22;
    R(x,ax+4,92,4,4,'#E5C29F');R(x,ax+3,96,6,2,col);R(x,ax+2,98,8,12,col);
    R(x,ax+3,110,6,13,col);R(x,ax+4,123,2,7,'#FFFBF1');R(x,ax+7,123,2,7,'#FFFBF1');
  });
  drawWoodCounter(x,144,134,100,32,'#FFF8E7',MK_PAL.wood);
  drawBambooBasket(x,130,166,'#EC4899');
  drawPerson16Bit(x,186,169,{shirt:'#EC4899',pants:'#1E293B',hat:'bun',bag:'#FFFBF1'});
  drawPerson16Bit(x,212,171,{shirt:'#FEF08A',pants:'#334155',tourist:true,hair:'#D97706'});

  // 3. SẠP VẢI, QUẦN ÁO & GIÀY DÉP "HƯƠNG TRINH" (x: 248..384)
  pxBevelBox(x,248,64,136,14,'#1D4ED8','#3B82F6','#1E3A8A');pxText(x,'HUONG TRINH',280,69,'#FFFFFF',1);
  R(x,248,79,136,87,INK);R(x,249,80,134,84,'#5C4638');
  drawStripedAwning(x,248,78,136,10,'#2D6A5B','#F5E9CE',7);
  var clCols=['#DC2626','#2563EB','#D99B38','#245940','#EC4899','#7C3AED','#EA580C'];
  for(var cx2=254;cx2<344;cx2+=13){
    var c1=clCols[((cx2-254)/13)|0 % clCols.length];
    R(x,cx2,92,10,16,INK);R(x,cx2+1,93,8,14,c1);R(x,cx2+3,90,4,2,'#CBD5E1');
  }
  E(x,362,102,14,10,INK);E(x,362,102,13,9,'#38BDF8');E(x,362,104,8,5,'#FDE047');R(x,348,104,28,12,'#5C4638');
  drawWoodCounter(x,248,124,136,42,'#F3E7CE',MK_PAL.wood);
  for(var fy=126;fy<148;fy+=7){
    for(var fx=252;fx<344;fx+=18){
      var fCol=clCols[((fx+fy)/7)|0 % clCols.length];
      pxBevelBox(x,fx,fy,15,6,fCol,'rgba(255,255,255,0.3)','rgba(0,0,0,0.25)');
    }
  }
  pxBevelBox(x,350,130,28,16,'#D4A373','#E9C496','#9C6644');
  drawPerson16Bit(x,302,169,{shirt:'#38BDF8',pants:'#374151',tourist:true,hair:'#D97706',backpack:'#EF4444',shades:true});

  // 4. SẠP ĐẶC SẢN "LIÊN SÀI GÒN" + "NGỌC HOA 823" (x: 388..532)
  pxBevelBox(x,388,64,74,14,'#15803D','#22C55E','#14532D');pxText(x,'LIEN SAI GON',396,69,'#FFFFFF',1);
  pxBevelBox(x,464,64,68,14,'#FFFBF1','#FFFFFF','#CBD5E1');pxText(x,'NGOC HOA 823',470,69,'#DC2626',1);
  R(x,388,79,144,87,INK);R(x,389,80,142,84,'#6A4A32');
  drawStripedAwning(x,388,78,144,10,'#C85A38','#FEF08A',7);
  for(var jx=392;jx<458;jx+=10){
    var fill=['#F59E0B','#DC2626','#22C55E','#D97706'][(jx/10)|0 % 4];
    R(x,jx,93,7,12,INK);R(x,jx+1,94,5,10,'#E0F2FE');R(x,jx+1,98,5,6,fill);R(x,jx+1,91,5,2,'#DC2626');
  }
  for(var sy=93;sy<118;sy+=12){
    R(x,466,sy,62,3,'#8C5E1A');
    for(var sx=468;sx<524;sx+=10)R(x,sx,sy-7,7,7,['#DC2626','#F4B93B','#22C55E','#EC4899'][((sx+sy)/10)|0 % 4]);
  }
  drawWoodCounter(x,388,124,144,42,'#FFF8E7',MK_PAL.wood);
  drawWoodenCrate(x,392,126,32,18,'mango');
  drawWoodenCrate(x,428,126,32,18,'orange');
  for(var rx=466;rx<526;rx+=12)R(x,rx,128,9,10,'#FFF8E7');
  drawBambooBasket(x,402,166,'#F59E0B');
  drawPerson16Bit(x,446,169,{shirt:'#F97316',pants:'#1E293B',hat:'nonla',apron:'#FFFBF1'});
  drawPerson16Bit(x,472,171,{shirt:'#22C55E',pants:'#1F2937',hat:'bun',bag:'#FEF08A'});

  // 5. VÒM KHU ĂN UỐNG & SẠP 1044 (x: 536..684)
  R(x,554,44,112,26,INK);R(x,555,45,110,24,'#EFE8D8');
  E(x,610,70,38,14,'#E6D6BE');E(x,610,70,36,12,'#E6D6BE');
  pxText(x,'KHU AN UONG',588,53,'#9E2A2B',1);
  drawHangingLantern(x,558,66,'#EF4444');drawHangingLantern(x,662,66,'#F59E0B');
  pxBevelBox(x,538,72,70,13,'#F4B93B','#FEF08A','#B97A14');pxText(x,'SAP 1044',552,76,INK,1);
  pxBevelBox(x,612,72,70,13,'#EA580C','#FDBA74','#9A3412');pxText(x,'BUN MAM',624,76,'#FFFFFF',1);
  R(x,538,86,144,80,INK);R(x,539,87,142,34,'#DCEEFA');
  for(var fx2=544;fx2<674;fx2+=16){
    R(x,fx2,96,12,18,INK);R(x,fx2+1,97,10,16,['#FB923C','#F472B6','#4ADE80','#FACC15'][(fx2/16)|0 % 4]);
  }
  pxBevelBox(x,536,120,148,46,'#EFE9DD','#FFFFFF','#D1C7B7');
  for(var tx2=540;tx2<680;tx2+=16)R(x,tx2,122,1,42,'#CBD5E1');
  pxBevelBox(x,586,104,24,18,'#CBD5E1','#F8FAFC','#64748B');R(x,590,104,16,3,'#EA580C');
  drawPerson16Bit(x,640,119,{shirt:'#FFFBF1',pants:'#1E293B',hat:'chef',apron:'#15803D'});
  drawInoxStool(x,554,168);drawInoxStool(x,592,168);drawInoxStool(x,630,168);drawInoxStool(x,666,168);
  drawPerson16Bit(x,590,166,{shirt:'#1E293B',pants:'#334155',tourist:true,hair:'#9CA3AF',sit:true});
  drawPerson16Bit(x,628,166,{shirt:'#EF4444',pants:'#1F2937',hat:'nonla',sit:true});

  // 6. SẠP BÁNH CUỐN 50K & BÁNH BÈO 20K (x: 688..820)
  pxBevelBox(x,688,64,66,14,'#FEF08A','#FFFBEB','#D97706');pxText(x,'BANH CUON 50',692,69,'#9E2A2B',1);
  pxBevelBox(x,756,64,64,14,'#FFFBF1','#FFFFFF','#CBD5E1');pxText(x,'BANH BEO 20K',760,69,'#1D4ED8',1);
  R(x,688,79,132,87,INK);R(x,689,80,130,84,'#5C4638');
  drawStripedAwning(x,688,78,132,10,'#E0A33A','#FFFBF1',7);
  R(x,692,92,58,30,INK);R(x,693,93,56,28,'#FFF8E7');
  R(x,700,96,20,16,'#CBD5E1');R(x,702,98,16,12,'#FFFBF1');
  R(x,756,92,58,30,INK);R(x,757,93,56,28,'#DCEEFA');
  for(var dx=762;dx<808;dx+=14){R(x,dx,104,10,4,'#FFFBF1');R(x,dx+2,102,6,2,'#EA580C');}
  drawWoodCounter(x,688,124,132,42,'#DFC484',MK_PAL.wood);
  drawBanhCuonPlate(x,696,126);drawBanhCuonPlate(x,722,126);drawBanhCuonPlate(x,748,126);
  drawBanhCuonPlate(x,776,126);drawBanhCuonPlate(x,800,126);
  drawPerson16Bit(x,736,169,{shirt:'#F472B6',pants:'#1E293B',hat:'nonla',apron:'#FFFBF1'});
  drawPerson16Bit(x,764,171,{shirt:'#38BDF8',pants:'#334155',tourist:true,camera:true});

  // 7. SẠP PHỞ BÒ & BÚN BÒ HUẾ (x: 824..956)
  pxBevelBox(x,824,64,132,14,'#DC2626','#EF4444','#991B1B');pxText(x,'PHO BO - BUN BO',854,69,'#FEF08A',1);
  R(x,824,79,132,87,INK);R(x,825,80,130,84,'#6A4A32');
  drawStripedAwning(x,824,78,132,10,'#B83232','#F5E9CE',7);
  R(x,830,92,62,30,INK);R(x,831,93,60,28,'#E0F2FE');
  [838,850,862].forEach(function(mx){R(x,mx,96,8,15,'#B91C1C');R(x,mx+2,98,4,9,'#FCA5A5');});
  [874,884].forEach(function(gx){E(x,gx,108,5,5,INK);E(x,gx,108,4,4,'#22C55E');});
  pxBevelBox(x,900,96,24,24,'#CBD5E1','#F8FAFC','#64748B');
  pxBevelBox(x,928,98,22,22,'#CBD5E1','#F8FAFC','#64748B');
  drawWoodCounter(x,824,124,132,42,'#EFE9DD','#B45309');
  drawPhoBowl(x,834,125);drawPhoBowl(x,862,125);drawPhoBowl(x,892,125);drawPhoBowl(x,924,125);
  drawInoxStool(x,846,168);drawInoxStool(x,892,168);drawInoxStool(x,936,168);
  drawPerson16Bit(x,890,166,{shirt:'#38BDF8',pants:'#1E293B',tourist:true,hair:'#FDE047',sit:true});
  drawPerson16Bit(x,934,166,{shirt:'#F59E0B',pants:'#1F2937',hat:'cap',sit:true});

  // 8. SHOP QUẦN ÁO THỜI TRANG SÀI GÒN (x: 960..1084)
  pxBevelBox(x,960,64,124,14,'#7C3AED','#A855F7','#581C87');pxText(x,'THOI TRANG SAI GON',976,69,'#FFFFFF',1);
  R(x,960,79,124,87,INK);R(x,961,80,122,84,'#4B3C32');
  drawStripedAwning(x,960,78,124,10,'#3D5A80','#F5E9CE',7);
  var faCols=['#EC4899','#38BDF8','#FACC15','#22C55E','#EF4444','#F97316'];
  for(var fx3=966;fx3<1050;fx3+=14){
    var col2=faCols[((fx3-966)/14)|0 % faCols.length];
    R(x,fx3,91,11,22,INK);R(x,fx3+1,92,9,20,col2);R(x,fx3+4,88,3,3,'#E2E8F0');
  }
  pxBevelBox(x,1054,90,26,36,'#D4A373','#E9C496','#9C6644');
  R(x,1058,95,10,10,INK);R(x,1059,96,8,8,'#DC2626');
  R(x,1058,110,10,10,INK);R(x,1059,111,8,8,'#2563EB');
  drawWoodCounter(x,960,128,124,38,'#F3E7CE',MK_PAL.wood);
  drawPerson16Bit(x,1018,169,{shirt:'#FEF08A',pants:'#1F2937',tourist:true,hat:'bucket',backpack:'#2563EB'});

  // 9. SẠP ĐỒ CÚNG, NHANG ĐÈN & VÀNG MÃ (Góc phải x: 1088..1200)
  pxBevelBox(x,1088,64,112,14,'#991B1B','#DC2626','#7F1D1D');pxText(x,'DO CUNG - NHANG DEN',1098,69,'#FEF08A',1);
  R(x,1088,79,112,87,INK);R(x,1089,80,110,84,'#5C381E');
  drawStripedAwning(x,1088,78,112,10,'#B91C1C','#FACC15',7);
  // Bó nhang đỏ, vàng mã vàng rực, đèn cầy & lư hương đồng
  for(var ix=1094;ix<1150;ix+=14){
    R(x,ix,92,10,18,INK);R(x,ix+1,93,8,16,'#FACC15');R(x,ix+1,93,8,5,'#DC2626');R(x,ix+3,98,4,8,'#B91C1C');
  }
  // Lư hương đồng & cặp đèn cầy đỏ trên kệ cao
  pxBevelBox(x,1158,96,16,12,'#D99B38','#F5CA72','#8C5C18');
  R(x,1178,94,5,14,INK);R(x,1179,95,3,12,'#EF4444');R(x,1180,92,1,3,'#FDE047');
  R(x,1188,94,5,14,INK);R(x,1189,95,3,12,'#EF4444');R(x,1190,92,1,3,'#FDE047');
  drawWoodCounter(x,1088,124,112,42,'#FEF3C7','#7F1D1D');
  drawBambooBasket(x,1104,166,'#FACC15');
  drawHangingLantern(x,1144,88,'#EF4444');
  drawPerson16Bit(x,1142,169,{shirt:'#B91C1C',pants:'#1E293B',hat:'nonla',apron:'#FEF08A'});
}

// 7 CỤM TRUNG TÂM SO LE TỰ NHIÊN (NHÔ/THỤT ±10..14px, ĐÔNG ĐÚC CHEN LẤN — y: 214..298)
function drawCentralIslands(x){
  // Cụm 1 (x: 54..194, y=224 NHÔ LÊN): TRÁI CÂY "1029 NGỌC HẢO" (Mái chóp sọc vàng-kem + Tháp trái cây shape4)
  drawWoodCounter(x,54,234,140,48,'#F3E7CE',MK_PAL.wood);
  drawFruitPyramid(x,64,235,'mango');
  drawFruitPyramid(x,92,235,'dragon');
  drawFruitPyramid(x,122,235,'durian');
  drawFruitPyramid(x,152,235,'mango');
  drawPitchedCanopy(x,54,208,140,24,'#E0A33A','#FFF8E7');
  pxText(x,'1029 NGOC HAO',88,264,'#FEF08A',1);
  drawBambooBasket(x,62,286,'#FACC15');drawBambooBasket(x,182,284,'#EC4899');drawScale(x,178,234);
  drawPerson16Bit(x,116,288,{shirt:'#FFFBF1',pants:'#1E293B',hat:'nonla',apron:'#15803D'});
  drawPerson16Bit(x,144,290,{shirt:'#38BDF8',pants:'#334155',tourist:true,hair:'#FDE047',bag:'#FFFBF1'});

  // Cụm 2 (x: 212..340, y=240 THỤT XUỐNG): HẢI SẢN TƯƠI ĐÁ BÀO + MẸT TÔM CUA shape4
  drawWoodCounter(x,212,244,128,48,'#BAE6FD','#1E3A8A');
  drawStripedAwning(x,212,232,128,13,'#1D4ED8','#E0F2FE',7);
  drawSeafoodTray(x,220,246);drawSeafoodTray(x,246,246);drawSeafoodTray(x,272,246);drawSeafoodTray(x,298,246);
  drawScale(x,320,246);
  pxText(x,'HAI SAN TUOI',246,276,'#FFFFFF',1);
  drawBambooBasket(x,224,294,'#FB923C');
  drawPerson16Bit(x,272,298,{shirt:'#38BDF8',pants:'#334155',hat:'nonla',apron:'#FFFBF1'});
  drawPerson16Bit(x,298,298,{shirt:'#EF4444',pants:'#1F2937',hat:'bun',bag:'#FFFBF1'});

  // Cụm 3 (x: 358..484, y=226 NHÔ LÊN): NÔNG SẢN & RAU CỦ TƯƠI
  drawWoodCounter(x,358,234,126,48,'#DCFCE7','#166534');
  drawStripedAwning(x,358,222,126,13,'#2D6A5B','#DCFCE7',7);
  drawWoodenCrate(x,364,236,38,15,'veg');
  drawWoodenCrate(x,406,236,38,15,'orange');
  [450,466].forEach(function(mx){R(x,mx,236,14,12,INK);R(x,mx+1,237,12,10,'#FCA5A5');R(x,mx+3,239,8,4,'#B91C1C');});
  pxText(x,'NONG SAN RAU CU',386,266,'#FEF08A',1);
  drawBambooBasket(x,370,286,'#22C55E');drawBambooBasket(x,474,284,'#F97316');
  drawPerson16Bit(x,418,288,{shirt:'#FEF08A',pants:'#1E293B',hat:'bun',apron:'#FFFBF1'});

  // Cụm 4 (x: 502..648, y=242 THỤT XUỐNG): BÀN ĂN KHU ẨM THỰC 1 ĐÔNG KHÁCH
  pxShadow(x,502,292,146,5);
  drawPerson16Bit(x,524,254,{shirt:'#38BDF8',pants:'#334155',hat:'cap',tourist:true,sit:true});
  drawPerson16Bit(x,568,254,{shirt:'#10B981',pants:'#1E293B',tourist:true,hair:'#DC2626',sit:true});
  drawPerson16Bit(x,616,254,{shirt:'#EC4899',pants:'#374151',hat:'bucket',tourist:true,sit:true});
  pxBevelBox(x,502,246,146,22,MK_PAL.woodLt,MK_PAL.creamHi,MK_PAL.wood);
  R(x,512,268,8,22,INK);R(x,628,268,8,22,INK);
  [524,568,616].forEach(function(bx){E(x,bx,252,6,3,INK);E(x,bx,252,5,2,'#FFFBF1');R(x,bx-2,251,4,1,'#EA580C');});
  drawInoxStool(x,522,278);drawInoxStool(x,568,278);drawInoxStool(x,614,278);

  // Cụm 5 (x: 666..786, y=226 NHÔ LÊN): DỤNG CỤ HẰNG NGÀY & BẾP NÚC
  drawWoodCounter(x,666,234,120,48,'#F3E7CE','#9A3412');
  drawStripedAwning(x,666,222,120,13,'#C85A38','#FFF8E7',7);
  [676,698,720].forEach(function(px4){pxBevelBox(x,px4,234,16,12,'#CBD5E1','#F8FAFC','#64748B');});
  [746,766].forEach(function(bx2){E(x,bx2,238,7,5,INK);E(x,bx2,238,6,4,'#D99B38');});
  pxText(x,'DUNG CU GIA DUNG',686,266,'#FFF8D6',1);
  drawBambooBasket(x,676,286,'#DC2626');
  drawPerson16Bit(x,726,288,{shirt:'#E0452B',pants:'#1E293B',hat:'nonla'});

  // Cụm 6 (x: 804..928, y=242 THỤT XUỐNG): QUẦN ÁO & DÉP LÀO GIÁ RẺ
  drawWoodCounter(x,804,244,124,48,'#FEF08A','#6D28D9');
  drawStripedAwning(x,804,232,124,13,'#7C3AED','#FEF9C3',7);
  for(var dx2=812;dx2<914;dx2+=16){
    R(x,dx2,246,12,8,INK);R(x,dx2+1,247,10,6,['#EF4444','#3B82F6','#22C55E','#FACC15','#EC4899'][(dx2/16)|0 % 5]);
  }
  pxText(x,'DEP LAO QUAN AO',828,276,'#FFFFFF',1);
  drawPerson16Bit(x,862,298,{shirt:'#F472B6',pants:'#1E293B',hat:'bun',bag:'#38BDF8'});

  // Cụm 7 (x: 946..1136, y=224 NHÔ LÊN): QUÀ LƯU NIỆM SÀI GÒN (Mái chóp đỏ đất-vàng)
  drawWoodCounter(x,946,234,190,48,'#E5BA7E',MK_PAL.wood);
  [966,994,1022,1050].forEach(function(nx){
    E(x,nx,236,8,3,INK);E(x,nx,236,7,2,'#FDE68A');R(x,nx-3,232,6,2,'#F59E0B');R(x,nx-1,230,2,2,'#FDE68A');
  });
  [1076,1096,1116].forEach(function(gx){drawCeramicVase(x,gx,228,'#2563EB');});
  drawPitchedCanopy(x,946,208,190,24,'#C85A38','#FEF08A');
  pxText(x,'LUU NIEM SAI GON',1004,266,'#FFF8D6',1);
  drawBambooBasket(x,1120,286,'#EC4899');
  drawPerson16Bit(x,1020,288,{shirt:'#FFFBF1',pants:'#1E293B',hat:'bun',bag:'#F4B93B'});
  drawPerson16Bit(x,1050,290,{shirt:'#10B981',pants:'#334155',tourist:true,camera:true,shades:true});
}

// 8 CỤM TẦNG NAM SO LE PHỦ KÍN x: 4..1196 (NHÔ/THỤT ±10..14px, KHÔNG CÒN RÌA NÂU!)
function drawSouthStalls(x){
  // Cụm 1 (x: 4..128, y=370 NHÔ LÊN): SẠP GÓC ĐỒ CÚNG & HOA CÚC
  drawWoodCounter(x,4,376,124,50,'#FEF3C7','#991B1B');
  drawStripedAwning(x,4,364,124,13,'#DC2626','#FACC15',7);
  [20,44,68].forEach(function(fx){E(x,fx,378,7,5,INK);E(x,fx,378,6,4,'#FACC15');E(x,fx+1,376,2,2,'#F97316');});
  [92,108].forEach(function(nx){R(x,nx,372,8,12,INK);R(x,nx+1,373,6,10,'#EF4444');R(x,nx+1,373,6,3,'#FDE047');});
  pxText(x,'HOA CUC - NHANG',28,408,'#FEF08A',1);
  drawBambooBasket(x,18,430,'#FACC15');

  // Cụm 2 (x: 144..276, y=386 THỤT XUỐNG): XE NƯỚC MÍA & DỪA XIÊM
  drawWoodCounter(x,144,388,132,48,'#E0F2FE','#15803D');
  drawStripedAwning(x,144,376,132,13,'#22C55E','#FFFBF1',7);
  pxBevelBox(x,152,384,20,13,'#DC2626','#EF4444','#991B1B');
  pxBevelBox(x,182,380,20,17,'#CBD5E1','#F8FAFC','#64748B');
  [214,226,238].forEach(function(dx){E(x,dx,392,5,4,INK);E(x,dx,392,4,3,'#65A30D');});
  pxText(x,'NUOC MIA DUA',176,418,'#FEF08A',1);
  drawPerson16Bit(x,256,414,{shirt:'#FEF08A',pants:'#1E293B',hat:'nonla',sit:true});

  // Cụm 3 (x: 292..424, y=372 NHÔ LÊN): CHÈ BA MÀU & BÁNH DÂN GIAN
  drawWoodCounter(x,292,378,132,50,'#FFFBF1','#9D174D');
  drawStripedAwning(x,292,366,132,13,'#EC4899','#FFF8E7',7);
  for(var kx=304;kx<406;kx+=24){
    pxBevelBox(x,kx,376,18,11,'#DCEEFA','#FFFFFF','#94A3B8');
    R(x,kx+2,380,5,5,'#FACC15');R(x,kx+9,380,5,5,'#22C55E');
  }
  pxText(x,'CHE BA MAU',332,410,'#FEF08A',1);
  drawBambooBasket(x,306,432,'#22C55E');

  // Cụm 4 (x: 440..594, y=388 THỤT XUỐNG): DÃY BÀN GHẾ NHỰA VỈA HÈ ĐÔNG NGHẸT
  pxShadow(x,440,436,154,5);
  drawPerson16Bit(x,462,402,{shirt:'#38BDF8',pants:'#1E293B',tourist:true,hair:'#FDE047',sit:true});
  drawPerson16Bit(x,508,402,{shirt:'#F472B6',pants:'#334155',hat:'nonla',sit:true});
  drawPerson16Bit(x,558,402,{shirt:'#F59E0B',pants:'#1F2937',tourist:true,shades:true,sit:true});
  pxBevelBox(x,440,394,154,24,MK_PAL.woodLt,MK_PAL.creamHi,MK_PAL.wood);
  R(x,452,418,8,16,INK);R(x,574,418,8,16,INK);
  [462,508,558].forEach(function(cx){R(x,cx,396,5,7,INK);R(x,cx+1,397,3,5,'#8B5A2B');R(x,cx+2,393,1,3,'#FFFBF1');});
  drawPlasticStool(x,460,428,'#DC2626');drawPlasticStool(x,506,428,'#2563EB');drawPlasticStool(x,556,428,'#DC2626');

  // Cụm 5 (x: 610..742, y=374 NHÔ LÊN): ĐỒ KHÔ, TÔM KHÔ & MẮM NÊM
  drawWoodCounter(x,610,378,132,50,'#FEF3C7','#B45309');
  drawStripedAwning(x,610,366,132,13,'#D97706','#FFF8E7',7);
  [624,648,672,696,720].forEach(function(bx){
    E(x,bx,382,8,5,INK);E(x,bx,382,7,4,'#F59E0B');R(x,bx-4,380,8,2,'#EA580C');
  });
  drawScale(x,722,380);
  pxText(x,'DO KHO TOM KHO',642,410,'#FEF08A',1);

  // Cụm 6 (x: 758..892, y=386 THỤT XUỐNG): CÀ PHÊ SỮA ĐÁ & SINH TỐ
  drawWoodCounter(x,758,388,134,48,'#F3E7CE','#4B3C32');
  drawStripedAwning(x,758,376,134,13,'#2D6A5B','#F5E9CE',7);
  [772,792,812,832,852,872].forEach(function(sx,i){
    R(x,sx,384,7,10,INK);R(x,sx+1,385,5,8,['#8B5A2B','#22C55E','#FACC15','#F472B6','#8B5A2B','#FB923C'][i]);
  });
  pxText(x,'CA PHE SINH TO',792,418,'#FEF08A',1);

  // Cụm 7 (x: 908..1046, y=372 NHÔ LÊN): HOA TƯƠI & GỐM SƠN MÀI
  drawWoodCounter(x,908,378,138,50,'#E5C29F','#7C2D12');
  drawStripedAwning(x,908,366,138,13,'#B83232','#FEF08A',7);
  [926,950,974].forEach(function(fx){E(x,fx,378,7,5,INK);E(x,fx,378,6,4,'#FACC15');E(x,fx+2,376,3,2,'#F97316');});
  [1000,1022].forEach(function(lx){E(x,lx,378,7,5,INK);E(x,lx,378,6,4,'#F472B6');E(x,lx+1,376,3,2,'#FFFBF1');});
  pxText(x,'HOA TUOI GOM SU',940,410,'#FEF08A',1);
  drawBambooBasket(x,1034,432,'#FACC15');

  // Cụm 8 (x: 1062..1196, y=384 THỤT XUỐNG): SẠP GÓC GIẤY TỜ, SỔ TAY & TẠP HÓA
  drawWoodCounter(x,1062,386,134,50,'#DBEAFE','#1E40AF');
  drawStripedAwning(x,1062,374,134,13,'#2563EB','#FEF9C3',7);
  for(var tx3=1070;tx3<1184;tx3+=18){
    pxBevelBox(x,tx3,384,14,10,'#FFFBF1','#FFFFFF','#94A3B8');
    R(x,tx3+2,386,10,2,['#DC2626','#16A34A','#D97706','#2563EB'][(tx3/18)|0 % 4]);
  }
  pxText(x,'TAP HOA - BAO',1098,418,'#FEF08A',1);
  drawPerson16Bit(x,1124,442,{shirt:'#38BDF8',pants:'#1E293B',hat:'cap',bag:'#FEF08A'});
}

// MÊ CUNG 6 HÀNG SẠP CHẬT CHỘI (WORLD_H = 760 — Quyết định 217)
function drawRow2Stalls(x){
  x.save();x.translate(0,-24);drawCentralIslands(x);x.restore();
}

// HÀNG 3 (y: 304..364): Vải Lụa, Mắt Kính, Túi Xách Da, Bún Riêu Cơm Tấm, Đồ Cúng, Báo Vé Số, Cà Phê Vợt
function drawRow3Stalls(x){
  var stalls=[
    {x:42,y:310,w:146,c1:'#7C3AED',c2:'#FEF08A',front:'#581C87',title:'VAI LUA TO TAM',kind:'fabric'},
    {x:204,y:318,w:136,c1:'#0284C7',c2:'#E0F2FE',front:'#1E3A8A',title:'MAT KINH DONG HO',kind:'watch'},
    {x:356,y:308,w:142,c1:'#B45309',c2:'#FEF3C7',front:'#78350F',title:'TUI XACH DA',kind:'bags'},
    {x:514,y:316,w:158,c1:'#DC2626',c2:'#FFFBF1',front:'#991B1B',title:'BUN RIEU COM TAM',kind:'pho'},
    {x:688,y:308,w:144,c1:'#B91C1C',c2:'#FACC15',front:'#7F1D1D',title:'VANG MA NHANG',kind:'offering'},
    {x:848,y:318,w:144,c1:'#0369A1',c2:'#FEF9C3',front:'#0C4A6E',title:'BAO CHI VE SO',kind:'paper'},
    {x:1008,y:310,w:154,c1:'#4B3C32',c2:'#F5E9CE',front:'#2B2118',title:'CA PHE VOT SG',kind:'coffee'}
  ];
  stalls.forEach(function(s){
    drawWoodCounter(x,s.x,s.y,s.w,46,'#FFF8E7',s.front);
    drawStripedAwning(x,s.x,s.y-11,s.w,12,s.c1,s.c2,7);
    if(s.kind==='pho'){drawPhoBowl(x,s.x+14,s.y+2);drawPhoBowl(x,s.x+46,s.y+2);drawPhoBowl(x,s.x+82,s.y+2);drawPhoBowl(x,s.x+116,s.y+2);}
    else if(s.kind==='fabric'){for(var fx=s.x+8;fx<s.x+s.w-16;fx+=18)pxBevelBox(x,fx,s.y+2,14,7,['#EC4899','#38BDF8','#FACC15','#22C55E'][(fx/18)|0 % 4],'rgba(255,255,255,0.3)','rgba(0,0,0,0.2)');}
    else if(s.kind==='offering'){for(var ix=s.x+10;ix<s.x+s.w-14;ix+=18){R(x,ix,s.y+2,10,9,INK);R(x,ix+1,s.y+3,8,7,'#FACC15');R(x,ix+1,s.y+3,8,3,'#DC2626');}}
    else{for(var gx=s.x+10;gx<s.x+s.w-16;gx+=20){pxBevelBox(x,gx,s.y+2,14,8,'#E0F2FE','#FFFFFF','#94A3B8');}}
    pxText(x,s.title,s.x+16,s.y+26,'#FEF08A',1);
    drawPerson16Bit(x,s.x+(s.w>>1),s.y+50,{shirt:s.c2,pants:'#1E293B',hat:'nonla',apron:'#FFFBF1'});
  });
}

// HÀNG 4 (y: 404..464): Bánh Xèo Gỏi Cuốn, Mực Nướng Hải Sản Khô, Gia Vị, Bàn Ăn Hẻm Sâu, Chè Thái, Sinh Tố, Nón Lá
function drawRow4Stalls(x){
  var stalls=[
    {x:36,y:414,w:152,c1:'#E0A33A',c2:'#FFFBF1',front:'#9A3412',title:'BANH XEO GOI CUON',kind:'banh'},
    {x:204,y:406,w:146,c1:'#EA580C',c2:'#FEF08A',front:'#7C2D12',title:'MUC NUONG KHO',kind:'sea'},
    {x:366,y:416,w:142,c1:'#15803D',c2:'#DCFCE7',front:'#14532D',title:'MAM NEM GIA VI',kind:'jar'},
    {x:524,y:412,w:160,c1:'#C85A38',c2:'#F5E9CE',front:'#8C5832',title:'BAN AN HEM SAU',kind:'dining'},
    {x:700,y:406,w:144,c1:'#EC4899',c2:'#FFF8E7',front:'#9D174D',title:'CHE THAI SAM BO',kind:'che'},
    {x:860,y:416,w:144,c1:'#22C55E',c2:'#FEF9C3',front:'#166534',title:'NUOC EP SINH TO',kind:'fruit'},
    {x:1020,y:408,w:156,c1:'#D97706',c2:'#FFFBEB',front:'#78350F',title:'NON LA THU CONG',kind:'nonla'}
  ];
  stalls.forEach(function(s){
    if(s.kind==='dining'){
      pxShadow(x,s.x,s.y+44,s.w,4);
      drawPerson16Bit(x,s.x+20,s.y+8,{shirt:'#38BDF8',pants:'#1E293B',tourist:true,sit:true});
      drawPerson16Bit(x,s.x+72,s.y+8,{shirt:'#F472B6',pants:'#334155',hat:'nonla',sit:true});
      drawPerson16Bit(x,s.x+124,s.y+8,{shirt:'#F59E0B',pants:'#1F2937',tourist:true,shades:true,sit:true});
      pxBevelBox(x,s.x,s.y+4,s.w,20,MK_PAL.woodLt,MK_PAL.creamHi,MK_PAL.wood);
      drawPhoBowl(x,s.x+20,s.y+6);drawBanhCuonPlate(x,s.x+72,s.y+6);drawPhoBowl(x,s.x+122,s.y+6);
      drawPlasticStool(x,s.x+22,s.y+30,'#DC2626');drawPlasticStool(x,s.x+74,s.y+30,'#2563EB');drawPlasticStool(x,s.x+126,s.y+30,'#DC2626');
      return;
    }
    drawWoodCounter(x,s.x,s.y,s.w,46,'#FFF8E7',s.front);
    drawStripedAwning(x,s.x,s.y-11,s.w,12,s.c1,s.c2,7);
    if(s.kind==='banh'){drawBanhCuonPlate(x,s.x+16,s.y+2);drawBanhCuonPlate(x,s.x+56,s.y+2);drawBanhCuonPlate(x,s.x+98,s.y+2);}
    else if(s.kind==='sea'){drawSeafoodTray(x,s.x+14,s.y+2);drawSeafoodTray(x,s.x+58,s.y+2);drawSeafoodTray(x,s.x+102,s.y+2);}
    else if(s.kind==='fruit'){drawFruitPyramid(x,s.x+16,s.y+2,'mango');drawFruitPyramid(x,s.x+56,s.y+2,'dragon');drawFruitPyramid(x,s.x+98,s.y+2,'durian');}
    else if(s.kind==='nonla'){for(var nx=s.x+20;nx<s.x+s.w-16;nx+=26){E(x,nx,s.y+6,9,3,INK);E(x,nx,s.y+6,8,2,'#FDE68A');R(x,nx-3,s.y+2,6,2,'#F59E0B');}}
    else{for(var jx=s.x+12;jx<s.x+s.w-16;jx+=18){R(x,jx,s.y+2,9,9,INK);R(x,jx+1,s.y+3,7,7,'#E0F2FE');R(x,jx+2,s.y+5,5,4,'#F59E0B');}}
    pxText(x,s.title,s.x+14,s.y+26,'#FEF08A',1);
    drawBambooBasket(x,s.x+14,s.y+48,s.c1);
  });
}

// HÀNG 5 (y: 504..564): Đồ Nhựa Rổ Rá, Chăn Ga Gối, Giày Dép, Bánh Mứt Tết, Gốm Sứ Bát Tràng, Cây Cảnh, Tạp Hóa
function drawRow5Stalls(x){
  var stalls=[
    {x:44,y:510,w:148,c1:'#2563EB',c2:'#FFFBF1',front:'#1E3A8A',title:'DO NHUA RO RA',kind:'plastic'},
    {x:208,y:518,w:142,c1:'#EC4899',c2:'#FCE7F3',front:'#831843',title:'CHAN GA GOI DEM',kind:'fabric'},
    {x:366,y:508,w:146,c1:'#3D5A80',c2:'#F5E9CE',front:'#1E293B',title:'GIAY DEP THOI TRANG',kind:'shoes'},
    {x:528,y:516,w:152,c1:'#DC2626',c2:'#FEF08A',front:'#991B1B',title:'BANH MUT TET SG',kind:'mut'},
    {x:696,y:508,w:146,c1:'#0369A1',c2:'#E0F2FE',front:'#0C4A6E',title:'GOM SU BAT TRANG',kind:'vase'},
    {x:858,y:518,w:142,c1:'#16A34A',c2:'#DCFCE7',front:'#14532D',title:'CAY CANH HOA GIA',kind:'flower'},
    {x:1016,y:510,w:160,c1:'#D97706',c2:'#FEF9C3',front:'#78350F',title:'TAP HOA TONG HOP',kind:'misc'}
  ];
  stalls.forEach(function(s){
    drawWoodCounter(x,s.x,s.y,s.w,46,'#F3E7CE',s.front);
    drawStripedAwning(x,s.x,s.y-11,s.w,12,s.c1,s.c2,7);
    if(s.kind==='vase'){for(var vx=s.x+16;vx<s.x+s.w-18;vx+=22)drawCeramicVase(x,vx,s.y-1,'#2563EB');}
    else if(s.kind==='flower'){for(var fx=s.x+18;fx<s.x+s.w-16;fx+=24){E(x,fx,s.y+5,7,5,INK);E(x,fx,s.y+5,6,4,'#FACC15');E(x,fx+1,s.y+3,3,2,'#EC4899');}}
    else{for(var kx=s.x+10;kx<s.x+s.w-16;kx+=18){pxBevelBox(x,kx,s.y+2,14,8,['#EF4444','#3B82F6','#22C55E','#FACC15','#F97316'][(kx/18)|0 % 5],'rgba(255,255,255,0.28)','rgba(0,0,0,0.2)');}}
    pxText(x,s.title,s.x+14,s.y+26,'#FEF08A',1);
    drawPerson16Bit(x,s.x+(s.w>>1),s.y+50,{shirt:s.c1,pants:'#1E293B',hat:'bun',bag:'#FFFBF1'});
  });
}

// HÀNG 6 (y: 604..668 — Tầng đáy chợ): 8 cụm so le từ drawSouthStalls
function drawRow6Stalls(x){
  x.save();x.translate(0,234);drawSouthStalls(x);x.restore();
}

// 12 QUẦY CÓC, GÁNH HÀNG RONG, XE BÁNH MÌ & BÀN NHỰA MINI CHEN KÍN KHOẢNG TRỐNG KHẮP 6 HÀNG!
function drawExtraMicroStalls(x){
  var spots=[
    {x:18,y:224,kind:'ganh',vShirt:'#F59E0B',vHat:'nonla',bShirt:'#38BDF8'},
    {x:196,y:252,kind:'baskets',vShirt:'#EC4899',vHat:'bun',bShirt:'#FEF08A'},
    {x:342,y:254,kind:'banhmi',vShirt:'#FFFBF1',vHat:'cap',bShirt:'#10B981'},
    {x:650,y:254,kind:'ganh',vShirt:'#EF4444',vHat:'nonla',bShirt:'#FACC15'},
    {x:930,y:254,kind:'banhmi',vShirt:'#38BDF8',vHat:'cap',bShirt:'#F97316'},
    {x:1148,y:224,kind:'ganh',vShirt:'#A855F7',vHat:'nonla',bShirt:'#FFFBF1'},
    {x:188,y:452,kind:'table',vShirt:'#F472B6',vHat:'nonla',bShirt:'#6366F1'},
    {x:684,y:452,kind:'ganh',vShirt:'#22C55E',vHat:'bun',bShirt:'#EC4899'},
    {x:350,y:554,kind:'baskets',vShirt:'#F97316',vHat:'nonla',bShirt:'#38BDF8'},
    {x:842,y:554,kind:'banhmi',vShirt:'#14B8A6',vHat:'bun',bShirt:'#EF4444'},
    {x:278,y:660,kind:'table',vShirt:'#F97316',vHat:'nonla',bShirt:'#38BDF8'},
    {x:742,y:660,kind:'table',vShirt:'#14B8A6',vHat:'bun',bShirt:'#EF4444'}
  ];
  spots.forEach(function(s){
    drawStreetVendorCart(x,s.x,s.y,s.kind);
    drawPerson16Bit(x,s.x+6,s.y+4,{shirt:s.vShirt,pants:'#1E293B',hat:s.vHat,apron:'#FFFBF1'});
    drawPerson16Bit(x,s.x+18,s.y+18,{shirt:s.bShirt,pants:'#334155',tourist:((s.x%3)===0),bag:'#FFFBF1'});
  });
}
`;
}
