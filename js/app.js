const state = { moods: [], places: [], events: [], mood: null, level: 2 };
const $ = id => document.getElementById(id);
const markers = new Map();

function currentPref() {
  const m = state.mood;
  // Mood sets noise/crowd; the social-level buttons set social interaction.
  return { noise: m ? m.pref_noise : 3, crowd: m ? m.pref_crowd : 3, social: state.level };
}

function render() {
  layer.clearLayers(); markers.clear();
  const pref = currentPref();
  const filtered = filterPlaces(state.places, {
    category: $('fCategory').value, maxNoise: +$('fNoise').value, maxCrowd: +$('fCrowd').value
  });
  const scored = filtered.map(p => ({ ...p, score: socialScore(p, pref) }));
  scored.forEach(p => markers.set('p' + p.id, addPlaceMarker(p, p.score)));

  $('results').innerHTML = topK(scored, 5).map(p =>
    `<li data-k="p${p.id}" data-lat="${p.lat}" data-lng="${p.lng}"><span class="score">${p.score}%</span>
     ${esc(p.name)}<span class="meta">${esc(p.category)} · ${LEVELS[p.social_level].label}</span></li>`).join('')
    || '<li class="empty">No places match. Loosen the filters.</li>';

  const showEv = $('fEvents').checked;
  const evs = showEv ? state.events.filter(e => Math.abs(e.social_level - state.level) <= 1) : [];
  evs.forEach(e => markers.set('e' + e.id, addEventMarker(e)));
  $('evHead').hidden = $('events').hidden = !showEv;
  $('events').innerHTML = evs.map(e =>
    `<li data-k="e${e.id}" data-lat="${e.lat}" data-lng="${e.lng}">${esc(e.title)}
     <span class="meta">${new Date(e.event_date).toLocaleDateString()} · ${LEVELS[e.social_level].label}</span></li>`).join('')
    || '<li class="empty">No events near this social level.</li>';
}

function focusItem(e) {
  const li = e.target.closest('li[data-k]'); if (!li) return;
  map.flyTo([+li.dataset.lat, +li.dataset.lng], 16);
  markers.get(li.dataset.k)?.openPopup();
}

function buildControls() {
  $('moods').innerHTML = state.moods.map(m =>
    `<button data-id="${m.id}" aria-pressed="false">${esc(m.emoji)} ${esc(m.name)}</button>`).join('');
  $('levels').innerHTML = Object.entries(LEVELS).map(([k, v]) =>
    `<button data-l="${k}" style="border-left-color:${v.color}" aria-pressed="${+k === state.level}">${v.label}</button>`).join('');
  const cats = [...new Set(state.places.map(p => p.category))].sort();
  $('fCategory').innerHTML += cats.map(c => `<option>${esc(c)}</option>`).join('');

  $('moods').onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    const same = state.mood && state.mood.id == b.dataset.id;
    state.mood = same ? null : state.moods.find(m => m.id == b.dataset.id);
    // A mood also suggests a default social level
    if (state.mood) state.level = state.mood.pref_social;
    syncButtons(); render();
  };
  $('levels').onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    state.level = +b.dataset.l; syncButtons(); render();
  };
  ['fCategory', 'fNoise', 'fCrowd', 'fEvents'].forEach(id => $(id).addEventListener('input', () => {
    $('vNoise').textContent = $('fNoise').value; $('vCrowd').textContent = $('fCrowd').value; render();
  }));
  $('results').onclick = $('events').onclick = focusItem;
}

function syncButtons() {
  document.querySelectorAll('#moods button').forEach(b =>
    b.setAttribute('aria-pressed', !!state.mood && state.mood.id == b.dataset.id));
  document.querySelectorAll('#levels button').forEach(b =>
    b.setAttribute('aria-pressed', +b.dataset.l === state.level));
}

(async function init() {
  try {
    Object.assign(state, await loadAll());
    buildControls(); render();
  } catch (err) {
    console.error(err);
    $('status').textContent = 'Could not load data. Check js/config.js and that schema.sql has been run.';
  }
})();
