// ─── Replace AWS URLs with your actual S3/CloudFront URLs ───────────────────
export const AWS_BASE_URL = "https://d2yammpp0y6r1t.cloudfront.net";

import { faCalculator, faMicroscope, faBookOpen } from '@fortawesome/free-solid-svg-icons';

export const SUBJECTS = {
  maths: {
    id: "maths",
    title: "Mathematics",
    icon: faCalculator,
    color: "#06d6a0",
    accent: "#4cc9f0",
    description: "Numbers, geometry, and problem solving for every learner.",
    gradient: "from-[#06d6a0] to-[#4cc9f0]",
    bg: "rgba(6,214,160,0.08)",
  },
  science: {
    id: "science",
    title: "Science",
    icon: faMicroscope,
    color: "#9b5de5",
    accent: "#f9c74f",
    description: "Explore the living world, earth, space, and matter.",
    gradient: "from-[#9b5de5] to-[#f9c74f]",
    bg: "rgba(155,93,229,0.08)",
  },
  english: {
    id: "english",
    title: "English",
    icon: faBookOpen,
    color: "#ff6b6b",
    accent: "#ffd166",
    description: "Reading, writing, grammar and storytelling skills.",
    gradient: "from-[#ff6b6b] to-[#ffd166]",
    bg: "rgba(255,107,107,0.08)",
  },
};

// ─── Course Videos ────────────────────────────────────────────────────────────
// Replace `videoUrl` with your actual AWS S3/CloudFront signed or public URLs
// Replace `thumbnail` with your actual thumbnail URLs or leave as emoji fallbacks

export const COURSES = {
  maths: [
    {
      id: "m1",
      subject: "maths",
      title: "Introduction to Numbers",
      duration: "12:34",
      level: "Beginner",
      videoUrl: `${AWS_BASE_URL}/maths:intro-numbers.mp4`,
      thumbnail: null,
      description:
        "Learn counting, number recognition and basic number sense with fun visuals.",
      transcript: [
        { time: 0, text: "Welcome to Mathematics with Saahas!" },
        { time: 4, text: "Today we are going to learn about numbers." },
        {
          time: 9,
          text: "Numbers are all around us — in clocks, calendars, and even food!",
        },
        { time: 15, text: "Let's start with counting from one to ten." },
        { time: 20, text: "One… two… three… four… five…" },
        { time: 26, text: "Six… seven… eight… nine… ten!" },
        {
          time: 32,
          text: "Great job! Now let's look at what each number looks like when we write it.",
        },
        { time: 40, text: "The number 1 looks like a single straight line." },
        {
          time: 46,
          text: "The number 2 curves at the top and has a flat bottom.",
        },
        {
          time: 52,
          text: "Can you trace these numbers with your finger on the screen?",
        },
      ],
    },
    {
      id: "m2",
      subject: "maths",
      title: "Multiplication & Division",
      duration: "15:20",
      level: "Beginner",
      videoUrl: `${AWS_BASE_URL}/maths:mul-div.mp4`,
      thumbnail: null,
      description:
        "Learn multiplication and division of small numbers using visual blocks and stories.",
      transcript: [
        {
          time: 0,
          text: "Hello again! Today we learn Multiplication and Division.",
        },
        { time: 5, text: "Multiplication means adding the same number many times." },
        {
          time: 10,
          text: "If you have 3 groups of 4 apples, how many apples do you have in total?",
        },
        { time: 17, text: "3 times 4 equals 12. Well done!" },
        { time: 22, text: "Division is the opposite — sharing equally into groups." },
        {
          time: 28,
          text: "If you have 12 apples and share with 3 friends, each gets 12 divided by 3, which is 4.",
        },
      ],
    },
    {
      id: "m3",
      subject: "maths",
      title: "Basic Abacus",
      duration: "11:05",
      level: "Beginner",
      videoUrl: `${AWS_BASE_URL}/maths:basic-abacus.mp4`,
      thumbnail: null,
      description:
        "Learn to count, add and subtract using an abacus — a hands-on way to understand numbers.",
      transcript: [
        { time: 0, text: "Welcome! Today we learn to use the abacus." },
        { time: 4, text: "An abacus is a counting tool with rows of beads." },
        { time: 8, text: "Each row represents a different place — ones, tens, hundreds." },
        { time: 14, text: "Push one bead to the right on the bottom row — that means one!" },
        { time: 20, text: "Let's try adding 3 and 4 on the abacus together." },
        { time: 26, text: "Move 3 beads, then 4 more — count them all and you get 7!" },
      ],
    }

  ],

  science: [
    {
      id: "s1",
      subject: "science",
      title: "Living & Non-Living Things",
      duration: "10:12",
      level: "Beginner",
      videoUrl: `${AWS_BASE_URL}/science:photosynthesis.mp4 `,
      thumbnail: null,
      description:
        "Understand what makes something alive with real-world examples.",
      transcript: [
        { time: 0, text: "Science helps us understand the world around us." },
        { time: 5, text: "Today's question: What is alive and what is not?" },
        { time: 10, text: "Living things breathe, grow, and reproduce." },
        { time: 16, text: "A tree is living. A rock is non-living." },
        {
          time: 21,
          text: "Can you name three living things near you right now?",
        },
      ],
    },
    {
      id: "s2",
      subject: "science",
      title: "Water Cycle",
      duration: "13:30",
      level: "Beginner",
      videoUrl: `${AWS_BASE_URL}/science:water-cycle.mp4`,
      thumbnail: null,
      description:
        "From rain to clouds to rivers — the amazing journey of water.",
      transcript: [
        { time: 0, text: "Have you ever wondered where rain comes from?" },
        {
          time: 5,
          text: "Water travels in a cycle — evaporation, condensation, precipitation.",
        },
        {
          time: 12,
          text: "The sun heats water in oceans and lakes, turning it into vapour.",
        },
        { time: 19, text: "This vapour rises and forms clouds." },
        {
          time: 25,
          text: "When clouds get heavy, water falls back as rain or snow.",
        },
      ],
    },
    {
      id: "s3",
      subject: "science",
      title: "Body Parts",
      duration: "14:55",
      level: "Beginner",
      videoUrl: `${AWS_BASE_URL}/science:body-parts.mp4`,
      thumbnail: null,
      description:
        "Learn the names and functions of different body parts with fun visuals.",
      transcript: [
        { time: 0, text: "Let's learn about the parts of our body!" },
        {
          time: 5,
          text: "Your head is at the top — it holds your brain, eyes, ears and mouth.",
        },
        {
          time: 12,
          text: "Your arms help you carry things, and your hands let you write and wave.",
        },
        { time: 18, text: "Your legs help you walk, run and jump!" },
        { time: 24, text: "Can you touch your nose, your knees, and your toes?" },
      ],
    },
    {
      id: "s4",
      subject: "science",
      title: "Plants & Photosynthesis",
      duration: "12:00",
      level: "Intermediate",
      videoUrl: `${AWS_BASE_URL}/science/photosynthesis.mp4`,
      thumbnail: null,
      description:
        "How plants make their own food using sunlight, water and air.",
      transcript: [
        { time: 0, text: "Plants are amazing — they make their own food!" },
        { time: 6, text: "This process is called photosynthesis." },
        {
          time: 11,
          text: "Plants take in sunlight, water from roots, and carbon dioxide from air.",
        },
        {
          time: 18,
          text: "They produce glucose — their food — and release oxygen for us to breathe.",
        },
      ],
    },
  ],

  english: [
    {
      id: "e1",
      subject: "english",
      title: "Alphabet & Phonics",
      duration: "9:45",
      level: "Beginner",
      videoUrl: `${AWS_BASE_URL}/english:learn-phonics.mp4`,
      thumbnail: null,
      description:
        "Learn all 26 letters and the sounds they make with fun examples.",
      transcript: [
        { time: 0, text: "Welcome to English! Let's start with the Alphabet." },
        { time: 4, text: "There are 26 letters in the English alphabet." },
        { time: 9, text: "A is for Apple. B is for Ball. C is for Cat." },
        {
          time: 15,
          text: "Each letter has a sound. Let's practise them together.",
        },
        { time: 21, text: "The letter A says 'aah' as in apple." },
      ],
    },
    {
      id: "e2",
      subject: "english",
      title: "ABCD Song",
      duration: "11:20",
      level: "Beginner",
      videoUrl: `${AWS_BASE_URL}/english:abcd-song.mp4`,
      thumbnail: null,
      description: "Sing along and learn the alphabet with the classic ABCD song!",
      transcript: [
        {
          time: 0,
          text: "Let's sing the ABCD song together!",
        },
        { time: 5, text: "A B C D E F G — sing it with me!" },
        { time: 10, text: "H I J K L M N O P — you're doing great!" },
        { time: 16, text: "Q R S T U V — almost there!" },
        { time: 21, text: "W X Y and Z — now I know my ABCs!" },
        { time: 27, text: "Next time won't you sing with me? Great job!" },
      ],
    },
    {
      id: "e3",
      subject: "english",
      title: "Days of the Week",
      duration: "13:10",
      level: "Beginner",
      videoUrl: `${AWS_BASE_URL}/english:days-of-week.mp4`,
      thumbnail: null,
      description:
        "Learn all seven days of the week with fun rhymes and activities.",
      transcript: [
        { time: 0, text: "Let's learn the days of the week!" },
        {
          time: 5,
          text: "Monday, Tuesday, Wednesday — the first three days.",
        },
        { time: 11, text: "Thursday, Friday — the week is almost over!" },
        {
          time: 17,
          text: "Saturday and Sunday are the weekend — time to relax and play!",
        },
        { time: 23, text: "There are seven days in one week. Can you name them all?" },
      ],
    },
    {
      id: "e4",
      subject: "english",
      title: "Creative Storytelling",
      duration: "16:30",
      level: "Advanced",
      videoUrl: `${AWS_BASE_URL}/english/storytelling.mp4`,
      thumbnail: null,
      description:
        "How to craft your own stories with characters, settings and a plot.",
      transcript: [
        {
          time: 0,
          text: "Every great story has three things: a beginning, middle, and end.",
        },
        { time: 7, text: "Your character is who the story is about." },
        {
          time: 13,
          text: "The setting is where and when the story takes place.",
        },
        {
          time: 20,
          text: "The plot is the sequence of events — what happens and why.",
        },
      ],
    },
  ],
};
