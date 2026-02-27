import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    type: String,
    difficulty: Number,
    content: String,
    options: [String],
    answer: String,
    tags: [String]
});

export default mongoose.model("Question", questionSchema);