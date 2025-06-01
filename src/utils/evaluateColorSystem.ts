import {
  calculateContrastRatio,
  hexToHsb,
  hexToLabLightness,
  labToRgb,
  rgbToHex,
} from "./colorUtils";

console.log("EVAL VERSION: 2024-06-09");

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
  overallScore?: number;
  details: string[];
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Ideal L* values for different swatch counts
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

  // For swatch counts outside 10-20, use the closest available count
  const keys = Object.keys(IDEAL_L_VALUES)
    .map(Number)
    .sort((a, b) => a - b);
  if (n < keys[0]) return IDEAL_L_VALUES[keys[0]];
  if (n > keys[keys.length - 1]) return IDEAL_L_VALUES[keys[keys.length - 1]];

  // Find the closest key
  const closestKey = keys.reduce((prev, curr) => {
    return Math.abs(curr - n) < Math.abs(prev - n) ? curr : prev;
  });

  return IDEAL_L_VALUES[closestKey];
}

// Empirical best combo counts for 3:1 and 4.5:1 ratios
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
  // For n > 20, use the last known values
  return EMPIRICAL_BEST_COMBOS[20];
}

/**
 * Evaluate a color system based on swatch count, evenness of steps, balance around 50, and WCAG contrast combos.
 * @param swatches Array of hex color strings (e.g. ["#FFFFFF", "#000000"])
 */
export function evaluateColorSystem(swatches: string[]): EvaluationResult {
  const details: string[] = [];

  // 1. Swatch count
  const swatchCount = swatches.length;
  let swatchCountScore = 0;
  if (swatchCount <= 9) swatchCountScore = 0;
  else if (swatchCount >= 10 && swatchCount <= 20) swatchCountScore = 1;
  else if (swatchCount >= 21) swatchCountScore = 0.3;
  // Bonus for 16+ swatches (diminishing returns), but only allow perfect for 18, 19, 20
  if (swatchCount >= 16) {
    if (swatchCount === 16) swatchCountScore += 0.05;
    else if (swatchCount === 17) swatchCountScore += 0.08;
    else if (swatchCount === 18) swatchCountScore += 0.1;
    else if (swatchCount === 19) swatchCountScore += 0.11;
    else if (swatchCount === 20) swatchCountScore += 0.12;
    else if (swatchCount >= 21)
      swatchCountScore = Math.min(swatchCountScore, 0.95); // cap for 21+
  }
  details.push(
    `Swatch count: ${swatchCount} (score: ${swatchCountScore.toFixed(2)})`
  );

  // 2. Evenness of L* values (compare to ideal L* values)
  const lValues = swatches.map((hex) => hexToLabLightness(hex));
  const idealLValues = getIdealSteps(swatchCount);
  // Exponential penalty for evenness: mean(exp(abs(actual - ideal)/meanIdealStep))
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

  // 3. Balance around 50 (Light v Dark)
  const lightCount = lValues.filter((l) => l > 50).length;
  const darkCount = lValues.filter((l) => l < 50).length;
  const balanceScore = 1 - Math.abs(lightCount - darkCount) / swatchCount;
  details.push(
    `Balance: light=${lightCount}, dark=${darkCount}, score=${balanceScore.toFixed(
      2
    )}`
  );

  // 3.5 Pairings of steps around 50
  let symmetricPairs = 0;
  const processedIndices = new Set<number>();

  for (let i = 0; i < lValues.length; i++) {
    if (processedIndices.has(i)) continue;

    const currentL = lValues[i];
    if (currentL === 50) continue; // Skip the middle value

    const targetL = 100 - currentL; // The symmetric value around 50
    const tolerance = 1.0;

    // Look for a symmetric pair
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

  // Calculate pairings score based on how many pairs we found
  const maxPossiblePairs = Math.floor(
    (swatchCount - (lValues.includes(50) ? 1 : 0)) / 2
  );

  // Add pairings penalty factor
  const PAIRINGS_PENALTY_FACTOR = 0.5; // Adjust this value to control penalty curve
  const symmetryScore =
    maxPossiblePairs > 0
      ? Math.pow(symmetricPairs / maxPossiblePairs, PAIRINGS_PENALTY_FACTOR)
      : 0;

  details.push(
    `Pairings of steps: found ${symmetricPairs} pairs out of ${maxPossiblePairs} possible (score: ${symmetryScore.toFixed(
      2
    )})`
  );

  // 4. WCAG A combos (>=3:1), omitting same-color pairs
  let wcagAPassing = 0;
  let wcagAAPassing = 0;
  let totalCombos = 0;
  const debugPairs: string[] = [];
  for (let i = 0; i < swatchCount; i++) {
    for (let j = 0; j < swatchCount; j++) {
      if (i === j) continue; // Omit same-color pairs
      const fg = swatches[i];
      const bg = swatches[j];
      const ratio = calculateContrastRatio(fg, bg);
      totalCombos++;
      const passesA = ratio >= 3;
      const passesAA = ratio >= 4.5;
      if (passesA) wcagAPassing++;
      if (passesAA) wcagAAPassing++;
      debugPairs.push(
        `${fg} on ${bg}: ratio=${ratio.toFixed(
          2
        )}, passesA=${passesA}, passesAA=${passesAA}`
      );
    }
  }

  // Get empirical best combo counts for this swatch count
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

  // 5. Weighted contrast score (60% AA, 40% A)
  const contrastScore = 0.6 * wcagAAScore + 0.4 * wcagAScore;
  // Remove normalization by empirical best contrast
  // const empiricalBest = getEmpiricalBestContrast(swatchCount);
  // const normalizedContrastScore = empiricalBest > 0 ? contrastScore / empiricalBest : 0;
  const normalizedContrastScore = contrastScore;
  details.push(`Contrast score (60% AA, 40% A): ${contrastScore.toFixed(3)}`);
  // details.push(
  //   `Normalized contrast score (empirical best = ${empiricalBest}): ${normalizedContrastScore.toFixed(3)}`
  // );
  // details.push(
  //   `Note: 1.0 means as good as mathematically possible for a full-range ramp of this size.`
  // );

  // Bundled scores
  const colorRangeScore = 0.33 * swatchCountScore + 0.67 * evennessScore;
  const lightDarkScore = 0.5 * balanceScore + 0.5 * symmetryScore;
  details.push(`Color Range Score: ${(colorRangeScore * 100).toFixed(1)}`);
  details.push(`Light v Dark Score: ${(lightDarkScore * 100).toFixed(1)}`);

  // 7. Overall score (weighted average of all components), multiplied by 100
  /*
  const overallScore =
    (swatchCountScore * 0.14 +
      evennessScore * 0.35 +
      balanceScore * 0.105 +
      symmetryScore * 0.105 +
      normalizedContrastScore * 0.3) *
    100;
  */

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
    // overallScore, // Commented out since the pill is hidden in the UI for now
    details,
  };
}

// Utility to generate ideal L* values for 1-9 swatches (evenly spaced from 100 to 0)
function generateIdealLValues(n: number): number[] {
  if (n === 1) return [100];
  if (n === 2) return [100, 0];
  const step = 100 / (n - 1);
  return Array.from({ length: n }, (_, i) => Math.round(100 - i * step));
}

// Generate a full mapping of ideal L* values for 1-20 swatches
const FULL_IDEAL_L_VALUES: { [n: number]: number[] } = {};
for (let n = 1; n <= 20; n++) {
  if (IDEAL_L_VALUES[n]) {
    FULL_IDEAL_L_VALUES[n] = IDEAL_L_VALUES[n];
  } else {
    FULL_IDEAL_L_VALUES[n] = generateIdealLValues(n);
  }
}

// Function to compute empirical best combos for 3:1 and 4.5:1 ratios
function computeEmpiricalBestCombos() {
  const combos: { [n: number]: { a: number; aa: number } } = {};
  for (let n = 1; n <= 20; n++) {
    const lValues = FULL_IDEAL_L_VALUES[n];
    // Convert L* to hex
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
