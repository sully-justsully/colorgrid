import { useReducer, useCallback, useMemo } from "react";
import { Dot, ColorSwatch } from "../types";
import { calculateContrastRatio, hexToHsb } from "../utils/colorUtils";

interface ColorGridState {
  activeDots: Set<string>;
  isPickingColor: boolean;
  activeSwatchId: number | null;
  activeLValue: number | null;
}

type ColorGridAction =
  | { type: "TOGGLE_DOT"; dotKey: string }
  | {
      type: "SET_PICKING_COLOR";
      isPicking: boolean;
      swatchId: number | null;
      lValue: number | null;
    }
  | { type: "CLEAR_ACTIVE_DOTS" };

const initialState: ColorGridState = {
  activeDots: new Set(),
  isPickingColor: false,
  activeSwatchId: null,
  activeLValue: null,
};

function colorGridReducer(
  state: ColorGridState,
  action: ColorGridAction
): ColorGridState {
  switch (action.type) {
    case "TOGGLE_DOT":
      const newActiveDots = new Set(state.activeDots);
      if (newActiveDots.has(action.dotKey)) {
        newActiveDots.delete(action.dotKey);
      } else {
        newActiveDots.add(action.dotKey);
      }
      return { ...state, activeDots: newActiveDots };

    case "SET_PICKING_COLOR":
      return {
        ...state,
        isPickingColor: action.isPicking,
        activeSwatchId: action.swatchId,
        activeLValue: action.lValue,
      };

    case "CLEAR_ACTIVE_DOTS":
      return { ...state, activeDots: new Set() };

    default:
      return state;
  }
}

export function useColorGrid() {
  const [state, dispatch] = useReducer(colorGridReducer, initialState);

  const handleDotClick = useCallback((dot: Dot) => {
    const dotKey = `${dot.row}-${dot.col}`;
    dispatch({ type: "TOGGLE_DOT", dotKey });

    // Copy hex code to clipboard
    navigator.clipboard.writeText(dot.hexColor).then(() => {
      // Track color copy if analytics is available
      if (typeof window.gtag !== "undefined") {
        window.gtag("event", "color_copied", {
          hex_color: dot.hexColor,
          l_value: dot.labLightness,
          hsb_text: dot.hsbText,
        });
      }
    });
  }, []);

  const setPickingColor = useCallback(
    (isPicking: boolean, swatchId: number | null, lValue: number | null) => {
      dispatch({ type: "SET_PICKING_COLOR", isPicking, swatchId, lValue });
    },
    []
  );

  const clearActiveDots = useCallback(() => {
    dispatch({ type: "CLEAR_ACTIVE_DOTS" });
  }, []);

  const isDotActive = useCallback(
    (dotKey: string) => {
      return state.activeDots.has(dotKey);
    },
    [state.activeDots]
  );

  return {
    activeDots: state.activeDots,
    isPickingColor: state.isPickingColor,
    activeSwatchId: state.activeSwatchId,
    activeLValue: state.activeLValue,
    handleDotClick,
    setPickingColor,
    clearActiveDots,
    isDotActive,
  };
}
