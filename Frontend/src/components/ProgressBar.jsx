function ProgressBar({ current, total }) {
  const percent = Math.round((current / total) * 100);

  return (
    <div style={{ width: "100%", marginBottom: "16px" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "6px",
        fontSize: "0.9rem",
        color: "#7a5c4a"
      }}>
        <span>Question {current} of {total}</span>
        <span>{percent}% complete</span>
      </div>
      <div style={{
        width: "100%",
        height: "12px",
        background: "#f0ddd0",
        borderRadius: "999px",
        overflow: "hidden"
      }}>
        <div style={{
          width: `${percent}%`,
          height: "100%",
          background: "linear-gradient(90deg, #f4845f, #f9b49a)",
          borderRadius: "999px",
          transition: "width 0.4s ease"
        }} />
      </div>
    </div>
  );
}

export default ProgressBar;