import { SwatchBook, PaintRoller, Crop } from "lucide-react";
import RecommendedColors from "../../assets/select_shades_recommended_colors.png";
import RecommendedTextures from "../../assets/select_shades_recommended_textures.png";
import SelectFromColorPalette from "../../assets/select_shades_select_from_color_palette.png";
import UploadOwnTexture from "../../assets/select_shades_upload_own_texture.png";
import ExtractColorsFromImage from "../../assets/select_shades_extract_colors_from_image.png";
import { useGeneral } from "../../hooks/general/generalContext.js";
import ImageUploader from "../ImageUploader.jsx";
import ImageCropper from "../ImageCropper.jsx";

export default function SelectShades() {
  const { openModal } = useGeneral();
  const handleTextureUpload = (image) => {
    // Handle the uploaded texture file here
    let croppedImage = null;
    console.log(image);
    console.log("Uploaded texture file:", image);
    openModal({
      title: {
        header: "Rotate or Crop Your Texture",
        subHeader: "Rotate or crop your texture to fit the model.",
        icon: <Crop className="w-5 h-5" />,
        allowClose: true,
      },
      content: (
        <ImageCropper
          imageSrc={URL.createObjectURL(image)}
          aspect={4 / 3}
          onCropComplete={(image) => {
            console.log("callback from ImageCropper", image);
            croppedImage = image;
          }}
        />
      ),
      action: [
        {
          label: "Crop & Confirm",
          onClick: () => {
            if (croppedImage) {
              console.log("croppedImage", croppedImage);
            } else {
              console.error("cropped image not found");
            }
          },
        },
      ],
    });
  };
  const onClickUploadTexture = () => {
    openModal({
      title: {
        header: "upload your own texture",
        subHeader: "ensure good quality texture",
        icon: <PaintRoller className="w-5 h-5" />,
        allowClose: true,
      },
      content: (
        <ImageUploader
          maxFileSizeInMB={5}
          acceptedFileTypes={["image/jpeg", "image/png", "image/webp"]}
          onUpload={handleTextureUpload}
        />
      ),
      action: [
        {
          label: "Next",
          onClick: () => {
            console.log("Next");
          },
        },
      ],
    });
  };
  return (
    <div className="flex flex-col justify-center w-full px-3 md:px-5 py-1">
      <div className="flex justify-between items-center">
        <h1 className="text-xl text-primary font-bold">
          Select Shades for Room
        </h1>
        <button className="mr-2 text-sm font-bold flex items-center relative cursor-pointer">
          <SwatchBook className="w-8 h-8 text-primary bg-secondary rounded p-1" />
          <span className="absolute -top-1 -right-2 bg-primary text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
            5
          </span>
        </button>
      </div>
      <div className="flex flex-col justify-center mt-3 px-2 md:px-5">
        <h2 className="text-lg text-text-primary font-semibold">
          Select Color Shades
        </h2>
        <div className="md:px-10 grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-10 mt-3">
          <div className="bg-secondary rounded-xl shadow-md text-center overflow-hidden cursor-pointer">
            <img
              src={`${ExtractColorsFromImage}`}
              alt="Extract Colors"
              className="rounded-t-lg object-cover transition-transform duration-300 transform hover:scale-105 hover:opacity-80"
            />
            <p className="text-sm font-semibold text-primary py-1">
              Extract Colors from Image
            </p>
          </div>
          <div className="bg-secondary rounded-xl shadow-md text-center overflow-hidden cursor-pointer">
            <img
              src={`${SelectFromColorPalette}`}
              alt="Select from Color Palette"
              className="rounded-t-lg object-cover transition-transform duration-300 transform hover:scale-105 hover:opacity-80"
            />
            <p className="text-sm font-semibold text-primary py-1">
              Select from Color Palette
            </p>
          </div>
          <div className="bg-secondary rounded-xl shadow-md text-center overflow-hidden cursor-pointer">
            <img
              src={`${RecommendedColors}`}
              alt="Recommended Colors"
              className="rounded-t-lg object-cover transition-transform duration-300 transform hover:scale-105 hover:opacity-80"
            />
            <p className="text-sm  font-semibold text-primary py-1">
              Recommended Colors
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center mt-3 px-2 md:px-5">
        <h2 className="text-lg text-text-primary font-semibold">
          Select Texture Shades
        </h2>
        <div className="md:px-10 grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-10 mt-3">
          <div className="bg-secondary rounded-xl shadow-md text-center overflow-hidden cursor-pointer">
            <img
              src={`${RecommendedTextures}`}
              alt="Recommended Textures"
              className="rounded-t-lg object-cover transition-transform duration-300 transform hover:scale-105 hover:opacity-80"
            />
            <p className="text-sm font-semibold text-primary py-1">
              Recommended Textures
            </p>
          </div>
          <div
            className="bg-secondary rounded-xl shadow-md text-center overflow-hidden cursor-pointer"
            onClick={onClickUploadTexture}
          >
            <img
              src={`${UploadOwnTexture}`}
              alt="Upload Own Texture"
              className="rounded-t-lg object-cover transition-transform duration-300 transform hover:scale-105 hover:opacity-80"
            />
            <p className="text-sm font-semibold text-primary py-1">
              Upload Own Texture
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
