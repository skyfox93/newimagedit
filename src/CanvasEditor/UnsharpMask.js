import EffectMask from './EffectMask'
import { blendEffects } from './Effect'
import stackBlurImage from './blurFunction'

export default class UnsharpMask extends EffectMask {

    constructor(effectType, canvasInitializer, finalCanvas, startingCanvas, finalContext, startingContext){
        super(effectType, canvasInitializer, finalCanvas, startingCanvas, finalContext, startingContext)
        this.canvasInitializer = canvasInitializer
        this.initalizeUnsharpCanvases()
    }
  
    initalizeUnsharpCanvases = () => {
      const blurCanvas  = this.canvasInitializer.createHiddenCanvas()
      blurCanvas.id = 'blurCanvas'
      const greyScaleCanvas =  this.canvasInitializer.createHiddenCanvas()
      const blurContext = blurCanvas.getContext('2d')
      const greyScaleContext = greyScaleCanvas.getContext('2d')
      this.canvases.greyScaleCanvas = greyScaleCanvas
      this.canvases.greyScaleContext = greyScaleContext
      this.canvases.blurCanvas = blurCanvas
      this.canvases.blurContext = blurContext
      this.canvases.greyScaleContext.drawImage(this.canvases.startingCanvas, 0, 0)
      blendEffects.greyScaleCanvas(this.canvases)
      blurContext.drawImage(this.canvases.greyScaleCanvas, 0, 0)

      stackBlurImage('blurCanvas', 12, this.canvasContainerRef);
      // invert the blurred image
      blurContext.globalCompositeOperation = "difference";
      blurContext.fillStyle = "white";
      blurContext.fillRect(0, 0, blurCanvas.width, blurCanvas.height);
  
    }
  
  }