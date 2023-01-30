import { Brush } from "@mui/icons-material"
import { Slider, ToggleButton, ToggleButtonGroup } from "@mui/material"
import { Stack } from "@mui/system"



const BrushSettings = (props) => {
    return (
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
    )
}

export default BrushSettings