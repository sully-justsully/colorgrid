export interface ColorSwatch {
  id: number;
  lValue: number;
  hexColor: string;
  whiteContrast: number;
  blackContrast: number;
}

export interface Dot {
  row: number;
  col: number;
  hexColor: string;
  labLightness: number;
  hsbText: string;
  isActive: boolean;
  isFiltered: boolean;
}

export interface ColorCache {
  hexColor: string;
  labLightness: number;
  hsbText: string;
}

declare global {
  interface Window {
    gtag: (
      command: string,
      action: string,
      params?: {
        event_category?: string;
        event_label?: string;
        value?: number;
        [key: string]: any;
      }
    ) => void;
  }
}
