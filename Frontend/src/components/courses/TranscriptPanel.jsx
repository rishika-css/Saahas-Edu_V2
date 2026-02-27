import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';

export default function TranscriptPanel({ transcript = [], currentTime, color = "#06d6a0", accent = "#4cc9f0" }) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const activeRef = useRef(null);

  // Find active transcript line
  useEffect(() => {
    let idx = -1;
    for (let i = 0; i < transcript.length; i++) {
      if (currentTime >= transcript[i].time) {
        idx = i;
      } else {
        break;
      }
    }
    setActiveIndex(idx);
  }, [currentTime, transcript]);

  // Auto-scroll to active line
  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeIndex]);

  if (!transcript || transcript.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-white/20 text-sm">
        <span className="text-3xl mb-2"><FontAwesomeIcon icon={faFileAlt} /></span>
        No transcript available
      </div>
    );
  }

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  return (
    <div ref={containerRef} className="space-y-1 overflow-y-auto max-h-[340px] pr-1 custom-scroll">
      {transcript.map((line, i) => {
        const isActive = i === activeIndex;
        const isPast = i < activeIndex;

        return (
          <div
            key={i}
            ref={isActive ? activeRef : null}
            style={{
              background: isActive ? `linear-gradient(135deg, ${color}18, ${accent}10)` : "transparent",
              borderLeft: isActive ? `3px solid ${color}` : "3px solid transparent",
              transition: "all 0.3s ease",
            }}
            className="flex gap-3 px-3 py-2.5 rounded-xl cursor-default"
          >
            {/* Timestamp */}
            <span
              style={{ color: isActive ? color : "rgba(255,255,255,0.2)" }}
              className="text-xs font-black tabular-nums pt-0.5 flex-shrink-0 w-10"
            >
              {formatTime(line.time)}
            </span>

            {/* Text */}
            <p
              style={{
                color: isActive
                  ? "#ffffff"
                  : isPast
                    ? "rgba(255,255,255,0.35)"
                    : "rgba(255,255,255,0.5)",
                fontWeight: isActive ? 700 : 400,
                fontSize: isActive ? "0.95rem" : "0.875rem",
                transition: "all 0.3s ease",
              }}
            >
              {isActive && (
                <span
                  style={{ background: `linear-gradient(135deg, ${color}, ${accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
                  className="mr-1"
                >
                  ▸
                </span>
              )}
              {line.text}
            </p>
          </div>
        );
      })}

      {/* End of transcript */}
      <div className="pt-2 pb-1 text-center text-white/15 text-xs">— end of transcript —</div>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>
    </div>
  );
}