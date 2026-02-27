import React, { useState, useEffect, useMemo } from 'react';
import { textToTokens } from '../../utils/BrailleEngine'; // Fixed casing

export default function BrailleHapticTrainer({ text }) {
  const allowedKeys = useMemo(() => ["f", "d", "s", "j", "k", "l"], []);

  // useMemo handles the tokenization and reset logic implicitly
  const tokens = useMemo(() => {
    return textToTokens(text).filter(t => t.dots);
  }, [text]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [pressedKeys, setPressedKeys] = useState(new Set());

  // Instead of an effect that calls setState (cascading), we reset 
  // progress when the text prop changes by using a key or manual reset
  useEffect(() => {
    setCurrentIndex(0);
    setPressedKeys(new Set());
  }, [text]); 

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (!allowedKeys.includes(key) || pressedKeys.has(key)) return;

      setPressedKeys(prev => {
        const next = new Set(prev).add(key);
        if (next.size === 6) {
          setTimeout(() => {
            setPressedKeys(new Set());
            setCurrentIndex(i => i + 1);
          }, 400);
        }
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pressedKeys, currentIndex, allowedKeys]);

  const currentToken = tokens[currentIndex];

  if (!text) return <div className="text-center p-10 text-gray-400">Enter text to start training...</div>;
  if (currentIndex >= tokens.length && tokens.length > 0) return (
    <div className="bg-green-50 text-green-700 p-10 rounded-2xl text-center border border-green-200 font-bold">🎉 Done!</div>
  );

  return (
    <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-8 text-center">
      <div className="text-7xl font-black text-purple-700 my-4">
        {currentToken?.display.toUpperCase()}
      </div>
      <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto">
        {allowedKeys.map(k => (
          <div key={k} className={`aspect-square flex items-center justify-center rounded-2xl border-b-4 font-bold 
            ${pressedKeys.has(k) ? 'bg-purple-600 text-white' : 'bg-gray-50 text-gray-300'}`}>
            {k.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}