import { useEditor } from "../hooks/editor/editorContext.js";
import { useEffect, useState, useRef } from "react";
import { Layer, Stage, Image, Rect } from "react-konva";
import PenMode from "./modes/PenMode.jsx";
import LassoMode from "./modes/LassoMode.jsx";
import HoverMode from "./modes/HoverMode.jsx";
import { ZoomIn, ZoomOut } from "lucide-react";

export default function CanvasImage() {
  const { image, scale, mode } = useEditor();
  const containerRef = useRef(null);
  const stageRef = useRef(null);

  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  // Zoom state
  const [zoom, setZoom] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Zoom limits
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
    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [mode, image, window.innerWidth, window.innerHeight]);

  // Reset zoom and position when image changes
  useEffect(() => {
    setZoom(1);
    setStagePos({ x: 0, y: 0 });
  }, [image]);

  // Zoom functions
  const zoomIn = () => {
    const newZoom = Math.min(zoom + ZOOM_STEP, MAX_ZOOM);
    setZoom(newZoom);
    centerStage(newZoom);
  };

  const zoomOut = () => {
    const newZoom = Math.max(zoom - ZOOM_STEP, MIN_ZOOM);
    if (newZoom <= MIN_ZOOM) {
      resetZoom();
      return
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
      y: centerY - (centerY * newZoom)
    };
    
    setStagePos(newPos);
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;

    let newZoom = e.evt.deltaY < 0 ? zoom * scaleBy : zoom / scaleBy;
    newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
    console.log("Zoom level:", newZoom);
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

  // Handle stage dragging
  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
    setStagePos({
      x: e.target.x(),
      y: e.target.y()
    });
  };

  // Constrain drag bounds
  const handleDragMove = (e) => {
    const stage = e.target;
    const scale = stage.scaleX();
    
    // Calculate boundaries
    const containerWidth = dimensions.width;
    const containerHeight = dimensions.height;
    const scaledWidth = containerWidth * scale;
    const scaledHeight = containerHeight * scale;
    
    // Constrain horizontal movement
    let newX = stage.x();
    if (scaledWidth > containerWidth) {
      const maxX = 0;
      const minX = containerWidth - scaledWidth;
      newX = Math.max(minX, Math.min(maxX, newX));
    } else {
      newX = (containerWidth - scaledWidth) / 2;
    }
    
    // Constrain vertical movement
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

  return (
    <div
      className={`relative w-full h-full ${mode === "polygon" ? "cursor-pen" : "cursor-default"} flex justify-center`}
      ref={containerRef}
    >
      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2 bg-white bg-opacity-90 rounded-lg p-2 shadow-lg">
        <button
          onClick={zoomIn}
          disabled={zoom >= MAX_ZOOM}
          className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={zoomOut}
          disabled={zoom <= MIN_ZOOM}
          className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetZoom}
          className="w-8 h-8 flex items-center justify-center bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-xs"
          title="Reset Zoom"
        >
          1:1
        </button>
        <div className="text-xs text-center text-gray-600 font-mono">
          {Math.round(zoom * 100)}%
        </div>
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
        // style={{
        //   cursor: zoom > 1 && !isDragging ? 'grab' : 
        //           zoom > 1 && isDragging ? 'grabbing' : 'default'
        // }}
      >
        <Layer>
          <Image
            image={image}
            x={0}
            y={0}
            width={dimensions.width}
            height={dimensions.height}
            objectFit={"contain"}
          />
          {mode === "lasso" && (
            <LassoMode width={dimensions.width} height={dimensions.height} />
          )}
          {mode === "hover" && (
            <HoverMode width={dimensions.width} height={dimensions.height} />
          )}
          {mode === "polygon" && (
            <PenMode width={dimensions.width} height={dimensions.height} />
          )}
        </Layer>
      </Stage>
    </div>
  );
}