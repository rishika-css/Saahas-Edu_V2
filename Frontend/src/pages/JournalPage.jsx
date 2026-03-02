import { useState, useEffect, useRef } from "react";
import Navbar from "../components/common/Navbar";
import useBehaviourAi from "../hooks/useBehaviourAi";
import BehaviourInsightPanel from "../components/mentalheath/BehaviourInsightPanel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRainbow,
  faSpa,
  faMicrophone,
  faStop,
  faVolumeHigh,
  faVolumeXmark,
  faLock,
  faBrain
} from "@fortawesome/free-solid-svg-icons";

/* ================================================================
   IMPORTANT:
   Add this to your .env file

   VITE_GROQ_API_KEY=your_key_here
================================================================ */

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `You are a warm, empathetic mental health journal companion called "Aura" for a safe private journaling app used in India.

Your personality:
- Caring, gentle, non-judgmental
- Culturally aware of Indian context
- Concise: 2-4 sentences unless more needed
- Always validate feelings first
- Ask ONE thoughtful follow-up question
- Never diagnose
- If distress detected, gently suggest speaking to someone trusted

Crisis protocol: If user mentions suicide/self-harm — share:
Kiran Mental Health Helpline 1800-599-0019 (free, 24/7, multilingual).`;

export default function JournalPage() {

  const { getScores, latched } = useBehaviourAi() || {};
  const scores = getScores ? getScores() : null;

  const GREETING = "Hello! What's on your mind today?";
  const [messages, setMessages] = useState([
    { role: "assistant", text: GREETING }
  ]);

  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(true);

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef("");
  const autoSendRef = useRef(false);
  const [interimText, setInterimText] = useState("");
  const listeningRef = useRef(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Speak the greeting on mount + cleanup on unmount
  useEffect(() => {
    const t = setTimeout(() => speak(GREETING), 500);
    return () => {
      clearTimeout(t);
      clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  function resetSilenceTimer() {
    clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      console.log("[Speech] 5s silence — auto-sending. Text:", inputRef.current);
      autoSendRef.current = true;
      stopListening();
    }, 5000);
  }

  function startListening() {
    if (recognitionRef.current) return;

    // IMPORTANT: stop any ongoing speech synthesis first — it blocks the mic
    window.speechSynthesis?.cancel();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    // Reset state
    setInputText("");
    setInterimText("");
    inputRef.current = "";
    autoSendRef.current = false;
    listeningRef.current = true;
    setListening(true);

    // Small delay to ensure speechSynthesis releases the audio channel
    let networkRetries = 0;
    const MAX_RETRIES = 3;

    setTimeout(() => {
      if (!listeningRef.current) return; // user may have cancelled

      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.continuous = false;       // single utterance — most reliable
      recognition.interimResults = true;    // show words in real time

      recognition.onresult = (event) => {
        networkRetries = 0; // successful result = connection works
        let finalText = "";
        let interim = "";
        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcript;
          } else {
            interim += transcript;
          }
        }
        console.log("[Speech] result — final:", JSON.stringify(finalText), "interim:", JSON.stringify(interim));

        if (finalText) {
          setInputText(prev => {
            const next = (prev + " " + finalText).trim();
            inputRef.current = next;
            return next;
          });
          setInterimText("");
          resetSilenceTimer();
        } else if (interim) {
          setInterimText(interim);
          resetSilenceTimer();
        }
      };

      recognition.onerror = (e) => {
        console.warn("[Speech] error:", e.error);

        // Fatal errors — stop completely
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          alert("Microphone permission denied. Please allow microphone in browser settings.");
          recognitionRef.current = null;
          listeningRef.current = false;
          setListening(false);
          return;
        }

        // Network error — Google's speech servers unreachable
        if (e.error === "network") {
          networkRetries++;
          console.warn("[Speech] network error, retry", networkRetries, "of", MAX_RETRIES);
          if (networkRetries >= MAX_RETRIES) {
            alert(
              "Speech recognition can't connect to Google's servers.\n\n" +
              "Please check:\n" +
              "1. You have a working internet connection\n" +
              "2. You're accessing the app via localhost (not an IP address)\n" +
              "3. No firewall/proxy is blocking Google services"
            );
            recognitionRef.current = null;
            listeningRef.current = false;
            setListening(false);
            return;
          }
          // Will retry via onend below
        }
        // "no-speech" / "aborted" are normal — let onend restart
      };

      recognition.onend = () => {
        console.log("[Speech] onend — listeningRef:", listeningRef.current, "autoSend:", autoSendRef.current);
        // Auto-restart for next utterance (single-utterance chaining)
        if (listeningRef.current && !autoSendRef.current) {
          try {
            recognition.start();
            console.log("[Speech] restarted for next utterance");
          } catch (err) {
            console.warn("[Speech] restart failed:", err);
          }
        }
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
        console.log("[Speech] started");
      } catch (err) {
        console.error("[Speech] failed to start:", err);
        recognitionRef.current = null;
        listeningRef.current = false;
        setListening(false);
      }
    }, 300);
  }

  function stopListening() {
    clearTimeout(silenceTimerRef.current);
    const textToSend = inputRef.current.trim();
    const shouldAutoSend = autoSendRef.current && textToSend;

    listeningRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // prevent auto-restart
      try { recognitionRef.current.stop(); } catch (_) { }
      recognitionRef.current = null;
    }
    setListening(false);
    setInterimText("");

    if (shouldAutoSend) {
      autoSendRef.current = false;
      console.log("[Speech] auto-sending:", textToSend);
      setTimeout(() => handleSend(), 200);
    }
    autoSendRef.current = false;
  }

  function speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[\u{1F300}-\u{1FFFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "");
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "en-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  }

  function checkCrisis(text) {
    const words = [
      "suicide",
      "kill myself",
      "end my life",
      "want to die",
      "self harm"
    ];
    return words.some(k => text.toLowerCase().includes(k));
  }

  async function sendToGroq(userText, history) {

    const formattedMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(1).map(msg => ({
        role: msg.role,
        content: msg.text
      })),
      { role: "user", content: userText }
    ];

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: formattedMessages,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Groq error:", err);
      throw new Error("Connection failed");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async function handleSend() {
    const text = (inputText || inputRef.current).trim();
    if (!text || loading) return;

    if (listening) stopListening();

    if (checkCrisis(text)) {
      const crisisReply =
        "I'm really glad you told me. You matter. Please reach out to Kiran Mental Health Helpline: 1800-599-0019 (24/7).";
      setMessages(prev => [
        ...prev,
        { role: "user", text },
        { role: "assistant", text: crisisReply, crisis: true }
      ]);
      setInputText("");
      inputRef.current = "";
      speak(crisisReply);
      return;
    }

    const updated = [...messages, { role: "user", text }];
    setMessages(updated);
    setInputText("");
    inputRef.current = "";
    setLoading(true);

    try {
      const reply = await sendToGroq(text, updated);
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);
      speak(reply);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "assistant", text: "Connection issue. Please try again.", error: true }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mh-page">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        <h2 className="text-2xl font-black">
          <FontAwesomeIcon icon={faRainbow} className="mr-2" />
          Safe Mental Support Space
        </h2>

        <div className="grid lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 mh-glass flex flex-col" style={{ height: "75vh" }}>

            <div className="flex items-center gap-3 px-5 py-4 border-b">
              <FontAwesomeIcon icon={faSpa} />
              <div>
                <p className="font-black text-sm">Aura</p>
                <p className="text-xs text-gray-400">AI Companion · Groq (LLaMA 3)</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="bg-white rounded-xl px-4 py-2 shadow">
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && <div>Typing...</div>}
              <div ref={chatEndRef} />
            </div>

            <div className="px-5 py-4 border-t border-white/10">
              {listening && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6366f1", fontWeight: 600, marginBottom: 8 }} className="animate-pulse">
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
                  Listening... auto-sends after 5s of silence
                </div>
              )}
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <textarea
                  value={inputText + (interimText ? interimText : "")}
                  onChange={e => { setInputText(e.target.value); inputRef.current = e.target.value; }}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  rows={2}
                  placeholder={listening ? "Speak now — I'm listening..." : "Type here or press the mic... (Enter to send)"}
                  style={{
                    flex: 1, padding: "10px 14px", borderRadius: 16,
                    border: listening ? "2px solid #6366f1" : "1.5px solid #e5e7eb",
                    resize: "none", fontSize: 14, outline: "none",
                    background: "rgba(255,255,255,0.85)", fontFamily: "inherit", lineHeight: 1.5,
                    color: "#1f2937",
                  }}
                />
                <button
                  onClick={listening ? stopListening : startListening}
                  style={{
                    width: 44, height: 44, borderRadius: "50%", border: "none",
                    background: listening ? "linear-gradient(135deg, #ef4444, #f97316)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "white", fontSize: 18, cursor: "pointer", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    animation: listening ? "mhPulse 1.5s ease-in-out infinite" : "none",
                  }}
                >
                  <FontAwesomeIcon icon={listening ? faStop : faMicrophone} />
                </button>
                <button
                  onClick={() => { setVoiceMode(v => !v); if (voiceMode) window.speechSynthesis?.cancel(); }}
                  style={{
                    width: 44, height: 44, borderRadius: "50%", border: "none",
                    background: voiceMode ? "#1f2937" : "#e5e7eb",
                    color: voiceMode ? "white" : "#6b7280",
                    fontSize: 16, cursor: "pointer", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <FontAwesomeIcon icon={voiceMode ? faVolumeHigh : faVolumeXmark} />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || loading}
                  style={{
                    height: 44, borderRadius: 22, border: "none",
                    padding: "0 20px",
                    background: inputText.trim() && !loading ? "linear-gradient(135deg, #7c3aed, #6366f1)" : "#e5e7eb",
                    color: inputText.trim() && !loading ? "white" : "#9ca3af",
                    fontSize: 13, fontWeight: 700, cursor: inputText.trim() && !loading ? "pointer" : "default",
                    flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    whiteSpace: "nowrap",
                  }}
                >
                  <FontAwesomeIcon icon={faBrain} /> Reflect with AI
                </button>
              </div>
              <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", marginTop: 8 }}>
                <FontAwesomeIcon icon={faLock} style={{ marginRight: 4 }} /> Private · Speak freely, auto-sends when you pause
              </p>
            </div>

          </div>

          <div className="mh-glass p-5">
            <BehaviourInsightPanel scores={scores} latched={latched} />
          </div>

        </div>
      </main>
    </div>
  );
}