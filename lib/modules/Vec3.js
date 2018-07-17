
const Vec3Base = (C) =>class  extends C{
  constructor(x,y,z){
    super(3)
    if(x && x.x!==undefined)  {this.setFrom(x);}
    else if(x && y===undefined && z===undefined){this.setAll(x);}
    else    {this[0]=x||0, this[1]=y||0, this[2]=z||0 }
  }
  get x(){return this[0]}
  set x(v){this[0]=v}
  get y(){return this[1]}
  set y(v){this[1]=v}
  get z(){return this[2]}
  set z(v){this[2]=v}
  set(x,y,z){this[0] = x;this[1] = y;this[2] = z;}
  setFrom(o){this[0] = o[0] ; this[1] = o[1] ; this[2] = o[2];}
  setAll(s){this[0] = s ; this[1] = s ; this[2] = s}
  norm()    { return Math.sqrt(this.norm_sq()) }
  norm1()   {return Math.abs(this[0]) + Math.abs(this[1]) + Math.abs(this[2])}
  normalize(){const n = this.norm()  ;if(n!=0){this.scalef(1/n)}}
  norm_sq() { const x=this[0],y=this[1],z=this[2] ; return x*x+y*y+z*z}
  // norm_sq() { return this[0]*this[0]+this[1]*this[1]+this[2]*this[2]}
  get_diff(other) {return new this.constructor(other[0]- this[0], other[1]- this[1],other[2]- this[2])}
  v_diff(other) {this[0]-=other[0] ; this[1]-=other[1] ; this[2]-=other[2]}

  dist(other)   {return this.constructor.getTemp(this).get_diff(other).norm();}
  dist_sq(other){return this.get_diff(other).norm_sq();}
  scale(other){this[0]*=other[0] ,this[1]*=other[1], this[2]*=other[2]; return this}
  scalef(f){this[0]*=f ,this[1]*=f, this[2]*=f; return this}

  setFromListAtIdx(l,b){this[0] = l[0+b],this[1]=l[1+b],this[2]=l[2+b];}
  setFromList(l){this[0] = l[0],this[1]=l[1],this[2]=l[2];}
  static fromListAtIdx(l,b){ return new this(l[0+b],l[1+b],l[2+b]);}
  static fromList(l){return new this(l[0],l[1],l[2]);}
  static getTemp(o){if(!this.tempVec){this.tempVec =new this()};this.tempVec.setFrom(o);return this.tempVec;}

  toHSV () {
    const r = this[0]/255
    const g = this[1]/255
    const b = this[2]/255
    // if (r<0 || g<0 || b<0 || r>1 || g>1 || b>1) {debugger;return ; }

    const minRGB = Math.min(r,Math.min(g,b));
    const maxRGB = Math.max(r,Math.max(g,b));

    // Black-gray-white
    if (minRGB==maxRGB) { this[0]=0,this[1]=0,this[2]=minRGB;return;}

    // Colors other than black-gray-white:
    const d = (r==minRGB) ? g-b : ((b==minRGB) ? r-g : b-r);
    const  h = (r==minRGB) ? 3 : ((b==minRGB) ? 1 : 5);
    this[0] = 60*(h - d/(maxRGB - minRGB));
    this[1] = (maxRGB - minRGB)/maxRGB;
    this[2] = maxRGB;
    
  }

  toHSV255 () {
    const r = this[0]
    const g = this[1]
    const b = this[2]
    // if (r<0 || g<0 || b<0 || r>255 || g>255 || b>255) {debugger;return ; }

    const minRGB = Math.min(r,Math.min(g,b));
    const maxRGB = Math.max(r,Math.max(g,b));

    // Black-gray-white
    if (minRGB==maxRGB) { this[0]=0,this[1]=0,this[2]=minRGB;return;}

    // Colors other than black-gray-white:
    const d = (r==minRGB) ? g-b : ((b==minRGB) ? r-g : b-r);
    const  h = (r==minRGB) ? 3 : ((b==minRGB) ? 1 : 5);
    this[0] = 42.5*(h - d/(maxRGB - minRGB));
    this[1] = (maxRGB - minRGB)*255/maxRGB;
    this[2] = maxRGB;
    
  }
}

export class Vec3Short extends Vec3Base(Uint8Array){
 constructor(x,y,z){
  super(x,y,z);
    // this.baseClass=Vec3Short
  }
  
  
}

export class Vec3Float extends Vec3Base(Float32Array){
 constructor(x,y,z){
  super(x,y,z);
    //this.baseClass=Vec3Float
  }
  
}


export class Color extends Vec3Short{
  constructor(x,y,z){
    super(x,y,z)
    
  }
  get r(){return this[0]}
  set r(v){this[0]=v}
  get g(){return this[1]}
  set g(v){this[1]=v}
  get b(){return this[2]}
  set b(v){this[2]=v}

  static  fromHex(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? new Color(
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
      ) : null;
  }



}

