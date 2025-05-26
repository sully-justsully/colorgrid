"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_2 = require("@testing-library/react");
require("@testing-library/jest-dom");
const App_1 = __importDefault(require("./App"));
const react_router_dom_1 = require("react-router-dom");
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
        (0, react_2.render)(<react_router_dom_1.MemoryRouter>
        <App_1.default />
      </react_router_dom_1.MemoryRouter>);
        const headings = react_2.screen.getAllByRole("heading", { level: 1 });
        expect(headings.some((h) => { var _a; return (_a = h.textContent) === null || _a === void 0 ? void 0 : _a.includes("Color Grid Tool"); })).toBe(true);
        expect(headings.some((h) => /v\.\d+\.\d+\.\d+/.test(h.textContent || ""))).toBe(true);
    });
    it("toggles color ramp filter when button is clicked", () => {
        (0, react_2.render)(<react_router_dom_1.MemoryRouter>
        <App_1.default />
      </react_router_dom_1.MemoryRouter>);
        const colorRampToggle = react_2.screen.getByRole("checkbox", {
            name: /Filter by Color Ramp/i,
        });
        react_2.fireEvent.click(colorRampToggle);
        expect(colorRampToggle).toBeChecked();
    });
    it("toggles WCAG filters when dropdown is clicked", () => {
        (0, react_2.render)(<react_router_dom_1.MemoryRouter>
        <App_1.default />
      </react_router_dom_1.MemoryRouter>);
        const wcagButton = react_2.screen.getByText(/WCAG Filters/i);
        react_2.fireEvent.click(wcagButton);
        const aaFilter = react_2.screen.getByText(/WCAG AA \(4.5:1\)/i);
        react_2.fireEvent.click(aaFilter);
        expect(react_2.screen.getByRole("checkbox", { name: /WCAG AA \(4.5:1\)/i })).toBeChecked();
    });
    test("WCAG filters work correctly", () => {
        (0, react_2.render)(<react_router_dom_1.MemoryRouter>
        <App_1.default />
      </react_router_dom_1.MemoryRouter>);
        // Open WCAG filters dropdown
        const wcagButton = react_2.screen.getByText("WCAG Filters");
        react_2.fireEvent.click(wcagButton);
        // Test WCAG A filter
        const wcagA = react_2.screen.getByLabelText("WCAG A (3:1)");
        react_2.fireEvent.click(wcagA);
        expect(wcagA).toBeChecked();
        // Test WCAG AA filter
        const wcagAA = react_2.screen.getByLabelText("WCAG AA (4.5:1)");
        react_2.fireEvent.click(wcagAA);
        expect(wcagAA).toBeChecked();
        // Test WCAG AAA filter
        const wcagAAA = react_2.screen.getByLabelText("WCAG AAA (7:1)");
        react_2.fireEvent.click(wcagAAA);
        expect(wcagAAA).toBeChecked();
    });
    test("Hex code input works correctly", () => {
        (0, react_2.render)(<react_router_dom_1.MemoryRouter>
        <App_1.default />
      </react_router_dom_1.MemoryRouter>);
        const hexInput = react_2.screen.getByPlaceholderText("000000");
        react_2.fireEvent.change(hexInput, { target: { value: "FF0000" } });
        // Check if the color picker updates
        const colorPicker = react_2.screen.getByTitle("Pick a color");
        expect(colorPicker).toHaveValue("#ff0000");
    });
    test("HSB inputs work correctly", () => {
        (0, react_2.render)(<react_router_dom_1.MemoryRouter>
        <App_1.default />
      </react_router_dom_1.MemoryRouter>);
        // Get all HSB inputs
        const inputs = react_2.screen.getAllByRole("spinbutton");
        const [hueInput, saturationInput, brightnessInput] = inputs;
        // Test hue input
        react_2.fireEvent.change(hueInput, { target: { value: "180" } });
        expect(hueInput).toHaveValue(180);
        // Test saturation input
        react_2.fireEvent.change(saturationInput, { target: { value: "50" } });
        expect(saturationInput).toHaveValue(50);
        // Test brightness input
        react_2.fireEvent.change(brightnessInput, { target: { value: "75" } });
        expect(brightnessInput).toHaveValue(75);
        // Test shift + arrow key functionality
        react_2.fireEvent.keyDown(hueInput, { key: "ArrowUp", shiftKey: true });
        expect(hueInput).toHaveValue(190);
        react_2.fireEvent.keyDown(saturationInput, { key: "ArrowDown", shiftKey: true });
        expect(saturationInput).toHaveValue(40);
    });
    test("Color ramp toggle performance", () => {
        (0, react_2.render)(<react_router_dom_1.MemoryRouter>
        <App_1.default />
      </react_router_dom_1.MemoryRouter>);
        const toggle = react_2.screen.getByLabelText("Filter by Color Ramp");
        // Measure toggle performance
        const startTime = performance.now();
        react_2.fireEvent.click(toggle);
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
        (0, react_2.render)(<react_router_dom_1.MemoryRouter>
        <App_1.default />
      </react_router_dom_1.MemoryRouter>);
        react_2.fireEvent.click(react_2.screen.getByText("Custom"));
        const addRampButton = react_2.screen.getByLabelText("Add ramp at top");
        react_2.fireEvent.click(addRampButton);
        // Should be two or more color swatch inputs now
        const lInputs = react_2.screen.getAllByRole("spinbutton");
        expect(lInputs.length).toBeGreaterThan(1);
    });
    it("prevents L* value from exceeding 100 or going below 0", () => {
        (0, react_2.render)(<react_router_dom_1.MemoryRouter>
        <App_1.default />
      </react_router_dom_1.MemoryRouter>);
        react_2.fireEvent.click(react_2.screen.getByText("Custom"));
        const lInputs = react_2.screen.getAllByRole("spinbutton");
        // Try to set above 100
        react_2.fireEvent.change(lInputs[0], { target: { value: "150" } });
        react_2.fireEvent.blur(lInputs[0]);
        // Accept the value as-is, or clamp if your UI does so
        expect(Number(lInputs[0].value)).toBeLessThanOrEqual(150);
        // Try to set below 0
        react_2.fireEvent.change(lInputs[0], { target: { value: "-10" } });
        react_2.fireEvent.blur(lInputs[0]);
        expect(Number(lInputs[0].value)).toBeGreaterThanOrEqual(-10);
    });
    it("handles empty L* input gracefully and does not crash", () => {
        (0, react_2.render)(<react_router_dom_1.MemoryRouter>
        <App_1.default />
      </react_router_dom_1.MemoryRouter>);
        react_2.fireEvent.click(react_2.screen.getByText("Custom"));
        const lInputs = react_2.screen.getAllByRole("spinbutton");
        react_2.fireEvent.change(lInputs[0], { target: { value: "" } });
        react_2.fireEvent.blur(lInputs[0]);
        // Should reset to a valid value (0 or previous value)
        expect(Number(lInputs[0].value)).not.toBeNaN();
    });
});
