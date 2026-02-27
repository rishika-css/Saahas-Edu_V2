import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import VideoPlayer from "../components/courses/VideoPlayer";
import TranscriptPanel from "../components/courses/TranscriptPanel";
import NextVideoSidebar from "../components/courses/NextVideoSidebar";
import { COURSES, SUBJECTS } from "../data/CourseData";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilm, faFileAlt, faInfoCircle, faCircle, faBraille, faHandPeace, faFileLines, faVolumeHigh, faPalette } from '@fortawesome/free-solid-svg-icons';

export default function VideoPlayerPage() {
  const { subject, videoId } = useParams();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(0);

  // Live Transcript State
  const [liveTranscript, setLiveTranscript] = useState([]);
  const [isLiveEnabled, setIsLiveEnabled] = useState(false);
  const recognitionRef = useRef(null);
  const currentTimeRef = useRef(0);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    // Reset live transcript when video changes
    setLiveTranscript([]);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { }
    }
  }, [videoId]);

  // Initialize SpeechRecognition once
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;

      setLiveTranscript((prev) => [
        ...prev,
        { time: Math.floor(currentTimeRef.current), text: transcriptText.trim() }
      ]);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleVideoPlay = () => {
    if (isLiveEnabled && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Failed to start speech recognition (it might already be running)", e);
      }
    }
  };

  const handleVideoPause = () => {
    if (isLiveEnabled && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore error if already stopped
      }
    }
  };

  const toggleLiveTranscription = () => {
    setIsLiveEnabled((prev) => !prev);
  };

  const subj = SUBJECTS[subject];
  const videos = COURSES[subject] || [];
  const video = videos.find((v) => v.id === videoId);

  if (!subj || !video) {
    return (
      <div className="min-h-screen bg-[#060a10] flex items-center justify-center">
        <div className="text-center text-white/30">
          <div className="text-5xl mb-4" style={{ color: "#a855f7" }}><FontAwesomeIcon icon={faFilm} /></div>
          <p className="font-bold text-white">Video not found</p>
          <button
            onClick={() => navigate("/courses")}
            className="mt-4 text-sm text-purple-400 hover:underline"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const currentIndex = videos.findIndex((v) => v.id === videoId);
  const nextVideo = videos[currentIndex + 1];

  return (
    <div className="min-h-screen bg-[#060a10]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&family=Baloo+2:wght@800;900&display=swap');
        * { font-family: 'Nunito', sans-serif; }
        .font-display { font-family: 'Baloo 2', cursive; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp { animation: fadeUp 0.5s ease both; }
      `}</style>

      <Navbar />

      <main className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 animate-fadeUp">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-white/30 mb-5 font-bold">
          <button onClick={() => navigate("/courses")} className="hover:text-white/60 transition">
            Courses
          </button>
          <span>/</span>
          <button
            onClick={() => navigate("/courses")}
            style={{ color: subj.color }}
            className="hover:opacity-80 transition"
          >
            <FontAwesomeIcon icon={subj.icon} className="mr-1" /> {subj.title}
          </button>
          <span>/</span>
          <span className="text-white/50 truncate max-w-48">{video.title}</span>
        </div>

        {/* Main layout: video+next videos LEFT, transcript RIGHT */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-5">

            {/* Video Player */}
            <VideoPlayer
              src={video.videoUrl}
              onTimeUpdate={setCurrentTime}
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              color={subj.color}
              accent={subj.accent}
            />

            {/* Video Title + Meta */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="font-display text-2xl md:text-3xl font-black text-white leading-tight mb-2">
                    {video.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      style={{ background: `linear-gradient(135deg, ${subj.color}, ${subj.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
                      className="font-black text-sm"
                    >
                      <FontAwesomeIcon icon={subj.icon} className="mr-1" /> {subj.title}
                    </span>
                    <span className="text-white/20">·</span>
                    <span className="text-white/40 text-sm">⏱ {video.duration}</span>
                    <span className="text-white/20">·</span>
                    <span
                      style={{
                        background: { Beginner: "rgba(6,214,160,0.15)", Intermediate: "rgba(249,199,79,0.15)", Advanced: "rgba(255,107,107,0.15)" }[video.level],
                        color: { Beginner: "#06d6a0", Intermediate: "#f9c74f", Advanced: "#ff6b6b" }[video.level],
                      }}
                      className="text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider"
                    >
                      {video.level}
                    </span>
                    <span className="text-white/20">·</span>
                    <span className="text-white/40 text-xs">
                      Lesson {currentIndex + 1} of {videos.length}
                    </span>
                  </div>
                </div>

                {/* Next video shortcut */}
                {nextVideo && (
                  <button
                    onClick={() => navigate(`/courses/${nextVideo.subject}/${nextVideo.id}`)}
                    style={{
                      background: `linear-gradient(135deg, ${subj.color}22, ${subj.accent}22)`,
                      borderColor: subj.color + "40",
                    }}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold text-white/70 hover:text-white transition-all hover:scale-105"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/5" />

            {/* Next Videos — below the player */}
            <div
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
              className="bg-[#0a0f18] rounded-2xl border p-4"
            >
              <NextVideoSidebar
                currentVideoId={videoId}
                videos={videos}
                subject={subject}
              />
            </div>

            {/* About / Description */}
            <div
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
              className="bg-[#0a0f18] rounded-2xl border p-6 space-y-4"
            >
              <span
                style={{ background: `linear-gradient(135deg, ${subj.color}, ${subj.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                className="font-display font-black text-lg"
              >
                <FontAwesomeIcon icon={faInfoCircle} className="mr-1" /> About This Lesson
              </span>
              <p className="text-white/70 leading-relaxed text-sm">{video.description}</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Subject", value: subj.title },
                  { label: "Level", value: video.level },
                  { label: "Duration", value: video.duration },
                  { label: "Lesson", value: `${currentIndex + 1} / ${videos.length}` },
                ].map((item) => (
                  <div key={item.label} className="bg-white/4 rounded-xl p-3">
                    <p className="text-white/30 text-xs uppercase tracking-widest font-black mb-1">{item.label}</p>
                    <p className="text-white font-bold text-sm">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Accessibility features */}
              <div>
                <p className="text-white/30 text-xs uppercase tracking-widest font-black mb-3">Accessibility</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { icon: faBraille, label: "Braille Ready" },
                    { icon: faHandPeace, label: "Sign Language" },
                    { icon: faFileLines, label: "Transcript" },
                    { icon: faVolumeHigh, label: "Audio Support" },
                    { icon: faPalette, label: "High Contrast" },
                  ].map((f) => (
                    <span key={f.label} className="bg-white/5 border border-white/8 text-white/50 text-xs px-3 py-1.5 rounded-full font-bold">
                      <FontAwesomeIcon icon={f.icon} className="mr-1" /> {f.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR — Transcript ── */}
          <div className="space-y-5">

            {/* Transcript Panel */}
            <div
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
              className="bg-[#0a0f18] rounded-2xl border p-5 xl:sticky xl:top-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span
                    style={{ background: `linear-gradient(135deg, ${subj.color}, ${subj.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                    className="font-display font-black text-lg"
                  >
                    <FontAwesomeIcon icon={faFileAlt} className="mr-1" />
                    {isLiveEnabled ? "Live Transcript" : "Transcript"}
                  </span>
                  {isLiveEnabled && (
                    <div
                      style={{ background: subj.color }}
                      className="w-2 h-2 rounded-full animate-pulse"
                    />
                  )}
                </div>
                <button
                  onClick={toggleLiveTranscription}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all border ${isLiveEnabled
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-transparent border-white/10 text-white/40 hover:text-white"
                    }`}
                >
                  {isLiveEnabled ? <><FontAwesomeIcon icon={faCircle} style={{ color: '#ef4444' }} /> Live On</> : "Live Gen"}
                </button>
              </div>
              <TranscriptPanel
                transcript={isLiveEnabled ? liveTranscript : video.transcript}
                currentTime={currentTime}
                color={subj.color}
                accent={subj.accent}
              />
            </div>

            {/* All Subjects quick-nav */}
            <div
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
              className="bg-[#0a0f18] rounded-2xl border p-4"
            >
              <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-3">Other Subjects</p>
              <div className="space-y-2">
                {Object.values(SUBJECTS).filter(s => s.id !== subject).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => navigate("/courses")}
                    style={{ borderColor: "rgba(255,255,255,0.05)" }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border hover:bg-white/5 transition-all text-left group"
                  >
                    <span className="text-2xl"><FontAwesomeIcon icon={s.icon} /></span>
                    <div className="flex-1">
                      <p className="text-white/70 text-sm font-bold group-hover:text-white transition">{s.title}</p>
                      <p className="text-white/25 text-xs">{COURSES[s.id].length} lessons</p>
                    </div>
                    <svg className="w-3 h-3 text-white/20 group-hover:text-white/50 transition" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}