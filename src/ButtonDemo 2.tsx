import React from "react";
import { ReactComponent as ChevronRightIcon } from "./icons/chevron-right.svg";
import { ReactComponent as CloseIcon } from "./icons/close.svg";
import { ReactComponent as DownloadIcon } from "./icons/download.svg";
import { ReactComponent as EyeIcon } from "./icons/eye.svg";
import "./styles/Button.css";

const buttonTypes = [
  { className: "btn", label: "Primary" },
  { className: "btn-secondary", label: "Secondary" },
  { className: "btn-destructive", label: "Destructive" },
  { className: "btn-tertiary", label: "Tertiary" },
  { className: "btn-fab", label: "FAB" },
];

const icons = [
  <ChevronRightIcon key="chevron" />,
  <CloseIcon key="close" />,
  <DownloadIcon key="download" />,
  <EyeIcon key="eye" />,
];

const ButtonDemo: React.FC = () => {
  return (
    <div
      style={{
        padding: 32,
        background: "#18191b",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <h1>Button Style Demo</h1>
      <p>All combinations of button types, icon-only, text+icon, and states.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {buttonTypes.map((type) => (
          <div key={type.className}>
            <h2>{type.label}</h2>
            <div
              style={{
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {/* Default */}
              <button className={type.className}>Default</button>
              {/* With Icon */}
              <button className={type.className}>
                <ChevronRightIcon />
                Text + Icon
              </button>
              {/* Icon Only */}
              <button
                className={`${type.className} btn-icon-only`}
                aria-label="Icon Only"
              >
                <ChevronRightIcon />
              </button>
              {/* Icon Only (other icons) */}
              {icons.map((icon, i) => (
                <button
                  key={i}
                  className={`${type.className} btn-icon-only`}
                  aria-label="Icon Only"
                >
                  {icon}
                </button>
              ))}
              {/* Disabled */}
              <button className={type.className + " disabled"} disabled>
                Disabled
              </button>
              {/* Disabled Icon Only */}
              <button
                className={`${type.className} btn-icon-only disabled`}
                disabled
                aria-label="Icon Only Disabled"
              >
                <ChevronRightIcon />
              </button>
              {/* Active */}
              <button className={type.className + " active"}>Active</button>
              {/* Active Icon Only */}
              <button
                className={`${type.className} btn-icon-only active`}
                aria-label="Icon Only Active"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ButtonDemo;
