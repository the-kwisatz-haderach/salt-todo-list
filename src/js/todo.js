/* Todo app javascript */
window.onload = () => {

  buildHtml();
  
  if (!localStorage.todoList) setInitialState();
  else populateDom();

  function populateDom() {
    const todoList = getTodoList();
    todoList.items.forEach(({ title, description, id, state }) => {
      const todoElement = createTodoElement(title, description, id, state);
      addToDom(todoElement, state);
    });
  }

  const form = document.getElementById('create-todo');
  
  form.onsubmit = event => {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;

    if (!title) return;
    
    event.preventDefault();
    const { id } = createTodo(title, description);
    const todoElement = createTodoElement(title, description, id);
    addToDom(todoElement);
    resetForm();
  }

  function addToDom(item, state) {
    const todoListElement = document.getElementById('todo-list');
    const completedListElement = document.getElementById('completed-list');  
    if (state === 'done') completedListElement.insertAdjacentElement('afterbegin', item);
    else todoListElement.insertAdjacentElement('afterbegin', item);
  }

  function createTodo(todoTitle, todoDescription) {
    const todoList = getTodoList();
    const { items } = todoList;
    
    const todo = {
      id: items.length ? items[items.length - 1].id + 1 : 0,
      title: todoTitle,
      description: todoDescription,
      state: 'active'
    }

    items.push(todo);
    localStorage.setItem('todoList', JSON.stringify(todoList));

    return todo;
  }

  function createTodoElement(title, description, id, state) {
    const todoElement = document.createElement('LI');
    if (state === 'done') todoElement.classList.add('--marked');
    todoElement.addEventListener('click', handleTodoClick);
    todoElement.id = id;

    let todoHtml = '';
    todoHtml += `<div>`;
    todoHtml += `<h3>${title}</h3>`;
    todoHtml += description ? `<p>${description}</p>` : '';
    todoHtml += `<button class="remove-todo" type="button">Remove item</button>`;
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
      todo.classList.toggle('--marked');
      if (todo.classList.contains('--marked')) markAsDone(todo);
      else makeActive(todo);
    }
  }

  function firstAncestorOfType(elem, ancestorElemType) {
    let ancestorFound = false;
    while (!ancestorFound) {
      if (!elem.parentElement) {
        console.error(`${elem.nodeName} element doesn\'t have an ancestor of type ${ancestorElemType}.`);
        break;
      }
      else if (elem.parentElement.nodeName.toLowerCase() === ancestorElemType.toLowerCase()) {
        ancestorFound = !ancestorFound;
        return elem.parentElement;
      } 
      elem = elem.parentElement;
    }
  }

  function makeActive(todo) {
    updateTodoState(todo.id, 'active');
    todo.parentNode.removeChild(todo);
    addToDom(todo, 'active');
  }
  
  function markAsDone(todo) {
    updateTodoState(todo.id, 'done');
    todo.parentNode.removeChild(todo);
    addToDom(todo, 'done');
  }

  function updateTodoState(id, newState = 'active') {
    const todoList = getTodoList();
    let { items } = todoList;
    
    items = items.map(item => {
      if (item.id === parseInt(id)) item.state = newState;
      return item;
    });

    localStorage.setItem('todoList', JSON.stringify(todoList));
  }

  function removeTodo(todo) {
    let { items } = getTodoList();
    items = items.filter(elem => elem.id !== parseInt(todo.id));
    const newTodoList = { items: [...items] };
    localStorage.setItem('todoList', JSON.stringify(newTodoList));
    todo.parentElement.removeChild(todo);
  }

  function getTodoList() {
    let stateObj = JSON.parse(localStorage.getItem('todoList'));
    return stateObj;
  }
  
  function setInitialState() {
    let stateObj = `{"items":[]}`;
    localStorage.setItem('todoList', stateObj);
  }
  
  function resetForm() {
    const inputElements = document.querySelectorAll('INPUT');
    inputElements.forEach(elem => elem.value = '');
  }

  function buildHtml() {
    const presentationSection = document.getElementById('todo-presentation');
    const creationSection = document.getElementById('todo-creation');

    presentationSection.innerHTML =
      `<h2>My todo items</h2>
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
