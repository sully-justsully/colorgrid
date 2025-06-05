import { useState, useCallback, useEffect, useRef } from "react";
import { Dot } from "../types";

export const useColorGrid = (activeTab: string) => {
  // Add a ref to track if we've just cleared the dots
  const justClearedRef = useRef(false);

  // Map swatchId (number) -> dotKey
  const [activeDots, setActiveDots] = useState<Map<number, string>>(() => {
    console.log("Initializing activeDots state for tab:", activeTab);
    // Skip loading from localStorage if we just cleared the dots
    if (justClearedRef.current) {
      console.log("Skipping localStorage load because dots were just cleared");
      justClearedRef.current = false;
      return new Map();
    }

    // Load from localStorage on initial mount
    const savedDots = localStorage.getItem(`activeDots-${activeTab}`);
    console.log("Found saved dots in localStorage:", savedDots);
    if (savedDots) {
      try {
        const parsed = JSON.parse(savedDots);
        const newMap = new Map(
          Object.entries(parsed).map(([swatchId, dotKey]) => [
            Number(swatchId),
            dotKey as string,
          ])
        );
        console.log(
          "Created initial map from localStorage:",
          Array.from(newMap.entries())
        );
        return newMap;
      } catch (e) {
        console.error("Error loading saved active dots:", e);
      }
    }
    console.log("No saved dots found, starting with empty map");
    return new Map();
  });

  // Save active dots to localStorage whenever they change
  useEffect(() => {
    // Don't save to localStorage if we just cleared the dots
    if (justClearedRef.current) {
      console.log("Skipping localStorage save because dots were just cleared");
      justClearedRef.current = false; // Reset the flag so future saves work
      return;
    }

    console.log(
      "Saving active dots to localStorage:",
      Array.from(activeDots.entries())
    );
    const dotsObject = Object.fromEntries(activeDots);
    localStorage.setItem(`activeDots-${activeTab}`, JSON.stringify(dotsObject));
  }, [activeDots, activeTab]);

  const handleDotClick = useCallback((dot: Dot, swatchId: number) => {
    const dotKey = `${dot.row}-${dot.col}`;
    console.log("Updating active dot:", { swatchId, dotKey });

    setActiveDots((prev) => {
      const newActiveDots = new Map(prev);
      // If the dot is already active for this swatch, do nothing; otherwise, set it as active
      if (newActiveDots.get(swatchId) !== dotKey) {
        newActiveDots.set(swatchId, dotKey);
      }
      console.log(
        "New active dots state:",
        Array.from(newActiveDots.entries())
      );
      return newActiveDots;
    });
    console.log("=== GRID DOT CLICK END ===");
  }, []);

  const isDotActive = useCallback(
    (dotKey: string, swatchId: number) => {
      const isActive = activeDots.get(swatchId) === dotKey;
      if (isActive) {
        console.log("Dot is active:", { dotKey, swatchId });
      }
      return isActive;
    },
    [activeDots]
  );

  const clearActiveDots = useCallback(() => {
    console.log("Clearing active dots");
    setActiveDots(new Map());
    localStorage.removeItem(`activeDots-${activeTab}`);
    justClearedRef.current = true;
  }, [activeTab]);

  return {
    handleDotClick,
    isDotActive,
    clearActiveDots,
    activeDots,
  };
};
