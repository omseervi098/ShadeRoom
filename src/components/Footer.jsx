import { useStepper } from "../hooks/stepper/stepperContext.js";
export default function Footer() {
  const { handleNext, handlePrevious } = useStepper();
  return (
    <div className="flex justify-end p-2 pb-2 rounded-b-lg">
      {/*<button*/}
      {/*  className="bg-text-secondary text-text-tertiary font-bold py-1 px-4 rounded-lg hover:bg-text-secondary/80 transition duration-300 ease-in-out"*/}
      {/*  onClick={handlePrevious}*/}
      {/*>*/}
      {/*  Back*/}
      {/*</button>*/}
      <button
        className="bg-primary text-text-tertiary font-bold py-1 px-4 rounded-lg hover:bg-primary/80 transition duration-300 ease-in-out"
        onClick={handleNext}
      >
        Next
      </button>
    </div>
  );
}
