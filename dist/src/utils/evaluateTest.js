"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { evaluateColorSystem } = require("./evaluateColorSystem");
const { hexToLabLightness } = require("./colorUtils");
const palette = [
    "#FFFFFF",
    "#FFF7F7",
    "#FFF0F0",
    "#FFE8E8",
    "#FFE0E0",
    "#FFD9D9",
    "#FFD1D1",
    "#FFC9C9",
    "#FFC2C2",
    "#590000",
    "#520000",
    "#4A0000",
    "#420000",
    "#3B0000",
    "#330000",
    "#290000",
    "#1C0000",
    "#080000",
];
console.log("Hex | L* (Lab)");
palette.forEach((hex) => {
    const lstar = hexToLabLightness(hex);
    console.log(`${hex} | ${lstar.toFixed(2)}`);
});
const result = evaluateColorSystem(palette);
console.log("\nEvaluation Result:");
console.log(JSON.stringify(result, null, 2));
