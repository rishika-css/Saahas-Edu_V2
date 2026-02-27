function QuestionCard({ question, selectedAnswer, onAnswer }) {
  if (!question) return null;

  const optionLabels = ["A", "B", "C", "D"];

  return (
    <div className="card" style={{ width: "100%", maxWidth: "680px" }}>
      {/* Question type & difficulty badge */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {question.type && (
          <span style={{
            background: "#fff0e8",
            color: "#f4845f",
            padding: "4px 12px",
            borderRadius: "999px",
            fontSize: "0.8rem",
            fontWeight: 600
          }}>
            {question.type}
          </span>
        )}
        {question.difficulty && (
          <span style={{
            background: "#fff0e8",
            color: "#d9623f",
            padding: "4px 12px",
            borderRadius: "999px",
            fontSize: "0.8rem",
            fontWeight: 600
          }}>
            Level {question.difficulty}
          </span>
        )}
      </div>

      {/* Question content */}
      <p style={{
        fontSize: "1.2rem",
        fontWeight: "600",
        color: "#3d2c1e",
        marginBottom: "24px",
        lineHeight: "1.6"
      }}>
        {question.content}
      </p>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {question.options && question.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          return (
            <button
              key={index}
              onClick={() => onAnswer(option)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px 20px",
                borderRadius: "12px",
                border: isSelected ? "2px solid #f4845f" : "2px solid #f0ddd0",
                background: isSelected ? "#fff0e8" : "#ffffff",
                color: "#3d2c1e",
                fontSize: "1rem",
                fontWeight: isSelected ? "600" : "400",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: isSelected ? "0 2px 8px rgba(244,132,95,0.2)" : "none"
              }}
            >
              <span style={{
                minWidth: "32px",
                height: "32px",
                borderRadius: "50%",
                background: isSelected ? "#f4845f" : "#f0ddd0",
                color: isSelected ? "white" : "#7a5c4a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "0.9rem"
              }}>
                {optionLabels[index]}
              </span>
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuestionCard;