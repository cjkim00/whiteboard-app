import React from "react";
import straightLineButtonIcon from "../../../icons/horizontal-line-icon.png";
import "../../../css/buttons.css";
import "../../../css/icons.css";

type StraightLineButtonProps = {
  OnClick: () => void;
  isActive: boolean;
};

export default function StraightLineButton({ OnClick, isActive }: StraightLineButtonProps) {
  return (
    <button
      type="button"
      style={{
        backgroundColor: isActive ? "#4caf50" : "transparent"
      }}
      className={`toolbarButton-straight-line${isActive ? " active" : ""}`}
      onClick={OnClick}
    >
      <img className="icon-line" src={straightLineButtonIcon} alt="Straight Line" />
    </button>
  );
}
