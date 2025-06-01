import React from "react";
import AreYouSureModal from "./AreYouSureModal";

interface ScoresModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ScoresModal: React.FC<ScoresModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AreYouSureModal onClose={onClose} title="Scores Explained">
      <div
        className="body-lg modal-content-message"
        style={{ maxWidth: 800, width: "800px" }}
      >
        <p className="mb-4">
          The scoring system evaluates your color palette using several
          criteria. Here is how each score is calculated:
        </p>
        <ul className="list-disc pl-5">
          <li style={{ marginBottom: 16 }}>
            <strong>Swatch Count:</strong> Palettes with 10-20 swatches score
            best. Fewer or more swatches reduce the score, with a small bonus
            for 16-20 swatches.
          </li>
          <li style={{ marginBottom: 16 }}>
            <strong>Evenness of L* Values:</strong> Measures how closely your
            palette's lightness (L*) values match the ideal, evenly spaced steps
            for your swatch count. The closer your palette is to the ideal, the
            higher the score.
          </li>
          <li style={{ marginBottom: 16 }}>
            <strong>Light v Dark Balance:</strong> Checks if your palette has a
            balanced number of light (L* {">"} 50) and dark (L* {"<"} 50)
            swatches. The more balanced, the higher the score.
          </li>
          <li style={{ marginBottom: 16 }}>
            <strong>Symmetry:</strong> Looks for pairs of swatches that are
            symmetric around L* = 50 (e.g., L* 80 and L* 20). More symmetric
            pairs increase the score.
          </li>
          <li style={{ marginBottom: 16 }}>
            <strong>Hue Variance:</strong> Evaluates how consistent the hue is
            across your palette. Stepwise differences between adjacent swatches
            are rewarded if they are small (0-3°), and the total hue difference
            from first to last swatch is also considered. Low-saturation (gray)
            swatches are assigned the hue of the nearest colored swatch.
          </li>
          <li style={{ marginBottom: 16 }}>
            <strong>Color Range Score:</strong> A bundled score combining Swatch
            Count (20%), Evenness (50%), and Hue Variance (30%).
          </li>
          <li style={{ marginBottom: 16 }}>
            <strong>Light v Dark Score:</strong> A bundled score combining Light
            v Dark Balance (50%) and Symmetry (50%).
          </li>
          <li style={{ marginBottom: 16 }}>
            <strong>Accessibility (Contrast) Score:</strong> Measures how many
            color pairs in your palette meet WCAG contrast ratios (3:1 for A,
            4.5:1 for AA). The score is normalized against the best possible
            palette for your swatch count, with 60% weight on AA and 40% on A.
          </li>
        </ul>
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
