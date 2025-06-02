import React from "react";
import "../styles/LeftDrawer.css";

interface LeftDrawerProps {
  children?: React.ReactNode;
}

const LeftDrawer: React.FC<LeftDrawerProps> = ({ children }) => {
  return (
    <div className="left-drawer">
      <div className="left-drawer-content">{children}</div>
    </div>
  );
};

export default LeftDrawer;
