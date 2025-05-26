"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const chevron_right_svg_1 = require("./icons/chevron-right.svg");
const close_svg_1 = require("./icons/close.svg");
const download_svg_1 = require("./icons/download.svg");
const eye_svg_1 = require("./icons/eye.svg");
require("./styles/Button.css");
const buttonTypes = [
    { className: "btn", label: "Primary" },
    { className: "btn-secondary", label: "Secondary" },
    { className: "btn-destructive", label: "Destructive" },
    { className: "btn-tertiary", label: "Tertiary" },
    { className: "btn-fab", label: "FAB" },
];
const icons = [
    <chevron_right_svg_1.ReactComponent key="chevron"/>,
    <close_svg_1.ReactComponent key="close"/>,
    <download_svg_1.ReactComponent key="download"/>,
    <eye_svg_1.ReactComponent key="eye"/>,
];
const ButtonDemo = () => {
    return (<div style={{
            padding: 32,
            background: "#18191b",
            minHeight: "100vh",
            color: "#fff",
        }}>
      <h1>Button Style Demo</h1>
      <p>All combinations of button types, icon-only, text+icon, and states.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {buttonTypes.map((type) => (<div key={type.className}>
            <h2>{type.label}</h2>
            <div style={{
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
                alignItems: "center",
            }}>
              {/* Default */}
              <button className={type.className}>Default</button>
              {/* With Icon */}
              <button className={type.className}>
                <chevron_right_svg_1.ReactComponent />
                Text + Icon
              </button>
              {/* Icon Only */}
              <button className={`${type.className} btn-icon-only`} aria-label="Icon Only">
                <chevron_right_svg_1.ReactComponent />
              </button>
              {/* Icon Only (other icons) */}
              {icons.map((icon, i) => (<button key={i} className={`${type.className} btn-icon-only`} aria-label="Icon Only">
                  {icon}
                </button>))}
              {/* Disabled */}
              <button className={type.className + " disabled"} disabled>
                Disabled
              </button>
              {/* Disabled Icon Only */}
              <button className={`${type.className} btn-icon-only disabled`} disabled aria-label="Icon Only Disabled">
                <chevron_right_svg_1.ReactComponent />
              </button>
              {/* Active */}
              <button className={type.className + " active"}>Active</button>
              {/* Active Icon Only */}
              <button className={`${type.className} btn-icon-only active`} aria-label="Icon Only Active">
                <chevron_right_svg_1.ReactComponent />
              </button>
            </div>
          </div>))}
      </div>
    </div>);
};
exports.default = ButtonDemo;
