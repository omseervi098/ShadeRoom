import { convertURLtoFile } from "./imageHelpers.js";
import axios from "axios";
import pako from "pako";
import { Tensor } from "onnxruntime-web";
export const getImageEmbedding = async (imageElement) => {
  if (!imageElement) return null;
  try {
    const imageFile = await convertURLtoFile(imageElement.src, "image.jpg");
    console.log(imageFile);
    const response = await axios.post(
      `${import.meta.env.VITE_SHADEROOM_BACKEND_URI}/get-embedding`,
      {
        image: imageFile,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    const data = await response.data;
    const compressedTensor = Uint8Array.from(atob(data.tensor), (c) =>
      c.charCodeAt(0),
    );
    const decompressed = await pako.inflate(compressedTensor);
    const float32Array = new Float32Array(decompressed.buffer);
    return new Tensor("float32", float32Array, data.shape);
  } catch (err) {
    console.log("Error while fetching image embeddings:", err);
    throw err;
  }
};
export const transformDataForModel = ({ clicks, embedding, modelScale }) => {
  const imageEmbedding = embedding;
  let pointCoords;
  let pointLabels;
  let pointCoordsTensor;
  let pointLabelsTensor;

  // Check there are input click prompts
  if (clicks) {
    let n = clicks.length;

    // If there is no box input, a single padding point with
    // label -1 and coordinates (0.0, 0.0) should be concatenated
    // so initialize the array to support (n + 1) points.
    pointCoords = new Float32Array(2 * (n + 1));
    pointLabels = new Float32Array(n + 1);

    // Add clicks and scale to what SAM expects
    for (let i = 0; i < n; i++) {
      pointCoords[2 * i] = clicks[i].x * modelScale.modelScale;
      pointCoords[2 * i + 1] = clicks[i].y * modelScale.modelScale;
      pointLabels[i] = clicks[i].type;
    }

    // Add in the extra point/label when only clicks and no box
    // The extra point is at (0, 0) with label -1
    pointCoords[2 * n] = 0.0;
    pointCoords[2 * n + 1] = 0.0;
    pointLabels[n] = -1.0;

    // Create the tensor
    pointCoordsTensor = new Tensor("float32", pointCoords, [1, n + 1, 2]);
    pointLabelsTensor = new Tensor("float32", pointLabels, [1, n + 1]);
  }

  if (pointCoordsTensor === undefined || pointLabelsTensor === undefined)
    return;

  const imageSizeTensor = new Tensor("float32", [
    modelScale.height,
    modelScale.width,
  ]);

  // There is no previous mask, so default to an empty tensor
  const maskInput = new Tensor(
    "float32",
    new Float32Array(256 * 256),
    [1, 1, 256, 256],
  );
  // There is no previous mask, so default to 0
  const hasMaskInput = new Tensor("float32", [0]);

  return {
    image_embeddings: imageEmbedding,
    point_coords: pointCoordsTensor,
    point_labels: pointLabelsTensor,
    orig_im_size: imageSizeTensor,
    mask_input: maskInput,
    has_mask_input: hasMaskInput,
  };
};
