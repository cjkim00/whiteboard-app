type ShareBoardProps = {
    getRoomURL: () => void;
}

export default function ShareBoard({getRoomURL}: ShareBoardProps) {
    return (
        <div
            className="connectContainer"
            style={{
                position: "fixed",
                top: "20px",
                right: "20px",
                zIndex: 10,
                backgroundColor: "white",

            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 8,
                    alignContent: "start",
                    backgroundColor: "white",
                    border: "1px solid black",
                    borderRadius: "3px",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "2px 8px"
                }}
            >
                <p>Connect with others</p>
                <button className="pill-button" onClick={getRoomURL}>
                    Share board
                </button>
            </div>
        </div>
    )
}