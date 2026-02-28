/**
 * BrailleTrainer.jsx — Full drop-in replacement
 *
 * HOW TO USE:
 *   1. Replace your existing src/components/braille/BrailleTrainer.jsx with this file.
 *   2. Keep your BrailleEngine import path matching your project.
 *   3. No other files need to change.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye, faKeyboard, faPenToSquare, faVolumeHigh, faVolumeXmark,
  faBookOpen, faRocket, faTrophy, faTrashCan, faChevronDown, faChevronUp, faBolt,
} from '@fortawesome/free-solid-svg-icons';
import {
  textToTokens, dotsToLetter, chordToContraction,
  brailleLetters, grade2Contractions,
} from '../../utils/BrailleEngine';

// ─────────────────────────────────────────────────────────────
//  DESIGN TOKENS — dark IDE palette
// ─────────────────────────────────────────────────────────────
const T = {
  bg0: '#020617',
  bg1: '#0a0f1e',
  bg2: '#0f172a',
  bg3: '#1e293b',
  bg4: '#334155',
  text0: '#f1f5f9',
  text1: '#94a3b8',
  text2: '#475569',
  text3: '#334155',
  violet: '#7c3aed',
  violetMid: '#6d28d9',
  violetLight: '#a78bfa',
  green: '#34d399',
  greenDark: '#022c22',
  greenBorder: '#064e3b',
  red: '#f87171',
  redDark: '#2d0a0a',
  redBorder: '#7f1d1d',
  amber: '#f59e0b',
  amberDark: '#422006',
  amberBorder: '#92400e',
  blue: '#60a5fa',
  blueDark: '#1e3a5f',
};

const ALLOWED_KEYS = ['f', 'd', 's', 'j', 'k', 'l'];
const KEY_TO_DOT = { f: 1, d: 2, s: 3, j: 4, k: 5, l: 6 };

// ─────────────────────────────────────────────────────────────
//  AUDIO
// ─────────────────────────────────────────────────────────────
function useAudio(enabled) {
  const ctxRef = useRef(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current)
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return ctxRef.current;
  }, []);

  // Single flat tone — for per-dot beeps
  const play = useCallback((freq, ms, volume = 0.12) => {
    if (!enabled) return;
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + ms / 1000);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start();
    setTimeout(() => { try { osc.stop(); } catch (_) { } }, ms + 80);
  }, [enabled, getCtx]);

  // Rising sweep + sustain — fired when all 6 keys are confirmed
  const playComplete = useCallback(() => {
    if (!enabled) return;
    const ctx = getCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    // Sweep from 400 Hz → 900 Hz over 180 ms, then hold briefly
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(900, now + 0.18);
    osc.frequency.setValueAtTime(900, now + 0.18);
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.04);   // fast attack
    gain.gain.setValueAtTime(0.22, now + 0.28);             // sustain
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55); // decay
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now);
    setTimeout(() => { try { osc.stop(); } catch (_) { } }, 620);
  }, [enabled, getCtx]);

  // Buzzy sawtooth drop — unmistakably different from the clean sine ping
  const playWrong = useCallback(() => {
    if (!enabled) return;
    const ctx = getCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.18); // pitch drop
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now);
    setTimeout(() => { try { osc.stop(); } catch (_) { } }, 280);
  }, [enabled, getCtx]);

  return useMemo(() => ({
    correct: () => play(720, 110),   // short clean sine ping
    wrong: () => playWrong(),      // buzzy sawtooth pitch-drop
    complete: () => playComplete(),   // rising sweep — all 6 pressed
    commit: () => play(520, 160),   // braille-input mode commit
    space: () => play(400, 100),
  }), [play, playWrong, playComplete]);
}

// ─────────────────────────────────────────────────────────────
//  BRAILLE CELL
// ─────────────────────────────────────────────────────────────
function BrailleCell({ token, pressedKeys = new Set(), size = 'md' }) {
  const isG2 = token.display.length > 1 || (token.dots && !brailleLetters[token.display.toLowerCase()]);
  const dotDim = size === 'lg' ? 20 : size === 'sm' ? 9 : 14;
  const colGap = size === 'lg' ? 14 : size === 'sm' ? 6 : 10;
  const rowGap = size === 'lg' ? 10 : size === 'sm' ? 5 : 8;
  const pad = size === 'lg' ? 16 : size === 'sm' ? 8 : 12;
  const labelSz = size === 'sm' ? 8 : 10;

  const dotStyle = (key) => {
    const filled = token.dots?.includes(key);
    const pressed = pressedKeys.has(key);
    if (filled && pressed) return { bg: T.green, shadow: `0 0 10px ${T.green}40` };
    if (!filled && pressed) return { bg: T.red, shadow: `0 0 8px  ${T.red}40` };
    if (filled) return { bg: T.violetLight, shadow: `0 0 8px  ${T.violetLight}50` };
    return { bg: T.bg3, shadow: 'none' };
  };

  return (
    <div style={{
      position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
      background: T.bg2, border: `1px solid ${T.bg3}`, borderRadius: 10,
      padding: `${pad}px ${pad}px ${pad - 4}px`, userSelect: 'none',
    }}>
      {isG2 && (
        <span style={{
          position: 'absolute', top: -8, right: -8, background: T.amber, color: '#000',
          fontSize: 8, fontWeight: 900, padding: '2px 5px', borderRadius: 99, textTransform: 'uppercase',
        }}>G2</span>
      )}
      <div style={{ display: 'flex', gap: colGap, marginBottom: 8 }}>
        {[['f', 'd', 's'], ['j', 'k', 'l']].map((col, ci) => (
          <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: rowGap }}>
            {col.map(k => {
              const { bg, shadow } = dotStyle(k);
              return <div key={k} style={{ width: dotDim, height: dotDim, borderRadius: '50%', background: bg, boxShadow: shadow, transition: 'all 0.15s' }} />;
            })}
          </div>
        ))}
      </div>
      <span style={{ color: T.text1, fontSize: labelSz, fontWeight: 900, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 2 }}>
        {token.display === ' ' ? 'SPC' : token.display}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  KEYPAD
// ─────────────────────────────────────────────────────────────
function KeyPad({ activeKeys = new Set(), wrongKeys = new Set() }) {
  const col = (keys) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {keys.map(k => {
        const active = activeKeys.has(k), wrong = wrongKeys.has(k);
        const bg = wrong ? T.red : active ? T.violet : T.bg2;
        const border = wrong ? T.redBorder : active ? '#5b21b6' : T.bg3;
        return (
          <div key={k} style={{
            width: 56, height: 56, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: bg, border: `1px solid ${border}`, borderBottomWidth: 3,
            borderRadius: 12, color: (active || wrong) ? '#fff' : T.text2,
            fontWeight: 900, transform: (active || wrong) ? 'scale(0.93)' : 'scale(1)',
            transition: 'all 0.15s',
            boxShadow: active ? `0 0 16px ${T.violet}50` : wrong ? `0 0 14px ${T.red}40` : 'none',
          }}>
            <span style={{ fontSize: 17 }}>{k.toUpperCase()}</span>
            <span style={{ fontSize: 9, opacity: 0.55, fontWeight: 400 }}>Dot {KEY_TO_DOT[k]}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'flex-start' }}>
      {col(['f', 'd', 's'])}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 16 }}>
        {[0, 1, 2].map(i => <div key={i} style={{ width: 1, height: 28, background: T.bg3, borderRadius: 2 }} />)}
      </div>
      {col(['j', 'k', 'l'])}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  G2 REFERENCE TABLE
// ─────────────────────────────────────────────────────────────
function G2ReferenceTable() {
  const [open, setOpen] = useState(false);
  const shown = grade2Contractions.slice(0, 40);
  return (
    <div style={{ marginTop: 12 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: T.bg2, border: `1px solid ${T.bg3}`, color: T.violetLight,
        padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit',
      }}>
        <span><FontAwesomeIcon icon={faBookOpen} style={{ marginRight: 8 }} />UEB Grade 2 Reference</span>
        <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} />
      </button>
      {open && (
        <div style={{ marginTop: 6, border: `1px solid ${T.bg3}`, borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: T.violet }}>
                {['Word / Group', 'Dots', 'Keys', 'Type'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 900, color: '#fff', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((c, i) => {
                const dotNums = c.dots.map(k => KEY_TO_DOT[k]).join('-');
                const keys = c.dots.map(k => k.toUpperCase()).join(' ');
                const [bg, color] = c.type === 'part' ? [T.blueDark, T.blue] : c.type === 'short' ? [T.amberDark, T.amber] : [T.bg3, T.text2];
                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? T.bg2 : T.bg1, borderBottom: `1px solid ${T.bg0}` }}>
                    <td style={{ padding: '9px 14px', fontWeight: 700, color: T.text0 }}>{c.text}</td>
                    <td style={{ padding: '9px 14px', fontFamily: 'monospace', color: T.text2 }}>{dotNums}</td>
                    <td style={{ padding: '9px 14px', fontFamily: 'monospace', fontWeight: 900, color: T.violetLight, letterSpacing: 3 }}>{keys}</td>
                    <td style={{ padding: '9px 14px' }}>
                      <span style={{ background: bg, color, fontSize: 9, padding: '2px 7px', borderRadius: 99, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.8 }}>{c.type}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  SHARED STYLES HELPERS
// ─────────────────────────────────────────────────────────────
const card = (extra = {}) => ({
  background: T.bg2, border: `1px solid ${T.bg3}`, borderRadius: 14, padding: 20, ...extra,
});
const label = { color: T.text2, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, display: 'block', marginBottom: 10 };
const textarea = {
  width: '100%', height: 88, padding: 12, boxSizing: 'border-box',
  background: T.bg1, border: `1px solid ${T.bg3}`, borderRadius: 10,
  color: T.text0, fontFamily: 'monospace', fontSize: 13, resize: 'none', outline: 'none',
};
const btn = (bg, disabled = false) => ({
  width: '100%', marginTop: 10, background: disabled ? T.bg3 : bg, color: disabled ? T.text2 : '#fff',
  border: 'none', borderRadius: 10, padding: '12px 0', fontSize: 13, fontWeight: 900,
  cursor: disabled ? 'not-allowed' : 'pointer', letterSpacing: 1, fontFamily: 'inherit',
  opacity: disabled ? 0.4 : 1,
});

// ─────────────────────────────────────────────────────────────
//  READING MODE
// ─────────────────────────────────────────────────────────────
function ReadingMode({ snd, inputText, setInputText }) {
  const [tokens, setTokens] = useState([]);
  const [pressedKeys, setPressedKeys] = useState(new Set());

  const convert = () => setTokens(textToTokens(inputText));

  useEffect(() => {
    const dn = (e) => { const k = e.key.toLowerCase(); if (ALLOWED_KEYS.includes(k)) setPressedKeys(p => new Set(p).add(k)); };
    const up = (e) => { const k = e.key.toLowerCase(); if (ALLOWED_KEYS.includes(k)) setTimeout(() => setPressedKeys(p => { const n = new Set(p); n.delete(k); return n; }), 200); };
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up); };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={card()}>
        <span style={label}>Enter text to convert</span>
        <textarea
          style={textarea}
          placeholder="e.g. the child and the people with knowledge..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), convert())}
        />
        <button style={btn(T.violet)} onClick={convert}>CONVERT TO BRAILLE ↵</button>
      </div>

      {tokens.length > 0 ? (
        <div style={{ background: T.bg1, border: `1px solid ${T.bg3}`, borderRadius: 14, padding: 16 }}>
          <p style={{ color: T.text2, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center', marginBottom: 14 }}>
            Press dot-keys freely · <span style={{ color: T.amber }}>G2</span> = Grade 2 contraction
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', minHeight: 80 }}>
            {tokens.map((t, i) =>
              t.display === ' '
                ? <div key={i} style={{ width: 16 }} />
                : <BrailleCell key={i} token={t} pressedKeys={pressedKeys} />
            )}
          </div>
        </div>
      ) : (
        <div style={{ color: T.text3, textAlign: 'center', padding: '40px 0', fontStyle: 'italic', fontSize: 13 }}>
          Nothing to display yet — enter text above
        </div>
      )}
      <G2ReferenceTable />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  TYPING MODE
// ─────────────────────────────────────────────────────────────
function TypingMode({ snd, inputText, setInputText }) {
  const [tokens, setTokens] = useState([]);
  const [started, setStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [wrongKeys, setWrongKeys] = useState(new Set());
  const [done, setDone] = useState(false);
  const [flash, setFlash] = useState(null); // 'correct' | 'wrong'

  const startTraining = () => {
    const toks = textToTokens(inputText).filter(t => t.dots);
    if (!toks.length) return;
    setTokens(toks); setCurrentIdx(0); setPressedKeys(new Set());
    setWrongKeys(new Set()); setDone(false); setStarted(true);
  };

  const currentToken = tokens[currentIdx];
  const requiredDots = useMemo(() => new Set(currentToken?.dots || []), [currentToken]);

  useEffect(() => {
    if (!started || done) return;
    const onKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (!ALLOWED_KEYS.includes(key) || pressedKeys.has(key)) return;
      e.preventDefault();
      const next = new Set(pressedKeys).add(key);
      setPressedKeys(next);
      if (requiredDots.has(key)) {
        snd.correct(); setFlash('correct');
      } else {
        snd.wrong(); setFlash('wrong'); setWrongKeys(w => new Set(w).add(key));
      }
      setTimeout(() => setFlash(null), 250);
      if (next.size === 6) {
        snd.complete();
        setTimeout(() => {
          setPressedKeys(new Set()); setWrongKeys(new Set());
          if (currentIdx + 1 >= tokens.length) setDone(true);
          else setCurrentIdx(i => i + 1);
        }, 600);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [started, done, pressedKeys, requiredDots, currentIdx, tokens, snd]);

  if (!started) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={card()}>
        <span style={label}>Enter practice text</span>
        <textarea style={textarea} placeholder="e.g. the child and the people with knowledge..." value={inputText} onChange={e => setInputText(e.target.value)} />
        <button style={btn('#059669', !inputText.trim())} onClick={startTraining} disabled={!inputText.trim()}>
          <FontAwesomeIcon icon={faRocket} style={{ marginRight: 8 }} />START TRAINING
        </button>
      </div>
      <G2ReferenceTable />
    </div>
  );

  if (done) {
    return (
      <div style={{ ...card({ padding: 36, textAlign: 'center' }) }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}><FontAwesomeIcon icon={faTrophy} style={{ color: T.amber }} /></div>
        <h3 style={{ color: T.text0, fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Training Complete!</h3>
        <p style={{ color: T.text2, fontSize: 13, marginBottom: 24 }}>You explored all {tokens.length} characters.</p>
        <button onClick={() => setStarted(false)} style={{ background: T.violet, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 32px', fontSize: 13, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' }}>
          Practice Again
        </button>
      </div>
    );
  }

  const dotNums = currentToken.dots.map(k => KEY_TO_DOT[k]).join('-');
  const cardBorder = flash === 'correct' ? T.green : flash === 'wrong' ? T.red : T.bg3;
  const cardGlow = flash === 'correct' ? `0 0 28px ${T.green}30` : flash === 'wrong' ? `0 0 28px ${T.red}30` : 'none';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, height: 4, background: T.bg2, borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(currentIdx / tokens.length) * 100}%`, background: T.violet, borderRadius: 99, transition: 'width 0.4s ease' }} />
        </div>
        <span style={{ color: T.text2, fontSize: 11, fontWeight: 900 }}>{currentIdx}/{tokens.length}</span>
      </div>

      {/* Challenge card */}
      <div style={{ background: T.bg2, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '28px 20px', textAlign: 'center', transition: 'border-color 0.2s, box-shadow 0.2s', boxShadow: cardGlow }}>
        {currentToken.display.length > 1 && (
          <span style={{ background: T.amberDark, color: T.amber, fontSize: 9, padding: '3px 10px', borderRadius: 99, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, display: 'inline-block', marginBottom: 12 }}>
            Grade 2 Contraction
          </span>
        )}
        <div style={{ color: T.violetLight, fontFamily: 'monospace', fontSize: 72, fontWeight: 900, lineHeight: 1, letterSpacing: '0.08em', marginBottom: 10 }}>
          {currentToken.display.toUpperCase()}
        </div>
        <p style={{ color: T.text2, fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
          Dots: <span style={{ color: T.violetLight, fontWeight: 900 }}>{dotNums}</span>
        </p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <BrailleCell token={currentToken} pressedKeys={pressedKeys} size="lg" />
        </div>
      </div>

      {/* Keypad */}
      <div style={card()}>
        <p style={{ color: T.text3, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center', marginBottom: 14 }}>
          Press all 6 keys · <span style={{ color: T.green }}>green = correct</span> · <span style={{ color: T.red }}>red = not needed</span>
        </p>
        <KeyPad activeKeys={pressedKeys} wrongKeys={wrongKeys} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  BRAILLE INPUT MODE
// ─────────────────────────────────────────────────────────────
function BrailleInputMode({ snd }) {
  const [active, setActive] = useState(false);
  const [currentChord, setCurrentChord] = useState(new Set());
  // Single source of truth: array of committed token strings e.g. ['t','h','the',' ','a']
  const [tokens, setTokens] = useState([]);

  const typedText = tokens.join('');

  const chordKey = [...currentChord].sort().join('');
  const chordLetter = dotsToLetter[chordKey];
  const chordWord = chordToContraction[chordKey];
  const chordDots = [...currentChord].sort().map(k => KEY_TO_DOT[k]).join(' · ');

  const commitChord = useCallback(() => {
    if (currentChord.size === 0) return;
    const key = [...currentChord].sort().join('');
    const result = chordToContraction[key] || dotsToLetter[key];
    setCurrentChord(new Set());
    if (result) { setTokens(t => [...t, result]); snd.commit(); }
    else snd.wrong();
    return !!result;
  }, [currentChord, snd]);

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (ALLOWED_KEYS.includes(key)) { e.preventDefault(); setCurrentChord(p => new Set(p).add(key)); return; }
      if (e.key === 'Enter') { e.preventDefault(); commitChord(); return; }
      if (e.key === ' ') { e.preventDefault(); setCurrentChord(new Set()); setTokens(t => [...t, ' ']); snd.space(); return; }
      if (e.key === 'Backspace') {
        e.preventDefault();
        setTokens(t => { if (!t.length) return t; snd.wrong(); return t.slice(0, -1); });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, commitChord, snd]);

  const [pBg, pBorder, pColor] =
    chordWord ? [T.amberDark, T.amberBorder, T.amber] :
      chordLetter ? [T.greenDark, T.greenBorder, T.green] :
        currentChord.size ? [T.redDark, T.redBorder, T.red] :
          [T.bg2, T.bg3, T.text2];

  const pText = chordWord ? `→ "${chordWord}" (Grade 2)` : chordLetter ? `→ "${chordLetter}"` : currentChord.size ? '→ unknown pattern' : 'Hold dot-keys, then press Enter ↵';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Preview */}
      <div style={{ background: pBg, border: `1px solid ${pBorder}`, color: pColor, borderRadius: 10, padding: '12px 16px', textAlign: 'center', transition: 'all 0.2s' }}>
        <div style={{ fontSize: 9, fontWeight: 700, opacity: 0.65, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>
          {currentChord.size > 0 ? `Active dots: ${chordDots}` : 'Chord Preview'}
        </div>
        <div style={{ fontSize: 14, fontWeight: 900 }}>{pText}</div>
      </div>

      {/* Terminal output */}
      <div style={{
        background: T.bg0, border: `2px solid ${T.bg3}`, borderRadius: 12, padding: '18px 20px',
        minHeight: 96, fontFamily: 'monospace', fontSize: 22, color: T.violetLight,
        display: 'flex', alignItems: 'center', overflowWrap: 'break-word', wordBreak: 'break-all',
      }}>
        {typedText
          ? <span>{typedText}<span style={{ display: 'inline-block', width: 2, height: 26, background: T.violetLight, marginLeft: 4, verticalAlign: 'middle', animation: 'brl-blink 1s step-end infinite' }} /></span>
          : <span style={{ color: T.text3, fontSize: 14, fontStyle: 'italic' }}>Start typing in Braille...</span>
        }
      </div>

      {/* Keypad */}
      <div style={card()}><KeyPad activeKeys={currentChord} /></div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => { setActive(true); setTokens([]); setCurrentChord(new Set()); }}
          style={{ flex: 1, background: '#059669', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 0', fontSize: 13, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' }}>
          {active ? '↺ Restart' : '▶ Start Typing'}
        </button>
        <button onClick={() => { setTokens([]); setCurrentChord(new Set()); }}
          style={{ flex: 1, background: T.bg2, color: T.text1, border: `1px solid ${T.bg3}`, borderRadius: 10, padding: '11px 0', fontSize: 13, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' }}>
          <FontAwesomeIcon icon={faTrashCan} style={{ marginRight: 6 }} />Clear
        </button>
      </div>

      {/* Tips */}
      <div style={{ background: T.bg1, border: `1px solid ${T.blueDark}`, color: T.blue, borderRadius: 10, padding: '14px 16px', fontSize: 12, fontWeight: 700, lineHeight: 1.9 }}>
        <div>• Hold dot-keys (F D S / J K L) to build a chord</div>
        <div>• <kbd style={{ background: T.bg3, border: `1px solid ${T.bg4}`, borderRadius: 4, padding: '1px 6px', fontFamily: 'monospace', color: T.text0 }}>Enter ↵</kbd> commits the letter or Grade 2 word</div>
        <div>• <kbd style={{ background: T.bg3, border: `1px solid ${T.bg4}`, borderRadius: 4, padding: '1px 6px', fontFamily: 'monospace', color: T.text0 }}>Space</kbd> word gap · <kbd style={{ background: T.bg3, border: `1px solid ${T.bg4}`, borderRadius: 4, padding: '1px 6px', fontFamily: 'monospace', color: T.text0 }}>Backspace</kbd> undo token</div>
      </div>

      <G2ReferenceTable />
      <style>{`@keyframes brl-blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  LEFT PANEL — LeetCode problem description
// ─────────────────────────────────────────────────────────────
function ProblemPanel({ mode, tokens }) {
  const meta = {
    reading: { num: '001', title: 'Braille Reading', diff: 'Easy', dc: T.green, db: T.greenDark, desc: 'This module helps you to learn braille reading. It provides a way to convert English text into UEB Grade 2 dot patterns. Study each cell and understand which dot combinations encode letters and contractions.', topics: ['Grade 2', 'Dot Patterns', 'Contractions'] },
    typing: { num: '002', title: 'Braille Chord Trainer', diff: 'Medium', dc: T.amber, db: T.amberDark, desc: 'This module helps you to learn braille typing. It provides a way to convert English text into UEB Grade 2 dot patterns. Study each cell and understand which dot combinations encode letters and contractions.', topics: ['Chord Input', 'Muscle Memory', 'Timing'] },
    'braille-input': { num: '003', title: 'Free Braille Writer', diff: 'Hard', dc: T.red, db: T.redDark, desc: 'Compose text freely using braille chords. Hold dot-keys then press Enter to commit. Grade 2 contractions automatically output full words.', topics: ['Free Writing', 'Grade 2', 'Real-time Decode'] },
  }[mode];

  return (
    <div style={{ color: T.text1, fontFamily: 'inherit', height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '24px 24px 18px', borderBottom: `1px solid ${T.bg3}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ color: T.text2, fontSize: 11 }}>#{meta.num}</span>
          <span style={{ background: meta.db, color: meta.dc, fontSize: 10, padding: '2px 10px', borderRadius: 99, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>{meta.diff}</span>
        </div>
        <h1 style={{ color: T.text0, fontSize: 19, fontWeight: 900, fontFamily: 'Georgia, serif', letterSpacing: '-0.02em', lineHeight: 1.3 }}>{meta.title}</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
          {meta.topics.map(t => (
            <span key={t} style={{ background: T.bg3, color: T.text2, fontSize: 9, padding: '4px 10px', borderRadius: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 24px', fontSize: 13, lineHeight: 1.75, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <p style={{ color: T.text1 }}>{meta.desc}</p>

        {/* Dot layout */}
        <div style={{ background: T.bg2, border: `1px solid ${T.bg3}`, borderRadius: 12, padding: 18 }}>
          <p style={{ color: T.text2, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14 }}>Keyboard → Dot Mapping</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, maxWidth: 230, margin: '0 auto' }}>
            {[{ k: 'F', d: 1 }, { k: 'J', d: 4 }, { k: 'D', d: 2 }, { k: 'K', d: 5 }, { k: 'S', d: 3 }, { k: 'L', d: 6 }].map(({ k, d }) => (
              <div key={k} style={{ background: T.bg1, border: `1px solid ${T.bg3}`, borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ color: T.violetLight, fontSize: 15, fontWeight: 900 }}>{k}</span>
                <span style={{ color: T.text2, fontSize: 10 }}>Dot {d}</span>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: T.violetLight, boxShadow: `0 0 6px ${T.violetLight}80`, flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Token preview */}
        {tokens.filter(t => t.display !== ' ').length > 0 && (
          <div style={{ background: T.bg2, border: `1px solid ${T.bg3}`, borderRadius: 12, padding: 16 }}>
            <p style={{ color: T.text2, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Parsed Tokens</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {tokens.filter(t => t.display !== ' ').slice(0, 14).map((t, i) => <BrailleCell key={i} token={t} size="sm" />)}
              {tokens.filter(t => t.display !== ' ').length > 14 && (
                <span style={{ color: T.text2, fontSize: 11, alignSelf: 'center' }}>+{tokens.filter(t => t.display !== ' ').length - 14} more</span>
              )}
            </div>
          </div>
        )}

        {/* Constraints */}
        <div>
          <p style={{ color: T.text0, fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Constraints</p>
          {[
            ['Keys', <><code style={{ background: T.bg3, color: T.violetLight, padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace' }}>F D S J K L</code> → Dots 1–6</>],
            ['Grade 2', 'Contractions auto-detected from UEB standard'],
            ['Chord', 'All 6 keys pressed as one simultaneous gesture'],
          ].map(([lbl, desc]) => (
            <div key={lbl} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: `1px solid ${T.bg3}` }}>
              <span style={{ color: T.text2, fontSize: 11, fontWeight: 900, minWidth: 58, flexShrink: 0 }}>{lbl}</span>
              <span style={{ color: T.text1, fontSize: 12 }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  ROOT
// ─────────────────────────────────────────────────────────────
const MODES = [
  { id: 'reading', icon: faEye, label: 'Reading' },
  { id: 'typing', icon: faKeyboard, label: 'Typing' },
  { id: 'braille-input', icon: faPenToSquare, label: 'Input' },
];

export default function BrailleTrainer() {
  const [mode, setMode] = useState('reading');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [inputText, setInputText] = useState('');
  const snd = useAudio(soundEnabled);
  const tokens = useMemo(() => inputText ? textToTokens(inputText) : [], [inputText]);

  return (
    <div style={{ background: T.bg0, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace" }}>

      {/* TOP BAR */}
      <div style={{ background: T.bg1, borderBottom: `1px solid ${T.bg3}`, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0, gap: 12 }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ background: T.violet, width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FontAwesomeIcon icon={faBolt} style={{ color: '#fff', fontSize: 13 }} />
          </div>
          <span style={{ color: T.text0, fontWeight: 900, fontSize: 14 }}>BrailleTrainer</span>
          <span style={{ color: T.bg4, fontSize: 13 }}>·</span>
          <span style={{ color: T.text2, fontSize: 10 }}>UEB Grade 2</span>
        </div>

        {/* Mode tabs */}
        <div style={{ background: T.bg2, border: `1px solid ${T.bg3}`, borderRadius: 10, padding: 3, display: 'flex', gap: 2 }}>
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} style={{
              background: mode === m.id ? T.violet : 'transparent',
              color: mode === m.id ? '#fff' : T.text2,
              border: 'none', borderRadius: 7, padding: '5px 13px',
              fontSize: 12, fontWeight: 900, cursor: 'pointer',
              transition: 'all 0.15s', fontFamily: 'inherit',
            }}>
              <FontAwesomeIcon icon={m.icon} style={{ marginRight: 6 }} />{m.label}
            </button>
          ))}
        </div>

        {/* Sound toggle */}
        <button onClick={() => setSoundEnabled(s => !s)} style={{
          background: soundEnabled ? '#1e1b4b' : T.bg2,
          border: `1px solid ${soundEnabled ? '#4c1d95' : T.bg3}`,
          color: soundEnabled ? T.violetLight : T.text2,
          borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
        }}>
          <FontAwesomeIcon icon={soundEnabled ? faVolumeHigh : faVolumeXmark} style={{ marginRight: 5 }} />
          {soundEnabled ? 'Sound On' : 'Sound Off'}
        </button>
      </div>

      {/* SPLIT BODY */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {/* LEFT — problem panel */}
        <div style={{ width: '38%', maxWidth: 420, minWidth: 280, borderRight: `1px solid ${T.bg3}`, background: T.bg1, overflowY: 'auto', flexShrink: 0 }}>
          <ProblemPanel mode={mode} tokens={tokens} />
        </div>

        {/* Divider */}
        <div style={{ width: 3, background: T.bg3, flexShrink: 0 }} />

        {/* RIGHT — practice */}
        <div style={{ flex: 1, background: T.bg0, overflowY: 'auto' }}>
          <div style={{ padding: 24, maxWidth: 580, margin: '0 auto' }}>
            {mode === 'reading' && <ReadingMode snd={snd} inputText={inputText} setInputText={setInputText} />}
            {mode === 'typing' && <TypingMode snd={snd} inputText={inputText} setInputText={setInputText} />}
            {mode === 'braille-input' && <BrailleInputMode snd={snd} />}
          </div>
        </div>
      </div>

      {/* STATUS BAR */}
      <div style={{ background: T.violet, height: 22, fontSize: 10, color: 'rgba(255,255,255,0.65)', padding: '0 16px', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0, fontWeight: 700 }}>
        <span>⬡ UEB Grade 2 Braille</span>
        <span style={{ opacity: 0.35 }}>│</span>
        <span>F D S = Dots 1-2-3</span>
        <span style={{ opacity: 0.35 }}>│</span>
        <span>J K L = Dots 4-5-6</span>
        <span style={{ marginLeft: 'auto' }}>Unified English Braille Standard</span>
      </div>
    </div>
  );
}