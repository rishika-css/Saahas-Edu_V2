import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// ─── Three.js Hero Scene ───────────────────────────────────────────────────
function ThreeHero() {
  const mountRef = useRef(null);

  useEffect(() => {
    const W = mountRef.current.clientWidth;
    const H = mountRef.current.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Scene + Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    camera.position.set(0, 0, 18);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffd166, 1.2);
    dirLight.position.set(5, 10, 8);
    scene.add(dirLight);
    const fillLight = new THREE.DirectionalLight(0x06d6a0, 0.8);
    fillLight.position.set(-8, -4, 6);
    scene.add(fillLight);

    // ── Stars / Particles ──
    const starGeo = new THREE.BufferGeometry();
    const starCount = 600;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 120;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, transparent: true, opacity: 0.7 });
    scene.add(new THREE.Points(starGeo, starMat));

    // ── Floating Kid Figures ──
    function makeKid(x, y, z, bodyColor, capColor) {
      const group = new THREE.Group();

      // Head
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 16, 16),
        new THREE.MeshToonMaterial({ color: 0xffd6a5 })
      );
      head.position.y = 1.6;
      group.add(head);

      // Cap
      const cap = new THREE.Mesh(
        new THREE.ConeGeometry(0.6, 0.7, 8),
        new THREE.MeshToonMaterial({ color: capColor })
      );
      cap.position.y = 2.25;
      group.add(cap);

      // Body
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.55, 1.2, 12),
        new THREE.MeshToonMaterial({ color: bodyColor })
      );
      body.position.y = 0.6;
      group.add(body);

      // Left arm
      const armL = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 0.9, 8),
        new THREE.MeshToonMaterial({ color: bodyColor })
      );
      armL.position.set(-0.7, 0.7, 0);
      armL.rotation.z = Math.PI / 5;
      group.add(armL);

      // Right arm (raised)
      const armR = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 0.9, 8),
        new THREE.MeshToonMaterial({ color: bodyColor })
      );
      armR.position.set(0.7, 0.85, 0);
      armR.rotation.z = -Math.PI / 2.5;
      group.add(armR);

      // Legs
      [-0.3, 0.3].forEach((lx) => {
        const leg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.16, 0.16, 0.9, 8),
          new THREE.MeshToonMaterial({ color: 0x264653 })
        );
        leg.position.set(lx, -0.45, 0);
        group.add(leg);
      });

      // Eyes
      [-0.18, 0.18].forEach((ex) => {
        const eye = new THREE.Mesh(
          new THREE.SphereGeometry(0.09, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0x222222 })
        );
        eye.position.set(ex, 1.65, 0.5);
        group.add(eye);
      });

      // Smile
      const smileCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.18, 1.42, 0.52),
        new THREE.Vector3(0, 1.35, 0.55),
        new THREE.Vector3(0.18, 1.42, 0.52)
      );
      const smileGeo = new THREE.TubeGeometry(smileCurve, 12, 0.025, 6, false);
      const smile = new THREE.Mesh(smileGeo, new THREE.MeshBasicMaterial({ color: 0x333333 }));
      group.add(smile);

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

    // ── Floating Geo Shapes ──
    const shapes = [];
    const shapeColors = [0xffd166, 0x06d6a0, 0xff6b6b, 0x4cc9f0, 0x9b5de5];
    const geoms = [
      new THREE.OctahedronGeometry(0.5),
      new THREE.TorusGeometry(0.4, 0.15, 8, 20),
      new THREE.TetrahedronGeometry(0.5),
      new THREE.BoxGeometry(0.7, 0.7, 0.7),
      new THREE.IcosahedronGeometry(0.45),
    ];
    for (let i = 0; i < 14; i++) {
      const geo = geoms[i % geoms.length];
      const mat = new THREE.MeshToonMaterial({
        color: shapeColors[i % shapeColors.length],
        wireframe: i % 3 === 0,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 4 - 2
      );
      mesh.userData.phase = Math.random() * Math.PI * 2;
      mesh.userData.speed = 0.003 + Math.random() * 0.005;
      mesh.userData.baseY = mesh.position.y;
      shapes.push(mesh);
      scene.add(mesh);
    }

    // ── Ground ──
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 6),
      new THREE.MeshToonMaterial({ color: 0x06d6a0, transparent: true, opacity: 0.18 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3.5;
    scene.add(ground);

    // ── Mouse parallax ──
    let mx = 0, my = 0;
    const onMouse = (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouse);

    // ── Resize ──
    const onResize = () => {
      const nW = mountRef.current?.clientWidth || W;
      const nH = mountRef.current?.clientHeight || H;
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
      renderer.setSize(nW, nH);
    };
    window.addEventListener("resize", onResize);

    // ── Animate ──
    let frame;
    const timer = new THREE.Timer();
    const animate = () => {
      frame = requestAnimationFrame(animate);
      timer.update();
      const t = timer.getElapsed();

      // kids float & sway
      kids.forEach((k, i) => {
        k.position.y = k.userData.baseY + Math.sin(t * 1.2 + k.userData.phase) * 0.35;
        k.rotation.y += k.userData.rotSpeed;
      });

      // shapes spin + float
      shapes.forEach((s) => {
        s.rotation.x += s.userData.speed;
        s.rotation.y += s.userData.speed * 0.7;
        s.position.y = s.userData.baseY + Math.sin(t * 0.8 + s.userData.phase) * 0.6;
      });

      // camera parallax
      camera.position.x += (mx * 2 - camera.position.x) * 0.04;
      camera.position.y += (my * 1 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full" />;
}

// ─── Course Card ───────────────────────────────────────────────────────────
function CourseCard({ emoji, title, color, accent, topics, delay }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        animationDelay: `${delay}ms`,
        background: hovered
          ? `linear-gradient(135deg, ${color}22, ${accent}33)`
          : "rgba(255,255,255,0.04)",
        borderColor: hovered ? accent : "rgba(255,255,255,0.1)",
        transform: hovered ? "translateY(-10px) scale(1.02)" : "translateY(0) scale(1)",
        transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)",
        boxShadow: hovered ? `0 24px 60px ${color}44` : "0 4px 20px rgba(0,0,0,0.2)",
      }}
      className="relative rounded-3xl border p-8 cursor-pointer overflow-hidden animate-fadeUp"
    >
      {/* Glow blob */}
      <div
        style={{
          background: `radial-gradient(circle, ${color}55 0%, transparent 70%)`,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.4s",
        }}
        className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
      />

      <div className="text-6xl mb-5">{emoji}</div>
      <h3
        style={{ color: accent }}
        className="text-2xl font-black mb-3 tracking-tight"
      >
        {title}
      </h3>
      <div className="space-y-2">
        {topics.map((t) => (
          <div key={t} className="flex items-center gap-2">
            <span style={{ color: accent }} className="text-sm">▸</span>
            <span className="text-white/70 text-sm">{t}</span>
          </div>
        ))}
      </div>

      <button
        style={{
          background: `linear-gradient(135deg, ${color}, ${accent})`,
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateY(0)" : "translateY(8px)",
          transition: "all 0.3s ease",
        }}
        className="mt-6 w-full py-3 rounded-2xl text-white font-bold text-sm tracking-wide"
      >
        Start Learning →
      </button>
    </div>
  );
}

// ─── Main Landing Page ─────────────────────────────────────────────────────
export default function LandingPage() {
  const coursesRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToCourses = () => {
    coursesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const courses = [
    {
      emoji: "📖",
      title: "English",
      color: "#ff6b6b",
      accent: "#ffd166",
      topics: [
        "Reading & Comprehension",
        "Grammar Foundations",
        "Storytelling & Expression",
        "Vocabulary Building",
        "Sign Language Integration",
      ],
    },
    {
      emoji: "🔢",
      title: "Mathematics",
      color: "#06d6a0",
      accent: "#4cc9f0",
      topics: [
        "Numbers & Counting",
        "Geometry & Shapes",
        "Problem Solving",
        "Visual Math Aids",
        "Interactive Calculators",
      ],
    },
    {
      emoji: "🔬",
      title: "Science",
      color: "#9b5de5",
      accent: "#f9c74f",
      topics: [
        "Living World",
        "Earth & Space",
        "Matter & Energy",
        "Experiments at Home",
        "Accessible Lab Simulations",
      ],
    },
  ];

  return (
    <div className="bg-[#050a14] min-h-screen font-sans overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&family=Baloo+2:wght@800;900&display=swap');

        * { font-family: 'Nunito', sans-serif; }
        .font-display { font-family: 'Baloo 2', cursive; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-14px); }
        }
        @keyframes gradShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulseRing {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(6,214,160,0.4); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 16px rgba(6,214,160,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(6,214,160,0); }
        }
        .animate-fadeUp { animation: fadeUp 0.8s ease both; }
        .animate-float  { animation: float 4s ease-in-out infinite; }
        .pulse-ring      { animation: pulseRing 2s infinite; }

        .hero-title {
          background: linear-gradient(135deg, #ffd166 0%, #ff6b6b 40%, #9b5de5 70%, #4cc9f0 100%);
          background-size: 300% 300%;
          animation: gradShift 5s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .scroll-indicator {
          animation: float 1.8s ease-in-out infinite;
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #050a14; }
        ::-webkit-scrollbar-thumb { background: #06d6a0; border-radius: 3px; }
      `}</style>

      {/* ── Navbar ── */}
      <nav
        style={{
          background: scrolled ? "rgba(5,10,20,0.9)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
          transition: "all 0.4s ease",
        }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ffd166] to-[#ff6b6b] flex items-center justify-center text-lg">
            🌟
          </div>
          <span className="font-display text-xl text-white font-black tracking-wide">Saahas</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={scrollToCourses}
            className="text-white/60 hover:text-white text-sm transition px-4 py-2"
          >
            Courses
          </button>
          <a
            href="/login"
            className="bg-gradient-to-r from-[#06d6a0] to-[#4cc9f0] text-[#050a14] font-black text-sm px-5 py-2.5 rounded-2xl hover:scale-105 transition-transform"
          >
            Enter Platform →
          </a>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Three.js canvas */}
        <ThreeHero />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050a14]/20 via-transparent to-[#050a14]/80 pointer-events-none" />

        {/* Hero text */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-8 animate-fadeUp"
            style={{ animationDelay: "200ms" }}
          >
            <span className="w-2 h-2 bg-[#06d6a0] rounded-full pulse-ring inline-block" />
            <span className="text-white/70 text-xs font-bold tracking-widest uppercase">
              Inclusive Learning Platform
            </span>
          </div>

          <h1
            className="font-display text-8xl md:text-[110px] font-black leading-none mb-4 hero-title animate-fadeUp"
            style={{ animationDelay: "400ms" }}
          >
            Saahas
          </h1>

          <p
            className="text-white/60 text-lg md:text-2xl font-bold mb-3 animate-fadeUp tracking-wide"
            style={{ animationDelay: "600ms" }}
          >
            ✦ Education for Everyone ✦
          </p>

          <p
            className="text-white/40 text-sm md:text-base max-w-xl mx-auto mb-12 leading-relaxed animate-fadeUp"
            style={{ animationDelay: "750ms" }}
          >
            A joyful, accessible learning world built for every child — regardless of ability,
            language, or background. Braille, Sign Language, and beyond.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeUp"
            style={{ animationDelay: "900ms" }}
          >
            <a
              href="/login"
              className="group relative bg-gradient-to-r from-[#ffd166] via-[#ff6b6b] to-[#9b5de5] text-white font-black text-base px-10 py-4 rounded-2xl hover:scale-105 transition-transform shadow-2xl"
            >
              <span className="relative z-10">Begin Your Journey 🚀</span>
            </a>
            <button
              onClick={scrollToCourses}
              className="border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-bold text-sm px-8 py-4 rounded-2xl transition-all"
            >
              Explore Courses ↓
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 scroll-indicator">
          <div className="w-7 h-11 border-2 border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-[#06d6a0] rounded-full" />
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="relative z-10 py-16 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: "10K+", label: "Students" },
            { val: "3", label: "Core Subjects" },
            { val: "100%", label: "Accessible" },
            { val: "♾️", label: "Free Forever" },
          ].map((s, i) => (
            <div key={s.label} className="animate-fadeUp" style={{ animationDelay: `${i * 120}ms` }}>
              <div className="font-display text-4xl font-black text-white mb-1">{s.val}</div>
              <div className="text-white/40 text-sm uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Courses Section ── */}
      <section ref={coursesRef} className="relative z-10 py-28 px-6">
        {/* Background glow blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#9b5de5]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[#06d6a0]/10 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-[#06d6a0] text-xs font-black tracking-[0.3em] uppercase mb-4">
              ✦ What We Teach ✦
            </p>
            <h2 className="font-display text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Explore <span className="hero-title">Courses</span>
            </h2>
            <p className="text-white/40 max-w-xl mx-auto text-base leading-relaxed">
              Designed for every learner. Each subject is fully accessible with visual aids,
              audio support, Braille conversion, and sign language integration.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {courses.map((c, i) => (
              <CourseCard key={c.title} {...c} delay={i * 150} />
            ))}
          </div>

          {/* Feature pills */}
          <div className="mt-16 flex flex-wrap justify-center gap-3">
            {[
              "🖐️ Sign Language Support",
              "⠿ Braille Ready",
              "🔊 Audio Descriptions",
              "🎨 High Contrast Mode",
              "🧠 Cognitive Aids",
              "📱 Mobile Friendly",
            ].map((pill) => (
              <span
                key={pill}
                className="bg-white/5 border border-white/10 text-white/60 text-xs font-bold px-5 py-2.5 rounded-full hover:bg-white/10 hover:text-white transition cursor-default"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Footer ── */}
      <section className="relative z-10 py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="text-7xl mb-6 animate-float">🎒</div>
          <h2 className="font-display text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Every child deserves<br />
            <span className="hero-title">to learn with joy.</span>
          </h2>
          <p className="text-white/40 text-base mb-10 max-w-md mx-auto">
            Join Saahas today. No barriers. No limits. Just curiosity and courage.
          </p>
          <a
            href="/login"
            className="inline-block bg-gradient-to-r from-[#ffd166] via-[#ff6b6b] to-[#9b5de5] text-white font-black text-lg px-14 py-5 rounded-2xl hover:scale-105 transition-transform shadow-2xl"
          >
            Start Learning Free 🌟
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-white/20 text-xs">
        <span className="font-display font-black text-white/40">Saahas</span> — Education for Everyone •{" "}
        Built with ❤️ for specially abled learners
      </footer>
    </div>
  );
}