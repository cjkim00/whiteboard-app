// TextBox/TextBox.tsx
import React, { useEffect, useRef, useState } from "react";
import { point } from "../../interface/point";
import { TextBoxDrawObject } from "../../interface/drawObject";
import { Socket } from "socket.io-client";

type TextboxProps = {
	userId: string;
	serverId: string;
	textBox: TextBoxDrawObject;
	socket: Socket;
	rect: DOMRect;
	setTextBox: (id: string, setTextBox: TextBoxDrawObject) => void;
	cameraScale: number;
	cameraOffset: point;
};

type ResizeHandle = "nw" | "ne" | "sw" | "se";

export default function Textbox({
	userId,
	serverId,
	textBox,
	socket,
	setTextBox,
	cameraScale,
	cameraOffset
}: TextboxProps) {
	// Convert prop world coords to screen px for initial local state
	const initialLeftPx = textBox.location.x * cameraScale + cameraOffset.x;
	const initialTopPx = textBox.location.y * cameraScale + cameraOffset.y;

	const objectIdRef = useRef<string>(textBox.id);
	objectIdRef.current = textBox.id;
	const textboxRef = useRef<HTMLTextAreaElement | null>(null);

	// Local UI state (draft while interacting)
	const [text, setText] = useState<string>(textBox.text);
	const [location, setLocation] = useState<point>({ x: initialLeftPx, y: initialTopPx });
	const [width, setWidth] = useState<number>(textBox.width);
	const [height, setHeight] = useState<number>(textBox.height);

	const isDraggingRef = useRef<boolean>(false);
	const isResizingRef = useRef<boolean>(false);
	const resizeHandleRef = useRef<ResizeHandle | null>(null);

	const startXRef = useRef<number>(initialLeftPx);
	const startYRef = useRef<number>(initialTopPx);

	const startWidthRef = useRef<number>(textBox.width);
	const startHeightRef = useRef<number>(textBox.height);

	const startPosRef = useRef<point>({ x: initialLeftPx, y: initialTopPx });
	const startLeftRef = useRef<number>(initialLeftPx);
	const startTopRef = useRef<number>(initialTopPx);

	const [isFocused, setIsFocused] = useState<boolean>(false);

	const MIN_W = 40;
	const MIN_H = 30;

	// Sync local draft state from server updates when not interacting
	useEffect(() => {
		setText(textBox.text);
	}, [textBox.text]);

	useEffect(() => {
		if (isDraggingRef.current) return;
		if (isResizingRef.current) return;

		const nextLeftPx = textBox.location.x * cameraScale + cameraOffset.x;
		const nextTopPx = textBox.location.y * cameraScale + cameraOffset.y;
		setLocation({ x: nextLeftPx, y: nextTopPx });
	}, [textBox.location.x, textBox.location.y, cameraScale, cameraOffset.x, cameraOffset.y]);

	useEffect(() => {
		if (isResizingRef.current) return;
		setWidth(textBox.width);
		setHeight(textBox.height);
	}, [textBox.width, textBox.height]);

	function updateText(e: React.ChangeEvent<HTMLTextAreaElement>) {
		const newText: string = e.target.value;
		setText(newText);
		socket.emit("update_text_box_text", userId, serverId, textBox.id, newText);
	}

	useEffect(() => {
		socket.on("text_box_text_update", (objectId: string, newText: string) => {

			if(objectIdRef.current !== objectId) {
				return;
			}

			setText(newText);
		});

		socket.on("text_box_size_update", (objectId: string, newWidth: number, newHeight: number) => {
			if(objectIdRef.current !== objectId) {
				return;
			}

			setWidth(newWidth);
			setHeight(newHeight);
		});

		socket.on("text_box_location_update", (objectId: string, newX: number, newY: number) => {
			if(objectIdRef.current !== objectId) {
				return;
			}
			
			setLocation({x: newX, y: newY});

		});

		/*
			socket.on("text_box_font_size_update", (objectId: string, newFontSize: number) => {
            setTextBox((prev) => {
                if (!prev) return prev;

                const next = new Map(prev);
                const textbox = next.get(objectId);
                if (!textbox) return prev;

                next.set(objectId, {
                    ...textbox,
                    fontSize: newFontSize
                });

                return next;
            });
        });
		*/

	}, []);

	function onMouseDown(e: React.MouseEvent) {
		e.preventDefault();
		isDraggingRef.current = true;

		startXRef.current = e.clientX;
		startYRef.current = e.clientY;

		startPosRef.current = { x: location.x, y: location.y };
	}

	function onMouseUp(e: React.MouseEvent) {
		const mouseX = e.clientX;
		const mouseY = e.clientY;

		if (startXRef.current === mouseX && startYRef.current === mouseY) {
			textboxRef.current?.focus();
		}
	}

	function onResizeMouseDown(handle: ResizeHandle, e: React.MouseEvent) {
		e.preventDefault();
		e.stopPropagation();

		isResizingRef.current = true;
		resizeHandleRef.current = handle;

		startXRef.current = e.clientX;
		startYRef.current = e.clientY;

		startWidthRef.current = width;
		startHeightRef.current = height;

		startLeftRef.current = location.x;
		startTopRef.current = location.y;
	}

	useEffect(() => {
		function onMouseMove(e: MouseEvent) {
			if (isResizingRef.current && resizeHandleRef.current) {
				const dx = e.clientX - startXRef.current;
				const dy = e.clientY - startYRef.current;

				const handle = resizeHandleRef.current;

				let nextW = startWidthRef.current;
				let nextH = startHeightRef.current;
				let nextLeft = startLeftRef.current;
				let nextTop = startTopRef.current;

				if (handle === "se") {
					nextW = startWidthRef.current + dx;
					nextH = startHeightRef.current + dy;
				} else if (handle === "sw") {
					nextW = startWidthRef.current - dx;
					nextH = startHeightRef.current + dy;
					nextLeft = startLeftRef.current + dx;
				} else if (handle === "ne") {
					nextW = startWidthRef.current + dx;
					nextH = startHeightRef.current - dy;
					nextTop = startTopRef.current + dy;
				} else {
					nextW = startWidthRef.current - dx;
					nextH = startHeightRef.current - dy;
					nextLeft = startLeftRef.current + dx;
					nextTop = startTopRef.current + dy;
				}

				if (nextW < MIN_W) {
					if (handle === "sw" || handle === "nw") {
						nextLeft = startLeftRef.current + (startWidthRef.current - MIN_W);
					}
					nextW = MIN_W;
				}

				if (nextH < MIN_H) {
					if (handle === "ne" || handle === "nw") {
						nextTop = startTopRef.current + (startHeightRef.current - MIN_H);
					}
					nextH = MIN_H;
				}

				setWidth(nextW);
				setHeight(nextH);
				setLocation({ x: nextLeft, y: nextTop });
				return;
			}

			if (!isDraggingRef.current) return;

			const dx = e.clientX - startXRef.current;
			const dy = e.clientY - startYRef.current;

			setLocation({
				x: startPosRef.current.x + dx,
				y: startPosRef.current.y + dy
			});
		}

		function onMouseUpWindow() {
			if (isDraggingRef.current) {
				// Convert screen px back to world coords before sending
				const worldX = (location.x - cameraOffset.x) / cameraScale;
				const worldY = (location.y - cameraOffset.y) / cameraScale;
				setTextBox(textBox.id, {
					...textBox,
					location: {
						x: worldX,
						y: worldY
					}
				});
				socket.emit("update_text_box_location", userId, serverId, textBox.id, worldX, worldY);
			}

			if (isResizingRef.current) {
				// Decide your server unit convention:
				// This emits width/height as pixels-unscaled, which matches your current render behavior.
				socket.emit("update_text_box_size", userId, serverId, textBox.id, width, height);
			}

			isDraggingRef.current = false;
			isResizingRef.current = false;
			resizeHandleRef.current = null;
		}

		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUpWindow);

		return () => {
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", onMouseUpWindow);
		};
	}, [cameraScale, cameraOffset.x, cameraOffset.y, height, location.x, location.y, socket, textBox.id, userId, serverId, width]);

	return (
		<div
			style={{
				position: "absolute",
				left: location.x,
				top: location.y,
				transform: `scale(${cameraScale})`,
				transformOrigin: "top left",
				zIndex: 20
			}}
		>
			<div style={{ position: "relative", width: width, height: height }}>
				<textarea
					ref={textboxRef}
					value={text}
					onChange={updateText}
					onMouseDown={onMouseDown}
					onMouseUp={onMouseUp}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					style={{
						width: "100%",
						height: "100%",
						background: "transparent",
						border: "1px solid black",
						boxSizing: "border-box",
						fontSize: textBox.fontSize,
						padding: 4,
						resize: "none"
					}}
				/>

				{isFocused && (
					<>
						<div
							onMouseDown={(e) => onResizeMouseDown("se", e)}
							style={{
								position: "absolute",
								right: -18,
								bottom: -18,
								width: 12,
								height: 12,
								background: "white",
								border: "1px solid black",
								borderRadius: "50%",
								boxSizing: "border-box",
								zIndex: 30,
								cursor: "nwse-resize"
							}}
						/>
						<div
							onMouseDown={(e) => onResizeMouseDown("ne", e)}
							style={{
								position: "absolute",
								right: -18,
								top: -18,
								width: 12,
								height: 12,
								background: "white",
								border: "1px solid black",
								borderRadius: "50%",
								boxSizing: "border-box",
								zIndex: 30,
								cursor: "nesw-resize"
							}}
						/>
						<div
							onMouseDown={(e) => onResizeMouseDown("sw", e)}
							style={{
								position: "absolute",
								left: -18,
								bottom: -18,
								width: 12,
								height: 12,
								background: "white",
								border: "1px solid black",
								borderRadius: "50%",
								boxSizing: "border-box",
								zIndex: 30,
								cursor: "nesw-resize"
							}}
						/>
						<div
							onMouseDown={(e) => onResizeMouseDown("nw", e)}
							style={{
								position: "absolute",
								left: -18,
								top: -18,
								width: 12,
								height: 12,
								background: "white",
								border: "1px solid black",
								borderRadius: "50%",
								boxSizing: "border-box",
								zIndex: 30,
								cursor: "nwse-resize"
							}}
						/>
					</>
				)}
			</div>
		</div>
	);
}
