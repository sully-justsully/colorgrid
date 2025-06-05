import { useState, useCallback, useEffect, useRef } from "react";
import { Dot } from "../types";

export const useColorGrid = (activeTab: string) => {
  // Always initialize the state from localStorage, regardless of tab
  const [lightnessActiveDots, setLightnessActiveDots] = useState<
    Map<number, string>
  >(() => {
    const saved = localStorage.getItem("activeDots-lightness");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return new Map(
          Object.entries(parsed).map(([k, v]) => [Number(k), v as string])
        );
      } catch {
        // Ignore error, start with empty
      }
    }
    return new Map();
  });

  // Always expose the active dots, regardless of tab
  const activeDots = lightnessActiveDots;

  const handleDotClick = useCallback(
    (dot: Dot, swatchId: number) => {
      if (activeTab !== "lightness") return;
      const dotKey = `${dot.row}-${dot.col}`;
      console.log("[DEBUG] Dot clicked:", { swatchId, dotKey });
      setLightnessActiveDots((prev) => {
        const newActiveDots = new Map(prev);
        // Always update the active dot for this swatch
        newActiveDots.set(swatchId, dotKey);
        // Save to localStorage
        const toObj = (map: Map<number, string>) => Object.fromEntries(map);
        localStorage.setItem(
          "activeDots-lightness",
          JSON.stringify(toObj(newActiveDots))
        );
        return newActiveDots;
      });
    },
    [activeTab]
  );

  const isDotActive = useCallback(
    (dotKey: string, swatchId: number) => {
      return (
        activeTab === "lightness" &&
        lightnessActiveDots.get(swatchId) === dotKey
      );
    },
    [lightnessActiveDots, activeTab]
  );

  const clearActiveDots = useCallback(() => {
    if (activeTab !== "lightness") return;
    setLightnessActiveDots(() => {
      localStorage.removeItem("activeDots-lightness");
      return new Map();
    });
  }, [activeTab]);

  // Effect to sync with localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("activeDots-lightness");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLightnessActiveDots(
          new Map(
            Object.entries(parsed).map(([k, v]) => [Number(k), v as string])
          )
        );
      } catch {
        // Ignore error, keep current state
      }
    }
  }, []);

  return {
    handleDotClick,
    isDotActive,
    clearActiveDots,
    activeDots,
  };
};
