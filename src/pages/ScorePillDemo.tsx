import React from "react";
import ScorePill from "../components/ScorePill";

const mockScores = {
  swatchCountScore: 0.8,
  evennessScore: 0.75,
  balanceScore: 0.9,
  symmetryScore: 0.85,
  wcagAScore: 0.7,
  wcagAAScore: 0.6,
  wcagAPassing: 70,
  wcagAAPassing: 60,
  totalCombos: 100,
  normalizedContrastScore: 0.65,
  visualQualityScore: 80,
  overallScore: 75,
};

const ScorePillDemo: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">ScorePill Demo</h1>
      <div className="space-y-16">
        <div>
          <h2 className="text-xl font-semibold mb-2">Overall</h2>
          <br></br>
          <div className="flex space-x-16">
            <ScorePill
              score={90}
              type="positive"
              label="Overall:"
              tooltipType="overall"
              scores={mockScores}
            />
            <br></br>
            <ScorePill
              score={60}
              type="warning"
              label="Overall:"
              tooltipType="overall"
              scores={mockScores}
            />
            <br></br>
            <ScorePill
              score={30}
              type="negative"
              label="Overall:"
              tooltipType="overall"
              scores={mockScores}
            />
          </div>
        </div>
        <br></br>
        <div>
          <h2 className="text-xl font-semibold mb-2">Visual</h2>
          <br></br>
          <div className="flex space-x-16">
            <ScorePill
              score={90}
              type="positive"
              label="Visual:"
              tooltipType="visual"
              scores={mockScores}
            />
            <br></br>
            <ScorePill
              score={60}
              type="warning"
              label="Visual:"
              tooltipType="visual"
              scores={mockScores}
            />
            <br></br>
            <ScorePill
              score={30}
              type="negative"
              label="Visual:"
              tooltipType="visual"
              scores={mockScores}
            />
          </div>
        </div>
        <br></br>
        <div>
          <h2 className="text-xl font-semibold mb-2">Accessibility</h2>
          <br></br>
          <div className="flex space-x-16">
            <ScorePill
              score={90}
              type="positive"
              label="Accessibility:"
              tooltipType="accessibility"
              scores={mockScores}
            />
            <br></br>
            <ScorePill
              score={60}
              type="warning"
              label="Accessibility:"
              tooltipType="accessibility"
              scores={mockScores}
            />
            <br></br>
            <ScorePill
              score={30}
              type="negative"
              label="Accessibility:"
              tooltipType="accessibility"
              scores={mockScores}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScorePillDemo;
