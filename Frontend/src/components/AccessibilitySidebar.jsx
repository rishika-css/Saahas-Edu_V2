/* ================================================================
  AccessibilitySidebar.jsx
  ================================================================
  Drop-in sidebar component for any page in the Saahas React app.
  Integrates the useBehaviourAI hook — auto-detects ADHD, Dyslexia,
  and Motor disability, applies classes to <body>, updates toggles,
  and shows stacked toast notifications.

  USAGE (add to any page):
    import AccessibilitySidebar from "../components/AccessibilitySidebar";
    // inside return:
    <AccessibilitySidebar />

  Or use the withAccessibility HOC at the bottom of this file:
    export default withAccessibility(YourPage);
================================================================ */

import { useState, useEffect, useRef, useCallback } from "react";
import useBehaviourAI from "../hooks/useBehaviourAI";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faBullseye, faBookOpen, faMouse, faFaceFrown, faMoon, faCircle, faBrain, faVolumeHigh, faGear, faXmark } from '@fortawesome/free-solid-svg-icons';

/* ── Toast Queue ─────────────────────────────────────────────── */
function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex flex-col-reverse gap-3 items-center pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{ background: `linear-gradient(135deg, ${toast.c1}, ${toast.c2})` }}
          className="flex items-center gap-3 px-6 py-3.5 rounded-full text-white font-bold text-sm
                      shadow-2xl whitespace-nowrap pointer-events-auto
                      animate-[slideUp_0.4s_ease_both]"
        >
          <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black tracking-wide">
            {toast.icon} AI Detected
          </span>
          <span className="text-white/90">{toast.label}</span>
          <span className="text-white/60 text-xs">· {toast.pct}% confidence</span>
        </div>
      ))}
    </div>
  );
}

/* ── Toggle Switch ───────────────────────────────────────────── */
function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent ${checked
        ? "bg-gradient-to-r from-blue-500 to-indigo-500"
        : "bg-white/10"
        }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${checked ? "left-7" : "left-1"
          }`}
      />
    </button>
  );
}

/* ── Sidebar Tool Row ────────────────────────────────────────── */
function ToolRow({ icon, label, checked, onChange }) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3.5 rounded-2xl mb-2.5 transition-all duration-300 border ${checked
        ? "bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-500/10"
        : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10 hover:-translate-x-1"
        }`}
    >
      <span className="flex items-center gap-3 text-sm font-semibold text-white/80">
        <span className="text-lg">{icon}</span>
        {label}
      </span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

/* ── AI Badge ────────────────────────────────────────────────── */
function AIBadge({ status, active, scores }) {
  return (
    <div className="mb-5 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
      <p className="text-[10px] font-black tracking-[0.2em] uppercase text-white/30 mb-2">
        <FontAwesomeIcon icon={faRobot} className="mr-1" /> AI Behaviour Engine
      </p>
      <div className={`flex items-center gap-2 text-xs font-bold ${active ? "text-emerald-400" : "text-white/40"}`}>
        <span
          className={`w-2 h-2 rounded-full ${active ? "bg-emerald-400 animate-pulse" : "bg-white/20"}`}
        />
        {status}
      </div>
      {scores && (
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {[
            { key: "adhd", label: "ADHD", color: "#3b82f6" },
            { key: "dyslexia", label: "Dyslexia", color: "#22c55e" },
            { key: "motor", label: "Motor", color: "#ef4444" },
            { key: "anxiety", label: "Anxiety", color: "#f59e0b" },
          ].map(({ key, label, color }) => (
            <div key={key} className="text-center">
              <div className="text-[9px] text-white/30 mb-1 uppercase tracking-wider">{label}</div>
              <div
                className="h-1 rounded-full bg-white/5 overflow-hidden"
                title={`${Math.round((scores[key] || 0) * 100)}%`}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((scores[key] || 0) * 100)}%`, background: color }}
                />
              </div>
              <div className="text-[9px] font-bold mt-0.5" style={{ color }}>
                {Math.round((scores[key] || 0) * 100)}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================
  MAIN SIDEBAR COMPONENT
================================================================ */
export default function AccessibilitySidebar() {
  const [open, setOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [aiStatus, setAiStatus] = useState("Warming up…");
  const [aiActive, setAiActive] = useState(false);
  const [aiScores, setAiScores] = useState(null);

  /* Accessibility state */
  const [settings, setSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("saahas_a11y") || "{}");
    } catch { return {}; }
  });

  const textSize = settings.textSize || 16;

  /* ── Apply body classes whenever settings change ── */
  useEffect(() => {
    const b = document.body;
    b.classList.toggle("dyslexia", !!settings.dyslexia);
    b.classList.toggle("focusMode", !!settings.adhd);
    b.classList.toggle("motorMode", !!settings.motor);
    b.classList.toggle("highContrast", !!settings.contrast);
    b.classList.toggle("dark", !!settings.dark);
    b.classList.toggle("overlayYellow", !!settings.overlay);
    b.style.fontSize = `${textSize}px`;
    try { localStorage.setItem("saahas_a11y", JSON.stringify(settings)); } catch (_) { }
  }, [settings, textSize]);

  /* ── ESC closes sidebar ── */
  useEffect(() => {
    const fn = e => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  /* ── Narrator ── */
  const [narrating, setNarrating] = useState(false);
  const toggleNarrator = () => {
    if (!narrating) {
      const utt = new SpeechSynthesisUtterance(document.body.innerText);
      utt.rate = 0.9;
      speechSynthesis.cancel();
      speechSynthesis.speak(utt);
      setNarrating(true);
    } else {
      speechSynthesis.cancel();
      setNarrating(false);
    }
  };

  /* ── Spotlight cursor (ADHD focus mode) ── */
  const spotlightRef = useRef(false);
  const spotlightFn = useRef(null);

  const enableSpotlight = useCallback(() => {
    if (spotlightRef.current) return;
    spotlightRef.current = true;
    spotlightFn.current = (e) => {
      document.querySelectorAll(".activeFocus").forEach(el => el.classList.remove("activeFocus"));
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el) return;
      const sec = el.closest("section") || (el.tagName === "SECTION" ? el : null);
      if (sec) sec.classList.add("activeFocus");
    };
    document.addEventListener("mousemove", spotlightFn.current);
  }, []);

  const disableSpotlight = useCallback(() => {
    spotlightRef.current = false;
    if (spotlightFn.current) {
      document.removeEventListener("mousemove", spotlightFn.current);
      spotlightFn.current = null;
    }
    document.querySelectorAll(".activeFocus").forEach(el => el.classList.remove("activeFocus"));
  }, []);

  useEffect(() => {
    if (settings.adhd) enableSpotlight(); else disableSpotlight();
  }, [settings.adhd, enableSpotlight, disableSpotlight]);

  /* ── Motor mode (click magnet) ── */
  const motorFn = useRef(null);
  useEffect(() => {
    if (settings.motor) {
      motorFn.current = (e) => {
        const targets = document.querySelectorAll("a,button,input,select,textarea,label,[role='button']");
        let closest = null, minDist = 60;
        targets.forEach(t => {
          const rc = t.getBoundingClientRect();
          const d = Math.hypot(rc.left + rc.width / 2 - e.clientX, rc.top + rc.height / 2 - e.clientY);
          if (d < minDist) { minDist = d; closest = t; }
        });
        if (closest && closest !== e.target) {
          e.preventDefault(); e.stopPropagation();
          closest.click(); closest.focus();
        }
      };
      document.addEventListener("click", motorFn.current, true);
    } else {
      if (motorFn.current) {
        document.removeEventListener("click", motorFn.current, true);
        motorFn.current = null;
      }
    }
    return () => {
      if (motorFn.current) document.removeEventListener("click", motorFn.current, true);
    };
  }, [settings.motor]);

  /* ── Contrast / Dark are mutually exclusive ── */
  const setSetting = (key, val) => {
    setSettings(prev => {
      const next = { ...prev, [key]: val };
      if (key === "contrast" && val) next.dark = false;
      if (key === "dark" && val) next.contrast = false;
      return next;
    });
  };

  /* ── Toast helper ── */
  const showToast = useCallback((icon, label, pct, c1, c2) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, icon, label, pct, c1, c2 }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 7000);
  }, []);

  /* ── AI detection callback ── */
  const handleDetect = useCallback((condition, prob, signals) => {
    const pct = Math.round(prob * 100);

    if (condition === "adhd") {
      setSetting("adhd", true);
      showToast(<FontAwesomeIcon icon={faBullseye} />, "ADHD Focus Mode activated", pct, "#1e3a8a", "#2563eb");
    }
    if (condition === "dyslexia") {
      setSetting("dyslexia", true);
      showToast(<FontAwesomeIcon icon={faBookOpen} />, "Dyslexia Font Mode activated", pct, "#064e3b", "#047857");
    }
    if (condition === "motor") {
      setSetting("motor", true);
      showToast(<FontAwesomeIcon icon={faMouse} />, "Motor Assist activated", pct, "#7c2d12", "#c2410c");
    }
    if (condition === "anxiety") {
      showToast(<FontAwesomeIcon icon={faFaceFrown} />, "Anxiety Support Mode suggested", pct, "#92400e", "#f59e0b");
    }

    setAiActive(true);
    setAiStatus(
      ["adhd", "dyslexia", "motor"]
        .filter(k => k === condition || (k === "adhd" && settings.adhd) || (k === "dyslexia" && settings.dyslexia) || (k === "motor" && settings.motor))
        .map(k => k.charAt(0).toUpperCase() + k.slice(1) + " ✓")
        .join("  ·  ") || condition.charAt(0).toUpperCase() + condition.slice(1) + " ✓"
    );
  }, [showToast, settings]);

  /* ── Live score updates for badge bars ── */
  const behaviourAI = useBehaviourAI({ onDetect: handleDetect });

  const getScores = behaviourAI.getScores;
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        if (!getScores) return;

        const res = getScores();

        if (!res) return;
        setAiScores({
          adhd: res.adhd.probability,
          dyslexia: res.dyslexia.probability,
          motor: res.motor.probability,
          anxiety: res.anxiety.probability,
        });
        if (!aiActive) {
          const top = Object.entries({
            ADHD: res.adhd.probability, Dyslexia: res.dyslexia.probability, Motor: res.motor.probability, Anxiety: res.anxiety.probability
          }).sort((a, b) => b[1] - a[1])[0];
          setAiStatus(`Monitoring… (${top[0]} ${Math.round(top[1] * 100)}%)`);
        }
      } catch (_) { }
    }, 3000);
    return () => clearInterval(interval);
  }, [getScores, aiActive]);

  /* ── Update status when latched states change ── */
  useEffect(() => {
    const detected = [];
    if (settings.adhd) detected.push("ADHD ✓");
    if (settings.dyslexia) detected.push("Dyslexia ✓");
    if (settings.motor) detected.push("Motor ✓");
    if (settings.anxiety) detected.push("Anxiety ✓");
    if (detected.length) {
      setAiStatus(detected.join("  ·  "));
      setAiActive(true);
    }
  }, [settings.adhd, settings.dyslexia, settings.motor]);

  return (
    <>
      {/* ── Toast stack ── */}
      <ToastStack toasts={toasts} />

      {/* ── Trigger button ── */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open Accessibility Hub"
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[998]
                    bg-gradient-to-b from-blue-500 to-indigo-600
                    text-white p-4 rounded-l-2xl shadow-2xl
                    hover:pr-5 transition-all duration-300
                    flex flex-col items-center gap-1"
      >
        <span className="text-lg"><FontAwesomeIcon icon={faGear} /></span>
        <span className="text-[9px] font-black tracking-wider [writing-mode:vertical-rl] rotate-180 opacity-60">
          A11Y
        </span>
      </button>

      {/* ── Overlay ── */}
      {open && (
        <div
          className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar panel ── */}
      <aside
        className={`fixed top-0 right-0 h-full w-[360px] z-[1000] flex flex-col
                      transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
                      ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{
          background: "linear-gradient(160deg, rgba(10,15,30,0.97) 0%, rgba(5,10,20,0.98) 100%)",
          backdropFilter: "blur(24px)",
          borderLeft: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">Accessibility Hub</h2>
            <p className="text-[10px] text-white/30 font-semibold tracking-wider uppercase mt-0.5">
              Saahas — Powered by AI
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white
                        flex items-center justify-center transition-all text-sm"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-1">

          {/* AI Badge */}
          <AIBadge status={aiStatus} active={aiActive} scores={aiScores} />

          {/* Divider */}
          <p className="text-[9px] font-black tracking-[0.25em] uppercase text-white/20 px-1 pb-1 pt-2">
            Visual
          </p>

          <ToolRow icon={<FontAwesomeIcon icon={faBookOpen} />} label="Dyslexia Font" checked={!!settings.dyslexia} onChange={v => setSetting("dyslexia", v)} />
          <ToolRow icon={<FontAwesomeIcon icon={faMoon} />} label="High Contrast" checked={!!settings.contrast} onChange={v => setSetting("contrast", v)} />
          <ToolRow icon={<FontAwesomeIcon icon={faMoon} />} label="Dark Mode" checked={!!settings.dark} onChange={v => setSetting("dark", v)} />
          <ToolRow icon={<FontAwesomeIcon icon={faCircle} style={{ color: '#eab308' }} />} label="Colour Overlay" checked={!!settings.overlay} onChange={v => setSetting("overlay", v)} />

          <p className="text-[9px] font-black tracking-[0.25em] uppercase text-white/20 px-1 pb-1 pt-4">
            Focus & Motor
          </p>

          <ToolRow icon={<FontAwesomeIcon icon={faBrain} />} label="ADHD Focus" checked={!!settings.adhd} onChange={v => setSetting("adhd", v)} />
          <ToolRow icon={<FontAwesomeIcon icon={faMouse} />} label="Motor Assist" checked={!!settings.motor} onChange={v => setSetting("motor", v)} />

          {/* Narrator */}
          <div className="flex items-center justify-between px-4 py-3.5 rounded-2xl mb-2.5 bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all">
            <span className="flex items-center gap-3 text-sm font-semibold text-white/80">
              <span className="text-lg"><FontAwesomeIcon icon={faVolumeHigh} /></span>
              Narrator
            </span>
            <button
              onClick={toggleNarrator}
              className={`px-4 py-1.5 rounded-xl text-xs font-black tracking-wide transition-all ${narrating
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"
                }`}
            >
              {narrating ? "■ Stop" : "▶ Start"}
            </button>
          </div>

          {/* Text Size */}
          <div className="px-4 py-4 rounded-2xl bg-white/[0.03] border border-white/5 mt-2">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-black text-white/50 uppercase tracking-wider">
                Text Size
              </label>
              <span className="text-xs font-black text-blue-400">{textSize}px</span>
            </div>
            <input
              type="range" min="14" max="28" value={textSize}
              onChange={e => setSetting("textSize", Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-white/20 mt-1">
              <span>A</span><span className="text-sm">A</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/5">
          <button
            onClick={() => {
              setSettings({});
              document.body.removeAttribute("style");
              ["dyslexia", "focusMode", "motorMode", "highContrast", "dark", "overlayYellow"]
                .forEach(c => document.body.classList.remove(c));
            }}
            className="w-full py-2 rounded-xl text-[10px] font-black tracking-wider uppercase
                        text-white/20 hover:text-white/40 hover:bg-white/5 transition-all"
          >
            Reset All Settings
          </button>
        </div>
      </aside>

      {/* ── CSS injected once ── */}
      <style>{`
          /* ── Accessibility mode classes (applied to <body>) ── */

          body.dyslexia {
            font-family: 'Atkinson Hyperlegible', 'Lexend', sans-serif !important;
            letter-spacing: 0.05em !important;
            word-spacing: 0.15em !important;
            line-height: 1.9 !important;
          }

          body.highContrast {
            background: #fff !important;
            color: #000 !important;
            filter: contrast(1.5);
          }
          body.highContrast a { color: #0000ee !important; text-decoration: underline !important; }

          body.dark { background: #111827 !important; color: #e5e7eb !important; }

          body.overlayYellow::after {
            content: '';
            position: fixed; inset: 0; z-index: 9997; pointer-events: none;
            background: rgba(255,255,180,0.25);
          }

          body.focusMode { letter-spacing:.04em; word-spacing:.08em; line-height:2; }
          body.focusMode section { opacity:.3; filter:blur(1.5px); transition:opacity .35s,filter .35s; }
          body.focusMode section.activeFocus {
            opacity:1 !important; filter:none !important;
            transform:scale(1.01); outline:3px solid rgba(47,111,255,0.3);
            border-radius:18px; box-shadow:0 14px 40px rgba(47,111,255,.18);
          }

          body.motorMode a, body.motorMode button, body.motorMode input,
          body.motorMode select, body.motorMode label, body.motorMode [role="button"] {
            min-width:48px !important; min-height:48px !important;
            padding:12px 18px !important; font-size:1.05em !important;
          }
          body.motorMode a:hover, body.motorMode button:hover {
            outline:3px solid #2f6fff; outline-offset:4px;
            box-shadow:0 0 0 6px rgba(47,111,255,.15);
          }

          @keyframes slideUp {
            from { opacity:0; transform:translateX(-50%) translateY(20px); }
            to   { opacity:1; transform:translateX(-50%) translateY(0); }
          }
        `}</style>
    </>
  );
}

/* ================================================================
  HOC — wrap any page with the sidebar automatically

  Usage:
    export default withAccessibility(MyPage);
================================================================ */
export function withAccessibility(WrappedComponent) {
  return function AccessiblePage(props) {
    return (
      <>
        <WrappedComponent {...props} />
        <AccessibilitySidebar />
      </>
    );
  };
}