import React, { useState, useEffect } from "react";
import { ReactComponent as RemoveIcon } from "../icons/remove.svg";
import { hexToLabLightness, calculateContrastRatio } from "../utils/colorUtils";
import "../styles/ColorSwatch.css";
import "../styles/HexInputRow.css";

interface HexInputRowProps {
  id: number;
  initialHex: string;
  onHexChange: (id: number, hex: string) => void;
  onRemove: (id: number) => void;
  isFirstRow?: boolean;
}

const HexInputRow: React.FC<HexInputRowProps> = ({
  id,
  initialHex,
  onHexChange,
  onRemove,
  isFirstRow = false,
}) => {
  const [hexValue, setHexValue] = useState(initialHex);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setHexValue(initialHex);
  }, [initialHex]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value
      .replace(/[^0-9A-Fa-f]/g, "")
      .slice(0, 6)
      .toUpperCase();
    setHexValue(newHex);
    const isValidHex = /^[0-9A-Fa-f]{6}$/.test(newHex);
    setIsValid(isValidHex);
    if (isValidHex) {
      onHexChange(id, newHex);
    }
  };

  const lValue = hexToLabLightness(`#${hexValue}`);
  const whiteContrast = calculateContrastRatio(`#${hexValue}`);
  const blackContrast = calculateContrastRatio(`#${hexValue}`, "#000000");

  return (
    <div className="hex-input-row">
      <div className="hex-input-group input-flex-center">
        <input
          type="text"
          value={hexValue}
          onChange={handleHexChange}
          placeholder="000000"
          className={`standard-input input-prefix-hex ${
            !isValid ? "error" : ""
          }`}
        />
      </div>
      <div
        className="color-swatch"
        aria-label={`Color swatch #${hexValue}`}
        tabIndex={-1}
        style={{ backgroundColor: `#${hexValue}` }}
      >
        <div className="hex-label" aria-hidden="true">
          L*: {Math.round(lValue)}
        </div>
        <div className="reference-dots" aria-hidden="true">
          <div className="reference-dot white-dot">
            {whiteContrast.toFixed(1)}:1
          </div>
          <div className="reference-dot black-dot">
            {blackContrast.toFixed(1)}:1
          </div>
        </div>
      </div>
      <button
        className="btn btn-icon-only btn-destructive small"
        onClick={() => onRemove(id)}
        aria-label="Remove color"
      >
        <RemoveIcon />
      </button>
    </div>
  );
};

export default HexInputRow;
