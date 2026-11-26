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

// 2 CỔNG VÒM TRÒN SIÊU GỌN 22×58px SÁT MÉP TRÁI (x: 0..22) & PHẢI (x: 1178..1200) TẠI y: 280..338
function drawSideArchGate(x,side,WORLD_W,WORLD_H){
  var isLeft=(side==='left');
  var x0=isLeft?0:(WORLD_W-22);
  var innerX=isLeft?17:(WORLD_W-22);

  // Vệt sáng vàng ấm rất mảnh hắt từ cửa vào sàn
  x.save();
  x.globalAlpha=0.16;
  R(x,isLeft?22:(WORLD_W-44),290,22,42,'#FEF08A');
  x.restore();

  // Khung cổng vòm tròn siêu hẹp (22×58px) màu vàng kem Chợ Bến Thành
  pxBevelBox(x,x0,280,22,58,'#E6D39F','#FFF6DA','#B89B58');
  var archX=isLeft?0:(WORLD_W-16);
  R(x,archX,292,16,42,INK);
  R(x,archX+(isLeft?0:1),294,15,38,'#F5E6C4');
  R(x,archX+(isLeft?0:3),298,13,30,'#FFF5D6');
  for(var ay=0;ay<8;ay++){
    var inset=Math.round((8-ay)*(8-ay)*0.11);
    if(isLeft){R(x,archX+16-inset,292+ay,inset,1,'#E6D39F');R(x,archX+16-inset-1,292+ay,1,1,INK);}
    else{R(x,archX,292+ay,inset,1,'#E6D39F');R(x,archX+inset,292+ay,1,1,INK);}
  }

  // Biển tên cổng thu gọn ngay đỉnh vòm (CUA NAM / CUA BAC)
  if(isLeft){
    pxBevelBox(x,1,281,20,9,'#1E3A8A','#3B82F6','#172554');
    R(x,4,284,14,3,'#FFFFFF');
  }else{
    pxBevelBox(x,WORLD_W-21,281,20,9,'#245940','#3E8A58','#143D29');
    R(x,WORLD_W-18,284,14,3,'#FFFFFF');
  }

  // Cửa sắt xếp mảnh & thảm đỏ siêu gọn (5px)
  drawAccordionGate(x,innerX,294,5,38);
  var matX=isLeft?22:(WORLD_W-27);
  pxBevelBox(x,matX,296,5,34,'#9E2A2B','#DC2626','#6B1819');

  // Chú bảo vệ đứng sát mép cửa
  var guardX=isLeft?24:(WORLD_W-34);
  drawPerson16Bit(x,guardX,290,{shirt:'#FFFBF1',pants:'#1E293B',hat:'kepi',guard:true});
}
`;
}
