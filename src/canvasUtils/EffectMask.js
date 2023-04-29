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
        this.points = []
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

    startDrawing = (point, size, opacity) => {
        this.points.push({points: [point], size, color: this.drawColor, opacity})
    }

    fillMask = ( erase = false) => {
      this.canvases.maskContext.fillStyle = this.drawColor
      this.points = []
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
      const ctx = this.canvases.maskContext

   



      
      if (eraseMode) {
        const radgrad = this.canvases.maskContext.createRadialGradient(coordinates.x, coordinates.y, size / 2.5 , coordinates.x, coordinates.y, size / 2);
        radgrad.addColorStop(0, `${hexToRGB(color, brushSettings.opacity/10)}`);
        radgrad.addColorStop(1, `${hexToRGB(color,0)}`);
        ctx.fillStyle= radgrad

        this.canvases.maskContext.globalCompositeOperation = 'destination-out';
        this.canvases.maskContext.fillRect(coordinates.x - size / 2, coordinates.y - size / 2, size, size);
      }
      // erase the previous area - this prevents multiple draws from affecting opacity
      else{
        this.canvases.maskContext.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, this.canvases.maskCanvas.width, this.canvases.maskCanvas.height);
        this.points[this.points.length - 1].points.push(coordinates);
        this.points.forEach(pointbatch => {
          ctx.beginPath();
          ctx.lineWidth = pointbatch.size * 0.75;
          ctx.lineJoin = ctx.lineCap = 'round';
          ctx.shadowBlur = pointbatch.size/3;
          ctx.shadowColor = `${hexToRGB(pointbatch.color|| '#000000', pointbatch.opacity)}`
          ctx.strokeStyle= `${hexToRGB(pointbatch.color|| '#000000', pointbatch.opacity)}`
          ctx.moveTo(pointbatch.points[0].x, pointbatch.points[0].y);
          pointbatch.points.forEach((point)=>{
            ctx.lineTo(point.x, point.y);
          })
          ctx.stroke()
        })

      }
    }
  }
  