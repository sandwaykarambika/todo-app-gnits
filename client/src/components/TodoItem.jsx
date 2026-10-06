
function TodoItem({ todo, onUpdate, onDelete }) {
  const handleToggle = () => {
    onUpdate(todo._id, {
      completed: !todo.completed,
    });
  };

  const handleDelete = () => {
    onDelete(todo._id);
  };

  return (
    <li className={`todo-item ${todo.completed ? "completed" : ""}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
        aria-label={
          todo.completed
            ? `Mark "${todo.title}" as not done`
            : `Mark "${todo.title}" as done`
        }
      />

      <div className="todo-text">
        <span className="title">{todo.title}</span>

        <span className="meta">
          Added{" "}
          {new Date(todo.createdAt).toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>

      <div className="actions">
        <button onClick={() => onUpdate(todo._id, { title: todo.title })}>
          Edit
        </button>

        <button className="delete" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </li>
  );
}

export default TodoItem;

