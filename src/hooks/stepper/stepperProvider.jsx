import { useState } from "react";
import { StepperContext } from "./stepperContext.js";
import { steps } from "../../data/stepsConfig.js";

export const StepperProvider = ({ children }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [currentStep, setCurrentStep] = useState({
    name: steps[0].name,
    description: steps[0].description,
    component: steps[0].component,
  });

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      console.error("Already at the last step");
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setCurrentStep(steps[activeStep + 1]);
  };
  const handlePrevious = () => {
    if (activeStep === 0) {
      console.error("Already at the first step");
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setCurrentStep(steps[activeStep - 1]);
  };
  const handleReset = () => {
    if (activeStep === 0) {
      console.error("Already at the first step");
      return;
    }
    setActiveStep(0);
    setCurrentStep(steps[0]);
  };
  const goToStep = (step) => {
    if (step < 0 || step >= steps.length) {
      console.error("Invalid step index");
      return;
    }
    setActiveStep(step);
    setCurrentStep(steps[step]);
  };

  return (
    <StepperContext.Provider
      value={{
        steps,
        activeStep,
        currentStep,
        handleNext,
        handlePrevious,
        handleReset,
        goToStep,
      }}
    >
      {children}
    </StepperContext.Provider>
  );
};
