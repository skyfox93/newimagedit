import EffectMask from './EffectMask'
import { blendEffects } from './Effect'
import stackBlurImage from './blurFunction'
import { fx } from './glfx'

export default class UnsharpMask extends EffectMask {

    constructor(effectType, canvasInitializer, finalCanvas, startingCanvas, finalContext, startingContext){
        super(effectType, canvasInitializer, finalCanvas, startingCanvas, finalContext, startingContext)
        this.canvasInitializer = canvasInitializer
        this.initalizeUnsharpCanvases()
    }
  
    initalizeUnsharpCanvases = () => {
      let fxCanvas = fx.canvas()
      let texture = fxCanvas.texture(this.canvases.startingCanvas)
      fxCanvas.draw(texture).unsharpMask(20, 1).update()
      this.canvases.greyScaleCanvas = fxCanvas
    

    }
  
  }