import React from "react";
import ScorePill from "../components/ScorePill";

const ScorePillDemo: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">ScorePill Demo</h1>
      <div className="space-y-16">
        <div>
          <h2 className="text-xl font-semibold mb-2">Overall</h2>
          <br></br>
          <div className="flex space-x-16">
            <ScorePill score={90} type="positive" label="Overall:" />
            <br></br>
            <ScorePill score={60} type="warning" label="Overall:" />
            <br></br>
            <ScorePill score={30} type="negative" label="Overall:" />
          </div>
        </div>
        <br></br>
        <div>
          <h2 className="text-xl font-semibold mb-2">Visual</h2>
          <br></br>
          <div className="flex space-x-16">
            <ScorePill score={90} type="positive" label="Visual:" />
            <br></br>
            <ScorePill score={60} type="warning" label="Visual:" />
            <br></br>
            <ScorePill score={30} type="negative" label="Visual:" />
          </div>
        </div>
        <br></br>
        <div>
          <h2 className="text-xl font-semibold mb-2">Accessibility</h2>
          <br></br>
          <div className="flex space-x-16">
            <ScorePill score={90} type="positive" label="Accessibility:" />
            <br></br>
            <ScorePill score={60} type="warning" label="Accessibility:" />
            <br></br>
            <ScorePill score={30} type="negative" label="Accessibility:" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScorePillDemo;
