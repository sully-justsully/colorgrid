import React from "react";
import AreYouSureModal from "./AreYouSureModal";
import "../styles/ScoresModal.css";

interface ScoresModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ScoresModal: React.FC<ScoresModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AreYouSureModal onClose={onClose} title="Scores Explained">
      <div className="scores-modal-content body-lg modal-content-message">
        <p className="mb-4">
          The scoring system evaluates your color palette using several
          criteria. Here is how each score is calculated:
        </p>
        <p className="scores-modal-score">
          <strong>Swatch Count:</strong> Measures the amount of swatches in your
          palette. 16, 18, or 20 swatches is the sweet spot.
        </p>
        <p className="scores-modal-score">
          <strong>Smoothness:</strong> Measures how smooth your palette
          transitions from light to dark.
        </p>
        <p className="scores-modal-score">
          <strong>Hue Variance:</strong> Measures how consistent the hue is
          across your palette. Some variance is good, but too much variance will
          lower the score.
        </p>
        <p className="scores-modal-score">
          <strong>Balance:</strong> Checks if your palette has equal number of
          light and dark swatches. The more balanced, the better.
        </p>
        <p className="scores-modal-score">
          <strong>Pairings:</strong> Looks for pairs of swatches that are
          symmetric around L* = 50 (e.g., 65/35 or 40/60). Symmetric pairs allow
          you to create Light mode and Dark mode from a single palette.
        </p>
        <p className="scores-modal-score">
          <strong>Accessibility Score:</strong> Measures how many color pairs in
          your palette meet WCAG contrast ratios (3:1 for A, 4.5:1 for AA). The
          score is normalized against the best possible palette for your swatch
          count.
        </p>
      </div>
      <div className="modal-actions">
        <button onClick={onClose} className="btn btn-secondary">
          Close
        </button>
      </div>
    </AreYouSureModal>
  );
};

export default ScoresModal;
