
export function handleFill() {
    this.state.activeMask.fillMask(false)
    this.applyAllMasks()
}

export function handleClear() {
    this.state.activeMask.fillMask(true)
    this.applyAllMasks()
}


export function handleSwitchMask(maskName) {
    const newMask = this.masks.find((mask) => mask.effectType === maskName)
    if (newMask) {
        this.setState({ activeMask: newMask })
    }
}

export function updateMaskColor(maskName, maskColor) {
    const mask = this.masks.find((mask) => mask.effectType === maskName)
    mask.drawColor = maskColor
}

export function updateEffectStrength(strength) {
    if (this.state.activeMask) {
        const mask = this.state.activeMask
        mask.effectStrength = strength
        this.applyAllMasks()
    }
}