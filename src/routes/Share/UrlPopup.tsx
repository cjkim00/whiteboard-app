import { useEffect, useState } from "react";
import copyIcon from "../../icons/copy-icon.png";
import "../../css/pill-button.css";
import "../../css/copy-button.css";
import "../../css/url-popup.css";
type UrlProp = {
    url: string,
    width: number,
    height: number,
    setPopupState: (state: boolean) => void;
}
function UrlPopup({ url, width, height, setPopupState }: UrlProp) {
    const [showLinkCopiedText, setShowLinkState] = useState<boolean>(false);
    function closePopup() {
        setPopupState(false);
    }

    function copyToClipboard() {
        navigator.clipboard.writeText(url);
        setShowLinkState(true);
        setTimeout(() => {
            setShowLinkState(false);
        }, 5000);
    }
    return (
        <div
            style={{
                position: "absolute",
                width: width,
                height: height,
                zIndex: 100

            }}>
            <div
                style={{
                    position: "relative",
                    width,
                    height,
                    border: "2px solid black"
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.5)"
                    }}
                    onClick={closePopup}
                />

                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 500,
                        height: 300,
                        backgroundColor: "white",
                        zIndex: 1,
                        border: "none",
                        borderRadius: "15px",
                        //alignContent: "center",
                        paddingLeft: "5%",
                        paddingRight: "5%",
                        paddingTop: "2%"
                    }}
                >
                    <h1
                        style={{
                            textAlign: "center"
                        }}
                    >
                        Share this link and collaborate with others
                    </h1>
                    <div
                        style={{
                            backgroundColor: "#edebeb",
                            display: "flex",
                            flexDirection: "row",
                            border: "1px solid black",
                            borderRadius: "25px",
                            gap: 8,
                            justifyContent: "center",
                            alignItems: "center",

                        }}
                    >
                        <p
                            style={{

                                textAlign: "center"
                            }}
                        >{url.length > 50 ? url.slice(0, 50) + "…" : url}</p>
                        <button
                            className="copy-button"
                            onClick={copyToClipboard}
                        >
                            <img
                                src={copyIcon}
                                alt="rectangle tool"
                                style={{
                                    width: 25,
                                    height: 25,
                                    objectFit: "contain",
                                    pointerEvents: "none"
                                }}
                            />
                        </button>
                    </div>


                    <p
                        className="copy-text"
                        style={{
                            opacity: showLinkCopiedText ? 1 : 0,
                            transform: showLinkCopiedText ? "translateY(0)" : "translateY(4px)",
                            transition: "opacity 300ms ease, transform 300ms ease",
                            textAlign: "center"
                        }}
                    >
                        Link Copied
                    </p>

                    <button
                        className="pill-button"
                        onClick={closePopup}
                        style={{
                            position: "absolute",
                            bottom: 16,
                            right: 16
                        }}
                    >Close</button>
                </div>
            </div>
        </div>
    );
}

export default UrlPopup;

