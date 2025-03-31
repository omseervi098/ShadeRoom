import { useEditor } from "../hooks/editor/editorContext.js";
import { useEffect, useState } from "react";
import * as _ from "underscore";
export default function CanvasImage() {
  const { image, clicks, setClicks, maskImage, setMaskImage, scale } =
    useEditor();
  const getClick = (x, y) => {
    return { x, y, type: 1 };
  };

  const handleMouseMove = _.throttle((e) => {
    let el = e.nativeEvent.target;
    const rect = el.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    const imageScale = image ? image.width / el.offsetWidth : 1;
    x *= imageScale;
    y *= imageScale;
    const click = getClick(x, y);
    if (click) setClicks([click]);
  }, 10);

  const [shouldFitToWidth, setShouldFitToWidth] = useState(true);
  const bodyEl = document.body;
  const fitToPage = () => {
    if (!image) return;
    const imageAspectRatio = image.width / image.height;
    const screenAspectRatio = window.innerWidth / window.innerHeight;
    setShouldFitToWidth(imageAspectRatio > screenAspectRatio);
  };
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.target === bodyEl) {
        fitToPage();
      }
    }
  });

  useEffect(() => {
    fitToPage();
    resizeObserver.observe(bodyEl);
    return () => {
      resizeObserver.unobserve(bodyEl);
    };
  }, [image]);
  const imageClasses = "w-full h-full object-center";
  const maskImageClasses = `absolute top-0 left-0 w-full h-full pointer-events-none`;

  const flexCenterClasses = "flex items-center justify-center";
  return (
    <div className={`${flexCenterClasses} w-full h-full`}>
      <div className={`${flexCenterClasses} relative w-[90%] h-[90%] py-3`}>
        <div className="relative w-full h-full overflow-hidden">
          {image && (
            <img
              onMouseMove={handleMouseMove}
              onMouseOut={() => _.defer(() => setMaskImage(null))}
              src={image.src}
              alt="Image"
              width={image.width}
              height={image.height}
              className={`${
                shouldFitToWidth ? "w-full" : "h-full"
              } ${imageClasses}`}
            />
          )}
          {maskImage && (
            <img
              src={maskImage.src}
              alt="Mask"
              width={maskImage.width}
              height={maskImage.height}
              className={`${
                shouldFitToWidth ? "w-full" : "h-full"
              } ${maskImageClasses} `}
            />
          )}
        </div>
      </div>
    </div>
  );
}
