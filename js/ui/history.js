// "Recently viewed" with a Back button, powered by the Stack (data-structures/stack.js).
// Each place you open is pushed on the stack. Back pops the current place and
// returns to the one underneath (last in, first out).
const viewHistory = new Stack();

function recordPlaceView(placeId) {
  if (viewHistory.peek() !== placeId) {   // do not push the same place twice in a row
    viewHistory.push(placeId);
  }
  renderHistory();
}

function goBackToPreviousPlace() {
  if (viewHistory.size <= 1) return;      // nothing underneath the current place
  viewHistory.pop();                       // drop the place we are looking at
  focusPlace(viewHistory.peek(), false);   // show the previous one (already on the stack)
  renderHistory();
}

function renderHistory() {
  const recent = viewHistory.toArrayNewestFirst().slice(0, 5);
  byId('historyBox').hidden = recent.length === 0;
  byId('historyBack').disabled = viewHistory.size <= 1;
  byId('historyList').innerHTML = recent.map(placeId => {
    const place = appState.places.find(p => p.id === placeId);
    return `<li data-place-id="${placeId}">${escapeHtml(place.name)}</li>`;
  }).join('');
}

function initHistory() {
  byId('historyBack').onclick = goBackToPreviousPlace;
  byId('historyList').onclick = event => {
    const item = event.target.closest('li[data-place-id]');
    if (item) focusPlace(+item.dataset.placeId);
  };
}
