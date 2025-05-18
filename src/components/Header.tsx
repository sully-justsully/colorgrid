import React from "react";
import "../styles/Header.css";
import { ReactComponent as SunIcon } from "../assets/sun.svg";
import { ReactComponent as MoonIcon } from "../assets/moon.svg";

interface HeaderProps {
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

const Header: React.FC<HeaderProps> = ({ onThemeToggle, isDarkMode }) => {
  return (
    <header className="header">
      <div className="header-content">
        <h1>Color Grid</h1>
        <div className="header-actions">
          <button
            className="btn btn-secondary btn-icon-only"
            onClick={onThemeToggle}
            aria-label={
              isDarkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {isDarkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
