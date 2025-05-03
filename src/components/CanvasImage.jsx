import { useEditor } from "../hooks/editor/editorContext.js";
import { useEffect, useState, useRef } from "react";
import { Layer, Stage, Image, Rect } from "react-konva";
import PenMode from "./modes/PenMode.jsx";
import LassoMode from "./modes/LassoMode.jsx";
import HoverMode from "./modes/HoverMode.jsx";

export default function CanvasImage() {
  const { image, scale, mode } = useEditor();
  const containerRef = useRef(null);

  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

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
        console.log(
          isMobileScreen,
          containerHeight,
          containerWidth,
          height,
          width,
        );
        setDimensions({ width, height });
      }
    };
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [mode, image, window.innerWidth, window.innerHeight]);

  // useEffect(() => {
  //   if (maskImage && maskImage.src) console.log(maskImage.src);
  // }, [maskImage]);

  return (
    <div
      className={`relative w-full h-full ${mode === "polygon" ? "cursor-pen" : "cursor-default"} flex justify-center`}
      ref={containerRef}
    >
      <Stage width={dimensions.width} height={dimensions.height}>
        <Layer>
          <Image
            image={image}
            x={0}
            y={0}
            width={dimensions.width}
            height={dimensions.height}
            objectFit={"contain"}
          />
          <Rect
            x={0}
            y={0}
            width={dimensions.width}
            height={dimensions.height}
            stroke={"#483ea8"}
            strokeWidth={3}
            dash={[10, 3]}
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
