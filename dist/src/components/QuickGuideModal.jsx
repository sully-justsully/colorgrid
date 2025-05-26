"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const chevron_right_svg_1 = require("../icons/chevron-right.svg");
const chevron_left_svg_1 = require("../icons/chevron-left.svg");
const Step1HueRotateAnimation_1 = __importDefault(require("./Step1HueRotateAnimation"));
const Step2KeyframeAnimation_1 = __importDefault(require("./Step2KeyframeAnimation"));
const Step3KeyframeAnimation_1 = __importDefault(require("./Step3KeyframeAnimation"));
const Step4KeyframeAnimation_1 = __importDefault(require("./Step4KeyframeAnimation"));
const Step5KeyframeAnimation_1 = __importDefault(require("./Step5KeyframeAnimation"));
const AreYouSureModal_1 = __importDefault(require("./AreYouSureModal"));
require("../styles/QuickGuideModal.css");
const QuickGuideModal = ({ onClose }) => {
    const [currentPage, setCurrentPage] = (0, react_1.useState)(0);
    const totalPages = 5;
    (0, react_1.useEffect)(() => {
        document.body.classList.add("modal-open");
        return () => {
            document.body.classList.remove("modal-open");
        };
    }, []);
    const handleNext = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
        else {
            onClose();
        }
    };
    const handlePrevious = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };
    const renderPage = () => {
        switch (currentPage) {
            case 0:
                return (<div className="guide-page">
            <div className="guide-content">
              <h2 className="heading-lg">Pick a Hue or Key Hex Code</h2>
              <p>
                Creating a color palette for your new brand? Put in the hex code
                and its corresponding dot will always appear on the color grid
                as a reference point.
              </p>
              <p>
                Maybe you just need a new neutral, success, or error family?
                Pick a hue and jump right in!
              </p>
            </div>
            <div className="guide-image">
              <Step1HueRotateAnimation_1.default />
            </div>
          </div>);
            case 1:
                return (<div className="guide-page">
            <div className="guide-content">
              <h2 className="heading-lg">How Many Swatches?</h2>
              <p>
                Now that you have the hue it's time to pick how many swatches
                you need for your color palette.
              </p>
              <p>
                <strong>Simple: </strong>
                Keep things easy with 12 swatches per family.
              </p>
              <p>
                <strong>Advanced: </strong>
                Make things robust with 18 swatches per family.
              </p>
              <p>
                <strong>Custom: </strong>
                It's all up to you!
              </p>
            </div>
            <div className="guide-image">
              <Step2KeyframeAnimation_1.default />
            </div>
          </div>);
            case 2:
                return (<div className="guide-page">
            <div className="guide-content">
              <h2 className="heading-lg">Using Color Picking Mode</h2>
              <p>
                Click on any swatch in the left drawer to begin create your
                color palette.
              </p>
              <p>
                <strong>Hint:</strong> If you want help creating a cohesive
                family, pick one of the guide lines and select whichever dots
                intersect with the line.
              </p>
              <p>
                When you're done, click on 'View Contrast Grid' to see which
                color combinations are accessible.
              </p>
            </div>
            <div className="guide-image">
              <Step3KeyframeAnimation_1.default />
            </div>
          </div>);
            case 3:
                return (<div className="guide-page">
            <div className="guide-content">
              <h2 className="heading-lg">Saving to Color System</h2>
              <p>
                Click on 'Save to Color System' to save your color swatches as
                semantic color families which you can import into your Figma
                files.
              </p>
              <p>
                You can save up 8 color families at a time and always come back
                and replace families if you need.
              </p>
            </div>
            <div className="guide-image">
              <Step4KeyframeAnimation_1.default />
            </div>
          </div>);
            case 4:
                return (<div className="guide-page">
            <div className="guide-content">
              <h2 className="heading-lg">Finishing Up</h2>
              <p>
                When you're all done, click on 'Download System' and you'll get
                a Figma-ready SVG file.
              </p>
              <p>
                You can import the SVG into{" "}
                <a href="https://www.figma.com/community/file/1428517491497047139/design-system-variables-midnight-v-2-0" target="_blank" rel="noopener noreferrer">
                  Design System Variables — Midnight v2.0
                </a>{" "}
                to use your custom color system with over 400+ ready-to-go color
                variables.
              </p>
              <p>Enjoy!</p>
            </div>
            <div className="guide-image">
              <Step5KeyframeAnimation_1.default />
            </div>
          </div>);
            default:
                return null;
        }
    };
    return (<AreYouSureModal_1.default onClose={onClose}>
      <div className="guide-container">
        {renderPage()}
        <div className="guide-navigation">
          <button className="btn btn-secondary" onClick={handlePrevious} disabled={currentPage === 0}>
            <chevron_left_svg_1.ReactComponent />
            Back
          </button>
          <div className="guide-progress">
            {Array.from({ length: totalPages }).map((_, index) => (<div key={index} className={`guide-dot ${index === currentPage ? "active" : ""}`}/>))}
          </div>
          <button className="btn" onClick={handleNext}>
            {currentPage === totalPages - 1 ? "Done" : "Next"}
            <chevron_right_svg_1.ReactComponent />
          </button>
        </div>
      </div>
    </AreYouSureModal_1.default>);
};
exports.default = QuickGuideModal;
