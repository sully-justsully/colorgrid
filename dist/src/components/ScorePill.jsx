"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
require("../styles/ScorePill.css");
const positive_svg_1 = require("../icons/positive.svg");
const warning_svg_1 = require("../icons/warning.svg");
const negative_svg_1 = require("../icons/negative.svg");
const empty_svg_1 = require("../icons/empty.svg");
function getVariant(score) {
    if (isNaN(score) || score === undefined)
        return "empty";
    if (score >= 80)
        return "positive";
    if (score >= 50)
        return "warning";
    return "negative";
}
const iconMap = {
    positive: <positive_svg_1.ReactComponent className="score-card__icon"/>,
    warning: <warning_svg_1.ReactComponent className="score-card__icon"/>,
    negative: <negative_svg_1.ReactComponent className="score-card__icon"/>,
    empty: <empty_svg_1.ReactComponent className="score-card__icon"/>,
};
const ScorePill = ({ score, type, label }) => {
    const v = type || getVariant(score);
    return (<div className={`score-card score-card--${v}`}>
      <div className="score-card__icon-wrapper">{iconMap[v]}</div>
      <div className="score-card__content">
        <div className="score-card__label">{label}</div>
        <div className="score-card__score">
          {v === "empty" ? "-" : score.toFixed(1)}
        </div>
      </div>
    </div>);
};
exports.default = ScorePill;
