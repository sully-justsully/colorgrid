import React, { useEffect, useRef, useState } from "react";
import "../styles/AreYouSureModal.css";

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  /** Optional ref to focus an element inside the modal, e.g., a button */
  initialFocusRef?: React.RefObject<HTMLElement>;
  /** Title of the modal for screen readers */
  title?: string;
}

const AreYouSureModal: React.FC<ModalProps> = ({
  onClose,
  children,
  initialFocusRef,
  title,
}) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Add the open class after mount to trigger the transition
    const id = requestAnimationFrame(() => setIsOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus();
    }
  }, [initialFocusRef]);

  return (
    <div
      className={`modal-backdrop${isOpen ? " open" : ""}`}
      ref={backdropRef}
      onClick={onClose}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        {...(title ? { "aria-labelledby": "modal-title" } : {})}
      >
        {title && (
          <h2 id="modal-title" className="visually-hidden">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
};

export default AreYouSureModal;
