/**
 * Kiến trúc Chợ Bến Thành: Mái vòm kèo thép, Giếng trời, Sàn gạch 16x16 & 2 Cổng Vòm Tròn Nằm Dọc 2 Đầu (Quyết định 213)
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
  for(var sk=28;sk<WORLD_W;sk+=120){
    R(x,sk,4,64,26,'#C86446');R(x,sk+2,6,60,22,'#FBE6C4');
    for(var nx=sk+12;nx<sk+64;nx+=12)R(x,nx,4,1,26,'#8A3E29');
    R(x,sk,13,64,1,'#8A3E29');R(x,sk,22,64,1,'#8A3E29');
  }
  R(x,0,52,WORLD_W,2,'#52525B');
  for(var tx=0;tx<WORLD_W;tx+=120){
    R(x,tx,0,10,64,'#D99B38');R(x,tx+1,0,3,64,'#F5CA72');R(x,tx+7,0,3,64,'#8C5C18');
    for(var k=0;k<22;k++){
      var archY=Math.round(34-(k*k)*0.065);
      R(x,tx+10+k*2,archY,3,4,'#D99B38');R(x,tx+110-k*2,archY,3,4,'#D99B38');
    }
  }
  R(x,0,62,WORLD_W,2,INK);
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
      if(worn) R(x,fx+3,fy+5,6,2,'rgba(65,44,28,0.12)');
    }
  }
  // Dải gạch dẫn hướng nâu đỏ dọc 2 hành lang chính
  R(x,72,174,WORLD_W-144,4,'#7E5640');R(x,72,214,WORLD_W-144,4,'#7E5640');
  R(x,72,302,WORLD_W-144,4,'#7E5640');R(x,72,342,WORLD_W-144,4,'#7E5640');
  R(x,0,164,WORLD_W,2,INK);

  // Rãnh thoát nước gang dọc khu ẩm thực & hải sản
  [360,544,728].forEach(function(dx){
    R(x,dx,286,32,6,INK);R(x,dx+1,287,30,4,'#475569');
    for(var gx2=dx+3;gx2<dx+29;gx2+=4)R(x,gx2,287,2,4,'#1E293B');
  });
  E(x,340,296,12,3,'#93C5FD');E(x,342,296,7,2,'#E0F2FE');
}

// CỔNG VÒM TRÒN NẰM DỌC Ở 2 ĐẦU ĐƯỜNG TRÁI (x: 0..72) & PHẢI (x: 1128..1200) — GIẤU HOÀN TOÀN KHÔNG GIAN NGOÀI
function drawSideArchGate(x,side,WORLD_W,WORLD_H){
  var isLeft=(side==='left');
  var x0=isLeft?0:(WORLD_W-72);
  var innerX=isLeft?58:(WORLD_W-70);
  var wallX=isLeft?0:(WORLD_W-58);

  // 1. Khối tường vàng kem Chợ Bến Thành phía trên đầu cổng (y: 64..166)
  pxBevelBox(x,x0,64,72,102,'#E6D39F','#FFF6DA','#B89B58');
  // Phù điêu sóng nước đặc trưng Chợ Bến Thành (như Hình 3)
  R(x,x0+10,74,52,18,INK);R(x,x0+11,75,50,16,'#F5F0E1');
  for(var wy=79;wy<=87;wy+=4)R(x,x0+15,wy,42,1,'#334155');
  // Đồng hồ nhỏ trang trí mặt cổng & khung vòm mái ngói đỏ trên đầu
  E(x,x0+36,108,11,11,INK);E(x,x0+36,108,9,9,'#FFFBF1');
  R(x,x0+35,102,2,6,'#1E3A8A');R(x,x0+36,107,5,2,'#1E3A8A');

  // Biển tên cổng (CỬA NAM bên trái / CỬA BẮC bên phải)
  if(isLeft){
    pxBevelBox(x,x0+6,126,60,14,'#1E3A8A','#3B82F6','#172554');
    pxText(x,'CUA NAM',x0+18,131,'#FFFFFF',1);
    R(x,x0+14,144,44,10,INK);R(x,x0+15,145,42,8,'#16A34A');pxText(x,'RA PHO',x0+22,147,'#FFFFFF',1);
  }else{
    pxBevelBox(x,x0+6,126,60,14,'#245940','#3E8A58','#143D29');
    pxText(x,'CUA BAC',x0+18,131,'#FFFFFF',1);
    R(x,x0+14,144,44,10,INK);R(x,x0+15,145,42,8,'#16A34A');pxText(x,'EXIT',x0+27,147,'#FFFFFF',1);
  }

  // 2. Cổng vòm tròn khổng lồ nằm dọc suốt 2 đầu hành lang (y: 164..476)
  pxBevelBox(x,x0,164,72,WORLD_H-164,'#E6D39F','#FFF6DA','#B89B58');
  // Khung vòm tròn sâu tối ấm giấu hoàn toàn không gian bên ngoài
  R(x,wallX,176,58,286,INK);
  R(x,wallX+(isLeft?0:3),178,55,282,'#2B2118');
  R(x,wallX+(isLeft?0:8),188,50,262,'#3B291E');
  R(x,wallX+(isLeft?0:14),204,44,230,'#4D3526');
  // Đường cong vòm tròn trên đỉnh cổng (pixel-by-pixel arch curve)
  for(var ay=0;ay<24;ay++){
    var inset=Math.round((24-ay)*(24-ay)*0.06);
    if(isLeft){
      R(x,wallX+58-inset,176+ay,inset,1,'#E6D39F');
      R(x,wallX+58-inset-1,176+ay,2,1,INK);
    }else{
      R(x,wallX,176+ay,inset,1,'#E6D39F');
      R(x,wallX+inset-1,176+ay,2,1,INK);
    }
  }

  // Cửa sắt xếp mở hai bên mép cổng vòm
  drawAccordionGate(x,innerX,184,12,268);

  // Ánh đèn lồng vàng ấm treo giữa vòm cổng
  drawRattanLamp(x,wallX+(isLeft?36:22),206);

  // Thảm đỏ đón khách & chỉ dẫn lối ra dọc mép cổng
  var matX=isLeft?64:(WORLD_W-72);
  pxBevelBox(x,matX,270,8,92,'#9E2A2B','#DC2626','#6B1819');
  R(x,matX+3,278,2,76,'#F4B93B');

  // Trụ cột & Bảo vệ gác cổng trên/dưới
  var guardX=isLeft?68:(WORLD_W-82);
  drawPerson16Bit(x,guardX,186,{shirt:'#FFFBF1',pants:'#1E293B',hat:'kepi',guard:true});
  drawPerson16Bit(x,guardX,450,{shirt:'#FFFBF1',pants:'#1E293B',hat:'kepi',guard:true});
}
`;
}
