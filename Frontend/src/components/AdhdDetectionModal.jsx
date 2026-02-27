function AdhdDetectionModal({ onConfirm, onDismiss }) {
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0,
      width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.5)",
      zIndex: 4000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px"
    }}>
      <div style={{
        background: "white",
        borderRadius: "20px",
        padding: "32px",
        maxWidth: "420px",
        width: "100%",
        textAlign: "center",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
      }}>
        <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🎯</div>
        <h2 style={{ color: "#d9623f", marginBottom: "8px" }}>
          We noticed something!
        </h2>
        <p style={{ color: "#7a5c4a", marginBottom: "24px", lineHeight: "1.7" }}>
          Your mouse movement suggests you might benefit from
          <strong> ADHD Focus Mode</strong>. It dims everything except
          where your cursor is, helping you concentrate better.
          Would you like to turn it on?
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            className="btn-secondary"
            onClick={onDismiss}
            style={{ minWidth: "120px" }}
          >
            No thanks
          </button>
          <button
            className="btn-primary"
            onClick={onConfirm}
            style={{ minWidth: "120px" }}
          >
            Yes, turn it on ✨
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdhdDetectionModal;