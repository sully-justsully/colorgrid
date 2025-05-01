import React, { useState, useCallback, useEffect, useRef } from "react";
import ColorGrid from "./components/ColorGrid";
import ColorSwatch from "./components/ColorSwatch";
import Toast from "./components/Toast";
import { ColorSwatch as ColorSwatchType, Dot } from "./types";
import {
  labToRgb,
  rgbToHex,
  calculateContrastRatio,
  rgbToHsb,
} from "./utils/colorUtils";
import "./App.css";

const initialLValues = [95, 85, 75, 65, 55, 45, 35, 25, 15, 5];

const guideSvg = `<svg width="1110" height="1110" viewBox="0 0 1110 1110" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M1110 1110C1110 1110 1110 282 968 142C826 0.4 0.4 0.4 0.4 0.4" stroke="white" stroke-width="1"/>
  <path d="M1110 1110C1110 1110 968 424 826 282C684 142 0.4 0.4 0.4 0.4" stroke="white" stroke-width="1"/>
  <path d="M1110 1110C1110 1110 826 566 684 424C542 282 0.4 0.4 0.4 0.4" stroke="white" stroke-width="1"/>
  <path d="M0.4 0.4L1110 1110" stroke="white" stroke-width="1"/>
  <path d="M0.4 0.4C0.4 0.4 282 542 424 684C566 826 1110 1110 1110 1110" stroke="white" stroke-width="1"/>
  <path d="M0.4 0.4C0.4 0.4 142 684 282 826C424 968 1110 1110 1110 1110" stroke="white" stroke-width="1"/>
  <path d="M0.4 0.4C0.4 0.4 0.4 826 142 968C282 1110 1110 1110 1110 1110" stroke="white" stroke-width="1"/>
</svg>`;

const App: React.FC = () => {
  const [keyHexCode, setKeyHexCode] = useState("0080FF");
  const [inputHexCode, setInputHexCode] = useState("0080FF");
  const [hue, setHue] = useState(210);
  const [isFiltering, setIsFiltering] = useState(false);
  const [showGuides, setShowGuides] = useState(false);
  const [wcagLevel, setWcagLevel] = useState<"none" | "A" | "AA" | "AAA">(
    "none"
  );
  const [isPickingColor, setIsPickingColor] = useState(false);
  const [activeSwatchId, setActiveSwatchId] = useState<number | null>(null);
  const [activeDots, setActiveDots] = useState<Set<string>>(new Set());
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);
  const [swatches, setSwatches] = useState<ColorSwatchType[]>(
    initialLValues.map((lValue, index) => {
      const [r, g, b] = labToRgb(lValue);
      const hexColor = rgbToHex(r, g, b);
      return {
        id: index + 1,
        lValue,
        hexColor,
        whiteContrast: calculateContrastRatio(hexColor),
        blackContrast: calculateContrastRatio(hexColor, "#000000"),
      };
    })
  );
  const [showToast, setShowToast] = useState(false);
  const [isHexValid, setIsHexValid] = useState(true);
  const [isHexDirty, setIsHexDirty] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowFiltersDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleHexCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHexCode = e.target.value
      .replace(/[^0-9A-Fa-f]/g, "")
      .slice(0, 6)
      .toUpperCase();
    setInputHexCode(newHexCode);
    setIsHexValid(/^[0-9A-Fa-f]{6}$/.test(newHexCode));
    setIsHexDirty(newHexCode !== keyHexCode);
  };

  const updateHexCode = () => {
    if (isHexValid && isHexDirty) {
      setKeyHexCode(inputHexCode);
      const r = parseInt(inputHexCode.slice(0, 2), 16);
      const g = parseInt(inputHexCode.slice(2, 4), 16);
      const b = parseInt(inputHexCode.slice(4, 6), 16);
      const [h] = rgbToHsb(r, g, b);
      setHue(h);
      setIsHexDirty(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      updateHexCode();
    }
  };

  const handleFilterToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsFiltering(e.target.checked);
  };

  const handleWcagChange = (level: "none" | "A" | "AA" | "AAA") => {
    setWcagLevel(level);
  };

  const handleSwatchClick = (id: number) => {
    setIsPickingColor(!isPickingColor);
    setActiveSwatchId(isPickingColor ? null : id);
  };

  const handleLValueChange = (id: number, value: number) => {
    setSwatches((prevSwatches) =>
      prevSwatches.map((swatch) => {
        if (swatch.id === id) {
          const [r, g, b] = labToRgb(value);
          const hexColor = rgbToHex(r, g, b);
          return {
            ...swatch,
            lValue: value,
            hexColor,
            whiteContrast: calculateContrastRatio(hexColor),
            blackContrast: calculateContrastRatio(hexColor, "#000000"),
          };
        }
        return swatch;
      })
    );
  };

  const handleDotClick = useCallback(
    (dot: Dot) => {
      if (isPickingColor && activeSwatchId !== null) {
        setSwatches((prevSwatches) =>
          prevSwatches.map((swatch) => {
            if (swatch.id === activeSwatchId) {
              return {
                ...swatch,
                hexColor: dot.hexColor,
                whiteContrast: calculateContrastRatio(dot.hexColor),
                blackContrast: calculateContrastRatio(dot.hexColor, "#000000"),
              };
            }
            return swatch;
          })
        );
        setIsPickingColor(false);
        setActiveSwatchId(null);
      }

      // Copy hex code to clipboard
      navigator.clipboard.writeText(dot.hexColor).then(() => {
        setShowToast(true);
      });

      const dotKey = `${dot.row}-${dot.col}`;
      setActiveDots((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(dotKey)) {
          newSet.delete(dotKey);
        } else {
          newSet.add(dotKey);
        }
        return newSet;
      });
    },
    [isPickingColor, activeSwatchId]
  );

  const handleClearSelection = () => {
    setActiveDots(new Set());
  };

  const handleAddRamp = () => {
    setSwatches((prevSwatches) => {
      const lastSwatch = prevSwatches[prevSwatches.length - 1];
      const newLValue = Math.max(0, lastSwatch.lValue - 1); // Decrease by 1 from last swatch
      const [r, g, b] = labToRgb(newLValue);
      const hexColor = rgbToHex(r, g, b);

      return [
        ...prevSwatches,
        {
          id: prevSwatches.length + 1,
          lValue: newLValue,
          hexColor,
          whiteContrast: calculateContrastRatio(hexColor),
          blackContrast: calculateContrastRatio(hexColor, "#000000"),
        },
      ];
    });
  };

  const handleRemoveRamp = () => {
    setSwatches((prevSwatches) => {
      if (prevSwatches.length <= 1) return prevSwatches; // Don't remove if only one swatch remains
      return prevSwatches.slice(0, -1); // Remove last swatch
    });
  };

  const handleExportColors = () => {
    const svgWidth = 300;
    const swatchHeight = 80; // Increased height for more spacing
    const totalHeight = swatches.length * swatchHeight;
    const padding = 16;

    let svgContent = `
      <svg width="${svgWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .text {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 14px;
          }
          .color-name { font-size: 16px; }
          .hex-code { font-size: 14px; }
          .l-value { font-size: 14px; }
          .contrast-text { font-size: 14px; }
          .dot {
            height: 8px;
            width: 8px;
            rx: 4px;
            ry: 4px;
          }
        </style>
    `;

    swatches.forEach((swatch, index) => {
      const y = index * swatchHeight;
      const colorName = `Color-${index * 50}`;
      const textColor = swatch.lValue > 50 ? "#333" : "#fff";

      // Add swatch rectangle
      svgContent += `
        <rect x="0" y="${y}" width="${svgWidth}" height="${swatchHeight}" fill="${
        swatch.hexColor
      }" />
        
        <!-- Color name and number -->
        <text x="${padding}" y="${
        y + 20
      }" class="text color-name" fill="${textColor}">
          <tspan>Color</tspan><tspan dx="2">-${index * 50}</tspan>
        </text>

        <!-- Hex code -->
        <text x="${padding}" y="${
        y + 40
      }" class="text hex-code" fill="${textColor}">
          ${swatch.hexColor}
        </text>
        
        <!-- L value -->
        <text x="${padding}" y="${
        y + 65
      }" class="text l-value" fill="${textColor}">
          L*=${swatch.lValue}
        </text>
        
        <!-- White contrast ratio with dot -->
        <text x="${svgWidth - padding - 60}" y="${
        y + 20
      }" class="text contrast-text" fill="${textColor}">
          ${swatch.whiteContrast.toFixed(1)}:1
        </text>
        <rect class="dot" x="${svgWidth - padding - 12}" y="${
        y + 12
      }" fill="#FFFFFF" />

        <!-- Black contrast ratio with dot -->
        <text x="${svgWidth - padding - 60}" y="${
        y + 65
      }" class="text contrast-text" fill="${textColor}">
          ${swatch.blackContrast.toFixed(1)}:1
        </text>
        <rect class="dot" x="${svgWidth - padding - 12}" y="${
        y + 57
      }" fill="#000000" />
      `;
    });

    svgContent += "</svg>";

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "color-ramps.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getContrastFilter = () => {
    switch (wcagLevel) {
      case "A":
        return {
          isATextContrast: true,
          isAATextContrast: false,
          isAAATextContrast: false,
        };
      case "AA":
        return {
          isATextContrast: false,
          isAATextContrast: true,
          isAAATextContrast: false,
        };
      case "AAA":
        return {
          isATextContrast: false,
          isAATextContrast: false,
          isAAATextContrast: true,
        };
      default:
        return {
          isATextContrast: false,
          isAATextContrast: false,
          isAAATextContrast: false,
        };
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Color Grid Tool</h1>
        <div className="header-actions">
          <button onClick={handleExportColors}>Export All Colors</button>
          <div className="filters-dropdown" ref={dropdownRef}>
            <button
              onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
            >
              View Filters
            </button>
            {showFiltersDropdown && (
              <div className="dropdown-menu">
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={showGuides}
                    onChange={(e) => setShowGuides(e.target.checked)}
                  />
                  Simple Guides
                </label>
                <div className="wcag-filters">
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="wcag-level"
                      checked={wcagLevel === "none"}
                      onChange={() => handleWcagChange("none")}
                    />
                    No WCAG Filter
                  </label>
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="wcag-level"
                      checked={wcagLevel === "A"}
                      onChange={() => handleWcagChange("A")}
                    />
                    WCAG A (3:1)
                  </label>
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="wcag-level"
                      checked={wcagLevel === "AA"}
                      onChange={() => handleWcagChange("AA")}
                    />
                    WCAG AA (4.5:1)
                  </label>
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="wcag-level"
                      checked={wcagLevel === "AAA"}
                      onChange={() => handleWcagChange("AAA")}
                    />
                    WCAG AAA (7:1)
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="main-container">
        <div className="left-drawer">
          <div className="drawer-content">
            <div className="drawer-section">
              <h3>Key Hex Code</h3>
              <div className="hex-control">
                <div className="hex-input-group">
                  <input
                    type="text"
                    value={inputHexCode}
                    onChange={handleHexCodeChange}
                    onKeyPress={handleKeyPress}
                    placeholder="000000"
                  />
                  <button
                    onClick={updateHexCode}
                    className={isHexValid && isHexDirty ? "active" : "disabled"}
                    disabled={!isHexValid || !isHexDirty}
                  >
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="drawer-section">
              <div className="section-header">
                <h3>Filter by Color Ramp</h3>
                <label className="filter-toggle">
                  <input
                    type="checkbox"
                    checked={isFiltering}
                    onChange={handleFilterToggle}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <p>
                Color ramps are determined by a perceptual lightness value. When
                the filter is active, only colors with a L* value that matches
                one of the ramps will be displayed.
              </p>
              <div className="color-ramps">
                {swatches.map((swatch) => (
                  <ColorSwatch
                    key={swatch.id}
                    swatch={swatch}
                    isActive={swatch.id === activeSwatchId}
                    onLValueChange={handleLValueChange}
                    onClick={handleSwatchClick}
                  />
                ))}
              </div>
              <div className="ramp-actions">
                <button className="update-button" onClick={handleAddRamp}>
                  Add Ramp
                </button>
                <button
                  className="update-button remove-button"
                  onClick={handleRemoveRamp}
                >
                  Remove Ramp
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="main-content">
          <div className="grid-container">
            <ColorGrid
              hue={hue}
              isFiltering={isFiltering}
              {...getContrastFilter()}
              lValues={swatches.map((swatch) => swatch.lValue)}
              onDotClick={handleDotClick}
              activeDots={activeDots}
              keyHexCode={`#${keyHexCode}`}
            />
            {showGuides && (
              <div
                className="guide-overlay"
                dangerouslySetInnerHTML={{ __html: guideSvg }}
              />
            )}
          </div>
        </div>
      </div>
      {showToast && (
        <Toast
          message="Hex code copied to clipboard!"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default App;
