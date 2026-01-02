import rectangleButtonIcon from "../../../icons/rectangle-line-icon.png";
import "../../../css/buttons.css";
import "../../../css/icons.css";
type RectangleButtonProps = {
    OnClick: () => void;
};
export default function RectangleButton({ OnClick }: RectangleButtonProps) {
    return (
        <div>
            <button
                className="toolbarButton-rectangle"
                onClick={OnClick}
            >
                <img
                    className="icon-rectangle"
                    src={rectangleButtonIcon} /></button>
        </div>
    )
}