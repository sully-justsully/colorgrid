"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
require("../styles/Header.css");
const sun_svg_1 = require("../assets/sun.svg");
const moon_svg_1 = require("../assets/moon.svg");
const Header = ({ onThemeToggle, isDarkMode }) => {
    return (<header className="header">
      <div className="header-content">
        <h1>Color Grid</h1>
        <div className="header-actions">
          <button className="btn btn-secondary btn-icon-only" onClick={onThemeToggle} aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}>
            {isDarkMode ? <sun_svg_1.ReactComponent /> : <moon_svg_1.ReactComponent />}
          </button>
        </div>
      </div>
    </header>);
};
exports.default = Header;
