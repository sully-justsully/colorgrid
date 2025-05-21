import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  createRef,
  RefObject,
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
  getRgbLabLightness,
} from "./utils/colorUtils";
import "./App.css";
import "./styles/variables.css";
import "./styles/Dot.css";
import "./styles/HexTooltip.css";
import "./styles/ExportStyles.css";
import "./styles/Header.css";
import "./styles/RightDrawer.css";
import AreYouSureModal from "./components/AreYouSureModal";
import "./styles/AreYouSureModal.css";
import "./styles/Button.css";
import "./styles/Input.css";
import "./styles/Dropdown.css";
import "./styles/Typography.css";
import "./styles/Tabs.css";
import packageJson from "../package.json";
import { Routes, Route, useLocation } from "react-router-dom";
import ContrastGrid from "./components/ContrastGrid";
import { ReactComponent as ColorIcon } from "./icons/color.svg";
import { ReactComponent as EyeIcon } from "./icons/eye.svg";
import { ReactComponent as GridIcon } from "./icons/grid.svg";
import { ReactComponent as RemoveIcon } from "./icons/remove.svg";
import { ReactComponent as TrashIcon } from "./icons/trash.svg";
import { ReactComponent as DownloadIcon } from "./icons/download.svg";
import { ReactComponent as ChevronRightIcon } from "./icons/chevron-right.svg";
import { ReactComponent as CloseIcon } from "./icons/close.svg";
import { ReactComponent as LightModeIcon } from "./icons/light_mode.svg";
import { ReactComponent as DarkModeIcon } from "./icons/dark_mode.svg";
import "./styles/Ramp.css";
import { ReactComponent as AddIcon } from "./icons/add-alt.svg";
import { ReactComponent as ResetIcon } from "./icons/reset.svg";
import ButtonDemo from "./ButtonDemo";
import { ReactComponent as InfoIcon } from "./icons/info.svg";
import QuickGuideModal from "./components/QuickGuideModal";
import ScorePillDemo from "./pages/ScorePillDemo";
import ScorePill from "./components/ScorePill";
import { evaluateColorSystem } from "./utils/evaluateColorSystem";

const STORAGE_KEY = "colorGridSwatches";
const HEX_STORAGE_KEY = "colorGridHexCode";
const CUSTOM_RAMPS_STORAGE_KEY = "colorGridCustomRamps";

const initialLValuesSimple = [100, 95, 85, 75, 65, 55, 45, 35, 25, 15, 5, 0];
const initialLValuesAdvanced = [
  100, 98, 96, 93, 90, 82, 73, 65, 54, 45, 35, 27, 18, 10, 7, 4, 2, 0,
];

const guideSvg = `<svg width="1110" height="1110" viewBox="0 0 1110 1110" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M1110 1110C1110 1110 1110 282 968 142C826 0.4 0.4 0.4 0.4 0.4" stroke="var(--color-neutral-00)" stroke-width="1"/>
  <path d="M1110 1110C1110 1110 968 424 826 282C684 142 0.4 0.4 0.4 0.4" stroke="var(--color-neutral-00)" stroke-width="1"/>
  <path d="M1110 1110C1110 1110 826 566 684 424C542 282 0.4 0.4 0.4 0.4" stroke="var(--color-neutral-00)" stroke-width="1"/>
  <path d="M0.4 0.4L1110 1110" stroke="var(--color-neutral-00)" stroke-width="1"/>
  <path d="M0.4 0.4C0.4 0.4 282 542 424 684C566 826 1110 1110 1110 1110" stroke="var(--color-neutral-00)" stroke-width="1"/>
  <path d="M0.4 0.4C0.4 0.4 142 684 282 826C424 968 1110 1110 1110 1110" stroke="var(--color-neutral-00)" stroke-width="1"/>
  <path d="M0.4 0.4C0.4 0.4 0.4 826 142 968C282 1110 1110 1110 1110 1110" stroke="var(--color-neutral-00)" stroke-width="1"/>
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
  const [wcagLevel, setWcagLevel] = useState<"none" | "A" | "AA" | "AAA">(
    "none"
  );
  const [isPickingColor, setIsPickingColor] = useState(false);
  const [activeSwatchId, setActiveSwatchId] = useState<number | null>(null);
  const [selectedSwatchId, setSelectedSwatchId] = useState<number | null>(null);
  const [activeLValue, setActiveLValue] = useState<number | null>(null);
  const [lastSelectedColor, setLastSelectedColor] = useState<string | null>(
    null
  );
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<"simple" | "advanced" | "custom">(
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
      const savedCustomRamps = localStorage.getItem(CUSTOM_RAMPS_STORAGE_KEY);
      if (savedCustomRamps) {
        try {
          return JSON.parse(savedCustomRamps);
        } catch (e) {
          console.error("Failed to parse saved custom ramps:", e);
          return createInitialSwatches([100], keyHexCode);
        }
      }
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
  const [clearActiveDotsSignal, setClearActiveDotsSignal] = useState(0);
  const [isColorSystemOpen, setIsColorSystemOpen] = useState(false);
  const [pulsingRectangle, setPulsingRectangle] = useState<string | null>(null);
  const [savedSwatches, setSavedSwatches] = useState<{
    [key: string]: ColorSwatchType[];
  }>(() => {
    // Check for palettes under the new key first
    const savedPalettes = localStorage.getItem("colorSystemPalettes");
    if (savedPalettes) {
      try {
        return JSON.parse(savedPalettes);
      } catch (e) {
        console.error("Failed to parse saved palettes:", e);
        return {};
      }
    }

    // If no palettes under new key, check for old key and migrate if found
    const oldPalettes = localStorage.getItem("systemCreatorPalettes");
    if (oldPalettes) {
      try {
        const parsedOldPalettes = JSON.parse(oldPalettes);
        // Save to new key
        localStorage.setItem("colorSystemPalettes", oldPalettes);
        // Clean up old data
        localStorage.removeItem("systemCreatorPalettes");
        return parsedOldPalettes;
      } catch (e) {
        console.error("Failed to migrate old palettes:", e);
        return {};
      }
    }

    return {};
  });
  const [isSavingMode, setIsSavingMode] = useState(false);
  const [showRemoveConfirmModal, setShowRemoveConfirmModal] = useState(false);
  const [paletteToRemove, setPaletteToRemove] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : false;
  });
  const [showQuickGuide, setShowQuickGuide] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const currentSwatches = useMemo(() => {
    return activeTab === "simple"
      ? swatchesSimple
      : activeTab === "custom"
      ? swatchesCustom
      : swatchesAdvanced;
  }, [activeTab, swatchesSimple, swatchesCustom, swatchesAdvanced]);

  // Swatch refs for keyboard navigation (must come after currentSwatches)
  const swatchRefs = useMemo(
    () => currentSwatches.map(() => createRef<HTMLDivElement>()),
    [currentSwatches.length]
  );

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
    // Always update Custom mode swatches when key hex code changes
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
  }, [keyHexCode]);

  useEffect(() => {
    localStorage.setItem(
      CUSTOM_RAMPS_STORAGE_KEY,
      JSON.stringify(swatchesCustom)
    );
  }, [swatchesCustom]);

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
      // Do NOT update selectedSwatchId here

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

        // Store the original color when entering color picking mode
        const setCurrentSwatches =
          activeTab === "simple"
            ? setSwatchesSimple
            : activeTab === "advanced"
            ? setSwatchesAdvanced
            : setSwatchesCustom;

        setCurrentSwatches((prevSwatches) =>
          prevSwatches.map((swatch) =>
            swatch.id === id
              ? {
                  ...swatch,
                  originalHexColor: swatch.hexColor,
                }
              : swatch
          )
        );

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
                  originalHexColor: swatch.hexColor,
                  whiteContrast: calculateContrastRatio(dot.hexColor),
                  blackContrast: calculateContrastRatio(
                    dot.hexColor,
                    "#000000"
                  ),
                }
              : swatch
          )
        );

        // Update last selected color
        setLastSelectedColor(dot.hexColor);

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
        setSelectedSwatchId(activeSwatchId);
        setActiveSwatchId(null);
      }

      // Copy hex code to clipboard
      navigator.clipboard.writeText(dot.hexColor).then(() => {
        // Track color copy
        if (typeof window.gtag !== "undefined") {
          window.gtag("event", "color_copied", {
            hex_color: dot.hexColor,
            l_value: dot.labLightness,
            hsb_text: dot.hsbText,
          });
        }
      });
    },
    [isPickingColor, activeSwatchId, activeTab]
  );

  const handleDotHover = useCallback(
    (dot: Dot | null) => {
      if (isPickingColor && activeSwatchId !== null) {
        const setCurrentSwatches =
          activeTab === "simple"
            ? setSwatchesSimple
            : activeTab === "advanced"
            ? setSwatchesAdvanced
            : setSwatchesCustom;

        setCurrentSwatches((prevSwatches) =>
          prevSwatches.map((swatch) => {
            if (swatch.id === activeSwatchId) {
              // If we have a dot, use its color
              if (dot) {
                return {
                  ...swatch,
                  hexColor: dot.hexColor,
                  whiteContrast: calculateContrastRatio(dot.hexColor),
                  blackContrast: calculateContrastRatio(
                    dot.hexColor,
                    "#000000"
                  ),
                };
              }

              // If no dot (hovering off), restore to original color
              return {
                ...swatch,
                hexColor: swatch.originalHexColor || swatch.hexColor,
                whiteContrast: calculateContrastRatio(
                  swatch.originalHexColor || swatch.hexColor
                ),
                blackContrast: calculateContrastRatio(
                  swatch.originalHexColor || swatch.hexColor,
                  "#000000"
                ),
              };
            }
            return swatch;
          })
        );
      }
    },
    [isPickingColor, activeSwatchId, activeTab]
  );

  const handleAddRamp = (position = "bottom") => {
    const setCurrentSwatches =
      activeTab === "simple"
        ? setSwatchesSimple
        : activeTab === "advanced"
        ? setSwatchesAdvanced
        : setSwatchesCustom;
    setCurrentSwatches((prevSwatches) => {
      // Find the lowest and highest L* values in the current swatches
      const lValues = prevSwatches.map((swatch) => swatch.lValue);
      const lowestLValue = Math.min(...lValues);
      const highestLValue = Math.max(...lValues);
      let newLValue;
      if (position === "top") {
        newLValue = Math.min(100, highestLValue + 1);
      } else {
        newLValue = Math.max(0, lowestLValue - 1);
      }
      const [r, g, b] = labToRgb(newLValue);
      const hexColor = rgbToHex(r, g, b);
      const newRamp = {
        id: prevSwatches.length + 1,
        lValue: newLValue,
        hexColor,
        whiteContrast: calculateContrastRatio(hexColor),
        blackContrast: calculateContrastRatio(hexColor, "#000000"),
      };
      return position === "top"
        ? [newRamp, ...prevSwatches]
        : [...prevSwatches, newRamp];
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
    setClearActiveDotsSignal((prev) => prev + 1);
  };

  const handleExportColors = () => {
    // Track the export event
    if (typeof window.gtag !== "undefined") {
      window.gtag("event", "export_svg", {
        method: "SVG",
        palette_count: Object.keys(savedSwatches).length,
      });
    }

    const swatchWidth = 400; // Width of each column
    const swatchHeight = 120; // Height of each swatch
    const padding = 32; // Padding between columns
    const titleHeight = 48; // Height for section title
    const sections = Object.entries(savedSwatches);
    const totalWidth = (swatchWidth + padding) * sections.length - padding;

    // Calculate max height needed based on the longest palette
    const maxSwatches = Math.max(
      ...sections.map(([_, swatches]) => swatches.length)
    );
    const totalHeight = titleHeight + maxSwatches * swatchHeight;

    let svgContent = `
      <svg width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            .title {
              font-family: 'Inter', sans-serif;
              font-size: 18px;
              font-weight: 500;
              fill: #000000;
            }
          </style>
        </defs>
    `;

    // Add each palette section as a column
    sections.forEach(([sectionKey, swatches], sectionIndex) => {
      const sectionTitle = sectionKey
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      const columnX = sectionIndex * (swatchWidth + padding);

      // Add section title
      svgContent += `
        <text x="${columnX + 16}" y="32" class="title" fill="#000000">
          ${sectionTitle}
        </text>
      `;

      // Add swatches for this section
      swatches.forEach((swatch, index) => {
        const y = titleHeight + index * swatchHeight;
        const textColor = swatch.lValue >= 50 ? "#000000" : "#FFFFFF";
        const colorNumber = index * 50;
        const colorName = `Color-${colorNumber < 10 ? "0" : ""}${colorNumber}`;

        svgContent += `
          <g id="${sectionKey}-${colorName}">
            <rect x="${columnX}" y="${y}" width="${swatchWidth}" height="${swatchHeight}" fill="${
          swatch.hexColor
        }"/>
            
            <text x="${columnX + 16}" y="${
          y + 28
        }" class="text" fill="${textColor}">
              ${colorName}
            </text>
            <text x="${columnX + 16}" y="${
          y + 47
        }" class="text" fill="${textColor}">
              ${swatch.hexColor.toUpperCase()}
            </text>
            <text x="${columnX + 16}" y="${
          y + 101
        }" class="text" fill="${textColor}">
              L*=${Math.round(swatch.lValue)}
            </text>
            
            <text x="${columnX + swatchWidth - 40}" y="${
          y + 77
        }" class="text" text-anchor="end" fill="${textColor}">
              ${swatch.whiteContrast.toFixed(1)}:1
            </text>
            <circle cx="${columnX + swatchWidth - 24}" cy="${
          y + 72
        }" r="8" fill="#FFFFFF"/>
            <circle cx="${columnX + swatchWidth - 24}" cy="${
          y + 72
        }" r="8.25" stroke="${textColor}" stroke-opacity="0.16" stroke-width="0.5"/>

            <text x="${columnX + swatchWidth - 40}" y="${
          y + 101
        }" class="text" text-anchor="end" fill="${textColor}">
              ${swatch.blackContrast.toFixed(1)}:1
            </text>
            <circle cx="${columnX + swatchWidth - 24}" cy="${
          y + 96
        }" r="8" fill="#000000"/>
            <circle cx="${columnX + swatchWidth - 24}" cy="${
          y + 96
        }" r="8.25" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="0.5"/>
          </g>
        `;
      });
    });

    svgContent += `</svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `color-palettes.svg`;
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

  const handleSaveToColorSystem = () => {
    setIsColorSystemOpen(true);
    setIsSavingMode(true);
    setPulsingRectangle("all");
  };

  const handleRectangleClick = (sectionTitle: string) => {
    if (!isSavingMode) return;

    const sectionKey = sectionTitle.toLowerCase().replace(/\s+/g, "-");

    // Save the current swatches to this section
    setSavedSwatches((prev) => ({
      ...prev,
      [sectionKey]: [...currentSwatches],
    }));

    // Exit saving mode and stop pulsing
    setIsSavingMode(false);
    setPulsingRectangle(null);
  };

  const handleRemovePalette = (sectionTitle: string) => {
    const sectionKey = sectionTitle.toLowerCase().replace(/\s+/g, "-");
    setPaletteToRemove(sectionKey);
    setShowRemoveConfirmModal(true);
  };

  const confirmRemovePalette = () => {
    if (paletteToRemove) {
      setSavedSwatches((prev) => {
        const newSwatches = { ...prev };
        delete newSwatches[paletteToRemove];
        return newSwatches;
      });
      setShowRemoveConfirmModal(false);
      setPaletteToRemove(null);
    }
  };

  useEffect(() => {
    localStorage.setItem("colorSystemPalettes", JSON.stringify(savedSwatches));
  }, [savedSwatches]);

  const handleDrawerClose = () => {
    setIsColorSystemOpen(false);
    setIsSavingMode(false);
    setPulsingRectangle(null);
  };

  // Update the effect to use the new handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isPickingColor) {
          setIsPickingColor(false);
          setActiveSwatchId(null);
          setActiveLValue(null);
        } else if (isColorSystemOpen) {
          handleDrawerClose();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPickingColor, isColorSystemOpen]);

  // Turn on filter after 320ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFiltering(true);
    }, 320);
    return () => clearTimeout(timer);
  }, []);

  // Add a handler to remove a ramp by id
  const handleRemoveCustomRamp = (id: number) => {
    setSwatchesCustom((prevSwatches) =>
      prevSwatches.filter((swatch) => swatch.id !== id)
    );
  };

  useEffect(() => {
    if (isColorSystemOpen) {
      document.body.classList.add("drawer-open");
    } else {
      document.body.classList.remove("drawer-open");
    }
    return () => {
      document.body.classList.remove("drawer-open");
    };
  }, [isColorSystemOpen]);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "dark" : "light"
    );
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleTheme = () => {
    document.body.classList.add("theme-changing");
    setIsDarkMode((prev) => !prev);
    // Remove the class after a short delay to ensure the theme change is complete
    requestAnimationFrame(() => {
      document.body.classList.remove("theme-changing");
    });
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
                    className="btn btn-secondary"
                  >
                    <GridIcon />
                    View Contrast Grid
                  </button>
                  <div className="filters-dropdown" ref={dropdownRef}>
                    <button
                      onClick={() =>
                        setShowFiltersDropdown(!showFiltersDropdown)
                      }
                      className="btn btn-secondary"
                    >
                      <EyeIcon />
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
                  <button
                    className="btn"
                    onClick={() => setIsColorSystemOpen(!isColorSystemOpen)}
                  >
                    <ColorIcon />
                    Color System
                  </button>
                  <button
                    className="btn btn-secondary btn-icon-only"
                    onClick={toggleTheme}
                    aria-label={
                      isDarkMode
                        ? "Switch to light mode"
                        : "Switch to dark mode"
                    }
                  >
                    {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                  </button>
                </div>
              </header>

              <div
                className={`right-drawer ${isColorSystemOpen ? "open" : ""}`}
              >
                <div className="drawer-header">
                  <span className="drawer-title">Color System</span>
                  <div className="drawer-actions">
                    <button
                      className="btn"
                      onClick={handleExportColors}
                      disabled={Object.keys(savedSwatches).length === 0}
                    >
                      <DownloadIcon />
                      Download System
                    </button>
                    <button
                      className="btn-secondary btn-icon-only"
                      onClick={handleDrawerClose}
                      aria-label="Close drawer"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                </div>
                <div className="drawer-sections">
                  {[
                    {
                      title: "Brand Primary",
                      text: "This is your main brand color used for primary actions and highlights.",
                    },
                    {
                      title: "Brand Secondary",
                      text: "A secondary color to complement your primary brand color.",
                    },
                    {
                      title: "Neutral",
                      text: "Neutral colors are used for backgrounds, surfaces, and less prominent elements.",
                    },
                    {
                      title: "Success",
                      text: "Success colors indicate positive actions or states.",
                    },
                    {
                      title: "Error",
                      text: "Error colors are used for destructive actions or error states.",
                    },
                    {
                      title: "Custom 1",
                      text: "Custom 1 section for additional color swatches.",
                    },
                    {
                      title: "Custom 2",
                      text: "Custom 2 section for additional color swatches.",
                    },
                    {
                      title: "Custom 3",
                      text: "Custom 3 section for additional color swatches.",
                    },
                  ].map((section, idx) => {
                    const sectionKey = section.title
                      .toLowerCase()
                      .replace(/\s+/g, "-");
                    const palette = savedSwatches[sectionKey] || [];
                    // Extract hex colors for evaluation
                    const hexColors = palette.map((swatch) => swatch.hexColor);
                    let scores = null;
                    if (hexColors.length > 0) {
                      scores = evaluateColorSystem(hexColors);
                    }
                    return (
                      <div className="right-drawer-section" key={section.title}>
                        <div className="section-title">{section.title}</div>
                        <div className="section-desc">{section.text}</div>
                        <div className="section-row">
                          <div
                            className={
                              savedSwatches[sectionKey]
                                ? `filled-state${
                                    isSavingMode ? " saving-mode pulsing" : ""
                                  }`
                                : `empty-state${
                                    pulsingRectangle === "all" ? " pulsing" : ""
                                  }${isSavingMode ? " saving-mode" : ""}`
                            }
                            onClick={() => handleRectangleClick(section.title)}
                          >
                            {palette.map((swatch) => (
                              <div
                                key={swatch.id}
                                className="color-swatch"
                                style={{
                                  backgroundColor: swatch.hexColor,
                                  height: "100%",
                                  border: "1px solid #222",
                                }}
                              />
                            ))}
                          </div>
                          <div style={{ display: "flex", gap: "4px" }}>
                            {/* <button
                              className="btn btn-icon-only"
                              aria-label="Edit"
                            >
                              <PencilIcon />
                            </button> */}
                            <button
                              className="btn btn-destructive btn-icon-only"
                              aria-label="Remove"
                              onClick={() => handleRemovePalette(section.title)}
                              disabled={!savedSwatches[sectionKey]}
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </div>
                        {/* Score Pills Row */}
                        <div
                          style={{
                            display: "flex",
                            gap: "12px",
                            marginTop: 12,
                          }}
                        >
                          <ScorePill
                            score={scores ? scores.overallScore : NaN}
                            label="Overall:"
                          />
                          <ScorePill
                            score={scores ? scores.visualQualityScore : NaN}
                            label="Visual Quality:"
                          />
                          <ScorePill
                            score={scores ? scores.accessibilityScore : NaN}
                            label="Accessibility:"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                className={`drawer-backdrop ${isColorSystemOpen ? "open" : ""}`}
                onClick={handleDrawerClose}
                role="presentation"
              />

              <div className="main-container">
                <div className="left-drawer">
                  <div className="left-drawer-section">
                    <h3>Key Hex Code</h3>
                    <div className="hex-control">
                      <div className="hex-input-group input-flex-center">
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
                        />
                        <input
                          type="text"
                          value={inputHexCode}
                          onChange={handleHexCodeChange}
                          onKeyPress={handleKeyPress}
                          placeholder="000000"
                          className="standard-input input-prefix-hex"
                        />
                        <button
                          onClick={updateHexCode}
                          className={`btn-secondary btn-icon-only ${
                            !isHexValid || !isHexDirty ? "disabled" : ""
                          }`}
                        >
                          <ChevronRightIcon />
                        </button>
                      </div>
                      <div className="hsv-inputs">
                        <input
                          type="number"
                          value={hslValues.h}
                          onChange={(e) =>
                            handleHslChange("h", parseInt(e.target.value) || 0)
                          }
                          onKeyDown={(e) => handleHslKeyDown(e, "h")}
                          min="0"
                          max="360"
                          className="standard-input input-prefix-h hsv-input"
                        />
                        <input
                          type="number"
                          value={hslValues.s}
                          onChange={(e) =>
                            handleHslChange("s", parseInt(e.target.value) || 0)
                          }
                          onKeyDown={(e) => handleHslKeyDown(e, "s")}
                          min="0"
                          max="100"
                          className="standard-input input-prefix-s hsv-input"
                        />
                        <input
                          type="number"
                          value={hslValues.b}
                          onChange={(e) =>
                            handleHslChange("b", parseInt(e.target.value) || 0)
                          }
                          onKeyDown={(e) => handleHslKeyDown(e, "b")}
                          min="0"
                          max="100"
                          className="standard-input input-prefix-b hsv-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="left-drawer-section">
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
                    <div className="tabs">
                      <button
                        className={`tab ${
                          activeTab === "simple" ? "active" : ""
                        }`}
                        onClick={() => handleTabChange("simple")}
                      >
                        Simple
                      </button>
                      <button
                        className={`tab ${
                          activeTab === "advanced" ? "active" : ""
                        }`}
                        onClick={() => handleTabChange("advanced")}
                      >
                        Advanced
                      </button>
                      <button
                        className={`tab ${
                          activeTab === "custom" ? "active" : ""
                        }`}
                        onClick={() => handleTabChange("custom")}
                      >
                        Custom
                      </button>
                    </div>
                    <div className="color-ramps">
                      {activeTab === "custom" && (
                        <div
                          className="dashed-rectangle"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                          onClick={() => handleAddRamp("top")}
                          tabIndex={0}
                          role="button"
                          aria-label="Add ramp at top"
                        >
                          <AddIcon className="dashed-rectangle-add-icon" />
                        </div>
                      )}
                      {activeTab === "simple"
                        ? swatchesSimple.map((swatch, idx) => (
                            <ColorSwatch
                              key={swatch.id}
                              swatch={swatch}
                              isActive={swatch.id === activeSwatchId}
                              onLValueChange={handleLValueChange}
                              onClick={handleSwatchClick}
                              ref={swatchRefs[idx] as RefObject<HTMLDivElement>}
                              onSwatchKeyDown={(
                                e: React.KeyboardEvent<HTMLDivElement>
                              ) => {
                                if (
                                  e.key === "ArrowRight" &&
                                  idx < swatchRefs.length - 1
                                ) {
                                  swatchRefs[idx + 1].current?.focus();
                                } else if (e.key === "ArrowLeft" && idx > 0) {
                                  swatchRefs[idx - 1].current?.focus();
                                }
                              }}
                            />
                          ))
                        : activeTab === "custom"
                        ? swatchesCustom.map((swatch, idx) => (
                            <ColorSwatch
                              key={swatch.id}
                              swatch={swatch}
                              isActive={swatch.id === activeSwatchId}
                              onLValueChange={handleLValueChange}
                              onClick={handleSwatchClick}
                              isKeyHexCode={swatch.id === 1}
                              removeButton={
                                swatch.id !== 1 ? (
                                  <button
                                    className="btn btn-icon-only btn-destructive small"
                                    onClick={() =>
                                      handleRemoveCustomRamp(swatch.id)
                                    }
                                    aria-label="Remove ramp"
                                  >
                                    <RemoveIcon />
                                  </button>
                                ) : null
                              }
                              ref={swatchRefs[idx] as RefObject<HTMLDivElement>}
                              onSwatchKeyDown={(
                                e: React.KeyboardEvent<HTMLDivElement>
                              ) => {
                                if (
                                  e.key === "ArrowRight" &&
                                  idx < swatchRefs.length - 1
                                ) {
                                  swatchRefs[idx + 1].current?.focus();
                                } else if (e.key === "ArrowLeft" && idx > 0) {
                                  swatchRefs[idx - 1].current?.focus();
                                }
                              }}
                            />
                          ))
                        : swatchesAdvanced.map((swatch, idx) => (
                            <ColorSwatch
                              key={swatch.id}
                              swatch={swatch}
                              isActive={swatch.id === activeSwatchId}
                              onLValueChange={handleLValueChange}
                              onClick={handleSwatchClick}
                              ref={swatchRefs[idx] as RefObject<HTMLDivElement>}
                              onSwatchKeyDown={(
                                e: React.KeyboardEvent<HTMLDivElement>
                              ) => {
                                if (
                                  e.key === "ArrowRight" &&
                                  idx < swatchRefs.length - 1
                                ) {
                                  swatchRefs[idx + 1].current?.focus();
                                } else if (e.key === "ArrowLeft" && idx > 0) {
                                  swatchRefs[idx - 1].current?.focus();
                                }
                              }}
                            />
                          ))}
                    </div>
                  </div>
                  <div className="left-drawer-section">
                    <div className="ramp-actions">
                      {
                        activeTab === "custom" &&
                          false /* Remove Ramp button removed */
                      }
                      <button
                        className="btn btn-secondary btn-full"
                        onClick={handleResetRamps}
                        title="Reset to default ramps"
                      >
                        <ResetIcon />
                        Reset Ramps
                      </button>
                    </div>
                    <div className="ramp-actions save-actions">
                      <button
                        className="btn btn-full"
                        onClick={handleSaveToColorSystem}
                      >
                        <ColorIcon />
                        Save to Color System
                      </button>
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
                      onDotHover={handleDotHover}
                      keyHexCode={keyHexCode}
                      isPickingColor={isPickingColor}
                      activeLValue={activeLValue}
                      clearActiveDotsSignal={clearActiveDotsSignal}
                      activeTab={activeTab}
                      activeSwatchId={
                        isPickingColor ? activeSwatchId : selectedSwatchId
                      }
                    />
                    {isFiltering && (
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
                  backgroundColor={toastHexCode}
                />
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
        <Route path="/button-demo" element={<ButtonDemo />} />
        <Route path="/scorepill-demo" element={<ScorePillDemo />} />
      </Routes>
      {showRemoveConfirmModal && (
        <AreYouSureModal
          onClose={() => setShowRemoveConfirmModal(false)}
          initialFocusRef={cancelButtonRef}
        >
          <div className="modal-header">
            <h2 className="heading-lg">Are you sure?</h2>
          </div>
          <div className="body-lg modal-content-message">
            This will permanently remove the palette and you'll have to recreate
            the palette swatch-by-swatch if you want it back.
          </div>
          <div className="modal-actions">
            <button
              ref={cancelButtonRef}
              className="btn btn-secondary"
              onClick={() => setShowRemoveConfirmModal(false)}
              autoFocus
            >
              Cancel
            </button>
            <button
              className="btn btn-destructive"
              onClick={confirmRemovePalette}
            >
              Remove
            </button>
          </div>
        </AreYouSureModal>
      )}
      <button
        className="btn-fab"
        onClick={() => setShowQuickGuide(true)}
        aria-label="Quick Guide"
      >
        <InfoIcon />
        Quick Guide
      </button>
      {showQuickGuide && (
        <QuickGuideModal onClose={() => setShowQuickGuide(false)} />
      )}
    </div>
  );
};

export default App;
