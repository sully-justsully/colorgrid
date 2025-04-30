import React, { useState, useCallback, useEffect, useRef } from "react";
import ColorGrid from "./components/ColorGrid";
import ColorSwatch from "./components/ColorSwatch";
import Toast from "./components/Toast";
import { ColorSwatch as ColorSwatchType, Dot } from "./types";
import { labToRgb, rgbToHex, calculateContrastRatio } from "./utils/colorUtils";
import "./App.css";

const initialLValues = [95, 85, 75, 65, 55, 45, 35, 25, 15, 5];

const guideSvg = `<svg width="2776" height="2776" viewBox="0 0 2776 2776" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M2775 2775C2775 2775 2775 707 2422 354C2069 1.00061 1.00098 1.00059 1.00098 1.00059" stroke="#545454" stroke-width="2"/>
  <path d="M2775 2775C2775 2775 2422 1062 2068 708C1714 354 1.00098 1.00049 1.00098 1.00049" stroke="#545454" stroke-width="2"/>
  <path d="M2775 2775C2775 2775 2068 1415 1715 1062C1362 709 1.00098 1.00049 1.00098 1.00049" stroke="#545454" stroke-width="2"/>
  <path d="M1 1L2775 2775" stroke="#545454" stroke-width="2"/>
  <path d="M1.00366 1.0022C1.00366 1.0022 708.003 1361 1061 1714C1414 2067 2775 2775 2775 2775" stroke="#545454" stroke-width="2"/>
  <path d="M1.00366 1.0022C1.00366 1.0022 354.003 1714 708.003 2068C1062 2422 2775 2775 2775 2775" stroke="#545454" stroke-width="2"/>
  <path d="M1.00162 1.00016C1.00162 1.00016 1.00242 2069 354.002 2422C707.001 2775 2775 2775 2775 2775" stroke="#545454" stroke-width="2"/>
</svg>`;

const App: React.FC = () => {
  const [hue, setHue] = useState(210);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isATextContrast, setIsATextContrast] = useState(false);
  const [isAATextContrast, setIsAATextContrast] = useState(false);
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
  const [showGuides, setShowGuides] = useState(false);
  const [showToast, setShowToast] = useState(false);

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

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHue(parseInt(e.target.value) || 0);
  };

  const handleFilterToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsFiltering(e.target.checked);
  };

  const handleTextContrastChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsATextContrast(e.target.checked);
    if (e.target.checked) {
      setIsAATextContrast(false);
    }
  };

  const handleAATextContrastChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsAATextContrast(e.target.checked);
    if (e.target.checked) {
      setIsATextContrast(false);
    }
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
    const swatchHeight = 40;
    const totalHeight = swatches.length * swatchHeight;

    let svgContent = `
      <svg width="${svgWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .swatch-text { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 14px;
            fill: #333;
          }
          .contrast-text {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 14px;
            fill: #333;
            text-anchor: end;
          }
          .l-value {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 14px;
            fill: #333;
          }
        </style>
    `;

    swatches.forEach((swatch, index) => {
      const y = index * swatchHeight;
      const colorName = `Color-${index * 50}`;

      // Add swatch rectangle
      svgContent += `
        <rect x="0" y="${y}" width="${svgWidth}" height="${swatchHeight}" fill="${
        swatch.hexColor
      }" />
        
        <!-- Color name and hex -->
        <text x="10" y="${y + 15}" class="swatch-text" fill="${
        swatch.lValue > 50 ? "#333" : "#fff"
      }">${colorName}</text>
        <text x="10" y="${y + 30}" class="swatch-text" fill="${
        swatch.lValue > 50 ? "#333" : "#fff"
      }">${swatch.hexColor}</text>
        
        <!-- L value -->
        <text x="10" y="${y + 45}" class="l-value" fill="${
        swatch.lValue > 50 ? "#333" : "#fff"
      }">L*=${swatch.lValue}</text>
        
        <!-- Contrast ratio -->
        <text x="${svgWidth - 10}" y="${y + 25}" class="contrast-text" fill="${
        swatch.lValue > 50 ? "#333" : "#fff"
      }">
          ${swatch.blackContrast.toFixed(1)}:1
        </text>
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
                <label>
                  <input
                    type="radio"
                    name="contrast"
                    checked={
                      !isATextContrast && !isAATextContrast && !showGuides
                    }
                    onChange={() => {
                      setIsATextContrast(false);
                      setIsAATextContrast(false);
                      setShowGuides(false);
                    }}
                  />
                  No Filter
                </label>
                <label>
                  <input
                    type="radio"
                    name="contrast"
                    checked={isATextContrast}
                    onChange={handleTextContrastChange}
                  />
                  3:1 Text
                </label>
                <label>
                  <input
                    type="radio"
                    name="contrast"
                    checked={isAATextContrast}
                    onChange={handleAATextContrastChange}
                  />
                  4.5:1 Text
                </label>
                <label>
                  <input
                    type="radio"
                    name="contrast"
                    checked={showGuides}
                    onChange={() => {
                      setShowGuides(true);
                      setIsATextContrast(false);
                      setIsAATextContrast(false);
                    }}
                  />
                  Simple Guides
                </label>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="main-container">
        <div className="left-drawer">
          <div className="drawer-content">
            <div className="drawer-section">
              <h3>Input Hue (0-359)</h3>
              <div className="hue-control">
                <div className="hue-input-group">
                  <input
                    type="number"
                    value={hue}
                    onChange={handleHueChange}
                    min="0"
                    max="359"
                  />
                </div>
                <button className="update-button">Update Hue</button>
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
              isATextContrast={isATextContrast}
              isAATextContrast={isAATextContrast}
              lValues={swatches.map((swatch) => swatch.lValue)}
              onDotClick={handleDotClick}
              activeDots={activeDots}
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
