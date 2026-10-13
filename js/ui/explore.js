// The Explore tab: filters, markers on the map, and the results lists.

// Everything the screen shows comes from this one object.
const appState = {
  moods: [],
  places: [],
  events: [],
  friends: [],
  selectedMoodIds: new Set(),
  selectedLevels: new Set(),      // interaction colors (1-4)
  selectedCategories: new Set(),  // place categories
  sortMode: 'match'               // 'match' | 'nearest' | 'name'
};

// 'p3' (place id 3) or 'e2' (event id 2) -> its Leaflet marker. A Map gives instant lookup.
const markerById = new Map();

// ---------- Drawing the Explore tab ----------

function renderExplore(openNearbyPopups = false) {
  clearPlaceMarkers();
  markerById.clear();

  const moodPreferences = getSelectedMoodPreferences();
  const visiblePlaces = filterPlaces(appState.places, appState.selectedCategories, appState.selectedLevels)
    .map(place => ({
      ...place,
      score: moodPreferences.length ? getBestScore(place, moodPreferences) : null,
      distanceKm: userLocation ? haversineKm(userLocation[0], userLocation[1], place.lat, place.lng) : null
    }));

  visiblePlaces.forEach(place => markerById.set('p' + place.id, createPlaceMarker(place)));

  renderPlaceList(visiblePlaces, moodPreferences.length > 0);
  renderEventList();

  if (openNearbyPopups) showNearbyPopups(visiblePlaces);
}

// The moods the user picked, as { noise, crowd, social } preferences.
function getSelectedMoodPreferences() {
  return appState.moods
    .filter(mood => appState.selectedMoodIds.has(mood.id))
    .map(mood => ({ noise: mood.pref_noise, crowd: mood.pref_crowd, social: mood.pref_social }));
}

// With several moods selected, a place keeps its best score among them.
function getBestScore(place, moodPreferences) {
  return Math.max(...moodPreferences.map(mood => calculateMatchScore(place, mood)));
}

function renderPlaceList(places, hasMood) {
  const sortMode = appState.sortMode;
  let listed;
  let heading;

  if (sortMode === 'nearest' && userLocation) {
    listed = mergeSort(places, compareByDistanceNearFirst);   // merge sort by distance
    heading = 'Nearest places';
  } else if (sortMode === 'match' && hasMood) {
    listed = getTopK(places, RESULT_LIMIT, place => place.score); // min-heap top K by score
    heading = 'Best matches';
  } else {
    // Every other case falls back to A to Z (also a merge sort).
    listed = mergeSort(places, compareByName);
    if (sortMode === 'nearest') heading = 'Places A to Z (tap "My location" to sort by distance)';
    else if (sortMode === 'match') heading = 'Places (pick a mood to rank them)';
    else heading = 'Places (A to Z)';
  }

  byId('placesHeading').textContent = heading;
  byId('placeList').innerHTML = listed.map(place => {
    const level = INTERACTION_LEVELS[place.social_level];
    const distanceText = place.distanceKm == null ? '' : ` · ${formatDistance(place.distanceKm)} away`;
    const scoreBadge = place.score == null ? '' : `<span class="score">${place.score}%</span>`;
    return `<li data-key="p${place.id}" data-place-id="${place.id}">
      ${scoreBadge}<span class="level-dot" style="background:${level.color}"></span>${escapeHtml(place.name)}
      <span class="meta">${escapeHtml(place.category)} · ${level.label}${distanceText}</span></li>`;
  }).join('') || '<li class="empty">No places match. Try resetting filters.</li>';
}

function renderEventList() {
  const showEvents = byId('showEvents').checked;
  const events = showEvents
    ? appState.events.filter(event => appState.selectedLevels.size === 0 || appState.selectedLevels.has(event.social_level))
    : [];

  events.forEach(event => markerById.set('e' + event.id, createEventMarker(event)));

  byId('eventsHeading').hidden = !showEvents;
  byId('eventList').hidden = !showEvents;
  byId('eventList').innerHTML = events.map(event =>
    `<li data-key="e${event.id}">${escapeHtml(event.title)}
      <span class="meta">${new Date(event.event_date).toLocaleDateString()} · ${INTERACTION_LEVELS[event.social_level].label}</span></li>`
  ).join('') || '<li class="empty">No events match.</li>';
}

// After a filter change, open details popups for up to 6 visible places within 2 km
// of your location (or of the map center when your location is unknown).
let nearbyPopups = [];
function showNearbyPopups(places) {
  nearbyPopups.forEach(popup => map.removeLayer(popup));
  nearbyPopups = [];

  const center = userLocation || [map.getCenter().lat, map.getCenter().lng];
  const withDistance = places.map(place => ({
    place, km: haversineKm(center[0], center[1], place.lat, place.lng)
  }));
  const nearest = mergeSort(withDistance.filter(item => item.km <= 2), (a, b) => a.km - b.km).slice(0, 6);

  nearest.forEach(({ place }) => {
    const marker = markerById.get('p' + place.id);
    if (!marker) return;
    const popup = L.popup({ autoClose: false, closeOnClick: false, offset: [0, -6], maxWidth: 220 })
      .setLatLng([place.lat, place.lng])
      .setContent(marker.getPopup().getContent())
      .addTo(map);
    nearbyPopups.push(popup);
  });
}

// ---------- Moving the map to a place ----------

// Fly to a place and open its popup. `record` adds it to the "recently viewed" stack.
function focusPlace(placeId, record = true) {
  let marker = markerById.get('p' + placeId);
  if (!marker) {          // the place is hidden by a filter, so clear the filters first
    resetFilters(false);
    marker = markerById.get('p' + placeId);
  }
  if (!marker) return;
  showMarkerPopup(marker);
  if (record) recordPlaceView(placeId);
}

function focusEvent(eventId) {
  const marker = markerById.get('e' + eventId);
  if (marker) showMarkerPopup(marker);
}

// ---------- Building the controls ----------

function buildExploreControls() {
  byId('moodButtons').innerHTML = appState.moods.map(mood =>
    `<button data-value="${mood.id}" aria-pressed="false">${escapeHtml(mood.emoji)} ${escapeHtml(mood.name)}</button>`).join('');

  byId('levelButtons').innerHTML = Object.entries(INTERACTION_LEVELS).map(([level, info]) =>
    `<button data-value="${level}" style="border-left-color:${info.color}" aria-pressed="false">${info.label}</button>`).join('');

  const categories = [...new Set(appState.places.map(place => place.category))].sort();
  byId('categoryButtons').innerHTML = categories.map(category =>
    `<button data-value="${escapeHtml(category)}" aria-pressed="false">${escapeHtml(category)}</button>`).join('');

  wireToggleButtons('moodButtons', appState.selectedMoodIds, true);
  wireToggleButtons('levelButtons', appState.selectedLevels, true);
  wireToggleButtons('categoryButtons', appState.selectedCategories, false);

  byId('showEvents').onchange = () => renderExplore(true);
  byId('resetFilters').onclick = () => resetFilters(true);

  byId('sortMode').onchange = event => {
    appState.sortMode = event.target.value;
    renderExplore();
  };

  byId('locateBtn').onclick = async () => {
    try {
      await locateUser();
      map.flyTo(userLocation, 15);
      showStatus('Location found. Distances are now shown.');
      renderExplore();
    } catch (error) {
      showStatus(error.message);
    }
  };

  byId('placeList').onclick = event => {
    const item = event.target.closest('li[data-place-id]');
    if (item) focusPlace(+item.dataset.placeId);
  };
  byId('eventList').onclick = event => {
    const item = event.target.closest('li[data-key]');
    if (item) focusEvent(+item.dataset.key.slice(1));
  };
  byId('routeClear').onclick = clearRoute;
}

// Clicking a button adds/removes its value in the matching Set, then redraws.
function wireToggleButtons(containerId, selectedSet, valueIsNumber) {
  byId(containerId).addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const value = valueIsNumber ? +button.dataset.value : button.dataset.value;
    toggleInSet(selectedSet, value);
    button.setAttribute('aria-pressed', selectedSet.has(value));
    renderExplore(true);
  });
}

function resetFilters(openNearbyPopups) {
  appState.selectedMoodIds.clear();
  appState.selectedLevels.clear();
  appState.selectedCategories.clear();
  document.querySelectorAll('#moodButtons button, #levelButtons button, #categoryButtons button')
    .forEach(button => button.setAttribute('aria-pressed', 'false'));
  renderExplore(openNearbyPopups);
}
