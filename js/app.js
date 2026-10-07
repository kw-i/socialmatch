const state = { moods: [], places: [], events: [], moodIds: new Set(), levels: new Set(), cats: new Set() };
const $ = id => document.getElementById(id);
const markers = new Map();

// 0.25 -> "250 m", 1.5 -> "1.5 km"
const fmtDist = km => km < 1 ? Math.round(km * 1000) + ' m' : km.toFixed(1) + ' km';

function toggle(set, v) { set.has(v) ? set.delete(v) : set.add(v); }

function render(popups) {
  layer.clearLayers(); markers.clear();
  const prefs = state.moods.filter(m => state.moodIds.has(m.id))
    .map(m => ({ noise: m.pref_noise, crowd: m.pref_crowd, social: m.pref_social }));
  const ref = refPos();                              // pinned spot, else your location
  const rad = spot ? +$('spotRadius').value : null;  // radius in km (only when a spot is pinned)

  const all = filterPlaces(state.places, { cats: state.cats, levels: state.levels }).map(p => ({
    ...p,
    // best match across all selected moods; null when no mood is selected
    score: prefs.length ? Math.max(...prefs.map(pr => socialScore(p, pr))) : null,
    dist: ref ? haversine(ref[0], ref[1], p.lat, p.lng) : null
  }));
  let shown = all.filter(p => rad == null || p.dist <= rad);
  // Nothing inside the circle: fall back to the 3 nearest places
  const fallback = !!spot && !shown.length && all.length > 0;
  if (fallback) shown = [...all].sort((a, b) => a.dist - b.dist).slice(0, 3);
  shown.forEach(p => markers.set('p' + p.id, addPlaceMarker(p, p.score)));

  const list = prefs.length ? topK(shown, 8) : [...shown].sort((a, b) => a.name.localeCompare(b.name)).slice(0, 8);
  $('resHead').textContent = fallback ? `Nothing within ${fmtDist(rad)}. Nearest places:`
    : spot ? (prefs.length ? 'Best matches near your spot' : 'Places near your spot (pick a mood to rank them)')
    : (prefs.length ? 'Best matches' : 'Places (pick a mood to rank them)');
  $('results').innerHTML = list.map(p =>
    `<li data-k="p${p.id}" data-lat="${p.lat}" data-lng="${p.lng}">
     ${p.score == null ? '' : `<span class="score">${p.score}%</span>`}${esc(p.name)}
     <span class="meta">${esc(p.category)} · ${LEVELS[p.social_level].label}${p.dist == null ? '' : ' · ' + fmtDist(p.dist) + (spot ? ' from spot' : ' away')}</span></li>`).join('')
    || '<li class="empty">No places match. Try resetting filters.</li>';

  const showEv = $('fEvents').checked;
  const evs = showEv ? state.events.filter(e => (!state.levels.size || state.levels.has(e.social_level)) &&
    (!spot || haversine(spot[0], spot[1], e.lat, e.lng) <= rad)) : [];
  evs.forEach(e => markers.set('e' + e.id, addEventMarker(e)));
  $('evHead').hidden = $('events').hidden = !showEv;
  $('events').innerHTML = evs.map(e =>
    `<li data-k="e${e.id}" data-lat="${e.lat}" data-lng="${e.lng}">${esc(e.title)}
     <span class="meta">${new Date(e.event_date).toLocaleDateString()} · ${LEVELS[e.social_level].label}</span></li>`).join('')
    || '<li class="empty">No events match.</li>';
  if (popups === true) showNearbyPopups(shown);
}

function focusItem(e) {
  const li = e.target.closest('li[data-k]'); if (!li) return;
  map.flyTo([+li.dataset.lat, +li.dataset.lng], 16);
  markers.get(li.dataset.k)?.openPopup();
}

function buildControls() {
  $('moods').innerHTML = state.moods.map(m =>
    `<button data-v="${m.id}" aria-pressed="false">${esc(m.emoji)} ${esc(m.name)}</button>`).join('');
  $('levels').innerHTML = Object.entries(LEVELS).map(([k, v]) =>
    `<button data-v="${k}" style="border-left-color:${v.color}" aria-pressed="false">${v.label}</button>`).join('');
  $('cats').innerHTML = [...new Set(state.places.map(p => p.category))].sort().map(c =>
    `<button data-v="${esc(c)}" aria-pressed="false">${esc(c)}</button>`).join('');

  const wire = (id, set, num) => $(id).addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    toggle(set, num ? +b.dataset.v : b.dataset.v);
    b.setAttribute('aria-pressed', set.has(num ? +b.dataset.v : b.dataset.v));
    render(true);
  });
  wire('moods', state.moodIds, true);
  wire('levels', state.levels, true);
  wire('cats', state.cats, false);

  $('fEvents').onchange = () => render(true);
  $('reset').onclick = () => {
    [state.moodIds, state.levels, state.cats].forEach(s => s.clear());
    document.querySelectorAll('#moods button,#levels button,#cats button').forEach(b => b.setAttribute('aria-pressed', 'false'));
    render(true);
  };
  $('results').onclick = $('events').onclick = focusItem;
  $('rClear').onclick = clearRoute;
}

(async function init() {
  try {
    Object.assign(state, await loadAll());
    await loadReviews();
    buildControls(); render(); initSocial(); initSpot();
  } catch (err) {
    console.error(err);
    $('status').textContent = 'Could not load data: ' + (err.message || JSON.stringify(err));
  }
})();