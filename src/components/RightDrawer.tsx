import React from "react";
import { ReactComponent as TrashIcon } from "../icons/trash.svg";
import { ReactComponent as EditIcon } from "../icons/edit.svg";

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
    <div
      className={`fixed right-0 top-0 h-full w-80 bg-white shadow-lg transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } transition-transform duration-300 ease-in-out z-50 p-4`}
    >
      <div className="drawer-header flex justify-between items-center mb-4 border-b pb-2">
        <div className="flex space-x-2">
          <button onClick={handleDownload} className="btn">
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
          X
        </button>
      </div>
      {children}
    </div>
  );
};
