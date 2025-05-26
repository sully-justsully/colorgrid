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
const RECT1 = { x: 16, y: 64, width: 228, height: 232, rx: 4 };
const RECT2 = { x: 16, y: 16, width: 40, height: 40, rx: 4 };
const Step1HueRotateAnimation = () => {
    const [hue, setHue] = (0, react_1.useState)(0);
    const requestRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        let start;
        let running = true;
        function animate(ts) {
            if (!running)
                return;
            if (start === undefined)
                start = ts;
            const elapsed = (ts - start) % 10000;
            setHue((elapsed / 10000) * 360);
            requestRef.current = requestAnimationFrame(animate);
        }
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            running = false;
            if (requestRef.current)
                cancelAnimationFrame(requestRef.current);
        };
    }, []);
    // Inline the SVG except for the two animated rects
    return (<div style={{ width: 260, height: 312, position: "relative" }}>
      <svg width={260} height={312} viewBox="0 0 260 312" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Animated rectangles */}
        <rect x={RECT1.x} y={RECT1.y} width={RECT1.width} height={RECT1.height} rx={RECT1.rx} fill={`hsl(${hue}, 100%, 50%)`}/>
        <rect x={RECT2.x} y={RECT2.y} width={RECT2.width} height={RECT2.height} rx={RECT2.rx} fill={`hsl(${hue}, 100%, 50%)`}/>
        {/* Static SVG content (copied from step-1.svg, minus the two animated rects) */}
        <g style={{ mixBlendMode: "lighten" }}>
          <rect x="16" y="64" width="228" height="232" rx="4" fill="url(#paint0_linear_503_5829)"/>
        </g>
        <g style={{ mixBlendMode: "multiply" }}>
          <rect x="17" y="65" width="226" height="230" rx="4" fill="url(#paint1_linear_503_5829)"/>
        </g>
        <rect x="64" y="16" width="180" height="40" rx="4" fill="#3B3B3B"/>
        <defs>
          <linearGradient id="paint0_linear_503_5829" x1="244" y1="180" x2="16" y2="180" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="0"/>
            <stop offset="1" stopColor="white"/>
          </linearGradient>
          <linearGradient id="paint1_linear_503_5829" x1="130" y1="65" x2="130" y2="295" gradientUnits="userSpaceOnUse">
            <stop stopColor="white"/>
            <stop offset="1"/>
          </linearGradient>
        </defs>
      </svg>
    </div>);
};
exports.default = Step1HueRotateAnimation;
