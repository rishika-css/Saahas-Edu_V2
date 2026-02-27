import mongoose from "mongoose";
import dotenv from "dotenv";
import Question from "./models/Questions.js";

dotenv.config();

const sampleQuestions = [
  {
    type: "MCQ",
    difficulty: 1,
    content: "What is 5 + 3?",
    options: ["6", "7", "8", "9"],
    answer: "8",
    tags: ["math", "addition"]
  },
  {
    type: "MCQ",
    difficulty: 1,
    content: "Which animal says 'moo'?",
    options: ["Dog", "Cat", "Cow", "Duck"],
    answer: "Cow",
    tags: ["general", "animals"]
  },
  {
    type: "MCQ",
    difficulty: 1,
    content: "What color is the sky on a sunny day?",
    options: ["Green", "Blue", "Red", "Yellow"],
    answer: "Blue",
    tags: ["general", "nature"]
  },
  {
    type: "MCQ",
    difficulty: 2,
    content: "How many days are in a week?",
    options: ["5", "6", "7", "8"],
    answer: "7",
    tags: ["general", "time"]
  },
  {
    type: "MCQ",
    difficulty: 2,
    content: "What is the capital of India?",
    options: ["Mumbai", "Chennai", "Kolkata", "New Delhi"],
    answer: "New Delhi",
    tags: ["geography", "india"]
  },
  {
    type: "MCQ",
    difficulty: 2,
    content: "Which planet is closest to the Sun?",
    options: ["Earth", "Venus", "Mercury", "Mars"],
    answer: "Mercury",
    tags: ["science", "space"]
  },
  {
    type: "MCQ",
    difficulty: 2,
    content: "What is 12 × 4?",
    options: ["42", "46", "48", "52"],
    answer: "48",
    tags: ["math", "multiplication"]
  },
  {
    type: "MCQ",
    difficulty: 3,
    content: "Which gas do plants absorb from the air?",
    options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
    answer: "Carbon Dioxide",
    tags: ["science", "biology"]
  },
  {
    type: "MCQ",
    difficulty: 3,
    content: "How many sides does a hexagon have?",
    options: ["5", "6", "7", "8"],
    answer: "6",
    tags: ["math", "shapes"]
  },
  {
    type: "MCQ",
    difficulty: 3,
    content: "Which is the largest ocean on Earth?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    answer: "Pacific",
    tags: ["geography", "nature"]
  },
  {
    type: "MCQ",
    difficulty: 3,
    content: "What is the boiling point of water in Celsius?",
    options: ["90°C", "95°C", "100°C", "110°C"],
    answer: "100°C",
    tags: ["science", "chemistry"]
  },
  {
    type: "MCQ",
    difficulty: 4,
    content: "Who wrote the national anthem of India?",
    options: ["Bankim Chandra", "Rabindranath Tagore", "Mahatma Gandhi", "Jawaharlal Nehru"],
    answer: "Rabindranath Tagore",
    tags: ["general", "india"]
  },
  {
    type: "MCQ",
    difficulty: 4,
    content: "What is the square root of 144?",
    options: ["10", "11", "12", "13"],
    answer: "12",
    tags: ["math", "algebra"]
  },
  {
    type: "MCQ",
    difficulty: 4,
    content: "Which organ pumps blood in the human body?",
    options: ["Brain", "Lungs", "Kidney", "Heart"],
    answer: "Heart",
    tags: ["science", "biology"]
  },
  {
    type: "MCQ",
    difficulty: 4,
    content: "What is the chemical symbol for water?",
    options: ["WA", "H2O", "HO2", "OW"],
    answer: "H2O",
    tags: ["science", "chemistry"]
  }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    await Question.deleteMany({});
    console.log("Old questions cleared");

    await Question.insertMany(sampleQuestions);
    console.log(`✅ ${sampleQuestions.length} questions seeded successfully!`);

    mongoose.connection.close();
  } catch (err) {
    console.error("Seeding failed:", err.message);
    mongoose.connection.close();
  }
};

seed();