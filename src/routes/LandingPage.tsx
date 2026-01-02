import { useNavigate } from "react-router-dom";
export default function LandingPage() {
    const navigate = useNavigate();
    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f5f5f5"
            }}
        >
            <h1>Collaborative Whiteboard</h1>
            <p>Draw, write, and collaborate in real time</p>

            <button
                onClick={() => navigate("/board")}
                style={{
                    padding: "12px 24px",
                    fontSize: 16,
                    cursor: "pointer"
                }}
            >
                Open Whiteboard
            </button>
        </div>
    );
}