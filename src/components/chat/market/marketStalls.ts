/**
 * 7 Shop Bắc Kín Ngang + 6 Đảo Trung Tâm & 6 Sạp Nam Sát Kề Nhau (Quyết định 213)
 */
export function buildMarketStallsScript(): string {
  return `
function drawNorthStalls(x){
  // Cột bê tông vàng kem phân cách các sạp sát vách nhau
  [72,220,368,524,680,828,976,1126].forEach(function(cx){
    pxBevelBox(x,cx,64,4,100,'#E6D39F','#FFF6DA','#B89B58');
  });

  // 1. SHOP ÁO DÀI SÀI GÒN & ĐỒNG HỒ (chuyển từ Cửa 1 cũ — x: 76..220)
  pxBevelBox(x,76,64,144,15,'#9E2A2B','#DC2626','#6B1819');pxText(x,'AO DAI SAI GON',102,69,'#FFF8D6',1);
  // Tủ kính WATCH bên trái
  pxBevelBox(x,76,80,28,84,'#F3E7CE','#FFFFFF','#C7B291');
  R(x,78,82,24,10,'#9E2A2B');pxText(x,'WATCH',80,85,'#FFFFFF',1);
  R(x,78,94,24,48,INK);R(x,79,95,22,46,'#DCEEFA');
  for(var wy=100;wy<=128;wy+=14){
    for(var wx=83;wx<=93;wx+=10){
      R(x,wx+1,wy-3,2,10,'#4B3C32');E(x,wx+2,wy+1,3,3,INK);E(x,wx+2,wy+1,2,2,'#FFFBF1');
    }
  }
  // 4 Ma-nơ-canh Áo Dài lụa Việt Nam (Đỏ, Xanh, Vàng, Hồng) & Quầy lụa
  R(x,106,80,114,84,INK);R(x,107,81,112,62,'#5C4638');
  ['#DC2626','#2563EB','#D99B38','#EC4899'].forEach(function(col,i){
    var ax=114+i*24;
    R(x,ax+4,88,4,4,'#E5C29F');R(x,ax+3,92,6,2,col);R(x,ax+2,94,8,12,col);
    R(x,ax+3,106,6,14,col);R(x,ax+4,120,2,8,'#FFFBF1');R(x,ax+7,120,2,8,'#FFFBF1');
  });
  pxBevelBox(x,106,134,114,30,MK_PAL.wood,MK_PAL.woodLt,MK_PAL.woodDk);
  pxTag(x,120,130,14,'#FEF08A');pxTag(x,178,130,14,'#FEF08A');
  drawPerson16Bit(x,156,166,{shirt:'#EC4899',pants:'#1E293B',hat:'bun'});

  // 2. SẠP VẢI, TÚI XÁCH & GIÀY DÉP "HƯƠNG TRINH" (x: 224..368)
  pxBevelBox(x,224,64,144,15,'#1D4ED8','#3B82F6','#1E3A8A');pxText(x,'HUONG TRINH',254,69,'#FFFFFF',1);
  R(x,224,80,144,84,INK);R(x,225,81,142,82,'#5C4638');
  var clCols=['#DC2626','#2563EB','#D99B38','#245940','#EC4899','#7C3AED','#EA580C'];
  for(var cx2=230;cx2<322;cx2+=14){
    var c1=clCols[((cx2-230)/14)|0 % clCols.length];
    R(x,cx2,86,10,16,INK);R(x,cx2+1,87,8,14,c1);R(x,cx2+3,84,4,2,'#CBD5E1');
    R(x,cx2+2,91,6,2,'rgba(255,255,255,0.28)');
  }
  E(x,344,96,16,11,INK);E(x,344,96,15,10,'#38BDF8');E(x,344,98,10,6,'#FDE047');R(x,328,98,32,12,'#5C4638');
  pxBevelBox(x,224,122,144,42,MK_PAL.wood,MK_PAL.woodLt,MK_PAL.woodDk);
  for(var fy=125;fy<148;fy+=7){
    for(var fx=228;fx<324;fx+=20){
      var fCol=clCols[((fx+fy)/7)|0 % clCols.length];
      pxBevelBox(x,fx,fy,17,6,fCol,'rgba(255,255,255,0.3)','rgba(0,0,0,0.25)');
    }
  }
  pxBevelBox(x,332,128,28,16,'#D4A373','#E9C496','#9C6644');R(x,342,129,8,4,'#FFF8E7');
  drawPerson16Bit(x,284,166,{shirt:'#38BDF8',pants:'#374151',tourist:true,hair:'#D97706',backpack:'#EF4444',shades:true});

  // 3. SẠP ĐẶC SẢN TRÀ, CÀ PHÊ & MỨT "LIÊN SÀI GÒN" + "NGỌC HOA 823" (x: 372..524)
  pxBevelBox(x,372,64,78,15,'#15803D','#22C55E','#14532D');pxText(x,'LIEN SAI GON',382,69,'#FFFFFF',1);
  for(var bx=376;bx<446;bx+=8)R(x,bx,80,2,2,'#FFF8D6');
  R(x,372,84,78,80,INK);R(x,373,85,76,78,'#6A4A32');
  for(var jx=377;jx<444;jx+=10){
    var fill=['#F59E0B','#DC2626','#22C55E','#D97706'][(jx/10)|0 % 4];
    R(x,jx,90,7,12,INK);R(x,jx+1,91,5,10,'#E0F2FE');R(x,jx+1,95,5,6,fill);R(x,jx+1,88,5,2,'#DC2626');
  }
  pxBevelBox(x,372,122,78,42,MK_PAL.wood,MK_PAL.woodLt,MK_PAL.woodDk);
  for(var px2=376;px2<444;px2+=11){
    R(x,px2,126,8,10,INK);R(x,px2+1,127,6,8,'#FDE68A');R(x,px2+2,129,4,4,'#DC2626');
  }
  drawPerson16Bit(x,410,166,{shirt:'#F97316',pants:'#1E293B',hat:'nonla'});

  pxBevelBox(x,452,64,72,15,'#FFFBF1','#FFFFFF','#CBD5E1');pxText(x,'NGOC HOA 823',460,69,'#DC2626',1);
  R(x,452,80,72,84,INK);R(x,453,81,70,82,'#4B3C32');
  for(var sy=86;sy<118;sy+=14){
    R(x,455,sy,66,3,'#8C5E1A');
    for(var sx=458;sx<516;sx+=10)R(x,sx,sy-8,7,8,['#DC2626','#F4B93B','#22C55E','#EC4899'][((sx+sy)/10)|0 % 4]);
  }
  pxBevelBox(x,452,122,72,42,MK_PAL.wood,MK_PAL.woodLt,MK_PAL.woodDk);
  for(var rx=456;rx<518;rx+=12)R(x,rx,128,9,10,'#FFF8E7');

  // 4. VÒM KHU ĂN UỐNG & SẠP 1044 (x: 528..680)
  R(x,548,44,112,26,INK);R(x,549,45,110,24,'#EFE8D8');
  E(x,604,70,38,14,'#E6D6BE');E(x,604,70,36,12,'#E6D6BE');
  pxText(x,'KHU AN UONG',582,53,'#9E2A2B',1);
  drawRattanLamp(x,558,64);drawRattanLamp(x,650,64);
  pxBevelBox(x,530,72,72,13,'#F4B93B','#FEF08A','#B97A14');pxText(x,'SAP 1044',546,76,INK,1);
  pxBevelBox(x,606,72,72,13,'#EA580C','#FDBA74','#9A3412');pxText(x,'BUN MAM',620,76,'#FFFFFF',1);
  R(x,530,86,148,78,INK);R(x,531,87,146,34,'#DCEEFA');
  for(var fx2=536;fx2<670;fx2+=16){
    R(x,fx2,96,12,18,INK);R(x,fx2+1,97,10,16,['#FB923C','#F472B6','#4ADE80','#FACC15'][(fx2/16)|0 % 4]);
  }
  pxBevelBox(x,528,120,152,44,'#EFE9DD','#FFFFFF','#D1C7B7');
  for(var tx2=532;tx2<676;tx2+=16)R(x,tx2,122,1,40,'#CBD5E1');
  pxBevelBox(x,580,104,24,18,'#CBD5E1','#F8FAFC','#64748B');
  R(x,584,104,16,3,'#EA580C');
  drawPerson16Bit(x,636,118,{shirt:'#FFFBF1',pants:'#1E293B',chef:true});
  drawInoxStool(x,548,166);drawInoxStool(x,588,166);drawInoxStool(x,628,166);drawInoxStool(x,664,166);
  drawPerson16Bit(x,586,164,{shirt:'#1E293B',pants:'#334155',tourist:true,hair:'#9CA3AF',sit:true});

  // 5. SẠP BÁNH CUỐN 50K & BÁNH BÈO 20K (x: 684..828)
  pxBevelBox(x,684,64,72,15,'#FEF08A','#FFFBEB','#D97706');pxText(x,'BANH CUON 50',692,69,'#9E2A2B',1);
  pxBevelBox(x,758,64,70,15,'#FFFBF1','#FFFFFF','#CBD5E1');pxText(x,'BANH BEO 20K',766,69,'#1D4ED8',1);
  R(x,684,80,144,84,INK);R(x,685,81,142,82,'#5C4638');
  R(x,688,88,64,34,INK);R(x,689,89,62,32,'#FFF8E7');
  R(x,696,94,20,16,'#CBD5E1');R(x,698,96,16,12,'#FFFBF1');
  R(x,762,88,62,34,INK);R(x,763,89,60,32,'#DCEEFA');
  for(var dx=768;dx<818;dx+=14){R(x,dx,104,10,4,'#FFFBF1');R(x,dx+2,102,6,2,'#EA580C');}
  pxBevelBox(x,684,122,144,42,'#DFC484','#FFF0C2','#9A7B4F');
  for(var nx=692;nx<816;nx+=18){R(x,nx,128,12,7,'#4ADE80');R(x,nx+3,129,6,5,'#EC4899');}
  drawPerson16Bit(x,728,166,{shirt:'#F472B6',pants:'#1E293B',hat:'nonla'});

  // 6. SẠP PHỞ BÒ & BÚN BÒ HUẾ (x: 832..976)
  pxBevelBox(x,832,64,144,15,'#DC2626','#EF4444','#991B1B');pxText(x,'PHO BO - BUN BO',868,69,'#FEF08A',1);
  R(x,832,80,144,84,INK);R(x,833,81,142,82,'#6A4A32');
  // Tủ kính treo thịt & rau thơm + 2 Nồi nước lèo inox bốc khói
  R(x,838,88,68,32,INK);R(x,839,89,66,30,'#E0F2FE');
  [846,858,870].forEach(function(mx){R(x,mx,94,8,16,'#B91C1C');R(x,mx+2,96,4,10,'#FCA5A5');});
  [884,894].forEach(function(gx){E(x,gx,108,5,5,INK);E(x,gx,108,4,4,'#22C55E');});
  pxBevelBox(x,916,96,24,24,'#CBD5E1','#F8FAFC','#64748B');
  pxBevelBox(x,944,98,22,22,'#CBD5E1','#F8FAFC','#64748B');
  pxBevelBox(x,832,122,144,42,'#EFE9DD','#FFFFFF','#CBD5E1');
  drawInoxStool(x,854,166);drawInoxStool(x,904,166);drawInoxStool(x,952,166);
  drawPerson16Bit(x,902,164,{shirt:'#38BDF8',pants:'#1E293B',tourist:true,hair:'#FDE047',sit:true});

  // 7. SHOP QUẦN ÁO THỜI TRANG SÀI GÒN (chuyển từ Cửa Bắc cũ — x: 980..1126)
  pxBevelBox(x,980,64,146,15,'#7C3AED','#A855F7','#581C87');pxText(x,'THOI TRANG SAI GON',1010,69,'#FFFFFF',1);
  R(x,980,80,146,84,INK);R(x,981,81,144,82,'#4B3C32');
  // Thanh treo áo khoác, váy & sơ mi họa tiết sặc sỡ + nón vải
  var faCols=['#EC4899','#38BDF8','#FACC15','#22C55E','#EF4444','#F97316','#FFFBF1'];
  for(var fx3=986;fx3<1086;fx3+=14){
    var col2=faCols[((fx3-986)/14)|0 % faCols.length];
    R(x,fx3,88,11,22,INK);R(x,fx3+1,89,9,20,col2);R(x,fx3+4,85,3,3,'#E2E8F0');
    R(x,fx3+2,95,7,2,'rgba(255,255,255,0.3)');
  }
  // Kệ túi xách & giày thể thao bên phải
  pxBevelBox(x,1090,86,32,38,'#D4A373','#E9C496','#9C6644');
  [1094,1108].forEach(function(bx3){
    R(x,bx3,92,10,10,INK);R(x,bx3+1,93,8,8,'#DC2626');
    R(x,bx3,108,10,10,INK);R(x,bx3+1,109,8,8,'#2563EB');
  });
  // Quầy gỗ trưng bày áo gấp & thẻ giá
  pxBevelBox(x,980,126,146,38,MK_PAL.wood,MK_PAL.woodLt,MK_PAL.woodDk);
  for(var sx2=988;sx2<1112;sx2+=20){
    pxBevelBox(x,sx2,130,16,8,faCols[((sx2-988)/20)|0 % faCols.length],'rgba(255,255,255,0.3)','rgba(0,0,0,0.25)');
  }
  pxTag(x,1010,122,14,'#FEF08A');pxTag(x,1070,122,14,'#FEF08A');
  drawPerson16Bit(x,1044,166,{shirt:'#FEF08A',pants:'#1F2937',tourist:true,hat:'bucket',backpack:'#2563EB'});
}

// 6 ĐẢO TRUNG TÂM Y-SORTED SÁT KỀ NHAU (y: 230..290, khe hẻm 20px)
function drawCentralIslands(x){
  // Đảo 1 (x: 88..236): TRÁI CÂY "1029 NGỌC HẢO"
  pxShadow(x,88,288,148,5);
  pxBevelBox(x,88,236,148,54,'#15803D','#22C55E','#064E3B');
  R(x,89,237,146,16,'#F3E7CE');pxText(x,'1029 NGOC HAO',124,268,'#FEF08A',1);
  [104,120,136].forEach(function(mx){E(x,mx,239,6,4,INK);E(x,mx,239,5,3,'#FACC15');});
  [154,170,186].forEach(function(px3){E(x,px3,239,6,4,INK);E(x,px3,239,5,3,'#EC4899');E(x,px3+1,237,2,2,'#22C55E');});
  [206,222].forEach(function(dx){E(x,dx,238,6,5,INK);E(x,dx,238,5,4,'#4ADE80');R(x,dx-1,236,2,5,'#14532D');});
  drawPerson16Bit(x,148,228,{shirt:'#FFFBF1',pants:'#1E293B',hat:'nonla'});

  // Đảo 2 (x: 256..404): HẢI SẢN TƯƠI ĐÁ BÀO
  pxShadow(x,256,288,148,5);
  pxBevelBox(x,256,236,148,54,'#1E3A8A','#3B82F6','#172554');
  R(x,257,237,146,18,'#BAE6FD');pxText(x,'HAI SAN TUOI',296,268,'#FFFFFF',1);
  [272,294,316].forEach(function(hx){R(x,hx,238,14,9,INK);R(x,hx+1,239,12,7,'#E0F2FE');R(x,hx+3,241,8,3,'#FB923C');});
  [342,366,386].forEach(function(cx){E(x,cx,242,6,4,INK);E(x,cx,242,5,3,'#DC2626');});
  drawPerson16Bit(x,320,228,{shirt:'#38BDF8',pants:'#334155',hat:'nonla'});

  // Đảo 3 (x: 424..572): RAU CỦ & THỊT TƯƠI
  pxShadow(x,424,288,148,5);
  pxBevelBox(x,424,236,148,54,'#166534','#22C55E','#14532D');
  R(x,425,237,146,18,'#DCFCE7');pxText(x,'RAU CU THIT',466,268,'#FEF08A',1);
  [440,456,472].forEach(function(gx){E(x,gx,239,6,4,INK);E(x,gx,239,5,3,'#4ADE80');});
  [496,518,540].forEach(function(mx){R(x,mx,238,14,10,INK);R(x,mx+1,239,12,8,'#FCA5A5');R(x,mx+3,241,8,3,'#B91C1C');});
  drawPerson16Bit(x,486,228,{shirt:'#FEF08A',pants:'#1E293B',hat:'bun'});

  // Đảo 4 (x: 592..752): CỤM BÀN ĂN KHU ẨM THỰC 1
  pxShadow(x,592,288,160,5);
  drawPerson16Bit(x,618,248,{shirt:'#38BDF8',pants:'#334155',hat:'cap',tourist:true,sit:true});
  drawPerson16Bit(x,676,248,{shirt:'#10B981',pants:'#1E293B',tourist:true,hair:'#DC2626',sit:true});
  drawPerson16Bit(x,728,248,{shirt:'#EC4899',pants:'#374151',hat:'bucket',tourist:true,sit:true});
  pxBevelBox(x,592,240,160,22,MK_PAL.woodLt,MK_PAL.creamHi,MK_PAL.wood);
  R(x,604,262,8,24,INK);R(x,732,262,8,24,INK);
  [616,674,724].forEach(function(bx){E(x,bx,246,6,3,INK);E(x,bx,246,5,2,'#FFFBF1');R(x,bx-2,245,4,1,'#EA580C');});
  drawInoxStool(x,616,274);drawInoxStool(x,674,274);drawInoxStool(x,726,274);

  // Đảo 5 (x: 772..924): ĐỒ GIA DỤNG & BẾP NÚC
  pxShadow(x,772,288,152,5);
  pxBevelBox(x,772,236,152,54,'#9A3412','#EA580C','#7C2D12');
  R(x,773,237,150,16,'#F3E7CE');pxText(x,'DO GIA DUNG',814,268,'#FFF8D6',1);
  [788,814,840].forEach(function(px4){pxBevelBox(x,px4,234,16,12,'#CBD5E1','#F8FAFC','#64748B');});
  [872,896].forEach(function(bx2){E(x,bx2,238,8,5,INK);E(x,bx2,238,7,4,'#D99B38');});
  drawPerson16Bit(x,834,228,{shirt:'#E0452B',pants:'#1E293B',hat:'nonla'});

  // Đảo 6 (x: 944..1110): LƯU NIỆM SÀI GÒN (Nón lá, Túi cói, Gốm Bát Tràng)
  pxShadow(x,944,288,166,5);
  pxBevelBox(x,944,236,166,54,MK_PAL.wood,MK_PAL.woodLt,MK_PAL.woodDk);
  R(x,945,237,164,16,'#E5BA7E');pxText(x,'LUU NIEM SAI GON',978,268,'#FFF8D6',1);
  [966,994,1022].forEach(function(nx){
    E(x,nx,237,8,3,INK);E(x,nx,237,7,2,'#FDE68A');R(x,nx-3,233,6,2,'#F59E0B');R(x,nx-1,231,2,2,'#FDE68A');
  });
  [1054,1076,1096].forEach(function(gx){
    R(x,gx,228,8,12,INK);R(x,gx+1,229,6,10,'#2563EB');R(x,gx+2,232,4,3,'#E0F2FE');
  });
  drawPerson16Bit(x,1020,228,{shirt:'#FFFBF1',pants:'#1E293B',hat:'bun'});
}

// 6 HÀNG QUÁN TẦNG NAM Y-SORTED SÁT KỀ NHAU (y: 374..434, khe hẻm 20px)
function drawSouthStalls(x){
  // Sạp 1 (x: 88..236): XE NƯỚC MÍA & DỪA XIÊM
  pxShadow(x,88,432,148,5);
  pxBevelBox(x,88,378,148,56,'#15803D','#22C55E','#14532D');
  R(x,89,379,146,16,'#E0F2FE');pxText(x,'NUOC MIA DUA',122,408,'#FEF08A',1);
  pxBevelBox(x,96,374,22,14,'#DC2626','#EF4444','#991B1B');
  pxBevelBox(x,130,370,22,18,'#CBD5E1','#F8FAFC','#64748B');
  [164,176,188].forEach(function(dx){E(x,dx,382,5,4,INK);E(x,dx,382,4,3,'#65A30D');});
  drawPerson16Bit(x,208,404,{shirt:'#FEF08A',pants:'#1E293B',hat:'nonla',sit:true});

  // Sạp 2 (x: 256..404): CHÈ BA MÀU & BÁNH DÂN GIAN
  pxShadow(x,256,432,148,5);
  pxBevelBox(x,256,378,148,56,'#9D174D','#EC4899','#831843');
  R(x,257,379,146,16,'#FFFBF1');pxText(x,'CHE BA MAU',296,408,'#FEF08A',1);
  for(var kx=268;kx<386;kx+=26){
    pxBevelBox(x,kx,376,20,12,'#DCEEFA','#FFFFFF','#94A3B8');
    R(x,kx+3,380,6,5,'#FACC15');R(x,kx+11,380,6,5,'#22C55E');
  }

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
  pxShadow(x,604,432,148,5);
  pxBevelBox(x,604,378,148,56,'#B45309','#D97706','#78350F');
  R(x,605,379,146,16,'#FEF3C7');pxText(x,'DO KHO TOM KHO',640,408,'#FEF08A',1);
  [620,646,672,698,724].forEach(function(bx){
    E(x,bx,382,9,6,INK);E(x,bx,382,8,5,'#F59E0B');R(x,bx-4,380,8,2,'#EA580C');
  });

  // Sạp 5 (x: 772..924): CÀ PHÊ SỮA ĐÁ & SINH TỐ BƠ XOÀI
  pxShadow(x,772,432,152,5);
  pxBevelBox(x,772,378,152,56,'#4B3C32','#78350F','#2B2118');
  R(x,773,379,150,16,'#F3E7CE');pxText(x,'CA PHE SINH TO',808,408,'#FEF08A',1);
  [788,808,828,850,872,894].forEach(function(sx,i){
    R(x,sx,374,7,10,INK);R(x,sx+1,375,5,8,['#8B5A2B','#22C55E','#FACC15','#F472B6','#8B5A2B','#FB923C'][i]);
  });

  // Sạp 6 (x: 944..1110): HOA TƯƠI & GỐM SƠN MÀI
  pxShadow(x,944,432,166,5);
  pxBevelBox(x,944,382,166,52,'#7C2D12','#B45309','#451A03');
  R(x,945,383,164,14,'#E5C29F');pxText(x,'HOA TUOI GOM SU',984,410,'#FEF08A',1);
  [964,992,1020].forEach(function(fx){E(x,fx,380,8,6,INK);E(x,fx,380,7,5,'#FACC15');E(x,fx+2,378,3,3,'#F97316');});
  [1050,1074,1096].forEach(function(lx){E(x,lx,380,8,6,INK);E(x,lx,380,7,5,'#F472B6');E(x,lx+1,378,3,3,'#FFFBF1');});
}
`;
}
