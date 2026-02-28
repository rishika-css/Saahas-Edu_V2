
import { useState, useEffect, useRef } from "react";
import Navbar from "../components/common/Navbar";
import useBehaviourAI from "../hooks/useBehaviourAI";
import BehaviourInsightPanel from "../components/mentalheath/BehaviourInsightPanel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRainbow, faSpa, faPhone, faMicrophone, faStop, faVolumeHigh, faVolumeXmark, faPaperPlane, faLock } from "@fortawesome/free-solid-svg-icons";
/* ================================================================
   IMPORTANT: Add your Gemini API key to your .env file:
   VITE_GEMINI_API_KEY=your_key_here

   Get a FREE key at: https://aistudio.google.com/app/apike
================================================================ */

const GEMINI_API_KEY = "AIzaSyA22MNyFeGohlBUrGGouDRAqak-faORYyE";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
const SYSTEM_PROMPT = `You are a warm, empathetic mental health journal companion called "Aura" for a safe private journaling app used in India.

Your personality:
- Caring, gentle, non-judgmental — like a trusted friend who truly listens
- Culturally aware of Indian context (exams, family pressure, career stress)
- Concise: respond in 2-4 sentences unless the user needs more
- Always validate feelings before offering any perspective
- Ask ONE thoughtful follow-up question per message to deepen reflection
- Never diagnose, never give medical advice
- If you detect distress, gently suggest speaking to a counsellor or trusted person
- Remember what was said earlier in the conversation and refer back naturally

Crisis protocol: If the user mentions suicide, self-harm, or wanting to die — respond with deep compassion and share: Kiran Mental Health Helpline 1800-599-0019 (free, 24/7, multilingual).`;

export default function JournalPage() {

  console.log("My API Key is:", GEMINI_API_KEY);
  const { getScores, latched } = useBehaviourAI() || {};
  const scores = getScores ? getScores() : null;

  /* ── Chat State ───────────────────────────────────────────── */
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi, I'm Aura — your safe space to think out loud. What's on your mind today? You can type or tap the mic to speak freely.",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  /* ── Voice State ──────────────────────────────────────────── */
  const [listening, setListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(true);

  /* ── Refs ─────────────────────────────────────────────────── */
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef("");  // always-current mirror of inputText
  const autoSendRef = useRef(false); // flag: was this stop triggered by silence timer?

  /* ── Auto-scroll to latest message ───────────────────────── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* =========================================================
     SILENCE TIMER — auto-send after 3s of no new speech
  ========================================================= */

  function resetSilenceTimer() {
    clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      autoSendRef.current = true;
      stopListening();
    }, 3000);
  }

  /* =========================================================
     SPEECH RECOGNITION — single-utterance chaining
     Each utterance is captured, then recognition auto-restarts
     to capture the next phrase. After 3s of silence → auto-send.
  ========================================================= */

  function createRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;   // single utterance — more reliable
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      if (transcript.trim()) {
        setInputText(prev => {
          const next = prev + transcript;
          inputRef.current = next;
          return next;
        });
        // Got speech → reset the silence countdown
        resetSilenceTimer();
      }
    };

    // When one utterance ends, auto-restart to capture the next
    recognition.onend = () => {
      // Only restart if we're still supposed to be listening
      // and the silence timer hasn't fired yet
      if (recognitionRef.current && !autoSendRef.current) {
        try {
          recognition.start();
        } catch (_) { /* ignore */ }
      }
    };

    recognition.onerror = (e) => {
      // "no-speech" and "aborted" are normal — just let onend restart
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        alert("Microphone access denied. Please allow microphone in your browser settings.");
        recognitionRef.current = null;
        setListening(false);
      }
    };

    return recognition;
  }

  function startListening() {
    if (recognitionRef.current) return; // already listening

    const recognition = createRecognition();
    if (!recognition) {
      alert("Speech recognition not supported. Please use Chrome.");
      return;
    }

    // Clear previous text for a fresh prompt
    setInputText("");
    inputRef.current = "";
    autoSendRef.current = false;

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
    // No silence timer here — it starts only after first speech result
  }

  function stopListening() {
    clearTimeout(silenceTimerRef.current);
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);

    // Auto-send if triggered by silence timer and there's accumulated text
    if (autoSendRef.current && inputRef.current.trim()) {
      autoSendRef.current = false;
      // Small delay to let state settle
      setTimeout(() => handleSend(), 100);
    }
    autoSendRef.current = false;
  }

  /* =========================================================
     TEXT TO SPEECH
  ========================================================= */

  function speak(text) {
    if (!voiceMode || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    // Strip emojis for cleaner speech
    const cleanText = text.replace(/[\u{1F300}-\u{1FFFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  }

  /* =========================================================
     CRISIS DETECTION — always local, instant, no API needed
  ========================================================= */

  function checkCrisis(text) {
    const CRISIS_KEYWORDS = [
      "suicide", "kill myself", "end my life", "want to die",
      "don't want to live", "self harm", "cut myself", "hurt myself",
    ];
    return CRISIS_KEYWORDS.some(k => text.toLowerCase().includes(k));
  }

  /* =========================================================
     GEMINI API — multi-turn chat
  ========================================================= */

  async function sendToGemini(userText, history) {
    // 1. Double check the URL (Must be 1.5-flash)
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    // 2. Clean history: Gemini expects alternating User/Model turns. 
    // We skip the very first "assistant" message because it has no preceding "user" message.
    const contents = [];

    // Add the prompt as a user message if system_instruction is being finicky
    contents.push({ role: "user", parts: [{ text: `INSTRUCTIONS: ${SYSTEM_PROMPT}` }] });
    contents.push({ role: "model", parts: [{ text: "Understood. I am Aura, your empathetic companion." }] });

    // Add actual chat history
    history.slice(1).forEach(msg => {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.text }]
      });
    });

    // Add the current user message
    contents.push({ role: "user", parts: [{ text: userText }] });

    const body = {
      contents: contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
    };

    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error Details:", errorData); // THIS WILL TELL US THE REAL PROBLEM
      throw new Error("Connection failed");
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  /* =========================================================
     SEND MESSAGE
  ========================================================= */

  async function handleSend() {
    // Use ref as fallback (fixes stale closure when called from silence timer)
    const text = (inputText || inputRef.current).trim();
    if (!text || loading) return;

    if (listening) stopListening();

    // Crisis — handle locally, still show in chat
    if (checkCrisis(text)) {
      const crisisReply =
        "I hear you, and I'm really glad you told me. You matter so much. Please reach out right now — Kiran Mental Health Helpline: 1800-599-0019 (free, 24/7, multiple languages). You are not alone in this.";

      setMessages(prev => [
        ...prev,
        { role: "user", text },
        { role: "assistant", text: crisisReply, crisis: true },
      ]);
      setInputText("");
      inputRef.current = "";
      speak(crisisReply);
      return;
    }

    // Add user message and clear input immediately
    const updatedMessages = [...messages, { role: "user", text }];
    setMessages(updatedMessages);
    setInputText("");
    inputRef.current = "";
    setLoading(true);

    try {
      const reply = await sendToGemini(text, updatedMessages);
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);
      speak(reply);
    } catch (err) {
      console.error("Gemini error:", err);
      const errMsg =
        "I'm having a little trouble connecting right now. I'm still here — please try again in a moment.";
      setMessages(prev => [...prev, { role: "assistant", text: errMsg, error: true }]);
    } finally {
      setLoading(false);
    }
  }

  /* ── Send on Enter (Shift+Enter = newline) ────────────────── */
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  /* ── Alt+V keyboard shortcut ──────────────────────────────── */
  useEffect(() => {
    function handler(e) {
      if (e.altKey && e.key === "v") {
        listening ? stopListening() : startListening();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [listening]);

  /* ── Cleanup on unmount ───────────────────────────────────── */
  useEffect(() => {
    return () => {
      clearTimeout(silenceTimerRef.current);
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="mh-page">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        <div>
          <h2 className="text-2xl font-black"><FontAwesomeIcon icon={faRainbow} className="mr-2" /> Safe Mental Support Space</h2>
          <p className="text-gray-500 text-sm mt-1">
            Private &amp; judgement-free. Speak or type freely — Aura is here to listen.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── CHATBOT — takes 2/3 of the grid ─────────────── */}
          <div
            className="lg:col-span-2 mh-glass flex flex-col"
            style={{ height: "75vh" }}
          >

            {/* Chat Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/40">
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "linear-gradient(135deg, #a855f7, #6366f1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, flexShrink: 0,
              }}>
                <FontAwesomeIcon icon={faSpa} style={{ color: "white" }} />
              </div>
              <div>
                <p className="font-black text-gray-800 text-sm">Aura</p>
                <p className="text-xs text-gray-400">AI Mental Health Companion · Gemini</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#22c55e", display: "inline-block",
                }} className="animate-pulse" />
                <span className="text-xs text-gray-400">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {/* Aura avatar */}
                  {msg.role === "assistant" && (
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                      background: "linear-gradient(135deg, #a855f7, #6366f1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, marginRight: 8, marginTop: 4, color: "white",
                    }}>
                      <FontAwesomeIcon icon={faSpa} />
                    </div>
                  )}

                  <div style={{
                    maxWidth: "75%",
                    padding: "12px 16px",
                    borderRadius: msg.role === "user"
                      ? "20px 20px 4px 20px"
                      : "20px 20px 20px 4px",
                    background: msg.role === "user"
                      ? "linear-gradient(135deg, #7c3aed, #6366f1)"
                      : msg.crisis
                        ? "linear-gradient(135deg, #fef3c7, #fde68a)"
                        : msg.error
                          ? "#fee2e2"
                          : "rgba(255,255,255,0.88)",
                    color: msg.role === "user" ? "white" : "#1f2937",
                    fontSize: 14,
                    lineHeight: 1.65,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    border: msg.crisis ? "1px solid #fbbf24" : "1px solid transparent",
                  }}>
                    {msg.text}
                    {msg.crisis && (
                      <div style={{
                        marginTop: 10, fontSize: 12, fontWeight: 700,
                        color: "#92400e", padding: "6px 10px",
                        background: "rgba(255,255,255,0.6)", borderRadius: 8,
                      }}>
                        <FontAwesomeIcon icon={faPhone} className="mr-1" /> Kiran Helpline: 1800-599-0019 · Free · 24/7
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg, #a855f7, #6366f1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, marginRight: 8, color: "white",
                  }}>
                    <FontAwesomeIcon icon={faSpa} />
                  </div>
                  <div style={{
                    padding: "14px 18px",
                    borderRadius: "20px 20px 20px 4px",
                    background: "rgba(255,255,255,0.88)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  }}>
                    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                      {[0, 1, 2].map(i => (
                        <span key={i} style={{
                          width: 8, height: 8, borderRadius: "50%",
                          background: "#a855f7", display: "inline-block",
                          animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-5 py-4 border-t border-white/40">

              {listening && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  fontSize: 12, color: "#6366f1", fontWeight: 600,
                  marginBottom: 8,
                }} className="animate-pulse">
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "#ef4444", display: "inline-block",
                  }} />
                  Listening... auto-stops after 5s of silence
                </div>
              )}

              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>

                {/* Text input */}
                <textarea
                  value={inputText}
                  onChange={e => { setInputText(e.target.value); inputRef.current = e.target.value; }}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    listening
                      ? "Speak now — I'm listening..."
                      : "Type here or press the mic... (Enter to send)"
                  }
                  rows={2}
                  style={{
                    flex: 1, padding: "10px 14px", borderRadius: 16,
                    border: listening ? "2px solid #6366f1" : "1.5px solid #e5e7eb",
                    resize: "none", fontSize: 14, outline: "none",
                    background: "rgba(255,255,255,0.85)",
                    fontFamily: "inherit", lineHeight: 1.5,
                    transition: "border 0.2s",
                  }}
                />

                {/* Mic */}
                <button
                  onClick={listening ? stopListening : startListening}
                  title="Toggle mic (Alt+V)"
                  style={{
                    width: 44, height: 44, borderRadius: "50%", border: "none",
                    background: listening
                      ? "linear-gradient(135deg, #ef4444, #f97316)"
                      : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "white", fontSize: 18, cursor: "pointer",
                    flexShrink: 0, display: "flex", alignItems: "center",
                    justifyContent: "center",
                    animation: listening ? "mhPulse 1.5s ease-in-out infinite" : "none",
                  }}
                >
                  {listening ? <FontAwesomeIcon icon={faStop} /> : <FontAwesomeIcon icon={faMicrophone} />}
                </button>

                {/* Voice reply toggle */}
                <button
                  onClick={() => {
                    setVoiceMode(v => !v);
                    if (voiceMode) window.speechSynthesis?.cancel();
                  }}
                  title="Toggle voice replies"
                  style={{
                    width: 44, height: 44, borderRadius: "50%", border: "none",
                    background: voiceMode ? "#1f2937" : "#e5e7eb",
                    color: voiceMode ? "white" : "#6b7280",
                    fontSize: 16, cursor: "pointer", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {voiceMode ? <FontAwesomeIcon icon={faVolumeHigh} /> : <FontAwesomeIcon icon={faVolumeXmark} />}
                </button>

                {/* Send */}
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || loading}
                  style={{
                    width: 44, height: 44, borderRadius: "50%", border: "none",
                    background: inputText.trim() && !loading
                      ? "linear-gradient(135deg, #7c3aed, #6366f1)"
                      : "#e5e7eb",
                    color: inputText.trim() && !loading ? "white" : "#9ca3af",
                    fontSize: 20, cursor: inputText.trim() && !loading ? "pointer" : "default",
                    flexShrink: 0, display: "flex", alignItems: "center",
                    justifyContent: "center", transition: "all 0.2s",
                  }}
                >
                  <FontAwesomeIcon icon={faPaperPlane} />
                </button>
              </div>

              <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", marginTop: 8 }}>
                <FontAwesomeIcon icon={faLock} className="mr-1" /> Everything shared here is private · Alt+V for quick mic toggle
              </p>
            </div>
          </div>

          {/* ── BEHAVIOUR PANEL — 1/3 width ─────────────────── */}
          <div className="mh-glass p-5">
            <BehaviourInsightPanel scores={scores} latched={latched} />
          </div>

        </div>
      </main>

      {/* Bounce animation for loading dots */}
      <style>{`
        @keyframes dotBounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}