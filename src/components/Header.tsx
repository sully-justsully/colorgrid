import React from "react";
import "../styles/Header.css";
import { ReactComponent as SunIcon } from "../icons/light_mode.svg";
import { ReactComponent as MoonIcon } from "../icons/dark_mode.svg";
import { ReactComponent as FigmaIcon } from "../icons/figma.svg";
import { ReactComponent as GridIcon } from "../icons/grid.svg";
import { ReactComponent as EyeIcon } from "../icons/eye.svg";
import { ReactComponent as ColorIcon } from "../icons/color.svg";

interface HeaderProps {
  onThemeToggle: () => void;
  isDarkMode: boolean;
  version: string;
  onFigmaClick: () => void;
  onContrastGridClick: () => void;
  onColorSystemClick: () => void;
  onWcagFilterClick: () => void;
  showFiltersDropdown: boolean;
  wcagLevel: "none" | "A" | "AA" | "AAA";
  handleWcagChange: (level: "none" | "A" | "AA" | "AAA") => void;
  setShowFiltersDropdown: (show: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({
  onThemeToggle,
  isDarkMode,
  version,
  onFigmaClick,
  onContrastGridClick,
  onColorSystemClick,
  onWcagFilterClick,
  showFiltersDropdown,
  wcagLevel,
  handleWcagChange,
  setShowFiltersDropdown,
}) => {
  return (
    <header className="app-header">
      <button
        className="btn btn-secondary btn-icon-only"
        onClick={onThemeToggle}
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? <SunIcon /> : <MoonIcon />}
      </button>
      <div className="app-title">
        <h1>
          Color Grid Tool
          <span className="version-number">v.{version}</span>
        </h1>
        <div className="made-by">
          Made by{" "}
          <a
            href="https://www.sullydesigns.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sully
          </a>
        </div>
      </div>
      <div className="header-actions">
        <button onClick={onFigmaClick} className="btn btn-secondary">
          <FigmaIcon /> Get Figma File
        </button>
        <button onClick={onContrastGridClick} className="btn btn-secondary">
          <GridIcon /> View Contrast Grid
        </button>
        <div className="filters-dropdown">
          <button onClick={onWcagFilterClick} className="btn btn-secondary">
            <EyeIcon /> WCAG Filters
          </button>
          {showFiltersDropdown && (
            <div className="dropdown-menu">
              <div className="wcag-filters">
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={wcagLevel === "A"}
                    onChange={() =>
                      handleWcagChange(wcagLevel === "A" ? "none" : "A")
                    }
                  />
                  WCAG A (3:1)
                </label>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={wcagLevel === "AA"}
                    onChange={() =>
                      handleWcagChange(wcagLevel === "AA" ? "none" : "AA")
                    }
                  />
                  WCAG AA (4.5:1)
                </label>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={wcagLevel === "AAA"}
                    onChange={() =>
                      handleWcagChange(wcagLevel === "AAA" ? "none" : "AAA")
                    }
                  />
                  WCAG AAA (7:1)
                </label>
              </div>
            </div>
          )}
        </div>
        <button className="btn" onClick={onColorSystemClick}>
          <ColorIcon /> Color System
        </button>
      </div>
    </header>
  );
};

export default Header;
