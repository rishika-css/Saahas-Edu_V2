import { useRef, useState, useEffect, useCallback } from "react";

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function VideoPlayer({ src, onTimeUpdate, color = "#06d6a0", accent = "#4cc9f0" }) {
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showRateMenu, setShowRateMenu] = useState(false);
  const controlsTimer = useRef(null);
  const containerRef = useRef(null);

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    resetControlsTimer();
    return () => clearTimeout(controlsTimer.current);
  }, [playing]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); setPlaying(false); }
    else { videoRef.current.play(); setPlaying(true); }
  };

  const handleTimeUpdate = () => {
    const t = videoRef.current?.currentTime || 0;
    setCurrentTime(t);
    onTimeUpdate?.(t);
    // Buffered
    const buf = videoRef.current?.buffered;
    if (buf && buf.length > 0) setBuffered((buf.end(buf.length - 1) / duration) * 100);
  };

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current?.duration || 0);
  };

  const handleProgressClick = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const newTime = ratio * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skip = (sec) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + sec));
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    videoRef.current.volume = val;
    setMuted(val === 0);
  };

  const toggleMute = () => {
    setMuted(!muted);
    videoRef.current.muted = !muted;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const setRate = (r) => {
    videoRef.current.playbackRate = r;
    setPlaybackRate(r);
    setShowRateMenu(false);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimer}
      onClick={() => { resetControlsTimer(); }}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden group select-none"
      style={{ cursor: showControls ? "default" : "none" }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setPlaying(false)}
        onClick={togglePlay}
      />

      {/* No-source placeholder */}
      {!src && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d1117]">
          <div
            style={{ background: `linear-gradient(135deg, ${color}20, ${accent}20)` }}
            className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
          >
            <svg className="w-10 h-10" style={{ color }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <p className="text-white/30 text-sm font-bold">Connect your AWS video URL</p>
          <p className="text-white/15 text-xs mt-1">Replace videoUrl in coursesData.js</p>
        </div>
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/20 via-transparent to-transparent" />

      {/* Big Play/Pause center button */}
      {!playing && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-20 h-20 rounded-full flex items-center justify-center cursor-pointer shadow-2xl hover:scale-110 transition-transform z-10"
          style={{ width: 72, height: 72, top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: `linear-gradient(135deg, ${color}, ${accent})`, position: "absolute" }}
        >
          <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      )}

      {/* Controls bar */}
      <div
        style={{
          opacity: showControls ? 1 : 0,
          transform: showControls ? "translateY(0)" : "translateY(8px)",
          transition: "all 0.3s ease",
        }}
        className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-8 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          className="relative w-full h-1.5 rounded-full cursor-pointer mb-3 group/prog"
          style={{ background: "rgba(255,255,255,0.15)" }}
        >
          {/* Buffered */}
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${buffered}%`, background: "rgba(255,255,255,0.2)" }}
          />
          {/* Played */}
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all"
            style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${color}, ${accent})` }}
          />
          {/* Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-lg opacity-0 group-hover/prog:opacity-100 transition-opacity"
            style={{ left: `${progress}%`, transform: `translateX(-50%) translateY(-50%)`, background: accent }}
          />
        </div>

        {/* Buttons row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="text-white hover:text-white/80 transition">
              {playing ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Skip back */}
            <button onClick={() => skip(-10)} className="text-white/70 hover:text-white text-xs font-black transition">
              ↩10
            </button>
            {/* Skip forward */}
            <button onClick={() => skip(10)} className="text-white/70 hover:text-white text-xs font-black transition">
              10↪
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="text-white/70 hover:text-white transition">
                {muted || volume === 0 ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                  </svg>
                )}
              </button>
              <input
                type="range" min="0" max="1" step="0.05"
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 accent-current cursor-pointer"
                style={{ accentColor: color }}
              />
            </div>

            {/* Time */}
            <span className="text-white/60 text-xs font-bold tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Playback rate */}
            <div className="relative">
              <button
                onClick={() => setShowRateMenu(!showRateMenu)}
                className="text-white/60 hover:text-white text-xs font-black transition px-2 py-1 rounded border border-white/10 hover:border-white/30"
              >
                {playbackRate}x
              </button>
              {showRateMenu && (
                <div className="absolute bottom-8 right-0 bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRate(r)}
                      style={{ color: r === playbackRate ? color : "rgba(255,255,255,0.7)" }}
                      className="block w-full text-left px-4 py-2 text-xs font-bold hover:bg-white/5 transition"
                    >
                      {r}x {r === playbackRate && "✓"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="text-white/70 hover:text-white transition">
              {fullscreen ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}