import { useState, useCallback, useEffect } from "react";
import { Dot } from "../types";

export const useColorGrid = (activeTab: string) => {
  // Map swatchId -> dotKey
  const [activeDots, setActiveDots] = useState<Map<number, string>>(new Map());

  // Load saved active dots from localStorage on mount
  useEffect(() => {
    const savedDots = localStorage.getItem(`activeDots-${activeTab}`);
    if (savedDots) {
      try {
        const parsed = JSON.parse(savedDots);
        const newMap = new Map(
          Object.entries(parsed).map(([swatchId, dotKey]) => [
            Number(swatchId),
            dotKey as string,
          ])
        );
        setActiveDots(newMap);
      } catch (e) {
        console.error("Error loading saved active dots:", e);
      }
    }
  }, [activeTab]);

  // Save active dots to localStorage whenever they change
  useEffect(() => {
    const dotsObject = Object.fromEntries(activeDots);
    localStorage.setItem(`activeDots-${activeTab}`, JSON.stringify(dotsObject));
  }, [activeDots, activeTab]);

  const handleDotClick = useCallback((dot: Dot, swatchId: number) => {
    console.log("useColorGrid handleDotClick:", {
      dot,
      swatchId,
      currentActiveDots: Array.from(activeDots.entries()),
    });

    setActiveDots((prev) => {
      const newActiveDots = new Map(prev);
      const dotKey = `${dot.row}-${dot.col}`;
      newActiveDots.set(swatchId, dotKey);
      console.log("New active dots state:", {
        swatchId,
        dotKey,
        newActiveDots: Array.from(newActiveDots.entries()),
      });
      return newActiveDots;
    });
  }, []);

  const isDotActive = useCallback(
    (dotKey: string, swatchId: number) => {
      const isActive = activeDots.get(swatchId) === dotKey;
      if (isActive) {
        console.log("Active dot found:", {
          dotKey,
          swatchId,
          activeDots: Array.from(activeDots.entries()),
        });
      }
      return isActive;
    },
    [activeDots]
  );

  const clearActiveDots = useCallback(() => {
    console.log("clearActiveDots called!");
    setActiveDots(new Map());
  }, []);

  return {
    handleDotClick,
    isDotActive,
    clearActiveDots,
    activeDots,
  };
};
