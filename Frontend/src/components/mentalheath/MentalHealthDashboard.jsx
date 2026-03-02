/* ================================================================
   MentalHealthDashboard.jsx — Updated With Journal Support
================================================================ */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useBehaviourAi from "../../hooks/useBehaviourAi";
import { useAuth } from "../../context/AuthContext";
import { moodAPI, dashboardAPI } from "../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFaceSmileBeam, faFaceSmile, faFaceMeh, faFaceFrown, faFaceSadTear,
  faSeedling, faRobot, faBullseye, faBookOpen, faComputerMouse,
  faHeart, faWandMagicSparkles, faCircleCheck, faDumbbell,
  faPenToSquare, faWind, faClipboardList, faStar,
} from "@fortawesome/free-solid-svg-icons";

import BehaviourInsightPanel from "./BehaviourInsightPanel";
import BreathingExercise from "./BreathingExercise";

import "./MentalHealthDashboard.css";

/* ── Static Data ───────────────────────────────────────────── */

const MOODS = [
  { icon: faFaceSmileBeam, label: "Great", value: 5, color: "#22c55e" },
  { icon: faFaceSmile, label: "Good", value: 4, color: "#84cc16" },
  { icon: faFaceMeh, label: "Okay", value: 3, color: "#eab308" },
  { icon: faFaceFrown, label: "Low", value: 2, color: "#f97316" },
  { icon: faFaceSadTear, label: "Bad", value: 1, color: "#ef4444" },
];

const QUOTES = [
  '"Your mental health is a priority. Your happiness is essential."',
  '"It\'s okay to not be okay — what matters is that you don\'t give up."',
  '"Self-care is how you take your power back."',
  '"You don\'t have to control your thoughts. Just observe them."',
];

/* ================================================================ */

export default function MentalHealthDashboard() {

  /* AUTH */
  useAuth();

  /* NAVIGATION */
  const navigate = useNavigate();

  /* Behaviour AI SAFE */
  const behaviourAI = useBehaviourAi() || {};

  const scores = behaviourAI?.scores || {};
  const latched = behaviourAI?.latched || {};

  /* Mood State */
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodSubmitted, setMoodSubmitted] = useState(false);
  const [, setStreak] = useState(0);
  const [moodLoading, setMoodLoading] = useState(false);

  /* Quotes */
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx((i) => (i + 1) % QUOTES.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Fetch real streak from backend
  useEffect(() => {
    dashboardAPI.getStats()
      .then(data => setStreak(data.streak || 0))
      .catch(() => { });
  }, []);

  const handleMoodSubmit = async () => {
    if (!selectedMood) return;
    setMoodLoading(true);
    const moodObj = MOODS.find(m => m.value === selectedMood);
    try {
      await moodAPI.log({ mood: selectedMood, label: moodObj?.label || "Okay" });
      setMoodSubmitted(true);
      // Refresh streak
      dashboardAPI.getStats()
        .then(data => setStreak(data.streak || 0))
        .catch(() => { });
    } catch (err) {
      console.warn("Failed to log mood:", err.message);
      // Still show success locally so the user isn't blocked
      setMoodSubmitted(true);
    } finally {
      setMoodLoading(false);
    }
  };

  /* AI DETECTION SUMMARY */

  const detectedConditions = [];

  if (latched?.adhd)
    detectedConditions.push({ key: "ADHD", icon: faBullseye, color: "#3b82f6" });

  if (latched?.dyslexia)
    detectedConditions.push({ key: "Dyslexia", icon: faBookOpen, color: "#22c55e" });

  if (latched?.motor)
    detectedConditions.push({ key: "Motor", icon: faComputerMouse, color: "#ef4444" });

  const aiReady =
    !!scores && Object.keys(scores || {}).length > 0;

  /* ================================================================ */

  return (
    <div className="space-y-6">

      {/* HERO */}
      <div className="mh-hero">

        <h2 className="text-2xl font-black">
          <FontAwesomeIcon icon={faSeedling} className="mr-2" /> Mental Health & Wellness
        </h2>

        <p className="text-white/70 text-sm">
          Your personalised well-being companion
        </p>

        <p
          className="text-white/50 italic mt-3 text-sm"
          key={quoteIdx}
        >
          {QUOTES[quoteIdx]}
        </p>

        {/* AI STATUS */}
        <div className="mt-4">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-xs font-bold">

            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: aiReady
                  ? "#22c55e"
                  : "#facc15",
              }}
            />

            {aiReady
              ? <><FontAwesomeIcon icon={faRobot} className="mr-1" /> AI Monitoring Active</>
              : <><FontAwesomeIcon icon={faRobot} className="mr-1" /> AI Engine Warming Up</>}
          </div>
        </div>
      </div>

      {/* AI INSIGHTS */}

      <div className="mh-glass p-6">
        <BehaviourInsightPanel
          scores={scores || {}}
          latched={latched || {}}
        />
      </div>

      {/* MOOD + BREATHING */}

      <div className="grid md:grid-cols-2 gap-6">

        {/* MOOD */}
        <div className="mh-glass p-6">

          <h3 className="mh-section-title mb-4">
            <FontAwesomeIcon icon={faHeart} style={{ color: "#facc15" }} className="mr-2" /> Daily Mood Check-in
          </h3>

          <div className="flex justify-center gap-3 flex-wrap">

            {MOODS.map((m) => (

              <button
                key={m.value}
                onClick={() => {
                  setSelectedMood(m.value);
                  setMoodSubmitted(false);
                }}
                className={`mh-mood-btn ${selectedMood === m.value
                  ? "selected"
                  : ""
                  }`}
              >
                <span className="text-3xl">
                  <FontAwesomeIcon icon={m.icon} style={{ color: m.color }} />
                </span>

                <span className="text-xs">
                  {m.label}
                </span>
              </button>
            ))}
          </div>

          {selectedMood && !moodSubmitted && (

            <div className="mt-5 text-center">

              <button
                onClick={handleMoodSubmit}
                disabled={moodLoading}
                className="px-6 py-2 rounded-xl bg-purple-500 text-white font-bold"
              >
                {moodLoading ? "Logging..." : <>Log Mood <FontAwesomeIcon icon={faWandMagicSparkles} className="ml-1" /></>}
              </button>

            </div>
          )}

          {moodSubmitted && (

            <div className="mt-4 text-center text-green-400 font-bold text-sm">

              <FontAwesomeIcon icon={faCircleCheck} className="mr-1" /> Mood logged! Keep it up <FontAwesomeIcon icon={faDumbbell} className="ml-1" />

            </div>
          )}

          {/* JOURNAL SUPPORT BUTTON */}

          <div className="mt-6 text-center">

            <button
              onClick={() => navigate("/journal")}
              className="px-7 py-3 rounded-2xl font-bold text-white
              bg-gradient-to-r from-pink-500 to-purple-600
              shadow-lg hover:scale-105 transition"
            >
              <FontAwesomeIcon icon={faPenToSquare} className="mr-2" /> Mental Health Support Journal
            </button>

          </div>

        </div>

        {/* BREATHING */}

        <div className="mh-glass p-6">

          <h3 className="mh-section-title mb-4">

            <FontAwesomeIcon icon={faWind} className="mr-2" /> Breathing Exercise

          </h3>

          <BreathingExercise />

        </div>

      </div>

      {/* DETECTION SUMMARY */}

      {detectedConditions.length > 0 && (

        <div className="mh-glass p-6">

          <h3 className="mh-section-title mb-4">

            <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> Your Accessibility Profile

          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">

            {detectedConditions.map((c) => (

              <div
                key={c.key}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border"
              >

                <span className="text-xl">
                  <FontAwesomeIcon icon={c.icon} style={{ color: c.color }} />
                </span>

                <div>

                  <p className="font-bold text-sm text-white">

                    {c.key}

                  </p>

                  <p className="text-xs text-white/50">

                    {Math.round(
                      (scores?.[
                        c.key.toLowerCase()
                      ]?.probability ?? 0) * 100
                    )}
                    % confidence

                  </p>

                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      <div className="text-center py-4 text-xs text-white/40">

        <FontAwesomeIcon icon={faStar} className="mr-1" /> Remember: It's okay to ask for help. You're not alone.

      </div>

    </div>
  );
}