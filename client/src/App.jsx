
import { useEffect, useState } from "react";
import { getTodos, createTodo, updateTodo, deleteTodo } from "./api";
import { FILTERS } from "./filters";
import Sidebar from "./components/Sidebar";
import TodoForm from "./components/TodoForm";
import TodoItem from "./components/TodoItem";

function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const todosPerPage = 5;

  function showError(err) {
    console.error(err);
    setError(err.message);
  }

  // Load todos
  useEffect(() => {
    async function loadTodos() {
      try {
        setError("");
        const data = await getTodos();
        setTodos(data);
      } catch (err) {
        showError(err);
      } finally {
        setLoading(false);
      }
    }

    loadTodos();
  }, []);

  // Add todo
  async function handleAdd(title) {
    try {
      setError("");

      const newTodo = await createTodo(title);

      setTodos((prev) => [newTodo, ...prev]);

      // Go to first page after adding
      setCurrentPage(1);
    } catch (err) {
      showError(err);
    }
  }

  // Update todo
  async function handleUpdate(id, data) {
    try {
      setError("");

      const updated = await updateTodo(id, data);

      setTodos((prev) =>
        prev.map((todo) =>
          todo._id === id ? updated : todo
        )
      );
    } catch (err) {
      showError(err);
    }
  }

  // Delete todo
  async function handleDelete(id) {
    try {
      setError("");

      await deleteTodo(id);

      setTodos((prev) =>
        prev.filter((todo) => todo._id !== id)
      );

      // If current page becomes empty, go back one page
      setCurrentPage((page) => {
        const remainingTodos = todos.filter(
          (todo) => todo._id !== id
        );

        const remainingFiltered = remainingTodos.filter(
          FILTERS[filter].test
        );

        const newTotalPages = Math.ceil(
          remainingFiltered.length / todosPerPage
        );

        return newTotalPages === 0
          ? 1
          : Math.min(page, newTotalPages);
      });
    } catch (err) {
      showError(err);
    }
  }

  // Clear completed todos
  async function handleClearDone() {
    try {
      setError("");

      const doneTodos = todos.filter(
        (todo) => todo.completed
      );

      for (const todo of doneTodos) {
        await deleteTodo(todo._id);
      }

      setTodos((prev) =>
        prev.filter((todo) => !todo.completed)
      );

      setCurrentPage(1);
    } catch (err) {
      showError(err);
    }
  }

  // Change filter
  function handleFilterChange(newFilter) {
    setFilter(newFilter);
    setCurrentPage(1);
  }

  // Filter todos
  const filteredTodos = todos.filter(
    FILTERS[filter].test
  );

  // Calculate total pages
  const totalPages = Math.ceil(
    filteredTodos.length / todosPerPage
  );

  // Calculate which todos to display
  const startIndex =
    (currentPage - 1) * todosPerPage;

  const endIndex =
    startIndex + todosPerPage;

  const paginatedTodos = filteredTodos.slice(
    startIndex,
    endIndex
  );

  // Change page
  function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }

  const taskWord =
    filteredTodos.length === 1
      ? "task"
      : "tasks";

  // Render todo list
  function renderTodos() {
    if (loading) {
      return (
        <p className="empty">
          Loading...
        </p>
      );
    }

    if (filteredTodos.length === 0) {
      let message =
        "You're all caught up. Add a task above.";

      if (filter === "done") {
        message = "Nothing completed yet";
      }

      return (
        <div className="empty">
          <img src="/logo.png" alt="" />
          <p>{message}</p>
        </div>
      );
    }

    return (
      <>
        <ul className="todo-list">
          {paginatedTodos.map((todo) => (
            <TodoItem
              key={todo._id}
              todo={todo}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </ul>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">

            <button
              onClick={() =>
                goToPage(currentPage - 1)
              }
              disabled={currentPage === 1}
            >
              Previous
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <button
                key={page}
                onClick={() =>
                  goToPage(page)
                }
                className={
                  currentPage === page
                    ? "active"
                    : ""
                }
              >
                {page}
              </button>
            ))}

            <button
              onClick={() =>
                goToPage(currentPage + 1)
              }
              disabled={
                currentPage === totalPages
              }
            >
              Next
            </button>

          </div>
        )}
      </>
    );
  }

  return (
    <div className="layout">

      <Sidebar
        todos={todos}
        filter={filter}
        onFilter={handleFilterChange}
        onClearDone={handleClearDone}
      />

      <main className="panel content">

        <header className="content-header">

          <h2>
            {FILTERS[filter].label}
          </h2>

          <span className="content-count">
            {filteredTodos.length} {taskWord}
          </span>

        </header>

        <TodoForm
          onAdd={handleAdd}
        />

        {error && (
          <div
            className="error"
            role="alert"
          >
            <span>{error}</span>

            <button
              onClick={() =>
                setError("")
              }
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        {renderTodos()}

      </main>
    </div>
  );
}

export default App;

