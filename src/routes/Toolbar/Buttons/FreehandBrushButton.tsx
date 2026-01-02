import freehandButtonIcon from "../../../icons/brush-paintbrush-icon.png";
import "../../../css/buttons.css";
import "../../../css/icons.css";
type FreehandButtonProps = {
    OnClick: () => void;
};
export default function FreehandBrushButton({ OnClick }: FreehandButtonProps) {
    return (
        <div>
            <button
                className="toolbarButton-freehand"
                onClick={OnClick}
            >
                <img
                    className="icon-freehand"
                    src={freehandButtonIcon} /></button>
        </div>
    )
}