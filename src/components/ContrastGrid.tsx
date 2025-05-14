import React from "react";
import { ColorSwatch as ColorSwatchType } from "../types";
import { calculateContrastRatio } from "../utils/colorUtils";
import "../styles/ContrastGrid.css";

// Outlined check and X icons, 12x12px
const CHECK_ICON = (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    style={{ display: "inline", verticalAlign: "middle" }}
  >
    <circle cx="8" cy="8" r="7" stroke="#4CAF50" strokeWidth="2" fill="none" />
    <path
      d="M4.5 8.5L7 11L11.5 6.5"
      stroke="#4CAF50"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);
const X_ICON = (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    style={{ display: "inline", verticalAlign: "middle" }}
  >
    <circle cx="8" cy="8" r="7" stroke="#e53935" strokeWidth="2" fill="none" />
    <path
      d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5"
      stroke="#e53935"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const tileSize = 80;
const fontSize = 12;

const ContrastGrid: React.FC<{
  swatches: ColorSwatchType[];
  title?: string;
}> = ({ swatches }) => {
  return (
    <div className="contrast-grid__wrapper">
      <div
        className="contrast-grid"
        style={{
          gridTemplateColumns: `repeat(${swatches.length + 1}, ${tileSize}px)`,
          gridAutoRows: `${tileSize}px`,
        }}
      >
        {/* Top-left empty tile */}
        <div className="contrast-grid__tile contrast-grid__tile--empty" />
        {/* Top row: hex code tiles */}
        {swatches.map((swatch, colIdx) => (
          <div
            key={`col-header-${colIdx}`}
            className="contrast-grid__tile contrast-grid__tile--header"
            style={{
              background: swatch.hexColor,
              color: swatch.lValue < 50 ? "#fff" : "#000",
            }}
          >
            {swatch.hexColor.toUpperCase()}
          </div>
        ))}
        {/* Rows */}
        {swatches.map((rowSwatch, rowIdx) => [
          // First column: hex code tile
          <div
            key={`row-header-${rowIdx}`}
            className="contrast-grid__tile contrast-grid__tile--header"
            style={{
              background: rowSwatch.hexColor,
              color: rowSwatch.lValue < 50 ? "#fff" : "#000",
            }}
          >
            {rowSwatch.hexColor.toUpperCase()}
          </div>,
          // Contrast tiles
          ...swatches.map((colSwatch, colIdx) => {
            if (
              colSwatch.hexColor.toLowerCase() ===
              rowSwatch.hexColor.toLowerCase()
            ) {
              return (
                <div
                  key={`cell-${rowIdx}-${colIdx}`}
                  className="contrast-grid__tile contrast-grid__tile--empty"
                  style={{ background: "#181818" }}
                />
              );
            }
            const contrast = calculateContrastRatio(
              colSwatch.hexColor,
              rowSwatch.hexColor
            );
            const passesAA = contrast >= 4.5;
            const passesA = contrast >= 3;
            const labelColor = rowSwatch.lValue >= 50 ? "#000" : "#fff";
            return (
              <div
                key={`cell-${rowIdx}-${colIdx}`}
                className="contrast-grid__tile contrast-grid__tile--contrast"
                style={{
                  background: rowSwatch.hexColor,
                  color: colSwatch.hexColor,
                }}
              >
                <span className="contrast-grid__ratio">
                  {contrast.toFixed(1)}:1
                </span>
                <div className="contrast-grid__row">
                  {passesA ? CHECK_ICON : X_ICON}
                  <span
                    className="contrast-grid__label"
                    style={{ color: labelColor }}
                  >
                    A
                  </span>
                </div>
                <div className="contrast-grid__row">
                  {passesAA ? CHECK_ICON : X_ICON}
                  <span
                    className="contrast-grid__label"
                    style={{ color: labelColor }}
                  >
                    AA
                  </span>
                </div>
              </div>
            );
          }),
        ])}
      </div>
    </div>
  );
};

export default ContrastGrid;
