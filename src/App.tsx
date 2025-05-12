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
import MobileLayout from "./components/MobileLayout";
import { ColorSwatch as ColorSwatchType, Dot } from "./types";
import {
  labToRgb,
  rgbToHex,
  calculateContrastRatio,
  rgbToHsb,
  hexToHsb,
  hsbToRgb,
  getRgbLabLightness,
} from "./utils/colorUtils";
import "./App.css";
import "./styles/Dot.css";
import "./styles/HexTooltip.css";
import "./styles/ExportStyles.css";
import Modal from "./components/Modal";
import "./styles/Modal.css";
import packageJson from "../package.json";
import { Routes, Route, useLocation } from "react-router-dom";
import ContrastGrid from "./components/ContrastGrid";

const STORAGE_KEY = "colorGridSwatches";
const HEX_STORAGE_KEY = "colorGridHexCode";

const initialLValuesSimple = [100, 95, 85, 75, 65, 55, 45, 35, 25, 15, 5, 0];
const initialLValuesAdvanced = [
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

const createInitialSwatches = (lValues: number[], hexCode?: string) => {
  if (hexCode) {
    // For Custom mode, create a single swatch with the L* value from the hex code
    const r = parseInt(hexCode.slice(0, 2), 16);
    const g = parseInt(hexCode.slice(2, 4), 16);
    const b = parseInt(hexCode.slice(4, 6), 16);
    const lValue = Math.round(getRgbLabLightness(r, g, b));
    return [
      {
        id: 1,
        lValue,
        hexColor: `#${hexCode}`,
        whiteContrast: calculateContrastRatio(`#${hexCode}`),
        blackContrast: calculateContrastRatio(`#${hexCode}`, "#000000"),
      },
    ];
  }
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
  const [hslValues, setHslValues] = useState(() => {
    const { h, s, b } = hexToHsb(keyHexCode);
    return { h, s, b };
  });
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
  const [activeTab, setActiveTab] = useState<"simple" | "custom" | "advanced">(
    "simple"
  );
  const [swatchesSimple, setSwatchesSimple] = useState<ColorSwatchType[]>(
    () => {
      const savedSwatches = localStorage.getItem(STORAGE_KEY + "_simple");
      if (savedSwatches) {
        try {
          return JSON.parse(savedSwatches);
        } catch (e) {
          console.error("Failed to parse saved swatches:", e);
          return createInitialSwatches(initialLValuesSimple);
        }
      }
      return createInitialSwatches(initialLValuesSimple);
    }
  );
  const [swatchesCustom, setSwatchesCustom] = useState<ColorSwatchType[]>(
    () => {
      return createInitialSwatches([100], keyHexCode);
    }
  );
  const [swatchesAdvanced, setSwatchesAdvanced] = useState<ColorSwatchType[]>(
    () => {
      const savedSwatches = localStorage.getItem(STORAGE_KEY + "_advanced");
      if (savedSwatches) {
        try {
          return JSON.parse(savedSwatches);
        } catch (e) {
          console.error("Failed to parse saved swatches:", e);
          return createInitialSwatches(initialLValuesAdvanced);
        }
      }
      return createInitialSwatches(initialLValuesAdvanced);
    }
  );
  const [showToast, setShowToast] = useState(false);
  const [toastHexCode, setToastHexCode] = useState("#333");
  const [isHexValid, setIsHexValid] = useState(true);
  const [isHexDirty, setIsHexDirty] = useState(false);
  const [showColorPickModal, setShowColorPickModal] = useState(() => {
    return !localStorage.getItem("colorPickModalShown");
  });
  const [modalPage, setModalPage] = useState(0);
  const [rampTabClicked, setRampTabClicked] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

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
    localStorage.setItem(
      STORAGE_KEY + "_simple",
      JSON.stringify(swatchesSimple)
    );
  }, [swatchesSimple]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY + "_advanced",
      JSON.stringify(swatchesAdvanced)
    );
  }, [swatchesAdvanced]);

  useEffect(() => {
    localStorage.setItem(HEX_STORAGE_KEY, keyHexCode);
    // Update Custom mode swatches when key hex code changes
    if (activeTab === "custom") {
      const r = parseInt(keyHexCode.slice(0, 2), 16);
      const g = parseInt(keyHexCode.slice(2, 4), 16);
      const b = parseInt(keyHexCode.slice(4, 6), 16);
      const lValue = Math.round(getRgbLabLightness(r, g, b));

      setSwatchesCustom((prevSwatches) => {
        // Update only the swatch with ID 1 (key hex code swatch)
        return prevSwatches.map((swatch) =>
          swatch.id === 1
            ? {
                ...swatch,
                lValue,
                hexColor: `#${keyHexCode}`,
                whiteContrast: calculateContrastRatio(`#${keyHexCode}`),
                blackContrast: calculateContrastRatio(
                  `#${keyHexCode}`,
                  "#000000"
                ),
              }
            : swatch
        );
      });
    }
  }, [keyHexCode]);

  useEffect(() => {
    if (showColorPickModal) {
      localStorage.setItem("colorPickModalShown", "true");
    }
  }, [showColorPickModal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPickingColor) {
        setIsPickingColor(false);
        setActiveSwatchId(null);
        setActiveLValue(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPickingColor]);

  // Turn on filter after 320ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFiltering(true);
    }, 320);
    return () => clearTimeout(timer);
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
      const { h, s, b } = hexToHsb(inputHexCode);
      setHslValues({ h, s, b });
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
    return activeTab === "simple"
      ? swatchesSimple
      : activeTab === "custom"
      ? swatchesCustom
      : swatchesAdvanced;
  }, [activeTab, swatchesSimple, swatchesCustom, swatchesAdvanced]);

  const currentLValues = useMemo(() => {
    return currentSwatches.map((s) => s.lValue);
  }, [currentSwatches]);

  const handleWcagChange = (level: "none" | "A" | "AA" | "AAA") => {
    setWcagLevel(level);
  };

  const handleSwatchClick = (id: number) => {
    // For all tabs, toggle the active state
    if (isPickingColor && activeSwatchId === id) {
      // If clicking the same swatch while picking, deactivate it
      setIsPickingColor(false);
      setActiveSwatchId(null);
      setActiveLValue(null);
    } else {
      // If clicking a different swatch or not picking, activate it
      setIsPickingColor(true);
      setActiveSwatchId(id);

      // Get the correct swatch array based on active tab
      const swatchArray =
        activeTab === "simple"
          ? swatchesSimple
          : activeTab === "advanced"
          ? swatchesAdvanced
          : swatchesCustom;

      // Find the swatch with the matching ID
      const selectedSwatch = swatchArray.find((s) => s.id === id);
      if (selectedSwatch) {
        setActiveLValue(selectedSwatch.lValue);

        // Track color picker activation
        if (typeof window.gtag !== "undefined") {
          window.gtag("event", "color_picker_activate", {
            grid_size: activeTab,
            swatch_id: id,
            l_value: selectedSwatch.lValue,
            hex_color: selectedSwatch.hexColor,
          });
        }
      }
    }
  };

  const handleLValueChange = (id: number, value: number) => {
    const setCurrentSwatches =
      activeTab === "simple"
        ? setSwatchesSimple
        : activeTab === "advanced"
        ? setSwatchesAdvanced
        : setSwatchesCustom;
    setCurrentSwatches((prevSwatches) =>
      prevSwatches
        .map((swatch) => {
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
        .sort((a, b) => b.lValue - a.lValue)
    );
    // Update activeLValue if this is the active swatch
    if (id === activeSwatchId) {
      setActiveLValue(value);
    }
  };

  const handleDotClick = useCallback(
    (dot: Dot) => {
      if (isPickingColor && activeSwatchId !== null) {
        const setCurrentSwatches =
          activeTab === "simple"
            ? setSwatchesSimple
            : activeTab === "advanced"
            ? setSwatchesAdvanced
            : setSwatchesCustom;

        setCurrentSwatches((prevSwatches) =>
          prevSwatches.map((swatch) =>
            swatch.id === activeSwatchId
              ? {
                  ...swatch,
                  hexColor: dot.hexColor,
                  whiteContrast: calculateContrastRatio(dot.hexColor),
                  blackContrast: calculateContrastRatio(
                    dot.hexColor,
                    "#000000"
                  ),
                }
              : swatch
          )
        );

        // Track color selection
        if (typeof window.gtag !== "undefined") {
          window.gtag("event", "color_selected", {
            grid_size: activeTab,
            swatch_id: activeSwatchId,
            selected_hex: dot.hexColor,
            l_value: dot.labLightness,
            hsb_text: dot.hsbText,
          });
        }

        setIsPickingColor(false);
        setActiveSwatchId(null);
      }

      // Copy hex code to clipboard
      navigator.clipboard.writeText(dot.hexColor).then(() => {
        setToastHexCode(dot.hexColor);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);

        // Track color copy
        if (typeof window.gtag !== "undefined") {
          window.gtag("event", "color_copied", {
            hex_color: dot.hexColor,
            l_value: dot.labLightness,
            hsb_text: dot.hsbText,
          });
        }
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
    [isPickingColor, activeSwatchId, activeTab]
  );

  const handleAddRamp = () => {
    const setCurrentSwatches =
      activeTab === "simple"
        ? setSwatchesSimple
        : activeTab === "advanced"
        ? setSwatchesAdvanced
        : setSwatchesCustom;
    setCurrentSwatches((prevSwatches) => {
      // Find the lowest L* value in the current swatches
      const lowestLValue = Math.min(
        ...prevSwatches.map((swatch) => swatch.lValue)
      );
      const newLValue = Math.max(0, lowestLValue - 1);
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
      activeTab === "simple"
        ? setSwatchesSimple
        : activeTab === "advanced"
        ? setSwatchesAdvanced
        : setSwatchesCustom;
    setCurrentSwatches((prevSwatches) => {
      if (prevSwatches.length <= 1) return prevSwatches;
      return prevSwatches.slice(0, -1);
    });
  };

  const handleResetRamps = () => {
    switch (activeTab) {
      case "simple":
        setSwatchesSimple(createInitialSwatches(initialLValuesSimple));
        break;
      case "custom":
        // Reset to only show the key hex code ramp
        const r = parseInt(keyHexCode.slice(0, 2), 16);
        const g = parseInt(keyHexCode.slice(2, 4), 16);
        const b = parseInt(keyHexCode.slice(4, 6), 16);
        const lValue = Math.round(getRgbLabLightness(r, g, b));
        setSwatchesCustom([
          {
            id: 1,
            lValue,
            hexColor: `#${keyHexCode}`,
            whiteContrast: calculateContrastRatio(`#${keyHexCode}`),
            blackContrast: calculateContrastRatio(`#${keyHexCode}`, "#000000"),
          },
        ]);
        break;
      case "advanced":
        setSwatchesAdvanced(createInitialSwatches(initialLValuesAdvanced));
        break;
    }
    setActiveDots(new Set());
  };

  const handleExportColors = () => {
    // Track the export event
    if (typeof window.gtag !== "undefined") {
      window.gtag("event", "export_svg", {
        method: "SVG",
        grid_size: activeTab,
        color_count: currentSwatches.length,
        wcag_level: wcagLevel,
      });
    }

    const svgWidth = 400; // Core swatch width
    const swatchHeight = 120; // Core swatch height
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
      const textColor = swatch.lValue >= 50 ? "#000000" : "#FFFFFF";
      const colorNumber = index * 50;
      const colorName = `Color-${colorNumber < 10 ? "0" : ""}${colorNumber}`;

      // Core swatch rectangle
      svgContent += `
        <rect width="${svgWidth}" height="${swatchHeight}" y="${y}" fill="${
        swatch.hexColor
      }"/>
        
        <!-- Left side text -->
        <text x="16" y="${y + 28}" class="text" fill="${textColor}">
          ${colorName}
        </text>
        <text x="16" y="${y + 47}" class="text" fill="${textColor}">
          ${swatch.hexColor.toUpperCase()}
        </text>
        <text x="16" y="${y + 101}" class="text" fill="${textColor}">
          L*=${Math.round(swatch.lValue)}
        </text>
        
        <!-- Right side contrast ratios and dots -->
        <text x="360" y="${
          y + 77
        }" class="text" text-anchor="end" fill="${textColor}">
          ${swatch.whiteContrast.toFixed(1)}:1
        </text>
        <circle cx="376" cy="${y + 72}" r="8" fill="#FFFFFF"/>
        <circle cx="376" cy="${
          y + 72
        }" r="8.25" stroke="${textColor}" stroke-opacity="0.16" stroke-width="0.5"/>

        <text x="360" y="${
          y + 101
        }" class="text" text-anchor="end" fill="${textColor}">
          ${swatch.blackContrast.toFixed(1)}:1
        </text>
        <circle cx="376" cy="${y + 96}" r="8" fill="#000000"/>
        <circle cx="376" cy="${
          y + 96
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

  const handleTabChange = (tab: "simple" | "custom" | "advanced") => {
    setActiveTab(tab);
  };

  // Add new function to handle HSL changes
  const handleHslChange = (type: "h" | "s" | "b", value: number) => {
    const newHslValues = { ...hslValues, [type]: value };
    setHslValues(newHslValues);

    // Convert HSL back to hex
    const h = newHslValues.h;
    const s = newHslValues.s / 100;
    const v = newHslValues.b / 100;

    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r = 0,
      g = 0,
      b = 0;

    if (h >= 0 && h < 60) {
      [r, g, b] = [c, x, 0];
    } else if (h >= 60 && h < 120) {
      [r, g, b] = [x, c, 0];
    } else if (h >= 120 && h < 180) {
      [r, g, b] = [0, c, x];
    } else if (h >= 180 && h < 240) {
      [r, g, b] = [0, x, c];
    } else if (h >= 240 && h < 300) {
      [r, g, b] = [x, 0, c];
    } else {
      [r, g, b] = [c, 0, x];
    }

    const newHex = rgbToHex(
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    )
      .slice(1)
      .toUpperCase();

    setInputHexCode(newHex);
    setKeyHexCode(newHex);
    setHue(h);
    setIsHexValid(true);
    setIsHexDirty(false);
  };

  const handleHslKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: "h" | "s" | "b"
  ) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const increment = e.shiftKey ? 10 : 1;
      const currentValue = hslValues[type];
      const max = type === "h" ? 360 : 100;
      const min = 0;

      let newValue = currentValue;
      if (e.key === "ArrowUp") {
        newValue = Math.min(max, currentValue + increment);
      } else {
        newValue = Math.max(min, currentValue - increment);
      }

      handleHslChange(type, newValue);
    }
  };

  return (
    <div className="app">
      <MobileLayout />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <header className="app-header">
                <h1>
                  Color Grid Tool
                  <span className="version-number">
                    v.{packageJson.version}
                  </span>
                </h1>
                <div className="header-actions">
                  <button
                    onClick={() => {
                      // Track contrast grid view
                      if (typeof window.gtag !== "undefined") {
                        window.gtag("event", "view_contrast_grid", {
                          grid_size: activeTab,
                          color_count: currentSwatches.length,
                        });
                      }
                      window.open(
                        `/contrast-grid?tab=${
                          activeTab === "simple"
                            ? "simple"
                            : activeTab === "advanced"
                            ? "advanced"
                            : "custom"
                        }&swatches=${encodeURIComponent(
                          JSON.stringify(currentSwatches)
                        )}`,
                        "_blank"
                      );
                    }}
                  >
                    View Contrast Grid
                  </button>
                  <button onClick={handleExportColors}>Export as SVG</button>
                  <div className="filters-dropdown" ref={dropdownRef}>
                    <button
                      onClick={() =>
                        setShowFiltersDropdown(!showFiltersDropdown)
                      }
                    >
                      WCAG Filters
                    </button>
                    {showFiltersDropdown && (
                      <div className="dropdown-menu">
                        <div
                          className="wcag-filters"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          <label className="filter-option">
                            <input
                              type="checkbox"
                              checked={wcagLevel === "A"}
                              onChange={() =>
                                handleWcagChange(
                                  wcagLevel === "A" ? "none" : "A"
                                )
                              }
                            />
                            WCAG A (3:1)
                          </label>
                          <label className="filter-option">
                            <input
                              type="checkbox"
                              checked={wcagLevel === "AA"}
                              onChange={() =>
                                handleWcagChange(
                                  wcagLevel === "AA" ? "none" : "AA"
                                )
                              }
                            />
                            WCAG AA (4.5:1)
                          </label>
                          <label className="filter-option">
                            <input
                              type="checkbox"
                              checked={wcagLevel === "AAA"}
                              onChange={() =>
                                handleWcagChange(
                                  wcagLevel === "AAA" ? "none" : "AAA"
                                )
                              }
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
                        <div
                          className="hex-input-group"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <input
                            type="color"
                            value={`#${inputHexCode}`}
                            onChange={(e) => {
                              const newHex = e.target.value
                                .slice(1)
                                .toUpperCase();
                              setInputHexCode(newHex);
                              setIsHexValid(true);
                              setIsHexDirty(newHex !== keyHexCode);
                              if (newHex !== keyHexCode) {
                                setKeyHexCode(newHex);
                                const { h, s, b } = hexToHsb(newHex);
                                setHslValues({ h, s, b });
                                setHue(h);
                              }
                            }}
                            className="color-picker"
                            title="Pick a color"
                            style={{
                              width: 48,
                              height: 48,
                              padding: 0,
                              border: "none",
                            }}
                          />
                          <input
                            type="text"
                            value={inputHexCode}
                            onChange={handleHexCodeChange}
                            onKeyPress={handleKeyPress}
                            placeholder="000000"
                            style={{ height: 48, flex: 1 }}
                          />
                          <button
                            onClick={updateHexCode}
                            className={
                              isHexValid && isHexDirty ? "active" : "disabled"
                            }
                            disabled={!isHexValid || !isHexDirty}
                            style={{
                              width: 48,
                              height: 48,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                            </svg>
                          </button>
                        </div>
                        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                          <input
                            type="number"
                            value={hslValues.h}
                            onChange={(e) =>
                              handleHslChange(
                                "h",
                                parseInt(e.target.value) || 0
                              )
                            }
                            onKeyDown={(e) => handleHslKeyDown(e, "h")}
                            min="0"
                            max="360"
                            style={{
                              width: "33%",
                              height: 32,
                              background: "#1a1a1a",
                              border: "1px solid #333",
                              borderRadius: 4,
                              color: "#999",
                              fontSize: 13,
                              fontFamily: "Lato, sans-serif",
                              padding: "0 8px",
                            }}
                          />
                          <input
                            type="number"
                            value={hslValues.s}
                            onChange={(e) =>
                              handleHslChange(
                                "s",
                                parseInt(e.target.value) || 0
                              )
                            }
                            onKeyDown={(e) => handleHslKeyDown(e, "s")}
                            min="0"
                            max="100"
                            style={{
                              width: "33%",
                              height: 32,
                              background: "#1a1a1a",
                              border: "1px solid #333",
                              borderRadius: 4,
                              color: "#999",
                              fontSize: 13,
                              fontFamily: "Lato, sans-serif",
                              padding: "0 8px",
                            }}
                          />
                          <input
                            type="number"
                            value={hslValues.b}
                            onChange={(e) =>
                              handleHslChange(
                                "b",
                                parseInt(e.target.value) || 0
                              )
                            }
                            onKeyDown={(e) => handleHslKeyDown(e, "b")}
                            min="0"
                            max="100"
                            style={{
                              width: "33%",
                              height: 32,
                              background: "#1a1a1a",
                              border: "1px solid #333",
                              borderRadius: 4,
                              color: "#999",
                              fontSize: 13,
                              fontFamily: "Lato, sans-serif",
                              padding: "0 8px",
                            }}
                          />
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
                            aria-label="Filter by Color Ramp"
                          />
                          <span className="toggle-slider" />
                        </label>
                      </div>
                      <div className="ramp-tabs">
                        <button
                          className={`tab-button ${
                            activeTab === "simple" ? "active" : ""
                          }`}
                          onClick={() => handleTabChange("simple")}
                          style={{ minHeight: 36 }}
                        >
                          Simple
                        </button>
                        <button
                          className={`tab-button ${
                            activeTab === "advanced" ? "active" : ""
                          }`}
                          onClick={() => handleTabChange("advanced")}
                          style={{ minHeight: 36 }}
                        >
                          Advanced
                        </button>
                        <button
                          className={`tab-button ${
                            activeTab === "custom" ? "active" : ""
                          }`}
                          onClick={() => handleTabChange("custom")}
                          style={{ minHeight: 36 }}
                        >
                          Custom
                        </button>
                      </div>
                      <div className="color-ramps">
                        {activeTab === "simple"
                          ? swatchesSimple.map((swatch) => (
                              <ColorSwatch
                                key={swatch.id}
                                swatch={swatch}
                                isActive={swatch.id === activeSwatchId}
                                onLValueChange={handleLValueChange}
                                onClick={handleSwatchClick}
                              />
                            ))
                          : activeTab === "custom"
                          ? swatchesCustom.map((swatch) => {
                              const r = parseInt(keyHexCode.slice(0, 2), 16);
                              const g = parseInt(keyHexCode.slice(2, 4), 16);
                              const b = parseInt(keyHexCode.slice(4, 6), 16);
                              const keyLValue = Math.round(
                                getRgbLabLightness(r, g, b)
                              );
                              return (
                                <ColorSwatch
                                  key={swatch.id}
                                  swatch={swatch}
                                  isActive={swatch.id === activeSwatchId}
                                  onLValueChange={handleLValueChange}
                                  onClick={handleSwatchClick}
                                  isKeyHexCode={swatch.id === 1}
                                />
                              );
                            })
                          : swatchesAdvanced.map((swatch) => (
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
                        {activeTab === "custom" && (
                          <>
                            <button
                              className="update-button"
                              onClick={handleAddRamp}
                            >
                              Add Ramp
                            </button>
                            <button
                              className="update-button remove-button"
                              onClick={handleRemoveRamp}
                            >
                              Remove Ramp
                            </button>
                          </>
                        )}
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
                    {isFiltering && (
                      <div
                        className="guide-overlay"
                        dangerouslySetInnerHTML={{ __html: guideSvg }}
                      />
                    )}
                    <button
                      className="fab-help"
                      onClick={() => {
                        setModalPage(0);
                        setRampTabClicked(false);
                        setShowColorPickModal(true);
                      }}
                      aria-label="Need Help?"
                    >
                      Need Help?
                    </button>
                  </div>
                </div>
              </div>
              {showToast && (
                <Toast
                  message="Hex code copied to clipboard!"
                  onClose={() => setShowToast(false)}
                  backgroundColor={toastHexCode}
                />
              )}
              {showColorPickModal && (
                <Modal onClose={() => setShowColorPickModal(false)}>
                  <div
                    style={{
                      width: 560,
                      minHeight: 200,
                      maxWidth: "100vw",
                      height: "auto",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      position: "relative",
                    }}
                  >
                    {modalPage === 0 && (
                      <>
                        <h2
                          style={{
                            fontSize: 20,
                            fontWeight: 400,
                            margin: "0 0 16px 0",
                            textAlign: "left",
                            width: "100%",
                          }}
                        >
                          Step 1: Pick a Hue or Hex Code
                        </h2>
                        <div
                          style={{
                            color: "#fff",
                            fontSize: 18,
                            fontWeight: 500,
                            marginBottom: 8,
                            textAlign: "left",
                            width: "100%",
                          }}
                        ></div>
                        <div style={{ width: "100%", marginBottom: 16 }}>
                          <div className="hex-control">
                            <div
                              className="hex-input-group"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                              }}
                            >
                              <input
                                type="color"
                                value={`#${inputHexCode}`}
                                onChange={(e) => {
                                  const newHex = e.target.value
                                    .slice(1)
                                    .toUpperCase();
                                  setInputHexCode(newHex);
                                  setIsHexValid(true);
                                  setIsHexDirty(newHex !== keyHexCode);
                                  if (newHex !== keyHexCode) {
                                    setKeyHexCode(newHex);
                                    const { h, s, b } = hexToHsb(newHex);
                                    setHslValues({ h, s, b });
                                    setHue(h);
                                  }
                                }}
                                className="color-picker"
                                title="Pick a color"
                                style={{
                                  width: 48,
                                  height: 48,
                                  padding: 0,
                                  border: "none",
                                }}
                              />
                              <input
                                type="text"
                                value={inputHexCode}
                                onChange={handleHexCodeChange}
                                onKeyPress={handleKeyPress}
                                placeholder="000000"
                                style={{ height: 48, flex: 1 }}
                              />
                              <button
                                onClick={updateHexCode}
                                className={
                                  isHexValid && isHexDirty
                                    ? "active"
                                    : "disabled"
                                }
                                disabled={!isHexValid || !isHexDirty}
                                style={{
                                  width: 48,
                                  height: 48,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 16,
                            color: "#999999",
                            textAlign: "left",
                            width: "100%",
                          }}
                        >
                          Input your brand's HEX code or use the color picker to
                          pick the hue of the color family you want to create.
                          The grid will update automatically and highlight your
                          key HEX code on the grid itself.
                        </div>
                      </>
                    )}
                    {modalPage === 1 && (
                      <>
                        <h2
                          style={{
                            fontSize: 20,
                            fontWeight: 400,
                            margin: "0 0 16px 0",
                            textAlign: "left",
                            width: "100%",
                          }}
                        >
                          Step 2: Pick the Amount of Color Ramps
                        </h2>
                        <div style={{ width: "100%", marginBottom: 16 }}>
                          <div className="modal-ramp-tabs">
                            <button
                              className={`modal-ramp-tab${
                                activeTab === "custom" && rampTabClicked
                                  ? " active"
                                  : ""
                              }`}
                              onClick={() => {
                                handleTabChange("custom");
                                setRampTabClicked(true);
                              }}
                            >
                              Simple
                            </button>
                            <button
                              className={`modal-ramp-tab${
                                activeTab === "advanced" && rampTabClicked
                                  ? " active"
                                  : ""
                              }`}
                              onClick={() => {
                                handleTabChange("advanced");
                                setRampTabClicked(true);
                              }}
                            >
                              Advanced
                            </button>
                            <button
                              className={`modal-ramp-tab${
                                activeTab === "simple" && rampTabClicked
                                  ? " active"
                                  : ""
                              }`}
                              onClick={() => {
                                handleTabChange("simple");
                                setRampTabClicked(true);
                              }}
                            >
                              Custom
                            </button>
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 16,
                            color: "#999999",
                            textAlign: "left",
                            width: "100%",
                          }}
                        >
                          Based on how robust of a color system you want, choose
                          between Simple, Advanced, or Custom color ramps. You
                          can also add, remove, and change the ramps for better
                          customization.
                          <br />
                          <br />
                          <span style={{ fontWeight: 800 }}>Hint:</span> I
                          recommend having an even amount of color ramps that
                          are above and below 50. This will ensure you have
                          enough colors to work with in both light and dark
                          mode.
                        </div>
                      </>
                    )}
                    {modalPage === 2 && (
                      <>
                        <h2
                          style={{
                            fontSize: 20,
                            fontWeight: 400,
                            margin: "0 0 16px 0",
                            textAlign: "left",
                            width: "100%",
                          }}
                        >
                          Step 3: Create Your Palette
                        </h2>
                        <div
                          style={{
                            fontSize: 16,
                            color: "#999999",
                            textAlign: "left",
                            width: "100%",
                            marginBottom: 16,
                          }}
                        >
                          Click on any swatch in the left drawer to begin
                          creating your new palette. Follow the guide lines if
                          you want help creating palettes of differing
                          saturation levels. When you're done, click on 'Export
                          as SVG' to save your palette.
                        </div>
                        {/* Sample ColorSwatch UI */}
                        <div style={{ width: "100%", marginBottom: 16 }}>
                          <div
                            className="lightness-controls"
                            style={{ width: "100%" }}
                          >
                            <div className="input-group">
                              <div className="input-row">
                                <div className="input-container">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={"75"}
                                    readOnly
                                    style={{
                                      background: "none",
                                      border: "none",
                                      color: "white",
                                      fontSize: 16,
                                      fontFamily: "Lato, sans-serif",
                                      width: "100%",
                                    }}
                                  />
                                </div>
                                <div
                                  className="color-swatch"
                                  style={{
                                    backgroundColor: "#4F8FFF",
                                    cursor: "default",
                                  }}
                                >
                                  <div className="hex-label">#4F8FFF</div>
                                  <div className="reference-dots">
                                    <div className="reference-dot white-dot">
                                      4.5:1
                                    </div>
                                    <div className="reference-dot black-dot">
                                      12.2:1
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    {/* Carousel arrows at bottom left */}
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        gap: 8,
                        justifyContent: "flex-start",
                        marginTop: 24,
                      }}
                    >
                      <button
                        onClick={() => setModalPage((p) => Math.max(0, p - 1))}
                        disabled={modalPage === 0}
                        style={{ minWidth: 40 }}
                        aria-label="Previous"
                      >
                        &#8592;
                      </button>
                      <button
                        onClick={() => setModalPage((p) => Math.min(2, p + 1))}
                        disabled={modalPage === 2}
                        style={{ minWidth: 40 }}
                        aria-label="Next"
                      >
                        &#8594;
                      </button>
                    </div>
                  </div>
                </Modal>
              )}
            </>
          }
        />
        <Route
          path="/contrast-grid"
          element={
            <ContrastGrid
              swatches={(() => {
                const params = new URLSearchParams(location.search);
                const tab = params.get("tab");
                const swatchesParam = params.get("swatches");
                if (swatchesParam) {
                  try {
                    return JSON.parse(decodeURIComponent(swatchesParam));
                  } catch (e) {
                    console.error("Failed to parse swatches:", e);
                  }
                }
                if (tab === "custom") return swatchesCustom;
                if (tab === "simple") return swatchesSimple;
                if (tab === "advanced") return swatchesAdvanced;
                return swatchesSimple;
              })()}
              title="Contrast Grid"
            />
          }
        />
      </Routes>
    </div>
  );
};

export default App;
