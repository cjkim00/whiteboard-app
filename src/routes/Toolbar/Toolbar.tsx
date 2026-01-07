import React, { useState } from "react";
import BrushSizeSlider from "./Brush/BrushSizeSlider";
import UndoButton from "./Buttons/UndoButton";
import FreehandBrushButton from "./Buttons/FreehandBrushButton";
import StraightLineButton from "./Buttons/StraightLineButton";
import RectangleButton from "./Buttons/RectangleButton";
import TextboxButton from "./Buttons/TextboxButton";
import ColorPicker from "../Color/ColorPicker";

import "../../css/toolbar.css";

type ToolbarProps = {
  BrushSizeSliderOnSizeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  UndoButtonOnClick: () => void;
  FreehandButtonOnClick: () => void;
  StraightLineButtonOnClick: () => void;
  RectangleButtonOnClick: () => void;
  TextboxButtonOnClick: () => void;
  ColorPickerOnColorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

type ToolId = "freehand" | "line" | "rectangle" | "textbox";
type ActiveTool = ToolId | "none";

export default function Toolbar({
  BrushSizeSliderOnSizeChange,
  UndoButtonOnClick,
  FreehandButtonOnClick,
  StraightLineButtonOnClick,
  RectangleButtonOnClick,
  TextboxButtonOnClick,
  ColorPickerOnColorChange
}: ToolbarProps) {
  const [activeTool, setActiveTool] = useState<ActiveTool>("none");

  function toggleTool(next: ToolId) {
    setActiveTool((prev) => {
      if (prev === next) {
        return "none";
      }
      return next;
    });
  }

  return (
    <div className="toolbar">
      <BrushSizeSlider OnSizeChange={BrushSizeSliderOnSizeChange} />
      <UndoButton OnClick={UndoButtonOnClick} />

      <FreehandBrushButton
        isActive={activeTool === "freehand"}
        OnClick={() => {
          toggleTool("freehand");
          FreehandButtonOnClick();
        }}
      />

      <StraightLineButton
        isActive={activeTool === "line"}
        OnClick={() => {
          toggleTool("line");
          StraightLineButtonOnClick();
        }}
      />

      <RectangleButton
        isActive={activeTool === "rectangle"}
        OnClick={() => {
          toggleTool("rectangle");
          RectangleButtonOnClick();
        }}
      />

      <TextboxButton
        isActive={activeTool === "textbox"}
        OnClick={() => {
          toggleTool("textbox");
          TextboxButtonOnClick();
        }}
      />

      <ColorPicker OnColorChange={ColorPickerOnColorChange} />
    </div>
  );
}
