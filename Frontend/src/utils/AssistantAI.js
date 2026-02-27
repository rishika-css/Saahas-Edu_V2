let speaking = false;

export function speak(text) {

    if (!("speechSynthesis" in window))
        return;

    speechSynthesis.cancel();

    const utterance =
        new SpeechSynthesisUtterance(text);

    utterance.rate = 0.95;

    utterance.lang = "en-US";

    utterance.onend = () => {

        speaking = false;

    };

    speaking = true;

    speechSynthesis.speak(utterance);

}


export function getInstruction(letter) {

    const instructions = {

        A: "Make a fist and keep thumb outside.",

        B: "Keep fingers straight together.",

        C: "Curve hand like holding an orange.",

        D: "Point index finger upward.",

        L: "Make L shape using thumb and index.",

        V: "Raise two fingers apart.",

        W: "Raise three fingers.",

        I: "Raise pinky finger.",



    };

    return instructions[letter]
        || "Follow finger placement carefully.";

}



export function compliment() {

    const list = [

        "Excellent work!",

        "Perfect sign!",

        "Great job!",

        "That was accurate!"

    ];

    return list[
        Math.floor(Math.random() * list.length)
    ];

}



export function retryMessage() {

    const list = [

        "Almost there.",

        "Try adjusting fingers.",

        "Keep trying.",

        "Not correct yet."

    ];

    return list[
        Math.floor(Math.random() * list.length)
    ];

}

/* =====================================================
   Comfort Suggestion AI (Mental Health Support)
===================================================== */

export function comfortSuggestion(text = "") {

    const t = text.toLowerCase();

    if (
        t.includes("suicide") ||
        t.includes("die") ||
        t.includes("hurt myself") ||
        t.includes("end my life")
    ) {
        return {
            mood: "danger",
            message:
                "You are not alone. Please consider speaking to a trusted person or counselor. Help is available ❤️."
        };
    }

    if (t.includes("sad") || t.includes("cry") || t.includes("alone")) {
        return {
            mood: "sad",
            message:
                "I'm here with you. Maybe try a breathing exercise or write a little more about what happened."
        };
    }

    if (t.includes("angry") || t.includes("hate")) {
        return {
            mood: "angry",
            message:
                "Anger is valid. Would taking a short pause or breathing exercise help?"
        };
    }

    if (t.includes("happy") || t.includes("fun")) {
        return {
            mood: "happy",
            message:
                "That sounds wonderful! Hold on to moments like this 😊."
        };
    }

    return {
        mood: "neutral",
        message:
            "I'm listening. Tell me more about how your day felt."
    };
}