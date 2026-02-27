import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  textToTokens,
  dotsToLetter,
  chordToContraction,
  brailleLetters,
  grade2Contractions,
} from '../../utils/BrailleEngine';

// ─────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────
const ALLOWED_KEYS = ['f', 'd', 's', 'j', 'k', 'l'];
const KEY_TO_DOT   = { f: 1, d: 2, s: 3, j: 4, k: 5, l: 6 };

// ─────────────────────────────────────────────────────────────
//  AUDIO HOOK
// ─────────────────────────────────────────────────────────────
function useAudio(enabled) {
  const ctxRef = useRef(null);

  const play = useCallback((freq, ms) => {
    if (!enabled) return;
    if (!ctxRef.current)
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    
    const osc  = ctxRef.current.createOscillator();
    const gain = ctxRef.current.createGain();
    
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctxRef.current.destination);
    
    osc.start();
    
    // Fixed empty catch block with a warning log for better debugging
    setTimeout(() => { 
      try { 
        osc.stop(); 
      } catch (error) {
        console.warn("WebAudio Oscillator stop failed:", error);
      } 
    }, ms);
  }, [enabled]);

  return useMemo(() => ({
    correct : () => play(700, 100),
    wrong   : () => play(200, 300),
    commit  : () => play(520, 160),
    space   : () => play(400, 100),
  }), [play]);
}

// ─────────────────────────────────────────────────────────────
//  BRAILLE DOT-CELL CARD
// ─────────────────────────────────────────────────────────────
function BrailleCell({ token, pressedKeys = new Set() }) {
  const isG2 =
    token.display.length > 1 ||
    (token.dots && !brailleLetters[token.display.toLowerCase()]);

  const leftKeys  = ['f', 'd', 's'];
  const rightKeys = ['j', 'k', 'l'];

  const dotClass = (key) => {
    const filled  = token.dots?.includes(key);
    const pressed = pressedKeys.has(key);
    if (filled && pressed)  return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]';
    if (!filled && pressed) return 'bg-red-400';
    if (filled)             return 'bg-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.35)]';
    return 'bg-gray-200';
  };

  return (
    <div className="relative flex flex-col items-center bg-white p-3 pt-4 rounded-2xl shadow-sm border border-gray-100 min-w-[72px] select-none">
      {isG2 && (
        <span className="absolute -top-2.5 -right-2 text-[9px] font-black bg-amber-400 text-white px-1.5 py-0.5 rounded-full uppercase tracking-tight shadow-sm">
          G2
        </span>
      )}
      <div className="flex gap-3 mb-2.5">
        <div className="flex flex-col gap-2">
          {leftKeys.map(k => (
            <div key={k} className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${dotClass(k)}`} />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {rightKeys.map(k => (
            <div key={k} className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${dotClass(k)}`} />
          ))}
        </div>
      </div>
      <span className="text-xs font-black font-mono text-gray-700 uppercase tracking-widest">
        {token.display === ' ' ? 'SPC' : token.display}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  KEY PAD VISUAL
// ─────────────────────────────────────────────────────────────
function KeyPad({ activeKeys = new Set(), wrongKeys = new Set() }) {
  const col = (keys) => (
    <div className="flex flex-col gap-2">
      {keys.map(k => {
        const isActive = activeKeys.has(k);
        const isWrong  = wrongKeys.has(k);
        return (
          <div
            key={k}
            className={`w-14 h-14 flex flex-col items-center justify-center rounded-2xl border-b-4 font-black text-base transition-all duration-150
              ${isWrong  ? 'bg-red-500   border-red-700   text-white scale-95' :
                isActive ? 'bg-purple-600 border-purple-800 text-white scale-95' :
                           'bg-white      border-gray-200   text-gray-400'}`}
          >
            <span className="text-lg">{k.toUpperCase()}</span>
            <span className="text-[9px] opacity-60 font-normal">Dot {KEY_TO_DOT[k]}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex gap-4 justify-center items-start">
      {col(['f', 'd', 's'])}
      <div className="flex flex-col gap-2 items-center justify-center h-full pt-4">
        {[0,1,2].map(i => <div key={i} className="w-0.5 h-8 bg-gray-200 rounded" />)}
      </div>
      {col(['j', 'k', 'l'])}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  GRADE 2 REFERENCE TABLE
// ─────────────────────────────────────────────────────────────
function G2ReferenceTable() {
  const [open, setOpen] = useState(false);
  const shown = grade2Contractions.slice(0, 40);

  return (
    <div className="mt-6">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3 bg-purple-50 hover:bg-purple-100 border border-purple-100 rounded-2xl text-sm font-black text-purple-700 transition-all"
      >
        <span>📖 UEB Grade 2 Reference</span>
        <span className="text-lg">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-3 overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-purple-600 text-white">
                <th className="px-4 py-3 text-left font-black">Word / Group</th>
                <th className="px-4 py-3 text-left font-black">Dots</th>
                <th className="px-4 py-3 text-left font-black">Keys</th>
                <th className="px-4 py-3 text-left font-black">Type</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((c, i) => {
                const dotNums = c.dots.map(k => KEY_TO_DOT[k]).join('-');
                const keys    = c.dots.map(k => k.toUpperCase()).join(' ');
                return (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 font-bold text-gray-800">{c.text}</td>
                    <td className="px-4 py-2.5 text-gray-500 font-mono text-xs">{dotNums}</td>
                    <td className="px-4 py-2.5 font-mono font-black text-purple-600 text-xs tracking-widest">{keys}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase
                        ${c.type === 'part'  ? 'bg-blue-50 text-blue-600' :
                          c.type === 'short' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                        {c.type}
                      </span>
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
//  MODE: READING
// ─────────────────────────────────────────────────────────────
function ReadingMode({ snd }) {
  const [inputText, setInputText]   = useState('');
  const [tokens, setTokens]         = useState([]);
  const [pressedKeys, setPressedKeys] = useState(new Set());

  const convert = () => setTokens(textToTokens(inputText));

  useEffect(() => {
    const down = (e) => {
      const k = e.key.toLowerCase();
      if (ALLOWED_KEYS.includes(k)) setPressedKeys(p => new Set(p).add(k));
    };
    const up = (e) => {
      const k = e.key.toLowerCase();
      if (ALLOWED_KEYS.includes(k))
        setTimeout(() => setPressedKeys(p => { const n = new Set(p); n.delete(k); return n; }), 200);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup',   up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
          Enter text to convert
        </label>
        <textarea
          className="w-full h-28 p-4 border border-gray-100 rounded-2xl text-base focus:ring-2 focus:ring-purple-200 outline-none resize-none placeholder:text-gray-300 font-medium bg-gray-50"
          placeholder="e.g. the child and the people with knowledge..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), convert())}
        />
        <button
          onClick={convert}
          className="w-full mt-4 bg-purple-600 text-white py-4 rounded-2xl font-black text-base hover:bg-purple-700 transition-all hover:shadow-lg active:scale-[0.98]"
        >
          CONVERT TO BRAILLE ↵
        </button>
      </div>

      {tokens.length > 0 ? (
        <>
          <p className="text-xs text-gray-400 text-center font-bold uppercase tracking-widest">
            Press dot-keys freely to feel each pattern · <span className="text-amber-500">G2</span> = Grade 2 contraction
          </p>
          <div className="flex flex-wrap gap-3 justify-center p-6 bg-gray-50 rounded-3xl border border-gray-100 min-h-[100px]">
            {tokens.map((t, i) =>
              t.display === ' '
                ? <div key={i} className="w-6" />
                : <BrailleCell key={i} token={t} pressedKeys={pressedKeys} />
            )}
          </div>
          <G2ReferenceTable />
        </>
      ) : (
        <div className="text-center py-16 text-gray-300 font-bold italic">Nothing to display yet.</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MODE: TYPING
// ─────────────────────────────────────────────────────────────
function TypingMode({ snd }) {
  const [inputText, setInputText] = useState('');
  const [tokens, setTokens]       = useState([]);
  const [started, setStarted]     = useState(false);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [wrongKeys, setWrongKeys]     = useState(new Set());
  const [stats, setStats]             = useState({ correct: 0, wrong: 0, completed: 0 });
  const [done, setDone]               = useState(false);

  const startTraining = () => {
    const toks = textToTokens(inputText).filter(t => t.dots);
    if (!toks.length) return;
    setTokens(toks);
    setCurrentIdx(0);
    setPressedKeys(new Set());
    setWrongKeys(new Set());
    setStats({ correct: 0, wrong: 0, completed: 0 });
    setDone(false);
    setStarted(true);
  };

  const currentToken = tokens[currentIdx];
  const requiredDots = useMemo(() => new Set(currentToken?.dots || []), [currentToken]);

  useEffect(() => {
    if (!started || done) return;

    const onKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (!ALLOWED_KEYS.includes(key) || pressedKeys.has(key)) return;
      e.preventDefault();

      const nextPressed = new Set(pressedKeys).add(key);
      setPressedKeys(nextPressed);

      if (requiredDots.has(key)) {
        snd.correct();
        setStats(s => ({ ...s, correct: s.correct + 1 }));
      } else {
        snd.wrong();
        setWrongKeys(w => new Set(w).add(key));
        setStats(s => ({ ...s, wrong: s.wrong + 1 }));
      }

      if (nextPressed.size === 6) {
        setStats(s => ({ ...s, completed: s.completed + 1 }));
        setTimeout(() => {
          setPressedKeys(new Set());
          setWrongKeys(new Set());
          if (currentIdx + 1 >= tokens.length) {
            setDone(true);
          } else {
            setCurrentIdx(i => i + 1);
          }
        }, 450);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [started, done, pressedKeys, requiredDots, currentIdx, tokens, snd]);

  if (!started) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
            Enter practice text
          </label>
          <textarea
            className="w-full h-28 p-4 border border-gray-100 rounded-2xl text-base focus:ring-2 focus:ring-purple-200 outline-none resize-none placeholder:text-gray-300 font-medium bg-gray-50"
            placeholder="e.g. the child and the people with knowledge..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
          />
          <button
            onClick={startTraining}
            disabled={!inputText.trim()}
            className="w-full mt-4 bg-green-600 text-white py-4 rounded-2xl font-black text-base hover:bg-green-700 transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            🚀 START TRAINING
          </button>
        </div>
        <G2ReferenceTable />
      </div>
    );
  }

  if (done) {
    const accuracy = stats.correct + stats.wrong > 0
      ? Math.round((stats.correct / (stats.correct + stats.wrong)) * 100)
      : 100;
    return (
      <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm text-center space-y-6">
        <div className="text-6xl">🎉</div>
        <h3 className="text-2xl font-black text-gray-800">Training Complete!</h3>
        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
          <div className="bg-purple-50 rounded-2xl p-4">
            <div className="text-3xl font-black text-purple-600">{stats.completed}</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">Completed</div>
          </div>
          <div className="bg-green-50 rounded-2xl p-4">
            <div className="text-3xl font-black text-green-600">{stats.correct}</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">Correct</div>
          </div>
          <div className="bg-red-50 rounded-2xl p-4">
            <div className="text-3xl font-black text-red-500">{stats.wrong}</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">Wrong</div>
          </div>
        </div>
        <div className="text-4xl font-black text-purple-700">{accuracy}%</div>
        <p className="text-sm text-gray-400 font-bold">Accuracy</p>
        <button
          onClick={() => setStarted(false)}
          className="mt-4 bg-purple-600 text-white px-10 py-3 rounded-2xl font-black hover:bg-purple-700 transition-all"
        >
          Practice Again
        </button>
      </div>
    );
  }

  const dotNums = currentToken.dots.map(k => KEY_TO_DOT[k]).join('-');

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-600 rounded-full transition-all duration-500"
            style={{ width: `${(currentIdx / tokens.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-black text-gray-400">{currentIdx}/{tokens.length}</span>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 bg-green-50 rounded-2xl p-3 text-center">
          <div className="text-xl font-black text-green-600">{stats.correct}</div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Correct</div>
        </div>
        <div className="flex-1 bg-red-50 rounded-2xl p-3 text-center">
          <div className="text-xl font-black text-red-500">{stats.wrong}</div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Wrong</div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center space-y-4">
        {currentToken.display.length > 1 && (
          <span className="inline-block text-xs font-black bg-amber-100 text-amber-600 px-3 py-1 rounded-full uppercase tracking-tight">
            Grade 2 Contraction
          </span>
        )}
        <div className="text-7xl font-black text-purple-700 tracking-widest">
          {currentToken.display.toUpperCase()}
        </div>
        <p className="text-sm text-gray-400 font-bold">
          Dots required: <span className="text-purple-600 font-black">{dotNums}</span>
        </p>
        <div className="flex justify-center">
          <BrailleCell token={currentToken} pressedKeys={pressedKeys} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center mb-4">
          Press all 6 keys — green = correct · red = not needed
        </p>
        <KeyPad activeKeys={pressedKeys} wrongKeys={wrongKeys} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MODE: BRAILLE INPUT
// ─────────────────────────────────────────────────────────────
function BrailleInputMode({ snd }) {
  const [active, setActive]           = useState(false);
  const [currentChord, setCurrentChord] = useState(new Set());
  const [typedText, setTypedText]     = useState('');
  const [tokenHistory, setTokenHistory] = useState([]);

  const chordKey    = [...currentChord].sort().join('');
  const chordLetter = dotsToLetter[chordKey];
  const chordWord   = chordToContraction[chordKey];
  const chordDots   = [...currentChord].sort().map(k => KEY_TO_DOT[k]).join(' · ');

  const commitChord = useCallback(() => {
    if (currentChord.size === 0) return;
    const key    = [...currentChord].sort().join('');
    const result = chordToContraction[key] || dotsToLetter[key];
    setCurrentChord(new Set());

    if (result) {
      setTypedText(t => t + result);
      setTokenHistory(h => [...h, { text: result, chars: result.length }]);
      snd.commit();
    } else {
      snd.wrong();
    }
    return !!result;
  }, [currentChord, snd]);

  useEffect(() => {
    if (!active) return;

    const onKeyDown = (e) => {
      const key = e.key.toLowerCase();

      if (ALLOWED_KEYS.includes(key)) {
        e.preventDefault();
        setCurrentChord(p => new Set(p).add(key));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        commitChord();
        return;
      }
      if (e.key === ' ') {
        e.preventDefault();
        setCurrentChord(new Set());
        setTypedText(t => t + ' ');
        setTokenHistory(h => [...h, { text: ' ', chars: 1 }]);
        snd.space();
        return;
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        setTokenHistory(h => {
          if (!h.length) return h;
          const last = h[h.length - 1];
          setTypedText(t => t.slice(0, -last.chars));
          snd.wrong();
          return h.slice(0, -1);
        });
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, commitChord, snd]);

  const chordMatchStyle =
    chordWord   ? 'bg-amber-50 border-amber-300 text-amber-700' :
    chordLetter ? 'bg-green-50 border-green-300 text-green-700' :
    currentChord.size > 0 ? 'bg-red-50 border-red-200 text-red-500' :
    'bg-gray-50 border-gray-100 text-gray-400';

  const chordMatchText =
    chordWord   ? `→ "${chordWord}" (Grade 2)` :
    chordLetter ? `→ "${chordLetter}"` :
    currentChord.size > 0 ? '→ unknown pattern' :
    'Hold dot-keys, then press Enter ↵';

  return (
    <div className="space-y-5">
      <div className={`rounded-2xl border-2 px-5 py-4 text-center font-black text-sm transition-all ${chordMatchStyle}`}>
        <div className="text-xs font-bold opacity-60 uppercase tracking-widest mb-1">
          {currentChord.size > 0 ? `Active dots: ${chordDots}` : 'Chord Preview'}
        </div>
        <div className="text-base">{chordMatchText}</div>
      </div>

      <div className="min-h-[110px] p-6 bg-gray-900 text-purple-300 rounded-2xl font-mono text-2xl flex items-center border-[5px] border-gray-800 shadow-inner break-all">
        {typedText
          ? <span>{typedText}<span className="ml-1 inline-block w-1.5 h-8 bg-purple-400 animate-pulse align-middle" /></span>
          : <span className="opacity-20 italic text-lg">Start typing in Braille...</span>
        }
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <KeyPad activeKeys={currentChord} />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => { setActive(true); setTypedText(''); setTokenHistory([]); setCurrentChord(new Set()); }}
          className="flex-1 bg-green-600 text-white py-3 rounded-2xl font-black hover:bg-green-700 transition-all hover:shadow-lg active:scale-[0.98]"
        >
          {active ? '↺ Restart' : '▶ Start Typing'}
        </button>
        <button
          onClick={() => { setTypedText(''); setTokenHistory([]); setCurrentChord(new Set()); }}
          className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl font-black hover:bg-red-50 hover:text-red-500 transition-all"
        >
          🗑 Clear
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-700 font-bold space-y-1">
        <p>• Hold dot-keys (F D S / J K L) to build a chord</p>
        <p>• <kbd className="bg-white border border-blue-200 rounded px-1.5 py-0.5">Enter ↵</kbd> commits the letter or Grade 2 word</p>
        <p>• <kbd className="bg-white border border-blue-200 rounded px-1.5 py-0.5">Space</kbd> adds a word gap · <kbd className="bg-white border border-blue-200 rounded px-1.5 py-0.5">Backspace</kbd> deletes last token</p>
        <p>• Grade 2 chords (e.g. F+D+S+J+L = "and") output the full word</p>
      </div>
      <G2ReferenceTable />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
const MODES = [
  { id: 'reading',       emoji: '👁',  label: 'Reading' },
  { id: 'typing',        emoji: '⌨',  label: 'Typing'  },
  { id: 'braille-input', emoji: '✍',  label: 'Input'   },
];

export default function BrailleTrainer() {
  const [mode, setMode]           = useState('reading');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const snd = useAudio(soundEnabled);

  const switchMode = (m) => setMode(m);

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 min-h-screen font-sans selection:bg-purple-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Braille Trainer</h1>
          <p className="text-sm text-gray-400 font-medium">UEB Grade 2 · Unified English Braille</p>
        </div>
        <button
          onClick={() => setSoundEnabled(s => !s)}
          className={`self-start sm:self-auto px-4 py-2 rounded-xl border-2 text-sm font-black transition-all
            ${soundEnabled ? 'border-purple-200 text-purple-600 bg-purple-50' : 'border-gray-200 text-gray-400 bg-white'}`}
        >
          {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
        </button>
      </div>

      <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => switchMode(m.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition-all
              ${mode === m.id ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
          >
            <span>{m.emoji}</span>
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        ))}
      </div>

      {mode === 'reading'       && <ReadingMode      snd={snd} />}
      {mode === 'typing'        && <TypingMode        snd={snd} />}
      {mode === 'braille-input' && <BrailleInputMode snd={snd} />}
    </div>
  );
}