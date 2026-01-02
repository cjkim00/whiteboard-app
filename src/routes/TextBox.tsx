// Textbox.tsx
import React, { useEffect, useRef } from "react";
import { point } from "../interface/point";
import { TextBoxDrawObject } from "../interface/drawObject";
import { Socket } from "socket.io-client";

import TextArea from "./TextArea";
import FontSizeInput from "./FontSizeInput";

type TextboxProps = {
	key: string;
	userId: string;
	serverId: string;
	textBox: TextBoxDrawObject;
	socket: Socket;
	rect: DOMRect;
	setTextBox: (id: string, setTextBox: TextBoxDrawObject) => void;
	cameraScale: number;
	cameraOffset: point;
};

export default function Textbox({
	userId,
	serverId,
	textBox,
	setTextBox,
	socket,
	rect,
	cameraScale,
	cameraOffset
}: TextboxProps) {
	const isDraggingRef = useRef<boolean>(false); 
	const dragOffsetWorldRef = useRef<point>({ x: 0, y: 0 });

	const lastSentLocationRef = useRef<point | null>(null);

	const latestTextBoxRef = useRef<TextBoxDrawObject>(textBox);
	latestTextBoxRef.current = textBox;
	const locationTimeoutRef = useRef<number | null>(null);
	const pendingLocationRef = useRef<point | null>(null);

	const leftPx = textBox.location.x * cameraScale + cameraOffset.x;
	const topPx = textBox.location.y * cameraScale + cameraOffset.y;

	function pointsEqual(a: point, b: point) {
		return a.x === b.x && a.y === b.y;
	}

	function getMouseWorld(clientX: number, clientY: number): point {
		const mouseScreen: point = {
			x: clientX - rect.left,
			y: clientY - rect.top
		};

		return {
			x: (mouseScreen.x - cameraOffset.x) / cameraScale,
			y: (mouseScreen.y - cameraOffset.y) / cameraScale
		};
	}

	function onDragMouseDown(e: React.MouseEvent<HTMLDivElement>) {
		e.preventDefault();
		isDraggingRef.current = true;

		const mouseWorld: point = getMouseWorld(e.clientX, e.clientY);

		dragOffsetWorldRef.current = {
			x: mouseWorld.x - textBox.location.x,
			y: mouseWorld.y - textBox.location.y
		};
	}

	function scheduleLocationEmit(objectId: string, nextLocation: point) {
		pendingLocationRef.current = nextLocation;

		if (locationTimeoutRef.current !== null) {
			window.clearTimeout(locationTimeoutRef.current);
		}

		locationTimeoutRef.current = window.setTimeout(() => {
			locationTimeoutRef.current = null;

			const pending = pendingLocationRef.current;
			if (!pending) {
				return;
			}

			const last = lastSentLocationRef.current;
			if (last && pointsEqual(last, pending)) {
				return;
			}

			lastSentLocationRef.current = pending;
			socket.emit("update_text_box_location", userId, serverId, objectId, pending.x, pending.y);
		}, 160);
	}

	useEffect(() => {
		function onWindowMouseMove(e: MouseEvent) {
			if (!isDraggingRef.current) {
				return;
			}

			const mouseWorld: point = getMouseWorld(e.clientX, e.clientY);

			const nextLocation: point = {
				x: mouseWorld.x - dragOffsetWorldRef.current.x,
				y: mouseWorld.y - dragOffsetWorldRef.current.y
			};

			const currentBox = latestTextBoxRef.current;

			if (!pointsEqual(nextLocation, currentBox.location)) {
				setTextBox(currentBox.id, {
					...currentBox,
					location: nextLocation
				});
			}

			scheduleLocationEmit(currentBox.id, nextLocation);
		}

		function onWindowMouseUp() {
			if (!isDraggingRef.current) {
				return;
			}
			isDraggingRef.current = false;

			const currentBox = latestTextBoxRef.current;
			const finalLocation = currentBox.location;

			if (locationTimeoutRef.current !== null) {
				window.clearTimeout(locationTimeoutRef.current);
				locationTimeoutRef.current = null;
			}

			const last = lastSentLocationRef.current;
			if (!last || !pointsEqual(last, finalLocation)) {
				lastSentLocationRef.current = finalLocation;
				socket.emit("update_text_box_location", userId, serverId, currentBox.id, finalLocation.x, finalLocation.y);
			}

			pendingLocationRef.current = null;
		}

		window.addEventListener("mousemove", onWindowMouseMove);
		window.addEventListener("mouseup", onWindowMouseUp);

		return () => {
			window.removeEventListener("mousemove", onWindowMouseMove);
			window.removeEventListener("mouseup", onWindowMouseUp);

			if (locationTimeoutRef.current !== null) {
				window.clearTimeout(locationTimeoutRef.current);
				locationTimeoutRef.current = null;
			}
			pendingLocationRef.current = null;
		};
	}, [cameraScale, cameraOffset.x, cameraOffset.y, rect.left, rect.top, serverId, socket, userId, setTextBox]);

	return (
		<div
			style={{
				position: "absolute",
				left: leftPx,
				top: topPx,
				transform: `scale(${cameraScale})`,
				transformOrigin: "top left",
				zIndex: 20
			}}
		>
			<div
				onMouseDown={onDragMouseDown}
				style={{
					height: 16,
					cursor: "move",
					background: "rgba(0,0,0,0.06)",
					border: "1px solid black",
					borderBottom: "none",
					width: textBox.width
				}}
				title="Drag"
			/>

			<TextArea
				userId={userId}
				serverId={serverId}
				textBox={textBox}
				socket={socket}
				setTextBox={setTextBox}
			/>

			<FontSizeInput
				userId={userId}
				serverId={serverId}
				textBox={textBox}
				socket={socket}
				setTextBox={setTextBox}
			/>
		</div>
	);
}
