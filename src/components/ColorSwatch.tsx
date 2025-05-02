import React, { useState } from "react";
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
  const [inputValue, setInputValue] = useState<string>(
    swatch.lValue.toString()
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Escape") {
      const value =
        inputValue === "" ? swatch.lValue : parseInt(inputValue) || 0;
      onLValueChange(swatch.id, value);
      setInputValue(value.toString());
      e.currentTarget.blur();
    }
  };

  const handleBlur = () => {
    const value = inputValue === "" ? swatch.lValue : parseInt(inputValue) || 0;
    onLValueChange(swatch.id, value);
    setInputValue(value.toString());
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
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
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
