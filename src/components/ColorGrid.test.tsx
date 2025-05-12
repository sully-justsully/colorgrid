import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ColorGrid from "./ColorGrid";
import { Dot } from "../types";

describe("ColorGrid Component", () => {
  const mockProps = {
    hue: 0,
    isFiltering: false,
    isATextContrast: false,
    isAATextContrast: false,
    isAAATextContrast: false,
    lValues: [50, 60, 70],
    onDotClick: jest.fn(),
    activeDots: new Set<string>(),
    keyHexCode: "#FF0000",
    isPickingColor: false,
    activeLValue: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<ColorGrid {...mockProps} />);
    expect(screen.getByTestId("color-grid")).toBeInTheDocument();
  });

  it("displays the correct number of color dots", () => {
    render(<ColorGrid {...mockProps} />);
    const colorDots = screen.getAllByTestId("color-dot");
    expect(colorDots.length).toBe(10201); // 101x101 grid
  });

  it("calls onDotClick when a color dot is clicked", () => {
    render(<ColorGrid {...mockProps} />);
    const firstColorDot = screen.getAllByTestId("color-dot")[0];
    fireEvent.click(firstColorDot);
    expect(mockProps.onDotClick).toHaveBeenCalled();
  });

  it("applies filtering when isFiltering is true", () => {
    render(<ColorGrid {...mockProps} isFiltering={true} />);
    const colorDots = screen.getAllByTestId("color-dot");
    const filteredDots = colorDots.filter(
      (dot) => !dot.classList.contains("filtered")
    );
    expect(filteredDots.length).toBeLessThan(10201);
  });

  it("applies WCAG contrast filtering when enabled", () => {
    render(<ColorGrid {...mockProps} isAATextContrast={true} />);
    const colorDots = screen.getAllByTestId("color-dot");
    const filteredDots = colorDots.filter(
      (dot) => !dot.classList.contains("filtered")
    );
    expect(filteredDots.length).toBeLessThan(10201);
  });
});
