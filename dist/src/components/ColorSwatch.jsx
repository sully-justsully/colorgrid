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
require("../styles/ColorSwatch.css");
const ColorSwatch = (0, react_1.forwardRef)(({ swatch, isActive, onLValueChange, onClick, isKeyHexCode = false, removeButton, onSwatchKeyDown, }, ref) => {
    const [inputValue, setInputValue] = (0, react_1.useState)(swatch.lValue.toString());
    // Update local state when prop changes
    (0, react_1.useEffect)(() => {
        setInputValue(swatch.lValue.toString());
    }, [swatch.lValue]);
    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        if (newValue === "") {
            onLValueChange(swatch.id, 0);
        }
        else {
            const parsed = parseInt(newValue) || 0;
            onLValueChange(swatch.id, parsed);
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === "Escape") {
            e.currentTarget.blur();
            // Restore the actual value when blurring
            setInputValue(swatch.lValue.toString());
        }
        else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            const increment = e.shiftKey ? 10 : 1;
            const currentValue = swatch.lValue;
            const max = 100;
            const min = 0;
            let newValue = currentValue;
            if (e.key === "ArrowUp") {
                newValue = Math.min(max, currentValue + increment);
            }
            else {
                newValue = Math.max(min, currentValue - increment);
            }
            onLValueChange(swatch.id, newValue);
            setInputValue(newValue.toString());
        }
    };
    const handleBlur = () => {
        // Restore the actual value when blurring
        setInputValue(swatch.lValue.toString());
    };
    return (<div className="color-swatch-container" role="group" aria-label={`Color swatch ${swatch.hexColor}`}>
        <div className="lightness-controls">
          <div className="input-group">
            <div className="input-row">
              <div className="input-container" style={{ position: "relative" }}>
                <input type="number" min="0" max="100" value={inputValue} onChange={handleInputChange} onKeyDown={handleKeyDown} onBlur={handleBlur} disabled={isKeyHexCode} className="standard-input" style={{ opacity: isKeyHexCode ? 0.5 : 1 }} aria-label={`Lightness value for color ${swatch.hexColor}`}/>
                {isKeyHexCode && (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                opacity: 0.5,
            }} aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>)}
              </div>
              <div className={`color-swatch ${isActive ? "active" : ""}`} style={{ backgroundColor: swatch.hexColor }} onClick={() => onClick(swatch.id)} role="button" aria-label={`Color swatch ${swatch.hexColor}`} tabIndex={0} ref={ref} onKeyDown={(e) => {
            if (onSwatchKeyDown)
                onSwatchKeyDown(e);
            if (e.key === "Enter" || e.key === " ") {
                onClick(swatch.id);
            }
        }}>
                <div className="hex-label" aria-hidden="true">
                  {swatch.hexColor}
                </div>
                <div className="reference-dots" aria-hidden="true">
                  <div className="reference-dot white-dot">
                    {swatch.whiteContrast.toFixed(1)}:1
                  </div>
                  <div className="reference-dot black-dot">
                    {swatch.blackContrast.toFixed(1)}:1
                  </div>
                </div>
              </div>
              {removeButton}
            </div>
          </div>
        </div>
      </div>);
});
exports.default = ColorSwatch;
