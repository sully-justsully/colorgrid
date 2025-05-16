import React from "react";
import "../styles/Modal.css";

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  /** Optional ref to focus an element inside the modal, e.g., a button */
  initialFocusRef?: React.RefObject<HTMLElement>;
  /** Title of the modal for screen readers */
  title: string;
}

const Modal: React.FC<ModalProps> = ({
  onClose,
  children,
  initialFocusRef,
  title,
}) => {
  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  // Focus trap for modal
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={handleClose} role="presentation">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h2 id="modal-title" className="visually-hidden">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
};

export default Modal;
