import React from "react";
import "../styles/ScorePillTooltip.css";

interface ScorePillTooltipProps {
  type: "overall" | "visual" | "accessibility" | "colorRange" | "colorBalance";
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
    empiricalBestACombos: number;
    empiricalBestAACombos: number;
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

        // Check if both visual quality and accessibility are good
        const isVisualQualityGood = scores.visualQualityScore >= 85;
        const isAccessibilityGood = scores.normalizedContrastScore >= 0.85;

        if (isVisualQualityGood && isAccessibilityGood) {
          return (
            <div className="tooltip-content">
              <div className="tooltip-suggestion">
                Your color palette is set up for success! <br></br>It has
                excellent visual quality and accessibility.
              </div>
            </div>
          );
        }

        // More nuanced suggestions based on scores
        if (scores.swatchCountScore < 0.8) {
          if (scores.swatchCountScore < 0.5) {
            suggestions.push(
              "Your palette needs significantly more colors - aim for 16-20 colors for optimal results"
            );
          } else {
            suggestions.push(
              "Consider adding a few more colors to your palette (16-20 colors is ideal)"
            );
          }
        }

        if (scores.evennessScore < 0.8) {
          if (scores.evennessScore < 0.5) {
            suggestions.push(
              "The spacing between your color steps is quite uneven - try to create more consistent transitions"
            );
          } else {
            suggestions.push(
              "Some color steps could be more evenly spaced for smoother transitions"
            );
          }
        }

        if (scores.balanceScore < 0.8) {
          if (scores.balanceScore < 0.5) {
            suggestions.push(
              "Your palette is heavily weighted to one side - try to balance light and dark colors around the middle"
            );
          } else {
            suggestions.push(
              "Consider adjusting the balance of light and dark colors around the middle"
            );
          }
        }

        if (scores.symmetryScore < 0.8) {
          if (scores.symmetryScore < 0.5) {
            suggestions.push(
              "Your color steps lack symmetry - try to create more balanced pairs around the middle"
            );
          } else {
            suggestions.push(
              "Some color steps could be better paired for symmetry around the middle"
            );
          }
        }

        if (scores.normalizedContrastScore < 0.85) {
          if (scores.normalizedContrastScore < 0.5) {
            suggestions.push(
              "The contrast between colors needs significant improvement for better accessibility"
            );
          } else {
            suggestions.push(
              "Consider increasing contrast between some colors for better accessibility"
            );
          }
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
                Your color ramp is looking good! Keep up the great work.
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
              <span>Light v Dark:</span>
              <span>{Math.round(scores.balanceScore * 100)}/100</span>
            </div>
            <div className="tooltip-score-item">
              <span>Pairings:</span>
              <span>{Math.round(scores.symmetryScore * 100)}/100</span>
            </div>
          </div>
        );
      case "accessibility":
        return (
          <div className="tooltip-content">
            <div className="tooltip-score-item">
              <span>3:1 Combos:</span>
              <span>
                {scores.wcagAPassing} of {scores.empiricalBestACombos}
              </span>
            </div>
            <div className="tooltip-score-item">
              <span>4.5:1 Combos:</span>
              <span>
                {scores.wcagAAPassing} of {scores.empiricalBestAACombos}
              </span>
            </div>
          </div>
        );
      case "colorRange":
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
          </div>
        );
      case "colorBalance":
        return (
          <div className="tooltip-content">
            <div className="tooltip-score-item">
              <span>Balance:</span>
              <span>{Math.round(scores.balanceScore * 100)}/100</span>
            </div>
            <div className="tooltip-score-item">
              <span>Pairings:</span>
              <span>{Math.round(scores.symmetryScore * 100)}/100</span>
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
