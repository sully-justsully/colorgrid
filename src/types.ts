export interface Dot {
  row: number;
  col: number;
  hexColor: string;
  labLightness: number;
  hsbText: string;
  isActive: boolean;
  isFiltered: boolean;
  isInActiveDots: boolean;
}

export interface ColorSwatch {
  id: number;
  hexColor: string;
  lValue: number;
  whiteContrast: number;
  blackContrast: number;
}

export interface ColorCache {
  hexColor: string;
  labLightness: number;
  hsbText: string;
}
