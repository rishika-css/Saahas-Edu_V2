import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Results() {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const studentName = sessionStorage.getItem("studentName");

  useEffect(() => {
    const data = sessionStorage.getItem("results");
    if (!data) { navigate("/"); return; }
    setResults(JSON.parse(data));
  }, []);

  if (!results) return null;

  const { score, correct, total, behaviorSummary, results: questionResults } = results;

  const getScoreEmoji = () => {
    if (score >= 80) return "🌟";
    if (score >= 60) return "😊";
    if (score >= 40) return "🙂";
    return "💪";
  };

  const getScoreMessage = () => {
    if (score >= 80) return "Excellent work!";
    if (score >= 60) return "Good job!";
    if (score >= 40) return "Keep practicing!";
    return "Don't give up!";
  };

  const insights = [];
  if (behaviorSummary) {
    if (behaviorSummary.idleCount >= 3) insights.push({ icon: "😴", text: `You paused frequently — some questions may have been challenging.` });
    if (behaviorSummary.gazeAwayCount >= 3) insights.push({ icon: "👀", text: `Your gaze moved away from the screen several times.` });
    if (behaviorSummary.faceNotDetectedCount >= 2) insights.push({ icon: "📷", text: `You moved away from the camera a few times.` });
    if (behaviorSummary.rapidSkipCount >= 3) insights.push({ icon: "⏩", text: `You skipped through some questions quickly.` });
    if (behaviorSummary.tabSwitchCount >= 2) insights.push({ icon: "🔀", text: `You switched tabs during the test.` });
    if (behaviorSummary.timerAdjustments > 0) insights.push({ icon: "⏱", text: `Your timer was adjusted ${behaviorSummary.timerAdjustments} time(s) based on your activity.` });
    if (insights.length === 0) insights.push({ icon: "🎯", text: "Great focus throughout the test! Well done." });
  }

  return (
    <div className="page-top" style={{ paddingBottom: "48px" }}>
      <div style={{ width: "100%", maxWidth: "680px" }}>

        {/* Score Card */}
        <div className="card" style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "4rem", marginBottom: "8px" }}>{getScoreEmoji()}</div>
          <h1 style={{ fontSize: "2.5rem", color: "#f4845f" }}>{score}%</h1>
          <h2 style={{ color: "#3d2c1e", marginBottom: "4px" }}>{getScoreMessage()}</h2>
          <p style={{ color: "#7a5c4a" }}>
            {studentName ? `${studentName}, you` : "You"} answered {correct} out of {total} questions correctly.
          </p>

          {/* Stats Row */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            marginTop: "24px",
            flexWrap: "wrap"
          }}>
            {[
              { label: "Correct", value: correct, color: "#5cb85c" },
              { label: "Wrong", value: total - correct, color: "#e74c3c" },
              { label: "Total", value: total, color: "#f4845f" },
            ].map((stat) => (
              <div key={stat.label} style={{
                background: "#fff8f0",
                borderRadius: "12px",
                padding: "16px 24px",
                minWidth: "80px"
              }}>
                <div style={{ fontSize: "1.8rem", fontWeight: "700", color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: "0.85rem", color: "#7a5c4a" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Behavior Insights */}
        {insights.length > 0 && (
          <div className="card" style={{ marginBottom: "24px" }}>
            <h2 style={{ marginBottom: "16px" }}>🧠 Behavior Insights</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {insights.map((insight, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "12px 16px",
                  background: "#fff8f0",
                  borderRadius: "10px",
                  fontSize: "0.95rem",
                  color: "#3d2c1e"
                }}>
                  <span style={{ fontSize: "1.2rem" }}>{insight.icon}</span>
                  <span>{insight.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Question Review */}
        <div className="card" style={{ marginBottom: "24px" }}>
          <h2 style={{ marginBottom: "16px" }}>📋 Question Review</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {questionResults && questionResults.map((r, i) => (
              <div key={i} style={{
                padding: "16px",
                borderRadius: "12px",
                background: r.isCorrect ? "#f0fff0" : "#fff0f0",
                border: `1.5px solid ${r.isCorrect ? "#5cb85c" : "#e74c3c"}`
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px"
                }}>
                  <span style={{ fontWeight: "600", color: "#3d2c1e" }}>Q{i + 1}. {r.question}</span>
                  <span>{r.isCorrect ? "✅" : "❌"}</span>
                </div>
                {!r.isCorrect && (
                  <div style={{ fontSize: "0.9rem", color: "#7a5c4a" }}>
                    <span style={{ color: "#e74c3c" }}>Your answer: {r.selected}</span>
                    <span style={{ marginLeft: "16px", color: "#5cb85c" }}>Correct: {r.correct}</span>
                  </div>
                )}
                {r.timeSpent > 0 && (
                  <div style={{ fontSize: "0.8rem", color: "#aaa", marginTop: "4px" }}>
                    ⏱ Time spent: {r.timeSpent}s
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            className="btn-primary"
            onClick={() => {
              sessionStorage.clear();
              navigate("/");
            }}
          >
            Take Another Test 🔄
          </button>
        </div>

      </div>
    </div>
  );
}

export default Results;