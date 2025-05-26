// evaluatePalette.js
const { evaluateColorSystem } = require("./dist/utils/evaluateColorSystem");
const { hexToLabLightness } = require("./dist/utils/colorUtils");

const palette = process.argv.slice(2);
if (palette.length === 0) {
  console.error("Usage: node evaluatePalette.js #HEX1 #HEX2 ...");
  process.exit(1);
}

console.log("Hex | L* (Lab)");
palette.forEach((hex) => {
  const lstar = hexToLabLightness(hex);
  console.log(`${hex} | ${lstar.toFixed(2)}`);
});

const result = evaluateColorSystem(palette);
console.log("\nEvaluation Result:");
console.log(JSON.stringify(result, null, 2));
