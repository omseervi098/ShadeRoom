import CanvasImage from "./CanvasImage.jsx";
import Sidebar from "./Sidebar.jsx";
import { useEditor } from "../hooks/editor/editorContext.js";
export function ImageEditor() {
  const { shades } = useEditor();
  return (
    <div className="w-full h-full flex flex-col md:flex-row justify-between">
      {/*  SideBar */}
      <div className="hidden md:block w-32">
        <Sidebar colors={shades.colors} textures={shades.textures} />
      </div>

      {/*  Main Image */}
      <div className="py-5 md:py-0 flex-1 flex items-center justify-center ">
        <div className="max-w-[100%] lg:max-w-[80%] ">
          <CanvasImage />
        </div>
      </div>
      <div className="block md:hidden w-full h-32">
        <Sidebar />
      </div>
    </div>
  );
}
