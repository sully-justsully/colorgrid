import React from "react";
import "../styles/Mobile.css";
import { ReactComponent as ShareIcon } from "../icons/share.svg";
import { trackEvent, AnalyticsEvents } from "../utils/analytics";

const MobileLayout: React.FC = () => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Color Grid Tool",
          text: "Check out this Color Grid Tool for creating beautiful color palettes!",
          url: window.location.href,
        });
        trackEvent(AnalyticsEvents.SHARE_APP, {
          method: "native_share",
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  return (
    <div className="mobile-container" role="main">
      <h1 className="mobile-headline">Color Grid Tool</h1>
      <p className="mobile-body">
        This tool works best on larger screens like laptops or tablets. Use the
        button below to share this page with your preferred device.
      </p>
      <button
        className="btn btn-secondary"
        onClick={handleShare}
        aria-label="Share Color Grid Tool"
      >
        <ShareIcon aria-hidden="true" />
        Airdrop or Share Link
      </button>
    </div>
  );
};

export default MobileLayout;
