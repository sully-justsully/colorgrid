import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Dot, ColorCache } from "../types";
import {
  hsbToRgb,
  rgbToHex,
  getRgbLabLightness,
  calculateContrastRatio,
  hexToHsb,
} from "../utils/colorUtils";
import "../styles/ColorGrid.css";

interface ColorGridProps {
  hue: number;
  isFiltering: boolean;
  isATextContrast: boolean;
  isAATextContrast: boolean;
  isAAATextContrast: boolean;
  lValues: number[];
  onDotClick: (dot: Dot) => void;
  activeDots: Set<string>;
  keyHexCode: string;
  isPickingColor: boolean;
  activeLValue: number | null;
}

const ColorGrid: React.FC<ColorGridProps> = ({
  hue,
  isFiltering,
  isATextContrast,
  isAATextContrast,
  isAAATextContrast,
  lValues,
  onDotClick,
  activeDots,
  keyHexCode,
  isPickingColor,
  activeLValue,
}) => {
  // Memoize the color cache calculation
  const colorCache = useMemo(() => {
    const newColorCache: ColorCache[][] = Array(101)
      .fill(null)
      .map(() => Array(101).fill(null));

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

    return newColorCache;
  }, [hue]);

  // Memoize the dots calculation
  const dots = useMemo(() => {
    const newDots: Dot[] = [];
    const lValuesSet = new Set(lValues);

    // Convert key hex code to HSB if it exists
    let keyHsb: { h: number; s: number; b: number } | null = null;
    if (keyHexCode) {
      keyHsb = hexToHsb(keyHexCode);
    }

    // First pass: collect all dots and find matching dot
    for (let row = 0; row < 101; row++) {
      for (let col = 0; col < 101; col++) {
        const brightness = 100 - row;
        const saturation = col;
        const cached = colorCache[brightness]?.[col];

        if (cached) {
          // Check if this dot matches the key HSB values
          const isActive =
            keyHsb !== null &&
            Math.abs(keyHsb.h - hue) < 1 && // Allow small floating point differences
            Math.abs(keyHsb.s - saturation) < 1 &&
            Math.abs(keyHsb.b - brightness) < 1;

          let isFiltered = false;
          const dotKey = `${row}-${col}`;

          // Apply color ramp filtering
          if (isFiltering && lValuesSet.size > 0) {
            isFiltered = !lValuesSet.has(cached.labLightness);
          }

          // Apply WCAG contrast filtering
          if (!isFiltered) {
            const contrastRatio = calculateContrastRatio(cached.hexColor);
            if (isATextContrast && contrastRatio < 3) {
              isFiltered = true;
            } else if (isAATextContrast && contrastRatio < 4.5) {
              isFiltered = true;
            } else if (isAAATextContrast && contrastRatio < 7) {
              isFiltered = true;
            }
          }

          // Apply color picking mode filtering
          if (isPickingColor && activeLValue !== null) {
            isFiltered = Math.abs(cached.labLightness - activeLValue) > 0.5;
          }

          // Check if dot is in activeDots set
          const isInActiveDots = activeDots.has(dotKey);

          newDots.push({
            row,
            col,
            hexColor: cached.hexColor,
            labLightness: cached.labLightness,
            hsbText: cached.hsbText,
            isActive: isActive || isInActiveDots,
            isFiltered,
          });
        }
      }
    }

    return newDots;
  }, [
    colorCache,
    isFiltering,
    isATextContrast,
    isAATextContrast,
    isAAATextContrast,
    lValues,
    activeDots,
    keyHexCode,
    isPickingColor,
    activeLValue,
    hue,
  ]);

  const handleDotClick = useCallback(
    (dot: Dot) => {
      console.log("Dot clicked:", dot);
      onDotClick(dot);
    },
    [onDotClick]
  );

  // Memoize the rendered dots
  const renderedDots = useMemo(() => {
    return dots.map((dot) => (
      <div
        key={`${dot.row}-${dot.col}`}
        data-testid="color-dot"
        className={`dot ${dot.isActive ? "active" : ""} ${
          dot.isFiltered ? "filtered" : ""
        }`}
        style={{ backgroundColor: dot.hexColor }}
        onClick={() => handleDotClick(dot)}
        onMouseEnter={() => console.log("Dot hovered:", dot)}
        onMouseLeave={() => console.log("Dot mouse leave:", dot)}
      >
        <div className="hex-tooltip">
          <div className="hex-value">{dot.hexColor}</div>
          <div className="lab-value">L*: {dot.labLightness}</div>
          <div className="hsb-value">{dot.hsbText}</div>
        </div>
      </div>
    ));
  }, [dots, handleDotClick]);

  return (
    <div className="dot-grid-wrapper">
      <div className="color-grid" data-testid="color-grid">
        {renderedDots}
      </div>
    </div>
  );
};

export default React.memo(ColorGrid);
