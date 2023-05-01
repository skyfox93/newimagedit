import { Brush, RedoOutlined, UndoOutlined } from "@mui/icons-material"
import { Button, Slider, ToggleButton, ToggleButtonGroup } from "@mui/material"
import { Stack } from "@mui/system"



const BrushSettings = (props) => {
  return (
    <Stack direction='column'>
      <Stack direction="row" spacing={4} sx={{ alignItems: 'center' }}>
        <Stack spacing={1} direction="row" sx={{ mb: 1 }} alignItems="center">
          <Brush /> Size
          <Slider
            id='brsize'
            type="range"
            min={20} max={300}
            defaultValue={100}
            onChange={(e) => props.updateBrushSettings('size', e.target.value)}
            sx={{ width: '100px' }}
          />
        </Stack>
        <Stack spacing={1} direction="row" sx={{ mb: 1 }} alignItems="center"><Brush /> Opacity
          <Slider
            sx={{ width: '100px' }}
            id='brstrength'
            type="range" min={0} max={100} defaultValue={100}
            onChange={(e) => {
              props.updateBrushSettings('opacity', e.target.value / 100)
            }}
          />
        </Stack>
      </Stack>
      <Stack direction='row'>
        <ToggleButtonGroup
          exclusive
          value={props.eraseMode ? 'erase' : 'brush'}
          color='primary'
          onChange={(e, value) => { props.setEraseMode(value === 'erase') }}
        >
          <ToggleButton
            value='brush' >
            <Brush />
          </ToggleButton>
          <ToggleButton value='erase' > <img src="./eraser.png" />  </ToggleButton>
        </ToggleButtonGroup>
        <Button color='primary' onClick={props.undo}> <UndoOutlined /> Undo Brush </Button>
        <Button color='primary' onClick={props.redo}> <RedoOutlined /> Redo Brush </Button>
      </Stack>
    </Stack>

  )
}

export default BrushSettings