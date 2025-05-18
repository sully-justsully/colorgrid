import React, {
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useState,
} from "react";
import { Dot, ColorCache } from "../types";
import {
  hsbToRgb,
  rgbToHex,
  getRgbLabLightness,
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
  keyHexCode: string;
  isPickingColor: boolean;
  activeLValue: number | null;
  clearActiveDotsSignal: number;
  activeTab: "simple" | "advanced" | "custom";
  activeSwatchId: number | null;
}

const ColorGrid: React.FC<ColorGridProps> = ({
  hue,
  isFiltering,
  isATextContrast,
  isAATextContrast,
  isAAATextContrast,
  lValues,
  onDotClick,
  keyHexCode,
  isPickingColor,
  activeLValue,
  clearActiveDotsSignal,
  activeTab,
  activeSwatchId,
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
        const labLightness = Math.round(getRgbLabLightness(r, g, b));
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
    const keyHsb = keyHexCode ? hexToHsb(keyHexCode) : null;

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
        const cached = colorCache[brightness]?.[col];

        if (cached) {
          const isActive =
            keyHsb !== null &&
            Math.abs(keyHsb.h - hue) < 1 &&
            Math.abs(keyHsb.s - saturation) < 1 &&
            Math.abs(keyHsb.b - brightness) < 1;

          const dotKey = `${row}-${col}`;
          let isFiltered = false;

          // Apply all filters in a single pass
          if (isFiltering && lValuesSet.size > 0) {
            isFiltered = !lValuesSet.has(cached.labLightness);
          }

          if (
            !isFiltered &&
            (isATextContrast || isAATextContrast || isAAATextContrast)
          ) {
            const contrastRatio = calculateContrastRatio(cached.hexColor);
            isFiltered =
              contrastRatio <
              Math.max(
                contrastThresholds.a,
                contrastThresholds.aa,
                contrastThresholds.aaa
              );
          }

          if (isPickingColor && activeLValue !== null) {
            isFiltered = Math.abs(cached.labLightness - activeLValue) > 0.5;
          }

          const isInActiveDots =
            activeSwatchId !== null
              ? isDotActive(dotKey, activeSwatchId)
              : false;

          const dot: Dot = {
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
  ]);

  const handleDotClick = useCallback(
    (dot: Dot) => {
      if (isPickingColor && activeSwatchId !== null) {
        handleGridDotClick(dot, activeSwatchId);
        onDotClick(dot);
      }
    },
    [handleGridDotClick, onDotClick, isPickingColor, activeSwatchId]
  );

  // Memoize the rendered dots
  const renderedDots = useMemo(() => {
    // Get all active dot keys
    const activeDotKeys = new Set(Array.from(activeDots.values()));
    return dots.map((dot) => {
      const dotKey = `${dot.row}-${dot.col}`;
      const isSelected = activeDotKeys.has(dotKey);
      if (isSelected) {
        console.log("Dot", dotKey, "isSelected for any swatch");
      }
      return (
        <div
          key={dotKey}
          data-testid="color-dot"
          className={`dot ${dot.isActive ? "active" : ""} ${
            dot.isFiltered ? "filtered" : ""
          } ${isSelected ? "selected" : ""}`}
          style={{ backgroundColor: dot.hexColor }}
          onClick={() => {
            console.log("Dot clicked:", {
              dotKey,
              isPickingColor,
              activeSwatchId,
              dot,
            });
            handleDotClick(dot);
          }}
          onMouseEnter={(e) => {
            setHoveredDot(dot);
            // Calculate position relative to grid
            const gridRect = gridRef.current?.getBoundingClientRect();
            const dotRect = (e.target as HTMLElement).getBoundingClientRect();
            if (gridRect) {
              // Default offsets
              let left = dotRect.left - gridRect.left;
              let top = dotRect.top - gridRect.top;
              // Adjust for tooltip position
              const isTopHalf = dot.row < 50;
              const isLeftHalf = dot.col < 50;
              // We'll adjust after tooltip renders (see below)
              setTooltipPos({ left, top, isTopHalf, isLeftHalf });
            }
          }}
          onMouseLeave={() => {
            setHoveredDot(null);
            setTooltipPos(null);
          }}
        />
      );
    });
  }, [dots, handleDotClick, activeDots, isPickingColor, activeSwatchId]);

  // Ref for tooltip to measure its size
  const tooltipRef = useRef<HTMLDivElement>(null);

  // After tooltip renders, adjust its position based on its size and the intended anchor
  useEffect(() => {
    if (hoveredDot && tooltipPos && tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const gridRect = gridRef.current?.getBoundingClientRect();
      if (!gridRect) return;
      let left = tooltipPos.left;
      let top = tooltipPos.top;
      // Position logic
      if (tooltipPos.isTopHalf) {
        // Show below dot
        top += 20; // dot height (10px) + gap (10px)
      } else {
        // Show above dot
        top -= tooltipRect.height + 12; // gap (10px) + tooltip height
      }
      if (tooltipPos.isLeftHalf) {
        // Anchor left
        // no change to left
      } else {
        // Anchor right
        left += 10; // move to right edge of dot
        left -= tooltipRect.width; // shift left by tooltip width
      }
      setTooltipPos((pos) => pos && { ...pos, left, top });
    }
    // Only run after tooltip renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredDot]);

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
          className={`hex-tooltip ${tooltipPositionClass}`}
          style={{
            position: "absolute",
            left: tooltipPos.left,
            top: tooltipPos.top,
            pointerEvents: "none",
            minWidth: 100,
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
