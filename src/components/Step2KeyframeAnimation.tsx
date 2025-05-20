import React, { useEffect, useRef, useState } from "react";

// Extracted from step-2a to step-2e SVGs (excluding the static central blue dot)
const CIRCLE_FRAMES = [
  // step-2a
  [],
  // step-2b
  [
    { cx: 130, cy: 244, r: 20, fill: "#00264D" },
    { cx: 130, cy: 68, r: 20, fill: "white" },
  ],
  // step-2c
  [
    { cx: 130, cy: 244, r: 20, fill: "#00264D" },
    { cx: 130, cy: 68, r: 20, fill: "white" },
    { cx: 206.211, cy: 200, r: 20, fill: "#1884F0" },
    { cx: 53.7891, cy: 112, r: 20, fill: "#B3D9FF" },
    { cx: 53.7891, cy: 200, r: 20, fill: "#1884F0" },
    { cx: 206.207, cy: 112, r: 20, fill: "#B3D9FF" },
  ],
  // step-2d
  [
    { cx: 130, cy: 244, r: 20, fill: "#00264D" },
    { cx: 130, cy: 68, r: 20, fill: "white" },
    { cx: 174, cy: 232.21, r: 20, fill: "#0252A3" },
    { cx: 86, cy: 79.7898, r: 20, fill: "#E6F2FF" },
    { cx: 206.211, cy: 200, r: 20, fill: "#1884F0" },
    { cx: 53.7891, cy: 112, r: 20, fill: "#B3D9FF" },
    { cx: 218, cy: 156, r: 20, fill: "#7EBDFC" },
    { cx: 42, cy: 156, r: 20, fill: "#7EBDFC" },
    { cx: 53.7891, cy: 200, r: 20, fill: "#1884F0" },
    { cx: 206.207, cy: 112, r: 20, fill: "#B3D9FF" },
    { cx: 86, cy: 232.211, r: 20, fill: "#0252A3" },
    { cx: 174, cy: 79.7905, r: 20, fill: "#E6F2FF" },
  ],
  // step-2e
  [
    {
      cx: 130.494,
      cy: 156.495,
      r: 20,
      fill: "#00264D",
      transform: "rotate(15 130.494 156.495)",
    },
    {
      cx: 130.494,
      cy: 156.495,
      r: 20,
      fill: "white",
      transform: "rotate(15 130.494 156.495)",
    },
    {
      cx: 130.494,
      cy: 156.495,
      r: 20,
      fill: "#0252A3",
      transform: "rotate(15 130.494 156.495)",
    },
    {
      cx: 130.494,
      cy: 156.495,
      r: 20,
      fill: "#E6F2FF",
      transform: "rotate(15 130.494 156.495)",
    },
    {
      cx: 130.494,
      cy: 156.495,
      r: 20,
      fill: "#1884F0",
      transform: "rotate(15 130.494 156.495)",
    },
    {
      cx: 130.494,
      cy: 156.495,
      r: 20,
      fill: "#B3D9FF",
      transform: "rotate(15 130.494 156.495)",
    },
    {
      cx: 130.494,
      cy: 156.495,
      r: 20,
      fill: "#7EBDFC",
      transform: "rotate(15 130.494 156.495)",
    },
    {
      cx: 130.494,
      cy: 156.495,
      r: 20,
      fill: "#7EBDFC",
      transform: "rotate(15 130.494 156.495)",
    },
    {
      cx: 130.494,
      cy: 156.495,
      r: 20,
      fill: "#1884F0",
      transform: "rotate(15 130.494 156.495)",
    },
    {
      cx: 130.494,
      cy: 156.495,
      r: 20,
      fill: "#B3D9FF",
      transform: "rotate(15 130.494 156.495)",
    },
    {
      cx: 130.494,
      cy: 156.495,
      r: 20,
      fill: "#0252A3",
      transform: "rotate(15 130.494 156.495)",
    },
    {
      cx: 130.494,
      cy: 156.495,
      r: 20,
      fill: "#E6F2FF",
      transform: "rotate(15 130.494 156.495)",
    },
  ],
];

const PAUSE_DURATIONS = [640, 640, 1200, 0, 640];
const MORPH_DURATIONS = [800, 800, 800, 1200, 0]; // Morph duration for each transition (frame i to i+1)
const FRAME_COUNT = CIRCLE_FRAMES.length;
const TOTAL_DURATION =
  PAUSE_DURATIONS.reduce((a, b) => a + b, 0) +
  MORPH_DURATIONS.reduce((a, b) => a + b, 0);

function cubicBezierEase(t: number) {
  // cubic-bezier(0.22, 1, 0.36, 1)
  // Use a simple implementation for this specific curve
  // You can use a library like bezier-easing for more accuracy
  // For now, use a hand-coded version for this curve
  // https://easings.net/#easeOutCubic is similar
  // But let's use a custom cubic-bezier implementation
  // This is a quick approximation for the requested curve
  // For production, use 'bezier-easing' npm package
  const c1x = 0.22,
    c1y = 1,
    c2x = 0.36,
    c2y = 1;
  // De Casteljau's algorithm for cubic bezier
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
  // We want to map t (time) to y (progress), so we need to solve for x=t, then get y
  // For this, iterate to find the bezier t for a given x
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
  // Greedy matching by color and proximity (higher weight on position)
  const used = new Set<number>();
  return frameB.map((b) => {
    let bestIdx = -1;
    let bestScore = Infinity;
    for (let i = 0; i < frameA.length; i++) {
      if (used.has(i)) continue;
      const a = frameA[i];
      const colorScore = colorDistance(a.fill, b.fill);
      const posScore = Math.hypot(a.cx - b.cx, a.cy - b.cy);
      const score = colorScore * 1 + posScore * 4; // Increase position weight
      if (score < bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }
    if (bestIdx !== -1) {
      used.add(bestIdx);
      return { a: frameA[bestIdx], b };
    } else {
      // No match, fade in from center
      return {
        a: { cx: 130, cy: 156, r: 0, fill: b.fill, transform: b.transform },
        b,
      };
    }
  });
}

const Step2KeyframeAnimation: React.FC = () => {
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

  // Morph circles using smart matching
  const nextFrame = (frame + 1) % FRAME_COUNT;
  const pairs = matchCircles(CIRCLE_FRAMES[frame], CIRCLE_FRAMES[nextFrame]);

  return (
    <div
      className="step2-keyframe-anim-root"
      style={{ position: "relative", width: 260, height: 312 }}
    >
      <svg width={260} height={312} viewBox="0 0 260 312" fill="none">
        {/* Morphing animated circles */}
        {pairs.map(
          (
            {
              a,
              b,
            }: {
              a: {
                cx: number;
                cy: number;
                r?: number;
                fill: string;
                transform?: string;
              };
              b: {
                cx: number;
                cy: number;
                r?: number;
                fill: string;
                transform?: string;
              };
            },
            i: number
          ) => {
            const cx = lerp(a.cx, b.cx, progress);
            const cy = lerp(a.cy, b.cy, progress);
            const r = lerp(a.r ?? 20, b.r ?? 20, progress);
            const fill = interpolateColor(a.fill, b.fill, progress);
            const opacity = lerp(
              a.r && a.r > 0 ? 1 : 0,
              b.r && b.r > 0 ? 1 : 0,
              progress
            );
            const transform =
              progress < 1 ? a.transform || "" : b.transform || "";
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill={fill}
                opacity={opacity}
                transform={transform}
                style={{ transition: "none" }}
              />
            );
          }
        )}
        {/* Static central blue dot on top */}
        <circle cx={130} cy={156} r={64} fill="#0B76E0" />
      </svg>
    </div>
  );
};

export default Step2KeyframeAnimation;
