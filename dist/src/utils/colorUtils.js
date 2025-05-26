"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.colorDistance = exports.hexToRgb = exports.calculateContrastRatio = exports.labToRgb = exports.xyzToLab = exports.rgbToXyz = exports.hsbToRgb = exports.rgbToHex = void 0;
exports.rgbToHsb = rgbToHsb;
exports.hexToHsb = hexToHsb;
exports.hexToLabLightness = hexToLabLightness;
// Cache for frequently used color conversions
const rgbToHexCache = new Map();
const hexToRgbCache = new Map();
const contrastRatioCache = new Map();
// RGB to Hex conversion with caching
const rgbToHex = (r, g, b) => {
    const key = `${r},${g},${b}`;
    if (rgbToHexCache.has(key)) {
        return rgbToHexCache.get(key);
    }
    const hex = "#" +
        [r, g, b]
            .map((x) => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        })
            .join("")
            .toUpperCase();
    rgbToHexCache.set(key, hex);
    return hex;
};
exports.rgbToHex = rgbToHex;
// HSB to RGB conversion with improved precision
const hsbToRgb = (h, s, b) => {
    h = h / 360;
    s = s / 100;
    b = b / 100;
    let r, g, b_;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = b * (1 - s);
    const q = b * (1 - f * s);
    const t = b * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0:
            [r, g, b_] = [b, t, p];
            break;
        case 1:
            [r, g, b_] = [q, b, p];
            break;
        case 2:
            [r, g, b_] = [p, b, t];
            break;
        case 3:
            [r, g, b_] = [p, q, b];
            break;
        case 4:
            [r, g, b_] = [t, p, b];
            break;
        case 5:
            [r, g, b_] = [b, p, q];
            break;
        default:
            [r, g, b_] = [b, t, p];
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b_ * 255)];
};
exports.hsbToRgb = hsbToRgb;
// RGB to XYZ conversion
const rgbToXyz = (r, g, b) => {
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
exports.rgbToXyz = rgbToXyz;
// XYZ to LAB conversion
const xyzToLab = (x, y, z) => {
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
exports.xyzToLab = xyzToLab;
// Convert L* value to RGB color
const labToRgb = (l) => {
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
    const gammaCorrection = (c) => {
        return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    };
    const r255 = Math.max(0, Math.min(255, Math.round(gammaCorrection(r) * 255)));
    const g255 = Math.max(0, Math.min(255, Math.round(gammaCorrection(g) * 255)));
    const b255 = Math.max(0, Math.min(255, Math.round(gammaCorrection(b) * 255)));
    // Ensure neutral gray by using the average of all channels
    const grayValue = Math.round((r255 + g255 + b255) / 3);
    return [grayValue, grayValue, grayValue];
};
exports.labToRgb = labToRgb;
// Calculate WCAG contrast ratio with caching
const calculateContrastRatio = (hexColor1, hexColor2 = "#FFFFFF") => {
    const key = `${hexColor1}-${hexColor2}`;
    if (contrastRatioCache.has(key)) {
        return contrastRatioCache.get(key);
    }
    const getRGB = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return [r, g, b];
    };
    const getLuminance = (c) => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    const [r1, g1, b1] = getRGB(hexColor1);
    const [r2, g2, b2] = getRGB(hexColor2);
    const l1 = 0.2126 * getLuminance(r1) +
        0.7152 * getLuminance(g1) +
        0.0722 * getLuminance(b1);
    const l2 = 0.2126 * getLuminance(r2) +
        0.7152 * getLuminance(g2) +
        0.0722 * getLuminance(b2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    const ratio = (lighter + 0.05) / (darker + 0.05);
    contrastRatioCache.set(key, ratio);
    return ratio;
};
exports.calculateContrastRatio = calculateContrastRatio;
function rgbToHsb(r, g, b) {
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
        }
        else if (max === g) {
            h = (b - r) / delta + 2;
        }
        else {
            h = (r - g) / delta + 4;
        }
        h = Math.round(h * 60);
        if (h < 0)
            h += 360;
    }
    s = Math.round(s * 100);
    v = Math.round(v * 100);
    return [h, s, v];
}
// Convert hex to RGB with caching
const hexToRgb = (hex) => {
    if (hexToRgbCache.has(hex)) {
        return hexToRgbCache.get(hex);
    }
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const result = [r, g, b];
    hexToRgbCache.set(hex, result);
    return result;
};
exports.hexToRgb = hexToRgb;
// Calculate distance between two colors in HSB space
const colorDistance = (hex1, hex2) => {
    const [r1, g1, b1] = (0, exports.hexToRgb)(hex1);
    const [r2, g2, b2] = (0, exports.hexToRgb)(hex2);
    // Convert both colors to HSB
    const [, s1, b1_] = rgbToHsb(r1, g1, b1);
    const [, s2, b2_] = rgbToHsb(r2, g2, b2);
    // Calculate weighted distance in HSB space
    // Since we're already using the same hue for the grid, we only need to compare saturation and brightness
    const sWeight = 1.0;
    const bWeight = 1.0;
    return Math.sqrt(Math.pow((s1 - s2) * sWeight, 2) + Math.pow((b1_ - b2_) * bWeight, 2));
};
exports.colorDistance = colorDistance;
function hexToHsb(hex) {
    // Remove # if present
    hex = hex.replace(/^#/, "");
    // Convert hex to RGB
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    let h = 0;
    let s = max === 0 ? 0 : delta / max;
    let v = max;
    if (delta !== 0) {
        if (max === r) {
            h = ((g - b) / delta) % 6;
        }
        else if (max === g) {
            h = (b - r) / delta + 2;
        }
        else {
            h = (r - g) / delta + 4;
        }
        h = Math.round(h * 60);
        if (h < 0)
            h += 360;
    }
    // Convert to percentages
    s = Math.round(s * 100);
    v = Math.round(v * 100);
    return { h, s, b: v };
}
// hexToLabLightness is the single source of truth for L* from hex
function hexToLabLightness(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const [x, y, z] = (0, exports.rgbToXyz)(r, g, b);
    const [l] = (0, exports.xyzToLab)(x, y, z);
    return l;
}
