// Google Analytics event tracking helper
export const trackEvent = (
  eventName: string,
  eventParams?: {
    [key: string]: any;
  }
) => {
  if (typeof window.gtag !== "undefined") {
    window.gtag("event", eventName, eventParams);
  }
};

// Common event names
export const AnalyticsEvents = {
  THEME_TOGGLE: "theme_toggle",
  VIEW_CONTRAST_GRID: "view_contrast_grid",
  GET_FIGMA_FILE: "get_figma_file",
  SAVE_PALETTE: "save_palette",
  RESET_RAMPS: "reset_ramps",
  ADD_RAMP: "add_ramp",
  REMOVE_PALETTE: "remove_palette",
  EDIT_PALETTE: "edit_palette",
  DOWNLOAD_SYSTEM: "download_system",
  VIEW_SCORES: "view_scores",
  SHARE_APP: "share_app",
  TAB_CHANGE: "tab_change",
  WCAG_FILTER_CHANGE: "wcag_filter_change",
  COLOR_SWATCH_CLICK: "color_swatch_click",
  HEX_CODE_UPDATE: "hex_code_update",
  HSL_VALUE_CHANGE: "hsl_value_change",
} as const;
