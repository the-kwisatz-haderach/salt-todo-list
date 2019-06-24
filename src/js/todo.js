/* Todo app javascript */
window.onload = () => {
  function createInitialState() {
    const stateObj = { items: [], sortOrder: 'descending' };
    localStorage.setItem('todoList', JSON.stringify(stateObj));
  }

  function getTodoList() {
    const stateObj = JSON.parse(localStorage.getItem('todoList'));
    return stateObj;
  }

  function getTodoState(id) {
    const { items } = getTodoList();
    const todo = items.find(item => item.id === parseInt(id, 10));
    return todo.state;
  }

  function removeTodo(todo) {
    const todoList = getTodoList();
    todoList.items = todoList.items.filter(elem => elem.id !== parseInt(todo.id, 10));
    localStorage.setItem('todoList', JSON.stringify(todoList));
  }

  function createTodo(todoTitle, todoDescription) {
    const todoList = getTodoList();
    const { items } = todoList;

    const todo = {
      id: items.length ? items[items.length - 1].id + 1 : 0,
      title: todoTitle,
      description: todoDescription,
      state: 'active',
      timestamp: Date.now(),
    };

    items.push(todo);
    localStorage.setItem('todoList', JSON.stringify(todoList));
  }

  function updateTodoState(id, newState = 'active') {
    const todoList = getTodoList();
    todoList.items = todoList.items.map((item) => {
      if (item.id === parseInt(id, 10)) item.state = newState;
      return item;
    });
    localStorage.setItem('todoList', JSON.stringify(todoList));
  }

  function changeSortOrder({ currentTarget }) {
    const todoList = getTodoList();
    todoList.sortOrder = currentTarget.value;
    localStorage.setItem('todoList', JSON.stringify(todoList));
  }

  function buildHtml() {
    const presentationSection = document.getElementById('todo-presentation');
    const creationSection = document.getElementById('todo-creation');
    const sortOrder = getTodoList() ? getTodoList().sortOrder : undefined;

    presentationSection.innerHTML = `<label for="sort-order">Sort order</label> 
      <select id="sort-order">
        ${sortOrder === 'ascending'
    ? `<option value="ascending">Ascending</option>
          <option value="descending">Descending</option>`
    : `<option value="descending">Descending</option>
          <option value="ascending">Ascending</option>`}
      </select>
      <button type="button" onclick="clearAll();">Clear all</button>
      <ul id="todo-list"></ul>
      <ul id="completed-list"></ul>`;

    creationSection.innerHTML = `<form id="create-todo" autocomplete="off">
        <fieldset>
          <legend>Create new list item</legend>
          <label for="title">Title</label>
          <input id="title" type="text" name="title" placeholder="Buy eggs..." required />
          <label for="description">Description</label>
          <input id="description" type="text" name="description" placeholder="Needed for pancakes..." />
          <button type="submit" form="create-todo">Add item</button>
        </fieldset>
      </form>`;
  }

  function clearListsHtml() {
    const todoList = document.getElementById('todo-list');
    const completedList = document.getElementById('completed-list');
    todoList.innerHTML = '';
    completedList.innerHTML = '';
  }

  function clearAll() {
    const todoList = getTodoList();
    todoList.items = [];
    localStorage.setItem('todoList', JSON.stringify(todoList));
    clearListsHtml();
  }
  window.clearAll = clearAll;

  function resetForm() {
    const inputElements = document.querySelectorAll('INPUT');
    inputElements.forEach(elem => elem.value = '');
  }

  function addToDom(item, state) {
    const todoListElement = document.getElementById('todo-list');
    const completedListElement = document.getElementById('completed-list');
    item.addEventListener('click', handleTodoClick);
    if (state === 'done') completedListElement.insertAdjacentElement('afterbegin', item);
    else todoListElement.insertAdjacentElement('afterbegin', item);
  }

  function createTodoElement(title, description, id, state, timestamp) {
    const createdAt = new Date(timestamp).toDateString();

    const todoElement = document.createElement('LI');
    todoElement.classList.add(`--${state}`);
    todoElement.id = id;

    let todoHtml = '';
    todoHtml += '<div>';
    todoHtml += `<h3>${title}</h3>`;
    todoHtml += description ? `<p>${description}</p>` : '';
    todoHtml += state === 'done' ? '<button class="remove-todo" type="button">Remove item</button>' : '';
    todoHtml += `<time datetime="${createdAt}">Created ${createdAt}</time>`;
    todoHtml += '</div>';
    todoElement.innerHTML = todoHtml;

    return todoElement;
  }

  function renderNewList() {
    clearListsHtml();
    const { items, sortOrder } = getTodoList();

    items
      .sortByProperty('timestamp', sortOrder)
      .forEach(({
        title, description, id, state, timestamp,
      }) => {
        const todoElement = createTodoElement(title, description, id, state, timestamp);
        addToDom(todoElement, state);
      });
  }

  function handleTodoClick({ target, currentTarget }) {
    if (target.classList.contains('remove-todo')) {
      removeTodo(currentTarget);
    } else {
      const { id } = currentTarget;
      const todoState = getTodoState(id);
      if (todoState === 'active') updateTodoState(id, 'done');
      else updateTodoState(id, 'active');
    }
    renderNewList();
  }


  buildHtml();

  if (!localStorage.todoList) createInitialState();
  else renderNewList();

  const sortSelector = document.getElementById('sort-order');
  sortSelector.onchange = (event) => {
    changeSortOrder(event);
    renderNewList();
  };

  const form = document.getElementById('create-todo');
  form.onsubmit = (event) => {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    if (!title) return;

    event.preventDefault();

    createTodo(title, description);
    resetForm();
    renderNewList();
  };
};

function sortByProperty(property, order) {
  switch (order) {
    case 'descending':
      return this.sort((curr, next) => (curr[property] > next[property] ? 1 : curr[property] < next[property] ? -1 : 0));
    default:
      return this.sort((curr, next) => (curr[property] > next[property] ? -1 : curr[property] < next[property] ? 1 : 0));
  }
}

Array.prototype.sortByProperty = sortByProperty;
