/* ================================================================
   BreathingExercise.jsx — Interactive Guided Breathing Widget
   ================================================================
   4-7-8 breathing pattern with animated expanding/contracting circle.
   Inhale 4s → Hold 7s → Exhale 8s (one cycle = 19s).
================================================================ */

import { useState, useRef, useEffect, useCallback } from 'react'

const PHASES = [
    { label: 'Inhale', duration: 4, cls: 'inhale', emoji: '🌬️' },
    { label: 'Hold', duration: 7, cls: 'hold', emoji: '⏸️' },
    { label: 'Exhale', duration: 8, cls: 'exhale', emoji: '💨' },
]

export default function BreathingExercise() {
    const [running, setRunning] = useState(false)
    const [phaseIdx, setPhaseIdx] = useState(0)
    const [countdown, setCountdown] = useState(PHASES[0].duration)
    const [cycles, setCycles] = useState(0)
    const timerRef = useRef(null)

    const phase = PHASES[phaseIdx]

    const tick = useCallback(() => {
        setCountdown(prev => {
            if (prev <= 1) {
                setPhaseIdx(pi => {
                    const next = (pi + 1) % PHASES.length
                    if (next === 0) setCycles(c => c + 1)
                    return next
                })
                /* We return the next phase duration in the next render cycle.
                   setTimeout ensures state is settled.  */
                return 0
            }
            return prev - 1
        })
    }, [])

    /* Drive the timer */
    useEffect(() => {
        if (!running) return
        /* When countdown hits 0, reset it to the new phase's duration */
        if (countdown === 0) {
            setCountdown(PHASES[phaseIdx].duration)
            return
        }
        timerRef.current = setTimeout(tick, 1000)
        return () => clearTimeout(timerRef.current)
    }, [running, countdown, phaseIdx, tick])

    const start = () => {
        setPhaseIdx(0)
        setCountdown(PHASES[0].duration)
        setCycles(0)
        setRunning(true)
    }

    const stop = () => {
        setRunning(false)
        clearTimeout(timerRef.current)
        setPhaseIdx(0)
        setCountdown(PHASES[0].duration)
    }

    return (
        <div className="flex flex-col items-center gap-5 py-2">
            {/* Animated circle */}
            <div className="relative flex items-center justify-center">
                <div className={`mh-breathe-circle ${running ? phase.cls : ''}`}>
                    <div className="text-center text-white">
                        <div className="text-3xl mb-1">{running ? phase.emoji : '🧘'}</div>
                        <div className="text-sm font-bold opacity-90">
                            {running ? phase.label : 'Ready'}
                        </div>
                        {running && (
                            <div className="text-2xl font-black mt-1 tabular-nums">
                                {countdown}
                            </div>
                        )}
                    </div>
                </div>

                {/* Outer ring indicator */}
                {running && (
                    <svg
                        width="200" height="200"
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90"
                    >
                        <circle
                            cx="100" cy="100" r="94"
                            fill="none"
                            stroke="rgba(99,102,241,0.15)"
                            strokeWidth="3"
                        />
                        <circle
                            cx="100" cy="100" r="94"
                            fill="none"
                            stroke="rgba(99,102,241,0.6)"
                            strokeWidth="3"
                            strokeDasharray={2 * Math.PI * 94}
                            strokeDashoffset={2 * Math.PI * 94 * (1 - countdown / phase.duration)}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 1s linear' }}
                        />
                    </svg>
                )}
            </div>

            {/* Phase indicators */}
            <div className="flex items-center gap-3">
                {PHASES.map((p, i) => (
                    <div
                        key={p.label}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${running && phaseIdx === i
                                ? 'bg-indigo-100 text-indigo-700 scale-110'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                    >
                        <span>{p.emoji}</span>
                        <span>{p.label}</span>
                        <span className="opacity-60">{p.duration}s</span>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
                {!running ? (
                    <button
                        onClick={start}
                        className="px-8 py-3 rounded-2xl text-sm font-bold text-white
                       bg-gradient-to-r from-indigo-500 to-purple-500
                       hover:from-indigo-600 hover:to-purple-600
                       shadow-lg shadow-indigo-500/25 transition-all
                       hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5
                       active:translate-y-0"
                    >
                        ▶ Start Breathing
                    </button>
                ) : (
                    <button
                        onClick={stop}
                        className="px-8 py-3 rounded-2xl text-sm font-bold text-red-600
                       bg-red-50 border-2 border-red-200
                       hover:bg-red-100 transition-all"
                    >
                        ■ Stop
                    </button>
                )}
            </div>

            {/* Cycle counter */}
            {cycles > 0 && (
                <p className="text-xs text-gray-400 font-semibold">
                    🔄 {cycles} cycle{cycles > 1 ? 's' : ''} completed
                </p>
            )}
        </div>
    )
}
