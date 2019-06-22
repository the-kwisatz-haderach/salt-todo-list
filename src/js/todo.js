/* Todo app javascript */
window.onload = () => {

  if (!localStorage.listState) setInitialState();
  else {
    const state = getCurrentState();
    const list = document.getElementById('todo-list');
    state.list.forEach(({ title, description, id, completed }) => {
      const card = createCard(title, description, id, completed);
      list.append(card);
    });
  }

  const submit = document.getElementById('submit-todo');
  
  submit.onclick = event => {
    const list = document.getElementById('todo-list');
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    if (!title) return;
    else event.preventDefault();
    const id = addCardState(title, description);
    const listItem = createCard(title, description, id);
    list.append(listItem);
    const removeButtons = document.querySelectorAll('.remove-todo');
    removeButtons.forEach(button => button.addEventListener('click', removeCard));
    emptyForm();
  }

  function addCardState(cardTitle, cardDescription) {
    let state = getCurrentState();
    const cardState = {
      id: state.list.length ? state.list[state.list.length - 1].id + 1 : state.list.length,
      title: cardTitle,
      description: cardDescription,
      completed: false
    }
    state.list.push(cardState);
    localStorage.setItem('listState', JSON.stringify(state));
    return cardState.id;
  }

  function createCard(title, description, id, completed) {
    const listItem = document.createElement('LI');
    if (completed) listItem.classList.add('--marked');
    listItem.addEventListener('click', markAsDone);
    listItem.setAttribute('id', id);
    let card = `<div>`;
    card += `<h3>${title}</h3>`;
    card += `<p>${description}</p>`;
    card += `<button class="remove-todo" type="button">Remove item</button>`;
    card += `</div>`;
    listItem.innerHTML = card;
    return listItem;
  }

  function markAsDone(event) {
    if (event.target.type === 'button') return;
    const listItem = event.currentTarget;
    const list = listItem.parentNode;
    listItem.classList.toggle('--marked');
    const state = getCurrentState();
    state.list = state.list.map(elem => {
      if (elem.id === parseInt(listItem.id)) elem.completed = !elem.completed;
      return elem;
    });
    localStorage.setItem('listState', JSON.stringify(state));

    if (listItem.classList.contains('--marked')) {
      list.removeChild(listItem);
      list.append(listItem);
    } else {
      list.insertAdjacentElement('afterbegin', listItem);
    }
  }

  function removeCard(event) {
    let state = getCurrentState();
    const elem = event.currentTarget;
    const listItem = elem.parentElement.parentElement;
    const newStateList = state.list.filter(elem => elem.id !== parseInt(listItem.id));
    state.list = newStateList;
    localStorage.setItem('listState', JSON.stringify(state));
    listItem.parentNode.removeChild(listItem);
  }

  window.removeCard = removeCard;

  function getCurrentState() {
    let stateObj = JSON.parse(localStorage.getItem('listState'));
    return stateObj;
  }
  
  function setInitialState() {
    let stateObj = JSON.stringify({ list: [] });
    localStorage.setItem('listState', stateObj);
  }
  
  function emptyForm() {
    const inputElements = document.querySelectorAll('INPUT');
    inputElements.forEach(elem => elem.value = '');
  }
}
