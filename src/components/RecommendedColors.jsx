import { useState } from "react";
import { recommendedColorsList } from "../data/recommendedColors.js";
import { CirclePlus, CircleMinus } from "lucide-react";
const ColorTiles = ({ tiles, onAddTile, onRemoveTile, selectedTiles }) => {
  const selectedTileIds = new Set(selectedTiles.map((tile) => tile.id));
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
      {tiles.map((tile) => {
        const isSelected = selectedTileIds.has(tile.id);
        return (
          <div
            key={tile.id}
            className={`relative ${isSelected ? "border-3 border-primary p-1" : ""} group shadow-md cursor-pointer rounded-md `}
          >
            <div
              className={`flex ${isSelected ? "h-11" : "h-14"} rounded-md overflow-hidden`}
            >
              {tile.colors.map((color, index) => (
                <div
                  key={index}
                  className="w-[25%] h-full  hover:w-[40%] transition-all duration-200 transform hover:scale-100"
                  style={{ backgroundColor: color.hex }}
                ></div>
              ))}
            </div>
            <button
              onClick={() =>
                isSelected ? onRemoveTile(tile.id) : onAddTile(tile)
              }
              className={`absolute -top-3 -right-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white bg-secondary rounded-full text-xl font-bold cursor-pointer`}
            >
              {isSelected ? (
                <CircleMinus className="w-8 h-8 text-primary  font-semibold" />
              ) : (
                <CirclePlus className="w-8 h-8 text-primary font-semibold" />
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default function RecommendedColors() {
  const [selectedTiles, setSelectedTiles] = useState([]);

  const addTile = (tile) => {
    if (!selectedTiles.some((tileObj) => tileObj.id === tile.id)) {
      console.log("adding tile", tile);
      setSelectedTiles((prevSelectedTiles) => [...prevSelectedTiles, tile]);
    }
  };
  const onRemoveTile = (tileId) => {
    setSelectedTiles((prevColors) =>
      prevColors.filter((colorObj) => colorObj.id !== tileId),
    );
  };

  return (
    <div className="w-[90vw] h-[70vh] overflow-y-scroll p-2">
      <ColorTiles
        tiles={recommendedColorsList}
        selectedTiles={selectedTiles}
        onAddTile={addTile}
        onRemoveTile={onRemoveTile}
      />
    </div>
  );
}
