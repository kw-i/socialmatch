// Profile, friends, reviews and About tab.
const REV = { list: [], pid: null };
let profile = JSON.parse(localStorage.getItem('sm_profile') || 'null') || { ...DUMMY_PROFILE, share: true };
const initials = n => n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
const hue = n => [...n].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
const avatar = n => `<span class="avatar" style="background:hsl(${hue(n)} 55% 40%)">${esc(initials(n))}</span>`;

async function loadReviews() {
  try {
    const { data, error } = await db.from('reviews').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    REV.list = data;
    for (const k in reviewStats) delete reviewStats[k];
    data.forEach(r => { const s = reviewStats[r.place_id] ||= { n: 0, sum: 0, avg: 0 }; s.n++; s.sum += r.rating; s.avg = s.sum / s.n; });
  } catch (e) { $('status').textContent = 'Reviews unavailable (run social.sql): ' + e.message; }
}

function renderReviews() {
  const pid = REV.pid, s = reviewStats[pid];
  $('revAvg').textContent = s ? `★ ${s.avg.toFixed(1)} · ${s.n} review${s.n > 1 ? 's' : ''}` : 'No reviews yet. Be the first!';
  $('revList').innerHTML = REV.list.filter(r => r.place_id === pid).map(r =>
    `<li>${avatar(r.author)} <b>${esc(r.author)}</b> ${'★'.repeat(r.rating)}<span class="meta">${new Date(r.created_at).toLocaleDateString()}</span>${esc(r.body)}</li>`).join('');
}
function openReviews(pid) {
  REV.pid = pid;
  $('revTitle').textContent = state.places.find(p => p.id === pid).name;
  renderReviews(); $('revDlg').showModal();
}
async function postReview() {
  const { error } = await db.from('reviews').insert({
    place_id: REV.pid, author: profile.name, rating: +$('revRating').value, body: $('revText').value.trim() });
  if (error) { $('status').textContent = 'Could not post review: ' + error.message; return; }
  $('revText').value = ''; await loadReviews(); renderReviews(); render();
}

function renderFriends() {
  $('tab-friends').innerHTML = '<h2>Friends <small>(demo contacts)</small></h2><ul id="fList">' + DUMMY_CONTACTS.map((c, i) =>
    `<li class="card">${avatar(c.name)}<div><b>${esc(c.name)}</b> <span class="meta">${esc(c.handle)} · feeling ${esc(c.mood)}</span>
     <span class="meta">"${esc(c.status)}"</span>
     <button class="link" data-at="${esc(c.at)}">📍 ${esc(c.at)}</button> <button class="link" data-wave="${i}">👋 Wave</button></div></li>`).join('') + '</ul>';
  $('fList').onclick = e => {
    if (e.target.dataset.wave != null) e.target.textContent = '✔ Waved';
    const p = state.places.find(x => x.name === e.target.dataset.at), m = p && markers.get('p' + p.id);
    if (m) { map.flyTo([p.lat, p.lng], 16); layer.zoomToShowLayer(m, () => m.openPopup()); }
  };
}

function renderProfile() {
  const cats = [...new Set(state.places.map(p => p.category))].sort();
  $('tab-profile').innerHTML = `<div class="card">${avatar(profile.name)}<div><b>${esc(profile.name)}</b><span class="meta">${esc(profile.handle)}</span></div></div>
  <label>Display name <input id="pfName" value="${esc(profile.name)}" maxlength="30"></label>
  <label>Bio <textarea id="pfBio" rows="2" maxlength="120">${esc(profile.bio)}</textarea></label>
  <label>Usual mood <select id="pfMood">${state.moods.map(m => `<option ${m.name === profile.mood ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select></label>
  <h2>Preferred places</h2><div id="pfCats" class="chips">${cats.map(c => `<button data-v="${esc(c)}" aria-pressed="${profile.cats.includes(c)}">${esc(c)}</button>`).join('')}</div>
  <label class="check"><input id="pfShare" type="checkbox" ${profile.share ? 'checked' : ''}> Share my mood with friends</label>
  <button id="pfSave" class="dirbtn">Save profile</button> <button id="pfApply" class="link">Apply my preferences to the map</button>`;
  $('pfCats').onclick = e => { const b = e.target.closest('button'); if (b) b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); };
  const read = () => {
    profile = { ...profile, name: $('pfName').value.trim() || profile.name, bio: $('pfBio').value, mood: $('pfMood').value,
      share: $('pfShare').checked, cats: [...document.querySelectorAll('#pfCats button[aria-pressed=true]')].map(b => b.dataset.v) };
    localStorage.setItem('sm_profile', JSON.stringify(profile));
  };
  $('pfSave').onclick = () => { read(); renderProfile(); $('status').textContent = 'Profile saved'; setTimeout(() => $('status').textContent = '', 2000); };
  $('pfApply').onclick = () => { read(); applyPrefs(); };
}

function applyPrefs() {
  state.cats.clear(); profile.cats.forEach(c => state.cats.add(c));
  const m = state.moods.find(x => x.name === profile.mood);
  state.moodIds.clear(); if (m) state.moodIds.add(m.id);
  document.querySelectorAll('#cats button').forEach(b => b.setAttribute('aria-pressed', state.cats.has(b.dataset.v)));
  document.querySelectorAll('#moods button').forEach(b => b.setAttribute('aria-pressed', state.moodIds.has(+b.dataset.v)));
  document.querySelector('#tabs button').click(); render(true);
}

function renderAbout() {
  const legend = Object.values(LEVELS).map(v =>
    `<li class="legend"><span class="dot" style="background:${v.color}"></span>${esc(v.label)}</li>`).join('');
  $('tab-about').innerHTML = `
    <div class="about-hero">
      <h2>Find places that fit your mood</h2>
      <p>SocialMatch ranks spots around Cebu by how well their noise, crowd, and social energy match how you feel right now.</p>
    </div>

    <h2>How it works</h2>
    <ol class="steps">
      <li><b>1</b><div>Pick one or more <em>moods</em> on the Explore tab.</div></li>
      <li><b>2</b><div>Every place gets a <em>match score</em> from 0 to 100%. Higher means a closer fit.</div></li>
      <li><b>3</b><div>Tap a result or a marker to see details, read reviews, or get directions.</div></li>
      <li><b>4</b><div>Use <em>Pin a spot</em> to explore matches around any point on the map.</div></li>
    </ol>

    <h2>How the score is calculated</h2>
    <div class="weights">
      <div><span>Social level</span><i style="width:40%"></i><b>40%</b></div>
      <div><span>Noise</span><i style="width:30%"></i><b>30%</b></div>
      <div><span>Crowd</span><i style="width:30%"></i><b>30%</b></div>
    </div>
    <p class="meta">With several moods selected, each place shows its best match across them.</p>

    <h2>Map colors</h2>
    <ul class="legend-list">${legend}</ul>
    <p class="meta">Bigger markers mean a better match. ★ markers are upcoming events.</p>

    <h2>Credits</h2>
    <p class="meta">Map data © OpenStreetMap contributors · Leaflet · OSRM routing · Supabase. Friends and moods shown in the Friends tab are demo data.</p>`;
}

function initSocial() {
  $('tabs').onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    document.querySelectorAll('#tabs button').forEach(x => x.setAttribute('aria-pressed', x === b));
    ['explore', 'friends', 'profile', 'about'].forEach(t => $('tab-' + t).hidden = t !== b.dataset.t);
  };
  renderFriends(); renderProfile(); renderAbout();
  $('revPost').onclick = postReview; $('revClose').onclick = () => $('revDlg').close();
}

map.on('popupopen', e => {
  const b = e.popup.getElement()?.querySelector('.revbtn');
  if (b) b.onclick = () => openReviews(+b.dataset.pid);
});