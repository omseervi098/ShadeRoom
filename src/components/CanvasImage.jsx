import { useEditor } from "../hooks/editor/editorContext.js";
import { useEffect, useState, useRef, useMemo } from "react";
import { Circle, Rect, Layer, Line, Stage, Image } from "react-konva";
import * as _ from "underscore";
function Anchor(props) {
  const [strokeWidth, setStrokeWidth] = useState(2);

  return (
    <Circle
      x={props.point.x}
      y={props.point.y}
      radius={10}
      stroke="#666"
      fill={props.fill}
      strokeWidth={strokeWidth}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
        setStrokeWidth(3);
        props.onMouseOver();
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
        setStrokeWidth(2);
        props.onMouseOut();
      }}
      onPointerDown={() => {
        document.body.style.cursor = "default";
        props.onClick();
      }}
    />
  );
}
function PolygonOriginAnchor(props) {
  const isValid = props.validateMouseEvents();
  const [fill, setFill] = useState("transparent");

  return (
    <Anchor
      point={props.point}
      fill={fill}
      onClick={() => {
        if (isValid) {
          props.onValidClick();
        }
      }}
      onMouseOver={() => {
        if (isValid) {
          document.body.style.cursor = "pointer";
          setFill("green");
          props.onValidMouseOver();
        } else {
          document.body.style.cursor = "not-allowed";
          setFill("red");
        }
      }}
      onMouseOut={() => {
        setFill("transparent");
      }}
    />
  );
}
function PolygonConstructor(props) {
  const [points, setPoints] = useState([]);
  const [nextPoint, setNextPoint] = useState({ x: 0, y: 0 });
  const [isComplete, setIsComplete] = useState(false);

  const handleClick = ({ x, y }) => {
    setPoints(points.concat({ x, y }));
  };

  const scaleUp = ({ x, y }) => {
    return {
      x: x * props.width,
      y: y * props.height,
    };
  };

  const scaleDown = ({ x, y }) => {
    return {
      x: x / props.width,
      y: y / props.height,
    };
  };
  const handleUndo = () => {
    setPoints((prev) => prev.slice(0, -1));
  };

  const handleReset = () => {
    setPoints([]);
    setIsComplete(false);
  };
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
      if (e.ctrlKey && e.key === "r") {
        e.preventDefault();
        handleReset();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  return (
    <>
      <Line
        strokeWidth={2}
        stroke="#2a2276"
        opacity={0.9}
        fill="#483EA880"
        lineJoin="round"
        closed={isComplete}
        points={points
          .flatMap((point) =>
            Object.values(scaleUp({ x: point.x, y: point.y })),
          )
          .concat(Object.values(scaleUp({ x: nextPoint.x, y: nextPoint.y })))}
      />

      <Rect
        x={0}
        y={0}
        width={props.width}
        height={props.height}
        onPointerDown={(event) => {
          if (!isComplete) {
            event.evt.preventDefault(); // prevent touch scrolling
            const stage = event.target.getStage();
            const pointer = stage.getPointerPosition();
            const transform = stage.getAbsoluteTransform().copy().invert();
            const pos = transform.point(pointer);

            console.log("pointer down", pos);
            const { x, y } = scaleDown({
              x: pos.x,
              y: pos.y,
            });
            handleClick({ x, y });
          }
        }}
        onPointerMove={(event) => {
          if (!isComplete) {
            const stage = event.target.getStage();
            const pointer = stage.getPointerPosition();
            const transform = stage.getAbsoluteTransform().copy().invert();
            const pos = transform.point(pointer);
            console.log("pointer move", pos);
            const { x, y } = scaleDown({
              x: pos.x,
              y: pos.y,
            });
            setNextPoint({ x, y });
          }
        }}
      />

      {points[0] && !isComplete && (
        <PolygonOriginAnchor
          point={scaleUp({ x: points[0].x, y: points[0].y })}
          onValidClick={() => {
            props.onComplete(points);
            setNextPoint(points[0]);
            setIsComplete(true);
          }}
          onValidMouseOver={() => {
            setNextPoint(points[0]);
          }}
          validateMouseEvents={() => {
            return points.length > 1;
          }}
        />
      )}
    </>
  );
}
export default function CanvasImage() {
  const { image, setClicks, maskImage, setMaskImage, scale, mode } =
    useEditor();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const lastClickRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  const handleMouseMove = _.throttle((e) => {
    let el = e.nativeEvent.target;
    const rect = el.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    const imageScale = image ? image.width / el.offsetWidth : 1;
    x *= imageScale;
    y *= imageScale;
    if (
      !lastClickRef.current ||
      Math.abs(lastClickRef.current.x - x) > 10 ||
      Math.abs(lastClickRef.current.y - y) > 10
    ) {
      lastClickRef.current = { x, y };
      setClicks([{ x, y, type: 1 }]);
    }
  }, 5);

  const [shouldFitToWidth, setShouldFitToWidth] = useState(true);
  const bodyEl = document.body;
  const fitToPage = () => {
    if (!image) return;
    const imageAspectRatio = image.width / image.height;
    const screenAspectRatio = window.innerWidth / window.innerHeight;
    setShouldFitToWidth(imageAspectRatio > screenAspectRatio);
  };

  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current && image) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const isMobileScreen = screenWidth < 768;
        const imageAspectRatio = scale.width / scale.height;
        console.log(
          isMobileScreen,
          imageAspectRatio,
          screenWidth,
          containerHeight,
        );
        let width, height;
        if (isMobileScreen) {
          width = containerWidth;
          height = width / imageAspectRatio;
          console.log(width, height);
        } else {
          height = containerHeight;
          width = imageAspectRatio * height;
        }

        setDimensions({ width, height, scale });
      }
    };
    console.log(mode);

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [mode, image, window.innerWidth, window.innerHeight]);

  const imageClasses = "w-full h-full object-center";
  const maskImageClasses = `absolute top-0 left-0 w-full h-full pointer-events-none`;
  const flexCenterClasses = "flex items-center justify-center";
  const maskImageElement = useMemo(() => {
    return maskImage ? (
      <img
        src={maskImage.src}
        alt="Mask"
        width={maskImage.width}
        height={maskImage.height}
        className={`${shouldFitToWidth ? "w-full" : "h-full"} ${maskImageClasses}`}
      />
    ) : null;
  }, [maskImage, shouldFitToWidth]);
  return (
    <div
      className={`relative w-full h-full overflow-hidden ${mode === "polygon" ? "cursor-pen" : "cursor-default"} flex justify-center`}
      ref={containerRef}
    >
      {/*<>*/}
      {/*  <canvas*/}
      {/*    ref={canvasRef}*/}
      {/*    onMouseMove={(e) => {*/}
      {/*      mode === "hover" ? handleMouseMove(e) : null;*/}
      {/*    }}*/}
      {/*    onMouseOut={() => {*/}
      {/*      mode === "hover" ? _.defer(() => setMaskImage(null)) : null;*/}
      {/*    }}*/}
      {/*    className={`${*/}
      {/*      shouldFitToWidth ? "w-full" : "h-full"*/}
      {/*    } ${imageClasses}`}*/}
      {/*  />{" "}*/}
      {/*  {maskImageElement}*/}
      {/*</>*/}
      {/*{mode === "polygon" && (*/}
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
          <PolygonConstructor
            onComplete={(points) => {
              setPoints(points);
            }}
            x={0}
            y={0}
            width={dimensions.width}
            height={dimensions.height}
          />
        </Layer>
      </Stage>
    </div>
  );
}
