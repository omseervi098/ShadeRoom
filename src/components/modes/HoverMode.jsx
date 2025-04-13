import { useRef, useState } from "react";
import * as _ from "underscore";
import { Image, Rect } from "react-konva";
import { useEditor } from "../../hooks/editor/editorContext.js";

export default function HoverMode(props) {
  const { width, height } = props;
  const { scale, maskImage, setClicks, setMaskImage, setMode } = useEditor();
  const firstClicked = useRef(false);
  const lastClickRef = useRef(null);

  const handleMouseMove = _.throttle((event) => {
    if (firstClicked.current) {
      return;
    }
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
    console.log("clickedButton", clickedButton);
    if (clickedButton === 0) {
      setClicks((prev) => [...prev, { x, y, type: 1 }]);
    } else if (clickedButton === 2) {
      setClicks((prev) => [...prev, { x, y, type: 0 }]);
    }
  };

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
      />
    </>
  );
}
