type BrushSizeSliderProps = {
    OnSizeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function BrushSizeSlider({OnSizeChange}: BrushSizeSliderProps) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 0,
                alignItems: "center",
            }}
        >
            <p style={{ margin: 0 }}>Brush Size</p>
            <input
                type="range"
                min={1}
                max={50}
                defaultValue={3}
                onChange={OnSizeChange}
            />
        </div>
    )
}