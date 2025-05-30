import {
  calculateContrastRatio,
  hexToHsb,
  hexToLabLightness,
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
  normalizedContrastScore: number;
  visualQualityScore: number;
  overallScore: number;
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

// Empirical best contrast scores for 1-24 swatches (from optimal ramp)
const EMPIRICAL_BEST_CONTRAST: { [n: number]: number } = {
  1: 0.0,
  2: 0.0,
  3: 0.667,
  4: 0.833,
  5: 0.64,
  6: 0.587,
  7: 0.581,
  8: 0.55,
  9: 0.544,
  10: 0.511,
  11: 0.52,
  12: 0.503,
  13: 0.49,
  14: 0.484,
  15: 0.48,
  16: 0.468,
  17: 0.471,
  18: 0.471,
  19: 0.463,
  20: 0.461,
  21: 0.46,
  22: 0.46,
  23: 0.455,
  24: 0.454,
};

function getEmpiricalBestContrast(n: number): number {
  if (EMPIRICAL_BEST_CONTRAST[n]) return EMPIRICAL_BEST_CONTRAST[n];
  // Fallback: use the closest lower value
  const keys = Object.keys(EMPIRICAL_BEST_CONTRAST)
    .map(Number)
    .sort((a, b) => a - b);
  for (let i = keys.length - 1; i >= 0; i--) {
    if (n > keys[i]) return EMPIRICAL_BEST_CONTRAST[keys[i]];
  }
  return EMPIRICAL_BEST_CONTRAST[1];
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

  // 3. Balance around 50
  const lightCount = lValues.filter((l) => l > 50).length;
  const darkCount = lValues.filter((l) => l < 50).length;
  const balanceScore = 1 - Math.abs(lightCount - darkCount) / swatchCount;
  details.push(
    `Balance around 50: light=${lightCount}, dark=${darkCount}, score=${balanceScore.toFixed(
      2
    )}`
  );

  // 3.5 Symmetry of steps around 50
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

  // Calculate symmetry score based on how many pairs we found
  const maxPossiblePairs = Math.floor(
    (swatchCount - (lValues.includes(50) ? 1 : 0)) / 2
  );

  // Add symmetry penalty factor
  const SYMMETRY_PENALTY_FACTOR = 0.5; // Adjust this value to control penalty curve
  const symmetryScore =
    maxPossiblePairs > 0
      ? Math.pow(symmetricPairs / maxPossiblePairs, SYMMETRY_PENALTY_FACTOR)
      : 0;

  details.push(
    `Symmetry of steps: found ${symmetricPairs} symmetric pairs out of ${maxPossiblePairs} possible (score: ${symmetryScore.toFixed(
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
  const wcagAScore = totalCombos > 0 ? wcagAPassing / totalCombos : 0;
  const wcagAAScore = totalCombos > 0 ? wcagAAPassing / totalCombos : 0;
  details.push(
    `WCAG A combos: ${wcagAPassing}/${totalCombos} (${(
      wcagAScore * 100
    ).toFixed(1)}%)`
  );
  details.push(
    `WCAG AA combos: ${wcagAAPassing}/${totalCombos} (${(
      wcagAAScore * 100
    ).toFixed(1)}%)`
  );
  details.push("Debug pairs:");
  debugPairs.forEach((pair) => details.push(pair));

  // 5. Weighted contrast score (60% AA, 40% A)
  const contrastScore = 0.6 * wcagAAScore + 0.4 * wcagAScore;
  // 6. Normalize contrast score by empirical best for this ramp size
  const empiricalBest = getEmpiricalBestContrast(swatchCount);
  const normalizedContrastScore =
    empiricalBest > 0 ? contrastScore / empiricalBest : 0;
  details.push(`Contrast score (60% AA, 40% A): ${contrastScore.toFixed(3)}`);
  details.push(
    `Normalized contrast score (empirical best = ${empiricalBest}): ${normalizedContrastScore.toFixed(
      3
    )}`
  );
  details.push(
    `Note: 1.0 means as good as mathematically possible for a full-range ramp of this size.`
  );

  // Bundled scores
  const visualQualityScore =
    (swatchCountScore * 0.2 +
      evennessScore * 0.5 +
      balanceScore * 0.15 +
      symmetryScore * 0.15) *
    100;
  details.push(`Visual Quality Score: ${visualQualityScore.toFixed(1)}`);
  details.push(
    `Accessibility Score (normalized contrast): ${(
      normalizedContrastScore * 100
    ).toFixed(1)}`
  );

  // 7. Overall score (weighted average of all components), multiplied by 100
  const overallScore =
    (swatchCountScore * 0.14 +
      evennessScore * 0.35 +
      balanceScore * 0.105 +
      symmetryScore * 0.105 +
      normalizedContrastScore * 0.3) *
    100;

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
    normalizedContrastScore,
    visualQualityScore,
    overallScore,
    details,
  };
}
