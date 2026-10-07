// Pin your own spot: tap the map to explore matches around any point.
let spot = null, spotMarker = null, spotCircle = null, pinning = false;
const refPos = () => spot || userPos; // pinned spot first, else your real location

function updateCircle() {
  spotCircle.setLatLng(spot).setRadius(+$('spotRadius').value * 1000);
}

function setSpot(latlng) {
  spot = [latlng.lat, latlng.lng];
  if (!spotMarker) {
    const icon = L.divIcon({ className: '', html: '<div class="spotpin">📍</div>', iconSize: [28, 28], iconAnchor: [14, 26] });
    spotMarker = L.marker(spot, { icon, draggable: true, zIndexOffset: 1000 })
      .addTo(map).bindTooltip('Your spot (drag to move)');
    spotMarker.on('dragend', e => setSpot(e.target.getLatLng()));
    spotCircle = L.circle(spot, { radius: 1000, color: '#1d6f8c', weight: 2, fillOpacity: .08, interactive: false }).addTo(map);
  } else {
    spotMarker.setLatLng(spot);
  }
  updateCircle();
  $('spotInfo').hidden = false;
  render(true);
}

function clearSpot() {
  spot = null; pinning = false;
  map.getContainer().style.cursor = '';
  if (spotMarker) { map.removeLayer(spotMarker); map.removeLayer(spotCircle); spotMarker = spotCircle = null; }
  $('spotInfo').hidden = true;
  $('status').textContent = '';
  render(true);
}

function initSpot() {
  $('pinBtn').onclick = () => {
    pinning = true;
    map.getContainer().style.cursor = 'crosshair';
    $('status').textContent = 'Tap the map to drop your spot';
  };
  map.on('click', e => {
    if (!pinning) return;
    pinning = false;
    map.getContainer().style.cursor = '';
    $('status').textContent = '';
    setSpot(e.latlng);
    map.fitBounds(spotCircle.getBounds(), { padding: [30, 30] });
    // show the recommended places right away
    document.querySelector('#tabs button[data-t=explore]').click();
    $('resHead').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && pinning) { pinning = false; map.getContainer().style.cursor = ''; $('status').textContent = ''; }
  });
  $('spotRadius').onchange = () => {
    if (!spot) return;
    updateCircle(); render(true);
    map.fitBounds(spotCircle.getBounds(), { padding: [30, 30] });
  };
  $('spotClear').onclick = clearSpot;
}