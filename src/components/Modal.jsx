import { useGeneral } from "../hooks/general/generalContext.js";
export default function Modal() {
  const { modal, closeModal } = useGeneral();
  const { title, content } = modal;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-primary-50 z-50">
      <div className="bg-text-tertiary rounded-lg shadow-lg p-6 w-11/12 md:w-1/2 lg:w-1/3">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="flex items-center justify-between">{content}</div>
        <div className="flex justify-end">
          <button
            className="bg-primary text-text-tertiary font-bold py-1 px-4 rounded-lg hover:bg-primary/80 transition duration-300 ease-in-out"
            onClick={closeModal}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
