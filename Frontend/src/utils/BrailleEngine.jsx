// ═══════════════════════════════════════════════════════════════
//  UEB GRADE 2 BRAILLE ENGINE - UTILS
// ═══════════════════════════════════════════════════════════════

export const brailleLetters = {
    "a": ["f"], "b": ["f", "d"], "c": ["f", "j"], "d": ["f", "j", "k"],
    "e": ["f", "k"], "f": ["f", "d", "j"], "g": ["f", "d", "j", "k"],
    "h": ["f", "d", "k"], "i": ["d", "j"], "j": ["d", "j", "k"],
    "k": ["f", "s"], "l": ["f", "d", "s"], "m": ["f", "s", "j"],
    "n": ["f", "s", "j", "k"], "o": ["f", "s", "k"], "p": ["f", "d", "s", "j"],
    "q": ["f", "d", "s", "j", "k"], "r": ["f", "d", "s", "k"],
    "s": ["d", "s", "j"], "t": ["d", "s", "j", "k"], "u": ["f", "s", "l"],
    "v": ["f", "d", "s", "l"], "w": ["d", "j", "k", "l"],
    "x": ["f", "s", "j", "l"], "y": ["f", "s", "j", "k", "l"], "z": ["f", "s", "k", "l"]
};

export const dotsToLetter = {};
for (const [letter, dots] of Object.entries(brailleLetters)) {
    dotsToLetter[[...dots].sort().join("")] = letter;
}

export const grade2Contractions = [
    { text: "and", dots: ["f", "d", "s", "j", "l"], type: "part" },
    { text: "for", dots: ["f", "d", "s", "j", "k", "l"], type: "part" },
    { text: "of", dots: ["f", "d", "s", "k", "l"], type: "part" },
    { text: "the", dots: ["d", "s", "j", "l"], type: "part" },
    { text: "with", dots: ["d", "s", "j", "k", "l"], type: "part" },
    { text: "ch", dots: ["f", "l"], type: "part" },
    { text: "gh", dots: ["f", "d", "l"], type: "part" },
    { text: "sh", dots: ["f", "j", "l"], type: "part" },
    { text: "th", dots: ["f", "j", "k", "l"], type: "part" },
    { text: "wh", dots: ["f", "k", "l"], type: "part" },
    { text: "ed", dots: ["f", "d", "j", "l"], type: "part" },
    { text: "er", dots: ["f", "d", "j", "k", "l"], type: "part" },
    { text: "ou", dots: ["f", "d", "k", "l"], type: "part" },
    { text: "ow", dots: ["d", "j", "l"], type: "part" },
    { text: "st", dots: ["s", "j"], type: "part" },
    { text: "ing", dots: ["s", "j", "l"], type: "part" },
    { text: "ar", dots: ["s", "j", "k"], type: "part" },
    { text: "ble", dots: ["s", "j", "k", "l"], type: "part" },
    { text: "com", dots: ["s", "l"], type: "part" },
    { text: "en", dots: ["d", "l"], type: "part" },
    { text: "in", dots: ["s", "k"], type: "part" },
    { text: "dis", dots: ["d", "k", "l"], type: "part" },
    { text: "con", dots: ["d", "k"], type: "part" },
    { text: "about", dots: ["f", "d"], type: "short" },
    { text: "above", dots: ["f", "d", "l"], type: "short" },
    { text: "according", dots: ["f", "j"], type: "short" },
    { text: "across", dots: ["f", "j", "s"], type: "short" },
    { text: "after", dots: ["f", "d", "j"], type: "short" },
    { text: "afternoon", dots: ["f", "d", "j", "k"], type: "short" },
    { text: "again", dots: ["f", "d", "k"], type: "short" },
    { text: "against", dots: ["f", "d", "k", "s"], type: "short" },
    { text: "also", dots: ["f", "s"], type: "short" },
    { text: "although", dots: ["f", "s", "d"], type: "short" },
    { text: "altogether", dots: ["f", "s", "d", "j"], type: "short" },
    { text: "always", dots: ["f", "s", "l"], type: "short" },
    { text: "because", dots: ["f", "d", "s", "j", "k"], type: "short" },
    { text: "before", dots: ["f", "d", "s", "j"], type: "short" },
    { text: "behind", dots: ["f", "d", "s", "k"], type: "short" },
    { text: "below", dots: ["f", "d", "s"], type: "short" },
    { text: "beneath", dots: ["f", "d", "s", "l"], type: "short" },
    { text: "beside", dots: ["f", "d", "j", "k", "s"], type: "short" },
    { text: "between", dots: ["f", "d", "j", "k", "l"], type: "short" },
    { text: "beyond", dots: ["f", "d", "j", "l"], type: "short" },
    { text: "blind", dots: ["f", "d", "l"], type: "short" },
    { text: "braille", dots: ["f", "d", "s", "j", "l"], type: "short" },
    { text: "but", dots: ["f", "d"], type: "short" },
    { text: "can", dots: ["f", "j"], type: "short" },
    { text: "cannot", dots: ["f", "j", "s", "j", "k"], type: "short" },
    { text: "child", dots: ["f", "l"], type: "short" },
    { text: "children", dots: ["f", "l", "s", "j", "l"], type: "short" },
    { text: "could", dots: ["f", "d", "s", "j", "k", "l"], type: "short" },
    { text: "do", dots: ["f", "j", "k"], type: "short" },
    { text: "either", dots: ["f", "d", "j", "k", "l"], type: "short" },
    { text: "enough", dots: ["f", "k"], type: "short" },
    { text: "every", dots: ["f", "k"], type: "short" },
    { text: "first", dots: ["f", "d", "s", "j", "l"], type: "short" },
    { text: "from", dots: ["f", "d", "j"], type: "short" },
    { text: "go", dots: ["f", "d", "j", "k"], type: "short" },
    { text: "good", dots: ["f", "d", "j", "k"], type: "short" },
    { text: "great", dots: ["f", "d", "j", "k", "s"], type: "short" },
    { text: "have", dots: ["f", "d", "k"], type: "short" },
    { text: "him", dots: ["f", "d", "k", "j"], type: "short" },
    { text: "his", dots: ["f", "d", "k", "s"], type: "short" },
    { text: "immediate", dots: ["d", "j"], type: "short" },
    { text: "it", dots: ["d", "j", "k"], type: "short" },
    { text: "its", dots: ["d", "j", "k", "s"], type: "short" },
    { text: "just", dots: ["d", "j", "k"], type: "short" },
    { text: "knowledge", dots: ["f", "s"], type: "short" },
    { text: "like", dots: ["f", "d", "s"], type: "short" },
    { text: "little", dots: ["f", "d", "s", "l"], type: "short" },
    { text: "more", dots: ["f", "s", "j"], type: "short" },
    { text: "much", dots: ["f", "s", "j", "l"], type: "short" },
    { text: "must", dots: ["f", "s", "j", "s"], type: "short" },
    { text: "myself", dots: ["f", "s", "j", "k", "l"], type: "short" },
    { text: "necessary", dots: ["f", "s", "j", "k"], type: "short" },
    { text: "neither", dots: ["f", "s", "j", "k", "d"], type: "short" },
    { text: "not", dots: ["f", "s", "j", "k"], type: "short" },
    { text: "o'clock", dots: ["f", "s", "k"], type: "short" },
    { text: "one", dots: ["f", "s", "k"], type: "short" },
    { text: "ourselves", dots: ["f", "d", "s", "j", "k", "l"], type: "short" },
    { text: "out", dots: ["f", "s", "j", "l"], type: "short" },
    { text: "paid", dots: ["f", "d", "s", "j"], type: "short" },
    { text: "people", dots: ["f", "d", "s", "j", "k"], type: "short" },
    { text: "perhaps", dots: ["f", "d", "s", "k"], type: "short" },
    { text: "quite", dots: ["f", "d", "s", "j", "k", "l"], type: "short" },
    { text: "rather", dots: ["f", "d", "s", "k"], type: "short" },
    { text: "receive", dots: ["f", "d", "s", "k", "s"], type: "short" },
    { text: "rejoice", dots: ["f", "d", "s", "k", "j"], type: "short" },
    { text: "right", dots: ["f", "d", "s", "k", "l"], type: "short" },
    { text: "said", dots: ["d", "s", "j"], type: "short" },
    { text: "shall", dots: ["d", "j", "l"], type: "short" },
    { text: "should", dots: ["d", "j", "d"], type: "short" },
    { text: "so", dots: ["d", "s", "j"], type: "short" },
    { text: "some", dots: ["d", "s", "j", "l"], type: "short" },
    { text: "still", dots: ["d", "s", "j", "k"], type: "short" },
    { text: "such", dots: ["d", "s", "j", "k", "l"], type: "short" },
    { text: "that", dots: ["d", "s", "j", "k"], type: "short" },
    { text: "their", dots: ["d", "s", "j", "k", "d"], type: "short" },
    { text: "themselves", dots: ["d", "s", "j", "k", "d", "s"], type: "short" },
    { text: "there", dots: ["d", "s", "j", "k", "l"], type: "short" },
    { text: "these", dots: ["d", "j", "k", "l"], type: "short" },
    { text: "through", dots: ["d", "j", "l"], type: "short" },
    { text: "thyself", dots: ["d", "j", "k", "s"], type: "short" },
    { text: "today", dots: ["d", "s", "j", "k", "s"], type: "short" },
    { text: "together", dots: ["d", "s", "j", "k", "j"], type: "short" },
    { text: "tomorrow", dots: ["d", "s", "j", "k", "j", "l"], type: "short" },
    { text: "tonight", dots: ["d", "s", "j", "k", "j", "k"], type: "short" },
    { text: "upon", dots: ["f", "s", "l"], type: "short" },
    { text: "us", dots: ["f", "s", "l"], type: "short" },
    { text: "very", dots: ["f", "d", "s", "l"], type: "short" },
    { text: "was", dots: ["d", "j", "k", "l"], type: "short" },
    { text: "were", dots: ["d", "k", "l"], type: "short" },
    { text: "which", dots: ["f", "j", "k"], type: "short" },
    { text: "while", dots: ["f", "j", "k", "l"], type: "short" },
    { text: "whose", dots: ["f", "k", "l"], type: "short" },
    { text: "will", dots: ["d", "j", "k", "l"], type: "short" },
    { text: "word", dots: ["d", "j", "k", "l"], type: "short" },
    { text: "would", dots: ["d", "j", "l"], type: "short" },
    { text: "you", dots: ["f", "s", "j", "k", "l"], type: "short" },
    { text: "young", dots: ["f", "s", "j", "k"], type: "short" },
    { text: "your", dots: ["f", "s", "j", "k", "l"], type: "short" },
    { text: "yourself", dots: ["f", "s", "j", "k", "l"], type: "short" }
].filter((v, i, a) => a.findIndex(x => x.text === v.text) === i)
 .sort((a, b) => b.text.length - a.text.length);

export const chordToContraction = {};
for (const c of grade2Contractions) {
    const key = [...c.dots].sort().join("");
    if (!dotsToLetter[key] && !chordToContraction[key]) {
        chordToContraction[key] = c.text;
    }
}

export function textToTokens(text) {
    const tokens = [];
    let i = 0;
    const lower = text.toLowerCase();

    while (i < lower.length) {
        if (lower[i] === " " || lower[i] === "\n") {
            tokens.push({ display: lower[i], dots: null, label: null });
            i++;
            continue;
        }

        let matched = false;
        for (const c of grade2Contractions) {
            const len = c.text.length;
            if (!lower.startsWith(c.text, i)) continue;

            const before = i === 0 || !/[a-z]/i.test(lower[i - 1]);
            const after = (i + len) >= lower.length || !/[a-z]/i.test(lower[i + len]);

            if (c.type === "short" && !(before && after)) continue;
            
            // Note: Part-word logic simplified for general extraction
            tokens.push({
                display: text.slice(i, i + len),
                dots: c.dots,
                label: c.text
            });
            i += len;
            matched = true;
            break;
        }
        if (matched) continue;

        const ch = lower[i];
        if (brailleLetters[ch]) {
            tokens.push({ display: text[i], dots: brailleLetters[ch], label: ch });
        } else {
            tokens.push({ display: text[i], dots: null, label: null });
        }
        i++;
    }
    return tokens;
}