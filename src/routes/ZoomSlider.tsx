type ZoomSliderProps = {
    sliderValue: number,
    onZoomChange: (nextScale: number) => void;
}

export default function ZoomSlider({ sliderValue, onZoomChange }: ZoomSliderProps) {
    
    
    return (
        <div 
            style={{
                display:"flex",
                position: "absolute",
                //justifyContent: "center",
                //alignItems:"flex-end",
                //zIndex:5,
                background:"transparent"
            }}
        >
            <input 
                type="range"
                min={0.2}
                max={5}
                step={0.1}
                defaultValue={sliderValue}
                onChange={(e) => {
                    //sliderValue.current = Number(e.target.value);
                    onZoomChange(Number(e.target.value));
                }}
            />
        </div>
    );
}