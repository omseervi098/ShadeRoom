import { predefinedImages } from "../../data/predefinedImages.js";
import ImageUploader from "../ImageUploader.jsx";
import { useGeneral } from "../../hooks/general/generalContext.js";

export default function SelectImage() {
  const { openModal } = useGeneral();
  const handleUpload = (image) => {
    console.log(image);
    console.log("Image uploaded");
    openModal(
      "Uploaded Image",
      <div className="flex flex-col items-center justify-center">
        <img
          src={URL.createObjectURL(image)}
          alt="Uploaded"
          className="object-cover w-full h-[85%] rounded-sm"
        />
        <div className="py-1 text-sm text-primary font-bold">{image.name}</div>
      </div>,
    );
    // Handle the uploaded image
  };
  return (
    <>
      <div className="w-full flex flex-col md:flex-row justify-evenly space-y-5 md:space-y-0 items-center py-2">
        <div className="w-[90%] sm:w-[80%] md:w-[45%] flex flex-col justify-center space-y-3 ">
          <h1 className="text-xl text-center text-text-primary md:text-start font-bold">
            Select Room Image to Start
          </h1>
          <div className="grid grid-cols-2 gap-4">
            {predefinedImages.map((image, index) => (
              <div
                key={index}
                className="w-auto h-auto bg-secondary flex flex-col items-center justify-center rounded-sm overflow-hidden"
              >
                <img
                  src={image.thumbnail}
                  alt={image.name}
                  className="object-cover w-full h-[85%] rounded-sm transition-transform duration-300 transform hover:scale-105"
                />

                <div className="py-1 text-sm text-primary font-bold">
                  {image.name}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-[90%] sm:w-[80%] md:w-[40%] lg:w-[35%] xl:w-[30%] flex flex-col">
          <ImageUploader onUpload={handleUpload} />
        </div>
      </div>
    </>
  );
}
