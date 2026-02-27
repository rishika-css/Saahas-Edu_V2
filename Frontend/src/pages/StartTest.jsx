import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

function StartTest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    startTest();
  }, []);

  const startTest = async () => {
    try {
      const studentId = user.id || user._id;
      const testRes = await API.post("/tests/start", { studentId });

      sessionStorage.setItem("studentId", studentId);
      sessionStorage.setItem("studentName", user.name);
      sessionStorage.setItem("sessionId", testRes.data.sessionId);
      sessionStorage.setItem("totalQuestions", testRes.data.totalQuestions);
      sessionStorage.setItem("timeAlloted", testRes.data.timeAlloted);

      navigate("/test");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="page">
        <div className="card" style={{ width: "100%", maxWidth: "480px", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>❌</div>
          <h2 style={{ color: "#e74c3c" }}>Failed to start test</h2>
          <p style={{ color: "#7a5c4a", marginBottom: "24px" }}>{error}</p>
          <button className="btn-primary" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card" style={{ width: "100%", maxWidth: "480px", textAlign: "center" }}>
        <div style={{ fontSize: "4rem", marginBottom: "16px" }}>🧠</div>
        <h2 style={{ color: "#d9623f" }}>Setting up your test...</h2>
        <p style={{ color: "#7a5c4a", marginBottom: "24px" }}>
          Welcome {user?.name}! Preparing your adaptive test.
        </p>
        <div style={{
          width: "200px",
          height: "8px",
          background: "#f0ddd0",
          borderRadius: "999px",
          overflow: "hidden",
          margin: "0 auto"
        }}>
          <div style={{
            height: "100%",
            width: "60%",
            background: "linear-gradient(90deg, #f4845f, #f9b49a)",
            borderRadius: "999px",
            animation: "pulse 1.5s ease-in-out infinite"
          }} />
        </div>
      </div>
    </div>
  );
}

export default StartTest;