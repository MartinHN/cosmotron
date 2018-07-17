


class ThresholdJS {
  constructor(){
    this.threshold = 0.5;
    this.smooth = 1.0;
    this.lut = [];
    this.lutRes = 256;
    this.buildLUT();
  }
  init(w,h){
    this.w = w;
    this.h = h;
    return this;
  }
  setThreshold(t){
    this.threshold = t;
    this.buildLUT();
    return this;
  }
  setSmooth(s){
    const st = 0.;
    this.smooth = st + s*(1-st);
    this.buildLUT();
    return this;
  }
  getMax(pix){
    max =0
    for(let i = 0 ; i < pix.length ; i+=4){
      if(max<pix[i]){max = pix[i];}
    }
    return max
  }
  do(pix){
    const w = this.w , h  = this.h , thresh = this.threshold/255;
    const c = 2/(1-this.smooth) - 1
    const max = this.getMax(pix) || 255;//255.0
    const pLength = pix.length
    for(let loc = 0 ; loc <pLength;loc+=4){
      const v = Math.floor(pix[loc]*(this.lutRes-1)/max)
      const lutV = this.lut[v]
      pix[loc] = lutV

    }
  }



  buildLUT(){
    this.lut = []
    const c = 2.0/(1-this.smooth) - 1
    // const c = this.smooth
    for(let i = 0 ; i < this.lutRes ; i++){
      this.lut.push(Math.floor(255*ThresholdJS.smoothF(i*1.0/this.lutRes,this.threshold/255.0,c)));
    }
  }


  static smoothB(x,p,c){
    // return Math.pow(x,c)/Math.pow(p,c-1)
    // return Math.pow(x*1.0/p,c)*p
    return Math.pow(x*1.0/p,c)*0.5
  }

static smoothC(x,p,c){
  if(x>=2*p) return 1
  return 1-Math.pow((2*p-x)/p,c)*0.5
}

  static smoothF(x,p,s){
    if(x<0 || x >1){return -1;debugger}
    if(p<0 || p>1) {return 2;debugger}
    if(p==0) return 1;
    if(x<p) return ThresholdJS.smoothB(x,p,s);
    else return ThresholdJS.smoothC(x,p,s)// 1- ThresholdJS.smoothB(1-x,1-p,s);
  }

  fromCfg(cfg){
    this.setThreshold(cfg.threshold)
    this.setSmooth(cfg.smooth)
  }

  toCfg(){
    return {
      threshold:this.threshold,
      smooth:this.smooth
    }
  }
}

  export default ThresholdJS;
