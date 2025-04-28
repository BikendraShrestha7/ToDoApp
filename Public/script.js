// Fetch and display all todos
function fetchTodos() {
  fetch("/todos")
    .then((response) => response.json())
    .then((todos) => {
      const todoDisplay = document.getElementById("todoDisplay");
      // Display todos in the required format
      const formattedTodos = todos.map((todo) => {
        return `
         ID: ${todo.id} <br>
         Name: ${todo.name} <br>
         Priority: ${todo.priority} <br>
         Is Complete: ${todo.isComplete} <br>
         Is Fun: ${todo.isFun} <br><hr>
       `;
      });
      todoDisplay.innerHTML = formattedTodos.join("");
    });
}

// Event listener for displaying todos
document.getElementById("displayTodos").addEventListener("click", fetchTodos);

// Event listener for adding a new todo
document.getElementById("submitTodo").addEventListener("click", () => {
  const name = document.getElementById("todoName").value;
  const priority = document.getElementById("todoPriority").value || "low";
  const isFun = document.getElementById("todoIsFun").value === "true";

  const newTodo = { name, priority, isFun };

  fetch("/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTodo),
  })
    .then((response) => response.json())
    .then(() => {
      document.getElementById("todoName").value = "";
      document.getElementById("todoPriority").value = "";
      document.getElementById("todoIsFun").value = "";
      fetchTodos(); // Refresh the todo list
    });
});

// Event listener for deleting a todo
document.getElementById("deleteTodo").addEventListener("click", () => {
  const id = document.getElementById("todoIdToDelete").value;

  fetch(`/todos/${id}`, {
    method: "DELETE",
  }).then(() => {
    document.getElementById("todoIdToDelete").value = "";
    fetchTodos(); // Refresh the todo list
  });
});
