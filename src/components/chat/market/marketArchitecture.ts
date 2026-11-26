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
  R(x,0,174,WORLD_W,4,'#7E5640');R(x,0,212,WORLD_W,4,'#7E5640');
  R(x,0,302,WORLD_W,4,'#7E5640');R(x,0,344,WORLD_W,4,'#7E5640');
  R(x,0,164,WORLD_W,2,INK);

  // Rãnh thoát nước gang dọc khu ẩm thực & hải sản
  [240,520,860].forEach(function(dx){
    R(x,dx,292,32,6,INK);R(x,dx+1,293,30,4,'#475569');
    for(var gx2=dx+3;gx2<dx+29;gx2+=4)R(x,gx2,293,2,4,'#1E293B');
  });
  E(x,286,304,12,3,'#93C5FD');E(x,288,304,7,2,'#E0F2FE');
}

// 2 CỔNG VÒM TRÒN GỌN SÁNG ẤM Ở LÀN ĐI GIỮA (y: 266..358) — XÓA SẠCH MẢNG NÂU ĐEN 2 RÌA!
function drawSideArchGate(x,side,WORLD_W,WORLD_H){
  var isLeft=(side==='left');
  var x0=isLeft?0:(WORLD_W-44);
  var innerX=isLeft?36:(WORLD_W-44);

  // Ánh nắng vàng ấm hắt nhẹ từ vòm cổng vào nền gạch hành lang giữa
  x.save();
  x.globalAlpha=0.18;
  R(x,isLeft?36:(WORLD_W-78),282,42,66,'#FEF08A');
  x.globalAlpha=0.10;
  R(x,isLeft?78:(WORLD_W-108),290,30,50,'#FEF9C3');
  x.restore();

  // Khung trụ & mái vòm tròn vàng kem Chợ Bến Thành gọn gàng (cao 92px tại y: 266..358)
  pxBevelBox(x,x0,266,44,92,'#E6D39F','#FFF6DA','#B89B58');
  // Lòng vòm tròn sáng ấm (kem vàng dịu, không còn mảng nâu đen xấu!)
  var archX=isLeft?0:(WORLD_W-34);
  R(x,archX,284,34,70,INK);
  R(x,archX+(isLeft?0:2),286,32,66,'#F5E6C4');
  R(x,archX+(isLeft?0:6),292,28,54,'#FFF5D6');
  // Đường cong vòm tròn trên đỉnh cổng
  for(var ay=0;ay<14;ay++){
    var inset=Math.round((14-ay)*(14-ay)*0.07);
    if(isLeft){
      R(x,archX+34-inset,284+ay,inset,1,'#E6D39F');
      R(x,archX+34-inset-1,284+ay,2,1,INK);
    }else{
      R(x,archX,284+ay,inset,1,'#E6D39F');
      R(x,archX+inset-1,284+ay,2,1,INK);
    }
  }

  // Biển tên cổng nhỏ gọn ngay đỉnh vòm (CỬA NAM trái / CỬA BẮC phải)
  if(isLeft){
    pxBevelBox(x,2,268,40,12,'#1E3A8A','#3B82F6','#172554');
    pxText(x,'CUA NAM',7,272,'#FFFFFF',1);
  }else{
    pxBevelBox(x,WORLD_W-42,268,40,12,'#245940','#3E8A58','#143D29');
    pxText(x,'CUA BAC',WORLD_W-37,272,'#FFFFFF',1);
  }

  // Cửa sắt xếp mảnh hai bên mép vòm & thảm đỏ đón khách
  drawAccordionGate(x,innerX,286,8,66);
  var matX=isLeft?44:(WORLD_W-52);
  pxBevelBox(x,matX,290,8,58,'#9E2A2B','#DC2626','#6B1819');
  R(x,matX+3,296,2,46,'#F4B93B');

  // Chú bảo vệ thân thiện đứng gác ngay cạnh cổng
  var guardX=isLeft?46:(WORLD_W-58);
  drawPerson16Bit(x,guardX,282,{shirt:'#FFFBF1',pants:'#1E293B',hat:'kepi',guard:true});
}
`;
}
