"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
require("../styles/Mobile.css");
const share_svg_1 = require("../icons/share.svg");
const MobileLayout = () => {
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Color Grid Tool",
                    text: "Check out this Color Grid Tool for creating beautiful color palettes!",
                    url: window.location.href,
                });
            }
            catch (error) {
                console.error("Error sharing:", error);
            }
        }
    };
    return (<div className="mobile-container" role="main">
      <h1 className="mobile-headline">Color Grid Tool</h1>
      <p className="mobile-body">
        This tool works best on larger screens like laptops or tablets. Use the
        button below to share this page with your preferred device.
      </p>
      <button className="btn btn-secondary" onClick={handleShare} aria-label="Share Color Grid Tool">
        <share_svg_1.ReactComponent aria-hidden="true"/>
        Airdrop or Share Link
      </button>
    </div>);
};
exports.default = MobileLayout;
