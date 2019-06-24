/* Todo app javascript */
function sortByProperty(arr, property, order) {
  switch (order) {
    case 'descending':
      return arr.sort((curr, next) => {
        if (curr[property] > next[property]) return 1;
        if (curr[property] < next[property]) return -1;
        return 0;
      });
    default:
      return arr.sort((curr, next) => {
        if (curr[property] > next[property]) return -1;
        if (curr[property] < next[property]) return 1;
        return 0;
      });
  }
}

window.onload = () => {
  function createInitialState() {
    const stateObj = { items: [], sortOrder: 'descending' };
    localStorage.setItem('state', JSON.stringify(stateObj));
  }

  function getState() {
    const stateObj = JSON.parse(localStorage.getItem('state'));
    return stateObj;
  }

  function getTodoState(id) {
    const { items } = getState();
    const todo = items.find(item => item.id === parseInt(id, 10));
    return todo.state;
  }

  function clearListsHtml() {
    const state = document.getElementById('todo-list');
    const completedList = document.getElementById('completed-list');
    state.innerHTML = '';
    completedList.innerHTML = '';
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

  function render() {
    clearListsHtml();
    const { items, sortOrder } = getState();

    const sortedItems = sortByProperty(items, 'timestamp', sortOrder);
    sortedItems.forEach(({
      title, description, id, state, timestamp,
    }) => {
      const todoElement = createTodoElement(title, description, id, state, timestamp);
      addToDom(todoElement, state);
    });
  }

  function removeTodo(todo) {
    const state = getState();
    state.items = state.items.filter(elem => elem.id !== parseInt(todo.id, 10));
    localStorage.setItem('state', JSON.stringify(state));
    render();
  }

  function addTodo(title, description) {
    const state = getState();
    const { items } = state;

    const todo = {
      id: items.length ? items[items.length - 1].id + 1 : 0,
      title,
      description,
      state: 'active',
      timestamp: Date.now(),
    };

    items.push(todo);
    localStorage.setItem('state', JSON.stringify(state));
    render();
  }

  function updateTodoState(id, newState = 'active') {
    const state = getState();
    state.items = state.items.map((item) => {
      if (item.id === parseInt(id, 10)) item.state = newState;
      return item;
    });
    localStorage.setItem('state', JSON.stringify(state));
    render();
  }

  function changeSortOrder({ currentTarget }) {
    const state = getState();
    state.sortOrder = currentTarget.value;
    localStorage.setItem('state', JSON.stringify(state));
    render();
  }

  function buildHtml() {
    const presentationSection = document.getElementById('todo-presentation');
    const creationSection = document.getElementById('todo-creation');
    const sortOrder = getState() ? getState().sortOrder : undefined;

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

  function clearAll() {
    const state = getState();
    state.items = [];
    localStorage.setItem('state', JSON.stringify(state));
    clearListsHtml();
  }
  window.clearAll = clearAll;

  function resetForm() {
    const inputElements = document.querySelectorAll('INPUT');
    for (let i = 0; i < inputElements.length; i += 1) {
      inputElements[i].value = '';
    }
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
  }


  buildHtml();

  if (!localStorage.state) createInitialState();
  else render();

  const sortSelector = document.getElementById('sort-order');
  sortSelector.onchange = (event) => {
    changeSortOrder(event);
  };

  const form = document.getElementById('create-todo');
  form.onsubmit = (event) => {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    if (!title) return;

    event.preventDefault();
    addTodo(title, description);
    resetForm();
  };
};
