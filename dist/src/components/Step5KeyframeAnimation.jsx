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
// Background shapes (from SVG, always visible)
const BACK_SHAPES = [
    {
        type: "path",
        d: "M15 80C15 77.7909 16.7909 76 19 76H241C243.209 76 245 77.7909 245 80V91H15V80Z",
        fill: "#313131",
    },
    {
        type: "path",
        d: "M15 76H245H15ZM245 91.5H15V90.5H245V91.5ZM15 91V76V91ZM245 76V91V76Z",
        fill: "#616161",
    },
    {
        type: "rect",
        x: 15,
        y: 91,
        width: 230,
        height: 145,
        rx: 4,
        fill: "#1D1E20",
    },
    {
        type: "path",
        d: "M15 91H54V236H19C16.7909 236 15 234.209 15 232V91Z",
        fill: "#313131",
    },
    {
        type: "path",
        d: "M15 91H54H15ZM54 236H15H54ZM15 236V91V236ZM54.5 91V236H53.5V91H54.5Z",
        fill: "#616161",
    },
    {
        type: "path",
        d: "M206 91H245V232C245 234.209 243.209 236 241 236H206V91Z",
        fill: "#313131",
    },
    {
        type: "path",
        d: "M206 91H245H206ZM245 236H206H245ZM205.5 236V91H206.5V236H205.5ZM245 91V236V91Z",
        fill: "#616161",
    },
    { type: "circle", cx: 22.5, cy: 83.5, r: 2.5, fill: "#FF0000" },
    { type: "circle", cx: 29.5, cy: 83.5, r: 2.5, fill: "#CCCCCC" },
    { type: "circle", cx: 36.5, cy: 83.5, r: 2.5, fill: "#00FF00" },
];
// 5 groups of 6 rects each, left to right (updated positions/sizes)
const GROUPS = [
    [
        { x: 66.9727, y: 107.515, width: 13.3333, height: 29.0909, fill: "white" },
        {
            x: 66.9727,
            y: 126.909,
            width: 13.3333,
            height: 29.0909,
            fill: "#FFB3B4",
        },
        {
            x: 66.9727,
            y: 146.303,
            width: 13.3333,
            height: 29.0909,
            fill: "#FC7E80",
        },
        {
            x: 66.9727,
            y: 165.697,
            width: 13.3333,
            height: 29.0909,
            fill: "#F0181C",
        },
        {
            x: 66.9727,
            y: 185.091,
            width: 13.3333,
            height: 29.0909,
            fill: "#CC0003",
        },
        { x: 66.9727, y: 204.485, width: 13.3333, height: 29.0909, fill: "black" },
    ],
    [
        { x: 105.758, y: 107.515, width: 13.3333, height: 29.0909, fill: "white" },
        {
            x: 105.758,
            y: 126.909,
            width: 13.3333,
            height: 29.0909,
            fill: "#B3FFB3",
        },
        {
            x: 105.758,
            y: 146.303,
            width: 13.3333,
            height: 29.0909,
            fill: "#7EFC7E",
        },
        {
            x: 105.758,
            y: 165.697,
            width: 13.3333,
            height: 29.0909,
            fill: "#18F018",
        },
        {
            x: 105.758,
            y: 185.091,
            width: 13.3333,
            height: 29.0909,
            fill: "#00CC00",
        },
        { x: 105.758, y: 204.485, width: 13.3333, height: 29.0909, fill: "black" },
    ],
    [
        { x: 144.547, y: 107.515, width: 13.3333, height: 29.0909, fill: "white" },
        {
            x: 144.547,
            y: 126.909,
            width: 13.3333,
            height: 29.0909,
            fill: "#C5C5C5",
        },
        {
            x: 144.547,
            y: 146.303,
            width: 13.3333,
            height: 29.0909,
            fill: "#8D8D8D",
        },
        {
            x: 144.547,
            y: 165.697,
            width: 13.3333,
            height: 29.0909,
            fill: "#6F6F6F",
        },
        {
            x: 144.547,
            y: 185.091,
            width: 13.3333,
            height: 29.0909,
            fill: "#383838",
        },
        { x: 144.547, y: 204.485, width: 13.3333, height: 29.0909, fill: "black" },
    ],
    [
        { x: 183.336, y: 107.515, width: 13.3333, height: 29.0909, fill: "white" },
        {
            x: 183.336,
            y: 126.909,
            width: 13.3333,
            height: 29.0909,
            fill: "#FFB3FF",
        },
        {
            x: 183.336,
            y: 146.303,
            width: 13.3333,
            height: 29.0909,
            fill: "#FC7EFC",
        },
        {
            x: 183.336,
            y: 165.697,
            width: 13.3333,
            height: 29.0909,
            fill: "#F018F0",
        },
        {
            x: 183.336,
            y: 185.091,
            width: 13.3333,
            height: 29.0909,
            fill: "#CC00CC",
        },
        { x: 183.336, y: 204.485, width: 13.3333, height: 29.0909, fill: "black" },
    ],
    [
        { x: 222.121, y: 107.515, width: 13.3333, height: 29.0909, fill: "white" },
        {
            x: 222.121,
            y: 126.909,
            width: 13.3333,
            height: 29.0909,
            fill: "#B3D9FF",
        },
        {
            x: 222.121,
            y: 146.303,
            width: 13.3333,
            height: 29.0909,
            fill: "#7EBDFC",
        },
        {
            x: 222.121,
            y: 165.697,
            width: 13.3333,
            height: 29.0909,
            fill: "#1884F0",
        },
        {
            x: 222.121,
            y: 185.091,
            width: 13.3333,
            height: 29.0909,
            fill: "#0065CC",
        },
        { x: 222.121, y: 204.485, width: 13.3333, height: 29.0909, fill: "black" },
    ],
];
const PAUSE_DURATIONS = [0, 0, 0, 0, 0, 2000];
const MORPH_DURATIONS = [1200, 1200, 1200, 1200, 1200, 1200];
const FRAME_COUNT = GROUPS.length + 1;
const TOTAL_DURATION = PAUSE_DURATIONS.reduce((a, b) => a + b, 0) +
    MORPH_DURATIONS.reduce((a, b) => a + b, 0);
const Step5KeyframeAnimation = () => {
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
    // Render background shapes
    const background = BACK_SHAPES.map((shape, i) => {
        if (shape.type === "rect") {
            return (<rect key={i} x={shape.x} y={shape.y} width={shape.width} height={shape.height} fill={shape.fill}/>);
        }
        else if (shape.type === "path") {
            return <path key={i} d={shape.d} fill={shape.fill}/>;
        }
        else if (shape.type === "circle") {
            return (<circle key={i} cx={shape.cx} cy={shape.cy} r={shape.r} fill={shape.fill}/>);
        }
        return null;
    });
    // For each group, fade in from left to right
    const groupRects = [];
    for (let g = 0; g < GROUPS.length; g++) {
        const fade = frame > g ? 1 : frame === g ? progress : 0;
        for (let r = 0; r < GROUPS[g].length; r++) {
            const rect = GROUPS[g][r];
            groupRects.push(<rect key={`g${g}r${r}`} x={rect.x} y={rect.y} width={rect.width} height={rect.height} transform={`rotate(90 ${rect.x} ${rect.y})`} fill={rect.fill} opacity={fade}/>);
        }
    }
    return (<div style={{ position: "relative", width: 260, height: 312 }}>
      <svg width={260} height={312} viewBox="0 0 260 312" fill="none">
        {background}
        {groupRects}
      </svg>
    </div>);
};
exports.default = Step5KeyframeAnimation;
