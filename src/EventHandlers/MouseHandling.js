  /// FUNCTIONS FOR DRAWING
import { distanceBetween, angleBetween} from "../canvasUtils/utils";


export function attachCanvasEvents(finalCanvas, applyAllMasks){

  const mousePointsToCanvasPoints = (canvas, displayDimensions) => {
    const widthRatio =  canvas.width / canvas.clientWidth
    const heightRatio =  canvas.height /canvas.clientHeight
    return {x: displayDimensions.x * widthRatio, y: displayDimensions.y * heightRatio}
  }

  const hideMask = (activeMask) => {
    activeMask.canvases.maskCanvas.className='hidden-canvas'  
  }

  const startDrawing = (e)  => {
    let {top, left} = finalCanvas.getBoundingClientRect()
    let lastPoint = mousePointsToCanvasPoints(finalCanvas, { x: e.clientX - left , y: e.clientY - top });
    this.brushState.lastPoint = lastPoint
    this.state.activeMask.startDrawing(this.brushState.lastPoint, this.state.brushSettings.size, this.state.brushSettings.opacity) 

    this.brushState.isDrawing = true
  };
  
  const  stopDrawing= (e)  => {
    hideMask(this.state.activeMask)
    this.brushState.isDrawing = false
  }

  const moveBrushPreview = (brushPreview, x, y, brushRadius) => {
    let brushPreviewSize = 10 
    if (this.canvases && this.canvases.finalCanvas && this.state.brushSettings.size) {
      const canvasRatio = (this.canvases.finalCanvas.clientWidth / this.canvases.finalCanvas.width)
      brushPreviewSize = this.state.brushSettings.size * canvasRatio
    }
    brushPreview.style.top = y - brushPreviewSize/2
    brushPreview.style.left = x - brushPreviewSize/2
  }
  
  const drawToCanvas = (mouseX, mouseY, activeMask, brushState, brushSettings) => {
    const {top, left} = finalCanvas.getBoundingClientRect()

    const coordinates = mousePointsToCanvasPoints(finalCanvas,{ x: mouseX - left , y: mouseY - top })

    const dist = distanceBetween(brushState.lastPoint, coordinates);
    const angle = angleBetween(brushState.lastPoint, coordinates);
    if (dist > brushSettings.size/10) {
      for (var i = 0; i < dist; i+=brushSettings.size/10) {
        let x = brushState.lastPoint.x + (Math.sin(angle) * i);
        let y = brushState.lastPoint.y + (Math.cos(angle) * i);
        activeMask.drawToMask({x:x, y:y},brushSettings, this.state.eraseMode)
        applyAllMasks()
      }
      brushState.lastPoint = coordinates
    }
    
  }

  const  handleMouseMove  = (e) => {
    const mouseX = e.clientX
    const mouseY = e.clientY
    const brushPreview = this.brushPreview
    const brushSettings = this.state.brushSettings

    moveBrushPreview(brushPreview.current, mouseX, mouseY, brushSettings.size)

    if (!this.brushState.isDrawing) {
      return
    } else {
      drawToCanvas(mouseX, mouseY, this.state.activeMask, this.brushState, this.state.brushSettings)
    }
  }
  const updateBrushSize = (e) => { 
    console.log(e.key)
    if (e.key === ']') {
      this.setState((prevState)=>({
        brushSettings: {
        ...prevState.brushSettings,
        size: prevState.brushSettings.size + 10
      }}))
    } else if (e.key === '[') {
      this.setState((prevState)=>({
        brushSettings: {
          ...prevState.brushSettings,
        size: prevState.brushSettings.size - 10
      }}))
    }
  }

  const setCursorIcon = ()=> {
      if (this.state.eraseMode) {
        finalCanvas.style.cursor='url(eraser.png),auto'
      } else {
        finalCanvas.style.cursor='url(Editing.png),auto'

      }
  }
    document.addEventListener('keydown', updateBrushSize)
    finalCanvas.addEventListener('mousedown', startDrawing)
    finalCanvas.addEventListener('mousemove', handleMouseMove)
    finalCanvas.addEventListener('mouseup', stopDrawing)
    finalCanvas.addEventListener('mouseenter', setCursorIcon)
}