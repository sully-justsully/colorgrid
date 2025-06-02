import React from "react";
import "../styles/MainContent.css";

interface MainContentProps {
  children?: React.ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
  return (
    <main className="main-content">
      <div className="main-content-container">
        <div className="main-content-inner">{children}</div>
      </div>
    </main>
  );
};

export default MainContent;
