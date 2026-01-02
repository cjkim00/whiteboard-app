import textBoxButtonIcon from "../../../icons/text-tool-icon.png";
import "../../../css/buttons.css";
import "../../../css/icons.css";
type TextboxButtonProps = {
    OnClick: () => void;
};
export default function TextboxButton({ OnClick }: TextboxButtonProps) {
    return (
        <div>
            <button
                className="toolbarButton-textbox"
                onClick={OnClick}
            >
                <img
                    className="icon-textbox"
                    src={textBoxButtonIcon} /></button>
        </div>
    )
}