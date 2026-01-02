import straightLineButtonIcon from "../../../icons/horizontal-line-icon.png";
import "../../../css/buttons.css";
import "../../../css/icons.css";
type StraightLineButtonProps = {
    OnClick: () => void;
};
export default function StraightLineButton({ OnClick }: StraightLineButtonProps) {
    return (
        <div>
            <button
                className="toolbarButton-straight-line"
                onClick={OnClick}
            >
                <img
                    className="icon-line"
                    src={straightLineButtonIcon} /></button>
        </div>
    )
}