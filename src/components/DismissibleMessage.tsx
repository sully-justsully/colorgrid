import React from "react";
import "../styles/DismissibleMessage.css";
import { ReactComponent as DiamondIcon } from "../icons/diamond.svg";

interface DismissibleMessageProps {
  onDismiss: () => void;
}

const DismissibleMessage: React.FC<DismissibleMessageProps> = ({
  onDismiss,
}) => (
  <div className="dismissible-message">
    <div className="dismissible-message-header">
      <span className="icon-wrapper">
        <DiamondIcon />
      </span>
      <span className="dismissible-message-title">Using Lightness Values</span>
    </div>
    <div className="dismissible-message-body">
      Colors with the same lightness value have the same contrast ratios. This
      methodology creates the backbone of your accessible color system. To get
      started, pick a hue and then start clicking dots on the grid to build your
      palette.
    </div>
    <button className="dismissible-message-dismiss" onClick={onDismiss}>
      Dismiss
    </button>
  </div>
);

export default DismissibleMessage;
