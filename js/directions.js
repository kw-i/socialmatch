// Directions: browser geolocation + OSRM public routing (free, no API key, driving only).
let userPos = null, userMarker = null, routeLine = null;

function locate() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Your browser does not support location.'));
    navigator.geolocation.getCurrentPosition(pos => {
      userPos = [pos.coords.latitude, pos.coords.longitude];
      if (userMarker) userMarker.setLatLng(userPos);
      else userMarker = L.circleMarker(userPos, { radius: 7, color: '#fff', weight: 3, fillColor: '#1d6f8c', fillOpacity: 1 })
        .addTo(map).bindTooltip('You are here');
      resolve(userPos);
    }, () => reject(new Error('Location blocked. Allow location access for this site and try again.')),
    { enableHighAccuracy: true, timeout: 10000 });
  });
}

async function showRoute(lat, lng, name) {
  const status = document.getElementById('status');
  status.textContent = 'Finding your location…';
  try {
    await locate();
    const url = `https://router.project-osrm.org/route/v1/driving/${userPos[1]},${userPos[0]};${lng},${lat}?overview=full&geometries=geojson&steps=true`;
    const data = await (await fetch(url)).json();
    if (data.code !== 'Ok') throw new Error('No route found to this place.');
    const r = data.routes[0];
    if (routeLine) map.removeLayer(routeLine);
    routeLine = L.geoJSON(r.geometry, { style: { color: '#1d6f8c', weight: 5 } }).addTo(map);
    map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });

    document.getElementById('rName').textContent = name;
    document.getElementById('rSum').textContent = `${(r.distance / 1000).toFixed(1)} km · about ${Math.round(r.duration / 60)} min by car`;
    document.getElementById('rGoogle').href =
      `https://www.google.com/maps/dir/?api=1&origin=${userPos[0]},${userPos[1]}&destination=${lat},${lng}`;
    document.getElementById('rSteps').innerHTML = r.legs[0].steps.filter(s => s.distance > 0).map(s =>
      `<li>${esc([s.maneuver.type, s.maneuver.modifier].filter(Boolean).join(' '))}${s.name ? ' on ' + esc(s.name) : ''} (${Math.round(s.distance)} m)</li>`).join('');
    const box = document.getElementById('route');
    box.hidden = false; box.scrollIntoView({ behavior: 'smooth' });
    status.textContent = '';
    render(); // refresh distances in the list
  } catch (err) {
    status.textContent = err.message;
  }
}

function clearRoute() {
  if (routeLine) map.removeLayer(routeLine);
  routeLine = null;
  document.getElementById('route').hidden = true;
}
