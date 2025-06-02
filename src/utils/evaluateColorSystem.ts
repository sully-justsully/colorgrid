import {
  calculateContrastRatio,
  hexToHsb,
  hexToLabLightness,
  labToRgb,
  rgbToHex,
} from "./colorUtils";

console.log("EVAL VERSION: 2024-06-09");

// =====================
// Types
// =====================
export interface EvaluationResult {
  swatchCount: number;
  swatchCountScore: number;
  evennessScore: number;
  balanceScore: number;
  symmetryScore: number;
  wcagAScore: number;
  wcagAAScore: number;
  wcagAPassing: number;
  wcagAAPassing: number;
  totalCombos: number;
  empiricalBestACombos: number;
  empiricalBestAACombos: number;
  normalizedContrastScore: number;
  colorRangeScore: number;
  lightDarkScore: number;
  hueVarianceScore: number;
  overallScore?: number;
  details: string[];
}

// =====================
// Utility Functions
// =====================
function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

// =====================
// Ideal L* Values for Swatch Counts
// =====================
const IDEAL_L_VALUES: { [n: number]: number[] } = {
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

function getIdealSteps(n: number): number[] {
  if (IDEAL_L_VALUES[n]) return IDEAL_L_VALUES[n];
  const keys = Object.keys(IDEAL_L_VALUES)
    .map(Number)
    .sort((a, b) => a - b);
  if (n < keys[0]) return IDEAL_L_VALUES[keys[0]];
  if (n > keys[keys.length - 1]) return IDEAL_L_VALUES[keys[keys.length - 1]];
  const closestKey = keys.reduce((prev, curr) => {
    return Math.abs(curr - n) < Math.abs(prev - n) ? curr : prev;
  });
  return IDEAL_L_VALUES[closestKey];
}

// =====================
// Empirical Best Combo Counts for WCAG
// =====================
const EMPIRICAL_BEST_COMBOS: { [n: number]: { a: number; aa: number } } = {
  1: { a: 0, aa: 0 },
  2: { a: 2, aa: 2 },
  3: { a: 6, aa: 4 },
  4: { a: 8, aa: 6 },
  5: { a: 12, aa: 10 },
  6: { a: 20, aa: 12 },
  7: { a: 24, aa: 18 },
  8: { a: 30, aa: 20 },
  9: { a: 40, aa: 28 },
  10: { a: 52, aa: 38 },
  11: { a: 60, aa: 48 },
  12: { a: 74, aa: 56 },
  13: { a: 86, aa: 68 },
  14: { a: 104, aa: 78 },
  15: { a: 116, aa: 90 },
  16: { a: 132, aa: 106 },
  17: { a: 150, aa: 118 },
  18: { a: 170, aa: 138 },
  19: { a: 188, aa: 152 },
  20: { a: 208, aa: 172 },
};

function getEmpiricalBestCombos(n: number): { a: number; aa: number } {
  if (EMPIRICAL_BEST_COMBOS[n]) return EMPIRICAL_BEST_COMBOS[n];
  return EMPIRICAL_BEST_COMBOS[20];
}

// =====================
// Main Evaluation Function
// =====================
export function evaluateColorSystem(swatches: string[]): EvaluationResult {
  const details: string[] = [];

  // --- Swatch Count ---
  const swatchCount = swatches.length;
  let swatchCountScore = 0;
  if (swatchCount <= 9) swatchCountScore = 0;
  else if (swatchCount >= 10 && swatchCount <= 20) swatchCountScore = 1;
  else if (swatchCount >= 21) swatchCountScore = 0.3;
  if (swatchCount >= 16) {
    if (swatchCount === 16) swatchCountScore += 0.05;
    else if (swatchCount === 17) swatchCountScore += 0.08;
    else if (swatchCount === 18) swatchCountScore += 0.1;
    else if (swatchCount === 19) swatchCountScore += 0.11;
    else if (swatchCount === 20) swatchCountScore += 0.12;
    else if (swatchCount >= 21)
      swatchCountScore = Math.min(swatchCountScore, 0.95);
  }
  details.push(
    `Swatch count: ${swatchCount} (score: ${swatchCountScore.toFixed(2)})`
  );

  // --- Evenness of L* Values ---
  const lValues = swatches.map((hex) => hexToLabLightness(hex));
  const idealLValues = getIdealSteps(swatchCount);
  const meanIdealStep =
    idealLValues.length > 1
      ? Math.abs(idealLValues[0] - idealLValues[idealLValues.length - 1]) /
        (idealLValues.length - 1)
      : 1;
  const PENALTY_FACTOR = 1.1;
  const expError =
    lValues.reduce(
      (acc, l, i) =>
        acc +
        Math.exp(
          (PENALTY_FACTOR * Math.abs(l - idealLValues[i])) / meanIdealStep
        ),
      0
    ) / lValues.length;
  let evennessScore = 1 / expError;
  evennessScore = Math.max(0, Math.min(1, evennessScore));
  details.push(
    `Evenness of L* values (exponential penalty): expError=${expError.toFixed(
      2
    )}, score=${evennessScore.toFixed(2)}`
  );
  details.push(
    `Actual L* values: [${lValues.map((l) => l.toFixed(2)).join(", ")}]`
  );
  details.push(
    `Ideal L* values: [${idealLValues.map((l) => l.toFixed(2)).join(", ")}]`
  );

  // --- Balance Around 50 (Light vs Dark) ---
  const lightCount = lValues.filter((l) => l > 50).length;
  const darkCount = lValues.filter((l) => l < 50).length;
  const balanceScore = 1 - Math.abs(lightCount - darkCount) / swatchCount;
  details.push(
    `Balance: light=${lightCount}, dark=${darkCount}, score=${balanceScore.toFixed(
      2
    )}`
  );

  // --- Symmetry (Pairings Around 50) ---
  let symmetricPairs = 0;
  const processedIndices = new Set<number>();
  for (let i = 0; i < lValues.length; i++) {
    if (processedIndices.has(i)) continue;
    const currentL = lValues[i];
    if (currentL === 50) continue;
    const targetL = 100 - currentL;
    const tolerance = 1.0;
    for (let j = 0; j < lValues.length; j++) {
      if (i === j || processedIndices.has(j)) continue;
      if (Math.abs(lValues[j] - targetL) <= tolerance) {
        symmetricPairs++;
        processedIndices.add(i);
        processedIndices.add(j);
        break;
      }
    }
  }
  const maxPossiblePairs = Math.floor(
    (swatchCount - (lValues.includes(50) ? 1 : 0)) / 2
  );
  const PAIRINGS_PENALTY_FACTOR = 0.5;
  const symmetryScore =
    maxPossiblePairs > 0
      ? Math.pow(symmetricPairs / maxPossiblePairs, PAIRINGS_PENALTY_FACTOR)
      : 0;
  details.push(
    `Pairings of steps: found ${symmetricPairs} pairs out of ${maxPossiblePairs} possible (score: ${symmetryScore.toFixed(
      2
    )})`
  );

  // --- WCAG Contrast Combos ---
  let wcagAPassing = 0;
  let wcagAAPassing = 0;
  let totalCombos = 0;
  for (let i = 0; i < swatchCount; i++) {
    for (let j = 0; j < swatchCount; j++) {
      if (i === j) continue;
      const fg = swatches[i];
      const bg = swatches[j];
      const ratio = calculateContrastRatio(fg, bg);
      totalCombos++;
      const passesA = ratio >= 3;
      const passesAA = ratio >= 4.5;
      if (passesA) wcagAPassing++;
      if (passesAA) wcagAAPassing++;
    }
  }
  const empiricalBestCombos = getEmpiricalBestCombos(swatchCount);
  const empiricalBestACombos = empiricalBestCombos.a;
  const empiricalBestAACombos = empiricalBestCombos.aa;
  const wcagAScore =
    empiricalBestACombos > 0 ? wcagAPassing / empiricalBestACombos : 0;
  const wcagAAScore =
    empiricalBestAACombos > 0 ? wcagAAPassing / empiricalBestAACombos : 0;
  details.push(
    `3:1 combos: ${wcagAPassing}/${empiricalBestACombos} (${(
      wcagAScore * 100
    ).toFixed(1)}%)`
  );
  details.push(
    `4.5:1 combos: ${wcagAAPassing}/${empiricalBestAACombos} (${(
      wcagAAScore * 100
    ).toFixed(1)}%)`
  );

  // --- Weighted Contrast Score ---
  const contrastScore = 0.6 * wcagAAScore + 0.4 * wcagAScore;
  const normalizedContrastScore = contrastScore;
  details.push(`Contrast score (60% AA, 40% A): ${contrastScore.toFixed(3)}`);

  // --- Hue Variance ---
  const filteredSwatches = swatches.filter((hex) => {
    const l = hexToLabLightness(hex);
    return l >= 10.1 && l <= 89.9;
  });
  const hues = filteredSwatches.map((hex) => hexToHsb(hex).h);
  let stepScores: number[] = [];
  let autoFail = false;
  for (let i = 1; i < hues.length; i++) {
    const diff = Math.abs(hues[i] - hues[i - 1]);
    const circularDiff = Math.min(diff, 360 - diff);
    if (circularDiff >= 6) {
      autoFail = true;
    }
    let score = 0;
    if (circularDiff >= 0 && circularDiff <= 3) score = 1;
    else if (circularDiff === 4) score = 0.5;
    else if (circularDiff === 5) score = 0.25;
    else score = 0;
    stepScores.push(score);
  }
  const part1 =
    stepScores.length > 0
      ? stepScores.reduce((a, b) => a + b, 0) / stepScores.length
      : 1;
  const hueVarianceScore = autoFail ? 0 : part1;
  details.push(
    `Hue Variance: step avg=${part1.toFixed(
      2
    )}, score=${hueVarianceScore.toFixed(2)}${
      autoFail ? " (auto-fail: step >= 6)" : ""
    } (L* 10.1-89.9 only, stepwise only)`
  );

  // --- Color Range Bundled Score ---
  const colorRangeScore =
    0.1 * swatchCountScore + 0.45 * evennessScore + 0.45 * hueVarianceScore;
  details.push(`Color Range Score: ${(colorRangeScore * 100).toFixed(1)}`);

  // --- Light vs Dark Bundled Score ---
  const lightDarkScore = 0.5 * balanceScore + 0.5 * symmetryScore;
  details.push(`Light v Dark Score: ${(lightDarkScore * 100).toFixed(1)}`);

  return {
    swatchCount,
    swatchCountScore,
    evennessScore,
    balanceScore,
    symmetryScore,
    wcagAScore,
    wcagAAScore,
    wcagAPassing,
    wcagAAPassing,
    totalCombos,
    empiricalBestACombos,
    empiricalBestAACombos,
    normalizedContrastScore,
    colorRangeScore,
    lightDarkScore,
    hueVarianceScore,
    details,
  };
}

// =====================
// Utility: Generate Ideal L* Values for 1-9 Swatches
// =====================
function generateIdealLValues(n: number): number[] {
  if (n === 1) return [100];
  if (n === 2) return [100, 0];
  const step = 100 / (n - 1);
  return Array.from({ length: n }, (_, i) => Math.round(100 - i * step));
}

// =====================
// Utility: Generate Full Mapping of Ideal L* Values for 1-20 Swatches
// =====================
const FULL_IDEAL_L_VALUES: { [n: number]: number[] } = {};
for (let n = 1; n <= 20; n++) {
  if (IDEAL_L_VALUES[n]) {
    FULL_IDEAL_L_VALUES[n] = IDEAL_L_VALUES[n];
  } else {
    FULL_IDEAL_L_VALUES[n] = generateIdealLValues(n);
  }
}

// =====================
// Utility: Compute Empirical Best Combos for 3:1 and 4.5:1 Ratios
// =====================
function computeEmpiricalBestCombos() {
  const combos: { [n: number]: { a: number; aa: number } } = {};
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

// Uncomment to print the mapping for copy-paste
// console.log(JSON.stringify(computeEmpiricalBestCombos(), null, 2));
