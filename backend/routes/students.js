import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const student = await User.create(req.body);
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;