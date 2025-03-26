import { useEditor } from "../hooks/editor/editorContext.js";
export default function ViewShades() {
  const { shades } = useEditor();
  return (
    <div className="flex flex-col">
      <div className="flex flex-col">
        <h3 className="">Selected Colors:</h3>
        <div className="flex gap-2">
          {shades.colors.map((color, index) => (
            <div
              className="w-10 h-10"
              key={index}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col">
        <h3 className="">Selected Textures:</h3>
        <div className="flex gap-2">
          {shades.textures.map((textures, index) => (
            <div className="w-15 h-15" key={index}>
              <img
                src={textures.url}
                alt={textures.id}
                className="w-full h-full"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
