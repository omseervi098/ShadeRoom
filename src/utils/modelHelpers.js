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
      `${import.meta.env.VITE_SHADEROOM_BACKEND_URI}/get-embedding?__sign=${import.meta.env.VITE_SHADEROOM_BACKEND_TOKEN}`,
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
export const transformDataForModel = ({
  clicks,
  embedding,
  modelScale,
  lastPredMask,
  mode,
}) => {
  const feeds = {
    image_embeddings: embedding,
    orig_im_size: new Tensor("float32", [modelScale.height, modelScale.width]),
  };

  // Check there are input click prompts
  if (clicks) {
    let pointCoords;
    let pointLabels;
    let pointCoordsTensor;
    let pointLabelsTensor;
    let n = clicks.length;

    if (mode === "lasso") {
      pointCoords = new Float32Array(2 * n);
      pointLabels = new Float32Array(n);
    } else {
      pointCoords = new Float32Array(2 * (n + 1));
      pointLabels = new Float32Array(n + 1);
    }

    for (let i = 0; i < n; i++) {
      pointCoords[2 * i] = clicks[i].x * modelScale.modelScale;
      pointCoords[2 * i + 1] = clicks[i].y * modelScale.modelScale;
      pointLabels[i] = clicks[i].type;
    }

    if (mode === "lasso") {
      pointCoordsTensor = new Tensor("float32", pointCoords, [1, n, 2]);
      pointLabelsTensor = new Tensor("float32", pointLabels, [1, n]);
    } else {
      pointCoords[2 * n] = 0.0;
      pointCoords[2 * n + 1] = 0.0;
      pointLabels[n] = -1.0;
      pointCoordsTensor = new Tensor("float32", pointCoords, [1, n + 1, 2]);
      pointLabelsTensor = new Tensor("float32", pointLabels, [1, n + 1]);
    }
    feeds.point_coords = pointCoordsTensor;
    feeds.point_labels = pointLabelsTensor;
  }
  if (feeds.point_coords === undefined || feeds.point_labels === undefined)
    return;

  if (lastPredMask) {
    //last Pred Mask will be float32 array of 256*256 size
    feeds.mask_input = new Tensor("float32", lastPredMask, [1, 1, 256, 256]);
    feeds.has_mask_input = new Tensor("float32", [1], [1]);
  } else {
    feeds.mask_input = new Tensor(
      "float32",
      new Float32Array(256 * 256),
      [1, 1, 256, 256], // SAM expects this shape
    );
    feeds.has_mask_input = new Tensor("float32", [0], [1]);
  }

  return feeds;
};
