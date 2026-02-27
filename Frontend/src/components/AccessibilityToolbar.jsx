import { useState } from "react";
import { useAccessibility } from "../context/AccessibilityContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSquare, faBookOpen, faBullseye, faLightbulb, faXmark, faUniversalAccess } from '@fortawesome/free-solid-svg-icons';

function ToggleSwitch({ label, icon, value, onChange, description }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      padding: "12px",
      borderRadius: "12px",
      background: value ? "#fff0e8" : "#f8f8f8",
      border: `2px solid ${value ? "#f4845f" : "#eee"}`,
      transition: "all 0.2s"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <span style={{ fontWeight: "600", fontSize: "0.95rem" }}>
          {icon} {label}
        </span>
        <div
          onClick={() => onChange(!value)}
          style={{
            width: "44px",
            height: "24px",
            borderRadius: "999px",
            background: value ? "#f4845f" : "#ddd",
            position: "relative",
            cursor: "pointer",
            transition: "background 0.2s",
            flexShrink: 0
          }}
        >
          <div style={{
            position: "absolute",
            top: "3px",
            left: value ? "23px" : "3px",
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            background: "white",
            transition: "left 0.2s",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)"
          }} />
        </div>
      </div>
      {description && (
        <p style={{ fontSize: "0.75rem", color: "#999", margin: 0 }}>{description}</p>
      )}
    </div>
  );
}

function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    highContrast, setHighContrast,
    dyslexiaFont, setDyslexiaFont,
    adhdFocus, setAdhdFocus,
    darkMode, setDarkMode,
  } = useAccessibility();

  return (
    <>
      {/* Slide-in trigger button */}
      <button
        className="a11y-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Accessibility Options"
      >
        ♿ ACCESS
      </button>

      {/* Side panel */}
      <div className={`a11y-panel ${isOpen ? "open" : ""}`}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px"
        }}>
          <h2 style={{ margin: 0, fontSize: "1.1rem", color: "#d9623f" }}>
            ♿ Accessibility
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.3rem",
              cursor: "pointer",
              color: "#999",
              padding: "4px"
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <p style={{ fontSize: "0.8rem", color: "#999", margin: "0 0 8px 0" }}>
          Customize your test experience
        </p>

        <ToggleSwitch
          label="Dark Mode"
          icon={<FontAwesomeIcon icon={faMoon} />}
          value={darkMode}
          onChange={setDarkMode}
          description="Easier on the eyes in low light"
        />

        <ToggleSwitch
          label="High Contrast"
          icon="⬛"
          value={highContrast}
          onChange={setHighContrast}
          description="Bold black & white for visibility"
        />

        <ToggleSwitch
          label="Dyslexia Font"
          icon={<FontAwesomeIcon icon={faBookOpen} />}
          value={dyslexiaFont}
          onChange={setDyslexiaFont}
          description="Lexend font — easier to read"
        />

        <ToggleSwitch
          label="ADHD Focus Mode"
          icon={<FontAwesomeIcon icon={faBullseye} />}
          value={adhdFocus}
          onChange={setAdhdFocus}
          description="Blurs everything except where you hover"
        />

        <div style={{
          marginTop: "8px",
          padding: "12px",
          background: "#fff8f0",
          borderRadius: "12px",
          fontSize: "0.8rem",
          color: "#7a5c4a",
          lineHeight: "1.6"
        }}>
          <FontAwesomeIcon icon={faLightbulb} className="mr-1" /> These settings are automatically saved during your test session.
        </div>
      </div>

      {/* Backdrop when panel is open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            top: 0, left: 0,
            width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.2)",
            zIndex: 2999
          }}
        />
      )}
    </>
  );
}

export default AccessibilityToolbar;