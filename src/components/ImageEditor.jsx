import CanvasImage from "./CanvasImage.jsx";
import Sidebar from "./Sidebar.jsx";
import { useEditor } from "../hooks/editor/editorContext.js";
export function ImageEditor() {
  const { shades } = useEditor();
  return (
    <div className="w-full h-full flex flex-col-reverse md:flex-row justify-between">
      {/*  SideBar */}
      <div className="h-32 md:h-auto w-full md:w-32">
        <Sidebar colors={shades.colors} textures={shades.textures} />
      </div>

      {/*  Main Image */}
      <div className="py-5 md:py-0 flex-1 flex items-center justify-center ">
        <div className="max-w-[100%] lg:max-w-[80%] ">
          <CanvasImage />
        </div>
      </div>
    </div>
  );
}
