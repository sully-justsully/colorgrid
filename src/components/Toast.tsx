import React from "react";
import { hexToLabLightness } from "../utils/colorUtils";
import "../styles/Toast.css";

interface ToastProps {
  message: string;
  backgroundColor: string;
}

const Toast: React.FC<ToastProps> = ({ message, backgroundColor }) => {
  const lValue = hexToLabLightness(backgroundColor);
  const textColor = lValue >= 50 ? "#000000" : "#FFFFFF";

  return (
    <div
      className="toast"
      style={{
        backgroundColor,
        color: textColor,
      }}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {message}
    </div>
  );
};

export default Toast;
