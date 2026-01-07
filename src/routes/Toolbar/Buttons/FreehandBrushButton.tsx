import React from "react";
import freehandButtonIcon from "../../../icons/brush-paintbrush-icon.png";
import "../../../css/buttons.css";
import "../../../css/icons.css";

type FreehandButtonProps = {
    OnClick: () => void;
    isActive: boolean;
};

export default function FreehandBrushButton({ OnClick, isActive }: FreehandButtonProps) {
    return (
        <button
            style={{
                backgroundColor: isActive ? "#4caf50" : "transparent"
            }}
            className={`toolbarButton-freehand${isActive ? " active" : ""}`}
            onClick={OnClick}
            type="button"
        >
            <img className="icon" src={freehandButtonIcon} />
        </button>
    );
}
