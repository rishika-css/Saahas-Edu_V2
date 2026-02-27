import React, { useEffect, useRef, useState } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { 
  Trophy, 
  Zap, 
  Accessibility, 
  RefreshCw, 
  Play, 
  Camera,
  Volume2
} from "lucide-react";

// Utils
import { detectGesture } from "../../utils/DetectGesture";
import { speak, getInstruction, compliment } from "../../utils/AssistantAI";

export default function SignAbility() {
  // --- STATE & REFS ---
  const videoRef = useRef(null);
  const animationRef = useRef(null);
  const historyRef = useRef([]);
  const autoMatchedRef = useRef(false);
  const targetRef = useRef("A");
  const aiReadyRef = useRef(false);

  const [isStarted, setIsStarted] = useState(false);
  const [gesture, setGesture] = useState("Waiting for Start...");
  const [target, setTarget] = useState("A");
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  // Sync ref for the prediction loop
  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  // --- AUDIO HELPERS ---
  const speakSafe = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setTimeout(() => {
      speak(text);
    }, 200);
  };

  // --- CORE LOGIC ---
  const handleNext = () => {
    autoMatchedRef.current = false;
    historyRef.current = [];
    setIsCorrect(false);
    const letters = ["A", "B", "C", "D", "L", "V", "W", "I", "Y"];
    const next = letters[Math.floor(Math.random() * letters.length)];
    setTarget(next);
  };

  const startSession = async () => {
    setLoading(true);
    setIsStarted(true);
    
    // 1. Initial Greeting (Now works because of click)
    speakSafe("Welcome to Sign Ability. Please allow camera access and prepare your hand.");

    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1
      });

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          aiReadyRef.current = true;
          setLoading(false);
          predict(handLandmarker);
        };
      }
    } catch (err) {
      console.error("AI Init Error:", err);
      setGesture("CAMERA ERROR");
      setLoading(false);
    }
  };

  const predict = (landmarker) => {
    if (videoRef.current && videoRef.current.readyState >= 2 && aiReadyRef.current) {
      const results = landmarker.detectForVideo(videoRef.current, performance.now());

      if (results.landmarks?.length) {
        const found = detectGesture(results.landmarks[0]);
        setGesture(found);

        // History buffering for stability
        historyRef.current.push(found);
        if (historyRef.current.length > 15) historyRef.current.shift();

        const matches = historyRef.current.filter(g => g === targetRef.current).length;

        // Threshold for success
        if (matches >= 10 && !autoMatchedRef.current) {
          autoMatchedRef.current = true;
          setIsCorrect(true);
          navigator.vibrate?.(100);
          setScore(prev => prev + 10);
          
          speakSafe(compliment());

          setTimeout(() => {
            handleNext();
          }, 2500);
        } else if (matches < 4) {
          setIsCorrect(false);
        }
      } else {
        setGesture("No Hand Detected");
      }
    }
    animationRef.current = requestAnimationFrame(() => predict(landmarker));
  };

  // Trigger instruction when letter changes
  useEffect(() => {
    if (!aiReadyRef.current) return;
    
    // Clear buffer for new letter
    historyRef.current = [];
    autoMatchedRef.current = false;

    const timer = setTimeout(() => {
      speakSafe(`Sign the letter ${target}. ${getInstruction(target)}`);
    }, 1000);

    return () => clearTimeout(timer);
  }, [target]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 font-sans selection:bg-indigo-500">
      
      {/* INITIAL START OVERLAY */}
      {!isStarted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md px-4 text-center">
          <div className="max-w-md">
            <div className="inline-flex p-4 bg-indigo-600 rounded-3xl mb-6 shadow-2xl shadow-indigo-500/40 animate-pulse">
              <Accessibility size={48} />
            </div>
            <h2 className="text-5xl font-black mb-4 tracking-tighter">SIGN ABILITY</h2>
            <p className="text-slate-400 mb-8 text-lg">Master American Sign Language with real-time AI feedback.</p>
            <button 
              onClick={startSession}
              className="group flex items-center gap-4 bg-white text-black px-10 py-5 rounded-2xl text-2xl font-black hover:bg-indigo-500 hover:text-white transition-all transform hover:scale-105 active:scale-95"
            >
              <Play fill="currentColor" /> START LEARNING
            </button>
          </div>
        </div>
      )}

      <nav className="max-w-7xl mx-auto flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl">
            <Accessibility size={24} />
          </div>
          <h1 className="text-xl font-black uppercase tracking-widest">
            SIGN<span className="text-indigo-500">ABILITY</span>
          </h1>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-800 px-6 py-2.5 rounded-2xl flex items-center gap-3 shadow-inner">
            <Trophy size={20} className="text-yellow-500" />
            <span className="font-mono font-bold text-lg">{score} PTS</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* VIDEO VIEWPORT */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden border-4 border-slate-800 shadow-2xl group">
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-bold text-slate-400">Booting Vision Engine...</p>
              </div>
            )}
            
            <video
              ref={videoRef}
              className="w-full h-full object-cover scale-x-[-1]"
              muted
              playsInline
            />

            {/* Target HUD */}
            <div className="absolute top-6 left-6 p-6 bg-slate-950/80 backdrop-blur-md rounded-3xl border border-white/10">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1 block">Your Target</span>
              <div className="text-8xl font-black leading-none">{target}</div>
            </div>

            {/* Success Overlay */}
            {isCorrect && (
              <div className="absolute inset-0 bg-green-500/20 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-300">
                <div className="bg-white text-green-600 px-12 py-6 rounded-3xl text-5xl font-black shadow-2xl scale-110 border-b-8 border-green-200">
                  PERFECT!
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR TOOLS */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* AI Result Card */}
          <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Zap size={60} className="text-indigo-500" />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Inference</span>
            </div>
            <div className="text-6xl font-mono font-bold text-white truncate">
              {gesture}
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2.5rem] shadow-xl flex-grow flex flex-col">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-white/10 rounded-lg">
                  <Volume2 size={20} />
               </div>
               <h3 className="text-xl font-bold">Pro-Tip</h3>
            </div>
            
            <p className="text-indigo-50 text-xl font-medium leading-relaxed mb-auto">
              "{getInstruction(target)}"
            </p>

            <button
              onClick={handleNext}
              disabled={!isCorrect}
              className={`mt-10 w-full py-6 rounded-2xl font-black flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-2xl ${
                isCorrect 
                  ? "bg-white text-indigo-700 hover:bg-indigo-50 translate-y-0" 
                  : "bg-indigo-400/20 text-indigo-300/50 cursor-not-allowed translate-y-2"
              }`}
            >
              <RefreshCw size={24} className={isCorrect ? "animate-spin-slow" : ""} />
              {isCorrect ? "NEXT LETTER" : "WAITING FOR MATCH"}
            </button>
          </div>

          {/* Footer Branding */}
          <div className="flex items-center justify-center gap-2 opacity-30 text-[10px] font-bold tracking-widest uppercase">
            <Camera size={12} /> Powered by MediaPipe Vision
          </div>
        </div>
      </main>
    </div>
  );
}