function getColorFromArray(arr,idx){return {r:arr[idx],g:arr[idx+1],b:arr[idx+2]}}
const histSubSample = 1
const histRes = 256/histSubSample

function buildHisto(){
  const histo = []
  for(let i = 0 ; i < histRes ; i++){
    histo.push([])
    for(let j = 0 ; j < histRes ; j++){
      histo[i].push([])
      for(let k = 0 ; k < histRes ; k++){
        histo[i][j].push(0)
      }
    }
  }
  const bigNum = 999999
  histo.max = [-bigNum,-bigNum, -bigNum]
  histo.min = [bigNum,bigNum, bigNum]
  return histo
}

function getMeanFromHisto(histo){
  let mean = [0,0,0]
  let sum = 0;
  const isHue = histo.isHue
  const hueOff = histo.isHue?128:0;
  for(let i = histo.min[0] ; i < histo.max[0] ; i++){
    for(let j = histo.min[1] ; j < histo.max[1] ; j++){
      for(let k = histo.min[2] ; k < histo.max[2] ; k++){
        const c = histo[i][j][k]
        mean[0]+=c*(i-hueOff) 
        mean[1]+=c*j 
        mean[2]+=c*k 
        sum+=c;
      }
    }
  }
  mean = mean.map(v=>v/sum)
  return mean
}




function getVarFromHisto(histo,mean){
  let vari = [0,0,0]
  let sum = 0;
  for(let i = histo.min[0] ; i < histo.max[0] ; i++){
    for(let j = histo.min[1] ; j < histo.max[1] ; j++){
      for(let k = histo.min[2] ; k < histo.max[2] ; k++){
        const vdist = {r:mean[0]-i,g:mean[1]-j,b:mean[2] - k}
        const c = histo[i][j][k]
        vari[0]+=Math.abs(c*vdist.r)
        vari[1]+=Math.abs(c*vdist.g)
        vari[2]+=Math.abs(c*vdist.b)
        sum+=c
      }
    }
  }
  vari = vari.map(v=>v/sum)
  return vari

}


///////////
// Hue
/////////////

const toRad = Math.PI/128

function getMeanFromHueHisto(histo){
  let mean = [0,0,0]
  let sum = 0;
  let meanCart=[0,0]
  for(let i = histo.min[0] ; i < histo.max[0] ; i++){
    for(let j = histo.min[1] ; j < histo.max[1] ; j++){
      for(let k = histo.min[2] ; k < histo.max[2] ; k++){
        const c = histo[i][j][k]
        meanCart[0]+=c*(Math.cos(i*toRad)) 
        meanCart[1]+=c*(Math.sin(i*toRad)) 
        mean[1]+=c*j 
        mean[2]+=c*k 
        sum+=c;
      }
    }
  }

  mean[0] = Math.atan2(meanCart[1],meanCart[0])/toRad
  if(mean[0]<0){mean[0]=255+mean[0]}
    mean[1] /=sum
  mean[2] /=sum
  return mean
}

function getVarFromHueHisto(histo,mean){
  let vari = [0,0,0]
  let sum = 0;
  let variCart = [0,0]

  for(let i = histo.min[0] ; i < histo.max[0] ; i++){
    for(let j = histo.min[1] ; j < histo.max[1] ; j++){
      for(let k = histo.min[2] ; k < histo.max[2] ; k++){
        const vdist = {r:mean[0]-i,g:mean[1]-j,b:mean[2] - k}
        const c = histo[i][j][k]
        
        if(vdist.r>128){vdist.r = 255 - vdist.r;}
        else if(vdist.r<-128){vdist.r = 255 + vdist.r;}
        
        vari[0]+=c*Math.abs(vdist.r)
        vari[1]+=Math.abs(c*vdist.g)
        vari[2]+=Math.abs(c*vdist.b)
        sum+=c
      }
    }
  }
  
  vari[0] /=sum
  vari[1] /=sum
  vari[2] /=sum
  return vari

}

function getHistogramFromROI(pixObj,x,y,w,h){
  x = x || 0 , y = y || 0 , w = w || 0 , h = h || 0
  x = Math.floor(x),y = Math.floor(y),w = Math.floor(w),h = Math.floor(h)
  const res = buildHisto()
  const pix = pixObj.pixels
  const imW = pixObj.width 
  const pLength = pix.length
  for(let loc = 0 ; loc <pLength;loc+=4){
    const c = getColorFromArray(pix,loc)
    c.r=Math.floor(c.r/histSubSample)
    c.g=Math.floor(c.g/histSubSample)
    c.b=Math.floor(c.b/histSubSample)
    res[c.r][c.g][c.b]+=1
    if(res.min[0]>c.r){res.min[0] = c.r;}
    if(res.max[0]<c.r){res.max[0] = c.r;}
    if(res.min[1]>c.g){res.min[1] = c.g;}
    if(res.max[1]<c.g){res.max[1] = c.g;}
    if(res.min[2]>c.b){res.min[2] = c.b;}
    if(res.max[2]<c.b){res.max[2] = c.b;}

    
  }
  res.max = res.max.map(v=>v+1)
  res.isHue = (pixObj.isHue) || false
  return res
}

class Stats{
  constructor(){
  }

  getDistribution(pixObj,x,y,w,h){

    const histo = getHistogramFromROI(pixObj,x,y,w,h)
    
    const mean = (histo.isHue?getMeanFromHueHisto:getMeanFromHisto)(histo)
    const variance = (histo.isHue?getVarFromHueHisto:getVarFromHisto)(histo,mean)
    
    return {mean,variance}
  }
}

Stats.instance = new Stats()

