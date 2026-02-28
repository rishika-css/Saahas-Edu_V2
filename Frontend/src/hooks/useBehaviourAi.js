/* ================================================================
   useBehaviourAI.js  —  React hook wrapping the AI detection engine
   ================================================================
   Tracks ADHD, Dyslexia, and Motor disability signals from user
   behaviour. Returns live probabilities + detected flags.
   Fires onDetect(condition) callback when a threshold is crossed.
   ================================================================ */

import { useEffect, useRef, useCallback } from "react";

/* ── CONFIG ────────────────────────────────────────────────── */
const CFG = {
  WARMUP_MS: 20000,
  POLL_INTERVAL_MS: 8000,

  THRESHOLD: { adhd: 0.42, dyslexia: 0.38, motor: 0.36, anxiety: 0.40 },

  W_ADHD: {
    scrollSpeed: 0.16, scrollReversals: 0.15, mouseFrenzy: 0.17,
    clickRate: 0.12, tabSwitches: 0.13, idleInterrupts: 0.12,
    readingPace: 0.09, keyburstRate: 0.06,
  },
  W_DYSLEXIA: {
    slowReRead: 0.26, hoverDwell: 0.22, backspaceRatio: 0.22,
    slowReadingPace: 0.14, lineTraceMouse: 0.10, reReadCluster: 0.06,
  },
  W_MOTOR: {
    mouseJitter: 0.28, missClickRate: 0.24, cursorArcSize: 0.18,
    keyHoldDuration: 0.16, slowCursor: 0.08, dragAbandonment: 0.06,
  },
  W_ANXIETY: {
    scrollReversalRate: 0.20, mouseFrenzy: 0.18, tabSwitchRate: 0.18,
    clickBurstRate: 0.16, idleBreaks: 0.14, erraticScrolling: 0.14,
  },

  SLOW_SCROLL_MAX: 450,
  ADHD_INHIBIT_AVG: 900,
  LINE_TRACE_SPEED: 350,
  MIN_DWELL_MS: 600,
  DWELL_ZONE_PX: 300,
  JITTER_WIN: 8,
  ARC_WIN: 8,
  ARC_MIN_CHORD: 15,
};

/* ── GEOMETRY ──────────────────────────────────────────────── */
function computeJitter(pts) {
  if (pts.length < 3) return 0;
  let total = 0, count = 0;
  for (let i = 0; i < pts.length - 2; i++) {
    const a = pts[i], b = pts[i + 1], c = pts[i + 2];
    const ldx = c.x - a.x, ldy = c.y - a.y;
    const len = Math.hypot(ldx, ldy);
    if (len < 2) continue;
    total += Math.abs(ldx * (a.y - b.y) - ldy * (a.x - b.x)) / len;
    count++;
  }
  return count > 0 ? total / count : 0;
}

function computeArc(pts) {
  if (pts.length < 4) return 0;
  const p0 = pts[0], pN = pts[pts.length - 1];
  const ldx = pN.x - p0.x, ldy = pN.y - p0.y;
  const len = Math.hypot(ldx, ldy);
  if (len < CFG.ARC_MIN_CHORD) return 0;
  let max = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs(ldx * (p0.y - pts[i].y) - ldy * (p0.x - pts[i].x)) / len;
    if (d > max) max = d;
  }
  return max;
}

/* ── UTILS ─────────────────────────────────────────────────── */
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
const clamp = v => Math.min(1, Math.max(0, v));

/* ================================================================
   HOOK
================================================================ */
export default function useBehaviourAi({ onDetect } = {}) {
  /* All raw data lives in a ref — never causes re-renders */
  const raw = useRef({
    pageLoadTime: Date.now(),
    wordCount: 0,

    lastScrollY: 0,
    lastScrollDir: 0,
    lastScrollTime: Date.now(),
    scrollSpeeds: [],
    scrollReversals: 0,
    forwardScrollDist: 0,
    slowBackScrolls: 0,
    slowBackCluster: [],

    dwellZone: -1,
    dwellStart: Date.now(),
    longDwells: [],

    lastMouseX: 0,
    lastMouseY: 0,
    lastMouseTime: Date.now(),
    mouseDeltas: [],
    mouseDirChanges: 0,
    lastMouseDX: 0,

    jitterWindow: [],
    jitterSamples: [],
    arcWindow: [],
    arcSamples: [],
    slowSamples: [],

    horizSlowMoves: 0,
    horizTotalMoves: 0,

    clickTimes: [],
    totalClicks: 0,
    missClicks: 0,

    tabHides: 0,

    idleTimer: null,
    idleCount: 0,
    wasIdle: false,

    keyBursts: 0,
    inBurst: false,
    burstTimer: null,
    keyCount: 0,
    backspaceCount: 0,
    keyDownTimes: {},
    keyHoldDurations: [],

    mouseIsDown: false,
    isDragging: false,
    dragStartTime: 0,
    dragStarts: 0,
    dragAbandons: 0,
  });

  const latched = useRef({ adhd: false, dyslexia: false, motor: false, anxiety: false });
  const onDetectRef = useRef(onDetect);
  const smoothed = useRef({
    adhd: 0,
    dyslexia: 0,
    motor: 0,
    anxiety: 0,
  });
  useEffect(() => { onDetectRef.current = onDetect; }, [onDetect]);

  /* ── Scorers ─────────────────────────────────────────────── */
  const score = useCallback(() => {
    const r = raw.current;
    const elMin = () => Math.max(0.1, (Date.now() - r.pageLoadTime) / 60000);
    const sAvg = () => avg(r.scrollSpeeds);

    /* ── ADHD ── */
    const adhdSignals = {
      scrollSpeed() {
        const s = [...r.scrollSpeeds].sort((a, b) => b - a);
        return clamp(avg(s.slice(0, Math.max(1, Math.floor(s.length / 4)))) / 3000);
      },
      scrollReversals() { return clamp((r.scrollReversals / elMin()) / 22); },
      mouseFrenzy() {
        return clamp(avg(r.mouseDeltas) / 1800) * 0.55
          + clamp((r.mouseDirChanges / elMin()) / 100) * 0.45;
      },
      clickRate() { return clamp(r.clickTimes.filter(t => Date.now() - t < 10000).length / 8); },
      tabSwitches() { return clamp((r.tabHides / elMin()) / 4); },
      idleInterrupts() { return clamp((r.idleCount / elMin()) / 6); },
      readingPace() {
        const e = (Date.now() - r.pageLoadTime) / 1000, ratio = e / (r.wordCount / 3 || 100);
        if (e < 8) return 0;
        if (ratio < 0.18) return 0.85;
        if (ratio < 0.40) return 0.45;
        return 0;
      },
      keyburstRate() { return clamp((r.keyBursts / elMin()) / 10); },
    };

    /* ── Dyslexia ── */
    const dysSignals = {
      slowReRead() {
        const inhibit = clamp(sAvg() / CFG.ADHD_INHIBIT_AVG);
        if (inhibit > 0.75) return clamp(0.15 * (1 - inhibit));
        return clamp((r.slowBackScrolls / elMin()) / 5) * (1 - inhibit * 0.5);
      },
      hoverDwell() {
        if (r.longDwells.length < 1) return 0;
        return clamp(r.longDwells.filter(d => d > 2000).length / Math.max(1, r.longDwells.length) * 2.5);
      },
      backspaceRatio() {
        if (r.keyCount < 8) return 0;
        return clamp((r.backspaceCount / r.keyCount) / 0.35);
      },
      slowReadingPace() {
        if (sAvg() > 1000) return 0;
        const e = (Date.now() - r.pageLoadTime) / 1000, ratio = e / (r.wordCount / 3 || 100);
        if (e < 12) return 0;
        if (ratio > 3.0) return 1.0;
        if (ratio > 2.0) return 0.75;
        if (ratio > 1.3) return 0.40;
        return 0;
      },
      lineTraceMouse() {
        if (r.horizTotalMoves < 8) return 0;
        return clamp((r.horizSlowMoves / r.horizTotalMoves) * 2.2);
      },
      reReadCluster() {
        const inhibit = clamp(sAvg() / CFG.ADHD_INHIBIT_AVG);
        if (inhibit > 0.75) return 0;
        return clamp(r.slowBackCluster.filter(t => Date.now() - t < 60000).length / 4) * (1 - inhibit * 0.5);
      },
    };

    /* ── Motor ── */
    const motSignals = {
      mouseJitter() {
        if (r.jitterSamples.length < 5) return 0;
        const s = [...r.jitterSamples].sort((a, b) => a - b);
        return clamp(s[Math.floor(s.length * 0.75)] / 5);
      },
      missClickRate() {
        if (r.totalClicks < 3) return 0;
        return clamp((r.missClicks / r.totalClicks) / 0.5);
      },
      cursorArcSize() {
        if (r.arcSamples.length < 4) return 0;
        const s = [...r.arcSamples].sort((a, b) => a - b);
        return clamp(s[Math.floor(s.length * 0.75)] / 20);
      },
      keyHoldDuration() {
        if (r.keyHoldDurations.length < 4) return 0;
        return clamp(r.keyHoldDurations.filter(d => d > 300).length / r.keyHoldDurations.length / 0.45);
      },
      slowCursor() {
        const lt = r.horizTotalMoves > 0 ? r.horizSlowMoves / r.horizTotalMoves : 0;
        return clamp(avg(r.slowSamples) * 1.8) * (1 - clamp(lt * 2) * 0.6);
      },
      dragAbandonment() {
        if (r.dragStarts < 2) return 0;
        return clamp((r.dragAbandons / r.dragStarts) / 0.4);
      },
    };

    /* ── Anxiety ── */
    const anxSignals = {
      scrollReversalRate() { return clamp((r.scrollReversals / elMin()) / 18); },
      mouseFrenzy() {
        return clamp(avg(r.mouseDeltas) / 1600) * 0.6
          + clamp((r.mouseDirChanges / elMin()) / 80) * 0.4;
      },
      tabSwitchRate() { return clamp((r.tabHides / elMin()) / 3); },
      clickBurstRate() {
        const recent = r.clickTimes.filter(t => Date.now() - t < 8000).length;
        return clamp(recent / 6);
      },
      idleBreaks() { return clamp((r.idleCount / elMin()) / 5); },
      erraticScrolling() {
        if (r.scrollSpeeds.length < 10) return 0;
        const speeds = r.scrollSpeeds.slice(-20);
        const mean = avg(speeds);
        const variance = avg(speeds.map(s => Math.pow(s - mean, 2)));
        return clamp(Math.sqrt(variance) / 1200);
      },
    };

    const compute = (scorers, weights) => {
      const signals = {};
      let score = 0;
      for (const [k, w] of Object.entries(weights)) {
        const s = scorers[k] ? scorers[k]() : 0;
        signals[k] = parseFloat(s.toFixed(3));
        score += s * w;
      }
      return { probability: parseFloat(score.toFixed(3)), signals };
    };

    return {
      adhd: compute(adhdSignals, CFG.W_ADHD),
      dyslexia: compute(dysSignals, CFG.W_DYSLEXIA),
      motor: compute(motSignals, CFG.W_MOTOR),
      anxiety: compute(anxSignals, CFG.W_ANXIETY),
    };
  }, []);

  /* ── Poll ────────────────────────────────────────────────── */
  const poll = useCallback(() => {

    const results = score();

    const SMOOTHING = 0.35;
    const MOMENTUM_BOOST = 0.08;

    Object.keys(results).forEach(key => {

      const rawProb = results[key].probability;

      // Exponential smoothing
      smoothed.current[key] =
        smoothed.current[key] * (1 - SMOOTHING) +
        rawProb * SMOOTHING;

      // Momentum boost
      if (rawProb > smoothed.current[key]) {
        smoothed.current[key] += MOMENTUM_BOOST * rawProb;
      }

      // Clamp
      smoothed.current[key] = Math.min(1, smoothed.current[key]);

      results[key].probability =
        parseFloat(smoothed.current[key].toFixed(3));
    });

    // Threshold check
    Object.keys(results).forEach(key => {
      if (
        !latched.current[key] &&
        results[key].probability >= CFG.THRESHOLD[key]
      ) {
        latched.current[key] = true;
        onDetectRef.current?.(
          key,
          results[key].probability,
          results[key].signals
        );
      }
    });

    return results;

  }, [score]);

  /* ── Event Listeners ─────────────────────────────────────── */
  useEffect(() => {
    const r = raw.current;
    r.pageLoadTime = Date.now();
    r.wordCount = (document.body.innerText || "").split(/\s+/).filter(Boolean).length || 300;

    /* Idle */
    function resetIdle() {
      if (r.wasIdle) { r.idleCount++; r.wasIdle = false; }
      clearTimeout(r.idleTimer);
      r.idleTimer = setTimeout(() => { r.wasIdle = true; }, 4000);
    }

    /* SCROLL */
    function onScroll() {
      const now = Date.now(), newY = window.scrollY;
      const dt = Math.max(1, now - r.lastScrollTime);
      const dy = newY - r.lastScrollY;
      const dir = dy > 0 ? 1 : dy < 0 ? -1 : 0;

      if (dir !== 0) {
        const speed = Math.abs(dy) / dt * 1000;
        r.scrollSpeeds.push(speed);
        if (r.scrollSpeeds.length > 80) r.scrollSpeeds.shift();
        if (r.lastScrollDir !== 0 && dir !== r.lastScrollDir) r.scrollReversals++;
        if (dir === 1) {
          r.forwardScrollDist += Math.abs(dy);
        } else if (r.forwardScrollDist > 200) {
          if (speed <= CFG.SLOW_SCROLL_MAX) {
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
        if (r.dwellZone >= 0 && dwellMs >= CFG.MIN_DWELL_MS) {
          r.longDwells.push(dwellMs);
          if (r.longDwells.length > 50) r.longDwells.shift();
        }
        r.dwellZone = zone; r.dwellStart = now;
      }
      r.lastScrollY = newY; r.lastScrollTime = now;
      resetIdle();
    }

    /* MOUSE MOVE */
    function onMouseMove(e) {
      const now = Date.now(), dt = Math.max(1, now - r.lastMouseTime);
      const dx = e.clientX - r.lastMouseX, dy = e.clientY - r.lastMouseY;
      const spd = Math.hypot(dx, dy) / dt * 1000;

      r.mouseDeltas.push(spd);
      if (r.mouseDeltas.length > 80) r.mouseDeltas.shift();
      if (r.lastMouseDX !== 0 && Math.sign(dx) !== 0 && Math.sign(dx) !== Math.sign(r.lastMouseDX)) r.mouseDirChanges++;
      if (dx !== 0) r.lastMouseDX = dx;

      r.jitterWindow.push({ x: e.clientX, y: e.clientY });
      if (r.jitterWindow.length > CFG.JITTER_WIN) r.jitterWindow.shift();
      if (r.jitterWindow.length >= 3) {
        r.jitterSamples.push(computeJitter(r.jitterWindow));
        if (r.jitterSamples.length > 60) r.jitterSamples.shift();
      }

      r.slowSamples.push(spd < 100 ? 1 : 0);
      if (r.slowSamples.length > 80) r.slowSamples.shift();

      r.arcWindow.push({ x: e.clientX, y: e.clientY });
      if (r.arcWindow.length > CFG.ARC_WIN) r.arcWindow.shift();
      if (r.arcWindow.length >= 4) {
        r.arcSamples.push(computeArc(r.arcWindow));
        if (r.arcSamples.length > 40) r.arcSamples.shift();
      }

      const absX = Math.abs(dx), absY = Math.abs(dy);
      if (absX + absY > 1) {
        r.horizTotalMoves++;
        if (absX > absY * 2.0 && spd < CFG.LINE_TRACE_SPEED) r.horizSlowMoves++;
      }

      if (r.mouseIsDown && !r.isDragging) {
        r.isDragging = true; r.dragStarts++; r.dragStartTime = now;
      }
      r.lastMouseX = e.clientX; r.lastMouseY = e.clientY; r.lastMouseTime = now;
      resetIdle();
    }

    /* CLICK */
    function onClick(e) {
      r.clickTimes.push(Date.now());
      r.totalClicks++;
      if (r.clickTimes.length > 40) r.clickTimes.shift();

      const TOLERANCE = 12;
      const hit = Array.from(document.querySelectorAll(
        "a,button,input,select,label,[role='button']"
      )).some(el => {
        const rc = el.getBoundingClientRect();
        return e.clientX >= rc.left - TOLERANCE && e.clientX <= rc.right + TOLERANCE &&
          e.clientY >= rc.top - TOLERANCE && e.clientY <= rc.bottom + TOLERANCE;
      });
      if (!hit) r.missClicks++;
      resetIdle();
    }

    /* MOUSE DOWN/UP */
    function onMouseDown() { r.mouseIsDown = true; r.isDragging = false; }
    function onMouseUp() {
      if (r.isDragging && Date.now() - r.dragStartTime < 300) r.dragAbandons++;
      r.mouseIsDown = false; r.isDragging = false;
    }

    /* KEYBOARD */
    function onKeyDown(e) {
      r.keyCount++;
      if (e.key === "Backspace" || e.key === "Delete") r.backspaceCount++;
      if (!r.inBurst) { r.inBurst = true; r.keyBursts++; }
      clearTimeout(r.burstTimer);
      r.burstTimer = setTimeout(() => { r.inBurst = false; }, 1500);
      r.keyDownTimes[e.code] = Date.now();
      resetIdle();
    }
    function onKeyUp(e) {
      if (r.keyDownTimes[e.code]) {
        r.keyHoldDurations.push(Date.now() - r.keyDownTimes[e.code]);
        if (r.keyHoldDurations.length > 50) r.keyHoldDurations.shift();
        delete r.keyDownTimes[e.code];
      }
    }

    /* VISIBILITY */
    function onVisibility() { if (document.hidden) r.tabHides++; }

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("click", onClick);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("visibilitychange", onVisibility);

    /* ── Start polling after warmup ── */
    let interval;
    const warmup = setTimeout(() => {
      poll();
      interval = setInterval(poll, CFG.POLL_INTERVAL_MS);
    }, CFG.WARMUP_MS);

    /* ── Debug helper ── */
    window._AIDebug = () => {
      const res = score();
      const bar = v => "█".repeat(Math.round(v * 10)) + "░".repeat(10 - Math.round(v * 10));
      console.group("%cAI Engine", "font-weight:bold;font-size:13px");
      ["adhd", "dyslexia", "motor"].forEach(k => {
        const { probability: p, signals: s } = res[k];
        console.group(`%c${k.toUpperCase()} ${(p * 100).toFixed(1)}% ${bar(p)} (need ${CFG.THRESHOLD[k] * 100}%)`,
          p >= CFG.THRESHOLD[k] ? "color:#22c55e;font-weight:bold" : "color:#888");
        Object.entries(s).forEach(([sk, sv]) =>
          console.log(`  ${sk.padEnd(18)} ${bar(sv)} ${(sv * 100).toFixed(0)}%`));
        console.groupEnd();
      });
      console.log("Latched:", latched.current);
      console.groupEnd();
    };

    return () => {
      clearTimeout(warmup);
      clearInterval(interval);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("click", onClick);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [poll, score]);

  return { getScores: score, latched: latched.current };
}