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
import MobileLayout from "./components/MobileLayout";
import { ColorSwatch as ColorSwatchType, Dot } from "./types";
import {
  labToRgb,
  rgbToHex,
  hexToLabLightness,
  calculateContrastRatio,
  rgbToHsb,
  hexToHsb,
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
import { ReactComponent as ChevronRightIcon } from "./icons/chevron-right.svg";
import { ReactComponent as LightModeIcon } from "./icons/light_mode.svg";
import { ReactComponent as DarkModeIcon } from "./icons/dark_mode.svg";
import { ReactComponent as FigmaIcon } from "./icons/figma.svg";
import "./styles/Ramp.css";
import { ReactComponent as AddIcon } from "./icons/add-alt.svg";
import { ReactComponent as ResetIcon } from "./icons/reset.svg";
import ButtonDemo from "./ButtonDemo";
import ScorePillDemo from "./pages/ScorePillDemo";
import ScorePill from "./components/ScorePill";
import { evaluateColorSystem } from "./utils/evaluateColorSystem";
import HexInputRow from "./components/HexInputRow";
import ResetRampsModal from "./components/ResetRampsModal";
import "./styles/HexInputRow.css";
import DismissibleMessage from "./components/DismissibleMessage";
import HexTabMessage from "./components/HexTabMessage";
import ScoresModal from "./components/ScoresModal";
import Toast from "./components/Toast";
import { RightDrawer } from "./components/RightDrawer";
import { trackEvent, AnalyticsEvents } from "./utils/analytics";
import { ReactComponent as InfoIcon } from "./icons/info.svg";
import { ReactComponent as EditIcon } from "./icons/edit.svg";
import { ReactComponent as TrashIcon } from "./icons/trash.svg";
import ReplaceModal from "./components/ReplaceModal";

const STORAGE_KEY = "colorGridSwatches";
const HEX_STORAGE_KEY = "colorGridHexCode";
const CUSTOM_RAMPS_STORAGE_KEY = "colorGridCustomRamps";

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
    const lValue = Math.round(hexToLabLightness(`#${hexCode}`));
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
    // Ensure the L* value is within the desired range (64.45 to 65.44 for L* 65)
    const targetL = lValue;
    const [r, g, b] = labToRgb(targetL);
    const hexColor = rgbToHex(r, g, b);
    const actualL = hexToLabLightness(hexColor);

    // If the actual L* value is not within 0.25 of the target, adjust the RGB values
    let finalHexColor = hexColor;
    if (Math.abs(actualL - targetL) > 0.25) {
      const adjustedL = targetL;
      const [r2, g2, b2] = labToRgb(adjustedL);
      finalHexColor = rgbToHex(r2, g2, b2);
    }

    return {
      id: index + 1,
      lValue: targetL,
      hexColor: finalHexColor,
      whiteContrast: calculateContrastRatio(finalHexColor),
      blackContrast: calculateContrastRatio(finalHexColor, "#000000"),
    };
  });
};

interface Section {
  title: string;
  swatches: Array<{
    lValue: number;
    hexColor: string;
    whiteContrast: number;
    blackContrast: number;
  }>;
}

interface Color {
  id: string;
  hex: string;
  lightness: number;
  saturation: number;
  hue: number;
  isActive: boolean;
  isSelected: boolean;
}

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
  const [activeLValue, setActiveLValue] = useState<number | null>(null);
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<"lightness" | "hex">(() => {
    const savedTab = localStorage.getItem("colorGridActiveTab");
    return savedTab === "hex" ? "hex" : "lightness";
  });
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
  const [swatchesCustom, setSwatchesCustom] = useState<ColorSwatchType[]>(
    () => {
      const savedCustomRamps = localStorage.getItem(CUSTOM_RAMPS_STORAGE_KEY);
      if (savedCustomRamps) {
        try {
          return JSON.parse(savedCustomRamps);
        } catch (e) {
          console.error("Failed to parse saved custom ramps:", e);
          return createInitialSwatches([100], "FFFFFF");
        }
      }
      return createInitialSwatches([100], "FFFFFF");
    }
  );
  const [isHexValid, setIsHexValid] = useState(true);
  const [isHexDirty, setIsHexDirty] = useState(false);
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
  const [showResetModal, setShowResetModal] = useState(false);
  const [customHexCodes, setCustomHexCodes] = useState<string[]>(() => {
    const savedCustomRamps = localStorage.getItem(CUSTOM_RAMPS_STORAGE_KEY);
    if (savedCustomRamps) {
      try {
        const parsed = JSON.parse(savedCustomRamps);
        return parsed.map((swatch: ColorSwatchType) =>
          swatch.hexColor.slice(1)
        );
      } catch (e) {
        console.error("Failed to parse saved custom ramps:", e);
        return ["FFFFFF"];
      }
    }
    return ["FFFFFF"];
  });
  const [pendingSwatchesToSave, setPendingSwatchesToSave] = useState<
    ColorSwatchType[] | null
  >(null);
  const [showLightnessMessage, setShowLightnessMessage] = useState(() => {
    const saved = localStorage.getItem("lightnessMessageDismissed");
    console.log("Initial lightness message state:", saved);
    return saved !== "true";
  });
  const [showHexMessage, setShowHexMessage] = useState(() => {
    const saved = localStorage.getItem("hexMessageDismissed");
    console.log("Initial hex message state:", saved);
    return saved !== "true";
  });
  const [showScoresModal, setShowScoresModal] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    backgroundColor: string;
  } | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const currentSwatches = useMemo(() => {
    return activeTab === "lightness" ? swatchesAdvanced : swatchesCustom;
  }, [activeTab, swatchesAdvanced, swatchesCustom]);

  // Swatch refs for keyboard navigation (must come after currentSwatches)
  const swatchRefs = useMemo(
    () => currentSwatches.map(() => createRef<HTMLDivElement>()),
    [currentSwatches.length]
  );

  const colorGridRef = useRef<{ clearActiveDots: () => void }>(null);

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
      STORAGE_KEY + "_advanced",
      JSON.stringify(swatchesAdvanced)
    );
  }, [swatchesAdvanced]);

  useEffect(() => {
    localStorage.setItem(HEX_STORAGE_KEY, keyHexCode);
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
    if (activeTab === "lightness") {
      const swatchArray = swatchesAdvanced;
      const selectedSwatch = swatchArray.find((s) => s.id === id);
      if (selectedSwatch) {
        navigator.clipboard.writeText(selectedSwatch.hexColor);
        // Clear any existing toast timer
        if (toastTimerRef.current) {
          clearTimeout(toastTimerRef.current);
        }
        // Show new toast
        setToast({
          message: `${selectedSwatch.hexColor.toUpperCase()} copied to your clipboard!`,
          backgroundColor: selectedSwatch.hexColor,
        });
        // Set timer to hide toast
        toastTimerRef.current = setTimeout(() => {
          setToast(null);
        }, 3000);
      }
    } else {
      // For hex tab, keep the original toggle behavior
      if (isPickingColor && activeSwatchId === id) {
        setIsPickingColor(false);
        setActiveSwatchId(null);
        setActiveLValue(null);
      } else {
        setIsPickingColor(true);
        setActiveSwatchId(id);

        const selectedSwatch = swatchesCustom.find((s) => s.id === id);
        if (selectedSwatch) {
          setActiveLValue(selectedSwatch.lValue);

          setSwatchesCustom((prevSwatches) =>
            prevSwatches.map((swatch) =>
              swatch.id === id
                ? {
                    ...swatch,
                    originalHexColor: swatch.hexColor,
                  }
                : swatch
            )
          );

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
    }
  };

  const handleLValueChange = (id: number, value: number) => {
    const setCurrentSwatches =
      activeTab === "lightness" ? setSwatchesAdvanced : setSwatchesCustom;
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

  const handleDotHover = useCallback(
    (dot: Dot | null) => {
      if (activeTab === "lightness") {
        // In Lightness Values tab, directly update the swatch with matching L* value
        if (dot) {
          const matchingSwatch = swatchesAdvanced.find(
            (swatch) =>
              Math.round(swatch.lValue) === Math.round(dot.labLightness)
          );

          if (matchingSwatch) {
            setActiveSwatchId(matchingSwatch.id);
            setActiveLValue(matchingSwatch.lValue);
            // Store original color if not already stored
            setSwatchesAdvanced((prevSwatches) =>
              prevSwatches.map((swatch) => {
                if (swatch.id === matchingSwatch.id) {
                  return {
                    ...swatch,
                    originalHexColor:
                      swatch.originalHexColor || swatch.hexColor,
                    hexColor: dot.hexColor,
                    whiteContrast: calculateContrastRatio(dot.hexColor),
                    blackContrast: calculateContrastRatio(
                      dot.hexColor,
                      "#000000"
                    ),
                  };
                }
                return swatch;
              })
            );
          }
        } else {
          // When hovering off, restore original colors
          setActiveSwatchId(null);
          setActiveLValue(null);
          setSwatchesAdvanced((prevSwatches) =>
            prevSwatches.map((swatch) => ({
              ...swatch,
              hexColor: swatch.originalHexColor || swatch.hexColor,
              whiteContrast: calculateContrastRatio(
                swatch.originalHexColor || swatch.hexColor
              ),
              blackContrast: calculateContrastRatio(
                swatch.originalHexColor || swatch.hexColor,
                "#000000"
              ),
            }))
          );
        }
      }
    },
    [activeTab, swatchesAdvanced]
  );

  const handleDotClick = useCallback(
    (dot: Dot) => {
      if (activeTab === "lightness") {
        // In Lightness Values tab, directly update the swatch with matching L* value
        const matchingSwatch = swatchesAdvanced.find(
          (swatch) => Math.round(swatch.lValue) === Math.round(dot.labLightness)
        );

        if (matchingSwatch) {
          setActiveSwatchId(matchingSwatch.id);
          setActiveLValue(matchingSwatch.lValue);

          setSwatchesAdvanced((prevSwatches) =>
            prevSwatches.map((swatch) =>
              swatch.id === matchingSwatch.id
                ? {
                    ...swatch,
                    hexColor: dot.hexColor,
                    originalHexColor: swatch.hexColor, // Store original color
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
              swatch_id: matchingSwatch.id,
              selected_hex: dot.hexColor,
              l_value: dot.labLightness,
              hsb_text: dot.hsbText,
            });
          }
        }
      } else if (isPickingColor && activeSwatchId !== null) {
        // For hex tab, update the custom hex codes
        setCustomHexCodes((prev) => {
          const newCodes = [...prev];
          newCodes[activeSwatchId] = dot.hexColor.slice(1);
          return newCodes;
        });

        setIsPickingColor(false);
        setActiveSwatchId(null);
      }
    },
    [isPickingColor, activeSwatchId, activeTab, swatchesAdvanced]
  );

  const handleRemoveLightnessRamp = (id: number) => {
    if (swatchesAdvanced.length <= 1) return; // Don't remove if only one ramp left
    setSwatchesAdvanced((prevSwatches) => {
      const newSwatches = prevSwatches.filter((swatch) => swatch.id !== id);
      // Reorder IDs
      return newSwatches.map((swatch, index) => ({
        ...swatch,
        id: index + 1,
      }));
    });
  };

  const handleAddRamp = () => {
    if (activeTab === "hex") {
      setCustomHexCodes((prev) => {
        if (prev.length >= 20) return prev;
        return [...prev, "000000"];
      });
    } else {
      setSwatchesAdvanced((prevSwatches) => {
        // Check if we've reached the maximum limit of 20 swatches
        if (prevSwatches.length >= 20) {
          return prevSwatches;
        }
        // Add new ramp with L* value of 0
        const [r, g, b] = labToRgb(0);
        const hexColor = rgbToHex(r, g, b);
        const newRamp = {
          id: prevSwatches.length + 1,
          lValue: 0,
          hexColor,
          whiteContrast: calculateContrastRatio(hexColor),
          blackContrast: calculateContrastRatio(hexColor, "#000000"),
        };
        return [...prevSwatches, newRamp];
      });
    }
  };

  const handleResetRamps = () => {
    setShowResetModal(true);
  };

  const confirmResetRamps = () => {
    if (activeTab === "hex") {
      setCustomHexCodes(["FFFFFF"]);
      // No active dots to clear in hex tab
    } else if (activeTab === "lightness") {
      const initialSwatches = createInitialSwatches(initialLValuesAdvanced);
      setSwatchesAdvanced(initialSwatches);
      // Clear active dots directly
      colorGridRef.current?.clearActiveDots();
    }
    setShowResetModal(false);
  };

  // Ensure at least one ramp is present in customHexCodes
  useEffect(() => {
    if (customHexCodes.length === 0) {
      setCustomHexCodes(["FFFFFF"]);
    }
  }, [customHexCodes]);

  // Update swatchesCustom when customHexCodes changes
  useEffect(() => {
    const newSwatches = customHexCodes.map((hex, index) => ({
      id: index + 1,
      lValue: Math.round(hexToLabLightness(`#${hex}`)),
      hexColor: `#${hex}`,
      whiteContrast: calculateContrastRatio(`#${hex}`),
      blackContrast: calculateContrastRatio(`#${hex}`, "#000000"),
    }));
    setSwatchesCustom(newSwatches);
    localStorage.setItem(CUSTOM_RAMPS_STORAGE_KEY, JSON.stringify(newSwatches));
  }, [customHexCodes]);

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
    const footerHeight = 40; // Height for footer text
    const sections: [string, Section["swatches"]][] =
      Object.entries(savedSwatches);
    const totalWidth = (swatchWidth + padding) * sections.length - padding;

    // Calculate max height needed based on the longest palette
    const maxSwatches = Math.max(
      ...sections.map(
        ([_, swatches]: [string, Section["swatches"]]) => swatches.length
      )
    );
    const totalHeight = titleHeight + maxSwatches * swatchHeight + footerHeight;

    let svgContent = `
      <svg width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}" fill="none" xmlns="http://www.w3.org/2000/svg" class="export-svg">
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
        <text x="${columnX + 16}" y="32" class="title" fill="#757575">
          ${sectionTitle}
        </text>
      `;

      // Add swatches for this section
      swatches.forEach((swatch: Section["swatches"][0], index: number) => {
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

    // Add footer text with link
    const footerY = totalHeight - 16;
    svgContent += `
      <text x="16" y="${footerY}" fill="#757575">
        Download this Figma file to use your color system with 450+ ready-to-go variables. <a href="https://www.figma.com/community/file/1428517491497047139/design-system-variables-midnight-v-2-0"><tspan fill="#0066FF" text-decoration="underline">Design System Variables</tspan></a>
      </text>
    `;

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

  const handleTabChange = (tab: "lightness" | "hex") => {
    setActiveTab(tab);
    localStorage.setItem("colorGridActiveTab", tab);
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
    let swatchesToSave = currentSwatches;
    if (activeTab === "hex") {
      // Sort customHexCodes by L* value (highest to lowest)
      const sortedHexes = customHexCodes
        .map((hex) => ({
          hex,
          lValue: hexToLabLightness(`#${hex}`),
        }))
        .sort((a, b) => b.lValue - a.lValue)
        .map((item) => item.hex);
      swatchesToSave = sortedHexes.map((hex, idx) => {
        const lValue = Math.round(hexToLabLightness(`#${hex}`));
        return {
          id: idx + 1,
          lValue,
          hexColor: `#${hex}`,
          whiteContrast: calculateContrastRatio(`#${hex}`),
          blackContrast: calculateContrastRatio(`#${hex}`, "#000000"),
        };
      });
    }
    setPendingSwatchesToSave(swatchesToSave);
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
      [sectionKey]: pendingSwatchesToSave
        ? [...pendingSwatchesToSave]
        : [...currentSwatches],
    }));

    // Exit saving mode and stop pulsing
    setIsSavingMode(false);
    setPulsingRectangle(null);
    setPendingSwatchesToSave(null);
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

  // Debug log: print savedSwatches when right drawer is open
  if (isColorSystemOpen) {
    console.log("Saved palettes (Color System):", savedSwatches);
  }

  const handleHexChange = (id: number, hex: string) => {
    setCustomHexCodes((prev) => {
      const newCodes = [...prev];
      newCodes[id] = hex;
      return newCodes;
    });
  };

  const handleRemoveRamp = (id: number) => {
    setCustomHexCodes((prev) => prev.filter((_, index) => index !== id));
  };

  // Add this effect after the other useEffect hooks
  useEffect(() => {
    if (activeTab === "lightness") {
      setIsPickingColor(true);
    } else {
      setIsPickingColor(false);
    }
  }, [activeTab]);

  // Add effect to sync state with localStorage
  useEffect(() => {
    console.log("showLightnessMessage changed to:", showLightnessMessage);
    if (!showLightnessMessage) {
      localStorage.setItem("lightnessMessageDismissed", "true");
      console.log("Set lightnessMessageDismissed to true");
    }
  }, [showLightnessMessage]);

  useEffect(() => {
    console.log("showHexMessage changed to:", showHexMessage);
    if (!showHexMessage) {
      localStorage.setItem("hexMessageDismissed", "true");
      console.log("Set hexMessageDismissed to true");
    }
  }, [showHexMessage]);

  // Add function to reset dismissible messages
  const resetDismissibleMessages = () => {
    localStorage.removeItem("lightnessMessageDismissed");
    localStorage.removeItem("hexMessageDismissed");
    setShowLightnessMessage(true);
    setShowHexMessage(true);
  };

  const handleDownload = () => {
    handleExportColors();
  };

  // Cleanup toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [sectionToReplace, setSectionToReplace] = useState<string | null>(null);

  const handleDismissLightnessMessage = () => {
    console.log("Dismissing lightness message");
    setShowLightnessMessage(false);
  };

  const handleDismissHexMessage = () => {
    console.log("Dismissing hex message");
    setShowHexMessage(false);
  };

  useEffect(() => {
    if (isColorSystemOpen || showResetModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [isColorSystemOpen, showResetModal]);

  return (
    <div className={`app ${isDarkMode ? "dark" : ""}`}>
      <MobileLayout />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <header className="app-header">
                <button
                  className="btn btn-secondary btn-icon-only"
                  onClick={() => {
                    toggleTheme();
                    trackEvent(AnalyticsEvents.THEME_TOGGLE, {
                      new_theme: isDarkMode ? "light" : "dark",
                    });
                  }}
                  aria-label={
                    isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                  }
                >
                  {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </button>
                <div className="app-title">
                  <h1>
                    Color Grid Tool
                    <span className="version-number">
                      v.{packageJson.version}
                    </span>
                  </h1>
                </div>
                <div className="header-actions">
                  <button
                    onClick={() => {
                      trackEvent(AnalyticsEvents.GET_FIGMA_FILE);
                      window.open(
                        "https://www.figma.com/community/file/1428517491497047139/design-system-variables-midnight-v-2-0",
                        "_blank"
                      );
                    }}
                    className="btn btn-secondary"
                  >
                    <FigmaIcon />
                    Get Figma File
                  </button>
                  <button
                    onClick={() => {
                      trackEvent(AnalyticsEvents.VIEW_CONTRAST_GRID, {
                        grid_size: activeTab,
                        color_count: currentSwatches.length,
                      });
                      window.open(
                        `/contrast-grid?tab=${
                          activeTab === "lightness" ? "lightness" : "hex"
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
                      onClick={() => {
                        setShowFiltersDropdown(!showFiltersDropdown);
                        trackEvent(AnalyticsEvents.WCAG_FILTER_CHANGE, {
                          current_level: wcagLevel,
                        });
                      }}
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
                    onClick={() => {
                      setIsColorSystemOpen(true);
                      trackEvent(AnalyticsEvents.VIEW_SCORES);
                    }}
                  >
                    <ColorIcon />
                    Color System
                  </button>
                </div>
              </header>

              <div className="main-container">
                <div className="left-drawer">
                  <div className="left-drawer-section">
                    <h3 className="hidden-section">Key Hex Code</h3>
                    <div className="tabs">
                      <button
                        className={`tab ${
                          activeTab === "lightness" ? "active" : ""
                        }`}
                        onClick={() => handleTabChange("lightness")}
                      >
                        Lightness Values
                        <span
                          className="tab-info-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowLightnessMessage(true);
                            localStorage.setItem(
                              "lightnessMessageDismissed",
                              "false"
                            );
                          }}
                          title="Show info"
                          tabIndex={0}
                          role="button"
                          aria-label="Show info about Lightness Values"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              setShowLightnessMessage(true);
                              localStorage.setItem(
                                "lightnessMessageDismissed",
                                "false"
                              );
                            }
                          }}
                          style={{
                            marginLeft: 6,
                            display: "inline-flex",
                            alignItems: "center",
                            cursor: "pointer",
                          }}
                        >
                          <InfoIcon
                            style={{ width: 12, height: 12, display: "block" }}
                          />
                        </span>
                      </button>
                      <button
                        className={`tab ${activeTab === "hex" ? "active" : ""}`}
                        onClick={() => handleTabChange("hex")}
                      >
                        HEX Codes
                        <span
                          className="tab-info-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowHexMessage(true);
                            localStorage.setItem(
                              "hexMessageDismissed",
                              "false"
                            );
                          }}
                          title="Show info"
                          tabIndex={0}
                          role="button"
                          aria-label="Show info about HEX Codes"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              setShowHexMessage(true);
                              localStorage.setItem(
                                "hexMessageDismissed",
                                "false"
                              );
                            }
                          }}
                          style={{
                            marginLeft: 6,
                            display: "inline-flex",
                            alignItems: "center",
                            cursor: "pointer",
                          }}
                        >
                          <InfoIcon
                            style={{ width: 12, height: 12, display: "block" }}
                          />
                        </span>
                      </button>
                    </div>
                    {activeTab === "lightness" && showLightnessMessage && (
                      <DismissibleMessage
                        onDismiss={handleDismissLightnessMessage}
                      />
                    )}
                    {activeTab === "hex" && showHexMessage && (
                      <HexTabMessage onDismiss={handleDismissHexMessage} />
                    )}
                    {activeTab === "lightness" && (
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
                              handleHslChange(
                                "h",
                                parseInt(e.target.value) || 0
                              )
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
                              handleHslChange(
                                "s",
                                parseInt(e.target.value) || 0
                              )
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
                              handleHslChange(
                                "b",
                                parseInt(e.target.value) || 0
                              )
                            }
                            onKeyDown={(e) => handleHslKeyDown(e, "b")}
                            min="0"
                            max="100"
                            className="standard-input input-prefix-b hsv-input"
                          />
                        </div>
                      </div>
                    )}
                    <div className="color-ramps">
                      {activeTab === "hex" ? (
                        <>
                          <div className="custom-ramps">
                            {customHexCodes
                              .map((hex, index) => ({
                                hex,
                                index,
                                lValue: hexToLabLightness(`#${hex}`),
                              }))
                              .sort((a, b) => b.lValue - a.lValue)
                              .map(({ hex, index }, sortedIdx) => (
                                <HexInputRow
                                  key={index}
                                  id={index}
                                  initialHex={hex}
                                  onHexChange={handleHexChange}
                                  onRemove={handleRemoveRamp}
                                  isFirstRow={false}
                                />
                              ))}
                            {customHexCodes.length < 20 && (
                              <div
                                className="dashed-rectangle"
                                onClick={() => handleAddRamp()}
                                tabIndex={0}
                                role="button"
                                aria-label="Add new color"
                              >
                                <AddIcon className="dashed-rectangle-add-icon" />
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          {swatchesAdvanced.map((swatch, idx) => (
                            <ColorSwatch
                              key={swatch.id}
                              swatch={swatch}
                              isActive={
                                activeTab === "lightness"
                                  ? false
                                  : swatch.id === activeSwatchId
                              }
                              onLValueChange={handleLValueChange}
                              onClick={handleSwatchClick}
                              ref={swatchRefs[idx] as RefObject<HTMLDivElement>}
                              onSwatchKeyDown={(e) => {
                                if (
                                  e.key === "ArrowRight" &&
                                  idx < swatchRefs.length - 1
                                ) {
                                  swatchRefs[idx + 1].current?.focus();
                                } else if (e.key === "ArrowLeft" && idx > 0) {
                                  swatchRefs[idx - 1].current?.focus();
                                }
                              }}
                              removeButton={
                                swatchesAdvanced.length > 1 && (
                                  <button
                                    className="btn btn-icon-only btn-destructive small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveLightnessRamp(swatch.id);
                                    }}
                                    aria-label="Remove color ramp"
                                  >
                                    <RemoveIcon />
                                  </button>
                                )
                              }
                            />
                          ))}
                          {swatchesAdvanced.length < 20 && (
                            <div
                              className="dashed-rectangle"
                              onClick={() => handleAddRamp()}
                              tabIndex={0}
                              role="button"
                              aria-label="Add new color"
                            >
                              <AddIcon className="dashed-rectangle-add-icon" />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className="left-drawer-ctas">
                      <button
                        className="btn btn-secondary btn-full"
                        onClick={() => {
                          handleResetRamps();
                          trackEvent(AnalyticsEvents.RESET_RAMPS, {
                            tab: activeTab,
                            ramp_count:
                              activeTab === "hex"
                                ? customHexCodes.length
                                : swatchesAdvanced.length,
                          });
                        }}
                        title="Reset to default ramps"
                      >
                        <ResetIcon />
                        Reset{" "}
                        {activeTab === "hex"
                          ? customHexCodes.length
                          : swatchesAdvanced.length}{" "}
                        Ramps
                      </button>
                      <button
                        className="btn btn-full"
                        onClick={() => {
                          handleSaveToColorSystem();
                          trackEvent(AnalyticsEvents.SAVE_PALETTE, {
                            tab: activeTab,
                            color_count: currentSwatches.length,
                          });
                        }}
                      >
                        <ColorIcon />
                        Save Palette
                      </button>
                    </div>
                  </div>
                </div>

                <div className="main-content">
                  <div className="grid-container">
                    <ColorGrid
                      ref={colorGridRef}
                      hue={activeTab === "hex" ? 210 : hue}
                      isFiltering={isFiltering}
                      isATextContrast={wcagLevel === "A"}
                      isAATextContrast={wcagLevel === "AA"}
                      isAAATextContrast={wcagLevel === "AAA"}
                      lValues={currentLValues}
                      onDotClick={handleDotClick}
                      onDotHover={handleDotHover}
                      keyHexCode={activeTab === "hex" ? "" : keyHexCode}
                      isPickingColor={isPickingColor}
                      activeLValue={activeLValue}
                      activeTab={activeTab}
                      activeSwatchId={activeSwatchId}
                      forceGrayscale={activeTab === "hex"}
                      swatches={
                        activeTab === "hex" ? swatchesCustom : currentSwatches
                      }
                    />
                    {isFiltering && activeTab !== "hex" && (
                      <div
                        className="guide-overlay"
                        dangerouslySetInnerHTML={{ __html: guideSvg }}
                      />
                    )}
                  </div>
                </div>
              </div>
              {toast && (
                <Toast
                  message={toast.message}
                  backgroundColor={toast.backgroundColor}
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
                if (tab === "hex") return swatchesCustom;
                if (tab === "lightness") return swatchesAdvanced;
                return swatchesAdvanced;
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
      {showResetModal && (
        <ResetRampsModal
          onClose={() => setShowResetModal(false)}
          onConfirm={confirmResetRamps}
        />
      )}
      {/* Show overlay when in Save Palette mode, behind the right drawer */}
      {isSavingMode && (
        <div className="modal-backdrop open" style={{ zIndex: 2199 }} />
      )}
      {isColorSystemOpen && (
        <div
          className="modal-backdrop open"
          style={{ zIndex: 2199 }}
          onClick={handleDrawerClose}
        />
      )}
      <RightDrawer
        isOpen={isColorSystemOpen}
        onClose={handleDrawerClose}
        handleDownload={handleDownload}
        setShowScoresModal={setShowScoresModal}
      >
        <div className="drawer-sections">
          {[
            {
              title: "Brand Primary",
              text: "This is your main color used for primary actions and highlights.",
            },
            {
              title: "Brand Secondary",
              text: "A secondary color to complement your primary brand color.",
            },
            {
              title: "Neutral",
              text: "Colors used for surfaces, text, and less prominent elements.",
            },
            {
              title: "Success",
              text: "Colors to indicate positive actions or success states.",
            },
            {
              title: "Error",
              text: "Colors to indicate destructive actions or error states.",
            },
            {
              title: "Custom 1",
              text: "Additional section for more color palettes.",
            },
            {
              title: "Custom 2",
              text: "Additional section for more color palettes.",
            },
            {
              title: "Custom 3",
              text: "Additional section for more color palettes.",
            },
          ].map((section, idx) => {
            const sectionKey = section.title.toLowerCase().replace(/\s+/g, "-");
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
                    <button
                      className="btn btn-secondary btn-icon-only"
                      aria-label="Edit"
                      disabled={!savedSwatches[sectionKey]}
                      onClick={() => {
                        setSectionToReplace(sectionKey);
                        setShowReplaceModal(true);
                        trackEvent(AnalyticsEvents.EDIT_PALETTE, {
                          section: section.title,
                        });
                      }}
                    >
                      <EditIcon />
                    </button>
                    <button
                      className="btn btn-destructive btn-icon-only"
                      aria-label="Remove"
                      onClick={() => {
                        handleRemovePalette(section.title);
                        trackEvent(AnalyticsEvents.REMOVE_PALETTE, {
                          section: section.title,
                        });
                      }}
                      disabled={!savedSwatches[sectionKey]}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
                {/* Score Pills Row */}
                <div className="score-pill-row">
                  <ScorePill
                    score={scores ? scores.colorRangeScore * 100 : NaN}
                    label="Color Range:"
                    tooltipType="colorRange"
                    scores={scores || undefined}
                  />
                  <ScorePill
                    score={scores ? scores.lightDarkScore * 100 : NaN}
                    label="Light v Dark:"
                    tooltipType="colorBalance"
                    scores={scores || undefined}
                  />
                  <ScorePill
                    score={scores ? scores.normalizedContrastScore * 100 : NaN}
                    label="Accessibility:"
                    tooltipType="accessibility"
                    scores={scores || undefined}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </RightDrawer>
      <ScoresModal
        isOpen={showScoresModal}
        onClose={() => setShowScoresModal(false)}
      />
      <ReplaceModal
        isOpen={showReplaceModal}
        onClose={() => setShowReplaceModal(false)}
        onConfirm={() => {
          if (sectionToReplace) {
            const swatches = savedSwatches[sectionToReplace] || [];
            setSwatchesAdvanced(swatches);
            localStorage.setItem(
              STORAGE_KEY + "_advanced",
              JSON.stringify(swatches)
            );
            setActiveTab("lightness");
          }
          setShowReplaceModal(false);
          setSectionToReplace(null);
        }}
        title="Replace Lightness Values?"
      >
        Editing this palette will replace the current lightness value swatches.
        This action cannot be undone.
      </ReplaceModal>
    </div>
  );
};

export default App;
