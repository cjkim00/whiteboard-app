import { DrawHandler } from "../interface/DrawHandler";
import { DrawObject, LineFreehandDrawObject, LineStraightDrawObject, TextBoxDrawObject } from "../interface/drawObject";
import { point } from "../interface/point";


export function drawTextbox(): DrawHandler {
    
    return {
        onMouseDown(startingPosition: point) {
        },

        onMouseMove(
            ctx: CanvasRenderingContext2D,
            startingPoint: point, 
            previousPoint: point, 
            currentPoint: point,
            currentDrawObject: DrawObject
        ) {

        },

        onMouseUp(currentDrawObject: DrawObject, currentPoint: point): TextBoxDrawObject {
            console.log("text box created");
            if(currentDrawObject.type !== "TYPE_TEXT_TEXTBOX") {
                return {
                    type: "TYPE_TEXT_TEXTBOX",
                    color: currentDrawObject.color,
                    size: currentDrawObject.size,
                    location: { x: 0, y: 0 },
                    text: "",
                    height: 100,
                    width: 150,
                    fontSize: 12,
                    id: currentDrawObject.id
                }
            }
            return {
                type: "TYPE_TEXT_TEXTBOX",
                color: currentDrawObject.color,
                size: currentDrawObject.size,
                location: currentDrawObject.location,
                text: "",
                height: 100,
                width: 150,
                fontSize: 12,
                id: currentDrawObject.id
            }
        },

        draw(ctx: CanvasRenderingContext2D, drawObject: DrawObject) {
            if(drawObject.type !== "TYPE_TEXT_TEXTBOX") {
                return;
            }
            
        }
    }
}