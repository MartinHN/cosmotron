export function setSmoothedCanvas(c,tog){
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = tog;
  ctx.mozImageSmoothingEnabled = tog;
  ctx.webkitImageSmoothingEnabled = tog;
  ctx.msImageSmoothingEnabled = tog;
}

export function isMobile(){
  var check = false;(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);return check;
}

export function fitStretched(src,dest){
  const w = src.width, h=src.height
  const wd = dest.width, hd = dest.height
  const srcAR = w/h
  const dstAR = wd/hd
  const res = {left:0,top:0,width:wd,height:hd}
  if(srcAR>dstAR){
    const targetH = hd * dstAR/srcAR
    const pad= Math.floor((hd- targetH) /2)
    res.top = pad
    res.height = hd-2*pad
  }
  else if(srcAR<dstAR){
    const targetW = wd * srcAR/dstAR
    const pad= Math.floor((wd- targetW) /2)
    res.left = pad
    res.width = wd-2*pad
  }
  return res

}
export function  generateImage(){
  // save(canvas, 'myCanvas.jpg');

  if(!window.ImageWorker){
    window.ImageWorker = new Worker("worker.js",{type:"module"})
  }
  if(camera.pixels.length && bgImg.pixels.length){
    const worker = window.ImageWorker 
    realTimeCompute=false
    // noLoop();
    const oldCamW = camera.width;
    const oldCamH = camera.height;

    
    const fullCam = camera  ;//createCapture(VIDEO);
    const settings = camera.elt.srcObject.getVideoTracks()[0].getSettings()

    fullCam.size(settings.width,settings.height);
    fullCam.loadPixels();
    while(fullCam.pixels.length===0){
      fullCam.loadPixels();
    }
    let fullBg;
    loadImage('beach.jpg',d=>{
      fullBg=d ;fullBg.resize(fullCam.width,fullCam.height); fullBg.loadPixels();

      const cfg = {
        sourceW:fullCam.width,
        sourceH:fullCam.height,
        destW:1280,
        destH:800,
        camPixels:fullCam.pixels.slice(),
        bgPixels : fullBg.pixels,
        algosCfg:{
          blur : blurObject.toCfg(),
          thresh : threshObject.toCfg(),
          mix : mixObject.toCfg(),
          dist : substractObject.toCfg(),

        }

      }
      worker.onmessage=m=>{
        if(typeof m.data !== "string"){
        // force alpha to 255
        for(let i = 0 ; i < m.data.length/4 ; i++){
          m.data[i*4 + 3] = 255
        }
        const w = cfg.destW;
        const h = cfg.destH
        const c = document.createElement('canvas');
        document.body.appendChild(c);

        c.width = w
        c.height = h
        const ctx = c.getContext('2d')
        const imData = ctx.getImageData(0, 0, w, h);
        imData.data.set( m.data)
        ctx.putImageData(imData,0,0, 0,0, w,h)
        
        c.toBlob(function(blob) {
          downloadFile(blob, "photomaton", "jpg");
        }, "image/jpeg");
        c.parentNode.removeChild(c);

      }
      else{
        console.log('from WW',m.data)
      }
    }


    worker.postMessage(cfg)
    camera.size(oldCamW,oldCamH);
    realTimeCompute=true;
  })
  }
  else{
    console.error('image not loaded')
  }
}


export function arrToHsv255Wrap (arr) {
  for(let i = 0 ; i < arr.length ; i+=4){
    const r = arr[i+0]
    const g = arr[i+1]
    const b = arr[i+2]
    if (r<0 || g<0 || b<0 || r>255 || g>255 || b>255) {
      debugger;// ('RGB values must be in the range 0 to 255.')
      return ; 
    }

    const minRGB = Math.min(r,Math.min(g,b));
    const maxRGB = Math.max(r,Math.max(g,b));

    // Black-gray-white
    if (minRGB==maxRGB) { arr[i+0]=0,arr[i+1]=0,arr[i+2]=minRGB;continue;}

    // Colors other than black-gray-white:
    const d = (r==minRGB) ? g-b : ((b==minRGB) ? r-g : b-r);
    const  h = (r==minRGB) ? 3 : ((b==minRGB) ? 1 : 5);
    arr[i+0] = 42.5*(h - d/(maxRGB - minRGB));
    arr[i+1] = (maxRGB - minRGB)/maxRGB*255;
    arr[i+2] = maxRGB;
  }

  return arr

}

export function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex(r, g, b) {
  return "#" + componentToHex(Math.floor(r)) + componentToHex(Math.floor(g)) + componentToHex(Math.floor(b));
}


var round = Math.round;
var min = Math.min;
var max = Math.max;
var ceil = Math.ceil;


function set(r, g, b, out) {
  out[0] = round(r * 255);
  out[1] = round(g * 255);
  out[2] = round(b * 255);
}

function clamp(v, l, u) {
  return max(l, min(v, u));
}

export function hsv2rgb(h, s, v, out) {
  out = out || [0, 0, 0];
  h = h % 360;
  s = clamp(s, 0, 1);
  v = clamp(v, 0, 1);

  // Grey
  if (!s) {
    out[0] = out[1] = out[2] = ceil(v * 255);
  } else {
    var b = ((1 - s) * v);
    var vb = v - b;
    var hm = h % 60;
    switch((h/60)|0) {
      case 0: set(v, vb * h / 60 + b, b, out); break;
      case 1: set(vb * (60 - hm) / 60 + b, v, b, out); break;
      case 2: set(b, v, vb * hm / 60 + b, out); break;
      case 3: set(b, vb * (60 - hm) / 60 + b, v, out); break;
      case 4: set(vb * hm / 60 + b, b, v, out); break;
      case 5: set(v, b, vb * (60 - hm) / 60 + b, out); break;
    }
  }
  return out;
}



export class NamedObject{
  constructor(name,ob){
    this.sl = ob
    this.cont = createDiv()
    this.cont.addClass("namedControl")
    // this.cont.style('background','inherit')
    this.label = createDiv(name)
    this.label.style('position','absolute')
    this.label.style('z-index','10')
    this.label.style('pointer-events', 'none');
    this.label.style('text-align', 'right');
    // this.label.style('margin-right', '30px');
    // this.label.style('line-height', '2rem');
    this.rightPad = 30
    this.label.style('font-size', '2rem');
    this.nameW = name.length * 10
    this.loffset = this.nameW
    this.left = this.top = 0
    this.cont.child(this.label)
    this.cont.child(this.sl)

    this.label.position(0,0)
    this.sl.position(0,0)
  }
  getDiv(){
    return this.cont
  }

  position(x,y){
    this.left = x
    this.top = y
    this.cont.position(x,y)
  }

  size(w,h){
    this.loffset = w/4
    this.cont.size(w,h)
    this.label.size(w-this.rightPad,h)
    
    this.sl.size(w,h)
  }
  input(f){
    this.sl.input(f)
    return this
  }
  mousePressed(f){
    this.sl.mousePressed(f)
    return this
  }
  value(f){
    if(f){
      return this.sl.value(f)
    }
    else{
      return this.sl.value()
    }
  }
  changed(f){
    return this.sl.changed(f)
  }
  option(o){
    return this.sl.option(o)
  }
  style(a,b){
    this.sl.style(a,b)
    return this
  }
  get srcElement(){
    return this.sl.srcElement
  }
  show(){
    this.sl.show()
    this.label.show()
  }
  setZindex(z){
    this.sl.style('z-index',''+z)
    this.label.style('z-index',''+z+10)
  }

}

