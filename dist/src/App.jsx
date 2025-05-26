"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const ColorGrid_1 = __importDefault(require("./components/ColorGrid"));
const ColorSwatch_1 = __importDefault(require("./components/ColorSwatch"));
const Toast_1 = __importDefault(require("./components/Toast"));
const MobileLayout_1 = __importDefault(require("./components/MobileLayout"));
const colorUtils_1 = require("./utils/colorUtils");
require("./App.css");
require("./styles/variables.css");
require("./styles/Dot.css");
require("./styles/HexTooltip.css");
require("./styles/ExportStyles.css");
require("./styles/Header.css");
require("./styles/RightDrawer.css");
const AreYouSureModal_1 = __importDefault(require("./components/AreYouSureModal"));
require("./styles/AreYouSureModal.css");
require("./styles/Button.css");
require("./styles/Input.css");
require("./styles/Dropdown.css");
require("./styles/Typography.css");
require("./styles/Tabs.css");
const package_json_1 = __importDefault(require("../package.json"));
const react_router_dom_1 = require("react-router-dom");
const ContrastGrid_1 = __importDefault(require("./components/ContrastGrid"));
const color_svg_1 = require("./icons/color.svg");
const eye_svg_1 = require("./icons/eye.svg");
const grid_svg_1 = require("./icons/grid.svg");
const remove_svg_1 = require("./icons/remove.svg");
const trash_svg_1 = require("./icons/trash.svg");
const download_svg_1 = require("./icons/download.svg");
const chevron_right_svg_1 = require("./icons/chevron-right.svg");
const close_svg_1 = require("./icons/close.svg");
const light_mode_svg_1 = require("./icons/light_mode.svg");
const dark_mode_svg_1 = require("./icons/dark_mode.svg");
require("./styles/Ramp.css");
const add_alt_svg_1 = require("./icons/add-alt.svg");
const reset_svg_1 = require("./icons/reset.svg");
const ButtonDemo_1 = __importDefault(require("./ButtonDemo"));
const info_svg_1 = require("./icons/info.svg");
const QuickGuideModal_1 = __importDefault(require("./components/QuickGuideModal"));
const ScorePillDemo_1 = __importDefault(require("./pages/ScorePillDemo"));
const ScorePill_1 = __importDefault(require("./components/ScorePill"));
const evaluateColorSystem_1 = require("./utils/evaluateColorSystem");
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
const createInitialSwatches = (lValues, hexCode) => {
    if (hexCode) {
        // For Custom mode, create a single swatch with the L* value from the hex code
        const lValue = Math.round((0, colorUtils_1.hexToLabLightness)(`#${hexCode}`));
        return [
            {
                id: 1,
                lValue,
                hexColor: `#${hexCode}`,
                whiteContrast: (0, colorUtils_1.calculateContrastRatio)(`#${hexCode}`),
                blackContrast: (0, colorUtils_1.calculateContrastRatio)(`#${hexCode}`, "#000000"),
            },
        ];
    }
    return lValues.map((lValue, index) => {
        const [r, g, b] = (0, colorUtils_1.labToRgb)(lValue);
        const hexColor = (0, colorUtils_1.rgbToHex)(r, g, b);
        return {
            id: index + 1,
            lValue,
            hexColor,
            whiteContrast: (0, colorUtils_1.calculateContrastRatio)(hexColor),
            blackContrast: (0, colorUtils_1.calculateContrastRatio)(hexColor, "#000000"),
        };
    });
};
const App = () => {
    const [keyHexCode, setKeyHexCode] = (0, react_1.useState)(() => {
        const savedHexCode = localStorage.getItem(HEX_STORAGE_KEY);
        return savedHexCode || "0080FF";
    });
    const [inputHexCode, setInputHexCode] = (0, react_1.useState)(keyHexCode);
    const [hslValues, setHslValues] = (0, react_1.useState)(() => {
        const { h, s, b } = (0, colorUtils_1.hexToHsb)(keyHexCode);
        return { h, s, b };
    });
    const [hue, setHue] = (0, react_1.useState)(() => {
        const r = parseInt(keyHexCode.slice(0, 2), 16);
        const g = parseInt(keyHexCode.slice(2, 4), 16);
        const b = parseInt(keyHexCode.slice(4, 6), 16);
        const [h] = (0, colorUtils_1.rgbToHsb)(r, g, b);
        return h;
    });
    const [isFiltering, setIsFiltering] = (0, react_1.useState)(false);
    const [wcagLevel, setWcagLevel] = (0, react_1.useState)("none");
    const [isPickingColor, setIsPickingColor] = (0, react_1.useState)(false);
    const [activeSwatchId, setActiveSwatchId] = (0, react_1.useState)(null);
    const [selectedSwatchId, setSelectedSwatchId] = (0, react_1.useState)(null);
    const [activeLValue, setActiveLValue] = (0, react_1.useState)(null);
    const [lastSelectedColor, setLastSelectedColor] = (0, react_1.useState)(null);
    const [showFiltersDropdown, setShowFiltersDropdown] = (0, react_1.useState)(false);
    const [activeTab, setActiveTab] = (0, react_1.useState)("simple");
    const [swatchesSimple, setSwatchesSimple] = (0, react_1.useState)(() => {
        const savedSwatches = localStorage.getItem(STORAGE_KEY + "_simple");
        if (savedSwatches) {
            try {
                return JSON.parse(savedSwatches);
            }
            catch (e) {
                console.error("Failed to parse saved swatches:", e);
                return createInitialSwatches(initialLValuesSimple);
            }
        }
        return createInitialSwatches(initialLValuesSimple);
    });
    const [swatchesCustom, setSwatchesCustom] = (0, react_1.useState)(() => {
        const savedCustomRamps = localStorage.getItem(CUSTOM_RAMPS_STORAGE_KEY);
        if (savedCustomRamps) {
            try {
                return JSON.parse(savedCustomRamps);
            }
            catch (e) {
                console.error("Failed to parse saved custom ramps:", e);
                return createInitialSwatches([100], keyHexCode);
            }
        }
        return createInitialSwatches([100], keyHexCode);
    });
    const [swatchesAdvanced, setSwatchesAdvanced] = (0, react_1.useState)(() => {
        const savedSwatches = localStorage.getItem(STORAGE_KEY + "_advanced");
        if (savedSwatches) {
            try {
                return JSON.parse(savedSwatches);
            }
            catch (e) {
                console.error("Failed to parse saved swatches:", e);
                return createInitialSwatches(initialLValuesAdvanced);
            }
        }
        return createInitialSwatches(initialLValuesAdvanced);
    });
    const [showToast, setShowToast] = (0, react_1.useState)(false);
    const [toastHexCode, setToastHexCode] = (0, react_1.useState)("#333");
    const [isHexValid, setIsHexValid] = (0, react_1.useState)(true);
    const [isHexDirty, setIsHexDirty] = (0, react_1.useState)(false);
    const [clearActiveDotsSignal, setClearActiveDotsSignal] = (0, react_1.useState)(0);
    const [isColorSystemOpen, setIsColorSystemOpen] = (0, react_1.useState)(false);
    const [pulsingRectangle, setPulsingRectangle] = (0, react_1.useState)(null);
    const [savedSwatches, setSavedSwatches] = (0, react_1.useState)(() => {
        // Check for palettes under the new key first
        const savedPalettes = localStorage.getItem("colorSystemPalettes");
        if (savedPalettes) {
            try {
                return JSON.parse(savedPalettes);
            }
            catch (e) {
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
            }
            catch (e) {
                console.error("Failed to migrate old palettes:", e);
                return {};
            }
        }
        return {};
    });
    const [isSavingMode, setIsSavingMode] = (0, react_1.useState)(false);
    const [showRemoveConfirmModal, setShowRemoveConfirmModal] = (0, react_1.useState)(false);
    const [paletteToRemove, setPaletteToRemove] = (0, react_1.useState)(null);
    const [isDarkMode, setIsDarkMode] = (0, react_1.useState)(() => {
        const savedTheme = localStorage.getItem("theme");
        return savedTheme ? savedTheme === "dark" : false;
    });
    const [showQuickGuide, setShowQuickGuide] = (0, react_1.useState)(false);
    const dropdownRef = (0, react_1.useRef)(null);
    const location = (0, react_router_dom_1.useLocation)();
    const cancelButtonRef = (0, react_1.useRef)(null);
    const currentSwatches = (0, react_1.useMemo)(() => {
        return activeTab === "simple"
            ? swatchesSimple
            : activeTab === "custom"
                ? swatchesCustom
                : swatchesAdvanced;
    }, [activeTab, swatchesSimple, swatchesCustom, swatchesAdvanced]);
    // Swatch refs for keyboard navigation (must come after currentSwatches)
    const swatchRefs = (0, react_1.useMemo)(() => currentSwatches.map(() => (0, react_1.createRef)()), [currentSwatches.length]);
    (0, react_1.useEffect)(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current &&
                !dropdownRef.current.contains(event.target)) {
                setShowFiltersDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    (0, react_1.useEffect)(() => {
        localStorage.setItem(STORAGE_KEY + "_simple", JSON.stringify(swatchesSimple));
    }, [swatchesSimple]);
    (0, react_1.useEffect)(() => {
        localStorage.setItem(STORAGE_KEY + "_advanced", JSON.stringify(swatchesAdvanced));
    }, [swatchesAdvanced]);
    (0, react_1.useEffect)(() => {
        localStorage.setItem(HEX_STORAGE_KEY, keyHexCode);
        // Always update Custom mode swatches when key hex code changes
        const r = parseInt(keyHexCode.slice(0, 2), 16);
        const g = parseInt(keyHexCode.slice(2, 4), 16);
        const b = parseInt(keyHexCode.slice(4, 6), 16);
        const lValue = Math.round((0, colorUtils_1.hexToLabLightness)(`#${keyHexCode}`));
        setSwatchesCustom((prevSwatches) => {
            // Update only the swatch with ID 1 (key hex code swatch)
            return prevSwatches.map((swatch) => swatch.id === 1
                ? {
                    ...swatch,
                    lValue,
                    hexColor: `#${keyHexCode}`,
                    whiteContrast: (0, colorUtils_1.calculateContrastRatio)(`#${keyHexCode}`),
                    blackContrast: (0, colorUtils_1.calculateContrastRatio)(`#${keyHexCode}`, "#000000"),
                }
                : swatch);
        });
    }, [keyHexCode]);
    (0, react_1.useEffect)(() => {
        localStorage.setItem(CUSTOM_RAMPS_STORAGE_KEY, JSON.stringify(swatchesCustom));
    }, [swatchesCustom]);
    const handleHexCodeChange = (e) => {
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
            const { h, s, b } = (0, colorUtils_1.hexToHsb)(inputHexCode);
            setHslValues({ h, s, b });
            setHue(h);
            setIsHexDirty(false);
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            updateHexCode();
        }
    };
    const handleFilterToggle = (0, react_1.useCallback)((e) => {
        setIsFiltering(e.target.checked);
    }, []);
    const currentLValues = (0, react_1.useMemo)(() => {
        return currentSwatches.map((s) => s.lValue);
    }, [currentSwatches]);
    const handleWcagChange = (level) => {
        setWcagLevel(level);
    };
    const handleSwatchClick = (id) => {
        // For all tabs, toggle the active state
        if (isPickingColor && activeSwatchId === id) {
            // If clicking the same swatch while picking, deactivate it
            setIsPickingColor(false);
            setActiveSwatchId(null);
            setActiveLValue(null);
        }
        else {
            // If clicking a different swatch or not picking, activate it
            setIsPickingColor(true);
            setActiveSwatchId(id);
            // Do NOT update selectedSwatchId here
            // Get the correct swatch array based on active tab
            const swatchArray = activeTab === "simple"
                ? swatchesSimple
                : activeTab === "advanced"
                    ? swatchesAdvanced
                    : swatchesCustom;
            // Find the swatch with the matching ID
            const selectedSwatch = swatchArray.find((s) => s.id === id);
            if (selectedSwatch) {
                setActiveLValue(selectedSwatch.lValue);
                // Store the original color when entering color picking mode
                const setCurrentSwatches = activeTab === "simple"
                    ? setSwatchesSimple
                    : activeTab === "advanced"
                        ? setSwatchesAdvanced
                        : setSwatchesCustom;
                setCurrentSwatches((prevSwatches) => prevSwatches.map((swatch) => swatch.id === id
                    ? {
                        ...swatch,
                        originalHexColor: swatch.hexColor,
                    }
                    : swatch));
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
    const handleLValueChange = (id, value) => {
        const setCurrentSwatches = activeTab === "simple"
            ? setSwatchesSimple
            : activeTab === "advanced"
                ? setSwatchesAdvanced
                : setSwatchesCustom;
        setCurrentSwatches((prevSwatches) => prevSwatches
            .map((swatch) => {
            if (swatch.id === id) {
                const [r, g, b] = (0, colorUtils_1.labToRgb)(value);
                const hexColor = (0, colorUtils_1.rgbToHex)(r, g, b);
                return {
                    ...swatch,
                    lValue: value,
                    hexColor,
                    whiteContrast: (0, colorUtils_1.calculateContrastRatio)(hexColor),
                    blackContrast: (0, colorUtils_1.calculateContrastRatio)(hexColor, "#000000"),
                };
            }
            return swatch;
        })
            .sort((a, b) => b.lValue - a.lValue));
        // Update activeLValue if this is the active swatch
        if (id === activeSwatchId) {
            setActiveLValue(value);
        }
    };
    const handleDotClick = (0, react_1.useCallback)((dot) => {
        if (isPickingColor && activeSwatchId !== null) {
            const setCurrentSwatches = activeTab === "simple"
                ? setSwatchesSimple
                : activeTab === "advanced"
                    ? setSwatchesAdvanced
                    : setSwatchesCustom;
            setCurrentSwatches((prevSwatches) => prevSwatches.map((swatch) => swatch.id === activeSwatchId
                ? {
                    ...swatch,
                    hexColor: dot.hexColor,
                    originalHexColor: swatch.hexColor,
                    whiteContrast: (0, colorUtils_1.calculateContrastRatio)(dot.hexColor),
                    blackContrast: (0, colorUtils_1.calculateContrastRatio)(dot.hexColor, "#000000"),
                }
                : swatch));
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
    }, [isPickingColor, activeSwatchId, activeTab]);
    const handleDotHover = (0, react_1.useCallback)((dot) => {
        if (isPickingColor && activeSwatchId !== null) {
            const setCurrentSwatches = activeTab === "simple"
                ? setSwatchesSimple
                : activeTab === "advanced"
                    ? setSwatchesAdvanced
                    : setSwatchesCustom;
            setCurrentSwatches((prevSwatches) => prevSwatches.map((swatch) => {
                if (swatch.id === activeSwatchId) {
                    // If we have a dot, use its color
                    if (dot) {
                        return {
                            ...swatch,
                            hexColor: dot.hexColor,
                            whiteContrast: (0, colorUtils_1.calculateContrastRatio)(dot.hexColor),
                            blackContrast: (0, colorUtils_1.calculateContrastRatio)(dot.hexColor, "#000000"),
                        };
                    }
                    // If no dot (hovering off), restore to original color
                    return {
                        ...swatch,
                        hexColor: swatch.originalHexColor || swatch.hexColor,
                        whiteContrast: (0, colorUtils_1.calculateContrastRatio)(swatch.originalHexColor || swatch.hexColor),
                        blackContrast: (0, colorUtils_1.calculateContrastRatio)(swatch.originalHexColor || swatch.hexColor, "#000000"),
                    };
                }
                return swatch;
            }));
        }
    }, [isPickingColor, activeSwatchId, activeTab]);
    const handleAddRamp = (position = "bottom") => {
        const setCurrentSwatches = activeTab === "simple"
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
            }
            else {
                newLValue = Math.max(0, lowestLValue - 1);
            }
            const [r, g, b] = (0, colorUtils_1.labToRgb)(newLValue);
            const hexColor = (0, colorUtils_1.rgbToHex)(r, g, b);
            const newRamp = {
                id: prevSwatches.length + 1,
                lValue: newLValue,
                hexColor,
                whiteContrast: (0, colorUtils_1.calculateContrastRatio)(hexColor),
                blackContrast: (0, colorUtils_1.calculateContrastRatio)(hexColor, "#000000"),
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
                const lValue = Math.round((0, colorUtils_1.hexToLabLightness)(`#${keyHexCode}`));
                setSwatchesCustom([
                    {
                        id: 1,
                        lValue,
                        hexColor: `#${keyHexCode}`,
                        whiteContrast: (0, colorUtils_1.calculateContrastRatio)(`#${keyHexCode}`),
                        blackContrast: (0, colorUtils_1.calculateContrastRatio)(`#${keyHexCode}`, "#000000"),
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
        const maxSwatches = Math.max(...sections.map(([_, swatches]) => swatches.length));
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
            <rect x="${columnX}" y="${y}" width="${swatchWidth}" height="${swatchHeight}" fill="${swatch.hexColor}"/>
            
            <text x="${columnX + 16}" y="${y + 28}" class="text" fill="${textColor}">
              ${colorName}
            </text>
            <text x="${columnX + 16}" y="${y + 47}" class="text" fill="${textColor}">
              ${swatch.hexColor.toUpperCase()}
            </text>
            <text x="${columnX + 16}" y="${y + 101}" class="text" fill="${textColor}">
              L*=${Math.round(swatch.lValue)}
            </text>
            
            <text x="${columnX + swatchWidth - 40}" y="${y + 77}" class="text" text-anchor="end" fill="${textColor}">
              ${swatch.whiteContrast.toFixed(1)}:1
            </text>
            <circle cx="${columnX + swatchWidth - 24}" cy="${y + 72}" r="8" fill="#FFFFFF"/>
            <circle cx="${columnX + swatchWidth - 24}" cy="${y + 72}" r="8.25" stroke="${textColor}" stroke-opacity="0.16" stroke-width="0.5"/>

            <text x="${columnX + swatchWidth - 40}" y="${y + 101}" class="text" text-anchor="end" fill="${textColor}">
              ${swatch.blackContrast.toFixed(1)}:1
            </text>
            <circle cx="${columnX + swatchWidth - 24}" cy="${y + 96}" r="8" fill="#000000"/>
            <circle cx="${columnX + swatchWidth - 24}" cy="${y + 96}" r="8.25" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="0.5"/>
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
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };
    // Add new function to handle HSL changes
    const handleHslChange = (type, value) => {
        const newHslValues = { ...hslValues, [type]: value };
        setHslValues(newHslValues);
        // Convert HSL back to hex
        const h = newHslValues.h;
        const s = newHslValues.s / 100;
        const v = newHslValues.b / 100;
        const c = v * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = v - c;
        let r = 0, g = 0, b = 0;
        if (h >= 0 && h < 60) {
            [r, g, b] = [c, x, 0];
        }
        else if (h >= 60 && h < 120) {
            [r, g, b] = [x, c, 0];
        }
        else if (h >= 120 && h < 180) {
            [r, g, b] = [0, c, x];
        }
        else if (h >= 180 && h < 240) {
            [r, g, b] = [0, x, c];
        }
        else if (h >= 240 && h < 300) {
            [r, g, b] = [x, 0, c];
        }
        else {
            [r, g, b] = [c, 0, x];
        }
        const newHex = (0, colorUtils_1.rgbToHex)(Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255))
            .slice(1)
            .toUpperCase();
        setInputHexCode(newHex);
        setKeyHexCode(newHex);
        setHue(h);
        setIsHexValid(true);
        setIsHexDirty(false);
    };
    const handleHslKeyDown = (e, type) => {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            const increment = e.shiftKey ? 10 : 1;
            const currentValue = hslValues[type];
            const max = type === "h" ? 360 : 100;
            const min = 0;
            let newValue = currentValue;
            if (e.key === "ArrowUp") {
                newValue = Math.min(max, currentValue + increment);
            }
            else {
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
    const handleRectangleClick = (sectionTitle) => {
        if (!isSavingMode)
            return;
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
    const handleRemovePalette = (sectionTitle) => {
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
    (0, react_1.useEffect)(() => {
        localStorage.setItem("colorSystemPalettes", JSON.stringify(savedSwatches));
    }, [savedSwatches]);
    const handleDrawerClose = () => {
        setIsColorSystemOpen(false);
        setIsSavingMode(false);
        setPulsingRectangle(null);
    };
    // Update the effect to use the new handler
    (0, react_1.useEffect)(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                if (isPickingColor) {
                    setIsPickingColor(false);
                    setActiveSwatchId(null);
                    setActiveLValue(null);
                }
                else if (isColorSystemOpen) {
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
    (0, react_1.useEffect)(() => {
        const timer = setTimeout(() => {
            setIsFiltering(true);
        }, 320);
        return () => clearTimeout(timer);
    }, []);
    // Add a handler to remove a ramp by id
    const handleRemoveCustomRamp = (id) => {
        setSwatchesCustom((prevSwatches) => prevSwatches.filter((swatch) => swatch.id !== id));
    };
    (0, react_1.useEffect)(() => {
        if (isColorSystemOpen) {
            document.body.classList.add("drawer-open");
        }
        else {
            document.body.classList.remove("drawer-open");
        }
        return () => {
            document.body.classList.remove("drawer-open");
        };
    }, [isColorSystemOpen]);
    (0, react_1.useEffect)(() => {
        document.documentElement.setAttribute("data-theme", isDarkMode ? "dark" : "light");
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
    return (<div className="app">
      <MobileLayout_1.default />
      <react_router_dom_1.Routes>
        <react_router_dom_1.Route path="/" element={<>
              <header className="app-header">
                <h1>
                  Color Grid Tool
                  <span className="version-number">
                    v.{package_json_1.default.version}
                  </span>
                </h1>
                <div className="header-actions">
                  <button onClick={() => {
                // Track contrast grid view
                if (typeof window.gtag !== "undefined") {
                    window.gtag("event", "view_contrast_grid", {
                        grid_size: activeTab,
                        color_count: currentSwatches.length,
                    });
                }
                window.open(`/contrast-grid?tab=${activeTab === "simple"
                    ? "simple"
                    : activeTab === "advanced"
                        ? "advanced"
                        : "custom"}&swatches=${encodeURIComponent(JSON.stringify(currentSwatches))}`, "_blank");
            }} className="btn btn-secondary">
                    <grid_svg_1.ReactComponent />
                    View Contrast Grid
                  </button>
                  <div className="filters-dropdown" ref={dropdownRef}>
                    <button onClick={() => setShowFiltersDropdown(!showFiltersDropdown)} className="btn btn-secondary">
                      <eye_svg_1.ReactComponent />
                      WCAG Filters
                    </button>
                    {showFiltersDropdown && (<div className="dropdown-menu">
                        <div className="wcag-filters" style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                }}>
                          <label className="filter-option">
                            <input type="checkbox" checked={wcagLevel === "A"} onChange={() => handleWcagChange(wcagLevel === "A" ? "none" : "A")}/>
                            WCAG A (3:1)
                          </label>
                          <label className="filter-option">
                            <input type="checkbox" checked={wcagLevel === "AA"} onChange={() => handleWcagChange(wcagLevel === "AA" ? "none" : "AA")}/>
                            WCAG AA (4.5:1)
                          </label>
                          <label className="filter-option">
                            <input type="checkbox" checked={wcagLevel === "AAA"} onChange={() => handleWcagChange(wcagLevel === "AAA" ? "none" : "AAA")}/>
                            WCAG AAA (7:1)
                          </label>
                        </div>
                      </div>)}
                  </div>
                  <button className="btn" onClick={() => setIsColorSystemOpen(!isColorSystemOpen)}>
                    <color_svg_1.ReactComponent />
                    Color System
                  </button>
                  <button className="btn btn-secondary btn-icon-only" onClick={toggleTheme} aria-label={isDarkMode
                ? "Switch to light mode"
                : "Switch to dark mode"}>
                    {isDarkMode ? <light_mode_svg_1.ReactComponent /> : <dark_mode_svg_1.ReactComponent />}
                  </button>
                </div>
              </header>

              <div className={`right-drawer ${isColorSystemOpen ? "open" : ""}`}>
                <div className="drawer-header">
                  <span className="drawer-title">Color System</span>
                  <div className="drawer-actions">
                    <button className="btn" onClick={handleExportColors} disabled={Object.keys(savedSwatches).length === 0}>
                      <download_svg_1.ReactComponent />
                      Download System
                    </button>
                    <button className="btn-secondary btn-icon-only" onClick={handleDrawerClose} aria-label="Close drawer">
                      <close_svg_1.ReactComponent />
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
                    scores = (0, evaluateColorSystem_1.evaluateColorSystem)(hexColors);
                }
                return (<div className="right-drawer-section" key={section.title}>
                        <div className="section-title">{section.title}</div>
                        <div className="section-desc">{section.text}</div>
                        <div className="section-row">
                          <div className={savedSwatches[sectionKey]
                        ? `filled-state${isSavingMode ? " saving-mode pulsing" : ""}`
                        : `empty-state${pulsingRectangle === "all" ? " pulsing" : ""}${isSavingMode ? " saving-mode" : ""}`} onClick={() => handleRectangleClick(section.title)}>
                            {palette.map((swatch) => (<div key={swatch.id} className="color-swatch" style={{
                            backgroundColor: swatch.hexColor,
                            height: "100%",
                            border: "1px solid #222",
                        }}/>))}
                          </div>
                          <div style={{ display: "flex", gap: "4px" }}>
                            {/* <button
                      className="btn btn-icon-only"
                      aria-label="Edit"
                    >
                      <PencilIcon />
                    </button> */}
                            <button className="btn btn-destructive btn-icon-only" aria-label="Remove" onClick={() => handleRemovePalette(section.title)} disabled={!savedSwatches[sectionKey]}>
                              <trash_svg_1.ReactComponent />
                            </button>
                          </div>
                        </div>
                        {/* Score Pills Row */}
                        <div className="score-pill-row">
                          <ScorePill_1.default score={scores ? scores.overallScore : NaN} label="Overall:"/>
                          <ScorePill_1.default score={scores ? scores.visualQualityScore : NaN} label="Visual Quality:"/>
                          <ScorePill_1.default score={scores
                        ? scores.normalizedContrastScore * 100
                        : NaN} label="Accessibility:"/>
                        </div>
                      </div>);
            })}
                </div>
              </div>

              <div className={`drawer-backdrop ${isColorSystemOpen ? "open" : ""}`} onClick={handleDrawerClose} role="presentation"/>

              <div className="main-container">
                <div className="left-drawer">
                  <div className="left-drawer-section">
                    <h3>Key Hex Code</h3>
                    <div className="hex-control">
                      <div className="hex-input-group input-flex-center">
                        <input type="color" value={`#${inputHexCode}`} onChange={(e) => {
                const newHex = e.target.value
                    .slice(1)
                    .toUpperCase();
                setInputHexCode(newHex);
                setIsHexValid(true);
                setIsHexDirty(newHex !== keyHexCode);
                if (newHex !== keyHexCode) {
                    setKeyHexCode(newHex);
                    const { h, s, b } = (0, colorUtils_1.hexToHsb)(newHex);
                    setHslValues({ h, s, b });
                    setHue(h);
                }
            }} className="color-picker" title="Pick a color"/>
                        <input type="text" value={inputHexCode} onChange={handleHexCodeChange} onKeyPress={handleKeyPress} placeholder="000000" className="standard-input input-prefix-hex"/>
                        <button onClick={updateHexCode} className={`btn-secondary btn-icon-only ${!isHexValid || !isHexDirty ? "disabled" : ""}`}>
                          <chevron_right_svg_1.ReactComponent />
                        </button>
                      </div>
                      <div className="hsv-inputs">
                        <input type="number" value={hslValues.h} onChange={(e) => handleHslChange("h", parseInt(e.target.value) || 0)} onKeyDown={(e) => handleHslKeyDown(e, "h")} min="0" max="360" className="standard-input input-prefix-h hsv-input"/>
                        <input type="number" value={hslValues.s} onChange={(e) => handleHslChange("s", parseInt(e.target.value) || 0)} onKeyDown={(e) => handleHslKeyDown(e, "s")} min="0" max="100" className="standard-input input-prefix-s hsv-input"/>
                        <input type="number" value={hslValues.b} onChange={(e) => handleHslChange("b", parseInt(e.target.value) || 0)} onKeyDown={(e) => handleHslKeyDown(e, "b")} min="0" max="100" className="standard-input input-prefix-b hsv-input"/>
                      </div>
                    </div>
                  </div>

                  <div className="left-drawer-section">
                    <div className="section-header">
                      <h3>Filter by Color Ramp</h3>
                      <label className="filter-toggle">
                        <input type="checkbox" checked={isFiltering} onChange={handleFilterToggle} aria-label="Filter by Color Ramp"/>
                        <span className="toggle-slider"/>
                      </label>
                    </div>
                    <div className="tabs">
                      <button className={`tab ${activeTab === "simple" ? "active" : ""}`} onClick={() => handleTabChange("simple")}>
                        Simple
                      </button>
                      <button className={`tab ${activeTab === "advanced" ? "active" : ""}`} onClick={() => handleTabChange("advanced")}>
                        Advanced
                      </button>
                      <button className={`tab ${activeTab === "custom" ? "active" : ""}`} onClick={() => handleTabChange("custom")}>
                        Custom
                      </button>
                    </div>
                    <div className="color-ramps">
                      {activeTab === "custom" && (<div className="dashed-rectangle" style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                }} onClick={() => handleAddRamp("top")} tabIndex={0} role="button" aria-label="Add ramp at top">
                          <add_alt_svg_1.ReactComponent className="dashed-rectangle-add-icon"/>
                        </div>)}
                      {activeTab === "simple"
                ? swatchesSimple.map((swatch, idx) => (<ColorSwatch_1.default key={swatch.id} swatch={swatch} isActive={swatch.id === activeSwatchId} onLValueChange={handleLValueChange} onClick={handleSwatchClick} ref={swatchRefs[idx]} onSwatchKeyDown={(e) => {
                        var _a, _b;
                        if (e.key === "ArrowRight" &&
                            idx < swatchRefs.length - 1) {
                            (_a = swatchRefs[idx + 1].current) === null || _a === void 0 ? void 0 : _a.focus();
                        }
                        else if (e.key === "ArrowLeft" && idx > 0) {
                            (_b = swatchRefs[idx - 1].current) === null || _b === void 0 ? void 0 : _b.focus();
                        }
                    }}/>))
                : activeTab === "custom"
                    ? swatchesCustom.map((swatch, idx) => (<ColorSwatch_1.default key={swatch.id} swatch={swatch} isActive={swatch.id === activeSwatchId} onLValueChange={handleLValueChange} onClick={handleSwatchClick} isKeyHexCode={swatch.id === 1} removeButton={swatch.id !== 1 ? (<button className="btn btn-icon-only btn-destructive small" onClick={() => handleRemoveCustomRamp(swatch.id)} aria-label="Remove ramp">
                                    <remove_svg_1.ReactComponent />
                                  </button>) : null} ref={swatchRefs[idx]} onSwatchKeyDown={(e) => {
                            var _a, _b;
                            if (e.key === "ArrowRight" &&
                                idx < swatchRefs.length - 1) {
                                (_a = swatchRefs[idx + 1].current) === null || _a === void 0 ? void 0 : _a.focus();
                            }
                            else if (e.key === "ArrowLeft" && idx > 0) {
                                (_b = swatchRefs[idx - 1].current) === null || _b === void 0 ? void 0 : _b.focus();
                            }
                        }}/>))
                    : swatchesAdvanced.map((swatch, idx) => (<ColorSwatch_1.default key={swatch.id} swatch={swatch} isActive={swatch.id === activeSwatchId} onLValueChange={handleLValueChange} onClick={handleSwatchClick} ref={swatchRefs[idx]} onSwatchKeyDown={(e) => {
                            var _a, _b;
                            if (e.key === "ArrowRight" &&
                                idx < swatchRefs.length - 1) {
                                (_a = swatchRefs[idx + 1].current) === null || _a === void 0 ? void 0 : _a.focus();
                            }
                            else if (e.key === "ArrowLeft" && idx > 0) {
                                (_b = swatchRefs[idx - 1].current) === null || _b === void 0 ? void 0 : _b.focus();
                            }
                        }}/>))}
                    </div>
                  </div>
                  <div className="left-drawer-section">
                    <div className="ramp-actions">
                      {activeTab === "custom" &&
                false /* Remove Ramp button removed */}
                      <button className="btn btn-secondary btn-full" onClick={handleResetRamps} title="Reset to default ramps">
                        <reset_svg_1.ReactComponent />
                        Reset Ramps
                      </button>
                    </div>
                    <div className="ramp-actions save-actions">
                      <button className="btn btn-full" onClick={handleSaveToColorSystem}>
                        <color_svg_1.ReactComponent />
                        Save to Color System
                      </button>
                    </div>
                  </div>
                </div>

                <div className="main-content">
                  <div className="grid-container">
                    <ColorGrid_1.default hue={hue} isFiltering={isFiltering} isATextContrast={wcagLevel === "A"} isAATextContrast={wcagLevel === "AA"} isAAATextContrast={wcagLevel === "AAA"} lValues={currentLValues} onDotClick={handleDotClick} onDotHover={handleDotHover} keyHexCode={keyHexCode} isPickingColor={isPickingColor} activeLValue={activeLValue} clearActiveDotsSignal={clearActiveDotsSignal} activeTab={activeTab} activeSwatchId={isPickingColor ? activeSwatchId : selectedSwatchId}/>
                    {isFiltering && (<div className="guide-overlay" dangerouslySetInnerHTML={{ __html: guideSvg }}/>)}
                  </div>
                </div>
              </div>
              {showToast && (<Toast_1.default message="Hex code copied to clipboard!" onClose={() => setShowToast(false)} backgroundColor={toastHexCode}/>)}
            </>}/>
        <react_router_dom_1.Route path="/contrast-grid" element={<ContrastGrid_1.default swatches={(() => {
                const params = new URLSearchParams(location.search);
                const tab = params.get("tab");
                const swatchesParam = params.get("swatches");
                if (swatchesParam) {
                    try {
                        return JSON.parse(decodeURIComponent(swatchesParam));
                    }
                    catch (e) {
                        console.error("Failed to parse swatches:", e);
                    }
                }
                if (tab === "custom")
                    return swatchesCustom;
                if (tab === "simple")
                    return swatchesSimple;
                if (tab === "advanced")
                    return swatchesAdvanced;
                return swatchesSimple;
            })()} title="Contrast Grid"/>}/>
        <react_router_dom_1.Route path="/button-demo" element={<ButtonDemo_1.default />}/>
        <react_router_dom_1.Route path="/scorepill-demo" element={<ScorePillDemo_1.default />}/>
      </react_router_dom_1.Routes>
      {showRemoveConfirmModal && (<AreYouSureModal_1.default onClose={() => setShowRemoveConfirmModal(false)} initialFocusRef={cancelButtonRef}>
          <div className="modal-header">
            <h2 className="heading-lg">Are you sure?</h2>
          </div>
          <div className="body-lg modal-content-message">
            This will permanently remove the palette and you'll have to recreate
            the palette swatch-by-swatch if you want it back.
          </div>
          <div className="modal-actions">
            <button ref={cancelButtonRef} className="btn btn-secondary" onClick={() => setShowRemoveConfirmModal(false)} autoFocus>
              Cancel
            </button>
            <button className="btn btn-destructive" onClick={confirmRemovePalette}>
              Remove
            </button>
          </div>
        </AreYouSureModal_1.default>)}
      <button className="btn-fab" onClick={() => setShowQuickGuide(true)} aria-label="Quick Guide">
        <info_svg_1.ReactComponent />
        Quick Guide
      </button>
      {showQuickGuide && (<QuickGuideModal_1.default onClose={() => setShowQuickGuide(false)}/>)}
    </div>);
};
exports.default = App;
