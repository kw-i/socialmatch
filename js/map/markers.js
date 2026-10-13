// Builds the Leaflet markers and popups for places, events and friends.

function createPlaceMarker(place) {
  const level = INTERACTION_LEVELS[place.social_level];
  const marker = L.circleMarker([place.lat, place.lng], {
    level: place.social_level,                    // remembered so we can find the right cluster layer
    radius: 8 + (place.score ?? 50) / 20,         // better match = bigger marker
    color: '#ffffff',
    weight: 2,
    fillColor: level.color,
    fillOpacity: 0.9
  });

  marker.bindPopup(buildPlacePopup(place, level));
  marker.on('click', () => recordPlaceView(place.id));
  marker.addTo(levelLayers[place.social_level]);
  return marker;
}

function buildPlacePopup(place, level) {
  const matchLine = place.score == null ? '' : `Match: <b>${place.score}%</b><br>`;
  return `
    <b>${escapeHtml(place.name)}</b><br>
    ${escapeHtml(place.category)} · ${level.label}<br>
    Noise ${place.noise_level}/5 · Crowd ${place.crowd_level}/5<br>
    ${matchLine}${escapeHtml(place.description)}${buildRatingLine(place.id)}<br>
    <button class="action-btn" data-action="directions" data-lat="${place.lat}" data-lng="${place.lng}" data-name="${escapeHtml(place.name)}">Get directions</button>
    <button class="action-btn" data-action="reviews" data-place-id="${place.id}">Reviews</button>`;
}

function buildRatingLine(placeId) {
  const stats = reviewStats[placeId];
  if (!stats) return '';
  return `<br>★ ${stats.average.toFixed(1)} (${stats.count} review${stats.count > 1 ? 's' : ''})`;
}

function createEventMarker(event) {
  const icon = L.divIcon({ className: '', html: '<div class="event-mark">★</div>', iconSize: [22, 22] });
  const marker = L.marker([event.lat, event.lng], { icon, level: event.social_level });

  marker.bindPopup(`
    <b>${escapeHtml(event.title)}</b><br>
    ${new Date(event.event_date).toLocaleString()}<br>
    ${escapeHtml(event.category)} · ${INTERACTION_LEVELS[event.social_level].label}<br>
    ${escapeHtml(event.description)}<br>
    <button class="action-btn" data-action="directions" data-lat="${event.lat}" data-lng="${event.lng}" data-name="${escapeHtml(event.title)}">Get directions</button>`);
  marker.addTo(levelLayers[event.social_level]);
  return marker;
}

// Friends appear as small avatars beside the place they are at.
function showFriendsOnMap(friends, places) {
  friendLayer.clearLayers();
  friends.forEach((friend, index) => {
    const place = places.find(p => p.id === friend.place_id);
    if (!place) return;
    const offset = 0.0004 * (index % 3 + 1); // nudge so friends do not cover the place marker
    const icon = L.divIcon({
      className: '',
      iconSize: [28, 28],
      html: avatarHtml(friend.name, 'friend-pin')
    });
    L.marker([place.lat + offset, place.lng + offset], { icon })
      .bindTooltip(`${friend.name}: ${friend.status_text || ''}`)
      .addTo(friendLayer);
  });
}

function hideFriendsOnMap() {
  friendLayer.clearLayers();
}

// Leaflet stops clicks from leaving a popup, so buttons are wired when the popup opens.
map.on('popupopen', event => {
  const popup = event.popup.getElement();
  if (!popup) return;
  popup.querySelectorAll('button[data-action]').forEach(button => {
    button.onclick = () => {
      if (button.dataset.action === 'directions') {
        showRoute(+button.dataset.lat, +button.dataset.lng, button.dataset.name);
      } else if (button.dataset.action === 'reviews') {
        openReviews(+button.dataset.placeId);
      }
    };
  });
});
