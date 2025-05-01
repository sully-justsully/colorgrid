import React, { useEffect, useState, useCallback } from "react";
import { Dot, ColorCache } from "../types";
import {
  hsbToRgb,
  rgbToHex,
  getRgbLabLightness,
  calculateContrastRatio,
  colorDistance,
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
    let matchingDot: { row: number; col: number } | null = null;

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

          if (isActive) {
            matchingDot = { row, col };
          }

          let isFiltered = false;
          const dotKey = `${row}-${col}`;

          newDots.push({
            row,
            col,
            hexColor: cached.hexColor,
            labLightness: cached.labLightness,
            hsbText: cached.hsbText,
            isActive,
            isFiltered,
          });
        }
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
    isPickingColor,
    activeLValue,
    hue, // Add hue to dependencies since we use it for comparison
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
