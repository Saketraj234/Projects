import "../App.css";

function TaskList({ tasks, deleteTask, toggleTask }) {
  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li
          key={task._id}
          className={`task-item ${task.completed ? "completed" : ""}`}
        >
          <span onClick={() => toggleTask(task._id, task.completed)}>
            {task.title}
          </span>
          <button
            className="delete-button"
            onClick={() => deleteTask(task._id)}
          >
            ❌
          </button>
        </li>
      ))}
    </ul>
  );
}

export default TaskList;
