import { useEditor } from "../hooks/editor/editorContext.js";
import { useEffect, useState, useRef, use } from "react";
import { Layer, Stage, Image, Group, Shape, Rect } from "react-konva";
import PenMode from "./modes/PenMode.jsx";
import LassoMode from "./modes/LassoMode.jsx";
import HoverMode from "./modes/HoverMode.jsx";
import { ZoomIn, ZoomOut, Check, RotateCcw, X, DeleteIcon, Delete, Trash2 } from "lucide-react";
import { getBoundaryFromImageData, getMaskIndexOnHover, getSolidMaskRows } from "../utils/modesHelper.js";

export default function CanvasImage() {
  const { image, scale, mode, setMode, maskState, removeMask } = useEditor();
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const actionRef = useRef({
    confirm: null,
    undo: null,
    reset: null,
  })

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showActionControls, setShowActionControls] = useState(false);
  const [hoveredMaskId, setHoveredMaskId] = useState(null);
  const [selectedMaskId, setSelectedMaskId] = useState(null);
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


  const register = (handlers) => {
    actionRef.current = handlers;
  };

  const handleConfirm = () => {
    if (actionRef.current.confirm) {
      actionRef.current.confirm();
    } else {
      console.warn("Confirm action not registered.");
    }
  };
  const handleUndo = () => {
    if (actionRef.current.undo) {
      actionRef.current.undo();
    } else {
      console.warn("Undo action not registered.");
    }
  };
  const handleReset = () => {
    if (actionRef.current.reset) {
      actionRef.current.reset();
    } else {
      console.warn("Reset action not registered.");
    }
  };
  return (
    <div className={`relative w-full h-full ${mode === "polygon" ? "cursor-pen" : "cursor-default"} flex justify-center`} ref={containerRef}>
      {/* Action Controls */}
      <div className="absolute bottom-0 right-4 z-10 flex flex-col gap-2 bg-white bg-opacity-90 rounded-lg p-2 shadow-lg">
        {selectedMaskId && (
          <>
          <button onClick={() =>{
            removeMask(selectedMaskId);
            setSelectedMaskId(null);
            setMode(mode.replace("pan-", ""));
          }} className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded hover:bg-red-600 transition-colors" title="Delete Mask">
            <Trash2 className="w-4 h-4" />
            </button>
          
          <button onClick={() =>{
            setSelectedMaskId(null);
            setMode(mode.replace("pan-", ""));
          }} className="w-8 h-8 flex items-center justify-center bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors" title="Delete Mask"><X className="w-4 h-4" /></button>
          </>
        )}
        <button onClick={zoomIn} disabled={zoom >= MAX_ZOOM} className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
        <button onClick={zoomOut} disabled={zoom <= MIN_ZOOM} className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
        <button onClick={resetZoom} className="w-8 h-8 flex items-center justify-center bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-xs" title="Reset Zoom">1:1</button>
        <div className="text-xs text-center text-gray-600 font-mono">{Math.round(zoom * 100)}%</div>
        
        {showActionControls && (
          <>
          {actionRef.current.confirm && (
            <button onClick={handleConfirm} className="w-8 h-8 flex items-center justify-center bg-green-500 text-white rounded hover:bg-green-600 transition-colors" title="Confirm Mask"><Check className="w-4 h-4" /></button>
            )}
            {actionRef.current.undo && (
              <button onClick={handleUndo} className="w-8 h-8 flex items-center justify-center bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors" title="Undo Last Click"><RotateCcw className="w-4 h-4" /></button>
            )}
            {actionRef.current.reset && (
              <button onClick={handleReset} className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded hover:bg-red-600 transition-colors" title="Reset Clicks"><X className="w-4 h-4" /></button>
            )}
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
          {mode === "lasso" && (
            <LassoMode
            setShowActionControls={setShowActionControls}
            setSelectedMaskId={setSelectedMaskId}
             register={register} width={dimensions.width} height={dimensions.height} />
          )}
          {mode === "hover" && (
            <HoverMode
              register={register}
              width={dimensions.width}
              height={dimensions.height}
              setSelectedMaskId={setSelectedMaskId}
              setShowActionControls={setShowActionControls}
              isOverConfirmedMask={hoveredMaskId !== null}
            />
          )}
          {mode === "polygon" && (
            <PenMode 
            setSelectedMaskId={setSelectedMaskId}
            setShowActionControls={setShowActionControls}
            register={register} width={dimensions.width} height={dimensions.height} />
          )}
        </Layer>

        {/* Confirmed masks layer - rendered on top with proper clipping */}
        <Layer>
          {maskState && maskState.map(({mask, id}, index) => (
            <Group 
              key={`mask-group-${index}`}
              onClick={() => {
                if(!showActionControls){
                  setSelectedMaskId(id)
                }
              }}
              clipFunc={(ctx) => {
                const {width, imageData} = mask;
                const scaleRatio = dimensions.width/width;
                ctx.beginPath();
                const rowRects = getSolidMaskRows(imageData)
                if (!rowRects || rowRects.length === 0) {
                  ctx.rect(0, 0, dimensions.width, dimensions.height);
                }else {
                  rowRects.forEach(({ x, y, width, height }) => {
                    ctx.rect(x * scaleRatio, y * scaleRatio, width * scaleRatio, height * scaleRatio);
                  });
                }
                ctx.clip();
              }}
            >
              <Shape
                sceneFunc={(context, shape) => {
                  const {imageData} = mask;
                  const scaleRatio = dimensions.width / scale.width;
                  const rects = getSolidMaskRows(imageData);
                  const boundaryCoords = getBoundaryFromImageData(imageData);
                  const rgba = mask.maskColor || [255, 0, 0, 150];
                  const alpha = selectedMaskId === id ? 0.3: hoveredMaskId === id ? 0.1 : 0;
                  const strokeAlpha = selectedMaskId === id ? 1 : hoveredMaskId === id ? 0.5 : 0;
                  // 1. Fill the mask area
                  context.beginPath();
                  rects.forEach(({ x, y, width, height }) => {
                    context.rect(
                      x * scaleRatio,
                      y * scaleRatio,
                      width * scaleRatio,
                      height * scaleRatio
                    );
                  });
                  context.fillStyle = `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${alpha})`;
                  context.fill();
                  context.fillShape(shape);
                  // context.closePath();
                  // 2. Draw stroke around the mask
                  context.beginPath();
                  boundaryCoords.forEach(({ x, y }) => {
                    context.rect(x * scaleRatio, y * scaleRatio, 1, 1);
                  });
                  context.strokeStyle = `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${strokeAlpha})`;
                  context.lineWidth = 1.5;
                  context.stroke();
                  context.fillStrokeShape(shape);
                }}
                opacity={1}
              />
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  );
}