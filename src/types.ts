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
  originalHexColor?: string;
  whiteContrast: number;
  blackContrast: number;
  lValue: number;
}

export interface ColorCache {
  hexColor: string;
  labLightness: number;
  hsbText: string;
}
