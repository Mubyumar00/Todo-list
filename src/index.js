import '../assets/css/style.css';

const app = document.getElementById('app');

app.innerHTML = `
    <div class="todos">
        <div class="todos-header">
            <h3 class="todos-title">Todo Lsit</h3>
            <div>
                <p>You have <span class="todos-count"></span> items</p>
                <button type="button" class="todos-clear" style="display: none";>Clear Completed</button>
            </div>
        </div>
        <form class="todos-form" name="todos">
            <input type="text" placeholder="what's next?" name="todo">
        </form>
        <ul class="todos-list"></ul>
    </div>
`;

// state
let todos = JSON.parse(localStorage.getItem('todos')) || [];


// selectors
const root = document.querySelector('.todos');
const list = root.querySelector('.todos-list');
const count = root.querySelector('.todos-count');
const clear = root.querySelector('.todos-clear');
const form = document.forms.todos;
const input = form.elements.todo;

// functions 
function saveToStorage(todos) {
    localStorage.setItem('todos', JSON.stringify(todos));
}
function renderTodos(todos) {
   let todoString = '';
   todos.forEach((todo, index) => {
      todoString += `
         <li data-id="${index}"${todo.complete ? ' class="todos-complete"' : '' }>
            <input type="checkbox"${todo.complete ? ' checked' : '' }>
            <span>${todo.label}</span>
            <button type="button"></button>
         </li>
      `;
   });
   list.innerHTML = todoString;
   count.innerText = todos.filter(todo => !todo.complete).length;
   clear.style.display = todos.filter(todo => todo.complete).length ? 'block' : 'none';
}

function addTodo(e) {
  e.preventDefault();
  const label = input.value.trim();
  const complete = false;
  todos = [
    ...todos,
    {
      label,
      complete,
    },
  ];
  renderTodos(todos);
  saveToStorage(todos);
  input.value = '';
  if (!label) return; // Don't add empty todos
}

function updateTodo(e) {
   const id = parseInt(e.target.parentNode.getAttribute('data-id'), 10);
   const complete = e.target.checked;
   todos = todos.map((todo, index) => {
      if (index === id) {
         return {
            ...todo,
            complete
         };
      }
      return todo;
   });
   renderTodos(todos);
   saveToStorage(todos);
}

function editTodo(e) {
    if (e.target.nodeName.toLowerCase() !== 'span') {
        return;
    }
    const id = parseInt(e.target.parentNode.getAttribute('data-id'), 10);
    const todoLabel = todos[id].label;

    // Create an input element to edit the todo
    const input = document.createElement('input');
    input.type = 'text';
    input.value = todoLabel;

    function handleEdit(e) {
        e.stopPropagation(); // Prevent the event from bubbling up
        const label = this.value;
        if (label !== todoLabel) {
            todos = todos.map((todo, index) => {
                if(index === id) {
                    return {
                        ...todo,
                        label
                    };
                }
                return todo;
            });
            renderTodos(todos);
            saveToStorage(todos);
        }
        // clean up the input element
        e.target.style.display = ''; // show the span element after editing the todo label 
        this.removeEventListener('change', handleEdit); // Remove the event listener for the input element 
        this.remove(); // Remove the input element from the DOM
    }

    
    e.target.style.display = 'none'; // Hide the span element while editing the todo label 
    e.target.parentNode.append(input); // Append the input element to the li element
    input.addEventListener('change', handleEdit);
    input.focus();
}

function deleteTodo(e) {
    if (e.target.nodeName.toLowerCase() !== 'button') {
        return;
    }
    const id = parseInt(e.target.parentNode.getAttribute('data-id'), 10);
    const label = e.target.previousElementSibling.innerText;
    if (window.confirm(`Delete ${label}?`)) {
        todos = todos.filter((todo, index) => index !== id);
        renderTodos(todos);
        saveToStorage(todos);
    }
}

function clearCompleteTodos() {
  const count = todos.filter((todo) => todo.complete).length;
  if (count === 0) {
    return;
  }
  if (window.confirm(`Delete ${count} Todos?`)) {
    // Filter out completed todos
    todos = todos.filter((todo) => !todo.complete);
    renderTodos(todos);
    saveToStorage(todos);
  }
}

//init
function init() {
    // Render initial todos
    renderTodos(todos);
    // Add Todo
    form.addEventListener('submit', addTodo);
    // Update Todo
    list.addEventListener('change', updateTodo);
    // Edit Todo
    list.addEventListener('dblclick', editTodo);
    // Delete Todo
    list.addEventListener('click', deleteTodo);
    // Complete All Todos
    clear.addEventListener('click', clearCompleteTodos);
    
}

init();