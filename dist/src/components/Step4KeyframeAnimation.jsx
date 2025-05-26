"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
// Rectangle positions and groupings (5 groups, 6 per group)
const RECT_GROUPS = [
    // y = 231
    [
        { x: 23, y: 231, width: 29, height: 29, rx: 4 },
        { x: 60, y: 231, width: 29, height: 29, rx: 4 },
        { x: 97, y: 231, width: 29, height: 29, rx: 4 },
        { x: 134, y: 231, width: 29, height: 29, rx: 4 },
        { x: 171, y: 231, width: 29, height: 29, rx: 4 },
        { x: 208, y: 231, width: 29, height: 29, rx: 4 },
    ],
    // y = 186
    [
        { x: 23, y: 186, width: 29, height: 29, rx: 4 },
        { x: 60, y: 186, width: 29, height: 29, rx: 4 },
        { x: 97, y: 186, width: 29, height: 29, rx: 4 },
        { x: 134, y: 186, width: 29, height: 29, rx: 4 },
        { x: 171, y: 186, width: 29, height: 29, rx: 4 },
        { x: 208, y: 186, width: 29, height: 29, rx: 4 },
    ],
    // y = 141
    [
        { x: 23, y: 141, width: 29, height: 29, rx: 4 },
        { x: 60, y: 141, width: 29, height: 29, rx: 4 },
        { x: 97, y: 141, width: 29, height: 29, rx: 4 },
        { x: 134, y: 141, width: 29, height: 29, rx: 4 },
        { x: 171, y: 141, width: 29, height: 29, rx: 4 },
        { x: 208, y: 141, width: 29, height: 29, rx: 4 },
    ],
    // y = 96
    [
        { x: 23, y: 96, width: 29, height: 29, rx: 4 },
        { x: 60, y: 96, width: 29, height: 29, rx: 4 },
        { x: 97, y: 96, width: 29, height: 29, rx: 4 },
        { x: 134, y: 96, width: 29, height: 29, rx: 4 },
        { x: 171, y: 96, width: 29, height: 29, rx: 4 },
        { x: 208, y: 96, width: 29, height: 29, rx: 4 },
    ],
    // y = 51
    [
        { x: 23, y: 51, width: 29, height: 29, rx: 4 },
        { x: 60, y: 51, width: 29, height: 29, rx: 4 },
        { x: 97, y: 51, width: 29, height: 29, rx: 4 },
        { x: 134, y: 51, width: 29, height: 29, rx: 4 },
        { x: 171, y: 51, width: 29, height: 29, rx: 4 },
        { x: 208, y: 51, width: 29, height: 29, rx: 4 },
    ],
];
// Fill colors for each group (from step 4_2)
const FILLS = [
    ["white", "#FFB3B4", "#FC7E80", "#F0181C", "#CC0003", "black"],
    ["white", "#B3FFB3", "#7EFC7E", "#18F018", "#00CC00", "black"],
    ["white", "#C5C5C5", "#8D8D8D", "#6F6F6F", "#383838", "black"],
    ["white", "#FFB3FF", "#FC7EFC", "#F018F0", "#CC00CC", "black"],
    ["white", "#B3D9FF", "#7EBDFC", "#1884F0", "#0065CC", "black"],
];
// Reverse the groups for top-to-bottom animation
const REVERSED_RECT_GROUPS = [...RECT_GROUPS].reverse();
const REVERSED_FILLS = [...FILLS].reverse();
// Keyframes: each group transitions from dashed to filled, top to bottom
const KEYFRAMES = [
    // Frame 0: all dashed
    REVERSED_RECT_GROUPS.flat().map((rect) => ({
        ...rect,
        fill: "none",
        stroke: "#757575",
        strokeDasharray: "4 4",
        opacity: 1,
    })),
    // Frame 1: group 1 filled (top row)
    [
        ...REVERSED_RECT_GROUPS[0].map((rect, i) => ({
            ...rect,
            fill: REVERSED_FILLS[0][i],
            stroke: "none",
            opacity: 1, // stays visible after morph
        })),
        ...REVERSED_RECT_GROUPS.slice(1)
            .flat()
            .map((rect) => ({
            ...rect,
            fill: "none",
            stroke: "#757575",
            strokeDasharray: "4 4",
            opacity: 1,
        })),
    ],
    // Frame 2: group 1+2 filled
    [
        ...REVERSED_RECT_GROUPS.slice(0, 2).flatMap((group, gi) => group.map((rect, i) => ({
            ...rect,
            fill: REVERSED_FILLS[gi][i],
            stroke: "none",
            opacity: 1,
        }))),
        ...REVERSED_RECT_GROUPS.slice(2)
            .flat()
            .map((rect) => ({
            ...rect,
            fill: "none",
            stroke: "#757575",
            strokeDasharray: "4 4",
            opacity: 1,
        })),
    ],
    // Frame 3: group 1+2+3 filled
    [
        ...REVERSED_RECT_GROUPS.slice(0, 3).flatMap((group, gi) => group.map((rect, i) => ({
            ...rect,
            fill: REVERSED_FILLS[gi][i],
            stroke: "none",
            opacity: 1,
        }))),
        ...REVERSED_RECT_GROUPS.slice(3)
            .flat()
            .map((rect) => ({
            ...rect,
            fill: "none",
            stroke: "#757575",
            strokeDasharray: "4 4",
            opacity: 1,
        })),
    ],
    // Frame 4: group 1+2+3+4 filled
    [
        ...REVERSED_RECT_GROUPS.slice(0, 4).flatMap((group, gi) => group.map((rect, i) => ({
            ...rect,
            fill: REVERSED_FILLS[gi][i],
            stroke: "none",
            opacity: 1,
        }))),
        ...REVERSED_RECT_GROUPS[4].map((rect) => ({
            ...rect,
            fill: "none",
            stroke: "#757575",
            strokeDasharray: "4 4",
            opacity: 1,
        })),
    ],
    // Frame 5: all filled
    REVERSED_RECT_GROUPS.flatMap((group, gi) => group.map((rect, i) => ({
        ...rect,
        fill: REVERSED_FILLS[gi][i],
        stroke: "none",
        opacity: 1,
    }))),
];
// Use the same timing as step 3
const PAUSE_DURATIONS = [0, 0, 0, 0, 0, 3000];
const MORPH_DURATIONS = [800, 800, 800, 800, 800, 800];
const FRAME_COUNT = KEYFRAMES.length;
const TOTAL_DURATION = PAUSE_DURATIONS.reduce((a, b) => a + b, 0) +
    MORPH_DURATIONS.reduce((a, b) => a + b, 0);
function lerp(a, b, t) {
    return a + (b - a) * t;
}
function interpolateRect(a, b, t) {
    var _a, _b;
    // Dissolve in: interpolate opacity from 0 to 1 if going from dashed to filled
    let opacity = a.opacity;
    if (a.fill === "none" && b.fill !== "none") {
        opacity = lerp(0, 1, t); // fade in
    }
    else {
        opacity = lerp((_a = a.opacity) !== null && _a !== void 0 ? _a : 1, (_b = b.opacity) !== null && _b !== void 0 ? _b : 1, t);
    }
    return {
        ...a,
        fill: t < 1 ? a.fill : b.fill,
        stroke: t < 1 ? a.stroke : b.stroke,
        strokeDasharray: t < 1 ? a.strokeDasharray : b.strokeDasharray,
        opacity,
    };
}
const Step4KeyframeAnimation = () => {
    const [frame, setFrame] = (0, react_1.useState)(0);
    const [progress, setProgress] = (0, react_1.useState)(0); // 0..1 morph, 1 = pause
    const requestRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        let animating = true;
        let start;
        function animate(ts) {
            if (!animating)
                return;
            if (start === undefined)
                start = ts;
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
            setProgress(morphing ? morphProgress : 1);
            requestRef.current = requestAnimationFrame(animate);
        }
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            animating = false;
            if (requestRef.current)
                cancelAnimationFrame(requestRef.current);
        };
    }, []);
    const nextFrame = (frame + 1) % KEYFRAMES.length;
    const current = KEYFRAMES[frame];
    const next = KEYFRAMES[nextFrame];
    // For dissolve: render both dashed and filled rects for transitioning squares
    const rects = [];
    for (let i = 0; i < current.length; i++) {
        const a = current[i];
        const b = next[i];
        // If transitioning from dashed to filled
        if (a.fill === "none" && b.fill !== "none") {
            // Dashed rect (always visible until morph is complete)
            rects.push(<rect key={`dashed-${i}`} x={a.x} y={a.y} width={a.width} height={a.height} rx={a.rx} fill="none" stroke="#757575" strokeDasharray="4 4" opacity={1 - progress}/>);
            // Filled rect (fades in)
            rects.push(<rect key={`filled-${i}`} x={a.x} y={a.y} width={a.width} height={a.height} rx={a.rx} fill={b.fill} stroke="none" opacity={progress}/>);
        }
        else if (a.fill !== "none") {
            // Already filled, just show filled rect
            rects.push(<rect key={`filled-${i}`} x={a.x} y={a.y} width={a.width} height={a.height} rx={a.rx} fill={a.fill} stroke="none" opacity={1}/>);
        }
        else {
            // Still dashed
            rects.push(<rect key={`dashed-${i}`} x={a.x} y={a.y} width={a.width} height={a.height} rx={a.rx} fill="none" stroke="#757575" strokeDasharray="4 4" opacity={1}/>);
        }
    }
    return (<div style={{ position: "relative", width: 260, height: 312 }}>
      <svg width={260} height={312} viewBox="0 0 260 312" fill="none">
        {rects}
      </svg>
    </div>);
};
exports.default = Step4KeyframeAnimation;
