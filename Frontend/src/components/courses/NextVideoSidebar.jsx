import { useNavigate } from "react-router-dom";
import { SUBJECTS } from "../../data/CourseData";

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function LevelDot({ level }) {
  const map = {
    Beginner: "#06d6a0",
    Intermediate: "#f9c74f",
    Advanced: "#ff6b6b",
  };
  return <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: map[level] || "#06d6a0" }} />;
}

export default function NextVideoSidebar({ currentVideoId, videos, subject }) {
  const navigate = useNavigate();
  const subj = SUBJECTS[subject];

  const currentIndex = videos.findIndex((v) => v.id === currentVideoId);

  const handleClick = (video) => {
    navigate(`/courses/${video.subject}/${video.id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-1">
      <p className="text-white/30 text-[10px] font-black uppercase tracking-widest px-1 mb-2">
        Up Next — {subj.title}
      </p>

      {videos.map((video, idx) => {
        const isCurrent = video.id === currentVideoId;
        const isDone = idx < currentIndex;

        return (
          <div
            key={video.id}
            onClick={() => !isCurrent && handleClick(video)}
            style={{
              borderColor: isCurrent ? subj.color + "60" : "rgba(255,255,255,0.05)",
              background: isCurrent
                ? `linear-gradient(135deg, ${subj.color}12, ${subj.accent}08)`
                : "rgba(255,255,255,0.02)",
              cursor: isCurrent ? "default" : "pointer",
              opacity: isDone ? 0.5 : 1,
              transition: "all 0.25s ease",
            }}
            className="group flex gap-3 items-center p-3 rounded-xl border hover:border-white/20 hover:bg-white/5"
          >
            {/* Thumbnail / Index */}
            <div
              style={{
                background: isCurrent
                  ? `linear-gradient(135deg, ${subj.color}, ${subj.accent})`
                  : "rgba(255,255,255,0.06)",
                minWidth: 48,
              }}
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 relative"
            >
              {isDone ? (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              ) : isCurrent ? (
                <div className="flex gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-0.5 bg-white rounded-full animate-bounce"
                      style={{ height: 14, animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              ) : (
                <span className="text-white/50 text-xs font-black">{idx + 1}</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p
                style={{ color: isCurrent ? subj.accent : "rgba(255,255,255,0.85)" }}
                className="text-xs font-bold leading-tight truncate mb-1"
              >
                {video.title}
              </p>
              <div className="flex items-center gap-1.5">
                <LevelDot level={video.level} />
                <span className="text-white/30 text-[10px]">{video.level}</span>
                <span className="text-white/20 text-[10px]">·</span>
                <span className="text-white/30 text-[10px]">{video.duration}</span>
              </div>
            </div>

            {/* Play arrow */}
            {!isCurrent && (
              <svg
                className="w-4 h-4 text-white/20 group-hover:text-white/60 flex-shrink-0 transition-colors"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}

            {isCurrent && (
              <span
                style={{ background: `linear-gradient(135deg, ${subj.color}, ${subj.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                className="text-[10px] font-black flex-shrink-0"
              >
                PLAYING
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}