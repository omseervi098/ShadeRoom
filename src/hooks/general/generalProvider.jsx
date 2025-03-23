import { useState } from "react";
import { GeneralContext } from "./generalContext.js";

export const GeneralProvider = ({ children }) => {
  // State to manage the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modal, setModal] = useState({
    title: {
      header: null,
      subHeader: null,
      icon: null,
      allowClose: true,
    },
    content: null,
    action: [
      {
        label: null,
        onClick: null,
      },
      {
        label: null,
        onClick: null,
      },
    ],
  });

  const openModal = ({ title, content, action }) => {
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
    console.log("closeModal", isModalOpen);
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
