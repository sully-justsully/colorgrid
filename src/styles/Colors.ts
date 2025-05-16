/**
 * Color scale values available in the design system.
 * Each color has a scale from 00 (lightest) to 850 (darkest).
 */
export type ColorScale =
  | "00"
  | "50"
  | "100"
  | "150"
  | "200"
  | "250"
  | "300"
  | "350"
  | "400"
  | "450"
  | "500"
  | "550"
  | "600"
  | "650"
  | "700"
  | "750"
  | "800"
  | "850";

/**
 * Color categories available in the design system.
 */
export type ColorCategory = "primary" | "neutral" | "error";

/**
 * Type for accessing color variables.
 * Example: colors.primary[500] -> 'var(--color-primary-500)'
 */
export type ColorSystem = {
  [K in ColorCategory]: {
    [scale in ColorScale]: string;
  };
};

/**
 * Helper function to get a color variable.
 * @param category - The color category (primary, neutral, or error)
 * @param scale - The color scale value (00-850)
 * @returns The CSS variable reference
 */
export function getColor(category: ColorCategory, scale: ColorScale): string {
  return `var(--color-${category}-${scale})`;
}

/**
 * The color system object that provides access to all color variables.
 * Usage:
 * ```ts
 * colors.primary[500] // -> 'var(--color-primary-500)'
 * colors.neutral[200] // -> 'var(--color-neutral-200)'
 * colors.error[400] // -> 'var(--color-error-400)'
 * ```
 */
export const colors: ColorSystem = {
  primary: {
    "00": "var(--color-primary-00)",
    "50": "var(--color-primary-50)",
    "100": "var(--color-primary-100)",
    "150": "var(--color-primary-150)",
    "200": "var(--color-primary-200)",
    "250": "var(--color-primary-250)",
    "300": "var(--color-primary-300)",
    "350": "var(--color-primary-350)",
    "400": "var(--color-primary-400)",
    "450": "var(--color-primary-450)",
    "500": "var(--color-primary-500)",
    "550": "var(--color-primary-550)",
    "600": "var(--color-primary-600)",
    "650": "var(--color-primary-650)",
    "700": "var(--color-primary-700)",
    "750": "var(--color-primary-750)",
    "800": "var(--color-primary-800)",
    "850": "var(--color-primary-850)",
  },
  neutral: {
    "00": "var(--color-neutral-00)",
    "50": "var(--color-neutral-50)",
    "100": "var(--color-neutral-100)",
    "150": "var(--color-neutral-150)",
    "200": "var(--color-neutral-200)",
    "250": "var(--color-neutral-250)",
    "300": "var(--color-neutral-300)",
    "350": "var(--color-neutral-350)",
    "400": "var(--color-neutral-400)",
    "450": "var(--color-neutral-450)",
    "500": "var(--color-neutral-500)",
    "550": "var(--color-neutral-550)",
    "600": "var(--color-neutral-600)",
    "650": "var(--color-neutral-650)",
    "700": "var(--color-neutral-700)",
    "750": "var(--color-neutral-750)",
    "800": "var(--color-neutral-800)",
    "850": "var(--color-neutral-850)",
  },
  error: {
    "00": "var(--color-error-00)",
    "50": "var(--color-error-50)",
    "100": "var(--color-error-100)",
    "150": "var(--color-error-150)",
    "200": "var(--color-error-200)",
    "250": "var(--color-error-250)",
    "300": "var(--color-error-300)",
    "350": "var(--color-error-350)",
    "400": "var(--color-error-400)",
    "450": "var(--color-error-450)",
    "500": "var(--color-error-500)",
    "550": "var(--color-error-550)",
    "600": "var(--color-error-600)",
    "650": "var(--color-error-650)",
    "700": "var(--color-error-700)",
    "750": "var(--color-error-750)",
    "800": "var(--color-error-800)",
    "850": "var(--color-error-850)",
  },
};
