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
