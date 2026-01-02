import BrushSizeSlider from "./Brush/BrushSizeSlider";
import UndoButton from "./Buttons/UndoButton";
import FreehandBrushButton from "./Buttons/FreehandBrushButton"
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
export default function Toolbar(
    {
        BrushSizeSliderOnSizeChange,
        UndoButtonOnClick, 
        FreehandButtonOnClick, 
        StraightLineButtonOnClick, 
        RectangleButtonOnClick,
        TextboxButtonOnClick,
        ColorPickerOnColorChange
    }: ToolbarProps) {
    return (
        <div className="toolbar" >
            <BrushSizeSlider OnSizeChange={BrushSizeSliderOnSizeChange}/>
            <UndoButton OnClick={UndoButtonOnClick}/>
            <FreehandBrushButton OnClick={FreehandButtonOnClick}/>
            <StraightLineButton OnClick={StraightLineButtonOnClick}/>
            <RectangleButton OnClick={RectangleButtonOnClick}/>
            <TextboxButton OnClick={TextboxButtonOnClick}/>
            <ColorPicker OnColorChange={ColorPickerOnColorChange}/>
        </div>
    )
}