import {Color,Vec3Float,Vec3Short} from './Vec3.js'


function getColorFromArray(arr,idx){
  return Color.fromListAtIdx(arr,idx);//{r:arr[idx],g:arr[idx+1],b:arr[idx+2]}
}


function simple_dist(c1,c2){
  c1.v_diff(c2);//{r:c1.r -c2.r,g:c1.g -c2.g, b: c1.b -c2.b}
}
function variance_dist(c1,c2,w1,w2,w3){
  c1.v_diff(c2);
  c1.scale([w1,w2,w3])
}

function euclidean(d){
  return d.norm()
}

function manathan(d){
  return d.norm1() 
}


const degToHSV = 255/360

function hsv_dist(h1,h2,w1,w2,w3){
  h1[0] -= h2[0]
  // if (h1[0] > 128) h1[0]=255-h1[0];
  // else if (h1[0] < -128) h1[0]=255+h1[0]
  const adif = Math.abs(h1[0])
  h1[0] = Math.min(adif,255-adif)

  // if(Math.abs(h1[1])>128){h1[1]=1000;}
  // if(Math.abs(h1[2])>128){h1[2]=1000;}

  h1[1]-= h2[1]
  h1[2] -= h2[2]

  h1[0]*=w1
  h1[1]*=w2
  h1[2]*=w3

}

class DistJS {
  constructor(){
    this.color = new Color(255,255,0);
    this.hsvcolor = new Color(255,255,0);
    this.curdist = simple_dist
    this.curnorm = d=>d.norm()
    this.invVariance = new Vec3Float(1,1,1)
    this.invHSVVariance = new Vec3Float(1,1,1)
    this.useHSV = false
    this.defaultHSVWeights = new Vec3Float(1,.2,.01)
    this.defaultHSVWeights.normalize()
    this.weights = new Vec3Float(1)
    this.weights.normalize()
  }
  setColor(c){
    this.color = new Color(c[0],c[1],c[2]);
    return this;
  }
  setHSVColor(c){
    this.hsvcolor = new Color(c[0],c[1],c[2]);
    return this;
  }
  setWeights(c){
    this.weights.setFrom(c)
    this.weights.normalize()
  }
  init(w,h){
    this.w = w;
    this.h = h;
    return this;
  }
  setColorHex(h){
    this.color = Color.fromHex(h)
    return this
  }

  setVariance(v){
    if(v[0] == 0 && v[1] == 0 && v[2] == 0 ){this.invVariance.setAll(1);}
    else if(v[0] == 0 || v[1] == 0 || v[2] == 0 ){debugger;}
    else{this.invVariance=this.invVariance.map(v=>v!=0?1/v:1)}
    this.invVariance.normalize()
  }

  setHSVVariance(v){
    if(v[0] == 0 && v[1] == 0 && v[2] == 0 ){this.invHSVVariance.setFrom(this.defaultHSVWeights);}
    else if(v[0] == 0 || v[1] == 0 || v[2] == 0 ){debugger;}
    else{this.invHSVVariance=this.invHSVVariance.map(v=>v!=0?255-v:1)}
    this.invHSVVariance.normalize()
  }
  setDebug(b){this.debug = b;}
  setDist(dname){this.curdist = DistJS.dists[dname];}
  setNorm(nName){this.curnorm = DistJS.norms[nName]}


  do(pix){
    const w = this.w , h  = this.h , thresh = this.threshold;
    const useHSV = this.useHSV
    const baseColor =new Vec3Float(this.color);
    let weights = this.weights
    if(this.weights.norm1()==0){
      if(useHSV){
        weights =this.curdist==variance_dist?this.invHSVVariance:(this.debug?new Vec3Float(1):this.defaultHSVWeights);
      }
      else{
        weights=this.invVariance;
      }
      weights.normalize()
    }



    if( useHSV){
      // baseColor.toHSV255()
      baseColor.setFrom(this.hsvcolor)
    }
    const dist = new Vec3Float()
    const distalgo = useHSV?hsv_dist:this.curdist
    const normAlgo = this.curnorm
    const w1 = weights[0]
    const w2 = weights[1]
    const w3 = weights[2]
    const pLength = pix.length

    // draw diffs as vectors
    if(this.debug){
      for(let loc = 0 ; loc <pLength;loc+=4){
        dist.setFromListAtIdx(pix,loc)
        if(useHSV){dist.toHSV255();}
        distalgo(dist,baseColor,w1,w2,w3)
        // const cnorm = normAlgo(dist)
        pix[loc + 0 ]=2*Math.abs(dist[0])
        pix[loc + 1 ]=2*Math.abs(dist[1])
        pix[loc + 2 ]=2*Math.abs(dist[2])
      }
    }

    // use HSV space
    else if(useHSV){
      for(let loc = 0 ; loc <pLength;loc+=4){
        dist.setFromListAtIdx(pix,loc)
        dist.toHSV255();
        distalgo(dist,baseColor,w1,w2,w3)
        const cnorm = normAlgo(dist)
        pix[loc + 0 ]=cnorm
        pix[loc + 1 ]=0
        pix[loc + 2 ]=0
      }

    }

    // use RGB Space
    else{
      for(let loc = 0 ; loc <pLength;loc+=4){
        dist.setFromListAtIdx(pix,loc)
        distalgo(dist,baseColor,w1,w2,w3)
        pix[loc ]= normAlgo(dist)

        // pix[loc + 1 ]=0
        // pix[loc + 2 ]=0


      }
    }
  }

  fromCfg(cfg){
    this.setColor(cfg.color);
  }
  toCfg(cfg){
    return {
      color:this.color,
    }
  }
}

DistJS.dists = {simple_dist,variance_dist}
DistJS.norms = {euclidean:d=>d.norm(),manathan:d=>d.norm1(),dist_sqared:d=>d.norm_sq()}

  // export default Dist;
