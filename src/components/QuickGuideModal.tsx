import React, { useState, useEffect } from "react";
import { ReactComponent as InfoIcon } from "../icons/info.svg";
import { ReactComponent as ChevronRightIcon } from "../icons/chevron-right.svg";
import { ReactComponent as ChevronLeftIcon } from "../icons/chevron-left.svg";
import Step1HueRotateAnimation from "./Step1HueRotateAnimation";
import Step2KeyframeAnimation from "./Step2KeyframeAnimation";
import Step3KeyframeAnimation from "./Step3KeyframeAnimation";
import Step4KeyframeAnimation from "./Step4KeyframeAnimation";
import Step5KeyframeAnimation from "./Step5KeyframeAnimation";
import AreYouSureModal from "./AreYouSureModal";
import "../styles/QuickGuideModal.css";

interface QuickGuideModalProps {
  onClose: () => void;
}

const QuickGuideModal: React.FC<QuickGuideModalProps> = ({ onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = 5;

  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, []);

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else {
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
        return (
          <div className="guide-page">
            <div className="guide-content">
              <h2 className="heading-lg">Pick a Hue or Key Hex Code</h2>
              <p>
                Creating a color palette for your new brand? Put in the hex code
                and it's corresponding dot will always appear on the color grid
                as a reference point.
              </p>
              <p>
                Maybe you just need a new neutral, success, or error family?
                Pick a hue and jump right in!
              </p>
            </div>
            <div className="guide-image">
              <Step1HueRotateAnimation />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="guide-page">
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
              <Step2KeyframeAnimation />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="guide-page">
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
              <Step3KeyframeAnimation />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="guide-page">
            <div className="guide-content">
              <h2 className="heading-lg">Saving to Palette Creator</h2>
              <p>
                Click on 'Save to Palette Creator' to save your color swatches
                as semantic color families which you can import into your Figma
                files.
              </p>
              <p>
                You can save up 8 color families at a time and always come back
                and replace families if you need.
              </p>
            </div>
            <div className="guide-image">
              <Step4KeyframeAnimation />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="guide-page">
            <div className="guide-content">
              <h2 className="heading-lg">Finishing Up</h2>
              <p>
                When you're all done, click on 'Download Palettes' and you'll
                get a Figma-ready SVG file.
              </p>
              <p>
                You can import the SVG into{" "}
                <a
                  href="https://www.figma.com/community/file/1428517491497047139/design-system-variables-midnight-v-2-0"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Design System Variables — Midnight v2.0
                </a>{" "}
                to use your custom color system with over 400+ ready-to-go color
                variables. Enjoy!
              </p>
            </div>
            <div className="guide-image">
              <Step5KeyframeAnimation />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AreYouSureModal onClose={onClose}>
      <div className="guide-container">
        {renderPage()}
        <div className="guide-navigation">
          <button
            className="btn btn-secondary"
            onClick={handlePrevious}
            disabled={currentPage === 0}
          >
            <ChevronLeftIcon />
            Back
          </button>
          <div className="guide-progress">
            {Array.from({ length: totalPages }).map((_, index) => (
              <div
                key={index}
                className={`guide-dot ${index === currentPage ? "active" : ""}`}
              />
            ))}
          </div>
          <button className="btn" onClick={handleNext}>
            {currentPage === totalPages - 1 ? "Done" : "Next"}
            <ChevronRightIcon />
          </button>
        </div>
      </div>
    </AreYouSureModal>
  );
};

export default QuickGuideModal;
