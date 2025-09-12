import React, { useState, useEffect } from "react";
import "./App.css";

function App() {

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (newTask.trim() === "") return;
    setTasks([...tasks, { text: newTask, completed: false }]);
    setNewTask("");
  };

  const toggleTask = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setTasks(updatedTasks);
  };

  const deleteTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
  };

  return (
    <div className="app-container">
      <h1>🌟ToDo App</h1>

      <div className="input-container">
        <input
          type="text"
          placeholder="✍ Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
        />
        <button onClick={addTask}>Add</button>
      </div>

      <ul>
        {tasks.map((task, index) => (
          <li
            key={index}
            onClick={() => toggleTask(index)}
            className={task.completed ? "completed" : ""}
          >
            <img
              src={
                task.completed
                  ? "https://cdn-icons-png.flaticon.com/512/845/845646.png" // ✅ Done
                  : "https://cdn-icons-png.flaticon.com/512/60/60740.png"   // 📌 Pending
              }
              alt="task icon"
              className="task-icon"
            />

            <span>{task.text}</span>

            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                deleteTask(index);
              }}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
