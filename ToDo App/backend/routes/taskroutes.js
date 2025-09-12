const express = require("express");
const router = express.Router();

let tasks = [];

router.get("/", (req, res) => {
  res.json(tasks);
});

router.post("/", (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  const newTask = { id: Date.now(), title };
  tasks.push(newTask);
  res.json(newTask);
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  tasks = tasks.filter((task) => task.id != id);
  res.json({ success: true });
});

module.exports = router;
