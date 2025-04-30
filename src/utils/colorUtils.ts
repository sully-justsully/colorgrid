// RGB to Hex conversion
export const rgbToHex = (r: number, g: number, b: number): string => {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16).toUpperCase();
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
};

// HSB to RGB conversion
export const hsbToRgb = (
  h: number,
  s: number,
  b: number
): [number, number, number] => {
  h = h / 360;
  s = s / 100;
  b = b / 100;

  let r: number, g: number, b_: number;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = b * (1 - s);
  const q = b * (1 - f * s);
  const t = b * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = b;
      g = t;
      b_ = p;
      break;
    case 1:
      r = q;
      g = b;
      b_ = p;
      break;
    case 2:
      r = p;
      g = b;
      b_ = t;
      break;
    case 3:
      r = p;
      g = q;
      b_ = b;
      break;
    case 4:
      r = t;
      g = p;
      b_ = b;
      break;
    case 5:
      r = b;
      g = p;
      b_ = q;
      break;
    default:
      r = b;
      g = t;
      b_ = p;
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b_ * 255)];
};

// RGB to XYZ conversion
export const rgbToXyz = (
  r: number,
  g: number,
  b: number
): [number, number, number] => {
  r = r / 255;
  g = g / 255;
  b = b / 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  r *= 100;
  g *= 100;
  b *= 100;

  const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
  const z = r * 0.0193339 + g * 0.119192 + b * 0.9503041;

  return [x, y, z];
};

// XYZ to LAB conversion
export const xyzToLab = (
  x: number,
  y: number,
  z: number
): [number, number, number] => {
  x = x / 95.047;
  y = y / 100.0;
  z = z / 108.883;

  x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

  const l = 116 * y - 16;
  const a = 500 * (x - y);
  const b = 200 * (y - z);

  return [l, a, b];
};

// Get LAB lightness from RGB
export const getRgbLabLightness = (r: number, g: number, b: number): number => {
  const [x, y, z] = rgbToXyz(r, g, b);
  const [l] = xyzToLab(x, y, z);
  return l;
};

// Convert L* value to RGB color
export const labToRgb = (l: number): [number, number, number] => {
  // Special case for pure white (L* = 100)
  if (l === 100) {
    return [255, 255, 255];
  }

  // Special case for pure black (L* = 0)
  if (l === 0) {
    return [0, 0, 0];
  }

  // Convert L* to XYZ (using a=0, b=0 for neutral gray)
  const y = (l + 16) / 116;
  const x = y;
  const z = y;

  // Convert to XYZ
  const x3 = Math.pow(x, 3);
  const y3 = Math.pow(y, 3);
  const z3 = Math.pow(z, 3);

  const xr = x3 > 0.008856 ? x3 : (x - 16 / 116) / 7.787;
  const yr = y3 > 0.008856 ? y3 : (y - 16 / 116) / 7.787;
  const zr = z3 > 0.008856 ? z3 : (z - 16 / 116) / 7.787;

  // Convert XYZ to RGB using D65 illuminant
  const r = xr * 3.2404542 + yr * -1.5371385 + zr * -0.4985314;
  const g = xr * -0.969266 + yr * 1.8760108 + zr * 0.041556;
  const b = xr * 0.0556434 + yr * -0.2040259 + zr * 1.0572252;

  // Apply gamma correction and convert to 0-255 range
  const gammaCorrection = (c: number): number => {
    return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  };

  const r255 = Math.max(0, Math.min(255, Math.round(gammaCorrection(r) * 255)));
  const g255 = Math.max(0, Math.min(255, Math.round(gammaCorrection(g) * 255)));
  const b255 = Math.max(0, Math.min(255, Math.round(gammaCorrection(b) * 255)));

  // Ensure neutral gray by using the average of all channels
  const grayValue = Math.round((r255 + g255 + b255) / 3);
  return [grayValue, grayValue, grayValue];
};

// Calculate WCAG contrast ratio between two colors
export const calculateContrastRatio = (
  hexColor1: string,
  hexColor2: string = "#FFFFFF"
): number => {
  const getRGB = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b];
  };

  const getLuminance = (c: number): number => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  const [r1, g1, b1] = getRGB(hexColor1);
  const [r2, g2, b2] = getRGB(hexColor2);

  const l1 =
    0.2126 * getLuminance(r1) +
    0.7152 * getLuminance(g1) +
    0.0722 * getLuminance(b1);

  const l2 =
    0.2126 * getLuminance(r2) +
    0.7152 * getLuminance(g2) +
    0.0722 * getLuminance(b2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

export function rgbToHsb(
  r: number,
  g: number,
  b: number
): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = max === 0 ? 0 : delta / max;
  let v = max;

  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }

    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  s = Math.round(s * 100);
  v = Math.round(v * 100);

  return [h, s, v];
}

// Convert hex to RGB
export const hexToRgb = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
};

// Calculate Euclidean distance between two colors in RGB space
export const colorDistance = (hex1: string, hex2: string): number => {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);

  return Math.sqrt(
    Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
  );
};
