import React from "react";
import "../styles/ScorePillTooltip.css";

interface ScorePillTooltipProps {
  type: "overall" | "visual" | "accessibility";
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

const ScorePillTooltip: React.FC<ScorePillTooltipProps> = ({
  type,
  scores,
}) => {
  if (!scores) return null;

  const renderContent = () => {
    switch (type) {
      case "overall":
        return (
          <div className="tooltip-content">
            <p>To improve your overall score:</p>
            <ul>
              <li>Add more colors to your palette (aim for 16-20 colors)</li>
              <li>Ensure even spacing between color steps</li>
              <li>Balance light and dark colors around the middle</li>
              <li>Create symmetric pairs of colors around the middle</li>
              <li>Increase contrast between colors for better accessibility</li>
            </ul>
          </div>
        );
      case "visual":
        return (
          <div className="tooltip-content">
            <div className="tooltip-score-item">
              <span>Swatch Count:</span>
              <span>{(scores.swatchCountScore * 100).toFixed(1)}/100</span>
            </div>
            <div className="tooltip-score-item">
              <span>Evenness of Steps:</span>
              <span>{(scores.evennessScore * 100).toFixed(1)}/100</span>
            </div>
            <div className="tooltip-score-item">
              <span>Balance of Light & Dark:</span>
              <span>{(scores.balanceScore * 100).toFixed(1)}/100</span>
            </div>
            <div className="tooltip-score-item">
              <span>Symmetry of Ramps:</span>
              <span>{(scores.symmetryScore * 100).toFixed(1)}/100</span>
            </div>
          </div>
        );
      case "accessibility":
        return (
          <div className="tooltip-content">
            <div className="tooltip-score-item">
              <span>WCAG A Combos:</span>
              <span>{(scores.wcagAScore * 100).toFixed(1)}%</span>
            </div>
            <div className="tooltip-score-item">
              <span>WCAG AA Combos:</span>
              <span>{(scores.wcagAAScore * 100).toFixed(1)}%</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return <div className="score-pill-tooltip">{renderContent()}</div>;
};

export default ScorePillTooltip;
