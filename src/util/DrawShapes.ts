import { DrawHandler } from "../interface/DrawHandler";
import { DrawObject, ShapeRectangleDrawObject } from "../interface/drawObject";
import { point } from "../interface/point";

export function drawShapeRectangle() {
    return {
        onMouseDown(startingPoint: point) {
            
        },

        onMouseMove(
            ctx: CanvasRenderingContext2D,
            startingPoint: point,
            previousPoint: point,
            currentPoint: point,
            currentDrawObject: DrawObject
        ) {
            requestAnimationFrame(() => {
                const width = currentPoint.x - startingPoint.x;
                const height = currentPoint.y - startingPoint.y;

                ctx.beginPath();
                ctx.strokeStyle = currentDrawObject.color;
                ctx.lineWidth = currentDrawObject.size;
                ctx.strokeRect(
                    startingPoint.x,
                    startingPoint.y,
                    width,
                    height
                );
            });
        },

        onMouseUp(
            currentDrawObject: DrawObject,
            startingPoint: point,
            currentPoint: point
        ): ShapeRectangleDrawObject {
            return {
                type: "TYPE_SHAPE_RECTANGLE",
                color: currentDrawObject.color,
                size: currentDrawObject.size,
                start: startingPoint,
                end: currentPoint,
                id: currentDrawObject.id
            };
        },

        draw(ctx: CanvasRenderingContext2D, drawObject: DrawObject) {
            if (drawObject.type !== "TYPE_SHAPE_RECTANGLE") {
                return;
            }

            const width = drawObject.end.x - drawObject.start.x;
            const height = drawObject.end.y - drawObject.start.y;

            ctx.beginPath();
            ctx.strokeStyle = drawObject.color;
            ctx.lineWidth = drawObject.size;
            ctx.strokeRect(
                drawObject.start.x,
                drawObject.start.y,
                width,
                height
            );
        }
    }
}