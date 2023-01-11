export const  hexToRGB= (hex, opacity) => {
    hex = hex.replace('#', '');
  let  r = parseInt(hex.substring(0, 2), 16);
  let  g = parseInt(hex.substring(2, 4), 16);
  let  b = parseInt(hex.substring(4, 6), 16);

    let result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';
    return result;
  }


export function distanceBetween(point1, point2) {
  return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
}

export function angleBetween(point1, point2) {
  return Math.atan2(point2.x - point1.x, point2.y - point1.y);
}

export function loadImageFromFile(file){
  const imageObj = new Image();
  imageObj.crossOrigin = "Anonymous";
  imageObj.src = window.URL.createObjectURL(file);
  return imageObj
}

export function loadImageFromUrl(url){
  const imageObj = new Image();
  imageObj.crossOrigin = "Anonymous";
  imageObj.src = url;
  return imageObj
}