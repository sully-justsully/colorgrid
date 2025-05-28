// evaluatePalette.ts
const { evaluateColorSystem } = require("./src/utils/evaluateColorSystem");
const { hexToLabLightness } = require("./src/utils/colorUtils");

const palettes = [
  [
    // Palette 1: Middle gray ramp
    "#848484",
    "#828282",
    "#7F7F7F",
    "#7D7D7D",
    "#7A7A7A",
    "#787878",
    "#757575",
    "#737373",
    "#717171",
    "#6E6E6E",
    "#6B6B6B",
    "#696969",
  ],
  [
    // Palette 2: Light gray ramp
    "#FFFFFF",
    "#F8F8F8",
    "#F6F6F6",
    "#F4F4F4",
    "#F2F2F2",
    "#F0F0F0",
    "#EEEEEE",
    "#ECECEC",
    "#EAEAEA",
    "#E7E7E7",
    "#E4E4E4",
    "#E1E1E1",
  ],
  [
    // Palette 3: Dark gray ramp
    "#1E1E1E",
    "#1C1C1C",
    "#1A1A1A",
    "#181818",
    "#161616",
    "#141414",
    "#111111",
    "#0E0E0E",
    "#0B0B0B",
    "#080808",
    "#030303",
    "#000000",
  ],
  [
    // Blue palette from screenshot
    "#FFFFFF",
    "#E6EFFF",
    "#C7DCFF",
    "#9AC0FC",
    "#70A5FA",
    "#4185F2",
    "#1662DB",
    "#0747AD",
    "#033280",
    "#001F52",
    "#001330",
    "#000205",
  ],
];

palettes.forEach((palette, idx) => {
  console.log(`\nPalette ${idx + 1}:`);
  const result = evaluateColorSystem(palette);
  console.log(JSON.stringify(result, null, 2));
});

export {};
