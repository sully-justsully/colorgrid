import React, { useEffect, useRef, useState } from "react";

// Fixed rect and circle positions from step 3_1.svg
const RECT_POSITIONS = [
  { x: 23, y: 26, width: 29, height: 29, rx: 4 },
  { x: 60, y: 26, width: 29, height: 29, rx: 4 },
  { x: 97, y: 26, width: 29, height: 29, rx: 4 },
  { x: 134, y: 26, width: 29, height: 29, rx: 4 },
  { x: 171, y: 26, width: 29, height: 29, rx: 4 },
  { x: 208, y: 26, width: 29, height: 29, rx: 4 },
];
const CIRCLE_POSITIONS = [
  // row 1 (bottom)
  { cx: 229, cy: 282, r: 5 },
  { cx: 207, cy: 282, r: 5 },
  { cx: 185, cy: 282, r: 5 },
  { cx: 163, cy: 282, r: 5 },
  { cx: 141, cy: 282, r: 5 },
  { cx: 119, cy: 282, r: 5 },
  { cx: 97, cy: 282, r: 5 },
  { cx: 75, cy: 282, r: 5 },
  { cx: 53, cy: 282, r: 5 },
  { cx: 31, cy: 282, r: 5 },
  // row 2
  { cx: 229, cy: 260, r: 5 },
  { cx: 207, cy: 260, r: 5 },
  { cx: 185, cy: 260, r: 5 },
  { cx: 163, cy: 260, r: 5 },
  { cx: 141, cy: 260, r: 5 },
  { cx: 119, cy: 260, r: 5 },
  { cx: 97, cy: 260, r: 5 },
  { cx: 75, cy: 260, r: 5 },
  { cx: 53, cy: 260, r: 5 },
  { cx: 31, cy: 260, r: 5 },
  // row 3
  { cx: 229, cy: 238, r: 5 },
  { cx: 207, cy: 238, r: 5 },
  { cx: 185, cy: 238, r: 5 },
  { cx: 163, cy: 238, r: 5 },
  { cx: 141, cy: 238, r: 5 },
  { cx: 119, cy: 238, r: 5 },
  { cx: 97, cy: 238, r: 5 },
  { cx: 75, cy: 238, r: 5 },
  { cx: 53, cy: 238, r: 5 },
  { cx: 31, cy: 238, r: 5 },
  // row 4
  { cx: 229, cy: 216, r: 5 },
  { cx: 207, cy: 216, r: 5 },
  { cx: 185, cy: 216, r: 5 },
  { cx: 163, cy: 216, r: 5 },
  { cx: 141, cy: 216, r: 5 },
  { cx: 119, cy: 216, r: 5 },
  { cx: 97, cy: 216, r: 5 },
  { cx: 75, cy: 216, r: 5 },
  { cx: 53, cy: 216, r: 5 },
  { cx: 31, cy: 216, r: 5 },
  // row 5
  { cx: 229, cy: 194, r: 5 },
  { cx: 207, cy: 194, r: 5 },
  { cx: 185, cy: 194, r: 5 },
  { cx: 163, cy: 194, r: 5 },
  { cx: 141, cy: 194, r: 5 },
  { cx: 119, cy: 194, r: 5 },
  { cx: 97, cy: 194, r: 5 },
  { cx: 75, cy: 194, r: 5 },
  { cx: 53, cy: 194, r: 5 },
  { cx: 31, cy: 194, r: 5 },
  // row 6
  { cx: 229, cy: 172, r: 5 },
  { cx: 207, cy: 172, r: 5 },
  { cx: 185, cy: 172, r: 5 },
  { cx: 163, cy: 172, r: 5 },
  { cx: 141, cy: 172, r: 5 },
  { cx: 119, cy: 172, r: 5 },
  { cx: 97, cy: 172, r: 5 },
  { cx: 75, cy: 172, r: 5 },
  { cx: 53, cy: 172, r: 5 },
  { cx: 31, cy: 172, r: 5 },
  // row 7
  { cx: 229, cy: 150, r: 5 },
  { cx: 207, cy: 150, r: 5 },
  { cx: 185, cy: 150, r: 5 },
  { cx: 163, cy: 150, r: 5 },
  { cx: 141, cy: 150, r: 5 },
  { cx: 119, cy: 150, r: 5 },
  { cx: 97, cy: 150, r: 5 },
  { cx: 75, cy: 150, r: 5 },
  { cx: 53, cy: 150, r: 5 },
  { cx: 31, cy: 150, r: 5 },
  // row 8
  { cx: 229, cy: 128, r: 5 },
  { cx: 207, cy: 128, r: 5 },
  { cx: 185, cy: 128, r: 5 },
  { cx: 163, cy: 128, r: 5 },
  { cx: 141, cy: 128, r: 5 },
  { cx: 119, cy: 128, r: 5 },
  { cx: 97, cy: 128, r: 5 },
  { cx: 75, cy: 128, r: 5 },
  { cx: 53, cy: 128, r: 5 },
  { cx: 31, cy: 128, r: 5 },
  // row 9 (top)
  { cx: 229, cy: 106, r: 5 },
  { cx: 207, cy: 106, r: 5 },
  { cx: 185, cy: 106, r: 5 },
  { cx: 163, cy: 106, r: 5 },
  { cx: 141, cy: 106, r: 5 },
  { cx: 119, cy: 106, r: 5 },
  { cx: 97, cy: 106, r: 5 },
  { cx: 75, cy: 106, r: 5 },
  { cx: 53, cy: 106, r: 5 },
  { cx: 31, cy: 106, r: 5 },
  // row 10
  { cx: 229, cy: 84, r: 5 },
  { cx: 207, cy: 84, r: 5 },
  { cx: 185, cy: 84, r: 5 },
  { cx: 163, cy: 84, r: 5 },
  { cx: 141, cy: 84, r: 5 },
  { cx: 119, cy: 84, r: 5 },
  { cx: 97, cy: 84, r: 5 },
  { cx: 75, cy: 84, r: 5 },
  { cx: 53, cy: 84, r: 5 },
  { cx: 31, cy: 84, r: 5 },
];

// Types for the keyframe data
type RectAttributes = {
  fill: string;
  opacity?: number;
  stroke?: string;
  strokeWidth?: number;
};

type CircleAttributes = {
  fill: string;
  opacity?: number;
  stroke?: string;
};

type PathData = {
  d: string;
  fill: string;
  stroke?: string;
  opacity?: number;
};

type Keyframe = {
  rects: RectAttributes[];
  circles: CircleAttributes[];
  paths: PathData[];
};

// For each frame, only store color/opacity/stroke for each rect/circle, and the path data
const KEYFRAMES: Keyframe[] = [
  // Frame 1: step 3_1.svg
  {
    rects: [
      { fill: "#FFFFFF" },
      { fill: "#CCCCCC" },
      { fill: "#999999" },
      { fill: "#666666" },
      { fill: "#333333" },
      { fill: "#000000" },
    ],
    circles: [
      // row 1 (bottom)
      { fill: "#000000" },
      { fill: "#000000" },
      { fill: "#000000" },
      { fill: "#000000" },
      { fill: "#000000" },
      { fill: "#000000" },
      { fill: "#000000" },
      { fill: "#000000" },
      { fill: "#000000" },
      { fill: "#000000" },
      // row 2
      { fill: "#000D1A" },
      { fill: "#030E1A" },
      { fill: "#050F1A" },
      { fill: "#08111A" },
      { fill: "#0A121A" },
      { fill: "#0F141A" },
      { fill: "#12161A" },
      { fill: "#14171A" },
      { fill: "#17181A" },
      { fill: "#1A1A1A" },
      // row 3
      { fill: "#001A33" },
      { fill: "#051C33" },
      { fill: "#0A1F33" },
      { fill: "#0F2133" },
      { fill: "#142433" },
      { fill: "#1F2933" },
      { fill: "#242B33" },
      { fill: "#292E33" },
      { fill: "#2E3033" },
      { fill: "#333333" },
      // row 4
      { fill: "#00264D" },
      { fill: "#082A4D" },
      { fill: "#0F2E4D" },
      { fill: "#17324D" },
      { fill: "#1F364D" },
      { fill: "#2E3D4D" },
      { fill: "#36414D" },
      { fill: "#3E454D" },
      { fill: "#45494D" },
      { fill: "#4D4D4D" },
      // row 5
      { fill: "#003266" },
      { fill: "#0A3866" },
      { fill: "#143D66" },
      { fill: "#1F4266" },
      { fill: "#294766" },
      { fill: "#3D5166" },
      { fill: "#475766" },
      { fill: "#525C66" },
      { fill: "#5C6166" },
      { fill: "#666666" },
      // row 6
      { fill: "#004C99" },
      { fill: "#0F5399" },
      { fill: "#1F5B99" },
      { fill: "#2E6399" },
      { fill: "#3D6B99" },
      { fill: "#5C7A99" },
      { fill: "#6B8299" },
      { fill: "#7A8A99" },
      { fill: "#8A9199" },
      { fill: "#999999" },
      // row 7
      { fill: "#0058B3" },
      { fill: "#1261B3" },
      { fill: "#246AB3" },
      { fill: "#3673B3" },
      { fill: "#477CB3" },
      { fill: "#6B8EB3" },
      { fill: "#7D97B3" },
      { fill: "#8FA0B3" },
      { fill: "#A1A9B3" },
      { fill: "#B3B3B3" },
      // row 8
      { fill: "#0065CC" },
      { fill: "#146FCC" },
      { fill: "#2979CC" },
      { fill: "#3D84CC" },
      { fill: "#528ECC" },
      { fill: "#7AA3CC" },
      { fill: "#8FADCC" },
      { fill: "#A3B7CC" },
      { fill: "#B8C2CC" },
      { fill: "#CCCCCC" },
      // row 9 (top)
      { fill: "#0071E6" },
      { fill: "#177DE6" },
      { fill: "#2E89E6" },
      { fill: "#4594E6" },
      { fill: "#5CA0E6" },
      { fill: "#8AB7E6" },
      { fill: "#A1C3E6" },
      { fill: "#B8CEE6" },
      { fill: "#CFDAE6" },
      { fill: "#E6E6E6" },
      // row 10
      { fill: "#0080FF" },
      { fill: "#1A8CFF" },
      { fill: "#3399FF" },
      { fill: "#4DA6FF" },
      { fill: "#66B3FF" },
      { fill: "#99CCFF" },
      { fill: "#B3D9FF" },
      { fill: "#CCE6FF" },
      { fill: "#E6F2FF" },
      { fill: "#FFFFFF" },
    ],
    paths: [
      {
        d: "M0 0C-0.3945 -1.2625 0.9195 -2.3804 2.1026 -1.7891L13.0459 3.6826C14.3316 4.3256 14.0535 6.2057 12.6963 6.4902L12.5616 6.5126L8.4073 7.0312C8.2533 7.0505 8.1183 7.1402 8.0401 7.2714L8.0098 7.331L6.3018 11.3154C5.7701 12.5558 4.0218 12.5062 3.5352 11.2929L3.4922 11.1718L0 0Z",
        fill: "#000000",
        stroke: "#FFFFFF",
      },
    ],
  },
  // Frame 2: step 3_2.svg
  {
    rects: [
      { fill: "#FFFFFF", opacity: 0.1 },
      { fill: "#CCCCCC", stroke: "#1773CF", strokeWidth: 2 },
      { fill: "#999999", opacity: 0.1 },
      { fill: "#666666", opacity: 0.1 },
      { fill: "#333333", opacity: 0.1 },
      { fill: "#000000", opacity: 0.1 },
    ],
    circles: [
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#CCCCCC",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#CFDAE5",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#CCE6FF",
      "#1F1F1F",
      "#1F1F1F",
    ].map((fill) => ({ fill })),
    paths: [
      {
        d: "M0 0C-0.3945 -1.2625 0.9195 -2.3804 2.1026 -1.7891L13.0459 3.6826C14.3316 4.3256 14.0535 6.2057 12.6963 6.4902L12.5616 6.5126L8.4073 7.0312C8.2533 7.0505 8.1183 7.1402 8.0401 7.2714L8.0098 7.331L6.3018 11.3154C5.7701 12.5558 4.0218 12.5062 3.5352 11.2929L3.4922 11.1718L0 0Z",
        fill: "#000000",
        stroke: "#FFFFFF",
      },
    ],
  },
  // Frame 3: step 3_3.svg
  {
    rects: [
      { fill: "#FFFFFF" },
      { fill: "#B3D9FF" },
      { fill: "#999999" },
      { fill: "#666666" },
      { fill: "#333333" },
      { fill: "#000000" },
    ],
    circles: [
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000D1A",
      "#030E1A",
      "#050F1A",
      "#08111A",
      "#0A121A",
      "#0F141A",
      "#12161A",
      "#14171A",
      "#17181A",
      "#1A1A1A",
      "#001A33",
      "#051C33",
      "#0A1F33",
      "#0F2133",
      "#142433",
      "#1F2933",
      "#242B33",
      "#292E33",
      "#2E3033",
      "#333333",
      "#00264D",
      "#082A4D",
      "#0F2E4D",
      "#17324D",
      "#1F364D",
      "#2E3D4D",
      "#36414D",
      "#3E454D",
      "#45494D",
      "#4D4D4D",
      "#003266",
      "#0A3866",
      "#143D66",
      "#1F4266",
      "#294766",
      "#3D5166",
      "#475766",
      "#525C66",
      "#5C6166",
      "#666666",
      "#004C99",
      "#0F5399",
      "#1F5B99",
      "#2E6399",
      "#3D6B99",
      "#5C7A99",
      "#6B8299",
      "#7A8A99",
      "#8A9199",
      "#999999",
      "#0058B3",
      "#1261B3",
      "#246AB3",
      "#3673B3",
      "#477CB3",
      "#6B8EB3",
      "#7D97B3",
      "#8FA0B3",
      "#A1A9B3",
      "#B3B3B3",
      "#0065CC",
      "#146FCC",
      "#2979CC",
      "#3D84CC",
      "#528ECC",
      "#7AA3CC",
      "#8FADCC",
      "#A3B7CC",
      "#B8C2CC",
      "#CCCCCC",
      "#0071E6",
      "#177DE6",
      "#2E89E6",
      "#4594E6",
      "#5CA0E6",
      "#8AB7E6",
      "#A1C3E6",
      "#B8CEE6",
      "#CFDAE6",
      "#E6E6E6",
      "#0080FF",
      "#1A8CFF",
      "#3399FF",
      "#4DA6FF",
      "#66B3FF",
      "#99CCFF",
      "#B3D9FF",
      "#CCE6FF",
      "#E6F2FF",
      "#FFFFFF",
    ].map((fill) => ({ fill })),
    paths: [
      {
        d: "M0 0C-0.395 -1.2625 0.919 -2.3804 2.102 -1.7891L13.046 3.6826C14.331 4.3256 14.053 6.2057 12.696 6.4902L12.5616 6.5126L8.4073 7.0312C8.2533 7.0505 8.1183 7.1402 8.0401 7.2714L8.0098 7.331L6.3018 11.3154C5.7701 12.5558 4.0218 12.5062 3.5352 11.2929L3.4922 11.1718L0 0Z",
        fill: "#000000",
        stroke: "#FFFFFF",
      },
    ],
  },
  // Frame 4: step 3_4.svg
  {
    rects: [
      { fill: "#FFFFFF", opacity: 0.1 },
      { fill: "#CCE5FF", opacity: 0.1 },
      { fill: "#999999", stroke: "#0B76E0", strokeWidth: 2 },
      { fill: "#666666", opacity: 0.1 },
      { fill: "#333333", opacity: 0.1 },
      { fill: "#000000", opacity: 0.1 },
    ],
    circles: [
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#666666",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#8A9199",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#8FA0B3",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#8FADCC",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#8AB7E6",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#66B3FF",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
    ].map((fill) => ({ fill })),
    paths: [
      {
        d: "M0 0C-0.395 -1.2625 0.919 -2.3804 2.102 -1.7891L13.046 3.6826C14.331 4.3256 14.053 6.2057 12.696 6.4902L12.5616 6.5126L8.4073 7.0312C8.2533 7.0505 8.1183 7.1402 8.0401 7.2714L8.0098 7.331L6.3018 11.3154C5.7701 12.5558 4.0218 12.5062 3.5352 11.2929L3.4922 11.1718L0 0Z",
        fill: "#000000",
        stroke: "#FFFFFF",
      },
    ],
  },
  // Frame 5: step 3_5.svg
  {
    rects: [
      { fill: "#FFFFFF" },
      { fill: "#B3D9FF" },
      { fill: "#7EBDFC" },
      { fill: "#666666" },
      { fill: "#333333" },
      { fill: "#000000" },
    ],
    circles: [
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000D1A",
      "#030E1A",
      "#050F1A",
      "#08111A",
      "#0A121A",
      "#0F141A",
      "#12161A",
      "#14171A",
      "#17181A",
      "#1A1A1A",
      "#001A33",
      "#051C33",
      "#0A1F33",
      "#0F2133",
      "#142433",
      "#1F2933",
      "#242B33",
      "#292E33",
      "#2E3033",
      "#333333",
      "#00264D",
      "#082A4D",
      "#0F2E4D",
      "#17324D",
      "#1F364D",
      "#2E3D4D",
      "#36414D",
      "#3E454D",
      "#45494D",
      "#4D4D4D",
      "#003266",
      "#0A3866",
      "#143D66",
      "#1F4266",
      "#294766",
      "#3D5166",
      "#475766",
      "#525C66",
      "#5C6166",
      "#666666",
      "#004C99",
      "#0F5399",
      "#1F5B99",
      "#2E6399",
      "#3D6B99",
      "#5C7A99",
      "#6B8299",
      "#7A8A99",
      "#8A9199",
      "#999999",
      "#0058B3",
      "#1261B3",
      "#246AB3",
      "#3673B3",
      "#477CB3",
      "#6B8EB3",
      "#7D97B3",
      "#8FA0B3",
      "#A1A9B3",
      "#B3B3B3",
      "#0065CC",
      "#146FCC",
      "#2979CC",
      "#3D84CC",
      "#528ECC",
      "#7AA3CC",
      "#8FADCC",
      "#A3B7CC",
      "#B8C2CC",
      "#CCCCCC",
      "#0071E6",
      "#177DE6",
      "#2E89E6",
      "#4594E6",
      "#5CA0E6",
      "#8AB7E6",
      "#A1C3E6",
      "#B8CEE6",
      "#CFDAE6",
      "#E6E6E6",
      "#0080FF",
      "#1A8CFF",
      "#3399FF",
      "#4DA6FF",
      "#66B3FF",
      "#99CCFF",
      "#B3D9FF",
      "#CCE6FF",
      "#E6F2FF",
      "#FFFFFF",
    ].map((fill) => ({ fill })),
    paths: [
      {
        d: "M0 0C-0.395 -1.2625 0.919 -2.3804 2.102 -1.7891L13.046 3.6826C14.331 4.3256 14.053 6.2057 12.696 6.4902L12.5616 6.5126L8.4073 7.0312C8.2533 7.0505 8.1183 7.1402 8.0401 7.2714L8.0098 7.331L6.3018 11.3154C5.7701 12.5558 4.0218 12.5062 3.5352 11.2929L3.4922 11.1718L0 0Z",
        fill: "#000000",
        stroke: "#FFFFFF",
      },
    ],
  },
  // Frame 6: step 3_6.svg
  {
    rects: [
      { fill: "#FFFFFF", opacity: 0.1 },
      { fill: "#B3D9FF", opacity: 0.1 },
      { fill: "#7EBDFC", opacity: 0.1 },
      { fill: "#666666", stroke: "#0B76E0", strokeWidth: 2 },
      { fill: "#333333", opacity: 0.1 },
      { fill: "#000000", opacity: 0.1 },
    ],
    circles: [
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1A1A1A",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#2E3033",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#3E454D",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#475766",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#5C7A99",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#477CB2",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#3D84CC",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#2E89E5",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1A8CFF",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
    ].map((fill) => ({ fill })),
    paths: [
      {
        d: "M0 0C-0.395 -1.262 0.919 -2.381 2.102 -1.79L13.046 3.682C14.331 4.326 14.053 6.206 12.696 6.49L12.561 6.513L8.407 7.032C8.253 7.051 8.118 7.14 8.04 7.271L8.009 7.331L6.301 11.315C5.77 12.556 4.021 12.506 3.535 11.293L3.492 11.172L0 0Z",
        fill: "#000000",
        stroke: "#FFFFFF",
      },
    ],
  },
  // Frame 7: step 3_7.svg
  {
    rects: [
      { fill: "#FFFFFF" },
      { fill: "#B3D9FF" },
      { fill: "#7EBDFC" },
      { fill: "#1884F0" },
      { fill: "#333333" },
      { fill: "#000000" },
    ],
    circles: [
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000D1A",
      "#030E1A",
      "#050F1A",
      "#08111A",
      "#0A121A",
      "#0F141A",
      "#12161A",
      "#14171A",
      "#17181A",
      "#1A1A1A",
      "#001A33",
      "#051C33",
      "#0A1F33",
      "#0F2133",
      "#142433",
      "#1F2933",
      "#242B33",
      "#292E33",
      "#2E3033",
      "#333333",
      "#00264D",
      "#082A4D",
      "#0F2E4D",
      "#17324D",
      "#1F364D",
      "#2E3D4D",
      "#36414D",
      "#3E454D",
      "#45494D",
      "#4D4D4D",
      "#003266",
      "#0A3866",
      "#143D66",
      "#1F4266",
      "#294766",
      "#3D5166",
      "#475766",
      "#525C66",
      "#5C6166",
      "#666666",
      "#004C99",
      "#0F5399",
      "#1F5B99",
      "#2E6399",
      "#3D6B99",
      "#5C7A99",
      "#6B8299",
      "#7A8A99",
      "#8A9199",
      "#999999",
      "#0058B3",
      "#1261B3",
      "#246AB3",
      "#3673B3",
      "#477CB3",
      "#6B8EB3",
      "#7D97B3",
      "#8FA0B3",
      "#A1A9B3",
      "#B3B3B3",
      "#0065CC",
      "#146FCC",
      "#2979CC",
      "#3D84CC",
      "#528ECC",
      "#7AA3CC",
      "#8FADCC",
      "#A3B7CC",
      "#B8C2CC",
      "#CCCCCC",
      "#0071E6",
      "#177DE6",
      "#2E89E6",
      "#4594E6",
      "#5CA0E6",
      "#8AB7E6",
      "#A1C3E6",
      "#B8CEE6",
      "#CFDAE6",
      "#E6E6E6",
      "#0080FF",
      "#1A8CFF",
      "#3399FF",
      "#4DA6FF",
      "#66B3FF",
      "#99CCFF",
      "#B3D9FF",
      "#CCE6FF",
      "#E6F2FF",
      "#FFFFFF",
    ].map((fill) => ({ fill })),
    paths: [
      {
        d: "M0 0C-0.395 -1.262 0.919 -2.381 2.102 -1.79L13.046 3.682C14.331 4.326 14.053 6.206 12.696 6.49L12.561 6.513L8.407 7.032C8.253 7.051 8.118 7.14 8.04 7.271L8.009 7.331L6.301 11.315C5.77 12.556 4.021 12.506 3.535 11.293L3.492 11.172L0 0Z",
        fill: "#000000",
        stroke: "#FFFFFF",
      },
    ],
  },
  // Frame 8: step 3_8.svg
  {
    rects: [
      { fill: "#FFFFFF", opacity: 0.1 },
      { fill: "#B3D9FF", opacity: 0.1 },
      { fill: "#7EBDFC", opacity: 0.1 },
      { fill: "#1884F0", opacity: 0.1 },
      { fill: "#00264D", stroke: "#0B76E0", strokeWidth: 2 },
      { fill: "#000000", opacity: 0.1 },
    ],
    circles: [
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#000000",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#12161A",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F2933",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F364D",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F4266",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F5B99",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1261B2",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#0065CC",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
      "#1F1F1F",
    ].map((fill) => ({ fill })),
    paths: [
      {
        d: "M0 0C-0.395 -1.262 0.919 -2.381 2.102 -1.79L13.046 3.682C14.331 4.326 14.053 6.206 12.696 6.49L12.561 6.513L8.407 7.032C8.253 7.051 8.118 7.14 8.04 7.271L8.009 7.331L6.301 11.315C5.77 12.556 4.021 12.506 3.535 11.293L3.492 11.172L0 0Z",
        fill: "#000000",
        stroke: "#FFFFFF",
      },
    ],
  },
  // Frame 9: step 3_9.svg
  {
    rects: [
      { fill: "#FFFFFF" },
      { fill: "#B3D9FF" },
      { fill: "#7EBDFC" },
      { fill: "#1884F0" },
      { fill: "#0065CC" },
      { fill: "#000000" },
    ],
    circles: [
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000D1A",
      "#030E1A",
      "#050F1A",
      "#08111A",
      "#0A121A",
      "#0F141A",
      "#12161A",
      "#14171A",
      "#17181A",
      "#1A1A1A",
      "#001A33",
      "#051C33",
      "#0A1F33",
      "#0F2133",
      "#142433",
      "#1F2933",
      "#242B33",
      "#292E33",
      "#2E3033",
      "#333333",
      "#00264D",
      "#082A4D",
      "#0F2E4D",
      "#17324D",
      "#1F364D",
      "#2E3D4D",
      "#36414D",
      "#3E454D",
      "#45494D",
      "#4D4D4D",
      "#003266",
      "#0A3866",
      "#143D66",
      "#1F4266",
      "#294766",
      "#3D5166",
      "#475766",
      "#525C66",
      "#5C6166",
      "#666666",
      "#004C99",
      "#0F5399",
      "#1F5B99",
      "#2E6399",
      "#3D6B99",
      "#5C7A99",
      "#6B8299",
      "#7A8A99",
      "#8A9199",
      "#999999",
      "#0058B3",
      "#1261B3",
      "#246AB3",
      "#3673B3",
      "#477CB3",
      "#6B8EB3",
      "#7D97B3",
      "#8FA0B3",
      "#A1A9B3",
      "#B3B3B3",
      "#0065CC",
      "#146FCC",
      "#2979CC",
      "#3D84CC",
      "#528ECC",
      "#7AA3CC",
      "#8FADCC",
      "#A3B7CC",
      "#B8C2CC",
      "#CCCCCC",
      "#0071E6",
      "#177DE6",
      "#2E89E6",
      "#4594E6",
      "#5CA0E6",
      "#8AB7E6",
      "#A1C3E6",
      "#B8CEE6",
      "#CFDAE6",
      "#E6E6E6",
      "#0080FF",
      "#1A8CFF",
      "#3399FF",
      "#4DA6FF",
      "#66B3FF",
      "#99CCFF",
      "#B3D9FF",
      "#CCE6FF",
      "#E6F2FF",
      "#FFFFFF",
    ].map((fill) => ({ fill })),
    paths: [
      {
        d: "M0 0C-0.395 -1.262 0.919 -2.381 2.102 -1.79L13.046 3.682C14.331 4.326 14.053 6.206 12.696 6.49L12.561 6.513L8.407 7.032C8.253 7.051 8.118 7.14 8.04 7.271L8.009 7.331L6.301 11.315C5.77 12.556 4.021 12.506 3.535 11.293L3.492 11.172L0 0Z",
        fill: "#000000",
        stroke: "#FFFFFF",
      },
    ],
  },
];

const PAUSE_DURATIONS = [0, 120, 120, 120, 120, 120, 120, 120, 200];
const MORPH_DURATIONS = [1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200];
const FRAME_COUNT = KEYFRAMES.length;
const TOTAL_DURATION =
  PAUSE_DURATIONS.reduce((a, b) => a + b, 0) +
  MORPH_DURATIONS.reduce((a, b) => a + b, 0);

function cubicBezierEase(t: number) {
  const c1x = 0.22,
    c1y = 1,
    c2x = 0.36,
    c2y = 1;
  function cubicBezier(
    t: number,
    p0: number,
    p1: number,
    p2: number,
    p3: number
  ) {
    const u = 1 - t;
    return (
      u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
    );
  }
  let x = t,
    a = 0,
    b = 1,
    guess = t;
  for (let i = 0; i < 5; i++) {
    const bezX = cubicBezier(guess, 0, c1x, c2x, 1);
    if (Math.abs(bezX - x) < 0.001) break;
    if (bezX < x) a = guess;
    else b = guess;
    guess = (a + b) / 2;
  }
  return cubicBezier(guess, 0, c1y, c2y, 1);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function interpolateColor(a: string, b: string, t: number) {
  if (a === b) return a;
  function hexToRgb(hex: string) {
    hex = hex.replace("#", "");
    if (hex.length === 3)
      hex = hex
        .split("")
        .map((x) => x + x)
        .join("");
    const num = parseInt(hex, 16);
    return [num >> 16, (num >> 8) & 255, num & 255];
  }
  function rgbToHex([r, g, b]: number[]) {
    return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
  }
  try {
    const rgbA = hexToRgb(a);
    const rgbB = hexToRgb(b);
    const rgb = [0, 1, 2].map((i) => Math.round(lerp(rgbA[i], rgbB[i], t)));
    return rgbToHex(rgb as [number, number, number]);
  } catch {
    return t < 0.5 ? a : b;
  }
}

function colorDistance(a: string, b: string) {
  function hexToRgb(hex: string) {
    hex = hex.replace("#", "");
    if (hex.length === 3)
      hex = hex
        .split("")
        .map((x) => x + x)
        .join("");
    const num = parseInt(hex, 16);
    return [num >> 16, (num >> 8) & 255, num & 255];
  }
  const rgbA = hexToRgb(a);
  const rgbB = hexToRgb(b);
  return Math.sqrt(
    Math.pow(rgbA[0] - rgbB[0], 2) +
      Math.pow(rgbA[1] - rgbB[1], 2) +
      Math.pow(rgbA[2] - rgbB[2], 2)
  );
}

function matchCircles(
  frameA: {
    cx: number;
    cy: number;
    r?: number;
    fill: string;
    transform?: string;
  }[],
  frameB: {
    cx: number;
    cy: number;
    r?: number;
    fill: string;
    transform?: string;
  }[]
): {
  a: { cx: number; cy: number; r?: number; fill: string; transform?: string };
  b: { cx: number; cy: number; r?: number; fill: string; transform?: string };
}[] {
  const used = new Set<number>();
  return frameB.map((b) => {
    let bestIdx = -1;
    let bestScore = Infinity;
    for (let i = 0; i < frameA.length; i++) {
      if (used.has(i)) continue;
      const a = frameA[i];
      const colorScore = colorDistance(a.fill, b.fill);
      const posScore = Math.hypot(a.cx - b.cx, a.cy - b.cy);
      const score = colorScore * 1 + posScore * 4;
      if (score < bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }
    if (bestIdx !== -1) {
      used.add(bestIdx);
      return { a: frameA[bestIdx], b };
    } else {
      return {
        a: { cx: b.cx, cy: b.cy, r: 0, fill: b.fill, transform: b.transform },
        b,
      };
    }
  });
}

// Helper to get a default rect/circle/path for missing elements
const defaultRect: RectAttributes = {
  fill: "#000000",
  opacity: 0,
};

const defaultCircle: CircleAttributes = {
  fill: "#000000",
  opacity: 0,
};

const defaultPath: PathData = {
  d: "",
  fill: "#000000",
  opacity: 0,
};

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
  fill: string;
  opacity?: number;
  stroke?: string;
  strokeWidth?: number;
};
type Circle = {
  cx: number;
  cy: number;
  r?: number;
  fill: string;
  opacity?: number;
  stroke?: string;
};
type Path = {
  d: string;
  fill: string;
  stroke?: string;
  opacity?: number;
};

function interpolateRect(
  a: RectAttributes,
  b: RectAttributes,
  t: number,
  index: number
): Rect {
  return {
    ...RECT_POSITIONS[index], // Use the correct rect position
    fill: interpolateColor(a.fill, b.fill, t),
    opacity: lerp(a.opacity ?? 1, b.opacity ?? 1, t),
    stroke: a.stroke || b.stroke,
    strokeWidth: lerp(a.strokeWidth ?? 0, b.strokeWidth ?? 0, t),
  };
}

function interpolateCircle(
  a: CircleAttributes,
  b: CircleAttributes,
  t: number,
  index: number
): Circle {
  const pos = CIRCLE_POSITIONS[index];
  return {
    cx: pos.cx,
    cy: pos.cy,
    r: pos.r,
    fill: interpolateColor(a.fill, b.fill, t),
    opacity: lerp(a.opacity ?? 1, b.opacity ?? 1, t),
    stroke: a.stroke || b.stroke,
  };
}

// Calculate the center point of a path based on its bounding box
function calculatePathCenter(d: string) {
  // Extract all x,y coordinates from the path data
  const coords = d.match(/[MLHVCSQTAZmlhvcsqtaz]|[-+]?\d*\.?\d+/g) || [];
  let xCoords: number[] = [];
  let yCoords: number[] = [];
  let currentX = 0;
  let currentY = 0;

  for (let i = 0; i < coords.length; i++) {
    const token = coords[i];
    if (token.match(/^[-+]?\d*\.?\d+$/)) {
      if (i % 2 === 0) {
        currentX = parseFloat(token);
        xCoords.push(currentX);
      } else {
        currentY = parseFloat(token);
        yCoords.push(currentY);
      }
    }
  }

  const minX = Math.min(...xCoords);
  const maxX = Math.max(...xCoords);
  const minY = Math.min(...yCoords);
  const maxY = Math.max(...yCoords);

  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
  };
}

function interpolatePath(a: PathData, b: PathData, t: number): PathData {
  const centerA = calculatePathCenter(a.d);
  const centerB = calculatePathCenter(b.d);

  // For now, just crossfade between paths (no morphing)
  return {
    d: t < 0.5 ? a.d : b.d,
    fill: interpolateColor(a.fill, b.fill, t),
    stroke: a.stroke || b.stroke,
    opacity: lerp(a.opacity ?? 1, b.opacity ?? 1, t),
  };
}

// Path transform data for each frame (center x, y, and scale)
const PATH_TRANSFORMS = [
  { x: 81.2236, y: 52.3936, scale: 1.0 }, // frame 1
  { x: 75.2236, y: 86.3936, scale: 1.0 }, // frame 2
  { x: 118.224, y: 52.3936, scale: 1.0 }, // frame 3
  { x: 141.224, y: 86.3936, scale: 1.0 }, // frame 4
  { x: 155.224, y: 52.3936, scale: 1.0 }, // frame 5
  { x: 207.224, y: 86.3936, scale: 1.0 }, // frame 6
  { x: 192.224, y: 52.3936, scale: 1.0 }, // frame 7
  { x: 229.224, y: 130.394, scale: 1.0 }, // frame 8
  { x: 229.224, y: 130.394, scale: 1.0 }, // frame 9
];

function interpolateTransform(
  a: { x: number; y: number; scale: number },
  b: { x: number; y: number; scale: number },
  t: number
) {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    scale: lerp(a.scale, b.scale, t),
  };
}

// Path morphing helper (simple crossfade for now)
function interpolatePathD(a: string, b: string, t: number) {
  // If you want true morphing, use a library like flubber here
  // For now, just crossfade (switch at halfway)
  return t < 0.5 ? a : b;
}

const Step3KeyframeAnimation: React.FC = () => {
  const [frame, setFrame] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1 morph, 1 = pause
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    let animating = true;
    let start: number | undefined;
    function animate(ts: number) {
      if (!animating) return;
      if (start === undefined) start = ts;
      let elapsed = ts - start;
      // Figure out which frame and progress we're in
      let acc = 0;
      let frameIdx = 0;
      let morphing = false;
      let morphProgress = 0;
      for (let i = 0; i < FRAME_COUNT; i++) {
        // Morph
        if (elapsed < acc + MORPH_DURATIONS[i]) {
          frameIdx = i;
          morphing = true;
          morphProgress = (elapsed - acc) / MORPH_DURATIONS[i];
          break;
        }
        acc += MORPH_DURATIONS[i];
        // Pause
        if (elapsed < acc + PAUSE_DURATIONS[i]) {
          frameIdx = i;
          morphing = false;
          morphProgress = 1;
          break;
        }
        acc += PAUSE_DURATIONS[i];
      }
      if (elapsed >= TOTAL_DURATION) {
        frameIdx = 0;
        morphing = true;
        morphProgress = 0;
        start = ts;
        elapsed = 0;
      }
      setFrame(frameIdx);
      setProgress(morphing ? cubicBezierEase(morphProgress) : 1);
      requestRef.current = requestAnimationFrame(animate);
    }
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      animating = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const nextFrame = (frame + 1) % KEYFRAMES.length;
  const current = KEYFRAMES[frame];
  const next = KEYFRAMES[nextFrame];

  // Ensure all rects, circles, and paths are present in both frames
  const maxRects = Math.max(current.rects.length, next.rects.length);
  const maxCircles = Math.max(current.circles.length, next.circles.length);
  const maxPaths = Math.max(current.paths.length, next.paths.length);

  const rects = Array.from({ length: maxRects }, (_, i) =>
    interpolateRect(
      current.rects[i] || defaultRect,
      next.rects[i] || defaultRect,
      progress,
      i
    )
  );
  const circles = Array.from({ length: maxCircles }, (_, i) =>
    interpolateCircle(
      current.circles[i] || defaultCircle,
      next.circles[i] || defaultCircle,
      progress,
      i
    )
  );
  const paths = Array.from({ length: maxPaths }, (_, i) =>
    interpolatePath(
      current.paths[i] || defaultPath,
      next.paths[i] || defaultPath,
      progress
    )
  );

  const pathA = current.paths[0] || defaultPath;
  const pathB = next.paths[0] || defaultPath;
  const pathD = interpolatePathD(pathA.d, pathB.d, progress);
  const pathFill = interpolateColor(
    pathA.fill || "#000000",
    pathB.fill || "#000000",
    progress
  );
  const pathStroke = pathA.stroke || pathB.stroke;
  const pathOpacity = lerp(pathA.opacity ?? 1, pathB.opacity ?? 1, progress);

  const pathTransformA = PATH_TRANSFORMS[frame];
  const pathTransformB = PATH_TRANSFORMS[nextFrame];
  const interpTransform = interpolateTransform(
    pathTransformA,
    pathTransformB,
    progress
  );

  return (
    <div style={{ position: "relative", width: 260, height: 312 }}>
      <svg width={260} height={312} viewBox="0 0 260 312" fill="none">
        {rects.map((r, i) => (
          <rect key={i} {...r} />
        ))}
        {circles.map((c, i) => (
          <circle key={i} {...c} />
        ))}
        <g
          transform={`translate(${interpTransform.x},${interpTransform.y}) scale(${interpTransform.scale})`}
        >
          <path
            d={pathD}
            fill={pathFill}
            stroke={pathStroke}
            opacity={pathOpacity}
          />
        </g>
      </svg>
    </div>
  );
};

export default Step3KeyframeAnimation;
