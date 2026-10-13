// The Leaflet map and its marker layers.
const map = L.map('map').setView(MAP_CENTER, MAP_START_ZOOM);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// One cluster group per interaction color, so only places of the SAME color
// merge into a numbered bubble (a Solo place never joins a Highly interactive one).
const levelLayers = {};
for (const [level, info] of Object.entries(INTERACTION_LEVELS)) {
  levelLayers[level] = L.markerClusterGroup({
    maxClusterRadius: 45,
    showCoverageOnHover: false,
    iconCreateFunction: cluster => L.divIcon({
      className: '',
      iconSize: [38, 38],
      html: `<div class="cluster-bubble" style="--color:${info.color}">${cluster.getChildCount()}</div>`
    })
  }).addTo(map);
}

// Friends' avatars are not clustered, so they live in a plain layer group.
const friendLayer = L.layerGroup().addTo(map);

function clearPlaceMarkers() {
  Object.values(levelLayers).forEach(layer => layer.clearLayers());
}

// Zoom in until the marker is visible (leaving its cluster), then open its popup.
function showMarkerPopup(marker) {
  const layer = levelLayers[marker.options.level];
  map.setView(marker.getLatLng(), 16, { animate: false });
  layer.zoomToShowLayer(marker, () => marker.openPopup());
}
