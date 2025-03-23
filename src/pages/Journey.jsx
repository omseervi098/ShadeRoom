import Header from "../components/Header.jsx";
import Modal from "../components/Modal.jsx";
import Footer from "../components/Footer.jsx";
import { useStepper } from "../hooks/stepper/stepperContext.js";
import { useGeneral } from "../hooks/general/generalContext.js";
import { EditorProvider } from "../hooks/editor/editorProvider.jsx";

export default function Journey() {
  const { currentStep } = useStepper();
  const { isModalOpen } = useGeneral();
  const { name, description, component: Component } = currentStep;
  return (
    <EditorProvider>
      <>
        <div className="App  md:flex items-center md:justify-center bg-background md:py-5">
          <div className="bg-white md:rounded-2xl shadow-lg w-full md:w-[95%] flex flex-col">
            {/* Header */}
            <Header />
            <div className="py-2 md:py-5">
              <Component key={name} />
            </div>

            {/*<Footer />*/}
          </div>
        </div>
        {isModalOpen && <Modal />}
      </>
    </EditorProvider>
  );
}
