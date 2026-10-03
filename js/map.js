const map = L.map('map').setView(MAP_CENTER, 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19, attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
const layer = L.layerGroup().addTo(map);

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function addPlaceMarker(p, score) {
  const lv = LEVELS[p.social_level];
  const m = L.circleMarker([p.lat, p.lng], {
    radius: 8 + score / 20, color: '#fff', weight: 2, fillColor: lv.color, fillOpacity: .9
  }).bindPopup(`<b>${esc(p.name)}</b><br>${esc(p.category)} · ${lv.label}<br>
    Noise ${p.noise_level}/5 · Crowd ${p.crowd_level}/5<br>Match: <b>${score}%</b><br>${esc(p.description)}`);
  m.addTo(layer);
  return m;
}

function addEventMarker(ev) {
  const icon = L.divIcon({ className: '', html: '<div class="evmark">★</div>', iconSize: [22, 22] });
  const m = L.marker([ev.lat, ev.lng], { icon }).bindPopup(
    `<b>${esc(ev.title)}</b><br>${new Date(ev.event_date).toLocaleString()}<br>
     ${esc(ev.category)} · ${LEVELS[ev.social_level].label}<br>${esc(ev.description)}`);
  m.addTo(layer);
  return m;
}
