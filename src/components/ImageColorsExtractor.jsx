import { useState, useEffect } from "react";
import { extractColorsFromImage, rgbToHex } from "../utils/colors.js";
import { Plus, Minus } from "lucide-react";
const ImageColorExtractor = ({
  imageSrc,
  onUpdate = (selectedColors) => {},
}) => {
  const [colors, setColors] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);

  useEffect(() => {
    if (imageSrc) {
      extractColorsFromImage(imageSrc).then(setColors).catch(console.error);
    }
  }, [imageSrc]);

  useEffect(() => {
    onUpdate(selectedColors);
  }, [selectedColors]);

  const addColor = (color) => {
    const hex = rgbToHex(color);
    // Check if the color (hex) is already in the selectedColors array
    if (!selectedColors.some((colorObj) => colorObj.hex === hex)) {
      setSelectedColors((prevColors) => [
        ...prevColors,
        { rgb: color, hex: hex },
      ]);
    }
  };
  const removeColor = (colorHex) => {
    setSelectedColors((prevColors) =>
      prevColors.filter((colorObj) => colorObj.hex !== colorHex),
    );
  };

  return (
    <div className="w-full flex flex-col items-center gap-2 p-2">
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
        {/* Left: Display Image */}
        {imageSrc && (
          <img
            src={imageSrc}
            alt="Uploaded"
            className="w-auto sm:max-w-65 h-30 sm:h-50 object-cover rounded-md shadow-lg"
          />
        )}

        {/* Right: Extracted Colors */}
        <div className="flex flex-col gap-2">
          <h4 className="text-center sm:text-start">Extracted Colors: </h4>
          <div className="grid grid-cols-4 md: gap-2">
            {colors.map((color, index) => (
              <div
                key={index}
                className="relative group cursor-pointer"
                onClick={() => addColor(color)}
              >
                <div
                  className="w-10 h-10 rounded-md shadow-md "
                  style={{ backgroundColor: color }}
                ></div>
                <div className="absolute inset-0 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white bg-black p-1 rounded-full text-xs">
                    <Plus className="w-5 h-5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Display Selected Colors */}
      {selectedColors.length > 0 && (
        <div className="mt-2">
          <h4 className="text-center sm:text-start">Selected Colors:</h4>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-2">
            {selectedColors.map((colorObj) => (
              <div
                key={colorObj.hex}
                className="relative group cursor-pointer"
                onClick={() => removeColor(colorObj.hex)}
              >
                <div
                  className="w-10 h-10 rounded-md"
                  style={{ backgroundColor: colorObj.hex }}
                ></div>
                <div className="absolute inset-0 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white bg-black p-1 rounded-full text-xs">
                    <Minus className="w-5 h-5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageColorExtractor;
