import React from "react";

export interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  /** Optional ref to focus an element inside the modal, e.g., a button */
  initialFocusRef?: React.RefObject<HTMLElement>;
}

declare const Modal: React.FC<ModalProps>;
export default Modal;
