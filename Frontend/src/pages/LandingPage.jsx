import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { motion, useSpring, useScroll, useTransform } from "framer-motion";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faCalculator, faMicroscope, faBolt } from '@fortawesome/free-solid-svg-icons';

// ─── Custom Magnetic Cursor (Lando Style) ────────────────────────────────
function CustomCursor() {
  const cursorX = useSpring(0, { stiffness: 400, damping: 30 });
  const cursorY = useSpring(0, { stiffness: 400, damping: 30 });

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [cursorX, cursorY]);

  return (
    <motion.div
      style={{ x: cursorX, y: cursorY }}
      className="fixed top-0 left-0 w-8 h-8 border border-[#D2FF00] rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block"
    />
  );
}

// ─── Three.js Hero Scene ───────────────────────────────────────────────────
function ThreeHero() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const W = mountRef.current.clientWidth;
    const H = mountRef.current.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    camera.position.set(0, 0, 18);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffd166, 1.2);
    dirLight.position.set(5, 10, 8);
    scene.add(dirLight);

    // Particles
    const starGeo = new THREE.BufferGeometry();
    const starCount = 800;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 150;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xD2FF00, size: 0.15, transparent: true, opacity: 0.5 });
    scene.add(new THREE.Points(starGeo, starMat));

    // Kid Maker (Functionality maintained)
    function makeKid(x, y, z, bodyColor, capColor) {
      const group = new THREE.Group();
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), new THREE.MeshToonMaterial({ color: 0xffd6a5 }));
      head.position.y = 1.6; group.add(head);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.7, 8), new THREE.MeshToonMaterial({ color: capColor }));
      cap.position.y = 2.25; group.add(cap);
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 1.2, 12), new THREE.MeshToonMaterial({ color: bodyColor }));
      body.position.y = 0.6; group.add(body);
      group.position.set(x, y, z);
      group.userData.baseY = y;
      group.userData.phase = Math.random() * Math.PI * 2;
      group.userData.rotSpeed = (Math.random() - 0.5) * 0.004;
      return group;
    }

    const kids = [
      makeKid(-7, -1.5, 2, 0xff6b6b, 0xffd166),
      makeKid(-3.5, -2.5, 3, 0x06d6a0, 0xff6b6b),
      makeKid(0, -1.8, 1, 0x4cc9f0, 0x9b5de5),
      makeKid(3.5, -2.5, 3, 0xf9c74f, 0x4cc9f0),
      makeKid(7, -1.5, 2, 0x9b5de5, 0x06d6a0),
    ];
    kids.forEach((k) => scene.add(k));

    let mx = 0, my = 0;
    const onMouse = (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouse);

    const onResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener("resize", onResize);

    const animate = () => {
      requestAnimationFrame(animate);
      const t = performance.now() * 0.001;
      kids.forEach((k) => {
        k.position.y = k.userData.baseY + Math.sin(t * 1.2 + k.userData.phase) * 0.35;
        k.rotation.y += k.userData.rotSpeed;
      });
      camera.position.x += (mx * 4 - camera.position.x) * 0.05;
      camera.position.y += (my * 2 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full z-0" />;
}

// ─── Course Card (Lando Style) ───────────────────────────────────────────
function CourseCard({ emoji, title, color, accent, topics, delay, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
      className="group relative bg-[#111112] border border-white/10 p-10 overflow-hidden hover:border-[#D2FF00] transition-colors duration-500"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-black text-[#D2FF00] tracking-widest uppercase">LN // 04</span>
      </div>
      <div className="text-7xl mb-8 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">{emoji}</div>
      <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-6 group-hover:text-[#D2FF00]">
        {title}
      </h3>
      <div className="space-y-3 mb-10">
        {topics.map((t) => (
          <div key={t} className="flex items-center gap-3">
            <div className="w-1 h-1 bg-[#D2FF00]" />
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest group-hover:text-white/80">{t}</span>
          </div>
        ))}
      </div>
      <button onClick={onClick} className="w-full py-4 bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#D2FF00] transition-colors">
        Enter Module
      </button>
    </motion.div>
  );
}

// ─── Main Landing Page ─────────────────────────────────────────────────────
export default function LandingPage() {
  const coursesRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const courses = [
    { id: "english", emoji: <FontAwesomeIcon icon={faBookOpen} />, title: "English", color: "#ff6b6b", accent: "#D2FF00", topics: ["Reading", "Grammar", "Sign Language"] },
    { id: "maths", emoji: <FontAwesomeIcon icon={faCalculator} />, title: "Mathematics", color: "#06d6a0", accent: "#D2FF00", topics: ["Counting", "Geometry", "Visual Aids"] },
    { id: "science", emoji: <FontAwesomeIcon icon={faMicroscope} />, title: "Science", color: "#9b5de5", accent: "#D2FF00", topics: ["Living World", "Experiments", "Space"] },
  ];

  return (
    <div className="bg-[#050a14] min-h-screen text-white selection:bg-[#D2FF00] selection:text-black font-sans">
      <CustomCursor />

      {/* Visual Texture Overlays */}
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-5" style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '80px 80px' }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;700;900&display=swap');
        .font-display { font-family: 'Archivo Black', sans-serif; }
        .hero-title {
          background: linear-gradient(90deg, #D2FF00, #00FF85, #00A3FF, #D2FF00);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 4s linear infinite;
        }
        @keyframes shine { to { background-position: 200% center; } }
      `}</style>

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-[100] px-10 py-8 flex justify-between items-center transition-all duration-500 ${scrolled ? 'bg-black/90 backdrop-blur-md py-5 border-b border-white/10' : ''}`}>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-[#D2FF00] rounded-sm flex items-center justify-center text-black font-black">S</div>
          <span className="font-display text-xl tracking-tighter uppercase">Saahas // Archive</span>
        </div>
        <div className="hidden md:flex gap-10 items-center font-black text-[10px] uppercase tracking-[0.3em]">
          <button onClick={() => coursesRef.current.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[#D2FF00] transition-colors">Curriculum</button>
          <button className="hover:text-[#D2FF00] transition-colors">Mission</button>
          <a href="/login" className="bg-white text-black px-8 py-3 hover:bg-[#D2FF00] transition-all transform hover:scale-105">Access Platform</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <ThreeHero />

        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-block px-6 py-2 border border-[#D2FF00]/30 bg-black/50 backdrop-blur-sm"
          >
            <span className="text-[#D2FF00] text-[10px] font-black tracking-[0.5em] uppercase">Inclusive Evolution 2026</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[12vw] md:text-[10vw] leading-[0.8] hero-title uppercase italic"
          >
            Saahas
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-10 text-white/50 text-xs md:text-sm font-bold uppercase tracking-[0.4em] max-w-2xl mx-auto leading-relaxed"
          >
            A high-performance learning ecosystem built for accessibility. <br />
            No barriers. No limits. Just speed and courage.
          </motion.p>
        </div>

        {/* Floating Stats */}
        <div className="absolute bottom-12 left-10 hidden lg:block z-10">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-2">Platform Status</div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#D2FF00] animate-pulse rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Operational // 10k+ Users</span>
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section ref={coursesRef} className="relative z-10 py-40 px-10 bg-[#050a14]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 border-b border-white/10 pb-10 gap-8">
            <h2 className="font-display text-6xl md:text-8xl italic uppercase leading-none">
              The <span className="text-[#D2FF00]">Grid.</span>
            </h2>
            <p className="text-white/40 max-w-xs text-[10px] font-bold uppercase tracking-widest leading-loose">
              Every course is engineered with visual aids, audio feedback, and haptic-ready UI elements.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-1">
            {courses.map((c, i) => (
              <CourseCard key={c.title} {...c} delay={i * 150} onClick={() => navigate('/courses', { state: { subject: c.id } })} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer / CTA */}
      <section className="relative z-10 py-40 border-t border-white/5 bg-black">
        <div className="max-w-4xl mx-auto text-center px-10">
          <motion.div
            whileInView={{ scale: [0.9, 1.1, 1] }}
            className="text-8xl mb-10 text-[#D2FF00]"
          >
            <FontAwesomeIcon icon={faBolt} />
          </motion.div>
          <h2 className="font-display text-5xl md:text-7xl uppercase italic mb-10 leading-tight">
            Ready to <span className="text-[#D2FF00]">Start?</span>
          </h2>
          <button className="bg-[#D2FF00] text-black font-black px-16 py-6 uppercase text-sm tracking-[0.3em] hover:scale-110 transition-transform">
            Initialize Journey
          </button>
        </div>
      </section>

      <footer className="py-10 px-10 flex flex-col md:flex-row justify-between items-center border-t border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-white/20 gap-4">
        <span>Saahas Archive // 2026</span>
        <div className="flex gap-8">
          <span className="hover:text-white cursor-pointer">Discord</span>
          <span className="hover:text-white cursor-pointer">Instagram</span>
          <span className="hover:text-white cursor-pointer">X</span>
        </div>
        <span>Built for Universal Access</span>
      </footer>
    </div>
  );
}