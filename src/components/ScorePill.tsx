import React, { useState, useRef, useEffect } from "react";
import "../styles/ScorePill.css";
import { ReactComponent as PositiveIcon } from "../icons/positive.svg";
import { ReactComponent as WarningIcon } from "../icons/warning.svg";
import { ReactComponent as NegativeIcon } from "../icons/negative.svg";
import { ReactComponent as EmptyIcon } from "../icons/empty.svg";
import ScorePillTooltip from "./ScorePillTooltip";

export type ScorePillVariant = "positive" | "warning" | "negative" | "empty";

interface ScorePillProps {
  score: number;
  type?: ScorePillVariant;
  label: string;
  tooltipType?: "overall" | "visual" | "accessibility";
  scores?: {
    swatchCountScore: number;
    evennessScore: number;
    balanceScore: number;
    symmetryScore: number;
    wcagAScore: number;
    wcagAAScore: number;
    normalizedContrastScore: number;
    visualQualityScore: number;
    overallScore: number;
  };
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

const ScorePill: React.FC<ScorePillProps> = ({
  score,
  type,
  label,
  tooltipType,
  scores,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const pillRef = useRef<HTMLDivElement>(null);

  const v = type || getVariant(score);

  const handleMouseEnter = () => {
    if (!tooltipType || !scores) return;

    if (pillRef.current) {
      const rect = pillRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      });
    }
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div
      className={`score-card score-card--${v}`}
      ref={pillRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="score-card__icon-wrapper">{iconMap[v]}</div>
      <div className="score-card__content">
        <div className="score-card__label">{label}</div>
        <div className="score-card__score">
          {v === "empty" ? "-" : score.toFixed(1)}
        </div>
      </div>
      {showTooltip && tooltipType && (
        <div
          style={{
            position: "absolute",
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
        >
          <ScorePillTooltip type={tooltipType} scores={scores} />
        </div>
      )}
    </div>
  );
};

export default ScorePill;
