import { EditorContext } from "./editorContext.js";
import { useState, useCallback } from "react";

export const EditorProvider = ({ children }) => {
  const [image, setImage] = useState(null);
  const [shades, setShades] = useState({
    textures: [],
    colors: [],
  });
  const updateImage = (image) => {
    setImage(image);
  };

  const updateShades = useCallback(
    (update) => {
      setShades((prevShades) => ({
        ...prevShades,
        ...update(prevShades),
      }));
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
        image,
        shades,
        addColors,
        removeColor,
        removeTexture,
        addTextures,
        updateImage,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};
