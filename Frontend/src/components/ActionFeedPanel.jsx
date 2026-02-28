import { useState, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEye, faKeyboard, faMoon, faShuffle, faForwardFast,
    faFaceGrinWide, faCircle, faStream
} from "@fortawesome/free-solid-svg-icons";

const ICONS = {
    gaze_away: { icon: faEye, color: "#ef4444", label: "Gaze Shifted" },
    idle: { icon: faMoon, color: "#f59e0b", label: "Idle Detected" },
    tab_switch: { icon: faShuffle, color: "#8b5cf6", label: "Tab Switch" },
    rapid_skip: { icon: faForwardFast, color: "#ec4899", label: "Rapid Skip" },
    face_not_detected: { icon: faFaceGrinWide, color: "#6b7280", label: "Face Not Found" },
    fast_input: { icon: faKeyboard, color: "#3b82f6", label: "Fast Input" },
};

const MAX_ITEMS = 8;

export default function ActionFeedPanel() {
    const [actions, setActions] = useState([]);
    const idRef = useRef(0);

    const addAction = useCallback((type, detail = "") => {
        const meta = ICONS[type] || { icon: faCircle, color: "#888", label: type };
        const now = new Date();
        const ts = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        setActions(prev => [
            { id: idRef.current++, type, label: meta.label, icon: meta.icon, color: meta.color, ts, detail },
            ...prev,
        ].slice(0, MAX_ITEMS));
    }, []);

    return {
        addAction,
        Panel: (
            <div style={{
                background: "rgba(255,255,255,0.95)", borderRadius: 14,
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)", padding: "14px 16px",
                maxHeight: 340, overflowY: "auto", minWidth: 220,
            }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: "#3d2c1e", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
                    <FontAwesomeIcon icon={faStream} /> Live Actions
                </h4>
                {actions.length === 0 ? (
                    <p style={{ fontSize: 12, color: "#b5a08a", textAlign: "center", padding: "16px 0" }}>No actions detected yet</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {actions.map(a => (
                            <div key={a.id} style={{
                                display: "flex", alignItems: "center", gap: 8,
                                padding: "6px 10px", borderRadius: 10,
                                background: `${a.color}12`, fontSize: 12,
                                animation: "fadeIn 0.3s ease",
                            }}>
                                <FontAwesomeIcon icon={a.icon} style={{ color: a.color, fontSize: 13, width: 16 }} />
                                <span style={{ fontWeight: 700, color: "#3d2c1e", flex: 1 }}>{a.label}</span>
                                <span style={{ fontSize: 10, color: "#9ca3af", whiteSpace: "nowrap" }}>{a.ts}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        ),
    };
}
