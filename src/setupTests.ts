// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeChecked(): R;
      toHaveValue(value: string | number): R;
      toBeLessThan(value: number): R;
      toBeGreaterThan(value: number): R;
      toBeLessThanOrEqual(value: number): R;
      toBeGreaterThanOrEqual(value: number): R;
      not: Matchers<R>;
      toBeNaN(): R;
    }
  }
}
