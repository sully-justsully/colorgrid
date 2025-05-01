import React, { useEffect, useState, useCallback } from "react";
import { Dot, ColorCache } from "../types";
import {
  hsbToRgb,
  rgbToHex,
  getRgbLabLightness,
  calculateContrastRatio,
  colorDistance,
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
}) => {
  const [dots, setDots] = useState<Dot[]>([]);
  const [colorCache, setColorCache] = useState<ColorCache[][]>([]);

  // Pre-calculate color cache
  useEffect(() => {
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

    setColorCache(newColorCache);
  }, [hue]);

  // Update dots when cache or filters change
  useEffect(() => {
    const newDots: Dot[] = [];
    const lValuesSet = new Set(lValues);
    let closestDot: { distance: number; row: number; col: number } | null =
      null;
    let hasExactMatch = false;

    // First pass: collect all dots and find closest match
    for (let row = 0; row < 101; row++) {
      for (let col = 0; col < 101; col++) {
        const brightness = 100 - row;
        const cached = colorCache[brightness]?.[col];

        if (cached) {
          const exactMatch =
            cached.hexColor.toUpperCase() === keyHexCode.toUpperCase();
          if (exactMatch) {
            hasExactMatch = true;
            closestDot = { distance: 0, row, col };
          } else if (!hasExactMatch) {
            const distance = colorDistance(cached.hexColor, keyHexCode);
            if (!closestDot || distance < closestDot.distance) {
              closestDot = { distance, row, col };
            }
          }

          let isFiltered = false;
          if (isFiltering) {
            isFiltered = !lValuesSet.has(cached.labLightness);
            if (
              !isFiltered &&
              (isATextContrast || isAATextContrast || isAAATextContrast)
            ) {
              const contrastRatio = calculateContrastRatio(
                cached.hexColor,
                "#000000"
              );
              if (isATextContrast) {
                isFiltered = contrastRatio < 3;
              } else if (isAATextContrast) {
                isFiltered = contrastRatio < 4.5;
              } else if (isAAATextContrast) {
                isFiltered = contrastRatio < 7;
              }
            }
          } else if (isATextContrast || isAATextContrast || isAAATextContrast) {
            const contrastRatio = calculateContrastRatio(
              cached.hexColor,
              "#000000"
            );
            if (isATextContrast) {
              isFiltered = contrastRatio < 3;
            } else if (isAATextContrast) {
              isFiltered = contrastRatio < 4.5;
            } else if (isAAATextContrast) {
              isFiltered = contrastRatio < 7;
            }
          }

          const dotKey = `${row}-${col}`;
          newDots.push({
            row,
            col,
            hexColor: cached.hexColor,
            labLightness: cached.labLightness,
            hsbText: cached.hsbText,
            isActive: activeDots.has(dotKey),
            isFiltered,
          });
        }
      }
    }

    // Second pass: update the single closest dot to be active
    if (closestDot) {
      const dotIndex = newDots.findIndex(
        (dot) => dot.row === closestDot!.row && dot.col === closestDot!.col
      );
      if (dotIndex !== -1) {
        newDots[dotIndex] = {
          ...newDots[dotIndex],
          isActive: true,
        };
      }
    }

    setDots(newDots);
  }, [
    colorCache,
    isFiltering,
    isATextContrast,
    isAATextContrast,
    isAAATextContrast,
    lValues,
    activeDots,
    keyHexCode,
  ]);

  const handleDotClick = useCallback(
    (dot: Dot) => {
      onDotClick(dot);
    },
    [onDotClick]
  );

  return (
    <div className="color-grid">
      {dots.map((dot) => (
        <div
          key={`${dot.row}-${dot.col}`}
          className={`dot ${dot.isActive ? "active" : ""} ${
            dot.isFiltered ? "filtered" : ""
          }`}
          style={{ backgroundColor: dot.hexColor }}
          onClick={() => handleDotClick(dot)}
        >
          <div className="hex-tooltip">
            <div className="hex-value">{dot.hexColor}</div>
            <div className="lab-value">L*: {dot.labLightness}</div>
            <div className="hsb-value">{dot.hsbText}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ColorGrid;
