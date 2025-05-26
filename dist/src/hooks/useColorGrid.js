"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useColorGrid = void 0;
const react_1 = require("react");
const useColorGrid = (activeTab) => {
    // Map swatchId -> dotKey
    const [activeDots, setActiveDots] = (0, react_1.useState)(new Map());
    // Load saved active dots from localStorage on mount
    (0, react_1.useEffect)(() => {
        const savedDots = localStorage.getItem(`activeDots-${activeTab}`);
        if (savedDots) {
            try {
                const parsed = JSON.parse(savedDots);
                const newMap = new Map(Object.entries(parsed).map(([swatchId, dotKey]) => [
                    Number(swatchId),
                    dotKey,
                ]));
                setActiveDots(newMap);
            }
            catch (e) {
                console.error("Error loading saved active dots:", e);
            }
        }
    }, [activeTab]);
    // Save active dots to localStorage whenever they change
    (0, react_1.useEffect)(() => {
        const dotsObject = Object.fromEntries(activeDots);
        localStorage.setItem(`activeDots-${activeTab}`, JSON.stringify(dotsObject));
    }, [activeDots, activeTab]);
    const handleDotClick = (0, react_1.useCallback)((dot, swatchId) => {
        console.log("useColorGrid handleDotClick:", {
            dot,
            swatchId,
            currentActiveDots: Array.from(activeDots.entries()),
        });
        setActiveDots((prev) => {
            const newActiveDots = new Map(prev);
            const dotKey = `${dot.row}-${dot.col}`;
            newActiveDots.set(swatchId, dotKey);
            console.log("New active dots state:", {
                swatchId,
                dotKey,
                newActiveDots: Array.from(newActiveDots.entries()),
            });
            return newActiveDots;
        });
    }, []);
    const isDotActive = (0, react_1.useCallback)((dotKey, swatchId) => {
        const isActive = activeDots.get(swatchId) === dotKey;
        if (isActive) {
            console.log("Active dot found:", {
                dotKey,
                swatchId,
                activeDots: Array.from(activeDots.entries()),
            });
        }
        return isActive;
    }, [activeDots]);
    const clearActiveDots = (0, react_1.useCallback)(() => {
        console.log("clearActiveDots called!");
        setActiveDots(new Map());
    }, []);
    return {
        handleDotClick,
        isDotActive,
        clearActiveDots,
        activeDots,
    };
};
exports.useColorGrid = useColorGrid;
