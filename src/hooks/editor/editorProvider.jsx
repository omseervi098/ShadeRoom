import { EditorContext } from "./editorContext.js";
import { useState } from "react";

export const EditorProvider = ({ children }) => {
  const [image, setImage] = useState(null);
  const updateImage = (image) => {
    setImage(image);
  };
  return (
    <EditorContext.Provider
      value={{
        image,
        updateImage,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};
