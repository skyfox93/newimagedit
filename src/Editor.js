import React, { Component } from 'react';
import CanvasCreator from './CanvasEditor/CanvasCreator';
import EffectMask from './CanvasEditor/EffectMask';
import { attachCanvasEvents } from './CanvasEditor/MouseHandling';
import UnsharpMask from './CanvasEditor/UnsharpMask';
import { loadImageFromFile, loadImageFromUrl } from './CanvasEditor/utils';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import BrushIcon from '@mui/icons-material/Brush';
import { Accordion, AccordionDetails, AccordionSummary, Button, Card, Icon, IconButton, Slider, Tab, Tabs } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { Clear, Layers, LightMode, Opacity, Square } from '@mui/icons-material';
import EffectsPanel from './EffectsPanel';

const CanvasContainer = React.memo((props) => {
  return (<div id='imageContainer' ref={props.canvasRef} style={{display: 'inline-block'}} ></div>)
}, (prev, next) => (prev.currentFileId === next.previousFile))

const defaultColor = '#857A7A'
class Editor extends Component {
  constructor(props) {
    super(props);
    this.editorC = React.createRef();
    this.brushPreview = React.createRef();
    this.attachCanvasEvents = attachCanvasEvents.bind(this)
    //this.applyAllMasks = throttle(this.applyAllMasks, 500)
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

  activateEraser = () => {
    this.setState({ eraseMode: true })
  }



  handleSwitchMasks = (maskName) => {
    const newMask = this.masks.find((mask) => mask.effectType === maskName)
    if (newMask) {
      this.setState({ activeMask: newMask })
    }
  }

  updateMaskColor = (maskName, maskColor) => {
    const mask = this.masks.find((mask) => mask.effectType === maskName)
    mask.drawColor = maskColor
  }

  updateEffectStrength = (strength) => {
    if (this.state.activeMask) {
      const mask = this.state.activeMask
      mask.effectStrength = strength
      this.applyAllMasks()
    }

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

  handleFill = () => {
    this.state.activeMask.fillMask(false)
    this.applyAllMasks()
  }

  handleClear = () => {
    this.state.activeMask.fillMask(true)
    this.applyAllMasks()
  }

effectsPanel = () => {
  return (
    <Card className='tools-div' sx={{width: '500px'}}>
    {this.renderAccordian('Details', 'structure')}
    {this.renderAccordian('Color Filter', 'overlay')}
    {this.renderAccordian('Color Replace', 'color')}
  </Card>
  )
}

brushTools = () => {
    return (
      <Stack direction="row" spacing={4} sx={{ alignItems: 'center' }}>
      <ToggleButtonGroup
            exclusive
            value={this.state.eraseMode ? 'erase' : 'brush'}
            onChange={(e, value) => { this.setState({ eraseMode: value === 'erase' }) }}
          >
            <ToggleButton
              value='brush' >
                <BrushIcon /> Draw

            </ToggleButton>
            <ToggleButton value='erase' > <img src="./eraser.png" /> Erase </ToggleButton>
          </ToggleButtonGroup>
        <Stack spacing={1} direction="row" sx={{ mb: 1 }} alignItems="center">
          <BrushIcon /> Size
          <Slider
            id='brsize'
            type="range"
            min={20} max={300}
            defaultValue={100}
            onChange={(e) => this.updateBrushSettings('size', e.target.value)}
            sx={{ width: '100px' }}
          />
        </Stack>
        <Stack spacing={1} direction="row" sx={{ mb: 1 }} alignItems="center"><BrushIcon /> Opacity
          <Slider
            sx={{ width: '100px' }}
            id='brstrength'
            type="range" min={0} max={100} defaultValue={100}
            onChange={(e) => {
              this.updateBrushSettings('opacity', e.target.value / 100)
            }}
          />
        </Stack>
      </Stack>
    )
}

render() {
  const brushPreviewSize = this.canvases && this.canvases.finalCanvas && this.state.brushSettings.size ? this.state.brushSettings.size * (this.canvases.finalCanvas.clientWidth / this.canvases.finalCanvas.width) : '10'

  return (
    <div id="container" style={{margin: 'auto', display: 'inline-block'}}>
      <Stack direction='row'>
          <input type='file' id='fileinput' onChange={this.handleFileInput} />
          <Button component="label" for='fileinput' > <FolderOpenIcon></FolderOpenIcon>  Open New </Button>
      </Stack>
     

      <svg ref={this.brushPreview} id='svg' height={brushPreviewSize + 1} width={brushPreviewSize + 1} style={{ position: 'fixed', zIndex: 30, pointerEvents: 'none' }}>
        <circle cx={1 + brushPreviewSize / 2} cy={1 + brushPreviewSize / 2} r={brushPreviewSize / 2} stroke="black" stroke-width="1" fill='none' />

      </svg>
      
      {this.brushTools()}
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
