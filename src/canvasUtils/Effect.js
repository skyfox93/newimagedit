const BasicOverlays = {

    applyColorOverlay: (canvas, context, overlayColor, blendMode, opacity, rectArea) => {
      context.globalCompositeOperation = blendMode;
      context.fillStyle = overlayColor
      context.globalAlpha =opacity ;
      if (!rectArea) {
        context.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        context.fillRect(...rectArea);
      }
      // clean up
      context.globalCompositeOperation = 'source-over';
      context.globalAlpha = 1;
    },

    applyCanvasOverlay: (canvas, context, overlayCanvas, blendMode, opacity, rectArea) => {
      context.globalCompositeOperation = blendMode;
      context.globalAlpha =opacity ;
      if (!rectArea) {
        context.drawImage(overlayCanvas, 0, 0)
      } else {
        context.drawImage(overlayCanvas, rectArea[0], rectArea[1], rectArea[2], rectArea[3], rectArea[0],rectArea[1], rectArea[2], rectArea[3])
      }
      // clean up
      context.globalCompositeOperation = 'source-over';
      context.globalAlpha = 1;
    }
    
  }

  export const blendEffects = {
    // blend effects are built from combining basicOverlays

    resetCanvas: ({startingCanvas, finalContext}) => {
          finalContext.drawImage(startingCanvas, 0,0)
    },

    applyMask: ({finalCanvas, finalContext, startingCanvas, maskCanvas}) => { 
      // "Undo" the portions of the effect that the user cleared with the eraser
      // By using "destination-in", we only keep places where the mask and edited image overlap
      
      BasicOverlays.applyCanvasOverlay(finalCanvas, finalContext, maskCanvas, 'destination-in', 1)
      // By adding clipped image "atop" the original image, the original is restored where the edited version is absent
      BasicOverlays.applyCanvasOverlay(finalCanvas, finalContext, startingCanvas, 'destination-over', 1)
    },

    greyScaleCanvas: ({greyScaleCanvas, greyScaleContext}) => {
      const brightnessColor = "rgb(128,128,128)"
      BasicOverlays.applyColorOverlay(greyScaleCanvas, greyScaleContext, brightnessColor , 'color', 1)
    },
    
    color: ({finalCanvas, finalContext, maskCanvas}, opacity, ) => {
      // apply the color of the blend canvas to the editing canvas
      BasicOverlays.applyCanvasOverlay(finalCanvas, finalContext, maskCanvas, 'color', opacity)
    },

    overlay: ({finalCanvas, finalContext, maskCanvas}, opacity, ) => {
      // apply the color of the blend canvas to the editing canvas
      BasicOverlays.applyCanvasOverlay(finalCanvas, finalContext, maskCanvas, 'overlay', opacity)
    },
  
    brightness: ({finalCanvas, finalContext}, brightness ) => {
      brightness = brightness * 255
      const brightnessColor = `rgb(${brightness}, ${brightness}, ${brightness})`
      BasicOverlays.applyColorOverlay(finalCanvas, finalContext, brightnessColor , 'overlay', 1)
    },
    
    structure: ({startingCanvas,finalCanvas,finalContext, blurCanvas, greyScaleCanvas}, opacity) => {

      function restoreColor(finalContext, startingCanvas){
        finalContext.globalCompositeOperation ='color'
        finalContext.drawImage(startingCanvas, 0,0)
        finalContext.globalCompositeOperation = 'source-over'
      }
      // by overlaying an inverted blured image with the original, this produces something similar to a "unsharp" effect
      BasicOverlays.applyCanvasOverlay(finalCanvas, finalContext, blurCanvas, "overlay",  0.9)
      BasicOverlays.applyCanvasOverlay(finalCanvas, finalContext, greyScaleCanvas, "overlay", 0.65)
      BasicOverlays.applyCanvasOverlay(finalCanvas, finalContext, startingCanvas, 'source-over', 1- opacity)

      restoreColor(finalContext, startingCanvas)

        // this method uses a blured "negative", combines it with a position to produce an unsharp effect
    }, 

    replaceOriginal: ({startingContext, finalCanvas, startingCanvas}, opacity = 1) => {
      // replace the original image with the transformed image
      startingContext.drawImage(finalCanvas, 0,0, startingCanvas.width, startingCanvas.height )
    }

  }