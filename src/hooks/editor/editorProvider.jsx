import { EditorContext } from "./editorContext.js";
import { getImageEmbedding } from "../../utils/modelHelpers.js";
import { useState, useCallback, useEffect } from "react";

export const EditorProvider = ({ children }) => {
  const [image, setImage] = useState(null); // HTMLImageElement of Main Image
  const [clicks, setClicks] = useState([]);
  const [lastPredMask, setLastPredMask] = useState(null);
  const [maskImage, setMaskImage] = useState(null);
  const [maskSvg, setMaskSvg] = useState(null);
  const [error, setError] = useState(null);
  const [shades, setShades] = useState({
    textures: [],
    colors: [],
  }); //Shades consist of textures, colors
  const [selectedShade, setSelectedShade] = useState(null);
  const [scale, setScale] = useState({
    width: null,
    height: null,
    modelScale: null,
  }); //scale for onnx model
  const [embedding, setEmbedding] = useState(null); //embeddings
  const [embeddingStatus, setEmbeddingStatus] = useState(""); //status for
  // embedding
  const [mode, setMode] = useState("hover");

  useEffect(() => {
    if (image) {
      setEmbeddingStatus("loading");
      getImageEmbedding(image)
        .then((embedding) => {
          console.log("Embedding loaded", embedding);
          setEmbedding(embedding);
          setEmbeddingStatus("loaded");
        })
        .catch((error) => {
          console.error(error);
          setEmbeddingStatus("error");
        });
    }
  }, [image]);

  const updateImage = (image) => {
    setImage(image);
  };

  const updateScale = ({ width, height, modelScale }) => {
    setScale({
      width,
      height,
      modelScale,
    });
  };

  const updateShades = useCallback(
    (update) => {
      setShades((prevShades) => {
        if (!prevShades || !prevShades.colors || !prevShades.textures)
          return {
            colors: prevShades.colors,
            textures: prevShades.textures,
          };
        return {
          ...prevShades,
          ...update(prevShades),
        };
      });
    },
    [setShades],
  );

  const addColors = (newColors) => {
    updateShades((prev) => {
      const existingHexSet = new Set(prev.colors.map((color) => color.hex));
      const uniqueNewColors = newColors.filter(
        (color) => !existingHexSet.has(color.hex),
      );
      return { colors: [...prev.colors, ...uniqueNewColors] };
    });
  };

  const removeColor = (colorToRemove) => {
    updateShades((prev) => ({
      colors: prev.colors.filter((color) => color.hex !== colorToRemove.hex),
    }));
  };

  const addTextures = (newTextures) => {
    updateShades((prev) => ({
      textures: [...prev.textures, ...newTextures],
    }));
  };

  const removeTexture = (textureToRemove) => {
    updateShades((prev) => ({
      textures: prev.textures.filter(
        (texture) => texture.id !== textureToRemove.id,
      ),
    }));
  };

  return (
    <EditorContext.Provider
      value={{
        clicks,
        setClicks,
        lastPredMask,
        setLastPredMask,
        maskImage,
        setMaskImage,
        maskSvg,
        setMaskSvg,
        image,
        embedding,
        shades,
        selectedShade,
        setSelectedShade,
        scale,
        embeddingStatus,
        mode,
        setMode,
        addColors,
        removeColor,
        removeTexture,
        updateScale,
        addTextures,
        updateImage,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};
