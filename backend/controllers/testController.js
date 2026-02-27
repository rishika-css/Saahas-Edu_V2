import Question from "../models/Questions.js";
import TestSession from "../models/TestSession.js";
// Student model was referenced here originally but we use the existing User model instead
import User from "../models/User.js"; // your existing model


export const startTest = async (req, res) => {
  try {
    const { studentId } = req.body;

    // Validate student exists
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ error: "Student not found" });

    // Pick 10 random questions
    const questions = await Question.aggregate([{ $sample: { size: 10 } }]);
    if (questions.length === 0) return res.status(404).json({ error: "No questions found in database" });

    const questionIds = questions.map((q) => q._id);

    // Create session
    const session = await TestSession.create({
      studentId,
      questions: questionIds,
      timeAlloted: 60,
      timeRemaining: 60,
    });

    res.json({
      sessionId: session._id,
      totalQuestions: questions.length,
      timeAlloted: session.timeAlloted,
      firstQuestion: questions[0],
      questionIndex: 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const nextQuestion = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { currentIndex } = req.query;

    const session = await TestSession.findById(sessionId).populate("questions");
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.status !== "in_progress") return res.status(400).json({ error: "Session is not active" });

    const index = parseInt(currentIndex) || 0;
    if (index >= session.questions.length) {
      return res.json({ done: true });
    }

    res.json({
      question: session.questions[index],
      questionIndex: index,
      totalQuestions: session.questions.length,
      timeRemaining: session.timeRemaining
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const answerQuestion = async (req, res) => {
  try {
    const { sessionId, questionId, selected, timeSpent } = req.body;

    const session = await TestSession.findById(sessionId).populate("questions");
    if (!session) return res.status(404).json({ error: "Session not found" });

    const question = session.questions.find((q) => q._id.toString() === questionId);
    if (!question) return res.status(404).json({ error: "Question not found in session" });

    const isCorrect = selected === question.answer;

    // Check if answer already exists and update, otherwise push
    const existingAnswer = session.answers.find((a) => a.questionId.toString() === questionId);
    if (existingAnswer) {
      existingAnswer.selected = selected;
      existingAnswer.isCorrect = isCorrect;
      existingAnswer.timeSpent = timeSpent || 0;
    } else {
      session.answers.push({ questionId, selected, isCorrect, timeSpent: timeSpent || 0 });
    }

    await session.save();

    res.json({ success: true, isCorrect });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const submitTest = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await TestSession.findById(sessionId).populate("questions");
    if (!session) return res.status(404).json({ error: "Session not found" });

    // Calculate score
    const correct = session.answers.filter((a) => a.isCorrect).length;
    const total = session.questions.length;
    const score = Math.round((correct / total) * 100);

    // Build detailed results
    const results = session.questions.map((q) => {
      const answer = session.answers.find((a) => a.questionId.toString() === q._id.toString());
      return {
        question: q.content,
        options: q.options,
        correct: q.answer,
        selected: answer ? answer.selected : "Not answered",
        isCorrect: answer ? answer.isCorrect : false,
        timeSpent: answer ? answer.timeSpent : 0
      };
    });

    session.score = score;
    session.status = "completed";
    session.completedAt = new Date();
    await session.save();

    res.json({
      score,
      correct,
      total,
      results,
      behaviorSummary: session.behaviorSummary,
      timeAlloted: session.timeAlloted,
      timeRemaining: session.timeRemaining
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};  