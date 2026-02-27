import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { COURSES, SUBJECTS } from "../data/CourseData";

// ─── Level Badge ─────────────────────────────────────────────────────────────
function LevelBadge({ level }) {
  const map = {
    Beginner:     "bg-emerald-500/20 text-emerald-400",
    Intermediate: "bg-amber-500/20 text-amber-400",
    Advanced:     "bg-rose-500/20 text-rose-400",
  };
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${map[level] || map.Beginner}`}>
      {level}
    </span>
  );
}

// ─── Video Card ───────────────────────────────────────────────────────────────
function VideoCard({ video, subject, index, onClick }) {
  const [hovered, setHovered] = useState(false);
  const subj = SUBJECTS[subject];

  return (
    <div
      onClick={() => onClick(video)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        animationDelay: `${index * 80}ms`,
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered ? `0 20px 50px ${subj.color}30` : "0 2px 16px rgba(0,0,0,0.3)",
        borderColor: hovered ? subj.color + "60" : "rgba(255,255,255,0.06)",
        transition: "all 0.35s cubic-bezier(0.23,1,0.32,1)",
      }}
      className="group relative bg-[#0d1117] border rounded-2xl overflow-hidden cursor-pointer animate-fadeUp"
    >
      {/* Thumbnail */}
      <div
        style={{ background: `linear-gradient(135deg, ${subj.color}20, ${subj.accent}20)` }}
        className="relative aspect-video flex items-center justify-center overflow-hidden"
      >
        <span className="text-5xl opacity-60 group-hover:scale-110 transition-transform duration-300">
          {subj.emoji}
        </span>
        {/* Play overlay */}
        <div
          style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.3s" }}
          className="absolute inset-0 bg-black/40 flex items-center justify-center"
        >
          <div
            style={{ background: `linear-gradient(135deg, ${subj.color}, ${subj.accent})` }}
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
          >
            <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {/* Duration pill */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-0.5 rounded-md">
          {video.duration}
        </div>
        {/* Index */}
        <div className="absolute top-2 left-2 w-7 h-7 bg-black/60 rounded-lg flex items-center justify-center text-xs font-black text-white/60">
          {index + 1}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-white font-bold text-sm leading-tight flex-1">{video.title}</h3>
          <LevelBadge level={video.level} />
        </div>
        <p className="text-white/40 text-xs leading-relaxed line-clamp-2">{video.description}</p>
      </div>

      {/* Bottom accent bar */}
      <div
        style={{
          background: `linear-gradient(90deg, ${subj.color}, ${subj.accent})`,
          transform: hovered ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left",
          transition: "transform 0.3s ease",
        }}
        className="absolute bottom-0 left-0 right-0 h-0.5"
      />
    </div>
  );
}

// ─── Subject Tab ─────────────────────────────────────────────────────────────
function SubjectTab({ subj, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? `linear-gradient(135deg, ${subj.color}, ${subj.accent})` : "rgba(255,255,255,0.04)",
        borderColor: active ? "transparent" : "rgba(255,255,255,0.08)",
        color: active ? "#fff" : "rgba(255,255,255,0.5)",
        transform: active ? "scale(1.04)" : "scale(1)",
        boxShadow: active ? `0 8px 30px ${subj.color}50` : "none",
        transition: "all 0.3s ease",
      }}
      className="flex items-center gap-2.5 px-6 py-3 rounded-2xl border font-black text-sm"
    >
      <span className="text-xl">{subj.emoji}</span>
      <span>{subj.title}</span>
      <span
        style={{
          background: active ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
          color: active ? "#fff" : "rgba(255,255,255,0.4)",
        }}
        className="text-xs px-2 py-0.5 rounded-full font-black"
      >
        {COURSES[subj.id].length}
      </span>
    </button>
  );
}

// ─── CoursesPage ──────────────────────────────────────────────────────────────
export default function CoursesPage() {
  const [activeSubject, setActiveSubject] = useState("maths");
  const navigate = useNavigate();
  const subj = SUBJECTS[activeSubject];
  const videos = COURSES[activeSubject];

  const handleVideoClick = (video) => {
    navigate(`/courses/${video.subject}/${video.id}`);
  };

  return (
    <div className="min-h-screen bg-[#060a10]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&family=Baloo+2:wght@800;900&display=swap');
        * { font-family: 'Nunito', sans-serif; }
        .font-display { font-family: 'Baloo 2', cursive; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp { animation: fadeUp 0.6s ease both; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12">

        {/* Header */}
        <div className="mb-10 animate-fadeUp">
          <p className="text-white/30 text-xs font-black tracking-[0.3em] uppercase mb-3">✦ Saahas Learning ✦</p>
          <h1 className="font-display text-5xl md:text-6xl font-black text-white leading-tight mb-3">
            Explore <span style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", background: `linear-gradient(135deg, ${subj.color}, ${subj.accent})`, backgroundClip: "text" }}>
              {subj.title}
            </span>
          </h1>
          <p className="text-white/40 max-w-lg text-base">{subj.description}</p>
        </div>

        {/* Subject Tabs */}
        <div className="flex flex-wrap gap-3 mb-12 animate-fadeUp" style={{ animationDelay: "100ms" }}>
          {Object.values(SUBJECTS).map((s) => (
            <SubjectTab
              key={s.id}
              subj={s}
              active={activeSubject === s.id}
              onClick={() => setActiveSubject(s.id)}
            />
          ))}
        </div>

        {/* Video Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {videos.map((v, i) => (
            <VideoCard
              key={v.id}
              video={v}
              subject={activeSubject}
              index={i}
              onClick={handleVideoClick}
            />
          ))}
        </div>

        {/* Empty state if no videos */}
        {videos.length === 0 && (
          <div className="text-center py-24 text-white/20">
            <div className="text-6xl mb-4">{subj.emoji}</div>
            <p className="font-bold text-lg">No videos yet — coming soon!</p>
          </div>
        )}
      </main>
    </div>
  );
}