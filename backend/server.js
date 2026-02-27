import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dns from "node:dns";

// Use Google public DNS to resolve MongoDB Atlas SRV records
dns.setServers(["8.8.8.8", "8.8.4.4"]);


import behaviorRoutes from "./routes/behavior.js";
// router for test operations (start/answer/submit) – not to be confused with the
// TestSession model defined in ../models/TestSession.js
import testRoutes from "./routes/tests.js";
import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import studentRoutes from "./routes/students.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use("/api/behavior", behaviorRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/students", studentRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected..."))
  .catch(err => console.log("❌ DB Connection Error:", err));

// Health check
app.get('/', (req, res) => {
  res.send("Saahas API is running smoothly!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));