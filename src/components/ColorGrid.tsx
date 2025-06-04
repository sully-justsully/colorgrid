import React, {
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useState,
} from "react";
import { Dot, ColorCache, ColorSwatch as ColorSwatchType } from "../types";
import {
  hsbToRgb,
  rgbToHex,
  hexToLabLightness,
  calculateContrastRatio,
  hexToHsb,
} from "../utils/colorUtils";
import { useColorGrid } from "../hooks/useColorGrid";
import "../styles/ColorGrid.css";

// Create a cache outside the component to persist between renders
const globalColorCache = new Map<number, ColorCache[][]>();

interface ColorGridProps {
  hue: number;
  isFiltering: boolean;
  isATextContrast: boolean;
  isAATextContrast: boolean;
  isAAATextContrast: boolean;
  lValues: number[];
  onDotClick: (dot: Dot) => void;
  onDotHover?: (dot: Dot | null) => void;
  keyHexCode: string;
  isPickingColor: boolean;
  activeLValue: number | null;
  clearActiveDotsSignal: number;
  activeTab: "simple" | "lightness" | "hex";
  activeSwatchId: number | null;
  forceGrayscale?: boolean;
  swatches: ColorSwatchType[];
}

const ColorGrid: React.FC<ColorGridProps> = ({
  hue,
  isFiltering,
  isATextContrast,
  isAATextContrast,
  isAAATextContrast,
  lValues,
  onDotClick,
  onDotHover,
  keyHexCode,
  isPickingColor,
  activeLValue,
  clearActiveDotsSignal,
  activeTab,
  activeSwatchId,
  forceGrayscale,
  swatches,
}) => {
  const {
    handleDotClick: handleGridDotClick,
    isDotActive,
    clearActiveDots,
    activeDots,
  } = useColorGrid(activeTab);

  // Tooltip state
  const [hoveredDot, setHoveredDot] = useState<null | Dot>(null);
  const [tooltipPos, setTooltipPos] = useState<{
    left: number;
    top: number;
    isTopHalf: boolean;
    isLeftHalf: boolean;
  } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Add a ref to track previous activeSwatchId
  const prevActiveSwatchId = useRef(activeSwatchId);
  useEffect(() => {
    if (prevActiveSwatchId.current !== activeSwatchId) {
      console.log("activeSwatchId changed:", activeSwatchId);
      prevActiveSwatchId.current = activeSwatchId;
    }
  }, [activeSwatchId]);

  // Memoize the color cache calculation with improved caching
  const colorCache = useMemo(() => {
    // Check if we already have a cache for this hue
    if (globalColorCache.has(hue)) {
      return globalColorCache.get(hue)!;
    }

    const newColorCache: ColorCache[][] = Array(101)
      .fill(null)
      .map(() => Array(101).fill(null));

    // Use a more efficient loop structure
    for (let brightness = 0; brightness <= 100; brightness++) {
      for (let saturation = 0; saturation <= 100; saturation++) {
        const [r, g, b] = hsbToRgb(hue, saturation, brightness);
        const hexColor = rgbToHex(r, g, b).toUpperCase();
        const labLightness = Math.round(hexToLabLightness(hexColor));
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
  const dots = useMemo(() => {
    const newDots: Dot[] = [];
    const lValuesSet = new Set(lValues);
    const keyHsb =
      activeTab === "hex"
        ? null
        : !forceGrayscale && keyHexCode
        ? hexToHsb(keyHexCode)
        : null;

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
        const saturation = activeTab === "hex" ? 0 : forceGrayscale ? 0 : col;
        const cached = colorCache[brightness]?.[col];

        if (cached) {
          // For HEX tab, always use grayscale color
          let dotHexColor = cached.hexColor;
          if (activeTab === "hex" || forceGrayscale) {
            const [r, g, b] = hsbToRgb(hue, 0, brightness);
            dotHexColor = rgbToHex(r, g, b).toUpperCase();
          }

          // In forceGrayscale mode or hex tab, never show the key hex code dot
          const isActive =
            activeTab !== "hex" &&
            !forceGrayscale &&
            keyHsb !== null &&
            Math.abs(keyHsb.h - hue) < 1 &&
            Math.abs(keyHsb.s - saturation) < 1 &&
            Math.abs(keyHsb.b - brightness) < 1;

          const dotKey = `${row}-${col}`;
          let isFiltered = false;

          // Check if this dot is active for any swatch
          const isActiveForAnySwatch = Array.from(activeDots.values()).includes(
            dotKey
          );

          // Skip filtering for the key hex code dot or any active dot
          if (!isActive && !isActiveForAnySwatch) {
            // Apply all filters in a single pass
            if (isFiltering && lValuesSet.size > 0) {
              isFiltered = !lValuesSet.has(cached.labLightness);
            }

            if (
              !isFiltered &&
              (isATextContrast || isAATextContrast || isAAATextContrast)
            ) {
              const contrastRatio = calculateContrastRatio(dotHexColor);
              isFiltered =
                contrastRatio <
                Math.max(
                  contrastThresholds.a,
                  contrastThresholds.aa,
                  contrastThresholds.aaa
                );
            }

            // Only filter by activeLValue when explicitly picking a color, not on hover
            if (isPickingColor && activeLValue !== null && !onDotHover) {
              isFiltered = Math.abs(cached.labLightness - activeLValue) > 0.5;
            }
          }

          const isInActiveDots = forceGrayscale
            ? false
            : activeSwatchId !== null
            ? isDotActive(dotKey, activeSwatchId)
            : false;

          const dot: Dot = {
            row,
            col,
            hexColor: dotHexColor,
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
    forceGrayscale,
    onDotHover,
    activeTab,
  ]);

  const handleDotClick = useCallback(
    (dot: Dot) => {
      // Always use a valid swatch ID (default to 0 if null)
      const swatchId = activeSwatchId ?? 0;
      handleGridDotClick(dot, swatchId);
      onDotClick(dot);
    },
    [handleGridDotClick, onDotClick, activeSwatchId]
  );

  // Precompute a map of swatch color to the first matching dot key
  const swatchDotMap = useMemo(() => {
    const map = new Map();
    swatches.forEach((swatch) => {
      const match = dots.find(
        (d) => d.hexColor.toUpperCase() === swatch.hexColor.toUpperCase()
      );
      if (match) {
        map.set(swatch.hexColor.toUpperCase(), `${match.row}-${match.col}`);
      }
    });
    return map;
  }, [swatches, dots]);

  // Memoize the rendered dots
  const renderedDots = useMemo(() => {
    return dots.map((dot) => {
      const dotKey = `${dot.row}-${dot.col}`;
      const isSelected =
        swatchDotMap.has(dot.hexColor.toUpperCase()) &&
        swatchDotMap.get(dot.hexColor.toUpperCase()) === dotKey;
      return (
        <div
          key={dotKey}
          data-testid="color-dot"
          className={`dot ${dot.isActive ? "active" : ""} ${
            dot.isFiltered ? "filtered" : ""
          } ${isSelected ? "selected" : ""}`}
          style={{ backgroundColor: dot.hexColor }}
          onClick={() => handleDotClick(dot)}
          onMouseEnter={(e) => {
            setHoveredDot(dot);
            // Calculate position relative to grid
            const gridRect = gridRef.current?.getBoundingClientRect();
            const dotRect = (e.target as HTMLElement).getBoundingClientRect();
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
              } else {
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
          }}
          onMouseLeave={() => {
            setHoveredDot(null);
            setTooltipPos(null);
            // Call onDotHover with null if provided
            if (onDotHover) {
              onDotHover(null);
            }
          }}
        />
      );
    });
  }, [
    dots,
    handleDotClick,
    isDotActive,
    activeSwatchId,
    onDotHover,
    swatchDotMap,
  ]);

  // Ref for tooltip to measure its size
  const tooltipRef = useRef<HTMLDivElement>(null);

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
  useEffect(() => {
    if (clearActiveDotsSignal !== undefined) {
      clearActiveDots();
    }
  }, [clearActiveDotsSignal, clearActiveDots]);

  console.log("ColorGrid render: activeSwatchId", activeSwatchId);

  return (
    <div
      className="dot-grid-wrapper"
      ref={gridRef}
      style={{ position: "relative" }}
    >
      <div className="color-grid" data-testid="color-grid">
        {renderedDots}
      </div>
      {hoveredDot && tooltipPos && (
        <div
          ref={tooltipRef}
          className={`hex-tooltip ${
            hoveredDot.labLightness < 50 ? "light-text" : "dark-text"
          }`}
          style={{
            position: "absolute",
            left: tooltipPos.left,
            top: tooltipPos.top,
            pointerEvents: "none",
            minWidth: 100,
            backgroundColor: hoveredDot.hexColor,
          }}
        >
          <div className="hex-value">{hoveredDot.hexColor}</div>
          <div className="lab-value">L*: {hoveredDot.labLightness}</div>
          <div className="hsb-value">{hoveredDot.hsbText}</div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ColorGrid);
