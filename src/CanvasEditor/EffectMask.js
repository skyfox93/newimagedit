import { blendEffects } from "./Effect"
import { hexToRGB } from "./utils"


export default class EffectMask {

    constructor(effectType, canvasInitializer, finalCanvas, startingCanvas, finalContext, startingContext) {
        this.effectOpacity = 1
        this.drawColor = '#FF0000'
        this.canvases = {
          finalCanvas: finalCanvas,
          finalContext: finalContext,
          startingCanvas: startingCanvas,
          startingContext: startingContext,
          maskCanvas: canvasInitializer.createHiddenCanvas([startingCanvas.width, startingCanvas.height])            
        }
        this.canvases.maskContext = this.canvases.maskCanvas.getContext('2d')
        this.canvasContainerRef = canvasInitializer.canvasContainerRef
        this.effectType = effectType
        this.effectStrength = 1
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
    
    drawToMask = (coordinates, brushSettings, eraseMode = false) => {
      let {size} = brushSettings
      const color = this.drawColor
      console.log(coordinates,size,color)
      const radgrad = this.canvases.maskContext.createRadialGradient(coordinates.x, coordinates.y, 1, coordinates.x, coordinates.y, size / 2);
      radgrad.addColorStop(0, `${color}`);
      radgrad.addColorStop(1, `${hexToRGB(color,0)}`);
      if (eraseMode) {
        console.log('ERASE MODE')
        this.canvases.maskContext.globalCompositeOperation = 'destination-out';
      }else {
        this.canvases.maskContext.globalCompositeOperation = 'source-over'
      }
      this.canvases.maskContext.fillStyle = radgrad
      this.canvases.maskContext.fillRect(coordinates.x - size / 2, coordinates.y - size / 2, size, size);
      this.applyEffect(false)
    }
  }
  