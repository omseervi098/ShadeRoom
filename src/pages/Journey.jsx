import Header from "../components/Header.jsx";
import Modal from "../components/Modal.jsx";
import Footer from "../components/Footer.jsx";
import { useStepper } from "../hooks/stepper/stepperContext.js";
import { useGeneral } from "../hooks/general/generalContext.js";
import ImageUploader from "../components/ImageUploader.jsx";

export default function Journey() {
  const { currentStep, goToStep } = useStepper();
  const { isModalOpen, openModal } = useGeneral();
  const { name, description, component: Component } = currentStep;
  return (
    <>
      <div className="App  md:flex items-center md:justify-center bg-background md:py-5">
        <div className="bg-white md:rounded-2xl shadow-lg w-full md:w-[95%] flex flex-col">
          {/* Header */}
          <Header />
          <div className="py-2 md:py-5">
            <Component key={name} />
          </div>
          <button
            onClick={() => openModal("Image Uploader", <ImageUploader />)}
            className="bg-primary text-text-tertiary font-bold py-1 px-4 rounded-lg hover:bg-primary/80 transition duration-300 ease-in-out"
          >
            Open Modal
          </button>

          {/*<Footer />*/}
        </div>
      </div>
      {isModalOpen && <Modal />}
    </>
  );
}
