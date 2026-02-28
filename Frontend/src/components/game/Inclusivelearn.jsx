import { useState, useEffect, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Navbar from "../common/Navbar";
import {
    faHand, faHandPeace, faHandPointUp, faPhone as faPhoneIcon,
    faHandPointer, faHandFist, faThumbsUp, faThumbsDown,
    faFutbol, faTrophy, faHeart, faUserGroup, faSun, faDog,
    faAppleWhole, faRainbow, faFaceSmile, faCircleCheck, faCircleXmark,
    faFaceSmileBeam, faFaceSadTear, faFaceAngry, faFaceFlushed,
    faFaceSurprise, faFaceGrinStars, faFaceTired, faFaceMeh,
    faStar, faMoon, faCat, faFish, faMusic, faDove,
    faCircle, faSquare, faCaretUp,
    fa1, fa2, fa3, fa4,
    faCloudRain, faPizzaSlice, faBurger,
    faHandsClapping, faShoePrints,
    faBrain, faGear, faBookOpen, faMouse, faVolumeHigh,
    faRobot, faArrowsRotate, faPlay, faBullseye, faWandMagicSparkles,
    faClover, faGem, faFeather, faCandyCane, faHandSparkles,
    faSeedling, faLemon,
} from "@fortawesome/free-solid-svg-icons";

/* Helper to render FA icons inline */
const I = ({ icon, color, size }) => <FontAwesomeIcon icon={icon} style={{ color: color || "inherit", fontSize: size || "inherit" }} />;

/* ═══════════════════════════════════════════
   DATA
═══════════════════════════════════════════ */

const ASL_DATA = [
    { hand: faHand, letter: "B", word: "Ball", hint: "A round toy", hintIcon: faFutbol, opts: ["A", "B", "C", "D"] },
    { hand: faHandPeace, letter: "V", word: "Victory", hint: "Win!", hintIcon: faTrophy, opts: ["U", "V", "W", "X"] },
    { hand: faHandPeace, letter: "ILY", word: "I Love You", hint: "A special feeling", hintIcon: faHeart, opts: ["ILY", "Y", "L", "I"] },
    { hand: faHandPointUp, letter: "F", word: "Friend", hint: "Someone you like", hintIcon: faUserGroup, opts: ["E", "F", "G", "H"] },
    { hand: faPhoneIcon, letter: "Y", word: "Yellow", hint: "A bright colour", hintIcon: faSun, opts: ["W", "X", "Y", "Z"] },
    { hand: faHandPointer, letter: "D", word: "Dog", hint: "Woof!", hintIcon: faDog, opts: ["A", "B", "D", "E"] },
    { hand: faHand, letter: "5", word: "Five", hint: "A number", hintIcon: fa4, opts: ["3", "4", "5", "6"] },
    { hand: faHandFist, letter: "A", word: "Apple", hint: "A red fruit", hintIcon: faAppleWhole, opts: ["A", "B", "C", "S"] },
    { hand: faHandPeace, letter: "R", word: "Rainbow", hint: "After rain", hintIcon: faRainbow, opts: ["P", "Q", "R", "S"] },
    { hand: faHandSparkles, letter: "Hello", word: "Greeting", hint: "How you say hi", hintIcon: faFaceSmile, opts: ["Hello", "Bye", "Yes", "No"] },
    { hand: faThumbsUp, letter: "Good", word: "Positive", hint: "When something is nice", hintIcon: faCircleCheck, opts: ["Good", "Bad", "Stop", "Go"] },
    { hand: faThumbsDown, letter: "No", word: "Disagree", hint: "Not yes", hintIcon: faCircleXmark, opts: ["Yes", "Maybe", "No", "Wait"] },
];

const EMOTIONS = [
    { face: faFaceSmileBeam, name: "Happy", color: "#22c55e", situation: "You get your favourite ice cream! You feel…", opts: ["Happy", "Sad", "Angry", "Scared"] },
    { face: faFaceSadTear, name: "Sad", color: "#3b82f6", situation: "Your toy broke. You feel…", opts: ["Happy", "Sad", "Surprised", "Excited"] },
    { face: faFaceAngry, name: "Angry", color: "#ef4444", situation: "Someone took your snack. You feel…", opts: ["Happy", "Calm", "Angry", "Sleepy"] },
    { face: faFaceFlushed, name: "Scared", color: "#a855f7", situation: "You hear a very loud thunder. You feel…", opts: ["Excited", "Scared", "Happy", "Proud"] },
    { face: faFaceSurprise, name: "Surprised", color: "#f97316", situation: "Your friends throw a surprise party! You feel…", opts: ["Bored", "Surprised", "Tired", "Angry"] },
    { face: faFaceGrinStars, name: "Excited", color: "#eab308", situation: "Tomorrow you go to the fun park! You feel…", opts: ["Excited", "Sad", "Confused", "Worried"] },
    { face: faFaceTired, name: "Sleepy", color: "#6b7280", situation: "It is late at night. You feel…", opts: ["Hungry", "Sleepy", "Excited", "Surprised"] },
    { face: faFaceSmile, name: "Calm", color: "#14b8a6", situation: "You take deep breaths and relax. You feel…", opts: ["Calm", "Angry", "Scared", "Anxious"] },
    { face: faFaceFlushed, name: "Worried", color: "#f59e0b", situation: "You have a test tomorrow. You feel…", opts: ["Happy", "Worried", "Excited", "Calm"] },
    { face: faHeart, name: "Loved", color: "#ec4899", situation: "Your family gives you a big hug. You feel…", opts: ["Lonely", "Angry", "Loved", "Bored"] },
];

const PATTERNS = [
    { seq: ["red", "blue", "red", "blue", "red"], ans: "blue", opts: ["blue", "green", "yellow", "red"] },
    { seq: ["star", "star", "moon", "star", "star"], ans: "moon", opts: ["star", "moon", "sun", "gem"] },
    { seq: ["dog", "cat", "dog", "cat", "dog"], ans: "cat", opts: ["fish", "cat", "dove", "seedling"] },
    { seq: ["apple", "lemon", "star", "apple", "lemon"], ans: "star", opts: ["apple", "lemon", "star", "clover"] },
    { seq: ["triangle", "square", "triangle", "square", "triangle"], ans: "square", opts: ["triangle", "square", "circle", "gem"] },
    { seq: ["one", "two", "three", "one", "two"], ans: "three", opts: ["one", "two", "three", "four"] },
    { seq: ["sun", "rain", "sun", "rain", "sun"], ans: "rain", opts: ["sun", "rain", "gem", "rainbow"] },
    { seq: ["pizza", "burger", "pizza", "burger", "pizza"], ans: "burger", opts: ["pizza", "burger", "apple", "lemon"] },
    { seq: ["heart", "star", "heart", "star", "heart"], ans: "star", opts: ["heart", "star", "circle", "gem"] },
    { seq: ["clap", "clap", "foot", "clap", "clap"], ans: "foot", opts: ["clap", "foot", "hand", "fist"] },
];

const PATTERN_ICONS = {
    red: { icon: faCircle, color: "#ef4444" },
    blue: { icon: faCircle, color: "#3b82f6" },
    green: { icon: faCircle, color: "#22c55e" },
    yellow: { icon: faCircle, color: "#eab308" },
    star: { icon: faStar, color: "#eab308" },
    moon: { icon: faMoon, color: "#a78bfa" },
    sun: { icon: faSun, color: "#facc15" },
    gem: { icon: faGem, color: "#c084fc" },
    dog: { icon: faDog, color: "#f97316" },
    cat: { icon: faCat, color: "#f472b6" },
    fish: { icon: faFish, color: "#38bdf8" },
    dove: { icon: faDove, color: "#94a3b8" },
    seedling: { icon: faSeedling, color: "#22c55e" },
    apple: { icon: faAppleWhole, color: "#ef4444" },
    lemon: { icon: faLemon, color: "#eab308" },

    clover: { icon: faClover, color: "#22c55e" },
    triangle: { icon: faCaretUp, color: "#ef4444" },
    square: { icon: faSquare, color: "#3b82f6" },
    circle: { icon: faCircle, color: "#a855f7" },
    one: { icon: fa1, color: "#38bdf8" },
    two: { icon: fa2, color: "#f472b6" },
    three: { icon: fa3, color: "#4ade80" },
    four: { icon: fa4, color: "#facc15" },
    rain: { icon: faCloudRain, color: "#64748b" },
    rainbow: { icon: faRainbow, color: "#f472b6" },
    pizza: { icon: faPizzaSlice, color: "#f97316" },
    burger: { icon: faBurger, color: "#eab308" },
    heart: { icon: faHeart, color: "#ec4899" },
    clap: { icon: faHandsClapping, color: "#facc15" },
    foot: { icon: faShoePrints, color: "#8b5cf6" },
    hand: { icon: faHand, color: "#f97316" },
    fist: { icon: faHandFist, color: "#ef4444" },
};

const PatIcon = ({ name, size }) => {
    const p = PATTERN_ICONS[name];
    if (!p) return name;
    return <FontAwesomeIcon icon={p.icon} style={{ color: p.color, fontSize: size || "1.5rem" }} />;
};

const MEM_SYMBOLS = ["star", "clover", "dove", "music", "rainbow", "fish", "candy", "trophy"];

const MEM_ICONS = {
    star: { icon: faStar, color: "#eab308" },
    clover: { icon: faClover, color: "#22c55e" },
    dove: { icon: faDove, color: "#8b5cf6" },
    music: { icon: faMusic, color: "#ec4899" },
    rainbow: { icon: faRainbow, color: "#f472b6" },
    fish: { icon: faFish, color: "#38bdf8" },
    candy: { icon: faCandyCane, color: "#ef4444" },
    trophy: { icon: faTrophy, color: "#f59e0b" },
};

const MemIcon = ({ name, size }) => {
    const m = MEM_ICONS[name];
    if (!m) return name;
    return <FontAwesomeIcon icon={m.icon} style={{ color: m.color, fontSize: size || "1.6rem" }} />;
};

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

/* ═══════════════════════════════════════════
   BEHAVIOUR TRACKING HOOK
═══════════════════════════════════════════ */

function useBehaviourTracker() {
    const raw = useRef({
        pageLoadTime: Date.now(), wordCount: 300,
        lastScrollY: 0, lastScrollDir: 0, lastScrollTime: Date.now(),
        scrollSpeeds: [], scrollReversals: 0, forwardScrollDist: 0,
        slowBackScrolls: 0, slowBackCluster: [],
        dwellZone: -1, dwellStart: Date.now(), longDwells: [],
        lastMouseX: 0, lastMouseY: 0, lastMouseTime: Date.now(),
        mouseDeltas: [], mouseDirChanges: 0, lastMouseDX: 0,
        jitterWindow: [], jitterSamples: [], arcWindow: [], arcSamples: [], slowSamples: [],
        horizSlowMoves: 0, horizTotalMoves: 0,
        clickTimes: [], totalClicks: 0, missClicks: 0,
        tabHides: 0, idleTimer: null, idleCount: 0, wasIdle: false,
        keyBursts: 0, inBurst: false, burstTimer: null, keyCount: 0,
        backspaceCount: 0, keyDownTimes: {}, keyHoldDurations: [],
        mouseIsDown: false, isDragging: false, dragStartTime: 0, dragStarts: 0, dragAbandons: 0,
    });
    const latched = useRef({ adhd: false, dyslexia: false, motor: false });
    const [aiStatus, setAiStatus] = useState("Warming up…");
    const [aiActive, setAiActive] = useState(false);
    const [toasts, setToasts] = useState([]);

    const clamp = v => Math.min(1, Math.max(0, v));
    const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
    const elMin = () => Math.max(0.1, (Date.now() - raw.current.pageLoadTime) / 60000);
    const scrollAvg = () => avg(raw.current.scrollSpeeds);

    const CFG = {
        WARMUP_MS: 20000, POLL_INTERVAL_MS: 8000,
        THRESHOLD: { adhd: 0.52, dyslexia: 0.46, motor: 0.44 },
        W_ADHD: { scrollSpeed: 0.16, scrollReversals: 0.15, mouseFrenzy: 0.17, clickRate: 0.12, tabSwitches: 0.13, idleInterrupts: 0.12, readingPace: 0.09, keyburstRate: 0.06 },
        W_DYSLEXIA: { slowReRead: 0.26, hoverDwell: 0.22, backspaceRatio: 0.22, slowReadingPace: 0.14, lineTraceMouse: 0.10, reReadCluster: 0.06 },
        W_MOTOR: { mouseJitter: 0.28, missClickRate: 0.24, cursorArcSize: 0.18, keyHoldDuration: 0.16, slowCursor: 0.08, dragAbandonment: 0.06 },
        SLOW_SCROLL_MAX: 450, ADHD_INHIBIT_AVG: 900, LINE_TRACE_SPEED: 350,
        MIN_DWELL_MS: 600, DWELL_ZONE_PX: 300, JITTER_WIN: 8, ARC_WIN: 8, ARC_MIN_CHORD: 15,
    };

    function computeJitter(pts) {
        if (pts.length < 3) return 0;
        let total = 0, count = 0;
        for (let i = 0; i < pts.length - 2; i++) {
            const a = pts[i], b = pts[i + 1], c = pts[i + 2];
            const ldx = c.x - a.x, ldy = c.y - a.y, len = Math.hypot(ldx, ldy);
            if (len < 2) continue;
            total += Math.abs(ldx * (a.y - b.y) - ldy * (a.x - b.x)) / len; count++;
        }
        return count > 0 ? total / count : 0;
    }

    function computeArc(pts) {
        if (pts.length < 4) return 0;
        const p0 = pts[0], pN = pts[pts.length - 1];
        const ldx = pN.x - p0.x, ldy = pN.y - p0.y, len = Math.hypot(ldx, ldy);
        if (len < CFG.ARC_MIN_CHORD) return 0;
        let max = 0;
        for (let i = 1; i < pts.length - 1; i++) {
            const d = Math.abs(ldx * (p0.y - pts[i].y) - ldy * (p0.x - pts[i].x)) / len;
            if (d > max) max = d;
        }
        return max;
    }

    const resetIdleTimer = useCallback(() => {
        const r = raw.current;
        if (r.wasIdle) { r.idleCount++; r.wasIdle = false; }
        clearTimeout(r.idleTimer);
        r.idleTimer = setTimeout(() => { r.wasIdle = true; }, 4000);
    }, []);

    useEffect(() => {
        const r = raw.current;

        const onScroll = () => {
            const now = Date.now(), newY = window.scrollY;
            const dt = Math.max(1, now - r.lastScrollTime), dy = newY - r.lastScrollY;
            const dir = dy > 0 ? 1 : dy < 0 ? -1 : 0;
            if (dir !== 0) {
                const speed = Math.abs(dy) / dt * 1000;
                r.scrollSpeeds.push(speed); if (r.scrollSpeeds.length > 80) r.scrollSpeeds.shift();
                if (r.lastScrollDir !== 0 && dir !== r.lastScrollDir) r.scrollReversals++;
                if (dir === 1) { r.forwardScrollDist += Math.abs(dy); }
                else {
                    if (r.forwardScrollDist > 200 && speed <= CFG.SLOW_SCROLL_MAX) {
                        r.slowBackScrolls++;
                        r.slowBackCluster.push(now);
                        r.slowBackCluster = r.slowBackCluster.filter(t => t > now - 90000);
                        r.forwardScrollDist = 0;
                    }
                }
                r.lastScrollDir = dir;
            }
            const zone = Math.floor(newY / CFG.DWELL_ZONE_PX);
            if (zone !== r.dwellZone) {
                const dwellMs = now - r.dwellStart;
                if (r.dwellZone >= 0 && dwellMs >= CFG.MIN_DWELL_MS) { r.longDwells.push(dwellMs); if (r.longDwells.length > 50) r.longDwells.shift(); }
                r.dwellZone = zone; r.dwellStart = now;
            }
            r.lastScrollY = newY; r.lastScrollTime = now; resetIdleTimer();
        };

        const onMouseMove = e => {
            const now = Date.now(), dt = Math.max(1, now - r.lastMouseTime);
            const dx = e.clientX - r.lastMouseX, dy = e.clientY - r.lastMouseY;
            const dist = Math.hypot(dx, dy), spd = dist / dt * 1000;
            r.mouseDeltas.push(spd); if (r.mouseDeltas.length > 80) r.mouseDeltas.shift();
            if (r.lastMouseDX !== 0 && Math.sign(dx) !== 0 && Math.sign(dx) !== Math.sign(r.lastMouseDX)) r.mouseDirChanges++;
            if (dx !== 0) r.lastMouseDX = dx;
            r.jitterWindow.push({ x: e.clientX, y: e.clientY }); if (r.jitterWindow.length > CFG.JITTER_WIN) r.jitterWindow.shift();
            if (r.jitterWindow.length >= 3) { const j = computeJitter(r.jitterWindow); r.jitterSamples.push(j); if (r.jitterSamples.length > 60) r.jitterSamples.shift(); }
            r.slowSamples.push(spd < 100 ? 1 : 0); if (r.slowSamples.length > 80) r.slowSamples.shift();
            r.arcWindow.push({ x: e.clientX, y: e.clientY }); if (r.arcWindow.length > CFG.ARC_WIN) r.arcWindow.shift();
            if (r.arcWindow.length >= 4) { const arc = computeArc(r.arcWindow); if (arc >= 0) { r.arcSamples.push(arc); if (r.arcSamples.length > 40) r.arcSamples.shift(); } }
            const absX = Math.abs(dx), absY = Math.abs(dy);
            if (absX + absY > 1) { r.horizTotalMoves++; if (absX > absY * 2.0 && spd < CFG.LINE_TRACE_SPEED) r.horizSlowMoves++; }
            if (r.mouseIsDown && !r.isDragging) { r.isDragging = true; r.dragStarts++; r.dragStartTime = now; }
            r.lastMouseX = e.clientX; r.lastMouseY = e.clientY; r.lastMouseTime = now; resetIdleTimer();
        };

        const onClick = e => {
            r.clickTimes.push(Date.now()); r.totalClicks++; if (r.clickTimes.length > 40) r.clickTimes.shift();
            const hit = Array.from(document.querySelectorAll("a,button,input,[role='button']"))
                .some(el => { const rect = el.getBoundingClientRect(); return e.clientX >= rect.left - 12 && e.clientX <= rect.right + 12 && e.clientY >= rect.top - 12 && e.clientY <= rect.bottom + 12; });
            if (!hit) r.missClicks++;
            resetIdleTimer();
        };

        const onKeyDown = e => {
            r.keyCount++; if (e.key === "Backspace" || e.key === "Delete") r.backspaceCount++;
            if (!r.inBurst) { r.inBurst = true; r.keyBursts++; }
            clearTimeout(r.burstTimer); r.burstTimer = setTimeout(() => { r.inBurst = false; }, 1500);
            r.keyDownTimes[e.code] = Date.now(); resetIdleTimer();
        };

        const onKeyUp = e => {
            if (r.keyDownTimes[e.code]) { r.keyHoldDurations.push(Date.now() - r.keyDownTimes[e.code]); if (r.keyHoldDurations.length > 50) r.keyHoldDurations.shift(); delete r.keyDownTimes[e.code]; }
        };

        const onVisibility = () => { if (document.hidden) r.tabHides++; };

        window.addEventListener("scroll", onScroll, { passive: true });
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("click", onClick);
        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("keyup", onKeyUp);
        document.addEventListener("visibilitychange", onVisibility);

        return () => {
            window.removeEventListener("scroll", onScroll);
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("click", onClick);
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("keyup", onKeyUp);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [resetIdleTimer]);

    const computeScores = useCallback(() => {
        const r = raw.current;

        const adhdSignals = {
            scrollSpeed: (() => { const s = [...r.scrollSpeeds].sort((a, b) => b - a); const top = s.slice(0, Math.max(1, Math.floor(s.length / 4))); return clamp(avg(top) / 3000); })(),
            scrollReversals: clamp((r.scrollReversals / elMin()) / 22),
            mouseFrenzy: clamp(avg(r.mouseDeltas) / 1800) * 0.55 + clamp((r.mouseDirChanges / elMin()) / 100) * 0.45,
            clickRate: clamp(r.clickTimes.filter(t => Date.now() - t < 10000).length / 8),
            tabSwitches: clamp((r.tabHides / elMin()) / 4),
            idleInterrupts: clamp((r.idleCount / elMin()) / 6),
            readingPace: (() => { const e = (Date.now() - r.pageLoadTime) / 1000, rat = e / (r.wordCount / 3); if (e < 8) return 0; if (rat < 0.18) return 0.85; if (rat < 0.40) return 0.45; return 0; })(),
            keyburstRate: clamp((r.keyBursts / elMin()) / 10),
        };

        const dysSignals = {
            slowReRead: (() => { const sa = scrollAvg(), inhibit = clamp(sa / CFG.ADHD_INHIBIT_AVG); if (inhibit > 0.75) return 0; return clamp((r.slowBackScrolls / elMin()) / 5) * (1 - inhibit * 0.5); })(),
            hoverDwell: (() => { if (r.longDwells.length < 1) return 0; return clamp(r.longDwells.filter(d => d > 2000).length / Math.max(1, r.longDwells.length) * 2.5); })(),
            backspaceRatio: r.keyCount < 8 ? 0 : clamp((r.backspaceCount / r.keyCount) / 0.35),
            slowReadingPace: (() => { if (scrollAvg() > 1000) return 0; const e = (Date.now() - r.pageLoadTime) / 1000, rat = e / (r.wordCount / 3); if (e < 12) return 0; if (rat > 3.0) return 1.0; if (rat > 2.0) return 0.75; if (rat > 1.3) return 0.40; return 0; })(),
            lineTraceMouse: r.horizTotalMoves < 8 ? 0 : clamp((r.horizSlowMoves / r.horizTotalMoves) * 2.2),
            reReadCluster: (() => { const sa = scrollAvg(), inhibit = clamp(sa / CFG.ADHD_INHIBIT_AVG); if (inhibit > 0.75) return 0; return clamp(r.slowBackCluster.filter(t => Date.now() - t < 60000).length / 4) * (1 - inhibit * 0.5); })(),
        };

        const motorSignals = {
            mouseJitter: (() => { if (r.jitterSamples.length < 5) return 0; const s = [...r.jitterSamples].sort((a, b) => a - b); return clamp(s[Math.floor(s.length * 0.75)] / 5); })(),
            missClickRate: r.totalClicks < 3 ? 0 : clamp((r.missClicks / r.totalClicks) / 0.5),
            cursorArcSize: (() => { if (r.arcSamples.length < 4) return 0; const s = [...r.arcSamples].sort((a, b) => a - b); return clamp(s[Math.floor(s.length * 0.75)] / 20); })(),
            keyHoldDuration: r.keyHoldDurations.length < 4 ? 0 : clamp((r.keyHoldDurations.filter(d => d > 300).length / r.keyHoldDurations.length) / 0.45),
            slowCursor: (() => { const lt = r.horizTotalMoves > 0 ? r.horizSlowMoves / r.horizTotalMoves : 0, sup = clamp(lt * 2); return clamp(avg(r.slowSamples) * 1.8) * (1 - sup * 0.6); })(),
            dragAbandonment: r.dragStarts < 2 ? 0 : clamp((r.dragAbandons / r.dragStarts) / 0.4),
        };

        const compute = (signals, weights) => {
            let score = 0;
            for (const [k, w] of Object.entries(weights)) score += (signals[k] || 0) * w;
            return parseFloat(score.toFixed(3));
        };

        return {
            adhd: compute(adhdSignals, CFG.W_ADHD),
            dyslexia: compute(dysSignals, CFG.W_DYSLEXIA),
            motor: compute(motorSignals, CFG.W_MOTOR),
        };
    }, []);

    const fireToast = useCallback((icon, label, prob, bgFrom, bgTo) => {
        const id = Date.now();
        const pct = Math.round(prob * 100);
        setToasts(prev => [...prev, { id, icon, label, pct, bgFrom, bgTo }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 7500);
    }, []);

    useEffect(() => {
        const run = () => {
            const scores = computeScores();
            if (!latched.current.dyslexia && scores.dyslexia >= CFG.THRESHOLD.dyslexia) {
                latched.current.dyslexia = true;
                fireToast("book", "Dyslexia Font Mode activated", scores.dyslexia, "#064e3b", "#047857");
            }
            if (!latched.current.adhd && scores.adhd >= CFG.THRESHOLD.adhd) {
                latched.current.adhd = true;
                fireToast("target", "ADHD Focus Mode activated", scores.adhd, "#1e3a8a", "#2563eb");
            }
            if (!latched.current.motor && scores.motor >= CFG.THRESHOLD.motor) {
                latched.current.motor = true;
                fireToast("mouse", "Motor Assist Mode activated", scores.motor, "#7c2d12", "#c2410c");
            }

            const found = [];
            if (latched.current.adhd) found.push("ADHD ✓");
            if (latched.current.dyslexia) found.push("Dyslexia ✓");
            if (latched.current.motor) found.push("Motor ✓");

            if (found.length) {
                setAiStatus(found.join("  ·  "));
                setAiActive(true);
            } else {
                const top = [
                    { name: "ADHD", p: scores.adhd },
                    { name: "Dyslexia", p: scores.dyslexia },
                    { name: "Motor", p: scores.motor },
                ].sort((a, b) => b.p - a.p)[0];
                setAiStatus(`Monitoring… (${top.name} ${Math.round(top.p * 100)}%)`);
            }
        };

        const warmup = setTimeout(() => {
            run();
            const interval = setInterval(run, CFG.POLL_INTERVAL_MS);
            return () => clearInterval(interval);
        }, CFG.WARMUP_MS);

        return () => clearTimeout(warmup);
    }, [computeScores, fireToast]);

    return { aiStatus, aiActive, toasts, latched: latched.current };
}

/* ═══════════════════════════════════════════
   ACCESSIBILITY HOOK
═══════════════════════════════════════════ */

function useAccessibility(latched) {
    const [settings, setSettings] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem("accessibility") || "{}");
            return {
                dyslexia: saved.dyslexia || false,
                contrast: saved.contrast || false,
                dark: saved.dark || false,
                overlay: saved.overlay || false,
                focus: saved.focus || false,
                motor: saved.motor || false,
                textSize: parseInt(localStorage.getItem("textSize") || "16"),
            };
        } catch { return { dyslexia: false, contrast: false, dark: false, overlay: false, focus: false, motor: false, textSize: 16 }; }
    });

    // Sync AI-detected modes
    useEffect(() => {
        if (latched.dyslexia && !settings.dyslexia) setSettings(s => ({ ...s, dyslexia: true }));
        if (latched.adhd && !settings.focus) setSettings(s => ({ ...s, focus: true }));
        if (latched.motor && !settings.motor) setSettings(s => ({ ...s, motor: true }));
    }, [latched.dyslexia, latched.adhd, latched.motor]);

    const toggle = key => setSettings(prev => {
        const next = { ...prev, [key]: !prev[key] };
        // mutual exclusion for contrast/dark
        if (key === "contrast" && next.contrast) next.dark = false;
        if (key === "dark" && next.dark) next.contrast = false;
        try {
            localStorage.setItem("accessibility", JSON.stringify(next));
            localStorage.setItem("textSize", next.textSize);
        } catch { }
        return next;
    });

    const setTextSize = size => setSettings(prev => {
        const next = { ...prev, textSize: size };
        try { localStorage.setItem("textSize", size); } catch { }
        return next;
    });

    // Build body class string
    const bodyClasses = [
        settings.dyslexia ? "dyslexia" : "",
        settings.contrast ? "highContrast" : "",
        settings.dark ? "darkPlus" : "",
        settings.overlay ? "overlayYellow" : "",
        settings.focus ? "focusMode" : "",
        settings.motor ? "motorMode" : "",
    ].filter(Boolean).join(" ");

    return { settings, toggle, setTextSize, bodyClasses };
}

/* ═══════════════════════════════════════════
   GAME COMPONENTS
═══════════════════════════════════════════ */

function CardStripe({ variant }) {
    const gradients = {
        asl: "linear-gradient(90deg,#38bdf8,#a78bfa)",
        emotion: "linear-gradient(90deg,#f472b6,#facc15)",
        memory: "linear-gradient(90deg,#4ade80,#38bdf8)",
        pattern: "linear-gradient(90deg,#fb923c,#f472b6)",
        sequence: "linear-gradient(90deg,#a78bfa,#4ade80)",
        "ai-tutor": "linear-gradient(90deg,#facc15,#f472b6)",
    };
    return <div style={{ height: 4, width: "100%", background: gradients[variant] || "#fff" }} />;
}

function ProgressBar({ value, variant }) {
    const gradients = {
        asl: "linear-gradient(90deg,#38bdf8,#a78bfa)",
        emotion: "linear-gradient(90deg,#f472b6,#facc15)",
        memory: "linear-gradient(90deg,#4ade80,#38bdf8)",
        pattern: "linear-gradient(90deg,#fb923c,#f472b6)",
        sequence: "linear-gradient(90deg,#a78bfa,#4ade80)",
    };
    return (
        <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, marginBottom: 14, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 3, width: `${value}%`, background: gradients[variant], transition: "width 0.5s ease" }} />
        </div>
    );
}

function Feedback({ text, type }) {
    if (!text) return <div style={{ minHeight: 26, marginTop: 8 }} />;
    return (
        <div style={{
            textAlign: "center", fontSize: "1rem", fontWeight: 700, minHeight: 26, marginTop: 8,
            color: type === "good" ? "#4ade80" : type === "bad" ? "#fb923c" : "inherit",
            transition: "all 0.3s",
        }}>{text}</div>
    );
}

/* ── ASL Fingerspelling ── */
function ASLGame() {
    const [idx, setIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState({ text: "", type: "" });
    const [locked, setLocked] = useState(false);
    const [opts, setOpts] = useState(() => shuffle(ASL_DATA[0].opts));
    const [answered, setAnswered] = useState({});
    const [bounce, setBounce] = useState(true);

    const data = ASL_DATA[idx % ASL_DATA.length];

    const check = (val) => {
        if (locked) return;
        setLocked(true);
        const correct = data.letter;
        const newAnswered = {};
        data.opts.forEach(o => {
            if (o === correct) newAnswered[o] = "correct";
            else if (o === val) newAnswered[o] = "wrong";
        });
        setAnswered(newAnswered);
        if (val === correct) {
            setScore(s => s + 10);
            setFeedback({ text: ["Great signing!", "You got it!", "Amazing!"][Math.floor(Math.random() * 3)], type: "good" });
        } else {
            setFeedback({ text: `It's "${correct}" — keep practicing!`, type: "bad" });
        }
        setTimeout(() => {
            setIdx(i => i + 1);
            setOpts(shuffle(ASL_DATA[(idx + 1) % ASL_DATA.length].opts));
            setAnswered({});
            setLocked(false);
            setFeedback({ text: "", type: "" });
            setBounce(false); setTimeout(() => setBounce(true), 50);
        }, 1600);
    };

    return (
        <div className="card asl" role="region" aria-label="ASL Fingerspelling Game">
            <CardStripe variant="asl" />
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 22px 12px" }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: "rgba(56,189,248,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.7rem", flexShrink: 0 }}><I icon={faHandPeace} color="#38bdf8" /></div>
                <div>
                    <div className="card-title">ASL Fingerspelling</div>
                    <div className="card-desc">Learn hand signs for letters &amp; common words</div>
                </div>
            </div>
            <div style={{ padding: "0 22px 22px" }}>
                <div className="score-row">
                    <span className="badge" style={{ color: "#38bdf8" }}>Score: <b>{score}</b></span>
                    <span className="badge">Q {Math.min(idx + 1, 12)}/12</span>
                </div>
                <ProgressBar value={((idx % ASL_DATA.length) / 12) * 100} variant="asl" />
                <div className="asl-stage">
                    <span className="big-symbol" style={{ animation: bounce ? "bounceIn 0.5s ease" : "none" }} aria-live="polite"><I icon={data.hand} color="#38bdf8" size="3rem" /></span>
                    <div className="q-label" style={{ color: "#38bdf8" }}>What does this hand sign represent?</div>
                    <div className="hint-label">Hint: {data.word} — <I icon={data.hintIcon} /> {data.hint}</div>
                </div>
                <div className="opts-grid" role="group" aria-label="Answer choices">
                    {opts.map(o => (
                        <button key={o} className={`opt${answered[o] ? " " + answered[o] : ""}`} onClick={() => check(o)}>{o}</button>
                    ))}
                </div>
                <Feedback {...feedback} />
            </div>
        </div>
    );
}

/* ── Emotion Recognition ── */
function EmotionGame() {
    const [idx, setIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(1);
    const [feedback, setFeedback] = useState({ text: "", type: "" });
    const [locked, setLocked] = useState(false);
    const [opts, setOpts] = useState(() => shuffle(EMOTIONS[0].opts));
    const [answered, setAnswered] = useState({});
    const [bounce, setBounce] = useState(true);

    const data = EMOTIONS[idx % EMOTIONS.length];

    const check = val => {
        if (locked) return;
        setLocked(true);
        const correct = data.name;
        const newAnswered = {};
        data.opts.forEach(o => {
            if (o === correct) newAnswered[o] = "correct";
            else if (o === val) newAnswered[o] = "wrong";
        });
        setAnswered(newAnswered);
        if (val === correct) {
            setScore(s => s + 10);
            setFeedback({ text: ["Yes, that's right!", "Great understanding!", "You know feelings well!"][Math.floor(Math.random() * 3)], type: "good" });
        } else {
            setFeedback({ text: `The feeling is "${correct}" — that's okay!`, type: "bad" });
        }
        setTimeout(() => {
            const nextIdx = idx + 1;
            setIdx(nextIdx);
            setRound(r => r + 1);
            setOpts(shuffle(EMOTIONS[nextIdx % EMOTIONS.length].opts));
            setAnswered({});
            setLocked(false);
            setFeedback({ text: "", type: "" });
            setBounce(false); setTimeout(() => setBounce(true), 50);
        }, 1600);
    };

    return (
        <div className="card emotion" role="region" aria-label="Emotion Recognition Game">
            <CardStripe variant="emotion" />
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 22px 12px" }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: "rgba(244,114,182,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.7rem", flexShrink: 0 }}><I icon={faFaceSmileBeam} color="#f472b6" /></div>
                <div>
                    <div className="card-title">How Am I Feeling?</div>
                    <div className="card-desc">Identify emotions from expressions &amp; situations</div>
                </div>
            </div>
            <div style={{ padding: "0 22px 22px" }}>
                <div className="score-row">
                    <span className="badge" style={{ color: "#f472b6" }}>Score: <b>{score}</b></span>
                    <span className="badge">Round {round}</span>
                </div>
                <ProgressBar value={(score / Math.max(round * 10, 10)) * 100} variant="emotion" />
                <div className="emotion-stage">
                    <span className="big-symbol" style={{ animation: bounce ? "bounceIn 0.5s ease" : "none" }} aria-live="polite"><I icon={data.face} color={data.color} size="3rem" /></span>
                    <div className="q-label" style={{ color: "#f472b6" }}>{data.situation}</div>
                </div>
                <div className="opts-grid" role="group" aria-label="Emotion choices">
                    {opts.map(o => (
                        <button key={o} className={`opt${answered[o] ? " " + answered[o] : ""}`} onClick={() => check(o)}>{o}</button>
                    ))}
                </div>
                <Feedback {...feedback} />
            </div>
        </div>
    );
}

/* ── Memory Match ── */
function MemoryGame() {
    const newBoard = () => shuffle([...MEM_SYMBOLS, ...MEM_SYMBOLS]).map((sym, i) => ({ sym, id: i, flipped: false, matched: false }));
    const [cards, setCards] = useState(newBoard);
    const [flipped, setFlipped] = useState([]);
    const [pairs, setPairs] = useState(0);
    const [moves, setMoves] = useState(0);
    const [busy, setBusy] = useState(false);
    const [feedback, setFeedback] = useState({ text: "", type: "" });

    const reset = () => { setCards(newBoard()); setFlipped([]); setPairs(0); setMoves(0); setBusy(false); setFeedback({ text: "", type: "" }); };

    const flip = card => {
        if (busy || card.flipped || card.matched) return;
        const newCards = cards.map(c => c.id === card.id ? { ...c, flipped: true } : c);
        setCards(newCards);
        const newFlipped = [...flipped, card];
        setFlipped(newFlipped);
        if (newFlipped.length === 2) {
            setBusy(true);
            setMoves(m => m + 1);
            const [a, b] = newFlipped;
            if (a.sym === b.sym) {
                const matched = newCards.map(c => c.sym === a.sym ? { ...c, matched: true } : c);
                setCards(matched);
                const newPairs = pairs + 1;
                setPairs(newPairs);
                setFlipped([]);
                setBusy(false);
                if (newPairs === 8) setFeedback({ text: "All pairs found! Amazing memory!", type: "good" });
            } else {
                setTimeout(() => {
                    setCards(c => c.map(card => (card.id === a.id || card.id === b.id) ? { ...card, flipped: false } : card));
                    setFlipped([]);
                    setBusy(false);
                }, 900);
            }
        }
    };

    return (
        <div className="card memory" role="region" aria-label="Memory Match Game">
            <CardStripe variant="memory" />
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 22px 12px" }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: "rgba(74,222,128,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.7rem", flexShrink: 0 }}><I icon={faBrain} color="#4ade80" /></div>
                <div>
                    <div className="card-title">Memory Match</div>
                    <div className="card-desc">Flip cards and find all pairs — builds focus!</div>
                </div>
            </div>
            <div style={{ padding: "0 22px 22px" }}>
                <div className="score-row">
                    <span className="badge" style={{ color: "#4ade80" }}>Pairs: <b>{pairs}</b>/8</span>
                    <span className="badge">Moves: {moves}</span>
                </div>
                <div className="memory-grid" role="grid" aria-label="Memory card grid">
                    {cards.map(card => (
                        <div
                            key={card.id}
                            role="gridcell"
                            tabIndex={0}
                            aria-label={card.flipped || card.matched ? card.sym : "Hidden card"}
                            className={`mem-card${card.flipped ? " flipped" : ""}${card.matched ? " matched" : ""}${!card.flipped && !card.matched ? " face-down" : ""}`}
                            onClick={() => flip(card)}
                            onKeyPress={e => { if (e.key === "Enter" || e.key === " ") flip(card); }}
                        >
                            {(card.flipped || card.matched) ? <MemIcon name={card.sym} /> : ""}
                        </div>
                    ))}
                </div>
                <Feedback {...feedback} />
                <button className="btn btn-green btn-full" onClick={reset} aria-label="New Game"><I icon={faArrowsRotate} /> New Game</button>
            </div>
        </div>
    );
}

/* ── Pattern Completion ── */
function PatternGame() {
    const [idx, setIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState({ text: "", type: "" });
    const [locked, setLocked] = useState(false);
    const [opts, setOpts] = useState(() => shuffle(PATTERNS[0].opts));
    const [answered, setAnswered] = useState({});
    const [revealed, setRevealed] = useState(null);

    const data = PATTERNS[idx % PATTERNS.length];

    const check = val => {
        if (locked) return;
        setLocked(true);
        const correct = data.ans;
        const newAnswered = {};
        data.opts.forEach(o => {
            if (o === correct) newAnswered[o] = "correct";
            else if (o === val) newAnswered[o] = "wrong";
        });
        setAnswered(newAnswered);
        setRevealed(correct);
        if (val === correct) {
            setScore(s => s + 10);
            setFeedback({ text: "Pattern complete!", type: "good" });
        } else {
            setFeedback({ text: `Not quite! It was the right one — keep going!`, type: "bad" });
        }
        setTimeout(() => {
            const nextIdx = idx + 1;
            setIdx(nextIdx);
            setOpts(shuffle(PATTERNS[nextIdx % PATTERNS.length].opts));
            setAnswered({});
            setRevealed(null);
            setLocked(false);
            setFeedback({ text: "", type: "" });
        }, 1600);
    };

    return (
        <div className="card pattern" role="region" aria-label="Pattern Completion Game">
            <CardStripe variant="pattern" />
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 22px 12px" }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: "rgba(251,146,60,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.7rem", flexShrink: 0 }}><I icon={faBullseye} color="#fb923c" /></div>
                <div>
                    <div className="card-title">What Comes Next?</div>
                    <div className="card-desc">Complete the pattern — great for logic skills!</div>
                </div>
            </div>
            <div style={{ padding: "0 22px 22px" }}>
                <div className="score-row">
                    <span className="badge" style={{ color: "#fb923c" }}>Score: <b>{score}</b></span>
                    <span className="badge">Q {(idx % PATTERNS.length) + 1}</span>
                </div>
                <ProgressBar value={((idx % PATTERNS.length) / 10) * 100} variant="pattern" />
                <div className="pattern-stage">
                    <div className="pattern-label">What comes next in the pattern?</div>
                    <div className="pattern-row">
                        {data.seq.map((s, i) => <div key={i} className="pat-item"><PatIcon name={s} /></div>)}
                        <div className="pat-item" style={revealed ? { background: "rgba(74,222,128,0.2)", border: "2px solid #4ade80", fontSize: "1.5rem" } : {}}>
                            {revealed ? <PatIcon name={revealed} /> : ""}
                        </div>
                    </div>
                </div>
                <div className="opts-grid3" role="group" aria-label="Pattern answer choices">
                    {opts.map(o => (
                        <button key={o} className={`opt${answered[o] ? " " + answered[o] : ""}`} style={{ fontSize: "1.5rem" }} onClick={() => check(o)}><PatIcon name={o} /></button>
                    ))}
                </div>
                <Feedback {...feedback} />
            </div>
        </div>
    );
}

/* ── Simon Says ── */
function SimonGame() {
    const BUTTONS = [
        { i: 0, icon: faStar, label: "Blue star", bg: "rgba(56,189,248,0.12)", border: "rgba(56,189,248,0.2)", litBg: "rgba(56,189,248,0.5)", litBorder: "#38bdf8" },
        { i: 1, icon: faHeart, label: "Pink heart", bg: "rgba(244,114,182,0.12)", border: "rgba(244,114,182,0.2)", litBg: "rgba(244,114,182,0.5)", litBorder: "#f472b6" },
        { i: 2, icon: faClover, label: "Green leaf", bg: "rgba(74,222,128,0.12)", border: "rgba(74,222,128,0.2)", litBg: "rgba(74,222,128,0.5)", litBorder: "#4ade80" },
        { i: 3, icon: faSun, label: "Yellow sun", bg: "rgba(250,204,21,0.12)", border: "rgba(250,204,21,0.2)", litBg: "rgba(250,204,21,0.5)", litBorder: "#facc15" },
    ];

    const [seq, setSeq] = useState([]);
    const [input, setInput] = useState([]);
    const [playing, setPlaying] = useState(false);
    const [best, setBest] = useState(0);
    const [lit, setLit] = useState(null);
    const [pressed, setPressed] = useState(null);
    const [feedback, setFeedback] = useState({ text: "", type: "" });
    const [status, setStatus] = useState("Press START to play!");
    const [started, setStarted] = useState(false);

    const lightBtn = (idx) => {
        setLit(idx);
        setTimeout(() => setLit(null), 600);
    };

    const addStep = (currentSeq) => {
        const newSeq = [...currentSeq, Math.floor(Math.random() * 4)];
        setSeq(newSeq);
        setInput([]);
        setStatus(`Watch the sequence… (${newSeq.length} steps)`);
        let i = 0;
        const play = () => {
            if (i < newSeq.length) { lightBtn(newSeq[i]); i++; setTimeout(play, 1200); }
            else { setPlaying(true); setStatus(`Your turn! Repeat ${newSeq.length} steps`); }
        };
        setTimeout(play, 600);
        return newSeq;
    };

    const start = () => {
        setStarted(true);
        setFeedback({ text: "", type: "" });
        const newSeq = [];
        addStep(newSeq);
    };

    const pressBtn = (idx) => {
        if (!playing) return;
        setPressed(idx); setTimeout(() => setPressed(null), 200);
        const newInput = [...input, idx];
        setInput(newInput);
        const pos = newInput.length - 1;
        if (newInput[pos] !== seq[pos]) {
            setPlaying(false);
            const score = seq.length - 1;
            setFeedback({ text: `Oops! You got ${score} steps! Try again!`, type: "bad" });
            setStatus("Press START to play again!");
            setBest(b => Math.max(b, score));
            return;
        }
        if (newInput.length === seq.length) {
            setPlaying(false);
            setFeedback({ text: `Perfect! Level ${seq.length}!`, type: "good" });
            setBest(b => Math.max(b, seq.length));
            setTimeout(() => addStep(seq), 1200);
        }
    };

    return (
        <div className="card sequence" role="region" aria-label="Simon Says Sequence Game">
            <CardStripe variant="sequence" />
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 22px 12px" }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: "rgba(167,139,250,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.7rem", flexShrink: 0 }}><I icon={faBullseye} color="#a78bfa" /></div>
                <div>
                    <div className="card-title">Follow the Sequence</div>
                    <div className="card-desc">Watch, remember &amp; repeat! Builds working memory</div>
                </div>
            </div>
            <div style={{ padding: "0 22px 22px" }}>
                <div className="score-row">
                    <span className="badge" style={{ color: "#a78bfa" }}>Level: <b>{seq.length || 1}</b></span>
                    <span className="badge">Best: {best}</span>
                </div>
                <div className="simon-status" aria-live="polite">{status}</div>
                <div className="simon-grid" aria-label="Simon sequence buttons">
                    {BUTTONS.map(btn => {
                        const isLit = lit === btn.i;
                        const isPressed = pressed === btn.i;
                        return (
                            <div
                                key={btn.i}
                                className="simon-btn"
                                data-i={btn.i}
                                role="button"
                                tabIndex={0}
                                aria-label={btn.label}
                                onClick={() => pressBtn(btn.i)}
                                onKeyPress={e => { if (e.key === "Enter" || e.key === " ") pressBtn(btn.i); }}
                                style={{
                                    background: (isLit || isPressed) ? btn.litBg : btn.bg,
                                    borderColor: (isLit || isPressed) ? btn.litBorder : btn.border,
                                    transform: isLit ? "scale(1.08)" : "scale(1)",
                                }}
                            ><I icon={btn.icon} /></div>
                        );
                    })}
                </div>
                <Feedback {...feedback} />
                <button className="btn btn-violet btn-full" onClick={start}>
                    {started ? <><I icon={faArrowsRotate} /> Restart</> : <><I icon={faPlay} /> Start Game</>}
                </button>
            </div>
        </div>
    );
}

/* ── AI Tutor ── */
function AiTutorGame() {
    const [messages, setMessages] = useState([
        { role: "ai", text: "Hi there! I'm your helper! I can teach you sign language, talk about feelings, explain patterns, or just have fun chatting. What would you like to learn today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const chatRef = useRef(null);

    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [messages]);

    const send = async (text) => {
        const msg = text || input.trim();
        if (!msg) return;
        setInput("");
        setMessages(prev => [...prev, { role: "user", text: msg }]);
        setLoading(true);

        const history = messages
            .filter(m => m.role === "user" || m.role === "ai")
            .map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text }));
        history.push({ role: "user", content: msg });

        try {
            const res = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "claude-sonnet-4-20250514",
                    max_tokens: 1000,
                    system: `You are a warm, patient, inclusive AI tutor for children with special needs (ages 5–14). This includes children who are deaf/hard of hearing, have autism spectrum disorder, learning disabilities, ADHD, or other differences.\n\nYour guidelines:\n- Use SHORT, CLEAR sentences. No more than 2 sentences per paragraph.\n- Be extremely patient, encouraging, and positive. Never make the child feel bad.\n- Use clear, descriptive language to make communication fun and visual.\n- If asked about ASL (American Sign Language), describe the hand shape and movement simply.\n- If asked about emotions/feelings, validate them and give simple strategies to cope.\n- For memory/focus tips, give concrete, easy-to-follow advice.\n- Offer breathing exercises or calming techniques when appropriate.\n- Avoid complex words. Prefer simple vocabulary.\n- Always end with encouragement or a gentle question to keep them engaged.\n- You are NEVER impatient, NEVER dismissive. Every question is valid.`,
                    messages: history,
                }),
            });
            const data = await res.json();
            const reply = data.content?.[0]?.text || "I had a little trouble! Can you try again?";
            setMessages(prev => [...prev, { role: "ai", text: reply }]);
        } catch {
            setMessages(prev => [...prev, { role: "ai", text: "Oops! Something went wrong. Please try again!" }]);
        }
        setLoading(false);
    };

    const quickPrompts = [
        { label: "ASL A–E", icon: faHandPeace, q: "Teach me the ASL alphabet A to E!" },
        { label: "Anxious?", icon: faFaceFlushed, q: "What does feeling anxious mean? Explain simply." },
        { label: "Memory tip", icon: faBrain, q: "Can you give me a fun memory trick?" },
        { label: "Calm down", icon: faFeather, q: "What is a good breathing exercise to feel calm?" },
    ];

    return (
        <div className="card ai-tutor" role="region" aria-label="AI Inclusive Tutor">
            <CardStripe variant="ai-tutor" />
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 22px 12px" }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: "rgba(250,204,21,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.7rem", flexShrink: 0 }}><I icon={faRobot} color="#facc15" /></div>
                <div>
                    <div className="card-title">My AI Helper</div>
                    <div className="card-desc">Ask anything — your patient, kind AI tutor</div>
                </div>
            </div>
            <div style={{ padding: "0 22px 22px" }}>
                <div className="chat-area" ref={chatRef} role="log" aria-live="polite" aria-label="Chat messages">
                    {messages.map((m, i) => (
                        <div key={i} className={`msg ${m.role}`}>{m.text}</div>
                    ))}
                    {loading && <div className="msg load">Thinking… <I icon={faBrain} /></div>}
                </div>
                <div className="chat-input-row">
                    <input
                        className="chat-input" type="text" placeholder="Type your question here…" maxLength={300}
                        value={input} onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === "Enter" && send()}
                        aria-label="Type your message"
                    />
                    <button className="btn btn-yellow" onClick={() => send()} disabled={loading} aria-label="Send message">
                        {loading ? "…" : "Send"}
                    </button>
                </div>
                <div className="quick-prompts" role="group" aria-label="Quick questions">
                    {quickPrompts.map(p => (
                        <button key={p.q} className="qp" onClick={() => send(p.q)}><I icon={p.icon} /> {p.label}</button>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   ACCESSIBILITY SIDEBAR
═══════════════════════════════════════════ */

function Sidebar({ open, onClose, settings, toggle, setTextSize, aiStatus, aiActive }) {
    const tools = [
        { key: "dyslexia", icon: faBookOpen, label: "Dyslexia Font" },
        { key: "focus", icon: faBrain, label: "ADHD Focus" },
        { key: "contrast", icon: faMoon, label: "High Contrast" },
        { key: "dark", icon: faMoon, label: "Deep Dark" },
        { key: "overlay", icon: faCircle, label: "Color Overlay" },
        { key: "motor", icon: faMouse, label: "Motor Assist" },
    ];

    const [speaking, setSpeaking] = useState(false);

    const toggleNarrator = () => {
        if (!speaking) {
            const u = new SpeechSynthesisUtterance(document.body.innerText);
            u.rate = 0.9; u.pitch = 1;
            speechSynthesis.cancel(); speechSynthesis.speak(u);
            setSpeaking(true);
        } else {
            speechSynthesis.cancel();
            setSpeaking(false);
        }
    };

    useEffect(() => {
        const onKey = e => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <>
            {open && <div id="sideOverlay" className="show" onClick={onClose} />}
            <div id="sidebar" className={open ? "open" : ""} role="complementary" aria-label="Accessibility Sidebar">
                <div className="sidebarHeader">
                    <h2>Accessibility Hub</h2>
                    <button id="closeBtn" aria-label="Close sidebar" onClick={onClose}><I icon={faCircleXmark} /></button>
                </div>

                <div className="aiBadgeWrap">
                    <h4><I icon={faRobot} /> AI Behaviour Engine</h4>
                    <div id="aiBadge" className={aiActive ? "active" : ""}>
                        <span>{aiStatus}</span>
                    </div>
                </div>

                {tools.map(t => (
                    <div key={t.key} className="tool">
                        <span><I icon={t.icon} /> {t.label}</span>
                        <label className="switch" aria-label={`Toggle ${t.label}`}>
                            <input type="checkbox" checked={settings[t.key]} onChange={() => toggle(t.key)} />
                            <span className="slider"></span>
                        </label>
                    </div>
                ))}

                <hr className="side-divider" />

                <div className="tool">
                    <span><I icon={faVolumeHigh} /> Narrator</span>
                    <button className="narratorBtn" onClick={toggleNarrator}>{speaking ? "Stop" : "Start"}</button>
                </div>

                <div className="toolColumn">
                    <label htmlFor="textSlider">Text Size</label>
                    <input type="range" min={14} max={28} value={settings.textSize} id="textSlider"
                        onChange={e => setTextSize(parseInt(e.target.value))} aria-label="Adjust text size" />
                </div>
            </div>
        </>
    );
}

/* ═══════════════════════════════════════════
   TOAST NOTIFICATIONS
═══════════════════════════════════════════ */

function Toasts({ toasts }) {
    return (
        <>
            {toasts.map((t, i) => (
                <div key={t.id} className="aiToast show" style={{
                    background: `linear-gradient(135deg,${t.bgFrom},${t.bgTo})`,
                    bottom: `${32 + i * 76}px`,
                }}>
                    <span className="aiToastIcon">{t.icon} AI Detected</span>
                    <span>{t.label} · {t.pct}% confidence</span>
                </div>
            ))}
        </>
    );
}

/* ═══════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════ */

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Atkinson+Hyperlegible:wght@400;700&family=Lexend:wght@400;600&display=swap');

:root {
  --bg:#080b14; --surface:#0e1220; --card:#111828; --border:rgba(255,255,255,0.06);
  --text:#eef2ff; --muted:#7a86a8;
  --c1:#38bdf8; --c2:#fb923c; --c3:#4ade80; --c4:#f472b6; --c5:#a78bfa; --c6:#facc15; --r:22px;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--text);font-family:'Atkinson Hyperlegible',sans-serif;line-height:1.5;min-height:100vh;overflow-x:hidden;transition:background 0.3s,color 0.3s,font-family 0.3s}
body::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 60% 50% at 10% 10%,rgba(56,189,248,0.06) 0%,transparent 70%),radial-gradient(ellipse 50% 60% at 90% 80%,rgba(167,139,250,0.07) 0%,transparent 70%),radial-gradient(ellipse 40% 40% at 50% 50%,rgba(251,146,60,0.04) 0%,transparent 70%)}
.games-grid{position:relative;z-index:10;display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:24px;max-width:1280px;margin:0 auto;padding:32px 24px 80px}
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;transition:transform 0.3s cubic-bezier(.34,1.56,.64,1),box-shadow 0.3s ease;position:relative}
.card:hover{transform:translateY(-5px);box-shadow:0 24px 60px rgba(0,0,0,0.5)}
.card-title{font-family:'Baloo 2',cursive;font-size:1.3rem;font-weight:700;line-height:1.1}
.card-desc{font-size:0.78rem;color:var(--muted);margin-top:2px}
.score-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.badge{padding:4px 13px;border-radius:50px;background:rgba(255,255,255,0.05);font-size:0.82rem;font-weight:700}
.btn{padding:11px 18px;border-radius:12px;border:none;font-family:'Baloo 2',cursive;font-size:1rem;font-weight:700;cursor:pointer;transition:all 0.2s ease}
.btn:hover{filter:brightness(1.15);transform:scale(1.04)}
.btn:active{transform:scale(0.97)}
.btn-sky{background:var(--c1);color:#041218}
.btn-green{background:var(--c3);color:#031208}
.btn-violet{background:var(--c5);color:#0c0820}
.btn-yellow{background:var(--c6);color:#1a1000}
.btn-full{width:100%;margin-top:10px}
.opts-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:10px}
.opts-grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px;margin-bottom:10px}
.opt{padding:13px 6px;border-radius:13px;border:2px solid transparent;background:rgba(255,255,255,0.04);color:var(--text);font-family:'Baloo 2',cursive;font-size:1.05rem;font-weight:700;cursor:pointer;transition:all 0.2s ease;text-align:center}
.opt:hover{background:rgba(255,255,255,0.09)}
.opt.correct{background:rgba(74,222,128,0.2);border-color:var(--c3);animation:pop 0.4s ease}
.opt.wrong{background:rgba(251,146,60,0.2);border-color:var(--c2);animation:shakeAnim 0.35s ease}
@keyframes pop{0%{transform:scale(1)}50%{transform:scale(1.12)}100%{transform:scale(1)}}
@keyframes shakeAnim{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}
@keyframes bounceIn{0%{opacity:0;transform:scale(0.5)}70%{transform:scale(1.08)}100%{opacity:1;transform:scale(1)}}
.asl-stage{background:rgba(56,189,248,0.05);border-radius:16px;padding:18px;text-align:center;margin-bottom:14px}
.emotion-stage{background:rgba(244,114,182,0.06);border-radius:16px;padding:18px;text-align:center;margin-bottom:14px}
.pattern-stage{background:rgba(251,146,60,0.05);border-radius:16px;padding:16px;margin-bottom:14px}
.big-symbol{font-size:5rem;line-height:1;display:block}
.q-label{font-size:1rem;font-weight:700;margin-top:6px}
.hint-label{font-size:0.82rem;color:var(--muted);margin-top:4px;font-weight:700}
.memory-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-bottom:12px}
.mem-card{aspect-ratio:1;border-radius:12px;border:2px solid var(--border);background:rgba(74,222,128,0.07);display:flex;align-items:center;justify-content:center;font-size:1.6rem;cursor:pointer;transition:all 0.3s ease;user-select:none}
.mem-card.flipped{background:rgba(74,222,128,0.18);border-color:var(--c3)}
.mem-card.matched{background:rgba(74,222,128,0.3);border-color:var(--c3);cursor:default}
.mem-card.face-down{font-size:0}
.mem-card.face-down::after{content:'?';font-size:1.4rem;color:var(--c3);font-family:'Baloo 2',cursive}
.pattern-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px}
.pat-item{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;border:2px solid rgba(251,146,60,0.2);background:rgba(251,146,60,0.1);flex-shrink:0}
.pat-item.blank{background:rgba(255,255,255,0.05);border:2px dashed rgba(255,255,255,0.2);font-size:0}
.pat-item.blank::after{content:'?';font-size:1.2rem;color:var(--muted);font-family:'Baloo 2',cursive}
.pattern-label{font-size:0.85rem;color:var(--muted);font-weight:700;margin-bottom:6px}
.simon-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
.simon-btn{padding:28px 10px;border-radius:16px;border:3px solid;font-size:2.2rem;cursor:pointer;transition:all 0.15s ease;text-align:center;user-select:none}
.simon-status{text-align:center;font-size:0.95rem;font-weight:700;color:var(--muted);margin-bottom:10px;min-height:22px}
.chat-area{background:rgba(250,204,21,0.04);border:1px solid rgba(250,204,21,0.1);border-radius:16px;padding:14px;height:200px;overflow-y:auto;margin-bottom:12px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}
.chat-area::-webkit-scrollbar{width:3px}
.chat-area::-webkit-scrollbar-thumb{background:var(--c5);border-radius:2px}
.msg{padding:10px 14px;border-radius:13px;font-size:0.9rem;max-width:88%;line-height:1.55;animation:msgIn 0.3s ease}
@keyframes msgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.msg.ai{background:rgba(250,204,21,0.1);border:1px solid rgba(250,204,21,0.15);align-self:flex-start;border-bottom-left-radius:3px}
.msg.user{background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.2);align-self:flex-end;border-bottom-right-radius:3px}
.msg.load{background:rgba(250,204,21,0.06);color:var(--muted);align-self:flex-start}
.chat-input-row{display:flex;gap:8px}
.chat-input{flex:1;padding:11px 15px;border-radius:12px;border:2px solid var(--border);background:rgba(255,255,255,0.04);color:var(--text);font-family:'Atkinson Hyperlegible',sans-serif;font-size:0.9rem;outline:none;transition:border-color 0.2s}
.chat-input:focus{border-color:var(--c6)}
.chat-input::placeholder{color:var(--muted)}
.quick-prompts{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}
.qp{padding:6px 12px;border-radius:50px;background:rgba(250,204,21,0.1);border:1px solid rgba(250,204,21,0.2);color:var(--c6);font-size:0.78rem;font-weight:700;cursor:pointer;transition:all 0.2s;font-family:'Atkinson Hyperlegible',sans-serif}
.qp:hover{background:rgba(250,204,21,0.2)}
.sp{position:fixed;pointer-events:none;z-index:0;font-size:1.2rem;opacity:0.1;animation:floatUp linear infinite}
@keyframes floatUp{0%{transform:translateY(105vh) rotate(0deg);opacity:0}10%{opacity:0.1}90%{opacity:0.08}100%{transform:translateY(-10vh) rotate(360deg);opacity:0}}
`;

/* ═══════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════ */

export default function InclusiveLearnApp() {
    return (
        <>
            <style>{GLOBAL_CSS}</style>
            <Navbar />

            {/* Sparkles */}
            {[
                { left: "3%", dur: "18s", delay: "0s", icon: faStar, color: "#eab308" },
                { left: "12%", dur: "22s", delay: "4s", icon: faWandMagicSparkles, color: "#a78bfa" },
                { left: "28%", dur: "16s", delay: "8s", icon: faGem, color: "#c084fc" },
                { left: "50%", dur: "20s", delay: "2s", icon: faStar, color: "#facc15" },
                { left: "68%", dur: "25s", delay: "6s", icon: faMoon, color: "#a78bfa" },
                { left: "82%", dur: "14s", delay: "1s", icon: faGem, color: "#38bdf8" },
                { left: "94%", dur: "19s", delay: "9s", icon: faHeart, color: "#a855f7" },
            ].map((s, i) => (
                <div key={i} className="sp" style={{ left: s.left, animationDuration: s.dur, animationDelay: s.delay }}><I icon={s.icon} color={s.color} /></div>
            ))}

            {/* Header */}
            <header style={{
                position: "sticky", top: 0, zIndex: 10,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "24px 40px",
                background: "rgba(14,18,32,0.85)",
                backdropFilter: "blur(14px)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                        background: "linear-gradient(135deg,#38bdf8,#a78bfa)", color: "#020d1a",
                        width: 44, height: 44, borderRadius: 12,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'Baloo 2',cursive", fontSize: "1.4rem", fontWeight: 800,
                    }}>I</div>
                    <span style={{
                        fontFamily: "'Baloo 2',cursive", fontSize: "1.6rem", fontWeight: 800,
                        background: "linear-gradient(120deg,#38bdf8 0%,#a78bfa 50%,#f472b6 100%)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                    }}>InclusiveLearn</span>
                </div>
                <span style={{ fontSize: "0.78rem", color: "#7a86a8", fontWeight: 700, letterSpacing: "0.5px" }}>
                    <I icon={faRainbow} /> ASL · Emotions · Memory · Patterns · Sequences · AI Tutor
                </span>
            </header>

            {/* Games Grid */}
            <div className="games-grid">
                <ASLGame />
                <EmotionGame />
                <MemoryGame />
                <PatternGame />
                <SimonGame />
                <AiTutorGame />
            </div>
        </>
    );
}
