const { evaluateColorSystem } = require("./evaluateColorSystem");

const palette = [
  "#FFFFFF",
  "#F6F6F6",
  "#F2F2F2",
  "#ECECEC",
  "#E4E4E4",
  "#CDCDCD",
  "#B5B5B5",
  "#9F9F9F",
  "#828282",
  "#6B6B6B",
  "#535353",
  "#404040",
  "#2D2D2D",
  "#1C1C1C",
  "#161616",
  "#0E0E0E",
  "#080808",
  "#000000",
];

const result = evaluateColorSystem(palette);
console.log("Evaluation Result:", result);

export {};
