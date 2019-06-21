/* Todo app javascript */
window.onload = () => {
  
  const state = getCurrentState();

  const submit = document.getElementById('submit-todo');
  
  submit.onclick = () => {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const list = document.getElementById('todo-list');
    const listItem = createCard(title, description);
    updateState(title, description);
    emptyForm();
    list.append(listItem);
  }

  function updateState(cardTitle, cardDescription) {
    const cardState = {
      title: cardTitle,
      description: cardDescription,
      active: true
    }
    const listState = getCurrentState().list;
    listState.push(cardState);
    // localStorage.setItem(state, { cardState });
  }

  function createCard(title, description) {
    const listItem = document.createElement('LI');
    let card = '<div>';
    card += '<h3>' + title + '</h3>';
    card += '<p>' + description + '</p>';
    card += '<button id="remove-todo" type="button" onclick="removeItem(this);">Remove item</button>'
    card += '</div>';
    listItem.innerHTML = card;
    return listItem;
  }

  function removeItem(elem) {
    list.removeChild(elem.parentElement.parentElement);
  }

  window.removeItem = removeItem;

  function emptyForm() {
    const inputElements = document.querySelectorAll('INPUT');
    inputElements.forEach(elem => elem.value = '');
  }

  function getCurrentState() {
    let stateObj;
    if (!localStorage.length) {
      stateObj = { list: [] };
      stateObj = JSON.stringify(stateObj);
      localStorage.setItem('listState', stateObj);
    } else {
      stateObj = localStorage.getItem('listState');
      stateObj = JSON.parse(stateObj);
    }
    return stateObj;
  }  
}
