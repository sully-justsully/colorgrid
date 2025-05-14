import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";

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
    render(<App />);
    const titleElement = screen.getByRole("heading", { level: 1 });
    expect(titleElement).toHaveTextContent("Color Grid Tool");
    expect(titleElement).toHaveTextContent(/v\.\d+\.\d+\.\d+/); // Matches version number format
  });

  it("toggles color ramp filter when button is clicked", () => {
    render(<App />);
    const colorRampToggle = screen.getByRole("checkbox", {
      name: /Filter by Color Ramp/i,
    });
    fireEvent.click(colorRampToggle);
    expect(colorRampToggle).toBeChecked();
  });

  it("toggles WCAG filters when dropdown is clicked", () => {
    render(<App />);
    const wcagButton = screen.getByText(/WCAG Filters/i);
    fireEvent.click(wcagButton);
    const aaFilter = screen.getByText(/WCAG AA \(4.5:1\)/i);
    fireEvent.click(aaFilter);
    expect(
      screen.getByRole("checkbox", { name: /WCAG AA \(4.5:1\)/i })
    ).toBeChecked();
  });

  it("shows help modal when help button is clicked", () => {
    render(<App />);
    const helpButton = screen.getByText(/Need Help\?/i);
    fireEvent.click(helpButton);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("exports colors as SVG when export button is clicked", () => {
    render(<App />);
    const exportButton = screen.getByText(/Export as SVG/i);
    fireEvent.click(exportButton);
    expect(mockCreateObjectURL).toHaveBeenCalled();
  });

  test("WCAG filters work correctly", () => {
    render(<App />);

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
    render(<App />);

    const hexInput = screen.getByPlaceholderText("000000");
    fireEvent.change(hexInput, { target: { value: "FF0000" } });

    // Check if the color picker updates
    const colorPicker = screen.getByTitle("Pick a color");
    expect(colorPicker).toHaveValue("#FF0000");
  });

  test("HSB inputs work correctly", () => {
    render(<App />);

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
    render(<App />);

    const toggle = screen.getByLabelText("Filter by Color Ramp");

    // Measure toggle performance
    const startTime = performance.now();
    fireEvent.click(toggle);
    const endTime = performance.now();

    // Toggle should complete within 50ms
    expect(endTime - startTime).toBeLessThan(50);
  });
});
