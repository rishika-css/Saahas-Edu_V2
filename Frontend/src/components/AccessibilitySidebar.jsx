/* ================================================================
  AccessibilitySidebar.jsx
  ================================================================
  Global accessibility sidebar with AI behaviour detection.
  Detects ADHD, Dyslexia, Motor, and Anxiety — applies body
  classes, manages toggles, and shows toast notifications.

  LOOPHOLE FIXES:
  - Spotlight targets all structural elements (not just <section>)
  - Manual toggle-off creates a "dismissed" flag so AI won't re-enable
  - Settings ref eliminates stale closure in detection callback
  - Reset clears both AI latched flags and dismissed flags
  - Score bars always reflect live AI probabilities
================================================================ */

import { useState, useEffect, useRef, useCallback } from "react";
import useBehaviourAI from "../hooks/useBehaviourAI";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faBullseye, faBookOpen, faMouse, faFaceFrown, faMoon, faCircle, faBrain, faVolumeHigh, faGear, faXmark } from '@fortawesome/free-solid-svg-icons';

/* ── Toast Queue ─────────────────────────────────────────────── */
function ToastStack({ toasts }) {
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
function ToolRow({ icon, label, checked, onChange, aiScore, color }) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3.5 rounded-2xl mb-2.5 transition-all duration-300 border ${checked
        ? "bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-500/10"
        : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10 hover:-translate-x-1"
        }`}
    >
      <div className="flex-1 mr-3">
        <span className="flex items-center gap-3 text-sm font-semibold text-white/80">
          <span className="text-lg">{icon}</span>
          {label}
        </span>
        {/* Mini confidence bar directly on the toggle row */}
        {typeof aiScore === "number" && (
          <div className="mt-1.5 ml-8">
            <div className="h-1 rounded-full bg-white/5 overflow-hidden w-full max-w-[120px]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.round(aiScore * 100)}%`, background: color || "#3b82f6" }}
              />
            </div>
            <span className="text-[8px] font-bold mt-0.5 block" style={{ color: color || "#3b82f6" }}>
              {Math.round(aiScore * 100)}% AI confidence
            </span>
          </div>
        )}
      </div>
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
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {[
            { key: "adhd", label: "ADHD", color: "#3b82f6" },
            { key: "dyslexia", label: "Dyslexia", color: "#22c55e" },
            { key: "motor", label: "Motor", color: "#ef4444" },
            { key: "anxiety", label: "Anxiety", color: "#f59e0b" },
          ].map(({ key, label, color }) => (
            <div key={key} className="text-center">
              <div className="text-[9px] text-white/30 mb-1 uppercase tracking-wider">{label}</div>
              <div
                className="h-1.5 rounded-full bg-white/5 overflow-hidden"
                title={`${Math.round((scores[key] || 0) * 100)}%`}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.round((scores[key] || 0) * 100)}%`, background: color }}
                />
              </div>
              <div className="text-[10px] font-bold mt-0.5" style={{ color }}>
                {Math.round((scores[key] || 0) * 100)}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* (findFocusTarget removed — ADHD now uses line-traversal instead of element spotlight) */

/* ================================================================
  MAIN SIDEBAR COMPONENT
================================================================ */
export default function AccessibilitySidebar() {
  const [open, setOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [aiStatus, setAiStatus] = useState("Warming up…");
  const [aiActive, setAiActive] = useState(false);
  const [aiScores, setAiScores] = useState(null);

  /* ── Accessibility settings state ── */
  const [settings, setSettings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("saahas_a11y") || "{}");
      // Never start with disability modes on — they must be detected or toggled manually
      delete saved.adhd;
      delete saved.dyslexia;
      delete saved.motor;
      delete saved.anxiety;
      return saved;
    } catch { return {}; }
  });

  /* Ref mirrors settings so callbacks always see latest values */
  const settingsRef = useRef(settings);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  /* Tracks which conditions the user manually dismissed (turned off after AI enabled) */
  const dismissedRef = useRef({ adhd: false, dyslexia: false, motor: false, anxiety: false });

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

  /* ── Narrator (hover-to-read) ── */
  const [narrating, setNarrating] = useState(false);
  const narratorFn = useRef(null);
  const lastSpoken = useRef("");

  const toggleNarrator = () => {
    if (!narrating) {
      setNarrating(true);
    } else {
      speechSynthesis.cancel();
      if (narratorFn.current) {
        document.removeEventListener("mouseover", narratorFn.current);
        narratorFn.current = null;
      }
      lastSpoken.current = "";
      setNarrating(false);
    }
  };

  useEffect(() => {
    if (narrating) {
      narratorFn.current = (e) => {
        const el = e.target;
        if (!el) return;
        // Skip sidebar elements
        if (el.closest("aside[class*='z-[1000]']")) return;
        const text = (el.innerText || el.textContent || "").trim();
        if (!text || text.length > 500 || text === lastSpoken.current) return;
        lastSpoken.current = text;
        speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(text);
        utt.rate = 0.95;
        speechSynthesis.speak(utt);
      };
      document.addEventListener("mouseover", narratorFn.current);
    }
    return () => {
      if (narratorFn.current) {
        document.removeEventListener("mouseover", narratorFn.current);
        narratorFn.current = null;
      }
    };
  }, [narrating]);

  /* ── ADHD Focus Mode: Line-Traversal Reading Guide ──
     Two fixed overlays (top blur + bottom blur) leave a clear
     horizontal strip (~60px) at the cursor's Y position.
     Works universally — no DOM manipulation, no z-index tricks. */
  const focusActiveRef = useRef(false);
  const focusMoveFn = useRef(null);
  const topBandRef = useRef(null);
  const botBandRef = useRef(null);
  const BAND_HEIGHT = 180;

  const makeBand = (id, pos) => {
    const d = document.createElement("div");
    d.id = id;
    d.style.cssText = `
      position: fixed; left: 0; right: 0; ${pos}: 0; z-index: 9000;
      background: rgba(0, 0, 0, 0.55);
      backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);
      pointer-events: none;
      transition: height 0.08s linear, opacity 0.3s ease;
    `;
    document.body.appendChild(d);
    return d;
  };

  const enableFocusLine = useCallback(() => {
    if (focusActiveRef.current) return;
    focusActiveRef.current = true;

    if (!topBandRef.current) topBandRef.current = makeBand("adhd-top-band", "top");
    if (!botBandRef.current) botBandRef.current = makeBand("adhd-bot-band", "bottom");
    topBandRef.current.style.height = "0";
    topBandRef.current.style.opacity = "1";
    botBandRef.current.style.height = "100vh";
    botBandRef.current.style.opacity = "1";

    focusMoveFn.current = (e) => {
      const y = e.clientY;
      const half = BAND_HEIGHT / 2;
      const topH = Math.max(0, y - half);
      const botH = Math.max(0, window.innerHeight - y - half);
      if (topBandRef.current) topBandRef.current.style.height = topH + "px";
      if (botBandRef.current) botBandRef.current.style.height = botH + "px";
    };
    document.addEventListener("mousemove", focusMoveFn.current);
  }, []);

  const disableFocusLine = useCallback(() => {
    focusActiveRef.current = false;
    if (focusMoveFn.current) {
      document.removeEventListener("mousemove", focusMoveFn.current);
      focusMoveFn.current = null;
    }
    [topBandRef, botBandRef].forEach(ref => {
      if (ref.current) {
        ref.current.style.opacity = "0";
        const el = ref.current;
        setTimeout(() => { if (!focusActiveRef.current) el.remove(); }, 300);
        ref.current = null;
      }
    });
  }, []);

  useEffect(() => {
    if (settings.adhd) enableFocusLine(); else disableFocusLine();
    return () => disableFocusLine();
  }, [settings.adhd, enableFocusLine, disableFocusLine]);

  /* ── Motor mode (click magnet) ── */
  const motorFn = useRef(null);
  useEffect(() => {
    if (settings.motor) {
      motorFn.current = (e) => {
        // Don't interfere with sidebar clicks
        const sidebar = e.target.closest("aside[class*='z-[1000]']");
        if (sidebar) return;

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

  /* ── Setting setter with mutual exclusion ── */
  const setSetting = useCallback((key, val) => {
    setSettings(prev => {
      const next = { ...prev, [key]: val };
      if (key === "contrast" && val) next.dark = false;
      if (key === "dark" && val) next.contrast = false;
      return next;
    });
  }, []);

  /* ── Manual toggle handler (tracks dismissed state) ── */
  const handleManualToggle = useCallback((key, val) => {
    setSetting(key, val);
    if (!val) {
      // User manually turned OFF → mark as dismissed so AI won't re-enable
      dismissedRef.current[key] = true;
    } else {
      // User manually turned ON → clear dismissed flag
      dismissedRef.current[key] = false;
    }
  }, [setSetting]);

  /* ── Toast helper ── */
  const showToast = useCallback((icon, label, pct, c1, c2) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, icon, label, pct, c1, c2 }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 7000);
  }, []);

  /* ── AI detection callback (uses ref to avoid stale closure) ── */
  const handleDetect = useCallback((condition, prob, signals) => {
    const pct = Math.round(prob * 100);

    // LOOPHOLE FIX: Don't re-enable if user manually dismissed
    if (dismissedRef.current[condition]) return;

    // LOOPHOLE FIX: Don't re-enable if already active
    if (settingsRef.current[condition]) return;

    const DETECTIONS = {
      adhd: { icon: faBullseye, label: "ADHD Focus Mode activated", c1: "#1e3a8a", c2: "#2563eb" },
      dyslexia: { icon: faBookOpen, label: "Dyslexia Font Mode activated", c1: "#064e3b", c2: "#047857" },
      motor: { icon: faMouse, label: "Motor Assist activated", c1: "#7c2d12", c2: "#c2410c" },
      anxiety: { icon: faFaceFrown, label: "Anxiety detected — Consider a break", c1: "#92400e", c2: "#f59e0b" },
    };
    const d = DETECTIONS[condition];
    if (!d) return;

    setSetting(condition, true);
    showToast(<FontAwesomeIcon icon={d.icon} />, d.label, pct, d.c1, d.c2);

    setAiActive(true);
    const currentSettings = settingsRef.current;
    const detected = ["adhd", "dyslexia", "motor", "anxiety"]
      .filter(k => k === condition || currentSettings[k])
      .map(k => k.charAt(0).toUpperCase() + k.slice(1) + " ✓");
    setAiStatus(detected.join("  ·  "));
  }, [showToast, setSetting]);

  /* ── AI engine hook ── */
  const behaviourAI = useBehaviourAI({ onDetect: handleDetect });

  /* ── Live score polling for badge bars ── */
  const getScores = behaviourAI.getScores;
  const scoreRef = useRef(null);
  useEffect(() => {
    let rafId;
    const updateScores = () => {
      try {
        if (!getScores) return;
        const res = getScores();
        if (!res) return;
        const next = {
          adhd: res.adhd.probability,
          dyslexia: res.dyslexia.probability,
          motor: res.motor.probability,
          anxiety: res.anxiety?.probability ?? 0,
        };
        // Only setState if scores actually changed >0.5% (avoids unnecessary re-renders)
        const prev = scoreRef.current;
        if (!prev || Object.keys(next).some(k => Math.abs(next[k] - (prev[k] || 0)) > 0.005)) {
          scoreRef.current = next;
          setAiScores(next);
        }
        if (!aiActive) {
          const top = Object.entries({
            ADHD: next.adhd, Dyslexia: next.dyslexia, Motor: next.motor, Anxiety: next.anxiety
          }).sort((a, b) => b[1] - a[1])[0];
          setAiStatus(`Monitoring… (${top[0]} ${Math.round(top[1] * 100)}%)`);
        }
      } catch (_) { }
    };
    const poll = () => {
      if (typeof requestIdleCallback !== 'undefined') {
        rafId = requestIdleCallback(() => { updateScores(); });
      } else {
        updateScores();
      }
    };
    const interval = setInterval(poll, 3000);
    return () => {
      clearInterval(interval);
      if (typeof cancelIdleCallback !== 'undefined' && rafId) cancelIdleCallback(rafId);
    };
  }, [getScores, aiActive]);

  /* ── Update status text when settings change ── */
  useEffect(() => {
    const detected = ["adhd", "dyslexia", "motor", "anxiety"]
      .filter(k => settings[k])
      .map(k => k.charAt(0).toUpperCase() + k.slice(1) + " ✓");
    if (detected.length) {
      setAiStatus(detected.join("  ·  "));
      setAiActive(true);
    } else {
      setAiActive(false);
      setAiStatus("Monitoring…");
    }
  }, [settings.adhd, settings.dyslexia, settings.motor, settings.anxiety]);

  /* ── Reset all settings + AI state ── */
  const handleReset = useCallback(() => {
    setSettings({});
    dismissedRef.current = { adhd: false, dyslexia: false, motor: false, anxiety: false };
    // Reset the AI engine's latched flags so it can re-detect
    if (behaviourAI.latched) {
      behaviourAI.latched.adhd = false;
      behaviourAI.latched.dyslexia = false;
      behaviourAI.latched.motor = false;
      behaviourAI.latched.anxiety = false;
    }
    setAiActive(false);
    setAiStatus("Monitoring…");
    setAiScores(null);
    scoreRef.current = null;
    document.body.removeAttribute("style");
    ["dyslexia", "focusMode", "motorMode", "highContrast", "dark", "overlayYellow"]
      .forEach(c => document.body.classList.remove(c));
    document.querySelectorAll(".activeFocus").forEach(el => el.classList.remove("activeFocus"));
  }, [behaviourAI.latched]);

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
            AI-Detected Disabilities
          </p>

          <ToolRow
            icon={<FontAwesomeIcon icon={faBrain} />}
            label="ADHD Focus"
            checked={!!settings.adhd}
            onChange={v => handleManualToggle("adhd", v)}
            aiScore={aiScores?.adhd}
            color="#3b82f6"
          />
          <ToolRow
            icon={<FontAwesomeIcon icon={faBookOpen} />}
            label="Dyslexia Font"
            checked={!!settings.dyslexia}
            onChange={v => handleManualToggle("dyslexia", v)}
            aiScore={aiScores?.dyslexia}
            color="#22c55e"
          />
          <ToolRow
            icon={<FontAwesomeIcon icon={faMouse} />}
            label="Motor Assist"
            checked={!!settings.motor}
            onChange={v => handleManualToggle("motor", v)}
            aiScore={aiScores?.motor}
            color="#ef4444"
          />
          <ToolRow
            icon={<FontAwesomeIcon icon={faFaceFrown} />}
            label="Anxiety Support"
            checked={!!settings.anxiety}
            onChange={v => handleManualToggle("anxiety", v)}
            aiScore={aiScores?.anxiety}
            color="#f59e0b"
          />

          <p className="text-[9px] font-black tracking-[0.25em] uppercase text-white/20 px-1 pb-1 pt-4">
            Visual Settings
          </p>

          <ToolRow icon={<FontAwesomeIcon icon={faMoon} />} label="High Contrast" checked={!!settings.contrast} onChange={v => setSetting("contrast", v)} />
          <ToolRow icon={<FontAwesomeIcon icon={faMoon} />} label="Dark Mode" checked={!!settings.dark} onChange={v => setSetting("dark", v)} />
          <ToolRow icon={<FontAwesomeIcon icon={faCircle} style={{ color: '#eab308' }} />} label="Colour Overlay" checked={!!settings.overlay} onChange={v => setSetting("overlay", v)} />

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
            onClick={handleReset}
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

          /* ── ADHD Focus Mode ── */
          body.focusMode {
            letter-spacing: 0.03em;
            word-spacing: 0.06em;
          }

          /* Overlay approach — spotlight is handled via JS z-index,
             no CSS opacity/blur needed on content elements */

          /* ── Motor Mode ── */
          body.motorMode a, body.motorMode button, body.motorMode input,
          body.motorMode select, body.motorMode textarea, body.motorMode label,
          body.motorMode [role="button"] {
            min-height: 44px !important;
            cursor: pointer;
          }
          body.motorMode a:hover, body.motorMode button:hover,
          body.motorMode input:focus, body.motorMode select:focus,
          body.motorMode textarea:focus, body.motorMode [role="button"]:hover {
            outline: 3px solid #2f6fff;
            outline-offset: 3px;
            box-shadow: 0 0 0 6px rgba(47,111,255,.12);
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