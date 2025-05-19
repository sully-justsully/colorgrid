import React, { useState } from "react";
import { ReactComponent as InfoIcon } from "../icons/info.svg";
import { ReactComponent as ChevronRightIcon } from "../icons/chevron-right.svg";
import { ReactComponent as ChevronLeftIcon } from "../icons/chevron-left.svg";
import Modal from "./Modal";

interface QuickGuideModalProps {
  onClose: () => void;
}

const QuickGuideModal: React.FC<QuickGuideModalProps> = ({ onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = 5;

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
                Or maybe you just need a new neutral, success, and error
                families? Pick a hue and jump right in!
              </p>
            </div>
            <div className="guide-image">
              {/* Placeholder for hex code visualization */}
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
                Never run out of options with 18 swatches per family.
              </p>
              <p>
                <strong>Custom: </strong>
                It's all up to you!
              </p>
            </div>
            <div className="guide-image">
              {/* Placeholder for color swatch visualization */}
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
                color palette. Follow the simple guide lines if need help
                creating consistent families.
              </p>
              <p>
                Adjust the inputs next to your swatch if you want more or less
                difference between the swatches. When you're done, click on View
                Contrast Grid to see which color combinations are accessible.
              </p>
            </div>
            <div className="guide-image">
              {/* Placeholder for color picking visualization */}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="guide-page">
            <div className="guide-content">
              <h2 className="heading-lg">Saving to Palette Creator</h2>
              <p>
                The Palette Creator helps you organize your color swatches into
                semantic color families that you can import into your Figma
                files.
              </p>
              <p>
                Save up 8 color families at a time. You can always come back and
                replace families if you need.
              </p>
            </div>
            <div className="guide-image">
              {/* Placeholder for palette creator visualization */}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="guide-page">
            <div className="guide-content">
              <h2 className="heading-lg">Finishing Up</h2>
              <p>
                When you're all done, click on Download Palettes and you'll get
                a Figma-ready SVG file.
              </p>
              <p>
                You can import the SVG into{"  "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.figma.com/community/file/1428517491497047139/design-system-variables-midnight-v-2-0"
                >
                  Design System Variables
                </a>
                {"  "}to use your custom color system with over 400+ ready-to-go
                color variables. Enjoy!
              </p>
            </div>
            <div className="guide-image">
              {/* Placeholder for download visualization */}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Modal onClose={onClose}>
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
    </Modal>
  );
};

export default QuickGuideModal;
