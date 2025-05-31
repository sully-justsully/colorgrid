import { useState, useCallback, useEffect } from "react";
import { Dot } from "../types";

export const useColorGrid = (activeTab: string) => {
  // Map swatchId -> dotKey
  const [activeDots, setActiveDots] = useState<Map<number, string>>(() => {
    console.log("Initializing activeDots state for tab:", activeTab);
    const savedDots = localStorage.getItem(`activeDots-${activeTab}`);
    console.log("Found saved dots:", savedDots);
    if (savedDots) {
      try {
        const parsed = JSON.parse(savedDots);
        const newMap = new Map(
          Object.entries(parsed).map(([swatchId, dotKey]) => [
            Number(swatchId),
            dotKey as string,
          ])
        );
        console.log("Created initial map:", Array.from(newMap.entries()));
        return newMap;
      } catch (e) {
        console.error("Error loading saved active dots:", e);
      }
    }
    return new Map();
  });

  // Update active dots when tab changes
  useEffect(() => {
    console.log("Tab changed to:", activeTab);
    const savedDots = localStorage.getItem(`activeDots-${activeTab}`);
    console.log("Found saved dots on tab change:", savedDots);
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
          "Setting new map on tab change:",
          Array.from(newMap.entries())
        );
        setActiveDots(newMap);
      } catch (e) {
        console.error("Error loading saved active dots:", e);
        setActiveDots(new Map());
      }
    } else {
      console.log("No saved dots found for tab, clearing state");
      setActiveDots(new Map());
    }
  }, [activeTab]);

  // Save active dots to localStorage whenever they change
  useEffect(() => {
    console.log("Active dots changed:", Array.from(activeDots.entries()));
    const dotsObject = Object.fromEntries(activeDots);
    console.log("Saving to localStorage:", dotsObject);
    localStorage.setItem(`activeDots-${activeTab}`, JSON.stringify(dotsObject));
  }, [activeDots, activeTab]);

  const handleDotClick = useCallback((dot: Dot, swatchId: number) => {
    console.log("=== GRID DOT CLICK START ===");
    const dotKey = `${dot.row}-${dot.col}`;
    console.log("Updating active dot:", { swatchId, dotKey });

    setActiveDots((prev) => {
      const newActiveDots = new Map(prev);
      newActiveDots.set(swatchId, dotKey);
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
  }, [activeTab]);

  return {
    handleDotClick,
    isDotActive,
    clearActiveDots,
    activeDots,
  };
};
