// ─── Replace AWS URLs with your actual S3/CloudFront URLs ───────────────────
export const AWS_BASE_URL = "https://d2yammpp0y6r1t.cloudfront.net";

export const SUBJECTS = {
  maths: {
    id: "maths",
    title: "Mathematics",
    emoji: "🔢",
    color: "#06d6a0",
    accent: "#4cc9f0",
    description: "Numbers, geometry, and problem solving for every learner.",
    gradient: "from-[#06d6a0] to-[#4cc9f0]",
    bg: "rgba(6,214,160,0.08)",
  },
  science: {
    id: "science",
    title: "Science",
    emoji: "🔬",
    color: "#9b5de5",
    accent: "#f9c74f",
    description: "Explore the living world, earth, space, and matter.",
    gradient: "from-[#9b5de5] to-[#f9c74f]",
    bg: "rgba(155,93,229,0.08)",
  },
  english: {
    id: "english",
    title: "English",
    emoji: "📖",
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
      title: "Addition & Subtraction",
      duration: "15:20",
      level: "Beginner",
      videoUrl: `${AWS_BASE_URL}/maths/addition-subtraction.mp4`,
      thumbnail: null,
      description:
        "Adding and subtracting small numbers using visual blocks and stories.",
      transcript: [
        {
          time: 0,
          text: "Hello again! Today we learn Addition and Subtraction.",
        },
        { time: 5, text: "Addition means putting things together." },
        {
          time: 10,
          text: "If you have 2 apples and I give you 3 more, how many do you have?",
        },
        { time: 17, text: "2 plus 3 equals 5. Well done!" },
        { time: 22, text: "Subtraction is the opposite — taking things away." },
        {
          time: 28,
          text: "If you had 5 apples and ate 2, you have 5 minus 2, which is 3.",
        },
      ],
    },
    {
      id: "m3",
      subject: "maths",
      title: "Shapes & Geometry",
      duration: "11:05",
      level: "Beginner",
      videoUrl: `${AWS_BASE_URL}/maths/shapes-geometry.mp4`,
      thumbnail: null,
      description:
        "Circles, squares, triangles and more — geometry made visual and tactile.",
      transcript: [
        { time: 0, text: "Welcome to Shapes and Geometry!" },
        { time: 4, text: "Look around you. Everything has a shape." },
        { time: 8, text: "A ball is a circle. A door is a rectangle." },
        { time: 14, text: "A triangle has three sides and three corners." },
        { time: 20, text: "Let's draw these shapes together step by step." },
      ],
    },
    {
      id: "m4",
      subject: "maths",
      title: "Multiplication Tables",
      duration: "18:45",
      level: "Intermediate",
      videoUrl: `${AWS_BASE_URL}/maths/multiplication.mp4`,
      thumbnail: null,
      description:
        "Fun songs and patterns to master the times tables from 1 to 10.",
      transcript: [
        { time: 0, text: "Multiplication is repeated addition!" },
        { time: 6, text: "3 times 4 means adding 3 four times: 3+3+3+3 = 12." },
        { time: 14, text: "Let's sing the 2 times table together." },
      ],
    },
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
      videoUrl: `${AWS_BASE_URL}/science/water-cycle.mp4`,
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
      title: "Human Body Basics",
      duration: "14:55",
      level: "Intermediate",
      videoUrl: `${AWS_BASE_URL}/science/human-body.mp4`,
      thumbnail: null,
      description:
        "Explore the organs, bones and systems that make up the human body.",
      transcript: [
        { time: 0, text: "Your body is an incredible machine!" },
        {
          time: 5,
          text: "It has many systems — the skeletal, muscular, and nervous systems.",
        },
        {
          time: 12,
          text: "The heart pumps blood throughout your entire body.",
        },
        { time: 18, text: "Your lungs bring in oxygen when you breathe." },
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
      videoUrl: `${AWS_BASE_URL}/english/alphabet-phonics.mp4`,
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
      title: "Reading Simple Sentences",
      duration: "11:20",
      level: "Beginner",
      videoUrl: `${AWS_BASE_URL}/english/reading-sentences.mp4`,
      thumbnail: null,
      description: "Build your first sentences and read short stories aloud.",
      transcript: [
        {
          time: 0,
          text: "Now that we know letters, let's build words and sentences!",
        },
        { time: 6, text: "A sentence has a subject and a verb." },
        { time: 11, text: "For example: The cat sits. The dog runs." },
        { time: 17, text: "Let's read this short story together slowly." },
      ],
    },
    {
      id: "e3",
      subject: "english",
      title: "Grammar: Nouns & Verbs",
      duration: "13:10",
      level: "Intermediate",
      videoUrl: `${AWS_BASE_URL}/english/nouns-verbs.mp4`,
      thumbnail: null,
      description:
        "Understanding the building blocks of every English sentence.",
      transcript: [
        { time: 0, text: "Grammar is the set of rules for using a language." },
        {
          time: 5,
          text: "A noun is a person, place, or thing. Dog. School. Happiness.",
        },
        { time: 12, text: "A verb is an action word. Run. Eat. Think. Dream." },
        {
          time: 18,
          text: "Every sentence needs at least one noun and one verb.",
        },
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
