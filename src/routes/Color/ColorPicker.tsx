type ColorPickerProps = {
    OnColorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export default function ColorPicker({ OnColorChange }: ColorPickerProps) {
    return (
        <input
            className="color-picker"
            type="color"
            defaultValue={"black"}
            onChange={OnColorChange}
        />
    )
}