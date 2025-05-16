import { useState, useCallback } from "react";
import { Dot } from "../types";

export const useColorGrid = () => {
  const [activeDots, setActiveDots] = useState<Set<string>>(new Set());

  const handleDotClick = useCallback((dot: Dot) => {
    setActiveDots((prev) => {
      const newSet = new Set(prev);
      const dotKey = `${dot.row}-${dot.col}`;
      if (newSet.has(dotKey)) {
        newSet.delete(dotKey);
      } else {
        newSet.add(dotKey);
      }
      return newSet;
    });
  }, []);

  const isDotActive = useCallback(
    (dotKey: string) => {
      return activeDots.has(dotKey);
    },
    [activeDots]
  );

  const clearActiveDots = useCallback(() => {
    setActiveDots(new Set());
  }, []);

  return {
    handleDotClick,
    isDotActive,
    clearActiveDots,
    activeDots,
  };
};
