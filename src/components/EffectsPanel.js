import { Accordion, AccordionDetails, AccordionSummary, Card } from "@mui/material";
import MaskInputs from "./MaskInputs";

const EffectDisplayer = (props) => (

    <Accordion sx={{ '&.Mui-expanded': { minHeight: "0", margin: '0' } }} expanded={(props.activeMask && props.activeMask.effectType) === props.effectType} onChange={(e, expanded) => { if (expanded) { props.handleSwitchMask(props.effectType) } }}>
        <AccordionSummary size={'small'} sx={{ '&.Mui-expanded': { minHeight: "0", margin: '3px', fontWeight: 'bold' }, '& .MuiAccordionSummary-content': { margin: "0.5em" } }}>
            {props.label}
        </AccordionSummary>
        <AccordionDetails sx={{ '&.Mui-expanded': { minHeight: "0", margin: '0' }, '&button.Mui-expanded': { margin: 0 }, textAlign: 'left' }}>
            <MaskInputs
                setEraseMode ={props.setEraseMode}
                eraseMode = {props.eraseMode}
                effectType={props.effectType}
                updateEffectStrength={props.updateEffectStrength}
                updateMaskColor={props.updateMaskColor}
                handleFill={props.handleFill}
                handleClear={props.handleClear}
                activeMask={props.activeMask}
                defaultColor={props.defaultColor}
            />
        </AccordionDetails>
    </Accordion>
)


const EffectsPanel = (props) => {
    const effectProps = {
        defaultColor: props.defaultColor,
        activeMask: props.activeMask,
        handleSwitchMask: props.handleSwitchMask,
        handleFill: props.handleFill,
        handleClear: props.handleClear,
        setEraseMode: props.setEraseMode,
        eraseMode: props.eraseMode,
        updateEffectStrength: props.updateEffectStrength,
        updateMaskColor: props.updateMaskColor
    }


    return (
        <Card className='tools-div' sx={{ width: '500px', margin: '5px', backgroundColor: 'lightgray', alignSelf: 'flex-start' }} elevation={4}>
            <h4 className="effectTitle">
                Effects
            </h4>
            <EffectDisplayer
                label={'Details'}
                effectType={'structure'}
                {...effectProps}
            />
            <EffectDisplayer
                label={'Lighting Color'}
                effectType={'overlay'}
                {...effectProps}
            />
            <EffectDisplayer
                label={'Replace Color'}
                effectType={'color'}
                {...effectProps}
            />
        </Card>
    )
}

export default EffectsPanel