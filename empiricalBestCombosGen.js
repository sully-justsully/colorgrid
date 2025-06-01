// Node-compatible script to generate empirical best combos for 1-20 swatches

function labToRgb(l) {
  if (l === 100) return [255, 255, 255];
  if (l === 0) return [0, 0, 0];
  const y = (l + 16) / 116;
  const x = y;
  const z = y;
  const x3 = Math.pow(x, 3);
  const y3 = Math.pow(y, 3);
  const z3 = Math.pow(z, 3);
  const xr = x3 > 0.008856 ? x3 : (x - 16 / 116) / 7.787;
  const yr = y3 > 0.008856 ? y3 : (y - 16 / 116) / 7.787;
  const zr = z3 > 0.008856 ? z3 : (z - 16 / 116) / 7.787;
  const r = xr * 3.2404542 + yr * -1.5371385 + zr * -0.4985314;
  const g = xr * -0.969266 + yr * 1.8760108 + zr * 0.041556;
  const b = xr * 0.0556434 + yr * -0.2040259 + zr * 1.0572252;
  const gammaCorrection = (c) =>
    c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  const r255 = Math.max(0, Math.min(255, Math.round(gammaCorrection(r) * 255)));
  const g255 = Math.max(0, Math.min(255, Math.round(gammaCorrection(g) * 255)));
  const b255 = Math.max(0, Math.min(255, Math.round(gammaCorrection(b) * 255)));
  const grayValue = Math.round((r255 + g255 + b255) / 3);
  return [grayValue, grayValue, grayValue];
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16).toUpperCase();
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

function getLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const getL = (c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * getL(r) + 0.7152 * getL(g) + 0.0722 * getL(b);
}

function calculateContrastRatio(hex1, hex2) {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function generateIdealLValues(n) {
  if (n === 1) return [100];
  if (n === 2) return [100, 0];
  const step = 100 / (n - 1);
  return Array.from({ length: n }, (_, i) => Math.round(100 - i * step));
}

const IDEAL_L_VALUES = {
  10: [100, 93, 82, 71, 56, 43, 29, 18, 7, 0],
  11: [100, 94, 85, 75, 63, 49, 37, 25, 15, 6, 0],
  12: [100, 94, 87, 77, 67, 56, 44, 33, 23, 13, 6, 0],
  13: [100, 95, 90, 82, 73, 61, 49, 38, 27, 18, 10, 5, 0],
  14: [100, 96, 91, 84, 76, 66, 55, 43, 34, 24, 16, 9, 4, 0],
  15: [100, 97, 93, 87, 77, 68, 58, 49, 41, 32, 23, 13, 7, 3, 0],
  16: [100, 98, 95, 91, 81, 72, 65, 55, 44, 35, 28, 19, 9, 5, 2, 0],
  17: [100, 98, 95, 91, 84, 77, 68, 59, 49, 41, 32, 23, 16, 9, 5, 2, 0],
  18: [100, 98, 96, 93, 90, 82, 73, 65, 54, 45, 35, 27, 18, 10, 7, 4, 2, 0],
  19: [100, 98, 96, 94, 91, 85, 78, 70, 60, 49, 40, 30, 22, 15, 9, 6, 4, 2, 0],
  20: [
    100, 98, 96, 94, 91, 85, 79, 72, 64, 55, 44, 36, 28, 21, 15, 9, 6, 4, 2, 0,
  ],
};

const FULL_IDEAL_L_VALUES = {};
for (let n = 1; n <= 20; n++) {
  if (IDEAL_L_VALUES[n]) {
    FULL_IDEAL_L_VALUES[n] = IDEAL_L_VALUES[n];
  } else {
    FULL_IDEAL_L_VALUES[n] = generateIdealLValues(n);
  }
}

function computeEmpiricalBestCombos() {
  const combos = {};
  for (let n = 1; n <= 20; n++) {
    const lValues = FULL_IDEAL_L_VALUES[n];
    const hexes = lValues.map((l) => {
      const [r, g, b] = labToRgb(l);
      return rgbToHex(r, g, b);
    });
    let a = 0;
    let aa = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const ratio = calculateContrastRatio(hexes[i], hexes[j]);
        if (ratio >= 3) a++;
        if (ratio >= 4.5) aa++;
      }
    }
    combos[n] = { a, aa };
  }
  return combos;
}

console.log(JSON.stringify(computeEmpiricalBestCombos(), null, 2));
