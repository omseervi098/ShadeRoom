import { useEditor } from "../../hooks/editor/editorContext.js";
import { useStepper } from "../../hooks/stepper/stepperContext.js";
import { useEffect } from "react";
import { transformDataForModel } from "../../utils/modelHelpers.js";
import { arrayToImageData, imageDataToImage, onnxMaskToImage } from "../../utils/imageHelpers.js";
import { ImageEditor } from "../ImageEditor.jsx";
import { rgbStrToRgbaArray } from "../../utils/colors.js";

export default function ShadeRoom({ modelSession }) {
  const {
    image,
    clicks,
    lastPredMask,
    scale,
    mode,
    embedding,
    embeddingStatus,
    setMaskOutput,
    selectedShade,
    setLastPredMask,
  } = useEditor();
  const { goToStep } = useStepper();
  const runONNX = async () => {
    try {
      if (
        modelSession === null ||
        clicks === null ||
        embedding === null ||
        scale === null
      )
        return null;
      else {
        const input = {
          clicks: clicks,
          modelScale: scale,
          embedding: embedding,
          lastPredMask: lastPredMask,
          mode: mode,
        };
        const feeds = transformDataForModel(input);
        console.log(feeds);
        if (feeds === undefined) return;

        const results = await modelSession.run(feeds);
        setLastPredMask(results.low_res_masks.data);
        const output = results[modelSession.outputNames[0]];
        let rgb = [0, 0, 255, 100];
        if (selectedShade && selectedShade.rgb) {
          rgb = rgbStrToRgbaArray(selectedShade.rgb, 150);
        }

        setMaskOutput(onnxMaskToImage({
          input: output.data,
          width: output.dims[2],
          height: output.dims[3],
          maskColor: rgb,
        }));
      }
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    if (embeddingStatus === "error") {
      // goToStep(0);
    }
  }, [embeddingStatus]);
  useEffect(() => {
    runONNX().then(() => {
      console.log("Mask Image Generated");
    });
  }, [clicks]);
  // console.log(LivingRoomThumbnail);
  return (
    <div className="w-full h-full">
      {embeddingStatus === "loading" ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="w-full h-full md:rounded-b-md overflow-hidden bg-text-secondary/40">
          {/*Welcome To Shade Room*/}
          <ImageEditor />
        </div>
      )}
      {/* Add your content here */}
    </div>
  );
}
