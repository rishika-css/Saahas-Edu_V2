import { useEffect, useRef, useCallback, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faSpinner, faBrain } from "@fortawesome/free-solid-svg-icons";
import { useBehaviorLogger } from "../hooks/useBehaviorLogger";
import { useInactivityTracking } from "../hooks/useInactivityTracking";
import { useGazeTracking } from "../hooks/useGazeTracking";

function BehaviorTracker({ studentId, sessionId, onTimerAdjustment, onTrackerReady }) {
  const { logEvent } = useBehaviorLogger(studentId, sessionId);
  const lastSkipTime = useRef(null);
  const skipCountRef = useRef(0);
  const videoRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  const handleIdle = useCallback(async () => {
    const result = await logEvent("idle", { note: "User inactive for 10 seconds" });
    if (result?.timerAdjustment?.adjusted) {
      onTimerAdjustment(result.timerAdjustment.newTime, result.timerAdjustment.reasons);
    }
  }, [logEvent, onTimerAdjustment]);

  const handleGazeAway = useCallback(async () => {
    const result = await logEvent("gaze_away", { note: "Gaze deviated from screen" });
    if (result?.timerAdjustment?.adjusted) {
      onTimerAdjustment(result.timerAdjustment.newTime, result.timerAdjustment.reasons);
    }
  }, [logEvent, onTimerAdjustment]);

  const handleFaceNotDetected = useCallback(async () => {
    const result = await logEvent("face_not_detected", { note: "No face detected" });
    if (result?.timerAdjustment?.adjusted) {
      onTimerAdjustment(result.timerAdjustment.newTime, result.timerAdjustment.reasons);
    }
  }, [logEvent, onTimerAdjustment]);

  const handleReady = useCallback(() => {
    setIsReady(true);
    if (onTrackerReady) onTrackerReady();
  }, [onTrackerReady]);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        const result = await logEvent("tab_switch", { note: "Student switched tab" });
        if (result?.timerAdjustment?.adjusted) {
          onTimerAdjustment(result.timerAdjustment.newTime, result.timerAdjustment.reasons);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [logEvent, onTimerAdjustment]);

  useInactivityTracking(handleIdle, 10000);
  useGazeTracking(handleGazeAway, handleFaceNotDetected, videoRef, handleReady);

  useEffect(() => {
    window.__logRapidSkip = async () => {
      const now = Date.now();
      if (lastSkipTime.current && now - lastSkipTime.current < 2000) {
        skipCountRef.current += 1;
        if (skipCountRef.current >= 2) {
          const result = await logEvent("rapid_skip", { note: "Rapid skipping detected" });
          if (result?.timerAdjustment?.adjusted) {
            onTimerAdjustment(result.timerAdjustment.newTime, result.timerAdjustment.reasons);
          }
          skipCountRef.current = 0;
          lastSkipTime.current = null;
        }
      } else {
        skipCountRef.current = 1;
      }
      lastSkipTime.current = now;
    };
    return () => { window.__logRapidSkip = null; };
  }, [logEvent, onTimerAdjustment]);

  return (
    <div style={{
      position: "fixed",
      bottom: "16px",
      right: "16px",
      zIndex: 999,
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      border: `3px solid ${isReady ? "#5cb85c" : "#f0a500"}`,
      background: "#000"
    }}>
      <div style={{
        background: isReady ? "#5cb85c" : "#f0a500",
        color: "white",
        fontSize: "0.7rem",
        fontWeight: "700",
        padding: "4px 8px",
        textAlign: "center",
        transition: "background 0.3s"
      }}>
        {isReady ? <><FontAwesomeIcon icon={faCamera} /> Tracking Active</> : <><FontAwesomeIcon icon={faSpinner} spin /> Loading Tracker...</>}
      </div>
      <div style={{ position: "relative", width: 160, height: 120 }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          width={160}
          height={120}
          style={{ display: "block" }}
        />
        {!isReady && (
          <div style={{
            position: "absolute",
            top: 0, left: 0,
            width: "100%", height: "100%",
            background: "rgba(0,0,0,0.7)",
            color: "white",
            fontSize: "0.75rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "8px",
            gap: "8px"
          }}>
            <div style={{ fontSize: "1.5rem" }}><FontAwesomeIcon icon={faBrain} /></div>
            <div>Loading AI model...</div>
            <div style={{ fontSize: "0.65rem", opacity: 0.8 }}>This may take a few seconds</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BehaviorTracker;