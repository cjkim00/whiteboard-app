// TextAreaBox.tsx
import React, { ChangeEvent, useEffect, useRef } from "react";
import { TextBoxDrawObject } from "../interface/drawObject";
import { Socket } from "socket.io-client";

type TextAreaProps = {
	userId: string;
	serverId: string;
	textBox: TextBoxDrawObject;
	socket: Socket;
	setTextBox: (id: string, setTextBox: TextBoxDrawObject) => void;
};

export default function TextArea({
	userId,
	serverId,
	textBox,
	socket,
	setTextBox
}: TextAreaProps) {
	const textboxRef = useRef<HTMLTextAreaElement | null>(null);

	const lastSentTextRef = useRef<string | null>(null);

	const resizeTimeoutRef = useRef<number | null>(null);
	const lastSentSizeRef = useRef<{ w: number; h: number } | null>(null);
	const hasInitializedSizeRef = useRef<boolean>(false);

	const latestTextBoxRef = useRef<TextBoxDrawObject>(textBox);
	latestTextBoxRef.current = textBox;
	function sizesEqual(a: { w: number; h: number }, b: { w: number; h: number }) {
		return a.w === b.w && a.h === b.h;
	}

	function updateText(e: ChangeEvent<HTMLTextAreaElement>) {
		const newText: string = e.target.value;

		if (lastSentTextRef.current !== newText) {
			lastSentTextRef.current = newText;
			socket.emit("update_text_box_text", userId, serverId, textBox.id, newText);
		}

		if (textBox.text !== newText) {
			setTextBox(textBox.id, { ...textBox, text: newText });
		}
	}


	useEffect(() => {
		if (!hasInitializedSizeRef.current) {
			lastSentSizeRef.current = { w: textBox.width, h: textBox.height };
		}
	}, [textBox.id, textBox.width, textBox.height]);

	useEffect(() => {
		const box = textboxRef.current;
		if (!box) {
			return;
		}

		const commit = () => {
			const element = textboxRef.current;
			if (!element) {
				return;
			}

			const measuredW = element.offsetWidth;
			const measuredH = element.offsetHeight;

			const worldW = Math.max(20, Math.round(measuredW));
			const worldH = Math.max(20, Math.round(measuredH));

			const currentBox = latestTextBoxRef.current;
			const nextSize = { w: worldW, h: worldH };

			if (!hasInitializedSizeRef.current) {
				hasInitializedSizeRef.current = true;
				lastSentSizeRef.current = { w: currentBox.width, h: currentBox.height };
				return;
			}

			if (currentBox.width !== worldW || currentBox.height !== worldH) {
				setTextBox(currentBox.id, {
					...currentBox,
					width: worldW,
					height: worldH
				});
			}

			const last = lastSentSizeRef.current;
			if (!last || !sizesEqual(last, nextSize)) {
				lastSentSizeRef.current = nextSize;
				socket.emit("update_text_box_size", userId, serverId, currentBox.id, worldW, worldH);
			}
		};

		const observer = new ResizeObserver(() => {
			if (resizeTimeoutRef.current !== null) {
				window.clearTimeout(resizeTimeoutRef.current);
			}

			resizeTimeoutRef.current = window.setTimeout(() => {
				resizeTimeoutRef.current = null;
				commit();
			}, 160);
		});

		observer.observe(box);

		return () => {
			observer.disconnect();

			if (resizeTimeoutRef.current !== null) {
				window.clearTimeout(resizeTimeoutRef.current);
				resizeTimeoutRef.current = null;
			}
		};
	}, [serverId, socket, userId, setTextBox]);

	return (
		<textarea
			ref={textboxRef}
			value={textBox.text}
			onChange={updateText}
			style={{
				width: textBox.width,
				height: textBox.height,
				background: "transparent",
				border: "1px solid black",
				boxSizing: "border-box",
				fontSize: textBox.fontSize,
				padding: 4,
				resize: "both"
			}}
		/>
	);
}
