import React, { ReactNode, useRef } from "react";
import AreYouSureModal from "./AreYouSureModal";

interface ReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  children?: ReactNode;
  title?: string;
}

const ReplaceModal: React.FC<ReplaceModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  children,
  title = "Replace Lightness Values?",
}) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  if (!isOpen) return null;

  return (
    <AreYouSureModal onClose={onClose} initialFocusRef={cancelButtonRef}>
      <h2 className="modal-header">{title}</h2>
      <div className="body-lg modal-content-message">{children}</div>
      <div className="modal-actions">
        <button
          ref={cancelButtonRef}
          className="btn btn-secondary"
          onClick={onClose}
          autoFocus
        >
          Cancel
        </button>
        <button className="btn btn-destructive" onClick={onConfirm}>
          Replace
        </button>
      </div>
    </AreYouSureModal>
  );
};

export default ReplaceModal;
