import { getImageElementFromBlob } from "./imageHelpers";

const isPointInMask = ({x, y, mask}) => {
    const {width, height, bounds, imageData} = mask;
    // Ensure x, y are in image width and height of image
    if (x < 0 || y < 0 || x >= width || y >= height) return false;
    
    // Check if the point is within the bounds of the hit region
    if (x < bounds.minX || x > bounds.maxX || y < bounds.minY || y > bounds.maxY) {
      return false;
    }

    // Calculate the pixel index in the imageData array
    const pixelIndex = (Math.floor(y) * width + Math.floor(x)) * 4 + 3;
    return imageData.data[pixelIndex] > 0;
  };

export function getBounds(imageData){
    const { data, width, height } = imageData;
    let minX = width, minY = height, maxX = 0, maxY = 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 0) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }
    
    return { minX, minY, maxX, maxY };
  };

export function getMaskIndexOnHover({
    maskState,
    coords
}){
    return new Promise((resolve, reject) => {
        const {x, y} = coords;
        if(!maskState || !maskState.length) {
            reject("Invalid mask state or no masks available");
            return;
        }
        for (let i = maskState.length - 1; i >= 0; i--) {
            if (isPointInMask({x, y, mask:maskState[i].mask})) {
                resolve(maskState[i].id);
                break;
            }
        }
        reject("No mask found at the given coordinates.");
    });
    
}
export function polygonToMask(points, width, height, maskColor = [0,0,255,100]) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Clear canvas to transparent
  ctx.clearRect(0, 0, width, height);

  // Draw filled polygon
  ctx.fillStyle = `rgba(${maskColor[0]}, ${maskColor[1]}, ${maskColor[2]}, ${maskColor[3] / 255})`;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.fill();

  const imageData = ctx.getImageData(0, 0, width, height);
  

  //get Image element from canvas.toDataURL

  const image = new Image();
  image.src = canvas.toDataURL();
  return {
    image,
    imageData,
  };
}
