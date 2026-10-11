// Geofencing: every place has a circular zone colored by its interaction level.
// With live tracking on, the app tells you which zone (color) you are standing in.
const ZONE_DEFAULT_M = 150;
const zoneLayer = L.layerGroup().addTo(map);
const zoneCircles = new Map();      // place id -> L.circle
let watchId = null, insideIds = new Set(), geoReady = false;
const refPos = () => userPos;       // your real location (null until tracking/directions)

const zoneRadius = p => p.geofence_m || ZONE_DEFAULT_M;
const distM = p => userPos ? haversine(userPos[0], userPos[1], p.lat, p.lng) * 1000 : Infinity;
const zonesAround = () => state.places.filter(p => distM(p) <= zoneRadius(p))
  .sort((a, b) => distM(a) / zoneRadius(a) - distM(b) / zoneRadius(b)); // deepest inside first

function drawZones(places) {
  zoneLayer.clearLayers(); zoneCircles.clear();
  if (!$('fZones').checked) return;
  places.forEach(p => {
    const c = LEVELS[p.social_level].color, on = insideIds.has(p.id);
    const z = L.circle([p.lat, p.lng], {
      radius: zoneRadius(p), color: c, weight: on ? 3 : 1.5, opacity: .9,
      fillColor: c, fillOpacity: on ? .38 : .16, interactive: false
    }).addTo(zoneLayer);
    zoneCircles.set(p.id, z);
  });
}

function styleZones() {
  zoneCircles.forEach((z, id) => {
    const on = insideIds.has(id);
    z.setStyle({ weight: on ? 3 : 1.5, fillOpacity: on ? .38 : .16 });
  });
}

function zoneChip(p) {
  const lv = LEVELS[p.social_level];
  return `<span class="zonechip" style="--c:${lv.color}"></span><b>${esc(lv.label)}</b>`;
}

function updateZonePanel(inside, acc) {
  const box = $('zoneInfo'); box.hidden = false;
  const accTxt = acc ? ` <span class="meta">GPS accuracy ±${Math.round(acc)} m</span>` : '';
  if (inside.length) {
    const p = inside[0], rest = inside.slice(1);
    box.style.setProperty('--c', LEVELS[p.social_level].color);
    box.innerHTML = `<span class="meta">You are inside</span>
      <div class="zonename">${esc(p.name)}</div>
      <div>${zoneChip(p)} zone · ${esc(p.category)}</div>
      ${rest.length ? `<span class="meta">Also overlapping: ${rest.map(r => esc(r.name)).join(', ')}</span>` : ''}${accTxt}`;
  } else {
    const near = [...state.places].sort((a, b) => distM(a) - distM(b))[0];
    box.style.setProperty('--c', 'var(--line)');
    box.innerHTML = `<span class="meta">Outside all zones</span>
      ${near ? `<div>Nearest: <b>${esc(near.name)}</b> ${zoneChip(near)}</div>
      <span class="meta">${fmtDist(Math.max(0, distM(near) - zoneRadius(near)) / 1000)} to its edge</span>` : ''}${accTxt}`;
  }
}

let toastTimer;
function toast(msg) {
  $('status').textContent = msg;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => $('status').textContent = '', 4000);
}

// Called whenever userPos changes (watchPosition or the directions button).
function checkGeofence(acc) {
  if (!userPos) return;
  const inside = zonesAround(), ids = new Set(inside.map(p => p.id));
  const entered = inside.filter(p => !insideIds.has(p.id));
  const left = state.places.filter(p => insideIds.has(p.id) && !ids.has(p.id));
  const changed = entered.length || left.length || !geoReady;
  insideIds = ids;
  if (entered.length) toast(`Entered ${entered[0].name} · ${LEVELS[entered[0].social_level].label} zone`);
  else if (left.length) toast(`Left ${left[0].name}`);
  styleZones(); updateZonePanel(inside, acc);
  if (changed) { geoReady = true; render(); }   // refresh list distances only on enter/exit
}

function setUserPos(coords) {
  userPos = [coords.latitude, coords.longitude];
  if (userMarker) userMarker.setLatLng(userPos);
  else userMarker = L.circleMarker(userPos, { radius: 7, color: '#fff', weight: 3, fillColor: '#1d6f8c', fillOpacity: 1 })
    .addTo(map).bindTooltip('You are here');
}

function startTracking() {
  if (!navigator.geolocation) { toast('Your browser does not support location.'); return; }
  let first = true;
  $('trackBtn').textContent = '⏹ Stop live geofencing';
  $('trackBtn').setAttribute('aria-pressed', 'true');
  toast('Finding your location…');
  watchId = navigator.geolocation.watchPosition(pos => {
    setUserPos(pos.coords); checkGeofence(pos.coords.accuracy);
    if (first) { first = false; map.flyTo(userPos, Math.max(map.getZoom(), 15)); }
  }, () => { toast('Location blocked. Allow location access for this site and try again.'); stopTracking(); },
  { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });
}

function stopTracking() {
  if (watchId != null) navigator.geolocation.clearWatch(watchId);
  watchId = null; insideIds = new Set(); geoReady = false;
  $('trackBtn').textContent = '📡 Start live geofencing';
  $('trackBtn').setAttribute('aria-pressed', 'false');
  $('zoneInfo').hidden = true; styleZones();
}

function initGeofence() {
  $('trackBtn').onclick = () => watchId == null ? startTracking() : stopTracking();
  $('fZones').onchange = () => render();
}
