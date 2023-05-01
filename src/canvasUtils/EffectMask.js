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
        this.futurePoints = []
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

    startDrawing = (point, size, opacity, eraseMode) => {
        this.points.push({points: [point], size, color: this.drawColor, opacity, eraseMode})
        this.futurePoints = []
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

    drawHistory = () => {
      const ctx = this.canvases.maskContext
      this.canvases.maskContext.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, this.canvases.maskCanvas.width, this.canvases.maskCanvas.height);
      this.points.forEach(pointbatch => {
        if (pointbatch.eraseMode) {
            ctx.globalCompositeOperation = 'destination-out';
          } else {
            ctx.globalCompositeOperation = 'source-over'
          }
        pointbatch.points.forEach((point)=>{
          
          const radgrad2 = this.canvases.maskContext.createRadialGradient(point.x, point.y, pointbatch.size / 2.5 , point.x, point.y, pointbatch.size / 2);
          radgrad2.addColorStop(0, `${hexToRGB(pointbatch.color,pointbatch.opacity === 1 ? 1 : pointbatch.opacity/3)}`);
          radgrad2.addColorStop(1, `${hexToRGB(pointbatch.color,0)}`);
          ctx.fillStyle=radgrad2
          this.canvases.maskContext.fillRect(point.x - pointbatch.size / 2, point.y - pointbatch.size / 2, pointbatch.size, pointbatch.size);
        })

      })
    }

    undo = () => {
      if (this.points.length >0 ) {
        this.futurePoints.push(this.points.pop())
        this.drawHistory()
      }
    }

    redo = () => {
      if (this.futurePoints.length > 0) {
        this.points.push(this.futurePoints.pop())
        this.drawHistory()
      }
    }

    drawToMask = (coordinates, brushSettings, eraseMode = false) => {
      let {size} = brushSettings
      const color = this.drawColor
      const ctx = this.canvases.maskContext
      this.points[this.points.length - 1].points.push(coordinates);
      if (eraseMode) {
        this.canvases.maskContext.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over'
      }
        const radgrad = this.canvases.maskContext.createRadialGradient(coordinates.x, coordinates.y, size / 2.5 , coordinates.x, coordinates.y, size / 2);
        radgrad.addColorStop(0, `${hexToRGB(color, brushSettings.opacity === 1 ? 1 : brushSettings.opacity/3)}`);
        radgrad.addColorStop(1, `${hexToRGB(color,0)}`);
        ctx.fillStyle= radgrad

        this.canvases.maskContext.fillRect(coordinates.x - size / 2, coordinates.y - size / 2, size, size);
     
      }
  }
  