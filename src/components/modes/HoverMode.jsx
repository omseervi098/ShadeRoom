import { useEffect, useRef, useState, useCallback } from "react";
import * as _ from "underscore";
import { Image, Rect, Circle } from "react-konva";
import { useEditor } from "../../hooks/editor/editorContext.js";

export default function HoverMode(props) {
  const { width, height } = props;
  const { scale, maskImage, setClicks, setMaskImage, setMode } = useEditor();
  const firstClicked = useRef(false);
  const lastClickRef = useRef(null);
  const [localClicks, setLocalClicks] = useState([]);
  const handleMouseMove = _.throttle((event) => {
    if (firstClicked.current) return;
    const stage = event.target.getStage();
    const pointer = stage.getPointerPosition();
    const transform = stage.getAbsoluteTransform().copy().invert();
    const pos = transform.point(pointer);
    const scaleRatio = scale.width / width;
    let x = pos.x * scaleRatio;
    let y = pos.y * scaleRatio;

    if (
      !lastClickRef.current ||
      Math.abs(lastClickRef.current.x - x) > 10 ||
      Math.abs(lastClickRef.current.y - y) > 10
    ) {
      lastClickRef.current = { x, y };
      setClicks([{ x, y, type: 1 }]);
    }
  }, 3);

  const handleMouseClick = (event) => {
    if (!firstClicked.current) {
      firstClicked.current = true;
    }
    const stage = event.target.getStage();
    const pointer = stage.getPointerPosition();
    const transform = stage.getAbsoluteTransform().copy().invert();
    const pos = transform.point(pointer);
    const scaleRatio = scale.width / width;
    let x = pos.x * scaleRatio;
    let y = pos.y * scaleRatio;
    const clickedButton = event.evt.button;
    const type = clickedButton === 0 ? 1 : clickedButton === 2 ? 0 : null;
    console.log("clickedButton", clickedButton);
    if (type !== null) {
      setClicks((prev) => [...prev, { x, y, type }]);
      setLocalClicks((prev) => [...prev, { x: pos.x, y: pos.y, type }]);
    }
  };
  const handleUndo = useCallback(() => {
    setClicks((prev) => prev.slice(0, -1));
    setLocalClicks((prev) => prev.slice(0, -1));
  }, [setClicks]);

  // Reset = clear all clicks
  const handleReset = useCallback(() => {
    setClicks([]);
    setLocalClicks([]);
    firstClicked.current = false;
  }, [setClicks]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }

      if (e.key.toLowerCase() === "r" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleReset]);
  return (
    <>
      <Image
        image={maskImage}
        x={0}
        y={0}
        width={width}
        height={height}
        objectFit={"contain"}
      />
      {localClicks.map((click, index) => (
        <Circle
          key={index}
          x={click.x}
          y={click.y}
          radius={5}
          fill={click.type === 1 ? "limegreen" : "crimson"}
          stroke="white"
          strokeWidth={1}
        />
      ))}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        onPointerMove={handleMouseMove}
        onPointerClick={handleMouseClick}
        onPointerOut={() => {
          _.defer(() => setMaskImage(null));
        }}
        onContextMenu={(e) => {
          e.evt.preventDefault();
        }}
      />
    </>
  );
}
