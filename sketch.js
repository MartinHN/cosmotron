var camera;
let canvas;

import BlurJS from './lib/modules/BlurJS.js'
// import BlurWA from './lib/BlurWA.mjs'
// // import BlurCV from './lib/blurCV.js'
// import BlurP5 from './lib/blurP5.js'

import Mix from './lib/modules/MixJS.js'
import ThreshJS from './lib/modules/ThresholdJS.js'
import DistJS from './lib/modules/DistJS.js'
import Stats from './lib/modules/Stats.js'
import {Color,Vec3Float,Vec3Short} from './lib/Vec3.js'
import * as Utils from "./Utils.js"

let blur_methods={
  BlurJS,
  // BlurWA,
  // BlurCV,
  // BlurP5,
}

let greenScreenMedias = ['small.mp4','franck.mp4']

let webcams = {}
let bgMedias = ['green.png','red.png','beach.jpg']

let blurObject,threshObject,substractObject,mixObject;
let bgImg={width:0,height:0};
let video
let greenScreenMedia  
let showMask= false;
const mouseStart = {x:0,y:0}
let isHighRes = true
const rStat = {x:0,y:0,w:0,h:0}

let realTimeCompute = true;
let UI;

function setCurrentBlur(b){
  blurObject = new blur_methods[b]().init(greenScreenMedia.width,greenScreenMedia.height)
  blurObject.setBlurSize(UI.bslider.value())
}
function getCanvasScale(){return isHighRes?1:.25;}
function getWindowWidth(){return int(window.innerWidth);}
function getWindowHeight(){return int(window.innerHeight);}

function getCanvasResW(){return int(window.innerWidth*getCanvasScale());}
function getCanvasResH(){return int(window.innerHeight*getCanvasScale());}
function endsWithExtension(s){return /.*\.....?/g.match(s)}

function getWebcams(){
  webcams = {}
  
  // const video_fake = createCapture(VIDEO,
  //   d=>{
  //     for(let t of d.getVideoTracks()){
  //       const name = t.label
  //       webcams[name] =  {settings:t.getSettings(),constraints:t.getConstraints(),capabilities:t.getCapabilities()}
  //       console.log(t)
  //     }
  

  //     console.log(webcams)
  //     video_fake.remove()

  //   })



// List cameras and microphones.

navigator.mediaDevices.enumerateDevices()
.then(devices=> {
  var num = 0
  devices.forEach(function(device) {
    if(device.kind=="videoinput"){
      console.log(device.kind + ": " + device.label +
        " id = " + device.deviceId);
      console.log(device)
      var name =  "camera:"+num
      if (device.label){
        name = device.label
      }
      else{
        num+=1
      }
      webcams[name] = device
    }
  });
  UI.updateWebCams()
})
.catch(function(err) {
  console.log(err.name + ": " + err.message);
});
}


function setup() {
  canvas = createCanvas();
  canvas.size(getCanvasResW(),getCanvasResH())
  isHighRes = true;//!Utils.isMobile()
  
  if(isHighRes){greenScreenMedia ={width:640, height:480};}
  else{greenScreenMedia ={width:640, height:480};}
  
  
  Utils.setSmoothedCanvas(canvas.canvas,true)

  frameRate(60);

  pixelDensity(1);
  UI = new MainUI();
  UI.bslider.value(0)//isMobile()?0:5)
  setCurrentBlur('BlurJS');

  threshObject = new ThreshJS().init(greenScreenMedia.width,greenScreenMedia.height);
  substractObject = new DistJS().init(greenScreenMedia.width,greenScreenMedia.height);
  mixObject = new Mix().init(greenScreenMedia.width,greenScreenMedia.height);

  loadImage('medias/green.png',d=>{bgImg=d ;bgImg.resize(greenScreenMedia.width,greenScreenMedia.height); bgImg.loadPixels();})
  video = createVideo('medias/small.mp4')//,()=>video.size(greenScreenMedia.width,greenScreenMedia.height))
  video.loop()
  video.hide()
  video.volume(0)
  greenScreenMedia = video
  getWebcams()
  windowResized()
}





function windowResized() {
  resizeCanvas(getCanvasResW(),getCanvasResH(),false);
  // debugger;

  canvas.canvas.style.width = ""+getWindowWidth()+"px"
  canvas.canvas.style.height = ""+getWindowHeight()+"px"
  // camera.size(windowWidth, windowHeight);
  layoutUI();
}



function draw() {
  if(window.stats)window.stats.update()
  
  background(0);

  // nous indiquons que nous allons ecrire dans la variable "pixels" pour dessiner dans la fenetre
  loadPixels();

  
  if(greenScreenMedia && greenScreenMedia.width!=0){
    greenScreenMedia.loadPixels();


    if(greenScreenMedia.pixels.length){
      if(greenScreenMedia.width!=bgImg.width){
        bgImg.resize(greenScreenMedia.width,greenScreenMedia.height)
        blurObject.init(greenScreenMedia.width,greenScreenMedia.height)
        threshObject.init(greenScreenMedia.width,greenScreenMedia.height);
        substractObject.init(greenScreenMedia.width,greenScreenMedia.height);
        mixObject.init(greenScreenMedia.width,greenScreenMedia.height);
      }
      const pixView = greenScreenMedia.pixels.slice();
      if(realTimeCompute){
        substractObject.do(pixView)

        blurObject.do(pixView)

        if(bgImg && bgImg.pixels.length && !showMask){

          threshObject.do(pixView);
          mixObject.do(bgImg.pixels,greenScreenMedia.pixels,pixView)

        }

      }

      // On lit les pixels par par colonne
      // c'est à dire , pour chaque pixels de 0 à largeur(camera.width), on lit toute la colonne correspondante : de 0 à hauteur(camera.height)
      const fitR = Utils.fitStretched(greenScreenMedia,canvas)
      const w = canvas.width;
      const h = canvas.height;
      const wToCam = greenScreenMedia.width/fitR.width;
      const hToCam  = greenScreenMedia.height/fitR.height;
      const camWidth = greenScreenMedia.width;

      for (let i = 0; i < fitR.width; i++) { // on itère sur les colonnes
        for (let j = 0; j < fitR.height; j++) { // on itère sur les lignes

          // on calcule la position dans la memoire camera.pixel qui est un tableau à une dimension
          // dans processing, les tableaux de pixels correspondent à toute les lignes horizontales mis bout à bout
          const iCam = int(i*wToCam);
          const jCam = int(j*hToCam);

          const position1dPix = (jCam*camWidth + iCam)*4;
          const position1dCanvas = ((j+fitR.top)*w + i+fitR.left)*4;
          pixels[position1dCanvas +0] = pixView[position1dPix +0];
          pixels[position1dCanvas +1] = pixView[position1dPix +1];
          pixels[position1dCanvas +2] = pixView[position1dPix +2];


        }
      }
    }
    // une fois que tout les pixels de la fenetre ont été calculés et écrits dans la variable "pixels"
    // nous informons que la fenetre peut etre déssinée
    updatePixels();

    rect(rStat.x,rStat.y,rStat.w,rStat.h)
    stroke(255)
    fill(255);
    const step = 30*getCanvasScale();
    textSize(step*0.8);
    let yT = 30;
    text('cam '+greenScreenMedia.width+','+greenScreenMedia.height, 10, yT);yT+=step;
    text('canvas '+width+','+height, 10, yT);yT+=step;
    text('window '+getCanvasResW()+','+getCanvasResH(), 10, yT);yT+=step;
  }

}



function mouseClicked(e) {
  if(e.srcElement != canvas.canvas || (mouseStart.x>0 && mouseStart.x!=mouseX)){ return;}
  
  const iCam = Math.floor(mouseX*greenScreenMedia.width/canvas.width);
  const jCam = Math.floor(mouseY*greenScreenMedia.height/canvas.height);

  const loc = (jCam*greenScreenMedia.width + iCam)*4;
  // greenScreenMedia.loadPixels();
  const c = new Color(
    greenScreenMedia.pixels[loc + 0],
    greenScreenMedia.pixels[loc + 1],
    greenScreenMedia.pixels[loc + 2],
    )
  substractObject.setVariance([0,0,0])
  substractObject.setHSVVariance([0,0,0])
  substractObject.setColor(c);
  
  const hex = Utils.rgbToHex(c[0],c[1],c[2]);
  UI.color.value(hex)

  c.toHSV255()
  substractObject.setHSVColor(c)
  // prevent default
  return false;
}

function mousePressed(e){
  if(e.srcElement != canvas.canvas ){ mouseStart.x=-1;return;}
  mouseStart.x = mouseX
  mouseStart.y = mouseY
}

function mouseDragged(e){
 if(mouseStart.x<0){return}
  rStat.x = mouseStart.x
rStat.y = mouseStart.y
rStat.w = mouseX - mouseStart.x
rStat.h = mouseY - mouseStart.y

}

function mouseReleased(e){}

function keyPressed(k){
  if(k.key=='s'){

    const st = generateStats()
    const desiredRgb =[0,0,0];//st.rgb.mean
    Utils.hsv2rgb(st.hsv.mean[0]*360/255,st.hsv.mean[1]/255,st.hsv.mean[2]/255,desiredRgb)

    const hex = Utils.rgbToHex(desiredRgb[0],desiredRgb[1],desiredRgb[2])
    UI.color.value(hex)
    substractObject.setVariance(st.rgb.variance)
    substractObject.setHSVVariance(st.hsv.variance)
    substractObject.setColor(st.rgb.mean)
    substractObject.setHSVColor(st.hsv.mean)
    console.log(st.rgb.mean,desiredRgb)
    console.log(st)
  }
  if(k.key=='h'){
    UI.toggleHide()
  }
}

function generateStats(){
  const wToCam = greenScreenMedia.width/canvas.width;
  const hToCam  = greenScreenMedia.height/canvas.height;
  if(rStat.w < 0){rStat.w*=-1 ; rStat.x -= rStat.w}
  if(rStat.h < 0){rStat.h*=-1; rStat.y -= rStat.h}

  const st = Stats.instance.getDistribution(greenScreenMedia,
    rStat.x*wToCam,rStat.y*hToCam,
    rStat.w*wToCam,rStat.h*hToCam)

  const hsvObj={
    pixels:Utils.arrToHsv255Wrap( Float32Array.from(greenScreenMedia.pixels)),
    width : greenScreenMedia.width,
    height: greenScreenMedia.height,
    isHue:true
  }

  const sthsv = Stats.instance.getDistribution(hsvObj,
    rStat.x*wToCam,rStat.y*hToCam,
    rStat.w*wToCam,rStat.h*hToCam)

  return {rgb:st,hsv:sthsv}
}


/////////////////
// UI
/////////////////

var UIElementHeight = 25*window.devicePixelRatio;
var UIElementWidth = 300;
function layoutUI(){

  const yT = 10;
  UIElementHeight = Math.max(70*window.devicePixelRatio,(getWindowHeight()-yT)/(UI.getAllUIElements().length+1))
  UIElementWidth = Utils.isMobile()?getWindowWidth():Math.max(300*window.devicePixelRatio,getWindowWidth()/2)
  const xT = getWindowWidth() -UIElementWidth;
  UI.layout(xT,yT,UIElementWidth,UIElementHeight);
}



class MainUI{
  constructor(){
    this.container = createDiv()
    this.container.addClass("UIContainer")
    this.container.style('background','#ffffff50')
    this.container.style('overflow-y','scroll')



    this.showHide = this.createNamedCB("showHide",true).mousePressed(()=>this.toggleHide())
    this.showHide.style('background-color','gray')
    this.showHide.setZindex(1000)

    this.button = this.createNamedButton('fullscreen').mousePressed(()=>{fullscreen(!fullscreen())});
    this.showMask = this.createNamedCB('showMask').input(v=>{showMask = v.srcElement.checked ; substractObject.setDebug(false)})
    this.showDist = this.createNamedCB('showDist').input(v=>{ substractObject.setDebug(v.srcElement.checked)})

    this.bslider  = this.createNamedSlider('blur',0, 30, 0).input(v=>blurObject.setBlurSize(v.srcElement.value));
    this.sliderT  = this.createNamedSlider('thresh',0, 255, 1).input(v=>threshObject.setThreshold(parseFloat(v.srcElement.value)));
    this.tSmooth = this.createNamedSlider('smooth',0, 100, 100).input(v=>threshObject.setSmooth(v.srcElement.value/100));
    this.color = this.createNamedInput('color','#ffffff', 'color').input(v=>{
      const col = Color.fromHex(v.srcElement.value)
      substractObject.setColor(col);
      col.toHSV255()
      substractObject.setHSVColor(col);
    })

    // this.methods = createSelect();
    // for(const k in blur_methods){this.methods.option(k);}
    //   this.methods.changed(v=>setCurrentBlur(this.methods.value()));


    this.tDist = this.createNamedSelect('difference');
    for(const k in DistJS.dists){ this.tDist.option(k) ; }
      this.tDist.changed(v=>substractObject.setDist(this.tDist.value()));

    this.tNorm = this.createNamedSelect('distance');
    for(const k in DistJS.norms){this.tNorm.option(k);}
      this.tNorm.changed(v=>substractObject.setNorm(this.tNorm.value()));

    this.useHSV = this.createNamedCB('useHSV').input(v=>{substractObject.useHSV = v.srcElement.checked})
    this.w1 = this.createNamedSlider('w1',0, 100, 0).input(v=>this.updateWeights());
    this.w2 = this.createNamedSlider('w2',0, 100, 0).input(v=>this.updateWeights());
    this.w3 = this.createNamedSlider('w3',0, 100, 0).input(v=>this.updateWeights());
    // this.switchVid = this.createNamedButton('switchVid').mousePressed(v=>{greenScreenMedia=(greenScreenMedia==video?camera:video)})
    this.switchVid = this.createNamedSelect('switchVid')
    for(const k of greenScreenMedias){this.switchVid.option(k);}
      this.switchVid.changed(
        v=>{
          greenScreenMedia.remove();
          const s = this.switchVid.value()
          if(s=="webcam" || Object.keys(webcams).indexOf(s)>=0){
            
            const device= webcams[s] 
            let caps =  {width:{max:640},height:{max:480}}
            // if(device.getCapabilities)
            //   {caps = device.getCapabilities() }
            
            const constraints = device?{
              audio:false,
              video:{
                deviceId:device.deviceId,
                width:Math.min(caps.width.max,getCanvasResW()),
                height:Math.min(caps.height.max,getCanvasResH()),
              }
            }
            : VIDEO
            greenScreenMedia = createCapture(constraints,d=>{

            });
            
              // greenScreenMedia=camera;
            }
            else{greenScreenMedia = createVideo('medias/'+this.switchVid.value());greenScreenMedia.loop()}
            greenScreenMedia.hide();
          });


    this.switchBack = this.createNamedSelect('switchBack')
    for(const k of bgMedias){this.switchBack.option(k);}
      this.switchBack.changed(v=>loadImage('medias/'+this.switchBack.value(),d=>{bgImg=d;bgImg.loadPixels()}) );
    this.pause = this.createNamedCB('pause').input(v=>{if(video && video.pause){if(v.srcElement.checked){video.pause();}else{video.play()}}});    
    this.pauseComp = this.createNamedCB('pauseComp').input(v=>{realTimeCompute=!v.srcElement.checked;})
    this.download = this.createNamedButton('download').mousePressed(()=>{Utils.generateImage()});    

    if(typeof Worker==='undefined')this.download.style('color','red');

  }
  toggleHide(){
    if(this.hidden){
      this.container.show()
      this.hidden=false
    }
    else{
      this.container.hide()
      this.showHide.show()
      this.hidden = true
    }
  }

  updateWebCams(){
    
    console.log(this.switchVid.sl.child(),this.switchVid.sl.option())
    
    for(let k of this.switchVid.sl.child()){
      k.remove()
    }
    for(const k of greenScreenMedias){
      this.switchVid.option(k);
    }
    for(const k in webcams){
     this.switchVid.option(k); 
   }
 }
 updateWeights(){
  substractObject.setWeights([this.w1,this.w2,this.w3].map(v=>parseFloat(v.value())/100))
}
getAllUIElements(){let members = []
  for(let k of Object.getOwnPropertyNames(this)){
    if(this[k]!=this.container && this[k].size){
      members.push(this[k])
    }
  }
  return members
}

layout(xT,yT,UIElementWidth,UIElementHeight){
  const allUIs = this.getAllUIElements(); 
  const vGap = 1
  
  let yC = 0
  for(let v of allUIs){
    v.size( UIElementWidth, UIElementHeight-2*vGap)
    v.position(0,yC+vGap)
    yC+=UIElementHeight;
  }
  const maxHeight = Math.min(allUIs.length * UIElementHeight,windowHeight)-yT
  this.container.position(xT,yT)
  this.showHide.position(xT,yT)
  this.container.size(UIElementWidth,maxHeight)

}
createNamedSlider(name,min,max,def){
  const ob = new Utils.NamedObject(name,createSlider(min,max,def))
  this.container.child(ob.getDiv())
  return ob
}
createNamedInput(name,def,nameI){
  const ob =  new Utils.NamedObject(name,createInput(def,nameI))
  this.container.child(ob.getDiv())
  return ob
}
createNamedSelect(name){
  const ob = new Utils.NamedObject(name,createSelect(name))
  this.container.child(ob.getDiv())
  return ob
}
createNamedCB(name,detached){
  const ob = new Utils.NamedObject(name,createCheckbox())
  if(!detached)this.container.child(ob.getDiv())
    return ob
}
createNamedButton(name){
  const ob = new Utils.NamedObject(name,createButton(''))
  this.container.child(ob.getDiv())
  return ob
}
}

window.setup = setup
window.draw = draw
window.windowResized = windowResized
window.mouseClicked = mouseClicked
window.mousePressed = mousePressed
window.mouseReleased = mouseReleased
window.mouseDragged = mouseDragged
window.keyPressed = keyPressed

