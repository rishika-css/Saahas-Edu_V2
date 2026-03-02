import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faSmile, faMeh, faDumbbell, faBed, faEye, faCamera, faForward, faExchangeAlt, faClock, faBullseye, faCheckCircle, faTimesCircle, faRedo, faBrain, faClipboardList } from '@fortawesome/free-solid-svg-icons';

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

  const getScoreIcon = () => {
    if (score >= 80) return <FontAwesomeIcon icon={faStar} style={{ color: "#a855f7" }} />;
    if (score >= 60) return <FontAwesomeIcon icon={faSmile} style={{ color: "#ec4899" }} />;
    if (score >= 40) return <FontAwesomeIcon icon={faMeh} style={{ color: "white" }} />;
    return <FontAwesomeIcon icon={faDumbbell} style={{ color: "rgba(255,255,255,0.5)" }} />;
  };

  const getScoreMessage = () => {
    if (score >= 80) return "Excellent work!";
    if (score >= 60) return "Good job!";
    if (score >= 40) return "Keep practicing!";
    return "Don't give up!";
  };

  const insights = [];
  if (behaviorSummary) {
    if (behaviorSummary.idleCount >= 3) insights.push({ icon: <FontAwesomeIcon icon={faBed} />, text: `You paused frequently — some questions may have been challenging.` });
    if (behaviorSummary.gazeAwayCount >= 3) insights.push({ icon: <FontAwesomeIcon icon={faEye} />, text: `Your gaze moved away from the screen several times.` });
    if (behaviorSummary.faceNotDetectedCount >= 2) insights.push({ icon: <FontAwesomeIcon icon={faCamera} />, text: `You moved away from the camera a few times.` });
    if (behaviorSummary.rapidSkipCount >= 3) insights.push({ icon: <FontAwesomeIcon icon={faForward} />, text: `You skipped through some questions quickly.` });
    if (behaviorSummary.tabSwitchCount >= 2) insights.push({ icon: <FontAwesomeIcon icon={faExchangeAlt} />, text: `You switched tabs during the test.` });
    if (behaviorSummary.timerAdjustments > 0) insights.push({ icon: <FontAwesomeIcon icon={faClock} />, text: `Your timer was adjusted ${behaviorSummary.timerAdjustments} time(s) based on your activity.` });
    if (insights.length === 0) insights.push({ icon: <FontAwesomeIcon icon={faBullseye} />, text: "Great focus throughout the test! Well done." });
  }

  return (
    <div className="page-top" style={{ paddingBottom: "48px" }}>
      <div style={{ width: "100%", maxWidth: "680px" }}>

        {/* Score Card */}
        <div className="card" style={{ textAlign: "center", marginBottom: "24px", background: "#111827", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}>
          <div style={{ fontSize: "4rem", marginBottom: "8px" }}>{getScoreIcon()}</div>
          <h1 style={{ fontSize: "2.5rem", color: "#a855f7" }}>{score}%</h1>
          <h2 style={{ color: "white", marginBottom: "4px" }}>{getScoreMessage()}</h2>
          <p style={{ color: "rgba(255,255,255,0.6)" }}>
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
                background: "rgba(255,255,255,0.05)",
                borderRadius: "12px",
                padding: "16px 24px",
                minWidth: "80px"
              }}>
                <div style={{ fontSize: "1.8rem", fontWeight: "700", color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Behavior Insights */}
        {insights.length > 0 && (
          <div className="card" style={{ marginBottom: "24px", background: "#111827", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}>
            <h2 style={{ marginBottom: "16px", color: "#a855f7" }}><FontAwesomeIcon icon={faBrain} className="mr-2" /> Behavior Insights</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {insights.map((insight, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "10px",
                  fontSize: "0.95rem",
                  color: "white"
                }}>
                  <span style={{ fontSize: "1.2rem", color: "#a855f7" }}>{insight.icon}</span>
                  <span>{insight.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Question Review */}
        <div className="card" style={{ marginBottom: "24px", background: "#111827", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}>
          <h2 style={{ marginBottom: "16px", color: "#a855f7" }}><FontAwesomeIcon icon={faClipboardList} className="mr-2" /> Question Review</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {questionResults && questionResults.map((r, i) => (
              <div key={i} style={{
                padding: "16px",
                borderRadius: "12px",
                background: r.isCorrect ? "rgba(46, 204, 113, 0.1)" : "rgba(231, 76, 60, 0.1)",
                border: `1.5px solid ${r.isCorrect ? "#2ecc71" : "#e74c3c"}`
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px"
                }}>
                  <span style={{ fontWeight: "600", color: "white" }}>Q{i + 1}. {r.question}</span>
                  <span>{r.isCorrect ? <FontAwesomeIcon icon={faCheckCircle} style={{ color: "#2ecc71" }} /> : <FontAwesomeIcon icon={faTimesCircle} style={{ color: "#e74c3c" }} />}</span>
                </div>
                {!r.isCorrect && (
                  <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.6)" }}>
                    <span style={{ color: "#e74c3c" }}>Your answer: {r.selected}</span>
                    <span style={{ marginLeft: "16px", color: "#2ecc71" }}>Correct: {r.correct}</span>
                  </div>
                )}
                {r.timeSpent > 0 && (
                  <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>
                    <FontAwesomeIcon icon={faClock} className="mr-1" /> Time spent: {r.timeSpent}s
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
            Take Another Test <FontAwesomeIcon icon={faRedo} className="ml-2" />
          </button>
        </div>

      </div>
    </div>
  );
}

export default Results;