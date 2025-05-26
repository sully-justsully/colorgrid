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
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const colorUtils_1 = require("../utils/colorUtils");
const useColorGrid_1 = require("../hooks/useColorGrid");
require("../styles/ColorGrid.css");
// Create a cache outside the component to persist between renders
const globalColorCache = new Map();
const ColorGrid = ({ hue, isFiltering, isATextContrast, isAATextContrast, isAAATextContrast, lValues, onDotClick, onDotHover, keyHexCode, isPickingColor, activeLValue, clearActiveDotsSignal, activeTab, activeSwatchId, }) => {
    const { handleDotClick: handleGridDotClick, isDotActive, clearActiveDots, activeDots, } = (0, useColorGrid_1.useColorGrid)(activeTab);
    // Tooltip state
    const [hoveredDot, setHoveredDot] = (0, react_1.useState)(null);
    const [tooltipPos, setTooltipPos] = (0, react_1.useState)(null);
    const gridRef = (0, react_1.useRef)(null);
    // Add a ref to track previous activeSwatchId
    const prevActiveSwatchId = (0, react_1.useRef)(activeSwatchId);
    (0, react_1.useEffect)(() => {
        if (prevActiveSwatchId.current !== activeSwatchId) {
            console.log("activeSwatchId changed:", activeSwatchId);
            prevActiveSwatchId.current = activeSwatchId;
        }
    }, [activeSwatchId]);
    // Memoize the color cache calculation with improved caching
    const colorCache = (0, react_1.useMemo)(() => {
        // Check if we already have a cache for this hue
        if (globalColorCache.has(hue)) {
            return globalColorCache.get(hue);
        }
        const newColorCache = Array(101)
            .fill(null)
            .map(() => Array(101).fill(null));
        // Use a more efficient loop structure
        for (let brightness = 0; brightness <= 100; brightness++) {
            for (let saturation = 0; saturation <= 100; saturation++) {
                const [r, g, b] = (0, colorUtils_1.hsbToRgb)(hue, saturation, brightness);
                const hexColor = (0, colorUtils_1.rgbToHex)(r, g, b).toUpperCase();
                const labLightness = Math.round((0, colorUtils_1.hexToLabLightness)(hexColor));
                newColorCache[brightness][saturation] = {
                    hexColor,
                    labLightness,
                    hsbText: `H: ${hue}° S: ${saturation}% B: ${brightness}%`,
                };
            }
        }
        // Store in global cache
        globalColorCache.set(hue, newColorCache);
        // Limit cache size to prevent memory issues
        if (globalColorCache.size > 10) {
            const firstKey = globalColorCache.keys().next().value;
            if (firstKey !== undefined) {
                globalColorCache.delete(firstKey);
            }
        }
        return newColorCache;
    }, [hue]);
    // Memoize the dots calculation with improved filtering
    const dots = (0, react_1.useMemo)(() => {
        var _a;
        const newDots = [];
        const lValuesSet = new Set(lValues);
        const keyHsb = keyHexCode ? (0, colorUtils_1.hexToHsb)(keyHexCode) : null;
        // Pre-calculate contrast thresholds
        const contrastThresholds = {
            a: isATextContrast ? 3 : 0,
            aa: isAATextContrast ? 4.5 : 0,
            aaa: isAAATextContrast ? 7 : 0,
        };
        // Use a more efficient loop structure
        for (let row = 0; row < 101; row++) {
            for (let col = 0; col < 101; col++) {
                const brightness = 100 - row;
                const saturation = col;
                const cached = (_a = colorCache[brightness]) === null || _a === void 0 ? void 0 : _a[col];
                if (cached) {
                    const isActive = keyHsb !== null &&
                        Math.abs(keyHsb.h - hue) < 1 &&
                        Math.abs(keyHsb.s - saturation) < 1 &&
                        Math.abs(keyHsb.b - brightness) < 1;
                    const dotKey = `${row}-${col}`;
                    let isFiltered = false;
                    // Check if this dot is active for any swatch
                    const isActiveForAnySwatch = Array.from(activeDots.values()).includes(dotKey);
                    // Skip filtering for the key hex code dot or any active dot
                    if (!isActive && !isActiveForAnySwatch) {
                        // Apply all filters in a single pass
                        if (isFiltering && lValuesSet.size > 0) {
                            isFiltered = !lValuesSet.has(cached.labLightness);
                        }
                        if (!isFiltered &&
                            (isATextContrast || isAATextContrast || isAAATextContrast)) {
                            const contrastRatio = (0, colorUtils_1.calculateContrastRatio)(cached.hexColor);
                            isFiltered =
                                contrastRatio <
                                    Math.max(contrastThresholds.a, contrastThresholds.aa, contrastThresholds.aaa);
                        }
                        if (isPickingColor && activeLValue !== null) {
                            isFiltered = Math.abs(cached.labLightness - activeLValue) > 0.5;
                        }
                    }
                    const isInActiveDots = activeSwatchId !== null
                        ? isDotActive(dotKey, activeSwatchId)
                        : false;
                    const dot = {
                        row,
                        col,
                        hexColor: cached.hexColor,
                        labLightness: cached.labLightness,
                        hsbText: cached.hsbText,
                        isActive,
                        isFiltered,
                        isInActiveDots,
                    };
                    newDots.push(dot);
                }
            }
        }
        return newDots;
    }, [
        colorCache,
        hue,
        isFiltering,
        isATextContrast,
        isAATextContrast,
        isAAATextContrast,
        lValues,
        keyHexCode,
        isPickingColor,
        activeLValue,
        isDotActive,
        activeSwatchId,
        activeDots,
    ]);
    const handleDotClick = (0, react_1.useCallback)((dot) => {
        if (isPickingColor && activeSwatchId !== null) {
            handleGridDotClick(dot, activeSwatchId);
            onDotClick(dot);
        }
    }, [handleGridDotClick, onDotClick, isPickingColor, activeSwatchId]);
    // Memoize the rendered dots
    const renderedDots = (0, react_1.useMemo)(() => {
        // Get all active dot keys
        const activeDotKeys = new Set(Array.from(activeDots.values()));
        return dots.map((dot) => {
            const dotKey = `${dot.row}-${dot.col}`;
            const isSelected = activeDotKeys.has(dotKey);
            if (isSelected) {
                console.log("Dot", dotKey, "isSelected for any swatch");
            }
            return (<div key={dotKey} data-testid="color-dot" className={`dot ${dot.isActive ? "active" : ""} ${dot.isFiltered ? "filtered" : ""} ${isSelected ? "selected" : ""}`} style={{ backgroundColor: dot.hexColor }} onClick={() => {
                    console.log("Dot clicked:", {
                        dotKey,
                        isPickingColor,
                        activeSwatchId,
                        dot,
                    });
                    handleDotClick(dot);
                }} onMouseEnter={(e) => {
                    var _a;
                    setHoveredDot(dot);
                    // Calculate position relative to grid
                    const gridRect = (_a = gridRef.current) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
                    const dotRect = e.target.getBoundingClientRect();
                    if (gridRect) {
                        // Calculate initial position
                        let left = dotRect.left - gridRect.left;
                        let top = dotRect.top - gridRect.top;
                        // Pre-calculate the final position based on dot location
                        const isTopHalf = dot.row < 50;
                        const isLeftHalf = dot.col < 50;
                        // Adjust position based on dot location
                        if (isTopHalf) {
                            // Show below dot
                            top += 18; // dot height (10px) + gap (8px)
                        }
                        else {
                            // Show above dot
                            top -= 78; // tooltip height (60px) + gap (8px) + dot height (10px)
                        }
                        if (!isLeftHalf) {
                            // Anchor right
                            left += 0; // move to right edge of dot
                            left -= 140; // shift left by tooltip width
                        }
                        setTooltipPos({ left, top, isTopHalf, isLeftHalf });
                    }
                    // Call onDotHover if provided
                    if (onDotHover) {
                        onDotHover(dot);
                    }
                }} onMouseLeave={() => {
                    setHoveredDot(null);
                    setTooltipPos(null);
                    // Call onDotHover with null if provided
                    if (onDotHover) {
                        onDotHover(null);
                    }
                }}/>);
        });
    }, [
        dots,
        handleDotClick,
        activeDots,
        isPickingColor,
        activeSwatchId,
        onDotHover,
    ]);
    // Ref for tooltip to measure its size
    const tooltipRef = (0, react_1.useRef)(null);
    // Tooltip position class
    let tooltipPositionClass = "";
    if (hoveredDot) {
        const isTopHalf = hoveredDot.row < 50;
        const isLeftHalf = hoveredDot.col < 50;
        tooltipPositionClass = isTopHalf
            ? isLeftHalf
                ? "tooltip-top-left"
                : "tooltip-top-right"
            : isLeftHalf
                ? "tooltip-bottom-left"
                : "tooltip-bottom-right";
    }
    // Debug: log tooltip position and hovered dot
    if (hoveredDot && tooltipPos) {
        console.log("TooltipPos:", tooltipPos, "HoveredDot:", hoveredDot);
    }
    // Effect: clear active dots when signal changes
    (0, react_1.useEffect)(() => {
        if (clearActiveDotsSignal !== undefined) {
            clearActiveDots();
        }
    }, [clearActiveDotsSignal, clearActiveDots]);
    console.log("ColorGrid render: activeSwatchId", activeSwatchId);
    return (<div className="dot-grid-wrapper" ref={gridRef} style={{ position: "relative" }}>
      <div className="color-grid" data-testid="color-grid">
        {renderedDots}
      </div>
      {hoveredDot && tooltipPos && (<div ref={tooltipRef} className={`hex-tooltip ${tooltipPositionClass}`} style={{
                position: "absolute",
                left: tooltipPos.left,
                top: tooltipPos.top,
                pointerEvents: "none",
                minWidth: 100,
            }}>
          <div className="hex-value">{hoveredDot.hexColor}</div>
          <div className="lab-value">L*: {hoveredDot.labLightness}</div>
          <div className="hsb-value">{hoveredDot.hsbText}</div>
        </div>)}
    </div>);
};
exports.default = react_1.default.memo(ColorGrid);
