import React, { useEffect, useRef, useState }
    from "react";

import {
    HandLandmarker,
    FilesetResolver
}
    from "@mediapipe/tasks-vision";

import {
    Trophy,
    Zap,
    Accessibility,
    RefreshCw
}
    from "lucide-react";

import {
    detectGesture
}
    from "../../utils/DetectGesture";

import {
    speak,
    getInstruction,
    compliment
}
    from "../../utils/AssistantAI";


export default function SignAbility() {

    const videoRef = useRef(null);

    const animationRef = useRef(null);

    const historyRef = useRef([]);

    const autoMatchedRef = useRef(false);

    const targetRef = useRef("A");

    const aiReadyRef = useRef(false);



    const [gesture, setGesture]
        = useState("Loading AI...");

    const [target, setTarget]
        = useState("A");

    useEffect(() => {

        targetRef.current = target;

    }, [target]);

    const [isCorrect, setIsCorrect]
        = useState(false);

    const [score, setScore]
        = useState(0);



    // ---------- SPEAK SAFE

    const speakSafe = (text) => {

        window.speechSynthesis.cancel();

        setTimeout(() => {

            speak(text);

        }, 300);

    };



    // ---------- NEXT LETTER

    const handleNext = () => {

        autoMatchedRef.current = false;

        historyRef.current = [];

        setIsCorrect(false);

        const letters = [

            "A", "B", "C", "D",
            "L", "V", "W", "I"

        ];

        const next =

            letters[
            Math.floor(
                Math.random() * letters.length
            )
            ];

        setTarget(next);

    };



    // ---------- LOAD AI

    useEffect(() => {

        let handLandmarker;



        const startAI = async () => {

            try {

                // welcome fully finishes

                speakSafe(
                    "Welcome to SignAbility. Please allow camera access."
                );


                // wait speech finish

                await new Promise(r => setTimeout(r, 4500));

                const vision =
                    await FilesetResolver
                        .forVisionTasks(

                            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"

                        );


                handLandmarker =
                    await HandLandmarker
                        .createFromOptions(

                            vision,
                            {

                                baseOptions: {

                                    modelAssetPath:

                                        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",

                                    delegate: "GPU"

                                },

                                runningMode: "VIDEO",

                                numHands: 1

                            });

                const stream =
                    await navigator
                        .mediaDevices
                        .getUserMedia({

                            video: true

                        });

                videoRef.current.srcObject
                    = stream;

                videoRef.current.onloadedmetadata
                    = () => {

                        videoRef.current.play();

                        aiReadyRef.current = true;

                        predict();

                    };

            }

            catch {

                setGesture("AI ERROR");

            }

        };



        // ---------- DETECTION LOOP

        const predict = () => {

            if (

                videoRef.current &&
                videoRef.current.readyState >= 2 &&
                aiReadyRef.current

            ) {

                const results =
                    handLandmarker
                        .detectForVideo(

                            videoRef.current,
                            performance.now()

                        );


                if (results.landmarks?.length) {

                    const found =
                        detectGesture(

                            results.landmarks[0]

                        );

                    setGesture(found);


                    // ---------- HISTORY BUFFER

                    historyRef.current.push(found);

                    if (

                        historyRef.current.length > 18

                    ) {

                        historyRef.current.shift();

                    }


                    // majority voting

                    const matches =
                        historyRef.current
                            .filter(

                                g => g === targetRef.current

                            ).length;


                    // accept quickly

                    if (

                        matches >= 12 &&
                        !autoMatchedRef.current

                    ) {

                        autoMatchedRef.current = true;

                        setIsCorrect(true);

                        navigator.vibrate?.(150);

                        setScore(prev => prev + 10);


                        // compliment

                        speakSafe(

                            compliment()

                        );


                        // auto next

                        setTimeout(() => {

                            handleNext();

                        }, 2300);

                    }

                    else if (matches < 6) {

                        setIsCorrect(false);

                    }

                }

            }

            animationRef.current =
                requestAnimationFrame(predict);

        };


        startAI();

        return () => {

            cancelAnimationFrame(

                animationRef.current

            );

        };

    }, []);



    // ---------- SPEAK NEW LETTER

    useEffect(() => {

        if (!aiReadyRef.current)
            return;

        historyRef.current = [];

        autoMatchedRef.current = false;


        setTimeout(() => {

            speakSafe(

                "Your next sign is "

                + target +

                ". "

                +

                getInstruction(target)

            );

        }, 1200);

    }, [target]);




    // ---------- UI SAME

    return (

        <div className="min-h-screen bg-[#020617] text-white p-6 font-sans">

            <nav className="max-w-6xl mx-auto flex justify-between items-center mb-10">

                <div className="flex items-center gap-3">

                    <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">

                        <Accessibility size={28} />

                    </div>

                    <h1 className="text-2xl font-black uppercase tracking-tight italic">

                        Sign<span className="text-indigo-500 italic">

                            Ability

                        </span>

                    </h1>

                </div>

                <div className="bg-slate-900 border border-slate-800 px-5 py-2 rounded-2xl flex items-center gap-3">

                    <Trophy size={18} className="text-yellow-500" />

                    <span className="font-bold">

                        SCORE : {score}

                    </span>

                </div>

            </nav>



            <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">


                <div className="lg:col-span-8">

                    <div className="relative bg-black rounded-[2rem] overflow-hidden border border-slate-800">

                        <video

                            ref={videoRef}

                            className="w-full h-full object-cover scale-x-[-1] min-h-[500px]"

                            muted

                            playsInline

                        />

                        <div className="absolute top-8 left-8 p-6 bg-slate-950/80 rounded-3xl">

                            <span className="text-xs text-indigo-400">

                                CURRENT TASK

                            </span>

                            <div className="text-9xl font-black">

                                {target}

                            </div>

                        </div>


                        {isCorrect && (

                            <div className="absolute inset-0 flex items-center justify-center">

                                <div className="bg-white text-indigo-600 px-12 py-6 rounded-3xl text-4xl font-black">

                                    MATCH!

                                </div>

                            </div>

                        )}

                    </div>

                </div>



                <div className="lg:col-span-4 flex flex-col gap-6">

                    <div className="bg-slate-900/50 p-8 rounded-[2rem]">

                        <Zap size={14} />

                        <div className="text-7xl font-mono font-bold text-indigo-400">

                            {gesture}

                        </div>

                    </div>


                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-8 rounded-[2rem]">

                        <h3 className="text-xl font-bold mb-4">

                            Tactile Tip

                        </h3>

                        <p className="mb-8">

                            {getInstruction(target)}

                        </p>

                        <button

                            onClick={handleNext}

                            disabled={!isCorrect}

                            className={`w-full py-5 rounded-2xl font-black

${isCorrect

                                    ?

                                    'bg-white text-indigo-600'

                                    :

                                    'bg-indigo-400/30'

                                }

`}

                        >

                            <RefreshCw size={20} />

                            {isCorrect

                                ?

                                "CONTINUE"

                                :

                                "WAITING..."

                            }

                        </button>

                    </div>

                </div>

            </main>

        </div>

    );

}