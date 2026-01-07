import React from "react";
import textBoxButtonIcon from "../../../icons/text-tool-icon.png";
import "../../../css/buttons.css";
import "../../../css/icons.css";

type TextboxButtonProps = {
  OnClick: () => void;
  isActive: boolean;
};

export default function TextboxButton({ OnClick, isActive }: TextboxButtonProps) {
  return (
    <button
      type="button"
      style={{
        backgroundColor: isActive ? "#4caf50" : "transparent"
      }}
      className={`toolbarButton-textbox${isActive ? " active" : ""}`}
      onClick={OnClick}
    >
      <img
        className="icon-textbox"
        src={textBoxButtonIcon}
        alt="Textbox"
      />
    </button>
  );
}
