/* Todo app javascript */
window.onload = () => {

  buildHtml();
  
  if (!localStorage.todoList) setInitialState();
  else populateDom();

  function populateDom() {
    clearListsHtml();
    const { items, sortOrder } = getTodoList();
    
    items
      .sortByProperty('timestamp', sortOrder)
      .forEach(({ title, description, id, state, timestamp }) => {
        const todoElement = createTodoElement(title, description, id, state, timestamp);
        addToDom(todoElement, state);
    });
  }

  const form = document.getElementById('create-todo');
  document.getElementById('sort-order').onchange = changeSortOrder;
  
  form.onsubmit = event => {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    if (!title) return;
    
    event.preventDefault();
    createTodo(title, description);
    populateDom();
    resetForm();
  }

  function addToDom(item, state) {
    const todoListElement = document.getElementById('todo-list');
    const completedListElement = document.getElementById('completed-list');
    const { sortOrder } = getTodoList();
    const placement = sortOrder === 'ascending' ? 'beforeend' : 'beforeend';
    if (state === 'done') completedListElement.insertAdjacentElement(placement, item);
    else todoListElement.insertAdjacentElement(placement, item);
  }

  function createTodo(todoTitle, todoDescription) {
    const todoList = getTodoList();
    const { items } = todoList;
    
    const todo = {
      id: items.length ? items[items.length - 1].id + 1 : 0,
      title: todoTitle,
      description: todoDescription,
      state: 'active',
      timestamp: Date.now()
    }

    items.push(todo);
    localStorage.setItem('todoList', JSON.stringify(todoList));
  }

  function createTodoElement(title, description, id, state, timestamp) {
    timestamp = new Date(timestamp).toUTCString();
    // timestamp = new Date().toDateString();
    console.log('fix me');

    const todoElement = document.createElement('LI');
    todoElement.classList.add(`--${state}`);
    todoElement.addEventListener('click', handleTodoClick);
    todoElement.id = id;

    let todoHtml = '';
    todoHtml += `<div>`;
    todoHtml += `<h3>${title}</h3>`;
    todoHtml += description ? `<p>${description}</p>` : '';
    todoHtml += `<button class="remove-todo" type="button">Remove item</button>`;
    todoHtml += `<time datetime="${timestamp}">Created ${timestamp}</time>`;
    todoHtml += `</div>`;
    todoElement.innerHTML = todoHtml;

    return todoElement;
  }

  function handleTodoClick({ target, currentTarget }) {
    if (target.classList.contains('remove-todo')) {
      const todo = firstAncestorOfType(target, 'li');
      removeTodo(todo);
    } else {
      const todo = currentTarget;
      todo.classList.toggle('--done');
      console.log('FIX ME / CSS');
      if (todo.classList.contains('--done')) markAsDone(todo);
      else makeActive(todo);
    }
  }

  function changeSortOrder({ currentTarget }) {
    todoList = getTodoList();
    todoList.sortOrder = currentTarget.value;
    localStorage.setItem('todoList', JSON.stringify(todoList));
    populateDom();
  }

  function makeActive(todo) {
    updateTodoState(todo.id, 'active');
    populateDom();
  }
  
  function markAsDone(todo) {
    updateTodoState(todo.id, 'done');
    populateDom();
  }

  function updateTodoState(id, newState = 'active') {
    const todoList = getTodoList();
    todoList.items = todoList.items.map(item => {
      if (item.id === parseInt(id)) item.state = newState;
      return item;
    });
    localStorage.setItem('todoList', JSON.stringify(todoList));
  }
  
  function removeTodo(todo) {
    const todoList = getTodoList();
    todoList.items = todoList.items.filter(elem => elem.id !== parseInt(todo.id));
    localStorage.setItem('todoList', JSON.stringify(todoList));
    todo.parentElement.removeChild(todo);
  }

  function clearAll() {
    const todoList = getTodoList();
    todoList.items = [];
    localStorage.setItem('todoList', JSON.stringify(todoList));
    clearListsHtml();
  }
  
  window.clearAll = clearAll;

  function clearListsHtml() {
    const todoList = document.getElementById('todo-list');
    const completedList = document.getElementById('completed-list');
    todoList.innerHTML = '';
    completedList.innerHTML = '';
  }

  function getTodoList() {
    let stateObj = JSON.parse(localStorage.getItem('todoList'));
    return stateObj;
  }
  
  function setInitialState() {
    let stateObj = JSON.stringify({ items: [], sortOrder: 'descending' });
    localStorage.setItem('todoList', stateObj);
  }
  
  function resetForm() {
    const inputElements = document.querySelectorAll('INPUT');
    inputElements.forEach(elem => elem.value = '');
  }

  function buildHtml() {
    const presentationSection = document.getElementById('todo-presentation');
    const creationSection = document.getElementById('todo-creation');
    const sortOrder = getTodoList() ? getTodoList().sortOrder : undefined;

    presentationSection.innerHTML =
      `<h2>My todo items</h2>
      <label for="sort-order">Sort order</label> 
      <select id="sort-order">
        ${ sortOrder === 'ascending' 
        ? `<option value="ascending">Ascending</option>
          <option value="descending">Descending</option>` 
        : `<option value="descending">Descending</option>
          <option value="ascending">Ascending</option>` }
      </select>
      <button type="button" onclick="clearAll();">Clear all</button>
      <ul id="todo-list"></ul>
      <h2>My completed items</h2>
      <ul id="completed-list"></ul>`;

    creationSection.innerHTML =
      `<form id="create-todo" autocomplete="off">
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
}

function firstAncestorOfType(elem, ancestorType) {
  let ancestorFound = false;
  while (!ancestorFound) {
    if (!elem.parentElement) {
      console.error(`${elem.nodeName} element doesn\'t have an ancestor of type ${ancestorType}.`);
      break;
    }
    else if (elem.parentElement.nodeName.toLowerCase() === ancestorType.toLowerCase()) {
      ancestorFound = !ancestorFound;
      return elem.parentElement;
    } 
    elem = elem.parentElement;
  }
}

function sortByProperty(property, order) {
  switch (order) {
    case 'descending':
      return this.sort((curr, next) => 
          curr[property] > next[property] ? 1 
        : curr[property] < next[property] ? -1 
        : 0);
    case 'ascending':
      return this.sort((curr, next) => 
          curr[property] > next[property] ? -1 
        : curr[property] < next[property] ? 1 
        : 0);
  }
}

Array.prototype.sortByProperty = sortByProperty;