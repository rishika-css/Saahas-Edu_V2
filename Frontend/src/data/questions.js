/**
 * Local question bank for the Adaptive Test.
 * Questions are served entirely from the frontend — no backend needed.
 */

const QUESTIONS = [
    {
        _id: "q1",
        type: "mcq",
        difficulty: 1,
        content: "What is the full form of HTML?",
        options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"],
        answer: "Hyper Text Markup Language",
        tags: ["web", "basics"],
    },
    {
        _id: "q2",
        type: "mcq",
        difficulty: 1,
        content: "Which tag is used to create a hyperlink in HTML?",
        options: ["<link>", "<a>", "<href>", "<url>"],
        answer: "<a>",
        tags: ["web", "html"],
    },
    {
        _id: "q3",
        type: "mcq",
        difficulty: 1,
        content: "What does CSS stand for?",
        options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"],
        answer: "Cascading Style Sheets",
        tags: ["web", "css"],
    },
    {
        _id: "q4",
        type: "mcq",
        difficulty: 2,
        content: "Which property is used to change the background color in CSS?",
        options: ["bgcolor", "color", "background-color", "bg-color"],
        answer: "background-color",
        tags: ["web", "css"],
    },
    {
        _id: "q5",
        type: "mcq",
        difficulty: 2,
        content: "Which of the following is a JavaScript framework?",
        options: ["Django", "Laravel", "React", "Flask"],
        answer: "React",
        tags: ["web", "javascript"],
    },
    {
        _id: "q6",
        type: "mcq",
        difficulty: 2,
        content: "What is the correct syntax to declare a variable in JavaScript?",
        options: ["variable x;", "var x;", "v x;", "declare x;"],
        answer: "var x;",
        tags: ["javascript", "basics"],
    },
    {
        _id: "q7",
        type: "mcq",
        difficulty: 3,
        content: "What does the 'typeof' operator return for an array in JavaScript?",
        options: ["array", "object", "list", "undefined"],
        answer: "object",
        tags: ["javascript"],
    },
    {
        _id: "q8",
        type: "mcq",
        difficulty: 3,
        content: "Which method is used to add an element to the end of an array?",
        options: ["append()", "push()", "add()", "insert()"],
        answer: "push()",
        tags: ["javascript", "arrays"],
    },
    {
        _id: "q9",
        type: "mcq",
        difficulty: 2,
        content: "What is the purpose of the <title> tag in HTML?",
        options: ["Displays a title on the page", "Sets the browser tab title", "Creates a heading", "Adds a tooltip"],
        answer: "Sets the browser tab title",
        tags: ["html", "basics"],
    },
    {
        _id: "q10",
        type: "mcq",
        difficulty: 1,
        content: "Which symbol is used for single-line comments in JavaScript?",
        options: ["/* */", "//", "#", "<!-- -->"],
        answer: "//",
        tags: ["javascript", "basics"],
    },
    {
        _id: "q11",
        type: "mcq",
        difficulty: 3,
        content: "What does REST stand for in web development?",
        options: ["Representational State Transfer", "Remote Execution Service Technology", "Reliable End-to-End Secure Transfer", "Resource Extraction and Serialization Tool"],
        answer: "Representational State Transfer",
        tags: ["web", "api"],
    },
    {
        _id: "q12",
        type: "mcq",
        difficulty: 2,
        content: "Which HTTP method is used to update data?",
        options: ["GET", "POST", "PUT", "DELETE"],
        answer: "PUT",
        tags: ["web", "api"],
    },
    {
        _id: "q13",
        type: "mcq",
        difficulty: 1,
        content: "What does URL stand for?",
        options: ["Uniform Resource Locator", "Universal Resource Link", "Unified Resource Locator", "Universal Routing Language"],
        answer: "Uniform Resource Locator",
        tags: ["web", "basics"],
    },
    {
        _id: "q14",
        type: "mcq",
        difficulty: 3,
        content: "Which data structure follows the LIFO (Last In First Out) principle?",
        options: ["Queue", "Stack", "Array", "Linked List"],
        answer: "Stack",
        tags: ["dsa", "basics"],
    },
    {
        _id: "q15",
        type: "mcq",
        difficulty: 2,
        content: "What is the default port number for HTTP?",
        options: ["443", "21", "80", "8080"],
        answer: "80",
        tags: ["web", "networking"],
    },
];

/**
 * Pick `count` random questions from the bank.
 */
export function getRandomQuestions(count = 10) {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

export default QUESTIONS;
