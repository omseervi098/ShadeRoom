import Header from "../components/Header.jsx";
import Modal from "../components/Modal.jsx";
import Footer from "../components/Footer.jsx";
import { useStepper } from "../hooks/stepper/stepperContext.js";
import { useGeneral } from "../hooks/general/generalContext.js";
import { EditorProvider } from "../hooks/editor/editorProvider.jsx";
import { InferenceSession } from "onnxruntime-web";
import ONNXDecoderModel from "../assets/sam_vit_b_decoder.onnx";
import { useState, useEffect } from "react";

export default function Journey() {
  const [modelSession, setModelSession] = useState(null);
  const { currentStep } = useStepper();
  const { isModalOpen } = useGeneral();
  const { name, description, component: Component } = currentStep;
  const getModelSession = async () => {
    const session = await InferenceSession.create(`${ONNXDecoderModel}`, {
      executionProviders: ["webgl", "wasm"],
    });
    console.log("models Loaded", session);
    return session;
  };
  useEffect(() => {
    getModelSession()
      .then((modelSession) => {
        setModelSession(modelSession);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  return (
    <EditorProvider>
      <>
        <div className="App  md:flex items-center md:justify-center bg-background md:py-5">
          <div className="bg-white md:rounded-2xl shadow-lg w-full md:w-[95%] flex flex-col">
            {/* Header */}
            <Header />
            <div className="">
              <Component key={name} modelSession={modelSession} />
            </div>

            {/*<Footer />*/}
          </div>
        </div>
        {isModalOpen && <Modal />}
      </>
    </EditorProvider>
  );
}
