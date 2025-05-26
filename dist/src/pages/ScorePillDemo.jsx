"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const ScorePill_1 = __importDefault(require("../components/ScorePill"));
const ScorePillDemo = () => {
    return (<div className="p-4">
      <h1 className="text-2xl font-bold mb-4">ScorePill Demo</h1>
      <div className="space-y-16">
        <div>
          <h2 className="text-xl font-semibold mb-2">Overall</h2>
          <br></br>
          <div className="flex space-x-16">
            <ScorePill_1.default score={90} type="positive" label="Overall:"/>
            <br></br>
            <ScorePill_1.default score={60} type="warning" label="Overall:"/>
            <br></br>
            <ScorePill_1.default score={30} type="negative" label="Overall:"/>
          </div>
        </div>
        <br></br>
        <div>
          <h2 className="text-xl font-semibold mb-2">Visual</h2>
          <br></br>
          <div className="flex space-x-16">
            <ScorePill_1.default score={90} type="positive" label="Visual:"/>
            <br></br>
            <ScorePill_1.default score={60} type="warning" label="Visual:"/>
            <br></br>
            <ScorePill_1.default score={30} type="negative" label="Visual:"/>
          </div>
        </div>
        <br></br>
        <div>
          <h2 className="text-xl font-semibold mb-2">Accessibility</h2>
          <br></br>
          <div className="flex space-x-16">
            <ScorePill_1.default score={90} type="positive" label="Accessibility:"/>
            <br></br>
            <ScorePill_1.default score={60} type="warning" label="Accessibility:"/>
            <br></br>
            <ScorePill_1.default score={30} type="negative" label="Accessibility:"/>
          </div>
        </div>
      </div>
    </div>);
};
exports.default = ScorePillDemo;
