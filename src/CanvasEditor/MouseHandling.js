  /// FUNCTIONS FOR DRAWING
import { distanceBetween, angleBetween} from "./utils";


export function attachCanvasEvents(finalCanvas, applyAllMasks){
  /// bind this function to the editor

  const makeMaskVisible = (e) => {
    const activeMask = this.state.activeMask
    activeMask.canvases.maskCanvas.className='visible-mask-canvas'
  }

  const hideMask = (e) => {
    const activeMask = this.state.activeMask
    const maskEffect = activeMask
    maskEffect.canvases.maskCanvas.className='hidden-canvas'  
  }

  const handleMouseDown = (e)  => {
    makeMaskVisible()
    let {top, left} = finalCanvas.getBoundingClientRect()

    let lastPoint = { x: e.clientX - left , y: e.clientY - top };
    this.brushState.lastPoint = lastPoint
    this.brushState.isDrawing = true
  };
  
  const  handleMouseUp= (e)  => {
    hideMask()
    this.brushState.isDrawing = false
  }
  
  const handleMouseMove = (e) => {
    const {brushSettings, brushState} = this

    const activeMask = this.state.activeMask
    if (!brushState.isDrawing) {
      return
    }
    let {top, left} = finalCanvas.getBoundingClientRect()
    var currentPoint = { x: e.clientX - left , y: e.clientY - top };
    var dist = distanceBetween(brushState.lastPoint, currentPoint);
    var angle = angleBetween(brushState.lastPoint, currentPoint);
    
    for (var i = 0; i < dist; i+=brushSettings.size/2) {
      let x = brushState.lastPoint.x + (Math.sin(angle) * i);
      let y = brushState.lastPoint.y + (Math.cos(angle) * i);
      activeMask.drawToMask({x:x, y:y},brushSettings, this.state.eraseMode)
      applyAllMasks()
    }
    brushState.lastPoint = currentPoint
  }
    finalCanvas.addEventListener('mousedown', handleMouseDown)
    finalCanvas.addEventListener('mousemove', handleMouseMove)
    finalCanvas.addEventListener('mouseup', handleMouseUp)
}