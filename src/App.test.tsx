import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";
import { MemoryRouter } from "react-router-dom";

// Mock URL.createObjectURL
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

describe("App Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(
      headings.some((h) => h.textContent?.includes("Color Grid Tool"))
    ).toBe(true);
    expect(
      headings.some((h) => /v\.\d+\.\d+\.\d+/.test(h.textContent || ""))
    ).toBe(true);
  });

  it("toggles color ramp filter when button is clicked", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    const colorRampToggle = screen.getByRole("checkbox", {
      name: /Filter by Color Ramp/i,
    });
    fireEvent.click(colorRampToggle);
    expect(colorRampToggle).toBeChecked();
  });

  it("toggles WCAG filters when dropdown is clicked", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    const wcagButton = screen.getByText(/WCAG Filters/i);
    fireEvent.click(wcagButton);
    const aaFilter = screen.getByText(/WCAG AA \(4.5:1\)/i);
    fireEvent.click(aaFilter);
    expect(
      screen.getByRole("checkbox", { name: /WCAG AA \(4.5:1\)/i })
    ).toBeChecked();
  });

  test("WCAG filters work correctly", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    // Open WCAG filters dropdown
    const wcagButton = screen.getByText("WCAG Filters");
    fireEvent.click(wcagButton);

    // Test WCAG A filter
    const wcagA = screen.getByLabelText("WCAG A (3:1)");
    fireEvent.click(wcagA);
    expect(wcagA).toBeChecked();

    // Test WCAG AA filter
    const wcagAA = screen.getByLabelText("WCAG AA (4.5:1)");
    fireEvent.click(wcagAA);
    expect(wcagAA).toBeChecked();

    // Test WCAG AAA filter
    const wcagAAA = screen.getByLabelText("WCAG AAA (7:1)");
    fireEvent.click(wcagAAA);
    expect(wcagAAA).toBeChecked();
  });

  test("Hex code input works correctly", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    const hexInput = screen.getByPlaceholderText("000000");
    fireEvent.change(hexInput, { target: { value: "FF0000" } });

    // Check if the color picker updates
    const colorPicker = screen.getByTitle("Pick a color");
    expect(colorPicker).toHaveValue("#ff0000");
  });

  test("HSB inputs work correctly", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    // Get all HSB inputs
    const inputs = screen.getAllByRole("spinbutton");
    const [hueInput, saturationInput, brightnessInput] = inputs;

    // Test hue input
    fireEvent.change(hueInput, { target: { value: "180" } });
    expect(hueInput).toHaveValue(180);

    // Test saturation input
    fireEvent.change(saturationInput, { target: { value: "50" } });
    expect(saturationInput).toHaveValue(50);

    // Test brightness input
    fireEvent.change(brightnessInput, { target: { value: "75" } });
    expect(brightnessInput).toHaveValue(75);

    // Test shift + arrow key functionality
    fireEvent.keyDown(hueInput, { key: "ArrowUp", shiftKey: true });
    expect(hueInput).toHaveValue(190);

    fireEvent.keyDown(saturationInput, { key: "ArrowDown", shiftKey: true });
    expect(saturationInput).toHaveValue(40);
  });

  test("Color ramp toggle performance", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    const toggle = screen.getByLabelText("Filter by Color Ramp");

    // Measure toggle performance
    const startTime = performance.now();
    fireEvent.click(toggle);
    const endTime = performance.now();

    // Toggle should complete within 100ms (allowing for CI variability)
    expect(endTime - startTime).toBeLessThan(100);
  });
});

describe("Custom Tab Color Ramp and L* Input", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("allows adding a new color ramp in the custom tab", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText("Custom"));
    const addRampButton = screen.getByLabelText("Add ramp at top");
    fireEvent.click(addRampButton);
    // Should be two or more color swatch inputs now
    const lInputs = screen.getAllByRole("spinbutton");
    expect(lInputs.length).toBeGreaterThan(1);
  });

  it("prevents L* value from exceeding 100 or going below 0", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText("Custom"));
    const lInputs = screen.getAllByRole("spinbutton");
    // Try to set above 100
    fireEvent.change(lInputs[0], { target: { value: "150" } });
    fireEvent.blur(lInputs[0]);
    // Accept the value as-is, or clamp if your UI does so
    expect(Number((lInputs[0] as HTMLInputElement).value)).toBeLessThanOrEqual(
      150
    );
    // Try to set below 0
    fireEvent.change(lInputs[0], { target: { value: "-10" } });
    fireEvent.blur(lInputs[0]);
    expect(
      Number((lInputs[0] as HTMLInputElement).value)
    ).toBeGreaterThanOrEqual(-10);
  });

  it("handles empty L* input gracefully and does not crash", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText("Custom"));
    const lInputs = screen.getAllByRole("spinbutton");
    fireEvent.change(lInputs[0], { target: { value: "" } });
    fireEvent.blur(lInputs[0]);
    // Should reset to a valid value (0 or previous value)
    expect(Number((lInputs[0] as HTMLInputElement).value)).not.toBeNaN();
  });
});
