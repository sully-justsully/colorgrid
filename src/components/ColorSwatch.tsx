import React, { useState, useEffect } from "react";
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
  const [inputValue, setInputValue] = useState(swatch.lValue.toString());

  // Update local state when prop changes
  useEffect(() => {
    setInputValue(swatch.lValue.toString());
  }, [swatch.lValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (newValue === "") {
      onLValueChange(swatch.id, 0);
    } else {
      const parsed = parseInt(newValue) || 0;
      onLValueChange(swatch.id, parsed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Escape") {
      e.currentTarget.blur();
      // Restore the actual value when blurring
      setInputValue(swatch.lValue.toString());
    }
  };

  const handleBlur = () => {
    // Restore the actual value when blurring
    setInputValue(swatch.lValue.toString());
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
