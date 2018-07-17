
class MixJS {
  constructor(){



  }
  init(w,h){
    this.w = w;
    this.h = h;
    return this;
  }

  do(pix1,pix2,mask){
    if(pix1.length!=pix2.length || pix1.length!=mask.length){
      debugger
      return
    }

    const w = this.w,h=this.h;

    const pLength = mask.length
    let amnt = 0
    const lerp = MixJS.lerp
    for(let position1dPix = 0 ; position1dPix <pLength;position1dPix+=4){
     amnt = mask[position1dPix ]/255;
     const ri = position1dPix
     const gi = position1dPix+1
     const bi = position1dPix+2
     mask[ri] =   lerp( pix1[ri],pix2[ri],amnt)
     mask[gi] =   lerp( pix1[gi],pix2[gi],amnt)
     mask[bi] =   lerp( pix1[bi],pix2[bi],amnt)

     
   }

 }
 static lerp(s,t,a){
  return s+(t-s)*a
}
static lerp255(s,t,a){
  return s+(t-s)*a
}
toCfg(){}
fromCfg(){}
}

export default MixJS;
