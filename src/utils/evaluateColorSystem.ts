import {
  calculateContrastRatio,
  hexToHsb,
  getRgbLabLightness,
} from "./colorUtils";

export interface EvaluationResult {
  swatchCount: number;
  swatchCountScore: number;
  evennessScore: number;
  balanceScore: number;
  wcagAScore: number;
  wcagAAScore: number;
  normalizedContrastScore: number;
  visualQualityScore: number;
  accessibilityScore: number;
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
  const lValues = swatches.map((hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return getRgbLabLightness(r, g, b);
  });
  const steps = [];
  for (let i = 1; i < lValues.length; i++) {
    steps.push(Math.abs(lValues[i] - lValues[i - 1]));
  }
  const idealSteps = gaussianIdealSteps(swatchCount);
  // Mean absolute error between actual and ideal steps
  const meanAbsError =
    steps.reduce((acc, s, i) => acc + Math.abs(s - idealSteps[i]), 0) /
    steps.length;
  const meanIdealStep =
    idealSteps.reduce((a, b) => a + b, 0) / idealSteps.length;
  let evennessScore = 1 - meanAbsError / meanIdealStep;
  evennessScore = Math.max(0, Math.min(1, evennessScore));
  details.push(
    `Evenness of steps (Gaussian ideal): meanAbsError=${meanAbsError.toFixed(
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

  // 4. WCAG A combos (>=3:1), omitting same-color pairs
  let wcagAPassing = 0;
  let wcagAAPassing = 0;
  let totalCombos = 0;
  for (let i = 0; i < swatchCount; i++) {
    for (let j = 0; j < swatchCount; j++) {
      if (i === j) continue; // Omit same-color pairs
      const fg = swatches[i];
      const bg = swatches[j];
      const ratio = calculateContrastRatio(fg, bg);
      totalCombos++;
      if (ratio >= 3) wcagAPassing++;
      if (ratio >= 4.5) wcagAAPassing++;
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

  // 5. Weighted contrast score (60% AA, 40% A)
  const contrastScore = 0.6 * wcagAAScore + 0.4 * wcagAScore;
  // 6. Normalize contrast score by empirical best for this ramp size
  const EMPIRICAL_BEST_CONTRAST_18 = 0.81; // Update if you find a better empirical value
  const normalizedContrastScore = Math.min(
    contrastScore / EMPIRICAL_BEST_CONTRAST_18,
    1
  );
  details.push(`Contrast score (60% AA, 40% A): ${contrastScore.toFixed(3)}`);
  details.push(
    `Normalized contrast score (empirical best = ${EMPIRICAL_BEST_CONTRAST_18}): ${normalizedContrastScore.toFixed(
      3
    )}`
  );
  details.push(
    `Note: 1.0 means as good as mathematically possible for a full-range ramp of this size.`
  );

  // Bundled scores
  const visualQualityScore =
    ((swatchCountScore + evennessScore + balanceScore) / 3) * 100;
  const accessibilityScore = normalizedContrastScore * 100;
  details.push(`Visual Quality Score: ${visualQualityScore.toFixed(1)}`);
  details.push(
    `Accessibility Score (normalized contrast): ${accessibilityScore.toFixed(
      1
    )}`
  );

  // 7. Overall score (average of swatchCountScore, evennessScore, balanceScore, normalizedContrastScore), multiplied by 100, capped at 100
  const overallScore = Math.min(
    ((swatchCountScore +
      evennessScore +
      balanceScore +
      normalizedContrastScore) /
      4) *
      100,
    100
  );

  return {
    swatchCount,
    swatchCountScore,
    evennessScore,
    balanceScore,
    wcagAScore,
    wcagAAScore,
    normalizedContrastScore,
    visualQualityScore,
    accessibilityScore,
    overallScore,
    details,
  };
}
