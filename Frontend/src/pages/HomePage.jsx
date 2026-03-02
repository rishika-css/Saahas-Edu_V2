import React, { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBraille, faHands, faChartBar, faGamepad, faBrain } from '@fortawesome/free-solid-svg-icons';

const features = [
  { path: '/braille', icon: <FontAwesomeIcon icon={faBraille} className="text-[#a855f7]" />, label: 'Braille System', short: 'Text to Braille conversion hub.', detail: 'Convert standard text into tactile Braille patterns instantly with our high-fidelity translation engine.', color: '#a855f7' },
  { path: '/sign-language', icon: <FontAwesomeIcon icon={faHands} className="text-[#3b82f6]" />, label: 'Sign Language', short: 'AI-powered gesture learning.', detail: 'Learn hand gestures through real-time AI feedback, designed to bridge communication gaps for the hearing impaired.', color: '#3b82f6' },
  { path: '/dashboard', icon: <FontAwesomeIcon icon={faChartBar} className="text-[#22c55e]" />, label: 'My Dashboard', short: 'Visualize your learning stats.', detail: 'Monitor your academic journey with integrated behavioral insights and progress tracking.', color: '#22c55e' },
  { path: '/games', icon: <FontAwesomeIcon icon={faGamepad} className="text-[#eab308]" />, label: 'Games for Everyone', short: 'Cognitive play for all abilities.', detail: 'Neuro-diverse gaming modules that adapt difficulty based on user interaction speed and focus.', color: '#eab308' },
  { path: '/mental-health', icon: <FontAwesomeIcon icon={faBrain} className="text-[#f43f5e]" />, label: 'Mental Health', short: 'Mood tracking & wellness hub.', detail: 'Access curated wellness resources and track emotional health patterns using our AI sentiment tools.', color: '#f43f5e' },
];

export default function HomePage() {
  const { user } = useAuth();
  const targetRef = useRef(null);

  // Progress for the timeline line
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end end"]
  });

  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <div className="bg-[#f5f5f7] dark:bg-[#050a14] transition-colors duration-500 selection:bg-[#0071e3]">
      <Navbar />

      {/* ── SECTION 1: THE SPIRAL ORBIT (HERO) ── */}
      <section className="h-screen flex flex-col items-center justify-center overflow-hidden sticky top-0 z-10">
        <div className="text-center mb-16 z-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tighter text-[#1d1d1f] dark:text-white"
          >
            Welcome, <span className="text-[#0071e3] italic">{user?.name || "Learner"}</span>.
          </motion.h1>
          <p className="text-black/40 dark:text-white/40 font-bold uppercase tracking-[0.4em] text-[10px] mt-4">
            Select a module to begin // 2026
          </p>
        </div>

        {/* Spiral Motion */}
        <div className="relative w-full max-w-5xl h-[300px] flex items-center justify-center">
          {features.map((f, i) => {
            const angle = (i / features.length) * Math.PI * 2;
            return (
              <motion.div
                key={f.path}
                animate={{
                  x: [Math.cos(angle) * 350, Math.cos(angle + Math.PI * 2) * 350],
                  y: [Math.sin(angle) * 120, Math.sin(angle + Math.PI * 2) * 120],
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                className="absolute cursor-pointer group"
              >
                <Link to={f.path}>
                  <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-black/5 dark:border-white/10 w-44 text-center shadow-2xl transition-all group-hover:border-[#0071e3]">
                    <span className="text-4xl block mb-2">{f.icon}</span>
                    <h3 className="font-bold text-xs uppercase tracking-tighter dark:text-white">{f.label}</h3>
                  </div>
                </Link>
              </motion.div>
            );
          })}
          {/* Hub */}
          <div className="w-20 h-20 bg-black dark:bg-[#0071e3] rounded-2xl flex items-center justify-center text-white text-2xl font-black italic shadow-2xl z-10">S</div>
        </div>
      </section>

      {/* ── SECTION 2: TIMELINE FEATURE PANEL ── */}
      <section ref={targetRef} className="relative z-20 bg-white dark:bg-[#050a14] pt-20 pb-40 px-10">
        <div className="max-w-5xl mx-auto relative">

          {/* Vertical Timeline Line */}
          <motion.div
            style={{ scaleY }}
            className="absolute left-0 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#0071e3] to-transparent origin-top hidden md:block"
          />

          <div className="space-y-60">
            {features.map((f, i) => (
              <TimelineItem key={i} feature={f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-black/5 dark:border-white/5 text-center text-[10px] font-black uppercase tracking-[0.5em] text-black/20 dark:text-white/10">
        Saahas Archive // Inclusive Education Engine
      </footer>
    </div>
  );
}

function TimelineItem({ feature, index }) {
  const isEven = index % 2 === 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      className={`relative flex flex-col md:flex-row items-center justify-between gap-10 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
    >
      {/* Visual Side */}
      <div className="w-full md:w-[45%] flex justify-center">
        <div className="relative group">
          <div className="absolute inset-0 bg-[#0071e3]/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="text-[120px] relative z-10 filter drop-shadow-2xl">{feature.icon}</span>
        </div>
      </div>

      {/* Connection Point (Center Circle) */}
      <div className="absolute left-[-9px] md:left-1/2 md:ml-[-8px] w-4 h-4 rounded-full bg-black dark:bg-[#0071e3] hidden md:block" />

      {/* Content Side */}
      <div className={`w-full md:w-[45%] text-center ${isEven ? 'md:text-left' : 'md:text-right'}`}>
        <h3 className="text-4xl font-extrabold tracking-tighter mb-4 dark:text-white">{feature.label}</h3>
        <p className="text-[#0071e3] font-black text-[10px] uppercase tracking-widest mb-4 italic">{feature.short}</p>
        <p className="text-black/50 dark:text-white/40 font-medium text-lg leading-relaxed mb-8">{feature.detail}</p>
        <Link
          to={feature.path}
          className="inline-block bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform"
        >
          Enter Module 〉
        </Link>
      </div>
    </motion.div>
  );
}