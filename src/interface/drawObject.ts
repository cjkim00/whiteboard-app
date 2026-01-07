import {point} from "./point";
 
export type DrawObject =
  | LineFreehandDrawObject
  | LineStraightDrawObject
  | ShapeRectangleDrawObject
  | TextBoxDrawObject
  | None

export type LineFreehandDrawObject = {
  type: "TYPE_LINE_FREEHAND"
  color: string
  size: number
  points: point[],
  id: string
}

export type LineStraightDrawObject = {
  type: "TYPE_LINE_STRAIGHT"
  color: string
  size: number
  start: point
  end: point
  id: string
}

export type ShapeRectangleDrawObject = {
  type: "TYPE_SHAPE_RECTANGLE"
  color: string
  size: number
  start: point
  end: point
  id: string
}

export type TextBoxDrawObject = {
  type: "TYPE_TEXT_TEXTBOX"
  color: string
  size: number
  location: point
  text: string
  height: number,
  width: number
  fontSize: number
  id: string
}

export type None = {
  type: "TYPE_NONE"
  color: string
  size: number
  id: string
}
