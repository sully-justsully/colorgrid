import React from "react";

export interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

declare const Modal: React.FC<ModalProps>;
export default Modal;
