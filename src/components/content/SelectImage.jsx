import { predefinedImages } from "../../data/predefinedImages.js";
import ImageUploader from "../ImageUploader.jsx";
import { useGeneral } from "../../hooks/general/generalContext.js";
import ImageCropper from "../ImageCropper.jsx";
import { Crop } from "lucide-react";
import { useEditor } from "../../hooks/editor/editorContext.js";
import { useStepper } from "../../hooks/stepper/stepperContext.js";
export default function SelectImage() {
  const { isModalOpen, openModal, closeModal } = useGeneral();
  const { handleNext } = useStepper();
  const { image: globalimage, updateImage } = useEditor();
  const handleUpload = (image) => {
    let croppedImage = null;
    console.log("Image Uploaded", image);
    openModal({
      title: {
        header: "Rotate or Crop Your Image",
        subHeader: "crop the image to maintain a 4:3 aspect ratio.",
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
              updateImage(croppedImage);
              console.log("going to next step ..");
              handleNext(croppedImage);
              console.log("closing modal..");
              closeModal();
            } else {
              console.error("cropped image not found");
            }
          },
        },
      ],
    });
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
                  className="object-cover w-full rounded-sm transition-transform duration-300 transform hover:scale-105"
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
