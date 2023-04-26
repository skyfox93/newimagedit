import React, { Component } from 'react';
import CanvasCreator from '../canvasUtils/CanvasCreator';
import { attachCanvasEvents } from '../EventHandlers/MouseHandling';
import { loadImageFromFile, loadImageFromUrl } from '../canvasUtils/utils';
import Stack from '@mui/material/Stack';
import { Button, Card } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import EffectsPanel from './EffectsPanel';
import { applyAllMasks, createMasks, handleClear, handleFill, handleSwitchMask, redrawMainCanvas, updateEffectStrength, updateMaskColor } from '../EventHandlers/MaskHandling';
import BrushSettings from './BrushSettings';
import { Save } from '@mui/icons-material';

const CanvasContainer = React.memo((props) => {
  return (<div id='imageContainer' ref={props.canvasRef} style={{ display: 'inline-block' }} ></div>)
}, (prev, next) => (prev.currentFileId === next.previousFile))

const defaultColor = '#857A7A'
class Editor extends Component {
  constructor(props) {
    super(props);
    this.editorC = React.createRef();
    this.downloadLink = React.createRef();
    this.brushPreview = React.createRef();

    // bind event handlers
    this.attachCanvasEvents = attachCanvasEvents.bind(this)
    this.handleFill = handleFill.bind(this)
    this.handleSwitchMasks = handleSwitchMask.bind(this)
    this.handleClear = handleClear.bind(this)
    this.updateMaskColor = updateMaskColor.bind(this)
    this.updateEffectStrength = updateEffectStrength.bind(this)
    this.createMasks = createMasks.bind(this)
    this.redrawMainCanvas = redrawMainCanvas.bind(this)
    this.applyAllMasks = applyAllMasks.bind(this)

    this.masks = []

    this.brushState = {
      lastPoint: null,
      isDrawing: false
    }
    this.state = {
      brushSettings: {
        opacity: 1,
        size: 100
      },
      activeMask: null,
      eraseMode: false
    }
  }

  componentDidMount() {
    console.log('mounted')
    const image = loadImageFromUrl(`${process.env.PUBLIC_URL}/example-image.jpeg`)
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

  initEditor = (imageObj) => {
    const canvasCreator = new CanvasCreator(this.editorC.current, [imageObj.naturalWidth, imageObj.naturalHeight])
    const canvases = canvasCreator.createMainCanvases()
    this.canvases = canvases
    this.redrawMainCanvas()
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
      <div id="container" style={{ margin: 'auto', display: 'inline-block' }}>
        <Stack direction='row' sx={{ margin: '2em 0' }}>

          <input type='file' id='fileinput' onChange={this.handleFileInput} accept='image/jpeg, image/png' />
          <Button component="label" for='fileinput' > <FolderOpenIcon></FolderOpenIcon>  Open </Button>
          <a download id='saveLink' ref={this.downloadLink} style={{ visibility: 'hidden' }}> Save </a>
          <Button onClick={() => {
            this.downloadLink.current.href = this.canvases.finalCanvas.toDataURL();
            this.downloadLink.current.click()
          }}><Save /> Download </Button>
        </Stack>
        {this.renderBrushPreview()}
        <BrushSettings updateBrushSettings={this.updateBrushSettings} />
        <div style={{ display: 'flex' }}>
          <CanvasContainer canvasRef={this.editorC} />
          <Card>
            <EffectsPanel
              defaultColor={defaultColor}
              eraseMode={this.state.eraseMode}
              setEraseMode={this.setEraseMode}
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
