import React from "react";
import { ReactComponent as DownloadIcon } from "../icons/download.svg";
import { ReactComponent as CloseIcon } from "../icons/close.svg";
import { trackEvent, AnalyticsEvents } from "../utils/analytics";

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
          <button
            onClick={() => {
              handleDownload();
              trackEvent(AnalyticsEvents.DOWNLOAD_SYSTEM);
            }}
            className="btn"
          >
            <DownloadIcon />
            Download System
          </button>
          <button
            onClick={() => {
              setShowScoresModal(true);
              trackEvent(AnalyticsEvents.VIEW_SCORES);
            }}
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
