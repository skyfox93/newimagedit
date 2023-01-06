import React, { Component } from 'react';
import CanvasCreator from './CanvasEditor/CanvasCreator';
import EffectMask from './CanvasEditor/EffectMask';
import { attachCanvasEvents } from './CanvasEditor/MouseHandling';
import UnsharpMask from './CanvasEditor/UnsharpMask';
import { loadImageFromFile, loadImageFromUrl } from './CanvasEditor/utils';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { throttle } from 'lodash';
import BrushIcon from '@mui/icons-material/Brush';
import { Button, Card, Icon, IconButton, Slider } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { Clear, Layers, LightMode, Opacity, Square } from '@mui/icons-material';

const CanvasContainer = React.memo((props) => {
  return (<div id='imageContainer' ref={props.canvasRef} ></div>)
}, (prev, next) => (prev.currentFileId === next.previousFile))

const defaultColor = '#907A7A'
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
    this.setState({brushSettings: {...this.state.brushSettings, [setting]: value}})
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

  handleFill =() => {
    this.state.activeMask.fillMask(false)
    this.applyAllMasks()
  }

  handleClear =() => {
    this.state.activeMask.fillMask(true)
    this.applyAllMasks()
  }



  render() {
    const brushPreviewSize = this.canvases && this.canvases.finalCanvas && this.state.brushSettings.size ? this.state.brushSettings.size * (this.canvases.finalCanvas.clientWidth / this.canvases.finalCanvas.width) : '10'
    const showLighting = this.state.activeMask && ( this.state.activeMask.effectType === 'overlay')
    const showColor = this.state.activeMask && this.state.activeMask.effectType === 'color'
    return (
      <div id="container">
         <div className='tools-div'>
              <Stack direction="row" spacing={2} size='small' sx={{margin: '1em'}}>
          
                <ToggleButtonGroup
                  exclusive
                  orientation='vertical'
                  size={'small'}
                  color ='primary'
                  sx={{button: {"&.Mui-selected": {borderBottom: '5px solid'}}}}

                  value={this.state.activeMask && this.state.activeMask.effectType}
                  aria-label="Exposure"
                  onChange={(e, value) => this.handleSwitchMasks(value)}
                >
                  <ToggleButton
                  size={'small'}

 value="structure" aria-label="left aligned">
                    Details
                  </ToggleButton>
                  <ToggleButton value="overlay" aria-label="centered">
                    <div> Lighting </div>
                  </ToggleButton>
                  <ToggleButton value="color" aria-label="right aligned">
                    <div>Replace Color </div>
                  </ToggleButton>
                </ToggleButtonGroup>
                <Card className='tools' id='tools' sx={{display:"flex", alignItems: 'center'}}>
              <div style={{display:'inline-block', padding: '0 1em'}}>
                <div style={{display: (showColor ? 'inline' : 'none')}}>Replace Color: <input defaultValue={defaultColor} type="color" onChange={(e) => this.updateMaskColor("color", e.target.value)} /> </div>
                <div style={{display: (showLighting ? 'inline' : 'none')}}>Overlay Color: <input  defaultValue={defaultColor}  type="color" onChange={(e) => this.updateMaskColor("overlay", e.target.value)} /> </div>

                <Stack spacing={1} direction="row" sx={{ mb: 1 }} alignItems="center">
                <BrushIcon /> Size 
                    <Slider
                      id='brsize'
                      type="range"
                      min={20} max={300}
                      defaultValue={100}
                      onChange={(e) => this.updateBrushSettings('size', e.target.value)}
                      sx={{width: '100px'}}
                      />
                </Stack>
                <Stack spacing={1} direction="row" sx={{ mb: 1 }} alignItems="center"><BrushIcon /> Opacity
                  <Slider
                    sx={{width: '100px'}}
                    id='brstrength'
                    type="range" min={0} max={100} defaultValue={100}
                    onChange={(e) => {
                      this.updateBrushSettings('opacity', e.target.value / 100)
                    }}
                  />
                </Stack>
                <Stack spacing={1} direction="row" sx={{ mb: 1 }} alignItems="center">
                    <LightMode/> Effect

                    <Slider
                      id='brstrength'
                      sx={{width: '100px'}}
                      vallue ={ this.state.activeMask && this.state.activeMask.effectStrength}
                      type="range" min={0} max={100} defaultValue={100}
                      onChange={(e) => {
                        this.updateEffectStrength( e.target.value / 100)
                        
                      }}
                    />
                </Stack>
              </div>
           
              </Card>
              </Stack>
              </div>
              <Stack direction="row" spacing={4} sx={{alignItems: 'center'}}>
              <input type='file' id='fileinput' onChange={this.handleFileInput} />
              <ToggleButtonGroup
                exclusive
                value = {this.state.eraseMode ? 'erase' : 'brush'}
                onChange={(e,value)=> {this.setState({eraseMode: value === 'erase'})}}
              >
                <ToggleButton   
 value='brush' ><BrushIcon /> 
                
                </ToggleButton>
                <ToggleButton value='erase' > <img src="./eraser.png"/> </ToggleButton>
              </ToggleButtonGroup>
                <Button  size='small'id="fill" onClick ={this.handleFill}><Layers></Layers> Fill  </Button>
                <Button  size='small' id="clear" onClick ={this.handleClear}><Clear></Clear> Clear  </Button>
                <Button component="label" for='fileinput' > <FolderOpenIcon></FolderOpenIcon> Open </Button>

            </Stack>
            
          <svg ref={this.brushPreview} id='svg' height={brushPreviewSize + 1} width={brushPreviewSize + 1 } style={{position:'fixed', zIndex: 30, pointerEvents: 'none'}}>
            <circle  cx={1 + brushPreviewSize/2} cy={1 +brushPreviewSize/2} r={brushPreviewSize/2} stroke="black" stroke-width="1" fill='none' />
            
          </svg>
          <CanvasContainer canvasRef={this.editorC} />
        </div>
    );
  }
}

export default Editor;
