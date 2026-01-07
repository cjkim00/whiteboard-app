import React from "react";
import rectangleButtonIcon from "../../../icons/rectangle-line-icon.png";
import "../../../css/buttons.css";
import "../../../css/icons.css";

type RectangleButtonProps = {
  OnClick: () => void;
  isActive: boolean;
};

export default function RectangleButton({ OnClick, isActive }: RectangleButtonProps) {
  return (
    <button
      type="button"
      style={{
        backgroundColor: isActive ? "#4caf50" : "transparent"
      }}
      className={`toolbarButton-rectangle${isActive ? " active" : ""}`}
      onClick={OnClick}
    >
      <img className="icon-rectangle" src={rectangleButtonIcon} alt="Rectangle" />
    </button>
  );
}
