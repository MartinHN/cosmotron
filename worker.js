

importScripts( './lib/BlurJS.js',
  './lib/MixJS.js',
  './lib/ThresholdJS.js',
  './lib/DistJS.js'
  )



let blurObject,threshObject,distObject,mixObject;
let pixels;
let sourceW,sourceH,destW,destH;

self.onmessage = function(msg){

  const cfg = msg.data
  sourceW=cfg.sourceW
  sourceH=cfg.sourceH
  destW=cfg.destW
  destH=cfg.destH
  setup(cfg.sourceW,cfg.sourceH,cfg.destW,cfg.destH);
  configure(cfg.algosCfg)
  generate(cfg.camPixels,cfg.bgPixels)
  postMessage('hi')
}



function setup(sourceW,sourceH,destW,destH) {


  blurObject = new BlurJS().init(sourceW,sourceH)
  threshObject = new ThresholdJS().init(sourceW,sourceH);
  distObject = new DistJS().init(sourceW,sourceH);
  mixObject = new MixJS().init(sourceW,sourceH);
  pixels = new Uint8ClampedArray(destW*destH*4)

}


function configure(cfg){
blurObject.fromCfg(cfg.blur);
threshObject.fromCfg(cfg.thresh);
distObject.fromCfg(cfg.dist);
mixObject.fromCfg(cfg.mix);
}



function generate(camPixels,bgPixels) {


  const pixView = camPixels.slice();

  
  distObject.do(pixView)
  
  blurObject.do(pixView)
  
  threshObject.do(pixView);
  
  mixObject.do(bgPixels,camPixels,pixView)




    // On lit les pixels par par colonne
    // c'est à dire , pour chaque pixels de 0 à largeur(camera.width), on lit toute la colonne correspondante : de 0 à hauteur(camera.height)
    const w = destW;
    const h = destH;
    const wToCam = sourceW/w;
    const hToCam  = sourceH/h;
    const camWidth = sourceW;
    for (let i = 0; i < w; i++) { // on itère sur les colonnes
      for (let j = 0; j < h; j++) { // on itère sur les lignes

        // on calcule la position dans la memoire camera.pixel qui est un tableau à une dimension
        // dans processing, les tableaux de pixels correspondent à toute les lignes horizontales mis bout à bout
        const iCam = Math.floor(i*wToCam);
        const jCam = Math.floor(j*hToCam);

        const position1dPix = (jCam*camWidth + iCam)*4;
        const position1dCanvas = (j*w + i)*4;

        
        ///////////////////////////////
        // Manipulation des pixels
        ///////////////////////////////

        // const r = pixView[position1dPix +0];
        // const g = pixView[position1dPix +1];
        // const b = pixView[position1dPix +2];
        
        

        ////////////////////////////
        // sauvegarde de la manipulation
        ////////////////////////////
        // on sauvegarde le résultat dans la variable "pixels" qui sera ensuite affichée à l'ecran
        
        // calcul des composantes rouge,vert,bleu du pixel de camera

        
        // pixels[position1dCanvas +0] = r;
        // pixels[position1dCanvas +1] = g;
        // pixels[position1dCanvas +2] = b;
        pixels[position1dCanvas +0] = pixView[position1dPix +0];
        pixels[position1dCanvas +1] = pixView[position1dPix +1];
        pixels[position1dCanvas +2] = pixView[position1dPix +2];


      }
    }

    postMessage(pixels);
  }

// export default {l:'lala'} 


postMessage('hi')