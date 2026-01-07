// Whiteboard.tsx
import React, { useRef, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { DrawObject } from "../interface/drawObject";
import { point } from "../interface/point";
import UrlPopup from "./Share/UrlPopup";
import { drawShapeRectangle } from "../util/DrawShapes";
import Textbox from "./TextBox/TextBox";
import { TextBoxDrawObject } from "../interface/drawObject";
import { nanoid } from "nanoid";
import Toolbar from "./Toolbar/Toolbar";
import ShareBoard from "./Share/ShareBoard";
import Avatar from "./UserList/Avatar";
import { drawLineFreehand, drawLineStraight } from "../util/DrawLines";
import { drawTextbox } from "../util/DrawTextbox";
import "../css/buttons.css";
import "../css/whiteboard.css";

function Whiteboard() {
    // Identity and networking
    const userId = useRef<string>("");
    const serverId = useRef<string | null>(null);
    const socketRef = useRef<Socket | null>(null);

    // Canvas element and UI sizing
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    // Share popup UI
    const roomURL = useRef<string | null>(null);
    const [showPopup, setPopupState] = useState(false);

    // Drawing interaction state
    const isDrawing = useRef(false);
    const lastPoint = useRef<{ x: number; y: number }>(null);
    const startingPoint = useRef<point | null>(null);

    // Draw stacks and current tool object
    const drawObjectArray = useRef<DrawObject[]>([]);
    const drawObjectMap = useRef<Map<string, DrawObject>>(new Map<string, DrawObject>());
    const currentDrawObject = useRef<DrawObject>({
        type: "TYPE_NONE",
        size: 3,
        color: "#000000",
        id: nanoid()
    });

    // Textboxes state
    const [textBoxArray, setTextBox] = useState<Map<string, TextBoxDrawObject> | null>(
        new Map<string, TextBoxDrawObject>()
    );

    // Camera and panning
    const cameraScaleRef = useRef<number>(1);
    const cameraOffsetRef = useRef<point>({ x: 0, y: 0 });

    const isPanningRef = useRef<boolean>(false);
    const panStartMouseRef = useRef<point | null>(null);
    const panStartOffsetRef = useRef<point | null>(null);

    const [cameraView, setCameraView] = useState<{ scale: number; offset: point }>({
        scale: 1,
        offset: { x: 0, y: 0 }
    });

    // Tool handler map
    const map = {
        TYPE_LINE_FREEHAND: drawLineFreehand,
        TYPE_LINE_STRAIGHT: drawLineStraight,
        TYPE_SHAPE_RECTANGLE: drawShapeRectangle,
        TYPE_TEXT_TEXTBOX: drawTextbox
    };

    useEffect(() => {
        const socket = io("https://whiteboard-app-backend-ts.onrender.com");
        socketRef.current = socket;

        socket.on("room_created", (roomId: string) => {
            console.log("Room created:", roomId);
        });

        socket.on("disconnect", () => {
            console.log("Socket.IO disconnected");
        });

        socket.on("draw_object", (drawObject: DrawObject) => {
            if (drawObject.type === "TYPE_TEXT_TEXTBOX") {
                const box = drawObject as TextBoxDrawObject;
                setTextBox((prev) => {
                    const next = new Map(prev ?? undefined);
                    next.set(box.id, box);
                    return next;
                });
                return;
            }

            if (!drawObjectMap.current.has(drawObject.id)) {
                drawObjectMap.current.set(drawObject.id, drawObject);
            }

            draw(drawObject);
        });

        socket.on("connect_to_server", (connectedServer) => {
            serverId.current = connectedServer;
            console.log("server id updated: ", serverId.current);
        });

        socket.on("server_ID", (newServerId) => {
            serverId.current = newServerId;
        });

        socket.on("remove_object", (objectId, roomDrawStack) => {
            if (!roomDrawStack) return;

            const textboxMap = new Map<string, TextBoxDrawObject>();

            clearCanvas();
            drawObjectMap.current = new Map<string, DrawObject>();

            for (const obj of roomDrawStack) {
                if (obj.type === "TYPE_TEXT_TEXTBOX") {
                    const box = obj as TextBoxDrawObject;
                    textboxMap.set(box.id, box);
                    continue;
                }
                drawObjectMap.current.set(obj.id, obj);
            }

            setTextBox(textboxMap);
            redraw();
        });

        socket.on("draw_stack_on_connection", (roomDrawStack) => {
            const textboxMap = new Map<string, TextBoxDrawObject>();

            clearCanvas();
            drawObjectMap.current = new Map<string, DrawObject>();

            for (const obj of roomDrawStack) {
                if (obj.type === "TYPE_TEXT_TEXTBOX") {
                    const box = obj as TextBoxDrawObject;
                    textboxMap.set(box.id, box);
                    continue;
                }
                drawObjectMap.current.set(obj.id, obj);
            }

            setTextBox(textboxMap);
            redraw();
        });

        async function init() {
            const response = await fetch("https://whiteboard-app-backend-ts.onrender.com/get-id");
            if (!response) throw new Error("failed to fetch data");
            const data = await response.json();

            userId.current = data.userId;
            serverId.current = data.serverId;

            const roomFromUrl = getRoomParamFromHash();

            if (roomFromUrl) {
                serverId.current = roomFromUrl;
            }

            socket.emit("connect_to_server", userId.current, serverId.current);

            setSize({ width: window.innerWidth, height: window.innerHeight });
        }

        init();

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const zoomFactor = 1.1;

        function onWheel(e: WheelEvent) {
            e.preventDefault();

            const rect = canvas!.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const oldScale = cameraScaleRef.current;
            const oldOffset = cameraOffsetRef.current;

            const worldX = (mouseX - oldOffset.x) / oldScale;
            const worldY = (mouseY - oldOffset.y) / oldScale;

            let nextScale = e.deltaY < 0 ? oldScale * zoomFactor : oldScale / zoomFactor;
            nextScale = clampNumber(nextScale, 0.2, 5);

            cameraScaleRef.current = nextScale;
            cameraOffsetRef.current = {
                x: mouseX - worldX * nextScale,
                y: mouseY - worldY * nextScale
            };

            syncCameraView();
            redraw();
        }

        canvas.addEventListener("wheel", onWheel, { passive: false });
        return () => canvas.removeEventListener("wheel", onWheel);
    }, []);

    function getRoomParamFromHash(): string | null {
        const hash = window.location.hash; // example: "#/?room=ABC" or "#/board?room=ABC"
        const queryStartIndex = hash.indexOf("?");
        if (queryStartIndex === -1) return null;

        const queryString = hash.slice(queryStartIndex + 1); // "room=ABC"
        const params = new URLSearchParams(queryString);
        return params.get("room");
    }

    function clampNumber(value: number, min: number, max: number) {
        if (value < min) return min;
        if (value > max) return max;
        return value;
    }

    function getWorldPosFromClient(eClientX: number, eClientY: number): point {
        const rect = canvasRef.current!.getBoundingClientRect();

        const screenX = eClientX - rect.left;
        const screenY = eClientY - rect.top;

        const scale = cameraScaleRef.current;
        const offset = cameraOffsetRef.current;

        return { x: (screenX - offset.x) / scale, y: (screenY - offset.y) / scale };
    }

    function getWorldPos(e: React.MouseEvent<HTMLCanvasElement>): point {
        return getWorldPosFromClient(e.clientX, e.clientY);
    }

    function getCtxWithCameraTransform(): CanvasRenderingContext2D {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;

        const scale = cameraScaleRef.current;
        const offset = cameraOffsetRef.current;

        ctx.setTransform(scale, 0, 0, scale, offset.x, offset.y);
        return ctx;
    }

    function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
        if (currentDrawObject.current.type === "TYPE_NONE") return;

        if (e.button === 2) {
            isPanningRef.current = true;
            panStartMouseRef.current = { x: e.clientX, y: e.clientY };
            panStartOffsetRef.current = { x: cameraOffsetRef.current.x, y: cameraOffsetRef.current.y };
            return;
        }

        const start = getWorldPos(e);

        if (currentDrawObject.current.type === "TYPE_TEXT_TEXTBOX") {
            const newId = nanoid();

            const newTextbox: TextBoxDrawObject = {
                type: "TYPE_TEXT_TEXTBOX",
                color: currentDrawObject.current.color,
                size: currentDrawObject.current.size,
                location: start,
                text: "",
                height: 100,
                width: 150,
                fontSize: 12,
                id: newId
            };

            drawObjectArray.current.push(newTextbox);

            setTextBox((prev) => {
                const next = new Map(prev ?? undefined);
                next.set(newId, newTextbox);
                return next;
            });

            currentDrawObject.current = newTextbox;

            socketRef.current?.emit("draw_object", userId.current, serverId.current, newTextbox);
            return;
        }

        isDrawing.current = true;
        lastPoint.current = start;
        startingPoint.current = start;

        const handler = map[currentDrawObject.current.type]();
        handler.onMouseDown(start);
    }

    function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
        if (currentDrawObject.current.type === "TYPE_NONE") return;

        if (isPanningRef.current) {
            const startMouse = panStartMouseRef.current;
            const startOffset = panStartOffsetRef.current;
            if (!startMouse || !startOffset) return;

            cameraOffsetRef.current = {
                x: startOffset.x + (e.clientX - startMouse.x),
                y: startOffset.y + (e.clientY - startMouse.y)
            };

            syncCameraView();
            redraw();
            return;
        }

        if (!isDrawing.current) return;

        const ctx = getCtxWithCameraTransform();
        const pos = getWorldPos(e);
        const prev = lastPoint.current;

        if (!prev) {
            lastPoint.current = pos;
            return;
        }

        lastPoint.current = pos;
        const currentPos: point = { x: pos.x, y: pos.y };

        if (currentDrawObject.current.type === "TYPE_LINE_FREEHAND") {
            currentDrawObject.current.points.push(currentPos);
        }

        if (currentDrawObject.current.type !== "TYPE_LINE_FREEHAND") {
            clearCanvas();
            redraw();
        }

        const handler = map[currentDrawObject.current.type]();
        handler.onMouseMove(ctx, startingPoint.current!, prev, currentPos, currentDrawObject.current);
    }

    function handleMouseUp(e: React.MouseEvent<HTMLCanvasElement>) {
        if (currentDrawObject.current.type === "TYPE_NONE") return;

        if (e.button === 2) {
            isPanningRef.current = false;
            panStartMouseRef.current = null;
            panStartOffsetRef.current = null;
            return;
        }

        isDrawing.current = false;
        lastPoint.current = null;

        const currentPosition = getWorldPos(e);
        const handler = map[currentDrawObject.current.type]();

        currentDrawObject.current = handler.onMouseUp(
            currentDrawObject.current,
            startingPoint.current!,
            currentPosition
        );

        if (currentDrawObject.current.type !== "TYPE_TEXT_TEXTBOX") {
            drawObjectArray.current.push(currentDrawObject.current);
            drawObjectMap.current.set(currentDrawObject.current.id, currentDrawObject.current);
            socketRef.current?.emit("draw_object", userId.current, serverId.current, currentDrawObject.current);
        }

        if (currentDrawObject.current.type === "TYPE_LINE_FREEHAND") {
            currentDrawObject.current = {
                type: "TYPE_LINE_FREEHAND",
                color: currentDrawObject.current.color,
                size: currentDrawObject.current.size,
                points: [],
                id: nanoid()
            };
        } else if (currentDrawObject.current.type === "TYPE_TEXT_TEXTBOX") {
            currentDrawObject.current = {
                type: "TYPE_TEXT_TEXTBOX",
                color: currentDrawObject.current.color,
                size: currentDrawObject.current.size,
                location: currentDrawObject.current.location,
                text: "",
                height: 100,
                width: 150,
                fontSize: 12,
                id: nanoid()
            };
        } else {
            currentDrawObject.current = {
                type: currentDrawObject.current.type,
                color: currentDrawObject.current.color,
                size: currentDrawObject.current.size,
                start: { x: 0, y: 0 },
                end: { x: 0, y: 0 },
                id: nanoid()
            };
        }
    }

    function clearCanvas() {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function redraw() {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const scale = cameraScaleRef.current;
        const offset = cameraOffsetRef.current;
        ctx.setTransform(scale, 0, 0, scale, offset.x, offset.y);

        for (const obj of drawObjectMap.current.values()) {
            if (obj.type === "TYPE_TEXT_TEXTBOX" || obj.type === "TYPE_NONE") continue;
            const handler = map[obj.type]();
            handler.draw(ctx, obj);
        }
    }

    function undo() {
        if (!socketRef.current) return;

        const objectId = drawObjectArray.current.pop()?.id;
        socketRef.current.emit("remove_object", userId.current, serverId.current, objectId);

        setTextBox((prev) => {
            if (!prev) return prev;
            const next = new Map(prev);
            if (objectId) next.delete(objectId);
            return next;
        });
    }

    function draw(drawObject: DrawObject) {
        if (drawObject.type === "TYPE_NONE") return;
        const ctx = getCtxWithCameraTransform();
        const handler = map[drawObject.type]();
        handler.draw(ctx, drawObject);
    }

    function createServer() {
        socketRef.current?.emit("create_room", userId.current);
    }

    function changeDrawTypeToStraightLine() {
        if (currentDrawObject.current.type === "TYPE_LINE_STRAIGHT") {
            currentDrawObject.current = {
                type: "TYPE_NONE",
                size: 3,
                color: "#000000",
                id: nanoid()
            };
            return;
        }

        currentDrawObject.current = {
            type: "TYPE_LINE_STRAIGHT",
            color: currentDrawObject.current.color,
            size: currentDrawObject.current.size,
            start: { x: 0, y: 0 },
            end: { x: 0, y: 0 },
            id: nanoid()
        };
    }

    function changeDrawTypeToFreehandLine() {
        if (currentDrawObject.current.type === "TYPE_LINE_FREEHAND") {
            currentDrawObject.current = {
                type: "TYPE_NONE",
                size: 3,
                color: "#000000",
                id: nanoid()
            };
            return;
        }

        currentDrawObject.current = {
            type: "TYPE_LINE_FREEHAND",
            color: currentDrawObject.current.color,
            size: currentDrawObject.current.size,
            points: [],
            id: nanoid()
        };
    }

    function changeDrawTypeToRectangleShape() {
        if (currentDrawObject.current.type === "TYPE_SHAPE_RECTANGLE") {
            currentDrawObject.current = {
                type: "TYPE_NONE",
                size: 3,
                color: "#000000",
                id: nanoid()
            };
            return;
        }

        currentDrawObject.current = {
            type: "TYPE_SHAPE_RECTANGLE",
            color: currentDrawObject.current.color,
            size: currentDrawObject.current.size,
            start: { x: 0, y: 0 },
            end: { x: 0, y: 0 },
            id: nanoid()
        };
    }

    function changeDrawTypeToTextbox() {
        if (currentDrawObject.current.type === "TYPE_TEXT_TEXTBOX") {
            currentDrawObject.current = {
                type: "TYPE_NONE",
                size: 3,
                color: "#000000",
                id: nanoid()
            };
            return;
        }

        currentDrawObject.current = {
            type: "TYPE_TEXT_TEXTBOX",
            color: currentDrawObject.current.color,
            size: currentDrawObject.current.size,
            location: { x: 0, y: 0 },
            text: "",
            height: 100,
            width: 150,
            fontSize: 12,
            id: nanoid()
        };
    }

    function changeColor(e: React.ChangeEvent<HTMLInputElement>) {
        currentDrawObject.current.color = e.target.value;
    }

    function changeBrushSize(e: React.ChangeEvent<HTMLInputElement>) {
        currentDrawObject.current.size = Number(e.target.value);
    }

    async function getRoomURL() {
        try {
            createServer();
            const response = await fetch(
                `https://whiteboard-app-backend-ts.onrender.com/get-room-url?userId=${encodeURIComponent(userId.current)}`
            );
            if (!response.ok) throw new Error(`server error: ${response.status}`);
            const data = await response.json();
            roomURL.current = data.url;
            setPopupState(true);
        } catch (err) {
            console.log("error connecting to server: ", err);
        }
    }

    function syncCameraView() {
        setCameraView({
            scale: cameraScaleRef.current,
            offset: { ...cameraOffsetRef.current }
        });
    }

    return (
        <div style={{ position: "relative", width: size.width, height: size.height }}>
            {showPopup && (
                <UrlPopup
                    url={roomURL.current!}
                    width={size.width}
                    height={size.height}
                    setPopupState={setPopupState}
                />
            )}

            <div>
                <canvas
                    ref={canvasRef}
                    className="whiteboard"
                    height={size.height}
                    width={size.width}
                    style={{
                        backgroundColor: "#ffffff",
                        backgroundImage: `
              linear-gradient(#e0e0e0 1px, transparent 1px),
              linear-gradient(90deg, #e0e0e0 1px, transparent 1px)
            `,
                        backgroundSize: "25px 25px"
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                />

                <ShareBoard getRoomURL={getRoomURL} />

                <Toolbar
                    BrushSizeSliderOnSizeChange={changeBrushSize}
                    UndoButtonOnClick={undo}
                    FreehandButtonOnClick={changeDrawTypeToFreehandLine}
                    StraightLineButtonOnClick={changeDrawTypeToStraightLine}
                    RectangleButtonOnClick={changeDrawTypeToRectangleShape}
                    TextboxButtonOnClick={changeDrawTypeToTextbox}
                    ColorPickerOnColorChange={changeColor}
                />
                {/*
                <div style={{ display: "flex", left: 20, bottom: 20, position: "absolute" }}>
                    <Avatar name="Chris" />
                </div>
                */}

                {Array.from(textBoxArray?.values() ?? []).map((box) => (
                    <Textbox
                        key={box.id}
                        userId={userId.current}
                        serverId={serverId.current ? serverId.current : ""}
                        textBox={box}
                        socket={socketRef.current!}
                        setTextBox={(id, updatedBox) => {
                            setTextBox((prev) => {
                                if (!prev) return prev;

                                const next = new Map(prev);
                                next.set(id, updatedBox);
                                return next;
                            });
                        }}
                        rect={canvasRef.current!.getBoundingClientRect()}
                        cameraScale={cameraView.scale}
                        cameraOffset={cameraView.offset}
                    />
                ))}
            </div>
        </div>
    );
}

export default Whiteboard;
