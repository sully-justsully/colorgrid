import React, { useRef } from "react";
import AreYouSureModal from "./AreYouSureModal";
import "../styles/AreYouSureModal.css";

interface ResetRampsModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

const ResetRampsModal: React.FC<ResetRampsModalProps> = ({
  onClose,
  onConfirm,
}) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <AreYouSureModal onClose={onClose} initialFocusRef={cancelButtonRef}>
      <div className="modal-header">
        <h2 className="heading-lg">Reset Color Ramps?</h2>
      </div>
      <div className="body-lg modal-content-message">
        This will clear all color ramps in this tab, which cannot be undone.
      </div>
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
          Reset
        </button>
      </div>
    </AreYouSureModal>
  );
};

export default ResetRampsModal;
