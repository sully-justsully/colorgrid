import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
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
import "./styles/Dot.css";
import "./styles/HexTooltip.css";
import "./styles/ExportStyles.css";

const STORAGE_KEY = "colorGridSwatches";
const HEX_STORAGE_KEY = "colorGridHexCode";

const initialLValues10 = [95, 85, 75, 65, 55, 45, 35, 25, 15, 5];
const initialLValues14 = [97, 93, 88, 79, 70, 62, 54, 46, 38, 30, 21, 12, 7, 4];
const initialLValues18 = [
  100, 98, 96, 93, 90, 82, 73, 65, 55, 45, 35, 27, 18, 10, 7, 4, 2, 0,
];

const guideSvg = `<svg width="1110" height="1110" viewBox="0 0 1110 1110" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M1110 1110C1110 1110 1110 282 968 142C826 0.4 0.4 0.4 0.4 0.4" stroke="white" stroke-width="1"/>
  <path d="M1110 1110C1110 1110 968 424 826 282C684 142 0.4 0.4 0.4 0.4" stroke="white" stroke-width="1"/>
  <path d="M1110 1110C1110 1110 826 566 684 424C542 282 0.4 0.4 0.4 0.4" stroke="white" stroke-width="1"/>
  <path d="M0.4 0.4L1110 1110" stroke="white" stroke-width="1"/>
  <path d="M0.4 0.4C0.4 0.4 282 542 424 684C566 826 1110 1110 1110 1110" stroke="white" stroke-width="1"/>
  <path d="M0.4 0.4C0.4 0.4 142 684 282 826C424 968 1110 1110 1110 1110" stroke="white" stroke-width="1"/>
  <path d="M0.4 0.4C0.4 0.4 0.4 826 142 968C282 1110 1110 1110 1110 1110" stroke="white" stroke-width="1"/>
</svg>`;

const createInitialSwatches = (lValues: number[]) => {
  return lValues.map((lValue, index) => {
    const [r, g, b] = labToRgb(lValue);
    const hexColor = rgbToHex(r, g, b);
    return {
      id: index + 1,
      lValue,
      hexColor,
      whiteContrast: calculateContrastRatio(hexColor),
      blackContrast: calculateContrastRatio(hexColor, "#000000"),
    };
  });
};

const App: React.FC = () => {
  const [keyHexCode, setKeyHexCode] = useState(() => {
    const savedHexCode = localStorage.getItem(HEX_STORAGE_KEY);
    return savedHexCode || "0080FF";
  });
  const [inputHexCode, setInputHexCode] = useState(keyHexCode);
  const [hue, setHue] = useState(() => {
    const r = parseInt(keyHexCode.slice(0, 2), 16);
    const g = parseInt(keyHexCode.slice(2, 4), 16);
    const b = parseInt(keyHexCode.slice(4, 6), 16);
    const [h] = rgbToHsb(r, g, b);
    return h;
  });
  const [isFiltering, setIsFiltering] = useState(false);
  const [showGuides, setShowGuides] = useState(false);
  const [wcagLevel, setWcagLevel] = useState<"none" | "A" | "AA" | "AAA">(
    "none"
  );
  const [isPickingColor, setIsPickingColor] = useState(false);
  const [activeSwatchId, setActiveSwatchId] = useState<number | null>(null);
  const [activeLValue, setActiveLValue] = useState<number | null>(null);
  const [activeDots, setActiveDots] = useState<Set<string>>(new Set());
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<"10" | "14" | "18">("10");
  const [swatches10, setSwatches10] = useState<ColorSwatchType[]>(() => {
    const savedSwatches = localStorage.getItem(STORAGE_KEY + "_10");
    if (savedSwatches) {
      try {
        return JSON.parse(savedSwatches);
      } catch (e) {
        console.error("Failed to parse saved swatches:", e);
        return createInitialSwatches(initialLValues10);
      }
    }
    return createInitialSwatches(initialLValues10);
  });
  const [swatches14, setSwatches14] = useState<ColorSwatchType[]>(() => {
    const savedSwatches = localStorage.getItem(STORAGE_KEY + "_14");
    if (savedSwatches) {
      try {
        return JSON.parse(savedSwatches);
      } catch (e) {
        console.error("Failed to parse saved swatches:", e);
        return createInitialSwatches(initialLValues14);
      }
    }
    return createInitialSwatches(initialLValues14);
  });
  const [swatches18, setSwatches18] = useState<ColorSwatchType[]>(() => {
    const savedSwatches = localStorage.getItem(STORAGE_KEY + "_18");
    if (savedSwatches) {
      try {
        return JSON.parse(savedSwatches);
      } catch (e) {
        console.error("Failed to parse saved swatches:", e);
        return createInitialSwatches(initialLValues18);
      }
    }
    return createInitialSwatches(initialLValues18);
  });
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + "_10", JSON.stringify(swatches10));
  }, [swatches10]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + "_14", JSON.stringify(swatches14));
  }, [swatches14]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + "_18", JSON.stringify(swatches18));
  }, [swatches18]);

  useEffect(() => {
    localStorage.setItem(HEX_STORAGE_KEY, keyHexCode);
  }, [keyHexCode]);

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

  const handleFilterToggle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsFiltering(e.target.checked);
    },
    []
  );

  const currentSwatches = useMemo(() => {
    return activeTab === "10"
      ? swatches10
      : activeTab === "14"
      ? swatches14
      : swatches18;
  }, [activeTab, swatches10, swatches14, swatches18]);

  const currentLValues = useMemo(() => {
    return currentSwatches.map((s) => s.lValue);
  }, [currentSwatches]);

  const handleWcagChange = (level: "none" | "A" | "AA" | "AAA") => {
    setWcagLevel(level);
  };

  const handleSwatchClick = (id: number) => {
    setIsPickingColor(!isPickingColor);
    if (!isPickingColor) {
      const swatch =
        activeTab === "10"
          ? swatches10
          : activeTab === "14"
          ? swatches14
          : swatches18;
      setActiveSwatchId(id);
      setActiveLValue(swatch.find((s) => s.id === id)?.lValue || null);
    } else {
      setActiveSwatchId(null);
      setActiveLValue(null);
    }
  };

  const handleLValueChange = (id: number, value: number) => {
    const setCurrentSwatches =
      activeTab === "10"
        ? setSwatches10
        : activeTab === "14"
        ? setSwatches14
        : setSwatches18;
    setCurrentSwatches((prevSwatches) =>
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
        const setCurrentSwatches =
          activeTab === "10"
            ? setSwatches10
            : activeTab === "14"
            ? setSwatches14
            : setSwatches18;
        setCurrentSwatches((prevSwatches) =>
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
    const setCurrentSwatches =
      activeTab === "10"
        ? setSwatches10
        : activeTab === "14"
        ? setSwatches14
        : setSwatches18;
    setCurrentSwatches((prevSwatches) => {
      const lastSwatch = prevSwatches[prevSwatches.length - 1];
      const newLValue = Math.max(0, lastSwatch.lValue - 1);
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
    const setCurrentSwatches =
      activeTab === "10"
        ? setSwatches10
        : activeTab === "14"
        ? setSwatches14
        : setSwatches18;
    setCurrentSwatches((prevSwatches) => {
      if (prevSwatches.length <= 1) return prevSwatches;
      return prevSwatches.slice(0, -1);
    });
  };

  const handleResetRamps = () => {
    switch (activeTab) {
      case "10":
        setSwatches10(createInitialSwatches(initialLValues10));
        break;
      case "14":
        setSwatches14(createInitialSwatches(initialLValues14));
        break;
      case "18":
        setSwatches18(createInitialSwatches(initialLValues18));
        break;
    }
  };

  const handleExportColors = () => {
    const svgWidth = 400;
    const swatchHeight = 120;
    const currentSwatches =
      activeTab === "10"
        ? swatches10
        : activeTab === "14"
        ? swatches14
        : swatches18;
    const totalHeight = currentSwatches.length * swatchHeight;

    let svgContent = `
      <svg width="${svgWidth}" height="${totalHeight}" viewBox="0 0 ${svgWidth} ${totalHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            @font-face {
              font-family: 'Inter';
              font-style: normal;
              font-weight: 400;
              src: local('Inter Regular'), local('Inter-Regular');
            }
            @font-face {
              font-family: 'Inter';
              font-style: normal;
              font-weight: 500;
              src: local('Inter Medium'), local('Inter-Medium');
            }
            .text {
              font-family: 'Inter', sans-serif;
              font-size: 14px;
              fill: currentColor;
            }
          </style>
        </defs>
    `;

    currentSwatches.forEach((swatch, index) => {
      const y = index * swatchHeight;
      const textColor = swatch.lValue > 50 ? "#000000" : "#FFFFFF";
      const colorNumber = index * 50;
      const colorName = `Cool Gray-${
        colorNumber < 10 ? "0" : ""
      }${colorNumber}`;

      svgContent += `
        <rect width="${svgWidth}" height="${swatchHeight}" y="${y}" fill="${
        swatch.hexColor
      }"/>
        
        <text x="18" y="${y + 33}" class="text" fill="${textColor}">
          ${colorName}
        </text>

        <text x="18" y="${y + 54}" class="text" fill="${textColor}">
          #${swatch.hexColor.toUpperCase()}
        </text>
        
        <text x="18" y="${y + 108}" class="text" fill="${textColor}">
          L*=${Math.round(swatch.lValue)}
        </text>
        
        <text x="330" y="${
          y + 33
        }" class="text" text-anchor="end" fill="${textColor}">
          ${swatch.whiteContrast.toFixed(1)}:1
        </text>
        <circle cx="376" cy="${y + 33}" r="8" fill="#FFFFFF"/>
        <circle cx="376" cy="${
          y + 33
        }" r="8.25" stroke="${textColor}" stroke-opacity="0.16" stroke-width="0.5"/>

        <text x="330" y="${
          y + 108
        }" class="text" text-anchor="end" fill="${textColor}">
          ${swatch.blackContrast.toFixed(1)}:1
        </text>
        <circle cx="376" cy="${y + 81}" r="8" fill="#000000"/>
        <circle cx="376" cy="${
          y + 81
        }" r="8.25" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="0.5"/>
      `;
    });

    svgContent += "</svg>";

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `color-ramps-${activeTab}.svg`;
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

  const handleTabChange = (tab: "10" | "14" | "18") => {
    setActiveTab(tab);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          Color Grid Tool
          <span className="version-number">v.1.8</span>
        </h1>
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
                    type="color"
                    value={`#${inputHexCode}`}
                    onChange={(e) => {
                      const newHex = e.target.value.slice(1).toUpperCase();
                      setInputHexCode(newHex);
                      setIsHexValid(true);
                      setIsHexDirty(newHex !== keyHexCode);
                      if (newHex !== keyHexCode) {
                        setKeyHexCode(newHex);
                        const r = parseInt(newHex.slice(0, 2), 16);
                        const g = parseInt(newHex.slice(2, 4), 16);
                        const b = parseInt(newHex.slice(4, 6), 16);
                        const [h] = rgbToHsb(r, g, b);
                        setHue(h);
                      }
                    }}
                    className="color-picker"
                    title="Pick a color"
                  />
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
              <div className="ramp-tabs">
                <button
                  className={`tab-button ${activeTab === "10" ? "active" : ""}`}
                  onClick={() => handleTabChange("10")}
                >
                  10 ramps
                </button>
                <button
                  className={`tab-button ${activeTab === "14" ? "active" : ""}`}
                  onClick={() => handleTabChange("14")}
                >
                  14 ramps
                </button>
                <button
                  className={`tab-button ${activeTab === "18" ? "active" : ""}`}
                  onClick={() => handleTabChange("18")}
                >
                  18 ramps
                </button>
              </div>
              <div className="color-ramps">
                {activeTab === "10"
                  ? swatches10.map((swatch) => (
                      <ColorSwatch
                        key={swatch.id}
                        swatch={swatch}
                        isActive={swatch.id === activeSwatchId}
                        onLValueChange={handleLValueChange}
                        onClick={handleSwatchClick}
                      />
                    ))
                  : activeTab === "14"
                  ? swatches14.map((swatch) => (
                      <ColorSwatch
                        key={swatch.id}
                        swatch={swatch}
                        isActive={swatch.id === activeSwatchId}
                        onLValueChange={handleLValueChange}
                        onClick={handleSwatchClick}
                      />
                    ))
                  : swatches18.map((swatch) => (
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
                <button
                  className="update-button reset-button"
                  onClick={handleResetRamps}
                  title="Reset to default ramps"
                >
                  Reset Ramps
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
              isATextContrast={wcagLevel === "A"}
              isAATextContrast={wcagLevel === "AA"}
              isAAATextContrast={wcagLevel === "AAA"}
              lValues={currentLValues}
              onDotClick={handleDotClick}
              activeDots={activeDots}
              keyHexCode={keyHexCode}
              isPickingColor={isPickingColor}
              activeLValue={activeLValue}
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
