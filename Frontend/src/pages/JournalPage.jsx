import { useState, useEffect, useRef } from "react";
import Navbar from "../components/common/Navbar";
import useBehaviourAI from "../hooks/useBehaviourAI";
import BehaviourInsightPanel from "../components/mentalheath/BehaviourInsightPanel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRainbow,
  faSpa,
  faPhone,
  faMicrophone,
  faStop,
  faVolumeHigh,
  faVolumeXmark,
  faPaperPlane,
  faLock
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

  const { getScores, latched } = useBehaviourAI() || {};
  const scores = getScores ? getScores() : null;

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi, I'm Aura — your safe space to think out loud. What's on your mind today?"
    }
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function resetSilenceTimer() {
    clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      autoSendRef.current = true;
      stopListening();
    }, 3000);
  }

  function createRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
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
        resetSilenceTimer();
      }
    };

    recognition.onend = () => {
      if (recognitionRef.current && !autoSendRef.current) {
        try { recognition.start(); } catch (_) { }
      }
    };

    recognition.onerror = (e) => {
      if (e.error === "not-allowed") {
        alert("Microphone permission denied.");
        recognitionRef.current = null;
        setListening(false);
      }
    };

    return recognition;
  }

  function startListening() {
    if (recognitionRef.current) return;

    const recognition = createRecognition();
    if (!recognition) {
      alert("Speech recognition not supported.");
      return;
    }

    setInputText("");
    inputRef.current = "";
    autoSendRef.current = false;

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  function stopListening() {
    clearTimeout(silenceTimerRef.current);
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);

    if (autoSendRef.current && inputRef.current.trim()) {
      autoSendRef.current = false;
      setTimeout(() => handleSend(), 100);
    }
    autoSendRef.current = false;
  }

  function speak(text) {
    if (!voiceMode || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
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

            <div className="px-5 py-4 border-t flex gap-2">
              <textarea
                value={inputText}
                onChange={e => { setInputText(e.target.value); inputRef.current = e.target.value; }}
                rows={2}
                className="flex-1 border rounded p-1 text-white bg-yellow-500"
                placeholder="Type here..."
              />
              <button onClick={handleSend} className="bg-yellow-500 text-white px-4 rounded">
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
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