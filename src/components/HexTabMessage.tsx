import React from "react";
import "../styles/DismissibleMessage.css";
import { ReactComponent as DiamondIcon } from "../icons/diamond.svg";

interface HexTabMessageProps {
  onDismiss: () => void;
}

const HexTabMessage: React.FC<HexTabMessageProps> = ({ onDismiss }) => (
  <div className="dismissible-message">
    <div className="dismissible-message-header">
      <span className="icon-wrapper">
        <DiamondIcon />
      </span>
      <span className="dismissible-message-title">Using HEX Codes</span>
    </div>
    <div className="dismissible-message-body">
      This option is here in case you want to upload your current color palette
      and see the scores when you save your palette. I suggest using Lightness
      Values to build any new color palettes though.
    </div>
    <button className="dismissible-message-dismiss" onClick={onDismiss}>
      Dismiss
    </button>
  </div>
);

export default HexTabMessage;
