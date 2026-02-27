/* ================================================================
   MentalHealthDashboard.jsx — Updated With Journal Support
================================================================ */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useBehaviourAI from "../../hooks/useBehaviourAI";

import BehaviourInsightPanel from "./BehaviourInsightPanel";
import BreathingExercise from "./BreathingExercise";

import "./MentalHealthDashboard.css";

/* ── Static Data ───────────────────────────────────────────── */

const MOODS = [
  { emoji: "😄", label: "Great", value: 5 },
  { emoji: "🙂", label: "Good", value: 4 },
  { emoji: "😐", label: "Okay", value: 3 },
  { emoji: "😔", label: "Low", value: 2 },
  { emoji: "😢", label: "Bad", value: 1 },
];

const QUOTES = [
  '"Your mental health is a priority. Your happiness is essential."',
  '"It\'s okay to not be okay — what matters is that you don’t give up."',
  '"Self-care is how you take your power back."',
  '"You don’t have to control your thoughts. Just observe them."',
];

/* ================================================================ */

export default function MentalHealthDashboard() {

  /* NAVIGATION */
  const navigate = useNavigate();

  /* Behaviour AI SAFE */
  const behaviourAI = useBehaviourAI() || {};

  const scores = behaviourAI?.scores || {};
  const latched = behaviourAI?.latched || {};

  /* Mood State */
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodSubmitted, setMoodSubmitted] = useState(false);
  const [streak, setStreak] = useState(5);

  /* Quotes */
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx((i) => (i + 1) % QUOTES.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleMoodSubmit = () => {
    setMoodSubmitted(true);
    setStreak((s) => s + 1);
  };

  /* AI DETECTION SUMMARY */

  const detectedConditions = [];

  if (latched?.adhd)
    detectedConditions.push({ key: "ADHD", icon: "🎯", color: "#3b82f6" });

  if (latched?.dyslexia)
    detectedConditions.push({ key: "Dyslexia", icon: "📖", color: "#22c55e" });

  if (latched?.motor)
    detectedConditions.push({ key: "Motor", icon: "🖱️", color: "#ef4444" });

  const aiReady =
    !!scores && Object.keys(scores || {}).length > 0;

  /* ================================================================ */

  return (
    <div className="space-y-6">

      {/* HERO */}
      <div className="mh-hero">

        <h2 className="text-2xl font-black">
          🌿 Mental Health & Wellness
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
              ? "🤖 AI Monitoring Active"
              : "🤖 AI Engine Warming Up"}
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
            💛 Daily Mood Check-in
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
                  {m.emoji}
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
                className="px-6 py-2 rounded-xl bg-purple-500 text-white font-bold"
              >
                Log Mood ✨
              </button>

            </div>
          )}

          {moodSubmitted && (

            <div className="mt-4 text-center text-green-600 font-bold text-sm">

              ✅ Mood logged! Keep it up 💪

            </div>
          )}

          {/* ⭐ JOURNAL SUPPORT BUTTON */}

          <div className="mt-6 text-center">

            <button
              onClick={() => navigate("/journal")}
              className="px-7 py-3 rounded-2xl font-bold text-white
              bg-gradient-to-r from-pink-500 to-purple-600
              shadow-lg hover:scale-105 transition"
            >
              ✍️ Mental Health Support Journal
            </button>

          </div>

        </div>

        {/* BREATHING */}

        <div className="mh-glass p-6">

          <h3 className="mh-section-title mb-4">

            🌬️ Breathing Exercise

          </h3>

          <BreathingExercise />

        </div>

      </div>

      {/* DETECTION SUMMARY */}

      {detectedConditions.length > 0 && (

        <div className="mh-glass p-6">

          <h3 className="mh-section-title mb-4">

            📋 Your Accessibility Profile

          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">

            {detectedConditions.map((c) => (

              <div
                key={c.key}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border"
              >

                <span className="text-xl">
                  {c.icon}
                </span>

                <div>

                  <p className="font-bold text-sm">

                    {c.key}

                  </p>

                  <p className="text-xs text-gray-500">

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

      <div className="text-center py-4 text-xs text-gray-400">

        🌟 Remember: It's okay to ask for help. You're not alone.

      </div>

    </div>
  );
}