/**
 * Kiến trúc Chợ Bến Thành: Mái vòm kèo thép, Giếng trời, Sàn gạch 16x16 có vết mòn & 2 Cổng vòm thuộc địa (Quyết định 212)
 */
export function buildMarketArchitectureScript(): string {
  return `
function drawAccordionGate(c,x0,y0,w,h){
  R(c,x0,y0,w,h,'#C8C2B4');
  for(var gx=x0;gx<x0+w;gx+=4){R(c,gx,y0,1,h,'#6B665C');R(c,gx+1,y0,1,h,'#EAE6DC');}
  for(var gy=y0+2;gy<y0+h-4;gy+=8){
    for(var gx2=x0+1;gx2<x0+w-2;gx2+=4){
      R(c,gx2,gy,2,1,'#7A746A');R(c,gx2+1,gy+2,2,1,'#7A746A');R(c,gx2,gy+4,2,1,'#7A746A');
    }
  }
  // Đinh tán kim loại
  for(var ry=y0+6;ry<y0+h-6;ry+=16){R(c,x0+2,ry,2,2,'#F8FAFC');R(c,x0+w-4,ry,2,2,'#F8FAFC');}
}

function drawRattanLamp(c,cx,y0){
  R(c,cx,y0-16,1,16,INK);
  E(c,cx,y0+3,8,5,INK);E(c,cx,y0+3,7,4,'#C99A5B');
  R(c,cx-6,y0+2,13,1,'#8C5E1A');R(c,cx-4,y0+4,9,1,'#8C5E1A');
  R(c,cx-3,y0,1,6,'#E5BA7E');R(c,cx+3,y0,1,6,'#E5BA7E');
  R(c,cx-2,y0+5,5,2,'#FFF8D6');R(c,cx-1,y0+6,3,1,'#FFE08A');
}

function drawFloorAndCeiling(x,WORLD_W,WORLD_H){
  // 1. MÁI VÒM BÊ TÔNG & KÈO THÉP CHỮ A (y: 0..64)
  R(x,0,0,WORLD_W,64,'#382B22');
  for(var gx=0;gx<WORLD_W;gx+=8)R(x,gx,0,1,62,'rgba(0,0,0,0.22)');
  for(var gy=0;gy<62;gy+=6)R(x,0,gy,WORLD_W,1,'rgba(0,0,0,0.22)');
  // Giếng trời lấy sáng ấm
  for(var sk=28;sk<WORLD_W;sk+=120){
    R(x,sk,4,64,26,'#C86446');R(x,sk+2,6,60,22,'#FBE6C4');
    for(var nx=sk+12;nx<sk+64;nx+=12)R(x,nx,4,1,26,'#8A3E29');
    R(x,sk,13,64,1,'#8A3E29');R(x,sk,22,64,1,'#8A3E29');
  }
  // Hệ trụ vòm bê tông vàng đất có bóng đổ & ống dẫn điện
  R(x,0,52,WORLD_W,2,'#52525B'); // ống dây điện chạy dọc mái
  for(var tx=0;tx<WORLD_W;tx+=120){
    R(x,tx,0,10,64,'#D99B38');R(x,tx+1,0,3,64,'#F5CA72');R(x,tx+7,0,3,64,'#8C5C18');
    for(var k=0;k<22;k++){
      var archY=Math.round(34-(k*k)*0.065);
      R(x,tx+10+k*2,archY,3,4,'#D99B38');R(x,tx+110-k*2,archY,3,4,'#D99B38');
    }
  }
  R(x,0,62,WORLD_W,2,INK);
  // Tường vữa kem cũ có độ nhám tự nhiên (y: 64..164)
  pxDitherRect(x,0,64,WORLD_W,100,MK_PAL.beige,MK_PAL.cream);

  // 2. SÀN GẠCH 16x16 CÓ BIẾN THỂ MÒN, RÃNH THOÁT NƯỚC & VŨNG NƯỚC NHỎ (y: 164..480)
  for(var fx=0;fx<WORLD_W;fx+=16){
    for(var fy=164;fy<WORLD_H;fy+=16){
      var alt=((fx/16)+(fy/16))%2===0;
      var worn=((fx*7+fy*13)%11===0);
      var col=worn?MK_PAL.tileWorn:(alt?MK_PAL.tileA:MK_PAL.tileB);
      R(x,fx,fy,16,16,col);
      R(x,fx,fy,16,1,MK_PAL.grout);
      R(x,fx,fy,1,16,MK_PAL.grout);
      if(worn) R(x,fx+3,fy+5,6,2,'rgba(65,44,28,0.12)'); // vết mòn gạch
    }
  }
  // Dải gạch dẫn hướng nâu đỏ dọc 2 hành lang chính
  R(x,0,174,WORLD_W,4,'#7E5640');R(x,0,214,WORLD_W,4,'#7E5640');
  R(x,0,302,WORLD_W,4,'#7E5640');R(x,0,342,WORLD_W,4,'#7E5640');
  R(x,0,164,WORLD_W,2,INK);

  // Rãnh thoát nước gang dọc khu ẩm thực & hải sản
  [380,552,720].forEach(function(dx){
    R(x,dx,286,32,6,INK);R(x,dx+1,287,30,4,'#475569');
    for(var gx2=dx+3;gx2<dx+29;gx2+=4)R(x,gx2,287,2,4,'#1E293B');
  });
  // Vũng nước nhỏ phản quang gần sạp hải sản (x: 410..450, y: 292)
  E(x,430,296,12,3,'#93C5FD');E(x,432,296,7,2,'#E0F2FE');
}

function drawColonialEntrance(x,kind){
  if(kind==='front'){
    // CỬA SỐ 1 (x: 0..176): Cột đá vòm phào chỉ, WATCH, LED WELCOME, Sạp Áo Dài hậu cảnh & 2 Bảo vệ
    pxBevelBox(x,64,30,100,'#F3E7CE','#FFFFFF','#C7B291');
    R(x,6,68,26,10,'#9E2A2B');pxText(x,'WATCH',8,71,'#FFFFFF',1);
    R(x,7,82,24,52,INK);R(x,8,83,22,50,'#DCEEFA');
    for(var wy=88;wy<=116;wy+=14){
      for(var wx=11;wx<=21;wx+=10){
        R(x,wx+1,wy-3,2,11,'#4B3C32');E(x,wx+2,wy+2,3,3,INK);E(x,wx+2,wy+2,2,2,'#FFFBF1');
      }
    }
    // 2 Trụ cột thuộc địa có chân đế & đầu cột
    pxBevelBox(x,34,64,12,100,'#E8D8BA','#FFF8E7','#B89B74');
    pxBevelBox(x,156,64,12,100,'#E8D8BA','#FFF8E7','#B89B74');
    drawAccordionGate(x,46,72,12,92);drawAccordionGate(x,144,72,12,92);
    // Vòm hoa sắt & Biển xanh CỬA SỐ 1
    R(x,46,64,110,14,'#5A534C');
    for(var ox=50;ox<152;ox+=10){E(x,ox+3,70,3,3,'#9CA3AF');E(x,ox+3,70,1,1,'#5A534C');}
    pxBevelBox(x,84,54,36,13,'#1E3A8A','#3B82F6','#172554');pxText(x,'CUA 1',91,58,'#FFFFFF',1);
    // Bảng LED WELCOME BEN THANH
    pxBevelBox(x,48,74,106,14,'#EA580C','#FDBA74','#9A3412');
    R(x,50,76,102,10,'#18181B');pxText(x,'WELCOME BEN THANH',65,79,'#FFF8D6',1);
    R(x,132,90,18,7,INK);R(x,133,91,16,5,'#16A34A');pxText(x,'EXIT',134,91,'#FFFFFF',1);
    // Hậu cảnh Sạp Áo Dài bên trong cổng (4 ma-nơ-canh lụa + đèn lồng)
    R(x,58,90,86,74,'#43342A');R(x,60,92,82,56,'#5C4638');
    ['#DC2626','#2563EB','#D99B38','#EC4899'].forEach(function(col,i){
      var ax=64+i*19;
      R(x,ax+3,100,4,4,'#E5C29F');R(x,ax+2,104,6,2,col);R(x,ax+1,106,8,12,col);
      R(x,ax+2,118,6,14,col);R(x,ax+3,132,2,8,'#FFFBF1');R(x,ax+6,132,2,8,'#FFFBF1');
    });
    drawPerson16Bit(x,118,166,{shirt:'#FFFBF1',pants:'#1E293B',hat:'kepi',guard:true});
    drawPerson16Bit(x,134,166,{shirt:'#FFFBF1',pants:'#1E293B',hat:'kepi',guard:true});
    return;
  }

  // CỬA BẮC · LÊ THÁNH TÔN (x: 1024..1200): Cổng vòm thuộc địa nhìn ra phố Sài Gòn thật!
  pxBevelBox(x,1028,64,14,100,'#E8D8BA','#FFF8E7','#B89B74');
  pxBevelBox(x,1182,64,14,100,'#E8D8BA','#FFF8E7','#B89B74');
  drawAccordionGate(x,1042,72,12,92);drawAccordionGate(x,1170,72,12,92);
  R(x,1042,64,140,14,'#5A534C');
  pxBevelBox(x,1090,54,44,13,'#245940','#3E8A58','#143D29');pxText(x,'CUA BAC',1098,58,'#FFFFFF',1);
  pxBevelBox(x,1054,74,116,14,'#16A34A','#4ADE80','#14532D');
  R(x,1056,76,112,10,'#18181B');pxText(x,'EXIT LE THANH TON',1074,79,'#86EFAC',1);
  // Khung cảnh Phố Lê Thánh Tôn qua vòm cổng (Trời xanh, nhà phố mái ngói nhiều tầng, cây xanh & xe máy)
  R(x,1054,90,116,74,INK);R(x,1055,91,114,44,'#7DD3FC');E(x,1112,94,55,14,'#7DD3FC');
  // Nhà phố đối diện có mái ngói, cửa sổ & mái hiên
  pxBevelBox(x,1062,102,34,34,'#F5C96B','#FDE68A','#D97706');
  R(x,1060,98,38,5,'#9E2A2B');R(x,1068,110,8,10,'#245940');R(x,1082,110,8,10,'#245940');
  pxBevelBox(x,1102,96,42,40,'#F3E7CE','#FFFFFF','#C7B291');
  R(x,1100,92,46,5,'#B85A3F');R(x,1110,104,10,12,'#3D5A80');R(x,1126,104,10,12,'#3D5A80');
  // Cây xanh vỉa hè & Xe máy đậu ngoài cổng
  E(x,1156,112,10,10,INK);E(x,1156,112,9,9,'#3E8A58');R(x,1154,122,4,14,'#7C5032');
  R(x,1055,135,114,28,'#D8CDB8'); // vỉa hè ngoài phố
  R(x,1076,144,14,5,'#E0452B');E(x,1078,150,3,3,INK);E(x,1088,150,3,3,INK); // xe máy ngoài cổng
  // Thảm chào & Bảo vệ Cửa Bắc
  pxBevelBox(x,1084,166,56,8,'#9E2A2B','#DC2626','#6B1819');R(x,1092,169,40,2,'#F4B93B');
  drawPerson16Bit(x,1154,166,{shirt:'#FFFBF1',pants:'#1E293B',hat:'kepi',guard:true});
}
`;
}
