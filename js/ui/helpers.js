// Small helpers shared by every UI file.

const byId = id => document.getElementById(id);

// Escape text before putting it into innerHTML (prevents HTML injection).
function escapeHtml(text) {
  return String(text ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
}

// 0.25 -> "250 m", 1.5 -> "1.5 km"
function formatDistance(km) {
  return km < 1 ? Math.round(km * 1000) + ' m' : km.toFixed(1) + ' km';
}

// Show a short message in the corner of the screen for a few seconds.
let statusTimer;
function showStatus(message, seconds = 4) {
  const box = byId('status');
  box.textContent = message;
  clearTimeout(statusTimer);
  if (message && seconds) {
    statusTimer = setTimeout(() => { box.textContent = ''; }, seconds * 1000);
  }
}

// Avatar helpers: initials plus a color picked from the name.
function getInitials(name) {
  return name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
}

function getNameHue(name) {
  return [...name].reduce((sum, character) => sum + character.charCodeAt(0), 0) % 360;
}

function avatarHtml(name, extraClass = '') {
  return `<span class="avatar ${extraClass}" style="background:hsl(${getNameHue(name)} 55% 40%)">${escapeHtml(getInitials(name))}</span>`;
}
