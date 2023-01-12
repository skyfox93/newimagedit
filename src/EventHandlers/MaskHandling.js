import EffectMask from "../canvasUtils/EffectMask"
import UnsharpMask from "../canvasUtils/UnsharpMask"

export function handleFill() {
    this.state.activeMask.fillMask(false)
    this.applyAllMasks()
}

export function handleClear() {
    this.state.activeMask.fillMask(true)
    this.applyAllMasks()
}


export function handleSwitchMask(maskName) {
    const newMask = this.masks.find((mask) => mask.effectType === maskName)
    if (newMask) {
        this.setState({ activeMask: newMask })
    }
}

export function updateMaskColor(maskName, maskColor) {
    const mask = this.masks.find((mask) => mask.effectType === maskName)
    mask.drawColor = maskColor
}

export function updateEffectStrength(strength) {
    if (this.state.activeMask) {
        const mask = this.state.activeMask
        mask.effectStrength = strength
        this.applyAllMasks()
    }
}


export function createMasks(canvasCreator){
    let masks = ['structure', 'overlay', 'color',].map(effectType => {
      let effectMask = null
      if (effectType === 'structure') {
        effectMask = new UnsharpMask(effectType, canvasCreator, this.canvases.finalCanvas, this.canvases.startingCanvas, this.canvases.finalContext, this.canvases.startingContext)
      } else {
        effectMask = new EffectMask(effectType, canvasCreator, this.canvases.finalCanvas, this.canvases.startingCanvas, this.canvases.finalContext, this.canvases.startingContext)
      }
      return effectMask
    })
    masks.forEach(mask => mask.fillMask())
    this.masks = masks
  }


export function redrawMainCanvas(originalImage, startingContext, finalContext, startingCanvas, finalCanvas){
    startingContext.drawImage(originalImage, 0, 0, startingCanvas.width, startingCanvas.height);
    finalContext.drawImage(originalImage, 0, 0, finalCanvas.width, finalCanvas.height)
  }


export function applyAllMasks(){
    if (this.canvasBusy) {
      return
    }
    this.canvasBusy = true
    this.redrawMainCanvas(this.originalImage, this.canvases.startingContext, this.canvases.finalContext, this.canvases.startingCanvas, this.canvases.finalCanvas)
    this.masks.forEach(mask => {
      mask.applyEffect()
    })
    this.canvasBusy = false
  }