// Your location + driving directions.
// Location comes from the browser's geolocation; the route comes from the
// free public OSRM routing service (no API key needed).
let userLocation = null;      // [lat, lng] or null until you share your location
let userMarker = null;
let routeLine = null;

// Ask the browser for your position, drop a blue dot, and remember it.
function locateUser() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Your browser does not support location.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(position => {
      userLocation = [position.coords.latitude, position.coords.longitude];

      if (userMarker) {
        userMarker.setLatLng(userLocation);
      } else {
        userMarker = L.circleMarker(userLocation, {
          radius: 7, color: '#ffffff', weight: 3, fillColor: '#1d6f8c', fillOpacity: 1
        }).addTo(map).bindTooltip('You are here');
      }
      resolve(userLocation);
    }, () => reject(new Error('Location blocked. Allow location access for this site and try again.')),
    { enableHighAccuracy: true, timeout: 10000 });
  });
}

function googleMapsLink(toLat, toLng) {
  return `https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${toLat},${toLng}`;
}

async function showRoute(toLat, toLng, name) {
  showStatus('Finding your location…', 0);
  try {
    await locateUser();

    const url = `https://router.project-osrm.org/route/v1/driving/` +
      `${userLocation[1]},${userLocation[0]};${toLng},${toLat}?overview=full&geometries=geojson&steps=true`;
    const data = await (await fetch(url)).json();
    if (data.code !== 'Ok') throw new Error('No route found to this place.');

    const route = data.routes[0];
    if (routeLine) map.removeLayer(routeLine);
    routeLine = L.geoJSON(route.geometry, { style: { color: '#1d6f8c', weight: 5 } }).addTo(map);
    map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });

    byId('routeName').textContent = name;
    byId('routeSummary').textContent =
      `${(route.distance / 1000).toFixed(1)} km · about ${Math.round(route.duration / 60)} min by car`;
    byId('routeGoogleLink').href = googleMapsLink(toLat, toLng);
    byId('routeSteps').innerHTML = route.legs[0].steps
      .filter(step => step.distance > 0)
      .map(step => {
        const action = [step.maneuver.type, step.maneuver.modifier].filter(Boolean).join(' ');
        return `<li>${escapeHtml(action)}${step.name ? ' on ' + escapeHtml(step.name) : ''} (${Math.round(step.distance)} m)</li>`;
      }).join('');

    byId('routeBox').hidden = false;
    byId('routeBox').scrollIntoView({ behavior: 'smooth' });
    showStatus('');
    renderExplore(); // distances in the list are now available
  } catch (error) {
    showStatus(error.message);
    if (userLocation) {
      // Routing failed but we know where you are, so keep the Google Maps link usable.
      byId('routeName').textContent = name;
      byId('routeSummary').textContent = 'Route preview unavailable right now.';
      byId('routeSteps').innerHTML = '';
      byId('routeGoogleLink').href = googleMapsLink(toLat, toLng);
      byId('routeBox').hidden = false;
    }
  }
}

function clearRoute() {
  if (routeLine) map.removeLayer(routeLine);
  routeLine = null;
  byId('routeBox').hidden = true;
}
