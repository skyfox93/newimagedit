
export default class CanvasCreator {
  constructor(canvasContainerRef,  imageDimensions) {
    this.canvasContainerRef = canvasContainerRef
    this.imageDimensions = imageDimensions
  }


  createMainCanvases(){
    const [width, height] = this.limitDimensions(this.imageDimensions, 3000000)
    // this canvas will hold the original image while edits are being applied. This
    // this is because saving canvas data is an expensive operation, but copying between canvases is fast
    const canvases = {}
    canvases.startingCanvas = this.getSizedCanvas(width, height)
    canvases.finalCanvas = this.getSizedCanvas(width, height)
    canvases.startingContext = canvases.startingCanvas.getContext('2d')
    canvases.finalContext = canvases.finalCanvas.getContext('2d')

    canvases.startingCanvas.className = 'original-canvas'
    canvases.finalCanvas.className = 'main_visible_canvas'
    return canvases
  }
  
  createHiddenCanvas(dimensions) {
    if( !dimensions) {
      dimensions = this.imageDimensions
    }
    // limit the mask canvas to 3 MegaPixels for performance Reasons
    let newDimensions = this.limitDimensions(dimensions, 3000000)
    const [width, height] = newDimensions
    const maskCanvas = this.getSizedCanvas(width, height, this.canvasContainerRef)
    maskCanvas.className = 'hidden-canvas'
    return maskCanvas

  }
  
  getSizedCanvas(width, height) {
    const canvas = document.createElement('canvas')
    this.canvasContainerRef.appendChild(canvas)
    canvas.width = width
    canvas.height = height
    return canvas
  }

  limitDimensions(oldDimensions, sizeLimit) {
    const ratio = sizeLimit / (oldDimensions[0] * oldDimensions[1])
    if (ratio < 1) {
      return [Math.floor(oldDimensions[0] * ratio), Math.floor(oldDimensions[1] * ratio)]
    } else {
      return oldDimensions
    }
  }
}
