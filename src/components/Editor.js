import React, { Component } from 'react';
import CanvasCreator from '../canvasUtils/CanvasCreator';
import EffectMask from '../canvasUtils/EffectMask';
import { attachCanvasEvents } from '../EventHandlers/MouseHandling';
import UnsharpMask from '../canvasUtils/UnsharpMask';
import { loadImageFromFile, loadImageFromUrl } from '../canvasUtils/utils';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import BrushIcon from '@mui/icons-material/Brush';
import {  Button, Card, Slide, Slider} from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import EffectsPanel from './EffectsPanel';
import { handleClear, handleFill, handleSwitchMask, updateEffectStrength, updateMaskColor } from '../EventHandlers/MaskHandling';
import BrushSettings from './BrushSettings';

const CanvasContainer = React.memo((props) => {
  return (<div id='imageContainer' ref={props.canvasRef} style={{display: 'inline-block'}} ></div>)
}, (prev, next) => (prev.currentFileId === next.previousFile))

const defaultColor = '#857A7A'
class Editor extends Component {
  constructor(props) {
    super(props);
    this.editorC = React.createRef();
    this.brushPreview = React.createRef();

    // bind event handlers
    this.attachCanvasEvents = attachCanvasEvents.bind(this)
    this.handleFill = handleFill.bind(this)
    this.handleSwitchMasks = handleSwitchMask.bind(this)
    this.handleClear = handleClear.bind(this)
    this.updateMaskColor = updateMaskColor.bind(this) 
    this.updateEffectStrength = updateEffectStrength.bind(this)

    this.masks = []

    this.brushState = {
      lastPoint: null,
      isDrawing: false
    }
    this.state = {
      brushSettings: {
        opacity: '1',
        size: 100
      },
      activeMask: null,
      eraseMode: false
    }
  }

  componentDidMount() {
    console.log('mounted')
    const image = loadImageFromUrl('https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1287&q=80')
    image.onload = () => {
      console.log('imageLoaded')
      this.originalImage = image
      this.initEditor(image)
    }
  }
  componentWillUnmount() {
    this.editorC.current.innerHTML = ''

  }

  setEraseMode = (bool) => {
    this.setState({ eraseMode: bool })
  }


  updateBrushSettings = (setting, value) => {
    this.setState({ brushSettings: { ...this.state.brushSettings, [setting]: value } })
  }

  createMasks = (canvasCreator) => {
    let masks = ['brighten', 'structure', 'overlay', 'color',].map(effectType => {
      let effectMask = null
      if (effectType === 'structure') {
        effectMask = new UnsharpMask(effectType, canvasCreator, this.canvases.finalCanvas, this.canvases.startingCanvas, this.canvases.finalContext, this.canvases.startingContext)
      } else {
        effectMask = new EffectMask(effectType, canvasCreator, this.canvases.finalCanvas, this.canvases.startingCanvas, this.canvases.finalContext, this.canvases.startingContext)
      }
      return effectMask
    })
    this.masks = masks
  }

  redrawMainCanvas = (originalImage, startingContext, finalContext, startingCanvas, finalCanvas) => {
    startingContext.drawImage(originalImage, 0, 0, startingCanvas.width, startingCanvas.height);
    finalContext.drawImage(originalImage, 0, 0, finalCanvas.width, finalCanvas.height)

  }

  applyAllMasks = () => {
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

  initEditor = (imageObj) => {
    const canvasCreator = new CanvasCreator(this.editorC.current, [imageObj.naturalWidth, imageObj.naturalHeight])
    const canvases = canvasCreator.createMainCanvases()
    this.redrawMainCanvas(imageObj, canvases.startingContext, canvases.finalContext, canvases.startingCanvas, canvases.finalCanvas)
    this.canvases = canvases
    this.createMasks(canvasCreator)
    this.applyAllMasks()
    let structureMask = this.masks.find(mask => mask.effectType === 'structure')
    this.setState({ activeMask: structureMask }, () => this.attachCanvasEvents(this.canvases.finalCanvas, this.applyAllMasks))
  }

  handleFileInput = (evt) => {
    const file = evt.target.files[0];
    if (file) {
      let image = loadImageFromFile(file)
      this.originalImage = image
      this.editorC.current.innerHTML = ''
      image.onload = () => this.initEditor(image)
    }
  }

 renderBrushPreview = () => {
  // renders an svg circle indicating the size of the brush

  let brushPreviewSize = 10 
  if (this.canvases && this.canvases.finalCanvas && this.state.brushSettings.size) {
    const canvasRatio = (this.canvases.finalCanvas.clientWidth / this.canvases.finalCanvas.width)
    brushPreviewSize = this.state.brushSettings.size * canvasRatio
  }
  return (
    <svg ref={this.brushPreview} id='svg' height={brushPreviewSize + 2} width={brushPreviewSize + 2} style={{ position: 'fixed', zIndex: 30, pointerEvents: 'none' }}>
      <circle cx={1 + brushPreviewSize / 2} cy={1 + brushPreviewSize / 2} r={brushPreviewSize / 2} stroke="black" stroke-width="2" fill='none' />
  </svg>
  )
}


render() {

  return (
    <div id="container" style={{margin: 'auto', display: 'inline-block'}}>
      <Stack direction='row'>
          <input type='file' id='fileinput' onChange={this.handleFileInput} />
          <Button component="label" for='fileinput' > <FolderOpenIcon></FolderOpenIcon>  Open New </Button>
      </Stack>
      {this.renderBrushPreview()}
      <BrushSettings eraseMode = {this.state.eraseMode} setEraseMode ={this.setEraseMode} updateBrushSettings={this.updateBrushSettings} />
      <div style={{display: 'flex'}}>
        <CanvasContainer canvasRef={this.editorC} />
        <Card>
          <EffectsPanel
                defaultColor={defaultColor}
                activeMask={this.state.activeMask}
                handleSwitchMask={this.handleSwitchMasks}
                handleFill={this.handleFill}
                handleClear={this.handleClear}
                updateEffectStrength={this.updateEffectStrength}
                updateMaskColor={this.updateMaskColor}
          />
        </Card>
      </div>
    </div>
  );
}
}

export default Editor;
