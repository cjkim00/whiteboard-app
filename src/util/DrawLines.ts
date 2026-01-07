import { DrawHandler } from "../interface/DrawHandler";
import { DrawObject, LineFreehandDrawObject, LineStraightDrawObject } from "../interface/drawObject";
import { point } from "../interface/point";


export function drawLineFreehand(): DrawHandler {
    
    return {
        onMouseDown(startingPosition: point) {
            console.log("starting position: ", startingPosition);
        },

        onMouseMove(
            ctx: CanvasRenderingContext2D,
            startingPoint: point, 
            previousPoint: point, 
            currentPoint: point,
            currentDrawObject: DrawObject
        ) {
            requestAnimationFrame(() => {
                ctx.beginPath();
                ctx.moveTo(previousPoint.x, previousPoint.y);
                ctx.lineTo(currentPoint.x, currentPoint.y);
                ctx.strokeStyle = currentDrawObject.color;
                ctx.lineWidth = currentDrawObject.size;
                ctx.lineCap = "round";
                ctx.stroke();
            });
        },

        onMouseUp(currentDrawObject: DrawObject, currentPoint: point): LineFreehandDrawObject {
            if (currentDrawObject.type !== "TYPE_LINE_FREEHAND") {
                return {
                    type: "TYPE_LINE_FREEHAND",
                    color: currentDrawObject.color,
                    size: currentDrawObject.size,
                    points: [],
                    id: currentDrawObject.id
                };
            }
            return {
                type: "TYPE_LINE_FREEHAND",
                color: currentDrawObject.color,
                size: currentDrawObject.size,
                points: [...currentDrawObject.points],
                id: currentDrawObject.id
            }
        },

        draw(ctx: CanvasRenderingContext2D, drawObject: DrawObject) {
            
            if (drawObject.type !== "TYPE_LINE_FREEHAND") {
                return;
            }
            //console.log("freehand lines: ", drawObject);
            const points = drawObject.points;
            for(let i = 1; i < drawObject.points.length; i++) {
                const from = points[i - 1];
                const to = points[i];
                ctx.strokeStyle = drawObject.color;
                ctx.lineWidth = drawObject.size;
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.lineCap = "round";
                ctx.stroke();
            }
        }
    }
}

export function drawLineStraight() {
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
                ctx.beginPath();
                ctx.moveTo(startingPoint.x, startingPoint.y);
                ctx.lineTo(currentPoint.x, currentPoint.y);
                ctx.strokeStyle = currentDrawObject.color;
                ctx.lineWidth = currentDrawObject.size;
                ctx.lineCap = "round";
                ctx.stroke();
            });
        },

        onMouseUp(currentDrawObject: DrawObject, startingPoint: point, currentPoint: point): LineStraightDrawObject {
            return {
                type: "TYPE_LINE_STRAIGHT",
                color: currentDrawObject.color,
                size: currentDrawObject.size,
                start: startingPoint,
                end: currentPoint,
                id: currentDrawObject.id
            }
        },

        draw(ctx: CanvasRenderingContext2D, drawObject: DrawObject) {
            
            if (drawObject.type !== "TYPE_LINE_STRAIGHT") {
                return;
            }
            //console.log("Straight Line: ", drawObject);
            ctx.beginPath();
            ctx.moveTo(drawObject.start.x, drawObject.start.y);
            ctx.lineTo(drawObject.end.x, drawObject.end.y);
            ctx.strokeStyle = drawObject.color;
            ctx.lineWidth = drawObject.size;
            ctx.lineCap = "round";
            ctx.stroke();
        }
    }
}
