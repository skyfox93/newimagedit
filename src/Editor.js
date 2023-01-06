import React, { Component } from 'react';
import CanvasCreator from './CanvasEditor/CanvasCreator';
import EffectMask from './CanvasEditor/EffectMask';
import { attachCanvasEvents } from './CanvasEditor/MouseHandling';
import UnsharpMask from './CanvasEditor/UnsharpMask';
import { loadImageFromFile } from './CanvasEditor/utils';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

const CanvasContainer = React.memo((props) => {
  return ( <div id='imageContainer' ref={props.canvasRef} ></div>)
}, (prev, next) => (prev.currentFileId === next.previousFile) )


class Editor extends Component {
  constructor(props) {
    super(props);
    this.editorC = React.createRef();
    this.attachCanvasEvents = attachCanvasEvents.bind(this)
    //this.applyAllMasks = throttle(this.applyAllMasks, 500)
    this.masks = []
    this.brushSettings = {
      opacity: '1',
      size: 100
    }
    this.brushState = {
      lastPoint: null, 
      isDrawing: false
    }
    this.state = {
      activeMask: null,
      eraseMode: false
    }
  }

  

  activateEraser = () => {
    this.setState({eraseMode: true})
  }

    
  handleSwitchMasks = (maskName) => {
    const newMask = this.masks.find((mask) => mask.effectType === maskName)
    if (newMask) {
      this.setState({activeMask: newMask})
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
    this.brushSettings[setting] = value
    this.applyCurrentEffect()
  }

  createMasks = (canvasCreator) => {
    let masks = ['brighten','structure','overlay','color',].map(effectType => {
      let effectMask = null
      if ( effectType === 'structure') {
        effectMask = new UnsharpMask(effectType, canvasCreator, this.canvases.finalCanvas, this.canvases.startingCanvas, this.canvases.finalContext, this.canvases.startingContext )
      } else {
        effectMask = new EffectMask(effectType, canvasCreator, this.canvases.finalCanvas, this.canvases.startingCanvas, this.canvases.finalContext, this.canvases.startingContext)
      }
      return effectMask
    })
    this.masks = masks
  }

  redrawMainCanvas = (originalImage,startingContext, finalContext, startingCanvas, finalCanvas) => {
    startingContext.drawImage(originalImage, 0,0, startingCanvas.width, startingCanvas.height);
    finalContext.drawImage(originalImage, 0, 0, finalCanvas.width,finalCanvas.height)

  }

  applyAllMasks = () => {
    if(this.canvasBusy) {return
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
    this.setState({activeMask: structureMask}, () => this.attachCanvasEvents(this.canvases.finalCanvas, this.applyAllMasks))
  }

  handleFileInput = (evt) => {
    console.log(this.editorC.current)
    const file = evt.target.files[0];
    if (file) {
      let image = loadImageFromFile(file)
      this.originalImage = image
      image.onload = () => this.initEditor(image)
    }
  }


  render() {
    return (
      <div id="container">
        <div className='tool-wrapper'>
          <div className='tools-1'>
            <div className='tools-div'>
            <Stack direction="row" spacing={4}>
              
              <ToggleButtonGroup
                exclusive
                value = {this.state.activeMask && this.state.activeMask.effectType}
                aria-label="Exposure"
                onChange={(e, value) => this.handleSwitchMasks(value)}
              >
                <ToggleButton value="structure" aria-label="left aligned">
                  Structure
                </ToggleButton>
                <ToggleButton value="overlay" aria-label="centered">
                  <input type="color" onChange={(e) => this.updateMaskColor('overlay',e.target.value)}/>
                  Color Burn
                </ToggleButton>
                <ToggleButton value="color" aria-label="right aligned">
                  <input type="color" onChange={(e) => this.updateMaskColor("color", e.target.value)}/>
                  Color Replace
                </ToggleButton>
              </ToggleButtonGroup>

              <ToggleButtonGroup
                aria-label="device"
                color='primary'
                exclusive
                value={this.state.eraseMode ? 'erase': "brush"}
                onChange = {(e,value)=> {
                  if (value ==='erase') {
                    this.setState({eraseMode: true})
                  } else {
                    this.setState({eraseMode: false})
                  }
                }}
                >
                <ToggleButton value="brush" aria-label="laptop">
                    Brush
                </ToggleButton>
                <ToggleButton value="erase" aria-label="phone">
                  Erase
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
              <label for='fileinput'> <img className='show' src="openi.jpg" id='open'></img> </label>
              <input type='file' id='fileinput'onChange = {this.handleFileInput}/>
            </div>
            <div className='tools-div'>
              <button id="fill">Fill </button> <button id="clear">Clear</button>
              <span className="slider"> Brush Size
                <input id='brsize' type="range" min={20} max={300} defaultValue={100} onChange={(e)=> this.updateBrushSettings('size', e.target.value)} />
              </span>
            </div>
          </div>
          <div className='tools' id='tools'>
            <span className="slider" > Effect Strength
              <input
                id='brstrength'
                type="range" min={0} max={100} defaultValue={100}
                onChange={(e) => {
                  this.updateEffectStrength( e.target.value/100)
                }}
              />
            </span>
          </div>
          <CanvasContainer canvasRef={this.editorC}/>
        </div>
      </div>
    );
  }
}

export default Editor;
