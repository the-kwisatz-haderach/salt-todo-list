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
    todoElement.classList.add(`list-item--${state}`);
    todoElement.id = id;

    let todoHtml = '';
    todoHtml += `<h3 class="list-item__heading">${title}</h3>`;
    todoHtml += description ? `<p class="list-item__description">${description}</p>` : '';
    todoHtml += '<div class="list-item__bottom">';
    todoHtml += `<time class="list-item__timestamp" datetime="${createdAt}">Created ${createdAt}</time>`;
    todoHtml += state === 'done' ? '<button class="button--red" type="button">Delete</button>' : '';
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

    creationSection.innerHTML = `
    <form id="create-todo" autocomplete="off">
        <fieldset>
          <legend>Create new list item</legend>
          <label for="title">Title</label>
          <input id="title" type="text" name="title" required />
          <label for="description">Description</label>
          <input id="description" type="text" name="description" />
          <button class="button--green" type="submit" form="create-todo">Add item</button>
        </fieldset>
      </form>`;

    presentationSection.innerHTML = `
    <div class="filter-menu">
      <div class="filter">
        <label class="filter__label" for="sort-order">Sort order:</label> 
        <select class="filter__dropdown" id="sort-order">
        ${sortOrder === 'ascending'
    ? `<option value="ascending">Ascending</option>
      <option value="descending">Descending</option>`
    : `<option value="descending">Descending</option>
        <option value="ascending">Ascending</option>`}
        </select>
      </div>
      <button class="button" type="button" onclick="clearAll();">Clear</button>
    </div>
    <ul class="todo-list" id="todo-list"></ul>
    <ul class="todo-list" id="completed-list"></ul>`;
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
    if (target.classList.contains('button--red')) {
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
