import { useState, useCallback, useEffect } from "react";
export var useColorGrid = function (activeTab) {
    // Map swatchId -> dotKey
    var _a = useState(new Map()), activeDots = _a[0], setActiveDots = _a[1];
    // Load saved active dots from localStorage on mount
    useEffect(function () {
        var savedDots = localStorage.getItem("activeDots-".concat(activeTab));
        if (savedDots) {
            try {
                var parsed = JSON.parse(savedDots);
                var newMap = new Map(Object.entries(parsed).map(function (_a) {
                    var swatchId = _a[0], dotKey = _a[1];
                    return [
                        Number(swatchId),
                        dotKey,
                    ];
                }));
                setActiveDots(newMap);
            }
            catch (e) {
                console.error("Error loading saved active dots:", e);
            }
        }
    }, [activeTab]);
    // Save active dots to localStorage whenever they change
    useEffect(function () {
        var dotsObject = Object.fromEntries(activeDots);
        localStorage.setItem("activeDots-".concat(activeTab), JSON.stringify(dotsObject));
    }, [activeDots, activeTab]);
    var handleDotClick = useCallback(function (dot, swatchId) {
        console.log("useColorGrid handleDotClick:", {
            dot: dot,
            swatchId: swatchId,
            currentActiveDots: Array.from(activeDots.entries()),
        });
        setActiveDots(function (prev) {
            var newActiveDots = new Map(prev);
            var dotKey = "".concat(dot.row, "-").concat(dot.col);
            newActiveDots.set(swatchId, dotKey);
            console.log("New active dots state:", {
                swatchId: swatchId,
                dotKey: dotKey,
                newActiveDots: Array.from(newActiveDots.entries()),
            });
            return newActiveDots;
        });
    }, []);
    var isDotActive = useCallback(function (dotKey, swatchId) {
        var isActive = activeDots.get(swatchId) === dotKey;
        if (isActive) {
            console.log("Active dot found:", {
                dotKey: dotKey,
                swatchId: swatchId,
                activeDots: Array.from(activeDots.entries()),
            });
        }
        return isActive;
    }, [activeDots]);
    var clearActiveDots = useCallback(function () {
        console.log("clearActiveDots called!");
        setActiveDots(new Map());
    }, []);
    return {
        handleDotClick: handleDotClick,
        isDotActive: isDotActive,
        clearActiveDots: clearActiveDots,
        activeDots: activeDots,
    };
};
