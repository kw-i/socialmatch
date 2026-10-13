// Place search with autocomplete, powered by the Trie (data-structures/trie.js).
let placeTrie = null;

function initSearch() {
  // Build the Trie once from every place name.
  placeTrie = new Trie();
  appState.places.forEach(place => placeTrie.insertPlace(place));

  const input = byId('searchInput');
  input.addEventListener('input', showSearchSuggestions);
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      const first = findMatchingPlaces(input.value)[0];
      if (first) chooseSearchResult(first);
    }
  });
  byId('searchResults').addEventListener('click', event => {
    const item = event.target.closest('li[data-place-id]');
    if (!item) return;
    chooseSearchResult(appState.places.find(place => place.id === +item.dataset.placeId));
  });
}

// Every typed word must be the start of a word in the place name ("public pla" finds
// "Bacolod Public Plaza"). We look up each word in the Trie and keep the places found by all words.
function findMatchingPlaces(text) {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  let matches = placeTrie.searchPrefix(words[0]);
  for (const word of words.slice(1)) {
    const idsForWord = new Set(placeTrie.searchPrefix(word).map(place => place.id));
    matches = matches.filter(place => idsForWord.has(place.id));
  }
  return mergeSort(matches, compareByName);
}

function showSearchSuggestions() {
  const text = byId('searchInput').value;
  const list = byId('searchResults');

  if (!text.trim()) {
    list.hidden = true;
    return;
  }

  const matches = findMatchingPlaces(text).slice(0, 6);
  list.innerHTML = matches.map(place => {
    const level = INTERACTION_LEVELS[place.social_level];
    return `<li data-place-id="${place.id}"><span class="level-dot" style="background:${level.color}"></span>
      ${escapeHtml(place.name)} <span class="meta">${escapeHtml(place.category)} · ${level.label}</span></li>`;
  }).join('') || '<li class="empty">No places found</li>';
  list.hidden = false;
}

function chooseSearchResult(place) {
  byId('searchInput').value = place.name;
  byId('searchResults').hidden = true;
  focusPlace(place.id);
}
