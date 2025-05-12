import React, { useEffect } from "react";
import "../styles/Toast.css";
import { calculateContrastRatio } from "../utils/colorUtils";

interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
  backgroundColor?: string;
}

const Toast: React.FC<ToastProps> = ({
  message,
  duration = 3000,
  onClose,
  backgroundColor = "#333",
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Calculate contrast ratio with white to determine text color
  const contrastWithWhite = calculateContrastRatio(backgroundColor);
  const textColor = contrastWithWhite >= 4.5 ? "#FFFFFF" : "#000000";

  return (
    <div className="toast" style={{ backgroundColor, color: textColor }}>
      {message}
    </div>
  );
};

export default Toast;
