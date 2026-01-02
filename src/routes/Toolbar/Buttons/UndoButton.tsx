import undoButtonIcon from "../../../icons/undo-arrow-icon.png";
import "../../../css/buttons.css";
import "../../../css/icons.css";
type UndoButtonProps = {
    OnClick: () => void;
};
export default function UndoButton({ OnClick }: UndoButtonProps) {
    return (
        <button
            className="toolbarButton-undo"
            onClick={OnClick}
        >
            <img
                className="icon-undo"
                src={undoButtonIcon} /></button>
    )
}