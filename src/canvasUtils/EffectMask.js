import { blendEffects } from "./Effect"
import { hexToRGB } from "./utils"


export default class EffectMask {

    constructor(effectType, canvasInitializer, canvases, initialStrength) {
      
        this.drawColor = '#907A7A'
        this.canvases = {
          finalCanvas: canvases.finalCanvas,
          finalContext: canvases.finalContext,
          startingCanvas: canvases.startingCanvas,
          startingContext: canvases.startingContext,
          maskCanvas: canvasInitializer.createHiddenCanvas([canvases.startingCanvas.width, canvases.startingCanvas.height])            
        }
        this.canvases.maskContext = this.canvases.maskCanvas.getContext('2d')
        this.canvasContainerRef = canvasInitializer.canvasContainerRef
        this.effectType = effectType
        this.effectStrength = initialStrength
    }

    applyEffect =  (replaceOriginal = true) => {
      const effect = blendEffects[this.effectType]
      if (effect) {
        //apply effect to editing canvas
        blendEffects.resetCanvas(this.canvases)
        effect(this.canvases, this.effectStrength)
        blendEffects.applyMask(this.canvases)
        // this becomes the starting point for the next effect in the chain
        if (replaceOriginal){
          blendEffects.replaceOriginal(this.canvases)
        }
    }
  }

    fillMask = ( erase = false) => {
      this.canvases.maskContext.fillStyle = this.drawColor
      if (erase) {
        this.canvases.maskContext.globalCompositeOperation = 'destination-out';
      } else {
        this.canvases.maskContext.globalCompositeOperation = 'source-over';

      }
      this.canvases.maskContext.fillRect(0, 0, this.canvases.maskCanvas.width, this.canvases.maskCanvas.height);
      this.canvases.maskContext.globalCompositeOperation = 'source-over';
    }
    
    drawToMask = (coordinates, brushSettings, eraseMode = false) => {
      let {size} = brushSettings
      const color = this.drawColor
      const radgrad = this.canvases.maskContext.createRadialGradient(coordinates.x, coordinates.y, size / 2.5 , coordinates.x, coordinates.y, size / 2);
      radgrad.addColorStop(0, `${hexToRGB(color, brushSettings.opacity/5)}`);
      radgrad.addColorStop(1, `${hexToRGB(color,0)}`);
      
      this.canvases.maskContext.fillStyle = radgrad
      
      if (eraseMode) {
        this.canvases.maskContext.globalCompositeOperation = 'destination-out';
      }
      // erase the previous area - this prevents multiple draws from affecting opacity
      else{
        this.canvases.maskContext.globalCompositeOperation = 'source-over';
      }
        this.canvases.maskContext.fillRect(coordinates.x - size / 2, coordinates.y - size / 2, size, size);
    }
  }
  