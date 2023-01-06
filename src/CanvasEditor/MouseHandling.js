  /// FUNCTIONS FOR DRAWING
import { act } from "@testing-library/react";
import { distanceBetween, angleBetween} from "./utils";


export function attachCanvasEvents(finalCanvas, applyAllMasks){

  const mousePointsToCanvasPoints = (canvas, displayDimensions) => {
    const widthRatio =  canvas.width / canvas.clientWidth
    const heightRatio =  canvas.height /canvas.clientHeight
    return {x: displayDimensions.x * widthRatio, y: displayDimensions.y * heightRatio}
  }


  const makeMaskVisible = (activeMask) => {
    activeMask.canvases.maskCanvas.className='visible-mask-canvas'
  }

  const hideMask = (activeMask) => {
    activeMask.canvases.maskCanvas.className='hidden-canvas'  
  }

  const startDrawing = (e)  => {
    console.log('fired mouse down')
    let {top, left} = finalCanvas.getBoundingClientRect()
    makeMaskVisible(this.state.activeMask)
    let lastPoint = mousePointsToCanvasPoints(finalCanvas, { x: e.clientX - left , y: e.clientY - top });
    this.brushState.lastPoint = lastPoint
    this.brushState.isDrawing = true
  };
  
  const  stopDrawing= (e)  => {
    hideMask(this.state.activeMask)
    this.brushState.isDrawing = false
  }

  const moveBrushPreview = (brushPreview, x, y, brushSettings) => {
    brushPreview.style.top = y - brushSettings.size/4
    brushPreview.style.left = x - brushSettings.size/4
  }
  
  const drawToCanvas = (mouseX, mouseY, activeMask, brushState, brushSettings) => {
    const {top, left} = finalCanvas.getBoundingClientRect()

    const coordinates = mousePointsToCanvasPoints(finalCanvas,{ x: mouseX - left , y: mouseY - top })

    const dist = distanceBetween(brushState.lastPoint, coordinates);
    const angle = angleBetween(brushState.lastPoint, coordinates);
    if (dist > brushSettings.size/4) {
      for (var i = 0; i < dist; i+=brushSettings.size/4) {
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
    moveBrushPreview(brushPreview.current, mouseX, mouseY, brushSettings)

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