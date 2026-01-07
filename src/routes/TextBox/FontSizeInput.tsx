// FontSizeInput.tsx
import React, { ChangeEvent, useRef } from "react";
import { TextBoxDrawObject } from "../../interface/drawObject";
import { Socket } from "socket.io-client";

type FontSizeInputProps = {
	userId: string;
	serverId: string;
	textBox: TextBoxDrawObject;
	socket: Socket;
	setTextBox: (id: string, setTextBox: TextBoxDrawObject) => void;
};

export default function FontSizeInput({
	userId,
	serverId,
	textBox,
	socket,
	setTextBox
}: FontSizeInputProps) {
	const lastSentFontRef = useRef<number | null>(null);

	function updateFontSize(e: ChangeEvent<HTMLInputElement>) {
		const newFontSize: number = Number(e.target.value);

		if (lastSentFontRef.current !== newFontSize) {
			lastSentFontRef.current = newFontSize;
			socket.emit("update_text_box_font", userId, serverId, textBox.id, newFontSize);
		}

		if (textBox.fontSize !== newFontSize) {
			setTextBox(textBox.id, { ...textBox, fontSize: newFontSize });
		}
	}

	return (
		<input
			type="number"
			value={textBox.fontSize}
			min={8}
			max={72}
			step={1}
			onChange={updateFontSize}
			style={{
				position: "absolute",
				right: -30,
				bottom: -30,
				width: 35,
				height: 30,
				border: "1px solid black",
				background: "white",
				fontSize: 12
			}}
		/>
	);
}
