
class BlurJS {
  constructor(){

    this.bSize = 0
  }
  init(w,h){
    this.w = w;
    this.h = h;
    return this;
  }
  setBlurSize(bSize){
    this.bSize = Math.floor(bSize);
    return this;
  }
  do(pix){
    if(this.bSize<=0) return
      this.doFast(pix);
  }
  doFast(pix){
    function boxesForGauss(sigma, n){ // standard deviation, number of boxes
      var wIdeal = Math.sqrt((12*sigma*sigma/n)+1);  // Ideal averaging filter width 
      var wl = Math.floor(wIdeal);  if(wl%2==0) wl--;
      var wu = wl+2;

      var mIdeal = (12*sigma*sigma - n*wl*wl - 4*n*wl - 3*n)/(-4*wl - 4);
      var m = Math.round(mIdeal);
      // var sigmaActual = Math.sqrt( (m*wl*wl + (n-m)*wu*wu - n)/12 );

      var sizes = [];  for(var i=0; i<n; i++) sizes.push(i<m?wl:wu);
      return sizes;
    }

    function boxBlur_4 (scl, tcl, w, h, r) {
      for(var i=0; i<scl.length; i++) 
        {tcl[i] = scl[i];}
      boxBlurH_4(tcl, scl, w, h, r);
      boxBlurT_4(scl, tcl, w, h, r);
    }
    function boxBlurH_4 (scl, tcl, w, h, r) {
      var iarr = 1 / (r+r+1);
      for(var i=0; i<h; i++) {
        var ti = i*w, li = ti, ri = ti+r;
        var fv = scl[ti*4], lv = scl[(ti+w-1)*4], val = (r+1)*fv;
        for(var j=0; j<r; j++) 
          {val += scl[(ti+j)*4];}
        for(var j=0  ; j<=r ; j++) 
          { val += scl[(ri++)*4] - fv       ;   tcl[(ti++)*4] = Math.round(val*iarr); }
        for(var j=r+1; j<w-r; j++) 
          { val += scl[(ri++)*4] - scl[(li++)*4];   tcl[(ti++)*4] = Math.round(val*iarr); }
        for(var j=w-r; j<w  ; j++) 
          { val += lv        - scl[(li++)*4];   tcl[(ti++)*4] = Math.round(val*iarr); }
      }
    }
    function boxBlurT_4 (scl, tcl, w, h, r) {
      var iarr = 1 / (r+r+1);
      for(var i=0; i<w; i++) {
        var ti = i, li = ti, ri = ti+r*w;
        var fv = scl[ti*4], lv = scl[(ti+w*(h-1))*4], val = (r+1)*fv;
        for(var j=0; j<r; j++) 
          {val += scl[(ti+j*w)*4];}
        for(var j=0  ; j<=r ; j++) 
          { val += scl[ri*4] - fv     ;  tcl[ti*4] = Math.round(val*iarr);  ri+=w; ti+=w; }
        for(var j=r+1; j<h-r; j++) 
          { val += scl[ri*4] - scl[li*4];  tcl[ti*4] = Math.round(val*iarr);  li+=w; ri+=w; ti+=w; }
        for(var j=h-r; j<h  ; j++) 
          { val += lv      - scl[li*4];  tcl[ti*4] = Math.round(val*iarr);  li+=w; ti+=w; }
      }
    }

    const w=this.w, h = this.h,bSize = this.bSize;
    const tcl = new Uint8Array(pix.length);
    var bxs = boxesForGauss(bSize, 3);
    // boxBlur_4 (pix, tcl, w, h, (bxs[0]-1)/2);
    //  boxBlur_4 (tcl, pix, w, h, (bxs[1]-1)/2);
    boxBlur_4 (pix, tcl, w, h, (bxs[2]-1)/2);
    pix.set(tcl)

  }
  doSimple(pix){
    const w=this.w, h = this.h,bSize = this.bSize;
    for(let i = 0 ; i < w ; i++){
      for(let j = 0 ; j < h ; j++){
        let sum = 0;
        let tot = 0;
        let loc = (j*w + i)*4;
         // let k =0;
         for(let k =-bSize-1 ; k < bSize+1 ; k++){
          for(let l =-bSize-1 ; l < bSize+1 ; l++){
            const ik  = Math.min(w, Math.max(0,i+k));
            const jk  = Math.min(w, Math.max(0,j+l));
            const lock = (jk*w + ik)*4;
            const contr = 1//1.0-Math.abs(k)/(bSize+1)
            sum+=pix[lock]*contr;
            tot+=contr;
          }
        }
        pix[loc] = sum/tot;
      }
    }
  }

  fromCfg(cfg){
    this.setBlurSize(cfg.bS);
  }
  toCfg(cfg){
    return {
      bS:this.bSize,
    }
  }
}


// export default BlurJS ;

