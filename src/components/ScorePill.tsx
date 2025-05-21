import React from "react";
import "../styles/ScorePill.css";
import { ReactComponent as PositiveIcon } from "../icons/positive.svg";
import { ReactComponent as WarningIcon } from "../icons/warning.svg";
import { ReactComponent as NegativeIcon } from "../icons/negative.svg";
import { ReactComponent as EmptyIcon } from "../icons/empty.svg";

export type ScorePillVariant = "positive" | "warning" | "negative" | "empty";

interface ScorePillProps {
  score: number;
  type?: ScorePillVariant;
  label: string;
}

function getVariant(score: number): ScorePillVariant {
  if (isNaN(score) || score === undefined) return "empty";
  if (score >= 80) return "positive";
  if (score >= 50) return "warning";
  return "negative";
}

const iconMap = {
  positive: <PositiveIcon className="score-card__icon" />,
  warning: <WarningIcon className="score-card__icon" />,
  negative: <NegativeIcon className="score-card__icon" />,
  empty: <EmptyIcon className="score-card__icon" />,
};

const ScorePill: React.FC<ScorePillProps> = ({ score, type, label }) => {
  const v = type || getVariant(score);
  return (
    <div className={`score-card score-card--${v}`}>
      <div className="score-card__icon-wrapper">{iconMap[v]}</div>
      <div className="score-card__content">
        <div className="score-card__label">{label}</div>
        <div className="score-card__score">
          {v === "empty" ? "-" : score.toFixed(1)}
        </div>
      </div>
    </div>
  );
};

export default ScorePill;
