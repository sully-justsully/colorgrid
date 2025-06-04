import React from "react";
import { ReactComponent as TrashIcon } from "../icons/trash.svg";
import { ReactComponent as EditIcon } from "../icons/edit.svg";
import { ReactComponent as DownloadIcon } from "../icons/download.svg";
import { ReactComponent as CloseIcon } from "../icons/close.svg";

interface RightDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  handleDownload: () => void;
  setShowScoresModal: (show: boolean) => void;
}

export const RightDrawer: React.FC<RightDrawerProps> = ({
  isOpen,
  onClose,
  children,
  handleDownload,
  setShowScoresModal,
}) => {
  return (
    <div className={`right-drawer ${isOpen ? "open" : ""}`}>
      <div className="drawer-header">
        <div className="drawer-actions">
          <button onClick={handleDownload} className="btn">
            <DownloadIcon />
            Download System
          </button>
          <button
            onClick={() => setShowScoresModal(true)}
            className="btn btn-secondary"
          >
            Scores Explained
          </button>
        </div>
        <button
          onClick={onClose}
          className="btn btn-icon-only btn-secondary"
          aria-label="Close"
        >
          <CloseIcon />
        </button>
      </div>
      {children}
    </div>
  );
};
