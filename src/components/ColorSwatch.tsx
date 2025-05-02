import React from "react";
import { ColorSwatch as ColorSwatchType } from "../types";
import "../styles/ColorSwatch.css";

interface ColorSwatchProps {
  swatch: ColorSwatchType;
  isActive: boolean;
  onLValueChange: (id: number, value: number) => void;
  onClick: (id: number) => void;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({
  swatch,
  isActive,
  onLValueChange,
  onClick,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    onLValueChange(swatch.id, value);
  };

  return (
    <div className="lightness-controls" data-ramp={swatch.id}>
      <div className="input-group">
        <div className="input-row">
          <div className="input-container">
            <input
              type="number"
              id={`l${swatch.id}`}
              min="0"
              max="100"
              value={swatch.lValue}
              onChange={handleInputChange}
            />
          </div>
          <div
            id={`colorSwatch${swatch.id}`}
            className={`color-swatch ${isActive ? "active" : ""}`}
            style={{ backgroundColor: swatch.hexColor }}
            onClick={() => onClick(swatch.id)}
          >
            <div className="hex-label">{swatch.hexColor}</div>
            <div className="reference-dots">
              <div className="reference-dot white-dot">
                {swatch.whiteContrast.toFixed(1)}:1
              </div>
              <div className="reference-dot black-dot">
                {swatch.blackContrast.toFixed(1)}:1
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorSwatch;
