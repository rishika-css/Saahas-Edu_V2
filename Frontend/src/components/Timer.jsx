import { useEffect, useRef } from "react";

function Timer({ timeRemaining, setTimeRemaining, onTimeUp }) {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeUp();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [timeRemaining <= 0]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isLow = timeRemaining <= 60;
  const isCritical = timeRemaining <= 30;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "10px 20px",
      borderRadius: "12px",
      background: isCritical ? "#e74c3c" : isLow ? "#f0a500" : "#f4845f",
      color: "white",
      fontWeight: "700",
      fontSize: "1.2rem",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      transition: "background 0.3s"
    }}>
      ⏱ {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      {isLow && !isCritical && <span style={{ fontSize: "0.8rem", fontWeight: 400 }}>Low time!</span>}
      {isCritical && <span style={{ fontSize: "0.8rem", fontWeight: 400 }}>Hurry!</span>}
    </div>
  );
}

export default Timer;