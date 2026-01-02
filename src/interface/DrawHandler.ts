import { point } from "./point";
import { DrawObject } from "./drawObject";
export interface DrawHandler {
    onMouseDown(currentPoint: point): void,
    onMouseMove(
        ctx: CanvasRenderingContext2D, 
        startingPoint: point,
        previousPoint: point, 
        currentPoint: point,
        currentDrawObject: DrawObject): void,
    onMouseUp(currentDrawObject: DrawObject, startingPoint: point, currentPoint: point): DrawObject,
    draw(ctx: CanvasRenderingContext2D, drawObject: DrawObject): void
}