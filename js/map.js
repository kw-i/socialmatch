const map = L.map('map').setView(MAP_CENTER, 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19, attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
const layer = L.markerClusterGroup({ maxClusterRadius: 45, showCoverageOnHover: false }).addTo(map);
const reviewStats = {}; // place_id -> {n, avg}, filled by social.js

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function dirButton(lat, lng, name) {
  return `<br><button class="dirbtn" data-lat="${lat}" data-lng="${lng}" data-name="${esc(name)}">Get directions</button>`;
}

function addPlaceMarker(p, score) {
  const lv = LEVELS[p.social_level];
  const m = L.circleMarker([p.lat, p.lng], {
    radius: 8 + (score ?? 50) / 20, color: '#fff', weight: 2, fillColor: lv.color, fillOpacity: .9
  }).bindPopup(`<b>${esc(p.name)}</b><br>${esc(p.category)} · ${lv.label}<br>
    Noise ${p.noise_level}/5 · Crowd ${p.crowd_level}/5<br>
    ${score == null ? '' : `Match: <b>${score}%</b><br>`}${esc(p.description)}${ratingLine(p)}${dirButton(p.lat, p.lng, p.name)} <button class="dirbtn revbtn" data-pid="${p.id}">Reviews</button>`);
  m.addTo(layer);
  return m;
}

function addEventMarker(ev) {
  const icon = L.divIcon({ className: '', html: '<div class="evmark">★</div>', iconSize: [22, 22] });
  const m = L.marker([ev.lat, ev.lng], { icon }).bindPopup(
    `<b>${esc(ev.title)}</b><br>${new Date(ev.event_date).toLocaleString()}<br>
     ${esc(ev.category)} · ${LEVELS[ev.social_level].label}<br>${esc(ev.description)}${dirButton(ev.lat, ev.lng, ev.title)}`);
  m.addTo(layer);
  return m;
}

function ratingLine(p) {
  const s = reviewStats[p.id];
  return s ? `<br>★ ${s.avg.toFixed(1)} (${s.n} review${s.n > 1 ? 's' : ''})` : '';
}

// After a filter change, open the details popup on visible markers within 2 km (your location, else map center), nearest 6.
let nearPopups = [];
function showNearbyPopups(items) {
  nearPopups.forEach(p => map.removeLayer(p)); nearPopups = [];
  const ref = userPos || [map.getCenter().lat, map.getCenter().lng];
  items.map(p => ({ p, d: haversine(ref[0], ref[1], p.lat, p.lng) }))
    .filter(x => x.d <= 2).sort((a, b) => a.d - b.d).slice(0, 6).forEach(({ p }) => {
      const m = markers.get('p' + p.id);
      if (!m) return;
      // Full place-details popup (same content as clicking the marker)
      nearPopups.push(L.popup({ autoClose: false, closeOnClick: false, offset: [0, -6], maxWidth: 220 })
        .setLatLng([p.lat, p.lng]).setContent(m.getPopup().getContent()).addTo(map));
    });
}
