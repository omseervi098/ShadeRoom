import ImageCropper from "../ImageCropper.jsx";
import LivingRoomThumbnail from "../../assets/living_room/thumbnail.jpg";
import BedroomThumbnail from "../../assets/bedroom/thumbnail.jpg";
import ImageColorsExtractor from "../ImageColorsExtractor.jsx";
import SelectColorsFromPalette from "../selectFromPalette.jsx";
import RecommendedColors from "../RecommendedColors.jsx";
import ViewShades from "../ViewShades.jsx";
import { useEditor } from "../../hooks/editor/editorContext.js";
import { useStepper } from "../../hooks/stepper/stepperContext.js";
import { useEffect } from "react";
import { transformDataForModel } from "../../utils/modelHelpers.js";
import { onnxMaskToImage } from "../../utils/imageHelpers.js";
import CanvasImage from "../CanvasImage.jsx";
import { ImageEditor } from "../ImageEditor.jsx";

export default function ShadeRoom({ modelSession }) {
  const {
    image,
    clicks,
    scale,
    embedding,
    embeddingStatus,
    setMaskImage,
    selectedShade,
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
        const feeds = transformDataForModel({
          clicks,
          embedding,
          modelScale: scale,
        });
        if (feeds === undefined) return;

        const results = await modelSession.run(feeds);
        const output = results[modelSession.outputNames[0]];

        const maskImage = onnxMaskToImage(
          output.data,
          output.dims[3],
          output.dims[2],
        );
        setMaskImage(maskImage);
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
