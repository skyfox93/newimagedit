import { Brush, Clear, Layers } from "@mui/icons-material"
import { Button, Slider, ToggleButton, ToggleButtonGroup } from "@mui/material"
import { Stack } from "@mui/system"

 const MaskInputs  = (props) => {

        return (
          <div className='tools' id='tools' sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        
            <Stack spacing={3} direction="row" sx={{ mb: 1 }} alignItems="center">
              <span> Strength</span>
              <Slider
                id='brstrength'
                sx={{ width: '100px' }}
                type="range" min={0} max={100} defaultValue={100}
                onChange={(e) => {
                  props.updateEffectStrength(e.target.value / 100)
      
                }}
              />
            {props.effectType === 'color' || props.effectType === 'overlay' ?
              (
                <Stack spacing={2} direction={'row'}>
                 <span>Color</span>
                  <input defaultValue={props.defaultColor} type="color" onChange={(e) => props.updateMaskColor(props.effectType, e.target.value)} />
                </Stack>
              )
              : null
            }
      
            <Stack spacing={1} direction="row" sx={{ mb: 1 }} alignItems="center">
              <Button size='small' id="fill" onClick={props.handleFill}><Layers/> Fill  </Button>
              <Button size='small' id="clear" onClick={props.handleClear}><Clear/> Clear  </Button>
            </Stack>
            </Stack>
            <ToggleButtonGroup
            exclusive
            value={props.eraseMode ? 'erase' : 'brush'}
            onChange={(e, value) => { props.setEraseMode(value === 'erase')}}
        >
            <ToggleButton
              value='brush' >
                <Brush/> Draw
            </ToggleButton>
            <ToggleButton value='erase' > <img src="./newimagedit/eraser.png" /> Erase </ToggleButton>
          </ToggleButtonGroup>
          </div>
        )
}

export default MaskInputs