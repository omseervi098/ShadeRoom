import { useEditor } from "../hooks/editor/editorContext.js";
import { useEffect, useState, useRef, use } from "react";
import { Layer, Stage, Image, Group, Shape } from "react-konva";
import PenMode from "./modes/PenMode.jsx";
import LassoMode from "./modes/LassoMode.jsx";
import HoverMode from "./modes/HoverMode.jsx";
import { ZoomIn, ZoomOut, Check, RotateCcw, X } from "lucide-react";
import { getMaskIndexOnHover } from "../utils/modesHelper.js";

export default function CanvasImage() {
  const { image, scale, mode, setMode, maskState } = useEditor();
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const confirmedMasksLayerRef = useRef(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showHoverControls, setShowHoverControls] = useState(false);
  const [hoveredMaskId, setHoveredMaskId] = useState(null);

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 3;
  const ZOOM_STEP = 0.25;

  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current && image) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        const isMobileScreen = window.innerWidth < 768;
        const imageAspectRatio = scale.width / scale.height;
        let width, height;
        
        if (isMobileScreen) {
          width = containerWidth;
          height = width / imageAspectRatio;
        } else {
          height = containerHeight;
          width = imageAspectRatio * height;
          if (width >= containerWidth) {
            width = containerWidth;
            height = width / imageAspectRatio;
          }
        }
        
        setDimensions({ width, height });
      }
    };
    
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [mode, image]);

  useEffect(() => {
    setZoom(1);
    setStagePos({ x: 0, y: 0 });
  }, [image]);

  const zoomIn = () => {
    const newZoom = Math.min(zoom + ZOOM_STEP, MAX_ZOOM);
    setZoom(newZoom);
    centerStage(newZoom);
  };

  const zoomOut = () => {
    const newZoom = Math.max(zoom - ZOOM_STEP, MIN_ZOOM);
    if (newZoom <= MIN_ZOOM) {
      resetZoom();
      return;
    }
    setZoom(newZoom);
    centerStage(newZoom);
  };

  const resetZoom = () => {
    setZoom(1);
    setStagePos({ x: 0, y: 0 });
  };

  const centerStage = (newZoom) => {
    if (!stageRef.current) return;
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const newPos = {
      x: centerX - (centerX * newZoom),
      y: centerY - (centerY * newZoom),
    };
    setStagePos(newPos);
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    let newZoom = e.evt.deltaY < 0 ? zoom * scaleBy : zoom / scaleBy;
    newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
    if (newZoom <= MIN_ZOOM) {
      resetZoom();
      return;
    }
    const pointer = stageRef.current.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stagePos.x) / zoom,
      y: (pointer.y - stagePos.y) / zoom,
    };
    const newPos = {
      x: pointer.x - mousePointTo.x * newZoom,
      y: pointer.y - mousePointTo.y * newZoom,
    };
    setZoom(newZoom);
    setStagePos(newPos);
  };

  const handleDragStart = () => {
    setIsDragging(true);
    if (mode === "lasso" || mode === "hover") {
      setMode(`pan-${mode}`);
    }
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
    setStagePos({ x: e.target.x(), y: e.target.y() });
    if (mode === "pan-lasso" || mode === "pan-hover") {
      setTimeout(() => setMode(mode.replace("pan-", "")), 100);
    }
  };

  const handleDragMove = (e) => {
    const stage = e.target;
    const scale = stage.scaleX();
    const containerWidth = dimensions.width;
    const containerHeight = dimensions.height;
    const scaledWidth = containerWidth * scale;
    const scaledHeight = containerHeight * scale;
    let newX = stage.x();
    if (scaledWidth > containerWidth) {
      const maxX = 0;
      const minX = containerWidth - scaledWidth;
      newX = Math.max(minX, Math.min(maxX, newX));
    } else {
      newX = (containerWidth - scaledWidth) / 2;
    }
    let newY = stage.y();
    if (scaledHeight > containerHeight) {
      const maxY = 0;
      const minY = containerHeight - scaledHeight;
      newY = Math.max(minY, Math.min(maxY, newY));
    } else {
      newY = (containerHeight - scaledHeight) / 2;
    }
    stage.position({ x: newX, y: newY });
  };

  const handleMouseMove = (e) => {
    //Only call if maskState is availabe and not empty
    if (!maskState || maskState.length === 0) return;

    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    const transform = stage.getAbsoluteTransform().copy().invert();
    const pos = transform.point(pointer);

    // Scale the position to match the original image dimensions
    const scaleRatio = scale.width / dimensions.width;
    pos.x *= scaleRatio;
    pos.y *= scaleRatio;

    getMaskIndexOnHover({
      maskState: maskState,
      coords: pos,
    }).then((foundMaskId) => {
      if (foundMaskId !== null) {
        setHoveredMaskId(foundMaskId);
      } else {
        setHoveredMaskId(null);
      }
    }).catch((error) => {
      // console.error("Error getting mask index on hover:", error);
      setHoveredMaskId(null);
    });
  };


  return (
    <div className={`relative w-full h-full ${mode === "polygon" ? "cursor-pen" : "cursor-default"} flex justify-center`} ref={containerRef}>
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2 bg-white bg-opacity-90 rounded-lg p-2 shadow-lg">
        <button onClick={zoomIn} disabled={zoom >= MAX_ZOOM} className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
        <button onClick={zoomOut} disabled={zoom <= MIN_ZOOM} className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
        <button onClick={resetZoom} className="w-8 h-8 flex items-center justify-center bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-xs" title="Reset Zoom">1:1</button>
        <div className="text-xs text-center text-gray-600 font-mono">{Math.round(zoom * 100)}%</div>
        {mode === "hover" && showHoverControls && (
          <>
            <button onClick={() => document.dispatchEvent(new Event("confirmHover"))} className="w-8 h-8 flex items-center justify-center bg-green-500 text-white rounded hover:bg-green-600 transition-colors" title="Confirm Mask"><Check className="w-4 h-4" /></button>
            <button onClick={() => document.dispatchEvent(new Event("undoHover"))} className="w-8 h-8 flex items-center justify-center bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors" title="Undo Last Click"><RotateCcw className="w-4 h-4" /></button>
            <button onClick={() => document.dispatchEvent(new Event("resetHover"))} className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded hover:bg-red-600 transition-colors" title="Reset Clicks"><X className="w-4 h-4" /></button>
          </>
        )}
      </div>
      
      <Stage 
        ref={stageRef} 
        width={dimensions.width} 
        height={dimensions.height} 
        scaleX={zoom} 
        scaleY={zoom} 
        x={stagePos.x} 
        y={stagePos.y} 
        onWheel={handleWheel} 
        draggable={zoom > 1} 
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd} 
        onDragMove={handleDragMove} 
        onPointerMove={handleMouseMove}
      >
        {/* Base image layer */}
        <Layer>
          <Image 
            image={image} 
            x={0} 
            y={0} 
            width={dimensions.width} 
            height={dimensions.height} 
            objectFit={"contain"} 
          />
        </Layer>

        {/* Interactive modes layer - rendered below confirmed masks */}
        <Layer>
          {mode === "lasso" && hoveredMaskId === null && (
            <LassoMode width={dimensions.width} height={dimensions.height} />
          )}
          {mode === "hover" && (
            <HoverMode
              width={dimensions.width}
              height={dimensions.height}
              setShowHoverControls={setShowHoverControls}
              isOverConfirmedMask={hoveredMaskId !== null}
            />
          )}
          {mode === "polygon" && hoveredMaskId === null && (
            <PenMode width={dimensions.width} height={dimensions.height} />
          )}
        </Layer>

        {/* Confirmed masks layer - rendered on top with proper clipping */}
        <Layer>
          {maskState && maskState.map(({mask, id}, index) => (
            <Group 
              key={`mask-group-${index}`}
              clipFunc={(ctx) => {
                const {width, height, imageData} = mask;
                const scaleRatio = dimensions.width/width;
                // Create clipping path from non-transparent pixels
                ctx.beginPath();
                let hasPath = false;
                
                // Use a more efficient approach: create path from mask boundaries
                for (let y = 0; y < height; y += 1) {
                  let rowStart = -1;
                  let newy = y*scaleRatio;
                  for (let x = 0; x < width; x += 1) {
                    const alpha = imageData.data[(y * width + x) * 4 + 3];

                    let newx = x*scaleRatio; 
                    
                    if (alpha > 0 && rowStart === -1) {
                      // Start of opaque region
                      rowStart = newx;
                    } else if (alpha === 0 && rowStart !== -1) {
                      // End of opaque region
                      ctx.rect(rowStart, newy, newx - rowStart, 1);
                      hasPath = true;
                      rowStart = -1;
                    }
                  }
                  // Handle row ending with opaque pixels
                  if (rowStart !== -1) {
                    ctx.rect(rowStart, newy, width - rowStart, 1);
                    hasPath = true;
                  }
                }
              
                if (!hasPath) {
                  // Fallback: clip to entire canvas if no alpha detected
                  ctx.rect(0, 0, dimensions.width, dimensions.height);
                }
              }}
            >
              {/* Render the actual colored/textured mask content */}
              <Image
                image={mask.image}
                x={0}
                y={0}
                width={dimensions.width}
                height={dimensions.height}
                objectFit={"contain"}
                opacity={hoveredMaskId === id ? 1 : 0.5}
              />
              
              {/* Add highlight border when hovered*/}
              {hoveredMaskId === id && (
                <Shape
                  sceneFunc={(context, shape) => {
                    // Create border around the clipped area
                    const {width, height, imageData} = mask;
                    const scaleRatio = dimensions.width / scale.width;
                    
                    context.beginPath();
                    const rgba = mask.maskColor || [255, 0, 0, 150];
                    context.strokeStyle = `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${1})`;
                    context.lineWidth = 2;
                    
                    // Draw border by finding edges
                    for (let y = 1; y < height - 1; y++) {
                      let newy = y * scaleRatio;
                      for (let x = 1; x < width - 1; x++) {
                        const currentAlpha = imageData.data[(y * width + x) * 4 + 3];

                        let newx = x * scaleRatio;
                        
                        if (currentAlpha > 0) {
                          // Check if this pixel is on the edge
                          const neighbors = [
                            imageData.data[((y-1) * width + x) * 4 + 3], // top
                            imageData.data[((y+1) * width + x) * 4 + 3], // bottom
                            imageData.data[(y * width + (x-1)) * 4 + 3], // left
                            imageData.data[(y * width + (x+1)) * 4 + 3]  // right
                          ];
                          
                          // If any neighbor is transparent, this is an edge pixel
                          if (neighbors.some(alpha => alpha === 0)) {
                            context.rect(newx, newy, 1, 1);
                          }
                        }
                      }
                    }
                  
                    context.stroke();
                    context.fillStrokeShape(shape);
                  }}
                  opacity={0.8}
                />
              )} 
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  );
}