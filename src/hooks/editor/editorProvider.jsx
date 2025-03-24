import { EditorContext } from "./editorContext.js";
import { useState } from "react";

export const EditorProvider = ({ children }) => {
  const [image, setImage] = useState(null);
  const [shades, setShades] = useState({
    textures: [],
    colors: [],
  });
  const updateImage = (image) => {
    setImage(image);
  };
  const updateColors = (colors) => {
    setShades({
      ...shades,
      colors: colors,
    });
  };

  const addTexture = (newTexture) => {
    setShades({
      colors: shades.colors,
      textures: [...shades.textures, newTexture],
    });
  };

  return (
    <EditorContext.Provider
      value={{
        image,
        shades,
        updateColors,
        addTexture,
        updateImage,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};
