import React, {
  useMemo,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
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
  activeTab: "simple" | "lightness" | "hex";
  activeSwatchId: number | null;
  forceGrayscale?: boolean;
  swatches: ColorSwatchType[];
}

// HSB color distance function
function colorDistanceHsb(hex1: string, hex2: string) {
  const hsb1 = hexToHsb(hex1);
  const hsb2 = hexToHsb(hex2);
  // Hue is circular, so use the minimum angle difference
  const dh =
    Math.min(Math.abs(hsb1.h - hsb2.h), 360 - Math.abs(hsb1.h - hsb2.h)) / 180; // normalize to [0,2]
  const ds = (hsb1.s - hsb2.s) / 100;
  const db = (hsb1.b - hsb2.b) / 100;
  return Math.sqrt(dh * dh + ds * ds + db * db);
}

const ColorGrid = forwardRef<{ clearActiveDots: () => void }, ColorGridProps>(
  (
    {
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
      activeTab,
      activeSwatchId,
      forceGrayscale,
      swatches,
    },
    ref
  ) => {
    const {
      handleDotClick: handleGridDotClick,
      isDotActive,
      clearActiveDots,
      activeDots,
    } = useColorGrid(activeTab);

    useImperativeHandle(ref, () => ({
      clearActiveDots,
    }));

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

      for (let row = 0; row < 101; row++) {
        for (let col = 0; col < 101; col++) {
          const brightness = 100 - row;
          const saturation = activeTab === "hex" ? 0 : forceGrayscale ? 0 : col;
          const cached = colorCache[brightness]?.[col];

          if (cached) {
            let dotHexColor = cached.hexColor;
            if (activeTab === "hex" || forceGrayscale) {
              const [r, g, b] = hsbToRgb(hue, 0, brightness);
              dotHexColor = rgbToHex(r, g, b).toUpperCase();
            }

            const dotKey = `${row}-${col}`;
            let isFiltered = false;

            // Only check for active dots in lightness tab
            let isActiveForAnySwatch = false;
            let isInActiveDots = false;
            if (activeTab === "lightness") {
              isActiveForAnySwatch = Array.from(activeDots.values()).includes(
                dotKey
              );
              isInActiveDots = forceGrayscale
                ? false
                : (() => {
                    if (activeSwatchId !== null) {
                      const swatch = swatches.find(
                        (s) => s.id === activeSwatchId
                      );
                      if (swatch) {
                        return isDotActive(dotKey, swatch.id);
                      }
                    }
                    return false;
                  })();
            }

            if (!isActiveForAnySwatch) {
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
              if (isPickingColor && activeLValue !== null && !onDotHover) {
                isFiltered = Math.abs(cached.labLightness - activeLValue) > 0.5;
              }
            }

            if (
              isActiveForAnySwatch &&
              !forceGrayscale &&
              activeTab === "lightness"
            ) {
              const [r, g, b] = hsbToRgb(hue, saturation, brightness);
              dotHexColor = rgbToHex(r, g, b).toUpperCase();
            }

            const dot: Dot = {
              row,
              col,
              hexColor: dotHexColor,
              labLightness: cached.labLightness,
              hsbText: cached.hsbText,
              isActive: isActiveForAnySwatch,
              isFiltered: isActiveForAnySwatch ? false : isFiltered,
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
      swatches,
    ]);

    // Find the closest dot to keyHexCode (or exact match if present)
    const snappedKeyDot = useMemo(() => {
      if (!keyHexCode || dots.length === 0) return null;
      let minDist = Infinity;
      let closestDot = null;
      for (const dot of dots) {
        if (dot.hexColor.toUpperCase() === keyHexCode.toUpperCase()) {
          return dot; // exact match
        }
        const dist = colorDistanceHsb(dot.hexColor, keyHexCode);
        if (dist < minDist) {
          minDist = dist;
          closestDot = dot;
        }
      }
      return closestDot;
    }, [keyHexCode, dots]);

    // Memoize the rendered dots
    const renderedDots = useMemo(() => {
      return dots.map((dot, i) => {
        const dotKey = `${dot.row}-${dot.col}`;
        // Find the matching swatch based on L* value
        const matchingSwatch = swatches.find(
          (s) => Math.round(s.lValue) === Math.round(dot.labLightness)
        );
        const swatchId = matchingSwatch?.id;

        // Only render as active if activeTab is 'lightness' and the dot matches the swatch's active state
        const isActive =
          activeTab === "lightness" &&
          typeof swatchId === "number" &&
          activeDots.get(swatchId) === dotKey;

        // Only one dot is the key dot: the snappedKeyDot
        const isKey = snappedKeyDot
          ? dot.row === snappedKeyDot.row && dot.col === snappedKeyDot.col
          : false;

        // Active or key dots cannot be filtered
        const isFiltered = !isActive && !isKey ? dot.isFiltered : false;

        return (
          <div
            key={dotKey}
            data-testid="color-dot"
            className={`dot${isActive ? " active" : ""}${isKey ? " key" : ""}${
              isFiltered ? " filtered" : ""
            }`}
            style={{ backgroundColor: dot.hexColor }}
            onClick={() => {
              if (activeTab === "lightness" && typeof swatchId === "number")
                handleGridDotClick(dot, swatchId);
              onDotClick(dot);
            }}
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
      handleGridDotClick,
      activeSwatchId,
      swatches,
      keyHexCode,
      activeDots,
      onDotClick,
      snappedKeyDot,
      onDotHover,
      activeTab,
    ]);

    // Ref for tooltip to measure its size
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Debug: log tooltip position and hovered dot
    if (hoveredDot && tooltipPos) {
    }

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
  }
);

export default ColorGrid;
