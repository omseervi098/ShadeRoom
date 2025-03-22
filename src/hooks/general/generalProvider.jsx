import { useState } from "react";
import { GeneralContext } from "./generalContext.js";

export const GeneralProvider = ({ children }) => {
  // State to manage the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modal, setModal] = useState({
    title: "title",
    content: null,
    action: [],
  });

  const openModal = (title, content, action) => {
    if (isModalOpen) {
      console.error("Modal is already open");
      return;
    }

    // Check if modal state is already set
    if (
      modal.title === title &&
      modal.content === content &&
      modal.action === action
    ) {
      setIsModalOpen(true);
      console.log("Modal opens with the same state");
      return;
    }

    // Update modal state
    setModal({
      title: title,
      content: content,
      action: action,
    });
    setIsModalOpen(true);
  };
  const closeModal = () => {
    if (!isModalOpen) {
      console.error("Modal is already closed");
      return;
    }
    setIsModalOpen(false);
  };

  return (
    <GeneralContext.Provider
      value={{
        modal,
        isModalOpen,
        setModal,
        openModal,
        closeModal,
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
};
