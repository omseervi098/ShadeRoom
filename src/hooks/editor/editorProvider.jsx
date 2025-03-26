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

  const addTextures = (newTextures) => {
    setShades((prevShades) => ({
      colors: prevShades.colors,
      textures: [...prevShades.textures, ...newTextures], // Add all textures at once
    }));
  };

  return (
    <EditorContext.Provider
      value={{
        image,
        shades,
        updateColors,
        addTextures,
        updateImage,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};
