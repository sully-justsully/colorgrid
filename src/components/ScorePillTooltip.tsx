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
    wcagAPassing: number;
    wcagAAPassing: number;
    totalCombos: number;
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
        const suggestions = [];
        if (scores.swatchCountScore < 0.8) {
          suggestions.push(
            "Add more colors to your palette (aim for 16-20 colors)"
          );
        }
        if (scores.evennessScore < 0.8) {
          suggestions.push("Ensure even spacing between color steps");
        }
        if (scores.balanceScore < 0.8) {
          suggestions.push("Balance light and dark colors around the middle");
        }
        if (scores.symmetryScore < 0.8) {
          suggestions.push(
            "Create symmetric pairs of colors around the middle"
          );
        }
        if (scores.wcagAScore < 0.8) {
          suggestions.push(
            "Increase contrast between colors for better accessibility"
          );
        }

        return (
          <div className="tooltip-content">
            {suggestions.length > 0 ? (
              <div>
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="tooltip-suggestion">
                    {suggestion}
                  </div>
                ))}
              </div>
            ) : (
              <div className="tooltip-suggestion">
                Great job! Your palette meets all the key criteria.
              </div>
            )}
          </div>
        );
      case "visual":
        return (
          <div className="tooltip-content">
            <div className="tooltip-score-item">
              <span>Swatch Amount:</span>
              <span>{Math.round(scores.swatchCountScore * 100)}/100</span>
            </div>
            <div className="tooltip-score-item">
              <span>Smoothness:</span>
              <span>{Math.round(scores.evennessScore * 100)}/100</span>
            </div>
            <div className="tooltip-score-item">
              <span>Balance:</span>
              <span>{Math.round(scores.balanceScore * 100)}/100</span>
            </div>
            <div className="tooltip-score-item">
              <span>Symmetry:</span>
              <span>{Math.round(scores.symmetryScore * 100)}/100</span>
            </div>
          </div>
        );
      case "accessibility":
        return (
          <div className="tooltip-content">
            <div className="tooltip-score-item">
              <span>WCAG A Combos:</span>
              <span>
                {scores.wcagAPassing} of {scores.totalCombos}
              </span>
            </div>
            <div className="tooltip-score-item">
              <span>WCAG AA Combos:</span>
              <span>
                {scores.wcagAAPassing} of {scores.totalCombos}
              </span>
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
