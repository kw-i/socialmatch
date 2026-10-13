// Right-hand panel: Friends and Profile.
// On a computer it is a sidebar on the right. On a phone it becomes a full-screen
// sheet that opens from the bottom navigation bar (see css/social-panel.css).

const DEFAULT_PROFILE = {
  displayName: 'Juan Dela Cruz',
  handle: '@juan.d',
  bio: 'Coffee, quiet parks and the occasional night out.',
  usualMood: 'Chill',
  favoriteCategories: [],
  shareMood: true
};

let myProfile = { ...DEFAULT_PROFILE };
let friendsShownOnMap = false;

// ---------- Loading the saved profile ----------

async function loadProfileFromDatabase() {
  try {
    const row = await loadMyProfile();
    if (!row) return;  // first visit: keep the defaults
    myProfile = {
      displayName: row.display_name,
      handle: row.handle || DEFAULT_PROFILE.handle,
      bio: row.bio || '',
      usualMood: row.usual_mood,
      favoriteCategories: row.favorite_categories || [],
      shareMood: row.share_mood
    };
  } catch (error) {
    showStatus('Profile unavailable (run sql/schema.sql): ' + error.message);
  }
}

// ---------- Friends view ----------

function renderFriends() {
  const cards = appState.friends.map(friend => {
    const place = appState.places.find(p => p.id === friend.place_id);
    const mood = appState.moods.find(m => m.name === friend.mood);
    const level = place ? INTERACTION_LEVELS[place.social_level] : null;
    return `
      <li class="friend-card">
        ${avatarHtml(friend.name, 'big')}
        <div class="friend-body">
          <div class="friend-top"><b>${escapeHtml(friend.name)}</b>
            <span class="mood-pill">${escapeHtml(mood ? mood.emoji : '')} ${escapeHtml(friend.mood || '')}</span></div>
          <span class="meta">${escapeHtml(friend.handle)}</span>
          <p class="friend-status">“${escapeHtml(friend.status_text || '')}”</p>
          ${place ? `<button class="place-chip" data-place-id="${place.id}" style="--color:${level.color}">
            📍 ${escapeHtml(place.name)}</button>` : ''}
        </div>
      </li>`;
  }).join('');

  byId('friendsView').innerHTML = `
    <p class="side-intro">${appState.friends.length} friends · tap a place to find them on the map.</p>
    <label class="switch"><input id="showFriendsOnMap" type="checkbox" ${friendsShownOnMap ? 'checked' : ''}>
      Show friends on the map</label>
    <ul class="friend-list">${cards || '<li class="empty">No friends yet.</li>'}</ul>`;

  byId('showFriendsOnMap').onchange = event => {
    friendsShownOnMap = event.target.checked;
    if (friendsShownOnMap) showFriendsOnMap(appState.friends, appState.places);
    else hideFriendsOnMap();
    if (friendsShownOnMap) closeSideSheet(); // on a phone, show the map right away
  };
  byId('friendsView').querySelector('.friend-list').onclick = event => {
    const chip = event.target.closest('.place-chip');
    if (!chip) return;
    closeSideSheet();
    focusPlace(+chip.dataset.placeId);
  };
}

// ---------- Profile view ----------

function renderProfile() {
  const mood = appState.moods.find(m => m.name === myProfile.usualMood);
  const categories = [...new Set(appState.places.map(place => place.category))].sort();

  byId('profileView').innerHTML = `
    <div class="profile-hero">
      ${avatarHtml(myProfile.displayName, 'huge')}
      <h3>${escapeHtml(myProfile.displayName)}</h3>
      <span class="meta">${escapeHtml(myProfile.handle)}</span>
      <span class="mood-pill">${escapeHtml(mood ? mood.emoji : '')} ${escapeHtml(myProfile.usualMood || '')}</span>
      <p>${escapeHtml(myProfile.bio)}</p>
    </div>

    <label class="field">Display name
      <input id="profileName" value="${escapeHtml(myProfile.displayName)}" maxlength="30"></label>
    <label class="field">Handle
      <input id="profileHandle" value="${escapeHtml(myProfile.handle)}" maxlength="20"></label>
    <label class="field">Bio
      <textarea id="profileBio" rows="2" maxlength="120">${escapeHtml(myProfile.bio)}</textarea></label>
    <label class="field">Usual mood
      <select id="profileMood">${appState.moods.map(m =>
        `<option ${m.name === myProfile.usualMood ? 'selected' : ''}>${escapeHtml(m.name)}</option>`).join('')}</select></label>

    <h4>Preferred places</h4>
    <div id="profileCategories" class="chips">${categories.map(category =>
      `<button data-value="${escapeHtml(category)}" aria-pressed="${myProfile.favoriteCategories.includes(category)}">${escapeHtml(category)}</button>`).join('')}</div>

    <label class="switch"><input id="profileShare" type="checkbox" ${myProfile.shareMood ? 'checked' : ''}>
      Share my mood with friends</label>

    <div class="profile-actions">
      <button id="profileSave" class="primary-btn">Save profile</button>
      <button id="profileApply" class="ghost-btn">Apply to map</button>
    </div>`;

  byId('profileCategories').onclick = event => {
    const button = event.target.closest('button');
    if (button) button.setAttribute('aria-pressed', button.getAttribute('aria-pressed') !== 'true');
  };
  byId('profileSave').onclick = saveProfileFromForm;
  byId('profileApply').onclick = async () => { readProfileForm(); applyProfileToMap(); };
}

// Copy what is typed in the form into myProfile.
function readProfileForm() {
  myProfile = {
    displayName: byId('profileName').value.trim() || myProfile.displayName,
    handle: byId('profileHandle').value.trim() || myProfile.handle,
    bio: byId('profileBio').value,
    usualMood: byId('profileMood').value,
    favoriteCategories: [...document.querySelectorAll('#profileCategories button[aria-pressed=true]')]
      .map(button => button.dataset.value),
    shareMood: byId('profileShare').checked
  };
}

async function saveProfileFromForm() {
  readProfileForm();
  try {
    await saveMyProfile(myProfile);   // INSERT or UPDATE the row in the profiles table
    showStatus('Profile saved');
  } catch (error) {
    showStatus('Could not save profile (run sql/schema.sql): ' + error.message);
  }
  renderProfile();
}

// Turn the profile's mood and preferred places into map filters.
function applyProfileToMap() {
  appState.selectedCategories.clear();
  myProfile.favoriteCategories.forEach(category => appState.selectedCategories.add(category));

  appState.selectedMoodIds.clear();
  const mood = appState.moods.find(m => m.name === myProfile.usualMood);
  if (mood) appState.selectedMoodIds.add(mood.id);

  document.querySelectorAll('#categoryButtons button').forEach(button =>
    button.setAttribute('aria-pressed', appState.selectedCategories.has(button.dataset.value)));
  document.querySelectorAll('#moodButtons button').forEach(button =>
    button.setAttribute('aria-pressed', appState.selectedMoodIds.has(+button.dataset.value)));

  closeSideSheet();
  renderExplore(true);
  showStatus('Your preferences are applied to the map.');
}

// ---------- Tabs and the phone sheet ----------

function showSideTab(tabName) {
  byId('friendsView').hidden = tabName !== 'friends';
  byId('profileView').hidden = tabName !== 'profile';
  document.querySelectorAll('#sideTabs button').forEach(button =>
    button.setAttribute('aria-pressed', button.dataset.sideTab === tabName));
  document.querySelectorAll('#dock button').forEach(button =>
    button.setAttribute('aria-pressed', button.dataset.dock === tabName));
}

function openSideSheet(tabName) {
  showSideTab(tabName);
  document.body.classList.add('side-open');
}

function closeSideSheet() {
  document.body.classList.remove('side-open');
  document.querySelectorAll('#dock button').forEach(button =>
    button.setAttribute('aria-pressed', button.dataset.dock === 'explore'));
}

function initSocialPanel() {
  renderFriends();
  renderProfile();
  showSideTab('friends');
  closeSideSheet();

  byId('sideTabs').onclick = event => {
    const button = event.target.closest('button');
    if (button) showSideTab(button.dataset.sideTab);
  };
  byId('sideClose').onclick = closeSideSheet;
  byId('dock').onclick = event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.dock === 'explore') closeSideSheet();
    else openSideSheet(button.dataset.dock);
  };
}
