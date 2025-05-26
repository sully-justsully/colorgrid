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

// Fit to [2, 2, 3, 3, 8, 9, 8, 11, 9, 10, 8, 9, 8, 3, 3, 2, 2]
// Parameters found by curve fitting (approx): a=2, b=9, sigma=0.21
function gaussianIdealSteps(n: number): number[] {
  const a = 2;
  const b = 9;
  const sigma = 0.21;
  const steps: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const x = i / (n - 2); // 0 to 1
    const step = a + b * Math.exp(-Math.pow(x - 0.5, 2) / (2 * sigma * sigma));
    steps.push(step);
  }
  // Normalize so sum = 100
  const sum = steps.reduce((acc, s) => acc + s, 0);
  return steps.map((s) => (s * 100) / sum);
}

// Empirical best contrast scores for 1-20 swatches (from optimal ramp)
const EMPIRICAL_BEST_CONTRAST: { [n: number]: number } = {
  1: 0.0,
  2: 1.0,
  3: 0.8,
  4: 0.567,
  5: 0.54,
  6: 0.507,
  7: 0.486,
  8: 0.429,
  9: 0.444,
  10: 0.462,
  11: 0.422,
  12: 0.433,
  13: 0.413,
  14: 0.42,
  15: 0.404,
  16: 0.41,
  17: 0.409,
  18: 0.4,
  19: 0.406,
  20: 0.395,
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

  // 2. Evenness of steps (Gaussian ideal)
  const lValues = swatches.map((hex) => hexToLabLightness(hex));
  const steps = [];
  for (let i = 1; i < lValues.length; i++) {
    steps.push(Math.abs(lValues[i] - lValues[i - 1]));
  }
  const idealSteps = gaussianIdealSteps(swatchCount);
  // Exponential penalty for evenness: mean(exp(abs(step - ideal)/meanIdealStep))
  const meanIdealStep =
    idealSteps.reduce((a, b) => a + b, 0) / idealSteps.length;
  const expError =
    steps.reduce(
      (acc, s, i) =>
        acc + Math.exp(Math.abs(s - idealSteps[i]) / meanIdealStep),
      0
    ) / steps.length;
  let evennessScore = 1 / expError;
  evennessScore = Math.max(0, Math.min(1, evennessScore));
  details.push(
    `Evenness of steps (Gaussian ideal, exponential penalty): expError=${expError.toFixed(
      2
    )}, score=${evennessScore.toFixed(2)}`
  );
  details.push(`Actual steps: [${steps.map((s) => s.toFixed(2)).join(", ")}]`);
  details.push(
    `Ideal steps: [${idealSteps.map((s) => s.toFixed(2)).join(", ")}]`
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
  const symmetryScore =
    maxPossiblePairs > 0 ? symmetricPairs / maxPossiblePairs : 0;

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
    empiricalBest > 0 ? Math.min(contrastScore / empiricalBest, 1) : 0;
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
    (swatchCountScore * 0.12 +
      evennessScore * 0.3 +
      balanceScore * 0.09 +
      symmetryScore * 0.09 +
      normalizedContrastScore * 0.4) *
    100;

  return {
    swatchCount,
    swatchCountScore,
    evennessScore,
    balanceScore,
    symmetryScore,
    wcagAScore,
    wcagAAScore,
    normalizedContrastScore,
    visualQualityScore,
    overallScore,
    details,
  };
}
